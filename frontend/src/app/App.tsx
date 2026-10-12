import { AppThemeProvider } from '@/app/providers/AppThemeProvider.tsx';
import { router } from '@/app/router/router.ts';
import type { ReactElement } from 'react';
import { RouterProvider } from 'react-router';

export function App(): ReactElement {
  return (
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  );
}
