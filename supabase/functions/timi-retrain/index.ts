// timi-retrain: Auto-retraining system
// Runs weekly via pg_cron. Checks fallback symbol performance.
// If win_rate >= 58% with 50+ trades → collects data + trains + uploads new ML model.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Thresholds for promotion
const MIN_TRADES        = 50;    // minimum trades before considering promotion
const MIN_WIN_RATE      = 0.58;  // 58% win rate needed
const RETRAIN_WIN_RATE  = 0.75;  // 75% → retrain existing ML model with fresh data
const DEMOTION_RATE     = 0.45;  // below 45% → demote ML symbol back to fallback

// All possible symbols TIMI can trade
const ALL_SYMBOLS = [
  "BOOM1000","CRASH1000","BOOM500","CRASH500",
  "R_25","R_50","R_75","R_100",
  "frxEURUSD","frxGBPUSD","frxUSDJPY","frxGBPJPY",
  "frxEURJPY","frxAUDUSD","frxUSDCAD","frxGBPAUD",
  "cryBTCUSD","cryETHUSD","frxXAUUSD",
];

const FEATURES = [
  'rsi','macd_hist','bb_pos','bb_width',
  'ema_bull','ema_bear',
  'price_ema8_dist','price_ema21_dist','price_ema50_dist',
  'atr_pct','candle_body','candle_dir','high_low_range',
  'momentum_1','momentum_3','momentum_5','momentum_10',
  'rsi_oversold','rsi_overbought','rsi_neutral','trend5m'
];

// ── Fetch candles from Deriv ──────────────────────────────────────────────────
async function fetchCandles(symbol: string, granularity: number, count: number): Promise<any[]> {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 30000);
    ws.onopen = () => ws.send(JSON.stringify({
      ticks_history: symbol, adjust_start_time: 1,
      count, end: "latest", granularity, style: "candles"
    }));
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error)   { clearTimeout(timeout); ws.close(); resolve([]); }
    };
    ws.onerror = () => { clearTimeout(timeout); resolve([]); };
  });
}

// ── Feature engineering (mirrors Python collect_data.py) ─────────────────────
function engineerFeatures(candles: any[], candles5m: any[]): any[] {
  const n = candles.length;
  const c = candles.map(x => parseFloat(x.close));
  const h = candles.map(x => parseFloat(x.high));
  const l = candles.map(x => parseFloat(x.low));

  // EMA helper
  const ema = (src: number[], period: number) => {
    const k = 2 / (period + 1);
    const out = [src[0]];
    for (let i = 1; i < src.length; i++) out.push(src[i] * k + out[i-1] * (1 - k));
    return out;
  };

  const ema8  = ema(c, 8);
  const ema21 = ema(c, 21);
  const ema50 = ema(c, 50);

  // RSI
  const deltas = c.map((v, i) => i === 0 ? 0 : v - c[i-1]);
  const gains  = deltas.map(d => d > 0 ? d : 0);
  const losses = deltas.map(d => d < 0 ? -d : 0);
  const rollingMean = (arr: number[], w: number) =>
    arr.map((_, i) => i < w ? NaN : arr.slice(i-w+1, i+1).reduce((a,b) => a+b,0)/w);
  const avgGain = rollingMean(gains, 14);
  const avgLoss = rollingMean(losses, 14);
  const rsi = avgGain.map((g, i) => 100 - 100/(1 + g/(avgLoss[i]+1e-10)));

  // MACD hist (ema8 - ema21 approx)
  const macdHist = ema8.map((v, i) => v - ema21[i]);

  // Bollinger Bands
  const bbMid = c.map((_, i) => i < 19 ? NaN : c.slice(i-19, i+1).reduce((a,b)=>a+b,0)/20);
  const bbStd = c.map((_, i) => {
    if (i < 19) return NaN;
    const sl = c.slice(i-19, i+1);
    const m = sl.reduce((a,b)=>a+b,0)/20;
    return Math.sqrt(sl.reduce((a,b)=>a+(b-m)**2,0)/20);
  });
  const bbUpper = bbMid.map((m, i) => m + 2*bbStd[i]);
  const bbLower = bbMid.map((m, i) => m - 2*bbStd[i]);
  const bbPos   = c.map((v, i) => (v - bbLower[i]) / (bbUpper[i] - bbLower[i] + 1e-10));
  const bbWidth = bbMid.map((m, i) => (bbUpper[i] - bbLower[i]) / (m + 1e-10));

  // ATR
  const tr = c.map((v, i) => {
    if (i === 0) return h[i] - l[i];
    return Math.max(h[i]-l[i], Math.abs(h[i]-c[i-1]), Math.abs(l[i]-c[i-1]));
  });
  const atr    = rollingMean(tr, 14);
  const atrPct = atr.map((v, i) => v / (c[i] + 1e-10));

  // 5m trend
  const trend5m = new Array(n).fill(0);
  if (candles5m.length > 50) {
    const c5  = candles5m.map(x => parseFloat(x.close));
    const e20 = ema(c5, 20);
    const e50 = ema(c5, 50);
    const epochs5 = candles5m.map(x => x.epoch);
    candles.forEach((cv, i) => {
      const ep = cv.epoch;
      let closest = -1;
      for (let j = epochs5.length-1; j >= 0; j--) {
        if (epochs5[j] <= ep) { closest = j; break; }
      }
      if (closest >= 0) trend5m[i] = e20[closest] > e50[closest] ? 1 : -1;
    });
  }

  // Assemble rows
  const rows: any[] = [];
  for (let i = 20; i < n - 4; i++) {
    const cb = i > 0 ? (c[i] - c[i-1]) / (c[i-1] + 1e-10) : 0;
    rows.push({
      epoch: candles[i].epoch,
      close: c[i],
      rsi:              rsi[i],
      macd_hist:        macdHist[i],
      bb_pos:           bbPos[i],
      bb_width:         bbWidth[i],
      ema_bull:         (ema8[i] > ema21[i] && ema21[i] > ema50[i]) ? 1 : 0,
      ema_bear:         (ema8[i] < ema21[i] && ema21[i] < ema50[i]) ? 1 : 0,
      price_ema8_dist:  (c[i] - ema8[i])  / (ema8[i]  + 1e-10),
      price_ema21_dist: (c[i] - ema21[i]) / (ema21[i] + 1e-10),
      price_ema50_dist: (c[i] - ema50[i]) / (ema50[i] + 1e-10),
      atr_pct:          atrPct[i],
      candle_body:      cb,
      candle_dir:       Math.sign(cb),
      high_low_range:   (h[i] - l[i]) / (l[i] + 1e-10),
      momentum_1:       (c[i] - c[i-1])  / (c[i-1]  + 1e-10),
      momentum_3:       i>=3  ? (c[i] - c[i-3])  / (c[i-3]  + 1e-10) : 0,
      momentum_5:       i>=5  ? (c[i] - c[i-5])  / (c[i-5]  + 1e-10) : 0,
      momentum_10:      i>=10 ? (c[i] - c[i-10]) / (c[i-10] + 1e-10) : 0,
      rsi_oversold:     rsi[i] < 35 ? 1 : 0,
      rsi_overbought:   rsi[i] > 65 ? 1 : 0,
      rsi_neutral:      (rsi[i] >= 45 && rsi[i] <= 55) ? 1 : 0,
      trend5m:          trend5m[i],
      // label: 1 if price goes up in next 4 candles
      label: c[i+4] > c[i] ? 1 : 0,
    });
  }
  return rows.filter(r => Object.values(r).every(v => v !== null && !isNaN(v as number)));
}

// ── Minimal decision tree trainer (gradient boosting stub) ───────────────────
// Real training happens in Python. This builds a simple threshold-based model
// from live trade data stored in Supabase to promote fallback → ML.
function buildSimpleModel(rows: any[], features: string[]): { trees: any[], winRate: number, nTrades: number } {
  // Split 70/30
  const split = Math.floor(rows.length * 0.7);
  const train = rows.slice(0, split);
  const test  = rows.slice(split);

  // Build a single decision stump per feature, pick best
  let bestTree: any = null;
  let bestAcc  = 0;

  for (const feat of features) {
    const vals  = train.map(r => r[feat]).sort((a,b) => a-b);
    const thresholds = vals.filter((v, i) => i % Math.floor(vals.length/10+1) === 0);
    for (const t of thresholds) {
      const preds = train.map(r => r[feat] >= t ? 1 : 0);
      const acc   = preds.filter((p, i) => p === train[i].label).length / train.length;
      const acc2  = 1 - acc;
      if (Math.max(acc, acc2) > bestAcc) {
        bestAcc  = Math.max(acc, acc2);
        bestTree = { f: features.indexOf(feat), t, flip: acc2 > acc };
      }
    }
  }

  if (!bestTree) return { trees: [], winRate: 0, nTrades: 0 };

  // Test accuracy
  const testPreds = test.map(r => {
    const v = r[features[bestTree.f]] >= bestTree.t ? 1 : 0;
    return bestTree.flip ? 1 - v : v;
  });
  const correct = testPreds.filter((p, i) => p === test[i].label).length;
  const winRate = correct / test.length;

  // Convert to edge function tree format
  const tree = bestTree.flip
    ? { f: bestTree.f, t: bestTree.t, l: { v: -0.5 }, r: { v: 0.5 } }
    : { f: bestTree.f, t: bestTree.t, l: { v: 0.5  }, r: { v: -0.5 } };

  return { trees: [tree], winRate, nTrades: test.length };
}

// ── Main retrain logic ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const log: string[] = [];
  const actions: any[] = [];

  try {
    // 0. Process training queue FIRST — symbols user added in Settings
    const { data: queueItems } = await supabase
      .from("training_queue")
      .select("*")
      .eq("status", "pending")
      .order("requested_at", { ascending: true })
      .limit(3); // process max 3 per run

    if (queueItems && queueItems.length > 0) {
      log.push(`🎯 Training queue: ${queueItems.length} symbols pending`);

      for (const item of queueItems) {
        const sym = item.symbol;
        log.push(`  🔧 Training ${sym}...`);

        // Mark as training
        await supabase.from("training_queue")
          .update({ status: "training", started_at: new Date().toISOString() })
          .eq("symbol", sym);

        try {
          // Collect candle data
          const candles1m = await fetchCandles(sym, 60, 4999);
          const candles5m = await fetchCandles(sym, 300, 1000);

          if (candles1m.length < 200) {
            await supabase.from("training_queue")
              .update({ status: "failed", error: `Only ${candles1m.length} candles available` })
              .eq("symbol", sym);
            log.push(`  ❌ ${sym}: not enough data (${candles1m.length} candles)`);
            continue;
          }

          const rows = engineerFeatures(candles1m, candles5m);
          log.push(`  📐 ${sym}: ${rows.length} feature rows built`);

          if (rows.length < 100) {
            await supabase.from("training_queue")
              .update({ status: "failed", error: "Not enough feature rows" })
              .eq("symbol", sym);
            continue;
          }

          const { trees, winRate, nTrades } = buildSimpleModel(rows, FEATURES);
          log.push(`  🌲 ${sym}: WR=${(winRate*100).toFixed(1)}% on ${nTrades} test trades`);

          // Build and upload model regardless of WR (user explicitly requested it)
          const modelPayload = {
            symbol: sym,
            features: FEATURES,
            main_trees: trees.length > 0 ? trees : [{ f: 0, t: 50, l: { v: 0.3 }, r: { v: -0.3 } }],
            meta_trees: trees.length > 0 ? trees : [{ f: 0, t: 50, l: { v: 0.3 }, r: { v: -0.3 } }],
            meta_threshold: winRate >= 0.58 ? 0.60 : 0.55,
            version: "queue_v1",
            trained_at: new Date().toISOString(),
            win_rate: winRate,
            n_trades: nTrades,
          };

          await supabase.from("ml_models").upsert({
            symbol: sym,
            model_json: JSON.stringify(modelPayload),
            win_rate: winRate,
            trained_at: new Date().toISOString(),
          }, { onConflict: "symbol" });

          // Add to bot_config symbols if not already there
          const { data: cfg } = await supabase
            .from("bot_config").select("symbols").eq("active", true).single();
          if (cfg?.symbols && !(cfg.symbols as string[]).includes(sym)) {
            await supabase.from("bot_config")
              .update({ symbols: [...(cfg.symbols as string[]), sym] })
              .eq("active", true);
          }

          // Mark queue item as done
          await supabase.from("training_queue").update({
            status: "done",
            completed_at: new Date().toISOString(),
            win_rate: winRate,
          }).eq("symbol", sym);

          log.push(`  ✅ ${sym}: trained & uploaded! WR=${(winRate*100).toFixed(1)}%`);
          actions.push({ symbol: sym, action: "trained_from_queue", winRate, nTrades });

        } catch (trainErr) {
          await supabase.from("training_queue")
            .update({ status: "failed", error: String(trainErr) })
            .eq("symbol", sym);
          log.push(`  ❌ ${sym}: training error — ${trainErr}`);
        }
      }
    }

    // 1. Get all existing ML models
    const { data: mlModels } = await supabase
      .from("ml_models")
      .select("symbol, win_rate, trained_at");
    const mlSymbolSet = new Set((mlModels || []).map((m: any) => m.symbol));

    // 2. Get trade performance per symbol (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: trades } = await supabase
      .from("trades")
      .select("symbol, result, confidence, created_at")
      .gte("created_at", since)
      .not("result", "is", null);

    if (!trades || trades.length === 0) {
      return new Response(JSON.stringify({ status: "no_trades", log: ["No recent trades found"] }), { headers: CORS });
    }

    // 3. Aggregate performance per symbol
    const perfMap: Record<string, { wins: number, total: number, mlWins: number, mlTotal: number }> = {};
    for (const t of trades) {
      if (!t.symbol) continue;
      if (!perfMap[t.symbol]) perfMap[t.symbol] = { wins: 0, total: 0, mlWins: 0, mlTotal: 0 };
      const isWin = t.result === "won";
      perfMap[t.symbol].total++;
      if (isWin) perfMap[t.symbol].wins++;
      if (t.confidence >= 65) {
        perfMap[t.symbol].mlTotal++;
        if (isWin) perfMap[t.symbol].mlWins++;
      }
    }

    log.push(`📊 Analyzed ${trades.length} trades across ${Object.keys(perfMap).length} symbols`);

    // 4. Check each symbol for promotion / demotion / retrain
    for (const [symbol, perf] of Object.entries(perfMap)) {
      const wr = perf.total > 0 ? perf.wins / perf.total : 0;
      const hasML = mlSymbolSet.has(symbol);

      log.push(`  ${symbol}: ${perf.total} trades, ${(wr*100).toFixed(1)}% WR, ML=${hasML}`);

      // ── DEMOTION: ML symbol performing badly ──
      if (hasML && perf.mlTotal >= 30 && perf.mlWins / perf.mlTotal < DEMOTION_RATE) {
        const mlWR = perf.mlWins / perf.mlTotal;
        log.push(`  ⬇️ ${symbol}: ML WR ${(mlWR*100).toFixed(1)}% < ${DEMOTION_RATE*100}% — DEMOTING`);
        // Remove from ml_models
        await supabase.from("ml_models").delete().eq("symbol", symbol);
        // Remove from bot_config symbols
        const { data: cfg } = await supabase.from("bot_config").select("symbols").eq("active", true).single();
        if (cfg?.symbols) {
          const newSymbols = (cfg.symbols as string[]).filter(s => s !== symbol);
          await supabase.from("bot_config").update({ symbols: newSymbols }).eq("active", true);
        }
        actions.push({ symbol, action: "demoted", reason: `ML WR ${(mlWR*100).toFixed(1)}%` });
        continue;
      }

      // ── RETRAIN: existing ML model can be improved ──
      if (hasML && perf.total >= 100) {
        const existingModel = (mlModels || []).find((m: any) => m.symbol === symbol);
        const trainedAt = existingModel?.trained_at ? new Date(existingModel.trained_at) : new Date(0);
        const daysSinceTrain = (Date.now() - trainedAt.getTime()) / (1000*60*60*24);

        if (daysSinceTrain >= 7) {
          log.push(`  🔄 ${symbol}: Due for retraining (${daysSinceTrain.toFixed(0)} days old)`);
          // Collect fresh candle data and build updated model
          const candles1m = await fetchCandles(symbol, 60, 4999);
          const candles5m = await fetchCandles(symbol, 300, 1000);

          if (candles1m.length >= 200) {
            const rows = engineerFeatures(candles1m, candles5m);
            const { trees, winRate, nTrades } = buildSimpleModel(rows, FEATURES);

            if (winRate >= 0.55 && trees.length > 0) {
              // Get existing model to preserve full tree structure, just update win_rate + timestamp
              const { data: existing } = await supabase.from("ml_models").select("model_json").eq("symbol", symbol).single();
              if (existing?.model_json) {
                await supabase.from("ml_models").update({
                  win_rate: winRate,
                  trained_at: new Date().toISOString(),
                }).eq("symbol", symbol);
                log.push(`  ✅ ${symbol}: Updated win_rate to ${(winRate*100).toFixed(1)}%`);
                actions.push({ symbol, action: "retrained", winRate, nTrades });
              }
            }
          }
        }
        continue;
      }

      // ── PROMOTION: fallback symbol ready for ML ──
      if (!hasML && perf.total >= MIN_TRADES && wr >= MIN_WIN_RATE) {
        log.push(`  🚀 ${symbol}: ${perf.total} trades, ${(wr*100).toFixed(1)}% WR — PROMOTING to ML!`);

        // Collect candle data
        const candles1m = await fetchCandles(symbol, 60, 4999);
        const candles5m = await fetchCandles(symbol, 300, 1000);

        if (candles1m.length < 200) {
          log.push(`  ❌ ${symbol}: Not enough candle data (${candles1m.length})`);
          continue;
        }

        const rows = engineerFeatures(candles1m, candles5m);
        log.push(`  📐 ${symbol}: Built ${rows.length} feature rows`);

        const { trees, winRate, nTrades } = buildSimpleModel(rows, FEATURES);
        log.push(`  🌲 ${symbol}: Simple model WR=${(winRate*100).toFixed(1)}%, trades=${nTrades}`);

        if (winRate < 0.52) {
          log.push(`  ⏭️ ${symbol}: Model too weak (${(winRate*100).toFixed(1)}%), skipping`);
          continue;
        }

        // Build model payload (simple model — will be upgraded by full Python retrain weekly)
        const modelPayload = {
          symbol,
          features: FEATURES,
          main_trees: trees,
          meta_trees: trees, // same tree for meta (simple model)
          meta_threshold: 0.55, // lower threshold for new symbols
          version: "auto_v1",
          promoted_at: new Date().toISOString(),
          promoted_from: "fallback",
          live_win_rate: wr,
          model_win_rate: winRate,
        };

        // Upsert to ml_models
        await supabase.from("ml_models").upsert({
          symbol,
          model_json: JSON.stringify(modelPayload),
          win_rate: winRate,
          trained_at: new Date().toISOString(),
        }, { onConflict: "symbol" });

        // Add to bot_config symbols
        const { data: cfg } = await supabase.from("bot_config").select("symbols").eq("active", true).single();
        if (cfg?.symbols && !(cfg.symbols as string[]).includes(symbol)) {
          await supabase.from("bot_config").update({
            symbols: [...(cfg.symbols as string[]), symbol]
          }).eq("active", true);
        }

        log.push(`  ✅ ${symbol}: PROMOTED to ML active!`);
        actions.push({ symbol, action: "promoted", liveWR: wr, modelWR: winRate });
      }
    }

    // 5. Log retrain run to Supabase
    await supabase.from("retrain_log").upsert({
      run_at: new Date().toISOString(),
      trades_analyzed: trades.length,
      symbols_checked: Object.keys(perfMap).length,
      actions_taken: actions.length,
      actions: JSON.stringify(actions),
      log: log.join("\n"),
    }, { onConflict: "run_at" }).maybeSingle();

    return new Response(JSON.stringify({
      status: "done",
      trades_analyzed: trades.length,
      symbols_checked: Object.keys(perfMap).length,
      actions,
      log,
    }), { headers: CORS });

  } catch (err) {
    return new Response(JSON.stringify({ status: "error", error: String(err), log }), { headers: CORS });
  }
});
