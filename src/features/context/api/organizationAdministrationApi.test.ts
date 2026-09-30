import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import {
  assignOrganizationResponsibility,
  fetchOrganizationAssignments,
  fetchOrganizationEmployees,
  fetchOrganizationUnit,
  fetchOrganizationUnits,
  registerOperationalScope,
  revokeOrganizationResponsibility,
} from '@/features/context/api/identityOrganizationApi';

describe('organization administration API', () => {
  beforeEach(() => httpClient.mockReset());

  it('uses dedicated organization administration reads', async () => {
    httpClient.mockResolvedValue({});
    await fetchOrganizationUnits('TRC', 0, 50);
    await fetchOrganizationUnit('ou/1');
    await fetchOrganizationEmployees('Abir', 0, 50);
    await fetchOrganizationAssignments('emp-1', 'ou-1', 'ACTIVE', 0, 50);

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/organization/units',
      params: { q: 'TRC', page: 0, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, { method: 'GET', url: '/api/v1/organization/units/ou%2F1' });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/organization/employees',
      params: { q: 'Abir', page: 0, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/organization/assignments',
      params: { employeeId: 'emp-1', organizationUnitId: 'ou-1', status: 'ACTIVE', page: 0, size: 50 },
    });
  });

  it('uses canonical scope and responsibility commands', async () => {
    httpClient.mockResolvedValue({});
    await registerOperationalScope({ type: 'ORGANIZATION_UNIT', targetId: 'ou-1' });
    await assignOrganizationResponsibility({
      responsibilityType: 'RESPONSIBLE',
      assigneeType: 'EMPLOYEE',
      assigneeId: 'emp-1',
      scopeId: 12,
      workflowInstanceId: 'wf-1',
      operationReference: 'op-1',
    });
    await revokeOrganizationResponsibility('resp/1', {
      workflowInstanceId: 'wf-2',
      operationReference: 'op-2',
    });

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/api/v1/organization/operational-scopes',
      data: { type: 'ORGANIZATION_UNIT', targetId: 'ou-1' },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/organization/responsibilities',
      data: expect.objectContaining({ assigneeId: 'emp-1', scopeId: 12 }),
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'POST',
      url: '/api/v1/organization/responsibilities/resp%2F1/revoke',
      data: { workflowInstanceId: 'wf-2', operationReference: 'op-2' },
    });
  });
});
