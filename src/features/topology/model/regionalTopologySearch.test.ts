import { describe, expect, it } from 'vitest';
import type { Feature } from '@/api/generated/topology/model';
import { exactRegionalFeature, parseRegionalReference, regionalFeatureReference, regionalSearchAdmission, validRegionalQuery } from '@/features/topology/model/regionalTopologySearch';

const routes = [
  { route: '/api/v1/topology/regional-map/search', methods: ['GET'], module: 'topology', resource: 'regional-map', action: 'search', permission: 'topology:regional-map:search', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/topology/regional-map/layers/{layerId}/features/{entityId}', methods: ['GET'], module: 'topology', resource: 'regional-map', action: 'read', permission: 'topology:regional-map:read', enforcementStatus: 'backend-enforced' },
];
const scope = { scopeId: 7, type: 'PIPELINE_SYSTEM', targetId: 'gz2', companyPartyId: 'company', principalId: 'actor' };
describe('UXR-11 regional search admission and IDs', () => {
  it('requires same actor and company, exact published route and current grant', () => {
    const granted = new Set(['topology:regional-map:search', 'topology:regional-map:read']);
    const access = { status: 'ready' as const, routes, can: (permission: string) => granted.has(permission) };
    expect(regionalSearchAdmission(access, 'actor', scope)).toEqual({ search: true, detail: true });
    expect(regionalSearchAdmission(access, 'other', scope)).toEqual({ search: false, detail: false });
    expect(regionalSearchAdmission(access, 'actor', { ...scope, companyPartyId: 'other company' })).toEqual({ search: false, detail: false });
    expect(regionalSearchAdmission({ ...access, routes: routes.map(x => ({ ...x, methods: ['POST'] })) }, 'actor', scope)).toEqual({ search: false, detail: false });
    granted.delete('topology:regional-map:read');
    expect(regionalSearchAdmission(access, 'actor', scope)).toEqual({ search: true, detail: false });
    granted.delete('topology:regional-map:search');
    expect(regionalSearchAdmission(access, 'actor', scope)).toEqual({ search: false, detail: false });
  });
  it('never mistakes the namespaced outer ID for properties.entityId', () => {
    const ref = { layer: 'pipelines' as const, entityId: 'p-1' };
    const feature = { id: 'pipelines:p-1', properties: { layer: 'pipelines', entityId: 'p-1', code: 'P-1' } } as Feature;
    expect(regionalFeatureReference(feature)).toEqual(ref);
    expect(exactRegionalFeature(feature, ref)).toBe(true);
    expect(exactRegionalFeature({ ...feature, id: 'pipelines:foreign' }, ref)).toBe(false);
    expect(parseRegionalReference(new URLSearchParams({ regionalLayer: 'pipelines', regionalEntityId: 'pipelines:p-1' }))).toBeUndefined();
    expect(parseRegionalReference(new URLSearchParams({ regionalLayer: 'unknown', regionalEntityId: 'p-1' }))).toBeUndefined();
  });
  it('rejects missing and oversized search input', () => {
    expect(validRegionalQuery(' GZ2 ')).toBe('GZ2');
    expect(validRegionalQuery(' ')).toBeUndefined();
    expect(validRegionalQuery('a'.repeat(121))).toBeUndefined();
  });
});
