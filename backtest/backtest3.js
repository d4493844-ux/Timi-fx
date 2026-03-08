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
function calcATR(candles, period = 14) {
  if (candles.length < period) return 0;
  const trs = candles.slice(-period).map((c, i, arr) => {
    const high = parseFloat(c.high), low = parseFloat(c.low), close = parseFloat(c.close);
    const prevClose = i > 0 ? parseFloat(arr[i-1].close) : close;
    return Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
  });
  return trs.reduce((a, b) => a + b, 0) / period;
}
function calcBB(prices, period = 20) {
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean, std };
}

// ── SMARTER STRATEGY: Multi-timeframe + momentum + key levels ──
function getSmartSignal(candles1m, candles5m) {
  if (!candles1m || candles1m.length < 100) return { action: "HOLD", confidence: 0 };
  
  const closes1m = candles1m.map(c => parseFloat(c.close));
  const closes5m = candles5m ? candles5m.map(c => parseFloat(c.close)) : [];
  const price = closes1m[closes1m.length - 1];
  const prev = closes1m[closes1m.length - 2];

  // ── Timeframe 1: 5M trend direction (higher TF) ──
  let trend5m = 0; // 1=bull, -1=bear, 0=unclear
  if (closes5m.length >= 50) {
    const ema20_5m = calcEMA(closes5m, 20);
    const ema50_5m = calcEMA(closes5m, 50);
    const rsi5m = calcRSI(closes5m);
    if (ema20_5m > ema50_5m && rsi5m > 50) trend5m = 1;
    else if (ema20_5m < ema50_5m && rsi5m < 50) trend5m = -1;
  }
  if (trend5m === 0) return { action: "HOLD", confidence: 0, reason: "5M unclear" };

  // ── Timeframe 2: 1M momentum (lower TF entry) ──
  const ema8  = calcEMA(closes1m, 8);
  const ema21 = calcEMA(closes1m, 21);
  const rsi1m = calcRSI(closes1m);
  const bb    = calcBB(closes1m);
  const atr   = calcATR(candles1m);

  // Momentum must agree with 5M trend
  const momentumBull = ema8 > ema21 && price > ema8;
  const momentumBear = ema8 < ema21 && price < ema8;
  if (trend5m === 1 && !momentumBull) return { action: "HOLD", confidence: 0, reason: "1M momentum not bull" };
  if (trend5m === -1 && !momentumBear) return { action: "HOLD", confidence: 0, reason: "1M momentum not bear" };

  // ── RSI confirmation ──
  if (trend5m === 1 && (rsi1m > 65 || rsi1m < 40)) return { action: "HOLD", confidence: 0, reason: "RSI not in buy zone" };
  if (trend5m === -1 && (rsi1m < 35 || rsi1m > 60)) return { action: "HOLD", confidence: 0, reason: "RSI not in sell zone" };

  // ── Key level entry: price near EMA21 (pullback entry) ──
  const distFromEma21 = Math.abs(price - ema21) / ema21;
  const nearEma21 = distFromEma21 < 0.002; // within 0.2% of EMA21

  // ── BB squeeze: low volatility before big move ──
  const bbWidth = (bb.upper - bb.lower) / bb.mid;
  const bbSqueezing = bbWidth < 0.015;

  // ── Candle confirmation: price moving in trend direction ──
  const candleBull = price > prev;
  const candleBear = price < prev;
  if (trend5m === 1 && !candleBull) return { action: "HOLD", confidence: 0, reason: "Candle not confirming" };
  if (trend5m === -1 && !candleBear) return { action: "HOLD", confidence: 0, reason: "Candle not confirming" };

  // ── Score confidence ──
  let confidence = 60; // base
  if (nearEma21) confidence += 10; // pullback entry bonus
  if (bbSqueezing) confidence += 8; // squeeze breakout
  if (trend5m === 1 && rsi1m >= 45 && rsi1m <= 60) confidence += 7; // perfect RSI zone
  if (trend5m === -1 && rsi1m >= 40 && rsi1m <= 55) confidence += 7;
  if (atr > 0) {
    const normalizedATR = atr / price;
    if (normalizedATR > 0.0003 && normalizedATR < 0.002) confidence += 5; // good volatility
  }
  confidence = Math.min(confidence, 95);

  const action = trend5m === 1 ? "BUY" : "SELL";
  return { action, confidence, reason: `5M:${trend5m===1?"BULL":"BEAR"} RSI:${rsi1m.toFixed(0)} near21:${nearEma21}` };
}

async function smartBacktest(symbol) {
  console.log(`\n📊 Smart backtesting ${symbol}...`);
  const [c1m, c5m] = await Promise.all([
    fetchCandles(symbol, 60, 4999),
    fetchCandles(symbol, 300, 1000),
  ]);
  if (c1m.length < 200) { console.log(`❌ Not enough data`); return null; }
  console.log(`✅ Got ${c1m.length} x 1m candles, ${c5m.length} x 5m candles`);

  const closes1m = c1m.map(c => parseFloat(c.close));
  let wins = 0, losses = 0, totalPnl = 0, maxConsec = 0, consec = 0;

  for (let i = 100; i < c1m.length - 4; i++) {
    // Map 1m index to 5m index
    const t = parseInt(c1m[i].epoch);
    const i5m = c5m.findIndex(c => parseInt(c.epoch) >= t);
    const slice5m = i5m > 50 ? c5m.slice(0, i5m) : [];

    const sig = getSmartSignal(c1m.slice(0, i), slice5m);
    if (sig.action === "HOLD" || sig.confidence < 65) continue;

    const entry = closes1m[i];
    const future = closes1m[i + 4];
    const won = sig.action === "BUY" ? future > entry : future < entry;
    const pnl = won ? 0.95 : -1;
    totalPnl += pnl;

    if (won) { wins++; consec = 0; }
    else { losses++; consec++; maxConsec = Math.max(maxConsec, consec); }
  }

  const total = wins + losses;
  const winRate = total > 0 ? (wins / total * 100).toFixed(1) : 0;
  console.log(`   Trades: ${total} | WR: ${winRate}% | PnL: $${totalPnl.toFixed(2)} | Max consec loss: ${maxConsec}`);
  const verdict = parseFloat(winRate) >= 55 && total >= 30 ? "✅ DEPLOY" : "❌ SKIP";
  console.log(`   ${verdict}`);
  return { symbol, winRate: parseFloat(winRate), trades: total, pnl: totalPnl, maxConsec };
}

async function main() {
  console.log("🔬 SMART STRATEGY BACKTEST\n");
  const symbols = [
    "R_75","R_25","R_50","BOOM1000","CRASH1000",
    "frxEURUSD","frxGBPUSD","frxUSDJPY","frxGBPJPY",
    "cryBTCUSD","cryETHUSD","frxXAUUSD"
  ];
  const results = [];
  for (const sym of symbols) {
    const r = await smartBacktest(sym);
    if (r) results.push(r);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("\n══════════════════════════════════");
  console.log("📊 SMART STRATEGY RESULTS");
  console.log("══════════════════════════════════");
  results.sort((a, b) => b.winRate - a.winRate);
  const deploy = results.filter(r => r.winRate >= 55 && r.trades >= 30);
  deploy.forEach(r => console.log(`✅ ${r.symbol}: ${r.winRate}% | ${r.trades} trades | $${r.pnl.toFixed(2)}`));
  results.filter(r => !deploy.includes(r)).forEach(r => console.log(`❌ ${r.symbol}: ${r.winRate}% | ${r.trades} trades`));
  if (deploy.length > 0) {
    console.log(`\nSQL:`);
    console.log(`update bot_config set symbols = ARRAY[${deploy.map(r=>`'${r.symbol}'`).join(",")}] where active = true;`);
  }
}
main().catch(console.error);
