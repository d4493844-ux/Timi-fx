import { motion } from "framer-motion";

const SYMBOL_NAMES = { frxEURUSD:"EUR/USD", R_75:"VIX 75", cryBTCUSD:"BTC/USD", BOOM1000:"BOOM 1000" };

const s = {
  page: { padding:"20px 20px 90px" },
  title: { fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:20 },
  card: { background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:10 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 },
  sym: { fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:700, color:"#fff" },
  tf: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:3 },
  confBar: { height:4, background:"#0a2540", borderRadius:2, overflow:"hidden", marginBottom:8 },
  tags: { display:"flex", gap:6, flexWrap:"wrap" },
  tag: { fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 8px", borderRadius:6, border:"1px solid #0a2540", color:"#3a6080" },
  empty: { textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, marginTop:60 },
};

export default function Signals({ signals = {} }) {
  const entries = Object.entries(signals);
  return (
    <div style={s.page}>
      <div style={s.title}>Signals</div>
      <div style={s.sub}>// LIVE CONFLUENCE SIGNALS</div>
      {entries.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
          Loading market data...<br/>Signals appear after 30 candles load.
        </div>
      )}
      {entries.map(([sym, sig], i) => {
        const color = sig.action==="BUY"?"#00ff9d":sig.action==="SELL"?"#ff3366":"#ffcc00";
        return (
          <motion.div key={sym} style={s.card} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.1 }}>
            <div style={s.row}>
              <div>
                <div style={s.sym}>{SYMBOL_NAMES[sym] || sym}</div>
                <div style={s.tf}>1M candles · Live</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:900, color }}>{sig.action}</div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color, marginTop:2 }}>{sig.confidence}% conf.</div>
              </div>
            </div>
            <div style={s.confBar}>
              <motion.div style={{ height:"100%", borderRadius:2, background:`linear-gradient(90deg,${color}88,${color})` }}
                initial={{ width:0 }} animate={{ width:`${sig.confidence}%` }} transition={{ duration:0.8, delay:0.2 }} />
            </div>
            <div style={s.tags}>{(sig.reasons||[]).map(r=><span key={r} style={s.tag}>{r}</span>)}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
