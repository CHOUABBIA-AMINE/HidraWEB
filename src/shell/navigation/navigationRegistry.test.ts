import { describe, expect, it } from 'vitest';

import { normalizePermissionMetadata } from '@/features/permissions/model/permissionModel';
import {
  isNavigationItemAuthorized,
  navigationSections,
} from '@/shell/navigation/navigationRegistry';

function item(id: string) {
  const match = navigationSections.flatMap((section) => section.items).find((candidate) => candidate.id === id);
  if (!match) throw new Error(`Missing navigation item ${id}`);
  return match;
}

describe('permission-aware navigation', () => {
  it('shows only modules backed by both a published route and an effective grant', () => {
    const routes = [
      {
        route: '/api/v1/topology/map/layers',
        methods: ['GET'],
        module: 'topology',
        resource: 'map',
        action: 'read',
        permission: 'topology:map:read',
        enforcementStatus: 'backend-enforced',
      },
      {
        route: '/api/v1/alarm/alarms',
        methods: ['GET'],
        module: 'alarm',
        resource: 'alarms',
        action: 'read',
        permission: 'alarm:alarms:read',
        enforcementStatus: 'backend-enforced',
      },
    ];

    const normalized = normalizePermissionMetadata(
      {
        strategy: 'derived-route-permission-catalog',
        enforcement: 'backend-enforced',
        permissionFormat: '<module>:<resource>:<action>',
        routes,
      },
      routes,
      ['topology:map:read', 'alarm:unpublished:read'],
    );

    expect(isNavigationItemAuthorized(item('overview'), normalized.modules)).toBe(true);
    expect(isNavigationItemAuthorized(item('network'), normalized.modules)).toBe(true);
    expect(isNavigationItemAuthorized(item('alarms'), normalized.modules)).toBe(false);
  });

  it('allows all published module navigation for the backend wildcard grant', () => {
    const routes = [{
      route: '/api/v1/alarm/alarms',
      methods: ['GET'],
      module: 'alarm',
      resource: 'alarms',
      action: 'read',
      permission: 'alarm:alarms:read',
      enforcementStatus: 'backend-enforced',
    }];
    const normalized = normalizePermissionMetadata(
      {
        strategy: 'derived-route-permission-catalog',
        enforcement: 'backend-enforced',
        permissionFormat: '<module>:<resource>:<action>',
        routes,
      },
      routes,
      ['*'],
    );

    expect(isNavigationItemAuthorized(item('alarms'), normalized.modules)).toBe(true);
  });
});
