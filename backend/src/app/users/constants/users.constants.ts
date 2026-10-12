import type { UserSelect } from '@infrastructure/prisma/generated/models.js';

export const USER_SELECT = {
  id: true,
  email: true,
  passwordHash: true,
  createdAt: true,
} satisfies UserSelect;
