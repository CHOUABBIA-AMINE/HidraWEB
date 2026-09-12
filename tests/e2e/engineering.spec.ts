import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/workbench/{module}/{resource}/{id}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/integrity/assessments', methods: ['POST'], module: 'integrity', resource: 'assessments', action: 'create', permission: 'integrity:assessments:create', enforcementStatus: 'backend-enforced' },
];

const effectivePermissions = ['workbench:resources:read', 'integrity:assessments:create'];

async function mockEngineering(page: Page) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({
    json: {
      strategy: 'derived-route-permission-catalog',
      enforcement: 'backend-enforced',
      permissionFormat: '<module>:<resource>:<action>',
      routes,
    },
  }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: effectivePermissions }));

  await page.route('**/api/v1/workbench/integrity/resources', (route) => route.fulfill({
    json: [{
      module: 'integrity',
      resource: 'integrity-assessment',
      entityName: 'IntegrityAssessment',
      javaType: 'IntegrityAssessmentJpaEntity',
      tableName: 'hidra_integrity_assessment',
      idField: 'id',
      searchableFields: ['assessmentNumber', 'title'],
      listEndpoint: '/api/v1/workbench/integrity/integrity-assessment',
      detailEndpoint: '/api/v1/workbench/integrity/integrity-assessment/{id}',
      searchEndpoint: '/api/v1/workbench/integrity/integrity-assessment/search',
    }],
  }));

  await page.route('**/api/v1/workbench/integrity/integrity-assessment?**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('page')).toBe('0');
    expect(url.searchParams.get('size')).toBe('25');
    await route.fulfill({
      json: {
        module: 'integrity',
        resource: 'integrity-assessment',
        page: 0,
        size: 25,
        totalElements: 1,
        totalPages: 1,
        items: [{
          module: 'integrity',
          resource: 'integrity-assessment',
          id: 'assessment-1',
          attributes: {
            assessmentNumber: 'IA-2026-001',
            title: 'North line integrity assessment',
            assessmentTypeId: 'ILI_REVIEW',
            status: 'DRAFT',
          },
        }],
      },
    });
  });

  await page.route('**/api/v1/workbench/integrity/integrity-assessment/assessment-1', (route) => route.fulfill({
    json: {
      module: 'integrity',
      resource: 'integrity-assessment',
      id: 'assessment-1',
      attributes: {
        assessmentNumber: 'IA-2026-001',
        title: 'North line integrity assessment',
        assessmentTypeId: 'ILI_REVIEW',
        status: 'DRAFT',
      },
    },
  }));

  await page.route('**/api/v1/integrity/assessments', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(await request.postDataJSON()).toEqual({
      programId: 'program-1',
      assessmentNumber: 'IA-2026-002',
      title: 'South line integrity assessment',
      assessmentTypeId: 'ILI_REVIEW',
    });
    await route.fulfill({
      json: {
        id: 'assessment-2',
        programId: 'program-1',
        assessmentNumber: 'IA-2026-002',
        title: 'South line integrity assessment',
        assessmentTypeId: 'ILI_REVIEW',
        status: 'DRAFT',
      },
    });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('engineer');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

test('HWEB-011-02 discovers integrity resources, reads backend records, and creates an assessment through published contracts', async ({ page }) => {
  await mockEngineering(page);
  await signIn(page);
  await page.getByRole('button', { name: 'Intégrité & maintenance' }).click();

  await expect(page.getByRole('heading', { name: 'Integrity & Maintenance' })).toBeVisible();
  await expect(page.getByText('Backend resource: integrity-assessment')).toBeVisible();
  await expect(page.getByText(/IA-2026-001/)).toBeVisible();

  await page.getByText('assessment-1', { exact: true }).click();
  await expect(page.getByText(/North line integrity assessment/)).toBeVisible();

  await page.getByLabel('programId').fill('program-1');
  await page.getByLabel('assessmentNumber').fill('IA-2026-002');
  await page.getByLabel('title').fill('South line integrity assessment');
  await page.getByLabel('assessmentTypeId').fill('ILI_REVIEW');
  await page.getByRole('button', { name: 'Create assessment' }).click();

  await expect(page.getByText(/Assessment created/)).toBeVisible();
});
