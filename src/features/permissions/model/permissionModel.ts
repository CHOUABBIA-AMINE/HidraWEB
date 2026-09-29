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
        routes
          .filter((descriptor) => permissions.has(descriptor.permission))
          .map((descriptor) => descriptor.module),
      );

  return {
    permissions,
    modules,
    routes,
    catalogOnly: catalog.enforcement.toLowerCase().includes('catalog-only'),
    wildcard,
  };
}
