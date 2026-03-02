import { supabase } from "../lib/supabase";
import { Preferences } from "@capacitor/preferences";
import { storageSet, storageGet } from "../lib/storage";
import { useState, useEffect, useRef } from "react";


async function pSet(key, value) {
  const v = JSON.stringify(value);
  try { await Preferences.set({ key, value: v }); } catch {}
  try { localStorage.setItem(key, v); } catch {}
}
async function pGet(key, fallback = null) {
  try { const { value } = await Preferences.get({ key }); if (value != null) return JSON.parse(value); } catch {}
  try { const v = localStorage.getItem(key); if (v) return JSON.parse(v); } catch {}
  return fallback;
}
function pGetSync(key, fallback = null) {
  try { const v = localStorage.getItem(key); if (v) return JSON.parse(v); } catch {}
  return fallback;
}

const APP_ID = "61331";
const MAX_TRADES = 3;
// Risk params loaded from localStorage
function loadRiskParams() {
  try { return pGetSync("timi_risk", { riskPct: 2, maxTrades: 3, minConfidence: 45, duration: 5 }); }
  catch { return { riskPct: 2, maxTrades: 3, minConfidence: 45, duration: 5 }; }
}

// ══════════════════════════════════════════════
// TECHNICAL INDICATORS
// ══════════════════════════════════════════════
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
  const signal = calcEMA([macd], 9);
  return { macd, signal, hist: macd - signal };
}
function calcBB(prices, period = 20) {
  const sl = prices.slice(-period);
  const mean = sl.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean, std };
}
function calcStoch(candles, period = 14) {
  if (candles.length < period) return 50;
  const sl = candles.slice(-period);
  const close = parseFloat(candles[candles.length - 1].close);
  const high = Math.max(...sl.map(c => parseFloat(c.high)));
  const low = Math.min(...sl.map(c => parseFloat(c.low)));
  return ((close - low) / (high - low || 1)) * 100;
}
function calcATR(candles, period = 14) {
  if (candles.length < period) return 0;
  const trs = candles.slice(-period).map((c, i, arr) => {
    if (i === 0) return parseFloat(c.high) - parseFloat(c.low);
    return Math.max(
      parseFloat(c.high) - parseFloat(c.low),
      Math.abs(parseFloat(c.high) - parseFloat(arr[i-1].close)),
      Math.abs(parseFloat(c.low) - parseFloat(arr[i-1].close))
    );
  });
  return trs.reduce((a, b) => a + b, 0) / period;
}

// ══════════════════════════════════════════════
// CANDLESTICK PATTERN RECOGNITION
// ══════════════════════════════════════════════
function detectPatterns(candles) {
  if (candles.length < 3) return [];
  const patterns = [];
  const c = candles[candles.length - 1];
  const p = candles[candles.length - 2];
  const p2 = candles[candles.length - 3];

  const open = parseFloat(c.open), close = parseFloat(c.close);
  const high = parseFloat(c.high), low = parseFloat(c.low);
  const pOpen = parseFloat(p.open), pClose = parseFloat(p.close);
  const body = Math.abs(close - open);
  const pBody = Math.abs(pClose - pOpen);
  const range = high - low;
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;

  // Doji
  if (body < range * 0.1) patterns.push({ name: "Doji", type: "neutral", strength: 1 });

  // Hammer (bullish reversal)
  if (lowerWick > body * 2 && upperWick < body * 0.5 && close > open)
    patterns.push({ name: "Hammer", type: "bullish", strength: 2 });

  // Shooting Star (bearish reversal)
  if (upperWick > body * 2 && lowerWick < body * 0.5 && close < open)
    patterns.push({ name: "Shooting Star", type: "bearish", strength: 2 });

  // Bullish Engulfing
  if (close > pOpen && open < pClose && pClose < pOpen && body > pBody * 1.5)
    patterns.push({ name: "Bullish Engulfing", type: "bullish", strength: 3 });

  // Bearish Engulfing
  if (close < pOpen && open > pClose && pClose > pOpen && body > pBody * 1.5)
    patterns.push({ name: "Bearish Engulfing", type: "bearish", strength: 3 });

  // Morning Star (bullish)
  const p2Close = parseFloat(p2.close), p2Open = parseFloat(p2.open);
  if (p2Close < p2Open && pBody < p2Close * 0.01 && close > open && close > (p2Open + p2Close) / 2)
    patterns.push({ name: "Morning Star", type: "bullish", strength: 3 });

  // Evening Star (bearish)
  if (p2Close > p2Open && pBody < p2Open * 0.01 && close < open && close < (p2Open + p2Close) / 2)
    patterns.push({ name: "Evening Star", type: "bearish", strength: 3 });

  // Three White Soldiers (bullish)
  const p3 = candles[candles.length - 4];
  if (p3 && close > open && pClose > pOpen && p2Close > p2Open &&
      close > pClose && pClose > p2Close && p2Close > parseFloat(p3.close))
    patterns.push({ name: "3 White Soldiers", type: "bullish", strength: 4 });

  // Three Black Crows (bearish)
  if (p3 && close < open && pClose < pOpen && p2Close < p2Open &&
      close < pClose && pClose < p2Close && p2Close < parseFloat(p3.close))
    patterns.push({ name: "3 Black Crows", type: "bearish", strength: 4 });

  return patterns;
}

// ══════════════════════════════════════════════
// SUPPORT & RESISTANCE
// ══════════════════════════════════════════════
function findSRLevels(candles, lookback = 30) {
  if (candles.length < lookback) return { support: [], resistance: [] };
  const recent = candles.slice(-lookback);
  const highs = recent.map(c => parseFloat(c.high));
  const lows = recent.map(c => parseFloat(c.low));
  const price = parseFloat(candles[candles.length - 1].close);

  const resistance = highs
    .filter((h, i) => h > highs[i-1] && h > highs[i+1] && h > price)
    .sort((a, b) => a - b).slice(0, 3);
  const support = lows
    .filter((l, i) => l < lows[i-1] && l < lows[i+1] && l < price)
    .sort((a, b) => b - a).slice(0, 3);

  return { support, resistance };
}

// ══════════════════════════════════════════════
// SESSION AWARENESS
// ══════════════════════════════════════════════
function getTradingSession() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const sessions = {
    sydney:  { start: 21, end: 6,  strength: 1 },
    tokyo:   { start: 0,  end: 9,  strength: 2 },
    london:  { start: 8,  end: 16, strength: 4 },
    newYork: { start: 13, end: 22, strength: 4 },
  };

  const active = [];
  Object.entries(sessions).forEach(([name, s]) => {
    const inSession = s.start < s.end
      ? utcHour >= s.start && utcHour < s.end
      : utcHour >= s.start || utcHour < s.end;
    if (inSession) active.push({ name, strength: s.strength });
  });

  const overlap = active.length > 1;
  const maxStrength = active.reduce((m, s) => Math.max(m, s.strength), 0);
  return { active, overlap, strength: maxStrength, names: active.map(s => s.name).join("+") };
}

// ══════════════════════════════════════════════
// MARTINGALE / ANTI-MARTINGALE ENGINE
// ══════════════════════════════════════════════
function getMartingaleStake(baseStake, tradeHistory, mode = "anti") {
  if (tradeHistory.length === 0) return baseStake;
  const last = tradeHistory[0];
  if (mode === "martingale") {
    // Double after loss to recover
    if (last.result === "LOSS") return Math.min(baseStake * 2, baseStake * 4);
    return baseStake;
  } else {
    // Anti-martingale: increase after win, reduce after loss
    if (last.result === "WIN") return baseStake * 1.5;
    if (last.result === "LOSS") return baseStake * 0.75;
    return baseStake;
  }
}

// ══════════════════════════════════════════════
// MASTER SIGNAL ENGINE
// ══════════════════════════════════════════════
function getSignal(candles1m, candles5m) {
  if (!candles1m || candles1m.length < 30) return { action: "HOLD", confidence: 0, reasons: [], patterns: [] };

  const closes = candles1m.map(c => parseFloat(c.close));
  const ema9 = calcEMA(closes, 9);
  const ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes.slice(-60), 50);
  const rsi = calcRSI(closes);
  const bb = calcBB(closes);
  const macd = calcMACD(closes);
  const stoch = calcStoch(candles1m);
  const atr = calcATR(candles1m);
  const price = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  const patterns = detectPatterns(candles1m);
  const sr = findSRLevels(candles1m);
  const session = getTradingSession();

  let score = 0;
  const reasons = [];

  // 1. EMA trend
  if (ema9 > ema21 && ema21 > ema50) { score += 2; reasons.push("EMA bullish stack"); }
  else if (ema9 < ema21 && ema21 < ema50) { score -= 2; reasons.push("EMA bearish stack"); }

  // 2. EMA crossover
  if (prev < ema9 && price > ema9 && ema9 > ema21) { score += 2; reasons.push("EMA9 cross UP"); }
  else if (prev > ema9 && price < ema9 && ema9 < ema21) { score -= 2; reasons.push("EMA9 cross DOWN"); }

  // 3. RSI
  if (rsi < 30) { score += 2.5; reasons.push("RSI oversold " + rsi.toFixed(0)); }
  else if (rsi < 45) { score += 1; reasons.push("RSI bullish zone"); }
  else if (rsi > 70) { score -= 2.5; reasons.push("RSI overbought " + rsi.toFixed(0)); }
  else if (rsi > 55) { score -= 1; reasons.push("RSI bearish zone"); }

  // 4. MACD
  if (macd.hist > 0 && macd.macd > macd.signal) { score += 1.5; reasons.push("MACD bullish"); }
  else if (macd.hist < 0 && macd.macd < macd.signal) { score -= 1.5; reasons.push("MACD bearish"); }

  // 5. Bollinger Bands
  if (price < bb.lower) { score += 2; reasons.push("Price below BB"); }
  else if (price > bb.upper) { score -= 2; reasons.push("Price above BB"); }
  else if (price > bb.mid) { score += 0.5; }
  else { score -= 0.5; }

  // 6. Stochastic
  if (stoch < 20) { score += 1.5; reasons.push("Stoch oversold"); }
  else if (stoch > 80) { score -= 1.5; reasons.push("Stoch overbought"); }

  // 7. Candlestick patterns
  patterns.forEach(p => {
    if (p.type === "bullish") { score += p.strength * 0.5; reasons.push(p.name + " 🕯"); }
    else if (p.type === "bearish") { score -= p.strength * 0.5; reasons.push(p.name + " 🕯"); }
  });

  // 8. S/R levels — avoid if near resistance when buying
  if (score > 0 && sr.resistance.length > 0) {
    const nearResistance = sr.resistance.some(r => Math.abs(r - price) / price < 0.002);
    if (nearResistance) { score *= 0.6; reasons.push("Near resistance — caution"); }
  }
  if (score < 0 && sr.support.length > 0) {
    const nearSupport = sr.support.some(s => Math.abs(s - price) / price < 0.002);
    if (nearSupport) { score *= 0.6; reasons.push("Near support — caution"); }
  }

  // 9. Multi-timeframe 5M
  if (candles5m && candles5m.length >= 20) {
    const c5 = candles5m.map(c => parseFloat(c.close));
    const trend5m = calcEMA(c5, 9) > calcEMA(c5, 21);
    if (trend5m && score > 0) { score += 1; reasons.push("5M confirms BUY"); }
    else if (!trend5m && score < 0) { score += 1; reasons.push("5M confirms SELL"); }
    else { score *= 0.8; reasons.push("5M divergence"); }
  }

  // 10. Session boost — higher confidence during London/NY
  if (session.overlap) { score *= 1.2; reasons.push("Session overlap boost"); }
  else if (session.strength < 2) { score *= 0.8; reasons.push("Low session — reduced"); }

  // 11. Volatility filter
  const bbWidth = (bb.upper - bb.lower) / bb.mid;
  if (bbWidth > 0.06) { score *= 0.7; reasons.push("High volatility filter"); }

  const maxScore = 16;
  const confidence = Math.min(Math.round(Math.abs(score) / maxScore * 100), 99);
  const action = score >= 2 ? "BUY" : score <= -2 ? "SELL" : "HOLD";

  // Track which indicators were active for AI learning
  const activeIndicators = [];
  if (ema9 > ema21) activeIndicators.push("ema_stack");
  if (Math.abs(price - ema9) / ema9 < 0.001) activeIndicators.push("ema_crossover");
  if (rsi < 35 || rsi > 65) activeIndicators.push("rsi");
  if (Math.abs(macd.hist) > 0) activeIndicators.push("macd");
  if (price < bb.lower || price > bb.upper) activeIndicators.push("bollinger");
  if (stoch < 25 || stoch > 75) activeIndicators.push("stochastic");
  if (patterns.length > 0) activeIndicators.push("candlestick_patterns");
  if (session.overlap) activeIndicators.push("session_boost");

  const bbPosition = price < bb.lower ? "below" : price > bb.upper ? "above" : "mid";

  return { action, confidence, reasons, patterns, score: +score.toFixed(2), rsi: +rsi.toFixed(1), atr: +atr.toFixed(5), session, sr, activeIndicators, macd_hist: +macd.hist.toFixed(6), stoch: +stoch.toFixed(1), bb_position: bbPosition, ema_stack: ema9 > ema21 ? "bullish" : "bearish" };
}

// ── Browser Notifications ──
function timiNotify(title, body, type = "info") {
  // In-app toast (window event)
  window.dispatchEvent(new CustomEvent("timi-notification", { detail: { title, body, type } }));
  // Browser push notification if permitted
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: "https://res.cloudinary.com/drefakuj9/image/upload/v1772314893/WhatsApp_Image_2026-02-28_at_10.27.28_PM_ylndjq.jpg",
        badge: "https://res.cloudinary.com/drefakuj9/image/upload/v1772314893/WhatsApp_Image_2026-02-28_at_10.27.28_PM_ylndjq.jpg",
        tag: type,
        requireInteraction: type === "win" || type === "loss",
      });
    } catch(e) {}
  }
}

export default function useDerivWS({ ai } = {}) {
  const [balance, setBalance] = useState({ balance: "---", currency: "USD" });
  const [ticks, setTicks] = useState({});
  const [signals, setSignals] = useState({});
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState(() => {
    try { return pGetSync("timi_trade_history", []); }
    catch { return []; }
  });
  const [timiStatus, setTimiStatus] = useState("Connecting...");
  const [autoTrade, setAutoTrade] = useState(true);
  const [takeProfitTarget, setTakeProfitTarget] = useState(() => {
    try { return parseFloat(pGetSync("timi_tp", 0)); } catch { return 0; }
  });
  const [dailyPnl, setDailyPnl] = useState(() => {
    try {
      const saved = pGetSync("timi_daily_pnl");
      const today = new Date().toDateString();
      if (saved && saved.date === today) return saved.pnl;
      return 0;
    } catch { return 0; }
  });
  const [martingaleMode, setMartingaleMode] = useState("anti"); // "anti" | "martingale" | "fixed"
  const [session, setSession] = useState(getTradingSession());
  const [accounts, setAccounts] = useState(() => {
    try {
      // Try multiple storage locations for Capacitor compatibility
      const saved = pGetSync("timi_accounts", []);
      const FALLBACK_TOKEN = "03WRbkfQGjbZWTH";
      const primary = saved.find(a => a.id === "primary") || 
                      { id: "primary", name: "Primary", token: FALLBACK_TOKEN, active: true, balance: "---", currency: "USD" };
      return saved.find(a => a.id === "primary") ? saved : [primary];
    } catch { return [{ id: "primary", name: "Primary", token: "03WRbkfQGjbZWTH", active: true, balance: "---", currency: "USD" }]; }
  });
  const [activeSymbols, setActiveSymbols] = useState(() => {
    try { return pGetSync("timi_symbols", ["R_75", "R_25", "BOOM1000", "CRASH1000"]); }
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
  const martingaleRef = useRef("anti");
  const wsConnections = useRef({});
  const signalsRef = useRef({});
  const runAnalysisRef = useRef(null);

  useEffect(() => { autoTradeRef.current = autoTrade; }, [autoTrade]);
  useEffect(() => { openTradesRef.current = openTrades; }, [openTrades]);
  useEffect(() => { tradeHistoryRef.current = tradeHistory; }, [tradeHistory]);
  useEffect(() => {
    takeProfitRef.current = takeProfitTarget;
    pSet("timi_tp", takeProfitTarget);
  }, [takeProfitTarget]);
  useEffect(() => { martingaleRef.current = martingaleMode; }, [martingaleMode]);
  useEffect(() => {
    activeSymbolsRef.current = activeSymbols;
    pSet("timi_symbols", activeSymbols);
  }, [activeSymbols]);
  useEffect(() => {
    // Save to multiple places for Capacitor Android compatibility
    pSet("timi_accounts", accounts.map(a => ({ ...a })));
  }, [accounts]);

  const sendTo = (accountId, obj) => {
    const ws = wsConnections.current[accountId];
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  };
  const send = (obj) => sendTo("primary", obj);

  const manualTrade = (sym, direction, stake = null) => {
    const bal = parseFloat(balanceRef.current?.balance || 0);
    const tradeStake = stake || Math.max(1, parseFloat((bal * riskPct).toFixed(2)));
    accounts.filter(a => a.active).forEach(acc => {
      sendTo(acc.id, { proposal: 1, amount: tradeStake, basis: "stake", contract_type: direction === "BUY" ? "CALL" : "PUT", currency: "USD", duration: 5, duration_unit: "m", symbol: sym });
    });
    setTimiStatus("Manual " + direction + " on " + sym + " $" + tradeStake);
  };

  const closeTrade = (contractId) => {
    Object.keys(wsConnections.current).forEach(id => sendTo(id, { sell: contractId, price: 0 }));
  };

  const closeAllTrades = () => {
    openTradesRef.current.forEach(t => {
      Object.keys(wsConnections.current).forEach(id => sendTo(id, { sell: t.contractId, price: 0 }));
    });
    setTimiStatus("🛑 Closing all trades...");
    timiNotify("🛑 TIMI", "Closing all trades", "alert");
  };

  const updateSignalsRef = (sigs) => { signalsRef.current = sigs; };
  const runAnalysis = () => {
    // Update session
    const currentSession = getTradingSession();
    setSession(currentSession);

    // Take profit check
    if (takeProfitRef.current > 0 && dailyPnlRef.current >= takeProfitRef.current) {
      if (autoTradeRef.current) {
        setAutoTrade(false);
        autoTradeRef.current = false;
        setTimiStatus("🎯 Target $" + takeProfitRef.current + " hit! Trading paused.");
        timiNotify("🎯 Take Profit!", "Daily target hit. Trading stopped.", "profit");
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
      const minConf = (() => { try { return pGetSync("timi_risk")?.minConfidence || 45; } catch { return 45; } })();
      if (sig.action !== "HOLD" && sig.confidence >= minConf)
        if (!best || sig.confidence > best.sig.confidence) best = { sym, sig };
    });

    // Apply AI multipliers to signals
    if (ai?.getAIMultiplier) {
      Object.entries(newSigs).forEach(([sym, sig]) => {
        const { multiplier, reasons: aiReasons } = ai.getAIMultiplier({
          activeIndicators: sig.activeIndicators || [],
          session: sig.session?.names || "unknown",
          symbol: sym,
        });
        newSigs[sym] = {
          ...sig,
          aiMultiplier: multiplier,
          confidence: Math.min(99, Math.round(sig.confidence * multiplier)),
          reasons: [...(sig.reasons || []), ...(aiReasons || [])],
        };
        if (sig.action !== "HOLD" && newSigs[sym].confidence >= 45)
          if (!best || newSigs[sym].confidence > (best.sig.confidence || 0)) best = { sym, sig: newSigs[sym] };
      });
    }

    updateSignalsRef(newSigs);
    signalsRef.current = newSigs;
    // Apply AI multiplier to each signal
    if (ai?.getAIMultiplier) {
      best = null; // recalculate with AI
      Object.entries(newSigs).forEach(([sym, sig]) => {
        if (sig.action === "HOLD") return;
        const { multiplier, reasons: aiR } = ai.getAIMultiplier({
          activeIndicators: sig.activeIndicators || [],
          session: sig.session?.names || "unknown",
          symbol: sym,
          action: sig.action,
        });
        newSigs[sym] = {
          ...sig,
          aiMultiplier: multiplier,
          confidence: Math.min(99, Math.round(sig.confidence * multiplier)),
          reasons: [...(sig.reasons || []), ...(aiR || [])],
        };
        const minConf = (() => { try { return pGetSync("timi_risk")?.minConfidence || 45; } catch { return 45; } })();
        if (newSigs[sym].confidence >= minConf)
          if (!best || newSigs[sym].confidence > best.sig.confidence) best = { sym, sig: newSigs[sym] };
      });
      signalsRef.current = newSigs;
      setSignals({ ...newSigs });
    }
    if (!autoTradeRef.current || !best) return;
    if (openTradesRef.current.length >= MAX_TRADES) return;
    if (openTradesRef.current.find(t => t.symbol === best.sym)) return;

    const bal = parseFloat(balanceRef.current?.balance || 0);
    if (!bal || bal < 1) return;

    // Growth-aware stake sizing
    const risk = (() => { try { return pGetSync("timi_risk", {}); } catch { return {}; } })();
    const growth = (() => { try { return pGetSync("timi_compounding", {}); } catch { return {}; } })();
    let riskPct = (risk.riskPct || 2) / 100;

    // If growth tracking is active, adjust risk based on progress
    if (growth.startBalance && growth.dailyTarget) {
      const startBal = parseFloat(growth.startBalance);
      const dailyTarget = parseFloat(growth.dailyTarget) / 100;
      const todayPnl = (() => { try { const d = pGetSync("timi_daily_pnl"); return d?.date === new Date().toDateString() ? d.pnl : 0; } catch { return 0; } })();
      const dailyTargetAmt = startBal * dailyTarget;

      // If already at or past daily target — reduce risk aggressively
      if (todayPnl >= dailyTargetAmt) {
        riskPct = riskPct * 0.3; // Only 30% of normal risk after target hit
      }
      // If halfway to target — slightly reduce risk (protect profits)
      else if (todayPnl >= dailyTargetAmt * 0.6) {
        riskPct = riskPct * 0.7;
      }
      // If in drawdown (negative day) — reduce risk
      else if (todayPnl < -(dailyTargetAmt * 0.5)) {
        riskPct = riskPct * 0.5; // Cut risk in half during drawdown
      }
    }

    const baseStake = Math.max(1, parseFloat((bal * riskPct).toFixed(2)));
    const growthCfg = (() => { try { return pGetSync("timi_compounding", {}); } catch { return {}; } })();
    const aiStake = ai?.getAIStake
      ? ai.getAIStake(baseStake, bal, dailyPnlRef.current, tradeHistoryRef.current, growthCfg)
      : { stake: baseStake, reasons: [] };
    if (aiStake.reasons?.[0]) setTimiStatus("💡 " + aiStake.reasons[0]);
    const rawStake = getMartingaleStake(baseStake, tradeHistoryRef.current, martingaleRef.current);

    // AI stake sizing — growth-aware + streak protection
    const growthConfig = (() => { try { return pGetSync("timi_compounding", {}); } catch { return {}; } })();
    const aiStakeResult = ai?.getAIStake
      ? ai.getAIStake(rawStake, bal, dailyPnlRef.current, tradeHistoryRef.current, growthConfig)
      : { stake: rawStake, reasons: [] };

    const stake = Math.min(aiStakeResult.stake, bal * 0.05);
    if (aiStakeResult.reasons?.length > 0) {
      setTimiStatus("💡 AI: " + aiStakeResult.reasons[0]);
    }

    setTimiStatus(best.sig.action + " " + best.sym + " " + best.sig.confidence + "% | " + (currentSession.names || "off-session"));
    accounts.filter(a => a.active).forEach(acc => {
      sendTo(acc.id, { proposal: 1, amount: stake, basis: "stake", contract_type: best.sig.action === "BUY" ? "CALL" : "PUT", currency: "USD", duration: 5, duration_unit: "m", symbol: best.sym });
    });
  };

  const connectAccount = (account) => {
    wsConnections.current[account.id]?.close();
    const ws = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=" + APP_ID);
    wsConnections.current[account.id] = ws;

    ws.onopen = () => ws.send(JSON.stringify({ authorize: account.token }));

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);

      if (d.msg_type === "authorize" && !d.error) {
        ws.send(JSON.stringify({ balance: 1, account: "current", subscribe: 1 }));
        if (account.id === "primary") {
          setTimiStatus("Authorized! Loading data...");
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
          setTimiStatus("Loaded " + sym + " " + (gran === 60 ? "1M" : "5M") + " candles");
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
        timiNotify("🤖 Trade Open", "[" + account.name + "] " + trade.type + " " + trade.symbol, "trade");
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
          // Capture trade BEFORE removing from ref
          const closedTrade = openTradesRef.current.find(t => t.contractId === poc.contract_id) || {};
          openTradesRef.current = openTradesRef.current.filter(t => t.contractId !== poc.contract_id);
          setOpenTrades([...openTradesRef.current]);
          dailyPnlRef.current += pnl;
          setDailyPnl(p => {
            const newPnl = +(p + pnl).toFixed(2);
            pSet("timi_daily_pnl", { date: new Date().toDateString(), pnl: newPnl });
            dailyPnlRef.current = newPnl;
            return newPnl;
          });
          const currentSess = (() => { try { return getTradingSession().names || "unknown"; } catch { return "unknown"; } })();
          const hist = [{ symbol: poc.underlying, type: poc.contract_type === "CALL" ? "BUY" : "SELL", pnl, result: pnl > 0 ? "WIN" : "LOSS", date: new Date().toLocaleString(), account: account.name, session: currentSess, stake: poc.buy_price || 0 }, ...tradeHistoryRef.current.slice(0, 199)];
          tradeHistoryRef.current = hist;
          setTradeHistory(hist);
          pSet("timi_trade_history", hist);

          // Save trade to Supabase — closedTrade captured before removal above
          const tradeSymbol = poc.underlying || closedTrade.symbol || "UNKNOWN";
          const tradeType   = poc.contract_type === "CALL" ? "BUY" : poc.contract_type === "PUT" ? "SELL" : (closedTrade.type || "BUY");
          const tradeStakeVal = poc.buy_price || closedTrade.stake || 0;
          const lastSig = signalsRef.current?.[tradeSymbol] || {};
          console.log("💾 Saving trade:", tradeSymbol, tradeType, pnl, "acc:", account.name);
          supabase.from("trades").insert([{
            symbol: tradeSymbol,
            type: tradeType,
            stake: tradeStakeVal,
            pnl,
            result: pnl > 0 ? "WIN" : "LOSS",
            session: currentSess,
            confidence: lastSig.confidence || 0,
            account_name: account.name,
          }]).then(({ error }) => {
            if (error) console.error("❌ Supabase save error:", error.message, "symbol:", tradeSymbol);
            else console.log("✅ Trade saved:", tradeSymbol, tradeType, pnl);
          });

          // AI learning
          if (ai?.recordTrade) {
            ai.recordTrade({
              symbol: poc.underlying,
              type: poc.contract_type === "CALL" ? "BUY" : "SELL",
              stake: poc.buy_price || 0, pnl,
              result: pnl > 0 ? "WIN" : "LOSS",
              session: currentSess,
              confidence: lastSig.confidence || 0,
              account: account.name,
            });
          }
          // Update regime
          if (ai?.updateRegime && candles1m.current[poc.underlying]) {
            ai.updateRegime(poc.underlying, candles1m.current[poc.underlying]);
          }
          setTimiStatus((pnl > 0 ? "🟢 WIN" : "🔴 LOSS") + " $" + Math.abs(pnl).toFixed(2) + " [" + account.name + "]");
          timiNotify(pnl > 0 ? "🟢 WIN!" : "🔴 LOSS", "$" + Math.abs(pnl).toFixed(2) + " — " + poc.underlying, pnl > 0 ? "win" : "loss");
          ws.send(JSON.stringify({ balance: 1, account: "current" }));
        }
      }

      if (d.error && !d.error.message?.includes("already subscribed"))
        setTimiStatus("⚠️ [" + account.name + "] " + d.error.message);
    };

    ws.onclose = () => setTimeout(() => connectAccount(account), 5000);
  };

  useEffect(() => {
    accounts.forEach(acc => connectAccount(acc));
    runAnalysisRef.current = runAnalysis;
    const iv = setInterval(() => { runAnalysis(); }, 15000); // 15s fresh call
    const sessIv = setInterval(() => setSession(getTradingSession()), 60000);
    return () => { clearInterval(iv); clearInterval(sessIv); Object.values(wsConnections.current).forEach(ws => ws.close()); };
  }, []); // eslint-disable-line

  const addAccount = (name, token) => {
    const acc = { id: Date.now().toString(), name, token, active: true, balance: "---", currency: "USD" };
    setAccounts(prev => [...prev, acc]);
    connectAccount(acc);
  };
  const removeAccount = (id) => {
    if (id === "primary") return;
    wsConnections.current[id]?.close();
    delete wsConnections.current[id];
    setAccounts(prev => prev.filter(a => a.id !== id));
  };
  const toggleAccount = (id) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const updateToken = (id, token) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, token } : a));
    const acc = accounts.find(a => a.id === id);
    if (acc) connectAccount({ ...acc, token });
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
    takeProfitTarget, setTakeProfitTarget, dailyPnl,
    martingaleMode, setMartingaleMode, session
  };
}
