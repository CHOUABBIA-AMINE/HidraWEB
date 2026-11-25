import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  AcknowledgeAlarmRequest,
  AlarmView,
  AlarmSuppressionDto,
  AlarmSuppressionPageDto,
  CloseAlarmRequest,
  CreateSuppressionRequest,
  PageAlarmView,
  ShelveAlarmRequest,
  ShelvingView,
} from '@/api/generated/alarm/model';

export interface AlarmSuppressionListParams {
  suppressionId?: string;
  scopeType?: string;
  scopeReferenceId?: string;
  alarmId?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface AlarmListParams {
  view?: string;
  state?: string;
  severityId?: string;
  topologyAssetId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

function compactParams(params: AlarmListParams): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
}

export const alarmQueryKeys = {
  all: ['hidra', 'alarm'] as const,
  list: (params: AlarmListParams) => ['hidra', 'alarm', 'alarms', params] as const,
  detail: (id: string) => ['hidra', 'alarm', 'alarms', id] as const,
  shelvings: (id: string) => ['hidra', 'alarm', 'alarms', id, 'shelvings'] as const,
  suppressions: (params: AlarmSuppressionListParams) => ['hidra', 'alarm', 'suppressions', params] as const,
};

export function fetchAlarms(params: AlarmListParams): Promise<PageAlarmView> {
  return hidraHttpClient<PageAlarmView>({ method: 'GET', url: '/api/v1/alarm/alarms', params: compactParams(params) });
}

export function fetchAlarm(id: string, signal?: AbortSignal): Promise<AlarmView> {
  return hidraHttpClient<AlarmView>({ method: 'GET', url: `/api/v1/alarm/alarms/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}

export function fetchShelvings(id: string): Promise<ShelvingView[]> {
  return hidraHttpClient<ShelvingView[]>({ method: 'GET', url: `/api/v1/alarm/alarms/${encodeURIComponent(id)}/shelvings` });
}

export function fetchSuppressions(params: AlarmSuppressionListParams): Promise<AlarmSuppressionPageDto> {
  return hidraHttpClient<AlarmSuppressionPageDto>({ method: 'GET', url: '/api/v1/alarm/suppressions', params: compactParams(params) });
}

export function createSuppression(request: CreateSuppressionRequest, correlationId?: string): Promise<AlarmSuppressionDto> {
  return hidraHttpClient<AlarmSuppressionDto>({ method: 'POST', url: '/api/v1/alarm/suppressions', data: request, headers: correlationId ? { 'X-Correlation-Id': correlationId } : undefined });
}

export function releaseSuppression(suppressionId: string, correlationId?: string): Promise<AlarmSuppressionDto> {
  return hidraHttpClient<AlarmSuppressionDto>({ method: 'POST', url: `/api/v1/alarm/suppressions/${encodeURIComponent(suppressionId)}/release`, headers: correlationId ? { 'X-Correlation-Id': correlationId } : undefined });
}

export function acknowledgeAlarm(request: AcknowledgeAlarmRequest): Promise<string> {
  return hidraHttpClient<string>({ method: 'POST', url: '/api/v1/alarm/alarms/acknowledgements', data: request });
}

export function closeAlarm(request: CloseAlarmRequest): Promise<string> {
  return hidraHttpClient<string>({ method: 'POST', url: '/api/v1/alarm/alarms/closures', data: request });
}

export function shelveAlarm(id: string, request: ShelveAlarmRequest, correlationId?: string): Promise<string> {
  return hidraHttpClient<string>({
    method: 'POST',
    url: `/api/v1/alarm/alarms/${encodeURIComponent(id)}/shelvings`,
    data: request,
    headers: correlationId ? { 'X-Correlation-Id': correlationId } : undefined,
  });
}

export function unshelveAlarm(id: string, shelvingId: string, correlationId?: string): Promise<string> {
  return hidraHttpClient<string>({
    method: 'POST',
    url: `/api/v1/alarm/alarms/${encodeURIComponent(id)}/shelvings/${encodeURIComponent(shelvingId)}/unshelve`,
    headers: correlationId ? { 'X-Correlation-Id': correlationId } : undefined,
  });
}

/** One command, followed by a fresh protected read. Never replay a committed POST
 * just because the subsequent read is denied or unavailable. */
export class AlarmAcknowledgementReadbackError extends Error {
  constructor() {
    super('Acknowledgement was submitted, but persisted readback could not be confirmed. Refresh before another action.');
    this.name = 'AlarmAcknowledgementReadbackError';
  }
}

export async function acknowledgeAlarmWithReadback(request: AcknowledgeAlarmRequest): Promise<string> {
  if (!request.alarmId) throw new Error('Select an authorized alarm before acknowledgement.');
  const receipt = await acknowledgeAlarm(request);
  try {
    const detail = await fetchAlarm(request.alarmId);
    if (!receipt || detail.id !== request.alarmId || !detail.acknowledgedAt || !detail.acknowledgedByActorId) {
      throw new AlarmAcknowledgementReadbackError();
    }
  } catch {
    // Never replay the submitted command. The console retires this selection.
    throw new AlarmAcknowledgementReadbackError();
  }
  return receipt;
}
