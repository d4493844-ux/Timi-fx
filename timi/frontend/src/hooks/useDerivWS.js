import { useState, useEffect, useRef } from "react";

const APP_ID = "1089";
const TOKEN = "03WRbkfQGjbZWTH";
const MAX_RISK = 0.02;
const MAX_TRADES = 3;

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
  return { upper: mean + 2 * std, lower: mean - 2 * std };
}
function getSignal(candles) {
  if (candles.length < 30) return { action: "HOLD", confidence: 0, reasons: [] };
  const closes = candles.map(c => parseFloat(c.close));
  const ema9 = calcEMA(closes, 9);
  const ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes.slice(-60), 50);
  const rsi = calcRSI(closes);
  const bb = calcBB(closes);
  const price = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  let score = 0;
  const reasons = [];
  if (ema9 > ema21 && ema21 > ema50) { score += 2; reasons.push("EMA bullish"); }
  else if (ema9 < ema21 && ema21 < ema50) { score -= 2; reasons.push("EMA bearish"); }
  if (ema9 > ema21 && prev < ema9 && price > ema9) { score += 1.5; reasons.push("EMA crossover"); }
  if (ema9 < ema21 && prev > ema9 && price < ema9) { score -= 1.5; reasons.push("EMA crossunder"); }
  if (rsi < 35) { score += 1.5; reasons.push("RSI oversold " + rsi.toFixed(0)); }
  else if (rsi > 65) { score -= 1.5; reasons.push("RSI overbought " + rsi.toFixed(0)); }
  if (price < bb.lower) { score += 1; reasons.push("Below BB"); }
  else if (price > bb.upper) { score -= 1; reasons.push("Above BB"); }
  const confidence = Math.min(Math.round(Math.abs(score) / 3 * 100), 99);
  return {
    action: score >= 2 ? "BUY" : score <= -2 ? "SELL" : "HOLD",
    confidence, reasons
  };
}

export default function useDerivWS() {
  const [balance, setBalance] = useState({ balance: "---", currency: "USD" });
  const [ticks, setTicks] = useState({});
  const [signals, setSignals] = useState({});
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [timiStatus, setTimiStatus] = useState("Connecting...");
  const [autoTrade, setAutoTrade] = useState(true);
  const [activeSymbols, setActiveSymbols] = useState(() => {
    try { return JSON.parse(localStorage.getItem("timi_symbols")) || ["R_75", "R_25", "BOOM1000", "CRASH1000"]; }
    catch { return ["R_75", "R_25", "BOOM1000", "CRASH1000"]; }
  });

  const candles = useRef({});
  const openTradesRef = useRef([]);
  const balanceRef = useRef(null);
  const autoTradeRef = useRef(true);
  const activeSymbolsRef = useRef(["R_75", "R_25", "BOOM1000", "CRASH1000"]);
  const wsRef = useRef(null);

  useEffect(() => { autoTradeRef.current = autoTrade; }, [autoTrade]);
  useEffect(() => { openTradesRef.current = openTrades; }, [openTrades]);
  useEffect(() => {
    activeSymbolsRef.current = activeSymbols;
    localStorage.setItem("timi_symbols", JSON.stringify(activeSymbols));
  }, [activeSymbols]);

  const send = (obj) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify(obj));
  };

  const runAnalysis = (currentCandles) => {
    const syms = activeSymbolsRef.current;
    const newSigs = {};
    let best = null;
    syms.forEach(sym => {
      const c = currentCandles[sym];
      if (!c || c.length < 30) return;
      const sig = getSignal(c);
      newSigs[sym] = sig;
      console.log("SIGNAL", sym, sig.action, sig.confidence + "%");
      if (sig.action !== "HOLD" && sig.confidence >= 50)
        if (!best || sig.confidence > best.sig.confidence) best = { sym, sig };
    });

    setSignals(newSigs);

    if (!autoTradeRef.current || !best) return;
    if (openTradesRef.current.length >= MAX_TRADES) return;
    if (openTradesRef.current.find(t => t.symbol === best.sym)) return;
    const bal = parseFloat(balanceRef.current?.balance || 0);
    if (!bal || bal < 1) return;
    const stake = Math.max(1, parseFloat((bal * MAX_RISK).toFixed(2)));
    setTimiStatus(best.sig.action + " " + best.sym + " @ " + best.sig.confidence + "% — entering...");
    send({ proposal: 1, amount: stake, basis: "stake", contract_type: best.sig.action === "BUY" ? "CALL" : "PUT", currency: "USD", duration: 5, duration_unit: "m", symbol: best.sym });
  };

  useEffect(() => {
    let reconnectTimer;

    const connect = () => {
      const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=" + APP_ID);
      wsRef.current = ws;

      ws.onopen = () => {
        setTimiStatus("Authorizing...");
        ws.send(JSON.stringify({ authorize: TOKEN }));
      };

      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        console.log("WS MSG:", d.msg_type, d.error?.message || "");

        if (d.msg_type === "authorize" && !d.error) {
          setTimiStatus("Authorized! Loading candles...");
          ws.send(JSON.stringify({ balance: 1, account: "current", subscribe: 1 }));
          activeSymbolsRef.current.forEach(sym => {
            ws.send(JSON.stringify({ ticks: sym, subscribe: 1 }));
            ws.send(JSON.stringify({ ticks_history: sym, adjust_start_time: 1, count: 100, end: "latest", granularity: 60, style: "candles" }));
          });
        }

        if (d.msg_type === "balance" && d.balance) {
          const b = { balance: d.balance.balance, currency: d.balance.currency };
          balanceRef.current = b;
          setBalance(b);
        }

        if (d.msg_type === "tick" && d.tick)
          setTicks(p => ({ ...p, [d.tick.symbol]: d.tick.quote }));

        if (d.msg_type === "candles" && d.candles) {
          const sym = d.echo_req?.symbol || d.echo_req?.ticks_history;
          if (sym) {
            console.log("CANDLES RECEIVED:", sym, d.candles.length);
            candles.current[sym] = d.candles;
            setTimiStatus("Candles loaded: " + sym + " (" + d.candles.length + ")");
            runAnalysis({ ...candles.current });
          }
        }

        if (d.msg_type === "proposal" && d.proposal && !d.error)
          ws.send(JSON.stringify({ buy: d.proposal.id, price: d.proposal.ask_price }));

        if (d.msg_type === "buy" && d.buy && !d.error) {
          const trade = {
            id: d.buy.contract_id, symbol: d.buy.underlying_symbol || "SYN",
            contractId: d.buy.contract_id,
            type: d.buy.longcode?.includes("higher") ? "BUY" : "SELL",
            stake: d.buy.buy_price, openTime: Date.now(), pnl: 0, status: "open"
          };
          openTradesRef.current = [...openTradesRef.current, trade];
          setOpenTrades([...openTradesRef.current]);
          setTimiStatus("✅ OPEN: " + trade.type + " " + trade.symbol + " $" + trade.stake); if(window.timiNotify) window.timiNotify("🤖 TIMI Trade Opened", trade.type + " " + trade.symbol + " — Stake: $" + trade.stake, "trade");
          ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: trade.contractId, subscribe: 1 }));
        }

        if (d.msg_type === "proposal_open_contract" && d.proposal_open_contract) {
          const poc = d.proposal_open_contract;
          setOpenTrades(p => p.map(t => t.contractId === poc.contract_id ? { ...t, pnl: parseFloat(poc.profit || 0), status: poc.status } : t));
          if (poc.is_sold || poc.status === "sold") {
            const pnl = parseFloat(poc.profit || 0);
            openTradesRef.current = openTradesRef.current.filter(t => t.contractId !== poc.contract_id);
            setOpenTrades([...openTradesRef.current]);
            setTradeHistory(p => [{ symbol: poc.underlying, type: poc.contract_type === "CALL" ? "BUY" : "SELL", pnl, result: pnl > 0 ? "WIN" : "LOSS", date: new Date().toLocaleTimeString() }, ...p.slice(0, 49)]);
            setTimiStatus((pnl > 0 ? "🟢 WIN" : "🔴 LOSS") + " $" + Math.abs(pnl).toFixed(2) + " — " + poc.underlying); if(window.timiNotify) window.timiNotify(pnl > 0 ? "🟢 TIMI WIN!" : "🔴 TIMI LOSS", "$" + Math.abs(pnl).toFixed(2) + " on " + poc.underlying, pnl > 0 ? "win" : "loss");
            ws.send(JSON.stringify({ balance: 1, account: "current" }));
          }
        }

        if (d.error && !d.error.message?.includes("already subscribed"))
          setTimiStatus("⚠️ " + d.error.message);
      };

      ws.onclose = () => {
        setTimiStatus("Disconnected. Reconnecting...");
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();
    const analysisInterval = setInterval(() => runAnalysis({ ...candles.current }), 30000);

    return () => {
      clearInterval(analysisInterval);
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []); // eslint-disable-line

  const updateSymbols = (syms) => {
    activeSymbolsRef.current = syms;
    setActiveSymbols(syms);
    candles.current = {};
    setSignals({});
    syms.forEach(sym => {
      send({ ticks: sym, subscribe: 1 });
      send({ ticks_history: sym, adjust_start_time: 1, count: 100, end: "latest", granularity: 60, style: "candles" });
    });
    setTimiStatus("Switching to " + syms.length + " markets...");
  };

  return { balance, ticks, signals, openTrades, tradeHistory, timiStatus, autoTrade, setAutoTrade, activeSymbols, updateSymbols };
}
