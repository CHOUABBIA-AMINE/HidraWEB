export interface RoutePermissionDescriptor {
  route: string;
  methods: string[];
  module: string;
  resource: string;
  action: string;
  permission: string;
  enforcementStatus: string;
}

export interface PermissionCatalog {
  strategy: string;
  enforcement: string;
  permissionFormat: string;
  bootstrapAdminBypass?: string;
  routes: RoutePermissionDescriptor[];
}

export interface NormalizedPermissionMetadata {
  permissions: ReadonlySet<string>;
  modules: ReadonlySet<string>;
  routes: readonly RoutePermissionDescriptor[];
  catalogOnly: boolean;
  wildcard: boolean;
}

export function normalizePermissionMetadata(
  catalog: PermissionCatalog,
  routes: RoutePermissionDescriptor[],
  effectivePermissions: string[],
): NormalizedPermissionMetadata {
  const permissions = new Set(effectivePermissions);
  const wildcard = permissions.has('*');
  const modules = wildcard
    ? new Set(routes.map((descriptor) => descriptor.module))
    : new Set(
        effectivePermissions
          .map((permission) => permission.split(':', 1)[0])
          .filter((module) => module.length > 0 && module !== '*'),
      );

  return {
    permissions,
    modules,
    routes,
    catalogOnly: catalog.enforcement.toLowerCase().includes('catalog-only'),
    wildcard,
  };
}
