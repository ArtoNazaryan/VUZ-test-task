import { readAccessToken } from '@/shared/api/helpers/session-state.helper.ts';
import { accessTokenRefreshed, sessionExpired } from '@/shared/api/model/session-events.ts';
import { refreshAccessToken } from '@/shared/api/refresh-access-token.ts';
import type { TQueryArgs, TQueryError } from '@/shared/api/types/api.types.ts';
import { API_URL } from '@/shared/config/index.ts';
import { type BaseQueryFn, fetchBaseQuery } from '@reduxjs/toolkit/query';

const PATHS_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const accessToken = readAccessToken(getState());

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return headers;
  },
});

function canRefreshFor(args: TQueryArgs): boolean {
  const url = typeof args === 'string' ? args : args.url;

  return !PATHS_WITHOUT_REFRESH.includes(url);
}

export const baseQueryWithRefresh: BaseQueryFn<TQueryArgs, unknown, TQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || !canRefreshFor(args)) {
    return result;
  }

  const session = await refreshAccessToken();

  if (!session) {
    api.dispatch(sessionExpired());

    return result;
  }

  api.dispatch(accessTokenRefreshed(session));

  return rawBaseQuery(args, api, extraOptions);
};
