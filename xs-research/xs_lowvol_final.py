#!/usr/bin/env python3
"""
FINAL LOWVOL TEST — the one pre-specified shot at the lone surviving signal.
Run in Cloud Shell:  python3 xs_lowvol_final.py

WHY THIS IS NOT MORE P-HACKING
  We are NOT sweeping signals looking for a winner. lowvol is the single
  pre-registered hypothesis that survived every prior run (positive full AND
  OOS every time). We test THAT ONE signal properly:
    - at its real (long, 30-day) horizon, where it was strongest
    - with MORE daily history (paginate past Binance's 1000-bar cap) — real added
      periods at the SAME horizon, which is the power boost the 4h run failed to
      give (4h accidentally shortened the window to 5 days and weakened it)
    - in BOTH forms: classic long/short, and the documented long-tilt form
      (own low-vol, short the equal-weight market) that FX/equity funds actually run
    - across costs 10/20/40 bps

HARD STOPPING RULE (decide BEFORE seeing numbers)
  lowvol is a REAL, tradeable edge ONLY if the PRIMARY test (long/short, max
  history, 10 bps) clears all three gates  perm_p<0.05 AND DSR>0.90 AND oosSR>0
  AND stays net-positive at 20 bps. If it does not, the conclusion is final:
  no provable systematic edge on this universe. We do NOT trade it, we do NOT
  keep tuning. That is the discipline that was missing when real money was lost.

n_trials for deflation = 9 (7 original families + the combined signal + this),
counted honestly so the hurdle reflects everything we have ever looked at.
"""
import json, math, time, urllib.request
import xs_engine as E

CRYPTO_UNIVERSE = [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT",
    "LINKUSDT","DOTUSDT","MATICUSDT","LTCUSDT","BCHUSDT","ATOMUSDT","UNIUSDT","ETCUSDT",
    "XLMUSDT","NEARUSDT","ALGOUSDT","FILUSDT","APTUSDT","ARBUSDT","OPUSDT","INJUSDT",
    "AAVEUSDT","MKRUSDT","SANDUSDT","MANAUSDT","AXSUSDT","FTMUSDT","THETAUSDT","EOSUSDT",
    "XTZUSDT","GRTUSDT","RUNEUSDT","CHZUSDT","SNXUSDT","CRVUSDT","LDOUSDT","DYDXUSDT",
]
HOSTS = ["https://data-api.binance.vision","https://api.binance.com"]
N_TRIALS = 9            # honest cumulative trial count for deflation
VOL_LB   = 30           # 30-day realized-vol window (the horizon where lowvol was strongest)
REBAL    = 7            # weekly rebalance
PPY      = 52
TOP_FRAC = 0.3

def _get(url):
    for h in HOSTS:
        try:
            req=urllib.request.Request(h+url, headers={"User-Agent":"timi-xs/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r: return json.loads(r.read())
        except Exception: continue
    return None

def fetch_daily_paged(symbol, target_bars=2500):
    """Page BACKWARD past the 1000-cap to collect up to target_bars daily closes."""
    by_t={}; end=None
    while len(by_t) < target_bars:
        q=f"/api/v3/klines?symbol={symbol}&interval=1d&limit=1000"
        if end is not None: q+=f"&endTime={end}"
        d=_get(q)
        if not isinstance(d,list) or not d: break
        for k in d: by_t[int(k[0])]=float(k[4])
        oldest=min(int(k[0]) for k in d)
        if end is not None and oldest>=end: break
        end=oldest-1
        if len(d)<1000: break
        time.sleep(0.12)
    ts=sorted(by_t)
    return [by_t[t] for t in ts][-target_bars:]   # honor target_bars (whole 1000-batches overshoot)

def build(target_bars=2500, min_keep=1500):
    print("="*100); print(f" FETCHING DAILY (paged past 1000-cap, up to {target_bars} bars/coin)"); print("="*100)
    raw={}
    for i,s in enumerate(CRYPTO_UNIVERSE):
        c=fetch_daily_paged(s,target_bars)
        raw[s]=c; print(f"  [{i+1}/{len(CRYPTO_UNIVERSE)}] {s}: {len(c)} daily bars", flush=True)
        time.sleep(0.1)
    # choose alignment that keeps coins with >= min_keep bars
    keep={s:c for s,c in raw.items() if len(c)>=min_keep}
    if len(keep)<8:
        keep={s:c for s,c in raw.items() if len(c)>=1000}   # fall back to the 1000 floor
    if len(keep)<8:                                          # guard: don't crash on empty min()
        print(f"\n  Only {len(keep)} coins have enough history (need >=8). Check network/data. Aborting cleanly.")
        return {}, 0
    n=min(len(c) for c in keep.values())
    uni={s:c[-n:] for s,c in keep.items()}
    print(f"\n  Aligned universe: {len(uni)} coins x {n} daily bars "
          f"(dropped {len(raw)-len(uni)} coins with <{min_keep} bars)\n")
    return uni, n

# ── low-vol-basket-minus-equal-weight-market (the "long-tilt" diagnostic) ──
# NOTE ON NAMING: this is NOT long-only low-vol. It is (low-vol basket) MINUS
# (equal-weight market). The short leg is the ENTIRE universe held equal-weight
# every period, so for a FIXED universe its composition never changes and its
# turnover is ~0 by construction — only the long basket turns over, which is what
# the cost term charges. If the universe membership changed over time, the market
# leg would need its own turnover term; it does not here. The real cost of actually
# running a short market basket (borrow/funding) is the executability gap, separate
# from backtest turnover and NOT modeled.
def run_lowvol_tilt(universe, cost_bps):
    syms=list(universe.keys()); n=min(len(universe[s]) for s in syms)
    series={s:universe[s][-n:] for s in syms}
    rets=[]; prevL=set(); t=REBAL
    while t<n-REBAL:
        sc={s:E.sig_lowvol(series[s][:t+1],VOL_LB) for s in syms}
        sc={s:v for s,v in sc.items() if v is not None}
        if len(sc)<4: t+=REBAL; continue
        ranked=sorted(sc,key=sc.get,reverse=True); k=max(1,int(len(ranked)*TOP_FRAC))
        L=set(ranked[:k])
        def fwd(sy):
            r=[]
            for s in sy:
                p0,p1=series[s][t],series[s][t+REBAL]
                if p0>0: r.append(p1/p0-1)
            return E.mean(r) if r else 0
        mkt=fwd(syms)                       # equal-weight market = the short leg (fixed set -> ~0 turnover)
        turnover=len(L^prevL)/k if k else 0
        rets.append((fwd(L)-mkt)-turnover*(cost_bps/10000.0)); prevL=L; t+=REBAL
    if len(rets)<5: return None
    return dict(returns=rets,n=len(rets),sharpe=E.sharpe_annualized(rets,PPY),
                maxdd=E.max_drawdown(rets),skew=E.skewness(rets),kurt=E.kurtosis(rets))

def perm_tilt_pvalue(universe, cost_bps, real_sr, n_perm=200, seed=42):
    """Matched null for the tilt: random basket (not the low-vol basket) minus the
       SAME equal-weight market, identical turnover cost. Gives the tilt a real p-value
       so it can face the same gate instead of showing 'n/a'."""
    import random as _r
    rng=_r.Random(seed); syms=list(universe.keys()); n=min(len(universe[s]) for s in syms)
    series={s:universe[s][-n:] for s in syms}; beat=0
    for _ in range(n_perm):
        rets=[]; prevL=set(); t=REBAL
        while t<n-REBAL:
            valid=[s for s in syms if E.sig_lowvol(series[s][:t+1],VOL_LB) is not None]
            if len(valid)<4: t+=REBAL; continue
            sh=valid[:]; rng.shuffle(sh); k=max(1,int(len(sh)*TOP_FRAC)); L=set(sh[:k])
            def fwd(sy):
                r=[]
                for s in sy:
                    p0,p1=series[s][t],series[s][t+REBAL]
                    if p0>0: r.append(p1/p0-1)
                return E.mean(r) if r else 0
            turnover=len(L^prevL)/k if k else 0
            rets.append((fwd(L)-fwd(valid))-turnover*(cost_bps/10000.0)); prevL=L; t+=REBAL
        if len(rets)>=5 and E.sharpe_annualized(rets,PPY)>=real_sr: beat+=1
    return (beat+1)/(n_perm+1)

def gate(label, res, universe, score_fn, cost_bps, is_ls, pval=None):
    if not res: print(f"  {label}: insufficient periods"); return None
    npd = res.get("n", res.get("n_periods"))
    half=npd//2
    returns = res["returns"]
    oos=returns[half:]; oos_sr=E.sharpe_annualized(oos,PPY) if len(oos)>=5 else 0
    if pval is None:
        if is_ls:
            pval=E.permutation_pvalue(universe,score_fn,REBAL,res["sharpe"],TOP_FRAC,cost_bps,PPY,n_perm=200)
        else:
            pval=float("nan")
    dsr,hurdle=E.deflated_sharpe(res["sharpe"],N_TRIALS,npd,PPY,res["skew"],res["kurt"])
    pv = "n/a" if math.isnan(pval) else f"{pval:.3f}"
    print(f"  {label:34s} fullSR {res['sharpe']:+.2f}  oosSR {oos_sr:+.2f}  "
          f"perm_p {pv:>5}  DSR {dsr:.2f}  (hurdle {hurdle:.2f})  maxDD {res['maxdd']*100:.0f}%")
    return dict(full=res["sharpe"],oos=oos_sr,pval=pval,dsr=dsr)

def main():
    uni,n=build()
    if len(uni)<8: print("too few coins"); return
    lowvol=lambda c: E.sig_lowvol(c,VOL_LB)

    print("="*100); print(" PRIMARY TEST — lowvol long/short, max history, cost sweep"); print("="*100)
    primary={}
    for cb in (10,20,40):
        r=E.run_cross_sectional(uni,lowvol,REBAL,TOP_FRAC,cb,PPY)
        primary[cb]=gate(f"long/short  @ {cb}bps",r,uni,lowvol,cb,is_ls=True)

    print("\n"+"="*100); print(" SUPPORTING — lowvol-basket minus equal-wt market (now with a matched perm test)"); print("="*100)
    for cb in (10,20,40):
        tr=run_lowvol_tilt(uni,cb)
        tpv=perm_tilt_pvalue(uni,cb,tr["sharpe"]) if tr else None
        gate(f"tilt        @ {cb}bps",tr,uni,lowvol,cb,is_ls=False,pval=tpv)

    print("\n"+"="*100); print(" HISTORY-DEPTH CHECK — does more data strengthen lowvol L/S? (10bps)"); print("="*100)
    for depth in (1000, min(1500,n), n):
        if depth>n: continue
        sub={s:uni[s][-depth:] for s in uni}
        r=E.run_cross_sectional(sub,lowvol,REBAL,TOP_FRAC,10,PPY)
        gate(f"last {depth} bars",r,sub,lowvol,10,is_ls=True)

    print("\n"+"="*100); print(" VERDICT (hard stopping rule — 10bps gates AND net-positive at 20 AND 40bps)"); print("="*100)
    p10=primary.get(10); p20=primary.get(20); p40=primary.get(40)
    passed = bool(p10 and p20 and p40 and p10["pval"]<0.05 and p10["dsr"]>0.90
                  and p10["oos"]>0 and p20["full"]>0 and p40["full"]>0)   # 40bps now enforced
    if passed:
        print("  lowvol CLEARS the predeclared bar: 10bps gates pass, full Sharpe stays positive")
        print("  at BOTH 20 and 40bps. That makes it a candidate worth a pre-registered holdout")
        print("  test on unseen forward data with a real execution/funding model — NOT a trade")
        print("  signal yet. Nothing goes to real money before paper-trading matches the backtest.")
    else:
        print("  lowvol does NOT clear the predeclared bar. Precise conclusion: THIS IMPLEMENTATION")
        print("  FAILED ITS STATED ACCEPTANCE CRITERIA on this universe and must not be traded.")
        print("  That is NOT proof the low-vol effect is impossible — the test machinery and the")
        print("  tradability model have known limits (see CALIBRATION/HARDENING reports). Do not")
        print("  tune further on this universe (selection-bias trap). A defensible path forward is")
        print("  a pre-registered holdout test with a real execution model, or a structurally")
        print("  different setup (far more instruments, intraday microstructure, or a data edge).")
    print("="*100)

if __name__=="__main__": main()
