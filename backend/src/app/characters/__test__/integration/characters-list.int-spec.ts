import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface IListedCharacter {
  id: number;
  name: string;
  universe: string;
  tags: { name: string }[];
}

interface IListPage {
  items: IListedCharacter[];
  nextCursor: string | null;
}

describe('GET /api/v1/characters', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createIntegrationApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function getPage(query: Record<string, string>): Promise<IListPage> {
    const response = await request(app.getHttpServer()).get('/api/v1/characters').query(query);

    expect(response.status).toBe(200);

    return response.body as IListPage;
  }

  async function getAll(query: Record<string, string>): Promise<IListedCharacter[]> {
    const items: IListedCharacter[] = [];
    let cursor: string | null = null;

    do {
      const page: IListPage = await getPage(cursor ? { ...query, cursor } : query);

      items.push(...page.items);
      cursor = page.nextCursor;
    } while (cursor);

    return items;
  }

  it('returns the first 20 characters sorted by name with a cursor', async () => {
    const page = await getPage({});
    const names = page.items.map((item) => item.name);

    expect(page.items).toHaveLength(20);
    expect(names).toEqual([...names].sort((left, right) => (left < right ? -1 : 1)));
    expect(page.nextCursor).toEqual(expect.any(String));
  });

  it('pages through all 208 characters without duplicates or gaps', async () => {
    const items = await getAll({ limit: '50' });

    expect(items).toHaveLength(208);
    expect(new Set(items.map((item) => item.id)).size).toBe(208);
  });

  it('pages through the same characters in reverse with sort=-name', async () => {
    const ascending = await getAll({ limit: '50' });
    const descending = await getAll({ limit: '50', sort: '-name' });

    expect(descending.map((item) => item.id)).toEqual(ascending.map((item) => item.id).reverse());
  });

  it('searches the character name case insensitively', async () => {
    const page = await getPage({ search: 'ZERO' });

    expect(page.items.map((item) => item.name)).toEqual(['Sub-Zero', 'Zero Suit Samus']);
  });

  it('searches tag names as well as character names', async () => {
    const items = await getAll({ search: 'ninja', limit: '50' });

    expect(items).toHaveLength(26);
    expect(items.map((item) => item.name)).toContain('Greninja');
  });

  it('filters by universe', async () => {
    const items = await getAll({ universes: 'Street Fighter', limit: '50' });

    expect(items).toHaveLength(45);
    expect(items.every((item) => item.universe === 'Street Fighter')).toBe(true);
  });

  it('matches characters having any of the selected tags', async () => {
    const items = await getAll({ tags: 'ninja,robot', limit: '50' });

    expect(items).toHaveLength(47);
  });

  it('combines tag and universe filters with AND', async () => {
    const items = await getAll({ tags: 'ninja,robot', universes: 'Mortal Kombat', limit: '50' });

    expect(items).toHaveLength(9);
    expect(items.every((item) => item.universe === 'Mortal Kombat')).toBe(true);
  });

  it('returns an empty page when nothing matches', async () => {
    await expect(getPage({ search: 'no-such-champion' })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });

  it('rejects a limit above 50', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/characters?limit=51');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: ErrorCode.ValidationError });
  });

  it('rejects an unknown query parameter', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/characters?power=10');

    expect(response.status).toBe(400);
  });

  it('rejects an invalid cursor', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/characters?cursor=garbage');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: ErrorCode.ValidationError });
  });
});
