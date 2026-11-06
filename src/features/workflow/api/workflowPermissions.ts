export const WORKFLOW_PERMISSIONS = {
  instancesCreate: 'workflow:instances:execute',
  tasksCreate: 'workflow:tasks:execute',
  tasksRead: 'workflow:tasks:read',
  instancesRead: 'workflow:instances:read',
} as const;
