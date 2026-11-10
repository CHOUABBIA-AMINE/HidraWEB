import { accessibleSystems, fixtureVersion } from './fixtures';
import type { InvestigationContext } from './stationInvestigation';

export const decisionFixtureVersion = 'digital-twin-decision-v1';
export const decisionActors = ['operator', 'engineer', 'reviewer'] as const;
export const inputSelections = ['matched', 'missing', 'incompatible'] as const;
export const decisionOptions = ['approve', 'reject', 'return'] as const;
export type DecisionActor = typeof decisionActors[number];
export type InputSelection = typeof inputSelections[number];
export type Decision = typeof decisionOptions[number];
export type DecisionNotice = 'missing' | 'incompatible' | 'denied' | 'unavailable' | 'reviewed' | 'stale' | 'rationale';

const manifest = {
  id: 'GZ2-ATLAS-PRESSURE-v1',
  fixture: 'network-fixture-v2',
  company: 'demoGas',
  organization: 'westControl',
  system: 'gz2',
  station: 'demo-gz2-atlas',
  window: 'morning',
  medium: 'gas',
  technicalRevision: 'REV-A03',
  alarm: 'DEMO-204',
  observationAt: '2026-11-06T09:45:00Z',
  unit: 'bar(g)',
} as const;

// Authored demonstration values bound to this manifest. No numerical engine is involved.
const run = { id: 'F21-FIXTURE-RUN-01', fixture: decisionFixtureVersion, baseline: 64.0, alternative: 65.2 } as const;
type Source = { manifest: typeof manifest; run: typeof run; observation: number };
type EventBase = { actor: DecisionActor; at: string; source: Source };
type Event = EventBase & (
  | { kind: 'comparison' }
  | { kind: 'proposal'; proposalId: string }
  | { kind: Decision; proposalId: string; rationale: string }
);

export type DecisionState = {
  history: readonly Event[];
  reviewedProposal?: string;
  notice?: { window: InvestigationContext['windowId']; input: InputSelection; code: DecisionNotice };
};

export const initialDecision: DecisionState = { history: [] };

export type DecisionCommand =
  | { type: 'compare' | 'propose' | 'review' }
  | { type: 'decide'; decision: Decision; rationale: string };

const commandActor: Record<DecisionCommand['type'], DecisionActor> = {
  compare: 'operator', propose: 'engineer', review: 'reviewer', decide: 'reviewer',
};

function stationScope(context: InvestigationContext) {
  if (context.systemId !== manifest.system || context.assetId !== manifest.station) return undefined;
  const system = accessibleSystems(context.role).find(({ id }) => id === context.systemId);
  const station = system?.stations.find(({ id }) => id === context.assetId);
  return system && station ? { system, station } : undefined;
}

function readInput(
  scope: NonNullable<ReturnType<typeof stationScope>>,
  context: InvestigationContext,
  selection: InputSelection,
): Source | 'missing' | 'incompatible' {
  const { system, station } = scope;
  const { technical, pressure, alarm } = station.evidence[context.windowId];
  if (selection === 'missing' || technical.state !== 'available' || pressure.state !== 'available' || alarm.state !== 'available') return 'missing';
  const observation = pressure.value.samples.at(-1);
  if (observation === undefined || !Number.isFinite(observation)) return 'missing';
  if (selection === 'incompatible' || system.company !== manifest.company || system.organization !== manifest.organization
    || context.windowId !== manifest.window || fixtureVersion !== manifest.fixture
    || technical.value.revision !== manifest.technicalRevision || alarm.value.id !== manifest.alarm
    || pressure.observedAt !== manifest.observationAt) return 'incompatible';
  return { manifest, run, observation };
}

export function decisionView(state: DecisionState, context: InvestigationContext, input: InputSelection) {
  const scope = stationScope(context);
  if (!scope) return undefined;
  const source = readInput(scope, context, input);
  const history = state.history.filter((event) => event.source.manifest.window === context.windowId);
  const last = history.at(-1);
  const proposal = last?.kind === 'proposal' ? last : undefined;
  const canAct = context.role === 'operator';
  return {
    station: scope.station.id,
    organization: scope.system.organization,
    source: typeof source === 'string' ? undefined : source,
    blocked: typeof source === 'string' ? source : undefined,
    comparison: typeof source !== 'string' && history.length > 0 ? source : undefined,
    history,
    proposal,
    canAct,
    canPropose: last?.kind === 'comparison' || last?.kind === 'return',
    hasReview: canAct && !!state.reviewedProposal,
    outcomeUnresolved: last?.kind === 'approve',
    notice: canAct && state.notice?.window === context.windowId && state.notice.input === input ? state.notice.code : undefined,
  };
}

export function updateDecision(
  state: DecisionState,
  context: InvestigationContext,
  input: InputSelection,
  actor: DecisionActor,
  command: DecisionCommand,
): DecisionState {
  const view = decisionView(state, context, input);
  if (!view) return state;
  const notice = (code: DecisionNotice): DecisionState => ({ ...state, notice: { window: context.windowId, input, code } });
  if (!view.canAct || actor !== commandActor[command.type]) return notice('denied');

  if (command.type === 'decide' && state.reviewedProposal
    && (!view.source || view.proposal?.proposalId !== state.reviewedProposal)) {
    return { ...notice('stale'), reviewedProposal: undefined };
  }

  if (!view.source) return notice(view.blocked ?? 'unavailable');
  const at = new Date(Date.parse(view.source.manifest.observationAt) + (view.history.length + 4) * 60_000).toISOString();
  const base: EventBase = { actor, at, source: view.source };
  switch (command.type) {
    case 'compare':
      if (view.history.length) return notice('unavailable');
      return { history: [...state.history, { ...base, kind: 'comparison' }] };
    case 'propose': {
      if (!view.canPropose) return notice('unavailable');
      const proposalId = 'F21-P' + (view.history.filter(({ kind }) => kind === 'proposal').length + 1);
      return { history: [...state.history, { ...base, kind: 'proposal', proposalId }] };
    }
    case 'review':
      return view.proposal
        ? { ...notice('reviewed'), reviewedProposal: view.proposal.proposalId }
        : notice('unavailable');
    case 'decide': {
      const rationale = command.rationale.trim();
      if (!view.proposal || state.reviewedProposal !== view.proposal.proposalId) return notice('unavailable');
      if (!rationale || rationale.length > 240) return notice('rationale');
      return {
        history: [...state.history, { ...base, kind: command.decision, proposalId: view.proposal.proposalId, rationale }],
      };
    }
  }
}
