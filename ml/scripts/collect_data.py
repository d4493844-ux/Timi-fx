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

def kalman_filter(prices: np.ndarray, process_noise=1e-5, measurement_noise=1e-2):
    """
    1D Kalman Filter for price smoothing.
    Returns filtered prices and velocity (rate of change).
    process_noise  Q — how much the true price can change per step
    measurement_noise R — how noisy the observed price is
    """
    n = len(prices)
    filtered  = np.zeros(n)
    velocity  = np.zeros(n)

    # State: [price, velocity]
    x = np.array([prices[0], 0.0])
    P = np.eye(2) * 1.0  # initial covariance

    # State transition: price += velocity each step
    F = np.array([[1, 1],
                  [0, 1]])
    # Observation: we only observe price
    H = np.array([[1, 0]])
    Q = np.eye(2) * process_noise   # process noise
    R = np.array([[measurement_noise]])  # measurement noise

    for i in range(n):
        # Predict
        x = F @ x
        P = F @ P @ F.T + Q

        # Update
        y  = prices[i] - (H @ x)[0]        # innovation
        S  = H @ P @ H.T + R               # innovation covariance
        K  = P @ H.T @ np.linalg.inv(S)   # Kalman gain
        x  = x + K.flatten() * y
        P  = (np.eye(2) - K @ H) @ P

        filtered[i] = x[0]
        velocity[i] = x[1]

    return filtered, velocity

def engineer_features(df):
    c = df['close'].values
    h = df['high'].values
    l = df['low'].values

    # ── ORIGINAL 21 FEATURES ──

    # EMAs
    for p in [8, 21, 50, 200]:
        k = 2 / (p + 1)
        ema = [c[0]]
        for i in range(1, len(c)):
            ema.append(c[i] * k + ema[-1] * (1 - k))
        df[f'ema{p}'] = ema

    # RSI
    deltas = np.diff(c, prepend=c[0])
    gains  = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    avg_gain = pd.Series(gains).rolling(14).mean().values
    avg_loss = pd.Series(losses).rolling(14).mean().values
    rs = avg_gain / (avg_loss + 1e-10)
    df['rsi'] = 100 - (100 / (1 + rs))

    # MACD
    df['macd_hist'] = df['ema8'].values - df['ema21'].values

    # Bollinger Bands
    df['bb_mid']   = pd.Series(c).rolling(20).mean()
    df['bb_std']   = pd.Series(c).rolling(20).std()
    df['bb_upper'] = df['bb_mid'] + 2 * df['bb_std']
    df['bb_lower'] = df['bb_mid'] - 2 * df['bb_std']
    df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_mid']
    df['bb_pos']   = (c - df['bb_lower'].values) / (df['bb_upper'].values - df['bb_lower'].values + 1e-10)

    # ATR
    tr = np.maximum(h - l, np.maximum(np.abs(h - np.roll(c, 1)), np.abs(l - np.roll(c, 1))))
    df['atr']     = pd.Series(tr).rolling(14).mean()
    df['atr_pct'] = df['atr'] / c

    # Price relative to EMAs
    df['price_ema8_dist']  = (c - df['ema8'].values)  / df['ema8'].values
    df['price_ema21_dist'] = (c - df['ema21'].values) / df['ema21'].values
    df['price_ema50_dist'] = (c - df['ema50'].values) / df['ema50'].values

    # EMA alignment
    df['ema_bull'] = ((df['ema8'] > df['ema21']) & (df['ema21'] > df['ema50'])).astype(int)
    df['ema_bear'] = ((df['ema8'] < df['ema21']) & (df['ema21'] < df['ema50'])).astype(int)

    # Candle features
    df['candle_body']    = (c - np.roll(c, 1)) / (np.roll(c, 1) + 1e-10)
    df['candle_dir']     = np.sign(df['candle_body'])
    df['high_low_range'] = (h - l) / (l + 1e-10)

    # Momentum
    for lag in [1, 3, 5, 10]:
        df[f'momentum_{lag}'] = (c - np.roll(c, lag)) / (np.roll(c, lag) + 1e-10)

    # RSI zones
    df['rsi_oversold']  = (df['rsi'] < 35).astype(int)
    df['rsi_overbought']= (df['rsi'] > 65).astype(int)
    df['rsi_neutral']   = ((df['rsi'] >= 45) & (df['rsi'] <= 55)).astype(int)

    # ── 6 NEW KALMAN FEATURES (added on top, EMA kept) ──
    kf_price, kf_vel = kalman_filter(c, process_noise=1e-5, measurement_noise=1e-2)

    # 1. How far raw price deviates from Kalman estimate (noise measure)
    df['kalman_price_vs_raw']   = (c - kf_price) / (kf_price + 1e-10)

    # 2. Kalman velocity — rate of change of filtered price (trend speed)
    df['kalman_velocity']       = kf_vel / (kf_price + 1e-10)

    # 3. Kalman trend direction — cleaner than EMA cross
    df['kalman_trend_dir']      = np.sign(kf_vel)

    # 4. Kalman noise ratio — high = ranging/noisy market
    #    Rolling std of (price - kalman) / kalman
    residuals = (c - kf_price) / (kf_price + 1e-10)
    df['kalman_noise_ratio']    = pd.Series(residuals).rolling(20).std().fillna(0).values

    # 5. Kalman-EMA8 agreement — does Kalman trend agree with EMA8 direction?
    ema8_dir = np.sign(df['ema8'].values - df['ema21'].values)
    df['kalman_ema_agreement']  = (np.sign(kf_vel) == ema8_dir).astype(float)

    # 6. Kalman acceleration — is the trend speeding up or slowing down?
    df['kalman_acceleration']   = np.gradient(kf_vel) / (np.abs(kf_price) + 1e-10)

    return df

def label_trades(df, lookahead=4):
    closes = df['close'].values
    labels = []
    for i in range(len(closes)):
        if i + lookahead >= len(closes):
            labels.append(np.nan)
        else:
            future  = closes[i + lookahead]
            current = closes[i]
            labels.append(1 if future > current else 0)
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
    df['close'] = df['close'].astype(float)
    df['high']  = df['high'].astype(float)
    df['low']   = df['low'].astype(float)
    df['open']  = df['open'].astype(float)
    df['epoch'] = df['epoch'].astype(int)

    df = engineer_features(df)
    df = label_trades(df, lookahead=4)
    df = df.dropna()
    df['symbol'] = symbol

    # Add 5m trend feature
    if len(candles_5m) > 50:
        df5 = pd.DataFrame(candles_5m)
        df5['close'] = df5['close'].astype(float)
        df5['epoch'] = df5['epoch'].astype(int)
        c5 = df5['close'].values
        k20 = 2/21; k50 = 2/51
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
    print("🔬 TIMI ML DATA COLLECTOR — 27 FEATURES (21 + 6 Kalman)")
    print(f"Collecting {len(SYMBOLS)} symbols...\n")
    results = []
    for sym in SYMBOLS:
        df = await collect_symbol(sym)
        if df is not None:
            results.append(sym)
        await asyncio.sleep(2)
    print(f"\n✅ Done! Collected: {results}")
    print(f"📁 Files saved to /workspaces/Timi-fx/ml/data/")

asyncio.run(main())
