import { useState, useEffect } from "react";

const KEY = "timi_session_stats";

export default function useSessionStats(tradeHistory) {
  const [sessionStats, setSessionStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  });

  useEffect(() => {
    if (!tradeHistory || tradeHistory.length === 0) return;

    // Rebuild session stats from full history
    const stats = {};
    tradeHistory.forEach(t => {
      const session = t.session || "unknown";
      if (!stats[session]) stats[session] = { wins: 0, losses: 0, pnl: 0, trades: 0 };
      stats[session].trades++;
      stats[session].pnl = +(stats[session].pnl + (t.pnl || 0)).toFixed(2);
      if (t.result === "WIN") stats[session].wins++;
      else stats[session].losses++;
    });

    // Add win rate
    Object.keys(stats).forEach(s => {
      stats[s].winRate = stats[s].trades > 0
        ? Math.round(stats[s].wins / stats[s].trades * 100) : 0;
    });

    setSessionStats(stats);
    localStorage.setItem(KEY, JSON.stringify(stats));
  }, [tradeHistory]);

  return sessionStats;
}
