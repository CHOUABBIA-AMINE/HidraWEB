import { describe, expect, it } from 'vitest';

import {
  decisionView, initialDecision, updateDecision, type Decision, type DecisionState,
} from './digitalTwinDecision';
import type { InvestigationContext } from './stationInvestigation';

const atlas: InvestigationContext = { role: 'operator', systemId: 'gz2', assetId: 'demo-gz2-atlas', windowId: 'morning' };

function propose(state: DecisionState = initialDecision) {
  const compared = state.history.length ? state : updateDecision(state, atlas, 'matched', 'operator', { type: 'compare' });
  return updateDecision(compared, atlas, 'matched', 'engineer', { type: 'propose' });
}

function review(state: DecisionState) {
  return updateDecision(state, atlas, 'matched', 'reviewer', { type: 'review' });
}

const approve = { type: 'decide', decision: 'approve', rationale: 'Review the modeled pressure difference.' } as const;

describe('digital-twin decision fixture', () => {
  it('binds the observation, both precomputed values and the independent decision to the original manifest', () => {
    const proposed = propose();
    const approved = updateDecision(review(proposed), atlas, 'matched', 'reviewer', approve);
    const view = decisionView(approved, atlas, 'matched');
    expect(view?.comparison).toMatchObject({
      observation: 64.1,
      manifest: {
        id: 'GZ2-ATLAS-PRESSURE-v1', company: 'demoGas', organization: 'westControl',
        station: 'demo-gz2-atlas', technicalRevision: 'REV-A03', alarm: 'DEMO-204',
        observationAt: '2026-11-06T09:45:00Z', unit: 'bar(g)',
      },
      run: { id: 'F21-FIXTURE-RUN-01', baseline: 64.0, alternative: 65.2 },
    });
    expect(view?.history.map(({ kind, actor }) => [kind, actor])).toEqual([
      ['comparison', 'operator'], ['proposal', 'engineer'], ['approve', 'reviewer'],
    ]);
    expect(view?.history.at(-1)).toMatchObject({
      proposalId: 'F21-P1', rationale: approve.rationale, at: '2026-11-06T09:51:00.000Z',
      source: view?.comparison,
    });
    expect(view?.outcomeUnresolved).toBe(true);
    expect(decisionView(initialDecision, atlas, 'matched')?.history).toEqual([]);
  });

  it('blocks missing and incompatible inputs, stale proposals, unauthorized roles and empty rationales', () => {
    const proposed = propose();
    const reviewed = review(proposed);
    for (const input of ['missing', 'incompatible'] as const) {
      const blocked = updateDecision(initialDecision, atlas, input, 'operator', { type: 'compare' });
      expect(blocked.history).toBe(initialDecision.history);
      expect(decisionView(blocked, atlas, input)).toMatchObject({ notice: input, comparison: undefined });
      expect(decisionView(blocked, atlas, 'matched')?.notice).toBeUndefined();
      expect(updateDecision(reviewed, atlas, input, 'reviewer', approve).history).toBe(reviewed.history);
    }
    const later: InvestigationContext = { ...atlas, windowId: 'afternoon' };
    const stale = updateDecision(reviewed, later, 'matched', 'reviewer', approve);
    expect(decisionView(stale, later, 'matched')).toMatchObject({ notice: 'stale', history: [] });
    expect(stale.history).toBe(reviewed.history);
    expect(updateDecision(reviewed, atlas, 'matched', 'engineer', approve).history).toBe(reviewed.history);
    expect(updateDecision(proposed, atlas, 'matched', 'reviewer', approve).history).toBe(proposed.history);
    expect(updateDecision(reviewed, atlas, 'matched', 'reviewer', { ...approve, rationale: '  ' }).history).toBe(reviewed.history);
    const observer = { ...atlas, role: 'observer' } as const;
    expect(decisionView(reviewed, observer, 'matched')).toMatchObject({ canAct: false, hasReview: false });
    expect(updateDecision(reviewed, observer, 'matched', 'reviewer', approve).history).toBe(reviewed.history);
    for (const role of ['otherScope', 'otherCompany'] as const) {
      const denied = { ...atlas, role };
      expect(decisionView(reviewed, denied, 'matched')).toBeUndefined();
      expect(updateDecision(reviewed, denied, 'matched', 'reviewer', approve)).toBe(reviewed);
    }
  });

  it.each<Decision>(['return', 'reject'])('records %s with its rationale and permits a new proposal only after return', (decision) => {
    const state = updateDecision(review(propose()), atlas, 'matched', 'reviewer', { ...approve, decision });
    expect(state.history.at(-1)).toMatchObject({ kind: decision, proposalId: 'F21-P1', rationale: approve.rationale });
    expect(decisionView(state, atlas, 'matched')?.outcomeUnresolved).toBe(false);
    if (decision === 'return') expect(propose(state).history.at(-1)).toMatchObject({ kind: 'proposal', proposalId: 'F21-P2' });
    else expect(propose(state).history).toBe(state.history);
  });
});
