import type { REFRESH_TOKEN_SELECT } from '@app/auth/constants/refresh-token-select.constants.js';
import type { RefreshTokenGetPayload } from '@infrastructure/prisma/generated/models.js';

export type TRefreshTokenRow = RefreshTokenGetPayload<{ select: typeof REFRESH_TOKEN_SELECT }>;
