import { Navigate, createBrowserRouter } from 'react-router';

import { RequireAuthentication } from '@/app/auth/RequireAuthentication';
import { LoginPage } from '@/app/pages/LoginPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { OverviewPage } from '@/app/pages/OverviewPage';
import { AlarmConsolePage } from '@/features/alarm/AlarmConsolePage';
import { AnalyticsWorkspacePage } from '@/features/analytics';
import { AuditWorkspacePage } from '@/features/audit';
import { ConfigurationAdministrationPage } from '@/features/configuration';
import { IdentityAdministrationPage } from '@/features/context/IdentityAdministrationPage';
import { OrganizationAdministrationPage } from '@/features/context/OrganizationAdministrationPage';
import { CustodyWorkspacePage } from '@/features/custody';
import { DocumentsAdministrationPage } from '@/features/documents';
import { IncidentWorkspacePage } from '@/features/incident/IncidentWorkspacePage';
import { IntegrationMonitoringPage } from '@/features/integration';
import { NotificationCenterPage } from '@/features/notification';
import { PermissionBootstrapBoundary } from '@/features/permissions/PermissionBootstrapBoundary';
import { PlanningWorkspacePage } from '@/features/planning/PlanningWorkspacePage';
import { ReportingWorkspacePage } from '@/features/reporting';
import { RiskWorkspacePage } from '@/features/risk';
import { SimulationWorkspacePage } from '@/features/simulation';
import { TelemetryMonitoringPage } from '@/features/telemetry-monitoring/TelemetryMonitoringPage';
import { NetworkTopologyPage } from '@/features/topology/NetworkTopologyPage';
import { OperationalWorkbenchPage } from '@/features/workbench/OperationalWorkbenchPage';
import { WorkflowTasksPage } from '@/features/workflow/WorkflowTasksPage';
import { EngineeringAssetsProcessPage, EngineeringIntegrityProcessPage } from '@/processes/engineering';
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
      { path: 'network', element: <NetworkTopologyPage /> },
      { path: 'operations', element: <TelemetryMonitoringPage /> },
      { path: 'alarms', element: <AlarmConsolePage /> },
      { path: 'events', element: <IncidentWorkspacePage /> },
      { path: 'planning', element: <PlanningWorkspacePage /> },
      { path: 'engineering', element: <EngineeringIntegrityProcessPage /> },
      { path: 'engineering/assets', element: <EngineeringAssetsProcessPage /> },
      { path: 'custody', element: <CustodyWorkspacePage /> },
      { path: 'intelligence/risk', element: <RiskWorkspacePage /> },
      { path: 'intelligence/analytics', element: <AnalyticsWorkspacePage /> },
      { path: 'intelligence/simulation', element: <SimulationWorkspacePage /> },
      { path: 'intelligence/reports', element: <ReportingWorkspacePage /> },
      { path: 'work/tasks', element: <WorkflowTasksPage /> },
      { path: 'work/notifications', element: <NotificationCenterPage /> },
      { path: 'workbench', element: <OperationalWorkbenchPage /> },
      { path: 'administration/organization', element: <OrganizationAdministrationPage /> },
      { path: 'administration/users', element: <IdentityAdministrationPage /> },
      { path: 'administration/configuration', element: <ConfigurationAdministrationPage /> },
      { path: 'administration/audit', element: <AuditWorkspacePage /> },
      { path: 'administration/documents', element: <DocumentsAdministrationPage /> },
      { path: 'administration/integrations', element: <IntegrationMonitoringPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
