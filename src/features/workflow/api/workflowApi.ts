import * as generatedWorkflow from '@/api/generated/workflow/workflow';
import type { AxiosRequestConfig } from 'axios';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  AvailableActionView,
  ExecuteWorkflowTransitionRequest,
  InstanceView,
  PageTaskView,
  TaskView,
  TimelineEntry,
  WorkflowTransitionExecutionResponse,
} from '@/api/generated/workflow/model';

export interface TaskInboxParams {
  view?: string;
  page?: number;
  size?: number;
}

// Native owner reads share NOWAIT Identity fences. Serialize this workspace's
// requests without retrying any read or command; the server still owns admission.
let workflowTail: Promise<void> = Promise.resolve();
function serialized<A extends unknown[], R>(call: (...args: A) => Promise<R>) {
  return (...args: A): Promise<R> => {
    const result = workflowTail.then(() => call(...args));
    workflowTail = result.then(() => undefined, () => undefined);
    return result;
  };
}
function workflowRequest<T>(config: AxiosRequestConfig): Promise<T> {
  return serialized((value: AxiosRequestConfig) => hidraHttpClient<T>(value))(config);
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
  return workflowRequest<PageTaskView>({ method: 'GET', url: '/api/v1/workflow/tasks', params: compactParams(params) });
}

export function fetchTask(id: string): Promise<TaskView> {
  return workflowRequest<TaskView>({ method: 'GET', url: `/api/v1/workflow/tasks/${encodeURIComponent(id)}` });
}

export function fetchAvailableActions(id: string): Promise<AvailableActionView[]> {
  return workflowRequest<AvailableActionView[]>({ method: 'GET', url: `/api/v1/workflow/tasks/${encodeURIComponent(id)}/available-actions` });
}

export function fetchInstance(id: string): Promise<InstanceView> {
  return workflowRequest<InstanceView>({ method: 'GET', url: `/api/v1/workflow/instances/${encodeURIComponent(id)}` });
}

export function fetchTimeline(id: string): Promise<TimelineEntry[]> {
  return workflowRequest<TimelineEntry[]>({ method: 'GET', url: `/api/v1/workflow/instances/${encodeURIComponent(id)}/timeline` });
}

export function executeWorkflowTransition(
  taskId: string,
  transitionId: string,
  request: ExecuteWorkflowTransitionRequest,
): Promise<WorkflowTransitionExecutionResponse> {
  return workflowRequest<WorkflowTransitionExecutionResponse>({
    method: 'POST',
    url: `/api/v1/workflow/tasks/${encodeURIComponent(taskId)}/transitions/${encodeURIComponent(transitionId)}/execute`,
    data: request,
  });
}

// All new transport types, routes and bodies come from the accepted runtime.
export const readWorkflowTarget = serialized(generatedWorkflow.readInstalledCharacteristicLinkWorkflowTarget);
export const discoverWorkflowDefinitions = serialized(generatedWorkflow.definitions1);
export const startWorkflowInstance = serialized(generatedWorkflow.startWorkflowInstance);
export const createWorkflowTask = serialized(generatedWorkflow.createWorkflowTask);
