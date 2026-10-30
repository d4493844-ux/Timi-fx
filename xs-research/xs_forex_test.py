#!/usr/bin/env python3
"""
FOREX TEST — run FX through the CORRECTED pipeline (screen + Phase 2 simulator).
No EA, no MT5. Pure data test in Cloud Shell.

  TD_KEY=your_twelvedata_key python3 xs_forex_test.py      # preferred (breadth)
  python3 xs_forex_test.py                                  # Deriv ws fallback (7 USD majors only)

What this does, honestly:
  1. Fetches daily OHLC for a BROAD set of FX pairs (28 majors+crosses) — far more than
     the old 8-currency test, to give cross-sectional ranking a fair shot at breadth.
  2. Runs the corrected, calibrated engine screen (all 7 families, honest gates).
  3. Runs the Phase 2 executable simulator (next-open execution, account-level returns,
     FX-appropriate costs, swap as the funding analog) on the two cross-sectional
     candidates (momentum, low-vol), with a leverage sweep.

HONEST CAVEAT stated up front: liquid tradable FX is ~28-70 instruments, period. Even the
full major+cross+minor set is an order of magnitude short of the breadth cross-sectional
ranking really wants (hundreds). So a weak or absent result would be expected on breadth
grounds alone. We test anyway rather than assume — but read a null result in that light,
and read a POSITIVE result with extra suspicion (small universe = high overfitting risk).
FX is ~24/5: weekends are missing uniformly, so the calendar is shared across pairs.
"""
import json, os, time, urllib.request, datetime
import xs_engine as E
import xs_execution as X

FX_UNIVERSE = [
    "EUR/USD","GBP/USD","AUD/USD","NZD/USD","USD/JPY","USD/CAD","USD/CHF",
    "EUR/JPY","GBP/JPY","AUD/JPY","NZD/JPY","CAD/JPY","CHF/JPY",
    "EUR/GBP","EUR/AUD","EUR/NZD","EUR/CAD","EUR/CHF",
    "GBP/AUD","GBP/NZD","GBP/CAD","GBP/CHF",
    "AUD/NZD","AUD/CAD","AUD/CHF","NZD/CAD","NZD/CHF","CAD/CHF",
]
VOL_LB=30; REBAL=7; PPY=52; TOP_FRAC=0.3

def _ts(datestr):
    return int(datetime.datetime.strptime(datestr[:10], "%Y-%m-%d").replace(
        tzinfo=datetime.timezone.utc).timestamp()*1000)

def fetch_td(pair, outputsize=5000):
    key=os.environ.get("TD_KEY","")
    if not key: return None
    url=(f"https://api.twelvedata.com/time_series?symbol={pair}"
         f"&interval=1day&outputsize={outputsize}&apikey={key}")
    try:
        with urllib.request.urlopen(url, timeout=30) as r: j=json.loads(r.read())
        if "values" not in j: return None
        out=[]
        for v in reversed(j["values"]):
            out.append(dict(ts=_ts(v["datetime"]), open=float(v["open"]), high=float(v["high"]),
                            low=float(v["low"]), close=float(v["close"])))
        return out
    except Exception:
        return None

def fetch_deriv(pair):
    """Fallback for the 7 USD majors only (no key needed)."""
    sym=pair.replace("/","")
    if sym not in ("EURUSD","GBPUSD","AUDUSD","NZDUSD","USDJPY","USDCAD","USDCHF"): return None
    try:
        import ssl, websocket
        ws=websocket.create_connection("wss://ws.derivws.com/websockets/v3?app_id=1089",
                                       timeout=20, sslopt={"cert_reqs":ssl.CERT_NONE})
        ws.send(json.dumps({"ticks_history":"frx"+sym,"adjust_start_time":1,"count":5000,
                            "end":"latest","granularity":86400,"style":"candles"}))
        out=None
        for _ in range(6):
            m=json.loads(ws.recv())
            if m.get("candles"):
                out=[dict(ts=int(c["epoch"])*1000, open=float(c["open"]), high=float(c["high"]),
                          low=float(c["low"]), close=float(c["close"])) for c in m["candles"]]; break
            if m.get("error"): break
        ws.close(); return out
    except Exception:
        return None

def build_raw():
    print("="*96); print(" FETCHING FOREX (daily OHLC)"); print("="*96)
    use_td = bool(os.environ.get("TD_KEY",""))
    print(f"  source: {'Twelve Data (TD_KEY set)' if use_td else 'Deriv ws fallback (7 USD majors only — set TD_KEY for breadth)'}")
    raw={}
    for i,p in enumerate(FX_UNIVERSE):
        bars = fetch_td(p) if use_td else fetch_deriv(p)
        if bars and len(bars)>=200:
            raw[p.replace("/","")]=bars; print(f"  [{i+1}/{len(FX_UNIVERSE)}] {p}: {len(bars)} bars", flush=True)
        else:
            print(f"  [{i+1}/{len(FX_UNIVERSE)}] {p}: skip", flush=True)
        if use_td: time.sleep(8.0)   # free-tier rate limit ~8/min
    return raw

def screen_panel(coins):
    """Intersection close-panel for the engine screen. FX pairs share the weekday
    calendar, so intersection ~= full (unlike crypto) — safe here."""
    common=sorted(set.intersection(*[set(cd["ts"]) for cd in coins.values()]))
    return {s:[cd["close"][cd["pos"][t]] for t in common] for s,cd in coins.items()}, len(common)

def main():
    raw=build_raw()
    if len(raw)<8:
        print(f"\nOnly {len(raw)} pairs fetched (need >=8). Set TD_KEY for the full set."); return
    master, coins = X.build_panel_calendar(raw, min_bars=200)
    if not coins: print("Not enough data."); return

    # 1) ENGINE SCREEN (significance) --------------------------------------------------
    panel, ncommon = screen_panel(coins)
    print(f"\n screen panel: {len(panel)} pairs x {ncommon} common daily bars")
    E.evaluate_universe(panel, REBAL, PPY, top_frac=TOP_FRAC, cost_bps=2, n_perm=200,
                        label=f"[FOREX {len(panel)} pairs — engine screen]")

    # 2) PHASE 2 EXECUTABLE SIM (tradability) ------------------------------------------
    print("\n"+"="*96); print(" PHASE 2 — executable sim on the two FX candidates (FX costs)"); print("="*96)
    print(" FX costs are tight for majors, wider for crosses; 'swap' is the funding analog")
    print(" (small). FX shorting is symmetric, liquidation rare at FX vol. Costs are ASSUMPTIONS.\n")
    cands={"momentum(30)": (lambda c: E.sig_momentum(c,30)), "lowvol(30)": (lambda c: E.sig_lowvol(c,VOL_LB))}
    scen=[("optimistic", dict(fee_bps=0.2, half_spread_bps=0.3, slippage_bps=0.3, funding_bps_per_day=0.1)),
          ("realistic",  dict(fee_bps=0.5, half_spread_bps=1.0, slippage_bps=0.5, funding_bps_per_day=0.3)),
          ("stressed",   dict(fee_bps=1.0, half_spread_bps=2.0, slippage_bps=1.0, funding_bps_per_day=1.0))]
    for cname,fn in cands.items():
        print(f"\n --- {cname} ---")
        for sname,cfg in scen:
            res=X.simulate(coins, master, fn, rebalance_every=REBAL, top_frac=TOP_FRAC, exec_lag=1,
                           periods_per_year=PPY, gross_exposure=1.0, leverage=3.0, maint_margin=0.005,
                           model="perp", min_universe=8, **cfg)
            X.report(res, f"[{sname}]")

    print("\n"+"="*96)
    print(" READING IT: same gates as crypto. Given FX's small universe, treat ANY positive")
    print(" result as high-overfitting-risk and demand a pre-registered untouched-period test")
    print(" before believing it. A null result is the expected outcome on breadth grounds.")
    print("="*96)

if __name__=="__main__":
    main()
