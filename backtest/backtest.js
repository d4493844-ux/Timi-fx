const WebSocket = require("ws");

// ── Fetch historical candles ──
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
      if (d.error) { clearTimeout(timeout); ws.close(); resolve([]); }
    });
    ws.on("error", () => { clearTimeout(timeout); resolve([]); });
  });
}

// ── Math helpers ──
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
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calcEMA(prices.slice(-9), 9);
  return { macd, signal, hist: macd - signal };
}
function calcBB(prices, period = 20) {
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
}

// ── Signal function (same as live bot) ──
function getSignal(closes) {
  if (closes.length < 50) return { action: "HOLD", confidence: 0 };
  
  const ema9  = calcEMA(closes, 9);
  const ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes.slice(-60), 50);
  const ema200 = calcEMA(closes, Math.min(200, closes.length));
  const rsi   = calcRSI(closes);
  const macd  = calcMACD(closes);
  const bb    = calcBB(closes);
  const price = closes[closes.length - 1];

  // Hard filters
  if (rsi > 75 || rsi < 25) return { action: "HOLD", confidence: 0, reason: "RSI extreme" };
  
  // 200 EMA master filter
  const aboveEma200 = price > ema200;
  const emaBull = ema9 > ema21 && ema21 > ema50;
  const emaBear = ema9 < ema21 && ema21 < ema50;
  if (!emaBull && !emaBear) return { action: "HOLD", confidence: 0, reason: "EMA not aligned" };
  if (!aboveEma200 && emaBull) return { action: "HOLD", confidence: 0, reason: "Below 200 EMA" };
  if (aboveEma200 && emaBear) return { action: "HOLD", confidence: 0, reason: "Above 200 EMA" };

  let bull = 0, bear = 0;
  if (emaBull) bull += 3; else bear += 3;
  if (macd.hist > 0) bull += 2; else bear += 2;
  if (rsi < 45) bull += 2; else if (rsi > 55) bear += 2;
  else return { action: "HOLD", confidence: 0, reason: "RSI neutral" };
  if (price < bb.lower) bull += 1.5;
  else if (price > bb.upper) bear += 1.5;

  const net = bull - bear;
  if (Math.abs(net) < 3) return { action: "HOLD", confidence: 0, reason: "Weak signal" };

  const action = net > 0 ? "BUY" : "SELL";
  const confidence = Math.min(Math.round(Math.abs(net) / 10 * 100), 99);
  return { action, confidence };
}

// ── Backtester ──
async function backtest(symbol, granularity = 60, count = 1000) {
  console.log(`\n📊 Backtesting ${symbol}...`);
  const candles = await fetchCandles(symbol, granularity, count);
  if (candles.length < 100) { console.log(`❌ Not enough candles: ${candles.length}`); return null; }
  
  console.log(`✅ Got ${candles.length} candles`);
  const closes = candles.map(c => parseFloat(c.close));
  
  let wins = 0, losses = 0, holds = 0;
  let totalPnl = 0;
  const stake = 1; // $1 per trade for testing
  const tradeLog = [];

  // Walk forward through candles
  for (let i = 50; i < closes.length - 4; i++) {
    const slice = closes.slice(0, i);
    const sig = getSignal(slice);
    
    if (sig.action === "HOLD") { holds++; continue; }
    if (sig.confidence < 55) continue;

    // Simulate trade outcome - check next 4 candles
    const entry = closes[i];
    const future = closes[i + 4]; // 4 candle outcome
    const won = sig.action === "BUY" ? future > entry : future < entry;
    
    // Rise/Fall payout on Deriv is ~95% of stake
    const pnl = won ? stake * 0.95 : -stake;
    totalPnl += pnl;
    if (won) wins++; else losses++;
    
    tradeLog.push({ i, action: sig.action, confidence: sig.confidence, won, pnl });
  }

  const total = wins + losses;
  const winRate = total > 0 ? (wins / total * 100).toFixed(1) : 0;
  const roi = totalPnl.toFixed(2);

  console.log(`\n📈 Results for ${symbol}:`);
  console.log(`   Trades: ${total} | Wins: ${wins} | Losses: ${losses}`);
  console.log(`   Win Rate: ${winRate}%`);
  console.log(`   Total PnL: $${roi} (on $1 stakes)`);
  console.log(`   Holds (filtered): ${holds}`);
  
  if (parseFloat(winRate) >= 55) {
    console.log(`   ✅ PROFITABLE - deploy this symbol`);
  } else {
    console.log(`   ❌ NOT PROFITABLE - skip this symbol`);
  }

  return { symbol, winRate: parseFloat(winRate), trades: total, pnl: parseFloat(roi) };
}

// ── Run backtest on all symbols ──
async function main() {
  console.log("🔬 TIMI BACKTESTER - Testing all symbols...\n");
  
  const symbols = [
    "R_75", "R_25", "R_50", "R_100",
    "BOOM1000", "BOOM500", "CRASH1000", "CRASH500",
    "frxEURUSD", "frxGBPUSD", "frxUSDJPY",
    "frxGBPJPY", "frxAUDUSD", "cryBTCUSD"
  ];

  const results = [];
  for (const sym of symbols) {
    const r = await backtest(sym);
    if (r) results.push(r);
    await new Promise(r => setTimeout(r, 1000)); // rate limit
  }

  console.log("\n\n══════════════════════════════════");
  console.log("📊 FINAL BACKTEST SUMMARY");
  console.log("══════════════════════════════════");
  
  results.sort((a, b) => b.winRate - a.winRate);
  const profitable = results.filter(r => r.winRate >= 55);
  const losing = results.filter(r => r.winRate < 55);
  
  console.log("\n✅ PROFITABLE SYMBOLS (deploy these):");
  profitable.forEach(r => console.log(`   ${r.symbol}: ${r.winRate}% win rate | $${r.pnl} PnL`));
  
  console.log("\n❌ LOSING SYMBOLS (skip these):");
  losing.forEach(r => console.log(`   ${r.symbol}: ${r.winRate}% win rate | $${r.pnl} PnL`));
  
  console.log("\n══════════════════════════════════");
  console.log(`Deploy ${profitable.length} symbols, skip ${losing.length}`);
  
  if (profitable.length > 0) {
    const symsArray = profitable.map(r => `'${r.symbol}'`).join(",");
    console.log(`\nSQL to update bot_config:`);
    console.log(`update bot_config set symbols = ARRAY[${symsArray}] where active = true;`);
  }
}

main().catch(console.error);
