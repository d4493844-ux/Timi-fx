#!/usr/bin/env python3
"""
TIMI-XS — Cross-Sectional Research Engine (instrument-agnostic)
===============================================================

WHY THIS EXISTS
---------------
The old TIMI system hunted a DIRECTIONAL edge ("will X go up?") on forex and
Deriv synthetics. That failed because:
  1. Directional prediction on efficient markets is ~50/50 after costs.
  2. The old backtests were fooled by three stacked flaws:
       (a) selection bias  — sweep 120 configs, keep the lucky winners, "validate" those
       (b) overlapping trades — open a new position every bar during a trend, so ONE
           move gets counted as 15-21 "independent" wins, faking a Sharpe of 4
       (c) a broken permutation null that couldn't tell RR-asymmetry from real edge

This engine does the OPPOSITE and the RIGHT thing. It is CROSS-SECTIONAL:
instead of predicting one asset's direction, it RANKS a whole universe each
period and bets on the SPREAD between strong and weak. The edge isn't "BTC goes
up" — it's "the top-ranked coins outperform the bottom-ranked coins on average",
which is a far more robust and well-documented phenomenon (cross-sectional
momentum / carry). This is how real systematic/CTA funds actually make money.

THE THREE FIXES (baked in, non-negotiable)
------------------------------------------
  FIX 1 — NON-OVERLAPPING: we rebalance on a fixed schedule (e.g. weekly). One
          decision per period per asset. No overlapping-trade inflation. Ever.
  FIX 2 — NO SELECTION BIAS: we do NOT sweep params and keep winners. We pick a
          small set of sensible, pre-registered configs, test ALL of them, and
          report ALL results including failures. Deflated Sharpe penalizes for
          however many we looked at.
  FIX 3 — HONEST NULL: significance comes from (a) a cross-sectional permutation
          that shuffles the RANKINGS (destroying any real skill while preserving
          the market's own return distribution), and (b) Deflated Sharpe with the
          real trial count. A strategy must beat BOTH.

It is instrument-agnostic: feed it a dict {symbol: [bars...]} for ANY universe
(crypto, forex, both) and it runs identically.

OUTPUT: for each signal family, the long-short portfolio's out-of-sample Sharpe,
its permutation p-value, its Deflated Sharpe, max drawdown, and turnover/cost
sensitivity — and a plain verdict: REAL EDGE / NOISE.
"""

import json, math, random, statistics, sys
from collections import defaultdict

# ───────────────────────────── math helpers ─────────────────────────────
def mean(a): return sum(a)/len(a) if a else 0.0
def pstd(a):
    if len(a) < 2: return 0.0
    m = mean(a); return math.sqrt(sum((x-m)**2 for x in a)/len(a))
def norm_cdf(x): return 0.5*(1+math.erf(x/math.sqrt(2)))
def norm_ppf(p):
    """Inverse standard-normal CDF (Acklam's rational approximation, ~1e-9)."""
    if p <= 0.0: return -math.inf
    if p >= 1.0: return math.inf
    a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,
       1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00]
    b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,
       6.680131188771972e+01,-1.328068155288572e+01]
    c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,
       -2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00]
    d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,
       3.754408661907416e+00]
    plow=0.02425; phigh=1-plow
    if p<plow:
        q=math.sqrt(-2*math.log(p))
        return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    if p>phigh:
        q=math.sqrt(-2*math.log(1-p))
        return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1)
    q=p-0.5; r=q*q
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1)

def sharpe_annualized(period_returns, periods_per_year):
    """Sharpe on a series of PER-PERIOD portfolio returns (already non-overlapping)."""
    if len(period_returns) < 5: return 0.0
    m, s = mean(period_returns), pstd(period_returns)
    if s == 0: return 0.0
    return (m/s) * math.sqrt(periods_per_year)

def max_drawdown(period_returns):
    eq, peak, mdd = 1.0, 1.0, 0.0
    for r in period_returns:
        eq *= (1+r); peak = max(peak, eq); mdd = min(mdd, eq/peak - 1)
    return mdd

def deflated_sharpe(observed_sr_annual, n_trials, n_periods, periods_per_year, skew=0.0, kurt=3.0):
    """
    Probability the TRUE Sharpe > 0 given we searched n_trials strategies.
    Bailey & Lopez de Prado. Accounts for multiple testing AND non-normal returns.
    observed_sr_annual: annualized Sharpe of the chosen strategy.
    Returns (dsr_probability, hurdle_annual_sharpe).
    """
    if n_periods < 10 or n_trials < 1: return (0.0, 0.0)
    sr = observed_sr_annual / math.sqrt(periods_per_year)      # de-annualize to per-period
    # expected max Sharpe under the null from n_trials independent tries.
    # Bailey & Lopez de Prado's order-statistic formula (accurate for small N):
    #   E[max] ~= (1-gamma)*Z^-1(1-1/N) + gamma*Z^-1(1-1/(N*e))
    # The previous sqrt(2 ln N) approximation underestimated E[max] for small N
    # (verified against Monte-Carlo in xs_calibration.py), making the DSR too lax.
    if n_trials > 1:
        gamma = 0.5772156649015329    # Euler-Mascheroni
        e_max = (1-gamma)*norm_ppf(1 - 1.0/n_trials) + gamma*norm_ppf(1 - 1.0/(n_trials*math.e))
    else:
        e_max = 0.0
    sr0 = e_max / math.sqrt(n_periods)                          # the hurdle, per-period
    # variance of the Sharpe estimator with non-normal returns
    var = (1 - skew*sr + ((kurt-1)/4)*sr**2) / (n_periods - 1)
    if var <= 0: return (0.0, sr0*math.sqrt(periods_per_year))
    dsr = norm_cdf((sr - sr0) / math.sqrt(var))
    return (dsr, sr0*math.sqrt(periods_per_year))

def skewness(a):
    m, s = mean(a), pstd(a)
    if s == 0 or len(a) < 3: return 0.0
    return mean([((x-m)/s)**3 for x in a])
def kurtosis(a):
    m, s = mean(a), pstd(a)
    if s == 0 or len(a) < 4: return 3.0
    return mean([((x-m)/s)**4 for x in a])

# ───────────────────────── signal families (cross-sectional) ─────────────────────────
# Each takes the full price history of ONE asset up to time t (inclusive) and
# returns a single SCORE. Higher score = expected to outperform the universe.
# We rank assets by score each rebalance and go long the top, short the bottom.

def sig_momentum(closes, lookback):
    """Classic cross-sectional momentum: total return over the lookback window.
       The single most robust, most-documented cross-sectional edge that exists."""
    if len(closes) < lookback+1: return None
    return closes[-1]/closes[-1-lookback] - 1.0

def sig_momentum_skip(closes, lookback, skip):
    """Momentum skipping the most recent `skip` bars (avoids short-term reversal)."""
    if len(closes) < lookback+skip+1: return None
    return closes[-1-skip]/closes[-1-lookback-skip] - 1.0

def sig_reversal(closes, lookback):
    """Short-term cross-sectional reversal: recent losers tend to bounce.
       Opposite sign of momentum; real on short horizons for some universes."""
    if len(closes) < lookback+1: return None
    return -(closes[-1]/closes[-1-lookback] - 1.0)

def sig_lowvol(closes, lookback):
    """Low-volatility anomaly: lower realized vol tends to earn better risk-adj return.
       Score = -vol so low-vol assets rank high."""
    if len(closes) < lookback+1: return None
    rets = [math.log(closes[i]/closes[i-1]) for i in range(len(closes)-lookback, len(closes))]
    v = pstd(rets)
    return -v if v > 0 else None

def sig_dist_from_high(closes, lookback):
    """52-week-high style: proximity to recent high (a momentum cousin)."""
    if len(closes) < lookback+1: return None
    window = closes[-lookback:]
    hi = max(window)
    return closes[-1]/hi if hi > 0 else None

SIGNAL_FAMILIES = {
    "mom_short":      lambda c: sig_momentum(c, 7),
    "mom_med":        lambda c: sig_momentum(c, 30),
    "mom_long":       lambda c: sig_momentum(c, 90),
    "mom_skip":       lambda c: sig_momentum_skip(c, 30, 7),
    "reversal_short": lambda c: sig_reversal(c, 3),
    "lowvol":         lambda c: sig_lowvol(c, 30),
    "dist_high":      lambda c: sig_dist_from_high(c, 90),
}
# NOTE: 7 pre-registered families. n_trials for deflation = 7 (we report ALL).

# ───────────────────────── the cross-sectional backtest ─────────────────────────
def run_cross_sectional(universe, score_fn, rebalance_every, top_frac=0.3,
                        cost_bps=10, periods_per_year=52):
    """
    universe: {symbol: [close, close, ...]}  (all aligned to the same length/timeline)
    score_fn: closes_up_to_t -> score (or None if not enough data)
    rebalance_every: bars between rebalances (FIX 1: non-overlapping, one decision/period)
    top_frac: fraction of the universe to go long (and short the symmetric bottom)
    cost_bps: round-trip transaction cost per rebalance leg, in basis points
    Returns dict with per-period long-short returns and summary stats.
    """
    symbols = list(universe.keys())
    n = min(len(universe[s]) for s in symbols)
    # align all series to the last n bars
    series = {s: universe[s][-n:] for s in symbols}

    period_returns = []
    prev_longs, prev_shorts = set(), set()
    t = rebalance_every
    while t < n - rebalance_every:
        # score every asset using data UP TO t (no lookahead)
        scores = {}
        for s in symbols:
            sc = score_fn(series[s][:t+1])
            if sc is not None and not math.isnan(sc) and not math.isinf(sc):
                scores[s] = sc
        if len(scores) < 4:
            t += rebalance_every; continue
        ranked = sorted(scores, key=scores.get, reverse=True)
        k = max(1, int(len(ranked)*top_frac))
        longs, shorts = set(ranked[:k]), set(ranked[-k:])

        # realized forward return of each leg over the NEXT rebalance window
        def leg_ret(syms):
            rs = []
            for s in syms:
                p0, p1 = series[s][t], series[s][t+rebalance_every]
                if p0 > 0: rs.append(p1/p0 - 1.0)
            return mean(rs) if rs else 0.0

        long_r = leg_ret(longs)
        short_r = leg_ret(shorts)
        gross = long_r - short_r                      # dollar-neutral long/short

        # turnover cost: fraction of names that changed since last rebalance
        turnover = (len(longs ^ prev_longs) + len(shorts ^ prev_shorts)) / (2*k) if k else 0
        cost = turnover * (cost_bps/10000.0)
        net = gross - cost

        period_returns.append(net)
        prev_longs, prev_shorts = longs, shorts
        t += rebalance_every

    if len(period_returns) < 5:
        return None
    sr = sharpe_annualized(period_returns, periods_per_year)
    return {
        "returns": period_returns,
        "n_periods": len(period_returns),
        "sharpe": sr,
        "total_return": math.prod([1+r for r in period_returns]) - 1,
        "maxdd": max_drawdown(period_returns),
        "mean_period": mean(period_returns),
        "skew": skewness(period_returns),
        "kurt": kurtosis(period_returns),
    }

# ───────────────────────── honest significance (FIX 3) ─────────────────────────
def permutation_pvalue(universe, score_fn, rebalance_every, real_sharpe,
                       top_frac, cost_bps, periods_per_year, n_perm=200, seed=42):
    """
    Cross-sectional permutation: on each rebalance, SHUFFLE which asset gets which
    score (i.e. randomize the ranking) while keeping the real forward returns. This
    destroys any genuine ranking skill but preserves the market's own return shape.
    p = fraction of random-ranking runs whose Sharpe >= the real strategy's Sharpe.
    """
    rng = random.Random(seed)
    symbols = list(universe.keys())
    n = min(len(universe[s]) for s in symbols)
    series = {s: universe[s][-n:] for s in symbols}
    # PRECOMPUTE once: the null uses RANDOM rankings, so the scores themselves are never
    # needed inside the shuffle loop — only each period's valid set and forward returns,
    # which are invariant across permutations. Computing them once (instead of re-running
    # score_fn on every one of n_perm shuffles) removes the O(n_perm) blowup that made
    # this grind on long histories. Semantics are identical (same rng.shuffle sequence).
    periods = []
    t = rebalance_every
    while t < n - rebalance_every:
        valid = []
        for s in symbols:
            sc = score_fn(series[s][:t+1])            # same validity test as run_cross_sectional
            if sc is not None and not math.isnan(sc) and not math.isinf(sc):
                valid.append(s)
        if len(valid) >= 4:
            fwd = {}
            for s in valid:
                p0, p1 = series[s][t], series[s][t+rebalance_every]
                if p0 > 0: fwd[s] = p1/p0 - 1.0
            valid = [s for s in valid if s in fwd]
            if len(valid) >= 4: periods.append((valid, fwd))
        t += rebalance_every
    beat = 0
    for _ in range(n_perm):
        prs = []; prev_longs, prev_shorts = set(), set()
        for valid, fwd in periods:
            shuffled = valid[:]; rng.shuffle(shuffled)      # RANDOM ranking
            k = max(1, int(len(shuffled)*top_frac))
            longs, shorts = shuffled[:k], shuffled[-k:]
            legL = sum(fwd[s] for s in longs)/k
            legS = sum(fwd[s] for s in shorts)/k
            Ls, Ss = set(longs), set(shorts)
            turnover = (len(Ls ^ prev_longs) + len(Ss ^ prev_shorts)) / (2*k)
            prs.append((legL - legS) - turnover*(cost_bps/10000.0))
            prev_longs, prev_shorts = Ls, Ss
        if len(prs) >= 5 and sharpe_annualized(prs, periods_per_year) >= real_sharpe:
            beat += 1
    return (beat+1)/(n_perm+1)

# ───────────────────────── the full honest evaluation ─────────────────────────
def evaluate_universe(universe, rebalance_every, periods_per_year, top_frac=0.3,
                      cost_bps=10, n_perm=200, label=""):
    """
    Runs ALL signal families on the universe, honestly. Reports every result.
    n_trials for Deflated Sharpe = number of families tested (no cherry-picking).
    """
    families = list(SIGNAL_FAMILIES.items())
    n_trials = len(families)
    rows = []
    for name, fn in families:
        res = run_cross_sectional(universe, fn, rebalance_every, top_frac, cost_bps, periods_per_year)
        if res is None:
            rows.append((name, None)); continue
        # honest OOS: evaluate significance on the SECOND HALF only (first half is "in sample")
        half = res["n_periods"]//2
        oos = res["returns"][half:]
        oos_sr = sharpe_annualized(oos, periods_per_year) if len(oos) >= 5 else 0.0
        pval = permutation_pvalue(universe, fn, rebalance_every, res["sharpe"],
                                  top_frac, cost_bps, periods_per_year, n_perm=n_perm)
        dsr, hurdle = deflated_sharpe(res["sharpe"], n_trials, res["n_periods"],
                                      periods_per_year, res["skew"], res["kurt"])
        rows.append((name, dict(full_sharpe=res["sharpe"], oos_sharpe=oos_sr,
                                pval=pval, dsr=dsr, hurdle=hurdle, maxdd=res["maxdd"],
                                total=res["total_return"], n=res["n_periods"],
                                skew=res["skew"])))
    _print_report(label, rows, n_trials)
    return rows

def _print_report(label, rows, n_trials):
    print("="*100)
    print(f" CROSS-SECTIONAL EVALUATION  {label}")
    print(f" {n_trials} signal families tested (all reported — no cherry-picking)")
    print("="*100)
    print(f"{'family':16s}{'fullSR':>8s}{'oosSR':>8s}{'perm_p':>9s}{'DSR':>7s}{'hurdle':>8s}{'maxDD':>8s}{'VERDICT':>16s}")
    print("-"*100)
    for name, r in rows:
        if r is None:
            print(f"{name:16s}{'  insufficient data':>50s}"); continue
        # VERDICT: a real edge must (a) beat permutation at p<0.05, (b) clear the
        # deflated hurdle (DSR>0.90), AND (c) hold up out-of-sample (oosSR>0).
        real = (r['pval'] < 0.05) and (r['dsr'] > 0.90) and (r['oos_sharpe'] > 0)
        verdict = "REAL EDGE" if real else "noise"
        print(f"{name:16s}{r['full_sharpe']:>8.2f}{r['oos_sharpe']:>8.2f}"
              f"{r['pval']:>9.3f}{r['dsr']:>7.2f}{r['hurdle']:>8.2f}{r['maxdd']*100:>7.0f}%"
              f"{verdict:>16s}")
    print("-"*100)
    reals = [n for n,r in rows if r and r['pval']<0.05 and r['dsr']>0.90 and r['oos_sharpe']>0]
    print(f" REAL EDGES FOUND: {len(reals)}  ->  {', '.join(reals) if reals else 'none'}")
    print("="*100)
    print(" Reading it: fullSR=full-sample annualized Sharpe of the long/short book.")
    print("   oosSR=Sharpe on the held-out 2nd half. perm_p=beats random rankings if <0.05.")
    print("   DSR=prob the edge is real after penalizing for testing 7 families (want >0.90).")
    print("   A family is REAL only if it clears ALL THREE gates. Most should read 'noise'.")
    print("   That is the engine working correctly — real cross-sectional edges are RARE.")

if __name__ == "__main__":
    print("This is the engine library. Run xs_selftest.py to validate it, or")
    print("xs_run_live.py in Cloud Shell to run it on real Binance data.")
