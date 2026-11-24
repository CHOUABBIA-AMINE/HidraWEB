import type { T28AuditEventPage, T28AuditExportManifest } from '@/api/generated/audit/model';
import type { PressureRestrictionDecisionEvidence } from '@/api/generated/topology/model';
import type { PermissionContextValue } from '@/features/permissions/permissionContext';
import { classifyOwnerError } from '@/shell/feedback/ownerFeedback';

export const pressureEvidenceRoute = '/api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence';
export const scopedAuditRoute = '/api/v1/audit/companies/{companyId}/facilities/{facilityId}';
export const riskEvent = 'RISK_ASSESSMENT_APPROVED';
export const riskPurpose = 'GZ2_SYNTHETIC_ASSURANCE';
export const riskFormat = 'GZ2_AUDIT_EVIDENCE_JSON_V1';
export const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function exactId(value: unknown, max = 120): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max &&
    value === value.trim() && value !== '.' && value !== '..' &&
    Array.from(value).every(character => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    });
}

export function admittedRoute(p: PermissionContextValue, route: string, method: 'GET' | 'POST') {
  return p.status === 'ready' && p.routes.some(r =>
    r.route === route && r.methods.includes(method) && p.can(r.permission));
}

/** Native owner delegation is metadata, not a resource authorization decision. */
export function scopedAuditAdmission(p: PermissionContextValue) {
  const has = (suffix: string, method: string) => p.routes.some(r =>
    r.route === scopedAuditRoute + suffix && r.methods.includes(method) &&
    r.enforcementStatus === 'native-owner-delegated');
  const read = p.status === 'ready' && p.permissions.has('audit:scoped-evidence:read') && has('/events', 'GET');
  const write = read && p.permissions.has('audit:scoped-evidence:export');
  return {
    read,
    create: write && has('/exports', 'POST'),
    manifest: write && has('/exports/{exportId}', 'GET'),
    download: write && has('/exports/{exportId}/content', 'GET'),
  };
}

export function evidenceError(error: unknown) {
  switch (classifyOwnerError(error).kind) {
    case 'authentication': return 'Sign in again to read audit evidence.';
    case 'denied': return 'Audit evidence unavailable or not authorized.';
    case 'conflict': return 'Audit request conflicts with current owner evidence. Review the inputs before retrying.';
    case 'validation': return 'Audit request criteria are invalid or exceed the supported bounds.';
    default: return 'Audit evidence could not be verified or loaded.';
  }
}

export function validatedPressureEvidence(value: PressureRestrictionDecisionEvidence, requestId: string) {
  const receipt = value?.publication;
  const decisions = value?.decisions;
  if (!receipt || receipt.requestId !== requestId || !Number.isSafeInteger(receipt.streamVersion) ||
      (receipt.streamVersion ?? -1) < 0 ||
      ![receipt.revisionId, receipt.terminationId].some(x => exactId(x)) ||
      !Array.isArray(decisions) || decisions.length < 1 || decisions.length > 2 ||
      decisions.some(d => !d || !exactId(d.auditEventId) || !exactId(d.actionId) ||
        !exactId(d.candidateId) || !exactId(d.taskId) || !exactId(d.instanceId) ||
        !exactId(d.reviewerId) || !d.decidedAt || !Number.isFinite(Date.parse(d.decidedAt))) ||
      new Set(decisions.map(d => d.auditEventId)).size !== decisions.length ||
      new Set(decisions.map(d => d.actionId)).size !== decisions.length ||
      new Set(decisions.map(d => d.candidateId)).size !== decisions.length) {
    throw new Error('Invalid owner pressure decision evidence.');
  }
  return { receipt, decisions };
}

export interface AuditScope { companyId: string; facilityId: string }
export interface AuditWindow { from: string; to: string }

/** Compare the owner's microsecond instants without rounding them through JS milliseconds. */
export function instantKey(value: string): bigint | undefined {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,6}))?Z$/.exec(value);
  if (!match) return undefined;
  const milliseconds = Date.parse(match[1] + 'Z');
  if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString().slice(0, 19) !== match[1]) return undefined;
  return BigInt(milliseconds) * 1000n + BigInt((match[2] ?? '').padEnd(6, '0'));
}

export function validWindow(scope: AuditScope, window: AuditWindow) {
  const from = instantKey(window.from), to = instantKey(window.to);
  return exactId(scope.companyId, 96) && exactId(scope.facilityId, 120) &&
    from !== undefined && to !== undefined && from < to && to - from <= 31n * 86400_000_000n;
}

export function validatedEventPage(value: T28AuditEventPage, window?: AuditWindow) {
  if (!Array.isArray(value?.items) || value.items.length > 25 ||
      value.items.some(item => !item || item.eventType !== riskEvent || !exactId(item.eventId) ||
        !exactId(item.operation) || !exactId(item.targetId) || !exactId(item.workflowActionId) ||
        !item.occurredAt || instantKey(item.occurredAt) === undefined ||
        (window !== undefined && (instantKey(item.occurredAt)! < instantKey(window.from)! ||
          instantKey(item.occurredAt)! >= instantKey(window.to)!))) ||
      new Set(value.items.map(item => item.eventId)).size !== value.items.length ||
      (value.nextCursor != null && !/^v1\.[A-Za-z0-9_-]{1,230}$/.test(value.nextCursor))) {
    throw new Error('Invalid owner Audit event page.');
  }
  return { items: value.items, nextCursor: value.nextCursor ?? undefined };
}

export function validatedManifest(value: T28AuditExportManifest, scope: AuditScope, exportId?: string, window?: AuditWindow) {
  if (!value || !value.exportId || !uuid.test(value.exportId) ||
      (exportId !== undefined && value.exportId !== exportId) ||
      value.companyId !== scope.companyId || value.facilityId !== scope.facilityId ||
      value.eventType !== riskEvent || value.purpose !== riskPurpose || value.format !== riskFormat ||
      value.status !== 'COMPLETED' || !value.from || !value.to ||
      !validWindow(scope, { from: value.from, to: value.to }) ||
      (window && (instantKey(value.from) !== instantKey(window.from) ||
        instantKey(value.to) !== instantKey(window.to))) ||
      !Number.isSafeInteger(value.eventCount) || (value.eventCount ?? -1) < 0 || (value.eventCount ?? 1001) > 1000 ||
      !Number.isSafeInteger(value.byteLength) || (value.byteLength ?? -1) < 0 || (value.byteLength ?? 262145) > 262144 ||
      !value.sha256 || !/^[0-9a-f]{64}$/.test(value.sha256) ||
      !value.completedAt || !Number.isFinite(Date.parse(value.completedAt))) {
    throw new Error('Invalid owner Audit export manifest.');
  }
  return { ...value, exportId: value.exportId, sha256: value.sha256, byteLength: value.byteLength! };
}
