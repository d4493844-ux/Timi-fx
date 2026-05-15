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

// ── Indicators ──
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
      Math.abs(parseFloat(c.low) - pc)
    );
  });
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}
function calcStochRSI(closes, period = 14) {
  const rsiVals = [];
  for (let i = period; i < closes.length; i++)
    rsiVals.push(calcRSI(closes.slice(0, i + 1), period));
  if (rsiVals.length < period) return 50;
  const recent = rsiVals.slice(-period);
  const minR = Math.min(...recent), maxR = Math.max(...recent);
  return maxR === minR ? 50 : ((rsiVals[rsiVals.length-1] - minR) / (maxR - minR)) * 100;
}
function calcBB(closes, period = 20, mult = 2) {
  const sl  = closes.slice(-period);
  const mid = sl.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mid, 2), 0) / period);
  return { upper: mid + mult * std, lower: mid - mult * std, mid, std };
}
function calcADX(closes, period = 14) {
  const n = Math.min(period, closes.length - 1);
  let dmP = 0, dmM = 0, trS = 0;
  for (let i = closes.length - n; i < closes.length; i++) {
    const d = closes[i] - closes[i-1];
    if (d > 0) dmP += d; else dmM -= d;
    trS += Math.abs(d);
  }
  return trS > 0 ? Math.abs(dmP - dmM) / trS : 0;
}

// ── Session gate ──
function isGoodSession(symbol) {
  const h = new Date().getUTCHours();
  if (["frxEURUSD","frxGBPUSD","frxEURGBP"].includes(symbol)) return h >= 7 && h < 20;
  if (["frxUSDJPY","frxEURJPY","frxGBPJPY"].includes(symbol)) return h >= 0 && h < 16;
  if (["frxXAUUSD","frxXAGUSD"].includes(symbol))              return h >= 7 && h < 20;
  if (symbol.startsWith("cry"))                                  return !(h >= 2 && h < 6);
  return true;
}

// ════════════════════════════════════════════════════════════════
// STRATEGY A — BOOM/CRASH: trend-following spike detection
// ════════════════════════════════════════════════════════════════
function boomCrashSignal(candles, candles5m, symbol) {
  const closes = candles.map(c => parseFloat(c.close));
  const atr    = calcATR(candles);
  const rsi    = calcRSI(closes);
  const ema8   = calcEMA(closes, 8);
  const ema21  = calcEMA(closes, 21);
  const ema50  = calcEMA(closes.slice(-60), 50);
  const isBoom = symbol.startsWith("BOOM");

  let trend5m = 0;
  if (candles5m.length >= 30) {
    const c5  = candles5m.map(c => parseFloat(c.close));
    const e20 = calcEMA(c5, 20), e50b = calcEMA(c5, 50), r5 = calcRSI(c5);
    trend5m = e20 > e50b && r5 > 50 ? 1 : e20 < e50b && r5 < 50 ? -1 : 0;
  }

  if (isBoom) {
    const bullSetup = ema8 > ema21 && ema21 > ema50;
    if (bullSetup && rsi >= 35 && rsi <= 65 && trend5m >= 0) {
      let conf = 65;
      if (trend5m === 1) conf += 8;
      if (rsi < 50) conf += 5;
      return { action: "BUY", confidence: Math.min(88, conf), reason: "boom_bull", atr };
    }
    if (rsi > 78 && ema8 < ema21)
      return { action: "SELL", confidence: 64, reason: "boom_fade", atr };
  } else {
    const bearSetup = ema8 < ema21 && ema21 < ema50;
    if (bearSetup && rsi >= 35 && rsi <= 65 && trend5m <= 0) {
      let conf = 65;
      if (trend5m === -1) conf += 8;
      if (rsi > 50) conf += 5;
      return { action: "SELL", confidence: Math.min(88, conf), reason: "crash_bear", atr };
    }
    if (rsi < 22 && ema8 > ema21)
      return { action: "BUY", confidence: 64, reason: "crash_fade", atr };
  }
  return null;
}

// ════════════════════════════════════════════════════════════════
// STRATEGY B — VIX Synthetics: BB + StochRSI mean reversion
// ════════════════════════════════════════════════════════════════
function vixSignal(candles) {
  const closes = candles.map(c => parseFloat(c.close));
  const price  = closes[closes.length - 1];
  const prev   = closes[closes.length - 2];
  const atr    = calcATR(candles);
  const rsi    = calcRSI(closes);
  const bb     = calcBB(closes);
  const stochRsi = calcStochRSI(closes);

  const bouncingUp   = price > prev && price < bb.mid;
  const bouncingDown = price < prev && price > bb.mid;

  if (price <= bb.lower * 1.001 && stochRsi < 25 && bouncingUp && rsi < 45) {
    return { action: "BUY",  confidence: Math.min(82, 65 + Math.round(25 - stochRsi)), reason: `vix_bounce_buy`, atr };
  }
  if (price >= bb.upper * 0.999 && stochRsi > 75 && bouncingDown && rsi > 55) {
    return { action: "SELL", confidence: Math.min(82, 65 + Math.round(stochRsi - 75)), reason: `vix_bounce_sell`, atr };
  }
  return null;
}

// ════════════════════════════════════════════════════════════════
// STRATEGY C — Forex/Gold/Crypto precision entry
// Ranging → mean reversion (tight zscore 2.2 + BB + StochRSI)
// Trending → pullback to EMA21 only
// Never fires in ambiguous/transitioning markets
// ════════════════════════════════════════════════════════════════
function forexSignal(candles, candles5m) {
  const closes = candles.map(c => parseFloat(c.close));
  const price  = closes[closes.length - 1];
  const prev   = closes[closes.length - 2];
  const atr    = calcATR(candles);
  const atrPct = atr / price;
  const rsi    = calcRSI(closes);
  const bb     = calcBB(closes);
  const adx    = calcADX(closes);
  const stochRsi = calcStochRSI(closes);

  if (atrPct > 0.008) return null; // news/spike — skip

  const ema8  = calcEMA(closes, 8);
  const ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes.slice(-60), 50);
  const emaSpread = Math.abs(ema21 - ema50) / (ema50 + 1e-10);

  // Must clearly be ranging OR trending — nothing in between
  const isRanging  = adx < 0.20 && emaSpread < 0.001;
  const isTrending = adx > 0.45 && emaSpread > 0.002;
  if (!isRanging && !isTrending) return null;

  let trend5m = 0;
  if (candles5m.length >= 30) {
    const c5  = candles5m.map(c => parseFloat(c.close));
    const e20 = calcEMA(c5, 20), e50b = calcEMA(c5, 50), r5 = calcRSI(c5);
    trend5m = e20 > e50b && r5 > 52 ? 1 : e20 < e50b && r5 < 48 ? -1 : 0;
  }

  if (isRanging) {
    // Tight zscore threshold (2.2) + BB extreme + StochRSI + reversal candle
    const sl20  = closes.slice(-20);
    const mean  = sl20.reduce((a, b) => a + b, 0) / 20;
    const std   = Math.sqrt(sl20.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20) + 1e-10;
    const z     = (price - mean) / std;

    if (z < -2.2 && price <= bb.lower * 1.002 && stochRsi < 20 && price > prev && rsi < 40) {
      return { action: "BUY",  confidence: Math.min(84, 68 + Math.round(Math.abs(z)*6)), reason: `meanrev_buy z=${z.toFixed(2)}`, atr };
    }
    if (z > 2.2 && price >= bb.upper * 0.998 && stochRsi > 80 && price < prev && rsi > 60) {
      return { action: "SELL", confidence: Math.min(84, 68 + Math.round(Math.abs(z)*6)), reason: `meanrev_sell z=${z.toFixed(2)}`, atr };
    }
  }

  if (isTrending) {
    // Pullback to EMA21 only — never chase the top of a move
    const emaBull    = ema8 > ema21 && ema21 > ema50;
    const emaBear    = ema8 < ema21 && ema21 < ema50;
    const nearBull   = price > ema21 && price < ema21 + atr * 0.6 && price > prev;
    const nearBear   = price < ema21 && price > ema21 - atr * 0.6 && price < prev;

    if (emaBull && nearBull && trend5m === 1 && rsi >= 42 && rsi <= 58)
      return { action: "BUY",  confidence: 74, reason: "pullback_buy", atr };
    if (emaBear && nearBear && trend5m === -1 && rsi >= 42 && rsi <= 58)
      return { action: "SELL", confidence: 74, reason: "pullback_sell", atr };

    // Breakout from tight consolidation
    const r12  = closes.slice(-13, -1);
    const h12  = Math.max(...r12), l12 = Math.min(...r12), rng12 = h12 - l12;
    const curR = parseFloat(candles[candles.length-1].high) - parseFloat(candles[candles.length-1].low);
    if (rng12 < atr * 2.0 && curR > atr * 1.5) {
      if (price > h12 && emaBull && rsi > 52 && rsi < 72)
        return { action: "BUY",  confidence: 71, reason: "breakout_buy", atr };
      if (price < l12 && emaBear && rsi < 48 && rsi > 28)
        return { action: "SELL", confidence: 71, reason: "breakout_sell", atr };
    }
  }
  return null;
}

// ── Master router ──
function getSignal(candles, candles5m = [], symbol = "") {
  if (candles.length < 60) return { action: "HOLD", confidence: 0 };
  if (symbol && !isGoodSession(symbol)) return { action: "HOLD", confidence: 0, reason: "off_session" };

  const closes = candles.map(c => parseFloat(c.close));
  const rsi    = calcRSI(closes);
  if (rsi > 82 || rsi < 18) return { action: "HOLD", confidence: 0, reason: "rsi_extreme" };

  let sig = null;
  if      (symbol.startsWith("BOOM") || symbol.startsWith("CRASH")) sig = boomCrashSignal(candles, candles5m, symbol);
  else if (symbol.startsWith("R_")   || symbol.startsWith("1HZ"))   sig = vixSignal(candles);
  else                                                                sig = forexSignal(candles, candles5m);

  return sig || { action: "HOLD", confidence: 0, reason: "no_setup" };
}

// ── Stats ──
function calcSharpe(returns) {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std  = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b-mean, 2), 0) / returns.length);
  return std === 0 ? 0 : (mean / std) * Math.sqrt(252 * 24 * 60 / returns.length);
}
function calcMaxDrawdown(equity) {
  let peak = equity[0], maxDD = 0;
  for (const v of equity) { if (v > peak) peak = v; const dd=(peak-v)/peak; if(dd>maxDD) maxDD=dd; }
  return maxDD;
}
function calcCalmar(roi, maxDD, n, gran) {
  if (maxDD === 0) return roi > 0 ? 99 : 0;
  const yrs = (n * gran) / (365*24*3600);
  return (yrs > 0 ? roi/yrs : roi) / maxDD;
}

// ── Backtester ──
async function backtest(symbol, granularity = 60, count = 1500, minConf = 60) {
  console.log(`\n📊 Backtesting ${symbol} (${count} candles, ${granularity}s)...`);
  const [candles, candles5m] = await Promise.all([
    fetchCandles(symbol, granularity, count),
    fetchCandles(symbol, 300, Math.floor(count/5))
  ]);
  if (candles.length < 100) { console.log("❌ Insufficient candles"); return null; }
  console.log(`✅ ${candles.length} candles fetched`);

  const PAYOUT = 0.95, STAKE = 1, SLIPPAGE = 0.0001;
  const isBoomCrash = symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
  const isVIX       = symbol.startsWith("R_") || symbol.startsWith("1HZ");
  const OUTCOME_WINDOW = isBoomCrash ? 3 : isVIX ? 8 : 12;

  let balance = 100;
  const equity = [balance], rets = [];
  let wins=0, losses=0, holds=0, grossW=0, grossL=0, maxCL=0, cl=0;

  for (let i = 60; i < candles.length - OUTCOME_WINDOW; i++) {
    const sig = getSignal(candles.slice(0,i), candles5m.slice(0, Math.floor(i/5)), symbol);
    if (sig.action === "HOLD" || sig.confidence < minConf) { holds++; equity.push(balance); continue; }

    const entry = parseFloat(candles[i].close);
    const atr   = sig.atr || entry * 0.002;
    const tp    = sig.action==="BUY" ? entry+atr*2 : entry-atr*2;
    const sl    = sig.action==="BUY" ? entry-atr   : entry+atr;
    const sE    = entry*(1+(sig.action==="BUY"?SLIPPAGE:-SLIPPAGE));

    let won=false, resolved=false;
    for (let j=i+1; j<=i+OUTCOME_WINDOW; j++) {
      const h=parseFloat(candles[j].high), l=parseFloat(candles[j].low);
      if (sig.action==="BUY")  { if(l<=sl){won=false;resolved=true;break;} if(h>=tp){won=true;resolved=true;break;} }
      else                      { if(h>=sl){won=false;resolved=true;break;} if(l<=tp){won=true;resolved=true;break;} }
    }
    if (!resolved) { const fc=parseFloat(candles[i+OUTCOME_WINDOW].close); won=sig.action==="BUY"?fc>sE:fc<sE; }

    const pnl = won ? STAKE*PAYOUT : -STAKE;
    balance = Math.max(0, balance+pnl);
    equity.push(balance); rets.push(pnl/STAKE);
    if (won) { wins++; grossW+=STAKE*PAYOUT; cl=0; }
    else     { losses++; grossL+=STAKE; cl++; if(cl>maxCL) maxCL=cl; }
  }

  const total=wins+losses;
  if (!total) { console.log("❌ No trades"); return null; }

  const wr=wins/total, pnl=balance-100, roi=pnl/100;
  const sharpe=calcSharpe(rets), maxDD=calcMaxDrawdown(equity);
  const calmar=calcCalmar(roi,maxDD,candles.length,granularity);
  const pf=grossL>0?grossW/grossL:grossW>0?99:0;
  const exp=(wr*PAYOUT)-((1-wr)*1);
  const grade=sharpe>=1.5&&maxDD<0.15&&wr>=0.55?"🟢 STRONG — deploy"
            :sharpe>=0.8&&maxDD<0.25&&wr>=0.50?"🟡 MODERATE — monitor":"🔴 WEAK — do not deploy";

  console.log(`\n📈 ${symbol} Results:`);
  console.log(`   Trades: ${total} | Wins: ${wins} | Losses: ${losses} | Held: ${holds}`);
  console.log(`   Win Rate:        ${(wr*100).toFixed(1)}%`);
  console.log(`   Total PnL:       $${pnl.toFixed(2)} (${(roi*100).toFixed(1)}% ROI)`);
  console.log(`   Sharpe Ratio:    ${sharpe.toFixed(2)}`);
  console.log(`   Max Drawdown:    ${(maxDD*100).toFixed(1)}%`);
  console.log(`   Calmar Ratio:    ${calmar.toFixed(2)}`);
  console.log(`   Profit Factor:   ${pf.toFixed(2)}`);
  console.log(`   Expectancy/trade:$${exp.toFixed(3)}`);
  console.log(`   Max Consec Loss: ${maxCL}`);
  console.log(`   Outcome Window:  ${OUTCOME_WINDOW} candles`);
  console.log(`   Verdict:         ${grade}`);
  return { symbol, total, wins, losses, winRate:+(wr*100).toFixed(1),
    totalPnl:+pnl.toFixed(2), sharpe:+sharpe.toFixed(2),
    maxDrawdown:+(maxDD*100).toFixed(1), calmar:+calmar.toFixed(2),
    profitFactor:+pf.toFixed(2), expectancy:+exp.toFixed(4), maxConsecLoss:maxCL, grade };
}

function printSummary(results) {
  const v = results.filter(Boolean);
  if (!v.length) return;
  console.log("\n"+"═".repeat(92));
  console.log("BACKTEST SUMMARY v3.0 — Per-Instrument Strategy Router");
  console.log("═".repeat(92));
  console.log("Symbol".padEnd(14)+"WinRate".padStart(8)+"Sharpe".padStart(8)+"MaxDD%".padStart(8)+"Calmar".padStart(9)+"PF".padStart(6)+"  Verdict");
  console.log("─".repeat(92));
  v.sort((a,b)=>b.sharpe-a.sharpe).forEach(r=>
    console.log(r.symbol.padEnd(14)+`${r.winRate}%`.padStart(8)+`${r.sharpe}`.padStart(8)+
      `${r.maxDrawdown}%`.padStart(8)+`${r.calmar}`.padStart(9)+`${r.profitFactor}`.padStart(6)+"  "+r.grade));
  console.log("═".repeat(92));
  const s=v.filter(r=>r.grade.includes("STRONG")), m=v.filter(r=>r.grade.includes("MODERATE")), w=v.filter(r=>r.grade.includes("WEAK"));
  console.log(`\n✅ DEPLOY (${s.length}): ${s.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`⚠️  MONITOR(${m.length}): ${m.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`❌ SKIP   (${w.length}): ${w.map(r=>r.symbol).join(", ")||"none"}`);
}

async function main() {
  console.log("🔬 TIMI BACKTESTER v3.0 — Per-Instrument Strategy Router\n");
  const symbols = [
    {sym:"R_75",gran:60},{sym:"R_50",gran:60},
    {sym:"BOOM1000",gran:60},{sym:"CRASH1000",gran:60},
    {sym:"frxEURUSD",gran:300},{sym:"frxGBPUSD",gran:300},
    {sym:"frxUSDJPY",gran:300},{sym:"frxXAUUSD",gran:300},
    {sym:"cryBTCUSD",gran:300},
  ];
  const results=[];
  for (const {sym,gran} of symbols) {
    try { results.push(await backtest(sym,gran,1500,60)); }
    catch(e) { console.error(`Error ${sym}:`,e.message); results.push(null); }
  }
  printSummary(results);
}
main().catch(console.error);
