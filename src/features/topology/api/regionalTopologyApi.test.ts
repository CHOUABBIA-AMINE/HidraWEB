import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: http }));
import { fetchRegionalTopologyFeature, searchRegionalTopology } from '@/features/topology/api/regionalTopologyApi';

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
