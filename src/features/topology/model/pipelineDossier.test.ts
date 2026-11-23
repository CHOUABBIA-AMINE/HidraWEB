import { describe, expect, it } from 'vitest';

import { qualifiedPressure, readSectionDetail } from '@/features/topology/model/pipelineDossier';

const qualified = {
  status: 'QUALIFIED', restrictionClass: 'UPPER_OPERATING_PRESSURE', scopeType: 'PIPELINE',
  pipelineId: 'pipeline-1', sectionId: null, conditionCode: 'NORMAL', upperPressure: 55,
  pressureUnit: 'bar', pressureBasis: 'GAUGE', effectiveFrom: '2026-11-01T00:00:00Z',
  revisionId: 'r1', engineeringSourceRevision: 'engineering-r1', sourceBaselineReceiptId: 'receipt-1',
};

describe('UXR-23 pipeline evidence', () => {
  it('shows pressure only for the exact qualified scope and condition', () => {
    expect(qualifiedPressure(qualified, 'pipeline-1', undefined, 'NORMAL')).toContain('55 bar · GAUGE');
    expect(qualifiedPressure(qualified, 'pipeline-1', 'section-1', 'NORMAL')).toBe('UNAVAILABLE');
    expect(qualifiedPressure(qualified, 'pipeline-1', undefined, 'OTHER')).toBe('UNAVAILABLE');
    expect(qualifiedPressure({ ...qualified, scopeType: 'SECTION', sectionId: 'section-1' },
      'pipeline-1', 'section-1', 'NORMAL')).toContain('engineering-r1');
  });

  it('suppresses any numeric value on conflicts and unavailable responses', () => {
    expect(qualifiedPressure({ ...qualified, status: 'CONFLICT' }, 'pipeline-1', undefined, 'NORMAL')).toBe('CONFLICT');
    expect(qualifiedPressure({ ...qualified, status: 'UNAVAILABLE' }, 'pipeline-1', undefined, 'NORMAL')).toBe('UNAVAILABLE');
    expect(qualifiedPressure({ ...qualified, pressureBasis: null }, 'pipeline-1', undefined, 'NORMAL')).toBe('UNAVAILABLE');
  });

  it('decodes the schema-less section detail and rejects mismatched IDs', () => {
    expect(readSectionDetail({ id: 's1', code: 'S-1', source: null, hidden: 'x' }, 's1'))
      .toMatchObject({ id: 's1', code: 'S-1', source: undefined });
    expect(() => readSectionDetail({ id: 's2' }, 's1')).toThrow();
    expect(() => readSectionDetail({ id: 's1', length: { value: 'bad' } }, 's1')).toThrow();
  });
});
