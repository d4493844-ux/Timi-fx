"""
TIMI REINFORCEMENT LEARNING AGENT — Complete System
====================================================
Algorithm: Proximal Policy Optimization (PPO) simplified
           + Online Q-Learning for live adaptation

State:     56 features + regime + confidence + recent_wr
Action:    0=SKIP, 1=BUY, 2=SELL, 3=BUY_LARGE, 4=SELL_LARGE
Reward:    pnl / stake (normalized) + shaped rewards

Live Learning: Updates policy after EVERY trade result
Historical:    Bootstrap from 973 existing trades

Integration:
  - Reads features from bot state
  - Overrides/confirms ML signal
  - Learns from AI Brain patterns
  - Stores policy in Supabase rl_policy table
"""

import numpy as np
import json
import os
import urllib.request
from datetime import datetime

# ── Supabase config ──
SVC = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMyNzQ1MiwiZXhwIjoyMDg3OTAzNDUyfQ.Ktm6Hj88LIJubB-WSPEZEhDNQwpZ5Gyw7nH2IWJI0fo"
BASE = "https://pedbupgjxlcumidwoktc.supabase.co/rest/v1"
HDRS = {"apikey": SVC, "Authorization": f"Bearer {SVC}", "Content-Type": "application/json"}

# ── RL Hyperparameters ──
STATE_DIM    = 20   # compressed state (regime+conf+recent stats)
ACTION_DIM   = 5    # SKIP/BUY/SELL/BUY_LARGE/SELL_LARGE
LEARNING_RATE = 0.001
GAMMA        = 0.95  # discount factor
EPSILON      = 0.15  # exploration rate (decays over time)
EPSILON_MIN  = 0.02
EPSILON_DECAY = 0.995

# ─────────────────────────────────────────────
# NEURAL NETWORK (pure numpy — no dependencies)
# Simple 3-layer policy network
# Input: state vector
# Output: action probabilities + value estimate
# ─────────────────────────────────────────────
class PolicyNetwork:
    def __init__(self, state_dim=STATE_DIM, hidden=64, action_dim=ACTION_DIM):
        # Xavier initialization
        self.W1 = np.random.randn(state_dim, hidden) * np.sqrt(2/state_dim)
        self.b1 = np.zeros(hidden)
        self.W2 = np.random.randn(hidden, hidden) * np.sqrt(2/hidden)
        self.b2 = np.zeros(hidden)
        # Policy head (action probabilities)
        self.Wp = np.random.randn(hidden, action_dim) * np.sqrt(2/hidden)
        self.bp = np.zeros(action_dim)
        # Value head (state value estimate)
        self.Wv = np.random.randn(hidden, 1) * np.sqrt(2/hidden)
        self.bv = np.zeros(1)
        self.lr = LEARNING_RATE

    def relu(self, x): return np.maximum(0, x)
    def softmax(self, x):
        e = np.exp(x - np.max(x))
        return e / (e.sum() + 1e-10)

    def forward(self, state):
        h1 = self.relu(state @ self.W1 + self.b1)
        h2 = self.relu(h1 @ self.W2 + self.b2)
        probs = self.softmax(h2 @ self.Wp + self.bp)
        value = float((h2 @ self.Wv + self.bv).flatten()[0])
        return probs, value, h2

    def select_action(self, state, epsilon=EPSILON):
        probs, value, _ = self.forward(state)
        # Epsilon-greedy exploration
        if np.random.random() < epsilon:
            action = np.random.randint(ACTION_DIM)
        else:
            action = np.argmax(probs)
        return action, probs[action], value

    def update(self, state, action, reward, next_state, done):
        """Online TD update after each trade"""
        probs, value, h2 = self.forward(state)
        _, next_value, _ = self.forward(next_state)

        # TD target
        target = reward + (0 if done else GAMMA * next_value)
        advantage = target - value

        # Policy gradient update
        grad_p = np.zeros(ACTION_DIM)
        grad_p[action] = advantage * (1 - probs[action])
        dWp = np.outer(h2, grad_p) * self.lr
        self.Wp += dWp
        self.bp += grad_p * self.lr * 0.1

        # Value update
        dv = advantage * self.lr
        self.Wv += (h2.reshape(-1,1) * dv)
        self.bv += dv * 0.1

        return float(advantage)

    def to_dict(self):
        return {
            "W1": self.W1.tolist(), "b1": self.b1.tolist(),
            "W2": self.W2.tolist(), "b2": self.b2.tolist(),
            "Wp": self.Wp.tolist(), "bp": self.bp.tolist(),
            "Wv": self.Wv.tolist(), "bv": self.bv.tolist(),
        }

    def from_dict(self, d):
        self.W1 = np.array(d["W1"]); self.b1 = np.array(d["b1"])
        self.W2 = np.array(d["W2"]); self.b2 = np.array(d["b2"])
        self.Wp = np.array(d["Wp"]); self.bp = np.array(d["bp"])
        self.Wv = np.array(d["Wv"]); self.bv = np.array(d["bv"])
        return self

# ─────────────────────────────────────────────
# STATE BUILDER
# Converts trade data into RL state vector
# ─────────────────────────────────────────────
REGIME_MAP = {"Uptrend":0, "Downtrend":1, "Ranging":2, "HighVolatility":3}
SYMBOL_MAP = {
    "BOOM500":0,"BOOM1000":1,"CRASH500":2,"CRASH1000":3,
    "R_25":4,"R_50":5,"R_75":6,"R_100":7,
    "frxUSDJPY":8,"frxEURUSD":9,"frxGBPUSD":10,
    "cryBTCUSD":11,"cryETHUSD":12,"frxXAUUSD":13,
    "frxGBPJPY":14,"frxEURGBP":15,
}

def build_state(trade: dict, recent_trades: list) -> np.ndarray:
    """Build 20-dim state vector from trade context"""
    state = np.zeros(STATE_DIM)

    # 1. Symbol one-hot compressed (0-3)
    sym_id = SYMBOL_MAP.get(trade.get('symbol',''), 0)
    state[0] = sym_id / len(SYMBOL_MAP)

    # 2. Regime (4)
    patterns = trade.get('patterns','') or ''
    regime = 'Ranging'
    for p in patterns.split('|'):
        if p.startswith('regime:'):
            regime = p.replace('regime:','')
    state[1] = REGIME_MAP.get(regime, 2) / 4

    # 3. trend5m (5)
    trend5m = 0
    for p in patterns.split('|'):
        if p.startswith('trend5m:'):
            trend5m = float(p.replace('trend5m:','') or 0)
    state[2] = (trend5m + 1) / 2  # normalize -1,0,1 → 0,0.5,1

    # 4. Confidence (6)
    state[3] = float(trade.get('confidence') or 65) / 100

    # 5. Stake relative to balance (7)
    stake = float(trade.get('stake') or 1)
    state[4] = min(stake / 100, 1.0)

    # 6. Recent win rate (last 10, 20, 50 trades) (8-10)
    if recent_trades:
        for i, window in enumerate([10, 20, 50]):
            window_trades = [t for t in recent_trades[-window:]
                           if t.get('result') in ['win','WIN','loss','LOSS']]
            if window_trades:
                wr = sum(1 for t in window_trades if t.get('result') in ['win','WIN']) / len(window_trades)
                state[5+i] = wr

    # 7. Recent avg pnl normalized (11)
    recent_pnl = [float(t.get('pnl') or 0) for t in recent_trades[-10:]
                  if t.get('result') in ['win','WIN','loss','LOSS']]
    state[8] = np.tanh(np.mean(recent_pnl) if recent_pnl else 0)

    # 8. Consecutive losses (12)
    consec = 0
    for t in reversed(recent_trades):
        if t.get('result') in ['loss','LOSS']: consec += 1
        elif t.get('result') in ['win','WIN']: break
    state[9] = min(consec / 5, 1.0)

    # 9. Symbol-specific win rate (13)
    sym_trades = [t for t in recent_trades
                 if t.get('symbol') == trade.get('symbol')
                 and t.get('result') in ['win','WIN','loss','LOSS']][-20:]
    if sym_trades:
        sym_wr = sum(1 for t in sym_trades if t.get('result') in ['win','WIN']) / len(sym_trades)
        state[10] = sym_wr

    # 10. Time of day features (14-16)
    created_at = trade.get('created_at','') or ''
    try:
        hour = int(created_at[11:13]) if len(created_at) > 13 else 12
        state[11] = np.sin(2 * np.pi * hour / 24)
        state[12] = np.cos(2 * np.pi * hour / 24)
        # Is London session?
        state[13] = 1.0 if 7 <= hour < 16 else 0.0
        # Is NY session?
        state[14] = 1.0 if 12 <= hour < 21 else 0.0
    except: pass

    # 11. Is spike symbol (15)
    sym = trade.get('symbol','')
    state[15] = 1.0 if (sym.startswith('BOOM') or sym.startswith('CRASH')) else 0.0

    # 12. Is VIX (16)
    state[16] = 1.0 if sym.startswith('R_') else 0.0

    # 13. Is forex (17)
    state[17] = 1.0 if sym.startswith('frx') else 0.0

    # 14. Regime volatility (18)
    state[18] = 1.0 if regime == 'HighVolatility' else 0.0

    # 15. Trending regime (19)
    state[19] = 1.0 if regime in ['Uptrend','Downtrend'] else 0.0

    return state.astype(np.float32)

def compute_reward(trade: dict) -> float:
    """
    Shaped reward function:
    - Win: +pnl/stake (normalized profit)
    - Loss: -pnl/stake (normalized loss)
    - Large win: bonus
    - Error: penalty
    - Consecutive wins: bonus streak
    """
    result = trade.get('result','')
    pnl    = float(trade.get('pnl') or 0)
    stake  = float(trade.get('stake') or 1)

    if result in ['win','WIN']:
        base_reward = pnl / stake  # e.g. +0.85 for 85% return
        # Bonus for large wins
        if pnl / stake > 1.0: base_reward *= 1.3
        return min(base_reward, 3.0)  # cap at 3x
    elif result in ['loss','LOSS']:
        base_reward = pnl / stake  # negative
        # Extra penalty for large losses
        if abs(pnl / stake) > 0.8: base_reward *= 1.5
        return max(base_reward, -3.0)  # floor at -3x
    elif result == 'error':
        return -0.5  # moderate penalty for errors
    else:
        return 0.0  # skip/expired = neutral

# ─────────────────────────────────────────────
# SUPABASE OPERATIONS
# ─────────────────────────────────────────────
def load_trades():
    req = urllib.request.Request(
        f"{BASE}/trades?select=id,symbol,result,pnl,stake,confidence,patterns,created_at&account_name=eq.edge_function&result=in.(win,loss,WIN,LOSS)&order=created_at.asc&limit=2000",
        headers={"apikey":SVC,"Authorization":f"Bearer {SVC}"}
    )
    return json.loads(urllib.request.urlopen(req).read())

def save_policy(policy: PolicyNetwork, metadata: dict):
    payload = json.dumps({
        "policy_name":  "timi_rl_v1",
        "policy_json":  json.dumps(policy.to_dict()),
        "epsilon":      metadata.get('epsilon', EPSILON),
        "total_trades": metadata.get('total_trades', 0),
        "avg_reward":   metadata.get('avg_reward', 0),
        "win_rate":     metadata.get('win_rate', 0),
        "trained_at":   datetime.utcnow().isoformat(),
    }).encode()

    # Try update first
    req = urllib.request.Request(
        f"{BASE}/rl_policy?policy_name=eq.timi_rl_v1",
        data=payload,
        headers={**HDRS, "Prefer": "resolution=merge-duplicates,return=minimal"},
        method="POST"
    )
    try:
        urllib.request.urlopen(req)
    except:
        # Insert
        req2 = urllib.request.Request(
            f"{BASE}/rl_policy",
            data=payload,
            headers={**HDRS, "Prefer": "return=minimal"},
            method="POST"
        )
        urllib.request.urlopen(req2)

def load_policy(policy: PolicyNetwork) -> dict:
    try:
        req = urllib.request.Request(
            f"{BASE}/rl_policy?policy_name=eq.timi_rl_v1&select=policy_json,epsilon,total_trades",
            headers={"apikey":SVC,"Authorization":f"Bearer {SVC}"}
        )
        data = json.loads(urllib.request.urlopen(req).read())
        if data:
            policy.from_dict(json.loads(data[0]['policy_json']))
            return {
                'epsilon': data[0].get('epsilon', EPSILON),
                'total_trades': data[0].get('total_trades', 0)
            }
    except Exception as e:
        print(f"No existing policy: {e}")
    return {'epsilon': EPSILON, 'total_trades': 0}

# ─────────────────────────────────────────────
# TRAINING — Historical Bootstrap
# ─────────────────────────────────────────────
def train_historical(policy: PolicyNetwork, trades: list, epsilon: float) -> dict:
    print(f"\n🧠 Training on {len(trades)} historical trades...")

    rewards = []
    wins = 0
    losses_count = 0

    for i, trade in enumerate(trades):
        # Build state from this trade's context
        recent = trades[max(0,i-50):i]
        state      = build_state(trade, recent)
        next_trade = trades[i+1] if i+1 < len(trades) else trade
        next_state = build_state(next_trade, trades[max(0,i-49):i+1])

        reward = compute_reward(trade)
        rewards.append(reward)

        if trade.get('result') in ['win','WIN']: wins += 1
        else: losses_count += 1

        # Map actual trade to action
        result = trade.get('result','')
        pnl    = float(trade.get('pnl') or 0)
        stake  = float(trade.get('stake') or 1)

        if result in ['win','WIN'] and pnl/stake > 1.0:
            action = 3  # BUY_LARGE was right
        elif result in ['win','WIN']:
            action = 1  # BUY was right
        elif result in ['loss','LOSS']:
            action = 0  # SKIP would have been better
        else:
            action = 0

        # Update policy
        done = (i == len(trades) - 1)
        advantage = policy.update(state, action, reward, next_state, done)

        # Decay epsilon
        epsilon = max(EPSILON_MIN, epsilon * EPSILON_DECAY)

        if (i+1) % 100 == 0:
            avg_r = np.mean(rewards[-100:])
            wr = wins/(wins+losses_count) if (wins+losses_count) > 0 else 0
            print(f"  Step {i+1}/{len(trades)} | Avg reward: {avg_r:.3f} | WR: {wr*100:.1f}% | ε={epsilon:.3f}")

    final_wr = wins/(wins+losses_count) if (wins+losses_count) > 0 else 0
    return {
        'epsilon': epsilon,
        'total_trades': len(trades),
        'avg_reward': float(np.mean(rewards)),
        'win_rate': final_wr
    }

# ─────────────────────────────────────────────
# INFERENCE — What action should bot take?
# ─────────────────────────────────────────────
def get_rl_action(policy: PolicyNetwork, state: np.ndarray, epsilon: float) -> dict:
    action, prob, value = policy.select_action(state, epsilon)
    probs, _, _ = policy.forward(state)

    action_map = {
        0: {"action": "SKIP",      "stake_mult": 0.0},
        1: {"action": "BUY",       "stake_mult": 1.0},
        2: {"action": "SELL",      "stake_mult": 1.0},
        3: {"action": "BUY_LARGE", "stake_mult": 1.5},
        4: {"action": "SELL_LARGE","stake_mult": 1.5},
    }

    result = action_map[action]
    result['confidence'] = float(prob)
    result['value']      = float(value)
    result['all_probs']  = probs.tolist()
    return result

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("🤖 TIMI RL AGENT — Training")
    print("="*50)

    policy = PolicyNetwork()

    # Try loading existing policy
    meta = load_policy(policy)
    epsilon = meta.get('epsilon', EPSILON)
    total_trades = meta.get('total_trades', 0)

    if total_trades > 0:
        print(f"✅ Loaded existing policy ({total_trades} trades seen)")
    else:
        print("🆕 Starting fresh policy")

    # Load historical trades
    print("📊 Loading historical trades from Supabase...")
    trades = load_trades()
    print(f"✅ Loaded {len(trades)} trades")

    if len(trades) < 10:
        print("❌ Not enough trades for training (need 10+)")
        exit(1)

    # Train on historical data
    meta = train_historical(policy, trades, epsilon)
    meta['total_trades'] = len(trades)

    print(f"\n📊 Training complete:")
    print(f"  Avg reward: {meta['avg_reward']:.3f}")
    print(f"  Win rate:   {meta['win_rate']*100:.1f}%")
    print(f"  Epsilon:    {meta['epsilon']:.3f}")

    # Save policy
    save_policy(policy, meta)
    print(f"\n✅ Policy saved to Supabase rl_policy table")

    # Test inference
    print("\n🧪 Testing inference...")
    test_trade = {
        'symbol': 'BOOM1000',
        'confidence': 85,
        'stake': 9,
        'patterns': 'regime:Uptrend|trend5m:1',
        'created_at': '2026-03-22T14:00:00',
        'result': 'open'
    }
    state = build_state(test_trade, trades[-20:])
    action = get_rl_action(policy, state, epsilon=0.0)  # no exploration for test
    print(f"  BOOM1000 Uptrend 85% conf → RL says: {action['action']} (conf:{action['confidence']:.2f} value:{action['value']:.2f})")
    print(f"  All probs: SKIP={action['all_probs'][0]:.2f} BUY={action['all_probs'][1]:.2f} SELL={action['all_probs'][2]:.2f}")

    # Save inference module separately for edge function use
    os.makedirs("/workspaces/Timi-fx/ml/models/rl", exist_ok=True)
    with open("/workspaces/Timi-fx/ml/models/rl/policy.json", 'w') as f:
        json.dump({**policy.to_dict(), **meta}, f)
    print("\n✅ Policy also saved locally: ml/models/rl/policy.json")
