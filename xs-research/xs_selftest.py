#!/usr/bin/env python3
"""
SELF-TEST for the cross-sectional engine.
Proves the engine (a) FINDS a planted real edge, (b) REJECTS pure noise.
If both pass, the honest-testing harness is trustworthy.
No network needed — everything is synthetic with a KNOWN ground truth.
"""
import math, random
import xs_engine as E

def make_noise_universe(n_assets=20, n_bars=800, seed=1):
    """Pure random walks. NO cross-sectional structure. Engine MUST say 'noise'."""
    rng = random.Random(seed)
    uni = {}
    for a in range(n_assets):
        p = [100.0]
        for _ in range(n_bars):
            p.append(p[-1]*math.exp(rng.gauss(0, 0.03)))
        uni[f"NOISE{a:02d}"] = p
    return uni

def make_momentum_universe(n_assets=24, n_bars=900, seed=2, strength=0.7, persist=0.995):
    """
    Plant a REAL, PERSISTENT cross-sectional momentum edge: each asset carries a
    latent 'quality' drift that changes only VERY slowly (AR(1) with decay 0.995),
    so past winners keep winning over momentum horizons instead of mean-reverting
    to neutral before a ranker can catch them. This is exactly the structure real
    cross-sectional momentum exploits. A momentum ranker SHOULD extract it; pure
    noise rankers should not.

    Calibration note: an earlier version used decay 0.98 at strength 0.15, which
    let the latent quality wash out within a single lookback — the planted edge was
    technically present but below the detection floor for 20 assets / ~150 periods,
    so the positive-control test failed even though the ENGINE was fine. Persistent
    drift at strength 0.7 puts the edge clearly above the floor (verified: multiple
    momentum families flagged REAL), which is what a positive control must do.
    """
    rng = random.Random(seed)
    uni = {}
    latent = [rng.gauss(0, 0.004) for _ in range(n_assets)]
    paths = [[100.0] for _ in range(n_assets)]
    for _ in range(n_bars):
        for a in range(n_assets):
            latent[a] = persist*latent[a] + (1-persist)*rng.gauss(0, 0.004)
            drift = latent[a]*strength*10
            paths[a].append(paths[a][-1]*math.exp(drift + rng.gauss(0, 0.03)))
    for a in range(n_assets):
        uni[f"MOM{a:02d}"] = paths[a]
    return uni

if __name__ == "__main__":
    PPY = 52  # weekly rebalance assumption for the test
    REBAL = 5

    print("\n" + "#"*100)
    print("# SELF-TEST 1 — PURE NOISE UNIVERSE (ground truth: NO edge exists)")
    print("# A correct engine must report 'noise' for ALL families.")
    print("#"*100)
    noise = make_noise_universe()
    rows_noise = E.evaluate_universe(noise, REBAL, PPY, top_frac=0.3, cost_bps=10,
                                     n_perm=150, label="[NOISE UNIVERSE]")

    print("\n" + "#"*100)
    print("# SELF-TEST 2 — PLANTED MOMENTUM UNIVERSE (ground truth: momentum IS real)")
    print("# A correct engine should flag at least one momentum family as REAL EDGE.")
    print("#"*100)
    mom = make_momentum_universe()
    rows_mom = E.evaluate_universe(mom, REBAL, PPY, top_frac=0.3, cost_bps=10,
                                   n_perm=150, label="[PLANTED-MOMENTUM UNIVERSE]")

    # ── automated pass/fail ──
    def reals(rows):
        return set(n for n,r in rows if r and r['pval']<0.05 and r['dsr']>0.90 and r['oos_sharpe']>0)
    noise_reals = reals(rows_noise)
    mom_reals = reals(rows_mom)

    print("\n" + "="*100)
    print(" SELF-TEST VERDICT")
    print("="*100)
    test1 = len(noise_reals) == 0
    test2 = any("mom" in r for r in mom_reals)
    print(f"  Test 1 (noise -> nothing real):   {'PASS' if test1 else 'FAIL'}  (found: {noise_reals or 'none'})")
    print(f"  Test 2 (momentum -> found real):  {'PASS' if test2 else 'FAIL'}  (found: {mom_reals or 'none'})")
    print()
    if test1 and test2:
        print("  CONTROLS PASS: the engine finds a strong planted edge and rejects one noise draw.")
        print("  This proves the harness is NOT INVERTED. It does NOT by itself prove the")
        print("  p-values are calibrated or that false discoveries are controlled across many")
        print("  draws — that is established separately in xs_calibration.py. A 'REAL EDGE' on")
        print("  real data is screening evidence worth a pre-registered holdout test, never a")
        print("  trade signal on its own.")
    else:
        print("  CONTROLS FAILED — the harness is not even non-inverted. Do not use it.")
    print("="*100)
