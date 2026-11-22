import { useLocation } from 'react-router';

import { useAuth } from '@/app/auth/useAuth';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

/**
 * A navigation view belongs to one router history entry, authenticated
 * principal, effective-grant snapshot and currently selected operational scope.
 *
 * This is an ephemeral UI identity, not an authorization token or a permission
 * decision. No protected route, record selection, tab or drawer is persisted.
 */
export function navigationContextKey(
  routeKey: string,
  principalId: string | undefined,
  scope: { scopeId: number; type?: string; targetId?: string } | undefined,
  modules: ReadonlySet<string>,
): string {
  return JSON.stringify([
    routeKey,
    principalId ?? null,
    scope?.scopeId ?? null,
    scope?.type ?? null,
    scope?.targetId ?? null,
    [...modules].sort(),
  ]);
}

export function useNavigationContextKey(): string {
  const location = useLocation();
  const auth = useAuth();
  const permissions = usePermissions();
  const scope = useShellUiStore((state) => state.operationalContext);

  return navigationContextKey(location.key, auth.session?.principal?.userId, scope, permissions.modules);
}
