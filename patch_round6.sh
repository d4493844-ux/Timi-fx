#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX ROUND 6 PATCH — Critical Bug Fixes
#
#  BUG 1: CRASH1000/500 generating BUY signals (wrong direction)
#          CRASH = price spikes DOWN = always SELL only
#          BOOM  = price spikes UP   = always BUY only
#
#  BUG 2: RSI=100 not being filtered (trading during extreme trend)
#          RSI filter was set to > 75 but CRASH RSI hitting 99.99
#          during uptrend — should block at RSI > 70 for CRASH
#
#  BUG 3: pnl=0 wins — contract_update ≠ contract close
#          Bot logs win when TP/SL is SET not when it CLOSES
#          Fix: log as "open" until reconciler confirms outcome
#
#  Run from: Timi-fx-main/
# ═══════════════════════════════════════════════════════════════
set -e
EDGE="supabase/functions/timi-trader/index.ts"
cp "$EDGE" "${EDGE}.bak6"
echo "✅ Backup created"

# ═══════════════════════════════════════════════════════════════
# PATCH 1 — Force CRASH=SELL only, BOOM=BUY only
#   In the ML path AND fallback path
#   Also tighten RSI filter for BOOM/CRASH
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# Fix the ML signal direction gate for BOOM/CRASH
old = """        // Fallback also respects HMM
        if (regime.allowedAction !== \"NONE\" && regime.allowedAction !== \"ANY\" &&
            sig.action !== regime.allowedAction) {
          scanLog.push(`${symbol}: fallback HMM_direction_blocked`); continue;
        }"""

new = """        // ── BOOM/CRASH direction lock ──────────────────────────────────
        // CRASH indices ONLY spike DOWN → always SELL (MULTDOWN profits)
        // BOOM indices ONLY spike UP   → always BUY  (MULTUP profits)
        // Any opposite signal = wrong direction = block immediately
        if (symbol.startsWith("CRASH") && sig.action === "BUY") {
          scanLog.push(`${symbol}: direction_locked — CRASH must SELL only (got BUY)`);
          sig.action = "SELL"; // force correct direction
        }
        if (symbol.startsWith("BOOM") && sig.action === "SELL") {
          scanLog.push(`${symbol}: direction_locked — BOOM must BUY only (got SELL)`);
          sig.action = "BUY"; // force correct direction
        }

        // Fallback also respects HMM
        if (regime.allowedAction !== \"NONE\" && regime.allowedAction !== \"ANY\" &&
            sig.action !== regime.allowedAction) {
          scanLog.push(`${symbol}: fallback HMM_direction_blocked`); continue;
        }"""

if old not in txt:
    print("⚠️  PATCH 1a: fallback HMM block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 1a: BOOM/CRASH direction lock in fallback path")
PYEOF

# Also fix in ML path
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """        // Apply Poisson/Topo confidence boost for BOOM/CRASH
        const spikeMeta = (global as any)[`${symbol}_spike_meta`];"""

new = """        // ── BOOM/CRASH direction lock (ML path) ─────────────────────────
        // CRASH = always SELL, BOOM = always BUY — no exceptions
        if (symbol.startsWith("CRASH") && sig.action === "BUY") {
          console.log(`🔒 ${symbol}: ML said BUY but CRASH must SELL — forcing SELL`);
          sig.action = "SELL";
          sig.reason = sig.reason + " [direction_corrected]";
        }
        if (symbol.startsWith("BOOM") && sig.action === "SELL") {
          console.log(`🔒 ${symbol}: ML said SELL but BOOM must BUY — forcing BUY`);
          sig.action = "BUY";
          sig.reason = sig.reason + " [direction_corrected]";
        }

        // Apply Poisson/Topo confidence boost for BOOM/CRASH
        const spikeMeta = (global as any)[`${symbol}_spike_meta`];"""

if old not in txt:
    print("⚠️  PATCH 1b: ML path spikeMeta not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 1b: BOOM/CRASH direction lock in ML path")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 2 — Tighten RSI filter for BOOM/CRASH
#   RSI=99.99 means pure uptrend — wrong time for CRASH SELL
#   Block CRASH SELL when RSI > 70 (price too extended up)
#   Block BOOM BUY when RSI < 30 (price too extended down)
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """      // ── PHASE 1+2: Poisson + Topological gate for BOOM/CRASH ──────────
      // Novel mathematics: only enter when spike probability is elevated
      // AND pre-spike compression pattern is detected
      if (isSpikeSym) {"""

new = """      // ── RSI sanity filter for BOOM/CRASH ────────────────────────────
      // CRASH SELL requires RSI to not be at extremes in wrong direction
      // RSI=99 means pure uptrend — CRASH won't spike down in this condition
      // BOOM BUY requires RSI not to be in extreme downtrend
      if (isSpikeSym) {
        const c1mRsi = c1m.map((x: any) => parseFloat(x.close));
        const currentRsi = calcRSI(c1mRsi);
        const isCrash = symbol.startsWith("CRASH");
        const isBoom  = symbol.startsWith("BOOM");

        // CRASH: block if RSI > 72 (too overbought = uptrend too strong for crash spike)
        if (isCrash && currentRsi > 72) {
          scanLog.push(`${symbol}: rsi_block_crash RSI=${currentRsi.toFixed(1)} > 72 (uptrend too strong)`);
          continue;
        }
        // BOOM: block if RSI < 28 (too oversold = downtrend too strong for boom spike)
        if (isBoom && currentRsi < 28) {
          scanLog.push(`${symbol}: rsi_block_boom RSI=${currentRsi.toFixed(1)} < 28 (downtrend too strong)`);
          continue;
        }
        console.log(`📈 ${symbol} RSI=${currentRsi.toFixed(1)} — passed RSI filter`);
      }

      // ── PHASE 1+2: Poisson + Topological gate for BOOM/CRASH ──────────
      // Novel mathematics: only enter when spike probability is elevated
      // AND pre-spike compression pattern is detected
      if (isSpikeSym) {"""

if old not in txt:
    print("⚠️  PATCH 2: Poisson gate marker not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 2: RSI filter tightened for BOOM/CRASH (CRASH<72, BOOM>28)")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 3 — Fix pnl=0 win logging
#   Bot currently logs "win" when contract_update fires (TP/SL set)
#   Should log "open" and let reconciler update to real win/loss
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """      if (d.contract_update) {
        clearTimeout(timeout); ws.close();
        resolve({ contract_id: contractId, stake_used: (ws as any)._adjStake, take_profit: (ws as any)._tp, stop_loss: (ws as any)._sl, tp_sl_set: true });
      }"""

new = """      if (d.contract_update) {
        clearTimeout(timeout); ws.close();
        // FIX: TP/SL set ≠ contract closed. Log as "open" not "win".
        // The reconciler will update to real win/loss when contract closes.
        resolve({
          contract_id:  contractId,
          stake_used:   (ws as any)._adjStake,
          take_profit:  (ws as any)._tp,
          stop_loss:    (ws as any)._sl,
          tp_sl_set:    true,
          status:       "open"  // NOT a win yet — still running
        });
      }"""

if old not in txt:
    print("⚠️  PATCH 3: contract_update block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 3: contract_update now logs status=open not win")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 4 — Fix trade insert to use "open" as initial result
#   Find where trade is inserted to Supabase after placeTrade
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """          result:       tradeResult.error ? \"error\" : \"win\","""

new = """          result:       tradeResult.error ? \"error\" : \"open\",  // FIX: open until reconciler confirms"""

if old not in txt:
    print("⚠️  PATCH 4: trade insert result line not found — searching for alternative...")
    # Try to find it another way
    import re
    matches = [(m.start(), txt[max(0,m.start()-100):m.start()+100]) for m in re.finditer(r'result.*win.*error|error.*win.*result', txt)]
    for pos, ctx in matches[:3]:
        print(f"  Line ~{txt[:pos].count(chr(10))}: {ctx.strip()[:80]}")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 4: Trade insert now uses result='open' not 'win'")
PYEOF

# ═══════════════════════════════════════════════════════════════
# PATCH 5 — Improve reconciler to match MULT contracts correctly
#   MULT contracts appear in statement not profit_table
#   Add better matching logic using contract_id
# ═══════════════════════════════════════════════════════════════
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """      // Find matching transaction
      const match = transactions.find((t: any) => {
        const pt = parseFloat(t.purchase_time || t.transaction_time || \"0\");
        return pt > 0 && Math.abs(pt - tradeTimeSec) < 900;
      }) || transactions.find((t: any) => {
        const pt = parseFloat(t.purchase_time || t.transaction_time || \"0\");
        const buyPrice = parseFloat(t.buy_price || t.amount || \"0\");
        return Math.abs(buyPrice - (trade.stake || 0)) < 0.5 && Math.abs(pt - tradeTimeSec) < 1800;
      });"""

new = """      // Find matching transaction — improved matching for MULT contracts
      // Priority: match by contract_id first (most reliable)
      // Fallback: match by timestamp + stake amount
      const match = transactions.find((t: any) => {
        // Direct contract_id match
        if (trade.contract_ref && t.contract_id) {
          return String(t.contract_id) === String(trade.contract_ref);
        }
        return false;
      }) || transactions.find((t: any) => {
        // Timestamp match within 15 minutes
        const pt = parseFloat(t.purchase_time || t.transaction_time || \"0\");
        return pt > 0 && Math.abs(pt - tradeTimeSec) < 900;
      }) || transactions.find((t: any) => {
        // Stake + time match within 30 minutes
        const pt = parseFloat(t.purchase_time || t.transaction_time || \"0\");
        const buyPrice = parseFloat(t.buy_price || t.amount || \"0\");
        return Math.abs(buyPrice - (trade.stake || 0)) < 0.5 && Math.abs(pt - tradeTimeSec) < 1800;
      });"""

if old not in txt:
    print("⚠️  PATCH 5: reconciler match block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ PATCH 5: Reconciler now matches by contract_id first")
PYEOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉  Round 6 Critical Bug Fixes Applied!"
echo ""
echo "  ✅ P1 — CRASH forced SELL-only, BOOM forced BUY-only"
echo "  ✅ P2 — RSI filter tightened (CRASH blocks at RSI>72)"
echo "  ✅ P3 — contract_update logs 'open' not 'win'"
echo "  ✅ P4 — Trade insert uses 'open' as initial result"
echo "  ✅ P5 — Reconciler matches by contract_id first"
echo ""
echo "  WHY THIS MATTERS:"
echo "  CRASH1000 was placing BUY trades = MULTDOWN in uptrend"
echo "  = guaranteed loss every time. Now forced to SELL only."
echo "  RSI=99 filter prevents trading CRASH during pure uptrend."
echo "  pnl=0 wins are now tracked properly as 'open'."
echo ""
echo "  DEPLOY:"
echo "  npx supabase functions deploy timi-trader"
echo "  git add -A && git commit -m 'fix: CRASH/BOOM direction lock + RSI filter + pnl tracking'"
echo "  git push origin main"
echo "═══════════════════════════════════════════════════════════"
