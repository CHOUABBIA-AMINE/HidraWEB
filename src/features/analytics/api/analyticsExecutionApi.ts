import type {
  AnalyticsDatasetResponse,
  AnalyticsInsightResponse,
  AnalyticsProjectionRunResponse,
  CreateAnalyticsDatasetRequest,
  CreateAnalyticsInsightRequest,
  MetricEvaluationRunResponse,
  RunMetricEvaluationRequest,
  RunProjectionRequest,
} from '@/api/generated/analytics/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export function createAnalyticsDataset(request: CreateAnalyticsDatasetRequest): Promise<AnalyticsDatasetResponse> {
  return hidraHttpClient<AnalyticsDatasetResponse>({ method: 'POST', url: '/api/v1/analytics/datasets', data: request });
}

export function createAnalyticsInsight(request: CreateAnalyticsInsightRequest): Promise<AnalyticsInsightResponse> {
  return hidraHttpClient<AnalyticsInsightResponse>({ method: 'POST', url: '/api/v1/analytics/insights', data: request });
}

export function runMetricEvaluation(request: RunMetricEvaluationRequest): Promise<MetricEvaluationRunResponse> {
  return hidraHttpClient<MetricEvaluationRunResponse>({ method: 'POST', url: '/api/v1/analytics/metrics/evaluations', data: request });
}

export function runProjection(request: RunProjectionRequest): Promise<AnalyticsProjectionRunResponse> {
  return hidraHttpClient<AnalyticsProjectionRunResponse>({ method: 'POST', url: '/api/v1/analytics/projections/runs', data: request });
}
