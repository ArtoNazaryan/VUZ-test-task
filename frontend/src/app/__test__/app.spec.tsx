import { App } from '@/app/App.tsx';
import { API_URL } from '@/shared/config/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

describe('App', () => {
  it('restores the session from the refresh cookie and shows the squad builder', async () => {
    mswServer.use(http.post(`${API_URL}/auth/refresh`, () => HttpResponse.json(makeAuthSession())));

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Select your squad to defend earthrealm' }),
    ).toBeInTheDocument();
  });
});
