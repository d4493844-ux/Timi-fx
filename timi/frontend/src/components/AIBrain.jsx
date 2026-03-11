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
  badge: (c)=>({ fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:c,background:`${c}18`,padding:"2px 7px",borderRadius:4,border:`1px solid ${c}44` }),
};

export default function AIBrain({ symbolStats={}, learningLog=[], aiReady }) {
  const [tab, setTab]               = useState("brain");
  const [history, setHistory]       = useState([]);
  const [mlModels, setMlModels]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [totalStats, setTotalStats] = useState({ wins:0,losses:0,wr:null });
  const [learnedRules, setLearnedRules] = useState([]);
  const [brainStats, setBrainStats] = useState({ blocked:0, boosted:0, lossPatterns:0, winPatterns:0 });
  const [hmmLog, setHmmLog]         = useState([]);

  useEffect(()=>{
    // Load ML models
    supabase.from("ml_models").select("symbol,win_rate,trained_at")
      .then(({data})=>setMlModels(data||[]));

    // Load trade stats
    supabase.from("trades").select("result,symbol,session,confidence")
      .eq("account_name","edge_function")
      .order("created_at",{ascending:false}).limit(200)
      .then(({data})=>{
        if(!data?.length) return;
        const decided = data.filter(t=>t.result==="win"||t.result==="loss");
        const wins = decided.filter(t=>t.result==="win").length;
        setTotalStats({wins,losses:decided.length-wins,wr:decided.length>0?Math.round(wins/decided.length*100):null});
      });

    // Load learned rules from AI Brain
    supabase.from("learned_rules").select("*").order("updated_at",{ascending:false}).limit(100)
      .then(({data,error})=>{
        if(error||!data) return;
        setLearnedRules(data);
        const lossP = data.filter(r=>r.rule_type==="loss"&&r.loss_count>=3);
        const winP  = data.filter(r=>r.rule_type==="win"&&r.win_count>=3);
        const blocked = data.filter(r=>r.loss_count>0).reduce((a,b)=>a+b.loss_count,0);
        const boosted = data.filter(r=>r.win_count>0).reduce((a,b)=>a+b.win_count,0);
        setBrainStats({ blocked:lossP.length, boosted:winP.length, lossPatterns:lossP.length, winPatterns:winP.length });
      });

    // Load recent scan logs that contain HMM data from trades.patterns
    supabase.from("trades").select("symbol,type,result,patterns,session,created_at,confidence")
      .not("patterns","is",null)
      .order("created_at",{ascending:false}).limit(30)
      .then(({data})=>setHmmLog(data||[]));
  },[]);

  useEffect(()=>{
    if(tab==="history"){
      setLoading(true);
      supabase.from("trades").select("*").order("created_at",{ascending:false}).limit(100)
        .then(({data})=>{setHistory(data||[]);setLoading(false);});
    }
  },[tab]);

  const lossPatterns = learnedRules.filter(r=>r.loss_count>=3&&r.loss_count/(r.loss_count+r.win_count+0.001)>0.65).sort((a,b)=>b.loss_count-a.loss_count);
  const winPatterns  = learnedRules.filter(r=>r.win_count>=3&&r.win_count/(r.loss_count+r.win_count+0.001)>0.65).sort((a,b)=>b.win_count-a.win_count);

  return (
    <div style={s.page}>
      <div style={s.title}>AI Brain</div>
      <div style={s.sub}>// LIGHTGBM · META-LABELING · HMM · SELF-LEARNING</div>

      {/* Status bar */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:"#071525",borderRadius:10,padding:"10px 14px",border:`1px solid ${aiReady?"rgba(0,255,157,0.3)":"rgba(255,204,0,0.3)"}`}}>
        <motion.div style={{width:8,height:8,borderRadius:"50%",background:aiReady?"#00ff9d":"#ffcc00"}} animate={{scale:[1,1.4,1],opacity:[1,0.5,1]}} transition={{duration:1.5,repeat:Infinity}}/>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:aiReady?"#00ff9d":"#ffcc00"}}>
          {aiReady?"ML Engine · LightGBM + Meta-labeling + HMM Regime + AI Brain Learning":"Connecting to ML Engine..."}
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[
          {label:"ML MODELS",   value:mlModels.length,         color:"#00ff9d", sub:"trained"},
          {label:"LIVE WIN RATE",value:totalStats.wr!==null?totalStats.wr+"%":"—", color:totalStats.wr>=60?"#00ff9d":totalStats.wr>=50?"#ffcc00":"#ff3366", sub:`${totalStats.wins+totalStats.losses} trades`},
          {label:"LOSS PATTERNS",value:brainStats.lossPatterns, color:"#ff3366", sub:"AI blocking"},
          {label:"WIN PATTERNS", value:brainStats.winPatterns,  color:"#00ff9d", sub:"AI boosting"},
        ].map(({label,value,color,sub})=>(
          <div key={label} style={{background:"#071525",border:"1px solid #0a2540",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:8,color:"#3a6080",letterSpacing:1,marginBottom:6}}>{label}</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color}}>{value}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:3}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {["brain","hmm","models","pipeline","symbols","log","history"].map(t=>(
          <button key={t} style={s.tab(tab===t)} onClick={()=>setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </div>

      {/* ── AI BRAIN TAB ── */}
      {tab==="brain" && (
        <div>
          {/* How it works */}
          <div style={s.card}>
            <div style={s.ct}>// HOW AI BRAIN LEARNS</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",lineHeight:1.9,marginBottom:12}}>
              After every trade cycle the AI Brain analyzes recent completed trades.<br/>
              It builds a <span style={{color:"#00d4ff"}}>market fingerprint</span> — a snapshot of RSI zone, EMA stack, BB position, 5M trend, HMM regime and session.<br/>
              Fingerprints with <span style={{color:"#ff3366"}}>3+ losses and 65%+ loss rate</span> get blocked automatically.<br/>
              Fingerprints with <span style={{color:"#00ff9d"}}>3+ wins and 70%+ win rate</span> get a confidence boost.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {icon:"🚫",label:"LOSS PATTERN DETECTED",desc:"Bot sees RSI overbought + EMA bearish 4 times, loses 3. AI Brain adds fingerprint to blocklist. Same setup never trades again.",color:"#ff3366"},
                {icon:"⚡",label:"WIN PATTERN DETECTED",desc:"Bot sees RSI neutral + strong EMA bull + London session win 4/5 times. AI Brain boosts confidence +5 for matching setups.",color:"#00ff9d"},
              ].map(({icon,label,desc,color})=>(
                <div key={label} style={{background:`${color}08`,border:`1px solid ${color}22`,borderRadius:10,padding:12}}>
                  <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color,marginBottom:6}}>{label}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",lineHeight:1.7}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Loss patterns being blocked */}
          <div style={s.card}>
            <div style={s.ct}>🚫 ACTIVE LOSS PATTERNS — BEING BLOCKED</div>
            {lossPatterns.length===0
              ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:"20px 0",lineHeight:1.8}}>
                  No loss patterns learned yet.<br/>
                  <span style={{fontSize:9}}>AI Brain needs a few completed trades to start learning.</span>
                </div>
              : lossPatterns.slice(0,10).map((rule,i)=>{
                  const parts = rule.fingerprint.split("|");
                  const lossRate = Math.round(rule.loss_count/(rule.loss_count+rule.win_count)*100);
                  return (
                    <motion.div key={rule.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                      style={{padding:"10px 0",borderBottom:"1px solid #0a2540"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <span style={s.badge("#ff3366")}>{parts[0]}</span>
                          <span style={s.badge("#ffcc00")}>{parts[1]}</span>
                          <span style={s.badge("#3a6080")}>RSI:{parts[2]}</span>
                          <span style={s.badge("#3a6080")}>EMA:{parts[3]}</span>
                          <span style={s.badge("#3a6080")}>BB:{parts[4]}</span>
                          <span style={s.badge("#3a6080")}>5M:{parts[5]}</span>
                          {parts[6]&&<span style={s.badge("#0080ff")}>{parts[6]}</span>}
                          {parts[7]&&<span style={s.badge("#3a6080")}>{parts[7]}</span>}
                        </div>
                        <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:"#ff3366",minWidth:40,textAlign:"right"}}>{lossRate}%L</div>
                      </div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>
                        {rule.loss_count} losses / {rule.win_count} wins · last seen {new Date(rule.updated_at).toLocaleDateString()}
                      </div>
                    </motion.div>
                  );
                })
            }
          </div>

          {/* Win patterns being boosted */}
          <div style={s.card}>
            <div style={s.ct}>⚡ ACTIVE WIN PATTERNS — CONFIDENCE BOOSTED</div>
            {winPatterns.length===0
              ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:"20px 0",lineHeight:1.8}}>
                  No win patterns learned yet.<br/>
                  <span style={{fontSize:9}}>Patterns emerge after consistent wins in similar conditions.</span>
                </div>
              : winPatterns.slice(0,10).map((rule,i)=>{
                  const parts = rule.fingerprint.split("|");
                  const winRate = Math.round(rule.win_count/(rule.loss_count+rule.win_count)*100);
                  return (
                    <motion.div key={rule.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}
                      style={{padding:"10px 0",borderBottom:"1px solid #0a2540"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <span style={s.badge("#00ff9d")}>{parts[0]}</span>
                          <span style={s.badge("#ffcc00")}>{parts[1]}</span>
                          <span style={s.badge("#3a6080")}>RSI:{parts[2]}</span>
                          <span style={s.badge("#3a6080")}>EMA:{parts[3]}</span>
                          <span style={s.badge("#3a6080")}>BB:{parts[4]}</span>
                          <span style={s.badge("#3a6080")}>5M:{parts[5]}</span>
                          {parts[6]&&<span style={s.badge("#0080ff")}>{parts[6]}</span>}
                        </div>
                        <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:"#00ff9d",minWidth:40,textAlign:"right"}}>{winRate}%W</div>
                      </div>
                      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>
                        {rule.win_count} wins / {rule.loss_count} losses · last seen {new Date(rule.updated_at).toLocaleDateString()}
                      </div>
                    </motion.div>
                  );
                })
            }
          </div>

          {/* All learned rules summary */}
          <div style={s.card}>
            <div style={s.ct}>📚 ALL LEARNED RULES ({learnedRules.length})</div>
            {learnedRules.length===0
              ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:20}}>
                  Waiting for completed trades...<br/>
                  <span style={{fontSize:9}}>Run SQL to create learned_rules table if not done yet.</span>
                </div>
              : <div style={{maxHeight:300,overflowY:"auto"}}>
                  {learnedRules.map((rule,i)=>{
                    const parts   = rule.fingerprint.split("|");
                    const total   = rule.win_count + rule.loss_count;
                    const wr      = total>0 ? Math.round(rule.win_count/total*100) : 0;
                    const color   = wr>=60?"#00ff9d":wr>=40?"#ffcc00":"#ff3366";
                    return (
                      <div key={rule.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #071525"}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#c8e8ff",marginBottom:2}}>
                            {parts[0]} {parts[1]} · {parts[2]} RSI · {parts[3]} EMA · {parts[6]||""}
                          </div>
                          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a6080"}}>
                            {rule.win_count}W / {rule.loss_count}L · {total} trades
                          </div>
                        </div>
                        <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color,marginLeft:8}}>{wr}%</div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        </div>
      )}

      {/* ── HMM REGIME TAB ── */}
      {tab==="hmm" && (
        <div>
          <div style={s.card}>
            <div style={s.ct}>// HMM MARKET REGIME DETECTION</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",lineHeight:1.9,marginBottom:16}}>
              Before every trade the bot runs Hidden Markov Model analysis on the last 60 candles.<br/>
              It detects the current market <span style={{color:"#00d4ff"}}>hidden state</span> and only trades in favorable regimes.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[
                {state:"📈 UPTREND",   desc:"EMA8>EMA21>EMA50, consistent up moves, low noise",  action:"BUY only",  color:"#00ff9d", tradable:true},
                {state:"📉 DOWNTREND", desc:"EMA8<EMA21<EMA50, consistent down moves, low noise", action:"SELL only", color:"#ff3366", tradable:true},
                {state:"😐 RANGING",   desc:"Low directional consistency, tight range, sideways",  action:"SKIP",      color:"#ffcc00", tradable:false},
                {state:"⚡ HIGH VOL",  desc:"Erratic big moves, news/spike, unpredictable",        action:"SKIP",      color:"#ff8800", tradable:false},
              ].map(({state,desc,action,color,tradable})=>(
                <div key={state} style={{background:`${color}08`,border:`1px solid ${color}22`,borderRadius:10,padding:12}}>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color,marginBottom:6}}>{state}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",lineHeight:1.7,marginBottom:8}}>{desc}</div>
                  <div style={{...s.badge(tradable?"#00ff9d":"#ff3366"),display:"inline-block"}}>{action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent HMM decisions from trade logs */}
          <div style={s.card}>
            <div style={s.ct}>RECENT HMM REGIME DECISIONS</div>
            {hmmLog.length===0
              ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:20}}>
                  No HMM data yet — starts logging after next trade cycle.
                </div>
              : hmmLog.map((t,i)=>{
                  const regime = t.patterns?.match(/regime:(\w+)/)?.[1] || "unknown";
                  const t5m    = t.patterns?.match(/trend5m:([-\d]+)/)?.[1] || "0";
                  const regimeColor = regime.includes("Uptrend")?"#00ff9d":regime.includes("Downtrend")?"#ff3366":regime==="Ranging"?"#ffcc00":"#ff8800";
                  return (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #071525"}}>
                      <div>
                        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3}}>
                          <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:t.type==="BUY"?"#00ff9d":"#ff3366"}}>{t.type}</span>
                          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#c8e8ff"}}>{SYMBOL_NAMES[t.symbol]||t.symbol}</span>
                          <span style={s.badge(regimeColor)}>{regime}</span>
                          <span style={s.badge("#3a6080")}>5M:{t5m==="1"?"↑":t5m==="-1"?"↓":"→"}</span>
                        </div>
                        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>
                          {new Date(t.created_at).toLocaleString()} · {t.session} · conf:{t.confidence}%
                        </div>
                      </div>
                      <div style={{fontFamily:"'Orbitron',monospace",fontSize:12,fontWeight:700,color:t.result==="win"?"#00ff9d":t.result==="loss"?"#ff3366":"#ffcc00"}}>
                        {t.result?.toUpperCase()||"OPEN"}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      )}

      {/* ── MODELS TAB ── */}
      {tab==="models" && (
        <div style={s.card}>
          <div style={s.ct}>DEPLOYED ML MODELS — AUTO-ACTIVE</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginBottom:14,lineHeight:1.7}}>
            Each model trained on 4,976 real candles using time-series split (no lookahead).<br/>
            Meta-model filters every signal. Bot auto-picks up new models added to the table.
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
                        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:3}}>trained: {m.trained_at?.slice(0,10)}</div>
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
        </div>
      )}

      {/* ── PIPELINE TAB ── */}
      {tab==="pipeline" && (
        <div style={s.card}>
          <div style={s.ct}>HOW THE FULL PIPELINE WORKS</div>
          {[
            {step:"01",title:"Session Check",        desc:"Forex pairs: London (7am-4pm UTC) or New York (12pm-9pm UTC) only. Synthetics trade 24/7.",color:"#00d4ff"},
            {step:"02",title:"HMM Regime Detection", desc:"Analyzes last 60 candles. Detects Uptrend/Downtrend/Ranging/HighVolatility. Skips ranging and high-vol markets — where most losses happen.",color:"#0080ff"},
            {step:"03",title:"HMM Direction Alignment",desc:"ML signal must match HMM regime direction. BUY only allowed in Uptrend. SELL only in Downtrend. Prevents counter-trend trades.",color:"#0080ff"},
            {step:"04",title:"LightGBM ML Prediction",desc:"21 features → main model → BUY/SELL probability. Threshold: 0.5.",color:"#00ff9d"},
            {step:"05",title:"Meta-Labeling Filter",  desc:"Second LightGBM takes 22 features (21 + main prob). Only passes if meta_confidence ≥ threshold. Cuts most bad trades.",color:"#00ff9d"},
            {step:"06",title:"Indicator Confirmation", desc:"RSI not extreme, MACD agrees with direction, EMA stack aligned, price not at BB extreme, 5M trend not strongly opposite.",color:"#ffcc00"},
            {step:"07",title:"AI Brain Pattern Check", desc:"Checks current market fingerprint against learned loss patterns. Blocks trade if fingerprint matches 65%+ loss rate pattern.",color:"#ff3366"},
            {step:"08",title:"AI Brain Win Boost",    desc:"If fingerprint matches known 70%+ win pattern, confidence boosted +5. Increases stake calculation slightly.",color:"#00ff9d"},
            {step:"09",title:"Trade Placement",       desc:"BOOM/CRASH → MULTUP/MULTDOWN with TP=50%, SL=90%. R_/Forex → CALL/PUT 5 minutes. Min stake $0.35.",color:"#00d4ff"},
            {step:"10",title:"AI Brain Learns",       desc:"After every cycle AI Brain reads completed trades, extracts fingerprints, updates learned_rules table. Gets smarter every trade.",color:"#ff3366"},
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

      {/* ── SYMBOLS TAB ── */}
      {tab==="symbols" && (
        <div style={s.card}>
          <div style={s.ct}>LIVE SYMBOL PERFORMANCE</div>
          {Object.keys(symbolStats).length===0
            ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:24,lineHeight:1.8}}>
                No live trades yet.<br/>Bot running on demo — trades log here automatically.
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
                        <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color}}>{SYMBOL_NAMES[sym]||sym}</span>
                        {isML&&<span style={s.badge("#00d4ff")}>🧠 ML</span>}
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

      {/* ── LOG TAB ── */}
      {tab==="log" && (
        <div style={s.card}>
          <div style={s.ct}>LIVE ML LOG</div>
          {learningLog.length===0
            ? <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:24,lineHeight:1.8}}>
                Log appears after bot cycles.<br/>Shows: HMM decisions, AI Brain blocks, confidence scores.
              </div>
            : learningLog.map((e,i)=>(
                <div key={i} style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,padding:"5px 0",borderBottom:"1px solid #071525",color:e.msg?.includes("❌")||e.msg?.includes("blocked")?"#ff3366":e.msg?.includes("✅")||e.msg?.includes("WIN")?"#00ff9d":e.msg?.includes("HMM")?"#0080ff":"#c8e8ff"}}>
                  <span style={{color:"#3a6080"}}>{e.time} </span>{e.msg}
                </div>
              ))
          }
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab==="history" && (
        <div style={s.card}>
          <div style={s.ct}>FULL TRADE HISTORY</div>
          {loading&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#00d4ff",textAlign:"center",padding:20}}>Loading...</div>}
          {!loading&&history.length===0&&<div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",textAlign:"center",padding:20}}>No trades yet.</div>}
          {history.map(t=>{
            const regime = t.patterns?.match(/regime:(\w+)/)?.[1];
            return (
              <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #071525"}}>
                <div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:t.type==="BUY"?"#00ff9d":"#ff3366"}}>{t.type}</span>
                    <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#c8e8ff"}}>{SYMBOL_NAMES[t.symbol]||t.symbol}</span>
                    <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>{t.confidence}%</span>
                    {mlModels.some(m=>m.symbol===t.symbol)&&<span style={s.badge("#00d4ff")}>ML</span>}
                    {regime&&<span style={s.badge("#0080ff")}>{regime}</span>}
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:3}}>
                    {new Date(t.created_at).toLocaleString()}{t.session&&` · ${t.session}`}
                  </div>
                </div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:t.result==="win"?"#00ff9d":t.result==="loss"?"#ff3366":"#ffcc00"}}>
                  {t.result?.toUpperCase()||"OPEN"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
