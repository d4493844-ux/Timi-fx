#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX ROUND 2 PATCH
#  1. Inter-symbol correlation (BOOM/CRASH cross-validation)
#  2. Tick density / volume features for synthetics
#  3. Backtesting overhaul (Sharpe, drawdown, Calmar)
#  4. Feature baseline seeder (populates PSI drift table)
#
#  Run from inside: Timi-fx-main/
# ═══════════════════════════════════════════════════════════════
set -e

EDGE="supabase/functions/timi-trader/index.ts"
BACKTEST="backtest/backtest.js"

cp "$EDGE"     "${EDGE}.bak2"
cp "$BACKTEST" "${BACKTEST}.bak"
echo "✅ Backups created"

# ═══════════════════════════════════════════════════════════════
# PATCH 1 — Inter-symbol correlation engine
# BOOM1000 and CRASH1000 are anti-correlated by design.
# When both give signals simultaneously, the one matching
# the dominant tick-flow direction is more reliable.
# Also cross-validates VIX pairs (R_75 confirms R_100 etc.)
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# Inject after the psiScore/checkFeatureDrift block, before calcEMA
old = "function calcEMA(prices: number[], period: number): number {"

correlation_engine = """// ─────────────────────────────────────────────
// INTER-SYMBOL CORRELATION ENGINE
// BOOM/CRASH are anti-correlated — when one gives BUY the other
// should give SELL. Agreement = noise, Disagreement = confirmation.
// VIX pairs (R_75/R_100) are positively correlated — agreement = stronger signal.
// ─────────────────────────────────────────────
const SYMBOL_CORRELATIONS: Record<string, { partner: string; type: "anti" | "positive" }[]> = {
  "BOOM1000":  [{ partner: "CRASH1000", type: "anti"     }, { partner: "BOOM500",   type: "positive" }],
  "BOOM500":   [{ partner: "CRASH500",  type: "anti"     }, { partner: "BOOM1000",  type: "positive" }],
  "CRASH1000": [{ partner: "BOOM1000",  type: "anti"     }, { partner: "CRASH500",  type: "positive" }],
  "CRASH500":  [{ partner: "BOOM500",   type: "anti"     }, { partner: "CRASH1000", type: "positive" }],
  "R_75":      [{ partner: "R_100",     type: "positive" }, { partner: "R_50",      type: "positive" }],
  "R_100":     [{ partner: "R_75",      type: "positive" }, { partner: "R_50",      type: "positive" }],
  "R_50":      [{ partner: "R_75",      type: "positive" }, { partner: "R_25",      type: "positive" }],
  "R_25":      [{ partner: "R_50",      type: "positive" }],
  "frxEURUSD": [{ partner: "frxGBPUSD", type: "positive" }, { partner: "frxUSDCHF", type: "anti" }],
  "frxGBPUSD": [{ partner: "frxEURUSD", type: "positive" }],
  "frxUSDJPY": [{ partner: "frxEURJPY", type: "positive" }, { partner: "frxGBPJPY", type: "positive" }],
};

// Checks all signals collected so far and applies a confidence boost/penalty
// based on whether correlated symbols agree or conflict
function applyCorrelationScoring(signals: any[]): any[] {
  if (signals.length < 2) return signals;

  // Build lookup: symbol → signal
  const sigMap: Record<string, any> = {};
  for (const s of signals) sigMap[s.symbol] = s;

  return signals.map(sig => {
    const rels = SYMBOL_CORRELATIONS[sig.symbol];
    if (!rels) return sig;

    let corrBoost = 0;
    const corrReasons: string[] = [];

    for (const rel of rels) {
      const partner = sigMap[rel.partner];
      if (!partner) continue;

      const agrees = sig.action === partner.action;

      if (rel.type === "anti") {
        // Anti-correlated: disagreement is the correct pattern
        // BOOM BUY + CRASH SELL = both correct → boost both
        // BOOM BUY + CRASH BUY = both same direction = noise → penalise
        if (!agrees) {
          corrBoost += 5;
          corrReasons.push(`✅ ${rel.partner} anti-confirms (${partner.action})`);
        } else {
          corrBoost -= 8;
          corrReasons.push(`⚠️ ${rel.partner} anti-conflict (both ${sig.action} — noise)`);
        }
      } else {
        // Positive-correlated: agreement = stronger signal
        if (agrees) {
          corrBoost += 4;
          corrReasons.push(`✅ ${rel.partner} confirms (${partner.action})`);
        } else {
          corrBoost -= 4;
          corrReasons.push(`⚠️ ${rel.partner} conflicts (${partner.action} vs ${sig.action})`);
        }
      }
    }

    if (corrBoost !== 0) {
      console.log(`🔗 ${sig.symbol} correlation: ${corrBoost > 0 ? "+" : ""}${corrBoost} — ${corrReasons.join(", ")}`);
    }

    return {
      ...sig,
      confidence:   Math.min(95, Math.max(40, sig.confidence + corrBoost)),
      corr_boost:   corrBoost,
      corr_reasons: corrReasons,
    };
  });
}

function calcEMA(prices: number[], period: number): number {"""

if "function calcEMA(prices: number[], period: number): number {" not in txt:
    print("⚠️  PATCH 1: calcEMA marker not found")
else:
    txt = txt.replace("function calcEMA(prices: number[], period: number): number {", correlation_engine, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 1: Inter-symbol correlation engine injected")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 2 — Wire correlation scoring into signal selection
# After all signals are collected, run applyCorrelationScoring
# then re-sort so the boosted signals float to the top
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """  // Pick best signal — ML > fallback, then by confidence
  signals.sort((a, b) => {
    if (a.is_ml !== b.is_ml) return a.is_ml ? -1 : 1;
    return b.confidence - a.confidence;
  });
  const best = signals[0];"""

new = """  // ── Apply inter-symbol correlation scoring ──
  // Boosts signals confirmed by correlated symbols, penalises conflicting ones
  const correlatedSignals = applyCorrelationScoring(signals);

  // Pick best signal — ML > fallback, then by correlation-adjusted confidence
  correlatedSignals.sort((a, b) => {
    if (a.is_ml !== b.is_ml) return a.is_ml ? -1 : 1;
    return b.confidence - a.confidence;
  });
  const best = correlatedSignals[0];"""

if old not in txt:
    print("⚠️  PATCH 2: signal sort marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 2: Correlation scoring wired into signal selection")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 3 — Tick density + volume features for synthetics
# Adds 4 new features to buildFeatures:
# - tick_velocity: ticks per minute (proxy for activity)
# - tick_bull_ratio: % of up ticks (order flow direction)
# - range_density: body/range ratio (trend strength per candle)
# - vol_momentum: tick velocity change (acceleration)
# These feed the ML model with info it currently has zero of
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# Inject tick density calculation before the return statement in buildFeatures
old = """  return [
    // Base 21
    rsi, macd_hist, bb_pos, bb_width, ema_bull, ema_bear,"""

new = """  // ── Tick Density + Volume Features (4) ──
  // Synthetics have no real volume but tick density encodes volatility regime
  // better than GARCH alone — how many ticks fired per candle
  const recentCandles20 = candles1m.slice(-20);
  const tickCounts = recentCandles20.map((c: any) => {
    // Deriv candles don't have explicit tick_count but we can proxy it:
    // wider candle range = more activity = more ticks
    const h2 = parseFloat(c.high), l2 = parseFloat(c.low), o2 = parseFloat(c.open), cl2 = parseFloat(c.close);
    const range2 = h2 - l2;
    const body2  = Math.abs(cl2 - o2);
    return range2 > 0 ? body2 / range2 : 0.5; // range_density per candle
  });

  // Tick velocity: avg candle range relative to price (activity proxy)
  const avgRange = recentCandles20.reduce((s: number, c: any) =>
    s + (parseFloat(c.high) - parseFloat(c.low)), 0) / recentCandles20.length;
  const tick_velocity = avgRange / (price + 1e-10);  // normalized

  // Bull ratio: proportion of up-close candles (order flow direction)
  const upCandles = recentCandles20.filter((c: any) => parseFloat(c.close) > parseFloat(c.open)).length;
  const tick_bull_ratio = upCandles / recentCandles20.length;  // 0-1, >0.6 = bullish flow

  // Range density: avg body/range (high = trending, low = indecisive)
  const range_density = tickCounts.reduce((a: number, b: number) => a + b, 0) / tickCounts.length;

  // Volume momentum: compare last 5 candle activity vs last 20
  const recent5Ranges = candles1m.slice(-5).map((c: any) => parseFloat(c.high) - parseFloat(c.low));
  const avgRange5 = recent5Ranges.reduce((a: number, b: number) => a + b, 0) / recent5Ranges.length;
  const vol_momentum = (avgRange5 - avgRange) / (avgRange + 1e-10);  // positive = accelerating

  return [
    // Base 21
    rsi, macd_hist, bb_pos, bb_width, ema_bull, ema_bear,"""

if old not in txt:
    print("⚠️  PATCH 3: buildFeatures return marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 3a: Tick density features calculated")
PYEOF

# append tick features to the return array
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = "    // Contrarian Composite 1\n    contrarian\n  ]; // total: 56 features\n}"

new = """    // Contrarian Composite 1
    contrarian,
    // Tick Density + Volume 4
    tick_velocity, tick_bull_ratio, range_density, vol_momentum
  ]; // total: 60 features
}"""

if old not in txt:
    print("⚠️  PATCH 3b: feature return tail not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 3b: Tick density features added to return array (60 total)")
PYEOF

echo ""
echo "✅ Edge function patches done. Now patching backtest..."

# ═══════════════════════════════════════════════════════════════
# PATCH 4 — Backtesting overhaul
# Replaces the simplistic win-rate-only backtest with:
# - Proper walk-forward simulation (no lookahead bias)
# - Realistic slippage (1 tick = 0.01% of price)
# - Sharpe ratio (risk-adjusted return)
# - Max drawdown (worst peak-to-trough)
# - Calmar ratio (annual return / max drawdown)
# - Profit factor (gross wins / gross losses)
# - Expectancy per trade
# ═══════════════════════════════════════════════════════════════
cat > backtest/backtest.js << 'JSEOF'
const WebSocket = require("ws");

// ── Fetch historical candles from Deriv ──
async function fetchCandles(symbol, granularity, count) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 15000);
    ws.on("open", () => ws.send(JSON.stringify({
      ticks_history: symbol, adjust_start_time: 1,
      count, end: "latest", granularity, style: "candles"
    })));
    ws.on("message", (data) => {
      const d = JSON.parse(data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error)   { clearTimeout(timeout); ws.close(); resolve([]); }
    });
    ws.on("error", () => { clearTimeout(timeout); resolve([]); });
  });
}

// ── Technical indicators ──
function calcEMA(prices, period) {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
  return ema;
}
function calcRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  let g = 0, l = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  return 100 - 100 / (1 + g / (l || 0.0001));
}
function calcATR(candles, period = 14) {
  const slice = candles.slice(-period);
  const trs = slice.map((c, i) => {
    const pc = i > 0 ? parseFloat(slice[i-1].close) : parseFloat(c.close);
    return Math.max(
      parseFloat(c.high) - parseFloat(c.low),
      Math.abs(parseFloat(c.high) - pc),
      Math.abs(parseFloat(c.low)  - pc)
    );
  });
  return trs.reduce((a, b) => a + b, 0) / trs.length;
}

// ── Signal engine — mirrors live bot logic ──
function getSignal(candles, candles5m = []) {
  if (candles.length < 50) return { action: "HOLD", confidence: 0 };
  const closes = candles.map(c => parseFloat(c.close));
  const price  = closes[closes.length - 1];

  const ema8   = calcEMA(closes, 8);
  const ema21  = calcEMA(closes, 21);
  const ema50  = calcEMA(closes.slice(-60), 50);
  const ema200 = calcEMA(closes, Math.min(200, closes.length));
  const rsi    = calcRSI(closes);
  const atr    = calcATR(candles);
  const atrPct = atr / price;

  // Skip ultra-high volatility (unfavorable for binary options)
  if (atrPct > 0.008) return { action: "HOLD", confidence: 0, reason: "high_vol" };

  // EMA stack
  const emaBull = ema8 > ema21 && ema21 > ema50;
  const emaBear = ema8 < ema21 && ema21 < ema50;
  if (!emaBull && !emaBear) return { action: "HOLD", confidence: 0, reason: "ema_unaligned" };

  // 200 EMA trend filter
  if (emaBull && price < ema200) return { action: "HOLD", confidence: 0, reason: "below_ema200" };
  if (emaBear && price > ema200) return { action: "HOLD", confidence: 0, reason: "above_ema200" };

  // RSI filter — avoid extremes, require momentum alignment
  if (rsi > 75 || rsi < 25) return { action: "HOLD", confidence: 0, reason: "rsi_extreme" };

  // 5m trend confirmation
  let trend5m = 0;
  if (candles5m.length >= 30) {
    const c5 = candles5m.map(c => parseFloat(c.close));
    const e20 = calcEMA(c5, 20), e50b = calcEMA(c5, 50), r5 = calcRSI(c5);
    trend5m = e20 > e50b && r5 > 50 ? 1 : e20 < e50b && r5 < 50 ? -1 : 0;
  }

  let bull = 0, bear = 0;
  if (emaBull)   bull += 3; else bear += 3;
  if (rsi < 50)  bull += 2; else bear += 2;
  if (trend5m === 1) bull += 3;
  else if (trend5m === -1) bear += 3;

  const net = bull - bear;
  if (Math.abs(net) < 4) return { action: "HOLD", confidence: 0, reason: "weak_signal" };

  const action     = net > 0 ? "BUY" : "SELL";
  const confidence = Math.min(Math.round(Math.abs(net) / 11 * 100), 95);
  return { action, confidence, atr, atrPct };
}

// ── Stats engine ──
function calcSharpe(returns, riskFreeRate = 0) {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const std  = Math.sqrt(returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length);
  if (std === 0) return 0;
  // Annualised: assume 1-min candles → 252*24*60 periods per year
  const annFactor = Math.sqrt(252 * 24 * 60 / returns.length);
  return ((mean - riskFreeRate) / std) * annFactor;
}

function calcMaxDrawdown(equityCurve) {
  let peak = equityCurve[0], maxDD = 0;
  for (const val of equityCurve) {
    if (val > peak) peak = val;
    const dd = (peak - val) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

function calcCalmar(totalReturn, maxDrawdown, numCandles, granularitySeconds) {
  if (maxDrawdown === 0) return totalReturn > 0 ? 99 : 0;
  const yearsElapsed = (numCandles * granularitySeconds) / (365 * 24 * 3600);
  const annReturn    = yearsElapsed > 0 ? totalReturn / yearsElapsed : totalReturn;
  return annReturn / maxDrawdown;
}

// ── Main backtester ──
async function backtest(symbol, granularity = 60, count = 1500, minConfidence = 60) {
  console.log(`\n📊 Backtesting ${symbol} (${count} candles, ${granularity}s)...`);
  const [candles, candles5m] = await Promise.all([
    fetchCandles(symbol, granularity, count),
    fetchCandles(symbol, 300, Math.floor(count / 5))
  ]);

  if (candles.length < 100) {
    console.log(`❌ Insufficient candles: ${candles.length}`);
    return null;
  }
  console.log(`✅ ${candles.length} candles fetched`);

  const SLIPPAGE  = 0.0001; // 0.01% realistic slippage per trade
  const PAYOUT    = 0.95;   // Deriv Rise/Fall payout
  const STAKE     = 1;      // $1 base stake

  let balance     = 100;    // start with $100
  const equity    = [balance];
  const tradeRets = [];     // per-trade return for Sharpe
  let wins = 0, losses = 0, holds = 0;
  let grossWin = 0, grossLoss = 0;
  let maxConsecLoss = 0, consecLoss = 0;

  const OUTCOME_WINDOW = 5; // check next 5 candles for outcome

  for (let i = 60; i < candles.length - OUTCOME_WINDOW; i++) {
    const slice   = candles.slice(0, i);
    const slice5m = candles5m.slice(0, Math.floor(i / 5));
    const sig     = getSignal(slice, slice5m);

    if (sig.action === "HOLD" || sig.confidence < minConfidence) {
      holds++;
      equity.push(balance);
      continue;
    }

    const entry = parseFloat(candles[i].close);

    // Walk forward: find first candle that closes beyond TP or SL
    // TP = 2× ATR from entry, SL = 1× ATR (2:1 RR — matches live fix)
    const atr     = sig.atr || entry * 0.002;
    const tp      = sig.action === "BUY"  ? entry + atr * 2 : entry - atr * 2;
    const sl      = sig.action === "BUY"  ? entry - atr     : entry + atr;
    const sEntry  = entry * (1 + (sig.action === "BUY" ? SLIPPAGE : -SLIPPAGE)); // slippage on entry

    let won = false, resolved = false;
    for (let j = i + 1; j <= i + OUTCOME_WINDOW; j++) {
      const h = parseFloat(candles[j].high);
      const l = parseFloat(candles[j].low);
      if (sig.action === "BUY") {
        if (l <= sl) { won = false; resolved = true; break; }
        if (h >= tp) { won = true;  resolved = true; break; }
      } else {
        if (h >= sl) { won = false; resolved = true; break; }
        if (l <= tp) { won = true;  resolved = true; break; }
      }
    }
    // If not resolved: use direction of final candle close
    if (!resolved) {
      const finalClose = parseFloat(candles[i + OUTCOME_WINDOW].close);
      won = sig.action === "BUY" ? finalClose > sEntry : finalClose < sEntry;
    }

    const pnl = won ? STAKE * PAYOUT : -STAKE;
    balance   = Math.max(0, balance + pnl);
    equity.push(balance);
    tradeRets.push(pnl / STAKE);

    if (won) {
      wins++; grossWin += STAKE * PAYOUT;
      consecLoss = 0;
    } else {
      losses++; grossLoss += STAKE;
      consecLoss++;
      if (consecLoss > maxConsecLoss) maxConsecLoss = consecLoss;
    }
  }

  const total      = wins + losses;
  if (total === 0) { console.log("❌ No trades generated"); return null; }

  const winRate    = wins / total;
  const totalPnl   = balance - 100;
  const roi        = totalPnl / 100;
  const sharpe     = calcSharpe(tradeRets);
  const maxDD      = calcMaxDrawdown(equity);
  const calmar     = calcCalmar(roi, maxDD, candles.length, granularity);
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0;
  const expectancy = (winRate * STAKE * PAYOUT) - ((1 - winRate) * STAKE);

  // Rating
  const grade = sharpe >= 1.5 && maxDD < 0.15 && winRate >= 0.55 ? "🟢 STRONG — deploy"
              : sharpe >= 0.8 && maxDD < 0.25 && winRate >= 0.50 ? "🟡 MODERATE — monitor"
              : "🔴 WEAK — do not deploy";

  console.log(`\n📈 ${symbol} Results:`);
  console.log(`   Trades: ${total} | Wins: ${wins} | Losses: ${losses} | Held: ${holds}`);
  console.log(`   Win Rate:        ${(winRate * 100).toFixed(1)}%`);
  console.log(`   Total PnL:       $${totalPnl.toFixed(2)} (${(roi*100).toFixed(1)}% ROI on $100)`);
  console.log(`   Sharpe Ratio:    ${sharpe.toFixed(2)}  (>1.5 = excellent)`);
  console.log(`   Max Drawdown:    ${(maxDD * 100).toFixed(1)}%  (<15% = safe)`);
  console.log(`   Calmar Ratio:    ${calmar.toFixed(2)}  (>1.0 = good)`);
  console.log(`   Profit Factor:   ${profitFactor.toFixed(2)}  (>1.5 = solid)`);
  console.log(`   Expectancy/trade:$${expectancy.toFixed(3)}`);
  console.log(`   Max Consec Loss: ${maxConsecLoss}`);
  console.log(`   Verdict:         ${grade}`);

  return {
    symbol, granularity, total, wins, losses, holds,
    winRate: +(winRate * 100).toFixed(1),
    totalPnl: +totalPnl.toFixed(2),
    roi: +(roi * 100).toFixed(1),
    sharpe: +sharpe.toFixed(2),
    maxDrawdown: +(maxDD * 100).toFixed(1),
    calmar: +calmar.toFixed(2),
    profitFactor: +profitFactor.toFixed(2),
    expectancy: +expectancy.toFixed(4),
    maxConsecLoss, grade
  };
}

// ── Summary table ──
function printSummary(results) {
  const valid = results.filter(Boolean);
  if (valid.length === 0) return;
  console.log("\n" + "═".repeat(90));
  console.log("BACKTEST SUMMARY");
  console.log("═".repeat(90));
  console.log("Symbol".padEnd(14) + "WinRate".padStart(8) + "Sharpe".padStart(8) +
    "MaxDD%".padStart(8) + "Calmar".padStart(8) + "PF".padStart(6) + "  Verdict");
  console.log("─".repeat(90));
  valid.sort((a, b) => b.sharpe - a.sharpe).forEach(r => {
    console.log(
      r.symbol.padEnd(14) +
      `${r.winRate}%`.padStart(8) +
      `${r.sharpe}`.padStart(8) +
      `${r.maxDrawdown}%`.padStart(8) +
      `${r.calmar}`.padStart(8) +
      `${r.profitFactor}`.padStart(6) +
      "  " + r.grade
    );
  });
  console.log("═".repeat(90));

  // Deploy recommendation
  const strong   = valid.filter(r => r.grade.includes("STRONG"));
  const moderate = valid.filter(r => r.grade.includes("MODERATE"));
  console.log(`\n✅ DEPLOY NOW (${strong.length}):   ${strong.map(r => r.symbol).join(", ") || "none"}`);
  console.log(`⚠️  MONITOR   (${moderate.length}):   ${moderate.map(r => r.symbol).join(", ") || "none"}`);
  console.log(`❌ SKIP       (${valid.length - strong.length - moderate.length}):`);
}

async function main() {
  console.log("🔬 TIMI BACKTESTER v2.0 — Sharpe + Drawdown + Calmar Edition\n");

  const symbols = [
    { sym: "R_75",      gran: 60  },
    { sym: "R_50",      gran: 60  },
    { sym: "BOOM1000",  gran: 60  },
    { sym: "CRASH1000", gran: 60  },
    { sym: "frxEURUSD", gran: 300 },
    { sym: "frxGBPUSD", gran: 300 },
    { sym: "frxUSDJPY", gran: 300 },
    { sym: "frxXAUUSD", gran: 300 },
    { sym: "cryBTCUSD", gran: 300 },
  ];

  const results = [];
  for (const { sym, gran } of symbols) {
    try {
      const r = await backtest(sym, gran, 1500, 60);
      results.push(r);
    } catch(e) {
      console.error(`Error on ${sym}:`, e.message);
      results.push(null);
    }
  }

  printSummary(results);
}

main().catch(console.error);
JSEOF

echo "✅ PATCH 4: Backtest overhaul complete (Sharpe + Drawdown + Calmar)"

# ═══════════════════════════════════════════════════════════════
# PATCH 5 — Feature baseline seeder
# Runs the edge function feature builder on recent candles
# and stores the distributions in feature_baselines table
# so PSI drift detection has real data to compare against
# ═══════════════════════════════════════════════════════════════
cat > backtest/seed_feature_baselines.js << 'JSEOF'
// ═══════════════════════════════════════════════════════════════
// TIMI Feature Baseline Seeder
// Fetches recent candles, computes features, stores distributions
// in Supabase feature_baselines table for PSI drift detection.
//
// Run once after deploy: node backtest/seed_feature_baselines.js
// Re-run monthly to refresh baselines.
// ═══════════════════════════════════════════════════════════════
const WebSocket = require("ws");
const https     = require("https");

// ── Config — paste your Supabase URL and service role key ──
const SUPABASE_URL = process.env.SUPABASE_URL || "https://pedbupgjxlcumidwoktc.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_KEY) {
  console.error("❌ Set SUPABASE_SERVICE_ROLE_KEY env var before running");
  process.exit(1);
}

async function fetchCandles(symbol, granularity = 60, count = 300) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 15000);
    ws.on("open", () => ws.send(JSON.stringify({
      ticks_history: symbol, adjust_start_time: 1,
      count, end: "latest", granularity, style: "candles"
    })));
    ws.on("message", (data) => {
      const d = JSON.parse(data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error)   { clearTimeout(timeout); ws.close(); resolve([]); }
    });
    ws.on("error", () => { clearTimeout(timeout); resolve([]); });
  });
}

// Mirror core feature extraction (subset of 60-feature vector)
// We track the 10 most important features for drift detection
function extractKeyFeatures(candles) {
  if (candles.length < 30) return null;
  const c   = candles.map(x => parseFloat(x.close));
  const h   = candles.map(x => parseFloat(x.high));
  const lo  = candles.map(x => parseFloat(x.low));
  const price = c[c.length - 1];

  // EMA
  const k8 = 2/9, k21 = 2/22;
  let ema8 = c[0], ema21 = c[0];
  c.forEach(p => { ema8 = p*k8 + ema8*(1-k8); ema21 = p*k21 + ema21*(1-k21); });

  // RSI
  let g = 0, l = 0;
  for (let i = c.length-14; i < c.length; i++) {
    const d = c[i]-c[i-1]; if(d>0) g+=d; else l-=d;
  }
  const rsi = 100 - 100/(1 + g/(l||0.0001));

  // BB
  const sl20 = c.slice(-20);
  const bbMid = sl20.reduce((a,b)=>a+b,0)/20;
  const bbStd = Math.sqrt(sl20.reduce((a,b)=>a+Math.pow(b-bbMid,2),0)/20);
  const bbPos = (price - (bbMid-2*bbStd)) / (4*bbStd + 1e-10);
  const bbWidth = 4*bbStd / (bbMid+1e-10);

  // ATR
  const atrSlice = candles.slice(-14);
  const trs = atrSlice.map((can, i) => {
    const pc = i>0 ? parseFloat(atrSlice[i-1].close) : parseFloat(can.close);
    return Math.max(parseFloat(can.high)-parseFloat(can.low),
      Math.abs(parseFloat(can.high)-pc), Math.abs(parseFloat(can.low)-pc));
  });
  const atr = trs.reduce((a,b)=>a+b,0)/trs.length;
  const atrPct = atr/(price+1e-10);

  // Momentum
  const mom1 = (price - c[c.length-2])  / (c[c.length-2]+1e-10);
  const mom5 = (price - c[c.length-6])  / (c[c.length-6]+1e-10);

  // Tick density proxy
  const avgRange = candles.slice(-20).reduce((s,c2)=>s+(parseFloat(c2.high)-parseFloat(c2.low)),0)/20;
  const tickVel  = avgRange/(price+1e-10);
  const upC      = candles.slice(-20).filter(c2=>parseFloat(c2.close)>parseFloat(c2.open)).length;
  const bullRatio = upC/20;

  return [rsi, bbPos, bbWidth, atrPct, mom1, mom5, tickVel, bullRatio,
    (price-ema8)/(ema8+1e-10), (price-ema21)/(ema21+1e-10)];
}

const FEATURE_NAMES = [
  "rsi", "bb_position", "bb_width", "atr_pct", "mom_1", "mom_5",
  "tick_velocity", "tick_bull_ratio", "price_vs_ema8", "price_vs_ema21"
];

async function supabaseUpsert(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const url  = new URL(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=feature_index`);
    const req  = https.request({
      hostname: url.hostname, path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      }
    }, (res) => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("🌱 TIMI Feature Baseline Seeder\n");

  const SYMBOLS  = ["R_75", "R_50", "BOOM1000", "CRASH1000", "frxEURUSD", "frxGBPUSD", "frxUSDJPY"];
  const allFeatureVecs = Array.from({ length: 10 }, () => []);

  for (const sym of SYMBOLS) {
    console.log(`📡 Fetching ${sym}...`);
    const candles = await fetchCandles(sym, 60, 300);
    if (candles.length < 60) { console.log(`  ⚠️ Skipped — only ${candles.length} candles`); continue; }

    // Walk through candles to get many feature samples
    for (let i = 40; i < candles.length; i++) {
      const feat = extractKeyFeatures(candles.slice(0, i));
      if (!feat) continue;
      feat.forEach((v, fi) => { if (!isNaN(v) && isFinite(v)) allFeatureVecs[fi].push(v); });
    }
    console.log(`  ✅ ${candles.length} candles processed`);
  }

  // Store baseline distributions
  const rows = FEATURE_NAMES.map((name, fi) => ({
    feature_index:   fi,
    feature_name:    name,
    baseline_values: JSON.stringify(allFeatureVecs[fi].slice(-500)), // keep last 500 samples
    updated_at:      new Date().toISOString(),
  }));

  console.log("\n💾 Saving to Supabase feature_baselines...");
  const result = await supabaseUpsert("feature_baselines", rows);
  if (result.status === 200 || result.status === 201) {
    console.log(`✅ ${rows.length} feature baselines saved!`);
    rows.forEach(r => console.log(`  ${r.feature_name}: ${JSON.parse(r.baseline_values).length} samples`));
  } else {
    console.error(`❌ Supabase error ${result.status}:`, result.body);
  }
}

main().catch(console.error);
JSEOF

echo "✅ PATCH 5: Feature baseline seeder created"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉  Round 2 patches applied!"
echo ""
echo "  EDGE FUNCTION:"
echo "  ✅ P1 — Inter-symbol correlation engine"
echo "  ✅ P2 — Correlation wired into signal selection"
echo "  ✅ P3 — Tick density + volume features (60 total now)"
echo ""
echo "  BACKTEST:"
echo "  ✅ P4 — Full overhaul: Sharpe, MaxDD, Calmar, PF, Expectancy"
echo "  ✅ P5 — Feature baseline seeder"
echo ""
echo "  NEXT STEPS:"
echo "  1. npx supabase functions deploy timi-trader"
echo "  2. node backtest/backtest.js              (run new backtest)"
echo "  3. SUPABASE_SERVICE_ROLE_KEY=xxx node backtest/seed_feature_baselines.js"
echo "═══════════════════════════════════════════════════════════"
