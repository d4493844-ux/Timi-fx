import lightgbm as lgb
import json
import numpy as np
import os
import urllib.request

WIN_RATES = {
    "BOOM500": 0.780, "CRASH500": 0.761,
    "BOOM1000": 0.841, "CRASH1000": 0.811,
    "frxUSDJPY": 0.657, "cryBTCUSD": 0.632,
    "R_10": 0.580, "R_25": 0.627, "R_50": 0.599, "R_75": 0.628, "R_100": 0.593,
    "JD10": 0.548, "JD25": 0.501, "JD50": 0.542, "JD75": 0.539, "JD100": 0.542,
    "frxEURUSD": 0.639, "frxGBPUSD": 0.608,
    "frxXAUUSD": 0.628, "cryETHUSD": 0.631,
    "frxEURGBP": 0.512, "frxXAGUSD": 0.584
}

SUPABASE_URL = "https://pedbupgjxlcumidwoktc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZGJ1cGdqeGxjdW1pZHdva3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMyNzQ1MiwiZXhwIjoyMDg3OTAzNDUyfQ.Ktm6Hj88LIJubB-WSPEZEhDNQwpZ5Gyw7nH2IWJI0fo"

SYMBOLS = ["BOOM500","CRASH500","BOOM1000","CRASH1000","frxUSDJPY","cryBTCUSD","R_10","R_25","R_50","R_75","R_100","JD10","JD25","JD50","JD75","JD100","frxEURUSD","frxGBPUSD","frxXAUUSD","cryETHUSD","frxEURGBP","frxXAGUSD"]
FEATURES = [
    'rsi', 'macd_hist', 'bb_pos', 'bb_width',
    'ema_bull', 'ema_bear',
    'price_ema8_dist', 'price_ema21_dist', 'price_ema50_dist',
    'atr_pct', 'candle_body', 'candle_dir', 'high_low_range',
    'momentum_1', 'momentum_3', 'momentum_5', 'momentum_10',
    'rsi_oversold', 'rsi_overbought', 'rsi_neutral', 'trend5m'
]

def tree_to_rules(node, features, depth=0):
    """Convert tree to compact nested dict"""
    if 'leaf_value' in node:
        return {"v": round(node['leaf_value'], 5)}
    fi = node['split_feature']
    return {
        "f": fi,
        "t": round(node['threshold'], 6),
        "l": tree_to_rules(node['left_child'],  features, depth+1),
        "r": tree_to_rules(node['right_child'], features, depth+1),
    }

def export_model_compact(symbol):
    mp = f"/workspaces/Timi-fx/ml/models/{symbol}_ensemble_0.txt"
    ep = f"/workspaces/Timi-fx/ml/models/{symbol}_meta.txt"

    model = lgb.Booster(model_file=mp)
    meta  = lgb.Booster(model_file=ep)

    md = model.dump_model()
    me = meta.dump_model()

    main_trees = [tree_to_rules(t['tree_structure'], FEATURES) for t in md['tree_info']]
    meta_trees = [tree_to_rules(t['tree_structure'], FEATURES + ['ml_prob']) for t in me['tree_info']]

    payload = {
        "symbol": symbol,
        "features": FEATURES,
        "main_trees": main_trees,
        "meta_trees": meta_trees,
        "meta_threshold": 0.60,
        "version": "compact_v1"
    }

    size_kb = len(json.dumps(payload)) / 1024
    print(f"  {symbol}: {len(main_trees)} main + {len(meta_trees)} meta trees = {size_kb:.0f}KB")
    return payload

def upsert_model(symbol, payload):
    """Save model JSON to Supabase ml_models table"""
    data = json.dumps({
        "symbol": symbol,
        "model_json": json.dumps(payload),
        # win_rate from actual Kalman-enhanced training results
        "win_rate": WIN_RATES.get(symbol, 0.60),
        "trained_at": "now()"
    }).encode()

    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/ml_models",
        data=data,
        headers={
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Prefer": "resolution=merge-duplicates"
        },
        method="POST"
    )
    try:
        resp = urllib.request.urlopen(req)
        print(f"  ✅ {symbol} uploaded to Supabase")
    except Exception as e:
        print(f"  ❌ {symbol} upload failed: {e}")

print("📦 Exporting compact models...")
for sym in SYMBOLS:
    payload = export_model_compact(sym)
    upsert_model(sym, payload)

print("\n✅ All models uploaded to Supabase ml_models table")
print("Edge function will load them on startup via REST")

# ── Auto-retrain HMM after model upload ──
import subprocess
print("\n🧠 Retraining HMM with fresh data...")
result = subprocess.run(
    ["python3", "/workspaces/Timi-fx/ml/scripts/train_hmm.py"],
    capture_output=True, text=True, timeout=300
)
if "✅ HMM uploaded" in result.stdout:
    print("✅ HMM retrained and uploaded")
elif "Upload failed" in result.stdout:
    print("⚠️  HMM retrained but upload failed — run SQL first")
else:
    print(f"HMM output: {result.stdout[-200:]}")
