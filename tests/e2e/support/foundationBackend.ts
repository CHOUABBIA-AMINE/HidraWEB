import { execFileSync } from 'node:child_process';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const organization = '/api/v1/organization';
export const party = '/api/v1/party';
export const topology = '/api/v1/topology/foundation';
const identity = '/api/v1/identity';

export async function nativeLogin(request: APIRequestContext, username: string, password: string) {
  const response = await request.post(process.env.HIDRA_FOUNDATION_API_URL + identity + '/authentication/login', {
    data: { providerType: 'LOCAL', principal: username, credentials: password },
  });
  expect(response.status(), 'Native LOCAL authentication').toBe(200);
  const result = await response.json();
  expect(result.authenticationType).toBe('LOCAL');
  expect(result.accessToken).toBeTruthy();
  return { Authorization: `Bearer ${result.accessToken}` };
}

export async function signIn(page: Page, username: string, password: string) {
  await page.getByLabel(/^Nom d’utilisateur(?:\s*\*)?$/).fill(username);
  await page.getByLabel(/^Mot de passe(?:\s*\*)?$/).fill(password);
  const response = browserMutation(page, identity + '/authentication/login');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await response;
}

export async function browserMutation(page: Page, path: string) {
  const response = await page.waitForResponse(candidate =>
    new URL(candidate.url()).pathname === path && candidate.request().method() === 'POST');
  expect(response.status(), `Browser POST ${path}`).toBe(200);
  return response;
}

export async function createDeniedActor(
  request: APIRequestContext, headers: Record<string, string>, username: string, password: string,
) {
  const url = process.env.HIDRA_FOUNDATION_API_URL + identity;
  const created = await request.post(url + '/users', { headers, data: {
    userType: 'HUMAN', username, emailAddress: `${username}@synthetic.invalid`, displayName: username,
  } });
  expect(created.status()).toBe(200);
  const user = url + '/users/' + (await created.json()).id;
  const credential = await request.get(user + '/local-credential/state', { headers });
  expect(credential.status()).toBe(200);
  const initialized = await request.put(user + '/local-credential', { headers, data: {
    expectedSecurityVersion: (await credential.json()).securityVersion,
    password, reason: 'Synthetic A1 denied actor',
  } });
  expect(initialized.status()).toBe(200);
  const lifecycle = await request.get(user + '/lifecycle', { headers });
  expect(lifecycle.status()).toBe(200);
  const activated = await request.post(user + '/activate', { headers, data: {
    expectedUpdatedAt: (await lifecycle.json()).updatedAt, reason: 'Synthetic A1 denied actor',
  } });
  expect(activated.status()).toBe(200);
  return nativeLogin(request, username, password);
}

function sql(input: string, user = process.env.PGUSER) {
  if (process.env.PGDATABASE !== 'hidra_foundation_w1' || process.env.HIDRA_FOUNDATION_REQUIRE_NATIVE !== '1') {
    throw new Error('A1 requires its disposable native PostgreSQL database');
  }
  execFileSync('psql', ['-X', '-q', '-v', 'ON_ERROR_STOP=1'], {
    input, env: { ...process.env, PGUSER: user }, stdio: ['pipe', 'ignore', 'inherit'],
  });
}

function literal(value: string) {
  return "'" + value.replaceAll("'", "''") + "'";
}

export async function withAppointmentReferences(
  refs: { company: string; unit: string; employee: string; actor: string },
  appointment: () => Promise<void>,
) {
  const { company, unit, employee, actor } = refs;
  const types = ['PRIMARY', 'SECONDARY', 'TEMPORARY', 'ACTING'];
  const overlaps = Object.fromEntries(types.map(type =>
    [type, Object.fromEntries(types.map(other => [other, false]))]));
  const policy = JSON.stringify({ maxConcurrentPrimary: 1, positionCapacity: 'SINGLE_HOLDER', overlaps });
  sql(`BEGIN;
    SELECT public.hidra_org_activate_appointment_binding(${literal(unit)},${literal(unit)},${literal(company)},0);
    SELECT public.hidra_org_activate_appointment_policy(${literal(crypto.randomUUID())},${literal(company)},0,${literal(policy)}::jsonb);
    COMMIT;`, 'a1_appointment_config');

  const resources = [
    ['company', 'ORGANIZATION_COMPANY', 'CUSTOM', company],
    ['unit', 'ORGANIZATION_UNIT', 'ORGANIZATION_UNIT', unit],
    ['employee', 'ORGANIZATION_EMPLOYEE', 'CUSTOM', employee],
  ];
  sql('BEGIN;\n' + ['create', 'read-current'].flatMap(action => resources.map(([kind, resource, scope, id]) => {
    const code = `organization:appointment-${kind}:${action}`;
    return `
      INSERT INTO public.hidra_identity_permission
        (id,code,permission_domain,resource_type,action,sensitive,status,created_at,updated_at)
      VALUES (${literal(crypto.randomUUID())},'${code}','organization','${resource}','${action}',false,'ACTIVE',now(),now())
      ON CONFLICT(code) DO NOTHING;
      INSERT INTO public.hidra_identity_user_permission_grant
        (id,user_id,permission_id,effect,scope_type,scope_reference_id,grant_reason,emergency_access,valid_from,valid_to,status,created_at)
      SELECT ${literal(crypto.randomUUID())},u.id,p.id,'GRANT','${scope}',${literal(id)},'Synthetic A1 appointment',
        false,now()-interval '1 minute',now()+interval '1 hour','ACTIVE',now()
      FROM public.hidra_identity_user u CROSS JOIN public.hidra_identity_permission p
      WHERE u.username=${literal(actor)} AND p.code='${code}';`;
  })).join('\n') + '\nCOMMIT;');

  // The appointment needs the Party row lock. The installed-unit writer uses
  // the same connection role but requires read-only Party privileges.
  sql('GRANT UPDATE ON public.hidra_party_party TO w2_installed;');
  try {
    await appointment();
  } finally {
    sql('REVOKE UPDATE ON public.hidra_party_party FROM w2_installed;');
  }
}
