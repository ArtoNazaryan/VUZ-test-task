import type {
  IAuthResponse,
  ICredentials,
} from '@/entities/session/model/auth-request.interfaces.ts';
import { baseApi } from '@/shared/api/index.ts';

export const sessionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<IAuthResponse, ICredentials>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    register: build.mutation<IAuthResponse, ICredentials>({
      query: (credentials) => ({ url: '/auth/register', method: 'POST', body: credentials }),
    }),
    logout: build.mutation<undefined, undefined>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = sessionApi;
