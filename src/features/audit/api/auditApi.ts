import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { AuditExportRequestResponse, RequestAuditExportRequest } from '@/api/generated/audit/model';

export function requestAuditExport(request: RequestAuditExportRequest): Promise<AuditExportRequestResponse> {
  return hidraHttpClient<AuditExportRequestResponse>({
    method: 'POST',
    url: '/api/v1/audit/exports',
    data: request,
  });
}
