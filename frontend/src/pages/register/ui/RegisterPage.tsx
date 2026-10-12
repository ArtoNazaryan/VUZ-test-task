import { ROUTES } from '@/shared/config/index.ts';
import { Container, Link, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router';

export function RegisterPage(): ReactElement {
  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h1">Create an account</Typography>
        <Link component={RouterLink} to={ROUTES.LOGIN}>
          I already have an account
        </Link>
      </Stack>
    </Container>
  );
}
