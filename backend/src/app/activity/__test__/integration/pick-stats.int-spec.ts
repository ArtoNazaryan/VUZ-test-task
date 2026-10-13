import { ActivityEvent } from '@app/activity/schemas/activity-event.schema.js';
import { SquadEvent } from '@app/squads/enums/squad-event.enum.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface IPickStats {
  days: number;
  since: string;
  items: { character: { id: number }; pickCount: number }[];
}

describe('GET /api/v1/stats/picks', () => {
  let app: INestApplication<App>;
  let activityModel: Model<ActivityEvent>;

  function picks(characterId: number, count: number, daysAgo: number): Partial<ActivityEvent>[] {
    return Array.from({ length: count }, () => ({
      type: SquadEvent.MemberAdded,
      userId: 'stats-user',
      squadId: 'stats-squad',
      characterId,
      occurredAt: new Date(Date.now() - daysAgo * DAY_IN_MS),
    }));
  }

  beforeAll(async () => {
    app = await createIntegrationApp();
    activityModel = app.get(getModelToken(ActivityEvent.name));
    await activityModel.deleteMany({});
    await activityModel.insertMany([
      ...picks(1, 3, 1),
      ...picks(2, 5, 2),
      ...picks(3, 9, 20),
      {
        type: SquadEvent.MemberRemoved,
        userId: 'stats-user',
        squadId: 'stats-squad',
        characterId: 1,
        occurredAt: new Date(),
      },
    ]);
  });

  afterAll(async () => {
    await activityModel.deleteMany({ userId: 'stats-user' });
    await app.close();
  });

  it('counts only characters added inside the window, most added first', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/stats/picks').expect(200);
    const body = response.body as IPickStats;

    expect(body.days).toBe(7);
    expect(Date.now() - new Date(body.since).getTime()).toBeGreaterThanOrEqual(7 * DAY_IN_MS);
    expect(body.items.map((item) => [item.character.id, item.pickCount])).toEqual([
      [2, 5],
      [1, 3],
    ]);
  });

  it('widens the window with days', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/stats/picks')
      .query({ days: 30 })
      .expect(200);

    expect(
      (response.body as IPickStats).items.map((item) => [item.character.id, item.pickCount]),
    ).toEqual([
      [3, 9],
      [2, 5],
      [1, 3],
    ]);
  });

  it('rejects days outside 1 to 90', async () => {
    for (const days of ['0', '91', 'week']) {
      const response = await request(app.getHttpServer())
        .get('/api/v1/stats/picks')
        .query({ days })
        .expect(400);

      expect(response.body).toMatchObject({ error: ErrorCode.ValidationError });
    }
  });
});
