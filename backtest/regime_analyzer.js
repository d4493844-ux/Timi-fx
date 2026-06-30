const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — REGIME ANALYZER  (rework step 1)
// ══════════════════════════════════════════════════════════════════════════
// The robustness test showed each pair wins in some windows, loses in others.
// The QUESTION this answers: what's DIFFERENT about the winning windows?
//
// For every window each pair traded, it measures the market REGIME:
//   • Volatility level    (avg ATR % — calm vs wild)
//   • Trendiness (Hurst)  (>0.5 trending, <0.5 mean-reverting, ~0.5 random)
//   • Directional drift   (net move over window — strong trend vs chop)
//   • Choppiness          (how often price crosses its own mean)
//
// Then pairs each window's regime with its WIN/LOSS. If a pair only wins when
// Hurst>0.55 (trending), THAT is the filter: only trade it when trending.
// This converts "fails on old data" into "trade it only in its good regime".
//
// USAGE:  node regime_analyzer.js
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

// Hurst exponent via rescaled range (with bias correction)
function hurst(prices){
  const n=prices.length;
  if(n<100) return 0.5;
  const rets=[];
  for(let i=1;i<n;i++) rets.push(Math.log(prices[i]/prices[i-1]));
  const sizes=[10,20,40,80,160].filter(s=>s<rets.length/2);
  const xs=[],ys=[];
  for(const s of sizes){
    const chunks=Math.floor(rets.length/s);
    let rsSum=0;
    for(let c=0;c<chunks;c++){
      const seg=rets.slice(c*s,(c+1)*s);
      const mean=seg.reduce((a,b)=>a+b,0)/s;
      let cum=0,min=0,max=0;
      for(const v of seg){cum+=v-mean;if(cum<min)min=cum;if(cum>max)max=cum;}
      const R=max-min;
      const sd=Math.sqrt(seg.reduce((a,b)=>a+(b-mean)**2,0)/s);
      if(sd>0) rsSum+=R/sd;
    }
    if(chunks>0){xs.push(Math.log(s));ys.push(Math.log(rsSum/chunks));}
  }
  // linear regression slope = Hurst
  const m=xs.length, sx=xs.reduce((a,b)=>a+b,0),sy=ys.reduce((a,b)=>a+b,0);
  const sxy=xs.reduce((a,x,i)=>a+x*ys[i],0),sxx=xs.reduce((a,x)=>a+x*x,0);
  return (m*sxy-sx*sy)/(m*sxx-sx*sx||1);
}

// measure regime of a candle window
function regime(candles){
  const cl=candles.map(x=>+x.close);
  const price=cl[cl.length-1];
  const avgAtr = candles.slice(20).reduce((a,_,i)=>a+atr(candles.slice(0,i+21)),0)/(candles.length-20)/price;
  const H = hurst(cl);
  // directional drift: net move / total path length (1=pure trend, 0=pure chop)
  let netMove=Math.abs(cl[cl.length-1]-cl[0]);
  let pathLen=0; for(let i=1;i<cl.length;i++) pathLen+=Math.abs(cl[i]-cl[i-1]);
  const efficiency = pathLen>0 ? netMove/pathLen : 0;
  // choppiness: how often price crosses its 20-EMA
  let crosses=0; for(let i=21;i<cl.length;i++){const e=ema(cl.slice(0,i),20),ep=ema(cl.slice(0,i-1),20);if((cl[i]>e)!==(cl[i-1]>ep))crosses++;}
  const chopRate=crosses/cl.length;
  return {atrPct:+(avgAtr*100).toFixed(3), hurst:+H.toFixed(3),
          efficiency:+efficiency.toFixed(3), chopRate:+chopRate.toFixed(3)};
}

// run the RR4 strategy, return win/loss verdict for the window
function runStrat(candles,sym,RR,mult,maxHold){
  const cost=entryCost(sym,mult);
  let w=0,l=0,bal=0;
  for(let i=60;i<candles.length-maxHold-1;i++){
    const c=candles.slice(0,i);const cl=c.map(x=>+x.close);
    const e8=ema(cl,8),e21=ema(cl,21),e50=ema(cl.slice(-60),50),r=rsi(cl);
    let action=null;
    if(e8>e21&&e21>e50&&r>50&&r<70)action="BUY";
    if(e8<e21&&e21<e50&&r<50&&r>30)action="SELL";
    if(!action)continue;
    const a=atr(c)||(+candles[i].close*0.002),entry=+candles[i].close;
    const tp=action==="BUY"?entry+a*RR:entry-a*RR, sl=action==="BUY"?entry-a:entry+a;
    let won=false,res=false;
    for(let j=i+1;j<=i+maxHold;j++){const h=+candles[j].high,lo=+candles[j].low;
      if(action==="BUY"){if(lo<=sl){res=true;break;}if(h>=tp){won=true;res=true;break;}}
      else{if(h>=sl){res=true;break;}if(lo<=tp){won=true;res=true;break;}}}
    if(!res){const fc=+candles[i+maxHold].close;won=(action==="BUY"?fc-entry:entry-fc)>0;}
    bal+=(won?RR:-1)-cost; if(won)w++;else l++;
  }
  const tot=w+l; if(tot<20)return null;
  return {wr:+(w/tot*100).toFixed(1),be:+(breakeven(sym,mult,RR)*100).toFixed(1),net:+bal.toFixed(2),win:bal>0};
}

const PAIRS=[
  {sym:"frxEURUSD",RR:4,mult:20,gran:1800},
  {sym:"frxXAUUSD",RR:4,mult:20,gran:1800},
  {sym:"frxEURJPY",RR:4,mult:20,gran:1800},
  {sym:"JD25",RR:4,mult:20,gran:1800},
  {sym:"JD50",RR:4,mult:20,gran:1800},
];

async function main(){
  console.log("🔬 TIMI REGIME ANALYZER — what regime does each pair WIN in?\n");
  console.log("Finding the filter: the market condition that separates wins from losses.\n");

  const now=Math.floor(Date.now()/1000), STEP=65*86400, COUNT=3000;
  const data={};
  for(const p of PAIRS){
    console.log("─".repeat(86));
    console.log(`📊 ${p.sym}`);
    console.log(`   window              ATR%   Hurst  trend-eff  chop   →  result`);
    data[p.sym]={wins:[],losses:[]};
    for(let k=0;k<4;k++){
      const end=k===0?null:now-k*STEP;
      const candles=await fetchWindow(p.sym,p.gran,COUNT,end);
      await new Promise(z=>setTimeout(z,800));
      if(!Array.isArray(candles)||candles.length<200){console.log(`   window ${k}: no data`);continue;}
      const reg=regime(candles);
      const res=runStrat(candles,p.sym,p.RR,p.mult,Math.round(p.RR*8));
      if(!res){console.log(`   window ${k}: too few trades`);continue;}
      const d0=new Date(+candles[0].epoch*1000).toISOString().slice(0,10);
      const d1=new Date(+candles[candles.length-1].epoch*1000).toISOString().slice(0,10);
      const flag=res.win?"🟢 WIN ":"🔴 LOSS";
      console.log(`   ${d0}→${d1}  ${String(reg.atrPct).padStart(5)}  ${String(reg.hurst).padStart(5)}  ${String(reg.efficiency).padStart(7)}  ${String(reg.chopRate).padStart(5)}  →  ${flag} (WR ${res.wr}% net $${res.net})`);
      (res.win?data[p.sym].wins:data[p.sym].losses).push(reg);
    }
    // find the discriminating regime feature
    const w=data[p.sym].wins, l=data[p.sym].losses;
    if(w.length&&l.length){
      const avg=(arr,k)=>arr.reduce((a,x)=>a+x[k],0)/arr.length;
      console.log(`   📐 WIN avg:  Hurst ${avg(w,'hurst').toFixed(3)} | trend-eff ${avg(w,'efficiency').toFixed(3)} | ATR% ${avg(w,'atrPct').toFixed(3)} | chop ${avg(w,'chopRate').toFixed(3)}`);
      console.log(`   📐 LOSS avg: Hurst ${avg(l,'hurst').toFixed(3)} | trend-eff ${avg(l,'efficiency').toFixed(3)} | ATR% ${avg(l,'atrPct').toFixed(3)} | chop ${avg(l,'chopRate').toFixed(3)}`);
      // biggest separator
      const feats=['hurst','efficiency','atrPct','chopRate'];
      let best=null;
      for(const f of feats){const sep=Math.abs(avg(w,f)-avg(l,f))/(Math.abs(avg(l,f))+1e-6);if(!best||sep>best.sep)best={f,sep,win:avg(w,f),loss:avg(l,f)};}
      console.log(`   🎯 BIGGEST SEPARATOR: ${best.f} (win ${best.win.toFixed(3)} vs loss ${best.loss.toFixed(3)}) → candidate filter`);
    } else if(w.length&&!l.length){
      console.log(`   ✅ won every window with data — robust, no filter needed`);
    }
  }
  console.log("\n"+"═".repeat(86));
  console.log("The BIGGEST SEPARATOR per pair is the regime filter to build: only trade");
  console.log("when that feature is on the winning side. Next step: implement & re-test.");
}
main();
