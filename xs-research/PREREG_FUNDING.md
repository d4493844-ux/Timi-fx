# Pre-registration — crypto perpetual funding-rate carry
_Frozen 2026-10-30, BEFORE fetching any data or seeing any result. Do not edit after results exist._

## Hypothesis
On a perpetual future, funding is exchanged every 8h: when the funding rate f>0 longs pay
shorts, when f<0 shorts pay longs. A dollar-neutral cross-sectional book that SHORTS the
highest-funding perps (collecting funding) and LONGS the most-negative-funding perps (also
collecting funding) earns the funding spread while holding ~zero net price exposure. The
hypothesis: the captured funding spread exceeds the price-P&L noise of the long/short book
plus trading costs, giving a positive, significant, cost-surviving return.

This is a CARRY mechanism with a defined economic source (you are paid to hold the
unpopular side), not a price-direction prediction.

## Universe (fixed)
~30 liquid Binance USDT perpetual futures (BTC, ETH, and the liquid alts). Point-in-time:
a coin is in the book on a date only if it has a real perp bar and funding record then.

## Signal & portfolio (fixed)
- Signal per perp: trailing mean daily funding rate over a window W.
- Rank perps by signal each rebalance. SHORT the top `top_frac`=0.3 (highest funding),
  LONG the bottom 0.3 (lowest/most negative). Dollar-neutral, equal weight, gross = 1.
- Rebalance weekly (7 days), non-overlapping.
- Period P&L = price P&L of the long/short book + funding collected over the hold − costs.
  (Funding P&L for a signed weight w is −w·Σf over the hold: shorts on +f receive, longs
  on −f receive.) Price and funding P&L are reported SEPARATELY for transparency.

## Signal windows to test (fixed set = the trial count)
W ∈ {7, 14, 30} days. Three trials. DSR n_trials = 3 for this experiment (broader project
history acknowledged separately; not re-chosen after results).

## Costs (fixed scenarios, perp-appropriate)
- realistic: fee 4, half-spread 1, slippage 2 bps per side.
- stressed:  fee 6, half-spread 2, slippage 4 bps per side.
Funding is the RETURN here (captured), not a cost. Trading costs apply to turnover, both
legs. NOTE: this screen uses close-to-close prices; next-open execution + a real fill model
is added only if a window clears the screen (same staging as the rest of the project).

## Significance test (fixed)
- Permutation null: shuffle which perps are long/short (random ranking), keep each perp's
  REAL price and funding series; recompute both P&L components. p = fraction of random
  rankings whose Sharpe >= observed. Tests whether ranking BY FUNDING beats random.
- Deflated Sharpe, n_trials = 3, corrected hurdle.
- Out-of-sample: second-half Sharpe must be positive.

## Acceptance (fixed — all must hold for a window to be a CANDIDATE)
perm p < 0.05 AND DSR > 0.90 AND OOS Sharpe > 0 AND net Sharpe > 0 at BOTH realistic and
stressed costs. A candidate then needs a next-open/real-fill execution test and a
pre-registered untouched-period test before any capital. Passing here is NOT a trade.

## Pre-committed stopping rule
If no window clears the bar, the conclusion is "funding-rate carry not demonstrated on this
universe/sample," recorded, and NOT rescued by trying more windows or changing rules. A
null is an acceptable outcome. Also report, separately, whether the funding P&L component
alone is positive — that is diagnostic, not a pass.
