import type { Feature } from '@/api/generated/topology/model';
import type { PermissionContextValue } from '@/features/permissions/permissionContext';
import { supportsRegionalAccess } from '@/features/context/model/operationalContextModel';
import type { OperationalContextSelection } from '@/shell/model/useShellUiStore';

export const REGIONAL_LAYERS = [
  'pipeline-systems', 'pipelines', 'facilities',
  'topology-nodes', 'pipeline-segments', 'topology-connections',
] as const;
export interface RegionalFeatureReference {
  layer: typeof REGIONAL_LAYERS[number];
  entityId: string;
}
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/;
const SEARCH = '/api/v1/topology/regional-map/search';
const DETAIL = '/api/v1/topology/regional-map/layers/{layerId}/features/{entityId}';

export function validRegionalQuery(input: string): string | undefined {
  const value = input.trim();
  return value.length > 0 && value.length <= 120 ? value : undefined;
}

export function regionalSearchAdmission(
  access: Pick<PermissionContextValue, 'status' | 'routes' | 'can'>,
  principalId: string | undefined,
  scope: OperationalContextSelection | undefined,
): { search: boolean; detail: boolean } {
  if (access.status !== 'ready' || !principalId || !scope ||
      scope.principalId !== principalId || !ID.test(scope.companyPartyId) ||
      !supportsRegionalAccess(scope)) return { search: false, detail: false };
  const admitted = (route: string, permission: string) => access.routes.some(item =>
    item.route === route && item.module === 'topology' &&
    item.methods.includes('GET') && item.permission === permission &&
    access.can(permission));
  return {
    search: admitted(SEARCH, 'topology:regional-map:search'),
    detail: admitted(DETAIL, 'topology:regional-map:read'),
  };
}

export function parseRegionalReference(params: URLSearchParams): RegionalFeatureReference | undefined {
  const layer = params.get('regionalLayer');
  const entityId = params.get('regionalEntityId');
  if (!layer || !entityId || !REGIONAL_LAYERS.some(candidate => candidate === layer) ||
      !ID.test(entityId)) return undefined;
  return { layer: layer as RegionalFeatureReference['layer'], entityId };
}

export function regionalFeatureReference(feature: Feature): RegionalFeatureReference | undefined {
  const layer = feature.properties?.layer;
  const entityId = feature.properties?.entityId;
  if (typeof layer !== 'string' || typeof entityId !== 'string') return undefined;
  const ref = parseRegionalReference(new URLSearchParams({ regionalLayer: layer, regionalEntityId: entityId }));
  return ref && feature.id === ref.layer + ':' + ref.entityId ? ref : undefined;
}

export function exactRegionalFeature(feature: Feature | undefined, expected: RegionalFeatureReference): boolean {
  const actual = feature && regionalFeatureReference(feature);
  return actual?.layer === expected.layer && actual.entityId === expected.entityId;
}
