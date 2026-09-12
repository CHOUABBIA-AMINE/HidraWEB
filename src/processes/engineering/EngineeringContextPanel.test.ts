import { describe, expect, it } from 'vitest';

import { collectEngineeringContext } from '@/processes/engineering/EngineeringContextPanel';

describe('collectEngineeringContext', () => {
  it('exposes backend-published direct neutral references using the actual integrity/assets field names', () => {
    expect(collectEngineeringContext({
      topologyAssetId: 'topology-1',
      topologyAssetNameSnapshot: 'Line 12',
      documentReferenceId: 'document-7',
      documentTitleSnapshot: 'Inspection report',
      riskAssessmentId: 'risk-3',
      sourceIncidentId: 'incident-4',
      status: 'OPEN',
      updatedAt: '2026-09-12T18:00:00Z',
    })).toEqual([
      { kind: 'Topology', id: 'topology-1', label: 'Line 12', sourceField: 'topologyAssetId' },
      { kind: 'Document', id: 'document-7', label: 'Inspection report', sourceField: 'documentReferenceId' },
      { kind: 'Risk', id: 'risk-3', label: undefined, sourceField: 'riskAssessmentId' },
      { kind: 'Incident', id: 'incident-4', label: undefined, sourceField: 'sourceIncidentId' },
    ]);
  });

  it('uses explicit module-qualified source and target references without guessing a relationship', () => {
    expect(collectEngineeringContext({
      sourceModule: 'risk',
      sourceReferenceId: 'risk-source-1',
      targetModule: 'incident',
      targetReferenceId: 'incident-target-1',
    })).toEqual([
      { kind: 'Risk', id: 'risk-source-1', label: undefined, sourceField: 'sourceModule/sourceReferenceId' },
      { kind: 'Incident', id: 'incident-target-1', label: undefined, sourceField: 'targetModule/targetReferenceId' },
    ]);
  });

  it('fails closed when the record publishes no supported relationship fields', () => {
    expect(collectEngineeringContext({ id: 'record-1', status: 'OPEN', updatedAt: '2026-09-12T18:00:00Z' })).toEqual([]);
  });

  it('does not treat blank or unqualified references as relationships', () => {
    expect(collectEngineeringContext({
      topologyAssetId: ' ',
      documentReferenceId: null,
      sourceModule: 'incident',
      sourceReferenceId: '',
      targetModule: 'unknown-module',
      targetReferenceId: 'target-1',
    })).toEqual([]);
  });
});
