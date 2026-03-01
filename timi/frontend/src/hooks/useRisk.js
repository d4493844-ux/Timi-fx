import { useState, useEffect, useCallback } from "react";

const DEFAULTS = {
  riskPct: 2,
  maxTrades: 3,
  minConfidence: 45,
  duration: 5,
};

const KEY = "timi_risk";

export default function useRisk() {
  const [riskParams, setRiskParams] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return saved ? { ...DEFAULTS, ...saved } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  });

  // Save every time params change
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(riskParams));
    } catch (e) {
      console.error("Risk save error:", e);
    }
  }, [riskParams]);

  const updateRisk = useCallback((key, value) => {
    setRiskParams(prev => {
      const updated = { ...prev, [key]: parseFloat(value) };
      // Also save immediately (belt + suspenders)
      try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const calcStake = useCallback((balance) => {
    const stake = parseFloat(balance) * (riskParams.riskPct / 100);
    return Math.max(1, +stake.toFixed(2));
  }, [riskParams.riskPct]);

  return { riskParams, updateRisk, calcStake };
}
