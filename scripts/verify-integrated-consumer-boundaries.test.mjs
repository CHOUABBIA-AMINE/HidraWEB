import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const baseline = JSON.parse(read('openapi/compatibility/hidra-api-baseline.json'));
const featureConfigs = fs.readdirSync(root)
  .filter(name => /^orval\.[a-z][a-z0-9-]*\.config\.ts$/.test(name)).sort();

test('every operational client generator has a pinned OpenAPI source and generation command', () => {
  assert.equal(featureConfigs.length, 20);
  assert.equal(baseline.expectedOrvalContracts, 20);
  const packageJson = JSON.parse(read('package.json'));
  const seen = new Set();
  for (const config of featureConfigs) {
    const source = read(config);
    const match = source.match(/target:\s*['"]\.\/(openapi\/candidates\/[^'"]+\.json)['"]/);
    assert.ok(match, `missing source-backed input for ${config}`);
    assert.ok(!seen.has(match[1]), `duplicate input ${match[1]}`);
    seen.add(match[1]);
    assert.ok(fs.existsSync(path.join(root, match[1])));
    const name = config.slice('orval.'.length, -'.config.ts'.length);
    assert.ok(packageJson.scripts[`api:generate:${name}`]);
  }
});

test('consumer adapters retain the generated identity and planning model boundaries', () => {
  const auth = read('src/app/auth/authenticationGateway.ts');
  const planning = read('src/features/planning/api/planningApi.ts');
  assert.ok(auth.includes("from '@/api/generated/identity-organization/model'"));
  assert.ok(planning.includes("from '@/api/generated/planning/model'"));
  assert.ok(auth.includes('completeOidcLogin'));
  assert.ok(planning.includes('ExecutePlanningApprovalActionRequest'));
  assert.ok(planning.includes('expectedTaskUpdatedAt') || read('openapi/candidates/hidra-planning-d14c44fc527ea1115ad87baafa21a3264bf6950c.json').includes('expectedTaskUpdatedAt'));
});

test('identity contract distinguishes public login, external OIDC and effective JWT', () => {
  const identity = JSON.parse(read('openapi/candidates/hidra-identity-organization-d14c44fc527ea1115ad87baafa21a3264bf6950c.json'));
  assert.deepEqual(identity.paths['/api/v1/identity/authentication/login'].post.security, []);
  assert.deepEqual(identity.paths['/api/v1/identity/authentication/oidc/complete'].post.security,
    [{ externalOidcBearerJwt: [] }]);
  assert.deepEqual(identity.paths['/api/v1/identity/me'].get.security, [{ hidraBearerJwt: [] }]);
  const client = read('src/api/client/hidraAxios.ts');
  assert.ok(client.includes('resolveAuthorizationHeader()'));
  assert.ok(client.includes("config.headers.delete('Authorization')"));
  assert.ok(client.includes('dispatchUnauthorizedEvent()'));
});

test('backend permission decisions remain the authority for operational actions', () => {
  const permission = read('src/features/permissions/api/permissionApi.ts');
  const alarm = read('src/features/alarm/api/alarmPermissions.ts');
  const organization = read('src/features/context/api/identityOrganizationPermissions.ts');
  assert.ok(permission.includes('fetchEffectivePermissions'));
  assert.ok(permission.includes('permissionEndpoints.effective'));
  assert.ok(alarm.includes('alarm:suppressions:execute'));
  assert.ok(organization.includes('organization:responsibility:assign'));
  assert.ok(organization.includes('organization:responsibility:revoke'));
  const identity = JSON.parse(read('openapi/candidates/hidra-identity-organization-d14c44fc527ea1115ad87baafa21a3264bf6950c.json'));
  assert.ok(identity.paths['/api/v1/identity/permissions/evaluations']);
  assert.ok(identity.paths['/api/v1/organization/responsibilities']);
});
