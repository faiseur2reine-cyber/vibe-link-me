/**
 * Client-side click throttle.
 * Prevents the same link from being "clicked" more than once per cooldown.
 * Returns true if the click should proceed, false if throttled.
 */

const lastClicks = new Map<string, number>();
const COOLDOWN_MS = 1500; // 1.5 seconds between clicks on the same link

export function throttleClick(linkId: string): boolean {
  const now = Date.now();
  const last = lastClicks.get(linkId);
  if (last && now - last < COOLDOWN_MS) return false;
  lastClicks.set(linkId, now);

  // Cleanup old entries (prevent memory leak)
  if (lastClicks.size > 50) {
    for (const [key, time] of lastClicks) {
      if (now - time > 10000) lastClicks.delete(key);
    }
  }

  return true;
}
