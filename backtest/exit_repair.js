const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — EXIT REPAIR  (rework step 3: repair the EXIT, not the entry)
// ══════════════════════════════════════════════════════════════════════════
// For pairs the efficiency filter didn't rescue (frxXAUUSD, JD25) and the one
// still improving (JD50), the next lever is the EXIT. A fixed RR4 take-profit
// is rigid: it either hits the full target or rides a winner back down to the
// stop. A TRAILING STOP lets winners run as far as they go, then locks in once
// they reverse — often turning a fragile high-RR strategy robust.
//
// Also RE-INCLUDES BOOM1000 / CRASH1000, which earlier tools dropped — they
// run on 1m momentum, a different config, so they get tested on their own terms.
//
// Tested across 6 windows. Compares FIXED-TP vs TRAILING exit per pair.
//
// USAGE:  node exit_repair.js
// ══════════════════════════════════════════════════════════════════════════

const COMM=0.0015;
function spreadFor(s){return s.startsWith("frx")?0.00008:0.0;}
function entryCost(s,m){return 1*m*(COMM+spreadFor(s));}
// breakeven for a trailing strategy is fuzzy (variable win size), so we just
// report net PnL and win/loss; net>0 across windows is the bar.

async function fetchWindow(symbol,gran,count,endEpoch){
  return new Promise((resolve)=>{
    const ws=new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const to=setTimeout(()=>{ws.close();resolve([]);},20000);
    const req={ticks_history:symbol,adjust_start_time:1,count,granularity:gran,style:"candles"};
    req.end=endEpoch?String(endEpoch):"latest";
    ws.on("open",()=>ws.send(JSON.stringify(req)));
    ws.on("message",(d)=>{const m=JSON.parse(d);
      if(m.candles){clearTimeout(to);ws.close();resolve(m.candles);}
      if(m.error){clearTimeout(to);ws.close();resolve([]);}});
    ws.on("error",()=>{clearTimeout(to);resolve([]);});
  });
}

function ema(p,n){const k=2/(n+1);let e=p[0];for(let i=1;i<p.length;i++)e=p[i]*k+e*(1-k);return e;}
function rsi(p,n=14){if(p.length<n+1)return 50;let g=0,l=0;for(let i=p.length-n;i<p.length;i++){const d=p[i]-p[i-1];if(d>0)g+=d;else l-=d;}return 100-100/(1+g/(l||1e-4));}
function atr(c,n=14){const s=c.slice(-n);const t=s.map((x,i)=>{const pc=i>0?+s[i-1].close:+x.close;return Math.max(+x.high-+x.low,Math.abs(+x.high-pc),Math.abs(+x.low-pc));});return t.reduce((a,b)=>a+b,0)/t.length;}

function signalAt(candles,i){
  const cl=candles.map(x=>+x.close);
  const e8=ema(cl.slice(0,i),8),e21=ema(cl.slice(0,i),21),e50=ema(cl.slice(Math.max(0,i-60),i),50),r=rsi(cl.slice(0,i));
  if(e8>e21&&e21>e50&&r>50&&r<70)return "BUY";
  if(e8<e21&&e21<e50&&r<50&&r>30)return "SELL";
  return null;
}

// FIXED-TP exit (the current approach)
function runFixed(candles,sym,RR,mult,maxHold){
  const cost=entryCost(sym,mult); let w=0,l=0,bal=0;
  for(let i=60;i<candles.length-maxHold-1;i++){
    const action=signalAt(candles,i); if(!action)continue;
    const c=candles.slice(0,i),a=atr(c)||(+candles[i].close*0.002),entry=+candles[i].close;
    const tp=action==="BUY"?entry+a*RR:entry-a*RR, sl=action==="BUY"?entry-a:entry+a;
    let won=false,res=false;
    for(let j=i+1;j<=i+maxHold;j++){const h=+candles[j].high,lo=+candles[j].low;
      if(action==="BUY"){if(lo<=sl){res=true;break;}if(h>=tp){won=true;res=true;break;}}
      else{if(h>=sl){res=true;break;}if(lo<=tp){won=true;res=true;break;}}}
    if(!res){const fc=+candles[i+maxHold].close;won=(action==="BUY"?fc-entry:entry-fc)>0;}
    bal+=(won?RR:-1)-cost; if(won)w++;else l++;
  }
  const t=w+l; if(t<15)return null;
  return {wr:+(w/t*100).toFixed(1),net:+bal.toFixed(2),trades:t,win:bal>0};
}

// TRAILING exit: initial stop at 1 ATR; once price moves +trailStart ATR in
// favor, trail the stop at trailDist ATR behind the best price. No fixed TP —
// winners run until the trail is hit. PnL measured in ATR units (risk = 1 ATR).
function runTrail(candles,sym,mult,maxHold,trailStart,trailDist){
  const cost=entryCost(sym,mult); let w=0,l=0,bal=0;
  for(let i=60;i<candles.length-maxHold-1;i++){
    const action=signalAt(candles,i); if(!action)continue;
    const c=candles.slice(0,i),a=atr(c)||(+candles[i].close*0.002),entry=+candles[i].close;
    let stop=action==="BUY"?entry-a:entry+a;       // initial 1-ATR stop
    let best=entry, exit=null;
    for(let j=i+1;j<=i+maxHold;j++){
      const h=+candles[j].high,lo=+candles[j].low,cl=+candles[j].close;
      if(action==="BUY"){
        if(lo<=stop){exit=stop;break;}
        if(h>best)best=h;
        if(best-entry>=trailStart*a){const nt=best-trailDist*a; if(nt>stop)stop=nt;}
      } else {
        if(h>=stop){exit=stop;break;}
        if(lo<best)best=lo;
        if(entry-best>=trailStart*a){const nt=best+trailDist*a; if(nt<stop)stop=nt;}
      }
    }
    if(exit===null) exit=+candles[i+maxHold].close;
    const moved=action==="BUY"?(exit-entry):(entry-exit);
    const rMult=moved/a;                            // PnL in ATR units
    bal+=rMult-cost; if(rMult>0)w++;else l++;
  }
  const t=w+l; if(t<15)return null;
  return {wr:+(w/t*100).toFixed(1),net:+bal.toFixed(2),trades:t,win:bal>0};
}

// pairs needing exit repair + BOOM/CRASH re-included on their 1m config
const PAIRS=[
  {sym:"frxXAUUSD",RR:4,mult:20,gran:1800,kind:"fx"},
  {sym:"JD25",RR:4,mult:20,gran:1800,kind:"jd"},
  {sym:"JD50",RR:4,mult:20,gran:1800,kind:"jd"},
  {sym:"BOOM1000",RR:2,mult:30,gran:60,kind:"sp"},
  {sym:"CRASH1000",RR:2,mult:30,gran:60,kind:"sp"},
];

async function main(){
  console.log("🔬 TIMI EXIT REPAIR — does a trailing stop fix the fragile pairs?\n");
  console.log("Fixed RR4 TP vs Trailing stop (let winners run). BOOM/CRASH back in on 1m.\n");

  const now=Math.floor(Date.now()/1000), COUNT=3000;
  for(const p of PAIRS){
    const STEP = p.gran===60 ? 3*86400 : 65*86400;
    const maxHold = p.gran===60 ? 12 : Math.round(p.RR*8);
    console.log("─".repeat(88));
    console.log(`📊 ${p.sym}  (${p.gran===60?"1m":"30m"})`);
    let fixWins=0,trailWins=0,total=0;
    for(let k=0;k<6;k++){
      const end=k===0?null:now-k*STEP;
      const candles=await fetchWindow(p.sym,p.gran,COUNT,end);
      await new Promise(z=>setTimeout(z,800));
      if(!Array.isArray(candles)||candles.length<200){console.log(`   window ${k}: no data`);continue;}
      const fix=runFixed(candles,p.sym,p.RR,p.mult,maxHold);
      const trail=runTrail(candles,p.sym,p.mult,maxHold,1.5,1.0);  // start trailing after +1.5ATR, trail 1ATR
      if(!fix||!trail){console.log(`   window ${k}: too few trades`);continue;}
      const d0=new Date(+candles[0].epoch*1000).toISOString().slice(0,10);
      const isNew=k>=4?" ⭐NEW":"";
      total++; if(fix.win)fixWins++; if(trail.win)trailWins++;
      console.log(`   ${d0}${isNew}: FIXED ${fix.win?"🟢":"🔴"} net $${fix.net} (WR ${fix.wr}%)  |  TRAIL ${trail.win?"🟢":"🔴"} net $${trail.net} (WR ${trail.wr}%)`);
    }
    const better = trailWins>fixWins;
    console.log(`   → FIXED ${fixWins}/${total} | TRAIL ${trailWins}/${total}  ${better?"✅ trailing helps":trailWins===fixWins?"➖ no change":"❌ trailing worse"}`);
    const best=Math.max(fixWins,trailWins);
    if(best>=Math.ceil(total*0.8)) console.log(`   🟢 APPROVED with ${trailWins>fixWins?"TRAILING":"FIXED"} exit (${best}/${total})`);
    else if(better) console.log(`   🟡 trailing IMPROVED it — closer, may need filter+trail combined`);
    else console.log(`   🔴 still fragile — exit alone didn't fix it`);
  }
  console.log("\n"+"═".repeat(88));
  console.log("APPROVED → deploy with that exit. IMPROVED → combine filter + trailing next pass.");
}
main();
