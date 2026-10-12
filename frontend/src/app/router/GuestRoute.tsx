import { selectIsAuthenticated } from '@/entities/session/index.ts';
import { ROUTES } from '@/shared/config/index.ts';
import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';

export function GuestRoute(): ReactElement {
  return useSelector(selectIsAuthenticated) ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;
}
