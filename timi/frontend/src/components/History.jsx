import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const NAMES = { R_75:"VIX 75",R_25:"VIX 25",R_50:"VIX 50",BOOM1000:"BOOM 1000",BOOM500:"BOOM 500",CRASH1000:"CRASH 1000",CRASH500:"CRASH 500",frxEURUSD:"EUR/USD",cryBTCUSD:"BTC/USD" };

const s = {
  page:{ padding:"20px 20px 90px" },
  title:{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub:{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16 },
  card:{ background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:12 },
  cardTitle:{ fontFamily:"'Orbitron',monospace", fontSize:9, color:"#3a6080", letterSpacing:3, marginBottom:12 },
  statGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 },
  statBox:{ background:"#0a1e30", borderRadius:10, padding:"10px 12px" },
  statVal:{ fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700 },
  statLabel:{ fontFamily:"'Share Tech Mono',monospace", fontSize:9, color:"#3a6080", marginTop:3 },
  tradeRow:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom:"1px solid #0a2540" },
  sym:{ fontFamily:"'Orbitron',monospace", fontSize:12, fontWeight:700, color:"#fff" },
  meta:{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:2 },
  empty:{ textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, padding:30 },
};

export default function History({ tradeHistory=[] }) {
  const wins = tradeHistory.filter(t => t.result === "WIN");
  const losses = tradeHistory.filter(t => t.result === "LOSS");
  const totalPnl = tradeHistory.reduce((a, t) => a + t.pnl, 0);
  const winRate = tradeHistory.length ? Math.round(wins.length / tradeHistory.length * 100) : 0;
  const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + t.pnl, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "∞";
  const maxDrawdown = tradeHistory.reduce((acc, t) => {
    acc.running += t.pnl;
    acc.peak = Math.max(acc.peak, acc.running);
    acc.dd = Math.min(acc.dd, acc.running - acc.peak);
    return acc;
  }, { running: 0, peak: 0, dd: 0 }).dd;

  // Equity curve
  const equity = tradeHistory.slice().reverse().reduce((acc, t, i) => {
    const prev = acc[i - 1]?.v || 0;
    acc.push({ i, v: +(prev + t.pnl).toFixed(2) });
    return acc;
  }, []);

  // Per-symbol stats
  const symStats = {};
  tradeHistory.forEach(t => {
    if (!symStats[t.symbol]) symStats[t.symbol] = { wins: 0, losses: 0, pnl: 0 };
    if (t.result === "WIN") symStats[t.symbol].wins++;
    else symStats[t.symbol].losses++;
    symStats[t.symbol].pnl += t.pnl;
  });
  const symData = Object.entries(symStats).map(([sym, s]) => ({
    name: NAMES[sym] || sym,
    winRate: Math.round(s.wins / (s.wins + s.losses) * 100),
    pnl: +s.pnl.toFixed(2),
    trades: s.wins + s.losses
  })).sort((a, b) => b.pnl - a.pnl);

  // Hourly performance
  const hourStats = {};
  tradeHistory.forEach(t => {
    const h = new Date().getHours(); // approximate
    if (!hourStats[h]) hourStats[h] = { pnl: 0, trades: 0 };
    hourStats[h].pnl += t.pnl;
    hourStats[h].trades++;
  });

  return (
    <div style={s.page}>
      <div style={s.title}>Analytics</div>
      <div style={s.sub}>// PERFORMANCE INTELLIGENCE</div>

      {/* Key stats */}
      <motion.div style={s.card} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <div style={s.cardTitle}>SESSION PERFORMANCE</div>
        <div style={s.statGrid}>
          <div style={s.statBox}>
            <div style={{...s.statVal, color: totalPnl>=0?"#00ff9d":"#ff3366"}}>${totalPnl.toFixed(2)}</div>
            <div style={s.statLabel}>TOTAL P&L</div>
          </div>
          <div style={s.statBox}>
            <div style={{...s.statVal, color:"#00d4ff"}}>{winRate}%</div>
            <div style={s.statLabel}>WIN RATE</div>
          </div>
          <div style={s.statBox}>
            <div style={{...s.statVal, color:"#ffcc00"}}>{profitFactor}</div>
            <div style={s.statLabel}>PROFIT FACTOR</div>
          </div>
          <div style={s.statBox}>
            <div style={{...s.statVal, color:"#ff3366"}}>${Math.abs(maxDrawdown).toFixed(2)}</div>
            <div style={s.statLabel}>MAX DRAWDOWN</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:1, background:"#0a2540", borderRadius:8, overflow:"hidden" }}>
          {[{v:tradeHistory.length,c:"#c8e8ff",l:"TOTAL"},{v:wins.length,c:"#00ff9d",l:"WIN"},{v:losses.length,c:"#ff3366",l:"LOSS"},{v:`$${avgWin.toFixed(2)}`,c:"#00d4ff",l:"AVG WIN"}].map(({v,c,l})=>(
            <div key={l} style={{background:"#071525",padding:"8px 4px",textAlign:"center"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:14,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:9,color:"#3a6080",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Equity curve */}
      <motion.div style={s.card} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.05}}>
        <div style={s.cardTitle}>EQUITY CURVE</div>
        {equity.length > 1 ? (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={equity}>
              <Line type="monotone" dataKey="v" stroke={totalPnl>=0?"#00ff9d":"#ff3366"} strokeWidth={2} dot={false}/>
              <XAxis dataKey="i" hide/>
              <YAxis hide/>
              <Tooltip contentStyle={{background:"#071525",border:"1px solid #0a2540",borderRadius:8,fontFamily:"'Share Tech Mono',monospace",fontSize:10}} formatter={v=>[`$${v}`,"P&L"]}/>
            </LineChart>
          </ResponsiveContainer>
        ) : <div style={s.empty}>Chart builds after first trades</div>}
      </motion.div>

      {/* Per-symbol performance */}
      {symData.length > 0 && (
        <motion.div style={s.card} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
          <div style={s.cardTitle}>PERFORMANCE BY MARKET</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={symData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="name" tick={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,fill:"#3a6080"}}/>
              <YAxis tick={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,fill:"#3a6080"}}/>
              <Tooltip contentStyle={{background:"#071525",border:"1px solid #0a2540",borderRadius:8,fontFamily:"'Share Tech Mono',monospace",fontSize:10}} formatter={v=>[`$${v}`,"P&L"]}/>
              <Bar dataKey="pnl" radius={[4,4,0,0]}>
                {symData.map((entry,i) => <Cell key={i} fill={entry.pnl>=0?"#00ff9d":"#ff3366"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {symData.map(s => (
            <div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #0a2540"}}>
              <div>
                <div style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#fff"}}>{s.name}</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:"#3a6080",marginTop:2}}>{s.trades} trades · {s.winRate}% WR</div>
              </div>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:s.pnl>=0?"#00ff9d":"#ff3366"}}>{s.pnl>=0?"+":""}${s.pnl}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Trade log */}
      <motion.div style={s.card} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}>
        <div style={s.cardTitle}>TRADE LOG</div>
        {tradeHistory.length === 0 && <div style={s.empty}>No trades yet</div>}
        {tradeHistory.map((t,i) => (
          <motion.div key={i} style={s.tradeRow} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}>
            <div>
              <div style={s.sym}>{NAMES[t.symbol]||t.symbol}</div>
              <div style={s.meta}>{t.type} · {t.date} {t.account?"· "+t.account:""}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Orbitron',monospace",fontSize:13,fontWeight:700,color:t.result==="WIN"?"#00ff9d":"#ff3366"}}>{t.pnl>=0?"+":""}${Math.abs(t.pnl).toFixed(2)}</div>
              <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,color:t.result==="WIN"?"#00ff9d":"#ff3366",marginTop:2}}>{t.result}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
