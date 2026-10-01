import type { CreateAnalyticsDatasetRequest, RunProjectionRequest } from '@/api/generated/analytics/model';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import {
  createAnalyticsDataset,
  createAnalyticsInsight,
  runMetricEvaluation,
  runProjection,
} from '@/features/analytics/api/analyticsExecutionApi';

describe('analytics execution API', () => {
  beforeEach(() => httpClient.mockReset());

  it('uses the canonical analytics execution endpoints', async () => {
    httpClient.mockResolvedValue({});

    const dataset: CreateAnalyticsDatasetRequest = { code: 'OPS-TS', datasetType: 'TIME_SERIES', refreshMode: 'MANUAL' };
    const insight = { title: 'Pressure deviation', confidenceScore: 0.91 };
    const metric = { metricDefinitionVersionId: 'metric-v1', scopeType: 'PIPELINE', scopeId: 'pipe-1' };
    const projection: RunProjectionRequest = { projectionDefinitionId: 'proj-1', runMode: 'MANUAL_RECOMPUTE' };

    await createAnalyticsDataset(dataset);
    await createAnalyticsInsight(insight);
    await runMetricEvaluation(metric);
    await runProjection(projection);

    expect(httpClient).toHaveBeenNthCalledWith(1, { method: 'POST', url: '/api/v1/analytics/datasets', data: dataset });
    expect(httpClient).toHaveBeenNthCalledWith(2, { method: 'POST', url: '/api/v1/analytics/insights', data: insight });
    expect(httpClient).toHaveBeenNthCalledWith(3, { method: 'POST', url: '/api/v1/analytics/metrics/evaluations', data: metric });
    expect(httpClient).toHaveBeenNthCalledWith(4, { method: 'POST', url: '/api/v1/analytics/projections/runs', data: projection });
  });
});
