import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { IncidentView, PageIncidentView } from '@/api/generated/incident/model';

export interface IncidentListParams {
  page?: number;
  size?: number;
}

export const incidentQueryKeys = {
  all: ['hidra', 'incident'] as const,
  list: (params: IncidentListParams) => ['hidra', 'incident', 'incidents', params] as const,
  detail: (id: string) => ['hidra', 'incident', 'incidents', id] as const,
};

export function fetchIncidents(params: IncidentListParams): Promise<PageIncidentView> {
  return hidraHttpClient<PageIncidentView>({ method: 'GET', url: '/api/v1/incident/incidents', params });
}

export function fetchIncident(id: string): Promise<IncidentView> {
  return hidraHttpClient<IncidentView>({ method: 'GET', url: `/api/v1/incident/incidents/${encodeURIComponent(id)}` });
}
