import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    permissions: ['alarm:alarms:read', 'alarm:alarms:execute'],
    alarm: {
      id: 'alarm-1', alarmNumber: 'ALM-001', alarmTypeId: 'PRESSURE', severityId: 'SEV-CRITICAL', priorityId: 'P1',
      titleFr: 'Pression élevée', titleEn: 'High pressure', currentState: 'ACTIVE', raisedAt: '2026-09-11T10:00:00Z',
      firstDetectedAt: '2026-09-11T09:59:00Z', lastUpdatedAt: '2026-09-11T10:02:00Z', sourceType: 'MONITORING', sourceReferenceId: 'DEV-1',
      topologyAssetId: 'PIPE-1', topologyAssetCode: 'PL-001', topologyAssetName: 'Pipeline Nord', workflowInstanceId: 'wf-1', correlationId: 'corr-1',
    },
  };
});

const hidraHttpClient = vi.hoisted(() => vi.fn(async (config: { url?: string; method?: string }) => {
  if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
  if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
  if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
  if (config.url === '/api/v1/alarm/alarms' && config.method === 'GET') return { content: [fixtures.alarm], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
  if (config.url === '/api/v1/alarm/alarms/alarm-1' && config.method === 'GET') return fixtures.alarm;
  if (config.url === '/api/v1/alarm/alarms/alarm-1/shelvings' && config.method === 'GET') return [{ id: 'shelf-1', alarmId: 'alarm-1', shelvingReasonId: 'MAINT', reasonText: 'Inspection', shelvedByActorId: 'actor-1', shelvedAt: '2026-09-11T08:00:00Z', shelvedUntil: '2026-09-11T12:00:00Z', status: 'ACTIVE' }];
  if (config.url === '/api/v1/alarm/alarms/acknowledgements' && config.method === 'POST') return 'ack-1';
  if (config.url?.endsWith('/shelvings/shelf-1/unshelve') && config.method === 'POST') return 'unshelve-1';
  throw new Error(`Unexpected request ${config.method} ${config.url}`);
}));

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient }));

async function signInAndOpenAlarms() {
  fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
  fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
  expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Alarmes' }));
  expect(await screen.findByRole('heading', { name: 'Console des alarmes' })).toBeInTheDocument();
}

describe('HWEB-008 alarm console', () => {
  beforeEach(() => {
    cleanup();
    fixtures.permissions = ['alarm:alarms:read', 'alarm:alarms:execute'];
    hidraHttpClient.mockClear();
    window.history.replaceState({}, '', '/overview');
  });

  it('loads active alarms, detail and shelving and executes only verified backend actions', async () => {
    render(<AppProviders><App /></AppProviders>);
    await signInAndOpenAlarms();

    expect(await screen.findByText('Pression élevée')).toBeInTheDocument();
    expect(screen.getByText('SEV-CRITICAL')).toBeInTheDocument();
    expect(screen.getByText(/Aucune opération de suppression/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir' }));

    expect(await screen.findByText('Pipeline Nord')).toBeInTheDocument();
    expect(await screen.findByText('MAINT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ouvrir le réseau' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ouvrir mes tâches' })).toBeInTheDocument();
    expect(screen.getByText(/référence acteur depuis le client/)).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText('Référence acteur')[0], { target: { value: 'actor-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Acquitter' }));

    expect(await screen.findByText('Opération enregistrée par HidraAPI.')).toBeInTheDocument();
    expect(hidraHttpClient).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', url: '/api/v1/alarm/alarms/acknowledgements' }));
    expect(window.location.pathname).toBe('/alarms');
  });

  it('keeps mutation controls unavailable for read-only alarm permission', async () => {
    fixtures.permissions = ['alarm:alarms:read'];
    render(<AppProviders><App /></AppProviders>);
    await signInAndOpenAlarms();
    fireEvent.click(await screen.findByRole('button', { name: 'Ouvrir' }));

    expect(await screen.findByText('Vous ne disposez pas de l’autorisation d’exécuter les actions d’alarme.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acquitter' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clôturer' })).not.toBeInTheDocument();
  });
});
