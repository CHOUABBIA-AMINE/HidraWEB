/** Display-only contracts. Owners supply already-admitted facts, never inferred joins. */
export type EvidenceState<T> =
  | { kind: 'ready'; value: T }
  | { kind: 'loading' | 'unavailable' | 'denied' | 'failed' };

export interface StatusEvidence {
  /** Explicit originating owner/contract, not inferred from page selection. */
  source: string;
  value: string;
  status?: string;
  observedAt?: string;
  receivedAt?: string;
  unit?: string;
  quality?: string;
  revision?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  reference?: string;
}

export interface EvidenceEvent {
  source: string;
  title: string;
  id?: string;
  occurredAt?: string;
  actor?: string;
  note?: string;
  status?: string;
  quality?: string;
  unit?: string;
  revision?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  correlationId?: string;
  /** Exact Workflow task ID returned by the owning timeline, never inferred. */
  workflowTaskId?: string;
}
