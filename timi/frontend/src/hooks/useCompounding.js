import { useState, useEffect } from "react";

const STORAGE_KEY = "timi_compounding";

export default function useCompounding(currentBalance) {
  const [data, setData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved) return saved;
    } catch {}
    return {
      startBalance: 0,
      startDate: new Date().toISOString().split("T")[0],
      dailyTarget: 5,
      snapshots: [],
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const initCompounding = (startBalance, dailyTarget) => {
    setData({
      startBalance,
      startDate: new Date().toISOString().split("T")[0],
      dailyTarget,
      snapshots: [{ date: new Date().toISOString().split("T")[0], balance: startBalance }],
    });
  };

  const recordSnapshot = (balance) => {
    const today = new Date().toISOString().split("T")[0];
    setData(prev => {
      const existing = prev.snapshots.find(s => s.date === today);
      if (existing) {
        return { ...prev, snapshots: prev.snapshots.map(s => s.date === today ? { ...s, balance } : s) };
      }
      return { ...prev, snapshots: [...prev.snapshots, { date: today, balance }] };
    });
  };

  // Project future growth
  const projectGrowth = (days = 30) => {
    const bal = currentBalance || data.startBalance || 1000;
    const dailyRate = data.dailyTarget / 100;
    const projection = [];
    let running = bal;
    for (let i = 0; i <= days; i++) {
      projection.push({ day: i, balance: +running.toFixed(2) });
      running *= (1 + dailyRate);
    }
    return projection;
  };

  const stats = {
    totalGrowth: data.startBalance ? (((currentBalance - data.startBalance) / data.startBalance) * 100).toFixed(1) : "0",
    daysRunning: data.snapshots.length,
    avgDailyReturn: data.snapshots.length > 1
      ? (((currentBalance - data.startBalance) / data.startBalance * 100) / data.snapshots.length).toFixed(2)
      : "0",
  };

  return { data, initCompounding, recordSnapshot, projectGrowth, stats };
}
