import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── ML Tree Inference ──
function predictTree(node: any, f: number[]): number {
  if ('v' in node) return node.v;
  return f[node.f] <= node.t ? predictTree(node.l, f) : predictTree(node.r, f);
}
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }

function mlPredict(model: any, featVals: number[]): { action: string; confidence: number; reason: string } {
  const mainSum = model.main_trees.reduce((s: number, t: any) => s + predictTree(t, featVals), 0);
  const mlProb  = sigmoid(mainSum);
  const pred    = mlProb > 0.5 ? 1 : 0;
  const metaF   = [...featVals, mlProb];
  const metaSum = model.meta_trees.reduce((s: number, t: any) => s + predictTree(t, metaF), 0);
  const metaConf = sigmoid(metaSum);
  if (metaConf < model.meta_threshold) return { action: "HOLD", confidence: 0, reason: `meta:${metaConf.toFixed(2)}` };
  const action = pred === 1 ? "BUY" : "SELL";
  const confidence = Math.min(95, Math.round(metaConf * 100));
  return { action, confidence, reason: `ML prob:${mlProb.toFixed(2)} meta:${metaConf.toFixed(2)}` };
}

// ── Feature Engineering (matches Python training exactly) ──
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
  return 100 - 100 / (1 + g / (l || 1e-10));
}
function buildFeatures(candles1m: any[], candles5m: any[]): number[] {
  const c = candles1m.map((x: any) => parseFloat(x.close));
  const h = candles1m.map((x: any) => parseFloat(x.high));
  const lo = candles1m.map((x: any) => parseFloat(x.low));
  const price = c[c.length - 1];
  const prev  = c[c.length - 2];

  const ema8   = calcEMA(c, 8);
  const ema21  = calcEMA(c, 21);
  const ema50  = calcEMA(c.slice(-60), 50);
  const rsi    = calcRSI(c);

  // MACD
  const ema12 = calcEMA(c, 12);
  const ema26 = calcEMA(c, 26);
  const macd_hist = ema12 - ema26;

  // Bollinger Bands
  const slice20 = c.slice(-20);
  const bbMid = slice20.reduce((a: number, b: number) => a + b, 0) / 20;
  const bbStd = Math.sqrt(slice20.reduce((a: number, b: number) => a + Math.pow(b - bbMid, 2), 0) / 20);
  const bbUpper = bbMid + 2 * bbStd;
  const bbLower = bbMid - 2 * bbStd;
  const bb_pos   = (price - bbLower) / (bbUpper - bbLower + 1e-10);
  const bb_width = (bbUpper - bbLower) / (bbMid + 1e-10);

  // ATR
  const atrSlice = candles1m.slice(-14);
  const trs = atrSlice.map((can: any, i: number) => {
    const high = parseFloat(can.high), low = parseFloat(can.low), close = parseFloat(can.close);
    const pc = i > 0 ? parseFloat(atrSlice[i-1].close) : close;
    return Math.max(high - low, Math.abs(high - pc), Math.abs(low - pc));
  });
  const atr = trs.reduce((a: number, b: number) => a + b, 0) / trs.length;
  const atr_pct = atr / (price + 1e-10);

  const ema_bull = (ema8 > ema21 && ema21 > ema50) ? 1 : 0;
  const ema_bear = (ema8 < ema21 && ema21 < ema50) ? 1 : 0;

  const candle_body = (price - prev) / (prev + 1e-10);
  const candle_dir  = candle_body > 0 ? 1 : -1;
  const high_low_range = (h[h.length-1] - lo[lo.length-1]) / (lo[lo.length-1] + 1e-10);

  const mom = (lag: number) => (price - c[c.length-1-lag]) / (c[c.length-1-lag] + 1e-10);

  // 5M trend
  let trend5m = 0;
  if (candles5m.length >= 50) {
    const c5 = candles5m.map((x: any) => parseFloat(x.close));
    const e20 = calcEMA(c5, 20);
    const e50 = calcEMA(c5, 50);
    const r5  = calcRSI(c5);
    trend5m = e20 > e50 && r5 > 50 ? 1 : e20 < e50 && r5 < 50 ? -1 : 0;
  }

  return [
    rsi, macd_hist, bb_pos, bb_width,
    ema_bull, ema_bear,
    (price - ema8)  / (ema8  + 1e-10),
    (price - ema21) / (ema21 + 1e-10),
    (price - ema50) / (ema50 + 1e-10),
    atr_pct, candle_body, candle_dir, high_low_range,
    mom(1), mom(3), mom(5), mom(10),
    rsi < 35 ? 1 : 0,
    rsi > 65 ? 1 : 0,
    rsi >= 45 && rsi <= 55 ? 1 : 0,
    trend5m
  ];
}

// ── Fetch candles via Deriv WebSocket ──
async function fetchCandles(symbol: string, granularity: number, count: number): Promise<any[]> {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 20000);
    ws.onopen = () => ws.send(JSON.stringify({ ticks_history: symbol, adjust_start_time: 1, count, end: "latest", granularity, style: "candles" }));
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error)   { clearTimeout(timeout); ws.close(); resolve([]); }
    };
    ws.onerror = () => { clearTimeout(timeout); resolve([]); };
  });
}

// ── Trading session filter for forex ──
function getTradingSession(): { active: boolean; name: string } {
  const h = new Date().getUTCHours();
  if (h >= 7 && h < 16) return { active: true,  name: "London" };
  if (h >= 12 && h < 21) return { active: true,  name: "New York" };
  return { active: false, name: "Off-hours" };
}

// ── Place trade on Deriv ──
async function placeTrade(token: string, symbol: string, action: string, stake: number, sig: any) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve({ error: "timeout" }); }, 15000);
    let authed = false;
    ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.authorize && !authed) {
        authed = true;
        const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
        const contract = isSynthetic
          ? { buy: 1, subscribe: 1, price: stake, parameters: { amount: stake, basis: "stake", contract_type: action === "BUY" ? "CALL" : "PUT", currency: "USD", duration: 4, duration_unit: "m", symbol } }
          : { buy: 1, subscribe: 1, price: stake, parameters: { amount: stake, basis: "stake", contract_type: "MULTUP", currency: "USD", symbol, multiplier: 100, stop_loss: stake, take_profit: stake * 2 } };
        ws.send(JSON.stringify(contract));
      }
      if (d.buy) { clearTimeout(timeout); ws.close(); resolve(d.buy); }
      if (d.error) { clearTimeout(timeout); ws.close(); resolve({ error: d.error.message }); }
    };
    ws.onerror = () => { clearTimeout(timeout); resolve({ error: "ws error" }); };
  });
}

// ── Check consecutive losses ──
async function getConsecutiveLosses(supabase: any): Promise<number> {
  const { data } = await supabase.from("trades").select("result").eq("account_name","edge_function").order("created_at", { ascending: false }).limit(5);
  if (!data) return 0;
  let count = 0;
  for (const t of data) { if (t.result === "loss") count++; else break; }
  return count;
}

// ── Main handler ──
Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Load config
  const { data: cfg } = await supabase.from("bot_config").select("*").eq("active", true).single();
  if (!cfg || !cfg.auto_trade) return new Response(JSON.stringify({ status: "disabled" }), { headers: { "Content-Type": "application/json" } });

  const token    = cfg.token;
  const symbols  = cfg.symbols || ["BOOM1000","CRASH1000","frxUSDJPY"];
  const riskPct  = cfg.risk_pct || 2;
  const balance  = cfg.balance_cache || 10;
  const stake    = Math.max(0.35, parseFloat(((balance * riskPct) / 100).toFixed(2)));
  const minConf  = cfg.min_confidence || 65;
  const maxTrades= cfg.max_trades || 1;

  // Pause after 3 consecutive losses
  const consec = await getConsecutiveLosses(supabase);
  if (consec >= 3) {
    console.log(`⏸ Paused: ${consec} consecutive losses`);
    return new Response(JSON.stringify({ status: "paused", consecutive_losses: consec }), { headers: { "Content-Type": "application/json" } });
  }

  // Load ML models from Supabase
  const { data: mlRows } = await supabase.from("ml_models").select("symbol, model_json, win_rate");
  const ML_MODELS: Record<string, any> = {};
  for (const row of (mlRows || [])) {
    try { ML_MODELS[row.symbol] = JSON.parse(row.model_json); } catch {}
  }
  console.log(`🧠 Loaded ML models: ${Object.keys(ML_MODELS).join(", ")}`);

  // Scan symbols for signals
  const signals: any[] = [];
  for (const symbol of symbols) {
    try {
      const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
      if (!isSynthetic) {
        const session = getTradingSession();
        if (!session.active) { console.log(`${symbol}: skipped - ${session.name}`); continue; }
      }

      // Fetch candles
      const [c1m, c5m] = await Promise.all([
        fetchCandles(symbol, 60, 200),
        fetchCandles(symbol, 300, 100),
      ]);
      if (c1m.length < 50) { console.log(`${symbol}: not enough candles`); continue; }

      let sig;
      if (ML_MODELS[symbol]) {
        // Use ML model
        const features = buildFeatures(c1m, c5m);
        sig = mlPredict(ML_MODELS[symbol], features);
        console.log(`${symbol}: ML → ${sig.action} conf:${sig.confidence} (${sig.reason})`);
      } else {
        // Fallback: smart strategy for non-ML symbols
        const c = c1m.map((x: any) => parseFloat(x.close));
        const c5 = c5m.map((x: any) => parseFloat(x.close));
        const price = c[c.length-1], prev = c[c.length-2];
        let trend5m = 0;
        if (c5.length >= 50) {
          const e20 = calcEMA(c5, 20), e50 = calcEMA(c5, 50), r5 = calcRSI(c5);
          trend5m = e20 > e50 && r5 > 50 ? 1 : e20 < e50 && r5 < 50 ? -1 : 0;
        }
        if (trend5m === 0) { console.log(`${symbol}: 5M unclear`); continue; }
        const e8 = calcEMA(c, 8), e21 = calcEMA(c, 21);
        const rsi = calcRSI(c);
        const momBull = e8 > e21 && price > e8 && price > prev;
        const momBear = e8 < e21 && price < e8 && price < prev;
        if (trend5m === 1 && momBull && rsi >= 40 && rsi <= 65)
          sig = { action: "BUY",  confidence: 65, reason: "Fallback bull" };
        else if (trend5m === -1 && momBear && rsi >= 35 && rsi <= 60)
          sig = { action: "SELL", confidence: 65, reason: "Fallback bear" };
        else
          sig = { action: "HOLD", confidence: 0, reason: "No fallback signal" };
        console.log(`${symbol}: Fallback → ${sig.action} (${sig.reason})`);
      }

      if (sig.action !== "HOLD" && sig.confidence >= minConf) {
        signals.push({ symbol, ...sig });
      }
    } catch (err) {
      console.error(`${symbol} error:`, err);
    }
  }

  if (signals.length === 0) {
    return new Response(JSON.stringify({ status: "no_signal", scanned: symbols.length }), { headers: { "Content-Type": "application/json" } });
  }

  // Pick highest confidence signal
  signals.sort((a, b) => b.confidence - a.confidence);
  const best = signals[0];
  console.log(`🎯 Best signal: ${best.symbol} ${best.action} ${best.confidence}%`);

  // Place trade
  const result: any = await placeTrade(token, best.symbol, best.action, stake, best);
  const success = result && !result.error;

  // Log to trades table
  await supabase.from("trades").insert({
    symbol: best.symbol,
    type: best.action,
    stake,
    result: success ? "open" : "error",
    confidence: best.confidence,
    account_name: "edge_function",
    notes: best.reason,
  });

  // Update balance cache
  if (success) await supabase.from("bot_config").update({ balance_cache: balance - stake }).eq("active", true);

  return new Response(JSON.stringify({
    status: success ? "trade_placed" : "trade_failed",
    signal: best,
    stake,
    trade: result,
    ml_models_used: Object.keys(ML_MODELS),
    signals_found: signals.length,
  }), { headers: { "Content-Type": "application/json" } });
});
