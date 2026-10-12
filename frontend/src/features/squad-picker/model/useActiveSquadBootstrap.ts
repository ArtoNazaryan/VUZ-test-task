import type { IActiveSquadBootstrap } from '@/features/squad-picker/model/squad-picker.interfaces.ts';
import { selectCurrentUser } from '@/entities/session/index.ts';
import {
  activeSquadChanged,
  buildActiveSquadStorageKey,
  DEFAULT_SQUAD_NAME,
  resolveActiveSquadId,
  selectActiveSquadId,
  useCreateSquadMutation,
  useGetSquadsQuery,
} from '@/entities/squad/index.ts';
import { readStoredValue, writeStoredValue } from '@/shared/lib/helpers/storage.helper.ts';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useActiveSquadBootstrap(): IActiveSquadBootstrap {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const activeSquadId = useSelector(selectActiveSquadId);
  const { data: squads, isSuccess, isLoading, isError, refetch } = useGetSquadsQuery(undefined);
  const [createSquad] = useCreateSquadMutation();
  const isCreatingDefault = useRef(false);

  useEffect(() => {
    if (!isSuccess || !user) {
      return;
    }

    if (squads.length > 0) {
      const preferredId = activeSquadId ?? readStoredValue(buildActiveSquadStorageKey(user.id));
      const resolvedId = resolveActiveSquadId(squads, preferredId);

      if (resolvedId !== activeSquadId) {
        dispatch(activeSquadChanged(resolvedId));
      }

      return;
    }

    if (isCreatingDefault.current) {
      return;
    }

    isCreatingDefault.current = true;

    const createDefaultSquad = async (): Promise<void> => {
      await createSquad({ name: DEFAULT_SQUAD_NAME });
      isCreatingDefault.current = false;
    };

    void createDefaultSquad();
  }, [isSuccess, squads, user, activeSquadId, dispatch, createSquad]);

  useEffect(() => {
    if (user && activeSquadId) {
      writeStoredValue(buildActiveSquadStorageKey(user.id), activeSquadId);
    }
  }, [user, activeSquadId]);

  return {
    squads: squads ?? [],
    activeSquadId,
    isLoading,
    isError,
    retry: (): void => {
      void refetch();
    },
  };
}
