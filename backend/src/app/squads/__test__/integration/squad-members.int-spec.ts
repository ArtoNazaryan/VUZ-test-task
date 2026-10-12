import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { registerTestUser, type ITestUser } from '@infrastructure/test/utils/auth-test.helper.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface ISquadBody {
  id: string;
  name: string;
  characters: { id: number; name: string }[];
  stats: { memberCount: number; abilities: { name: string; average: number | null }[] };
}

const EMAIL_DOMAIN = '@squad-members-int.test';

describe('Squad members and stats', () => {
  let app: INestApplication<App>;
  let user: ITestUser;
  let squadCount = 0;

  beforeAll(async () => {
    app = await createIntegrationApp();
    user = await registerTestUser(app, `player${EMAIL_DOMAIN}`);
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  function createSquad(characterIds?: number[]): request.Test {
    squadCount += 1;

    return request(app.getHttpServer())
      .post('/api/v1/squads')
      .set('Authorization', user.authorization)
      .send({ name: `Squad ${squadCount}`, characterIds });
  }

  const patchSquad = (id: string, body: object): request.Test =>
    request(app.getHttpServer())
      .patch(`/api/v1/squads/${id}`)
      .set('Authorization', user.authorization)
      .send(body);

  it('creates a squad with characters in the given order and their average stats', async () => {
    const response = await createSquad([1, 25, 42]);
    const body = response.body as ISquadBody;

    expect(response.status).toBe(201);
    expect(body.characters.map((character) => character.name)).toEqual([
      'Cassie Cage',
      'RoboCop',
      'Android 21 (Lab Coat)',
    ]);
    expect(body.stats).toEqual({
      memberCount: 3,
      abilities: [
        { name: 'Power', average: 4.67 },
        { name: 'Mobility', average: 5 },
        { name: 'Technique', average: 6.67 },
        { name: 'Survivability', average: 7.33 },
        { name: 'Energy', average: 5.67 },
      ],
    });
  });

  it('accepts exactly 6 characters', async () => {
    const response = await createSquad([1, 2, 3, 4, 5, 6]);

    expect(response.status).toBe(201);
    expect((response.body as ISquadBody).stats.memberCount).toBe(6);
  });

  it('rejects 7 characters with 422 SQUAD_FULL', async () => {
    const response = await createSquad([1, 2, 3, 4, 5, 6, 7]);

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      statusCode: 422,
      error: ErrorCode.SquadFull,
      message: 'A squad cannot have more than 6 characters',
    });
  });

  it('rejects the same character twice with 409 CHARACTER_ALREADY_IN_SQUAD', async () => {
    const response = await createSquad([1, 1]);

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      error: ErrorCode.CharacterAlreadyInSquad,
      details: { characterIds: [1] },
    });
  });

  it('rejects unknown character ids with 422 CHARACTER_NOT_FOUND', async () => {
    const response = await createSquad([1, 9999]);

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: ErrorCode.CharacterNotFound,
      details: { characterIds: [9999] },
    });
  });

  it('rejects ids that are not positive integers with 400', async () => {
    expect((await createSquad([0])).status).toBe(400);
  });

  it('replaces the members in the new order and recalculates the stats', async () => {
    const created = (await createSquad([1, 25, 42])).body as ISquadBody;

    const response = await patchSquad(created.id, { characterIds: [208, 1] });
    const body = response.body as ISquadBody;

    expect(response.status).toBe(200);
    expect(body.characters.map((character) => character.id)).toEqual([208, 1]);
    expect(body.stats.abilities).toContainEqual({ name: 'Power', average: 6.5 });
  });

  it('keeps the members when only the name changes', async () => {
    const created = (await createSquad([1, 25])).body as ISquadBody;

    const response = await patchSquad(created.id, { name: 'Renamed only' });

    expect((response.body as ISquadBody).characters.map((character) => character.id)).toEqual([
      1, 25,
    ]);
  });

  it('empties the squad with an empty list and returns null averages', async () => {
    const created = (await createSquad([1, 25])).body as ISquadBody;

    const body = (await patchSquad(created.id, { characterIds: [] })).body as ISquadBody;

    expect(body.characters).toEqual([]);
    expect(body.stats.abilities.every((ability) => ability.average === null)).toBe(true);
  });

  it('rejects a replacement with 7 characters and keeps the old members', async () => {
    const created = (await createSquad([1, 25])).body as ISquadBody;

    const rejected = await patchSquad(created.id, { characterIds: [1, 2, 3, 4, 5, 6, 7] });
    const current = await request(app.getHttpServer())
      .get(`/api/v1/squads/${created.id}`)
      .set('Authorization', user.authorization);

    expect(rejected.status).toBe(422);
    expect((current.body as ISquadBody).characters.map((character) => character.id)).toEqual([
      1, 25,
    ]);
  });

  it('shows the member count in the squad list', async () => {
    const created = (await createSquad([1, 25, 42])).body as ISquadBody;

    const list = await request(app.getHttpServer())
      .get('/api/v1/squads')
      .set('Authorization', user.authorization);

    expect(list.body).toContainEqual(expect.objectContaining({ id: created.id, memberCount: 3 }));
  });
});
