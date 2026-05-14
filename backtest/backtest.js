const WebSocket = require("ws");

// ── Fetch historical candles from Deriv ──
async function fetchCandles(symbol, granularity, count) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 15000);
    ws.on("open", () => ws.send(JSON.stringify({
      ticks_history: symbol, adjust_start_time: 1,
      count, end: "latest", granularity, style: "candles"
    })));
    ws.on("message", (data) => {
      const d = JSON.parse(data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error)   { clearTimeout(timeout); ws.close(); resolve([]); }
    });
    ws.on("error", () => { clearTimeout(timeout); resolve([]); });
  });
}

// ── Technical indicators ──
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
  const slice = candles.slice(-period);
  const trs = slice.map((c, i) => {
    const pc = i > 0 ? parseFloat(slice[i-1].close) : parseFloat(c.close);
    return Math.max(
      parseFloat(c.high) - parseFloat(c.low),
      Math.abs(parseFloat(c.high) - pc),
      Math.abs(parseFloat(c.low)  - pc)
    );
  });
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}

// ── Signal engine — mirrors live bot logic ──
function getSignal(candles, candles5m = []) {
  if (candles.length < 50) return { action: "HOLD", confidence: 0 };
  const closes = candles.map(c => parseFloat(c.close));
  const price  = closes[closes.length - 1];

  const ema8   = calcEMA(closes, 8);
  const ema21  = calcEMA(closes, 21);
  const ema50  = calcEMA(closes.slice(-60), 50);
  const ema200 = calcEMA(closes, Math.min(200, closes.length));
  const rsi    = calcRSI(closes);
  const atr    = calcATR(candles);
  const atrPct = atr / price;

  // Skip ultra-high volatility (unfavorable for binary options)
  if (atrPct > 0.008) return { action: "HOLD", confidence: 0, reason: "high_vol" };

  // EMA stack
  const emaBull = ema8 > ema21 && ema21 > ema50;
  const emaBear = ema8 < ema21 && ema21 < ema50;
  if (!emaBull && !emaBear) return { action: "HOLD", confidence: 0, reason: "ema_unaligned" };

  // 200 EMA trend filter
  if (emaBull && price < ema200) return { action: "HOLD", confidence: 0, reason: "below_ema200" };
  if (emaBear && price > ema200) return { action: "HOLD", confidence: 0, reason: "above_ema200" };

  // RSI filter — avoid extremes, require momentum alignment
  if (rsi > 75 || rsi < 25) return { action: "HOLD", confidence: 0, reason: "rsi_extreme" };

  // 5m trend confirmation
  let trend5m = 0;
  if (candles5m.length >= 30) {
    const c5 = candles5m.map(c => parseFloat(c.close));
    const e20 = calcEMA(c5, 20), e50b = calcEMA(c5, 50), r5 = calcRSI(c5);
    trend5m = e20 > e50b && r5 > 50 ? 1 : e20 < e50b && r5 < 50 ? -1 : 0;
  }

  let bull = 0, bear = 0;
  if (emaBull)   bull += 3; else bear += 3;
  if (rsi < 50)  bull += 2; else bear += 2;
  if (trend5m === 1) bull += 3;
  else if (trend5m === -1) bear += 3;

  const net = bull - bear;
  if (Math.abs(net) < 4) return { action: "HOLD", confidence: 0, reason: "weak_signal" };

  const action     = net > 0 ? "BUY" : "SELL";
  const confidence = Math.min(Math.round(Math.abs(net) / 11 * 100), 95);
  return { action, confidence, atr, atrPct };
}

// ── Stats engine ──
function calcSharpe(returns, riskFreeRate = 0) {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std  = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length);
  if (std === 0) return 0;
  // Annualised: assume 1-min candles → 252*24*60 periods per year
  const annFactor = Math.sqrt(252 * 24 * 60 / returns.length);
  return ((mean - riskFreeRate) / std) * annFactor;
}

function calcMaxDrawdown(equityCurve) {
  let peak = equityCurve[0], maxDD = 0;
  for (const val of equityCurve) {
    if (val > peak) peak = val;
    const dd = (peak - val) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

function calcCalmar(totalReturn, maxDrawdown, numCandles, granularitySeconds) {
  if (maxDrawdown === 0) return totalReturn > 0 ? 99 : 0;
  const yearsElapsed = (numCandles * granularitySeconds) / (365 * 24 * 3600);
  const annReturn    = yearsElapsed > 0 ? totalReturn / yearsElapsed : totalReturn;
  return annReturn / maxDrawdown;
}

// ── Main backtester ──
async function backtest(symbol, granularity = 60, count = 1500, minConfidence = 60) {
  console.log(`\n📊 Backtesting ${symbol} (${count} candles, ${granularity}s)...`);
  const [candles, candles5m] = await Promise.all([
    fetchCandles(symbol, granularity, count),
    fetchCandles(symbol, 300, Math.floor(count / 5))
  ]);

  if (candles.length < 100) {
    console.log(`❌ Insufficient candles: ${candles.length}`);
    return null;
  }
  console.log(`✅ ${candles.length} candles fetched`);

  const SLIPPAGE  = 0.0001; // 0.01% realistic slippage per trade
  const PAYOUT    = 0.95;   // Deriv Rise/Fall payout
  const STAKE     = 1;      // $1 base stake

  let balance     = 100;    // start with $100
  const equity    = [balance];
  const tradeRets = [];     // per-trade return for Sharpe
  let wins = 0, losses = 0, holds = 0;
  let grossWin = 0, grossLoss = 0;
  let maxConsecLoss = 0, consecLoss = 0;

  const OUTCOME_WINDOW = 5; // check next 5 candles for outcome

  for (let i = 60; i < candles.length - OUTCOME_WINDOW; i++) {
    const slice   = candles.slice(0, i);
    const slice5m = candles5m.slice(0, Math.floor(i / 5));
    const sig     = getSignal(slice, slice5m);

    if (sig.action === "HOLD" || sig.confidence < minConfidence) {
      holds++;
      equity.push(balance);
      continue;
    }

    const entry = parseFloat(candles[i].close);

    // Walk forward: find first candle that closes beyond TP or SL
    // TP = 2× ATR from entry, SL = 1× ATR (2:1 RR — matches live fix)
    const atr     = sig.atr || entry * 0.002;
    const tp      = sig.action === "BUY"  ? entry + atr * 2 : entry - atr * 2;
    const sl      = sig.action === "BUY"  ? entry - atr     : entry + atr;
    const sEntry  = entry * (1 + (sig.action === "BUY" ? SLIPPAGE : -SLIPPAGE)); // slippage on entry

    let won = false, resolved = false;
    for (let j = i + 1; j <= i + OUTCOME_WINDOW; j++) {
      const h = parseFloat(candles[j].high);
      const l = parseFloat(candles[j].low);
      if (sig.action === "BUY") {
        if (l <= sl) { won = false; resolved = true; break; }
        if (h >= tp) { won = true;  resolved = true; break; }
      } else {
        if (h >= sl) { won = false; resolved = true; break; }
        if (l <= tp) { won = true;  resolved = true; break; }
      }
    }
    // If not resolved: use direction of final candle close
    if (!resolved) {
      const finalClose = parseFloat(candles[i + OUTCOME_WINDOW].close);
      won = sig.action === "BUY" ? finalClose > sEntry : finalClose < sEntry;
    }

    const pnl = won ? STAKE * PAYOUT : -STAKE;
    balance   = Math.max(0, balance + pnl);
    equity.push(balance);
    tradeRets.push(pnl / STAKE);

    if (won) {
      wins++; grossWin += STAKE * PAYOUT;
      consecLoss = 0;
    } else {
      losses++; grossLoss += STAKE;
      consecLoss++;
      if (consecLoss > maxConsecLoss) maxConsecLoss = consecLoss;
    }
  }

  const total      = wins + losses;
  if (total === 0) { console.log("❌ No trades generated"); return null; }

  const winRate    = wins / total;
  const totalPnl   = balance - 100;
  const roi        = totalPnl / 100;
  const sharpe     = calcSharpe(tradeRets);
  const maxDD      = calcMaxDrawdown(equity);
  const calmar     = calcCalmar(roi, maxDD, candles.length, granularity);
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0;
  const expectancy = (winRate * STAKE * PAYOUT) - ((1 - winRate) * STAKE);

  // Rating
  const grade = sharpe >= 1.5 && maxDD < 0.15 && winRate >= 0.55 ? "🟢 STRONG — deploy"
              : sharpe >= 0.8 && maxDD < 0.25 && winRate >= 0.50 ? "🟡 MODERATE — monitor"
              : "🔴 WEAK — do not deploy";

  console.log(`\n📈 ${symbol} Results:`);
  console.log(`   Trades: ${total} | Wins: ${wins} | Losses: ${losses} | Held: ${holds}`);
  console.log(`   Win Rate:        ${(winRate * 100).toFixed(1)}%`);
  console.log(`   Total PnL:       $${totalPnl.toFixed(2)} (${(roi*100).toFixed(1)}% ROI on $100)`);
  console.log(`   Sharpe Ratio:    ${sharpe.toFixed(2)}  (>1.5 = excellent)`);
  console.log(`   Max Drawdown:    ${(maxDD * 100).toFixed(1)}%  (<15% = safe)`);
  console.log(`   Calmar Ratio:    ${calmar.toFixed(2)}  (>1.0 = good)`);
  console.log(`   Profit Factor:   ${profitFactor.toFixed(2)}  (>1.5 = solid)`);
  console.log(`   Expectancy/trade:$${expectancy.toFixed(3)}`);
  console.log(`   Max Consec Loss: ${maxConsecLoss}`);
  console.log(`   Verdict:         ${grade}`);

  return {
    symbol, granularity, total, wins, losses, holds,
    winRate: +(winRate * 100).toFixed(1),
    totalPnl: +totalPnl.toFixed(2),
    roi: +(roi * 100).toFixed(1),
    sharpe: +sharpe.toFixed(2),
    maxDrawdown: +(maxDD * 100).toFixed(1),
    calmar: +calmar.toFixed(2),
    profitFactor: +profitFactor.toFixed(2),
    expectancy: +expectancy.toFixed(4),
    maxConsecLoss, grade
  };
}

// ── Summary table ──
function printSummary(results) {
  const valid = results.filter(Boolean);
  if (valid.length === 0) return;
  console.log("\n" + "═".repeat(90));
  console.log("BACKTEST SUMMARY");
  console.log("═".repeat(90));
  console.log("Symbol".padEnd(14) + "WinRate".padStart(8) + "Sharpe".padStart(8) +
    "MaxDD%".padStart(8) + "Calmar".padStart(8) + "PF".padStart(6) + "  Verdict");
  console.log("─".repeat(90));
  valid.sort((a, b) => b.sharpe - a.sharpe).forEach(r => {
    console.log(
      r.symbol.padEnd(14) +
      `${r.winRate}%`.padStart(8) +
      `${r.sharpe}`.padStart(8) +
      `${r.maxDrawdown}%`.padStart(8) +
      `${r.calmar}`.padStart(8) +
      `${r.profitFactor}`.padStart(6) +
      "  " + r.grade
    );
  });
  console.log("═".repeat(90));

  // Deploy recommendation
  const strong   = valid.filter(r => r.grade.includes("STRONG"));
  const moderate = valid.filter(r => r.grade.includes("MODERATE"));
  console.log(`\n✅ DEPLOY NOW (${strong.length}):   ${strong.map(r => r.symbol).join(", ") || "none"}`);
  console.log(`⚠️  MONITOR   (${moderate.length}):   ${moderate.map(r => r.symbol).join(", ") || "none"}`);
  console.log(`❌ SKIP       (${valid.length - strong.length - moderate.length}):`);
}

async function main() {
  console.log("🔬 TIMI BACKTESTER v2.0 — Sharpe + Drawdown + Calmar Edition\n");

  const symbols = [
    { sym: "R_75",      gran: 60  },
    { sym: "R_50",      gran: 60  },
    { sym: "BOOM1000",  gran: 60  },
    { sym: "CRASH1000", gran: 60  },
    { sym: "frxEURUSD", gran: 300 },
    { sym: "frxGBPUSD", gran: 300 },
    { sym: "frxUSDJPY", gran: 300 },
    { sym: "frxXAUUSD", gran: 300 },
    { sym: "cryBTCUSD", gran: 300 },
  ];

  const results = [];
  for (const { sym, gran } of symbols) {
    try {
      const r = await backtest(sym, gran, 1500, 60);
      results.push(r);
    } catch(e) {
      console.error(`Error on ${sym}:`, e.message);
      results.push(null);
    }
  }

  printSummary(results);
}

main().catch(console.error);
