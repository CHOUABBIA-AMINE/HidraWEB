import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import {
  fetchTopologyGeoJson,
  fetchTopologyLayer,
  fetchTopologyLayerFeatures,
  fetchTopologyLayers,
  searchTopology,
} from '@/features/topology/api/topologyApi';

describe('topology API adapter', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses the canonical layer catalog and detail endpoints with encoded layer ids', async () => {
    httpClient
      .mockResolvedValueOnce([{ id: 'pipeline-systems', label: 'Pipeline systems', geometryType: 'MultiLineString' }])
      .mockResolvedValueOnce({ id: 'pipeline systems', label: 'Pipeline systems', geometryType: 'MultiLineString' });

    await fetchTopologyLayers();
    await fetchTopologyLayer('pipeline systems');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/topology/map/layers',
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/topology/map/layers/pipeline%20systems',
    });
  });

  it('normalizes layer-feature pagination and query values without inventing geometry', async () => {
    httpClient.mockResolvedValueOnce({
      type: 'FeatureCollection',
      layer: 'pipelines',
      page: 0,
      size: 25,
      totalFeatures: 0,
      totalPages: 0,
      hasNext: false,
      layers: ['pipelines'],
      features: [],
    });

    await fetchTopologyLayerFeatures({
      layerId: 'pipelines',
      query: '  PL-1  ',
    });

    expect(httpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/topology/map/layers/pipelines/features',
      params: { page: 0, size: 25, q: 'PL-1' },
    });
  });

  it('passes only backend layer identifiers to the canonical GeoJSON endpoint', async () => {
    httpClient.mockResolvedValueOnce({
      type: 'FeatureCollection',
      page: 0,
      size: 1000,
      totalFeatures: 0,
      totalPages: 0,
      hasNext: false,
      layers: ['pipeline-systems', 'pipelines'],
      features: [],
    });

    await fetchTopologyGeoJson({
      layers: ['pipeline-systems', 'pipelines'],
    });

    expect(httpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/topology/map/geojson',
      params: {
        layers: 'pipeline-systems,pipelines',
        page: 0,
        size: 1000,
      },
    });
  });

  it('uses the backend search contract and trims the search term', async () => {
    httpClient.mockResolvedValueOnce({
      query: 'PS-1',
      type: 'FeatureCollection',
      page: 0,
      size: 50,
      totalFeatures: 0,
      totalPages: 0,
      hasNext: false,
      features: [],
    });

    await searchTopology({ query: '  PS-1  ' });

    expect(httpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/topology/map/search',
      params: {
        q: 'PS-1',
        page: 0,
        size: 50,
      },
    });
  });
});
