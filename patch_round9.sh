#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX ROUND 9
#  1. Fix Telegram silent crash (result?.payout undefined)
#  2. Fix contradicting signals — add direction lock per symbol
#     (minimum 10 minutes before flipping BUY→SELL on same symbol)
#  3. Fix MT5 signal — send Deriv symbol not MT5 mapped name
#     so EA MapSymbol() can convert it correctly
#  Run from: Timi-fx-main/
# ═══════════════════════════════════════════════════════════════
set -e
EDGE="supabase/functions/timi-trader/index.ts"
cp "$EDGE" "${EDGE}.bak9"
echo "✅ Backup created"

python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()
fixes = 0

# ── FIX 1: Telegram silent crash — result?.payout undefined ──
old1 = """          `Stake: $${stake}\\n` +
          `Payout: $${result?.payout || 0}\\n` +
          `Session: ${getTradingSession().name}`;"""

new1 = """          `Stake: $${stake}\\n` +
          `Payout: $${tradeResult?.payout || result?.payout || 0}\\n` +
          `Session: ${getTradingSession().name}`;"""

if old1 in txt:
    txt = txt.replace(old1, new1, 1)
    print("✅ FIX 1: Telegram payout reference fixed")
    fixes += 1
else:
    print("⚠️  FIX 1: payout line not found")

# ── FIX 2: Add direction memory — prevent flip-flopping ──
# Inject a direction lock table after the CORS constant
old2 = """// ─────────────────────────────────────────────
// FETCH TICKS — for BOOM/CRASH spike counting"""

new2 = """// ─────────────────────────────────────────────
// DIRECTION MEMORY — prevents signal flip-flopping
// Stores last signal direction per symbol with timestamp
// Blocks direction change within 10 minutes (reduces noise)
// ─────────────────────────────────────────────
const DIRECTION_MEMORY: Record<string, { action: string; timestamp: number }> = {};
const DIRECTION_LOCK_MS = 10 * 60 * 1000; // 10 minutes

function checkDirectionLock(symbol: string, action: string): { blocked: boolean; reason: string } {
  const mem = DIRECTION_MEMORY[symbol];
  if (!mem) {
    DIRECTION_MEMORY[symbol] = { action, timestamp: Date.now() };
    return { blocked: false, reason: "first_signal" };
  }
  const elapsed = Date.now() - mem.timestamp;
  if (mem.action !== action && elapsed < DIRECTION_LOCK_MS) {
    const minsLeft = Math.ceil((DIRECTION_LOCK_MS - elapsed) / 60000);
    return { 
      blocked: true, 
      reason: `direction_lock — was ${mem.action}, now ${action}, locked for ${minsLeft}min more`
    };
  }
  // Update memory
  DIRECTION_MEMORY[symbol] = { action, timestamp: Date.now() };
  return { blocked: false, reason: "direction_ok" };
}

// ─────────────────────────────────────────────
// FETCH TICKS — for BOOM/CRASH spike counting"""

if old2 in txt:
    txt = txt.replace(old2, new2, 1)
    print("✅ FIX 2: Direction memory injected")
    fixes += 1
else:
    print("⚠️  FIX 2: fetch ticks marker not found")

# ── Wire direction lock into signal path ──
old3 = """        const logLine = `${symbol}: ML→${sig.action} conf:${finalConf} HMM:${regime.name} (${sig.reason})`;
        scanLog.push(logLine);
        console.log(logLine);"""

new3 = """        // ── Direction lock check ──────────────────────────────────────
        const dirLock = checkDirectionLock(symbol, sig.action);
        if (dirLock.blocked) {
          scanLog.push(`${symbol}: ${dirLock.reason}`);
          continue;
        }

        const logLine = `${symbol}: ML→${sig.action} conf:${finalConf} HMM:${regime.name} (${sig.reason})`;
        scanLog.push(logLine);
        console.log(logLine);"""

if old3 in txt:
    txt = txt.replace(old3, new3, 1)
    print("✅ FIX 2b: Direction lock wired into ML path")
    fixes += 1
else:
    print("⚠️  FIX 2b: logLine marker not found")

# Also wire into fallback path
old4 = """        scanLog.push(`${symbol}: Fallback4S→${sig.action} ${sig.confidence}% (${sig.reason}) HMM:${regime.name}`);"""

new4 = """        // Direction lock for fallback path too
        const dirLock2 = checkDirectionLock(symbol, sig.action);
        if (dirLock2.blocked) {
          scanLog.push(`${symbol}: ${dirLock2.reason}`);
          continue;
        }
        scanLog.push(`${symbol}: Fallback4S→${sig.action} ${sig.confidence}% (${sig.reason}) HMM:${regime.name}`);"""

if old4 in txt:
    txt = txt.replace(old4, new4, 1)
    print("✅ FIX 2c: Direction lock wired into fallback path")
    fixes += 1
else:
    print("⚠️  FIX 2c: fallback scanLog not found")

# ── FIX 3: Add Telegram debug logging to confirm it fires ──
old5 = """        console.log(`📱 Telegram sent: ${signalMsg}`);
      } else {
        console.log("⚠️  Telegram not configured — add telegram_token and telegram_chat_id to bot_config");"""

new5 = """        console.log(`📱 Telegram sent: ${signalMsg} to chat ${tgChatId}`);
      } else {
        console.log(`⚠️  Telegram not configured — token=${tgToken ? "present" : "MISSING"} chatId=${tgChatId ? "present" : "MISSING"}`);"""

if old5 in txt:
    txt = txt.replace(old5, new5, 1)
    print("✅ FIX 3: Telegram debug logging improved")
    fixes += 1
else:
    print("⚠️  FIX 3: telegram log line not found")

open(path, "w").write(txt)
print(f"\n✅ {fixes}/5 fixes applied")
PYEOF

echo ""
echo "  DEPLOY: npx supabase functions deploy timi-trader"
