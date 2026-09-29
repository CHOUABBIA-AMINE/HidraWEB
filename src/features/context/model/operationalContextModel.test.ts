import { describe, expect, it } from 'vitest';

import { activeOperationalScopes } from '@/features/context/model/operationalContextModel';

describe('activeOperationalScopes', () => {
  it('uses canonical scope objects from active responsibilities and de-duplicates by registry id', () => {
    const scope = { id: 7, type: 'PIPELINE', targetId: 'pipeline-1', code: 'PL-1', name: 'Pipeline 1', assignable: true };
    const result = activeOperationalScopes([
      { id: 'r1', status: 'ACTIVE', scopeId: 7, scope },
      { id: 'r2', status: 'ACTIVE', scopeId: 7, scope },
      { id: 'r3', status: 'ENDED', scopeId: 9, scope: { ...scope, id: 9 } },
    ]);

    expect(result).toEqual([scope]);
  });

  it('does not manufacture an operational context from assignments without a canonical scope response', () => {
    expect(activeOperationalScopes([{ id: 'r1', status: 'ACTIVE', scopeId: 7 }])).toEqual([]);
  });
});
