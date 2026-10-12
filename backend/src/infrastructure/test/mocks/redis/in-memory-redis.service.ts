export class InMemoryRedisService {
  private readonly store = new Map<string, string>();

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
}
