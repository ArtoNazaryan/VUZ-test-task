import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { makeCharacter } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import type { IPopularitySnapshot } from '@/entities/character/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { PopularityStrip } from '@/widgets/popularity-strip/index.ts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

function mockPopularity(snapshot: IPopularitySnapshot): void {
  mswServer.use(http.get(`${API_URL}/popularity`, () => HttpResponse.json(snapshot)));
}

const NAMES = ['Scorpion', 'Sub-Zero', 'Raiden', 'Liu Kang', 'Kitana', 'Jax'];

describe('PopularityStrip', () => {
  it('shows the five most picked characters with their pick counts', async () => {
    mockPopularity({
      items: NAMES.map((name, index) => ({
        character: makeCharacter({ id: index + 1, name }),
        pickCount: 10 - index,
      })),
      updatedAt: '2026-10-13T10:00:00.000Z',
    });

    renderWithStore(<PopularityStrip />, true);

    const list = await screen.findByRole('list', { name: 'Most picked characters' });
    const picks = within(list).getAllByRole('listitem');

    expect(picks).toHaveLength(5);
    expect(picks[0]).toHaveTextContent('Scorpion · 10');
    expect(within(list).queryByText(/Jax/)).not.toBeInTheDocument();
  });

  it('invites the user to pick when nobody has picked yet', async () => {
    mockPopularity({ items: [], updatedAt: '2026-10-13T10:00:00.000Z' });

    renderWithStore(<PopularityStrip />, true);

    expect(await screen.findByText('No picks yet, be the first')).toBeInTheDocument();
  });

  it('searches for a character when its chip is clicked', async () => {
    mockPopularity({
      items: [{ character: makeCharacter({ id: 1, name: 'Raiden' }), pickCount: 3 }],
      updatedAt: '2026-10-13T10:00:00.000Z',
    });
    const store = renderWithStore(<PopularityStrip />, true);

    await userEvent.click(await screen.findByRole('listitem'));

    expect(store.getState().characterFilters.search).toBe('Raiden');
  });

  it('hides itself when popularity cannot be loaded', async () => {
    mswServer.use(http.get(`${API_URL}/popularity`, () => new HttpResponse(null, { status: 500 })));

    renderWithStore(<PopularityStrip />, true);

    await waitFor(() => {
      expect(screen.queryByText('Most picked right now')).not.toBeInTheDocument();
    });
  });
});
