import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const SYMBOL_NAMES = {
  R_75:"VIX 75", R_25:"VIX 25", R_50:"VIX 50", R_100:"VIX 100",
  BOOM1000:"BOOM 1000", BOOM500:"BOOM 500", CRASH1000:"CRASH 1000", CRASH500:"CRASH 500",
  frxEURUSD:"EUR/USD", frxGBPUSD:"GBP/USD", frxUSDJPY:"USD/JPY", frxUSDNGN:"USD/NGN",
  cryBTCUSD:"BTC/USD", cryETHUSD:"ETH/USD"
};
const ICONS = {
  R_75:"⚡",R_25:"⚡",R_50:"⚡",R_100:"⚡",
  BOOM1000:"💥",BOOM500:"💥",CRASH1000:"📉",CRASH500:"📉",
  frxEURUSD:"💶",frxGBPUSD:"💷",frxUSDJPY:"💴",frxUSDNGN:"🇳🇬",
  cryBTCUSD:"₿",cryETHUSD:"Ξ"
};

const TICKER = [
  {tag:"FED",text:"Powell signals no rush on rate cuts",s:"neg",l:"bearish USD"},
  {tag:"EUR",text:"ECB holds rates, inflation cooling",s:"pos",l:"bullish EUR/USD"},
  {tag:"BTC",text:"ETF inflows surge $420M this week",s:"pos",l:"bullish BTC"},
  {tag:"NGN",text:"CBN intervenes at ₦1,580/$",s:"neg",l:"volatility high"},
];

const s = {
  page:{paddingBottom:90,minHeight:"100vh"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 20px 0"},
  logoText:{fontFamily:"'Orbitron',monospace",fontWeight:900,fontSize:26,background:"linear-gradient(135deg,#00d4ff,#00ff9d)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:4},
  logoSub:{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",letterSpacing:3},
  pill:{display:"flex",alignItems:"center",gap:6,background:"rgba(0,255,157,0.08)",border:"1px solid rgba(0,255,157,0.2)",borderRadius:20,padding:"6px 12px",fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#00ff9d",letterSpacing:1},
  timiBox:{margin:"16px 20px",background:"#071525",border:"1px solid #0a2540",borderRadius:16,padding:"16px 16px 12px",position:"relative",overflow:"hidden"},
  timiRow:{display:"flex",gap:14,alignItems:"center",marginBottom:12},
  avatar:{width:48,height:48,borderRadius:"50%",border:"2px solid #00d4ff",boxShadow:"0 0 16px rgba(0,212,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:"#020810"},
  timiName:{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00d4ff",letterSpacing:3,marginBottom:4},
  timiMsg:{fontSize:13,color:"#c8e8ff",lineHeight:1.5,fontWeight:300},
  waveWrap:{display:"flex",alignItems:"center",justifyContent:"center",gap:3,height:28},
  balCard:{margin:"0 20px 14px",background:"linear-gradient(135deg,#071525,#030c18)",border:"1px solid #0a2540",borderRadius:16,padding:20},
  balLabel:{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",letterSpacing:3,marginBottom:8},
  balAmt:{fontFamily:"'Orbitron',monospace",fontSize:34,fontWeight:700,color:"#fff"},
  statRow:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:"#0a2540",marginTop:14,borderRadius:10,overflow:"hidden"},
  statCell:{background:"rgba(7,21,37,0.95)",padding:"10px 6px",textAlign:"center"},
  chartCard:{margin:"0 20px 14px",background:"#071525",border:"1px solid #0a2540",borderRadius:16,padding:16},
  confCard:{margin:"0 20px 14px",background:"#071525",border:"1px solid #0a2540",borderRadius:16,padding:20,textAlign:"center"},
  stratGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px",marginBottom:14},
  stratCard:{background:"#071525",border:"1px solid #0a2540",borderRadius:12,padding:14,position:"relative",overflow:"hidden"},
  scoreBar:{marginTop:8,height:3,background:"#0a2540",borderRadius:2,overflow:"hidden"},
  tickerWrap:{margin:"0 20px 14px",background:"#071525",border:"1px solid #0a2540",borderRadius:12,overflow:"hidden"},
};

function WaveBar({delay,h}){
  return <motion.div style={{width:3,background:"linear-gradient(to top,#00d4ff,#00ff9d)",borderRadius:2,opacity:0.7}} animate={{height:[4,h,4]}} transition={{duration:0.8+Math.random()*0.6,repeat:Infinity,delay,ease:"easeInOut"}}/>;
}

export default function Dashboard({balance,ticks={},timiStatus,signals={},openTrades=[],activeSymbols=[]}) {
  const firstSym = activeSymbols[0] || "R_75";
  const [chartData,setChartData] = useState(()=>{
    let v=2847; return Array.from({length:60},()=>{v+=(Math.random()-0.48)*2;return {v:+v.toFixed(2)};});
  });

  useEffect(()=>{
    const p = ticks[firstSym]; if(!p) return;
    setChartData(prev=>[...prev.slice(1),{v:p}]);
  },[ticks,firstSym]);

  const livePrice = ticks[firstSym] || chartData[chartData.length-1]?.v;
  const signalEntries = Object.entries(signals);
  const best = signalEntries.reduce((b,[sym,sig])=>sig.confidence>(b?.sig?.confidence||0)?{sym,sig}:b,null);
  const overallConf = best?.sig?.confidence||0;
  const overallAction = best?.sig?.action||"SCANNING";
  const wins = openTrades.filter(t=>t.pnl>0).length;
  const losses = openTrades.filter(t=>t.pnl<0).length;
  const cv={hidden:{},visible:{transition:{staggerChildren:0.08}}};
  const iv={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{duration:0.4}}};

  return (
    <motion.div style={s.page} variants={cv} initial="hidden" animate="visible">
      <motion.div style={s.header} variants={iv}>
        <div>
          <div style={s.logoText}>TIMI</div>
          <div style={s.logoSub}>AI TRADING SYSTEM</div>
        </div>
        <div style={s.pill}>
          <motion.div style={{width:6,height:6,borderRadius:"50%",background:"#00ff9d",boxShadow:"0 0 8px #00ff9d"}} animate={{opacity:[1,0.2,1]}} transition={{duration:1.5,repeat:Infinity}}/>
          ACTIVE
        </div>
      </motion.div>

      <motion.div style={s.timiBox} variants={iv}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#00d4ff,transparent)"}}/>
        <div style={s.timiRow}>
          <motion.div style={s.avatar} animate={{boxShadow:["0 0 10px rgba(0,212,255,0.2)","0 0 25px rgba(0,212,255,0.5)","0 0 10px rgba(0,212,255,0.2)"]}} transition={{duration:2,repeat:Infinity}}>
            <span style={{fontSize:22}}>🤖</span>
          </motion.div>
          <div style={{flex:1}}>
            <div style={s.timiName}>// TIMI ONLINE</div>
            <div style={s.timiMsg}>
              {timiStatus||"Scanning markets..."}
              <motion.span style={{display:"inline-block",width:2,height:13,background:"#00d4ff",marginLeft:2,verticalAlign:"middle"}} animate={{opacity:[1,0,1]}} transition={{duration:0.7,repeat:Infinity}}/>
            </div>
          </div>
        </div>
        <div style={s.waveWrap}>{Array.from({length:28},(_,i)=><WaveBar key={i} delay={i*0.05} h={6+Math.random()*22}/>)}</div>
      </motion.div>

      <motion.div style={s.balCard} variants={iv}>
        <div style={s.balLabel}>// PORTFOLIO VALUE</div>
        <div style={s.balAmt}><span style={{fontSize:18,color:"#00d4ff",marginRight:4}}>{balance?.currency||"USD"}</span>{balance?.balance??"---"}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
          <span style={{background:"rgba(0,255,157,0.1)",border:"1px solid rgba(0,255,157,0.25)",color:"#00ff9d",fontFamily:"'Share Tech Mono',monospace",fontSize:11,padding:"3px 8px",borderRadius:6}}>{openTrades.length} open trade{openTrades.length!==1?"s":""}</span>
          <span style={{color:"#3a6080",fontSize:12}}>trading {activeSymbols.length} markets</span>
        </div>
        <div style={s.statRow}>
          {[{v:wins,c:"#00ff9d",l:"PROFIT"},{v:losses,c:"#ff3366",l:"LOSS"},{v:openTrades.length,c:"#00d4ff",l:"OPEN"}].map(({v,c,l})=>(
            <div key={l} style={s.statCell}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:10,color:"#3a6080",marginTop:2,letterSpacing:1}}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div style={s.chartCard} variants={iv}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:"#fff"}}>{SYMBOL_NAMES[firstSym]||firstSym}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",marginTop:2}}>LIVE · 24/7</div>
          </div>
          <motion.div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:20,color:"#00d4ff"}} animate={{opacity:[1,0.7,1]}} transition={{duration:1.2,repeat:Infinity}}>{livePrice}</motion.div>
        </div>
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={chartData}>
            <Line type="monotone" dataKey="v" stroke="#00d4ff" strokeWidth={1.5} dot={false} isAnimationActive={false}/>
            <Tooltip contentStyle={{background:"#071525",border:"1px solid #0a2540",borderRadius:8,fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#00d4ff"}} formatter={v=>[v,"Price"]} labelFormatter={()=>""}/>
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div style={s.confCard} variants={iv}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,letterSpacing:3,color:"#3a6080",marginBottom:12}}>// SIGNAL CONFLUENCE</div>
        <svg width="160" height="85" viewBox="0 0 160 85" style={{display:"block",margin:"0 auto 8px"}}>
          <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff3366"/><stop offset="50%" stopColor="#ffcc00"/><stop offset="100%" stopColor="#00ff9d"/></linearGradient></defs>
          <path d="M 10 78 A 70 70 0 0 1 150 78" stroke="#0a2540" strokeWidth="8" fill="none" strokeLinecap="round"/>
          <path d="M 10 78 A 70 70 0 0 1 150 78" stroke="url(#g1)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220-(overallConf/100)*165}/>
          <line x1="80" y1="78" x2={80+45*Math.cos(Math.PI-(overallConf/100)*Math.PI)} y2={78-45*Math.sin((overallConf/100)*Math.PI)} stroke="#00d4ff" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="80" cy="78" r="5" fill="#00d4ff"/>
        </svg>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:38,fontWeight:900,background:"linear-gradient(135deg,#00d4ff,#00ff9d)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{overallConf}%</div>
        <div style={{fontSize:12,color:overallAction==="BUY"?"#00ff9d":overallAction==="SELL"?"#ff3366":"#ffcc00",letterSpacing:2,marginTop:4}}>{overallAction}</div>
      </motion.div>

      <motion.div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#3a6080",letterSpacing:4,padding:"0 20px",marginBottom:10}} variants={iv}>MARKET SIGNALS</motion.div>
      <motion.div style={s.stratGrid} variants={iv}>
        {activeSymbols.length===0
          ? <div style={{gridColumn:"1/-1",textAlign:"center",color:"#3a6080",fontFamily:"'Share Tech Mono',monospace",fontSize:12,padding:20}}>Enable markets in Settings</div>
          : activeSymbols.map(sym=>{
            const sig=signals[sym];
            const color=sig?.action==="BUY"?"#00ff9d":sig?.action==="SELL"?"#ff3366":"#ffcc00";
            const active=sig&&sig.action!=="HOLD";
            return (
              <div key={sym} style={active?{...s.stratCard,borderColor:"rgba(0,212,255,0.3)"}:s.stratCard}>
                {active&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00d4ff,#00ff9d)"}}/>}
                <div style={{fontSize:18,marginBottom:6}}>{ICONS[sym]||"📊"}</div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#c8e8ff",letterSpacing:2,marginBottom:4}}>{SYMBOL_NAMES[sym]||sym}</div>
                <div style={{fontSize:11,fontWeight:600,letterSpacing:1,color:sig?color:"#3a6080"}}>{sig?`${sig.action} ${sig.confidence}%`:"LOADING..."}</div>
                <div style={s.scoreBar}><motion.div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${color}88,${color})`}} initial={{width:0}} animate={{width:`${sig?.confidence||0}%`}} transition={{duration:1}}/></div>
              </div>
            );
          })
        }
      </motion.div>

      <motion.div style={s.tickerWrap} variants={iv}>
        <div style={{background:"rgba(0,212,255,0.06)",padding:"7px 14px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #0a2540"}}>
          <motion.div style={{width:6,height:6,borderRadius:"50%",background:"#00ff9d"}} animate={{opacity:[1,0.2,1]}} transition={{duration:1.5,repeat:Infinity}}/>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,letterSpacing:3,color:"#00d4ff"}}> // LIVE INTELLIGENCE</span>
        </div>
        <div style={{overflow:"hidden",padding:"8px 0"}}>
          <motion.div style={{display:"flex",gap:40,whiteSpace:"nowrap",width:"max-content"}} animate={{x:["0%","-50%"]}} transition={{duration:25,repeat:Infinity,ease:"linear"}}>
            {[...TICKER,...TICKER].map((t,i)=>(
              <span key={i} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#c8e8ff",padding:"0 14px"}}>
                <span style={{color:"#00ff9d",marginRight:6}}>[{t.tag}]</span>{t.text} — <span style={{color:t.s==="pos"?"#00ff9d":"#ff3366"}}>{t.l}</span>
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
