import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { IncidentView, PageIncidentView, IncidentEscalationReceiptResponse, IncidentInvestigationView } from '@/api/generated/incident/model';

export interface IncidentListParams {
  page?: number;
  size?: number;
}

export const incidentQueryKeys = {
  all: ['hidra', 'incident'] as const,
  list: (params: IncidentListParams) => ['hidra', 'incident', 'incidents', params] as const,
  detail: (id: string) => ['hidra', 'incident', 'incidents', id] as const,
  timeline: (id: string) => ['hidra', 'incident', 'incidents', id, 'timeline'] as const,
  investigation: (id: string) => ['hidra', 'incident', 'incidents', id, 'investigation'] as const,
  escalation: (id: string) => ['hidra', 'incident', 'incidents', id, 'escalation'] as const,
};

export function fetchIncidents(params: IncidentListParams, signal?: AbortSignal): Promise<PageIncidentView> {
  return hidraHttpClient<PageIncidentView>({ method: 'GET', url: '/api/v1/incident/incidents', params, ...(signal ? { signal } : {}) });
}

export function fetchIncident(id: string, signal?: AbortSignal): Promise<IncidentView> {
  return hidraHttpClient<IncidentView>({ method: 'GET', url: `/api/v1/incident/incidents/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}

export function fetchIncidentTimeline(id: string, signal?: AbortSignal): Promise<IncidentEscalationReceiptResponse[]> {
  return hidraHttpClient<IncidentEscalationReceiptResponse[]>({ method: 'GET', url: `/api/v1/incident/incidents/${encodeURIComponent(id)}/timeline`, ...(signal ? { signal } : {}) });
}

export function fetchIncidentInvestigation(id: string, signal?: AbortSignal): Promise<IncidentInvestigationView> {
  return hidraHttpClient<IncidentInvestigationView>({ method: 'GET', url: `/api/v1/incident/incidents/${encodeURIComponent(id)}/investigation`, ...(signal ? { signal } : {}) });
}

export function fetchIncidentEscalation(id: string, signal?: AbortSignal): Promise<IncidentEscalationReceiptResponse> {
  return hidraHttpClient<IncidentEscalationReceiptResponse>({ method: 'GET', url: `/api/v1/incident/incidents/${encodeURIComponent(id)}/escalation`, ...(signal ? { signal } : {}) });
}
