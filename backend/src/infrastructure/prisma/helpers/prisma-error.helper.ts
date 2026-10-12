import { Prisma } from '@infrastructure/prisma/generated/client.js';

const UNIQUE_VIOLATION_CODE = 'P2002';

export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION_CODE
  );
}
