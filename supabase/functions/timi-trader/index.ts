import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const PROJECT_URL    = "https://pedbupgjxlcumidwoktc.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "";
const APP_ID         = "36544";
const FCM_PROJECT_ID = Deno.env.get("FCM_PROJECT_ID") || "timi-fx";
const FCM_CLIENT_EMAIL = Deno.env.get("FCM_CLIENT_EMAIL") || "";
const FCM_PRIVATE_KEY  = (Deno.env.get("FCM_PRIVATE_KEY") || "").replace(/\\n/g, "\n");

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);

// ── Get OAuth2 token for FCM v1 API ──
async function getFCMAccessToken(): Promise<string> {
  try {
    const now = getNumericDate(0);
    const payload = {
      iss: FCM_CLIENT_EMAIL,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: getNumericDate(60 * 60),
    };
    const keyData = FCM_PRIVATE_KEY;
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemBody = keyData.replace(pemHeader, "").replace(pemFooter, "").replace(/\s/g, "");
    const binaryKey = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8", binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false, ["sign"]
    );
    const jwt = await create({ alg: "RS256", typ: "JWT" }, payload, cryptoKey);
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    const data = await res.json();
    return data.access_token || "";
  } catch (e) {
    console.error("FCM auth error:", e);
    return "";
  }
}

// ── Send push notification via FCM v1 ──
async function sendPush(fcmToken: string, title: string, body: string) {
  if (!fcmToken || !FCM_CLIENT_EMAIL) return;
  try {
    const accessToken = await getFCMAccessToken();
    if (!accessToken) return;
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: { title, body },
            android: {
              priority: "high",
              notification: {
                channel_id: "timi_trades",
                sound: "default",
                default_vibrate_timings: true,
                icon: "ic_launcher",
              },
            },
            webpush: {
              notification: {
                title, body,
                icon: "/logo192.png",
                badge: "/logo192.png",
                requireInteraction: true,
                vibrate: [200, 100, 200],
              },
              fcm_options: { link: "/" },
            },
          },
        }),
      }
    );
    const result = await res.json();
    if (result.error) console.error("FCM send error:", result.error);
    else console.log("✅ Push sent:", result.name);
  } catch (e) {
    console.error("Push error:", e);
  }
}

// ── Indicators ──
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
async function fetchCandlesWS(symbol: string): Promise<any[]> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);
      const t = setTimeout(() => { try { ws.close(); } catch {} resolve([]); }, 12000);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          ticks_history: symbol, adjust_start_time: 1,
          count: 100, end: "latest", granularity: 60, style: "candles"
        }));
      };
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        if (d.candles) {
          clearTimeout(t);
          try { ws.close(); } catch {}
          resolve(d.candles);
        }
        if (d.error) {
          clearTimeout(t);
          try { ws.close(); } catch {}
          console.error(`Candles error ${symbol}:`, d.error.message);
          resolve([]);
        }
      };
      ws.onerror = () => { clearTimeout(t); resolve([]); };
    } catch(e) { resolve([]); }
  });
}
async function getBalance(token: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}&l=EN&brand=deriv`);
      const t = setTimeout(() => { try { ws.close(); } catch {} resolve(0); }, 12000);
      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        if (d.msg_type === "authorize" && !d.error)
          ws.send(JSON.stringify({ balance: 1, account: "current" }));
        if (d.msg_type === "balance") { clearTimeout(t); try { ws.close(); } catch {} resolve(parseFloat(d.balance?.balance || 0)); }
        if (d.error) { clearTimeout(t); try { ws.close(); } catch {} resolve(0); }
      };
      ws.onerror = () => { clearTimeout(t); resolve(0); };
    } catch { resolve(0); }
  });
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
        if (d.msg_type === "authorize") {
          const isForexOrCrypto = symbol.startsWith("frx") || symbol.startsWith("cry");
          const proposal = isForexOrCrypto ? {
            proposal: 1, amount: stake, basis: "stake",
            contract_type: action === "BUY" ? "MULTUP" : "MULTDOWN",
            currency: "USD", symbol, multiplier: 100,
            limit_order: { stop_loss: stake * 0.5, take_profit: stake * 1.5 }
          } : {
            proposal: 1, amount: stake, basis: "stake",
            contract_type: action === "BUY" ? "CALL" : "PUT",
            currency: "USD", duration, duration_unit: "m", symbol,
          };
          ws.send(JSON.stringify(proposal));
        }
        if (d.msg_type === "proposal" && d.proposal)
          ws.send(JSON.stringify({ buy: d.proposal.id, price: d.proposal.ask_price }));
        if (d.msg_type === "buy") { clearTimeout(t); try { ws.close(); } catch {} resolve({ success: true, contractId: d.buy.contract_id, buyPrice: d.buy.buy_price }); }
      };
      ws.onerror = () => { clearTimeout(t); resolve({ error: "ws_error" }); };
    } catch (e) { resolve({ error: String(e) }); }
  });
}

Deno.serve(async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  try {
    console.log("🤖 TIMI Edge Function running");
    const { data: config, error: cfgErr } = await supabase
      .from("bot_config").select("*").eq("active", true).limit(1).single();
    if (cfgErr || !config) return new Response(JSON.stringify({ status: "error", message: "No bot_config found" }), { headers });
    if (!config.auto_trade) return new Response(JSON.stringify({ status: "paused" }), { headers });
    const token: string = config.token;
    if (!token || token.length < 5) return new Response(JSON.stringify({ status: "error", message: "No token in bot_config" }), { headers });

    const today = new Date().toISOString().split("T")[0];
    const { data: snap } = await supabase.from("growth_snapshots").select("daily_pnl,trades_count").eq("date", today).single();
    const todayPnl = (snap as any)?.daily_pnl || 0;
    if (config.daily_target > 0 && todayPnl >= config.daily_target)
      return new Response(JSON.stringify({ status: "target_reached", daily_pnl: todayPnl }), { headers });

    const balance = await getBalance(token);
    if (balance < 1) return new Response(JSON.stringify({ status: "low_balance", balance }), { headers });

    // Close any stuck OPEN trades older than 10 minutes
    await supabase.from("trades")
      .update({ result: "LOSS", pnl: -1 })
      .eq("result", "OPEN")
      .eq("account_name", "edge_function")
      .lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    const { data: recent } = await supabase.from("trades").select("result")
      .neq("result","OPEN").order("created_at",{ascending:false}).limit(6);
    const losses = (recent as any[])?.filter(t => t.result==="LOSS").length || 0;
    const stakeMult = losses >= 4 ? 0.3 : losses >= 3 ? 0.5 : 1.0;

    const { data: openTrades } = await supabase.from("trades").select("id").eq("result","OPEN");
    if ((openTrades?.length||0) >= (config.max_trades||3))
      return new Response(JSON.stringify({ status: "max_trades_reached" }), { headers });

    const symbols: string[] = config.symbols || [
      // Synthetic Indices - fastest signals 24/7
      "R_75", "R_25", "R_50", "R_100",
      "BOOM1000", "BOOM500", "CRASH1000", "CRASH500",
      "1HZ100V", "1HZ75V",
      // Forex pairs - strong signals during market hours
      "frxEURUSD", "frxGBPUSD", "frxUSDJPY",
      "frxGBPJPY", "frxEURJPY", "frxAUDUSD",
      "frxUSDCAD", "frxGBPAUD",
      // Crypto - volatile, good signals
      "cryBTCUSD", "cryETHUSD",
      // Metals - steady trends
      "frxXAUUSD",
    ];
    const minConf = config.min_confidence || 30;
    console.log(`🎯 Min confidence: ${minConf}%`);

    // Fetch candles for all symbols in parallel - much faster
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        try {
          const { data: symStat } = await supabase
            .from("symbol_stats").select("is_active").eq("symbol", symbol).single();
          if (symStat && (symStat as any).is_active === false) return null;
          const candles = await fetchCandlesWS(symbol);
          const sig = getSignal(candles);
          console.log(`${symbol}: ${sig.action} ${sig.confidence}% (need ${minConf}%)`);
          if (sig.action === "HOLD" || sig.confidence < minConf) return null;
          return { ...sig, symbol };
        } catch(e) {
          console.error(`Error processing ${symbol}:`, e);
          return null;
        }
      })
    );

    // Pick best signal
    let bestSig: any = null;
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) {
        if (!bestSig || r.value.confidence > bestSig.confidence) {
          bestSig = r.value;
        }
      }
    }

    if (!bestSig) {
      // Send heartbeat so user knows bot is alive
      const fcmToken = config.fcm_token || "";
      const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      await sendPush(fcmToken, "🤖 TIMI Active", `Checked ${symbols.length} markets at ${now} — no signal yet. Watching...`);
      return new Response(JSON.stringify({ status: "no_signal", checked: symbols }), { headers });
    }

    const stake = Math.max(1, Math.round((balance*(config.risk_pct||2)/100*stakeMult) * 100) / 100);
    console.log(`📊 TRADING: ${bestSig.action} ${bestSig.symbol} $${stake}`);

    const result = await placeTrade(token, bestSig.symbol, bestSig.action, stake, config.duration||5);
    if (result.error) return new Response(JSON.stringify({ status: "trade_error", error: result.error }), { headers });

    // Save trade
    await supabase.from("trades").insert([{
      symbol: bestSig.symbol, type: bestSig.action, stake, pnl: 0,
      result: "OPEN", session: "background", confidence: bestSig.confidence,
      account_name: "edge_function"
    }]);

    // Update snapshot
    await supabase.from("growth_snapshots").upsert({
      date: today, balance, daily_pnl: todayPnl,
      trades_count: ((snap as any)?.trades_count||0)+1
    }, { onConflict: "date" });

    // 🔔 Send push notification
    const fcmToken = config.fcm_token || "";
    const pushTitle = `🤖 TIMI: ${bestSig.action} ${bestSig.symbol}`;
    const pushBody  = `$${stake} stake · ${bestSig.confidence}% confidence · ${bestSig.reasons.slice(0,2).join(", ")}`;
    await sendPush(fcmToken, pushTitle, pushBody);

    return new Response(JSON.stringify({
      status: "traded", symbol: bestSig.symbol, action: bestSig.action,
      stake, confidence: bestSig.confidence,
      contract_id: result.contractId, balance, reasons: bestSig.reasons
    }), { headers });

  } catch (err) {
    console.error("Fatal:", err);
    return new Response(JSON.stringify({ status:"error", message: String(err) }), { status:500, headers });
  }
});
