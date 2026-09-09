import { useMemo, type PropsWithChildren } from 'react';
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

  const value = useMemo<PermissionContextValue>(() => {
    if (!enabled) {
      return {
        status: 'idle',
        routes: [],
        permissions: new Set(),
        modules: new Set(),
        catalogOnly: true,
        can: () => false,
        hasAnyModuleCapability: () => false,
        reload: async () => undefined,
      };
    }

    const firstError = catalogQuery.error ?? routesQuery.error;
    if (firstError) {
      const error = normalizeHidraApiError(firstError);
      return {
        status: 'error',
        routes: [],
        permissions: new Set(),
        modules: new Set(),
        catalogOnly: true,
        error,
        can: () => false,
        hasAnyModuleCapability: () => false,
        reload: async () => {
          await Promise.all([catalogQuery.refetch(), routesQuery.refetch()]);
        },
      };
    }

    if (!catalogQuery.data || !routesQuery.data) {
      return {
        status: 'loading',
        routes: [],
        permissions: new Set(),
        modules: new Set(),
        catalogOnly: true,
        can: () => false,
        hasAnyModuleCapability: () => false,
        reload: async () => {
          await Promise.all([catalogQuery.refetch(), routesQuery.refetch()]);
        },
      };
    }

    const normalized = normalizePermissionMetadata(catalogQuery.data, routesQuery.data);
    return {
      status: 'ready',
      catalog: catalogQuery.data,
      ...normalized,
      can: (permission) => normalized.permissions.has(permission),
      hasAnyModuleCapability: (requiredModules) =>
        requiredModules.length === 0 || requiredModules.some((module) => normalized.modules.has(module)),
      reload: async () => {
        await Promise.all([catalogQuery.refetch(), routesQuery.refetch()]);
      },
    };
  }, [catalogQuery.data, catalogQuery.error, catalogQuery.refetch, enabled, routesQuery.data, routesQuery.error, routesQuery.refetch]);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
