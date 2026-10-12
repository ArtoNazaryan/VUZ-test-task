import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import {
  CHARACTER_FILTER_OPTIONS,
  makeCharacter,
} from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import type { ICharacter } from '@/entities/character/index.ts';
import {
  createSquadsApiMock,
  makeSquadSummary,
} from '@/entities/squad/__test__/fixtures/squads-api.mock.ts';
import { activeSquadChanged } from '@/entities/squad/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { NotificationsHost } from '@/shared/ui/index.ts';
import { CharacterTable } from '@/widgets/character-table/index.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

const catalogue: ICharacter[] = Array.from({ length: 8 }, (_, index) =>
  makeCharacter({ id: index + 1, name: `Fighter ${String(index + 1)}` }),
);

function renderTable(
  members: ICharacter[],
  myTeamOnly = false,
  search = '',
): ReturnType<typeof createSquadsApiMock> {
  const api = createSquadsApiMock(
    [makeSquadSummary('squad-1', 'Earthrealm')],
    { 'squad-1': members },
    catalogue,
  );
  mswServer.use(
    ...api.handlers,
    http.get(`${API_URL}/characters/filters`, () => HttpResponse.json(CHARACTER_FILTER_OPTIONS)),
    http.get(`${API_URL}/characters`, () =>
      HttpResponse.json({ items: catalogue, nextCursor: null }),
    ),
  );
  renderWithStore(
    <>
      <CharacterTable filters={{ search }} myTeamOnly={myTeamOnly} />
      <NotificationsHost />
    </>,
    true,
    (store) => store.dispatch(activeSquadChanged('squad-1')),
  );

  return api;
}

const checkbox = (name: string, action: 'Add' | 'Remove'): HTMLElement =>
  screen.getByRole('checkbox', {
    name: action === 'Add' ? `Add ${name} to squad` : `Remove ${name} from squad`,
  });

describe('CharacterTable squad selection', () => {
  it('ticks and highlights the characters that are in the squad', async () => {
    renderTable(catalogue.slice(1, 2));

    expect(
      await screen.findByRole('checkbox', { name: 'Remove Fighter 2 from squad' }),
    ).toBeChecked();
    expect(checkbox('Fighter 2', 'Remove').closest('tr')).toHaveAttribute('aria-selected', 'true');
    expect(checkbox('Fighter 1', 'Add')).not.toBeChecked();
  });

  it('adds a character at once and keeps it after the server confirms', async () => {
    const api = renderTable([]);

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Add Fighter 3 to squad' }));

    expect(checkbox('Fighter 3', 'Remove')).toBeChecked();
    await vi.waitFor(() => {
      expect(api.members['squad-1']?.map((member) => member.id)).toEqual([3]);
    });
  });

  it('removes a character when its checkbox is cleared', async () => {
    const api = renderTable(catalogue.slice(0, 1));

    await userEvent.click(
      await screen.findByRole('checkbox', { name: 'Remove Fighter 1 from squad' }),
    );

    expect(checkbox('Fighter 1', 'Add')).not.toBeChecked();
    await vi.waitFor(() => {
      expect(api.members['squad-1']).toEqual([]);
    });
  });

  it('disables the other checkboxes once the squad has 6 characters', async () => {
    renderTable(catalogue.slice(0, 6));

    expect(await screen.findByRole('checkbox', { name: 'Add Fighter 7 to squad' })).toBeDisabled();
    expect(checkbox('Fighter 1', 'Remove')).toBeEnabled();
  });

  it('undoes the tick and shows the server reason when the squad is already full', async () => {
    const api = renderTable([]);
    api.failNextMemberChange = {
      status: 422,
      error: 'SQUAD_FULL',
      message: 'A squad cannot have more than 6 characters',
    };

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Add Fighter 4 to squad' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A squad cannot have more than 6 characters',
    );
    expect(checkbox('Fighter 4', 'Add')).not.toBeChecked();
  });

  it('shows only the squad members, filtered by the search, in My Team mode', async () => {
    renderTable([...catalogue.slice(0, 1), ...catalogue.slice(4, 5)], true, 'fighter 5');

    expect(await screen.findByText('Fighter 5')).toBeInTheDocument();
    expect(screen.queryByText('Fighter 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Fighter 2')).not.toBeInTheDocument();
  });

  it('explains how to add characters when My Team is on and the squad is empty', async () => {
    renderTable([], true);

    expect(
      await screen.findByText('Your squad is empty, tick characters in the list to add them'),
    ).toBeInTheDocument();
  });
});
