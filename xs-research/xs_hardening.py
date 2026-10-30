#!/usr/bin/env python3
"""
NULL HARDENING — can the permutation p-value be trusted on REAL market returns?

xs_calibration.py showed the permutation test is calibrated on Gaussian random-walk
nulls. Real crypto is not Gaussian: it has fat tails, volatility clustering, and
strong cross-sectional correlation (one market factor). If the test is only calibrated
on Gaussian nulls, its p-values do not transfer to real data. This file regenerates
the calibration under REALISTIC nulls and re-measures.

Two additions:
  1. Realistic null generators (no cross-sectional edge planted):
       - Student-t innovations            (fat tails)
       - GARCH(1,1) volatility            (clustering)
       - common market factor + idio      (cross-sectional correlation)
       - FULL = all three (closest to crypto)
     Re-run p-value uniformity (Test A) and family-wise false-positive rate (Test B)
     under each. If p stays uniform and FWER stays low, the test transfers.
  2. Stationary bootstrap (Politis-Romano) of the strategy's own return stream, a
     dependence-robust significance cross-check that the ranking-permutation does not
     provide. Its coverage of zero is validated on dependent null streams.

Reuses the faithful numpy backtest from xs_calibration (fidelity-checked vs the engine).
No network.
"""
import math, numpy as np
import xs_engine as E
import xs_calibration as CC

# ───────────────────────── realistic null generators (NO edge) ─────────────────────────
def _std_t(df, size, rng):
    """Student-t standardized to unit variance."""
    return rng.standard_t(df, size=size) * math.sqrt((df-2)/df)

def t_panel(A, N, df=4, sigma=0.03, rng=None):
    rng = rng or np.random.default_rng()
    lr = _std_t(df, (A, N), rng) * sigma
    return 100.0*np.exp(np.cumsum(lr, axis=1))

def garch_series(N, rng, df=4, omega=None, alpha=0.10, beta=0.87, sigma0=0.03):
    """One GARCH(1,1)-t log-return path. Persistence alpha+beta=0.97 (crypto-like)."""
    if omega is None: omega = sigma0*sigma0*(1-alpha-beta)
    lr = np.empty(N); s2 = sigma0*sigma0; eps = 0.0
    for t in range(N):
        s2 = omega + alpha*eps*eps + beta*s2
        eps = math.sqrt(s2) * _std_t(df, 1, rng)[0]
        lr[t] = eps
    return lr

def garch_panel(A, N, rng=None, df=4):
    rng = rng or np.random.default_rng()
    lr = np.vstack([garch_series(N, rng, df=df) for _ in range(A)])
    return 100.0*np.exp(np.cumsum(lr, axis=1))

def factor_panel(A, N, rng=None, df=4, full=True):
    """Common market factor + idiosyncratic. full=True adds GARCH + t to both.
       Zero mean on everything -> NO cross-sectional return edge exists."""
    rng = rng or np.random.default_rng()
    if full:
        f = garch_series(N, rng, df=df, sigma0=0.03)
        idio = np.vstack([garch_series(N, rng, df=df, sigma0=0.025) for _ in range(A)])
    else:
        f = _std_t(df, N, rng)*0.03
        idio = _std_t(df, (A, N), rng)*0.025
    betas = rng.uniform(0.6, 1.4, size=A)        # heterogeneous betas -> vol dispersion
    lr = betas[:, None]*f[None, :] + idio
    return 100.0*np.exp(np.cumsum(lr, axis=1))

NULLS = {
    "gaussian(baseline)": lambda A,N,rng: CC.noise_panel(A, N, rng=rng),
    "student-t(df4)":     lambda A,N,rng: t_panel(A, N, df=4, rng=rng),
    "garch-t":            lambda A,N,rng: garch_panel(A, N, rng=rng),
    "factor+garch-t(FULL)": lambda A,N,rng: factor_panel(A, N, rng=rng, full=True),
}

# ───────────────────────── Test A under each realistic null ─────────────────────────
def pvalue_uniformity_under(nullname, gen, M=120, A=12, N=320, rebal=5, lb=5, n_perm=80):
    ps=[]
    for i in range(M):
        P = gen(A, N, np.random.default_rng(4100+i))
        obs = CC.backtest_np(P, lambda Pp,t: CC.mom_score(Pp,t,lb), rebal, 0.3, 10, 52)
        if not obs: continue
        p = CC.perm_p_np(P, lambda Pp,t: CC.mom_score(Pp,t,lb), rebal, 0.3, 10, 52,
                         obs["sharpe"], n_perm, np.random.default_rng(8100+i))
        ps.append(p)
    ps=np.array(ps)
    p05 = float(np.mean(ps<0.05)); p10=float(np.mean(ps<0.10))
    verdict = "CALIBRATED" if abs(p05-0.05)<0.035 else "MISCALIBRATED"
    print(f"  {nullname:22s}  n={len(ps):3d}  P(p<.05)={p05:.3f}  P(p<.10)={p10:.3f}  mean={ps.mean():.3f}  -> {verdict}")
    return p05

# ───────────────────────── Test B (FWER) under the FULL realistic null ─────────────────────────
def fwer_under(nullname, gen, M=100, A=12, N=320, rebal=5, n_perm=60):
    nt=len(CC.FAMILIES); anyhit=0; per={k:0 for k in CC.FAMILIES}
    for i in range(M):
        P = gen(A, N, np.random.default_rng(4300+i))
        hit=False
        for name,fn in CC.FAMILIES.items():
            if CC.composite_real(P, fn, rebal, n_perm, nt, np.random.default_rng(7300+i*10)):
                per[name]+=1; hit=True
        if hit: anyhit+=1
    print(f"  {nullname}:  family-wise FPR={anyhit/M:.3f}   per-family={{"
          + ", ".join(f'{k}:{v/M:.2f}' for k,v in per.items()) + "}")
    return anyhit/M

# ───────────────────────── stationary bootstrap Sharpe CI ─────────────────────────
def stationary_bootstrap_sharpe(returns, ppy=52, B=2000, mean_block=5, rng=None, widen=1.25):
    """Politis-Romano stationary bootstrap for the Sharpe ratio.
    Returns (sharpe, lo95, hi95, p_ge_0).

    Small-sample correction: the raw percentile CI under-covers (~0.90 vs 0.95 on
    ~60-period fat-tailed/clustered null streams; verified in xs_hardening, and LONGER
    blocks make it worse, so the cause is the Sharpe's skewed small-sample distribution,
    not missing dependence). We widen the interval around the point estimate by
    widen=1.25, empirically calibrated on the realistic null to restore ~0.95 coverage
    (c=1.2 -> 0.94, c=1.4 -> 0.98). Set widen=1.0 for the raw percentile CI.
    """
    rng = rng or np.random.default_rng()
    r = np.asarray(returns); n=len(r)
    if n<8: return (0.0,0.0,0.0,1.0)
    def sr(x):
        s=x.std(ddof=0); return (x.mean()/s)*math.sqrt(ppy) if s>0 else 0.0
    obs=sr(r); pfl=1.0/mean_block; boot=np.empty(B)
    for b in range(B):
        idx=np.empty(n, dtype=int); i=rng.integers(n)
        for t in range(n):
            idx[t]=i
            if rng.random()<pfl: i=rng.integers(n)
            else: i=(i+1)%n
        boot[b]=sr(r[idx])
    lo,hi=np.percentile(boot,[2.5,97.5])
    lo,hi = obs-(obs-lo)*widen, obs+(hi-obs)*widen      # small-sample widening
    return (obs, float(lo), float(hi), float(np.mean(boot<=0)))

def validate_bootstrap_coverage(M=200, A=12, N=320, rebal=5, lb=5):
    """On dependent, fat-tailed NULL strategy streams (true Sharpe ~0), the 95% CI
       should contain 0 about 95% of the time. Under-coverage = anti-conservative."""
    covered=0; used=0
    for i in range(M):
        P = factor_panel(A, N, np.random.default_rng(4500+i), full=True)
        obs = CC.backtest_np(P, lambda Pp,t: CC.mom_score(Pp,t,lb), rebal, 0.3, 10, 52)
        if not obs: continue
        _,lo,hi,_ = stationary_bootstrap_sharpe(obs["returns"], 52, B=800,
                                                 rng=np.random.default_rng(8500+i))
        used+=1
        if lo<=0<=hi: covered+=1
    print(f"  dependent null streams: 95% CI covers 0 in {covered}/{used} = {covered/used:.3f} (target ~0.95)")
    return covered/used

if __name__ == "__main__":
    print("="*96); print(" HARDENING 1 — permutation p-value uniformity under REALISTIC nulls"); print("="*96)
    for name,gen in NULLS.items():
        pvalue_uniformity_under(name, gen)

    print("\n"+"="*96); print(" HARDENING 2 — family-wise false-positive rate: Gaussian vs FULL realistic null"); print("="*96)
    fwer_under("gaussian(baseline)", NULLS["gaussian(baseline)"])
    fwer_under("factor+garch-t(FULL)", NULLS["factor+garch-t(FULL)"])

    print("\n"+"="*96); print(" HARDENING 3 — stationary-bootstrap Sharpe CI coverage on dependent null streams"); print("="*96)
    validate_bootstrap_coverage()
    print("\n"+"="*96); print(" HARDENING COMPLETE"); print("="*96)
