import { Navigate, createBrowserRouter } from 'react-router';

import { RequireAuthentication } from '@/app/auth/RequireAuthentication';
import { LoginPage } from '@/app/pages/LoginPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { OverviewPage } from '@/app/pages/OverviewPage';
import { PermissionBootstrapBoundary } from '@/features/permissions/PermissionBootstrapBoundary';
import { AppShell } from '@/shell/AppShell';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <RequireAuthentication>
        <PermissionBootstrapBoundary>
          <AppShell />
        </PermissionBootstrapBoundary>
      </RequireAuthentication>
    ),
    children: [
      { index: true, element: <Navigate replace to="/overview" /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
