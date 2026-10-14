import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidatePath = path.join(root, 'openapi/candidates/hidra-risk-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json');
const pinnedPath = path.join(root, 'openapi/hidra-risk-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const raw = fs.readFileSync(candidatePath);
const candidate = JSON.parse(raw.toString('utf8'));
const pinned = JSON.parse(fs.readFileSync(pinnedPath, 'utf8'));
const sha256 = 'c4b5e87473bea32fa7d2724e4871ca0017a0e43ae76dd063a459f69d6e94b3f0';
const expectedSourceCommit = '81d46bcb8bc8821f67eafbb26cd1279f6d091457';

test('current backend risk contract candidate has exact verified source digest', () => {
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), sha256);
  assert.equal(candidate.openapi, '3.1.0');
  assert.equal(Object.keys(candidate.paths).length, 10);
  assert.equal(Object.keys(candidate.components.schemas).length, 9);
  assert.match(candidatePath, new RegExp(expectedSourceCommit));
  assert.equal(candidate.servers, undefined);
});

test('candidate includes a complete typed risk assessment scope array', () => {
  const assessment = candidate.components.schemas.CreateRiskAssessmentRequest;
  assert.deepEqual(assessment.properties.scopes, {
    type: 'array',
    items: { $ref: '#/components/schemas/RiskAssessmentScopeInput' },
  });
  const scope = candidate.components.schemas.RiskAssessmentScopeInput.properties;
  assert.deepEqual(Object.keys(scope).sort(), [
    'included', 'operationalPeriodEnd', 'operationalPeriodStart',
    'scopeId', 'scopeNote', 'scopeType', 'topologySnapshotId',
  ]);
  assert.equal(scope.included.type, 'boolean');
  assert.equal(scope.operationalPeriodStart.format, 'date-time');
  assert.equal(scope.operationalPeriodEnd.format, 'date-time');
});

test('candidate governance operations do not grant browser authorization by themselves', () => {
  const expectations = [
    ['approve', 'ApproveRiskAssessmentCommand'],
    ['score', 'ScoreRiskAssessmentCommand'],
    ['submit', undefined],
  ];
  for (const [action, requestName] of expectations) {
    const operation = candidate.paths[`/api/v1/risk/assessments/{id}/${action}`].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.parameters[0].required, true);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/RiskAssessmentSummaryDto');
    if (requestName) {
      assert.equal(operation.requestBody.content['application/json'].schema.$ref, `#/components/schemas/${requestName}`);
    } else {
      assert.equal(operation.requestBody, undefined);
    }
  }
});

test('candidate is an additive risk delta and the active pinned transport stays separate', () => {
  const changes = compareContractSlice('risk', pinned, candidate);
  assert.equal(changes.some((item) => item.kind === 'field_removed' || item.kind === 'method_removed'), false);
  assert.ok(changes.some((item) => item.kind === 'field_added' && item.detail.endsWith('.scopes')));
  assert.equal(pinned.components.schemas.CreateRiskAssessmentRequest.properties.scopes, undefined);
});
