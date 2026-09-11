import { describe, expect, it } from 'vitest';

import type { FeatureCollection } from '@/api/generated/topology/model';
import { toHidraMapFeatureCollection } from '@/features/topology/model/topologyPresentation';

const collection: FeatureCollection = {
  type: 'FeatureCollection',
  name: 'topology-map',
  page: 0,
  size: 1000,
  totalFeatures: 2,
  totalPages: 1,
  hasNext: false,
  layers: ['facilities', 'pipeline-segments'],
  features: [
    {
      type: 'Feature',
      id: 'facility-1',
      geometry: { type: 'Point', coordinates: [2.1, 36.7] },
      properties: { layer: 'facilities', entityType: 'facility', entityId: 'facility-1', code: 'FAC-1', status: 'ACTIVE' },
    },
    {
      type: 'Feature',
      id: 'segment-1',
      geometry: { type: 'LineString', coordinates: [[2.1, 36.7], [2.2, 36.8]] },
      properties: { layer: 'pipeline-segments', entityType: 'pipeline-segment', entityId: 'segment-1', code: 'SEG-1', pipelineSystemId: 'system-1', fromNodeId: 'node-1', toNodeId: 'node-2' },
    },
  ],
};

describe('HWEB-005 topology presentation model', () => {
  it('converts typed backend geometry to the map abstraction without changing business properties', () => {
    const mapCollection = toHidraMapFeatureCollection(collection);
    expect(mapCollection.features).toHaveLength(2);
    expect(mapCollection.features[0]).toMatchObject({ id: 'facility-1', geometry: { type: 'Point' }, properties: { layer: 'facilities', code: 'FAC-1' } });
    expect(mapCollection.features[1]).toMatchObject({ id: 'segment-1', geometry: { type: 'LineString' }, properties: { pipelineSystemId: 'system-1' } });
  });
});
