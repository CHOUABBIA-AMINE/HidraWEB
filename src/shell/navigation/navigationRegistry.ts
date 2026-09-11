export type NavigationIconKey =
  | 'overview' | 'network' | 'operations' | 'alarms' | 'events' | 'planning'
  | 'engineering' | 'custody' | 'risk' | 'analytics' | 'simulation' | 'reports'
  | 'tasks' | 'notifications' | 'organization' | 'identity' | 'configuration'
  | 'audit' | 'documents' | 'integrations';

export interface NavigationItem {
  id: string;
  labelKey: string;
  path: string;
  capabilityModules: readonly string[];
  icon: NavigationIconKey;
  implemented: boolean;
  deliveryTask: string;
}

export interface NavigationSection {
  id: string;
  labelKey?: string;
  items: readonly NavigationItem[];
}

export const navigationSections: readonly NavigationSection[] = [
  { id: 'root', items: [
    { id: 'overview', labelKey: 'nav.overview', path: '/overview', capabilityModules: [], icon: 'overview', implemented: true, deliveryTask: 'HWEB-002' },
  ] },
  { id: 'operations', labelKey: 'nav.groups.operations', items: [
    { id: 'network', labelKey: 'nav.network', path: '/network', capabilityModules: ['topology'], icon: 'network', implemented: true, deliveryTask: 'HWEB-005' },
    { id: 'operations-overview', labelKey: 'nav.operationsOverview', path: '/operations', capabilityModules: ['telemetry', 'monitoring'], icon: 'operations', implemented: true, deliveryTask: 'HWEB-006' },
    { id: 'alarms', labelKey: 'nav.alarms', path: '/alarms', capabilityModules: ['alarm'], icon: 'alarms', implemented: true, deliveryTask: 'HWEB-008' },
    { id: 'events', labelKey: 'nav.events', path: '/events', capabilityModules: ['incident', 'leakdetection', 'hse'], icon: 'events', implemented: false, deliveryTask: 'HWEB-009' },
    { id: 'planning', labelKey: 'nav.planning', path: '/planning', capabilityModules: ['planning'], icon: 'planning', implemented: false, deliveryTask: 'HWEB-010' },
  ] },
  { id: 'engineering', labelKey: 'nav.groups.engineering', items: [
    { id: 'integrity', labelKey: 'nav.integrity', path: '/engineering', capabilityModules: ['integrity', 'assets'], icon: 'engineering', implemented: false, deliveryTask: 'HWEB-011' },
    { id: 'custody', labelKey: 'nav.custody', path: '/custody', capabilityModules: ['custody', 'party'], icon: 'custody', implemented: false, deliveryTask: 'HWEB-012' },
  ] },
  { id: 'intelligence', labelKey: 'nav.groups.intelligence', items: [
    { id: 'risk', labelKey: 'nav.risk', path: '/intelligence/risk', capabilityModules: ['risk'], icon: 'risk', implemented: false, deliveryTask: 'HWEB-013' },
    { id: 'analytics', labelKey: 'nav.analytics', path: '/intelligence/analytics', capabilityModules: ['analytics'], icon: 'analytics', implemented: false, deliveryTask: 'HWEB-013' },
    { id: 'simulation', labelKey: 'nav.simulation', path: '/intelligence/simulation', capabilityModules: ['simulation'], icon: 'simulation', implemented: false, deliveryTask: 'HWEB-013' },
    { id: 'reports', labelKey: 'nav.reports', path: '/intelligence/reports', capabilityModules: ['reporting'], icon: 'reports', implemented: false, deliveryTask: 'HWEB-013' },
  ] },
  { id: 'work', labelKey: 'nav.groups.work', items: [
    { id: 'tasks', labelKey: 'nav.tasks', path: '/work/tasks', capabilityModules: ['workflow'], icon: 'tasks', implemented: true, deliveryTask: 'HWEB-007' },
    { id: 'notifications', labelKey: 'nav.notifications', path: '/work/notifications', capabilityModules: ['notification'], icon: 'notifications', implemented: false, deliveryTask: 'HWEB-014' },
  ] },
  { id: 'administration', labelKey: 'nav.groups.administration', items: [
    { id: 'organization', labelKey: 'nav.organization', path: '/administration/organization', capabilityModules: ['organization'], icon: 'organization', implemented: true, deliveryTask: 'HWEB-004' },
    { id: 'identity', labelKey: 'nav.identity', path: '/administration/users', capabilityModules: ['identity', 'security'], icon: 'identity', implemented: true, deliveryTask: 'HWEB-004' },
    { id: 'configuration', labelKey: 'nav.configuration', path: '/administration/configuration', capabilityModules: ['configuration'], icon: 'configuration', implemented: false, deliveryTask: 'HWEB-014' },
    { id: 'audit', labelKey: 'nav.audit', path: '/administration/audit', capabilityModules: ['audit'], icon: 'audit', implemented: false, deliveryTask: 'HWEB-014' },
    { id: 'documents', labelKey: 'nav.documents', path: '/administration/documents', capabilityModules: ['documents'], icon: 'documents', implemented: false, deliveryTask: 'HWEB-014' },
    { id: 'integrations', labelKey: 'nav.integrations', path: '/administration/integrations', capabilityModules: ['integration'], icon: 'integrations', implemented: false, deliveryTask: 'HWEB-014' },
  ] },
] as const;
