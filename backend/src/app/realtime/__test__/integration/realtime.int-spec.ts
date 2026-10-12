import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { registerTestUser, type ITestUser } from '@infrastructure/test/utils/auth-test.helper.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import {
  connectSocket,
  expectNoEvent,
  listenOnRandomPort,
  waitForEvent,
} from '@infrastructure/test/utils/socket-test.helper.js';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io-client';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

const EMAIL_DOMAIN = '@realtime-int.test';

describe('Realtime gateway', () => {
  let app: INestApplication<App>;
  let url: string;
  let owner: ITestUser;
  let stranger: ITestUser;
  const sockets: Socket[] = [];

  beforeAll(async () => {
    app = await createIntegrationApp();
    url = await listenOnRandomPort(app);
    owner = await registerTestUser(app, `owner${EMAIL_DOMAIN}`);
    stranger = await registerTestUser(app, `stranger${EMAIL_DOMAIN}`);
  });

  afterEach(() => {
    sockets.splice(0).forEach((socket) => socket.close());
  });

  afterAll(async () => {
    await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  async function connectAs(user: ITestUser): Promise<Socket> {
    const socket = await connectSocket(url, user.accessToken);
    sockets.push(socket);

    return socket;
  }

  async function createSquad(user: ITestUser, name: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/squads')
      .set('Authorization', user.authorization)
      .send({ name });

    return (response.body as { id: string }).id;
  }

  it('refuses a connection without a token', async () => {
    await expect(connectSocket(url)).rejects.toThrow('UNAUTHORIZED');
  });

  it('refuses a connection with a forged token', async () => {
    const forged = await new JwtService({
      secret: 'another-secret-that-is-at-least-32-characters',
    }).signAsync({ sub: owner.id, email: 'owner@realtime-int.test' });

    await expect(connectSocket(url, forged)).rejects.toThrow('UNAUTHORIZED');
  });

  it('tells the owner when a character is added to their squad', async () => {
    const squadId = await createSquad(owner, 'Synced squad');
    const socket = await connectAs(owner);
    const received = waitForEvent(socket, 'squad:changed');

    await request(app.getHttpServer())
      .post(`/api/v1/squads/${squadId}/characters/25`)
      .set('Authorization', owner.authorization);

    await expect(received).resolves.toMatchObject({
      squadId,
      change: 'member-added',
      characterId: 25,
    });
  });

  it('does not tell other users about the change', async () => {
    const squadId = await createSquad(owner, 'Private squad');
    const strangerSocket = await connectAs(stranger);
    const nothingReceived = expectNoEvent(strangerSocket, 'squad:changed');

    await request(app.getHttpServer())
      .post(`/api/v1/squads/${squadId}/characters/1`)
      .set('Authorization', owner.authorization);

    await expect(nothingReceived).resolves.toBe(true);
  });
});
