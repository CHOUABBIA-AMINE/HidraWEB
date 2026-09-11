import { describe, expect, it, vi } from 'vitest';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { searchWorkbenchRecords } from '@/features/workbench/api/workbenchApi';

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: vi.fn() }));

describe('workbench API', () => {
  it('sends advanced search through the verified POST contract', async () => {
    vi.mocked(hidraHttpClient).mockResolvedValueOnce({} as never);

    await searchWorkbenchRecords('alarm', 'alarm-events', {
      query: 'pressure',
      filters: { severity: 'HIGH' },
      page: 0,
      size: 50,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });

    expect(hidraHttpClient).toHaveBeenCalledWith({
      method: 'POST',
      url: '/api/v1/workbench/alarm/alarm-events/search',
      data: {
        query: 'pressure',
        filters: { severity: 'HIGH' },
        page: 0,
        size: 50,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
    });
  });
});
