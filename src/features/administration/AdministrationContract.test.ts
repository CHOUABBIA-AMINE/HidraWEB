import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import { requestAuditExport } from '@/features/audit/api/auditApi';
import {
  createConfigurationDefinition,
  createFeatureFlag,
  setConfigurationValue,
} from '@/features/configuration/api/configurationApi';
import {
  linkDocumentToTarget,
  registerDocument,
} from '@/features/documents/api/documentsApi';
import {
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
} from '@/features/workbench/api/workbenchApi';

describe('administration contract guardrails', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses typed audit/configuration/documents commands on canonical HidraAPI endpoints', async () => {
    httpClient.mockResolvedValue({});

    const exportRequest = { purposeId: 'COMPLIANCE', format: 'JSON' };
    await requestAuditExport(exportRequest);

    const definition = { code: 'CFG-1', nameFr: 'Configuration' };
    const flag = { code: 'FLAG-1', nameFr: 'Feature flag' };
    const value = { configurationDefinitionId: 'cfg-1', value: 'enabled' };
    await createConfigurationDefinition(definition);
    await createFeatureFlag(flag);
    await setConfigurationValue(value);

    const document = { documentNumber: 'DOC-1', titleFr: 'Procedure' };
    const link = { documentId: 'doc-1', targetModule: 'risk', targetId: 'risk-1' };
    await registerDocument(document);
    await linkDocumentToTarget(link);

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/api/v1/audit/exports',
      data: exportRequest,
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/configuration/definitions',
      data: definition,
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'POST',
      url: '/api/v1/configuration/feature-flags',
      data: flag,
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      method: 'POST',
      url: '/api/v1/configuration/values',
      data: value,
    });
    expect(httpClient).toHaveBeenNthCalledWith(5, {
      method: 'POST',
      url: '/api/v1/documents/documents',
      data: document,
    });
    expect(httpClient).toHaveBeenNthCalledWith(6, {
      method: 'POST',
      url: '/api/v1/documents/target-links',
      data: link,
    });
  });

  it.each(['integration', 'notification'])(
    'keeps %s administration evidence on generic workbench reads without inventing provider actions',
    async (module) => {
      httpClient
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce({
          page: 0,
          size: 50,
          totalElements: 0,
          totalPages: 0,
          items: [],
        });

      await fetchWorkbenchResources(module);
      await fetchWorkbenchRecords({
        module,
        resource: 'evidence',
        page: 0,
        size: 50,
      });

      expect(httpClient).toHaveBeenNthCalledWith(1, {
        method: 'GET',
        url: `/api/v1/workbench/${module}/resources`,
      });
      expect(httpClient).toHaveBeenNthCalledWith(2, {
        method: 'GET',
        url: `/api/v1/workbench/${module}/evidence`,
        params: { page: 0, size: 50 },
      });
    },
  );
});
