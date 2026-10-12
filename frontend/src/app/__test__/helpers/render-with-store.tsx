import { AppThemeProvider } from '@/app/providers/AppThemeProvider.tsx';
import { createAppStore } from '@/app/store/store.ts';
import type { TAppStore } from '@/app/store/store.types.ts';
import { sessionEnded, sessionStarted } from '@/entities/session/index.ts';
import { makeAuthSession } from '@/shared/lib/test/auth-fixtures.ts';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';

export function renderWithStore(ui: ReactElement, isAuthenticated = false): TAppStore {
  const store = createAppStore();

  store.dispatch(isAuthenticated ? sessionStarted(makeAuthSession()) : sessionEnded());
  render(
    <Provider store={store}>
      <AppThemeProvider>{ui}</AppThemeProvider>
    </Provider>,
  );

  return store;
}
