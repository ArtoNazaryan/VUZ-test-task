import type { RefreshTokenSelect } from '@infrastructure/prisma/generated/models.js';

export const REFRESH_TOKEN_SELECT = {
  id: true,
  userId: true,
  expiresAt: true,
  revokedAt: true,
} satisfies RefreshTokenSelect;
