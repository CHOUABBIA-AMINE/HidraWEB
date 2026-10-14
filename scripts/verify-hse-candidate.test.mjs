import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fileName = 'hidra-hse-da4ce33ead7db40776049c861027947b61b96270.json';
const pinned = path.join(root, 'openapi/candidates', fileName);
const legacy = path.join(root, 'openapi/hidra-hse-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const bytes = fs.readFileSync(pinned);
const current = JSON.parse(bytes.toString('utf8'));
const previous = JSON.parse(fs.readFileSync(legacy, 'utf8'));

test('HSE OpenAPI contract matches the verified backend artifact exactly', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    '137b5f0f0020a20c3ed956a489ac08d798f0b29f5085e5a28d8abd7102d869ed');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 9);
  assert.equal(Object.keys(current.components.schemas).length, 9);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/hse/')));
});

test('new HSE case and CAPA commands have typed inputs and explicit bearer security', () => {
  for (const [route, request, response] of [
    ['/api/v1/hse/cases', 'OpenHseCaseRequest', 'HseCaseResponse'],
    ['/api/v1/hse/capas', 'CreateHseCapaRequest', 'HseCapaResponse'],
  ]) {
    const operation = current.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(current.components.schemas.CreateHseCapaRequest.properties.verificationRequired.type, 'boolean');
  assert.equal(current.components.schemas.CreateHseCapaRequest.properties.targetDate.format, 'date-time');
  assert.ok(current.components.schemas.OpenHseCaseRequest.properties.sourceType.enum.includes('INCIDENT_REFERENCE'));
});

test('HSE closure remains a separate backend-owned command', () => {
  for (const route of ['/api/v1/hse/cases/closures', '/api/v1/hse/close-hse-case']) {
    const operation = current.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      '#/components/schemas/CloseHseCaseRequest');
    assert.equal(operation.responses['200'].content['*/*'].schema.type, 'string');
  }
  assert.equal(current.components.schemas.CloseHseCaseRequest.properties.evidenceReviewed.type, 'boolean');
  assert.equal(current.components.schemas.CloseHseCaseRequest.properties.regulatoryReviewed.type, 'boolean');
});

test('HSE reads and existing source-pins remain enforced', () => {
  for (const [route, methods] of Object.entries(previous.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `missing legacy ${method.toUpperCase()} ${route}`);
    }
  }
  const findings = compareContractSlice('hse', previous, current);
  assert.ok(!findings.some((item) => ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const config = fs.readFileSync(path.join(root, 'orval.hse.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${fileName}`));
  assert.ok(!config.includes('hidra-hse-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const gate = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const proof of ['HSE_CURRENT_PROOF', 'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF',
    'TELEMETRY_CURRENT_PROOF', 'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF',
    'CUSTODY_CURRENT_PROOF', 'LEAK_CURRENT_PROOF', 'compareSlice(config, slice);']) {
    assert.ok(gate.includes(proof));
  }
  assert.ok(gate.includes('source-backed HSE contract digest mismatch'));
});
