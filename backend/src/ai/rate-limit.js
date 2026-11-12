// Per-user request limit for the AI resume feedback endpoint (#139), so one user can't
// burn through the whole team's AI provider quota (or budget) on their own. In-memory is
// enough for a single backend process; it resets on restart.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map();

// Test-only: clears all tracked requests. Production code never calls this; it exists so
// tests with several independent in-memory databases (whose autoincrement ids restart at
// 1 each) don't share a rate-limit bucket just because they reused the same small id.
export function resetRateLimitForTests() {
  hits.clear();
}

// Returns true and records the request if the user is under the limit, false otherwise.
export function allowRequest(userId, now = Date.now()) {
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(userId, recent);
    return false;
  }
  recent.push(now);
  hits.set(userId, recent);
  return true;
}
