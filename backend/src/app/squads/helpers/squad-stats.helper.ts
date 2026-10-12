import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import type { ISquadStats } from '@app/squads/interfaces/squad-rules.interfaces.js';

const roundToHundredths = (value: number): number => Math.round(value * 100) / 100;

export function computeSquadStats(
  characters: CharacterResponseDto[],
  abilityNames: string[],
): ISquadStats {
  return {
    memberCount: characters.length,
    abilities: abilityNames.map((name) => {
      const scores = characters.flatMap((character) =>
        character.abilities
          .filter((ability) => ability.name === name)
          .map((ability) => ability.score),
      );

      return {
        name,
        average:
          scores.length > 0
            ? roundToHundredths(scores.reduce((sum, score) => sum + score, 0) / scores.length)
            : null,
      };
    }),
  };
}
