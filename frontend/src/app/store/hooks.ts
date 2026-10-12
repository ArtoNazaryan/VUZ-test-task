import type { TAppStore } from '@/app/store/store.types.ts';
import { useDispatch, useStore } from 'react-redux';

export const useAppDispatch = useDispatch.withTypes<TAppStore['dispatch']>();
export const useAppStore = useStore.withTypes<TAppStore>();
