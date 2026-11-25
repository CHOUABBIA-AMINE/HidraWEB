import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-leak-b451302179eb3a5877aefcb105dab0f3ccb47897.json';
const candidateFile = path.join(root, 'openapi/candidates', name);
const originalFile = path.join(root, 'openapi/hidra-leak-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const bytes = fs.readFileSync(candidateFile);
const candidate = JSON.parse(bytes.toString('utf8'));
const original = JSON.parse(fs.readFileSync(originalFile, 'utf8'));

test('Leak Detection slice matches the published HidraAPI OpenAPI artifact', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    '38ccba87706d93edfaaae763622e3b5eb2e44a855d0503385bd54904486af062');
  assert.equal(candidate.openapi, '3.1.0');
  assert.equal(Object.keys(candidate.paths).length, 11);
  assert.equal(Object.keys(candidate.components.schemas).length, 12);
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

test('UXR-29 retains the previous pin and admits only the registered operations', () => {
  const prior = JSON.parse(fs.readFileSync(path.join(root, 'openapi/candidates', 'hidra-leak-da4ce33ead7db40776049c861027947b61b96270.json'), 'utf8'));
  const active = candidate;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'openapi/candidates', 'hidra-leak-da4ce33ead7db40776049c861027947b61b96270.json'))).digest('hex'), '4c55a76cdf581954c2a35fce197ce4c0df3b0f827c09752fe9091b3649bfc91c');
  assert.deepEqual(compareContractSlice('leak', prior, active).filter(item => item.breaking), []);
  const keys = spec => Object.entries(spec.paths).flatMap(([route, verbs]) => Object.keys(verbs).map(verb => verb + ' ' + route)).sort();
  const expected = [...keys(prior), "get /api/v1/leakdetection/candidates/{id}/evidence", "get /api/v1/leakdetection/cases/{id}/investigation"].sort();
  assert.deepEqual(keys(active), expected);
  assert.equal(keys(active).length, 13);
  for (const verbs of Object.values(active.paths))
    for (const operation of Object.values(verbs)) assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
  function verifyRefs(value) {
    if (!value || typeof value !== 'object') return;
    if (value.$ref) {
      assert.ok(value.$ref.startsWith('#/components/schemas/'));
      assert.ok(active.components.schemas[value.$ref.split('/').at(-1)]);
    }
    Object.values(value).forEach(verifyRefs);
  }
  verifyRefs(active);
});

test('Leak investigation and candidate evidence remain distinct from Incident', () => {
  assert.equal(candidate.paths['/api/v1/leakdetection/candidates/{id}/evidence'].get.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/LeakCandidateEvaluationResponse');
  assert.equal(candidate.paths['/api/v1/leakdetection/cases/{id}/investigation'].get.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/LeakInvestigationView');
  assert.equal(candidate.components.schemas.LeakInvestigationView.properties.history.items.$ref, '#/components/schemas/LeakInvestigationEvent');
  assert.ok(!candidate.components.schemas.IncidentInvestigationView);
});
