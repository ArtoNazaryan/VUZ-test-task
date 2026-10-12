import type { USER_SELECT } from '@app/users/constants/users.constants.js';
import type { UserGetPayload } from '@infrastructure/prisma/generated/models.js';

export type TUserRow = UserGetPayload<{ select: typeof USER_SELECT }>;
