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
