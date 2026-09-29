import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  searchWorkbenchRecords,
} from '@/features/workbench/api/workbenchApi';

describe('workbench API adapter', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses the canonical resources endpoint and encodes the module segment', async () => {
    httpClient.mockResolvedValueOnce([{
      module: 'risk analytics',
      resource: 'risk-items',
      entityName: 'RiskItemJpaEntity',
      javaType: 'dz.sh.hidra.modules.risk.infrastructure.RiskItemJpaEntity',
      tableName: 'hidra_risk_item',
      idField: 'id',
      searchableFields: ['code'],
      listEndpoint: '/api/v1/workbench/risk analytics/risk-items',
      detailEndpoint: '/api/v1/workbench/risk analytics/risk-items/{id}',
      searchEndpoint: '/api/v1/workbench/risk analytics/risk-items/search',
    }]);

    const resources = await fetchWorkbenchResources('risk analytics');

    expect(httpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/workbench/risk%20analytics/resources',
    });
    expect(resources[0]).toMatchObject({
      module: 'risk analytics',
      resource: 'risk-items',
      idField: 'id',
    });
  });

  it('lists records through the canonical endpoint and preserves records using request context when optional module/resource fields are absent', async () => {
    httpClient.mockResolvedValueOnce({
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1,
      items: [{ id: 'record-1', attributes: { code: 'R-1' } }],
    });

    const page = await fetchWorkbenchRecords({
      module: 'alarm',
      resource: 'alarm events',
      page: 0,
      size: 50,
      query: ' pressure ',
    });

    expect(httpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/workbench/alarm/alarm%20events',
      params: { page: 0, size: 50, q: 'pressure' },
    });
    expect(page.items).toEqual([{
      module: 'alarm',
      resource: 'alarm events',
      id: 'record-1',
      attributes: { code: 'R-1' },
    }]);
  });

  it('uses canonical detail and search endpoints without inventing alternate workbench routes', async () => {
    httpClient
      .mockResolvedValueOnce({ id: 'record/1', attributes: { code: 'R-1' } })
      .mockResolvedValueOnce({
        module: 'alarm',
        resource: 'alarm-events',
        page: 0,
        size: 25,
        totalElements: 0,
        totalPages: 0,
        items: [],
      });

    const detail = await fetchWorkbenchRecord('alarm', 'alarm-events', 'record/1');
    const search = await searchWorkbenchRecords('alarm', 'alarm-events', {
      query: 'high',
      filters: { severity: 'HIGH' },
      page: 0,
      size: 25,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/workbench/alarm/alarm-events/record%2F1',
    });
    expect(detail).toEqual({
      module: 'alarm',
      resource: 'alarm-events',
      id: 'record/1',
      attributes: { code: 'R-1' },
    });

    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/workbench/alarm/alarm-events/search',
      data: {
        query: 'high',
        filters: { severity: 'HIGH' },
        page: 0,
        size: 25,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
    });
    expect(search.items).toEqual([]);
  });
});
