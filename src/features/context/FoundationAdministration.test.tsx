import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const fixtures = vi.hoisted(() => ({ admin: true, http: vi.fn() }));
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: fixtures.http }));
vi.mock('@/features/permissions/usePermissions', () => ({ usePermissions: () => ({ can: () => fixtures.admin }) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }));
import { FoundationIdentityPanel } from '@/features/context/components/FoundationIdentityPanel';
import { FoundationEmployeePanel } from '@/features/context/components/FoundationEmployeePanel';
import { PartySelector } from '@/features/party/components/PartySelector';
import { PartyAdministrationPage } from '@/features/party/PartyAdministrationPage';
import { revokeIdentityGrant } from '@/features/context/api/identityOrganizationApi';
import { transitionParty, assignPartyRole } from '@/features/party/api/partyApi';
function mount(component: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={client}>{component}</QueryClientProvider>);
  return client;
}
async function select(label: string, option: string) {
  const field = await screen.findByRole('combobox', { name: label });
  await waitFor(() => expect(field).not.toHaveAttribute('aria-disabled', 'true'));
  fireEvent.mouseDown(field);
  fireEvent.click(await screen.findByRole('option', { name: option }));
}
beforeEach(() => {
  fixtures.admin = true; fixtures.http.mockReset();
  fixtures.http.mockImplementation(async ({ url }: { url: string }) => {
    if (url.endsWith('/operation-capabilities')) return ['MANAGE_USERS', 'MANAGE_GRANTS'];
    if (url.endsWith('/users')) return { content: [{ id: 'user/1', displayName: 'Synthetic user', status: 'REGISTERED' }] };
    if (url.endsWith('/employees')) return { content: [{ id: 'employee/1', displayNameLt: 'Synthetic employee', status: 'REGISTERED' }] };
    if (url.endsWith('/local-credential/state')) return { userId: 'user/1', securityVersion: 3, changedAt: '2026-11-05T00:00:00Z' };
    if (url.endsWith('/lifecycle-history')) return [];
    if (url.endsWith('/lifecycle')) return { id: 'user/1', status: 'REGISTERED', updatedAt: '2026-11-05T01:00:00Z' };
    if (url.endsWith('/parties')) return { items: [{ id: 'active', code: 'A', legalName: 'Eligible', status: 'ACTIVE' }, { id: 'draft', code: 'D', legalName: 'Draft', status: 'DRAFT' }], total: 2 };
    return [];
  });
});
afterEach(cleanup);
describe('foundation current-owner administration', () => {
  it('does not query or disclose native administration to a non-administrator', () => {
    fixtures.admin = false;
    mount(<><FoundationIdentityPanel /><FoundationEmployeePanel /><PartySelector value="" onChange={() => {}} /><PartyAdministrationPage /></>);
    expect(screen.getAllByText('context.foundation.adminOnly')).toHaveLength(4);
    expect(fixtures.http).not.toHaveBeenCalled();
  });
  it('waits for backend operation capabilities before querying users', async () => {
    fixtures.http.mockResolvedValue([]);
    mount(<FoundationIdentityPanel />);
    await waitFor(() => expect(fixtures.http).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(fixtures.http.mock.calls.every(([c]) => c.url.endsWith('/operation-capabilities'))).toBe(true);
  });
  it('uses the current credential generation and clears secrets without query or mutation caching', async () => {
    const client = mount(<FoundationIdentityPanel />);
    await select('context.foundation.user', 'Synthetic user · REGISTERED');
    fireEvent.change(await screen.findByLabelText(/context.foundation.reason/), { target: { value: 'Synthetic initial credential' } });
    fireEvent.change(screen.getByLabelText('context.foundation.password'), { target: { value: 'synthetic-only-password' } });
    const submit = screen.getByRole('button', { name: 'context.foundation.setCredential' });
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);
    await waitFor(() => expect(fixtures.http).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: '/api/v1/identity/users/user%2F1/local-credential', data: { password: 'synthetic-only-password', expectedSecurityVersion: 3, reason: 'Synthetic initial credential' } })));
    expect(screen.getByLabelText('context.foundation.password')).toHaveValue('');
    expect(JSON.stringify(client.getQueryCache().getAll().map(q => q.state))).not.toContain('synthetic-only-password');
    expect(client.getMutationCache().getAll()).toHaveLength(0);
  });
  it('rejects short credentials and submits the server user version for activation', async () => {
    mount(<FoundationIdentityPanel />);
    await select('context.foundation.user', 'Synthetic user · REGISTERED');
    fireEvent.change(await screen.findByLabelText(/context.foundation.reason/), { target: { value: 'Activate synthetic account' } });
    fireEvent.change(screen.getByLabelText('context.foundation.password'), { target: { value: 'short' } });
    expect(screen.getByRole('button', { name: 'context.foundation.setCredential' })).toBeDisabled();
    const activate = screen.getByRole('button', { name: 'context.foundation.activate' });
    await waitFor(() => expect(activate).toBeEnabled()); fireEvent.click(activate);
    await waitFor(() => expect(fixtures.http).toHaveBeenCalledWith({ method: 'POST', url: '/api/v1/identity/users/user%2F1/activate', data: { expectedUpdatedAt: '2026-11-05T01:00:00Z', reason: 'Activate synthetic account' } }));
  });
  it('does not replay a rejected mutation or show a password-bearing error', async () => {
    const original = fixtures.http.getMockImplementation()!;
    fixtures.http.mockImplementation((c: { method: string; url: string }) => c.method === 'PUT' ? Promise.reject(new Error('synthetic-secret-password')) : original(c));
    mount(<FoundationIdentityPanel />);
    await select('context.foundation.user', 'Synthetic user · REGISTERED');
    fireEvent.change(await screen.findByLabelText(/context.foundation.reason/), { target: { value: 'Reset' } });
    fireEvent.change(screen.getByLabelText('context.foundation.password'), { target: { value: 'synthetic-secret-password' } });
    const submit = screen.getByRole('button', { name: 'context.foundation.setCredential' });
    await waitFor(() => expect(submit).toBeEnabled()); fireEvent.click(submit);
    await screen.findByText('context.foundation.rejected');
    expect(screen.queryByText('synthetic-secret-password')).not.toBeInTheDocument();
    expect(screen.getByLabelText('context.foundation.password')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'context.foundation.activate' })).toBeDisabled();
    expect(fixtures.http.mock.calls.filter(([c]) => c.method === 'PUT')).toHaveLength(1);
  });
  it('activates a selected employee with its retrieved concurrency token and required reason', async () => {
    mount(<FoundationEmployeePanel />);
    await select('context.foundation.employee', 'Synthetic employee · REGISTERED');
    const activate = await screen.findByRole('button', { name: 'context.foundation.activate' });
    expect(activate).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/context.foundation.reason/), { target: { value: 'Synthetic employment activation' } });
    await waitFor(() => expect(activate).toBeEnabled()); fireEvent.click(activate);
    await waitFor(() => expect(fixtures.http).toHaveBeenCalledWith({ method: 'POST', url: '/api/v1/organization/employees/employee%2F1/activate', data: { expectedUpdatedAt: '2026-11-05T01:00:00Z', reason: 'Synthetic employment activation' } }));
  });
  it('requests backend eligibility and never offers a draft as a new Party reference', async () => {
    const changed = vi.fn(); mount(<PartySelector value="" onChange={changed} roleId="company-role" />);
    await select('context.foundation.eligibleParty', 'A · Eligible');
    expect(changed).toHaveBeenCalledWith('active');
    expect(fixtures.http).toHaveBeenCalledWith(expect.objectContaining({ params: expect.objectContaining({ roleId: 'company-role', eligibleOnly: true }) }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'context.foundation.eligibleParty' }));
    expect(screen.queryByRole('option', { name: /Draft/ })).not.toBeInTheDocument();
  });
  it('requires explicit refresh after a Party conflict and then uses the refreshed version', async () => {
    let version = '2026-11-05T01:00:00Z';
    let deny = true;
    const original = fixtures.http.getMockImplementation()!;
    fixtures.http.mockImplementation(async (c: { method: string; url: string }) => {
      if (c.url === '/api/v1/party/parties/draft') return { id: 'draft', code: 'D', legalName: 'Draft', status: 'DRAFT', updatedAt: version };
      if (c.url === '/api/v1/party/parties/draft/activate') {
        if (deny) throw new Error('Synthetic stale version conflict');
        return { id: 'draft', status: 'ACTIVE' };
      }
      return original(c);
    });
    mount(<PartyAdministrationPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'D · Draft · DRAFT' }));
    fireEvent.change(await screen.findByLabelText(/context.foundation.reason/), { target: { value: 'Synthetic admission' } });
    const activate = screen.getByRole('button', { name: 'context.foundation.activate' });
    await waitFor(() => expect(activate).toBeEnabled()); fireEvent.click(activate);
    await screen.findByText('context.foundation.rejected');
    expect(activate).toBeDisabled();
    expect(fixtures.http.mock.calls.filter(([c]) => c.url.endsWith('/draft/activate'))).toHaveLength(1);
    version = '2026-11-05T02:00:00Z'; deny = false;
    fireEvent.click(screen.getByRole('button', { name: 'context.foundation.refresh' }));
    await waitFor(() => expect(activate).toBeEnabled()); fireEvent.click(activate);
    await waitFor(() => expect(fixtures.http).toHaveBeenCalledWith({ method: 'POST', url: '/api/v1/party/parties/draft/activate', data: { expectedUpdatedAt: version, reason: 'Synthetic admission' } }));
  });
  it('maps all ordinary revocation kinds and Party writes to generated owner routes', async () => {
    for (const kind of ['user-role', 'user-permission', 'role-permission'] as const) await revokeIdentityGrant(kind, 'grant/1', { reason: 'Synthetic revoke' });
    expect(fixtures.http.mock.calls.slice(0, 3).map(([c]) => c.url)).toEqual(['/api/v1/identity/users/role-grants/grant%2F1/revoke', '/api/v1/identity/users/permission-grants/grant%2F1/revoke', '/api/v1/identity/roles/permission-grants/grant%2F1/revoke']);
    await transitionParty('party/1', true, { expectedUpdatedAt: '2026-11-05T00:00:00Z', reason: 'Synthetic activate' });
    await assignPartyRole({ partyId: 'party/1', roleId: 'role-1', qualificationRequired: true });
    expect(fixtures.http).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/v1/party/parties/party%2F1/activate', data: expect.objectContaining({ expectedUpdatedAt: '2026-11-05T00:00:00Z' }) }));
    expect(fixtures.http).toHaveBeenCalledWith(expect.objectContaining({ url: '/api/v1/party/roles/assignments', data: { partyId: 'party/1', roleId: 'role-1', qualificationRequired: true } }));
  });
});
