import { describe, expect, it } from 'vitest';

import {
  normalizePermissionMetadata,
  type PermissionCatalog,
  type RoutePermissionDescriptor,
} from '@/features/permissions/model/permissionModel';

const routes: RoutePermissionDescriptor[] = [
  {
    route: '/api/v1/alarm/alarms',
    methods: ['GET'],
    module: 'alarm',
    resource: 'alarms',
    action: 'read',
    permission: 'alarm:alarms:read',
    enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/topology/map/layers',
    methods: ['GET'],
    module: 'topology',
    resource: 'map',
    action: 'read',
    permission: 'topology:map:read',
    enforcementStatus: 'backend-enforced',
  },
];

const catalog: PermissionCatalog = {
  strategy: 'derived-route-permission-catalog',
  enforcement: 'backend-enforced',
  permissionFormat: '<module>:<resource>:<action>',
  routes,
};

describe('normalizePermissionMetadata', () => {
  it('exposes navigation modules only when an effective grant matches a published route descriptor', () => {
    const normalized = normalizePermissionMetadata(
      catalog,
      routes,
      ['alarm:unpublished-resource:read', 'topology:map:read'],
    );

    expect(normalized.permissions).toEqual(new Set([
      'alarm:unpublished-resource:read',
      'topology:map:read',
    ]));
    expect(normalized.modules).toEqual(new Set(['topology']));
    expect(normalized.wildcard).toBe(false);
    expect(normalized.catalogOnly).toBe(false);
  });

  it('keeps the backend administrative wildcard compatible with every published route module', () => {
    const normalized = normalizePermissionMetadata(catalog, routes, ['*']);

    expect(normalized.modules).toEqual(new Set(['alarm', 'topology']));
    expect(normalized.wildcard).toBe(true);
  });
});
