import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-leak-da4ce33ead7db40776049c861027947b61b96270.json';
const candidateFile = path.join(root, 'openapi/candidates', name);
const originalFile = path.join(root, 'openapi/hidra-leak-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const bytes = fs.readFileSync(candidateFile);
const candidate = JSON.parse(bytes.toString('utf8'));
const original = JSON.parse(fs.readFileSync(originalFile, 'utf8'));

test('Leak Detection slice matches the published HidraAPI OpenAPI artifact', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    '4c55a76cdf581954c2a35fce197ce4c0df3b0f827c09752fe9091b3649bfc91c');
  assert.equal(candidate.openapi, '3.1.0');
  assert.equal(Object.keys(candidate.paths).length, 9);
  assert.equal(Object.keys(candidate.components.schemas).length, 9);
  assert.equal(candidate.servers, undefined);
  assert.ok(Object.keys(candidate.paths).every((route) => route.startsWith('/api/v1/leakdetection/')));
});

test('candidate and case creation requests have source-backed transport types', () => {
  const commands = [
    ['/api/v1/leakdetection/candidates', 'CreateLeakCandidateRequest', 'LeakCandidateResponse'],
    ['/api/v1/leakdetection/cases', 'OpenLeakCaseRequest', 'LeakCaseResponse'],
  ];
  for (const [route, request, response] of commands) {
    const operation = candidate.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(candidate.components.schemas.CreateLeakCandidateRequest.properties.suspectedAt.format, 'date-time');
  assert.equal(candidate.components.schemas.OpenLeakCaseRequest.properties.confidenceScore.type, 'number');
  assert.deepEqual(candidate.components.schemas.LeakCandidateResponse.properties.severityLevel.enum,
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'UNKNOWN']);
});

test('escalation stays an explicit backend command without frontend authorization inference', () => {
  const operation = candidate.paths['/api/v1/leakdetection/cases/escalations'].post;
  assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
  assert.equal(operation.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/EscalateLeakCaseRequest');
  assert.equal(operation.responses['200'].content['*/*'].schema.type, 'string');
  assert.deepEqual(candidate.components.schemas.EscalateLeakCaseRequest.properties.targetType.enum,
    ['ALARM', 'INCIDENT', 'WORKFLOW', 'NOTIFICATION', 'AUDIT', 'MANUAL_REFERENCE']);
  assert.ok(candidate.paths['/api/v1/leakdetection/capabilities'].get);
});

test('legacy read APIs and all previous compatibility locks remain preserved', () => {
  for (const [route, verbs] of Object.entries(original.paths)) {
    for (const verb of Object.keys(verbs)) {
      assert.ok(candidate.paths[route]?.[verb], `missing legacy ${verb.toUpperCase()} ${route}`);
    }
  }
  const findings = compareContractSlice('leak', original, candidate);
  assert.ok(!findings.some((item) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const orval = fs.readFileSync(path.join(root, 'orval.leak.config.ts'), 'utf8');
  assert.ok(orval.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const proof of ['LEAK_CURRENT_PROOF', 'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF',
    'TELEMETRY_CURRENT_PROOF', 'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF',
    'CUSTODY_CURRENT_PROOF', 'compareSlice(config, slice);']) {
    assert.ok(checker.includes(proof));
  }
  assert.ok(checker.includes('source-backed Leak Detection contract digest mismatch'));
});
