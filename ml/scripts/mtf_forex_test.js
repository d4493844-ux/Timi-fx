const WebSocket = require("ws");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — MULTI-TIMEFRAME FOREX TESTER  (v1.0)
// ══════════════════════════════════════════════════════════════════════════
// Question: 1-minute forex was noise (51-55%, below 59.4% breakeven). Does the
// SAME trend strategy work better on 15m / 30m / 45m / 1h, where forex has more
// structure and fewer whipsaws?
//
// For each pair, runs the strategy across all timeframes and reports which (if
// any) clears the cost breakeven. Honest accounting: same SL-first intrabar
// resolution + real Deriv costs as backtest_net.
//
// ⚠️ HONEST CAVEAT: Deriv returns a fixed COUNT of candles, not a fixed time
// span. So 1m covers ~days while 1h covers ~months — different market periods,
// not the same window at different zoom. The tool prints each timeframe's date
// span so you see what you're comparing. More candles on higher TF = more data,
// which is genuinely better, but it's not a pure apples-to-apples resolution
// test. Read it as "which TF has a tradeable edge", not "which zoom is best".
//
// USAGE:  node mtf_forex_test.js
// ══════════════════════════════════════════════════════════════════════════

// ── cost model (mirrors phase0 / backtest_net) ──
const MULTIPLIER        = 100;
const MULT_COMMISSION_PCT = 0.0015;
const FOREX_SPREAD_PCT  = 0.00008;
const CRYPTO_SPREAD_PCT = 0.0005;

function classify(s){
  if(s.startsWith("frx")) return "forex";
  if(s.startsWith("cry")) return "crypto";
  return "forex";
}
function entryCost(symbol, stake){
  const cls=classify(symbol);
  const notional=stake*MULTIPLIER;
  const commission=notional*MULT_COMMISSION_PCT;
  const spreadPct = cls==="crypto"?CRYPTO_SPREAD_PCT:FOREX_SPREAD_PCT;
  return commission + notional*spreadPct;
}
function breakevenWR(symbol, stake){
  const cost=entryCost(symbol,stake);
  const netWin=stake*0.95-cost, netLoss=stake+cost;
  return netLoss/(netWin+netLoss);
}

// ── data ──
async function fetchCandles(symbol, granularity, count){
  return new Promise((resolve)=>{
    const ws=new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const to=setTimeout(()=>{ws.close();resolve([]);},20000);
    ws.on("open",()=>ws.send(JSON.stringify({
      ticks_history:symbol,adjust_start_time:1,count,end:"latest",
      granularity,style:"candles"})));
    ws.on("message",(d)=>{
      const m=JSON.parse(d);
      if(m.candles){clearTimeout(to);ws.close();resolve(m.candles);}
      if(m.error){clearTimeout(to);ws.close();resolve([]);}
    });
    ws.on("error",()=>{clearTimeout(to);resolve([]);});
  });
}

// ── indicators ──
function ema(p,n){const k=2/(n+1);let e=p[0];for(let i=1;i<p.length;i++)e=p[i]*k+e*(1-k);return e;}
function rsi(p,n=14){if(p.length<n+1)return 50;let g=0,l=0;for(let i=p.length-n;i<p.length;i++){const d=p[i]-p[i-1];if(d>0)g+=d;else l-=d;}return 100-100/(1+g/(l||1e-4));}
function atr(c,n=14){const s=c.slice(-n);const t=s.map((x,i)=>{const pc=i>0?+s[i-1].close:+x.close;return Math.max(+x.high-+x.low,Math.abs(+x.high-pc),Math.abs(+x.low-pc));});return t.reduce((a,b)=>a+b,0)/t.length;}

// ── trend signal (same as backtest_net) ──
function trendSignal(c){
  const cl=c.map(x=>+x.close);
  const e8=ema(cl,8),e21=ema(cl,21),e50=ema(cl.slice(-60),50),r=rsi(cl),a=atr(c);
  let action=null,conf=0;
  if(e8>e21&&e21>e50&&r>50&&r<70){action="BUY";conf=65+(r-50);}
  if(e8<e21&&e21<e50&&r<50&&r>30){action="SELL";conf=65+(50-r);}
  if(!action)return null;
  return {action,confidence:Math.min(90,conf),atr:a,tp_mult:1.5,sl_mult:1.5,window:5};
}

// ── backtest one symbol at one timeframe ──
async function testTF(symbol, granularity, count){
  const candles=await fetchCandles(symbol,granularity,count);
  if(candles.length<150) return {ok:false,reason:`only ${candles.length} candles`};

  const STAKE=1, cost=entryCost(symbol,STAKE), beWR=breakevenWR(symbol,STAKE);
  let wins=0,losses=0,nBal=100;
  const nRets=[];

  for(let i=60;i<candles.length-10;i++){
    const sig=trendSignal(candles.slice(0,i));
    if(!sig||sig.confidence<60) continue;
    const W=sig.window;
    if(i+W>=candles.length) continue;
    const entry=+candles[i].close, a=sig.atr||entry*0.002;
    const tp=sig.action==="BUY"?entry+a*sig.tp_mult:entry-a*sig.tp_mult;
    const sl=sig.action==="BUY"?entry-a*sig.sl_mult:entry+a*sig.sl_mult;
    let won=false,resolved=false;
    for(let j=i+1;j<=i+W;j++){
      const h=+candles[j].high,l=+candles[j].low;
      if(sig.action==="BUY"){if(l<=sl){won=false;resolved=true;break;}if(h>=tp){won=true;resolved=true;break;}}
      else{if(h>=sl){won=false;resolved=true;break;}if(l<=tp){won=true;resolved=true;break;}}
    }
    if(!resolved){const fc=+candles[i+W].close;won=sig.action==="BUY"?fc>entry:fc<entry;}
    const nPnl=(won?STAKE*0.95:-STAKE)-cost;
    nBal+=nPnl; nRets.push(nPnl);
    if(won)wins++;else losses++;
  }

  const total=wins+losses;
  if(total<20) return {ok:false,reason:`only ${total} trades`};
  const wr=wins/total;
  const m=nRets.reduce((a,b)=>a+b,0)/nRets.length;
  const sd=Math.sqrt(nRets.reduce((a,b)=>a+(b-m)**2,0)/nRets.length);
  const sharpe=sd?(m/sd)*Math.sqrt(nRets.length):0;
  const spanDays=((+candles[candles.length-1].epoch - +candles[0].epoch)/86400).toFixed(0);

  return {ok:true,total,wr:+(wr*100).toFixed(1),beWR:+(beWR*100).toFixed(1),
    netPnL:+(nBal-100).toFixed(2),sharpe:+sharpe.toFixed(2),
    beats:wr>=beWR,spanDays:+spanDays,candles:candles.length};
}

// ── run all timeframes for all pairs ──
async function main(){
  console.log("🔬 TIMI MULTI-TIMEFRAME FOREX TEST\n");
  console.log("Testing whether forex works better on higher timeframes than 1m.\n");

  const pairs=["frxEURUSD","frxGBPUSD","frxUSDJPY","frxAUDUSD",
               "frxEURGBP","frxEURJPY","frxGBPJPY","frxXAUUSD"];
  const timeframes=[
    {name:"1m",  gran:60,   count:3000},
    {name:"15m", gran:900,  count:3000},
    {name:"30m", gran:1800, count:3000},
    {name:"45m", gran:2700, count:2500},
    {name:"1h",  gran:3600, count:2500},
  ];

  const all=[];
  for(const pair of pairs){
    console.log("─".repeat(80));
    console.log(`📊 ${pair}`);
    for(const tf of timeframes){
      const r=await testTF(pair,tf.gran,tf.count);
      await new Promise(z=>setTimeout(z,700)); // throttle
      if(!r.ok){ console.log(`   ${tf.name.padEnd(4)} — skipped (${r.reason})`); continue; }
      const flag=r.beats?"🟢 BEATS COSTS":"🔴 below breakeven";
      console.log(`   ${tf.name.padEnd(4)} WR ${r.wr}% (need ${r.beWR}%) | net $${r.netPnL} | Sharpe ${r.sharpe} | ${r.total} trades, ${r.spanDays}d | ${flag}`);
      all.push({pair,tf:tf.name,...r});
    }
  }

  // summary: any timeframe that beats costs
  console.log("\n"+"═".repeat(80));
  console.log("WINNERS — pair/timeframe combos that beat the cost breakeven");
  console.log("═".repeat(80));
  const winners=all.filter(r=>r.beats && r.netPnL>0);
  if(winners.length===0){
    console.log("  None. No forex pair beats costs on any tested timeframe.");
    console.log("  → Honest conclusion: this trend strategy has no forex edge at any TF.");
  } else {
    for(const w of winners.sort((a,b)=>b.netPnL-a.netPnL))
      console.log(`  🟢 ${w.pair} @ ${w.tf}: WR ${w.wr}% vs ${w.beWR}% need | net $${w.netPnL} | Sharpe ${w.sharpe} | ${w.total} trades over ${w.spanDays}d`);
    console.log("\n  ⚠️ A single backtest beating costs is NOT proof of a real edge.");
    console.log("     Run winners through the significance suite before trusting them.");
  }
  console.log("\n⚠️ Costs assume MULT_COMMISSION_PCT="+MULT_COMMISSION_PCT+". Tune to real Deriv receipts.");
}

main();
