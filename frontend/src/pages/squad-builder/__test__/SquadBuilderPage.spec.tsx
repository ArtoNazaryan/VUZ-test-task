import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import {
  CHARACTER_FILTER_OPTIONS,
  makeCharacter,
} from '@/entities/character/__test__/fixtures/character.fixtures.ts';
import { SquadBuilderPage } from '@/pages/squad-builder/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

describe('SquadBuilderPage filtering', () => {
  let requestedParams: URLSearchParams[];

  beforeEach(() => {
    requestedParams = [];
    mswServer.use(
      http.get(`${API_URL}/characters/filters`, () => HttpResponse.json(CHARACTER_FILTER_OPTIONS)),
      http.get(`${API_URL}/characters`, ({ request }) => {
        const params = new URL(request.url).searchParams;
        requestedParams.push(params);

        return params.get('search') === 'nobody'
          ? HttpResponse.json({ items: [], nextCursor: null })
          : HttpResponse.json({ items: [makeCharacter()], nextCursor: null });
      }),
    );
  });

  const lastRequest = (): URLSearchParams | undefined => requestedParams.at(-1);

  it('asks the server for the typed search once the user stops typing', async () => {
    renderWithStore(<SquadBuilderPage />);
    await screen.findByText('Cassie Cage');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search characters' }), 'cas');

    await vi.waitFor(() => {
      expect(lastRequest()?.get('search')).toBe('cas');
    });
    expect(requestedParams.filter((params) => params.has('search'))).toHaveLength(1);
  });

  it('sends the selected tags and universes as comma separated lists', async () => {
    renderWithStore(<SquadBuilderPage />);

    await userEvent.click(await screen.findByRole('button', { name: 'Ninja' }));
    await userEvent.click(screen.getByRole('button', { name: 'Robot' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mortal Kombat' }));

    await vi.waitFor(() => {
      expect(lastRequest()?.get('tags')).toBe('ninja,robot');
    });
    expect(lastRequest()?.get('universes')).toBe('Mortal Kombat');
  });

  it('offers to clear the filters when nothing matches and shows everyone again', async () => {
    renderWithStore(<SquadBuilderPage />);
    await screen.findByText('Cassie Cage');

    await userEvent.type(screen.getByRole('textbox', { name: 'Search characters' }), 'nobody');
    await userEvent.click(await screen.findByRole('button', { name: 'Clear filters' }));

    expect(await screen.findByText('Cassie Cage')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search characters' })).toHaveValue('');
  });
});
