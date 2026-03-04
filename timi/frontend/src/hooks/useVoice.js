import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

const WAKE_WORDS = [
  "hey timi","timi","timmy","timer","timy","tommy","teme",
  "time me","hey tim","tiny","team","teemy","tee me","jimmy",
  "wake up","hey ai","yo timi","timi trade",
];

function matchesWakeWord(text) {
  const t = text.toLowerCase().trim();
  return WAKE_WORDS.some(w => t.includes(w));
}

function speak(text) {
  try {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0; u.pitch = 1.05; u.volume = 1;
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const preferred = voices.find(v => v.name.includes("Google") && v.lang.startsWith("en"))
      || voices.find(v => v.lang === "en-US") || voices[0];
    if (preferred) u.voice = preferred;
    window.speechSynthesis?.speak(u);
  } catch(e) { console.error("TTS error:", e); }
}

// ── Search Wikipedia ──
async function searchWikipedia(query) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("not found");
    const data = await res.json();
    if (data.extract) {
      // Return first 2 sentences only
      const sentences = data.extract.match(/[^.!?]+[.!?]+/g) || [];
      return sentences.slice(0, 2).join(" ").trim();
    }
  } catch {}
  return null;
}

// ── Search DuckDuckGo Instant Answer ──
async function searchDuckDuckGo(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data.AbstractText && data.AbstractText.length > 20) {
      const sentences = data.AbstractText.match(/[^.!?]+[.!?]+/g) || [];
      return sentences.slice(0, 2).join(" ").trim();
    }
    if (data.Answer && data.Answer.length > 5) return data.Answer;
    if (data.Definition && data.Definition.length > 10) return data.Definition;
    // Try related topics
    if (data.RelatedTopics?.[0]?.Text) return data.RelatedTopics[0].Text.split(" - ")[0];
  } catch {}
  return null;
}

// ── Smart internet search ──
async function searchInternet(query) {
  // Try DuckDuckGo first
  const ddg = await searchDuckDuckGo(query);
  if (ddg) return ddg;
  // Fallback to Wikipedia
  const wiki = await searchWikipedia(query);
  if (wiki) return wiki;
  return null;
}

// ── Local trading AI ──
async function localAI(cmd, context) {
  const t = cmd.toLowerCase().trim();

  // Balance & P&L
  if (t.includes("balance"))
    return `Your current balance is $${context.balance}.`;
  if ((t.includes("profit") || t.includes("pnl") || t.includes("loss")) && !t.includes("stop")) {
    const pnl = parseFloat(context.dailyPnl);
    if (pnl > 0) return `You're up $${context.dailyPnl} today. Great session!`;
    if (pnl < 0) return `You're down $${Math.abs(pnl).toFixed(2)} today. Stay disciplined.`;
    return `No P&L recorded yet today. Balance is $${context.balance}.`;
  }
  if (t.includes("win rate") || t.includes("winning")) {
    const wr = context.winRate;
    if (!wr) return "Not enough trades yet to calculate win rate. Keep trading!";
    if (wr >= 60) return `Your win rate is ${wr}%. Excellent performance!`;
    if (wr >= 50) return `Your win rate is ${wr}%. You're profitable. Keep it consistent.`;
    return `Your win rate is ${wr}%. Aim for above 55% for consistent profitability.`;
  }
  if (t.includes("open trade") || t.includes("how many trade")) {
    const c = context.openTrades;
    return c === 0
      ? "No open trades right now. TIMI is scanning for signals."
      : `You have ${c} open trade${c > 1 ? "s" : ""} running right now.`;
  }
  if (t.includes("recent trade") || t.includes("last trade")) {
    if (context.recentTrades === "none") return "No recent trades found yet.";
    return `Recent trades: ${context.recentTrades}.`;
  }
  if (t.includes("status") || (t.includes("are you") && t.includes("trad"))) {
    return context.autoTrade
      ? "Auto trading is active. I'm scanning every 15 seconds."
      : "Auto trading is paused. Say start trading to resume.";
  }
  if (t.includes("how are you") || t.includes("performance")) {
    const pnl = parseFloat(context.dailyPnl);
    if (pnl > 0) return `Up $${context.dailyPnl} today with ${context.winRate}% win rate. Strategy is working!`;
    if (pnl < 0) return `Down $${Math.abs(pnl).toFixed(2)} today. Win rate: ${context.winRate}%. Adapting strategy.`;
    return `Ready to trade. Balance $${context.balance}. Win rate: ${context.winRate || 0}%.`;
  }

  // Trading knowledge
  if (t.includes("rsi") || t.includes("relative strength"))
    return "RSI measures momentum from 0 to 100. Above 70 is overbought — expect a fall. Below 30 is oversold — expect a rise. TIMI uses RSI to confirm entries.";
  if (t.includes("macd"))
    return "MACD shows trend momentum. When the MACD line crosses above the signal line it's bullish. TIMI weights MACD heavily in its signal scoring.";
  if (t.includes("bollinger"))
    return "Bollinger Bands show volatility. Price at the lower band suggests a bounce up. Price at the upper band suggests a pullback. Great for entry timing.";
  if (t.includes("ema") || t.includes("moving average"))
    return "EMA is Exponential Moving Average. TIMI uses 9, 21, and 50 period EMAs. When shorter EMAs are above longer ones it signals an uptrend.";
  if (t.includes("vix") || t.includes("volatility index"))
    return "VIX indices are synthetic markets simulating volatility. VIX 75 is very volatile with higher risk and reward. VIX 25 is calmer and more predictable.";
  if (t.includes("boom") || t.includes("crash"))
    return "BOOM indices spike upward randomly. CRASH indices spike downward. TIMI watches for spike patterns and momentum to time entries.";
  if (t.includes("martingale"))
    return "Martingale doubles stake after losses. Anti-martingale reduces stake after losses to protect capital. TIMI uses anti-martingale by default for safer growth.";
  if (t.includes("confluence"))
    return "Confluence means multiple indicators agree on direction. TIMI requires at least 3 indicators to align before placing a trade — this filters out weak signals.";
  if (t.includes("risk management"))
    return "Never risk more than 2% per trade. TIMI automatically calculates stake size based on your balance to protect your capital over the long term.";
  if (t.includes("best time") || t.includes("trading session"))
    return "London and New York sessions offer best volatility — 8am to 5pm GMT. Synthetic indices like VIX 75 trade 24 7 so TIMI catches signals around the clock.";
  if (t.includes("tip") || t.includes("advice"))
    return [
      "Consistency beats big wins. Small steady profits compound into large gains.",
      "Never chase losses. TIMI automatically reduces stake during losing streaks.",
      "The market is always right. Follow signals, not emotions.",
      "Diversify across symbols — TIMI monitors multiple markets simultaneously.",
    ][Math.floor(Math.random() * 4)];
  if (t.includes("who are you") || t.includes("what are you"))
    return "I'm TIMI — Trading Intelligence and Market Insights. I trade Deriv synthetic indices automatically using AI-powered technical analysis.";
  if (t.includes("hello") || t.includes("hi ") || t.match(/^hi$/)) {
    const h = new Date().getHours();
    const g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return `${g}! Balance is $${context.balance}. How can I help you?`;
  }
  if (t.includes("thank")) return "You're welcome! I'm always here when you need me.";

  return null; // Signal to search internet
}

export default function useVoice({ derivData } = {}) {
  const [listening,  setListening]  = useState(false);
  const [awake,      setAwake]      = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [micError,   setMicError]   = useState("");
  const [supported,  setSupported]  = useState(false);
  const [thinking,   setThinking]   = useState(false);

  const recRef       = useRef(null);
  const awakeRef     = useRef(false);
  const awakeTimer   = useRef(null);
  const restartTimer = useRef(null);
  const activeRef    = useRef(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
    window.speechSynthesis?.getVoices();
    setTimeout(() => window.speechSynthesis?.getVoices(), 1000);
  }, []);

  const getContext = useCallback(async () => {
    const d = derivData || {};
    let recentTrades = "none";
    try {
      const { data } = await supabase.from("trades")
        .select("symbol,type,pnl,result")
        .order("created_at", { ascending: false }).limit(5);
      if (data?.length)
        recentTrades = data.map(t => `${t.result} ${t.type} ${t.symbol} $${t.pnl}`).join(", ");
    } catch {}
    const history = d.tradeHistory || [];
    const wins = history.filter(t => t.result === "WIN").length;
    const winRate = history.length > 0 ? Math.round(wins / history.length * 100) : 0;
    return {
      balance:     parseFloat(d.balance?.balance || 0).toFixed(2),
      dailyPnl:    parseFloat(d.dailyPnl || 0).toFixed(2),
      openTrades:  d.openTrades?.length || 0,
      autoTrade:   d.autoTrade,
      winRate,
      symbols:     d.activeSymbols,
      recentTrades,
    };
  }, [derivData]);

  const handleCommand = useCallback(async (cmd) => {
    const t = cmd.toLowerCase().trim();
    if (!t || t.length < 2) return;
    setTranscript(cmd);

    const reply = (text) => {
      setResponse(text); speak(text);
      setTimeout(() => setResponse(""), 12000);
    };

    // Instant commands - no async needed
    if (t.includes("start trad") || t.includes("trade on") || t.includes("enable trad") || t.includes("begin trad")) {
      derivData?.setAutoTrade?.(true);
      return reply("Auto trading is now active. TIMI is on the markets.");
    }
    if (t.includes("stop trad") || t.includes("pause trad") || t.includes("trade off") || t.includes("disable trad")) {
      derivData?.setAutoTrade?.(false);
      return reply("Auto trading paused. No new positions will open.");
    }

    setThinking(true);
    speak("Searching for an answer.");

    try {
      const context = await getContext();

      // Try local AI first
      const localReply = await localAI(cmd, context);
      if (localReply) {
        setThinking(false);
        return reply(localReply);
      }

      // Local didn't know — search internet
      setResponse("Searching the internet...");
      const searchResult = await searchInternet(cmd);

      if (searchResult && searchResult.length > 10) {
        setThinking(false);
        return reply(searchResult);
      }

      // Nothing found
      setThinking(false);
      reply(`I searched for "${cmd}" but couldn't find a clear answer. Try rephrasing or ask me about your trading performance.`);

    } catch(e) {
      setThinking(false);
      reply("I had trouble with that search. Try asking about your balance or trading status.");
    }
  }, [derivData, getContext]);

  const startRec = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMicError("Speech recognition not supported on this device."); return; }
    try { recRef.current?.abort(); } catch {}
    clearTimeout(restartTimer.current);

    const rec = new SR();
    rec.continuous = true; rec.interimResults = true;
    rec.maxAlternatives = 5; rec.lang = "en-US";

    rec.onstart  = () => { setListening(true); setMicError(""); };
    rec.onresult = (e) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tx = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += tx; else interim += tx;
      }
      const text = (final || interim).trim();
      if (!text) return;
      setTranscript(text);

      const allAlts = [];
      for (let i = e.resultIndex; i < e.results.length; i++)
        for (let j = 0; j < e.results[i].length; j++)
          allAlts.push(e.results[i][j].transcript);

      const woke = allAlts.some(a => matchesWakeWord(a));
      if (woke && !awakeRef.current) {
        awakeRef.current = true; setAwake(true);
        speak("Yes? I'm listening."); setResponse("Yes? I'm listening.");
        clearTimeout(awakeTimer.current);
        awakeTimer.current = setTimeout(() => {
          awakeRef.current = false; setAwake(false);
          setTranscript(""); setResponse("");
        }, 15000);
        return;
      }
      if (awakeRef.current && final) {
        const cmd = final.replace(new RegExp(WAKE_WORDS.join("|"), "gi"), "").trim();
        if (cmd.length > 1) {
          clearTimeout(awakeTimer.current);
          awakeRef.current = false; setAwake(false);
          handleCommand(cmd);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setMicError("Microphone permission denied. Allow mic in settings.");
        setListening(false); activeRef.current = false; return;
      }
      if (activeRef.current)
        restartTimer.current = setTimeout(() => { if (activeRef.current) startRec(); }, 1000);
    };

    rec.onend = () => {
      if (activeRef.current)
        restartTimer.current = setTimeout(() => { if (activeRef.current) startRec(); }, 300);
      else setListening(false);
    };

    recRef.current = rec;
    try { rec.start(); } catch {
      if (activeRef.current)
        restartTimer.current = setTimeout(() => { if (activeRef.current) startRec(); }, 1500);
    }
  }, [handleCommand]);

  const startListening = useCallback(async () => {
    try {
      // Request mic permission - works on both web and Android
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch(e) {
      console.log("Mic permission error:", e);
      // On Android WebView, permission might be blocked but SR still works
      // Try starting anyway
    }
    activeRef.current = true; setMicError(""); startRec();
  }, [startRec]);

  const stopListening = useCallback(() => {
    activeRef.current = false; awakeRef.current = false;
    setAwake(false); setListening(false); setTranscript(""); setResponse("");
    clearTimeout(awakeTimer.current); clearTimeout(restartTimer.current);
    try { recRef.current?.abort(); } catch {}
    recRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      clearTimeout(awakeTimer.current); clearTimeout(restartTimer.current);
      try { recRef.current?.abort(); } catch {}
    };
  }, []);

  return { listening, awake, transcript, response, supported, micError, thinking, startListening, stopListening };
}
