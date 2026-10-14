import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-audit-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const raw = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(raw.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-audit-63f3f60974ce57eb8cd5e42910397615195624fb.json'), 'utf8'));

test('Audit source exactly matches the published HidraAPI OpenAPI slice', () => {
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    '2d08cfb549d5ca4bccb2905eccede642c5d5b344ccd4c4cb1abdc5a8b35fe663');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 7);
  assert.equal(Object.keys(current.components.schemas).length, 6);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/audit/')));
});

test('Audit event and access records retain precise backend-owned types', () => {
  for (const [route, request, response] of [
    ['/api/v1/audit/events', 'RecordAuditEventRequest', 'AuditEventResponse'],
    ['/api/v1/audit/access-records', 'RecordAuditAccessRequest', 'AuditAccessRecordResponse'],
  ]) {
    const operation = current.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.ok(current.components.schemas.RecordAuditEventRequest.properties.operation.enum.includes('APPROVE'));
  assert.ok(current.components.schemas.RecordAuditEventRequest.properties.actorType.enum.includes('SERVICE_ACCOUNT'));
  assert.ok(current.components.schemas.AuditEventResponse.properties.eventStatus.enum.includes('SEALED'));
  assert.deepEqual(current.components.schemas.RecordAuditAccessRequest.properties.accessType.enum,
    ['SEARCH', 'VIEW', 'EXPORT', 'VERIFY_SEAL', 'ARCHIVE', 'PURGE_REQUEST']);
  assert.equal(current.components.schemas.RecordAuditAccessRequest.properties.resultCount.format, 'int32');
});

test('Audit export retains existing canonical route and typed response', () => {
  const exportOp = current.paths['/api/v1/audit/exports'].post;
  assert.deepEqual(exportOp.security, [{ hidraBearerJwt: [] }]);
  assert.equal(exportOp.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/RequestAuditExportRequest');
  assert.equal(exportOp.responses['200'].content['*/*'].schema.$ref,
    '#/components/schemas/AuditExportRequestResponse');
  assert.deepEqual(current.components.schemas.AuditExportRequestResponse.properties.status.enum,
    ['REQUESTED', 'APPROVED', 'REJECTED', 'RUNNING', 'COMPLETED', 'FAILED', 'EXPIRED']);
  assert.ok(current.paths['/api/v1/audit/capabilities'].get);
});

test('legacy Audit methods, generation pin and other source locks remain enforced', () => {
  for (const [route, methods] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
    }
  }
  const findings = compareContractSlice('audit', legacy, current);
  assert.ok(!findings.some((x) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(x.kind)));
  const config = fs.readFileSync(path.join(root, 'orval.audit.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${name}`));
  assert.ok(!config.includes('hidra-audit-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const gate = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const proof of [
    'AUDIT_CURRENT_PROOF', 'source-backed Audit contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF', 'HSE_CURRENT_PROOF', 'ASSETS_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(gate.includes(proof));
  }
});
