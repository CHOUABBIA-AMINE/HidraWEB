export const IDENTITY_ORGANIZATION_PERMISSIONS = {
  createUser: 'identity:users:execute',
  evaluatePermission: 'identity:permissions:execute',
  usersRead: 'identity:users:read',
  rolesRead: 'identity:roles:read',
  permissionsRead: 'identity:permissions:read',
  rolesExecute: 'identity:roles:execute',
  permissionsExecute: 'identity:permissions:execute',
  createOrganizationUnit: 'organization:units:execute',
  manageEmployees: 'organization:employees:execute',
} as const;
