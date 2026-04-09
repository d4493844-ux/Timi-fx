import pandas as pd
import numpy as np
import lightgbm as lgb
import json, os
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

SYMBOL_PARAMS = {
    "BOOM500":   {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "CRASH500":  {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "BOOM1000":  {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "CRASH1000": {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "frxUSDJPY": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
    "cryBTCUSD": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
    "R_25":      {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "R_50":      {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "R_75":      {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "R_100":     {"n_estimators": 120, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 30},
    "frxEURUSD": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
    "frxGBPUSD": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
    "frxXAUUSD": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
    "cryETHUSD": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
    "frxEURGBP": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
    "frxXAGUSD": {"n_estimators": 150, "learning_rate": 0.08, "max_depth": 6, "num_leaves": 31, "min_child_samples": 50},
}

META_PARAMS = {"n_estimators": 50, "learning_rate": 0.08, "max_depth": 4, "num_leaves": 15, "verbose": -1}

# 41 features total
# ═══════════════════════════════════════════════════════
# OPTIMIZED FEATURE SETS — Data-driven via MI analysis
# Tested across ALL 16 symbols, 5 market groups
# ═══════════════════════════════════════════════════════

# 14 UNIVERSAL features — used for every symbol
FEATURES_UNIVERSAL = [
    'rsi', 'macd_hist', 'bb_width',
    'atr_pct', 'momentum_5', 'momentum_10',
    'kalman_noise_ratio',
    'realized_vs_garch',
    'vwap_dist',
    'vg_hurst', 'vg_alpha',              # Visibility Graph — #1 predictor
    'gc_skewness', 'gc_kurtosis', 'gc_weight',  # Gram-Charlier fat tails
]

# SELECTIVE features per market group
FEATURES_BOOM_CRASH = FEATURES_UNIVERSAL + [
    'momentum_3', 'kalman_acceleration',
    'contrarian_score', 'hurst_exponent',
    'retail_cycle_pos', 'garch_vol',
]

FEATURES_VIX = FEATURES_UNIVERSAL + [
    'kalman_acceleration', 'kalman_velocity',
    'vg_hub_density', 'flow_toxicity',
    'session_strength', 'session_overlap',
    'retail_cycle_pos',
]

FEATURES_FOREX = FEATURES_UNIVERSAL + [
    'momentum_3', 'momentum_1',
    'price_ema50_dist', 'price_ema8_dist',
    'kalman_velocity', 'kalman_trend_dir',
    'ou_zscore', 'ou_theta',
    'session_asian', 'session_london', 'session_strength',
    'flow_toxicity', 'fd_price_03', 'fd_price_04',
    'garch_vol', 'hurst_exponent',
    'candle_body', 'candle_dir', 'high_low_range',
    'retail_exhaustion',
]

FEATURES_CRYPTO = FEATURES_UNIVERSAL + [
    'momentum_1', 'momentum_3',
    'price_ema50_dist', 'price_ema8_dist',
    'kalman_velocity', 'ou_zscore',
    'session_overlap', 'session_london', 'session_strength',
    'fd_price_03', 'fd_price_04',
    'vg_hub_density', 'hurst_exponent',
    'candle_body', 'candle_dir',
    'flow_toxicity', 'garch_vol',
]

FEATURES_COMMODITY = FEATURES_UNIVERSAL + [
    'momentum_1', 'momentum_3',
    'session_asian', 'session_strength', 'session_london',
    'contrarian_score', 'hurst_exponent',
    'fd_price_03', 'fd_price_04',
    'ou_zscore', 'kalman_velocity',
    'candle_body', 'high_low_range',
    'flow_toxicity', 'garch_vol',
]

# Symbol → feature set mapping
SYMBOL_FEATURES = {
    "BOOM500":   FEATURES_BOOM_CRASH,
    "BOOM1000":  FEATURES_BOOM_CRASH,
    "CRASH500":  FEATURES_BOOM_CRASH,
    "CRASH1000": FEATURES_BOOM_CRASH,
    "R_25":      FEATURES_VIX,
    "R_50":      FEATURES_VIX,
    "R_75":      FEATURES_VIX,
    "R_100":     FEATURES_VIX,
    "frxUSDJPY": FEATURES_FOREX,
    "frxEURUSD": FEATURES_FOREX,
    "frxGBPUSD": FEATURES_FOREX,
    "frxEURGBP": FEATURES_FOREX,
    "cryBTCUSD": FEATURES_CRYPTO,
    "cryETHUSD": FEATURES_CRYPTO,
    "frxXAUUSD": FEATURES_COMMODITY,
    "frxXAGUSD": FEATURES_COMMODITY,
}

# Default fallback
FEATURES = FEATURES_UNIVERSAL

print("Feature counts:")
print(f"  BOOM/CRASH: {len(FEATURES_BOOM_CRASH)}")
print(f"  VIX:        {len(FEATURES_VIX)}")
print(f"  FOREX:      {len(FEATURES_FOREX)}")
print(f"  CRYPTO:     {len(FEATURES_CRYPTO)}")
print(f"  COMMODITY:  {len(FEATURES_COMMODITY)}")


def train(symbol):
    path = f"/workspaces/Timi-fx/ml/data/{symbol}.csv"
    if not os.path.exists(path):
        print(f"  ⚠️  No data for {symbol} — skipping")
        return None, 0

    print(f"\n🤖 Training {symbol}...")
    df    = pd.read_csv(path).dropna(subset=['label'])
    # Use per-symbol optimized feature set
    sym_feats = SYMBOL_FEATURES.get(symbol, FEATURES_UNIVERSAL)
    feats = [f for f in sym_feats if f in df.columns]
    missing = [f for f in sym_feats if f not in df.columns]
    if missing:
        print(f"  ⚠️  Missing: {missing}")
    print(f"  Feature set: {len(feats)} features ({len(feats)-14} selective + 14 universal)")

    df = df.dropna(subset=feats + ['label'])

    # ── TRI-CLASS LABEL HANDLING ──
    # Direction model: trained on TRADEABLE rows only (BUY=1, SELL=0)
    # Meta model: filters noise (TRADE=1 vs HOLD=0) on ALL rows
    df_trade = df[df['label'] != 0].copy()
    df_trade['label_bin'] = (df_trade['label'] == 1).astype(int)
    df['label_trade'] = (df['label'] != 0).astype(int)

    # Direction model splits (only tradeable rows)
    X      = df_trade[feats].values
    y      = df_trade['label_bin'].values.astype(int)
    split      = int(len(X) * 0.70)
    meta_split = int(len(X) * 0.85)
    X_train, y_train = X[:split],           y[:split]
    X_meta,  y_meta  = X[split:meta_split], y[split:meta_split]
    X_test,  y_test  = X[meta_split:],      y[meta_split:]

    # Meta model splits (all rows — filter noise)
    X_all  = df[feats].values
    y_all  = df['label_trade'].values.astype(int)
    ms     = int(len(X_all) * 0.70)
    me     = int(len(X_all) * 0.85)
    X_meta_all = X_all[ms:me]
    y_meta_all = y_all[ms:me]
    X_test_all = X_all[me:]
    y_test_all = y_all[me:]

    print(f"  Features: {len(feats)} optimized | Train:{len(X_train)} Meta:{len(X_meta)} Test:{len(X_test)}")

    params = SYMBOL_PARAMS.get(symbol, SYMBOL_PARAMS["frxUSDJPY"])

    # ── SMART TRAINING ROUTING ──
    boom_syms  = ["BOOM500","BOOM1000","BOOM300N","BOOM600","BOOM900","BOOM150N","BOOM50"]
    crash_syms = ["CRASH500","CRASH1000","CRASH300N","CRASH600","CRASH900","CRASH150N","CRASH50"]
    is_unidirectional = any(b in symbol for b in boom_syms) or any(c in symbol for c in crash_syms)

    if is_unidirectional:
        # BOOM/CRASH: Spike Detector — learns WHEN not direction
        # Direction hardcoded: BOOM=BUY, CRASH=SELL
        sp = int(len(X_all) * 0.70)
        me = int(len(X_all) * 0.85)
        Xsp_tr, ysp_tr = X_all[:sp],    y_all[:sp]
        Xsp_mt, ysp_mt = X_all[sp:me],  y_all[sp:me]
        Xsp_te, ysp_te = X_all[me:],    y_all[me:]

        n_spike = int((ysp_tr==1).sum())
        n_hold  = int((ysp_tr==0).sum())
        print(f"  Spike detector: SPIKE={n_spike} HOLD={n_hold}")

        model = lgb.LGBMClassifier(
            **params, random_state=42,
            class_weight="balanced",
            subsample=0.8, colsample_bytree=0.8, verbose=-1
        )
        model.fit(Xsp_tr, ysp_tr)

        meta_probs = model.predict_proba(Xsp_mt)[:, 1]
        X_meta_aug = np.column_stack([Xsp_mt, meta_probs])
        y_meta_ok  = ((meta_probs > 0.5).astype(int) == ysp_mt).astype(int)
        meta_model = lgb.LGBMClassifier(**META_PARAMS, random_state=42, subsample=0.8)
        meta_model.fit(X_meta_aug, y_meta_ok)

        test_probs = model.predict_proba(Xsp_te)[:, 1]
        test_preds = (test_probs > 0.5).astype(int)
        X_test_aug = np.column_stack([Xsp_te, test_probs])
        meta_conf  = meta_model.predict_proba(X_test_aug)[:, 1]
        mask       = meta_conf >= 0.55
        n_trades   = int(mask.sum())
        if n_trades >= 10:
            wins     = int((test_preds[mask] == ysp_te[mask]).sum())
            win_rate = wins / n_trades
            pnl      = wins * 0.95 - (n_trades - wins) * 1.0
        else:
            win_rate = 0; pnl = 0

    else:
        # Bidirectional: Direction model on trade rows + meta on all rows
        # ── UNIFIED TIME-BASED SPLIT — no leakage ──
        # Use same row indices for both direction and meta models
        n_all  = len(X_all)
        ms     = int(n_all * 0.70)
        me     = int(n_all * 0.85)

        # Direction model: train on tradeable rows in 0-70% window
        train_labels = df["label"].values[:ms]
        train_trade  = train_labels != 0
        X_dir_train  = X_all[:ms][train_trade]
        y_dir_train  = (train_labels[train_trade] == 1).astype(int)  # 1=BUY 0=SELL

        n_buy  = int((y_dir_train==1).sum())
        n_sell = int((y_dir_train==0).sum())
        print(f"  Direction: BUY={n_buy} SELL={n_sell}")

        if n_buy < 10 or n_sell < 10:
            print(f"  ⚠️  Insufficient direction data — skipping")
            win_rate = 0; pnl = 0; n_trades = 0
        else:
            model = lgb.LGBMClassifier(
                **params, random_state=42,
                class_weight="balanced",
                subsample=0.8, colsample_bytree=0.8, verbose=-1
            )
            model.fit(X_dir_train, y_dir_train)

            # Meta model: train on ALL rows in 70-85% window
            # Predicts: will direction model be correct on this row?
            Xm = X_all[ms:me]
            meta_labels = df["label"].values[ms:me]
            meta_trade  = meta_labels != 0

            if meta_trade.sum() >= 10:
                Xm_trade     = Xm[meta_trade]
                dir_probs_m  = model.predict_proba(Xm_trade)[:, 1]
                dir_preds_m  = (dir_probs_m > 0.5).astype(int)
                true_meta    = meta_labels[meta_trade]
                y_meta_win   = np.array([
                    1 if (t==1 and p==1) or (t==-1 and p==0) else 0
                    for p, t in zip(dir_preds_m, true_meta)
                ])
                X_meta_aug   = np.column_stack([Xm_trade, dir_probs_m])
                meta_model   = lgb.LGBMClassifier(**META_PARAMS, random_state=42, subsample=0.8)
                meta_model.fit(X_meta_aug, y_meta_win)
            else:
                meta_model = None

            # Evaluate on test window 85-100%
            Xt          = X_all[me:]
            test_labels = df["label"].values[me:]
            test_trade  = test_labels != 0

            if meta_model is not None and test_trade.sum() >= 10:
                Xt_trade    = Xt[test_trade]
                dir_probs_t = model.predict_proba(Xt_trade)[:, 1]
                dir_preds_t = (dir_probs_t > 0.5).astype(int)
                X_test_aug  = np.column_stack([Xt_trade, dir_probs_t])
                meta_conf   = meta_model.predict_proba(X_test_aug)[:, 1]
                mask        = meta_conf >= 0.60
                n_trades    = int(mask.sum())

                if n_trades >= 10:
                    true_trade  = test_labels[test_trade][mask]
                    pred_trade  = dir_preds_t[mask]
                    wins = sum(
                        1 for p, t in zip(pred_trade, true_trade)
                        if (t==1 and p==1) or (t==-1 and p==0)
                    )
                    win_rate = wins / n_trades
                    pnl      = wins * 0.95 - (n_trades - wins) * 1.0
                else:
                    win_rate = 0; pnl = 0; n_trades = 0
            else:
                win_rate = 0; pnl = 0; n_trades = 0

    print(f"  Trades:{n_trades} | WR:{win_rate*100:.1f}% | PnL:${pnl:.2f}")

    os.makedirs("/workspaces/Timi-fx/ml/models", exist_ok=True)
    model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_model.txt")
    meta_model.booster_.save_model(f"/workspaces/Timi-fx/ml/models/{symbol}_meta.txt")

    d  = model.booster_.dump_model()
    dm = meta_model.booster_.dump_model()
    print(f"  Trees: main={len(d['tree_info'])}, meta={len(dm['tree_info'])}")
    return win_rate, n_trades

results = {}
for sym in SYMBOL_PARAMS:
    wr, n = train(sym)
    if wr is not None:
        results[sym] = {"win_rate": wr, "trades": n}

print("\n" + "="*55)
print("📊 TRAINING SUMMARY — 41 FEATURES")
print("="*55)
for sym, r in sorted(results.items(), key=lambda x: -x[1]['win_rate']):
    status = "✅" if r['win_rate'] >= 0.60 else "⚠️ " if r['win_rate'] >= 0.50 else "❌"
    print(f"  {status} {sym}: {r['win_rate']*100:.1f}% WR ({r['trades']} trades)")

good = [s for s,r in results.items() if r['win_rate'] >= 0.60]
print(f"\n✅ Ready for upload: {good}")