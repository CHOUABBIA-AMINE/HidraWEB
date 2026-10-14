import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-configuration-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-configuration-63f3f60974ce57eb8cd5e42910397615195624fb.json'), 'utf8'));

test('Configuration OpenAPI slice exactly matches the published HidraAPI artifact', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    'c38a1a6a5e351ce53bb953811cde71d1fa784b73e1150820c1cc52474728ca84');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 7);
  assert.equal(Object.keys(current.components.schemas).length, 6);
  assert.equal(current.servers, undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/configuration/')));
});

test('original definition, feature flag and value commands retain their exact types', () => {
  for (const [route, request, response] of [
    ['/api/v1/configuration/definitions', 'CreateConfigurationDefinitionRequest', 'ConfigurationDefinitionResponse'],
    ['/api/v1/configuration/feature-flags', 'CreateFeatureFlagRequest', 'FeatureFlagResponse'],
    ['/api/v1/configuration/values', 'SetConfigurationValueRequest', 'ConfigurationValueResponse'],
  ]) {
    const command = current.paths[route].post;
    assert.deepEqual(command.security, [{ hidraBearerJwt: [] }]);
    assert.equal(command.requestBody.required, true);
    assert.equal(command.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(command.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.deepEqual(current.components.schemas.CreateFeatureFlagRequest.properties.evaluationStrategy.enum,
    ['BOOLEAN', 'PERCENTAGE', 'RULE_BASED', 'ALLOW_LIST', 'DENY_LIST']);
  assert.deepEqual(current.components.schemas.ConfigurationDefinitionResponse.properties.sensitivity.enum,
    ['PUBLIC', 'INTERNAL', 'RESTRICTED', 'SECRET_REFERENCE_ONLY']);
  assert.equal(current.components.schemas.CreateConfigurationDefinitionRequest.properties.requiresApproval.type, 'boolean');
});

test('published Configuration aliases and capabilities remain authenticated transport only', () => {
  for (const [route, operationId] of [
    ['/api/v1/configuration/create-configuration-definition', 'createConfigurationDefinition_1'],
    ['/api/v1/configuration/create-feature-flag', 'createFeatureFlag'],
    ['/api/v1/configuration/set-configuration-value', 'setConfigurationValue'],
  ]) {
    assert.equal(current.paths[route].post.operationId, operationId);
    assert.deepEqual(current.paths[route].post.security, [{ hidraBearerJwt: [] }]);
  }
  assert.deepEqual(current.paths['/api/v1/configuration/capabilities'].get.security,
    [{ hidraBearerJwt: [] }]);
  assert.deepEqual(current.components.schemas.ConfigurationValueResponse.properties.status.enum,
    ['DRAFT', 'ACTIVE', 'SUPERSEDED', 'EXPIRED', 'REVOKED']);
});

test('Configuration source lock preserves earlier verified and historical checks', () => {
  for (const [route, methods] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
    }
  }
  const delta = compareContractSlice('configuration', legacy, current);
  assert.ok(!delta.some((item) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const orval = fs.readFileSync(path.join(root, 'orval.configuration.config.ts'), 'utf8');
  assert.ok(orval.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const lock of [
    'CONFIGURATION_CURRENT_PROOF', 'source-backed Configuration contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF', 'HSE_CURRENT_PROOF', 'ASSETS_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF', 'AUDIT_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(checker.includes(lock));
  }
});
