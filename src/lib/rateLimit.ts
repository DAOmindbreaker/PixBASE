/**
 * Pixelon — Rate Limiting
 *
 * Client-side: localStorage for UI feedback (remaining count display)
 * Server-side: in-memory Map for actual enforcement (resets on deploy)
 *
 * Free tier: 5 AI generations per day per IP address.
 */

// ============================================
// Shared constants
// ============================================

export const MAX_FREE_GENERATIONS = 5;

// ============================================
// Client-side (browser only — for UI display)
// ============================================

const STORAGE_KEY = "pixelon_daily_usage";

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

// ============================================
// Server-side rate limiting (in-memory)
// ============================================

interface ServerUsageRecord {
  date: string;
  count: number;
}

// In-memory store — resets on Vercel cold start, which is fine
// For production at scale, use Redis or KV store
const serverUsageMap = new Map<string, ServerUsageRecord>();

// Clean up old entries periodically (every 100 checks)
let cleanupCounter = 0;

function cleanupOldEntries() {
  cleanupCounter++;
  if (cleanupCounter < 100) return;
  cleanupCounter = 0;

  const today = getTodayKey();
  for (const [key, record] of serverUsageMap) {
    if (record.date !== today) {
      serverUsageMap.delete(key);
    }
  }
}

/**
 * Check if an IP address can generate (server-side).
 * Returns { allowed: boolean, remaining: number }
 */
export function checkServerRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  total: number;
} {
  cleanupOldEntries();

  const today = getTodayKey();
  const key = `generate:${ip}`;

  let record = serverUsageMap.get(key);
  if (!record || record.date !== today) {
    record = { date: today, count: 0 };
  }

  const remaining = Math.max(0, MAX_FREE_GENERATIONS - record.count);

  return {
    allowed: remaining > 0,
    remaining,
    total: MAX_FREE_GENERATIONS,
  };
}

/**
 * Record a generation for an IP address (server-side).
 */
export function recordServerGeneration(ip: string): void {
  const today = getTodayKey();
  const key = `generate:${ip}`;

  let record = serverUsageMap.get(key);
  if (!record || record.date !== today) {
    record = { date: today, count: 0 };
  }

  record.count += 1;
  record.date = today;
  serverUsageMap.set(key, record);
}
