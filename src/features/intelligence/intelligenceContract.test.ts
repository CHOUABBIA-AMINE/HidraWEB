import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import {
  fetchWorkbenchRecord,
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
} from '@/features/workbench/api/workbenchApi';

describe('intelligence workspace backend contract', () => {
  beforeEach(() => httpClient.mockReset());

  it.each(['risk', 'analytics', 'simulation', 'reporting'])(
    'discovers %s records only through the generic HidraAPI workbench',
    async (module) => {
      httpClient
        .mockResolvedValueOnce([{ module, resource: 'records', entityName: 'Entity', javaType: 'Entity', tableName: 'table', idField: 'id', searchableFields: [] }])
        .mockResolvedValueOnce({ module, resource: 'records', page: 0, size: 25, totalElements: 0, totalPages: 0, items: [] })
        .mockResolvedValueOnce({ module, resource: 'records', id: 'record/1', attributes: {} });

      await fetchWorkbenchResources(module);
      await fetchWorkbenchRecords({ module, resource: 'records', page: 0, size: 25 });
      await fetchWorkbenchRecord(module, 'records', 'record/1');

      expect(httpClient).toHaveBeenNthCalledWith(1, {
        method: 'GET',
        url: `/api/v1/workbench/${module}/resources`,
      });
      expect(httpClient).toHaveBeenNthCalledWith(2, {
        method: 'GET',
        url: `/api/v1/workbench/${module}/records`,
        params: { page: 0, size: 25 },
      });
      expect(httpClient).toHaveBeenNthCalledWith(3, {
        method: 'GET',
        url: `/api/v1/workbench/${module}/records/record%2F1`,
      });

      httpClient.mockReset();
    },
  );
});
