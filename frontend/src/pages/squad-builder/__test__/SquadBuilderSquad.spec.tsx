import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import {
  CHARACTER_FILTER_OPTIONS,
  makeCharacter,
} from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import {
  createSquadsApiMock,
  makeSquadSummary,
} from '@/entities/squad/__test__/fixtures/squads-api.mock.ts';
import { SquadBuilderPage } from '@/pages/squad-builder/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

describe('SquadBuilderPage squad building', () => {
  it('shows the ticked character in the squad header with "Your champions!"', async () => {
    const scorpion = makeCharacter({ id: 12, name: 'Scorpion' });
    const api = createSquadsApiMock([makeSquadSummary('squad-1', 'Earthrealm')], {}, [scorpion]);
    mswServer.use(
      ...api.handlers,
      http.get(`${API_URL}/characters/filters`, () => HttpResponse.json(CHARACTER_FILTER_OPTIONS)),
      http.get(`${API_URL}/characters`, () =>
        HttpResponse.json({ items: [scorpion], nextCursor: null }),
      ),
    );
    renderWithStore(<SquadBuilderPage />, true);

    expect(
      await screen.findByRole('heading', { name: 'Select your squad to defend earthrealm' }),
    ).toBeInTheDocument();

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Add Scorpion to squad' }));

    expect(await screen.findByRole('heading', { name: 'Your champions!' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Scorpion' })).toBeInTheDocument();
    expect(await screen.findByText('Earthrealm (1/6)')).toBeInTheDocument();
  });
});
