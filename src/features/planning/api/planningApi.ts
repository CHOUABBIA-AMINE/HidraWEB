import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  ExecutePlanningApprovalActionRequest,
  OperationalPlanView,
  PageOperationalPlanView,
  PagePlanRevisionView,
  PagePlanTargetView,
  PagePlanningPeriodView,
  PlanRevisionView,
  PlanTargetView,
  PlanningApprovalExecutionResponse,
  PlanningApprovalResponse,
  PlanningPeriodView,
  SubmitPlanningRevisionRequest,
  SubmitPlanningRevisionResponse,
  Request as UpdatePlanRevisionRequest,
  Response as UpdatePlanRevisionResponse,
} from '@/api/generated/planning/model';

export interface PlanningPageParams { page?: number; size?: number; }
export interface RevisionListParams extends PlanningPageParams { planId: string; }
export interface TargetListParams extends PlanningPageParams { revisionId: string; }

export const planningQueryKeys = {
  all: ['hidra', 'planning'] as const,
  periods: (params: PlanningPageParams) => ['hidra', 'planning', 'periods', params] as const,
  period: (id: string) => ['hidra', 'planning', 'periods', id] as const,
  plans: (params: PlanningPageParams) => ['hidra', 'planning', 'operational-plans', params] as const,
  plan: (id: string) => ['hidra', 'planning', 'operational-plans', id] as const,
  revisions: (params: RevisionListParams) => ['hidra', 'planning', 'revisions', params] as const,
  revision: (id: string) => ['hidra', 'planning', 'revisions', id] as const,
  targets: (params: TargetListParams) => ['hidra', 'planning', 'targets', params] as const,
  target: (id: string) => ['hidra', 'planning', 'targets', id] as const,
  approval: (revisionId: string) => ['hidra', 'planning', 'revisions', revisionId, 'approval'] as const,
};

export function fetchPlanningPeriods(params: PlanningPageParams, signal?: AbortSignal): Promise<PagePlanningPeriodView> {
  return hidraHttpClient<PagePlanningPeriodView>({ method: 'GET', url: '/api/v1/planning/periods', params, ...(signal ? { signal } : {}) });
}
export function fetchPlanningPeriod(id: string, signal?: AbortSignal): Promise<PlanningPeriodView> {
  return hidraHttpClient<PlanningPeriodView>({ method: 'GET', url: `/api/v1/planning/periods/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}
export function fetchOperationalPlans(params: PlanningPageParams, signal?: AbortSignal): Promise<PageOperationalPlanView> {
  return hidraHttpClient<PageOperationalPlanView>({ method: 'GET', url: '/api/v1/planning/operational-plans', params, ...(signal ? { signal } : {}) });
}
export function fetchOperationalPlan(id: string, signal?: AbortSignal): Promise<OperationalPlanView> {
  return hidraHttpClient<OperationalPlanView>({ method: 'GET', url: `/api/v1/planning/operational-plans/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}
export function fetchPlanRevisions(params: RevisionListParams, signal?: AbortSignal): Promise<PagePlanRevisionView> {
  return hidraHttpClient<PagePlanRevisionView>({ method: 'GET', url: '/api/v1/planning/revisions', params, ...(signal ? { signal } : {}) });
}
export function fetchPlanRevision(id: string, signal?: AbortSignal): Promise<PlanRevisionView> {
  return hidraHttpClient<PlanRevisionView>({ method: 'GET', url: `/api/v1/planning/revisions/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}
export function updatePlanRevision(id: string, request: UpdatePlanRevisionRequest): Promise<UpdatePlanRevisionResponse> {
  return hidraHttpClient<UpdatePlanRevisionResponse>({
    method: 'PATCH',
    url: `/api/v1/planning/revisions/${encodeURIComponent(id)}`,
    data: request,
  });
}
export function fetchPlanTargets(params: TargetListParams, signal?: AbortSignal): Promise<PagePlanTargetView> {
  return hidraHttpClient<PagePlanTargetView>({ method: 'GET', url: '/api/v1/planning/targets', params, ...(signal ? { signal } : {}) });
}
export function fetchPlanTarget(id: string, signal?: AbortSignal): Promise<PlanTargetView> {
  return hidraHttpClient<PlanTargetView>({ method: 'GET', url: `/api/v1/planning/targets/${encodeURIComponent(id)}`, ...(signal ? { signal } : {}) });
}
export function fetchPlanningApproval(revisionId: string, signal?: AbortSignal): Promise<PlanningApprovalResponse> {
  return hidraHttpClient<PlanningApprovalResponse>({ method: 'GET', url: `/api/v1/planning/revisions/${encodeURIComponent(revisionId)}/approval`, ...(signal ? { signal } : {}) });
}
export function executePlanningApprovalAction(
  revisionId: string,
  transitionId: string,
  request: ExecutePlanningApprovalActionRequest,
): Promise<PlanningApprovalExecutionResponse> {
  return hidraHttpClient<PlanningApprovalExecutionResponse>({
    method: 'POST',
    url: `/api/v1/planning/revisions/${encodeURIComponent(revisionId)}/approval/actions/${encodeURIComponent(transitionId)}/execute`,
    data: request,
  });
}

/** A single explicit submission. UI orchestration must freshly read protected
 * owner state and never replay the POST after a failed readback or conflict. */
export function submitPlanningRevision(revisionId: string, request: SubmitPlanningRevisionRequest): Promise<SubmitPlanningRevisionResponse> {
  return hidraHttpClient<SubmitPlanningRevisionResponse>({
    method: 'POST', url: `/api/v1/planning/revisions/${encodeURIComponent(revisionId)}/submit`, data: request,
  });
}
