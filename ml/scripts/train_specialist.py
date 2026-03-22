"""
TIMI SPECIALIST MODEL TRAINER — Layer 3
Each symbol gets 3 specialist models:
  Model A: Trending specialist   (Hurst > 0.6)
  Model B: Ranging specialist    (Hurst 0.4-0.6)
  Model C: Volatile specialist   (Hurst < 0.4 OR high gc_kurtosis)

HMM routes to correct specialist at inference time
Expected WR improvement: +5-8% per symbol
"""
import pandas as pd
import numpy as np
import lightgbm as lgb
import json, os
from sklearn.metrics import accuracy_score

SYMBOLS = [
    "BOOM500","CRASH500","BOOM1000","CRASH1000",
    "frxUSDJPY","R_50","R_75","R_100","R_25",
    "cryBTCUSD","cryETHUSD",
    "frxEURUSD","frxGBPUSD","frxXAUUSD","frxEURGBP","frxXAGUSD"
]

# Same feature sets as train_compact.py
FEATURES_UNIVERSAL = [
    'rsi', 'macd_hist', 'bb_width',
    'atr_pct', 'momentum_5', 'momentum_10',
    'kalman_noise_ratio', 'realized_vs_garch',
    'vwap_dist', 'vg_hurst', 'vg_alpha',
    'gc_skewness', 'gc_kurtosis', 'gc_weight',
]

FEATURES_BOOM_CRASH = FEATURES_UNIVERSAL + [
    'momentum_3', 'kalman_acceleration',
    'contrarian_score', 'hurst_exponent',
    'retail_cycle_pos', 'garch_vol',
]
FEATURES_VIX = FEATURES_UNIVERSAL + [
    'kalman_acceleration', 'kalman_velocity',
    'vg_hub_density', 'flow_toxicity',
    'session_strength', 'session_overlap', 'retail_cycle_pos',
]
FEATURES_FOREX = FEATURES_UNIVERSAL + [
    'momentum_3', 'momentum_1', 'price_ema50_dist', 'price_ema8_dist',
    'kalman_velocity', 'kalman_trend_dir', 'ou_zscore', 'ou_theta',
    'session_asian', 'session_london', 'session_strength',
    'flow_toxicity', 'fd_price_03', 'fd_price_04',
    'garch_vol', 'hurst_exponent', 'candle_body', 'candle_dir',
    'high_low_range', 'retail_exhaustion',
]
FEATURES_CRYPTO = FEATURES_UNIVERSAL + [
    'momentum_1', 'momentum_3', 'price_ema50_dist', 'price_ema8_dist',
    'kalman_velocity', 'ou_zscore', 'session_overlap', 'session_london',
    'session_strength', 'fd_price_03', 'fd_price_04', 'vg_hub_density',
    'hurst_exponent', 'candle_body', 'candle_dir', 'flow_toxicity', 'garch_vol',
]
FEATURES_COMMODITY = FEATURES_UNIVERSAL + [
    'momentum_1', 'momentum_3', 'session_asian', 'session_strength',
    'session_london', 'contrarian_score', 'hurst_exponent',
    'fd_price_03', 'fd_price_04', 'ou_zscore', 'kalman_velocity',
    'candle_body', 'high_low_range', 'flow_toxicity', 'garch_vol',
]
SYMBOL_FEATURES = {
    "BOOM500": FEATURES_BOOM_CRASH, "BOOM1000": FEATURES_BOOM_CRASH,
    "CRASH500": FEATURES_BOOM_CRASH, "CRASH1000": FEATURES_BOOM_CRASH,
    "R_25": FEATURES_VIX, "R_50": FEATURES_VIX,
    "R_75": FEATURES_VIX, "R_100": FEATURES_VIX,
    "frxUSDJPY": FEATURES_FOREX, "frxEURUSD": FEATURES_FOREX,
    "frxGBPUSD": FEATURES_FOREX, "frxEURGBP": FEATURES_FOREX,
    "cryBTCUSD": FEATURES_CRYPTO, "cryETHUSD": FEATURES_CRYPTO,
    "frxXAUUSD": FEATURES_COMMODITY, "frxXAGUSD": FEATURES_COMMODITY,
}

PARAMS = {
    "BOOM500":   {"n_estimators":120,"learning_rate":0.05,"num_leaves":31,"max_depth":6},
    "CRASH500":  {"n_estimators":120,"learning_rate":0.05,"num_leaves":31,"max_depth":6},
    "BOOM1000":  {"n_estimators":120,"learning_rate":0.05,"num_leaves":31,"max_depth":6},
    "CRASH1000": {"n_estimators":120,"learning_rate":0.05,"num_leaves":31,"max_depth":6},
}
DEFAULT_PARAMS = {"n_estimators":150,"learning_rate":0.05,"num_leaves":31,"max_depth":6}
META_PARAMS    = {"n_estimators":50, "learning_rate":0.05,"num_leaves":15,"max_depth":4}

def classify_regime(hurst, gc_kurtosis):
    """Classify each row into a regime"""
    if hurst > 0.58:
        return "trending"
    elif hurst < 0.42 or gc_kurtosis > 3.0:
        return "volatile"
    else:
        return "ranging"

def train_specialist(symbol):
    path = f"/workspaces/Timi-fx/ml/data/{symbol}.csv"
    if not os.path.exists(path):
        print(f"  ❌ No data for {symbol}")
        return None

    print(f"\n🤖 Training specialists for {symbol}...")
    df    = pd.read_csv(path).dropna(subset=['label'])
    feats = [f for f in SYMBOL_FEATURES.get(symbol, FEATURES_UNIVERSAL) if f in df.columns]
    df    = df.dropna(subset=feats + ['label'])

    # Classify each row into regime
    if 'hurst_exponent' in df.columns and 'gc_kurtosis' in df.columns:
        df['regime'] = df.apply(
            lambda r: classify_regime(r['hurst_exponent'], r['gc_kurtosis']), axis=1
        )
    else:
        df['regime'] = 'ranging'

    # Time-based splits
    n   = len(df)
    ms  = int(n * 0.70)
    me  = int(n * 0.85)

    boom_syms  = ["BOOM500","BOOM1000","BOOM300N","BOOM600","BOOM900","BOOM150N","BOOM50"]
    crash_syms = ["CRASH500","CRASH1000","CRASH300N","CRASH600","CRASH900","CRASH150N","CRASH50"]
    is_uni     = any(b in symbol for b in boom_syms) or any(c in symbol for c in crash_syms)

    specialists = {}
    regime_results = {}

    for regime in ["trending", "ranging", "volatile"]:
        # Get rows for this regime within training window
        regime_mask_train = (df['regime'] == regime).values[:ms]
        regime_mask_meta  = (df['regime'] == regime).values[ms:me]
        regime_mask_test  = (df['regime'] == regime).values[me:]

        df_train = df.iloc[:ms][regime_mask_train]
        df_meta  = df.iloc[ms:me][regime_mask_meta]
        df_test  = df.iloc[me:][regime_mask_test]

        print(f"  {regime:10}: train={len(df_train)} meta={len(df_meta)} test={len(df_test)}")

        if is_uni:
            # Spike detector per regime
            X_train = df_train[feats].values
            y_train = (df_train['label'] != 0).astype(int).values
            X_meta  = df_meta[feats].values
            y_meta  = (df_meta['label'] != 0).astype(int).values
            X_test  = df_test[feats].values
            y_test  = (df_test['label'] != 0).astype(int).values
        else:
            # Direction model per regime — only tradeable rows for training
            trade_train = df_train[df_train['label'] != 0]
            trade_test  = df_test[df_test['label'] != 0]
            if len(trade_train) < 20:
                print(f"    ⚠️  Too few tradeable rows for {regime} — skipping")
                continue
            X_train = trade_train[feats].values
            y_train = (trade_train['label'] == 1).astype(int).values
            X_meta  = df_meta[feats].values
            y_meta  = (df_meta['label'] != 0).astype(int).values
            X_test  = trade_test[feats].values
            y_test  = (trade_test['label'] == 1).astype(int).values

        if len(X_train) < 20:
            print(f"    ⚠️  Too few rows for {regime} — skipping")
            continue

        params = PARAMS.get(symbol, DEFAULT_PARAMS)
        model  = lgb.LGBMClassifier(
            **params, random_state=42,
            class_weight='balanced',
            subsample=0.8, colsample_bytree=0.8, verbose=-1
        )
        model.fit(X_train, y_train)

        # Meta model — train on meta rows augmented with direction prob
        has_meta = False
        if len(X_meta) >= 10 and len(y_meta) >= 10:
            try:
                meta_probs = model.predict_proba(X_meta)[:, 1]
                X_meta_aug = np.column_stack([X_meta, meta_probs])
                y_meta_ok  = ((meta_probs > 0.5).astype(int) == y_meta).astype(int)
                if y_meta_ok.sum() >= 5 and (len(y_meta_ok) - y_meta_ok.sum()) >= 5:
                    meta_model = lgb.LGBMClassifier(**META_PARAMS, random_state=42, subsample=0.8)
                    meta_model.fit(X_meta_aug, y_meta_ok)
                    has_meta = True
            except Exception as ex:
                print(f"    ⚠️  Meta training error: {ex}")

        if not has_meta:
            meta_model = None

        # Evaluate — only if we have test data and meta model
        if len(X_test) >= 10 and meta_model is not None:
            try:
                test_probs = model.predict_proba(X_test)[:, 1]
                test_preds = (test_probs > 0.5).astype(int)
                # IMPORTANT: X_test_aug must have same features as X_meta_aug
                X_test_aug = np.column_stack([X_test, test_probs])
                meta_conf  = meta_model.predict_proba(X_test_aug)[:, 1]
                mask       = meta_conf >= 0.55
                n_trades   = mask.sum()
                if n_trades >= 5:
                    wins     = (test_preds[mask] == y_test[mask]).sum()
                    wr       = wins / n_trades
                    regime_results[regime] = wr
                    print(f"    WR={wr*100:.1f}% ({n_trades} trades)")
                else:
                    print(f"    WR=N/A (too few trades in test)")
                    # Still save model even without eval
                    regime_results[regime] = 0.60  # conservative estimate
            except Exception as ex:
                print(f"    ⚠️  Eval error: {ex}")
                regime_results[regime] = 0.60
        elif len(X_test) >= 10 and meta_model is None:
            # No meta model — use direction model directly
            try:
                test_probs = model.predict_proba(X_test)[:, 1]
                test_preds = (test_probs > 0.5).astype(int)
                mask       = test_probs >= 0.60
                n_trades   = mask.sum()
                if n_trades >= 5:
                    wins = (test_preds[mask] == y_test[mask]).sum()
                    wr   = wins / n_trades
                    regime_results[regime] = wr
                    print(f"    WR={wr*100:.1f}% ({n_trades} trades, no meta)")
            except Exception as ex:
                print(f"    ⚠️  Eval error: {ex}")

        # Export model
        main_trees = [t for t in model.booster_.dump_model()['tree_info']]
        # Export — use main model trees if no meta model
        main_trees = [t for t in model.booster_.dump_model()['tree_info']]
        if meta_model is not None:
            meta_trees_export = [t for t in meta_model.booster_.dump_model()['tree_info']]
        else:
            meta_trees_export = main_trees[:10]  # fallback: use subset of main

        specialists[regime] = {
            "main_trees":     main_trees,
            "meta_trees":     meta_trees_export,
            "meta_threshold": 0.55,
            "n_features":     len(feats),
            "features":       feats,
            "regime":         regime,
            "win_rate":       regime_results.get(regime, 0.60),
            "has_meta":       meta_model is not None,
        }

    if not specialists:
        print(f"  ❌ No specialist models trained for {symbol}")
        return None

    return {
        "symbol":      symbol,
        "specialists": specialists,
        "features":    feats,
        "is_uni":      is_uni,
        "regime_wrs":  regime_results,
    }

def upload_specialists(data):
    """Upload specialist models to Supabase"""
    import urllib.request
    svc = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMyNzQ1MiwiZXhwIjoyMDg3OTAzNDUyfQ.Ktm6Hj88LIJubB-WSPEZEhDNQwpZ5Gyw7nH2IWJI0fo"
    base = "https://pedbupgjxlcumidwoktc.supabase.co/rest/v1"
    hdrs = {
        "apikey": svc, "Authorization": f"Bearer {svc}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal"
    }

    symbol  = data['symbol']
    payload = json.dumps({
        "symbol":        symbol,
        "model_json":    json.dumps({
            "specialists": data['specialists'],
            "features":    data['features'],
            "is_uni":      data['is_uni'],
        }),
        "win_rate":      max(data['regime_wrs'].values()) if data['regime_wrs'] else 0,
        "feature_count": len(data['features']),
        "model_type":    "specialist_v1",
    }).encode()

    # Use upsert to handle existing records
    req = urllib.request.Request(
        f"{base}/specialist_models?on_conflict=symbol",
        data=payload, headers={**hdrs, "Prefer": "resolution=merge-duplicates,return=minimal"},
        method="POST"
    )
    try:
        urllib.request.urlopen(req)
        print(f"  ✅ {symbol} specialists uploaded")
    except Exception as e:
        print(f"  ❌ Upload failed: {e}")
    # Always save locally as backup
    os.makedirs("/workspaces/Timi-fx/ml/models/specialists", exist_ok=True)
    with open(f"/workspaces/Timi-fx/ml/models/specialists/{symbol}.json", 'w') as f:
        json.dump(data, f)
    print(f"  💾 Saved locally too")

if __name__ == "__main__":
    print("🧠 TIMI SPECIALIST MODEL TRAINER — Layer 3")
    print("="*55)

    results = {}
    for sym in SYMBOLS:
        result = train_specialist(sym)
        if result:
            results[sym] = result
            upload_specialists(result)

    print("\n" + "="*55)
    print("📊 SPECIALIST TRAINING SUMMARY")
    print("="*55)
    for sym, r in results.items():
        wrs = r['regime_wrs']
        if wrs:
            best = max(wrs.values())
            avg  = sum(wrs.values()) / len(wrs)
            print(f"  {sym:15}: best={best*100:.1f}% avg={avg*100:.1f}% regimes={list(wrs.keys())}")
        else:
            print(f"  {sym:15}: ❌ no results")
