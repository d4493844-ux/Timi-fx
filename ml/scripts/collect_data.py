import asyncio
import json
import websockets
import pandas as pd
import numpy as np
from datetime import datetime
import os

SYMBOLS = [
    "BOOM500", "CRASH500", "frxUSDJPY", "cryBTCUSD",
    "BOOM1000", "CRASH1000", "R_25", "R_75", "R_50", "R_100",
    "frxEURUSD", "frxGBPUSD", "frxXAUUSD", "cryETHUSD",
    "frxEURGBP", "frxXAGUSD"
]

async def fetch_candles(symbol, granularity=60, count=4999):
    url = "wss://ws.derivws.com/websockets/v3?app_id=1089"
    try:
        async with websockets.connect(url, ping_interval=None) as ws:
            await ws.send(json.dumps({
                "ticks_history": symbol,
                "adjust_start_time": 1,
                "count": count,
                "end": "latest",
                "granularity": granularity,
                "style": "candles"
            }))
            while True:
                msg = json.loads(await asyncio.wait_for(ws.recv(), timeout=20))
                if "candles" in msg:
                    return msg["candles"]
                if "error" in msg:
                    print(f"  Error: {msg['error']['message']}")
                    return []
    except Exception as e:
        print(f"  Exception: {e}")
        return []

def kalman_filter(prices, process_noise=1e-5, measurement_noise=1e-2):
    n = len(prices)
    filtered = np.zeros(n)
    velocity = np.zeros(n)
    x0, x1 = prices[0], 0.0
    p00, p01, p10, p11 = 1.0, 0.0, 0.0, 1.0
    for i in range(n):
        px0 = x0 + x1; px1 = x1
        pp00 = p00 + p10 + p01 + p11 + process_noise
        pp01 = p01 + p11; pp10 = p10 + p11
        pp11 = p11 + process_noise
        S = pp00 + measurement_noise
        k0 = pp00 / S; k1 = pp10 / S
        inn = prices[i] - px0
        x0 = px0 + k0 * inn; x1 = px1 + k1 * inn
        p00 = pp00 - k0 * pp00; p01 = pp01 - k0 * pp01
        p10 = pp10 - k1 * pp00; p11 = pp11 - k1 * pp01
        filtered[i] = x0; velocity[i] = x1
    return filtered, velocity

def garch_volatility(returns, omega=1e-6, alpha=0.1, beta=0.85, window=20):
    """GARCH(1,1) estimated conditional volatility"""
    n = len(returns)
    var = np.zeros(n)
    var[0] = np.var(returns[:window]) if len(returns) >= window else 1e-8
    for i in range(1, n):
        var[i] = omega + alpha * returns[i-1]**2 + beta * var[i-1]
    return np.sqrt(var)

def ornstein_uhlenbeck_features(prices, window=20):
    """
    OU Process features:
    - mean reversion speed (theta)
    - long-run mean (mu)  
    - deviation from mean (z-score)
    - estimated reversion time in candles
    """
    n = len(prices)
    theta_arr  = np.zeros(n)
    mu_arr     = np.zeros(n)
    zscore_arr = np.zeros(n)
    rev_time   = np.zeros(n)

    for i in range(window, n):
        p = prices[i-window:i]
        mu = np.mean(p)
        std = np.std(p) + 1e-10

        # OU regression: dp = theta*(mu - p)*dt + sigma*dW
        # Estimate theta via OLS on (p[t] - p[t-1]) = theta*(mu - p[t-1])
        y = np.diff(p)
        x = mu - p[:-1]
        if np.sum(x**2) > 1e-12:
            theta = np.dot(x, y) / np.sum(x**2)
            theta = max(0.0, min(theta, 5.0))  # clamp
        else:
            theta = 0.0

        theta_arr[i]  = theta
        mu_arr[i]     = mu
        zscore_arr[i] = (prices[i] - mu) / std
        rev_time[i]   = 1.0 / (theta + 1e-6) if theta > 0.01 else window

    return theta_arr, mu_arr, zscore_arr, rev_time

def vwap_features(df, window=20):
    """
    VWAP proxy (no real volume — use candle range as volume proxy)
    Price above VWAP = bullish, below = bearish
    """
    c = df['close'].values
    h = df['high'].values
    l = df['low'].values
    # Typical price
    tp = (h + l + c) / 3
    # Range as volume proxy (wider candle = more activity)
    range_vol = (h - l) + 1e-10
    # Rolling VWAP
    vwap = np.zeros(len(c))
    vwap_dist = np.zeros(len(c))
    for i in range(window, len(c)):
        tp_w   = tp[i-window:i]
        rv_w   = range_vol[i-window:i]
        vwap[i]      = np.sum(tp_w * rv_w) / np.sum(rv_w)
        vwap_dist[i] = (c[i] - vwap[i]) / (vwap[i] + 1e-10)
    return vwap, vwap_dist

def session_features(epochs):
    """
    Session-aware features — bot learns market behavior per session
    Sessions: Asian(0-7), London(7-16), NY(12-21), Overlap(12-16), Night(21-24)
    """
    n = len(epochs)
    is_asian   = np.zeros(n)
    is_london  = np.zeros(n)
    is_ny      = np.zeros(n)
    is_overlap = np.zeros(n)  # London+NY overlap — best session
    is_night   = np.zeros(n)
    session_strength = np.zeros(n)

    for i, epoch in enumerate(epochs):
        h = (epoch // 3600) % 24  # UTC hour
        if 0 <= h < 7:
            is_asian[i] = 1
            session_strength[i] = 0.3  # low activity
        elif 7 <= h < 12:
            is_london[i] = 1
            session_strength[i] = 0.7  # good activity
        elif 12 <= h < 16:
            is_london[i] = 1
            is_ny[i] = 1
            is_overlap[i] = 1
            session_strength[i] = 1.0  # BEST — overlap
        elif 16 <= h < 21:
            is_ny[i] = 1
            session_strength[i] = 0.8  # good activity
        else:
            is_night[i] = 1
            session_strength[i] = 0.2  # very low

    return is_asian, is_london, is_ny, is_overlap, is_night, session_strength

def engineer_features(df):
    c = df['close'].values
    h = df['high'].values
    l = df['low'].values
    epochs = df['epoch'].values

    # ── ORIGINAL EMA/RSI/MACD/BB/ATR (kept) ──
    for p in [8, 21, 50, 200]:
        k = 2 / (p + 1)
        ema = [c[0]]
        for i in range(1, len(c)):
            ema.append(c[i] * k + ema[-1] * (1 - k))
        df[f'ema{p}'] = ema

    deltas = np.diff(c, prepend=c[0])
    gains  = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = pd.Series(gains).rolling(14).mean().values
    avg_loss = pd.Series(losses).rolling(14).mean().values
    df['rsi'] = 100 - (100 / (1 + avg_gain / (avg_loss + 1e-10)))
    df['macd_hist'] = df['ema8'].values - df['ema21'].values

    df['bb_mid']   = pd.Series(c).rolling(20).mean()
    df['bb_std']   = pd.Series(c).rolling(20).std()
    df['bb_upper'] = df['bb_mid'] + 2 * df['bb_std']
    df['bb_lower'] = df['bb_mid'] - 2 * df['bb_std']
    df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_mid']
    df['bb_pos']   = (c - df['bb_lower'].values) / (df['bb_upper'].values - df['bb_lower'].values + 1e-10)

    tr = np.maximum(h - l, np.maximum(np.abs(h - np.roll(c,1)), np.abs(l - np.roll(c,1))))
    df['atr']     = pd.Series(tr).rolling(14).mean()
    df['atr_pct'] = df['atr'] / c

    df['price_ema8_dist']  = (c - df['ema8'].values)  / df['ema8'].values
    df['price_ema21_dist'] = (c - df['ema21'].values) / df['ema21'].values
    df['price_ema50_dist'] = (c - df['ema50'].values) / df['ema50'].values
    df['ema_bull'] = ((df['ema8'] > df['ema21']) & (df['ema21'] > df['ema50'])).astype(int)
    df['ema_bear'] = ((df['ema8'] < df['ema21']) & (df['ema21'] < df['ema50'])).astype(int)
    df['candle_body']    = (c - np.roll(c,1)) / (np.roll(c,1) + 1e-10)
    df['candle_dir']     = np.sign(df['candle_body'])
    df['high_low_range'] = (h - l) / (l + 1e-10)
    for lag in [1,3,5,10]:
        df[f'momentum_{lag}'] = (c - np.roll(c,lag)) / (np.roll(c,lag) + 1e-10)
    df['rsi_oversold']  = (df['rsi'] < 35).astype(int)
    df['rsi_overbought']= (df['rsi'] > 65).astype(int)
    df['rsi_neutral']   = ((df['rsi'] >= 45) & (df['rsi'] <= 55)).astype(int)

    # ── KALMAN (6 features) ──
    kf_price, kf_vel = kalman_filter(c)
    df['kalman_price_vs_raw']  = (c - kf_price) / (kf_price + 1e-10)
    df['kalman_velocity']      = kf_vel / (kf_price + 1e-10)
    df['kalman_trend_dir']     = np.sign(kf_vel)
    residuals = pd.Series((c - kf_price) / (kf_price + 1e-10))
    df['kalman_noise_ratio']   = residuals.rolling(20).std().fillna(0).values
    ema8_dir = np.sign(df['ema8'].values - df['ema21'].values)
    df['kalman_ema_agreement'] = (np.sign(kf_vel) == ema8_dir).astype(float)
    df['kalman_acceleration']  = np.gradient(kf_vel) / (np.abs(kf_price) + 1e-10)

    # ── GARCH (2 features) ──
    returns = np.diff(c, prepend=c[0]) / (c + 1e-10)
    garch_vol = garch_volatility(returns)
    df['garch_vol']         = garch_vol
    df['realized_vs_garch'] = (df['atr_pct'].values - garch_vol) / (garch_vol + 1e-10)

    # ── ORNSTEIN-UHLENBECK (4 features) ──
    theta, mu_ou, zscore, rev_time = ornstein_uhlenbeck_features(c)
    df['ou_theta']     = theta       # mean reversion speed
    df['ou_zscore']    = zscore      # how far from mean (normalized)
    df['ou_rev_time']  = np.clip(rev_time, 0, 50) / 50  # normalized reversion time
    df['ou_mean_dist'] = (c - mu_ou) / (mu_ou + 1e-10)  # distance from OU mean

    # ── VWAP (2 features) ──
    _, vwap_dist = vwap_features(df)
    df['vwap_dist']      = vwap_dist   # price distance from VWAP
    df['vwap_direction'] = np.sign(vwap_dist)  # above=1, below=-1

    # ── SESSION (6 features) ──
    is_asian, is_london, is_ny, is_overlap, is_night, sess_strength = session_features(epochs)
    df['session_asian']    = is_asian
    df['session_london']   = is_london
    df['session_ny']       = is_ny
    df['session_overlap']  = is_overlap
    df['session_night']    = is_night
    df['session_strength'] = sess_strength

    return df

def label_trades(df, lookahead=4):
    closes = df['close'].values
    labels = []
    for i in range(len(closes)):
        if i + lookahead >= len(closes):
            labels.append(np.nan)
        else:
            labels.append(1 if closes[i+lookahead] > closes[i] else 0)
    df['label'] = labels
    df['label_strength'] = abs(df['close'].shift(-lookahead) - df['close']) / df['close']
    return df

async def collect_symbol(symbol):
    print(f"\n📥 Collecting {symbol}...")
    candles_1m = await fetch_candles(symbol, 60, 4999)
    await asyncio.sleep(1)
    candles_5m = await fetch_candles(symbol, 300, 1000)

    if len(candles_1m) < 200:
        print(f"  ❌ Not enough data ({len(candles_1m)} candles)")
        return None

    print(f"  ✅ Got {len(candles_1m)} x 1m, {len(candles_5m)} x 5m candles")

    df = pd.DataFrame(candles_1m)
    for col in ['close','high','low','open']:
        df[col] = df[col].astype(float)
    df['epoch'] = df['epoch'].astype(int)

    df = engineer_features(df)
    df = label_trades(df, lookahead=4)
    df = df.dropna()
    df['symbol'] = symbol

    # 5m trend
    if len(candles_5m) > 50:
        df5 = pd.DataFrame(candles_5m)
        df5['close'] = df5['close'].astype(float)
        df5['epoch'] = df5['epoch'].astype(int)
        c5 = df5['close'].values
        k20=2/21; k50=2/51
        ema20=[c5[0]]; ema50=[c5[0]]
        for i in range(1,len(c5)):
            ema20.append(c5[i]*k20+ema20[-1]*(1-k20))
            ema50.append(c5[i]*k50+ema50[-1]*(1-k50))
        df5['ema20_5m']=ema20; df5['ema50_5m']=ema50
        df5['trend5m'] = np.where(df5['ema20_5m']>df5['ema50_5m'],1,-1)
        df5 = df5[['epoch','trend5m']].sort_values('epoch')
        df  = df.sort_values('epoch')
        df  = pd.merge_asof(df, df5, on='epoch', direction='backward')
    else:
        df['trend5m'] = 0

    path = f"/workspaces/Timi-fx/ml/data/{symbol}.csv"
    df.to_csv(path, index=False)
    print(f"  💾 Saved {len(df)} rows → {path}")
    return df

async def main():
    print("🔬 TIMI ML DATA COLLECTOR — 41 FEATURES")
    print("Features: 21 base + 6 Kalman + 2 GARCH + 4 OU + 2 VWAP + 6 Session")
    print(f"Collecting {len(SYMBOLS)} symbols...\n")
    results = []
    for sym in SYMBOLS:
        df = await collect_symbol(sym)
        if df is not None:
            results.append(sym)
        await asyncio.sleep(2)
    print(f"\n✅ Done! Collected: {results}")

asyncio.run(main())
