import { CHARACTERS_PAGE_SIZE } from '@/entities/character/model/character.constants.ts';
import type { ICharacterListArgs } from '@/entities/character/model/character.interfaces.ts';

export function buildCharacterQueryParams(
  args: ICharacterListArgs,
  cursor: string,
): Record<string, string> {
  const params: Record<string, string> = { limit: String(CHARACTERS_PAGE_SIZE) };
  const search = args.search?.trim();

  if (search) {
    params.search = search;
  }

  if (args.tags?.length) {
    params.tags = args.tags.join(',');
  }

  if (args.universes?.length) {
    params.universes = args.universes.join(',');
  }

  if (cursor) {
    params.cursor = cursor;
  }

  return params;
}
