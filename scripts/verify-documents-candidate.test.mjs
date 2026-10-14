import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { compareContractSlice } from './audit-openapi-drift.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const name = 'hidra-documents-76b14cda4520f1eff242bd474c02ce4db317d385.json';
const bytes = fs.readFileSync(path.join(root, 'openapi/candidates', name));
const current = JSON.parse(bytes.toString('utf8'));
const legacy = JSON.parse(fs.readFileSync(path.join(root,
  'openapi/hidra-documents-63f3f60974ce57eb8cd5e42910397615195624fb.json'), 'utf8'));

test('Documents source exactly matches the CI-published HidraAPI contract', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), 'a4ec466d2a5321c67ba39a67310e35cb01fcd047bf7c9f80b0d960fd2af4fc77');
  assert.equal(current.openapi, '3.1.0');
  assert.equal(Object.keys(current.paths).length, 9);
  assert.equal(Object.keys(current.components.schemas).length, 7);
  assert.equal(current.servers, undefined);
  assert.equal(current['x-hidra-contract-source'], undefined);
  assert.ok(Object.keys(current.paths).every((route) => route.startsWith('/api/v1/documents/')));
});

test('original binary upload, download, registration and linkage remain typed', () => {
  const upload = current.paths['/api/v1/documents/document-versions/upload'].post;
  const multipart = upload.requestBody.content['multipart/form-data'].schema;
  assert.equal(multipart.properties.file.format, 'binary');
  assert.deepEqual(multipart.required, ['file', 'metadata']);
  assert.equal(multipart.properties.metadata.$ref,
    '#/components/schemas/UploadDocumentBinaryVersionRequest');
  assert.deepEqual(current.components.schemas.UploadDocumentBinaryVersionRequest.required, ['documentId']);
  const download = current.paths['/api/v1/documents/document-versions/{versionId}/content'].get;
  assert.equal(download.parameters[0].name, 'versionId');
  assert.equal(download.responses['200'].content['*/*'].schema.format, 'binary');
  for (const [route, request] of [
    ['/api/v1/documents/documents', 'RegisterDocumentRequest'],
    ['/api/v1/documents/target-links', 'LinkDocumentToTargetRequest'],
  ]) {
    assert.equal(current.paths[route].post.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
  }
});

test('published document version and alias transports remain authenticated without implicit grants', () => {
  for (const [route, operationId, request] of [
    ['/api/v1/documents/document-versions', 'uploadDocumentVersion', 'UploadDocumentVersionRequest'],
    ['/api/v1/documents/upload-document-version', 'uploadDocumentVersion_1', 'UploadDocumentVersionRequest'],
    ['/api/v1/documents/register-document', 'registerDocument', 'RegisterDocumentRequest'],
    ['/api/v1/documents/link-document-to-target', 'linkDocumentToTarget_1', 'LinkDocumentToTargetRequest'],
  ]) {
    const operation = current.paths[route].post;
    assert.equal(operation.operationId, operationId);
    assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    assert.equal(operation.requestBody.required, true);
    assert.equal(operation.requestBody.content['application/json'].schema.$ref,
      `#/components/schemas/${request}`);
  }
  for (const operations of Object.values(current.paths)) {
    for (const operation of Object.values(operations)) {
      assert.deepEqual(operation.security, [{ hidraBearerJwt: [] }]);
    }
  }
  assert.equal(current.components.schemas.UploadDocumentVersionRequest.properties.fileSizeBytes.format, 'int64');
  assert.deepEqual(current.components.schemas.DocumentVersionResponse.properties.versionStatus.enum,
    ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CURRENT', 'SUPERSEDED', 'ARCHIVED']);
});

test('Documents reconciliation preserves legacy routes and all prior source locks', () => {
  for (const [route, methods] of Object.entries(legacy.paths)) {
    for (const method of Object.keys(methods)) {
      assert.ok(current.paths[route]?.[method], `missing ${method.toUpperCase()} ${route}`);
    }
  }
  const delta = compareContractSlice('documents', legacy, current);
  assert.ok(!delta.some((item) =>
    ['path_removed', 'method_removed', 'field_removed', 'response_removed'].includes(item.kind)));
  const orval = fs.readFileSync(path.join(root, 'orval.documents.config.ts'), 'utf8');
  assert.ok(orval.includes(`./openapi/candidates/${name}`));
  const checker = fs.readFileSync(path.join(root, 'scripts/check-openapi-compatibility.mjs'), 'utf8');
  for (const lock of [
    'DOCUMENTS_CURRENT_PROOF', 'source-backed Documents contract digest mismatch',
    'RISK_CURRENT_PROOF', 'TOPOLOGY_CURRENT_PROOF', 'TELEMETRY_CURRENT_PROOF',
    'WORKFLOW_CURRENT_PROOF', 'INCIDENT_CURRENT_PROOF', 'CUSTODY_CURRENT_PROOF',
    'LEAK_CURRENT_PROOF', 'HSE_CURRENT_PROOF', 'ASSETS_CURRENT_PROOF',
    'INTEGRITY_CURRENT_PROOF', 'AUDIT_CURRENT_PROOF',
    'CONFIGURATION_CURRENT_PROOF', 'compareSlice(config, slice);',
  ]) {
    assert.ok(checker.includes(lock));
  }
});
