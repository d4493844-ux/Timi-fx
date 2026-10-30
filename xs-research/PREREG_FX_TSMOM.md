# Pre-registration — FX time-series (trend) momentum
_Frozen 2026-10-30, BEFORE fetching data or seeing any result. Do not edit after results exist._

## Hypothesis
For a liquid FX/commodity instrument, the sign of its own trailing return over a lookback
L predicts the sign of its next-period return (time-series momentum / trend persistence,
per Moskowitz-Ooi-Pedersen 2012). This is NOT cross-sectional ranking; each instrument is
judged on its own trend. It is therefore not breadth-limited the way the failed 8-currency
cross-sectional test was.

## Universe (popular, liquid only — fixed in advance)
EUR/USD, GBP/USD, AUD/USD, NZD/USD, USD/JPY, USD/CAD, USD/CHF, XAU/USD (gold).
8 instruments. No additions after results are seen.

## Signal & portfolio (fixed)
- Signal per instrument: position sign = sign( close[t]/close[t-L] - 1 ).
- Risk weighting: inverse realized vol (60-day), weights normalized to sum to 1 (gross=1).
- Rebalance: weekly (every 7 bars), non-overlapping. Execution: next bar's OPEN. No
  trading on the close used to decide.
- Direction: long if trend up, short if trend down (always invested, net exposure varies).

## Lookbacks to test (fixed set — this IS the trial count)
L ∈ {20, 60, 90, 120} trading days. Four trials. DSR n_trials = 4 for this experiment
(the broader project trial history is larger and is acknowledged separately; this number
is not re-chosen after results).

## Costs (FX-appropriate, fixed scenarios)
- realistic: fee 0.5, half-spread 1.0, slippage 0.5 bps per side; rollover 0.3 bps/day.
- stressed:  fee 1.0, half-spread 2.0, slippage 1.0 bps per side; rollover 1.0 bps/day.
Costs are assumptions until measured against a real broker; rollover is the FX funding
analog and must later use real historical swap rates.

## Significance test (fixed)
- Random-timing null: replace the trend sign with a random ±1 each period (same
  frequency), keep the real vol-weights and forward returns; p = fraction of random-timing
  runs whose Sharpe >= observed. This tests whether the TREND's timing beats coin-flip
  timing. (Cross-sectional permutation does not apply to a time-series strategy.)
- Deflated Sharpe with n_trials = 4, corrected hurdle.
- Out-of-sample: second-half Sharpe must be positive.
- Dependence-robust stationary-bootstrap Sharpe CI (reported).

## Acceptance (fixed — all must hold for a lookback to be a CANDIDATE)
random-timing p < 0.05  AND  DSR > 0.90  AND  OOS Sharpe > 0  AND  net Sharpe > 0 at BOTH
realistic and stressed costs. A candidate is then subject to a separate untouched/forward
test before any capital — passing here is NOT a trade decision.

## Pre-committed stopping rule
If no lookback clears the bar, the conclusion is "FX time-series momentum not demonstrated
on this universe/sample," recorded, and NOT rescued by trying more lookbacks or changing
the rules. A null result is an acceptable outcome.
