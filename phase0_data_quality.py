"""
═══════════════════════════════════════════════════════════════════════════
 TIMI — PHASE 0: DATA VALIDATION + COST MODEL
═══════════════════════════════════════════════════════════════════════════

 WHY THIS EXISTS
 ---------------
 Every downstream research phase (statistical significance, walk-forward,
 Monte Carlo) is only as trustworthy as the data and the cost assumptions
 underneath it. A backtest on dirty candles or with zero trading cost will
 look brilliant and lose money live. This module is the gate that runs
 BEFORE any backtest, so nothing inflated gets through.

 WHAT IT DOES (honest scope for Deriv synthetics + forex CFDs)
 -------------------------------------------------------------
 1. DATA VALIDATION  — catches corrupt/illogical/missing candles
 2. COST MODEL       — applies REAL Deriv contract costs per instrument
                        class, using the exact multiplier + stake rules
                        already hardcoded in the live `placeTrade` function.

 WHAT IT DELIBERATELY DOES NOT DO
 --------------------------------
 - It does not pretend to pull a historical bid/ask spread feed. Deriv's
   tick stream gives PRICE, not a two-sided quote. For synthetics the real
   cost is the MULT commission on leveraged notional, not a spread — so we
   model THAT. For forex/crypto we apply a per-pair spread ASSUMPTION
   (clearly labelled as an assumption, not a measurement).

 DATA CONTRACT (matches ml/scripts/collect_data.py output)
 ---------------------------------------------------------
 CSV per symbol at ml/data/{symbol}.csv with at least:
     epoch (int, seconds), open, high, low, close (float)
 1-minute granularity, Deriv raw candle format.

 USAGE
 -----
     python phase0_data_quality.py                 # validate all CSVs in ml/data
     python phase0_data_quality.py R_75 BOOM500    # validate specific symbols
     # or import:
     from phase0_data_quality import validate_candles, CostModel
═══════════════════════════════════════════════════════════════════════════
"""

import os
import sys
import json
import glob
import math
from dataclasses import dataclass, field, asdict
from typing import Optional

import numpy as np
import pandas as pd

# Granularity of the candles we validate (seconds). collect_data.py uses 60.
EXPECTED_GRANULARITY_SEC = 60

# Where collect_data.py writes its CSVs. Overridable via env for portability
# (CodeSandbox vs local vs CI). Defaults to the path collect_data.py uses.
DATA_DIR = os.environ.get("TIMI_DATA_DIR", "/workspaces/Timi-fx/ml/data")


# ═══════════════════════════════════════════════════════════════════════════
#  INSTRUMENT CLASSIFICATION
#  Mirrors the contract-type routing in placeTrade() exactly.
# ═══════════════════════════════════════════════════════════════════════════
def classify_symbol(symbol: str) -> str:
    """Return the instrument class that determines contract type & cost.

    These branches mirror placeTrade()'s contractType assignment 1:1:
        BOOM*  -> MULTUP        (spike)
        CRASH* -> MULTDOWN      (spike)
        JD*    -> MULTUP/DOWN   (jump)
        R_*    -> CALL/PUT      (vix, duration-based binary-style)
        1HZ*   -> CALL/PUT      (vix variant)
        frx*   -> MULTUP/DOWN   (forex CFD, real spread exists)
        cry*   -> MULTUP/DOWN   (crypto CFD, real spread exists)
    """
    if symbol.startswith("BOOM") or symbol.startswith("CRASH"):
        return "spike"
    if symbol.startswith("JD"):
        return "jump"
    if symbol.startswith("R_") or symbol.startswith("1HZ"):
        return "vix"
    if symbol.startswith("frx"):
        return "forex"
    if symbol.startswith("cry"):
        return "crypto"
    return "unknown"


# ═══════════════════════════════════════════════════════════════════════════
#  PART 1 — DATA VALIDATION
# ═══════════════════════════════════════════════════════════════════════════
@dataclass
class ValidationReport:
    symbol: str
    rows: int = 0
    passed: bool = True
    # individual check results
    ohlc_violations: int = 0          # high<max(o,c) or low>min(o,c) etc.
    duplicate_epochs: int = 0
    non_monotonic_epochs: int = 0     # time goes backwards
    gaps: int = 0                     # missing candles (> granularity)
    largest_gap_candles: int = 0
    nonpositive_prices: int = 0
    nan_rows: int = 0
    flatlines: int = 0                # consecutive identical OHLC (feed freeze)
    extreme_returns: int = 0          # |return| > 50% in one 1m candle
    notes: list = field(default_factory=list)

    def summary(self) -> str:
        status = "✅ PASS" if self.passed else "❌ FAIL"
        return (f"{status}  {self.symbol:12s} rows={self.rows:6d} "
                f"ohlc_bad={self.ohlc_violations} dup={self.duplicate_epochs} "
                f"gaps={self.gaps}(max {self.largest_gap_candles}) "
                f"flat={self.flatlines} extreme={self.extreme_returns}")


def validate_candles(df: pd.DataFrame, symbol: str,
                     granularity_sec: int = EXPECTED_GRANULARITY_SEC,
                     gap_tolerance: int = 0) -> ValidationReport:
    """Run every data-integrity check on one symbol's candle frame.

    `gap_tolerance` — allow this many missing candles before flagging a gap
    as a hard problem (Deriv synthetics occasionally skip a candle; forex
    has weekend gaps which are EXPECTED, not corruption).
    """
    rep = ValidationReport(symbol=symbol, rows=len(df))

    required = {"epoch", "open", "high", "low", "close"}
    missing_cols = required - set(df.columns)
    if missing_cols:
        rep.passed = False
        rep.notes.append(f"missing columns: {sorted(missing_cols)}")
        return rep

    if len(df) == 0:
        rep.passed = False
        rep.notes.append("empty frame")
        return rep

    # Coerce types defensively (CSV round-trips can stringify)
    work = df.copy()
    for c in ["open", "high", "low", "close"]:
        work[c] = pd.to_numeric(work[c], errors="coerce")
    work["epoch"] = pd.to_numeric(work["epoch"], errors="coerce")

    # --- NaN rows ---
    nan_mask = work[["epoch", "open", "high", "low", "close"]].isna().any(axis=1)
    rep.nan_rows = int(nan_mask.sum())

    # --- Non-positive prices (impossible) ---
    price_cols = work[["open", "high", "low", "close"]]
    rep.nonpositive_prices = int((price_cols <= 0).any(axis=1).sum())

    # --- OHLC logical consistency ---
    # high must be >= max(open, close) and >= low
    # low  must be <= min(open, close) and <= high
    o, h, l, c = work["open"], work["high"], work["low"], work["close"]
    ohlc_bad = (
        (h < l) |
        (h < o) | (h < c) |
        (l > o) | (l > c)
    )
    rep.ohlc_violations = int(ohlc_bad.fillna(False).sum())

    # --- Duplicate / non-monotonic timestamps ---
    rep.duplicate_epochs = int(work["epoch"].duplicated().sum())
    diffs = work["epoch"].diff()
    rep.non_monotonic_epochs = int((diffs < 0).sum())

    # --- Gap detection (missing candles) ---
    # A clean 1m series has epoch diff == granularity. Bigger => missing bars.
    # We count gaps and the largest, but treat weekend forex gaps leniently.
    expected = granularity_sec
    gap_steps = (diffs / expected).round()
    missing = gap_steps.apply(lambda s: int(s) - 1 if pd.notna(s) and s > 1 else 0)
    real_gaps = missing[missing > gap_tolerance]
    rep.gaps = int((real_gaps > 0).sum())
    rep.largest_gap_candles = int(missing.max()) if len(missing) else 0

    # --- Flatline detection (feed freeze: identical OHLC repeated) ---
    same_as_prev = (
        (o == o.shift(1)) & (h == h.shift(1)) &
        (l == l.shift(1)) & (c == c.shift(1))
    )
    # count runs of length >= 3 (a few identical candles can be legit in low-vol)
    run_len = same_as_prev.groupby((~same_as_prev).cumsum()).cumsum()
    rep.flatlines = int((run_len >= 3).sum())

    # --- Extreme single-candle returns (likely bad ticks) ---
    rets = c.pct_change().abs()
    rep.extreme_returns = int((rets > 0.50).sum())

    # --- Pass/fail policy ---
    # Hard fails: anything that breaks the math or implies corrupt data.
    hard_fail = (
        rep.ohlc_violations > 0 or
        rep.nonpositive_prices > 0 or
        rep.nan_rows > 0 or
        rep.non_monotonic_epochs > 0 or
        rep.duplicate_epochs > 0
    )
    # Soft warnings (don't fail, but note): gaps, flatlines, extreme returns.
    if rep.gaps > 0:
        rep.notes.append(f"{rep.gaps} gap(s), largest {rep.largest_gap_candles} candles")
    if rep.flatlines > 0:
        rep.notes.append(f"{rep.flatlines} flatline candles (possible feed freeze)")
    if rep.extreme_returns > 0:
        rep.notes.append(f"{rep.extreme_returns} extreme 1m returns >50% (check for bad ticks)")

    rep.passed = not hard_fail
    return rep


def clean_candles(df: pd.DataFrame,
                  granularity_sec: int = EXPECTED_GRANULARITY_SEC) -> pd.DataFrame:
    """Return a defensively-cleaned copy: typed, de-duplicated, sorted,
    NaN/illogical rows dropped. Use this to FEED backtests, while
    validate_candles() tells you WHAT was wrong before cleaning.
    """
    work = df.copy()
    for c in ["open", "high", "low", "close"]:
        work[c] = pd.to_numeric(work[c], errors="coerce")
    work["epoch"] = pd.to_numeric(work["epoch"], errors="coerce")

    work = work.dropna(subset=["epoch", "open", "high", "low", "close"])
    work = work[(work[["open", "high", "low", "close"]] > 0).all(axis=1)]

    o, h, l, c = work["open"], work["high"], work["low"], work["close"]
    logical = (h >= l) & (h >= o) & (h >= c) & (l <= o) & (l <= c)
    work = work[logical]

    work = work.drop_duplicates(subset=["epoch"])
    work = work.sort_values("epoch").reset_index(drop=True)
    return work


# ═══════════════════════════════════════════════════════════════════════════
#  PART 2 — COST MODEL
#  Encodes the REAL Deriv contract economics from placeTrade(), so a
#  backtest's reported PnL reflects what would actually hit the account.
# ═══════════════════════════════════════════════════════════════════════════
#
#  Contract facts taken directly from placeTrade() in the live edge function:
#    - MULT (BOOM/CRASH/JD/forex/crypto): dynMultiplier default = 100,
#      stake clamped to [1, 9]. Cost = commission on leveraged notional
#      (stake * multiplier) crossed on entry, charged by Deriv.
#    - CALL/PUT (R_/1HZ vix): stake floor 0.35, duration-based. Cost is
#      baked into the payout odds (you risk `stake`, win a fixed payout < 2x).
#
#  The numbers below are the *adjustable assumptions*. They are labelled as
#  assumptions, not measurements. Tune COMMISSION_PCT / PAYOUT to YOUR real
#  Deriv account statements to make the cost model exact rather than estimated.
# ═══════════════════════════════════════════════════════════════════════════

# Default multiplier from placeTrade (dynMultiplier = 100)
DEFAULT_MULTIPLIER = 100

# MULT commission: Deriv charges a commission proportional to the leveraged
# notional when you open a MULT contract. Expressed here as a fraction of
# (stake * multiplier). 0.0015 (= 0.15%) is a placeholder ASSUMPTION — replace
# with your observed commission from a real Deriv contract receipt.
MULT_COMMISSION_PCT = float(os.environ.get("TIMI_MULT_COMMISSION_PCT", "0.0015"))

# Forex/crypto additionally cross a spread on entry. Deriv's tick stream does
# not expose historical bid/ask, so this is a per-class ASSUMPTION in price %.
# Replace with Deriv's published typical spread for the pairs you trade.
SPREAD_PCT_BY_CLASS = {
    "forex":  float(os.environ.get("TIMI_FOREX_SPREAD_PCT", "0.00008")),   # ~0.8 pip on majors
    "crypto": float(os.environ.get("TIMI_CRYPTO_SPREAD_PCT", "0.0005")),   # ~5 bps
    "spike":  0.0,   # synthetic — cost is commission, not spread
    "jump":   0.0,
    "vix":    0.0,   # CALL/PUT — cost is in payout odds (see PAYOUT below)
    "unknown": 0.0,
}

# CALL/PUT effective payout: on a win you receive `stake * PAYOUT`, on a loss
# you forfeit `stake`. PAYOUT < 2.0 is the house edge. 1.85 (=85% net win) is
# the placeholder ASSUMPTION used elsewhere in your code (0.85*stake on win).
VIX_PAYOUT = float(os.environ.get("TIMI_VIX_PAYOUT", "1.85"))


@dataclass
class CostResult:
    symbol: str
    instrument_class: str
    contract_type: str
    stake: float
    multiplier: int
    entry_cost: float          # absolute $ cost to open (commission + spread)
    entry_cost_pct_of_stake: float
    notes: str = ""


class CostModel:
    """Applies real per-instrument Deriv costs.

    Two ways to use it:
      1. round_trip_cost(symbol, stake) -> absolute $ cost of opening a position
         (use this to subtract from each simulated trade's PnL).
      2. apply_to_trades(df_trades) -> vectorised cost column for a backtest.
    """

    def __init__(self,
                 multiplier: int = DEFAULT_MULTIPLIER,
                 mult_commission_pct: float = MULT_COMMISSION_PCT,
                 spread_by_class: Optional[dict] = None,
                 vix_payout: float = VIX_PAYOUT):
        self.multiplier = multiplier
        self.mult_commission_pct = mult_commission_pct
        self.spread_by_class = spread_by_class or dict(SPREAD_PCT_BY_CLASS)
        self.vix_payout = vix_payout

    def _contract_type(self, symbol: str, action: str = "BUY") -> str:
        cls = classify_symbol(symbol)
        if cls == "spike":
            return "MULTUP" if symbol.startswith("BOOM") else "MULTDOWN"
        if cls in ("jump", "forex", "crypto"):
            return "MULTUP" if action == "BUY" else "MULTDOWN"
        if cls == "vix":
            return "CALL" if action == "BUY" else "PUT"
        return "MULTUP"

    def _clamp_stake(self, symbol: str, stake: float) -> float:
        """Mirror placeTrade()'s stake clamps exactly."""
        cls = classify_symbol(symbol)
        is_mult = cls in ("spike", "jump", "forex", "crypto")
        if is_mult:
            return min(9.0, max(1.0, stake))
        return max(0.35, stake)   # CALL/PUT floor

    def round_trip_cost(self, symbol: str, stake: float,
                        action: str = "BUY") -> CostResult:
        """Absolute $ cost to OPEN one position (the cost a backtest must
        subtract from gross PnL). For MULT: commission on notional + spread.
        For CALL/PUT: the spread term is 0 — the edge is in the payout, which
        you model on the PnL side, not here (see note)."""
        cls = classify_symbol(symbol)
        ctype = self._contract_type(symbol, action)
        stake = self._clamp_stake(symbol, stake)
        is_mult = ctype.startswith("MULT")

        commission = 0.0
        spread_cost = 0.0
        note = ""

        if is_mult:
            notional = stake * self.multiplier
            commission = notional * self.mult_commission_pct
            spread_pct = self.spread_by_class.get(cls, 0.0)
            # spread is crossed on the leveraged notional too
            spread_cost = notional * spread_pct
            note = (f"commission={commission:.4f} on notional ${notional:.2f}; "
                    f"spread={spread_cost:.4f} @ {spread_pct*100:.4f}%")
        else:
            # CALL/PUT: no per-open commission in Deriv's model; the cost is
            # the sub-2x payout. We surface it here as a note so the backtest
            # author wires the payout into win PnL (win = stake*(payout-1)).
            note = (f"CALL/PUT — model payout on PnL side: win=+{(self.vix_payout-1):.2f}"
                    f"×stake, loss=-1×stake")

        entry_cost = commission + spread_cost
        return CostResult(
            symbol=symbol,
            instrument_class=cls,
            contract_type=ctype,
            stake=stake,
            multiplier=self.multiplier if is_mult else 0,
            entry_cost=round(entry_cost, 4),
            entry_cost_pct_of_stake=round(entry_cost / stake * 100, 3) if stake else 0.0,
            notes=note,
        )

    def net_pnl(self, symbol: str, stake: float, gross_pnl: float,
                won: bool, action: str = "BUY") -> float:
        """Convert a backtest's GROSS PnL into NET PnL after real costs.

        For MULT contracts: net = gross - entry_cost.
        For CALL/PUT:       net is determined by payout odds, not gross —
                            win => +stake*(payout-1), loss => -stake.
        """
        cls = classify_symbol(symbol)
        clamped = self._clamp_stake(symbol, stake)
        if cls == "vix":
            return clamped * (self.vix_payout - 1.0) if won else -clamped
        cost = self.round_trip_cost(symbol, clamped, action).entry_cost
        return gross_pnl - cost

    def apply_to_trades(self, trades: pd.DataFrame,
                        symbol_col: str = "symbol",
                        stake_col: str = "stake",
                        gross_pnl_col: str = "gross_pnl",
                        won_col: str = "won",
                        action_col: Optional[str] = None) -> pd.DataFrame:
        """Vectorised: add `entry_cost` and `net_pnl` columns to a trade log."""
        out = trades.copy()
        costs, nets = [], []
        for _, row in out.iterrows():
            sym = row[symbol_col]
            stake = float(row[stake_col])
            action = row[action_col] if action_col and action_col in out.columns else "BUY"
            cr = self.round_trip_cost(sym, stake, action)
            costs.append(cr.entry_cost)
            gross = float(row[gross_pnl_col]) if gross_pnl_col in out.columns else 0.0
            won = bool(row[won_col]) if won_col in out.columns else (gross > 0)
            nets.append(self.net_pnl(sym, stake, gross, won, action))
        out["entry_cost"] = costs
        out["net_pnl"] = nets
        return out


# ═══════════════════════════════════════════════════════════════════════════
#  PART 3 — BREAKEVEN WIN-RATE  (the number that kills naive strategies)
#  Given the cost model, what win rate do you NEED just to break even?
#  If your backtest win rate is below this, the edge is fictional.
# ═══════════════════════════════════════════════════════════════════════════
def breakeven_winrate(symbol: str, stake: float, avg_win: float,
                      avg_loss: float, cost_model: CostModel,
                      action: str = "BUY") -> dict:
    """Compute the breakeven win rate after costs.

    avg_win / avg_loss are GROSS magnitudes (positive numbers) as a backtest
    would report them before costs. Returns the win rate needed for net EV=0.
    """
    cls = classify_symbol(symbol)
    if cls == "vix":
        # CALL/PUT: win=+stake*(payout-1), loss=-stake, no separate cost.
        w = stake * (cost_model.vix_payout - 1.0)
        l = stake
        be = l / (w + l) if (w + l) > 0 else 1.0
        return {"symbol": symbol, "class": cls, "breakeven_winrate": round(be, 4),
                "net_win": round(w, 4), "net_loss": round(l, 4),
                "note": "CALL/PUT payout-based"}
    # MULT: each trade pays entry_cost regardless of outcome.
    cost = cost_model.round_trip_cost(symbol, stake, action).entry_cost
    net_win = avg_win - cost
    net_loss = avg_loss + cost
    be = net_loss / (net_win + net_loss) if (net_win + net_loss) > 0 else 1.0
    return {"symbol": symbol, "class": cls, "breakeven_winrate": round(be, 4),
            "net_win_per_trade": round(net_win, 4),
            "net_loss_per_trade": round(net_loss, 4),
            "entry_cost": round(cost, 4),
            "note": "MULT commission+spread per trade"}


# ═══════════════════════════════════════════════════════════════════════════
#  CLI — validate everything in ml/data and print a cost summary
# ═══════════════════════════════════════════════════════════════════════════
def _load_csv(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def run_cli(symbols: Optional[list] = None) -> dict:
    if not os.path.isdir(DATA_DIR):
        print(f"⚠️  DATA_DIR not found: {DATA_DIR}")
        print(f"   Set TIMI_DATA_DIR env var to your candle CSV folder.")
        return {}

    if symbols:
        paths = [os.path.join(DATA_DIR, f"{s}.csv") for s in symbols]
        paths = [p for p in paths if os.path.exists(p)]
    else:
        paths = sorted(glob.glob(os.path.join(DATA_DIR, "*.csv")))

    if not paths:
        print(f"⚠️  No CSVs found in {DATA_DIR}")
        return {}

    cost_model = CostModel()
    reports = {}
    print("═" * 78)
    print(" PHASE 0 — DATA VALIDATION")
    print("═" * 78)
    for p in paths:
        sym = os.path.splitext(os.path.basename(p))[0]
        try:
            df = _load_csv(p)
        except Exception as e:
            print(f"❌ {sym}: could not read CSV — {e}")
            continue
        # forex has legitimate weekend gaps; be lenient there
        gap_tol = 5 if classify_symbol(sym) == "forex" else 0
        rep = validate_candles(df, sym, gap_tolerance=gap_tol)
        reports[sym] = asdict(rep)
        print(rep.summary())
        for n in rep.notes:
            print(f"      ↳ {n}")

    print("\n" + "═" * 78)
    print(" PHASE 0 — COST MODEL  (per $1 stake, multiplier=100 default)")
    print("═" * 78)
    print(" Breakeven win-rate = the win rate you MUST beat for the edge to be real.")
    print("-" * 78)
    sample_symbols = symbols or list(reports.keys())
    for sym in sample_symbols:
        cls = classify_symbol(sym)
        stake = 1.0 if cls in ("spike", "jump", "forex", "crypto") else 0.35
        cr = cost_model.round_trip_cost(sym, stake)
        # assume gross win/loss ≈ stake for a rough breakeven illustration
        be = breakeven_winrate(sym, stake, avg_win=stake, avg_loss=stake,
                               cost_model=cost_model)
        print(f"  {sym:12s} [{cls:6s}] {cr.contract_type:8s} "
              f"entry_cost=${cr.entry_cost:.4f} "
              f"({cr.entry_cost_pct_of_stake:.2f}% of stake)  "
              f"breakeven_WR={be['breakeven_winrate']*100:.1f}%")

    print("\n" + "═" * 78)
    print(" ⚠️  COST NUMBERS ARE ASSUMPTIONS until you tune them to your real")
    print("    Deriv receipts:  TIMI_MULT_COMMISSION_PCT, TIMI_VIX_PAYOUT,")
    print("    TIMI_FOREX_SPREAD_PCT, TIMI_CRYPTO_SPREAD_PCT (env vars).")
    print("═" * 78)

    return {"validation": reports}


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    result = run_cli(args if args else None)
    # also drop a machine-readable report next to the data for downstream phases
    try:
        out_path = os.path.join(DATA_DIR, "_phase0_report.json")
        with open(out_path, "w") as f:
            json.dump(result, f, indent=2)
        print(f"\n💾 Machine-readable report → {out_path}")
    except Exception as e:
        print(f"(could not write report json: {e})")
