import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

export type PermissionBootstrapStatus = 'not-loaded';

export interface PermissionContextValue {
  permissions: ReadonlySet<string>;
  status: PermissionBootstrapStatus;
  can: (permission: string) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({ children }: PropsWithChildren) {
  const value = useMemo<PermissionContextValue>(() => {
    const permissions = new Set<string>();
    return {
      permissions,
      status: 'not-loaded',
      can: (permission) => permissions.has(permission),
    };
  }, []);

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used inside PermissionProvider.');
  }
  return context;
}
