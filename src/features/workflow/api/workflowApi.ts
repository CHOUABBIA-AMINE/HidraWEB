import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { AvailableActionView, InstanceView, PageTaskView, TaskView, TimelineEntry } from '@/api/generated/workflow/model';

export interface TaskInboxParams {
  view?: string;
  page?: number;
  size?: number;
}

function compactParams(params: TaskInboxParams): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''));
}

export const workflowQueryKeys = {
  tasks: (params: TaskInboxParams) => ['hidra', 'workflow', 'tasks', params] as const,
  task: (id: string) => ['hidra', 'workflow', 'tasks', id] as const,
  actions: (id: string) => ['hidra', 'workflow', 'tasks', id, 'available-actions'] as const,
  instance: (id: string) => ['hidra', 'workflow', 'instances', id] as const,
  timeline: (id: string) => ['hidra', 'workflow', 'instances', id, 'timeline'] as const,
};

export function fetchTasks(params: TaskInboxParams): Promise<PageTaskView> {
  return hidraHttpClient<PageTaskView>({ method: 'GET', url: '/api/v1/workflow/tasks', params: compactParams(params) });
}

export function fetchTask(id: string): Promise<TaskView> {
  return hidraHttpClient<TaskView>({ method: 'GET', url: `/api/v1/workflow/tasks/${encodeURIComponent(id)}` });
}

export function fetchAvailableActions(id: string): Promise<AvailableActionView[]> {
  return hidraHttpClient<AvailableActionView[]>({ method: 'GET', url: `/api/v1/workflow/tasks/${encodeURIComponent(id)}/available-actions` });
}

export function fetchInstance(id: string): Promise<InstanceView> {
  return hidraHttpClient<InstanceView>({ method: 'GET', url: `/api/v1/workflow/instances/${encodeURIComponent(id)}` });
}

export function fetchTimeline(id: string): Promise<TimelineEntry[]> {
  return hidraHttpClient<TimelineEntry[]>({ method: 'GET', url: `/api/v1/workflow/instances/${encodeURIComponent(id)}/timeline` });
}
