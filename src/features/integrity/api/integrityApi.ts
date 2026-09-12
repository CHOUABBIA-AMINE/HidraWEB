import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export interface CreateIntegrityAssessmentRequest {
  programId?: string;
  assessmentNumber?: string;
  title?: string;
  description?: string;
  assessmentTypeId?: string;
  methodologyId?: string;
  assessmentDate?: string;
  assessedByActorId?: string;
  workflowInstanceId?: string;
}

export interface IntegrityAssessmentResponse {
  id?: string;
  programId?: string;
  assessmentNumber?: string;
  title?: string;
  assessmentTypeId?: string;
  status?: string;
  assessmentDate?: string;
}

export function createIntegrityAssessment(
  request: CreateIntegrityAssessmentRequest,
): Promise<IntegrityAssessmentResponse> {
  return hidraHttpClient<IntegrityAssessmentResponse>({
    method: 'POST',
    url: '/api/v1/integrity/assessments',
    data: request,
  });
}
