import { useState, useEffect, useRef, useCallback } from "react";

// ── Wake word variants (catches mishearing of "TIMI") ──
const WAKE_VARIANTS = ["timi", "timmy", "timer", "timy", "tommy", "teme", "time me", "chimney", "hey tim", "tme"];

const COMMANDS = {
  balance: ["balance", "how much", "portfolio", "money", "funds"],
  signals: ["signal", "signals", "what should i", "what do you think", "analyse", "analyze", "recommendation"],
  buy: ["buy", "long", "call", "purchase"],
  sell: ["sell", "short", "put"],
  close: ["close all", "stop all", "exit all", "emergency", "close trades"],
  stop: ["stop trading", "pause trading", "pause", "stop auto", "halt"],
  start: ["start trading", "resume", "start auto", "begin trading", "go"],
  news: ["news", "latest", "what's happening", "market news", "headlines"],
  status: ["status", "how are you", "report", "update", "what's going on"],
  help: ["help", "what can you do", "commands", "how do i"],
};

const SYMBOL_MAP = {
  "vix 75": "R_75", "vix75": "R_75", "r75": "R_75", "seventy five": "R_75",
  "vix 25": "R_25", "vix25": "R_25", "r25": "R_25", "twenty five": "R_25",
  "vix 50": "R_50", "vix50": "R_50", "r50": "R_50",
  "boom 1000": "BOOM1000", "boom1000": "BOOM1000", "boom": "BOOM1000", "boom thousand": "BOOM1000",
  "boom 500": "BOOM500", "boom500": "BOOM500", "boom five hundred": "BOOM500",
  "crash 1000": "CRASH1000", "crash1000": "CRASH1000", "crash": "CRASH1000", "crash thousand": "CRASH1000",
  "crash 500": "CRASH500", "crash500": "CRASH500",
  "euro": "frxEURUSD", "eurusd": "frxEURUSD", "eur usd": "frxEURUSD", "euro dollar": "frxEURUSD",
  "bitcoin": "cryBTCUSD", "btc": "cryBTCUSD",
};

const SYMBOL_NAMES = {
  R_75: "VIX 75", R_25: "VIX 25", R_50: "VIX 50",
  BOOM1000: "BOOM 1000", BOOM500: "BOOM 500",
  CRASH1000: "CRASH 1000", CRASH500: "CRASH 500",
  frxEURUSD: "EUR/USD", cryBTCUSD: "Bitcoin"
};

function speak(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05; u.pitch = 0.9; u.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes("Google") || v.name.includes("Daniel") ||
    v.name.includes("Alex") || v.name.includes("Samantha")
  );
  if (preferred) u.voice = preferred;
  window.speechSynthesis.speak(u);
}

async function fetchNewsHeadline() {
  try {
    const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bloomberg.com/markets/news.rss");
    const data = await res.json();
    if (data.items && data.items[0]) return data.items[0].title;
  } catch {}
  return "Unable to fetch news right now";
}

function isWakeWord(text) {
  return WAKE_VARIANTS.some(v => text.includes(v));
}

export default function useVoice({ balance, signals, autoTrade, setAutoTrade, manualTrade, closeAllTrades }) {
  const [listening, setListening] = useState(false);
  const [awake, setAwake] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [supported, setSupported] = useState(false);
  const [micError, setMicError] = useState("");

  const recognitionRef = useRef(null);
  const awakeTimerRef = useRef(null);
  const awakeRef = useRef(false);
  const listeningRef = useRef(false);
  const restartTimerRef = useRef(null);
  const retryCountRef = useRef(0);

  // ── Build recognition instance ──
  const buildRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;       // catches partial speech — more responsive
    rec.maxAlternatives = 3;         // consider 3 alternatives for better wake-word matching
    rec.lang = "en-US";
    return rec;
  }, []);

  // ── Auto restart on any stop/error ──
  const scheduleRestart = useCallback((delay = 300) => {
    clearTimeout(restartTimerRef.current);
    if (!listeningRef.current) return;
    restartTimerRef.current = setTimeout(() => {
      if (!listeningRef.current) return;
      try {
        recognitionRef.current?.stop();
        setTimeout(() => {
          if (!listeningRef.current) return;
          try {
            recognitionRef.current?.start();
            retryCountRef.current = 0;
            setMicError("");
          } catch (e) {
            retryCountRef.current++;
            if (retryCountRef.current < 10) scheduleRestart(1000);
            else setMicError("Mic unavailable. Tap mic to retry.");
          }
        }, 150);
      } catch (_) {}
    }, delay);
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }
    setSupported(true);

    const rec = buildRecognition();
    recognitionRef.current = rec;

    rec.onresult = async (event) => {
      // Check ALL alternatives across ALL results for best match
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // Gather all alternatives
        const allAlts = Array.from({ length: result.length }, (_, j) =>
          result[j].transcript.toLowerCase().trim()
        );

        if (result.isFinal) {
          // Use best alternative (index 0 = highest confidence) but also check others for wake word
          finalText = allAlts[0];
          // If wake word not in best, check alternatives
          if (!isWakeWord(finalText)) {
            const altWithWake = allAlts.find(a => isWakeWord(a));
            if (altWithWake) finalText = altWithWake;
          }
        } else {
          interimText = allAlts[0];
          // Respond to interim text for wake word — faster response
          if (isWakeWord(interimText) && !awakeRef.current) {
            awakeRef.current = true;
            setAwake(true);
            clearTimeout(awakeTimerRef.current);
            awakeTimerRef.current = setTimeout(() => {
              awakeRef.current = false; setAwake(false);
            }, 10000);
            speak("Yes, I'm here. How can I help?");
            setResponse("Listening for your command...");
            setTranscript(interimText);
            return;
          }
        }
      }

      if (!finalText) return;
      setTranscript(finalText);
      console.log("TIMI heard:", finalText);

      // Wake word in final
      if (isWakeWord(finalText) && !awakeRef.current) {
        awakeRef.current = true;
        setAwake(true);
        clearTimeout(awakeTimerRef.current);
        awakeTimerRef.current = setTimeout(() => {
          awakeRef.current = false; setAwake(false);
        }, 10000);
        speak("Yes, I'm here. How can I help?");
        setResponse("Listening for your command...");
        return;
      }

      if (!awakeRef.current) return;

      // Reset awake timer on any speech
      clearTimeout(awakeTimerRef.current);
      awakeTimerRef.current = setTimeout(() => {
        awakeRef.current = false; setAwake(false);
      }, 10000);

      // If wake word + command in same sentence
      const textWithoutWake = WAKE_VARIANTS.reduce((t, v) => t.replace(v, ""), finalText).trim();
      await processCommand(textWithoutWake || finalText);
    };

    rec.onerror = (e) => {
      console.log("Voice error:", e.error);
      if (e.error === "not-allowed") {
        setMicError("Microphone permission denied. Please allow mic access.");
        listeningRef.current = false;
        setListening(false);
        return;
      }
      if (e.error === "network") {
        setMicError("Network error. Retrying...");
      }
      // Auto restart on all other errors
      scheduleRestart(500);
    };

    rec.onend = () => {
      // Always restart if we're supposed to be listening
      scheduleRestart(200);
    };

    return () => {
      listeningRef.current = false;
      clearTimeout(awakeTimerRef.current);
      clearTimeout(restartTimerRef.current);
      rec.stop();
    };
  }, []); // eslint-disable-line

  const processCommand = useCallback(async (text) => {
    const bal = balance?.balance || "unknown";
    const currency = balance?.currency || "USD";
    let reply = "";

    const detectedSym = Object.entries(SYMBOL_MAP).find(([key]) => text.includes(key));
    const sym = detectedSym ? detectedSym[1] : null;
    const symName = sym ? SYMBOL_NAMES[sym] : null;

    if (COMMANDS.balance.some(w => text.includes(w))) {
      reply = `Your current balance is ${bal} ${currency}.`;
    } else if (COMMANDS.status.some(w => text.includes(w))) {
      const entries = Object.entries(signals || {});
      const best = entries.sort((a, b) => b[1].confidence - a[1].confidence)[0];
      reply = `T I M I is ${autoTrade ? "actively trading" : "paused"}. Balance is ${bal} ${currency}. `;
      if (best) reply += `Strongest signal is ${SYMBOL_NAMES[best[0]] || best[0]} at ${best[1].confidence} percent confidence, ${best[1].action}.`;
    } else if (COMMANDS.signals.some(w => text.includes(w))) {
      if (sym && signals[sym]) {
        const sig = signals[sym];
        reply = `${symName} signal is ${sig.action} with ${sig.confidence} percent confidence. RSI is ${sig.rsi}. Key reasons: ${sig.reasons?.slice(0, 2).join(", ") || "mixed indicators"}.`;
      } else {
        const entries = Object.entries(signals || {});
        if (entries.length === 0) reply = "No signals yet. Still loading market data.";
        else {
          const best = entries.sort((a, b) => b[1].confidence - a[1].confidence)[0];
          reply = `Best signal right now is ${SYMBOL_NAMES[best[0]] || best[0]}, ${best[1].action} at ${best[1].confidence} percent confidence.`;
        }
      }
    } else if (COMMANDS.buy.some(w => text.includes(w))) {
      if (sym) { manualTrade(sym, "BUY"); reply = `Executing buy on ${symName}. Trade placed.`; }
      else reply = "Which symbol? Say the name like boom 1000 or vix 75.";
    } else if (COMMANDS.sell.some(w => text.includes(w))) {
      if (sym) { manualTrade(sym, "SELL"); reply = `Executing sell on ${symName}. Trade placed.`; }
      else reply = "Which symbol would you like to sell?";
    } else if (COMMANDS.close.some(w => text.includes(w))) {
      closeAllTrades(); reply = "Emergency stop activated. Closing all open trades now.";
    } else if (COMMANDS.stop.some(w => text.includes(w))) {
      setAutoTrade(false); reply = "Auto trading paused. I will stop opening new trades.";
    } else if (COMMANDS.start.some(w => text.includes(w))) {
      setAutoTrade(true); reply = "Auto trading resumed. Back on the hunt for signals.";
    } else if (COMMANDS.news.some(w => text.includes(w))) {
      reply = "Fetching latest market news...";
      setResponse(reply); speak(reply);
      const headline = await fetchNewsHeadline();
      reply = `Latest headline: ${headline}`;
    } else if (COMMANDS.help.some(w => text.includes(w))) {
      reply = "You can ask me: what's my balance, what's the signal, buy or sell a symbol, close all trades, stop or start trading, or get the latest news.";
    } else {
      reply = "I didn't catch that. Try: hey TIMI, what's the signal — or — hey TIMI, what's my balance.";
    }

    setResponse(reply);
    speak(reply);
  }, [balance, signals, autoTrade, setAutoTrade, manualTrade, closeAllTrades]);

  const startListening = () => {
    if (!supported) return;
    setMicError("");
    retryCountRef.current = 0;
    listeningRef.current = true;
    setListening(true);
    try {
      recognitionRef.current?.start();
      speak("T I M I voice activated. Say hey T I M I to wake me up.");
    } catch (e) {
      scheduleRestart(500);
    }
  };

  const stopListening = () => {
    listeningRef.current = false;
    clearTimeout(restartTimerRef.current);
    clearTimeout(awakeTimerRef.current);
    recognitionRef.current?.stop();
    setListening(false);
    setAwake(false);
    awakeRef.current = false;
    speak("Voice deactivated.");
  };

  return { listening, awake, transcript, response, supported, micError, startListening, stopListening };
}
