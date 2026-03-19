import { supabase } from "../lib/supabase";
import { Preferences } from "@capacitor/preferences";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useRisk from "../hooks/useRisk";

const ALL_SYMBOLS = [
  { id:"R_75",      label:"VIX 75",     group:"Synthetic" },
  { id:"R_25",      label:"VIX 25",     group:"Synthetic" },
  { id:"R_50",      label:"VIX 50",     group:"Synthetic" },
  { id:"R_100",     label:"VIX 100",    group:"Synthetic" },
  { id:"BOOM1000",  label:"BOOM 1000",  group:"Synthetic" },
  { id:"BOOM500",   label:"BOOM 500",   group:"Synthetic" },
  { id:"CRASH1000", label:"CRASH 1000", group:"Synthetic" },
  { id:"CRASH500",  label:"CRASH 500",  group:"Synthetic" },
  { id:"frxEURUSD", label:"EUR/USD",    group:"Forex" },
  { id:"frxGBPUSD", label:"GBP/USD",    group:"Forex" },
  { id:"frxUSDJPY", label:"USD/JPY",    group:"Forex" },
  { id:"frxGBPJPY", label:"GBP/JPY",    group:"Forex" },
  { id:"frxEURJPY", label:"EUR/JPY",    group:"Forex" },
  { id:"frxAUDUSD", label:"AUD/USD",    group:"Forex" },
  { id:"frxUSDCAD", label:"USD/CAD",    group:"Forex" },
  { id:"frxGBPAUD", label:"GBP/AUD",    group:"Forex" },
  { id:"frxEURGBP", label:"EUR/GBP",    group:"Forex" },
  { id:"frxAUDJPY", label:"AUD/JPY",    group:"Forex" },
  { id:"frxNZDUSD", label:"NZD/USD",    group:"Forex" },
  { id:"frxUSDCHF", label:"USD/CHF",    group:"Forex" },
  { id:"cryBTCUSD", label:"BTC/USD",    group:"Crypto" },
  { id:"cryETHUSD", label:"ETH/USD",    group:"Crypto" },
  { id:"frxXAUUSD", label:"Gold/USD",   group:"Metals" },
  { id:"frxXAGUSD", label:"Silver/USD", group:"Metals" },
];

const DEFAULT_ON = [
  "R_75","R_25","R_50","R_100",
  "BOOM1000","CRASH1000","frxUSDJPY",
  "frxEURUSD","frxGBPUSD","cryBTCUSD",
];

// Symbols with trained ML models
const ML_TRAINED = ["BOOM1000", "CRASH1000", "frxUSDJPY"];

const c = {
  page:   { padding: "20px 20px 110px", background: "#020810", minHeight: "100vh" },
  title:  { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  sub:    { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 20 },
  card:   { background: "#071525", border: "1px solid #0a2540", borderRadius: 14, padding: 16, marginBottom: 12 },
  mlCard: { background: "#071525", border: "1px solid rgba(0,255,157,0.2)", borderRadius: 14, padding: 16, marginBottom: 12 },
  ct:     { fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff", letterSpacing: 3, marginBottom: 14 },
  ctGreen:{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00ff9d", letterSpacing: 3, marginBottom: 14 },
  row:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0a2540" },
  lbl:    { fontFamily: "'Rajdhani',sans-serif", fontSize: 14, color: "#c8e8ff", fontWeight: 600 },
  meta:   { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 2 },
  val:    { fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: "#00d4ff", minWidth: 52, textAlign: "right" },
  slider: { width: "100%", accentColor: "#00d4ff", marginTop: 6, marginBottom: 2, cursor: "pointer" },
  inp:    { background: "#0a2540", border: "1px solid #1a3550", borderRadius: 8, padding: "8px 12px", color: "#fff", fontFamily: "'Share Tech Mono',monospace", fontSize: 12, width: "100%", outline: "none", marginTop: 6, boxSizing: "border-box" },
  btn:    { padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1 },
  btnP:   { background: "linear-gradient(90deg,#00d4ff,#00ff9d)", color: "#020810" },
  btnD:   { background: "rgba(255,51,102,0.15)", border: "1px solid rgba(255,51,102,0.3)", color: "#ff3366" },
  btnML:  { background: "rgba(0,255,157,0.12)", border: "1px solid rgba(0,255,157,0.35)", color: "#00ff9d" },
  toggle: (on) => ({ width: 46, height: 26, borderRadius: 13, border: "none", cursor: "pointer", position: "relative", background: on ? "linear-gradient(90deg,#00d4ff,#00ff9d)" : "#0a2540", transition: "background 0.3s", flexShrink: 0 }),
  knob:   (on) => ({ position: "absolute", top: 4, left: on ? 24 : 4, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s" }),
  symBtn: (on, isML) => ({
    padding: "10px 8px", borderRadius: 10, cursor: "pointer", textAlign: "left",
    background: on ? (isML ? "rgba(0,255,157,0.1)" : "rgba(0,212,255,0.08)") : "none",
    border: `1px solid ${on ? (isML ? "#00ff9d" : "#00d4ff") : "#0a2540"}`,
  }),
  accCard:{ background: "#0a1e30", border: "1px solid #0a2540", borderRadius: 10, padding: 12, marginBottom: 8 },
};


// ── Platform Card Component ──
function PlatformCard({ platform, label, description, isApiKey=false,
  accounts=[], toggleAccount, removeAccount, updateToken,
  editTokenId, setEditTokenId, editTokenVal, setEditTokenVal,
  newAccName, setNewAccName, newAccToken, setNewAccToken, handleAddAccount,
  platformConfig={}, onConfigChange, availableSymbols=[], platformSymbols=[], onSymbolToggle, c }) {

  const [showSecret, setShowSecret] = useState(false);
  const isEnabled = isApiKey ? platformConfig.enabled : accounts.some(a=>a.active);

  return (
    <div style={{...c.card, border:`1px solid ${isEnabled?"rgba(0,212,255,0.3)":"#0a2540"}`, marginBottom:12}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#c8e8ff",fontWeight:700}}>{label}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:2}}>{description}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:isEnabled?"#00ff9d":"#ff3366"}}>
            {isEnabled?"● ACTIVE":"○ INACTIVE"}
          </div>
          {isApiKey && (
            <button style={{...c.toggle(platformConfig.auto_trade),transform:"scale(0.8)"}}
              onClick={()=>onConfigChange({auto_trade:!platformConfig.auto_trade, enabled:!platformConfig.auto_trade})}>
              <div style={c.knob(platformConfig.auto_trade)}/>
            </button>
          )}
        </div>
      </div>

      {/* Deriv token accounts */}
      {!isApiKey && (
        <div>
          {accounts.map(acc=>(
            <div key={acc.id} style={{background:"#020810",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid #0a2540"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#c8e8ff"}}>{acc.name}</div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <button style={c.toggle(acc.active)} onClick={()=>toggleAccount?.(acc.id)}>
                    <div style={c.knob(acc.active)}/>
                  </button>
                  <button style={{...c.btn,...c.btnD,padding:"4px 8px",fontSize:9}} onClick={()=>removeAccount?.(acc.id)}>✕</button>
                </div>
              </div>
              {editTokenId===acc.id ? (
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <input style={{...c.inp,marginTop:0,flex:1}} placeholder="New token"
                    value={editTokenVal} onChange={e=>setEditTokenVal(e.target.value)}/>
                  <button style={{...c.btn,...c.btnP,padding:"6px 12px"}} onClick={async()=>{
                    if(!editTokenVal||editTokenVal.length<5) return;
                    const {error} = await supabase.from("bot_config").update({token:editTokenVal}).eq("active",true);
                    if(!error){updateToken?.(acc.id,editTokenVal);setEditTokenId(null);}
                  }}>Save</button>
                </div>
              ) : (
                <button style={{...c.btn,background:"transparent",color:"#3a6080",fontSize:9,padding:"4px 0",marginTop:4}}
                  onClick={()=>{setEditTokenId(acc.id);setEditTokenVal(acc.token);}}>
                  ✏️ Edit Token
                </button>
              )}
            </div>
          ))}
          <input style={c.inp} placeholder="Account name" value={newAccName} onChange={e=>setNewAccName(e.target.value)}/>
          <input style={{...c.inp,marginTop:8}} placeholder="Deriv API token" type="password"
            value={newAccToken} onChange={e=>setNewAccToken(e.target.value)}/>
          <button style={{...c.btn,...c.btnP,width:"100%",marginTop:10}} onClick={handleAddAccount}>+ ADD ACCOUNT</button>
        </div>
      )}

      {/* API Key platforms (Binance, Exness) */}
      {isApiKey && (
        <div>
          <div style={{marginBottom:8}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginBottom:4}}>API KEY</div>
            <input style={c.inp} placeholder={`${label} API Key`} type="password"
              value={platformConfig.api_key||""} onChange={e=>onConfigChange({api_key:e.target.value})}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginBottom:4}}>API SECRET</div>
            <input style={c.inp} placeholder={`${label} API Secret`} type="password"
              value={platformConfig.api_secret||""} onChange={e=>onConfigChange({api_secret:e.target.value})}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>Risk per trade</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:"#00d4ff"}}>{platformConfig.risk_pct||1}%</div>
          </div>
          <input type="range" min={0.5} max={5} step={0.5}
            value={platformConfig.risk_pct||1}
            onChange={e=>onConfigChange({risk_pct:parseFloat(e.target.value)})}
            style={{width:"100%",accentColor:"#00d4ff",marginBottom:12}}/>
          {(!platformConfig.api_key) && (
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#ffcc00",
              background:"rgba(255,204,0,0.08)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
              ⚠️ Add API credentials to enable {label} trading
            </div>
          )}
        </div>
      )}

      {/* Symbol selector */}
      <div style={{marginTop:12}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#3a6080",letterSpacing:2,marginBottom:8}}>
          SYMBOLS TO TRADE
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {availableSymbols.map(sym=>{
            const active = platformSymbols.includes(sym.id);
            return (
              <button key={sym.id}
                style={{background:active?"rgba(0,212,255,0.1)":"#020810",
                  border:`1px solid ${active?"#00d4ff":"#0a2540"}`,
                  borderRadius:8,padding:"8px 10px",cursor:"pointer",
                  display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onClick={()=>onSymbolToggle(sym.id)}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,
                  color:active?"#00d4ff":"#3a6080"}}>{sym.label}</span>
                <span style={{fontSize:10,color:active?"#00ff9d":"#3a6080"}}>{active?"✓":""}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ── Platform Card Component ──
function PlatformCard({ platform, label, description, isApiKey=false,
  accounts=[], toggleAccount, removeAccount, updateToken,
  editTokenId, setEditTokenId, editTokenVal, setEditTokenVal,
  newAccName, setNewAccName, newAccToken, setNewAccToken, handleAddAccount,
  platformConfig={}, onConfigChange, availableSymbols=[], platformSymbols=[], onSymbolToggle, c }) {

  const [showSecret, setShowSecret] = useState(false);
  const isEnabled = isApiKey ? platformConfig.enabled : accounts.some(a=>a.active);

  return (
    <div style={{...c.card, border:`1px solid ${isEnabled?"rgba(0,212,255,0.3)":"#0a2540"}`, marginBottom:12}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#c8e8ff",fontWeight:700}}>{label}</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:2}}>{description}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:isEnabled?"#00ff9d":"#ff3366"}}>
            {isEnabled?"● ACTIVE":"○ INACTIVE"}
          </div>
          {isApiKey && (
            <button style={{...c.toggle(platformConfig.auto_trade),transform:"scale(0.8)"}}
              onClick={()=>onConfigChange({auto_trade:!platformConfig.auto_trade, enabled:!platformConfig.auto_trade})}>
              <div style={c.knob(platformConfig.auto_trade)}/>
            </button>
          )}
        </div>
      </div>

      {/* Deriv token accounts */}
      {!isApiKey && (
        <div>
          {accounts.map(acc=>(
            <div key={acc.id} style={{background:"#020810",borderRadius:10,padding:"10px 12px",marginBottom:8,border:"1px solid #0a2540"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#c8e8ff"}}>{acc.name}</div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <button style={c.toggle(acc.active)} onClick={()=>toggleAccount?.(acc.id)}>
                    <div style={c.knob(acc.active)}/>
                  </button>
                  <button style={{...c.btn,...c.btnD,padding:"4px 8px",fontSize:9}} onClick={()=>removeAccount?.(acc.id)}>✕</button>
                </div>
              </div>
              {editTokenId===acc.id ? (
                <div style={{display:"flex",gap:6,marginTop:8}}>
                  <input style={{...c.inp,marginTop:0,flex:1}} placeholder="New token"
                    value={editTokenVal} onChange={e=>setEditTokenVal(e.target.value)}/>
                  <button style={{...c.btn,...c.btnP,padding:"6px 12px"}} onClick={async()=>{
                    if(!editTokenVal||editTokenVal.length<5) return;
                    const {error} = await supabase.from("bot_config").update({token:editTokenVal}).eq("active",true);
                    if(!error){updateToken?.(acc.id,editTokenVal);setEditTokenId(null);}
                  }}>Save</button>
                </div>
              ) : (
                <button style={{...c.btn,background:"transparent",color:"#3a6080",fontSize:9,padding:"4px 0",marginTop:4}}
                  onClick={()=>{setEditTokenId(acc.id);setEditTokenVal(acc.token);}}>
                  ✏️ Edit Token
                </button>
              )}
            </div>
          ))}
          <input style={c.inp} placeholder="Account name" value={newAccName} onChange={e=>setNewAccName(e.target.value)}/>
          <input style={{...c.inp,marginTop:8}} placeholder="Deriv API token" type="password"
            value={newAccToken} onChange={e=>setNewAccToken(e.target.value)}/>
          <button style={{...c.btn,...c.btnP,width:"100%",marginTop:10}} onClick={handleAddAccount}>+ ADD ACCOUNT</button>
        </div>
      )}

      {/* API Key platforms (Binance, Exness) */}
      {isApiKey && (
        <div>
          <div style={{marginBottom:8}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginBottom:4}}>API KEY</div>
            <input style={c.inp} placeholder={`${label} API Key`} type="password"
              value={platformConfig.api_key||""} onChange={e=>onConfigChange({api_key:e.target.value})}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginBottom:4}}>API SECRET</div>
            <input style={c.inp} placeholder={`${label} API Secret`} type="password"
              value={platformConfig.api_secret||""} onChange={e=>onConfigChange({api_secret:e.target.value})}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080"}}>Risk per trade</div>
            <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,color:"#00d4ff"}}>{platformConfig.risk_pct||1}%</div>
          </div>
          <input type="range" min={0.5} max={5} step={0.5}
            value={platformConfig.risk_pct||1}
            onChange={e=>onConfigChange({risk_pct:parseFloat(e.target.value)})}
            style={{width:"100%",accentColor:"#00d4ff",marginBottom:12}}/>
          {(!platformConfig.api_key) && (
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#ffcc00",
              background:"rgba(255,204,0,0.08)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
              ⚠️ Add API credentials to enable {label} trading
            </div>
          )}
        </div>
      )}

      {/* Symbol selector */}
      <div style={{marginTop:12}}>
        <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#3a6080",letterSpacing:2,marginBottom:8}}>
          SYMBOLS TO TRADE
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {availableSymbols.map(sym=>{
            const active = platformSymbols.includes(sym.id);
            return (
              <button key={sym.id}
                style={{background:active?"rgba(0,212,255,0.1)":"#020810",
                  border:`1px solid ${active?"#00d4ff":"#0a2540"}`,
                  borderRadius:8,padding:"8px 10px",cursor:"pointer",
                  display:"flex",justifyContent:"space-between",alignItems:"center"}}
                onClick={()=>onSymbolToggle(sym.id)}>
                <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,
                  color:active?"#00d4ff":"#3a6080"}}>{sym.label}</span>
                <span style={{fontSize:10,color:active?"#00ff9d":"#3a6080"}}>{active?"✓":""}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Settings({
  autoTrade, setAutoTrade,
  activeSymbols = [], updateSymbols,
  accounts = [], addAccount, removeAccount, toggleAccount, updateToken,
  takeProfitTarget, setTakeProfitTarget,
  dailyPnl = 0,
  closeAllTrades,
  martingaleMode, setMartingaleMode,
}) {
  const { riskParams, updateRisk } = useRisk();
  const [tpInput,      setTpInput]      = useState(takeProfitTarget || "");
  const [newAccName,   setNewAccName]   = useState("");
  const [newAccToken,  setNewAccToken]  = useState("");
  const [editTokenId,  setEditTokenId]  = useState(null);
  const [editTokenVal, setEditTokenVal] = useState("");
  const [savedFlash,   setSavedFlash]   = useState("");
  const [mlSymbols,    setMlSymbols]    = useState([]);       // symbols selected for ML trading
  const [mlModels,     setMlModels]     = useState([]);       // models that exist in Supabase
  const [trainQueue,   setTrainQueue]   = useState([]);       // symbols queued for training
  const [mlSaving,     setMlSaving]     = useState(false);
  const [mlFlash,      setMlFlash]      = useState("");
  const [tab,          setTab]          = useState("general");
  const [platformConfig,  setPlatformConfig]  = useState({binance:{enabled:false,api_key:"",api_secret:"",auto_trade:false,risk_pct:1},exness:{enabled:false,api_key:"",api_secret:"",auto_trade:false,risk_pct:1}});
  const [platformSymbols, setPlatformSymbols] = useState({deriv:[],binance:[],exness:[]});

  const togglePlatformSymbol = (platform, sym) => {
    setPlatformSymbols(prev => {
      const current = prev[platform] || [];
      const updated = current.includes(sym) ? current.filter(s=>s!==sym) : [...current, sym];
      // Save to Supabase
      supabase.from("bot_config").update({
        platforms: {...platformConfig, [platform]: {...(platformConfig[platform]||{}), symbols: updated}}
      }).eq("active", true);
      return {...prev, [platform]: updated};
    });
  };

  const updatePlatformConfig = (platform, cfg) => {
    const updated = {...platformConfig, [platform]: {...(platformConfig[platform]||{}), ...cfg}};
    setPlatformConfig(updated);
    supabase.from("bot_config").update({platforms: updated}).eq("active", true);
  };

  useEffect(() => {
    setSavedFlash("✅ Saved!");
    const t = setTimeout(() => setSavedFlash(""), 1500);
    return () => clearTimeout(t);
  }, [riskParams]);

  // Load ML config from Supabase bot_config.symbols + ml_models table
  useEffect(() => {
    supabase.from("bot_config").select("symbols").eq("active", true).single()
      .then(({ data }) => {
        if (data?.symbols && Array.isArray(data.symbols)) {
          // Only show symbols that are actually in our ALL_SYMBOLS list
          const validIds = ALL_SYMBOLS.map(s => s.id);
          const filtered = data.symbols.filter(s => validIds.includes(s));
          setMlSymbols(filtered);
        }
      });
    // Also fix: if training_queue table doesn't exist yet, handle gracefully
    supabase.from("ml_models").select("symbol,win_rate,trained_at")
      .then(({ data, error }) => {
        if (!error && data) setMlModels(data);
      });
    // ml_models fetched above
    supabase.from("training_queue").select("symbol,status,requested_at,win_rate")
      .then(({ data }) => setTrainQueue(data || []));
  }, []);

  const saveMLSymbols = async (syms) => {
    setMlSaving(true);
    const { error } = await supabase.from("bot_config")
      .update({ symbols: syms })
      .eq("active", true);
    if (!error) {
      setMlSymbols(syms);
      setMlFlash("✅ ML symbols saved!");
      setTimeout(() => setMlFlash(""), 2000);
    } else {
      setMlFlash("❌ Save failed");
    }
    setMlSaving(false);
  };

  const toggleMLSymbol = async (symId) => {
    const isOn = mlSymbols.includes(symId);
    const updated = isOn
      ? mlSymbols.filter(s => s !== symId)
      : [...mlSymbols, symId];
    if (updated.length === 0) return;
    await saveMLSymbols(updated);

    // If turning ON a symbol with no trained model → queue it for training
    if (!isOn) {
      const hasModel = mlModels.some(m => m.symbol === symId);
      if (!hasModel) {
        const { error } = await supabase.from("training_queue").upsert({
          symbol: symId,
          status: "pending",
          requested_at: new Date().toISOString(),
        }, { onConflict: "symbol" });
        if (!error) {
          setMlFlash(`🧠 ${symId} queued for training! (~30 min)`);
          setTimeout(() => setMlFlash(""), 4000);
        }
      }
    }
  };

  const handleAddAccount = () => {
    if (!newAccName || !newAccToken) return;
    supabase.from("bot_config").update({ token: newAccToken.trim() }).eq("active", true)
      .then(({ error }) => { if (error) alert("❌ " + error.message); else alert("✅ Token saved!"); });
    addAccount?.(newAccName.trim(), newAccToken.trim());
    setNewAccName(""); setNewAccToken("");
  };

  const RISK_PARAMS = [
    { key: "riskPct",       label: "Risk Per Trade",   min: 0.5, max: 10, step: 0.5, suffix: "%",    desc: "% of balance per trade" },
    { key: "maxTrades",     label: "Max Open Trades",  min: 1,   max: 10, step: 1,   suffix: "",     desc: "Max simultaneous positions" },
    { key: "minConfidence", label: "Min ML Confidence",min: 50,  max: 90, step: 5,   suffix: "%",    desc: "Meta-model threshold (65% recommended)" },
    { key: "duration",      label: "Trade Duration",   min: 1,   max: 60, step: 1,   suffix: " min", desc: "How long each trade runs" },
  ];

  const groups = ["Synthetic", "Forex", "Crypto", "Metals"];

  return (
    <div style={c.page}>
      <div style={c.title}>Settings</div>
      <div style={c.sub}>// TIMI ML CONTROL CENTER</div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[
          { id: "general",  label: "GENERAL" },
          { id: "ml",       label: "🧠 ML" },
          { id: "markets",  label: "MARKETS" },
          { id: "accounts", label: "ACCOUNTS" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "9px 4px", borderRadius: 9, border: "none", cursor: "pointer",
              fontFamily: "'Orbitron',monospace", fontSize: 9, letterSpacing: 1,
              background: tab === t.id ? "linear-gradient(90deg,#00d4ff,#0080ff)" : "#071525",
              color: tab === t.id ? "#020810" : "#3a6080" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {tab === "general" && (
        <>
          <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div style={c.ct}>TRADING CONTROLS</div>
            <div style={c.row}>
              <div><div style={c.lbl}>Auto Trading</div><div style={c.meta}>TIMI ML engine trades automatically</div></div>
              <button style={c.toggle(autoTrade)} onClick={() => setAutoTrade?.(p => !p)}>
                <div style={c.knob(autoTrade)} />
              </button>
            </div>
            <div style={{ ...c.row, borderBottom: "none" }}>
              <div><div style={c.lbl}>Emergency Stop</div><div style={c.meta}>Close all open trades now</div></div>
              <button style={{ ...c.btn, ...c.btnD }} onClick={closeAllTrades}>🛑 STOP ALL</button>
            </div>
          </motion.div>

          <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.05 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={c.ct}>RISK PARAMETERS</div>
              {savedFlash && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#00ff9d" }}>{savedFlash}</div>}
            </div>
            {RISK_PARAMS.map((param, i) => (
              <div key={param.key} style={{ marginBottom: 18, paddingBottom: i < RISK_PARAMS.length - 1 ? 14 : 0, borderBottom: i < RISK_PARAMS.length - 1 ? "1px solid #0a2540" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={c.lbl}>{param.label}</div><div style={c.meta}>{param.desc}</div></div>
                  <div style={c.val}>{riskParams[param.key]}{param.suffix}</div>
                </div>
                <input type="range" min={param.min} max={param.max} step={param.step}
                  value={riskParams[param.key]} onChange={e => updateRisk(param.key, e.target.value)} style={c.slider} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080" }}>{param.min}{param.suffix}</span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080" }}>{param.max}{param.suffix}</span>
                </div>
              </div>
            ))}
            <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginBottom: 6, letterSpacing: 2 }}>STAKE PREVIEW</div>
              {[50, 100, 500, 1000, 5000].map(bal => (
                <div key={bal} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080" }}>${bal} balance</span>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#00ff9d", fontWeight: 700 }}>
                    ${Math.max(1, (bal * riskParams.riskPct / 100)).toFixed(2)} stake
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}>
            <div style={c.ct}>DAILY TAKE PROFIT</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", marginBottom: 10 }}>
              Today's P&L: <span style={{ color: dailyPnl >= 0 ? "#00ff9d" : "#ff3366" }}>{dailyPnl >= 0 ? "+" : ""}${(dailyPnl || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...c.inp, marginTop: 0, flex: 1 }} type="number" placeholder="Target e.g. 50"
                value={tpInput} onChange={e => setTpInput(e.target.value)} />
              <button style={{ ...c.btn, ...c.btnP, whiteSpace: "nowrap" }}
                onClick={() => setTakeProfitTarget?.(parseFloat(tpInput) || 0)}>SET</button>
            </div>
            {takeProfitTarget > 0 && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#00d4ff", marginTop: 8 }}>
                Target: ${takeProfitTarget} — {dailyPnl >= takeProfitTarget ? "✅ REACHED!" : `${Math.round((dailyPnl / takeProfitTarget) * 100)}% there`}
              </div>
            )}
          </motion.div>

          {setMartingaleMode && (
            <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.12 }}>
              <div style={c.ct}>STAKE STRATEGY</div>
              {[
                { id: "fixed",      label: "Fixed",           desc: "Same stake every trade" },
                { id: "anti",       label: "Anti-Martingale", desc: "Increase after wins, reduce after losses" },
                { id: "martingale", label: "Martingale",      desc: "Double after loss to recover (risky)" },
              ].map(m => (
                <div key={m.id} onClick={() => setMartingaleMode(m.id)}
                  style={{ ...c.row, cursor: "pointer", borderColor: martingaleMode === m.id ? "rgba(0,212,255,0.3)" : "#0a2540" }}>
                  <div>
                    <div style={{ ...c.lbl, color: martingaleMode === m.id ? "#00d4ff" : "#c8e8ff" }}>{m.label}</div>
                    <div style={c.meta}>{m.desc}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${martingaleMode === m.id ? "#00d4ff" : "#1a3550"}`, background: martingaleMode === m.id ? "#00d4ff" : "none", flexShrink: 0 }} />
                </div>
              ))}
            </motion.div>
          )}

          {/* 24/7 cloud trading note */}
          <div style={{ background: "rgba(0,255,157,0.05)", border: "1px solid rgba(0,255,157,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#00ff9d", letterSpacing: 2, marginBottom: 6 }}>✅ 24/7 CLOUD TRADING ACTIVE</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#c8e8ff", lineHeight: 1.7 }}>
              TIMI runs on Supabase Edge Functions — trades even when your phone is off. ML engine scans every 5 minutes automatically.
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", marginTop: 6, lineHeight: 1.6 }}>
              Control which symbols the ML trades in the 🧠 ML tab.
            </div>
          </div>
        </>
      )}

      {/* ── ML TAB ── */}
      {tab === "ml" && (
        <>
          {/* Active ML models */}
          <motion.div style={c.mlCard} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={c.ctGreen}>TRAINED ML MODELS</div>
              {mlFlash && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: mlFlash.startsWith("✅") ? "#00ff9d" : "#ff3366" }}>{mlFlash}</div>}
            </div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginBottom: 12, lineHeight: 1.7 }}>
              These symbols have trained LightGBM + meta-labeling models in Supabase.<br/>
              Toggle to enable/disable each one for live trading.
            </div>
            {mlModels.length === 0
              ? <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 20 }}>
                  No ML models found in Supabase.<br/>Run the training script to add models.
                </div>
              : mlModels.map(m => {
                  const wr = Math.round(m.win_rate * 100);
                  const active = mlSymbols.includes(m.symbol);
                  const color = wr >= 70 ? "#00ff9d" : wr >= 55 ? "#00d4ff" : "#ffcc00";
                  return (
                    <div key={m.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #0a2540" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: active ? "#fff" : "#3a6080" }}>
                            {ALL_SYMBOLS.find(s => s.id === m.symbol)?.label || m.symbol}
                          </div>
                          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color, background: `${color}15`, border: `1px solid ${color}40`, padding: "1px 6px", borderRadius: 4 }}>
                            {wr}% WR
                          </div>
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 3 }}>
                          Trained: {m.trained_at?.slice(0, 10)} · LightGBM + meta-labeling
                        </div>
                        <div style={{ height: 3, background: "#0a2540", borderRadius: 2, overflow: "hidden", marginTop: 6, width: "80%" }}>
                          <div style={{ height: "100%", width: wr + "%", background: color, borderRadius: 2 }} />
                        </div>
                      </div>
                      <button style={c.toggle(active)} onClick={() => toggleMLSymbol(m.symbol)}>
                        <div style={c.knob(active)} />
                      </button>
                    </div>
                  );
                })
            }
          </motion.div>

          {/* Add symbols for ML training */}
          <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.05 }}>
            <div style={c.ct}>ADD SYMBOLS FOR ML TRADING</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginBottom: 12, lineHeight: 1.7 }}>
              Select symbols to include in the ML bot's scan. Symbols without trained models use the fallback strategy.
            </div>
            {["Synthetic", "Forex", "Crypto", "Metals"].map(group => (
              <div key={group}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", letterSpacing: 3, margin: "12px 0 8px" }}>
                  {group.toUpperCase()}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ALL_SYMBOLS.filter(s => s.group === group).map(sym => {
                     const on = mlSymbols.includes(sym.id);
                    const hasModel = mlModels.some(m => m.symbol === sym.id);
                    const qItem = trainQueue.find(q => q.symbol === sym.id);
                    const isQueued = qItem?.status === "pending" || qItem?.status === "training";
                    const qFailed = qItem?.status === "failed";
                    return (
                      <motion.button key={sym.id} whileTap={{ scale: 0.94 }}
                        onClick={() => toggleMLSymbol(sym.id)}
                        style={c.symBtn(on, hasModel)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: on ? (hasModel ? "#00ff9d" : isQueued ? "#ffcc00" : "#00d4ff") : "#c8e8ff" }}>
                            {sym.label}
                          </div>
                          <div style={{ fontSize: 9 }}>{hasModel ? "🧠" : isQueued ? "⏳" : qFailed ? "❌" : ""}</div>
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, marginTop: 3,
                          color: on ? (hasModel ? "#00ff9d" : isQueued ? "#ffcc00" : "#00d4ff") : "#3a6080" }}>
                          {on ? (
                            hasModel ? "● ML ACTIVE"
                            : isQueued ? (qItem.status === "training" ? "● TRAINING..." : "● QUEUED ~30min")
                            : qFailed ? "● TRAIN FAILED"
                            : "● FALLBACK (no model)"
                          ) : "○ OFF"}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
            {mlSaving && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#00d4ff", textAlign: "center", marginTop: 12 }}>Saving to Supabase...</div>}
          </motion.div>

          {/* Retraining instructions */}
          <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#00d4ff", letterSpacing: 2, marginBottom: 8 }}>🔄 HOW TO TRAIN NEW SYMBOLS</div>
            {[
              { n: "1", t: "Collect data", d: "python3 ml/scripts/collect_data.py" },
              { n: "2", t: "Train models", d: "python3 ml/scripts/train_compact.py" },
              { n: "3", t: "Upload to Supabase", d: "python3 ml/scripts/upload_models.py" },
              { n: "4", t: "Enable here", d: "Toggle the symbol ON in this tab" },
            ].map(({ n, t, d }) => (
              <div key={n} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: "#00d4ff", minWidth: 20 }}>{n}</div>
                <div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#c8e8ff" }}>{t}</div>
                  <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── MARKETS TAB ── */}
      {tab === "markets" && (
        <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
          <div style={c.ct}>MARKETS TO WATCH</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginBottom: 12, lineHeight: 1.7 }}>
            Controls which symbols show on the Dashboard and Signals screen.<br/>
            🧠 = ML model trained for this symbol.
          </div>
          {groups.map(group => (
            <div key={group}>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", letterSpacing: 3, margin: "12px 0 8px" }}>{group.toUpperCase()}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {ALL_SYMBOLS.filter(s => s.group === group).map(sym => {
                  const on = activeSymbols.includes(sym.id);
                  const hasModel = mlModels.some(m => m.symbol === sym.id);
                  return (
                    <button key={sym.id} style={c.symBtn(on, hasModel && on)}
                      onClick={() => {
                        const u = on ? activeSymbols.filter(s => s !== sym.id) : [...activeSymbols, sym.id];
                        if (u.length > 0) updateSymbols?.(u);
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: on ? "#00d4ff" : "#c8e8ff" }}>{sym.label}</div>
                        {hasModel && <span style={{ fontSize: 9 }}>🧠</span>}
                      </div>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: on ? "#00ff9d" : "#3a6080", marginTop: 2 }}>
                        {on ? "● ON" : "○ OFF"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── ACCOUNTS TAB ── */}
      {tab === "accounts" && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>

          {/* ── GLOBAL LIMITS ── */}
          <div style={c.card}>
            <div style={c.ct}>// GLOBAL RISK LIMITS</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginBottom:12,lineHeight:1.8}}>
              These limits apply across ALL platforms combined.<br/>
              Bot will pause if total exposure exceeds these limits.
            </div>
            {[
              {key:"max_trades", label:"Max Concurrent Trades", min:1, max:10, step:1, suffix:"", desc:"Across all platforms"},
              {key:"risk_pct",   label:"Risk Per Trade",        min:0.5, max:10, step:0.5, suffix:"%", desc:"% of balance per trade"},
              {key:"min_confidence", label:"Min ML Confidence", min:30, max:95, step:5, suffix:"%", desc:"Minimum signal strength"},
            ].map(({key,label,min,max,step,suffix,desc})=>(
              <div key={key} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontSize:9,color:"#c8e8ff"}}>{label}</div>
                    <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:8,color:"#3a6080"}}>{desc}</div>
                  </div>
                  <div style={{fontFamily:"'Orbitron',monospace",fontSize:16,fontWeight:700,color:"#00d4ff"}}>
                    {riskParams[key]}{suffix}
                  </div>
                </div>
                <input type="range" min={min} max={max} step={step}
                  value={riskParams[key]||min}
                  onChange={e=>setRiskParams(p=>({...p,[key]:parseFloat(e.target.value)}))}
                  style={{width:"100%",accentColor:"#00d4ff"}}/>
              </div>
            ))}
          </div>

          {/* ── DERIV PLATFORM ── */}
          <PlatformCard
            platform="deriv"
            label="🔷 DERIV"
            description="Synthetics, Forex, Crypto multipliers & binary options"
            accounts={accounts}
            toggleAccount={toggleAccount}
            removeAccount={removeAccount}
            updateToken={updateToken}
            editTokenId={editTokenId}
            setEditTokenId={setEditTokenId}
            editTokenVal={editTokenVal}
            setEditTokenVal={setEditTokenVal}
            newAccName={newAccName}
            setNewAccName={setNewAccName}
            newAccToken={newAccToken}
            setNewAccToken={setNewAccToken}
            handleAddAccount={handleAddAccount}
            availableSymbols={[
              {id:"BOOM500",label:"BOOM 500"},{id:"BOOM1000",label:"BOOM 1000"},
              {id:"CRASH500",label:"CRASH 500"},{id:"CRASH1000",label:"CRASH 1000"},
              {id:"R_25",label:"VIX 25"},{id:"R_50",label:"VIX 50"},
              {id:"R_75",label:"VIX 75"},{id:"R_100",label:"VIX 100"},
              {id:"frxUSDJPY",label:"USD/JPY"},{id:"frxEURUSD",label:"EUR/USD"},
              {id:"frxGBPUSD",label:"GBP/USD"},{id:"frxXAUUSD",label:"Gold/USD"},
              {id:"cryBTCUSD",label:"BTC/USD"},{id:"cryETHUSD",label:"ETH/USD"},
            ]}
            platformSymbols={platformSymbols.deriv || []}
            onSymbolToggle={(sym)=>togglePlatformSymbol("deriv",sym)}
            c={c}
          />

          {/* ── BINANCE PLATFORM ── */}
          <PlatformCard
            platform="binance"
            label="🟡 BINANCE"
            description="Crypto spot & futures — real market, real volume"
            isApiKey={true}
            platformConfig={platformConfig.binance || {}}
            onConfigChange={(cfg)=>updatePlatformConfig("binance",cfg)}
            availableSymbols={[
              {id:"BTCUSDT",label:"BTC/USDT"},{id:"ETHUSDT",label:"ETH/USDT"},
              {id:"BNBUSDT",label:"BNB/USDT"},{id:"SOLUSDT",label:"SOL/USDT"},
              {id:"XRPUSDT",label:"XRP/USDT"},{id:"ADAUSDT",label:"ADA/USDT"},
            ]}
            platformSymbols={platformSymbols.binance || []}
            onSymbolToggle={(sym)=>togglePlatformSymbol("binance",sym)}
            c={c}
          />

          {/* ── EXNESS PLATFORM ── */}
          <PlatformCard
            platform="exness"
            label="🟢 EXNESS"
            description="Real forex ECN — tighter spreads, real order book"
            isApiKey={true}
            platformConfig={platformConfig.exness || {}}
            onConfigChange={(cfg)=>updatePlatformConfig("exness",cfg)}
            availableSymbols={[
              {id:"EURUSD",label:"EUR/USD"},{id:"USDJPY",label:"USD/JPY"},
              {id:"GBPUSD",label:"GBP/USD"},{id:"XAUUSD",label:"Gold/USD"},
              {id:"GBPJPY",label:"GBP/JPY"},{id:"AUDUSD",label:"AUD/USD"},
              {id:"USDCAD",label:"USD/CAD"},{id:"USDCHF",label:"USD/CHF"},
            ]}
            platformSymbols={platformSymbols.exness || []}
            onSymbolToggle={(sym)=>togglePlatformSymbol("exness",sym)}
            c={c}
          />

        </motion.div>
      )}    </div>
  );
}
