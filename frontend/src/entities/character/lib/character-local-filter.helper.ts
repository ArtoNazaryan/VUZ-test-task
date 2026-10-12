import type {
  ICharacter,
  ICharacterListArgs,
} from '@/entities/character/model/character.interfaces.ts';

function matchesSearch(character: ICharacter, search: string): boolean {
  const needle = search.trim().toLowerCase();

  return (
    needle.length === 0 ||
    character.name.toLowerCase().includes(needle) ||
    character.tags.some((tag) => tag.name.toLowerCase().includes(needle))
  );
}

export function filterCharactersLocally(
  characters: ICharacter[],
  filters: ICharacterListArgs,
): ICharacter[] {
  const tags = filters.tags ?? [];
  const universes = filters.universes ?? [];

  return characters.filter(
    (character) =>
      matchesSearch(character, filters.search ?? '') &&
      (tags.length === 0 || character.tags.some((tag) => tags.includes(tag.name))) &&
      (universes.length === 0 || universes.includes(character.universe)),
  );
}
