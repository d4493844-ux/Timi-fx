#!/usr/bin/env python3
"""
TIMI-FX LIVE BACKTEST
Uses real Deriv candle data to test every filter
Simulates exactly what the edge function does
"""
import asyncio, json, math, websockets, statistics
from collections import defaultdict

SYMBOLS = ["R_75", "R_50", "CRASH500", "CRASH1000", "BOOM500", "BOOM1000",
           "frxXAUUSD", "frxEURUSD", "frxGBPUSD"]
CANDLE_COUNT = 500  # 500 real 1-minute candles per symbol

# ── Fetch real candles from Deriv ────────────────────────────────
async def fetch_candles(symbol, count=500):
    url = "wss://ws.derivws.com/websockets/v3?app_id=1089"
    try:
        async with websockets.connect(url, ping_interval=None) as ws:
            await ws.send(json.dumps({
                "ticks_history": symbol, "adjust_start_time": 1,
                "count": count, "end": "latest",
                "granularity": 60, "style": "candles"
            }))
            while True:
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=15))
                if "candles" in msg:
                    return [float(c["close"]) for c in msg["candles"]]
                if "error" in msg:
                    print(f"  ❌ {symbol}: {msg['error']['message']}")
                    return []
    except Exception as e:
        print(f"  ❌ {symbol}: {e}")
        return []

# ── All filter functions (exact same logic as edge function) ──────
def calc_ema(prices, period):
    if len(prices) < period: return prices[-1]
    k = 2/(period+1)
    ema = prices[0]
    for p in prices[1:]: ema = p*k + ema*(1-k)
    return ema

def hmm_filter(closes, action):
    if len(closes) < 21: return True
    ema9  = calc_ema(closes[-20:], 9)
    ema21 = calc_ema(closes[-21:], 21)
    if action == "BUY"  and ema9 < ema21 * 0.998: return False
    if action == "SELL" and ema9 > ema21 * 1.002: return False
    return True

def ofi_filter(closes, action):
    if len(closes) < 11: return True
    returns  = [closes[i+1]-closes[i] for i in range(len(closes)-1)][-10:]
    bull_cnt = sum(1 for r in returns if r > 0)
    ofi      = (bull_cnt/len(returns) - 0.5) * 2
    if action == "BUY"  and ofi < -0.4: return False
    if action == "SELL" and ofi >  0.4: return False
    return True

def persistence_filter(closes, action):
    if len(closes) < 4: return True
    c = closes[-4:]
    bull2 = c[2] > c[1] and c[3] > c[2]
    bear2 = c[2] < c[1] and c[3] < c[2]
    if action == "BUY"  and bear2: return False
    if action == "SELL" and bull2: return False
    return True

def rsi_filter(closes, action, period=14):
    if len(closes) < period+1: return True
    diffs  = [closes[i+1]-closes[i] for i in range(len(closes)-1)][-period:]
    gains  = [max(0,d) for d in diffs]
    losses = [max(0,-d) for d in diffs]
    ag, al = sum(gains)/period, sum(losses)/period
    rsi    = 100 - 100/(1+ag/al) if al > 0 else 50
    if action == "BUY"  and rsi > 75: return False
    if action == "SELL" and rsi < 25: return False
    return True

def longevity_filter(closes, action):
    if len(closes) < 10: return True
    returns = [closes[i+1]-closes[i] for i in range(len(closes)-1)]
    mean    = sum(returns)/len(returns)
    dm      = [r-mean for r in returns]
    num = sum(dm[i]*dm[i-1] for i in range(1,len(dm)))
    den = sum(dm[i]*dm[i]   for i in range(1,len(dm)))
    phi = max(-0.99, min(0.99, num/den)) if den != 0 else 0
    net = abs(closes[-1]-closes[0])
    atr = sum(abs(r) for r in returns)/len(returns)
    snr = net/(atr*math.sqrt(len(closes))) if atr > 0 else 0
    # Noise check
    if len(closes) >= 10:
        recent   = closes[-5:]
        baseline = closes[-10:-5]
        bm = sum(baseline)/len(baseline)
        bs = math.sqrt(sum((v-bm)**2 for v in baseline)/len(baseline))
        z  = abs(sum(recent)/len(recent)-bm)/bs if bs > 0 else 0
        against  = (recent[-1]<recent[0]) if action=="BUY" else (recent[-1]>recent[0])
        is_noise = against and z < 1.5
    else:
        is_noise = False
    if snr > 0.5 and phi > -0.3: strength = "strong"
    elif snr > 0.2 or phi > 0.0: strength = "fading"
    else: strength = "dead"
    if strength == "dead" and not is_noise: return False
    return True

def get_signal(closes):
    """Simple signal based on EMA crossover — what bot uses"""
    if len(closes) < 21: return None
    ema9  = calc_ema(closes[-20:], 9)
    ema21 = calc_ema(closes[-21:], 21)
    if ema9 > ema21 * 1.001: return "BUY"
    if ema9 < ema21 * 0.999: return "SELL"
    return None

def simulate_trade(closes, action, hold=5):
    """Simulate 5-candle CALL/PUT trade outcome"""
    if len(closes) < hold+1: return None
    entry = closes[0]
    exit_ = closes[hold]
    if action == "BUY":  return "win" if exit_ > entry else "loss"
    if action == "SELL": return "win" if exit_ < entry else "loss"
    return None

# ── Main backtest ────────────────────────────────────────────────
async def backtest_symbol(symbol, candles):
    print(f"\n  📊 {symbol}: {len(candles)} candles")
    if len(candles) < 50:
        print(f"     ⚠️  Not enough data")
        return None

    WINDOW   = 30  # candles of history for signal
    HOLD     = 5   # candles to hold trade

    stats = defaultdict(lambda: {"trades":0,"wins":0})

    for i in range(WINDOW, len(candles)-HOLD):
        window  = candles[i-WINDOW:i]
        future  = candles[i:i+HOLD+1]
        action  = get_signal(window)
        if not action: continue

        outcome = simulate_trade(future, action, HOLD)
        if not outcome: continue

        win = outcome == "win"

        # Baseline
        stats["baseline"]["trades"] += 1
        if win: stats["baseline"]["wins"] += 1

        # + HMM
        if hmm_filter(window, action):
            stats["hmm"]["trades"] += 1
            if win: stats["hmm"]["wins"] += 1

        # + HMM + OFI
        if hmm_filter(window, action) and ofi_filter(window, action):
            stats["hmm_ofi"]["trades"] += 1
            if win: stats["hmm_ofi"]["wins"] += 1

        # + HMM + OFI + Persistence
        if hmm_filter(window, action) and ofi_filter(window, action) and persistence_filter(window, action):
            stats["persist"]["trades"] += 1
            if win: stats["persist"]["wins"] += 1

        # + RSI
        if hmm_filter(window, action) and ofi_filter(window, action) and persistence_filter(window, action) and rsi_filter(window, action):
            stats["rsi"]["trades"] += 1
            if win: stats["rsi"]["wins"] += 1

        # FULL STACK
        if hmm_filter(window, action) and ofi_filter(window, action) and persistence_filter(window, action) and rsi_filter(window, action) and longevity_filter(window, action):
            stats["full"]["trades"] += 1
            if win: stats["full"]["wins"] += 1

    # Print symbol results
    base_wr = stats["baseline"]["wins"]/stats["baseline"]["trades"]*100 if stats["baseline"]["trades"] > 0 else 0
    print(f"     {'Filter':<22} {'Trades':>7} {'WR':>7}")
    for key, label in [("baseline","Baseline"),("hmm","+ HMM"),("hmm_ofi","+ OFI"),("persist","+ Persistence"),("rsi","+ RSI"),("full","FULL STACK")]:
        t = stats[key]["trades"]
        w = stats[key]["wins"]
        wr = w/t*100 if t > 0 else 0
        diff = wr - base_wr
        diff_str = f"({'+' if diff>=0 else ''}{diff:.1f}%)"
        print(f"     {label:<22} {t:>7} {wr:>6.1f}% {diff_str}")

    return stats

async def main():
    print("\n" + "═"*60)
    print("  TIMI-FX REAL DATA BACKTEST")
    print("  Fetching live candles from Deriv...")
    print("═"*60)

    all_stats = defaultdict(lambda: {"trades":0,"wins":0})

    for symbol in SYMBOLS:
        print(f"\n  Fetching {symbol}...")
        candles = await fetch_candles(symbol, CANDLE_COUNT)
        if not candles:
            continue
        stats = await backtest_symbol(symbol, candles)
        if not stats: continue
        # Aggregate
        for key in stats:
            all_stats[key]["trades"] += stats[key]["trades"]
            all_stats[key]["wins"]   += stats[key]["wins"]

    # Print aggregate
    print("\n" + "═"*60)
    print("  AGGREGATE ACROSS ALL SYMBOLS")
    print("═"*60)
    base_wr = all_stats["baseline"]["wins"]/all_stats["baseline"]["trades"]*100 if all_stats["baseline"]["trades"] > 0 else 0
    for key, label in [("baseline","Baseline (no filters)"),("hmm","+ HMM Regime"),("hmm_ofi","+ OFI"),("persist","+ Persistence"),("rsi","+ RSI"),("full","FULL STACK")]:
        t = all_stats[key]["trades"]
        w = all_stats[key]["wins"]
        wr = w/t*100 if t > 0 else 0
        diff = wr - base_wr
        bar  = "█" * int(wr/3)
        print(f"  {label:<25} {t:>6} trades  {wr:>5.1f}% WR  {'+' if diff>=0 else ''}{diff:.1f}%  {bar}")
    print("═"*60)

asyncio.run(main())
