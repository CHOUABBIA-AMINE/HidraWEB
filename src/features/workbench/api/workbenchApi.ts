import type {
  OperationalPageResponse,
  OperationalRecordResponse,
  OperationalResourceDescriptor,
  OperationalSearchRequest,
} from '@/api/generated/workbench/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export interface WorkbenchResourceDescriptor {
  module: string;
  resource: string;
  entityName: string;
  javaType: string;
  tableName: string;
  idField: string;
  searchableFields: string[];
  listEndpoint: string;
  detailEndpoint: string;
  searchEndpoint: string;
}

export interface WorkbenchRecord {
  module: string;
  resource: string;
  id?: unknown;
  attributes: Record<string, unknown>;
}

export interface WorkbenchPage {
  module: string;
  resource: string;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: WorkbenchRecord[];
}

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

function normalizeDescriptor(value: OperationalResourceDescriptor): WorkbenchResourceDescriptor | null {
  if (!value.module || !value.resource || !value.idField) return null;
  return {
    module: value.module,
    resource: value.resource,
    entityName: value.entityName ?? value.resource,
    javaType: value.javaType ?? '',
    tableName: value.tableName ?? '',
    idField: value.idField,
    searchableFields: value.searchableFields ?? [],
    listEndpoint: value.listEndpoint ?? '',
    detailEndpoint: value.detailEndpoint ?? '',
    searchEndpoint: value.searchEndpoint ?? '',
  };
}

function normalizeRecord(value: OperationalRecordResponse): WorkbenchRecord | null {
  if (!value.module || !value.resource) return null;
  return {
    module: value.module,
    resource: value.resource,
    id: value.id,
    attributes: value.attributes ?? {},
  };
}

function normalizePage(value: OperationalPageResponse, module: string, resource: string): WorkbenchPage {
  return {
    module: value.module ?? module,
    resource: value.resource ?? resource,
    page: value.page ?? 0,
    size: value.size ?? 0,
    totalElements: value.totalElements ?? 0,
    totalPages: value.totalPages ?? 0,
    items: (value.items ?? []).map(normalizeRecord).filter((item): item is WorkbenchRecord => item !== null),
  };
}

export function fetchWorkbenchModules(): Promise<string[]> {
  return hidraHttpClient<string[]>({ method: 'GET', url: '/api/v1/workbench/modules' });
}

export async function fetchWorkbenchResources(module: string): Promise<WorkbenchResourceDescriptor[]> {
  const response = await hidraHttpClient<OperationalResourceDescriptor[]>({
    method: 'GET',
    url: `/api/v1/workbench/${segment(module)}/resources`,
  });
  return response.map(normalizeDescriptor).filter((item): item is WorkbenchResourceDescriptor => item !== null);
}

export interface WorkbenchListRequest {
  module: string;
  resource: string;
  page: number;
  size: number;
  query?: string;
}

export async function fetchWorkbenchRecords(request: WorkbenchListRequest): Promise<WorkbenchPage> {
  const response = await hidraHttpClient<OperationalPageResponse>({
    method: 'GET',
    url: `/api/v1/workbench/${segment(request.module)}/${segment(request.resource)}`,
    params: {
      page: request.page,
      size: request.size,
      ...(request.query?.trim() ? { q: request.query.trim() } : {}),
    },
  });
  return normalizePage(response, request.module, request.resource);
}

export async function fetchWorkbenchRecord(module: string, resource: string, id: string): Promise<WorkbenchRecord> {
  const response = await hidraHttpClient<OperationalRecordResponse>({
    method: 'GET',
    url: `/api/v1/workbench/${segment(module)}/${segment(resource)}/${segment(id)}`,
  });
  return normalizeRecord(response) ?? { module, resource, id, attributes: {} };
}

export async function searchWorkbenchRecords(
  module: string,
  resource: string,
  request: OperationalSearchRequest,
): Promise<WorkbenchPage> {
  const response = await hidraHttpClient<OperationalPageResponse>({
    method: 'POST',
    url: `/api/v1/workbench/${segment(module)}/${segment(resource)}/search`,
    data: request,
  });
  return normalizePage(response, module, resource);
}
