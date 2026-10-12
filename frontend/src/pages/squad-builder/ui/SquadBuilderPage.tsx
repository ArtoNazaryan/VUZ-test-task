import { Container, Typography } from '@mui/material';
import type { ReactElement } from 'react';

export function SquadBuilderPage(): ReactElement {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h1" align="center">
        Select your squad to defend earthrealm
      </Typography>
    </Container>
  );
}
