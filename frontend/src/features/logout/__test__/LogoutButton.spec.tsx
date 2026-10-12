import { renderWithStore } from '@/app/__test__/helpers/render-with-store.tsx';
import { SessionStatus } from '@/entities/session/index.ts';
import { LogoutButton } from '@/features/logout/index.ts';
import { API_URL } from '@/shared/config/index.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

describe('LogoutButton', () => {
  it('revokes the refresh token on the server and ends the session', async () => {
    let logoutCalls = 0;
    mswServer.use(
      http.post(`${API_URL}/auth/logout`, () => {
        logoutCalls += 1;

        return new HttpResponse(null, { status: 204 });
      }),
    );
    const store = renderWithStore(<LogoutButton />, true);

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await vi.waitFor(() => {
      expect(store.getState().session.status).toBe(SessionStatus.ANONYMOUS);
    });
    expect(logoutCalls).toBe(1);
    expect(store.getState().session.accessToken).toBeNull();
  });

  it('still ends the session locally when the server cannot be reached', async () => {
    mswServer.use(http.post(`${API_URL}/auth/logout`, () => HttpResponse.error()));
    const store = renderWithStore(<LogoutButton />, true);

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await vi.waitFor(() => {
      expect(store.getState().session.status).toBe(SessionStatus.ANONYMOUS);
    });
  });
});
