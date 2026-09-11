export const permissionEndpoints = {
  catalog: '/api/v1/security/permissions/catalog',
  routes: '/api/v1/security/permissions/routes',
  effective: '/api/v1/identity/me/permissions',
} as const;
