import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    {
      route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read',
      permission: 'topology:map:read', enforcementStatus: 'backend-enforced',
    },
    {
      route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read',
      permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced',
    },
    {
      route: '/api/v1/workflow/instances/{id}', methods: ['GET'], module: 'workflow', resource: 'instances', action: 'read',
      permission: 'workflow:instances:read', enforcementStatus: 'backend-enforced',
    },
    {
      route: '/api/v1/alarm/alarms', methods: ['GET'], module: 'alarm', resource: 'alarms', action: 'read',
      permission: 'alarm:alarms:read', enforcementStatus: 'backend-enforced',
    },
    {
      route: '/api/v1/identity/users', methods: ['POST'], module: 'identity', resource: 'users', action: 'execute',
      permission: 'identity:users:execute', enforcementStatus: 'backend-enforced',
    },
    {
      route: '/api/v1/organization/units', methods: ['POST'], module: 'organization', resource: 'units', action: 'execute',
      permission: 'organization:units:execute', enforcementStatus: 'backend-enforced',
    },
  ];
  const effectivePermissions = [
    'topology:map:read',
    'workflow:tasks:read',
    'workflow:instances:read',
    'alarm:alarms:read',
    'identity:users:execute',
    'organization:units:execute',
  ];
  return {
    routes,
    effectivePermissions,
    catalog: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced by HidraRouteAuthorizationInterceptor',
      permissionFormat: '<module>:<resource>:<action>',
      bootstrapAdminBypass: 'ROLE_HIDRA_ADMIN',
      routes,
    },
  };
});

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string }) => {
    if (config.url?.endsWith('/catalog')) return fixtures.catalog;
    if (config.url?.endsWith('/identity/me/permissions')) return fixtures.effectivePermissions;
    return fixtures.routes;
  }),
}));

describe('HWEB-002 / HWEB-004 / HWEB-005 / HWEB-007 / HWEB-008 capability-driven application shell', () => {
  it('authenticates and enables only implemented navigation backed by effective grants', async () => {
    render(<AppProviders><App /></AppProviders>);

    expect(await screen.findByRole('heading', { name: 'Compte Local' })).toBeInTheDocument();
    expect(screen.getByText('LOCAL', { exact: true })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    const navigation = screen.getByRole('navigation', { name: 'Navigation principale' });
    const operations = within(navigation).getByRole('button', { name: 'OPÉRATIONS' });
    const work = within(navigation).getByRole('button', { name: 'TRAVAIL' });
    const administration = within(navigation).getByRole('button', { name: 'ADMINISTRATION' });

    // The current product group alone is expanded: verify authorized visible children
    // and do not mistake the disabled global My Tasks shortcut for sidebar navigation.
    expect(operations).toHaveAttribute('aria-expanded', 'true');
    expect(work).toHaveAttribute('aria-expanded', 'false');
    expect(within(navigation).getByRole('button', { name: 'Réseau' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(within(navigation).getByRole('button', { name: 'Alarmes' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(within(navigation).queryByRole('button', { name: 'Planification' })).not.toBeInTheDocument();

    fireEvent.click(work);
    const tasks = await within(navigation).findByRole('button', { name: 'Mes tâches' });
    expect(tasks).toBeEnabled();
    expect(work).toHaveAttribute('aria-expanded', 'true');
    expect(operations).toHaveAttribute('aria-expanded', 'false');
    // MUI Collapse unmounts after its exit transition, not synchronously with aria-expanded.
    await waitFor(() => expect(within(navigation).queryByRole('button', { name: 'Réseau' })).not.toBeInTheDocument());

    fireEvent.click(administration);
    expect(await within(navigation).findByRole('button', { name: 'Organisation' })).toBeEnabled();
    expect(within(navigation).getByRole('button', { name: 'Identité & accès' })).toBeEnabled();
    expect(work).toHaveAttribute('aria-expanded', 'false');
    expect(administration).toHaveAttribute('aria-expanded', 'true');
    // The newly collapsed Work group must finish exiting before its children disappear.
    await waitFor(() => expect(within(navigation).queryByRole('button', { name: 'Mes tâches' })).not.toBeInTheDocument());
    expect(within(navigation).queryByRole('button', { name: 'Planification' })).not.toBeInTheDocument();

    const navigationToggle = screen.getByRole('button', { name: 'Réduire la navigation' });
    expect(navigationToggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(navigationToggle);
    expect(screen.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
  });
});
