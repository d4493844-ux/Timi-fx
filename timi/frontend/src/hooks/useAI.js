import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ── Market Regime Detection ──
// Detects: TRENDING_UP, TRENDING_DOWN, RANGING, VOLATILE, QUIET
function detectRegime(candles) {
  if (!candles || candles.length < 30) return { regime: "UNKNOWN", strength: 0 };
  const closes = candles.map(c => parseFloat(c.close));
  const highs  = candles.map(c => parseFloat(c.high));
  const lows   = candles.map(c => parseFloat(c.low));

  // BB width = volatility measure
  const recent = closes.slice(-20);
  const mean   = recent.reduce((a, b) => a + b, 0) / 20;
  const std    = Math.sqrt(recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 20);
  const bbWidth = (std * 4) / mean; // normalised

  // EMA trend
  const k9 = 2 / 10, k21 = 2 / 22;
  let ema9 = closes[0], ema21 = closes[0];
  closes.forEach(p => { ema9 = p * k9 + ema9 * (1 - k9); ema21 = p * k21 + ema21 * (1 - k21); });
  const trendStrength = Math.abs(ema9 - ema21) / ema21;

  // RSI avg
  let g = 0, l = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  const rsiAvg = 100 - 100 / (1 + g / (l || 0.0001));

  // Swing range
  const recentHighs = highs.slice(-20);
  const recentLows  = lows.slice(-20);
  const swingRange  = (Math.max(...recentHighs) - Math.min(...recentLows)) / mean;

  let regime = "RANGING";
  let strength = 50;

  if (bbWidth > 0.04 && trendStrength < 0.002) {
    regime = "VOLATILE"; strength = Math.round(bbWidth * 1000);
  } else if (trendStrength > 0.003 && ema9 > ema21) {
    regime = "TRENDING_UP"; strength = Math.round(trendStrength * 10000);
  } else if (trendStrength > 0.003 && ema9 < ema21) {
    regime = "TRENDING_DOWN"; strength = Math.round(trendStrength * 10000);
  } else if (bbWidth < 0.01 && swingRange < 0.01) {
    regime = "QUIET"; strength = Math.round((1 - bbWidth * 100) * 50);
  } else {
    regime = "RANGING"; strength = Math.round(swingRange * 1000);
  }

  return { regime, strength, bbWidth: +bbWidth.toFixed(4), trendStrength: +trendStrength.toFixed(4), rsiAvg: +rsiAvg.toFixed(1) };
}

// Which signal actions work best in each regime
const REGIME_PREFERENCE = {
  TRENDING_UP:   { BUY: 1.3,  SELL: 0.5,  HOLD: 1.0 },
  TRENDING_DOWN: { BUY: 0.5,  SELL: 1.3,  HOLD: 1.0 },
  RANGING:       { BUY: 1.0,  SELL: 1.0,  HOLD: 1.0 },
  VOLATILE:      { BUY: 0.6,  SELL: 0.6,  HOLD: 1.5 }, // Avoid volatile
  QUIET:         { BUY: 0.8,  SELL: 0.8,  HOLD: 1.2 }, // Low opportunity
  UNKNOWN:       { BUY: 1.0,  SELL: 1.0,  HOLD: 1.0 },
};

const DEFAULT_WEIGHTS = {
  ema_stack: 1.0, ema_crossover: 1.0, rsi: 1.0, macd: 1.0,
  bollinger: 1.0, stochastic: 1.0, candlestick_patterns: 1.0,
  support_resistance: 1.0, multi_timeframe: 1.0,
  session_boost: 1.0, volatility_filter: 1.0,
};

export default function useAI() {
  const [weights,       setWeights]       = useState(DEFAULT_WEIGHTS);
  const [sessionStats,  setSessionStats]  = useState({});
  const [symbolStats,   setSymbolStats]   = useState({});
  const [regimes,       setRegimes]       = useState({});   // per symbol
  const [aiReady,       setAiReady]       = useState(false);
  const [learningLog,   setLearningLog]   = useState([]);

  const weightsRef      = useRef(DEFAULT_WEIGHTS);
  const sessionStatsRef = useRef({});
  const symbolStatsRef  = useRef({});
  const regimesRef      = useRef({});

  // ── Boot: load everything from Supabase ──
  useEffect(() => { loadAIData(); }, []);

  const loadAIData = async () => {
    try {
      const [wRes, sRes, symRes] = await Promise.all([
        supabase.from("ai_weights").select("*"),
        supabase.from("session_stats").select("*"),
        supabase.from("symbol_stats").select("*"),
      ]);

      if (wRes.data?.length) {
        const w = {};
        wRes.data.forEach(r => { w[r.indicator] = parseFloat(r.weight); });
        setWeights(w); weightsRef.current = w;
      }
      if (sRes.data?.length) {
        const s = {};
        sRes.data.forEach(r => { s[r.session_name] = r; });
        setSessionStats(s); sessionStatsRef.current = s;
      }
      if (symRes.data?.length) {
        const s = {};
        symRes.data.forEach(r => { s[r.symbol] = r; });
        setSymbolStats(s); symbolStatsRef.current = s;
      }
      setAiReady(true);
      console.log("✅ TIMI AI loaded from Supabase");
    } catch (err) {
      console.error("AI load error:", err);
      setAiReady(true); // use defaults offline
    }
  };

  // ── Called every candle update — detect regime per symbol ──
  const updateRegime = useCallback((symbol, candles) => {
    if (!candles || candles.length < 30) return;
    const detected = detectRegime(candles);
    const prev = regimesRef.current[symbol];

    // Only log if regime CHANGED
    if (prev && prev.regime !== detected.regime) {
      const msg = `🔄 ${symbol} regime: ${prev.regime} → ${detected.regime}`;
      setLearningLog(l => [{ msg, time: new Date().toLocaleTimeString() }, ...l.slice(0, 49)]);
      // Save regime change to Supabase
      supabase.from("market_regime").insert([{
        symbol, regime: detected.regime,
        volatility: detected.bbWidth,
        trend_strength: detected.trendStrength,
        bb_width: detected.bbWidth,
        rsi_avg: detected.rsiAvg,
      }]).then(() => {});
    }

    regimesRef.current[symbol] = detected;
    setRegimes(r => ({ ...r, [symbol]: detected }));
    return detected;
  }, []);

  // ── Core learning: called after every trade closes ──
  const recordTrade = useCallback(async (trade) => {
    // 1. Persist to Supabase
    try {
      await supabase.from("trades").insert([{
        symbol:            trade.symbol,
        type:              trade.type,
        stake:             trade.stake || 0,
        pnl:               trade.pnl,
        result:            trade.result,
        session:           trade.session || "unknown",
        confidence:        trade.confidence || 0,
        score:             trade.score || 0,
        rsi:               trade.rsi || 0,
        macd_hist:         trade.macd_hist || 0,
        ema_stack:         trade.ema_stack || "unknown",
        bb_position:       trade.bb_position || "mid",
        stoch:             trade.stoch || 50,
        patterns:          JSON.stringify(trade.patterns || []),
        atr:               trade.atr || 0,
        account_name:      trade.account || "primary",
        active_indicators: JSON.stringify(trade.activeIndicators || []),
      }]);
    } catch (err) { console.error("Trade save error:", err); }

    // 2. Learn from it
    await learnFromTrade(trade);
  }, []);

  const learnFromTrade = async (trade) => {
    const won  = trade.result === "WIN";
    const pnl  = trade.pnl || 0;
    const LR   = 0.06;  // learning rate
    const logs = [];

    // ── A. Indicator weight adjustment ──
    const active = trade.activeIndicators || [];
    const newW   = { ...weightsRef.current };
    active.forEach(ind => {
      if (!(ind in newW)) return;
      const old = newW[ind];
      newW[ind] = won
        ? Math.min(2.0, old + LR)
        : Math.max(0.2, old - LR * 0.5);
      if (Math.abs(newW[ind] - old) > 0.01)
        logs.push(`${won ? "📈" : "📉"} ${ind}: ${old.toFixed(2)} → ${newW[ind].toFixed(2)}`);
    });
    weightsRef.current = newW;
    setWeights({ ...newW });
    // Batch upsert weights
    const weightRows = Object.entries(newW).map(([indicator, weight]) => ({
      indicator, weight, updated_at: new Date().toISOString()
    }));
    supabase.from("ai_weights").upsert(weightRows, { onConflict: "indicator" }).then(() => {});

    // ── B. Session stats ──
    const sessName = trade.session || "unknown";
    const es = sessionStatsRef.current[sessName] || { win_count: 0, loss_count: 0, total_pnl: 0, avg_confidence: 0 };
    const us = {
      session_name:   sessName,
      win_count:      es.win_count  + (won ? 1 : 0),
      loss_count:     es.loss_count + (won ? 0 : 1),
      total_pnl:      +((es.total_pnl || 0) + pnl).toFixed(2),
      avg_confidence: Math.round(((es.avg_confidence || 0) + (trade.confidence || 0)) / 2),
      is_blocked:     false,
      updated_at:     new Date().toISOString(),
    };
    const sTotal = us.win_count + us.loss_count;
    const sWR    = sTotal > 0 ? us.win_count / sTotal : 0.5;
    if (sTotal >= 10 && sWR < 0.38) {
      us.is_blocked = true;
      logs.push(`🚫 ${sessName} session BLOCKED — ${(sWR*100).toFixed(0)}% win rate`);
    } else if (sTotal >= 10 && sWR >= 0.62) {
      logs.push(`⭐ ${sessName} session HOT — ${(sWR*100).toFixed(0)}% win rate`);
    }
    sessionStatsRef.current[sessName] = us;
    setSessionStats({ ...sessionStatsRef.current });
    supabase.from("session_stats").upsert(us, { onConflict: "session_name" }).then(() => {});

    // ── C. Symbol stats ──
    const sym = trade.symbol;
    const esym = symbolStatsRef.current[sym] || { win_count: 0, loss_count: 0, total_pnl: 0 };
    const usym = {
      symbol:     sym,
      win_count:  esym.win_count  + (won ? 1 : 0),
      loss_count: esym.loss_count + (won ? 0 : 1),
      total_pnl:  +((esym.total_pnl || 0) + pnl).toFixed(2),
      is_blocked: false,
      updated_at: new Date().toISOString(),
    };
    const symTotal = usym.win_count + usym.loss_count;
    const symWR    = symTotal > 0 ? usym.win_count / symTotal : 0.5;
    if (symTotal >= 15 && symWR < 0.38) {
      usym.is_blocked = true;
      logs.push(`🚫 ${sym} BLOCKED — only ${(symWR*100).toFixed(0)}% win rate`);
    }
    symbolStatsRef.current[sym] = usym;
    setSymbolStats({ ...symbolStatsRef.current });
    supabase.from("symbol_stats").upsert(usym, { onConflict: "symbol" }).then(() => {});

    if (logs.length > 0)
      setLearningLog(l => [...logs.map(m => ({ msg: m, time: new Date().toLocaleTimeString() })), ...l.slice(0, 49)]);
  };

  // ── Get AI-adjusted confidence multiplier ──
  const getAIMultiplier = useCallback((ctx) => {
    const { activeIndicators = [], session, symbol, action, candlesForRegime } = ctx;
    const w   = weightsRef.current;
    const ss  = sessionStatsRef.current;
    const sym = symbolStatsRef.current;
    const reg = regimesRef.current[symbol];
    let mult  = 1.0;
    const reasons = [];

    // 1. Indicator weight average
    if (activeIndicators.length > 0) {
      const avg = activeIndicators.reduce((s, i) => s + (w[i] || 1.0), 0) / activeIndicators.length;
      mult *= avg;
      if (avg > 1.15) reasons.push(`🧠 AI boosted indicators ${avg.toFixed(2)}x`);
      else if (avg < 0.75) reasons.push(`🧠 AI weakened indicators ${avg.toFixed(2)}x`);
    }

    // 2. Regime-based multiplier (PRIORITY #2)
    if (reg && action) {
      const pref = REGIME_PREFERENCE[reg.regime]?.[action] ?? 1.0;
      mult *= pref;
      if (pref < 0.7) reasons.push(`📊 Regime: ${reg.regime} — ${action} not ideal`);
      else if (pref > 1.2) reasons.push(`📊 Regime: ${reg.regime} — perfect for ${action}`);
    }

    // 3. Session multiplier (PRIORITY #4)
    if (session && ss[session]) {
      const s = ss[session];
      const total = s.win_count + s.loss_count;
      if (total >= 5) {
        const wr = s.win_count / total;
        if (s.is_blocked) { mult *= 0.2; reasons.push(`🚫 ${session} session blocked`); }
        else if (wr >= 0.65) { mult *= 1.2; reasons.push(`⭐ ${session} hot session`); }
        else if (wr < 0.45)  { mult *= 0.7; reasons.push(`⚠️ ${session} weak`); }
      }
    }

    // 4. Symbol multiplier
    if (symbol && sym[symbol]) {
      const s = sym[symbol];
      const total = s.win_count + s.loss_count;
      if (total >= 10) {
        const wr = s.win_count / total;
        if (s.is_blocked) { mult *= 0.15; reasons.push(`🚫 ${symbol} blocked`); }
        else if (wr >= 0.65) { mult *= 1.15; reasons.push(`⭐ ${symbol} high performer`); }
        else if (wr < 0.45)  { mult *= 0.75; reasons.push(`⚠️ ${symbol} underperforming`); }
      }
    }

    return { multiplier: Math.max(0.1, Math.min(2.0, mult)), reasons };
  }, []);

  // ── AI stake sizing — growth-aware + streak protection (PRIORITY #3) ──
  const getAIStake = useCallback((baseStake, balance, dailyPnl, tradeHistory, growthConfig) => {
    let mult = 1.0;
    const reasons = [];

    // Growth target integration
    if (growthConfig?.startBalance && growthConfig?.dailyTarget) {
      const targetAmt = parseFloat(growthConfig.startBalance) * (parseFloat(growthConfig.dailyTarget) / 100);
      const progress  = targetAmt > 0 ? dailyPnl / targetAmt : 0;
      if      (progress >= 1.0)  { mult *= 0.15; reasons.push("🎯 Daily target HIT — 15% stake protection mode"); }
      else if (progress >= 0.75) { mult *= 0.5;  reasons.push("🎯 75% to target — halving stake"); }
      else if (progress >= 0.5)  { mult *= 0.75; reasons.push("📈 50% to target — slight reduction"); }
      else if (dailyPnl < -(targetAmt * 0.5)) { mult *= 0.4; reasons.push("⚠️ Heavy drawdown — 40% stake"); }
    }

    // Losing streak protection (PRIORITY #1)
    const recent = (tradeHistory || []).slice(0, 8);
    const losses = recent.filter(t => t.result === "LOSS").length;
    const wins   = recent.filter(t => t.result === "WIN").length;
    if      (losses >= 5) { mult *= 0.2; reasons.push(`🛑 ${losses} losses — 20% stake, cooling down`); }
    else if (losses >= 4) { mult *= 0.35; reasons.push(`⚠️ ${losses} losses — 35% stake`); }
    else if (losses >= 3) { mult *= 0.55; reasons.push(`⚠️ ${losses} losses — 55% stake`); }
    else if (wins   >= 5) { mult *= 1.2;  reasons.push(`🔥 ${wins} wins — boosting 20%`); }
    else if (wins   >= 4) { mult *= 1.1;  reasons.push(`🔥 ${wins} win streak`); }

    const finalStake = Math.max(1, Math.min(+(baseStake * mult).toFixed(2), balance * 0.05));
    return { stake: finalStake, multiplier: mult, reasons };
  }, []);

  // ── Save daily growth snapshot ──
  const saveGrowthSnapshot = useCallback(async (balance, dailyPnl, dailyTarget, tradesCount, winRate) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await supabase.from("growth_snapshots").upsert({
        date: today, balance, daily_pnl: dailyPnl,
        daily_target: dailyTarget, trades_count: tradesCount, win_rate: winRate,
      }, { onConflict: "date" });
    } catch (e) { console.error("Growth snapshot error:", e); }
  }, []);

  // ── Fetch full history from Supabase ──
  const fetchTradeHistory = useCallback(async (limit = 300) => {
    try {
      const { data } = await supabase.from("trades").select("*")
        .order("created_at", { ascending: false }).limit(limit);
      return data || [];
    } catch { return []; }
  }, []);

  return {
    weights, sessionStats, symbolStats, regimes,
    aiReady, learningLog,
    recordTrade, getAIMultiplier, getAIStake,
    updateRegime, saveGrowthSnapshot, fetchTradeHistory,
    reloadAI: loadAIData,
  };
}
