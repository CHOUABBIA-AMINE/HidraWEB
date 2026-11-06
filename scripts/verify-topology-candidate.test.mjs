import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidatePath = path.join(root, 'openapi/candidates/hidra-topology-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json');
const previousPath = path.join(root, 'openapi/hidra-topology-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const raw = fs.readFileSync(candidatePath);
const candidate = JSON.parse(raw.toString('utf8'));
const previous = JSON.parse(fs.readFileSync(previousPath, 'utf8'));

test('topology contract source is verified and includes all published operations and schemas', () => {
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),
    'd13552357918e27dd51d6377e5fef6eaaff621be953bfa50ad9f7f7247440904');
  assert.equal(candidate.openapi, '3.1.0');
  assert.equal(Object.keys(candidate.paths).length, 10);
  assert.equal(Object.keys(candidate.components.schemas).length, 13);
  assert.equal(candidate.servers, undefined);
});

test('source-backed topology commands carry explicit typed inputs and backend security', () => {
  const paths = [
    ['/api/v1/topology/pipeline-systems', 'CreatePipelineSystemRequest', 'PipelineSystemResponse'],
    ['/api/v1/topology/facilities', 'RegisterFacilityRequest', 'FacilityResponse'],
  ];
  for (const [route, request, response] of paths) {
    const operation = candidate.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  const pipeline = candidate.components.schemas.CreatePipelineSystemRequest.properties;
  assert.equal(pipeline.systemTypeCode.type, 'string');
  assert.equal(pipeline.description.type, 'string');
  const facility = candidate.components.schemas.RegisterFacilityRequest.properties;
  assert.equal(facility.latitude.type, 'number');
  assert.equal(facility.longitude.type, 'number');
  assert.equal(facility.elevationMeters.type, 'number');
});

test('map reads remain published and the current source is additive', () => {
  for (const route of Object.keys(previous.paths)) {
    assert.ok(candidate.paths[route]?.get, `missing map read: ${route}`);
  }
  const changes = compareContractSlice('topology', previous, candidate);
  assert.ok(!changes.some((f) => ['method_removed', 'path_removed', 'field_removed'].includes(f.kind)));
  assert.deepEqual(candidate.paths['/api/v1/topology/map/layers'].get.security,
    [{ hidraBearerJwt: [] }]);
});

test('topology Orval input is activated without replacing historic source evidence', () => {
  const config = fs.readFileSync(path.join(root, 'orval.topology.config.ts'), 'utf8');
  assert.ok(config.includes('./openapi/candidates/hidra-topology-f1fdc206c916a5266f609810c045c6b5688bfd49.json'));
  assert.ok(!config.includes('hidra-topology-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const gate = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  assert.ok(gate.includes('TOPOLOGY_CURRENT_PROOF'));
  assert.ok(gate.includes('source-backed Topology contract digest mismatch'));
  assert.ok(gate.includes('RISK_CURRENT_PROOF'));
  assert.ok(gate.includes('compareSlice(config, slice);'));
});

// Historical proof above remains immutable; W2 consumes a genuine expanded runtime slice.
test('W2 runtime contract retains historical operations and closes all component references', () => {
  const bytes = fs.readFileSync(path.join(root, 'openapi/candidates/hidra-topology-f1fdc206c916a5266f609810c045c6b5688bfd49.json'));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), '76cb0959b88b9812ca2d62bc88fa2f89f9427263ff210dc82ac5365e2393c2f1');
  const current = JSON.parse(bytes);
  for (const route of Object.keys(candidate.paths)) assert.ok(current.paths[route]);
  for (const match of bytes.toString().matchAll(/"\$ref": "#\/components\/schemas\/([^"]+)"/g)) assert.ok(current.components.schemas[match[1]]);
  assert.ok(current.paths['/api/v1/topology/foundation/facilities'].post);
  assert.ok(current.paths['/api/v1/topology/engineering-networks/{draftId}/authored-topology'].put);
});
