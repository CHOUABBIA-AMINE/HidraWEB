import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import {
  executeWorkflowTransition,
  fetchAvailableActions,
  fetchInstance,
  fetchTask,
  fetchTasks,
  fetchTimeline,
} from '@/features/workflow/api/workflowApi';

describe('workflow API adapter', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses the authenticated inbox contract and omits empty optional query values', async () => {
    httpClient.mockResolvedValueOnce({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, hasNext: false });

    await fetchTasks({ view: 'assigned', page: 0, size: 20 });

    expect(httpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/workflow/tasks',
      params: { view: 'assigned', page: 0, size: 20 },
    });
  });

  it('uses canonical task/action/instance/timeline endpoints with encoded identifiers', async () => {
    httpClient
      .mockResolvedValueOnce({ id: 'task/1' })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ id: 'instance/1' })
      .mockResolvedValueOnce([]);

    await fetchTask('task/1');
    await fetchAvailableActions('task/1');
    await fetchInstance('instance/1');
    await fetchTimeline('instance/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/workflow/tasks/task%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/workflow/tasks/task%2F1/available-actions',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/workflow/instances/instance%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/workflow/instances/instance%2F1/timeline',
    });
  });

  it('executes only the selected backend transition and carries the authoritative task version', async () => {
    httpClient.mockResolvedValueOnce({
      actionId: 'action-1',
      taskId: 'task/1',
      transitionId: 'approve/1',
      decision: 'APPROVE',
    });

    const request = {
      expectedTaskUpdatedAt: '2026-09-29T10:00:00Z',
      reasonId: 'reason-1',
      decisionNote: 'Approved',
      commentText: 'Validated',
      correlationId: 'corr-1',
    };

    await executeWorkflowTransition('task/1', 'approve/1', request);

    expect(httpClient).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/workflow/tasks/task%2F1/transitions/approve%2F1/execute',
      data: request,
    });
  });
});
