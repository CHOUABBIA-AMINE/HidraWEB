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
    httpClient
      .mockResolvedValueOnce({ userId: 'current-actor', displayName: 'Current actor' })
      .mockResolvedValueOnce(['audit:exports:execute'])
      .mockResolvedValue({});

    const exportRequest = {
      purposeId: 'COMPLIANCE', format: 'JSON',
      requestedByActorId: 'untrusted-actor', requestedByDisplayNameSnapshot: 'Untrusted actor',
    };
    await requestAuditExport(exportRequest, 'current-actor', 'audit:exports:execute');

    const definition = { key: 'CFG-1', displayNameFr: 'Configuration' };
    const flag = { code: 'FLAG-1', nameFr: 'Feature flag' };
    const value = { definitionId: 'cfg-1', rawValue: 'enabled' };
    await createConfigurationDefinition(definition);
    await createFeatureFlag(flag);
    await setConfigurationValue(value);

    const document = { documentNumber: 'DOC-1', titleFr: 'Procedure' };
    const link = { documentId: 'doc-1', targetModule: 'risk', targetId: 'risk-1' };
    await registerDocument(document);
    await linkDocumentToTarget(link);

    expect(httpClient).toHaveBeenCalledTimes(8);
    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/identity/me',
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/identity/me/permissions',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'POST',
      url: '/api/v1/audit/exports',
      data: { ...exportRequest, requestedByActorId: 'current-actor', requestedByDisplayNameSnapshot: 'Current actor' },
    });
    expect(httpClient).toHaveBeenNthCalledWith(4, {
      headers: { 'Content-Type': 'application/json' },
      signal: undefined,
      method: 'POST',
      url: '/api/v1/configuration/definitions',
      data: definition,
    });
    expect(httpClient).toHaveBeenNthCalledWith(5, {
      headers: { 'Content-Type': 'application/json' },
      signal: undefined,
      method: 'POST',
      url: '/api/v1/configuration/feature-flags',
      data: flag,
    });
    expect(httpClient).toHaveBeenNthCalledWith(6, {
      headers: { 'Content-Type': 'application/json' },
      signal: undefined,
      method: 'POST',
      url: '/api/v1/configuration/values',
      data: value,
    });
    expect(httpClient).toHaveBeenNthCalledWith(7, {
      method: 'POST',
      url: '/api/v1/documents/documents',
      data: document,
    });
    expect(httpClient).toHaveBeenNthCalledWith(8, {
      method: 'POST',
      url: '/api/v1/documents/target-links',
      data: link,
    });
  });

  it.each([
    { userId: 'different-actor', permissions: ['audit:exports:execute'] },
    { userId: 'current-actor', permissions: [] },
    { userId: undefined, permissions: ['audit:exports:execute'] },
  ])('does not submit an audit export for missing or mismatched current authority: %j', async ({ userId, permissions }) => {
    httpClient
      .mockResolvedValueOnce({ userId, displayName: 'Current actor' })
      .mockResolvedValueOnce(permissions);
    await expect(requestAuditExport(
      { purposeId: 'COMPLIANCE', format: 'JSON' }, 'current-actor', 'audit:exports:execute',
    )).rejects.toThrow('Current export requester or grant unavailable.');
    expect(httpClient).toHaveBeenCalledTimes(2);
    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET', url: '/api/v1/identity/me',
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET', url: '/api/v1/identity/me/permissions',
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
