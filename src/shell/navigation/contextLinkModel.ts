/** Coordinates only. No URL, query or location state is an authorization decision. */
export type ContextTarget =
  | { kind: 'regional-feature'; layer: string; entityId: string }
  | { kind: 'workflow-task'; taskId: string }
  | { kind: 'workflow-instance'; instanceId: string };

const OWNER_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const REGIONAL_LAYERS = new Set([
  'pipeline-systems', 'pipelines', 'facilities', 'topology-nodes',
  'pipeline-segments', 'topology-connections',
]);

export function contextTargetPath(target: ContextTarget): string | undefined {
  if (target.kind === 'regional-feature') {
    if (!REGIONAL_LAYERS.has(target.layer) || !OWNER_ID.test(target.entityId)) return undefined;
    return '/network?' + new URLSearchParams({
      regionalLayer: target.layer, regionalEntityId: target.entityId,
    });
  }
  const id = target.kind === 'workflow-task' ? target.taskId : target.instanceId;
  if (!OWNER_ID.test(id)) return undefined;
  return '/work/tasks?' + new URLSearchParams(target.kind === 'workflow-task'
    ? { taskId: id } : { instanceId: id });
}

/** No query-bearing return URL: restore the known workspace, then reauthorize. */
export type SafeReturnPath = '/network' | '/work/tasks';

export interface ContextReturn {
  pathname: SafeReturnPath;
  principalId: string;
  scopeFingerprint: string;
}

export function contextScopeFingerprint(scope: {
  scopeId: number; companyPartyId: string; principalId: string;
  type?: string; targetId?: string;
} | undefined): string {
  return JSON.stringify(scope ? [scope.scopeId, scope.companyPartyId, scope.principalId,
    scope.type ?? null, scope.targetId ?? null] : null);
}

export function contextReturnState(
  pathname: string,
  principalId: string | undefined,
  scopeFingerprint: string,
): { contextReturn: ContextReturn } | undefined {
  if (!principalId || (pathname !== '/network' && pathname !== '/work/tasks')) return undefined;
  return { contextReturn: { pathname, principalId, scopeFingerprint } };
}

export function validContextReturn(
  state: unknown,
  principalId: string | undefined,
  scopeFingerprint: string,
): SafeReturnPath | undefined {
  if (!state || typeof state !== 'object' || !('contextReturn' in state)) return undefined;
  const value = state.contextReturn;
  if (!value || typeof value !== 'object' || !('pathname' in value)
    || !('principalId' in value) || !('scopeFingerprint' in value)) return undefined;
  if (!principalId || value.principalId !== principalId || value.scopeFingerprint !== scopeFingerprint)
    return undefined;
  return value.pathname === '/network' || value.pathname === '/work/tasks'
    ? value.pathname : undefined;
}
