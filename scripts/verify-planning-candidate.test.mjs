import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-planning-d14c44fc527ea1115ad87baafa21a3264bf6950c.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));

test('Planning OpenAPI matches the exact backend CI-published slice', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '82982efde1b8eaa6ee66976025af9382aaa45b79a7c96553c4b035a8c41195de');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 16);
  assert.equal(Object.keys(current.components.schemas).length, 20);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every(route => route.startsWith('/api/v1/planning/')));
});

test('planning periods, operational plans and nominations preserve typed pagination', () => {
  for (const [route, response] of [
    ['/api/v1/planning/periods', 'PagePlanningPeriodView'],
    ['/api/v1/planning/operational-plans', 'PageOperationalPlanView'],
    ['/api/v1/planning/nominations', 'PageNominationView'],
    ['/api/v1/planning/targets', 'PagePlanTargetView'],
  ]) {
    assert.equal(current.paths[route].get.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(current.paths['/api/v1/planning/revisions/{revisionId}'].patch.operationId, 'update');
  assert.deepEqual(current.components.schemas.Request.required, ['expectedUpdatedAt']);
});

test('approval execution remains backend-authorized and version-guarded', () => {
  const route = current.paths['/api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute'];
  assert.equal(route.post.operationId, 'execute_1');
  assert.equal(route.post.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/ExecutePlanningApprovalActionRequest');
  assert.deepEqual(current.components.schemas.ExecutePlanningApprovalActionRequest.required,
    ['expectedTaskUpdatedAt']);
  assert.equal(current.components.schemas.Action.properties.permitted.type, 'boolean');
  assert.equal(current.components.schemas.Action.properties.requiredPermissionCode.type, 'string');
  for (const operations of Object.values(current.paths))
    for (const operation of Object.values(operations))
      assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
});

test('planning source lock preserves previously verified contract locks', () => {
  assert.equal(current.paths['/api/v1/planning/periods'].post.operationId, 'createPlanningPeriod_1');
  assert.equal(current.paths['/api/v1/planning/operational-plans'].post.operationId, 'createOperationalPlan_1');
  assert.equal(current.paths['/api/v1/planning/capabilities'].get.operationId, 'capabilities_7');
  const config = fs.readFileSync(path.join(root, 'orval.planning.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const proof of [
    'PLANNING_CURRENT_PROOF','WORKBENCH_CURRENT_PROOF','ALARM_CURRENT_PROOF',
    'SIMULATION_CURRENT_PROOF','ANALYTICS_CURRENT_PROOF','REPORTING_CURRENT_PROOF',
    'DOCUMENTS_CURRENT_PROOF','CONFIGURATION_CURRENT_PROOF','AUDIT_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF','ASSETS_CURRENT_PROOF','HSE_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF','CUSTODY_CURRENT_PROOF','INCIDENT_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF','TELEMETRY_CURRENT_PROOF','TOPOLOGY_CURRENT_PROOF',
    'RISK_CURRENT_PROOF','compareSlice(config, slice);',
  ]) assert.ok(checker.includes(proof));
});
