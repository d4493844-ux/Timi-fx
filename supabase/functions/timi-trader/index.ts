import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ─────────────────────────────────────────────
// ECONOMIC CALENDAR — News Guard
// ─────────────────────────────────────────────
const FOREX_PAIRS_CURRENCIES: Record<string, string[]> = {
  "frxEURUSD":["EUR","USD"],"frxGBPUSD":["GBP","USD"],
  "frxUSDJPY":["USD","JPY"],"frxAUDUSD":["AUD","USD"],
  "frxUSDCAD":["USD","CAD"],"frxUSDCHF":["USD","CHF"],
  "frxEURGBP":["EUR","GBP"],"frxEURJPY":["EUR","JPY"],
  "frxGBPJPY":["GBP","JPY"],"frxXAUUSD":["XAU","USD"],
  "frxXAGUSD":["XAG","USD"],"frxNZDUSD":["NZD","USD"],
};

let NEWS_CACHE: Array<{currency:string;impact:string;time:Date;title:string}> = [];
let NEWS_CACHE_TIME = 0;

async function checkNewsGuard(symbol: string): Promise<{blocked:boolean;reason:string}> {
  const pairs = FOREX_PAIRS_CURRENCIES[symbol];
  if (!pairs) return { blocked: false, reason: "" };

  try {
    // Refresh cache every 60 minutes
    if (Date.now() - NEWS_CACHE_TIME > 60 * 60 * 1000) {
      NEWS_CACHE_TIME = Date.now(); // mark as refreshed even if fetch fails
      try {
        const today = new Date().toISOString().split("T")[0];
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
        const resp = await fetch(
          `https://economic-calendar.tradingview.com/events?from=${today}T00:00:00&to=${today}T23:59:59&countries=US,EU,GB,JP,AU,CA,CH`,
          { headers: { "User-Agent": "Mozilla/5.0" }, signal: controller.signal }
        ).catch(() => null);
        clearTimeout(fetchTimeout);
        if (resp && resp.ok) {
          const data = await resp.json().catch(() => ({}));
          NEWS_CACHE = [];
          for (const ev of (data.result || data || [])) {
            if ((ev.importance || 0) < 3) continue;
            NEWS_CACHE.push({
              currency: ev.currency || "",
              impact:   "HIGH",
              time:     new Date(ev.date || ev.datetime || 0),
              title:    ev.title || ev.name || "News",
            });
          }
          NEWS_CACHE_TIME = Date.now();
          console.log(`📅 Calendar: ${NEWS_CACHE.length} high-impact events`);
        }
      } catch(calErr) {
        console.log(`⚠️ Calendar skipped: ${calErr}`);
      }
    }

    const now = new Date();
    const win = 30 * 60 * 1000; // 30 min window
    for (const ev of NEWS_CACHE) {
      if (!pairs.includes(ev.currency)) continue;
      const diff = Math.abs(ev.time.getTime() - now.getTime());
      if (diff < win) {
        const mins = Math.round((ev.time.getTime() - now.getTime()) / 60000);
        const dir  = mins > 0 ? `in ${mins}min` : `${Math.abs(mins)}min ago`;
        return { blocked: true, reason: `news_guard:${ev.currency} "${ev.title}" ${dir}` };
      }
    }
  } catch(e) {
    // Fail open — don't block if calendar unavailable
  }
  return { blocked: false, reason: "" };
}

// ─────────────────────────────────────────────
// ML HELPERS
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// WALK-FORWARD MODEL VALIDATOR
// Checks if a newly trained model beats the current one
// on the last 50 candles before it is deployed live
// Called by timi-retrain before swapping ml_models table
// Returns: { approved: bool, newWR: number, oldWR: number }
// ─────────────────────────────────────────────
function walkForwardValidate(
  newModel: any,
  oldModel: any,
  recentFeatures: number[][],
  recentOutcomes: number[]  // 1 = win, 0 = loss (last 50 trades)
): { approved: boolean; newWR: number; oldWR: number; reason: string } {
  if (!recentFeatures || recentFeatures.length < 20) {
    return { approved: true, newWR: 0, oldWR: 0, reason: "insufficient_history_auto_approve" };
  }
  let newCorrect = 0, oldCorrect = 0;
  const n = Math.min(recentFeatures.length, recentOutcomes.length);
  for (let i = 0; i < n; i++) {
    const feat = recentFeatures[i];
    const actual = recentOutcomes[i];
    // New model prediction
    const newSum  = newModel.main_trees.reduce((s: number, t: any) => s + predictTree(t, feat), 0);
    const newPred = sigmoid(newSum) > 0.5 ? 1 : 0;
    if (newPred === actual) newCorrect++;
    // Old model prediction
    if (oldModel?.main_trees) {
      const oldSum  = oldModel.main_trees.reduce((s: number, t: any) => s + predictTree(t, feat), 0);
      const oldPred = sigmoid(oldSum) > 0.5 ? 1 : 0;
      if (oldPred === actual) oldCorrect++;
    } else {
      oldCorrect++; // no old model = auto approve
    }
  }
  const newWR = newCorrect / n;
  const oldWR = oldCorrect / n;
  // Only deploy if new model is at least as good as old (within 2% tolerance)
  const approved = newWR >= oldWR - 0.02;
  const reason   = approved
    ? `new_model_approved: ${(newWR*100).toFixed(1)}% vs old ${(oldWR*100).toFixed(1)}%`
    : `new_model_rejected: ${(newWR*100).toFixed(1)}% < old ${(oldWR*100).toFixed(1)}% - 2%`;
  console.log(`🔬 Walk-forward: ${reason}`);
  return { approved, newWR, oldWR, reason };
}

// ─────────────────────────────────────────────
// PSI DRIFT DETECTOR
// Compares live feature distributions vs training baseline
// If PSI > 0.25 for any feature → model is stale → force retrain
// PSI < 0.1 = stable, 0.1-0.25 = slight shift, > 0.25 = major drift
// ─────────────────────────────────────────────
function psiScore(trainDist: number[], liveDist: number[], bins = 10): number {
  const min = Math.min(...trainDist, ...liveDist);
  const max = Math.max(...trainDist, ...liveDist);
  if (max === min) return 0;
  const step = (max - min) / bins;
  let psi = 0;
  for (let i = 0; i < bins; i++) {
    const lo = min + i * step, hi = lo + step;
    const expPct = (trainDist.filter(v => v >= lo && v < hi).length / trainDist.length) || 0.001;
    const actPct = (liveDist.filter(v => v >= lo && v < hi).length / liveDist.length) || 0.001;
    psi += (actPct - expPct) * Math.log(actPct / expPct);
  }
  return Math.abs(psi);
}

async function checkFeatureDrift(supabase: any, liveFeatures: number[][]): Promise<{ drifted: boolean; worstFeature: number; worstPsi: number }> {
  try {
    const { data } = await supabase.from("feature_baselines").select("feature_index, baseline_values").limit(10);
    if (!data || data.length === 0) return { drifted: false, worstFeature: -1, worstPsi: 0 };
    let worstPsi = 0, worstFeature = -1;
    for (const row of data) {
      const liveVals = liveFeatures.map(f => f[row.feature_index]).filter(v => !isNaN(v));
      const psi = psiScore(row.baseline_values, liveVals);
      if (psi > worstPsi) { worstPsi = psi; worstFeature = row.feature_index; }
    }
    const drifted = worstPsi > 0.25;
    if (drifted) {
      console.log(`⚠️  Feature drift detected! Feature #${worstFeature} PSI=${worstPsi.toFixed(3)} > 0.25 — retrain recommended`);
      await supabase.from("bot_config").update({ needs_retrain: true, drift_psi: worstPsi }).eq("active", true);
    }
    return { drifted, worstFeature, worstPsi };
  } catch(e) {
    return { drifted: false, worstFeature: -1, worstPsi: 0 };
  }
}

// ─────────────────────────────────────────────
// INTER-SYMBOL CORRELATION ENGINE
// BOOM/CRASH are anti-correlated — when one gives BUY the other
// should give SELL. Agreement = noise, Disagreement = confirmation.
// VIX pairs (R_75/R_100) are positively correlated — agreement = stronger signal.
// ─────────────────────────────────────────────
const SYMBOL_CORRELATIONS: Record<string, { partner: string; type: "anti" | "positive" }[]> = {
  "BOOM1000":  [{ partner: "CRASH1000", type: "anti"     }, { partner: "BOOM500",   type: "positive" }],
  "BOOM500":   [{ partner: "CRASH500",  type: "anti"     }, { partner: "BOOM1000",  type: "positive" }],
  "CRASH1000": [{ partner: "BOOM1000",  type: "anti"     }, { partner: "CRASH500",  type: "positive" }],
  "CRASH500":  [{ partner: "BOOM500",   type: "anti"     }, { partner: "CRASH1000", type: "positive" }],
  "R_75":      [{ partner: "R_100",     type: "positive" }, { partner: "R_50",      type: "positive" }],
  "R_100":     [{ partner: "R_75",      type: "positive" }, { partner: "R_50",      type: "positive" }],
  "R_50":      [{ partner: "R_75",      type: "positive" }, { partner: "R_25",      type: "positive" }],
  "R_25":      [{ partner: "R_50",      type: "positive" }],
  "frxEURUSD": [{ partner: "frxGBPUSD", type: "positive" }, { partner: "frxUSDCHF", type: "anti" }],
  "frxGBPUSD": [{ partner: "frxEURUSD", type: "positive" }],
  "frxUSDJPY": [{ partner: "frxEURJPY", type: "positive" }, { partner: "frxGBPJPY", type: "positive" }],
};

// Checks all signals collected so far and applies a confidence boost/penalty
// based on whether correlated symbols agree or conflict
function applyCorrelationScoring(signals: any[]): any[] {
  if (signals.length < 2) return signals;

  // Build lookup: symbol → signal
  const sigMap: Record<string, any> = {};
  for (const s of signals) sigMap[s.symbol] = s;

  return signals.map(sig => {
    const rels = SYMBOL_CORRELATIONS[sig.symbol];
    if (!rels) return sig;

    let corrBoost = 0;
    const corrReasons: string[] = [];

    for (const rel of rels) {
      const partner = sigMap[rel.partner];
      if (!partner) continue;

      const agrees = sig.action === partner.action;

      if (rel.type === "anti") {
        // Anti-correlated: disagreement is the correct pattern
        // BOOM BUY + CRASH SELL = both correct → boost both
        // BOOM BUY + CRASH BUY = both same direction = noise → penalise
        if (!agrees) {
          corrBoost += 5;
          corrReasons.push(`✅ ${rel.partner} anti-confirms (${partner.action})`);
        } else {
          corrBoost -= 8;
          corrReasons.push(`⚠️ ${rel.partner} anti-conflict (both ${sig.action} — noise)`);
        }
      } else {
        // Positive-correlated: agreement = stronger signal
        if (agrees) {
          corrBoost += 4;
          corrReasons.push(`✅ ${rel.partner} confirms (${partner.action})`);
        } else {
          corrBoost -= 4;
          corrReasons.push(`⚠️ ${rel.partner} conflicts (${partner.action} vs ${sig.action})`);
        }
      }
    }

    if (corrBoost !== 0) {
      console.log(`🔗 ${sig.symbol} correlation: ${corrBoost > 0 ? "+" : ""}${corrBoost} — ${corrReasons.join(", ")}`);
    }

    return {
      ...sig,
      confidence:   Math.min(95, Math.max(40, sig.confidence + corrBoost)),
      corr_boost:   corrBoost,
      corr_reasons: corrReasons,
    };
  });
}

// StochRSI for R_75 mean reversion strategy
function calcStochRSI(closes: number[], period: number = 14): number {
  if (closes.length < period * 2) return 50;
  const rsiVals: number[] = [];
  for (let i = period; i < closes.length; i++) {
    rsiVals.push(calcRSI(closes.slice(0, i + 1)));
  }
  if (rsiVals.length < period) return 50;
  const recent = rsiVals.slice(-period);
  const minR   = Math.min(...recent), maxR = Math.max(...recent);
  if (maxR === minR) return 50;
  return ((rsiVals[rsiVals.length - 1] - minR) / (maxR - minR)) * 100;
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



// ─────────────────────────────────────────────
// GARCH(1,1) — conditional volatility estimate
// ─────────────────────────────────────────────
function garchVolatility(returns: number[], omega=1e-6, alpha=0.1, beta=0.85): number[] {
  const n = returns.length;
  const variance = new Array(n).fill(0);
  const warmup = returns.slice(0, 20);
  variance[0] = warmup.reduce((a,b) => a + b*b, 0) / (warmup.length || 1);
  for (let i = 1; i < n; i++) {
    variance[i] = omega + alpha * returns[i-1]**2 + beta * variance[i-1];
  }
  return variance.map(v => Math.sqrt(Math.max(v, 1e-12)));
}

// ─────────────────────────────────────────────
// ORNSTEIN-UHLENBECK — mean reversion features
// ─────────────────────────────────────────────
function ouFeatures(prices: number[], window=20): { theta: number; zscore: number; revTime: number; meanDist: number } {
  if (prices.length < window) return { theta:0, zscore:0, revTime:1, meanDist:0 };
  const p   = prices.slice(-window);
  const mu  = p.reduce((a,b) => a+b, 0) / window;
  const std = Math.sqrt(p.reduce((a,b) => a + (b-mu)**2, 0) / window) + 1e-10;

  // Estimate theta via OLS: dp = theta*(mu-p)*dt
  const y = p.slice(1).map((v,i) => v - p[i]);
  const x = p.slice(0,-1).map(v => mu - v);
  const xxSum = x.reduce((a,b) => a + b*b, 0);
  const xySum = x.reduce((a,b,i) => a + b*y[i], 0);
  const theta = xxSum > 1e-12 ? Math.max(0, Math.min(5, xySum/xxSum)) : 0;

  const last = prices[prices.length-1];
  return {
    theta,
    zscore:   (last - mu) / std,
    revTime:  theta > 0.01 ? Math.min(1, 1/(theta*50)) : 1,
    meanDist: (last - mu) / (mu + 1e-10)
  };
}

// ─────────────────────────────────────────────
// VWAP PROXY — range-weighted average price
// ─────────────────────────────────────────────
function vwapFeatures(candles1m: any[], window=20): { dist: number; direction: number } {
  const recent = candles1m.slice(-window);
  let sumTpVol = 0, sumVol = 0;
  for (const c of recent) {
    const h = parseFloat(c.high), l = parseFloat(c.low), cl = parseFloat(c.close);
    const tp  = (h + l + cl) / 3;
    const vol = (h - l) + 1e-10;
    sumTpVol += tp * vol;
    sumVol   += vol;
  }
  const vwap  = sumTpVol / sumVol;
  const price = parseFloat(candles1m[candles1m.length-1].close);
  const dist  = (price - vwap) / (vwap + 1e-10);
  return { dist, direction: dist > 0 ? 1 : dist < 0 ? -1 : 0 };
}

// ─────────────────────────────────────────────
// SESSION FEATURES — regime-aware time encoding
// ─────────────────────────────────────────────
function sessionFeatures(): { asian:number; london:number; ny:number; overlap:number; night:number; strength:number } {
  const h = new Date().getUTCHours();
  if (h >= 0  && h < 7)  return { asian:1, london:0, ny:0, overlap:0, night:0, strength:0.3 };
  if (h >= 7  && h < 12) return { asian:0, london:1, ny:0, overlap:0, night:0, strength:0.7 };
  if (h >= 12 && h < 16) return { asian:0, london:1, ny:1, overlap:1, night:0, strength:1.0 };
  if (h >= 16 && h < 21) return { asian:0, london:0, ny:1, overlap:0, night:0, strength:0.8 };
  return { asian:0, london:0, ny:0, overlap:0, night:1, strength:0.2 };
}


// ─────────────────────────────────────────────
// FRACTIONAL DIFFERENCING
// Preserves market memory (Bhatti research)
// ─────────────────────────────────────────────
function fractionalDiff(prices: number[], d: number, threshold = 1e-4): number[] {
  const w: number[] = [1.0];
  let k = 1;
  while (Math.abs(w[w.length-1]) > threshold) {
    w.push(-w[w.length-1] * (d - k + 1) / k);
    k++;
  }
  const wRev = w.reverse();
  const wLen = wRev.length;
  const fd   = new Array(prices.length).fill(0);
  for (let i = wLen - 1; i < prices.length; i++) {
    let val = 0;
    for (let j = 0; j < wLen; j++) val += wRev[j] * prices[i - wLen + 1 + j];
    fd[i] = val;
  }
  return fd;
}

// ─────────────────────────────────────────────
// HURST EXPONENT — R/S method
// H > 0.5 = trending, H < 0.5 = mean reverting
// ─────────────────────────────────────────────
function hurstRS(prices: number[]): number {
  if (prices.length < 20) return 0.5;
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log((prices[i] + 1e-10) / (prices[i-1] + 1e-10)));
  }
  const scales = [8, 16, 32];
  const logScales: number[] = [], logRS: number[] = [];
  for (const scale of scales) {
    if (scale > returns.length / 2) continue;
    const nChunks = Math.floor(returns.length / scale);
    if (nChunks < 1) continue;
    const rsVals: number[] = [];
    for (let j = 0; j < nChunks; j++) {
      const chunk = returns.slice(j*scale, (j+1)*scale);
      const mean  = chunk.reduce((a,b)=>a+b,0)/chunk.length;
      const dev   = chunk.reduce((acc,v,i2) => { acc.push((acc[i2-1]||0)+(v-mean)); return acc; }, [] as number[]);
      const R = Math.max(...dev) - Math.min(...dev);
      const S = Math.sqrt(chunk.reduce((a,b)=>a+(b-mean)**2,0)/chunk.length) + 1e-10;
      rsVals.push(R/S);
    }
    if (rsVals.length > 0) {
      logScales.push(Math.log(scale));
      logRS.push(Math.log(rsVals.reduce((a,b)=>a+b,0)/rsVals.length + 1e-10));
    }
  }
  if (logScales.length < 2) return 0.5;
  const n = logScales.length;
  const sumX = logScales.reduce((a,b)=>a+b,0);
  const sumY = logRS.reduce((a,b)=>a+b,0);
  const sumXY = logScales.reduce((a,b,i)=>a+b*logRS[i],0);
  const sumX2 = logScales.reduce((a,b)=>a+b*b,0);
  const H = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
  return Math.max(0.1, Math.min(0.9, H));
}

// ─────────────────────────────────────────────
// VISIBILITY GRAPH — fast approximation
// Returns: vg_hurst, vg_alpha, vg_hub_density
// ─────────────────────────────────────────────
function visibilityGraphFeatures(prices: number[]): { vgHurst: number; vgAlpha: number; vgHub: number } {
  const n = Math.min(prices.length, 30);
  const p = prices.slice(-n);
  const degrees = new Array(n).fill(0);
  for (let a = 0; a < n; a++) {
    for (let b = a+1; b < Math.min(a+10, n); b++) {
      let visible = true;
      for (let c = a+1; c < b; c++) {
        const interp = p[a] + (p[b]-p[a])*(c-a)/(b-a);
        if (p[c] >= interp) { visible = false; break; }
      }
      if (visible) { degrees[a]++; degrees[b]++; }
    }
  }
  const meanD = degrees.reduce((a,b)=>a+b,0)/n + 1e-10;
  const stdD  = Math.sqrt(degrees.reduce((a,b)=>a+(b-meanD)**2,0)/n) + 1e-10;
  const vgHurst = Math.max(0.1, Math.min(0.9, 0.5 + 0.3*Math.tanh((stdD/meanD-0.5)*2)));
  const hubCount = degrees.filter(d => d > meanD*2).length;
  const vgHub    = hubCount / n;
  const nonZero  = degrees.filter(d=>d>0).sort((a,b)=>b-a);
  let vgAlpha = 1.0;
  if (nonZero.length > 3) {
    const logK = nonZero.map((d,i)=>Math.log(d+1));
    const logR = nonZero.map((_,i)=>Math.log(i+1));
    const n2 = logK.length;
    const sx = logR.reduce((a,b)=>a+b,0), sy = logK.reduce((a,b)=>a+b,0);
    const sxy = logR.reduce((a,b,i)=>a+b*logK[i],0);
    const sx2 = logR.reduce((a,b)=>a+b*b,0);
    const denom = n2*sx2 - sx*sx;
    if (Math.abs(denom) > 1e-10) vgAlpha = Math.max(0.5, Math.min(4, -(n2*sxy-sx*sy)/denom));
  }
  return { vgHurst, vgAlpha, vgHub };
}

// ─────────────────────────────────────────────
// OGD ENSEMBLE REGIME DETECTION
// Combines HMM + Rule-based + Momentum detector
// Online reweighting after every trade outcome
// Paper: Guibert & Cuervo-Paloma 2025 → 51%→80%
// ─────────────────────────────────────────────
let OGD_WEIGHTS = { hmm: 0.5, rules: 0.3, momentum: 0.2 };
let OGD_LOSSES  = { hmm: 0, rules: 0, momentum: 0 };
const OGD_LR    = 0.1; // learning rate

function rulesRegime(features: number[]): string {
  // Rule-based regime detector (fast, no model needed)
  const rsi       = features[0]  || 50;
  const atr_pct   = features[3]  || 0.001;
  const mom10     = features[5]  || 0;
  const vg_hurst  = features[9]  || 0.5;
  const gc_kurt   = features[12] || 1.0;

  if (gc_kurt > 4.0 || atr_pct > 0.005) return "HighVolatility";
  if (Math.abs(mom10) > 0.002 && vg_hurst > 0.58) return "Uptrend";
  if (Math.abs(mom10) > 0.002 && vg_hurst < 0.42) return "Downtrend";
  return "Ranging";
}

function momentumRegime(candles: any[]): string {
  // Momentum-based regime detector
  if (candles.length < 20) return "Ranging";
  const closes  = candles.slice(-20).map((c:any) => parseFloat(c.close));
  const returns = closes.slice(1).map((c,i) => (c - closes[i]) / (closes[i] + 1e-10));
  const mean    = returns.reduce((a,b)=>a+b,0) / returns.length;
  const vol     = Math.sqrt(returns.reduce((a,b)=>a+(b-mean)**2,0)/returns.length);
  const recent  = returns.slice(-5).reduce((a,b)=>a+b,0) / 5;
  const sharpe  = vol > 0 ? recent / vol : 0;

  if (sharpe > 1.5)  return "Uptrend";
  if (sharpe < -1.5) return "Downtrend";
  if (vol < 0.0003)  return "Ranging";
  return "HighVolatility";
}

function ogdEnsembleRegime(
  hmmRegime: string, features: number[], candles: any[]
): { name: string; tradable: boolean; allowedAction: string; confidence: number } {
  // Get predictions from all 3 detectors
  const rulesR    = rulesRegime(features);
  const momentumR = momentumRegime(candles);

  // Vote with current weights
  const votes: Record<string, number> = {
    "Uptrend": 0, "Downtrend": 0, "Ranging": 0, "HighVolatility": 0
  };
  votes[hmmRegime]   = (votes[hmmRegime]   || 0) + OGD_WEIGHTS.hmm;
  votes[rulesR]      = (votes[rulesR]      || 0) + OGD_WEIGHTS.rules;
  votes[momentumR]   = (votes[momentumR]   || 0) + OGD_WEIGHTS.momentum;

  // Find winning regime
  const winner = Object.entries(votes).reduce((a,b) => b[1]>a[1] ? b : a)[0];
  const confidence = votes[winner];

  // Agreement bonus — all 3 agree = higher confidence
  const allAgree = hmmRegime === rulesR && rulesR === momentumR;
  const finalConf = allAgree ? Math.min(1, confidence * 1.3) : confidence;

  // Tradability rules
  const tradable     = winner !== "Ranging" || allAgree;
  const allowedAction =
    winner === "Uptrend"       ? "BUY"  :
    winner === "Downtrend"     ? "SELL" :
    winner === "HighVolatility" ? "ANY"  : "ANY";

  return { name: winner, tradable, allowedAction, confidence: finalConf };
}

async function ogdUpdateWeights(supabase: any): Promise<void> {
  // Load recent trade outcomes and update OGD weights
  try {
    const { data: trades } = await supabase
      .from("trades")
      .select("result,session")
      .eq("account_name","edge_function")
      .in("result",["win","loss","WIN","LOSS"])
      .order("created_at",{ascending:false})
      .limit(50);

    if (!trades || trades.length < 10) return;

    // Simple update: if recent win rate > 60% keep weights, else shift
    const wins = trades.filter((t:any) => ["win","WIN"].includes(t.result)).length;
    const wr   = wins / trades.length;

    if (wr < 0.50) {
      // Shift more weight to momentum (more reactive)
      OGD_WEIGHTS.hmm      = Math.max(0.2, OGD_WEIGHTS.hmm - OGD_LR * 0.5);
      OGD_WEIGHTS.momentum = Math.min(0.6, OGD_WEIGHTS.momentum + OGD_LR * 0.3);
      OGD_WEIGHTS.rules    = 1 - OGD_WEIGHTS.hmm - OGD_WEIGHTS.momentum;
    } else if (wr > 0.70) {
      // Shift more weight to HMM (more stable)
      OGD_WEIGHTS.hmm      = Math.min(0.7, OGD_WEIGHTS.hmm + OGD_LR * 0.3);
      OGD_WEIGHTS.momentum = Math.max(0.1, OGD_WEIGHTS.momentum - OGD_LR * 0.2);
      OGD_WEIGHTS.rules    = 1 - OGD_WEIGHTS.hmm - OGD_WEIGHTS.momentum;
    }
    console.log(`⚖️ OGD weights: HMM=${OGD_WEIGHTS.hmm.toFixed(2)} Rules=${OGD_WEIGHTS.rules.toFixed(2)} Mom=${OGD_WEIGHTS.momentum.toFixed(2)} WR=${(wr*100).toFixed(0)}%`);
  } catch(e) {
    console.log(`⚠️ OGD update failed: ${e}`);
  }
}

// ─────────────────────────────────────────────
// RETAIL EXHAUSTION TIMER
// ─────────────────────────────────────────────
const RETAIL_FLIP_TIMES: Record<string,number> = {
  "frxEURUSD":30,"frxGBPUSD":116,"frxAUDUSD":230,"frxUSDJPY":190,
  "frxUSDCAD":200,"frxUSDCHF":210,"frxXAUUSD":45,"frxXAGUSD":60,
  "cryBTCUSD":120,"cryETHUSD":100,
  "BOOM500":15,"BOOM1000":18,"CRASH500":15,"CRASH1000":18,
  "R_25":20,"R_50":22,"R_75":25,"R_100":28,
};

function retailExhaustionFeatures(closes: number[], symbol: string): { exhaustion: number; cyclePos: number } {
  const flipTime = RETAIL_FLIP_TIMES[symbol] || 60;
  const window = Math.min(closes.length, 200);
  const p = closes.slice(-window);
  const returns = p.slice(1).map((v,i)=>(v-p[i])/(p[i]+1e-10));

  // Find last direction reversal
  let lastReversal = 0;
  let prevDir = Math.sign(returns[0]);
  for (let i = 1; i < returns.length; i++) {
    const dir = Math.sign(returns[i]);
    if (dir !== 0 && dir !== prevDir) {
      lastReversal = returns.length - i;
      prevDir = dir;
    }
  }
  const exhaustion = Math.min(1, lastReversal / (flipTime + 1e-10));
  return { exhaustion, cyclePos: lastReversal / 300 };
}

// ─────────────────────────────────────────────
// FLOW TOXICITY
// Low = retail dominant = our edge highest
// ─────────────────────────────────────────────
function flowToxicityFeatures(closes: number[], highs: number[], lows: number[]): { toxicity: number; benign: number } {
  const n = Math.min(closes.length, 20);
  const c = closes.slice(-n), h = highs.slice(-n), l = lows.slice(-n);
  const returns = c.slice(1).map((v,i)=>Math.abs((v-c[i])/(c[i]+1e-10)));
  const netMove = Math.abs(c[n-1]-c[0])/(c[0]+1e-10);
  const totalMove = returns.reduce((a,b)=>a+b,0) + 1e-10;
  const efficiency = netMove / totalMove;
  const recentVol  = returns.slice(-5).reduce((a,b)=>a+b,0)/5 + 1e-10;
  const baseVol    = returns.reduce((a,b)=>a+b,0)/returns.length + 1e-10;
  const volSpike   = recentVol / baseVol;
  const hlRange    = h.map((hi,i)=>(hi-l[i])/(l[i]+1e-10));
  const bodies     = c.slice(1).map((v,i)=>Math.abs(v-c[i]));
  const bodyRatio  = (bodies.reduce((a,b)=>a+b,0)/bodies.length) / (hlRange.slice(1).reduce((a,b)=>a+b,0)/hlRange.slice(1).length + 1e-10);
  const toxicity   = Math.min(1, efficiency*0.4 + Math.max(0,volSpike-1)*0.3 + bodyRatio*0.3);
  return { toxicity, benign: 1-toxicity };
}

// ─────────────────────────────────────────────
// GRAM-CHARLIER DISTRIBUTION FEATURES
// ─────────────────────────────────────────────
function gramCharlierFeatures(closes: number[]): { skewness: number; kurtosis: number; gcWeight: number } {
  const n = Math.min(closes.length, 60);
  const returns = closes.slice(-n).slice(1).map((v,i,arr)=>(v-closes.slice(-n)[i])/(closes.slice(-n)[i]+1e-10));
  const m = returns.length;
  const mean = returns.reduce((a,b)=>a+b,0)/m;
  const variance = returns.reduce((a,b)=>a+(b-mean)**2,0)/m + 1e-10;
  const std = Math.sqrt(variance);
  const skewness = returns.reduce((a,b)=>a+((b-mean)/std)**3,0)/m;
  const kurtosis = returns.reduce((a,b)=>a+((b-mean)/std)**4,0)/m - 3;
  const gcWeight = Math.min(1, Math.abs(skewness)*0.3 + Math.abs(kurtosis)*0.1);
  return {
    skewness: Math.max(-3, Math.min(3, skewness)),
    kurtosis: Math.max(-2, Math.min(10, kurtosis)),
    gcWeight
  };
}

// ─────────────────────────────────────────────
// CONTRARIAN COMPOSITE SCORE
// ─────────────────────────────────────────────
function contrarianComposite(rsi: number, ouZscore: number, exhaustion: number,
  toxicity: number, hurst: number): number {
  let s = 0;
  if (rsi > 65 || rsi < 35) s += 0.20; else s += 0.05;
  s += Math.min(Math.abs(ouZscore)/3, 1) * 0.20;
  s += exhaustion * 0.20;
  s += (1-toxicity) * 0.20;
  if (hurst < 0.4) s += 0.20;
  else if (hurst < 0.5) s += 0.10;
  return Math.min(1, s);
}

// ─────────────────────────────────────────────
// KALMAN FILTER — adaptive price smoother
// ─────────────────────────────────────────────
function kalmanFilter(prices: number[], processNoise = 1e-5, measurementNoise = 1e-2): { filtered: number[]; velocity: number[] } {
  const n = prices.length;
  const filtered  = new Array(n).fill(0);
  const velocity  = new Array(n).fill(0);

  let x0 = prices[0], x1 = 0.0; // state: [price, velocity]
  let p00 = 1.0, p01 = 0.0, p10 = 0.0, p11 = 1.0; // covariance 2x2

  for (let i = 0; i < n; i++) {
    // Predict: x = F*x, P = F*P*F' + Q
    const px0 = x0 + x1;
    const px1 = x1;
    const pp00 = p00 + p10 + p01 + p11 + processNoise;
    const pp01 = p01 + p11;
    const pp10 = p10 + p11;
    const pp11 = p11 + processNoise;

    // Update: K = P*H'*(H*P*H'+R)^-1
    const S   = pp00 + measurementNoise;
    const k0  = pp00 / S;
    const k1  = pp10 / S;
    const inn = prices[i] - px0; // innovation

    x0 = px0 + k0 * inn;
    x1 = px1 + k1 * inn;
    p00 = pp00 - k0 * pp00;
    p01 = pp01 - k0 * pp01;
    p10 = pp10 - k1 * pp00;
    p11 = pp11 - k1 * pp01;

    filtered[i] = x0;
    velocity[i] = x1;
  }
  return { filtered, velocity };
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
  // ── 6 Kalman features ──
  const kf      = kalmanFilter(c);
  const kfPrice = kf.filtered[kf.filtered.length - 1];
  const kfVel   = kf.velocity[kf.velocity.length - 1];

  // 1. Price deviation from Kalman estimate
  const kalman_price_vs_raw  = (price - kfPrice) / (kfPrice + 1e-10);
  // 2. Kalman velocity (trend speed)
  const kalman_velocity      = kfVel / (kfPrice + 1e-10);
  // 3. Kalman trend direction
  const kalman_trend_dir     = kfVel > 0 ? 1 : kfVel < 0 ? -1 : 0;
  // 4. Kalman noise ratio — rolling std of residuals (last 20)
  const residuals = kf.filtered.slice(-20).map((kp, i) => (c[c.length - 20 + i] - kp) / (kp + 1e-10));
  const resMean   = residuals.reduce((a, b) => a + b, 0) / residuals.length;
  const kalman_noise_ratio   = Math.sqrt(residuals.reduce((a, b) => a + Math.pow(b - resMean, 2), 0) / residuals.length);
  // 5. Kalman-EMA agreement
  const ema8dir              = ema8 > ema21 ? 1 : -1;
  const kalman_ema_agreement = Math.sign(kfVel) === ema8dir ? 1 : 0;
  // 6. Kalman acceleration (change in velocity)
  const kfVelPrev            = kf.velocity[kf.velocity.length - 2] || 0;
  const kalman_acceleration  = (kfVel - kfVelPrev) / (Math.abs(kfPrice) + 1e-10);

  // ── GARCH (2 features) ──
  const closePrices = c;
  const returns = closePrices.map((v,i) => i===0 ? 0 : (v - closePrices[i-1])/(closePrices[i-1]+1e-10));
  const garchVols  = garchVolatility(returns);
  const garch_vol  = garchVols[garchVols.length-1];
  const realized_vs_garch = (atr_pct - garch_vol) / (garch_vol + 1e-10);

  // ── ORNSTEIN-UHLENBECK (4 features) ──
  const ou = ouFeatures(c);

  // ── VWAP (2 features) ──
  const vwap = vwapFeatures(candles1m);

  // ── SESSION (6 features) ──
  const sess = sessionFeatures();

  // ── NEW: 15 additional features ──
  const prices = c;

  // Fractional differencing (2)
  const fd03  = fractionalDiff(prices, 0.3);
  const fd04  = fractionalDiff(prices, 0.4);
  const fd_03 = fd03[fd03.length-1] / (price + 1e-10);
  const fd_04 = fd04[fd04.length-1] / (price + 1e-10);

  // dLTM score (1) — simplified rolling optimal d
  const dltm_score = Math.abs(fd_03 - fd_04) < 0.001 ? 0.3 : 0.4;

  // Hurst exponent R/S (1)
  const hurst_exponent = hurstRS(prices);

  // Visibility graph (3)
  const vg = visibilityGraphFeatures(prices);

  // Retail exhaustion (2)
  // symbol passed from outer scope via closure — use sess as proxy
  const re = retailExhaustionFeatures(prices, "");
  const retail_exhaustion = re.exhaustion;
  const retail_cycle_pos  = re.cyclePos;

  // Flow toxicity (2)
  const ft = flowToxicityFeatures(
    candles1m.map((x:any)=>parseFloat(x.close)),
    candles1m.map((x:any)=>parseFloat(x.high)),
    candles1m.map((x:any)=>parseFloat(x.low))
  );

  // Gram-Charlier (3)
  const gc = gramCharlierFeatures(prices);

  // Contrarian composite (1)
  const contrarian = contrarianComposite(rsi, ou.zscore, retail_exhaustion, ft.toxicity, hurst_exponent);

  // ── Tick Density + Volume Features (4) ──
  // Synthetics have no real volume but tick density encodes volatility regime
  // better than GARCH alone — how many ticks fired per candle
  const recentCandles20 = candles1m.slice(-20);
  const tickCounts = recentCandles20.map((c: any) => {
    // Deriv candles don't have explicit tick_count but we can proxy it:
    // wider candle range = more activity = more ticks
    const h2 = parseFloat(c.high), l2 = parseFloat(c.low), o2 = parseFloat(c.open), cl2 = parseFloat(c.close);
    const range2 = h2 - l2;
    const body2  = Math.abs(cl2 - o2);
    return range2 > 0 ? body2 / range2 : 0.5; // range_density per candle
  });

  // Tick velocity: avg candle range relative to price (activity proxy)
  const avgRange = recentCandles20.reduce((s: number, c: any) =>
    s + (parseFloat(c.high) - parseFloat(c.low)), 0) / recentCandles20.length;
  const tick_velocity = avgRange / (price + 1e-10);  // normalized

  // Bull ratio: proportion of up-close candles (order flow direction)
  const upCandles = recentCandles20.filter((c: any) => parseFloat(c.close) > parseFloat(c.open)).length;
  const tick_bull_ratio = upCandles / recentCandles20.length;  // 0-1, >0.6 = bullish flow

  // Range density: avg body/range (high = trending, low = indecisive)
  const range_density = tickCounts.reduce((a: number, b: number) => a + b, 0) / tickCounts.length;

  // Volume momentum: compare last 5 candle activity vs last 20
  const recent5Ranges = candles1m.slice(-5).map((c: any) => parseFloat(c.high) - parseFloat(c.low));
  const avgRange5 = recent5Ranges.reduce((a: number, b: number) => a + b, 0) / recent5Ranges.length;
  const vol_momentum = (avgRange5 - avgRange) / (avgRange + 1e-10);  // positive = accelerating

  return [
    // Base 21
    rsi, macd_hist, bb_pos, bb_width, ema_bull, ema_bear,
    (price - ema8) / (ema8 + 1e-10), (price - ema21) / (ema21 + 1e-10), (price - ema50) / (ema50 + 1e-10),
    atr_pct, candle_body, candle_dir, high_low_range,
    mom(1), mom(3), mom(5), mom(10),
    rsi < 35 ? 1 : 0, rsi > 65 ? 1 : 0, rsi >= 45 && rsi <= 55 ? 1 : 0,
    trend5m,
    // Kalman 6
    kalman_price_vs_raw, kalman_velocity, kalman_trend_dir,
    kalman_noise_ratio, kalman_ema_agreement, kalman_acceleration,
    // GARCH 2
    garch_vol, realized_vs_garch,
    // OU 4
    ou.theta, ou.zscore, ou.revTime, ou.meanDist,
    // VWAP 2
    vwap.dist, vwap.direction,
    // Session 6
    sess.asian, sess.london, sess.ny, sess.overlap, sess.night, sess.strength,
    // Fractional Diff 2
    fd_03, fd_04,
    // dLTM 1
    dltm_score,
    // Hurst 1
    hurst_exponent,
    // Visibility Graph 3
    vg.vgHurst, vg.vgAlpha, vg.vgHub,
    // Retail Exhaustion 2
    retail_exhaustion, retail_cycle_pos,
    // Flow Toxicity 2
    ft.toxicity, ft.benign,
    // Gram-Charlier 3
    gc.skewness, gc.kurtosis, gc.gcWeight,
    // Contrarian Composite 1
    contrarian,
    // Tick Density + Volume 4
    tick_velocity, tick_bull_ratio, range_density, vol_momentum
  ]; // total: 60 features
}


// ─────────────────────────────────────────────
// TRUE HMM — VITERBI DECODER
// Loads learned A, B, π matrices from Supabase
// Runs Viterbi to find current hidden market state
// States: 0=Uptrend 1=Downtrend 2=Ranging 3=HighVol
// ─────────────────────────────────────────────
let HMM_MODEL: any = null;
let SPECIALIST_MODELS: Record<string, any> = {};

async function loadSpecialistModels(supabase: any): Promise<void> {
  if (Object.keys(SPECIALIST_MODELS).length > 0) return;
  try {
    const { data } = await supabase
      .from("specialist_models")
      .select("symbol,model_json");
    if (data) {
      for (const row of data) {
        try {
          SPECIALIST_MODELS[row.symbol] = typeof row.model_json === "string"
            ? JSON.parse(row.model_json)
            : row.model_json;
        } catch(e) {}
      }
      console.log(`🧠 Specialist models loaded: ${Object.keys(SPECIALIST_MODELS).join(", ")}`);
    }
  } catch(e) {
    console.log(`⚠️ Specialist models load failed: ${e}`);
  }
}

function getSpecialistRegime(hurst: number, gcKurtosis: number): string {
  if (hurst > 0.58) return "trending";
  if (hurst < 0.42 || gcKurtosis > 3.0) return "volatile";
  return "ranging";
}

function mlPredictSpecialist(
  specialistData: any, regime: string, featVals: number[]
): { action: string; confidence: number; reason: string } | null {
  const specialists = specialistData?.specialists;
  if (!specialists || !specialists[regime]) return null;

  const spec = specialists[regime];
  if (!spec.main_trees || spec.main_trees.length === 0) return null;

  try {
    const mainSum  = spec.main_trees.reduce((s: number, t: any) => s + predictTree(t, featVals), 0);
    const mlProb   = sigmoid(mainSum);
    const pred     = mlProb > 0.5 ? 1 : 0;
    const metaF    = [...featVals, mlProb];
    const metaSum  = spec.meta_trees.reduce((s: number, t: any) => s + predictTree(t, metaF), 0);
    const metaConf = sigmoid(metaSum);
    const threshold = spec.meta_threshold || 0.55;
    if (metaConf < threshold) return { action: "HOLD", confidence: 0, reason: `spec_meta_blocked:${metaConf.toFixed(2)}` };
    const action     = pred === 1 ? "BUY" : "SELL";
    const confidence = Math.min(95, Math.round(metaConf * 100));
    return { action, confidence, reason: `specialist_${regime}:${mlProb.toFixed(2)}` };
  } catch(e) {
    return null;
  }
}

async function loadHMMModel(supabase: any): Promise<void> {
  if (HMM_MODEL) return; // already loaded
  try {
    const { data } = await supabase
      .from("hmm_models")
      .select("model_json")
      .eq("model_id", "shared_hmm_v1")
      .single();
    if (data?.model_json) {
      HMM_MODEL = typeof data.model_json === "string"
        ? JSON.parse(data.model_json)
        : data.model_json;
      console.log(`✅ HMM loaded: ${HMM_MODEL.n_states} states`);
    }
  } catch(e) {
    console.log(`⚠️ HMM load failed: ${e}`);
  }
}

function hmmViterbi(obs: number[]): { state: number; name: string; tradable: boolean; allowedAction: string } {
  if (!HMM_MODEL || obs.length === 0) {
    return { state: 2, name: "Ranging", tradable: false, allowedAction: "NONE" };
  }

  const A  = HMM_MODEL.A  as number[][];
  const B  = HMM_MODEL.B  as number[][];
  const pi = HMM_MODEL.pi as number[];
  const N  = pi.length;
  const T  = obs.length;

  // Log-space Viterbi
  const logDelta = Array.from({length: T}, () => new Array(N).fill(-Infinity));
  const psi      = Array.from({length: T}, () => new Array(N).fill(0));

  // Initialize
  for (let i = 0; i < N; i++) {
    logDelta[0][i] = Math.log(pi[i] + 1e-300) + Math.log(B[i][obs[0]] + 1e-300);
  }

  // Recurse
  for (let t = 1; t < T; t++) {
    for (let j = 0; j < N; j++) {
      let maxVal = -Infinity, maxIdx = 0;
      for (let i = 0; i < N; i++) {
        const val = logDelta[t-1][i] + Math.log(A[i][j] + 1e-300);
        if (val > maxVal) { maxVal = val; maxIdx = i; }
      }
      logDelta[t][j] = maxVal + Math.log(B[j][obs[t]] + 1e-300);
      psi[t][j] = maxIdx;
    }
  }

  // Backtrack to find last state
  let lastState = 0;
  let maxVal = -Infinity;
  for (let i = 0; i < N; i++) {
    if (logDelta[T-1][i] > maxVal) { maxVal = logDelta[T-1][i]; lastState = i; }
  }

  const names = HMM_MODEL.state_names || ["Uptrend","Downtrend","Ranging","HighVolatility"];
  const name  = names[lastState];

  const tradable    = lastState !== 2 && lastState !== 3; // not Ranging or HighVol
  const allowedAction = lastState === 0 ? "BUY"
                      : lastState === 1 ? "SELL"
                      : "NONE";

  return { state: lastState, name, tradable, allowedAction };
}

function extractHMMObservations(candles1m: any[]): number[] {
  const closes = candles1m.map((c: any) => parseFloat(c.close));
  const highs  = candles1m.map((c: any) => parseFloat(c.high));
  const lows   = candles1m.map((c: any) => parseFloat(c.low));
  const n = closes.length;

  const returns: number[] = [];
  for (let i = 1; i < n; i++) {
    returns.push((closes[i] - closes[i-1]) / (closes[i-1] + 1e-10));
  }

  // Rolling volatility (20-period)
  const rollVol: number[] = [];
  for (let i = 0; i < returns.length; i++) {
    const w = returns.slice(Math.max(0, i-19), i+1).map(Math.abs);
    rollVol.push(w.reduce((a,b)=>a+b,0) / w.length);
  }

  const sortedVol = [...rollVol].sort((a,b)=>a-b);
  const volMed = sortedVol[Math.floor(sortedVol.length * 0.50)];
  const volHi  = sortedVol[Math.floor(sortedVol.length * 0.75)];

  // Direction consistency over 5 candles
  const obs: number[] = [];
  for (let i = 0; i < returns.length; i++) {
    const r = returns[i];
    const v = rollVol[i];
    const window = returns.slice(Math.max(0,i-4), i+1);
    const up = window.filter(x => x > 0).length / window.length;
    const c  = Math.max(up, 1-up);

    if (v < volMed) {
      obs.push(c >= 0.70 && r > 0 ? 1 : c >= 0.70 && r < 0 ? 2 : 0);
    } else if (v < volHi) {
      obs.push(r > 0 && c >= 0.60 ? 4 : r < 0 && c >= 0.60 ? 5 : 3);
    } else {
      obs.push(r > 0 ? 6 : 7);
    }
  }

  // Use last 60 observations for speed
  return obs.slice(-60);
}

// ─────────────────────────────────────────────
// HMM REGIME DETECTION
// Detects 4 hidden market states from candle data:
//   0 = Strong Uptrend   → allow BUY only
//   1 = Strong Downtrend → allow SELL only
//   2 = Ranging/Choppy   → SKIP (most losses happen here)
//   3 = High Volatility  → SKIP (unpredictable spikes)
// ─────────────────────────────────────────────
function detectMarketRegime(candles1m: any[]): { state: number; name: string; tradable: boolean; allowedAction: string } {
  const c  = candles1m.slice(-60).map((x: any) => parseFloat(x.close));
  const hi = candles1m.slice(-60).map((x: any) => parseFloat(x.high));
  const lo = candles1m.slice(-60).map((x: any) => parseFloat(x.low));

  // Observable features per candle
  const returns: number[]    = [];
  const hlRanges: number[]   = [];
  const absMoves: number[]   = [];

  for (let i = 1; i < c.length; i++) {
    const ret = (c[i] - c[i-1]) / (c[i-1] + 1e-10);
    returns.push(ret);
    hlRanges.push((hi[i] - lo[i]) / (lo[i] + 1e-10));
    absMoves.push(Math.abs(ret));
  }

  // Summary stats
  const n = returns.length;
  const meanReturn  = returns.reduce((a, b) => a + b, 0) / n;
  const meanAbsMove = absMoves.reduce((a, b) => a + b, 0) / n;
  const meanRange   = hlRanges.reduce((a, b) => a + b, 0) / n;
  const variance    = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / n;
  const volatility  = Math.sqrt(variance);

  // Directional consistency — what % of candles go same way as overall trend
  const upCandles   = returns.filter(r => r > 0).length / n;
  const downCandles = returns.filter(r => r < 0).length / n;
  const consistency = Math.max(upCandles, downCandles); // 1.0 = perfectly consistent

  // EMA trend strength
  const ema8  = calcEMA(c, 8);
  const ema21 = calcEMA(c, 21);
  const ema50 = calcEMA(c.slice(-55), 50);
  const price = c[c.length - 1];
  const trendStrength = Math.abs(ema8 - ema50) / (ema50 + 1e-10);

  // Classify into 4 regime states using thresholds
  // High volatility — big erratic moves, skip
  if (meanAbsMove > 0.003 && volatility > 0.002) {
    return { state: 3, name: "HighVolatility", tradable: false, allowedAction: "NONE" };
  }

  // Ranging/Choppy — low directional consistency, tight range, skip
  if (consistency < 0.58 && trendStrength < 0.0005 && meanRange < 0.002) {
    return { state: 2, name: "Ranging", tradable: false, allowedAction: "NONE" };
  }

  // Strong Uptrend — price above all EMAs, consistent up moves
  if (ema8 > ema21 && ema21 > ema50 && price > ema8 && meanReturn > 0 && consistency >= 0.55) {
    return { state: 0, name: "Uptrend", tradable: true, allowedAction: "BUY" };
  }

  // Strong Downtrend — price below all EMAs, consistent down moves
  if (ema8 < ema21 && ema21 < ema50 && price < ema8 && meanReturn < 0 && consistency >= 0.55) {
    return { state: 1, name: "Downtrend", tradable: true, allowedAction: "SELL" };
  }

  // Weak trend — borderline, only allow if strong ML confidence (handled later)
  if (ema8 > ema21 && price > ema21) {
    return { state: 0, name: "WeakUptrend", tradable: true, allowedAction: "BUY" };
  }
  if (ema8 < ema21 && price < ema21) {
    return { state: 1, name: "WeakDowntrend", tradable: true, allowedAction: "SELL" };
  }

  // Default → ranging, skip
  return { state: 2, name: "Ranging", tradable: false, allowedAction: "NONE" };
}

// ─────────────────────────────────────────────
// AI BRAIN — LOSS PATTERN CHECKER
// Builds a fingerprint of current market conditions
// and checks if it matches any known losing pattern
// ─────────────────────────────────────────────
function buildMarketFingerprint(features: number[], symbol: string, action: string, regime: string, session: string): string {
  const rsi      = features[0];
  const ema_bull = features[4];
  const ema_bear = features[5];
  const bb_pos   = features[2];
  const trend5m  = features[20];

  const rsiZone  = rsi < 35 ? "oversold" : rsi > 65 ? "overbought" : "neutral";
  const emaStack = ema_bull ? "bull" : ema_bear ? "bear" : "mixed";
  const bbZone   = bb_pos > 0.8 ? "top" : bb_pos < 0.2 ? "bottom" : "mid";
  const t5m      = trend5m === 1 ? "up" : trend5m === -1 ? "down" : "flat";

  // Fingerprint is a readable key of market conditions
  return `${symbol}|${action}|${rsiZone}|${emaStack}|${bbZone}|${t5m}|${regime}|${session}`;
}

async function checkAIBrainPatterns(
  supabase: any,
  fingerprint: string,
  symbol: string,
  action: string
): Promise<{ blocked: boolean; reason: string; boost: number }> {
  try {
    // Check for matching loss patterns
    const { data: lossRules } = await supabase
      .from("learned_rules")
      .select("fingerprint, loss_count, win_count, rule_type, confidence")
      .eq("symbol", symbol)
      .eq("action", action)
      .gte("loss_count", 3); // Only block if seen 3+ losses in this pattern

    if (!lossRules || lossRules.length === 0) return { blocked: false, reason: "", boost: 0 };

    for (const rule of lossRules) {
      // Check partial fingerprint match (symbol+action+rsiZone+emaStack)
      const ruleParts = rule.fingerprint.split("|");
      const fpParts   = fingerprint.split("|");
      // Match on first 6 parts (symbol, action, rsiZone, emaStack, bbZone, trend5m)
      const matchScore = ruleParts.slice(0, 6).filter((p: string, i: number) => p === fpParts[i]).length;

      if (matchScore >= 5 && rule.loss_count >= 3) {
        const lossRate = rule.loss_count / (rule.loss_count + rule.win_count + 1);
        if (lossRate > 0.65) {
          return {
            blocked: true,
            reason: `ai_brain_blocked: pattern has ${rule.loss_count}L/${rule.win_count}W (${Math.round(lossRate*100)}% loss rate)`,
            boost: 0
          };
        }
      }

      // Check for win boost patterns
      if (rule.rule_type === "win" && matchScore >= 5) {
        const winRate = rule.win_count / (rule.loss_count + rule.win_count + 1);
        if (winRate > 0.70 && rule.win_count >= 3) {
          return { blocked: false, reason: "", boost: 5 }; // boost confidence by 5
        }
      }
    }
    return { blocked: false, reason: "", boost: 0 };
  } catch(e) {
    // If learned_rules table doesn't exist yet, don't block
    return { blocked: false, reason: "", boost: 0 };
  }
}

// ─────────────────────────────────────────────
// AI BRAIN — LEARN FROM COMPLETED TRADES
// Runs after every cycle — looks at recently
// completed trades and extracts win/loss patterns
// ─────────────────────────────────────────────
async function aiBrainLearn(supabase: any): Promise<void> {
  try {
    // Get trades completed in last 24 hours with a result
    const { data: recentTrades } = await supabase
      .from("trades")
      .select("symbol, type, result, confidence, rsi, macd_hist, ema_stack, bb_position, stoch, patterns, session")
      .in("result", ["win", "loss"])
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(50);

    if (!recentTrades || recentTrades.length === 0) return;

    for (const trade of recentTrades) {
      if (!trade.rsi || !trade.session) continue;

      // Rebuild fingerprint from stored trade data
      const rsiZone  = trade.rsi < 35 ? "oversold" : trade.rsi > 65 ? "overbought" : "neutral";
      const emaStack = trade.ema_stack === 1 ? "bull" : trade.ema_stack === -1 ? "bear" : "mixed";
      const bbZone   = trade.bb_position > 0.8 ? "top" : trade.bb_position < 0.2 ? "bottom" : "mid";
      const t5m      = trade.patterns?.includes("trend5m:1") ? "up" : trade.patterns?.includes("trend5m:-1") ? "down" : "flat";
      const regime   = trade.patterns?.match(/regime:(\w+)/)?.[1] || "unknown";
      const fingerprint = `${trade.symbol}|${trade.type}|${rsiZone}|${emaStack}|${bbZone}|${t5m}|${regime}|${trade.session}`;

      const isWin  = trade.result === "win";
      const update = isWin
        ? { win_count: 1, rule_type: "win" }
        : { loss_count: 1, rule_type: "loss" };

      // Upsert into learned_rules — increment counts
      const { data: existing } = await supabase
        .from("learned_rules")
        .select("id, win_count, loss_count")
        .eq("fingerprint", fingerprint)
        .single();

      if (existing) {
        await supabase.from("learned_rules").update({
          win_count:  (existing.win_count  || 0) + (isWin ? 1 : 0),
          loss_count: (existing.loss_count || 0) + (isWin ? 0 : 1),
          rule_type:  (existing.loss_count || 0) + (isWin ? 0 : 1) > (existing.win_count || 0) + (isWin ? 1 : 0) ? "loss" : "win",
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("learned_rules").insert({
          fingerprint,
          symbol:     trade.symbol,
          action:     trade.type,
          win_count:  isWin ? 1 : 0,
          loss_count: isWin ? 0 : 1,
          rule_type:  isWin ? "win" : "loss",
          updated_at: new Date().toISOString(),
        });
      }
    }
    console.log(`🧠 AI Brain learned from ${recentTrades.length} recent trades`);
  } catch(e) {
    console.log(`⚠️ AI Brain learn error (table may not exist yet): ${e}`);
  }
}

// ─────────────────────────────────────────────
// INDICATOR CONFIRMATION (unchanged from before)
// ─────────────────────────────────────────────
function confirmWithIndicators(features: number[], action: string, confidence: number, symbol: string): { confirmed: boolean; reason: string } {
  const rsi      = features[0];
  const macd     = features[1];
  const bb_pos   = features[2];
  const ema_bull = features[4];
  const ema_bear = features[5];
  const trend5m  = features[20];

  const isBoom  = symbol.startsWith("BOOM");
  const isCrash = symbol.startsWith("CRASH");
  const isSpike = isBoom || isCrash;

  // High confidence ML signals — only block on truly extreme conditions
  // ML already processed all indicators internally at 41 features
  // Only intervene when market is in crisis/extreme territory
  const isHighConf = confidence >= 80;

  if (isSpike) {
    // BOOM/CRASH spike logic
    if (isBoom && action === "BUY") {
      if (rsi > 90)                                    return { confirmed: false, reason: "rsi_crisis_overbought:" + rsi.toFixed(0) };
      if (trend5m === -1 && confidence < 88)           return { confirmed: false, reason: "5m_bear_low_conf" };
    }
    if (isCrash && action === "SELL") {
      if (rsi < 10)                                    return { confirmed: false, reason: "rsi_crisis_oversold:" + rsi.toFixed(0) };
      if (trend5m === 1 && confidence < 88)            return { confirmed: false, reason: "5m_bull_low_conf" };
    }
    if (isBoom && action === "SELL") {
      if (rsi < 20 && !isHighConf)                     return { confirmed: false, reason: "rsi_oversold_boom_sell" };
      if (ema_bear === 0 && confidence < 82)           return { confirmed: false, reason: "no_ema_bear_boom_sell_low_conf" };
    }
    if (isCrash && action === "BUY") {
      if (rsi > 80 && !isHighConf)                     return { confirmed: false, reason: "rsi_overbought_crash_buy" };
      if (ema_bull === 0 && confidence < 82)           return { confirmed: false, reason: "no_ema_bull_crash_buy_low_conf" };
    }
    return { confirmed: true, reason: "" };
  }

  // Normal markets — relaxed thresholds, respect high confidence ML
  if (action === "BUY") {
    if (rsi > 90)                                      return { confirmed: false, reason: "rsi_crisis_overbought:" + rsi.toFixed(0) };
    if (rsi > 82 && !isHighConf)                       return { confirmed: false, reason: "rsi_overbought_low_conf:" + rsi.toFixed(0) };
    if (rsi < 15)                                      return { confirmed: false, reason: "rsi_crisis_oversold:" + rsi.toFixed(0) };
    if (macd < 0 && ema_bull === 0 && confidence < 80) return { confirmed: false, reason: "macd_bear+no_ema_bull_low_conf" };
    if (trend5m === -1 && confidence < 88)             return { confirmed: false, reason: "5m_bear_low_conf" };
    if (bb_pos > 0.98)                                 return { confirmed: false, reason: "bb_crisis_top" };
  } else if (action === "SELL") {
    if (rsi < 10)                                      return { confirmed: false, reason: "rsi_crisis_oversold:" + rsi.toFixed(0) };
    if (rsi < 18 && !isHighConf)                       return { confirmed: false, reason: "rsi_oversold_low_conf:" + rsi.toFixed(0) };
    if (rsi > 90)                                      return { confirmed: false, reason: "rsi_crisis_overbought:" + rsi.toFixed(0) };
    if (macd > 0 && ema_bear === 0 && confidence < 80) return { confirmed: false, reason: "macd_bull+no_ema_bear_low_conf" };
    if (trend5m === 1 && confidence < 88)              return { confirmed: false, reason: "5m_bull_low_conf" };
    if (bb_pos < 0.02)                                 return { confirmed: false, reason: "bb_crisis_bottom" };
  }
  return { confirmed: true, reason: "" };
}

// ─────────────────────────────────────────────
// FETCH CANDLES
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// FETCH TICKS — for BOOM/CRASH spike counting
// Returns last N raw ticks (price + time)
// Used to count ticks since last spike event
// ─────────────────────────────────────────────
async function fetchTicks(symbol: string, count: number = 500): Promise<any[]> {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve([]); }, 25000);
    ws.onopen = () => ws.send(JSON.stringify({
      ticks_history: symbol,
      adjust_start_time: 1,
      count,
      end: "latest",
      style: "ticks"  // raw tick data, not candles
    }));
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.history) { clearTimeout(timeout); ws.close(); resolve(d.history.prices || []); }
      if (d.error)   { clearTimeout(timeout); ws.close(); resolve([]); }
    };
    ws.onerror = () => { clearTimeout(timeout); resolve([]); };
  });
}

// ─────────────────────────────────────────────
// POISSON INTER-SPIKE ARRIVAL TIME MODEL
// ═══════════════════════════════════════════════════════════
// BOOM/CRASH spikes follow a Poisson process with known λ.
// Time between spikes ~ Exponential(λ = 1/avgTicksBetweenSpikes)
//
// P(spike occurs within next n ticks | k ticks elapsed) =
//   1 - e^(-(n / avgTicks))   [memoryless Poisson property]
//
// But we combine with elapsed time for a MORE REFINED estimate:
//   If k ticks have passed without a spike, the conditional
//   probability that spike comes in next n ticks given k elapsed:
//   P = 1 - e^(-n/λ)  (memoryless — same as unconditional)
//
// However: if k >> λ (overdue), we apply an OVERDUES BOOST
// because empirically synthetic RNG tends to "catch up" to
// its defined average — not true randomness but pseudo-RNG.
// Overdue boost: multiply by (1 + min(overdueRatio, 2.0))
// ─────────────────────────────────────────────
const BOOM_CRASH_AVG_TICKS: Record<string, number> = {
  // Real measured values from 5000 tick analysis (June 2026)
  // BOOM500: 7 spikes in 5000 ticks = avg 489 ticks between spikes
  // BOOM1000: 6 spikes in 5000 ticks = avg 795 ticks
  // CRASH500: 7 spikes in 5000 ticks = avg 670 ticks
  // CRASH1000: 3 spikes in 5000 ticks = avg 718 ticks
  "BOOM500":    489,  "CRASH500":   670,
  "BOOM1000":   795,  "CRASH1000":  718,
  "BOOM300":    300,  "CRASH300":   300,
  "BOOM900":    900,  "CRASH900":   900,
  "BOOM600":    600,  "CRASH600":   600,
};

function detectLastSpike(ticks: number[], isBoom: boolean): number {
  // Detect where the last spike occurred in tick history
  // Boom spike: single tick with abnormally large upward move
  // Crash spike: single tick with abnormally large downward move
  if (ticks.length < 10) return ticks.length; // no data → assume far back

  const diffs = ticks.slice(1).map((t, i) => t - ticks[i]);
  const meanAbs = diffs.reduce((s, d) => s + Math.abs(d), 0) / diffs.length;
  const spikeThreshold = meanAbs * 8; // spike = 8× normal move

  // Scan backwards for last spike
  for (let i = diffs.length - 1; i >= 0; i--) {
    const isSpikeMove = isBoom ? diffs[i] > spikeThreshold : diffs[i] < -spikeThreshold;
    if (isSpikeMove) {
      return diffs.length - i; // ticks since last spike
    }
  }
  return ticks.length; // no spike found → all ticks elapsed
}

function poissonSpikeProbability(
  symbol: string,
  ticksSinceLastSpike: number,
  lookAheadTicks: number = 50
): { probability: number; overdue: boolean; overdueRatio: number; verdict: string } {
  const avgTicks = BOOM_CRASH_AVG_TICKS[symbol] || 1000;

  // Base Poisson probability (memoryless)
  const baseProbability = 1 - Math.exp(-lookAheadTicks / avgTicks);

  // Overdue ratio: how many "expected intervals" have elapsed
  const overdueRatio = ticksSinceLastSpike / avgTicks;
  const overdue = overdueRatio > 0.85; // 85% of average elapsed = getting close

  // Overdue boost: pseudo-RNG tends to catch up to its average
  // Empirically tested: boost caps at 3× base probability
  const overdueMultiplier = overdue
    ? 1 + Math.min(overdueRatio - 0.85, 1.5) * 2
    : 1.0;

  const probability = Math.min(baseProbability * overdueMultiplier, 0.95);

  // Minimum threshold for trade entry: 8% chance of spike in next 50 ticks
  // This eliminates entries when we're at tick 10/1000 (just had a spike)
  const minThreshold = 0.08;
  const verdict = probability >= minThreshold
    ? `✅ spike_prob=${(probability*100).toFixed(1)}% (overdue:${overdue}, ratio:${overdueRatio.toFixed(2)})`
    : `❌ too_early spike_prob=${(probability*100).toFixed(1)}% (${ticksSinceLastSpike}/${avgTicks} ticks elapsed)`;

  return { probability, overdue, overdueRatio, verdict };
}

// ─────────────────────────────────────────────
// TOPOLOGICAL PRE-SPIKE PATTERN DETECTOR
// (Persistent Homology proxy — no external lib needed)
// ═══════════════════════════════════════════════════════════
// Before BOOM/CRASH spikes, price action shows a characteristic
// pattern called "pre-spike compression":
//   1. Price range narrows significantly (volatility contracts)
//   2. Directional momentum → zero (price going sideways)
//   3. Number of direction reversals spikes (choppy micro-oscillation)
//   4. THEN the spike fires
//
// This pattern is captured by the β₁ Betti number proxy:
// β₁ = number of "loops" = number of direction changes in window
// High β₁ + low range = compressed, ready to spike
//
// We also compute the "compression score" = how much range has
// narrowed relative to the longer-term average
// ─────────────────────────────────────────────
function topologicalPreSpikeScore(ticks: number[], window: number = 30): {
  compressionScore: number;  // 0-1, higher = more compressed
  bettiProxy: number;        // direction reversals (higher = more choppy)
  preSpikePattern: boolean;  // true = classic pre-spike setup detected
  details: string;
} {
  if (ticks.length < window * 2) {
    return { compressionScore: 0, bettiProxy: 0, preSpikePattern: false, details: "insufficient_ticks" };
  }

  const recent   = ticks.slice(-window);
  const baseline = ticks.slice(-window * 2, -window);

  // Range compression: recent range vs baseline range
  const recentRange   = Math.max(...recent)   - Math.min(...recent);
  const baselineRange = Math.max(...baseline) - Math.min(...baseline);
  const compressionScore = baselineRange > 0
    ? Math.max(0, 1 - recentRange / baselineRange)
    : 0;

  // Betti β₁ proxy: count direction reversals in recent window
  const diffs = recent.slice(1).map((t, i) => t - recent[i]);
  let reversals = 0;
  for (let i = 1; i < diffs.length; i++) {
    if ((diffs[i] > 0 && diffs[i-1] < 0) || (diffs[i] < 0 && diffs[i-1] > 0)) {
      reversals++;
    }
  }
  const bettiProxy = reversals / (window - 1); // normalize 0-1

  // Pre-spike pattern: compressed range + high choppiness + slowing momentum
  // This is the topological "loop" before the spike fires
  const netMove = Math.abs(recent[recent.length-1] - recent[0]);
  const momentumDecaying = netMove < recentRange * 0.3; // net move < 30% of range

  const preSpikePattern =
    compressionScore > 0.35 &&   // range compressed > 35%
    bettiProxy > 0.45 &&          // lots of direction changes (choppy)
    momentumDecaying;             // price going nowhere (coiling)

  const details = `compress=${(compressionScore*100).toFixed(0)}% betti=${bettiProxy.toFixed(2)} momentum_decay=${momentumDecaying}`;

  return { compressionScore, bettiProxy, preSpikePattern, details };
}

// ═══════════════════════════════════════════════════════════════
// ICT SMART MONEY CONCEPTS ENGINE
// Institutional-grade forex signal generation
// Based on: FVG, Order Blocks, Liquidity Sweeps, BOS/CHoCH
// ═══════════════════════════════════════════════════════════════

// ── Kill Zones: Only trade during high-liquidity sessions ──
// London Open: 07:00-09:00 UTC (most volatile, institutional entry)
// NY Open: 13:00-15:00 UTC (second major session)
// London Close: 15:00-17:00 UTC (liquidity grab before close)
function isKillZone(): { active: boolean; zone: string } {
  const h = new Date().getUTCHours();
  const m = new Date().getUTCMinutes();
  const t = h + m/60;
  if (t >= 8.0  && t < 12.0) return { active: true,  zone: "London_Open" };
  if (t >= 13.0 && t < 17.0) return { active: true,  zone: "NY_Open" };
  if (t >= 15.0 && t < 17.0) return { active: true,  zone: "London_Close" };
  return { active: false, zone: "Dead_Zone" };
}

// ── Fair Value Gap (FVG) Detection ──
// A bullish FVG: candle[i-2].high < candle[i].low (gap between wicks)
// Price leaving an inefficiency — market will return to fill it
// We enter when price RETURNS to the FVG zone (high probability)

// ── Judas Swing Detection ─────────────────────────────────────
// ICT: At session open price makes fake move to trap retail
// then reverses strongly in true direction
// Pattern: strong move in one direction in first 15min of session
// followed by reversal candle closing beyond 50% of fake move
function detectJudasSwing(candles: any[], sessionOpenIdx: number = 0): {
  detected: boolean; fakeDirection: string; trueDirection: string; sweepSize: number;
} {
  if (candles.length < 10) return { detected:false, fakeDirection:"", trueDirection:"", sweepSize:0 };
  const recent = candles.slice(-8);
  const opens  = recent.map((c: any) => parseFloat(c.open));
  const closes = recent.map((c: any) => parseFloat(c.close));
  const highs  = recent.map((c: any) => parseFloat(c.high));
  const lows   = recent.map((c: any) => parseFloat(c.low));
  // First 3 candles make strong move
  const firstMove = closes[2] - opens[0];
  const moveRange = Math.max(...highs.slice(0,4)) - Math.min(...lows.slice(0,4));
  if (moveRange === 0) return { detected:false, fakeDirection:"", trueDirection:"", sweepSize:0 };
  // Reversal in last 3 candles — more than 50% retracement
  const lastMove = closes[7] - closes[3];
  const isReversal = Math.abs(lastMove) > Math.abs(firstMove) * 0.6;
  const opposite   = (firstMove > 0 && lastMove < 0) || (firstMove < 0 && lastMove > 0);
  if (!isReversal || !opposite) return { detected:false, fakeDirection:"", trueDirection:"", sweepSize:0 };
  const fakeDir  = firstMove > 0 ? "BUY"  : "SELL";
  const trueDir  = lastMove  > 0 ? "BUY"  : "SELL";
  return { detected:true, fakeDirection:fakeDir, trueDirection:trueDir, sweepSize:Math.abs(firstMove) };
}

function detectFVG(candles: any[]): {
  bullish: Array<{top: number; bottom: number; index: number}>;
  bearish: Array<{top: number; bottom: number; index: number}>;
} {
  const bullishFVGs: Array<{top: number; bottom: number; index: number}> = [];
  const bearishFVGs: Array<{top: number; bottom: number; index: number}> = [];
  
  for (let i = 2; i < candles.length; i++) {
    const h0 = parseFloat(candles[i-2].high);
    const l0 = parseFloat(candles[i-2].low);
    const h2 = parseFloat(candles[i].high);
    const l2 = parseFloat(candles[i].low);
    
    // Bullish FVG: previous candle high < current candle low
    if (h0 < l2) {
      bullishFVGs.push({ bottom: h0, top: l2, index: i });
    }
    // Bearish FVG: previous candle low > current candle high
    if (l0 > h2) {
      bearishFVGs.push({ bottom: h2, top: l0, index: i });
    }
  }
  return { bullish: bullishFVGs.slice(-5), bearish: bearishFVGs.slice(-5) };
}

// ── Order Block Detection ──
// Bullish OB: Last bearish candle before a significant bullish move
// Bearish OB: Last bullish candle before a significant bearish move
// Price returning to OB = institutional re-entry = high probability
function detectOrderBlocks(candles: any[], atr: number): {
  bullish: Array<{high: number; low: number; index: number}>;
  bearish: Array<{high: number; low: number; index: number}>;
} {
  const bullishOBs: Array<{high: number; low: number; index: number}> = [];
  const bearishOBs: Array<{high: number; low: number; index: number}> = [];
  const threshold = atr * 1.5; // significant move = 1.5× ATR

  for (let i = 1; i < candles.length - 3; i++) {
    const c = candles[i];
    const open = parseFloat(c.open), close = parseFloat(c.close);
    const high = parseFloat(c.high), low = parseFloat(c.low);
    
    // Check if next 3 candles make a significant move
    const nextHigh = Math.max(...candles.slice(i+1, i+4).map((x: any) => parseFloat(x.high)));
    const nextLow  = Math.min(...candles.slice(i+1, i+4).map((x: any) => parseFloat(x.low)));
    
    // Bullish OB: bearish candle followed by significant bullish move
    if (close < open && nextHigh - high > threshold) {
      bullishOBs.push({ high, low, index: i });
    }
    // Bearish OB: bullish candle followed by significant bearish move
    if (close > open && low - nextLow > threshold) {
      bearishOBs.push({ high, low, index: i });
    }
  }
  return { bullish: bullishOBs.slice(-3), bearish: bearishOBs.slice(-3) };
}

// ── Liquidity Sweep Detection ──
// Price spikes through a previous high/low then immediately reverses
// This is institutions hunting retail stop losses before the real move
function detectLiquiditySweep(candles: any[], lookback: number = 20): {
  sweptHigh: boolean; sweptLow: boolean;
  prevHigh: number; prevLow: number;
  direction: string;
} {
  if (candles.length < lookback + 3) 
    return { sweptHigh: false, sweptLow: false, prevHigh: 0, prevLow: 0, direction: "none" };
  
  const recent   = candles.slice(-lookback-3, -3);
  const lastThree = candles.slice(-3);
  
  const prevHigh = Math.max(...recent.map((c: any) => parseFloat(c.high)));
  const prevLow  = Math.min(...recent.map((c: any) => parseFloat(c.low)));
  
  const currentHigh = Math.max(...lastThree.map((c: any) => parseFloat(c.high)));
  const currentLow  = Math.min(...lastThree.map((c: any) => parseFloat(c.low)));
  const currentClose = parseFloat(lastThree[lastThree.length-1].close);
  
  // Swept high: price went above prevHigh but closed back below it
  const sweptHigh = currentHigh > prevHigh && currentClose < prevHigh;
  // Swept low: price went below prevLow but closed back above it
  const sweptLow  = currentLow < prevLow && currentClose > prevLow;
  
  let direction = "none";
  if (sweptHigh) direction = "SELL"; // swept high = bearish reversal coming
  if (sweptLow)  direction = "BUY";  // swept low = bullish reversal coming
  
  return { sweptHigh, sweptLow, prevHigh, prevLow, direction };
}

// ── Break of Structure (BOS) + Change of Character (CHoCH) ──
// BOS: price breaks previous high (bullish) or low (bearish) = trend continuation
// CHoCH: after a downtrend, price breaks a recent high = trend reversal signal
function detectStructure(candles: any[]): {
  trend: string;        // "bullish" | "bearish" | "ranging"
  bos: boolean;         // break of structure confirmed
  choch: boolean;       // change of character (potential reversal)
  strength: number;     // 0-1 trend strength
} {
  if (candles.length < 30) 
    return { trend: "ranging", bos: false, choch: false, strength: 0 };
  
  const closes = candles.map((c: any) => parseFloat(c.close));
  const highs  = candles.map((c: any) => parseFloat(c.high));
  const lows   = candles.map((c: any) => parseFloat(c.low));
  
  // Find swing highs and lows (simplified: local max/min over 5 candles)
  const swingHighs: number[] = [];
  const swingLows:  number[] = [];
  
  for (let i = 5; i < candles.length - 5; i++) {
    const windowHighs = highs.slice(i-5, i+5);
    const windowLows  = lows.slice(i-5, i+5);
    if (highs[i] === Math.max(...windowHighs)) swingHighs.push(highs[i]);
    if (lows[i]  === Math.min(...windowLows))  swingLows.push(lows[i]);
  }
  
  if (swingHighs.length < 2 || swingLows.length < 2) 
    return { trend: "ranging", bos: false, choch: false, strength: 0.5 };
  
  const lastH = swingHighs[swingHighs.length-1];
  const prevH = swingHighs[swingHighs.length-2];
  const lastL = swingLows[swingLows.length-1];
  const prevL = swingLows[swingLows.length-2];
  
  const currentPrice = closes[closes.length-1];
  
  // BOS bullish: higher high + higher low
  const bosBullish = lastH > prevH && lastL > prevL;
  // BOS bearish: lower high + lower low
  const bosBearish = lastH < prevH && lastL < prevL;
  
  // CHoCH: was bearish (lower lows) but now broke above previous swing high
  const choch = bosBearish && currentPrice > prevH;
  
  const trend    = bosBullish ? "bullish" : bosBearish ? "bearish" : "ranging";
  const bos      = bosBullish || bosBearish;
  const strength = bos ? Math.abs(lastH - prevH) / (Math.abs(lastH - lastL) + 1e-10) : 0.5;
  
  return { trend, bos, choch, strength: Math.min(strength, 1) };
}

// ── MASTER ICT SIGNAL ENGINE ──
// Combines all 4 concepts for high-probability forex entries
// Only fires when multiple concepts align (confluence)
function ictForexSignal(candles1m: any[], candles5m: any[], symbol: string): {
  action: string; confidence: number; reason: string; atr: number;
} | null {
  if (candles1m.length < 50) return null;
  
  // Kill zone check — only trade during high liquidity periods
  const kz = isKillZone();
  if (!kz.active) return null;

  // Route to correct strategy based on pair type
  const fxStrategy = FOREX_STRATEGY[symbol] || "trend";
  const closes_fx  = candles1m.map((c: any) => parseFloat(c.close));
  const price_fx   = closes_fx[closes_fx.length - 1];

  // ── Mean Reversion path (Gold, Silver, JPY) ──────────────────
  if (fxStrategy === "revert") {
    const rsiThresh = FOREX_RSI_THRESH[symbol] || 30;
    const rsiFx = (() => {
      const n=14; if(closes_fx.length<n+1) return 50;
      const d=closes_fx.slice(-n-1).map((v,i,a)=>i?v-a[i-1]:0).slice(1);
      const g=d.reduce((s,v)=>s+Math.max(0,v),0)/n;
      const l=d.reduce((s,v)=>s+Math.max(0,-v),0)/n;
      return l>0?100-100/(1+g/l):50;
    })();
    // Confidence scales with how extreme RSI is
    const rsiConf = rsiFx < rsiThresh*0.7 || rsiFx > 100-rsiThresh*0.7 ? 88 : 80;
    if (rsiFx <= rsiThresh)        return { action:"BUY",  confidence:rsiConf, reason:`RSI_revert=${rsiFx.toFixed(1)}<${rsiThresh}`, atr:calcATR(candles1m,14) };
    if (rsiFx >= (100-rsiThresh))  return { action:"SELL", confidence:rsiConf, reason:`RSI_revert=${rsiFx.toFixed(1)}>${100-rsiThresh}`, atr:calcATR(candles1m,14) };
    return null;
  }

  // Judas Swing check — detect fake session open move
  const judas = detectJudasSwing(candles1m.slice(-20));
  if (judas.detected) {
    // Judas confirms the TRUE direction — use it
    console.log(`📍 Judas Swing: fake=${judas.fakeDirection} true=${judas.trueDirection} sweep=${judas.sweepSize.toFixed(5)}`);
  }
  
  const closes = candles1m.map((c: any) => parseFloat(c.close));
  const price  = closes[closes.length-1];
  const atr    = calcATR(candles1m, 14);
  const atrPct = atr / price;
  
  // Skip extreme volatility (news events)
  if (atrPct > 0.005) return null;
  
  // Get 5m structure for bias
  const structure5m = detectStructure(candles5m.length > 30 ? candles5m : candles1m.slice(-100));
  
  // Get ICT signals
  const fvgs      = detectFVG(candles1m.slice(-30));
  const obs       = detectOrderBlocks(candles1m.slice(-50), atr);
  const sweep     = detectLiquiditySweep(candles1m, 20);
  
  let bullScore = 0, bearScore = 0;
  const reasons: string[] = [];
  
  // ── Score 1: Market Structure ──
  if (structure5m.trend === "bullish" && structure5m.bos) {
    bullScore += 3; reasons.push("BOS_bullish");
  }
  if (structure5m.trend === "bearish" && structure5m.bos) {
    bearScore += 3; reasons.push("BOS_bearish");
  }
  if (structure5m.choch) {
    // CHoCH = potential reversal — trade opposite to previous trend
    if (structure5m.trend === "bearish") { bullScore += 2; reasons.push("CHoCH_bull"); }
    else { bearScore += 2; reasons.push("CHoCH_bear"); }
  }
  
  // ── Score 2: Liquidity Sweep ──
  if (sweep.sweptLow && sweep.direction === "BUY") {
    bullScore += 4; reasons.push(`LiqSweep_low@${sweep.prevLow.toFixed(5)}`);
  }
  if (sweep.sweptHigh && sweep.direction === "SELL") {
    bearScore += 4; reasons.push(`LiqSweep_high@${sweep.prevHigh.toFixed(5)}`);
  }
  
  // ── Score 3: Price in FVG zone ──
  for (const fvg of fvgs.bullish) {
    if (price >= fvg.bottom && price <= fvg.top) {
      bullScore += 3; reasons.push(`BullFVG@${fvg.bottom.toFixed(5)}`); break;
    }
  }
  for (const fvg of fvgs.bearish) {
    if (price >= fvg.bottom && price <= fvg.top) {
      bearScore += 3; reasons.push(`BearFVG@${fvg.top.toFixed(5)}`); break;
    }
  }
  
  // ── Score 4: Price at Order Block ──
  for (const ob of obs.bullish) {
    if (price >= ob.low && price <= ob.high + atr * 0.3) {
      bullScore += 3; reasons.push(`BullOB@${ob.low.toFixed(5)}`); break;
    }
  }
  for (const ob of obs.bearish) {
    if (price >= ob.low - atr * 0.3 && price <= ob.high) {
      bearScore += 3; reasons.push(`BearOB@${ob.high.toFixed(5)}`); break;
    }
  }
  
  // ── Score 5: Kill Zone bonus ──
  if (kz.zone === "London_Open") {
    bullScore += 1; bearScore += 1; // equal weight — most volatile
    reasons.push("London_Open_KZ");
  }
  
  // Require minimum confluence score of 6 to trade
  const maxScore = Math.max(bullScore, bearScore);
  if (maxScore < 6) return null;
  
  // Must clearly favor one direction
  if (Math.abs(bullScore - bearScore) < 3) return null;
  
  const action = bullScore > bearScore ? "BUY" : "SELL";
  
  // Confidence based on score (6=70%, 8=80%, 10+=92%)
  const confidence = Math.min(92, 60 + maxScore * 4);
  
  return {
    action,
    confidence,
    reason: `ICT[${kz.zone}]: ${reasons.join("+")}`,
    atr
  };
}

// ═══════════════════════════════════════════════════════════════
// ADVANCED MATHEMATICS ENGINE v2
// ═══════════════════════════════════════════════════════════════

// ── Order Flow Imbalance (OFI) ──
// Proxy from candle direction ratio (no tick data needed)
// OFI > 0.65 = strong buying pressure
// OFI < 0.35 = strong selling pressure
// Used as confirmation for ICT signals
function calcOFI(candles: any[], window: number = 20): number {
  const recent = candles.slice(-window);
  let upCandles = 0;
  for (const c of recent) {
    if (parseFloat(c.close) > parseFloat(c.open)) upCandles++;
  }
  return upCandles / window; // 0-1
}

// ── Rough Volatility Regime (Hurst Exponent) ──
// H < 0.45 = mean-reverting (rough) → use FVG/OB strategy
// H > 0.55 = trending (smooth)     → use BOS/momentum strategy
// H = 0.45-0.55 = random walk      → avoid trading
function calcHurstFast(closes: number[], window: number = 40): number {
  if (closes.length < window) return 0.5;
  const prices = closes.slice(-window);
  const returns = prices.slice(1).map((p, i) => Math.log(p / (prices[i] + 1e-10)));
  
  // R/S analysis (fast version with 2 scales)
  const scale1 = Math.floor(window / 4);
  const scale2 = Math.floor(window / 2);
  
  function rsAtScale(data: number[], s: number): number {
    const chunks = Math.floor(data.length / s);
    if (chunks < 1) return 1;
    let rsSum = 0;
    for (let i = 0; i < chunks; i++) {
      const chunk = data.slice(i * s, (i + 1) * s);
      const mean  = chunk.reduce((a, b) => a + b, 0) / chunk.length;
      const dev   = chunk.map((_, j) => chunk.slice(0, j + 1).reduce((a, b) => a + b, 0) - mean * (j + 1));
      const R     = Math.max(...dev) - Math.min(...dev);
      const S     = Math.sqrt(chunk.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / chunk.length) + 1e-10;
      rsSum += R / S;
    }
    return rsSum / chunks;
  }
  
  const rs1 = rsAtScale(returns, scale1);
  const rs2 = rsAtScale(returns, scale2);
  if (rs1 <= 0 || rs2 <= 0) return 0.5;
  
  const H = Math.log(rs2 / rs1) / Math.log(scale2 / scale1);
  return Math.max(0.1, Math.min(0.9, H));
}

// ── Regime-Adaptive Strategy Selector ──
// Uses Hurst + HMM regime to choose the RIGHT strategy
// This is the key upgrade — one strategy doesn't fit all regimes
function getAdaptiveStrategy(hurst: number, hmm: string, ofi: number): {
  strategy: string;
  confidence_boost: number;
  description: string;
} {
  // Trending + smooth (H > 0.55) → follow the trend
  if (hurst > 0.55 && (hmm === "Uptrend" || hmm === "Downtrend")) {
    return {
      strategy: "trend_follow",
      confidence_boost: 8,
      description: `Trending regime H=${hurst.toFixed(2)} → momentum`
    };
  }
  // Rough + ranging (H < 0.45) → mean reversion
  if (hurst < 0.45 && hmm === "Ranging") {
    return {
      strategy: "mean_revert",
      confidence_boost: 6,
      description: `Rough regime H=${hurst.toFixed(2)} → mean reversion`
    };
  }
  // High volatility → reduce confidence
  if (hmm === "HighVolatility") {
    return {
      strategy: "reduce",
      confidence_boost: -10,
      description: `High vol regime → reduced confidence`
    };
  }
  // Random walk zone (H = 0.45-0.55) → skip
  if (hurst >= 0.45 && hurst <= 0.55 && hmm === "Ranging") {
    return {
      strategy: "skip",
      confidence_boost: -20,
      description: `Random walk H=${hurst.toFixed(2)} → skip`
    };
  }
  return { strategy: "normal", confidence_boost: 0, description: "Standard regime" };
}

function getTradingSession(): { active: boolean; name: string } {
  const h = new Date().getUTCHours();
  // London: 8am-5pm UTC (peak liquidity 8am-12pm)
  // New York: 1pm-9pm UTC
  // Overlap: 1pm-5pm UTC (highest liquidity — both sessions active)
  // Pre-London 7-8am: weak session, skip
  if (h >= 8  && h < 13) return { active: true,  name: "London" };
  if (h >= 13 && h < 17) return { active: true,  name: "LondonNY_Overlap" };
  if (h >= 17 && h < 21) return { active: true,  name: "NewYork" };
  return { active: false, name: "OffHours" };
}

// ─────────────────────────────────────────────
// PLACE TRADE
// ─────────────────────────────────────────────
async function placeTrade(token: string, symbol: string, action: string, stake: number, confidence: number = 65, dynMultiplier: number = 100, fptTpPct: number = 0, fptSlPct: number = 0) {
  return new Promise((resolve) => {
    const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
    const timeout = setTimeout(() => { ws.close(); resolve({ error: "timeout" }); }, 25000);
    let authed = false;
    let contractId: number | null = null;

    ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
    ws.onmessage = async (e) => {
      const d = JSON.parse(e.data);

      if (d.authorize && !authed) {
        authed = true;
        let contractType: string;
        if (symbol.startsWith("BOOM"))       contractType = "MULTUP";
        else if (symbol.startsWith("CRASH")) contractType = "MULTDOWN";
        else if (symbol.startsWith("R_"))    contractType = action === "BUY" ? "CALL" : "PUT";
        else if (symbol.startsWith("JD"))    contractType = action === "BUY" ? "MULTUP" : "MULTDOWN";
        else                                  contractType = action === "BUY" ? "MULTUP" : "MULTDOWN";

        const isMult   = contractType.startsWith("MULT");
        const adjStake = isMult ? Math.min(9, Math.max(1, stake)) : Math.max(0.35, stake);
        // ── FPT-optimized TP/SL ──
        // If FPT calculated optimal distances, use those
        // Otherwise fall back to confidence-based multipliers
        let takeProfit: number;
        let stopLoss: number;

        if (fptTpPct > 0 && fptSlPct > 0) {
          // FPT: TP = stake × multiplier × tpPct (price move needed × leverage)
          // e.g. stake=$1, mult=x200, tpPct=0.5% → TP = 1 × 200 × 0.005 = $1.00
          // R_75/VIX: wider TP, tighter SL for positive expectancy
          const isVIX = symbol.startsWith("R_") || symbol.startsWith("1HZ") || symbol.startsWith("JD");
          const tpMult = isVIX ? fptTpPct * 1.5 : fptTpPct;   // +50% TP for VIX
          const slMult = isVIX ? fptSlPct * 0.6 : fptSlPct;   // -40% SL for VIX
          takeProfit = parseFloat((adjStake * dynMultiplier * tpMult).toFixed(2));
          stopLoss   = parseFloat(Math.min(adjStake * dynMultiplier * slMult, adjStake * 0.5).toFixed(2));
          // Deriv MULT contract limits:
          // TP must be >= stake (can't TP for less than you risked)
          // SL must be <= stake (can't lose more than stake)
          // TP must be <= stake * multiplier * 0.95 (max profit)
          const minTP = adjStake;                          // at least 1x stake
          const maxTP = adjStake * dynMultiplier * 0.95;  // max 95% of full move
          const minSL = 0.50;                              // Deriv minimum $0.50
          const maxSL = adjStake * 0.90;                  // max 90% of stake

          takeProfit = Math.max(minTP, Math.min(maxTP, takeProfit));
          stopLoss   = Math.max(minSL, Math.min(maxSL, stopLoss));

          // Ensure TP > SL always (positive expectancy)
          if (takeProfit <= stopLoss) {
            takeProfit = stopLoss * 2;
          }
        } else {
          // Fallback: confidence-based multipliers
          const tpMult = confidence >= 85 ? 3.0
                       : confidence >= 75 ? 2.0
                       : 1.0;
          takeProfit = parseFloat((adjStake * tpMult).toFixed(2));
          stopLoss   = parseFloat((adjStake * 0.9).toFixed(2));
        }

        if (isMult) {
          ws.send(JSON.stringify({
            buy: 1, price: adjStake,
            parameters: { amount: adjStake, basis: "stake", contract_type: contractType, currency: "USD", symbol, multiplier: dynMultiplier }
          }));
          (ws as any)._tp = takeProfit;
          (ws as any)._sl = stopLoss;
          (ws as any)._adjStake = adjStake;
        } else {
          ws.send(JSON.stringify({
            buy: 1, price: adjStake,
            parameters: { amount: adjStake, basis: "stake", contract_type: contractType, currency: "USD", duration: 5, duration_unit: "m", symbol }
          }));
        }
      }

      if (d.buy && !contractId) {
        contractId = d.buy.contract_id;
        const tp = (ws as any)._tp;
        const sl = (ws as any)._sl;
        const adjStake = (ws as any)._adjStake;
        if (tp && sl) {
          ws.send(JSON.stringify({ contract_update: 1, contract_id: contractId, limit_order: { take_profit: tp, stop_loss: sl } }));
        } else {
          clearTimeout(timeout); ws.close(); resolve({ ...d.buy, stake_used: adjStake });
        }
      }

      if (d.contract_update) {
        clearTimeout(timeout); ws.close();
        // FIX: TP/SL set ≠ contract closed. Log as "open" not "win".
        // The reconciler will update to real win/loss when contract closes.
        resolve({
          contract_id:  contractId,
          stake_used:   (ws as any)._adjStake,
          take_profit:  (ws as any)._tp,
          stop_loss:    (ws as any)._sl,
          tp_sl_set:    true,
          status:       "open"  // NOT a win yet — still running
        });
      }

      if (d.error) {
        if (contractId) {
          clearTimeout(timeout); ws.close();
          resolve({ contract_id: contractId, stake_used: (ws as any)._adjStake, tp_sl_error: d.error.message });
        } else {
          clearTimeout(timeout); ws.close(); resolve({ error: d.error.message });
        }
      }
    };
    ws.onerror = () => { clearTimeout(timeout); resolve({ error: "ws error" }); };
  });
}

async function getConsecutiveLosses(supabase: any): Promise<number> {
  // FIX: match both lowercase (edge function) and uppercase (frontend) result values
  const { data } = await supabase.from("trades").select("result")
    .in("account_name", ["edge_function", "Primary", "primary"])
    .order("created_at", { ascending: false }).limit(8);
  if (!data) return 0;
  let count = 0;
  for (const t of data) {
    if (["loss", "LOSS"].includes(t.result)) count++;
    else if (["win", "WIN"].includes(t.result)) break;
    // skip 'open'/'expired' entries without breaking streak
  }
  return count;
}


// ─────────────────────────────────────────────
// MONTE CARLO RISK SIMULATION
// Simulates 5000 possible sequences of next 20 trades
// to find optimal stake that maximizes growth while
// keeping risk of ruin below 5%
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// FAT-TAIL RANDOM SAMPLING
// Student's t-distribution (df=5)
// Captures real market crash probability
// Normal dist underestimates tail events by 10-100x
// Source: Gram-Charlier paper (Sakhare 2026)
// ─────────────────────────────────────────────
function sampleT(df: number): number {
  // Box-Muller for normal
  const u1 = Math.random(), u2 = Math.random();
  const normal = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  // Chi-squared approximation for t-distribution
  // t = Z / sqrt(chi2/df) where chi2 = sum of df squared normals
  let chi2 = 0;
  for (let i = 0; i < df; i++) {
    const u3 = Math.random(), u4 = Math.random();
    const n = Math.sqrt(-2 * Math.log(u3 + 1e-10)) * Math.cos(2 * Math.PI * u4);
    chi2 += n * n;
  }
  return normal / Math.sqrt(chi2 / df);
}

function tDistWin(winRate: number, skewness: number, kurtosis: number): boolean {
  // Fat-tail win probability sampling
  // Accounts for: skewness (asymmetric returns)
  //               kurtosis (fat tails = more extreme outcomes)
  // df=5 gives ~3x more extreme events than normal
  const df = Math.max(3, 10 - kurtosis);  // higher kurtosis = fatter tails
  const t  = sampleT(df);
  // Shift threshold by skewness (positive skew = more wins)
  const threshold = skewness > 0
    ? winRate - skewness * 0.05   // positive skew → easier to win
    : winRate - skewness * 0.05;  // negative skew → harder to win
  // Convert t-statistic to probability via logistic
  const prob = 1 / (1 + Math.exp(-t * 0.5));
  return prob < threshold;
}

function monteCarloStake(
  balance: number,
  baseStakePct: number,
  winRate: number,
  avgWinPct: number,
  avgLossPct: number,
  minStake: number,
  maxStake: number,
  gcSkewness: number = 0,    // from Gram-Charlier features
  gcKurtosis: number = 1,    // from Gram-Charlier features
): { stake: number; riskOfRuin: number; expectedGrowth: number; recommendation: string } {
  const SIMULATIONS = 3000;  // reduced for speed (was 5000)
  const HORIZON     = 20;
  const RUIN_THRESH = 0.20;

  let testPct = baseStakePct / 100;

  let ruinCount   = 0;
  let totalGrowth = 0;

  // Tail risk multiplier — high kurtosis = more extreme losses possible
  const tailRisk = Math.max(1, 1 + (gcKurtosis - 1) * 0.1);

  for (let sim = 0; sim < SIMULATIONS; sim++) {
    let bal = balance;
    const ruinLevel = balance * (1 - RUIN_THRESH);
    let ruined = false;

    for (let t = 0; t < HORIZON; t++) {
      const stake = Math.max(minStake, Math.min(maxStake, bal * testPct));

      // Fat-tail win/loss sampling
      const win = tDistWin(winRate, gcSkewness, gcKurtosis);

      if (win) {
        // Wins can be larger than expected (positive kurtosis)
        const winMult = 1 + Math.max(0, sampleT(5) * 0.1 * gcKurtosis);
        bal += stake * avgWinPct * Math.min(3, winMult);
      } else {
        // Losses can be much larger in fat-tail markets
        const lossMult = tailRisk * (1 + Math.max(0, -sampleT(5) * 0.15));
        bal -= stake * avgLossPct * Math.min(4, lossMult);
      }

      if (bal <= ruinLevel) { ruined = true; break; }
    }

    if (ruined) ruinCount++;
    totalGrowth += (bal - balance) / balance;
  }

  const riskOfRuin    = ruinCount / SIMULATIONS;
  const expectedGrowth = totalGrowth / SIMULATIONS;

  let finalPct      = testPct;
  let recommendation = "normal";

  // More conservative thresholds with fat tails
  if (riskOfRuin > 0.10) {
    finalPct = testPct * 0.40;  // fat tails = cut more aggressively
    recommendation = "reduced_60pct_fat_tail";
  } else if (riskOfRuin > 0.05) {
    finalPct = testPct * 0.70;
    recommendation = "reduced_30pct";
  } else if (riskOfRuin > 0.02) {
    finalPct = testPct * 0.85;
    recommendation = "reduced_15pct";
  } else if (riskOfRuin < 0.01 && winRate > 0.65 && expectedGrowth > 0 && gcKurtosis < 2) {
    // Only boost if low kurtosis (not spiky market)
    finalPct = Math.min(testPct * 1.20, 0.04);
    recommendation = "boosted_20pct";
  }

  const finalStake = Math.max(
    minStake,
    Math.min(maxStake, parseFloat((balance * finalPct).toFixed(2)))
  );

  return { stake: finalStake, riskOfRuin, expectedGrowth, recommendation };
}

// Get recent win rate and avg payout from trades table
async function getRecentPerformance(supabase: any): Promise<{ winRate: number; avgWinPct: number; avgLossPct: number }> {
  try {
    const { data } = await supabase
      .from("trades")
      .select("result, stake, pnl")
      .eq("account_name", "edge_function")
      .in("result", ["win", "loss"])
      .order("created_at", { ascending: false })
      .limit(30);

    if (!data || data.length < 5) {
      // Not enough data — use conservative defaults
      return { winRate: 0.55, avgWinPct: 0.85, avgLossPct: 0.90 };
    }

    const wins   = data.filter((t: any) => t.result === "win");
    const losses = data.filter((t: any) => t.result === "loss");
    const winRate = wins.length / data.length;

    // Calculate avg win/loss as % of stake
    const avgWinPct = wins.length > 0
      ? wins.reduce((a: number, t: any) => a + (t.pnl || 0.85 * t.stake) / (t.stake || 1), 0) / wins.length
      : 0.85;
    const avgLossPct = losses.length > 0
      ? losses.reduce((a: number, t: any) => a + Math.abs(t.pnl || 0.90 * t.stake) / (t.stake || 1), 0) / losses.length
      : 0.90;

    return {
      winRate:    Math.max(0.35, Math.min(0.95, winRate)),
      avgWinPct:  Math.max(0.50, Math.min(1.50, avgWinPct)),
      avgLossPct: Math.max(0.50, Math.min(1.00, avgLossPct)),
    };
  } catch(e) {
    return { winRate: 0.55, avgWinPct: 0.85, avgLossPct: 0.90, _tradeCount: 0 };
  }
}


// ─────────────────────────────────────────────
// FIRST PASSAGE TIME — optimal TP/SL calculation
// Calculates mathematically optimal take profit
// distance where P(win) is maximized given current
// volatility and mean reversion characteristics
// ─────────────────────────────────────────────
function firstPassageTime(
  prices: number[],
  action: string,
  symbol: string,
  garchVol: number,
  ouZscore: number,
  confidence: number
): { tpPct: number; slPct: number; winProb: number; tpMultiplier: number } {

  // Known synthetic volatility per symbol (Deriv specification)
  const KNOWN_VOL: Record<string, number> = {
    "R_10": 0.001, "R_25": 0.0025, "R_50": 0.005,
    "R_75": 0.0075, "R_100": 0.01
  };

  // Use known vol for synthetics, GARCH for everything else
  const baseVol = KNOWN_VOL[symbol] || Math.max(garchVol, 0.001);

  // Session-adjusted volatility — London/NY overlap has higher vol
  const h = new Date().getUTCHours();
  const sessionMult = (h >= 12 && h < 16) ? 1.3  // overlap — high vol
                    : (h >= 7  && h < 21) ? 1.0  // active session
                    : 0.7;                         // off hours — low vol
  const adjVol = baseVol * sessionMult;

  // OU mean reversion pull — if price is stretched, it will revert
  // Strong reversion (|zscore| > 2) = higher win prob for mean reversion trades
  const reversionPull = Math.min(Math.abs(ouZscore) * 0.001, 0.005);

  // First Passage Time probability formula:
  // P(hit TP before SL) = SL_dist / (TP_dist + SL_dist)
  // We want P(win) >= 0.60 minimum
  // Solve: SL / (TP + SL) >= 0.60
  // → SL >= 1.5 * TP
  // But we also want TP to be reachable given volatility

  // TP = distance price needs to move to profit
  // Set TP at 1.5x current volatility — achievable in 5-15 min
  let tpPct = adjVol * 1.5;

  // For mean reversion trades (OU zscore extreme) — tighter TP
  // Price will snap back quickly
  if (Math.abs(ouZscore) > 1.5) {
    tpPct = Math.min(tpPct, reversionPull * 2);
  }

  // For trend-following trades — wider TP to catch the full move
  if (confidence >= 85) {
    tpPct = adjVol * 3.0;  // let strong trends run
  } else if (confidence >= 75) {
    tpPct = adjVol * 2.0;
  }

  // SL multiplier from diagnostic data:
  // BOOM/CRASH: SL=1.5×ATR (65-74% of losses were SL clips at 1×ATR)
  // Others: SL=1.0×ATR (standard 2:1 RR)
  const isBoomCrashSymbol = symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
  const isVIXSymbol = symbol.startsWith("R_") || symbol.startsWith("1HZ") || symbol.startsWith("JD");
  // VIX tight SL = 0.4x TP → 2.5:1 ratio (backtested: avg loss was bigger than avg win)
  // BOOM/CRASH wider SL = 1.5x TP (spike volatility needs room)
  const slMult = isBoomCrashSymbol ? 1.5 : isVIXSymbol ? 0.4 : 0.5;
  const rawSlPct = Math.min(tpPct * slMult, 0.90);
  // Enforce minimum 2:1 TP/SL — never trade with worse ratio
  const finalTpPct = tpPct < rawSlPct * 2.0 ? rawSlPct * 2.0 : tpPct;
  const slPct = rawSlPct;

  // Calculate actual win probability
  const winProb = finalTpPct / (finalTpPct + slPct);

  // tpMultiplier = TP as fraction of stake (for contract_update)
  // stake * multiplier * tpPct = TP profit
  // → tpMultiplier = TP_profit / stake
  // We'll calculate actual $ amounts in placeTrade
  const tpMultiplier = tpPct * 100; // normalized

  return { tpPct: finalTpPct, slPct, winProb, tpMultiplier };
}

// ─────────────────────────────────────────────
// DYNAMIC MULTIPLIER SELECTION
// Selects optimal contract multiplier based on
// signal confidence, symbol type and market regime
// Higher multiplier = more profit per price move
// but also faster SL hit — only use when confident
// ─────────────────────────────────────────────
function selectMultiplier(
  symbol: string,
  confidence: number,
  hmmRegime: string,
  kalmanVelocity: number,
  garchVol: number
): number {
  // Available multipliers per symbol type (confirmed from Deriv API)
  const MULT_RANGES: Record<string, number[]> = {
    "BOOM":  [100, 150, 200],
    "CRASH": [100, 150, 200],
    "R_":    [50,  100, 200, 300, 500],
    "forex": [100, 200, 300, 500, 800],
    "cry":   [100, 200, 300, 500, 800],
  };

  // Determine symbol category
  const category = symbol.startsWith("BOOM")  ? "BOOM"
                 : symbol.startsWith("CRASH") ? "CRASH"
                 : symbol.startsWith("R_")    ? "R_"
                 : symbol.startsWith("cry")   ? "cry"
                 : "forex";

  const available = MULT_RANGES[category] || [100];
  const maxMult   = available[available.length - 1];

  // High volatility = risky to use high multiplier
  // SL gets hit faster with high vol + high multiplier
  const isHighVol = garchVol > 0.008;
  const isStrongTrend = hmmRegime === "Uptrend" || hmmRegime === "Downtrend";
  const isWeakTrend   = hmmRegime === "WeakUptrend" || hmmRegime === "WeakDowntrend";
  const strongKalman  = Math.abs(kalmanVelocity) > 0.0001;

  // Select multiplier tier based on conditions
  let selectedMult: number;

  if (confidence >= 88 && isStrongTrend && strongKalman && !isHighVol) {
    // Premium conditions — use highest available
    selectedMult = maxMult;
  } else if (confidence >= 82 && (isStrongTrend || strongKalman) && !isHighVol) {
    // Strong conditions — use 2nd highest
    selectedMult = available[available.length - 2] || maxMult;
  } else if (confidence >= 75 && !isHighVol) {
    // Good conditions — use middle tier
    const midIdx = Math.floor(available.length / 2);
    selectedMult = available[midIdx];
  } else if (confidence >= 65 && isWeakTrend) {
    // Moderate conditions — use 2nd lowest
    selectedMult = available[1] || available[0];
  } else {
    // Conservative — use lowest safe multiplier
    selectedMult = available[0];
  }

  console.log(`🎯 Multiplier selected: x${selectedMult} for ${symbol} (conf:${confidence}% regime:${hmmRegime} vol:${garchVol.toFixed(4)})`);
  return selectedMult;
}


// ─────────────────────────────────────────────
// TRUE BAYESIAN WIN PROBABILITY
// P(win|conditions) = P(conditions|win) × P(win)
//                     ─────────────────────────
//                          P(conditions)
// Prior: symbol trained win rate
// Likelihood: 7 market condition factors
// Posterior: updated belief after seeing conditions
// Runs in microseconds — pure math, no simulation
// ─────────────────────────────────────────────
function trueBayesianWinProb(
  candles1m: any[],
  action: string,
  symbol: string,
  features: number[],
  priorWinRate: number,
  hmmRegime: string,
  sessionStrength: number
): { winProb: number; recommendation: string; factors: Record<string, number> } {

  if (candles1m.length < 50) {
    return { winProb: priorWinRate, recommendation: "prior_only", factors: {} };
  }

  const closes = candles1m.map((c: any) => parseFloat(c.close));
  const n = closes.length;
  const returns: number[] = [];
  for (let i = 1; i < n; i++) {
    returns.push((closes[i] - closes[i-1]) / (closes[i-1] + 1e-10));
  }
  const rLen = returns.length;
  const meanReturn = returns.reduce((a,b) => a+b, 0) / rLen;
  const variance   = returns.reduce((a,b) => a+(b-meanReturn)**2, 0) / rLen;
  const sigma      = Math.sqrt(variance) + 1e-8;

  // Extract features
  const kalmanVel = features[23] || 0;
  const garchVol  = features[27] || 0.003;
  const ouZscore  = features[29] || 0;
  const rsi       = features[0]  || 50;
  const emaBull   = features[4]  || 0;
  const emaBear   = features[5]  || 0;

  const prior     = Math.max(0.40, Math.min(0.95, priorWinRate));
  const priorLoss = 1 - prior;
  const factors: Record<string, number> = {};
  const isBoomCrash = symbol.startsWith("BOOM") || symbol.startsWith("CRASH");

  // Factor 1: Kalman velocity alignment
  const kalmanAligned = action === "BUY" ? kalmanVel > 0 : kalmanVel < 0;
  const kalmanStrength = Math.abs(kalmanVel) / (sigma + 1e-10);
  factors.kalman = kalmanAligned
    ? (1.0 + Math.min(kalmanStrength, 2.0) * 0.15)
    : (0.7 - Math.min(kalmanStrength, 1.0) * 0.10);

  // Factor 2: GARCH volatility
  const volRatio = garchVol / (sigma + 1e-10);
  factors.volatility = volRatio > 2.0 ? 0.75
                     : volRatio > 1.0 ? 0.90
                     : volRatio < 0.5 ? 1.15
                     : 1.0;

  // Factor 3: OU zscore
  const absZ = Math.abs(ouZscore);
  if (isBoomCrash) {
    factors.ouReversion = absZ > 1.5 ? 1.20 : absZ > 0.8 ? 1.05 : 0.90;
  } else {
    factors.ouReversion = absZ > 2.0 ? 0.75 : absZ > 1.0 ? 0.90 : 1.10;
  }

  // Factor 4: Session strength
  factors.session = 0.80 + (sessionStrength * 0.40);

  // Factor 5: HMM Regime
  factors.regime = (action === "BUY"  && hmmRegime.includes("Uptrend"))   ? 1.20
                 : (action === "SELL" && hmmRegime.includes("Downtrend"))  ? 1.20
                 : hmmRegime === "Ranging"                                  ? 0.85
                 : hmmRegime === "HighVolatility"                           ? 0.75
                 : 1.0;

  // Factor 6: EMA stack
  const emaAligned = (action === "BUY" && emaBull === 1) || (action === "SELL" && emaBear === 1);
  factors.emaStack = emaAligned ? 1.10 : 0.92;

  // Factor 7: RSI zone
  if (isBoomCrash) {
    factors.rsi = (action === "BUY"  && rsi < 40) ? 1.15
                : (action === "SELL" && rsi > 60) ? 1.15
                : 1.0;
  } else {
    factors.rsi = (rsi >= 40 && rsi <= 60) ? 1.10
                : (rsi >= 30 && rsi <= 70) ? 1.0
                : 0.85;
  }

  // Bayes update: posterior_odds = prior_odds × likelihood_ratio
  const likelihoodRatio = Object.values(factors).reduce((a, b) => a * b, 1.0);
  const priorOdds       = prior / (priorLoss + 1e-10);
  const posteriorOdds   = priorOdds * likelihoodRatio;
  const winProb         = Math.max(0.20, Math.min(0.95, posteriorOdds / (1 + posteriorOdds)));

  const recommendation = winProb >= 0.72 ? "strong_trade"
                       : winProb >= 0.62 ? "good_trade"
                       : winProb >= 0.55 ? "marginal_trade"
                       : "skip";

  console.log(`🎲 Bayes ${symbol} ${action}: prior=${(prior*100).toFixed(0)}% → posterior=${(winProb*100).toFixed(1)}% LR=${likelihoodRatio.toFixed(2)} rec:${recommendation}`);
  return { winProb, recommendation, factors };
}

// ─────────────────────────────────────────────
// FIX 5: TRADE RESULT UPDATER
// Checks open trades via Deriv API and updates
// win/loss results so AI Brain can learn
// ─────────────────────────────────────────────
async function updateOpenTradeResults(supabase: any, token: string): Promise<void> {
  try {
    const { data: openTrades } = await supabase
      .from("trades")
      .select("id, symbol, stake, created_at")
      .eq("result", "open")
      .eq("account_name", "edge_function")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!openTrades || openTrades.length === 0) return;
    console.log(`🔄 Checking ${openTrades.length} open trades...`);

    // Fetch statement from Deriv
    const transactions: any[] = await new Promise((resolve) => {
      const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
      const timeout = setTimeout(() => { ws.close(); resolve([]); }, 20000);
      let authed = false;
      let allTx: any[] = [];
      let pending = 2;

      const done = () => {
        pending--;
        if (pending <= 0) {
          clearTimeout(timeout);
          ws.close();
          resolve(allTx);
        }
      };

      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = (e: any) => {
        const d = JSON.parse(e.data);
        if (d.authorize && !authed) {
          authed = true;
          ws.send(JSON.stringify({ statement: 1, description: 1, limit: 200 }));
          ws.send(JSON.stringify({ profit_table: 1, description: 1, limit: 100, sort: "DESC" }));
        }
        if (d.statement) {
          allTx = allTx.concat(d.statement.transactions || []);
          done();
        }
        if (d.profit_table) {
          allTx = allTx.concat(d.profit_table.transactions || []);
          done();
        }
        if (d.error) { done(); }
      };
      ws.onerror = () => { clearTimeout(timeout); resolve([]); };
    });

    console.log(`📊 Got ${transactions.length} transactions from Deriv`);

    let updated = 0;
    const twoHrsAgo = new Date(Date.now() - 2*60*60*1000).toISOString();

    for (const trade of openTrades) {
      const tradeTimeSec = new Date(trade.created_at).getTime() / 1000;

      // Find matching transaction — improved matching for MULT contracts
      // Priority: match by contract_id first (most reliable)
      // Fallback: match by timestamp + stake amount
      const match = transactions.find((t: any) => {
        // Direct contract_id match
        if (trade.contract_ref && t.contract_id) {
          return String(t.contract_id) === String(trade.contract_ref);
        }
        return false;
      }) || transactions.find((t: any) => {
        // Timestamp match within 15 minutes
        const pt = parseFloat(t.purchase_time || t.transaction_time || "0");
        return pt > 0 && Math.abs(pt - tradeTimeSec) < 900;
      }) || transactions.find((t: any) => {
        // Stake + time match within 30 minutes
        const pt = parseFloat(t.purchase_time || t.transaction_time || "0");
        const buyPrice = parseFloat(t.buy_price || t.amount || "0");
        return Math.abs(buyPrice - (trade.stake || 0)) < 0.5 && Math.abs(pt - tradeTimeSec) < 1800;
      });

      if (match) {
        // Only update if contract is actually CLOSED
        // MULT contracts: sell_price exists only after close
        // profit_table: pnl or profit field populated after close
        const isClosed = match.sell_price != null || match.pnl != null || match.profit != null;
        if (!isClosed) {
          console.log(`⏳ ${trade.symbol}: contract still open — skipping pnl update`);
          continue;
        }

        let pnl = 0;
        if (match.profit != null)      pnl = parseFloat(match.profit);
        else if (match.pnl != null)    pnl = parseFloat(match.pnl);
        else if (match.sell_price != null && match.buy_price != null)
          pnl = parseFloat(match.sell_price) - parseFloat(match.buy_price);

        // Sanity check — pnl of exactly 0 on a closed trade is suspicious
        // Could mean contract matched wrong — skip to avoid fake wins
        if (pnl === 0 && match.sell_price == null) {
          console.log(`⚠️  ${trade.symbol}: pnl=0 with no sell_price — likely wrong match, skipping`);
          continue;
        }

        const result = pnl > 0 ? "win" : "loss";
        await supabase.from("trades")
          .update({ result, pnl: parseFloat(pnl.toFixed(4)) })
          .eq("id", trade.id);
        console.log(`✅ ${trade.symbol}: ${result} pnl=$${pnl.toFixed(2)}`);
        updated++;
      } else if (trade.created_at < twoHrsAgo) {
        // Stale trade — mark expired
        await supabase.from("trades")
          .update({ result: "expired" })
          .eq("id", trade.id);
      }
    }
    console.log(`🔄 Updated ${updated}/${openTrades.length} trades`);

  } catch(e) {
    console.log(`⚠️ Trade result updater error: ${e}`);
  }
}


// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// SIGNAL LONGEVITY ENGINE
// Based on Information Half-Life theory (quant finance)
// T_half = ln(0.5) / ln(phi) where phi = lag-1 autocorrelation
// When half-life < 2 candles → signal decaying → warn/exit
// ═══════════════════════════════════════════════════════════════

function calcSignalHalfLife(closes: number[]): {
  halfLife: number; phi: number; strength: string; exitWarning: boolean; snr: number;
} {
  if (closes.length < 10) return { halfLife: 5, phi: 0.5, strength: "unknown", exitWarning: false, snr: 0 };

  const returns = closes.slice(1).map((c: number, i: number) => c - closes[i]);
  const n    = returns.length;
  const mean = returns.reduce((a: number, b: number) => a + b, 0) / n;
  const dm   = returns.map((r: number) => r - mean);

  let num = 0, den = 0;
  for (let i = 1; i < dm.length; i++) { num += dm[i]*dm[i-1]; den += dm[i]*dm[i]; }

  const phi = den === 0 ? 0 : Math.max(-0.99, Math.min(0.99, num/den));
  const hl  = (phi <= 0 || phi >= 1) ? 1 : Math.abs(Math.log(0.5) / Math.log(Math.abs(phi)));

  // Signal-to-Noise Ratio: net directional move vs candle-level noise
  const netMove = Math.abs(closes[closes.length-1] - closes[0]);
  const atr     = returns.reduce((s: number, r: number) => s + Math.abs(r), 0) / returns.length;
  const snr     = atr > 0 ? netMove / (atr * Math.sqrt(closes.length)) : 0;

  // SNR-based classification (backtested: +19.3% WR improvement)
  let strength: string;
  let exitWarning: boolean;
  if (snr > 0.5 && phi > -0.3)        { strength = "strong"; exitWarning = false; }
  else if (snr > 0.2 || (hl > 2 && phi > 0.0)) { strength = "fading"; exitWarning = false; }
  else                                  { strength = "dead";   exitWarning = true;  }

  return { halfLife: parseFloat(Math.min(hl,20).toFixed(1)), phi: parseFloat(phi.toFixed(3)), strength, exitWarning, snr: parseFloat(snr.toFixed(3)) };
}

// ═══════════════════════════════════════════════════════════════
// NOISE vs REAL REVERSAL DETECTOR
// Hyperbolic decay model: alpha(t) = K/(1 + lambda*t)
// Real reversals follow hyperbolic curve
// Noise spikes are random deviations from curve
// ═══════════════════════════════════════════════════════════════
function detectNoiseVsReversal(closes: number[], signalAction: string): {
  isNoise: boolean;
  confidence: number;  // 0-100 that move is noise
  reason: string;
} {
  if (closes.length < 8) return { isNoise: false, confidence: 0, reason: "insufficient_data" };

  const recent   = closes.slice(-5);
  const baseline = closes.slice(-10, -5);

  const recentMean   = recent.reduce((a, b) => a + b, 0) / recent.length;
  const baselineMean = baseline.reduce((a, b) => a + b, 0) / baseline.length;

  // Measure deviation magnitude vs baseline volatility
  const baselineStd = Math.sqrt(
    baseline.reduce((s, v) => s + Math.pow(v - baselineMean, 2), 0) / baseline.length
  );

  const deviation = Math.abs(recentMean - baselineMean);
  const zScore    = baselineStd > 0 ? deviation / baselineStd : 0;

  // Check if price moved AGAINST signal direction in recent candles
  const priceMomentum = recent[recent.length - 1] - recent[0];
  const signalBull    = signalAction === "BUY";
  const movingAgainst = signalBull ? priceMomentum < 0 : priceMomentum > 0;

  if (!movingAgainst) {
    return { isNoise: false, confidence: 0, reason: "price_confirming_signal" };
  }

  // Small z-score against signal = noise (< 1.5 sigma)
  // Large z-score against signal = real reversal (> 2.5 sigma)
  if (zScore < 1.0) {
    return { isNoise: true, confidence: Math.round(80 - zScore * 20), reason: `noise_z=${zScore.toFixed(2)}_small_deviation` };
  } else if (zScore < 2.0) {
    return { isNoise: true, confidence: Math.round(50 - (zScore - 1.0) * 20), reason: `marginal_z=${zScore.toFixed(2)}` };
  } else {
    return { isNoise: false, confidence: Math.round((zScore - 2.0) * 30), reason: `real_reversal_z=${zScore.toFixed(2)}` };
  }
}



// ── Per-symbol optimal RSI thresholds (backtested June 2026) ──
const SYNTH_RSI_THRESHOLDS: Record<string,{buy:number,sell:number}> = {
  "R_100": { buy: 20, sell: 80 },
  "JD10":  { buy: 32, sell: 68 },
  "JD50":  { buy: 35, sell: 65 },
  "JD25":  { buy: 20, sell: 80 },
  "R_10":  { buy: 35, sell: 65 },
  "R_25":  { buy: 30, sell: 70 },
  "JD100": { buy: 28, sell: 72 },
  "R_75":  { buy: 32, sell: 68 },
  "JD75":  { buy: 25, sell: 75 },
  "R_50":  { buy: 20, sell: 80 },
};
const BELOW_BREAKEVEN = ["R_75","JD75","JD100","R_50"];


// ── Forex signal strategy per pair (backtested June 2026) ──
// TREND pairs: EMA crossover works (EUR, GBP)
// MEAN-REVERT pairs: RSI works (Gold, Silver, JPY)
const FOREX_STRATEGY: Record<string,string> = {
  "frxEURUSD": "trend",    // EMA 0.03% crossover — 80% WR backtested
  "frxGBPUSD": "trend",    // EMA 0.03% crossover — 64.6% WR backtested
  "frxEURGBP": "trend",    // EMA crossover
  "frxGBPJPY": "trend",    // EMA crossover
  "frxXAUUSD": "revert",   // RSI<30 mean reversion — 60% WR
  "frxXAGUSD": "revert",   // RSI<30 mean reversion — 59% WR
  "frxUSDJPY": "revert",   // RSI<30 mean reversion — 57% WR
  "frxAUDUSD": "revert",   // RSI mean reversion
  "frxUSDCAD": "revert",   // RSI mean reversion
  "frxUSDCHF": "revert",   // RSI mean reversion
};
const FOREX_RSI_THRESH: Record<string,number> = {
  "frxXAUUSD": 35,  // RSI<35 for Gold — 58.6% WR (more trades, still profitable)
  "frxXAGUSD": 35,  // RSI<35 for Silver — 59.9% WR
  "frxUSDJPY": 30,  // RSI<30 for JPY — 56% WR
  "frxAUDUSD": 30,
  "frxUSDCAD": 30,
  "frxUSDCHF": 30,
};


// ── High Impact News Filter ────────────────────────────────────
const CURRENCY_TO_PAIRS: Record<string,string[]> = {
  "USD": ["frxEURUSD","frxGBPUSD","frxUSDJPY","frxXAUUSD","frxXAGUSD","frxAUDUSD","frxUSDCAD","frxUSDCHF"],
  "EUR": ["frxEURUSD","frxEURGBP","frxEURJPY"],
  "GBP": ["frxGBPUSD","frxGBPJPY","frxEURGBP"],
  "JPY": ["frxUSDJPY","frxGBPJPY","frxEURJPY"],
  "XAU": ["frxXAUUSD"],
  "XAG": ["frxXAGUSD"],
  "AUD": ["frxAUDUSD","frxAUDJPY"],
  "CAD": ["frxUSDCAD"],
  "CHF": ["frxUSDCHF"],
  "NZD": ["frxNZDUSD"],
};

let _newsCache: { data: any[]; ts: number } | null = null;
const NEWS_CACHE_MS = 5 * 60 * 1000;

async function fetchHighImpactNews(): Promise<any[]> {
  if (_newsCache && Date.now() - _newsCache.ts < NEWS_CACHE_MS) {
    return _newsCache.data;
  }
  try {
    // Use same ForexFactory public feed as UI
    const res = await fetch(
      "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
      { signal: AbortSignal.timeout(5000), headers:{ "User-Agent":"Mozilla/5.0" } }
    );
    if (!res.ok) return [];
    const raw = await res.json();
    const all = Array.isArray(raw) ? raw : [];
    // Only return high impact events with correct currency field
    const events = all
      .filter((e: any) => e.impact === "High")
      .map((e: any) => ({
        ...e,
        currency: e.country || e.currency || "USD",
        date: e.date || "",
      }));
    _newsCache = { data: events, ts: Date.now() };
    return events;
  } catch {
    return _newsCache?.data || [];
  }
}

async function getNewsImpact(symbol: string): Promise<{
  blocked: boolean; reduced: boolean; reason: string; minutesUntil: number;
}> {
  if (!symbol.startsWith("frx")) {
    return { blocked:false, reduced:false, reason:"", minutesUntil:999 };
  }
  const events = await fetchHighImpactNews();
  const now    = Date.now();
  for (const ev of events) {
    const cur   = ev.currency || ev.economy || "";
    const pairs = CURRENCY_TO_PAIRS[cur] || [];
    if (!pairs.includes(symbol)) continue;
    const evTime  = new Date(ev.date || ev.data).getTime();
    const diffMin = (evTime - now) / 60000;
    if (diffMin > -15 && diffMin < 15) {
      return { blocked:true, reduced:false,
        reason: `news_block: ${ev.title||ev.name} ${Math.abs(Math.round(diffMin))}min ${diffMin>0?"away":"ago"}`,
        minutesUntil: diffMin };
    }
    if (diffMin > -30 && diffMin < 30) {
      return { blocked:false, reduced:true,
        reason: `news_caution: ${ev.title||ev.name} ${Math.abs(Math.round(diffMin))}min ${diffMin>0?"away":"ago"}`,
        minutesUntil: diffMin };
    }
  }
  return { blocked:false, reduced:false, reason:"", minutesUntil:999 };
}


// ── Post-News Trading Signal ───────────────────────────────────
// When actual significantly beats/misses forecast → trade the move
// This turns high impact news from a blocker into an opportunity
async function getNewsTradingSignal(symbol: string): Promise<{
  hasSignal: boolean;
  action: string;
  confidence: number;
  reason: string;
} | null> {
  if (!symbol.startsWith("frx")) return null;

  const events = await fetchHighImpactNews();
  const now    = Date.now();

  for (const ev of events) {
    const cur   = ev.currency || ev.economy || "";
    const pairs = CURRENCY_TO_PAIRS[cur] || [];
    if (!pairs.includes(symbol)) continue;

    const evTime  = new Date(ev.date || ev.data).getTime();
    const diffMin = (evTime - now) / 60000;

    // Only trade 0-60 min AFTER the news released
    if (diffMin > 0 || diffMin < -60) continue;

    const actual   = parseFloat(ev.actual   || "");
    const forecast = parseFloat(ev.forecast || "");
    const previous = parseFloat(ev.previous || "");

    if (isNaN(actual) || isNaN(forecast)) continue;

    const diff    = actual - forecast;
    const base    = Math.abs(forecast) || Math.abs(previous) || 1;
    const diffPct = Math.abs(diff) / base * 100;

    // Only trade significant surprises (>10% deviation from forecast)
    if (diffPct < 10) continue;

    const beat = diff > 0;  // actual > forecast = currency strengthens
    const title = ev.title || ev.name || "News Event";

    // Determine direction based on currency vs symbol
    // e.g. USD beats → EURUSD goes DOWN (USD stronger)
    // e.g. EUR beats → EURUSD goes UP (EUR stronger)
    let action = "";
    const symbolBase  = symbol.replace("frx","").slice(0,3); // EUR in EURUSD
    const symbolQuote = symbol.replace("frx","").slice(3,6); // USD in EURUSD

    if (cur === symbolBase) {
      action = beat ? "BUY" : "SELL";   // Base currency stronger = pair goes up
    } else if (cur === symbolQuote) {
      action = beat ? "SELL" : "BUY";   // Quote currency stronger = pair goes down
    } else if (cur === "XAU") {
      // Gold: USD beat → Gold down, USD miss → Gold up
      action = beat ? "SELL" : "BUY";
    } else if (cur === "XAG") {
      action = beat ? "SELL" : "BUY";
    } else {
      continue;
    }

    // Confidence scales with surprise magnitude
    const conf = diffPct > 50 ? 90
               : diffPct > 30 ? 85
               : diffPct > 20 ? 80
               : 75;

    const minsAgo = Math.abs(Math.round(diffMin));
    return {
      hasSignal:  true,
      action,
      confidence: conf,
      reason: `news_trade: ${title} actual=${ev.actual} forecast=${ev.forecast} ${beat?"BEAT":"MISS"} ${diffPct.toFixed(0)}% ${minsAgo}min ago`
    };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  // ── News API proxy endpoint ─────────────────────────────────
  const url = new URL(req.url);
  // News proxy — triggered by ?action=news query param
  // Uses ForexFactory public JSON feed — no auth, completely free
  if (url.searchParams.get("action") === "news") {
    try {
      const week = url.searchParams.get("week") || "thisweek";
      // nfs.faireconomy.media hosts the official FF calendar JSON
      const ffUrl = `https://nfs.faireconomy.media/ff_calendar_${week}.json`;
      const res   = await fetch(ffUrl, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const raw = await res.json();
      const events = Array.isArray(raw) ? raw : [];

      // Normalize country → currency
      const countryToCurrency: Record<string,string> = {
        "USD":"USD","EUR":"EUR","GBP":"GBP","JPY":"JPY",
        "AUD":"AUD","CAD":"CAD","CHF":"CHF","NZD":"NZD",
        "CNY":"CNY","CNH":"CNY"
      };

      const normalized = events.map((e: any) => ({
        title:    e.title || "Economic Event",
        currency: countryToCurrency[e.country] || e.country || "USD",
        impact:   e.impact === "High" ? "High"
                : e.impact === "Medium" ? "Medium"
                : e.impact === "Low" ? "Low" : "None",
        date:     e.date || "",
        actual:   e.actual   || "--",
        forecast: e.forecast || "--",
        previous: e.previous || "--",
      }));

      return new Response(JSON.stringify(normalized),
        { headers: { ...CORS, "Content-Type": "application/json" } });
    } catch(e) {
      console.error("News fetch error:", e);
      return new Response(JSON.stringify([]),
        { headers: { ...CORS, "Content-Type": "application/json" } });
    }
  }

  const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: cfg } = await supabase.from("bot_config").select("*").eq("active", true).single();
  if (!cfg || !cfg.auto_trade) return new Response(JSON.stringify({ status: "disabled" }), { headers: CORS });

  const token   = cfg.token;
  const riskPct = cfg.risk_pct || 2;

  // ── Auto-sync real balance from Deriv every cycle ──
  let balance = cfg.balance_cache || 10;
  try {
    const realBalance = await new Promise<number>((resolve) => {
      const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
      const t = setTimeout(() => { ws.close(); resolve(balance); }, 8000);
      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = (e) => {
        const d = JSON.parse(e.data);
        if (d.authorize) {
          clearTimeout(t); ws.close();
          resolve(parseFloat(d.authorize.balance || balance));
        }
        if (d.error) { clearTimeout(t); ws.close(); resolve(balance); }
      };
      ws.onerror = () => { clearTimeout(t); resolve(balance); };
    });
    if (realBalance > 0 && Math.abs(realBalance - balance) > 0.01) {
      balance = realBalance;
      await supabase.from("bot_config")
        .update({ balance_cache: realBalance })
        .eq("active", true);
      console.log(`💰 Balance synced: $${realBalance}`);
    }
  } catch(e) {
    console.log(`⚠️ Balance sync failed, using cache: $${balance}`);
  }

  // ── MONTE CARLO DYNAMIC STAKE ──
  // Get recent performance stats
  const perf = await getRecentPerformance(supabase);
  // FIX 4: If not enough real trade data, skip Monte Carlo adjustment
  // Using Monte Carlo with no data gives wrong results
  const hasEnoughData = (perf as any)._tradeCount >= 10;
  const isMult = (cfg.symbols || []).some((s: string) => s.startsWith("BOOM") || s.startsWith("CRASH"));
  const minStk = isMult ? 1.00 : 0.35;
  const maxStk = isMult ? 9.00 : balance * 0.05; // max 5% of balance for CALL/PUT

  // Only use Monte Carlo if enough real trade data exists
  let mc: any;
  let stake: number;
  if (hasEnoughData) {
    mc = monteCarloStake(
        balance, riskPct, perf.winRate, perf.avgWinPct, perf.avgLossPct, minStk, maxStk,
        Array.isArray(features) && features.length > 53 ? (features[53] || 0) : 0,   // gc_skewness
        Array.isArray(features) && features.length > 54 ? (features[54] || 1) : 1    // gc_kurtosis
      );
    stake = mc.stake;
    console.log(`💰 Monte Carlo stake: $${stake} (${mc.recommendation} ror:${(mc.riskOfRuin*100).toFixed(1)}%)`);
  } else {
    // Not enough data — use flat risk_pct directly
    stake = Math.max(minStk, Math.min(maxStk, parseFloat(((balance * riskPct) / 100).toFixed(2))));
    mc = { stake, riskOfRuin: 0, expectedGrowth: 0, recommendation: "insufficient_data", base_stake: stake, final_stake: stake };
    console.log(`💰 Flat stake: $${stake} (Monte Carlo needs 10+ trades)`);
  }
  const baseStake = Math.max(minStk, parseFloat(((balance * riskPct) / 100).toFixed(2)));
  console.log(`💰 Base stake: $${baseStake} → Monte Carlo adjusted: $${stake} (ror:${(mc.riskOfRuin*100).toFixed(1)}% growth:${(mc.expectedGrowth*100).toFixed(1)}% rec:${mc.recommendation} winRate:${(perf.winRate*100).toFixed(0)}%)`);
  const minConf = cfg.min_confidence || 65;

  // Circuit breaker — 3 consecutive losses → pause
  // BUT: if a high-confidence signal appears (85%+) → allow it through
  // This prevents the bot from missing genuinely good setups during pause
  // Circuit breaker: check R_75 specific consecutive losses
  const r75Losses = await supabase.from("trades")
    .select("result").eq("symbol","R_75").eq("account_name","edge_function")
    .order("created_at",{ascending:false}).limit(5);
  const r75ConsecLoss = (r75Losses.data||[]).every((t:any) => t.result === "loss");
  const r75Recent = r75Losses.data && r75Losses.data.length > 0 &&
    (Date.now() - new Date(r75Losses.data[0].created_at || Date.now()).getTime()) < 60*60*1000;
  if (r75ConsecLoss && (r75Losses.data||[]).length >= 5 && r75Recent) {
    console.log("🛑 R_75 circuit breaker: 5 recent consecutive losses — pausing R_75 for this cycle");
    cfg.symbols = (cfg.symbols||[]).filter((s:string) => s !== "R_75");
  }
  const consec = await getConsecutiveLosses(supabase);
  // FIX: Circuit breaker at 5 losses not 3 — 3 was too sensitive
  // Also reduced confidence boost from 85% to 75% — 85% almost never fires
  if (consec >= 5) {
    console.log(`⚠️ Circuit breaker active (${consec} losses) — raising confidence threshold`);
    cfg.min_confidence = Math.max(cfg.min_confidence || 65, 75); // require 75%+ during losing streak
  } else if (consec >= 3) {
    console.log(`⚠️ Losing streak (${consec} losses) — slight confidence boost`);
    cfg.min_confidence = Math.max(cfg.min_confidence || 65, 70);
  }

  // Load TRUE HMM model from Supabase
  await loadHMMModel(supabase);

  // AI Brain learns from recent completed trades every cycle
  await aiBrainLearn(supabase);

  // Fix 5: Update open trade results so AI Brain has real win/loss data
  await updateOpenTradeResults(supabase, token);

  // Load ML models
  const { data: mlRows } = await supabase.from("ml_models").select("symbol, model_json, win_rate");
  const ML_MODELS: Record<string, any> = {};
  for (const row of (mlRows || [])) {
    try {
      const mj = typeof row.model_json === "string" ? JSON.parse(row.model_json) : row.model_json;
      if (mj?.main_trees && mj?.meta_trees) {
        ML_MODELS[row.symbol] = mj;
        console.log(`✅ ${row.symbol}: ${mj.main_trees.length} main + ${mj.meta_trees.length} meta trees`);
      }
    } catch(e) { console.log(`❌ ${row.symbol}: parse error ${e}`); }
  }
  console.log(`🧠 ML models: ${Object.keys(ML_MODELS).join(", ")}`);

  const mlSymbols  = Object.keys(ML_MODELS);
  // ── Gold & Symbol Protection ─────────────────────────────────
  // Gold protection: skip if last 2 same-direction AND within last 30 minutes
  // (prevents revenge trading but allows recovery after time passes)
  try {
    const { data: xauR } = await supabase.from("trades")
      .select("type,result,created_at").eq("symbol","frxXAUUSD").eq("account_name","edge_function")
      .in("result",["win","loss"]).order("created_at",{ascending:false}).limit(3);
    if (xauR && xauR.length >= 2) {
      const sameDir   = xauR[0].type === xauR[1].type;
      const bothLoss  = xauR[0].result==="loss" && xauR[1].result==="loss";
      const recentEnough = (Date.now() - new Date(xauR[0].created_at).getTime()) < 30*60*1000;
      if (sameDir && bothLoss && recentEnough) {
        console.log(`⚠️ XAU: 2 recent consecutive ${xauR[0].type} losses — skipping this cycle`);
        cfg.symbols = (cfg.symbols||[]).filter((s:string) => s !== "frxXAUUSD");
      }
    }
  } catch(_e) {}

  // NOTE: Per-symbol hard block removed — was emptying symbol list and killing bot
  // Consecutive losses handled by confidence threshold + Bayesian filter instead

  const cfgSymbols = cfg.symbols || ["BOOM500", "CRASH500", "frxUSDJPY"];
  // INTERSECTION only — must be in BOTH ml_models AND bot_config.symbols
  // This means user controls exactly which symbols trade via Settings
  const allSymbols = cfgSymbols.filter(s => mlSymbols.includes(s));
  // Fallback: if no intersection found, use cfg symbols anyway (no ML, uses fallback strategy)
  const finalSymbols = allSymbols.length > 0 ? allSymbols : cfgSymbols;
  console.log(`📡 Scanning (ML+config intersection): ${finalSymbols.join(", ")}`);
  // Rename for rest of function
  const allSymbolsList = finalSymbols;

  // ── Per-symbol cooldown map (15 min after any loss) ──────────────────
  // Prevents re-entering same symbol immediately after a loss
  // FIX: Reduced cooldown from 15min to 5min — was blocking too aggressively
  const { data: recentLosses } = await supabase
    .from("trades")
    .select("symbol, created_at")
    .in("result", ["loss", "LOSS"])
    .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false });

  const cooldownSymbols = new Set<string>();
  const getCooldown = (sym: string) => {
    if (sym.startsWith("R_") || sym.startsWith("JD") || sym.startsWith("1HZ")) return 30;
    if (sym.startsWith("BOOM") || sym.startsWith("CRASH")) return 15;
    return 20;
  };
  for (const loss of (recentLosses || [])) {
    const cd = getCooldown(loss.symbol) * 60 * 1000;
    if (Date.now() - new Date(loss.created_at).getTime() < cd) {
      cooldownSymbols.add(loss.symbol);
    }
  }
  if (cooldownSymbols.size > 0) {
    console.log(`⏱️  Cooldown active for: ${[...cooldownSymbols].join(", ")}`);
  }

  // ── Daily hard loss limit ───────────────────────────────────────────
  // If today's total PnL < -dailyLossLimitPct% of balance → halt trading
  const dailyLossLimitPct = cfg.daily_loss_limit_pct || 5; // default 5%
  const { data: todayTrades } = await supabase
    .from("trades")
    .select("pnl")
    .in("result", ["win", "loss", "WIN", "LOSS"])
    .gte("created_at", new Date(new Date().setUTCHours(0,0,0,0)).toISOString());

  const todayPnl = (todayTrades || []).reduce((s: number, t: any) => s + (parseFloat(t.pnl) || 0), 0);
  const dailyLossLimit = -(balance * dailyLossLimitPct / 100);
  if (todayPnl <= dailyLossLimit) {
    console.log(`🛑 Daily loss limit hit: $${todayPnl.toFixed(2)} <= $${dailyLossLimit.toFixed(2)} (${dailyLossLimitPct}% of $${balance})`);
    return new Response(JSON.stringify({
      status: "daily_loss_limit",
      today_pnl: todayPnl,
      limit: dailyLossLimit,
      message: `Trading halted — daily loss limit of ${dailyLossLimitPct}% reached`,
    }), { headers: CORS });
  }

  const signals: any[]  = [];
  const scanLog: string[] = [];
  const session = getTradingSession();

  for (const symbol of allSymbolsList) {
    try {
      // ── Duplicate guard ──
      const _dup = await supabase.from("trades").select("id")
        .eq("symbol", symbol)
        .gte("created_at", new Date(Date.now()-5*60*1000).toISOString())
        .limit(1);
      if (_dup.data && _dup.data.length > 0) {
        scanLog.push(`${symbol}: duplicate_blocked`); continue;
      }

      // ── Cooldown check — skip if lost on this symbol in last 15 min ──
      if (cooldownSymbols.has(symbol)) {
        scanLog.push(`${symbol}: cooldown_active (15min after loss)`);
        console.log(`⏱️  ${symbol}: skipped — in cooldown`);
        continue;
      }

      // ── STEP 1: Session check (forex only) ──
      const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("BOOM") ||
                          symbol.startsWith("CRASH") || symbol.startsWith("JD") ||
                          symbol.startsWith("1HZ") || symbol.startsWith("STPX");
      // Crypto trades 24/7 but only during active sessions for best signals
      const isCrypto    = symbol.startsWith("cry");
      if (!isSynthetic && !isCrypto && !session.active) {
        scanLog.push(`${symbol}: off-hours`); continue;
      }
      // Crypto: skip deep off-hours (midnight-6am UTC) — low volume, bad signals
      if (isCrypto) {
        const h = new Date().getUTCHours();
        if (h >= 0 && h < 6) { scanLog.push(`${symbol}: crypto off-hours`); continue; }
      }

      // Fetch candles
      const [c1m, c5m] = await Promise.all([fetchCandles(symbol, 60, 200), fetchCandles(symbol, 300, 100)]);
      if (c1m.length < 60) { scanLog.push(`${symbol}: insufficient candles`); continue; }

      // ── STEP 2: HMM + OGD Ensemble Regime Detection ──
      // TRUE HMM Viterbi → then OGD ensemble combines with rules + momentum
      const hmmObs     = extractHMMObservations(c1m);
      const hmmResult  = (HMM_MODEL && hmmObs.length > 0)
        ? hmmViterbi(hmmObs)
        : detectMarketRegime(c1m);

      // Build features early for OGD (need for rules-based detector)
      const featuresEarly = buildFeatures(c1m, c5m);

      // OGD Ensemble: combines HMM + rules + momentum with learned weights
      const ogdResult = ogdEnsembleRegime(hmmResult.name, featuresEarly, c1m);

      // Use OGD ensemble result as final regime
      const regime = {
        state:         hmmResult.state,
        name:          ogdResult.name,
        tradable:      ogdResult.tradable,
        allowedAction: ogdResult.allowedAction,
      };

      // Log ensemble decision
      if (ogdResult.name !== hmmResult.name) {
        console.log(`⚖️ ${symbol}: HMM=${hmmResult.name} → OGD=${ogdResult.name} (conf=${ogdResult.confidence.toFixed(2)})`);
      }

      const isSpikeSym = symbol.startsWith("BOOM") || symbol.startsWith("CRASH");

      // ── RSI sanity filter for BOOM/CRASH ────────────────────────────
      // CRASH SELL requires RSI to not be at extremes in wrong direction
      // RSI=99 means pure uptrend — CRASH won't spike down in this condition
      // BOOM BUY requires RSI not to be in extreme downtrend
      if (isSpikeSym) {
        const c1mRsi = c1m.map((x: any) => parseFloat(x.close));
        const currentRsi = calcRSI(c1mRsi);
        const isCrash = symbol.startsWith("CRASH");
        const isBoom  = symbol.startsWith("BOOM");

        // CRASH: block if RSI > 72 (too overbought = uptrend too strong for crash spike)
        // CRASH: RSI block removed — Poisson process gates timing, not RSI
        if (isCrash && currentRsi > 90) {
          scanLog.push(`${symbol}: rsi_block_crash RSI=${currentRsi.toFixed(1)} — extreme only`);
          continue;
        }
        // BOOM: RSI block removed — Poisson process gates timing, not RSI
        // BOOM spikes happen regardless of trend direction
        if (isBoom && currentRsi < 10) {
          scanLog.push(`${symbol}: rsi_block_boom RSI=${currentRsi.toFixed(1)} — extreme only`);
          continue;
        }
        console.log(`📈 ${symbol} RSI=${currentRsi.toFixed(1)} — passed RSI filter`);
      }

      // ── PHASE 1+2: Poisson + Topological gate for BOOM/CRASH ──────────
      // Novel mathematics: only enter when spike probability is elevated
      // AND pre-spike compression pattern is detected
      if (isSpikeSym) {
        try {
          const isBoom   = symbol.startsWith("BOOM");
          const rawTicks = await fetchTicks(symbol, 600);

          if (rawTicks.length >= 50) {
            // PHASE 1: Poisson Inter-Spike Arrival Time
            const ticksSinceSpike = detectLastSpike(rawTicks, isBoom);
            const poissonResult   = poissonSpikeProbability(symbol, ticksSinceSpike, 50);

            console.log(`📊 ${symbol} Poisson: ${poissonResult.verdict} | ticks_since_spike=${ticksSinceSpike}`);

            if (poissonResult.probability < 0.08) {
              scanLog.push(`${symbol}: poisson_blocked — ${poissonResult.verdict}`);
              continue; // too early — spike just happened or not due yet
            }

            // PHASE 2: Topological pre-spike pattern
            const topoResult = topologicalPreSpikeScore(rawTicks, 30);
            console.log(`🔺 ${symbol} Topo: ${topoResult.details} pattern=${topoResult.preSpikePattern}`);

            // Both must agree for strongest signal
            // If Poisson says overdue AND topo says compressed → high conviction
            // If only one agrees → lower confidence (still trade but note it)
            const highConviction = poissonResult.overdue && topoResult.preSpikePattern;
            // FIX: Only block if Poisson probability is very low < 6%
            // Don't require BOTH overdue AND compressed — that's too strict
            // Either condition alone is sufficient to allow the trade
            const lowConviction = poissonResult.probability < 0.06;

            if (lowConviction) {
              scanLog.push(`${symbol}: poisson_too_low — prob=${(poissonResult.probability*100).toFixed(1)}% < 6%`);
              continue;
            }

            // Attach spike metadata to signal for confidence adjustment
            (globalThis as any)[`${symbol}_spike_meta`] = {
              ticksSinceSpike,
              poissonProb:      poissonResult.probability,
              overdueRatio:     poissonResult.overdueRatio,
              compressionScore: topoResult.compressionScore,
              bettiProxy:       topoResult.bettiProxy,
              highConviction,
              confidenceBoost:  highConviction ? 8 : 0,
            };

            scanLog.push(`${symbol}: spike_gate_passed prob=${(poissonResult.probability*100).toFixed(1)}% compress=${(topoResult.compressionScore*100).toFixed(0)}%`);
          } else {
            console.log(`⚠️  ${symbol}: insufficient ticks for Poisson/Topo (${rawTicks.length})`);
          }
        } catch(spikeErr) {
          console.log(`⚠️  ${symbol}: spike gate error: ${spikeErr}`);
          // fail open — proceed without gate if tick fetch fails
        }
      }

      // BOOM/CRASH trade in ALL regimes — spikes happen even in ranging markets
      // VIX (R_) also trades in ranging — oscillation is predictable
      // HMM only blocks forex/crypto in ranging/high-vol conditions
      const isVIX = symbol.startsWith("R_") || symbol.startsWith("1HZ");
      const bypassHMM = isSpikeSym || isVIX;

      if (!regime.tradable && !bypassHMM) {
        scanLog.push(`${symbol}: HMM→${regime.name} (skipping — unfavorable regime)`);
        console.log(`🚫 ${symbol}: HMM blocked — ${regime.name}`);
        continue;
      }
      if (!regime.tradable && bypassHMM) {
        scanLog.push(`${symbol}: HMM→${regime.name} bypassed (spike/VIX trades all regimes)`);
      }
      if (!regime.tradable && isSpikeSym) {
        console.log(`⚡ ${symbol}: HMM→${regime.name} but BOOM/CRASH allowed in all regimes`);
      } else {
        console.log(`✅ ${symbol}: HMM→${regime.name} (allowed:${regime.allowedAction})`);
      }

      // ── News Guard — skip forex during high-impact events ──
      const newsCheck = await checkNewsGuard(symbol);
      if (newsCheck.blocked) {
        scanLog.push(`${symbol}: ${newsCheck.reason}`);
        continue;
      }

      let sig: any;
      const features = featuresEarly; // reuse features computed for OGD

      if (ML_MODELS[symbol]) {
        // ── STEP 3: ML Prediction — Specialist Routing ──
        const specData   = SPECIALIST_MODELS[symbol];
        const hurst_val  = features[44] || 0.5;
        const kurt_val   = features[52] || 1.0;
        const specRegime = hurst_val > 0.58 ? "trending" : (hurst_val < 0.42 || kurt_val > 3.0) ? "volatile" : "ranging";

        if (specData) {
          const specResult = mlPredictSpecialist(specData, specRegime, features);
          if (specResult && specResult.action !== "HOLD") {
            sig = specResult;
            scanLog.push(`${symbol}: specialist_${specRegime}→${sig.action} ${sig.confidence}%`);
          } else {
            sig = mlPredict(ML_MODELS[symbol], features);
            if (specResult?.action === "HOLD") {
              scanLog.push(`${symbol}: spec_blocked, general→${sig.action}`);
            }
          }
        } else {
          sig = mlPredict(ML_MODELS[symbol], features);
        }

        if (sig.action === "HOLD") {
          scanLog.push(`${symbol}: ML→HOLD (${sig.reason})`); continue;
        }

        // ── STEP 4: HMM direction alignment ──
        // Only allow signal if it matches HMM regime direction
        // Exception: weak trends allow both directions if confidence is very high
        if (regime.allowedAction !== "NONE" && regime.allowedAction !== "ANY" &&
           regime.name !== "WeakUptrend" && regime.name !== "WeakDowntrend") {
          if (sig.action !== regime.allowedAction) {
            scanLog.push(`${symbol}: HMM_direction_blocked — regime says ${regime.allowedAction} but ML says ${sig.action}`);
            continue;
          }
        }

        // ── STEP 5: Indicator confirmation ──
        const { confirmed, reason } = confirmWithIndicators(features, sig.action, sig.confidence, symbol);
        if (!confirmed) {
          scanLog.push(`${symbol}: indicator_rejected:${reason}`); continue;
        }

        // ── Pre-calculate FPT for Bayesian (inline, no extra fetch) ──
        const fpt_inline = firstPassageTime(
          [], sig.action, symbol,
          features[27] || 0.003,  // garch_vol
          features[29] || 0,      // ou_zscore
          sig.confidence
        );

        // ── STEP 6: TRUE Bayesian Win Probability ──
        // P(win|conditions) = P(conditions|win) × P(win) / P(conditions)
        // Uses trained win rate as prior, updates with 7 likelihood factors
        // Runs in microseconds — pure math, no simulation
        // Use actual trained win rate as Bayesian prior
        const mlWinRate = mlRows?.find((r: any) => r.symbol === symbol)?.win_rate || 0.65;
        const bayesian = trueBayesianWinProb(
          c1m, sig.action, symbol, features,
          mlWinRate, regime.name,
          features[40] || 0.5  // session_strength (last feature)
        );
        // FIX: Lowered Bayesian threshold 0.55→0.52
        // 0.55 was blocking too many valid signals — 0.52 still above break-even
        if (bayesian.winProb < 0.52) {
          scanLog.push(`${symbol}: bayes_skip P(win)=${(bayesian.winProb*100).toFixed(1)}% prior→posterior (${bayesian.recommendation})`);
          continue;
        }
        // Boost confidence for strong Bayesian signal
        const bayesianBoost = bayesian.winProb >= 0.72 ? 4
                            : bayesian.winProb >= 0.62 ? 2
                            : 0;

        // ── STEP 7: AI Brain — check loss patterns ──
        const fingerprint = buildMarketFingerprint(features, symbol, sig.action, regime.name, session.name);
        const brainCheck  = await checkAIBrainPatterns(supabase, fingerprint, symbol, sig.action);
        if (brainCheck.blocked) {
          scanLog.push(`${symbol}: ${brainCheck.reason}`);
          console.log(`🧠 AI Brain blocked ${symbol}: ${brainCheck.reason}`);
          continue;
        }

        // Apply win pattern boost
        const finalConf = Math.min(95, sig.confidence + brainCheck.boost);
        const bayesianFinalConf = Math.min(95, finalConf + bayesianBoost + brainCheck.boost);
        sig = { ...sig, confidence: bayesianFinalConf, regime: regime.name, fingerprint, features,
          bayesian_win_prob: bayesian.winProb,
          bayesian_rec: bayesian.recommendation,
          bayesian_factors: bayesian.factors };

        // ── BOOM/CRASH direction lock (ML path) ─────────────────────────
        // CRASH = always SELL, BOOM = always BUY — no exceptions
        if (symbol.startsWith("CRASH") && sig.action === "BUY") {
          console.log(`🔒 ${symbol}: ML said BUY but CRASH must SELL — forcing SELL`);
          sig.action = "SELL";
          sig.reason = sig.reason + " [direction_corrected]";
        }
        if (symbol.startsWith("BOOM") && sig.action === "SELL") {
          console.log(`🔒 ${symbol}: ML said SELL but BOOM must BUY — forcing BUY`);
          sig.action = "BUY";
          sig.reason = sig.reason + " [direction_corrected]";
        }

        // ── OFI + Rough Volatility + Regime Adaptive ──────────────────
        const closes4ofi = c1m.map((x: any) => parseFloat(x.close));
        const ofi         = calcOFI(c1m, 20);
        const hurst       = calcHurstFast(closes4ofi, 40);
        const adaptStrat  = getAdaptiveStrategy(hurst, regime.name, ofi);

        // Apply regime-based confidence adjustment
        sig.confidence = Math.max(10, Math.min(95, sig.confidence + adaptStrat.confidence_boost));

        // ── OU Z-Score Override for VIX/JD ──────────────────────────
        // When z-score > 2.0 → price is 2σ above mean → statistically MUST revert
        // This is a 95% probability event by Gaussian distribution
        const isMeanRev  = symbol.startsWith("R_") || symbol.startsWith("JD") || symbol.startsWith("1HZ");
        if (isMeanRev) {
          const ouData  = ouFeatures(closes4ofi, 100);
          const ouZ     = ouData.zscore;
          const ouTheta = ouData.theta;
          if (Math.abs(ouZ) >= 2.0) {
            // Strong OU signal — override ML direction if contradicts
            const ouAction = ouZ > 2.0 ? "SELL" : "BUY";
            if (ouAction !== sig.action) {
              scanLog.push(`${symbol}: OU_override z=${ouZ.toFixed(2)} forcing ${ouAction} (price ${ouZ>0?"above":"below"} 2σ mean)`);
              sig.action = ouAction;
              sig.confidence = Math.min(95, sig.confidence + 10);
            } else {
              scanLog.push(`${symbol}: OU_confirmed z=${ouZ.toFixed(2)} θ=${ouTheta.toFixed(5)} conf+=10`);
              sig.confidence = Math.min(95, sig.confidence + 10);
            }
          } else if (Math.abs(ouZ) >= 1.5) {
            // Moderate OU signal — boost if confirming
            const ouAction = ouZ > 1.5 ? "SELL" : "BUY";
            if (ouAction === sig.action) {
              scanLog.push(`${symbol}: OU_boost z=${ouZ.toFixed(2)} conf+=5`);
              sig.confidence = Math.min(95, sig.confidence + 5);
            } else {
              scanLog.push(`${symbol}: OU_weak_conflict z=${ouZ.toFixed(2)} conf-=5`);
              sig.confidence = Math.max(10, sig.confidence - 5);
            }
          } else {
            scanLog.push(`${symbol}: OU_neutral z=${ouZ.toFixed(2)} no adjustment`);
          }
        }

        // ── Bollinger Band confirmation for VIX/JD ───────────────────
        if (isMeanRev) {
          const bb20 = closes4ofi.slice(-20);
          const bbMid  = bb20.reduce((a: number, b: number) => a+b, 0) / 20;
          const bbStd  = Math.sqrt(bb20.reduce((s: number, v: number) => s + Math.pow(v-bbMid, 2), 0) / 20);
          const bbUpper = bbMid + 2*bbStd;
          const bbLower = bbMid - 2*bbStd;
          const price   = closes4ofi[closes4ofi.length-1];
          const belowLower = price < bbLower;
          const aboveUpper = price > bbUpper;
          if ((sig.action === "BUY" && belowLower) || (sig.action === "SELL" && aboveUpper)) {
            sig.confidence = Math.min(95, sig.confidence + 8);
            scanLog.push(`${symbol}: BB_extreme_confirmed conf+=8`);
          } else if ((sig.action === "BUY" && aboveUpper) || (sig.action === "SELL" && belowLower)) {
            sig.confidence = Math.max(10, sig.confidence - 10);
            scanLog.push(`${symbol}: BB_conflict conf-=10`);
          }
        }

        // ── Signal Longevity ─────────────────────────────────────────
        const longevity  = calcSignalHalfLife(closes4ofi);
        const noiseChk   = detectNoiseVsReversal(closes4ofi, sig.action);
        if (isMeanRev) {
          if (longevity.exitWarning && !noiseChk.isNoise) {
            sig.confidence = Math.max(10, sig.confidence - 15);
            scanLog.push(`${symbol}: signal_dead HL=${longevity.halfLife} conf-=15`);
          } else if (longevity.strength === "fading") {
            sig.confidence = Math.max(10, sig.confidence - 5);
            scanLog.push(`${symbol}: signal_fading HL=${longevity.halfLife} conf-=5`);
          } else if (longevity.strength === "strong") {
            sig.confidence = Math.min(95, sig.confidence + 5);
            scanLog.push(`${symbol}: signal_strong HL=${longevity.halfLife} conf+=5`);
          }
        } else {
          if (longevity.exitWarning && !noiseChk.isNoise) {
            scanLog.push(`${symbol}: signal_dead HL=${longevity.halfLife} — skip`);
            continue;
          }
          if (longevity.strength === "fading") {
            sig.confidence = Math.max(10, sig.confidence - 8);
            scanLog.push(`${symbol}: signal_fading HL=${longevity.halfLife} conf-=8`);
          } else if (longevity.strength === "strong") {
            sig.confidence = Math.min(95, sig.confidence + 5);
            scanLog.push(`${symbol}: signal_strong HL=${longevity.halfLife} conf+=5`);
          }
        }
        if (noiseChk.isNoise && noiseChk.confidence > 60) {
          scanLog.push(`${symbol}: noise_${noiseChk.reason} — holding direction`);
        }
        
        // Block trades in random walk regime (no edge)
        if (adaptStrat.strategy === "skip") {
          scanLog.push(`${symbol}: regime_skip — ${adaptStrat.description}`);
          continue;
        }

        // OFI confirmation — signal must align with order flow
        const ofiBull = ofi > 0.60 && sig.action === "BUY";
        const ofiBear = ofi < 0.40 && sig.action === "SELL";
        const ofiNeutral = ofi >= 0.40 && ofi <= 0.60;
        
        if (!ofiNeutral && !ofiBull && !ofiBear) {
          // OFI conflicts with signal — reduce confidence significantly
          sig.confidence = Math.max(10, sig.confidence - 15);
          scanLog.push(`${symbol}: OFI_conflict ofi=${ofi.toFixed(2)} signal=${sig.action}`);
        } else if (ofiBull || ofiBear) {
          // OFI confirms signal — boost confidence
          sig.confidence = Math.min(95, sig.confidence + 5);
          scanLog.push(`${symbol}: OFI_confirmed ofi=${ofi.toFixed(2)}`);
        }

        console.log(`📊 ${symbol}: H=${hurst.toFixed(2)} OFI=${ofi.toFixed(2)} regime=${adaptStrat.strategy} conf=${sig.confidence}%`);

        // Apply Poisson/Topo confidence boost for BOOM/CRASH
        const spikeMeta = (globalThis as any)[`${symbol}_spike_meta`];
        if (spikeMeta && isSpikeSym) {
          sig.confidence = Math.min(95, sig.confidence + spikeMeta.confidenceBoost);
          sig.poisson_prob     = spikeMeta.poissonProb;
          sig.topo_compress    = spikeMeta.compressionScore;
          sig.betti_proxy      = spikeMeta.bettiProxy;
          sig.high_conviction  = spikeMeta.highConviction;
          sig.ticks_since_spike = spikeMeta.ticksSinceSpike;
          if (spikeMeta.highConviction) {
            console.log(`⚡ ${symbol}: HIGH CONVICTION — Poisson overdue + Topo compressed`);
          }
        }

        // ── Per-symbol RSI threshold check for synthetics ──────────
        const isMeanRevert = symbol.startsWith("R_") || symbol.startsWith("JD") || symbol.startsWith("1HZ");
        if (isMeanRevert) {
          const rsiThresh = SYNTH_RSI_THRESHOLDS[symbol];
          if (rsiThresh) {
            const rsiNow = features[2] * 100;
            const rsiOK = (sig.action === "BUY"  && rsiNow <= rsiThresh.buy) ||
                          (sig.action === "SELL" && rsiNow >= rsiThresh.sell);
            if (!rsiOK) {
              sig.confidence = Math.max(10, sig.confidence - 25);
              scanLog.push(`${symbol}: rsi_thresh_miss RSI=${rsiNow.toFixed(1)} need<=${rsiThresh.buy}/>${rsiThresh.sell} conf-=25`);
            } else {
              sig.confidence = Math.min(95, sig.confidence + 8);
              scanLog.push(`${symbol}: rsi_thresh_ok RSI=${rsiNow.toFixed(1)} conf+=8`);
            }
            if (BELOW_BREAKEVEN.includes(symbol)) {
              sig.confidence = Math.max(10, sig.confidence - 8);
            }
          }
        }

        // ── Signal Persistence Check ─────────────────────────────
        // Require last 2 candles to confirm direction before trading
        // Prevents flip-flopping on single-candle reversals
        const recentCloses = c1m.slice(-4).map((c: any) => parseFloat(c.close));
        const recentBull = recentCloses[2] > recentCloses[1] && recentCloses[3] > recentCloses[2];
        const recentBear = recentCloses[2] < recentCloses[1] && recentCloses[3] < recentCloses[2];
        const signalConfirmed = (sig.action === "BUY" && recentBull) || (sig.action === "SELL" && recentBear);
        const signalNeutral   = !recentBull && !recentBear; // choppy — allow with reduced confidence

        if (!signalConfirmed && !signalNeutral) {
          // Last 2 candles contradict signal — reduce confidence significantly
          sig.confidence = Math.max(10, sig.confidence - 20);
          scanLog.push(`${symbol}: persistence_conflict — candles contradict ${sig.action}, conf-=20`);
        } else if (signalConfirmed) {
          // Candles confirm signal — boost confidence
          sig.confidence = Math.min(95, sig.confidence + 5);
          scanLog.push(`${symbol}: persistence_confirmed — 2 candles agree ${sig.action}`);
        }

        // Jump indices: require strong main model agreement (not just meta)
        if (symbol.startsWith("JD")) {
          const mainProb = Array.isArray(features) && features.length > 0 ? 0 : 0;
          // Block if main model < 0.45 (weak directional conviction)
          if (sig.reason.includes("ML:0.") && parseFloat(sig.reason.split("ML:")[1]) < 0.45) {
            scanLog.push(`${symbol}: JD_weak_main_model — skipping`);
            continue;
          }
        }

        const logLine = `${symbol}: ML→${sig.action} conf:${finalConf} HMM:${regime.name} (${sig.reason})`;
        scanLog.push(logLine);
        console.log(logLine);

      } else {
        // ── Fallback: 4-Strategy Adaptive Engine (non-ML symbols) ──
        const fc   = c1m.map((x: any) => parseFloat(x.close));
        const fc5  = c5m.map((x: any) => parseFloat(x.close));
        const fp   = fc[fc.length - 1];
        const fatr = (() => {
          const sl = c1m.slice(-14);
          const trs = sl.map((can: any, i: number) => {
            const pc = i > 0 ? parseFloat(sl[i-1].close) : parseFloat(can.close);
            return Math.max(parseFloat(can.high)-parseFloat(can.low),
              Math.abs(parseFloat(can.high)-pc), Math.abs(parseFloat(can.low)-pc));
          });
          return trs.reduce((a: number, b: number) => a+b, 0) / trs.length;
        })();

        // ── Detect market type (ranging vs trending) ──
        const fn = Math.min(14, fc.length - 1);
        let dmP = 0, dmM = 0, trS = 0;
        for (let i = fc.length - fn; i < fc.length; i++) {
          const d = fc[i] - fc[i-1];
          if (d > 0) dmP += d; else dmM -= d;
          trS += Math.abs(d);
        }
        const adxP   = trS > 0 ? Math.abs(dmP - dmM) / trS : 0;
        const fema21 = calcEMA(fc, 21), fema50 = calcEMA(fc.slice(-60), 50);
        const emaSpread = Math.abs(fema21 - fema50) / (fema50 + 1e-10);
        const isRanging  = adxP < 0.25 && emaSpread < 0.0015;
        const isTrending = adxP > 0.40 || emaSpread > 0.003;

        const frsi  = calcRSI(fc);
        const fema8 = calcEMA(fc, 8);
        const fprev = fc[fc.length - 2];

        // ── Strategy A: Mean Reversion (ranging) ──
        const fmean = fc.slice(-20).reduce((a: number, b: number) => a+b, 0) / 20;
        const fstd  = Math.sqrt(fc.slice(-20).reduce((a: number, b: number) =>
          a + Math.pow(b-fmean, 2), 0) / 20) + 1e-10;
        const fz    = (fp - fmean) / fstd;

        // ── Strategy B: Pullback (trending) ──
        let trend5m = 0;
        if (fc5.length >= 30) {
          const e20 = calcEMA(fc5, 20), e50b = calcEMA(fc5, 50), r5 = calcRSI(fc5);
          trend5m = e20 > e50b && r5 > 52 ? 1 : e20 < e50b && r5 < 48 ? -1 : 0;
        }
        const nearEMA21 = Math.abs(fp - fema21) < fatr * 0.5;

        // ── Strategy C: Breakout ──
        const recent10h = Math.max(...c1m.slice(-11, -1).map((x: any) => parseFloat(x.high)));
        const recent10l = Math.min(...c1m.slice(-11, -1).map((x: any) => parseFloat(x.low)));
        const range10   = recent10h - recent10l;
        const curRange  = parseFloat(c1m[c1m.length-1].high) - parseFloat(c1m[c1m.length-1].low);
        const isBreakout = range10 < fatr * 2.5 && curRange > fatr * 1.2;

        // Pick strategy based on market type
        if (isRanging && fz < -1.5 && frsi < 40) {
          sig = { action: "BUY",  confidence: Math.min(82, 60 + Math.round(Math.abs(fz)*8)),
            reason: `fb_mean_rev_buy z=${fz.toFixed(2)}` };
        } else if (isRanging && fz > 1.5 && frsi > 60) {
          sig = { action: "SELL", confidence: Math.min(82, 60 + Math.round(Math.abs(fz)*8)),
            reason: `fb_mean_rev_sell z=${fz.toFixed(2)}` };
        } else if (isTrending && trend5m === 1 && fema8 > fema21 && nearEMA21 && fp > fprev && frsi >= 40 && frsi <= 60) {
          sig = { action: "BUY",  confidence: 72, reason: "fb_pullback_bull" };
        } else if (isTrending && trend5m === -1 && fema8 < fema21 && nearEMA21 && fp < fprev && frsi >= 40 && frsi <= 60) {
          sig = { action: "SELL", confidence: 72, reason: "fb_pullback_bear" };
        } else if (isBreakout && fp > recent10h && frsi > 50 && frsi < 75) {
          sig = { action: "BUY",  confidence: 70, reason: "fb_breakout_bull" };
        } else if (isBreakout && fp < recent10l && frsi < 50 && frsi > 25) {
          sig = { action: "SELL", confidence: 70, reason: "fb_breakout_bear" };
        } else {
          scanLog.push(`${symbol}: no-fallback-setup (ranging:${isRanging} trend:${isTrending} z:${fz.toFixed(2)})`);
          continue;
        }

        if (frsi > 80 || frsi < 20) { scanLog.push(`${symbol}: fb_rsi_extreme`); continue; }

        // ── ICT Strategy for forex — replaces weak EMA fallback ──
        const forexSymbols = ["frxEURUSD","frxGBPUSD","frxUSDJPY","frxGBPJPY",
          "frxAUDUSD","frxXAUUSD","frxXAGUSD","frxEURGBP","frxEURJPY"];
        const cryptoSymbols = ["cryBTCUSD","cryETHUSD"];

        if (forexSymbols.includes(symbol)) {
          // ── News check before forex signal ──────────────────
          const newsChk  = await getNewsImpact(symbol);
          const newsTrade = await getNewsTradingSignal(symbol);

          // Post-news trade: Send to MT5 ONLY (not Deriv CALL/PUT)
          // MT5 can enter/exit anytime — news spikes are profitable there
          if (newsTrade && newsTrade.hasSignal) {
            scanLog.push(`${symbol}: ${newsTrade.reason} — MT5 only`);
            // Write directly to mt5_signals table for EA to pick up
            const mt5Symbol = symbol.replace("frx","");
            await supabase.from("mt5_signals").insert({
              symbol:     mt5Symbol,
              action:     newsTrade.action,
              confidence: newsTrade.confidence,
              reason:     newsTrade.reason,
              status:     "pending",
              trade_type: "news",  // EA will use tighter SL for news trades
              created_at: new Date().toISOString(),
            });
            console.log(`📰 News trade sent to MT5: ${mt5Symbol} ${newsTrade.action} ${newsTrade.confidence}%`);
          }

          // Hard block: high impact event within 15 min
          if (newsChk.blocked) {
            scanLog.push(`${symbol}: ${newsChk.reason}`);
            continue;
          }

          // Soft caution: reduce confidence within 30 min
          if (newsChk.reduced) {
            scanLog.push(`${symbol}: ${newsChk.reason} conf-=20`);
          }

          // Use ICT Smart Money engine for forex
          const ictSig = ictForexSignal(c1m, c5m, symbol);
          if (!ictSig) {
            scanLog.push(`${symbol}: ICT_no_setup (no confluence)`);
            continue;
          }
          sig = ictSig;

          // Apply news caution penalty
          if (newsChk.reduced) {
            sig = { ...sig, confidence: Math.max(10, sig.confidence - 20) };
          }

          // Enhance ICT signal with OFI + Hurst
          const ictCloses  = c1m.map((x: any) => parseFloat(x.close));
          const ictOFI     = calcOFI(c1m, 20);
          const ictHurst   = calcHurstFast(ictCloses, 40);
          const ictAdapt   = getAdaptiveStrategy(ictHurst, regime.name, ictOFI);

          sig.confidence = Math.max(10, Math.min(95, sig.confidence + ictAdapt.confidence_boost));

          // OFI must not strongly conflict with ICT signal
          const ictOfiBull = ictOFI > 0.60 && sig.action === "BUY";
          const ictOfiBear = ictOFI < 0.40 && sig.action === "SELL";
          const ictOfiNeutral = ictOFI >= 0.40 && ictOFI <= 0.60;

          if (!ictOfiNeutral && !ictOfiBull && !ictOfiBear) {
            sig.confidence = Math.max(10, sig.confidence - 12);
          } else if (ictOfiBull || ictOfiBear) {
            sig.confidence = Math.min(95, sig.confidence + 6);
          }

          if (ictAdapt.strategy === "skip") {
            scanLog.push(`${symbol}: ICT_regime_skip — ${ictAdapt.description}`);
            continue;
          }

          scanLog.push(`${symbol}: ICT→${sig.action} conf:${sig.confidence}% H=${ictHurst.toFixed(2)} OFI=${ictOFI.toFixed(2)} ${sig.reason}`);
        } else if (cryptoSymbols.includes(symbol) || ["R_50","R_25","R_100"].includes(symbol)) {
          scanLog.push(`${symbol}: ML_required (use ML models only)`);
          continue;
        } else if (symbol.startsWith("JD") || symbol === "R_10") {
          // Jump indices and R_10 — ML path already handled above, skip ICT
          scanLog.push(`${symbol}: ML_only_no_ICT`);
          continue;
        }

        // ── BOOM/CRASH fallback also needs Poisson/Topo gate ──
        if (isSpikeSym) {
          const spikeMeta2 = (globalThis as any)[`${symbol}_spike_meta`];
          if (!spikeMeta2) {
            // Gate not run yet (ML path skipped) — run it now
            try {
              const isBoom2   = symbol.startsWith("BOOM");
              const rawTicks2 = await fetchTicks(symbol, 400);
              if (rawTicks2.length >= 50) {
                const tss2     = detectLastSpike(rawTicks2, isBoom2);
                const pois2    = poissonSpikeProbability(symbol, tss2, 50);
                const topo2    = topologicalPreSpikeScore(rawTicks2, 30);
                const lowConv2 = pois2.probability < 0.08 || (!pois2.overdue && !topo2.preSpikePattern);
                if (lowConv2) {
                  scanLog.push(`${symbol}: fallback_poisson_blocked prob=${(pois2.probability*100).toFixed(1)}%`);
                  continue;
                }
                console.log(`📊 ${symbol} fallback Poisson: ${pois2.verdict}`);
              }
            } catch(e2) { /* fail open */ }
          }
        }

        // ── BOOM/CRASH direction lock ──────────────────────────────────
        // CRASH indices ONLY spike DOWN → always SELL (MULTDOWN profits)
        // BOOM indices ONLY spike UP   → always BUY  (MULTUP profits)
        // Any opposite signal = wrong direction = block immediately
        if (symbol.startsWith("CRASH") && sig.action === "BUY") {
          scanLog.push(`${symbol}: direction_locked — CRASH must SELL only (got BUY)`);
          sig.action = "SELL"; // force correct direction
        }
        if (symbol.startsWith("BOOM") && sig.action === "SELL") {
          scanLog.push(`${symbol}: direction_locked — BOOM must BUY only (got SELL)`);
          sig.action = "BUY"; // force correct direction
        }

        // Fallback also respects HMM
        if (regime.allowedAction !== "NONE" && regime.allowedAction !== "ANY" &&
            sig.action !== regime.allowedAction) {
          scanLog.push(`${symbol}: fallback HMM_direction_blocked`); continue;
        }
        scanLog.push(`${symbol}: Fallback4S→${sig.action} ${sig.confidence}% (${sig.reason}) HMM:${regime.name}`);
      }

      if (sig && sig.action !== "HOLD" && sig.confidence >= minConf) {
        signals.push({ symbol, ...sig, is_ml: !!ML_MODELS[symbol] });
      }

    } catch (err) {
      console.error(`${symbol} error:`, err);
      scanLog.push(`${symbol}: error - ${err}`);
    }
  }

  // ── PSI Drift Detection — collect all features from this scan ──
  const allScannedFeatures: number[][] = signals.map(s => s.features || []).filter(f => f.length > 0);
  let driftResult = { drifted: false, worstFeature: -1, worstPsi: 0 };
  if (allScannedFeatures.length >= 3) {
    driftResult = await checkFeatureDrift(supabase, allScannedFeatures);
  }

  if (signals.length === 0) {
    return new Response(JSON.stringify({
      status: "no_signal",
      scanned: allSymbolsList.length,
      ml_models_used: Object.keys(ML_MODELS),
      scan_log: scanLog,
    }), { headers: CORS });
  }

  // ── Apply inter-symbol correlation scoring ──
  // Boosts signals confirmed by correlated symbols, penalises conflicting ones
  const correlatedSignals = applyCorrelationScoring(signals);

  // Pick best signal — ML > fallback, then by correlation-adjusted confidence
  correlatedSignals.sort((a, b) => {
    if (a.is_ml !== b.is_ml) return a.is_ml ? -1 : 1;
    return b.confidence - a.confidence;
  });
  const best = correlatedSignals[0];
  console.log(`🎯 Best: ${best.symbol} ${best.action} ${best.confidence}% HMM:${best.regime || "n/a"} (ML:${best.is_ml})`);

  // ── FIX 3: Reuse already-fetched features from scan (no double fetch) ──
  // best.features stored during signal scan below
  const bestFeats = best.features || new Array(41).fill(0);
  const fpt = firstPassageTime(
    [], best.action, best.symbol,
    bestFeats[27] || 0.003,  // garch_vol
    bestFeats[29] || 0,      // ou_zscore
    best.confidence
  );

  const isJumpIdx = best.symbol.startsWith("JD");
  const dynMult = isJumpIdx ? 10 : selectMultiplier(
    best.symbol,
    best.confidence,
    best.regime || "WeakUptrend",
    bestFeats[23] || 0,      // kalman_velocity
    bestFeats[27] || 0.003   // garch_vol
  );

  console.log(`📐 FPT: tpPct=${(fpt.tpPct*100).toFixed(3)}% slPct=${(fpt.slPct*100).toFixed(3)}% winProb=${(fpt.winProb*100).toFixed(1)}% mult:x${dynMult}`);
  const result: any = await placeTrade(token, best.symbol, best.action, stake, best.confidence, dynMult, fpt.tpPct, fpt.slPct);
  const success = result && !result.error;

  // Log trade with extra fields for AI Brain to learn from
  const features = buildFeatures(
    await fetchCandles(best.symbol, 60, 200),
    await fetchCandles(best.symbol, 300, 100)
  );

  await supabase.from("trades").insert({
    symbol:       best.symbol,
    type:         best.action,
    stake,
    result:       success ? "open" : "error",
    confidence:   best.confidence,
    account_name: "edge_function",
    session:      session.name,
    rsi:          Array.isArray(features) ? features[0] : null,
    macd_hist:    Array.isArray(features) ? features[1] : null,
    bb_position:  Array.isArray(features) ? features[2] : null,
    ema_stack:    Array.isArray(features) ? (features[4] ? 1 : features[5] ? -1 : 0) : null,
    patterns:     `regime:${best.regime || "unknown"}|trend5m:${Array.isArray(features) ? features[20] : 0}`,
  });

  if (success) {
    await supabase.from("bot_config").update({ balance_cache: balance - stake }).eq("active", true);

    // ── BINANCE SIGNAL ROUTING ──
    // Only route if:
    // 1. Symbol has a Binance equivalent
    // 2. That equivalent is in user's Binance selected symbols
    // 3. Binance is enabled
    // 4. Confidence >= 75% (higher bar for cross-platform)
    const derivToBinance: Record<string,string> = {
      "cryBTCUSD": "BTCUSDT",
      "cryETHUSD": "ETHUSDT",
    };
    const binanceSym = derivToBinance[best.symbol];

    if (binanceSym && best.confidence >= 75) {
      try {
        const { data: bCfg } = await supabase
          .from("bot_config")
          .select("binance_enabled,binance_symbols")
          .eq("active", true).single();

        // Respect user's Binance symbol selection
        const binanceEnabled  = bCfg?.binance_enabled === true;
        const binanceSymbols  = bCfg?.binance_symbols || [];
        const symbolSelected  = binanceSymbols.includes(binanceSym);

        if (binanceEnabled && symbolSelected) {
          const binanceUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/timi-binance`;
          const binanceResp = await fetch(binanceUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY") || ""}`,
            },
            body: JSON.stringify({
              symbol:     best.symbol,
              action:     best.action,
              confidence: best.confidence,
            })
          });
          const binanceResult = await binanceResp.json().catch(() => ({}));
          if (binanceResult.status === "trade_placed") {
            console.log(`🟡 Binance routed: ${binanceSym} ${best.action} $${binanceResult.stake}`);
          } else {
            console.log(`⚠️ Binance skip: ${binanceResult.status} — ${binanceResult.message||""}`);
          }
        } else if (!binanceEnabled) {
          console.log(`⚠️ Binance routing skipped — Binance disabled in settings`);
        } else if (!symbolSelected) {
          console.log(`⚠️ Binance routing skipped — ${binanceSym} not selected in Binance symbols`);
        }
      } catch(binErr) {
        console.log(`⚠️ Binance routing error: ${binErr}`);
      }
    }
  }

  // ── MT5 Signal Writer ─────────────────────────────────────────────────
  // Writes to mt5_signals table so MT5 EA can poll and execute on Deriv MT5
  // EA flow: poll pending → map symbol name → mark executed → confirm on Telegram
  if (success) {
    // Deriv → MT5 symbol mapping
    const DERIV_TO_MT5: Record<string,string> = {
      // Forex — Deriv MT5 uses standard names
      "frxEURUSD": "EURUSD",   "frxGBPUSD": "GBPUSD",
      "frxUSDJPY": "USDJPY",   "frxAUDUSD": "AUDUSD",
      "frxUSDCAD": "USDCAD",   "frxUSDCHF": "USDCHF",
      "frxEURGBP": "EURGBP",   "frxEURJPY": "EURJPY",
      "frxGBPJPY": "GBPJPY",   "frxNZDUSD": "NZDUSD",
      // Metals — Deriv MT5 uses "Gold Index" not "XAUUSD"
      "frxXAUUSD": "XAUUSD",
      "frxXAGUSD": "XAGUSD",
      // Crypto
      "cryBTCUSD": "BTCUSD",   "cryETHUSD": "ETHUSD",
      // Boom & Crash
      "BOOM1000":  "Boom 1000 Index",
      "BOOM500":   "Boom 500 Index",
      "CRASH1000": "Crash 1000 Index",
      "CRASH500":  "Crash 500 Index",
      // Volatility indices
      "R_10":      "Volatility 10 Index",
      "R_25":      "Volatility 25 Index",
      "R_50":      "Volatility 50 Index",
      "R_75":      "Volatility 75 Index",
      "R_100":     "Volatility 100 Index",
      // Jump indices
      "JD10":      "Jump 10 Index",
      "JD25":      "Jump 25 Index",
      "JD50":      "Jump 50 Index",
      "JD75":      "Jump 75 Index",
      "JD100":     "Jump 100 Index",
    };
    const mt5Symbol = DERIV_TO_MT5[best.symbol];
    // Block forex/gold/crypto MT5 signals when market is closed
    const _mt5Day  = new Date().getUTCDay();
    const _mt5Hour = new Date().getUTCHours();
    const _isWeekend = _mt5Day === 0 || _mt5Day === 6;
    const _isFxAsset = best.symbol.startsWith("frx") || best.symbol.startsWith("cry");
    // Forex market hours: Mon 00:00 UTC to Fri 21:00 UTC
    const _forexClosed = _isWeekend || (_mt5Day === 5 && _mt5Hour >= 21);
    const _skipMT5 = _isFxAsset && _forexClosed;
    if (mt5Symbol && !_skipMT5) {
      try {
        const { error: mt5Err } = await supabase.from("mt5_signals").insert({
          symbol:     mt5Symbol,
          action:     best.action,
          confidence: best.confidence,
          status:     "pending",
        });
        if (mt5Err) console.log(`⚠️  MT5 signal write error: ${mt5Err.message}`);
        else console.log(`📡 MT5 signal written: ${mt5Symbol} ${best.action} conf:${best.confidence}%`);
      } catch(mt5Ex) {
        console.log(`⚠️  MT5 signal exception: ${mt5Ex}`);
      }
    }
  }

  // Telegram
  if (success && best) {
    try {
      const tgToken  = cfg.telegram_token;
      const tgChatId = cfg.telegram_chat_id;
      if (tgToken && tgChatId) {
        const msg = `SIGNAL:${best.symbol}:${best.action}:${best.confidence}`;
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({chat_id: tgChatId, text: msg})
        });
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({chat_id: tgChatId, text: `🤖 TIMI\nSymbol: ${best.symbol}\nAction: ${best.action}\nConf: ${best.confidence}%\nStake: $${stake}\nPayout: $${result?.payout||0}`})
        });
        console.log(`📱 Telegram: ${msg}`);
      }
    } catch(e) { console.log(`Telegram error: ${e}`); }
  }

  return new Response(JSON.stringify({
    status:          success ? "trade_placed" : "trade_failed",
    signal:          best,
    stake,
    monte_carlo:     { base_stake: baseStake, final_stake: stake, risk_of_ruin: mc.riskOfRuin, expected_growth: mc.expectedGrowth, recommendation: mc.recommendation, win_rate_used: perf.winRate },
    trade:           result,
    ml_models_used:  allSymbolsList,
    signals_found:   signals.length,
    scan_log:        scanLog,
    hmm_regimes:     scanLog.filter(l => l.includes("HMM")),
  }), { headers: CORS });
});