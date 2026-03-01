import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

// Default weights — AI adjusts these over time
const DEFAULT_WEIGHTS = {
  ema_stack: 1.0,
  ema_crossover: 1.0,
  rsi: 1.0,
  macd: 1.0,
  bollinger: 1.0,
  stochastic: 1.0,
  candlestick_patterns: 1.0,
  support_resistance: 1.0,
  multi_timeframe: 1.0,
  session_boost: 1.0,
  volatility_filter: 1.0,
};

export default function useAI() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [sessionStats, setSessionStats] = useState({});
  const [symbolStats, setSymbolStats] = useState({});
  const [aiReady, setAiReady] = useState(false);
  const [learningLog, setLearningLog] = useState([]);
  const weightsRef = useRef(DEFAULT_WEIGHTS);
  const sessionStatsRef = useRef({});
  const symbolStatsRef = useRef({});

  // ── Load weights + stats from Supabase on startup ──
  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      // Load indicator weights
      const { data: wData } = await supabase.from("ai_weights").select("*");
      if (wData && wData.length > 0) {
        const w = {};
        wData.forEach(r => { w[r.indicator] = parseFloat(r.weight); });
        setWeights(w);
        weightsRef.current = w;
      }

      // Load session stats
      const { data: sData } = await supabase.from("session_stats").select("*");
      if (sData) {
        const s = {};
        sData.forEach(r => { s[r.session_name] = r; });
        setSessionStats(s);
        sessionStatsRef.current = s;
      }

      // Load symbol stats
      const { data: symData } = await supabase.from("symbol_stats").select("*");
      if (symData) {
        const sym = {};
        symData.forEach(r => { sym[r.symbol] = r; });
        setSymbolStats(sym);
        symbolStatsRef.current = sym;
      }

      setAiReady(true);
      console.log("✅ TIMI AI brain loaded from Supabase");
    } catch (err) {
      console.error("AI load error:", err);
      setAiReady(true); // Use defaults if offline
    }
  };

  // ── Save a completed trade + trigger learning ──
  const recordTrade = useCallback(async (trade) => {
    try {
      // Save trade to Supabase
      await supabase.from("trades").insert([{
        symbol: trade.symbol,
        type: trade.type,
        stake: trade.stake || 0,
        pnl: trade.pnl,
        result: trade.result,
        session: trade.session || "unknown",
        confidence: trade.confidence || 0,
        score: trade.score || 0,
        rsi: trade.rsi || 0,
        macd_hist: trade.macd_hist || 0,
        ema_stack: trade.ema_stack || "unknown",
        bb_position: trade.bb_position || "mid",
        stoch: trade.stoch || 50,
        patterns: JSON.stringify(trade.patterns || []),
        atr: trade.atr || 0,
        duration_minutes: trade.duration || 5,
        account_name: trade.account || "primary",
      }]);

      // Trigger AI learning from this trade
      await learnFromTrade(trade);
    } catch (err) {
      console.error("Trade record error:", err);
    }
  }, []);

  // ── Core AI learning function ──
  const learnFromTrade = async (trade) => {
    const won = trade.result === "WIN";
    const pnl = trade.pnl || 0;
    const learningRate = 0.05; // How fast AI adjusts (5% per trade)
    const logs = [];

    // 1. Learn which INDICATORS predicted this result correctly
    const indicatorSignals = trade.indicatorSignals || {};
    const newWeights = { ...weightsRef.current };

    for (const [indicator, wasActive] of Object.entries(indicatorSignals)) {
      if (!wasActive || !(indicator in newWeights)) continue;
      const currentWeight = newWeights[indicator];

      if (won) {
        // Indicator was active and we won — increase its weight
        newWeights[indicator] = Math.min(2.0, currentWeight + learningRate);
        if (currentWeight < newWeights[indicator]) {
          logs.push(`📈 ${indicator} weight ↑ ${currentWeight.toFixed(2)} → ${newWeights[indicator].toFixed(2)}`);
        }
      } else {
        // Indicator was active and we lost — decrease its weight
        newWeights[indicator] = Math.max(0.2, currentWeight - learningRate * 0.5);
        if (currentWeight > newWeights[indicator]) {
          logs.push(`📉 ${indicator} weight ↓ ${currentWeight.toFixed(2)} → ${newWeights[indicator].toFixed(2)}`);
        }
      }
    }

    // Save updated weights
    weightsRef.current = newWeights;
    setWeights({ ...newWeights });

    // Persist each changed weight to Supabase
    for (const [indicator, weight] of Object.entries(newWeights)) {
      await supabase.from("ai_weights").upsert({
        indicator,
        weight,
        updated_at: new Date().toISOString(),
      }, { onConflict: "indicator" });
    }

    // 2. Learn session performance
    const session = trade.session || "unknown";
    const existingSess = sessionStatsRef.current[session] || { win_count: 0, loss_count: 0, total_pnl: 0, avg_confidence: 0 };
    const updatedSess = {
      session_name: session,
      win_count: existingSess.win_count + (won ? 1 : 0),
      loss_count: existingSess.loss_count + (won ? 0 : 1),
      total_pnl: +((existingSess.total_pnl || 0) + pnl).toFixed(2),
      avg_confidence: Math.round(((existingSess.avg_confidence || 0) + (trade.confidence || 0)) / 2),
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const sessWinRate = updatedSess.win_count / (updatedSess.win_count + updatedSess.loss_count);

    // If session win rate drops below 40% after 10+ trades, mark it less active
    if ((updatedSess.win_count + updatedSess.loss_count) >= 10 && sessWinRate < 0.40) {
      updatedSess.is_active = false;
      logs.push(`⚠️ ${session} session flagged — win rate ${(sessWinRate*100).toFixed(0)}% too low`);
    } else if ((updatedSess.win_count + updatedSess.loss_count) >= 10 && sessWinRate >= 0.60) {
      logs.push(`✅ ${session} session strong — win rate ${(sessWinRate*100).toFixed(0)}%`);
    }

    sessionStatsRef.current[session] = updatedSess;
    setSessionStats({ ...sessionStatsRef.current });
    await supabase.from("session_stats").upsert(updatedSess, { onConflict: "session_name" });

    // 3. Learn symbol performance
    const symbol = trade.symbol;
    const existingSym = symbolStatsRef.current[symbol] || { win_count: 0, loss_count: 0, total_pnl: 0 };
    const updatedSym = {
      symbol,
      win_count: existingSym.win_count + (won ? 1 : 0),
      loss_count: existingSym.loss_count + (won ? 0 : 1),
      total_pnl: +((existingSym.total_pnl || 0) + pnl).toFixed(2),
      avg_confidence: Math.round(((existingSym.avg_confidence || 0) + (trade.confidence || 0)) / 2),
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    const symWinRate = updatedSym.win_count / (updatedSym.win_count + updatedSym.loss_count);
    if ((updatedSym.win_count + updatedSym.loss_count) >= 15 && symWinRate < 0.40) {
      updatedSym.is_active = false;
      logs.push(`⚠️ ${symbol} flagged — win rate ${(symWinRate*100).toFixed(0)}% too low, reducing trades`);
    }

    symbolStatsRef.current[symbol] = updatedSym;
    setSymbolStats({ ...symbolStatsRef.current });
    await supabase.from("symbol_stats").upsert(updatedSym, { onConflict: "symbol" });

    // Update learning log
    if (logs.length > 0) {
      setLearningLog(prev => [...logs.map(l => ({ msg: l, time: new Date().toLocaleTimeString() })), ...prev.slice(0, 49)]);
    }
  };

  // ── Get AI-adjusted score multiplier for a signal ──
  const getAIMultiplier = useCallback((signalContext) => {
    const w = weightsRef.current;
    const sess = sessionStatsRef.current;
    const sym = symbolStatsRef.current;

    let multiplier = 1.0;
    const reasons = [];

    // Apply indicator weights
    const activeIndicators = signalContext.activeIndicators || [];
    if (activeIndicators.length > 0) {
      const avgWeight = activeIndicators.reduce((sum, ind) => sum + (w[ind] || 1.0), 0) / activeIndicators.length;
      multiplier *= avgWeight;
      if (avgWeight > 1.1) reasons.push(`🧠 AI boosted (indicators avg weight: ${avgWeight.toFixed(2)}x)`);
      else if (avgWeight < 0.8) reasons.push(`🧠 AI reduced (weak indicators: ${avgWeight.toFixed(2)}x)`);
    }

    // Apply session performance multiplier
    const sessionName = signalContext.session;
    if (sessionName && sess[sessionName]) {
      const s = sess[sessionName];
      const total = s.win_count + s.loss_count;
      if (total >= 5) {
        const wr = s.win_count / total;
        if (!s.is_active) {
          multiplier *= 0.3; // Heavily reduce bad sessions
          reasons.push(`🚫 ${sessionName} session blocked (${(wr*100).toFixed(0)}% WR)`);
        } else if (wr >= 0.65) {
          multiplier *= 1.2;
          reasons.push(`⭐ ${sessionName} hot session (${(wr*100).toFixed(0)}% WR)`);
        } else if (wr < 0.45) {
          multiplier *= 0.7;
          reasons.push(`⚠️ ${sessionName} weak session (${(wr*100).toFixed(0)}% WR)`);
        }
      }
    }

    // Apply symbol performance multiplier
    const symbol = signalContext.symbol;
    if (symbol && sym[symbol]) {
      const s = sym[symbol];
      const total = s.win_count + s.loss_count;
      if (total >= 10) {
        const wr = s.win_count / total;
        if (!s.is_active) {
          multiplier *= 0.2;
          reasons.push(`🚫 ${symbol} blocked (${(wr*100).toFixed(0)}% WR)`);
        } else if (wr >= 0.65) {
          multiplier *= 1.15;
          reasons.push(`⭐ ${symbol} high performer (${(wr*100).toFixed(0)}% WR)`);
        }
      }
    }

    return { multiplier: Math.max(0.1, Math.min(2.0, multiplier)), reasons };
  }, []);

  // ── Get AI stake sizing based on growth target + streak ──
  const getAIStake = useCallback((baseStake, balance, dailyPnl, tradeHistory, growthConfig) => {
    let stakeMultiplier = 1.0;
    const reasons = [];

    // 1. Growth tracker integration
    if (growthConfig && growthConfig.startBalance && growthConfig.dailyTarget) {
      const dailyTargetAmt = growthConfig.startBalance * (growthConfig.dailyTarget / 100);
      const progress = dailyPnl / dailyTargetAmt;

      if (progress >= 1.0) {
        // Hit daily target — stop trading or trade at 20% risk
        stakeMultiplier *= 0.2;
        reasons.push("🎯 Daily target hit — protecting profits (20% stake)");
      } else if (progress >= 0.75) {
        stakeMultiplier *= 0.5;
        reasons.push("🎯 Near daily target (75%) — reducing risk");
      } else if (progress >= 0.5) {
        stakeMultiplier *= 0.8;
        reasons.push("📈 Halfway to target — slight reduction");
      } else if (dailyPnl < -(dailyTargetAmt * 0.5)) {
        // In significant drawdown — cut risk hard
        stakeMultiplier *= 0.4;
        reasons.push("⚠️ Drawdown protection — 40% stake");
      }
    }

    // 2. Losing streak protection
    const recent = tradeHistory.slice(0, 6);
    const recentLosses = recent.filter(t => t.result === "LOSS").length;
    const recentWins = recent.filter(t => t.result === "WIN").length;

    if (recentLosses >= 4) {
      stakeMultiplier *= 0.3;
      reasons.push(`🛑 ${recentLosses} recent losses — 30% stake until recovery`);
    } else if (recentLosses >= 3) {
      stakeMultiplier *= 0.5;
      reasons.push(`⚠️ ${recentLosses} recent losses — 50% stake`);
    } else if (recentWins >= 4) {
      stakeMultiplier *= 1.2;
      reasons.push(`🔥 ${recentWins} win streak — boosting 20%`);
    }

    // 3. Never risk more than 5% of balance regardless
    const maxStake = balance * 0.05;
    const finalStake = Math.min(baseStake * stakeMultiplier, maxStake);
    const adjustedStake = Math.max(1, +finalStake.toFixed(2));

    return { stake: adjustedStake, multiplier: stakeMultiplier, reasons };
  }, []);

  // ── Save daily growth snapshot ──
  const saveGrowthSnapshot = useCallback(async (balance, dailyPnl, dailyTarget, tradesCount, winRate) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await supabase.from("growth_snapshots").upsert({
        date: today,
        balance,
        daily_pnl: dailyPnl,
        daily_target: dailyTarget,
        trades_count: tradesCount,
        win_rate: winRate,
      }, { onConflict: "date" });
    } catch (err) {
      console.error("Growth snapshot error:", err);
    }
  }, []);

  // ── Fetch full trade history from Supabase ──
  const fetchTradeHistory = useCallback(async (limit = 200) => {
    try {
      const { data } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      return data || [];
    } catch {
      return [];
    }
  }, []);

  return {
    weights, weightsRef,
    sessionStats, symbolStats,
    aiReady, learningLog,
    recordTrade, getAIMultiplier, getAIStake,
    saveGrowthSnapshot, fetchTradeHistory,
    reloadAI: loadAIData,
  };
}
