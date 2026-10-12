import { AppThemeProvider } from '@/app/providers/AppThemeProvider.tsx';
import { APP_ROUTES } from '@/app/router/app-routes.tsx';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

function renderAt(path: string): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(APP_ROUTES, { initialEntries: [path] });

  render(
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>,
  );

  return router;
}

describe('app routes', () => {
  it('shows the login page on /login', () => {
    renderAt('/login');

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows the register page on /register', () => {
    renderAt('/register');

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
  });

  it('navigates from login to register through the link', async () => {
    renderAt('/login');

    await userEvent.click(screen.getByRole('link', { name: 'Create an account' }));

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
  });

  it('redirects an unknown path to the home page', () => {
    const router = renderAt('/no-such-page');

    expect(router.state.location.pathname).toBe('/');
    expect(
      screen.getByRole('heading', { name: 'Select your squad to defend earthrealm' }),
    ).toBeInTheDocument();
  });
});
