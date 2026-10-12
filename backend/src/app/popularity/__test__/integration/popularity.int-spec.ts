import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { registerTestUser, type ITestUser } from '@infrastructure/test/utils/auth-test.helper.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import {
  connectSocket,
  listenOnRandomPort,
  waitForEvent,
} from '@infrastructure/test/utils/socket-test.helper.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface IPopularityBody {
  items: { character: { id: number; name: string }; pickCount: number }[];
}

const EMAIL_DOMAIN = '@popularity-int.test';

describe('Popularity', () => {
  let app: INestApplication<App>;
  let url: string;
  let ryuFan: ITestUser;
  let cassieFan: ITestUser;

  beforeAll(async () => {
    app = await createIntegrationApp();
    url = await listenOnRandomPort(app);
    ryuFan = await registerTestUser(app, `ryu-fan${EMAIL_DOMAIN}`);
    cassieFan = await registerTestUser(app, `cassie-fan${EMAIL_DOMAIN}`);
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  const createSquad = (user: ITestUser, name: string, characterIds: number[]): request.Test =>
    request(app.getHttpServer())
      .post('/api/v1/squads')
      .set('Authorization', user.authorization)
      .send({ name, characterIds });

  async function fetchPopularity(): Promise<IPopularityBody> {
    await app.get(PrismaService).$queryRaw`SELECT 1`;

    const response = await request(app.getHttpServer()).get('/api/v1/popularity');

    return response.body as IPopularityBody;
  }

  it('ranks characters by how many squads contain them', async () => {
    await createSquad(ryuFan, 'Shotokan', [1, 25]);
    await createSquad(cassieFan, 'Cage family', [1]);
    await new Promise((resolve) => setTimeout(resolve, 1300));

    const body = await fetchPopularity();

    expect(body.items.map((item) => [item.character.id, item.pickCount])).toEqual([
      [1, 2],
      [25, 1],
    ]);
    expect(body.items[0]?.character.name).toBe('Cassie Cage');
  });

  it('pushes the new ranking to connected users shortly after a squad changes', async () => {
    const socket = await connectSocket(url, cassieFan.accessToken);
    const received = waitForEvent(socket, 'popularity:updated', 4000);

    await createSquad(ryuFan, 'Third squad', [42]);

    await expect(received).resolves.toMatchObject({
      items: expect.arrayContaining([
        expect.objectContaining({ character: expect.objectContaining({ id: 42 }), pickCount: 1 }),
      ]),
    });
    socket.close();
  });
});
