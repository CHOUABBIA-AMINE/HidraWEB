import type { PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { useAuth } from '@/app/auth/useAuth';
import { fetchPermissionCatalog, fetchPermissionRoutes } from '@/features/permissions/api/permissionApi';
import { PermissionContext, type PermissionContextValue } from '@/features/permissions/permissionContext';
import { normalizePermissionMetadata } from '@/features/permissions/model/permissionModel';

const permissionQueryKeys = {
  catalog: ['hidra', 'security', 'permissions', 'catalog'] as const,
  routes: ['hidra', 'security', 'permissions', 'routes'] as const,
};

export function PermissionProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const enabled = auth.status === 'authenticated';
  const catalogQuery = useQuery({
    queryKey: permissionQueryKeys.catalog,
    queryFn: fetchPermissionCatalog,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const routesQuery = useQuery({
    queryKey: permissionQueryKeys.routes,
    queryFn: fetchPermissionRoutes,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const reload = async (): Promise<void> => {
    await Promise.all([catalogQuery.refetch(), routesQuery.refetch()]);
  };

  let value: PermissionContextValue;

  if (!enabled) {
    value = {
      status: 'idle',
      routes: [],
      permissions: new Set(),
      modules: new Set(),
      catalogOnly: true,
      can: () => false,
      hasAnyModuleCapability: () => false,
      reload: async () => undefined,
    };
  } else {
    const firstError = catalogQuery.error ?? routesQuery.error;

    if (firstError) {
      const error = normalizeHidraApiError(firstError);
      value = {
        status: 'error',
        routes: [],
        permissions: new Set(),
        modules: new Set(),
        catalogOnly: true,
        error,
        can: () => false,
        hasAnyModuleCapability: () => false,
        reload,
      };
    } else if (!catalogQuery.data || !routesQuery.data) {
      value = {
        status: 'loading',
        routes: [],
        permissions: new Set(),
        modules: new Set(),
        catalogOnly: true,
        can: () => false,
        hasAnyModuleCapability: () => false,
        reload,
      };
    } else {
      const normalized = normalizePermissionMetadata(catalogQuery.data, routesQuery.data);
      value = {
        status: 'ready',
        catalog: catalogQuery.data,
        ...normalized,
        can: (permission) => normalized.permissions.has(permission),
        hasAnyModuleCapability: (requiredModules) =>
          requiredModules.length === 0 || requiredModules.some((module) => normalized.modules.has(module)),
        reload,
      };
    }
  }

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
