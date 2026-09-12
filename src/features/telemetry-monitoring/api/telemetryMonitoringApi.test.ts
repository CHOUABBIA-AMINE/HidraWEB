import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import {
  fetchDeviations,
  fetchLatestReading,
  fetchMonitoringRules,
  fetchQualityCodes,
  fetchReadings,
  fetchReadingStates,
  fetchTrend,
} from '@/features/telemetry-monitoring/api/telemetryMonitoringApi';

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: vi.fn(async () => ({})) }));

const client = vi.mocked(hidraHttpClient);

describe('HWEB-006 telemetry monitoring API boundary', () => {
  beforeEach(() => client.mockClear());

  it('uses only the published telemetry and monitoring routes', async () => {
    await fetchReadingStates();
    await fetchQualityCodes();
    await fetchLatestReading('PT/A');
    await fetchReadings({ pointId: 'PT/A', state: 'TRUSTED', page: 0, size: 50 });
    await fetchTrend({ pointId: 'PT/A', limit: 100 });
    await fetchMonitoringRules({ page: 0, size: 50 });
    await fetchDeviations({ planTargetId: 'target-1', severity: 'HIGH', page: 0, size: 50 });

    expect(client).toHaveBeenNthCalledWith(1, { method: 'GET', url: '/api/v1/telemetry/reference/reading-states' });
    expect(client).toHaveBeenNthCalledWith(2, { method: 'GET', url: '/api/v1/telemetry/reference/quality-codes' });
    expect(client).toHaveBeenNthCalledWith(3, { method: 'GET', url: '/api/v1/telemetry/points/PT%2FA/readings/latest' });
    expect(client).toHaveBeenNthCalledWith(4, { method: 'GET', url: '/api/v1/telemetry/points/PT%2FA/readings', params: { state: 'TRUSTED', page: 0, size: 50 } });
    expect(client).toHaveBeenNthCalledWith(5, { method: 'GET', url: '/api/v1/telemetry/points/PT%2FA/trend', params: { limit: 100 } });
    expect(client).toHaveBeenNthCalledWith(6, { method: 'GET', url: '/api/v1/monitoring/rules', params: { page: 0, size: 50 } });
    expect(client).toHaveBeenNthCalledWith(7, { method: 'GET', url: '/api/v1/monitoring/deviations', params: { planTargetId: 'target-1', severity: 'HIGH', page: 0, size: 50 } });
  });
});
