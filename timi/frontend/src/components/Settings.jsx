import { useState } from "react";

const ALL_SYMBOLS = [
  {id:"R_75",label:"VIX 75",group:"Synthetic",hours:"24/7"},
  {id:"R_25",label:"VIX 25",group:"Synthetic",hours:"24/7"},
  {id:"R_50",label:"VIX 50",group:"Synthetic",hours:"24/7"},
  {id:"R_100",label:"VIX 100",group:"Synthetic",hours:"24/7"},
  {id:"BOOM1000",label:"BOOM 1000",group:"Synthetic",hours:"24/7"},
  {id:"BOOM500",label:"BOOM 500",group:"Synthetic",hours:"24/7"},
  {id:"CRASH1000",label:"CRASH 1000",group:"Synthetic",hours:"24/7"},
  {id:"CRASH500",label:"CRASH 500",group:"Synthetic",hours:"24/7"},
  {id:"frxEURUSD",label:"EUR/USD",group:"Forex",hours:"Weekdays"},
  {id:"frxGBPUSD",label:"GBP/USD",group:"Forex",hours:"Weekdays"},
  {id:"frxUSDJPY",label:"USD/JPY",group:"Forex",hours:"Weekdays"},
  {id:"cryBTCUSD",label:"BTC/USD",group:"Crypto",hours:"24/7"},
  {id:"cryETHUSD",label:"ETH/USD",group:"Crypto",hours:"24/7"},
];

export default function Settings({ riskParams={}, updateRisk,
  autoTrade, setAutoTrade,
  activeSymbols=[], updateSymbols,
  accounts=[], addAccount, removeAccount, toggleAccount, updateToken,
  takeProfitTarget=0, setTakeProfitTarget,
  dailyPnl=0, closeAllTrades,
  martingaleMode="anti", setMartingaleMode
}) {
  const [newName, setNewName] = useState("");
  const [newToken, setNewToken] = useState("");
  const [editId, setEditId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [tpInput, setTpInput] = useState(takeProfitTarget||"");

  const c = {
    page:{padding:"20px 20px 100px",fontFamily:"sans-serif"},
    title:{fontFamily:"'Orbitron',monospace",fontSize:18,fontWeight:700,color:"#fff",marginBottom:4},
    sub:{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",letterSpacing:2,marginBottom:20},
    card:{background:"#071525",border:"1px solid #0a2540",borderRadius:14,padding:16,marginBottom:12},
    ct:{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00d4ff",letterSpacing:3,marginBottom:14},
    row:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #0a2540"},
    rowLast:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0"},
    lbl:{fontFamily:"'Rajdhani',sans-serif",fontSize:14,color:"#c8e8ff",fontWeight:600},
    meta:{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",marginTop:2},
    tog:(on)=>({width:44,height:24,borderRadius:12,border:"none",cursor:"pointer",background:on?"linear-gradient(90deg,#00d4ff,#00ff9d)":"#0a2540",position:"relative",flexShrink:0,transition:"background 0.3s"}),
    knob:(on)=>({position:"absolute",top:3,left:on?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.3s"}),
    inp:{background:"#0a2540",border:"1px solid #1a3550",borderRadius:8,padding:"8px 12px",color:"#fff",fontFamily:"'Share Tech Mono',monospace",fontSize:12,width:"100%",outline:"none",marginTop:6,boxSizing:"border-box"},
    btn:(type)=>({padding:"9px 14px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:700,letterSpacing:1,
      background:type==="primary"?"linear-gradient(90deg,#00d4ff,#00ff9d)":type==="danger"?"rgba(255,51,102,0.15)":"rgba(0,212,255,0.08)",
      color:type==="primary"?"#020810":type==="danger"?"#ff3366":"#00d4ff",
      border:type==="danger"?"1px solid rgba(255,51,102,0.3)":type==="ghost"?"1px solid rgba(0,212,255,0.2)":"none"
    }),
    accCard:{background:"#0a1e30",border:"1px solid #0a2540",borderRadius:10,padding:12,marginBottom:8},
    symGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4},
    symBtn:(on)=>({padding:"10px 8px",borderRadius:10,border:on?"1px solid #00d4ff":"1px solid #0a2540",background:on?"rgba(0,212,255,0.08)":"none",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}),
    grpLbl:{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",letterSpacing:3,margin:"12px 0 8px"},
    modeBtn:(active)=>({flex:1,padding:"10px 4px",borderRadius:8,border:active?"1px solid #00d4ff":"1px solid #0a2540",background:active?"rgba(0,212,255,0.1)":"none",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:9,color:active?"#00d4ff":"#3a6080",fontWeight:700,letterSpacing:1})
  };

  return (
    <div style={c.page}>
      <div style={c.title}>Settings</div>
      <div style={c.sub}>// TIMI CONTROL CENTER</div>

      {/* ── TRADING CONTROLS ── */}
      <div style={c.card}>
        <div style={c.ct}>TRADING CONTROLS</div>
        <div style={c.row}>
          <div><div style={c.lbl}>Auto Trading</div><div style={c.meta}>TIMI executes trades automatically</div></div>
          <button style={c.tog(autoTrade)} onClick={()=>setAutoTrade(p=>!p)}>
            <div style={c.knob(autoTrade)}/>
          </button>
        </div>
        <div style={c.rowLast}>
          <div><div style={c.lbl}>Emergency Stop</div><div style={c.meta}>Close all open trades instantly</div></div>
          <button style={c.btn("danger")} onClick={closeAllTrades}>🛑 CLOSE ALL</button>
        </div>
      </div>

      {/* ── TAKE PROFIT ── */}
      <div style={c.card}>
        <div style={c.ct}>TAKE PROFIT TARGET</div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080",marginBottom:10}}>
          Today P&L: <span style={{color:dailyPnl>=0?"#00ff9d":"#ff3366",fontWeight:700}}>${(dailyPnl||0).toFixed(2)}</span>
          {takeProfitTarget>0 && <span style={{color:"#00d4ff",marginLeft:12}}>Target: ${takeProfitTarget}</span>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input style={{...c.inp,marginTop:0,flex:1}} type="number" placeholder="Daily profit target e.g. 50" value={tpInput} onChange={e=>setTpInput(e.target.value)}/>
          <button style={c.btn("primary")} onClick={()=>setTakeProfitTarget(parseFloat(tpInput)||0)}>SET</button>
          {takeProfitTarget>0 && <button style={c.btn("danger")} onClick={()=>{setTakeProfitTarget(0);setTpInput("");}}>✕</button>}
        </div>
        {takeProfitTarget>0 && (
          <div style={{marginTop:8,height:4,background:"#0a2540",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,#00d4ff,#00ff9d)",width:Math.min((dailyPnl/takeProfitTarget*100),100)+"%",transition:"width 0.5s",borderRadius:2}}/>
          </div>
        )}
      </div>

      {/* ── STAKE MODE ── */}
      <div style={c.card}>
        <div style={c.ct}>STAKE MODE</div>
        <div style={{display:"flex",gap:6}}>
          {["fixed","anti","martingale"].map(m=>(
            <button key={m} style={c.modeBtn(martingaleMode===m)} onClick={()=>setMartingaleMode(m)}>
              {m==="fixed"?"FIXED":m==="anti"?"ANTI-MART":"MARTINGALE"}
            </button>
          ))}
        </div>
        <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:8}}>
          {martingaleMode==="fixed"?"Same stake every trade":martingaleMode==="anti"?"Increase after win, reduce after loss":"Double stake after loss to recover"}
        </div>
      </div>

      {/* ── ACCOUNTS ── */}
      <div style={c.card}>
        <div style={c.ct}>TRADING ACCOUNTS</div>
        {accounts.map(acc=>(
          <div key={acc.id} style={c.accCard}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:acc.active?"#00d4ff":"#3a6080"}}>{acc.name}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#00ff9d",marginTop:2}}>{acc.currency||"USD"} {acc.balance||"---"}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <button style={c.tog(acc.active)} onClick={()=>toggleAccount(acc.id)}>
                  <div style={c.knob(acc.active)}/>
                </button>
                {acc.id!=="primary" && (
                  <button style={{...c.btn("danger"),padding:"4px 8px",fontSize:9}} onClick={()=>removeAccount(acc.id)}>✕</button>
                )}
              </div>
            </div>
            {editId===acc.id ? (
              <div style={{marginTop:8,display:"flex",gap:6}}>
                <input style={{...c.inp,marginTop:0,flex:1}} placeholder="New API token" value={editVal} onChange={e=>setEditVal(e.target.value)}/>
                <button style={c.btn("primary")} onClick={()=>{updateToken(acc.id,editVal);setEditId(null);}}>✓</button>
                <button style={c.btn("danger")} onClick={()=>setEditId(null)}>✕</button>
              </div>
            ) : (
              <button style={{...c.btn("ghost"),marginTop:8,fontSize:9,padding:"5px 10px"}} onClick={()=>{setEditId(acc.id);setEditVal(acc.token||"");}}>
                ✏️ Edit Token
              </button>
            )}
          </div>
        ))}
        <div style={{marginTop:8}}>
          <div style={c.grpLbl}>ADD NEW ACCOUNT</div>
          <input style={c.inp} placeholder="Account name" value={newName} onChange={e=>setNewName(e.target.value)}/>
          <input style={c.inp} placeholder="Deriv API token" value={newToken} onChange={e=>setNewToken(e.target.value)} type="password"/>
          <button style={{...c.btn("primary"),width:"100%",marginTop:10}} onClick={()=>{if(newName&&newToken){addAccount(newName.trim(),newToken.trim());setNewName("");setNewToken("");}}}> + ADD ACCOUNT</button>
        </div>
      </div>

      {/* ── MARKETS ── */}
      <div style={c.card}>
        <div style={c.ct}>MARKETS TO TRADE</div>
        {["Synthetic","Forex","Crypto"].map(group=>(
          <div key={group}>
            <div style={c.grpLbl}>{group.toUpperCase()}</div>
            <div style={c.symGrid}>
              {ALL_SYMBOLS.filter(s=>s.group===group).map(sym=>{
                const on=activeSymbols.includes(sym.id);
                return (
                  <button key={sym.id} style={c.symBtn(on)}
                    onClick={()=>{const u=on?activeSymbols.filter(s=>s!==sym.id):[...activeSymbols,sym.id];if(u.length>0)updateSymbols(u);}}>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:on?"#00d4ff":"#c8e8ff"}}>{sym.label}</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:on?"#00ff9d":"#3a6080",marginTop:2}}>{sym.hours} {on?"● ON":"○ OFF"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── RISK PARAMS ── */}
      <div style={c.card}>
        <div style={c.ct}>RISK PARAMETERS</div>

        {/* RR Info */}
        <div style={{background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.15)",borderRadius:10,padding:"10px 12px",marginBottom:14}}>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:10,color:"#00d4ff",marginBottom:6}}>RISK:REWARD RATIO</div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080"}}>Win payout</span>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:12,color:"#00ff9d",fontWeight:700}}>85%</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080"}}>Loss</span>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:12,color:"#ff3366",fontWeight:700}}>100%</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#3a6080"}}>Break-even win rate</span>
            <span style={{fontFamily:"'Orbitron',monospace",fontSize:12,color:"#ffcc00",fontWeight:700}}>54.1%</span>
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:6}}>
            TIMI targets 60%+ win rate — positive EV above break-even
          </div>
        </div>

        {[
          {key:"riskPct",l:"Risk Per Trade (%)",min:0.5,max:10,step:0.5,suffix:"%",desc:"% of balance per trade"},
          {key:"maxTrades",l:"Max Open Trades",min:1,max:10,step:1,suffix:"",desc:"Max simultaneous positions"},
          {key:"minConfidence",l:"Min Signal Confidence",min:30,max:90,step:5,suffix:"%",desc:"Min confidence to enter trade"},
          {key:"duration",l:"Trade Duration",min:1,max:60,step:1,suffix:" min",desc:"How long each trade runs"},
        ].map(param => (
          <div key={param.key} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={c.lbl}>{param.l}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:2}}>{param.desc}</div>
              </div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,color:"#00d4ff",fontWeight:700,minWidth:50,textAlign:"right"}}>
                {riskParams?.[param.key]||param.min}{param.suffix}
              </div>
            </div>
            <input type="range" min={param.min} max={param.max} step={param.step}
              value={riskParams?.[param.key]||param.min}
              onChange={e=>updateRisk&&updateRisk(param.key,e.target.value)}
              style={{width:"100%",accentColor:"#00d4ff",marginTop:6}}
            />
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>{param.min}{param.suffix}</span>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>{param.max}{param.suffix}</span>
            </div>
          </div>
        ))}

        {/* Balance-based stake preview */}
        <div style={{background:"rgba(0,255,157,0.06)",border:"1px solid rgba(0,255,157,0.15)",borderRadius:10,padding:"10px 12px",marginTop:4}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080",marginBottom:6}}>STAKE PREVIEW BY BALANCE</div>
          {[10,100,500,1000,5000].map(bal => (
            <div key={bal} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
              <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#3a6080"}}>${bal} account</span>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#00ff9d",fontWeight:700}}>
                ${Math.max(1,(bal*(riskParams?.riskPct||2)/100)).toFixed(2)} stake
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
