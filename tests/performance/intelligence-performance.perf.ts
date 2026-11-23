import { describe, expect, it } from 'vitest';

import type { ReadingView } from '@/api/generated/telemetry-monitoring/model';
import type { FeatureCollection } from '@/api/generated/topology/model';
import { legacyReadingTimeline } from '@/features/telemetry-monitoring/model/telemetryEvidence';
import { toHidraMapFeatureCollection } from '@/features/topology/model/topologyPresentation';

function elapsedMs(start: number): number {
  return performance.now() - start;
}

// These budgets intentionally exercise imported production presentation
// adapters. Metric aggregation, scenario comparison and hydraulic simulation
// remain HidraAPI-owned; a function defined solely in a benchmark proves
// nothing about those backend computations.
describe('HWEB-013 frontend operational evidence adapter budgets', () => {
  it('projects 100,000 owner-provided telemetry readings into one point timeline within 1500 ms', () => {
    const readings = Array.from({ length: 100_000 }, (_, index) => ({
      id: `reading-${index}`,
      pointId: index % 10 === 0 ? 'PT-1' : 'PT-2',
      numericValue: index % 1000,
      unitId: 'bar',
      qualityCodeId: 'GOOD',
      state: 'TRUSTED',
      sourceTimestamp: '2026-09-11T12:00:00Z',
    })) as ReadingView[];

    const start = performance.now();
    const timeline = legacyReadingTimeline(readings, 'PT-1');
    const duration = elapsedMs(start);

    expect(timeline).toHaveLength(10_000);
    expect(timeline[0]).toMatchObject({ id: 'reading-0', title: '0', unit: 'bar' });
    expect(timeline[9_999].id).toBe('reading-99990');
    expect(duration).toBeLessThan(1_500);
  });

  it('converts 25,000 typed backend topology features into the map abstraction within 1500 ms', () => {
    const features = Array.from({ length: 25_000 }, (_, index) => ({
      type: 'Feature',
      id: `feature-${index}`,
      geometry: index % 2 === 0
        ? { type: 'LineString', coordinates: [[2.1, 36.7], [2.2, 36.8]] }
        : { type: 'Point', coordinates: [2.1, 36.7] },
      properties: { layer: index % 2 === 0 ? 'pipeline-segments' : 'facilities', code: `F-${index}`, entityId: `asset-${index}` },
    }));
    const ownerResponse = {
      type: 'FeatureCollection', name: 'synthetic-topology',
      page: 0, size: features.length, totalFeatures: features.length, totalPages: 1,
      hasNext: false, layers: ['facilities', 'pipeline-segments'], features,
    } as unknown as FeatureCollection;

    const start = performance.now();
    const mapped = toHidraMapFeatureCollection(ownerResponse);
    const duration = elapsedMs(start);

    expect(mapped.features).toHaveLength(25_000);
    expect(mapped.features[0]).toMatchObject({ id: 'feature-0', geometry: { type: 'LineString' }, properties: { code: 'F-0' } });
    expect(mapped.features[24_999]).toMatchObject({ id: 'feature-24999', geometry: { type: 'Point' }, properties: { code: 'F-24999' } });
    expect(duration).toBeLessThan(1_500);
  });
});
