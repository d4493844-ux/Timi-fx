import json
import lightgbm as lgb
import numpy as np
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

MODELS = {}
META_MODELS = {}
RESULTS = {}

DEPLOY_SYMBOLS = ["BOOM1000", "CRASH1000", "frxUSDJPY"]

FEATURES = [
    'rsi', 'macd_hist', 'bb_pos', 'bb_width',
    'ema_bull', 'ema_bear',
    'price_ema8_dist', 'price_ema21_dist', 'price_ema50_dist',
    'atr_pct', 'candle_body', 'candle_dir', 'high_low_range',
    'momentum_1', 'momentum_3', 'momentum_5', 'momentum_10',
    'rsi_oversold', 'rsi_overbought', 'rsi_neutral', 'trend5m'
]

def load_models():
    for sym in DEPLOY_SYMBOLS:
        mp = f"/workspaces/Timi-fx/ml/models/{sym}_model.txt"
        ep = f"/workspaces/Timi-fx/ml/models/{sym}_meta.txt"
        rp = f"/workspaces/Timi-fx/ml/models/{sym}_result.json"
        if os.path.exists(mp):
            MODELS[sym] = lgb.Booster(model_file=mp)
            print(f"  ✅ Loaded {sym} model")
        if os.path.exists(ep):
            META_MODELS[sym] = lgb.Booster(model_file=ep)
            print(f"  ✅ Loaded {sym} meta-model")
        if os.path.exists(rp):
            with open(rp) as f:
                RESULTS[sym] = json.load(f)

def predict(symbol, features_dict):
    if symbol not in MODELS:
        return {"action": "HOLD", "confidence": 0, "reason": "No model"}

    feats = [features_dict.get(f, 0) for f in FEATURES]
    X = np.array([feats])

    # Main model prediction
    prob = float(MODELS[symbol].predict(X)[0])
    pred = 1 if prob > 0.5 else 0

    # Meta-model: should we take this trade?
    X_meta = np.column_stack([X, [[prob]]])
    meta_conf = float(META_MODELS[symbol].predict(X_meta)[0]) if symbol in META_MODELS else 0.5

    if meta_conf < 0.60:
        return {"action": "HOLD", "confidence": 0, "reason": f"Meta-model low confidence: {meta_conf:.2f}"}

    action = "BUY" if pred == 1 else "SELL"
    # Scale confidence: meta_conf 0.6-1.0 → 60-95
    confidence = int(min(95, meta_conf * 100))

    return {
        "action": action,
        "confidence": confidence,
        "ml_prob": round(prob, 3),
        "meta_conf": round(meta_conf, 3),
        "reason": f"LightGBM+Meta | prob:{prob:.2f} meta:{meta_conf:.2f}"
    }

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length))
        symbol = body.get("symbol", "")
        features = body.get("features", {})
        result = predict(symbol, features)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_GET(self):
        status = {
            "status": "ok",
            "models_loaded": list(MODELS.keys()),
            "deploy_symbols": DEPLOY_SYMBOLS
        }
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(status).encode())

    def log_message(self, format, *args):
        pass  # suppress logs

print("🧠 TIMI ML Inference Server")
print("Loading models...")
load_models()
print(f"✅ Ready - serving {len(MODELS)} models on port 8765")
HTTPServer(("0.0.0.0", 8765), Handler).serve_forever()
