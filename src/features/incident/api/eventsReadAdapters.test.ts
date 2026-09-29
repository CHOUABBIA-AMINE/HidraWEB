import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import { fetchIncident, fetchIncidents } from '@/features/incident/api/incidentApi';
import {
  fetchLeakCandidate,
  fetchLeakCandidates,
  fetchLeakCase,
  fetchLeakCases,
} from '@/features/incident/api/leakApi';
import {
  fetchCapa,
  fetchCapas,
  fetchHseCase,
  fetchHseCases,
} from '@/features/incident/api/hseApi';

describe('events read adapters', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses canonical HidraAPI incident list/detail routes with backend pagination', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 2, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'inc/1' });

    await fetchIncidents({ page: 2, size: 50 });
    await fetchIncident('inc/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/incident/incidents',
      params: { page: 2, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/incident/incidents/inc%2F1',
    });
  });

  it('keeps leak candidate/case reads on HidraAPI and never introduces a sidecar transport', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'candidate/1' })
      .mockResolvedValueOnce({ content: [], page: 1, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'case/1' });

    await fetchLeakCandidates({ page: 0, size: 50 });
    await fetchLeakCandidate('candidate/1');
    await fetchLeakCases({ page: 1, size: 50 });
    await fetchLeakCase('case/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/leakdetection/candidates',
      params: { page: 0, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/leakdetection/candidates/candidate%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/leakdetection/cases',
      params: { page: 1, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/leakdetection/cases/case%2F1',
    });
  });

  it('uses canonical HSE case/CAPA list/detail routes with encoded identifiers', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'hse/1' })
      .mockResolvedValueOnce({ content: [], page: 3, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'capa/1' });

    await fetchHseCases({ page: 0, size: 50 });
    await fetchHseCase('hse/1');
    await fetchCapas({ page: 3, size: 50 });
    await fetchCapa('capa/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/hse/cases',
      params: { page: 0, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/hse/cases/hse%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/hse/capas',
      params: { page: 3, size: 50 },
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'GET',
      url: '/api/v1/hse/capas/capa%2F1',
    });
  });
});
