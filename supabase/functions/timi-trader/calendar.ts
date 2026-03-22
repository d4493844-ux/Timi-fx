// ─────────────────────────────────────────────
// ECONOMIC CALENDAR — News Event Guard
// Checks ForexFactory for high-impact news
// Blocks forex trades 30min before/after events
// ─────────────────────────────────────────────

const FOREX_PAIRS: Record<string, string[]> = {
  "frxEURUSD": ["EUR", "USD"],
  "frxGBPUSD": ["GBP", "USD"],
  "frxUSDJPY": ["USD", "JPY"],
  "frxAUDUSD": ["AUD", "USD"],
  "frxUSDCAD": ["USD", "CAD"],
  "frxUSDCHF": ["USD", "CHF"],
  "frxEURGBP": ["EUR", "GBP"],
  "frxEURJPY": ["EUR", "JPY"],
  "frxGBPJPY": ["GBP", "JPY"],
  "frxXAUUSD": ["XAU", "USD"],
  "frxXAGUSD": ["XAG", "USD"],
};

interface NewsEvent {
  currency: string;
  impact: string;
  time: Date;
  title: string;
}

let NEWS_CACHE: NewsEvent[] = [];
let NEWS_CACHE_TIME = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function checkNewsGuard(symbol: string): Promise<{
  blocked: boolean;
  reason: string;
}> {
  // Only applies to forex/commodity pairs
  const pairs = FOREX_PAIRS[symbol];
  if (!pairs) return { blocked: false, reason: "" };

  try {
    // Refresh cache every 30 minutes
    if (Date.now() - NEWS_CACHE_TIME > CACHE_TTL) {
      await refreshNewsCache();
    }

    const now = new Date();
    const windowMs = 30 * 60 * 1000; // 30 min window

    // Check if any high-impact news for this pair's currencies
    for (const event of NEWS_CACHE) {
      if (event.impact !== "HIGH") continue;
      if (!pairs.includes(event.currency)) continue;

      const timeDiff = Math.abs(event.time.getTime() - now.getTime());
      if (timeDiff < windowMs) {
        const minsAway = Math.round((event.time.getTime() - now.getTime()) / 60000);
        const direction = minsAway > 0 ? `in ${minsAway}min` : `${Math.abs(minsAway)}min ago`;
        return {
          blocked: true,
          reason: `news_guard:${event.currency} ${event.title} ${direction}`
        };
      }
    }

    return { blocked: false, reason: "" };

  } catch(e) {
    // If calendar check fails — don't block (fail open)
    console.log(`⚠️ Calendar check failed: ${e}`);
    return { blocked: false, reason: "" };
  }
}

async function refreshNewsCache(): Promise<void> {
  try {
    // Use investing.com calendar API (free, no key needed)
    const today = new Date().toISOString().split('T')[0];
    const resp = await fetch(
      `https://economic-calendar.tradingview.com/events?from=${today}T00:00:00&to=${today}T23:59:59&countries=US,EU,GB,JP,AU,CA,CH`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        }
      }
    );

    if (!resp.ok) {
      // Fallback: use hardcoded major events schedule
      fallbackNewsSchedule();
      return;
    }

    const data = await resp.json();
    NEWS_CACHE = [];

    for (const event of (data.result || data || [])) {
      const impact = event.importance === 3 ? "HIGH" :
                     event.importance === 2 ? "MEDIUM" : "LOW";
      if (impact !== "HIGH") continue;

      NEWS_CACHE.push({
        currency: event.currency || "",
        impact,
        time: new Date(event.date || event.datetime),
        title: event.title || event.name || "Unknown",
      });
    }

    NEWS_CACHE_TIME = Date.now();
    if (NEWS_CACHE.length > 0) {
      console.log(`📅 Calendar loaded: ${NEWS_CACHE.length} high-impact events today`);
    }

  } catch(e) {
    console.log(`⚠️ Calendar refresh failed: ${e}`);
    fallbackNewsSchedule();
  }
}

function fallbackNewsSchedule(): void {
  // Hardcoded major recurring events (UTC times)
  // NFP: First Friday of month 13:30 UTC
  // FOMC: ~8x/year 19:00 UTC
  // CPI: Monthly ~13:30 UTC
  // These are approximate — real calendar is better

  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 5=Fri
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  NEWS_CACHE = [];

  // Friday 13:30 UTC ± 30min = potential NFP
  if (dayOfWeek === 5 && hour === 13 && minute >= 0 && minute <= 59) {
    NEWS_CACHE.push({
      currency: "USD",
      impact: "HIGH",
      time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 30),
      title: "NFP/Jobs Data (estimated)"
    });
  }

  NEWS_CACHE_TIME = Date.now();
}
