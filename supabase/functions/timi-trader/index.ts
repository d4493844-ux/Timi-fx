import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function predictTree(node: any, f: number[]): number {
  if ('v' in node) return node.v;
  return f[node.f] <= node.t ? predictTree(node.l, f) : predictTree(node.r, f);
}
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }

function mlPredict(model: any, featVals: number[]): { action: string; confidence: number; reason: string } {
  const mainSum  = model.main_trees.reduce((s: number, t: any) => s + predictTree(t, featVals), 0);
  const mlProb   = sigmoid(mainSum);
  const pred     = mlProb > 0.5 ? 1 : 0;
  const metaF    = [...featVals, mlProb];
  const metaSum  = model.meta_trees.reduce((s: number, t: any) => s + predictTree(t, metaF), 0);
  const metaConf = sigmoid(metaSum);
  if (metaConf < model.meta_threshold) return { action: "HOLD", confidence: 0, reason: `meta_blocked:${metaConf.toFixed(2)}` };
  const action     = pred === 1 ? "BUY" : "SELL";
  const confidence = Math.min(95, Math.round(metaConf * 100));
  return { action, confidence, reason: `ML:${mlProb.toFixed(2)} meta:${metaConf.toFixed(2)}` };
}

function calcEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1); let ema = prices[0];
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
  const price = c[c.length - 1], prev = c[c.length - 2];
  const ema8 = calcEMA(c, 8), ema21 = calcEMA(c, 21), ema50 = calcEMA(c.slice(-60), 50);
  const rsi  = calcRSI(c);
  const ema12 = calcEMA(c, 12), ema26 = calcEMA(c, 26);
  const macd_hist = ema12 - ema26;
  const slice20 = c.slice(-20);
  const bbMid = slice20.reduce((a: number, b: number) => a + b, 0) / 20;
  const bbStd = Math.sqrt(slice20.reduce((a: number, b: number) => a + Math.pow(b - bbMid, 2), 0) / 20);
  const bbUpper = bbMid + 2 * bbStd, bbLower = bbMid - 2 * bbStd;
  const bb_pos = (price - bbLower) / (bbUpper - bbLower + 1e-10);
  const bb_width = (bbUpper - bbLower) / (bbMid + 1e-10);
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
  let trend5m = 0;
  if (candles5m.length >= 50) {
    const c5 = candles5m.map((x: any) => parseFloat(x.close));
    const e20 = calcEMA(c5, 20), e50 = calcEMA(c5, 50), r5 = calcRSI(c5);
    trend5m = e20 > e50 && r5 > 50 ? 1 : e20 < e50 && r5 < 50 ? -1 : 0;
  }
  return [
    rsi, macd_hist, bb_pos, bb_width, ema_bull, ema_bear,
    (price - ema8) / (ema8 + 1e-10), (price - ema21) / (ema21 + 1e-10), (price - ema50) / (ema50 + 1e-10),
    atr_pct, candle_body, candle_dir, high_low_range,
    mom(1), mom(3), mom(5), mom(10),
    rsi < 35 ? 1 : 0, rsi > 65 ? 1 : 0, rsi >= 45 && rsi <= 55 ? 1 : 0,
    trend5m
  ];
}

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

function getTradingSession(): { active: boolean; name: string } {
  const h = new Date().getUTCHours();
  if (h >= 7 && h < 21) return { active: true,  name: h < 16 ? "London" : "New York" };
  return { active: false, name: "Off-hours" };
}

async function placeTrade(token: string, symbol: string, action: string, stake: number) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve({ error: "timeout" }); }, 15000);
    let authed = false;
    ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.authorize && !authed) {
        authed = true;
        // BOOM always spikes up → MULTUP. CRASH always spikes down → MULTDOWN.
        // For these, ML signal direction doesn't matter — only meta confidence matters.
        let contractType: string;
        if (symbol.startsWith("BOOM"))       contractType = "MULTUP";
        else if (symbol.startsWith("CRASH")) contractType = "MULTDOWN";
        else if (symbol.startsWith("R_"))    contractType = action === "BUY" ? "CALL" : "PUT";
        else                                  contractType = action === "BUY" ? "MULTUP" : "MULTDOWN";
        // Fix stake minimum for multipliers
        const adjStake = Math.max(1.00, stake);
        const isMult = contractType.startsWith("MULT");
        const contract = isMult
          ? { buy: 1, price: adjStake, parameters: { amount: adjStake, basis: "stake", contract_type: contractType, currency: "USD", symbol, multiplier: 100 } }
          : { buy: 1, price: stake, parameters: { amount: stake, basis: "stake", contract_type: contractType, currency: "USD", duration: 4, duration_unit: "m", symbol } };
        ws.send(JSON.stringify(contract));
      }
      if (d.buy)   { clearTimeout(timeout); ws.close(); resolve(d.buy); }
      if (d.error) { clearTimeout(timeout); ws.close(); resolve({ error: d.error.message }); }
    };
    ws.onerror = () => { clearTimeout(timeout); resolve({ error: "ws error" }); };
  });
}

async function getConsecutiveLosses(supabase: any): Promise<number> {
  const { data } = await supabase.from("trades").select("result").eq("account_name","edge_function").order("created_at", { ascending: false }).limit(5);
  if (!data) return 0;
  let count = 0;
  for (const t of data) { if (t.result === "loss") count++; else break; }
  return count;
}

// ── AUTO-DISCOVERY: test a symbol with ML model and return WR estimate ──
// If a model doesn't exist yet but gets 70%+ on recent candles, flag it for retraining
async function checkSymbolHealth(symbol: string, model: any, minConf: number): Promise<{ tradable: boolean; reason: string }> {
  const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
  if (!isSynthetic) {
    const session = getTradingSession();
    if (!session.active) return { tradable: false, reason: `off-hours` };
  }
  const [c1m, c5m] = await Promise.all([fetchCandles(symbol, 60, 200), fetchCandles(symbol, 300, 100)]);
  if (c1m.length < 50) return { tradable: false, reason: "not enough candles" };
  const features = buildFeatures(c1m, c5m);
  const sig = mlPredict(model, features);
  return { tradable: sig.action !== "HOLD" && sig.confidence >= minConf, reason: sig.reason };
}


const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: cfg } = await supabase.from("bot_config").select("*").eq("active", true).single();
  if (!cfg || !cfg.auto_trade) return new Response(JSON.stringify({ status: "disabled" }), { headers: CORS });

  const token     = cfg.token;
  const riskPct   = cfg.risk_pct || 2;
  const balance   = cfg.balance_cache || 10;
  const stake     = Math.max(0.35, parseFloat(((balance * riskPct) / 100).toFixed(2)));
  const minConf   = cfg.min_confidence || 65;

  const consec = await getConsecutiveLosses(supabase);
  if (consec >= 3) return new Response(JSON.stringify({ status: "paused", consecutive_losses: consec }), { headers: CORS });

  // Load ALL ML models from Supabase — not just whitelisted symbols
  const { data: mlRows } = await supabase.from("ml_models").select("symbol, model_json, win_rate");
  const ML_MODELS: Record<string, any> = {};
  for (const row of (mlRows || [])) {
    try {
      // model_json is stored as a string in Supabase - must JSON.parse
      const mj = typeof row.model_json === "string" ? JSON.parse(row.model_json) : row.model_json;
      if (mj?.main_trees && mj?.meta_trees) {
        ML_MODELS[row.symbol] = mj;
        console.log(`✅ ${row.symbol}: ${mj.main_trees.length} main + ${mj.meta_trees.length} meta trees`);
      } else {
        console.log(`❌ ${row.symbol}: missing trees, keys=${Object.keys(mj||{}).join(",")}`);
      }
    } catch(e) {
      console.log(`❌ ${row.symbol}: parse error ${e}`);
    }
  }
  console.log(`🧠 ML models loaded: ${Object.keys(ML_MODELS).join(", ")}`);

  // ── AUTO-DISCOVERY: scan ALL ML-model symbols, not just cfg.symbols ──
  // This means: if you retrain and add a new symbol to ml_models table,
  // the bot automatically starts trading it — no manual config needed.
  const mlSymbols   = Object.keys(ML_MODELS);
  const cfgSymbols  = cfg.symbols || ["BOOM1000","CRASH1000","frxUSDJPY"];
  // Union: always try ML symbols + any manually added cfg symbols (fallback)
  const allSymbols  = [...new Set([...mlSymbols, ...cfgSymbols])];
  console.log(`📡 Scanning: ${allSymbols.join(", ")}`);

  // Scan for signals
  const signals: any[] = [];
  const scanLog: string[] = [];

  for (const symbol of allSymbols) {
    try {
      const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
      if (!isSynthetic) {
        const session = getTradingSession();
        if (!session.active) { scanLog.push(`${symbol}: off-hours`); continue; }
      }

      const [c1m, c5m] = await Promise.all([fetchCandles(symbol, 60, 200), fetchCandles(symbol, 300, 100)]);
      if (c1m.length < 50) { scanLog.push(`${symbol}: insufficient candles`); continue; }

      let sig;

      if (ML_MODELS[symbol]) {
        // ── ML path: main model + meta-labeling filter ──
        const features = buildFeatures(c1m, c5m);
        sig = mlPredict(ML_MODELS[symbol], features);
        const logLine = `${symbol}: ML→${sig.action} conf:${sig.confidence} (${sig.reason})`;
        console.log(logLine);
        scanLog.push(logLine);
      } else {
        // ── Fallback path: smart rule-based for non-ML symbols ──
        const c  = c1m.map((x: any) => parseFloat(x.close));
        const c5 = c5m.map((x: any) => parseFloat(x.close));
        const price = c[c.length-1], prev = c[c.length-2];
        let trend5m = 0;
        if (c5.length >= 50) {
          const e20 = calcEMA(c5, 20), e50 = calcEMA(c5, 50), r5 = calcRSI(c5);
          trend5m = e20 > e50 && r5 > 50 ? 1 : e20 < e50 && r5 < 50 ? -1 : 0;
        }
        if (trend5m === 0) { scanLog.push(`${symbol}: 5M unclear`); continue; }
        const e8 = calcEMA(c, 8), e21 = calcEMA(c, 21), rsi = calcRSI(c);
        if (trend5m === 1 && e8 > e21 && price > e8 && price > prev && rsi >= 40 && rsi <= 65)
          sig = { action: "BUY",  confidence: 65, reason: "fallback-bull" };
        else if (trend5m === -1 && e8 < e21 && price < e8 && price < prev && rsi >= 35 && rsi <= 60)
          sig = { action: "SELL", confidence: 65, reason: "fallback-bear" };
        else
          sig = { action: "HOLD", confidence: 0, reason: "no-fallback-signal" };
        scanLog.push(`${symbol}: Fallback→${sig.action} (${sig.reason})`);
      }

      if (sig.action !== "HOLD" && sig.confidence >= minConf) {
        signals.push({ symbol, ...sig, is_ml: !!ML_MODELS[symbol] });
      }
    } catch (err) {
      console.error(`${symbol} error:`, err);
      scanLog.push(`${symbol}: error - ${err}`);
    }
  }

  if (signals.length === 0) {
    return new Response(JSON.stringify({
      status: "no_signal",
      scanned: allSymbols.length,
      ml_models_used: Object.keys(ML_MODELS),
      scan_log: scanLog,
    }), { headers: CORS });
  }

  // Pick best signal — ML signals ranked above fallback, then by confidence
  signals.sort((a, b) => {
    if (a.is_ml !== b.is_ml) return a.is_ml ? -1 : 1;
    return b.confidence - a.confidence;
  });
  const best = signals[0];
  console.log(`🎯 Best: ${best.symbol} ${best.action} ${best.confidence}% (ML:${best.is_ml})`);

  const result: any = await placeTrade(token, best.symbol, best.action, stake);
  const success = result && !result.error;

  await supabase.from("trades").insert({
    symbol:       best.symbol,
    type:         best.action,
    stake,
    result:       success ? "open" : "error",
    confidence:   best.confidence,
    account_name: "edge_function",
    session: getTradingSession().name,
  });

  if (success) await supabase.from("bot_config").update({ balance_cache: balance - stake }).eq("active", true);

  return new Response(JSON.stringify({
    status:          success ? "trade_placed" : "trade_failed",
    signal:          best,
    stake,
    trade:           result,
    ml_models_used:  Object.keys(ML_MODELS),
    signals_found:   signals.length,
    auto_discovered: mlSymbols.filter(s => !cfgSymbols.includes(s)),
    scan_log:        scanLog,
  }), { headers: CORS });
});
