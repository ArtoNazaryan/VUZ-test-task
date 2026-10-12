import type { UserResponseDto } from '@app/users/dto/user-response.dto.js';
import type { TUserRow } from '@app/users/types/user.types.js';

export function toUserResponse(row: TUserRow): UserResponseDto {
  return { id: row.id, email: row.email, createdAt: row.createdAt };
}
