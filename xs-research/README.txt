TIMI-XS  v3  — cross-sectional engine (crypto + forex) with honest validation
==============================================================================

WHAT THIS IS
  A ranking engine, not a predictor. It does NOT try to guess "will EUR/USD go
  up". It ranks a whole universe each period, goes LONG the strongest / SHORT
  the weakest, and tests — honestly — whether that spread is a real edge or luck.
  Every result passes three gates before it is called REAL:
     perm_p < 0.05   (beats randomly-shuffled rankings)
     DSR    > 0.90   (survives the penalty for testing many signals)
     oosSR  > 0      (positive on held-out second half)
  Most signals read "noise". That is the engine working, not failing.

RUN ORDER (Google Cloud Shell — it can reach Binance; the sandbox cannot)
  1.  python3 xs_selftest.py
        MUST print  Test 1 PASS  and  Test 2 PASS.
        (v3 fixes the v1/v2 positive-control calibration — Test 2 now passes.)
        Do not trust any live result until you have seen both PASS.

  2.  python3 xs_lowvol_final.py
        THE pre-specified final test of the one surviving signal (lowvol).
        Prior runs showed: dist_high is NOT robust (flips sign by horizon — dead);
        lowvol is the lone survivor (positive full+OOS every run) but sub-threshold.
        This tests lowvol properly: max daily history (paged past the 1000-cap),
        30-day horizon, long/short AND long-tilt forms, cost sweep 10/20/40bps,
        plus a history-depth check. HARD STOPPING RULE printed at the end:
        if the primary test doesn't clear all three gates (and stay positive at
        20bps), the conclusion is final — no provable edge, do not trade, do not
        tune further. That discipline is the whole point.

  2b. python3 xs_focus.py   (optional, superseded by xs_lowvol_final.py)
        Earlier follow-up: all 7 families on 4h bars + a z(lowvol)+z(dist_high)
        blend. Kept for reference; the 4h reparameterization shortened the lowvol
        horizon and weakened it, which is why the dedicated test above exists.

  3.  (optional, broad scan)
        python3 xs_run_combined.py            # crypto + forex, daily bars
        TD_KEY=your_twelvedata_key python3 xs_run_combined.py   # enables forex

FILES
  xs_engine.py        the validated core (backtest, permutation null, DSR, OOS)
  xs_selftest.py      positive/negative controls — run this FIRST
  xs_lowvol_final.py  the pre-specified final lowvol test with a hard stopping rule
  xs_focus.py         4h + combined-signal follow-up (superseded; reference only)
  xs_run_combined.py  broad crypto+forex scan in one command
  xs_run_live.py      crypto-only broad scan
  xs_forex.py         8-currency strength reconstruction for FX ranking

READING A VERDICT
  REAL EDGE  -> re-run that signal at cost_bps 20 then 40. A real edge degrades
                gracefully; a fake one vanishes. Only then is it worth wiring live.
  noise      -> exactly that. Do not trade it. Do not "tune" until it passes —
                that is the selection-bias trap that produced the old 4.0 Sharpes.

No pip installs needed (stdlib only). Forex in step 3 needs a free Twelve Data
key in the TD_KEY environment variable, or websocket-client for the Deriv fallback.
