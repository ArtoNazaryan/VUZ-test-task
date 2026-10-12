import { buildCharacterQueryParams } from '@/entities/character/lib/character-query.helper.ts';
import type {
  ICharacterFilterOptions,
  ICharacterListArgs,
  ICharacterPage,
} from '@/entities/character/model/character.interfaces.ts';
import type { IPopularitySnapshot } from '@/entities/character/model/popularity.interfaces.ts';
import { baseApi } from '@/shared/api/index.ts';

export const characterApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCharacters: build.infiniteQuery<ICharacterPage, ICharacterListArgs, string>({
      infiniteQueryOptions: {
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ queryArg, pageParam }) => ({
        url: '/characters',
        params: buildCharacterQueryParams(queryArg, pageParam),
      }),
    }),
    getPopularity: build.query<IPopularitySnapshot, undefined>({
      query: () => '/popularity',
    }),
    getCharacterFilters: build.query<ICharacterFilterOptions, undefined>({
      query: () => '/characters/filters',
    }),
  }),
});

export const { useGetCharactersInfiniteQuery, useGetCharacterFiltersQuery, useGetPopularityQuery } =
  characterApi;
