import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: http }));
import { fetchRegionalTopologyFeature, fetchRegionalTopologyGeoJson, fetchRegionalTopologyLayer, fetchRegionalTopologyLayerFeatures, fetchRegionalTopologyLayers, searchRegionalTopology } from '@/features/topology/api/regionalTopologyApi';

beforeEach(() => http.mockReset());
describe('UXR-11 regional topology transport', () => {
  it('uses exact T34 company-bound search and server paging', async () => {
    http.mockResolvedValueOnce({ features: [], totalFeatures: 0 });
    await searchRegionalTopology('company', 'GZ2', 0, 25);
    expect(http).toHaveBeenCalledWith({
      method: 'GET', url: '/api/v1/topology/regional-map/search',
      params: { companyPartyId: 'company', q: 'GZ2', page: 0, size: 25 },
    });
  });
  it('retrieves a detail using the canonical entityId instead of the namespaced feature ID', async () => {
    http.mockResolvedValueOnce({ id: 'pipelines:p-1' });
    await fetchRegionalTopologyFeature('company', { layer: 'pipelines', entityId: 'p-1' });
    expect(http).toHaveBeenCalledWith({
      method: 'GET', url: '/api/v1/topology/regional-map/layers/pipelines/features/p-1',
      params: { companyPartyId: 'company' },
    });
  });
  it('propagates an opaque 404 unchanged', async () => {
    const denial = new Error('404');
    http.mockRejectedValueOnce(denial);
    let observed: unknown;
    try { await searchRegionalTopology('company', 'private', 0, 25); } catch (error) { observed = error; }
    expect(observed).toBe(denial);
  });
});

describe('UXR-22 regional map owner request boundary', () => {
  it('keeps company on fixed layer inventory and exact layer detail', async () => {
    http.mockResolvedValueOnce([]).mockResolvedValueOnce({ id: 'pipelines' });
    await fetchRegionalTopologyLayers('company-A');
    await fetchRegionalTopologyLayer('company-A', 'pipelines');
    expect(http).toHaveBeenNthCalledWith(1, {
      method: 'GET', url: '/api/v1/topology/regional-map/layers',
      params: { companyPartyId: 'company-A' },
    });
    expect(http).toHaveBeenNthCalledWith(2, {
      method: 'GET', url: '/api/v1/topology/regional-map/layers/pipelines',
      params: { companyPartyId: 'company-A' },
    });
  });

  it('keeps page, size and exact company on regional layer page', async () => {
    http.mockResolvedValueOnce({ features: [], totalFeatures: 0 });
    await fetchRegionalTopologyLayerFeatures('company-A', 'pipeline-segments', 2, 25);
    expect(http).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/topology/regional-map/layers/pipeline-segments/features',
      params: { companyPartyId: 'company-A', page: 2, size: 25 },
    });
  });

  it('requests only explicitly selected regional layers and the bounded map page', async () => {
    http.mockResolvedValueOnce({ features: [], totalFeatures: 0 });
    await fetchRegionalTopologyGeoJson('company-A', ['pipelines', 'facilities'], 1, 200);
    expect(http).toHaveBeenCalledWith({
      method: 'GET', url: '/api/v1/topology/regional-map/geojson',
      params: { companyPartyId: 'company-A', layers: 'pipelines,facilities', page: 1, size: 200 },
    });
    expect(http.mock.calls.flat().join(' ')).not.toContain('/api/v1/topology/map/');
  });

  it('propagates an opaque denied regional map response without substituting legacy geometry', async () => {
    const denied = new Error('opaque 404');
    http.mockRejectedValueOnce(denied);
    await expect(fetchRegionalTopologyGeoJson('company-A', ['pipelines'], 0, 200))
      .rejects.toBe(denied);
    expect(http).toHaveBeenCalledTimes(1);
  });
});
