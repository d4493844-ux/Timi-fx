# TIMI — Project status and closing record
_As of 2026-10-29; updated 2026-10-30. Covers the full arc from the real-money loss on._

## Update 2026-10-30 — experiment registry (pre-registered, one at a time)

| Experiment | Frozen pre-reg | Result |
|------------|----------------|--------|
| FX cross-sectional (28 pairs) | — | Breadth-limited; screen only. Not pursued. |
| FX time-series momentum (majors+gold, 20/60/90/120d) | PREREG_FX_TSMOM.md | NULL. No lookback cleared the gates; Sharpe negative after costs. Recorded, not rescued. |
| Crypto funding-rate carry (W=7/14/30) | PREREG_FUNDING.md | **First survivor.** W=14 and W=30 cleared the frozen screen at both cost levels; survived the next-open execution acid test (strongest unlevered, net ~+1.0 at 1x, carry-driven); regime check positive 5/6 years (not one-era). **BUT the carry is fading (2025 +0.29, 2026 −0.05)** and it has NOT had a forward/untouched test. Status: candidate for forward paper test ONLY. Not tradable, no capital. |

Remaining queue (each to be pre-registered before running): FX carry; crypto
liquidation-flow; on-chain flow; order-book imbalance (needs HF data).

The one gate funding carry has NOT passed — and the only thing between it and (small,
risk-limited) capital — is forward paper trading on data that did not exist when the rules
were frozen. Carry trades characteristically backtest well and fade live as they crowd;
the 2025–26 deceleration is that risk showing up already. Forward paper is non-negotiable.

## Bottom line

There is **no proven, tradable edge** on the universe tested (40 liquid crypto coins).
What exists now is the thing that was missing before: an honest, validated research engine
and a correct executable simulator that will tell you the truth about any future idea. The
earlier "profits" were artifacts; the current negative result is trustworthy because two
independently built tools agree on it.

## What was discarded (and why)

- **Directional forex EA (TIMI MT5).** Negative expected value after costs; its backtest
  was invalid regardless — see below. Discarded, not repaired.
- **The old validation pipeline** (`significance_suite.js`, `forex_cost_attack_v2.js`):
  a permutation test that randomized PnL signs (wrong null), a 120-config sweep that kept
  only winners (selection bias), and trade logs with ~84% overlapping trades inflating
  Sharpe to a fake ~4.0. Every result it produced is void.
- **Cross-sectional forex (8-currency ranking).** Tested at the screen level: momentum
  deeply negative, nothing significant. 8 instruments is too few for cross-sectional
  breadth. Not pursued further.

## What was built and what it guarantees

**Research engine (`xs_engine.py`)** — cross-sectional ranking, non-overlapping rebalance,
permutation null, Deflated Sharpe, out-of-sample split. Status:
- Controls pass: finds a planted edge, rejects a noise draw (not inverted).
- Calibrated (`xs_calibration.py`): permutation p-value uniform under the null; composite
  verdict false-positive rate ~1% across 120+ noise universes; power characterized
  (27% at a weak effect → 100% at a strong one); Deflated Sharpe matches Monte-Carlo
  ground truth after the hurdle was corrected.
- Hardened (`xs_hardening.py`): p-value holds under fat tails and a factor+GARCH
  crypto-like null (mildly anti-conservative under pure volatility clustering, documented
  and backstopped by the composite rule); dependence-robust stationary-bootstrap CI added.

**Executable simulator (`xs_execution.py`)** — the Phase 2 tradability model:
- Next-open execution (no trading at the close you scored on), account-level returns and
  drawdown, fees + half-spread + slippage on both legs, perp funding (or spot-margin
  borrow), isolated-margin liquidation, and a time-varying universe on a union calendar
  so coins enter/exit as they were actually listed (survivorship-aware).
- Mechanics self-validated (6 checks pass). Costs and funding are **assumptions** until
  measured against real fills and real per-coin funding.

## Signal results (honest, after all fixes)

| Signal | Universe | Result |
|--------|----------|--------|
| Momentum (7/30/90d, skip) | 40 crypto, daily | Noise (none clears the gates) |
| Short reversal | 40 crypto, daily | Noise |
| Distance-from-high | 40 crypto, daily | Not robust — flips sign by horizon. Dead. |
| **Low-volatility** | 40 crypto, daily | The lone survivor at the screen, but: regime-dependent (positive recent, negative full-history), never cleared the significance bar, and in Phase 2 is **gross Sharpe ≈ +0.04 (flat before costs), net negative, with −46% to −63% account drawdowns.** Not tradable. |
| Cross-sectional FX momentum/quality | 8 currencies, daily | Dead (screen only); too few instruments. |

Low-vol long/short, Phase 2, full history, correct short accounting:
optimistic net −0.10 / realistic −0.33 / stressed −0.83; all leverages negative. This
matches the engine's independent −0.31. The two tools converge.

## Bugs found and fixed along the way (why the result is trustworthy)

1. Permutation test randomized PnL signs — wrong null (old forex). Discarded.
2. Selection bias: kept only winning configs before "validating" them. Discarded.
3. Overlapping trades inflating Sharpe. Identified; discarded.
4. Deflated Sharpe hurdle underestimated for small N — fixed (Bailey–López de Prado
   order statistic), verified vs Monte-Carlo.
5. Permutation null not cost-matched — fixed (charges identical turnover cost).
6. Permutation validity filter didn't exclude NaN/inf — fixed to match the backtest.
7. Stopping rule didn't enforce the 40bps condition — fixed.
8. Phase 2 look-ahead survivorship (required coins to survive to the exit date) — fixed
   (force-exit at last price on mid-hold delisting).
9. **Phase 2 short-leg return bug** (`p0/p1−1` instead of `1−p1/p0`): halved losses on a
   coin that doubled, gave unbounded gains when it crashed — inflated the book to a false
   +1.46 Sharpe. Fixed; result collapsed to net-negative and reconciled with the engine.

The last one is the lesson: a single unexplained disagreement between two of our own tools
was enough to refuse the positive result until the cause was found. It was a bug.

## What is NOT established (limits, stated plainly)

- Calibration is on realistic **synthetic** nulls, not actual historical returns.
- Phase 2 costs and funding are parameters, not measured from a real account/order book;
  funding is the single biggest unknown.
- No genuinely untouched holdout has been used; all history has been looked at.
- The `n_trials` used in the Deflated Sharpe is a declared judgment, not a full census of
  every research choice made.
- Forex has not been run through the corrected engine or Phase 2.

## Forks from here (all optional)

1. **Stop.** Keep the engine as a screen for future ideas. Defensible endpoint.
2. **Structurally different hypothesis**, pre-registered before looking at outcomes:
   many more instruments (200–500+) for real cross-sectional breadth, or a data edge
   retail can actually access (funding-rate carry, on-chain flows, liquidations).
3. **A genuine Phase 4 test** of any candidate: frozen rules, untouched/forward data,
   10/20/40 bps, executable-PnL metrics — only then paper trading, and only then capital.

Non-negotiable going forward: nothing trades on real money until it clears the engine's
three gates, survives Phase 2 with realistic costs and a tolerable drawdown, and passes a
pre-registered untouched-period test. That order is the whole point.
