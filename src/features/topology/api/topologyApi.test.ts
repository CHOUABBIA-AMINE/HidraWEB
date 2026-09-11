import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import {
  fetchTopologyGeoJson,
  fetchTopologyLayer,
  fetchTopologyLayerFeatures,
  fetchTopologyLayers,
  searchTopology,
} from '@/features/topology/api/topologyApi';

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: vi.fn() }));

const http = vi.mocked(hidraHttpClient);

describe('HWEB-005 topology API adapter', () => {
  beforeEach(() => http.mockReset());

  it('uses only the published topology map endpoints and backend paging parameters', async () => {
    http.mockResolvedValue({});

    await fetchTopologyLayers();
    await fetchTopologyLayer('pipeline-systems');
    await fetchTopologyLayerFeatures({ layerId: 'pipeline-segments', page: 2, size: 25, query: 'SEG' });
    await fetchTopologyGeoJson({ layers: ['pipeline-systems', 'facilities'], page: 0, size: 1000 });
    await searchTopology({ query: ' station ', page: 0, size: 50 });

    expect(http).toHaveBeenNthCalledWith(1, { method: 'GET', url: '/api/v1/topology/map/layers' });
    expect(http).toHaveBeenNthCalledWith(2, { method: 'GET', url: '/api/v1/topology/map/layers/pipeline-systems' });
    expect(http).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/topology/map/layers/pipeline-segments/features',
      params: { page: 2, size: 25, q: 'SEG' },
    });
    expect(http).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/topology/map/geojson',
      params: { layers: 'pipeline-systems,facilities', page: 0, size: 1000 },
    });
    expect(http).toHaveBeenNthCalledWith(5, {
      method: 'GET',
      url: '/api/v1/topology/map/search',
      params: { q: 'station', page: 0, size: 50 },
    });
  });
});
