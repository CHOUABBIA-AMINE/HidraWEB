import { fireEvent, render, screen } from '@testing-library/react';
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
    if (config.url?.endsWith('/catalog')) {
      return fixtures.catalog;
    }
    if (config.url?.endsWith('/identity/me/permissions')) {
      return fixtures.effectivePermissions;
    }
    return fixtures.routes;
  }),
}));

describe('HWEB-002 / HWEB-004 / HWEB-005 capability-driven application shell', () => {
  it('authenticates and enables only implemented navigation backed by effective grants', async () => {
    render(<AppProviders><App /></AppProviders>);

    expect(await screen.findByRole('heading', { name: 'Connexion de développement' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réseau' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(document.querySelector('[role="button"][aria-label="Mes tâches"][aria-disabled="true"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Organisation' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Identité & accès' })).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('button', { name: 'Planification' })).not.toBeInTheDocument();

    const navigationToggle = screen.getByRole('button', { name: 'Réduire la navigation' });
    expect(navigationToggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(navigationToggle);
    expect(screen.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
  });
});
