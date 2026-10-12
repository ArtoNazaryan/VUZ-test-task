import { LoginForm } from '@/features/login-form/index.ts';
import { ROUTES } from '@/shared/config/index.ts';
import { FormCard } from '@/shared/ui/index.ts';
import { Link, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

export function LoginPage(): ReactElement {
  const redirectState: unknown = useLocation().state;

  return (
    <FormCard title="Log in" subtitle="Build your squad of champions">
      <LoginForm />
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        No account yet?{' '}
        <Link component={RouterLink} to={ROUTES.REGISTER} state={redirectState}>
          Create one
        </Link>
      </Typography>
    </FormCard>
  );
}
