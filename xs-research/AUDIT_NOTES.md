# TIMI-XS — Audit package index and honest limitations

This package is organized for a research audit, not to defend a result. It maps your
five requested items to the exact files and line ranges, states what each component
does, and — more important — lists where each component can still mislead you. Where
I previously overclaimed, it says so.

## Checklist map

| # | You asked for | File(s) here | Where to look |
|---|---------------|--------------|---------------|
| 1 | Final low-vol experiment | `xs_lowvol_final.py` | whole file; config constants at top (VOL_LB=30, REBAL=7, PPY=52, TOP_FRAC=0.3, N_TRIALS=9) |
| 2 | Cross-sectional backtest engine (portfolio, returns, costs, OOS, rebalance) | `xs_engine.py` | `run_cross_sectional` (L151); OOS split happens in callers (`gate` in `xs_lowvol_final.py`, `evaluate_universe` L252 in engine) |
| 3 | Permutation + Deflated Sharpe implementations (+ trial count) | `xs_engine.py` | `permutation_pvalue` (L~215); `deflated_sharpe` (L68); n_trials is passed in, not measured (see limitation B) |
| 4 | Latest test outputs | `latest_output.log`, `results_summary.csv` | the full console run you pasted, plus the metrics as structured rows |
| 5 | Previous failed forex scripts (optional) | `significance_suite.js`, `forex_cost_attack_v2.js`, `forex_attack_trades.json` | the broken validator, the selection-bias sweep, and its cherry-picked trade file |
| — | Controls referenced in the postmortem | `xs_selftest.py` | planted-edge and noise universes |

## What the final run established (and what it did not)

The decisive result is the **history-depth block**, not the headline verdict:

- last 1000 bars: fullSR +0.98, OOS +1.15, perm_p 0.045, DSR 0.61
- last 1500 bars: fullSR -0.32, OOS +0.82, perm_p 0.706
- last 1612 bars: fullSR -0.31, OOS +0.60, perm_p 0.771

Low-vol long/short **changes sign** when the older ~600 days are added. That window
includes the 2021 alt-mania (high-vol coins outperform violently), which a
long-low-vol/short-high-vol book is on the wrong side of. So the valid conclusion is
**regime dependence**, not impossibility: low-vol is a recent-regime tilt, and even on
its favorable window it reaches only DSR 0.61 (< 0.90). This is "evidence the signal
is not a stable all-weather edge," which is a different and stronger statement than
"the signal is dead."

## Known limitations — read these before trusting any number here

These answer your A/B/C/D directly. None are hidden in the code; they are stated so
your audit is fast.

**A. Out-of-sample integrity and selection history.**
- The OOS split is a 50/50 split of the SAME historical panel the signal was chosen
  on. Low-vol was selected *after* seeing earlier runs on this period, so the "OOS"
  half is not a clean, untouched holdout. A genuine test needs data after the
  research decision was fixed (forward paper period), or a pre-registered holdout
  never looked at. I previously leaned on this OOS split more than it can bear.
- **Survivorship bias:** the universe is today's 40 liquid USDT pairs. Coins that
  delisted, died, or lost liquidity are absent, which biases any long book upward.
  The engine does not reconstruct point-in-time universe membership.
- **Regime concentration:** confirmed present (the sign flip above). A -84% max
  drawdown on the L/S book also implies a few periods dominate the statistics.

**B. Does the permutation test answer the right question?**
- `permutation_pvalue` shuffles the ranking each rebalance while keeping the real
  per-period cross-section of forward returns. So within-period cross-asset
  correlation is preserved (it samples actual asset returns), but **serial/temporal
  dependence of the strategy return stream is not modeled**, and the test is per-signal
  — it does not do family-wise error control across the signals tried. That control
  is delegated entirely to the DSR.
- **DSR `n_trials` is hand-set** (9 in the final test, 7 in `evaluate_universe`), a
  declared judgment, not a measured count of every parameter/universe/horizon ever
  examined across the whole project — which is larger and genuinely hard to count.
  The 0.90 threshold is a project acceptance criterion, not a profitability guarantee.
  Skew/kurtosis feeding the DSR are sample moments at ~140-230 periods and are noisy.
- Crypto is close to a one-factor market (high pairwise correlation), so the
  **effective breadth** of ~38 names is far below 38. Low effective breadth, not just
  instrument count, is why the cross-section is underpowered.

**C. Is the portfolio tradable as simulated? (largest gap)**
- The backtest models a dollar-neutral long/short on **spot close prices** with a flat
  `cost_bps` turnover charge. A spot account cannot short by selling what it does not
  own. Real shorting needs margin borrow or perpetual futures, which bring **funding
  costs** (for a crypto short book, perp funding is often the dominant P&L term, not a
  rounding error), borrow availability, fees, and liquidation risk. The flat cost model
  is almost certainly too generous on the short leg.
- Execution at the exact daily close is assumed; no slippage beyond the flat charge.
- Net: a statistically interesting portfolio and an executable one are different
  objects here. The long-tilt form (long low-vol, short equal-weight market) is closer
  to realistic, but still needs proper funding/borrow modeling to mean anything.

**D. Failed signal vs failed experiment — my classification.**
- The **L/S primary test** is a partly *invalid experiment* for a tradeability claim
  (spot-short modeling, understated costs, non-holdout OOS). But its regime sign-flip
  is *valid evidence against* low-vol being a stable edge, because a sign change across
  sub-periods is not a cost artifact.
- The **long-tilt form** is the only variant worth any further work, and only as a
  properly specified, pre-registered test on a true forward/holdout period with perp
  funding modeled — not as another pass over this panel.

## Corrections to the postmortem (my overstatements)

1. "Directional prediction is the mistake underneath everything" → narrowed: our
   directional *implementations* were negative-EV with invalid backtests. A
   sufficiently strong conditional forecast relative to costs can be positive-EV.
2. "The engine is trustworthy / safe to run on real data" → narrowed: the engine
   passes an inversion check (finds planted edge, rejects noise). That is necessary,
   not sufficient. Its p-values are not established as calibrated on real,
   autocorrelated, cross-sectionally dependent, survivorship-filtered data. Treat its
   "REAL EDGE" as "worth a pre-registered holdout test," never as a trade signal.
