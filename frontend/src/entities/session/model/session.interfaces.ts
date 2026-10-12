import type { SessionStatus } from '@/entities/session/model/session-status.enum.ts';
import type { IAuthUser } from '@/shared/api/index.ts';

export interface ISessionState {
  status: SessionStatus;
  accessToken: string | null;
  user: IAuthUser | null;
}

export interface ISessionRootState {
  session: ISessionState;
}
