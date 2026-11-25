import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { LeakCandidateView, LeakCaseView, PageLeakCandidateView, PageLeakCaseView, LeakCandidateEvaluationResponse, LeakInvestigationView } from '@/api/generated/leak/model';

export interface LeakListParams {
  page?: number;
  size?: number;
}

export const leakQueryKeys = {
  all: ['hidra', 'leakdetection'] as const,
  candidates: (params: LeakListParams) => ['hidra', 'leakdetection', 'candidates', params] as const,
  candidate: (id: string) => ['hidra', 'leakdetection', 'candidates', id] as const,
  evidence: (id: string) => ['hidra', 'leakdetection', 'candidates', id, 'evidence'] as const,
  cases: (params: LeakListParams) => ['hidra', 'leakdetection', 'cases', params] as const,
  case: (id: string) => ['hidra', 'leakdetection', 'cases', id] as const,
  investigation: (id: string) => ['hidra', 'leakdetection', 'cases', id, 'investigation'] as const,
};

export function fetchLeakCandidates(params: LeakListParams, signal?: AbortSignal): Promise<PageLeakCandidateView> {
  return hidraHttpClient<PageLeakCandidateView>({ method: 'GET', url: '/api/v1/leakdetection/candidates', params, ...(signal ? { signal } : {}) });
}

export function fetchLeakCandidate(id: string, signal?: AbortSignal): Promise<LeakCandidateView> {
  return hidraHttpClient<LeakCandidateView>({ method: 'GET', url: `/api/v1/leakdetection/candidates/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}

export function fetchLeakCases(params: LeakListParams, signal?: AbortSignal): Promise<PageLeakCaseView> {
  return hidraHttpClient<PageLeakCaseView>({ method: 'GET', url: '/api/v1/leakdetection/cases', params, ...(signal ? { signal } : {}) });
}

export function fetchLeakCase(id: string, signal?: AbortSignal): Promise<LeakCaseView> {
  return hidraHttpClient<LeakCaseView>({ method: 'GET', url: `/api/v1/leakdetection/cases/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}

export function fetchLeakCandidateEvidence(id: string, signal?: AbortSignal): Promise<LeakCandidateEvaluationResponse> {
  return hidraHttpClient<LeakCandidateEvaluationResponse>({ method: 'GET', url: `/api/v1/leakdetection/candidates/${encodeURIComponent(id)}/evidence`, ...(signal ? { signal } : {}) });
}

export function fetchLeakInvestigation(id: string, signal?: AbortSignal): Promise<LeakInvestigationView> {
  return hidraHttpClient<LeakInvestigationView>({ method: 'GET', url: `/api/v1/leakdetection/cases/${encodeURIComponent(id)}/investigation`, ...(signal ? { signal } : {}) });
}
