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
    u.rate = 1.05; u.pitch = 1.05; u.volume = 1;
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const preferred = voices.find(v => v.name.includes("Google") || v.lang === "en-US");
    if (preferred) u.voice = preferred;
    window.speechSynthesis?.speak(u);
  } catch(e) { console.error("TTS error:", e); }
}

async function askClaude(userMessage, context) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 150,
        system: `You are TIMI, an intelligent AI trading assistant built into a Deriv trading bot app. 
You are helpful, concise, and speak naturally (your responses will be read aloud, keep under 3 sentences).
Current context: Balance $${context.balance}, Daily P&L $${context.dailyPnl}, Open trades: ${context.openTrades}, Auto trading: ${context.autoTrade ? "ACTIVE" : "PAUSED"}, Win rate: ${context.winRate}%, Recent trades: ${context.recentTrades}.
You know about forex, synthetic indices, RSI, MACD, Bollinger Bands, EMA, and trading psychology.
Keep responses SHORT and NATURAL — you are speaking, not writing.`,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text || "I'm not sure about that. Try asking about your balance or trading performance.";
  } catch(e) {
    return "Sorry, I'm having trouble connecting right now.";
  }
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
  }, []);

  const getContext = useCallback(async () => {
    const d = derivData || {};
    let recentTrades = "none";
    try {
      const { data } = await supabase.from("trades").select("symbol,type,pnl,result").order("created_at", { ascending: false }).limit(5);
      if (data?.length) recentTrades = data.map(t => `${t.result} ${t.type} ${t.symbol} $${t.pnl}`).join(", ");
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
      recentTrades,
    };
  }, [derivData]);

  const handleCommand = useCallback(async (cmd) => {
    const t = cmd.toLowerCase().trim();
    if (!t || t.length < 2) return;
    setTranscript(cmd);

    const reply = (text) => {
      setResponse(text); speak(text);
      setTimeout(() => setResponse(""), 8000);
    };

    if (t.includes("start trad") || t.includes("trade on") || t.includes("enable trad")) {
      derivData?.setAutoTrade?.(true);
      return reply("Auto trading is now active. TIMI is watching the markets.");
    }
    if (t.includes("stop trad") || t.includes("pause trad") || t.includes("trade off")) {
      derivData?.setAutoTrade?.(false);
      return reply("Auto trading paused. I'll stop opening new positions.");
    }
    if (t.includes("balance")) {
      return reply(`Your current balance is $${parseFloat(derivData?.balance?.balance || 0).toFixed(2)}.`);
    }
    if (t.includes("profit") || t.includes("pnl") || t.includes("today")) {
      return reply(`Today's profit and loss is $${parseFloat(derivData?.dailyPnl || 0).toFixed(2)}.`);
    }
    if (t.includes("open trade") || t.includes("how many trade")) {
      const count = derivData?.openTrades?.length || 0;
      return reply(`You have ${count} open trade${count !== 1 ? "s" : ""} right now.`);
    }

    setThinking(true);
    speak("Let me think about that.");
    try {
      const context = await getContext();
      const aiReply = await askClaude(cmd, context);
      reply(aiReply);
    } catch {
      reply("I had trouble with that. Try asking about your balance or trading status.");
    }
    setThinking(false);
  }, [derivData, getContext]);

  const startRec = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setMicError("Speech recognition not supported."); return; }
    try { recRef.current?.abort(); } catch {}
    clearTimeout(restartTimer.current);

    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 5; rec.lang = "en-US";

    rec.onstart = () => { setListening(true); setMicError(""); };

    rec.onresult = (e) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      const text = (final || interim).trim();
      if (!text) return;
      setTranscript(text);
      const allAlts = [];
      for (let i = e.resultIndex; i < e.results.length; i++)
        for (let j = 0; j < e.results[i].length; j++) allAlts.push(e.results[i][j].transcript);
      const woke = allAlts.some(a => matchesWakeWord(a));
      if (woke && !awakeRef.current) {
        awakeRef.current = true; setAwake(true);
        speak("Yes? I'm listening."); setResponse("Yes? I'm listening.");
        clearTimeout(awakeTimer.current);
        awakeTimer.current = setTimeout(() => {
          awakeRef.current = false; setAwake(false); setTranscript(""); setResponse("");
        }, 15000);
        return;
      }
      if (awakeRef.current && final) {
        const cmd = final.replace(new RegExp(WAKE_WORDS.join("|"), "gi"), "").trim();
        if (cmd.length > 1) {
          clearTimeout(awakeTimer.current); awakeRef.current = false; setAwake(false);
          handleCommand(cmd);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setMicError("Microphone permission denied. Allow mic in settings."); setListening(false); activeRef.current = false; return;
      }
      if (activeRef.current) restartTimer.current = setTimeout(() => { if (activeRef.current) startRec(); }, 1000);
    };

    rec.onend = () => {
      if (activeRef.current) restartTimer.current = setTimeout(() => { if (activeRef.current) startRec(); }, 300);
      else setListening(false);
    };

    recRef.current = rec;
    try { rec.start(); } catch {
      if (activeRef.current) restartTimer.current = setTimeout(() => { if (activeRef.current) startRec(); }, 1500);
    }
  }, [handleCommand]);

  const startListening = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError("Microphone permission denied. Allow mic access in phone settings."); return;
    }
    activeRef.current = true; setMicError(""); startRec();
  }, [startRec]);

  const stopListening = useCallback(() => {
    activeRef.current = false; awakeRef.current = false;
    setAwake(false); setListening(false); setTranscript(""); setResponse("");
    clearTimeout(awakeTimer.current); clearTimeout(restartTimer.current);
    try { recRef.current?.abort(); } catch {};
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
