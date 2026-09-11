import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { CapaView, HseCaseView, PageCapaView, PageHseCaseView } from '@/api/generated/hse/model';

export interface HseListParams {
  page?: number;
  size?: number;
}

export const hseQueryKeys = {
  all: ['hidra', 'hse'] as const,
  cases: (params: HseListParams) => ['hidra', 'hse', 'cases', params] as const,
  case: (id: string) => ['hidra', 'hse', 'cases', id] as const,
  capas: (params: HseListParams) => ['hidra', 'hse', 'capas', params] as const,
  capa: (id: string) => ['hidra', 'hse', 'capas', id] as const,
};

export function fetchHseCases(params: HseListParams): Promise<PageHseCaseView> {
  return hidraHttpClient<PageHseCaseView>({ method: 'GET', url: '/api/v1/hse/cases', params });
}

export function fetchHseCase(id: string): Promise<HseCaseView> {
  return hidraHttpClient<HseCaseView>({ method: 'GET', url: `/api/v1/hse/cases/${encodeURIComponent(id)}` });
}

export function fetchCapas(params: HseListParams): Promise<PageCapaView> {
  return hidraHttpClient<PageCapaView>({ method: 'GET', url: '/api/v1/hse/capas', params });
}

export function fetchCapa(id: string): Promise<CapaView> {
  return hidraHttpClient<CapaView>({ method: 'GET', url: `/api/v1/hse/capas/${encodeURIComponent(id)}` });
}
