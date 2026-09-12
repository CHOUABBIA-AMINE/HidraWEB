import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  ExecutePlanningApprovalActionRequest,
  OperationalPlanView,
  PageOperationalPlanView,
  PagePlanRevisionView,
  PagePlanningPeriodView,
  PlanRevisionView,
  PlanningApprovalExecutionResponse,
  PlanningApprovalResponse,
  PlanningPeriodView,
} from '@/api/generated/planning/model';

export interface PlanningPageParams { page?: number; size?: number; }
export interface RevisionListParams extends PlanningPageParams { planId: string; }

export const planningQueryKeys = {
  all: ['hidra', 'planning'] as const,
  periods: (params: PlanningPageParams) => ['hidra', 'planning', 'periods', params] as const,
  period: (id: string) => ['hidra', 'planning', 'periods', id] as const,
  plans: (params: PlanningPageParams) => ['hidra', 'planning', 'operational-plans', params] as const,
  plan: (id: string) => ['hidra', 'planning', 'operational-plans', id] as const,
  revisions: (params: RevisionListParams) => ['hidra', 'planning', 'revisions', params] as const,
  revision: (id: string) => ['hidra', 'planning', 'revisions', id] as const,
  approval: (revisionId: string) => ['hidra', 'planning', 'revisions', revisionId, 'approval'] as const,
};

export function fetchPlanningPeriods(params: PlanningPageParams): Promise<PagePlanningPeriodView> {
  return hidraHttpClient<PagePlanningPeriodView>({ method: 'GET', url: '/api/v1/planning/periods', params });
}
export function fetchPlanningPeriod(id: string): Promise<PlanningPeriodView> {
  return hidraHttpClient<PlanningPeriodView>({ method: 'GET', url: `/api/v1/planning/periods/${encodeURIComponent(id)}` });
}
export function fetchOperationalPlans(params: PlanningPageParams): Promise<PageOperationalPlanView> {
  return hidraHttpClient<PageOperationalPlanView>({ method: 'GET', url: '/api/v1/planning/operational-plans', params });
}
export function fetchOperationalPlan(id: string): Promise<OperationalPlanView> {
  return hidraHttpClient<OperationalPlanView>({ method: 'GET', url: `/api/v1/planning/operational-plans/${encodeURIComponent(id)}` });
}
export function fetchPlanRevisions(params: RevisionListParams): Promise<PagePlanRevisionView> {
  return hidraHttpClient<PagePlanRevisionView>({ method: 'GET', url: '/api/v1/planning/revisions', params });
}
export function fetchPlanRevision(id: string): Promise<PlanRevisionView> {
  return hidraHttpClient<PlanRevisionView>({ method: 'GET', url: `/api/v1/planning/revisions/${encodeURIComponent(id)}` });
}
export function fetchPlanningApproval(revisionId: string): Promise<PlanningApprovalResponse> {
  return hidraHttpClient<PlanningApprovalResponse>({ method: 'GET', url: `/api/v1/planning/revisions/${encodeURIComponent(revisionId)}/approval` });
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
