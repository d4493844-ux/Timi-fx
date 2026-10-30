# Phase 2 — executable portfolio simulation: design and assumptions

Phase 2 answers a different question from the research engine. The engine (+ calibration
+ hardening) asks "does the ranking carry information?" Phase 2 asks "if it did, could
this be traded at anything like the simulated returns?" A signal must pass BOTH, plus a
Phase 4 untouched-period test, before real money is ever in scope.

Files: `xs_execution.py` (the simulator + a no-network self-validation) and
`xs_phase2_live.py` (runs it on real Binance data in Cloud Shell).

## Conventions (every item the audit said was unspecified)

**Execution.** Signal uses closes through bar i. Orders execute at bar i+exec_lag
OPEN (default lag 1 = next bar's open), never the close used to decide — removing the
"trade at the price you scored on" flaw. Positions held open-to-open to the next
rebalance's execution bar. Slippage and half-spread charged on the executed price.

**Capital / exposure.** One account, equity starts at 1.0, dollar-neutral. Gross
exposure G (default 1.0) splits equally: long notional = short notional = G/2 of equity.
Returns are on account equity, so Sharpe AND max drawdown are account-level, not spread-
level — fixing the earlier drawdown misinterpretation.

**Costs (both legs, actual notional, every trade).** Per side: fee_bps (exchange taker),
half_spread_bps, slippage_bps — charged on the notional traded at entry, at each
rebalance's turnover, and at exit. Defaults in the realistic scenario: fee 4, half-spread
1, slippage 2 bps.

**Funding (perp model, the dominant short cost).** funding_bps_per_day applied to gross
notional held, as a conservative drag. This is the single biggest assumption: real
funding differs per coin and per 8h interval and can be negative (a carry edge). The
constant is a placeholder — replace it with real per-coin funding history before trusting
any positive result. Spot+margin alternative (model="spot_margin") instead charges
borrow_bps_per_day on the short notional only.

**No look-ahead in eligibility (fixed).** A coin enters the book based only on what is
known at decision time: it must trade on the decision date and be enterable at the next
bar's open. It is NOT required to still exist at the exit date — requiring that was
look-ahead survivorship bias (it silently excluded coins that delist mid-hold, often the
ones that blow up). If a coin delists during the hold, it is force-exited at its last
available open (reported as forced-exits), not excluded in advance.

**Liquidation cushion is a diagnostic, not a free lunch.** Because isolated-margin
liquidation caps a catastrophic short loss at the posted margin, higher leverage can make
a long-low-vol / short-high-vol book look BETTER by truncating exactly the losses it
should take when high-vol coins rip. The live runner therefore sweeps leverage 1x..5x at
realistic costs. 1x = no cap (shorts eat the full adverse move). If net Sharpe falls as
leverage -> 1x, the apparent edge was the cap, not the signal. Read that sweep before
trusting any positive headline number.

**Liquidation / short availability.** Per position, max tolerable adverse move =
-(1/leverage - maint_margin), checked against the worst intra-hold excursion (bar
highs/lows). Breach → liquidated at that bound, loss capped at posted margin. Default
leverage 2.0, maint 0.5% → a ~49% adverse intra-hold move liquidates. Short availability:
liquid perps assumed for the universe; a coin without a usable perp must be excluded
upstream, not silently assumed.

**Data.** Timestamped klines on a UNION calendar with a TIME-VARYING universe: each
coin keeps its own bars, and on each date a coin is eligible only if it actually has a
bar there (and at both execution dates). Funding uses real elapsed calendar days.

  Correction (why not intersection): the first implementation aligned on the
  INTERSECTION of all coins' timestamps. On the real 40-coin set that collapsed 1,600
  bars to 538 — because several coins have genuine gaps (halts, symbol changes,
  relistings) and a few listed late — and it silently restricted the test to the most
  recent window, i.e. the regime where low-vol already looked good. That is a
  confound, not an alignment. The union calendar + per-date eligibility uses the full
  history and lets coins enter/exit as they actually did, which is how a real
  cross-sectional book trades. A coin forced out (delisting) counts as turnover and is
  charged exit costs.

## What the self-validation proves (xs_execution.py __main__)

On synthetic OHLC, mechanics only: gross==net at zero cost; costs reduce net Sharpe
monotonically; next-open execution runs; the spot-margin alternative runs; liquidation
fires at high leverage and not at low. These prove the machinery is correct. They do NOT
prove any real edge exists, and the synthetic Sharpes are large only because the test
plants a strong edge to exercise the mechanics.

## What is still assumed, not measured (be honest about these)

- Fees/spread/slippage/funding are parameters, not measured from your account and the
  real order book. The live runner sweeps optimistic/realistic/stressed to show
  sensitivity, but the true values must come from real fills.
- Funding is modeled as a constant drag, not real per-coin 8h funding. This is the
  likeliest place a "profitable" book turns unprofitable.
- Slippage is a flat bps, not a size/liquidity-dependent impact model.
- Liquidation uses daily high/low, which cannot capture true intrabar path or gaps.
- No exchange-specific margin tiers, no partial fills, no latency.

## Decision rule for Phase 2 output

A book is "plausibly tradable" only if net Sharpe stays clearly positive with a
tolerable account drawdown across ALL cost scenarios (not just optimistic). That earns a
Phase 4 pre-registered, untouched-period test — never direct live capital. If it only
survives the optimistic scenario, it is not tradable.
