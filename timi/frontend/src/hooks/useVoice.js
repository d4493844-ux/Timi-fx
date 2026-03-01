import { useState, useEffect, useRef, useCallback } from "react";

// ── All the ways someone might say "Hey TIMI" ──
const WAKE_VARIANTS = [
  "timi", "timmy", "timer", "timy", "tommy", "teme",
  "time me", "chimney", "hey tim", "tme", "tiny",
  "tamy", "tammy", "team", "teemy", "timi", "tee me",
  "tee mee", "tea me", "jimmy", "gimme", "timbi",
  "hey t", "t i m i", "t.i.m.i", "ai", "hey ai",
  "wake up", "are you there", "yo timi", "yo timi",
];

const SYMBOL_MAP = {
  "vix 75": "R_75", "vix75": "R_75", "r75": "R_75", "seventy five": "R_75",
  "vix 25": "R_25", "vix25": "R_25", "r25": "R_25", "twenty five": "R_25",
  "vix 50": "R_50", "vix50": "R_50", "fifty": "R_50",
  "boom 1000": "BOOM1000", "boom1000": "BOOM1000", "boom": "BOOM1000", "boom thousand": "BOOM1000",
  "boom 500": "BOOM500", "boom500": "BOOM500", "boom five hundred": "BOOM500",
  "crash 1000": "CRASH1000", "crash1000": "CRASH1000", "crash": "CRASH1000", "crash thousand": "CRASH1000",
  "crash 500": "CRASH500", "crash500": "CRASH500",
  "euro": "frxEURUSD", "eurusd": "frxEURUSD", "eur usd": "frxEURUSD", "europe": "frxEURUSD",
  "bitcoin": "cryBTCUSD", "btc": "cryBTCUSD",
};

const SYMBOL_NAMES = {
  R_75: "VIX 75", R_25: "VIX 25", R_50: "VIX 50",
  BOOM1000: "BOOM 1000", BOOM500: "BOOM 500",
  CRASH1000: "CRASH 1000", CRASH500: "CRASH 500",
  frxEURUSD: "EUR/USD", cryBTCUSD: "Bitcoin",
};

function isWakeWord(text) {
  const t = text.toLowerCase().trim();
  return WAKE_VARIANTS.some(v => t.includes(v));
}

function speak(text) {
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 0.95;
    u.volume = 1.0;
    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Google") || v.name.includes("Daniel") ||
      v.name.includes("Alex") || v.name.includes("Samantha")
    );
    if (preferred) u.voice = preferred;
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.log("Speak error:", e);
  }
}

export default function useVoice({ balance, signals, autoTrade, setAutoTrade, manualTrade, closeAllTrades }) {
  const [listening,  setListening]  = useState(false);
  const [awake,      setAwake]      = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [supported,  setSupported]  = useState(false);
  const [micError,   setMicError]   = useState("");

  const recRef        = useRef(null);
  const awakeRef      = useRef(false);
  const listeningRef  = useRef(false);
  const awakeTimer    = useRef(null);
  const restartTimer  = useRef(null);
  const retryCount    = useRef(0);

  const scheduleRestart = useCallback((delay = 300) => {
    if (!listeningRef.current) return;
    clearTimeout(restartTimer.current);
    restartTimer.current = setTimeout(() => {
      if (!listeningRef.current) return;
      if (retryCount.current >= 15) {
        setMicError("Mic restarted too many times. Tap mic button to retry.");
        listeningRef.current = false;
        setListening(false);
        return;
      }
      retryCount.current++;
      try {
        recRef.current?.start();
      } catch (e) {
        scheduleRestart(500);
      }
    }, delay);
  }, []);

  const processCommand = useCallback(async (text) => {
    const t   = text.toLowerCase();
    const bal = balance?.balance || "unknown";
    const cur = balance?.currency || "USD";
    let reply = "";

    // Detect symbol
    const sym = Object.entries(SYMBOL_MAP).find(([k]) => t.includes(k))?.[1] ?? null;
    const symName = sym ? SYMBOL_NAMES[sym] : null;

    if      (t.match(/balance|how much|money|funds|portfolio/))
      reply = `Your balance is ${bal} ${cur}.`;

    else if (t.match(/status|report|how are you|update/)) {
      const best = Object.entries(signals || {})
        .sort((a, b) => b[1].confidence - a[1].confidence)[0];
      reply = `TIMI is ${autoTrade ? "actively trading" : "paused"}. Balance ${bal} ${cur}.`;
      if (best) reply += ` Best signal: ${SYMBOL_NAMES[best[0]] || best[0]}, ${best[1].action} at ${best[1].confidence}% confidence.`;
    }

    else if (t.match(/signal|what should|analyse|analyze|look at/)) {
      if (sym && signals?.[sym]) {
        const s = signals[sym];
        reply = `${symName}: ${s.action} at ${s.confidence}% confidence. RSI ${s.rsi}. ${s.reasons?.slice(0, 2).join(", ") || ""}`;
      } else {
        const best = Object.entries(signals || {})
          .sort((a, b) => b[1].confidence - a[1].confidence)[0];
        reply = best
          ? `Best signal right now: ${SYMBOL_NAMES[best[0]] || best[0]}, ${best[1].action} at ${best[1].confidence}%.`
          : "No strong signals yet. Still analysing the market.";
      }
    }

    else if (t.match(/buy|long|call|rise|up/)) {
      if (sym) { manualTrade?.(sym, "BUY"); reply = `Executing BUY on ${symName}.`; }
      else reply = "Which symbol? Say the name, like VIX 75 or BOOM 1000.";
    }

    else if (t.match(/sell|short|put|fall|down/)) {
      if (sym) { manualTrade?.(sym, "SELL"); reply = `Executing SELL on ${symName}.`; }
      else reply = "Which symbol? Say the name, like VIX 75 or CRASH 1000.";
    }

    else if (t.match(/close all|stop all|exit all|emergency|halt/)) {
      closeAllTrades?.();
      reply = "Emergency stop! Closing all open trades now.";
    }

    else if (t.match(/stop trading|pause trading|pause|stop auto/)) {
      setAutoTrade?.(false);
      reply = "Auto trading paused.";
    }

    else if (t.match(/start trading|resume|go|trade/)) {
      setAutoTrade?.(true);
      reply = "Auto trading resumed. Back on the hunt.";
    }

    else if (t.match(/profit|how much did|today|pnl/))
      reply = "Check the dashboard for today's P and L figure.";

    else if (t.match(/help|what can you|commands/))
      reply = "Say: balance, signal, buy or sell a symbol, close all trades, stop or start trading, or status report.";

    else
      reply = "Say: Hey TIMI, then your command. Like: Hey TIMI, what's the signal?";

    setResponse(reply);
    speak(reply);
  }, [balance, signals, autoTrade, setAutoTrade, manualTrade, closeAllTrades]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    setSupported(true);

    const rec = new SR();
    rec.continuous    = true;
    rec.interimResults = true;   // catch partial speech
    rec.maxAlternatives = 5;     // check 5 interpretations per phrase
    rec.lang = "en-US";
    recRef.current = rec;

    rec.onresult = (event) => {
      retryCount.current = 0; // reset on any speech
      const results = Array.from(event.results);

      // Check ALL results + ALL alternatives for wake word
      for (let i = event.resultIndex; i < results.length; i++) {
        for (let j = 0; j < results[i].length; j++) {
          const text = results[i][j].transcript.toLowerCase().trim();
          if (!text) continue;
          setTranscript(text);

          // Wake word check
          if (isWakeWord(text) && !awakeRef.current) {
            awakeRef.current = true;
            setAwake(true);
            clearTimeout(awakeTimer.current);
            awakeTimer.current = setTimeout(() => {
              awakeRef.current = false;
              setAwake(false);
            }, 12000); // 12 seconds awake window

            speak("Yes, I'm here.");
            setResponse("Listening for your command...");

            // If there's a command in the same sentence, process it
            const cmd = text
              .replace(/hey\s*/gi, "")
              .replace(new RegExp(WAKE_VARIANTS.join("|"), "gi"), "")
              .trim();
            if (cmd.length > 3) {
              setTimeout(() => processCommand(cmd), 800);
            }
            return;
          }

          // If awake, process as command
          if (awakeRef.current && results[i].isFinal) {
            clearTimeout(awakeTimer.current);
            awakeTimer.current = setTimeout(() => {
              awakeRef.current = false;
              setAwake(false);
            }, 12000);
            processCommand(text);
            return;
          }
        }
      }
    };

    rec.onerror = (e) => {
      console.log("Voice error:", e.error);
      if (e.error === "not-allowed") {
        setMicError("Microphone permission denied. Please allow mic access.");
        listeningRef.current = false;
        setListening(false);
        return;
      }
      scheduleRestart(600);
    };

    rec.onend = () => {
      scheduleRestart(200);
    };

    return () => {
      clearTimeout(awakeTimer.current);
      clearTimeout(restartTimer.current);
      try { rec.stop(); } catch (e) {}
    };
  }, [processCommand, scheduleRestart]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    listeningRef.current = true;
    retryCount.current = 0;
    setListening(true);
    setMicError("");
    try {
      recRef.current?.start();
      speak("TIMI voice activated. I'm listening. Say Hey TIMI to wake me.");
    } catch (e) {
      scheduleRestart(300);
    }
  }, [scheduleRestart]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    awakeRef.current = false;
    setListening(false);
    setAwake(false);
    clearTimeout(awakeTimer.current);
    clearTimeout(restartTimer.current);
    try { recRef.current?.stop(); } catch (e) {}
    speak("Voice off.");
  }, []);

  return { listening, awake, transcript, response, supported, micError, startListening, stopListening };
}
