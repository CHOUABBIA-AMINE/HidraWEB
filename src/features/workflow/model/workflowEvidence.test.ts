import { describe, expect, it } from 'vitest';
import type { InstanceView, TimelineEntry } from '@/api/generated/workflow/model';
import { workflowInstanceEvidence, workflowTimelineEvidence } from '@/features/workflow/model/workflowEvidence';

describe('UXR-15 Workflow source provenance', () => {
  it('preserves exact instance version and owner status without deriving an effective period', () => {
    const instance: InstanceView = { id: 'instance-1', status: 'COMPLETED', definitionVersion: 8,
      completedAt: '2026-11-20T10:00:00Z', correlationId: 'c-1' };
    const result = workflowInstanceEvidence(instance);
    expect(result.source).toBe('HidraAPI Workflow / instance');
    expect(result.value).toBe('COMPLETED');
    expect(result.revision).toBe('Workflow definition v8');
    expect(result.observedAt).toBe(instance.completedAt);
    expect(result.effectiveFrom).toBeUndefined();
    expect(result.quality).toBeUndefined();
  });

  it('does not infer a decision, cause, unit or revision from a correlation ID', () => {
    const entries: TimelineEntry[] = [{ id: 'event-1', sequence: 1, actionType: 'ASSIGN',
      occurredAt: '2026-11-20T09:00:00Z', correlationId: 'not-a-proof' } as TimelineEntry];
    const result = workflowTimelineEvidence(entries);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('ASSIGN');
    expect(result[0].source).toBe('HidraAPI Workflow / instance timeline');
    expect(result[0].status).toBeUndefined();
    expect(result[0].correlationId).toBeUndefined();
    expect(result[0].revision).toBeUndefined();
  });
});
