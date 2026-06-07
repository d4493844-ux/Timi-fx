// ═══════════════════════════════════════════════════════════
// PASTE THIS INTO YOUR TERMINAL TO APPLY ALL NEWS CHANGES
// ═══════════════════════════════════════════════════════════

// ── STEP 1: Add news filter to edge function ─────────────────
// Run this in your codespace terminal:

python3 - << 'PYEOF'
path = "supabase/functions/timi-trader/index.ts"
txt  = open(path).read()

# Add news filter function before Deno.serve
news_fn = '''
// ── High Impact News Filter ────────────────────────────────────
// Fetches ForexFactory calendar and blocks/reduces confidence
// for forex pairs when high impact news is imminent (<30 min)
const CURRENCY_TO_PAIRS: Record<string,string[]> = {
  "USD": ["frxEURUSD","frxGBPUSD","frxUSDJPY","frxXAUUSD","frxXAGUSD","frxAUDUSD","frxUSDCAD","frxUSDCHF"],
  "EUR": ["frxEURUSD","frxEURGBP","frxEURJPY"],
  "GBP": ["frxGBPUSD","frxGBPJPY","frxEURGBP"],
  "JPY": ["frxUSDJPY","frxGBPJPY","frxEURJPY"],
  "XAU": ["frxXAUUSD"],
  "XAG": ["frxXAGUSD"],
  "AUD": ["frxAUDUSD","frxAUDJPY"],
  "CAD": ["frxUSDCAD"],
  "CHF": ["frxUSDCHF"],
  "NZD": ["frxNZDUSD"],
};

let _newsCache: { data: any[]; ts: number } | null = null;
const NEWS_CACHE_MS = 5 * 60 * 1000; // 5 minutes

async function fetchHighImpactNews(): Promise<any[]> {
  // Use cache to avoid hammering the API every 3 minutes
  if (_newsCache && Date.now() - _newsCache.ts < NEWS_CACHE_MS) {
    return _newsCache.data;
  }
  try {
    const res = await fetch(
      "https://www.jblanked.com/news/api/forex-factory/calendar/week/?impact=High",
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events = Array.isArray(data) ? data : [];
    _newsCache = { data: events, ts: Date.now() };
    return events;
  } catch {
    return _newsCache?.data || [];
  }
}

async function getNewsImpact(symbol: string): Promise<{
  blocked: boolean;
  reduced: boolean;
  reason: string;
  minutesUntil: number;
}> {
  // Only applies to forex pairs
  if (!symbol.startsWith("frx")) {
    return { blocked:false, reduced:false, reason:"", minutesUntil:999 };
  }

  const events = await fetchHighImpactNews();
  const now    = Date.now();

  for (const ev of events) {
    const cur      = ev.currency || ev.economy || "";
    const pairs    = CURRENCY_TO_PAIRS[cur] || [];
    if (!pairs.includes(symbol)) continue;

    const evTime   = new Date(ev.date || ev.data).getTime();
    const diffMin  = (evTime - now) / 60000;

    // Hard block: 15 min before to 15 min after high impact event
    if (diffMin > -15 && diffMin < 15) {
      return {
        blocked: true, reduced: false,
        reason: `news_block: ${ev.title||ev.name} in ${Math.round(diffMin)}min`,
        minutesUntil: diffMin
      };
    }
    // Soft reduce: 30 min window around event
    if (diffMin > -30 && diffMin < 30) {
      return {
        blocked: false, reduced: true,
        reason: `news_caution: ${ev.title||ev.name} in ${Math.round(diffMin)}min`,
        minutesUntil: diffMin
      };
    }
  }
  return { blocked:false, reduced:false, reason:"", minutesUntil:999 };
}
'''

# Inject before Deno.serve
idx = txt.find("Deno.serve(async (req)")
if idx > 0:
    txt = txt[:idx] + news_fn + "\n" + txt[idx:]
    print("✅ News filter functions injected")
else:
    print("❌ Deno.serve not found")

# Wire news filter into forex signal path
# Find where ICT forex signal is called and add news check before it
old = '''        // ── ICT / Forex signal ─'''
new = '''        // ── News impact check for forex ──────────────────────────
        if (!isSynthetic && !isSpikeSym) {
          const newsImpact = await getNewsImpact(symbol);
          if (newsImpact.blocked) {
            scanLog.push(`${symbol}: ${newsImpact.reason}`);
            continue;
          }
          if (newsImpact.reduced) {
            scanLog.push(`${symbol}: ${newsImpact.reason} — conf-=20`);
            sig.confidence = Math.max(10, (sig.confidence||70) - 20);
          }
        }

        // ── ICT / Forex signal ─'''

if old in txt:
    txt = txt.replace(old, new, 1)
    open(path, "w").write(txt)
    print("✅ News filter wired into forex signal path")
else:
    # Try alternate marker
    old2 = "// ── ICT Forex Signal"
    idx2 = txt.find(old2)
    if idx2 > 0:
        line = txt[:idx2].count('\n') + 1
        print(f"❌ exact marker not found — ICT forex at line {line}")
        print(repr(txt[idx2:idx2+80]))
    else:
        print("❌ ICT signal marker not found")

open(path, "w").write(txt)
PYEOF

// ── STEP 2: Add News page to frontend ────────────────────────
// Copy ForexNews.jsx to your project:
// cp /path/to/ForexNews.jsx timi/frontend/src/components/ForexNews.jsx

// ── STEP 3: Update BottomNav.jsx ─────────────────────────────
// Add news tab to the tabs array:

/*
const tabs = [
  { id:"dashboard", icon:"◈",  label:"DASH" },
  { id:"trades",    icon:"◆",  label:"TRADES" },
  { id:"signals",   icon:"◉",  label:"SIGNALS" },
  { id:"news",      icon:"📰", label:"NEWS" },     // ← ADD THIS
  { id:"ai",        icon:"🧠", label:"AI" },
  { id:"remote",    icon:"☁️", label:"REMOTE" },
  { id:"growth",    icon:"📈", label:"GROWTH" },
  { id:"settings",  icon:"✛",  label:"SETTINGS" },
];
*/

// ── STEP 4: Update App.js ─────────────────────────────────────
// Add import and route for News page:

/*
import ForexNews from './components/ForexNews';

// In your page routing switch/if:
{page === "news" && <ForexNews />}
*/
