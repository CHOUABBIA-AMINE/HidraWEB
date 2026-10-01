import type {
  AddRiskEvidenceRequest,
  CreateRiskAssessmentRequest,
  CreateRiskRegisterRequest,
  RiskAssessmentResponse,
  RiskRegisterResponse,
} from '@/api/generated/risk/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export function createRiskRegister(request: CreateRiskRegisterRequest): Promise<RiskRegisterResponse> {
  return hidraHttpClient<RiskRegisterResponse>({
    method: 'POST',
    url: '/api/v1/risk/registers',
    data: request,
  });
}

export function createRiskAssessment(request: CreateRiskAssessmentRequest): Promise<RiskAssessmentResponse> {
  return hidraHttpClient<RiskAssessmentResponse>({
    method: 'POST',
    url: '/api/v1/risk/assessments',
    data: request,
  });
}

export function addRiskEvidence(request: AddRiskEvidenceRequest): Promise<string> {
  return hidraHttpClient<string>({
    method: 'POST',
    url: '/api/v1/risk/evidence',
    data: request,
  });
}
