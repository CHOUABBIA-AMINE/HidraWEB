import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidateName = 'hidra-integrity-uxr25.json';
const candidateFile = path.join(root, 'openapi/candidates', candidateName);
const legacyFile = path.join(root, 'openapi/hidra-integrity-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const bytes = fs.readFileSync(candidateFile);
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));

test('Integrity preserves the verified slice and adds one T18 handoff read', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    '045d153f219e3ac98cdd45be3eafb4636524c72773f25e01e4151bfb7ab95d45');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 8);
  assert.equal(Object.keys(current.components.schemas).length, 7);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/integrity/')));
});

test('typed handoff reads retain exact findings and approval identifiers', () => {
  const priorBytes = fs.readFileSync(path.join(root, 'openapi/candidates', 'hidra-integrity-76b14cda4520f1eff242bd474c02ce4db317d385.json'));
  assert.equal(crypto.createHash('sha256').update(priorBytes).digest('hex'), '67e7cedbd59587b1f3af15ec83c3f9718f7c783dc40bc01597b0aef0ae3ebd79');
  const prior = JSON.parse(priorBytes);
  for (const [route, methods] of Object.entries(prior.paths)) assert.deepEqual(current.paths[route], methods);
  for (const [name, schema] of Object.entries(prior.components.schemas)) assert.deepEqual(current.components.schemas[name], schema);
  const operations = current.paths['/api/v1/integrity/findings/{findingId}/maintenance-handoffs/{approvalId}'];
  assert.deepEqual(Object.keys(operations), ['get']);
  const read = operations.get;
  assert.deepEqual(read.security, [{ hidraBearerJwt: [] }]);
  assert.deepEqual(read.parameters.map(parameter => [parameter.name, parameter.required]),
    [['findingId', true], ['approvalId', true]]);
  assert.equal(read.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/IntegrityMaintenanceApprovalResponse');
});

test('Integrity assessment, program and case requests preserve typed backend fields', () => {
  for (const [route, request, response] of [
    ['/api/v1/integrity/assessments', 'CreateIntegrityAssessmentRequest', 'IntegrityAssessmentResponse'],
    ['/api/v1/integrity/programs', 'CreateIntegrityProgramRequest', 'IntegrityProgramResponse'],
    ['/api/v1/integrity/cases', 'OpenIntegrityCaseRequest', 'IntegrityCaseResponse'],
  ]) {
    const operation = current.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(current.components.schemas.CreateIntegrityAssessmentRequest.properties.assessmentDate.format, 'date-time');
  assert.equal(current.components.schemas.CreateIntegrityProgramRequest.properties.plannedEndAt.format, 'date-time');
  assert.equal(current.components.schemas.OpenIntegrityCaseRequest.properties.topologyAssetId.type, 'string');
});

test('Integrity lifecycle values and alternate transport routes use backend definitions', () => {
  assert.deepEqual(current.components.schemas.IntegrityAssessmentResponse.properties.status.enum,
    ['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'SUPERSEDED', 'CANCELLED', 'CLOSED']);
  assert.ok(current.components.schemas.IntegrityCaseResponse.properties.status.enum.includes('ACTION_REQUIRED'));
  assert.ok(current.components.schemas.IntegrityProgramResponse.properties.status.enum.includes('SUSPENDED'));
  for (const route of [
    '/api/v1/integrity/create-integrity-assessment',
    '/api/v1/integrity/create-integrity-program',
    '/api/v1/integrity/open-integrity-case',
  ]) {
    assert.deepEqual(current.paths[route].post.security, [{ hidraBearerJwt: [] }]);
  }
  assert.ok(current.paths['/api/v1/integrity/capabilities'].get);
});

test('previous methods and source fingerprint gates stay enforced', () => {
  for (const [route, entry] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(entry)) {
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
    }
  }
  const delta = compareContractSlice('integrity', legacy, current);
  assert.ok(!delta.some((item) => ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const config = fs.readFileSync(path.join(root, 'orval.integrity.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${candidateName}`));
  assert.ok(!config.includes('hidra-integrity-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const gate = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const lock of [
    'INTEGRITY_CURRENT_PROOF', 'source-backed Integrity contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF', 'HSE_CURRENT_PROOF', 'ASSETS_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(gate.includes(lock));
  }
});
