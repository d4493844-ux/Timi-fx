const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════
// TIMI DEFINITIVE BACKTEST v5.0
// Tests exactly what the live edge function runs per symbol:
//
//  BOOM/CRASH → original EMA stack signal (diagnostic proven)
//               SL = 1.5×ATR (widened from Round 4 patch)
//               Outcome window = 3 candles (diagnostic optimal)
//
//  R_75       → BB + StochRSI mean reversion
//               SL = 1.5×ATR, TP = 1.5×ATR
//               Outcome window = 5 candles
//
//  R_50/Forex/Gold/Crypto → ML-only in live bot, so backtest
//               uses the same original EMA signal as proxy
//               to show theoretical baseline before ML boost
// ══════════════════════════════════════════════════════════════

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
      Math.abs(parseFloat(c.high)-pc), Math.abs(parseFloat(c.low)-pc));
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
  return maxR===minR ? 50 : ((rsiVals[rsiVals.length-1]-minR)/(maxR-minR))*100;
}
function calcBB(closes, period=20, mult=2) {
  const sl=closes.slice(-period);
  const mid=sl.reduce((a,b)=>a+b,0)/period;
  const std=Math.sqrt(sl.reduce((a,b)=>a+Math.pow(b-mid,2),0)/period);
  return { upper:mid+mult*std, lower:mid-mult*std, mid };
}

// ══════════════════════════════════════════════════════════════
// SIGNAL A — BOOM/CRASH
// Exact original signal that gave CRASH 87.5% WR in diagnostic
// SL widened to 1.5×ATR per Round 4 patch
// ══════════════════════════════════════════════════════════════
function boomCrashSignal(candles, candles5m) {
  const closes=candles.map(c=>parseFloat(c.close));
  const price=closes[closes.length-1];
  const ema8=calcEMA(closes,8), ema21=calcEMA(closes,21);
  const ema50=calcEMA(closes.slice(-60),50);
  const ema200=calcEMA(closes,Math.min(200,closes.length));
  const rsi=calcRSI(closes);
  const atr=calcATR(candles);
  const atrPct=atr/price;

  if (atrPct>0.008) return null;
  const emaBull=ema8>ema21&&ema21>ema50;
  const emaBear=ema8<ema21&&ema21<ema50;
  if (!emaBull&&!emaBear) return null;
  if (emaBull&&price<ema200) return null;
  if (emaBear&&price>ema200) return null;
  if (rsi>75||rsi<25) return null;

  let trend5m=0;
  if (candles5m.length>=30) {
    const c5=candles5m.map(c=>parseFloat(c.close));
    const e20=calcEMA(c5,20), e50b=calcEMA(c5,50), r5=calcRSI(c5);
    trend5m=e20>e50b&&r5>50?1:e20<e50b&&r5<50?-1:0;
  }

  let bull=0, bear=0;
  if (emaBull) bull+=3; else bear+=3;
  if (rsi<50)  bull+=2; else bear+=2;
  if (trend5m===1) bull+=3; else if (trend5m===-1) bear+=3;
  const net=bull-bear;
  if (Math.abs(net)<4) return null;

  const action=net>0?"BUY":"SELL";
  const confidence=Math.min(Math.round(Math.abs(net)/11*100),95);
  // SL = 1.5×ATR (Round 4 fix), TP = 2×ATR
  return { action, confidence, atr, sl_mult:1.5, tp_mult:2.0, window:3 };
}

// ══════════════════════════════════════════════════════════════
// SIGNAL B — R_75
// BB + StochRSI bounce — 58% WR in backtest_v4
// ══════════════════════════════════════════════════════════════
function r75Signal(candles) {
  const closes=candles.map(c=>parseFloat(c.close));
  const price=closes[closes.length-1];
  const prev=closes[closes.length-2];
  const atr=calcATR(candles);
  const rsi=calcRSI(closes);
  const bb=calcBB(closes);
  const stoch=calcStochRSI(closes);

  const bouncingUp  =price>prev&&price<bb.mid;
  const bouncingDown=price<prev&&price>bb.mid;

  if (price<=bb.lower*1.002&&stoch<20&&bouncingUp&&rsi<40)
    return { action:"BUY",  confidence:Math.min(84,68+Math.round(20-stoch)), atr, sl_mult:1.5, tp_mult:1.5, window:5 };
  if (price>=bb.upper*0.998&&stoch>80&&bouncingDown&&rsi>60)
    return { action:"SELL", confidence:Math.min(84,68+Math.round(stoch-80)), atr, sl_mult:1.5, tp_mult:1.5, window:5 };
  return null;
}

// ══════════════════════════════════════════════════════════════
// SIGNAL C — Original EMA signal for all other symbols
// Used as ML baseline proxy — shows what TA gives before ML boost
// Live bot uses ML models for these (not this TA signal)
// ══════════════════════════════════════════════════════════════
function emaSignal(candles, candles5m) {
  const closes=candles.map(c=>parseFloat(c.close));
  const price=closes[closes.length-1];
  const ema8=calcEMA(closes,8), ema21=calcEMA(closes,21);
  const ema50=calcEMA(closes.slice(-60),50);
  const ema200=calcEMA(closes,Math.min(200,closes.length));
  const rsi=calcRSI(closes);
  const atr=calcATR(candles);
  const atrPct=atr/price;

  if (atrPct>0.008) return null;
  const emaBull=ema8>ema21&&ema21>ema50;
  const emaBear=ema8<ema21&&ema21<ema50;
  if (!emaBull&&!emaBear) return null;
  if (emaBull&&price<ema200) return null;
  if (emaBear&&price>ema200) return null;
  if (rsi>75||rsi<25) return null;

  let trend5m=0;
  if (candles5m.length>=30) {
    const c5=candles5m.map(c=>parseFloat(c.close));
    trend5m=calcEMA(c5,20)>calcEMA(c5,50)&&calcRSI(c5)>50?1
           :calcEMA(c5,20)<calcEMA(c5,50)&&calcRSI(c5)<50?-1:0;
  }
  let bull=0, bear=0;
  if (emaBull) bull+=3; else bear+=3;
  if (rsi<50)  bull+=2; else bear+=2;
  if (trend5m===1) bull+=3; else if (trend5m===-1) bear+=3;
  const net=bull-bear;
  if (Math.abs(net)<4) return null;
  return { action:net>0?"BUY":"SELL",
    confidence:Math.min(Math.round(Math.abs(net)/11*100),95),
    atr, sl_mult:1.0, tp_mult:2.0, window:5 };
}

function getSignal(candles, candles5m=[], symbol="") {
  if (candles.length<60) return null;
  if (symbol.startsWith("BOOM")||symbol.startsWith("CRASH"))
    return boomCrashSignal(candles, candles5m);
  if (symbol==="R_75")
    return r75Signal(candles);
  return emaSignal(candles, candles5m);
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

async function backtest(symbol, granularity=60, count=1500, minConf=60, label="") {
  console.log(`\n📊 ${symbol} ${label}...`);
  const [candles, c5m]=await Promise.all([
    fetchCandles(symbol, granularity, count),
    fetchCandles(symbol, 300, Math.floor(count/5))
  ]);
  if (candles.length<100) { console.log("❌ No data"); return null; }
  console.log(`✅ ${candles.length} candles`);

  const PAYOUT=0.95, STAKE=1;
  let balance=100;
  const equity=[balance], rets=[];
  let wins=0,losses=0,holds=0,grossW=0,grossL=0,maxCL=0,cl=0;

  for (let i=60; i<candles.length-25; i++) {
    const sig=getSignal(candles.slice(0,i), c5m.slice(0,Math.floor(i/5)), symbol);
    if (!sig||sig.confidence<minConf) { holds++; equity.push(balance); continue; }

    const W=sig.window||5;
    if (i+W>=candles.length) continue;

    const entry=parseFloat(candles[i].close);
    const atr=sig.atr||entry*0.002;
    const tp=sig.action==="BUY"?entry+atr*sig.tp_mult:entry-atr*sig.tp_mult;
    const sl=sig.action==="BUY"?entry-atr*sig.sl_mult:entry+atr*sig.sl_mult;

    let won=false, resolved=false;
    for (let j=i+1;j<=i+W;j++) {
      const h=parseFloat(candles[j].high), l=parseFloat(candles[j].low);
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
  if (!total) { console.log("❌ No trades"); return null; }

  const wr=wins/total, pnl=balance-100;
  const sharpe=calcSharpe(rets), maxDD=calcMaxDD(equity);
  const pf=grossL>0?grossW/grossL:grossW>0?99:0;
  const exp=(wr*PAYOUT)-((1-wr));
  const grade=sharpe>=1.5&&maxDD<0.15&&wr>=0.55?"🟢 STRONG"
            :sharpe>=0.8&&maxDD<0.25&&wr>=0.50?"🟡 MODERATE":"🔴 WEAK";

  console.log(`   Trades:${total} Wins:${wins} Losses:${losses} Held:${holds}`);
  console.log(`   Win Rate:     ${(wr*100).toFixed(1)}%`);
  console.log(`   PnL:          $${pnl.toFixed(2)}`);
  console.log(`   Sharpe:       ${sharpe.toFixed(2)}`);
  console.log(`   Max Drawdown: ${(maxDD*100).toFixed(1)}%`);
  console.log(`   Profit Factor:${pf.toFixed(2)}`);
  console.log(`   Expectancy:   $${exp.toFixed(3)}`);
  console.log(`   Max Consec L: ${maxCL}`);
  console.log(`   Verdict:      ${grade}`);

  return { symbol, total, wins, losses, winRate:+(wr*100).toFixed(1),
    pnl:+pnl.toFixed(2), sharpe:+sharpe.toFixed(2),
    maxDD:+(maxDD*100).toFixed(1), pf:+pf.toFixed(2),
    exp:+exp.toFixed(4), maxCL, grade, label };
}

function printSummary(results) {
  const v=results.filter(Boolean);
  console.log("\n"+"═".repeat(88));
  console.log("TIMI DEFINITIVE BACKTEST — What's Actually Running Live");
  console.log("═".repeat(88));
  console.log("Symbol".padEnd(16)+"Strategy".padEnd(22)+"WinRate".padStart(8)
    +"Sharpe".padStart(8)+"MaxDD%".padStart(8)+"PF".padStart(6)+"  Verdict");
  console.log("─".repeat(88));
  v.sort((a,b)=>b.sharpe-a.sharpe).forEach(r=>
    console.log(r.symbol.padEnd(16)+r.label.padEnd(22)+`${r.winRate}%`.padStart(8)
      +`${r.sharpe}`.padStart(8)+`${r.maxDD}%`.padStart(8)+`${r.pf}`.padStart(6)
      +"  "+r.grade));
  console.log("═".repeat(88));

  const strong=v.filter(r=>r.grade.includes("STRONG"));
  const mod   =v.filter(r=>r.grade.includes("MODERATE"));
  const weak  =v.filter(r=>r.grade.includes("WEAK"));
  console.log(`\n🟢 STRONG  (${strong.length}): ${strong.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`🟡 MODERATE(${mod.length}): ${mod.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`🔴 WEAK    (${weak.length}): ${weak.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`\n💡 Note: Forex/Gold/Crypto show TA baseline only.`);
  console.log(`   Live bot uses ML ensemble models for those — expect higher WR live.`);
}

async function main() {
  console.log("🔬 TIMI DEFINITIVE BACKTEST v5.0\n");
  console.log("Testing each symbol with the EXACT strategy running live.\n");

  const symbols=[
    // BOOM/CRASH — original EMA signal, SL 1.5×ATR, 3 candle window
    {sym:"BOOM1000",  gran:60,  label:"EMA+SL1.5x (live)"},
    {sym:"BOOM500",   gran:60,  label:"EMA+SL1.5x (live)"},
    {sym:"CRASH1000", gran:60,  label:"EMA+SL1.5x (live)"},
    {sym:"CRASH500",  gran:60,  label:"EMA+SL1.5x (live)"},
    // R_75 — BB+StochRSI, 5 candle window
    {sym:"R_75",      gran:60,  label:"BB+StochRSI (live)"},
    // Others — TA baseline (ML runs these live, TA = floor estimate)
    {sym:"R_50",      gran:60,  label:"EMA baseline (ML live)"},
    {sym:"frxEURUSD", gran:300, label:"EMA baseline (ML live)"},
    {sym:"frxGBPUSD", gran:300, label:"EMA baseline (ML live)"},
    {sym:"frxUSDJPY", gran:300, label:"EMA baseline (ML live)"},
    {sym:"frxXAUUSD", gran:300, label:"EMA baseline (ML live)"},
    {sym:"cryBTCUSD", gran:300, label:"EMA baseline (ML live)"},
  ];

  const results=[];
  for (const {sym,gran,label} of symbols) {
    try { results.push(await backtest(sym,gran,1500,60,label)); }
    catch(e) { console.error(`Error ${sym}:`,e.message); results.push(null); }
  }
  printSummary(results);
}
main().catch(console.error);
