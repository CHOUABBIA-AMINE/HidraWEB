import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = '18e7a7596aea1b26e958130996c8811ae7fe27e4';
for (const [name, digest, paths, schemas] of [
  ['identity-organization', '050bf86810479d9cef87e3e200928f7993d342dbb51bf835d5110f15e53f94a4', 57, 61],
  ['party', '2538dcde09e8332749b1e3bbf1978331fade66c4a14591895ce11e132c0a1ae6', 11, 9],
]) test(`${name} is a digest-pinned source-stamped runtime slice with closed references`, () => {
  const bytes = fs.readFileSync(path.join(root, `openapi/candidates/hidra-${name}-${sha}.json`));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), digest);
  const doc = JSON.parse(bytes);
  assert.equal(doc['x-hidra-ci-source-sha'], sha);
  assert.equal(Object.keys(doc.paths).length, paths);
  assert.equal(Object.keys(doc.components.schemas).length, schemas);
  const refs = [...bytes.toString().matchAll(/"\$ref": "#\/components\/schemas\/([^"]+)"/g)];
  for (const [, key] of refs) assert.ok(doc.components.schemas[key], `missing ${key}`);
  if (name === 'identity-organization') {
    assert.deepEqual(Object.keys(doc.components.schemas.IdentityLocalCredentialState.properties).sort(), ['changedAt', 'securityVersion', 'userId']);
    assert.ok(doc.components.schemas.Credential.properties.password);
    const responses = [doc.paths['/api/v1/identity/users/{id}/local-credential'].put, doc.paths['/api/v1/identity/users/{id}/local-credential/state'].get];
    for (const operation of responses) assert.equal(operation.responses['200'].content['*/*'].schema.$ref, '#/components/schemas/IdentityLocalCredentialState');
  } else {
    assert.ok(doc.paths['/api/v1/party/parties/{id}/history'].get);
    assert.ok(doc.paths['/api/v1/party/parties/{id}/activate'].post);
  }
});
