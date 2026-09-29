import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import {
  fetchDeviation,
  fetchDeviations,
  fetchLatestReading,
  fetchMonitoringRule,
  fetchMonitoringRules,
  fetchQualityCodes,
  fetchReadings,
  fetchReadingStates,
  fetchTrend,
} from '@/features/telemetry-monitoring/api/telemetryMonitoringApi';

describe('telemetry and monitoring API adapters', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses canonical telemetry reference and latest-reading endpoints', async () => {
    httpClient
      .mockResolvedValueOnce(['TRUSTED'])
      .mockResolvedValueOnce([{ id: 'GOOD', code: 'GOOD' }])
      .mockResolvedValueOnce({ id: 'reading-1', pointId: 'PT/1' });

    await fetchReadingStates();
    await fetchQualityCodes();
    await fetchLatestReading('PT/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/telemetry/reference/reading-states',
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/telemetry/reference/quality-codes',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/telemetry/points/PT%2F1/readings/latest',
    });
  });

  it('normalizes reading-history and trend query parameters without inventing defaults beyond the backend contract', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 0, size: 100, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce([]);

    await fetchReadings({
      pointId: 'PT-1',
      from: '2026-09-29T10:00:00Z',
      to: '2026-09-29T11:00:00Z',
      state: '',
      page: 0,
      size: 100,
    });
    await fetchTrend({
      pointId: 'PT-1',
      from: '2026-09-29T10:00:00Z',
      to: '2026-09-29T11:00:00Z',
      limit: 1000,
    });

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/telemetry/points/PT-1/readings',
      params: {
        from: '2026-09-29T10:00:00Z',
        to: '2026-09-29T11:00:00Z',
        page: 0,
        size: 100,
      },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/telemetry/points/PT-1/trend',
      params: {
        from: '2026-09-29T10:00:00Z',
        to: '2026-09-29T11:00:00Z',
        limit: 1000,
      },
    });
  });

  it('uses canonical monitoring list/detail endpoints and carries only supplied filters', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'rule/1' })
      .mockResolvedValueOnce({ content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'dev/1' });

    await fetchMonitoringRules({
      status: 'ACTIVE',
      topologyAssetId: '',
      telemetryPointId: 'PT-1',
      page: 0,
      size: 50,
    });
    await fetchMonitoringRule('rule/1');
    await fetchDeviations({
      planTargetId: 'target-1',
      status: 'OPEN',
      severity: 'HIGH',
      topologyAssetId: 'asset-1',
      telemetryPointId: 'PT-1',
      from: '2026-09-29T10:00:00Z',
      to: '2026-09-29T11:00:00Z',
      page: 0,
      size: 50,
    });
    await fetchDeviation('dev/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/monitoring/rules',
      params: {
        status: 'ACTIVE',
        telemetryPointId: 'PT-1',
        page: 0,
        size: 50,
      },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/monitoring/rules/rule%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/monitoring/deviations',
      params: {
        planTargetId: 'target-1',
        status: 'OPEN',
        severity: 'HIGH',
        topologyAssetId: 'asset-1',
        telemetryPointId: 'PT-1',
        from: '2026-09-29T10:00:00Z',
        to: '2026-09-29T11:00:00Z',
        page: 0,
        size: 50,
      },
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/monitoring/deviations/dev%2F1',
    });
  });
});
