import pandas as pd
import numpy as np
import lightgbm as lgb
import json, os
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

SYMBOL_PARAMS = {
    "BOOM500":   {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "CRASH500":  {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "BOOM1000":  {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "CRASH1000": {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "frxUSDJPY": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
    "cryBTCUSD": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
    "R_25":      {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "R_50":      {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "R_75":      {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "R_100":     {"n_estimators": 100, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 30},
    "frxEURUSD": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
    "frxGBPUSD": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
    "frxXAUUSD": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
    "cryETHUSD": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
    "frxEURGBP": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
    "frxXAGUSD": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 5, "num_leaves": 20, "min_child_samples": 50},
}

META_PARAMS = {"n_estimators": 40, "learning_rate": 0.1, "max_depth": 3, "num_leaves": 7, "verbose": -1}

# 27 features — original 21 + 6 Kalman
FEATURES = [
    # Original 21
    'rsi', 'macd_hist', 'bb_pos', 'bb_width',
    'ema_bull', 'ema_bear',
    'price_ema8_dist', 'price_ema21_dist', 'price_ema50_dist',
    'atr_pct', 'candle_body', 'candle_dir', 'high_low_range',
    'momentum_1', 'momentum_3', 'momentum_5', 'momentum_10',
    'rsi_oversold', 'rsi_overbought', 'rsi_neutral', 'trend5m',
    # 6 Kalman features
    'kalman_price_vs_raw', 'kalman_velocity', 'kalman_trend_dir',
    'kalman_noise_ratio', 'kalman_ema_agreement', 'kalman_acceleration'
]

def train(symbol):
    path = f"/workspaces/Timi-fx/ml/data/{symbol}.csv"
    if not os.path.exists(path):
        print(f"  ⚠️  No data for {symbol} — skipping")
        return None, 0

    print(f"\n🤖 Training {symbol}...")
    df   = pd.read_csv(path).dropna(subset=FEATURES + ['label'])
    feats = [f for f in FEATURES if f in df.columns]

    missing = [f for f in FEATURES if f not in df.columns]
    if missing:
        print(f"  ⚠️  Missing features: {missing}")

    X = df[feats].values
    y = df['label'].values.astype(int)

    split      = int(len(X) * 0.70)
    meta_split = int(len(X) * 0.85)

    X_train, y_train = X[:split],      y[:split]
    X_meta,  y_meta  = X[split:meta_split], y[split:meta_split]
    X_test,  y_test  = X[meta_split:], y[meta_split:]

    print(f"  Train: {len(X_train)} | Meta: {len(X_meta)} | Test: {len(X_test)}")

    params = SYMBOL_PARAMS.get(symbol, SYMBOL_PARAMS["frxUSDJPY"])
    model  = lgb.LGBMClassifier(
        **params, random_state=42,
        class_weight='balanced',
        subsample=0.8, colsample_bytree=0.8, verbose=-1
    )
    model.fit(X_train, y_train)

    # Meta-labeling
    meta_probs = model.predict_proba(X_meta)[:, 1]
    meta_preds = (meta_probs > 0.5).astype(int)
    X_meta_aug = np.column_stack([X_meta, meta_probs])
    y_meta_ok  = (meta_preds == y_meta).astype(int)

    meta_model = lgb.LGBMClassifier(**META_PARAMS, random_state=42, subsample=0.8)
    meta_model.fit(X_meta_aug, y_meta_ok)

    # Evaluate on test set
    test_probs = model.predict_proba(X_test)[:, 1]
    test_preds = (test_probs > 0.5).astype(int)
    X_test_aug = np.column_stack([X_test, test_probs])
    meta_conf  = meta_model.predict_proba(X_test_aug)[:, 1]

    mask     = meta_conf >= 0.60
    n_trades = mask.sum()
    win_rate = accuracy_score(y_test[mask], test_preds[mask]) if n_trades >= 10 else 0
    pnl      = sum(0.95 if p == l else -1.0 for p, l in zip(test_preds[mask], y_test[mask]))

    print(f"  Features used: {len(feats)}/27")
    print(f"  Trades: {n_trades} | WR: {win_rate*100:.1f}% | PnL: ${pnl:.2f}")

    # Save models
    os.makedirs("/workspaces/Timi-fx/ml/models", exist_ok=True)
    model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_model.txt")
    meta_model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_meta.txt")

    d  = model.booster_.dump_model()
    dm = meta_model.booster_.dump_model()
    print(f"  Trees: main={len(d['tree_info'])}, meta={len(dm['tree_info'])}")

    return win_rate, n_trades

# Train all symbols that have data
results = {}
for sym in SYMBOL_PARAMS:
    wr, n = train(sym)
    if wr is not None:
        results[sym] = {"win_rate": wr, "trades": n}

print("\n" + "="*50)
print("📊 TRAINING SUMMARY")
print("="*50)
for sym, r in sorted(results.items(), key=lambda x: -x[1]['win_rate']):
    status = "✅" if r['win_rate'] >= 0.60 else "⚠️ " if r['win_rate'] >= 0.50 else "❌"
    print(f"  {status} {sym}: {r['win_rate']*100:.1f}% WR ({r['trades']} trades)")

good = [s for s, r in results.items() if r['win_rate'] >= 0.60]
print(f"\n✅ Models ready for upload: {good}")
print(f"📦 Run upload_models.py to push to Supabase")
