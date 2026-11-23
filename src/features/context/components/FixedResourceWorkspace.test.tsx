import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  denied: false,
  allowed: true,
  listReads: 0,
}));
vi.mock('@/app/auth/useAuth', () => ({
  useAuth: () => ({ status: 'authenticated', session: { principal: { userId: 'synthetic-actor' } } }),
}));
vi.mock('@/shell/model/useShellUiStore', () => ({
  useShellUiStore: (selector: (state: { operationalContext: undefined }) => unknown) =>
    selector({ operationalContext: undefined }),
}));
vi.mock('@/features/permissions/usePermissions', () => ({
  usePermissions: () => ({
    status: 'ready',
    permissions: new Set(['dynamic-module:resources:read', 'dynamic-module:dynamic-resource:read']),
    can: () => fixture.allowed,
  }),
}));
vi.mock('@/shell/context/useContextDrawer', () => ({
  useContextDrawer: () => ({ openDrawer: vi.fn(), closeDrawer: vi.fn() }),
}));
vi.mock('@/features/workbench/api/workbenchApi', () => ({
  workbenchQueryKeys: {
    resources: (module: string) => ['hidra', 'workbench', module, 'resources'],
    list: (module: string, resource: string, page: number, size: number, query: string) =>
      ['hidra', 'workbench', module, resource, 'list', page, size, query],
  },
  fetchWorkbenchResources: async (module: string) => [{
    module, resource: 'organization-units', idField: 'id', searchableFields: ['code'],
    entityName: 'OrganizationUnit', javaType: 'synthetic.OrganizationUnit',
    tableName: 'synthetic', listEndpoint: '', detailEndpoint: '', searchEndpoint: '',
  }],
  fetchWorkbenchRecords: async () => {
    fixture.listReads += 1;
    if (fixture.denied) throw { status: 403, message: 'Owner denied this read' };
    return {
      module: 'organization', resource: 'organization-units',
      page: 0, size: 50, totalElements: 1, totalPages: 1,
      items: [{ module: 'organization', resource: 'organization-units', id: 'ou-1',
        attributes: { id: 'ou-1', code: 'PRIVATE-UNIT' } }],
    };
  },
}));

import { FixedResourceWorkspace } from '@/features/context/components/FixedResourceWorkspace';
import { i18n } from '@/shared/i18n/i18n';

afterEach(() => {
  cleanup();
  fixture.denied = false;
  fixture.allowed = true;
  fixture.listReads = 0;
});

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <FixedResourceWorkspace module="organization" resource="organization-units" title="Synthetic units" />
      </QueryClientProvider>
    </I18nextProvider>,
  );
  return { client, ...view };
}

describe('UXR-17 fixed-resource register integration repair', () => {
  it('supplies the authorized register state and retains exact owner inspection affordance', async () => {
    mount();
    const region = await screen.findByRole('region', { name: 'organization/organization-units' });
    expect(await within(region).findByText('PRIVATE-UNIT')).toBeInTheDocument();
    expect(within(region).getByRole('table', { name: 'organization/organization-units' })).toBeVisible();
    expect(within(region).getByRole('button', { name: 'Inspecter' })).toBeEnabled();
  });

  it('conceals cached rows, totals and selection when the owner denies a revalidation', async () => {
    const { client } = mount();
    const region = await screen.findByRole('region', { name: 'organization/organization-units' });
    expect(await within(region).findByText('PRIVATE-UNIT')).toBeInTheDocument();
    fixture.denied = true;
    await client.refetchQueries({ predicate: query => query.queryKey.includes('list') });
    await waitFor(() => expect(fixture.listReads).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(within(region).queryByText('PRIVATE-UNIT')).not.toBeInTheDocument());
    expect(within(region).queryByRole('table')).not.toBeInTheDocument();
    expect(within(region).queryByRole('button', { name: 'Inspecter' })).not.toBeInTheDocument();
    expect(within(region).queryByText(/1–1 of 1/)).not.toBeInTheDocument();
  });

  it('cannot request or display protected records without the current grant', () => {
    fixture.allowed = false;
    mount();
    expect(screen.queryByText('PRIVATE-UNIT')).not.toBeInTheDocument();
    expect(fixture.listReads).toBe(0);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
