import { describe, expect, it } from 'vitest';

import { toAssetLifecycleEventEvidence } from '@/features/assets/AssetHistoryTimeline';

describe('toAssetLifecycleEventEvidence', () => {
  it('preserves backend lifecycle evidence without deriving additional state', () => {
    expect(toAssetLifecycleEventEvidence({
      module: 'assets',
      resource: 'asset-lifecycle-events',
      id: 'event-2',
      attributes: {
        maintainableAssetId: 'asset-1',
        eventType: 'COMMISSIONED',
        oldStatus: 'INSTALLED',
        newStatus: 'COMMISSIONED',
        eventReasonId: 'reason-commissioning',
        eventComment: 'Commissioned for service',
        actorId: 'actor-7',
        eventAt: '2026-09-12T17:00:00Z',
        correlationId: 'corr-22',
        createdAt: '2026-09-12T17:00:01Z',
        status: 'ACTIVE',
      },
    })).toEqual({
      id: 'event-2',
      eventType: 'COMMISSIONED',
      oldStatus: 'INSTALLED',
      newStatus: 'COMMISSIONED',
      eventReasonId: 'reason-commissioning',
      eventComment: 'Commissioned for service',
      actorId: 'actor-7',
      eventAt: '2026-09-12T17:00:00Z',
      correlationId: 'corr-22',
      createdAt: '2026-09-12T17:00:01Z',
    });
  });

  it('leaves missing lifecycle fields missing instead of reconstructing them from current asset state', () => {
    expect(toAssetLifecycleEventEvidence({
      module: 'assets',
      resource: 'asset-lifecycle-events',
      id: 'event-3',
      attributes: {
        maintainableAssetId: 'asset-1',
        status: 'ACTIVE',
        updatedAt: '2026-09-12T18:00:00Z',
      },
    })).toEqual({
      id: 'event-3',
      eventType: undefined,
      oldStatus: undefined,
      newStatus: undefined,
      eventReasonId: undefined,
      eventComment: undefined,
      actorId: undefined,
      eventAt: undefined,
      correlationId: undefined,
      createdAt: undefined,
    });
  });
});
