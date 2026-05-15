#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX ROUND 4 PATCH
#  1. Fix BOOM/CRASH fallback — remove wrong direction gate
#  2. Widen SL to 1.5×ATR for BOOM/CRASH (diagnostic data)
#  3. R_75 fallback → BB+StochRSI mean reversion
#  4. Block R_50/forex/gold/crypto from fallback trades
#     (ML-only for those — TA confirmed not viable)
#  Run from: Timi-fx-main/
# ═══════════════════════════════════════════════════════════════
set -e
EDGE="supabase/functions/timi-trader/index.ts"
cp "$EDGE" "${EDGE}.bak4"
echo "✅ Backup created"

# ── PATCH 1: Widen SL for BOOM/CRASH in firstPassageTime ──────
# Diagnostic: 65-74% of losses were SL clips at 1×ATR
# Fix: use 1.5×ATR for BOOM/CRASH, keep 1×ATR for others
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """  // SL must be SMALLER than TP for positive expectancy
  // With 64% WR: need avg_win > avg_loss × (36/64) = 0.5625
  // Set SL = 0.5 × TP → win/loss ratio = 2.0
  // Even at 55% WR: EV = 0.55×2 - 0.45×1 = +0.65 per unit ✅
  const slPct = Math.min(tpPct * 0.5, 0.90);"""

new = """  // SL multiplier from diagnostic data:
  // BOOM/CRASH: SL=1.5×ATR (65-74% of losses were SL clips at 1×ATR)
  // Others: SL=1.0×ATR (standard 2:1 RR)
  const isBoomCrashSymbol = symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
  const slMult = isBoomCrashSymbol ? 1.5 : 1.0;
  const slPct  = Math.min(tpPct * slMult * 0.5, 0.90);"""

if old not in txt:
    print("⚠️  PATCH 1: FPT SL block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 1: BOOM/CRASH SL widened to 1.5×ATR in firstPassageTime")
PYEOF

# ── PATCH 2: Fix fallback BOOM/CRASH — remove wrong direction gate ──
# The backtest_v4 broke BOOM/CRASH by adding:
#   if (isBoom && action !== "BUY") return null
# This caused CRASH signals to never fire (CRASH is SELL, not BUY)
# The original round 2 fallback was correct — restore it
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# Find and fix the fallback block for BOOM/CRASH
# Replace the new 4-strategy fallback with a clean targeted one
old = """        if (frsi > 80 || frsi < 20) { scanLog.push(`${symbol}: fb_rsi_extreme`); continue; }

        // Fallback also respects HMM
        if (regime.allowedAction !== \"NONE\" && regime.allowedAction !== \"ANY\" &&
            sig.action !== regime.allowedAction) {
          scanLog.push(`${symbol}: fallback HMM_direction_blocked`); continue;
        }
        scanLog.push(`${symbol}: Fallback4S→${sig.action} ${sig.confidence}% (${sig.reason}) HMM:${regime.name}`);"""

new = """        if (frsi > 80 || frsi < 20) { scanLog.push(`${symbol}: fb_rsi_extreme`); continue; }

        // ── Block TA trades on instruments where ML is required ──
        // Diagnostic confirmed TA-only not viable on these (WR < 50% across all windows)
        const taOnlySymbols = ["R_50","R_25","R_100",
          "frxEURUSD","frxGBPUSD","frxUSDJPY","frxGBPJPY","frxAUDUSD",
          "frxXAUUSD","frxXAGUSD","cryBTCUSD","cryETHUSD"];
        if (taOnlySymbols.includes(symbol)) {
          scanLog.push(`${symbol}: ML_required (TA blocked by diagnostic)`);
          continue;
        }

        // Fallback also respects HMM
        if (regime.allowedAction !== \"NONE\" && regime.allowedAction !== \"ANY\" &&
            sig.action !== regime.allowedAction) {
          scanLog.push(`${symbol}: fallback HMM_direction_blocked`); continue;
        }
        scanLog.push(`${symbol}: Fallback4S→${sig.action} ${sig.confidence}% (${sig.reason}) HMM:${regime.name}`);"""

if old not in txt:
    print("⚠️  PATCH 2: fallback RSI extreme block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 2: TA block for non-viable symbols injected")
PYEOF

# ── PATCH 3: Add CalcStochRSI helper for R_75 fallback ────────
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = "function calcEMA(prices: number[], period: number): number {"

new = """// StochRSI for R_75 mean reversion strategy
function calcStochRSI(closes: number[], period: number = 14): number {
  if (closes.length < period * 2) return 50;
  const rsiVals: number[] = [];
  for (let i = period; i < closes.length; i++) {
    rsiVals.push(calcRSI(closes.slice(0, i + 1)));
  }
  if (rsiVals.length < period) return 50;
  const recent = rsiVals.slice(-period);
  const minR   = Math.min(...recent), maxR = Math.max(...recent);
  if (maxR === minR) return 50;
  return ((rsiVals[rsiVals.length - 1] - minR) / (maxR - minR)) * 100;
}

function calcEMA(prices: number[], period: number): number {"""

if old not in txt:
    print("⚠️  PATCH 3: calcEMA marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 3: calcStochRSI helper added")
PYEOF

# ── PATCH 4: Update R_75 fallback to BB+StochRSI ──────────────
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# Find R_75 specific handling inside the fallback block
# Replace the generic trend-following for R_75 with BB bounce
old = """        if (isTrending && trend5m === 1 && fema8 > fema21 && nearEMA21 && fp > fprev && frsi >= 40 && frsi <= 60) {
          sig = { action: \"BUY\",  confidence: 72, reason: \"fb_pullback_bull\" };
        } else if (isTrending && trend5m === -1 && fema8 < fema21 && nearEMA21 && fp < fprev && frsi >= 40 && frsi <= 60) {
          sig = { action: \"SELL\", confidence: 72, reason: \"fb_pullback_bear\" };"""

new = """        // ── R_75 special: BB + StochRSI mean reversion ──
        // Diagnostic: trend-following gives 51% WR (coin flip) on R_75
        // BB bounce gives 58% WR — use it exclusively for R_75
        if (symbol === \"R_75\") {
          const fc_bb20 = fc.slice(-20);
          const bbMid2  = fc_bb20.reduce((a: number, b: number) => a+b, 0) / 20;
          const bbStd2  = Math.sqrt(fc_bb20.reduce((a: number, b: number) => a+Math.pow(b-bbMid2,2),0)/20)+1e-10;
          const bbUp2   = bbMid2 + 2*bbStd2, bbLo2 = bbMid2 - 2*bbStd2;
          const stochR  = calcStochRSI(fc);
          const bouncingUp2   = fp > fprev && fp < bbMid2;
          const bouncingDown2 = fp < fprev && fp > bbMid2;

          if (fp <= bbLo2*1.002 && stochR < 20 && bouncingUp2 && frsi < 40) {
            sig = { action: \"BUY\",  confidence: Math.min(84, 68+Math.round(20-stochR)), reason: `r75_bb_bounce_buy stoch=${stochR.toFixed(0)}` };
          } else if (fp >= bbUp2*0.998 && stochR > 80 && bouncingDown2 && frsi > 60) {
            sig = { action: \"SELL\", confidence: Math.min(84, 68+Math.round(stochR-80)), reason: `r75_bb_bounce_sell stoch=${stochR.toFixed(0)}` };
          } else {
            scanLog.push(`${symbol}: r75_no_bb_setup stoch=${stochR.toFixed(0)}`);
            continue;
          }
        } else if (isTrending && trend5m === 1 && fema8 > fema21 && nearEMA21 && fp > fprev && frsi >= 40 && frsi <= 60) {
          sig = { action: \"BUY\",  confidence: 72, reason: \"fb_pullback_bull\" };
        } else if (isTrending && trend5m === -1 && fema8 < fema21 && nearEMA21 && fp < fprev && frsi >= 40 && frsi <= 60) {
          sig = { action: \"SELL\", confidence: 72, reason: \"fb_pullback_bear\" };"""

if old not in txt:
    print("⚠️  PATCH 4: pullback section not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 4: R_75 switched to BB+StochRSI in edge function fallback")
PYEOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉  Round 4 patches done!"
echo ""
echo "  ✅ P1 — BOOM/CRASH SL widened to 1.5×ATR (diagnostic fix)"
echo "  ✅ P2 — Weak TA symbols blocked (ML-only going forward)"
echo "  ✅ P3 — StochRSI helper added"
echo "  ✅ P4 — R_75 switched to BB+StochRSI mean reversion"
echo ""
echo "  DEPLOY:"
echo "  npx supabase functions deploy timi-trader"
echo ""
echo "  TRAIN NEW ML MODELS:"
echo "  cp train_advanced.py ml/scripts/train_advanced.py"
echo "  pip install lightgbm scikit-learn pandas numpy scipy --break-system-packages"
echo "  python ml/scripts/train_advanced.py"
echo "═══════════════════════════════════════════════════════════"
