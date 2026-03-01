import { motion, AnimatePresence } from "framer-motion";

export default function VoiceButton({ listening, awake, transcript, response, supported, micError, startListening, stopListening }) {
  if (!supported) return null;

  const btnColor = awake
    ? "linear-gradient(135deg,#00ff9d,#00d4ff)"
    : listening
    ? "linear-gradient(135deg,#ff6600,#ff3366)"
    : "linear-gradient(135deg,#0a2540,#071525)";

  const btnShadow = awake
    ? "0 0 30px rgba(0,255,157,0.7), 0 0 60px rgba(0,255,157,0.3)"
    : listening
    ? "0 0 20px rgba(255,102,0,0.5)"
    : "0 4px 20px rgba(0,0,0,0.5)";

  return (
    <>
      {/* Floating mic button */}
      <motion.button
        onClick={listening ? stopListening : startListening}
        whileTap={{ scale: 0.88 }}
        style={{
          position: "fixed", bottom: 88, right: 18,
          width: 58, height: 58, borderRadius: "50%",
          border: `2px solid ${awake ? "#00ff9d" : listening ? "#ff6600" : "#1a3550"}`,
          cursor: "pointer", zIndex: 200,
          background: btnColor,
          boxShadow: btnShadow,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s",
        }}
      >
        {/* Pulse rings when awake */}
        {awake && [1, 2, 3].map(i => (
          <motion.div key={i}
            style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "2px solid rgba(0,255,157,0.5)" }}
            animate={{ scale: [1, 1.6 + i * 0.3, 2 + i * 0.3], opacity: [0.7, 0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        {/* Listening pulse */}
        {listening && !awake && (
          <motion.div
            style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "2px solid rgba(255,102,0,0.4)" }}
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        <span style={{ fontSize: awake ? 26 : 22, position: "relative", zIndex: 1 }}>
          {awake ? "🎙️" : listening ? "🔴" : "🎤"}
        </span>
      </motion.button>

      {/* Voice panel */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.93 }}
            style={{
              position: "fixed", bottom: 158, left: 14, right: 14,
              background: "rgba(5,15,28,0.98)",
              border: `1px solid ${awake ? "rgba(0,255,157,0.5)" : "rgba(0,212,255,0.2)"}`,
              borderRadius: 18, padding: 16, zIndex: 199,
              backdropFilter: "blur(24px)",
              boxShadow: awake ? "0 0 40px rgba(0,255,157,0.12)" : "none",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {/* Sound bars */}
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {[1,2,3,4,5,4,3].map((h, i) => (
                  <motion.div key={i}
                    animate={awake
                      ? { height: [3, h * 4, 3] }
                      : { height: [3, h * 2, 3] }}
                    transition={{ duration: 0.5 + i * 0.05, repeat: Infinity, delay: i * 0.08 }}
                    style={{ width: 3, background: awake ? "#00ff9d" : "#00d4ff", borderRadius: 2 }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: awake ? "#00ff9d" : "#00d4ff" }}>
                {awake ? "🟢 TIMI AWAKE — speak now" : "👂 Waiting for Hey TIMI..."}
              </div>
            </div>

            {/* Mic error */}
            {micError && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#ff3366", background: "rgba(255,51,102,0.1)", borderRadius: 8, padding: "6px 10px", marginBottom: 8 }}>
                ⚠️ {micError}
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#c8e8ff", marginBottom: 8, padding: "7px 10px", background: "rgba(0,212,255,0.07)", borderRadius: 10, lineHeight: 1.5 }}>
                🗣 "{transcript}"
              </div>
            )}

            {/* Response */}
            {response && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#00ff9d", padding: "7px 10px", background: "rgba(0,255,157,0.07)", borderRadius: 10, lineHeight: 1.5 }}>
                🤖 {response}
              </div>
            )}

            {/* Hint when not awake */}
            {!awake && !transcript && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080", textAlign: "center", marginTop: 4 }}>
                Say "Hey TIMI" clearly · Works with: Timmy, Timer, Hey Tim, Wake Up
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
