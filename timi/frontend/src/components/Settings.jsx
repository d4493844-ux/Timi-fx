import { Preferences } from "@capacitor/preferences";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useRisk from "../hooks/useRisk";

const ALL_SYMBOLS = [
  { id:"R_75",      label:"VIX 75",     group:"Synthetic" },
  { id:"R_25",      label:"VIX 25",     group:"Synthetic" },
  { id:"R_50",      label:"VIX 50",     group:"Synthetic" },
  { id:"R_100",     label:"VIX 100",    group:"Synthetic" },
  { id:"BOOM1000",  label:"BOOM 1000",  group:"Synthetic" },
  { id:"BOOM500",   label:"BOOM 500",   group:"Synthetic" },
  { id:"CRASH1000", label:"CRASH 1000", group:"Synthetic" },
  { id:"CRASH500",  label:"CRASH 500",  group:"Synthetic" },
  { id:"frxEURUSD", label:"EUR/USD",    group:"Forex" },
  { id:"frxGBPUSD", label:"GBP/USD",    group:"Forex" },
  { id:"cryBTCUSD", label:"BTC/USD",    group:"Crypto" },
];

const c = {
  page:  { padding: "20px 20px 110px", background: "#020810", minHeight: "100vh" },
  title: { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  sub:   { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 20 },
  card:  { background: "#071525", border: "1px solid #0a2540", borderRadius: 14, padding: 16, marginBottom: 12 },
  ct:    { fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff", letterSpacing: 3, marginBottom: 14 },
  row:   { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0a2540" },
  lbl:   { fontFamily: "'Rajdhani',sans-serif", fontSize: 14, color: "#c8e8ff", fontWeight: 600 },
  meta:  { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 2 },
  val:   { fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: "#00d4ff", minWidth: 52, textAlign: "right" },
  slider: { width: "100%", accentColor: "#00d4ff", marginTop: 6, marginBottom: 2, cursor: "pointer" },
  inp:   { background: "#0a2540", border: "1px solid #1a3550", borderRadius: 8, padding: "8px 12px", color: "#fff", fontFamily: "'Share Tech Mono',monospace", fontSize: 12, width: "100%", outline: "none", marginTop: 6, boxSizing: "border-box" },
  btn:   { padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1 },
  btnP:  { background: "linear-gradient(90deg,#00d4ff,#00ff9d)", color: "#020810" },
  btnD:  { background: "rgba(255,51,102,0.15)", border: "1px solid rgba(255,51,102,0.3)", color: "#ff3366" },
  toggle: (on) => ({
    width: 46, height: 26, borderRadius: 13, border: "none", cursor: "pointer", position: "relative",
    background: on ? "linear-gradient(90deg,#00d4ff,#00ff9d)" : "#0a2540", transition: "background 0.3s", flexShrink: 0,
  }),
  knob: (on) => ({
    position: "absolute", top: 4, left: on ? 24 : 4,
    width: 18, height: 18, borderRadius: "50%",
    background: "#fff", transition: "left 0.25s",
  }),
  symBtn: (on) => ({
    padding: "10px 8px", borderRadius: 10, cursor: "pointer", textAlign: "left",
    background: on ? "rgba(0,212,255,0.08)" : "none",
    border: `1px solid ${on ? "#00d4ff" : "#0a2540"}`,
  }),
  accCard: { background: "#0a1e30", border: "1px solid #0a2540", borderRadius: 10, padding: 12, marginBottom: 8 },
};

export default function Settings({
  autoTrade, setAutoTrade,
  activeSymbols = [], updateSymbols,
  accounts = [], addAccount, removeAccount, toggleAccount, updateToken,
  takeProfitTarget, setTakeProfitTarget,
  dailyPnl = 0,
  closeAllTrades,
  martingaleMode, setMartingaleMode,
}) {
  // Risk managed locally with hook — works on both web + APK
  const { riskParams, updateRisk } = useRisk();

  const [tpInput,       setTpInput]       = useState(takeProfitTarget || "");
  const [newAccName,    setNewAccName]     = useState("");
  const [newAccToken,   setNewAccToken]    = useState("");
  const [editTokenId,   setEditTokenId]    = useState(null);
  const [editTokenVal,  setEditTokenVal]   = useState("");
  const [savedFlash,    setSavedFlash]     = useState("");

  // Flash "Saved!" when risk params change
  useEffect(() => {
    setSavedFlash("✅ Saved!");
    const t = setTimeout(() => setSavedFlash(""), 1500);
    return () => clearTimeout(t);
  }, [riskParams]);

  const handleAddAccount = () => {
    if (!newAccName || !newAccToken) return;
    addAccount?.(newAccName.trim(), newAccToken.trim());
    setNewAccName(""); setNewAccToken("");
  };

  const RISK_PARAMS = [
    { key: "riskPct",       label: "Risk Per Trade",    min: 0.5, max: 10,  step: 0.5, suffix: "%",   desc: "% of balance per trade" },
    { key: "maxTrades",     label: "Max Open Trades",   min: 1,   max: 10,  step: 1,   suffix: "",    desc: "Max simultaneous positions" },
    { key: "minConfidence", label: "Min Signal Conf.",  min: 30,  max: 90,  step: 5,   suffix: "%",   desc: "Min confidence to enter" },
    { key: "duration",      label: "Trade Duration",    min: 1,   max: 60,  step: 1,   suffix: " min", desc: "How long each trade runs" },
  ];

  const groups = ["Synthetic", "Forex", "Crypto"];

  return (
    <div style={c.page}>
      <div style={c.title}>Settings</div>
      <div style={c.sub}>// TIMI CONTROL CENTER</div>

      {/* ── AUTO TRADING ── */}
      <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
        <div style={c.ct}>TRADING CONTROLS</div>

        <div style={{ ...c.row }}>
          <div><div style={c.lbl}>Auto Trading</div><div style={c.meta}>TIMI trades automatically</div></div>
          <button style={c.toggle(autoTrade)} onClick={() => setAutoTrade?.(p => !p)}>
            <div style={c.knob(autoTrade)} />
          </button>
        </div>

        <div style={{ ...c.row, borderBottom: "none" }}>
          <div><div style={c.lbl}>Emergency Stop</div><div style={c.meta}>Close all open trades now</div></div>
          <button style={{ ...c.btn, ...c.btnD }} onClick={closeAllTrades}>🛑 STOP ALL</button>
        </div>
      </motion.div>

      {/* ── RISK PARAMETERS — FULLY EDITABLE ── */}
      <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.05 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={c.ct}>RISK PARAMETERS</div>
          {savedFlash && <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#00ff9d" }}>{savedFlash}</div>}
        </div>

        {RISK_PARAMS.map((param, i) => (
          <div key={param.key} style={{ marginBottom: 18, paddingBottom: i < RISK_PARAMS.length - 1 ? 14 : 0, borderBottom: i < RISK_PARAMS.length - 1 ? "1px solid #0a2540" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={c.lbl}>{param.label}</div>
                <div style={c.meta}>{param.desc}</div>
              </div>
              <div style={c.val}>
                {riskParams[param.key]}{param.suffix}
              </div>
            </div>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={riskParams[param.key]}
              onChange={e => updateRisk(param.key, e.target.value)}
              style={c.slider}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080" }}>{param.min}{param.suffix}</span>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080" }}>{param.max}{param.suffix}</span>
            </div>
          </div>
        ))}

        {/* Stake preview */}
        <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginBottom: 6, letterSpacing: 2 }}>STAKE PREVIEW</div>
          {[50, 100, 500, 1000, 5000].map(bal => (
            <div key={bal} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080" }}>${bal} balance</span>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#00ff9d", fontWeight: 700 }}>
                ${Math.max(1, (bal * riskParams.riskPct / 100)).toFixed(2)} stake
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── TAKE PROFIT ── */}
      <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }}>
        <div style={c.ct}>DAILY TAKE PROFIT</div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", marginBottom: 10 }}>
          Today's P&L: <span style={{ color: dailyPnl >= 0 ? "#00ff9d" : "#ff3366" }}>{dailyPnl >= 0 ? "+" : ""}${(dailyPnl || 0).toFixed(2)}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ ...c.inp, marginTop: 0, flex: 1 }} type="number" placeholder="Target e.g. 50"
            value={tpInput} onChange={e => setTpInput(e.target.value)} />
          <button style={{ ...c.btn, ...c.btnP, whiteSpace: "nowrap" }}
            onClick={() => setTakeProfitTarget?.(parseFloat(tpInput) || 0)}>SET</button>
        </div>
        {takeProfitTarget > 0 && (
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#00d4ff", marginTop: 8 }}>
            Target: ${takeProfitTarget} — {dailyPnl >= takeProfitTarget ? "✅ REACHED!" : `${Math.round((dailyPnl / takeProfitTarget) * 100)}% there`}
          </div>
        )}
      </motion.div>

      {/* ── STAKE STRATEGY ── */}
      {setMartingaleMode && (
        <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.12 }}>
          <div style={c.ct}>STAKE STRATEGY</div>
          {[
            { id: "fixed",      label: "Fixed",        desc: "Same stake every trade" },
            { id: "anti",       label: "Anti-Martingale", desc: "Increase after wins, reduce after losses" },
            { id: "martingale", label: "Martingale",   desc: "Double after loss to recover (risky)" },
          ].map(m => (
            <div key={m.id} onClick={() => setMartingaleMode(m.id)}
              style={{ ...c.row, cursor: "pointer", borderColor: martingaleMode === m.id ? "rgba(0,212,255,0.3)" : "#0a2540" }}>
              <div>
                <div style={{ ...c.lbl, color: martingaleMode === m.id ? "#00d4ff" : "#c8e8ff" }}>{m.label}</div>
                <div style={c.meta}>{m.desc}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${martingaleMode === m.id ? "#00d4ff" : "#1a3550"}`, background: martingaleMode === m.id ? "#00d4ff" : "none", flexShrink: 0 }} />
            </div>
          ))}
        </motion.div>
      )}

      {/* ── MARKETS ── */}
      <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.15 }}>
        <div style={c.ct}>MARKETS TO TRADE</div>
        {groups.map(group => (
          <div key={group}>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", letterSpacing: 3, margin: "12px 0 8px" }}>{group.toUpperCase()}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {ALL_SYMBOLS.filter(s => s.group === group).map(sym => {
                const on = activeSymbols.includes(sym.id);
                return (
                  <button key={sym.id} style={c.symBtn(on)}
                    onClick={() => {
                      const u = on ? activeSymbols.filter(s => s !== sym.id) : [...activeSymbols, sym.id];
                      if (u.length > 0) updateSymbols?.(u);
                    }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: on ? "#00d4ff" : "#c8e8ff" }}>{sym.label}</div>
                    <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: on ? "#00ff9d" : "#3a6080", marginTop: 2 }}>
                      {on ? "● ON" : "○ OFF"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── ACCOUNTS ── */}
      <motion.div style={c.card} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }}>
        <div style={c.ct}>TRADING ACCOUNTS</div>
        {accounts.map(acc => (
          <div key={acc.id} style={c.accCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: acc.active ? "#00d4ff" : "#3a6080" }}>{acc.name}</div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#00ff9d", marginTop: 2 }}>{acc.currency} {acc.balance}</div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button style={c.toggle(acc.active)} onClick={() => toggleAccount?.(acc.id)}>
                  <div style={c.knob(acc.active)} />
                </button>
                {acc.id !== "primary" && (
                  <button style={{ ...c.btn, ...c.btnD, padding: "4px 8px", fontSize: 9 }} onClick={() => removeAccount?.(acc.id)}>✕</button>
                )}
              </div>
            </div>
            {editTokenId === acc.id ? (
              <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                <input style={{ ...c.inp, marginTop: 0, flex: 1 }} placeholder="New token"
                  value={editTokenVal} onChange={e => setEditTokenVal(e.target.value)} />
                <button style={{ ...c.btn, ...c.btnP, padding: "6px 10px" }}
                  onClick={() => { updateToken?.(acc.id, editTokenVal); setEditTokenId(null); }}>✓</button>
              </div>
            ) : (
              <button style={{ ...c.btn, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", marginTop: 8, fontSize: 9 }}
                onClick={() => { setEditTokenId(acc.id); setEditTokenVal(acc.token); }}>
                ✏️ Edit Token
              </button>
            )}
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", letterSpacing: 2, marginBottom: 8 }}>ADD ACCOUNT</div>
          <input style={c.inp} placeholder="Account name" value={newAccName} onChange={e => setNewAccName(e.target.value)} />
          <input style={{ ...c.inp, marginTop: 8 }} placeholder="Deriv API token" type="password"
            value={newAccToken} onChange={e => setNewAccToken(e.target.value)} />
          <button style={{ ...c.btn, ...c.btnP, width: "100%", marginTop: 10 }} onClick={handleAddAccount}>+ ADD ACCOUNT</button>
        </div>
      </motion.div>

      {/* ── NOTIFICATION WARNING ── */}
      <div style={{ background: "rgba(255,204,0,0.07)", border: "1px solid rgba(255,204,0,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 9, color: "#ffcc00", letterSpacing: 2, marginBottom: 6 }}>⚠️ IMPORTANT — HOW TIMI WORKS</div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#ffcc00", lineHeight: 1.7 }}>
          TIMI trades ONLY while this app is open and active. If you close the app, trading stops. Keep the app open and screen on for continuous trading.
        </div>
        <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", marginTop: 8, lineHeight: 1.6 }}>
          Background trading (even when app is closed) requires a server upgrade. Ask TIMI to enable Supabase Edge Functions for 24/7 trading.
        </div>
      </div>
    </div>
  );
}
