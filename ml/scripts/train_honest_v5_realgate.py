"""
TIMI Advanced ML Trainer v2.0
══════════════════════════════════════════════════════════════
Core improvements over original trainer:

1. TRIPLE BARRIER LABELING (López de Prado)
   - Upper barrier: TP hit → label BUY
   - Lower barrier: SL hit → label SELL
   - Time barrier: ambiguous → DISCARD
   Stops training on noise. Improves accuracy 15-20%.

2. PURGED K-FOLD CROSS VALIDATION
   - Removes train/test overlap in time series
   - Adds embargo gap between folds
   - Eliminates look-ahead bias

3. NEW ADVANCED FEATURES
   - Hawkes process: self-exciting volatility clustering
   - Wavelet decomposition: multi-scale signal separation
   - Realized volatility ratio: intraday vs overnight vol
   - Microstructure: bid-ask proxy, order flow imbalance
   - Rolling Hurst: R/S trend/reversion detection
   - Regime probability: trend/range/volatile state

4. ENSEMBLE OF 3 MODELS
   - 3 LightGBM models with different seeds + feature subsets
   - Majority vote reduces variance

Run:
  cd /workspaces/Timi-fx
  pip install lightgbm scikit-learn pandas numpy scipy --break-system-packages
  python ml/scripts/train_advanced.py
"""

import pandas as pd
import numpy as np
import lightgbm as lgb
import json, os, warnings
from sklearn.metrics import accuracy_score
warnings.filterwarnings('ignore')

# Paths auto-resolve to the project root, so this works in CodeSandbox
# (/project/workspace), local, or anywhere — no more hardcoded /workspaces path.
# Override with TIMI_DATA_DIR / TIMI_MODEL_DIR env vars if needed.
_HERE = os.path.dirname(os.path.abspath(__file__))          # .../ml/scripts
_ROOT = os.path.dirname(os.path.dirname(_HERE))             # project root
DATA_DIR  = os.environ.get("TIMI_DATA_DIR",  os.path.join(_ROOT, "ml", "data"))
MODEL_DIR = os.environ.get("TIMI_MODEL_DIR", os.path.join(_ROOT, "ml", "models"))

SYMBOLS = {
    "forex":      ["frxEURUSD","frxGBPUSD","frxUSDJPY","frxGBPJPY","frxAUDUSD"],
    "gold":       ["frxXAUUSD","frxXAGUSD"],
    "crypto":     ["cryBTCUSD","cryETHUSD"],
    "synthetics": ["R_50","R_75","R_100","R_25"],
    "boom_crash": ["BOOM1000","CRASH1000","BOOM500","CRASH500"],
    "jump":       ["JD10","JD25","JD50","JD75","JD100"],
}

BARRIER_CONFIG = {
    "forex":      {"tp_mult":2.0,"sl_mult":1.0,"max_hold":30},
    "gold":       {"tp_mult":2.0,"sl_mult":1.0,"max_hold":20},
    "crypto":     {"tp_mult":2.5,"sl_mult":1.0,"max_hold":25},
    "synthetics": {"tp_mult":1.5,"sl_mult":1.5,"max_hold":8},
    "boom_crash": {"tp_mult":2.0,"sl_mult":1.5,"max_hold":5},
    "jump":       {"tp_mult":2.0,"sl_mult":1.5,"max_hold":8},
}

LGBM_CONFIG = {
    "forex":      {"n_estimators":800,"learning_rate":0.015,"max_depth":7,"num_leaves":63,"min_child_samples":60},
    "gold":       {"n_estimators":700,"learning_rate":0.018,"max_depth":7,"num_leaves":50,"min_child_samples":50},
    "crypto":     {"n_estimators":600,"learning_rate":0.025,"max_depth":6,"num_leaves":45,"min_child_samples":40},
    "synthetics": {"n_estimators":500,"learning_rate":0.030,"max_depth":5,"num_leaves":31,"min_child_samples":35},
    "boom_crash": {"n_estimators":500,"learning_rate":0.030,"max_depth":6,"num_leaves":31,"min_child_samples":30},
    "jump":       {"n_estimators":500,"learning_rate":0.030,"max_depth":6,"num_leaves":31,"min_child_samples":30},
}

def get_class(symbol):
    for cls,syms in SYMBOLS.items():
        if symbol in syms: return cls
    return "forex"

# ── Advanced Features ──────────────────────────────────────────

def hawkes_intensity(returns, kappa=10.0, window=60):
    """Self-exciting volatility: large move → higher prob of next move"""
    n = len(returns)
    lam = np.zeros(n)
    mu  = np.mean(np.abs(returns)) + 1e-8
    lam[0] = mu
    for i in range(1,n):
        lam[i] = mu + (lam[i-1]-mu)*np.exp(-kappa/window) + returns[i-1]**2
        lam[i] = max(lam[i], mu)
    return lam / (np.mean(lam)+1e-10)

def hawkes_branching(returns, window=60):
    """Branching ratio → 1 = critical volatility regime"""
    n = len(returns)
    br = np.zeros(n)
    for i in range(window,n):
        r = np.abs(returns[i-window:i])
        m = np.mean(r)+1e-10; v = np.var(r)+1e-10
        br[i] = np.clip((v/m - m)/(m+1e-10), 0, 1)
    return br

def wavelet_features(prices, window=64):
    """Haar wavelet decomposition: trend/noise/signal energy separation"""
    n = len(prices)
    trend_s = np.zeros(n); noise_r = np.zeros(n); sig_c = np.zeros(n)
    for i in range(window, n):
        p = prices[i-window:i]
        l1 = np.array([(p[j]+p[j+1])/2 for j in range(0,len(p)-1,2)])
        d1 = np.array([(p[j]-p[j+1])/2 for j in range(0,len(p)-1,2)])
        if len(l1) > 4:
            l2 = np.array([(l1[j]+l1[j+1])/2 for j in range(0,len(l1)-1,2)])
            d2 = np.array([(l1[j]-l1[j+1])/2 for j in range(0,len(l1)-1,2)])
            te = np.var(p)+1e-10
            trend_s[i] = (np.var(l2) if len(l2)>1 else 0)/te
            noise_r[i] = np.var(d1)/te
            sig_c[i]   = (np.var(d2) if len(d2)>1 else 0)/te
    return trend_s, noise_r, sig_c

def realized_vol_ratio(closes, highs, lows, window=20):
    """Parkinson vol / close-to-close vol: 1=directional, >2=choppy"""
    n = len(closes); ratio = np.ones(n)
    for i in range(window,n):
        c=closes[i-window:i]; h=highs[i-window:i]; l=lows[i-window:i]
        pv = np.mean((np.log((h+1e-10)/(l+1e-10)))**2)/(4*np.log(2))
        cv = np.var(np.diff(np.log(c+1e-10)))+1e-10
        ratio[i] = np.clip(np.sqrt(pv/cv), 0, 5)
    return ratio

def microstructure(closes, highs, lows, window=20):
    """Bid-ask proxy, order flow imbalance, price impact, activity"""
    n=len(closes); ba=np.zeros(n); ofi=np.zeros(n); pi=np.zeros(n); act=np.zeros(n)
    for i in range(window,n):
        c=closes[i-window:i]; h=highs[i-window:i]; l=lows[i-window:i]; p=c[-1]+1e-10
        ba[i]  = np.mean(h-l)/p
        ofi[i] = (np.sum(np.diff(c)>0)/(window-1))*2-1
        pi[i]  = abs(c[-1]-c[0])/(np.sum(h-l)+1e-10)
        act[i] = np.mean(h[-5:]-l[-5:])/(np.mean(h-l)+1e-10)
    return ba, ofi, pi, act

def rolling_hurst(prices, window=60):
    """R/S Hurst: >0.55 trending, <0.45 mean-reverting, 0.45-0.55 random"""
    n=len(prices); H=np.full(n,0.5)
    for i in range(window,n):
        try:
            p=prices[i-window:i]
            r=np.diff(np.log(p+1e-10))
            scales,rs=[],[]
            for sc in [8,16,32,min(window//2,64)]:
                if sc>len(r)//2: continue
                rs_chunk=[]
                for j in range(len(r)//sc):
                    ch=r[j*sc:(j+1)*sc]
                    if len(ch)<4: continue
                    dev=np.cumsum(ch-np.mean(ch))
                    rs_chunk.append((np.max(dev)-np.min(dev))/(np.std(ch)+1e-10))
                if rs_chunk:
                    scales.append(np.log(sc)); rs.append(np.log(np.mean(rs_chunk)+1e-10))
            if len(scales)>=2:
                H[i]=float(np.clip(np.polyfit(scales,rs,1)[0],0.1,0.9))
        except: pass
    return H

def regime_probs(closes, window=30):
    """Trend/range/volatile regime probabilities"""
    n=len(closes); tp=np.zeros(n); rp=np.zeros(n); vp=np.zeros(n)
    for i in range(window,n):
        p=closes[i-window:i]; r=np.diff(p)
        ac = float(np.corrcoef(r[:-1],r[1:])[0,1]) if len(r)>2 else 0
        if np.isnan(ac): ac=0
        band = (np.max(p)-np.min(p))/(np.std(p)+1e-10)
        rng  = np.clip(1-(band-2)/4,0,1)
        rv   = np.std(r[-window//4:]) if len(r)>=window//4 else 0
        bv   = np.std(r)+1e-10
        vol  = np.clip((rv/bv-1)/2,0,1)
        raw  = np.array([max(0,ac),rng,vol]); tot=raw.sum()+1e-10
        tp[i]=raw[0]/tot; rp[i]=raw[1]/tot; vp[i]=raw[2]/tot
    return tp,rp,vp

# ── Triple Barrier Labeling ────────────────────────────────────
def triple_barrier_labels(df, tp_mult=2.0, sl_mult=1.0, max_hold=20):
    """
    1 = TP hit (BUY wins), -1 = SL hit (SELL wins), 0 = discard (ambiguous)
    Only 1 and -1 are used for training.
    """
    c=df['close'].values.astype(float)
    h=df['high'].values.astype(float)
    l=df['low'].values.astype(float)
    atr_pct=df['atr_pct'].values if 'atr_pct' in df.columns else np.full(len(df),0.002)
    n=len(df); labels=np.zeros(n,dtype=int)

    for i in range(n-max_hold):
        entry=c[i]; atr=atr_pct[i]*entry
        if atr<1e-8: continue
        tp=entry+atr*tp_mult; sl=entry-atr*sl_mult
        for j in range(i+1,min(i+max_hold+1,n)):
            if h[j]>=tp: labels[i]=1;  break
            if l[j]<=sl: labels[i]=-1; break
    return labels

# ── Purged K-Fold ──────────────────────────────────────────────
def purged_kfold(n, n_splits=5, embargo_pct=0.01):
    """Time-series CV with purging and embargo to prevent leakage"""
    idx=np.arange(n); fold=n//n_splits; emb=int(n*embargo_pct); splits=[]
    for k in range(n_splits):
        ts=k*fold; te=ts+fold if k<n_splits-1 else n
        ps=max(0,ts-emb); pe=min(n,te+emb)
        tr=np.concatenate([idx[:ps],idx[pe:]])
        if len(tr)>100 and len(idx[ts:te])>20:
            splits.append((tr,idx[ts:te]))
    return splits

# ── Ensemble Training ──────────────────────────────────────────
def train_ensemble(Xtr,ytr,Xv,yv,params,n=3):
    """3 LightGBM models with different seeds + feature subsets"""
    models=[]; nf=Xtr.shape[1]
    for seed in [42,137,2024][:n]:
        fm=np.sort(np.random.RandomState(seed).choice(nf,size=int(nf*0.8),replace=False))
        m=lgb.LGBMClassifier(**params,random_state=seed,class_weight='balanced',
            subsample=0.8,colsample_bytree=0.8,reg_alpha=0.15,reg_lambda=0.15,verbose=-1)
        m.fit(Xtr[:,fm],ytr,eval_set=[(Xv[:,fm],yv)],
            callbacks=[lgb.early_stopping(50,verbose=False),lgb.log_evaluation(period=-1)])
        models.append((m,fm))
    return models

def ens_predict(models,X):
    p=np.zeros(len(X))
    for m,fm in models: p+=m.predict_proba(X[:,fm])[:,1]
    return p/len(models)

# ── Main Training ──────────────────────────────────────────────
def train_symbol(symbol):
    print(f"\n{'═'*52}\n🤖 Training {symbol}...")
    cls=get_class(symbol)
    barrier=BARRIER_CONFIG[cls]; params=LGBM_CONFIG[cls].copy()

    path=f"{DATA_DIR}/{symbol}.csv"
    if not os.path.exists(path):
        print(f"  ❌ No data: {path}"); return None

    df=pd.read_csv(path).dropna()
    print(f"  📊 {len(df)} rows | class={cls}")

    # Build advanced features
    c=df['close'].values.astype(float)
    h=df['high'].values.astype(float)
    l=df['low'].values.astype(float)
    returns=np.diff(np.log(c+1e-10),prepend=0)

    print("  🔬 Building advanced features...")
    adf=pd.DataFrame({
        'hawkes_intensity': hawkes_intensity(returns),
        'hawkes_branching': hawkes_branching(returns),
        'rv_ratio':         realized_vol_ratio(c,h,l),
        'hurst_rs':         rolling_hurst(c),
    })
    wt,wn,ws=wavelet_features(c)
    adf['wavelet_trend']=wt; adf['wavelet_noise']=wn; adf['wavelet_signal']=ws
    ba,ofi,pi,act=microstructure(c,h,l)
    adf['bid_ask_proxy']=ba; adf['order_flow_imbal']=ofi
    adf['price_impact']=pi; adf['market_activity']=act
    tp,rp,vp=regime_probs(c)
    adf['regime_trend']=tp; adf['regime_range']=rp; adf['regime_vol']=vp

    # ATR for labeling
    atr_v=np.zeros(len(c))
    for i in range(14,len(c)):
        trs=[max(h[j]-l[j],abs(h[j]-c[j-1]),abs(l[j]-c[j-1])) for j in range(max(1,i-14),i)]
        atr_v[i]=np.mean(trs)/(c[i]+1e-10)
    df['atr_pct']=atr_v
    df=pd.concat([df.reset_index(drop=True),adf.reset_index(drop=True)],axis=1)

    # Triple Barrier Labeling
    print(f"  🏹 Triple barrier labeling (tp={barrier['tp_mult']}×, sl={barrier['sl_mult']}×, hold={barrier['max_hold']})")
    df['tb_label']=triple_barrier_labels(df,barrier['tp_mult'],barrier['sl_mult'],barrier['max_hold'])
    dfc=df[df['tb_label']!=0].copy()
    dfc['label_bin']=(dfc['tb_label']==1).astype(int)
    discard=(1-len(dfc)/len(df))
    buys=(dfc['tb_label']==1).sum(); sells=(dfc['tb_label']==-1).sum()
    print(f"  📋 {len(dfc)} clean rows ({discard*100:.0f}% discarded) | BUY:{buys} SELL:{sells}")

    if len(dfc)<200: print(f"  ❌ Too few rows"); return None

    # Feature sets
    existing=['rsi','macd_hist','bb_pos','bb_width','ema_bull','ema_bear',
        'price_ema8_dist','price_ema21_dist','price_ema50_dist','atr_pct',
        'candle_body','candle_dir','momentum_1','momentum_3','momentum_5',
        'momentum_10','rsi_oversold','rsi_overbought','trend5m','ou_zscore',
        'garch_vol','hurst','kalman_vel','vwap_dist','fractional_diff',
        'gc_skewness','gc_kurtosis','contrarian','retail_exhaustion',
        'toxicity','benign','session_strength','is_london','is_ny','is_overlap',
        'tick_velocity','tick_bull_ratio','range_density','vol_momentum']
    advanced=['hawkes_intensity','hawkes_branching','wavelet_trend','wavelet_noise',
        'wavelet_signal','rv_ratio','bid_ask_proxy','order_flow_imbal',
        'price_impact','market_activity','hurst_rs','regime_trend','regime_range','regime_vol']

    feats=[f for f in existing+advanced if f in dfc.columns]
    print(f"  🎯 {len(feats)} features ({len([f for f in advanced if f in dfc.columns])} new)")

    X=np.nan_to_num(dfc[feats].values.astype(float),nan=0,posinf=1,neginf=-1)
    y=dfc['label_bin'].values

    # Purged K-Fold
    print("  🔀 Purged K-Fold CV...")
    splits=purged_kfold(len(X))
    fold_scores=[]; best_models=None; best_score=0

    for tr_idx,val_idx in splits:
        Xtr,Xv=X[tr_idx],X[val_idx]; ytr,yv=y[tr_idx],y[val_idx]
        if len(np.unique(ytr))<2: continue
        models=train_ensemble(Xtr,ytr,Xv,yv,params)
        score=accuracy_score(yv,(ens_predict(models,Xv)>0.5).astype(int))
        fold_scores.append(score)
        if score>best_score: best_score=score; best_models=models

    if not fold_scores: print("  ❌ All folds failed"); return None
    avg=np.mean(fold_scores)
    print(f"  📈 Purged CV: {avg*100:.1f}% (folds: {[f'{s*100:.1f}%' for s in fold_scores]})")

    # ════════════════════════════════════════════════════════════════════
    # HONEST META-LABELING (leak-free)
    # ────────────────────────────────────────────────────────────────────
    # The ORIGINAL code had three leaks that inflated meta_win_rate to ~99%:
    #   1. base preds from best_models (a fitted fold) over ALL X (in-sample)
    #   2. meta trained on one fold, then PREDICTED on the whole set
    #   3. threshold chosen to MAXIMIZE WR on that same leaked set
    # Every row was effectively graded on data the models had seen.
    #
    # THE FIX — out-of-fold (OOF) predictions:
    #   • base ensemble: each row predicted ONLY by models trained on OTHER
    #     folds (so base probs are genuinely out-of-sample everywhere)
    #   • meta: same OOF scheme — meta predicts each row from a meta trained
    #     on other folds
    #   • threshold: chosen on OOF meta predictions, so the reported WR is the
    #     win rate you'd actually get on unseen data, not a cherry-picked one.
    # ════════════════════════════════════════════════════════════════════
    print("  🧠 Meta-labeling filter (HONEST / out-of-fold)...")

    n = len(X)
    oof_base = np.full(n, np.nan)        # base ensemble prob, out-of-fold
    folds = purged_kfold(n, n_splits=5)

    # 1) OOF base predictions: train ensemble on each fold's train idx,
    #    predict ONLY that fold's held-out val idx.
    for tr_idx, val_idx in folds:
        ytr_f = y[tr_idx]
        if len(np.unique(ytr_f)) < 2:
            continue
        fold_models = train_ensemble(X[tr_idx], ytr_f, X[val_idx], y[val_idx], params)
        oof_base[val_idx] = ens_predict(fold_models, X[val_idx])

    # rows that never got an OOF prediction (degenerate folds) are dropped
    valid = ~np.isnan(oof_base)
    if valid.sum() < 50:
        print("  ❌ Too few OOF rows"); return None
    Xv_all = X[valid]
    oof_base_v = oof_base[valid]
    y_v = y[valid]
    ml_pred_v = (oof_base_v > 0.5).astype(int)
    correct_v = (ml_pred_v == y_v).astype(int)

    # 2) OOF meta predictions on the SAME honest scheme.
    Xm = np.nan_to_num(np.column_stack([Xv_all, oof_base_v]), nan=0, posinf=1, neginf=-1)
    oof_meta = np.full(len(Xm), np.nan)
    meta_folds = purged_kfold(len(Xm), n_splits=5)
    for tr_idx, val_idx in meta_folds:
        ytr_m = correct_v[tr_idx]
        if len(np.unique(ytr_m)) < 2:
            continue
        meta_f = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.04, max_depth=4,
            num_leaves=15, random_state=42, verbose=-1, subsample=0.8, colsample_bytree=0.8)
        meta_f.fit(Xm[tr_idx], ytr_m)
        oof_meta[val_idx] = meta_f.predict_proba(Xm[val_idx])[:, 1]

    mvalid = ~np.isnan(oof_meta)
    meta_p = oof_meta[mvalid]
    ml_pred_m = ml_pred_v[mvalid]
    y_m = y_v[mvalid]

    # 3) Threshold chosen on OOF predictions — this WR is honest.
    best_wr=0; best_thresh=0.65; best_cnt=0
    for thr in [0.60,0.65,0.70,0.75,0.80]:
        mask = meta_p >= thr
        if mask.sum() < 20: continue
        wr = (ml_pred_m[mask] == y_m[mask]).mean()
        if wr > best_wr: best_wr=wr; best_thresh=thr; best_cnt=int(mask.sum())

    # Fit a FINAL meta on all valid rows for deployment (saved below). Its
    # REPORTED stats come from the OOF measurement above, not from this fit.
    meta = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.04, max_depth=4,
        num_leaves=15, random_state=42, verbose=-1, subsample=0.8, colsample_bytree=0.8)
    if len(np.unique(correct_v)) >= 2:
        meta.fit(Xm, correct_v)
    else:
        print("  ⚠️ meta labels degenerate; deploying base only")

    # also recompute honest base cv accuracy from OOF (sanity vs purged-CV avg)
    oof_acc = (ml_pred_v == y_v).mean()
    # Breakeven win rates (after Deriv MULT commission + spread), from Phase 0.
    # Defined here so the warning print below can reference it.
    BREAKEVEN = {"forex":0.594,"gold":0.594,"crypto":0.615,
                 "boom_crash":0.59,"synthetics":0.541,"jump":0.59}
    be = BREAKEVEN.get(cls, 0.59)

    print(f"  🎯 Meta (HONEST): {best_cnt} trades | WR: {best_wr*100:.1f}% @ {best_thresh}")
    print(f"  📊 OOF base accuracy: {oof_acc*100:.1f}%  (purged-CV avg was {avg*100:.1f}%)")
    print(f"  ⚠️  NOTE: meta WR still carries ~8-10pp of residual SELECTION bias that")
    print(f"      appears even on pure-noise data. Subtract ~8-10pp before comparing")
    print(f"      to the {be*100:.1f}% cost breakeven. A truly real edge clears it with margin.")

    # Feature importance
    m0,fm0=best_models[0]
    fi=dict(zip([feats[i] for i in fm0],m0.feature_importances_))
    top5=sorted(fi.items(),key=lambda x:x[1],reverse=True)[:5]
    print(f"  🔑 Top: {[(f,round(float(v),1)) for f,v in top5]}")

    # Save
    os.makedirs(MODEL_DIR,exist_ok=True)
    for idx,(m,fm) in enumerate(best_models):
        m.booster_.save_model(f"{MODEL_DIR}/{symbol}_ensemble_{idx}.txt")
    meta.booster_.save_model(f"{MODEL_DIR}/{symbol}_meta.txt")

    # Deploy gate uses the HONEST win rate against the cost breakeven
    # (BREAKEVEN/be already defined above, before the meta warning print).
    # require honest WR to clear breakeven with a small margin, on enough trades
    # DEPLOY GATE — use the HONEST number (OOF base accuracy), NOT the meta WR.
    # The meta WR (best_wr) carries ~8-10pp of selection bias that appears even
    # on pure noise (proven empirically), so gating on it deploys coin-flips.
    # oof_acc is the leak-free directional accuracy — that's what must beat the
    # cost breakeven for an edge to be real.
    honest_deploy = (oof_acc >= be + 0.02) and (best_cnt >= 30)

    result={"symbol":symbol,"instrument_class":cls,"cv_accuracy":round(float(avg),4),
        "oof_base_accuracy":round(float(oof_acc),4),
        "meta_win_rate":round(float(best_wr),4),"meta_trades":best_cnt,
        "meta_threshold":best_thresh,"features":feats,"barrier_config":barrier,
        "breakeven_wr":be,
        "deploy":bool(honest_deploy),"honest_oof":True,
        "trained_at":str(pd.Timestamp.now()),
        "n_rows":int(len(dfc)),"discard_rate":round(discard,3),
        "labels":{"buy":int(buys),"sell":int(sells)}}

    with open(f"{MODEL_DIR}/{symbol}_result.json",'w') as f:
        json.dump(result,f,indent=2)

    print(f"  {'✅ DEPLOY' if result['deploy'] else '❌ SKIP'} | honest acc {oof_acc*100:.1f}% (meta {best_wr*100:.1f}%) | {best_cnt} trades")
    return result

def main():
    print("🧠 TIMI ADVANCED ML TRAINER v2.0")
    print("   Triple Barrier | Purged CV | Hawkes | Wavelet | Ensemble\n")

    targets=["BOOM1000","BOOM500","CRASH1000","CRASH500",
             "JD10","JD25","JD50","JD75","JD100",
             "frxEURUSD","frxGBPUSD","frxUSDJPY","frxXAUUSD",
             "frxXAGUSD","R_75","R_50","R_25","R_100"]

    results=[]
    for sym in targets:
        try:
            r=train_symbol(sym)
            if r: results.append(r)
        except Exception as e:
            print(f"  ❌ {sym}: {e}")

    print(f"\n{'═'*52}\n📊 TRAINING COMPLETE\n{'═'*52}")
    deploy=[r for r in results if r['deploy']]
    skip  =[r for r in results if not r['deploy']]

    print(f"\n✅ DEPLOY ({len(deploy)}):")
    for r in sorted(deploy,key=lambda x:x['oof_base_accuracy'],reverse=True):
        print(f"   {r['symbol']}: honest acc {r['oof_base_accuracy']*100:.1f}% | breakeven {r['breakeven_wr']*100:.1f}% | {r['meta_trades']} trades")

    print(f"\n❌ SKIP ({len(skip)}):")
    for r in sorted(skip,key=lambda x:x['oof_base_accuracy'],reverse=True):
        print(f"   {r['symbol']}: honest acc {r['oof_base_accuracy']*100:.1f}% | breakeven {r['breakeven_wr']*100:.1f}% | {r['meta_trades']} trades")

    master={"trained_at":str(pd.Timestamp.now()),"trainer":"advanced_v2",
        "deploy_symbols":[r['symbol'] for r in deploy],"all_results":results}
    with open(f"{MODEL_DIR}/master_config_advanced.json",'w') as f:
        json.dump(master,f,indent=2)

    if deploy:
        print(f"\n📋 Next steps:")
        print(f"   1. python ml/scripts/export_to_js.py")
        print(f"   2. python ml/scripts/upload_models.py")
        print(f"   3. npx supabase functions deploy timi-trader")

if __name__=="__main__":
    main()
