const tabs = [
  { id: "dashboard", icon: "◈", label: "DASH" },
  { id: "trades", icon: "◆", label: "TRADES" },
  { id: "signals", icon: "◉", label: "SIGNALS" },
  { id: "backtest", icon: "⏮", label: "BACKTEST" },
  { id: "growth", icon: "📈", label: "GROWTH" },
  { id: "history", icon: "✕", label: "HISTORY" },
  { id: "settings", icon: "✛", label: "SETTINGS" },
];

export default function BottomNav({ page, setPage }) {
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(2,8,16,0.97)", backdropFilter: "blur(20px)", borderTop: "1px solid #0a2540", display: "flex", zIndex: 100, overflowX: "auto" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)}
          style={{ flex: "0 0 auto", minWidth: 60, padding: "10px 8px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, borderTop: page === t.id ? "2px solid #00d4ff" : "2px solid transparent", transition: "all 0.2s" }}>
          <span style={{ fontSize: 16, color: page === t.id ? "#00d4ff" : "#3a6080" }}>{t.icon}</span>
          <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: page === t.id ? "#00d4ff" : "#3a6080", letterSpacing: 1 }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
