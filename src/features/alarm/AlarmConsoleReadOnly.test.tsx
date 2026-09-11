import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/alarm/alarms', methods: ['GET'], module: 'alarm', resource: 'alarms', action: 'read', permission: 'alarm:alarms:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/alarm/alarms/acknowledgements', methods: ['POST'], module: 'alarm', resource: 'alarms', action: 'execute', permission: 'alarm:alarms:execute', enforcementStatus: 'backend-enforced' },
  ];
  return {
    routes,
    permissions: ['alarm:alarms:read'],
    alarm: {
      id: 'alarm-1', alarmNumber: 'ALM-001', alarmTypeId: 'PRESSURE', severityId: 'SEV-CRITICAL', priorityId: 'P1',
      titleFr: 'Pression élevée', currentState: 'ACTIVE', raisedAt: '2026-09-11T10:00:00Z', topologyAssetId: 'PIPE-1', topologyAssetName: 'Pipeline Nord',
    },
  };
});

const hidraHttpClient = vi.hoisted(() => vi.fn(async (config: { url?: string; method?: string }) => {
  if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
  if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
  if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
  if (config.url === '/api/v1/alarm/alarms' && config.method === 'GET') return { content: [fixtures.alarm], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/alarm/alarms/alarm-1' && config.method === 'GET') return fixtures.alarm;
  if (config.url === '/api/v1/alarm/alarms/alarm-1/shelvings' && config.method === 'GET') return [];
  throw new Error(`Unexpected request ${config.method} ${config.url}`);
}));

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient }));

describe('HWEB-008 alarm console read-only authorization', () => {
  beforeEach(() => {
    hidraHttpClient.mockClear();
    window.history.replaceState({}, '', '/overview');
  });

  it('keeps alarm mutations unavailable without alarm:alarms:execute', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Alarmes' }));
    expect(await screen.findByRole('heading', { name: 'Console des alarmes' })).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Ouvrir' }));
    expect(await screen.findByText('Vous ne disposez pas de l’autorisation d’exécuter les actions d’alarme.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acquitter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clôturer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mettre en étagère' })).not.toBeInTheDocument();
  });
});
