import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  admitted: false,
  company: '',
  users: vi.fn(),
  roles: vi.fn(),
  permissions: vi.fn(),
  user: vi.fn(),
}));

vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({
    status: 'ready',
    can: () => fixture.admitted,
  }),
}));
vi.mock('@/shell/model/useShellUiStore', () => ({
  useShellUiStore: (select: (state: { operationalContext?: { companyPartyId: string } }) => unknown) =>
    select({ operationalContext: fixture.company ? { companyPartyId: fixture.company } : undefined }),
}));
vi.mock('@/features/context/api/identityOrganizationApi', () => ({
  fetchIdentityUsers: fixture.users,
  fetchIdentityRoles: fixture.roles,
  fetchIdentityPermissions: fixture.permissions,
  fetchIdentityUser: fixture.user,
}));

import { IdentityAccessWorkspace } from '@/features/context/components/IdentityAccessWorkspace';

beforeEach(() => {
  fixture.admitted = false;
  fixture.company = '';
  for (const mock of [fixture.users, fixture.roles, fixture.permissions, fixture.user]) mock.mockReset();
  fixture.users.mockImplementation(async (_q: string, page: number) => ({
    page, size: 50, totalElements: 51, hasNext: page === 0,
    content: page === 0 ? [{
      id: 'user-1', username: 'operator-1', displayName: 'Authorized user',
      employeeReferenceId: 'emp-neutral-1', status: 'ACTIVE',
    }] : [{ id: 'user-2', username: 'operator-2', displayName: 'Page two', status: 'ACTIVE' }],
  }));
  fixture.roles.mockResolvedValue({
    content: [{ id: 'role-1', code: 'OPERATIONS', nameFr: 'Operator role', status: 'ACTIVE' }],
    page: 0, size: 50, totalElements: 1, hasNext: false,
  });
  fixture.permissions.mockResolvedValue({
    content: [{ id: 'permission-1', code: 'topology:map:read', status: 'ACTIVE' }],
    page: 0, size: 50, totalElements: 1, hasNext: false,
  });
  fixture.user.mockResolvedValue({
    id: 'user-1', username: 'operator-1', displayName: 'Authorized user',
    employeeReferenceId: 'emp-neutral-1', status: 'ACTIVE',
  });
});
afterEach(cleanup);

function mount(resource: 'users' | 'roles' | 'permissions') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrap = (kind: 'users' | 'roles' | 'permissions') =>
    <QueryClientProvider client={client}><IdentityAccessWorkspace resource={kind} /></QueryClientProvider>;
  const view = render(wrap(resource));
  return { client, view, wrap };
}

describe('UXR-21/B identity register admission', () => {
  it('denies list and detail before effective permission and conceals previously visible totals on withdrawal', async () => {
    const { view, wrap } = mount('users');
    expect(screen.getByText(/unavailable or not authorized/)).toBeInTheDocument();
    expect(fixture.users).not.toHaveBeenCalled();
    fixture.admitted = true;
    view.rerender(wrap('users'));
    await waitFor(() => expect(screen.getByText('operator-1')).toBeInTheDocument());
    expect(screen.getByText(/51 returned by HidraAPI/)).toBeInTheDocument();
    fixture.admitted = false;
    view.rerender(wrap('users'));
    expect(screen.queryByText('operator-1')).not.toBeInTheDocument();
    expect(screen.queryByText(/51 returned by HidraAPI/)).not.toBeInTheDocument();
    expect(screen.getByText(/unavailable or not authorized/)).toBeInTheDocument();
  });

  it('clears selected user detail on owner resource change and never queries a role as a user', async () => {
    fixture.admitted = true;
    const { view, wrap } = mount('users');
    await waitFor(() => expect(screen.getByText('operator-1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    await waitFor(() => expect(screen.getByText(/emp-neutral-1/)).toBeInTheDocument());
    view.rerender(wrap('roles'));
    await waitFor(() => expect(screen.getByText('OPERATIONS')).toBeInTheDocument());
    expect(screen.queryByText(/emp-neutral-1/)).not.toBeInTheDocument();
    expect(fixture.user).toHaveBeenCalledTimes(1);
  });

  it('uses server paging and does not retain selection when the page changes', async () => {
    fixture.admitted = true;
    const { view } = mount('users');
    await waitFor(() => expect(screen.getByText('operator-1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    await waitFor(() => expect(screen.getByText(/emp-neutral-1/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('operator-2')).toBeInTheDocument());
    expect(screen.queryByText(/emp-neutral-1/)).not.toBeInTheDocument();
    expect(screen.getByText(/Page 2/)).toBeInTheDocument();
    expect(fixture.users).toHaveBeenCalledWith('', 1, 50);
    view.unmount();
  });

  it('conceals cached rows, user detail and totals on backend revalidation denial', async () => {
    fixture.admitted = true;
    const { client } = mount('users');
    await waitFor(() => expect(screen.getByText('operator-1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Inspect' }));
    await waitFor(() => expect(screen.getByText(/emp-neutral-1/)).toBeInTheDocument());
    fixture.users.mockRejectedValueOnce(new Error('SECRET OWNER DENIAL'));
    await client.refetchQueries({ queryKey: ['hidra', 'identity-admin', 'uxr21', 'list'] });
    await waitFor(() => expect(screen.getByText(/Unable to load authorized identity records/)).toBeInTheDocument());
    expect(screen.queryByText('operator-1')).not.toBeInTheDocument();
    expect(screen.queryByText(/emp-neutral-1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/51 returned by HidraAPI/)).not.toBeInTheDocument();
    expect(screen.queryByText('SECRET OWNER DENIAL')).not.toBeInTheDocument();
  });
});
