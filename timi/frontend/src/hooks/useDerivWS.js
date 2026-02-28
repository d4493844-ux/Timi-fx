import { useState, useEffect, useRef } from "react";

const APP_ID = "1089";
const TOKEN = "03WRbkfQGjbZWTH";
const MAX_RISK = 0.02;
const MAX_TRADES = 3;

// ═══════════════════════════════════════
// TECHNICAL ANALYSIS ENGINE
// ═══════════════════════════════════════
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
  const signalLine = calcEMA([macd], 9);
  return { macd, signal: signalLine, hist: macd - signalLine };
}
function calcBB(prices, period = 20) {
  const sl = prices.slice(-period);
  const mean = sl.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean, std };
}
function calcATR(candles, period = 14) {
  if (candles.length < period) return 0;
  const trs = candles.slice(-period).map((c, i, arr) => {
    if (i === 0) return parseFloat(c.high) - parseFloat(c.low);
    const prev = arr[i - 1];
    return Math.max(
      parseFloat(c.high) - parseFloat(c.low),
      Math.abs(parseFloat(c.high) - parseFloat(prev.close)),
      Math.abs(parseFloat(c.low) - parseFloat(prev.close))
    );
  });
  return trs.reduce((a, b) => a + b, 0) / period;
}
function calcStochastic(candles, period = 14) {
  if (candles.length < period) return 50;
  const slice = candles.slice(-period);
  const highs = slice.map(c => parseFloat(c.high));
  const lows = slice.map(c => parseFloat(c.low));
  const close = parseFloat(candles[candles.length - 1].close);
  const highestHigh = Math.max(...highs);
  const lowestLow = Math.min(...lows);
  return ((close - lowestLow) / (highestHigh - lowestLow || 1)) * 100;
}

function getSignal(candles1m, candles5m = null) {
  if (!candles1m || candles1m.length < 30) return { action: "HOLD", confidence: 0, reasons: [] };
  
  const closes1m = candles1m.map(c => parseFloat(c.close));
  const ema9 = calcEMA(closes1m, 9);
  const ema21 = calcEMA(closes1m, 21);
  const ema50 = calcEMA(closes1m.slice(-60), 50);
  const rsi = calcRSI(closes1m);
  const bb = calcBB(closes1m);
  const macd = calcMACD(closes1m);
  const atr = calcATR(candles1m);
  const stoch = calcStochastic(candles1m);
  const price = closes1m[closes1m.length - 1];
  const prev = closes1m[closes1m.length - 2];
  const prev2 = closes1m[closes1m.length - 3];

  let score = 0;
  const reasons = [];

  // 1. EMA Stack (trend direction)
  if (ema9 > ema21 && ema21 > ema50) { score += 2; reasons.push("EMA bullish stack"); }
  else if (ema9 < ema21 && ema21 < ema50) { score -= 2; reasons.push("EMA bearish stack"); }

  // 2. EMA Crossover (momentum entry)
  if (prev2 < ema9 && prev < ema9 && price > ema9 && ema9 > ema21) { score += 2; reasons.push("EMA9 bullish cross"); }
  if (prev2 > ema9 && prev > ema9 && price < ema9 && ema9 < ema21) { score -= 2; reasons.push("EMA9 bearish cross"); }

  // 3. RSI
  if (rsi < 30) { score += 2; reasons.push("RSI oversold " + rsi.toFixed(0)); }
  else if (rsi < 45) { score += 1; reasons.push("RSI bullish " + rsi.toFixed(0)); }
  else if (rsi > 70) { score -= 2; reasons.push("RSI overbought " + rsi.toFixed(0)); }
  else if (rsi > 55) { score -= 1; reasons.push("RSI bearish " + rsi.toFixed(0)); }

  // 4. MACD
  if (macd.hist > 0 && macd.macd > macd.signal) { score += 1.5; reasons.push("MACD bullish"); }
  else if (macd.hist < 0 && macd.macd < macd.signal) { score -= 1.5; reasons.push("MACD bearish"); }

  // 5. Bollinger Bands
  if (price < bb.lower) { score += 1.5; reasons.push("Below BB — reversal"); }
  else if (price > bb.upper) { score -= 1.5; reasons.push("Above BB — reversal"); }
  else if (price > bb.mid && price < bb.upper) { score += 0.5; reasons.push("BB mid-upper"); }

  // 6. Stochastic
  if (stoch < 20) { score += 1; reasons.push("Stoch oversold " + stoch.toFixed(0)); }
  else if (stoch > 80) { score -= 1; reasons.push("Stoch overbought " + stoch.toFixed(0)); }

  // 7. Multi-timeframe confirmation (5M)
  if (candles5m && candles5m.length >= 20) {
    const closes5m = candles5m.map(c => parseFloat(c.close));
    const ema9_5m = calcEMA(closes5m, 9);
    const ema21_5m = calcEMA(closes5m, 21);
    const rsi5m = calcRSI(closes5m);
    if (ema9_5m > ema21_5m) { score += 1; reasons.push("5M trend bullish"); }
    else { score -= 1; reasons.push("5M trend bearish"); }
    if (rsi5m < 50 && score > 0) score -= 0.5;
    if (rsi5m > 50 && score < 0) score += 0.5;
  }

  // 8. Volatility filter — avoid trading in extremely high volatility
  const bbWidth = (bb.upper - bb.lower) / bb.mid;
  if (bbWidth > 0.05) { score *= 0.7; reasons.push("High volatility — reduced"); }

  const maxScore = 12;
  const confidence = Math.min(Math.round(Math.abs(score) / maxScore * 100), 99);
  const action = score >= 2 ? "BUY" : score <= -2 ? "SELL" : "HOLD";

  return { action, confidence, reasons, score: +score.toFixed(2), rsi: +rsi.toFixed(1), atr: +atr.toFixed(5) };
}

// ═══════════════════════════════════════
// NEWS SENTIMENT ENGINE
// ═══════════════════════════════════════
const NEWS_FEEDS = [
  "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bloomberg.com/markets/news.rss",
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.forexlive.com/feed/news",
];
const BULLISH_WORDS = ["surge","rally","gain","rise","bull","strong","positive","growth","boost","high","beat","exceed","recovery","optimism"];
const BEARISH_WORDS = ["fall","drop","crash","decline","bear","weak","negative","loss","cut","low","miss","recession","fear","risk","sell"];

async function fetchNewsSentiment() {
  try {
    const results = await Promise.allSettled(
      NEWS_FEEDS.map(url => fetch(url).then(r => r.json()))
    );
    let bullScore = 0, bearScore = 0, headlines = [];
    results.forEach(r => {
      if (r.status === "fulfilled" && r.value.items) {
        r.value.items.slice(0, 5).forEach(item => {
          const text = (item.title + " " + (item.description || "")).toLowerCase();
          headlines.push(item.title);
          BULLISH_WORDS.forEach(w => { if (text.includes(w)) bullScore++; });
          BEARISH_WORDS.forEach(w => { if (text.includes(w)) bearScore++; });
        });
      }
    });
    const total = bullScore + bearScore || 1;
    return {
      sentiment: bullScore > bearScore ? "BULLISH" : bearScore > bullScore ? "BEARISH" : "NEUTRAL",
      score: ((bullScore - bearScore) / total * 100).toFixed(0),
      bullScore, bearScore, headlines: headlines.slice(0, 5)
    };
  } catch {
    return { sentiment: "NEUTRAL", score: 0, bullScore: 0, bearScore: 0, headlines: [] };
  }
}

// ═══════════════════════════════════════
// ML WIN RATE TRACKER
// ═══════════════════════════════════════
function getMLAdjustment(tradeHistory) {
  if (tradeHistory.length < 5) return { multiplier: 1, note: "Learning..." };
  const recent = tradeHistory.slice(0, 10);
  const wins = recent.filter(t => t.result === "WIN").length;
  const winRate = wins / recent.length;
  if (winRate >= 0.7) return { multiplier: 1.3, note: "Hot streak — increasing stake" };
  if (winRate >= 0.5) return { multiplier: 1.0, note: "Stable" };
  if (winRate >= 0.3) return { multiplier: 0.7, note: "Cooling down — reducing stake" };
  return { multiplier: 0.5, note: "Cold streak — minimal stake" };
}

export default function useDerivWS() {
  const [balance, setBalance] = useState({ balance: "---", currency: "USD" });
  const [ticks, setTicks] = useState({});
  const [signals, setSignals] = useState({});
  const [openTrades, setOpenTrades] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [timiStatus, setTimiStatus] = useState("Connecting...");
  const [autoTrade, setAutoTrade] = useState(true);
  const [newsSentiment, setNewsSentiment] = useState({ sentiment: "NEUTRAL", score: 0, headlines: [] });
  const [mlStats, setMlStats] = useState({ multiplier: 1, note: "Learning..." });
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
  const wsRef = useRef(null);
  const sentimentRef = useRef({ sentiment: "NEUTRAL", score: 0 });

  useEffect(() => { autoTradeRef.current = autoTrade; }, [autoTrade]);
  useEffect(() => { openTradesRef.current = openTrades; }, [openTrades]);
  useEffect(() => { tradeHistoryRef.current = tradeHistory; }, [tradeHistory]);
  useEffect(() => {
    activeSymbolsRef.current = activeSymbols;
    localStorage.setItem("timi_symbols", JSON.stringify(activeSymbols));
  }, [activeSymbols]);

  const send = (obj) => {
    if (wsRef.current?.readyState === WebSocket.OPEN)
      wsRef.current.send(JSON.stringify(obj));
  };

  const runAnalysis = () => {
    const syms = activeSymbolsRef.current;
    const newSigs = {};
    let best = null;

    syms.forEach(sym => {
      const c1m = candles1m.current[sym];
      const c5m = candles5m.current[sym];
      if (!c1m || c1m.length < 30) return;
      const sig = getSignal(c1m, c5m);

      // News sentiment adjustment
      const news = sentimentRef.current;
      let adjustedScore = sig.score;
      if (news.sentiment === "BULLISH" && sig.action === "BUY") adjustedScore *= 1.2;
      if (news.sentiment === "BEARISH" && sig.action === "SELL") adjustedScore *= 1.2;
      if (news.sentiment === "BEARISH" && sig.action === "BUY") adjustedScore *= 0.7;
      if (news.sentiment === "BULLISH" && sig.action === "SELL") adjustedScore *= 0.7;

      const finalSig = { ...sig, score: +adjustedScore.toFixed(2), newsAdjusted: news.sentiment !== "NEUTRAL" };
      newSigs[sym] = finalSig;

      if (finalSig.action !== "HOLD" && finalSig.confidence >= 45)
        if (!best || finalSig.confidence > best.sig.confidence) best = { sym, sig: finalSig };
    });

    setSignals({ ...newSigs });

    if (!autoTradeRef.current || !best) return;
    if (openTradesRef.current.length >= MAX_TRADES) return;
    if (openTradesRef.current.find(t => t.symbol === best.sym)) return;

    const bal = parseFloat(balanceRef.current?.balance || 0);
    if (!bal || bal < 1) return;

    // ML-adjusted stake
    const ml = getMLAdjustment(tradeHistoryRef.current);
    setMlStats(ml);
    const baseStake = bal * MAX_RISK;
    const stake = Math.max(1, Math.min(parseFloat((baseStake * ml.multiplier).toFixed(2)), bal * 0.05));

    setTimiStatus(best.sig.action + " " + best.sym + " @ " + best.sig.confidence + "% conf | " + ml.note);
    send({
      proposal: 1, amount: stake, basis: "stake",
      contract_type: best.sig.action === "BUY" ? "CALL" : "PUT",
      currency: "USD", duration: 5, duration_unit: "m", symbol: best.sym
    });
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

        if (d.msg_type === "authorize" && !d.error) {
          setTimiStatus("Authorized! Loading market data...");
          ws.send(JSON.stringify({ balance: 1, account: "current", subscribe: 1 }));
          activeSymbolsRef.current.forEach(sym => {
            ws.send(JSON.stringify({ ticks: sym, subscribe: 1 }));
            // 1M candles
            ws.send(JSON.stringify({ ticks_history: sym, adjust_start_time: 1, count: 100, end: "latest", granularity: 60, style: "candles" }));
            // 5M candles for multi-timeframe
            ws.send(JSON.stringify({ ticks_history: sym, adjust_start_time: 1, count: 50, end: "latest", granularity: 300, style: "candles" }));
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
          const gran = d.echo_req?.granularity;
          if (sym) {
            if (gran === 60) {
              candles1m.current[sym] = d.candles;
              setTimiStatus("1M loaded: " + sym);
            } else if (gran === 300) {
              candles5m.current[sym] = d.candles;
              setTimiStatus("5M loaded: " + sym);
            }
            setTimeout(runAnalysis, 500);
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
          setTimiStatus("✅ TRADE OPEN: " + trade.type + " " + trade.symbol + " $" + trade.stake);
          if (window.timiNotify) window.timiNotify("🤖 TIMI Opened Trade", trade.type + " " + trade.symbol + " — $" + trade.stake, "trade");
          ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: trade.contractId, subscribe: 1 }));
        }

        if (d.msg_type === "proposal_open_contract" && d.proposal_open_contract) {
          const poc = d.proposal_open_contract;
          setOpenTrades(p => p.map(t => t.contractId === poc.contract_id
            ? { ...t, pnl: parseFloat(poc.profit || 0), status: poc.status, currentSpot: poc.current_spot }
            : t
          ));
          if (poc.is_sold || poc.status === "sold") {
            const pnl = parseFloat(poc.profit || 0);
            openTradesRef.current = openTradesRef.current.filter(t => t.contractId !== poc.contract_id);
            setOpenTrades([...openTradesRef.current]);
            const newHistory = [{
              symbol: poc.underlying, type: poc.contract_type === "CALL" ? "BUY" : "SELL",
              pnl, result: pnl > 0 ? "WIN" : "LOSS", date: new Date().toLocaleTimeString(),
              confidence: signals[poc.underlying]?.confidence || 0
            }, ...tradeHistoryRef.current.slice(0, 49)];
            tradeHistoryRef.current = newHistory;
            setTradeHistory(newHistory);
            setMlStats(getMLAdjustment(newHistory));
            setTimiStatus((pnl > 0 ? "🟢 WIN" : "🔴 LOSS") + " $" + Math.abs(pnl).toFixed(2) + " on " + poc.underlying);
            if (window.timiNotify) window.timiNotify(pnl > 0 ? "🟢 TIMI WIN!" : "🔴 TIMI LOSS", "$" + Math.abs(pnl).toFixed(2) + " — " + poc.underlying, pnl > 0 ? "win" : "loss");
            ws.send(JSON.stringify({ balance: 1, account: "current" }));
          }
        }

        if (d.error && !d.error.message?.includes("already subscribed"))
          setTimiStatus("⚠️ " + d.error.message);
      };

      ws.onclose = () => {
        setTimiStatus("Reconnecting...");
        reconnectTimer = setTimeout(connect, 5000);
      };
    };

    connect();
    const analysisInterval = setInterval(runAnalysis, 30000);

    // Fetch news every 15 minutes
    const fetchNews = async () => {
      const sentiment = await fetchNewsSentiment();
      sentimentRef.current = sentiment;
      setNewsSentiment(sentiment);
      setTimiStatus("News: " + sentiment.sentiment + " (" + sentiment.score + "%)");
    };
    fetchNews();
    const newsInterval = setInterval(fetchNews, 15 * 60 * 1000);

    return () => {
      clearInterval(analysisInterval);
      clearInterval(newsInterval);
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []); // eslint-disable-line

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
    setTimiStatus("Switched to " + syms.length + " markets...");
  };

  return { balance, ticks, signals, openTrades, tradeHistory, timiStatus, autoTrade, setAutoTrade, activeSymbols, updateSymbols, newsSentiment, mlStats };
}
