import { describe, expect, it } from 'vitest';

import type { OperationalScopeResponse } from '@/api/generated/identity-organization/model';

import { activeOperationalScopes, authorizedRegionalScopes, effectiveRegionalScopes, isPositiveRegionalAccess, supportsRegionalAccess } from '@/features/context/model/operationalContextModel';

describe('activeOperationalScopes', () => {
  it('uses canonical scope objects from active responsibilities and de-duplicates by registry id', () => {
    const scope: OperationalScopeResponse = { id: 7, type: 'PIPELINE', targetId: 'pipeline-1', code: 'PL-1', name: 'Pipeline 1', assignable: true };
    const result = activeOperationalScopes([
      { id: 'r1', status: 'ACTIVE', scopeId: 7, scope },
      { id: 'r2', status: 'ACTIVE', scopeId: 7, scope },
      { id: 'r3', status: 'ENDED', scopeId: 9, scope: { ...scope, id: 9 } },
    ]);

    expect(result).toEqual([scope]);
  });

  it('does not manufacture an operational context from assignments without a canonical scope response', () => {
    expect(activeOperationalScopes([{ id: 'r1', status: 'ACTIVE', scopeId: 7 }])).toEqual([]);
  });
});


describe('UXR-09 exact company and regional access', () => {
  const scope: OperationalScopeResponse = { id: 7, type: 'PIPELINE_SYSTEM', targetId: 'gz2', name: 'GZ2' };
  it('includes the accepted T33 PIPELINE_SEGMENT kind but excludes invalid resource identifiers', () => {
    const segment = { type: 'PIPELINE_SEGMENT', targetId: 'segment-gz2-1' };
    expect(supportsRegionalAccess(segment)).toBe(true);
    expect(isPositiveRegionalAccess({
      resourceKind: 'PIPELINE_SEGMENT', resourceId: 'segment-gz2-1', companyPartyId: 'company', permitted: true,
    }, 'company', segment)).toBe(true);
    expect(supportsRegionalAccess({ ...segment, targetId: ' segment-gz2-1' })).toBe(false);
    expect(supportsRegionalAccess({ type: 'ORGANIZATION_UNIT', targetId: 'segment-gz2-1' })).toBe(false);
  });
  it('excludes expired, future, suspended and unsupported scopes', () => {
    const at = Date.parse('2026-11-22T18:00:00Z');
    expect(effectiveRegionalScopes([
      { id: '1', status: 'ACTIVE', scope },
      { id: '2', status: 'ACTIVE', scope: { ...scope, id: 8 }, validTo: '2026-11-21T00:00:00Z' },
      { id: '3', status: 'ACTIVE', scope: { ...scope, id: 9 }, validFrom: '2026-11-23T00:00:00Z' },
      { id: '4', status: 'ACTIVE', scope: { ...scope, id: 10, type: 'ORGANIZATION_UNIT' } },
      { id: '5', status: 'SUSPENDED', scope: { ...scope, id: 11 } },
    ], at)).toEqual([scope]);
  });
  it('refuses an absent, foreign, mismatched or negative decision', () => {
    const decision = { resourceKind: 'PIPELINE_SYSTEM', resourceId: 'gz2', companyPartyId: 'company', permitted: true };
    expect(isPositiveRegionalAccess(decision, 'company', scope)).toBe(true);
    expect(isPositiveRegionalAccess(decision, 'foreign', scope)).toBe(false);
    expect(isPositiveRegionalAccess(decision, 'company', { ...scope, targetId: 'other' })).toBe(false);
    expect(isPositiveRegionalAccess({ ...decision, permitted: false }, 'company', scope)).toBe(false);
    expect(isPositiveRegionalAccess(undefined, 'company', scope)).toBe(false);
  });
});


describe('T61 operational scope discovery', () => {
  const scope = { id: 7, type: 'PIPELINE_SYSTEM', targetId: 'gz2' };
  it('retains only the minimal owner-qualified tuple and deduplicates identical rows', () => {
    expect(authorizedRegionalScopes([scope, { ...scope, name: 'Untrusted label' }])).toEqual([scope]);
  });
  it('fails closed for malformed or conflicting receipts', () => {
    for (const invalid of [undefined, {}, [null], [{ ...scope, id: 0 }],
      [{ ...scope, id: '7' }], [{ ...scope, targetId: ' gz2' }],
      [{ ...scope, type: 'ORGANIZATION_UNIT' }], [scope, { ...scope, targetId: 'other' }]]) {
      expect(authorizedRegionalScopes(invalid)).toEqual([]);
    }
  });
});
