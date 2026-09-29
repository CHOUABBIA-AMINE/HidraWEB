import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import {
  executePlanningApprovalAction,
  fetchOperationalPlan,
  fetchOperationalPlans,
  fetchPlanRevision,
  fetchPlanRevisions,
  fetchPlanTarget,
  fetchPlanTargets,
  fetchPlanningApproval,
  fetchPlanningPeriod,
  fetchPlanningPeriods,
} from '@/features/planning/api/planningApi';

describe('planning API adapter', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses canonical period and operational-plan list/detail endpoints with backend pagination', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 1, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'period/1' })
      .mockResolvedValueOnce({ content: [], page: 2, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'plan/1' });

    await fetchPlanningPeriods({ page: 1, size: 50 });
    await fetchPlanningPeriod('period/1');
    await fetchOperationalPlans({ page: 2, size: 50 });
    await fetchOperationalPlan('plan/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/planning/periods',
      params: { page: 1, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/planning/periods/period%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/planning/operational-plans',
      params: { page: 2, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/planning/operational-plans/plan%2F1',
    });
  });

  it('uses revision- and target-scoped backend query contracts without client-side lifecycle inference', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'rev/1' })
      .mockResolvedValueOnce({ content: [], page: 3, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'target/1' });

    await fetchPlanRevisions({ planId: 'plan-1', page: 0, size: 50 });
    await fetchPlanRevision('rev/1');
    await fetchPlanTargets({ revisionId: 'rev-1', page: 3, size: 50 });
    await fetchPlanTarget('target/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/planning/revisions',
      params: { planId: 'plan-1', page: 0, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/planning/revisions/rev%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/planning/targets',
      params: { revisionId: 'rev-1', page: 3, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/planning/targets/target%2F1',
    });
  });

  it('reads and executes only the revision-scoped backend approval contract with the authoritative task version', async () => {
    httpClient
      .mockResolvedValueOnce({
        revisionId: 'rev/1',
        revisionStatus: 'SUBMITTED',
        workflowInstanceId: 'wf-1',
        workflowInstanceStatus: 'IN_PROGRESS',
        currentTaskId: 'task-1',
        currentTaskUpdatedAt: '2026-09-29T18:00:00Z',
        actions: [{
          transitionId: 'approve/1',
          decision: 'APPROVE',
          reasonRequired: false,
          commentRequired: true,
          requiredPermissionCode: 'planning:revisions:approve',
          permitted: true,
        }],
      })
      .mockResolvedValueOnce({
        revisionId: 'rev/1',
        revisionStatus: 'APPROVED',
        workflowInstanceId: 'wf-1',
        workflowInstanceStatus: 'COMPLETED',
        transitionId: 'approve/1',
        decision: 'APPROVE',
        executedAt: '2026-09-29T18:01:00Z',
      });

    const approval = await fetchPlanningApproval('rev/1');
    const request = {
      expectedTaskUpdatedAt: approval.currentTaskUpdatedAt!,
      commentText: 'Approved',
      correlationId: 'corr-1',
    };

    await executePlanningApprovalAction('rev/1', approval.actions?.[0].transitionId ?? '', request);

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/planning/revisions/rev%2F1/approval',
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/planning/revisions/rev%2F1/approval/actions/approve%2F1/execute',
      data: request,
    });
    expect(request.expectedTaskUpdatedAt).toBe('2026-09-29T18:00:00Z');
  });
});
