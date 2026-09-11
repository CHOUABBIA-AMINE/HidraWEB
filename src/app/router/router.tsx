import { Navigate, createBrowserRouter } from 'react-router';

import { RequireAuthentication } from '@/app/auth/RequireAuthentication';
import { LoginPage } from '@/app/pages/LoginPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { OverviewPage } from '@/app/pages/OverviewPage';
import { IdentityAdministrationPage } from '@/features/context/IdentityAdministrationPage';
import { OrganizationAdministrationPage } from '@/features/context/OrganizationAdministrationPage';
import { PermissionBootstrapBoundary } from '@/features/permissions/PermissionBootstrapBoundary';
import { OperationalWorkbenchPage } from '@/features/workbench/OperationalWorkbenchPage';
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
      { path: 'workbench', element: <OperationalWorkbenchPage /> },
      { path: 'administration/organization', element: <OrganizationAdministrationPage /> },
      { path: 'administration/users', element: <IdentityAdministrationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
