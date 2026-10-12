import type { ListCharactersQueryDto } from '@app/characters/dto/list-characters-query.dto.js';
import { createHash } from 'node:crypto';

const sortedUnique = (values: string[] | undefined): string[] => [...new Set(values ?? [])].sort();

export function buildListCacheSuffix(query: ListCharactersQueryDto): string {
  const normalized = {
    search: query.search?.toLowerCase() ?? null,
    tags: sortedUnique(query.tags),
    universes: sortedUnique(query.universes),
    limit: query.limit,
    sort: query.sort,
    cursor: query.cursor ?? null,
  };

  return `list:${createHash('sha1').update(JSON.stringify(normalized)).digest('hex')}`;
}

export function buildItemCacheSuffix(id: number): string {
  return `item:${id}`;
}
