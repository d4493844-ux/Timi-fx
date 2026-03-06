import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

const SYMBOLS = [
  // Synthetic Indices
  { id:"R_75",      label:"VIX 75" },
  { id:"R_25",      label:"VIX 25" },
  { id:"R_50",      label:"VIX 50" },
  { id:"R_100",     label:"VIX 100" },
  { id:"1HZ100V",   label:"VIX 100 (1s)" },
  { id:"1HZ75V",    label:"VIX 75 (1s)" },
  { id:"BOOM1000",  label:"BOOM 1000" },
  { id:"BOOM500",   label:"BOOM 500" },
  { id:"CRASH1000", label:"CRASH 1000" },
  { id:"CRASH500",  label:"CRASH 500" },
  { id:"JD75",      label:"Jump 75" },
  { id:"JD100",     label:"Jump 100" },
  // Forex
  { id:"frxEURUSD", label:"EUR/USD" },
  { id:"frxGBPUSD", label:"GBP/USD" },
  { id:"frxUSDJPY", label:"USD/JPY" },
  { id:"frxGBPJPY", label:"GBP/JPY" },
  { id:"frxEURJPY", label:"EUR/JPY" },
  { id:"frxAUDUSD", label:"AUD/USD" },
  { id:"frxUSDCAD", label:"USD/CAD" },
  { id:"frxGBPAUD", label:"GBP/AUD" },
  { id:"frxEURGBP", label:"EUR/GBP" },
  { id:"frxAUDJPY", label:"AUD/JPY" },
  { id:"frxNZDUSD", label:"NZD/USD" },
  { id:"frxUSDCHF", label:"USD/CHF" },
  // Crypto
  { id:"cryBTCUSD", label:"BTC/USD" },
  { id:"cryETHUSD", label:"ETH/USD" },
  // Metals
  { id:"frxXAUUSD", label:"Gold/USD" },
  { id:"frxXAGUSD", label:"Silver/USD" },
];

const s = {
  page:  { padding:"20px 20px 110px", background:"#020810", minHeight:"100vh" },
  title: { fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub:   { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16 },
  card:  { background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:12 },
  ct:    { fontFamily:"'Orbitron',monospace", fontSize:10, color:"#00d4ff", letterSpacing:3, marginBottom:14 },
  lbl:   { fontFamily:"'Rajdhani',sans-serif", fontSize:14, color:"#c8e8ff", fontWeight:600 },
  meta:  { fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:2 },
  row:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #0a2540" },
  val:   { fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, color:"#00d4ff", minWidth:52, textAlign:"right" },
  toggle: on => ({ width:48, height:27, borderRadius:14, border:"none", cursor:"pointer", position:"relative", background: on ? "linear-gradient(90deg,#00d4ff,#00ff9d)" : "#0a2540", transition:"background 0.3s", flexShrink:0 }),
  knob:   on => ({ position:"absolute", top:4, left: on?25:4, width:19, height:19, borderRadius:"50%", background:"#fff", transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.4)" }),
  btn:   { padding:"11px 18px", borderRadius:10, border:"none", cursor:"pointer", fontFamily:"'Orbitron',monospace", fontSize:10, fontWeight:700, letterSpacing:1 },
  btnP:  { background:"linear-gradient(90deg,#00d4ff,#00ff9d)", color:"#020810" },
  btnD:  { background:"rgba(255,51,102,0.15)", border:"1px solid rgba(255,51,102,0.3)", color:"#ff3366" },
  btnY:  { background:"rgba(255,204,0,0.15)", border:"1px solid rgba(255,204,0,0.3)", color:"#ffcc00" },
  inp:   { background:"#0a2540", border:"1px solid #1a3550", borderRadius:8, padding:"9px 12px", color:"#fff", fontFamily:"'Share Tech Mono',monospace", fontSize:12, outline:"none", boxSizing:"border-box" },
  symBtn: on => ({ padding:"9px 8px", borderRadius:10, cursor:"pointer", textAlign:"left", background: on ? "rgba(0,212,255,0.08)" : "none", border:`1px solid ${on?"#00d4ff":"#0a2540"}` }),
  statusDot: on => ({ width:9, height:9, borderRadius:"50%", background: on ? "#00ff9d" : "#ff3366", boxShadow:`0 0 8px ${on?"#00ff9d":"#ff3366"}`, flexShrink:0 }),
};

function Stepper({ value, min, max, step, suffix, onChange }) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));
  const pct = Math.round((value - min) / (max - min) * 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:8 }}>
      <motion.button whileTap={{scale:0.88}} onPointerDown={e=>{e.preventDefault();dec();}}
        style={{width:40,height:40,borderRadius:9,border:"1px solid #1a3550",background:"#0a2540",color:"#00d4ff",fontSize:20,fontWeight:700,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>−</motion.button>
      <div style={{flex:1,height:6,background:"#0a2540",borderRadius:3,overflow:"hidden"}}>
        <motion.div animate={{width:pct+"%"}} transition={{duration:0.2}}
          style={{height:"100%",background:"linear-gradient(90deg,#00d4ff,#00ff9d)",borderRadius:3}}/>
      </div>
      <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:900,color:"#00d4ff",minWidth:52,textAlign:"center"}}>{value}{suffix}</div>
      <motion.button whileTap={{scale:0.88}} onPointerDown={e=>{e.preventDefault();inc();}}
        style={{width:40,height:40,borderRadius:9,border:"1px solid #1a3550",background:"#0a2540",color:"#00ff9d",fontSize:20,fontWeight:700,cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>+</motion.button>
    </div>
  );
}

export default function RemoteControl() {
  const [config,    setConfig]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [status,    setStatus]    = useState("");
  const [lastRun,   setLastRun]   = useState(null);
  const [testResult,setTestResult]= useState(null);
  const [testing,   setTesting]   = useState(false);
  const [tab,       setTab]       = useState("control");

  // ── Load config from Supabase ──
  const loadConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bot_config").select("*").eq("active", true).limit(1).single();
      if (error) throw error;
      setConfig(data);
    } catch (e) {
      setStatus("❌ Could not load config: " + e.message);
    }
    setLoading(false);
  }, []);

  // ── Load last trade from Supabase ──
  const loadLastRun = useCallback(async () => {
    const { data } = await supabase.from("trades")
      .select("*").eq("account_name","edge_function").order("created_at",{ascending:false}).limit(1)
      .order("created_at", { ascending: false }).limit(1).single();
    if (data) setLastRun(data);
  }, []);

  useEffect(() => {
    loadConfig();
    loadLastRun();
    // Refresh last run every 30 seconds
    const interval = setInterval(loadLastRun, 30000);
    return () => clearInterval(interval);
  }, [loadConfig, loadLastRun]);

  // ── Save single field to Supabase immediately ──
  const saveField = useCallback(async (field, value) => {
    if (!config?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("bot_config")
        .update({ [field]: value }).eq("id", config.id);
      if (error) throw error;
      setConfig(prev => ({ ...prev, [field]: value }));
      setStatus(`✅ ${field} updated`);
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus("❌ Save failed: " + e.message);
    }
    setSaving(false);
  }, [config]);

  // ── Toggle symbol on/off ──
  const toggleSymbol = useCallback(async (symId) => {
    const current = config?.symbols || [];
    const updated = current.includes(symId)
      ? current.filter(s => s !== symId)
      : [...current, symId];
    if (updated.length === 0) return; // must have at least 1
    await saveField("symbols", updated);
  }, [config, saveField]);

  // ── Test the edge function manually ──
  const testNow = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(
        "https://pedbupgjxlcumidwoktc.supabase.co/functions/v1/timi-trader",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjc0NTIsImV4cCI6MjA4NzkwMzQ1Mn0.lscyzf9JN82ZihHLD0VC4broyMMfm7WL9MIvXRmwZG8"
          },
          body: JSON.stringify({})
        }
      );
      const data = await res.json();
      setTestResult(data);
      if (data.status === "traded") loadLastRun();
    } catch (e) {
      setTestResult({ status: "error", message: e.message });
    }
    setTesting(false);
  };

  if (loading) return (
    <div style={{...s.page, display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{fontFamily:"'Orbitron',monospace", fontSize:14, color:"#00d4ff"}}>Loading remote config...</div>
    </div>
  );

  if (!config) return (
    <div style={s.page}>
      <div style={s.title}>Remote Control</div>
      <div style={{...s.card, borderColor:"rgba(255,51,102,0.3)"}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#ff3366", lineHeight:1.7}}>
          ❌ Could not connect to Supabase bot_config.<br/>
          Make sure you ran the setup SQL and the table exists.
        </div>
      </div>
    </div>
  );

  const statusColor = config.auto_trade ? "#00ff9d" : "#ff3366";

  return (
    <div style={s.page}>
      <div style={s.title}>Remote Control</div>
      <div style={s.sub}>// CONTROL TIMI FROM ANYWHERE</div>

      {/* ── LIVE STATUS CARD ── */}
      <motion.div style={{...s.card, border:`1px solid ${statusColor}33`}}
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:14}}>
          <motion.div style={s.statusDot(config.auto_trade)}
            animate={config.auto_trade ? {scale:[1,1.3,1], opacity:[1,0.7,1]} : {}}
            transition={{duration:1.5, repeat:Infinity}}/>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color:statusColor}}>
              TIMI {config.auto_trade ? "ACTIVE — Trading 24/7" : "PAUSED"}
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:2}}>
              Cloud · Supabase Edge Function · Every 5 min
            </div>
          </div>
          <button style={{...s.toggle(config.auto_trade), marginLeft:"auto"}}
            onClick={() => saveField("auto_trade", !config.auto_trade)}>
            <div style={s.knob(config.auto_trade)}/>
          </button>
        </div>

        {/* Last trade by edge function */}
        {lastRun && (
          <div style={{background:"rgba(0,212,255,0.05)", borderRadius:10, padding:"10px 12px"}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", letterSpacing:2, marginBottom:6}}>LAST CLOUD TRADE</div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div>
                <span style={{fontFamily:"'Orbitron',monospace", fontSize:11, color:lastRun.type==="BUY"?"#00ff9d":"#ff3366", fontWeight:700}}>{lastRun.type} </span>
                <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#c8e8ff"}}>{lastRun.symbol}</span>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:2}}>
                  {new Date(lastRun.created_at).toLocaleString()} · {lastRun.confidence}% conf
                </div>
              </div>
              <div style={{fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700,
                color:lastRun.result==="WIN"?"#00ff9d":lastRun.result==="LOSS"?"#ff3366":"#ffcc00"}}>
                {lastRun.result}
              </div>
            </div>
          </div>
        )}

        {/* Test button */}
        <motion.button whileTap={{scale:0.96}} onClick={testNow} disabled={testing}
          style={{...s.btn, ...s.btnY, width:"100%", marginTop:12, opacity:testing?0.6:1}}>
          {testing ? "⏳ Checking markets..." : "🔍 TEST TIMI NOW"}
        </motion.button>

        {/* Test result */}
        <AnimatePresence>
          {testResult && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
              style={{marginTop:10, padding:"10px 12px", borderRadius:10,
                background: testResult.status==="traded" ? "rgba(0,255,157,0.08)" : testResult.status==="no_signal" ? "rgba(0,212,255,0.06)" : "rgba(255,51,102,0.08)",
                border:`1px solid ${testResult.status==="traded"?"rgba(0,255,157,0.3)":testResult.status==="no_signal"?"rgba(0,212,255,0.2)":"rgba(255,51,102,0.3)"}`}}>
              <div style={{fontFamily:"'Orbitron',monospace", fontSize:10, fontWeight:700, marginBottom:4,
                color: testResult.status==="traded"?"#00ff9d":testResult.status==="no_signal"?"#00d4ff":"#ff3366"}}>
                {testResult.status==="traded" ? "✅ TRADE PLACED!" : testResult.status==="no_signal" ? "📊 NO SIGNAL YET" : testResult.status==="paused" ? "⏸ TIMI IS PAUSED" : "❌ " + testResult.status.toUpperCase()}
              </div>
              {testResult.status==="traded" && (
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#c8e8ff", lineHeight:1.7}}>
                  {testResult.action} {testResult.symbol} · ${testResult.stake} stake<br/>
                  {testResult.confidence}% confidence · Balance: ${testResult.balance?.toFixed(2)}
                </div>
              )}
              {testResult.status==="no_signal" && (
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080"}}>
                  Checked: {testResult.checked?.join(", ")}. Waiting for confluence.
                </div>
              )}
              {testResult.message && (
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#ff3366", marginTop:4}}>
                  {testResult.message}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {saving && <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#00d4ff",marginTop:8,textAlign:"center"}}>Saving to Supabase...</div>}
        {status && <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:status.startsWith("✅")?"#00ff9d":"#ff3366",marginTop:8,textAlign:"center"}}>{status}</div>}
      </motion.div>

      {/* ── TABS ── */}
      <div style={{display:"flex", gap:6, marginBottom:12}}>
        {["control","symbols","token"].map(t => (
          <button key={t} onClick={()=>setTab(t)}
            style={{flex:1, padding:"9px 6px", borderRadius:9, border:"none", cursor:"pointer",
              fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:1,
              background: tab===t ? "linear-gradient(90deg,#00d4ff,#0080ff)" : "#071525",
              color: tab===t ? "#020810" : "#3a6080"}}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── CONTROL TAB ── */}
      {tab === "control" && (
        <motion.div style={s.card} initial={{opacity:0}} animate={{opacity:1}}>
          <div style={s.ct}>TRADING PARAMETERS</div>

          {[
            { key:"risk_pct",       label:"Risk Per Trade",  min:0.5, max:10,  step:0.5, suffix:"%",   desc:"% of balance per trade" },
            { key:"min_confidence", label:"Min Confidence",  min:30,  max:90,  step:5,   suffix:"%",   desc:"Min signal strength to trade" },
            { key:"max_trades",     label:"Max Open Trades", min:1,   max:10,  step:1,   suffix:"",    desc:"Max positions at once" },
            { key:"duration",       label:"Trade Duration",  min:1,   max:60,  step:1,   suffix:" min", desc:"Contract duration" },
            { key:"daily_target",   label:"Daily Target",    min:0,   max:1000,step:5,   suffix:"$",   desc:"Stop trading after this profit (0 = no limit)" },
          ].map(p => (
            <div key={p.key} style={{marginBottom:18, paddingBottom:14, borderBottom:"1px solid #0a2540"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}>
                <div><div style={s.lbl}>{p.label}</div><div style={s.meta}>{p.desc}</div></div>
              </div>
              <Stepper
                value={config[p.key] ?? 0}
                min={p.min} max={p.max} step={p.step} suffix={p.suffix}
                onChange={v => saveField(p.key, v)}
              />
            </div>
          ))}

          {/* Emergency stop */}
          <motion.button whileTap={{scale:0.96}}
            onClick={() => saveField("auto_trade", false)}
            style={{...s.btn, ...s.btnD, width:"100%", marginTop:4}}>
            🛑 EMERGENCY STOP — PAUSE ALL TRADING
          </motion.button>
        </motion.div>
      )}

      {/* ── SYMBOLS TAB ── */}
      {tab === "symbols" && (
        <motion.div style={s.card} initial={{opacity:0}} animate={{opacity:1}}>
          <div style={s.ct}>ACTIVE SYMBOLS</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginBottom:12}}>
            Tap to toggle. TIMI only trades selected symbols.
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            {SYMBOLS.map(sym => {
              const on = (config.symbols || []).includes(sym.id);
              return (
                <motion.button key={sym.id} whileTap={{scale:0.94}}
                  onClick={() => toggleSymbol(sym.id)}
                  style={s.symBtn(on)}>
                  <div style={{fontFamily:"'Orbitron',monospace", fontSize:9, color:on?"#00d4ff":"#c8e8ff"}}>{sym.label}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:on?"#00ff9d":"#3a6080", marginTop:2}}>
                    {on ? "● ACTIVE" : "○ OFF"}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── TOKEN TAB ── */}
      {tab === "token" && (
        <motion.div style={s.card} initial={{opacity:0}} animate={{opacity:1}}>
          <div style={s.ct}>DERIV TOKEN</div>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginBottom:12, lineHeight:1.7}}>
            Update your Deriv API token here when it changes. TIMI picks it up instantly on the next run.
          </div>
          <TokenEditor config={config} saveField={saveField} />
        </motion.div>
      )}
    </div>
  );
}

// ── Token editor with show/hide ──
function TokenEditor({ config, saveField }) {
  const [val,     setVal]     = useState(config?.token || "");
  const [show,    setShow]    = useState(false);
  const [saved,   setSaved]   = useState(false);

  const save = async () => {
    if (!val || val.length < 5) return;
    await saveField("token", val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const masked = val ? val.slice(0,6) + "••••••••" + val.slice(-4) : "";

  return (
    <div>
      <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginBottom:6}}>CURRENT TOKEN</div>
      <div style={{background:"#0a2540", borderRadius:8, padding:"10px 12px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#00ff9d"}}>
          {show ? (config?.token || "—") : masked || "—"}
        </div>
        <button onClick={()=>setShow(p=>!p)}
          style={{background:"none", border:"none", cursor:"pointer", fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080"}}>
          {show ? "HIDE" : "SHOW"}
        </button>
      </div>
      <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginBottom:6}}>NEW TOKEN</div>
      <input
        style={{...{background:"#0a2540",border:"1px solid #1a3550",borderRadius:8,padding:"9px 12px",color:"#fff",fontFamily:"'Share Tech Mono',monospace",fontSize:12,outline:"none",boxSizing:"border-box"}, width:"100%"}}
        type="password" placeholder="Paste new Deriv API token"
        value={val} onChange={e=>setVal(e.target.value)}
      />
      <motion.button whileTap={{scale:0.96}} onClick={save}
        style={{...{padding:"11px 18px",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"'Orbitron',monospace",fontSize:10,fontWeight:700,letterSpacing:1}, background:"linear-gradient(90deg,#00d4ff,#00ff9d)", color:"#020810", width:"100%", marginTop:10}}>
        {saved ? "✅ TOKEN UPDATED!" : "UPDATE TOKEN"}
      </motion.button>
      <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:10, lineHeight:1.7}}>
        Get your token from: deriv.com → Account Settings → API Token → Create token with Trade + Read permissions
      </div>
    </div>
  );
}
