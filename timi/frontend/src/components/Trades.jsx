import { motion } from "framer-motion";

const s = {
  page: { padding:"20px 20px 90px" },
  title: { fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:20 },
  empty: { textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, marginTop:60 },
  card: { background:"#071525", borderRadius:14, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12, position:"relative", overflow:"hidden" },
  sym: { fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color:"#fff", minWidth:80 },
  dir: { fontSize:10, letterSpacing:2, marginTop:3 },
  entry: { fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#3a6080" },
  live: { fontFamily:"'Share Tech Mono',monospace", fontSize:12, color:"#c8e8ff", marginTop:2 },
  pnl: { fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, textAlign:"right" },
  time: { fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", textAlign:"right", marginTop:3 },
};

export default function Trades({ openTrades = [] }) {
  return (
    <div style={s.page}>
      <div style={s.title}>Live Positions</div>
      <div style={s.sub}>// ACTIVE TRADES · REAL-TIME</div>
      {openTrades.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
          No open trades.<br/>TIMI is scanning for signals...
        </div>
      )}
      {openTrades.map((t, i) => (
        <motion.div key={t.id} style={{ ...s.card, borderLeft:`3px solid ${t.pnl >= 0 ? "#00ff9d" : "#ff3366"}`, border:`1px solid ${t.pnl >= 0 ? "rgba(0,255,157,0.2)" : "rgba(255,51,102,0.2)"}`, borderLeft:`3px solid ${t.pnl >= 0 ? "#00ff9d" : "#ff3366"}` }}
          initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.1 }}>
          <div>
            <div style={s.sym}>{t.symbol}</div>
            <div style={{ ...s.dir, color: t.type==="BUY"?"#00ff9d":"#ff3366" }}>{t.type==="BUY"?"▲":"▼"} {t.type}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={s.entry}>Stake: ${t.stake}</div>
            <div style={s.live}>Status: {t.status}</div>
          </div>
          <div>
            <div style={{ ...s.pnl, color: t.pnl >= 0 ? "#00ff9d" : "#ff3366" }}>{t.pnl >= 0 ? "+" : ""}${t.pnl?.toFixed(2)}</div>
            <div style={s.time}>{Math.floor((Date.now()-t.openTime)/60000)}m ago</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
