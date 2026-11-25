import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import { fetchIncident, fetchIncidents, fetchIncidentTimeline, fetchIncidentInvestigation, fetchIncidentEscalation } from '@/features/incident/api/incidentApi';
import {
  fetchLeakCandidate,
  fetchLeakCandidates,
  fetchLeakCase,
  fetchLeakCases,
  fetchLeakCandidateEvidence,
  fetchLeakInvestigation,
} from '@/features/incident/api/leakApi';
import {
  fetchCapa,
  fetchCapas,
  fetchHseCase,
  fetchHseCases,
  fetchScopedHseCases,
  fetchScopedHseCase,
  fetchScopedHseCapas,
  fetchScopedHseCapa,
  fetchScopedHseHistory,
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

describe('UXR-29 owner evidence and scoped reads', () => {
  beforeEach(() => { httpClient.mockReset(); });

  it('uses exact Incident and Leak evidence routes with no sidecar', async () => {
    const signal = new AbortController().signal;
    httpClient.mockResolvedValue({});
    await fetchIncidentTimeline('inc/1', signal);
    await fetchIncidentInvestigation('inc/1', signal);
    await fetchIncidentEscalation('inc/1', signal);
    await fetchLeakCandidateEvidence('candidate/1', signal);
    await fetchLeakInvestigation('case/1', signal);
    expect(httpClient.mock.calls.map(([config]) => config)).toEqual([
      '/api/v1/incident/incidents/inc%2F1/timeline',
      '/api/v1/incident/incidents/inc%2F1/investigation',
      '/api/v1/incident/incidents/inc%2F1/escalation',
      '/api/v1/leakdetection/candidates/candidate%2F1/evidence',
      '/api/v1/leakdetection/cases/case%2F1/investigation',
    ].map(url => ({ method: 'GET', url, signal })));
  });

  it('keeps all scoped HSE hierarchy and pagination in the exact request', async () => {
    const scope = { companyId: 'company/1', facilityId: 'facility/2' };
    const root = '/api/v1/hse/companies/company%2F1/facilities/facility%2F2/cases';
    const page = { page: 2, size: 25, items: [], total: 0 };
    const caseParams = { page: 2, size: 25, caseNumber: 'DUP' };
    const capaParams = { page: 1, size: 25, actionNumber: 'ACTION' };
    httpClient.mockResolvedValueOnce(page).mockResolvedValueOnce({ id: 'case/1' })
      .mockResolvedValueOnce(page).mockResolvedValueOnce({ id: 'capa/1' }).mockResolvedValueOnce(page);
    expect(await fetchScopedHseCases(scope, caseParams)).toEqual(page);
    await fetchScopedHseCase(scope, 'case/1');
    await fetchScopedHseCapas(scope, 'case/1', capaParams);
    await fetchScopedHseCapa(scope, 'case/1', 'capa/1');
    await fetchScopedHseHistory(scope, 'case/1', { page: 0, size: 25 });
    expect(httpClient.mock.calls.map(([config]) => config)).toEqual([
      { method: 'GET', url: root, params: caseParams },
      { method: 'GET', url: root + '/case%2F1' },
      { method: 'GET', url: root + '/case%2F1/capas', params: capaParams },
      { method: 'GET', url: root + '/case%2F1/capas/capa%2F1' },
      { method: 'GET', url: root + '/case%2F1/history', params: { page: 0, size: 25 } },
    ]);
  });

  it('propagates scoped denial and never falls back to generic HSE', async () => {
    const denial = new Error('denied');
    httpClient.mockRejectedValueOnce(denial);
    await expect(fetchScopedHseCases({ companyId: 'company', facilityId: 'facility' }, { page: 0 })).rejects.toBe(denial);
    expect(httpClient).toHaveBeenCalledTimes(1);
    expect(() => fetchScopedHseCases({ companyId: 'company', facilityId: '' }, {})).toThrow();
    expect(httpClient).toHaveBeenCalledTimes(1);
  });
});
