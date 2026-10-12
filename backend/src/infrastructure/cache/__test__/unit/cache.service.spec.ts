import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { RedisService } from '@infrastructure/redis/service/redis.service.js';
import { InMemoryRedisService } from '@infrastructure/test/mocks/redis/in-memory-redis.service.js';
import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function createCacheService(redis: object): Promise<CacheService> {
  const moduleRef = await Test.createTestingModule({
    providers: [CacheService, { provide: RedisService, useValue: redis }],
  }).compile();

  return moduleRef.get(CacheService);
}

describe('CacheService', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  describe('getOrSetVersioned', () => {
    it('loads and stores the value on a cache miss', async () => {
      const redis = new InMemoryRedisService();
      const service = await createCacheService(redis);
      const load = vi.fn(() => Promise.resolve({ name: 'Ryu' }));

      await expect(service.getOrSetVersioned('characters', 'item:1', 60, load)).resolves.toEqual({
        name: 'Ryu',
      });
      await expect(redis.get('characters:v0:item:1')).resolves.toBe('{"name":"Ryu"}');
      expect(load).toHaveBeenCalledTimes(1);
    });

    it('returns the stored value without loading on a cache hit', async () => {
      const redis = new InMemoryRedisService();
      const service = await createCacheService(redis);
      const load = vi.fn(() => Promise.resolve({ name: 'Ryu' }));

      await service.getOrSetVersioned('characters', 'item:1', 60, load);
      await service.getOrSetVersioned('characters', 'item:1', 60, load);

      expect(load).toHaveBeenCalledTimes(1);
    });

    it('loads again after the namespace version is bumped', async () => {
      const service = await createCacheService(new InMemoryRedisService());
      const load = vi
        .fn<() => Promise<string>>()
        .mockResolvedValueOnce('old')
        .mockResolvedValueOnce('new');

      await service.getOrSetVersioned('characters', 'filters', 60, load);
      await service.bumpVersion('characters');

      await expect(service.getOrSetVersioned('characters', 'filters', 60, load)).resolves.toBe(
        'new',
      );
    });

    it('falls back to the loader when Redis is unavailable', async () => {
      const brokenRedis = {
        get: vi.fn(() => Promise.reject(new Error('Connection is closed.'))),
        set: vi.fn(),
      };
      const service = await createCacheService(brokenRedis);

      await expect(
        service.getOrSetVersioned('characters', 'item:1', 60, () => Promise.resolve('fresh')),
      ).resolves.toBe('fresh');
      expect(brokenRedis.set).not.toHaveBeenCalled();
    });

    it('still returns the loaded value when writing to Redis fails', async () => {
      const service = await createCacheService({
        get: vi.fn(() => Promise.resolve(null)),
        set: vi.fn(() => Promise.reject(new Error('OOM'))),
      });

      await expect(
        service.getOrSetVersioned('characters', 'item:1', 60, () => Promise.resolve('fresh')),
      ).resolves.toBe('fresh');
    });

    it('does not store anything when the loader throws', async () => {
      const redis = new InMemoryRedisService();
      const service = await createCacheService(redis);

      await expect(
        service.getOrSetVersioned('characters', 'item:9', 60, () =>
          Promise.reject(new Error('not found')),
        ),
      ).rejects.toThrow('not found');
      await expect(redis.get('characters:v0:item:9')).resolves.toBeNull();
    });
  });

  describe('bumpVersion', () => {
    it('increments the namespace version', async () => {
      const service = await createCacheService(new InMemoryRedisService());

      await service.bumpVersion('characters');

      await expect(service.bumpVersion('characters')).resolves.toBe(2);
    });

    it('returns null instead of throwing when Redis is unavailable', async () => {
      const service = await createCacheService({
        incr: vi.fn(() => Promise.reject(new Error('Connection is closed.'))),
      });

      await expect(service.bumpVersion('characters')).resolves.toBeNull();
    });
  });

  describe('getOrSet', () => {
    it('stores a plain key and serves it from the cache afterwards', async () => {
      const redis = new InMemoryRedisService();
      const service = await createCacheService(redis);
      const load = vi.fn(() => Promise.resolve({ top: [1, 2] }));

      await service.getOrSet('popularity:top', 60, load);
      await service.getOrSet('popularity:top', 60, load);

      expect(load).toHaveBeenCalledTimes(1);
      await expect(redis.get('popularity:top')).resolves.toBe('{"top":[1,2]}');
    });
  });

  describe('set', () => {
    it('overwrites a cached value', async () => {
      const redis = new InMemoryRedisService();
      const service = await createCacheService(redis);

      await service.set('popularity:top', { top: [3] }, 60);

      await expect(redis.get('popularity:top')).resolves.toBe('{"top":[3]}');
    });
  });
});
