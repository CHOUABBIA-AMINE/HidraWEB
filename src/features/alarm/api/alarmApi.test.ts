import { beforeEach, describe, expect, it, vi } from 'vitest';

import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import { acknowledgeAlarm, closeAlarm, fetchAlarm, fetchAlarms, fetchShelvings, shelveAlarm, unshelveAlarm } from '@/features/alarm/api/alarmApi';

vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: vi.fn(async () => ({})) }));

const http = vi.mocked(hidraHttpClient);

describe('HWEB-008 alarm API boundary', () => {
  beforeEach(() => http.mockClear());

  it('uses only canonical artifact-derived alarm routes', async () => {
    await fetchAlarms({ view: 'active', page: 0, size: 50 });
    await fetchAlarm('alarm 1');
    await fetchShelvings('alarm 1');
    await acknowledgeAlarm({ alarmId: 'alarm-1' });
    await closeAlarm({ alarmId: 'alarm-1', closureType: 'NORMALIZED', requiresReview: false });
    await shelveAlarm('alarm 1', { shelvingReasonId: 'MAINT' }, 'corr-1');
    await unshelveAlarm('alarm 1', 'shelf 1', 'corr-2');

    expect(http).toHaveBeenNthCalledWith(1, expect.objectContaining({ method: 'GET', url: '/api/v1/alarm/alarms', params: { view: 'active', page: 0, size: 50 } }));
    expect(http).toHaveBeenNthCalledWith(2, expect.objectContaining({ method: 'GET', url: '/api/v1/alarm/alarms/alarm%201' }));
    expect(http).toHaveBeenNthCalledWith(3, expect.objectContaining({ method: 'GET', url: '/api/v1/alarm/alarms/alarm%201/shelvings' }));
    expect(http).toHaveBeenNthCalledWith(4, expect.objectContaining({ method: 'POST', url: '/api/v1/alarm/alarms/acknowledgements' }));
    expect(http).toHaveBeenNthCalledWith(5, expect.objectContaining({ method: 'POST', url: '/api/v1/alarm/alarms/closures' }));
    expect(http).toHaveBeenNthCalledWith(6, expect.objectContaining({ method: 'POST', url: '/api/v1/alarm/alarms/alarm%201/shelvings', headers: { 'X-Correlation-Id': 'corr-1' } }));
    expect(http).toHaveBeenNthCalledWith(7, expect.objectContaining({ method: 'POST', url: '/api/v1/alarm/alarms/alarm%201/shelvings/shelf%201/unshelve', headers: { 'X-Correlation-Id': 'corr-2' } }));
  });
});
