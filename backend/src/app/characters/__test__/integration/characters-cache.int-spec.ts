import { CacheService } from '@infrastructure/cache/service/cache.service.js';
import { CHARACTERS_CACHE_NAMESPACE } from '@infrastructure/common/constants/cache.constants.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

interface INamed {
  name: string;
}

interface IListPage {
  items: INamed[];
}

describe('Characters caching', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await createIntegrationApp();
    prismaService = app.get(PrismaService);
  });

  afterEach(async () => {
    await prismaService.character.update({ where: { id: 1 }, data: { name: 'Cassie Cage' } });
  });

  afterAll(async () => {
    await app.close();
  });

  async function getCharacterName(): Promise<string> {
    const response = await request(app.getHttpServer()).get('/api/v1/characters/1');

    return (response.body as INamed).name;
  }

  async function getFirstPageNames(): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .get('/api/v1/characters')
      .query({ universes: 'Mortal Kombat', search: 'cassie' });

    return (response.body as IListPage).items.map((item) => item.name);
  }

  it('serves an identical character request from the cache until the version changes', async () => {
    await expect(getCharacterName()).resolves.toBe('Cassie Cage');

    await prismaService.character.update({ where: { id: 1 }, data: { name: 'Cassie Cage II' } });

    await expect(getCharacterName()).resolves.toBe('Cassie Cage');

    await app.get(CacheService).bumpVersion(CHARACTERS_CACHE_NAMESPACE);

    await expect(getCharacterName()).resolves.toBe('Cassie Cage II');
  });

  it('serves an identical list request from the cache until the version changes', async () => {
    await expect(getFirstPageNames()).resolves.toEqual(['Cassie Cage']);

    await prismaService.character.update({ where: { id: 1 }, data: { name: 'Cassie Cage II' } });

    await expect(getFirstPageNames()).resolves.toEqual(['Cassie Cage']);

    await app.get(CacheService).bumpVersion(CHARACTERS_CACHE_NAMESPACE);

    await expect(getFirstPageNames()).resolves.toEqual(['Cassie Cage II']);
  });
});
