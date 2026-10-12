import { RegisterForm } from '@/features/register-form/index.ts';
import { ROUTES } from '@/shared/config/index.ts';
import { FormCard } from '@/shared/ui/index.ts';
import { Link, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

export function RegisterPage(): ReactElement {
  const redirectState: unknown = useLocation().state;

  return (
    <FormCard title="Create an account" subtitle="Pick up to 6 champions for your squad">
      <RegisterForm />
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link component={RouterLink} to={ROUTES.LOGIN} state={redirectState}>
          Log in
        </Link>
      </Typography>
    </FormCard>
  );
}
