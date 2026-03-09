import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const SYMBOL_NAMES = { BOOM1000:"BOOM 1000",CRASH1000:"CRASH 1000",frxUSDJPY:"USD/JPY",R_75:"VIX 75",R_25:"VIX 25",R_50:"VIX 50",R_100:"VIX 100",frxEURUSD:"EUR/USD",frxGBPUSD:"GBP/USD",cryBTCUSD:"BTC/USD",cryETHUSD:"ETH/USD",frxXAUUSD:"Gold/USD" };

const s = {
  page:{ padding:"20px 20px 100px",background:"#020810",minHeight:"100vh" },
  title:{ fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:"#fff",marginBottom:4 },
  sub:{ fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",letterSpacing:2,marginBottom:16 },
  card:{ background:"#071525",border:"1px solid #0a2540",borderRadius:14,padding:16,marginBottom:12 },
  ct:{ fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00d4ff",letterSpacing:3,marginBottom:12 },
  tab: a=>({ flex:"0 0 auto",padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,letterSpacing:1,background:a?"linear-gradient(90deg,#00d4ff,#0080ff)":"#071525",color:a?"#020810":"#3a6080" }),
};

export default function AIBrain({ symbolStats={}, learningLog=[], aiReady }) {
  const [tab,setTab]         = useState("models");
  const [history,setHistory] = useState([]);
  const [mlModels,setMlModels] = useState([]);
  const [loading,setLoading] = useState(false);
  const [totalStats,setTotalStats] = useState({ wins:0,losses:0,wr:null });

  useEffect(()=>{
    supabase.from("ml_models").select("symbol,win_rate,trained_at").then(({data})=>setMlModels(data||[]));
    supabase.from("trades").select("result,symbol,notes").eq("account_name","edge_function").order("created_at",{ascending:false}).limit(200)
      .then(({data})=>{
        if(!data?.length)return;
        const decided=data.filter(t=>t.result==="win"||t.result==="loss");
        const wins=decided.filter(t=>t.result==="win").length;
        setTotalStats({wins,losses:decided.length-wins,wr:decided.length>0?Math.round(wins/decided.length*100):null});
      });
  },[]);

  useEffect(()=>{
    if(tab==="history"){
      setLoading(true);
      supabase.from("trades").select("*").order("created_at",{ascending:false}).limit(100)
        .then(({data})=>{setHistory(data||[]);setLoading(false);});
    }
  },[tab]);

  return (
    <div style={s.page}>
      <div style={s.title}>AI Brain</div>
      <div style={s.sub}>// LIGHTGBM · META-LABELING · AUTO-DISCOVERY</div>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:"#071525",borderRadius:10,padding:"10px 14px",border:`1px solid ${aiReady?"rgba(0,255,157,0.3)":"rgba(255,204,0,0.3)"}`}}>
        <motion.div style={{width:8,height:8,borderRadius:"50%",background:aiReady?"#00ff9d":"#ffcc00"}} animate={{scale:[1,1.4,1],opacity:[1,0.5,1]}} transition={{duration:1.5,repeat:Infinity}}/>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:aiReady?"#00ff9d":"#ffcc00"}}>
          {aiReady?"ML Engine active · LightGBM + Meta-labeling · Auto-discovers new pairs":"Connecting to ML Engine..."}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {label:"ML MODELS",value:mlModels.length,color:"#00ff9d",sub:"auto-scanning"},
          {label:"LIVE WIN RATE",value:totalStats.wr!==null?totalStats.wr+"%":"—",color:totalStats.wr>=60?"#00ff9d":totalStats.wr>=50?"#ffcc00":"#3a6080",sub:`${totalStats.wins+totalStats.losses} trades`},
          {label:"META-LABELING",value:"ON",color:"#00ff9d",sub:"blocking bad trades"},
        ].map(({label,value,color,sub})=>(
          <div key={label} style={{background:"#071525",border:"1px solid #0a2540",borderRadius:12,padding:"12px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#3a6080",letterSpacing:2,marginBottom:6}}>{label}</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color}}>{value}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:3}}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto"}}>
        {["models","pipeline","symbols","log","history"].map(t=>(
          <button key={t} style={s.tab(tab===t)} onClick={()=>setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab==="models" && (
        <div>
          <div style={s.card}>
            <div style={s.ct}>DEPLOYED ML MODELS — AUTO-ACTIVE</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginBottom:14,lineHeight:1.7}}>
              Each model was trained on 4,976 real candles using time-series split (no lookahead).<br/>
              A meta-model filters every signal. Bot auto-picks up new models added to the table.
            </div>
            {mlModels.length===0
              ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:24}}>Loading from Supabase...</div>
              : mlModels.map(m=>{
                  const wr=Math.round(m.win_rate*100);
                  const color=wr>=70?"#00ff9d":wr>=55?"#00d4ff":"#ffcc00";
                  return (
                    <motion.div key={m.symbol} style={{marginBottom:18,paddingBottom:16,borderBottom:"1px solid #0a2540"}} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,color:"#c8e8ff",fontWeight:700}}>{SYMBOL_NAMES[m.symbol]||m.symbol}</div>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:3}}>
                            trained: {m.trained_at?.slice(0,10)} · trained: {m.trained_at?.slice(0,10)}
                          </div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"'Orbitron',monospace",fontSize:22,fontWeight:900,color}}>{wr}%</div>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00ff9d"}}>✅ AUTO-ACTIVE</div>
                        </div>
                      </div>
                      <div style={{height:6,background:"#0a2540",borderRadius:3,overflow:"hidden"}}>
                        <motion.div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${color}55,${color})`}} initial={{width:0}} animate={{width:wr+"%"}} transition={{duration:1,delay:0.2}}/>
                      </div>
                    </motion.div>
                  );
                })
            }
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:4,lineHeight:1.8,background:"rgba(0,212,255,0.04)",borderRadius:8,padding:"10px 12px"}}>
              💡 <strong style={{color:"#00d4ff"}}>Auto-discovery:</strong> Upload a new model to <code style={{color:"#00ff9d"}}>ml_models</code> table and the bot automatically starts trading it — no config change needed.
            </div>
          </div>
        </div>
      )}

      {tab==="pipeline" && (
        <div style={s.card}>
          <div style={s.ct}>HOW THE ML PIPELINE WORKS</div>
          {[
            {step:"01",title:"Data Collection",desc:"4,976 1-minute candles per symbol pulled from Deriv WebSocket. Stored as CSV.",color:"#00d4ff"},
            {step:"02",title:"Feature Engineering",desc:"21 features per candle: RSI, MACD, Bollinger position, EMA distances (8/21/50), ATR%, candle body, momentum (1/3/5/10 bars), 5M trend.",color:"#00d4ff"},
            {step:"03",title:"Time-Series Split",desc:"70% train / 15% meta-train / 15% test. No shuffling. Future data never touches training. No lookahead bias.",color:"#ffcc00"},
            {step:"04",title:"LightGBM Classifier",desc:"Trained on 70% of data. Predicts probability of next candle being a winning trade. Threshold: 0.5.",color:"#00ff9d"},
            {step:"05",title:"Meta-Labeling (Phase 3)",desc:"A second LightGBM trained on the 15% meta-train set. Takes the main model's prediction + all 21 features as input. Only passes a trade when meta_conf ≥ threshold (default 0.60). This is what cuts losing trades dramatically.",color:"#00ff9d"},
            {step:"06",title:"Compact Export",desc:"Trees converted to nested dicts (f/t/l/r/v format). Main: 80 trees. Meta: 40 trees. ~52KB per model.",color:"#00d4ff"},
            {step:"07",title:"Supabase Upload",desc:"Models stored in ml_models table as JSON. Edge function loads them at runtime — no cold storage, no file system.",color:"#00d4ff"},
            {step:"08",title:"Live Inference",desc:"Every 5 min: fetch 200 candles → build 21 features → main model → meta-model filter → trade only if meta_conf ≥ threshold. Bot auto-discovers any new model added to the table.",color:"#00ff9d"},
          ].map(({step,title,desc,color})=>(
            <div key={step} style={{display:"flex",gap:12,marginBottom:14,paddingBottom:14,borderBottom:"1px solid #0a2540"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:15,fontWeight:900,color,minWidth:28}}>{step}</div>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#c8e8ff",marginBottom:3}}>{title}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",lineHeight:1.7}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="symbols" && (
        <div style={s.card}>
          <div style={s.ct}>LIVE SYMBOL PERFORMANCE</div>
          {Object.keys(symbolStats).length===0
            ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:24,lineHeight:1.8}}>
                No live trades yet.<br/>Bot running on demo account — trades log here automatically.
              </div>
            : Object.entries(symbolStats).sort((a,b)=>(b[1].win_count+b[1].loss_count)-(a[1].win_count+a[1].loss_count)).map(([sym,stat])=>{
                const total=(stat.win_count||0)+(stat.loss_count||0);
                const wr=total>0?Math.round(stat.win_count/total*100):0;
                const isML=mlModels.some(m=>m.symbol===sym);
                const color=wr>=60?"#00ff9d":wr>=50?"#00d4ff":"#ffcc00";
                return (
                  <div key={sym} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #071525"}}>
                    <div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color}}>{sym}</span>
                        {isML&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00d4ff",background:"rgba(0,212,255,0.1)",padding:"1px 5px",borderRadius:3}}>🧠 ML</span>}
                      </div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:2}}>
                        {stat.win_count}W / {stat.loss_count}L · ${(stat.total_pnl||0).toFixed(2)}
                      </div>
                    </div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:20,fontWeight:900,color}}>{wr}%</div>
                  </div>
                );
              })
          }
        </div>
      )}

      {tab==="log" && (
        <div style={s.card}>
          <div style={s.ct}>LIVE ML LOG</div>
          {learningLog.length===0
            ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:24,lineHeight:1.8}}>
                Log appears after bot cycles.<br/>Shows: model confidence, meta-filter decisions, trade outcomes.
              </div>
            : learningLog.map((e,i)=>(
                <div key={i} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,padding:"5px 0",borderBottom:"1px solid #071525",color:e.msg?.includes("❌")?"#ff3366":e.msg?.includes("✅")?"#00ff9d":"#c8e8ff"}}>
                  <span style={{color:"#3a6080"}}>{e.time} </span>{e.msg}
                </div>
              ))
          }
        </div>
      )}

      {tab==="history" && (
        <div style={s.card}>
          <div style={s.ct}>FULL TRADE HISTORY</div>
          {loading&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#00d4ff",textAlign:"center",padding:20}}>Loading from Supabase...</div>}
          {!loading&&history.length===0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:20}}>No trades yet.</div>}
          {history.map(t=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #071525"}}>
              <div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:t.type==="BUY"?"#00ff9d":"#ff3366"}}>{t.type}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#c8e8ff"}}>{t.symbol}</span>
                  <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>{t.confidence}%</span>
                  {mlModels.some(m=>m.symbol===t.symbol)&&<span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#00d4ff",background:"rgba(0,212,255,0.1)",padding:"1px 5px",borderRadius:3}}>ML</span>}
                </div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:3}}>
                  {new Date(t.created_at).toLocaleString()}
                  {t.notes&&` · ${t.notes.slice(0,50)}`}
                </div>
              </div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:t.result==="win"?"#00ff9d":t.result==="loss"?"#ff3366":"#ffcc00"}}>
                {t.result?.toUpperCase()||"OPEN"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
