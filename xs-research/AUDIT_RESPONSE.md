# TIMI-XS — Response to the full ZIP technical audit

Disposition for every finding. Four categories:
- **FIXED NOW** — changed in this version (engine-v4).
- **ALREADY FIXED** — fixed and verified in engine-v2/v3; the audit was run against
  timi-xs-audit.zip, which carries the pre-fix engine.
- **CONCEDED (design)** — valid, not a quick bug; belongs to the execution/tradability
  or holdout rework (your Phases 2 and 4). Not claimed as resolved.
- **ACCEPTED** — factual correction; I was wrong.

## Executive findings

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | Old forex: timeout exits booked as full +RR / -1R on sign of final move | CONFIRMED. Old forex pipeline discarded, not repaired. |
| 2 | Old forex: best profitable config selected per symbol before significance test | CONFIRMED. Discarded. |
| 3 | Old forex: near-every-bar entries, 12-32 bar holds -> overlapping, non-independent trades | CONFIRMED. Discarded. |
| 4 | Old permutation randomizes PnL signs (wrong null) | CONFIRMED (with your nuance: it doesn't auto-rubber-stamp; it's the wrong null, worsened by selection + asymmetry). Discarded. |
| 5 | New permutation compares net observed vs gross cost-free random | **ALREADY FIXED** (v2/v3): null now charges identical turnover cost; re-verified uniform under the null. |
| 6 | New "OOS" is a chronological split of the researched panel | CONCEDED (design). It is a diagnostic only; a true holdout needs Phase 4. |
| 7 | DSR trial count hard-coded; doesn't capture project history | DSR formula **ALREADY FIXED** + Monte-Carlo validated (v2/v3). Trial count remains a documented judgment, not a census — unchanged, flagged. |
| 8 | Final test enforces 10bps gates + positive 20bps, not the stated 40bps | **FIXED NOW**: verdict requires full Sharpe > 0 at BOTH 20 and 40bps. |
| 9 | Long-tilt has no permutation test; market short-leg turnover not costed | **FIXED NOW**: added a matched permutation test for the tilt; market leg is the full universe held every period (~0 turnover for a fixed set), now documented explicitly. |
| 10 | Self-test is one noise + one strong edge; not calibration | ADDRESSED (v3): calibration + hardening harnesses measure p-value calibration, FWER, power, DSR. Self-test's "safe to run on real data" overclaim removed. |

## Detailed findings (xs_engine.py / xs_lowvol_final.py)

| Ref | Finding | Disposition |
|-----|---------|-------------|
| 1.1 | No timestamp alignment; assumes trailing bars = same dates | CONCEDED (design). Needs a timestamped input contract + explicit date alignment (Phase 2). |
| 1.2 | Executes at the same close used to score (not next-executable price + slippage) | CONCEDED (design). Real flaw. The fix is an execution lag (enter next bar) + slippage; it ripples through the engine, the calibration replica, and all re-validation, so I've scoped it as Phase 2 rather than slip it in silently. Offered below. |
| 1.3 | Return-unit / capital / gross-exposure convention unspecified; drawdown not account-normalized; cost denominator (one-way vs round-trip) unstated | CONCEDED (design). Needs an explicit capital/margin convention and a stated cost model (Phase 2). |
| 1.4 | Permutation: cost mismatch / no serial-dependence / per-family / coarse n_perm / validity filter only checks None | Cost mismatch **ALREADY FIXED**. Validity filter **FIXED NOW** (now excludes NaN/inf, matching the backtest). Serial-dependence addressed by the stationary bootstrap (hardening). Per-family + coarse resolution: documented — the composite verdict controls FWER empirically (~1%); raw per-family p is screening only. |
| 1.5 | DSR not independently validated | **ALREADY FIXED** + validated vs Monte-Carlo (v2/v3). |
| 1.6 | OOS not an untouched holdout | CONCEDED (Phase 4). |
| 1.7 | No finite/positive price checks; no modeling of holdings across skipped periods; ordinary Sharpe ignores dependence | Dependence: ADDRESSED (stationary-bootstrap CI + realistic-null hardening). Price-validity checks + gap-holding: CONCEDED (design). |
| 2.1 | Pagination overshoots target; survivorship/selection; timestamps discarded; errors swallowed; empty-dict min() crash | Pagination trim **FIXED NOW** (trims to target_bars). Empty-universe crash **FIXED NOW** (guarded, returns cleanly). Survivorship + timestamp capture + request-level error logging: CONCEDED (design, Phase 2). |
| 2.2 | 2021 alt-mania attribution inconsistent with 1612 bars / Oct-2026 run | **ACCEPTED**. 1612 daily bars ending Oct 2026 starts ~mid-2022, so 2021 is not even in-sample. The 2021 explanation is withdrawn entirely; the sign flip is window-instability with cause unidentified. |
| 2.3 | Long/short inherits all engine limits incl. spot-short assumption | CONCEDED (design). |
| 2.4 | Long-tilt cost + no perm + confusing name | **FIXED NOW**: matched perm added; market-leg turnover documented; renamed/annotated as "low-vol basket minus equal-weight market," not long-only. |
| 2.5 | Stopping rule doesn't enforce 40bps | **FIXED NOW** (see Exec #8). |
| 2.6 | "Conclusion is final / no provable edge" too strong | **FIXED NOW**: reworded to "this implementation failed its stated acceptance criteria; do not trade," explicitly not a claim the effect is impossible. |

## Other files

- **xs_selftest.py** — overclaim removed (v3); it's a smoke test, and says so. Calibration lives in xs_calibration.py / xs_hardening.py.
- **results_summary.csv** — CONCEDED: lacks data/code hashes, per-period series, full trial history, tradability-model id. Those belong in the Phase 1 "record hashes and versions" step; the CSV is a summary, not a reproducibility manifest.
- **significance_suite.js / forex_cost_attack_v2.js / forex_attack_trades.json** — all findings (6, 7, 8) CONFIRMED. The old forex results are discarded, not repaired. Agreed: the exit-PnL bug, overlapping trades, selection bias, and the wrong permutation null invalidate them.
- **AUDIT_NOTES.md (section 9)** — all three corrections ACCEPTED: 2021 withdrawn; sign flip is instability not a diagnosed cause; the tilt is a separately specified hypothesis, not a privileged candidate.

## On your repair plan (Phases 1-4)

Agreed in full. Status against it:
- **Phase 1 (freeze/preserve):** versions are kept as separate zips (v2/v3/v4); nothing overwritten. Data/code hashing per run is not yet in place — worth adding.
- **Phase 2 (correct portfolio simulation):** NOT done. Execution convention (next-executable price + slippage), capital/exposure definition, and a real cost model (fees, spread, borrow/funding, short availability, liquidation) charged on actual notional for both legs. This is the biggest remaining piece and the gate on any tradability claim.
- **Phase 3 (replace/validate inference):** substantially done — p-value calibration across many null simulations, power across effect sizes, DSR validated vs Monte-Carlo, dependence-aware bootstrap, raw vs composite reported separately. Not done: a formal multiple-testing adjustment that reflects the full project trial history (the n_trials census).
- **Phase 4 (lock a genuine final test):** NOT done — needs a frozen protocol and a truly untouched/forward period, with the 10/20/40bps requirement and executable-PnL metrics, not just Sharpe.

## Bottom line

The old forex results are discarded. On the new engine, the two statistical defects you first raised (permutation cost, DSR) were already fixed and verified; this version fixes the remaining bounded code defects you found (40bps gate, empty-universe crash, pagination overshoot, permutation validity filter, long-tilt permutation + cost documentation) and corrects the overclaims (2021 cause, "impossible" framing). What remains is not code cleanup — it's Phase 2 (a real execution/tradability model) and Phase 4 (a pre-registered untouched test). Those are the milestones before any verdict here could support trading.
