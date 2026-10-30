#!/usr/bin/env python3
"""
PHASE 2 LIVE RUNNER — run the executable simulator on REAL Binance data.
Run in Google Cloud Shell:  python3 xs_phase2_live.py

Fetches timestamped daily klines (open/high/low/close), aligns all coins on the
COMMON timestamp set (logging any dropped bars), then runs the low-vol long/short
book through the executable model (next-open execution, account-level returns, fees +
spread + slippage on both legs, perp funding, liquidation) across cost scenarios.

This reports what the SCREEN cannot: gross vs net-of-everything, account drawdown,
and how sensitive the book is to funding — the dominant, usually-ignored short cost.
It is a tradability check, not a significance test. Even a clean result here is not a
trade signal until it is confirmed on a pre-registered, untouched period (Phase 4).
"""
import time
import xs_engine as E
import xs_execution as X

CRYPTO_UNIVERSE = [
    "BTCUSDT","ETHUSDT","BNBUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT",
    "LINKUSDT","DOTUSDT","MATICUSDT","LTCUSDT","BCHUSDT","ATOMUSDT","UNIUSDT","ETCUSDT",
    "XLMUSDT","NEARUSDT","ALGOUSDT","FILUSDT","APTUSDT","ARBUSDT","OPUSDT","INJUSDT",
    "AAVEUSDT","MKRUSDT","SANDUSDT","MANAUSDT","AXSUSDT","FTMUSDT","THETAUSDT","EOSUSDT",
    "XTZUSDT","GRTUSDT","RUNEUSDT","CHZUSDT","SNXUSDT","CRVUSDT","LDOUSDT","DYDXUSDT",
]
VOL_LB=30; REBAL=7; PPY=52; TOP_FRAC=0.3

def main():
    print("="*96); print(" PHASE 2 — fetching timestamped daily klines"); print("="*96)
    raw={}
    for i,s in enumerate(CRYPTO_UNIVERSE):
        bars=X.fetch_klines_ts(s, "1d", 1600)
        if bars: raw[s]=bars; print(f"  [{i+1}/{len(CRYPTO_UNIVERSE)}] {s}: {len(bars)} bars", flush=True)
        else: print(f"  [{i+1}/{len(CRYPTO_UNIVERSE)}] {s}: FAILED", flush=True)
        time.sleep(0.1)
    master, coins = X.build_panel_calendar(raw, min_bars=300)
    if not coins: print("Not enough data."); return

    lowvol=lambda c: E.sig_lowvol(c, VOL_LB)
    print("\n"+"="*96); print(" LOW-VOL LONG/SHORT — executable model, FULL history, cost scenarios"); print("="*96)
    print(" Time-varying universe (coins trade only when listed). Costs are ASSUMPTIONS")
    print(" until measured against real fills/spreads/funding.\n")

    scenarios = [
        ("optimistic  ", dict(fee_bps=2, half_spread_bps=0.5, slippage_bps=1,  funding_bps_per_day=0.5)),
        ("realistic   ", dict(fee_bps=4, half_spread_bps=1.0, slippage_bps=2,  funding_bps_per_day=1.5)),
        ("stressed    ", dict(fee_bps=6, half_spread_bps=2.0, slippage_bps=4,  funding_bps_per_day=4.0)),
    ]
    for name,cfg in scenarios:
        res=X.simulate(coins, master, lowvol, rebalance_every=REBAL, top_frac=TOP_FRAC, exec_lag=1,
                       periods_per_year=PPY, gross_exposure=1.0, leverage=2.0, maint_margin=0.005,
                       model="perp", **cfg)
        X.report(res, f"[{name}]  fee {cfg['fee_bps']} / spread {cfg['half_spread_bps']} / slip {cfg['slippage_bps']} / funding {cfg['funding_bps_per_day']}bps-day")

    print("\n"+"="*96)
    print(" LIQUIDATION-CUSHION DIAGNOSTIC (realistic costs; vary leverage)")
    print(" If net Sharpe FALLS as leverage -> 1x, the result was leaning on the isolated-margin")
    print(" cap truncating catastrophic short losses, not on a real edge. 1x = no cap (shorts")
    print(" eat the full adverse move, like an unlevered spot short).")
    print("="*96)
    rc=dict(fee_bps=4, half_spread_bps=1.0, slippage_bps=2, funding_bps_per_day=1.5)
    for lev in (1.0, 2.0, 3.0, 5.0):
        res=X.simulate(coins, master, lowvol, rebalance_every=REBAL, top_frac=TOP_FRAC, exec_lag=1,
                       periods_per_year=PPY, gross_exposure=1.0, leverage=lev, maint_margin=0.005,
                       model="perp", **rc)
        X.report(res, f"[leverage {lev:.0f}x]")

    print("\n"+"="*96)
    print(" READING IT:")
    print("  - If net Sharpe stays clearly positive with a tolerable account drawdown across")
    print("    ALL scenarios, the book is at least plausibly tradable -> take it to Phase 4")
    print("    (pre-registered, untouched-period test). If it only works 'optimistic', it is not.")
    print("  - Funding is the swing factor. Replace the constant assumption with real per-coin")
    print("    8h funding history before trusting any positive result.")
    print("="*96)

if __name__ == "__main__":
    main()
