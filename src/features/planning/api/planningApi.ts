import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  OperationalPlanView,
  PageOperationalPlanView,
  PagePlanningPeriodView,
  PlanningPeriodView,
} from '@/api/generated/planning/model';

export interface PlanningPageParams {
  page?: number;
  size?: number;
}

export const planningQueryKeys = {
  all: ['hidra', 'planning'] as const,
  periods: (params: PlanningPageParams) => ['hidra', 'planning', 'periods', params] as const,
  period: (id: string) => ['hidra', 'planning', 'periods', id] as const,
  plans: (params: PlanningPageParams) => ['hidra', 'planning', 'operational-plans', params] as const,
  plan: (id: string) => ['hidra', 'planning', 'operational-plans', id] as const,
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
