import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';

export interface ITestUser {
  id: string;
  accessToken: string;
  authorization: string;
}

interface IRegisterBody {
  accessToken: string;
  user: { id: string };
}

export async function registerTestUser(
  app: INestApplication<App>,
  email: string,
): Promise<ITestUser> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({ email, password: 'hadouken-2026' });

  if (response.status !== 201) {
    throw new Error(`Could not register test user ${email}: ${String(response.status)}`);
  }

  const body = response.body as IRegisterBody;

  return {
    id: body.user.id,
    accessToken: body.accessToken,
    authorization: `Bearer ${body.accessToken}`,
  };
}
