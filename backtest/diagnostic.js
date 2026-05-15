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
  const k = 2 / (period + 1); let ema = prices[0];
  for (let i = 1; i < prices.length; i++) ema = prices[i]*k + ema*(1-k);
  return ema;
}
function calcRSI(prices, period = 14) {
  if (prices.length < period+1) return 50;
  let g=0, l=0;
  for (let i = prices.length-period; i < prices.length; i++) {
    const d = prices[i]-prices[i-1]; if(d>0) g+=d; else l-=d;
  }
  return 100 - 100/(1+g/(l||0.0001));
}
function calcATR(candles, period=14) {
  const s = candles.slice(-period);
  const trs = s.map((c,i) => {
    const pc = i>0?parseFloat(s[i-1].close):parseFloat(c.close);
    return Math.max(parseFloat(c.high)-parseFloat(c.low),
      Math.abs(parseFloat(c.high)-pc), Math.abs(parseFloat(c.low)-pc));
  });
  return trs.reduce((a,b)=>a+b,0)/trs.length;
}

// EXACT original signal from round 2 backtest that gave 66/73% WR
function getSignal(candles, candles5m=[]) {
  if (candles.length < 50) return { action:"HOLD", confidence:0 };
  const closes = candles.map(c=>parseFloat(c.close));
  const price  = closes[closes.length-1];
  const ema8   = calcEMA(closes, 8);
  const ema21  = calcEMA(closes, 21);
  const ema50  = calcEMA(closes.slice(-60), 50);
  const ema200 = calcEMA(closes, Math.min(200, closes.length));
  const rsi    = calcRSI(closes);
  const atr    = calcATR(candles);
  const atrPct = atr/price;
  if (atrPct > 0.008) return { action:"HOLD", confidence:0, reason:"high_vol" };
  const emaBull = ema8>ema21 && ema21>ema50;
  const emaBear = ema8<ema21 && ema21<ema50;
  if (!emaBull && !emaBear) return { action:"HOLD", confidence:0, reason:"ema_unaligned" };
  if (emaBull && price<ema200) return { action:"HOLD", confidence:0, reason:"below_ema200" };
  if (emaBear && price>ema200) return { action:"HOLD", confidence:0, reason:"above_ema200" };
  if (rsi>75||rsi<25) return { action:"HOLD", confidence:0, reason:"rsi_extreme" };
  let trend5m=0;
  if (candles5m.length>=30) {
    const c5=candles5m.map(c=>parseFloat(c.close));
    const e20=calcEMA(c5,20), e50b=calcEMA(c5,50), r5=calcRSI(c5);
    trend5m = e20>e50b&&r5>50?1:e20<e50b&&r5<50?-1:0;
  }
  let bull=0, bear=0;
  if (emaBull) bull+=3; else bear+=3;
  if (rsi<50)  bull+=2; else bear+=2;
  if (trend5m===1) bull+=3; else if (trend5m===-1) bear+=3;
  const net=bull-bear;
  if (Math.abs(net)<4) return { action:"HOLD", confidence:0, reason:"weak_signal" };
  const action = net>0?"BUY":"SELL";
  const confidence = Math.min(Math.round(Math.abs(net)/11*100),95);
  return { action, confidence, atr, atrPct };
}

// Test one symbol across multiple outcome windows to find the sweet spot
async function diagnose(symbol, granularity=60, count=1500) {
  console.log(`\n🔬 Diagnosing ${symbol}...`);
  const [candles, candles5m] = await Promise.all([
    fetchCandles(symbol, granularity, count),
    fetchCandles(symbol, 300, Math.floor(count/5))
  ]);
  if (candles.length < 100) { console.log("❌ No data"); return; }
  console.log(`✅ ${candles.length} candles`);

  const PAYOUT=0.95, STAKE=1;
  const windows = [3, 5, 8, 10, 15, 20];

  // Collect all signals first
  const trades = [];
  for (let i=60; i<candles.length-25; i++) {
    const sig = getSignal(candles.slice(0,i), candles5m.slice(0,Math.floor(i/5)));
    if (sig.action==="HOLD" || sig.confidence<60) continue;
    trades.push({ i, sig, entry: parseFloat(candles[i].close), atr: sig.atr });
  }
  console.log(`   Total signals: ${trades.length}`);

  // Test each outcome window
  console.log(`\n   Window  Trades  WinRate    PnL    Sharpe  Grade`);
  console.log(`   ─────────────────────────────────────────────────`);

  for (const W of windows) {
    let wins=0, losses=0, balance=100;
    const rets=[];
    for (const { i, sig, entry, atr } of trades) {
      if (i+W >= candles.length) continue;
      const tp = sig.action==="BUY" ? entry+atr*2 : entry-atr*2;
      const sl = sig.action==="BUY" ? entry-atr   : entry+atr;
      let won=false, resolved=false;
      for (let j=i+1; j<=i+W; j++) {
        const h=parseFloat(candles[j].high), l=parseFloat(candles[j].low);
        if (sig.action==="BUY")  { if(l<=sl){won=false;resolved=true;break;} if(h>=tp){won=true;resolved=true;break;} }
        else                      { if(h>=sl){won=false;resolved=true;break;} if(l<=tp){won=true;resolved=true;break;} }
      }
      if (!resolved) { const fc=parseFloat(candles[i+W].close); won=sig.action==="BUY"?fc>entry:fc<entry; }
      const pnl=won?STAKE*PAYOUT:-STAKE;
      balance=Math.max(0,balance+pnl);
      rets.push(pnl/STAKE);
      if(won) wins++; else losses++;
    }
    const total=wins+losses;
    if(!total) continue;
    const wr=(wins/total*100).toFixed(1);
    const pnl=(balance-100).toFixed(2);
    const mean=rets.reduce((a,b)=>a+b,0)/rets.length;
    const std=Math.sqrt(rets.reduce((a,b)=>a+Math.pow(b-mean,2),0)/rets.length)||0.001;
    const sharpe=((mean/std)*Math.sqrt(252*24*60/rets.length)).toFixed(2);
    const grade = parseFloat(sharpe)>1.5&&parseFloat(wr)>55?"✅ GOOD"
                : parseFloat(sharpe)>0.5&&parseFloat(wr)>50?"🟡 OK":"❌ BAD";
    console.log(`   ${String(W+" candles").padEnd(8)} ${String(total).padStart(6)}  ${wr.padStart(6)}%  $${pnl.padStart(7)}  ${sharpe.padStart(6)}  ${grade}`);
  }

  // Loss pattern analysis — what's causing losses
  console.log(`\n   📊 Loss pattern analysis (window=5):`);
  let hitSL=0, expiredAgainst=0, expiredFor=0;
  for (const { i, sig, entry, atr } of trades.slice(0,200)) {
    if (i+5 >= candles.length) continue;
    const tp=sig.action==="BUY"?entry+atr*2:entry-atr*2;
    const sl=sig.action==="BUY"?entry-atr:entry+atr;
    let outcome="expired";
    for (let j=i+1; j<=i+5; j++) {
      const h=parseFloat(candles[j].high), l=parseFloat(candles[j].low);
      if (sig.action==="BUY")  { if(l<=sl){outcome="hit_sl";break;} if(h>=tp){outcome="hit_tp";break;} }
      else                      { if(h>=sl){outcome="hit_sl";break;} if(l<=tp){outcome="hit_tp";break;} }
    }
    if (outcome==="hit_sl") hitSL++;
    else if (outcome==="expired") {
      const fc=parseFloat(candles[i+5].close);
      if ((sig.action==="BUY"&&fc>entry)||(sig.action==="SELL"&&fc<entry)) expiredFor++;
      else expiredAgainst++;
    }
  }
  const analyzed=hitSL+expiredAgainst+expiredFor;
  console.log(`   Hit SL:          ${hitSL} (${(hitSL/analyzed*100).toFixed(0)}%) — SL too tight?`);
  console.log(`   Expired for us:  ${expiredFor} (${(expiredFor/analyzed*100).toFixed(0)}%) — direction correct, TP too far`);
  console.log(`   Expired against: ${expiredAgainst} (${(expiredAgainst/analyzed*100).toFixed(0)}%) — wrong direction`);
  console.log(`\n   ➡️  Diagnosis:`);
  if (hitSL/analyzed > 0.4)
    console.log(`   SL is too tight (${(hitSL/analyzed*100).toFixed(0)}% of losses). Try SL=1.5×ATR or 2×ATR`);
  if (expiredFor/analyzed > 0.3)
    console.log(`   TP is too far (${(expiredFor/analyzed*100).toFixed(0)}% expire with correct direction). Try TP=1×ATR or 1.5×ATR`);
  if (expiredAgainst/analyzed > 0.4)
    console.log(`   Signal direction wrong (${(expiredAgainst/analyzed*100).toFixed(0)}% wrong direction). Strategy needs rethink for this symbol.`);
}

async function main() {
  console.log("🩺 TIMI DIAGNOSTIC v1.0 — Finding optimal settings per symbol\n");
  await diagnose("BOOM1000", 60,  1500);
  await diagnose("CRASH1000", 60, 1500);
  await diagnose("R_75",  60, 1500);
  await diagnose("R_50",  60, 1500);
  await diagnose("frxEURUSD", 300, 1500);
  await diagnose("frxXAUUSD", 300, 1500);
}
main().catch(console.error);
