import { describe, expect, it } from 'vitest';

import type { PermissionContextValue } from '@/features/permissions/permissionContext';
import { resolveHeaderShortcuts } from '@/shell/navbar/headerShortcutAccess';

const routes: PermissionContextValue['routes'] = [
  {
    route: '/api/v1/workflow/tasks', methods: ['GET'], module: 'workflow',
    resource: 'tasks', action: 'read', permission: 'workflow:tasks:read',
    enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/notification/companies/{companyId}/facilities/{facilityId}/inbox',
    methods: ['GET'], module: 'notification', resource: 'inbox', action: 'read',
    permission: 'notification:inbox:read', enforcementStatus: 'backend-enforced',
  },
  {
    route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'],
    module: 'dynamic-module', resource: 'dynamic-resource', action: 'read',
    permission: 'dynamic-module:dynamic-resource:read', enforcementStatus: 'backend-enforced',
  },
];

function access(granted: string[], overrideRoutes = routes, status: PermissionContextValue['status'] = 'ready') {
  const permissions = new Set(granted);
  return {
    status, routes: overrideRoutes, modules: new Set(overrideRoutes.filter((r) => permissions.has(r.permission)).map((r) => r.module)),
    can: (permission: string) => permissions.has(permission),
  };
}

describe('UXR-10 header shortcuts', () => {
  it('enables only published and currently granted routes, never infers unread counts', () => {
    expect(resolveHeaderShortcuts(access([
      'workflow:tasks:read', 'notification:inbox:read', 'dynamic-module:dynamic-resource:read',
    ]))).toEqual({ tasks: true, notifications: true });
  });

  it('refuses a notification route without published generic evidence read and scoped inbox read', () => {
    expect(resolveHeaderShortcuts(access(['workflow:tasks:read']))).toEqual({ tasks: true, notifications: false });
    expect(resolveHeaderShortcuts(access(['notification:inbox:read', 'dynamic-module:dynamic-resource:read'],
      routes.filter((r) => r.module !== 'dynamic-module')))).toEqual({ tasks: false, notifications: false });
    expect(resolveHeaderShortcuts(access(['notification:inbox:read', 'dynamic-module:dynamic-resource:read'],
      routes.filter((r) => r.module !== 'notification')))).toEqual({ tasks: false, notifications: false });
  });

  it('fails closed for missing GET contracts, write-only permissions and bootstrap loading', () => {
    const wrongMethod = routes.map((r) => r.module === 'workflow' ? { ...r, methods: ['POST'] } : r);
    expect(resolveHeaderShortcuts(access(['workflow:tasks:read'], wrongMethod)).tasks).toBe(false);
    expect(resolveHeaderShortcuts(access(['workflow:tasks:read'], routes, 'loading'))).toEqual({
      tasks: false, notifications: false,
    });
  });
});
