// ═══════════════════════════════════════════════════════════════
// TIMI Feature Baseline Seeder
// Fetches recent candles, computes features, stores distributions
// in Supabase feature_baselines table for PSI drift detection.
//
// Run once after deploy: node backtest/seed_feature_baselines.js
// Re-run monthly to refresh baselines.
// ═══════════════════════════════════════════════════════════════
const WebSocket = require("ws");
const https     = require("https");

// ── Config — paste your Supabase URL and service role key ──
const SUPABASE_URL = process.env.SUPABASE_URL || "https://pedbupgjxlcumidwoktc.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_KEY) {
  console.error("❌ Set SUPABASE_SERVICE_ROLE_KEY env var before running");
  process.exit(1);
}

async function fetchCandles(symbol, granularity = 60, count = 300) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 15000);
    ws.on("open", () => ws.send(JSON.stringify({
      ticks_history: symbol, adjust_start_time: 1,
      count, end: "latest", granularity, style: "candles"
    })));
    ws.on("message", (data) => {
      const d = JSON.parse(data);
      if (d.candles) { clearTimeout(timeout); ws.close(); resolve(d.candles); }
      if (d.error)   { clearTimeout(timeout); ws.close(); resolve([]); }
    });
    ws.on("error", () => { clearTimeout(timeout); resolve([]); });
  });
}

// Mirror core feature extraction (subset of 60-feature vector)
// We track the 10 most important features for drift detection
function extractKeyFeatures(candles) {
  if (candles.length < 30) return null;
  const c   = candles.map(x => parseFloat(x.close));
  const h   = candles.map(x => parseFloat(x.high));
  const lo  = candles.map(x => parseFloat(x.low));
  const price = c[c.length - 1];

  // EMA
  const k8 = 2/9, k21 = 2/22;
  let ema8 = c[0], ema21 = c[0];
  c.forEach(p => { ema8 = p*k8 + ema8*(1-k8); ema21 = p*k21 + ema21*(1-k21); });

  // RSI
  let g = 0, l = 0;
  for (let i = c.length-14; i < c.length; i++) {
    const d = c[i]-c[i-1]; if(d>0) g+=d; else l-=d;
  }
  const rsi = 100 - 100/(1 + g/(l||0.0001));

  // BB
  const sl20 = c.slice(-20);
  const bbMid = sl20.reduce((a,b)=>a+b,0)/20;
  const bbStd = Math.sqrt(sl20.reduce((a,b)=>a+Math.pow(b-bbMid,2),0)/20);
  const bbPos = (price - (bbMid-2*bbStd)) / (4*bbStd + 1e-10);
  const bbWidth = 4*bbStd / (bbMid+1e-10);

  // ATR
  const atrSlice = candles.slice(-14);
  const trs = atrSlice.map((can, i) => {
    const pc = i>0 ? parseFloat(atrSlice[i-1].close) : parseFloat(can.close);
    return Math.max(parseFloat(can.high)-parseFloat(can.low),
      Math.abs(parseFloat(can.high)-pc), Math.abs(parseFloat(can.low)-pc));
  });
  const atr = trs.reduce((a,b)=>a+b,0)/trs.length;
  const atrPct = atr/(price+1e-10);

  // Momentum
  const mom1 = (price - c[c.length-2])  / (c[c.length-2]+1e-10);
  const mom5 = (price - c[c.length-6])  / (c[c.length-6]+1e-10);

  // Tick density proxy
  const avgRange = candles.slice(-20).reduce((s,c2)=>s+(parseFloat(c2.high)-parseFloat(c2.low)),0)/20;
  const tickVel  = avgRange/(price+1e-10);
  const upC      = candles.slice(-20).filter(c2=>parseFloat(c2.close)>parseFloat(c2.open)).length;
  const bullRatio = upC/20;

  return [rsi, bbPos, bbWidth, atrPct, mom1, mom5, tickVel, bullRatio,
    (price-ema8)/(ema8+1e-10), (price-ema21)/(ema21+1e-10)];
}

const FEATURE_NAMES = [
  "rsi", "bb_position", "bb_width", "atr_pct", "mom_1", "mom_5",
  "tick_velocity", "tick_bull_ratio", "price_vs_ema8", "price_vs_ema21"
];

async function supabaseUpsert(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const url  = new URL(`${SUPABASE_URL}/rest/v1/${table}?on_conflict=feature_index`);
    const req  = https.request({
      hostname: url.hostname, path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      }
    }, (res) => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("🌱 TIMI Feature Baseline Seeder\n");

  const SYMBOLS  = ["R_75", "R_50", "BOOM1000", "CRASH1000", "frxEURUSD", "frxGBPUSD", "frxUSDJPY"];
  const allFeatureVecs = Array.from({ length: 10 }, () => []);

  for (const sym of SYMBOLS) {
    console.log(`📡 Fetching ${sym}...`);
    const candles = await fetchCandles(sym, 60, 300);
    if (candles.length < 60) { console.log(`  ⚠️ Skipped — only ${candles.length} candles`); continue; }

    // Walk through candles to get many feature samples
    for (let i = 40; i < candles.length; i++) {
      const feat = extractKeyFeatures(candles.slice(0, i));
      if (!feat) continue;
      feat.forEach((v, fi) => { if (!isNaN(v) && isFinite(v)) allFeatureVecs[fi].push(v); });
    }
    console.log(`  ✅ ${candles.length} candles processed`);
  }

  // Store baseline distributions
  const rows = FEATURE_NAMES.map((name, fi) => ({
    feature_index:   fi,
    feature_name:    name,
    baseline_values: JSON.stringify(allFeatureVecs[fi].slice(-500)), // keep last 500 samples
    updated_at:      new Date().toISOString(),
  }));

  console.log("\n💾 Saving to Supabase feature_baselines...");
  const result = await supabaseUpsert("feature_baselines", rows);
  if (result.status === 200 || result.status === 201) {
    console.log(`✅ ${rows.length} feature baselines saved!`);
    rows.forEach(r => console.log(`  ${r.feature_name}: ${JSON.parse(r.baseline_values).length} samples`));
  } else {
    console.error(`❌ Supabase error ${result.status}:`, result.body);
  }
}

main().catch(console.error);
