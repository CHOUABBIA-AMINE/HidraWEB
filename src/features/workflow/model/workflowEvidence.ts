import type { InstanceView, TimelineEntry } from '@/api/generated/workflow/model';
import type { EvidenceEvent, StatusEvidence } from '@/shell/evidence/evidenceTypes';

/** Exact Workflow-owned instance and timeline; correlation does not prove causality. */
export function workflowInstanceEvidence(instance: InstanceView): StatusEvidence {
  return {
    source: 'HidraAPI Workflow / instance',
    value: instance.status ?? '—',
    status: instance.status,
    observedAt: instance.completedAt ?? instance.cancelledAt ?? instance.startedAt,
    revision: instance.definitionVersion === undefined ? undefined : `Workflow definition v${instance.definitionVersion}`,
    reference: instance.id,
  };
}

export function workflowTimelineEvidence(entries: readonly TimelineEntry[]): EvidenceEvent[] {
  return entries.map(entry => ({
    source: 'HidraAPI Workflow / instance timeline',
    id: entry.id,
    title: entry.actionType ?? entry.decision ?? '—',
    occurredAt: entry.occurredAt,
    actor: entry.actorDisplayName ?? entry.actorId,
    note: entry.commentText ?? entry.decisionNote,
    status: entry.decision,
  }));
}
