import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { LeakCandidateView, LeakCaseView, PageLeakCandidateView, PageLeakCaseView } from '@/api/generated/leak/model';

export interface LeakListParams {
  page?: number;
  size?: number;
}

export const leakQueryKeys = {
  all: ['hidra', 'leakdetection'] as const,
  candidates: (params: LeakListParams) => ['hidra', 'leakdetection', 'candidates', params] as const,
  candidate: (id: string) => ['hidra', 'leakdetection', 'candidates', id] as const,
  cases: (params: LeakListParams) => ['hidra', 'leakdetection', 'cases', params] as const,
  case: (id: string) => ['hidra', 'leakdetection', 'cases', id] as const,
};

export function fetchLeakCandidates(params: LeakListParams): Promise<PageLeakCandidateView> {
  return hidraHttpClient<PageLeakCandidateView>({ method: 'GET', url: '/api/v1/leakdetection/candidates', params });
}

export function fetchLeakCandidate(id: string): Promise<LeakCandidateView> {
  return hidraHttpClient<LeakCandidateView>({ method: 'GET', url: `/api/v1/leakdetection/candidates/${encodeURIComponent(id)}` });
}

export function fetchLeakCases(params: LeakListParams): Promise<PageLeakCaseView> {
  return hidraHttpClient<PageLeakCaseView>({ method: 'GET', url: '/api/v1/leakdetection/cases', params });
}

export function fetchLeakCase(id: string): Promise<LeakCaseView> {
  return hidraHttpClient<LeakCaseView>({ method: 'GET', url: `/api/v1/leakdetection/cases/${encodeURIComponent(id)}` });
}
