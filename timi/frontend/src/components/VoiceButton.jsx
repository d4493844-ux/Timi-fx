import { motion, AnimatePresence } from "framer-motion";

export default function VoiceButton({ listening, awake, transcript, response, supported, startListening, stopListening }) {
  if (!supported) return null;

  return (
    <>
      {/* Floating voice button */}
      <motion.button
        onClick={listening ? stopListening : startListening}
        whileTap={{ scale: 0.9 }}
        style={{
          position: "fixed", bottom: 90, right: 20, width: 56, height: 56,
          borderRadius: "50%", border: "none", cursor: "pointer", zIndex: 200,
          background: awake
            ? "linear-gradient(135deg,#00ff9d,#00d4ff)"
            : listening
            ? "linear-gradient(135deg,#ff3366,#ff6633)"
            : "linear-gradient(135deg,#0a2540,#071525)",
          boxShadow: awake ? "0 0 30px rgba(0,255,157,0.6)" : listening ? "0 0 20px rgba(255,51,102,0.4)" : "0 4px 20px rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid " + (awake ? "#00ff9d" : listening ? "#ff3366" : "#1a3550"),
          transition: "all 0.3s"
        }}
      >
        {/* Pulse rings when awake */}
        {awake && [1, 2].map(i => (
          <motion.div key={i} style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", border: "2px solid rgba(0,255,157,0.4)" }}
            animate={{ scale: [1, 1.8, 2.2], opacity: [0.6, 0.2, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
        <span style={{ fontSize: awake ? 24 : 20, position: "relative", zIndex: 1 }}>
          {awake ? "🎙️" : listening ? "🔴" : "🎤"}
        </span>
      </motion.button>

      {/* Voice status card */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: "fixed", bottom: 160, right: 16, left: 16,
              background: "rgba(7,21,37,0.97)", border: "1px solid " + (awake ? "#00ff9d" : "#0a2540"),
              borderRadius: 16, padding: 16, zIndex: 199,
              backdropFilter: "blur(20px)",
              boxShadow: awake ? "0 0 40px rgba(0,255,157,0.15)" : "none"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {/* Sound wave animation */}
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div key={i}
                    animate={awake ? { height: [4, 16, 4] } : { height: [4, 8, 4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    style={{ width: 3, background: awake ? "#00ff9d" : "#00d4ff", borderRadius: 2 }}
                  />
                ))}
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: awake ? "#00ff9d" : "#00d4ff", fontWeight: 700 }}>
                {awake ? "TIMI LISTENING" : "SAY HEY TIMI"}
              </div>
            </div>

            {transcript && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#c8e8ff", marginBottom: 8, padding: "6px 10px", background: "rgba(0,212,255,0.06)", borderRadius: 8 }}>
                🗣 "{transcript}"
              </div>
            )}

            {response && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#00ff9d", padding: "6px 10px", background: "rgba(0,255,157,0.06)", borderRadius: 8, lineHeight: 1.5 }}>
                🤖 {response}
              </div>
            )}

            {!transcript && !response && (
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 10, color: "#3a6080" }}>
                Try: "Hey TIMI, what's the signal?" or "Hey TIMI, what's my balance?"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
