import { createContext } from 'react';

import type { HidraApiError } from '@/api/errors/HidraApiError';
import type { PermissionCatalog, RoutePermissionDescriptor } from '@/features/permissions/model/permissionModel';

export type PermissionStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PermissionContextValue {
  status: PermissionStatus;
  catalog?: PermissionCatalog;
  routes: readonly RoutePermissionDescriptor[];
  permissions: ReadonlySet<string>;
  modules: ReadonlySet<string>;
  catalogOnly: boolean;
  error?: HidraApiError;
  can: (permission: string) => boolean;
  hasAnyModuleCapability: (modules: readonly string[]) => boolean;
  reload: () => Promise<void>;
}

export const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);
