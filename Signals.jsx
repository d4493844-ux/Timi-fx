import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAMES = {
  R_10:"VIX 10", R_25:"VIX 25", R_50:"VIX 50", R_75:"VIX 75", R_100:"VIX 100",
  "1HZ75V":"VIX 75 (1s)", "1HZ100V":"VIX 100 (1s)",
  JD10:"Jump 10", JD25:"Jump 25", JD50:"Jump 50", JD75:"Jump 75", JD100:"Jump 100",
  BOOM1000:"BOOM 1000", BOOM500:"BOOM 500", CRASH1000:"CRASH 1000", CRASH500:"CRASH 500",
  frxEURUSD:"EUR/USD", frxGBPUSD:"GBP/USD", frxUSDJPY:"USD/JPY", frxGBPJPY:"GBP/JPY",
  frxEURJPY:"EUR/JPY", frxAUDUSD:"AUD/USD", frxUSDCAD:"USD/CAD", frxGBPAUD:"GBP/AUD",
  frxEURGBP:"EUR/GBP", frxAUDJPY:"AUD/JPY", frxNZDUSD:"NZD/USD", frxUSDCHF:"USD/CHF",
  cryBTCUSD:"BTC/USD", cryETHUSD:"ETH/USD", frxXAUUSD:"Gold/USD", frxXAGUSD:"Silver/USD",
};

const SESSION_COLORS = { london:"#00d4ff", newYork:"#00ff9d", tokyo:"#ffcc00", sydney:"#ff9966" };

const s = {
  page:    { padding:"20px 20px 100px", background:"#020810", minHeight:"100vh" },
  title:   { fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub:     { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16 },
  card:    { background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:12 },
  sessionCard: { background:"#071525", border:"1px solid rgba(0,212,255,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" },
  row:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 },
  sym:     { fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, color:"#fff" },
  confBar: { height:4, background:"#0a2540", borderRadius:2, overflow:"hidden", marginBottom:10 },
  tags:    { display:"flex", gap:5, flexWrap:"wrap" },
  tag:     { fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 7px", borderRadius:5, border:"1px solid #0a2540", color:"#3a6080" },
  empty:   { textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, marginTop:60 },
};

// ── Signal Longevity Meter Component ─────────────────────────────
function SignalLongevityMeter({ closes = [], action = "BUY" }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!closes || closes.length < 10) return;

    // Calculate half-life from autocorrelation
    const returns = closes.slice(1).map((c, i) => c - closes[i]);
    const n    = returns.length;
    const mean = returns.reduce((a, b) => a + b, 0) / n;
    const dm   = returns.map(r => r - mean);
    let num = 0, den = 0;
    for (let i = 1; i < dm.length; i++) { num += dm[i] * dm[i-1]; den += dm[i] * dm[i]; }
    const phi      = den === 0 ? 0 : Math.max(-0.99, Math.min(0.99, num / den));
    const halfLife = phi <= 0 || phi >= 1 ? 1 : Math.abs(Math.log(0.5) / Math.log(Math.abs(phi)));
    const hl       = Math.min(halfLife, 20);

    // Noise detector
    const recent   = closes.slice(-5);
    const baseline = closes.slice(-10, -5);
    const bMean    = baseline.reduce((a, b) => a + b, 0) / baseline.length;
    const bStd     = Math.sqrt(baseline.reduce((s, v) => s + Math.pow(v - bMean, 2), 0) / baseline.length);
    const rMean    = recent.reduce((a, b) => a + b, 0) / recent.length;
    const zScore   = bStd > 0 ? Math.abs(rMean - bMean) / bStd : 0;
    const priceMov = recent[recent.length-1] - recent[0];
    const against  = action === "BUY" ? priceMov < 0 : priceMov > 0;
    const isNoise  = against && zScore < 1.5;

    let strength, color, icon;
    if (hl > 5 && phi > 0.3)      { strength = "STRONG";  color = "#00ff9d"; icon = "🟢"; }
    else if (hl > 2 && phi > 0.1)  { strength = "FADING";  color = "#ffcc00"; icon = "🟡"; }
    else                            { strength = "DEAD";    color = "#ff3366"; icon = "🔴"; }

    setData({ hl: parseFloat(hl.toFixed(1)), phi: parseFloat(phi.toFixed(3)), strength, color, icon, isNoise, zScore: parseFloat(zScore.toFixed(2)) });
  }, [closes, action]);

  if (!data) return null;

  const pct = Math.min(data.hl / 10, 1) * 100;

  return (
    <div style={{ marginTop:10, padding:"10px 12px", background:"rgba(0,0,0,0.3)", borderRadius:10, border:`1px solid ${data.color}22` }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", letterSpacing:2 }}>
          SIGNAL LONGEVITY
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:12 }}>{data.icon}</span>
          <span style={{ fontFamily:"'Orbitron',monospace", fontSize:10, fontWeight:700, color:data.color }}>
            {data.strength}
          </span>
        </div>
      </div>

      {/* Half-Life Bar */}
      <div style={{ height:6, background:"#0a2540", borderRadius:3, overflow:"hidden", marginBottom:6 }}>
        <motion.div
          initial={{ width:0 }}
          animate={{ width: pct+"%" }}
          transition={{ duration:1, ease:"easeOut" }}
          style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${data.color}55,${data.color})` }}
        />
      </div>

      {/* Stats Row */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080" }}>
          Half-life: <span style={{ color:data.color }}>{data.hl} candles</span>
        </div>
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080" }}>
          φ={data.phi}
        </div>
        {data.isNoise && (
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#ffcc00" }}>
            ⚡ Noise detected — hold
          </div>
        )}
        {data.strength === "DEAD" && !data.isNoise && (
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#ff3366" }}>
            ⚠️ Signal expired — exit risk
          </div>
        )}
        {data.strength === "STRONG" && (
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#00ff9d" }}>
            ✅ Strong momentum — hold
          </div>
        )}
      </div>
    </div>
  );
}

// ── Live Signal Clock ─────────────────────────────────────────────
function SignalAge({ createdAt }) {
  const [age, setAge] = useState(0);
  useEffect(() => {
    const update = () => {
      if (!createdAt) return;
      setAge(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [createdAt]);

  const mins = Math.floor(age / 60);
  const secs = age % 60;
  const fresh = age < 60;
  const stale = age > 180;
  const color = fresh ? "#00ff9d" : stale ? "#ff3366" : "#ffcc00";

  return (
    <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color, marginTop:2 }}>
      {fresh ? "🟢 FRESH" : stale ? "🔴 STALE" : "🟡 AGING"} · {mins > 0 ? `${mins}m ` : ""}{secs}s ago
    </div>
  );
}

export default function Signals({ signals={}, session={}, candles={} }) {
  const entries   = Object.entries(signals).filter(([, sig]) => sig.action !== "HOLD");
  const activeSessions = session.active || [];

  return (
    <div style={s.page}>
      <div style={s.title}>Signals</div>
      <div style={s.sub}>// SIGNAL LONGEVITY · HALF-LIFE ENGINE</div>

      {/* SESSION BAR */}
      <div style={s.sessionCard}>
        <div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#3a6080", letterSpacing:3, marginBottom:4 }}>ACTIVE SESSIONS</div>
          <div style={{ display:"flex", gap:6 }}>
            {activeSessions.length === 0
              ? <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#3a6080" }}>Off-hours</span>
              : activeSessions.map(s => (
                  <span key={s.name} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:SESSION_COLORS[s.name]||"#fff", background:"rgba(0,212,255,0.08)", padding:"3px 8px", borderRadius:6 }}>
                    {s.name.charAt(0).toUpperCase()+s.name.slice(1)}
                  </span>
                ))
            }
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:session.overlap?"#00ff9d":"#00d4ff" }}>
            {session.strength || 0}/4
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080" }}>{session.overlap?"OVERLAP":"STRENGTH"}</div>
        </div>
      </div>

      {entries.length === 0 && (
        <div style={s.empty}>
          <div style={{ fontSize:32, marginBottom:12 }}>🔍</div>
          Scanning markets...
          <br/>
          <span style={{ fontSize:10 }}>Signals appear when ML + HMM + longevity align</span>
        </div>
      )}

      <AnimatePresence>
        {entries.map(([sym, sig], i) => {
          const color    = sig.action==="BUY"?"#00ff9d":sig.action==="SELL"?"#ff3366":"#ffcc00";
          const sigCloses = (candles[sym] || []).map(c => parseFloat(c.close));

          return (
            <motion.div key={sym} style={s.card}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-10 }} transition={{ delay:i*0.08 }}>

              {/* Header Row */}
              <div style={s.row}>
                <div>
                  <div style={s.sym}>{NAMES[sym]||sym}</div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:2 }}>
                    RSI: {sig.rsi} · Score: {sig.score}
                  </div>
                  {sig.createdAt && <SignalAge createdAt={sig.createdAt} />}
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:22, fontWeight:900, color }}>{sig.action}</div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:11, color, marginTop:2 }}>{sig.confidence}%</div>
                </div>
              </div>

              {/* Confidence Bar */}
              <div style={s.confBar}>
                <motion.div style={{ height:"100%", borderRadius:2, background:`linear-gradient(90deg,${color}55,${color})` }}
                  initial={{ width:0 }} animate={{ width:sig.confidence+"%" }} transition={{ duration:0.8 }}/>
              </div>

              {/* ── SIGNAL LONGEVITY METER ── */}
              <SignalLongevityMeter closes={sigCloses} action={sig.action} />

              {/* Patterns */}
              {sig.patterns && sig.patterns.length > 0 && (
                <div style={{ ...s.tags, marginTop:8, marginBottom:4 }}>
                  {sig.patterns.map(p => (
                    <span key={p.name} style={{
                      fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 7px", borderRadius:5,
                      background:p.type==="bullish"?"rgba(0,255,157,0.1)":"rgba(255,51,102,0.1)",
                      border:"1px solid "+(p.type==="bullish"?"rgba(0,255,157,0.3)":"rgba(255,51,102,0.3)"),
                      color:p.type==="bullish"?"#00ff9d":"#ff3366"
                    }}>🕯 {p.name}</span>
                  ))}
                </div>
              )}

              {/* Reasons */}
              <div style={{ ...s.tags, marginTop:6 }}>
                {(sig.reasons||[]).slice(0,5).map(r => (
                  <span key={r} style={s.tag}>{r}</span>
                ))}
              </div>

              {/* S/R Levels */}
              {sig.sr && (sig.sr.resistance?.length > 0 || sig.sr.support?.length > 0) && (
                <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                  {sig.sr.resistance?.slice(0,2).map(r => (
                    <span key={r} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 8px", borderRadius:5, background:"rgba(255,51,102,0.08)", border:"1px solid rgba(255,51,102,0.2)", color:"#ff3366" }}>
                      R: {r.toFixed?.(4)||r}
                    </span>
                  ))}
                  {sig.sr.support?.slice(0,2).map(sv => (
                    <span key={sv} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 8px", borderRadius:5, background:"rgba(0,255,157,0.08)", border:"1px solid rgba(0,255,157,0.2)", color:"#00ff9d" }}>
                      S: {sv.toFixed?.(4)||sv}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
