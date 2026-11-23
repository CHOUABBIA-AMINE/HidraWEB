import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  canGrant: true,
  grantResult: vi.fn(),
}));

vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({
    status: 'ready',
    routes: [{
      route: '/api/v1/identity/users/role-grants', methods: ['POST'],
      permission: 'identity:role-grants:create',
      module: 'identity', resource: 'role-grants', action: 'create', enforcementStatus: 'backend-enforced',
    }],
    can: (permission: string) => fixture.canGrant && permission === 'identity:role-grants:create',
  }),
}));
vi.mock('@/features/context/api/identityOrganizationApi', () => ({
  createIdentityRole: vi.fn(),
  createIdentityPermission: vi.fn(),
  grantIdentityRole: fixture.grantResult,
  grantPermissionToIdentityRole: vi.fn(),
  grantPermissionToIdentityUser: vi.fn(),
}));
import { IdentityAccessCommandPanel } from '@/features/context/components/IdentityAccessCommandPanel';

beforeEach(() => {
  fixture.canGrant = true;
  fixture.grantResult.mockReset().mockResolvedValue('grant-1');
});
afterEach(cleanup);

function mount() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const view = render(<QueryClientProvider client={client}><IdentityAccessCommandPanel /></QueryClientProvider>);
  return { client, ...view };
}

describe('UXR-21/B Identity mutation safety', () => {
  it('enforces exact user-role admission, required reason and rejects unqualified routes', () => {
    const { client, rerender } = mount();
    expect(screen.getByRole('button', { name: 'Create role' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Create permission' })).toBeDisabled();
    const grantButton = screen.getByRole('button', { name: 'Create grant' });
    expect(grantButton).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'User ID' }), { target: { value: 'user-1' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Role ID' }), { target: { value: 'role-1' } });
    expect(grantButton).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Reason' }), { target: { value: 'Signed access review' } });
    expect(grantButton).toBeEnabled();
    fixture.canGrant = false;
    rerender(<QueryClientProvider client={client}><IdentityAccessCommandPanel /></QueryClientProvider>);
    expect(screen.getByRole('button', { name: 'Create grant' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Create grant' }));
    expect(fixture.grantResult).not.toHaveBeenCalled();
  });

  it('treats an uncertain grant as review-required and never renders raw server error details', async () => {
    fixture.grantResult.mockRejectedValue(new Error('SENSITIVE TOKEN IN BACKEND ERROR'));
    mount();
    fireEvent.change(screen.getByRole('textbox', { name: 'User ID' }), { target: { value: 'user-1' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Role ID' }), { target: { value: 'role-1' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Reason' }), { target: { value: 'Approved request' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create grant' }));
    await waitFor(() => expect(fixture.grantResult).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/Grant outcome may have committed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create grant' })).toBeDisabled();
    expect(screen.queryByText(/SENSITIVE TOKEN/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create grant' }));
    expect(fixture.grantResult).toHaveBeenCalledTimes(1);
  });
});
