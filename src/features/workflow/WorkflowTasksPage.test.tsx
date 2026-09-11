import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read', permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/workflow/instances/{id}', methods: ['GET'], module: 'workflow', resource: 'instances', action: 'read', permission: 'workflow:instances:read', enforcementStatus: 'backend-enforced' },
  ];
  const permissions = ['workflow:tasks:read', 'workflow:instances:read'];
  const task = { id: 'task-1', instanceId: 'instance-1', stepId: 'review', status: 'OPEN', taskLabel: 'Validate pressure deviation', priorityId: 'HIGH', dueAt: '2026-09-12T08:00:00Z', assignedActorDisplayName: 'Operator A', slaStatus: 'NORMAL' };
  return { routes, permissions, task };
});

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string }) => {
    if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
    if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
    if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
    if (config.url === '/api/v1/workflow/tasks') return { content: [fixtures.task], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
    if (config.url === '/api/v1/workflow/tasks/task-1') return fixtures.task;
    if (config.url === '/api/v1/workflow/tasks/task-1/available-actions') return [{ transitionId: 'tr-1', decision: 'APPROVE', fromStepId: 'review', toStepId: 'approved', reasonRequired: false, commentRequired: true, requiredPermissionCode: 'workflow:approve:execute', permitted: true }];
    if (config.url === '/api/v1/workflow/instances/instance-1') return { id: 'instance-1', status: 'STARTED', currentStepId: 'review', targetId: 'DEV-1', targetLabel: 'Pressure deviation DEV-1' };
    if (config.url === '/api/v1/workflow/instances/instance-1/timeline') return [{ id: 'tl-1', instanceId: 'instance-1', taskId: 'task-1', actionType: 'ASSIGN', actorDisplayName: 'Supervisor', sequence: 1, occurredAt: '2026-09-11T10:00:00Z' }];
    throw new Error(`Unexpected request ${config.url}`);
  }),
}));

describe('HWEB-007 workflow task workspace', () => {
  it('loads assigned tasks, authoritative available actions, instance detail and timeline without inventing transition execution', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mes tâches' }));

    expect(await screen.findByRole('heading', { name: 'Mes tâches' })).toBeInTheDocument();
    expect(await screen.findByText('Validate pressure deviation')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(await screen.findByText('APPROVE')).toBeInTheDocument();
    expect(await screen.findByText('Pressure deviation DEV-1')).toBeInTheDocument();
    expect(await screen.findByText('Supervisor')).toBeInTheDocument();
    expect(screen.getByText(/ne fournit pas encore d’endpoint d’exécution de transition/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'APPROVE' })).not.toBeInTheDocument();
    expect(window.location.pathname).toBe('/work/tasks');
  });
});
