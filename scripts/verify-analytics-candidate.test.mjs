import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-analytics-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-analytics-63f3f60974ce57eb8cd5e42910397615195624fb.json'), 'utf8'));

test('Analytics slice exactly matches verified HidraAPI full OpenAPI artifact', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '4d7e3d43925fc9304351a86eb275d87104a6faddf6a975fc0799678e3853c39c');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 9);
  assert.equal(Object.keys(current.components.schemas).length, 8);
  assert.equal(current.servers, undefined);
  assert.equal(current['x-hidra-contract-source'], undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/analytics/')));
});

test('Analytics datasets, insights, metrics and projection transports remain typed', () => {
  for (const [route, request, response] of [
    ['/api/v1/analytics/datasets', 'CreateAnalyticsDatasetRequest', 'AnalyticsDatasetResponse'],
    ['/api/v1/analytics/insights', 'CreateAnalyticsInsightRequest', 'AnalyticsInsightResponse'],
    ['/api/v1/analytics/metrics/evaluations', 'RunMetricEvaluationRequest', 'MetricEvaluationRunResponse'],
    ['/api/v1/analytics/projections/runs', 'RunProjectionRequest', 'AnalyticsProjectionRunResponse'],
  ]) {
    const command = current.paths[route].post;
    assert.equal(command.requestBody.required, true);
    assert.equal(command.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(command.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(current.components.schemas.AnalyticsProjectionRunResponse.properties.projectionDefinitionVersion.type, 'string');
  assert.equal(legacy.components.schemas.AnalyticsProjectionRunResponse.properties.projectionDefinitionVersion, undefined);
});

test('Analytics aliases, source-defined enums and bearer metadata retain guarded behavior', () => {
  for (const [route, operationId] of [
    ['/api/v1/analytics/create-analytics-dataset', 'createAnalyticsDataset_1'],
    ['/api/v1/analytics/create-analytics-insight', 'createAnalyticsInsight_1'],
    ['/api/v1/analytics/run-metric-evaluation', 'runMetricEvaluation'],
    ['/api/v1/analytics/run-projection', 'runProjection'],
  ]) {
    assert.equal(current.paths[route].post.operationId, operationId);
  }
  for (const operations of Object.values(current.paths)) {
    for (const operation of Object.values(operations)) {
      assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    }
  }
  assert.deepEqual(current.components.schemas.CreateAnalyticsDatasetRequest.properties.datasetType.enum,
    ['SNAPSHOT', 'TIME_SERIES', 'AGGREGATE', 'FEATURE_SET', 'TRAINING_DATASET',
      'VALIDATION_DATASET', 'DASHBOARD_VIEW', 'DIGITAL_TWIN_READINESS_VIEW']);
  assert.deepEqual(current.components.schemas.AnalyticsProjectionRunResponse.properties.runStatus.enum,
    ['PENDING', 'RUNNING', 'COMPLETED', 'COMPLETED_WITH_WARNINGS', 'FAILED', 'CANCELLED']);
});

test('Analytics pin maintains legacy operations and all previous source locks', () => {
  for (const [route, methods] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
    }
  }
  const delta = compareContractSlice('analytics', legacy, current);
  assert.ok(!delta.some((item) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const orval = fs.readFileSync(path.join(root, 'orval.analytics.config.ts'), 'utf8');
  assert.ok(orval.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const lock of [
    'ANALYTICS_CURRENT_PROOF', 'source-backed Analytics contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF', 'HSE_CURRENT_PROOF', 'ASSETS_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF', 'AUDIT_CURRENT_PROOF', 'CONFIGURATION_CURRENT_PROOF',
    'DOCUMENTS_CURRENT_PROOF', 'REPORTING_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(checker.includes(lock));
  }
});
