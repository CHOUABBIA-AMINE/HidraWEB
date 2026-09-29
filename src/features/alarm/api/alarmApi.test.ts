import { beforeEach, describe, expect, it, vi } from 'vitest';

const httpClient = vi.hoisted(() => vi.fn());

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: httpClient,
}));

import {
  acknowledgeAlarm,
  closeAlarm,
  fetchAlarm,
  fetchAlarms,
  fetchShelvings,
  shelveAlarm,
  unshelveAlarm,
} from '@/features/alarm/api/alarmApi';

describe('alarm API adapter', () => {
  beforeEach(() => {
    httpClient.mockReset();
  });

  it('uses canonical alarm list/detail/shelving read endpoints and compacts optional filters', async () => {
    httpClient
      .mockResolvedValueOnce({ content: [], page: 0, size: 50, totalElements: 0, totalPages: 0, hasNext: false })
      .mockResolvedValueOnce({ id: 'alarm/1' })
      .mockResolvedValueOnce([]);

    await fetchAlarms({
      view: 'active',
      state: '',
      severityId: 'SEV-1',
      topologyAssetId: '',
      from: '2026-09-29T10:00:00Z',
      to: '2026-09-29T11:00:00Z',
      page: 0,
      size: 50,
    });
    await fetchAlarm('alarm/1');
    await fetchShelvings('alarm/1');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/api/v1/alarm/alarms',
      params: {
        view: 'active',
        severityId: 'SEV-1',
        from: '2026-09-29T10:00:00Z',
        to: '2026-09-29T11:00:00Z',
        page: 0,
        size: 50,
      },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'GET',
      url: '/api/v1/alarm/alarms/alarm%2F1',
    });
    expect(httpClient).toHaveBeenNthCalledWith(3, {
      method: 'GET',
      url: '/api/v1/alarm/alarms/alarm%2F1/shelvings',
    });
  });

  it('uses server-derived actor identity for acknowledgement and closure payloads', async () => {
    httpClient.mockResolvedValueOnce('ack-1').mockResolvedValueOnce('closure-1');

    const acknowledgement = {
      alarmId: 'alarm-1',
      organizationUnitId: 'ou-1',
      organizationUnitCode: 'OPS',
      comment: 'Acknowledged',
      correlationId: 'corr-1',
    };
    const closure = {
      alarmId: 'alarm-1',
      closureType: 'NORMALIZED' as const,
      closureReasonId: 'NORMAL',
      closureComment: 'Condition normalized',
      requiresReview: false,
      correlationId: 'corr-2',
    };

    await acknowledgeAlarm(acknowledgement);
    await closeAlarm(closure);

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/api/v1/alarm/alarms/acknowledgements',
      data: acknowledgement,
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/alarm/alarms/closures',
      data: closure,
    });
    expect(acknowledgement).not.toHaveProperty('actorId');
    expect(closure).not.toHaveProperty('actorId');
  });

  it('uses canonical shelving/unshelving endpoints and transports correlation as a header only', async () => {
    httpClient.mockResolvedValueOnce('shelf-1').mockResolvedValueOnce('unshelf-1');

    const request = {
      shelvingReasonId: 'MAINT',
      reasonText: 'Inspection',
      shelvedUntil: '2026-09-29T12:00:00Z',
    };

    await shelveAlarm('alarm/1', request, 'corr-1');
    await unshelveAlarm('alarm/1', 'shelf/1', 'corr-2');

    expect(httpClient).toHaveBeenNthCalledWith(1, {
      method: 'POST',
      url: '/api/v1/alarm/alarms/alarm%2F1/shelvings',
      data: request,
      headers: { 'X-Correlation-Id': 'corr-1' },
    });
    expect(httpClient).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/api/v1/alarm/alarms/alarm%2F1/shelvings/shelf%2F1/unshelve',
      headers: { 'X-Correlation-Id': 'corr-2' },
    });
  });
});
