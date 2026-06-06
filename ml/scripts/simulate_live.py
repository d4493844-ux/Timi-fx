#!/usr/bin/env python3
"""
TIMI-FX LIVE TRADE SIMULATOR
Fetches real candles from Deriv, runs all filters,
simulates trade outcomes with exact bot logic
"""
import asyncio, json, math, random, websockets
from collections import defaultdict
from datetime import datetime

SYMBOLS = ["R_75", "R_50", "R_100", "R_25", "BOOM500", "CRASH500", "frxXAUUSD", "frxEURUSD"]
HOLD_CANDLES = 5      # 5-min contract = 5 x 1min candles
PAYOUT       = 0.92   # Deriv payout
MIN_CONF     = 75     # Minimum confidence to trade

# ── Fetch candles ─────────────────────────────────────────────
async def fetch(symbol, count=500, granularity=60):
    url = "wss://ws.derivws.com/websockets/v3?app_id=1089"
    try:
        async with websockets.connect(url, ping_interval=None) as ws:
            await ws.send(json.dumps({
                "ticks_history": symbol, "adjust_start_time": 1,
                "count": count, "end": "latest",
                "granularity": granularity, "style": "candles"
            }))
            while True:
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=15))
                if "candles" in msg: return msg["candles"]
                if "error"   in msg: return []
    except: return []

# ── All filters (mirrors edge function logic) ─────────────────
def calc_rsi(closes, n=14):
    if len(closes) < n+1: return 50
    diffs = [closes[i+1]-closes[i] for i in range(len(closes)-1)][-n:]
    g = sum(max(0,d) for d in diffs)/n
    l = sum(max(0,-d) for d in diffs)/n
    return 100 - 100/(1+g/l) if l > 0 else 50

def calc_ema(prices, n):
    k = 2/(n+1); e = prices[0]
    for p in prices[1:]: e = p*k + e*(1-k)
    return e

def calc_hurst(closes):
    if len(closes) < 20: return 0.5
    n = len(closes)
    mean = sum(closes)/n
    deviations = [c - mean for c in closes]
    cum = [sum(deviations[:i+1]) for i in range(n)]
    R = max(cum) - min(cum)
    S = math.sqrt(sum((c-mean)**2 for c in closes)/n)
    return math.log(R/S)/math.log(n) if S > 0 else 0.5

def calc_ou(closes, window=100):
    if len(closes) < window: window = len(closes)
    p = closes[-window:]
    mu = sum(p)/len(p)
    std = math.sqrt(sum((x-mu)**2 for x in p)/len(p)) + 1e-10
    zscore = (closes[-1] - mu) / std
    return {"theta": mu, "zscore": zscore, "std": std}

def calc_bb(closes, n=20):
    if len(closes) < n: return None, None, None
    w = closes[-n:]
    mid = sum(w)/n
    std = math.sqrt(sum((x-mid)**2 for x in w)/n)
    return mid+2*std, mid, mid-2*std

def calc_ofi(candles, window=20):
    recent = candles[-window:]
    bull = sum(1 for c in recent if float(c["close"]) > float(c["open"]))
    return bull / len(recent) if recent else 0.5

def calc_half_life(closes):
    if len(closes) < 10: return {"strength": "unknown", "hl": 5}
    returns = [closes[i+1]-closes[i] for i in range(len(closes)-1)]
    mean = sum(returns)/len(returns)
    dm = [r-mean for r in returns]
    num = sum(dm[i]*dm[i-1] for i in range(1,len(dm)))
    den = sum(dm[i]*dm[i] for i in range(1,len(dm)))
    phi = max(-0.99, min(0.99, num/den)) if den != 0 else 0
    net = abs(closes[-1]-closes[0])
    atr = sum(abs(r) for r in returns)/len(returns)
    snr = net/(atr*math.sqrt(len(closes))) if atr > 0 else 0
    if snr > 0.5 and phi > -0.3: return {"strength":"strong","hl":round(min(abs(math.log(0.5)/math.log(abs(phi))) if abs(phi)>0 else 1,20),1)}
    if snr > 0.2 or phi > 0.0:   return {"strength":"fading","hl":2}
    return {"strength":"dead","hl":1}

def get_signal(candles, symbol):
    """Full signal pipeline"""
    closes = [float(c["close"]) for c in candles]
    highs  = [float(c["high"])  for c in candles]
    lows   = [float(c["low"])   for c in candles]
    price  = closes[-1]

    is_synthetic = symbol.startswith("R_") or symbol.startswith("JD") or \
                   symbol.startswith("BOOM") or symbol.startsWith("CRASH") if hasattr(symbol, 'startsWith') else \
                   any(symbol.startswith(p) for p in ["R_","JD","BOOM","CRASH"])

    rsi    = calc_rsi(closes)
    ema9   = calc_ema(closes[-20:], 9)
    ema21  = calc_ema(closes[-21:], 21) if len(closes) >= 21 else closes[-1]
    hurst  = calc_hurst(closes[-40:])
    ou     = calc_ou(closes, 100)
    bb_u, bb_m, bb_l = calc_bb(closes)
    ofi    = calc_ofi(candles)
    hl     = calc_half_life(closes[-20:])

    filters = {}
    action  = None
    confidence = 60
    reasons = []

    # ── RSI Signal ──
    if rsi < 35:
        action = "BUY"; confidence += 10; reasons.append(f"RSI_OS={rsi:.0f}")
    elif rsi > 65:
        action = "SELL"; confidence += 10; reasons.append(f"RSI_OB={rsi:.0f}")
    else:
        return None, {}, []  # No signal

    # ── OU Z-Score (primary for synthetics) ──
    if any(symbol.startswith(p) for p in ["R_","JD"]):
        z = ou["zscore"]
        if abs(z) >= 2.0:
            ou_action = "SELL" if z > 2.0 else "BUY"
            if ou_action == action:
                confidence += 10; reasons.append(f"OU_confirmed z={z:.2f}")
            else:
                confidence -= 10; reasons.append(f"OU_conflict z={z:.2f}")
        elif abs(z) >= 1.5:
            ou_action = "SELL" if z > 1.5 else "BUY"
            if ou_action == action:
                confidence += 5; reasons.append(f"OU_boost z={z:.2f}")

    # ── Bollinger Bands ──
    if bb_u and bb_l:
        if action == "BUY" and price < bb_l:
            confidence += 8; reasons.append("BB_below_lower")
        elif action == "SELL" and price > bb_u:
            confidence += 8; reasons.append("BB_above_upper")
        elif action == "BUY" and price > bb_u:
            confidence -= 10; reasons.append("BB_conflict_above")
        elif action == "SELL" and price < bb_l:
            confidence -= 10; reasons.append("BB_conflict_below")

    # ── OFI ──
    if action == "BUY" and ofi > 0.6:
        confidence += 5; reasons.append(f"OFI_bull={ofi:.2f}")
    elif action == "SELL" and ofi < 0.4:
        confidence += 5; reasons.append(f"OFI_bear={ofi:.2f}")
    elif (action == "BUY" and ofi < 0.4) or (action == "SELL" and ofi > 0.6):
        confidence -= 10; reasons.append(f"OFI_conflict={ofi:.2f}")

    # ── Hurst (random walk check) ──
    if 0.45 <= hurst <= 0.55:
        confidence -= 15; reasons.append(f"Hurst_random_walk={hurst:.2f}")

    # ── Signal Longevity ──
    if hl["strength"] == "dead":
        confidence -= 15; reasons.append("longevity_dead")
    elif hl["strength"] == "fading":
        confidence -= 5; reasons.append("longevity_fading")
    elif hl["strength"] == "strong":
        confidence += 5; reasons.append("longevity_strong")

    # ── EMA trend confirmation ──
    if action == "BUY" and ema9 > ema21:
        confidence += 5; reasons.append("EMA_bull")
    elif action == "SELL" and ema9 < ema21:
        confidence += 5; reasons.append("EMA_bear")

    filters = {
        "rsi": round(rsi,1), "ou_z": round(ou["zscore"],2),
        "hurst": round(hurst,2), "ofi": round(ofi,2),
        "bb_pos": "below" if price<(bb_l or 0) else "above" if price>(bb_u or 0) else "mid",
        "longevity": hl["strength"]
    }

    confidence = max(0, min(95, confidence))
    return action, filters, reasons, confidence

# ── Simulate trade outcome ─────────────────────────────────────
def simulate_outcome(candles, entry_idx, action, hold=5):
    if entry_idx + hold >= len(candles): return None
    entry = float(candles[entry_idx]["close"])
    exit_ = float(candles[entry_idx + hold]["close"])
    if action == "BUY":  return "win" if exit_ > entry else "loss"
    if action == "SELL": return "win" if exit_ < entry else "loss"

# ── Main simulation ───────────────────────────────────────────
async def simulate_symbol(symbol, candles):
    WINDOW = 120
    results = []
    blocked = defaultdict(int)

    for i in range(WINDOW, len(candles) - HOLD_CANDLES):
        window   = candles[i-WINDOW:i]
        closes_w = [float(c["close"]) for c in window]

        result = get_signal(window, symbol)
        if result is None or result[0] is None:
            blocked["no_signal"] += 1
            continue

        action, filters, reasons, confidence = result

        # Minimum confidence gate
        if confidence < MIN_CONF:
            blocked["low_conf"] += 1
            continue

        # Simulate outcome
        outcome = simulate_outcome(candles, i, action, HOLD_CANDLES)
        if outcome is None: continue

        results.append({
            "action": action, "outcome": outcome,
            "confidence": confidence, "reasons": reasons,
            "filters": filters, "time": candles[i]["epoch"]
        })

    return results, blocked

async def main():
    print("\n" + "═"*65)
    print("  TIMI-FX LIVE SIMULATOR — Real Deriv Candles")
    print(f"  Symbols: {', '.join(SYMBOLS)}")
    print(f"  Hold: {HOLD_CANDLES} candles | Min Conf: {MIN_CONF}%")
    print("═"*65)

    total_wins = total_losses = total_blocked = 0
    all_results = []

    for symbol in SYMBOLS:
        print(f"\n  Fetching {symbol} (500 candles)...")
        candles = await fetch(symbol, 500, 60)
        if len(candles) < 150:
            print(f"  ❌ Insufficient data ({len(candles)} candles)")
            continue

        results, blocked = await simulate_symbol(symbol, candles)
        wins   = sum(1 for r in results if r["outcome"]=="win")
        losses = sum(1 for r in results if r["outcome"]=="loss")
        total  = wins + losses
        wr     = wins/total*100 if total > 0 else 0
        pnl    = wins*9*PAYOUT - losses*9
        total_wins   += wins
        total_losses += losses
        total_blocked += sum(blocked.values())
        all_results.extend(results)

        status = "🟢" if wr >= 53 else "🟡" if wr >= 48 else "🔴"
        print(f"  {status} {symbol:<14} {total:>4} trades | WR={wr:>5.1f}% | P&L=${pnl:>8.2f} | blocked={sum(blocked.values())}")

        # Show filter effectiveness
        if results:
            conf_bins = defaultdict(lambda:{"w":0,"l":0})
            for r in results:
                cb = f"{(r['confidence']//10)*10}-{(r['confidence']//10)*10+9}%"
                conf_bins[cb]["w" if r["outcome"]=="win" else "l"] += 1
            print(f"    Confidence breakdown:")
            for cb in sorted(conf_bins):
                b = conf_bins[cb]
                t = b["w"]+b["l"]
                print(f"      {cb}: {b['w']}/{t} = {b['w']/t*100:.0f}% WR")

    # Aggregate
    total = total_wins + total_losses
    wr    = total_wins/total*100 if total > 0 else 0
    pnl   = total_wins*9*PAYOUT - total_losses*9
    be_wr = 100/(1+PAYOUT)

    print("\n" + "═"*65)
    print("  AGGREGATE RESULTS")
    print("═"*65)
    print(f"  Total trades:    {total}")
    print(f"  Total blocked:   {total_blocked}")
    print(f"  Win rate:        {wr:.1f}%")
    print(f"  Breakeven WR:    {be_wr:.1f}%")
    print(f"  Above breakeven: {'✅ YES' if wr >= be_wr else '❌ NO'}")
    print(f"  Simulated P&L:   ${pnl:.2f}")
    print(f"  (at $9/trade, {PAYOUT*100:.0f}% payout)")

    # Best performing filter combination
    print(f"\n  TOP SIGNAL REASONS (by WR):")
    reason_stats = defaultdict(lambda:{"w":0,"l":0})
    for r in all_results:
        for reason in r["reasons"]:
            reason_stats[reason]["w" if r["outcome"]=="win" else "l"] += 1
    for rs, d in sorted(reason_stats.items(), key=lambda x: x[1]["w"]/(x[1]["w"]+x[1]["l"]+0.01), reverse=True)[:8]:
        t = d["w"]+d["l"]
        if t >= 5:
            print(f"    {rs:<30} {d['w']}/{t} = {d['w']/t*100:.0f}% WR")
    print("═"*65)

asyncio.run(main())
