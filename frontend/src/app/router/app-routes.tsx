import { GuestRoute } from '@/app/router/GuestRoute.tsx';
import { ProtectedRoute } from '@/app/router/ProtectedRoute.tsx';
import { LoginPage } from '@/pages/login/index.ts';
import { RegisterPage } from '@/pages/register/index.ts';
import { SquadBuilderPage } from '@/pages/squad-builder/index.ts';
import { ROUTES } from '@/shared/config/index.ts';
import { Navigate, type RouteObject } from 'react-router';

export const APP_ROUTES: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [{ path: ROUTES.HOME, element: <SquadBuilderPage /> }],
  },
  {
    element: <GuestRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.HOME} replace /> },
];
