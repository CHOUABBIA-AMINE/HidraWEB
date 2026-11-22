import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: http }));
import { fetchCurrentRegionalAccess } from '@/features/context/api/identityOrganizationApi';

beforeEach(() => http.mockReset());

describe('UXR-09 regional-access adapter', () => {
  it('uses the exact T33 GET and company query', async () => {
    const decision = { resourceKind: 'PIPELINE_SYSTEM', resourceId: 'gz2', companyPartyId: 'company', permitted: true };
    http.mockResolvedValue(decision);
    await expect(fetchCurrentRegionalAccess('PIPELINE_SYSTEM', 'gz2', 'company')).resolves.toEqual(decision);
    expect(http).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/identity/me/regional-access/PIPELINE_SYSTEM/gz2',
      params: { companyPartyId: 'company' },
    });
  });
  it('preserves opaque 404 denial without converting it into a permitted response', async () => {
    const denial = new Error('404');
    http.mockRejectedValueOnce(denial);
    let received: unknown;
    try {
      await fetchCurrentRegionalAccess('PIPELINE', 'private', 'company');
    } catch (error) {
      received = error;
    }
    expect(received).toBe(denial);
    expect(http).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/v1/identity/me/regional-access/PIPELINE/private',
      params: { companyPartyId: 'company' },
    });
  });
});
