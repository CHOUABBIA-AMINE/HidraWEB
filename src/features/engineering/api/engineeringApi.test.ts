import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));

import {
  createMaintenanceWorkOrder,
  recordAssetCondition,
  registerMaintainableAsset,
  updateMaintainableAsset,
} from '@/features/assets/api/assetsApi';
import { createIntegrityAssessment } from '@/features/integrity/api/integrityApi';

describe('engineering typed API adapters', () => {
  beforeEach(() => httpClient.mockReset());

  it('uses generated assets request/response contracts on canonical endpoints', async () => {
    httpClient.mockResolvedValue({});
    await registerMaintainableAsset({ assetCode: 'A-1', assetName: 'Pump' });
    await recordAssetCondition({ maintainableAssetId: 'asset-1', conditionStatus: 'GOOD', conditionScore: 98 });
    await createMaintenanceWorkOrder({ maintainableAssetId: 'asset-1', title: 'Inspect' });
    await updateMaintainableAsset('asset/1', { expectedUpdatedAt: '2026-09-29T20:00:00Z', assetName: 'Pump A' });

    expect(httpClient).toHaveBeenNthCalledWith(1, { method: 'POST', url: '/api/v1/assets/maintainable-assets', data: { assetCode: 'A-1', assetName: 'Pump' } });
    expect(httpClient).toHaveBeenNthCalledWith(2, { method: 'POST', url: '/api/v1/assets/asset-conditions', data: { maintainableAssetId: 'asset-1', conditionStatus: 'GOOD', conditionScore: 98 } });
    expect(httpClient).toHaveBeenNthCalledWith(3, { method: 'POST', url: '/api/v1/assets/maintenance-work-orders', data: { maintainableAssetId: 'asset-1', title: 'Inspect' } });
    expect(httpClient).toHaveBeenNthCalledWith(4, { method: 'PATCH', url: '/api/v1/assets/maintainable-assets/asset%2F1', data: { expectedUpdatedAt: '2026-09-29T20:00:00Z', assetName: 'Pump A' } });
  });

  it('uses the generated integrity assessment contract on the canonical endpoint', async () => {
    httpClient.mockResolvedValue({ id: 'assessment-1' });
    const request = { programId: 'program-1', assessmentNumber: 'IA-1', title: 'ILI review' };
    await createIntegrityAssessment(request);
    expect(httpClient).toHaveBeenCalledWith({ method: 'POST', url: '/api/v1/integrity/assessments', data: request });
  });
});
