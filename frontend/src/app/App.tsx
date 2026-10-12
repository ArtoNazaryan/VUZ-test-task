import { AppThemeProvider } from '@/app/providers/AppThemeProvider.tsx';
import { SessionBootstrap } from '@/app/providers/SessionBootstrap.tsx';
import { router } from '@/app/router/router.ts';
import { appStore } from '@/app/store/store.ts';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router';

export function App(): ReactElement {
  return (
    <Provider store={appStore}>
      <AppThemeProvider>
        <SessionBootstrap>
          <RouterProvider router={router} />
        </SessionBootstrap>
      </AppThemeProvider>
    </Provider>
  );
}
