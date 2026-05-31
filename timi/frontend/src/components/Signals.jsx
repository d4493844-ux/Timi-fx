import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";

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
  // Noise
  const recent = closes.slice(-5), base = closes.slice(-10,-5);
  const bm = base.reduce((a,b)=>a+b,0)/base.length;
  const bs = Math.sqrt(base.reduce((s,v)=>s+Math.pow(v-bm,2),0)/base.length);
  const z  = bs > 0 ? Math.abs(recent.reduce((a,b)=>a+b,0)/recent.length - bm)/bs : 0;
  const against = action==="BUY" ? recent[recent.length-1]<recent[0] : recent[recent.length-1]>recent[0];
  const isNoise = against && z < 1.5;

  let status, color, icon, action_advice;
  if (snr > 0.5 && phi > -0.3) {
    status="STRONG"; color="#00ff9d"; icon="🟢";
    action_advice = "✅ Signal healthy — safe to hold";
  } else if (snr > 0.2 || (Math.min(hl,20) > 2 && phi > 0.0)) {
    status="FADING"; color="#ffcc00"; icon="🟡";
    action_advice = isNoise ? "💡 Small dip — likely noise, stay in" : "⚠️ Weakening — watch closely";
  } else {
    status="DEAD"; color="#ff3366"; icon="🔴";
    action_advice = isNoise ? "⚡ Noise spike — may recover" : "🚫 Signal gone — high risk";
  }
  return { status, color, icon, action_advice, hl: Math.min(hl,20).toFixed(1), snr: snr.toFixed(2), phi: phi.toFixed(3), isNoise, pct: Math.min(snr/1.0,1)*100 };
}

// ── Live candle fetcher ─────────────────────────────────────────
function useLiveCandles(symbol) {
  const [closes, setCloses] = useState([]);
  useEffect(() => {
    if (!symbol) return;
    let ws;
    const connect = () => {
      ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
      ws.onopen = () => ws.send(JSON.stringify({
        ticks_history: symbol, adjust_start_time: 1,
        count: 20, end: "latest", granularity: 60, style: "candles"
      }));
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.candles) setCloses(d.candles.map(c => parseFloat(c.close)));
      };
    };
    connect();
    const refresh = setInterval(connect, 60000); // refresh every minute
    return () => { clearInterval(refresh); ws?.close(); };
  }, [symbol]);
  return closes;
}

// ── Trade Health Card ───────────────────────────────────────────
function TradeHealthCard({ trade }) {
  const closes = useLiveCandles(trade.symbol);
  const health = getSignalHealth(closes, trade.type);
  const [age, setAge] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setAge(Math.floor((Date.now() - new Date(trade.created_at).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [trade.created_at]);

  const mins = Math.floor(age/60), secs = age%60;
  const ageColor = age < 60 ? "#00ff9d" : age > 300 ? "#ff3366" : "#ffcc00";
  const ageLabel = age < 60 ? "FRESH" : age > 300 ? "OLD" : "LIVE";
  const tradeColor = trade.type === "BUY" ? "#00ff9d" : "#ff3366";

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      style={{ background:"#071525", border:`1px solid ${health ? health.color+"44" : "#0a2540"}`, borderRadius:14, padding:16, marginBottom:12 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, color:"#fff" }}>
            {NAMES[trade.symbol]||trade.symbol}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:4, alignItems:"center" }}>
            <span style={{ fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:tradeColor }}>
              {trade.type}
            </span>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080" }}>
              ${trade.stake} stake
            </span>
            <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:ageColor }}>
              {ageLabel} · {mins>0?`${mins}m `:""}{secs}s
            </span>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080" }}>
            {trade.confidence}% conf
          </div>
          <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:2 }}>
            {trade.session || ""}
          </div>
        </div>
      </div>

      {/* Signal Health */}
      {health ? (
        <div style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${health.color}33` }}>
          {/* Status bar */}
          <div style={{ background:`${health.color}15`, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>{health.icon}</span>
              <div>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:health.color }}>
                  SIGNAL {health.status}
                </div>
                <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#c8e8ff", marginTop:1 }}>
                  {health.action_advice}
                </div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:900, color:health.color }}>{health.hl}</div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080" }}>candles left</div>
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
            <div style={{ display:"flex", gap:12 }}>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080" }}>
                SNR <span style={{ color:health.color }}>{health.snr}</span>
              </span>
              <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#3a6080" }}>
                φ <span style={{ color:"#c8e8ff" }}>{health.phi}</span>
              </span>
              {health.isNoise && (
                <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:8, color:"#ffcc00" }}>⚡ noise</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", textAlign:"center", padding:"10px 0" }}>
          Loading live data...
        </div>
      )}
    </motion.div>
  );
}

// ── Legend ──────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ background:"#071525", border:"1px solid #0a2540", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#3a6080", letterSpacing:2, marginBottom:8 }}>HOW TO READ</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
        {[
          { icon:"🟢", label:"STRONG", desc:"Hold — momentum intact" },
          { icon:"🟡", label:"FADING", desc:"Watch — take profit soon" },
          { icon:"🔴", label:"DEAD", desc:"High risk — signal gone" },
        ].map(({ icon, label, desc }) => (
          <div key={label} style={{ textAlign:"center", padding:"6px 4px", background:"rgba(0,0,0,0.2)", borderRadius:8 }}>
            <div style={{ fontSize:18, marginBottom:2 }}>{icon}</div>
            <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, color:"#c8e8ff" }}>{label}</div>
            <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:7, color:"#3a6080", marginTop:2, lineHeight:1.4 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function Signals({ session={} }) {
  const [openTrades, setOpenTrades]   = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading]         = useState(true);
  const activeSessions = session.active || [];

  const fetchTrades = useCallback(async () => {
    try {
      // Open trades (last 30 min, result = open or null)
      const { data: open } = await supabase
        .from("trades")
        .select("*")
        .eq("account_name", "edge_function")
        .in("result", ["open", "OPEN"])
        .gte("created_at", new Date(Date.now() - 30*60*1000).toISOString())
        .order("created_at", { ascending: false });

      // Recent completed trades (last 2 hours)
      const { data: recent } = await supabase
        .from("trades")
        .select("*")
        .eq("account_name", "edge_function")
        .in("result", ["win", "loss", "WIN", "LOSS"])
        .gte("created_at", new Date(Date.now() - 2*60*60*1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      setOpenTrades(open || []);
      setRecentTrades(recent || []);
    } catch(e) {
      console.error("Trades fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
    // Refresh every 30 seconds
    const t = setInterval(fetchTrades, 30000);
    // Realtime subscription for new trades
    const sub = supabase
      .channel("trades-signals")
      .on("postgres_changes", { event: "*", schema: "public", table: "trades" }, fetchTrades)
      .subscribe();
    return () => { clearInterval(t); sub.unsubscribe(); };
  }, [fetchTrades]);

  return (
    <div style={{ padding:"20px 20px 100px", background:"#020810", minHeight:"100vh" }}>
      <div style={{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 }}>
        Signal Health
      </div>
      <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16 }}>
        // LIVE TRADE MONITOR · HALF-LIFE ENGINE
      </div>

      {/* Session bar */}
      <div style={{ background:"#071525", border:"1px solid rgba(0,212,255,0.2)", borderRadius:12, padding:"10px 14px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, color:"#3a6080", letterSpacing:3, marginBottom:3 }}>SESSIONS</div>
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
        </div>
        <button onClick={fetchTrades} style={{ background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.3)", borderRadius:8, padding:"6px 12px", color:"#00d4ff", fontFamily:"'Share Tech Mono',monospace", fontSize:9, cursor:"pointer" }}>
          ↻ Refresh
        </button>
      </div>

      <Legend />

      {/* Open Trades */}
      {loading ? (
        <div style={{ textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:11, padding:40 }}>
          Loading live trades...
        </div>
      ) : openTrades.length > 0 ? (
        <>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color:"#00ff9d", letterSpacing:2, marginBottom:10 }}>
            ● {openTrades.length} OPEN TRADE{openTrades.length > 1 ? "S" : ""}
          </div>
          <AnimatePresence>
            {openTrades.map(trade => <TradeHealthCard key={trade.id} trade={trade} />)}
          </AnimatePresence>
        </>
      ) : (
        <div style={{ textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:11, padding:30, background:"#071525", borderRadius:12 }}>
          <div style={{ fontSize:28, marginBottom:8 }}>👁</div>
          No open trades right now
          <br/>
          <span style={{ fontSize:9 }}>Signal health will appear here when bot places trades</span>
        </div>
      )}

      {/* Recent trades */}
      {recentTrades.length > 0 && (
        <>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, margin:"16px 0 10px" }}>
            RECENT TRADES
          </div>
          {recentTrades.map(trade => (
            <div key={trade.id} style={{ background:"#071525", border:"1px solid #0a2540", borderRadius:10, padding:"10px 14px", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <span style={{ fontFamily:"'Orbitron',monospace", fontSize:10, color:trade.type==="BUY"?"#00ff9d":"#ff3366", marginRight:8 }}>
                  {trade.type}
                </span>
                <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#c8e8ff" }}>
                  {NAMES[trade.symbol]||trade.symbol}
                </span>
              </div>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080" }}>
                  ${parseFloat(trade.pnl||0).toFixed(2)}
                </span>
                <span style={{ fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:["win","WIN"].includes(trade.result)?"#00ff9d":"#ff3366" }}>
                  {(trade.result||"").toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
