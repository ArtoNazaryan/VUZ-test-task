import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import {
  CHARACTER_FILTER_OPTIONS,
  makeCharacter,
} from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { API_URL } from '@/shared/config/index.ts';
import { apiErrorResponse } from '@/shared/lib/test/api-responses.ts';
import { scrollObservedElementsIntoView } from '@/shared/lib/test/intersection-observer.mock.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { CharacterTable } from '@/widgets/character-table/index.ts';
import { Button } from '@mui/material';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

const FIRST_PAGE = {
  items: [
    makeCharacter({ id: 1, name: 'Akuma' }),
    makeCharacter({
      id: 2,
      name: 'Baraka',
      abilities: [
        { name: 'Power', score: 10 },
        { name: 'Mobility', score: 2 },
        { name: 'Technique', score: 3 },
        { name: 'Survivability', score: 5 },
        { name: 'Energy', score: 6 },
      ],
    }),
  ],
  nextCursor: 'cursor-2',
};
const SECOND_PAGE = { items: [makeCharacter({ id: 3, name: 'Cammy' })], nextCursor: null };

function mockFilters(): void {
  mswServer.use(
    http.get(`${API_URL}/characters/filters`, () => HttpResponse.json(CHARACTER_FILTER_OPTIONS)),
  );
}

function mockPagedCharacters(): void {
  mswServer.use(
    http.get(`${API_URL}/characters`, ({ request }) =>
      HttpResponse.json(
        new URL(request.url).searchParams.get('cursor') === 'cursor-2' ? SECOND_PAGE : FIRST_PAGE,
      ),
    ),
  );
}

const rowNames = (): string[] =>
  within(screen.getByRole('table', { name: 'Characters' }))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[1]?.textContent ?? '');

describe('CharacterTable', () => {
  it('shows placeholder rows while the first page loads, then the characters', async () => {
    mockFilters();
    mockPagedCharacters();
    renderWithStore(<CharacterTable filters={{}} />);

    expect(screen.getAllByTestId('character-skeleton-row').length).toBeGreaterThan(0);
    expect(await screen.findByText('Akuma')).toBeInTheDocument();
    expect(screen.queryByTestId('character-skeleton-row')).not.toBeInTheDocument();
  });

  it('shows the ability columns in the design order and highlights a score of 10', async () => {
    mockFilters();
    mockPagedCharacters();
    renderWithStore(<CharacterTable filters={{}} />);

    await screen.findByText('Baraka');

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);

    expect(headers).toEqual([
      'In squad',
      'Character',
      'Tags',
      ...CHARACTER_FILTER_OPTIONS.abilities,
    ]);
    expect(screen.getByText('10')).toHaveAttribute('data-max', 'true');
  });

  it('loads the next page when the end of the list scrolls into view', async () => {
    mockFilters();
    mockPagedCharacters();
    renderWithStore(<CharacterTable filters={{}} />);

    await screen.findByText('Baraka');
    scrollObservedElementsIntoView();

    expect(await screen.findByText('Cammy')).toBeInTheDocument();
    expect(rowNames()).toEqual(['Akuma', 'Baraka', 'Cammy']);
    expect(screen.getByText("That's everyone")).toBeInTheDocument();
  });

  it('shows an error with a retry button that loads the list again', async () => {
    mockFilters();
    let attempts = 0;
    mswServer.use(
      http.get(`${API_URL}/characters`, () => {
        attempts += 1;

        return attempts === 1
          ? apiErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error')
          : HttpResponse.json(SECOND_PAGE);
      }),
    );
    renderWithStore(<CharacterTable filters={{}} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong on our side, please try again',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Cammy')).toBeInTheDocument();
  });

  it('shows the empty state with the given action when nothing matches', async () => {
    mockFilters();
    mswServer.use(
      http.get(`${API_URL}/characters`, () => HttpResponse.json({ items: [], nextCursor: null })),
    );
    renderWithStore(
      <CharacterTable
        filters={{ search: 'nobody' }}
        emptyAction={<Button>Clear filters</Button>}
      />,
    );

    expect(await screen.findByText('No champions match your filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });
});
