import { SessionStatus } from '@/entities/session/model/session-status.enum.ts';
import type { ISessionState } from '@/entities/session/model/session.interfaces.ts';
import {
  accessTokenRefreshed,
  type IAuthSessionPayload,
  sessionExpired,
} from '@/shared/api/index.ts';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const initialState: ISessionState = {
  status: SessionStatus.UNKNOWN,
  accessToken: null,
  user: null,
};

const anonymousState: ISessionState = {
  status: SessionStatus.ANONYMOUS,
  accessToken: null,
  user: null,
};

function toAuthenticatedState(payload: IAuthSessionPayload): ISessionState {
  return {
    status: SessionStatus.AUTHENTICATED,
    accessToken: payload.accessToken,
    user: payload.user,
  };
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionStarted: (_state, action: PayloadAction<IAuthSessionPayload>) =>
      toAuthenticatedState(action.payload),
    sessionEnded: () => anonymousState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(accessTokenRefreshed, (_state, action) => toAuthenticatedState(action.payload))
      .addCase(sessionExpired, () => anonymousState);
  },
});

export const { sessionStarted, sessionEnded } = sessionSlice.actions;
