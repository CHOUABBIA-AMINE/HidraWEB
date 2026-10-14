import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-reporting-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-reporting-63f3f60974ce57eb8cd5e42910397615195624fb.json'), 'utf8'));

test('Reporting slice matches the published HidraAPI source exactly', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), 'a675c02217225590e515b804448e2e2270bb8d263d78af3a13b93103b7c8e34d');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 9);
  assert.equal(Object.keys(current.components.schemas).length, 8);
  assert.equal(current.servers, undefined);
  assert.equal(current['x-hidra-contract-source'], undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/reporting/')));
});

test('typed report definitions, requests, runs and artifacts retain their existing payloads', () => {
  for (const [route, request, response] of [
    ['/api/v1/reporting/definitions', 'CreateReportDefinitionRequest', 'ReportDefinitionResponse'],
    ['/api/v1/reporting/requests', 'RequestReportRequest', 'ReportRequestResponse'],
    ['/api/v1/reporting/runs', 'QueueReportRunRequest', 'ReportRunResponse'],
    ['/api/v1/reporting/artifacts', 'GenerateReportArtifactRequest', 'ReportOutputArtifactResponse'],
  ]) {
    const operation = current.paths[route].post;
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(current.components.schemas.GenerateReportArtifactRequest.properties.sizeBytes.format, 'int64');
  assert.equal(current.components.schemas.RequestReportRequest.properties.workflowReferenceId.type, 'string');
});

test('published alias operations and enumerations retain bearer security without implicit grants', () => {
  for (const [route, operationId] of [
    ['/api/v1/reporting/create-report-definition', 'createReportDefinition'],
    ['/api/v1/reporting/request-report', 'requestReport'],
    ['/api/v1/reporting/queue-report-run', 'queueReportRun_1'],
    ['/api/v1/reporting/generate-report-artifact', 'generateReportArtifact_1'],
  ]) {
    assert.equal(current.paths[route].post.operationId, operationId);
  }
  for (const route of Object.values(current.paths)) {
    for (const operation of Object.values(route)) {
      assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    }
  }
  assert.deepEqual(current.components.schemas.ReportRequestResponse.properties.status.enum,
    ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'QUEUED', 'RUNNING', 'COMPLETED', 'CANCELLED']);
  assert.deepEqual(current.components.schemas.ReportRunResponse.properties.runMode.enum,
    ['MANUAL', 'SCHEDULED', 'SYSTEM_TRIGGERED', 'WORKFLOW_TRIGGERED']);
  assert.deepEqual(current.components.schemas.ReportOutputArtifactResponse.properties.format.enum,
    ['PDF', 'XLSX', 'CSV', 'JSON', 'HTML', 'DOCX', 'ZIP']);
});

test('Reporting pin preserves every historical route and all previous source checks', () => {
  for (const [route, methods] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
    }
  }
  const delta = compareContractSlice('reporting', legacy, current);
  assert.ok(!delta.some((item) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const orval = fs.readFileSync(path.join(root, 'orval.reporting.config.ts'), 'utf8');
  assert.ok(orval.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const lock of [
    'REPORTING_CURRENT_PROOF', 'source-backed Reporting contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF', 'HSE_CURRENT_PROOF', 'ASSETS_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF', 'AUDIT_CURRENT_PROOF', 'CONFIGURATION_CURRENT_PROOF',
    'DOCUMENTS_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(checker.includes(lock));
  }
});
