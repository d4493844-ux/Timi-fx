import lightgbm as lgb
import json
import numpy as np
import os

DEPLOY_SYMBOLS = ["BOOM1000", "CRASH1000", "frxUSDJPY"]

FEATURES = [
    'rsi', 'macd_hist', 'bb_pos', 'bb_width',
    'ema_bull', 'ema_bear',
    'price_ema8_dist', 'price_ema21_dist', 'price_ema50_dist',
    'atr_pct', 'candle_body', 'candle_dir', 'high_low_range',
    'momentum_1', 'momentum_3', 'momentum_5', 'momentum_10',
    'rsi_oversold', 'rsi_overbought', 'rsi_neutral', 'trend5m'
]

def tree_to_js(tree_dict, features, indent=0):
    """Recursively convert a LightGBM tree to JS if/else code"""
    pad = "  " * indent
    if 'leaf_value' in tree_dict:
        return f"{pad}return {tree_dict['leaf_value']:.6f};"
    
    feat_idx = tree_dict['split_feature']
    threshold = tree_dict['threshold']
    feat_name = features[feat_idx] if feat_idx < len(features) else f"f{feat_idx}"
    
    left  = tree_to_js(tree_dict['left_child'],  features, indent + 1)
    right = tree_to_js(tree_dict['right_child'], features, indent + 1)
    
    return (f"{pad}if (f[{feat_idx}] <= {threshold:.6f}) {{\n"
            f"{left}\n"
            f"{pad}}} else {{\n"
            f"{right}\n"
            f"{pad}}}")

def model_to_js(symbol, model_path, meta_path):
    print(f"\n📦 Exporting {symbol}...")
    
    model = lgb.Booster(model_file=model_path)
    meta  = lgb.Booster(model_file=meta_path)
    
    model_dump = model.dump_model()
    meta_dump  = meta.dump_model()
    
    num_trees      = len(model_dump['tree_info'])
    num_meta_trees = len(meta_dump['tree_info'])
    print(f"  Main model: {num_trees} trees")
    print(f"  Meta model: {num_meta_trees} trees")
    
    # Build JS trees for main model
    main_trees_js = []
    for i, tree in enumerate(model_dump['tree_info']):
        tree_js = tree_to_js(tree['tree_structure'], FEATURES, indent=3)
        main_trees_js.append(f"    // Tree {i}\n    (function(f) {{\n{tree_js}\n    }})(f)")
    
    # Build JS trees for meta model (uses features + ml_prob as last feature)
    meta_features = FEATURES + ['ml_prob']
    meta_trees_js = []
    for i, tree in enumerate(meta_dump['tree_info']):
        tree_js = tree_to_js(tree['tree_structure'], meta_features, indent=3)
        meta_trees_js.append(f"    // Meta Tree {i}\n    (function(f) {{\n{tree_js}\n    }})(f)")

    js = f"""
// ── ML Model: {symbol} ──
// Trained on 4976 candles, tested on unseen future data
// Main model trees: {num_trees}, Meta trees: {num_meta_trees}
function predict_{symbol.replace('1000','k').replace('500','h')}(features: Record<string,number>): {{action:string, confidence:number, reason:string}} {{
  const f = [{', '.join([f'features["{ft}"] ?? 0' for ft in FEATURES])}];
  
  // Main model: sum all trees then sigmoid
  const mainScores = [
{chr(10).join(main_trees_js[:min(50, num_trees)])}
  ];
  const mainSum = mainScores.reduce((a,b) => a+b, 0);
  const mlProb = 1 / (1 + Math.exp(-mainSum));
  const pred = mlProb > 0.5 ? 1 : 0;
  
  // Meta model: should we take this trade?
  const mf = [{', '.join([f'features["{ft}"] ?? 0' for ft in FEATURES])}, mlProb];
  const metaScores = [
{chr(10).join(meta_trees_js[:min(50, num_meta_trees)])}
  ];
  const metaSum = metaScores.reduce((a,b) => a+b, 0);
  const metaConf = 1 / (1 + Math.exp(-metaSum));
  
  if (metaConf < 0.60) return {{action: "HOLD", confidence: 0, reason: `meta:${{metaConf.toFixed(2)}}`}};
  
  const action = pred === 1 ? "BUY" : "SELL";
  const confidence = Math.min(95, Math.round(metaConf * 100));
  return {{action, confidence, reason: `ML:{symbol} prob:${{mlProb.toFixed(2)}} meta:${{metaConf.toFixed(2)}}`}};
}}
"""
    return js

def main():
    all_js = []
    
    for sym in DEPLOY_SYMBOLS:
        mp = f"/workspaces/Timi-fx/ml/models/{sym}_model.txt"
        ep = f"/workspaces/Timi-fx/ml/models/{sym}_meta.txt"
        if not os.path.exists(mp):
            print(f"❌ {sym} model not found"); continue
        js = model_to_js(sym, mp, ep)
        all_js.append(js)

    # Router function
    router = """
// ── ML Signal Router ──
function getMLSignal(symbol: string, features: Record<string,number>): {action:string, confidence:number, reason:string} {
  const HOLD = {action:"HOLD", confidence:0, reason:"No ML model"};
  if (symbol === "BOOM1000")  return predict_BOOMk(features);
  if (symbol === "CRASH1000") return predict_CRASHk(features);
  if (symbol === "frxUSDJPY") return predict_frxUSDJPY(features);
  return HOLD;
}
"""
    all_js.append(router)
    
    output = "\n".join(all_js)
    out_path = "/workspaces/Timi-fx/ml/models/ml_models.ts"
    with open(out_path, 'w') as f:
        f.write(output)
    
    size_kb = os.path.getsize(out_path) / 1024
    print(f"\n✅ Exported to {out_path} ({size_kb:.0f}KB)")
    print("Ready to embed in edge function")
    
    # Check file size - edge functions have limits
    if size_kb > 500:
        print(f"⚠️  File is {size_kb:.0f}KB - may need to reduce trees")
    else:
        print(f"✅ Size OK for edge function deployment")

main()
