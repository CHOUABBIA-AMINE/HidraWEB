import { describe, expect, it } from 'vitest';

import { HidraApiError } from '@/api/errors/HidraApiError';
import { workflowErrorMessage } from '@/features/workflow/WorkflowTasksPage';

describe('workflow error semantics', () => {
  it('maps stale-task HTTP 409 conflicts to a refresh-before-retry instruction', () => {
    expect(workflowErrorMessage(new HidraApiError('Conflict', { status: 409 }))).toBe(
      'The task changed. Refresh the task and available actions before retrying.',
    );
  });

  it('makes masked 404 indistinguishable from 403 without protected detail', () => {
    for (const status of [403, 404]) {
      expect(workflowErrorMessage(new HidraApiError('PRIVATE-ASSET-001', { status }))).toBe(
        'HidraAPI refused workflow access.',
      );
    }
  });

  it('preserves distinct authentication, validation and unknown-failure responses', () => {
    expect(workflowErrorMessage(new HidraApiError('Sensitive token', { status: 401 }))).toMatch(/Authentication required/);
    expect(workflowErrorMessage(new HidraApiError('PRIVATE field', { status: 422 }))).toMatch(/Review the supplied fields/);
    expect(workflowErrorMessage(new HidraApiError('Sensitive backend log', { status: 500 }))).toBe(
      'Workflow data could not be loaded.',
    );
  });
});
