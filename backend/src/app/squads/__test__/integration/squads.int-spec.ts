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
}

const EMAIL_DOMAIN = '@squads-int.test';

describe('Squads API', () => {
  let app: INestApplication<App>;
  let owner: ITestUser;
  let stranger: ITestUser;

  beforeAll(async () => {
    app = await createIntegrationApp();
    owner = await registerTestUser(app, `owner${EMAIL_DOMAIN}`);
    stranger = await registerTestUser(app, `stranger${EMAIL_DOMAIN}`);
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  const api = (): ReturnType<typeof request> => request(app.getHttpServer());

  async function createSquad(user: ITestUser, name: string): Promise<ISquadBody> {
    const response = await api()
      .post('/api/v1/squads')
      .set('Authorization', user.authorization)
      .send({ name });

    expect(response.status).toBe(201);

    return response.body as ISquadBody;
  }

  it('requires authentication', async () => {
    expect((await api().get('/api/v1/squads')).status).toBe(401);
  });

  it('creates a squad with a trimmed name and no characters', async () => {
    const response = await api()
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: '  Earthrealm defenders  ' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Earthrealm defenders', characters: [] });
  });

  it('lists only the squads of the logged in user with their member count', async () => {
    const squad = await createSquad(owner, 'Listed squad');
    await createSquad(stranger, 'Stranger squad');

    const response = await api().get('/api/v1/squads').set('Authorization', owner.authorization);
    const names = (response.body as ISquadBody[]).map((item) => item.name);

    expect(response.status).toBe(200);
    expect(names).toContain('Listed squad');
    expect(names).not.toContain('Stranger squad');
    expect(response.body).toContainEqual(expect.objectContaining({ id: squad.id, memberCount: 0 }));
  });

  it('gets one of the user squads', async () => {
    const squad = await createSquad(owner, 'Fetched squad');

    const response = await api()
      .get(`/api/v1/squads/${squad.id}`)
      .set('Authorization', owner.authorization);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: squad.id, name: 'Fetched squad', characters: [] });
  });

  it('returns 404 for a squad of another user on get, rename and delete', async () => {
    const squad = await createSquad(owner, 'Private squad');
    const path = `/api/v1/squads/${squad.id}`;

    const get = await api().get(path).set('Authorization', stranger.authorization);
    const rename = await api()
      .patch(path)
      .set('Authorization', stranger.authorization)
      .send({ name: 'Stolen' });
    const remove = await api().delete(path).set('Authorization', stranger.authorization);

    expect([get.status, rename.status, remove.status]).toEqual([404, 404, 404]);
    expect(get.body).toMatchObject({ error: ErrorCode.NotFound });
  });

  it('renames a squad', async () => {
    const squad = await createSquad(owner, 'Old name');

    const response = await api()
      .patch(`/api/v1/squads/${squad.id}`)
      .set('Authorization', owner.authorization)
      .send({ name: 'New name' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ id: squad.id, name: 'New name' });
  });

  it('rejects a second squad with the same name for the same user', async () => {
    await createSquad(owner, 'Duplicate name');

    const response = await api()
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: 'Duplicate name' });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ error: ErrorCode.SquadNameTaken });
  });

  it('allows different users to use the same squad name', async () => {
    await createSquad(owner, 'Shared name');

    await expect(createSquad(stranger, 'Shared name')).resolves.toMatchObject({
      name: 'Shared name',
    });
  });

  it('deletes a squad', async () => {
    const squad = await createSquad(owner, 'Short lived');
    const path = `/api/v1/squads/${squad.id}`;

    expect((await api().delete(path).set('Authorization', owner.authorization)).status).toBe(204);
    expect((await api().get(path).set('Authorization', owner.authorization)).status).toBe(404);
  });

  it('rejects an invalid squad id', async () => {
    const response = await api()
      .get('/api/v1/squads/not-a-uuid')
      .set('Authorization', owner.authorization);

    expect(response.status).toBe(400);
  });

  it('rejects an empty or too long name', async () => {
    const empty = await api()
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: '   ' });
    const tooLong = await api()
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: 'x'.repeat(51) });

    expect(empty.status).toBe(400);
    expect(tooLong.status).toBe(400);
  });
});
