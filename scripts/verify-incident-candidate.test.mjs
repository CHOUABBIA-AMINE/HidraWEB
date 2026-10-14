import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-incident-da4ce33ead7db40776049c861027947b61b96270.json';
const currentFile = path.join(root, 'openapi/candidates', name);
const legacyFile = path.join(root, 'openapi/hidra-incident-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const raw = fs.readFileSync(currentFile);
const current = JSON.parse(raw.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));

test('Incident source matches the published backend OpenAPI artifact exactly', () => {
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    '54dd4419087f18f52804bb3924fef3ada98c71c16b3b612984f28764dbc7c3eb');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 8);
  assert.equal(Object.keys(current.components.schemas).length, 6);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/incident/')));
});

test('existing Incident reads remain and new creation contract is typed and authenticated', () => {
  for (const [route, verbs] of Object.entries(legacy.paths)) {
    for (const verb of Object.keys(verbs)) {
      assert.ok(current.paths[route]?.[verb], `missing existing ${verb.toUpperCase()} ${route}`);
    }
  }
  const create = current.paths['/api/v1/incident/incidents'].post;
  assert.deepEqual(create.security, [{ hidraBearerJwt: [] }]);
  assert.equal(create.requestBody.required, true);
  assert.equal(create.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/OpenIncidentRequest');
  assert.equal(create.responses['200'].content['*/*'].schema.$ref,
    '#/components/schemas/IncidentResponse');
  assert.deepEqual(current.components.schemas.OpenIncidentRequest.properties.sourceType.enum,
    ['MANUAL', 'MONITORING_ALERT', 'ALARM', 'LEAK_CASE', 'HSE_EVENT', 'INTEGRATION', 'OTHER']);
  assert.equal(current.components.schemas.OpenIncidentRequest.properties.detectedAt.format, 'date-time');
  assert.equal(current.components.schemas.OpenIncidentRequest.properties.latitude.type, 'number');
});

test('Incident closure and response actions remain distinct backend-owned commands', () => {
  const requests = [
    ['/api/v1/incident/incidents/closures', 'CloseIncidentRequest'],
    ['/api/v1/incident/response-actions', 'RecordIncidentResponseActionRequest'],
  ];
  for (const [route, dto] of requests) {
    const operation = current.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${dto}`);
  }
  assert.equal(current.components.schemas.CloseIncidentRequest.properties.resolutionVerified.type, 'boolean');
  assert.equal(current.components.schemas.CloseIncidentRequest.properties.evidenceReviewed.type, 'boolean');
  assert.deepEqual(current.components.schemas.RecordIncidentResponseActionRequest.properties.actionStatus.enum,
    ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']);
});

test('Incident source activation preserves contract gate and previous source evidence', () => {
  const findings = compareContractSlice('incident', legacy, current);
  assert.ok(!findings.some((item) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const config = fs.readFileSync(path.join(root, 'orval.incident.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${name}`));
  assert.ok(!config.includes('hidra-incident-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const gate = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  assert.ok(gate.includes('INCIDENT_CURRENT_PROOF'));
  assert.ok(gate.includes('source-backed Incident contract digest mismatch'));
  for (const name of ['RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF',
    'TELEMETRY_CURRENT_PROOF', 'WORKFLOW_CURRENT_PROOF', 'compareSlice(config, slice);']) {
    assert.ok(gate.includes(name));
  }
});
