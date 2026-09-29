import { describe, expect, it } from 'vitest';

import { HidraApiError } from '@/api/errors/HidraApiError';
import { workflowErrorMessage } from '@/features/workflow/WorkflowTasksPage';

describe('workflow error semantics', () => {
  it('maps stale-task HTTP 409 conflicts to a refresh-before-retry instruction', () => {
    expect(workflowErrorMessage(new HidraApiError('Conflict', { status: 409 }))).toBe(
      'The task changed. Refresh the task and available actions before retrying.',
    );
  });

  it('keeps backend authorization denial distinct from concurrency conflict', () => {
    expect(workflowErrorMessage(new HidraApiError('Forbidden', { status: 403 }))).toBe(
      'HidraAPI refused workflow access.',
    );
  });
});
