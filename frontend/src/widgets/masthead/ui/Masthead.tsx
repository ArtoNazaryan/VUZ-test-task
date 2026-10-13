import { selectCurrentUser } from '@/entities/session/index.ts';
import { LogoutButton } from '@/features/logout/index.ts';
import logoUrl from '@/shared/assets/images/mortal-kombat-logo.webp';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';

const BAR_HEIGHT = 64;
const LOGO_SIZE = 88;
const LOGO_TOP = 8;
const LOGO_OVERFLOW = LOGO_TOP + LOGO_SIZE - BAR_HEIGHT;

export function Masthead(): ReactElement {
  const user = useSelector(selectCurrentUser);

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        height: BAR_HEIGHT,
        bgcolor: 'common.black',
        color: 'common.white',
        mb: `${String(LOGO_OVERFLOW)}px`,
      }}
    >
      <Box
        component="img"
        src={logoUrl}
        alt="Mortal Kombat"
        sx={{
          position: 'absolute',
          left: '50%',
          top: LOGO_TOP,
          transform: 'translateX(-50%)',
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          borderRadius: '50%',
          objectFit: 'cover',
          bgcolor: 'common.black',
        }}
      />
      {user && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: 'absolute',
            right: { xs: 12, sm: 24 },
            top: 0,
            height: BAR_HEIGHT,
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.85 }}>
            {user.email}
          </Typography>
          <LogoutButton />
        </Stack>
      )}
    </Box>
  );
}
