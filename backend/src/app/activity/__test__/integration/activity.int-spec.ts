import { ActivityRepository } from '@app/activity/repositories/activity.repository.js';
import { ActivityEvent } from '@app/activity/schemas/activity-event.schema.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { registerTestUser, type ITestUser } from '@infrastructure/test/utils/auth-test.helper.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const EMAIL_DOMAIN = '@activity-int.test';

describe('Activity log', () => {
  let app: INestApplication<App>;
  let activityModel: Model<ActivityEvent>;
  let owner: ITestUser;

  beforeAll(async () => {
    app = await createIntegrationApp();
    activityModel = app.get(getModelToken(ActivityEvent.name));
    owner = await registerTestUser(app, `owner${EMAIL_DOMAIN}`);
  });

  afterAll(async () => {
    await activityModel.deleteMany({ userId: owner.id });
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  function api(): ReturnType<typeof request> {
    return request(app.getHttpServer());
  }

  it('creates the activity indexes', async () => {
    const indexes = await activityModel.collection.indexes();

    expect(indexes.map((index) => index.key)).toEqual(
      expect.arrayContaining([
        { squadId: 1, occurredAt: -1, _id: -1 },
        { type: 1, occurredAt: -1, characterId: 1 },
      ]),
    );
  });

  it('records every change of a squad in order', async () => {
    const created = await api()
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: 'Earthrealm', characterIds: [1] })
      .expect(201);
    const squadId = (created.body as { id: string }).id;

    await api()
      .post(`/api/v1/squads/${squadId}/characters/2`)
      .set('Authorization', owner.authorization)
      .expect(200);
    await api()
      .delete(`/api/v1/squads/${squadId}/characters/1`)
      .set('Authorization', owner.authorization)
      .expect(200);
    await api()
      .patch(`/api/v1/squads/${squadId}`)
      .set('Authorization', owner.authorization)
      .send({ name: 'Outworld' })
      .expect(200);

    await vi.waitFor(async () => {
      const events = await activityModel.find({ squadId }).sort({ occurredAt: 1, _id: 1 }).lean();

      expect(
        events.map(({ type, userId, characterId, details }) => ({
          type,
          userId,
          characterId,
          details,
        })),
      ).toEqual([
        {
          type: SquadEvent.Created,
          userId: owner.id,
          characterId: undefined,
          details: { name: 'Earthrealm', characterIds: [1] },
        },
        { type: SquadEvent.MemberAdded, userId: owner.id, characterId: 2, details: undefined },
        { type: SquadEvent.MemberRemoved, userId: owner.id, characterId: 1, details: undefined },
        {
          type: SquadEvent.Updated,
          userId: owner.id,
          characterId: undefined,
          details: { name: 'Outworld' },
        },
      ]);
    });
  });
});

describe('Activity log when Mongo fails', () => {
  let app: INestApplication<App>;
  let owner: ITestUser;
  const insert = vi.fn<() => Promise<void>>();

  beforeAll(async () => {
    app = await createIntegrationApp((builder) =>
      builder.overrideProvider(ActivityRepository).useValue({ insert }),
    );
    owner = await registerTestUser(app, `failing${EMAIL_DOMAIN}`);
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  it('still saves the squad change', async () => {
    insert.mockRejectedValue(new Error('mongo is down'));

    const created = await request(app.getHttpServer())
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: 'Netherrealm' })
      .expect(201);

    await vi.waitFor(() => {
      expect(insert).toHaveBeenCalledOnce();
    });
    await request(app.getHttpServer())
      .get(`/api/v1/squads/${(created.body as { id: string }).id}`)
      .set('Authorization', owner.authorization)
      .expect(200);
  });
});
