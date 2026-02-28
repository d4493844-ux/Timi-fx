import { motion } from "framer-motion";

const NAMES = { R_75:"VIX 75",R_25:"VIX 25",R_50:"VIX 50",R_100:"VIX 100",BOOM1000:"BOOM 1000",BOOM500:"BOOM 500",CRASH1000:"CRASH 1000",CRASH500:"CRASH 500",frxEURUSD:"EUR/USD",frxGBPUSD:"GBP/USD",frxUSDJPY:"USD/JPY",cryBTCUSD:"BTC/USD",cryETHUSD:"ETH/USD" };

const s = {
  page:{ padding:"20px 20px 90px" },
  title:{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub:{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16 },
  sessionCard:{ background:"#071525", border:"1px solid rgba(0,212,255,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" },
  card:{ background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:10 },
  row:{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 },
  sym:{ fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, color:"#fff" },
  confBar:{ height:4, background:"#0a2540", borderRadius:2, overflow:"hidden", marginBottom:8 },
  tags:{ display:"flex", gap:5, flexWrap:"wrap" },
  tag:{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 7px", borderRadius:5, border:"1px solid #0a2540", color:"#3a6080" },
  patternTag:{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 7px", borderRadius:5 },
  empty:{ textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, marginTop:60 },
  srRow:{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" },
  srTag:{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 8px", borderRadius:5 },
};

const SESSION_COLORS = { london:"#00d4ff", newYork:"#00ff9d", tokyo:"#ffcc00", sydney:"#ff9966" };

export default function Signals({ signals={}, session={} }) {
  const entries = Object.entries(signals);
  const activeSessions = session.active || [];

  return (
    <div style={s.page}>
      <div style={s.title}>Signals</div>
      <div style={s.sub}>// AI CONFLUENCE · 11 INDICATORS</div>

      {/* SESSION BAR */}
      <div style={s.sessionCard}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace", fontSize:9, color:"#3a6080", letterSpacing:3, marginBottom:4}}>ACTIVE SESSIONS</div>
          <div style={{display:"flex", gap:6}}>
            {activeSessions.length === 0
              ? <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#3a6080"}}>Off-hours — low volatility</span>
              : activeSessions.map(s => (
                <span key={s.name} style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:SESSION_COLORS[s.name]||"#fff", background:"rgba(0,212,255,0.08)", padding:"3px 8px", borderRadius:6}}>
                  {s.name.charAt(0).toUpperCase()+s.name.slice(1)}
                </span>
              ))
            }
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color: session.overlap?"#00ff9d":"#00d4ff"}}>
            {session.strength || 0}/4
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080"}}>{session.overlap?"OVERLAP":"STRENGTH"}</div>
        </div>
      </div>

      {entries.length === 0 && (
        <div style={s.empty}><div style={{fontSize:32,marginBottom:12}}>🔍</div>Loading signals...</div>
      )}

      {entries.map(([sym, sig], i) => {
        const color = sig.action==="BUY"?"#00ff9d":sig.action==="SELL"?"#ff3366":"#ffcc00";
        return (
          <motion.div key={sym} style={s.card} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}>
            <div style={s.row}>
              <div>
                <div style={s.sym}>{NAMES[sym]||sym}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:2}}>
                  RSI: {sig.rsi} · Score: {sig.score}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Orbitron',monospace", fontSize:20, fontWeight:900, color}}>{sig.action}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color, marginTop:2}}>{sig.confidence}% conf</div>
              </div>
            </div>

            <div style={s.confBar}>
              <motion.div style={{height:"100%", borderRadius:2, background:`linear-gradient(90deg,${color}55,${color})`}}
                initial={{width:0}} animate={{width:sig.confidence+"%"}} transition={{duration:0.8}}/>
            </div>

            {/* Candlestick patterns */}
            {sig.patterns && sig.patterns.length > 0 && (
              <div style={{...s.tags, marginBottom:6}}>
                {sig.patterns.map(p => (
                  <span key={p.name} style={{...s.patternTag, background:p.type==="bullish"?"rgba(0,255,157,0.1)":"rgba(255,51,102,0.1)", border:"1px solid "+(p.type==="bullish"?"rgba(0,255,157,0.3)":"rgba(255,51,102,0.3)"), color:p.type==="bullish"?"#00ff9d":"#ff3366"}}>
                    🕯 {p.name}
                  </span>
                ))}
              </div>
            )}

            {/* Reasons */}
            <div style={s.tags}>
              {(sig.reasons||[]).map(r => <span key={r} style={s.tag}>{r}</span>)}
            </div>

            {/* S/R levels */}
            {sig.sr && (sig.sr.resistance.length > 0 || sig.sr.support.length > 0) && (
              <div style={s.srRow}>
                {sig.sr.resistance.slice(0,2).map(r => (
                  <span key={r} style={{...s.srTag, background:"rgba(255,51,102,0.08)", border:"1px solid rgba(255,51,102,0.2)", color:"#ff3366"}}>R: {r.toFixed(4)}</span>
                ))}
                {sig.sr.support.slice(0,2).map(s => (
                  <span key={s} style={{...s.srTag, background:"rgba(0,255,157,0.08)", border:"1px solid rgba(0,255,157,0.2)", color:"#00ff9d"}}>S: {s.toFixed(4)}</span>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
