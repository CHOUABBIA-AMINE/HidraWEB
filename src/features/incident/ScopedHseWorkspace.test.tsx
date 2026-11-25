import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScopedHseWorkspace } from './ScopedHseWorkspace';

const f = vi.hoisted(() => ({
  context: { scopeId: 1, companyPartyId: 'company-1', principalId: 'user-1', type: 'FACILITY', targetId: 'facility-1' },
  permission: true,
  region: vi.fn(),
  scopes: vi.fn(),
  cases: vi.fn(),
  detail: vi.fn(),
  capas: vi.fn(),
  capa: vi.fn(),
  history: vi.fn(),
  legacy: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, params?: { count?: number; total?: number }) => key === 'uxr29.loaded' ? `${params?.count}/${params?.total}` : key }) }));
vi.mock('@/app/auth/useAuth', () => ({ useAuth: () => ({ status: 'authenticated', session: { sessionId: 'session-1', principal: { userId: 'user-1' } } }) }));
vi.mock('@/shell/model/useShellUiStore', () => ({ useShellUiStore: (selector: (state: { operationalContext: typeof f.context }) => unknown) => selector({ operationalContext: f.context }) }));
vi.mock('@/features/permissions/usePermissions', () => ({ usePermissions: () => ({
  status: 'ready', permissions: new Set(['hse:cases:read']), can: () => f.permission,
  routes: [...['', '/{caseId}', '/{caseId}/capas', '/{caseId}/capas/{capaId}', '/{caseId}/history'].map(suffix => ({ route: '/api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases' + suffix, methods: ['GET'], permission: 'hse:cases:read' })), ...['/api/v1/identity/me/regional-access/scopes','/api/v1/identity/me/regional-access/{resourceKind}/{resourceId}'].map(route => ({route, methods:['GET'],permission:'identity:me:read'}))],
}) }));
vi.mock('@/features/context/api/identityOrganizationApi', () => ({ fetchCurrentOperationalScopes: f.scopes, fetchCurrentRegionalAccess: f.region }));
vi.mock('@/features/incident/api/hseApi', async importOriginal => {
  const original = await importOriginal<typeof import('./api/hseApi')>();
  return { ...original, fetchScopedHseCases: f.cases, fetchScopedHseCase: f.detail, fetchScopedHseCapas: f.capas, fetchScopedHseCapa: f.capa, fetchScopedHseHistory: f.history, fetchHseCases: f.legacy, fetchCapas: f.legacy };
});

const row = { id: 'case-1', caseNumber: 'DUPLICATE', companyId: 'company-1', facilityId: 'facility-1', status: 'CLOSED' };
const page = (items: unknown[], total = items.length, page = 0) => ({ items, total, page, size: 25 });
function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = <QueryClientProvider client={client}><ScopedHseWorkspace /></QueryClientProvider>;
  return { ...render(tree), tree };
}

describe('UXR-29 scoped HSE owner reads', () => {
  beforeEach(() => {
    f.context = { scopeId: 1, companyPartyId: 'company-1', principalId: 'user-1', type: 'FACILITY', targetId: 'facility-1' };
    f.permission = true;
    vi.resetAllMocks();
    f.scopes.mockResolvedValue([{ id: 1, type: 'FACILITY', targetId: 'facility-1' }]);
    f.region.mockResolvedValue({ permitted: true, companyPartyId: 'company-1', resourceKind: 'FACILITY', resourceId: 'facility-1' });
    f.cases.mockResolvedValue(page([row, { ...row, id: 'case-2' }, ...Array.from({ length: 23 }, (_, i) => ({ ...row, id: 'filler-' + i, caseNumber: 'OTHER-' + i }))], 30));
    f.detail.mockResolvedValue(row);
    f.capas.mockResolvedValue(page([{ id: 'capa-1', caseId: 'case-1', actionNumber: 'CAPA-1', status: 'APPROVED' }]));
    f.capa.mockResolvedValue({ id: 'capa-1', caseId: 'case-1', evidenceId: 'evidence-1' });
    f.history.mockResolvedValue(page([{ id: 'history-1', caseId: 'case-1', operation: 'CLOSE' }]));
  });

  it('uses exact facility ownership, preserves distinct duplicate numbers, and opens case-scoped CAPA/history', async () => {
    mount();
    expect(await screen.findAllByText('DUPLICATE')).toHaveLength(2);
    expect(screen.getByText('25/30')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'uxr29.openCase' })[0]);
    expect(await screen.findByText('CAPA-1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'uxr29.openCapa' }));
    expect(await screen.findByText(/evidence-1/)).toBeInTheDocument();
    expect(await screen.findByText(/history-1/)).toBeInTheDocument();
    expect(f.detail).toHaveBeenCalledWith({ companyId: 'company-1', facilityId: 'facility-1' }, 'case-1', expect.anything());
    expect(f.capa).toHaveBeenCalledWith({ companyId: 'company-1', facilityId: 'facility-1' }, 'case-1', 'capa-1', expect.anything());
    f.cases.mockResolvedValue(page([{ ...row, id: 'case-3' }, ...Array.from({ length: 4 }, (_, i) => ({ ...row, id: 'next-' + i, caseNumber: 'NEXT-' + i }))], 30, 1));
    fireEvent.click(screen.getAllByRole('button', { name: 'uxr29.next' })[0]);
    expect(await screen.findByText('case-3')).toBeInTheDocument();
    expect(screen.queryByText(/evidence-1/)).not.toBeInTheDocument();
    expect(f.legacy).not.toHaveBeenCalled();
  });

  it('does not query HSE for a PIPELINE_SYSTEM or a missing route grant', async () => {
    f.context.type = 'PIPELINE_SYSTEM';
    const view = mount();
    expect(screen.getByText('uxr29.facilityRequired')).toBeInTheDocument();
    expect(f.cases).not.toHaveBeenCalled();
    f.context.type = 'FACILITY'; f.permission = false;
    view.rerender(view.tree);
    expect(screen.getByText('uxr29.facilityRequired')).toBeInTheDocument();
    expect(f.cases).not.toHaveBeenCalled();
  });

  it('drops wrong-owner responses and never falls back to a global register', async () => {
    f.cases.mockResolvedValue(page([{ ...row, facilityId: 'foreign-facility' }], 1));
    mount();
    expect(await screen.findByText('ownerFeedback.denied')).toBeInTheDocument();
    expect(screen.queryByText('DUPLICATE')).not.toBeInTheDocument();
    expect(screen.queryByText('1/1')).not.toBeInTheDocument();
    expect(f.legacy).not.toHaveBeenCalled();
  });

  it('removes a selected receipt when a current regional read denies access', async () => {
    const view = mount();
    fireEvent.click((await screen.findAllByRole('button', { name: 'uxr29.openCase' }))[0]);
    fireEvent.click(await screen.findByRole('button', { name: 'uxr29.openCapa' }));
    expect(await screen.findByText(/evidence-1/)).toBeInTheDocument();
    f.region.mockResolvedValue({ permitted: false });
    fireEvent.click(screen.getByRole('button', { name: 'uxr29.refresh' }));
    await waitFor(() => expect(screen.queryByText(/evidence-1/)).not.toBeInTheDocument());
    expect(await screen.findByText('ownerFeedback.denied')).toBeInTheDocument();
    expect(screen.queryByText('25/30')).not.toBeInTheDocument();
    f.context.targetId = 'facility-2';
    view.rerender(view.tree);
    expect(screen.queryByText(/evidence-1/)).not.toBeInTheDocument();
    expect(f.legacy).not.toHaveBeenCalled();
  });
});
