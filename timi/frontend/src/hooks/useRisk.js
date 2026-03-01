import { useState, useEffect } from "react";

const DEFAULT = {
  riskPct: 2,
  maxTrades: 3,
  minConfidence: 45,
  duration: 5,
  rrRatio: 1.5, // Risk:Reward — win pays 85%, so RR = 0.85:1 on Deriv binary
};

export default function useRisk() {
  const [riskParams, setRiskParams] = useState(() => {
    try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem("timi_risk")) }; }
    catch { return DEFAULT; }
  });

  useEffect(() => {
    localStorage.setItem("timi_risk", JSON.stringify(riskParams));
  }, [riskParams]);

  const updateRisk = (key, value) => {
    setRiskParams(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  // Calculate stake based on balance
  const calcStake = (balance) => {
    const stake = parseFloat(balance) * (riskParams.riskPct / 100);
    return Math.max(1, +stake.toFixed(2));
  };

  // RR explanation for binary options
  // On Deriv: win = stake * 0.85, loss = stake * 1.0
  // So RR = 0.85:1 — need >54% win rate to break even
  const rrStats = {
    winPayout: 0.85,
    lossPayout: 1.0,
    breakEvenWinRate: +(1 / (1 + 0.85) * 100).toFixed(1), // 54.1%
    expectedValue: (wr) => +((wr / 100 * 0.85) - ((100 - wr) / 100 * 1.0)).toFixed(3),
  };

  return { riskParams, updateRisk, calcStake, rrStats };
}
