import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { CHARACTER_FILTER_OPTIONS } from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { CharacterFilters } from '@/features/character-filters/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

describe('CharacterFilters', () => {
  beforeEach(() => {
    mswServer.use(
      http.get(`${API_URL}/characters/filters`, () => HttpResponse.json(CHARACTER_FILTER_OPTIONS)),
    );
  });

  it('shows a pill for every tag and universe from the API', async () => {
    renderWithStore(<CharacterFilters />);

    expect(await screen.findByRole('button', { name: 'Ninja' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mortal Kombat' })).toBeInTheDocument();
  });

  it('selects and unselects a tag', async () => {
    const store = renderWithStore(<CharacterFilters />);
    const ninja = await screen.findByRole('button', { name: 'Ninja' });

    await userEvent.click(ninja);

    expect(ninja).toHaveAttribute('aria-pressed', 'true');
    expect(store.getState().characterFilters.tags).toEqual(['ninja']);

    await userEvent.click(ninja);

    expect(ninja).toHaveAttribute('aria-pressed', 'false');
  });

  it('enables Clear all only when something is selected and clears everything', async () => {
    const store = renderWithStore(<CharacterFilters />);
    const clearAll = screen.getByRole('button', { name: 'Clear all' });

    expect(clearAll).toBeDisabled();

    await userEvent.click(await screen.findByRole('button', { name: 'Ninja' }));
    await userEvent.click(screen.getByRole('button', { name: 'Street Fighter' }));

    expect(clearAll).toBeEnabled();

    await userEvent.click(clearAll);

    expect(store.getState().characterFilters).toEqual({
      search: '',
      tags: [],
      universes: [],
      myTeamOnly: false,
    });
  });
});
