import { SquadRuleViolation } from '@app/squads/enums/squad-rule-violation.enum.js';
import {
  squadNotFoundError,
  toMemberConflictError,
  toSquadNameConflictError,
  toSquadRuleError,
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

describe('toSquadRuleError', () => {
  it('turns a size violation into 422 SQUAD_FULL with the limit', () => {
    expect(
      toSquadRuleError({ type: SquadRuleViolation.SquadFull, limit: 6, requested: 7 }),
    ).toMatchObject({
      code: ErrorCode.SquadFull,
      status: 422,
      message: 'A squad cannot have more than 6 characters',
      details: { limit: 6, requested: 7 },
    });
  });

  it('turns duplicates into 409 CHARACTER_ALREADY_IN_SQUAD with the ids', () => {
    expect(
      toSquadRuleError({ type: SquadRuleViolation.DuplicateCharacters, characterIds: [3] }),
    ).toMatchObject({
      code: ErrorCode.CharacterAlreadyInSquad,
      status: 409,
      details: { characterIds: [3] },
    });
  });

  it('turns unknown ids into 422 CHARACTER_NOT_FOUND with the ids', () => {
    expect(
      toSquadRuleError({ type: SquadRuleViolation.UnknownCharacters, characterIds: [9999] }),
    ).toMatchObject({
      code: ErrorCode.CharacterNotFound,
      status: 422,
      details: { characterIds: [9999] },
    });
  });
});

describe('toMemberConflictError', () => {
  it('turns a unique violation into CHARACTER_ALREADY_IN_SQUAD for that character', () => {
    const uniqueViolation = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '7.10.0',
    });

    expect(toMemberConflictError(uniqueViolation, 25)).toMatchObject({
      code: ErrorCode.CharacterAlreadyInSquad,
      details: { characterIds: [25] },
    });
  });

  it('returns any other error unchanged', () => {
    const other = new Error('connection lost');

    expect(toMemberConflictError(other, 25)).toBe(other);
  });
});
