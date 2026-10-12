import type { createAppStore } from '@/app/store/store.ts';

export type TAppStore = ReturnType<typeof createAppStore>;

export type TRootState = ReturnType<TAppStore['getState']>;
