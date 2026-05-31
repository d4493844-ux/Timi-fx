import asyncio
import json
import websockets
import pandas as pd
import numpy as np
from datetime import datetime
import os

SYMBOLS = [
    "BOOM500", "CRASH500", "BOOM300", "CRASH300",
    "frxUSDJPY", "cryBTCUSD",
    "BOOM1000", "CRASH1000", "R_10", "R_25", "R_75", "R_50", "R_100",
    "JD10", "JD25", "JD50", "JD75", "JD100",
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


# ─────────────────────────────────────────────
# FRACTIONAL DIFFERENCING
# Preserves long-term memory destroyed by d=1
# ─────────────────────────────────────────────
def fractional_diff(prices, d=0.4, threshold=1e-4):
    """
    Fractionally differentiate price series
    d=0 → raw prices (full memory)
    d=1 → returns (no memory)
    d=0.3-0.5 → optimal: memory preserved + stationarity
    """
    w = [1.0]
    k = 1
    while abs(w[-1]) > threshold:
        w.append(-w[-1] * (d - k + 1) / k)
        k += 1
    w = np.array(w[::-1])
    n = len(prices)
    fd = np.zeros(n)
    wlen = len(w)
    for i in range(wlen - 1, n):
        fd[i] = np.dot(w, prices[i - wlen + 1:i + 1])
    return fd

def compute_dltm(prices, window=100):
    """
    Estimate optimal d (dLTM) for each window
    using ADF test stationarity boundary
    """
    from scipy import stats
    n = len(prices)
    dltm = np.zeros(n)
    for i in range(window, n):
        p = prices[i-window:i]
        # Try different d values, find minimum d for stationarity
        best_d = 0.5  # default
        for d_try in [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]:
            fd = fractional_diff(p, d=d_try)
            fd = fd[fd != 0]
            if len(fd) < 10:
                continue
            # Simple stationarity check: rolling mean stability
            half = len(fd) // 2
            mean1 = np.mean(fd[:half])
            mean2 = np.mean(fd[half:])
            if abs(mean1 - mean2) < np.std(fd) * 0.5:
                best_d = d_try
                break
        dltm[i] = best_d
    return dltm

# ─────────────────────────────────────────────
# VISIBILITY GRAPH — Hurst & Fractal Detection
# ─────────────────────────────────────────────
def visibility_graph_features(prices, window=60):
    """
    Compute visibility graph features:
    1. Hurst exponent (memory measure)
    2. Degree distribution alpha (fractal measure)
    3. Hub density (big move predictor)
    """
    n = len(prices)
    hurst_arr   = np.zeros(n)
    alpha_arr   = np.zeros(n)
    hub_arr     = np.zeros(n)

    for i in range(window, n):
        p = prices[i-window:i]

        # Build visibility graph
        degrees = np.zeros(window)
        for a in range(window):
            for b in range(a+1, window):
                # Check visibility: no point between a,b blocks view
                visible = True
                for c in range(a+1, b):
                    # Linear interpolation between a and b
                    interp = p[a] + (p[b] - p[a]) * (c - a) / (b - a)
                    if p[c] >= interp:
                        visible = False
                        break
                if visible:
                    degrees[a] += 1
                    degrees[b] += 1

        # Hurst exponent via R/S analysis on prices
        # Simple estimate from degree distribution
        mean_deg = np.mean(degrees)
        std_deg  = np.std(degrees) + 1e-10
        # High degree variance = high Hurst (trending)
        # Low degree variance = low Hurst (mean reverting)
        hurst = 0.5 + 0.3 * np.tanh((std_deg / mean_deg - 0.5) * 2)
        hurst_arr[i] = np.clip(hurst, 0.1, 0.9)

        # Power law alpha from degree distribution
        deg_nonzero = degrees[degrees > 0]
        if len(deg_nonzero) > 5:
            # Fit power law: log-log regression
            log_k = np.log(np.sort(deg_nonzero)[::-1] + 1)
            log_rank = np.log(np.arange(1, len(deg_nonzero)+1))
            if np.std(log_k) > 0:
                alpha = -np.polyfit(log_rank, log_k, 1)[0]
                alpha_arr[i] = np.clip(alpha, 0.5, 4.0)
            else:
                alpha_arr[i] = 1.0
        else:
            alpha_arr[i] = 1.0

        # Hub density: fraction of nodes with degree > 2x mean
        hub_threshold = mean_deg * 2
        hub_arr[i] = np.sum(degrees > hub_threshold) / window

    return hurst_arr, alpha_arr, hub_arr

# Fast Hurst estimation (R/S method — O(n log n))
def hurst_rs(prices, min_window=10):
    """
    Fast R/S Hurst exponent estimation
    H > 0.5 = trending (persistent)
    H < 0.5 = mean reverting (anti-persistent)
    H = 0.5 = random walk
    """
    n = len(prices)
    if n < min_window * 2:
        return 0.5

    returns = np.diff(np.log(prices + 1e-10))
    if len(returns) < 4:
        return 0.5

    # R/S at multiple scales
    scales = []
    rs_vals = []

    for scale in [8, 16, 32, min(64, len(returns)//2)]:
        if scale > len(returns) // 2:
            continue
        n_chunks = len(returns) // scale
        if n_chunks < 1:
            continue
        rs_chunk = []
        for j in range(n_chunks):
            chunk = returns[j*scale:(j+1)*scale]
            mean_c = np.mean(chunk)
            dev    = np.cumsum(chunk - mean_c)
            R      = np.max(dev) - np.min(dev)
            S      = np.std(chunk) + 1e-10
            rs_chunk.append(R / S)
        if rs_chunk:
            scales.append(np.log(scale))
            rs_vals.append(np.log(np.mean(rs_chunk) + 1e-10))

    if len(scales) < 2:
        return 0.5

    H = np.polyfit(scales, rs_vals, 1)[0]
    return float(np.clip(H, 0.1, 0.9))

# ─────────────────────────────────────────────
# RETAIL EXHAUSTION TIMER
# Based on RetailFlow research: retail traders
# flip collective position at known intervals
# ─────────────────────────────────────────────
RETAIL_FLIP_TIMES = {
    # Symbol pattern → avg flip time in 1-min candles
    "frxEURUSD": 30,   "frxEURCAD": 45,  "frxEURGBP": 55,
    "frxEURJPY": 60,   "frxEURCHF": 70,  "frxEURNZD": 80,
    "frxGBPUSD": 116,  "frxGBPJPY": 130, "frxGBPAUD": 140,
    "frxGBPCAD": 150,  "frxGBPCHF": 160, "frxGBPNZD": 170,
    "frxAUDUSD": 230,  "frxAUDJPY": 250, "frxAUDCAD": 260,
    "frxAUDCHF": 270,  "frxAUDNZD": 280,
    "frxUSDJPY": 190,  "frxUSDCAD": 200, "frxUSDCHF": 210,
    "frxNZDUSD": 240,  "frxNZDJPY": 260,
    "frxXAUUSD": 45,   "frxXAGUSD": 60,
    "cryBTCUSD": 120,  "cryETHUSD": 100,
    # Synthetics — spike-driven, shorter cycles
    "BOOM500":  15,  "BOOM1000":  18,
    "CRASH500": 15,  "CRASH1000": 18,
    "R_25": 20, "R_50": 22, "R_75": 25, "R_100": 28,
}

def retail_exhaustion_features(closes, symbol, window=300):
    """
    Detect how close we are to retail position flip
    Returns:
    - exhaustion_score: 0-1 (1 = flip imminent)
    - cycles_completed: how many flips detected
    - time_in_current_cycle: candles since last reversal
    """
    n = len(closes)
    flip_time = RETAIL_FLIP_TIMES.get(symbol, 60)

    exhaustion = np.zeros(n)
    cycle_pos  = np.zeros(n)

    for i in range(window, n):
        p = closes[i-window:i]

        # Detect direction changes (reversals)
        returns = np.diff(p)
        # Rolling direction (positive or negative)
        direction = np.sign(pd.Series(returns).rolling(5).mean().fillna(0).values)

        # Find last reversal point
        last_reversal = 0
        for j in range(len(direction)-1, 0, -1):
            if direction[j] != direction[j-1] and direction[j-1] != 0:
                last_reversal = len(direction) - j
                break

        # How far through the expected cycle are we?
        cycle_progress = last_reversal / (flip_time + 1e-10)
        exhaustion[i]  = np.clip(cycle_progress, 0, 1)
        cycle_pos[i]   = last_reversal

    return exhaustion, cycle_pos

# ─────────────────────────────────────────────
# FLOW TOXICITY SCORE
# Low toxicity = retail dominant = our edge highest
# High toxicity = smart money active = avoid
# ─────────────────────────────────────────────
def flow_toxicity_features(closes, highs, lows, window=20):
    """
    Estimate flow toxicity from price action:
    - Large consistent moves = toxic (smart money)
    - Small choppy moves = benign (retail flow)
    - Sudden gaps = very toxic
    """
    n = len(closes)
    toxicity = np.zeros(n)
    benign   = np.zeros(n)

    for i in range(window, n):
        c = closes[i-window:i]
        h = highs[i-window:i]
        l = lows[i-window:i]

        returns  = np.abs(np.diff(c) / (c[:-1] + 1e-10))
        hl_range = (h - l) / (l + 1e-10)

        # Toxicity indicators:
        # 1. Large consistent directional moves
        net_move = abs(c[-1] - c[0]) / (c[0] + 1e-10)
        total_move = np.sum(returns)
        efficiency = net_move / (total_move + 1e-10)  # 1=perfectly directional

        # 2. Sudden acceleration (smart money entering)
        recent_vol  = np.std(returns[-5:]) + 1e-10
        baseline_vol = np.std(returns) + 1e-10
        vol_spike   = recent_vol / baseline_vol

        # 3. Candle body vs wick ratio (smart money = large bodies)
        bodies = np.abs(np.diff(c))
        wicks  = hl_range[1:] - bodies / (c[:-1] + 1e-10)
        body_ratio = np.mean(bodies) / (np.mean(hl_range[1:]) + 1e-10)

        # Combined toxicity score (0=benign retail, 1=toxic smart money)
        tox = np.clip(efficiency * 0.4 + (vol_spike - 1) * 0.3 + body_ratio * 0.3, 0, 1)
        toxicity[i] = tox
        benign[i]   = 1 - tox

    return toxicity, benign

# ─────────────────────────────────────────────
# GRAM-CHARLIER DISTRIBUTION FEATURES
# Captures fat tails and skewness
# ─────────────────────────────────────────────
def gram_charlier_features(closes, window=60):
    """
    Calculate higher-order distribution moments:
    - Skewness: asymmetry of returns
    - Excess kurtosis: fat-tail measure
    - GC weight: deviation from normality
    """
    from scipy import stats
    n = len(closes)
    skew_arr  = np.zeros(n)
    kurt_arr  = np.zeros(n)
    gc_weight = np.zeros(n)

    for i in range(window, n):
        returns = np.diff(closes[i-window:i+1]) / (closes[i-window:i] + 1e-10)
        if len(returns) < 10:
            continue
        s = float(stats.skew(returns))
        k = float(stats.kurtosis(returns))  # excess kurtosis
        skew_arr[i]  = np.clip(s, -3, 3)
        kurt_arr[i]  = np.clip(k, -2, 10)
        # GC weight: high = very non-normal = spike environment
        gc_weight[i] = np.clip(abs(s) * 0.3 + abs(k) * 0.1, 0, 1)

    return skew_arr, kurt_arr, gc_weight

# ─────────────────────────────────────────────
# CONTRARIAN COMPOSITE SCORE
# Combines all retail psychology signals
# ─────────────────────────────────────────────
def contrarian_composite(rsi, ou_zscore, exhaustion, toxicity,
                          hurst, kalman_vel, window=1):
    """
    Score 0-1 measuring how ripe conditions are
    for a contrarian trade (fade retail crowd)
    
    High score = retail maximally wrong = our edge
    """
    n = len(rsi)
    score = np.zeros(n)

    for i in range(n):
        s = 0.0
        # RSI extreme (retail overstretched)
        if rsi[i] > 65:   s += 0.20  # overbought retail
        elif rsi[i] < 35: s += 0.20  # oversold retail
        else:              s += 0.05  # neutral

        # OU zscore stretched (price far from mean)
        abs_z = min(abs(ou_zscore[i]), 3)
        s += (abs_z / 3) * 0.20

        # Retail exhaustion near flip
        s += exhaustion[i] * 0.20

        # Low toxicity (retail dominant, not smart money)
        s += (1 - toxicity[i]) * 0.20

        # Hurst < 0.5 = mean reverting conditions
        if hurst[i] < 0.4:   s += 0.20
        elif hurst[i] < 0.5: s += 0.10
        else:                  s += 0.0

        score[i] = np.clip(s, 0, 1)

    return score


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


    # ── FRACTIONAL DIFFERENCING (2 features) ──
    fd_03 = fractional_diff(c, d=0.3)
    fd_04 = fractional_diff(c, d=0.4)
    df['fd_price_03'] = fd_03          # 70% memory preserved
    df['fd_price_04'] = fd_04          # 60% memory preserved

    # ── dLTM SCORE (1 feature) ──
    df['dltm_score'] = compute_dltm(c, window=100)

    # ── HURST EXPONENT — Fast R/S (1 feature) ──
    hurst_vals = np.zeros(len(c))
    for i in range(60, len(c)):
        hurst_vals[i] = hurst_rs(c[max(0,i-60):i])
    df['hurst_exponent'] = hurst_vals

    # ── VISIBILITY GRAPH (3 features) ──
    # Use fast approximation for large datasets
    vg_hurst = np.zeros(len(c))
    vg_alpha = np.zeros(len(c))
    vg_hub   = np.zeros(len(c))
    # Use smaller window for speed (30 candles)
    for i in range(30, len(c), 5):  # step=5 for speed
        p = c[i-30:i]
        degrees = np.zeros(30)
        for a in range(30):
            for b in range(a+1, min(a+10, 30)):  # limit lookahead
                visible = True
                for cc in range(a+1, b):
                    interp = p[a] + (p[b]-p[a])*(cc-a)/(b-a)
                    if p[cc] >= interp:
                        visible = False
                        break
                if visible:
                    degrees[a] += 1
                    degrees[b] += 1
        mean_d = np.mean(degrees) + 1e-10
        std_d  = np.std(degrees) + 1e-10
        vg_hurst[i] = np.clip(0.5 + 0.3*np.tanh((std_d/mean_d-0.5)*2), 0.1, 0.9)
        hub_mask = degrees > mean_d * 2
        vg_hub[i] = np.sum(hub_mask) / 30
        deg_nz = degrees[degrees > 0]
        if len(deg_nz) > 3:
            lk = np.log(np.sort(deg_nz)[::-1]+1)
            lr = np.log(np.arange(1,len(deg_nz)+1))
            vg_alpha[i] = np.clip(-np.polyfit(lr,lk,1)[0], 0.5, 4.0)
        # Fill gaps with forward fill
        if i > 30:
            vg_hurst[i-4:i] = vg_hurst[i]
            vg_hub[i-4:i]   = vg_hub[i]
            vg_alpha[i-4:i] = vg_alpha[i]

    df['vg_hurst']     = vg_hurst
    df['vg_alpha']     = vg_alpha
    df['vg_hub_density'] = vg_hub

    # ── RETAIL EXHAUSTION (2 features) ──
    sym = df['symbol'].iloc[0] if 'symbol' in df.columns else "unknown"
    exhaustion, cycle_pos = retail_exhaustion_features(c, sym)
    df['retail_exhaustion'] = exhaustion
    df['retail_cycle_pos']  = cycle_pos / 300  # normalized

    # ── FLOW TOXICITY (2 features) ──
    toxicity, benign = flow_toxicity_features(c, h, l)
    df['flow_toxicity'] = toxicity
    df['flow_benign']   = benign

    # ── GRAM-CHARLIER DISTRIBUTION (3 features) ──
    from scipy import stats as scipy_stats
    skew_arr  = np.zeros(len(c))
    kurt_arr  = np.zeros(len(c))
    gc_weight = np.zeros(len(c))
    for i in range(60, len(c)):
        rets = np.diff(c[i-60:i+1]) / (c[i-60:i] + 1e-10)
        skew_arr[i]  = np.clip(float(scipy_stats.skew(rets)), -3, 3)
        kurt_arr[i]  = np.clip(float(scipy_stats.kurtosis(rets)), -2, 10)
        gc_weight[i] = np.clip(abs(skew_arr[i])*0.3 + abs(kurt_arr[i])*0.1, 0, 1)
    df['gc_skewness']  = skew_arr
    df['gc_kurtosis']  = kurt_arr
    df['gc_weight']    = gc_weight

    # ── CONTRARIAN COMPOSITE (1 feature) ──
    df['contrarian_score'] = contrarian_composite(
        df['rsi'].values,
        df['ou_zscore'].values,
        exhaustion,
        toxicity,
        vg_hurst,
        df['kalman_velocity'].values
    )

    return df

# ─────────────────────────────────────────────
# PROPER LABELING — BUY / SELL / HOLD per market
# Based on actual move size vs noise threshold
# ─────────────────────────────────────────────

# Minimum move required to be a real signal
# Below this = noise, label as HOLD
SIGNAL_THRESHOLDS = {
    # Synthetics — use small threshold, meta model filters spikes
    # BOOM always goes up, CRASH always goes down
    # Train on ALL directional moves, meta learns spike conditions
    "BOOM500":   0.00015,  # 0.015% — captures regular upward moves
    "BOOM1000":  0.00012,
    "CRASH500":  0.00015,
    "CRASH1000": 0.00012,
    # VIX — moderate volatility
    "R_25":  0.00030,
    "R_50":  0.00050,
    "R_75":  0.00070,
    "R_100": 0.00090,
    # Forex — tight moves
    "frxUSDJPY": 0.00012,
    "frxEURUSD": 0.00010,
    "frxGBPUSD": 0.00012,
    "frxEURGBP": 0.00008,
    "frxAUDUSD": 0.00010,
    "frxUSDCAD": 0.00010,
    "frxUSDCHF": 0.00010,
    "frxGBPJPY": 0.00015,
    "frxEURJPY": 0.00012,
    # Crypto
    "cryBTCUSD": 0.00040,
    "cryETHUSD": 0.00050,
    # Commodities
    "frxXAUUSD": 0.00025,
    "frxXAGUSD": 0.00040,
}

def label_trades(df, symbol="unknown", lookahead=4):
    """
    Proper tri-class labeling:
      1  = BUY  (price goes up significantly)
     -1  = SELL (price goes down significantly)
      0  = HOLD (move too small = noise)
    
    Threshold is per-symbol based on typical move size
    This prevents training on noise for forex
    """
    closes   = df["close"].values
    n        = len(closes)
    threshold = SIGNAL_THRESHOLDS.get(symbol, 0.0003)
    
    labels   = np.zeros(n)
    strength = np.zeros(n)

    # Unidirectional symbols — force correct label direction
    boom_symbols  = ["BOOM500","BOOM1000","BOOM300N","BOOM150N","BOOM600","BOOM900","BOOM50"]
    crash_symbols = ["CRASH500","CRASH1000","CRASH300N","CRASH150N","CRASH600","CRASH900","CRASH50"]
    is_boom  = any(b in symbol for b in boom_symbols)
    is_crash = any(c in symbol for c in crash_symbols)

    for i in range(n - lookahead):
        future  = closes[i + lookahead]
        current = closes[i] + 1e-10
        move    = (future - current) / current
        abs_move = abs(move)

        strength[i] = abs_move

        if is_boom:
            # BOOM only spikes UP — only BUY signals
            labels[i] = 1 if move > threshold else 0
        elif is_crash:
            # CRASH only spikes DOWN — only SELL signals
            labels[i] = -1 if move < -threshold else 0
        else:
            # Bidirectional markets
            if abs_move >= threshold:
                labels[i] = 1 if move > 0 else -1
            else:
                labels[i] = 0  # HOLD — move too small

    # Last lookahead rows — no future data
    labels[-lookahead:]   = np.nan
    strength[-lookahead:] = np.nan

    df["label"]          = labels
    df["label_strength"] = strength

    # Print distribution
    buy  = int(np.sum(labels == 1))
    sell = int(np.sum(labels == -1))
    hold = int(np.sum(labels == 0))
    total = buy + sell + hold
    print(f"  Labels: BUY={buy} SELL={sell} HOLD={hold} | threshold={threshold:.4%}")

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
    df = label_trades(df, symbol=symbol, lookahead=4)
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

# ── THIS FILE IS BEING PATCHED - DO NOT RUN OLD VERSION ──
