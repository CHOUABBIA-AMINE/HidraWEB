import type { ResponsibilityResponse } from '@/api/generated/identity-organization/model';

export function activeOperationalScopes(responsibilities: readonly ResponsibilityResponse[]) {
  const byId = new Map<number, NonNullable<ResponsibilityResponse['scope']>>();

  for (const responsibility of responsibilities) {
    if (responsibility.status !== 'ACTIVE' || !responsibility.scope?.id) continue;
    byId.set(responsibility.scope.id, responsibility.scope);
  }

  return [...byId.values()];
}
