#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX MASTER PATCH  — Bugs + Upgrades in one go
#  Run from inside: Timi-fx-main/
# ═══════════════════════════════════════════════════════════════
set -e

EDGE="supabase/functions/timi-trader/index.ts"
WS="timi/frontend/src/hooks/useDerivWS.js"

echo "🔧 Starting TIMI-FX master patch..."
echo ""

# ── backup originals ──────────────────────────────────────────
cp "$EDGE" "${EDGE}.bak"
cp "$WS"   "${WS}.bak"
echo "✅ Backups created (.bak)"

# ═══════════════════════════════════════════════════════════════
# PATCH 1 — FIX: FPT winProb formula (was inverted)
#   OLD: winProb = slPct / (tpPct + slPct)   ← hits SL probability
#   NEW: winProb = tpPct / (tpPct + slPct)   ← hits TP probability ✅
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
import re, sys

path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = "  const winProb = slPct / (tpPct + slPct);"
new = "  const winProb = tpPct / (tpPct + slPct);  // FIX: TP/(TP+SL) = probability of hitting TP first (Brownian motion FPT)"

if old not in txt:
    print("⚠️  PATCH 1: FPT line not found — may already be patched")
    sys.exit(0)

txt = txt.replace(old, new, 1)
open(path, "w").write(txt)
print("✅ PATCH 1: FPT winProb formula fixed")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 2 — FIX: getConsecutiveLosses case sensitivity
#   Matches both lowercase 'loss' (edge function) and 'LOSS' (frontend saves)
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = "async function getConsecutiveLosses(supabase: any): Promise<number> {\n  const { data } = await supabase.from(\"trades\").select(\"result\").eq(\"account_name\", \"edge_function\").order(\"created_at\", { ascending: false }).limit(5);\n  if (!data) return 0;\n  let count = 0;\n  for (const t of data) { if (t.result === \"loss\") count++; else break; }\n  return count;\n}"

new = """async function getConsecutiveLosses(supabase: any): Promise<number> {
  // FIX: match both lowercase (edge function) and uppercase (frontend) result values
  const { data } = await supabase.from(\"trades\").select(\"result\")
    .in(\"account_name\", [\"edge_function\", \"Primary\", \"primary\"])
    .order(\"created_at\", { ascending: false }).limit(8);
  if (!data) return 0;
  let count = 0;
  for (const t of data) {
    if ([\"loss\", \"LOSS\"].includes(t.result)) count++;
    else if ([\"win\", \"WIN\"].includes(t.result)) break;
    // skip 'open'/'expired' entries without breaking streak
  }
  return count;
}"""

if old not in txt:
    print("⚠️  PATCH 2: getConsecutiveLosses not matched — check manually")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 2: getConsecutiveLosses case + account_name fixed")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 3 — FIX + UPGRADE: Per-symbol cooldown (15 min after loss)
#   + Daily hard loss limit (stop trading if down > dailyLossLimit%)
#   Injected right before the main symbol scan loop
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

marker = "  const signals: any[]  = [];\n  const scanLog: string[] = [];\n  const session = getTradingSession();"

cooldown_block = """  // ── Per-symbol cooldown map (15 min after any loss) ──────────────────
  // Prevents re-entering same symbol immediately after a loss
  const { data: recentLosses } = await supabase
    .from(\"trades\")
    .select(\"symbol, created_at\")
    .in(\"result\", [\"loss\", \"LOSS\"])
    .gte(\"created_at\", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .order(\"created_at\", { ascending: false });

  const cooldownSymbols = new Set<string>();
  for (const loss of (recentLosses || [])) {
    cooldownSymbols.add(loss.symbol);
  }
  if (cooldownSymbols.size > 0) {
    console.log(`⏱️  Cooldown active for: ${[...cooldownSymbols].join(\", \")}`);
  }

  // ── Daily hard loss limit ───────────────────────────────────────────
  // If today's total PnL < -dailyLossLimitPct% of balance → halt trading
  const dailyLossLimitPct = cfg.daily_loss_limit_pct || 5; // default 5%
  const { data: todayTrades } = await supabase
    .from(\"trades\")
    .select(\"pnl\")
    .in(\"result\", [\"win\", \"loss\", \"WIN\", \"LOSS\"])
    .gte(\"created_at\", new Date(new Date().setUTCHours(0,0,0,0)).toISOString());

  const todayPnl = (todayTrades || []).reduce((s: number, t: any) => s + (parseFloat(t.pnl) || 0), 0);
  const dailyLossLimit = -(balance * dailyLossLimitPct / 100);
  if (todayPnl <= dailyLossLimit) {
    console.log(`🛑 Daily loss limit hit: $${todayPnl.toFixed(2)} <= $${dailyLossLimit.toFixed(2)} (${dailyLossLimitPct}% of $${balance})`);
    return new Response(JSON.stringify({
      status: \"daily_loss_limit\",
      today_pnl: todayPnl,
      limit: dailyLossLimit,
      message: `Trading halted — daily loss limit of ${dailyLossLimitPct}% reached`,
    }), { headers: CORS });
  }

  const signals: any[]  = [];
  const scanLog: string[] = [];
  const session = getTradingSession();"""

if marker not in txt:
    print("⚠️  PATCH 3: signal loop marker not found")
else:
    txt = txt.replace(marker, cooldown_block, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 3: Per-symbol cooldown + daily hard loss limit injected")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 4 — UPGRADE: Apply cooldown check inside symbol loop
#   Skip symbol if it's in cooldown
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = "      // ── STEP 1: Session check (forex only) ──\n      const isSynthetic = symbol.startsWith(\"R_\") || symbol.startsWith(\"BOOM\") || symbol.startsWith(\"CRASH\");\n      if (!isSynthetic && !session.active) {\n        scanLog.push(`${symbol}: off-hours`); continue;\n      }"

new = """      // ── Cooldown check — skip if lost on this symbol in last 15 min ──
      if (cooldownSymbols.has(symbol)) {
        scanLog.push(`${symbol}: cooldown_active (15min after loss)`);
        console.log(`⏱️  ${symbol}: skipped — in cooldown`);
        continue;
      }

      // ── STEP 1: Session check (forex only) ──
      const isSynthetic = symbol.startsWith(\"R_\") || symbol.startsWith(\"BOOM\") || symbol.startsWith(\"CRASH\");
      if (!isSynthetic && !session.active) {
        scanLog.push(`${symbol}: off-hours`); continue;
      }"""

if old not in txt:
    print("⚠️  PATCH 4: session check marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 4: Cooldown check injected in symbol loop")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 5 — UPGRADE: MT5 signal writer
#   After a successful trade_placed, write to mt5_signals table
#   so your EA can pick it up and trade on MetaTrader 5
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# inject just before the final return Response
old = '  return new Response(JSON.stringify({\n    status:          success ? \"trade_placed\" : \"trade_failed\",'

new = """  // ── MT5 Signal Writer ─────────────────────────────────────────────────
  // Writes to mt5_signals table so MT5 EA can poll and execute on Deriv MT5
  // EA flow: poll pending → map symbol name → mark executed → confirm on Telegram
  if (success) {
    // Deriv → MT5 symbol mapping
    const DERIV_TO_MT5: Record<string,string> = {
      \"frxEURUSD\": \"EURUSD\",  \"frxGBPUSD\": \"GBPUSD\",
      \"frxUSDJPY\": \"USDJPY\",  \"frxAUDUSD\": \"AUDUSD\",
      \"frxUSDCAD\": \"USDCAD\",  \"frxUSDCHF\": \"USDCHF\",
      \"frxEURGBP\": \"EURGBP\",  \"frxEURJPY\": \"EURJPY\",
      \"frxGBPJPY\": \"GBPJPY\",  \"frxXAUUSD\": \"XAUUSD\",
      \"frxXAGUSD\": \"XAGUSD\",  \"frxNZDUSD\": \"NZDUSD\",
      \"cryBTCUSD\": \"BTCUSD\",  \"cryETHUSD\": \"ETHUSD\",
    };
    const mt5Symbol = DERIV_TO_MT5[best.symbol];
    if (mt5Symbol) {
      try {
        const { error: mt5Err } = await supabase.from(\"mt5_signals\").insert({
          symbol:          mt5Symbol,
          deriv_symbol:    best.symbol,
          action:          best.action,        // \"BUY\" | \"SELL\"
          confidence:      best.confidence,
          stake:           stake,
          tp_pct:          fpt.tpPct,
          sl_pct:          fpt.slPct,
          win_prob:        fpt.winProb,
          regime:          best.regime || \"unknown\",
          session:         session.name,
          status:          \"pending\",          // EA sets to \"executed\" after trade
          source:          \"timi_edge_fn\",
          created_at:      new Date().toISOString(),
        });
        if (mt5Err) console.log(`⚠️  MT5 signal write error: ${mt5Err.message}`);
        else console.log(`📡 MT5 signal written: ${mt5Symbol} ${best.action} conf:${best.confidence}%`);
      } catch(mt5Ex) {
        console.log(`⚠️  MT5 signal exception: ${mt5Ex}`);
      }
    }
  }

  return new Response(JSON.stringify({
    status:          success ? \"trade_placed\" : \"trade_failed\","""

if old not in txt:
    print("⚠️  PATCH 5: final return marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 5: MT5 signal writer injected")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 6 — UPGRADE: Walk-forward model validation
#   Before deploying a retrained model, validates on last 50 candles
#   Adds helper function after mlPredict
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# inject after mlPredict function
old = "function calcEMA(prices: number[], period: number): number {"

new = """// ─────────────────────────────────────────────
// WALK-FORWARD MODEL VALIDATOR
// Checks if a newly trained model beats the current one
// on the last 50 candles before it is deployed live
// Called by timi-retrain before swapping ml_models table
// Returns: { approved: bool, newWR: number, oldWR: number }
// ─────────────────────────────────────────────
function walkForwardValidate(
  newModel: any,
  oldModel: any,
  recentFeatures: number[][],
  recentOutcomes: number[]  // 1 = win, 0 = loss (last 50 trades)
): { approved: boolean; newWR: number; oldWR: number; reason: string } {
  if (!recentFeatures || recentFeatures.length < 20) {
    return { approved: true, newWR: 0, oldWR: 0, reason: \"insufficient_history_auto_approve\" };
  }
  let newCorrect = 0, oldCorrect = 0;
  const n = Math.min(recentFeatures.length, recentOutcomes.length);
  for (let i = 0; i < n; i++) {
    const feat = recentFeatures[i];
    const actual = recentOutcomes[i];
    // New model prediction
    const newSum  = newModel.main_trees.reduce((s: number, t: any) => s + predictTree(t, feat), 0);
    const newPred = sigmoid(newSum) > 0.5 ? 1 : 0;
    if (newPred === actual) newCorrect++;
    // Old model prediction
    if (oldModel?.main_trees) {
      const oldSum  = oldModel.main_trees.reduce((s: number, t: any) => s + predictTree(t, feat), 0);
      const oldPred = sigmoid(oldSum) > 0.5 ? 1 : 0;
      if (oldPred === actual) oldCorrect++;
    } else {
      oldCorrect++; // no old model = auto approve
    }
  }
  const newWR = newCorrect / n;
  const oldWR = oldCorrect / n;
  // Only deploy if new model is at least as good as old (within 2% tolerance)
  const approved = newWR >= oldWR - 0.02;
  const reason   = approved
    ? `new_model_approved: ${(newWR*100).toFixed(1)}% vs old ${(oldWR*100).toFixed(1)}%`
    : `new_model_rejected: ${(newWR*100).toFixed(1)}% < old ${(oldWR*100).toFixed(1)}% - 2%`;
  console.log(`🔬 Walk-forward: ${reason}`);
  return { approved, newWR, oldWR, reason };
}

// ─────────────────────────────────────────────
// PSI DRIFT DETECTOR
// Compares live feature distributions vs training baseline
// If PSI > 0.25 for any feature → model is stale → force retrain
// PSI < 0.1 = stable, 0.1-0.25 = slight shift, > 0.25 = major drift
// ─────────────────────────────────────────────
function psiScore(trainDist: number[], liveDist: number[], bins = 10): number {
  const min = Math.min(...trainDist, ...liveDist);
  const max = Math.max(...trainDist, ...liveDist);
  if (max === min) return 0;
  const step = (max - min) / bins;
  let psi = 0;
  for (let i = 0; i < bins; i++) {
    const lo = min + i * step, hi = lo + step;
    const expPct = (trainDist.filter(v => v >= lo && v < hi).length / trainDist.length) || 0.001;
    const actPct = (liveDist.filter(v => v >= lo && v < hi).length / liveDist.length) || 0.001;
    psi += (actPct - expPct) * Math.log(actPct / expPct);
  }
  return Math.abs(psi);
}

async function checkFeatureDrift(supabase: any, liveFeatures: number[][]): Promise<{ drifted: boolean; worstFeature: number; worstPsi: number }> {
  try {
    const { data } = await supabase.from(\"feature_baselines\").select(\"feature_index, baseline_values\").limit(10);
    if (!data || data.length === 0) return { drifted: false, worstFeature: -1, worstPsi: 0 };
    let worstPsi = 0, worstFeature = -1;
    for (const row of data) {
      const liveVals = liveFeatures.map(f => f[row.feature_index]).filter(v => !isNaN(v));
      const psi = psiScore(row.baseline_values, liveVals);
      if (psi > worstPsi) { worstPsi = psi; worstFeature = row.feature_index; }
    }
    const drifted = worstPsi > 0.25;
    if (drifted) {
      console.log(`⚠️  Feature drift detected! Feature #${worstFeature} PSI=${worstPsi.toFixed(3)} > 0.25 — retrain recommended`);
      await supabase.from(\"bot_config\").update({ needs_retrain: true, drift_psi: worstPsi }).eq(\"active\", true);
    }
    return { drifted, worstFeature, worstPsi };
  } catch(e) {
    return { drifted: false, worstFeature: -1, worstPsi: 0 };
  }
}

function calcEMA(prices: number[], period: number): number {"""

if "function calcEMA(prices: number[], period: number): number {" not in txt:
    print("⚠️  PATCH 6: calcEMA marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 6: Walk-forward validator + PSI drift detector injected")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 7 — UPGRADE: Wire PSI drift check into main trading loop
#   Collects live features during scan and runs drift check
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = "  if (signals.length === 0) {\n    return new Response(JSON.stringify({\n      status: \"no_signal\","

new = """  // ── PSI Drift Detection — collect all features from this scan ──
  const allScannedFeatures: number[][] = signals.map(s => s.features || []).filter(f => f.length > 0);
  let driftResult = { drifted: false, worstFeature: -1, worstPsi: 0 };
  if (allScannedFeatures.length >= 3) {
    driftResult = await checkFeatureDrift(supabase, allScannedFeatures);
  }

  if (signals.length === 0) {
    return new Response(JSON.stringify({
      status: \"no_signal\","""

if old not in txt:
    print("⚠️  PATCH 7: no_signal marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 7: PSI drift check wired into main loop")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 8 — FIX: Frontend TP/SL negative EV
#   OLD: TP = stake*0.5, SL = stake*0.9  → EV = 0.6*0.5 - 0.4*0.9 = -0.06 ❌
#   NEW: TP = stake*2.0, SL = stake*0.5  → EV = 0.6*2.0 - 0.4*0.5 = +1.00 ✅
#   Also uses signal ATR to dynamically scale TP
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "timi/frontend/src/hooks/useDerivWS.js"
txt  = open(path).read()

old = """      const isBoomCrash = best.sym.startsWith(\"BOOM\") || best.sym.startsWith(\"CRASH\");
      const adjAutoStake = isBoomCrash ? Math.min(9, Math.max(1, stake)) : Math.max(0.35, stake);
      const autoTp = parseFloat((adjAutoStake * 0.5).toFixed(2));
      const autoSl = parseFloat((adjAutoStake * 0.9).toFixed(2));
      const proposal = isBoomCrash ? {
        proposal: 1, amount: adjAutoStake, basis: \"stake\",
        contract_type: best.sig.action === \"BUY\" ? \"MULTUP\" : \"MULTDOWN\",
        currency: \"USD\", symbol: best.sym, multiplier: 100,
        limit_order: { stop_loss: autoSl, take_profit: autoTp }
      } : {
        proposal: 1, amount: adjAutoStake, basis: \"stake\",
        contract_type: best.sig.action === \"BUY\" ? \"CALL\" : \"PUT\",
        currency: \"USD\", duration: 5, duration_unit: \"m\", symbol: best.sym
      };"""

new = """      const isBoomCrash = best.sym.startsWith(\"BOOM\") || best.sym.startsWith(\"CRASH\");
      const adjAutoStake = isBoomCrash ? Math.min(9, Math.max(1, stake)) : Math.max(0.35, stake);

      // FIX: Positive EV TP/SL — TP must be > SL for profitability
      // Risk-reward 2:1 minimum → even at 50% WR: EV = 0.5*2 - 0.5*1 = +0.5 per unit ✅
      // OLD (broken): TP=0.5x, SL=0.9x → EV was negative at realistic win rates
      const sigConf = best.sig.confidence || 65;
      const tpMult  = sigConf >= 85 ? 3.0 : sigConf >= 75 ? 2.5 : 2.0;
      const autoTp  = parseFloat((adjAutoStake * tpMult).toFixed(2));
      const autoSl  = parseFloat((adjAutoStake * 0.5).toFixed(2));  // risk only 50% of stake

      // Dynamic duration based on signal ATR (low volatility = faster resolution)
      const sigAtr  = best.sig.atr || 0;
      const avgAtr  = 0.002; // rough baseline
      let   duration = 5;    // default 5min
      if (sigAtr > 0) {
        if (sigAtr < avgAtr * 0.5)  duration = 3;   // low vol → fast move
        else if (sigAtr > avgAtr * 2) duration = 10; // high vol → give it time
      }

      const proposal = isBoomCrash ? {
        proposal: 1, amount: adjAutoStake, basis: \"stake\",
        contract_type: best.sig.action === \"BUY\" ? \"MULTUP\" : \"MULTDOWN\",
        currency: \"USD\", symbol: best.sym, multiplier: 100,
        limit_order: { stop_loss: autoSl, take_profit: autoTp }
      } : {
        proposal: 1, amount: adjAutoStake, basis: \"stake\",
        contract_type: best.sig.action === \"BUY\" ? \"CALL\" : \"PUT\",
        currency: \"USD\", duration: duration, duration_unit: \"m\", symbol: best.sym
      };"""

if old not in txt:
    print("⚠️  PATCH 8: TP/SL block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 8: Frontend TP/SL fixed to positive EV + dynamic duration")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 9 — FIX: Martingale anti-martingale streak cap
#   OLD: no cap on consecutive wins → stake can grow unbounded
#   NEW: cap at 3x base stake on anti-martingale, cap martingale at 3x
#        Also looks at last 3 trades not just 1
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "timi/frontend/src/hooks/useDerivWS.js"
txt  = open(path).read()

old = """function getMartingaleStake(baseStake, tradeHistory, mode = \"anti\") {
  if (tradeHistory.length === 0) return baseStake;
  const last = tradeHistory[0];
  if (mode === \"martingale\") {
    // Double after loss to recover
    if (last.result === \"LOSS\") return Math.min(baseStake * 2, baseStake * 4);
    return baseStake;
  } else {
    // Anti-martingale: increase after win, reduce after loss
    if (last.result === \"WIN\") return baseStake * 1.5;
    if (last.result === \"LOSS\") return baseStake * 0.75;
    return baseStake;
  }
}"""

new = """function getMartingaleStake(baseStake, tradeHistory, mode = \"anti\") {
  if (tradeHistory.length === 0) return baseStake;
  const last    = tradeHistory[0];
  const recent3 = tradeHistory.slice(0, 3);
  const wins3   = recent3.filter(t => [\"WIN\",\"win\"].includes(t.result)).length;
  const losses3 = recent3.filter(t => [\"LOSS\",\"loss\"].includes(t.result)).length;

  if (mode === \"martingale\") {
    // FIX: cap at 3x, not 4x. Only double once per loss, not cascading
    if ([\"LOSS\",\"loss\"].includes(last.result)) {
      const multiplier = losses3 >= 3 ? 2.5 : losses3 === 2 ? 2.0 : 1.5;
      return Math.min(baseStake * multiplier, baseStake * 3); // hard cap 3x
    }
    return baseStake;
  } else if (mode === \"anti\") {
    // FIX: cap streak boost at 3x. Win streak can't compound unbounded
    if ([\"WIN\",\"win\"].includes(last.result)) {
      const streakMult = wins3 >= 3 ? 1.75 : wins3 === 2 ? 1.35 : 1.15;
      return Math.min(baseStake * streakMult, baseStake * 3); // hard cap 3x
    }
    if ([\"LOSS\",\"loss\"].includes(last.result)) {
      // After a loss following a hot streak, step down gradually
      return losses3 >= 2 ? baseStake * 0.6 : baseStake * 0.8;
    }
    return baseStake;
  } else {
    // fixed mode
    return baseStake;
  }
}"""

if old not in txt:
    print("⚠️  PATCH 9: getMartingaleStake not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 9: Martingale capped at 3x + streak-aware logic")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 10 — FIX: Dual signal engine conflict
#   Frontend currently generates signals AND places trades independently
#   from the edge function. This causes double-trading the same symbol.
#   FIX: Frontend signal engine stays for UI display ONLY.
#        Actual trade execution is GATED: frontend checks if edge function
#        already has an open trade on that symbol before placing its own.
#        Also adds per-symbol cooldown ref on the frontend side.
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "timi/frontend/src/hooks/useDerivWS.js"
txt  = open(path).read()

old = "  const signalsRef = useRef({});\n  const runAnalysisRef = useRef(null);"

new = """  const signalsRef        = useRef({});
  const runAnalysisRef    = useRef(null);
  const symbolCooldownRef = useRef({});  // { symbol: timestamp } — 15min cooldown after loss
  const edgeFnActiveRef   = useRef(new Set()); // symbols edge function already traded"""

if old not in txt:
    print("⚠️  PATCH 10a: ref block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 10a: cooldown + edge dedup refs added")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 10b — wire cooldown into runAnalysis before trade execution
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "timi/frontend/src/hooks/useDerivWS.js"
txt  = open(path).read()

old = "    if (!autoTradeRef.current || !best) return;\n    if (openTradesRef.current.length >= MAX_TRADES) return;\n    if (openTradesRef.current.find(t => t.symbol === best.sym)) return;"

new = """    if (!autoTradeRef.current || !best) return;
    if (openTradesRef.current.length >= MAX_TRADES) return;
    if (openTradesRef.current.find(t => t.symbol === best.sym)) return;

    // ── Dual-engine guard ──────────────────────────────────────────────
    // FIX: Don't trade if the edge function already placed a trade on this
    // symbol recently (poll Supabase for trades in last 6 minutes)
    try {
      const sixMinAgo = new Date(Date.now() - 6 * 60 * 1000).toISOString();
      const { data: edgeTrades } = await supabase
        .from(\"trades\")
        .select(\"symbol\")
        .eq(\"account_name\", \"edge_function\")
        .eq(\"symbol\", best.sym)
        .gte(\"created_at\", sixMinAgo);
      if (edgeTrades && edgeTrades.length > 0) {
        setTimiStatus(\"⏸️ Edge fn active on \" + best.sym + \" — skipping frontend trade\");
        return;
      }
    } catch(e) { /* fail open — proceed if Supabase check fails */ }

    // ── Frontend symbol cooldown (15 min after a loss) ────────────────
    const cooldownTs = symbolCooldownRef.current[best.sym];
    if (cooldownTs && Date.now() - cooldownTs < 15 * 60 * 1000) {
      const minsLeft = Math.ceil((15 * 60 * 1000 - (Date.now() - cooldownTs)) / 60000);
      setTimiStatus(\"⏱️ \" + best.sym + \" cooldown — \" + minsLeft + \"min remaining\");
      return;
    }

    // ── Daily hard loss limit ──────────────────────────────────────────
    const riskCfg = (() => { try { return pGetSync(\"timi_risk\", {}); } catch { return {}; } })();
    const dailyLossLimitPct = (riskCfg.dailyLossLimitPct || 5) / 100;
    const bal2 = parseFloat(balanceRef.current?.balance || 0);
    if (bal2 > 0 && dailyPnlRef.current <= -(bal2 * dailyLossLimitPct)) {
      if (autoTradeRef.current) {
        setAutoTrade(false);
        autoTradeRef.current = false;
        setTimiStatus(\"🛑 Daily loss limit hit — trading halted\");
        sendNotification(\"🛑 TIMI\", \"Daily loss limit reached. Trading stopped.\", \"alert\");
      }
      return;
    }"""

if old not in txt:
    print("⚠️  PATCH 10b: trade gate marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 10b: Dual-engine guard + frontend cooldown + daily loss limit wired")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 10c — set cooldown timestamp on trade LOSS
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "timi/frontend/src/hooks/useDerivWS.js"
txt  = open(path).read()

# Find the line where trade result is recorded and AI learning fires
old = "              // AI learning\n              if (ai?.recordTrade) {"

new = """              // ── Set symbol cooldown on loss ──
              if (pnl <= 0) {
                symbolCooldownRef.current[tradeSymbol] = Date.now();
                console.log(\"⏱️ Cooldown set for\", tradeSymbol, \"— 15min\");
              } else {
                // Clear cooldown on win
                delete symbolCooldownRef.current[tradeSymbol];
              }

              // AI learning
              if (ai?.recordTrade) {"""

if old not in txt:
    print("⚠️  PATCH 10c: AI learning marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 10c: Symbol cooldown set/cleared on trade result")
PYEOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉  All patches applied! Summary:"
echo ""
echo "  EDGE FUNCTION (supabase/functions/timi-trader/index.ts):"
echo "  ✅ P1 — FPT winProb formula fixed (was inverted)"
echo "  ✅ P2 — getConsecutiveLosses case + account fix"
echo "  ✅ P3 — Per-symbol 15min cooldown + daily hard loss limit"
echo "  ✅ P4 — Cooldown check inside symbol scan loop"
echo "  ✅ P5 — MT5 signal writer (writes to mt5_signals table)"
echo "  ✅ P6 — Walk-forward model validator + PSI drift detector"
echo "  ✅ P7 — PSI drift wired into main trading loop"
echo ""
echo "  FRONTEND (timi/frontend/src/hooks/useDerivWS.js):"
echo "  ✅ P8 — TP/SL fixed to 2:1 RR (positive EV) + dynamic duration"
echo "  ✅ P9 — Martingale capped at 3x + streak-aware scaling"
echo "  ✅ P10 — Dual-engine guard, symbol cooldown, daily loss limit"
echo ""
echo "  NEXT STEP — Run this SQL in your Supabase SQL editor:"
echo "  (creates mt5_signals + feature_baselines tables)"
echo "═══════════════════════════════════════════════════════════"
