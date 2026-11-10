import { describe, expect, it } from 'vitest';

import { fixtureVersion } from './fixtures';
import {
  initialInvestigation, investigationView, updateInvestigation, type InvestigationContext,
} from './stationInvestigation';

const atlas: InvestigationContext = {
  role: 'operator', systemId: 'gz2', assetId: 'demo-gz2-atlas', windowId: 'morning',
};
const later: InvestigationContext = { ...atlas, windowId: 'afternoon' };

describe('station investigation fixture', () => {
  it('requires review and records acknowledgement, follow-up and fixture resolution separately', () => {
    const unchecked = updateInvestigation(initialInvestigation, atlas, 'acknowledge');
    expect(investigationView(unchecked, atlas)?.notice).toBe('reviewRequired');
    expect(unchecked.history).toBe(initialInvestigation.history);

    const reviewed = updateInvestigation(unchecked, atlas, 'review');
    const outOfOrder = updateInvestigation(reviewed, atlas, 'resolve');
    expect(outOfOrder.history).toBe(reviewed.history);
    const acknowledged = updateInvestigation(reviewed, atlas, 'acknowledge');
    expect(investigationView(acknowledged, atlas)?.nextAction).toBe('followUp');
    expect(updateInvestigation(acknowledged, atlas, 'followUp').history).toBe(acknowledged.history);
    const followedUp = updateInvestigation(updateInvestigation(acknowledged, atlas, 'review'), atlas, 'followUp');
    expect(investigationView(followedUp, atlas)?.nextAction).toBe('resolve');
    const resolved = updateInvestigation(updateInvestigation(followedUp, atlas, 'review'), atlas, 'resolve');
    expect(investigationView(resolved, atlas)?.nextAction).toBeUndefined();
    expect(resolved.history.map(({ action, actor, time }) => [action, actor, time])).toEqual([
      ['acknowledge', 'operator', '2026-11-06T09:46:00.000Z'],
      ['followUp', 'operator', '2026-11-06T09:47:00.000Z'],
      ['resolve', 'fixture', '2026-11-06T09:48:00.000Z'],
    ]);
    for (const event of resolved.history) {
      expect(event.evidence).toMatchObject({
        fixture: fixtureVersion, revision: 'REV-A03', alarmId: 'DEMO-204',
        observationAt: '2026-11-06T09:45:00Z',
      });
    }
    expect(investigationView(initialInvestigation, atlas)?.history).toEqual([]);
  });

  it('keeps history unchanged on stale review, degraded evidence and unpermitted actions', () => {
    const first = updateInvestigation(updateInvestigation(initialInvestigation, atlas, 'review'), atlas, 'acknowledge');
    const reviewed = updateInvestigation(first, atlas, 'review');
    const stale = updateInvestigation(reviewed, later, 'followUp');
    expect(stale.history).toBe(first.history);
    expect(investigationView(stale, later)?.notice).toBe('stale');
    expect(investigationView(stale, later)?.history).toEqual([]);
    expect(investigationView(updateInvestigation(stale, later, 'review'), later)?.notice).toBe('degraded');
    expect(investigationView(first, { ...atlas, assetId: 'demo-gz2-west' })?.canReview).toBe(false);

    const observer = { ...atlas, role: 'observer' } as const;
    expect(investigationView(first, observer)?.history).toEqual(first.history);
    expect(investigationView(first, observer)?.canAct).toBe(false);
    expect(updateInvestigation(reviewed, observer, 'followUp').history).toBe(first.history);
    for (const role of ['otherScope', 'otherCompany'] as const) {
      const denied = { ...atlas, role };
      expect(investigationView(first, denied)).toBeUndefined();
      expect(updateInvestigation(reviewed, denied, 'followUp')).toBe(reviewed);
    }
  });
});
