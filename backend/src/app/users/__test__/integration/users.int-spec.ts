import { UsersService } from '@app/users/services/users.service.js';
import { UsersModule } from '@app/users/users.module.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { validateEnv } from '@infrastructure/config/env.validation.js';
import { PrismaModule } from '@infrastructure/prisma/prisma.module.js';
import { PrismaService } from '@infrastructure/prisma/service/prisma.service.js';
import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('UsersService with PostgreSQL', () => {
  let moduleRef: TestingModule;
  let service: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        PrismaModule,
        UsersModule,
      ],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get(UsersService);
  });

  afterAll(async () => {
    await moduleRef
      .get(PrismaService)
      .user.deleteMany({ where: { email: { endsWith: '@users-int.test' } } });
    await moduleRef.close();
  });

  it('creates a user with a lower-cased email and a UUID id', async () => {
    const user = await service.create('Ken@Users-Int.test', 'hash');

    expect(user).toMatchObject({ email: 'ken@users-int.test', passwordHash: 'hash' });
    expect(user.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('rejects the same email in a different letter case with EMAIL_TAKEN', async () => {
    await service.create('chun-li@users-int.test', 'hash');

    await expect(service.create('CHUN-LI@users-int.test', 'hash')).rejects.toMatchObject({
      code: ErrorCode.EmailTaken,
    });
  });

  it('finds a user by email regardless of letter case', async () => {
    const created = await service.create('guile@users-int.test', 'hash');

    await expect(service.findByEmail('GUILE@users-int.test')).resolves.toMatchObject({
      id: created.id,
    });
  });

  it('finds a user by id and returns null for an unknown id', async () => {
    const created = await service.create('blanka@users-int.test', 'hash');

    await expect(service.findById(created.id)).resolves.toMatchObject({ email: created.email });
    await expect(service.findById('0199d6a4-0000-7000-8000-000000000000')).resolves.toBeNull();
  });
});
