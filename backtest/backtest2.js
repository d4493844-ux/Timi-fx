const WebSocket = require("ws");

async function fetchCandles(symbol, granularity, count) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 20000);
    ws.on("open", () => ws.send(JSON.stringify({ ticks_history: symbol, adjust_start_time: 1, count, end: "latest", granularity, style: "candles" })));
    ws.on("message", (data) => {
      const d = JSON.parse(data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error) { clearTimeout(timeout); ws.close(); console.log(`${symbol} error:`, d.error.message); resolve([]); }
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
function calcMACD(prices) {
  if (prices.length < 26) return { hist: 0 };
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  return { hist: ema12 - ema26 };
}
function calcBB(prices, period = 20) {
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
}

function getSignal(closes) {
  if (closes.length < 50) return { action: "HOLD", confidence: 0 };
  const ema9  = calcEMA(closes, 9);
  const ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes.slice(-Math.min(60, closes.length)), 50);
  const ema200 = calcEMA(closes, Math.min(200, closes.length));
  const rsi   = calcRSI(closes);
  const macd  = calcMACD(closes);
  const bb    = calcBB(closes);
  const price = closes[closes.length - 1];

  if (rsi > 75 || rsi < 25) return { action: "HOLD", confidence: 0 };
  const aboveEma200 = price > ema200;
  const emaBull = ema9 > ema21 && ema21 > ema50;
  const emaBear = ema9 < ema21 && ema21 < ema50;
  if (!emaBull && !emaBear) return { action: "HOLD", confidence: 0 };
  if (!aboveEma200 && emaBull) return { action: "HOLD", confidence: 0 };
  if (aboveEma200 && emaBear) return { action: "HOLD", confidence: 0 };

  let bull = 0, bear = 0;
  if (emaBull) bull += 3; else bear += 3;
  if (macd.hist > 0) bull += 2; else bear += 2;
  if (rsi < 45) bull += 2; else if (rsi > 55) bear += 2;
  else return { action: "HOLD", confidence: 0 };
  if (price < bb.lower) bull += 1.5;
  else if (price > bb.upper) bear += 1.5;

  const net = bull - bear;
  if (Math.abs(net) < 3) return { action: "HOLD", confidence: 0 };
  const action = net > 0 ? "BUY" : "SELL";
  const confidence = Math.min(Math.round(Math.abs(net) / 10 * 100), 99);
  return { action, confidence };
}

async function deepBacktest(symbol, granularity = 60, count = 4999) {
  console.log(`\n📊 Deep backtesting ${symbol} (${count} candles)...`);
  const candles = await fetchCandles(symbol, granularity, count);
  if (candles.length < 100) { console.log(`❌ Only got ${candles.length} candles`); return null; }
  console.log(`✅ Got ${candles.length} candles`);
  
  const closes = candles.map(c => parseFloat(c.close));
  let wins = 0, losses = 0;
  let totalPnl = 0;
  // Track consecutive losses
  let maxConsecLoss = 0, consecLoss = 0;
  // Track by confidence
  const confBuckets = { high: {w:0,l:0}, med: {w:0,l:0} };

  for (let i = 50; i < closes.length - 4; i++) {
    const slice = closes.slice(0, i);
    const sig = getSignal(slice);
    if (sig.action === "HOLD" || sig.confidence < 55) continue;

    const entry = closes[i];
    const future = closes[i + 4];
    const won = sig.action === "BUY" ? future > entry : future < entry;
    const pnl = won ? 0.95 : -1;
    totalPnl += pnl;
    
    if (won) { wins++; consecLoss = 0; if (sig.confidence >= 70) confBuckets.high.w++; else confBuckets.med.w++; }
    else { losses++; consecLoss++; maxConsecLoss = Math.max(maxConsecLoss, consecLoss); if (sig.confidence >= 70) confBuckets.high.l++; else confBuckets.med.l++; }
  }

  const total = wins + losses;
  const winRate = total > 0 ? (wins / total * 100).toFixed(1) : 0;
  
  console.log(`\n📈 Deep Results for ${symbol}:`);
  console.log(`   Total trades: ${total} | Wins: ${wins} | Losses: ${losses}`);
  console.log(`   Win Rate: ${winRate}%`);
  console.log(`   Total PnL: $${totalPnl.toFixed(2)} (on $1 stakes)`);
  console.log(`   Max consecutive losses: ${maxConsecLoss}`);
  console.log(`   High conf (70%+): ${confBuckets.high.w}W/${confBuckets.high.l}L = ${confBuckets.high.w+confBuckets.high.l > 0 ? (confBuckets.high.w/(confBuckets.high.w+confBuckets.high.l)*100).toFixed(0) : 0}%`);
  console.log(`   Med conf (55-70%): ${confBuckets.med.w}W/${confBuckets.med.l}L = ${confBuckets.med.w+confBuckets.med.l > 0 ? (confBuckets.med.w/(confBuckets.med.w+confBuckets.med.l)*100).toFixed(0) : 0}%`);
  
  return { symbol, winRate: parseFloat(winRate), trades: total, pnl: totalPnl, maxConsecLoss };
}

async function main() {
  console.log("🔬 DEEP BACKTEST - 4999 candles per symbol\n");
  const symbols = ["BOOM1000","CRASH1000","cryBTCUSD","frxGBPJPY"];
  const results = [];
  for (const sym of symbols) {
    const r = await deepBacktest(sym);
    if (r) results.push(r);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log("\n══════════════════════════════════");
  console.log("📊 DEEP BACKTEST SUMMARY");
  console.log("══════════════════════════════════");
  results.sort((a, b) => b.winRate - a.winRate);
  results.forEach(r => {
    const verdict = r.winRate >= 55 && r.trades >= 20 ? "✅ DEPLOY" : r.trades < 20 ? "⚠️ TOO FEW TRADES" : "❌ SKIP";
    console.log(`${verdict} ${r.symbol}: ${r.winRate}% | ${r.trades} trades | PnL $${r.pnl.toFixed(2)} | Max consec loss: ${r.maxConsecLoss}`);
  });
}

main().catch(console.error);
