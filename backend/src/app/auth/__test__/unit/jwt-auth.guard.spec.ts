import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard.js';
import type { IAuthUser } from '@app/auth/interfaces/auth.interfaces.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import type { ExecutionContext } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host.js';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

const SECRET = 'unit-test-secret-that-is-at-least-32-characters';

interface IFakeRequest {
  headers: { authorization?: string };
  user?: IAuthUser;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  const jwtService = new JwtService({ secret: SECRET });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [JwtAuthGuard, { provide: JwtService, useValue: jwtService }],
    }).compile();

    guard = moduleRef.get(JwtAuthGuard);
  });

  const contextFor = (request: IFakeRequest): ExecutionContext =>
    new ExecutionContextHost([request]);

  const unauthorized = { code: ErrorCode.Unauthorized, status: 401 };

  it('lets a request with a valid token through and attaches the user', async () => {
    const token = await jwtService.signAsync({ sub: 'user-1', email: 'ryu@example.com' });
    const request: IFakeRequest = { headers: { authorization: `Bearer ${token}` } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1', email: 'ryu@example.com' });
  });

  it('rejects a request without an authorization header', async () => {
    await expect(guard.canActivate(contextFor({ headers: {} }))).rejects.toMatchObject(
      unauthorized,
    );
  });

  it('rejects a malformed token', async () => {
    const request = { headers: { authorization: 'Bearer not-a-jwt' } };

    await expect(guard.canActivate(contextFor(request))).rejects.toMatchObject(unauthorized);
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = await new JwtService({
      secret: 'another-secret-that-is-at-least-32-characters',
    }).signAsync({ sub: 'user-1', email: 'ryu@example.com' });
    const request = { headers: { authorization: `Bearer ${forged}` } };

    await expect(guard.canActivate(contextFor(request))).rejects.toMatchObject(unauthorized);
  });

  it('rejects an expired token', async () => {
    const expired = await jwtService.signAsync(
      { sub: 'user-1', email: 'ryu@example.com' },
      { expiresIn: -10 },
    );
    const request = { headers: { authorization: `Bearer ${expired}` } };

    await expect(guard.canActivate(contextFor(request))).rejects.toMatchObject(unauthorized);
  });

  it('rejects a valid token whose payload has the wrong shape', async () => {
    const token = await jwtService.signAsync({ userId: 'user-1' });
    const request = { headers: { authorization: `Bearer ${token}` } };

    await expect(guard.canActivate(contextFor(request))).rejects.toMatchObject(unauthorized);
  });
});
