import type { GenerateReportArtifactRequest, QueueReportRunRequest } from '@/api/generated/reporting/model';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import {
  createReportDefinition,
  generateReportArtifact,
  queueReportRun,
  requestReport,
} from '@/features/reporting/api/reportingLifecycleApi';

describe('reporting lifecycle API', () => {
  beforeEach(() => httpClient.mockReset());

  it('uses the canonical reporting lifecycle endpoints', async () => {
    httpClient.mockResolvedValue({});

    const definition = { code: 'OPS-DAILY', nameFr: 'Rapport quotidien' };
    const request = { reportDefinitionId: 'def-1', purpose: 'Operations review' };
    const run: QueueReportRunRequest = { reportDefinitionId: 'def-1', reportRequestId: 'req-1', runMode: 'MANUAL' };
    const artifact: GenerateReportArtifactRequest = { reportRunId: 'run-1', artifactType: 'PRIMARY_REPORT', format: 'PDF', fileName: 'ops.pdf' };

    await createReportDefinition(definition);
    await requestReport(request);
    await queueReportRun(run);
    await generateReportArtifact(artifact);

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/api/v1/reporting/definitions',
      data: definition,
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/reporting/requests',
      data: request,
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'POST',
      url: '/api/v1/reporting/runs',
      data: run,
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'POST',
      url: '/api/v1/reporting/artifacts',
      data: artifact,
    });
  });
});
