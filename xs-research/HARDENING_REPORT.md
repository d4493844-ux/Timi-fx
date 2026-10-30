# TIMI-XS — Null hardening report (real-data robustness)

Follows CALIBRATION_REPORT.md. That report showed the engine's statistics are
calibrated on Gaussian random-walk nulls. This one asks the harder question: do the
p-values still hold when the synthetic data has the properties REAL crypto has — fat
tails, volatility clustering, and cross-sectional correlation? Code: `xs_hardening.py`
(reuses the fidelity-checked numpy backtest). No network.

## What was tested

Four null generators, none containing any cross-sectional edge:
- gaussian (baseline) — IID normal random walks
- student-t(df=4) — fat tails
- garch-t — GARCH(1,1), persistence ~0.97, t innovations (volatility clustering)
- factor+garch-t (FULL) — common market factor + idiosyncratic, both GARCH-t, with
  heterogeneous betas (cross-sectional correlation + vol dispersion). Closest to crypto.

## Results

**1. Permutation p-value uniformity under each null (120 universes each):**
```
gaussian(baseline)     P(p<.05)=0.067   calibrated
student-t(df4)         P(p<.05)=0.083   borderline (fat tails push up)
garch-t                P(p<.05)=0.092   MISCALIBRATED (anti-conservative)
factor+garch-t(FULL)   P(p<.05)=0.067   calibrated
```
Finding: pure volatility clustering makes the raw permutation p-value anti-conservative
— a nominal 0.05 behaves like ~0.08-0.09 (over-rejects ~1.6-1.8x). Fat tails push the
same way, milder. MC standard error at 120 universes is ~0.02, so garch-t at 0.092 is
~2 SE off: real, modest. The FULL crypto-like null is BETTER behaved (0.067) than
garch-alone, because the common factor cancels in the dollar-neutral long/short book.

**2. Family-wise false-positive rate of the composite verdict (perm AND DSR AND OOS):**
```
gaussian(baseline)     FWER = 0.040
factor+garch-t(FULL)   FWER = 0.010
```
The verdict that actually gates "REAL EDGE" stays controlled (~1-4%) even under the
full realistic null. The DSR and OOS gates absorb the permutation component's
anti-conservativeness. The weak link is the raw p-value; the composite rule backstops it.

**3. Stationary-bootstrap Sharpe CI coverage (dependent null streams, true Sharpe ~0):**
```
raw percentile CI:        0.90   (under-covers; LONGER blocks make it worse)
with widen=1.25 factor:   0.955  (on target)
```
The under-coverage is the Sharpe's skewed small-sample sampling distribution, not
missing dependence (longer blocks worsened it: 0.90 -> 0.82). Fixed with an empirically
calibrated interval-widening factor (c=1.2 -> 0.94, c=1.4 -> 0.98; 1.25 chosen), baked
into `stationary_bootstrap_sharpe`.

## Practical rules this produces

1. **On real (clustered) data, read the permutation p-value strictly.** A perm_p of
   0.05 corresponds to a true false-positive rate closer to 0.08-0.09. To get an actual
   5% from the component alone, require perm_p < ~0.02. Better: do not rely on the raw
   p-value alone — the composite verdict (perm AND DSR>0.90 AND OOS>0) is the robust
   gate (FWER ~1% even under the full realistic null) and is what should decide anything.
2. **Use the widened bootstrap CI** (widen=1.25) as the dependence-robust cross-check on
   the Sharpe; the raw percentile CI is ~5 points optimistic.
3. The engine's REAL-EDGE rule was NOT loosened; these findings show it is already
   conservative overall, so no change was made to the decision rule — only documentation
   and the bootstrap correction.

## Honest bottom line

The engine's statistics transfer to realistic (fat-tailed, clustered, correlated)
market-like data at the level that matters — the composite verdict controls false
discoveries at ~1%. The one genuine weakness, the raw permutation p-value under pure
volatility clustering, is documented and backstopped rather than hidden. What this still
does NOT establish: calibration on ACTUAL historical returns (these are realistic
synthetics, not real data), and it does not touch the executability gap (perp funding,
borrow, exposure convention) which remains the separate, larger piece of work before any
result here could describe a tradable portfolio.
