import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const PROJECT_URL    = "https://pedbupgjxlcumidwoktc.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY") || "";
const APP_ID         = "36544";
const FCM_PROJECT_ID = Deno.env.get("FCM_PROJECT_ID") || "timi-fx";
const FCM_CLIENT_EMAIL = Deno.env.get("FCM_CLIENT_EMAIL") || "";
const FCM_PRIVATE_KEY  = (Deno.env.get("FCM_PRIVATE_KEY") || "").replace(/\\n/g, "\n");

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY);
(globalThis as any).supabaseClient = supabase;

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
// ── Exact same signal logic as the app ──
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
  const mean = sl.reduce((a: number, b: number) => a + b, 0) / period;
  const std = Math.sqrt(sl.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
}
function calcMACD(prices: number[]) {
  if (prices.length < 26) return { hist: 0, macd: 0, signal: 0 };
  const ema12 = calcEMA(prices.slice(-26), 12);
  const ema26 = calcEMA(prices.slice(-26), 26);
  const macd = ema12 - ema26;
  const signal = calcEMA([macd], 9);
  return { hist: macd - signal, macd, signal };
}
function calcStoch(candles: any[], period = 14): number {
  if (candles.length < period) return 50;
  const slice = candles.slice(-period);
  const highs = slice.map((c: any) => parseFloat(c.high));
  const lows = slice.map((c: any) => parseFloat(c.low));
  const close = parseFloat(candles[candles.length - 1].close);
  const hh = Math.max(...highs), ll = Math.min(...lows);
  return hh === ll ? 50 : ((close - ll) / (hh - ll)) * 100;
}
function getTradingSession() {
  const h = new Date().getUTCHours();
  const london = h >= 7 && h < 16;
  const newYork = h >= 12 && h < 21;
  const overlap = london && newYork;
  const strength = overlap ? 3 : (london || newYork) ? 2 : 1;
  return { london, newYork, overlap, strength };
}
function getSignal(candles1m: any[], candles5m: any[] = [], weights: Record<string, number> = {}, symbol: string = "") {
  if (!candles1m || candles1m.length < 30) return { action: "HOLD", confidence: 0, reasons: [] as string[] };
  
  const closes = candles1m.map((c: any) => parseFloat(c.close));
  const ema9 = calcEMA(closes, 9);
  const ema21 = calcEMA(closes, 21);
  const ema50 = calcEMA(closes.slice(-60), 50);
  const rsi = calcRSI(closes);
  const bb = calcBB(closes);
  const macd = calcMACD(closes);
  const stoch = calcStoch(candles1m);
  const price = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  const session = getTradingSession();

  // ── HARD FILTERS - these BLOCK trades completely ──
  // Never trade when RSI is extreme (chasing overbought/oversold)
  if (rsi > 75) return { action: "HOLD", confidence: 0, reasons: ["RSI too overbought - blocked"] };
  if (rsi < 25) return { action: "HOLD", confidence: 0, reasons: ["RSI too oversold - blocked"] };
  
  // Never trade during low session for FOREX only (synthetics trade 24/7)
  const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("1HZ") || 
    symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
  if (!isSynthetic && session.strength < 2) {
    return { action: "HOLD", confidence: 0, reasons: ["Low session - forex blocked"] };
  }

  let bullScore = 0;
  let bearScore = 0;
  const reasons: string[] = [];
  let confirmedIndicators = 0;

  // 1. EMA alignment - ALL THREE must agree
  const emaBull = ema9 > ema21 && ema21 > ema50;
  const emaBear = ema9 < ema21 && ema21 < ema50;
  if (emaBull) { bullScore += 3 * (weights.ema_stack || 1); confirmedIndicators++; reasons.push("EMA stack BUY"); }
  else if (emaBear) { bearScore += 3; confirmedIndicators++; reasons.push("EMA stack SELL"); }
  else return { action: "HOLD", confidence: 0, reasons: ["EMA not aligned - blocked"] };

  // 2. MACD must confirm direction
  if (macd.hist > 0 && macd.macd > macd.signal) { bullScore += 2 * (weights.macd || 1); confirmedIndicators++; reasons.push("MACD BUY"); }
  else if (macd.hist < 0 && macd.macd < macd.signal) { bearScore += 2; confirmedIndicators++; reasons.push("MACD SELL"); }
  else return { action: "HOLD", confidence: 0, reasons: ["MACD not confirming - blocked"] };

  // 3. RSI must be in tradeable zone (not neutral 45-55)
  if (rsi < 45) { bullScore += 2 * (weights.rsi || 1); confirmedIndicators++; reasons.push("RSI bullish " + rsi.toFixed(0)); }
  else if (rsi > 55) { bearScore += 2; confirmedIndicators++; reasons.push("RSI bearish " + rsi.toFixed(0)); }
  else return { action: "HOLD", confidence: 0, reasons: ["RSI neutral - blocked"] };

  // 4. Stochastic confirmation
  if (stoch < 30) { bullScore += 1.5; confirmedIndicators++; reasons.push("Stoch oversold"); }
  else if (stoch > 70) { bearScore += 1.5; confirmedIndicators++; reasons.push("Stoch overbought"); }

  // 5. Bollinger Bands
  if (price < bb.lower) { bullScore += 1.5; reasons.push("Below BB lower"); }
  else if (price > bb.upper) { bearScore += 1.5; reasons.push("Above BB upper"); }

  // 6. EMA crossover bonus
  if (prev < ema9 && price > ema9) { bullScore += 1; reasons.push("EMA cross UP"); }
  else if (prev > ema9 && price < ema9) { bearScore += 1; reasons.push("EMA cross DOWN"); }

  // 7. 5M timeframe must agree - REQUIRED for high confidence
  let multiTF = false;
  if (candles5m && candles5m.length >= 20) {
    const c5 = candles5m.map((c: any) => parseFloat(c.close));
    const ema9_5m = calcEMA(c5, 9);
    const ema21_5m = calcEMA(c5, 21);
    const trend5mBull = ema9_5m > ema21_5m;
    const trend5mBear = ema9_5m < ema21_5m;
    if (bullScore > bearScore && trend5mBull) { bullScore += 2; multiTF = true; reasons.push("5M confirms BUY"); }
    else if (bearScore > bullScore && trend5mBear) { bearScore += 2; multiTF = true; reasons.push("5M confirms SELL"); }
    else return { action: "HOLD", confidence: 0, reasons: ["5M contradicts signal - blocked"] };
  }

  // 8. Session boost for London/NY overlap
  if (session.overlap) {
    bullScore *= 1.15;
    bearScore *= 1.15;
    reasons.push("London/NY overlap");
  }

  // Determine direction - bull and bear must NOT be close
  const netScore = bullScore - bearScore;
  if (Math.abs(netScore) < 3) return { action: "HOLD", confidence: 0, reasons: ["Signal not strong enough"] };

  const action = netScore > 0 ? "BUY" : "SELL";
  const rawScore = Math.abs(netScore);
  
  // Confidence based on how many indicators agree AND score strength
  // Need at least 4 confirmed indicators for any meaningful confidence
  if (confirmedIndicators < 3) return { action: "HOLD", confidence: 0, reasons: ["Not enough indicators"] };
  
  const maxScore = 12;
  let confidence = Math.min(Math.round(rawScore / maxScore * 100), 99);
  
  // Bonus for multi-timeframe confirmation
  if (multiTF) confidence = Math.min(confidence + 10, 99);

  return { action, confidence, reasons };
}
async function getConsecutiveLosses(supabase: any): Promise<number> {
  const { data } = await supabase.from("trades")
    .select("result")
    .eq("account_name", "edge_function")
    .order("created_at", { ascending: false })
    .limit(5);
  if (!data) return 0;
  let count = 0;
  for (const t of data) {
    if (t.result === "LOSS") count++;
    else break;
  }
  return count;
}

function detectEngulfing(candles: any[]): { bullish: boolean, bearish: boolean } {
  if (candles.length < 2) return { bullish: false, bearish: false };
  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];
  const prevOpen = parseFloat(prev.open), prevClose = parseFloat(prev.close);
  const currOpen = parseFloat(curr.open), currClose = parseFloat(curr.close);
  const bullish = prevClose < prevOpen && currClose > currOpen &&
    currOpen < prevClose && currClose > prevOpen;
  const bearish = prevClose > prevOpen && currClose < currOpen &&
    currOpen > prevClose && currClose < prevOpen;
  return { bullish, bearish };
}

async function fetchCandles(symbol: string, granularity: number, count: number): Promise<any[]> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);
      const t = setTimeout(() => { try { ws.close(); } catch {} resolve([]); }, 12000);
      ws.onopen = () => ws.send(JSON.stringify({
        ticks_history: symbol, adjust_start_time: 1,
        count, end: "latest", granularity, style: "candles"
      }));
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        if (d.candles) { clearTimeout(t); try { ws.close(); } catch {} resolve(d.candles); }
        if (d.error) { clearTimeout(t); try { ws.close(); } catch {} resolve([]); }
      };
      ws.onerror = () => { clearTimeout(t); resolve([]); };
    } catch { resolve([]); }
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
async function checkOpenTrades(token: string): Promise<void> {
  try {
    const { data: openTrades } = await (globalThis as any).supabaseClient
      .from("trades")
      .select("*")
      .eq("result", "OPEN")
      .eq("account_name", "edge_function");
    
    if (!openTrades?.length) return;
    
    for (const trade of openTrades) {
      if (!trade.contract_id) {
        // No contract ID - close as unknown after 15 mins
        if (new Date(trade.created_at) < new Date(Date.now() - 15 * 60 * 1000)) {
          await (globalThis as any).supabaseClient
            .from("trades").update({ result: "LOSS", pnl: -trade.stake })
            .eq("id", trade.id);
        }
        continue;
      }
      
      // Check contract result via WebSocket
      const result = await checkContract(token, trade.contract_id);
      if (result && result.is_sold) {
        const pnl = parseFloat(result.profit) || 0;
        await (globalThis as any).supabaseClient
          .from("trades")
          .update({ 
            result: pnl >= 0 ? "WIN" : "LOSS", 
            pnl: Math.round(pnl * 100) / 100 
          })
          .eq("id", trade.id);
        console.log(`✅ Trade closed: ${trade.symbol} ${pnl >= 0 ? "WIN" : "LOSS"} $${pnl}`);
      }
    }
  } catch(e) {
    console.error("checkOpenTrades error:", e);
  }
}

async function checkContract(token: string, contractId: number): Promise<any> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(`wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`);
      const t = setTimeout(() => { try { ws.close(); } catch {} resolve(null); }, 10000);
      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        if (d.msg_type === "authorize" && !d.error) {
          ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: contractId }));
        }
        if (d.msg_type === "proposal_open_contract") {
          clearTimeout(t);
          try { ws.close(); } catch {}
          resolve(d.proposal_open_contract);
        }
        if (d.error) { clearTimeout(t); try { ws.close(); } catch {} resolve(null); }
      };
      ws.onerror = () => { clearTimeout(t); resolve(null); };
    } catch { resolve(null); }
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
            limit_order: { 
              stop_loss: Math.round(stake * 0.5 * 100) / 100, 
              take_profit: Math.round(stake * 2.0 * 100) / 100  // 2:1 reward:risk
            }
          } : {
            proposal: 1, amount: stake, basis: "stake",
            contract_type: action === "BUY" ? "CALL" : "PUT",
            currency: "USD", duration: 4, duration_unit: "m", symbol,
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

    // Check and close any finished open trades first
    await checkOpenTrades(token);

    // ── Strategy: Consecutive loss pause ──
    const consecLosses = await getConsecutiveLosses(supabase);
    if (consecLosses >= 2) {
      console.log(`⚠️ ${consecLosses} consecutive losses - pausing to protect capital`);
      return new Response(JSON.stringify({ 
        status: "paused_consecutive_losses", 
        losses: consecLosses,
        message: "Paused after consecutive losses - protecting capital"
      }), { headers });
    }
    
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

    // ── Load AI weights and symbol stats from Supabase ──
    const [{ data: aiWeights }, { data: symStats }] = await Promise.all([
      supabase.from("ai_weights").select("*"),
      supabase.from("symbol_stats").select("*"),
    ]);

    // Build weights map
    const weights: Record<string, number> = {
      ema_stack: 1.0, ema_crossover: 1.0, rsi: 1.0, macd: 1.0,
      bollinger: 1.0, stochastic: 1.0, multi_timeframe: 1.0,
    };
    if (aiWeights) aiWeights.forEach((r: any) => { weights[r.indicator] = parseFloat(r.weight); });

    // Build symbol performance map
    const symPerf: Record<string, any> = {};
    if (symStats) symStats.forEach((r: any) => { symPerf[r.symbol] = r; });

    console.log(`🧠 AI weights loaded: ${Object.keys(weights).length} indicators`);

    // Fetch candles for all symbols in parallel - much faster
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        try {
          const { data: symStat } = await supabase
            .from("symbol_stats").select("is_active").eq("symbol", symbol).single();
          if (symStat && (symStat as any).is_active === false) return null;
          // Check symbol performance - skip symbols with bad track record
          const perf = symPerf[symbol];
          if (perf) {
            const total = (perf.win_count || 0) + (perf.loss_count || 0);
            const winRate = total > 5 ? (perf.win_count || 0) / total : 1;
            if (winRate < 0.3 && total > 5) {
              console.log(`${symbol}: BLOCKED (win rate ${(winRate*100).toFixed(0)}%)`);
              return null;
            }
          }

          const [candles1m, candles5m, candles15m] = await Promise.all([
            fetchCandles(symbol, 60, 100),
            fetchCandles(symbol, 300, 50),
            fetchCandles(symbol, 900, 30),
          ]);
          console.log(`${symbol}: candles 1m=${candles1m?.length||0} 5m=${candles5m?.length||0} 15m=${candles15m?.length||0}`);
          const sig = getSignal(candles1m, candles5m, weights, symbol);
          
          // ── 15M Trend Filter - only trade WITH higher timeframe ──
          if (sig.action !== "HOLD" && candles15m.length >= 20) {
            const c15 = candles15m.map((c: any) => parseFloat(c.close));
            const ema9_15m = calcEMA(c15, 9);
            const ema21_15m = calcEMA(c15, 21);
            const trend15mBull = ema9_15m > ema21_15m;
            if (sig.action === "BUY" && !trend15mBull) {
              console.log(`${symbol}: BUY blocked - 15M trend is DOWN`);
              return null;
            }
            if (sig.action === "SELL" && trend15mBull) {
              console.log(`${symbol}: SELL blocked - 15M trend is UP`);
              return null;
            }
          }

          // ── Candle Pattern Confirmation ──
          if (sig.action !== "HOLD") {
            const engulf = detectEngulfing(candles1m);
            if (sig.action === "BUY" && !engulf.bullish) {
              console.log(`${symbol}: BUY needs bullish engulfing - not confirmed`);
              // Don't block but reduce confidence
              sig.confidence = Math.max(sig.confidence - 15, 0);
            }
            if (sig.action === "SELL" && !engulf.bearish) {
              console.log(`${symbol}: SELL needs bearish engulfing - not confirmed`);
              sig.confidence = Math.max(sig.confidence - 15, 0);
            }
          }
          console.log(`${symbol}: ${sig.action} ${sig.confidence}% reasons=[${sig.reasons?.join(",")}]` );
          if (sig.action === "HOLD" || sig.confidence < minConf) return null;
          
          // Boost confidence for historically winning symbols
          let finalConf = sig.confidence;
          if (perf) {
            const total = (perf.win_count || 0) + (perf.loss_count || 0);
            const winRate = total > 3 ? (perf.win_count || 0) / total : 0.5;
            if (winRate > 0.6) finalConf = Math.min(finalConf + 10, 99);
            else if (winRate < 0.4) finalConf = Math.max(finalConf - 10, 0);
          }
          if (finalConf < minConf) return null;
          return { ...sig, confidence: finalConf, symbol };
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
      account_name: "edge_function",
      contract_id: result.contractId || null,
    }]);

    // Update symbol stats - track this trade
    const existing = symPerf[bestSig.symbol] || { win_count: 0, loss_count: 0, total_pnl: 0, avg_confidence: 50 };
    await supabase.from("symbol_stats").upsert({
      symbol: bestSig.symbol,
      win_count: existing.win_count || 0,
      loss_count: existing.loss_count || 0,
      total_pnl: existing.total_pnl || 0,
      avg_confidence: Math.round((existing.avg_confidence + bestSig.confidence) / 2),
      last_traded: new Date().toISOString(),
      is_active: true,
    }, { onConflict: "symbol" });

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
