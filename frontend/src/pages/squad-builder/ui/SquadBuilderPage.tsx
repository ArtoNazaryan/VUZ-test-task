import { CharacterTable } from '@/widgets/character-table/index.ts';
import { Container, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';

const NO_FILTERS = {};

export function SquadBuilderPage(): ReactElement {
  return (
    <Container maxWidth="lg" sx={{ pb: 6 }}>
      <Stack spacing={4}>
        <Typography variant="h1" align="center">
          Select your squad to defend earthrealm
        </Typography>
        <CharacterTable filters={NO_FILTERS} />
      </Stack>
    </Container>
  );
}
