import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { inspectGeneratedClients } from './ensure-generated-clients.mjs';

const directories = [];

function fixture({ npmScript = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'hidraweb-build-preflight-'));
  directories.push(root);
  writeFileSync(join(root, 'package.json'), JSON.stringify({
    scripts: npmScript ? { 'api:generate:demo': 'orval --config orval.demo.config.ts' } : {},
  }));
  writeFileSync(join(root, 'orval.demo.config.ts'), `
export default {
  demo: {
    input: { target: './openapi/demo.json' },
    output: {
      target: './src/api/generated/demo/demo.ts',
      schemas: './src/api/generated/demo/model',
    },
  },
};
`);
  mkdirSync(join(root, 'openapi'), { recursive: true });
  writeFileSync(join(root, 'openapi/demo.json'), '{}');
  return root;
}

function generated(root) {
  const output = join(root, 'src/api/generated/demo/demo.ts');
  const index = join(root, 'src/api/generated/demo/model/index.ts');
  mkdirSync(dirname(output), { recursive: true });
  mkdirSync(dirname(index), { recursive: true });
  writeFileSync(output, '// generated\n');
  writeFileSync(index, '// models\n');
  return { output, index };
}

afterEach(() => {
  for (const folder of directories.splice(0)) rmSync(folder, { recursive: true, force: true });
});

test('a fresh checkout correctly identifies missing Orval clients', () => {
  const root = fixture();
  assert.deepEqual(inspectGeneratedClients(root), ['demo']);
  generated(root);
  assert.deepEqual(inspectGeneratedClients(root), []);
});

test('a missing generated schema index triggers the corresponding client generator', () => {
  const root = fixture();
  const { index } = generated(root);
  rmSync(index);
  assert.deepEqual(inspectGeneratedClients(root), ['demo']);
});

test('a changed pinned OpenAPI input invalidates generated clients', () => {
  const root = fixture();
  generated(root);
  const source = join(root, 'openapi/demo.json');
  const later = new Date(Date.now() + 60_000);
  utimesSync(source, later, later);
  assert.deepEqual(inspectGeneratedClients(root), ['demo']);
});

test('missing npm generator scripts fail closed rather than skipping contracts', () => {
  const root = fixture({ npmScript: false });
  assert.throws(() => inspectGeneratedClients(root), /Missing api:generate:demo/);
});

test('all 20 repository feature generators have compatible preflight inventory', () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const manifest = JSON.parse(readFileSync(join(root, 'openapi/compatibility/hidra-api-baseline.json'), 'utf8'));
  const scripts = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts;
  const names = Object.keys(scripts).filter((name) => /^api:generate:[a-z-]+$/.test(name));
  assert.equal(names.length, manifest.expectedOrvalContracts);
  const pending = inspectGeneratedClients(root);
  assert.ok(pending.length <= manifest.expectedOrvalContracts);
  assert.ok(pending.every((name) => names.includes(`api:generate:${name}`)));
});
