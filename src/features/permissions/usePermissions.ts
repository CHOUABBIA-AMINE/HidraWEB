import { useContext } from 'react';

import { PermissionContext, type PermissionContextValue } from '@/features/permissions/permissionContext';

export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used inside PermissionProvider.');
  }
  return context;
}
