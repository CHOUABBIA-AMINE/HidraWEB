import type { PermissionContextValue } from '@/features/permissions/permissionContext';
import { WORKFLOW_PERMISSIONS } from '@/features/workflow/api/workflowPermissions';

const WORKFLOW_TASKS = '/api/v1/workflow/tasks';
const NOTIFICATION_INBOX = '/api/v1/notification/companies/{companyId}/facilities/{facilityId}/inbox';
const WORKBENCH_LIST = '/api/v1/workbench/{module}/{resource}';
const NOTIFICATION_INBOX_READ = 'notification:inbox:read';

/** Header shortcuts are navigation affordances, never independent authority or counts.
 * Notifications open the existing evidence-only route. The T27 inbox requires
 * a server-established facility and is not implicitly selected from a navbar.
 */
export function resolveHeaderShortcuts(
  access: Pick<PermissionContextValue, 'status' | 'routes' | 'can' | 'modules'>,
): { tasks: boolean; notifications: boolean } {
  if (access.status !== 'ready') return { tasks: false, notifications: false };

  const publishedRead = (path: string, module: string, permission?: string) => access.routes.some((route) =>
    route.route === path && route.module === module && route.methods.includes('GET') &&
    (permission === undefined || route.permission === permission) && access.can(route.permission));

  return {
    tasks: access.modules.has('workflow') &&
      publishedRead(WORKFLOW_TASKS, 'workflow', WORKFLOW_PERMISSIONS.tasksRead),
    notifications: access.modules.has('notification') &&
      publishedRead(NOTIFICATION_INBOX, 'notification', NOTIFICATION_INBOX_READ) &&
      publishedRead(WORKBENCH_LIST, 'dynamic-module'),
  };
}
