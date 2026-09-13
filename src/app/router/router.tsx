import { Navigate, createBrowserRouter } from 'react-router';

import { RequireAuthentication } from '@/app/auth/RequireAuthentication';
import { PermissionBootstrapBoundary } from '@/features/permissions/PermissionBootstrapBoundary';
import { AppShell } from '@/shell/AppShell';

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: async () => ({ Component: (await import('@/app/pages/LoginPage')).LoginPage }),
  },
  {
    path: '/auth/callback',
    lazy: async () => ({ Component: (await import('@/app/pages/OidcCallbackPage')).OidcCallbackPage }),
  },
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
      {
        path: 'overview',
        lazy: async () => ({ Component: (await import('@/app/pages/OverviewPage')).OverviewPage }),
      },
      {
        path: 'network',
        lazy: async () => ({ Component: (await import('@/features/topology/NetworkTopologyPage')).NetworkTopologyPage }),
      },
      {
        path: 'operations',
        lazy: async () => ({
          Component: (await import('@/features/telemetry-monitoring/TelemetryMonitoringPage')).TelemetryMonitoringPage,
        }),
      },
      {
        path: 'alarms',
        lazy: async () => ({ Component: (await import('@/features/alarm/AlarmConsolePage')).AlarmConsolePage }),
      },
      {
        path: 'events',
        lazy: async () => ({ Component: (await import('@/features/incident/IncidentWorkspacePage')).IncidentWorkspacePage }),
      },
      {
        path: 'planning',
        lazy: async () => ({ Component: (await import('@/features/planning/PlanningWorkspacePage')).PlanningWorkspacePage }),
      },
      {
        path: 'engineering',
        lazy: async () => ({ Component: (await import('@/processes/engineering')).EngineeringIntegrityProcessPage }),
      },
      {
        path: 'engineering/assets',
        lazy: async () => ({ Component: (await import('@/processes/engineering')).EngineeringAssetsProcessPage }),
      },
      {
        path: 'custody',
        lazy: async () => ({ Component: (await import('@/features/custody')).CustodyWorkspacePage }),
      },
      {
        path: 'intelligence/risk',
        lazy: async () => ({ Component: (await import('@/features/risk')).RiskWorkspacePage }),
      },
      {
        path: 'intelligence/analytics',
        lazy: async () => ({ Component: (await import('@/features/analytics')).AnalyticsWorkspacePage }),
      },
      {
        path: 'intelligence/simulation',
        lazy: async () => ({ Component: (await import('@/features/simulation')).SimulationWorkspacePage }),
      },
      {
        path: 'intelligence/reports',
        lazy: async () => ({ Component: (await import('@/features/reporting')).ReportingWorkspacePage }),
      },
      {
        path: 'work/tasks',
        lazy: async () => ({ Component: (await import('@/features/workflow/WorkflowTasksPage')).WorkflowTasksPage }),
      },
      {
        path: 'work/notifications',
        lazy: async () => ({ Component: (await import('@/features/notification')).NotificationCenterPage }),
      },
      {
        path: 'workbench',
        lazy: async () => ({ Component: (await import('@/features/workbench/OperationalWorkbenchPage')).OperationalWorkbenchPage }),
      },
      {
        path: 'administration/organization',
        lazy: async () => ({
          Component: (await import('@/features/context/OrganizationAdministrationPage')).OrganizationAdministrationPage,
        }),
      },
      {
        path: 'administration/users',
        lazy: async () => ({ Component: (await import('@/features/context/IdentityAdministrationPage')).IdentityAdministrationPage }),
      },
      {
        path: 'administration/configuration',
        lazy: async () => ({ Component: (await import('@/features/configuration')).ConfigurationAdministrationPage }),
      },
      {
        path: 'administration/audit',
        lazy: async () => ({ Component: (await import('@/features/audit')).AuditWorkspacePage }),
      },
      {
        path: 'administration/documents',
        lazy: async () => ({ Component: (await import('@/features/documents')).DocumentsAdministrationPage }),
      },
      {
        path: 'administration/integrations',
        lazy: async () => ({ Component: (await import('@/features/integration')).IntegrationMonitoringPage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/app/pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
]);
