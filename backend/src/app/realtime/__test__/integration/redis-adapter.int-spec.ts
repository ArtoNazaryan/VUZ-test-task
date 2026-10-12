import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { RedisIoAdapter } from '@infrastructure/realtime/adapters/redis-io.adapter.js';
import { registerTestUser } from '@infrastructure/test/utils/auth-test.helper.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import {
  connectSocket,
  listenOnRandomPort,
  waitForEvent,
} from '@infrastructure/test/utils/socket-test.helper.js';
import type { INestApplication } from '@nestjs/common';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const EMAIL = 'scaled@redis-adapter-int.test';

describe('Realtime events across two API instances', () => {
  let redis: StartedRedisContainer;
  let instanceA: INestApplication<App>;
  let instanceB: INestApplication<App>;

  async function startInstance(redisUrl: string): Promise<INestApplication<App>> {
    return createIntegrationApp(undefined, (app) => {
      const adapter = new RedisIoAdapter(app, ['http://localhost:8080']);

      adapter.connectToRedis(redisUrl);
      app.useWebSocketAdapter(adapter);
    });
  }

  beforeAll(async () => {
    redis = await new RedisContainer('redis:7-alpine').start();
    instanceA = await startInstance(redis.getConnectionUrl());
    instanceB = await startInstance(redis.getConnectionUrl());
  });

  afterAll(async () => {
    await instanceA.get(PrismaService).user.deleteMany({ where: { email: EMAIL } });
    await instanceA.close();
    await instanceB.close();
    await redis.stop();
  });

  it('delivers a change made through instance B to a browser connected to instance A', async () => {
    const urlA = await listenOnRandomPort(instanceA);
    await listenOnRandomPort(instanceB);
    const user = await registerTestUser(instanceB, EMAIL);
    const socket = await connectSocket(urlA, user.accessToken);
    const received = waitForEvent(socket, 'squad:changed', 5000);

    const response = await request(instanceB.getHttpServer())
      .post('/api/v1/squads')
      .set('Authorization', user.authorization)
      .send({ name: 'Created on instance B' });

    await expect(received).resolves.toMatchObject({
      squadId: (response.body as { id: string }).id,
      change: 'created',
    });
    socket.close();
  });
});
