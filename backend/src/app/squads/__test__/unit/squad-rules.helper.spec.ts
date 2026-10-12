import { SquadRuleViolation } from '@app/squads/enums/squad-rule-violation.enum.js';
import {
  findAddMemberViolation,
  findDuplicateIds,
  findSquadRuleViolation,
} from '@app/squads/helpers/squad-rules.helper.js';
import { describe, expect, it } from 'vitest';

const allExist = new Set([1, 2, 3, 4, 5, 6, 7]);

describe('findDuplicateIds', () => {
  it('returns each repeated id once', () => {
    expect(findDuplicateIds([1, 2, 1, 3, 1, 2])).toEqual([1, 2]);
  });

  it('returns an empty list when all ids are unique', () => {
    expect(findDuplicateIds([1, 2, 3])).toEqual([]);
  });
});

describe('findSquadRuleViolation', () => {
  it('accepts up to 6 unique existing characters', () => {
    expect(findSquadRuleViolation([1, 2, 3, 4, 5, 6], allExist)).toBeNull();
  });

  it('accepts an empty squad', () => {
    expect(findSquadRuleViolation([], allExist)).toBeNull();
  });

  it('rejects more than 6 characters', () => {
    expect(findSquadRuleViolation([1, 2, 3, 4, 5, 6, 7], allExist)).toEqual({
      type: SquadRuleViolation.SquadFull,
      limit: 6,
      requested: 7,
    });
  });

  it('rejects a character that appears twice', () => {
    expect(findSquadRuleViolation([1, 2, 2], allExist)).toEqual({
      type: SquadRuleViolation.DuplicateCharacters,
      characterIds: [2],
    });
  });

  it('rejects ids that do not exist', () => {
    expect(findSquadRuleViolation([1, 9998, 9999], allExist)).toEqual({
      type: SquadRuleViolation.UnknownCharacters,
      characterIds: [9998, 9999],
    });
  });

  it('reports the size limit before duplicates or unknown ids', () => {
    expect(findSquadRuleViolation([1, 1, 1, 1, 1, 1, 9999], allExist)).toMatchObject({
      type: SquadRuleViolation.SquadFull,
    });
  });
});

describe('findAddMemberViolation', () => {
  it('allows adding to a squad with fewer than 6 members', () => {
    expect(findAddMemberViolation([1, 2, 3, 4, 5], 6)).toBeNull();
  });

  it('rejects adding a seventh member', () => {
    expect(findAddMemberViolation([1, 2, 3, 4, 5, 6], 7)).toEqual({
      type: SquadRuleViolation.SquadFull,
      limit: 6,
      requested: 7,
    });
  });

  it('rejects a character that is already a member', () => {
    expect(findAddMemberViolation([1, 2], 2)).toEqual({
      type: SquadRuleViolation.DuplicateCharacters,
      characterIds: [2],
    });
  });

  it('reports an existing member as a duplicate even when the squad is full', () => {
    expect(findAddMemberViolation([1, 2, 3, 4, 5, 6], 3)).toMatchObject({
      type: SquadRuleViolation.DuplicateCharacters,
    });
  });
});
