import pandas as pd
import numpy as np
import lightgbm as lgb
import json
import os
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, classification_report
from sklearn.calibration import CalibratedClassifierCV
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
    'rsi_oversold', 'rsi_overbought', 'rsi_neutral',
    'trend5m'
]

# Per-symbol LightGBM params tuned to each market type
SYMBOL_PARAMS = {
    # Synthetics - faster, noisier
    "BOOM1000":  {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "CRASH1000": {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "R_25":      {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    "R_50":      {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    "R_75":      {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    "R_100":     {"n_estimators": 400, "learning_rate": 0.05, "max_depth": 5, "num_leaves": 25, "min_child_samples": 40},
    # Forex - slower, more structured
    "frxEURUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxGBPUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxUSDJPY": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxGBPJPY": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxAUDUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    "frxXAUUSD": {"n_estimators": 600, "learning_rate": 0.02, "max_depth": 7, "num_leaves": 50, "min_child_samples": 50},
    # Crypto - high volatility
    "cryBTCUSD": {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 40, "min_child_samples": 35},
    "cryETHUSD": {"n_estimators": 500, "learning_rate": 0.03, "max_depth": 6, "num_leaves": 40, "min_child_samples": 35},
}

def train_symbol(symbol):
    print(f"\n{'='*50}")
    print(f"🤖 Training {symbol}...")
    
    path = f"/workspaces/Timi-fx/ml/data/{symbol}.csv"
    if not os.path.exists(path):
        print(f"  ❌ No data file found")
        return None

    df = pd.read_csv(path)
    df = df.dropna(subset=FEATURES + ['label'])
    
    # Available features (some might be missing)
    feats = [f for f in FEATURES if f in df.columns]
    X = df[feats].values
    y = df['label'].values.astype(int)
    
    print(f"  📊 Dataset: {len(df)} rows | Features: {len(feats)} | BUY:{y.sum()} SELL:{(1-y).sum()}")

    # Time series split - never train on future data
    tscv = TimeSeriesSplit(n_splits=5)
    
    params = SYMBOL_PARAMS.get(symbol, SYMBOL_PARAMS["R_25"])
    
    fold_scores = []
    best_model = None
    best_score = 0

    for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        model = lgb.LGBMClassifier(
            **params,
            random_state=42,
            class_weight='balanced',
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=0.1,
            verbose=-1
        )
        model.fit(X_train, y_train,
                  eval_set=[(X_val, y_val)],
                  callbacks=[lgb.early_stopping(50, verbose=False), lgb.log_evaluation(period=-1)])

        preds = model.predict(X_val)
        score = accuracy_score(y_val, preds)
        fold_scores.append(score)
        
        if score > best_score:
            best_score = score
            best_model = model

    avg_score = np.mean(fold_scores)
    print(f"  📈 CV Accuracy: {avg_score*100:.1f}% (folds: {[f'{s*100:.1f}%' for s in fold_scores]})")

    # ── META-LABELING: Train a second model to filter low confidence trades ──
    # Use best model's probabilities as a feature for meta-model
    probs = best_model.predict_proba(X)[:, 1]
    df['ml_prob'] = probs
    df['ml_pred'] = (probs > 0.5).astype(int)
    df['correct'] = (df['ml_pred'] == df['label']).astype(int)

    # Meta features: when should we trust the main model?
    meta_feats = feats + ['ml_prob']
    df_meta = df.copy()
    df_meta['ml_prob'] = probs
    X_meta = df_meta[meta_feats].values
    y_meta = df_meta['correct'].values

    meta_model = lgb.LGBMClassifier(
        n_estimators=200, learning_rate=0.05,
        max_depth=4, num_leaves=15,
        random_state=42, verbose=-1,
        subsample=0.8, colsample_bytree=0.8
    )
    meta_model.fit(X_meta, y_meta)
    meta_probs = meta_model.predict_proba(X_meta)[:, 1]

    # Simulate trading with meta-labeling
    threshold = 0.65  # only trade when meta-model is 65%+ confident
    trade_mask = meta_probs >= threshold
    traded = df[trade_mask].copy()
    traded['ml_pred'] = (probs[trade_mask] > 0.5).astype(int)
    
    if len(traded) > 0:
        traded_wr = (traded['ml_pred'] == traded['label']).mean()
        print(f"  🎯 Meta-label filtered: {len(traded)} trades | Win rate: {traded_wr*100:.1f}%")
        print(f"  📉 Trades filtered out: {len(df)-len(traded)} ({(1-len(traded)/len(df))*100:.0f}% of signals rejected)")
    else:
        traded_wr = 0
        print(f"  ⚠️ Meta-model too strict - no trades passed")

    # Feature importance
    feat_imp = dict(zip(feats, best_model.feature_importances_))
    top_feats = sorted(feat_imp.items(), key=lambda x: x[1], reverse=True)[:5]
    print(f"  🔑 Top features: {[(f, round(float(v),1)) for f,v in top_feats]}")

    # Save model as rules/thresholds for edge function
    result = {
        "symbol": symbol,
        "cv_accuracy": round(float(avg_score), 4),
        "meta_win_rate": round(float(traded_wr), 4),
        "meta_trades": int(len(traded)),
        "meta_threshold": threshold,
        "features": feats,
        "top_features": [(f, round(float(v), 2)) for f, v in top_feats],
        "feature_importances": {f: round(float(v), 2) for f, v in feat_imp.items()},
        # Decision thresholds derived from model
        "deploy": traded_wr >= 0.55 and len(traded) >= 20,
        "confidence_required": round(float(threshold * 100), 0),
    }

    # Save the model
    model_path = f"/workspaces/Timi-fx/ml/models/{symbol}_model.txt"
    best_model.booster_.save_model(model_path)
    
    meta_path = f"/workspaces/Timi-fx/ml/models/{symbol}_meta.txt"
    meta_model.booster_.save_model(meta_path)

    result_path = f"/workspaces/Timi-fx/ml/models/{symbol}_result.json"
    with open(result_path, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"  💾 Model saved → {model_path}")
    verdict = "✅ DEPLOY" if result['deploy'] else "❌ SKIP"
    print(f"  {verdict} | Meta WR: {traded_wr*100:.1f}% on {len(traded)} trades")
    
    return result

def main():
    print("🧠 TIMI ML TRAINER - LightGBM + Meta-Labeling")
    print("Training per-symbol models on real historical data\n")
    
    results = []
    for sym in SYMBOLS:
        r = train_symbol(sym)
        if r:
            results.append(r)

    print(f"\n{'='*50}")
    print("📊 TRAINING COMPLETE - FINAL RESULTS")
    print(f"{'='*50}")
    
    deploy = [r for r in results if r['deploy']]
    skip   = [r for r in results if not r['deploy']]
    
    print(f"\n✅ DEPLOY THESE SYMBOLS ({len(deploy)}):")
    for r in sorted(deploy, key=lambda x: x['meta_win_rate'], reverse=True):
        print(f"   {r['symbol']}: {r['meta_win_rate']*100:.1f}% WR | {r['meta_trades']} trades | CV: {r['cv_accuracy']*100:.1f}%")
    
    print(f"\n❌ SKIP THESE SYMBOLS ({len(skip)}):")
    for r in sorted(skip, key=lambda x: x['meta_win_rate'], reverse=True):
        print(f"   {r['symbol']}: {r['meta_win_rate']*100:.1f}% WR | {r['meta_trades']} trades")

    # Save master config
    master = {
        "trained_at": str(pd.Timestamp.now()),
        "deploy_symbols": [r['symbol'] for r in deploy],
        "all_results": results
    }
    with open("/workspaces/Timi-fx/ml/models/master_config.json", 'w') as f:
        json.dump(master, f, indent=2)
    print(f"\n💾 Master config saved → ml/models/master_config.json")
    
    if deploy:
        syms = [f"'{r['symbol']}'" for r in deploy]
        print(f"\n📋 SQL to update bot:")
        print(f"update bot_config set symbols = ARRAY[{','.join(syms)}] where active = true;")

main()
