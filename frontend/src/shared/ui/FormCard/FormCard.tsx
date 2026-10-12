import { Container, Paper, Stack, Typography } from '@mui/material';
import type { PropsWithChildren, ReactElement } from 'react';

interface IFormCardProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
}

export function FormCard({ title, subtitle, children }: IFormCardProps): ReactElement {
  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, sm: 8 } }}>
      <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: 1, borderColor: 'divider' }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h1">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Stack>
        {children}
      </Paper>
    </Container>
  );
}
