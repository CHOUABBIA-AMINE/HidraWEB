import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow', resource: 'tasks', action: 'read', permission: 'workflow:tasks:read', enforcementStatus: 'backend-enforced' },
    { route: '/api/v1/workflow/instances/{id}', methods: ['GET'], module: 'workflow', resource: 'instances', action: 'read', permission: 'workflow:instances:read', enforcementStatus: 'backend-enforced' },
  ];
  const permissions = ['workflow:tasks:read', 'workflow:instances:read'];
  const task = { id: 'task-1', instanceId: 'instance-1', stepId: 'review', status: 'OPEN', taskLabel: 'Validate pressure deviation', priorityId: 'HIGH', dueAt: '2026-09-12T08:00:00Z', assignedActorDisplayName: 'Operator A', slaStatus: 'NORMAL', updatedAt: '2026-09-11T10:30:00Z' };
  return { routes, permissions, task };
});

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string; method?: string; data?: unknown }) => {
    if (config.url?.endsWith('/security/permissions/catalog')) return { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes: fixtures.routes };
    if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
    if (config.url?.endsWith('/identity/me/permissions')) return fixtures.permissions;
    if (config.url === '/api/v1/workflow/tasks') return { content: [fixtures.task], page: 0, size: 50, totalElements: 1, totalPages: 1, hasNext: false };
    if (config.url === '/api/v1/workflow/tasks/task-1') return fixtures.task;
    if (config.url === '/api/v1/workflow/tasks/task-1/available-actions') return [
      { transitionId: 'tr-1', decision: 'APPROVE', fromStepId: 'review', toStepId: 'approved', reasonRequired: false, commentRequired: true, requiredPermissionCode: 'workflow:approve:execute', permitted: true },
      { transitionId: 'tr-2', decision: 'REJECT', fromStepId: 'review', toStepId: 'rejected', reasonRequired: true, commentRequired: false, requiredPermissionCode: 'workflow:reject:execute', permitted: false },
    ];
    if (config.url === '/api/v1/workflow/instances/instance-1') return { id: 'instance-1', status: 'STARTED', currentStepId: 'review', targetId: 'DEV-1', targetLabel: 'Pressure deviation DEV-1' };
    if (config.url === '/api/v1/workflow/instances/instance-1/timeline') return [{ id: 'tl-1', instanceId: 'instance-1', taskId: 'task-1', actionType: 'ASSIGN', actorDisplayName: 'Supervisor', sequence: 1, occurredAt: '2026-09-11T10:00:00Z' }];
    if (config.method === 'POST' && config.url === '/api/v1/workflow/tasks/task-1/transitions/tr-1/execute') return { actionId: 'act-1', taskId: 'task-1', taskStatus: 'APPROVED', instanceId: 'instance-1', instanceStatus: 'COMPLETED', transitionId: 'tr-1', decision: 'APPROVE', currentStepId: 'approved', executedAt: '2026-09-11T10:31:00Z' };
    throw new Error(`Unexpected request ${config.method ?? 'GET'} ${config.url}`);
  }),
}));

describe('HWEB-007 workflow task workspace', () => {
  it('executes only a backend-permitted transition using the current task version', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    const taskNavigation = screen.getAllByRole('button', { name: 'Mes tâches' }).find((button) => !button.hasAttribute('disabled') && button.getAttribute('aria-disabled') !== 'true');
    expect(taskNavigation).toBeDefined();
    fireEvent.click(taskNavigation!);

    expect(await screen.findByRole('heading', { name: 'Mes tâches' })).toBeInTheDocument();
    expect(await screen.findByText('Validate pressure deviation')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(await screen.findByText('Pressure deviation DEV-1')).toBeInTheDocument();
    expect(await screen.findByText('Supervisor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'REJECT' })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'APPROVE' }));
    fireEvent.change(screen.getByLabelText('comment *'), { target: { value: 'Validated against operating evidence.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Action: APPROVE' }));

    await waitFor(() => expect(vi.mocked(hidraHttpClient)).toHaveBeenCalledWith(expect.objectContaining({
      method: 'POST',
      url: '/api/v1/workflow/tasks/task-1/transitions/tr-1/execute',
      data: {
        expectedTaskUpdatedAt: '2026-09-11T10:30:00Z',
        reasonId: undefined,
        commentText: 'Validated against operating evidence.',
        decisionNote: undefined,
      },
    })));
    expect(await screen.findByText('APPROVE · APPROVED')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/work/tasks');
  });
});
