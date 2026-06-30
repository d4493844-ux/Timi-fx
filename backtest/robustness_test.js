const WebSocket = require("ws");
const fs = require("fs");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — MULTI-WINDOW ROBUSTNESS TEST  (v1.0)
// ══════════════════════════════════════════════════════════════════════════
// Every 🟢 edge we found passed on ONE recent ~60-day window. This tests
// whether they hold across SEVERAL historical windows (different market
// regimes). An edge that's real survives multiple periods; one that fit a
// lucky window falls apart on older data.
//
// METHOD: for each winner (symbol + its winning config), fetch several
// non-overlapping historical windows by setting `end` to past timestamps,
// run the exact same strategy, and report win rate / net / breakeven for each
// window. A robust edge is green in MOST windows, not just the latest.
//
// HONEST LIMIT: Deriv's free API has limited history for synthetics. The tool
// reports the actual date range it got per window — if a window comes back
// short or empty, that symbol just doesn't have that much history available,
// which is itself useful to know.
//
// USAGE:  node robustness_test.js
// ══════════════════════════════════════════════════════════════════════════

const COMM=0.0015;
// spread per class: forex/gold pay spread, synthetics (JD/BOOM) don't
function spreadFor(sym){ return sym.startsWith("frx")?0.00008 : 0.0; }

function entryCost(sym,stake,mult){ return stake*mult*(COMM+spreadFor(sym)); }
function breakeven(sym,mult,rr){
  const c=entryCost(sym,1,mult);
  return (1+c)/((rr-c)+(1+c));
}

// fetch a window ENDING at `endEpoch` (unix seconds). count candles back from there.
async function fetchWindow(symbol, granularity, count, endEpoch){
  return new Promise((resolve)=>{
    const ws=new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const to=setTimeout(()=>{ws.close();resolve([]);},20000);
    const req={ticks_history:symbol,adjust_start_time:1,count,granularity,style:"candles"};
    if(endEpoch) req.end=String(endEpoch); else req.end="latest";
    ws.on("open",()=>ws.send(JSON.stringify(req)));
    ws.on("message",(d)=>{const m=JSON.parse(d);
      if(m.candles){clearTimeout(to);ws.close();resolve(m.candles);}
      if(m.error){clearTimeout(to);ws.close();resolve({error:m.error.message});}});
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

function runConfig(candles, sym, RR, mult, maxHold){
  const cost=entryCost(sym,1,mult);
  let wins=0,losses=0,bal=0; const rets=[];
  for(let i=60;i<candles.length-maxHold-1;i++){
    const sig=trendSignal(candles.slice(0,i));
    if(!sig) continue;
    const entry=+candles[i].close, a=sig.atr||entry*0.002;
    const tp=sig.action==="BUY"?entry+a*RR:entry-a*RR;
    const sl=sig.action==="BUY"?entry-a:entry+a;
    let won=false,resolved=false;
    for(let j=i+1;j<=i+maxHold;j++){
      const h=+candles[j].high,l=+candles[j].low;
      if(sig.action==="BUY"){if(l<=sl){resolved=true;break;}if(h>=tp){won=true;resolved=true;break;}}
      else{if(h>=sl){resolved=true;break;}if(l<=tp){won=true;resolved=true;break;}}
    }
    if(!resolved){const fc=+candles[i+maxHold].close;won=(sig.action==="BUY"?fc-entry:entry-fc)>0;}
    const pnl=(won?RR:-1)-cost; bal+=pnl; rets.push(pnl);
    if(won)wins++;else losses++;
  }
  const total=wins+losses;
  if(total<20) return null;
  const wr=wins/total, be=breakeven(sym,mult,RR);
  return {total,wr:+(wr*100).toFixed(1),be:+(be*100).toFixed(1),
    net:+bal.toFixed(2),beats:wr>=be};
}

// the validated winners + their best configs (RR, multiplier)
const WINNERS=[
  // forex cost-attack (RR4 x20)
  {sym:"frxEURUSD", RR:4, mult:20, gran:1800},
  {sym:"frxXAUUSD", RR:4, mult:20, gran:1800},
  {sym:"frxEURJPY", RR:4, mult:20, gran:1800},
  // JD cost-attack (RR4 x20)
  {sym:"JD25",  RR:4, mult:20, gran:1800},
  {sym:"JD50",  RR:4, mult:20, gran:1800},
  // BOOM/CRASH momentum — note: different strategy (trend on synthetics),
  // tested here with same trend signal at their natural config for continuity
  {sym:"BOOM1000",  RR:2, mult:30, gran:60},
  {sym:"CRASH1000", RR:2, mult:30, gran:60},
];

async function main(){
  console.log("🔬 TIMI MULTI-WINDOW ROBUSTNESS TEST\n");
  console.log("Does each edge hold across SEVERAL historical windows, or just the latest?\n");

  const COUNT=3000;
  const now=Math.floor(Date.now()/1000);
  // window end-points: latest, then step back. 30m*3000 ≈ 62 days, so step ~65d.
  const STEP_30M = 65*86400;
  const STEP_1M  = 3*86400;   // 1m*3000 ≈ 2 days

  for(const w of WINNERS){
    console.log("─".repeat(84));
    console.log(`📊 ${w.sym}  (RR${w.RR} x${w.mult}, ${w.gran===60?"1m":"30m"})`);
    const step = w.gran===60 ? STEP_1M : STEP_30M;
    const maxHold = w.gran===60 ? 8 : Math.round(w.RR*8);
    let greenWindows=0, totalWindows=0;
    for(let k=0;k<4;k++){   // 4 windows back in time
      const endEpoch = k===0 ? null : now - k*step;
      const candles = await fetchWindow(w.sym, w.gran, COUNT, endEpoch);
      await new Promise(z=>setTimeout(z,800));
      if(candles.error){ console.log(`   window ${k}: ❌ ${candles.error}`); continue; }
      if(!Array.isArray(candles)||candles.length<200){ console.log(`   window ${k}: only ${candles.length||0} candles (no history this far back)`); continue; }
      const r=runConfig(candles, w.sym, w.RR, w.mult, maxHold);
      if(!r){ console.log(`   window ${k}: too few trades`); continue; }
      const d0=new Date(+candles[0].epoch*1000).toISOString().slice(0,10);
      const d1=new Date(+candles[candles.length-1].epoch*1000).toISOString().slice(0,10);
      const flag=r.beats&&r.net>0?"🟢":"🔴";
      console.log(`   ${d0}→${d1}: WR ${r.wr}% (need ${r.be}%) net $${r.net} | ${r.total} trades ${flag}`);
      totalWindows++; if(r.beats&&r.net>0) greenWindows++;
    }
    const verdict = totalWindows===0 ? "⚪ no data"
      : greenWindows===totalWindows ? "🟢 ROBUST (all windows)"
      : greenWindows>=Math.ceil(totalWindows*0.6) ? "🟡 MOSTLY holds"
      : "🔴 FELL APART on older data";
    console.log(`   → ${verdict}  (${greenWindows}/${totalWindows} windows profitable)`);
  }

  console.log("\n"+"═".repeat(84));
  console.log("A robust edge is green across MOST windows — not just the latest 60 days.");
  console.log("🔴 'fell apart' means the edge was fitting one lucky recent period.");
  console.log("═".repeat(84));
}

main();
