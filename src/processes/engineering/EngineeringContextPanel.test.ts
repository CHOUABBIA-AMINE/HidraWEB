import { describe, expect, it } from 'vitest';

import { collectEngineeringContext } from '@/processes/engineering/EngineeringContextPanel';

describe('collectEngineeringContext', () => {
  it('exposes only backend-published neutral references', () => {
    expect(collectEngineeringContext({
      topologyAssetId: 'topology-1',
      topologyAssetNameSnapshot: 'Line 12',
      documentReferenceId: 'document-7',
      documentTitleSnapshot: 'Inspection report',
      riskAssessmentId: 'risk-3',
      incidentId: 'incident-4',
      status: 'OPEN',
      updatedAt: '2026-09-12T18:00:00Z',
    })).toEqual([
      { kind: 'Topology', id: 'topology-1', label: 'Line 12', sourceField: 'topologyAssetId' },
      { kind: 'Document', id: 'document-7', label: 'Inspection report', sourceField: 'documentReferenceId' },
      { kind: 'Risk', id: 'risk-3', label: undefined, sourceField: 'riskAssessmentId' },
      { kind: 'Incident', id: 'incident-4', label: undefined, sourceField: 'incidentId' },
    ]);
  });

  it('fails closed when the record publishes no supported relationship fields', () => {
    expect(collectEngineeringContext({ id: 'record-1', status: 'OPEN', updatedAt: '2026-09-12T18:00:00Z' })).toEqual([]);
  });

  it('does not treat blank references as relationships', () => {
    expect(collectEngineeringContext({ topologyAssetId: ' ', documentReferenceId: null, riskId: '' })).toEqual([]);
  });
});
