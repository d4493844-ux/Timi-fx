import numpy as np
import pandas as pd
import json, os, asyncio, websockets

N_STATES = 4
STATE_NAMES = ["Uptrend", "Downtrend", "Ranging", "HighVolatility"]
SYMBOLS = [
    "BOOM500","CRASH500","BOOM1000","CRASH1000",
    "frxUSDJPY","cryBTCUSD","R_25","R_50",
    "R_75","R_100","frxEURUSD","frxGBPUSD",
    "frxXAUUSD","cryETHUSD","frxEURGBP","frxXAGUSD"
]

def extract_observations(candles):
    closes = np.array([float(c['close']) for c in candles])
    highs  = np.array([float(c['high'])  for c in candles])
    lows   = np.array([float(c['low'])   for c in candles])
    returns = np.diff(closes) / (closes[:-1] + 1e-10)
    n = len(returns)
    roll_vol = pd.Series(np.abs(returns)).rolling(20).mean().fillna(np.abs(returns).mean()).values
    # Direction consistency over 5 candles
    def cons(i, w=5):
        r = returns[max(0,i-w):i]
        if len(r) == 0: return 0.5
        up = np.sum(r > 0) / len(r)
        return max(up, 1-up)
    consistency = np.array([cons(i) for i in range(n)])
    vol_med = np.median(roll_vol)
    vol_hi  = np.percentile(roll_vol, 75)
    obs = np.zeros(n, dtype=int)
    for i in range(n):
        r, v, c = returns[i], roll_vol[i], consistency[i]
        if v < vol_med:
            obs[i] = 1 if (c>=0.70 and r>0) else 2 if (c>=0.70 and r<0) else 0
        elif v < vol_hi:
            obs[i] = 4 if (r>0 and c>=0.60) else 5 if (r<0 and c>=0.60) else 3
        else:
            obs[i] = 6 if r>0 else 7
    return obs

def forward_vectorized(obs, A, log_B, log_pi):
    """Fully vectorized forward algorithm — fast"""
    T = len(obs)
    N = len(log_pi)
    log_alpha = np.zeros((T, N))
    log_alpha[0] = log_pi + log_B[:, obs[0]]
    for t in range(1, T):
        # Vectorized: for each state j, sum over all i
        log_alpha[t] = np.logaddexp.reduce(
            log_alpha[t-1][:, None] + np.log(A + 1e-300), axis=0
        ) + log_B[:, obs[t]]
    return log_alpha

def backward_vectorized(obs, A, log_B):
    """Fully vectorized backward algorithm — fast"""
    T = len(obs)
    N = A.shape[0]
    log_beta = np.zeros((T, N))
    for t in range(T-2, -1, -1):
        log_beta[t] = np.logaddexp.reduce(
            np.log(A + 1e-300) + log_B[:, obs[t+1]] + log_beta[t+1], axis=1
        )
    return log_beta

def baum_welch_fast(obs_sequences, N=4, K=8, n_iter=30):
    """Vectorized Baum-Welch — runs in seconds not hours"""
    print(f"  Baum-Welch EM ({n_iter} iterations, vectorized)...")

    # Initialize A with diagonal preference
    A = np.ones((N, N)) * 0.1
    np.fill_diagonal(A, 0.7 - 0.1*(N-1))
    A /= A.sum(axis=1, keepdims=True)

    # Initialize B with domain knowledge
    B = np.array([
        [0.05, 0.35, 0.05, 0.15, 0.25, 0.05, 0.05, 0.05],  # Uptrend
        [0.05, 0.05, 0.35, 0.15, 0.05, 0.25, 0.05, 0.05],  # Downtrend
        [0.25, 0.10, 0.10, 0.30, 0.10, 0.10, 0.03, 0.02],  # Ranging
        [0.05, 0.05, 0.05, 0.10, 0.10, 0.10, 0.30, 0.25],  # HighVol
    ], dtype=float)
    B /= B.sum(axis=1, keepdims=True)
    pi = np.array([0.35, 0.35, 0.20, 0.10])

    prev_ll = -np.inf

    for itr in range(n_iter):
        A_num  = np.zeros((N, N))
        B_num  = np.zeros((N, K))
        pi_num = np.zeros(N)
        total_ll = 0

        log_B = np.log(B + 1e-300)
        log_pi = np.log(pi + 1e-300)

        for obs in obs_sequences:
            T = len(obs)
            if T < 10: continue

            la = forward_vectorized(obs, A, log_B, log_pi)
            lb = backward_vectorized(obs, A, log_B)

            ll = np.logaddexp.reduce(la[-1])
            total_ll += ll

            # gamma: T×N
            log_gamma = la + lb
            log_gamma -= np.logaddexp.reduce(log_gamma, axis=1, keepdims=True)
            gamma = np.exp(log_gamma)

            pi_num += gamma[0]

            # xi: T-1 × N × N (vectorized)
            for t in range(T-1):
                xi_t = (la[t][:, None] + np.log(A+1e-300)
                        + log_B[:, obs[t+1]] + lb[t+1])
                xi_t = np.exp(xi_t - ll)
                A_num += xi_t

            for k in range(K):
                B_num[:, k] += gamma[obs == k].sum(axis=0)

        # M-step normalize
        pi = pi_num / (pi_num.sum() + 1e-300)
        A  = A_num  / (A_num.sum(axis=1,  keepdims=True) + 1e-300)
        B  = B_num  / (B_num.sum(axis=1,  keepdims=True) + 1e-300)

        delta = total_ll - prev_ll
        if itr % 5 == 0:
            print(f"    Iter {itr:3d}: loglik={total_ll:.1f} Δ={delta:.3f}")
        if itr > 3 and abs(delta) < 0.5:
            print(f"    ✅ Converged at iter {itr}")
            break
        prev_ll = total_ll

    return A, B, pi

def viterbi(obs, A, B, pi):
    T = len(obs)
    N = len(pi)
    log_delta = np.zeros((T, N))
    psi = np.zeros((T, N), dtype=int)
    log_delta[0] = np.log(pi+1e-300) + np.log(B[:,obs[0]]+1e-300)
    for t in range(1, T):
        trans = log_delta[t-1][:,None] + np.log(A+1e-300)
        psi[t] = np.argmax(trans, axis=0)
        log_delta[t] = np.max(trans, axis=0) + np.log(B[:,obs[t]]+1e-300)
    states = np.zeros(T, dtype=int)
    states[-1] = np.argmax(log_delta[-1])
    for t in range(T-2, -1, -1):
        states[t] = psi[t+1, states[t+1]]
    return states

def main():
    print("🧠 TRUE HMM TRAINER — Vectorized Baum-Welch")
    print("="*55)

    all_obs, symbol_obs = [], {}
    for sym in SYMBOLS:
        csv = f"/workspaces/Timi-fx/ml/data/{sym}.csv"
        if not os.path.exists(csv): continue
        df = pd.read_csv(csv)
        candles = df[['close','high','low']].rename(
            columns={'close':'close','high':'high','low':'low'}).to_dict('records')
        obs = extract_observations(candles)
        all_obs.append(obs)
        symbol_obs[sym] = obs
        print(f"  ✅ {sym}: {len(obs)} observations")

    print(f"\n🔄 Training on {len(all_obs)} sequences ({sum(len(o) for o in all_obs)} obs)...")
    A, B, pi = baum_welch_fast(all_obs, N=N_STATES, K=8, n_iter=30)

    print("\n📊 TRANSITION MATRIX A:")
    print("          " + " ".join(f"{s[:6]:>8}" for s in STATE_NAMES))
    for i, row in enumerate(A):
        print(f"  {STATE_NAMES[i][:6]:6}: {' '.join(f'{v:8.4f}' for v in row)}")

    print("\n📊 EMISSION MATRIX B:")
    obs_names = ["lo-neu","lo-bul","lo-bear","md-chp","md-bul","md-bear","hi-up","hi-dn"]
    print("          " + " ".join(f"{s:>7}" for s in obs_names))
    for i, row in enumerate(B):
        print(f"  {STATE_NAMES[i][:6]:6}: {' '.join(f'{v:7.4f}' for v in row)}")

    print(f"\nπ: {dict(zip(STATE_NAMES, pi.round(4)))}")

    # Validate
    print("\n📈 STATE DISTRIBUTION PER SYMBOL:")
    for sym, obs in symbol_obs.items():
        states = viterbi(obs, A, B, pi)
        counts = np.bincount(states, minlength=N_STATES)
        pcts   = counts/counts.sum()*100
        dom    = STATE_NAMES[np.argmax(counts)]
        print(f"  {sym:12}: dominant={dom:12} | " +
              " | ".join(f"{STATE_NAMES[i][:4]}:{pcts[i]:.0f}%" for i in range(N_STATES)))

    # Save
    hmm = {
        "A": A.tolist(), "B": B.tolist(), "pi": pi.tolist(),
        "n_states": N_STATES, "n_obs": 8,
        "state_names": STATE_NAMES,
        "obs_names": obs_names,
        "trained_at": pd.Timestamp.now().isoformat(),
        "n_sequences": len(all_obs),
        "total_obs": int(sum(len(o) for o in all_obs))
    }
    os.makedirs("/workspaces/Timi-fx/ml/models", exist_ok=True)
    with open("/workspaces/Timi-fx/ml/models/hmm_model.json","w") as f:
        json.dump(hmm, f, indent=2)
    print("\n✅ HMM saved to ml/models/hmm_model.json")

    # Upload to Supabase
    import urllib.request
    svc = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMyNzQ1MiwiZXhwIjoyMDg3OTAzNDUyfQ.Ktm6Hj88LIJubB-WSPEZEhDNQwpZ5Gyw7nH2IWJI0fo"
    hdrs = {"apikey":svc,"Authorization":f"Bearer {svc}",
            "Content-Type":"application/json","Prefer":"resolution=merge-duplicates"}
    payload = json.dumps([{
        "model_id":"shared_hmm_v1",
        "model_json":json.dumps(hmm),
        "n_states":N_STATES,
        "trained_at":pd.Timestamp.now().isoformat(),
        "symbols_trained":len(all_obs)
    }]).encode()
    try:
        req = urllib.request.Request(
            "https://pedbupgjxlcumidwoktc.supabase.co/rest/v1/hmm_models?on_conflict=model_id",
            data=payload, headers=hdrs, method="POST")
        urllib.request.urlopen(req)
        print("✅ HMM uploaded to Supabase hmm_models table")
    except Exception as e:
        print(f"⚠️  Upload failed — create table first: {e}")

    print("\n📋 SQL TO RUN IN SUPABASE:")
    print("""create table if not exists hmm_models (
  id bigserial primary key,
  model_id text not null unique,
  model_json text not null,
  n_states int,
  trained_at timestamptz default now(),
  symbols_trained int
);""")

main()
