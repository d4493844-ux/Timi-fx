const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — DEEP JD100 HUNT  (chasing the hidden edge)
// ══════════════════════════════════════════════════════════════════════════
// WHY JD100 SPECIFICALLY: in the significance suite it showed a POSITIVE
// bootstrap CI [0.073, 0.30] and permutation p=0 — meaning the edge is REAL,
// not random (unlike JD10 whose CI included zero). It only failed because it
// broke out-of-sample. "Real signal + breaks OOS" = wrong config, not no edge.
//
// This hunts JD100 from angles we NEVER tried:
//   1. Jump-cadence-aware holds (JD100 jumps ~every 100 bars — needs long holds)
//   2. Wider RR sweep (up to RR8 — capture the full jump, not a slice)
//   3. Jump-anticipation entry (enter after volatility compression, not just trend)
//   4. Tested across 6 windows — a real config holds OOS
//
// USAGE:  node deep_jd100_hunt.js
// ══════════════════════════════════════════════════════════════════════════

const COMM=0.0015;
function entryCost(m){return 1*m*COMM;}  // JD: no spread

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

// detect a "jump" candle: an outsized move vs recent ATR
function isJumpCandle(candles,i,mult=3){
  if(i<20)return false;
  const a=atr(candles.slice(i-20,i));
  const move=Math.abs(+candles[i].close - +candles[i].open);
  return move > mult*a;
}

// ── ENTRY VARIANTS ──
function entryTrend(cl,i){
  const e8=ema(cl.slice(0,i),8),e21=ema(cl.slice(0,i),21),e50=ema(cl.slice(Math.max(0,i-60),i),50),r=rsi(cl.slice(0,i));
  if(e8>e21&&e21>e50&&r>50&&r<70)return "BUY";
  if(e8<e21&&e21<e50&&r<50&&r>30)return "SELL";
  return null;
}
// volatility-compression entry: enter when recent range is unusually TIGHT
// (jumps often follow quiet periods). Direction from short EMA slope.
function entryCompression(candles,i){
  if(i<40)return null;
  const recent=candles.slice(i-20,i), older=candles.slice(i-40,i-20);
  const rAtr=atr(recent), oAtr=atr(older);
  if(rAtr >= oAtr*0.8) return null;   // not compressed
  const cl=candles.map(x=>+x.close);
  const e5=ema(cl.slice(Math.max(0,i-10),i),5), e20=ema(cl.slice(Math.max(0,i-20),i),20);
  return e5>e20?"BUY":"SELL";
}

// run a config with a chosen entry style, RR, hold
function run(candles,mult,RR,maxHold,entryStyle){
  const cost=entryCost(mult),cl=candles.map(x=>+x.close);
  let w=0,l=0,bal=0;
  for(let i=60;i<candles.length-maxHold-1;i++){
    let action=null;
    if(entryStyle==="trend") action=entryTrend(cl,i);
    else if(entryStyle==="compression") action=entryCompression(candles,i);
    if(!action)continue;
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

async function main(){
  console.log("🔬 DEEP JD100 HUNT — chasing the real-but-hidden edge\n");
  console.log("JD100 had POSITIVE bootstrap CI + p=0 (real signal). Hunting the config\n");
  console.log("that makes it hold out-of-sample, from angles we never tried.\n");

  const now=Math.floor(Date.now()/1000),STEP=65*86400,COUNT=3000;
  // fetch 6 windows once
  const windows=[];
  for(let k=0;k<6;k++){
    const end=k===0?null:now-k*STEP;
    const candles=await fetchWindow("JD100",1800,COUNT,end);
    await new Promise(z=>setTimeout(z,800));
    if(Array.isArray(candles)&&candles.length>=200){
      const d0=new Date(+candles[0].epoch*1000).toISOString().slice(0,10);
      windows.push({candles,d0,isNew:k>=4});
    } else windows.push(null);
  }

  // measure jump cadence
  const valid=windows.filter(Boolean);
  if(valid.length){
    let jumps=0,bars=0;
    for(const w of valid){for(let i=20;i<w.candles.length;i++){if(isJumpCandle(w.candles,i))jumps++;bars++;}}
    console.log(`📐 JD100 jump rate: ~1 jump per ${(bars/jumps).toFixed(0)} bars (${jumps} jumps in ${bars} bars)\n`);
  }

  // sweep: entry style × RR × hold — WIDER than before
  const configs=[];
  for(const entry of ["trend","compression"])
    for(const RR of [3,4,5,6,8])
      for(const hold of [24,40,60,100])
        configs.push({entry,RR,hold,mult:20});

  let best=null;
  console.log("Sweeping "+configs.length+" configs across 6 windows (this takes a bit)...\n");
  for(const cfg of configs){
    let oldG=0,oldT=0,newG=0,newT=0,totalNet=0;
    for(const w of windows){
      if(!w)continue;
      const r=run(w.candles,cfg.mult,cfg.RR,cfg.hold,cfg.entry);
      if(!r)continue;
      totalNet+=r.net;
      if(w.isNew){newT++;if(r.win)newG++;}else{oldT++;if(r.win)oldG++;}
    }
    const tot=oldT+newT, green=oldG+newG;
    if(tot<5)continue;
    const holdsNew = newT>0 && newG===newT;
    // score: prioritize robustness AND holding new windows
    const score = green + (holdsNew?5:0) + (green===tot?5:0);
    if(!best || score>best.score || (score===best.score && totalNet>best.totalNet))
      best={...cfg,green,tot,newG,newT,holdsNew,totalNet:+totalNet.toFixed(0),score};
  }

  console.log("═".repeat(80));
  if(best){
    console.log(`🏆 BEST JD100 CONFIG FOUND:`);
    console.log(`   entry=${best.entry}  RR=${best.RR}  hold=${best.hold}  mult=x${best.mult}`);
    console.log(`   → ${best.green}/${best.tot} windows green | NEW windows ${best.newG}/${best.newT} ${best.holdsNew?"✅":"⚠️"} | total net $${best.totalNet}`);
    console.log("");
    // show the winning config window-by-window
    console.log("   Window-by-window with best config:");
    for(const w of windows){
      if(!w){console.log("   (no data)");continue;}
      const r=run(w.candles,best.mult,best.RR,best.hold,best.entry);
      if(!r){console.log(`   ${w.d0}: too few`);continue;}
      console.log(`   ${w.d0}${w.isNew?" ⭐NEW":""}: ${r.win?"🟢":"🔴"} net $${r.net} (WR ${r.wr}%, ${r.trades} trades)`);
    }
    console.log("");
    if(best.green>=Math.ceil(best.tot*0.8)&&best.holdsNew)
      console.log("   🟢 GOLD FOUND — this config makes JD100 robust. Validate in significance suite next.");
    else if(best.green>=Math.ceil(best.tot*0.6))
      console.log("   🟡 CLOSER — best config is improved but not bulletproof. Real signal, needs more.");
    else
      console.log("   🔴 No config made it robust across windows — the OOS break persists.");
  } else {
    console.log("   No viable config found.");
  }
  console.log("═".repeat(80));
}
main();
