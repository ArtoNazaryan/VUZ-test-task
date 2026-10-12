import { Prisma } from '@infrastructure/prisma/generated/client.js';
import { isUniqueViolation } from '@infrastructure/prisma/helpers/prisma-error.helper.js';
import { describe, expect, it } from 'vitest';

const prismaError = (code: string): Prisma.PrismaClientKnownRequestError =>
  new Prisma.PrismaClientKnownRequestError('failed', { code, clientVersion: '7.10.0' });

describe('isUniqueViolation', () => {
  it('recognises a unique constraint violation', () => {
    expect(isUniqueViolation(prismaError('P2002'))).toBe(true);
  });

  it('ignores other Prisma errors', () => {
    expect(isUniqueViolation(prismaError('P2025'))).toBe(false);
  });

  it('ignores errors that are not Prisma errors', () => {
    expect(isUniqueViolation(new Error('P2002'))).toBe(false);
  });
});
