/**
 * Simple client-side rate limiter using localStorage.
 * Limits AI generation to N times per day.
 */

const STORAGE_KEY = "pixbase_daily_usage";
const MAX_FREE_GENERATIONS = 5;

interface UsageRecord {
  date: string; // YYYY-MM-DD
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): UsageRecord {
  if (typeof window === "undefined") return { date: getTodayKey(), count: 0 };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getTodayKey(), count: 0 };
    const record: UsageRecord = JSON.parse(raw);
    // Reset if different day
    if (record.date !== getTodayKey()) {
      return { date: getTodayKey(), count: 0 };
    }
    return record;
  } catch {
    return { date: getTodayKey(), count: 0 };
  }
}

export function getRemainingGenerations(): number {
  const usage = getUsage();
  return Math.max(0, MAX_FREE_GENERATIONS - usage.count);
}

export function canGenerate(): boolean {
  return getRemainingGenerations() > 0;
}

export function recordGeneration(): void {
  const usage = getUsage();
  usage.count += 1;
  usage.date = getTodayKey();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {
    // localStorage might be unavailable
  }
}

export function getMaxGenerations(): number {
  return MAX_FREE_GENERATIONS;
}
