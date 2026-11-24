import { beforeEach, describe, expect, it, vi } from 'vitest';

const http = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: http }));
import { fetchCurrentOperationalScopes, fetchCurrentRegionalAccess } from '@/features/context/api/identityOrganizationApi';

beforeEach(() => http.mockReset());

describe('UXR-09 regional-access adapter', () => {
  it('uses the exact T33 GET and company query', async () => {
    const decision = { resourceKind: 'PIPELINE_SYSTEM', resourceId: 'gz2', companyPartyId: 'company', permitted: true };
    http.mockResolvedValue(decision);
    await expect(fetchCurrentRegionalAccess('PIPELINE_SYSTEM', 'gz2', 'company')).resolves.toEqual(decision);
    expect(http).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: '/api/v1/identity/me/regional-access/PIPELINE_SYSTEM/gz2',
      params: { companyPartyId: 'company' },
    }));
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
    expect(http).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: '/api/v1/identity/me/regional-access/PIPELINE/private',
      params: { companyPartyId: 'company' },
    }));
  });
});


describe('T61 current employee discovery adapter', () => {
  it('uses only the exact company, never employee or administrator lookup', async () => {
    const scopes = [{ id: 7, type: 'PIPELINE_SYSTEM', targetId: 'gz2' }];
    http.mockResolvedValue(scopes);
    await expect(fetchCurrentOperationalScopes('company')).resolves.toEqual(scopes);
    expect(http).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET',
      url: '/api/v1/identity/me/regional-access/scopes', params: { companyPartyId: 'company' } }));
    expect(http).toHaveBeenCalledTimes(1);
  });
  it('preserves unavailable discovery without fallback', async () => {
    const error = new Error('403');
    http.mockRejectedValue(error);
    await expect(fetchCurrentOperationalScopes('company')).rejects.toBe(error);
    expect(http).toHaveBeenCalledTimes(1);
  });
});

it('rejects unsupported resource kinds before issuing T33 HTTP', async () => {
  await expect(fetchCurrentRegionalAccess('ORGANIZATION_UNIT', 'private', 'company')).rejects.toThrow();
  expect(http).not.toHaveBeenCalled();
});
