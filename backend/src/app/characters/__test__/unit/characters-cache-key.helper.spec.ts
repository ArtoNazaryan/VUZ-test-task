import type { ListCharactersQueryDto } from '@app/characters/dto/list-characters-query.dto.js';
import { CharacterSort } from '@app/characters/enums/character-sort.enum.js';
import {
  buildItemCacheSuffix,
  buildListCacheSuffix,
} from '@app/characters/helpers/characters-cache-key.helper.js';
import { describe, expect, it } from 'vitest';

const query = (overrides: Partial<ListCharactersQueryDto> = {}): ListCharactersQueryDto => ({
  limit: 20,
  sort: CharacterSort.NameAsc,
  ...overrides,
});

describe('buildListCacheSuffix', () => {
  it('ignores the order and duplicates of tags and universes', () => {
    expect(buildListCacheSuffix(query({ tags: ['robot', 'ninja', 'robot'] }))).toBe(
      buildListCacheSuffix(query({ tags: ['ninja', 'robot'] })),
    );
  });

  it('ignores the letter case of the search text', () => {
    expect(buildListCacheSuffix(query({ search: 'SUB' }))).toBe(
      buildListCacheSuffix(query({ search: 'sub' })),
    );
  });

  it('gives different keys for different pages', () => {
    expect(buildListCacheSuffix(query({ cursor: 'abc' }))).not.toBe(buildListCacheSuffix(query()));
  });

  it('gives different keys for different sort orders', () => {
    expect(buildListCacheSuffix(query({ sort: CharacterSort.NameDesc }))).not.toBe(
      buildListCacheSuffix(query()),
    );
  });

  it('starts with the list prefix', () => {
    expect(buildListCacheSuffix(query())).toMatch(/^list:[0-9a-f]{40}$/);
  });
});

describe('buildItemCacheSuffix', () => {
  it('builds the key suffix of a single character', () => {
    expect(buildItemCacheSuffix(25)).toBe('item:25');
  });
});
