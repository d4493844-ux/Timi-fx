import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = "https://pedbupgjxlcumidwoktc.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "";
const APP_ID = "61331";
const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

function calcEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
  return ema;
}
function calcRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50;
  let g = 0, l = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  return 100 - 100 / (1 + g / (l || 0.0001));
}
function calcBB(prices: number[], period = 20) {
  const sl = prices.slice(-period);
  const mean = sl.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std };
}
function calcMACD(prices: number[]) {
  if (prices.length < 26) return { hist: 0 };
  const ema12 = calcEMA(prices.slice(-26), 12);
  const ema26 = calcEMA(prices.slice(-26), 26);
  return { hist: (ema12 - ema26) - calcEMA([ema12 - ema26], 9) };
}
function getSignal(candles: any[]) {
  if (candles.length < 30) return { action: "HOLD", confidence: 0, reasons: [] as string[] };
  const closes = candles.map((c: any) => parseFloat(c.close));
  const ema9 = calcEMA(closes, 9), ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes.slice(-60), 50);
  const rsi = calcRSI(closes), bb = calcBB(closes), macd = calcMACD(closes);
  const price = closes[closes.length - 1];
  let score = 0;
  const reasons: string[] = [];
  if (ema9 > ema21 && ema21 > ema50) { score += 2; reasons.push("EMA bullish"); }
  else if (ema9 < ema21 && ema21 < ema50) { score -= 2; reasons.push("EMA bearish"); }
  if (rsi < 30) { score += 2.5; reasons.push("RSI oversold"); }
  else if (rsi > 70) { score -= 2.5; reasons.push("RSI overbought"); }
  else if (rsi < 45) score += 1; else if (rsi > 55) score -= 1;
  if (price < bb.lower) { score += 2; reasons.push("Below BB"); }
  else if (price > bb.upper) { score -= 2; reasons.push("Above BB"); }
  if (macd.hist > 0) { score += 1.5; reasons.push("MACD bullish"); }
  else { score -= 1.5; reasons.push("MACD bearish"); }
  const confidence = Math.min(Math.round(Math.abs(score) / 9 * 100), 99);
  return { action: score >= 2 ? "BUY" : score <= -2 ? "SELL" : "HOLD", confidence, reasons };
}

// ── Fetch via REST API instead of WebSocket (faster, no timeout issues) ──
async function fetchCandlesREST(symbol: string): Promise<any[]> {
  try {
    const end = Math.floor(Date.now() / 1000);
    const start = end - (100 * 60); // 100 minutes back
    const url = `https://api.deriv.com/api/v2/ticks_history?ticks_history=${symbol}&adjust_start_time=1&count=100&end=latest&granularity=60&style=candles`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    return data.candles || [];
  } catch (e) {
    console.error(`REST candles error for ${symbol}:`, e);
    return [];
  }
}

async function derivWS(token: string, messages: any[]): Promise<any> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}&l=EN&brand=deriv`);
      const results: any[] = [];
      const t = setTimeout(() => {
        try { ws.close(); } catch {}
        resolve(results[results.length - 1] || { error: "timeout" });
      }, 30000);

      let msgIndex = 0;
      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        results.push(d);
        if (d.error) { clearTimeout(t); try { ws.close(); } catch {} resolve(d); return; }
        if (d.msg_type === "authorize" && !d.error && msgIndex < messages.length) {
          ws.send(JSON.stringify(messages[msgIndex++]));
        }
        // Last message response received
        if (msgIndex >= messages.length && d.msg_type !== "authorize") {
          clearTimeout(t); try { ws.close(); } catch {} resolve(d);
        }
      };
      ws.onerror = (e) => { clearTimeout(t); resolve({ error: "ws_error" }); };
    } catch (e) { resolve({ error: String(e) }); }
  });
}

async function getBalance(token: string): Promise<number> {
  const res = await derivWS(token, [{ balance: 1, account: "current" }]);
  return parseFloat(res?.balance?.balance || 0);
}

async function placeTrade(token: string, symbol: string, action: string, stake: number, duration: number): Promise<any> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}&l=EN&brand=deriv`);
      const t = setTimeout(() => { try { ws.close(); } catch {} resolve({ error: "timeout" }); }, 35000);
      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        if (d.error) { clearTimeout(t); try { ws.close(); } catch {} resolve({ error: d.error.message }); return; }
        if (d.msg_type === "authorize")
          ws.send(JSON.stringify({ proposal: 1, amount: stake, basis: "stake", contract_type: action === "BUY" ? "CALL" : "PUT", currency: "USD", duration, duration_unit: "m", symbol }));
        if (d.msg_type === "proposal" && d.proposal)
          ws.send(JSON.stringify({ buy: d.proposal.id, price: d.proposal.ask_price }));
        if (d.msg_type === "buy") { clearTimeout(t); try { ws.close(); } catch {} resolve({ success: true, contractId: d.buy.contract_id, buyPrice: d.buy.buy_price }); }
      };
      ws.onerror = () => { clearTimeout(t); resolve({ error: "ws_error" }); };
    } catch (e) { resolve({ error: String(e) }); }
  });
}

Deno.serve(async (req: Request) => {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  try {
    console.log("🤖 TIMI Edge Function running");

    const { data: config, error: cfgErr } = await supabase
      .from("bot_config").select("*").eq("active", true).limit(1).single();
    if (cfgErr || !config)
      return new Response(JSON.stringify({ status: "error", message: "No bot_config row found." }), { headers });
    if (!config.auto_trade)
      return new Response(JSON.stringify({ status: "paused" }), { headers });

    const token: string = config.token;
    if (!token || token.length < 5)
      return new Response(JSON.stringify({ status: "error", message: "Token missing in bot_config table. Add your Deriv token." }), { headers });

    // Daily target check
    const today = new Date().toISOString().split("T")[0];
    const { data: snap } = await supabase.from("growth_snapshots")
      .select("daily_pnl,trades_count").eq("date", today).single();
    const todayPnl = (snap as any)?.daily_pnl || 0;
    if (config.daily_target > 0 && todayPnl >= config.daily_target)
      return new Response(JSON.stringify({ status: "target_reached", daily_pnl: todayPnl }), { headers });

    // Balance check
    const balance = await getBalance(token);
    console.log(`Balance: $${balance}`);
    if (balance < 1)
      return new Response(JSON.stringify({ status: "low_balance", balance, hint: "Check token is valid and account has funds" }), { headers });

    // Streak check
    const { data: recent } = await supabase.from("trades").select("result")
      .neq("result", "OPEN").order("created_at", { ascending: false }).limit(6);
    const losses = (recent as any[])?.filter(t => t.result === "LOSS").length || 0;
    const stakeMult = losses >= 4 ? 0.3 : losses >= 3 ? 0.5 : 1.0;

    // Max trades check
    const { data: openTrades } = await supabase.from("trades").select("id").eq("result", "OPEN");
    if ((openTrades?.length || 0) >= (config.max_trades || 3))
      return new Response(JSON.stringify({ status: "max_trades_reached" }), { headers });

    // Analyse symbols using REST (faster than WebSocket)
    const symbols: string[] = config.symbols || ["R_75", "R_25", "BOOM1000", "CRASH1000"];
    let bestSig: any = null;

    for (const symbol of symbols) {
      const { data: symStat } = await supabase.from("symbol_stats")
        .select("is_blocked").eq("symbol", symbol).single();
      if ((symStat as any)?.is_blocked) { console.log(`${symbol} blocked`); continue; }

      const candles = await fetchCandlesREST(symbol);
      console.log(`${symbol}: ${candles.length} candles`);
      if (candles.length < 30) continue;

      const sig = getSignal(candles);
      console.log(`${symbol}: ${sig.action} ${sig.confidence}% — ${sig.reasons.join(", ")}`);
      if (sig.action === "HOLD" || sig.confidence < (config.min_confidence || 50)) continue;
      if (!bestSig || sig.confidence > bestSig.confidence) bestSig = { ...sig, symbol };
    }

    if (!bestSig)
      return new Response(JSON.stringify({ status: "no_signal", checked: symbols }), { headers });

    const stake = Math.max(1, +((balance * (config.risk_pct || 2) / 100) * stakeMult).toFixed(2));
    console.log(`📊 TRADING: ${bestSig.action} ${bestSig.symbol} $${stake} stake`);

    const result = await placeTrade(token, bestSig.symbol, bestSig.action, stake, config.duration || 5);
    if (result.error)
      return new Response(JSON.stringify({ status: "trade_error", error: result.error, symbol: bestSig.symbol }), { headers });

    // Save trade
    await supabase.from("trades").insert([{
      symbol: bestSig.symbol, type: bestSig.action, stake, pnl: 0,
      result: "OPEN", session: "background", confidence: bestSig.confidence,
      account_name: "edge_function"
    }]);

    // Update snapshot
    await supabase.from("growth_snapshots").upsert({
      date: today, balance, daily_pnl: todayPnl,
      trades_count: ((snap as any)?.trades_count || 0) + 1
    }, { onConflict: "date" });

    return new Response(JSON.stringify({
      status: "traded", symbol: bestSig.symbol, action: bestSig.action,
      stake, confidence: bestSig.confidence,
      contract_id: result.contractId, balance,
      reasons: bestSig.reasons
    }), { headers });

  } catch (err) {
    console.error("Fatal:", err);
    return new Response(JSON.stringify({ status: "error", message: String(err) }), { status: 500, headers });
  }
});
