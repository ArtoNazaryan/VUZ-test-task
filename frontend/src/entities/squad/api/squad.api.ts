import { upsertSquadSummary } from '@/entities/squad/lib/squad-summary.helper.ts';
import type {
  ICreateSquadRequest,
  IRenameSquadRequest,
  ISquad,
  ISquadSummary,
} from '@/entities/squad/model/squad.interfaces.ts';
import { baseApi } from '@/shared/api/index.ts';

export const squadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSquads: build.query<ISquadSummary[], undefined>({
      query: () => '/squads',
      providesTags: ['Squads'],
    }),
    getSquad: build.query<ISquad, string>({
      query: (id) => `/squads/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Squad', id }],
    }),
    createSquad: build.mutation<ISquad, ICreateSquadRequest>({
      query: (body) => ({ url: '/squads', method: 'POST', body }),
      invalidatesTags: ['Squads'],
      onQueryStarted: async (_request, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            squadApi.util.updateQueryData('getSquads', undefined, (squads) =>
              upsertSquadSummary(squads, data),
            ),
          );
          await dispatch(squadApi.util.upsertQueryData('getSquad', data.id, data));
        } catch {
          return;
        }
      },
    }),
    renameSquad: build.mutation<ISquad, IRenameSquadRequest>({
      query: ({ id, name }) => ({ url: `/squads/${id}`, method: 'PATCH', body: { name } }),
      invalidatesTags: ['Squads'],
      onQueryStarted: async (_request, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            squadApi.util.updateQueryData('getSquads', undefined, (squads) =>
              upsertSquadSummary(squads, data),
            ),
          );
          await dispatch(squadApi.util.upsertQueryData('getSquad', data.id, data));
        } catch {
          return;
        }
      },
    }),
    deleteSquad: build.mutation<undefined, string>({
      query: (id) => ({ url: `/squads/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => ['Squads', { type: 'Squad', id }],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;

          dispatch(
            squadApi.util.updateQueryData('getSquads', undefined, (squads) =>
              squads.filter((squad) => squad.id !== id),
            ),
          );
        } catch {
          return;
        }
      },
    }),
  }),
});

export const {
  useGetSquadsQuery,
  useGetSquadQuery,
  useCreateSquadMutation,
  useRenameSquadMutation,
  useDeleteSquadMutation,
} = squadApi;
