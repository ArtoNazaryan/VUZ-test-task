import { ROUTES } from '@/shared/config/index.ts';
import { Container, Link, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router';

export function LoginPage(): ReactElement {
  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h1">Log in</Typography>
        <Link component={RouterLink} to={ROUTES.REGISTER}>
          Create an account
        </Link>
      </Stack>
    </Container>
  );
}
