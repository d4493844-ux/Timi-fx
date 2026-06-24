#!/usr/bin/env python3
"""
MULTI-PAIR VALIDATOR — runs the full gauntlet on any pair.
Use this in PARALLEL with the bot: validate new pairs, add the winners
to the bot's universe. ONLY pairs that pass ALL tests qualify (like BTC did).

Tests (a pair must pass ALL to qualify):
  1. Walk-forward: positive in 3+/4 sequential chunks
  2. Cost-robust: positive Sharpe at 40bps
  3. Beats shuffle null (95th pct) — the decisive one
  4. Bear protection: shallower drawdown than buy&hold

Usage: python3 validate_pairs.py BTCUSDT ETHUSDT SOLUSDT ...
       (no args = screens a default liquid set)
"""
import urllib.request, json, time, math, random, sys
random.seed(13)
BINANCE="https://data-api.binance.vision/api/v3/klines"

def fetch_daily(symbol):
    bars=[]; cursor=1502928000000
    while True:
        url=f"{BINANCE}?symbol={symbol}&interval=1d&startTime={cursor}&limit=1000"
        try:
            with urllib.request.urlopen(url,timeout=30) as r: chunk=json.loads(r.read())
        except Exception as e: return []
        if not chunk: break
        bars.extend(chunk)
        if len(chunk)<1000: break
        cursor=chunk[-1][0]+86400000; time.sleep(0.1)
        if len(bars)>4000: break
    return [float(b[4]) for b in bars]

def mean(a): return sum(a)/len(a) if a else 0.0
def std(a):
    if len(a)<2: return 0.0
    m=mean(a); return math.sqrt(sum((x-m)**2 for x in a)/len(a))
def sharpe(p,hold=20):
    if len(p)<5: return 0.0
    m,s=mean(p),std(p); return (m/s)*math.sqrt(365/hold) if s>0 else 0.0

def blended_pnls(closes, hold=20, cost_bps=10):
    n=len(closes)
    rets=[math.log(closes[i]/closes[i-1]) for i in range(1,n)]
    cost=cost_bps/10000.0; pnls=[]
    for i in range(252+60, n-hold, hold):
        votes=[1 if closes[i]/closes[i-lb]-1>0 else -1 for lb in [21,63,126,252] if i-lb>=0]
        d=1 if sum(votes)>0 else -1
        w=rets[max(0,i-60):i]; rv=std(w)*math.sqrt(365) if w else 1e-9
        size=min(3.0,0.40/max(rv,1e-4))
        fwd=closes[i+hold]/closes[i]-1
        pnls.append(d*fwd*size - cost*size)
    return pnls

def bear_protection(closes):
    """daily trend vs buy&hold maxDD."""
    n=len(closes); rets=[math.log(closes[i]/closes[i-1]) for i in range(1,n)]
    teq=[1.0]; beq=[1.0]; prev=0
    for i in range(252+60, n-1):
        votes=[1 if closes[i]/closes[i-lb]-1>0 else -1 for lb in [21,63,126,252] if i-lb>=0]
        sig=1 if sum(votes)>0 else -1
        w=rets[max(0,i-60):i]; rv=std(w) if w else 1e-9
        size=min(3.0,(0.40/math.sqrt(365))/max(rv,1e-5))
        nr=closes[i+1]/closes[i]-1
        cost=0.001*size if sig!=prev else 0; prev=sig
        teq.append(teq[-1]*(1+sig*size*nr-cost)); beq.append(beq[-1]*(1+nr))
    def mdd(eq):
        pk=eq[0]; m=0
        for x in eq:
            pk=max(pk,x); m=min(m,(x-pk)/pk)
        return m
    return mdd(teq), mdd(beq)

def gauntlet(symbol):
    closes=fetch_daily(symbol)
    if len(closes)<700:
        return {"symbol":symbol, "qualified":False, "reason":f"insufficient data ({len(closes)} bars)"}
    # 1. walk-forward
    n=len(closes); chunk=n//4; cs=[]
    for k in range(4):
        seg=closes[k*chunk:(k+1)*chunk]
        if len(seg)>=340: cs.append(sharpe(blended_pnls(seg)))
    wf_pass = sum(1 for s in cs if s>0) >= 3 and len(cs)>=3
    # 2. cost robust
    cost_pass = sharpe(blended_pnls(closes,cost_bps=40)) > 0
    # 3. shuffle null
    real=sharpe(blended_pnls(closes))
    rets=[math.log(closes[i]/closes[i-1]) for i in range(1,len(closes))]
    nulls=[]
    for _ in range(30):
        sr=rets[:]; random.shuffle(sr)
        px=[closes[0]]
        for r in sr: px.append(px[-1]*math.exp(r))
        nulls.append(sharpe(blended_pnls(px)))
    nulls.sort(); p95=nulls[int(len(nulls)*0.95)]
    null_pass = real > p95
    # 4. bear protection
    tdd, bdd = bear_protection(closes)
    bear_pass = tdd > bdd  # trend drawdown shallower (less negative)

    qualified = wf_pass and cost_pass and null_pass and bear_pass
    return {"symbol":symbol, "qualified":qualified, "sharpe":round(real,2),
            "walk_forward":f"{sum(1 for s in cs if s>0)}/{len(cs)}", "wf_pass":wf_pass,
            "cost40bps_pass":cost_pass, "beats_null":null_pass, "null95":round(p95,2),
            "trend_maxDD":f"{tdd*100:.0f}%", "bh_maxDD":f"{bdd*100:.0f}%", "bear_pass":bear_pass,
            "bars":len(closes)}

if __name__=="__main__":
    pairs = sys.argv[1:] if len(sys.argv)>1 else [
        "BTCUSDT","ETHUSDT","SOLUSDT","XRPUSDT","BNBUSDT","ADAUSDT","LTCUSDT",
        "LINKUSDT","DOGEUSDT","DOTUSDT","AVAXUSDT","TRXUSDT","MATICUSDT","ATOMUSDT"]
    print("="*70)
    print("MULTI-PAIR GAUNTLET — only ALL-PASS qualifies for the bot")
    print("="*70)
    qualified=[]
    for p in pairs:
        r=gauntlet(p)
        if r.get("reason"):
            print(f"\n{p}: SKIP — {r['reason']}"); continue
        tag = "✅ QUALIFIED" if r["qualified"] else "❌ rejected"
        print(f"\n{p}: {tag}  (Sharpe {r['sharpe']})")
        print(f"   walk-fwd {r['walk_forward']} {'✓' if r['wf_pass'] else '✗'} | "
              f"cost40 {'✓' if r['cost40bps_pass'] else '✗'} | "
              f"beats-null {'✓' if r['beats_null'] else '✗'} (vs {r['null95']}) | "
              f"bear {r['trend_maxDD']} vs {r['bh_maxDD']} {'✓' if r['bear_pass'] else '✗'}")
        if r["qualified"]: qualified.append(p)
    print("\n"+"="*70)
    print(f"QUALIFIED FOR BOT: {qualified if qualified else 'none passed all tests'}")
    print("Add these to the bot's universe. Reject the rest — same discipline as SOL.")
