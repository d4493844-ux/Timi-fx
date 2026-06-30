const fs = require("fs");

// ══════════════════════════════════════════════════════════════════════════
// TIMI — STATISTICAL SIGNIFICANCE SUITE  (v1.0)
// ══════════════════════════════════════════════════════════════════════════
// Reads backtest_trades.json (produced by backtest_net_v2_spikes.js) and asks,
// per symbol, the only question that matters:
//
//     "Is this edge REAL, or did the backtest get lucky / cheat?"
//
// It does NOT re-run the strategy. It interrogates the trade log the backtest
// already produced, using four independent tests. An edge that's real passes
// most of them; an artifact fails them.
//
// THE FOUR TESTS
// --------------
// 1. OUT-OF-SAMPLE SPLIT  — split trades chronologically 70/30. Does the win
//    rate / profitability on the LAST 30% (never "seen") match the first 70%?
//    A real edge holds up. An overfit one collapses on the held-out slice.
//
// 2. BOOTSTRAP CONFIDENCE — resample trades 10,000× with replacement. Gives a
//    95% confidence interval on mean net PnL. If the interval includes 0 (or
//    goes negative), the "edge" is statistically indistinguishable from break-
//    even — i.e. could easily be noise.
//
// 3. PERMUTATION TEST     — shuffle the win/loss labels 10,000× to build the
//    distribution of outcomes you'd get by RANDOM entries with the same win
//    rate. p-value = fraction of random shuffles that beat the real result.
//    p < 0.05 means the real sequence is better than chance would produce.
//
// 4. SKEW / TAIL CHECK    — high win rate with negative skew (many tiny wins,
//    rare big losses) is the classic "looks great, blows up" pattern. Flags
//    when a strategy's profitability depends on a fragile win-rate cushion.
//
// USAGE
// -----
//     node significance_suite.js                    # reads backtest_trades.json
//     node significance_suite.js my_trades.json     # custom file
// ══════════════════════════════════════════════════════════════════════════

const TRADES_FILE = process.argv[2] || "backtest_trades.json";
const N_BOOT = 10000;
const N_PERM = 10000;

// ── deterministic RNG so results are reproducible run-to-run ──
let _seed = 12345;
function rand() { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; }

function mean(a) { return a.reduce((x, y) => x + y, 0) / a.length; }
function std(a) { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); }

function skewness(a) {
  const m = mean(a), s = std(a);
  if (s === 0) return 0;
  return mean(a.map(x => ((x - m) / s) ** 3));
}

// ── TEST 1: out-of-sample split ──
function oosSplit(trades) {
  const n = trades.length;
  if (n < 20) return { verdict: "n/a", note: "too few trades" };
  const cut = Math.floor(n * 0.7);
  const train = trades.slice(0, cut), test = trades.slice(cut);
  const trWR = train.filter(t => t.won).length / train.length;
  const teWR = test.filter(t => t.won).length / test.length;
  const trPnL = train.reduce((s, t) => s + t.net_pnl, 0);
  const tePnL = test.reduce((s, t) => s + t.net_pnl, 0);
  // does the held-out slice stay profitable AND keep a similar win rate?
  const wrDrop = trWR - teWR;
  const testProfitable = tePnL > 0;
  const holds = testProfitable && wrDrop < 0.10;   // <10pp WR decay, still green
  return {
    verdict: holds ? "✅ holds" : "❌ breaks",
    trainWR: +(trWR * 100).toFixed(1), testWR: +(teWR * 100).toFixed(1),
    trainPnL: +trPnL.toFixed(2), testPnL: +tePnL.toFixed(2),
    note: holds ? "edge survives on unseen data"
                : testProfitable ? `win rate decayed ${(wrDrop * 100).toFixed(1)}pp out-of-sample`
                                 : "loses money on unseen data",
  };
}

// ── TEST 2: bootstrap CI on mean net PnL ──
function bootstrap(trades) {
  const pnls = trades.map(t => t.net_pnl);
  const n = pnls.length;
  if (n < 20) return { verdict: "n/a", note: "too few trades" };
  const means = [];
  for (let b = 0; b < N_BOOT; b++) {
    let s = 0;
    for (let k = 0; k < n; k++) s += pnls[(rand() * n) | 0];
    means.push(s / n);
  }
  means.sort((a, b) => a - b);
  const lo = means[(0.025 * N_BOOT) | 0], hi = means[(0.975 * N_BOOT) | 0];
  const realMean = mean(pnls);
  const ciExcludesZero = lo > 0;
  return {
    verdict: ciExcludesZero ? "✅ positive" : "❌ includes ≤0",
    meanPnL: +realMean.toFixed(4),
    ci95: [+lo.toFixed(4), +hi.toFixed(4)],
    note: ciExcludesZero ? "mean edge is reliably above zero"
                         : "95% CI includes zero/negative — could be noise",
  };
}

// ── TEST 3: permutation test ──
function permutation(trades) {
  const pnls = trades.map(t => t.net_pnl);
  const n = pnls.length;
  if (n < 20) return { verdict: "n/a", note: "too few trades" };
  const realTotal = pnls.reduce((a, b) => a + b, 0);
  // Under the null, signs of returns are random. Shuffle signs, recompute total.
  const mags = pnls.map(Math.abs);
  let beat = 0;
  for (let p = 0; p < N_PERM; p++) {
    let s = 0;
    for (let k = 0; k < n; k++) s += mags[k] * (rand() < 0.5 ? -1 : 1);
    if (s >= realTotal) beat++;
  }
  const pval = beat / N_PERM;
  return {
    verdict: pval < 0.05 ? "✅ significant" : "❌ not significant",
    pValue: +pval.toFixed(4),
    note: pval < 0.05 ? "beats random entries (p<0.05)"
                      : "indistinguishable from random sign flips",
  };
}

// ── TEST 4: skew / tail fragility ──
function tailCheck(trades) {
  const pnls = trades.map(t => t.net_pnl);
  const wr = trades.filter(t => t.won).length / trades.length;
  const sk = skewness(pnls);
  const worst = Math.min(...pnls);
  const avgWin = mean(pnls.filter(x => x > 0) || [0]);
  const avgLoss = mean(pnls.filter(x => x < 0).length ? pnls.filter(x => x < 0) : [0]);
  // negative skew + high win rate = fragile (many small wins, rare big losses)
  const fragile = sk < -0.5 && wr > 0.70;
  return {
    verdict: fragile ? "⚠️ fragile" : "✅ ok",
    skew: +sk.toFixed(2), winRate: +(wr * 100).toFixed(1),
    worstTrade: +worst.toFixed(3),
    note: fragile ? "high win rate masks negative skew — spike-cluster risk"
                  : "return shape not pathologically skewed",
  };
}

function overallVerdict(t1, t2, t3, t4) {
  // count passes among the three hard tests (skew is a warning, not a gate)
  const passes = [t1.verdict.includes("✅"), t2.verdict.includes("✅"), t3.verdict.includes("✅")]
    .filter(Boolean).length;
  if (passes === 3 && !t4.verdict.includes("⚠️")) return "🟢 LIKELY REAL";
  if (passes === 3 && t4.verdict.includes("⚠️")) return "🟡 REAL BUT FRAGILE";
  if (passes === 2) return "🟡 WEAK / UNCERTAIN";
  return "🔴 LIKELY NOT REAL";
}

function main() {
  if (!fs.existsSync(TRADES_FILE)) {
    console.log(`❌ ${TRADES_FILE} not found. Run the backtest first to generate it.`);
    process.exit(1);
  }
  const all = JSON.parse(fs.readFileSync(TRADES_FILE, "utf8"));
  const bySymbol = {};
  for (const t of all) (bySymbol[t.symbol] ||= []).push(t);

  console.log("═".repeat(92));
  console.log(" TIMI STATISTICAL SIGNIFICANCE SUITE — is the edge real?");
  console.log("═".repeat(92));
  console.log(` ${all.length} trades across ${Object.keys(bySymbol).length} symbols`);
  console.log(` Bootstrap: ${N_BOOT} resamples | Permutation: ${N_PERM} shuffles\n`);

  const summary = [];
  for (const [sym, trades] of Object.entries(bySymbol)) {
    const t1 = oosSplit(trades);
    const t2 = bootstrap(trades);
    const t3 = permutation(trades);
    const t4 = tailCheck(trades);
    const verdict = overallVerdict(t1, t2, t3, t4);
    summary.push({ sym, n: trades.length, verdict, t1, t2, t3, t4 });

    console.log("─".repeat(92));
    console.log(`📊 ${sym}  (${trades.length} trades)   →   ${verdict}`);
    console.log(`   1. Out-of-sample:  ${t1.verdict.padEnd(12)} train WR ${t1.trainWR}% → test WR ${t1.testWR}% | test PnL $${t1.testPnL}`);
    console.log(`                       ${t1.note}`);
    console.log(`   2. Bootstrap CI:   ${t2.verdict.padEnd(12)} mean $${t2.meanPnL} | 95% CI [${t2.ci95?.[0]}, ${t2.ci95?.[1]}]`);
    console.log(`                       ${t2.note}`);
    console.log(`   3. Permutation:    ${t3.verdict.padEnd(12)} p=${t3.pValue}`);
    console.log(`                       ${t3.note}`);
    console.log(`   4. Tail/skew:      ${t4.verdict.padEnd(12)} skew ${t4.skew} | WR ${t4.winRate}% | worst $${t4.worstTrade}`);
    console.log(`                       ${t4.note}`);
  }

  console.log("\n" + "═".repeat(92));
  console.log(" VERDICT SUMMARY");
  console.log("═".repeat(92));
  console.log("Symbol".padEnd(14) + "Trades".padStart(8) + "  Verdict");
  console.log("─".repeat(92));
  for (const s of summary) {
    console.log(s.sym.padEnd(14) + `${s.n}`.padStart(8) + "  " + s.verdict);
  }
  console.log("═".repeat(92));
  const real = summary.filter(s => s.verdict.includes("🟢"));
  const fragile = summary.filter(s => s.verdict.includes("🟡"));
  const fake = summary.filter(s => s.verdict.includes("🔴"));
  console.log(`\n🟢 Likely real    (${real.length}): ${real.map(s => s.sym).join(", ") || "none"}`);
  console.log(`🟡 Fragile/weak   (${fragile.length}): ${fragile.map(s => s.sym).join(", ") || "none"}`);
  console.log(`🔴 Likely not real(${fake.length}): ${fake.map(s => s.sym).join(", ") || "none"}`);
  console.log(`\n💡 "Likely real" means it survived out-of-sample, has a positive bootstrap CI,`);
  console.log(`   and beats random entries. It does NOT guarantee future profit — only that`);
  console.log(`   the backtest result isn't obviously luck or overfitting.`);
}

main();
