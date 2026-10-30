# TIMI Trading — Postmortem and Reusable Prompt
### What we tested, what failed, why, and the honest state of play

Purpose of this document: a complete, accurate record of everything attempted on
the TIMI trading project across Deriv/forex and crypto, why each thing failed, and
why retail systematic trading fails in general. The last section is a condensed,
paste-ready prompt that brings any fresh AI session fully up to speed so it does
not repeat the same mistakes or re-sell the same dead ideas back to you.

---

## 1. The one mistake underneath all the others

Every losing version of TIMI tried to **predict direction** — "will this instrument
go up or down from here." Direction at retail horizons is roughly a coin flip before
costs. Once you subtract spread, commission, slippage, and overnight swap, a 50/50
bet is **negative expected value by construction**. No amount of indicator tuning,
risk-reward ratios, or money management turns a negative-EV bet positive. Money
management changes the *shape* of the loss (how fast you go broke), never the sign.

Everything below is a specific instance of this root problem, or of fooling
ourselves into thinking we had beaten it when we had not.

---

## 2. Forex / Deriv (TIMI_v10 MT5 EA) — what we tried and why it failed

**2.1 Directional EA with risk-reward arithmetic (RR4 / RR8).**
The original EA took directional entries and relied on high reward-to-risk ratios
to claim profitability. A strategy that wins 30% of the time at RR4 looks profitable
on paper. The problem: the win rate required to break even at RR4 is only ~20%, so
any entry logic that is even slightly better than random *appears* to work — until
you account for the fact that the backtest's "wins" were not independent and the
costs were understated. RR arithmetic hides negative expectancy; it does not remove it.

**2.2 The significance test was broken (significance_suite.js).**
The permutation test was supposed to be the safeguard. It was not. It shuffled the
**signs** of PnL *magnitudes* that were already RR-asymmetric (every win was +4R,
every loss -1R). Shuffling signs on numbers that are baked to +4/-1 will almost
always produce a positive sum. The test therefore **rubber-stamped any high-RR
strategy**, real edge or not. It could not tell arithmetic from skill. This is the
single most dangerous kind of bug: a validator that always says yes.

**2.3 The backtest selected its own winners (forex_cost_attack_v2.js).**
It swept 5 RR values x 4 multipliers x 6 pairs = 120 configurations, then kept
**only the ones that won** (`if (r.beats && r.net > 0)`), and wrote those
cherry-picked trades to `forex_attack_trades.json`. The broken significance suite
then "validated" that cherry-picked file. This is textbook **selection bias**: search
enough combinations and some will look brilliant by pure luck; report only those and
you have a beautiful, meaningless result.

**2.4 The "4.0 Sharpe" was an artifact of overlapping trades.**
Analysis of `forex_attack_trades.json` showed **84% of trades overlapped within 2
bars** — the same price move was being counted as 15 to 21 separate "trades." Gold
had a 21-trade winning streak that was really one trend logged twenty-one times.
Overlapping, non-independent trades inflate Sharpe ratios enormously. The 4.0 Sharpes
were not edges; they were the same few trends double-counted.

**2.5 Cross-sectional FX (currency ranking) — tested honestly, came back dead.**
We rebuilt forex the right way: decompose the 7 USD majors into 8 currency strength
indices (USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD) and rank currencies — long the
strongest, short the weakest (real FX-fund style, not directional). Run through the
validated engine on daily bars:
- Momentum families: deeply **negative** (full Sharpe around -2.0, permutation
  p-value 1.000 — literally worse than random).
- Distance-from-high: -2.5.
- The only faintly positive thing was short-term reversal (OOS 1.56 but p-value 0.32
  — pure noise at only 8 currencies).

Conclusion: **cross-sectional momentum/quality is not an edge on the 8-currency
daily universe.** Eight instruments is far too few for cross-sectional dispersion to
be measurable. Forex is ruled out as a cross-sectional play at this scale.

---

## 3. Crypto (Binance, ~40 liquid coins) — what we tried and why it failed

Set-up: 40 liquid USDT spot pairs, daily bars, weekly non-overlapping rebalance,
dollar-neutral long top 30% / short bottom 30%, realistic turnover cost. Seven
pre-registered signal families, all reported (no cherry-picking): momentum at 7/30/90
days, momentum-skip, short-term reversal, low-volatility, distance-from-high.

**3.1 First run: 0 of 7 real edges.** Two near-significant leads:
- low-vol: full Sharpe 1.03, out-of-sample 1.20, perm p 0.085, Deflated Sharpe 0.69
- distance-from-high: full 0.84, OOS 0.69, perm p 0.100, Deflated Sharpe 0.57

Both positive in and out of sample, neither clearing the significance bar.

**3.2 4-hour rerun: everything collapsed to noise.**
- low-vol dropped to full 0.96 / OOS 0.81 / p 0.254.
- distance-from-high **flipped sign** to full -1.10 / OOS -0.57.

A real edge does not reverse when you change the bar size. The sign flip killed
distance-from-high: it was never a signal, just noise that landed positive once.

Important nuance on why "more data" did not help: moving to 4h bars did not just add
periods, it **shortened the horizon**. Low-vol's 30-bar window is 30 days on daily
bars but only 5 days on 4h bars — a different, shorter, weaker signal. The low-vol
effect lives at the longer horizon.

**3.3 Combined signal (z-score low-vol + z-score distance-from-high): worse.**
Out-of-sample Sharpe collapsed to 0.05. Blending the one robust-ish signal with a
non-robust one (distance-from-high) produced garbage. Averaging good with bad gives bad.

**3.4 Current status: low-vol is the lone survivor, still unproven.**
Low-vol is the only signal positive in *every* run, both halves, every time — but it
has never cleared the strict bar (perm p < 0.05 AND Deflated Sharpe > 0.90 AND OOS >
0). A final pre-specified test is set up (`xs_lowvol_final.py`): maximum daily history
paged past the 1000-bar cap, 30-day horizon, long/short plus the documented long-tilt
form, cost sweep 10/20/40 bps, with a hard stopping rule. If it does not clear the
bar there, the conclusion is final: no provable edge on this universe.

---

## 4. Why retail systematic traders fail (the structural reasons)

This is not bad luck or insufficient effort. The reasons are structural:

1. **Direction is a coin flip; costs are not.** Brokers publish it: the large majority
   of retail CFD/forex accounts lose money (ESMA-regulated brokers disclose figures
   in the ~74-89% range). The house edge is spread + swap + commission, paid on every
   trade regardless of outcome.

2. **Backtest overfitting.** Search enough parameters and some combination fits the
   past perfectly and predicts nothing. Lopez de Prado's work ("pseudo-mathematics
   and financial charlatanism") shows that with enough trials you can manufacture any
   Sharpe you like on random data. We did exactly this with the 120-config forex sweep.

3. **Overlapping-trade inflation.** Counting one trend as many trades inflates every
   performance statistic. Our gold "21-win streak" was one move.

4. **Broken or absent validation.** A validator that always says yes (our signature
   bug) is worse than no validator — it converts caution into false confidence.

5. **Leverage + RR arithmetic masks negative expectancy.** High RR and leverage make
   the equity curve look good right up until one normal drawdown wipes the account.
   This is how the real-money loss happened.

6. **No structural edge.** Professional desks win on one of: speed (microstructure,
   co-location), data others do not have (order flow, on-chain, funding, liquidations),
   capital and borrow advantages, or breadth (hundreds to thousands of instruments so
   tiny statistical edges become measurable). Retail has none of these by default.

7. **Too few instruments for cross-sectional work.** Cross-sectional ranking needs
   breadth. 8 currencies cannot show dispersion; 40 coins is borderline; the edge, if
   any, is too small to prove at this sample size even if it genuinely exists.

---

## 5. What we actually built that is trustworthy (the instrument, not the edge)

One thing from this project is sound and worth keeping: a **cross-sectional
measurement engine that does not lie to us.** It ranks a universe each period, goes
long the strongest / short the weakest, rebalances non-overlapping (one decision per
period, so no trade double-counting), charges turnover cost, and then tests honestly:

- **Permutation null:** shuffle the rankings, keep the real forward returns. This is
  the correct null — it asks "is our ranking skill better than random ordering."
- **Deflated Sharpe Ratio** (Bailey & Lopez de Prado): penalizes for the number of
  strategies tried and for non-normal returns. The more things you test, the higher
  the bar.
- **Out-of-sample split:** the second half must also be positive.
- A signal is called real only if it clears **all three** gates.

The engine passes its own self-test: it **finds a planted edge** and **rejects pure
noise** (both controls pass). That means when it says "noise," we can trust it. This
is the opposite of the old forex suite, and it is the only defensible foundation to
build on.

---

## 6. What is ruled out / given up on (do not revisit)

- Directional prediction of any single instrument (the original TIMI EA).
- Risk-reward arithmetic as a path to profitability.
- The old significance_suite.js / forex_cost_attack_v2.js pipeline and any result it
  ever produced.
- Distance-from-high as a signal (not robust — flips sign by horizon).
- Cross-sectional momentum/quality on the 8-currency forex universe (dead).
- The low-vol + distance-from-high blend.
- Any "edge" that was only validated on cherry-picked or overlapping trades.

---

## 7. The honest bar going forward

Nothing goes live on real money unless it clears all three statistical gates on the
validated engine, stays net-positive after realistic costs (test at 20 and 40 bps),
and then survives a period of live **paper** trading that matches the backtest. If
low-vol does not pass its final test, a real edge from here requires a structurally
different game: many more instruments (200-500+), or an intraday microstructure/
execution edge, or a genuine data edge (on-chain flows, funding, liquidations) — not
more tuning of the same signals on the same few dozen instruments.

---

## 8. Paste-ready prompt (copy from here down)

> I am working on a systematic trading project. I need you to be rigorous and honest,
> not encouraging. Here is the full history so you do not repeat dead ends or sell me
> back ideas I have already ruled out.
>
> **Root lesson:** directional prediction of a single instrument is negative expected
> value after costs; risk-reward arithmetic and money management never fix negative
> expectancy. Do not propose directional/indicator/RR strategies.
>
> **Already tested and ruled out — do not revisit:**
> - Directional MT5 EA on Deriv/forex with RR4/RR8. Its "profitability" came from (a) a
>   broken permutation test that shuffled signs of already-RR-asymmetric PnL and so
>   rubber-stamped everything, (b) a 120-config sweep that kept only winners (selection
>   bias), and (c) overlapping trades where one trend was counted 15-21 times, inflating
>   Sharpe to a fake 4.0.
> - Cross-sectional currency ranking on 8 forex currencies (daily): momentum deeply
>   negative (p-value 1.0), distance-from-high -2.5. Dead — too few instruments.
> - Crypto cross-sectional on ~40 coins (daily, weekly rebalance, dollar-neutral,
>   7 signal families): 0 of 7 proven. Distance-from-high flipped sign on 4h bars (not
>   robust — dead). A low-vol + distance-from-high blend had OOS Sharpe 0.05 (worse).
> - Low-vol is the only signal positive in every run (full ~1.0, OOS ~1.0+) but has
>   never cleared the significance bar. It is being given one final pre-specified test.
>
> **Validation standard — non-negotiable:** every candidate is tested with a
> permutation null (shuffle the rankings, keep real forward returns), a Deflated Sharpe
> Ratio that penalizes for number of trials and non-normality, and an out-of-sample
> split. A signal is "real" only if perm p < 0.05 AND Deflated Sharpe > 0.90 AND OOS
> Sharpe > 0, and it must stay net-positive at 20 and 40 bps cost. The backtest engine
> is cross-sectional, rebalances non-overlapping (no trade double-counting), and passes
> a self-test that finds a planted edge and rejects pure noise.
>
> **What I want from you:** help me either (a) prove or kill the low-vol tilt cleanly,
> or (b) design a structurally different edge — more instruments (200-500+) for
> detectable cross-sectional dispersion, intraday microstructure/execution, or a data
> edge (on-chain flows, funding rates, liquidations). Tell me when something will not
> work and why. Never validate on cherry-picked or overlapping trades. Never tell me
> something is an edge unless it clears the bar above.
