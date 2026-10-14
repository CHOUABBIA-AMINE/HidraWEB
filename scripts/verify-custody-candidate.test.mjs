import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fileName = 'hidra-custody-da4ce33ead7db40776049c861027947b61b96270.json';
const candidatePath = path.join(root, 'openapi/candidates', fileName);
const legacyPath = path.join(root, 'openapi/hidra-custody-63f3f60974ce57eb8cd5e42910397615195624fb.json');
const bytes = fs.readFileSync(candidatePath);
const candidate = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));

test('Custody slice has the exact source-backed OpenAPI fingerprint', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
    '9a5daa35cd1bbe1750eef998553ba925d5cfb008d40d309f47fd86889bb5dfe1');
  assert.equal(candidate.openapi, '3.1.0');
  assert.equal(Object.keys(candidate.paths).length, 7);
  assert.equal(Object.keys(candidate.components.schemas).length, 6);
  assert.equal(candidate.servers, undefined);
  assert.ok(Object.keys(candidate.paths).every((route) => route.startsWith('/api/v1/custody/')));
});

test('Custody operational commands use typed requests and backend authentication', () => {
  for (const [route, request, response] of [
    ['/api/v1/custody/transfer-tickets', 'CreateCustodyTransferTicketRequest', 'CustodyTransferTicketResponse'],
    ['/api/v1/custody/measurement-periods', 'OpenCustodyMeasurementPeriodRequest', 'CustodyMeasurementPeriodResponse'],
    ['/api/v1/custody/discrepancies', 'OpenCustodyDiscrepancyRequest', 'CustodyDiscrepancyResponse'],
  ]) {
    const operation = candidate.paths[route].post;
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
    assert.equal(operation.responses['200'].content['*/*'].schema.$ref,
      `#/components/schemas/${response}`);
  }
  assert.equal(candidate.components.schemas.CreateCustodyTransferTicketRequest.properties.ticketDate.format, 'date-time');
  assert.equal(candidate.components.schemas.OpenCustodyDiscrepancyRequest.properties.differenceQuantity.type, 'number');
  assert.equal(candidate.components.schemas.OpenCustodyMeasurementPeriodRequest.properties.periodEnd.format, 'date-time');
});

test('new Custody aliases and capabilities are transport only and preserve existing methods', () => {
  for (const [route, operations] of Object.entries(legacy.paths)) {
    for (const verb of Object.keys(operations)) {
      assert.ok(candidate.paths[route]?.[verb], `removed ${verb.toUpperCase()} ${route}`);
    }
  }
  const differences = compareContractSlice('custody', legacy, candidate);
  assert.equal(differences.filter((item) => item.breaking).length, 0);
  const aliases = [
    '/api/v1/custody/create-transfer-ticket',
    '/api/v1/custody/open-measurement-period',
    '/api/v1/custody/open-discrepancy',
  ];
  for (const route of aliases) {
    assert.deepEqual(candidate.paths[route].post.security, [{ hidraBearerJwt: [] }]);
  }
  assert.deepEqual(candidate.paths['/api/v1/custody/capabilities'].get.security,
    [{ hidraBearerJwt: [] }]);
});

test('active Custody pin is fingerprinted without bypassing prior compatibility checks', () => {
  const config = fs.readFileSync(path.join(root, 'orval.custody.config.ts'), 'utf8');
  assert.ok(config.includes(`./openapi/candidates/${fileName}`));
  assert.ok(!config.includes('hidra-custody-63f3f60974ce57eb8cd5e42910397615195624fb.json'));
  const gate = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const token of ['CUSTODY_CURRENT_PROOF', 'source-backed Custody contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'compareSlice(config, slice);']) {
    assert.ok(gate.includes(token));
  }
});
