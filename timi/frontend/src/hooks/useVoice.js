import { useState, useEffect, useRef, useCallback } from "react";

const WAKE_WORDS = [
  "hey timi","timi","timmy","timer","timy","tommy","teme",
  "time me","hey tim","tiny","team","teemy","tee me","jimmy",
  "wake up","are you there","hey ai","yo timi","timi trade",
];

function matchesWakeWord(text) {
  const t = text.toLowerCase().trim();
  return WAKE_WORDS.some(w => t.includes(w));
}

export default function useVoice({ derivData } = {}) {
  const [listening,  setListening]  = useState(false);
  const [awake,      setAwake]      = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [micError,   setMicError]   = useState("");
  const [supported,  setSupported]  = useState(false);

  const recRef       = useRef(null);
  const awakeRef     = useRef(false);
  const awakeTimer   = useRef(null);
  const restartTimer = useRef(null);
  const activeRef    = useRef(false); // tracks if user wants mic on

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const speak = useCallback((text) => {
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05; u.pitch = 1;
      window.speechSynthesis?.speak(u);
    } catch {}
    setResponse(text);
    setTimeout(() => setResponse(""), 6000);
  }, []);

  const handleCommand = useCallback((cmd) => {
    const t = cmd.toLowerCase();
    const d = derivData;
    if (t.includes("balance"))         return speak(`Your balance is $${d?.balance?.toFixed(2) || "unknown"}`);
    if (t.includes("start") || t.includes("trade on"))  { d?.setAutoTrade?.(true);  return speak("Auto trading started"); }
    if (t.includes("stop") || t.includes("trade off"))  { d?.setAutoTrade?.(false); return speak("Auto trading stopped"); }
    if (t.includes("profit") || t.includes("pnl"))      return speak(`Today's P&L is $${d?.dailyPnl?.toFixed(2) || "0"}`);
    if (t.includes("win rate"))        return speak(`Win rate is ${d?.winRate || 0}%`);
    if (t.includes("open trades"))     return speak(`${d?.activeTrades?.length || 0} trades open`);
    speak("I heard you. How can I help? Try: balance, start trading, stop trading.");
  }, [derivData, speak]);

  const startRec = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // Clean up old instance
    try { recRef.current?.stop(); } catch {}
    clearTimeout(restartTimer.current);

    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.maxAlternatives = 5;
    rec.lang            = "en-US";

    rec.onstart = () => {
      setListening(true);
      setMicError("");
    };

    rec.onresult = (e) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }

      const text = (final || interim).trim();
      if (!text) return;
      setTranscript(text);

      // Check all alternatives for wake word
      const allAlts = [];
      for (let i = e.resultIndex; i < e.results.length; i++) {
        for (let j = 0; j < e.results[i].length; j++) {
          allAlts.push(e.results[i][j].transcript);
        }
      }
      const woke = allAlts.some(a => matchesWakeWord(a));

      if (woke && !awakeRef.current) {
        awakeRef.current = true;
        setAwake(true);
        speak("Yes? I'm listening.");
        clearTimeout(awakeTimer.current);
        awakeTimer.current = setTimeout(() => {
          awakeRef.current = false;
          setAwake(false);
          setTranscript("");
        }, 12000);
        return;
      }

      if (awakeRef.current && final) {
        const cmd = final.replace(new RegExp(WAKE_WORDS.join("|"), "gi"), "").trim();
        if (cmd.length > 1) {
          clearTimeout(awakeTimer.current);
          awakeRef.current = false;
          setAwake(false);
          handleCommand(cmd);
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed") {
        setMicError("Microphone permission denied. Allow mic in browser settings.");
        setListening(false);
        activeRef.current = false;
        return;
      }
      if (e.error === "no-speech" || e.error === "network" || e.error === "aborted") {
        // Auto restart after brief pause
        if (activeRef.current) {
          restartTimer.current = setTimeout(() => {
            if (activeRef.current) startRec();
          }, 800);
        }
        return;
      }
      setMicError(`Mic error: ${e.error}`);
    };

    rec.onend = () => {
      // Auto restart if user hasn't manually stopped
      if (activeRef.current) {
        restartTimer.current = setTimeout(() => {
          if (activeRef.current) startRec();
        }, 500);
      } else {
        setListening(false);
      }
    };

    recRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      // Already started — restart after delay
      restartTimer.current = setTimeout(() => {
        if (activeRef.current) startRec();
      }, 1000);
    }
  }, [handleCommand, speak]);

  const startListening = useCallback(() => {
    activeRef.current = true;
    setMicError("");
    startRec();
  }, [startRec]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    awakeRef.current  = false;
    setAwake(false);
    setListening(false);
    setTranscript("");
    clearTimeout(awakeTimer.current);
    clearTimeout(restartTimer.current);
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      clearTimeout(awakeTimer.current);
      clearTimeout(restartTimer.current);
      try { recRef.current?.stop(); } catch {}
    };
  }, []);

  return { listening, awake, transcript, response, supported, micError, startListening, stopListening };
}
