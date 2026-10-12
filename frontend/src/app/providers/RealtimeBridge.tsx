import { useAppDispatch, useAppStore } from '@/app/store/hooks.ts';
import { characterApi, isPopularitySnapshot } from '@/entities/character/index.ts';
import { selectIsAuthenticated } from '@/entities/session/index.ts';
import { isSquadChangedMessage, refetchChangedSquad } from '@/entities/squad/index.ts';
import {
  accessTokenRefreshed,
  readAccessToken,
  REALTIME_EVENTS,
  refreshAccessToken,
  sessionExpired,
  SOCKET_UNAUTHORIZED_MESSAGE,
  toSocketUrl,
} from '@/shared/api/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

export function RealtimeBridge(): null {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let hasRetriedWithFreshToken = false;
    const socket = io(toSocketUrl(API_URL), {
      transports: ['websocket'],
      auth: (setAuth) => {
        setAuth({ token: readAccessToken(store.getState()) });
      },
    });

    const reconnectWithFreshToken = async (): Promise<void> => {
      const session = await refreshAccessToken();

      if (!session) {
        dispatch(sessionExpired());

        return;
      }

      dispatch(accessTokenRefreshed(session));
      socket.connect();
    };

    socket.on('connect', () => {
      hasRetriedWithFreshToken = false;
    });
    socket.on('connect_error', (error: Error) => {
      if (error.message === SOCKET_UNAUTHORIZED_MESSAGE && !hasRetriedWithFreshToken) {
        hasRetriedWithFreshToken = true;
        void reconnectWithFreshToken();
      }
    });
    socket.on(REALTIME_EVENTS.SQUAD_CHANGED, (message: unknown) => {
      if (isSquadChangedMessage(message)) {
        dispatch(refetchChangedSquad(message));
      }
    });
    socket.on(REALTIME_EVENTS.POPULARITY_UPDATED, (snapshot: unknown) => {
      if (isPopularitySnapshot(snapshot)) {
        void dispatch(characterApi.util.upsertQueryData('getPopularity', undefined, snapshot));
      }
    });

    return (): void => {
      socket.disconnect();
    };
  }, [isAuthenticated, dispatch, store]);

  return null;
}
