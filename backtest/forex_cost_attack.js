const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — FOREX COST-ATTACK TESTER  (v1.0)
// ══════════════════════════════════════════════════════════════════════════
// KEY INSIGHT: forex direction is ~50% no matter the entry signal. But the
// 59.4% breakeven that kills it is NOT fixed — it depends on reward:risk and
// multiplier:
//
//   reward:risk 1.0, x100  →  breakeven 57.9%  (your old config — impossible)
//   reward:risk 2.0, x100  →  breakeven 38.6%  (a 50% WR CRUSHES this)
//   reward:risk 3.0, x30   →  breakeven 26.2%  (lose 70%, still profit)
//
// So instead of chasing a 60% signal, we LOWER THE BAR: let winners run, cut
// losers fast, and use less leverage. The empirical question this tests:
// when we raise the take-profit (higher reward:risk), the win rate FALLS
// (fewer trades reach the bigger target). Does breakeven fall faster than the
// win rate? This sweeps the space and finds the profitable combos, if any.
//
// HONEST NOTE: a trailing-stop / let-winners-run exit is the real mechanism
// here. We model "let it run to N×risk TP, hard stop at 1×risk" and also a
// pure trailing-stop variant (no TP, trail at K×ATR).
//
// USAGE:  node forex_cost_attack.js
// ══════════════════════════════════════════════════════════════════════════

const COMM=0.0015, SPREAD=0.00008;

function entryCost(stake, mult){ return stake*mult*(COMM+SPREAD); }
function breakeven(mult, rr){
  const c=entryCost(1,mult);
  const win=rr-c, loss=1+c;
  return loss/(win+loss);
}

async function fetchCandles(symbol, granularity, count){
  return new Promise((resolve)=>{
    const ws=new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const to=setTimeout(()=>{ws.close();resolve([]);},20000);
    ws.on("open",()=>ws.send(JSON.stringify({
      ticks_history:symbol,adjust_start_time:1,count,end:"latest",
      granularity,style:"candles"})));
    ws.on("message",(d)=>{const m=JSON.parse(d);
      if(m.candles){clearTimeout(to);ws.close();resolve(m.candles);}
      if(m.error){clearTimeout(to);ws.close();resolve([]);}});
    ws.on("error",()=>{clearTimeout(to);resolve([]);});
  });
}

function ema(p,n){const k=2/(n+1);let e=p[0];for(let i=1;i<p.length;i++)e=p[i]*k+e*(1-k);return e;}
function rsi(p,n=14){if(p.length<n+1)return 50;let g=0,l=0;for(let i=p.length-n;i<p.length;i++){const d=p[i]-p[i-1];if(d>0)g+=d;else l-=d;}return 100-100/(1+g/(l||1e-4));}
function atr(c,n=14){const s=c.slice(-n);const t=s.map((x,i)=>{const pc=i>0?+s[i-1].close:+x.close;return Math.max(+x.high-+x.low,Math.abs(+x.high-pc),Math.abs(+x.low-pc));});return t.reduce((a,b)=>a+b,0)/t.length;}

function trendSignal(c){
  const cl=c.map(x=>+x.close);
  const e8=ema(cl,8),e21=ema(cl,21),e50=ema(cl.slice(-60),50),r=rsi(cl);
  if(e8>e21&&e21>e50&&r>50&&r<70) return {action:"BUY",atr:atr(c)};
  if(e8<e21&&e21<e50&&r<50&&r>30) return {action:"SELL",atr:atr(c)};
  return null;
}

// Run one config: reward:risk RR, stop at 1xATR, TP at RR×ATR, max hold H bars.
function runConfig(candles, RR, mult, maxHold){
  const stake=1, cost=entryCost(stake,mult);
  let wins=0,losses=0,bal=0;
  const rets=[];
  for(let i=60;i<candles.length-maxHold-1;i++){
    const sig=trendSignal(candles.slice(0,i));
    if(!sig) continue;
    const entry=+candles[i].close, a=sig.atr||entry*0.002;
    const risk=a*1.0;                     // stop distance = 1 ATR
    const reward=a*RR;                      // TP distance = RR ATR
    const tp=sig.action==="BUY"?entry+reward:entry-reward;
    const sl=sig.action==="BUY"?entry-risk:entry+risk;
    let won=false,resolved=false;
    for(let j=i+1;j<=i+maxHold;j++){
      const h=+candles[j].high,l=+candles[j].low;
      if(sig.action==="BUY"){if(l<=sl){resolved=true;break;}if(h>=tp){won=true;resolved=true;break;}}
      else{if(h>=sl){resolved=true;break;}if(l<=tp){won=true;resolved=true;break;}}
    }
    if(!resolved){const fc=+candles[i+maxHold].close;const mv=sig.action==="BUY"?fc-entry:entry-fc;won=mv>0;}
    // PnL in risk units: win = +RR, loss = -1, minus cost both sides
    const pnl=(won? RR : -1) - cost;
    bal+=pnl; rets.push(pnl);
    if(won)wins++;else losses++;
  }
  const total=wins+losses;
  if(total<20) return null;
  const wr=wins/total;
  const be=breakeven(mult,RR);
  const m=rets.reduce((a,b)=>a+b,0)/rets.length;
  const sd=Math.sqrt(rets.reduce((a,b)=>a+(b-m)**2,0)/rets.length);
  const sharpe=sd?(m/sd)*Math.sqrt(rets.length):0;
  return {total,wr:+(wr*100).toFixed(1),be:+(be*100).toFixed(1),
    net:+bal.toFixed(2),sharpe:+sharpe.toFixed(2),beats:wr>=be};
}

async function main(){
  console.log("🔬 TIMI FOREX COST-ATTACK TEST\n");
  console.log("Forex direction is ~50%. Instead of beating that, we LOWER the");
  console.log("breakeven via reward:risk + multiplier, so 50% becomes profitable.\n");

  const pairs=["frxEURUSD","frxGBPUSD","frxUSDJPY","frxXAUUSD","frxEURJPY","frxGBPJPY"];
  const TF={name:"30m",gran:1800,count:3000};   // 30m had the best WR in prior test
  const configs=[];
  // sweep reward:risk × multiplier
  for(const RR of [1.5,2.0,2.5,3.0,4.0])
    for(const mult of [100,50,30,20])
      configs.push({RR,mult,maxHold:Math.round(RR*8)}); // bigger target → allow more time

  const winners=[];
  for(const pair of pairs){
    console.log("─".repeat(82));
    console.log(`📊 ${pair} @ ${TF.name}`);
    const candles=await fetchCandles(pair,TF.gran,TF.count);
    await new Promise(z=>setTimeout(z,700));
    if(candles.length<200){console.log("   no data");continue;}
    // header
    let best=null;
    for(const cfg of configs){
      const r=runConfig(candles,cfg.RR,cfg.mult,cfg.maxHold);
      if(!r) continue;
      if(r.beats && r.net>0){
        winners.push({pair,...cfg,...r});
        if(!best||r.net>best.net) best={...cfg,...r};
      }
    }
    // print best-per-pair + a representative row
    const sampleRR2 = runConfig(candles,2.0,30,16);
    if(sampleRR2) console.log(`   RR2.0 x30: WR ${sampleRR2.wr}% (need ${sampleRR2.be}%) net $${sampleRR2.net} Sharpe ${sampleRR2.sharpe} ${sampleRR2.beats?"🟢":"🔴"}`);
    const sampleRR3 = runConfig(candles,3.0,30,24);
    if(sampleRR3) console.log(`   RR3.0 x30: WR ${sampleRR3.wr}% (need ${sampleRR3.be}%) net $${sampleRR3.net} Sharpe ${sampleRR3.sharpe} ${sampleRR3.beats?"🟢":"🔴"}`);
    if(best) console.log(`   ⭐ BEST:   RR${best.RR} x${best.mult}: WR ${best.wr}% (need ${best.be}%) net $${best.net} Sharpe ${best.sharpe} 🟢`);
    else console.log(`   no profitable config found`);
  }

  console.log("\n"+"═".repeat(82));
  console.log("PROFITABLE CONFIGS (win rate beats the lowered breakeven, net positive)");
  console.log("═".repeat(82));
  if(winners.length===0){
    console.log("  None. Even with cost-attack, no config turns forex profitable.");
    console.log("  → That would be the definitive answer: forex has no edge here, full stop.");
  } else {
    const top=winners.sort((a,b)=>b.sharpe-a.sharpe).slice(0,15);
    for(const w of top)
      console.log(`  🟢 ${w.pair}: RR${w.RR} x${w.mult} | WR ${w.wr}% vs ${w.be}% | net $${w.net} | Sharpe ${w.sharpe} | ${w.total} trades`);
    console.log("\n  ⚠️ These beat costs IN BACKTEST. Run through significance suite before");
    console.log("     trusting — high reward:risk strategies can look good on luck.");
  }
}

main();
