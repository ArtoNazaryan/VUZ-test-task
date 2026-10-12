import { characterFiltersSlice } from '@/entities/character/index.ts';
import { sessionSlice } from '@/entities/session/index.ts';
import { activeSquadSlice } from '@/entities/squad/index.ts';
import { baseApi } from '@/shared/api/index.ts';
import { notificationsSlice } from '@/shared/model/index.ts';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

const rootReducer = combineReducers({
  [sessionSlice.name]: sessionSlice.reducer,
  [characterFiltersSlice.name]: characterFiltersSlice.reducer,
  [activeSquadSlice.name]: activeSquadSlice.reducer,
  [notificationsSlice.name]: notificationsSlice.reducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export function createAppStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export const appStore = createAppStore();
