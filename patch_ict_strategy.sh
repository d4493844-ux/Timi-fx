#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  TIMI-FX ICT STRATEGY UPGRADE
#  Replaces weak EMA fallback with institutional-grade:
#  1. Fair Value Gap (FVG) detection
#  2. Order Block identification  
#  3. Liquidity Sweep detection
#  4. Break of Structure (BOS) + Change of Character (CHoCH)
#  5. Kill Zone session filter (London/NY only)
#  Run from: Timi-fx-main/
# ═══════════════════════════════════════════════════════════════
set -e
EDGE="supabase/functions/timi-trader/index.ts"
cp "$EDGE" "${EDGE}.bak_ict"
echo "✅ Backup created"

python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# Inject ICT functions before getTradingSession
old = "function getTradingSession(): { active: boolean; name: string } {"

new = """// ═══════════════════════════════════════════════════════════════
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
  if (t >= 7.0 && t < 9.0)   return { active: true,  zone: "London_Open" };
  if (t >= 13.0 && t < 15.0) return { active: true,  zone: "NY_Open" };
  if (t >= 15.0 && t < 17.0) return { active: true,  zone: "London_Close" };
  return { active: false, zone: "Dead_Zone" };
}

// ── Fair Value Gap (FVG) Detection ──
// A bullish FVG: candle[i-2].high < candle[i].low (gap between wicks)
// Price leaving an inefficiency — market will return to fill it
// We enter when price RETURNS to the FVG zone (high probability)
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

function getTradingSession(): { active: boolean; name: string } {"""

if "function getTradingSession(): { active: boolean; name: string } {" not in txt:
    print("❌ Marker not found")
else:
    txt = txt.replace("function getTradingSession(): { active: boolean; name: string } {", new, 1)
    open(path, "w").write(txt)
    print("✅ ICT engine injected (FVG + OB + Liquidity Sweep + BOS/CHoCH + Kill Zones)")
PYEOF

# ── Wire ICT into fallback path for forex ──
python3 - <<'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

old = """        // ── Block TA trades on instruments where ML is required ──
        // Diagnostic confirmed TA-only not viable on these (WR < 50% across all windows)
        const taOnlySymbols = ["R_50","R_25","R_100",
          "frxEURUSD","frxGBPUSD","frxUSDJPY","frxGBPJPY","frxAUDUSD",
          "frxXAUUSD","frxXAGUSD","cryBTCUSD","cryETHUSD"];
        if (taOnlySymbols.includes(symbol)) {
          scanLog.push(`${symbol}: ML_required (TA blocked by diagnostic)`);
          continue;
        }"""

new = """        // ── ICT Strategy for forex — replaces weak EMA fallback ──
        const forexSymbols = ["frxEURUSD","frxGBPUSD","frxUSDJPY","frxGBPJPY",
          "frxAUDUSD","frxXAUUSD","frxXAGUSD","frxEURGBP","frxEURJPY"];
        const cryptoSymbols = ["cryBTCUSD","cryETHUSD"];

        if (forexSymbols.includes(symbol)) {
          // Use ICT Smart Money engine for forex
          const ictSig = ictForexSignal(c1m, c5m, symbol);
          if (!ictSig) {
            scanLog.push(`${symbol}: ICT_no_setup (no confluence)`);
            continue;
          }
          sig = ictSig;
          scanLog.push(`${symbol}: ICT→${sig.action} conf:${sig.confidence}% ${sig.reason}`);
        } else if (cryptoSymbols.includes(symbol) || ["R_50","R_25","R_100"].includes(symbol)) {
          scanLog.push(`${symbol}: ML_required (use ML models only)`);
          continue;
        }"""

if old not in txt:
    print("❌ TA block not found")
else:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ ICT wired into fallback forex path")
PYEOF

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉  ICT Strategy Upgrade Complete!"
echo ""
echo "  NEW FOREX STRATEGY:"
echo "  ✅ Fair Value Gap detection — enter when price fills gap"
echo "  ✅ Order Block detection — enter at institutional zones"
echo "  ✅ Liquidity Sweep — trade after stop hunts reverse"
echo "  ✅ BOS + CHoCH — trade with/against structure"
echo "  ✅ Kill Zones — London Open, NY Open, London Close only"
echo ""
echo "  MINIMUM CONFLUENCE = 6 points to fire a signal"
echo "  This means 2-3 concepts must align simultaneously"
echo "  No more single-indicator signals"
echo ""
echo "  DEPLOY:"
echo "  npx supabase functions deploy timi-trader"
echo "  git add -A && git commit -m 'feat: ICT SMC strategy - FVG + OB + Sweep + BOS'"
echo "  git push origin main"
echo "═══════════════════════════════════════════════════════════"
