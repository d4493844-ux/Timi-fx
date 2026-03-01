import { useState, useEffect, useRef, useCallback } from "react";

const WAKE_WORD = "timi";

const COMMANDS = {
  balance: ["balance", "how much", "portfolio", "money"],
  signals: ["signal", "signals", "what should i", "what do you think"],
  buy: ["buy", "long", "call"],
  sell: ["sell", "short", "put"],
  close: ["close all", "stop all", "exit all", "emergency"],
  stop: ["stop trading", "pause", "stop auto"],
  start: ["start trading", "resume", "start auto"],
  news: ["news", "latest", "what's happening", "market news"],
  status: ["status", "how are you", "report"],
  help: ["help", "what can you do", "commands"],
};

const SYMBOL_MAP = {
  "vix 75": "R_75", "vix75": "R_75", "r75": "R_75",
  "vix 25": "R_25", "vix25": "R_25", "r25": "R_25",
  "vix 50": "R_50", "vix50": "R_50",
  "boom 1000": "BOOM1000", "boom1000": "BOOM1000", "boom": "BOOM1000",
  "boom 500": "BOOM500", "boom500": "BOOM500",
  "crash 1000": "CRASH1000", "crash1000": "CRASH1000", "crash": "CRASH1000",
  "crash 500": "CRASH500", "crash500": "CRASH500",
  "euro": "frxEURUSD", "eurusd": "frxEURUSD", "eur usd": "frxEURUSD",
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
  u.rate = 1.05;
  u.pitch = 0.9;
  u.volume = 1;
  // Try to use a good voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes("Google") || v.name.includes("Daniel") || v.name.includes("Alex"));
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

export default function useVoice({ balance, signals, autoTrade, setAutoTrade, manualTrade, closeAllTrades }) {
  const [listening, setListening] = useState(false);
  const [awake, setAwake] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const awakeTimerRef = useRef(null);
  const awakeRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }
    setSupported(true);

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    recognitionRef.current = rec;

    rec.onresult = async (event) => {
      const text = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      setTranscript(text);
      console.log("TIMI heard:", text);

      // Wake word detection
      if (text.includes(WAKE_WORD) && !awakeRef.current) {
        awakeRef.current = true;
        setAwake(true);
        clearTimeout(awakeTimerRef.current);
        awakeTimerRef.current = setTimeout(() => {
          awakeRef.current = false;
          setAwake(false);
        }, 8000);
        speak("Yes, I am here. How can I help you?");
        setResponse("Listening...");
        return;
      }

      if (!awakeRef.current) return;

      // Reset wake timer
      clearTimeout(awakeTimerRef.current);
      awakeTimerRef.current = setTimeout(() => {
        awakeRef.current = false;
        setAwake(false);
      }, 8000);

      // Process command
      await processCommand(text);
    };

    rec.onerror = (e) => { if (e.error !== "no-speech") console.log("Voice error:", e.error); };
    rec.onend = () => { if (listening) rec.start(); };

    return () => { rec.stop(); clearTimeout(awakeTimerRef.current); };
  }, []); // eslint-disable-line

  const processCommand = useCallback(async (text) => {
    const bal = balance?.balance || "unknown";
    const currency = balance?.currency || "USD";
    let reply = "";

    // Detect symbol in text
    const detectedSym = Object.entries(SYMBOL_MAP).find(([key]) => text.includes(key));
    const sym = detectedSym ? detectedSym[1] : null;
    const symName = sym ? SYMBOL_NAMES[sym] : null;

    // Balance
    if (COMMANDS.balance.some(w => text.includes(w))) {
      reply = `Your current balance is ${bal} ${currency}.`;
    }
    // Status
    else if (COMMANDS.status.some(w => text.includes(w))) {
      const sigEntries = Object.entries(signals || {});
      const best = sigEntries.sort((a, b) => b[1].confidence - a[1].confidence)[0];
      reply = `TIMI is ${autoTrade ? "actively trading" : "paused"}. Balance is ${bal} ${currency}. `;
      if (best) reply += `Strongest signal is ${SYMBOL_NAMES[best[0]] || best[0]} at ${best[1].confidence} percent confidence, ${best[1].action}.`;
    }
    // Signals
    else if (COMMANDS.signals.some(w => text.includes(w))) {
      if (sym && signals[sym]) {
        const sig = signals[sym];
        reply = `${symName} signal is ${sig.action} with ${sig.confidence} percent confidence. RSI is ${sig.rsi}. Key reasons: ${sig.reasons?.slice(0, 2).join(", ") || "mixed indicators"}.`;
      } else {
        const entries = Object.entries(signals || {});
        if (entries.length === 0) { reply = "No signals available yet. Still loading market data."; }
        else {
          const best = entries.sort((a, b) => b[1].confidence - a[1].confidence)[0];
          reply = `Best signal right now is ${SYMBOL_NAMES[best[0]] || best[0]}, ${best[1].action} at ${best[1].confidence} percent confidence.`;
        }
      }
    }
    // Buy
    else if (COMMANDS.buy.some(w => text.includes(w))) {
      if (sym) {
        manualTrade(sym, "BUY");
        reply = `Executing buy on ${symName}. Trade placed.`;
      } else {
        reply = "Which symbol would you like to buy? Say the symbol name.";
      }
    }
    // Sell
    else if (COMMANDS.sell.some(w => text.includes(w))) {
      if (sym) {
        manualTrade(sym, "SELL");
        reply = `Executing sell on ${symName}. Trade placed.`;
      } else {
        reply = "Which symbol would you like to sell? Say the symbol name.";
      }
    }
    // Close all
    else if (COMMANDS.close.some(w => text.includes(w))) {
      closeAllTrades();
      reply = "Emergency stop activated. Closing all open trades now.";
    }
    // Stop auto
    else if (COMMANDS.stop.some(w => text.includes(w))) {
      setAutoTrade(false);
      reply = "Auto trading paused. I will stop opening new trades.";
    }
    // Start auto
    else if (COMMANDS.start.some(w => text.includes(w))) {
      setAutoTrade(true);
      reply = "Auto trading resumed. I'm back on the hunt for signals.";
    }
    // News
    else if (COMMANDS.news.some(w => text.includes(w))) {
      reply = "Fetching latest market news...";
      setResponse(reply);
      speak(reply);
      const headline = await fetchNewsHeadline();
      reply = `Latest from Bloomberg: ${headline}`;
    }
    // Help
    else if (COMMANDS.help.some(w => text.includes(w))) {
      reply = "You can ask me: what's my balance, what's the signal, buy or sell a symbol, close all trades, stop or start trading, or get the latest news.";
    }
    // Unknown
    else {
      reply = "I didn't quite catch that. Try saying: hey TIMI, what's my balance, or hey TIMI, what's the signal.";
    }

    setResponse(reply);
    speak(reply);
  }, [balance, signals, autoTrade, setAutoTrade, manualTrade, closeAllTrades]);

  const startListening = () => {
    if (!supported) return;
    try {
      recognitionRef.current?.start();
      setListening(true);
      speak("TIMI voice activated. Say hey TIMI to wake me up.");
    } catch (e) { console.log(e); }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    setAwake(false);
    awakeRef.current = false;
    speak("Voice deactivated.");
  };

  return { listening, awake, transcript, response, supported, startListening, stopListening };
}
