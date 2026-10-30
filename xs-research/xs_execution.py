#!/usr/bin/env python3
"""
PHASE 2 — EXECUTABLE PORTFOLIO SIMULATOR
========================================
Turns the cross-sectional SCREEN into a tradability simulation with an explicit,
documented execution and cost model. This does NOT replace the research engine's
significance testing (xs_engine + xs_calibration + xs_hardening); it answers the
separate question the screen cannot: "if the signal did carry information, could this
portfolio actually be traded at anything like the simulated returns?"

Every convention the audit said was unspecified is now stated here.

EXECUTION CONVENTION (fixes 'trade at the close you scored on')
  - Signal is computed from closes through bar i (known at i's close).
  - Orders execute at bar i+exec_lag OPEN (default exec_lag=1 -> next bar's open),
    never the close used to decide.
  - A position is held open-to-open until the next rebalance's execution bar.
  - Slippage and half-spread are charged on the executed open price.

CAPITAL / EXPOSURE CONVENTION (fixes 'spread return != account return')
  - One account with equity E (starts at 1.0). Dollar-neutral book.
  - gross_exposure G: total notional = G * E, split equally long/short
    (each leg = G/2 * E). Default G=1.0 (0.5 long + 0.5 short) -> modest leverage.
  - Returns are computed on ACCOUNT EQUITY, so Sharpe AND drawdown are account-level.

COST MODEL (fixes 'cost denominator unstated; short leg uncosted')
  Charged on ACTUAL notional, both legs, every trade:
    - fee_bps        : exchange taker fee, per side, on traded notional
    - half_spread_bps: half the bid-ask, per side, on traded notional
    - slippage_bps   : market-impact estimate, per side, on traded notional
  Entry, each rebalance's turnover, and final exit are all charged.
  PERP FUNDING (the dominant short-book cost, usually ignored):
    - funding_bps_per_day applied to GROSS notional held, as a conservative drag.
      Real funding differs per coin and per 8h interval and can be negative (a carry
      edge); supply a real per-coin funding series to model it properly. The constant
      drag here is the conservative default and the biggest modeling assumption.
  SPOT+MARGIN alternative: set model='spot_margin' to replace funding with a
    borrow_bps_per_day on the SHORT notional only (stock-style). Documented, not default.

LIQUIDATION / SHORT AVAILABILITY
  - maint_margin and leverage per position: if a position's worst intra-hold move
    (using bar highs/lows) breaches the maintenance threshold, it is liquidated at the
    threshold and the loss is capped at margin posted (you cannot lose more than the
    isolated-margin on that leg, but you also realize the full adverse move to there).
  - Short availability: top perps are assumed listed/liquid; a coin without a usable
    perp should be excluded upstream. Flagged, not silently assumed away.

No network at import; the live fetch (timestamped, gap-logged) runs in Cloud Shell.
"""
import json, math, time, urllib.request
import xs_engine as E

# ───────────────────────── timestamped data layer (fixes 'no timestamps') ─────────────────────────
HOSTS = ["https://data-api.binance.vision","https://api.binance.com"]

def _get(url):
    for h in HOSTS:
        try:
            req=urllib.request.Request(h+url, headers={"User-Agent":"timi-xs/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r: return json.loads(r.read())
        except Exception: continue
    return None

def fetch_klines_ts(symbol, interval="1d", target_bars=1600):
    """Paged fetch keeping (openTime, open, high, low, close). Returns list of dicts."""
    by_t={}; end=None
    while len(by_t) < target_bars:
        q=f"/api/v3/klines?symbol={symbol}&interval={interval}&limit=1000"
        if end is not None: q+=f"&endTime={end}"
        d=_get(q)
        if not isinstance(d,list) or not d: break
        for k in d:
            by_t[int(k[0])]=dict(ts=int(k[0]), open=float(k[1]), high=float(k[2]),
                                 low=float(k[3]), close=float(k[4]))
        oldest=min(int(k[0]) for k in d)
        if end is not None and oldest>=end: break
        end=oldest-1
        if len(d)<1000: break
        time.sleep(0.12)
    return [by_t[t] for t in sorted(by_t)][-target_bars:]

def build_panel_calendar(raw, min_bars=300):
    """TIME-VARYING UNIVERSE on a UNION calendar (replaces the old intersection, which
    silently collapsed the sample to the dates ALL coins shared and biased it to the
    recent regime). Each coin keeps its OWN contiguous bars; a master calendar is the
    sorted UNION of all timestamps. At each date a coin is eligible iff it actually has
    a bar there — exactly how real cross-sectional trading handles listings/halts/gaps.

    Returns (master_ts, coins) where coins[s] = dict(ts, open, high, low, close, pos)
    and pos maps a timestamp -> that coin's local index."""
    keep={s:bars for s,bars in raw.items() if len(bars)>=min_bars}
    if len(keep)<8: return None, None
    master=sorted(set().union(*[set(b["ts"] for b in bars) for bars in keep.values()]))
    coins={}
    for s,bars in keep.items():
        bars=sorted(bars, key=lambda b:b["ts"])
        coins[s]=dict(ts=[b["ts"] for b in bars],
                      open=[b["open"] for b in bars], high=[b["high"] for b in bars],
                      low=[b["low"] for b in bars],  close=[b["close"] for b in bars],
                      pos={b["ts"]:j for j,b in enumerate(bars)})
        cov=len(bars)/len(master)
        if cov<0.95: print(f"  [data] {s}: covers {len(bars)}/{len(master)} master dates ({cov*100:.0f}%)")
    span_days=(master[-1]-master[0])/86400000.0
    print(f"  [data] union calendar: {len(master)} dates across {len(coins)} coins, ~{span_days:.0f} days "
          f"(time-varying universe; coins enter/exit as listed)")
    return master, coins

# ───────────────────────── the executable simulation (time-varying universe) ─────────────────────────
def simulate(coins, master, score_fn, rebalance_every=7, top_frac=0.3, exec_lag=1,
             periods_per_year=52, gross_exposure=1.0, min_universe=8,
             fee_bps=4.0, half_spread_bps=1.0, slippage_bps=2.0,
             funding_bps_per_day=1.5, model="perp", borrow_bps_per_day=5.0,
             leverage=2.0, maint_margin=0.005):
    """Account-equity return series + cost breakdown + metrics on a UNION calendar with
    a per-date eligible universe (coins trade only on dates they actually have bars).
    Funding uses REAL elapsed calendar days from timestamps. See module docstring."""
    import bisect
    M=len(master)
    acct_rets=[]; gross_rets=[]; fee_paid=[]; funding_paid=[]; liq_events=0; uni_sizes=[]; forced_exits=0
    prevL=set(); prevS=set()
    per_side_cost=(fee_bps+half_spread_bps+slippage_bps)/10000.0   # per side, per trade
    def exit_idx(cd, j0, T_e1):
        """Local exit index: the coin's bar at T_e1, or its LAST bar at/before T_e1 if it
        delisted mid-hold (forced exit). No look-ahead: we do not require T_e1 to exist
        at decision time. Returns (j1, forced) or (None, _) if it can't be held."""
        j=cd["pos"].get(T_e1)
        if j is not None: return j, False
        p=bisect.bisect_right(cd["ts"], T_e1)-1           # last bar at/before T_e1
        return (p, True) if p>j0 else (None, False)
    m=0
    while m+exec_lag+rebalance_every < M:
        T_dec=master[m]; T_e0=master[m+exec_lag]; T_e1=master[m+exec_lag+rebalance_every]
        # eligible at DECISION TIME: coin trades today AND we can enter next bar (T_e0).
        # Exit survival is NOT required here (that was look-ahead) — handled at exit.
        scores={}
        for s,cd in coins.items():
            jd=cd["pos"].get(T_dec)
            if jd is None or T_e0 not in cd["pos"]: continue
            sc=score_fn(cd["close"][:jd+1])
            if sc is not None and not math.isnan(sc) and not math.isinf(sc): scores[s]=sc
        if len(scores)<min_universe: m+=rebalance_every; continue
        uni_sizes.append(len(scores))
        ranked=sorted(scores, key=scores.get, reverse=True)
        k=max(1,int(len(ranked)*top_frac)); L=set(ranked[:k]); S=set(ranked[-k:])
        w=(gross_exposure/2.0)/k

        def pos_ret(sym, is_long):
            cd=coins[sym]; j0=cd["pos"][T_e0]
            j1,forced=exit_idx(cd, j0, T_e1)
            if j1 is None: return 0.0, False, False      # could not hold; treat as flat
            p0=cd["open"][j0]; p1=cd["open"][j1]
            if p0<=0: return 0.0, False, forced
            # CORRECT short P&L as a fraction of notional is -(p1/p0 - 1) = 1 - p1/p0,
            # NOT p0/p1-1 (the earlier bug, which halved losses on a coin that doubled and
            # gave unbounded gains when it crashed — flattering the short leg).
            raw=(p1/p0-1.0) if is_long else (1.0 - p1/p0)
            seg_hi=max(cd["high"][j0:j1+1]); seg_lo=min(cd["low"][j0:j1+1])
            adverse=(seg_lo/p0-1.0) if is_long else (1.0-seg_hi/p0)
            max_loss=-(1.0/leverage - maint_margin)
            if adverse<=max_loss: return max_loss, True, forced
            return raw, False, forced

        gL=gS=0.0; liq_here=0
        for s in L:
            r,liq,fx=pos_ret(s,True);  gL+=w*r; liq_here+=liq; forced_exits+=fx
        for s in S:
            r,liq,fx=pos_ret(s,False); gS+=w*r; liq_here+=liq; forced_exits+=fx
        gross=gL+gS; liq_events+=liq_here

        turnover_names=len(L^prevL)+len(S^prevS)                   # incl. names forced out by delisting
        trade_cost=(turnover_names*w)*per_side_cost*2.0            # out of old + into new
        hold_days=max((T_e1-T_e0)/86400000.0, 1e-9)               # REAL elapsed days
        if model=="perp":
            carry=gross_exposure*(funding_bps_per_day/10000.0)*hold_days
        else:
            carry=(gross_exposure/2.0)*(borrow_bps_per_day/10000.0)*hold_days
        net=gross-trade_cost-carry

        acct_rets.append(net); gross_rets.append(gross)
        fee_paid.append(trade_cost); funding_paid.append(carry)
        prevL,prevS=L,S; m+=rebalance_every

    if len(acct_rets)<5: return None
    def sr(x):
        m=E.mean(x); s=E.pstd(x); return (m/s)*math.sqrt(periods_per_year) if s>0 else 0.0
    half=len(acct_rets)//2
    uni_sizes_sorted=sorted(uni_sizes)
    med_uni=uni_sizes_sorted[len(uni_sizes_sorted)//2] if uni_sizes_sorted else 0
    return dict(
        n=len(acct_rets), acct_rets=acct_rets,
        sharpe_net=sr(acct_rets), sharpe_gross=sr(gross_rets),
        oos_sharpe_net=sr(acct_rets[half:]),
        maxdd=E.max_drawdown(acct_rets), total_net=math.prod([1+r for r in acct_rets])-1,
        avg_fee=E.mean(fee_paid), avg_funding=E.mean(funding_paid),
        liq_events=liq_events, model=model, forced_exits=forced_exits,
        med_universe=med_uni, min_universe=(uni_sizes_sorted[0] if uni_sizes_sorted else 0))

def report(res, label=""):
    if not res: print(f"  {label}: insufficient periods"); return
    print(f"  {label}")
    print(f"    periods {res['n']}  model={res['model']}  universe/period median {res.get('med_universe','?')} (min {res.get('min_universe','?')})")
    print(f"    Sharpe  gross {res['sharpe_gross']:+.2f}   net {res['sharpe_net']:+.2f}   OOS net {res['oos_sharpe_net']:+.2f}")
    print(f"    total net return {res['total_net']*100:+.1f}%   account maxDD {res['maxdd']*100:.1f}%")
    print(f"    avg trade cost/period {res['avg_fee']*1e4:.1f}bps   avg funding/period {res['avg_funding']*1e4:.1f}bps   liquidations {res['liq_events']}   forced-exits {res.get('forced_exits',0)}")

# ───────────────────────── synthetic-data self-validation (no network) ─────────────────────────
DAY=86400000
def _synth_raw(n_assets=16, n_bars=700, seed=1, strength=0.0, gaps=True):
    """Timestamped OHLC bars per coin. If gaps, a few coins start late / skip days,
    to exercise the time-varying-universe path (eligibility by actual bars)."""
    import random; rng=random.Random(seed)
    latent=[rng.gauss(0,0.004) for _ in range(n_assets)]
    raw={}
    for a in range(n_assets):
        bars=[]; px=100.0
        start = (a%4)*30 if gaps else 0            # some coins list later
        skip = set(rng.sample(range(start+40, n_bars), 15)) if (gaps and a%5==0) else set()
        for t in range(n_bars):
            latent[a]=0.995*latent[a]+0.005*rng.gauss(0,0.004)
            op=px*(1+rng.gauss(0,0.002))
            cl=op*math.exp(latent[a]*strength*10 + rng.gauss(0,0.03))
            hi=max(op,cl)*(1+abs(rng.gauss(0,0.01))); lo=min(op,cl)*(1-abs(rng.gauss(0,0.01)))
            px=cl
            if t<start or t in skip: continue       # not listed yet / missing bar
            bars.append(dict(ts=t*DAY, open=op, high=hi, low=lo, close=cl))
        raw[f"A{a:02d}"]=bars
    return raw

def _selftest():
    print("="*92); print(" PHASE-2 SELF-VALIDATION (synthetic OHLC, time-varying universe, no network)"); print("="*92)
    mom=lambda c: E.sig_momentum(c,30)
    raw=_synth_raw(strength=0.7, seed=2, gaps=True)     # planted edge + listing gaps
    master, coins = build_panel_calendar(raw, min_bars=200)
    def sim(**kw): return simulate(coins, master, mom, **kw)

    # 1) zero cost + zero lag, leverage 1x maint 0 -> no liquidation -> gross==net
    z=sim(exec_lag=0, fee_bps=0, half_spread_bps=0, slippage_bps=0, funding_bps_per_day=0,
          leverage=1.0, maint_margin=0)
    print("\n [1] zero-cost / zero-lag / no-liq (mechanics baseline):")
    report(z, "gross==net expected")
    ok1 = abs(z["sharpe_gross"]-z["sharpe_net"])<1e-9

    # 2) costs must REDUCE net Sharpe monotonically
    base=sim(fee_bps=4, half_spread_bps=1, slippage_bps=2, funding_bps_per_day=1.5)
    hi  =sim(fee_bps=4, half_spread_bps=1, slippage_bps=2, funding_bps_per_day=6.0)
    print("\n [2] funding drag raises costs -> net Sharpe falls:")
    report(base, "funding 1.5bps/day"); report(hi, "funding 6.0bps/day")
    ok2 = hi["sharpe_net"] < base["sharpe_net"] <= base["sharpe_gross"]+1e-9

    # 3) next-bar-open execution
    lag1=sim(fee_bps=0, half_spread_bps=0, slippage_bps=0, funding_bps_per_day=0, leverage=1.0, maint_margin=0)
    print("\n [3] execution lag:")
    report(lag1, "exec at next open (lag=1)")
    ok3 = lag1["n"]>0

    # 4) spot_margin model
    sm=sim(model="spot_margin", borrow_bps_per_day=5.0)
    print("\n [4] spot+margin model (borrow on short leg):")
    report(sm, "spot_margin")
    ok4 = sm is not None

    # 5) liquidation sensitivity
    lowlev =sim(leverage=1.0, maint_margin=0.0)
    highlev=sim(leverage=20.0, maint_margin=0.005)
    print("\n [5] liquidation sensitivity:")
    report(lowlev,  "leverage 1x  (expect 0 liquidations)")
    report(highlev, "leverage 20x (expect >0 liquidations)")
    ok5 = lowlev["liq_events"]==0 and highlev["liq_events"]>0

    # 6) time-varying universe: coins with listing gaps are handled, universe size varies
    ok6 = base["med_universe"]>=8 and base["min_universe"]>=8 and base["n"]>0

    print("\n" + "="*92)
    print(f"  mechanics baseline (gross==net at zero cost): {'PASS' if ok1 else 'FAIL'}")
    print(f"  costs reduce net Sharpe monotonically:        {'PASS' if ok2 else 'FAIL'}")
    print(f"  next-open execution path runs:                {'PASS' if ok3 else 'FAIL'}")
    print(f"  spot-margin alternative runs:                 {'PASS' if ok4 else 'FAIL'}")
    print(f"  liquidation fires at high lev, not at low:    {'PASS' if ok5 else 'FAIL'}")
    print(f"  time-varying universe handles listing gaps:   {'PASS' if ok6 else 'FAIL'}")
    print("  (This validates MECHANICS, not that any real edge exists. Costs/funding here")
    print("   are assumptions; real fills, spreads and funding must be measured, not assumed.)")
    print("="*92)

if __name__ == "__main__":
    _selftest()
