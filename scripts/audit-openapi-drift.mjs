import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const methods = new Set(['get', 'put', 'post', 'patch', 'delete', 'head', 'options']);
const entryFile = fileURLToPath(import.meta.url);

function resolve(schema, spec) {
  const prefix = '#/components/schemas/';
  if (!schema?.$ref || !schema.$ref.startsWith(prefix)) return schema;
  return spec.components?.schemas?.[schema.$ref.slice(prefix.length)];
}

export function compareContractSlice(name, pinned, backend) {
  const findings = [];
  function report(kind, route, detail, breaking = false) {
    findings.push({ slice: name, route, kind, detail, breaking });
  }
  function shapes(old, current, route, at, depth = 0, visited = new Set()) {
    if (!old || !current || depth > 24) return;
    const refs = `${old.$ref ?? ''}|${current.$ref ?? ''}`;
    if (old.$ref || current.$ref) {
      if (visited.has(refs)) return;
      visited = new Set(visited);
      visited.add(refs);
    }
    const previous = resolve(old, pinned);
    const updated = resolve(current, backend);
    if (!previous || !updated) {
      report('unresolved_reference', route, at, true);
      return;
    }
    if (old !== previous || current !== updated) {
      shapes(previous, updated, route, at, depth + 1, visited);
      return;
    }
    if (previous.type && updated.type && previous.type !== updated.type) {
      report('type_changed', route, `${at}: ${previous.type} -> ${updated.type}`, true);
      return;
    }
    if (previous.format && updated.format && previous.format !== updated.format) {
      report('format_changed', route, `${at}: ${previous.format} -> ${updated.format}`, true);
    }
    if (Array.isArray(previous.enum) && Array.isArray(updated.enum)) {
      for (const item of previous.enum) {
        if (!updated.enum.includes(item)) report('enum_removed', route, `${at}: ${String(item)}`, true);
      }
      for (const item of updated.enum) {
        if (!previous.enum.includes(item)) report('enum_added', route, `${at}: ${String(item)}`);
      }
    }
    const oldFields = previous.properties ?? {};
    const newFields = updated.properties ?? {};
    const oldRequired = new Set(previous.required ?? []);
    const newRequired = new Set(updated.required ?? []);
    for (const [field, schema] of Object.entries(oldFields)) {
      const location = `${at}.${field}`;
      if (!(field in newFields)) report('field_removed', route, location, true);
      else shapes(schema, newFields[field], route, location, depth + 1, visited);
    }
    for (const field of Object.keys(newFields)) {
      if (!(field in oldFields)) report('field_added', route, `${at}.${field}`, newRequired.has(field));
    }
    for (const field of newRequired) {
      if (!oldRequired.has(field)) report('new_required_field', route, `${at}.${field}`, true);
    }
    for (const field of oldRequired) {
      if (!newRequired.has(field)) report('required_field_relaxed', route, `${at}.${field}`);
    }
    if (previous.items && updated.items) shapes(previous.items, updated.items, route, `${at}[]`, depth + 1, visited);
  }
  function content(old, current, route, at) {
    for (const [media, descriptor] of Object.entries(old?.content ?? {})) {
      const options = current?.content ?? {};
      const actual = options[media] ?? (media === '*/*' ? Object.values(options)[0] : undefined);
      if (!actual) report('media_removed', route, `${at}: ${media}`, true);
      else shapes(descriptor.schema, actual.schema, route, `${at} ${media}`);
    }
  }
  for (const [route, pathItem] of Object.entries(pinned.paths ?? {})) {
    const currentPath = backend.paths?.[route];
    if (!currentPath) {
      report('path_removed', route, 'missing backend route', true);
      continue;
    }
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!methods.has(method)) continue;
      const actual = currentPath[method];
      const label = `${method.toUpperCase()} ${route}`;
      if (!actual) {
        report('method_removed', label, 'missing backend method', true);
        continue;
      }
      if (operation.requestBody && !actual.requestBody) report('request_removed', label, 'missing backend request', true);
      else if (operation.requestBody) content(operation.requestBody, actual.requestBody, label, 'request');
      else if (actual.requestBody?.required) report('request_newly_required', label, 'required body', true);
      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        if (!actual.responses?.[status]) report('response_removed', label, status, true);
        else content(response, actual.responses[status], label, `response ${status}`);
      }
      const oldParams = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])].filter((x) => x && !x.$ref);
      const newParams = [...(currentPath.parameters ?? []), ...(actual.parameters ?? [])].filter((x) => x && !x.$ref);
      const index = new Map(oldParams.map((x) => [`${x.in}:${x.name}`, x]));
      const seen = new Set();
      for (const item of newParams) {
        const key = `${item.in}:${item.name}`;
        seen.add(key);
        if (!index.has(key)) report(item.required ? 'parameter_newly_required' : 'parameter_added', label, key, Boolean(item.required));
        else shapes(index.get(key).schema, item.schema, label, `parameter ${key}`);
      }
      for (const key of index.keys()) {
        if (!seen.has(key)) report('parameter_removed', label, key, true);
      }
    }
  }
  return findings;
}

export function auditContracts(backend, sources) {
  const findings = sources.flatMap((source) => compareContractSlice(source.name, source.document, backend));
  return {
    sliceCount: sources.length,
    breaking: findings.filter((f) => f.breaking).length,
    additions: findings.filter((f) => !f.breaking).length,
    findings,
  };
}

function readDocument(file) {
  const input = fs.readFileSync(file, 'utf8');
  return file.endsWith('.json') ? JSON.parse(input) : parseYaml(input);
}

export function runAudit(args) {
  const options = { strict: false };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === '--strict') options.strict = true;
    else if (['--backend', '--root', '--expect-sha256'].includes(flag)) {
      if (!args[index + 1]) throw new Error(`Missing value for ${flag}`);
      options[flag.slice(2)] = args[++index];
    } else throw new Error(`Unknown option: ${flag}`);
  }
  if (!options.backend) throw new Error('Usage: npm run openapi:drift -- --backend <verified-hidra-api.json> [--expect-sha256 <digest>] [--strict]');
  const root = path.resolve(options.root ?? path.join(path.dirname(entryFile), '..'));
  const bytes = fs.readFileSync(options.backend);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (options['expect-sha256'] && digest !== options['expect-sha256'].replace(/^sha256:/, '')) {
    throw new Error('Backend artifact digest mismatch');
  }
  const backend = JSON.parse(bytes.toString('utf8'));
  if (backend.openapi !== '3.1.0' || !backend.paths || !backend.components?.schemas) {
    throw new Error('Expected a complete OpenAPI 3.1 backend contract');
  }
  const configs = fs.readdirSync(root).filter((f) => /^orval\..+\.config\.ts$/.test(f) && f !== 'orval.config.ts').sort();
  const sources = configs.map((name) => {
    const config = fs.readFileSync(path.join(root, name), 'utf8');
    const targets = [...config.matchAll(/target:\s*['"](\.\/openapi\/[^'"]+\.(?:json|ya?ml))['"]/g)];
    if (targets.length !== 1) throw new Error(`${name} must pin exactly one OpenAPI file`);
    return { name, document: readDocument(path.join(root, targets[0][1])) };
  });
  const report = auditContracts(backend, sources);
  return {
    backendSha256: `sha256:${digest}`,
    ...report,
    strictFailure: options.strict && report.findings.length > 0,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === entryFile) {
  try {
    const result = runAudit(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.strictFailure) process.exitCode = 2;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
