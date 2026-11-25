import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { CapaView, HseCaseView, PageCapaView, PageHseCaseView, CaseView, ScopedHseCapaView, ScopedHsePageCaseView, ScopedHsePageScopedHseCapaView, ScopedHsePageEventView } from '@/api/generated/hse/model';

export interface HseListParams {
  page?: number;
  size?: number;
}

export interface HseFacilityScope { companyId: string; facilityId: string; }
export interface ScopedCaseListParams extends HseListParams { caseNumber?: string; }
export interface ScopedCapaListParams extends HseListParams { actionNumber?: string; }

export const hseQueryKeys = {
  all: ['hidra', 'hse'] as const,
  cases: (params: HseListParams) => ['hidra', 'hse', 'cases', params] as const,
  case: (id: string) => ['hidra', 'hse', 'cases', id] as const,
  capas: (params: HseListParams) => ['hidra', 'hse', 'capas', params] as const,
  capa: (id: string) => ['hidra', 'hse', 'capas', id] as const,
  scopedCases: (scope: HseFacilityScope, params: ScopedCaseListParams) => ['hidra', 'hse', 'scoped', scope, 'cases', params] as const,
  scopedCase: (scope: HseFacilityScope, caseId: string) => ['hidra', 'hse', 'scoped', scope, 'cases', caseId] as const,
  scopedCapas: (scope: HseFacilityScope, caseId: string, params: ScopedCapaListParams) => ['hidra', 'hse', 'scoped', scope, 'cases', caseId, 'capas', params] as const,
  scopedCapa: (scope: HseFacilityScope, caseId: string, capaId: string) => ['hidra', 'hse', 'scoped', scope, 'cases', caseId, 'capas', capaId] as const,
  scopedHistory: (scope: HseFacilityScope, caseId: string, params: HseListParams) => ['hidra', 'hse', 'scoped', scope, 'cases', caseId, 'history', params] as const,
};

export function fetchHseCases(params: HseListParams, signal?: AbortSignal): Promise<PageHseCaseView> {
  return hidraHttpClient<PageHseCaseView>({ method: 'GET', url: '/api/v1/hse/cases', params, ...(signal ? { signal } : {}) });
}

export function fetchHseCase(id: string, signal?: AbortSignal): Promise<HseCaseView> {
  return hidraHttpClient<HseCaseView>({ method: 'GET', url: `/api/v1/hse/cases/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}

export function fetchCapas(params: HseListParams, signal?: AbortSignal): Promise<PageCapaView> {
  return hidraHttpClient<PageCapaView>({ method: 'GET', url: '/api/v1/hse/capas', params, ...(signal ? { signal } : {}) });
}

export function fetchCapa(id: string, signal?: AbortSignal): Promise<CapaView> {
  return hidraHttpClient<CapaView>({ method: 'GET', url: `/api/v1/hse/capas/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}

function scopedCasesPath({ companyId, facilityId }: HseFacilityScope): string {
  if (!companyId || !facilityId) throw new Error('An authorized facility context is required.');
  return `/api/v1/hse/companies/${encodeURIComponent(companyId)}/facilities/${encodeURIComponent(facilityId)}/cases`;
}

function scopedCasePath(scope: HseFacilityScope, caseId: string): string {
  if (!caseId) throw new Error('An authorized HSE case is required.');
  return `${scopedCasesPath(scope)}/${encodeURIComponent(caseId)}`;
}

export function fetchScopedHseCases(scope: HseFacilityScope, params: ScopedCaseListParams, signal?: AbortSignal): Promise<ScopedHsePageCaseView> {
  return hidraHttpClient<ScopedHsePageCaseView>({ method: 'GET', url: scopedCasesPath(scope), params, ...(signal ? { signal } : {}) });
}
export function fetchScopedHseCase(scope: HseFacilityScope, caseId: string, signal?: AbortSignal): Promise<CaseView> {
  return hidraHttpClient<CaseView>({ method: 'GET', url: scopedCasePath(scope, caseId), ...(signal ? { signal } : {}) });
}
export function fetchScopedHseCapas(scope: HseFacilityScope, caseId: string, params: ScopedCapaListParams, signal?: AbortSignal): Promise<ScopedHsePageScopedHseCapaView> {
  return hidraHttpClient<ScopedHsePageScopedHseCapaView>({ method: 'GET', url: `${scopedCasePath(scope, caseId)}/capas`, params, ...(signal ? { signal } : {}) });
}
export function fetchScopedHseCapa(scope: HseFacilityScope, caseId: string, capaId: string, signal?: AbortSignal): Promise<ScopedHseCapaView> {
  if (!capaId) throw new Error('An authorized CAPA is required.');
  return hidraHttpClient<ScopedHseCapaView>({ method: 'GET', url: `${scopedCasePath(scope, caseId)}/capas/${encodeURIComponent(capaId)}`, ...(signal ? { signal } : {}) });
}
export function fetchScopedHseHistory(scope: HseFacilityScope, caseId: string, params: HseListParams, signal?: AbortSignal): Promise<ScopedHsePageEventView> {
  return hidraHttpClient<ScopedHsePageEventView>({ method: 'GET', url: `${scopedCasePath(scope, caseId)}/history`, params, ...(signal ? { signal } : {}) });
}
