import { SessionStatus } from '@/entities/session/model/session-status.enum.ts';
import type { ISessionRootState } from '@/entities/session/model/session.interfaces.ts';
import type { IAuthUser } from '@/shared/api/index.ts';

export const selectSessionStatus = (state: ISessionRootState): SessionStatus =>
  state.session.status;

export const selectCurrentUser = (state: ISessionRootState): IAuthUser | null => state.session.user;

export const selectIsAuthenticated = (state: ISessionRootState): boolean =>
  state.session.status === SessionStatus.AUTHENTICATED;
