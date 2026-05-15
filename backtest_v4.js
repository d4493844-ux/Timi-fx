const WebSocket = require("ws");

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

function calcEMA(prices, period) {
  const k = 2/(period+1); let ema = prices[0];
  for (let i=1; i<prices.length; i++) ema = prices[i]*k + ema*(1-k);
  return ema;
}
function calcRSI(prices, period=14) {
  if (prices.length < period+1) return 50;
  let g=0, l=0;
  for (let i=prices.length-period; i<prices.length; i++) {
    const d=prices[i]-prices[i-1]; if(d>0) g+=d; else l-=d;
  }
  return 100-100/(1+g/(l||0.0001));
}
function calcATR(candles, period=14) {
  const s=candles.slice(-period);
  const trs=s.map((c,i)=>{
    const pc=i>0?parseFloat(s[i-1].close):parseFloat(c.close);
    return Math.max(parseFloat(c.high)-parseFloat(c.low),
      Math.abs(parseFloat(c.high)-pc),Math.abs(parseFloat(c.low)-pc));
  });
  return trs.reduce((a,b)=>a+b,0)/trs.length;
}
function calcStochRSI(closes, period=14) {
  const rsiVals=[];
  for (let i=period; i<closes.length; i++)
    rsiVals.push(calcRSI(closes.slice(0,i+1), period));
  if (rsiVals.length < period) return 50;
  const recent=rsiVals.slice(-period);
  const minR=Math.min(...recent), maxR=Math.max(...recent);
  return maxR===minR?50:((rsiVals[rsiVals.length-1]-minR)/(maxR-minR))*100;
}
function calcBB(closes, period=20, mult=2) {
  const sl=closes.slice(-period);
  const mid=sl.reduce((a,b)=>a+b,0)/period;
  const std=Math.sqrt(sl.reduce((a,b)=>a+Math.pow(b-mid,2),0)/period);
  return { upper:mid+mult*std, lower:mid-mult*std, mid, std };
}

// ════════════════════════════════════════════════════════════════
// SIGNAL A — BOOM/CRASH
// Diagnostic confirmed: direction is almost never wrong.
// ONLY fix needed: SL widened from 1×ATR → 1.5×ATR
// This stops 65-74% of losses (SL clip before move plays out)
// Outcome window: 3 candles (diagnostic showed 3 > 5 for BOOM/CRASH)
// ════════════════════════════════════════════════════════════════
function boomCrashSignal(candles, candles5m, symbol) {
  const closes=candles.map(c=>parseFloat(c.close));
  const price=closes[closes.length-1];
  const atr=calcATR(candles);
  const rsi=calcRSI(closes);
  const ema8=calcEMA(closes,8), ema21=calcEMA(closes,21);
  const ema50=calcEMA(closes.slice(-60),50);
  const ema200=calcEMA(closes,Math.min(200,closes.length));
  const atrPct=atr/price;
  const isBoom=symbol.startsWith("BOOM");

  if (atrPct>0.008) return null;

  let trend5m=0;
  if (candles5m.length>=30) {
    const c5=candles5m.map(c=>parseFloat(c.close));
    const e20=calcEMA(c5,20), e50b=calcEMA(c5,50), r5=calcRSI(c5);
    trend5m=e20>e50b&&r5>50?1:e20<e50b&&r5<50?-1:0;
  }

  const emaBull=ema8>ema21&&ema21>ema50;
  const emaBear=ema8<ema21&&ema21<ema50;
  if (!emaBull&&!emaBear) return null;
  if (emaBull&&price<ema200) return null;
  if (emaBear&&price>ema200) return null;
  if (rsi>75||rsi<25) return null;

  let bull=0, bear=0;
  if (emaBull) bull+=3; else bear+=3;
  if (rsi<50)  bull+=2; else bear+=2;
  if (trend5m===1) bull+=3; else if (trend5m===-1) bear+=3;
  const net=bull-bear;
  if (Math.abs(net)<4) return null;

  const action=net>0?"BUY":"SELL";
  if (isBoom&&action!=="BUY")  return null; // BOOM only buys (spikes up)
  if (!isBoom&&action!=="SELL") return null; // CRASH only sells (spikes down)

  const confidence=Math.min(Math.round(Math.abs(net)/11*100),95);
  // SL_MULT = 1.5 (widened from 1.0 based on diagnostic — 74% of losses were SL clips)
  return { action, confidence, atr, atrPct, sl_mult: 1.5, tp_mult: 2.0, outcome_window: 3 };
}

// ════════════════════════════════════════════════════════════════
// SIGNAL B — R_75 only
// Diagnostic: trend-following gives 51% WR at best → wrong strategy
// Switch to BB bounce + StochRSI — mean reversion works on oscillating VIX
// Outcome window: 5 candles (gives price time to bounce back to mean)
// ════════════════════════════════════════════════════════════════
function r75Signal(candles) {
  const closes=candles.map(c=>parseFloat(c.close));
  const price=closes[closes.length-1];
  const prev=closes[closes.length-2];
  const atr=calcATR(candles);
  const rsi=calcRSI(closes);
  const bb=calcBB(closes,20,2);
  const stochRsi=calcStochRSI(closes);

  // Need confirmed reversal candle — price must already be moving back
  const bouncingUp   = price>prev && price<bb.mid;
  const bouncingDown = price<prev && price>bb.mid;

  // BUY: at lower BB + StochRSI deeply oversold + reversal started
  if (price<=bb.lower*1.002 && stochRsi<20 && bouncingUp && rsi<40) {
    const conf=Math.min(84, 68+Math.round(20-stochRsi));
    return { action:"BUY",  confidence:conf, atr, sl_mult:1.5, tp_mult:1.5, outcome_window:5,
      reason:`r75_bounce_buy stoch=${stochRsi.toFixed(0)}` };
  }
  // SELL: at upper BB + StochRSI deeply overbought + reversal started
  if (price>=bb.upper*0.998 && stochRsi>80 && bouncingDown && rsi>60) {
    const conf=Math.min(84, 68+Math.round(stochRsi-80));
    return { action:"SELL", confidence:conf, atr, sl_mult:1.5, tp_mult:1.5, outcome_window:5,
      reason:`r75_bounce_sell stoch=${stochRsi.toFixed(0)}` };
  }
  return null;
}

// ── Master router ──
function getSignal(candles, candles5m=[], symbol="") {
  if (candles.length < 60) return { action:"HOLD", confidence:0 };
  const closes=candles.map(c=>parseFloat(c.close));
  const rsi=calcRSI(closes);
  if (rsi>80||rsi<20) return { action:"HOLD", confidence:0, reason:"rsi_extreme" };

  let sig=null;
  if      (symbol.startsWith("BOOM")||symbol.startsWith("CRASH")) sig=boomCrashSignal(candles,candles5m,symbol);
  else if (symbol==="R_75")                                         sig=r75Signal(candles);
  // R_50, forex, gold, crypto → no signal (diagnostic confirmed not tradeable with TA)

  return sig||{ action:"HOLD", confidence:0, reason:"no_setup" };
}

// ── Stats ──
function calcSharpe(rets) {
  if (rets.length<2) return 0;
  const mean=rets.reduce((a,b)=>a+b,0)/rets.length;
  const std=Math.sqrt(rets.reduce((a,b)=>a+Math.pow(b-mean,2),0)/rets.length);
  return std===0?0:(mean/std)*Math.sqrt(252*24*60/rets.length);
}
function calcMaxDD(equity) {
  let peak=equity[0], maxDD=0;
  for (const v of equity) { if(v>peak) peak=v; const dd=(peak-v)/peak; if(dd>maxDD) maxDD=dd; }
  return maxDD;
}

async function backtest(symbol, granularity=60, count=1500, minConf=60) {
  console.log(`\n📊 Backtesting ${symbol}...`);
  const [candles, c5m]=await Promise.all([
    fetchCandles(symbol,granularity,count),
    fetchCandles(symbol,300,Math.floor(count/5))
  ]);
  if (candles.length<100) { console.log("❌ No data"); return null; }
  console.log(`✅ ${candles.length} candles`);

  const PAYOUT=0.95, STAKE=1;
  let balance=100;
  const equity=[balance], rets=[];
  let wins=0,losses=0,holds=0,grossW=0,grossL=0,maxCL=0,cl=0;

  for (let i=60; i<candles.length-25; i++) {
    const sig=getSignal(candles.slice(0,i), c5m.slice(0,Math.floor(i/5)), symbol);
    if (sig.action==="HOLD"||sig.confidence<minConf) { holds++; equity.push(balance); continue; }

    const W=sig.outcome_window||5;
    if (i+W>=candles.length) continue;

    const entry=parseFloat(candles[i].close);
    const atr=sig.atr||entry*0.002;
    // Use per-signal SL/TP multipliers from diagnostic
    const tp=sig.action==="BUY"?entry+atr*sig.tp_mult:entry-atr*sig.tp_mult;
    const sl=sig.action==="BUY"?entry-atr*sig.sl_mult:entry+atr*sig.sl_mult;

    let won=false,resolved=false;
    for (let j=i+1;j<=i+W;j++) {
      const h=parseFloat(candles[j].high),l=parseFloat(candles[j].low);
      if (sig.action==="BUY")  { if(l<=sl){won=false;resolved=true;break;} if(h>=tp){won=true;resolved=true;break;} }
      else                      { if(h>=sl){won=false;resolved=true;break;} if(l<=tp){won=true;resolved=true;break;} }
    }
    if (!resolved) { const fc=parseFloat(candles[i+W].close); won=sig.action==="BUY"?fc>entry:fc<entry; }

    const pnl=won?STAKE*PAYOUT:-STAKE;
    balance=Math.max(0,balance+pnl);
    equity.push(balance); rets.push(pnl/STAKE);
    if(won){wins++;grossW+=STAKE*PAYOUT;cl=0;}
    else   {losses++;grossL+=STAKE;cl++;if(cl>maxCL)maxCL=cl;}
  }

  const total=wins+losses;
  if (!total) { console.log("❌ No trades generated"); return null; }

  const wr=wins/total, pnl=balance-100, roi=pnl/100;
  const sharpe=calcSharpe(rets), maxDD=calcMaxDD(equity);
  const pf=grossL>0?grossW/grossL:grossW>0?99:0;
  const exp=(wr*PAYOUT)-((1-wr));
  const grade=sharpe>=1.5&&maxDD<0.15&&wr>=0.55?"🟢 STRONG — deploy"
            :sharpe>=0.8&&maxDD<0.25&&wr>=0.50?"🟡 MODERATE — monitor"
            :"🔴 WEAK — do not deploy";

  console.log(`   Trades: ${total} | Wins: ${wins} | Losses: ${losses}`);
  console.log(`   Win Rate:      ${(wr*100).toFixed(1)}%`);
  console.log(`   Total PnL:     $${pnl.toFixed(2)} (${(roi*100).toFixed(1)}% ROI)`);
  console.log(`   Sharpe:        ${sharpe.toFixed(2)}`);
  console.log(`   Max Drawdown:  ${(maxDD*100).toFixed(1)}%`);
  console.log(`   Profit Factor: ${pf.toFixed(2)}`);
  console.log(`   Expectancy:    $${exp.toFixed(3)}`);
  console.log(`   Max Consec L:  ${maxCL}`);
  console.log(`   Verdict:       ${grade}`);

  return { symbol, total, wins, losses, winRate:+(wr*100).toFixed(1),
    totalPnl:+pnl.toFixed(2), sharpe:+sharpe.toFixed(2),
    maxDrawdown:+(maxDD*100).toFixed(1), profitFactor:+pf.toFixed(2),
    expectancy:+exp.toFixed(4), maxConsecLoss:maxCL, grade };
}

function printSummary(results) {
  const v=results.filter(Boolean);
  if (!v.length) return;
  console.log("\n"+"═".repeat(80));
  console.log("BACKTEST SUMMARY v4.0 — Data-Driven SL/TP + Per-Instrument Strategy");
  console.log("═".repeat(80));
  console.log("Symbol".padEnd(14)+"WinRate".padStart(8)+"Sharpe".padStart(8)+"MaxDD%".padStart(8)+"PF".padStart(6)+"  Verdict");
  console.log("─".repeat(80));
  v.sort((a,b)=>b.sharpe-a.sharpe).forEach(r=>
    console.log(r.symbol.padEnd(14)+`${r.winRate}%`.padStart(8)+`${r.sharpe}`.padStart(8)+
      `${r.maxDrawdown}%`.padStart(8)+`${r.profitFactor}`.padStart(6)+"  "+r.grade));
  console.log("═".repeat(80));
  const s=v.filter(r=>r.grade.includes("STRONG"));
  const m=v.filter(r=>r.grade.includes("MODERATE"));
  const w=v.filter(r=>r.grade.includes("WEAK"));
  console.log(`\n✅ DEPLOY  (${s.length}): ${s.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`⚠️  MONITOR (${m.length}): ${m.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`❌ SKIP    (${w.length}): ${w.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`\n💡 R_50, frxEURUSD, frxGBPUSD, frxUSDJPY, frxXAUUSD, cryBTCUSD:`);
  console.log(`   Diagnostic confirmed: TA-only not viable at 95% payout.`);
  console.log(`   These need ML models. Keep them in bot for ML signals only.`);
}

async function main() {
  console.log("🔬 TIMI BACKTESTER v4.0 — Data-Driven Surgical Fixes\n");
  console.log("📌 Changes from diagnostic:");
  console.log("   BOOM/CRASH: SL widened 1×→1.5×ATR (fixes 65-74% of losses)");
  console.log("   R_75:       Strategy switched to BB+StochRSI mean reversion");
  console.log("   R_50+Forex: Removed (TA not viable — ML-only going forward)\n");

  const symbols=[
    {sym:"BOOM1000",  gran:60},
    {sym:"CRASH1000", gran:60},
    {sym:"R_75",      gran:60},
  ];
  const results=[];
  for (const {sym,gran} of symbols) {
    try { results.push(await backtest(sym,gran,1500,60)); }
    catch(e) { console.error(`Error ${sym}:`,e.message); results.push(null); }
  }
  printSummary(results);
}
main().catch(console.error);
