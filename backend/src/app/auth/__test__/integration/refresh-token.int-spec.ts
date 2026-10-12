import { hashRefreshToken } from '@app/auth/helpers/refresh-token.helper.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface IAuthBody {
  accessToken: string;
}

const EMAIL_DOMAIN = '@refresh-int.test';

describe('Refresh token flow', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;
  let userCount = 0;

  beforeAll(async () => {
    app = await createIntegrationApp();
    prismaService = app.get(PrismaService);
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({ where: { email: { endsWith: EMAIL_DOMAIN } } });
    await app.close();
  });

  function cookieHeaders(response: request.Response): string[] {
    const header: unknown = response.headers['set-cookie'];

    return Array.isArray(header)
      ? header.filter((value): value is string => typeof value === 'string')
      : [];
  }

  function refreshTokenFrom(response: request.Response): string {
    const cookie = cookieHeaders(response).find((value) => value.startsWith('refresh_token='));
    const token = cookie?.split(';')[0]?.slice('refresh_token='.length);

    if (!token) {
      throw new Error('No refresh_token cookie in the response');
    }

    return token;
  }

  async function registerNewUser(): Promise<request.Response> {
    userCount += 1;

    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `player-${userCount}${EMAIL_DOMAIN}`, password: 'hadouken-2026' });
  }

  const refresh = (token?: string): request.Test => {
    const call = request(app.getHttpServer()).post('/api/v1/auth/refresh');

    return token ? call.set('Cookie', `refresh_token=${token}`) : call;
  };

  async function markRevokedAgo(token: string, milliseconds: number): Promise<void> {
    await prismaService.refreshToken.update({
      where: { tokenHash: hashRefreshToken(token) },
      data: { revokedAt: new Date(Date.now() - milliseconds) },
    });
  }

  it('sets an httpOnly strict refresh cookie scoped to the auth routes on register', async () => {
    const response = await registerNewUser();
    const cookie = cookieHeaders(response).find((value) => value.startsWith('refresh_token='));

    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Path=/api/v1/auth');
    expect(cookie).toContain('Expires=');
  });

  it('stores only a hash of the refresh token', async () => {
    const token = refreshTokenFrom(await registerNewUser());

    await expect(prismaService.refreshToken.count({ where: { tokenHash: token } })).resolves.toBe(
      0,
    );
    await expect(
      prismaService.refreshToken.count({ where: { tokenHash: hashRefreshToken(token) } }),
    ).resolves.toBe(1);
  });

  it('exchanges the cookie for a new access token and a new refresh token', async () => {
    const original = refreshTokenFrom(await registerNewUser());

    const response = await refresh(original);
    const rotated = refreshTokenFrom(response);

    expect(response.status).toBe(200);
    expect(rotated).not.toBe(original);

    const profile = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${(response.body as IAuthBody).accessToken}`);

    expect(profile.status).toBe(200);
  });

  it('rejects an old token reused right after rotation but keeps the new one working', async () => {
    const original = refreshTokenFrom(await registerNewUser());
    const rotated = refreshTokenFrom(await refresh(original));

    expect((await refresh(original)).status).toBe(401);
    expect((await refresh(rotated)).status).toBe(200);
  });

  it('revokes every session of the user when an old token is reused later', async () => {
    const original = refreshTokenFrom(await registerNewUser());
    const rotated = refreshTokenFrom(await refresh(original));

    await markRevokedAgo(original, 60_000);

    const reuse = await refresh(original);

    expect(reuse.status).toBe(401);
    expect(reuse.body).toMatchObject({ error: ErrorCode.Unauthorized });
    expect((await refresh(rotated)).status).toBe(401);
  });

  it('rejects an expired refresh token', async () => {
    const token = refreshTokenFrom(await registerNewUser());

    await prismaService.refreshToken.update({
      where: { tokenHash: hashRefreshToken(token) },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });

    expect((await refresh(token)).status).toBe(401);
  });

  it('returns 401 when no refresh cookie is sent', async () => {
    expect((await refresh()).status).toBe(401);
  });

  it('logs out by revoking the token and clearing the cookie', async () => {
    const token = refreshTokenFrom(await registerNewUser());

    const logout = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', `refresh_token=${token}`);
    const cleared = cookieHeaders(logout).find((value) => value.startsWith('refresh_token='));

    expect(logout.status).toBe(204);
    expect(cleared).toContain('Expires=Thu, 01 Jan 1970');
    expect((await refresh(token)).status).toBe(401);
  });
});
