import { AppThemeProvider } from '@/app/providers/AppThemeProvider.tsx';
import { createAppStore } from '@/app/store/store.ts';
import type { TAppStore } from '@/app/store/store.types.ts';
import { sessionEnded } from '@/entities/session/index.ts';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';

export function renderWithStore(ui: ReactElement): TAppStore {
  const store = createAppStore();

  store.dispatch(sessionEnded());
  render(
    <Provider store={store}>
      <AppThemeProvider>{ui}</AppThemeProvider>
    </Provider>,
  );

  return store;
}
