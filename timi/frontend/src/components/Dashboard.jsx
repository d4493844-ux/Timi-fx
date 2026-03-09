import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { supabase } from "../lib/supabase";

const SYMBOL_NAMES = { BOOM1000:"BOOM 1000",CRASH1000:"CRASH 1000",frxUSDJPY:"USD/JPY",R_75:"VIX 75",R_25:"VIX 25",R_50:"VIX 50",R_100:"VIX 100",frxEURUSD:"EUR/USD",frxGBPUSD:"GBP/USD",frxGBPJPY:"GBP/JPY",cryBTCUSD:"BTC/USD",cryETHUSD:"ETH/USD",frxXAUUSD:"Gold/USD" };
const ICONS = { BOOM1000:"💥",CRASH1000:"📉",frxUSDJPY:"💴",R_75:"⚡",R_25:"⚡",R_50:"⚡",R_100:"⚡",frxEURUSD:"💶",frxGBPUSD:"💷",cryBTCUSD:"₿",cryETHUSD:"Ξ",frxXAUUSD:"🥇" };
const TICKER = [
  {tag:"ML",text:"Meta-labeling blocks low-confidence trades automatically",s:"pos",l:"cutting losses"},
  {tag:"ML",text:"BOOM1000 backtest 80.5% · CRASH1000 82.7%",s:"pos",l:"LightGBM deployed"},
  {tag:"BOT",text:"Auto-discovers new profitable pairs from ml_models table",s:"pos",l:"no manual config needed"},
  {tag:"BOT",text:"BOOM=MULTUP · CRASH=MULTDOWN · Forex=CALL/PUT",s:"pos",l:"correct contracts"},
  {tag:"DEMO",text:"Running on demo — switch token in Remote Control to go live",s:"pos",l:"real account ready"},
];
const s = {
  page:{paddingBottom:90,minHeight:"100vh"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 20px 0"},
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
  statRow:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:1,background:"#0a2540",marginTop:14,borderRadius:10,overflow:"hidden"},
  statCell:{background:"rgba(7,21,37,0.95)",padding:"10px 6px",textAlign:"center"},
  mlCard:{margin:"0 20px 14px",background:"#071525",border:"1px solid rgba(0,255,157,0.15)",borderRadius:16,padding:16},
  chartCard:{margin:"0 20px 14px",background:"#071525",border:"1px solid #0a2540",borderRadius:16,padding:16},
  stratGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 20px",marginBottom:14},
  stratCard:{background:"#071525",border:"1px solid #0a2540",borderRadius:12,padding:14,position:"relative",overflow:"hidden"},
  scoreBar:{marginTop:8,height:3,background:"#0a2540",borderRadius:2,overflow:"hidden"},
  tickerWrap:{margin:"0 20px 14px",background:"#071525",border:"1px solid #0a2540",borderRadius:12,overflow:"hidden"},
};
function WaveBar({delay,h}){return <motion.div style={{width:3,background:"linear-gradient(to top,#00d4ff,#00ff9d)",borderRadius:2,opacity:0.7}} animate={{height:[4,h,4]}} transition={{duration:0.8+Math.random()*0.6,repeat:Infinity,delay,ease:"easeInOut"}}/>;}

export default function Dashboard({balance,ticks={},timiStatus,signals={},openTrades=[],activeSymbols=[]}) {
  const firstSym = activeSymbols[0] || "BOOM1000";
  const [chartData,setChartData] = useState(()=>{let v=2847;return Array.from({length:60},()=>{v+=(Math.random()-0.48)*2;return{v:+v.toFixed(2)};});});
  const [mlModels,setMlModels]   = useState([]);
  const [liveWR,setLiveWR]       = useState(null);
  const [liveTotal,setLiveTotal] = useState(0);

  useEffect(()=>{const p=ticks[firstSym];if(!p)return;setChartData(prev=>[...prev.slice(1),{v:p}]);},[ticks,firstSym]);
  useEffect(()=>{
    supabase.from("ml_models").select("symbol,win_rate,trained_at")
      .then(({data, error}) => {
        if (error) console.error("❌ ml_models fetch error:", error.message);
        else if (data && data.length > 0) setMlModels(data);
        else {
          // Retry once after 3s in case of cold start
          setTimeout(() => {
            supabase.from("ml_models").select("symbol,win_rate,trained_at")
              .then(({data: d2}) => { if (d2?.length > 0) setMlModels(d2); });
          }, 3000);
        }
      });
    supabase.from("trades").select("result").eq("account_name","edge_function").order("created_at",{ascending:false}).limit(100)
      .then(({data})=>{
        if(!data?.length)return;
        const decided=data.filter(t=>t.result==="win"||t.result==="loss");
        const wins=decided.filter(t=>t.result==="win").length;
        if(decided.length>0){setLiveWR(Math.round(wins/decided.length*100));setLiveTotal(decided.length);}
      });
  },[]);

  const livePrice=ticks[firstSym]||chartData[chartData.length-1]?.v;
  const wins=openTrades.filter(t=>t.pnl>0).length;
  const losses=openTrades.filter(t=>t.pnl<0).length;
  const isDemoMode=!balance?.is_real;
  const cv={hidden:{},visible:{transition:{staggerChildren:0.08}}};
  const iv={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{duration:0.4}}};

  return (
    <motion.div style={s.page} variants={cv} initial="hidden" animate="visible">
      <motion.div style={s.header} variants={iv}>
        <div><div style={s.logoText}>TIMI</div><div style={s.logoSub}>ML TRADING SYSTEM</div></div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
          <div style={s.pill}>
            <motion.div style={{width:6,height:6,borderRadius:"50%",background:"#00ff9d",boxShadow:"0 0 8px #00ff9d"}} animate={{opacity:[1,0.2,1]}} transition={{duration:1.5,repeat:Infinity}}/>
            ML ACTIVE
          </div>
          {isDemoMode&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#ffcc00",background:"rgba(255,204,0,0.08)",border:"1px solid rgba(255,204,0,0.2)",borderRadius:10,padding:"3px 8px"}}>🧪 DEMO</div>}
        </div>
      </motion.div>

      <motion.div style={s.timiBox} variants={iv}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#00d4ff,transparent)"}}/>
        <div style={s.timiRow}>
          <motion.div style={s.avatar} animate={{boxShadow:["0 0 10px rgba(0,212,255,0.2)","0 0 25px rgba(0,212,255,0.5)","0 0 10px rgba(0,212,255,0.2)"]}} transition={{duration:2,repeat:Infinity}}>
            <span style={{fontSize:22}}>🧠</span>
          </motion.div>
          <div style={{flex:1}}>
            <div style={s.timiName}>// TIMI ML ENGINE ONLINE</div>
            <div style={s.timiMsg}>
              {timiStatus||`LightGBM + meta-labeling active · ${mlModels.length} models auto-scanning markets`}
              <motion.span style={{display:"inline-block",width:2,height:13,background:"#00d4ff",marginLeft:2,verticalAlign:"middle"}} animate={{opacity:[1,0,1]}} transition={{duration:0.7,repeat:Infinity}}/>
            </div>
          </div>
        </div>
        <div style={s.waveWrap}>{Array.from({length:28},(_,i)=><WaveBar key={i} delay={i*0.05} h={6+Math.random()*22}/>)}</div>
      </motion.div>

      <motion.div style={s.balCard} variants={iv}>
        <div style={s.balLabel}>// PORTFOLIO VALUE</div>
        <div style={s.balAmt}><span style={{fontSize:18,color:"#00d4ff",marginRight:4}}>{balance?.currency||"USD"}</span>{balance?.balance??"---"}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
          <span style={{background:"rgba(0,255,157,0.1)",border:"1px solid rgba(0,255,157,0.25)",color:"#00ff9d",fontFamily:"'Share Tech Mono',monospace",fontSize:11,padding:"3px 8px",borderRadius:6}}>
            {openTrades.length} open trade{openTrades.length!==1?"s":""}
          </span>
          <span style={{color:"#3a6080",fontSize:12}}>auto-scanning {mlModels.length||3} ML pairs</span>
        </div>
        <div style={s.statRow}>
          {[
            {v:wins,c:"#00ff9d",l:"PROFIT"},
            {v:losses,c:"#ff3366",l:"LOSS"},
            {v:openTrades.length,c:"#00d4ff",l:"OPEN"},
            {v:liveWR!==null?liveWR+"%":"—",c:liveWR>=60?"#00ff9d":liveWR>=50?"#ffcc00":"#3a6080",l:`WR(${liveTotal})`},
          ].map(({v,c,l})=>(
            <div key={l} style={s.statCell}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#3a6080",marginTop:2,letterSpacing:1}}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ML Models panel */}
      <motion.div style={s.mlCard} variants={iv}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#3a6080",letterSpacing:4,marginBottom:12}}>🧠 AUTO-DISCOVERED ML MODELS</div>
        {mlModels.length===0
          ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:"12px 0"}}>
              <div style={{marginBottom:6}}>⏳ Loading ML models...</div>
              <div style={{fontSize:9,color:"#1a3550"}}>Fetching from Supabase ml_models table</div>
            </div>
          : mlModels.map(m=>{
              const wr=Math.round(m.win_rate*100);
              const color=wr>=70?"#00ff9d":wr>=55?"#00d4ff":"#ffcc00";
              return (
                <div key={m.symbol} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #0a2540"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#c8e8ff"}}>{SYMBOL_NAMES[m.symbol]||m.symbol}</div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color}}>{wr}%</div>
                    </div>
                    <div style={{height:4,background:"#0a2540",borderRadius:2,overflow:"hidden"}}>
                      <motion.div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${color}55,${color})`}} initial={{width:0}} animate={{width:wr+"%"}} transition={{duration:1}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a6080"}}>trained: {m.trained_at?.slice(0,10)}</div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00ff9d"}}>✅ AUTO-ACTIVE</div>
                    </div>
                  </div>
                </div>
              );
            })
        }
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:4,lineHeight:1.7}}>
          💡 Add a new symbol to ml_models table → bot trades it automatically next cycle. No config needed.
        </div>
      </motion.div>

      <motion.div style={s.chartCard} variants={iv}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:"#fff"}}>{SYMBOL_NAMES[firstSym]||firstSym}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",marginTop:2}}>LIVE · ML MONITORING</div>
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

      <motion.div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#3a6080",letterSpacing:4,padding:"0 20px",marginBottom:10}} variants={iv}>MARKET SIGNALS</motion.div>
      <motion.div style={s.stratGrid} variants={iv}>
        {activeSymbols.length===0
          ? <div style={{gridColumn:"1/-1",textAlign:"center",color:"#3a6080",fontFamily:"'Share Tech Mono',monospace",fontSize:12,padding:20}}>Enable markets in Settings</div>
          : activeSymbols.map(sym=>{
              const sig=signals[sym];
              const color=sig?.action==="BUY"?"#00ff9d":sig?.action==="SELL"?"#ff3366":"#ffcc00";
              const active=sig&&sig.action!=="HOLD";
              const isML=mlModels.some(m=>m.symbol===sym);
              return (
                <div key={sym} style={active?{...s.stratCard,borderColor:"rgba(0,212,255,0.3)"}:s.stratCard}>
                  {active&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00d4ff,#00ff9d)"}}/>}
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{fontSize:16}}>{ICONS[sym]||"📊"}</div>
                    {isML&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:7,color:"#00ff9d",background:"rgba(0,255,157,0.1)",border:"1px solid rgba(0,255,157,0.3)",padding:"1px 5px",borderRadius:3}}>🧠 ML</div>}
                  </div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#c8e8ff",letterSpacing:2,marginBottom:4}}>{SYMBOL_NAMES[sym]||sym}</div>
                  <div style={{fontSize:11,fontWeight:600,letterSpacing:1,color:sig?color:"#3a6080"}}>{sig?`${sig.action} ${sig.confidence}%`:"SCANNING..."}</div>
                  <div style={s.scoreBar}><motion.div style={{height:"100%",borderRadius:2,background:`linear-gradient(90deg,${color}88,${color})`}} initial={{width:0}} animate={{width:`${sig?.confidence||0}%`}} transition={{duration:1}}/></div>
                </div>
              );
            })
        }
      </motion.div>

      <motion.div style={s.tickerWrap} variants={iv}>
        <div style={{background:"rgba(0,212,255,0.06)",padding:"7px 14px",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid #0a2540"}}>
          <motion.div style={{width:6,height:6,borderRadius:"50%",background:"#00ff9d"}} animate={{opacity:[1,0.2,1]}} transition={{duration:1.5,repeat:Infinity}}/>
          <span style={{fontFamily:"'Orbitron',monospace",fontSize:9,letterSpacing:3,color:"#00d4ff"}}> // ML INTELLIGENCE FEED</span>
        </div>
        <div style={{overflow:"hidden",padding:"8px 0"}}>
          <motion.div style={{display:"flex",gap:40,whiteSpace:"nowrap",width:"max-content"}} animate={{x:["0%","-50%"]}} transition={{duration:28,repeat:Infinity,ease:"linear"}}>
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
