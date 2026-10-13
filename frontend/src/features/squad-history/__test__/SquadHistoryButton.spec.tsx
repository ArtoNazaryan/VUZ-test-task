import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import type { ISquadActivity, ISquadHistoryPage } from '@/entities/squad/index.ts';
import { SquadHistoryButton } from '@/features/squad-history/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { scrollObservedElementsIntoView } from '@/shared/lib/test/intersection-observer.mock.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

const HISTORY_URL = `${API_URL}/squads/squad-1/history`;

function activity(id: string, overrides: Partial<ISquadActivity>): ISquadActivity {
  return { id, type: 'squad.updated', occurredAt: new Date().toISOString(), ...overrides };
}

const firstPage: ISquadHistoryPage = {
  items: [
    activity('a3', { type: 'squad.member-added', character: makeCharacter({ name: 'Scorpion' }) }),
    activity('a2', { details: { name: 'Outworld' } }),
  ],
  nextCursor: 'cursor-2',
};
const lastPage: ISquadHistoryPage = {
  items: [activity('a1', { type: 'squad.created', details: { name: 'Earthrealm' } })],
  nextCursor: null,
};

function mockHistory(pages: Record<string, ISquadHistoryPage>): string[] {
  const requestedCursors: string[] = [];

  mswServer.use(
    http.get(HISTORY_URL, ({ request }) => {
      const cursor = new URL(request.url).searchParams.get('cursor') ?? '';
      requestedCursors.push(cursor);

      return HttpResponse.json(pages[cursor]);
    }),
  );

  return requestedCursors;
}

async function openHistory(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole('button', { name: 'Show squad history' }));

  return screen.findByRole('list', { name: 'Squad history' });
}

describe('SquadHistoryButton', () => {
  it('does not load the history until it is opened', () => {
    const requestedCursors = mockHistory({ '': firstPage });

    renderWithStore(<SquadHistoryButton squadId="squad-1" />, true);

    expect(requestedCursors).toEqual([]);
  });

  it('shows the newest changes first, in words', async () => {
    mockHistory({ '': firstPage, 'cursor-2': lastPage });
    renderWithStore(<SquadHistoryButton squadId="squad-1" />, true);

    const list = await openHistory();
    const items = within(list).getAllByRole('listitem');

    expect(items[0]).toHaveTextContent('Added Scorpion');
    expect(items[0]).toHaveTextContent('just now');
    expect(items[1]).toHaveTextContent('Renamed to "Outworld"');
  });

  it('loads older changes when the end of the list is reached', async () => {
    const requestedCursors = mockHistory({ '': firstPage, 'cursor-2': lastPage });
    renderWithStore(<SquadHistoryButton squadId="squad-1" />, true);

    const list = await openHistory();
    act(() => {
      scrollObservedElementsIntoView();
    });

    expect(await within(list).findByText('Created "Earthrealm"')).toBeInTheDocument();
    expect(requestedCursors).toEqual(['', 'cursor-2']);
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('says so when nothing was recorded yet', async () => {
    mockHistory({ '': { items: [], nextCursor: null } });
    renderWithStore(<SquadHistoryButton squadId="squad-1" />, true);

    await userEvent.click(screen.getByRole('button', { name: 'Show squad history' }));

    expect(await screen.findByText('No changes recorded yet')).toBeInTheDocument();
  });

  it('lets the user retry after an error', async () => {
    let shouldFail = true;
    mswServer.use(
      http.get(HISTORY_URL, () =>
        shouldFail
          ? HttpResponse.json(
              { statusCode: 500, error: 'INTERNAL_ERROR', message: 'Boom', requestId: 'test' },
              { status: 500 },
            )
          : HttpResponse.json(lastPage),
      ),
    );
    renderWithStore(<SquadHistoryButton squadId="squad-1" />, true);

    await userEvent.click(screen.getByRole('button', { name: 'Show squad history' }));
    await screen.findByRole('alert');
    shouldFail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Created "Earthrealm"')).toBeInTheDocument();
  });

  it('closes the drawer', async () => {
    mockHistory({ '': lastPage });
    renderWithStore(<SquadHistoryButton squadId="squad-1" />, true);

    await openHistory();
    await userEvent.click(screen.getByRole('button', { name: 'Close squad history' }));

    await waitFor(() => {
      expect(screen.queryByRole('list', { name: 'Squad history' })).not.toBeInTheDocument();
    });
  });
});
