# TIMI-XS — Research engine: audit response and calibration report

This is the deliverable requested: a corrected validation engine with evidence that
its statistics are calibrated, not another trading strategy. It responds point by
point to the audit, states what was fixed, and shows the before/after evidence from
an independent calibration harness (`xs_calibration.py`). It also states plainly what
could NOT be fixed by a code change and needs a design decision.

## Findings, dispositions, evidence

| # | Audit finding | Disposition | Evidence |
|---|---------------|-------------|----------|
| 1 | Permutation test does not charge turnover cost; not a matched net-of-cost null | FIXED | `permutation_pvalue` now tracks prior holdings and subtracts the identical turnover cost. p-value calibration re-verified (Test A). |
| 2 | Self-test (1 noise + 1 momentum draw) too weak to establish calibration / false-discovery control | ADDRESSED by new harness | Test A: p-values uniform under null. Test B: family-wise false-positive rate 0.010. Self-test text corrected to stop claiming "safe to run on real data". |
| 3 | Long/short is not an executable portfolio (no borrow/funding/exposure convention) | NOT FIXED (design, not code) | Unchanged. The engine is a signal screen; see "Limitations" below. |
| 4 | Deflated Sharpe hurdle unverified; simplified expected-max; manual trial count | FIXED (hurdle) + documented (trial count) | Test D: analytic hurdle was 0.709 vs Monte-Carlo 0.834 (off 0.125). Replaced with Bailey-Lopez de Prado order-statistic formula; now 0.845 vs 0.834 (off 0.011). |
| 5 | OOS is a split of the researched panel, not an untouched holdout | ACCEPTED (not claimed otherwise) | No code change; treated as a diagnostic only. A true holdout needs forward/unseen data. |

Correction to my own prior notes: I claimed the 2021 regime *caused* the low-vol
window sign-flip. The data establishes window-instability only; I did not verify the
cause against timestamps and have retracted the causal claim.

## The two code defects, with before/after numbers

**Defect A — permutation null was gross, strategy was net.** Random rankings churn
~100% per rebalance; charging them no cost made the null harder to beat (conservative),
but the test was not a matched replica. Fixed to charge identical turnover cost.

**Defect B — Deflated Sharpe hurdle underestimated for small N.** The old
`sqrt(2 ln N)` expected-max approximation is too low for the small trial counts we use.

```
Monte-Carlo E[max Sharpe under null], n_trials=7, n_periods=140:  0.834
   old analytic hurdle:  0.709   (|diff| 0.125  -> DSR too lax near the threshold)
   new analytic hurdle:  0.845   (|diff| 0.011)
DSR at the hurdle:  old 0.500 vs empirical 0.396 ;  new 0.500 vs empirical 0.538
```

The new hurdle matches ground truth and the DSR is now well-calibrated at the decision
boundary, erring slightly conservative (the safe direction).

## Independent calibration results (xs_calibration.py)

Fidelity check 0: the numpy backtest used for calibration reproduces
`xs_engine.run_cross_sectional` Sharpe to |diff| < 1e-6, so these numbers describe the
real engine, not a paraphrase.

**A. Permutation p-value under the null (150 independent noise universes):**
```
P(p<0.01)=0.007   P(p<0.05)=0.040   P(p<0.10)=0.093   P(p<0.20)=0.193   mean=0.515
```
Essentially uniform -> the permutation p-value is calibrated.

**B. Family-wise false-positive rate of the composite verdict (100 noise universes, 6 families):**
```
per-family: all <= 0.010 ;  >=1 family flagged REAL: 0.010
```
Naive FWER for 6 families at a 0.05 gate would be ~0.26. The DSR+OOS gates pull the
real false-discovery rate down to ~1%. The verdict does not over-fire on noise.

**C. Detection power vs planted effect size (persistent cross-sectional drift):**
```
strength 0.2 -> 0.27     0.4 -> 0.77     0.6 -> 0.93     0.8 -> 1.00
```
Strong power for moderate+ effects; limited power for very weak effects. So the engine
is conservative: it rarely false-positives but can miss a genuinely tiny edge. This is
the quantified version of "underpowered for small effects."

**D. Deflated Sharpe vs Monte-Carlo:** hurdle matches to 0.011 after the fix (above).

## What the calibration establishes, and what it does not

Establishes: the engine is not inverted (self-test), its permutation p-value is
calibrated under the null (A), its composite verdict controls false discoveries at
~1% (B), it has characterized power (C), and its deflation hurdle matches Monte-Carlo
ground truth (D). On synthetic data with known truth, the statistical machinery now
behaves correctly.

Does NOT establish: that real crypto/forex returns behave like the synthetic nulls.
Real markets have fat tails, time-varying volatility, cross-sectional correlation
clustering and regime shifts that the IID/persistent-drift synthetics do not fully
reproduce. Calibration on synthetic nulls is necessary, not sufficient, for trusting a
p-value on real data. A stationary/block bootstrap null and a fat-tailed synthetic
would strengthen this further and are the natural next hardening step.

## Limitations that are design decisions, not bugs (unchanged)

- **Executability (finding #3).** Flat-cost spot differencing is a signal screen. A
  tradability claim needs a real short mechanism (perp funding, borrow cost/availability,
  liquidation) and an explicit capital/exposure convention for the return and drawdown
  series. The engine should never be read as "these returns are achievable."
- **Holdout (finding #5).** The 2nd-half split is a diagnostic. Independent confirmation
  requires forward/unseen data fixed after the research decision.
- **Trial count.** `n_trials` (7 in the engine, 9 in the final test) is a declared
  judgment, not a measured census of every choice made across the project; the true
  figure is larger and fuzzy, so the DSR should be read as optimistic on that axis.

## Bottom line

The engine's statistics are now calibrated and two real defects are fixed and verified.
That makes it a trustworthy *screen*: when it says "noise," believe it; when it says
"REAL EDGE," treat it as a candidate for a pre-registered holdout test with a proper
execution model, never as a trade signal. It remains, by design, a research instrument
and not an execution simulator.
