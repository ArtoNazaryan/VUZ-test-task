import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { CharacterSearch } from '@/features/character-search/index.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('CharacterSearch', () => {
  it('stores what the user types', async () => {
    const store = renderWithStore(<CharacterSearch />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search characters' }), 'sub');

    expect(store.getState().characterFilters.search).toBe('sub');
  });

  it('clears the search with the clear button', async () => {
    const store = renderWithStore(<CharacterSearch />);

    await userEvent.type(screen.getByRole('textbox', { name: 'Search characters' }), 'sub');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(store.getState().characterFilters.search).toBe('');
    expect(screen.getByRole('textbox', { name: 'Search characters' })).toHaveValue('');
  });
});
