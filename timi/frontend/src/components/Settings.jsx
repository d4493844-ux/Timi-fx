import { motion } from "framer-motion";

const ALL_SYMBOLS = [
  { id:"R_75", label:"VIX 75", group:"Synthetic", always:"24/7" },
  { id:"R_25", label:"VIX 25", group:"Synthetic", always:"24/7" },
  { id:"R_50", label:"VIX 50", group:"Synthetic", always:"24/7" },
  { id:"R_100", label:"VIX 100", group:"Synthetic", always:"24/7" },
  { id:"BOOM1000", label:"BOOM 1000", group:"Synthetic", always:"24/7" },
  { id:"BOOM500", label:"BOOM 500", group:"Synthetic", always:"24/7" },
  { id:"CRASH1000", label:"CRASH 1000", group:"Synthetic", always:"24/7" },
  { id:"CRASH500", label:"CRASH 500", group:"Synthetic", always:"24/7" },
  { id:"frxEURUSD", label:"EUR/USD", group:"Forex", always:"Weekdays" },
  { id:"frxGBPUSD", label:"GBP/USD", group:"Forex", always:"Weekdays" },
  { id:"frxUSDJPY", label:"USD/JPY", group:"Forex", always:"Weekdays" },
  { id:"frxUSDNGN", label:"USD/NGN", group:"Forex", always:"Weekdays" },
  { id:"cryBTCUSD", label:"BTC/USD", group:"Crypto", always:"24/7" },
  { id:"cryETHUSD", label:"ETH/USD", group:"Crypto", always:"24/7" },
];

const s = {
  page: { padding:"20px 20px 90px" },
  title: { fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:20 },
  card: { background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:12 },
  cardTitle: { fontFamily:"'Orbitron',monospace", fontSize:10, color:"#00d4ff", letterSpacing:3, marginBottom:14 },
  groupLabel: { fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", letterSpacing:3, marginBottom:8, marginTop:12 },
  symbolGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  symBtn: { padding:"10px 8px", borderRadius:10, border:"1px solid #0a2540", background:"none", cursor:"pointer", textAlign:"left", transition:"all 0.2s" },
  symBtnActive: { borderColor:"#00d4ff", background:"rgba(0,212,255,0.08)" },
  symName: { fontFamily:"'Orbitron',monospace", fontSize:10, color:"#fff" },
  symMeta: { fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:2 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #0a2540" },
  label: { fontFamily:"'Rajdhani',sans-serif", fontSize:14, color:"#c8e8ff", fontWeight:600 },
  meta: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:2 },
  toggle: { width:44, height:24, borderRadius:12, border:"none", cursor:"pointer", position:"relative", transition:"background 0.3s", flexShrink:0 },
  knob: { position:"absolute", top:3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.3s" },
  saveBtn: { width:"100%", marginTop:14, padding:"12px", borderRadius:10, border:"none", background:"linear-gradient(90deg,#00d4ff,#00ff9d)", fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:"#020810", cursor:"pointer", letterSpacing:2 },
};

const GROUPS = ["Synthetic","Forex","Crypto"];

export default function Settings({ autoTrade, setAutoTrade, activeSymbols = [], updateSymbols }) {
  const toggle = (id) => {
    const updated = activeSymbols.includes(id)
      ? activeSymbols.filter(s => s !== id)
      : [...activeSymbols, id];
    if (updated.length === 0) return;
    updateSymbols(updated);
  };

  return (
    <div style={s.page}>
      <div style={s.title}>Settings</div>
      <div style={s.sub}>// TIMI CONFIGURATION</div>

      {/* AUTO TRADE TOGGLE */}
      <motion.div style={s.card} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div style={s.cardTitle}>TRADING CONTROLS</div>
        <div style={{ ...s.row, borderBottom:"none" }}>
          <div>
            <div style={s.label}>Auto Trading</div>
            <div style={s.meta}>TIMI executes trades automatically</div>
          </div>
          <div style={{ ...s.toggle, background: autoTrade ? "linear-gradient(90deg,#00d4ff,#00ff9d)" : "#0a2540" }}
            onClick={() => setAutoTrade(p => !p)}>
            <div style={{ ...s.knob, left: autoTrade ? 23 : 3 }} />
          </div>
        </div>
      </motion.div>

      {/* SYMBOL SELECTOR */}
      <motion.div style={s.card} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <div style={s.cardTitle}>MARKETS TO TRADE</div>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginBottom:12 }}>
          Tap to enable/disable. Changes apply instantly.
        </div>
        {GROUPS.map(group => (
          <div key={group}>
            <div style={s.groupLabel}>{group.toUpperCase()}</div>
            <div style={s.symbolGrid}>
              {ALL_SYMBOLS.filter(s => s.group === group).map(sym => {
                const active = activeSymbols.includes(sym.id);
                return (
                  <motion.button key={sym.id}
                    style={active ? {...s.symBtn,...s.symBtnActive} : s.symBtn}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggle(sym.id)}>
                    <div style={{ ...s.symName, color: active ? "#00d4ff" : "#c8e8ff" }}>{sym.label}</div>
                    <div style={{ ...s.symMeta, color: active ? "#00ff9d" : "#3a6080" }}>{sym.always} {active ? "● ON" : "○ OFF"}</div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>

      {/* RISK PARAMS */}
      <motion.div style={s.card} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <div style={s.cardTitle}>RISK PARAMETERS</div>
        {[{l:"Max Risk Per Trade",v:"2%"},{l:"Max Open Positions",v:"3"},{l:"Min Confidence",v:"65%"},{l:"Trade Duration",v:"5 min"}].map((r,i,arr)=>(
          <div key={r.l} style={{ ...s.row, borderBottom: i===arr.length-1?"none":"1px solid #0a2540" }}>
            <div style={s.label}>{r.l}</div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, color:"#00d4ff" }}>{r.v}</div>
          </div>
        ))}
      </motion.div>

      <motion.div style={{ ...s.card, textAlign:"center", borderColor:"rgba(0,212,255,0.2)" }} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color:"#3a6080", letterSpacing:3, marginBottom:6 }}>STATUS</div>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:12, background:"linear-gradient(135deg,#00d4ff,#00ff9d)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          TIMI v2.0 · {autoTrade ? "AUTONOMOUS MODE" : "PAUSED"}
        </div>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:6 }}>
          Trading {activeSymbols.length} market{activeSymbols.length !== 1 ? "s" : ""}
        </div>
      </motion.div>
    </div>
  );
}
