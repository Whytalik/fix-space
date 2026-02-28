const DEFAULT_TTL = 30_000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export function getCached<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        expiresAt: Date.now() + ttl,
      }),
    );
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      sessionStorage.clear();
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            data,
            expiresAt: Date.now() + ttl,
          }),
        );
      } catch {
        // Storage is still full after clearing — skip caching, app will fetch fresh data next load
      }
    }
  }
}

export function clearCached(...keys: string[]): void {
  keys.forEach((key) => sessionStorage.removeItem(key));
}
