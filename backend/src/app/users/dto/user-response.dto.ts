import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '0199d6a4-6f4e-7c2a-9b1d-3f6a2c8e4b10' })
  id: string;

  @ApiProperty({ example: 'ryu@example.com' })
  email: string;

  @ApiProperty({ example: '2026-10-12T14:37:45.000Z' })
  createdAt: Date;
}
