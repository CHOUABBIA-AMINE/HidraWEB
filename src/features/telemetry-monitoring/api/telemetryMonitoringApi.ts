import type {
  DeviationView,
  MonitoringRuleView,
  PageDeviationView,
  PageMonitoringRuleView,
  PageReadingView,
  QualityCodeView,
  ReadingView,
} from '@/api/generated/telemetry-monitoring/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export interface ReadingHistoryParams {
  pointId: string;
  from?: string;
  to?: string;
  state?: string;
  page?: number;
  size?: number;
}

export interface TrendParams {
  pointId: string;
  from?: string;
  to?: string;
  limit?: number;
}

export interface MonitoringRuleParams {
  status?: string;
  topologyAssetId?: string;
  telemetryPointId?: string;
  page?: number;
  size?: number;
}

export interface DeviationParams extends MonitoringRuleParams {
  severity?: string;
  from?: string;
  to?: string;
}

function compactParams<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
}

export const telemetryMonitoringQueryKeys = {
  states: ['hidra', 'telemetry', 'reference', 'reading-states'] as const,
  qualityCodes: ['hidra', 'telemetry', 'reference', 'quality-codes'] as const,
  latest: (pointId: string) => ['hidra', 'telemetry', 'points', pointId, 'latest'] as const,
  readings: (params: ReadingHistoryParams) => ['hidra', 'telemetry', 'readings', params] as const,
  trend: (params: TrendParams) => ['hidra', 'telemetry', 'trend', params] as const,
  rules: (params: MonitoringRuleParams) => ['hidra', 'monitoring', 'rules', params] as const,
  rule: (id: string) => ['hidra', 'monitoring', 'rules', id] as const,
  deviations: (params: DeviationParams) => ['hidra', 'monitoring', 'deviations', params] as const,
  deviation: (id: string) => ['hidra', 'monitoring', 'deviations', id] as const,
};

export function fetchReadingStates(): Promise<string[]> {
  return hidraHttpClient<string[]>({ method: 'GET', url: '/api/v1/telemetry/reference/reading-states' });
}

export function fetchQualityCodes(): Promise<QualityCodeView[]> {
  return hidraHttpClient<QualityCodeView[]>({ method: 'GET', url: '/api/v1/telemetry/reference/quality-codes' });
}

export function fetchLatestReading(pointId: string): Promise<ReadingView> {
  return hidraHttpClient<ReadingView>({ method: 'GET', url: `/api/v1/telemetry/points/${encodeURIComponent(pointId)}/readings/latest` });
}

export function fetchReadings(params: ReadingHistoryParams): Promise<PageReadingView> {
  const { pointId, ...query } = params;
  return hidraHttpClient<PageReadingView>({
    method: 'GET',
    url: `/api/v1/telemetry/points/${encodeURIComponent(pointId)}/readings`,
    params: compactParams(query),
  });
}

export function fetchTrend(params: TrendParams): Promise<ReadingView[]> {
  const { pointId, ...query } = params;
  return hidraHttpClient<ReadingView[]>({
    method: 'GET',
    url: `/api/v1/telemetry/points/${encodeURIComponent(pointId)}/trend`,
    params: compactParams(query),
  });
}

export function fetchMonitoringRules(params: MonitoringRuleParams): Promise<PageMonitoringRuleView> {
  return hidraHttpClient<PageMonitoringRuleView>({ method: 'GET', url: '/api/v1/monitoring/rules', params: compactParams(params) });
}

export function fetchMonitoringRule(id: string): Promise<MonitoringRuleView> {
  return hidraHttpClient<MonitoringRuleView>({ method: 'GET', url: `/api/v1/monitoring/rules/${encodeURIComponent(id)}` });
}

export function fetchDeviations(params: DeviationParams): Promise<PageDeviationView> {
  return hidraHttpClient<PageDeviationView>({ method: 'GET', url: '/api/v1/monitoring/deviations', params: compactParams(params) });
}

export function fetchDeviation(id: string): Promise<DeviationView> {
  return hidraHttpClient<DeviationView>({ method: 'GET', url: `/api/v1/monitoring/deviations/${encodeURIComponent(id)}` });
}
