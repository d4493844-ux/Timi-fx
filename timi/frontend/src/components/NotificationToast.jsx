import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  win: "#00ff9d", loss: "#ff3366", trade: "#00d4ff",
  profit: "#00ff9d", alert: "#ffcc00", info: "#c8e8ff"
};

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const handler = (e) => {
      const { title, body, type } = e.detail;
      const id = Date.now();
      setToasts(prev => [{ id, title, body, type }, ...prev.slice(0, 4)]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    window.addEventListener("timi-notification", handler);
    return () => window.removeEventListener("timi-notification", handler);
  }, []);

  return (
    <div style={{ position: "fixed", top: 16, left: 16, right: 16, zIndex: 9999, pointerEvents: "none" }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              background: "rgba(7,21,37,0.98)", backdropFilter: "blur(20px)",
              border: `1px solid ${COLORS[toast.type] || "#0a2540"}`,
              borderRadius: 14, padding: "12px 16px", marginBottom: 8,
              boxShadow: `0 0 20px ${COLORS[toast.type] || "#0a2540"}33`,
              pointerEvents: "auto"
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>
                {toast.type === "win" ? "🟢" : toast.type === "loss" ? "🔴" : toast.type === "trade" ? "🤖" : toast.type === "profit" ? "🎯" : "⚡"}
              </span>
              <div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: COLORS[toast.type] || "#fff" }}>
                  {toast.title}
                </div>
                <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 11, color: "#c8e8ff", marginTop: 2 }}>
                  {toast.body}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
