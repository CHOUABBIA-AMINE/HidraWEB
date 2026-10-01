import type {
  CreateReportDefinitionRequest,
  GenerateReportArtifactRequest,
  QueueReportRunRequest,
  ReportDefinitionResponse,
  ReportOutputArtifactResponse,
  ReportRequestResponse,
  ReportRunResponse,
  RequestReportRequest,
} from '@/api/generated/reporting/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export function createReportDefinition(request: CreateReportDefinitionRequest): Promise<ReportDefinitionResponse> {
  return hidraHttpClient<ReportDefinitionResponse>({
    method: 'POST',
    url: '/api/v1/reporting/definitions',
    data: request,
  });
}

export function requestReport(request: RequestReportRequest): Promise<ReportRequestResponse> {
  return hidraHttpClient<ReportRequestResponse>({
    method: 'POST',
    url: '/api/v1/reporting/requests',
    data: request,
  });
}

export function queueReportRun(request: QueueReportRunRequest): Promise<ReportRunResponse> {
  return hidraHttpClient<ReportRunResponse>({
    method: 'POST',
    url: '/api/v1/reporting/runs',
    data: request,
  });
}

export function generateReportArtifact(request: GenerateReportArtifactRequest): Promise<ReportOutputArtifactResponse> {
  return hidraHttpClient<ReportOutputArtifactResponse>({
    method: 'POST',
    url: '/api/v1/reporting/artifacts',
    data: request,
  });
}
