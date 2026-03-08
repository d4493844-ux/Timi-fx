import pandas as pd
import numpy as np
import lightgbm as lgb
import json, os
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

# Compact models - fewer trees, same accuracy
SYMBOL_PARAMS = {
    "BOOM1000":  {"n_estimators": 80,  "learning_rate": 0.1, "max_depth": 4, "num_leaves": 15, "min_child_samples": 30},
    "CRASH1000": {"n_estimators": 80,  "learning_rate": 0.1, "max_depth": 4, "num_leaves": 15, "min_child_samples": 30},
    "frxUSDJPY": {"n_estimators": 100, "learning_rate": 0.1, "max_depth": 4, "num_leaves": 15, "min_child_samples": 50},
}
META_PARAMS = {"n_estimators": 40, "learning_rate": 0.1, "max_depth": 3, "num_leaves": 7, "verbose": -1}

FEATURES = [
    'rsi', 'macd_hist', 'bb_pos', 'bb_width',
    'ema_bull', 'ema_bear',
    'price_ema8_dist', 'price_ema21_dist', 'price_ema50_dist',
    'atr_pct', 'candle_body', 'candle_dir', 'high_low_range',
    'momentum_1', 'momentum_3', 'momentum_5', 'momentum_10',
    'rsi_oversold', 'rsi_overbought', 'rsi_neutral', 'trend5m'
]

def train(symbol):
    print(f"\n🤖 {symbol}")
    df = pd.read_csv(f"/workspaces/Timi-fx/ml/data/{symbol}.csv").dropna(subset=FEATURES+['label'])
    feats = [f for f in FEATURES if f in df.columns]
    X = df[feats].values
    y = df['label'].values.astype(int)

    split      = int(len(X) * 0.70)
    meta_split = int(len(X) * 0.85)

    X_train, y_train         = X[:split], y[:split]
    X_meta,  y_meta          = X[split:meta_split], y[split:meta_split]
    X_test,  y_test          = X[meta_split:], y[meta_split:]

    params = SYMBOL_PARAMS[symbol]
    model = lgb.LGBMClassifier(**params, random_state=42, class_weight='balanced',
                                subsample=0.8, colsample_bytree=0.8, verbose=-1)
    model.fit(X_train, y_train)

    meta_probs = model.predict_proba(X_meta)[:,1]
    meta_preds = (meta_probs > 0.5).astype(int)
    X_meta_aug = np.column_stack([X_meta, meta_probs])
    y_meta_ok  = (meta_preds == y_meta).astype(int)

    meta_model = lgb.LGBMClassifier(**META_PARAMS, random_state=42, subsample=0.8)
    meta_model.fit(X_meta_aug, y_meta_ok)

    # Test on unseen data
    test_probs = model.predict_proba(X_test)[:,1]
    test_preds = (test_probs > 0.5).astype(int)
    X_test_aug = np.column_stack([X_test, test_probs])
    meta_conf  = meta_model.predict_proba(X_test_aug)[:,1]

    mask     = meta_conf >= 0.60
    n_trades = mask.sum()
    win_rate = accuracy_score(y_test[mask], test_preds[mask]) if n_trades >= 10 else 0
    pnl      = sum(0.95 if p==l else -1.0 for p,l in zip(test_preds[mask], y_test[mask]))

    print(f"  Trades: {n_trades} | WR: {win_rate*100:.1f}% | PnL: ${pnl:.2f}")

    model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_model.txt")
    meta_model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_meta.txt")

    d  = model.booster_.dump_model()
    dm = meta_model.booster_.dump_model()
    print(f"  Trees: main={len(d['tree_info'])}, meta={len(dm['tree_info'])}")
    return win_rate, n_trades

for sym in SYMBOL_PARAMS:
    train(sym)

# Check final export size estimate
total_trees = 0
for sym in SYMBOL_PARAMS:
    m    = lgb.Booster(model_file=f"/workspaces/Timi-fx/ml/models/{sym}_model.txt")
    meta = lgb.Booster(model_file=f"/workspaces/Timi-fx/ml/models/{sym}_meta.txt")
    total_trees += len(m.dump_model()['tree_info']) + len(meta.dump_model()['tree_info'])

print(f"\n✅ Total trees across all models: {total_trees}")
print(f"📦 Estimated JS size: ~{total_trees * 2:.0f}KB (target <200KB)")
