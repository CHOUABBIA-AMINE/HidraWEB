import { describe, expect, it } from 'vitest';

import { normalizePermissionMetadata } from '@/features/permissions/model/permissionModel';
import {
  isNavigationItemAuthorized,
  navigationSections,
  authorizedNavigationSections,
  navigationSectionForPath,
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
  it('keeps exactly six registered product groups with no more than three levels', () => {
    expect(navigationSections.map((group) => group.id)).toEqual([
      'root', 'operations', 'engineering', 'intelligence', 'work', 'administration',
    ]);
    const descendants = navigationSections.flatMap((group) => group.items.flatMap((item) => item.children ?? []));
    expect(descendants.map((item) => [item.id, item.path])).toEqual([
      ['engineering-assets', '/engineering/assets'],
    ]);
    expect(descendants.every((item) => !item.children?.length)).toBe(true);
  });

  it('filters both groups and nested assets from published effective module grants', () => {
    const networkOnly = authorizedNavigationSections(navigationSections, new Set(['topology']));
    expect(networkOnly.map((group) => group.id)).toEqual(['root', 'operations']);
    expect(networkOnly.find((group) => group.id === 'operations')?.items.map((item) => item.id)).toEqual(['network']);
    expect(navigationSectionForPath(networkOnly, '/engineering/assets')).toBeUndefined();
    expect(navigationSectionForPath(networkOnly, '/network')).toBe('operations');

    const integrityOnly = authorizedNavigationSections(navigationSections, new Set(['integrity']));
    expect(integrityOnly.find((group) => group.id === 'engineering')?.items[0]?.children).toEqual([]);
    expect(navigationSectionForPath(integrityOnly, '/engineering/assets')).toBeUndefined();

    const assetAccess = authorizedNavigationSections(navigationSections, new Set(['assets']));
    expect(assetAccess.find((group) => group.id === 'engineering')?.items[0]?.children?.[0]?.id).toBe('engineering-assets');
    expect(navigationSectionForPath(assetAccess, '/engineering/assets')).toBe('engineering');
    expect(navigationSectionForPath(assetAccess, '/engineering/unknown')).toBeUndefined();
  });
});
