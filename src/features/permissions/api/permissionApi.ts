import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { permissionEndpoints } from '@/features/permissions/api/permissionEndpoints';
import type { PermissionCatalog, RoutePermissionDescriptor } from '@/features/permissions/model/permissionModel';

export function fetchPermissionCatalog(): Promise<PermissionCatalog> {
  return hidraHttpClient<PermissionCatalog>({ method: 'GET', url: permissionEndpoints.catalog });
}

export function fetchPermissionRoutes(): Promise<RoutePermissionDescriptor[]> {
  return hidraHttpClient<RoutePermissionDescriptor[]>({ method: 'GET', url: permissionEndpoints.routes });
}
