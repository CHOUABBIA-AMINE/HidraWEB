import { expect, test, type Page } from '@playwright/test';

// Run against a separately started same-origin WEB/native API pair with mocks off.
// Default CI's intercepted regression server is deliberately not live acceptance.
const web = process.env.HIDRA_FOUNDATION_WEB_URL;
const api = process.env.HIDRA_FOUNDATION_API_URL;
const administrator = process.env.HIDRA_FOUNDATION_ADMIN;
const password = process.env.HIDRA_FOUNDATION_PASSWORD;
test.use({ trace: 'off', screenshot: 'off', video: 'off' });
test.skip(!web || !api || !administrator || !password, 'Requires configured synthetic native WEB/API and administrator credentials; not a mocked journey.');
async function login(page: Page) {
  await page.goto(`${web}/administration/users`);
  await page.getByLabel(/^(Nom d’utilisateur|Username|اسم المستخدم)$/).fill(administrator!);
  await page.getByLabel(/^(Mot de passe|Password|كلمة المرور)$/).fill(password!);
  await page.getByRole('button', { name: /^(Se connecter|Sign in|تسجيل الدخول)$/ }).click();
  await expect(page.getByRole('heading', { name: /Identité & accès|Identity & Access|الهوية والوصول/ })).toBeVisible();
}
test('native LOCAL user creation, credential initialization, activation and real login', async ({ page, request }) => {
  const contract = await request.get(`${api}/v3/api-docs`);
  expect(contract.ok()).toBeTruthy();
  const spec = await contract.json();
  expect(spec.components.schemas.IdentityLocalCredentialState.properties.securityVersion.format).toBe('int64');
  await login(page);
  const name = `w1-${Date.now()}`;
  const secret = `Synthetic-W1-${crypto.randomUUID()}`;
  await page.getByLabel(/^(Nom d’utilisateur|Username|اسم المستخدم)$/).fill(name);
  await page.getByLabel(/^(Adresse e-mail|Email address|البريد الإلكتروني)$/).first().fill(`${name}@synthetic.invalid`);
  await page.getByLabel(/^(Nom affiché|Display name|الاسم المعروض)$/).fill(name);
  await page.getByRole('button', { name: /^(Créer un utilisateur|Create user|إنشاء مستخدم)$/ }).click();
  await expect(page.getByText(/Utilisateur créé|User created|تم إنشاء المستخدم/).first()).toBeVisible();
  const panel = page.getByText(/^(Cycle de vie utilisateur|User lifecycle|دورة حياة المستخدم)$/).locator('..');
  await panel.getByLabel(/Rechercher|Search|بحث/).fill(name);
  await panel.getByRole('combobox', { name: /^(Utilisateur|User|المستخدم)$/ }).click();
  await page.getByRole('option', { name: new RegExp(name) }).click();
  await panel.getByLabel(/^(Motif|Reason|السبب)/).fill('Synthetic W1 initial credential');
  await panel.getByLabel(/Nouveau mot de passe local|New local password|كلمة مرور محلية جديدة/).fill(secret);
  await panel.getByRole('button', { name: /^(Définir le mot de passe|Set local credential|تعيين كلمة المرور)$/ }).click();
  await expect(panel.getByLabel(/Nouveau mot de passe local|New local password|كلمة مرور محلية جديدة/)).toHaveValue('');
  await expect(panel.getByText(/^(Enregistré\.|Saved\.|تم الحفظ\.)$/)).toBeVisible();
  await panel.getByRole('button', { name: /^(Activer|Activate|تفعيل)$/ }).click();
  await expect(panel.getByText(/ACTIVE/).first()).toBeVisible();
  const authenticated = await request.post(`${api}/api/v1/identity/authentication/login`, { data: { providerType: 'LOCAL', principal: name, credentials: secret } });
  expect(authenticated.ok()).toBeTruthy();
  const issued = await authenticated.json();
  expect(issued.accessToken).toBeTruthy();
  const principal = await request.get(`${api}/api/v1/identity/me`, { headers: { Authorization: `Bearer ${issued.accessToken}` } });
  expect(principal.ok()).toBeTruthy();
  expect((await principal.json()).username).toBe(name);
});

test('native Party registration, activation, persisted history and eligible chooser', async ({ page, request }) => {
  await login(page);
  await page.goto(`${web}/administration/parties`);
  const code = `W1-${Date.now()}`;
  await page.getByLabel(/^(Code|الرمز)/).fill(code);
  await page.getByLabel(/^(Raison sociale|Legal name|الاسم القانوني)/).fill(`Synthetic ${code}`);
  await page.getByRole('combobox', { name: /^(Type de partenaire|Party type|نوع الجهة)/ }).click();
  await page.getByRole('option').filter({ hasNotText: /Sélectionner|Select|اختر/ }).first().click();
  await page.getByLabel(/^(Code pays|Country code|رمز الدولة)/).fill('DZ');
  await page.getByRole('button', { name: /^(Enregistrer un partenaire|Register Party|تسجيل جهة)$/ }).click();
  await expect(page.getByText(new RegExp(`${code} · DRAFT`)).first()).toBeVisible();
  await page.getByLabel(/^(Motif|Reason|السبب)/).fill('Synthetic W1 Party admission');
  await page.getByRole('button', { name: /^(Activer|Activate|تفعيل)$/ }).click();
  await expect(page.getByText(new RegExp(`${code} · ACTIVE`)).first()).toBeVisible();
  const authenticated = await request.post(`${api}/api/v1/identity/authentication/login`, { data: { providerType: 'LOCAL', principal: administrator, credentials: password } });
  expect(authenticated.ok()).toBeTruthy();
  const token = (await authenticated.json()).accessToken;
  const selected = await request.get(`${api}/api/v1/party/parties`, { headers: { Authorization: `Bearer ${token}` }, params: { q: code, eligibleOnly: true } });
  expect(selected.ok()).toBeTruthy();
  const persisted = (await selected.json()).items.find((row: { code: string }) => row.code === code);
  expect(persisted.status).toBe('ACTIVE');
  const history = await request.get(`${api}/api/v1/party/parties/${persisted.id}/history`, { headers: { Authorization: `Bearer ${token}` } });
  expect(history.ok()).toBeTruthy();
  expect((await history.json()).some((event: { newStatus: string }) => event.newStatus === 'ACTIVE')).toBeTruthy();
});


test('native employee registration, activation and lifecycle history', async ({ page, request }) => {
  await login(page);
  await page.goto(`${web}/administration/organization`);
  const number = `W1-EMP-${Date.now()}`;
  await page.getByLabel(/^(Matricule|Employee number|رقم الموظف)$/).fill(number);
  await page.getByLabel(/^(Prénom latin|Latin first name|الاسم اللاتيني)$/).fill('Synthetic');
  await page.getByLabel(/^(Nom latin|Latin last name|اللقب اللاتيني)$/).fill(number);
  await page.getByRole('button', { name: /^(Enregistrer un employé|Register employee|تسجيل موظف)$/ }).click();
  await expect(page.getByText(/Employé enregistré|Employee registered|تم تسجيل الموظف/).first()).toBeVisible();
  const panel = page.getByText(/^(Cycle de vie employé|Employee lifecycle|دورة حياة الموظف)$/).locator('..');
  await panel.getByLabel(/Rechercher|Search|بحث/).fill(number);
  await panel.getByRole('combobox', { name: /^(Employé|Employee|الموظف)$/ }).click();
  await page.getByRole('option', { name: new RegExp(number) }).click();
  await panel.getByLabel(/^(Motif|Reason|السبب)/).fill('Synthetic W1 employment admission');
  await panel.getByRole('button', { name: /^(Activer|Activate|تفعيل)$/ }).click();
  await expect(panel.getByText(/ACTIVE/).first()).toBeVisible();
  const authenticated = await request.post(`${api}/api/v1/identity/authentication/login`, { data: { providerType: 'LOCAL', principal: administrator, credentials: password } });
  expect(authenticated.ok()).toBeTruthy();
  const token = (await authenticated.json()).accessToken;
  const response = await request.get(`${api}/api/v1/organization/employees`, { headers: { Authorization: `Bearer ${token}` }, params: { q: number } });
  expect(response.ok()).toBeTruthy();
  const employee = (await response.json()).content.find((row: { employeeNumber: string }) => row.employeeNumber === number);
  expect(employee.status).toBe('ACTIVE');
  const history = await request.get(`${api}/api/v1/organization/employees/${employee.id}/lifecycle-history`, { headers: { Authorization: `Bearer ${token}` } });
  expect(history.ok()).toBeTruthy();
  expect((await history.json()).some((row: { reason: string }) => row.reason === 'Synthetic W1 employment admission')).toBeTruthy();
});
