import type { IRateLimitCounter } from '@infrastructure/common/interfaces/rate-limit.interfaces.js';

interface ICounterEntry {
  count: number;
  expiresAt: number;
}

export class InMemoryRedisService {
  private readonly store = new Map<string, string>();
  private readonly counters = new Map<string, ICounterEntry>();

  ping(): Promise<string> {
    return Promise.resolve('PONG');
  }

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string): Promise<void> {
    this.store.set(key, value);

    return Promise.resolve();
  }

  incr(key: string): Promise<number> {
    const next = Number(this.store.get(key) ?? 0) + 1;

    this.store.set(key, String(next));

    return Promise.resolve(next);
  }

  incrementWithExpiry(key: string, ttlMs: number): Promise<IRateLimitCounter> {
    const now = Date.now();
    const current = this.counters.get(key);
    const entry =
      current && current.expiresAt > now
        ? { count: current.count + 1, expiresAt: current.expiresAt }
        : { count: 1, expiresAt: now + ttlMs };

    this.counters.set(key, entry);

    return Promise.resolve({ count: entry.count, ttlMs: entry.expiresAt - now });
  }
}
