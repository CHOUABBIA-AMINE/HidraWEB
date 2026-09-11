import type {
  OperationalPageResponse,
  OperationalRecordResponse,
  OperationalResourceDescriptor,
  OperationalSearchRequest,
} from '@/api/generated/workbench/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export const workbenchQueryKeys = {
  modules: ['hidra', 'workbench', 'modules'] as const,
  resources: (module: string) => ['hidra', 'workbench', module, 'resources'] as const,
  list: (module: string, resource: string, page: number, size: number, query: string) =>
    ['hidra', 'workbench', module, resource, 'list', page, size, query] as const,
  search: (module: string, resource: string, request: OperationalSearchRequest) =>
    ['hidra', 'workbench', module, resource, 'search', JSON.stringify(request)] as const,
  detail: (module: string, resource: string, id: string) =>
    ['hidra', 'workbench', module, resource, 'detail', id] as const,
};

function segment(value: string): string {
  return encodeURIComponent(value);
}

export function fetchWorkbenchModules(): Promise<string[]> {
  return hidraHttpClient<string[]>({ method: 'GET', url: '/api/v1/workbench/modules' });
}

export function fetchWorkbenchResources(module: string): Promise<OperationalResourceDescriptor[]> {
  return hidraHttpClient<OperationalResourceDescriptor[]>({
    method: 'GET',
    url: `/api/v1/workbench/${segment(module)}/resources`,
  });
}

export interface WorkbenchListRequest {
  module: string;
  resource: string;
  page: number;
  size: number;
  query?: string;
}

export function fetchWorkbenchRecords(request: WorkbenchListRequest): Promise<OperationalPageResponse> {
  return hidraHttpClient<OperationalPageResponse>({
    method: 'GET',
    url: `/api/v1/workbench/${segment(request.module)}/${segment(request.resource)}`,
    params: {
      page: request.page,
      size: request.size,
      ...(request.query?.trim() ? { q: request.query.trim() } : {}),
    },
  });
}

export function fetchWorkbenchRecord(module: string, resource: string, id: string): Promise<OperationalRecordResponse> {
  return hidraHttpClient<OperationalRecordResponse>({
    method: 'GET',
    url: `/api/v1/workbench/${segment(module)}/${segment(resource)}/${segment(id)}`,
  });
}

export function searchWorkbenchRecords(
  module: string,
  resource: string,
  request: OperationalSearchRequest,
): Promise<OperationalPageResponse> {
  return hidraHttpClient<OperationalPageResponse>({
    method: 'POST',
    url: `/api/v1/workbench/${segment(module)}/${segment(resource)}/search`,
    data: request,
  });
}
