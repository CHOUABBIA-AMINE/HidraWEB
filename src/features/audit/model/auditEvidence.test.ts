import { describe, expect, it } from 'vitest';
import type { PermissionContextValue } from '@/features/permissions/permissionContext';
import { exactId, instantKey, riskEvent, riskFormat, riskPurpose, scopedAuditAdmission, scopedAuditRoute,
  validatedEventPage, validatedManifest, validatedPressureEvidence, validWindow } from './auditEvidence';

const scope = { companyId: 'company-a', facilityId: 'facility-a' };
const window = { from: '2026-11-24T00:00:00.000001Z', to: '2026-11-24T00:00:00.000002Z' };
const exportId = 'a021e8b0-2de0-4272-87cb-74357a27ef96';
const receipt = {
  ...scope, ...window, exportId, status: 'COMPLETED', format: riskFormat, purpose: riskPurpose,
  eventType: riskEvent, eventCount: 1, byteLength: 42, sha256: 'a'.repeat(64), completedAt: window.to,
};
const witness = { candidateId: 'candidate', actionId: 'action', taskId: 'task', instanceId: 'instance',
  reviewerId: 'reviewer', auditEventId: 'audit-event', decidedAt: window.to };

describe('UXR-27 owner evidence validation', () => {
  it('rejects every C0 and DEL control character while preserving exact identifier rules', () => {
    for (let code = 0; code < 32; code++) {
      expect(exactId('a' + String.fromCharCode(code) + 'b')).toBe(false);
    }
    expect(exactId('a' + String.fromCharCode(127) + 'b')).toBe(false);
    for (const value of ['', '.', '..', ' leading', 'trailing ', 'x'.repeat(121), null, 123]) {
      expect(exactId(value)).toBe(false);
    }
    expect(exactId('company-a')).toBe(true);
    expect(exactId('facility 1')).toBe(true);
    expect(exactId('a' + String.fromCharCode(128) + 'b')).toBe(true);
    expect(exactId('x'.repeat(120))).toBe(true);
    expect(exactId('abcd', 3)).toBe(false);
    expect(exactId('abcd', 4)).toBe(true);
  });

  it('uses exact microsecond windows and rejects invalid dates and oversized windows', () => {
    expect(validWindow(scope, window)).toBe(true);
    expect(instantKey(window.to)! - instantKey(window.from)!).toBe(1n);
    expect(validWindow(scope, { ...window, from: window.to })).toBe(false);
    expect(validWindow(scope, { from: '2026-02-30T00:00:00Z', to: window.to })).toBe(false);
    expect(validWindow(scope, { from: '2026-10-01T00:00:00Z', to: window.to })).toBe(false);
  });

  it('accepts only exact frozen Risk manifests and rejects identity, event and microsecond mismatches', () => {
    expect(validatedManifest(receipt, scope, exportId, window)).toMatchObject(receipt);
    for (const invalid of [{ ...receipt, facilityId: 'foreign' }, { ...receipt, eventType: 'OPERATING_PRESSURE_RESTRICTION_APPROVED' },
      { ...receipt, from: '2026-11-24T00:00:00Z' }, { ...receipt, sha256: 'not-a-digest' }, { ...receipt, byteLength: 262145 }]) {
      expect(() => validatedManifest(invalid, scope, exportId, window)).toThrow();
    }
  });

  it('preserves exact Audit witnesses and refuses mismatched or duplicate identities', () => {
    const evidence = { publication: { requestId: exportId, revisionId: 'revision', streamVersion: 3 }, decisions: [witness] };
    expect(validatedPressureEvidence(evidence, exportId).decisions).toEqual([witness]);
    expect(() => validatedPressureEvidence(evidence, 'foreign')).toThrow();
    expect(() => validatedPressureEvidence({ ...evidence, decisions: [witness, witness] }, exportId)).toThrow();
    expect(() => validatedPressureEvidence({ ...evidence, decisions: [{ ...witness, auditEventId: '' }] }, exportId)).toThrow();
  });

  it('requires an actual typed event list and never treats a malformed result as empty', () => {
    const item = { eventId: 'audit', eventType: riskEvent, operation: 'APPROVE', targetId: 'risk',
      workflowActionId: 'action', occurredAt: window.from };
    expect(validatedEventPage({ items: [item], nextCursor: 'v1.abc' }).items).toEqual([item]);
    expect(() => validatedEventPage({})).toThrow();
    expect(() => validatedEventPage({ items: [{ ...item, eventType: 'PRESSURE' }] })).toThrow();
    expect(() => validatedEventPage({ items: [], nextCursor: 'wrong' })).toThrow();
  });

  it('requires native route metadata and explicit owner codes, not the administrative wildcard', () => {
    const routes = [['/events','GET'], ['/exports','POST'], ['/exports/{exportId}','GET'], ['/exports/{exportId}/content','GET']]
      .map(([suffix, method]) => ({ route: scopedAuditRoute + suffix, methods: [method], module: 'audit',
        resource: 'companies', action: 'read', permission: 'audit:companies:read', enforcementStatus: 'native-owner-delegated' }));
    const permissions = (codes: string[]): PermissionContextValue => ({
      status: 'ready', routes, permissions: new Set(codes), modules: new Set(['audit']), catalogOnly: false,
      can: () => true, hasAnyModuleCapability: () => true, reload: async () => undefined,
    });
    expect(scopedAuditAdmission(permissions(['*']))).toEqual({ read: false, create: false, manifest: false, download: false });
    expect(scopedAuditAdmission(permissions(['audit:scoped-evidence:read']))).toEqual({ read: true, create: false, manifest: false, download: false });
    expect(scopedAuditAdmission(permissions(['audit:scoped-evidence:read', 'audit:scoped-evidence:export'])))
      .toEqual({ read: true, create: true, manifest: true, download: true });
    expect(scopedAuditAdmission({ ...permissions(['audit:scoped-evidence:read']), routes: [] }).read).toBe(false);
  });
});
