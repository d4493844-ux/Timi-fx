#!/usr/bin/env python3
"""
COMBINED LIVE RUNNER — crypto + forex cross-sectional, one command.
Run in Google Cloud Shell. Needs only stdlib. Forex needs TD_KEY env (Twelve Data
free key) OR falls back to Deriv's public websocket for the 7 USD majors.

  python3 xs_run_combined.py                 # both universes, daily bars
  TD_KEY=xxxx python3 xs_run_combined.py      # with Twelve Data key for forex

Runs the SAME validated engine (xs_engine.py) that passed self-test on both.
Crypto = 40-coin momentum. Forex = 8-currency ranking (carry/momentum style).
Reports honestly: most families read 'noise'. A surviving 'REAL EDGE' at a
modest Sharpe is the realistic good outcome.
"""
import json, math, os, sys, time, urllib.request
import xs_engine as E
import xs_forex as FX

# ─────────────────────────── crypto ───────────────────────────
CRYPTO_UNIVERSE = [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT",
    "LINKUSDT","DOTUSDT","MATICUSDT","LTCUSDT","BCHUSDT","ATOMUSDT","UNIUSDT","ETCUSDT",
    "XLMUSDT","NEARUSDT","ALGOUSDT","FILUSDT","APTUSDT","ARBUSDT","OPUSDT","INJUSDT",
    "AAVEUSDT","MKRUSDT","SANDUSDT","MANAUSDT","AXSUSDT","FTMUSDT","THETAUSDT","EOSUSDT",
    "XTZUSDT","GRTUSDT","RUNEUSDT","CHZUSDT","SNXUSDT","CRVUSDT","LDOUSDT","DYDXUSDT",
]
BINANCE_HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"]

def fetch_binance(symbol, interval="1d", limit=1000):
    for host in BINANCE_HOSTS:
        try:
            url = f"{host}/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
            req = urllib.request.Request(url, headers={"User-Agent":"timi-xs/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read())
            if isinstance(data, list) and data:
                return [float(k[4]) for k in data]
        except Exception:
            continue
    return None

def build_crypto(interval, limit):
    print("="*100); print(f" FETCHING CRYPTO ({len(CRYPTO_UNIVERSE)} coins, {interval})"); print("="*100)
    uni = {}
    for i, s in enumerate(CRYPTO_UNIVERSE):
        c = fetch_binance(s, interval, limit)
        if c and len(c) >= 200:
            uni[s] = c; print(f"  [{i+1}/{len(CRYPTO_UNIVERSE)}] {s}: {len(c)} bars", flush=True)
        else:
            print(f"  [{i+1}/{len(CRYPTO_UNIVERSE)}] {s}: skip", flush=True)
        time.sleep(0.12)
    if uni:
        n = min(len(v) for v in uni.values()); uni = {k: v[-n:] for k,v in uni.items()}
    return uni

# ─────────────────────────── forex ───────────────────────────
def fetch_twelvedata(pair, interval="1day", outputsize=1000):
    key = os.environ.get("TD_KEY","")
    if not key: return None
    sym = pair[:3] + "/" + pair[3:]
    try:
        url = f"https://api.twelvedata.com/time_series?symbol={sym}&interval={interval}&outputsize={outputsize}&apikey={key}"
        with urllib.request.urlopen(url, timeout=30) as r:
            j = json.loads(r.read())
        if "values" in j:
            vals = list(reversed(j["values"]))
            return [float(v["close"]) for v in vals]
    except Exception:
        pass
    return None

def fetch_deriv_fx(pair, granularity=86400, count=1000):
    """Fallback: Deriv public ws for the 7 USD majors (frx-prefixed)."""
    try:
        import websocket  # may not be installed; try anyway
    except Exception:
        return None
    # minimal ws fetch (only if websocket-client is present)
    try:
        import ssl
        ws = websocket.create_connection("wss://ws.derivws.com/websockets/v3?app_id=1089",
                                         timeout=20, sslopt={"cert_reqs": ssl.CERT_NONE})
        ws.send(json.dumps({"ticks_history": "frx"+pair, "adjust_start_time":1,
                            "count":count, "end":"latest", "granularity":granularity, "style":"candles"}))
        out=None
        for _ in range(5):
            m = json.loads(ws.recv())
            if m.get("candles"): out=[float(c["close"]) for c in m["candles"]]; break
            if m.get("error"): break
        ws.close(); return out
    except Exception:
        return None

def build_forex(interval, limit):
    print("\n"+"="*100); print(" FETCHING FOREX (7 USD majors -> 8 currency strength indices)"); print("="*100)
    td_int = {"1d":"1day","4h":"4h","1h":"1h"}.get(interval,"1day")
    pair_closes = {}
    for p in FX.USD_PAIRS:
        c = fetch_twelvedata(p, td_int, limit) or fetch_deriv_fx(p)
        if c and len(c) >= 200:
            pair_closes[p] = c; print(f"  {p}: {len(c)} bars", flush=True)
        else:
            print(f"  {p}: FAILED (need TD_KEY env or websocket-client installed)", flush=True)
        time.sleep(0.3)
    if len(pair_closes) < 7:
        print(f"  Only {len(pair_closes)}/7 USD pairs — forex needs all 7. Set TD_KEY and retry.")
        return None
    n = min(len(v) for v in pair_closes.values()); pair_closes = {k:v[-n:] for k,v in pair_closes.items()}
    currencies = FX.build_currency_series(pair_closes)   # {USD:[...], EUR:[...], ...}
    print(f"  Built 8 currency strength indices, {n} aligned bars each.")
    return currencies

def main():
    args = sys.argv[1:]
    interval = args[args.index("--tf")+1] if "--tf" in args else "1d"
    cfg = {"1d":dict(rebal=7,ppy=52,limit=1000),
           "4h":dict(rebal=42,ppy=52,limit=1500),
           "1h":dict(rebal=168,ppy=52,limit=1500)}.get(interval, dict(rebal=7,ppy=52,limit=1000))

    # CRYPTO
    crypto = build_crypto(interval, cfg["limit"])
    if len(crypto) >= 8:
        print(f"\n Crypto universe: {len(crypto)} coins, {min(len(v) for v in crypto.values())} bars\n")
        E.evaluate_universe(crypto, cfg["rebal"], cfg["ppy"], top_frac=0.3,
                            cost_bps=10, n_perm=200, label=f"[CRYPTO {interval} {len(crypto)} coins]")
    else:
        print(f"\n Crypto skipped: only {len(crypto)} coins fetched.")

    # FOREX
    forex = build_forex(interval, cfg["limit"])
    if forex and len(forex) >= 6:
        # 8 currencies is a small universe -> use top_frac 0.25 (long 2, short 2)
        E.evaluate_universe(forex, cfg["rebal"], cfg["ppy"], top_frac=0.25,
                            cost_bps=5, n_perm=200, label=f"[FOREX {interval} 8 currencies]")
    else:
        print("\n Forex skipped (need all 7 USD majors — set TD_KEY env).")

    print("\n"+"="*100)
    print(" DONE. If any family shows REAL EDGE, re-run it at cost_bps=20 and 40 to")
    print(" confirm it survives higher costs before any live wiring.")
    print("="*100)

if __name__ == "__main__":
    main()
