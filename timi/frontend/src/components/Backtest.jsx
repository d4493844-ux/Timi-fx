import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";

function calcEMA(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
  return ema;
}
function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  let g = 0, l = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  return 100 - 100 / (1 + g / (l || 0.0001));
}
function calcBB(prices, period = 20) {
  const sl = prices.slice(-period);
  const mean = sl.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
}

function runBacktest(candles, config) {
  if (!candles || candles.length < 50) return null;
  const { startBalance, riskPct, minConfidence, duration } = config;
  let balance = startBalance;
  const trades = [];
  const equity = [{ i: 0, v: startBalance }];

  for (let i = 50; i < candles.length - duration; i++) {
    const window = candles.slice(0, i);
    const closes = window.map(c => parseFloat(c.close));
    const ema9 = calcEMA(closes, 9);
    const ema21 = calcEMA(closes, 21);
    const ema50 = calcEMA(closes.slice(-60), 50);
    const rsi = calcRSI(closes);
    const bb = calcBB(closes);
    const price = closes[closes.length - 1];

    let score = 0;
    if (ema9 > ema21 && ema21 > ema50) score += 2;
    else if (ema9 < ema21 && ema21 < ema50) score -= 2;
    if (rsi < 30) score += 2; else if (rsi > 70) score -= 2;
    else if (rsi < 45) score += 1; else if (rsi > 55) score -= 1;
    if (price < bb.lower) score += 1.5; else if (price > bb.upper) score -= 1.5;

    const confidence = Math.min(Math.round(Math.abs(score) / 6 * 100), 99);
    const action = score >= 2 ? "BUY" : score <= -2 ? "SELL" : null;

    if (!action || confidence < minConfidence) continue;

    const stake = balance * (riskPct / 100);
    const future = candles[i + duration];
    if (!future) continue;

    const entryPrice = parseFloat(candles[i].close);
    const exitPrice = parseFloat(future.close);
    const won = action === "BUY" ? exitPrice > entryPrice : exitPrice < entryPrice;
    const pnl = won ? stake * 0.85 : -stake;

    balance += pnl;
    if (balance <= 0) { balance = 0; break; }

    trades.push({ i, action, confidence, stake: +stake.toFixed(2), pnl: +pnl.toFixed(2), result: won ? "WIN" : "LOSS", balance: +balance.toFixed(2) });
    equity.push({ i: trades.length, v: +balance.toFixed(2) });
  }

  const wins = trades.filter(t => t.result === "WIN");
  const losses = trades.filter(t => t.result === "LOSS");
  const totalPnl = balance - startBalance;
  const winRate = trades.length ? Math.round(wins.length / trades.length * 100) : 0;
  const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + t.pnl, 0) / losses.length) : 1;
  const profitFactor = +(avgWin / avgLoss).toFixed(2);
  const maxDD = equity.reduce((acc, e) => {
    acc.peak = Math.max(acc.peak, e.v);
    acc.dd = Math.min(acc.dd, e.v - acc.peak);
    return acc;
  }, { peak: startBalance, dd: 0 }).dd;

  return { trades, equity, totalPnl: +totalPnl.toFixed(2), winRate, profitFactor, maxDD: +Math.abs(maxDD).toFixed(2), finalBalance: +balance.toFixed(2), totalTrades: trades.length };
}

const s = {
  page: { padding: "20px 20px 100px" },
  title: { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  sub: { fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", letterSpacing: 2, marginBottom: 16 },
  card: { background: "#071525", border: "1px solid #0a2540", borderRadius: 14, padding: 16, marginBottom: 12 },
  ct: { fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#00d4ff", letterSpacing: 3, marginBottom: 14 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  lbl: { fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#3a6080" },
  val: { fontFamily: "'Orbitron',monospace", fontSize: 13, color: "#00d4ff", fontWeight: 700 },
  inp: { background: "#0a2540", border: "1px solid #1a3550", borderRadius: 8, padding: "8px 12px", color: "#fff", fontFamily: "'Share Tech Mono',monospace", fontSize: 12, width: "100%", outline: "none", marginTop: 4, boxSizing: "border-box" },
  runBtn: { width: "100%", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(90deg,#00d4ff,#00ff9d)", color: "#020810", fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 900, cursor: "pointer", letterSpacing: 2, marginTop: 4 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  statBox: { background: "#0a1e30", borderRadius: 10, padding: "10px 12px", textAlign: "center" },
  statVal: { fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700 },
  statLbl: { fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: "#3a6080", marginTop: 3 },
  loading: { textAlign: "center", color: "#00d4ff", fontFamily: "'Share Tech Mono',monospace", fontSize: 12, padding: 30 },
  empty: { textAlign: "center", color: "#3a6080", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, padding: 20 },
};

const SYMBOLS = ["R_75", "R_25", "R_50", "BOOM1000", "CRASH1000"];
const NAMES = { R_75: "VIX 75", R_25: "VIX 25", R_50: "VIX 50", BOOM1000: "BOOM 1000", CRASH1000: "CRASH 1000" };

export default function Backtest() {
  const [config, setConfig] = useState({ symbol: "R_75", startBalance: 1000, riskPct: 2, minConfidence: 45, duration: 5, candles: 500 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runTest = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      await new Promise(resolve => {
        const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=1089");
        ws.onopen = () => ws.send(JSON.stringify({
          ticks_history: config.symbol, adjust_start_time: 1,
          count: config.candles, end: "latest", granularity: 60, style: "candles"
        }));
        ws.onmessage = (e) => {
          const d = JSON.parse(e.data);
          if (d.candles) {
            ws.close();
            const res = runBacktest(d.candles, config);
            setResult(res);
            resolve();
          }
          if (d.error) { setError(d.error.message); ws.close(); resolve(); }
        };
        ws.onerror = () => { setError("Connection failed"); resolve(); };
      });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.title}>Backtest</div>
      <div style={s.sub}>// STRATEGY SIMULATOR</div>

      <div style={s.card}>
        <div style={s.ct}>BACKTEST CONFIG</div>
        <div style={s.lbl}>Symbol</div>
        <select style={s.inp} value={config.symbol} onChange={e => setConfig(p => ({ ...p, symbol: e.target.value }))}>
          {SYMBOLS.map(s => <option key={s} value={s}>{NAMES[s]}</option>)}
        </select>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          {[
            { key: "startBalance", label: "Start Balance ($)", min: 10 },
            { key: "riskPct", label: "Risk Per Trade (%)", min: 0.5, step: 0.5 },
            { key: "minConfidence", label: "Min Confidence (%)", min: 10 },
            { key: "candles", label: "Candles (history)", min: 100 },
          ].map(({ key, label, min, step }) => (
            <div key={key}>
              <div style={s.lbl}>{label}</div>
              <input style={s.inp} type="number" min={min} step={step || 1} value={config[key]}
                onChange={e => setConfig(p => ({ ...p, [key]: parseFloat(e.target.value) }))} />
            </div>
          ))}
        </div>
        <button style={s.runBtn} onClick={runTest} disabled={loading}>
          {loading ? "⏳ RUNNING SIMULATION..." : "▶ RUN BACKTEST"}
        </button>
        {error && <div style={{ color: "#ff3366", fontFamily: "'Share Tech Mono',monospace", fontSize: 11, marginTop: 8 }}>⚠️ {error}</div>}
      </div>

      {loading && <div style={s.loading}>🔍 Fetching {config.candles} candles and simulating trades...</div>}

      {result && (
        <>
          <div style={s.card}>
            <div style={s.ct}>RESULTS — {NAMES[config.symbol]}</div>
            <div style={s.statGrid}>
              <div style={s.statBox}>
                <div style={{ ...s.statVal, color: result.totalPnl >= 0 ? "#00ff9d" : "#ff3366" }}>
                  {result.totalPnl >= 0 ? "+" : ""}${result.totalPnl}
                </div>
                <div style={s.statLbl}>TOTAL P&L</div>
              </div>
              <div style={s.statBox}>
                <div style={{ ...s.statVal, color: "#00d4ff" }}>{result.winRate}%</div>
                <div style={s.statLbl}>WIN RATE</div>
              </div>
              <div style={s.statBox}>
                <div style={{ ...s.statVal, color: "#ffcc00" }}>{result.profitFactor}x</div>
                <div style={s.statLbl}>PROFIT FACTOR</div>
              </div>
              <div style={s.statBox}>
                <div style={{ ...s.statVal, color: "#ff3366" }}>${result.maxDD}</div>
                <div style={s.statLbl}>MAX DRAWDOWN</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#0a2540", borderRadius: 8, overflow: "hidden", marginTop: 8 }}>
              {[
                { v: result.totalTrades, c: "#c8e8ff", l: "TRADES" },
                { v: "$" + result.finalBalance.toFixed(0), c: "#00ff9d", l: "FINAL BAL" },
                { v: ((result.finalBalance - config.startBalance) / config.startBalance * 100).toFixed(1) + "%", c: result.totalPnl >= 0 ? "#00ff9d" : "#ff3366", l: "RETURN" }
              ].map(({ v, c, l }) => (
                <div key={l} style={{ background: "#071525", padding: "8px 4px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 9, color: "#3a6080", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.ct}>EQUITY CURVE</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={result.equity}>
                <Line type="monotone" dataKey="v" stroke={result.totalPnl >= 0 ? "#00ff9d" : "#ff3366"} strokeWidth={2} dot={false} />
                <ReferenceLine y={config.startBalance} stroke="#3a6080" strokeDasharray="4 4" />
                <XAxis dataKey="i" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: "#071525", border: "1px solid #0a2540", borderRadius: 8, fontFamily: "'Share Tech Mono',monospace", fontSize: 10 }}
                  formatter={v => [`$${v}`, "Balance"]} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={s.card}>
            <div style={s.ct}>LAST 20 SIMULATED TRADES</div>
            {result.trades.slice(-20).reverse().map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0a2540" }}>
                <div>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: t.action === "BUY" ? "#00ff9d" : "#ff3366" }}>{t.action}</span>
                  <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", marginLeft: 8 }}>{t.confidence}% conf · ${t.stake}</span>
                </div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: t.result === "WIN" ? "#00ff9d" : "#ff3366" }}>
                  {t.pnl >= 0 ? "+" : ""}${t.pnl}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
