import { AppThemeProvider } from '@/app/providers/AppThemeProvider.tsx';
import { APP_ROUTES } from '@/app/router/app-routes.tsx';
import { createAppStore } from '@/app/store/store.ts';
import { sessionEnded, sessionStarted } from '@/entities/session/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router';

export type TTestSession = 'unknown' | 'anonymous' | 'authenticated';

export function renderRoutes(
  path: string,
  session: TTestSession,
): ReturnType<typeof createMemoryRouter> {
  const store = createAppStore();
  const router = createMemoryRouter(APP_ROUTES, { initialEntries: [path] });

  if (session === 'authenticated') {
    store.dispatch(sessionStarted(makeAuthSession()));
  }

  if (session === 'anonymous') {
    store.dispatch(sessionEnded());
  }

  render(
    <Provider store={store}>
      <AppThemeProvider>
        <RouterProvider router={router} />
      </AppThemeProvider>
    </Provider>,
  );

  return router;
}
