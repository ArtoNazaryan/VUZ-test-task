import {
  squadNotFoundError,
  toSquadNameConflictError,
} from '@app/squads/helpers/squad-errors.helper.js';
import { ErrorCode } from '@infrastructure/common/enums/error-code.enum.js';
import { Prisma } from '@infrastructure/prisma/generated/client.js';
import { describe, expect, it } from 'vitest';

describe('squadNotFoundError', () => {
  it('creates a 404 NOT_FOUND error', () => {
    expect(squadNotFoundError()).toMatchObject({ code: ErrorCode.NotFound, status: 404 });
  });
});

describe('toSquadNameConflictError', () => {
  it('turns a unique violation into SQUAD_NAME_TAKEN', () => {
    const uniqueViolation = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.10.0',
    });

    expect(toSquadNameConflictError(uniqueViolation)).toMatchObject({
      code: ErrorCode.SquadNameTaken,
      status: 409,
    });
  });

  it('returns any other error unchanged', () => {
    const other = new Error('connection lost');

    expect(toSquadNameConflictError(other)).toBe(other);
  });
});
