import { useState } from "react";
import { motion } from "framer-motion";
import useSessionStats from "../hooks/useSessionStats";

const NAMES = {
  R_75:"VIX 75", R_25:"VIX 25", R_50:"VIX 50", R_100:"VIX 100",
  BOOM1000:"BOOM 1000", BOOM500:"BOOM 500",
  CRASH1000:"CRASH 1000", CRASH500:"CRASH 500",
  frxEURUSD:"EUR/USD", frxGBPUSD:"GBP/USD", cryBTCUSD:"BTC/USD"
};

const SESSION_COLORS = {
  london: "#00d4ff", newYork: "#00ff9d",
  tokyo: "#ffcc00", sydney: "#ff9966", unknown: "#3a6080"
};

const s = {
  page: { padding: "20px 20px 100px" },
  title: { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  sub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 16 },
  tabs: { display: "flex", gap: 8, marginBottom: 16 },
  tab: (active) => ({
    flex: 1, padding: "9px 0", borderRadius: 10, border: "none", cursor: "pointer",
    fontFamily: "'Orbitron',monospace", fontSize: 10, letterSpacing: 1, fontWeight: 700,
    background: active ? "linear-gradient(90deg,#00d4ff,#0080ff)" : "#071525",
    color: active ? "#020810" : "#3a6080",
  }),
  card: { background: "#071525", border: "1px solid #0a2540", borderRadius: 14, padding: 14, marginBottom: 10 },
  summaryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 },
  statBox: { background: "#071525", border: "1px solid #0a2540", borderRadius: 12, padding: "12px", textAlign: "center" },
  statVal: { fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700 },
  statLbl: { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 3 },
  tradeRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #071525" },
  empty: { textAlign: "center", color: "#3a6080", fontFamily: "'Share Tech Mono',monospace", fontSize: 12, padding: 40 },
  clearBtn: { width: "100%", padding: 11, borderRadius: 10, border: "1px solid rgba(255,51,102,0.3)", background: "rgba(255,51,102,0.08)", color: "#ff3366", fontFamily: "'Orbitron',monospace", fontSize: 10, cursor: "pointer", letterSpacing: 1, marginTop: 8 },
  sessionCard: { borderRadius: 12, padding: "12px 14px", marginBottom: 10 },
  filterRow: { display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" },
  filterBtn: (active) => ({
    flex: "0 0 auto", padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
    fontFamily: "'Share Tech Mono',monospace", fontSize: 10,
    background: active ? "rgba(0,212,255,0.15)" : "#071525",
    color: active ? "#00d4ff" : "#3a6080",
  }),
};

export default function History({ tradeHistory = [] }) {
  const [tab, setTab] = useState("trades");
  const [filter, setFilter] = useState("ALL");
  const sessionStats = useSessionStats(tradeHistory);

  const wins = tradeHistory.filter(t => t.result === "WIN");
  const losses = tradeHistory.filter(t => t.result === "LOSS");
  const totalPnl = tradeHistory.reduce((a, t) => a + (t.pnl || 0), 0);
  const winRate = tradeHistory.length ? Math.round(wins.length / tradeHistory.length * 100) : 0;
  const avgWin = wins.length ? (wins.reduce((a, t) => a + t.pnl, 0) / wins.length).toFixed(2) : "0";
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + t.pnl, 0) / losses.length).toFixed(2) : "0";
  const streak = (() => {
    let s = 0;
    for (const t of tradeHistory) {
      if (t.result === tradeHistory[0]?.result) s++; else break;
    }
    return s;
  })();

  const symbols = ["ALL", ...new Set(tradeHistory.map(t => t.symbol))];
  const filtered = filter === "ALL" ? tradeHistory : tradeHistory.filter(t => t.symbol === filter);

  const clearHistory = () => {
    if (window.confirm("Clear all trade history?")) {
      localStorage.removeItem("timi_trade_history");
      window.location.reload();
    }
  };

  return (
    <div style={s.page}>
      <div style={s.title}>History</div>
      <div style={s.sub}>// TRADE LOGS & PERFORMANCE</div>

      {/* Summary stats */}
      <div style={s.summaryGrid}>
        <div style={s.statBox}>
          <div style={{ ...s.statVal, color: totalPnl >= 0 ? "#00ff9d" : "#ff3366" }}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </div>
          <div style={s.statLbl}>TOTAL P&L</div>
        </div>
        <div style={s.statBox}>
          <div style={{ ...s.statVal, color: winRate >= 54 ? "#00ff9d" : "#ff3366" }}>{winRate}%</div>
          <div style={s.statLbl}>WIN RATE</div>
        </div>
        <div style={s.statBox}>
          <div style={{ ...s.statVal, color: "#00d4ff" }}>{tradeHistory.length}</div>
          <div style={s.statLbl}>TOTAL TRADES</div>
        </div>
        <div style={s.statBox}>
          <div style={{ ...s.statVal, color: tradeHistory[0]?.result === "WIN" ? "#00ff9d" : "#ff3366" }}>
            {streak}🔥
          </div>
          <div style={s.statLbl}>CURRENT STREAK</div>
        </div>
      </div>

      {/* Win/Loss breakdown */}
      <div style={{ ...s.card, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, padding: 0, overflow: "hidden", marginBottom: 14 }}>
        {[
          { l: "AVG WIN", v: "+$" + avgWin, c: "#00ff9d" },
          { l: "AVG LOSS", v: "-$" + avgLoss, c: "#ff3366" },
          { l: "BEST STREAK", c: "#ffcc00", v: (() => {
            let best = 0, cur = 0, last = null;
            [...tradeHistory].reverse().forEach(t => {
              if (t.result === "WIN") { if (last === "WIN") cur++; else cur = 1; }
              else { cur = 0; } last = t.result; best = Math.max(best, cur);
            }); return best + "W";
          })() },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ background: "#071525", padding: "10px 6px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a6080", marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {["trades", "sessions"].map(t => (
          <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TRADES TAB */}
      {tab === "trades" && (
        <>
          {/* Symbol filter */}
          <div style={s.filterRow}>
            {symbols.map(sym => (
              <button key={sym} style={s.filterBtn(filter === sym)} onClick={() => setFilter(sym)}>
                {NAMES[sym] || sym}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              No trade history yet. Trades appear here after they close.
            </div>
          ) : (
            <div style={s.card}>
              {filtered.map((t, i) => (
                <motion.div key={i} style={s.tradeRow}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 700,
                        color: t.type === "BUY" ? "#00ff9d" : "#ff3366",
                        background: t.type === "BUY" ? "rgba(0,255,157,0.1)" : "rgba(255,51,102,0.1)",
                        padding: "2px 7px", borderRadius: 5
                      }}>{t.type}</span>
                      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#c8e8ff" }}>
                        {NAMES[t.symbol] || t.symbol}
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 4 }}>
                      {t.date} {t.account ? `· ${t.account}` : ""} {t.session ? `· ${t.session}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 900,
                      color: t.result === "WIN" ? "#00ff9d" : "#ff3366"
                    }}>
                      {t.pnl >= 0 ? "+" : ""}${Math.abs(t.pnl || 0).toFixed(2)}
                    </div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: t.result === "WIN" ? "#00ff9d" : "#ff3366", marginTop: 2 }}>
                      {t.result}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <button style={s.clearBtn} onClick={clearHistory}>🗑 CLEAR HISTORY</button>
        </>
      )}

      {/* SESSIONS TAB */}
      {tab === "sessions" && (
        <>
          {Object.keys(sessionStats).length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
              Session stats appear after trades close.
            </div>
          ) : (
            Object.entries(sessionStats)
              .sort((a, b) => b[1].trades - a[1].trades)
              .map(([session, stat]) => (
                <motion.div key={session} style={{
                  ...s.card,
                  borderLeft: `3px solid ${SESSION_COLORS[session] || "#3a6080"}`
                }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: SESSION_COLORS[session] || "#fff" }}>
                      {session.charAt(0).toUpperCase() + session.slice(1)} Session
                    </div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: stat.winRate >= 54 ? "#00ff9d" : "#ff3366" }}>
                      {stat.winRate}%
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                    {[
                      { l: "TRADES", v: stat.trades, c: "#c8e8ff" },
                      { l: "WINS", v: stat.wins, c: "#00ff9d" },
                      { l: "LOSSES", v: stat.losses, c: "#ff3366" },
                      { l: "P&L", v: (stat.pnl >= 0 ? "+" : "") + "$" + stat.pnl, c: stat.pnl >= 0 ? "#00ff9d" : "#ff3366" },
                    ].map(({ l, v, c }) => (
                      <div key={l} style={{ background: "#0a1e30", borderRadius: 8, padding: "7px 6px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, color: "#3a6080", marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Performance bar */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 4, background: "#0a2540", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: stat.winRate + "%", background: `linear-gradient(90deg,${SESSION_COLORS[session] || "#00d4ff"}55,${SESSION_COLORS[session] || "#00d4ff"})`, borderRadius: 2, transition: "width 0.8s" }} />
                    </div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 4 }}>
                      {stat.winRate >= 60 ? "✅ Strong session for TIMI" : stat.winRate >= 54 ? "⚠️ Profitable but watch closely" : "❌ Underperforming — consider avoiding"}
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </>
      )}
    </div>
  );
}
