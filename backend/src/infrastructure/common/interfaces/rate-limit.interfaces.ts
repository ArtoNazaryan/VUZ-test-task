export interface IRateLimitCounter {
  count: number;
  ttlMs: number;
}

export interface IRateLimitSettings {
  ttlSeconds: number;
  limit: number;
  strictLimit: number;
}

export interface IRateLimitCounterStore {
  incrementWithExpiry(key: string, ttlMs: number): Promise<IRateLimitCounter>;
}
