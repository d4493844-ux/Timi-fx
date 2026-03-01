import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const INDICATOR_LABELS = {
  ema_stack: "EMA Trend Stack", ema_crossover: "EMA Crossover",
  rsi: "RSI Signal", macd: "MACD", bollinger: "Bollinger Bands",
  stochastic: "Stochastic", candlestick_patterns: "Candlestick Patterns",
  support_resistance: "Support & Resistance", multi_timeframe: "5M Timeframe",
  session_boost: "Session Overlap", volatility_filter: "Volatility Filter",
};

const REGIME_COLORS = {
  TRENDING_UP: "#00ff9d", TRENDING_DOWN: "#ff3366",
  RANGING: "#00d4ff", VOLATILE: "#ff9900", QUIET: "#3a6080", UNKNOWN: "#3a6080",
};

const s = {
  page: { padding: "20px 20px 100px" },
  title: { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  sub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 16 },
  card: { background: "#071525", border: "1px solid #0a2540", borderRadius: 14, padding: 16, marginBottom: 12 },
  ct: { fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff", letterSpacing: 3, marginBottom: 12 },
  tab: a => ({ flex: "0 0 auto", padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 9, letterSpacing: 1, background: a ? "linear-gradient(90deg,#00d4ff,#0080ff)" : "#071525", color: a ? "#020810" : "#3a6080" }),
};

export default function AIBrain({ weights = {}, sessionStats = {}, symbolStats = {}, regimes = {}, learningLog = [], aiReady }) {
  const [tab, setTab] = useState("weights");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (tab === "history") {
      setLoadingHistory(true);
      supabase.from("trades").select("*").order("created_at", { ascending: false }).limit(100)
        .then(({ data }) => { setHistory(data || []); setLoadingHistory(false); });
    }
  }, [tab]);

  return (
    <div style={s.page}>
      <div style={s.title}>AI Brain</div>
      <div style={s.sub}>// SELF-LEARNING · MARKET REGIME · SUPABASE</div>

      {/* Status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, background: "#071525", borderRadius: 10, padding: "10px 14px", border: `1px solid ${aiReady ? "rgba(0,255,157,0.3)" : "rgba(255,204,0,0.3)"}` }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: aiReady ? "#00ff9d" : "#ffcc00", boxShadow: `0 0 8px ${aiReady ? "#00ff9d" : "#ffcc00"}` }} />
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: aiReady ? "#00ff9d" : "#ffcc00" }}>
          {aiReady ? "AI active — learning from every trade via Supabase" : "Connecting to Supabase..."}
        </div>
      </div>

      {/* Regime Pills */}
      {Object.keys(regimes).length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.entries(regimes).map(([sym, r]) => (
            <div key={sym} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${REGIME_COLORS[r.regime]}44`, borderRadius: 8, padding: "5px 10px" }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#3a6080" }}>{sym}</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: REGIME_COLORS[r.regime] }}>{r.regime}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {["weights", "sessions", "symbols", "log", "history"].map(t => (
          <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </div>

      {/* WEIGHTS */}
      {tab === "weights" && (
        <div style={s.card}>
          <div style={s.ct}>INDICATOR WEIGHTS — SELF-ADJUSTING</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginBottom: 12 }}>
            Rises when indicator predicts correctly. Falls when it's wrong. Range: 0.2x – 2.0x
          </div>
          {Object.entries(INDICATOR_LABELS).map(([key, label]) => {
            const w = weights[key] ?? 1.0;
            const color = w >= 1.4 ? "#00ff9d" : w >= 1.0 ? "#00d4ff" : w >= 0.7 ? "#ffcc00" : "#ff3366";
            const pct = Math.round((w - 0.2) / 1.8 * 100);
            return (
              <motion.div key={key} style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #071525" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#c8e8ff", minWidth: 160 }}>{label}</div>
                <div style={{ flex: 1, height: 5, background: "#0a2540", borderRadius: 3, overflow: "hidden", margin: "0 10px" }}>
                  <motion.div style={{ height: "100%", background: `linear-gradient(90deg,${color}55,${color})`, borderRadius: 3 }}
                    initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 0.8 }} />
                </div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color, fontWeight: 700, minWidth: 44, textAlign: "right" }}>
                  {w.toFixed(2)}x
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SESSIONS */}
      {tab === "sessions" && (
        <div style={s.card}>
          <div style={s.ct}>SESSION PERFORMANCE</div>
          {Object.keys(sessionStats).length === 0
            ? <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 24 }}>Waiting for trades...</div>
            : Object.entries(sessionStats).map(([sess, stat]) => {
                const total = (stat.win_count || 0) + (stat.loss_count || 0);
                const wr = total > 0 ? Math.round(stat.win_count / total * 100) : 0;
                const color = stat.is_blocked ? "#ff3366" : wr >= 60 ? "#00ff9d" : wr >= 50 ? "#00d4ff" : "#ffcc00";
                return (
                  <div key={sess} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color, fontWeight: 700 }}>
                          {sess.toUpperCase()} {stat.is_blocked ? "🚫 BLOCKED" : ""}
                        </div>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 2 }}>
                          {total} trades · P&L ${(stat.total_pnl || 0).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color }}>{wr}%</div>
                    </div>
                    <div style={{ height: 5, background: "#0a2540", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: wr + "%", background: color, transition: "width 0.8s" }} />
                    </div>
                  </div>
                );
              })
          }
        </div>
      )}

      {/* SYMBOLS */}
      {tab === "symbols" && (
        <div style={s.card}>
          <div style={s.ct}>SYMBOL PERFORMANCE</div>
          {Object.keys(symbolStats).length === 0
            ? <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 24 }}>Waiting for trades...</div>
            : Object.entries(symbolStats)
                .sort((a, b) => (b[1].win_count + b[1].loss_count) - (a[1].win_count + a[1].loss_count))
                .map(([sym, stat]) => {
                  const total = (stat.win_count || 0) + (stat.loss_count || 0);
                  const wr = total > 0 ? Math.round(stat.win_count / total * 100) : 0;
                  const color = stat.is_blocked ? "#ff3366" : wr >= 60 ? "#00ff9d" : wr >= 50 ? "#00d4ff" : "#ffcc00";
                  return (
                    <div key={sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #071525" }}>
                      <div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color }}>{sym} {stat.is_blocked ? "🚫" : ""}</div>
                        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 2 }}>
                          {stat.win_count}W / {stat.loss_count}L · ${(stat.total_pnl || 0).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color }}>{wr}%</div>
                    </div>
                  );
                })
          }
        </div>
      )}

      {/* LOG */}
      {tab === "log" && (
        <div style={s.card}>
          <div style={s.ct}>LIVE LEARNING LOG</div>
          {learningLog.length === 0
            ? <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 24 }}>
                Learning log appears after trades close. TIMI adjusts weights in real time.
              </div>
            : learningLog.map((e, i) => (
                <div key={i} style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, padding: "5px 0", borderBottom: "1px solid #071525", color: e.msg.includes("🚫") ? "#ff3366" : e.msg.includes("⭐") ? "#00ff9d" : "#c8e8ff" }}>
                  <span style={{ color: "#3a6080" }}>{e.time} </span>{e.msg}
                </div>
              ))
          }
        </div>
      )}

      {/* HISTORY */}
      {tab === "history" && (
        <div style={s.card}>
          <div style={s.ct}>FULL TRADE HISTORY — SUPABASE</div>
          {loadingHistory && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#00d4ff", textAlign: "center", padding: 20 }}>Loading from Supabase...</div>}
          {!loadingHistory && history.length === 0 && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 20 }}>No trades yet in database.</div>}
          {history.map(t => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #071525" }}>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: t.type === "BUY" ? "#00ff9d" : "#ff3366" }}>{t.type}</span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#c8e8ff" }}>{t.symbol}</span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080" }}>{t.confidence}%</span>
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 3 }}>
                  {new Date(t.created_at).toLocaleString()} · {t.session}
                </div>
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: t.result === "WIN" ? "#00ff9d" : "#ff3366" }}>
                {parseFloat(t.pnl || 0) >= 0 ? "+" : ""}${parseFloat(t.pnl || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
