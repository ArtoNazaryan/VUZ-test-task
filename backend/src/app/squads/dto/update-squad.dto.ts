import { SQUAD_NAME_MAX_LENGTH } from '@app/squads/constants/squads.constants.js';
import { toTrimmedString } from '@infrastructure/common/helpers/query-transform.helper.js';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';

export class UpdateSquadDto {
  @ApiProperty({ example: 'Outworld invaders', maxLength: SQUAD_NAME_MAX_LENGTH })
  @Transform(({ value }: { value: unknown }) => toTrimmedString(value))
  @IsString()
  @MaxLength(SQUAD_NAME_MAX_LENGTH)
  name: string;
}
