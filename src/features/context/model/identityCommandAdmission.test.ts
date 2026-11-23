import { describe, expect, it } from 'vitest';

import {
  canUseIdentityCommand, isIdentityGrantComplete, type IdentityGrantInput,
} from '@/features/context/model/identityCommandAdmission';
import type { PermissionContextValue } from '@/features/permissions/permissionContext';

const grant: IdentityGrantInput = {
  kind: 'USER_ROLE',
  userId: 'user-1', roleId: 'role-1', permissionId: '',
  effect: 'ALLOW', scopeType: '', scopeReferenceId: '', reason: 'Signed approval',
};

function metadata(status: PermissionContextValue['status'] = 'ready'): PermissionContextValue {
  return {
    status,
    routes: [
      {
        route: '/api/v1/identity/users/role-grants', methods: ['POST'],
        module: 'identity', resource: 'role-grants', action: 'create',
        permission: 'identity:role-grants:create', enforcementStatus: 'backend-enforced',
      },
      {
        route: '/api/v1/identity/roles', methods: ['GET'],
        module: 'identity', resource: 'roles', action: 'read',
        permission: 'identity:roles:read', enforcementStatus: 'backend-enforced',
      },
    ],
    permissions: new Set(['identity:role-grants:create']),
    modules: new Set(['identity']),
    catalogOnly: false,
    can: (permission) => permission === 'identity:role-grants:create',
    hasAnyModuleCapability: () => true,
    reload: async () => undefined,
  };
}

describe('UXR-21/B exact Identity command admission', () => {
  it('requires the exact POST route, matching permission and a ready catalog', () => {
    expect(canUseIdentityCommand(metadata(), '/api/v1/identity/users/role-grants', 'POST')).toBe(true);
    expect(canUseIdentityCommand(metadata(), '/api/v1/identity/users/permission-grants', 'POST')).toBe(false);
    expect(canUseIdentityCommand(metadata(), '/api/v1/identity/roles', 'POST')).toBe(false);
    expect(canUseIdentityCommand(metadata('error'), '/api/v1/identity/users/role-grants', 'POST')).toBe(false);
    expect(canUseIdentityCommand(metadata('loading'), '/api/v1/identity/users/role-grants', 'POST')).toBe(false);
  });

  it('requires target IDs, reason and explicit scope for human grant review', () => {
    expect(isIdentityGrantComplete(grant)).toBe(true);
    expect(isIdentityGrantComplete({ ...grant, reason: '' })).toBe(false);
    expect(isIdentityGrantComplete({ ...grant, scopeType: 'PIPELINE', scopeReferenceId: '' })).toBe(false);
    expect(isIdentityGrantComplete({ ...grant, scopeType: 'PIPELINE', scopeReferenceId: 'p-1' })).toBe(true);
    expect(isIdentityGrantComplete({ ...grant, kind: 'ROLE_PERMISSION', userId: '', permissionId: '' })).toBe(false);
    expect(isIdentityGrantComplete({ ...grant, kind: 'ROLE_PERMISSION', userId: '', permissionId: 'p-1' })).toBe(true);
    expect(isIdentityGrantComplete({ ...grant, kind: 'USER_PERMISSION', permissionId: 'p-1', roleId: '' })).toBe(true);
    expect(isIdentityGrantComplete({ ...grant, kind: 'USER_PERMISSION', permissionId: 'p-1', reason: '' })).toBe(false);
  });
});
