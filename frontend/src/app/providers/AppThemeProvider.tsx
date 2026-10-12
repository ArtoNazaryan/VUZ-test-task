import { appTheme } from '@/app/styles/theme.ts';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PropsWithChildren, ReactElement } from 'react';

export function AppThemeProvider({ children }: PropsWithChildren): ReactElement {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
