const tabs = [
  { id:"dashboard", icon:"⬡", label:"DASH" },
  { id:"trades", icon:"◈", label:"TRADES" },
  { id:"signals", icon:"◎", label:"SIGNALS" },
  { id:"history", icon:"⧖", label:"HISTORY" },
  { id:"settings", icon:"⊕", label:"SETTINGS" },
];

const styles = {
  nav: { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"rgba(5,14,26,0.97)", borderTop:"1px solid #0a2540", backdropFilter:"blur(20px)", display:"flex", justifyContent:"space-around", padding:"10px 0 20px", zIndex:100 },
  btn: { display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 12px", cursor:"pointer", border:"none", background:"none" },
  icon: { fontSize:20, transition:"all 0.2s" },
  label: { fontFamily:"'Share Tech Mono',monospace", fontSize:9, letterSpacing:1, transition:"all 0.2s" }
};

export default function BottomNav({ page, setPage }) {
  return (
    <nav style={styles.nav}>
      {tabs.map(t => (
        <button key={t.id} style={styles.btn} onClick={() => setPage(t.id)}>
          <span style={{ ...styles.icon, color: page===t.id ? "#00d4ff" : "#3a6080", filter: page===t.id ? "drop-shadow(0 0 6px #00d4ff)" : "none" }}>{t.icon}</span>
          <span style={{ ...styles.label, color: page===t.id ? "#00d4ff" : "#3a6080" }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
