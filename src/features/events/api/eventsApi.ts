import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { IncidentView, PageIncidentView } from '@/api/generated/events/model';

export interface IncidentListParams {
  page?: number;
  size?: number;
}

export const eventsQueryKeys = {
  incidents: (params: IncidentListParams) => ['hidra', 'events', 'incident', 'incidents', params] as const,
  incident: (id: string) => ['hidra', 'events', 'incident', 'incidents', id] as const,
};

export function fetchIncidents(params: IncidentListParams): Promise<PageIncidentView> {
  return hidraHttpClient<PageIncidentView>({
    method: 'GET',
    url: '/api/v1/incident/incidents',
    params: Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)),
  });
}

export function fetchIncident(id: string): Promise<IncidentView> {
  return hidraHttpClient<IncidentView>({
    method: 'GET',
    url: `/api/v1/incident/incidents/${encodeURIComponent(id)}`,
  });
}
