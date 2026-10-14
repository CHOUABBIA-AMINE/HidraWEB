import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-simulation-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-simulation-63f3f60974ce57eb8cd5e42910397615195624fb.json'), 'utf8'));

test('Simulation contract is pinned to exact verified full API artifact', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), 'b53a24a8d6c0b0b436f77cff0dfbd4c219c7cbc8b7df6016bd33a0190eafdb6a');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 9);
  assert.equal(Object.keys(current.components.schemas).length, 8);
  assert.equal(current.servers, undefined);
  assert.equal(current['x-hidra-contract-source'], undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/simulation/')));
});

test('models, scenarios, queued runs and recommendations retain typed transport', () => {
  for (const [route, request, response] of [
    ['/api/v1/simulation/models', 'CreateSimulationModelRequest', 'SimulationModelResponse'],
    ['/api/v1/simulation/scenarios', 'CreateSimulationScenarioRequest', 'SimulationScenarioResponse'],
    ['/api/v1/simulation/runs', 'QueueSimulationRunRequest', 'SimulationRunResponse'],
    ['/api/v1/simulation/recommendations', 'PublishSimulationRecommendationRequest', 'SimulationRecommendationResponse'],
  ]) {
    const op = current.paths[route].post;
    assert.equal(op.requestBody.required, true);
    assert.equal(op.requestBody.content['application/json'].schema.$ref, `#/components/schemas/${request}`);
    assert.equal(op.responses['200'].content['*/*'].schema.$ref, `#/components/schemas/${response}`);
  }
  assert.equal(current.components.schemas.CreateSimulationScenarioRequest.properties.topologySnapshotId.type, 'string');
  assert.equal(current.components.schemas.QueueSimulationRunRequest.properties.inputSnapshotId.type, 'string');
});

test('all published endpoints remain bearer-authenticated transport, not operator permission', () => {
  for (const route of Object.values(current.paths)) for (const op of Object.values(route)) {
    assert.deepEqual(op.security, [{ hidraBearerJwt: [] }]);
  }
  assert.deepEqual(current.components.schemas.SimulationRunResponse.properties.status.enum,
    ['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']);
  assert.deepEqual(current.components.schemas.SimulationRecommendationResponse.properties.recommendationStatus.enum,
    ['DRAFT', 'PUBLISHED', 'SENT_TO_WORKFLOW', 'ACCEPTED', 'REJECTED', 'SUPERSEDED']);
});

test('all legacy simulation operations and preceding contract checks remain intact', () => {
  for (const [route, methods] of Object.entries(legacy.paths))
    for (const method of Object.keys(methods))
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
  const delta = compareContractSlice('simulation', legacy, current);
  assert.ok(!delta.some(x => ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(x.kind)));
  assert.ok(fs.readFileSync(path.join(root, 'orval.simulation.config.ts'), 'utf8').includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const lock of ['SIMULATION_CURRENT_PROOF','ANALYTICS_CURRENT_PROOF','REPORTING_CURRENT_PROOF',
    'DOCUMENTS_CURRENT_PROOF','CONFIGURATION_CURRENT_PROOF','AUDIT_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF','ASSETS_CURRENT_PROOF','HSE_CURRENT_PROOF','LEAK_CURRENT_PROOF',
    'CUSTODY_CURRENT_PROOF','INCIDENT_CURRENT_PROOF','WORKFLOW_CURRENT_PROOF',
    'TELEMETRY_CURRENT_PROOF','TOPOLOGY_CURRENT_PROOF','RISK_CURRENT_PROOF',
    'compareSlice(config, slice);']) assert.ok(checker.includes(lock));
});
