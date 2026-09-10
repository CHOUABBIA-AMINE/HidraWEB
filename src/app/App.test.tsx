import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    {
      route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read',
      permission: 'HIDRA_TOPOLOGY_MAP_READ', enforcementStatus: 'metadata-published; route-specific authorization annotations unavailable from current HidraAPI evidence',
    },
    {
      route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read',
      permission: 'HIDRA_WORKFLOW_TASKS_READ', enforcementStatus: 'metadata-published; route-specific authorization annotations unavailable from current HidraAPI evidence',
    },
  ];
  return {
    routes,
    catalog: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'catalog-only; backend currently authenticates all operational routes and does not expose route-specific @PreAuthorize evidence',
      permissionFormat: 'HIDRA_<MODULE>_<RESOURCE>_<ACTION>',
      routes,
    },
  };
});

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string }) => {
    if (config.url?.endsWith('/catalog')) {
      return fixtures.catalog;
    }
    return fixtures.routes;
  }),
}));

describe('HWEB-002 application shell', () => {
  it('authenticates in Basic mode and renders only backend-evidenced navigation capabilities', async () => {
    render(<AppProviders><App /></AppProviders>);

    expect(await screen.findByRole('heading', { name: 'Connexion de développement' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réseau' })).toHaveAttribute('aria-disabled', 'true');
    expect(document.querySelector('[role="button"][aria-label="Mes tâches"][aria-disabled="true"]')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Planification' })).not.toBeInTheDocument();

    const navigationToggle = screen.getByRole('button', { name: 'Réduire la navigation' });
    expect(navigationToggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(navigationToggle);
    expect(screen.getByRole('button', { name: 'Développer la navigation' })).toHaveAttribute('aria-expanded', 'false');
  });
});
