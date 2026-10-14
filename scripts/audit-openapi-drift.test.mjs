import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { auditContracts, compareContractSlice, runAudit } from './audit-openapi-drift.mjs';

const base = {
  openapi: '3.1.0',
  paths: {
    '/api/v1/risk/assessments': {
      post: {
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRiskAssessmentRequest' } } } },
        responses: { '200': { content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' } } } } } } },
      },
    },
  },
  components: {
    schemas: {
      CreateRiskAssessmentRequest: {
        type: 'object',
        properties: { riskRegisterId: { type: 'string' }, assessmentNumber: { type: 'string' } },
      },
    },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test('reports optional newly published risk scopes without classifying them as breaking', () => {
  const backend = clone(base);
  backend.components.schemas.CreateRiskAssessmentRequest.properties.scopes = {
    type: 'array',
    items: { $ref: '#/components/schemas/RiskAssessmentScopeInput' },
  };
  backend.components.schemas.RiskAssessmentScopeInput = {
    type: 'object',
    properties: { scopeType: { type: 'string' }, scopeId: { type: 'string' } },
  };
  const result = auditContracts(backend, [{ name: 'risk', document: base }]);
  assert.equal(result.sliceCount, 1);
  assert.equal(result.breaking, 0);
  assert.deepEqual(result.findings.map((item) => item.kind), ['field_added']);
  assert.match(result.findings[0].detail, /scopes$/);
});

test('flags required fields and incompatible schema changes', () => {
  const backend = clone(base);
  const request = backend.components.schemas.CreateRiskAssessmentRequest;
  request.required = ['assessmentNumber'];
  request.properties.riskRegisterId.type = 'integer';
  const findings = compareContractSlice('risk', base, backend);
  assert.ok(findings.some((item) => item.kind === 'new_required_field' && item.breaking));
  assert.ok(findings.some((item) => item.kind === 'type_changed' && item.breaking));
});

test('detects removed operations and schema fields', () => {
  const backend = clone(base);
  delete backend.paths['/api/v1/risk/assessments'].post;
  assert.equal(compareContractSlice('risk', base, backend)[0].kind, 'method_removed');
  backend.paths = clone(base.paths);
  delete backend.components.schemas.CreateRiskAssessmentRequest.properties.riskRegisterId;
  assert.ok(compareContractSlice('risk', base, backend).some((item) => item.kind === 'field_removed'));
});

test('requires source artifact integrity and reads pinned Orval input from disk', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hidra-contract-'));
  try {
    fs.mkdirSync(path.join(root, 'openapi'));
    const backend = clone(base);
    backend.components.schemas.CreateRiskAssessmentRequest.properties.scopes = { type: 'array', items: { type: 'string' } };
    const full = path.join(root, 'backend.json');
    const bytes = JSON.stringify(backend);
    fs.writeFileSync(full, bytes);
    fs.writeFileSync(path.join(root, 'orval.risk.config.ts'), "input: { target: './openapi/risk.json' }");
    fs.writeFileSync(path.join(root, 'openapi/risk.json'), JSON.stringify(base));
    const digest = crypto.createHash('sha256').update(bytes).digest('hex');
    const result = runAudit(['--root', root, '--backend', full, '--expect-sha256', digest, '--strict']);
    assert.equal(result.strictFailure, true);
    assert.equal(result.additions, 1);
    assert.equal(result.breaking, 0);
    assert.equal(result.backendSha256, `sha256:${digest}`);
    assert.throws(() => runAudit(['--root', root, '--backend', full, '--expect-sha256', 'wrong']), /digest mismatch/);
    assert.equal(runAudit(['--root', root, '--backend', full]).strictFailure, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
