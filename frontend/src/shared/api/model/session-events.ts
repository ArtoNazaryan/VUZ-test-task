import type { IAuthSessionPayload } from '@/shared/api/types/api.interfaces.ts';
import { createAction } from '@reduxjs/toolkit';

export const accessTokenRefreshed = createAction<IAuthSessionPayload>(
  'session/accessTokenRefreshed',
);

export const sessionExpired = createAction('session/expired');
