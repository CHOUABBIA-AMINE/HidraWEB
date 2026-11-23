import type { PermissionContextValue } from '@/features/permissions/permissionContext';

/**
 * UX admission is not authorization: HidraAPI validates the command again.
 * Exact route/method/permission data is required before rendering a write action
 * as enabled. Never fall back to a grant for a different Identity route.
 */
export function canUseIdentityCommand(
  permissions: PermissionContextValue,
  route: string,
  method: 'POST' | 'PUT',
): boolean {
  if (permissions.status !== 'ready') return false;
  const descriptor = permissions.routes.find((item) =>
    item.route === route && item.methods.includes(method) && item.permission.trim().length > 0);
  return Boolean(descriptor?.permission && permissions.can(descriptor.permission));
}

export type IdentityGrantKind = 'USER_ROLE' | 'ROLE_PERMISSION' | 'USER_PERMISSION';

export interface IdentityGrantInput {
  kind: IdentityGrantKind;
  userId: string;
  roleId: string;
  permissionId: string;
  effect: string;
  scopeType: string;
  scopeReferenceId: string;
  reason: string;
}

/** A user grant needs a traceable reason; no fallback to a global scope. */
export function isIdentityGrantComplete(input: IdentityGrantInput): boolean {
  const hasRole = Boolean(input.roleId.trim());
  const hasPermission = Boolean(input.permissionId.trim());
  const hasUser = Boolean(input.userId.trim());
  const scopeValid = !input.scopeType.trim() || Boolean(input.scopeReferenceId.trim());
  if (input.kind === 'ROLE_PERMISSION') return hasRole && hasPermission && Boolean(input.effect.trim());
  if (input.kind === 'USER_ROLE') return hasRole && hasUser && Boolean(input.reason.trim()) && scopeValid;
  return hasUser && hasPermission && Boolean(input.effect.trim()) && Boolean(input.reason.trim()) && scopeValid;
}
