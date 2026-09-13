import console from 'node:console';
import fs from 'node:fs';
import process from 'node:process';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { parse as parseYaml } from 'yaml';

const METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'openapi/compatibility/hidra-api-baseline.json'), 'utf8'));
const artifactPath = path.join(root, manifest.fullContractGzip);
const gzipBytes = fs.readFileSync(artifactPath);
const fullBytes = gunzipSync(gzipBytes);
const backend = JSON.parse(fullBytes.toString('utf8'));
const errors = [];

checkEvidence();

const configs = fs.readdirSync(root)
  .filter((name) => /^orval\..+\.config\.ts$/.test(name) && name !== 'orval.config.ts')
  .sort();

if (configs.length !== manifest.expectedOrvalContracts) {
  errors.push(`expected ${manifest.expectedOrvalContracts} feature Orval configs, found ${configs.length}`);
}

const seen = new Set();
for (const config of configs) {
  const source = fs.readFileSync(path.join(root, config), 'utf8');
  const matches = [...source.matchAll(/target:\s*['"](\.\/openapi\/[^'"]+\.(?:json|ya?ml))['"]/g)];
  if (matches.length !== 1) {
    errors.push(`${config}: expected exactly one checked-in OpenAPI input, found ${matches.length}`);
    continue;
  }
  const target = matches[0][1].slice(2);
  if (seen.has(target)) errors.push(`${config}: duplicate OpenAPI input ${target}`);
  seen.add(target);
  const file = path.join(root, target);
  if (!fs.existsSync(file)) {
    errors.push(`${config}: missing OpenAPI input ${target}`);
    continue;
  }
  const slice = loadSpec(file);
  const before = errors.length;
  compareSlice(config, slice);
  const paths = Object.keys(slice.paths ?? {}).length;
  const schemas = Object.keys(slice.components?.schemas ?? {}).length;
  console.log(`[openapi:compat] ${config}: ${paths} paths, ${schemas} schemas, ${errors.length === before ? 'compatible' : 'FAILED'}`);
}

if (errors.length) {
  console.error(`\nOpenAPI compatibility gate failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`\nOpenAPI compatibility gate passed for ${configs.length} feature contracts against HidraAPI ${manifest.backendCommit}.`);

function checkEvidence() {
  const required = ['repository', 'backendCommit', 'workflowRunId', 'artifactId', 'artifactName', 'artifactDigest', 'fullSpecSha256', 'fullContractGzip', 'fullContractGzipSha256', 'expectedOrvalContracts'];
  for (const key of required) if (manifest[key] === undefined || manifest[key] === '') errors.push(`baseline manifest missing ${key}`);
  if (manifest.repository !== 'CHOUABBIA-AMINE/HidraAPI') errors.push(`unexpected backend repository ${manifest.repository}`);
  if (manifest.artifactName !== `hidra-api-openapi-${manifest.backendCommit}`) errors.push('artifact name does not match backend commit');
  if (hash(gzipBytes) !== manifest.fullContractGzipSha256) errors.push('checked-in compressed contract hash does not match manifest');
  if (hash(fullBytes) !== manifest.fullSpecSha256) errors.push('checked-in full contract hash does not match manifest');
  if (backend.openapi !== '3.1.0') errors.push(`expected OpenAPI 3.1.0 baseline, found ${backend.openapi ?? 'missing'}`);
}

function compareSlice(config, slice) {
  if (!slice.paths || typeof slice.paths !== 'object') {
    errors.push(`${config}: OpenAPI input has no paths object`);
    return;
  }
  for (const [route, pathItem] of Object.entries(slice.paths)) {
    const backendPath = backend.paths?.[route];
    if (!backendPath) {
      errors.push(`${config}: backend removed path ${route}`);
      continue;
    }
    for (const [method, operation] of Object.entries(pathItem ?? {})) {
      if (!METHODS.has(method)) continue;
      const actual = backendPath?.[method];
      const label = `${method.toUpperCase()} ${route}`;
      if (!actual) {
        errors.push(`${config}: backend removed ${label}`);
        continue;
      }
      compareParameters(config, label, pathItem, operation, backendPath, actual, slice);
      compareRequest(config, label, operation, actual, slice);
      compareResponses(config, label, operation, actual, slice);
    }
  }
}

function compareParameters(config, label, expectedPath, expectedOp, actualPath, actualOp, slice) {
  const expected = [...(expectedPath.parameters ?? []), ...(expectedOp.parameters ?? [])].filter((p) => !p?.$ref);
  const actual = [...(actualPath.parameters ?? []), ...(actualOp.parameters ?? [])].filter((p) => !p?.$ref);
  const e = new Map(expected.map((p) => [`${p.in}:${p.name}`, p]));
  const a = new Map(actual.map((p) => [`${p.in}:${p.name}`, p]));
  for (const [key, p] of e) {
    if (!a.has(key)) errors.push(`${config}: backend removed parameter ${key} from ${label}`);
    else compareSchema(p.schema ?? {}, a.get(key).schema ?? {}, slice, backend, `${config}: ${label} parameter ${key}`, new Set());
  }
  for (const [key, p] of a) if (p.required === true && !e.has(key)) errors.push(`${config}: backend added required parameter ${key} to ${label}`);
}

function compareRequest(config, label, expectedOp, actualOp, slice) {
  const expected = expectedOp.requestBody;
  const actual = actualOp.requestBody;
  if (!expected) {
    if (actual?.required === true) errors.push(`${config}: backend added required request body to ${label}`);
    return;
  }
  if (!actual) {
    errors.push(`${config}: backend removed request body from ${label}`);
    return;
  }
  compareContent(config, label, 'request', expected.content, actual.content, slice);
}

function compareResponses(config, label, expectedOp, actualOp, slice) {
  for (const [status, expected] of Object.entries(expectedOp.responses ?? {})) {
    const actual = actualOp.responses?.[status];
    if (!actual) errors.push(`${config}: backend removed response ${status} from ${label}`);
    else compareContent(config, label, `response ${status}`, expected?.content, actual?.content, slice);
  }
}

function compareContent(config, label, kind, expectedContent = {}, actualContent = {}, slice) {
  for (const [mediaType, expectedMedia] of Object.entries(expectedContent ?? {})) {
    const actualMedia = actualContent?.[mediaType] ?? (mediaType === '*/*' ? Object.values(actualContent ?? {})[0] : undefined);
    if (!actualMedia) {
      errors.push(`${config}: backend removed ${kind} media type ${mediaType} from ${label}`);
      continue;
    }
    compareSchema(expectedMedia?.schema ?? {}, actualMedia?.schema ?? {}, slice, backend, `${config}: ${label} ${kind}`, new Set());
  }
}

function compareSchema(expected, actual, expectedRoot, actualRoot, context, visited) {
  if (!expected || !actual || typeof expected !== 'object' || typeof actual !== 'object') return;
  const key = `${expected.$ref ?? JSON.stringify(expected).slice(0, 80)}|${actual.$ref ?? JSON.stringify(actual).slice(0, 80)}`;
  if (visited.has(key)) return;
  visited.add(key);

  const e = resolve(expected, expectedRoot);
  const a = resolve(actual, actualRoot);
  if (!e || !a) {
    if (e && !a) errors.push(`${context}: backend removed referenced schema`);
    return;
  }
  if (e !== expected || a !== actual) return compareSchema(e, a, expectedRoot, actualRoot, context, visited);

  if (e.type && a.type && e.type !== a.type) errors.push(`${context}: type changed from ${e.type} to ${a.type}`);
  if (e.format && a.format && e.format !== a.format) errors.push(`${context}: format changed from ${e.format} to ${a.format}`);
  if (Array.isArray(e.enum) && Array.isArray(a.enum)) {
    for (const value of e.enum) if (!a.enum.includes(value)) errors.push(`${context}: enum value ${JSON.stringify(value)} was removed`);
  }
  if (e.items) compareSchema(e.items, a.items ?? {}, expectedRoot, actualRoot, `${context} items`, visited);

  const ep = e.properties ?? {};
  const ap = a.properties ?? {};
  for (const [name, schema] of Object.entries(ep)) {
    if (!(name in ap)) errors.push(`${context}: property ${name} was removed`);
    else compareSchema(schema, ap[name], expectedRoot, actualRoot, `${context}.${name}`, visited);
  }
  const expectedRequired = new Set(e.required ?? []);
  for (const name of a.required ?? []) if (!expectedRequired.has(name) && name in ep) errors.push(`${context}: existing property ${name} became required`);
}

function resolve(schema, spec) {
  if (!schema?.$ref) return schema;
  const prefix = '#/components/schemas/';
  if (!schema.$ref.startsWith(prefix)) return schema;
  return spec.components?.schemas?.[schema.$ref.slice(prefix.length)];
}

function loadSpec(file) {
  const text = fs.readFileSync(file, 'utf8');
  return file.endsWith('.json') ? JSON.parse(text) : parseYaml(text);
}

function hash(bytes) {
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`;
}
