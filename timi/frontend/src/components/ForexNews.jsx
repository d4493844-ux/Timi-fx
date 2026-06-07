import { useState, useEffect, useCallback } from "react";

// ── Currency to pairs mapping ─────────────────────────────────
const CURRENCY_PAIRS = {
  USD: ["frxEURUSD","frxGBPUSD","frxUSDJPY","frxXAUUSD","frxXAGUSD","frxAUDUSD","frxUSDCAD","frxUSDCHF"],
  EUR: ["frxEURUSD","frxEURGBP","frxEURJPY"],
  GBP: ["frxGBPUSD","frxGBPJPY","frxEURGBP"],
  JPY: ["frxUSDJPY","frxGBPJPY","frxEURJPY"],
  XAU: ["frxXAUUSD"],
  XAG: ["frxXAGUSD"],
  AUD: ["frxAUDUSD","frxAUDJPY"],
  CAD: ["frxUSDCAD"],
  CHF: ["frxUSDCHF"],
  NZD: ["frxNZDUSD"],
};

// ── High impact event keywords ────────────────────────────────
const HIGH_IMPACT_KEYWORDS = [
  "NFP","Non-Farm","Federal Reserve","FOMC","Rate Decision","CPI","GDP",
  "Employment","Unemployment","Retail Sales","PMI","ISM","Trade Balance",
  "Interest Rate","Inflation","Bank of England","ECB","BOJ","RBA","SNB",
  "Powell","Lagarde","Bailey","Payroll","Jobs","PPI","PCE"
];

const IMPACT_COLORS = {
  High:   { bg:"#1a0a0a", border:"#ff4444", text:"#ff6666", dot:"#ff4444" },
  Medium: { bg:"#1a1200", border:"#ffa500", text:"#ffb833", dot:"#ffa500" },
  Low:    { bg:"#0a1a0a", border:"#44ff44", text:"#66ff66", dot:"#44ff44" },
  None:   { bg:"#0a1020", border:"#334466", text:"#556688", dot:"#334466" },
};

const CURRENCY_FLAGS = {
  USD:"🇺🇸", EUR:"🇪🇺", GBP:"🇬🇧", JPY:"🇯🇵", AUD:"🇦🇺",
  CAD:"🇨🇦", CHF:"🇨🇭", NZD:"🇳🇿", XAU:"🥇", XAG:"🥈",
};

// ── Fetch news from jblanked free API ────────────────────────
async function fetchNews(source = "forex-factory") {
  try {
    const res = await fetch(
      `https://www.jblanked.com/news/api/${source}/calendar/week/`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("News fetch error:", e);
    return [];
  }
}

// ── Check if news is within blackout window ───────────────────
function getNewsStatus(eventDateStr) {
  const now     = new Date();
  const eventDt = new Date(eventDateStr);
  const diffMs  = eventDt - now;
  const diffMin = diffMs / 60000;

  if (diffMin < -60)  return { status:"released",  label:"RELEASED",  color:"#334466" };
  if (diffMin < 0)    return { status:"recent",     label:"JUST NOW",  color:"#ff6666" };
  if (diffMin < 30)   return { status:"imminent",   label:"IMMINENT",  color:"#ff4444" };
  if (diffMin < 120)  return { status:"upcoming",   label:"UPCOMING",  color:"#ffa500" };
  if (diffMin < 1440) return { status:"today",      label:"TODAY",     color:"#00d4ff" };
  return                     { status:"scheduled",  label:"SCHEDULED", color:"#334466" };
}

function formatTime(dateStr) {
  if (!dateStr) return "--:--";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}

function formatDate(dateStr) {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { weekday:"short", month:"short", day:"numeric" });
}

// ── Bot impact warning logic ──────────────────────────────────
function getBotImpact(event) {
  if (event.impact !== "High") return null;
  const currency = event.currency || event.economy || "";
  const affectedPairs = CURRENCY_PAIRS[currency] || [];
  if (!affectedPairs.length) return null;
  const status = getNewsStatus(event.date || event.data);
  if (!["imminent","recent","upcoming"].includes(status.status)) return null;
  return { pairs: affectedPairs, status };
}

export default function ForexNews() {
  const [news,       setNews]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [filter,     setFilter]     = useState("All");
  const [currency,   setCurrency]   = useState("All");
  const [source,     setSource]     = useState("forex-factory");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search,     setSearch]     = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const data = await fetchNews(source);
    if (data.length === 0) {
      setError("No news data. API may be rate limited — try again in a moment.");
    } else {
      // Sort by date
      data.sort((a,b) => new Date(a.date||a.data) - new Date(b.date||b.data));
      setNews(data);
    }
    setLastUpdate(new Date());
    setLoading(false);
  }, [source]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const id = setInterval(load, 5*60*1000);
    return () => clearInterval(id);
  }, [load]);

  // Filter news
  const filtered = news.filter(n => {
    const imp      = n.impact || "None";
    const cur      = n.currency || n.economy || "";
    const title    = (n.title || n.name || "").toLowerCase();
    const passImp  = filter === "All" || imp === filter;
    const passCur  = currency === "All" || cur === currency;
    const passSrch = !search || title.includes(search.toLowerCase()) || cur.toLowerCase().includes(search.toLowerCase());
    return passImp && passCur && passSrch;
  });

  // Bot warnings — high impact events in next 2 hours
  const botWarnings = news.filter(n => getBotImpact(n) !== null);

  const s = {
    page:    { background:"#020810", minHeight:"100vh", color:"#c0d8f0", fontFamily:"'Share Tech Mono',monospace", paddingBottom:80 },
    header:  { padding:"16px 16px 8px", borderBottom:"1px solid #0a2540" },
    title:   { fontSize:18, fontWeight:700, color:"#00d4ff", letterSpacing:2, margin:0 },
    sub:     { fontSize:10, color:"#3a6080", letterSpacing:1, marginTop:2 },
    section: { padding:"0 12px" },
    label:   { fontSize:9, color:"#3a6080", letterSpacing:2, textTransform:"uppercase", marginBottom:4 },

    // Filters
    filters: { display:"flex", gap:6, padding:"10px 12px", overflowX:"auto", borderBottom:"1px solid #0a1525" },
    fBtn:    (active) => ({
      padding:"4px 10px", borderRadius:4, border:`1px solid ${active?"#00d4ff":"#0a2540"}`,
      background: active?"#00d4ff15":"transparent", color: active?"#00d4ff":"#3a6080",
      fontSize:9, letterSpacing:1, cursor:"pointer", whiteSpace:"nowrap",
    }),

    // Warning banner
    warnBanner: { margin:"10px 12px", padding:"10px 12px", background:"#1a0505",
      border:"1px solid #ff4444", borderRadius:6 },
    warnTitle: { fontSize:10, color:"#ff4444", letterSpacing:2, marginBottom:6 },

    // News card
    card:    (impact) => ({
      margin:"8px 12px", padding:"12px", borderRadius:6,
      background: (IMPACT_COLORS[impact]||IMPACT_COLORS.None).bg,
      border:`1px solid ${(IMPACT_COLORS[impact]||IMPACT_COLORS.None).border}`,
    }),
    cardTop: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 },
    impDot:  (impact) => ({
      width:8, height:8, borderRadius:"50%",
      background:(IMPACT_COLORS[impact]||IMPACT_COLORS.None).dot,
      display:"inline-block", marginRight:6,
    }),
    impTag:  (impact) => ({
      fontSize:8, letterSpacing:1,
      color:(IMPACT_COLORS[impact]||IMPACT_COLORS.None).text,
      background:(IMPACT_COLORS[impact]||IMPACT_COLORS.None).bg,
      border:`1px solid ${(IMPACT_COLORS[impact]||IMPACT_COLORS.None).border}`,
      padding:"2px 6px", borderRadius:3,
    }),
    evTitle: { fontSize:11, color:"#c0d8f0", fontWeight:600, marginBottom:4, lineHeight:1.4 },
    meta:    { display:"flex", gap:12, fontSize:9, color:"#3a6080", marginBottom:6 },
    values:  { display:"flex", gap:8, marginTop:6 },
    valBox:  (color) => ({
      flex:1, padding:"4px 6px", borderRadius:4,
      background:"#0a1525", border:`1px solid ${color||"#0a2540"}`,
      textAlign:"center",
    }),
    valLbl:  { fontSize:7, color:"#3a6080", letterSpacing:1 },
    valNum:  (color) => ({ fontSize:11, color: color||"#c0d8f0", fontWeight:700 }),

    // Status badge
    statusBadge: (color) => ({
      fontSize:8, letterSpacing:1, padding:"2px 6px",
      border:`1px solid ${color}`, borderRadius:3, color,
    }),

    // Pair tags
    pairTag: { fontSize:8, padding:"2px 5px", background:"#0a1525",
      border:"1px solid #0a2540", borderRadius:3, color:"#00d4ff" },

    // Stats
    statsRow: { display:"flex", gap:8, padding:"10px 12px" },
    statBox:  { flex:1, padding:"8px", background:"#0a1020",
      border:"1px solid #0a2540", borderRadius:6, textAlign:"center" },
    statNum:  { fontSize:18, fontWeight:700, color:"#00d4ff" },
    statLbl:  { fontSize:8, color:"#3a6080", letterSpacing:1 },

    // Search
    searchBox: { margin:"8px 12px", padding:"8px 10px", background:"#0a1020",
      border:"1px solid #0a2540", borderRadius:6, color:"#c0d8f0",
      fontSize:11, fontFamily:"'Share Tech Mono',monospace", width:"calc(100% - 24px)",
      boxSizing:"border-box", outline:"none" },
  };

  const highCount   = news.filter(n => n.impact==="High").length;
  const medCount    = news.filter(n => n.impact==="Medium").length;
  const todayCount  = news.filter(n => {
    const s = getNewsStatus(n.date||n.data);
    return ["imminent","recent","upcoming","today"].includes(s.status);
  }).length;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={s.title}>📰 FOREX NEWS</p>
            <p style={s.sub}>ECONOMIC CALENDAR · IMPACT CLASSIFIER · BOT FILTER</p>
          </div>
          <button onClick={load} disabled={loading}
            style={{padding:"6px 10px",background:"#0a2540",border:"1px solid #00d4ff",
              borderRadius:4,color:"#00d4ff",fontSize:9,cursor:"pointer",letterSpacing:1}}>
            {loading ? "..." : "↻ REFRESH"}
          </button>
        </div>
        {lastUpdate && (
          <p style={{...s.sub,marginTop:4}}>
            Updated {lastUpdate.toLocaleTimeString()} · {news.length} events this week
          </p>
        )}
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statBox}>
          <div style={{...s.statNum,color:"#ff4444"}}>{highCount}</div>
          <div style={s.statLbl}>HIGH IMPACT</div>
        </div>
        <div style={s.statBox}>
          <div style={{...s.statNum,color:"#ffa500"}}>{medCount}</div>
          <div style={s.statLbl}>MEDIUM</div>
        </div>
        <div style={s.statBox}>
          <div style={{...s.statNum,color:"#00d4ff"}}>{todayCount}</div>
          <div style={s.statLbl}>TODAY/SOON</div>
        </div>
        <div style={s.statBox}>
          <div style={{...s.statNum,color:"#ff4444"}}>{botWarnings.length}</div>
          <div style={s.statLbl}>BOT ALERTS</div>
        </div>
      </div>

      {/* Bot warnings */}
      {botWarnings.length > 0 && (
        <div style={s.warnBanner}>
          <div style={s.warnTitle}>⚠️ BOT TRADING ALERTS</div>
          {botWarnings.map((n,i) => {
            const wi = getBotImpact(n);
            return (
              <div key={i} style={{marginBottom:6,paddingBottom:6,borderBottom:i<botWarnings.length-1?"1px solid #2a1010":"none"}}>
                <div style={{fontSize:10,color:"#ffaa00",marginBottom:3}}>
                  {n.currency||n.economy} — {n.title||n.name}
                </div>
                <div style={{fontSize:9,color:"#ff6666",marginBottom:3}}>
                  Status: {wi.status.label} at {formatTime(n.date||n.data)}
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {wi.pairs.map(p => (
                    <span key={p} style={{...s.pairTag,borderColor:"#ff4444",color:"#ff6666"}}>{p.replace("frx","")}</span>
                  ))}
                </div>
                <div style={{fontSize:8,color:"#884444",marginTop:4}}>
                  ⚡ Bot confidence reduced 20pts for affected pairs
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Source selector */}
      <div style={{...s.filters,borderBottom:"none",paddingBottom:4}}>
        <span style={s.label}>SOURCE:</span>
        {["forex-factory","fxstreet"].map(src => (
          <button key={src} onClick={()=>setSource(src)} style={s.fBtn(source===src)}>
            {src.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Impact filter */}
      <div style={s.filters}>
        {["All","High","Medium","Low"].map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={s.fBtn(filter===f)}>
            {f==="High" ? "🔴 HIGH" : f==="Medium" ? "🟠 MED" : f==="Low" ? "🟢 LOW" : "ALL"}
          </button>
        ))}
        <span style={{...s.label,margin:"auto 0"}}>|</span>
        {["All","USD","EUR","GBP","JPY","XAU","XAG","AUD","CAD","CHF"].map(c => (
          <button key={c} onClick={()=>setCurrency(c)} style={s.fBtn(currency===c)}>
            {CURRENCY_FLAGS[c]||""} {c}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        placeholder="Search events..."
        value={search}
        onChange={e=>setSearch(e.target.value)}
        style={s.searchBox}
      />

      {/* Error */}
      {error && (
        <div style={{margin:"12px",padding:"12px",background:"#1a0a0a",border:"1px solid #ff4444",borderRadius:6,fontSize:10,color:"#ff6666"}}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{textAlign:"center",padding:"40px",color:"#3a6080",fontSize:11,letterSpacing:2}}>
          LOADING NEWS...
        </div>
      )}

      {/* News count */}
      {!loading && !error && (
        <div style={{padding:"6px 12px",fontSize:9,color:"#3a6080",letterSpacing:1}}>
          SHOWING {filtered.length} OF {news.length} EVENTS
        </div>
      )}

      {/* News cards */}
      {!loading && filtered.map((n, i) => {
        const impact  = n.impact || "None";
        const cur     = n.currency || n.economy || "?";
        const title   = n.title || n.name || "Unknown Event";
        const dateStr = n.date || n.data || "";
        const status  = getNewsStatus(dateStr);
        const botWarn = getBotImpact(n);
        const isHigh  = HIGH_IMPACT_KEYWORDS.some(k => title.includes(k));
        const actual   = n.actual   || "--";
        const forecast = n.forecast || "--";
        const previous = n.previous || "--";

        // Determine actual vs forecast direction
        const actNum  = parseFloat(actual);
        const fcstNum = parseFloat(forecast);
        const better  = !isNaN(actNum) && !isNaN(fcstNum) && actNum > fcstNum;
        const worse   = !isNaN(actNum) && !isNaN(fcstNum) && actNum < fcstNum;

        return (
          <div key={i} style={s.card(impact)}>
            <div style={s.cardTop}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={s.impTag(impact)}>
                    <span style={s.impDot(impact)}></span>
                    {impact.toUpperCase()}
                  </span>
                  <span style={{fontSize:11,color:"#00d4ff",fontWeight:700}}>
                    {CURRENCY_FLAGS[cur]||""} {cur}
                  </span>
                  {isHigh && impact==="High" && (
                    <span style={{fontSize:8,color:"#ff4444",border:"1px solid #ff4444",padding:"1px 5px",borderRadius:3}}>
                      KEY EVENT
                    </span>
                  )}
                  {botWarn && (
                    <span style={{fontSize:8,color:"#ffaa00",border:"1px solid #ffaa00",padding:"1px 5px",borderRadius:3}}>
                      ⚡ BOT ALERT
                    </span>
                  )}
                </div>
                <div style={s.evTitle}>{title}</div>
              </div>
              <div style={{textAlign:"right",minWidth:70}}>
                <span style={s.statusBadge(status.color)}>{status.label}</span>
                <div style={{fontSize:10,color:"#c0d8f0",marginTop:4}}>{formatTime(dateStr)}</div>
                <div style={{fontSize:8,color:"#3a6080"}}>{formatDate(dateStr)}</div>
              </div>
            </div>

            {/* Affected pairs */}
            {botWarn && (
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                <span style={{fontSize:8,color:"#3a6080",marginRight:2}}>AFFECTS:</span>
                {botWarn.pairs.map(p => (
                  <span key={p} style={s.pairTag}>{p.replace("frx","")}</span>
                ))}
              </div>
            )}

            {/* Values */}
            {(actual !== "--" || forecast !== "--" || previous !== "--") && (
              <div style={s.values}>
                <div style={s.valBox(better?"#00ff88":worse?"#ff4444":null)}>
                  <div style={s.valLbl}>ACTUAL</div>
                  <div style={s.valNum(better?"#00ff88":worse?"#ff4444":"#c0d8f0")}>{actual}</div>
                </div>
                <div style={s.valBox()}>
                  <div style={s.valLbl}>FORECAST</div>
                  <div style={s.valNum()}>{forecast}</div>
                </div>
                <div style={s.valBox()}>
                  <div style={s.valLbl}>PREVIOUS</div>
                  <div style={s.valNum()}>{previous}</div>
                </div>
                {better && <div style={{fontSize:9,color:"#00ff88",alignSelf:"center"}}>▲ BEAT</div>}
                {worse  && <div style={{fontSize:9,color:"#ff4444",alignSelf:"center"}}>▼ MISS</div>}
              </div>
            )}
          </div>
        );
      })}

      {!loading && filtered.length === 0 && !error && (
        <div style={{textAlign:"center",padding:"40px",color:"#3a6080",fontSize:11,letterSpacing:2}}>
          NO EVENTS MATCH FILTER
        </div>
      )}
    </div>
  );
}
