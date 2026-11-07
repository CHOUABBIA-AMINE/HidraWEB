import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  browserMutation, createDeniedActor, nativeLogin, organization, party, signIn, topology,
  withAppointmentReferences,
} from './support/foundationBackend';

const web = process.env.HIDRA_FOUNDATION_WEB_URL;
const api = process.env.HIDRA_FOUNDATION_API_URL;
const admin = process.env.HIDRA_FOUNDATION_ADMIN;
const password = process.env.HIDRA_FOUNDATION_PASSWORD;
const deniedPassword = process.env.HIDRA_FOUNDATION_USER_PASSWORD;
if (process.env.HIDRA_FOUNDATION_REQUIRE_NATIVE === '1' && (!web || !api || !admin || !password || !deniedPassword)) {
  throw new Error('Mandatory A1 native configuration is missing');
}
test.skip(!web || !api || !admin || !password || !deniedPassword, 'Requires native WEB, API and disposable PostgreSQL');

async function choose(page: Page, scope: Locator | Page, label: string, option: RegExp) {
  await scope.getByRole('combobox', { name: new RegExp('^' + label + '(?:\\s*\\*)?$') }).click();
  await page.getByRole('option', { name: option }).click();
}

function dateTimeInput(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString().slice(0, 16);
}

test('A1 native Organization and Party persist and the same eligible Party reaches Topology', async ({ page, request }) => {
  const prefix = `A1-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const parentCode = prefix + '-PARENT';
  const childCode = prefix + '-CHILD';
  const employeeNumber = prefix + '-EMP';
  const partyCode = prefix + '-PARTY';
  const activationReason = 'Synthetic A1 employee activation';
  const headers = await nativeLogin(request, admin!, password!);
  const denied = await createDeniedActor(request, headers, prefix.toLowerCase() + '-denied', deniedPassword!);

  async function read(path: string) {
    const response = await request.get(api! + path, { headers });
    expect(response.status(), `Authorized GET ${path}`).toBe(200);
    return response.json();
  }

  async function assertDenied(path: string, values: string[]) {
    const response = await request.get(api! + path, { headers: denied });
    expect(response.status(), `Unauthorized GET ${path}`).toBe(403);
    const problem = await response.json();
    expect(problem.status).toBe(403);
    const requestedPath = new URL(api! + path).pathname;
    // Problem Details may echo the submitted path, including its known ID.
    for (const key of ['instance', 'path']) {
      if (problem[key] === requestedPath) delete problem[key];
    }
    const body = JSON.stringify(problem);
    for (const value of [...values, '"totalElements"', '"totalCount"', '"items"', '"content"']) {
      expect(body).not.toContain(value);
    }
  }

  await page.goto(web! + '/administration/organization');
  await signIn(page, admin!, password!);
  await expect(page.getByRole('heading', { name: 'Organisation', level: 1, exact: true })).toBeVisible();
  const unitForm = page.getByRole('heading', { name: 'Créer une unité', exact: true }).locator('..');
  async function createUnit(code: string, parent?: string) {
    await unitForm.getByLabel('Code', { exact: true }).fill(code);
    await unitForm.getByLabel('Nom français', { exact: true }).fill(code);
    await choose(page, unitForm, 'Type d’unité', /Station synthétique W1/);
    if (parent) await choose(page, unitForm, 'Unité parente', new RegExp('^' + parent + '$'));
    await unitForm.getByLabel(/^Valide à partir de/).fill(dateTimeInput(60));
    const created = browserMutation(page, organization + '/units');
    await unitForm.getByRole('button', { name: 'Créer une unité', exact: true }).click();
    const data = await (await created).json();
    expect(data.code).toBe(code);
    expect(data.unitTypeId).toBe('w1-synthetic-unit-type');
    return data.id as string;
  }

  const parentId = await createUnit(parentCode);
  const childId = await createUnit(childCode, parentCode);
  const registration = page.getByRole('heading', { name: 'Enregistrer un employé', exact: true }).locator('..');
  await registration.getByLabel('Matricule', { exact: true }).fill(employeeNumber);
  await registration.getByLabel('Prénom latin', { exact: true }).fill('Synthetic');
  await registration.getByLabel('Nom latin', { exact: true }).fill(employeeNumber);
  const registered = browserMutation(page, organization + '/employees');
  await registration.getByRole('button', { name: 'Enregistrer un employé', exact: true }).click();
  const employeeId = (await (await registered).json()).id as string;
  const lifecycle = page.getByText('Cycle de vie employé', { exact: true }).locator('..');
  await lifecycle.getByLabel(/Rechercher/).fill(employeeNumber);
  await choose(page, lifecycle, 'Employé', new RegExp(employeeNumber));
  await lifecycle.getByLabel(/^Motif/).fill(activationReason);
  const activated = browserMutation(page, organization + '/employees/' + employeeId + '/activate');
  await lifecycle.getByRole('button', { name: 'Activer', exact: true }).click();
  await activated;

  await page.reload();
  await signIn(page, admin!, password!);
  await expect(page.getByRole('heading', { name: 'Organisation', level: 1, exact: true })).toBeVisible();
  const children = await read(organization + '/units/' + parentId + '/children');
  expect(children).toContainEqual(expect.objectContaining({ id: childId, parentUnitId: parentId, code: childCode }));
  const directory = organization + '/employees?q=' + employeeNumber;
  expect((await read(directory)).content).toContainEqual(expect.objectContaining({ id: employeeId, status: 'ACTIVE' }));
  const employeeHistory = organization + '/employees/' + employeeId + '/lifecycle-history';
  expect(await read(employeeHistory)).toContainEqual(expect.objectContaining({ reason: activationReason }));

  await page.getByRole('button', { name: 'Partenaires', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Administration des partenaires', level: 1 })).toBeVisible();
  await page.getByLabel(/^Code(?:\s*\*)?$/).fill(partyCode);
  await page.getByLabel(/^Raison sociale/).fill('Synthetic ' + partyCode);
  await choose(page, page, 'Type de partenaire', /Entité synthétique W1/);
  await page.getByLabel(/^Code pays/).fill('DZ');
  const registeredParty = browserMutation(page, party + '/parties');
  await page.getByRole('button', { name: 'Enregistrer un partenaire', exact: true }).click();
  const partyId = (await (await registeredParty).json()).id as string;
  await expect(page.getByText(new RegExp(partyCode + ' · DRAFT')).first()).toBeVisible();
  await page.getByLabel(/^Motif/).fill('Synthetic A1 company activation');
  const partyActivated = browserMutation(page, party + '/parties/' + partyId + '/activate');
  await page.getByRole('button', { name: 'Activer', exact: true }).click();
  await partyActivated;
  await expect(page.getByText(new RegExp(partyCode + ' · ACTIVE')).first()).toBeVisible();
  await page.getByRole('combobox', { name: 'Rôle du partenaire', exact: true }).last().click();
  await page.getByRole('option', { name: /W1_SYNTHETIC_OWNER/ }).click();
  const assignedRole = browserMutation(page, party + '/roles/assignments');
  await page.getByRole('button', { name: 'Attribuer un rôle', exact: true }).click();
  expect((await assignedRole).request().postDataJSON()).toMatchObject({
    partyId, roleId: 'w1-synthetic-party-role',
  });
  const detail = party + '/parties/' + partyId;
  expect(await read(detail)).toMatchObject({ id: partyId, code: partyCode, status: 'ACTIVE' });
  const partyHistory = detail + '/history';
  const events: Array<{ newStatus?: string; details?: string }> = await read(partyHistory);
  expect(events).toContainEqual(expect.objectContaining({ newStatus: 'ACTIVE' }));
  const roleRecorded = events.some(event => {
    try { return JSON.parse(event.details || '{}').reason === 'Assigned role w1-synthetic-party-role'; }
    catch { return false; }
  });
  expect(roleRecorded).toBeTruthy();
  expect((await read(party + '/parties?eligibleOnly=true&q=' + partyCode)).items).toContainEqual(
    expect.objectContaining({ id: partyId, code: partyCode }),
  );

  await withAppointmentReferences({ company: partyId, unit: childId, employee: employeeId, actor: admin! }, async () => {
    await page.goto(web! + '/administration/organization');
    await signIn(page, admin!, password!);
    const form = page.getByRole('heading', { name: 'Affecter un employé', exact: true }).locator('..');
    await choose(page, form, 'Employé', new RegExp(employeeNumber));
    await choose(page, form, 'Unité organisationnelle', new RegExp('^' + childCode + '$'));
    await choose(page, form, 'Poste', /W1_SYNTHETIC_ENGINEER|Synthetic W1 engineer/);
    await form.getByLabel(/^Valide à partir de/).fill(dateTimeInput(5));
    const appointment = browserMutation(page, organization + '/employees/assignments');
    await form.getByRole('button', { name: 'Affecter un employé', exact: true }).click();
    const saved = await appointment;
    const appointmentId = (await saved.text()).replace(/^"|"$/g, '');
    expect(appointmentId).toBeTruthy();
    const current = organization + '/employees/' + employeeId + '/assignments';
    const rows = await read(current);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: appointmentId, employeeId, organizationUnitId: childId,
      positionId: 'w1-synthetic-position', assignmentType: 'PRIMARY', status: 'ACTIVE',
    });
    expect(new Date(rows[0].validFrom).toISOString()).toBe(saved.request().postDataJSON().validFrom);
    await assertDenied(current, [appointmentId, employeeId, childId]);
  });

  await assertDenied(directory, [employeeId, employeeNumber]);
  await assertDenied(employeeHistory, [employeeId, activationReason]);
  await assertDenied(detail, [partyId, partyCode]);
  await assertDenied(partyHistory, [partyId, partyCode, 'Assigned role ']);

  await page.goto(web! + '/network?mode=author');
  await signIn(page, admin!, password!);
  await expect(page.getByRole('heading', { name: 'Network authoring', exact: true })).toBeVisible();
  await choose(page, page, 'Référence de partenaire éligible', new RegExp(partyCode));
  await page.getByLabel('Code and name', { exact: true }).fill(prefix);
  await page.getByLabel('Reason and evidence reference', { exact: true }).fill('synthetic:A1 Party handoff');
  await page.getByRole('button', { name: 'System types', exact: true }).click();
  await choose(page, page, 'System type', /W2_GAS/);
  const system = browserMutation(page, topology + '/pipeline-systems');
  await page.getByRole('button', { name: 'Create system', exact: true }).click();
  const created = await system;
  expect(created.request().postDataJSON().companyPartyId).toBe(partyId);
  const systemId = (await created.json()).items[0].id;
  expect((await read(topology + '/choices/SYSTEMS?companyPartyId=' + partyId)).items).toContainEqual(
    expect.objectContaining({ id: systemId, code: prefix }),
  );
});
