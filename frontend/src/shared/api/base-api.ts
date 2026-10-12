import { baseQueryWithRefresh } from '@/shared/api/base-query.ts';
import { createApi } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRefresh,
  tagTypes: ['Squads', 'Squad', 'Characters', 'Profile'],
  endpoints: () => ({}),
});
