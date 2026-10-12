import { SQUAD_NAME_MAX_LENGTH } from '@app/squads/constants/squads.constants.js';
import { SquadCharacterIdsDto } from '@app/squads/dto/squad-character-ids.dto.js';
import { toTrimmedString } from '@infrastructure/common/helpers/query-transform.helper.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSquadDto extends SquadCharacterIdsDto {
  @ApiPropertyOptional({ example: 'Outworld invaders', maxLength: SQUAD_NAME_MAX_LENGTH })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => toTrimmedString(value))
  @IsString()
  @MaxLength(SQUAD_NAME_MAX_LENGTH)
  name?: string;
}
