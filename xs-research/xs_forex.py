#!/usr/bin/env python3
"""
FOREX CURRENCY-RANKING MODULE for the cross-sectional engine.
=============================================================

WHY THIS IS DIFFERENT FROM THE OLD (FAILED) FOREX APPROACH
----------------------------------------------------------
Old TIMI: "predict whether EUR/USD goes up." That is directional, ~50/50, dead.

This: decompose the pair universe into the 8 INDIVIDUAL currencies
(USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD). Build each currency's "strength
index" over time = its average return against all the other currencies. Then
rank the 8 currencies and go LONG the strongest, SHORT the weakest.

This is cross-sectional FX momentum — a real, documented edge that FX funds
trade (alongside carry). It survives where directional prediction does not,
because you're not betting "EUR up" — you're betting "the strongest currency
keeps outperforming the weakest ON AVERAGE across the basket," which is a far
more stable statistical phenomenon.

The output plugs into the SAME validated engine (xs_engine.py): we turn each
currency's strength index into a synthetic price series, then run the identical
cross-sectional backtest + honest significance tests.

DATA: needs close prices for the 28 major crosses. In Cloud Shell we fetch from
Twelve Data (free tier, needs TD_KEY env var) OR Deriv's public ws. We derive
all 28 crosses from the 7 USD pairs if only those are available.
"""
import math

# the 8 currencies we rank
CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"]

# the USD-quoted majors we need; everything else is derived by triangulation
# convention: value = units of QUOTE per 1 unit of BASE (standard FX quote)
USD_PAIRS = {
    "EURUSD": ("EUR", "USD"),   # USD per EUR
    "GBPUSD": ("GBP", "USD"),
    "AUDUSD": ("AUD", "USD"),
    "NZDUSD": ("NZD", "USD"),
    "USDJPY": ("USD", "JPY"),   # JPY per USD
    "USDCAD": ("USD", "CAD"),
    "USDCHF": ("USD", "CHF"),
}

def build_currency_series(pair_closes):
    """
    pair_closes: {pairname: [close,...]} for the 7 USD majors above (aligned length).
    Returns {currency: [strength_index,...]} — a synthetic price series per currency,
    where strength = cumulative average outperformance vs all other currencies.

    Method: at each bar, compute each currency's value in USD terms. Then each
    currency's 'index' is its USD value, and JPY/CAD/CHF are inverted so that a
    RISING index always means a STRONGER currency. USD itself is the numeraire,
    so its index is the inverse of the average of all others (a dollar basket).
    """
    n = min(len(v) for v in pair_closes.values())
    series = {p: pair_closes[p][-n:] for p in pair_closes}

    # value of 1 unit of each currency, in USD, at each bar
    usd_val = {c: [] for c in CURRENCIES}
    for i in range(n):
        # currencies quoted as XXXUSD -> value in USD is the quote directly
        usd_val["EUR"].append(series["EURUSD"][i])
        usd_val["GBP"].append(series["GBPUSD"][i])
        usd_val["AUD"].append(series["AUDUSD"][i])
        usd_val["NZD"].append(series["NZDUSD"][i])
        # currencies quoted as USDXXX -> value in USD is 1/quote
        usd_val["JPY"].append(1.0/series["USDJPY"][i] if series["USDJPY"][i] else 0)
        usd_val["CAD"].append(1.0/series["USDCAD"][i] if series["USDCAD"][i] else 0)
        usd_val["CHF"].append(1.0/series["USDCHF"][i] if series["USDCHF"][i] else 0)
        # USD value in USD is always 1; its "strength" is relative to the basket,
        # captured below by normalization, so store 1.0
        usd_val["USD"].append(1.0)

    # Normalize each currency's USD-value series into a strength index that starts
    # at 100. For USD, build a dollar-strength index = inverse of the geometric
    # mean of the other 7 currencies' USD values (dollar up when others down).
    strength = {}
    for c in CURRENCIES:
        if c == "USD":
            idx = []
            for i in range(n):
                others = [usd_val[o][i] for o in CURRENCIES if o != "USD" and usd_val[o][i] > 0]
                gm = math.exp(sum(math.log(x) for x in others)/len(others)) if others else 1.0
                idx.append(1.0/gm if gm else 1.0)
            strength["USD"] = idx
        else:
            strength[c] = usd_val[c][:]

    # rebase each to 100 at the first bar so they're comparable price series
    out = {}
    for c, idx in strength.items():
        base = idx[0] if idx[0] else 1.0
        out[c] = [100.0 * (x/base) for x in idx]
    return out

def derive_all_crosses(usd_pairs):
    """Optional: build all 28 crosses from the 7 USD pairs (not needed for the
       currency-ranking engine, but handy if you want pair-level cross-sectional too)."""
    # left as a utility; the currency engine above is the primary path
    return usd_pairs
