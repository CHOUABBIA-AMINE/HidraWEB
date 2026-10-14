import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-alarm-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-alarm-5028a90248ddf3a04d344308f6cfc2510f1d0ca2.json'), 'utf8'));

test('Alarm OpenAPI pin exactly matches the CI-published HidraAPI contract', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '85bebb810ae40e8250dc316ab1f8dde60ac1d17cff2f6c7aa0f8c95f3c0dd6a1');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 13);
  assert.equal(Object.keys(current.components.schemas).length, 11);
  assert.equal(current.servers, undefined);
  assert.equal(current['x-hidra-contract-source'], undefined);
  assert.ok(Object.keys(current.paths).every(route => route.startsWith('/api/v1/alarm/')));
});

test('previous alarm listing and lifecycle wire contracts remain preserved', () => {
  const listing = current.paths['/api/v1/alarm/alarms'].get;
  assert.equal(listing.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/PageAlarmView');
  assert.deepEqual(listing.parameters.map(p => p.name),
    ['view','state','severityId','topologyAssetId','from','to','page','size']);
  for (const [route, schema] of [
    ['/api/v1/alarm/alarms/acknowledgements','AcknowledgeAlarmRequest'],
    ['/api/v1/alarm/alarms/closures','CloseAlarmRequest'],
    ['/api/v1/alarm/suppressions','CreateSuppressionRequest'],
  ]) {
    const operation = current.paths[route].post;
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${schema}`);
  }
  assert.deepEqual(current.components.schemas.ShelveAlarmRequest.required,['shelvingReasonId']);
  assert.deepEqual(current.components.schemas.CreateSuppressionRequest.required,
    ['scopeReferenceId','scopeType','suppressionReasonId']);
});

test('published alarm raise and lifecycle aliases carry backend security and request types only', () => {
  const raise = current.paths['/api/v1/alarm/alarms'].post;
  assert.equal(raise.operationId,'raiseAlarm_1');
  assert.equal(raise.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/RaiseAlarmRequest');
  assert.equal(raise.responses['200'].content['*/*'].schema.$ref,
    '#/components/schemas/AlarmResponse');
  for (const [route,id,request] of [
    ['/api/v1/alarm/raise-alarm','raiseAlarm','RaiseAlarmRequest'],
    ['/api/v1/alarm/acknowledge-alarm','acknowledgeAlarm_1','AcknowledgeAlarmRequest'],
    ['/api/v1/alarm/close-alarm','closeAlarm_1','CloseAlarmRequest'],
  ]) {
    const operation = current.paths[route].post;
    assert.equal(operation.operationId,id);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
  }
  assert.equal(current.paths['/api/v1/alarm/capabilities'].get.operationId,'capabilities_24');
  for (const methods of Object.values(current.paths)) {
    for (const operation of Object.values(methods)) assert.deepEqual(operation.security,[{hidraBearerJwt:[]}]);
  }
  assert.deepEqual(current.components.schemas.AlarmResponse.properties.currentState.enum,
    ['RAISED','ACTIVE','ACKNOWLEDGED','SHELVED','SUPPRESSED','CLEARED','CLOSED','ESCALATED','CANCELLED']);
});

test('Alarm pin maintains legacy transport and all existing source proof checks', () => {
  for (const [route,methods] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(methods))
      assert.ok(current.paths[route]?.[method],`missing ${method.toUpperCase()} ${route}`);
  }
  const changes = compareContractSlice('alarm',legacy,current);
  assert.ok(!changes.some(item =>
    ['path_removed','method_removed','field_removed','response_removed'].includes(item.kind)));
  const generator = fs.readFileSync(path.join(root,'orval.alarm.config.ts'),'utf8');
  assert.ok(generator.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root,'scripts/check-openapi-compatibility.mjs'),'utf8');
  for (const lock of [
    'ALARM_CURRENT_PROOF','source-backed Alarm contract digest mismatch',
    'SIMULATION_CURRENT_PROOF','ANALYTICS_CURRENT_PROOF','REPORTING_CURRENT_PROOF',
    'DOCUMENTS_CURRENT_PROOF','CONFIGURATION_CURRENT_PROOF','AUDIT_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF','ASSETS_CURRENT_PROOF','HSE_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF','CUSTODY_CURRENT_PROOF','INCIDENT_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF','TELEMETRY_CURRENT_PROOF','TOPOLOGY_CURRENT_PROOF',
    'RISK_CURRENT_PROOF','compareSlice(config, slice);',
  ]) assert.ok(checker.includes(lock));
});
