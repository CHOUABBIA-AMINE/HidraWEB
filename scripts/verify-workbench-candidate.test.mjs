import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-workbench-016d972725ac9a02a46f08ec024e0a4b0f95bda6.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-workbench-63f3f60974ce57eb8cd5e42910397615195624fb.json'), 'utf8'));

test('Workbench source is byte-identical to the published HidraAPI OpenAPI slice', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '264d4cc227a2d16f800c2a8ca3186b1dbaba4fe4315e25ec50aa516d338fa891');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 9);
  assert.equal(Object.keys(current.components.schemas).length, 4);
  assert.equal(current.servers, undefined);
  assert.equal(current['x-hidra-contract-source'], undefined);
  assert.ok(Object.keys(current.paths).every(route =>
    route.startsWith('/api/v1/workbench/') || /^\/api\/v1\/\{module\}\/workbench\//.test(route)));
});

test('both canonical and legacy Workbench routes preserve typed reads and search', () => {
  for (const [route, operationId, response] of [
    ['/api/v1/workbench/{module}/{resource}', 'list_1', 'OperationalPageResponse'],
    ['/api/v1/{module}/workbench/{resource}', 'list', 'OperationalPageResponse'],
    ['/api/v1/workbench/{module}/{resource}/{id}', 'detail', 'OperationalRecordResponse'],
    ['/api/v1/{module}/workbench/{resource}/{id}', 'detail_1', 'OperationalRecordResponse'],
  ]) {
    const op = current.paths[route].get;
    assert.equal(op.operationId, operationId);
    assert.equal(op.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  for (const [route, operationId] of [
    ['/api/v1/workbench/{module}/{resource}/search', 'search_1'],
    ['/api/v1/{module}/workbench/{resource}/search', 'search'],
  ]) {
    const op = current.paths[route].post;
    assert.equal(op.operationId, operationId);
    assert.equal(op.requestBody.content['application/json'].schema.$ref,
      '#/components/schemas/OperationalSearchRequest');
  }
});

test('Workbench pagination, arbitrary read attributes and authentication remain unchanged', () => {
  assert.equal(current.components.schemas.OperationalRecordResponse.properties.attributes.type, 'object');
  assert.equal(current.components.schemas.OperationalPageResponse.properties.totalElements.format, 'int64');
  assert.equal(current.components.schemas.OperationalSearchRequest.properties.filters.type, 'object');
  for (const methods of Object.values(current.paths)) {
    for (const op of Object.values(methods)) {
      assert.deepEqual(op.security, [{ hidraBearerJwt: [] }]);
    }
  }
  const pages = [
    current.paths['/api/v1/workbench/{module}/{resource}'].get,
    current.paths['/api/v1/{module}/workbench/{resource}'].get,
  ];
  for (const operation of pages) {
    assert.deepEqual(operation.parameters.map(p => p.name), ['module', 'resource', 'page', 'size', 'q']);
  }
});

test('Workbench lock retains legacy routes and earlier artifact hash locks', () => {
  for (const [route, methods] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
    }
  }
  const delta = compareContractSlice('workbench', legacy, current);
  assert.ok(!delta.some(item =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const config = fs.readFileSync(path.join(root, 'orval.workbench.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const lock of [
    'WORKBENCH_CURRENT_PROOF', 'source-backed Workbench contract digest mismatch',
    'ALARM_CURRENT_PROOF', 'SIMULATION_CURRENT_PROOF', 'ANALYTICS_CURRENT_PROOF',
    'REPORTING_CURRENT_PROOF', 'DOCUMENTS_CURRENT_PROOF', 'CONFIGURATION_CURRENT_PROOF',
    'AUDIT_CURRENT_PROOF', 'INTEGRITY_CURRENT_PROOF', 'ASSETS_CURRENT_PROOF',
    'HSE_CURRENT_PROOF', 'LEAK_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'INCIDENT_CURRENT_PROOF', 'WORKFLOW_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'TOPOLOGY_CURRENT_PROOF', 'RISK_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(checker.includes(lock));
  }
});
