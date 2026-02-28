import { motion } from "framer-motion";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const SYMBOL_NAMES = { frxEURUSD:"EUR/USD", R_75:"VIX 75", cryBTCUSD:"BTC/USD", BOOM1000:"BOOM 1000" };

const s = {
  page: { padding:"20px 20px 90px" },
  title: { fontFamily:"'Orbitron',monospace", fontSize:18, fontWeight:700, color:"#fff", marginBottom:4 },
  sub: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", letterSpacing:2, marginBottom:16 },
  chartCard: { background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:16, marginBottom:16 },
  chartTitle: { fontFamily:"'Orbitron',monospace", fontSize:10, color:"#3a6080", letterSpacing:3, marginBottom:12 },
  row: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #0a2540" },
  sym: { fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:700, color:"#fff" },
  meta: { fontFamily:"'Share Tech Mono',monospace", fontSize:10, color:"#3a6080", marginTop:2 },
  empty: { textAlign:"center", color:"#3a6080", fontFamily:"'Share Tech Mono',monospace", fontSize:12, padding:30 },
};

export default function History({ tradeHistory = [] }) {
  const wins = tradeHistory.filter(t => t.result === "WIN").length;
  const losses = tradeHistory.filter(t => t.result === "LOSS").length;
  const totalPnl = tradeHistory.reduce((a, t) => a + t.pnl, 0);
  const growthData = tradeHistory.slice().reverse().reduce((acc, t, i) => {
    const prev = acc[i-1]?.v || 0;
    acc.push({ i, v: prev + t.pnl });
    return acc;
  }, []);

  return (
    <div style={s.page}>
      <div style={s.title}>History</div>
      <div style={s.sub}>// TRADE HISTORY · P&L TRACKER</div>
      <div style={s.chartCard}>
        <div style={s.chartTitle}>SESSION P&L — ${totalPnl.toFixed(2)}</div>
        {growthData.length > 1 ? (
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={growthData}>
              <Line type="monotone" dataKey="v" stroke={totalPnl >= 0 ? "#00ff9d" : "#ff3366"} strokeWidth={2} dot={false} />
              <XAxis dataKey="i" hide />
              <Tooltip contentStyle={{ background:"#071525", border:"1px solid #0a2540", borderRadius:8, fontFamily:"'Share Tech Mono',monospace", fontSize:10 }} formatter={v=>[`$${v.toFixed(2)}`,"P&L"]} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ ...s.empty, padding:20 }}>P&L chart appears after first trades</div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:1, background:"#0a2540", marginTop:12, borderRadius:8, overflow:"hidden" }}>
          {[{v:wins,c:"#00ff9d",l:"WIN"},{v:losses,c:"#ff3366",l:"LOSS"},{v:`${wins+losses>0?Math.round(wins/(wins+losses)*100):0}%`,c:"#00d4ff",l:"RATE"}].map(({v,c,l})=>(
            <div key={l} style={{ background:"#071525", padding:"8px 6px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:15, fontWeight:700, color:c }}>{v}</div>
              <div style={{ fontSize:10, color:"#3a6080", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:"#071525", border:"1px solid #0a2540", borderRadius:14, padding:"0 16px" }}>
        {tradeHistory.length === 0 && <div style={s.empty}>No trades yet. TIMI is scanning...</div>}
        {tradeHistory.map((t, i) => (
          <motion.div key={i} style={s.row} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.05 }}>
            <div>
              <div style={s.sym}>{SYMBOL_NAMES[t.symbol] || t.symbol}</div>
              <div style={s.meta}>{t.type} · {t.date}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color: t.result==="WIN"?"#00ff9d":"#ff3366" }}>{t.pnl>=0?"+":""} ${Math.abs(t.pnl).toFixed(2)}</div>
              <div style={{ fontFamily:"'Share Tech Mono',monospace", fontSize:10, color: t.result==="WIN"?"#00ff9d":"#ff3366", marginTop:2 }}>{t.result}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
