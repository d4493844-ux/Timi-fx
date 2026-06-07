import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://pedbupgjxlcumidwoktc.supabase.co/functions/v1/timi-trader";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjc0NTIsImV4cCI6MjA4NzkwMzQ1Mn0.lscyzf9JN82ZihHLD0VC4broyMMfm7WL9MIvXRmwZG8";

const CURRENCY_PAIRS = {
  USD:["EURUSD","GBPUSD","USDJPY","XAUUSD","XAGUSD","AUDUSD","USDCAD","USDCHF"],
  EUR:["EURUSD","EURGBP","EURJPY"], GBP:["GBPUSD","GBPJPY","EURGBP"],
  JPY:["USDJPY","GBPJPY","EURJPY"], XAU:["XAUUSD"], XAG:["XAGUSD"],
  AUD:["AUDUSD","AUDJPY"], CAD:["USDCAD"], CHF:["USDCHF"], NZD:["NZDUSD"],
};

const IMPACT_COLORS = {
  High:  {bg:"#1a0808",border:"#ff4444",text:"#ff6666",dot:"#ff4444"},
  Medium:{bg:"#1a1200",border:"#ffa500",text:"#ffb833",dot:"#ffa500"},
  Low:   {bg:"#081a08",border:"#44ff44",text:"#66ff66",dot:"#44ff44"},
  None:  {bg:"#0a1020",border:"#334466",text:"#556688",dot:"#334466"},
};

const FLAGS = {USD:"🇺🇸",EUR:"🇪🇺",GBP:"🇬🇧",JPY:"🇯🇵",AUD:"🇦🇺",
               CAD:"🇨🇦",CHF:"🇨🇭",NZD:"🇳🇿",XAU:"🥇",XAG:"🥈"};

function getStatus(dateStr) {
  if (!dateStr) return {status:"unknown",label:"---",color:"#334466"};
  const diff = (new Date(dateStr) - Date.now()) / 60000;
  if (diff < -60)  return {status:"past",     label:"RELEASED", color:"#334466"};
  if (diff < 0)    return {status:"recent",   label:"JUST NOW", color:"#ff6666"};
  if (diff < 30)   return {status:"imminent", label:"IMMINENT", color:"#ff4444"};
  if (diff < 120)  return {status:"upcoming", label:"UPCOMING", color:"#ffa500"};
  if (diff < 1440) return {status:"today",    label:"TODAY",    color:"#00d4ff"};
  return              {status:"future",    label:"FUTURE",   color:"#334466"};
}

function fmtTime(d) {
  if (!d) return "--:--";
  return new Date(d).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
}
function fmtDate(d) {
  if (!d) return "---";
  return new Date(d).toLocaleDateString([],{weekday:"short",month:"short",day:"numeric"});
}

async function loadNews(source) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/news?source=${source}`,
      { headers:{ Authorization:`Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch(e) {
    console.error("News error:", e);
    return [];
  }
}

export default function ForexNews() {
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [impact,  setImpact]  = useState("All");
  const [cur,     setCur]     = useState("All");
  const [source,  setSrc]     = useState("forex-factory");
  const [search,  setSearch]  = useState("");
  const [updated, setUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    const data = await loadNews(source);
    if (!data.length) setError("No events returned. API may be unavailable — try refreshing.");
    else { data.sort((a,b)=>new Date(a.date||a.data||a.Date)-new Date(b.date||b.data||b.Date)); setNews(data); }
    setUpdated(new Date());
    setLoading(false);
  }, [source]);

  useEffect(()=>{ load(); }, [load]);
  useEffect(()=>{ const id=setInterval(load,5*60*1000); return ()=>clearInterval(id); },[load]);

  const getImpact = n => n.impact || n.Impact || "None";
  const getCur    = n => n.currency || n.economy || n.Currency || "";
  const getTitle  = n => n.title || n.name || n.Name || "Unknown Event";
  const getDate   = n => n.date || n.data || n.Date || "";

  const filtered = news.filter(n => {
    const i = getImpact(n); const c = getCur(n);
    return (impact==="All"||i===impact) &&
           (cur==="All"||c===cur) &&
           (!search||(getTitle(n)+c).toLowerCase().includes(search.toLowerCase()));
  });

  const highCount  = news.filter(n=>getImpact(n)==="High").length;
  const medCount   = news.filter(n=>getImpact(n)==="Medium").length;
  const soonCount  = news.filter(n=>["imminent","recent","upcoming","today"].includes(getStatus(getDate(n)).status)).length;
  const alertCount = news.filter(n=>{
    if(getImpact(n)!=="High") return false;
    const s=getStatus(getDate(n));
    return ["imminent","recent"].includes(s.status) && (CURRENCY_PAIRS[getCur(n)]||[]).length>0;
  }).length;

  const S = {
    page:   {background:"#020810",minHeight:"100vh",color:"#c0d8f0",
              fontFamily:"'Share Tech Mono',monospace",paddingBottom:80},
    hdr:    {padding:"14px 14px 8px",borderBottom:"1px solid #0a2540"},
    title:  {fontSize:16,fontWeight:700,color:"#00d4ff",letterSpacing:2,margin:0},
    sub:    {fontSize:9,color:"#3a6080",letterSpacing:1,marginTop:2},
    stat:   {flex:1,padding:"8px 4px",background:"#0a1020",border:"1px solid #0a2540",
              borderRadius:6,textAlign:"center"},
    sNum:   c=>({fontSize:20,fontWeight:700,color:c||"#00d4ff"}),
    sLbl:   {fontSize:7,color:"#3a6080",letterSpacing:1},
    fRow:   {display:"flex",gap:5,padding:"8px 12px",overflowX:"auto",
              borderBottom:"1px solid #0a1525"},
    fBtn:   a=>({padding:"4px 8px",borderRadius:4,border:`1px solid ${a?"#00d4ff":"#0a2540"}`,
                 background:a?"#00d4ff18":"transparent",color:a?"#00d4ff":"#3a6080",
                 fontSize:8,letterSpacing:1,cursor:"pointer",whiteSpace:"nowrap"}),
    card:   imp=>({margin:"6px 10px",padding:"11px",borderRadius:6,
                   background:IMPACT_COLORS[imp]?.bg||IMPACT_COLORS.None.bg,
                   border:`1px solid ${IMPACT_COLORS[imp]?.border||IMPACT_COLORS.None.border}`}),
    impTag: imp=>({fontSize:7,letterSpacing:1,padding:"2px 5px",borderRadius:3,
                   color:IMPACT_COLORS[imp]?.text||IMPACT_COLORS.None.text,
                   border:`1px solid ${IMPACT_COLORS[imp]?.border||IMPACT_COLORS.None.border}`}),
    dot:    imp=>({width:7,height:7,borderRadius:"50%",
                   background:IMPACT_COLORS[imp]?.dot||IMPACT_COLORS.None.dot,
                   display:"inline-block",marginRight:5}),
    sbadge: c=>({fontSize:7,letterSpacing:1,padding:"2px 5px",borderRadius:3,
                  border:`1px solid ${c}`,color:c}),
    pTag:   {fontSize:7,padding:"2px 4px",background:"#0a1525",
              border:"1px solid #0a2540",borderRadius:3,color:"#00d4ff"},
    val:    c=>({flex:1,padding:"4px 5px",borderRadius:4,background:"#0a1525",
                  border:`1px solid ${c||"#0a2540"}`,textAlign:"center"}),
    vLbl:   {fontSize:6,color:"#3a6080",letterSpacing:1},
    vNum:   c=>({fontSize:11,color:c||"#c0d8f0",fontWeight:700}),
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.hdr}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={S.title}>📰 FOREX NEWS</p>
            <p style={S.sub}>ECONOMIC CALENDAR · IMPACT CLASSIFIER · BOT FILTER</p>
          </div>
          <button onClick={load} disabled={loading}
            style={{padding:"6px 10px",background:"#0a2540",border:"1px solid #00d4ff",
                    borderRadius:4,color:"#00d4ff",fontSize:9,cursor:"pointer"}}>
            {loading?"...":"↻ REFRESH"}
          </button>
        </div>
        {updated&&<p style={{...S.sub,marginTop:3}}>
          Updated {updated.toLocaleTimeString()} · {news.length} events this week
        </p>}
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:6,padding:"8px 10px"}}>
        <div style={S.stat}><div style={S.sNum("#ff4444")}>{highCount}</div><div style={S.sLbl}>HIGH</div></div>
        <div style={S.stat}><div style={S.sNum("#ffa500")}>{medCount}</div><div style={S.sLbl}>MEDIUM</div></div>
        <div style={S.stat}><div style={S.sNum("#00d4ff")}>{soonCount}</div><div style={S.sLbl}>TODAY/SOON</div></div>
        <div style={S.stat}><div style={S.sNum("#ff4444")}>{alertCount}</div><div style={S.sLbl}>BOT ALERTS</div></div>
      </div>

      {/* Source */}
      <div style={{...S.fRow,borderBottom:"none",paddingBottom:2}}>
        {["forex-factory","fxstreet","mql5"].map(s=>(
          <button key={s} onClick={()=>setSrc(s)} style={S.fBtn(source===s)}>
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Impact filter */}
      <div style={S.fRow}>
        {["All","High","Medium","Low"].map(f=>(
          <button key={f} onClick={()=>setImpact(f)} style={S.fBtn(impact===f)}>
            {f==="High"?"🔴 HIGH":f==="Medium"?"🟠 MED":f==="Low"?"🟢 LOW":"ALL"}
          </button>
        ))}
        <span style={{color:"#1a3050",margin:"auto 2px"}}>|</span>
        {["All","USD","EUR","GBP","JPY","XAU","XAG","AUD","CAD","CHF"].map(c=>(
          <button key={c} onClick={()=>setCur(c)} style={S.fBtn(cur===c)}>
            {FLAGS[c]||""} {c}
          </button>
        ))}
      </div>

      {/* Search */}
      <input placeholder="Search events..." value={search}
        onChange={e=>setSearch(e.target.value)}
        style={{margin:"6px 10px",padding:"7px 10px",background:"#0a1020",
                border:"1px solid #0a2540",borderRadius:6,color:"#c0d8f0",
                fontSize:10,fontFamily:"'Share Tech Mono',monospace",
                width:"calc(100% - 20px)",boxSizing:"border-box",outline:"none"}}/>

      {/* Error */}
      {error&&!loading&&(
        <div style={{margin:"8px 10px",padding:"10px",background:"#1a0808",
                     border:"1px solid #ff4444",borderRadius:6,fontSize:9,color:"#ff6666"}}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading&&(
        <div style={{textAlign:"center",padding:"40px",color:"#3a6080",fontSize:10,letterSpacing:2}}>
          FETCHING NEWS...
        </div>
      )}

      {/* Count */}
      {!loading&&!error&&(
        <div style={{padding:"4px 10px",fontSize:8,color:"#3a6080",letterSpacing:1}}>
          SHOWING {filtered.length} / {news.length} EVENTS
        </div>
      )}

      {/* Cards */}
      {!loading&&filtered.map((n,i)=>{
        const imp   = getImpact(n);
        const c     = getCur(n);
        const title = getTitle(n);
        const ds    = getDate(n);
        const st    = getStatus(ds);
        const pairs = CURRENCY_PAIRS[c]||[];
        const actual   = String(n.actual||n.Actual||"--");
        const forecast = String(n.forecast||n.Forecast||"--");
        const previous = String(n.previous||n.Previous||"--");
        const actN=parseFloat(actual); const fcN=parseFloat(forecast);
        const beat=!isNaN(actN)&&!isNaN(fcN)&&actN>fcN;
        const miss=!isNaN(actN)&&!isNaN(fcN)&&actN<fcN;
        const isAlert=imp==="High"&&["imminent","recent"].includes(st.status)&&pairs.length>0;
        return (
          <div key={i} style={S.card(imp)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={S.impTag(imp)}><span style={S.dot(imp)}></span>{imp.toUpperCase()}</span>
                  <span style={{fontSize:12,color:"#00d4ff",fontWeight:700}}>{FLAGS[c]||""} {c}</span>
                  {isAlert&&<span style={{fontSize:7,color:"#ff4444",border:"1px solid #ff4444",padding:"1px 4px",borderRadius:3}}>⚡ BOT ALERT</span>}
                  {imp==="High"&&<span style={{fontSize:7,color:"#ffaa00",border:"1px solid #ffaa00",padding:"1px 4px",borderRadius:3}}>KEY EVENT</span>}
                </div>
                <div style={{fontSize:11,color:"#c0d8f0",fontWeight:600,lineHeight:1.4,marginBottom:3}}>{title}</div>
                {pairs.length>0&&(
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:3}}>
                    {pairs.map(p=><span key={p} style={S.pTag}>{p}</span>)}
                  </div>
                )}
              </div>
              <div style={{textAlign:"right",minWidth:65}}>
                <span style={S.sbadge(st.color)}>{st.label}</span>
                <div style={{fontSize:11,color:"#c0d8f0",marginTop:3}}>{fmtTime(ds)}</div>
                <div style={{fontSize:8,color:"#3a6080"}}>{fmtDate(ds)}</div>
              </div>
            </div>
            {(actual!=="--"||forecast!=="--"||previous!=="--")&&(
              <div style={{display:"flex",gap:5,marginTop:5,alignItems:"center"}}>
                <div style={S.val(beat?"#00ff88":miss?"#ff4444":null)}>
                  <div style={S.vLbl}>ACTUAL</div>
                  <div style={S.vNum(beat?"#00ff88":miss?"#ff4444":null)}>{actual}</div>
                </div>
                <div style={S.val(null)}>
                  <div style={S.vLbl}>FORECAST</div>
                  <div style={S.vNum()}>{forecast}</div>
                </div>
                <div style={S.val(null)}>
                  <div style={S.vLbl}>PREVIOUS</div>
                  <div style={S.vNum()}>{previous}</div>
                </div>
                {beat&&<div style={{fontSize:9,color:"#00ff88",fontWeight:700}}>▲ BEAT</div>}
                {miss&&<div style={{fontSize:9,color:"#ff4444",fontWeight:700}}>▼ MISS</div>}
              </div>
            )}
          </div>
        );
      })}

      {!loading&&filtered.length===0&&!error&&(
        <div style={{textAlign:"center",padding:"40px",color:"#3a6080",fontSize:10,letterSpacing:2}}>
          NO EVENTS MATCH FILTER
        </div>
      )}
    </div>
  );
}
