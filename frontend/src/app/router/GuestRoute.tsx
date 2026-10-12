import { selectIsAuthenticated } from '@/entities/session/index.ts';
import { ROUTES } from '@/shared/config/index.ts';
import { readRedirectPath } from '@/shared/lib/helpers/redirect.helper.ts';
import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router';

export function GuestRoute(): ReactElement {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to={readRedirectPath(location.state) ?? ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
