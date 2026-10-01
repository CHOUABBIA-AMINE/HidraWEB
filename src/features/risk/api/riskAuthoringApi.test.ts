import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import { addRiskEvidence, createRiskAssessment, createRiskRegister } from '@/features/risk/api/riskAuthoringApi';

describe('risk authoring API', () => {
  beforeEach(() => httpClient.mockReset());

  it('uses the canonical risk authoring endpoints', async () => {
    httpClient.mockResolvedValue({});

    const register = { code: 'RR-001', nameFr: 'Registre principal' };
    const assessment = { riskRegisterId: 'rr-1', assessmentNumber: 'RA-001', title: 'Assessment' };
    const evidence = { riskAssessmentId: 'ra-1', evidenceModule: 'integrity', evidenceType: 'inspection', evidenceId: 'ev-1' };

    await createRiskRegister(register);
    await createRiskAssessment(assessment);
    await addRiskEvidence(evidence);

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/api/v1/risk/registers',
      data: register,
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/risk/assessments',
      data: assessment,
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'POST',
      url: '/api/v1/risk/evidence',
      data: evidence,
    });
  });
});
