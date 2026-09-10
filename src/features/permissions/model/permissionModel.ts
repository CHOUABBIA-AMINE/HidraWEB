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
  routes: RoutePermissionDescriptor[];
}

export interface NormalizedPermissionMetadata {
  permissions: ReadonlySet<string>;
  modules: ReadonlySet<string>;
  routes: readonly RoutePermissionDescriptor[];
  catalogOnly: boolean;
}

export function normalizePermissionMetadata(
  catalog: PermissionCatalog,
  routes: RoutePermissionDescriptor[],
): NormalizedPermissionMetadata {
  const permissions = new Set(routes.map((descriptor) => descriptor.permission));
  const modules = new Set(routes.map((descriptor) => descriptor.module));
  return {
    permissions,
    modules,
    routes,
    catalogOnly: catalog.enforcement.toLowerCase().includes('catalog-only'),
  };
}
