import type { ResponsibilityResponse } from '@/api/generated/identity-organization/model';

export function activeOperationalScopes(responsibilities: readonly ResponsibilityResponse[]) {
  const byId = new Map<number, NonNullable<ResponsibilityResponse['scope']>>();

  for (const responsibility of responsibilities) {
    if (responsibility.status !== 'ACTIVE' || !responsibility.scope?.id) continue;
    byId.set(responsibility.scope.id, responsibility.scope);
  }

  return [...byId.values()];
}


const REGIONAL_KINDS: readonly string[] = ['PIPELINE_SYSTEM', 'PIPELINE', 'FACILITY', 'EQUIPMENT'];

export function supportsRegionalAccess(scope: { type?: string; targetId?: string }): boolean {
  return REGIONAL_KINDS.includes(scope.type ?? '') &&
    Boolean(scope.targetId && scope.targetId.trim() === scope.targetId);
}

/** Candidate eligibility only; the server owns every current access decision. */
export function effectiveRegionalScopes(responsibilities: readonly ResponsibilityResponse[], at = Date.now()) {
  return activeOperationalScopes(responsibilities.filter((r) => {
    if (r.status !== 'ACTIVE') return false;
    const from = r.validFrom === undefined ? undefined : Date.parse(r.validFrom);
    const until = r.validTo === undefined ? undefined : Date.parse(r.validTo);
    return (from === undefined || (Number.isFinite(from) && from <= at)) &&
      (until === undefined || (Number.isFinite(until) && at < until));
  })).filter(supportsRegionalAccess);
}

export function isPositiveRegionalAccess(
  response: unknown,
  companyPartyId: string,
  scope: { type?: string; targetId?: string },
): boolean {
  if (!response || typeof response !== 'object' || !supportsRegionalAccess(scope)) return false;
  const value = response as Record<string, unknown>;
  return value.permitted === true && value.companyPartyId === companyPartyId &&
    value.resourceKind === scope.type && value.resourceId === scope.targetId;
}
