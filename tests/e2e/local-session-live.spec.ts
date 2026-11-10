import { execFileSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

import { createDeniedActor, nativeLogin } from './support/foundationBackend';

const native = process.env.HIDRA_LOCAL_SESSION_NATIVE === '1';
const api = process.env.HIDRA_FOUNDATION_API_URL;
const username = process.env.HIDRA_FOUNDATION_ADMIN;
const password = process.env.HIDRA_FOUNDATION_PASSWORD;
const ordinaryPassword = process.env.HIDRA_FOUNDATION_USER_PASSWORD;
const identity = '/api/v1/identity';
const loginPath = identity + '/authentication/login';
const refreshPath = identity + '/authentication/refresh';
const logoutPath = identity + '/authentication/logout';
const principalPath = identity + '/me';
const permissionsPath = principalPath + '/permissions';

if (native && (api !== 'http://127.0.0.1:8080' || !username || !password || !ordinaryPassword)) {
  throw new Error('F18 requires the isolated native API and synthetic credentials.');
}
test.skip(!native, 'F18 runs only in its isolated PostgreSQL qualification lane.');
test.use({ trace: 'off', screenshot: 'off', video: 'off' });

interface Credentials {
  accessToken: string;
  expiresAt: string;
}

function responseAt(page: Page, path: string, method = 'POST') {
  return page.waitForResponse(response => new URL(response.url()).pathname === path
    && response.request().method() === method);
}

async function signIn(page: Page, user = username!, secret = password!): Promise<Credentials> {
  await page.clock.install();
  await page.goto('/overview');
  const loggedIn = responseAt(page, loginPath);
  const permissions = responseAt(page, permissionsPath, 'GET');
  await page.getByLabel(/^Username/).fill(user);
  await page.getByLabel(/^Password/).fill(secret);
  await page.getByRole('button', { name: 'Sign in', exact: true }).press('Enter');
  const response = await loggedIn;
  expect(response.status()).toBe(200);
  expect((await permissions).status()).toBe(200);
  const data = await response.json();
  expect(data.authenticationType).toBe('LOCAL');
  expect(typeof data.refreshToken === 'string' && data.refreshToken.length === 80).toBe(true);
  await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
  return { accessToken: data.accessToken, expiresAt: data.expiresAt };
}

async function signOut(page: Page) {
  await page.getByRole('button', { name: 'Profile', exact: true }).press('Enter');
  await page.getByRole('menuitem', { name: 'Sign out', exact: true }).press('Enter');
  await expect(page).toHaveURL(/\/login$/);
}

// Native binding denial can surface as 401 or 403 under the accepted API contract.
async function nativeStatus(request: APIRequestContext, token: string) {
  try {
    return (await request.get(api + principalPath, { headers: { Authorization: 'Bearer ' + token } })).status();
  } catch {
    throw new Error('Native principal verification did not reach HidraAPI.');
  }
}

// Exercise the actual shared WEB client in Chromium. Only status codes leave the page.
function protectedRequest(page: Page, path = principalPath, method = 'GET') {
  return page.evaluate(async ({ path, method }) => {
    const modulePath = '/src/api/client/hidraAxios.ts';
    const { hidraAxios } = await import(/* @vite-ignore */ modulePath);
    try {
      return (await hidraAxios.request({ url: path, method })).status;
    } catch (error) {
      return (error as { status?: number }).status ?? 0;
    }
  }, { path, method });
}

function nearExpiry(page: Page, credentials: Credentials) {
  return page.clock.setSystemTime(Date.parse(credentials.expiresAt) - 1_000);
}

function seedRestrictedActorMetadata() {
  execFileSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-c', `
    DO $fixture$
    DECLARE inserted integer;
    BEGIN
      IF current_database() <> 'hidra_local_session_f18' THEN
        RAISE EXCEPTION 'F18 requires its exact disposable database';
      END IF;
      INSERT INTO public.hidra_identity_user_permission_grant
        (id,user_id,permission_id,effect,scope_type,grant_reason,emergency_access,valid_from,valid_to,status,created_at)
      SELECT 'f18-limited-metadata',u.id,p.id,'GRANT','GLOBAL','Synthetic F18 metadata only',
        false,now()-interval '1 minute',now()+interval '1 hour','ACTIVE',now()
      FROM public.hidra_identity_user u CROSS JOIN public.hidra_identity_permission p
      WHERE u.username='f18-restricted' AND p.code='security:permissions:read';
      GET DIAGNOSTICS inserted = ROW_COUNT;
      IF inserted <> 1 THEN RAISE EXCEPTION 'F18 restricted fixture was not applied'; END IF;
    END $fixture$;
  `], { stdio: ['ignore', 'ignore', 'inherit'] });
}

test('LOCAL protected reads share renewal and logout revokes the replacement bearer', async ({ page, request, context }) => {
  const initial = await signIn(page);
  const newTab = await context.newPage();
  await newTab.goto('/overview');
  await expect(newTab).toHaveURL(/\/login$/);
  await newTab.close();

  let rotations = 0;
  page.on('request', candidate => {
    if (new URL(candidate.url()).pathname === refreshPath) rotations++;
  });
  const refreshed = responseAt(page, refreshPath);
  await nearExpiry(page, initial);
  expect(await Promise.all([
    protectedRequest(page),
    protectedRequest(page, permissionsPath),
  ])).toEqual([200, 200]);
  const replacement = await refreshed;
  expect(replacement.status()).toBe(200);
  expect(rotations).toBe(1);
  expect(replacement.request().headers().authorization === undefined).toBe(true);
  const rotatedToken = (await replacement.json()).accessToken as string;
  expect(rotatedToken !== initial.accessToken).toBe(true);
  expect([401, 403]).toContain(await nativeStatus(request, initial.accessToken));
  expect(await nativeStatus(request, rotatedToken)).toBe(200);

  const loggedOut = responseAt(page, logoutPath);
  await signOut(page);
  expect((await loggedOut).status()).toBe(204);
  expect([401, 403]).toContain(await nativeStatus(request, rotatedToken));
});

test('an expired bearer can resume through one renewal, then throttling ends the local session', async ({ page, request }) => {
  const initial = await signIn(page);
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const expiry = Date.parse(initial.expiresAt);
  await sleep(Math.max(0, expiry - Date.now() + 1000));
  expect([401, 403]).toContain(await nativeStatus(request, initial.accessToken));
  await page.clock.setSystemTime(expiry + 1000);
  const refreshed = responseAt(page, refreshPath);
  expect(await protectedRequest(page)).toBe(200);
  const response = await refreshed;
  expect(response.status()).toBe(200);
  const { expiresAt } = await response.json();

  const throttled = responseAt(page, refreshPath);
  await nearExpiry(page, { expiresAt, accessToken: '' });
  expect(await protectedRequest(page)).toBe(0);
  expect((await throttled).status()).toBe(429);
  await page.clock.resume();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
});

test('an ambiguous refresh consumes the proof at the API without replay or access restoration', async ({ page }) => {
  const initial = await signIn(page);
  let rotations = 0;
  let committed = false;
  await page.route('**' + refreshPath, async route => {
    rotations++;
    try {
      committed = (await route.fetch({ maxRetries: 0 })).status() === 200;
    } catch {
      committed = false;
    }
    await route.abort();
  });
  await nearExpiry(page, initial);
  expect(await protectedRequest(page)).toBe(0);
  await expect(page).toHaveURL(/\/login$/);
  expect(committed).toBe(true);
  expect(rotations).toBe(1);
  await expect(page.getByRole('alert')).toContainText('could not be renewed');
});

test('sign-out wins against a committed refresh response delivered late', async ({ page, request }) => {
  const initial = await signIn(page);
  let deliver!: () => void;
  let committed!: (token?: string) => void;
  const hold = new Promise<void>(resolve => { deliver = resolve; });
  const rotation = new Promise<string | undefined>(resolve => { committed = resolve; });
  await page.route('**' + refreshPath, async route => {
    try {
      const response = await route.fetch({ maxRetries: 0 });
      committed(response.status() === 200 ? (await response.json()).accessToken : undefined);
      await hold;
      await route.fulfill({ response });
    } catch {
      committed(undefined);
      await route.abort().catch(() => undefined);
    }
  });
  await nearExpiry(page, initial);
  const waitingRead = protectedRequest(page);
  try {
    const replacement = await rotation;
    expect(Boolean(replacement)).toBe(true);
    const logout = responseAt(page, logoutPath);
    await signOut(page);
    expect((await logout).status()).toBe(204);
    expect([401, 403]).toContain(await nativeStatus(request, replacement!));
  } finally {
    deliver();
  }
  expect(await waitingRead).toBe(0);
  await expect(page).toHaveURL(/\/login$/);
});

test('a limited LOCAL user receives API denials without refresh or mutation replay', async ({ page, request }) => {
  const headers = await nativeLogin(request, username!, password!);
  const restricted = 'f18-restricted';
  await createDeniedActor(request, headers, restricted, ordinaryPassword!);
  seedRestrictedActorMetadata();

  await signIn(page, restricted, ordinaryPassword!);
  let refreshes = 0;
  let writes = 0;
  page.on('request', candidate => {
    const pathname = new URL(candidate.url()).pathname;
    if (pathname === refreshPath) refreshes++;
    if (pathname === identity + '/users' && candidate.method() === 'POST') writes++;
  });
  expect(await protectedRequest(page, identity + '/users')).toBe(403);
  expect(await protectedRequest(page, identity + '/users', 'POST')).toBe(403);
  expect(refreshes).toBe(0);
  expect(writes).toBe(1);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
});
