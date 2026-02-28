import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import useCompounding from "../hooks/useCompounding";

const s = {
  page: { padding: "20px 20px 100px" },
  title: { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  sub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 16 },
  card: { background: "#071525", border: "1px solid #0a2540", borderRadius: 14, padding: 16, marginBottom: 12 },
  ct: { fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff", letterSpacing: 3, marginBottom: 14 },
  inp: { background: "#0a2540", border: "1px solid #1a3550", borderRadius: 8, padding: "8px 12px", color: "#fff", fontFamily: "'Share Tech Mono',monospace", fontSize: 12, width: "100%", outline: "none", marginTop: 4, boxSizing: "border-box" },
  btn: { width: "100%", padding: 13, borderRadius: 12, border: "none", background: "linear-gradient(90deg,#00d4ff,#00ff9d)", color: "#020810", fontFamily: "'Orbitron',monospace", fontSize: 11, fontWeight: 900, cursor: "pointer", letterSpacing: 2, marginTop: 8 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 },
  statBox: { background: "#0a1e30", borderRadius: 10, padding: "12px", textAlign: "center" },
  statVal: { fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700 },
  statLbl: { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 3 },
  lbl: { fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080", marginBottom: 2 },
  sliderRow: { marginBottom: 14 },
  slider: { width: "100%", accentColor: "#00d4ff", marginTop: 6 },
  milestone: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0a2540" },
};

export default function Growth({ balance }) {
  const bal = parseFloat(balance?.balance || 0);
  const { data, initCompounding, projectGrowth, stats } = useCompounding(bal);
  const [startBal, setStartBal] = useState(bal || 1000);
  const [dailyTarget, setDailyTarget] = useState(data.dailyTarget || 5);
  const [days, setDays] = useState(30);

  const projection = projectGrowth(days);
  const finalProjected = projection[projection.length - 1]?.balance || 0;

  const milestones = [2, 5, 10, 50].map(x => ({
    label: x + "x",
    balance: +(startBal * x).toFixed(0),
    day: Math.ceil(Math.log(x) / Math.log(1 + dailyTarget / 100)),
  }));

  return (
    <div style={s.page}>
      <div style={s.title}>Growth</div>
      <div style={s.sub}>// AUTO-COMPOUNDING TRACKER</div>

      {/* Setup */}
      <div style={s.card}>
        <div style={s.ct}>COMPOUND SETTINGS</div>
        <div style={s.lbl}>Starting Balance ($)</div>
        <input style={s.inp} type="number" value={startBal} onChange={e => setStartBal(parseFloat(e.target.value) || 0)} />

        <div style={{ ...s.sliderRow, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={s.lbl}>Daily Profit Target</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#00d4ff", fontWeight: 700 }}>{dailyTarget}%</div>
          </div>
          <input style={s.slider} type="range" min="1" max="20" step="0.5" value={dailyTarget} onChange={e => setDailyTarget(parseFloat(e.target.value))} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: "#3a6080", fontFamily: "'Share Tech Mono',monospace" }}>Conservative 1%</span>
            <span style={{ fontSize: 9, color: "#3a6080", fontFamily: "'Share Tech Mono',monospace" }}>Aggressive 20%</span>
          </div>
        </div>

        <div style={s.sliderRow}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={s.lbl}>Projection Period</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#00d4ff", fontWeight: 700 }}>{days} days</div>
          </div>
          <input style={s.slider} type="range" min="7" max="365" step="7" value={days} onChange={e => setDays(parseInt(e.target.value))} />
        </div>

        <button style={s.btn} onClick={() => initCompounding(startBal, dailyTarget)}>
          🚀 START TRACKING
        </button>
      </div>

      {/* Projection stats */}
      <div style={s.card}>
        <div style={s.ct}>PROJECTED IN {days} DAYS</div>
        <div style={s.statGrid}>
          <div style={s.statBox}>
            <div style={{ ...s.statVal, color: "#00ff9d" }}>${finalProjected.toLocaleString()}</div>
            <div style={s.statLbl}>PROJECTED BALANCE</div>
          </div>
          <div style={s.statBox}>
            <div style={{ ...s.statVal, color: "#00d4ff" }}>
              {startBal > 0 ? ((finalProjected - startBal) / startBal * 100).toFixed(0) : 0}%
            </div>
            <div style={s.statLbl}>TOTAL RETURN</div>
          </div>
          <div style={s.statBox}>
            <div style={{ ...s.statVal, color: "#ffcc00" }}>${(finalProjected - startBal).toLocaleString().split(".")[0]}</div>
            <div style={s.statLbl}>PROFIT</div>
          </div>
          <div style={s.statBox}>
            <div style={{ ...s.statVal, color: "#c8e8ff" }}>${((finalProjected - startBal) / days).toFixed(0)}</div>
            <div style={s.statLbl}>AVG DAILY PROFIT</div>
          </div>
        </div>

        {/* Equity projection chart */}
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={projection}>
            <Line type="monotone" dataKey="balance" stroke="#00d4ff" strokeWidth={2} dot={false} />
            <ReferenceLine y={startBal} stroke="#3a6080" strokeDasharray="4 4" />
            <XAxis dataKey="day" tick={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, fill: "#3a6080" }} tickFormatter={v => v + "d"} interval={Math.floor(days / 5)} />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ background: "#071525", border: "1px solid #0a2540", borderRadius: 8, fontFamily: "'Share Tech Mono',monospace", fontSize: 10 }}
              formatter={v => [`$${v.toLocaleString()}`, "Balance"]} labelFormatter={v => `Day ${v}`} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Milestones */}
      <div style={s.card}>
        <div style={s.ct}>MILESTONES</div>
        {milestones.map(m => (
          <div key={m.label} style={s.milestone}>
            <div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#fff" }}>{m.label} — ${m.balance.toLocaleString()}</div>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", marginTop: 2 }}>Est. Day {m.day} at {dailyTarget}% daily</div>
            </div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: bal >= m.balance ? "#00ff9d" : "#3a6080" }}>
              {bal >= m.balance ? "✅ HIT" : Math.round(bal / m.balance * 100) + "%"}
            </div>
          </div>
        ))}
      </div>

      {/* Actual vs projected */}
      {data.snapshots.length > 1 && (
        <div style={s.card}>
          <div style={s.ct}>ACTUAL GROWTH</div>
          <div style={s.statGrid}>
            <div style={s.statBox}>
              <div style={{ ...s.statVal, color: parseFloat(stats.totalGrowth) >= 0 ? "#00ff9d" : "#ff3366" }}>{stats.totalGrowth}%</div>
              <div style={s.statLbl}>TOTAL GROWTH</div>
            </div>
            <div style={s.statBox}>
              <div style={{ ...s.statVal, color: "#00d4ff" }}>{stats.avgDailyReturn}%</div>
              <div style={s.statLbl}>AVG DAILY</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={data.snapshots}>
              <Line type="monotone" dataKey="balance" stroke="#00ff9d" strokeWidth={2} dot={{ fill: "#00ff9d", r: 3 }} />
              <XAxis dataKey="date" tick={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 8, fill: "#3a6080" }} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: "#071525", border: "1px solid #0a2540", borderRadius: 8, fontFamily: "'Share Tech Mono',monospace", fontSize: 10 }}
                formatter={v => [`$${v}`, "Balance"]} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
