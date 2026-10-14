import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-assets-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const candidatePath = path.join(root, 'openapi/candidates', name);
const previousPath = path.join(root, 'openapi/hidra-assets-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const raw = fs.readFileSync(candidatePath);
const current = JSON.parse(raw.toString('utf8'));
const previous = JSON.parse(fs.readFileSync(previousPath, 'utf8'));

test('Assets OpenAPI source has the verified CI artifact digest and expected boundaries', () => {
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    'ba9cca93db79451a7fedfd35a322ddd71c837273a6ffe3fd5e47d5d0706bfc11');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 8);
  assert.equal(Object.keys(current.components.schemas).length, 7);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/assets/')));
});

test('maintainable asset contracts preserve optimistic updates and operational enums', () => {
  const update = current.paths['/api/v1/assets/maintainable-assets/{assetId}'].patch;
  assert.deepEqual(update.security, [{ hidraBearerJwt: [] }]);
  assert.equal(update.parameters[0].name, 'assetId');
  assert.equal(update.requestBody.content['application/json'].schema.$ref,
    '#/components/schemas/UpdateMaintainableAssetRequest');
  assert.deepEqual(current.components.schemas.UpdateMaintainableAssetRequest.required,
    ['assetName', 'expectedUpdatedAt']);
  assert.equal(current.components.schemas.UpdateMaintainableAssetRequest.properties.expectedUpdatedAt.format, 'date-time');
  assert.equal(current.components.schemas.UpdateMaintainableAssetRequest.properties.assetName.minLength, 1);
  assert.ok(current.components.schemas.MaintainableAssetResponse.properties.status.enum.includes('UNDER_MAINTENANCE'));
});

test('asset registration, condition evidence and work orders retain secured request types', () => {
  for (const [route, request, response] of [
    ['/api/v1/assets/maintainable-assets', 'RegisterMaintainableAssetRequest', 'MaintainableAssetResponse'],
    ['/api/v1/assets/asset-conditions', 'RecordAssetConditionRequest', 'AssetConditionResponse'],
    ['/api/v1/assets/maintenance-work-orders', 'CreateMaintenanceWorkOrderRequest', 'MaintenanceWorkOrderResponse'],
  ]) {
    const operation = current.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.deepEqual(current.components.schemas.RecordAssetConditionRequest.properties.conditionStatus.enum,
    ['NORMAL', 'WATCH', 'DEGRADED', 'CRITICAL', 'UNKNOWN']);
  assert.ok(current.components.schemas.MaintenanceWorkOrderResponse.properties.status.enum.includes('VERIFIED'));
  assert.ok(current.paths['/api/v1/assets/capabilities'].get);
});

test('original Assets methods, immutable generation pin and earlier gates remain intact', () => {
  for (const [route, methods] of Object.entries(previous.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `removed ${method.toUpperCase()} ${route}`);
    }
  }
  const findings = compareContractSlice('assets', previous, current);
  assert.ok(!findings.some((item) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const config = fs.readFileSync(path.join(root, 'orval.assets.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${name}`));
  assert.ok(!config.includes('hidra-assets-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const token of [
    'ASSETS_CURRENT_PROOF', 'source-backed Assets contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF', 'HSE_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(checker.includes(token));
  }
});
