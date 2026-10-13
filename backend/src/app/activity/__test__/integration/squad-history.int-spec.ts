import { ActivityEvent } from '@app/activity/schemas/activity-event.schema.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { registerTestUser, type ITestUser } from '@infrastructure/test/utils/auth-test.helper.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const EMAIL_DOMAIN = '@history-int.test';

interface IHistoryItem {
  id: string;
  type: SquadEvent;
  character?: { id: number; name: string };
  details?: { name?: string; characterIds?: number[] };
  occurredAt: string;
}

interface IHistoryPage {
  items: IHistoryItem[];
  nextCursor: string | null;
}

describe('GET /api/v1/squads/:id/history', () => {
  let app: INestApplication<App>;
  let activityModel: Model<ActivityEvent>;
  let owner: ITestUser;
  let stranger: ITestUser;
  let squadId: string;

  function api(): ReturnType<typeof request> {
    return request(app.getHttpServer());
  }

  async function getHistory(query: Record<string, string> = {}): Promise<IHistoryPage> {
    const response = await api()
      .get(`/api/v1/squads/${squadId}/history`)
      .set('Authorization', owner.authorization)
      .query(query)
      .expect(200);

    return response.body as IHistoryPage;
  }

  beforeAll(async () => {
    app = await createIntegrationApp();
    activityModel = app.get(getModelToken(ActivityEvent.name));
    owner = await registerTestUser(app, `owner${EMAIL_DOMAIN}`);
    stranger = await registerTestUser(app, `stranger${EMAIL_DOMAIN}`);

    const created = await api()
      .post('/api/v1/squads')
      .set('Authorization', owner.authorization)
      .send({ name: 'Earthrealm' })
      .expect(201);
    squadId = (created.body as { id: string }).id;

    for (const characterId of [1, 2, 3]) {
      await api()
        .post(`/api/v1/squads/${squadId}/characters/${String(characterId)}`)
        .set('Authorization', owner.authorization)
        .expect(200);
    }
    await api()
      .patch(`/api/v1/squads/${squadId}`)
      .set('Authorization', owner.authorization)
      .send({ name: 'Outworld' })
      .expect(200);

    await vi.waitFor(async () => {
      expect(await activityModel.countDocuments({ squadId })).toBe(5);
    });
  });

  afterAll(async () => {
    await activityModel.deleteMany({ userId: { $in: [owner.id, stranger.id] } });
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  it('returns the timeline newest first with characters and details', async () => {
    const { items, nextCursor } = await getHistory();

    expect(nextCursor).toBeNull();
    expect(
      items.map((item) => [item.type, item.character?.id ?? null, item.details ?? null]),
    ).toEqual([
      [SquadEvent.Updated, null, { name: 'Outworld' }],
      [SquadEvent.MemberAdded, 3, null],
      [SquadEvent.MemberAdded, 2, null],
      [SquadEvent.MemberAdded, 1, null],
      [SquadEvent.Created, null, { name: 'Earthrealm', characterIds: [] }],
    ]);
    expect(items[1]?.character?.name).toEqual(expect.any(String));
  });

  it('pages through the timeline without gaps or repeats', async () => {
    const seen: string[] = [];
    let cursor: string | null = null;

    do {
      const page: IHistoryPage = await getHistory({
        limit: '2',
        ...(cursor ? { cursor } : {}),
      });

      expect(page.items.length).toBeLessThanOrEqual(2);
      seen.push(...page.items.map((item) => item.id));
      cursor = page.nextCursor;
    } while (cursor);

    expect(seen).toEqual((await getHistory()).items.map((item) => item.id));
  });

  it('hides the history of another user squad', async () => {
    const response = await api()
      .get(`/api/v1/squads/${squadId}/history`)
      .set('Authorization', stranger.authorization)
      .expect(404);

    expect(response.body).toMatchObject({ error: ErrorCode.NotFound });
  });

  it('requires a token', async () => {
    await api().get(`/api/v1/squads/${squadId}/history`).expect(401);
  });

  it('rejects an invalid cursor and limit', async () => {
    for (const query of [{ cursor: 'garbage' }, { limit: '0' }, { limit: '51' }]) {
      const response = await api()
        .get(`/api/v1/squads/${squadId}/history`)
        .set('Authorization', owner.authorization)
        .query(query)
        .expect(400);

      expect(response.body).toMatchObject({ error: ErrorCode.ValidationError });
    }
  });
});
