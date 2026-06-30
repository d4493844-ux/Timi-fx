const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — COMBINED REPAIR  (rework step 4: filter + trailing TOGETHER on JD)
// ══════════════════════════════════════════════════════════════════════════
// JD25 / JD50 resisted both repairs separately:
//   • efficiency filter alone → no change
//   • trailing stop alone     → no change / worse
// Last lever before deciding they can't be rescued: BOTH at once — only trade
// when trend-efficiency is high (filter) AND let winners run (trailing).
//
// OVERFIT GUARD: we now have 4 knobs (eff threshold, trail-start, trail-dist,
// and we sweep a couple values). With only 6 windows that's dangerous — it's
// easy to find a combo that fits. So the verdict weights the 2 ⭐NEW windows
// heavily: a real repair holds there. If a combo is green on the 4 old windows
// but red on the 2 new ones, that's OVERFIT, reported as such, NOT approved.
//
// USAGE:  node combined_repair.js
// ══════════════════════════════════════════════════════════════════════════

const COMM=0.0015;
function entryCost(m){return 1*m*COMM;}   // JD = no spread

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
function signalAt(cl,i){
  const e8=ema(cl.slice(0,i),8),e21=ema(cl.slice(0,i),21),e50=ema(cl.slice(Math.max(0,i-60),i),50),r=rsi(cl.slice(0,i));
  if(e8>e21&&e21>e50&&r>50&&r<70)return "BUY";
  if(e8<e21&&e21<e50&&r<50&&r>30)return "SELL";
  return null;
}
function localEff(cl,i,lb=40){
  if(i<lb)return 0;
  const seg=cl.slice(i-lb,i);let net=Math.abs(seg[seg.length-1]-seg[0]),path=0;
  for(let k=1;k<seg.length;k++)path+=Math.abs(seg[k]-seg[k-1]);
  return path>0?net/path:0;
}

// filter + trailing combined
function runCombined(candles,mult,maxHold,effThr,trailStart,trailDist){
  const cost=entryCost(mult),cl=candles.map(x=>+x.close);
  let w=0,l=0,bal=0;
  for(let i=60;i<candles.length-maxHold-1;i++){
    const action=signalAt(cl,i); if(!action)continue;
    if(localEff(cl,i,40)<effThr)continue;           // FILTER
    const c=candles.slice(0,i),a=atr(c)||(+candles[i].close*0.002),entry=+candles[i].close;
    let stop=action==="BUY"?entry-a:entry+a, best=entry, exit=null;
    for(let j=i+1;j<=i+maxHold;j++){
      const h=+candles[j].high,lo=+candles[j].low;
      if(action==="BUY"){
        if(lo<=stop){exit=stop;break;}
        if(h>best)best=h;
        if(best-entry>=trailStart*a){const nt=best-trailDist*a;if(nt>stop)stop=nt;}
      } else {
        if(h>=stop){exit=stop;break;}
        if(lo<best)best=lo;
        if(entry-best>=trailStart*a){const nt=best+trailDist*a;if(nt<stop)stop=nt;}
      }
    }
    if(exit===null)exit=+candles[i+maxHold].close;
    const moved=action==="BUY"?(exit-entry):(entry-exit);
    bal+=(moved/a)-cost; if(moved>0)w++;else l++;
  }
  const t=w+l; if(t<15)return null;
  return {wr:+(w/t*100).toFixed(1),net:+bal.toFixed(2),trades:t,win:bal>0};
}

const PAIRS=[
  {sym:"JD25",mult:20,gran:1800},
  {sym:"JD50",mult:20,gran:1800},
];
// modest sweep — kept SMALL on purpose to limit overfitting
const COMBOS=[
  {effThr:0.020,trailStart:1.5,trailDist:1.0},
  {effThr:0.030,trailStart:1.5,trailDist:1.0},
  {effThr:0.030,trailStart:2.0,trailDist:1.5},
];

async function main(){
  console.log("🔬 TIMI COMBINED REPAIR — filter + trailing on JD25/JD50\n");
  console.log("Last repair lever. Overfit guard: the 2 ⭐NEW windows must hold too.\n");

  const now=Math.floor(Date.now()/1000),STEP=65*86400,COUNT=3000;
  for(const p of PAIRS){
    console.log("═".repeat(88));
    console.log(`📊 ${p.sym}`);
    const maxHold=32;
    // fetch all 6 windows once, reuse across combos
    const windows=[];
    for(let k=0;k<6;k++){
      const end=k===0?null:now-k*STEP;
      const candles=await fetchWindow(p.sym,p.gran,COUNT,end);
      await new Promise(z=>setTimeout(z,800));
      if(Array.isArray(candles)&&candles.length>=200){
        const d0=new Date(+candles[0].epoch*1000).toISOString().slice(0,10);
        windows.push({candles,d0,isNew:k>=4});
      } else windows.push(null);
    }
    let bestCombo=null;
    for(const combo of COMBOS){
      let oldGreen=0,oldTot=0,newGreen=0,newTot=0;
      const rows=[];
      for(const win of windows){
        if(!win){rows.push("   (no data)");continue;}
        const r=runCombined(win.candles,p.mult,maxHold,combo.effThr,combo.trailStart,combo.trailDist);
        if(!r){rows.push(`   ${win.d0}: too few trades`);continue;}
        if(win.isNew){newTot++;if(r.win)newGreen++;}else{oldTot++;if(r.win)oldGreen++;}
        rows.push(`   ${win.d0}${win.isNew?" ⭐NEW":""}: ${r.win?"🟢":"🔴"} net $${r.net} (WR ${r.wr}%, ${r.trades} trades)`);
      }
      const totGreen=oldGreen+newGreen, tot=oldTot+newTot;
      // a combo only counts as good if it holds on BOTH new windows
      const holdsNew = newTot>0 && newGreen===newTot;
      const score = totGreen + (holdsNew?10:0);  // heavily reward holding new windows
      console.log(`\n  ── combo eff≥${combo.effThr} trail ${combo.trailStart}/${combo.trailDist} → ${totGreen}/${tot} green, NEW ${newGreen}/${newTot} ${holdsNew?"✅":"⚠️"}`);
      for(const r of rows)console.log(r);
      if(!bestCombo||score>bestCombo.score) bestCombo={...combo,totGreen,tot,newGreen,newTot,holdsNew,score};
    }
    // verdict for this pair
    console.log("");
    if(bestCombo.totGreen>=Math.ceil(bestCombo.tot*0.8) && bestCombo.holdsNew)
      console.log(`  🟢 APPROVED: eff≥${bestCombo.effThr} + trail ${bestCombo.trailStart}/${bestCombo.trailDist} → ${bestCombo.totGreen}/${bestCombo.tot}, holds NEW windows`);
    else if(bestCombo.totGreen>=Math.ceil(bestCombo.tot*0.8) && !bestCombo.holdsNew)
      console.log(`  ⚠️ OVERFIT WARNING: best combo is ${bestCombo.totGreen}/${bestCombo.tot} but FAILS a NEW window → fitting old data, NOT approved`);
    else
      console.log(`  🔴 NOT RESCUED: even filter+trailing can't make ${p.sym} robust. This is the honest ceiling — ${p.sym} likely has no durable edge.`);
  }
  console.log("\n"+"═".repeat(88));
  console.log("If APPROVED → deploy with that config. If NOT RESCUED after 3 repair passes,");
  console.log("the honest conclusion is the edge isn't durable — and that's worth knowing.");
}
main();
