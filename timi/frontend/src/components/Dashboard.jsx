import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://pedbupgjxlcumidwoktc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjc0NTIsImV4cCI6MjA4NzkwMzQ1Mn0.lscyzf9JN82ZihHLD0VC4broyMMfm7WL9MIvXRmwZG8";
const BOT_URL = "https://pedbupgjxlcumidwoktc.supabase.co/functions/v1/timi-trader";

const api = (path, params="") =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}${params}`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
  }).then(r => r.json());

export default function Dashboard() {
  const [trades, setTrades]     = useState([]);
  const [config, setConfig]     = useState({});
  const [signals, setSignals]   = useState([]);
  const [recs, setRecs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [tab, setTab]           = useState("overview");
  const [scanLog, setScanLog]   = useState([]);

  const load = useCallback(async () => {
    const [t, c] = await Promise.all([
      api("trades", "?account_name=eq.edge_function&order=created_at.desc&limit=100&select=symbol,result,pnl,stake,confidence,created_at,patterns"),
      api("bot_config", "?active=eq.true&select=balance_cache,symbols,min_confidence,risk_pct,auto_trade")
    ]);
    setTrades(t || []);
    setConfig((c||[])[0] || {});
  }, []);

  const runScan = async () => {
    setLoading(true);
    try {
      const r = await fetch(BOT_URL, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${ANON_KEY}` },
        body: JSON.stringify({})
      }).then(r => r.json());
      setScanLog(r.scan_log || []);
      if (r.signal) setSignals(prev => [r.signal, ...prev].slice(0,20));
      await load();
    } finally { setLoading(false); }
  };

  const getRecommendations = async () => {
    setLoading(true);
    try {
      const r = await fetch(BOT_URL, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${ANON_KEY}` },
        body: JSON.stringify({ recommend: true })
      }).then(r => r.json());
      setRecs(r.top_pairs || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const decided = trades.filter(t => ["win","loss"].includes(t.result));
  const wins    = decided.filter(t => t.result === "win");
  const losses  = decided.filter(t => t.result === "loss");
  const wr      = decided.length ? (wins.length/decided.length*100).toFixed(1) : 0;
  const netPnl  = decided.reduce((a,t) => a + parseFloat(t.pnl||0), 0);
  const avgWin  = wins.length ? (wins.reduce((a,t)=>a+parseFloat(t.pnl||0),0)/wins.length).toFixed(2) : 0;
  const avgLoss = losses.length ? (losses.reduce((a,t)=>a+parseFloat(t.pnl||0),0)/losses.length).toFixed(2) : 0;

  const gradeColor = g => g==="A+"?"#00ff88":g==="A"?"#88ff00":g==="B"?"#ffaa00":"#ff4444";

  return (
    <div style={{background:"#0a0a0f",color:"#e0e0ff",minHeight:"100vh",fontFamily:"monospace",padding:"20px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <div>
          <h1 style={{margin:0,fontSize:"24px",color:"#7c3aed"}}>⚡ TIMI Intelligence</h1>
          <p style={{margin:0,color:"#888",fontSize:"12px"}}>Unified Mathematical Trading Engine</p>
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={runScan} disabled={loading}
            style={{background:"#7c3aed",border:"none",color:"white",padding:"8px 16px",borderRadius:"6px",cursor:"pointer"}}>
            {loading ? "Scanning..." : "🔍 Run Scan"}
          </button>
          <button onClick={getRecommendations} disabled={loading}
            style={{background:"#0d9488",border:"none",color:"white",padding:"8px 16px",borderRadius:"6px",cursor:"pointer"}}>
            📊 Get Recommendations
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"12px",marginBottom:"20px"}}>
        {[
          {label:"Balance", value:`$${parseFloat(config.balance_cache||0).toFixed(2)}`, color:"#7c3aed"},
          {label:"Win Rate", value:`${wr}%`, color: wr>60?"#00ff88":wr>50?"#ffaa00":"#ff4444"},
          {label:"Net PnL", value:`$${netPnl.toFixed(2)}`, color:netPnl>0?"#00ff88":"#ff4444"},
          {label:"Avg Win", value:`$${avgWin}`, color:"#00ff88"},
          {label:"Avg Loss", value:`$${avgLoss}`, color:"#ff4444"},
        ].map(s => (
          <div key={s.label} style={{background:"#13131f",borderRadius:"8px",padding:"12px",border:"1px solid #2a2a3e"}}>
            <p style={{margin:0,color:"#888",fontSize:"11px"}}>{s.label}</p>
            <p style={{margin:0,fontSize:"20px",fontWeight:"bold",color:s.color}}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
        {["overview","signals","recommendations","trades"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{background:tab===t?"#7c3aed":"#1a1a2e",border:"1px solid #2a2a3e",
                    color:"white",padding:"6px 14px",borderRadius:"6px",cursor:"pointer",
                    textTransform:"capitalize"}}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
          {/* Scan Log */}
          <div style={{background:"#13131f",borderRadius:"8px",padding:"16px",border:"1px solid #2a2a3e"}}>
            <h3 style={{margin:"0 0 12px",color:"#7c3aed"}}>Last Scan Log</h3>
            {scanLog.length === 0
              ? <p style={{color:"#888",fontSize:"12px"}}>Run a scan to see results</p>
              : scanLog.map((l,i) => (
                <p key={i} style={{margin:"4px 0",fontSize:"12px",color:
                  l.includes("trade_placed")?"#00ff88":
                  l.includes("skip")||l.includes("block")||l.includes("HOLD")?"#ff6666":"#aaa"}}>
                  {l}
                </p>
              ))
            }
          </div>
          {/* Config */}
          <div style={{background:"#13131f",borderRadius:"8px",padding:"16px",border:"1px solid #2a2a3e"}}>
            <h3 style={{margin:"0 0 12px",color:"#7c3aed"}}>Bot Config</h3>
            {[
              ["Status", config.auto_trade ? "🟢 ACTIVE" : "🔴 PAUSED"],
              ["Symbols", (config.symbols||[]).join(", ")],
              ["Min Confidence", `${config.min_confidence}%`],
              ["Risk Per Trade", `${config.risk_pct}%`],
              ["Total Trades", decided.length],
              ["Errors", trades.filter(t=>t.result==="error").length],
            ].map(([k,v]) => (
              <div key={k} style={{display:"flex",justifyContent:"space-between",
                padding:"6px 0",borderBottom:"1px solid #1a1a2e"}}>
                <span style={{color:"#888",fontSize:"12px"}}>{k}</span>
                <span style={{color:"#e0e0ff",fontSize:"12px"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "recommendations" && (
        <div style={{background:"#13131f",borderRadius:"8px",padding:"16px",border:"1px solid #2a2a3e"}}>
          <h3 style={{margin:"0 0 16px",color:"#7c3aed"}}>📊 Daily Pair Analysis</h3>
          {recs.length === 0
            ? <div style={{textAlign:"center",padding:"40px"}}>
                <p style={{color:"#888"}}>Click "Get Recommendations" to analyze all pairs</p>
                <button onClick={getRecommendations}
                  style={{background:"#0d9488",border:"none",color:"white",
                          padding:"10px 20px",borderRadius:"6px",cursor:"pointer",marginTop:"10px"}}>
                  Analyze Markets Now
                </button>
              </div>
            : recs.map(r => (
                <div key={r.symbol} style={{display:"flex",alignItems:"center",gap:"12px",
                  padding:"12px",marginBottom:"8px",background:"#0d0d1a",
                  borderRadius:"6px",border:"1px solid #2a2a3e"}}>
                  <span style={{background:gradeColor(r.grade),color:"#000",fontWeight:"bold",
                    padding:"4px 8px",borderRadius:"4px",minWidth:"30px",textAlign:"center"}}>
                    {r.grade}
                  </span>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                      <span style={{fontWeight:"bold",color:"#e0e0ff"}}>{r.symbol}</span>
                      <span style={{background:r.direction==="BUY"?"#00ff8833":"#ff444433",
                        color:r.direction==="BUY"?"#00ff88":"#ff4444",
                        padding:"2px 8px",borderRadius:"4px",fontSize:"11px"}}>
                        {r.direction}
                      </span>
                      <span style={{color:"#888",fontSize:"11px"}}>conf:{r.confidence}%</span>
                    </div>
                    <p style={{margin:"2px 0 0",color:"#888",fontSize:"11px"}}>{r.reason}</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{margin:0,fontSize:"18px",fontWeight:"bold",
                      color:r.score>0.5?"#00ff88":"#ffaa00"}}>{(r.score*100).toFixed(0)}</p>
                    <p style={{margin:0,color:"#888",fontSize:"10px"}}>score</p>
                  </div>
                </div>
              ))
          }
        </div>
      )}

      {tab === "signals" && (
        <div style={{background:"#13131f",borderRadius:"8px",padding:"16px",border:"1px solid #2a2a3e"}}>
          <h3 style={{margin:"0 0 12px",color:"#7c3aed"}}>Live Signals</h3>
          {signals.length === 0
            ? <p style={{color:"#888"}}>Run a scan to generate signals</p>
            : signals.map((s,i) => (
              <div key={i} style={{padding:"10px",marginBottom:"8px",background:"#0d0d1a",
                borderRadius:"6px",border:"1px solid #2a2a3e"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontWeight:"bold"}}>{s.symbol}</span>
                  <span style={{color:s.action==="BUY"?"#00ff88":"#ff4444",fontWeight:"bold"}}>
                    {s.action} {s.confidence}%
                  </span>
                </div>
                <p style={{margin:"4px 0 0",color:"#888",fontSize:"11px"}}>
                  Bayesian P(win): {(s.bayesian_win_prob*100||0).toFixed(1)}% | {s.reason}
                </p>
              </div>
            ))
          }
        </div>
      )}

      {tab === "trades" && (
        <div style={{background:"#13131f",borderRadius:"8px",padding:"16px",border:"1px solid #2a2a3e"}}>
          <h3 style={{margin:"0 0 12px",color:"#7c3aed"}}>Recent Trades</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"12px"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #2a2a3e"}}>
                {["Time","Symbol","Direction","Result","PnL","Conf"].map(h => (
                  <th key={h} style={{padding:"8px",textAlign:"left",color:"#888"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.slice(0,50).map((t,i) => (
                <tr key={i} style={{borderBottom:"1px solid #13131f"}}>
                  <td style={{padding:"6px 8px",color:"#888"}}>{t.created_at?.slice(11,16)}</td>
                  <td style={{padding:"6px 8px"}}>{t.symbol}</td>
                  <td style={{padding:"6px 8px",color:"#888"}}>{t.type||"?"}</td>
                  <td style={{padding:"6px 8px",color:
                    t.result==="win"?"#00ff88":t.result==="loss"?"#ff4444":
                    t.result==="error"?"#ff8800":"#888"}}>
                    {t.result}
                  </td>
                  <td style={{padding:"6px 8px",color:parseFloat(t.pnl||0)>0?"#00ff88":"#ff4444"}}>
                    {t.pnl ? `$${parseFloat(t.pnl).toFixed(2)}` : "-"}
                  </td>
                  <td style={{padding:"6px 8px",color:"#888"}}>{t.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
