import { Buffer } from 'node:buffer';
import console from 'node:console';
import fs from 'node:fs';
import process from 'node:process';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { parse as parseYaml } from 'yaml';

const METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']);
const RISK_CURRENT_PROOF = {
  config: 'orval.risk.config.ts',
  path: 'openapi/candidates/hidra-risk-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json',
  sha256: 'sha256:c4b5e87473bea32fa7d2724e4871ca0017a0e43ae76dd063a459f69d6e94b3f0',
  paths: 10,
  schemas: 9,
};
const TOPOLOGY_CURRENT_PROOF = {
  config: 'orval.topology.config.ts',
  path: 'openapi/candidates/hidra-topology-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json',
  sha256: 'sha256:d13552357918e27dd51d6377e5fef6eaaff621be953bfa50ad9f7f7247440904',
  paths: 10,
  schemas: 13,
};
const TELEMETRY_CURRENT_PROOF = {
  config: 'orval.telemetry-monitoring.config.ts',
  path: 'openapi/candidates/hidra-telemetry-monitoring-da4ce33ead7db40776049c861027947b61b96270.json',
  sha256: 'sha256:55f5ea67d7dfecb6c2b5a88bd6619a58081d653d92d44518aacbdace03b792f3',
  paths: 17,
  schemas: 16,
};
const WORKFLOW_CURRENT_PROOF = {
  config: 'orval.workflow.config.ts',
  path: 'openapi/candidates/hidra-workflow-da4ce33ead7db40776049c861027947b61b96270.json',
  sha256: 'sha256:becdd0505299b437d743fe71ffabb56bca26211435ce43dc2669ac8095f975f5',
  paths: 12,
  schemas: 13,
};
const INCIDENT_CURRENT_PROOF = {
  config: 'orval.incident.config.ts',
  path: 'openapi/candidates/hidra-incident-da4ce33ead7db40776049c861027947b61b96270.json',
  sha256: 'sha256:54dd4419087f18f52804bb3924fef3ada98c71c16b3b612984f28764dbc7c3eb',
  paths: 8,
  schemas: 6,
};
const CUSTODY_CURRENT_PROOF = {
  config: 'orval.custody.config.ts',
  path: 'openapi/candidates/hidra-custody-da4ce33ead7db40776049c861027947b61b96270.json',
  sha256: 'sha256:9a5daa35cd1bbe1750eef998553ba925d5cfb008d40d309f47fd86889bb5dfe1',
  paths: 7,
  schemas: 6,
};
const LEAK_CURRENT_PROOF = {
  config: 'orval.leak.config.ts',
  path: 'openapi/candidates/hidra-leak-da4ce33ead7db40776049c861027947b61b96270.json',
  sha256: 'sha256:4c55a76cdf581954c2a35fce197ce4c0df3b0f827c09752fe9091b3649bfc91c',
  paths: 9,
  schemas: 9,
};
const HSE_CURRENT_PROOF = {
  config: 'orval.hse.config.ts',
  path: 'openapi/candidates/hidra-hse-da4ce33ead7db40776049c861027947b61b96270.json',
  sha256: 'sha256:137b5f0f0020a20c3ed956a489ac08d798f0b29f5085e5a28d8abd7102d869ed',
  paths: 9,
  schemas: 9,
};
const ASSETS_CURRENT_PROOF = {
  config: 'orval.assets.config.ts',
  path: 'openapi/candidates/hidra-assets-76b14cda4520f1eff242bd474c02ce4db317d385.json',
  sha256: 'sha256:ba9cca93db79451a7fedfd35a322ddd71c837273a6ffe3fd5e47d5d0706bfc11',
  paths: 8,
  schemas: 7,
};
const INTEGRITY_CURRENT_PROOF = {
  config: 'orval.integrity.config.ts',
  path: 'openapi/candidates/hidra-integrity-76b14cda4520f1eff242bd474c02ce4db317d385.json',
  sha256: 'sha256:67e7cedbd59587b1f3af15ec83c3f9718f7c783dc40bc01597b0aef0ae3ebd79',
  paths: 7,
  schemas: 6,
};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'openapi/compatibility/hidra-api-baseline.json'), 'utf8'));
const artifactBase64 = manifest.fullContractGzipBase64Parts
  .map((part) => fs.readFileSync(path.join(root, part), 'utf8').trim())
  .join('');
const gzipBytes = Buffer.from(artifactBase64, 'base64');
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
  if (config === RISK_CURRENT_PROOF.config) {
    if (target !== RISK_CURRENT_PROOF.path) errors.push(`${config}: Risk pin must use the verified current source`);
    if (hash(fs.readFileSync(file)) !== RISK_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Risk contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== RISK_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== RISK_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/risk/'))) {
      errors.push(`${config}: current Risk contract structure differs from the verified artifact`);
    }
  } else if (config === TOPOLOGY_CURRENT_PROOF.config) {
    if (target !== TOPOLOGY_CURRENT_PROOF.path) {
      errors.push(`${config}: Topology pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== TOPOLOGY_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Topology contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== TOPOLOGY_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== TOPOLOGY_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/topology/'))) {
      errors.push(`${config}: current Topology contract structure differs from the verified artifact`);
    }
  } else if (config === TELEMETRY_CURRENT_PROOF.config) {
    if (target !== TELEMETRY_CURRENT_PROOF.path) {
      errors.push(`${config}: Telemetry/Monitoring pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== TELEMETRY_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Telemetry/Monitoring contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== TELEMETRY_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== TELEMETRY_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/telemetry/') && !route.startsWith('/api/v1/monitoring/'))) {
      errors.push(`${config}: Telemetry/Monitoring structure differs from the verified artifact`);
    }
  } else if (config === WORKFLOW_CURRENT_PROOF.config) {
    if (target !== WORKFLOW_CURRENT_PROOF.path) {
      errors.push(`${config}: Workflow pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== WORKFLOW_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Workflow contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== WORKFLOW_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== WORKFLOW_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/workflow/'))) {
      errors.push(`${config}: Workflow contract structure differs from the verified artifact`);
    }
  } else if (config === INCIDENT_CURRENT_PROOF.config) {
    if (target !== INCIDENT_CURRENT_PROOF.path) {
      errors.push(`${config}: Incident pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== INCIDENT_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Incident contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== INCIDENT_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== INCIDENT_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/incident/'))) {
      errors.push(`${config}: Incident contract structure differs from the verified artifact`);
    }
  } else if (config === CUSTODY_CURRENT_PROOF.config) {
    if (target !== CUSTODY_CURRENT_PROOF.path) {
      errors.push(`${config}: Custody pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== CUSTODY_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Custody contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== CUSTODY_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== CUSTODY_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/custody/'))) {
      errors.push(`${config}: Custody contract structure differs from the verified artifact`);
    }
  } else if (config === LEAK_CURRENT_PROOF.config) {
    if (target !== LEAK_CURRENT_PROOF.path) {
      errors.push(`${config}: Leak Detection pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== LEAK_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Leak Detection contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== LEAK_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== LEAK_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/leakdetection/'))) {
      errors.push(`${config}: Leak Detection contract structure differs from the verified artifact`);
    }
  } else if (config === HSE_CURRENT_PROOF.config) {
    if (target !== HSE_CURRENT_PROOF.path) {
      errors.push(`${config}: HSE pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== HSE_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed HSE contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== HSE_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== HSE_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/hse/'))) {
      errors.push(`${config}: HSE contract structure differs from the verified artifact`);
    }
  } else if (config === ASSETS_CURRENT_PROOF.config) {
    if (target !== ASSETS_CURRENT_PROOF.path) {
      errors.push(`${config}: Assets pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== ASSETS_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Assets contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== ASSETS_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== ASSETS_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/assets/'))) {
      errors.push(`${config}: Assets contract structure differs from the verified artifact`);
    }
  } else if (config === INTEGRITY_CURRENT_PROOF.config) {
    if (target !== INTEGRITY_CURRENT_PROOF.path) {
      errors.push(`${config}: Integrity pin must use the verified current source`);
    }
    if (hash(fs.readFileSync(file)) !== INTEGRITY_CURRENT_PROOF.sha256) {
      errors.push(`${config}: source-backed Integrity contract digest mismatch`);
    }
    if (slice.openapi !== '3.1.0'
      || Object.keys(slice.paths ?? {}).length !== INTEGRITY_CURRENT_PROOF.paths
      || Object.keys(slice.components?.schemas ?? {}).length !== INTEGRITY_CURRENT_PROOF.schemas
      || Object.keys(slice.paths ?? {}).some((route) => !route.startsWith('/api/v1/integrity/'))) {
      errors.push(`${config}: Integrity contract structure differs from the verified artifact`);
    }
  } else {
    compareSlice(config, slice);
  }
  const paths = Object.keys(slice.paths ?? {}).length;
  const schemas = Object.keys(slice.components?.schemas ?? {}).length;
  const proof = [RISK_CURRENT_PROOF.config, TOPOLOGY_CURRENT_PROOF.config, TELEMETRY_CURRENT_PROOF.config, WORKFLOW_CURRENT_PROOF.config, INCIDENT_CURRENT_PROOF.config, CUSTODY_CURRENT_PROOF.config, LEAK_CURRENT_PROOF.config, HSE_CURRENT_PROOF.config, ASSETS_CURRENT_PROOF.config, INTEGRITY_CURRENT_PROOF.config].includes(config)
    ? 'current-artifact SHA-256' : 'historical full OpenAPI baseline';
  console.log(`[openapi:compat] ${config}: ${paths} paths, ${schemas} schemas, ${proof}, ${errors.length === before ? 'compatible' : 'FAILED'}`);
}

if (errors.length) {
  console.error(`\nOpenAPI compatibility gate failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`\nOpenAPI compatibility gate passed for ${configs.length} contracts: Risk and Topology from verified HidraAPI 81d46bcb8bc8821f67eafbb26cd1279f6d091457; Telemetry/Monitoring, Workflow, Incident, Custody, Leak Detection and HSE from verified HidraAPI da4ce33ead7db40776049c861027947b61b96270; Assets and Integrity from verified HidraAPI 76b14cda4520f1eff242bd474c02ce4db317d385; other slices against HidraAPI ${manifest.backendCommit}.`);

function checkEvidence() {
  const required = ['repository', 'backendCommit', 'workflowRunId', 'artifactId', 'artifactName', 'artifactDigest', 'fullSpecSha256', 'fullContractGzipBase64Parts', 'fullContractGzipSha256', 'expectedOrvalContracts'];
  for (const key of required) if (manifest[key] === undefined || manifest[key] === '') errors.push(`baseline manifest missing ${key}`);
  if (!Array.isArray(manifest.fullContractGzipBase64Parts) || manifest.fullContractGzipBase64Parts.length === 0) errors.push('baseline manifest has no contract artifact parts');
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
