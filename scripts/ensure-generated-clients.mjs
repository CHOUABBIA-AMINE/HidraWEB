import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FEATURE_CONFIG = /^orval\.([a-z][a-z0-9-]*)\.config\.ts$/;

/**
 * Generated clients are intentionally not committed. npm run build must work
 * from a clean checkout, while CI must not regenerate all 20 clients twice.
 */
export function inspectGeneratedClients(root) {
  const configs = readdirSync(root).filter((file) => FEATURE_CONFIG.test(file)).sort();
  if (configs.length === 0) throw new Error('No pinned feature Orval configurations found.');

  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const pending = [];
  for (const config of configs) {
    const name = config.match(FEATURE_CONFIG)[1];
    if (!packageJson.scripts?.[`api:generate:${name}`]) {
      throw new Error(`Missing api:generate:${name} npm script.`);
    }

    const configSource = readFileSync(join(root, config), 'utf8');
    const contract = configSource.match(/target:\s*['"](\.\/openapi\/[^'"]+\.(?:json|ya?ml))['"]/);
    const output = configSource.match(/target:\s*['"](\.\/src\/api\/generated\/[^'"]+\.ts)['"]/);
    const models = configSource.match(/schemas:\s*['"](\.\/src\/api\/generated\/[^'"]+)['"]/);
    if (!contract || !output || !models) {
      throw new Error(`Cannot identify pinned input and generated output paths in ${config}.`);
    }

    const sourcePath = join(root, contract[1]);
    const outputPath = join(root, output[1]);
    const modelIndex = join(root, models[1], 'index.ts');
    if (!existsSync(sourcePath)) throw new Error(`Missing pinned contract: ${contract[1]}`);

    const missing = !existsSync(outputPath) || !existsSync(modelIndex);
    const stale = !missing &&
      Math.min(statSync(outputPath).mtimeMs, statSync(modelIndex).mtimeMs) <
      Math.max(statSync(sourcePath).mtimeMs, statSync(join(root, config)).mtimeMs);
    if (missing || stale) pending.push(name);
  }
  return pending;
}

function runNodeScript(script, args = []) {
  const execution = spawnSync(process.execPath, [script, ...args], {
    cwd: ROOT, env: process.env, stdio: 'inherit',
  });
  if (execution.error) throw execution.error;
  if (execution.status !== 0) {
    throw new Error(`${script} failed (exit ${execution.status ?? 'unknown'}).`);
  }
}

export function ensureGeneratedClients() {
  const pending = inspectGeneratedClients(ROOT);
  if (!pending.length) {
    console.log('[build:preflight] Pinned generated API clients are ready; skipping Orval.');
    return;
  }

  console.log(`[build:preflight] Generating ${pending.length} missing/outdated pinned API clients.`);
  runNodeScript(join(ROOT, 'scripts/check-openapi-compatibility.mjs'));
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error('Run the build with npm so npm_execpath is available.');
  for (const name of pending) {
    console.log(`[build:preflight] npm run api:generate:${name}`);
    runNodeScript(npmCli, ['run', `api:generate:${name}`]);
  }

  const remaining = inspectGeneratedClients(ROOT);
  if (remaining.length) {
    throw new Error(`Orval did not generate the expected contract outputs: ${remaining.join(', ')}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    ensureGeneratedClients();
  } catch (error) {
    console.error('[build:preflight]', error);
    process.exitCode = 1;
  }
}
