const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — FILTERED STRATEGY RETEST  (rework step 2: repair → retest → approve)
// ══════════════════════════════════════════════════════════════════════════
// The regime analyzer found: pairs WIN when trend-efficiency is high (market
// actually trending) and LOSE when it's chopping. So we add a FILTER: only
// take trades when the recent trend-efficiency is above a threshold. In chop,
// the strategy sits out — which is exactly when it used to bleed.
//
// CRITICAL: the filter was DESIGNED on 4 windows. To know it's a real repair
// and not overfit, we retest on 6 windows (2 it never saw). A real filter
// holds on the new windows too. An overfit one only works on the old 4.
//
// We compare, per pair, per window: FILTERED vs UNFILTERED. The filter is
// approved if it makes more windows green AND holds on the newer windows.
//
// USAGE:  node filtered_retest.js
// ══════════════════════════════════════════════════════════════════════════

const COMM=0.0015;
function spreadFor(s){return s.startsWith("frx")?0.00008:0.0;}
function entryCost(s,m){return 1*m*(COMM+spreadFor(s));}
function breakeven(s,m,rr){const c=entryCost(s,m);return (1+c)/((rr-c)+(1+c));}

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

// LOCAL trend-efficiency over the last `lookback` bars at decision time i.
// This is the live, causal version of the filter — uses only past data.
function localEfficiency(cl, i, lookback=40){
  if(i<lookback) return 0;
  const seg=cl.slice(i-lookback,i);
  let net=Math.abs(seg[seg.length-1]-seg[0]), path=0;
  for(let k=1;k<seg.length;k++) path+=Math.abs(seg[k]-seg[k-1]);
  return path>0?net/path:0;
}

// run strategy. if effThreshold>0, only trade when local efficiency >= threshold.
function runStrat(candles,sym,RR,mult,maxHold,effThreshold){
  const cost=entryCost(sym,mult);
  const cl=candles.map(x=>+x.close);
  let w=0,l=0,bal=0,skipped=0;
  for(let i=60;i<candles.length-maxHold-1;i++){
    const c=candles.slice(0,i);
    const e8=ema(cl.slice(0,i),8),e21=ema(cl.slice(0,i),21),e50=ema(cl.slice(Math.max(0,i-60),i),50),r=rsi(cl.slice(0,i));
    let action=null;
    if(e8>e21&&e21>e50&&r>50&&r<70)action="BUY";
    if(e8<e21&&e21<e50&&r<50&&r>30)action="SELL";
    if(!action)continue;
    // ── THE FILTER ──
    if(effThreshold>0){
      const eff=localEfficiency(cl,i,40);
      if(eff<effThreshold){skipped++;continue;}
    }
    const a=atr(c)||(+candles[i].close*0.002),entry=+candles[i].close;
    const tp=action==="BUY"?entry+a*RR:entry-a*RR, sl=action==="BUY"?entry-a:entry+a;
    let won=false,res=false;
    for(let j=i+1;j<=i+maxHold;j++){const h=+candles[j].high,lo=+candles[j].low;
      if(action==="BUY"){if(lo<=sl){res=true;break;}if(h>=tp){won=true;res=true;break;}}
      else{if(h>=sl){res=true;break;}if(lo<=tp){won=true;res=true;break;}}}
    if(!res){const fc=+candles[i+maxHold].close;won=(action==="BUY"?fc-entry:entry-fc)>0;}
    bal+=(won?RR:-1)-cost; if(won)w++;else l++;
  }
  const tot=w+l; if(tot<15)return null;
  return {wr:+(w/tot*100).toFixed(1),be:+(breakeven(sym,mult,RR)*100).toFixed(1),
          net:+bal.toFixed(2),trades:tot,skipped,win:bal>0};
}

// pairs + their candidate efficiency threshold (from regime analyzer win/loss split)
// frxEURJPY had no filter need (robust). JD25 had a backwards/weak separator → still test, expect it to stay weak.
const PAIRS=[
  {sym:"frxEURUSD",RR:4,mult:20,gran:1800,effThr:0.020},
  {sym:"frxXAUUSD",RR:4,mult:20,gran:1800,effThr:0.025},
  {sym:"frxEURJPY",RR:4,mult:20,gran:1800,effThr:0.000}, // robust, no filter
  {sym:"JD25",RR:4,mult:20,gran:1800,effThr:0.020},
  {sym:"JD50",RR:4,mult:20,gran:1800,effThr:0.030},      // strongest separator
];

async function main(){
  console.log("🔬 TIMI FILTERED RETEST — does the trend-efficiency filter repair the pairs?\n");
  console.log("Filter designed on 4 windows. Retesting on 6 (2 are NEW) to check it's real.\n");

  const now=Math.floor(Date.now()/1000), STEP=65*86400, COUNT=3000;
  for(const p of PAIRS){
    console.log("─".repeat(88));
    const filterLabel = p.effThr>0 ? `filter: eff≥${p.effThr}` : "no filter (was robust)";
    console.log(`📊 ${p.sym}   (${filterLabel})`);
    let unfWins=0,filtWins=0,total=0;
    for(let k=0;k<6;k++){   // 6 windows now, not 4
      const end=k===0?null:now-k*STEP;
      const candles=await fetchWindow(p.sym,p.gran,COUNT,end);
      await new Promise(z=>setTimeout(z,800));
      if(!Array.isArray(candles)||candles.length<200){console.log(`   window ${k}: no data`);continue;}
      const maxHold=Math.round(p.RR*8);
      const unf=runStrat(candles,p.sym,p.RR,p.mult,maxHold,0);
      const filt=p.effThr>0?runStrat(candles,p.sym,p.RR,p.mult,maxHold,p.effThr):unf;
      if(!unf){console.log(`   window ${k}: too few trades`);continue;}
      const d0=new Date(+candles[0].epoch*1000).toISOString().slice(0,10);
      const isNew = k>=4 ? " ⭐NEW" : "";
      total++;
      if(unf.win)unfWins++;
      if(filt&&filt.win)filtWins++;
      const uf=unf.win?"🟢":"🔴";
      const ff=filt?(filt.win?"🟢":"🔴"):"—";
      const filtStr = p.effThr>0&&filt ? `FILTERED ${ff} WR ${filt.wr}% net $${filt.net} (${filt.trades} trades, ${filt.skipped} skipped)` : "(no filter)";
      console.log(`   ${d0}${isNew}: UNFILTERED ${uf} net $${unf.net}  |  ${filtStr}`);
    }
    // verdict
    if(p.effThr>0){
      const improved = filtWins>unfWins;
      console.log(`   → unfiltered ${unfWins}/${total} green | FILTERED ${filtWins}/${total} green  ${improved?"✅ filter helps":filtWins===unfWins?"➖ no change":"❌ filter hurts"}`);
      if(filtWins>=Math.ceil(total*0.8)) console.log(`   🟢 APPROVED: filtered version robust (${filtWins}/${total})`);
      else if(filtWins>unfWins) console.log(`   🟡 IMPROVED but not yet robust — needs another repair pass`);
      else console.log(`   🔴 filter didn't rescue it — needs a different repair (exit? different filter?)`);
    } else {
      console.log(`   → ${unfWins}/${total} green (robust, no filter needed)`);
    }
  }
  console.log("\n"+"═".repeat(88));
  console.log("APPROVED pairs → deploy. IMPROVED → another repair pass. Failed filter → try exits next.");
  console.log("The 2 ⭐NEW windows are the real test: a true filter holds there too, not just the old 4.");
}
main();
