#!/usr/bin/env python3
"""
FUNDING CARRY — ACID TEST: rerun the candidate through NEXT-OPEN execution + real fills +
liquidation (short-squeeze modeling) + leverage sweep. This is the exact gauntlet that
turned the fake low-vol +1.46 Sharpe into a negative result. If funding carry survives it,
it graduates from 'screen candidate' to 'worth a forward/paper test'. If it collapses here,
the screen result was execution idealization.

  python3 xs_funding_exec.py            # live (Binance futures)
  python3 xs_funding_exec.py --selftest # synthetic, no network

Changes vs the screen (xs_funding.py):
  - Decide on funding through day t; ENTER at day t+1 OPEN; exit at t+1+REBAL OPEN. No
    deciding and trading on the same close.
  - Price P&L from open-to-open; real intra-hold high/low drives liquidation.
  - Funding P&L from REAL funding accrued over the hold (unchanged — this is the carry).
  - Isolated-margin liquidation: a short squeezed past its margin is force-closed at the
    loss cap (the realistic failure mode of shorting crowded perps).
  - Account-level returns; fees+spread+slippage on turnover both legs.
"""
import math, random, time, bisect
import xs_engine as E
try:
    from xs_funding import fetch_funding, FAPI, _get, PERP_UNIVERSE, DAY, _day
except Exception:
    fetch_funding=FAPI=_get=PERP_UNIVERSE=None; DAY=86400000
    def _day(ts): return (ts//DAY)*DAY

WINDOWS=[14,30]; REBAL=7; PPY=52; TOP_FRAC=0.3

def fetch_perp_ohlc(symbol, target=1600):
    out={}; end=None
    while len(out)<target:
        u=f"{FAPI}/fapi/v1/klines?symbol={symbol}&interval=1d&limit=1500"
        if end is not None: u+=f"&endTime={end}"
        d=_get(u)
        if not isinstance(d,list) or not d: break
        for k in d: out[int(k[0])]=dict(o=float(k[1]),h=float(k[2]),l=float(k[3]),c=float(k[4]))
        oldest=min(int(k[0]) for k in d)
        if end is not None and oldest>=end: break
        end=oldest-1
        if len(d)<1500: break
        time.sleep(0.1)
    return out

def build(raw_fund, raw_ohlc):
    coins={}
    for s in raw_ohlc:
        if s not in raw_fund: continue
        fd={}
        for ts,r in raw_fund[s].items(): fd[_day(ts)]=fd.get(_day(ts),0.0)+r
        od={_day(ts):v for ts,v in raw_ohlc[s].items()}
        days=sorted(set(od)&set(fd))
        if len(days)>=200:
            coins[s]=dict(days=days, o=[od[d]["o"] for d in days], h=[od[d]["h"] for d in days],
                          l=[od[d]["l"] for d in days], c=[od[d]["c"] for d in days],
                          fund=[fd[d] for d in days], pos={d:i for i,d in enumerate(days)})
    if len(coins)<8: return None,None
    master=sorted(set().union(*[set(cd["days"]) for cd in coins.values()]))
    print(f"  [data] {len(coins)} perps, union {len(master)} days (~{(master[-1]-master[0])/DAY:.0f}d)")
    return master, coins

def simulate(coins, master, W, rebal=REBAL, exec_lag=1, top_frac=TOP_FRAC, leverage=2.0,
             maint_margin=0.005, fee_bps=4, half_spread_bps=1, slippage_bps=2):
    per=(fee_bps+half_spread_bps+slippage_bps)/10000.0
    def exit_idx(cd,j0,T1):
        j=cd["pos"].get(T1)
        if j is not None: return j
        p=bisect.bisect_right(cd["days"],T1)-1
        return p if p>j0 else None
    acct=[]; price_c=[]; fund_c=[]; dates=[]; liq=0; prev={}; m=W
    while m+exec_lag+rebal < len(master):
        Td=master[m]; T0=master[m+exec_lag]; T1=master[m+exec_lag+rebal]
        legs={}
        for s,cd in coins.items():
            j=cd["pos"].get(Td)
            if j is None or j<W or T0 not in cd["pos"]: continue
            j0=cd["pos"][T0]; j1=exit_idx(cd,j0,T1)
            if j1 is None: continue
            sig=sum(cd["fund"][j-W+1:j+1])/W
            legs[s]=dict(sig=sig, j0=j0, j1=j1, cd=cd)
        if len(legs)<8: m+=rebal; continue
        ordered=sorted(legs, key=lambda s:legs[s]["sig"], reverse=True)
        k=max(1,int(len(ordered)*top_frac))
        shorts=ordered[:k]; longs=ordered[-k:]
        w={s:0.5/k for s in longs}; w.update({s:-0.5/k for s in shorts})
        price=0.0; fund=0.0
        for s,wi in w.items():
            L=legs[s]; cd=L["cd"]; p0=cd["o"][L["j0"]]; p1=cd["o"][L["j1"]]
            if p0<=0: continue
            is_long = wi>0
            seg_hi=max(cd["h"][L["j0"]:L["j1"]+1]); seg_lo=min(cd["l"][L["j0"]:L["j1"]+1])
            adverse=(seg_lo/p0-1.0) if is_long else (1.0-seg_hi/p0)
            max_loss=-(1.0/leverage-maint_margin)
            if adverse<=max_loss:
                price+=abs(wi)*max_loss; liq+=1            # squeezed/stopped out at the cap
            else:
                r=(p1/p0-1.0) if is_long else (1.0-p1/p0)  # correct short P&L
                price+=abs(wi)*r
            fsum=sum(cd["fund"][L["j0"]+1:L["j1"]+1])       # funding accrued over hold
            fund += -wi*fsum
        turnover=sum(abs(w.get(s,0)-prev.get(s,0)) for s in set(w)|set(prev))
        acct.append(price+fund-turnover*per); price_c.append(price); fund_c.append(fund)
        dates.append(Td); prev=w
        m+=rebal
    if len(acct)<8: return None
    def sr(x): s=E.pstd(x); return (E.mean(x)/s)*math.sqrt(PPY) if s>0 else 0.0
    half=len(acct)//2
    return dict(n=len(acct), sharpe=sr(acct), oos=sr(acct[half:]), maxdd=E.max_drawdown(acct),
                price=sr(price_c), fund=sr(fund_c), liq=liq, acct=acct, dates=dates,
                total=math.prod([1+r for r in acct])-1)

def report(res,label):
    if not res: print(f"  {label}: insufficient"); return
    print(f"  {label:22s} net {res['sharpe']:+.2f}  OOS {res['oos']:+.2f}  maxDD {res['maxdd']*100:.0f}%  "
          f"liq {res['liq']}  tot {res['total']*100:+.0f}%  [priceSR {res['price']:+.2f} fundSR {res['fund']:+.2f}]")

def run(coins, master):
    for W in WINDOWS:
        print(f"\n--- W={W} : cost + leverage sweep (next-open execution) ---")
        for cb in (7,12):
            report(simulate(coins,master,W,leverage=2.0,fee_bps=cb-3,half_spread_bps=1,slippage_bps=2),
                   f"cost~{cb}bps lev2x")
        for lev in (1.0,2.0,3.0,5.0):
            report(simulate(coins,master,W,leverage=lev,fee_bps=4,half_spread_bps=1,slippage_bps=2),
                   f"realistic lev{lev:.0f}x")
    print("\n"+"="*96)
    print(" READING IT: carry survives the acid test only if net Sharpe stays clearly positive at")
    print(" realistic AND stressed costs AND across the leverage sweep (esp. 1x = no squeeze cushion),")
    print(" with liquidations not exploding. If net collapses at 1x or stressed, the screen result")
    print(" was execution idealization. Surviving here earns a FORWARD/paper test, still not capital.")
    print("="*96)

def regime_report(coins, master, W=30, leverage=1.0):
    """Does the carry hold across sub-periods, or is it one era? Splits the W=30, 1x book's
    per-period returns by CALENDAR YEAR and reports each year's Sharpe + total. A strategy
    that is only positive in one year (e.g. the 2021 funding bull) is a regime bet, not an edge."""
    import datetime
    res=simulate(coins, master, W, leverage=leverage, fee_bps=4, half_spread_bps=1, slippage_bps=2)
    if not res: print("  regime: insufficient"); return
    by_year={}
    for d,r in zip(res["dates"], res["acct"]):
        y=datetime.datetime.utcfromtimestamp(d/1000).year
        by_year.setdefault(y,[]).append(r)
    print(f"\n REGIME CHECK — W={W}, leverage {leverage:.0f}x, by calendar year:")
    pos_years=0; tot_years=0
    for y in sorted(by_year):
        rr=by_year[y]
        if len(rr)<5: print(f"   {y}: (only {len(rr)} periods)"); continue
        s=E.pstd(rr); shy=(E.mean(rr)/s)*math.sqrt(PPY) if s>0 else 0.0
        tt=math.prod([1+x for x in rr])-1
        tot_years+=1; pos_years+= (shy>0)
        print(f"   {y}: Sharpe {shy:+.2f}   total {tt*100:+.0f}%   ({len(rr)} periods)")
    print(f"  -> positive in {pos_years}/{tot_years} years."
          f" {'Broad-based (not one-era).' if pos_years>=max(3,tot_years-1) else 'CONCENTRATED — treat as a regime bet, not a robust edge.'}")

def main():
    if fetch_funding is None: print("need xs_funding.py alongside this file."); return
    print("="*96); print(" FUNDING CARRY — ACID TEST (next-open execution + liquidation)"); print("="*96)
    rf={}; ro={}
    for i,s in enumerate(PERP_UNIVERSE):
        f=fetch_funding(s); o=fetch_perp_ohlc(s)
        if f and o: rf[s]=f; ro[s]=o; print(f"  [{i+1}/{len(PERP_UNIVERSE)}] {s}: {len(f)} funding, {len(o)} days", flush=True)
        else: print(f"  [{i+1}/{len(PERP_UNIVERSE)}] {s}: skip", flush=True)
        time.sleep(0.1)
    master,coins=build(rf,ro)
    if not coins: print("Not enough data."); return
    run(coins,master)
    regime_report(coins, master, W=30, leverage=1.0)    # one-era fluke check

def _selftest():
    print("#"*96); print("# ACID-TEST SELF-TEST — persistent carry should survive next-open exec; random flat"); print("#"*96)
    def make(persistent,n=24,days=900,seed=1):
        rng=random.Random(seed); coins={}; master=[i*DAY for i in range(days)]
        level=[rng.uniform(-0.0004,0.0004) for _ in range(n)]
        for a in range(n):
            o=[];h=[];l=[];c=[];fund=[]; px=100.0
            for t in range(days):
                op=px*(1+rng.gauss(0,0.002)); cl=op*math.exp(rng.gauss(0,0.03))
                hi=max(op,cl)*(1+abs(rng.gauss(0,0.01))); lo=min(op,cl)*(1-abs(rng.gauss(0,0.01)))
                o.append(op);h.append(hi);l.append(lo);c.append(cl); px=cl
                fund.append((level[a] if persistent else 0.0)+rng.gauss(0,0.0003))
            coins[f"C{a}"]=dict(days=master[:],o=o,h=h,l=l,c=c,fund=fund,pos={master[i]:i for i in range(days)})
        return master,coins
    for lbl,p in (("random funding",False),("persistent spread",True)):
        master,coins=make(p,seed=(5 if p else 2))
        print(f"\n [{lbl}]")
        for W in WINDOWS: report(simulate(coins,master,W,leverage=2.0),f"W={W} realistic lev2x")

if __name__=="__main__":
    import sys
    _selftest() if "--selftest" in sys.argv else main()
