import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Characters API', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createIntegrationApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/characters/filters', () => {
    it('returns every universe, tag and ability from the seeded data', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/characters/filters');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        universes: ['Dragon Ball Z', 'Mortal Kombat', 'Street Fighter', 'Super Smash Bros'],
        abilities: ['Power', 'Mobility', 'Technique', 'Survivability', 'Energy'],
      });
      expect(response.body).toHaveProperty('tags.length', 21);
    });
  });

  describe('GET /api/v1/characters/:id', () => {
    it('returns a character in the API shape', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/characters/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Cassie Cage',
        quote: '"Who\'s a good girl?"',
        image: 'https://cdn.dashfight.com/728b2c886100977000e196f40af079fbe68bb73b.png',
        thumbnail: 'https://media.eventhubs.com/images/characters/mk11/cassie-cage.png',
        universe: 'Mortal Kombat',
        tags: [{ name: 'human', slot: 1 }],
        abilities: [
          { name: 'Power', score: 3 },
          { name: 'Mobility', score: 5 },
          { name: 'Technique', score: 7 },
          { name: 'Survivability', score: 6 },
          { name: 'Energy', score: 4 },
        ],
      });
    });

    it('returns null for a missing quote', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/characters/25');

      expect(response.body).toMatchObject({ name: 'RoboCop', quote: null });
    });

    it('returns an empty tag list for a character without tags', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/characters/31');

      expect(response.body).toMatchObject({ name: 'Skarlet', tags: [] });
    });

    it('returns null for a missing thumbnail', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/characters/42');

      expect(response.body).toMatchObject({ name: 'Android 21 (Lab Coat)', thumbnail: null });
    });

    it('returns 404 NOT_FOUND for an unknown id', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/characters/9999');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ error: ErrorCode.NotFound });
    });

    it('returns 400 for a non numeric id', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/characters/abc');

      expect(response.status).toBe(400);
    });
  });
});
