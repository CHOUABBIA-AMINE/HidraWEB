import {
  accessibleSystems, fixtureVersion,
  type Organization, type RoleId, type StationEvidence, type StationId, type SystemId, type WindowId,
} from './fixtures';

export type InvestigationContext = {
  role: RoleId;
  systemId: SystemId;
  assetId: string | null;
  windowId: WindowId;
};

export type InvestigationAction = 'acknowledge' | 'followUp' | 'resolve';
export type InvestigationNotice = 'reviewed' | 'reviewRequired' | 'stale' | 'degraded' | 'denied' | 'unavailable' | 'recorded';

type Scope = {
  key: string;
  organization: Organization;
  stationId: StationId;
  evidence: StationEvidence;
};

type EvidenceReference = {
  key: string;
  fixture: string;
  revision: string;
  revisionAt: string;
  observationAt: string;
  alarmId: string;
  alarmAt: string;
};

type Event = {
  action: InvestigationAction;
  actor: 'operator' | 'fixture';
  time: string;
  evidence: EvidenceReference;
};

type Review = { evidenceKey: string; version: number };

type InvestigationState = {
  history: readonly Event[];
  review?: Review;
  notice?: { key: string; code: InvestigationNotice };
};

export const initialInvestigation: InvestigationState = { history: [] };
export const investigationVersion = 'station-investigation-v1';

const actions: readonly InvestigationAction[] = ['acknowledge', 'followUp', 'resolve'];

function authorizedScope(context: InvestigationContext): Scope | undefined {
  const system = accessibleSystems(context.role).find(({ id }) => id === context.systemId);
  const station = system?.stations.find(({ id }) => id === context.assetId);
  if (!system || !station) return undefined;
  return {
    key: [system.company, system.organization, system.id, station.id, context.windowId].join('/'),
    organization: system.organization,
    stationId: station.id,
    evidence: station.evidence[context.windowId],
  };
}

function reference({ key, evidence }: Scope): EvidenceReference | undefined {
  const { technical, pressure, alarm } = evidence;
  if (technical.state !== 'available' || pressure.state !== 'available' || alarm.state !== 'available') return undefined;
  return {
    key, fixture: fixtureVersion,
    revision: technical.value.revision, revisionAt: technical.observedAt,
    observationAt: pressure.observedAt,
    alarmId: alarm.value.id, alarmAt: alarm.observedAt,
  };
}

function reviewKey(evidence: EvidenceReference) {
  return [evidence.key, evidence.fixture, evidence.revision, evidence.revisionAt, evidence.observationAt, evidence.alarmId, evidence.alarmAt].join('|');
}

function scopedHistory(state: InvestigationState, key: string) {
  return state.history.filter(({ evidence }) => evidence.key === key);
}

export function investigationView(state: InvestigationState, context: InvestigationContext) {
  const scope = authorizedScope(context);
  if (!scope) return undefined;
  const history = scopedHistory(state, scope.key);
  const evidence = reference(scope);
  return {
    organization: scope.organization,
    stationId: scope.stationId,
    evidence: scope.evidence,
    history,
    nextAction: actions[history.length],
    canAct: context.role === 'operator',
    notice: state.notice?.key === scope.key && context.role === 'operator' ? state.notice.code : undefined,
    canReview: !!evidence,
  };
}

export function updateInvestigation(
  state: InvestigationState,
  context: InvestigationContext,
  command: 'review' | InvestigationAction,
): InvestigationState {
  const scope = authorizedScope(context);
  if (!scope) return state;
  const notice = (code: InvestigationNotice): InvestigationState => ({
    ...state,
    notice: { key: scope.key, code },
  });
  if (context.role !== 'operator') return notice('denied');

  const evidence = reference(scope);
  const version = scopedHistory(state, scope.key).length;
  if (command === 'review') {
    if (!evidence) return { ...notice('degraded'), review: undefined };
    if (!actions[version]) return notice('unavailable');
    return { ...notice('reviewed'), review: { evidenceKey: reviewKey(evidence), version } };
  }

  if (!state.review) return notice(evidence ? 'reviewRequired' : 'degraded');
  if (!evidence || state.review.evidenceKey !== reviewKey(evidence) || state.review.version !== version) {
    return { ...notice('stale'), review: undefined };
  }
  if (actions[version] !== command) return notice('unavailable');

  const latestEvidenceTime = Math.max(...[evidence.revisionAt, evidence.observationAt, evidence.alarmAt].map(Date.parse));
  const event: Event = {
    action: command,
    actor: command === 'resolve' ? 'fixture' : 'operator',
    time: new Date(latestEvidenceTime + (version + 1) * 60000).toISOString(),
    evidence,
  };
  return { ...notice('recorded'), history: [...state.history, event], review: undefined };
}
