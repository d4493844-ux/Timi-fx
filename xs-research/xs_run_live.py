#!/usr/bin/env python3
"""
LIVE RUNNER — run the validated cross-sectional engine on REAL market data.
Run this in Google Cloud Shell (which can reach Binance). Needs only stdlib.

  python3 xs_run_live.py              # default: ~40 liquid coins, daily bars, weekly rebalance
  python3 xs_run_live.py --tf 4h      # 4-hour bars
  python3 xs_run_live.py --universe forex   # forex via Twelve Data (needs TD_KEY env)

It fetches data, aligns it, and runs evaluate_universe() — the SAME engine that
passed self-test (finds planted edges, rejects noise). Whatever it reports is
honest: most families will read 'noise'. One or two surviving 'REAL EDGE' rows
at a modest Sharpe (0.8-1.5) is the realistic good outcome.
"""
import json, math, sys, time, urllib.request
import xs_engine as E

# ─────────── a broad, liquid crypto universe (spot USDT pairs) ───────────
CRYPTO_UNIVERSE = [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT",
    "LINKUSDT","DOTUSDT","MATICUSDT","LTCUSDT","BCHUSDT","ATOMUSDT","UNIUSDT","ETCUSDT",
    "XLMUSDT","NEARUSDT","ALGOUSDT","FILUSDT","APTUSDT","ARBUSDT","OPUSDT","INJUSDT",
    "AAVEUSDT","MKRUSDT","SANDUSDT","MANAUSDT","AXSUSDT","FTMUSDT","THETAUSDT","EOSUSDT",
    "XTZUSDT","GRTUSDT","RUNEUSDT","CHZUSDT","SNXUSDT","CRVUSDT","LDOUSDT","DYDXUSDT",
]

BINANCE_HOSTS = ["https://data-api.binance.vision", "https://api.binance.com"]

def fetch_klines(symbol, interval="1d", limit=1000):
    for host in BINANCE_HOSTS:
        url = f"{host}/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"timi-xs/1.0"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read())
            if isinstance(data, list) and data:
                return [float(k[4]) for k in data]  # close prices
        except Exception as e:
            continue
    return None

def build_universe(symbols, interval, limit):
    uni, failed = {}, []
    for i, s in enumerate(symbols):
        closes = fetch_klines(s, interval, limit)
        if closes and len(closes) >= 200:
            uni[s] = closes
            print(f"  [{i+1}/{len(symbols)}] {s}: {len(closes)} bars", flush=True)
        else:
            failed.append(s)
            print(f"  [{i+1}/{len(symbols)}] {s}: FAILED/insufficient", flush=True)
        time.sleep(0.15)  # be polite to the API
    if failed: print(f"  (skipped {len(failed)}: {', '.join(failed)})")
    # align to the common minimum length
    if uni:
        n = min(len(v) for v in uni.values())
        uni = {k: v[-n:] for k, v in uni.items()}
    return uni

def main():
    args = sys.argv[1:]
    interval = "1d"
    if "--tf" in args: interval = args[args.index("--tf")+1]

    # map bar interval -> rebalance window & periods/year
    # daily bars, weekly rebalance (REBAL=7) is the robust default for crypto momentum
    cfg = {
        "1d":  dict(rebal=7,  ppy=52,   limit=1000),   # ~2.7y daily, weekly rebalance
        "4h":  dict(rebal=42, ppy=52,   limit=1500),   # 42*4h = weekly
        "1h":  dict(rebal=168,ppy=52,   limit=1500),   # 168h = weekly
    }.get(interval, dict(rebal=7, ppy=52, limit=1000))

    print("="*100)
    print(f" FETCHING REAL CRYPTO DATA  ({len(CRYPTO_UNIVERSE)} coins, {interval} bars)")
    print("="*100)
    uni = build_universe(CRYPTO_UNIVERSE, interval, cfg["limit"])
    if len(uni) < 8:
        print(f"\nOnly {len(uni)} coins fetched — need >=8. Check network/Binance access.")
        sys.exit(1)
    print(f"\n Universe ready: {len(uni)} coins, {min(len(v) for v in uni.values())} aligned bars each.\n")

    # run the validated engine
    E.evaluate_universe(
        uni,
        rebalance_every=cfg["rebal"],
        periods_per_year=cfg["ppy"],
        top_frac=0.3,          # long top 30%, short bottom 30%
        cost_bps=10,           # 10bps round-trip per rebalance leg (realistic crypto spot)
        n_perm=200,
        label=f"[REAL CRYPTO {interval}, {len(uni)} coins]",
    )

    print("\n NEXT: if a family shows REAL EDGE, re-run with cost_bps=20 and cost_bps=40")
    print(" to confirm it survives higher costs. A real edge degrades gracefully; a fake")
    print(" one vanishes. Only then is it worth wiring into live execution.")

if __name__ == "__main__":
    main()
