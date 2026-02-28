import { useState, useEffect, useRef } from "react";

const APP_ID = "1089";
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
function calcMACD(prices) {
  if (prices.length < 26) return { macd: 0, signal: 0, hist: 0 };
  const ema12 = calcEMA(prices.slice(-26), 12);
  const ema26 = calcEMA(prices.slice(-26), 26);
  const macd = ema12 - ema26;
  return { macd, signal: calcEMA([macd], 9), hist: macd - calcEMA([macd], 9) };
}
function calcBB(prices, period = 20) {
  const sl = prices.slice(-period);
  const mean = sl.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
}
function calcStoch(candles, period = 14) {
  if (candles.length < period) return 50;
  const sl = candles.slice(-period);
  const close = parseFloat(candles[candles.length - 1].close);
  const high = Math.max(...sl.map(c => parseFloat(c.high)));
  const low = Math.min(...sl.map(c => parseFloat(c.low)));
  return ((close - low) / (high - low || 1)) * 100;
}
function getSignal(candles1m, candles5m) {
  if (!candles1m || candles1m.length < 30) return { action: "HOLD", confidence: 0, reasons: [] };
  const closes = candles1m.map(c => parseFloat(c.close));
  const ema9 = calcEMA(closes, 9), ema21 = calcEMA(closes, 21), ema50 = calcEMA(closes.slice(-60), 50);
  const rsi = calcRSI(closes), bb = calcBB(closes), macd = calcMACD(closes), stoch = calcStoch(candles1m);
  const price = closes[closes.length - 1], prev = closes[closes.length - 2];
  let score = 0; const reasons = [];
  if (ema9 > ema21 && ema21 > ema50) { score += 2; reasons.push("EMA bullish"); }
  else if (ema9 < ema21 && ema21 < ema50) { score -= 2; reasons.push("EMA bearish"); }
  if (prev < ema9 && price > ema9 && ema9 > ema21) { score += 2; reasons.push("EMA cross up"); }
  if (prev > ema9 && price < ema9 && ema9 < ema21) { score -= 2; reasons.push("EMA cross down"); }
  if (rsi < 30) { score += 2; reasons.push("RSI oversold"); } else if (rsi > 70) { score -= 2; reasons.push("RSI overbought"); }
  if (macd.hist > 0) { score += 1.5; reasons.push("MACD bullish"); } else { score -= 1.5; reasons.push("MACD bearish"); }
  if (price < bb.lower) { score += 1.5; reasons.push("Below BB"); } else if (price > bb.upper) { score -= 1.5; reasons.push("Above BB"); }
  if (stoch < 20) { score += 1; reasons.push("Stoch oversold"); } else if (stoch > 80) { score -= 1; reasons.push("Stoch overbought"); }
  if (candles5m && candles5m.length >= 20) {
    const c5 = candles5m.map(c => parseFloat(c.close));
    calcEMA(c5, 9) > calcEMA(c5, 21) ? (score += 1, reasons.push("5M bullish")) : (score -= 1, reasons.push("5M bearish"));
  }
  const confidence = Math.min(Math.round(Math.abs(score) / 11 * 100), 99);
  return { action: score >= 2 ? "BUY" : score <= -2 ? "SELL" : "HOLD", confidence, reasons, score: +score.toFixed(2) };
}

// ── MULTI-ACCOUNT MANAGER ──────────────────────────────
class AccountManager {
  constructor() {
    this.accounts = this.load();
    this.connections = {};
  }
  load() {
    try { return JSON.parse(localStorage.getItem("timi_accounts")) || []; } catch { return []; }
  }
  save() { localStorage.setItem("timi_accounts", JSON.stringify(this.accounts)); }
  add(name, token) {
    const id = Date.now().toString();
    this.accounts.push({ id, name, token, active: true, balance: "---", currency: "USD" });
    this.save();
    return id;
  }
  remove(id) { this.accounts = this.accounts.filter(a => a.id !== id); this.save(); }
  toggle(id) {
    const a = this.accounts.find(a => a.id === id);
    if (a) { a.active = !a.active; this.save(); }
  }
  updateBalance(id, balance, currency) {
    const a = this.accounts.find(a => a.id === id);
    if (a) { a.balance = balance; a.currency = currency; this.save(); }
  }
}

export default function useDerivWS() {
  const [balance, setBalance] = useState({ balance: "---", currency: "USD" });
  const [ticks, setTicks] = useState({});
  const [signals, setSignals] = useState({});
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [timiStatus, setTimiStatus] = useState("Connecting...");
  const [autoTrade, setAutoTrade] = useState(true);
  const [takeProfitTarget, setTakeProfitTarget] = useState(0);
  const [dailyPnl, setDailyPnl] = useState(0);
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("timi_accounts")) || [];
      // Always ensure primary token is first
      const primary = { id: "primary", name: "Primary", token: "03WRbkfQGjbZWTH", active: true, balance: "---", currency: "USD" };
      if (!saved.find(a => a.id === "primary")) return [primary, ...saved];
      return saved;
    } catch { return [{ id: "primary", name: "Primary", token: "03WRbkfQGjbZWTH", active: true, balance: "---", currency: "USD" }]; }
  });
  const [activeSymbols, setActiveSymbols] = useState(() => {
    try { return JSON.parse(localStorage.getItem("timi_symbols")) || ["R_75", "R_25", "BOOM1000", "CRASH1000"]; }
    catch { return ["R_75", "R_25", "BOOM1000", "CRASH1000"]; }
  });

  const candles1m = useRef({});
  const candles5m = useRef({});
  const openTradesRef = useRef([]);
  const balanceRef = useRef(null);
  const autoTradeRef = useRef(true);
  const activeSymbolsRef = useRef([]);
  const tradeHistoryRef = useRef([]);
  const dailyPnlRef = useRef(0);
  const takeProfitRef = useRef(0);
  const wsConnections = useRef({});  // accountId -> websocket

  useEffect(() => { autoTradeRef.current = autoTrade; }, [autoTrade]);
  useEffect(() => { openTradesRef.current = openTrades; }, [openTrades]);
  useEffect(() => { tradeHistoryRef.current = tradeHistory; }, [tradeHistory]);
  useEffect(() => { takeProfitRef.current = takeProfitTarget; }, [takeProfitTarget]);
  useEffect(() => {
    activeSymbolsRef.current = activeSymbols;
    localStorage.setItem("timi_symbols", JSON.stringify(activeSymbols));
  }, [activeSymbols]);
  useEffect(() => {
    localStorage.setItem("timi_accounts", JSON.stringify(accounts));
  }, [accounts]);

  const sendTo = (accountId, obj) => {
    const ws = wsConnections.current[accountId];
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  };

  const send = (obj) => sendTo("primary", obj);

  // Manual trade execution
  const manualTrade = (sym, direction, stake = null) => {
    const bal = parseFloat(balanceRef.current?.balance || 0);
    const tradeStake = stake || Math.max(1, parseFloat((bal * MAX_RISK).toFixed(2)));
    setTimiStatus("Manual " + direction + " on " + sym + " $" + tradeStake);
    // Send to all active accounts
    Object.keys(wsConnections.current).forEach(accId => {
      sendTo(accId, {
        proposal: 1, amount: tradeStake, basis: "stake",
        contract_type: direction === "BUY" ? "CALL" : "PUT",
        currency: "USD", duration: 5, duration_unit: "m", symbol: sym
      });
    });
  };

  // Close single trade
  const closeTrade = (contractId) => {
    setTimiStatus("Closing trade " + contractId + "...");
    Object.keys(wsConnections.current).forEach(accId => {
      sendTo(accId, { sell: contractId, price: 0 });
    });
  };

  // Close ALL trades
  const closeAllTrades = () => {
    setTimiStatus("🛑 Closing all trades...");
    openTradesRef.current.forEach(t => {
      Object.keys(wsConnections.current).forEach(accId => {
        sendTo(accId, { sell: t.contractId, price: 0 });
      });
    });
    if (window.timiNotify) window.timiNotify("🛑 TIMI", "Closing all open trades", "alert");
  };

  const runAnalysis = () => {
    // Check take profit target
    if (takeProfitRef.current > 0 && dailyPnlRef.current >= takeProfitRef.current) {
      if (autoTradeRef.current) {
        setAutoTrade(false);
        autoTradeRef.current = false;
        setTimiStatus("🎯 Take profit target $" + takeProfitRef.current + " reached! Auto-trade paused.");
        if (window.timiNotify) window.timiNotify("🎯 Take Profit Hit!", "Target $" + takeProfitRef.current + " reached. Trading paused.", "profit");
      }
      return;
    }

    const syms = activeSymbolsRef.current;
    const newSigs = {};
    let best = null;
    syms.forEach(sym => {
      const c1 = candles1m.current[sym];
      if (!c1 || c1.length < 30) return;
      const sig = getSignal(c1, candles5m.current[sym]);
      newSigs[sym] = sig;
      if (sig.action !== "HOLD" && sig.confidence >= 45)
        if (!best || sig.confidence > best.sig.confidence) best = { sym, sig };
    });
    setSignals({ ...newSigs });

    if (!autoTradeRef.current || !best) return;
    if (openTradesRef.current.length >= MAX_TRADES) return;
    if (openTradesRef.current.find(t => t.symbol === best.sym)) return;

    const bal = parseFloat(balanceRef.current?.balance || 0);
    if (!bal || bal < 1) return;

    // ML stake adjustment
    const recent = tradeHistoryRef.current.slice(0, 10);
    const winRate = recent.length ? recent.filter(t => t.result === "WIN").length / recent.length : 0.5;
    const multiplier = winRate >= 0.7 ? 1.3 : winRate >= 0.5 ? 1.0 : winRate >= 0.3 ? 0.7 : 0.5;
    const stake = Math.max(1, Math.min(parseFloat((bal * MAX_RISK * multiplier).toFixed(2)), bal * 0.05));

    setTimiStatus(best.sig.action + " " + best.sym + " @ " + best.sig.confidence + "% | WR: " + Math.round(winRate * 100) + "%");

    // Trade on ALL active accounts
    accounts.filter(a => a.active).forEach(acc => {
      sendTo(acc.id, {
        proposal: 1, amount: stake, basis: "stake",
        contract_type: best.sig.action === "BUY" ? "CALL" : "PUT",
        currency: "USD", duration: 5, duration_unit: "m", symbol: best.sym
      });
    });
  };

  const connectAccount = (account) => {
    if (wsConnections.current[account.id]) {
      wsConnections.current[account.id].close();
    }

    const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=" + APP_ID);
    wsConnections.current[account.id] = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ authorize: account.token }));
      if (account.id === "primary") setTimiStatus("Authorizing primary account...");
    };

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);

      if (d.msg_type === "authorize" && !d.error) {
        ws.send(JSON.stringify({ balance: 1, account: "current", subscribe: 1 }));
        if (account.id === "primary") {
          setTimiStatus("Authorized! Loading candles...");
          activeSymbolsRef.current.forEach(sym => {
            ws.send(JSON.stringify({ ticks: sym, subscribe: 1 }));
            ws.send(JSON.stringify({ ticks_history: sym, adjust_start_time: 1, count: 100, end: "latest", granularity: 60, style: "candles" }));
            ws.send(JSON.stringify({ ticks_history: sym, adjust_start_time: 1, count: 50, end: "latest", granularity: 300, style: "candles" }));
          });
        }
      }

      if (d.msg_type === "balance" && d.balance) {
        const b = { balance: d.balance.balance, currency: d.balance.currency };
        if (account.id === "primary") { balanceRef.current = b; setBalance(b); }
        setAccounts(prev => prev.map(a => a.id === account.id ? { ...a, balance: d.balance.balance, currency: d.balance.currency } : a));
      }

      if (d.msg_type === "tick" && d.tick && account.id === "primary")
        setTicks(p => ({ ...p, [d.tick.symbol]: d.tick.quote }));

      if (d.msg_type === "candles" && d.candles && account.id === "primary") {
        const sym = d.echo_req?.symbol || d.echo_req?.ticks_history;
        const gran = d.echo_req?.granularity;
        if (sym) {
          if (gran === 60) candles1m.current[sym] = d.candles;
          else if (gran === 300) candles5m.current[sym] = d.candles;
          setTimiStatus("Loaded: " + sym + " " + (gran === 60 ? "1M" : "5M"));
          setTimeout(runAnalysis, 500);
        }
      }

      if (d.msg_type === "proposal" && d.proposal && !d.error)
        ws.send(JSON.stringify({ buy: d.proposal.id, price: d.proposal.ask_price }));

      if (d.msg_type === "buy" && d.buy && !d.error) {
        const trade = {
          id: d.buy.contract_id, symbol: d.buy.underlying_symbol || "SYN",
          contractId: d.buy.contract_id, accountId: account.id, accountName: account.name,
          type: d.buy.longcode?.includes("higher") ? "BUY" : "SELL",
          stake: d.buy.buy_price, openTime: Date.now(), pnl: 0, status: "open"
        };
        openTradesRef.current = [...openTradesRef.current, trade];
        setOpenTrades([...openTradesRef.current]);
        setTimiStatus("✅ [" + account.name + "] " + trade.type + " " + trade.symbol + " $" + trade.stake);
        if (window.timiNotify) window.timiNotify("🤖 Trade Opened", "[" + account.name + "] " + trade.type + " " + trade.symbol, "trade");
        ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: trade.contractId, subscribe: 1 }));
      }

      if (d.msg_type === "proposal_open_contract" && d.proposal_open_contract) {
        const poc = d.proposal_open_contract;
        setOpenTrades(p => p.map(t => t.contractId === poc.contract_id
          ? { ...t, pnl: parseFloat(poc.profit || 0), status: poc.status }
          : t
        ));
        if (poc.is_sold || poc.status === "sold") {
          const pnl = parseFloat(poc.profit || 0);
          openTradesRef.current = openTradesRef.current.filter(t => t.contractId !== poc.contract_id);
          setOpenTrades([...openTradesRef.current]);
          dailyPnlRef.current += pnl;
          setDailyPnl(d => d + pnl);
          const newHist = [{ symbol: poc.underlying, type: poc.contract_type === "CALL" ? "BUY" : "SELL", pnl, result: pnl > 0 ? "WIN" : "LOSS", date: new Date().toLocaleTimeString(), account: account.name }, ...tradeHistoryRef.current.slice(0, 49)];
          tradeHistoryRef.current = newHist;
          setTradeHistory(newHist);
          setTimiStatus((pnl > 0 ? "🟢 WIN" : "🔴 LOSS") + " $" + Math.abs(pnl).toFixed(2) + " [" + account.name + "]");
          if (window.timiNotify) window.timiNotify(pnl > 0 ? "🟢 WIN!" : "🔴 LOSS", "$" + Math.abs(pnl).toFixed(2) + " — " + poc.underlying, pnl > 0 ? "win" : "loss");
          ws.send(JSON.stringify({ balance: 1, account: "current" }));
        }
      }

      if (d.error && !d.error.message?.includes("already subscribed"))
        setTimiStatus("⚠️ [" + account.name + "] " + d.error.message);
    };

    ws.onclose = () => {
      if (account.id === "primary") setTimiStatus("Reconnecting...");
      setTimeout(() => connectAccount(account), 5000);
    };
  };

  useEffect(() => {
    accounts.forEach(acc => connectAccount(acc));
    const iv = setInterval(runAnalysis, 30000);
    return () => {
      clearInterval(iv);
      Object.values(wsConnections.current).forEach(ws => ws.close());
    };
  }, []); // eslint-disable-line

  const addAccount = (name, token) => {
    const newAcc = { id: Date.now().toString(), name, token, active: true, balance: "---", currency: "USD" };
    setAccounts(prev => [...prev, newAcc]);
    connectAccount(newAcc);
    setTimiStatus("Added account: " + name);
  };

  const removeAccount = (id) => {
    if (id === "primary") return;
    wsConnections.current[id]?.close();
    delete wsConnections.current[id];
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const toggleAccount = (id) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const updateToken = (id, newToken) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, token: newToken } : a));
    const acc = accounts.find(a => a.id === id);
    if (acc) connectAccount({ ...acc, token: newToken });
    setTimiStatus("Token updated for account " + id);
  };

  const updateSymbols = (syms) => {
    activeSymbolsRef.current = syms;
    setActiveSymbols(syms);
    candles1m.current = {};
    candles5m.current = {};
    setSignals({});
    syms.forEach(sym => {
      send({ ticks: sym, subscribe: 1 });
      send({ ticks_history: sym, adjust_start_time: 1, count: 100, end: "latest", granularity: 60, style: "candles" });
      send({ ticks_history: sym, adjust_start_time: 1, count: 50, end: "latest", granularity: 300, style: "candles" });
    });
  };

  return {
    balance, ticks, signals, openTrades, tradeHistory, timiStatus,
    autoTrade, setAutoTrade, activeSymbols, updateSymbols,
    accounts, addAccount, removeAccount, toggleAccount, updateToken,
    manualTrade, closeTrade, closeAllTrades,
    takeProfitTarget, setTakeProfitTarget, dailyPnl
  };
}
