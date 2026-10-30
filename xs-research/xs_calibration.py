#!/usr/bin/env python3
"""
CALIBRATION HARNESS — independently tests whether the engine's STATISTICS are
calibrated, not merely non-inverted. This is the deliverable the audit asked for:
the self-test proves the engine finds a planted edge and rejects one noise draw;
this proves (or disproves) that its p-values mean what they claim across MANY draws.

It does four things:
  A. p-value calibration under the null. Run the permutation test on many
     independent pure-noise universes. If the p-value is calibrated, the fraction
     with p < alpha should be ~= alpha for every alpha. (Tests finding #1/#2.)
  B. Family-wise false-positive rate of the composite verdict. Run the full
     multi-family engine on many noise universes and count how often it declares
     ANY family a REAL EDGE. This is the real false-discovery rate of the verdict
     label, which the two-universe self-test cannot establish. (Finding #2.)
  C. Power curve. Plant a persistent cross-sectional edge at a sweep of effect
     sizes and measure detection rate. Calibration is useless without power.
  D. Deflated Sharpe vs Monte-Carlo ground truth. Simulate the true distribution
     of the maximum Sharpe under the null and check the analytic formula's hurdle
     and probability against it. (Finding #4.)

For speed it uses a numpy backtest that replicates the engine's semantics exactly;
FIDELITY CHECK 0 proves that replica matches xs_engine.run_cross_sectional before
any calibration number is trusted.

No network. Pure synthetic data with known ground truth.
"""
import math, numpy as np
import xs_engine as E

RNG = np.random.default_rng(0)

# ───────────────────────── vectorized replica of the engine ─────────────────────────
def noise_panel(n_assets, n_bars, sigma=0.03, rng=None):
    rng = rng or RNG
    steps = rng.normal(0, sigma, size=(n_assets, n_bars))
    return 100.0*np.exp(np.cumsum(steps, axis=1))

def momentum_panel(n_assets, n_bars, strength, persist=0.995, sigma=0.03, rng=None):
    """Persistent latent per-asset drift -> genuine cross-sectional momentum."""
    rng = rng or RNG
    latent = rng.normal(0, 0.004, size=n_assets)
    out = np.empty((n_assets, n_bars)); px = np.full(n_assets, 100.0)
    for t in range(n_bars):
        latent = persist*latent + (1-persist)*rng.normal(0, 0.004, size=n_assets)
        px = px*np.exp(latent*strength*10 + rng.normal(0, sigma, size=n_assets))
        out[:, t] = px
    return out

def mom_score(P, t, lb):
    if t < lb: return None
    return P[:, t]/P[:, t-lb] - 1.0

def lowvol_score(P, t, lb):
    if t < lb: return None
    w = np.log(P[:, t-lb+1:t+1]/P[:, t-lb:t])     # lb log-returns per asset
    return -w.std(axis=1, ddof=0)

def disthigh_score(P, t, lb):
    if t < lb: return None
    hi = P[:, t-lb:t+1].max(axis=1)
    return P[:, t]/hi

def backtest_np(P, score_at, rebal, top_frac, cost_bps, ppy, perm_rng=None):
    """Replicates run_cross_sectional. If perm_rng given, randomize the ranking each
       period (the permutation null) with MATCHED turnover cost."""
    A, N = P.shape; rets=[]; prevL=set(); prevS=set(); t=rebal
    while t < N-rebal:
        sc = score_at(P, t)
        if sc is None: t+=rebal; continue
        order = np.argsort(sc)[::-1]                 # descending score
        if perm_rng is not None: perm_rng.shuffle(order)   # random ranking
        k = max(1, int(A*top_frac))
        L = order[:k]; S = order[-k:]
        fwd = P[:, t+rebal]/P[:, t] - 1.0
        gross = fwd[L].mean() - fwd[S].mean()
        Ls, Ss = set(L.tolist()), set(S.tolist())
        turnover = (len(Ls ^ prevL)+len(Ss ^ prevS))/(2*k)
        rets.append(gross - turnover*(cost_bps/10000.0))
        prevL, prevS = Ls, Ss; t+=rebal
    if len(rets) < 5: return None
    r = np.array(rets)
    m, s = r.mean(), r.std(ddof=0)
    sr = (m/s)*math.sqrt(ppy) if s>0 else 0.0
    return dict(returns=r, n=len(r), sharpe=sr,
                skew=float(((r-m)**3).mean()/s**3) if s>0 else 0.0,
                kurt=float(((r-m)**4).mean()/s**4) if s>0 else 3.0)

def perm_p_np(P, score_at, rebal, top_frac, cost_bps, ppy, real_sr, n_perm, rng):
    beat=0
    for _ in range(n_perm):
        res = backtest_np(P, score_at, rebal, top_frac, cost_bps, ppy, perm_rng=rng)
        if res and res["sharpe"] >= real_sr: beat+=1
    return (beat+1)/(n_perm+1)

# ───────────────────────── fidelity check vs the real engine ─────────────────────────
def fidelity_check():
    print("="*90); print(" FIDELITY CHECK 0 — numpy replica must match xs_engine.run_cross_sectional")
    print("="*90)
    P = momentum_panel(16, 500, strength=0.6, rng=np.random.default_rng(7))
    uni = {f"A{i:02d}": P[i].tolist() for i in range(P.shape[0])}
    lb, rebal, tf, cb, ppy = 10, 5, 0.3, 10, 52
    eng = E.run_cross_sectional(uni, lambda c: E.sig_momentum(c, lb), rebal, tf, cb, ppy)
    rep = backtest_np(P, lambda Pp,t: mom_score(Pp,t,lb), rebal, tf, cb, ppy)
    de = abs(eng["sharpe"]-rep["sharpe"])
    print(f"  engine Sharpe={eng['sharpe']:.4f}  replica Sharpe={rep['sharpe']:.4f}  |diff|={de:.4f}")
    print(f"  engine periods={eng['n_periods']}  replica periods={rep['n']}")
    ok = de < 1e-6 and eng["n_periods"]==rep["n"]
    print(f"  REPLICA FAITHFUL: {'YES' if ok else 'NO — calibration numbers below are not trustworthy'}")
    return ok

# ───────────────────────── A. p-value calibration under the null ─────────────────────────
def test_pvalue_uniformity(M=200, n_assets=12, n_bars=320, rebal=5, lb=5, n_perm=120):
    print("\n"+"="*90); print(f" TEST A — permutation p-value calibration under the NULL ({M} noise universes)")
    print("="*90)
    ps=[]
    for i in range(M):
        rng = np.random.default_rng(1000+i)
        P = noise_panel(n_assets, n_bars, rng=rng)
        obs = backtest_np(P, lambda Pp,t: mom_score(Pp,t,lb), rebal, 0.3, 10, 52)
        if not obs: continue
        p = perm_p_np(P, lambda Pp,t: mom_score(Pp,t,lb), rebal, 0.3, 10, 52,
                      obs["sharpe"], n_perm, np.random.default_rng(9000+i))
        ps.append(p)
    ps=np.array(ps)
    print(f"  universes used: {len(ps)}")
    for a in (0.01,0.05,0.10,0.20):
        print(f"    P(p < {a:.2f}) = {np.mean(ps<a):.3f}   (calibrated target ~= {a:.2f})")
    print(f"    mean p = {ps.mean():.3f}  (uniform target 0.50)")
    within = abs(np.mean(ps<0.05)-0.05) < 0.03
    print(f"  VERDICT: p-value at 0.05 is {'CALIBRATED (within 0.02-0.08)' if within else 'MISCALIBRATED'}")
    return ps

# ───────────────────────── B. family-wise false-positive rate ─────────────────────────
FAMILIES = {   # lookbacks scaled to the calibration sample length
    "mom_a": lambda Pp,t: mom_score(Pp,t,5),
    "mom_b": lambda Pp,t: mom_score(Pp,t,10),
    "mom_c": lambda Pp,t: mom_score(Pp,t,20),
    "rev":   lambda Pp,t: (None if mom_score(Pp,t,3) is None else -mom_score(Pp,t,3)),
    "lowvol":lambda Pp,t: lowvol_score(Pp,t,10),
    "dist":  lambda Pp,t: disthigh_score(Pp,t,20),
}
def composite_real(P, score_at, rebal, n_perm, n_trials, rng):
    obs = backtest_np(P, score_at, rebal, 0.3, 10, 52)
    if not obs: return False
    half = obs["n"]//2
    oos = obs["returns"][half:]
    oos_sr = (oos.mean()/oos.std(ddof=0))*math.sqrt(52) if len(oos)>=5 and oos.std(ddof=0)>0 else 0.0
    p = perm_p_np(P, score_at, rebal, 0.3, 10, 52, obs["sharpe"], n_perm, rng)
    dsr,_ = E.deflated_sharpe(obs["sharpe"], n_trials, obs["n"], 52, obs["skew"], obs["kurt"])
    return (p<0.05) and (dsr>0.90) and (oos_sr>0)

def test_fwer(M=120, n_assets=12, n_bars=320, rebal=5, n_perm=80):
    print("\n"+"="*90); print(f" TEST B — family-wise false-positive rate of the REAL verdict ({M} noise universes)")
    print("="*90)
    nt=len(FAMILIES); any_hits=0; per={k:0 for k in FAMILIES}
    for i in range(M):
        P = noise_panel(n_assets, n_bars, rng=np.random.default_rng(2000+i))
        hit=False
        for name,fn in FAMILIES.items():
            if composite_real(P, fn, rebal, n_perm, nt, np.random.default_rng(7000+i*10)):
                per[name]+=1; hit=True
        if hit: any_hits+=1
    print(f"  per-family false-positive rate (composite rule, {nt} families):")
    for k,v in per.items(): print(f"    {k:8s}: {v/M:.3f}")
    print(f"  FAMILY-WISE false-positive rate (>=1 family flagged): {any_hits/M:.3f}")
    print(f"  (With {nt} families and a 0.05 gate, naive FWER would be ~{1-0.95**nt:.2f};")
    print(f"   the DSR + OOS gates should pull the observed rate well below that.)")
    return any_hits/M

# ───────────────────────── C. power curve ─────────────────────────
def test_power(strengths=(0.2,0.4,0.6,0.8), M=40, n_assets=16, n_bars=600, rebal=5, lb=10, n_perm=80):
    print("\n"+"="*90); print(" TEST C — detection power vs planted effect size")
    print("="*90)
    for stg in strengths:
        det=0
        for i in range(M):
            P = momentum_panel(n_assets, n_bars, strength=stg, rng=np.random.default_rng(3000+i))
            if composite_real(P, lambda Pp,t: mom_score(Pp,t,lb), rebal, n_perm, 6,
                              np.random.default_rng(6000+i)): det+=1
        print(f"    strength {stg:.1f}: detection rate {det/M:.2f}")

# ───────────────────────── D. DSR vs Monte-Carlo ─────────────────────────
def test_dsr(n_trials=7, n_periods=140, ppy=52, M=40000):
    print("\n"+"="*90); print(f" TEST D — Deflated Sharpe vs Monte-Carlo ground truth (n_trials={n_trials}, n_periods={n_periods})")
    print("="*90)
    rng=np.random.default_rng(42)
    # simulate n_trials strategies, each n_periods IID N(0,1) returns (true SR=0),
    # take the max annualized Sharpe; repeat M times -> null distribution of max SR.
    sims=rng.normal(0,1,size=(M,n_trials,n_periods))
    sr = sims.mean(axis=2)/sims.std(axis=2,ddof=0)*math.sqrt(ppy)
    maxsr = sr.max(axis=1)
    mc_hurdle = np.mean(maxsr)
    _, an_hurdle = E.deflated_sharpe(1.0, n_trials, n_periods, ppy)  # observed arg irrelevant for hurdle
    print(f"  Monte-Carlo E[max Sharpe under null] = {mc_hurdle:.3f}")
    print(f"  analytic expected-max hurdle          = {an_hurdle:.3f}")
    print(f"  |diff| = {abs(mc_hurdle-an_hurdle):.3f}")
    # calibration of the DSR probability: for an observed SR = some value, DSR should
    # approximate P(max null SR < observed). Check at a few observed levels.
    print("  DSR vs empirical P(observed beats null max):")
    for obs in (an_hurdle, an_hurdle+0.5, an_hurdle+1.0):
        dsr,_ = E.deflated_sharpe(obs, n_trials, n_periods, ppy)
        emp = np.mean(maxsr < obs)
        print(f"    obs SR {obs:5.2f}:  DSR {dsr:.3f}   empirical {emp:.3f}   |diff| {abs(dsr-emp):.3f}")

if __name__ == "__main__":
    ok = fidelity_check()
    if not ok:
        print("\nABORT: replica does not match the engine; fix before trusting calibration."); raise SystemExit(1)
    test_dsr()
    test_pvalue_uniformity()
    test_fwer()
    test_power()
    print("\n"+"="*90); print(" CALIBRATION COMPLETE"); print("="*90)
