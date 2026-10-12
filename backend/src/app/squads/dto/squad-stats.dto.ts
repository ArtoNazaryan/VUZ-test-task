import { ApiProperty } from '@nestjs/swagger';

export class SquadAbilityAverageDto {
  @ApiProperty({ example: 'Power' })
  name: string;

  @ApiProperty({ type: Number, nullable: true, example: 6.33 })
  average: number | null;
}

export class SquadStatsDto {
  @ApiProperty({ example: 3 })
  memberCount: number;

  @ApiProperty({
    type: [SquadAbilityAverageDto],
    description: 'Average of each ability across the squad, null when the squad is empty',
  })
  abilities: SquadAbilityAverageDto[];
}
