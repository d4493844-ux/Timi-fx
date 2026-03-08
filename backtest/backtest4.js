const WebSocket = require("ws");

async function fetchCandles(symbol, granularity, count) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 20000);
    ws.on("open", () => ws.send(JSON.stringify({ ticks_history: symbol, adjust_start_time: 1, count, end: "latest", granularity, style: "candles" })));
    ws.on("message", (data) => {
      const d = JSON.parse(data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error) { clearTimeout(timeout); ws.close(); resolve([]); }
    });
    ws.on("error", () => { clearTimeout(timeout); resolve([]); });
  });
}

function calcEMA(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
  return ema;
}
function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  let g = 0, l = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  return 100 - 100 / (1 + g / (l || 0.0001));
}
function calcBB(prices, period = 20) {
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean, std };
}

// ── PER-SYMBOL TUNED CONFIGS ──
const SYMBOL_CONFIG = {
  BOOM1000: {
    // BOOM always trends UP with random spikes
    // Strategy: only BUY on pullbacks to EMA, never SELL
    ema_fast: 8, ema_slow: 21, ema_trend: 50,
    rsi_buy_min: 35, rsi_buy_max: 60, // buy when RSI pulls back
    rsi_sell_min: 999, rsi_sell_max: 999, // never sell BOOM
    min_5m_ema_fast: 10, min_5m_ema_slow: 30,
    direction: "BUY_ONLY",
    trade_duration: 4,
    desc: "BUY only on RSI pullback to EMA"
  },
  CRASH1000: {
    // CRASH always trends DOWN with random crashes
    // Strategy: only SELL on rallies to EMA, never BUY
    ema_fast: 8, ema_slow: 21, ema_trend: 50,
    rsi_buy_min: 999, rsi_buy_max: 999, // never buy CRASH
    rsi_sell_min: 40, rsi_sell_max: 65, // sell when RSI rallies
    min_5m_ema_fast: 10, min_5m_ema_slow: 30,
    direction: "SELL_ONLY",
    trade_duration: 4,
    desc: "SELL only on RSI rally to EMA"
  },
  R_25: {
    // Low volatility - needs tight confirmation
    ema_fast: 9, ema_slow: 21, ema_trend: 50,
    rsi_buy_min: 40, rsi_buy_max: 58,
    rsi_sell_min: 42, rsi_sell_max: 60,
    min_5m_ema_fast: 9, min_5m_ema_slow: 21,
    direction: "BOTH",
    trade_duration: 5,
    desc: "Both directions, tight RSI bands"
  },
};

function getTunedSignal(candles1m, candles5m, symbol) {
  const cfg = SYMBOL_CONFIG[symbol];
  if (!cfg) return { action: "HOLD", confidence: 0 };
  if (!candles1m || candles1m.length < 100) return { action: "HOLD", confidence: 0 };

  const closes1m = candles1m.map(c => parseFloat(c.close));
  const closes5m = candles5m ? candles5m.map(c => parseFloat(c.close)) : [];
  const price = closes1m[closes1m.length - 1];
  const prev  = closes1m[closes1m.length - 2];

  // 5M trend
  let trend5m = 0;
  if (closes5m.length >= 50) {
    const ema_f = calcEMA(closes5m, cfg.min_5m_ema_fast);
    const ema_s = calcEMA(closes5m, cfg.min_5m_ema_slow);
    const rsi5m = calcRSI(closes5m);
    if (ema_f > ema_s && rsi5m > 48) trend5m = 1;
    else if (ema_f < ema_s && rsi5m < 52) trend5m = -1;
  }

  // BOOM only BUY, CRASH only SELL
  if (cfg.direction === "BUY_ONLY" && trend5m === -1) return { action: "HOLD", confidence: 0, reason: "BOOM: 5M bearish" };
  if (cfg.direction === "SELL_ONLY" && trend5m === 1) return { action: "HOLD", confidence: 0, reason: "CRASH: 5M bullish" };
  if (trend5m === 0) return { action: "HOLD", confidence: 0, reason: "5M unclear" };

  // 1M indicators
  const ema_fast  = calcEMA(closes1m, cfg.ema_fast);
  const ema_slow  = calcEMA(closes1m, cfg.ema_slow);
  const ema_trend = calcEMA(closes1m.slice(-Math.min(100, closes1m.length)), cfg.ema_trend);
  const rsi = calcRSI(closes1m);
  const bb  = calcBB(closes1m);

  // Price relative to EMAs
  const aboveFast  = price > ema_fast;
  const aboveSlow  = price > ema_slow;
  const aboveTrend = price > ema_trend;

  let action = "HOLD";
  let confidence = 0;
  let reasons = [];

  if (cfg.direction === "BUY_ONLY" || (cfg.direction === "BOTH" && trend5m === 1)) {
    // BUY conditions
    const emaBull = ema_fast > ema_slow && ema_slow > ema_trend;
    const rsiOk   = rsi >= cfg.rsi_buy_min && rsi <= cfg.rsi_buy_max;
    const pullback = price <= ema_fast * 1.001; // near or below fast EMA
    const candleOk = price > prev; // green candle
    const bbOk    = price < bb.mid || price < ema_slow; // below midline = good entry

    if (!emaBull) return { action: "HOLD", confidence: 0, reason: "EMA not bullish" };
    if (!rsiOk)   return { action: "HOLD", confidence: 0, reason: `RSI ${rsi.toFixed(0)} not in buy zone` };
    if (!candleOk) return { action: "HOLD", confidence: 0, reason: "Red candle" };

    action = "BUY";
    confidence = 60;
    if (pullback) { confidence += 12; reasons.push("pullback"); }
    if (bbOk)     { confidence += 8;  reasons.push("below mid"); }
    if (rsi < 50) { confidence += 7;  reasons.push("RSI dip"); }
    if (aboveTrend) { confidence += 5; reasons.push("above trend"); }
  }

  if (cfg.direction === "SELL_ONLY" || (cfg.direction === "BOTH" && trend5m === -1)) {
    // SELL conditions  
    const emaBear = ema_fast < ema_slow && ema_slow < ema_trend;
    const rsiOk   = rsi >= cfg.rsi_sell_min && rsi <= cfg.rsi_sell_max;
    const rally   = price >= ema_fast * 0.999; // near or above fast EMA
    const candleOk = price < prev; // red candle
    const bbOk    = price > bb.mid || price > ema_slow;

    if (!emaBear) return { action: "HOLD", confidence: 0, reason: "EMA not bearish" };
    if (!rsiOk)   return { action: "HOLD", confidence: 0, reason: `RSI ${rsi.toFixed(0)} not in sell zone` };
    if (!candleOk) return { action: "HOLD", confidence: 0, reason: "Green candle" };

    action = "SELL";
    confidence = 60;
    if (rally)    { confidence += 12; reasons.push("rally"); }
    if (bbOk)     { confidence += 8;  reasons.push("above mid"); }
    if (rsi > 50) { confidence += 7;  reasons.push("RSI high"); }
    if (!aboveTrend) { confidence += 5; reasons.push("below trend"); }
  }

  if (action === "HOLD") return { action: "HOLD", confidence: 0 };
  return { action, confidence: Math.min(confidence, 95), reasons };
}

async function tunedBacktest(symbol) {
  console.log(`\n📊 Tuned backtest: ${symbol} - "${SYMBOL_CONFIG[symbol]?.desc}"`);
  const [c1m, c5m] = await Promise.all([
    fetchCandles(symbol, 60, 4999),
    fetchCandles(symbol, 300, 1000),
  ]);
  if (c1m.length < 200) { console.log(`❌ Not enough data`); return null; }
  console.log(`✅ Got ${c1m.length} candles`);

  const closes1m = c1m.map(c => parseFloat(c.close));
  let wins = 0, losses = 0, totalPnl = 0, maxConsec = 0, consec = 0;
  let highConfW = 0, highConfL = 0;

  for (let i = 100; i < c1m.length - 4; i++) {
    const t = parseInt(c1m[i].epoch);
    const i5m = c5m.findIndex(c => parseInt(c.epoch) >= t);
    const slice5m = i5m > 50 ? c5m.slice(0, i5m) : [];

    const sig = getTunedSignal(c1m.slice(0, i), slice5m, symbol);
    if (sig.action === "HOLD" || sig.confidence < 65) continue;

    const entry = closes1m[i];
    const future4 = closes1m[i + 4];
    const won = sig.action === "BUY" ? future4 > entry : future4 < entry;
    const pnl = won ? 0.95 : -1;
    totalPnl += pnl;

    if (sig.confidence >= 75) { if (won) highConfW++; else highConfL++; }
    if (won) { wins++; consec = 0; }
    else { losses++; consec++; maxConsec = Math.max(maxConsec, consec); }
  }

  const total = wins + losses;
  const wr = total > 0 ? (wins/total*100).toFixed(1) : 0;
  const highConfWR = highConfW+highConfL > 0 ? (highConfW/(highConfW+highConfL)*100).toFixed(0) : 0;
  
  console.log(`   Trades: ${total} | WR: ${wr}% | PnL: $${totalPnl.toFixed(2)}`);
  console.log(`   High conf (75%+): ${highConfW}W/${highConfL}L = ${highConfWR}% win rate`);
  console.log(`   Max consec losses: ${maxConsec}`);
  
  const verdict = parseFloat(wr) >= 58 && total >= 30 ? "✅ CONFIRMED PROFITABLE" : "⚠️ MARGINAL";
  console.log(`   ${verdict}`);
  
  return { symbol, winRate: parseFloat(wr), trades: total, pnl: totalPnl, maxConsec, highConfWR: parseFloat(highConfWR) };
}

async function main() {
  console.log("🔬 PER-SYMBOL TUNED STRATEGY BACKTEST\n");
  const results = [];
  for (const sym of Object.keys(SYMBOL_CONFIG)) {
    const r = await tunedBacktest(sym);
    if (r) results.push(r);
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log("\n══════════════════════════════════════════");
  console.log("📊 TUNED STRATEGY FINAL RESULTS");
  console.log("══════════════════════════════════════════");
  results.sort((a, b) => b.winRate - a.winRate);
  results.forEach(r => {
    console.log(`${r.winRate >= 58 ? "✅" : "⚠️"} ${r.symbol}: ${r.winRate}% WR | ${r.trades} trades | $${r.pnl.toFixed(2)} PnL | high conf: ${r.highConfWR}%`);
  });
  
  console.log("\n📋 PER-SYMBOL CONFIG SUMMARY:");
  Object.entries(SYMBOL_CONFIG).forEach(([sym, cfg]) => {
    console.log(`   ${sym}: ${cfg.desc} | duration: ${cfg.trade_duration}min`);
  });
}
main().catch(console.error);
