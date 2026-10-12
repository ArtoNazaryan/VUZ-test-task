import type { CharacterResponseDto } from '@app/characters/dto/character-response.dto.js';
import type { ISquadStats } from '@app/squads/interfaces/squad-rules.interfaces.js';
import type { SquadResponseDto } from '@app/squads/dto/squad-response.dto.js';
import type { SquadSummaryResponseDto } from '@app/squads/dto/squad-summary-response.dto.js';
import type { TSquadDetailRow, TSquadSummaryRow } from '@app/squads/types/squad.types.js';

export function toSquadSummaryResponse(row: TSquadSummaryRow): SquadSummaryResponseDto {
  return {
    id: row.id,
    name: row.name,
    memberCount: row._count.members,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toSquadResponse(
  row: TSquadDetailRow,
  characters: CharacterResponseDto[],
  stats: ISquadStats,
): SquadResponseDto {
  return {
    id: row.id,
    name: row.name,
    characters,
    stats,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
