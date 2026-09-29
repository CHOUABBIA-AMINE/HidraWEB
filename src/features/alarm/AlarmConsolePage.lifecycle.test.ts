import { describe, expect, it } from 'vitest';

import { isActiveShelving } from '@/features/alarm/AlarmConsolePage';

describe('alarm shelving lifecycle', () => {
  it('allows unshelving only for backend ACTIVE shelving records that are not already unshelved', () => {
    expect(isActiveShelving({ id: 'shelf-1', status: 'ACTIVE' })).toBe(true);
    expect(isActiveShelving({ id: 'shelf-2', status: 'EXPIRED' })).toBe(false);
    expect(isActiveShelving({ id: 'shelf-3', status: 'CANCELLED' })).toBe(false);
    expect(isActiveShelving({
      id: 'shelf-4',
      status: 'ACTIVE',
      unshelvedAt: '2026-09-29T12:00:00Z',
    })).toBe(false);
  });
});
