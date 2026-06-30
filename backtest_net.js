const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI BACKTEST — NET OF COSTS  (v6.0)
// ══════════════════════════════════════════════════════════════════════════
// This is backtest_definitive.js with ONE change that matters: it subtracts
// the REAL Deriv trading cost from every trade, then shows you GROSS vs NET
// side by side — so you can see which "STRONG" edges are actually losers once
// the breakeven hurdle is paid.
//
// The signal logic is IDENTICAL to the live-proxy backtester. Nothing about
// how trades are generated or resolved changed. Only the PnL accounting did.
//
// WHY THIS EXISTS
// ---------------
// The old backtester scored:  win = +STAKE*0.95,  loss = -STAKE   (cost = 0)
// Reality on a x100 MULT contract: every trade pays commission on the
// leveraged notional (stake*multiplier), win OR lose. On synthetics that
// pushes the breakeven win rate well above 50% (BOOM ≈ 57.5% at 0.15% comm).
// A strategy winning 54% looks profitable gross and bleeds money net.
//
// ══════════════════════════════════════════════════════════════════════════
// COST ASSUMPTIONS — TUNE THESE TO YOUR REAL DERIV RECEIPTS
// ══════════════════════════════════════════════════════════════════════════
// These mirror phase0_data_quality.py. The defaults are ESTIMATES. Pull one
// real BOOM/CRASH contract receipt, find the commission charged, and set
// MULT_COMMISSION_PCT to (commission / (stake * multiplier)). Until you do,
// treat the NET numbers as "directionally right, not exact."
const MULTIPLIER          = 100;       // dynMultiplier default from placeTrade()
const MULT_COMMISSION_PCT = 0.0015;    // 0.15% of leveraged notional (ASSUMPTION)
const FOREX_SPREAD_PCT    = 0.00008;   // ~0.8 pip on majors (ASSUMPTION)
const CRYPTO_SPREAD_PCT   = 0.0005;    // ~5 bps (ASSUMPTION)
const VIX_PAYOUT          = 1.85;      // CALL/PUT: win = +0.85*stake (matches code)

// ── instrument classification (mirrors placeTrade routing) ──
function classify(symbol) {
  if (symbol.startsWith("BOOM") || symbol.startsWith("CRASH")) return "spike";
  if (symbol.startsWith("JD"))   return "jump";
  if (symbol.startsWith("R_") || symbol.startsWith("1HZ")) return "vix";
  if (symbol.startsWith("frx"))  return "forex";
  if (symbol.startsWith("cry"))  return "crypto";
  return "unknown";
}

// ── the real cost to OPEN one position, in $ (charged win or lose) ──
function entryCost(symbol, stake) {
  const cls = classify(symbol);
  const isMult = cls === "spike" || cls === "jump" || cls === "forex" || cls === "crypto";
  if (!isMult) return 0; // CALL/PUT: cost is in the payout, handled in pnl below
  const notional = stake * MULTIPLIER;
  const commission = notional * MULT_COMMISSION_PCT;
  const spreadPct = cls === "forex" ? FOREX_SPREAD_PCT
                  : cls === "crypto" ? CRYPTO_SPREAD_PCT : 0;
  const spreadCost = notional * spreadPct;
  return commission + spreadCost;
}

// ── breakeven win rate after costs (the hurdle each edge must beat) ──
function breakevenWR(symbol, stake) {
  const cls = classify(symbol);
  if (cls === "vix") {
    const w = stake * (VIX_PAYOUT - 1), l = stake;
    return l / (w + l);
  }
  const cost = entryCost(symbol, stake);
  const netWin = stake * 0.95 - cost;   // gross win minus cost
  const netLoss = stake + cost;          // gross loss plus cost
  return netLoss / (netWin + netLoss);
}

// ══════════════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════════════════
// INDICATORS  (identical to backtest_definitive.js)
// ══════════════════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════════════════
// SIGNALS  (identical logic to live-proxy backtester)
// ══════════════════════════════════════════════════════════════════════════
function boomCrashSignal(candles, candles5m, symbol) {
  const closes=candles.map(c=>parseFloat(c.close));
  const price=closes[closes.length-1];
  const ema8=calcEMA(closes,8), ema21=calcEMA(closes,21);
  const ema50=calcEMA(closes.slice(-60),50);
  const rsi=calcRSI(closes);
  const atr=calcATR(candles);
  const atrPct=atr/price;
  if (atrPct>0.008) return null;

  const isBoom = symbol.startsWith("BOOM");
  // BOOM spikes up → fade short after spike; CRASH spikes down → fade long.
  const trendUp = ema8>ema21 && ema21>ema50;
  const trendDn = ema8<ema21 && ema21<ema50;
  let action=null, conf=0;
  if (isBoom && trendDn && rsi<45) { action="SELL"; conf=70+(45-rsi); }
  if (!isBoom && trendUp && rsi>55){ action="BUY";  conf=70+(rsi-55); }
  if (!action) return null;
  return { action, confidence:Math.min(95,conf), atr,
           tp_mult:1.0, sl_mult:1.5, window:3 };
}

function r75Signal(candles) {
  const closes=candles.map(c=>parseFloat(c.close));
  const price=closes[closes.length-1];
  const bb=calcBB(closes), srsi=calcStochRSI(closes), atr=calcATR(candles);
  let action=null, conf=0;
  if (price<=bb.lower && srsi<20) { action="BUY";  conf=65+(20-srsi); }
  if (price>=bb.upper && srsi>80) { action="SELL"; conf=65+(srsi-80); }
  if (!action) return null;
  return { action, confidence:Math.min(95,conf), atr,
           tp_mult:1.5, sl_mult:1.5, window:5 };
}

function getSignal(candles, candles5m, symbol) {
  const cls=classify(symbol);
  if (cls==="spike") return boomCrashSignal(candles, candles5m, symbol);
  if (cls==="vix")   return r75Signal(candles);
  // forex/crypto/jump: TA baseline proxy (live uses ML) — reuse boom/crash EMA
  return boomCrashSignal(candles, candles5m, symbol.startsWith("CRASH")?symbol:"BOOMX");
}

// ══════════════════════════════════════════════════════════════════════════
// METRICS
// ══════════════════════════════════════════════════════════════════════════
function calcSharpe(rets) {
  if (rets.length<2) return 0;
  const m=rets.reduce((a,b)=>a+b,0)/rets.length;
  const sd=Math.sqrt(rets.reduce((a,b)=>a+Math.pow(b-m,2),0)/rets.length);
  return sd===0?0:(m/sd)*Math.sqrt(rets.length);
}
function calcMaxDD(equity) {
  let peak=equity[0], maxDD=0;
  for (const e of equity) { if(e>peak)peak=e; const dd=(peak-e)/peak; if(dd>maxDD)maxDD=dd; }
  return maxDD;
}

// ══════════════════════════════════════════════════════════════════════════
// BACKTEST — runs the SAME sim twice's worth of accounting: gross & net
// ══════════════════════════════════════════════════════════════════════════
async function backtest(symbol, granularity=60, count=1500, minConf=60, label="") {
  console.log(`\n📊 ${symbol} ${label}...`);
  const [candles, c5m]=await Promise.all([
    fetchCandles(symbol, granularity, count),
    fetchCandles(symbol, 300, Math.floor(count/5))
  ]);
  if (candles.length<100) { console.log("❌ No data"); return null; }
  console.log(`✅ ${candles.length} candles`);

  const STAKE=1;
  const cls=classify(symbol);
  const cost=entryCost(symbol, STAKE);
  const beWR=breakevenWR(symbol, STAKE);

  // gross & net run in parallel off the SAME trades
  let gBal=100, nBal=100;
  const gEquity=[gBal], nEquity=[nBal], gRets=[], nRets=[];
  let wins=0, losses=0, holds=0, grossW=0, grossL=0, maxCL=0, cl=0;
  const tradeLog=[];

  for (let i=60; i<candles.length-25; i++) {
    const sig=getSignal(candles.slice(0,i), c5m.slice(0,Math.floor(i/5)), symbol);
    if (!sig||sig.confidence<minConf) { holds++; gEquity.push(gBal); nEquity.push(nBal); continue; }

    const W=sig.window||5;
    if (i+W>=candles.length) continue;

    const entry=parseFloat(candles[i].close);
    const atr=sig.atr||entry*0.002;
    const tp=sig.action==="BUY"?entry+atr*sig.tp_mult:entry-atr*sig.tp_mult;
    const sl=sig.action==="BUY"?entry-atr*sig.sl_mult:entry+atr*sig.sl_mult;

    // CONSERVATIVE intrabar resolution: SL checked before TP each candle.
    let won=false, resolved=false;
    for (let j=i+1;j<=i+W;j++) {
      const h=parseFloat(candles[j].high), l=parseFloat(candles[j].low);
      if (sig.action==="BUY")  { if(l<=sl){won=false;resolved=true;break;} if(h>=tp){won=true;resolved=true;break;} }
      else                      { if(h>=sl){won=false;resolved=true;break;} if(l<=tp){won=true;resolved=true;break;} }
    }
    if (!resolved) { const fc=parseFloat(candles[i+W].close); won=sig.action==="BUY"?fc>entry:fc<entry; }

    // GROSS pnl (old behavior)
    let gPnl, nPnl;
    if (cls==="vix") {
      // CALL/PUT: payout-based, no separate cost
      gPnl = won ? STAKE*0.95 : -STAKE;
      nPnl = won ? STAKE*(VIX_PAYOUT-1) : -STAKE;
    } else {
      gPnl = won ? STAKE*0.95 : -STAKE;
      nPnl = (won ? STAKE*0.95 : -STAKE) - cost;   // subtract real cost every trade
    }

    gBal=Math.max(0,gBal+gPnl); nBal=Math.max(0,nBal+nPnl);
    gEquity.push(gBal); nEquity.push(nBal);
    gRets.push(gPnl/STAKE); nRets.push(nPnl/STAKE);
    if(won){wins++;grossW+=STAKE*0.95;cl=0;} else {losses++;grossL+=STAKE;cl++;if(cl>maxCL)maxCL=cl;}

    tradeLog.push({ i, symbol, action:sig.action, conf:+sig.confidence.toFixed(0),
                    won, gross_pnl:+gPnl.toFixed(4), net_pnl:+nPnl.toFixed(4) });
  }

  const total=wins+losses;
  if (!total) { console.log("❌ No trades"); return null; }

  const wr=wins/total;
  const gPnL=gBal-100, nPnL=nBal-100;
  const gSharpe=calcSharpe(gRets), nSharpe=calcSharpe(nRets);
  const gDD=calcMaxDD(gEquity), nDD=calcMaxDD(nEquity);

  // verdict is now based on NET, and on whether WR beats the breakeven hurdle
  const beatsHurdle = wr >= beWR;
  const grade = !beatsHurdle ? "🔴 LOSES AFTER COSTS"
              : nSharpe>=1.5 && nDD<0.15 && wr>=0.55 ? "🟢 STRONG (net)"
              : nSharpe>=0.8 && nDD<0.25 ? "🟡 MODERATE (net)" : "🔴 WEAK (net)";

  console.log(`   Trades:${total} Wins:${wins} Losses:${losses} Held:${holds}`);
  console.log(`   Win Rate:        ${(wr*100).toFixed(1)}%   (need ${(beWR*100).toFixed(1)}% to beat costs)`);
  console.log(`   Cost/trade:      $${cost.toFixed(4)} on $${STAKE} stake`);
  console.log(`   PnL  gross→net:  $${gPnL.toFixed(2)}  →  $${nPnL.toFixed(2)}`);
  console.log(`   Sharpe gross→net:${gSharpe.toFixed(2)}  →  ${nSharpe.toFixed(2)}`);
  console.log(`   MaxDD gross→net: ${(gDD*100).toFixed(1)}%  →  ${(nDD*100).toFixed(1)}%`);
  console.log(`   Max Consec L:    ${maxCL}`);
  console.log(`   Verdict:         ${grade}`);

  return { symbol, label, total, wins, losses, winRate:+(wr*100).toFixed(1),
    breakevenWR:+(beWR*100).toFixed(1), beatsHurdle,
    grossPnL:+gPnL.toFixed(2), netPnL:+nPnL.toFixed(2),
    grossSharpe:+gSharpe.toFixed(2), netSharpe:+nSharpe.toFixed(2),
    grossDD:+(gDD*100).toFixed(1), netDD:+(nDD*100).toFixed(1),
    maxCL, grade, tradeLog };
}

// ══════════════════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════════════════
function printSummary(results) {
  const v=results.filter(Boolean);
  console.log("\n"+"═".repeat(96));
  console.log("TIMI BACKTEST — GROSS vs NET OF COSTS");
  console.log("═".repeat(96));
  console.log("Symbol".padEnd(12)+"WR%".padStart(7)+"BE%".padStart(7)+
              "grossPnL".padStart(11)+"netPnL".padStart(10)+
              "gSharpe".padStart(9)+"nSharpe".padStart(9)+"  Verdict");
  console.log("─".repeat(96));
  for (const r of v) {
    console.log(r.symbol.padEnd(12)+
      `${r.winRate}`.padStart(7)+`${r.breakevenWR}`.padStart(7)+
      `$${r.grossPnL}`.padStart(11)+`$${r.netPnL}`.padStart(10)+
      `${r.grossSharpe}`.padStart(9)+`${r.netSharpe}`.padStart(9)+"  "+r.grade);
  }
  console.log("═".repeat(96));

  const survivors = v.filter(r=>r.beatsHurdle && r.netPnL>0);
  const deaths    = v.filter(r=>!r.beatsHurdle || r.netPnL<=0);
  console.log(`\n🟢 SURVIVE costs (${survivors.length}): ${survivors.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`🔴 DIE to costs  (${deaths.length}): ${deaths.map(r=>r.symbol).join(", ")||"none"}`);
  console.log(`\n⚠️  NET numbers assume MULT_COMMISSION_PCT=${MULT_COMMISSION_PCT} (${(MULT_COMMISSION_PCT*100).toFixed(2)}%).`);
  console.log(`   Set this to your REAL Deriv commission for exact results.`);
}

// ══════════════════════════════════════════════════════════════════════════
// RUN
// ══════════════════════════════════════════════════════════════════════════
async function main() {
  console.log("🔬 TIMI BACKTEST v6.0 — NET OF COSTS\n");
  console.log("Same signals as your live-proxy backtest, but PnL is after real Deriv costs.\n");
  const symbols=[
    {sym:"BOOM1000",  gran:60, label:"spike"},
    {sym:"BOOM500",   gran:60, label:"spike"},
    {sym:"CRASH1000", gran:60, label:"spike"},
    {sym:"CRASH500",  gran:60, label:"spike"},
    {sym:"R_75",      gran:60, label:"vix"},
    {sym:"R_50",      gran:60, label:"vix"},
    {sym:"R_100",     gran:60, label:"vix"},
  ];
  const results=[];
  for (const {sym,gran,label} of symbols) {
    try { results.push(await backtest(sym, gran, 1500, 60, label)); }
    catch(e) { console.error(`Error ${sym}:`, e.message); results.push(null); }
  }
  printSummary(results);

  // dump trade logs for the statistical significance suite
  const fs=require("fs");
  const allTrades=results.filter(Boolean).flatMap(r=>r.tradeLog);
  fs.writeFileSync("backtest_trades.json", JSON.stringify(allTrades, null, 2));
  console.log(`\n💾 ${allTrades.length} trades → backtest_trades.json (feed to significance suite)`);
}

main();
