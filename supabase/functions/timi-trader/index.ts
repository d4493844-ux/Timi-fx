import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// ── Math helpers ──
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
function calcMACD(prices: number[]) {
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  const macd = ema12 - ema26;
  const signal = calcEMA(prices.slice(-9).map((_, i) => calcEMA(prices.slice(0, prices.length - 9 + i + 1), 12) - calcEMA(prices.slice(0, prices.length - 9 + i + 1), 26)), 9);
  return { macd, signal, hist: macd - signal };
}
function calcBB(prices: number[], period = 20) {
  const slice = prices.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
  return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
}
function calcStoch(candles: any[], period = 14): number {
  if (candles.length < period) return 50;
  const slice = candles.slice(-period);
  const high = Math.max(...slice.map((c: any) => parseFloat(c.high)));
  const low = Math.min(...slice.map((c: any) => parseFloat(c.low)));
  const close = parseFloat(candles[candles.length - 1].close);
  return high === low ? 50 : ((close - low) / (high - low)) * 100;
}
function getTradingSession() {
  const h = new Date().getUTCHours();
  const london = h >= 7 && h < 16;
  const newYork = h >= 12 && h < 21;
  const overlap = london && newYork;
  const strength = overlap ? 3 : (london || newYork) ? 2 : 1;
  return { london, newYork, overlap, strength };
}
function detectEngulfing(candles: any[]) {
  if (candles.length < 2) return { bullish: false, bearish: false };
  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];
  const po = parseFloat(prev.open), pc = parseFloat(prev.close);
  const co = parseFloat(curr.open), cc = parseFloat(curr.close);
  return {
    bullish: pc < po && cc > co && co < pc && cc > po,
    bearish: pc > po && cc < co && co > pc && cc < po,
  };
}

// ── DIGITS STRATEGY ──
function getDigitsSignal(ticks: number[], symbol: string): {
  action: string; contract_type: string; barrier: string; confidence: number; reason: string;
} {
  if (!ticks || ticks.length < 20) return { action: "HOLD", contract_type: "", barrier: "", confidence: 0, reason: "Not enough ticks" };
  const digits = ticks.map((t: number) => Math.floor(t * 10) % 10);
  const last10 = digits.slice(-10);
  const last5 = digits.slice(-5);
  const avg5 = last5.reduce((a: number, b: number) => a + b, 0) / 5;
  const highCount = last10.filter((d: number) => d >= 5).length;
  const lowCount = last10.filter((d: number) => d <= 4).length;
  const recentHigh = last5.filter((d: number) => d >= 5).length;
  const recentLow = last5.filter((d: number) => d <= 4).length;

  if (symbol.startsWith("BOOM")) {
    if (recentLow >= 4) return { action: "BUY", contract_type: "CALL", barrier: "", confidence: 72, reason: `BOOM dip ${recentLow} low digits` };
    return { action: "HOLD", contract_type: "", barrier: "", confidence: 0, reason: "BOOM waiting for dip" };
  }
  if (symbol.startsWith("CRASH")) {
    if (recentHigh >= 4) return { action: "SELL", contract_type: "PUT", barrier: "", confidence: 72, reason: `CRASH rise ${recentHigh} high digits` };
    return { action: "HOLD", contract_type: "", barrier: "", confidence: 0, reason: "CRASH waiting for rise" };
  }
  if (highCount >= 7) {
    const confidence = Math.min(50 + (highCount - 5) * 8, 82);
    return { action: "SELL", contract_type: "DIGITUNDER", barrier: "5", confidence, reason: `${highCount}/10 high - UNDER 5` };
  }
  if (lowCount >= 7) {
    const confidence = Math.min(50 + (lowCount - 5) * 8, 82);
    return { action: "BUY", contract_type: "DIGITOVER", barrier: "4", confidence, reason: `${lowCount}/10 low - OVER 4` };
  }
  if (recentHigh >= 4 && avg5 > 6) return { action: "SELL", contract_type: "DIGITUNDER", barrier: "5", confidence: 65, reason: `High streak avg=${avg5.toFixed(1)}` };
  if (recentLow >= 4 && avg5 < 4) return { action: "BUY", contract_type: "DIGITOVER", barrier: "4", confidence: 65, reason: `Low streak avg=${avg5.toFixed(1)}` };
  return { action: "HOLD", contract_type: "", barrier: "", confidence: 0, reason: `No pattern avg=${avg5.toFixed(1)}` };
}

// ── CANDLE SIGNAL (for forex) ──
function getSignal(candles1m: any[], candles5m: any[] = [], weights: Record<string, number> = {}, symbol = "") {
  if (!candles1m || candles1m.length < 30) return { action: "HOLD", confidence: 0, reasons: ["Not enough candles"] };
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

  if (rsi > 75) return { action: "HOLD", confidence: 0, reasons: ["RSI overbought"] };
  if (rsi < 25) return { action: "HOLD", confidence: 0, reasons: ["RSI oversold"] };

  const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("1HZ") || symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
  if (!isSynthetic && session.strength < 2) return { action: "HOLD", confidence: 0, reasons: ["Low session"] };

  const emaBull = ema9 > ema21 && ema21 > ema50;
  const emaBear = ema9 < ema21 && ema21 < ema50;
  if (!emaBull && !emaBear) return { action: "HOLD", confidence: 0, reasons: ["EMA not aligned"] };

  let bullScore = 0, bearScore = 0, confirmed = 0;
  const reasons: string[] = [];

  if (emaBull) { bullScore += 3 * (weights.ema_stack || 1); confirmed++; reasons.push("EMA BUY"); }
  else { bearScore += 3 * (weights.ema_stack || 1); confirmed++; reasons.push("EMA SELL"); }

  if (macd.hist > 0) { bullScore += 2 * (weights.macd || 1); confirmed++; reasons.push("MACD BUY"); }
  else { bearScore += 2 * (weights.macd || 1); confirmed++; reasons.push("MACD SELL"); }

  if (rsi < 45) { bullScore += 2 * (weights.rsi || 1); confirmed++; reasons.push("RSI BUY"); }
  else if (rsi > 55) { bearScore += 2 * (weights.rsi || 1); confirmed++; reasons.push("RSI SELL"); }
  else return { action: "HOLD", confidence: 0, reasons: ["RSI neutral"] };

  if (stoch < 30) { bullScore += 1.5; reasons.push("Stoch oversold"); }
  else if (stoch > 70) { bearScore += 1.5; reasons.push("Stoch overbought"); }

  if (price < bb.lower) { bullScore += 1.5; reasons.push("Below BB"); }
  else if (price > bb.upper) { bearScore += 1.5; reasons.push("Above BB"); }

  if (candles5m && candles5m.length >= 20) {
    const c5 = candles5m.map((c: any) => parseFloat(c.close));
    const bull5m = calcEMA(c5, 9) > calcEMA(c5, 21);
    if (bullScore > bearScore && bull5m) { bullScore += 2; confirmed++; reasons.push("5M confirms"); }
    else if (bearScore > bullScore && !bull5m) { bearScore += 2; confirmed++; reasons.push("5M confirms"); }
    else return { action: "HOLD", confidence: 0, reasons: ["5M contradicts"] };
  }

  if (session.overlap) { bullScore *= 1.15; bearScore *= 1.15; }

  const net = bullScore - bearScore;
  if (Math.abs(net) < 3 || confirmed < 3) return { action: "HOLD", confidence: 0, reasons: ["Signal weak"] };

  const action = net > 0 ? "BUY" : "SELL";
  const confidence = Math.min(Math.round(Math.abs(net) / 12 * 100), 99);
  return { action, confidence, reasons };
}

// ── Fetch candles via WebSocket ──
async function fetchCandles(symbol: string, granularity: number, count: number): Promise<any[]> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
      const timeout = setTimeout(() => { try { ws.close(); } catch {} resolve([]); }, 10000);
      ws.onopen = () => ws.send(JSON.stringify({ ticks_history: symbol, adjust_start_time: 1, count, end: "latest", granularity, style: "candles" }));
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        if (d.candles) { clearTimeout(timeout); try { ws.close(); } catch {} resolve(d.candles); }
        else if (d.error) { clearTimeout(timeout); try { ws.close(); } catch {} resolve([]); }
      };
      ws.onerror = () => { clearTimeout(timeout); resolve([]); };
    } catch { resolve([]); }
  });
}

// ── Check open trades ──
async function checkOpenTrades(token: string) {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: openTrades } = await supabase.from("trades")
    .select("*").eq("result", "OPEN").eq("account_name", "edge_function");
  if (!openTrades?.length) return;

  for (const trade of openTrades) {
    const age = (Date.now() - new Date(trade.created_at).getTime()) / 60000;
    if (!trade.contract_id && age > 15) {
      await supabase.from("trades").update({ result: "LOSS", pnl: -trade.stake }).eq("id", trade.id);
      continue;
    }
    if (!trade.contract_id) continue;
    try {
      const result = await new Promise<any>((resolve) => {
        const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
        const t = setTimeout(() => { ws.close(); resolve(null); }, 8000);
        ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
        ws.onmessage = (e: MessageEvent) => {
          const d = JSON.parse(e.data);
          if (d.msg_type === "authorize") ws.send(JSON.stringify({ proposal_open_contract: 1, contract_id: trade.contract_id }));
          if (d.msg_type === "proposal_open_contract") {
            clearTimeout(t); ws.close();
            resolve(d.proposal_open_contract);
          }
        };
        ws.onerror = () => { clearTimeout(t); resolve(null); };
      });
      if (result && result.is_sold) {
        const pnl = parseFloat(result.profit || "0");
        await supabase.from("trades").update({ result: pnl >= 0 ? "WIN" : "LOSS", pnl })
          .eq("id", trade.id);
        console.log(`✅ Trade closed: ${trade.symbol} ${pnl >= 0 ? "WIN" : "LOSS"} $${pnl}`);
      }
    } catch {}
  }
}

// ── Get consecutive losses ──
async function getConsecutiveLosses(supabase: any): Promise<number> {
  const { data } = await supabase.from("trades").select("result")
    .eq("account_name", "edge_function").order("created_at", { ascending: false }).limit(5);
  if (!data) return 0;
  let count = 0;
  for (const t of data) { if (t.result === "LOSS") count++; else break; }
  return count;
}

// ── Place trade ──
async function placeTrade(token: string, symbol: string, action: string, stake: number, sig: any): Promise<any> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
      const t = setTimeout(() => { try { ws.close(); } catch {} resolve({ error: "timeout" }); }, 15000);
      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = (e: MessageEvent) => {
        const d = JSON.parse(e.data);
        if (d.error) { clearTimeout(t); try { ws.close(); } catch {} resolve({ error: d.error.message }); return; }
        if (d.msg_type === "authorize") {
          const isForex = symbol.startsWith("frx") || symbol.startsWith("cry");
          let proposal: any;
          if (isForex) {
            proposal = { proposal: 1, amount: stake, basis: "stake", contract_type: action === "BUY" ? "MULTUP" : "MULTDOWN", currency: "USD", symbol, multiplier: 100, limit_order: { stop_loss: Math.round(stake * 0.5 * 100) / 100, take_profit: Math.round(stake * 2.0 * 100) / 100 } };
          } else if (sig.contract_type_override && sig.contract_type_override.startsWith("DIGIT")) {
            proposal = { proposal: 1, amount: stake, basis: "stake", contract_type: sig.contract_type_override, currency: "USD", duration: 5, duration_unit: "t", symbol, barrier: sig.barrier || "5" };
          } else if (sig.contract_type_override) {
            proposal = { proposal: 1, amount: stake, basis: "stake", contract_type: sig.contract_type_override, currency: "USD", duration: 4, duration_unit: "m", symbol };
          } else {
            proposal = { proposal: 1, amount: stake, basis: "stake", contract_type: action === "BUY" ? "CALL" : "PUT", currency: "USD", duration: 4, duration_unit: "m", symbol };
          }
          ws.send(JSON.stringify(proposal));
        }
        if (d.msg_type === "proposal" && d.proposal) ws.send(JSON.stringify({ buy: d.proposal.id, price: d.proposal.ask_price }));
        if (d.msg_type === "buy") { clearTimeout(t); try { ws.close(); } catch {} resolve({ success: true, contractId: d.buy.contract_id, buyPrice: d.buy.buy_price }); }
      };
      ws.onerror = () => { clearTimeout(t); resolve({ error: "ws error" }); };
    } catch (e) { resolve({ error: String(e) }); }
  });
}

// ── MAIN HANDLER ──
Deno.serve(async (req: Request) => {
  const headers = { ...corsHeaders, "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: config } = await supabase.from("bot_config").select("*").eq("active", true).single();
    if (!config) return new Response(JSON.stringify({ error: "No config" }), { headers });

    const token = config.token;
    if (!token) return new Response(JSON.stringify({ error: "No token" }), { headers });
    if (!config.auto_trade) return new Response(JSON.stringify({ status: "auto_trade_disabled" }), { headers });

    await checkOpenTrades(token);

    const consecLosses = await getConsecutiveLosses(supabase);
    if (consecLosses >= 3) {
      return new Response(JSON.stringify({ status: "paused_consecutive_losses", losses: consecLosses }), { headers });
    }

    const { data: openTrades } = await supabase.from("trades").select("id").eq("result", "OPEN").eq("account_name", "edge_function");
    if ((openTrades?.length || 0) >= (config.max_trades || 3))
      return new Response(JSON.stringify({ status: "max_trades_reached" }), { headers });

    const symbols: string[] = config.symbols || ["R_75","R_25","R_50","R_100","1HZ100V","1HZ75V","BOOM1000","BOOM500","CRASH1000","CRASH500"];
    const minConf = config.min_confidence || 55;
    console.log(`🤖 TIMI running | minConf: ${minConf}% | symbols: ${symbols.length}`);

    // Load AI weights
    const [{ data: aiWeights }, { data: symStats }] = await Promise.all([
      supabase.from("ai_weights").select("*"),
      supabase.from("symbol_stats").select("*"),
    ]);
    const weights: Record<string, number> = { ema_stack: 1.0, macd: 1.0, rsi: 1.0, bollinger: 1.0, stochastic: 1.0, multi_timeframe: 1.0 };
    if (aiWeights) aiWeights.forEach((r: any) => { weights[r.indicator] = parseFloat(r.weight); });
    const symPerf: Record<string, any> = {};
    if (symStats) symStats.forEach((r: any) => { symPerf[r.symbol] = r; });

    // Fetch ticks for all symbols (synthetics use digits)
    const ticksMap: Record<string, number[]> = {};
    await Promise.allSettled(symbols.map(async (symbol: string) => {
      try {
        const ticks = await new Promise<number[]>((resolve) => {
          const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
          const timeout = setTimeout(() => { try { ws.close(); } catch {} resolve([]); }, 8000);
          ws.onopen = () => ws.send(JSON.stringify({ ticks_history: symbol, count: 25, end: "latest", style: "ticks" }));
          ws.onmessage = (e: MessageEvent) => {
            const d = JSON.parse(e.data);
            if (d.history?.prices) { clearTimeout(timeout); try { ws.close(); } catch {} resolve(d.history.prices.map((p: string) => parseFloat(p))); }
          };
          ws.onerror = () => { clearTimeout(timeout); resolve([]); };
        });
        ticksMap[symbol] = ticks;
      } catch { ticksMap[symbol] = []; }
    }));

    // Evaluate signals for all symbols
    const signals: any[] = [];
    await Promise.allSettled(symbols.map(async (symbol: string) => {
      try {
        // Skip symbols with bad track record
        const perf = symPerf[symbol];
        if (perf) {
          const total = (perf.win_count || 0) + (perf.loss_count || 0);
          if (total > 5 && (perf.win_count || 0) / total < 0.3) {
            console.log(`${symbol}: BLOCKED low win rate`);
            return;
          }
        }

        const isSynth = symbol.startsWith("R_") || symbol.startsWith("1HZ") || symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
        let sig: any;

        if (isSynth) {
          const ds = getDigitsSignal(ticksMap[symbol] || [], symbol);
          console.log(`${symbol} DIGITS: ${ds.action} ${ds.confidence}% - ${ds.reason}`);
          sig = ds.action !== "HOLD" && ds.confidence >= minConf
            ? { action: ds.action, confidence: ds.confidence, contract_type_override: ds.contract_type, barrier: ds.barrier, reasons: [ds.reason] }
            : { action: "HOLD", confidence: 0, reasons: [ds.reason] };
        } else {
          const [c1m, c5m] = await Promise.all([fetchCandles(symbol, 60, 100), fetchCandles(symbol, 300, 50)]);
          sig = getSignal(c1m, c5m, weights, symbol);
          console.log(`${symbol}: ${sig.action} ${sig.confidence}%`);
        }

        if (sig.action !== "HOLD" && sig.confidence >= minConf) {
          signals.push({ ...sig, symbol });
        }
      } catch (e) { console.log(`${symbol} error: ${e}`); }
    }));

    if (!signals.length) return new Response(JSON.stringify({ status: "no_signal", checked: symbols }), { headers });

    // Pick best signal
    const bestSig = signals.sort((a, b) => b.confidence - a.confidence)[0];
    console.log(`🎯 Best: ${bestSig.action} ${bestSig.symbol} ${bestSig.confidence}%`);

    // Calculate stake
    const { data: bal } = await supabase.rpc("get_balance", { p_token: token }).single().catch(() => ({ data: null }));
    const balance = config.balance_cache || 10;
    const rawStake = Math.round(balance * (config.risk_pct || 2) / 100 * 100) / 100;
    const minStake = (bestSig.symbol?.startsWith("frx") || bestSig.symbol?.startsWith("cry")) ? 5 : 0.35;
    const stake = Math.max(minStake, rawStake);

    console.log(`📊 TRADING: ${bestSig.action} ${bestSig.symbol} $${stake}`);

    const result = await placeTrade(token, bestSig.symbol, bestSig.action, stake, bestSig);

    if (result.error) {
      console.log(`❌ Trade failed: ${result.error}`);
      return new Response(JSON.stringify({ status: "trade_failed", error: result.error }), { headers });
    }

    await supabase.from("trades").insert([{
      symbol: bestSig.symbol, type: bestSig.action, stake, pnl: 0,
      result: "OPEN", session: "background", confidence: bestSig.confidence,
      account_name: "edge_function", contract_id: result.contractId || null,
    }]);

    // Update symbol stats
    await supabase.from("symbol_stats").upsert({
      symbol: bestSig.symbol,
      win_count: (symPerf[bestSig.symbol]?.win_count || 0),
      loss_count: (symPerf[bestSig.symbol]?.loss_count || 0),
      avg_confidence: bestSig.confidence,
      last_traded: new Date().toISOString(),
      is_active: true,
    }, { onConflict: "symbol" });

    return new Response(JSON.stringify({
      status: "trade_placed", symbol: bestSig.symbol,
      action: bestSig.action, stake, confidence: bestSig.confidence,
      contract_id: result.contractId, reasons: bestSig.reasons,
    }), { headers });

  } catch (e) {
    console.log(`💥 Error: ${e}`);
    return new Response(JSON.stringify({ error: String(e) }), { headers });
  }
});
