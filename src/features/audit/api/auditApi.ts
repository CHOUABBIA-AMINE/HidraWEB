import { hidraAxios } from '@/api/client/hidraAxios';
import { authenticationGateway } from '@/app/auth/authenticationGateway';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { createT28AuditExport, readT28AuditExportManifest, searchT28AuditEvents } from '@/api/generated/audit/audit';
import type { AuditExportRequestResponse, RequestAuditExportRequest, T28AuditExportManifest } from '@/api/generated/audit/model';
import { getPressureRestrictionDecisionEvidence } from '@/api/generated/topology/topology';

import {
  instantKey, riskEvent, riskPurpose, validatedEventPage, validatedManifest, validatedPressureEvidence,
  type AuditScope, type AuditWindow,
} from '../model/auditEvidence';

export async function requestAuditExport(request: RequestAuditExportRequest, expectedActorId: string, permission: string): Promise<AuditExportRequestResponse> {
  const principal = await authenticationGateway.loadCurrentPrincipal();
  if (principal.userId !== expectedActorId || !principal.userId ||
      (!principal.permissions.includes(permission) && !principal.permissions.includes('*'))) {
    throw new Error('Current export requester or grant unavailable.');
  }
  return hidraHttpClient<AuditExportRequestResponse>({
    method: 'POST',
    url: '/api/v1/audit/exports',
    data: { ...request, requestedByActorId: principal.userId, requestedByDisplayNameSnapshot: principal.displayName },
  });
}

export async function readPressureDecisionEvidence(companyPartyId: string, pipelineId: string, requestId: string, sectionId?: string) {
  return validatedPressureEvidence(await getPressureRestrictionDecisionEvidence(
    encodeURIComponent(pipelineId), encodeURIComponent(requestId), { companyPartyId, sectionId },
  ), requestId);
}

export async function searchScopedAudit(scope: AuditScope, window: AuditWindow, cursor?: string) {
  return validatedEventPage(await searchT28AuditEvents(
    encodeURIComponent(scope.companyId), encodeURIComponent(scope.facilityId),
    { ...window, eventType: riskEvent, limit: 25, ...(cursor ? { cursor } : {}) },
  ), window);
}

export async function createScopedAuditExport(scope: AuditScope, window: AuditWindow, requestKey: string) {
  return validatedManifest(await createT28AuditExport(
    encodeURIComponent(scope.companyId), encodeURIComponent(scope.facilityId),
    { ...window, requestKey, eventType: riskEvent, purpose: riskPurpose },
  ), scope, undefined, window);
}

export async function readScopedAuditManifest(scope: AuditScope, exportId: string) {
  return validatedManifest(await readT28AuditExportManifest(
    encodeURIComponent(scope.companyId), encodeURIComponent(scope.facilityId), encodeURIComponent(exportId),
  ), scope, exportId);
}

/** The published schema uses a string/byte response; use the shared binary transport
 * to preserve the exact owner bytes and headers instead of parsing or re-encoding JSON. */
export async function downloadScopedAudit(scope: AuditScope, previous: T28AuditExportManifest) {
  const expected = validatedManifest(previous, scope);
  const fresh = await readScopedAuditManifest(scope, expected.exportId);
  if (fresh.sha256 !== expected.sha256 || fresh.byteLength !== expected.byteLength ||
      fresh.eventCount !== expected.eventCount || instantKey(fresh.from!) !== instantKey(expected.from!) ||
      instantKey(fresh.to!) !== instantKey(expected.to!) ||
      fresh.completedAt !== expected.completedAt) throw new Error('Frozen manifest changed.');
  const path = '/api/v1/audit/companies/' + encodeURIComponent(scope.companyId) +
    '/facilities/' + encodeURIComponent(scope.facilityId) + '/exports/' + encodeURIComponent(fresh.exportId) + '/content';
  const result = await hidraAxios.get<Blob>(path, { responseType: 'blob' });
  const filename = 'gz2-audit-' + fresh.exportId + '.json';
  const hexBytes = fresh.sha256.match(/../g)!.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
  const digest = 'sha-256=:' + btoa(hexBytes) + ':';
  if (result.status !== 200 || !(result.data instanceof Blob) ||
      result.data.size !== fresh.byteLength ||
      result.headers['content-type'] !== 'application/json' ||
      result.headers['content-disposition'] !== 'attachment; filename="' + filename + '"' ||
      result.headers['content-digest'] !== digest) throw new Error('Audit content does not match its owner manifest.');
  // Verify transport byte integrity against the owner digest, not a business seal.
  if (!globalThis.crypto.subtle) throw new Error('Secure digest verification unavailable.');
  const hash = await globalThis.crypto.subtle.digest('SHA-256', await result.data.arrayBuffer());
  const actual = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  if (actual !== fresh.sha256) throw new Error('Audit content checksum mismatch.');
  return { blob: result.data, filename };
}
