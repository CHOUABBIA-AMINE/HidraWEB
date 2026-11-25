import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-planning-b451302179eb3a5877aefcb105dab0f3ccb47897.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));

test('Planning OpenAPI matches the exact backend CI-published slice', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '009e81a44bb64412cf7f45b6640873eb421814616a87674f40708c0d13ee5df7');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 17);
  assert.equal(Object.keys(current.components.schemas).length, 22);
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

test('UXR-29 retains the previous pin and admits only the registered operations', () => {
  const prior = JSON.parse(fs.readFileSync(path.join(root, 'openapi/candidates', 'hidra-planning-d14c44fc527ea1115ad87baafa21a3264bf6950c.json'), 'utf8'));
  const active = current;
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'openapi/candidates', 'hidra-planning-d14c44fc527ea1115ad87baafa21a3264bf6950c.json'))).digest('hex'), '82982efde1b8eaa6ee66976025af9382aaa45b79a7c96553c4b035a8c41195de');
  assert.deepEqual(compareContractSlice('planning', prior, active).filter(item => item.breaking), []);
  const keys = spec => Object.entries(spec.paths).flatMap(([route, verbs]) => Object.keys(verbs).map(verb => verb + ' ' + route)).sort();
  const expected = [...keys(prior), "post /api/v1/planning/revisions/{revisionId}/submit"].sort();
  assert.deepEqual(keys(active), expected);
  assert.equal(keys(active).length, 19);
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

test('Submission requires dual owner tokens and the discovered independent reviewer', () => {
  const submit = current.paths['/api/v1/planning/revisions/{revisionId}/submit'].post;
  assert.equal(submit.requestBody.content['application/json'].schema.$ref, '#/components/schemas/SubmitPlanningRevisionRequest');
  assert.equal(submit.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/SubmitPlanningRevisionResponse');
  assert.deepEqual(current.components.schemas.SubmitPlanningRevisionRequest.required, ['definitionId', 'expectedPlanUpdatedAt', 'expectedRevisionUpdatedAt', 'reviewerActorId', 'targetTypeId', 'workflowPurposeId']);
  for (const token of ['expectedPlanUpdatedAt', 'expectedRevisionUpdatedAt']) assert.equal(current.components.schemas.SubmitPlanningRevisionRequest.properties[token].format, 'date-time');
  assert.equal(current.components.schemas.SubmitPlanningRevisionRequest.properties.definitionVersion.minimum, 1);
  assert.deepEqual(current.components.schemas.ExecutePlanningApprovalActionRequest.required, ['expectedTaskUpdatedAt']);
});
