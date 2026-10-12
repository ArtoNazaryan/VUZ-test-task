import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { RealtimeBridge } from '@/app/providers/RealtimeBridge.tsx';
import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { characterApi, type IPopularitySnapshot } from '@/entities/character/index.ts';
import { selectIsAuthenticated, sessionEnded } from '@/entities/session/index.ts';
import { makeSquadSummary } from '@/entities/squad/__test__/fixtures/squads-api.mock.ts';
import { squadApi } from '@/entities/squad/index.ts';
import {
  readAccessToken,
  REALTIME_EVENTS,
  SOCKET_UNAUTHORIZED_MESSAGE,
} from '@/shared/api/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { type FakeSocket, getCreatedSockets } from '@/shared/lib/test/socket-io.mock.ts';
import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

const SQUAD_ID = 'squad-1';

function latestSocket(): FakeSocket {
  const socket = getCreatedSockets().at(-1);

  if (!socket) {
    throw new Error('No socket was opened');
  }

  return socket;
}

function serverEmit(event: string, payload: unknown): void {
  act(() => {
    latestSocket().serverEmit(event, payload);
  });
}

function mockSquadRequests(): { squadList: number; squad: number } {
  const counts = { squadList: 0, squad: 0 };

  mswServer.use(
    http.get(`${API_URL}/squads`, () => {
      counts.squadList += 1;

      return HttpResponse.json([makeSquadSummary(SQUAD_ID, 'Earthrealm')]);
    }),
    http.get(`${API_URL}/squads/:id`, () => {
      counts.squad += 1;

      return HttpResponse.json({ ...makeSquadSummary(SQUAD_ID, 'Earthrealm'), characters: [] });
    }),
  );

  return counts;
}

describe('RealtimeBridge', () => {
  it('does not open a socket for guests', () => {
    renderWithStore(<RealtimeBridge />);

    expect(getCreatedSockets()).toHaveLength(0);
  });

  it('opens one socket to the API origin and sends the access token', async () => {
    renderWithStore(<RealtimeBridge />, true);

    expect(getCreatedSockets()).toHaveLength(1);
    expect(latestSocket().url).toBe(new URL(API_URL).origin);
    await expect(latestSocket().readAuth()).resolves.toEqual({ token: 'access-token-1' });
  });

  it('closes the socket on logout', () => {
    const store = renderWithStore(<RealtimeBridge />, true);

    act(() => {
      store.dispatch(sessionEnded());
    });

    expect(latestSocket().isDisconnected).toBe(true);
  });

  it('refetches the squad and the squad list when a squad changes elsewhere', async () => {
    const counts = mockSquadRequests();
    const store = renderWithStore(<RealtimeBridge />, true);

    await act(async () => {
      await store.dispatch(squadApi.endpoints.getSquads.initiate(undefined));
      await store.dispatch(squadApi.endpoints.getSquad.initiate(SQUAD_ID));
    });
    serverEmit(REALTIME_EVENTS.SQUAD_CHANGED, {
      squadId: SQUAD_ID,
      change: 'member-added',
      characterId: 3,
      occurredAt: '2026-10-13T10:00:00.000Z',
    });

    await waitFor(() => {
      expect(counts).toEqual({ squadList: 2, squad: 2 });
    });
  });

  it('only refetches the squad list when a squad is deleted', async () => {
    const counts = mockSquadRequests();
    const store = renderWithStore(<RealtimeBridge />, true);

    await act(async () => {
      await store.dispatch(squadApi.endpoints.getSquads.initiate(undefined));
      await store.dispatch(squadApi.endpoints.getSquad.initiate(SQUAD_ID));
    });
    serverEmit(REALTIME_EVENTS.SQUAD_CHANGED, {
      squadId: SQUAD_ID,
      change: 'deleted',
      occurredAt: '2026-10-13T10:00:00.000Z',
    });

    await waitFor(() => {
      expect(counts.squadList).toBe(2);
    });
    expect(counts.squad).toBe(1);
  });

  it('ignores malformed squad messages', async () => {
    const counts = mockSquadRequests();
    const store = renderWithStore(<RealtimeBridge />, true);

    await act(async () => {
      await store.dispatch(squadApi.endpoints.getSquads.initiate(undefined));
    });
    serverEmit(REALTIME_EVENTS.SQUAD_CHANGED, { squadId: SQUAD_ID, change: 'exploded' });

    expect(counts.squadList).toBe(1);
  });

  it('writes popularity updates straight into the cache', async () => {
    const snapshot: IPopularitySnapshot = {
      items: [{ character: makeCharacter({ id: 7, name: 'Scorpion' }), pickCount: 4 }],
      updatedAt: '2026-10-13T10:00:00.000Z',
    };
    const store = renderWithStore(<RealtimeBridge />, true);

    serverEmit(REALTIME_EVENTS.POPULARITY_UPDATED, snapshot);

    await waitFor(() => {
      expect(characterApi.endpoints.getPopularity.select(undefined)(store.getState()).data).toEqual(
        snapshot,
      );
    });
  });

  it('refreshes the token once and reconnects when the handshake is rejected', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/refresh`, () =>
        HttpResponse.json(makeAuthSession('access-token-2')),
      ),
    );
    const store = renderWithStore(<RealtimeBridge />, true);

    serverEmit('connect_error', new Error(SOCKET_UNAUTHORIZED_MESSAGE));

    await waitFor(() => {
      expect(latestSocket().connectCalls).toBe(1);
    });
    expect(readAccessToken(store.getState())).toBe('access-token-2');
    await expect(latestSocket().readAuth()).resolves.toEqual({ token: 'access-token-2' });

    serverEmit('connect_error', new Error(SOCKET_UNAUTHORIZED_MESSAGE));

    expect(latestSocket().connectCalls).toBe(1);
  });

  it('ends the session when the token cannot be refreshed', async () => {
    mswServer.use(
      http.post(`${API_URL}/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
    );
    const store = renderWithStore(<RealtimeBridge />, true);

    serverEmit('connect_error', new Error(SOCKET_UNAUTHORIZED_MESSAGE));

    await waitFor(() => {
      expect(selectIsAuthenticated(store.getState())).toBe(false);
    });
  });
});
