import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const s = {
  page: { padding: "20px 20px 100px" },
  title: { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  sub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 16 },
  card: { background: "#071525", border: "1px solid #0a2540", borderRadius: 14, padding: 16, marginBottom: 12 },
  ct: { fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff", letterSpacing: 3, marginBottom: 14 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #071525" },
  lbl: { fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#c8e8ff" },
  bar: { height: 6, borderRadius: 3, background: "#0a2540", overflow: "hidden", flex: 1, margin: "0 12px" },
  logItem: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", padding: "5px 0", borderBottom: "1px solid #071525" },
};

const INDICATOR_LABELS = {
  ema_stack: "EMA Trend Stack",
  ema_crossover: "EMA Crossover",
  rsi: "RSI Oversold/Overbought",
  macd: "MACD Histogram",
  bollinger: "Bollinger Bands",
  stochastic: "Stochastic",
  candlestick_patterns: "Candlestick Patterns",
  support_resistance: "Support & Resistance",
  multi_timeframe: "Multi-Timeframe (5M)",
  session_boost: "Session Overlap Boost",
  volatility_filter: "Volatility Filter",
};

export default function AIBrain({ weights = {}, sessionStats = {}, symbolStats = {}, learningLog = [], aiReady }) {
  const [tab, setTab] = useState("weights");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setHistory(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const tabs = ["weights", "sessions", "symbols", "log", "history"];

  return (
    <div style={s.page}>
      <div style={s.title}>AI Brain</div>
      <div style={s.sub}>// SELF-LEARNING ENGINE · SUPABASE POWERED</div>

      {/* Status pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#071525", borderRadius: 10, padding: "10px 14px", border: `1px solid ${aiReady ? "rgba(0,255,157,0.3)" : "rgba(255,204,0,0.3)"}` }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: aiReady ? "#00ff9d" : "#ffcc00", boxShadow: `0 0 8px ${aiReady ? "#00ff9d" : "#ffcc00"}` }} />
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: aiReady ? "#00ff9d" : "#ffcc00" }}>
          {aiReady ? "AI Brain active — learning from every trade" : "Connecting to Supabase..."}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: "0 0 auto", padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "'Orbitron',monospace", fontSize: 9, letterSpacing: 1,
            background: tab === t ? "linear-gradient(90deg,#00d4ff,#0080ff)" : "#071525",
            color: tab === t ? "#020810" : "#3a6080",
          }}>{t.toUpperCase()}</button>
        ))}
      </div>

      {/* WEIGHTS TAB */}
      {tab === "weights" && (
        <div style={s.card}>
          <div style={s.ct}>INDICATOR WEIGHTS — LIVE AI LEARNING</div>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginBottom: 12 }}>
            Weights auto-adjust after every trade. 1.0 = default, 2.0 = max trust, 0.2 = nearly ignored.
          </div>
          {Object.entries(INDICATOR_LABELS).map(([key, label]) => {
            const w = weights[key] || 1.0;
            const color = w >= 1.3 ? "#00ff9d" : w >= 0.9 ? "#00d4ff" : w >= 0.6 ? "#ffcc00" : "#ff3366";
            const pct = ((w - 0.2) / 1.8 * 100).toFixed(0);
            return (
              <motion.div key={key} style={s.row} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ ...s.lbl, minWidth: 140, fontSize: 10 }}>{label}</div>
                <div style={s.bar}>
                  <motion.div style={{ height: "100%", background: `linear-gradient(90deg,${color}44,${color})`, borderRadius: 3 }}
                    initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ duration: 0.8 }} />
                </div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color, fontWeight: 700, minWidth: 40, textAlign: "right" }}>
                  {w.toFixed(2)}x
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SESSIONS TAB */}
      {tab === "sessions" && (
        <div style={s.card}>
          <div style={s.ct}>SESSION PERFORMANCE — AI LEARNED</div>
          {Object.keys(sessionStats).length === 0 ? (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 20 }}>
              No session data yet. Trades will populate this.
            </div>
          ) : (
            Object.entries(sessionStats).map(([sess, stat]) => {
              const total = (stat.win_count || 0) + (stat.loss_count || 0);
              const wr = total > 0 ? Math.round(stat.win_count / total * 100) : 0;
              const color = !stat.is_active ? "#ff3366" : wr >= 60 ? "#00ff9d" : wr >= 50 ? "#00d4ff" : "#ffcc00";
              return (
                <div key={sess} style={{ ...s.row, flexDirection: "column", alignItems: "stretch", paddingBottom: 12, marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color, fontWeight: 700 }}>
                        {sess.toUpperCase()} {!stat.is_active ? "🚫 BLOCKED" : ""}
                      </div>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 2 }}>
                        {total} trades · ${(stat.total_pnl || 0).toFixed(2)} P&L
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color }}>{wr}%</div>
                  </div>
                  <div style={{ height: 4, background: "#0a2540", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: wr + "%", background: color, borderRadius: 2, transition: "width 0.8s" }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SYMBOLS TAB */}
      {tab === "symbols" && (
        <div style={s.card}>
          <div style={s.ct}>SYMBOL PERFORMANCE — AI LEARNED</div>
          {Object.keys(symbolStats).length === 0 ? (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 20 }}>
              No symbol data yet. Trades will populate this.
            </div>
          ) : (
            Object.entries(symbolStats)
              .sort((a, b) => (b[1].win_count + b[1].loss_count) - (a[1].win_count + a[1].loss_count))
              .map(([symbol, stat]) => {
                const total = (stat.win_count || 0) + (stat.loss_count || 0);
                const wr = total > 0 ? Math.round(stat.win_count / total * 100) : 0;
                const color = !stat.is_active ? "#ff3366" : wr >= 60 ? "#00ff9d" : wr >= 50 ? "#00d4ff" : "#ffcc00";
                return (
                  <div key={symbol} style={s.row}>
                    <div>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color }}>
                        {symbol} {!stat.is_active ? "🚫" : ""}
                      </div>
                      <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 2 }}>
                        {total} trades · P&L ${(stat.total_pnl || 0).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color }}>{wr}%</div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* LEARNING LOG TAB */}
      {tab === "log" && (
        <div style={s.card}>
          <div style={s.ct}>LIVE LEARNING LOG</div>
          {learningLog.length === 0 ? (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 20 }}>
              Learning log appears after trades close. TIMI updates weights in real time.
            </div>
          ) : (
            learningLog.map((entry, i) => (
              <div key={i} style={s.logItem}>
                <span style={{ color: "#3a6080" }}>{entry.time} </span>{entry.msg}
              </div>
            ))
          )}
        </div>
      )}

      {/* HISTORY TAB — Full Supabase trade log */}
      {tab === "history" && (
        <div style={s.card}>
          <div style={s.ct}>FULL TRADE HISTORY — SUPABASE</div>
          {loading && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#00d4ff", textAlign: "center", padding: 20 }}>Loading from Supabase...</div>}
          {!loading && history.length === 0 && (
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", textAlign: "center", padding: 20 }}>
              No trades in database yet.
            </div>
          )}
          {history.map((t, i) => (
            <div key={t.id} style={{ ...s.row, padding: "10px 0" }}>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: t.type === "BUY" ? "#00ff9d" : "#ff3366" }}>{t.type}</span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#c8e8ff" }}>{t.symbol}</span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080" }}>{t.confidence}% conf</span>
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 3 }}>
                  {new Date(t.created_at).toLocaleString()} · {t.session}
                </div>
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: t.result === "WIN" ? "#00ff9d" : "#ff3366" }}>
                {t.pnl >= 0 ? "+" : ""}${parseFloat(t.pnl || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
