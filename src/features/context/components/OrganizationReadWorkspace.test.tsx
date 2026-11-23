import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  admitted: false,
  hierarchyRoute: false,
  historyRoute: false,
  company: '',
  hierarchy: vi.fn(),
  history: vi.fn(),
  units: vi.fn(),
  employees: vi.fn(),
  assignments: vi.fn(),
  unit: vi.fn(),
  employee: vi.fn(),
}));

vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({
    status: 'ready',
    routes: [
      ...(fixture.hierarchyRoute ? [{ route: '/api/v1/organization/hierarchy', methods: ['GET'], permission: 'organization:hierarchy:read' }] : []),
      ...(fixture.historyRoute ? [{ route: '/api/v1/organization/assignments/{id}/history', methods: ['GET'], permission: 'organization:assignments-history:read' }] : []),
    ],
    can: () => fixture.admitted,
  }),
}));

vi.mock('@/shell/model/useShellUiStore', () => ({
  useShellUiStore: (selector: (state: { operationalContext?: { companyPartyId: string } }) => unknown) =>
    selector({ operationalContext: fixture.company ? { companyPartyId: fixture.company } : undefined }),
}));

vi.mock('@/features/context/api/identityOrganizationApi', () => ({
  fetchOrganizationHierarchy: fixture.hierarchy,
  fetchOrganizationAssignmentHistory: fixture.history,
  fetchOrganizationUnits: fixture.units,
  fetchOrganizationEmployees: fixture.employees,
  fetchOrganizationAssignments: fixture.assignments,
  fetchOrganizationUnit: fixture.unit,
  fetchOrganizationEmployee: fixture.employee,
}));

import { OrganizationHierarchyPanel } from '@/features/context/components/OrganizationHierarchyPanel';
import { OrganizationAssignmentHistory } from '@/features/context/components/OrganizationAssignmentHistory';
import { OrganizationAccessWorkspace } from '@/features/context/components/OrganizationAccessWorkspace';

function withClient(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return <QueryClientProvider client={client}>{node}</QueryClientProvider>;
}

beforeEach(() => {
  fixture.admitted = false;
  fixture.hierarchyRoute = false;
  fixture.historyRoute = false;
  fixture.company = '';
  for (const mock of [fixture.hierarchy, fixture.history, fixture.units, fixture.employees,
    fixture.assignments, fixture.unit, fixture.employee]) mock.mockReset();
  fixture.hierarchy.mockResolvedValue([{
    unit: { id: 'unit-1', code: 'UNIT-A', nameFr: 'Direction', status: 'ACTIVE',
      validFrom: '2026-11-01T00:00:00Z' },
    children: [],
  }]);
  fixture.history.mockResolvedValue({ entries: [{
    eventId: 'event-1', kind: 'ASSIGNED', sampledAt: '2026-11-01T10:00:00Z',
    after: { id: 'assignment-1', status: 'ACTIVE' },
  }], hasNext: false });
  fixture.units.mockResolvedValue({ content: [{
    id: 'unit-1', code: 'UNIT-A', nameFr: 'Direction', status: 'ACTIVE',
    validFrom: '2026-11-01T00:00:00Z',
  }], hasNext: true, totalElements: 2, page: 0, size: 50 });
  fixture.employees.mockResolvedValue({ content: [], hasNext: false, totalElements: 0, page: 0 });
  fixture.assignments.mockResolvedValue({ content: [], hasNext: false, totalElements: 0, page: 0 });
  fixture.unit.mockResolvedValue({ id: 'unit-1', code: 'UNIT-A', nameFr: 'Private detail' });
  fixture.employee.mockResolvedValue({ id: 'employee-1', displayNameLt: 'Person' });
});
afterEach(cleanup);

describe('UXR-21/A organization read isolation', () => {
  it('does not discover or reveal hierarchy without exact published GET permission', async () => {
    const node = <OrganizationHierarchyPanel />;
    const view = render(withClient(node));
    expect(screen.getByText(/unavailable or not authorized/)).toBeInTheDocument();
    expect(fixture.hierarchy).not.toHaveBeenCalled();
    fixture.admitted = true;
    fixture.hierarchyRoute = true;
    view.rerender(withClient(node));
    await waitFor(() => expect(screen.getByText(/UNIT-A/)).toBeInTheDocument());
    expect(fixture.hierarchy).toHaveBeenCalled();
    expect(screen.getByText(/2026-11-01T00:00:00Z/)).toBeInTheDocument();
  });

  it('does not request private assignment history without company scope and loses data on scope removal', async () => {
    fixture.admitted = true;
    fixture.historyRoute = true;
    const node = <OrganizationAssignmentHistory assignmentId="assignment-1" />;
    const view = render(withClient(node));
    expect(screen.getByText(/Select a verified operational company/)).toBeInTheDocument();
    expect(fixture.history).not.toHaveBeenCalled();
    fixture.company = 'company-1';
    view.rerender(withClient(node));
    await waitFor(() => expect(screen.getByText(/ASSIGNED/)).toBeInTheDocument());
    expect(fixture.history).toHaveBeenCalledWith('assignment-1', 'company-1');
    fixture.company = '';
    view.rerender(withClient(node));
    expect(screen.queryByText(/ASSIGNED/)).not.toBeInTheDocument();
    expect(screen.getByText(/Select a verified operational company/)).toBeInTheDocument();
  });

  it('hides selected private unit detail when the owner resource changes', async () => {
    fixture.admitted = true;
    const view = render(withClient(<OrganizationAccessWorkspace resource="organization-units" />));
    await waitFor(() => expect(screen.getByText('UNIT-A')).toBeInTheDocument());
    expect(screen.getByText(/2 returned by HidraAPI/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    await waitFor(() => expect(screen.getByText('Private detail')).toBeInTheDocument());
    view.rerender(withClient(<OrganizationAccessWorkspace resource="employees" />));
    await waitFor(() => expect(screen.getByText('No records.')).toBeInTheDocument());
    expect(screen.queryByText('Private detail')).not.toBeInTheDocument();
    expect(fixture.employee).not.toHaveBeenCalled();
  });

  it('fails closed on denied unit read without exposing prior totals', async () => {
    fixture.admitted = true;
    const view = render(withClient(<OrganizationAccessWorkspace resource="organization-units" />));
    await waitFor(() => expect(screen.getByText(/2 returned by HidraAPI/)).toBeInTheDocument());
    fixture.admitted = false;
    view.rerender(withClient(<OrganizationAccessWorkspace resource="organization-units" />));
    expect(screen.getByText(/unavailable or not authorized for this resource/)).toBeInTheDocument();
    expect(screen.queryByText(/2 returned by HidraAPI/)).not.toBeInTheDocument();
  });
});
