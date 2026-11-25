import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-alarm-b451302179eb3a5877aefcb105dab0f3ccb47897.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-alarm-5028a90248ddf3a04d344308f6cfc2510f1d0ca2.json'), 'utf8'));

test('Alarm OpenAPI pin exactly matches the CI-published HidraAPI contract', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), 'cf152e52ad51591a385327439f27f79fc741ab9b9c3dd6a025b301ca320432ab');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 15);
  assert.equal(Object.keys(current.components.schemas).length, 13);
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
  assert.equal(current.paths['/api/v1/alarm/capabilities'].get.operationId,'capabilities_25');
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

test('F16 is an exact additive Alarm slice, not new browser command authority', () => {
  const prior = JSON.parse(fs.readFileSync(path.join(root, 'openapi/candidates/hidra-alarm-76b14cda4520f1eff242bd474c02ce4db317d385.json'), 'utf8'));
  assert.equal(Object.values(current.paths).reduce((sum, methods) => sum + Object.keys(methods).length, 0), 18);
  assert.deepEqual(current.components.securitySchemes, {hidraBearerJwt: {
    bearerFormat: 'JWT', description: 'Hidra-issued bearer JWT used by ordinary protected HidraAPI operations.',
    scheme: 'bearer', type: 'http',
  }});
  for (const [name, schema] of Object.entries(prior.components.schemas)) {
    assert.deepEqual(current.components.schemas[name], schema);
  }
  for (const [route, methods] of Object.entries(prior.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const expected = route === '/api/v1/alarm/capabilities' ? {...operation, operationId: 'capabilities_25'} : operation;
      assert.deepEqual(current.paths[route][method], expected);
    }
  }
  assert.deepEqual(Object.keys(current.paths).filter(route => !prior.paths[route]).sort(), [
    '/api/v1/alarm/alarms/from-evaluation', '/api/v1/alarm/alarms/{id}/evidence',
  ]);
  assert.equal(current.paths['/api/v1/alarm/alarms/from-evaluation'].post.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/EvidenceLinkedAlarmRequest');
  assert.equal(current.paths['/api/v1/alarm/alarms/{id}/evidence'].get.responses['200'].content['*/*'].schema.$ref,
    '#/components/schemas/EvidenceLinkedAlarmResponse');
  const changed = JSON.parse(JSON.stringify(current));
  delete changed.components.schemas.AlarmView.properties.acknowledgedByActorId;
  assert.ok(compareContractSlice('alarm', current, changed).some(item => item.kind === 'field_removed'));
});
