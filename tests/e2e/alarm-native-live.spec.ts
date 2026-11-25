import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

type Actor = {user: string; facility: string; title: string; alarmId: string};
type Fixture = {password: string; actors: Actor[]};
type Login = {userId: string; authenticationType: string; accessToken: string};
type Alarm = {id: string; acknowledgedAt?: string; acknowledgedByActorId?: string; currentState: string; sourceType: string; topologyAssetId: string};
type AlarmPage = {content: Alarm[]; totalElements: number; totalPages: number; hasNext: boolean};

const origin = 'http://127.0.0.1:5173';
const root = '/api/v1/alarm/alarms';
const identity = '/api/v1/identity';
const enc = encodeURIComponent;
const checkpoint = (name: string) => process.stdout.write('F16_CHECKPOINT=' + name + '\n');

function pg(sql: string): string {
  if (process.env.PGHOST !== '127.0.0.1' || process.env.PGDATABASE !== 'hidra_alarm_f16') {
    throw new Error('F16 requires the exact disposable PostgreSQL database.');
  }
  try {
    return execFileSync('psql', ['-XAtq', '-v', 'ON_ERROR_STOP=1', '-c', sql], {encoding: 'utf8', stdio: ['ignore','pipe','pipe']}).trim();
  } catch {
    throw new Error('F16 disposable history verification failed.');
  }
}
function quoted(id: string) {
  if (!/^[A-Za-z0-9-]+$/.test(id)) throw new Error('Invalid fixture identity.');
  return "'" + id + "'";
}
function history(alarmId: string) {
  const id = quoted(alarmId);
  return JSON.parse(pg("SELECT json_build_object('acks',(SELECT count(*) FROM hidra_alarm_acknowledgement WHERE alarm_id=" + id +
    "),'events',(SELECT count(*) FROM hidra_alarm_lifecycle_event WHERE alarm_id=" + id +
    "),'ackDigest',(SELECT md5(coalesce(string_agg(row_to_json(a)::text,'|' ORDER BY id),'')) FROM hidra_alarm_acknowledgement a WHERE alarm_id=" + id +
    "),'eventDigest',(SELECT md5(coalesce(string_agg(row_to_json(e)::text,'|' ORDER BY id),'')) FROM hidra_alarm_lifecycle_event e WHERE alarm_id=" + id + "))"
  )) as {acks:number; events:number; ackDigest:string; eventDigest:string};
}
function observe(page: Page, path: string, method = 'GET') {
  return page.waitForResponse(r => new URL(r.url()).pathname === path && r.request().method() === method, {timeout: 30_000});
}
async function signIn(page: Page, actor: Actor, password: string) {
  await page.goto(origin + '/overview');
  await page.getByLabel(/^Username(?:\s*\*)?$/).fill(actor.user);
  await page.getByLabel(/^Password(?:\s*\*)?$/).fill(password);
  const [login, principal, permissions, catalog, routes] = await Promise.all([
    observe(page, identity + '/authentication/login', 'POST'),
    observe(page, identity + '/me'),
    observe(page, identity + '/me/permissions'),
    observe(page, '/api/v1/security/permissions/catalog'),
    observe(page, '/api/v1/security/permissions/routes'),
    page.getByRole('button', {name: 'Sign in', exact: true}).click(),
  ]);
  for (const response of [login, principal, permissions, catalog, routes]) expect(response.status()).toBe(200);
  const body = await login.json() as Login;
  const me = await principal.json() as {userId: string};
  const grants = await permissions.json() as string[];
  expect(body.userId === actor.user && body.authenticationType === 'LOCAL' && !!body.accessToken && me.userId === actor.user).toBe(true);
  expect(grants.includes('alarm:alarms:read') && grants.includes('alarm:alarms:execute') && !grants.includes('*')).toBe(true);
  await expect(page).toHaveURL(origin + '/overview');
  return {token: body.accessToken, grants: [...grants].sort()};
}
async function get(page: Page, path: string, token: string, status = 200) {
  const response = await page.request.get(origin + path, {headers: {Authorization: 'Bearer ' + token}, failOnStatusCode: false});
  expect(response.status()).toBe(status);
  return response;
}
async function post(page: Page, path: string, token: string, data: object, status = 200) {
  const response = await page.request.post(origin + path, {headers: {Authorization: 'Bearer ' + token}, data, failOnStatusCode: false});
  expect(response.status()).toBe(status);
  return response;
}
async function openAlarm(page: Page, actor: Actor) {
  await page.getByRole('button', {name: 'Alarms', exact: true}).click();
  await expect(page.getByRole('heading', {name: 'Alarm Console'})).toBeVisible();
  const row = page.getByRole('row').filter({has: page.getByRole('cell', {name: actor.title, exact: true})});
  await expect(row).toBeVisible();
  await expect(page.getByText('1 alarm(s) loaded of 1', {exact: true})).toBeVisible();
  await row.getByRole('button', {name: 'Open', exact: true}).click();
  await expect(page.getByRole('heading', {name: actor.title, exact: true, level: 2})).toBeVisible();
}

test('F16 native signed company and FACILITY alarm acknowledgement and durable denial', async ({browser}) => {
  const privateDir = process.env.HIDRA_F16_PRIVATE_DIR;
  if (!privateDir) throw new Error('F16 fixture is mandatory.');
  const fixture = JSON.parse(readFileSync(join(privateDir, 'fixture.json'), 'utf8')) as Fixture;
  const [primary, sibling, foreign] = fixture.actors;
  expect(fixture.actors.length).toBe(3);
  expect(pg('SELECT current_database()')).toBe('hidra_alarm_f16');
  const contexts = await Promise.all(fixture.actors.map(() => browser.newContext()));
  try {
    const sessions = [];
    for (const [index, actor] of fixture.actors.entries()) {
      const page = await contexts[index].newPage();
      const signed = await signIn(page, actor, fixture.password);
      sessions.push({page, ...signed});
      const listing = await (await get(page, root + '?view=all&page=0&size=2', signed.token)).json() as AlarmPage;
      expect(listing.totalElements === 1 && listing.totalPages === 1 && !listing.hasNext &&
        listing.content.length === 1 && listing.content[0].id === actor.alarmId).toBe(true);
      const own = await (await get(page, root + '/' + enc(actor.alarmId), signed.token)).json() as Alarm;
      expect(own.id === actor.alarmId && own.topologyAssetId === actor.facility).toBe(true);
      await openAlarm(page, actor);
      for (const other of fixture.actors.filter(value => value.user !== actor.user)) {
        await expect(page.getByText(other.title, {exact: true})).toHaveCount(0);
      }
    }
    const [allowed, deniedSibling, deniedForeign] = sessions;
    expect(JSON.stringify(allowed.grants) === JSON.stringify(deniedSibling.grants)
      && JSON.stringify(allowed.grants) === JSON.stringify(deniedForeign.grants)).toBe(true);
    checkpoint('SIGNED_SCOPED_LISTS');
    const before = history(primary.alarmId);
    for (const denied of [deniedSibling, deniedForeign]) {
      await get(denied.page, root + '/' + enc(primary.alarmId), denied.token, 404);
      await get(denied.page, root + '/' + enc(primary.alarmId) + '/shelvings', denied.token, 404);
      const empty = await (await get(denied.page, root + '?view=all&topologyAssetId=' + enc(primary.facility), denied.token)).json() as AlarmPage;
      expect(empty.totalElements === 0 && empty.totalPages === 0 && empty.content.length === 0 && !empty.hasNext).toBe(true);
      await post(denied.page, root + '/acknowledgements', denied.token, {alarmId: primary.alarmId}, 404);
    }
    const anonymous = await browser.newContext();
    try {
      expect((await anonymous.request.get(origin + root, {failOnStatusCode:false})).status()).toBe(401);
    } finally { await anonymous.close(); }
    expect(history(primary.alarmId)).toEqual(before);
    checkpoint('DENIED_NO_HISTORY');

    const ackResponse = observe(allowed.page, root + '/acknowledgements', 'POST');
    await allowed.page.getByRole('button', {name: 'Acknowledge', exact: true}).click();
    const ack = await ackResponse;
    expect(ack.status()).toBe(200);
    const body = ack.request().postDataJSON() as Record<string, unknown>;
    expect(body.alarmId === primary.alarmId && !('actorId' in body) && !('acknowledgedByActorId' in body) && !('acknowledgedAt' in body)).toBe(true);
    await expect(allowed.page.getByText('Operation recorded by HidraAPI.', {exact: true})).toBeVisible();
    const committed = await (await get(allowed.page, root + '/' + enc(primary.alarmId), allowed.token)).json() as Alarm;
    expect(committed.acknowledgedByActorId === primary.user && !!committed.acknowledgedAt &&
      committed.currentState === 'ACKNOWLEDGED' && committed.sourceType === 'MANUAL').toBe(true);
    await expect(allowed.page.getByText('Acknowledged by: ' + primary.user, {exact: true})).toBeVisible();
    await expect(allowed.page.getByText('Acknowledged: ' + committed.acknowledgedAt, {exact: true})).toBeVisible();
    const one = history(primary.alarmId);
    expect(one.acks).toBe(before.acks + 1);
    expect(one.events).toBe(before.events + 1);
    expect(pg('SELECT count(*) FROM hidra_alarm_acknowledgement WHERE alarm_id=' + quoted(primary.alarmId) +
      ' AND acknowledged_by_actor_id=' + quoted(primary.user))).toBe('1');
    checkpoint('BROWSER_ACK_PERSISTED');

    // Credentials are memory-only. Full reload must require genuine sign-in again.
    await allowed.page.reload();
    const renewed = await signIn(allowed.page, primary, fixture.password);
    await openAlarm(allowed.page, primary);
    await expect(allowed.page.getByText('Acknowledged by: ' + primary.user, {exact: true})).toBeVisible();
    await expect(allowed.page.getByText('Acknowledged: ' + committed.acknowledgedAt, {exact: true})).toBeVisible();
    expect(history(primary.alarmId)).toEqual(one);
    checkpoint('FRESH_LOGIN_READBACK');

    // Repeated distinct valid acknowledgements remain legitimate, not once-only.
    await post(allowed.page, root + '/acknowledgements', renewed.token, {alarmId: primary.alarmId, comment: 'Second independent synthetic acknowledgement'});
    const two = history(primary.alarmId);
    expect(two.acks).toBe(one.acks + 1);
    expect(two.events).toBe(one.events + 1);

    // Same token after grant revocation must be denied; stale browser data is cleared.
    pg("UPDATE hidra_identity_user_permission_grant SET status='REVOKED',revoked_at=now() WHERE user_id=" +
      quoted(primary.user) + " AND scope_type='FACILITY' AND scope_reference_id=" + quoted(primary.facility));
    await get(allowed.page, root + '/' + enc(primary.alarmId), renewed.token, 404);
    await post(allowed.page, root + '/acknowledgements', renewed.token, {alarmId: primary.alarmId}, 404);
    const revoked = await (await get(allowed.page, root + '?view=all', renewed.token)).json() as AlarmPage;
    expect(revoked.totalElements === 0 && revoked.content.length === 0).toBe(true);
    await allowed.page.getByRole('button', {name: 'Refresh', exact: true}).click();
    await expect(allowed.page.getByText('Alarm unavailable. Refresh the list and select an authorized alarm.', {exact: true})).toBeVisible();
    await expect(allowed.page.getByText('Acknowledged by: ' + primary.user, {exact: true})).toHaveCount(0);
    await expect(allowed.page.getByRole('button', {name: 'Acknowledge', exact: true})).toHaveCount(0);
    await expect(allowed.page.getByText(primary.title, {exact: true})).toHaveCount(0);
    expect(history(primary.alarmId)).toEqual(two);
    checkpoint('REVOCATION_CLEAR');

    pg("UPDATE hidra_topology_facility SET owner_party_id='f16-company-b',updated_at=now() WHERE id=" + quoted(primary.facility));
    await get(deniedForeign.page, root + '/' + enc(primary.alarmId), deniedForeign.token, 404);
    await post(deniedForeign.page, root, deniedForeign.token, {alarmNumber:'F16-UNSUPPORTED', alarmTypeId:'f16-alarm-type',
      severityId:'f16-severity',titleFr:'Unsupported synthetic network',topologyAssetTypeCode:'PIPELINE_SYSTEM',
      topologyAssetId:'GZ2',topologyAssetCode:'GZ2'}, 404);
    expect(history(primary.alarmId)).toEqual(two);
    expect(pg('SELECT count(*) FROM hidra_alarm')).toBe('3');
    checkpoint('CURRENT_OWNER_FAIL_CLOSED');
  } finally {
    await Promise.all(contexts.map(context => context.close()));
  }
});
