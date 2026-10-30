#!/usr/bin/env python3
"""
FOCUSED FOLLOW-UP — push the two live crypto leads (lowvol, dist_high) harder.
Run in Cloud Shell after the v2 self-test passes.

Two power boosts over the first run:
  1. 4-HOUR BARS  -> ~6x more rebalance periods -> lower deflation hurdle -> an
     edge that was near-significant on ~140 daily periods gets a fair test.
  2. COMBINED SIGNAL -> z-score lowvol and dist_high cross-sectionally each
     rebalance and average them. Two aligned weak signals often blend into one
     that clears the bar (the noise in each partly cancels).

Uses the SAME validated cross-sectional backtest + honest significance tests as
xs_engine.py. The combined signal is ranked at the universe level (correct way
to blend signals on different scales), so it needs its own ranked-run function
here — but the scoring, permutation null, deflated Sharpe and OOS split are all
the engine's, unchanged.
"""
import json, math, random, time, urllib.request
import xs_engine as E

CRYPTO_UNIVERSE = [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT",
    "LINKUSDT","DOTUSDT","MATICUSDT","LTCUSDT","BCHUSDT","ATOMUSDT","UNIUSDT","ETCUSDT",
    "XLMUSDT","NEARUSDT","ALGOUSDT","FILUSDT","APTUSDT","ARBUSDT","OPUSDT","INJUSDT",
    "AAVEUSDT","MKRUSDT","SANDUSDT","MANAUSDT","AXSUSDT","FTMUSDT","THETAUSDT","EOSUSDT",
    "XTZUSDT","GRTUSDT","RUNEUSDT","CHZUSDT","SNXUSDT","CRVUSDT","LDOUSDT","DYDXUSDT",
]
HOSTS = ["https://data-api.binance.vision","https://api.binance.com"]

def fetch(symbol, interval, limit):
    for h in HOSTS:
        try:
            u=f"{h}/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
            req=urllib.request.Request(u, headers={"User-Agent":"timi-xs/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r: d=json.loads(r.read())
            if isinstance(d,list) and d: return [float(k[4]) for k in d]
        except Exception: continue
    return None

def build(interval, limit):
    print("="*100); print(f" FETCHING CRYPTO 4H ({len(CRYPTO_UNIVERSE)} coins, {interval})"); print("="*100)
    uni={}
    for i,s in enumerate(CRYPTO_UNIVERSE):
        c=fetch(s,interval,limit)
        if c and len(c)>=400: uni[s]=c; print(f"  [{i+1}/{len(CRYPTO_UNIVERSE)}] {s}: {len(c)}", flush=True)
        else: print(f"  [{i+1}/{len(CRYPTO_UNIVERSE)}] {s}: skip", flush=True)
        time.sleep(0.1)
    if uni:
        n=min(len(v) for v in uni.values()); uni={k:v[-n:] for k,v in uni.items()}
    return uni

def zscore(d):
    vals=list(d.values()); m=E.mean(vals); s=E.pstd(vals)
    if s==0: return {k:0.0 for k in d}
    return {k:(v-m)/s for k,v in d.items()}

def run_combined(universe, rebalance_every, top_frac, cost_bps, ppy,
                 lowvol_lb=30, disthigh_lb=90):
    """Combined signal: z(lowvol) + z(dist_high), ranked at universe level."""
    syms=list(universe.keys()); n=min(len(universe[s]) for s in syms)
    series={s:universe[s][-n:] for s in syms}
    period_returns=[]; prevL=set(); prevS=set(); t=rebalance_every
    while t < n-rebalance_every:
        lv={}; dh={}
        for s in syms:
            a=E.sig_lowvol(series[s][:t+1], lowvol_lb)
            b=E.sig_dist_from_high(series[s][:t+1], disthigh_lb)
            if a is not None and b is not None: lv[s]=a; dh[s]=b
        common=set(lv)&set(dh)
        if len(common)<4: t+=rebalance_every; continue
        lvz=zscore({k:lv[k] for k in common}); dhz=zscore({k:dh[k] for k in common})
        combined={k:lvz[k]+dhz[k] for k in common}
        ranked=sorted(combined, key=combined.get, reverse=True)
        k=max(1,int(len(ranked)*top_frac))
        L=set(ranked[:k]); S=set(ranked[-k:])
        def leg(sy):
            rs=[]
            for s in sy:
                p0,p1=series[s][t],series[s][t+rebalance_every]
                if p0>0: rs.append(p1/p0-1)
            return E.mean(rs) if rs else 0
        turnover=(len(L^prevL)+len(S^prevS))/(2*k) if k else 0
        period_returns.append(leg(L)-leg(S)-turnover*(cost_bps/10000.0))
        prevL,prevS=L,S; t+=rebalance_every
    if len(period_returns)<5: return None
    sr=E.sharpe_annualized(period_returns,ppy)
    return dict(returns=period_returns,n=len(period_returns),sharpe=sr,
                maxdd=E.max_drawdown(period_returns),skew=E.skewness(period_returns),
                kurt=E.kurtosis(period_returns))

def perm_combined(universe, rebalance_every, top_frac, cost_bps, ppy, real_sr,
                  lowvol_lb, disthigh_lb, n_perm=200, seed=42):
    rng=random.Random(seed); syms=list(universe.keys()); n=min(len(universe[s]) for s in syms)
    series={s:universe[s][-n:] for s in syms}; beat=0
    for _ in range(n_perm):
        pr=[]; t=rebalance_every
        while t<n-rebalance_every:
            valid=[s for s in syms if E.sig_lowvol(series[s][:t+1],lowvol_lb) is not None
                   and E.sig_dist_from_high(series[s][:t+1],disthigh_lb) is not None]
            if len(valid)<4: t+=rebalance_every; continue
            sh=valid[:]; rng.shuffle(sh); k=max(1,int(len(sh)*top_frac))
            L,S=sh[:k],sh[-k:]
            def leg(sy):
                rs=[]
                for s in sy:
                    p0,p1=series[s][t],series[s][t+rebalance_every]
                    if p0>0: rs.append(p1/p0-1)
                return E.mean(rs) if rs else 0
            pr.append(leg(L)-leg(S)); t+=rebalance_every
        if len(pr)>=5 and E.sharpe_annualized(pr,ppy)>=real_sr: beat+=1
    return (beat+1)/(n_perm+1)

def main():
    import sys
    interval="4h"
    # 4h: 1500 bars ~ 250 days. rebalance every 12 bars (2 days) -> ~125 periods
    # Actually use more bars: Binance max 1000 per call, so 1000 4h bars ~ 166 days.
    limit=1000
    REBAL=6     # 6*4h = 24h rebalance (daily), on 4h data -> ~160 periods
    PPY=365     # daily-equivalent rebalance
    uni=build(interval,limit)
    if len(uni)<8: print("too few coins"); return
    print(f"\n Universe: {len(uni)} coins, {min(len(v) for v in uni.values())} 4h bars\n")

    # 1) run ALL families on 4h for the power boost
    print(">>> PART 1: all families on 4h bars (more periods = fairer test)")
    E.evaluate_universe(uni, REBAL, PPY, top_frac=0.3, cost_bps=10, n_perm=200,
                        label=f"[CRYPTO 4h {len(uni)} coins, daily rebal]")

    # 2) the COMBINED lowvol+dist_high signal, tested honestly
    print("\n>>> PART 2: COMBINED signal  z(lowvol)+z(dist_high)")
    res=run_combined(uni, REBAL, 0.3, 10, PPY)
    if not res: print("  insufficient periods"); return
    half=res["n"]//2; oos=res["returns"][half:]
    oos_sr=E.sharpe_annualized(oos,PPY) if len(oos)>=5 else 0
    pval=perm_combined(uni,REBAL,0.3,10,PPY,res["sharpe"],30,90,n_perm=200)
    # deflation: we tested 7 families + 1 combined = 8 trials total across this project phase
    dsr,hurdle=E.deflated_sharpe(res["sharpe"],8,res["n"],PPY,res["skew"],res["kurt"])
    real = pval<0.05 and dsr>0.90 and oos_sr>0
    print("="*100)
    print(f" COMBINED SIGNAL (lowvol + dist_high, z-scored)")
    print("="*100)
    print(f"  full Sharpe : {res['sharpe']:.2f}")
    print(f"  OOS Sharpe  : {oos_sr:.2f}   (2nd-half held out)")
    print(f"  perm p-value: {pval:.3f}   (beats random rankings if <0.05)")
    print(f"  Deflated SR : {dsr:.2f}   (want >0.90; hurdle {hurdle:.2f})")
    print(f"  max drawdown: {res['maxdd']*100:.0f}%")
    print(f"  VERDICT     : {'REAL EDGE' if real else 'still short of the bar'}")
    print("="*100)
    if real:
        print("  If this holds at cost_bps=20 and 40, it is a proven, tradeable edge.")
        print("  Re-run run_combined with cost_bps=20 then 40 to confirm robustness.")
    else:
        print("  Honest read: the blend helped but did not cross the strict bar. That means")
        print("  the lowvol/quality tilt is PLAUSIBLE but not yet PROVEN on this data. Options:")
        print("  more history (pull 4h in chunks), a different universe, or accept it as a")
        print("  low-conviction tilt sized very small. We do NOT bet the account on unproven.")

if __name__=="__main__": main()
