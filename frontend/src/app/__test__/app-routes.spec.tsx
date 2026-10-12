import { renderRoutes } from '@/app/__test__/helpers/render-routes.tsx';
import { API_URL } from '@/shared/config/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { mswServer } from '@/shared/lib/test/msw-server.ts';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

const HOME_HEADING = 'Select your squad to defend earthrealm';

describe('app routes', () => {
  describe('when the session is still being restored', () => {
    it('shows a loading indicator instead of the protected page', () => {
      renderRoutes('/', 'unknown');

      expect(
        screen.getByRole('progressbar', { name: 'Restoring your session' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: HOME_HEADING })).not.toBeInTheDocument();
    });
  });

  describe('when nobody is logged in', () => {
    it('redirects the home page to the login page', () => {
      const router = renderRoutes('/', 'anonymous');

      expect(router.state.location.pathname).toBe('/login');
      expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    });

    it('shows the register page', () => {
      renderRoutes('/register', 'anonymous');

      expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    });

    it('returns to the page that was asked for after logging in', async () => {
      mswServer.use(http.post(`${API_URL}/auth/login`, () => HttpResponse.json(makeAuthSession())));
      const router = renderRoutes('/', 'anonymous');

      await userEvent.type(screen.getByLabelText('Email'), 'ryu@example.com');
      await userEvent.type(screen.getByLabelText('Password'), 'hadouken-2026');
      await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

      expect(await screen.findByRole('heading', { name: HOME_HEADING })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/');
    });

    it('navigates from login to register through the link', async () => {
      renderRoutes('/login', 'anonymous');

      await userEvent.click(screen.getByRole('link', { name: 'Create one' }));

      expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    });
  });

  describe('when the user is logged in', () => {
    it('shows the squad builder', () => {
      renderRoutes('/', 'authenticated');

      expect(screen.getByRole('heading', { name: HOME_HEADING })).toBeInTheDocument();
    });

    it('sends the login page back to the home page', () => {
      const router = renderRoutes('/login', 'authenticated');

      expect(router.state.location.pathname).toBe('/');
    });

    it('redirects an unknown path to the home page', () => {
      const router = renderRoutes('/no-such-page', 'authenticated');

      expect(router.state.location.pathname).toBe('/');
    });
  });
});
