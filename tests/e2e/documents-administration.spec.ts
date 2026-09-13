import { expect, test, type Page } from '@playwright/test';

const routes = [
  { route: '/api/v1/workbench/{module}/{resource}', methods: ['GET'], module: 'workbench', resource: 'resources', action: 'read', permission: 'workbench:resources:read', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/documents/documents', methods: ['POST'], module: 'documents', resource: 'documents', action: 'create', permission: 'documents:documents:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/documents/document-versions', methods: ['POST'], module: 'documents', resource: 'document-versions', action: 'create', permission: 'documents:document-versions:create', enforcementStatus: 'backend-enforced' },
  { route: '/api/v1/documents/target-links', methods: ['POST'], module: 'documents', resource: 'target-links', action: 'create', permission: 'documents:target-links:create', enforcementStatus: 'backend-enforced' },
];

const resources = [
  { module: 'documents', resource: 'document', entityName: 'Document', javaType: 'dz.sh.hidra.modules.documents.infrastructure.persistence.entity.DocumentJpaEntity', tableName: 'hidra_documents_document', idField: 'id', searchableFields: ['code'], listEndpoint: '/api/v1/workbench/documents/document', detailEndpoint: '/api/v1/workbench/documents/document/{id}', searchEndpoint: '/api/v1/workbench/documents/document/search' },
  { module: 'documents', resource: 'document-version', entityName: 'DocumentVersion', javaType: 'dz.sh.hidra.modules.documents.infrastructure.persistence.entity.DocumentVersionJpaEntity', tableName: 'hidra_documents_document_version', idField: 'id', searchableFields: ['originalFilename'], listEndpoint: '/api/v1/workbench/documents/document-version', detailEndpoint: '/api/v1/workbench/documents/document-version/{id}', searchEndpoint: '/api/v1/workbench/documents/document-version/search' },
  { module: 'documents', resource: 'target-link', entityName: 'DocumentTargetLink', javaType: 'dz.sh.hidra.modules.documents.infrastructure.persistence.entity.DocumentTargetLinkJpaEntity', tableName: 'hidra_documents_target_link', idField: 'id', searchableFields: ['targetId'], listEndpoint: '/api/v1/workbench/documents/target-link', detailEndpoint: '/api/v1/workbench/documents/target-link/{id}', searchEndpoint: '/api/v1/workbench/documents/target-link/search' },
];

async function mockDocuments(page: Page, grants = ['workbench:resources:read', 'documents:documents:create', 'documents:document-versions:create', 'documents:target-links:create']) {
  await page.route('**/api/v1/security/permissions/routes', (route) => route.fulfill({ json: routes }));
  await page.route('**/api/v1/security/permissions/catalog', (route) => route.fulfill({ json: { strategy: 'derived-route-permission-catalog', enforcement: 'backend-enforced', permissionFormat: '<module>:<resource>:<action>', routes } }));
  await page.route('**/api/v1/identity/me/permissions', (route) => route.fulfill({ json: grants }));
  await page.route('**/api/v1/workbench/documents/resources', (route) => route.fulfill({ json: resources }));
  for (const descriptor of resources) {
    await page.route(`**/api/v1/workbench/documents/${descriptor.resource}?**`, (route) => route.fulfill({ json: { module: 'documents', resource: descriptor.resource, page: 0, size: 50, totalElements: 1, totalPages: 1, items: [{ module: 'documents', resource: descriptor.resource, id: `${descriptor.resource}-1`, attributes: { code: 'DOC-001', originalFilename: 'evidence.pdf', targetId: 'pipe-1' } }] } }));
  }
  await page.route('**/api/v1/documents/documents', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({ code: 'DOC-002', titleFr: 'Procédure', confidentialityLevel: 2, ownerModule: 'integrity', createdByActorId: 'actor-1' });
    await route.fulfill({ json: { id: 'doc-2', code: 'DOC-002', titleFr: 'Procédure', confidentialityLevel: 2, status: 'DRAFT', ownerModule: 'integrity', createdAt: '2026-09-13T15:00:00Z' } });
  });
  await page.route('**/api/v1/documents/document-versions', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({ documentId: 'doc-2', versionNumber: 1, versionLabel: 'v1', storageObjectId: 'object-77', mimeType: 'application/pdf', originalFilename: 'procedure.pdf', fileSizeBytes: 1024, checksumAlgorithm: 'SHA-256', checksumValue: 'abc123', uploadedByActorId: 'actor-1' });
    await route.fulfill({ json: { id: 'version-1', documentId: 'doc-2', versionNumber: 1, versionLabel: 'v1', mimeType: 'application/pdf', originalFilename: 'procedure.pdf', fileSizeBytes: 1024, checksumValue: 'abc123', versionStatus: 'DRAFT', uploadedAt: '2026-09-13T15:01:00Z' } });
  });
  await page.route('**/api/v1/documents/target-links', async (route) => {
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject({ documentId: 'doc-2', documentVersionId: 'version-1', targetModule: 'integrity', targetTypeCode: 'PIPELINE', targetId: 'pipe-1', primaryLink: true, linkedByActorId: 'actor-1' });
    await route.fulfill({ json: { id: 'link-1', documentId: 'doc-2', documentVersionId: 'version-1', targetModule: 'integrity', targetTypeCode: 'PIPELINE', targetId: 'pipe-1', primaryLink: true, active: true, linkedAt: '2026-09-13T15:02:00Z' } });
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

test('HWEB-014-03 reads runtime document evidence and submits published metadata contracts only', async ({ page }) => {
  await mockDocuments(page);
  await signIn(page);
  await openDocuments(page);
  await expect(page.getByRole('heading', { name: 'Document evidence', exact: true })).toBeVisible();
  await expect(page.getByText(/no multipart binary upload endpoint/i)).toBeVisible();
  await expect(page.locator('input[type="file"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /download/i })).toHaveCount(0);

  await page.getByLabel('code', { exact: true }).fill('DOC-002');
  await page.getByLabel('titleFr', { exact: true }).first().fill('Procédure');
  await page.getByLabel('confidentialityLevel', { exact: true }).fill('2');
  await page.getByLabel('ownerModule', { exact: true }).fill('integrity');
  await page.getByLabel('createdByActorId', { exact: true }).fill('actor-1');
  await page.getByRole('button', { name: 'Register document' }).click();
  await expect(page.getByText(/Document doc-2 registered with status DRAFT/)).toBeVisible();

  await page.getByLabel('documentId', { exact: true }).first().fill('doc-2');
  await page.getByLabel('versionLabel', { exact: true }).fill('v1');
  await page.getByLabel('storageObjectId', { exact: true }).fill('object-77');
  await page.getByLabel('mimeType', { exact: true }).fill('application/pdf');
  await page.getByLabel('originalFilename', { exact: true }).fill('procedure.pdf');
  await page.getByLabel('fileSizeBytes', { exact: true }).fill('1024');
  await page.getByLabel('checksumAlgorithm', { exact: true }).fill('SHA-256');
  await page.getByLabel('checksumValue', { exact: true }).fill('abc123');
  await page.getByLabel('uploadedByActorId', { exact: true }).fill('actor-1');
  await page.getByRole('button', { name: 'Register version metadata' }).click();
  await expect(page.getByText(/Version version-1 recorded with status DRAFT/)).toBeVisible();

  await page.getByLabel('documentId', { exact: true }).nth(1).fill('doc-2');
  await page.getByLabel('documentVersionId', { exact: true }).fill('version-1');
  await page.getByLabel('targetModule', { exact: true }).fill('integrity');
  await page.getByLabel('targetTypeCode', { exact: true }).fill('PIPELINE');
  await page.getByLabel('targetId', { exact: true }).fill('pipe-1');
  await page.getByLabel('primaryLink', { exact: true }).check();
  await page.getByLabel('linkedByActorId', { exact: true }).fill('actor-1');
  await page.getByRole('button', { name: 'Link evidence' }).click();
  await expect(page.getByText(/Target link link-1 recorded/)).toBeVisible();
});

test('HWEB-014-03 fails closed for metadata mutations without exact grants', async ({ page }) => {
  await mockDocuments(page, ['workbench:resources:read']);
  await signIn(page);
  await openDocuments(page);
  await expect(page.getByRole('button', { name: 'Register document' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Register version metadata' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Link evidence' })).toBeDisabled();
});

test('HWEB-014-03 fails closed when document evidence read grant is absent', async ({ page }) => {
  await mockDocuments(page, ['documents:documents:create']);
  await signIn(page);
  await openDocuments(page);
  await expect(page.getByText('Your current HidraAPI grants do not allow document evidence reads.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Document evidence', exact: true })).toHaveCount(0);
});
