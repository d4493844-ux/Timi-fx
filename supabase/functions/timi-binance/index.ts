import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BINANCE_BASE = "https://api.binance.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

async function sign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,"0")).join("");
}

async function getPrice(symbol: string, apiKey: string): Promise<number> {
  const resp = await fetch(`${BINANCE_BASE}/api/v3/ticker/price?symbol=${symbol}`,
    { headers: { "X-MBX-APIKEY": apiKey } });
  const data = await resp.json();
  return parseFloat(data.price || "0");
}

async function getBalance(apiKey: string, secret: string): Promise<Record<string,number>> {
  const ts        = Date.now();
  const query     = `timestamp=${ts}`;
  const signature = await sign(secret, query);
  const resp = await fetch(`${BINANCE_BASE}/api/v3/account?${query}&signature=${signature}`,
    { headers: { "X-MBX-APIKEY": apiKey } });
  const data = await resp.json();
  if (data.code) throw new Error(`Binance: ${data.msg}`);
  const balances: Record<string,number> = {};
  for (const b of data.balances || []) {
    const free = parseFloat(b.free);
    if (free > 0) balances[b.asset] = free;
  }
  return balances;
}

function calcQuantity(usdAmount: number, price: number, stepSize: string): string {
  const step = parseFloat(stepSize);
  const qty  = Math.floor((usdAmount / price) / step) * step;
  const dec  = stepSize.includes(".") ? stepSize.split(".")[1].length : 0;
  return qty.toFixed(dec);
}

async function placeSpotOrder(apiKey: string, secret: string, symbol: string, side: string, usdAmount: number): Promise<any> {
  const price = await getPrice(symbol, apiKey);
  if (!price) throw new Error("Could not get price");

  const infoResp = await fetch(`${BINANCE_BASE}/api/v3/exchangeInfo?symbol=${symbol}`);
  const info     = await infoResp.json();
  const filters  = info.symbols?.[0]?.filters || [];
  const stepSize = filters.find((f:any) => f.filterType==="LOT_SIZE")?.stepSize || "0.00001";
  const minVal   = parseFloat(filters.find((f:any) => f.filterType==="NOTIONAL"||f.filterType==="MIN_NOTIONAL")?.minNotional||"5");

  if (usdAmount < minVal) throw new Error(`Min order $${minVal}, got $${usdAmount}`);

  const qty       = calcQuantity(usdAmount, price, stepSize);
  if (parseFloat(qty) <= 0) throw new Error("Quantity rounds to zero");

  const ts        = Date.now();
  const params    = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${qty}&timestamp=${ts}`;
  const signature = await sign(secret, params);

  const resp = await fetch(`${BINANCE_BASE}/api/v3/order`, {
    method: "POST",
    headers: { "X-MBX-APIKEY": apiKey, "Content-Type": "application/x-www-form-urlencoded" },
    body: `${params}&signature=${signature}`
  });
  const result = await resp.json();
  if (result.code) throw new Error(`Order failed: ${result.msg}`);

  return {
    order_id:   result.orderId,
    symbol:     result.symbol,
    side:       result.side,
    quantity:   result.executedQty,
    price:      result.fills?.[0]?.price || price,
    status:     result.status,
    usd_amount: usdAmount,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: cfg } = await supabase
    .from("bot_config")
    .select("binance_key,binance_secret,binance_enabled,binance_symbols,binance_risk_pct,balance_cache")
    .eq("active", true).single();

  if (!cfg?.binance_enabled) {
    return new Response(JSON.stringify({ status: "binance_disabled" }), { headers: CORS });
  }

  const apiKey = cfg.binance_key;
  const secret = cfg.binance_secret;

  if (!apiKey || !secret) {
    return new Response(JSON.stringify({ status: "no_credentials" }), { headers: CORS });
  }

  try {
    const body     = await req.json().catch(() => ({}));
    const testMode = body.test === true;
    const balances = await getBalance(apiKey, secret);
    const usdtBal  = balances["USDT"] || 0;
    const riskPct  = cfg.binance_risk_pct || 1;
    const stake    = Math.max(5, parseFloat((usdtBal * riskPct / 100).toFixed(2)));
    const symbols  = cfg.binance_symbols || ["BTCUSDT"];

    console.log(`💰 Binance USDT: $${usdtBal} | Stake: $${stake}`);

    if (testMode) {
      return new Response(JSON.stringify({
        status:       "connected",
        usdt_balance: usdtBal,
        all_balances: balances,
        stake,
        symbols,
        message:      "✅ Binance connected successfully!"
      }), { headers: CORS });
    }

    if (usdtBal < 5) {
      return new Response(JSON.stringify({
        status:   "insufficient_balance",
        usdt_balance: usdtBal,
        minimum:  5,
        message:  "Need at least $5 USDT to trade"
      }), { headers: CORS });
    }

    // Place trade if action provided
    if (body.symbol && body.action) {
      const order = await placeSpotOrder(apiKey, secret, body.symbol, body.action==="BUY"?"BUY":"SELL", stake);
      await supabase.from("trades").insert({
        symbol:       body.symbol,
        type:         body.action,
        stake,
        result:       "open",
        confidence:   body.confidence || 0,
        account_name: "binance",
        session:      "binance",
      });
      return new Response(JSON.stringify({ status: "trade_placed", order }), { headers: CORS });
    }

    return new Response(JSON.stringify({ status: "ready", usdt_balance: usdtBal, stake, symbols }), { headers: CORS });

  } catch(e: any) {
    console.error("Binance error:", e.message);
    return new Response(JSON.stringify({ status: "error", error: e.message }), { headers: CORS });
  }
});
