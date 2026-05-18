#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX ROUND 7 — Fix Zero Trade Problem
#  1. global → globalThis (Deno fix, still in this version)
#  2. Relax lowConviction gate (OR logic, not AND)
#  3. Reduce cooldown from 15min to 5min
#  4. Circuit breaker only fires at 5 losses not 3
#  5. Bayesian threshold lowered from 0.55 to 0.52
#  6. Duplicate trade guard reduced from 2min to 30sec
#  Run from: Timi-fx-main/
# ═══════════════════════════════════════════════════════════════
set -e
EDGE="supabase/functions/timi-trader/index.ts"
cp "$EDGE" "${EDGE}.bak7"
echo "✅ Backup created"

python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()
fixes = 0

# FIX 1: global → globalThis (Deno compatibility)
count = txt.count("(global as any)")
if count > 0:
    txt = txt.replace("(global as any)", "(globalThis as any)")
    print(f"✅ FIX 1: global→globalThis ({count} instances)")
    fixes += 1
else:
    print("⚠️  FIX 1: already fixed")

# FIX 2: Relax lowConviction — OR logic not AND
# Old: blocks if NEITHER overdue NOR compressed (both must fail)
# New: only block if Poisson prob is very low (< 6%) regardless of topo
old2 = """            const highConviction = poissonResult.overdue && topoResult.preSpikePattern;
            const lowConviction  = !poissonResult.overdue && !topoResult.preSpikePattern;

            if (lowConviction) {
              scanLog.push(`${symbol}: topo_poisson_both_weak — skipping low conviction`);
              continue;
            }"""

new2 = """            const highConviction = poissonResult.overdue && topoResult.preSpikePattern;
            // FIX: Only block if Poisson probability is very low < 6%
            // Don't require BOTH overdue AND compressed — that's too strict
            // Either condition alone is sufficient to allow the trade
            const lowConviction = poissonResult.probability < 0.06;

            if (lowConviction) {
              scanLog.push(`${symbol}: poisson_too_low — prob=${(poissonResult.probability*100).toFixed(1)}% < 6%`);
              continue;
            }"""

if old2 in txt:
    txt = txt.replace(old2, new2, 1)
    print("✅ FIX 2: lowConviction relaxed — Poisson < 6% only")
    fixes += 1
else:
    print("⚠️  FIX 2: lowConviction block not found")

# FIX 3: Reduce cooldown from 15min to 5min
old3 = """  const { data: recentLosses } = await supabase
    .from("trades")
    .select("symbol, created_at")
    .in("result", ["loss", "LOSS"])
    .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });"""

new3 = """  // FIX: Reduced cooldown from 15min to 5min — was blocking too aggressively
  const { data: recentLosses } = await supabase
    .from("trades")
    .select("symbol, created_at")
    .in("result", ["loss", "LOSS"])
    .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });"""

if old3 in txt:
    txt = txt.replace(old3, new3, 1)
    print("✅ FIX 3: Cooldown reduced 15min → 5min")
    fixes += 1
else:
    print("⚠️  FIX 3: cooldown block not found")

# FIX 4: Circuit breaker at 5 losses not 3
old4 = """  const consec = await getConsecutiveLosses(supabase);
  if (consec >= 3) {
    console.log(`⚠️ Circuit breaker active (${consec} losses) — only high confidence trades allowed`);
    // Don't return here — let the pipeline run but boost minimum confidence
    // The scan will naturally filter low confidence signals
    // We just raise the bar during losing streaks
    cfg.min_confidence = Math.max(cfg.min_confidence || 65, 85); // require 85%+ to trade
  }"""

new4 = """  const consec = await getConsecutiveLosses(supabase);
  // FIX: Circuit breaker at 5 losses not 3 — 3 was too sensitive
  // Also reduced confidence boost from 85% to 75% — 85% almost never fires
  if (consec >= 5) {
    console.log(`⚠️ Circuit breaker active (${consec} losses) — raising confidence threshold`);
    cfg.min_confidence = Math.max(cfg.min_confidence || 65, 75); // require 75%+ during losing streak
  } else if (consec >= 3) {
    console.log(`⚠️ Losing streak (${consec} losses) — slight confidence boost`);
    cfg.min_confidence = Math.max(cfg.min_confidence || 65, 70);
  }"""

if old4 in txt:
    txt = txt.replace(old4, new4, 1)
    print("✅ FIX 4: Circuit breaker 3→5 losses, confidence 85%→75%")
    fixes += 1
else:
    print("⚠️  FIX 4: circuit breaker not found")

# FIX 5: Lower Bayesian threshold from 0.55 to 0.52
old5 = """        if (bayesian.winProb < 0.55) {
          scanLog.push(`${symbol}: bayes_skip P(win)=${(bayesian.winProb*100).toFixed(1)}% prior→posterior (${bayesian.recommendation})`);
          continue;
        }"""

new5 = """        // FIX: Lowered Bayesian threshold 0.55→0.52
        // 0.55 was blocking too many valid signals — 0.52 still above break-even
        if (bayesian.winProb < 0.52) {
          scanLog.push(`${symbol}: bayes_skip P(win)=${(bayesian.winProb*100).toFixed(1)}% prior→posterior (${bayesian.recommendation})`);
          continue;
        }"""

if old5 in txt:
    txt = txt.replace(old5, new5, 1)
    print("✅ FIX 5: Bayesian threshold 0.55→0.52")
    fixes += 1
else:
    print("⚠️  FIX 5: Bayesian threshold not found")

# FIX 6: Reduce duplicate guard from 2min to 30sec
old6 = """      // ── Duplicate trade guard — skip if already traded this symbol in last 2 min ──
      const recentDup = await supabase.from("trades")
        .select("id").eq("symbol", symbol)
        .gte("created_at", new Date(Date.now() - 2 * 60 * 1000).toISOString())
        .limit(1);"""

new6 = """      // ── Duplicate trade guard — skip if already traded this symbol in last 30 sec ──
      const recentDup = await supabase.from("trades")
        .select("id").eq("symbol", symbol)
        .gte("created_at", new Date(Date.now() - 30 * 1000).toISOString())
        .limit(1);"""

if old6 in txt:
    txt = txt.replace(old6, new6, 1)
    print("✅ FIX 6: Duplicate guard 2min→30sec")
    fixes += 1
else:
    print("⚠️  FIX 6: duplicate guard not found")

open(path, "w").write(txt)
print(f"\n{'✅' if fixes >= 4 else '⚠️'} {fixes}/6 fixes applied")
PYEOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DEPLOY: npx supabase functions deploy timi-trader"
echo "═══════════════════════════════════════════════════════════"
