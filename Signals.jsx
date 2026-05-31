import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

// MT5 name → Deriv WebSocket symbol
const MT5_TO_DERIV = {
  "Volatility 10 Index":    "R_10",
  "Volatility 25 Index":    "R_25",
  "Volatility 50 Index":    "R_50",
  "Volatility 75 Index":    "R_75",
  "Volatility 100 Index":   "R_100",
  "Volatility 10 (1s) Index":"1HZ10V",
  "Volatility 25 (1s) Index":"1HZ25V",
  "Volatility 50 (1s) Index":"1HZ50V",
  "Volatility 75 (1s) Index":"1HZ75V",
  "Volatility 100 (1s) Index":"1HZ100V",
  "Boom 300 Index":         "BOOM300",
  "Boom 500 Index":         "BOOM500",
  "Boom 600 Index":         "BOOM600",
  "Boom 900 Index":         "BOOM900",
  "Boom 1000 Index":        "BOOM1000",
  "Crash 300 Index":        "CRASH300",
  "Crash 500 Index":        "CRASH500",
  "Crash 600 Index":        "CRASH600",
  "Crash 900 Index":        "CRASH900",
  "Crash 1000 Index":       "CRASH1000",
  "Step Index":             "STPX",
  "Jump 10 Index":          "JD10",
  "Jump 25 Index":          "JD25",
  "Jump 50 Index":          "JD50",
  "Jump 75 Index":          "JD75",
  "Jump 100 Index":         "JD100",
  "EURUSD":  "frxEURUSD", "GBPUSD":  "frxGBPUSD",
  "USDJPY":  "frxUSDJPY", "XAUUSD":  "frxXAUUSD",
  "XAGUSD":  "frxXAGUSD", "GBPJPY":  "frxGBPJPY",
  "AUDUSD":  "frxAUDUSD", "EURCAD":  "frxEURCAD",
};

const SESSION_COLORS = { london:"#00d4ff", newYork:"#00ff9d", tokyo:"#ffcc00", sydney:"#ff9966" };

// ── Signal Health Engine ────────────────────────────────────────
function getSignalHealth(closes = [], action = "BUY") {
  if (!closes || closes.length < 10) return null;
  const returns = closes.slice(1).map((c, i) => c - closes[i]);
  const n = returns.length;
  const mean = returns.reduce((a, b) => a + b, 0) / n;
  const dm = returns.map(r => r - mean);
  let num = 0, den = 0;
  for (let i = 1; i < dm.length; i++) { num += dm[i]*dm[i-1]; den += dm[i]*dm[i]; }
  const phi = den === 0 ? 0 : Math.max(-0.99, Math.min(0.99, num/den));
  const hl  = (phi <= 0 || phi >= 1) ? 1 : Math.abs(Math.log(0.5) / Math.log(Math.abs(phi)));
  const net = Math.abs(closes[closes.length-1] - closes[0]);
  const atr = returns.reduce((s, r) => s + Math.abs(r), 0) / returns.length;
  const snr = atr > 0 ? net / (atr * Math.sqrt(closes.length)) : 0;
  // Price direction vs signal
  const recentMove = closes[closes.length-1] - closes[closes.length-4];
  const movingWith = action==="BUY" ? recentMove > 0 : recentMove < 0;
  // Noise check
  const recent = closes.slice(-5), base = closes.slice(-10,-5);
  const bm = base.reduce((a,b)=>a+b,0)/base.length;
  const bs = Math.sqrt(base.reduce((s,v)=>s+Math.pow(v-bm,2),0)/base.length);
  const z  = bs > 0 ? Math.abs(recent.reduce((a,b)=>a+b,0)/recent.length - bm)/bs : 0;
  const against  = action==="BUY" ? recent[recent.length-1]<recent[0] : recent[recent.length-1]>recent[0];
  const isNoise  = against && z < 1.5;

  let status, color, icon, advice, mt5advice;
  if (snr > 0.5 && phi > -0.3) {
    status="STRONG"; color="#00ff9d"; icon="🟢";
    advice    = "Signal healthy — momentum intact";
    mt5advice = "✅ Hold your MT5 position — trend is with you";
  } else if (snr > 0.2 || (Math.min(hl,20) > 2 && phi > 0.0)) {
    status="FADING"; color="#ffcc00"; icon="🟡";
    advice    = isNoise ? "Small counter-move — likely noise" : "Momentum weakening";
    mt5advice = isNoise
      ? "💡 Noise dip — stay in, move SL to entry if nervous"
      : "⚠️ Consider partial close or tighten SL on MT5";
  } else {
    status="DEAD"; color="#ff3366"; icon="🔴";
    advice    = isNoise ? "Volatile spike — may recover" : "Signal exhausted";
    mt5advice = isNoise
      ? "⚡ Spike — wait one more candle before closing"
      : "🚫 Close MT5 trade or move SL to protect profit";
  }

  return {
    status, color, icon, advice, mt5advice,
    hl:       Math.min(hl,20).toFixed(1),
    snr:      snr.toFixed(2),
    phi:      phi.toFixed(3),
    isNoise,  movingWith,
    pct:      Math.min(snr/1.0,1)*100,
    entryToNow: recentMove,
  };
}

// ── Live candle fetcher via Deriv WS ───────────────────────────
function useLiveCandles(derivSymbol) {
  const [data, setData] = useState({ closes:[], currentPrice:null });

  useEffect(() => {
    if (!derivSymbol) return;
    let ws, tickSub;

    const fetchCandles = () => {
      ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
      ws.onopen = () => {
        ws.send(JSON.stringify({
          ticks_history: derivSymbol, adjust_start_time:1,
          count:20, end:"latest", granularity:60, style:"candles"
        }));
        // Also subscribe to live ticks for current price
        ws.send(JSON.stringify({ ticks: derivSymbol, subscribe:1 }));
      };
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.candles) {
          setData(prev => ({ ...prev, closes: d.candles.map(c => parseFloat(c.close)) }));
        }
        if (d.tick) {
          setData(prev => ({ ...prev, currentPrice: parseFloat(d.tick.quote) }));
        }
      };
    };

    fetchCandles();
    const refresh = setInterval(fetchCandles, 60000);
    return () => { clearInterval(refresh); ws?.close(); };
  }, [derivSymbol]);

  return data;
}

// ── Signal Age ──────────────────────────────────────────────────
function SignalAge({ createdAt }) {
  const [age, setAge] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setAge(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [createdAt]);
  const m = Math.floor(age/60), s = age%60, h = Math.floor(m/60);
  const label = h > 0 ? `${h}h ${m%60}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  const color = age < 120 ? "#00ff9d" : age > 1800 ? "#ff3366" : "#ffcc00";
  return <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color }}>{label} ago</span>;
}

// ── MT5 Signal Card ─────────────────────────────────────────────
function MT5SignalCard({ signal }) {
  const derivSym = MT5_TO_DERIV[signal.symbol] || signal.symbol;
  const { closes, currentPrice } = useLiveCandles(derivSym);
  const health = getSignalHealth(closes, signal.action);
  const isOpen = signal.status === "pending" || signal.status === "executed";

  const actionColor = signal.action==="BUY" ? "#00ff9d" : "#ff3366";
  const statusColor = signal.status==="executed" ? "#00ff9d" : signal.status==="pending" ? "#ffcc00" : "#3a6080";

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      style={{
        background:"#071525",
        border:`1px solid ${health ? health.color+"44" : "#0a2540"}`,
        borderRadius:14, padding:16, marginBottom:12
      }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color:"#fff" }}>
            {signal.symbol}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:4, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:700, color:actionColor }}>
              {signal.action}
            </span>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:statusColor, background:statusColor+"22", padding:"2px 6px", borderRadius:4 }}>
              {signal.status.toUpperCase()}
            </span>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080" }}>
              {signal.confidence}% conf
            </span>
            <SignalAge createdAt={signal.created_at} />
          </div>
        </div>
        {currentPrice && (
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color:"#00d4ff" }}>
              {currentPrice.toFixed(currentPrice > 100 ? 2 : 5)}
            </div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080" }}>LIVE PRICE</div>
          </div>
        )}
      </div>

      {/* Signal Health */}
      {health ? (
        <div style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${health.color}33` }}>
          {/* Status header */}
          <div style={{ background:`${health.color}15`, padding:"8px 12px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>{health.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:health.color }}>
                    SIGNAL {health.status}
                  </div>
                  <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#c8e8ff", marginTop:1 }}>
                    {health.advice}
                  </div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:900, color:health.color }}>
                  {health.hl}
                </div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"#3a6080" }}>candles left</div>
              </div>
            </div>
          </div>

          {/* Strength bar */}
          <div style={{ padding:"8px 12px", background:"rgba(0,0,0,0.2)" }}>
            <div style={{ height:6, background:"#0a2540", borderRadius:3, overflow:"hidden", marginBottom:6 }}>
              <motion.div
                animate={{ width: health.pct+"%" }}
                transition={{ duration:0.8 }}
                style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${health.color}55,${health.color})` }}
              />
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080" }}>
                SNR <span style={{ color:health.color }}>{health.snr}</span>
              </span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080" }}>
                φ={health.phi}
              </span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:health.movingWith?"#00ff9d":"#ff3366" }}>
                {health.movingWith ? "📈 moving WITH signal" : "📉 moving AGAINST"}
              </span>
            </div>
          </div>

          {/* MT5 Action Advice — the key part */}
          <div style={{
            padding:"10px 12px",
            background: health.status==="STRONG" ? "rgba(0,255,157,0.06)"
                      : health.status==="FADING" ? "rgba(255,204,0,0.06)"
                      : "rgba(255,51,102,0.06)",
            borderTop:`1px solid ${health.color}22`
          }}>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, color:"#3a6080", letterSpacing:2, marginBottom:4 }}>
              MT5 ACTION
            </div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:health.color, lineHeight:1.5 }}>
              {health.mt5advice}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", textAlign:"center", padding:12 }}>
          Fetching live data from Deriv...
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function Signals({ session={} }) {
  const [signals, setSignals]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("mt5"); // "mt5" | "recent"
  const activeSessions          = session.active || [];

  const fetchSignals = useCallback(async () => {
    try {
      // Recent MT5 signals (last 4 hours)
      const { data } = await supabase
        .from("mt5_signals")
        .select("*")
        .gte("created_at", new Date(Date.now() - 4*60*60*1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(20);
      setSignals(data || []);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchSignals();
    const t = setInterval(fetchSignals, 30000);
    const sub = supabase
      .channel("mt5-signals-watch")
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"mt5_signals" }, fetchSignals)
      .subscribe();
    return () => { clearInterval(t); sub.unsubscribe(); };
  }, [fetchSignals]);

  const pending  = signals.filter(s => s.status === "pending");
  const executed = signals.filter(s => s.status === "executed");
  const active   = [...pending, ...executed.slice(0,5)];

  return (
    <div style={{ padding:"20px 20px 100px", background:"#020810", minHeight:"100vh" }}>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>
        MT5 Signal Health
      </div>
      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:14 }}>
        // LIVE SIGNAL MONITOR · MT5 POSITIONS
      </div>

      {/* Session */}
      <div style={{ background:"#071525", border:"1px solid rgba(0,212,255,0.2)", borderRadius:12, padding:"10px 14px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6 }}>
          {activeSessions.length === 0
            ? <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080" }}>Off-hours</span>
            : activeSessions.map(s => (
              <span key={s.name} style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:SESSION_COLORS[s.name]||"#fff", background:"rgba(0,212,255,0.08)", padding:"2px 7px", borderRadius:5 }}>
                {s.name.charAt(0).toUpperCase()+s.name.slice(1)}
              </span>
            ))
          }
        </div>
        <button onClick={fetchSignals} style={{ background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.3)", borderRadius:8, padding:"5px 10px", color:"#00d4ff", fontFamily:"'Share Tech Mono',monospace", fontSize:9, cursor:"pointer" }}>
          ↻ Refresh
        </button>
      </div>

      {/* Legend */}
      <div style={{ background:"#071525", border:"1px solid #0a2540", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, color:"#3a6080", letterSpacing:2, marginBottom:8 }}>MT5 GUIDE</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
          {[
            { icon:"🟢", label:"STRONG",  desc:"Hold position" },
            { icon:"🟡", label:"FADING",  desc:"Tighten SL" },
            { icon:"🔴", label:"DEAD",    desc:"Close trade" },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{ textAlign:"center", padding:"6px 4px", background:"rgba(0,0,0,0.2)", borderRadius:8 }}>
              <div style={{ fontSize:18, marginBottom:2 }}>{icon}</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, color:"#c8e8ff" }}>{label}</div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"#3a6080", marginTop:2 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:11, padding:40 }}>
          Loading MT5 signals...
        </div>
      ) : active.length === 0 ? (
        <div style={{ textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:11, padding:30, background:"#071525", borderRadius:12 }}>
          <div style={{ fontSize:28, marginBottom:8 }}>📡</div>
          No recent MT5 signals
          <br/>
          <span style={{ fontSize:9 }}>Signal health appears here when TIMI sends signals to MT5</span>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#ffcc00", letterSpacing:2, marginBottom:10 }}>
              ⏳ {pending.length} PENDING
            </div>
          )}
          {executed.length > 0 && (
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#00ff9d", letterSpacing:2, marginBottom:10 }}>
              ✅ {executed.length} EXECUTED
            </div>
          )}
          <AnimatePresence>
            {active.map(sig => <MT5SignalCard key={sig.id} signal={sig} />)}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
