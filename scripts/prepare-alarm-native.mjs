import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import console from 'node:console';

const apiSha = 'b451302179eb3a5877aefcb105dab0f3ccb47897';
const root = '/api/v1/alarm/alarms';
const endpoint = process.env.HIDRA_UXR26_API_URL;
const privateDir = process.env.HIDRA_F16_PRIVATE_DIR;
const pin = 'openapi/candidates/hidra-alarm-' + apiSha + '.json';

function pg(args) {
  return execFileSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}
async function request(path, method, body, bearer) {
  const response = await globalThis.fetch(endpoint + path, {
    method, headers: { Accept: 'application/json', ...(body ? {'Content-Type': 'application/json'} : {}),
      ...(bearer ? {Authorization: 'Bearer ' + bearer} : {}) },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'error',
  });
  if (response.status !== 200) throw new Error('F16 setup HTTP ' + method + ' failed: ' + response.status);
  return response.json();
}

let stage = 'environment';
async function main() {
  assert.match(endpoint ?? '', /^http:\/\/127\.0\.0\.1:\d+$/);
  assert.ok(privateDir && process.env.PGHOST === '127.0.0.1' && process.env.PGDATABASE === 'hidra_alarm_f16');
  assert.equal(pg(['-Atqc', 'SELECT current_database()']), 'hidra_alarm_f16');
  stage = 'runtime-contract';
  const bytes = readFileSync(pin);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'cf152e52ad51591a385327439f27f79fc741ab9b9c3dd6a025b301ca320432ab');
  const candidate = JSON.parse(bytes);
  // The fresh native application must expose the very same owner slice.
  const runtime = await request('/v3/api-docs', 'GET');
  assert.deepEqual(Object.fromEntries(Object.entries(runtime.paths).filter(([key]) => key.startsWith('/api/v1/alarm/'))), candidate.paths);
  for (const [name, schema] of Object.entries(candidate.components.schemas)) assert.deepEqual(runtime.components.schemas[name], schema);
  assert.deepEqual(runtime.components.securitySchemes.hidraBearerJwt, candidate.components.securitySchemes.hidraBearerJwt);

  stage = 'disposable-fixture';
  const password = randomBytes(24).toString('hex');
  const hash = execFileSync('htpasswd', ['-n', '-i', '-B', '-C', '10', 'f16'], {
    input: password + '\n', encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
  }).trim().slice('f16:'.length);
  assert.match(hash, /^\$2[aby]\$10\$/);
  pg(['-v', 'password_hash=' + hash, '-f', 'scripts/alarm-native-fixture.sql']);

  stage = 'signed-fixture-creation';
  const actors = [];
  for (const suffix of ['a', 'b', 'c']) {
    const user = 'f16-operator-' + suffix;
    const facility = 'f16-facility-' + suffix;
    const title = 'Synthetic F16 alarm ' + suffix.toUpperCase();
    const login = await request('/api/v1/identity/authentication/login', 'POST',
      {providerType: 'LOCAL', principal: user, credentials: password});
    assert.ok(login.userId === user && login.authenticationType === 'LOCAL' && login.accessToken);
    const alarm = await request(root, 'POST', {
      alarmNumber: 'F16-' + suffix.toUpperCase(), alarmTypeId: 'f16-alarm-type', severityId: 'f16-severity',
      titleFr: title, titleEn: title, sourceType: 'MANUAL', topologyAssetTypeCode: 'FACILITY',
      topologyAssetId: facility, topologyAssetCode: 'F16-' + suffix.toUpperCase(),
    }, login.accessToken);
    assert.ok(typeof alarm.id === 'string' && /^[A-Za-z0-9-]+$/.test(alarm.id));
    actors.push({user, facility, title, alarmId: alarm.id});
  }
  // Private test inputs only; no bearer tokens and no artifact upload of this directory.
  writeFileSync(join(privateDir, 'fixture.json'), JSON.stringify({password, actors}), {mode: 0o600, flag: 'wx'});
  console.log('F16 fixture and fresh runtime Alarm contract verified.');
}
main().catch(() => {
  // Never emit response payload, credentials, SQL arguments or raw error stack.
  console.error('F16 private fixture preparation failed at ' + stage + '.');
  process.exitCode = 1;
});
