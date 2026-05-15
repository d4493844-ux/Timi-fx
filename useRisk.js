import { useState, useCallback, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

const KEY = "timi_risk";
const DEFAULTS = { riskPct: 2, maxTrades: 3, minConfidence: 45, duration: 5, dailyLossLimitPct: 5 };

async function saveRisk(data) {
  const v = JSON.stringify(data);
  try { await Preferences.set({ key: KEY, value: v }); } catch {}
  try { localStorage.setItem(KEY, v); } catch {}
}

async function loadRisk() {
  try { const { value } = await Preferences.get({ key: KEY }); if (value) return { ...DEFAULTS, ...JSON.parse(value) }; } catch {}
  try { const v = localStorage.getItem(KEY); if (v) return { ...DEFAULTS, ...JSON.parse(v) }; } catch {}
  return { ...DEFAULTS };
}

export default function useRisk() {
  const [riskParams, setRiskParams] = useState(DEFAULTS);
  useEffect(() => { loadRisk().then(setRiskParams); }, []);
  const updateRisk = useCallback((key, value) => {
    setRiskParams(prev => {
      const next = { ...prev, [key]: parseFloat(value) };
      saveRisk(next);
      return next;
    });
  }, []);
  const getRiskPct = useCallback(() => (riskParams.riskPct || DEFAULTS.riskPct) / 100, [riskParams]);
  return { riskParams, updateRisk, getRiskPct };
}
