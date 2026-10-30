#!/usr/bin/env python3
"""
FX TIME-SERIES (TREND) MOMENTUM — the pre-registered experiment in PREREG_FX_TSMOM.md.
A DIFFERENT hypothesis from the failed 8-currency cross-sectional test: each instrument is
judged on its OWN trend, so it is not breadth-limited. Popular liquid universe only.

  TD_KEY=your_twelvedata_key python3 xs_timeseries.py     # majors + gold
  python3 xs_timeseries.py                                 # Deriv fallback (USD majors only)

Honest framing: time-series momentum is one of the better-documented effects across asset
classes, so it is a reasonable hypothesis — but we do NOT presume it works. It must clear
the pre-registered gates (random-timing p<0.05, DSR>0.90, OOS>0, net-positive at realistic
AND stressed costs). A null result is an acceptable outcome and will be recorded as such.
"""
import math, os, random, time
import xs_engine as E
import xs_execution as X
try:
    from xs_forex_test import fetch_td, fetch_deriv
except Exception:
    fetch_td=fetch_deriv=None

UNIVERSE = ["EUR/USD","GBP/USD","AUD/USD","NZD/USD","USD/JPY","USD/CAD","USD/CHF","XAU/USD"]
LOOKBACKS = [20,60,90,120]           # FROZEN trial set
REBAL=7; PPY=52; VOL_LB=60; N_TRIALS=len(LOOKBACKS)

# ───────────────────────── time-series momentum backtest ─────────────────────────
def tsmom_periods(coins, master, L, rebal=REBAL, exec_lag=1):
    """Precompute per-period leg data ONCE: for each rebalance, the eligible instruments
    with their trend sign input, inverse-vol weight, and realized forward return. Invariant
    across sign choices, so both the observed run and the random-timing null reuse it."""
    import bisect
    M=len(master); out=[]
    def exit_idx(cd,j0,T1):
        j=cd["pos"].get(T1)
        if j is not None: return j
        p=bisect.bisect_right(cd["ts"],T1)-1
        return p if p>j0 else None
    m=0
    while m+exec_lag+rebal < M:
        Td=master[m]; T0=master[m+exec_lag]; T1=master[m+exec_lag+rebal]
        legs={}
        for s,cd in coins.items():
            jd=cd["pos"].get(Td)
            if jd is None or T0 not in cd["pos"] or jd<L or jd<VOL_LB: continue
            c=cd["close"]
            rr=[math.log(c[i]/c[i-1]) for i in range(jd-VOL_LB+1, jd+1) if c[i-1]>0]
            vol=E.pstd(rr)
            if vol<=0: continue
            j0=cd["pos"][T0]; j1=exit_idx(cd,j0,T1)
            if j1 is None: continue
            p0=cd["open"][j0]; p1=cd["open"][j1]
            if p0<=0: continue
            legs[s]=dict(trend=c[jd]/c[jd-L]-1.0, invvol=1.0/vol, fwd=p1/p0-1.0)
        if len(legs)>=4: out.append(legs)
        m+=rebal
    return out

def periods_to_returns(periods, sign_of, per_side, rollover_bps_per_day, rebal=REBAL):
    """sign_of(legs)->{s:+/-1}. Applies signs + inverse-vol weights to precomputed periods."""
    rets=[]; prev={}
    for legs in periods:
        syms=list(legs); Z=sum(legs[s]["invvol"] for s in syms)
        signs=sign_of(legs)
        cur={s:(legs[s]["invvol"]/Z)*signs[s] for s in syms}
        port=sum(cur[s]*legs[s]["fwd"] for s in syms)
        turnover=sum(abs(cur.get(s,0)-prev.get(s,0)) for s in set(cur)|set(prev))
        rollover=sum(abs(cur[s]) for s in syms)*(rollover_bps_per_day/10000.0)*rebal
        rets.append(port - turnover*per_side - rollover); prev=cur
    return rets

def tsmom_returns(coins, master, L, rebal=REBAL, exec_lag=1,
                  fee_bps=0.5, half_spread_bps=1.0, slippage_bps=0.5, rollover_bps_per_day=0.3):
    per_side=(fee_bps+half_spread_bps+slippage_bps)/10000.0
    periods=tsmom_periods(coins, master, L, rebal, exec_lag)
    return periods_to_returns(periods, lambda legs:{s:(1.0 if legs[s]["trend"]>0 else -1.0) for s in legs},
                              per_side, rollover_bps_per_day, rebal)

def random_timing_pvalue(coins, master, L, real_sr, n_perm=200, seed=42,
                         fee_bps=0.5, half_spread_bps=1.0, slippage_bps=0.5, rollover_bps_per_day=0.3):
    rng=random.Random(seed); per_side=(fee_bps+half_spread_bps+slippage_bps)/10000.0
    periods=tsmom_periods(coins, master, L)          # precompute ONCE
    beat=0
    for _ in range(n_perm):
        r=periods_to_returns(periods, lambda legs:{s:(1.0 if rng.random()<0.5 else -1.0) for s in legs},
                             per_side, rollover_bps_per_day)
        if len(r)>=5:
            s=E.pstd(r); sr=(E.mean(r)/s)*math.sqrt(PPY) if s>0 else 0.0
            if sr>=real_sr: beat+=1
    return (beat+1)/(n_perm+1)

def evaluate_lookback(coins, master, L, label, **costs):
    r=tsmom_returns(coins, master, L, **costs)
    if len(r)<8: print(f"  L={L:4d} {label}: insufficient periods"); return None
    s=E.pstd(r); sr=(E.mean(r)/s)*math.sqrt(PPY) if s>0 else 0.0
    half=len(r)//2; oos=r[half:]
    so=E.pstd(oos); oos_sr=(E.mean(oos)/so)*math.sqrt(PPY) if (len(oos)>=5 and so>0) else 0.0
    pval=random_timing_pvalue(coins, master, L, sr, n_perm=200, **costs)
    dsr,hurdle=E.deflated_sharpe(sr, N_TRIALS, len(r), PPY, E.skewness(r), E.kurtosis(r))
    mdd=E.max_drawdown(r)
    print(f"  L={L:4d} {label:11s} Sharpe {sr:+.2f}  OOS {oos_sr:+.2f}  rand-p {pval:.3f}  DSR {dsr:.2f}  maxDD {mdd*100:.0f}%")
    return dict(L=L, sharpe=sr, oos=oos_sr, pval=pval, dsr=dsr, maxdd=mdd)

# ───────────────────────── live FX run ─────────────────────────
REALISTIC=dict(fee_bps=0.5, half_spread_bps=1.0, slippage_bps=0.5, rollover_bps_per_day=0.3)
STRESSED =dict(fee_bps=1.0, half_spread_bps=2.0, slippage_bps=1.0, rollover_bps_per_day=1.0)

def main():
    if fetch_td is None: print("need xs_forex_test.py alongside this file."); return
    use_td=bool(os.environ.get("TD_KEY",""))
    print("="*96); print(" FX TIME-SERIES MOMENTUM — pre-registered (see PREREG_FX_TSMOM.md)"); print("="*96)
    print(f"  source: {'Twelve Data' if use_td else 'Deriv ws (USD majors only; set TD_KEY for gold+crosses)'}")
    raw={}
    for i,p in enumerate(UNIVERSE):
        bars=fetch_td(p) if use_td else fetch_deriv(p)
        if bars and len(bars)>=200: raw[p.replace("/","")]=bars; print(f"  [{i+1}/{len(UNIVERSE)}] {p}: {len(bars)}", flush=True)
        else: print(f"  [{i+1}/{len(UNIVERSE)}] {p}: skip", flush=True)
        if use_td: time.sleep(8.0)
    if len(raw)<4: print(f"\nOnly {len(raw)} instruments (need >=4). Set TD_KEY."); return
    master, coins = X.build_panel_calendar(raw, min_bars=200)

    for scen,costs in (("realistic",REALISTIC),("stressed",STRESSED)):
        print(f"\n--- {scen} costs ---")
        res={L:evaluate_lookback(coins, master, L, scen, **costs) for L in LOOKBACKS}
        if scen=="realistic": real_res=res
        if scen=="stressed":  str_res=res

    print("\n"+"="*96); print(" VERDICT (pre-committed gates)"); print("="*96)
    any_pass=False
    for L in LOOKBACKS:
        rr=real_res.get(L); sr=str_res.get(L)
        if not rr or not sr: continue
        ok = rr["pval"]<0.05 and rr["dsr"]>0.90 and rr["oos"]>0 and rr["sharpe"]>0 and sr["sharpe"]>0
        if ok:
            any_pass=True
            print(f"  L={L}: CANDIDATE — clears all gates. Next: pre-registered untouched/forward test, NOT capital.")
    if not any_pass:
        print("  No lookback clears the pre-committed bar.")
        print("  Per the stopping rule: FX time-series momentum NOT demonstrated on this universe/sample.")
        print("  Recorded as a null result. Do NOT try more lookbacks to rescue it.")
    print("="*96)

# ───────────────────────── synthetic self-test (no network) ─────────────────────────
def _selftest():
    print("#"*96); print("# TSMOM SELF-TEST — must detect a planted trend and reject a random walk"); print("#"*96)
    DAY=86400000
    def raw_trend(trending, n=8, bars=700, seed=1):
        rng=random.Random(seed); raw={}
        for a in range(n):
            o=[];h=[];l=[];c=[]; px=100.0; drift=rng.choice([-1,1])*0.0015
            for t in range(bars):
                if trending and t%120==0: drift=rng.choice([-1,1])*0.0015   # regime-persistent trend
                mu=drift if trending else 0.0
                op=px*(1+rng.gauss(0,0.001)); cl=op*math.exp(mu+rng.gauss(0,0.008))
                hi=max(op,cl)*(1+abs(rng.gauss(0,0.003))); lo=min(op,cl)*(1-abs(rng.gauss(0,0.003)))
                o.append(op);h.append(hi);l.append(lo);c.append(cl); px=cl
            raw[f"X{a}"]=[dict(ts=i*DAY,open=o[i],high=h[i],low=l[i],close=c[i]) for i in range(bars)]
        return raw
    for lbl,trending in (("random-walk (expect noise)",False),("planted-trend (expect detect)",True)):
        master,coins=X.build_panel_calendar(raw_trend(trending, seed=(7 if trending else 3)), min_bars=200)
        print(f"\n [{lbl}]")
        hits=0
        for L in LOOKBACKS:
            r=evaluate_lookback(coins, master, L, "selftest", **REALISTIC)
            if r and r["pval"]<0.05 and r["oos"]>0 and r["sharpe"]>0: hits+=1
        print(f"   -> lookbacks flagged: {hits}")
    print("\n (Pass = random-walk flags ~0, planted-trend flags >=1. Validates the TSMOM null.)")

if __name__=="__main__":
    import sys
    if "--selftest" in sys.argv: _selftest()
    else: main()
