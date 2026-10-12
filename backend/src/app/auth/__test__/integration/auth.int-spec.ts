import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { createIntegrationApp } from '@infrastructure/test/utils/create-integration-app.js';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

interface IAuthBody {
  accessToken: string;
  user: { id: string; email: string };
}

describe('Auth API', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createIntegrationApp();
  });

  afterAll(async () => {
    await app
      .get(PrismaService)
      .user.deleteMany({ where: { email: { endsWith: '@auth-int.test' } } });
    await app.close();
  });

  const register = (email: string, password = 'hadouken-2026'): request.Test =>
    request(app.getHttpServer()).post('/api/v1/auth/register').send({ email, password });

  const login = (email: string, password: string): request.Test =>
    request(app.getHttpServer()).post('/api/v1/auth/login').send({ email, password });

  const me = (authorization?: string): request.Test => {
    const call = request(app.getHttpServer()).get('/api/v1/auth/me');

    return authorization ? call.set('Authorization', authorization) : call;
  };

  describe('POST /auth/register', () => {
    it('creates an account and returns a working access token', async () => {
      const response = await register('Ryu@Auth-Int.test');
      const body = response.body as IAuthBody;

      expect(response.status).toBe(201);
      expect(body).toMatchObject({
        tokenType: 'Bearer',
        expiresIn: 900,
        user: { email: 'ryu@auth-int.test' },
      });
      expect(body).not.toHaveProperty('user.passwordHash');

      const profile = await me(`Bearer ${body.accessToken}`);

      expect(profile.status).toBe(200);
      expect(profile.body).toMatchObject({ id: body.user.id, email: 'ryu@auth-int.test' });
    });

    it('returns 409 EMAIL_TAKEN for an existing email in any letter case', async () => {
      await register('ken@auth-int.test');

      const response = await register('KEN@auth-int.test');

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({ error: ErrorCode.EmailTaken });
    });

    it('returns 400 for an invalid email', async () => {
      const response = await register('not-an-email');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: ErrorCode.ValidationError });
    });

    it('returns 400 for a password shorter than 8 characters', async () => {
      const response = await register('short@auth-int.test', 'short');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await register('chun-li@auth-int.test');
    });

    it('returns an access token for the correct password', async () => {
      const response = await login('Chun-Li@auth-int.test', 'hadouken-2026');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ user: { email: 'chun-li@auth-int.test' } });
    });

    it('returns the same 401 for a wrong password and for an unknown email', async () => {
      const wrongPassword = await login('chun-li@auth-int.test', 'wrong-password');
      const unknownEmail = await login('nobody@auth-int.test', 'hadouken-2026');

      expect(wrongPassword.status).toBe(401);
      expect(unknownEmail.status).toBe(401);
      expect(wrongPassword.body).toMatchObject({
        error: ErrorCode.InvalidCredentials,
        message: 'Email or password is incorrect',
      });
      expect(unknownEmail.body).toMatchObject({
        error: ErrorCode.InvalidCredentials,
        message: 'Email or password is incorrect',
      });
    });
  });

  describe('GET /auth/me', () => {
    it('returns 401 without a token', async () => {
      const response = await me();

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({ error: ErrorCode.Unauthorized });
    });

    it('returns 401 for a malformed token', async () => {
      expect((await me('Bearer garbage')).status).toBe(401);
    });

    it('returns 401 for an expired token', async () => {
      const expired = await app
        .get(JwtService)
        .signAsync({ sub: 'user-1', email: 'ryu@auth-int.test' }, { expiresIn: -10 });

      expect((await me(`Bearer ${expired}`)).status).toBe(401);
    });
  });
});
