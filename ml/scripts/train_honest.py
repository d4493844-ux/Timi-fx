import pandas as pd
import numpy as np
import lightgbm as lgb
import json, os
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

SYMBOLS = [
    "BOOM1000", "CRASH1000", "R_25", "R_75", "R_50", "R_100",
    "frxEURUSD", "frxGBPUSD", "frxUSDJPY", "frxGBPJPY",
    "frxAUDUSD", "frxXAUUSD", "cryBTCUSD", "cryETHUSD"
]

FEATURES = [
    'rsi', 'macd_hist', 'bb_pos', 'bb_width',
    'ema_bull', 'ema_bear',
    'price_ema8_dist', 'price_ema21_dist', 'price_ema50_dist',
    'atr_pct', 'candle_body', 'candle_dir', 'high_low_range',
    'momentum_1', 'momentum_3', 'momentum_5', 'momentum_10',
    'rsi_oversold', 'rsi_overbought', 'rsi_neutral', 'trend5m'
]

SYMBOL_PARAMS = {
    "BOOM1000":  {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "CRASH1000": {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "R_25":      {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    "R_50":      {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    "R_75":      {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    "R_100":     {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    "frxEURUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxGBPUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxUSDJPY": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxGBPJPY": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxAUDUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxXAUUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "cryBTCUSD": {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 40, "min_child_samples": 35},
    "cryETHUSD": {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 40, "min_child_samples": 35},
}

def train_symbol(symbol):
    print(f"\n{'='*50}")
    print(f"🤖 {symbol}")

    path = f"/workspaces/Timi-fx/ml/data/{symbol}.csv"
    if not os.path.exists(path):
        print(f"  ❌ No data"); return None

    df = pd.read_csv(path).dropna(subset=FEATURES + ['label'])
    feats = [f for f in FEATURES if f in df.columns]
    X = df[feats].values
    y = df['label'].values.astype(int)

    # HONEST split: train on first 70%, test on last 30% (future data)
    split = int(len(X) * 0.70)
    meta_split = int(len(X) * 0.85)

    X_train, y_train = X[:split], y[:split]
    X_meta_train, y_meta_train = X[split:meta_split], y[split:meta_split]
    X_test, y_test = X[meta_split:], y[meta_split:]

    print(f"  Train: {split} | Meta-train: {meta_split-split} | Test: {len(X)-meta_split}")

    # Train main model on first 70%
    params = SYMBOL_PARAMS.get(symbol, SYMBOL_PARAMS["R_25"])
    model = lgb.LGBMClassifier(**params, random_state=42,
                                class_weight='balanced',
                                subsample=0.8, colsample_bytree=0.8,
                                reg_alpha=0.1, reg_lambda=0.1, verbose=-1)
    model.fit(X_train, y_train)

    # Evaluate on meta-train period (unseen)
    meta_probs = model.predict_proba(X_meta_train)[:, 1]
    meta_preds = (meta_probs > 0.5).astype(int)
    meta_acc = accuracy_score(y_meta_train, meta_preds)
    print(f"  Main model accuracy (meta period): {meta_acc*100:.1f}%")

    # Train meta-model on 70-85% period using main model's probabilities
    X_meta_aug = np.column_stack([X_meta_train, meta_probs])
    y_meta_correct = (meta_preds == y_meta_train).astype(int)

    meta_model = lgb.LGBMClassifier(
        n_estimators=200, learning_rate=0.05, max_depth=4,
        num_leaves=15, random_state=42, verbose=-1,
        subsample=0.8, colsample_bytree=0.8
    )
    meta_model.fit(X_meta_aug, y_meta_correct)

    # ── HONEST TEST on last 15% (truly unseen future data) ──
    test_probs  = model.predict_proba(X_test)[:, 1]
    test_preds  = (test_probs > 0.5).astype(int)
    X_test_aug  = np.column_stack([X_test, test_probs])
    meta_conf   = meta_model.predict_proba(X_test_aug)[:, 1]

    # Only take trades where meta-model is confident
    threshold = 0.60
    trade_mask = meta_conf >= threshold
    n_trades   = trade_mask.sum()

    if n_trades >= 10:
        traded_preds   = test_preds[trade_mask]
        traded_labels  = y_test[trade_mask]
        win_rate = accuracy_score(traded_labels, traded_preds)
        pnl = sum(0.95 if p == l else -1.0 for p, l in zip(traded_preds, traded_labels))
    else:
        win_rate = 0
        pnl = 0

    base_wr = accuracy_score(y_test, test_preds)
    print(f"  Base WR (no filter): {base_wr*100:.1f}%")
    print(f"  Meta filtered: {n_trades} trades | WR: {win_rate*100:.1f}% | PnL: ${pnl:.2f}")

    deploy = win_rate >= 0.55 and n_trades >= 10
    verdict = "✅ DEPLOY" if deploy else "❌ SKIP"
    print(f"  {verdict}")

    result = {
        "symbol": symbol,
        "base_win_rate": round(float(base_wr), 4),
        "meta_win_rate": round(float(win_rate), 4),
        "meta_trades": int(n_trades),
        "pnl_per_dollar": round(float(pnl), 2),
        "deploy": bool(deploy),
        "features": feats,
        "feature_importances": {f: round(float(v), 2) for f, v in zip(feats, model.feature_importances_)},
    }

    # Save models
    model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_model.txt")
    meta_model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_meta.txt")
    with open(f"/workspaces/Timi-fx/ml/models/{symbol}_result.json", 'w') as f:
        json.dump(result, f, indent=2)

    return result

def main():
    print("🧠 HONEST ML TRAINER - Train/Meta/Test properly split")
    print("No lookahead bias. No data leakage. Real results only.\n")

    results = []
    for sym in SYMBOLS:
        r = train_symbol(sym)
        if r: results.append(r)

    print(f"\n{'='*50}")
    print("📊 HONEST FINAL RESULTS")
    print(f"{'='*50}")

    deploy = [r for r in results if r['deploy']]
    skip   = [r for r in results if not r['deploy']]

    print(f"\n✅ GENUINELY PROFITABLE ({len(deploy)}):")
    for r in sorted(deploy, key=lambda x: x['meta_win_rate'], reverse=True):
        print(f"   {r['symbol']}: {r['meta_win_rate']*100:.1f}% WR | {r['meta_trades']} trades | PnL ${r['pnl_per_dollar']:.2f}")

    print(f"\n❌ NOT PROFITABLE ({len(skip)}):")
    for r in sorted(skip, key=lambda x: x['meta_win_rate'], reverse=True):
        print(f"   {r['symbol']}: {r['meta_win_rate']*100:.1f}% WR | {r['meta_trades']} trades")

    master = {"deploy_symbols": [r['symbol'] for r in deploy], "all_results": results}
    with open("/workspaces/Timi-fx/ml/models/master_config.json", 'w') as f:
        json.dump(master, f, indent=2)

    if deploy:
        syms = ','.join([f"'{r['symbol']}'" for r in deploy])
        print(f"\n📋 SQL:")
        print(f"update bot_config set symbols = ARRAY[{syms}] where active = true;")

main()
