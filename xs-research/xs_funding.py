#!/usr/bin/env python3
"""
CRYPTO PERPETUAL FUNDING-RATE CARRY — the pre-registered experiment in PREREG_FUNDING.md.
Short the highest-funding perps, long the most-negative, collect the funding spread while
dollar-neutral on price. Run in Cloud Shell (Binance futures API):

  python3 xs_funding.py            # live
  python3 xs_funding.py --selftest # synthetic validation, no network

Reports price P&L and funding P&L SEPARATELY, so you can see whether carry is actually
captured or whether price noise dominates. Carry has a defined economic source, but that
does not guarantee it survives costs and price variance — that is what the gates test.
A null result is an acceptable, recorded outcome.
"""
import json, math, random, time, urllib.request, datetime
import xs_engine as E

PERP_UNIVERSE = [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT",
    "LINKUSDT","DOTUSDT","LTCUSDT","BCHUSDT","ATOMUSDT","UNIUSDT","ETCUSDT","XLMUSDT",
    "NEARUSDT","ALGOUSDT","FILUSDT","APTUSDT","ARBUSDT","OPUSDT","INJUSDT","AAVEUSDT",
    "SANDUSDT","MANAUSDT","FTMUSDT","EOSUSDT","GRTUSDT","RUNEUSDT","CRVUSDT","LDOUSDT",
]
FAPI = "https://fapi.binance.com"
WINDOWS=[7,14,30]; REBAL=7; PPY=52; TOP_FRAC=0.3; N_TRIALS=len(WINDOWS)
DAY=86400000

def _get(url):
    try:
        req=urllib.request.Request(url, headers={"User-Agent":"timi-xs/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r: return json.loads(r.read())
    except Exception: return None

def fetch_funding(symbol, target=6000):
    """Paginate /fapi/v1/fundingRate -> {fundingTime ms: rate}. ~3/day (8h). The endpoint
    returns up to ~500/page, so page by endTime until the history stops going older."""
    out={}; end=None; last_oldest=None
    while len(out)<target:
        u=f"{FAPI}/fapi/v1/fundingRate?symbol={symbol}&limit=1000"
        if end is not None: u+=f"&endTime={end}"
        d=_get(u)
        if not isinstance(d,list) or not d: break
        for r in d: out[int(r["fundingTime"])]=float(r["fundingRate"])
        oldest=min(int(r["fundingTime"]) for r in d)
        if last_oldest is not None and oldest>=last_oldest: break   # no older data -> done
        last_oldest=oldest; end=oldest-1
        time.sleep(0.1)
    return out

def fetch_perp_daily(symbol, target=1600):
    out={}; end=None
    while len(out)<target:
        u=f"{FAPI}/fapi/v1/klines?symbol={symbol}&interval=1d&limit=1500"
        if end is not None: u+=f"&endTime={end}"
        d=_get(u)
        if not isinstance(d,list) or not d: break
        for k in d: out[int(k[0])]=float(k[4])
        oldest=min(int(k[0]) for k in d)
        if end is not None and oldest>=end: break
        end=oldest-1
        if len(d)<1500: break
        time.sleep(0.1)
    return out

def _day(ts): return (ts//DAY)*DAY

def build(raw_fund, raw_close):
    """Align daily close + daily funding (sum of 8h rates in the UTC day) on common days."""
    coins={}
    for s in raw_close:
        if s not in raw_fund: continue
        fund_daily={}
        for ts,r in raw_fund[s].items(): fund_daily[_day(ts)]=fund_daily.get(_day(ts),0.0)+r
        close_daily={_day(ts):c for ts,c in raw_close[s].items()}
        days=sorted(set(close_daily)&set(fund_daily))
        if len(days)>=200:
            coins[s]=dict(days=days, close=[close_daily[d] for d in days],
                          fund=[fund_daily[d] for d in days], pos={d:i for i,d in enumerate(days)})
    if len(coins)<8: return None,None
    master=sorted(set().union(*[set(cd["days"]) for cd in coins.values()]))
    print(f"  [data] {len(coins)} perps, union {len(master)} days (~{(master[-1]-master[0])/DAY:.0f}d)")
    return master, coins

# ───────────────────────── carry backtest ─────────────────────────
def carry_periods(coins, master, W, rebal=REBAL):
    """Precompute per-period eligible legs: signal (trailing mean funding), forward price
    return, forward funding sum. Invariant across sign assignment."""
    M=len(master); out=[]
    m=W
    while m+rebal < M:
        Td=master[m]; legs={}
        for s,cd in coins.items():
            j=cd["pos"].get(Td)
            if j is None or j<W: continue
            # need a bar `rebal` days ahead on this coin's own timeline
            Tnext=master[m+rebal]; jn=cd["pos"].get(Tnext)
            if jn is None or jn<=j: continue
            sig=sum(cd["fund"][j-W+1:j+1])/W
            price_fwd=cd["close"][jn]/cd["close"][j]-1.0 if cd["close"][j]>0 else None
            if price_fwd is None: continue
            fund_fwd=sum(cd["fund"][j+1:jn+1])              # funding accrued over the hold
            legs[s]=dict(sig=sig, price=price_fwd, fund=fund_fwd)
        if len(legs)>=8: out.append(legs)
        m+=rebal
    return out

def periods_to_returns(periods, rank_fn, cost_bps):
    """rank_fn(legs)->(longs,shorts) lists. Dollar-neutral equal weight, gross=1."""
    per=cost_bps/10000.0; rets=[]; price_c=[]; fund_c=[]; prev={}
    for legs in periods:
        longs,shorts=rank_fn(legs); k=len(longs)
        if k==0 or len(shorts)==0: continue
        wl=0.5/k; ws=0.5/len(shorts)
        w={s:wl for s in longs}; w.update({s:-ws for s in shorts})
        price=sum(w[s]*legs[s]["price"] for s in w)
        fund =sum(-w[s]*legs[s]["fund"] for s in w)         # -w*Σf: short+f receive, long-f receive
        turnover=sum(abs(w.get(s,0)-prev.get(s,0)) for s in set(w)|set(prev))
        rets.append(price+fund-turnover*per); price_c.append(price); fund_c.append(fund); prev=w
    return rets, price_c, fund_c

def rank_by_funding(legs):
    ordered=sorted(legs, key=lambda s:legs[s]["sig"], reverse=True)  # high funding first
    k=max(1,int(len(ordered)*TOP_FRAC))
    shorts=ordered[:k]; longs=ordered[-k:]                           # short high-f, long low-f
    return longs, shorts

def sr(x):
    s=E.pstd(x); return (E.mean(x)/s)*math.sqrt(PPY) if (len(x)>=5 and s>0) else 0.0

def perm_pvalue(periods, real_sr, cost_bps, n_perm=200, seed=42):
    rng=random.Random(seed); beat=0
    for _ in range(n_perm):
        def rf(legs):
            ss=list(legs); rng.shuffle(ss); k=max(1,int(len(ss)*TOP_FRAC))
            return ss[-k:], ss[:k]   # random longs/shorts
        r,_,_=periods_to_returns(periods, rf, cost_bps)
        if sr(r)>=real_sr: beat+=1
    return (beat+1)/(n_perm+1)

def evaluate(coins, master, W, cost_bps, label):
    periods=carry_periods(coins, master, W)
    r,pc,fc=periods_to_returns(periods, rank_by_funding, cost_bps)
    if len(r)<8: print(f"  W={W:3d} {label}: insufficient periods"); return None
    srv=sr(r); half=len(r)//2; oos=sr(r[half:])
    p=perm_pvalue(periods, srv, cost_bps)
    dsr,hur=E.deflated_sharpe(srv, N_TRIALS, len(r), PPY, E.skewness(r), E.kurtosis(r))
    print(f"  W={W:3d} {label:10s} Sharpe {srv:+.2f}  OOS {oos:+.2f}  perm-p {p:.3f}  DSR {dsr:.2f}  "
          f"maxDD {E.max_drawdown(r)*100:.0f}%  [priceSR {sr(pc):+.2f} fundSR {sr(fc):+.2f}]")
    return dict(W=W, sharpe=srv, oos=oos, pval=p, dsr=dsr, fundSR=sr(fc))

def main():
    print("="*98); print(" FUNDING-RATE CARRY — pre-registered (see PREREG_FUNDING.md)"); print("="*98)
    rf={}; rc={}
    for i,s in enumerate(PERP_UNIVERSE):
        f=fetch_funding(s); c=fetch_perp_daily(s)
        if f and c: rf[s]=f; rc[s]=c; print(f"  [{i+1}/{len(PERP_UNIVERSE)}] {s}: {len(f)} funding, {len(c)} days", flush=True)
        else: print(f"  [{i+1}/{len(PERP_UNIVERSE)}] {s}: skip", flush=True)
        time.sleep(0.1)
    master,coins=build(rf,rc)
    if not coins: print("Not enough perp data (fapi reachable?)."); return
    real={}; stre={}
    for scen,cb,store in (("realistic",7,real),("stressed",12,stre)):
        print(f"\n--- {scen} costs ({cb}bps/side-equiv) ---")
        for W in WINDOWS: store[W]=evaluate(coins, master, W, cb, scen)
    print("\n"+"="*98); print(" VERDICT (pre-committed gates)"); print("="*98)
    passed=False
    for W in WINDOWS:
        a=real.get(W); b=stre.get(W)
        if a and b and a["pval"]<0.05 and a["dsr"]>0.90 and a["oos"]>0 and a["sharpe"]>0 and b["sharpe"]>0:
            passed=True; print(f"  W={W}: CANDIDATE — clears all gates. Next: real-fill execution + untouched test, NOT capital.")
    if not passed:
        print("  No window clears the pre-committed bar.")
        print("  Per the stopping rule: funding-rate carry NOT demonstrated on this universe/sample.")
        print("  (Check the fundSR column: if funding P&L alone is strongly positive but net fails,")
        print("   the carry exists but price noise/costs eat it — informative, still not a pass.)")
    print("="*98)

# ───────────────────────── synthetic self-test ─────────────────────────
def _selftest():
    print("#"*98); print("# FUNDING-CARRY SELF-TEST — detect a persistent funding spread, reject random funding"); print("#"*98)
    def make(persistent, n=24, days=900, seed=1):
        rng=random.Random(seed); coins={}; master=[i*DAY for i in range(days)]
        level=[rng.uniform(-0.0004,0.0004) for _ in range(n)]   # persistent per-coin funding
        for a in range(n):
            close=[100.0]; fund=[]
            for t in range(days):
                close.append(close[-1]*math.exp(rng.gauss(0,0.03)))
                f = (level[a] if persistent else 0.0) + rng.gauss(0,0.0003)
                fund.append(f)
            coins[f"C{a}"]=dict(days=master[:], close=close[1:], fund=fund, pos={master[i]:i for i in range(days)})
        return master, coins
    for lbl,pers in (("random funding (expect noise)",False),("persistent spread (expect detect)",True)):
        master,coins=make(pers, seed=(5 if pers else 2))
        print(f"\n [{lbl}]"); hits=0
        for W in WINDOWS:
            r=evaluate(coins, master, W, 7, "selftest")
            # identical composite gate to the live verdict (incl. DSR>0.90)
            if r and r["pval"]<0.05 and r["dsr"]>0.90 and r["oos"]>0 and r["sharpe"]>0: hits+=1
        print(f"   -> windows flagged (full gate): {hits}")
    print("\n (Pass = random funding flags ~0, persistent spread flags >=1.)")

if __name__=="__main__":
    import sys
    _selftest() if "--selftest" in sys.argv else main()
