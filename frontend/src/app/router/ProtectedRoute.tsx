import { selectSessionStatus, SessionStatus } from '@/entities/session/index.ts';
import { ROUTES } from '@/shared/config/index.ts';
import { Box, CircularProgress } from '@mui/material';
import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';

export function ProtectedRoute(): ReactElement {
  const status = useSelector(selectSessionStatus);
  const location = useLocation();

  if (status === SessionStatus.UNKNOWN) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress aria-label="Restoring your session" />
      </Box>
    );
  }

  if (status === SessionStatus.ANONYMOUS) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
