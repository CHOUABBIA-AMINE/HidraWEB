import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/documents/documents', methods: ['POST'], module: 'documents', resource: 'documents', action: 'create', permission: 'documents:documents:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/documents/document-versions/upload', methods: ['POST'], module: 'documents', resource: 'document-versions', action: 'create', permission: 'documents:document-versions:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/documents/document-versions/{versionId}/content', methods: ['GET'], module: 'documents', resource: 'document-versions', action: 'read', permission: 'documents:document-versions:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/documents/target-links', methods: ['POST'], module: 'documents', resource: 'target-links', action: 'create', permission: 'documents:target-links:create', enforcementStatus: 'backend-enforced' },
];

const resources = [
  { module: 'documents', resource: 'document', entityName: 'Document', javaType: 'dz.sh.hidra.modules.documents.infrastructure.persistence.entity.DocumentJpaEntity', tableName: 'hidra_documents_document', idField: 'id', searchableFields: ['code'], listEndpoint: '/api/v1/workbench/documents/document', detailEndpoint: '/api/v1/workbench/documents/document/{id}', searchEndpoint: '/api/v1/workbench/documents/document/search' },
  { module: 'documents', resource: 'document-version', entityName: 'DocumentVersion', javaType: 'dz.sh.hidra.modules.documents.infrastructure.persistence.entity.DocumentVersionJpaEntity', tableName: 'hidra_documents_document_version', idField: 'id', searchableFields: ['originalFilename'], listEndpoint: '/api/v1/workbench/documents/document-version', detailEndpoint: '/api/v1/workbench/documents/document-version/{id}', searchEndpoint: '/api/v1/workbench/documents/document-version/search' },
  { module: 'documents', resource: 'target-link', entityName: 'DocumentTargetLink', javaType: 'dz.sh.hidra.modules.documents.infrastructure.persistence.entity.DocumentTargetLinkJpaEntity', tableName: 'hidra_documents_target_link', idField: 'id', searchableFields: ['targetId'], listEndpoint: '/api/v1/workbench/documents/target-link', detailEndpoint: '/api/v1/workbench/documents/target-link/{id}', searchEndpoint: '/api/v1/workbench/documents/target-link/search' },
];

const allGrants = [
  'workbench:resources:read',
  'documents:documents:create',
  'documents:document-versions:create',
  'documents:document-versions:read',
  'documents:target-links:create',
];

async function mockDocuments(page: Page, grants = allGrants) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/documents/resources', (route) => route.fulfill({ json: resources }));
  for (const descriptor of resources) {
    await page.route(`**/api/v1/workbench/documents/${descriptor.resource}?**`, (route) => route.fulfill({ json: {
      module: 'documents', resource: descriptor.resource, page: 0, size: 50, totalElements: 1, totalPages: 1,
      items: [{ module: 'documents', resource: descriptor.resource, id: descriptor.resource === 'document-version' ? 'version-1' : `${descriptor.resource}-1`, attributes: { code: 'DOC-001', originalFilename: 'evidence.txt', targetId: 'pipe-1' } }],
    } }));
  }
  await page.route('**/api/v1/documents/documents', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({ code: 'DOC-002', titleFr: 'Procédure', confidentialityLevel: 2, ownerModule: 'integrity', createdByActorId: 'actor-1' });
    await route.fulfill({ json: { id: 'doc-2', code: 'DOC-002', titleFr: 'Procédure', confidentialityLevel: 2, status: 'DRAFT', ownerModule: 'integrity', createdAt: '2026-09-13T15:00:00Z' } });
  });
  await page.route('**/api/v1/documents/document-versions/upload', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(request.headers()['content-type']).toContain('multipart/form-data');
    const body = request.postData() ?? '';
    expect(body).toContain('name="metadata"');
    expect(body).toContain('"documentId":"doc-2"');
    expect(body).toContain('"versionLabel":"v1"');
    expect(body).toContain('name="file"; filename="evidence.txt"');
    expect(body).toContain('evidence body');
    expect(body).not.toContain('storageObjectId');
    expect(body).not.toContain('checksumValue');
    await route.fulfill({ json: { id: 'version-2', documentId: 'doc-2', versionNumber: 1, versionLabel: 'v1', mimeType: 'text/plain', originalFilename: 'evidence.txt', fileSizeBytes: 13, checksumValue: 'backend-sha256', versionStatus: 'DRAFT', uploadedAt: '2026-09-13T15:01:00Z' } });
  });
  await page.route('**/api/v1/documents/document-versions/version-1/content', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({
      status: 200,
      body: 'downloaded evidence',
      headers: {
        'content-type': 'text/plain',
        'content-disposition': "attachment; filename*=UTF-8''evidence.txt",
        'content-length': '19',
        'accept-ranges': 'none',
        'access-control-expose-headers': 'Content-Disposition, Content-Type, Content-Length, Accept-Ranges',
      },
    });
  });
  await page.route('**/api/v1/documents/target-links', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({ documentId: 'doc-2', documentVersionId: 'version-2', targetModule: 'integrity', targetTypeCode: 'PIPELINE', targetId: 'pipe-1', primaryLink: true, linkedByActorId: 'actor-1' });
    await route.fulfill({ json: { id: 'link-1', documentId: 'doc-2', documentVersionId: 'version-2', targetModule: 'integrity', targetTypeCode: 'PIPELINE', targetId: 'pipe-1', primaryLink: true, active: true, linkedAt: '2026-09-13T15:02:00Z' } });
  });
}

async function signIn(page: Page) {
  await page.goto('/overview');
  await page.getByLabel('Nom d’utilisateur').fill('documents-user');
  await page.getByLabel('Mot de passe').fill('secret');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: /Vue d/ })).toBeVisible();
}

async function openDocuments(page: Page) {
  await page.evaluate(() => { window.history.pushState({}, '', '/administration/documents'); window.dispatchEvent(new PopStateEvent('popstate')); });
}

test('HWEB-014-03 uploads bytes with published multipart metadata, downloads content, and keeps storage evidence backend-owned', async ({ page }) => {
  await mockDocuments(page);
  await signIn(page);
  await openDocuments(page);
  await expect(page.getByRole('heading', { name: 'Document evidence', exact: true })).toBeVisible();
  await expect(page.getByText(/backend owns storageObjectId/i)).toBeVisible();

  await page.getByLabel('code', { exact: true }).fill('DOC-002');
  await page.getByLabel('titleFr', { exact: true }).first().fill('Procédure');
  await page.getByLabel('confidentialityLevel', { exact: true }).fill('2');
  await page.getByLabel('ownerModule', { exact: true }).fill('integrity');
  await page.getByLabel('createdByActorId', { exact: true }).fill('actor-1');
  await page.getByRole('button', { name: 'Register document' }).click();
  await expect(page.getByText(/Document doc-2 registered with status DRAFT/)).toBeVisible();

  await page.getByLabel('documentId', { exact: true }).first().fill('doc-2');
  await page.getByLabel('versionLabel', { exact: true }).fill('v1');
  await page.getByLabel('versionNumber', { exact: true }).fill('1');
  await page.locator('input[type="file"]').setInputFiles({ name: 'evidence.txt', mimeType: 'text/plain', buffer: Buffer.from('evidence body') });
  await page.getByRole('button', { name: 'Upload version' }).click();
  await expect(page.getByText(/Version version-2 uploaded as evidence.txt with backend checksum backend-sha256/)).toBeVisible();
  await expect(page.getByLabel('storageObjectId', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('checksumValue', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('fileSizeBytes', { exact: true })).toHaveCount(0);

  const contentRequest = page.waitForRequest((request) => request.url().includes('/api/v1/documents/document-versions/version-1/content'));
  await page.getByRole('button', { name: 'Download' }).first().click();
  const request = await contentRequest;
  expect(request.method()).toBe('GET');
  await expect(page.getByText('Downloaded evidence.txt.')).toBeVisible();

  await page.getByLabel('documentId', { exact: true }).nth(1).fill('doc-2');
  await page.getByLabel('documentVersionId', { exact: true }).fill('version-2');
  await page.getByLabel('targetModule', { exact: true }).fill('integrity');
  await page.getByLabel('targetTypeCode', { exact: true }).fill('PIPELINE');
  await page.getByLabel('targetId', { exact: true }).fill('pipe-1');
  await page.getByLabel('primaryLink', { exact: true }).check();
  await page.getByLabel('linkedByActorId', { exact: true }).fill('actor-1');
  await page.getByRole('button', { name: 'Link evidence' }).click();
  await expect(page.getByText(/Target link link-1 recorded/)).toBeVisible();
});

test('HWEB-014-03 fails closed for upload and download without exact route grants', async ({ page }) => {
  await mockDocuments(page, ['workbench:resources:read', 'documents:documents:create', 'documents:target-links:create']);
  await signIn(page);
  await openDocuments(page);
  await expect(page.getByRole('button', { name: 'Upload version' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Download' }).first()).toBeDisabled();
  await expect(page.getByText('Your grants do not allow document version downloads.')).toBeVisible();
});

test('HWEB-014-03 fails closed when document evidence read grant is absent', async ({ page }) => {
  await mockDocuments(page, ['documents:document-versions:create']);
  await signIn(page);
  await openDocuments(page);
  await expect(page.getByText('Your current HidraAPI grants do not allow document evidence reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Document evidence', exact: true })).toHaveCount(0);
});
