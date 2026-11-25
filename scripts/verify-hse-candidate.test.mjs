import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fileName = 'hidra-hse-b451302179eb3a5877aefcb105dab0f3ccb47897.json';
const pinned = path.join(root, 'openapi/candidates', fileName);
const legacy = path.join(root, 'openapi/hidra-hse-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const bytes = fs.readFileSync(pinned);
const current = JSON.parse(bytes.toString('utf8'));
const previous = JSON.parse(fs.readFileSync(legacy, 'utf8'));

test('HSE OpenAPI contract matches the verified backend artifact exactly', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    '33a24003336a6ff2197d09918b7480f106f89de06b4f2312a24eb5d0f8936da7');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 14);
  assert.equal(Object.keys(current.components.schemas).length, 15);
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

test('UXR-29 retains the previous pin and admits only the registered operations', () => {
  const prior = JSON.parse(fs.readFileSync(path.join(root, 'openapi/candidates', 'hidra-hse-da4ce33ead7db40776049c861027947b61b96270.json'), 'utf8'));
  const active = current;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'openapi/candidates', 'hidra-hse-da4ce33ead7db40776049c861027947b61b96270.json'))).digest('hex'), '137b5f0f0020a20c3ed956a489ac08d798f0b29f5085e5a28d8abd7102d869ed');
  assert.deepEqual(compareContractSlice('hse', prior, active).filter(item => item.breaking), []);
  const keys = spec => Object.entries(spec.paths).flatMap(([route, verbs]) => Object.keys(verbs).map(verb => verb + ' ' + route)).sort();
  const expected = [...keys(prior), "get /api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases", "get /api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases/{caseId}", "get /api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases/{caseId}/capas", "get /api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases/{caseId}/capas/{capaId}", "get /api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases/{caseId}/history"].sort();
  assert.deepEqual(keys(active), expected);
  assert.equal(keys(active).length, 16);
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

test('Scoped HSE reads retain owner pagination and case hierarchy', () => {
  const base = '/api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases';
  for (const [suffix, dto] of [['', 'ScopedHsePageCaseView'], ['/{caseId}', 'CaseView'], ['/{caseId}/capas', 'ScopedHsePageScopedHseCapaView'], ['/{caseId}/capas/{capaId}', 'ScopedHseCapaView'], ['/{caseId}/history', 'ScopedHsePageEventView']]) {
    assert.deepEqual(Object.keys(current.paths[base + suffix]), ['get']);
    assert.equal(current.paths[base + suffix].get.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/' + dto);
  }
  for (const name of ['ScopedHsePageCaseView', 'ScopedHsePageScopedHseCapaView', 'ScopedHsePageEventView']) {
    assert.deepEqual(Object.keys(current.components.schemas[name].properties).sort(), ['items', 'page', 'size', 'total']);
  }
});
