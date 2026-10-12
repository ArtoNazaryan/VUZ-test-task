import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from '@app/auth/constants/auth.constants.js';
import { toTrimmedString } from '@infrastructure/common/helpers/query-transform.helper.js';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ryu@example.com' })
  @Transform(({ value }: { value: unknown }) => toTrimmedString(value))
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @ApiProperty({ example: 'hadouken-2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}
