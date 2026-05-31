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

// ── Signal Longevity Engine (same math as backend) ──────────────
function getSignalHealth(closes = [], action = "BUY") {
  if (!closes || closes.length < 10) return null;

  const returns = closes.slice(1).map((c, i) => c - closes[i]);
  const n    = returns.length;
  const mean = returns.reduce((a, b) => a + b, 0) / n;
  const dm   = returns.map(r => r - mean);
  let num = 0, den = 0;
  for (let i = 1; i < dm.length; i++) { num += dm[i]*dm[i-1]; den += dm[i]*dm[i]; }
  const phi    = den === 0 ? 0 : Math.max(-0.99, Math.min(0.99, num/den));
  const hl     = (phi <= 0 || phi >= 1) ? 1 : Math.abs(Math.log(0.5) / Math.log(Math.abs(phi)));
  const netMov = Math.abs(closes[closes.length-1] - closes[0]);
  const atr    = returns.reduce((s, r) => s + Math.abs(r), 0) / returns.length;
  const snr    = atr > 0 ? netMov / (atr * Math.sqrt(closes.length)) : 0;

  // Noise check
  const recent   = closes.slice(-5);
  const baseline = closes.slice(-10, -5);
  const bm = baseline.reduce((a,b)=>a+b,0)/baseline.length;
  const bs = Math.sqrt(baseline.reduce((s,v)=>s+Math.pow(v-bm,2),0)/baseline.length);
  const rm = recent.reduce((a,b)=>a+b,0)/recent.length;
  const z  = bs > 0 ? Math.abs(rm-bm)/bs : 0;
  const against = action==="BUY" ? recent[recent.length-1]<recent[0] : recent[recent.length-1]>recent[0];
  const isNoise = against && z < 1.5;

  let status, color, icon, advice;
  if (snr > 0.5 && phi > -0.3) {
    status = "STRONG";  color = "#00ff9d"; icon = "🟢";
    advice = "Signal is healthy — safe to hold or enter";
  } else if (snr > 0.2 || (Math.min(hl,20) > 2 && phi > 0.0)) {
    status = "FADING";  color = "#ffcc00"; icon = "🟡";
    advice = isNoise ? "Small dip — likely noise, signal still alive" : "Momentum weakening — watch closely";
  } else {
    status = "DEAD";    color = "#ff3366"; icon = "🔴";
    advice = isNoise ? "Noise spike — signal may recover" : "Signal exhausted — high risk, avoid entry";
  }

  return {
    status, color, icon, advice,
    hl: Math.min(hl, 20).toFixed(1),
    snr: snr.toFixed(2),
    phi: phi.toFixed(3),
    isNoise,
    pct: Math.min(snr / 1.0, 1) * 100
  };
}

// ── Signal Age Clock ─────────────────────────────────────────────
function LiveClock({ createdAt }) {
  const [age, setAge] = useState(0);
  useEffect(() => {
    const update = () => createdAt && setAge(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [createdAt]);
  const m = Math.floor(age/60), s = age%60;
  const color = age < 60 ? "#00ff9d" : age > 180 ? "#ff3366" : "#ffcc00";
  const label = age < 60 ? "FRESH" : age > 180 ? "STALE" : "AGING";
  return (
    <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color}}>
      {label} · {m>0?`${m}m `:""}{s}s
    </span>
  );
}

// ── Longevity Meter Card ─────────────────────────────────────────
function LongevityCard({ closes, action }) {
  const h = getSignalHealth(closes, action);
  if (!h) return null;

  return (
    <div style={{marginTop:10, borderRadius:10, overflow:"hidden", border:`1px solid ${h.color}33`}}>
      {/* Top bar — status */}
      <div style={{background:`${h.color}15`, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <span style={{fontSize:14}}>{h.icon}</span>
          <div>
            <div style={{fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:h.color}}>
              SIGNAL {h.status}
            </div>
            <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:1}}>
              {h.advice}
            </div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Orbitron',monospace", fontSize:16, fontWeight:900, color:h.color}}>
            {h.hl}
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080"}}>candles left</div>
        </div>
      </div>

      {/* Strength bar */}
      <div style={{padding:"8px 12px", background:"rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080"}}>SIGNAL STRENGTH</span>
          <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:h.color}}>{Math.round(h.pct)}%</span>
        </div>
        <div style={{height:6, background:"#0a2540", borderRadius:3, overflow:"hidden"}}>
          <motion.div
            initial={{width:0}}
            animate={{width:h.pct+"%"}}
            transition={{duration:1, ease:"easeOut"}}
            style={{height:"100%", borderRadius:3, background:`linear-gradient(90deg,${h.color}55,${h.color})`}}
          />
        </div>

        {/* Stats row */}
        <div style={{display:"flex", gap:12, marginTop:6, flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080"}}>
            SNR <span style={{color:h.color}}>{h.snr}</span>
          </span>
          <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080"}}>
            φ <span style={{color:"#c8e8ff"}}>{h.phi}</span>
          </span>
          {h.isNoise && (
            <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#ffcc00"}}>
              ⚡ NOISE — dip is temporary
            </span>
          )}
        </div>
      </div>

      {/* How to read guide */}
      <div style={{padding:"6px 12px", background:"rgba(0,0,0,0.15)", borderTop:"1px solid #0a2540"}}>
        <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080", lineHeight:1.6}}>
          {h.status==="STRONG" && "✅ Hold position — momentum intact, signal fresh"}
          {h.status==="FADING" && !h.isNoise && "⚠️ Monitor closely — take profit if in profit"}
          {h.status==="FADING" && h.isNoise && "💡 Small counter-move — likely temporary, stay in"}
          {h.status==="DEAD" && !h.isNoise && "🚫 Signal exhausted — do not enter new trade"}
          {h.status==="DEAD" && h.isNoise && "⚡ Volatility spike — signal may recover soon"}
        </div>
      </div>
    </div>
  );
}

export default function Signals({ signals={}, session={}, candles={} }) {
  const entries = Object.entries(signals).filter(([, sig]) => sig.action !== "HOLD");
  const activeSessions = session.active || [];

  return (
    <div style={{padding:"20px 20px 100px", background:"#020810", minHeight:"100vh"}}>
      <div style={{fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4}}>Signals</div>
      <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16}}>
        // LIVE SIGNAL HEALTH · HALF-LIFE ENGINE
      </div>

      {/* SESSION BAR */}
      <div style={{background:"#071525", border:"1px solid rgba(0,212,255,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"'Orbitron',monospace", fontSize:9, color:"#3a6080", letterSpacing:3, marginBottom:4}}>ACTIVE SESSIONS</div>
          <div style={{display:"flex", gap:6}}>
            {activeSessions.length === 0
              ? <span style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#3a6080"}}>Off-hours</span>
              : activeSessions.map(s => (
                  <span key={s.name} style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:SESSION_COLORS[s.name]||"#fff", background:"rgba(0,212,255,0.08)", padding:"3px 8px", borderRadius:6}}>
                    {s.name.charAt(0).toUpperCase()+s.name.slice(1)}
                  </span>
                ))
            }
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:session.overlap?"#00ff9d":"#00d4ff"}}>
            {session.strength||0}/4
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080"}}>{session.overlap?"OVERLAP":"STRENGTH"}</div>
        </div>
      </div>

      {/* LEGEND */}
      <div style={{background:"#071525", border:"1px solid #0a2540", borderRadius:10, padding:"10px 14px", marginBottom:14}}>
        <div style={{fontFamily:"'Orbitron',monospace", fontSize:9, color:"#3a6080", letterSpacing:2, marginBottom:8}}>HOW TO READ SIGNAL HEALTH</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8}}>
          {[
            {icon:"🟢", label:"STRONG", desc:"Safe to enter or hold"},
            {icon:"🟡", label:"FADING", desc:"Take profit if in profit"},
            {icon:"🔴", label:"DEAD", desc:"Avoid — signal gone"},
          ].map(({icon, label, desc}) => (
            <div key={label} style={{textAlign:"center"}}>
              <div style={{fontSize:16, marginBottom:3}}>{icon}</div>
              <div style={{fontFamily:"'Orbitron',monospace", fontSize:8, color:"#c8e8ff"}}>{label}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"#3a6080", marginTop:2}}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {entries.length === 0 && (
        <div style={{textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, marginTop:60}}>
          <div style={{fontSize:32, marginBottom:12}}>🔍</div>
          Scanning markets...
          <br/>
          <span style={{fontSize:10}}>Signals appear when ML + HMM + longevity align</span>
        </div>
      )}

      <AnimatePresence>
        {entries.map(([sym, sig], i) => {
          const color     = sig.action==="BUY"?"#00ff9d":sig.action==="SELL"?"#ff3366":"#ffcc00";
          const rawCloses = (candles[sym]||[]).map(c => parseFloat(c.close));

          return (
            <motion.div key={sym}
              style={{background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:12}}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-10}} transition={{delay:i*0.08}}>

              {/* Header */}
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, color:"#fff"}}>
                    {NAMES[sym]||sym}
                  </div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:2}}>
                    RSI: {sig.rsi} · Score: {sig.score}
                  </div>
                  {sig.createdAt && (
                    <div style={{marginTop:3}}><LiveClock createdAt={sig.createdAt}/></div>
                  )}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Orbitron',monospace", fontSize:22, fontWeight:900, color}}>{sig.action}</div>
                  <div style={{fontFamily:"'Share Tech Mono',monospace", fontSize:11, color, marginTop:2}}>{sig.confidence}% conf</div>
                </div>
              </div>

              {/* Confidence bar */}
              <div style={{height:4, background:"#0a2540", borderRadius:2, overflow:"hidden", marginBottom:10}}>
                <motion.div style={{height:"100%", borderRadius:2, background:`linear-gradient(90deg,${color}55,${color})`}}
                  initial={{width:0}} animate={{width:sig.confidence+"%"}} transition={{duration:0.8}}/>
              </div>

              {/* Signal Health Card */}
              <LongevityCard closes={rawCloses} action={sig.action} />

              {/* Patterns */}
              {sig.patterns && sig.patterns.length > 0 && (
                <div style={{display:"flex", gap:5, flexWrap:"wrap", marginTop:8}}>
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
              <div style={{display:"flex", gap:5, flexWrap:"wrap", marginTop:6}}>
                {(sig.reasons||[]).slice(0,5).map(r => (
                  <span key={r} style={{fontFamily:"'Share Tech Mono',monospace", fontSize:9, padding:"3px 7px", borderRadius:5, border:"1px solid #0a2540", color:"#3a6080"}}>{r}</span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
