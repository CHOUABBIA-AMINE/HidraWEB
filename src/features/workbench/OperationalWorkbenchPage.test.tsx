import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/workbench/modules', methods: ['GET'], module: 'modules', resource: 'resources', action: 'read', permission: 'modules:resources:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/workbench/{module}/resources', methods: ['GET'], module: 'dynamic-module', resource: 'resources', action: 'read', permission: 'dynamic-module:resources:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'dynamic-module', resource: 'dynamic-resource', action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'dynamic-module', resource: 'dynamic-resource', action: 'read', permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/workbench/{module}/{resource}/search', methods: ['POST'], module: 'dynamic-module', resource: 'dynamic-resource', action: 'search', permission: 'dynamic-module:dynamic-resource:search', enforcementStatus: 'backend-enforced' },
  ];
  const effectivePermissions = [
    'modules:resources:read',
    'dynamic-module:resources:read',
    'dynamic-module:dynamic-resource:read',
    'dynamic-module:dynamic-resource:search',
  ];
  const descriptor = {
    module: 'alarm', resource: 'alarm-events', entityName: 'AlarmEventJpaEntity', javaType: 'dz.sh.hidra.modules.alarm.infrastructure.AlarmEventJpaEntity',
    tableName: 'hidra_alarm_event', idField: 'id', searchableFields: ['message', 'severity'],
    listEndpoint: '/api/v1/workbench/alarm/alarm-events', detailEndpoint: '/api/v1/workbench/alarm/alarm-events/{id}', searchEndpoint: '/api/v1/workbench/alarm/alarm-events/search',
  };
  const record = { module: 'alarm', resource: 'alarm-events', id: '1', attributes: { id: '1', message: 'High pressure', severity: 'HIGH' } };
  return { routes, effectivePermissions, descriptor, record };
});

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string; method?: string }) => {
    if (config.url?.endsWith('/security/permissions/catalog')) {
      return {
        strategy: 'derived-route-permission-catalog',
        enforcement: 'backend-enforced by HidraRouteAuthorizationInterceptor',
        permissionFormat: '<module>:<resource>:<action>',
        bootstrapAdminBypass: 'ROLE_HIDRA_ADMIN',
        routes: fixtures.routes,
      };
    }
    if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
    if (config.url?.endsWith('/identity/me/permissions')) return fixtures.effectivePermissions;
    if (config.url === '/api/v1/workbench/modules') return ['alarm'];
    if (config.url === '/api/v1/workbench/alarm/resources') return [fixtures.descriptor];
    if (config.url === '/api/v1/workbench/alarm/alarm-events/1') return fixtures.record;
    if (config.url === '/api/v1/workbench/alarm/alarm-events' && config.method === 'GET') {
      return { module: 'alarm', resource: 'alarm-events', page: 0, size: 50, totalElements: 1, totalPages: 1, items: [fixtures.record] };
    }
    throw new Error(`Unexpected test request ${config.method ?? 'GET'} ${config.url}`);
  }),
}));

describe('HWEB-003 operational workbench', () => {
  it('discovers, lists and inspects generic backend records without entity-specific UI assumptions', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir l’atelier opérationnel' }));

    expect(await screen.findByRole('heading', { name: 'Atelier opérationnel' })).toBeInTheDocument();
    expect(await screen.findByText('High pressure')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspecter' }));
    expect(await screen.findByRole('heading', { name: 'alarm-events · 1' })).toBeInTheDocument();
    expect(screen.getAllByText('HIGH').length).toBeGreaterThan(0);
  });
});
