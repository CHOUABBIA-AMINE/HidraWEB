import { readIntegrityFindingMaintenanceHandoff } from '@/api/generated/integrity/integrity';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type {
  CreateIntegrityAssessmentRequest,
  IntegrityAssessmentResponse,
} from '@/api/generated/integrity/model';

export type { CreateIntegrityAssessmentRequest };

export function createIntegrityAssessment(
  request: CreateIntegrityAssessmentRequest,
): Promise<IntegrityAssessmentResponse> {
  return hidraHttpClient<IntegrityAssessmentResponse>({
    method: 'POST',
    url: '/api/v1/integrity/assessments',
    data: request,
  });
}

export async function fetchIntegrityMaintenanceReceipt(findingId: string, approvalId: string, signal?: AbortSignal) {
  const receipt = await readIntegrityFindingMaintenanceHandoff(
    encodeURIComponent(findingId), encodeURIComponent(approvalId), signal,
  );
  if (receipt?.findingId !== findingId || receipt.approvalId !== approvalId) {
    throw new Error('Integrity maintenance receipt does not match the requested finding and approval.');
  }
  return receipt;
}
