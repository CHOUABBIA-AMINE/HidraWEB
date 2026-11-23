import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const previousName = 'hidra-telemetry-monitoring-da4ce33ead7db40776049c861027947b61b96270.json';
const sourceName = 'hidra-telemetry-monitoring-uxr24.json';
const candidatePath = path.join(root, 'openapi/candidates', sourceName);
const oldPath = path.join(root, 'openapi/hidra-telemetry-monitoring-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const raw = fs.readFileSync(candidatePath);
const candidate = JSON.parse(raw.toString('utf8'));
const previous = JSON.parse(fs.readFileSync(oldPath, 'utf8'));

test('UXR-24 pins the three T39 Telemetry reads and preserves the prior slice', () => {
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    '3aaeaa63f18b5f30dfa3ccb841e29fa85ab00af6615ad87a37bb04cf004dd95d');
  assert.equal(candidate.openapi, '3.1.0');
  assert.equal(Object.keys(candidate.paths).length, 20);
  assert.equal(Object.keys(candidate.components.schemas).length, 24);
  const previousBytes = fs.readFileSync(path.join(root, 'openapi/candidates', previousName));
  assert.equal(crypto.createHash('sha256').update(previousBytes).digest('hex'),
    '55f5ea67d7dfecb6c2b5a88bd6619a58081d653d92d44518aacbdace03b792f3');
  const prior = JSON.parse(previousBytes);
  for (const [route, operation] of Object.entries(prior.paths)) assert.deepEqual(candidate.paths[route], operation);
  for (const [name, schema] of Object.entries(prior.components.schemas)) assert.deepEqual(candidate.components.schemas[name], schema);
  assert.equal(candidate.servers, undefined);
  assert.ok(Object.keys(candidate.paths).every((route) =>
    route.startsWith('/api/v1/telemetry/') || route.startsWith('/api/v1/monitoring/')));
});

test('asset-scoped telemetry transports retain required company and cursor coordinates', () => {
  const root = '/api/v1/telemetry/assets/{assetType}/{assetId}/points';
  for (const [suffix, names, response] of [
    ['', ['at', 'afterPointId'], 'CommissionedPointsView'],
    ['/{pointId}/trusted-readings/latest', ['maxAgeSeconds'], 'LatestObservationView'],
    ['/{pointId}/trusted-readings/history', ['from', 'until', 'afterObservedAt', 'afterTrustedId', 'maxAgeSeconds'], 'ObservationHistoryView'],
  ]) {
    const operations = candidate.paths[root + suffix];
    assert.deepEqual(Object.keys(operations), ['get']);
    const operation = operations.get;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.ok(operation.parameters.some(param => param.in === 'query' && param.name === 'companyPartyId' && param.required));
    for (const name of names) assert.ok(operation.parameters.some(param => param.in === 'query' && param.name === name));
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref, `#/components/schemas/${response}`);
  }
});

test('newly published telemetry source and point contracts stay typed and secured', () => {
  for (const [route, request, response] of [
    ['/api/v1/telemetry/sources', 'CreateTelemetrySourceRequest', 'TelemetrySourceResponse'],
    ['/api/v1/telemetry/points', 'RegisterTelemetryPointRequest', 'TelemetryPointResponse'],
  ]) {
    const operation = candidate.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(candidate.components.schemas.RegisterTelemetryPointRequest.properties.samplingPeriodSeconds.format, 'int32');
  assert.equal(candidate.components.schemas.RegisterTelemetryPointRequest.properties.maxOperationalValue.type, 'number');
  assert.equal(candidate.components.schemas.CreateTelemetrySourceRequest.properties.protocolId.type, 'string');
});

test('monitoring governance requests preserve backend enum types and explicit authorization', () => {
  const cases = [
    ['/api/v1/monitoring/rules', 'CreateMonitoringRuleRequest', 'MonitoringRuleResponse'],
    ['/api/v1/monitoring/deviations', 'RecordDeviationRequest', 'DeviationResponse'],
  ];
  for (const [route, request, response] of cases) {
    const operation = candidate.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
    assert.ok(candidate.paths[route].get);
  }
  const severity = candidate.components.schemas.RecordDeviationRequest.properties.severity;
  assert.deepEqual(severity.enum, ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  const ruleType = candidate.components.schemas.CreateMonitoringRuleRequest.properties.ruleType;
  assert.ok(ruleType.enum.includes('STALE_DATA'));
  assert.ok(ruleType.enum.includes('PLAN_COMPARISON'));
});

test('old telemetry reads remain and new Orval pin retains proof enforcement', () => {
  for (const route of Object.keys(previous.paths)) {
    assert.ok(candidate.paths[route]?.get, `read endpoint missing: ${route}`);
  }
  const changes = compareContractSlice('telemetry-monitoring', previous, candidate);
  assert.ok(!changes.some((change) => ['method_removed', 'path_removed', 'field_removed'].includes(change.kind)));
  const config = fs.readFileSync(path.join(root, 'orval.telemetry-monitoring.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${sourceName}`));
  const gate = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  assert.ok(gate.includes('TELEMETRY_CURRENT_PROOF'));
  assert.ok(gate.includes('source-backed Telemetry/Monitoring contract digest mismatch'));
  assert.ok(gate.includes('RISK_CURRENT_PROOF'));
  assert.ok(gate.includes('TOPOLOGY_CURRENT_PROOF'));
  assert.ok(gate.includes('compareSlice(config, slice);'));
});
