import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import {
  CHARACTER_FILTER_OPTIONS,
  makeCharacter,
} from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import {
  createSquadsApiMock,
  makeSquadSummary,
} from '@/entities/squad/__test__/fixtures/squads-api.mock.ts';
import { API_URL } from '@/shared/config/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { NotificationsHost } from '@/shared/ui/index.ts';
import { SquadHeader } from '@/widgets/squad-header/index.ts';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

const scorpion = makeCharacter({
  id: 12,
  name: 'Scorpion',
  abilities: [
    { name: 'Power', score: 7 },
    { name: 'Mobility', score: 4 },
    { name: 'Technique', score: 3 },
    { name: 'Survivability', score: 8 },
    { name: 'Energy', score: 5 },
  ],
});
const drMario = makeCharacter({
  id: 99,
  name: 'Dr. Mario',
  abilities: [
    { name: 'Power', score: 3 },
    { name: 'Mobility', score: 7 },
    { name: 'Technique', score: 4 },
    { name: 'Survivability', score: 2 },
    { name: 'Energy', score: 10 },
  ],
});

const averages = (): string[] =>
  within(screen.getByRole('list', { name: 'Squad averages' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent);

function renderHeader(
  members: Parameters<typeof createSquadsApiMock>[1] = {},
): ReturnType<typeof createSquadsApiMock> {
  const api = createSquadsApiMock([makeSquadSummary('squad-1', 'Earthrealm')], members);
  mswServer.use(
    ...api.handlers,
    http.get(`${API_URL}/characters/filters`, () => HttpResponse.json(CHARACTER_FILTER_OPTIONS)),
  );
  renderWithStore(
    <>
      <SquadHeader />
      <NotificationsHost />
    </>,
    true,
  );

  return api;
}

describe('SquadHeader', () => {
  it('asks the user to pick a squad and shows dashes while the squad is empty', async () => {
    renderHeader();

    expect(
      await screen.findByRole('heading', { name: 'Select your squad to defend earthrealm' }),
    ).toBeInTheDocument();
    await vi.waitFor(() => {
      expect(averages()).toEqual([
        'Power-',
        'Mobility-',
        'Technique-',
        'Survivability-',
        'Energy-',
      ]);
    });
    expect(screen.queryByRole('list', { name: 'Squad members' })).not.toBeInTheDocument();
  });

  it('shows "Your champions!", the members and the server averages', async () => {
    renderHeader({ 'squad-1': [scorpion, drMario] });

    expect(await screen.findByRole('heading', { name: 'Your champions!' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Scorpion' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Dr. Mario' })).toBeInTheDocument();
    expect(averages()).toEqual([
      'Power5',
      'Mobility5.5',
      'Technique3.5',
      'Survivability5',
      'Energy7.5',
    ]);
  });

  it('removes a member at once and then shows the averages from the server', async () => {
    renderHeader({ 'squad-1': [scorpion, drMario] });

    await userEvent.click(await screen.findByRole('button', { name: 'Remove Dr. Mario' }));

    expect(screen.queryByRole('button', { name: 'Remove Dr. Mario' })).not.toBeInTheDocument();
    await vi.waitFor(() => {
      expect(averages()).toEqual([
        'Power7',
        'Mobility4',
        'Technique3',
        'Survivability8',
        'Energy5',
      ]);
    });
  });

  it('puts the member back and explains why when the server refuses', async () => {
    const api = renderHeader({ 'squad-1': [scorpion] });
    api.failNextMemberChange = {
      status: 500,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };

    await userEvent.click(await screen.findByRole('button', { name: 'Remove Scorpion' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong on our side, please try again',
    );
    expect(screen.getByRole('button', { name: 'Remove Scorpion' })).toBeInTheDocument();
  });
});
