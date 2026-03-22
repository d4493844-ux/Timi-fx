import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

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
    contrarian
  ]; // total: 56 features
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

function getTradingSession(): { active: boolean; name: string } {
  const h = new Date().getUTCHours();
  if (h >= 7 && h < 21) return { active: true, name: h < 16 ? "London" : "NewYork" };
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
          takeProfit = parseFloat((adjStake * dynMultiplier * fptTpPct).toFixed(2));
          stopLoss   = parseFloat(Math.min(adjStake * dynMultiplier * fptSlPct, adjStake * 0.9).toFixed(2));
          // Ensure TP is at least $0.10 and SL at least $0.10
          takeProfit = Math.max(takeProfit, 0.10);
          stopLoss   = Math.max(stopLoss, 0.10);
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
        resolve({ contract_id: contractId, stake_used: (ws as any)._adjStake, take_profit: (ws as any)._tp, stop_loss: (ws as any)._sl, tp_sl_set: true });
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
  const { data } = await supabase.from("trades").select("result").eq("account_name", "edge_function").order("created_at", { ascending: false }).limit(5);
  if (!data) return 0;
  let count = 0;
  for (const t of data) { if (t.result === "loss") count++; else break; }
  return count;
}


// ─────────────────────────────────────────────
// MONTE CARLO RISK SIMULATION
// Simulates 5000 possible sequences of next 20 trades
// to find optimal stake that maximizes growth while
// keeping risk of ruin below 5%
// ─────────────────────────────────────────────
function monteCarloStake(
  balance: number,
  baseStakePct: number,
  winRate: number,
  avgWinPct: number,   // avg win as % of stake (e.g. 0.85 for 85%)
  avgLossPct: number,  // avg loss as % of stake (e.g. 0.90 for 90%)
  minStake: number,
  maxStake: number
): { stake: number; riskOfRuin: number; expectedGrowth: number; recommendation: string } {
  const SIMULATIONS  = 5000;
  const HORIZON      = 20;   // next 20 trades
  const RUIN_THRESH  = 0.20; // account considered "ruined" if drops 20% from current

  let testPct = baseStakePct / 100;

  // Run simulations at current stake %
  let ruinCount  = 0;
  let totalGrowth = 0;

  for (let sim = 0; sim < SIMULATIONS; sim++) {
    let bal = balance;
    const ruinLevel = balance * (1 - RUIN_THRESH);
    let ruined = false;

    for (let t = 0; t < HORIZON; t++) {
      const stake = Math.max(minStake, Math.min(maxStake, bal * testPct));
      const win   = Math.random() < winRate;
      bal += win ? stake * avgWinPct : -(stake * avgLossPct);
      if (bal <= ruinLevel) { ruined = true; break; }
    }

    if (ruined) ruinCount++;
    totalGrowth += (bal - balance) / balance;
  }

  const riskOfRuin   = ruinCount / SIMULATIONS;
  const expectedGrowth = totalGrowth / SIMULATIONS;

  // If risk of ruin > 5%, reduce stake by 25%
  // If risk of ruin < 1% AND win rate > 60%, allow up to 25% stake increase
  let finalPct   = testPct;
  let recommendation = "normal";

  if (riskOfRuin > 0.10) {
    finalPct = testPct * 0.50;  // cut stake in half — dangerous conditions
    recommendation = "reduced_50pct";
  } else if (riskOfRuin > 0.05) {
    finalPct = testPct * 0.75;  // reduce by 25%
    recommendation = "reduced_25pct";
  } else if (riskOfRuin < 0.01 && winRate > 0.62 && expectedGrowth > 0) {
    finalPct = Math.min(testPct * 1.25, 0.05); // boost up to 25% but cap at 5% of balance
    recommendation = "boosted_25pct";
  }

  const finalStake = Math.max(minStake, Math.min(maxStake, parseFloat((balance * finalPct).toFixed(2))));
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
      _tradeCount: data.length,
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

  // SL always 1.5x TP to ensure P(win) > 60%
  // But capped at 90% of stake (Deriv max)
  const slPct = Math.min(tpPct * 1.5, 0.90);

  // Calculate actual win probability
  const winProb = slPct / (tpPct + slPct);

  // tpMultiplier = TP as fraction of stake (for contract_update)
  // stake * multiplier * tpPct = TP profit
  // → tpMultiplier = TP_profit / stake
  // We'll calculate actual $ amounts in placeTrade
  const tpMultiplier = tpPct * 100; // normalized

  return { tpPct, slPct, winProb, tpMultiplier };
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
    "BOOM":  [100, 150, 200, 300, 400],
    "CRASH": [100, 150, 200, 300, 400],
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
    // Get trades marked as "open" in last 8 hours
    const eightHrsAgo = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString();
    const { data: openTrades } = await supabase
      .from("trades")
      .select("id, symbol, stake, created_at")
      .eq("result", "open")
      .eq("account_name", "edge_function")
      .gte("created_at", eightHrsAgo)
      .limit(20);

    if (!openTrades || openTrades.length === 0) return;
    console.log(`🔄 Checking ${openTrades.length} open trades...`);

    await new Promise<void>((resolve) => {
      const ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");
      const timeout = setTimeout(() => { ws.close(); resolve(); }, 20000);
      let authed = false;

      ws.onopen = () => ws.send(JSON.stringify({ authorize: token }));
      ws.onmessage = async (e) => {
        const d = JSON.parse(e.data);

        if (d.authorize && !authed) {
          authed = true;
          // Use statement API — shows ALL transactions including closed MULT contracts
          ws.send(JSON.stringify({
            statement: 1,
            description: 1,
            limit: 100,
            action_type: "sell"  // only show closed/sold contracts
          }));
        }

        if (d.statement) {
          clearTimeout(timeout);
          ws.close();
          const transactions = d.statement.transactions || [];
          console.log(`📊 Got ${transactions.length} closed transactions from Deriv`);

          let updated = 0;
          for (const trade of openTrades) {
            const tradeTime = new Date(trade.created_at).getTime() / 1000;

            // Match by purchase time within 10 minutes
            const match = transactions.find((t: any) => {
              const purchaseTime = t.purchase_time || t.transaction_time || 0;
              return Math.abs(purchaseTime - tradeTime) < 600;
            });

            if (match) {
              const pnl    = parseFloat(match.pnl || "0");
              const result = pnl > 0 ? "win" : "loss";
              await supabase.from("trades")
                .update({ result, pnl: parseFloat(pnl.toFixed(4)) })
                .eq("id", trade.id);
              console.log(`✅ ${trade.symbol}: ${result} pnl:$${pnl.toFixed(2)}`);
              updated++;
            }
          }
          console.log(`🔄 Updated ${updated}/${openTrades.length} open trades`);
          resolve();
        }

        if (d.error) {
          console.log(`⚠️ Statement error: ${d.error.message}`);
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      };
      ws.onerror = () => { clearTimeout(timeout); resolve(); };
    });

  } catch(e) {
    console.log(`⚠️ Trade result updater error: ${e}`);
  }
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

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
    mc = monteCarloStake(balance, riskPct, perf.winRate, perf.avgWinPct, perf.avgLossPct, minStk, maxStk);
    stake = mc.stake;
    console.log(`💰 Monte Carlo stake: $${stake} (${mc.recommendation} ror:${(mc.riskOfRuin*100).toFixed(1)}%)`);
  } else {
    // Not enough data — use flat risk_pct directly
    stake = Math.max(minStk, Math.min(maxStk, parseFloat(((balance * riskPct) / 100).toFixed(2))));
    mc = { stake, riskOfRuin: 0, expectedGrowth: 0, recommendation: "insufficient_data", base_stake: stake, final_stake: stake };
    console.log(`💰 Flat stake: $${stake} (Monte Carlo needs 10+ trades, has ${(perf as any)._tradeCount || 0})`);
  }
  const baseStake = Math.max(minStk, parseFloat(((balance * riskPct) / 100).toFixed(2)));
  console.log(`💰 Base stake: $${baseStake} → Monte Carlo adjusted: $${stake} (ror:${(mc.riskOfRuin*100).toFixed(1)}% growth:${(mc.expectedGrowth*100).toFixed(1)}% rec:${mc.recommendation} winRate:${(perf.winRate*100).toFixed(0)}%)`);
  const minConf = cfg.min_confidence || 65;

  // Circuit breaker — 3 consecutive losses → pause
  const consec = await getConsecutiveLosses(supabase);
  if (consec >= 3) return new Response(JSON.stringify({ status: "paused", consecutive_losses: consec }), { headers: CORS });

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
  const cfgSymbols = cfg.symbols || ["BOOM500", "CRASH500", "frxUSDJPY"];
  // INTERSECTION only — must be in BOTH ml_models AND bot_config.symbols
  // This means user controls exactly which symbols trade via Settings
  const allSymbols = cfgSymbols.filter(s => mlSymbols.includes(s));
  // Fallback: if no intersection found, use cfg symbols anyway (no ML, uses fallback strategy)
  const finalSymbols = allSymbols.length > 0 ? allSymbols : cfgSymbols;
  console.log(`📡 Scanning (ML+config intersection): ${finalSymbols.join(", ")}`);
  // Rename for rest of function
  const allSymbolsList = finalSymbols;

  const signals: any[]  = [];
  const scanLog: string[] = [];
  const session = getTradingSession();

  for (const symbol of allSymbolsList) {
    try {
      // ── STEP 1: Session check (forex only) ──
      const isSynthetic = symbol.startsWith("R_") || symbol.startsWith("BOOM") || symbol.startsWith("CRASH");
      if (!isSynthetic && !session.active) {
        scanLog.push(`${symbol}: off-hours`); continue;
      }

      // Fetch candles
      const [c1m, c5m] = await Promise.all([fetchCandles(symbol, 60, 200), fetchCandles(symbol, 300, 100)]);
      if (c1m.length < 60) { scanLog.push(`${symbol}: insufficient candles`); continue; }

      // ── STEP 2: HMM Regime Detection ──
      // Use TRUE HMM Viterbi decoder if model loaded, else fall back to rule-based
      const hmmObs = extractHMMObservations(c1m);
      const regime = (HMM_MODEL && hmmObs.length > 0)
        ? hmmViterbi(hmmObs)
        : detectMarketRegime(c1m);
      const isSpikeSym = symbol.startsWith("BOOM") || symbol.startsWith("CRASH");

      // BOOM/CRASH trade in ALL regimes — spikes happen even in ranging markets
      // HMM only blocks forex/crypto/VIX in ranging/high-vol conditions
      if (!regime.tradable && !isSpikeSym) {
        scanLog.push(`${symbol}: HMM→${regime.name} (skipping — unfavorable regime)`);
        console.log(`🚫 ${symbol}: HMM blocked — ${regime.name}`);
        continue;
      }
      if (!regime.tradable && isSpikeSym) {
        console.log(`⚡ ${symbol}: HMM→${regime.name} but BOOM/CRASH allowed in all regimes`);
      } else {
        console.log(`✅ ${symbol}: HMM→${regime.name} (allowed:${regime.allowedAction})`);
      }

      let sig: any;
      const features = buildFeatures(c1m, c5m);

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
        if (regime.allowedAction !== "NONE" && regime.name !== "WeakUptrend" && regime.name !== "WeakDowntrend") {
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
        if (bayesian.winProb < 0.55) {
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

        const logLine = `${symbol}: ML→${sig.action} conf:${finalConf} HMM:${regime.name} (${sig.reason})`;
        scanLog.push(logLine);
        console.log(logLine);

      } else {
        // ── Fallback path for non-ML symbols ──
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
        else { scanLog.push(`${symbol}: no-fallback-signal`); continue; }

        // Fallback also respects HMM
        if (sig.action !== regime.allowedAction) {
          scanLog.push(`${symbol}: fallback HMM_direction_blocked`); continue;
        }
        scanLog.push(`${symbol}: Fallback→${sig.action} HMM:${regime.name}`);
      }

      if (sig && sig.action !== "HOLD" && sig.confidence >= minConf) {
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
      scanned: allSymbolsList.length,
      ml_models_used: Object.keys(ML_MODELS),
      scan_log: scanLog,
    }), { headers: CORS });
  }

  // Pick best signal — ML > fallback, then by confidence
  signals.sort((a, b) => {
    if (a.is_ml !== b.is_ml) return a.is_ml ? -1 : 1;
    return b.confidence - a.confidence;
  });
  const best = signals[0];
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

  const dynMult = selectMultiplier(
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
  ).catch(() => new Array(21).fill(0));

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

  if (success) await supabase.from("bot_config").update({ balance_cache: balance - stake }).eq("active", true);

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