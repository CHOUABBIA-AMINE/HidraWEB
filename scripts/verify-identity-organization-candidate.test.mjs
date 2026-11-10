import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-identity-organization-d14c44fc527ea1115ad87baafa21a3264bf6950c.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));

test('Identity and Organization contracts are pinned to the exact successful backend source', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '7158e86e61be8049972048769da2632f2a474984487644a31d7ffcdd5ce723e4');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 35);
  assert.equal(Object.keys(current.components.schemas).length, 39);
  assert.equal(current.servers, undefined);
  assert.equal(current['x-hidra-contract-source'], undefined);
  assert.ok(Object.keys(current.paths).every(route =>
    route.startsWith('/api/v1/identity/') || route.startsWith('/api/v1/organization/')));
});

test('login, OIDC and authenticated operations retain distinct backend security contracts', () => {
  assert.deepEqual(current.paths['/api/v1/identity/authentication/login'].post.security, []);
  for (const route of [
    '/api/v1/identity/authentication/oidc/complete',
    '/api/v1/identity/authentication/oidc/evaluate',
  ]) assert.deepEqual(current.paths[route].post.security, [{ externalOidcBearerJwt: [] }]);
  assert.deepEqual(current.paths['/api/v1/identity/me'].get.security, [{ hidraBearerJwt: [] }]);
  assert.deepEqual(current.paths['/api/v1/identity/permissions/evaluations'].post.security,
    [{ hidraBearerJwt: [] }]);
  assert.deepEqual(current.paths['/api/v1/organization/responsibilities/reconcile'].post.security,
    [{ hidraBearerJwt: [] }]);
});

test('permission decisions, responsibilities and reconciliation remain backend-owned', () => {
  assert.equal(current.paths['/api/v1/identity/authentication/oidc/evaluate'].post.responses['200']
    .content['*/*'].schema.$ref, '#/components/schemas/PermissionDecisionResponse');
  assert.equal(current.paths['/api/v1/organization/responsibilities/reconcile'].post.responses['200']
    .content['*/*'].schema.$ref, '#/components/schemas/ResponsibilityReconciliationResponse');
  assert.equal(current.components.schemas.ResponsibilityReconciliationResponse.properties.issues.items.$ref,
    '#/components/schemas/Issue');
  assert.equal(current.components.schemas.ResponsibilityReconciliationResponse.properties.scannedAssignments.type,
    'integer');
  assert.ok(current.components.schemas.Issue.properties.code.enum.includes('MISSING_ASSIGNEE'));
});

test('existing clients and all earlier artifact proof locks remain retained', () => {
  for (const route of [
    '/api/v1/identity/users','/api/v1/identity/me',
    '/api/v1/identity/roles','/api/v1/identity/permissions',
    '/api/v1/organization/units','/api/v1/organization/hierarchy',
    '/api/v1/organization/responsibilities',
  ]) assert.ok(current.paths[route]);
  const config = fs.readFileSync(path.join(root,'orval.identity-organization.config.ts'),'utf8');
  assert.ok(config.includes('openapi/candidates/hidra-identity-organization-720e9222b30fa45b7423ede9c9f141ab87298024.json'));
  const checker = fs.readFileSync(path.join(root,'scripts/check-openapi-compatibility.mjs'),'utf8');
  for (const lock of [
    'IDENTITY_ORGANIZATION_CURRENT_PROOF','PLANNING_CURRENT_PROOF','WORKBENCH_CURRENT_PROOF',
    'ALARM_CURRENT_PROOF','SIMULATION_CURRENT_PROOF','ANALYTICS_CURRENT_PROOF',
    'REPORTING_CURRENT_PROOF','DOCUMENTS_CURRENT_PROOF','CONFIGURATION_CURRENT_PROOF',
    'AUDIT_CURRENT_PROOF','INTEGRITY_CURRENT_PROOF','ASSETS_CURRENT_PROOF',
    'HSE_CURRENT_PROOF','LEAK_CURRENT_PROOF','CUSTODY_CURRENT_PROOF',
    'INCIDENT_CURRENT_PROOF','WORKFLOW_CURRENT_PROOF','TELEMETRY_CURRENT_PROOF',
    'TOPOLOGY_CURRENT_PROOF','RISK_CURRENT_PROOF'
  ]) assert.ok(checker.includes(lock));
});

test('HAPI-929 repin preserves the accepted Identity and Organization surface', () => {
  const load = (sha) => fs.readFileSync(path.join(root, 'openapi/candidates', `hidra-identity-organization-${sha}.json`));
  const sha = '720e9222b30fa45b7423ede9c9f141ab87298024';
  const priorBytes = load('18e7a7596aea1b26e958130996c8811ae7fe27e4');
  const nextBytes = load(sha);
  const digest = (content) => crypto.createHash('sha256').update(content).digest('hex');
  assert.equal(digest(priorBytes), '050bf86810479d9cef87e3e200928f7993d342dbb51bf835d5110f15e53f94a4');
  assert.equal(digest(nextBytes), '95a9f9d224838d395a8348bf9a56c2374d5a29cb9e4e6dbb428ccc8d40e6c03b');
  const prior = JSON.parse(priorBytes), next = JSON.parse(nextBytes);
  assert.equal(next['x-hidra-ci-source-sha'], sha);
  assert.equal(Object.keys(next.paths).length, 59);
  assert.equal(Object.keys(next.components.schemas).length, 62);
  for (const [route, operation] of Object.entries(prior.paths)) assert.deepEqual(next.paths[route], operation);
  assert.deepEqual(next.components.securitySchemes, prior.components.securitySchemes);
  for (const [route, status] of [['refresh', '200'], ['logout', '204']]) {
    const operation = next.paths[`/api/v1/identity/authentication/${route}`].post;
    assert.deepEqual(operation.security, []);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref, '#/components/schemas/RefreshTokenRequest');
    assert.ok(operation.responses[status]);
  }
});
