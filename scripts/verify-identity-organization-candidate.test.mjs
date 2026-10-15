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
  assert.ok(config.includes(`./openapi/candidates/${name}`));
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
