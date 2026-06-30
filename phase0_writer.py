"""
═══════════════════════════════════════════════════════════════════════════
 TIMI — PHASE 0 WRITER  (research → live bridge, fully automated)
═══════════════════════════════════════════════════════════════════════════

 WHAT IT DOES
 ------------
 Runs Phase 0 validation + cost model over every symbol's candle CSV, then
 UPSERTS the results into the Supabase `instrument_costs` table. The live
 engine (daily_run) reads that table each cycle and SKIPS any symbol whose
 latest data failed validation (data_ok = false). Fail-open by design: if
 this writer never runs, the table is empty and the engine trades normally.

 AUTOMATION
 ----------
 Designed to run on a schedule (Supabase cron, GitHub Action, or right after
 collect_data.py). It is idempotent — safe to run as often as you like; each
 run overwrites the previous row per symbol.

 SAFETY
 ------
 - Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the environment.
   NEVER hardcode the service key. If either is missing it prints a clear
   error and exits WITHOUT touching anything.
 - Writes only to `instrument_costs`. Touches no trading table, no bot_config.
 - The cost numbers it writes are only as accurate as the cost assumptions in
   phase0_data_quality.py. Tune those env vars to your real Deriv receipts.

 USAGE
 -----
     export SUPABASE_URL=https://xxxx.supabase.co
     export SUPABASE_SERVICE_ROLE_KEY=eyJ...        # service role, not anon
     export TIMI_DATA_DIR=/workspaces/Timi-fx/ml/data
     python phase0_writer.py                        # all symbols
     python phase0_writer.py R_75 BOOM500           # specific symbols
═══════════════════════════════════════════════════════════════════════════
"""

import os
import sys
import glob
import json
from datetime import datetime, timezone

import pandas as pd

# Reuse Phase 0's logic — do not re-implement it here.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from phase0_data_quality import (
    validate_candles, classify_symbol, CostModel, breakeven_winrate,
    DATA_DIR, EXPECTED_GRANULARITY_SEC,
)

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def _require_env():
    """Hard-stop with a clear message if credentials are missing. We refuse to
    silently do nothing or, worse, write to the wrong place."""
    missing = []
    if not SUPABASE_URL:
        missing.append("SUPABASE_URL")
    if not SUPABASE_SERVICE_ROLE_KEY:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if missing:
        print("❌ Missing required env var(s): " + ", ".join(missing))
        print("   Set them before running. The service-role key must be the")
        print("   SERVICE role (not anon) so the upsert can bypass RLS.")
        sys.exit(1)


def _get_client():
    """Create a Supabase client. Imported lazily so the file can be inspected
    / unit-tested without supabase installed."""
    try:
        from supabase import create_client
    except ImportError:
        print("❌ supabase package not installed.  pip install supabase")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def build_row(symbol: str, df: pd.DataFrame, cost_model: CostModel) -> dict:
    """Validate one symbol and produce the instrument_costs row for it."""
    cls = classify_symbol(symbol)
    gap_tol = 5 if cls == "forex" else 0
    rep = validate_candles(df, symbol, gap_tolerance=gap_tol)

    # Cost + breakeven at the same reference stake the engine would clamp to.
    stake = 1.0 if cls in ("spike", "jump", "forex", "crypto") else 0.35
    cr = cost_model.round_trip_cost(symbol, stake)
    be = breakeven_winrate(symbol, stake, avg_win=stake, avg_loss=stake,
                           cost_model=cost_model)

    return {
        "symbol": symbol,
        "instrument_class": cls,
        "contract_type": cr.contract_type,
        "data_ok": bool(rep.passed),          # <-- the ONLY field the engine gates on
        "breakeven_wr": float(be["breakeven_winrate"]),
        "entry_cost": float(cr.entry_cost),
        "rows_validated": int(rep.rows),
        "ohlc_violations": int(rep.ohlc_violations),
        "gaps": int(rep.gaps),
        "flatlines": int(rep.flatlines),
        "extreme_returns": int(rep.extreme_returns),
        "notes": "; ".join(rep.notes)[:500] if rep.notes else "",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def run(symbols=None, dry_run=False):
    if not os.path.isdir(DATA_DIR):
        print(f"❌ DATA_DIR not found: {DATA_DIR}  (set TIMI_DATA_DIR)")
        sys.exit(1)

    if symbols:
        paths = [os.path.join(DATA_DIR, f"{s}.csv") for s in symbols]
        paths = [p for p in paths if os.path.exists(p)]
    else:
        paths = sorted(glob.glob(os.path.join(DATA_DIR, "*.csv")))
        # ignore our own report artifacts
        paths = [p for p in paths if not os.path.basename(p).startswith("_")]

    if not paths:
        print(f"⚠️  No candle CSVs found in {DATA_DIR} — nothing to write.")
        return []

    cost_model = CostModel()
    rows = []
    print("═" * 70)
    print(" PHASE 0 WRITER — validating + costing")
    print("═" * 70)
    for p in paths:
        sym = os.path.splitext(os.path.basename(p))[0]
        try:
            df = pd.read_csv(p)
        except Exception as e:
            print(f"  ❌ {sym}: could not read CSV — {e}")
            continue
        row = build_row(sym, df, cost_model)
        rows.append(row)
        flag = "✅ data_ok" if row["data_ok"] else "❌ DATA_BAD (engine will skip)"
        print(f"  {sym:12s} {flag}  breakeven_wr={row['breakeven_wr']*100:.1f}%"
              f"  cost=${row['entry_cost']:.4f}")

    if dry_run:
        print("\n(dry run — not writing to Supabase)")
        return rows

    _require_env()
    client = _get_client()
    print("\n── upserting to instrument_costs ──")
    written = 0
    for row in rows:
        try:
            client.table("instrument_costs").upsert(row, on_conflict="symbol").execute()
            written += 1
        except Exception as e:
            print(f"  ⚠️  upsert failed for {row['symbol']}: {e}")
    print(f"✅ wrote {written}/{len(rows)} rows to instrument_costs")
    return rows


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    flags = [a for a in sys.argv[1:] if a.startswith("-")]
    dry = "--dry-run" in flags or "-n" in flags
    run(args if args else None, dry_run=dry)
