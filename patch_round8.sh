#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX ROUND 8
#  1. Telegram signal sender — EA-compatible SIGNAL:SYM:ACT:CONF
#  2. Daily loss limit reset via Supabase
#  3. Edge function respects manual auto_trade=false from UI
# ═══════════════════════════════════════════════════════════════
set -e
EDGE="supabase/functions/timi-trader/index.ts"
cp "$EDGE" "${EDGE}.bak8"
echo "✅ Backup created"

python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()
fixes = 0

# ── FIX 1: Add Telegram sender + send signal to EA after trade placed ──
old1 = """  return new Response(JSON.stringify({
    status:          success ? \"trade_placed\" : \"trade_failed\",
    signal:          best,"""

new1 = """  // ── Telegram Signal Sender ─────────────────────────────────────────
  // Sends signal in format EA expects: SIGNAL:SYMBOL:ACTION:CONFIDENCE
  // EA (TIMI_Telegram.mq5) parses this format via ParseAndTrade()
  if (success && best) {
    try {
      const tgCfg = await supabase.from("bot_config")
        .select("telegram_token, telegram_chat_id")
        .eq("active", true).single();
      
      const tgToken  = tgCfg.data?.telegram_token  || cfg.telegram_token;
      const tgChatId = tgCfg.data?.telegram_chat_id || cfg.telegram_chat_id;

      if (tgToken && tgChatId) {
        // Format EA expects: SIGNAL:SYMBOL:ACTION:CONFIDENCE
        const signalMsg = `SIGNAL:${best.symbol}:${best.action}:${best.confidence}`;
        // Also send human-readable summary
        const humanMsg  = `🤖 TIMI Signal\\n` +
          `Symbol: ${best.symbol}\\n` +
          `Action: ${best.action}\\n` +
          `Confidence: ${best.confidence}%\\n` +
          `Bayesian WR: ${(best.bayesian_win_prob*100).toFixed(1)}%\\n` +
          `Stake: $${stake}\\n` +
          `Payout: $${result?.payout || 0}\\n` +
          `Session: ${getTradingSession().name}`;

        const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
        
        // Send EA-compatible signal first
        await fetch(tgUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChatId, text: signalMsg })
        });
        // Send human-readable summary
        await fetch(tgUrl, {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: tgChatId, text: humanMsg })
        });
        console.log(`📱 Telegram sent: ${signalMsg}`);
      } else {
        console.log("⚠️  Telegram not configured — add telegram_token and telegram_chat_id to bot_config");
      }
    } catch(tgErr) {
      console.log(`⚠️  Telegram error: ${tgErr}`);
    }
  }

  return new Response(JSON.stringify({
    status:          success ? \"trade_placed\" : \"trade_failed\",
    signal:          best,"""

if old1 in txt:
    txt = txt.replace(old1, new1, 1)
    print("✅ FIX 1: Telegram signal sender added (SIGNAL:SYM:ACT:CONF format)")
    fixes += 1
else:
    print("⚠️  FIX 1: return block not found")

# ── FIX 2: Respect manual auto_trade=false from UI ──
old2 = """  // ── Daily hard loss limit ───────────────────────────────────────────
  // If today's total PnL < -dailyLossLimitPct% of balance → halt trading"""

new2 = """  // ── Manual stop — respect auto_trade=false from UI ─────────────────
  // If user turned off bot from RemoteControl in the app → halt
  if (cfg.auto_trade === false) {
    console.log("🛑 Bot manually stopped via UI (auto_trade=false)");
    return new Response(JSON.stringify({
      status:  "manually_stopped",
      message: "Trading halted — re-enable in app Settings or RemoteControl",
    }), { headers: CORS });
  }

  // ── Daily hard loss limit ───────────────────────────────────────────
  // If today's total PnL < -dailyLossLimitPct% of balance → halt trading"""

if old2 in txt:
    txt = txt.replace(old2, new2, 1)
    print("✅ FIX 2: Manual stop (auto_trade=false) respected")
    fixes += 1
else:
    print("⚠️  FIX 2: daily loss limit marker not found")

open(path, "w").write(txt)
print(f"\n✅ {fixes}/2 fixes applied")
PYEOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉  Round 8 Applied!"
echo ""
echo "  NEXT — Add Telegram credentials to bot_config:"
echo "  ALTER TABLE bot_config"
echo "    ADD COLUMN IF NOT EXISTS telegram_token text,"
echo "    ADD COLUMN IF NOT EXISTS telegram_chat_id text,"
echo "    ADD COLUMN IF NOT EXISTS auto_trade boolean default true;"
echo ""
echo "  UPDATE bot_config SET"
echo "    telegram_token = '8617289462:AAEhpKyWCcFPVEULoaWfOfj7moUJ7MPS_nA',"
echo "    telegram_chat_id = '6367921503',"
echo "    auto_trade = true"
echo "  WHERE active = true;"
echo ""
echo "  RESET DAILY LOSS LIMIT:"
echo "  UPDATE bot_config SET daily_loss_limit_pct = 5 WHERE active = true;"
echo "  DELETE FROM trades"
echo "    WHERE created_at::date = CURRENT_DATE"
echo "    AND result IN ('error','open')"
echo "    AND pnl IS NULL;"
echo ""
echo "  DEPLOY: npx supabase functions deploy timi-trader"
echo "═══════════════════════════════════════════════════════════"
