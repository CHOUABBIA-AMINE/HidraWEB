import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceName = 'hidra-telemetry-monitoring-da4ce33ead7db40776049c861027947b61b96270.json';
const candidatePath = path.join(root, 'openapi/candidates', sourceName);
const oldPath = path.join(root, 'openapi/hidra-telemetry-monitoring-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const raw = fs.readFileSync(candidatePath);
const candidate = JSON.parse(raw.toString('utf8'));
const previous = JSON.parse(fs.readFileSync(oldPath, 'utf8'));

test('Telemetry/Monitoring slice exactly matches the verified full backend artifact', () => {
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    '55f5ea67d7dfecb6c2b5a88bd6619a58081d653d92d44518aacbdace03b792f3');
  assert.equal(candidate.openapi, '3.1.0');
  assert.equal(Object.keys(candidate.paths).length, 17);
  assert.equal(Object.keys(candidate.components.schemas).length, 16);
  assert.equal(candidate.servers, undefined);
  assert.ok(Object.keys(candidate.paths).every((route) =>
    route.startsWith('/api/v1/telemetry/') || route.startsWith('/api/v1/monitoring/')));
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
