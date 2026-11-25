import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/app/auth/useAuth';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { ScopedHseWorkspace } from '@/features/incident/ScopedHseWorkspace';
import type { CapaView, HseCaseView } from '@/api/generated/hse/model';
import type { IncidentView } from '@/api/generated/incident/model';
import type { LeakCandidateView, LeakCaseView } from '@/api/generated/leak/model';
import {
  fetchCapa,
  fetchCapas,
  fetchHseCase,
  fetchHseCases,
  hseQueryKeys,
} from '@/features/incident/api/hseApi';
import { fetchIncident, fetchIncidents, fetchIncidentTimeline, fetchIncidentInvestigation, fetchIncidentEscalation, incidentQueryKeys } from '@/features/incident/api/incidentApi';
import {
  fetchLeakCandidate,
  fetchLeakCandidates,
  fetchLeakCase,
  fetchLeakCases,
  fetchLeakCandidateEvidence,
  fetchLeakInvestigation,
  leakQueryKeys,
} from '@/features/incident/api/leakApi';
import { usePermissions } from '@/features/permissions/usePermissions';

const PAGE_SIZE = 50;
const INCIDENT_LIST_ROUTE = '/api/v1/incident/incidents';
const LEAK_CANDIDATE_LIST_ROUTE = '/api/v1/leakdetection/candidates';
const LEAK_CASE_LIST_ROUTE = '/api/v1/leakdetection/cases';
const HSE_CASE_LIST_ROUTE = '/api/v1/hse/cases';
const HSE_CAPA_LIST_ROUTE = '/api/v1/hse/capas';

type EventWorkspaceTab = 'incidents' | 'leakdetection' | 'hse';

const protectedReadPolicy = { retry: false, refetchOnMount: 'always', gcTime: 0 } as const;

function fresh<T>(query: { isSuccess: boolean; isFetchedAfterMount: boolean; isFetching: boolean; data?: T }): T | undefined {
  return query.isSuccess && query.isFetchedAfterMount && !query.isFetching ? query.data : undefined;
}

function EvidenceFields({ title, value, fields }: { title: string; value?: object; fields: readonly string[] }) {
  const { t } = useTranslation();
  const record = value as Record<string, unknown> | undefined;
  return <Box><Typography component="h3" variant="subtitle1">{title}</Typography>
    {record ? fields.map(field => <Typography key={field}>{t('uxr29.fields.' + field)}: {typeof record[field] === 'string' || typeof record[field] === 'number' ? String(record[field]) : '—'}</Typography>)
      : <Typography color="text.secondary">{t('uxr29.evidenceUnavailable')}</Typography>}
  </Box>;
}

function InvestigationHistory({ history }: { history?: ReadonlyArray<object> }) {
  const { t } = useTranslation();
  return <Stack spacing={1}>
    {history?.map((event, index) => <Paper key={index} variant="outlined" sx={{ p: 1 }}>
      <EvidenceFields title={t('uxr29.history')} value={event} fields={['id', 'operation', 'direction', 'stateBefore', 'stateAfter', 'actorId', 'recordedAt', 'referenceType', 'referenceId', 'requestId', 'version', 'detail']} />
    </Paper>)}
  </Stack>;
}

function valueOrDash(value?: string | number | boolean | null): string {
  return value === undefined || value === null || value === '' ? '—' : String(value);
}

function IncidentRow({ incident, onOpen }: { incident: IncidentView; onOpen: () => void }) {
  return (
    <TableRow hover>
      <TableCell>{incident.incidentNumber ?? incident.id ?? '—'}</TableCell>
      <TableCell>{incident.title ?? '—'}</TableCell>
      <TableCell><Chip label={incident.status ?? '—'} size="small" variant="outlined" /></TableCell>
      <TableCell>{valueOrDash(incident.severityId)}</TableCell>
      <TableCell>{valueOrDash(incident.priorityId)}</TableCell>
      <TableCell>{incident.topologyAssetName ?? incident.topologyAssetCode ?? incident.topologyAssetId ?? '—'}</TableCell>
      <TableCell>{valueOrDash(incident.updatedAt)}</TableCell>
      <TableCell><Button onClick={onOpen} size="small">Open</Button></TableCell>
    </TableRow>
  );
}

function IncidentDetail({ incident, onClose }: { incident: IncidentView; onClose: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="overline">Incident detail</Typography>
            <Typography component="h2" variant="h6">{incident.title ?? incident.incidentNumber ?? incident.id ?? 'Incident'}</Typography>
            <Typography color="text.secondary" variant="body2">{incident.incidentNumber ?? incident.id ?? '—'}</Typography>
          </Box>
          <Button onClick={onClose} size="small">Close</Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box><Typography color="text.secondary" variant="caption">Status</Typography><Typography>{valueOrDash(incident.status)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Source</Typography><Typography>{valueOrDash(incident.sourceType)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Classification</Typography><Typography>{valueOrDash(incident.classificationId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Severity / Priority</Typography><Typography>{valueOrDash(incident.severityId)} / {valueOrDash(incident.priorityId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Topology asset</Typography><Typography>{incident.topologyAssetName ?? incident.topologyAssetCode ?? incident.topologyAssetId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Workflow instance</Typography><Typography>{valueOrDash(incident.workflowInstanceId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Responsible actor</Typography><Typography>{incident.responsibleActorName ?? incident.responsibleActorId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Responsible organization</Typography><Typography>{incident.responsibleOrganizationUnitName ?? incident.responsibleOrganizationUnitCode ?? incident.responsibleOrganizationUnitId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Occurred</Typography><Typography>{valueOrDash(incident.occurredAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Reported</Typography><Typography>{valueOrDash(incident.reportedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Detected</Typography><Typography>{valueOrDash(incident.detectedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Escalation level</Typography><Typography>{valueOrDash(incident.currentEscalationLevel)}</Typography></Box>
        </Box>
        {incident.description ? <><Divider /><Typography>{incident.description}</Typography></> : null}
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {incident.topologyAssetCode || incident.topologyAssetId ? <Button component={RouterLink} to={`/network?query=${encodeURIComponent(incident.topologyAssetCode ?? incident.topologyAssetId ?? '')}`} size="small" variant="outlined">Open topology context</Button> : null}
          {incident.workflowInstanceId ? <Button component={RouterLink} to={`/work/tasks?instanceId=${encodeURIComponent(incident.workflowInstanceId)}`} size="small" variant="outlined">Open workflow context</Button> : null}
        </Stack>
      </Stack>
    </Paper>
  );
}

function LeakCandidateDetail({ candidate, onClose }: { candidate: LeakCandidateView; onClose: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography color="text.secondary" variant="overline">Leak candidate detail</Typography>
            <Typography component="h3" variant="h6">{candidate.candidateNumber ?? candidate.id ?? 'Candidate'}</Typography>
          </Box>
          <Button onClick={onClose} size="small">Close</Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box><Typography color="text.secondary" variant="caption">Status</Typography><Typography>{valueOrDash(candidate.status)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Severity</Typography><Typography>{valueOrDash(candidate.severityLevel)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Confidence</Typography><Typography>{valueOrDash(candidate.confidenceScore)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Asset</Typography><Typography>{candidate.topologyAssetName ?? candidate.topologyAssetCode ?? candidate.topologyAssetId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Suspected</Typography><Typography>{valueOrDash(candidate.suspectedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">First evidence</Typography><Typography>{valueOrDash(candidate.firstEvidenceAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Run / Profile</Typography><Typography>{valueOrDash(candidate.runId)} / {valueOrDash(candidate.profileId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Correlation</Typography><Typography>{valueOrDash(candidate.correlationId)}</Typography></Box>
        </Box>
        {candidate.summary ? <><Divider /><Typography>{candidate.summary}</Typography></> : null}
      </Stack>
    </Paper>
  );
}

function LeakCaseDetail({ leakCase, onClose }: { leakCase: LeakCaseView; onClose: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography color="text.secondary" variant="overline">Leak case detail</Typography>
            <Typography component="h3" variant="h6">{leakCase.caseNumber ?? leakCase.id ?? 'Leak case'}</Typography>
          </Box>
          <Button onClick={onClose} size="small">Close</Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box><Typography color="text.secondary" variant="caption">Status</Typography><Typography>{valueOrDash(leakCase.status)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Severity</Typography><Typography>{valueOrDash(leakCase.severityLevel)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Confidence</Typography><Typography>{valueOrDash(leakCase.confidenceScore)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Primary candidate</Typography><Typography>{valueOrDash(leakCase.primaryCandidateId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Asset</Typography><Typography>{leakCase.topologyAssetCode ?? leakCase.topologyAssetId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Owning organization</Typography><Typography>{valueOrDash(leakCase.owningOrganizationUnitId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Opened</Typography><Typography>{valueOrDash(leakCase.openedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Opened by</Typography><Typography>{valueOrDash(leakCase.openedByActorId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Closed</Typography><Typography>{valueOrDash(leakCase.closedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Closure reason</Typography><Typography>{valueOrDash(leakCase.closureReasonId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Correlation</Typography><Typography>{valueOrDash(leakCase.correlationId)}</Typography></Box>
        </Box>
      </Stack>
    </Paper>
  );
}

function HseCaseDetail({ hseCase, onClose }: { hseCase: HseCaseView; onClose: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography color="text.secondary" variant="overline">HSE case detail</Typography>
            <Typography component="h3" variant="h6">{hseCase.title ?? hseCase.caseNumber ?? hseCase.id ?? 'HSE case'}</Typography>
            <Typography color="text.secondary" variant="body2">{hseCase.caseNumber ?? hseCase.id ?? '—'}</Typography>
          </Box>
          <Button onClick={onClose} size="small">Close</Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box><Typography color="text.secondary" variant="caption">Status</Typography><Typography>{valueOrDash(hseCase.status)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Type</Typography><Typography>{valueOrDash(hseCase.caseTypeId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Severity / Priority</Typography><Typography>{valueOrDash(hseCase.severityId)} / {valueOrDash(hseCase.priorityId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Source</Typography><Typography>{valueOrDash(hseCase.sourceType)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Incident</Typography><Typography>{hseCase.incidentCodeSnapshot ?? hseCase.incidentTitleSnapshot ?? hseCase.incidentReferenceId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Operational target</Typography><Typography>{hseCase.targetLabelSnapshot ?? hseCase.targetCodeSnapshot ?? hseCase.targetId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Reported by</Typography><Typography>{hseCase.reportedByDisplayNameSnapshot ?? hseCase.reportedByActorId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Responsible organization</Typography><Typography>{hseCase.responsibleOrganizationUnitNameSnapshot ?? hseCase.responsibleOrganizationUnitId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Workflow instance</Typography><Typography>{valueOrDash(hseCase.workflowInstanceId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Audit reference</Typography><Typography>{valueOrDash(hseCase.auditReferenceId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Occurred / Reported</Typography><Typography>{valueOrDash(hseCase.occurredAt)} / {valueOrDash(hseCase.reportedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Controlled / Resolved / Closed</Typography><Typography>{valueOrDash(hseCase.controlledAt)} / {valueOrDash(hseCase.resolvedAt)} / {valueOrDash(hseCase.closedAt)}</Typography></Box>
        </Box>
        {hseCase.description ? <><Divider /><Typography>{hseCase.description}</Typography></> : null}
        {hseCase.workflowInstanceId ? <Button component={RouterLink} to={`/work/tasks?instanceId=${encodeURIComponent(hseCase.workflowInstanceId)}`} size="small" variant="outlined">Open workflow context</Button> : null}
      </Stack>
    </Paper>
  );
}

function CapaDetail({ capa, onClose }: { capa: CapaView; onClose: () => void }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography color="text.secondary" variant="overline">CAPA detail</Typography>
            <Typography component="h3" variant="h6">{capa.title ?? capa.actionNumber ?? capa.id ?? 'CAPA'}</Typography>
            <Typography color="text.secondary" variant="body2">{capa.actionNumber ?? capa.id ?? '—'}</Typography>
          </Box>
          <Button onClick={onClose} size="small">Close</Button>
        </Box>
        <Divider />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Box><Typography color="text.secondary" variant="caption">Status</Typography><Typography>{valueOrDash(capa.status)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Action type</Typography><Typography>{valueOrDash(capa.actionTypeId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">HSE case</Typography><Typography>{valueOrDash(capa.hseCaseId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Owner</Typography><Typography>{capa.ownerDisplayNameSnapshot ?? capa.ownerActorId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Owner organization</Typography><Typography>{capa.ownerOrganizationUnitNameSnapshot ?? capa.ownerOrganizationUnitId ?? '—'}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Target / Completed</Typography><Typography>{valueOrDash(capa.targetDate)} / {valueOrDash(capa.completedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Verification required</Typography><Typography>{valueOrDash(capa.verificationRequired)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Verified by / at</Typography><Typography>{valueOrDash(capa.verifiedByActorId)} / {valueOrDash(capa.verifiedAt)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Linked work order</Typography><Typography>{valueOrDash(capa.linkedWorkOrderId)}</Typography></Box>
          <Box><Typography color="text.secondary" variant="caption">Workflow task</Typography><Typography>{valueOrDash(capa.workflowTaskId)}</Typography></Box>
        </Box>
        {capa.description ? <><Divider /><Typography>{capa.description}</Typography></> : null}
      </Stack>
    </Paper>
  );
}

export function IncidentWorkspacePage() {
  const permissions = usePermissions();
  const auth = useAuth();
  const context = useShellUiStore(state => state.operationalContext);
  const [tab, setTab] = useState<EventWorkspaceTab>('incidents');
  // Mode is intentionally retained outside the scoped subtree. Losing a
  // facility must not switch a protected HSE read to the legacy register.
  const [hseMode, setHseMode] = useState<'scoped' | 'legacy'>(context ? 'scoped' : 'legacy');
  const identity = JSON.stringify([auth.status, auth.session?.sessionId, auth.session?.principal?.userId, context,
    tab, hseMode, permissions.status, [...permissions.permissions].sort(),
    permissions.routes.map(r => [r.route, r.methods, r.permission])]);
  return <CurrentEventsWorkspace key={identity} identity={identity} tab={tab} setTab={setTab} hseMode={hseMode} setHseMode={setHseMode} />;
}

function CurrentEventsWorkspace({ identity, tab, setTab, hseMode, setHseMode }: {
  identity: string; tab: EventWorkspaceTab; setTab: (value: EventWorkspaceTab) => void;
  hseMode: 'scoped' | 'legacy'; setHseMode: (value: 'scoped' | 'legacy') => void;
}) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const [selectionEpoch, setSelectionEpoch] = useState(0);
  const [refreshEpoch, setRefreshEpoch] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [candidatePage, setCandidatePage] = useState(0);
  const [casePage, setCasePage] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [hseCasePage, setHseCasePage] = useState(0);
  const [capaPage, setCapaPage] = useState(0);
  const [selectedHseCaseId, setSelectedHseCaseId] = useState('');
  const [selectedCapaId, setSelectedCapaId] = useState('');

  const incidentReadDescriptor = useMemo(() => permissions.routes.find((descriptor) => descriptor.route === INCIDENT_LIST_ROUTE && descriptor.methods.includes('GET')), [permissions.routes]);
  const candidateReadDescriptor = useMemo(() => permissions.routes.find((descriptor) => descriptor.route === LEAK_CANDIDATE_LIST_ROUTE && descriptor.methods.includes('GET')), [permissions.routes]);
  const caseReadDescriptor = useMemo(() => permissions.routes.find((descriptor) => descriptor.route === LEAK_CASE_LIST_ROUTE && descriptor.methods.includes('GET')), [permissions.routes]);
  const hseCaseReadDescriptor = useMemo(() => permissions.routes.find((descriptor) => descriptor.route === HSE_CASE_LIST_ROUTE && descriptor.methods.includes('GET')), [permissions.routes]);
  const capaReadDescriptor = useMemo(() => permissions.routes.find((descriptor) => descriptor.route === HSE_CAPA_LIST_ROUTE && descriptor.methods.includes('GET')), [permissions.routes]);

  const canReadIncidents = Boolean(incidentReadDescriptor?.permission && permissions.can(incidentReadDescriptor.permission));
  const canReadCandidates = Boolean(candidateReadDescriptor?.permission && permissions.can(candidateReadDescriptor.permission));
  const canReadCases = Boolean(caseReadDescriptor?.permission && permissions.can(caseReadDescriptor.permission));
  const canReadHseCases = Boolean(hseCaseReadDescriptor?.permission && permissions.can(hseCaseReadDescriptor.permission));
  const canReadCapas = Boolean(capaReadDescriptor?.permission && permissions.can(capaReadDescriptor.permission));

  const incidentListParams = useMemo(() => ({ page, size: PAGE_SIZE }), [page]);
  const candidateListParams = useMemo(() => ({ page: candidatePage, size: PAGE_SIZE }), [candidatePage]);
  const caseListParams = useMemo(() => ({ page: casePage, size: PAGE_SIZE }), [casePage]);
  const hseCaseListParams = useMemo(() => ({ page: hseCasePage, size: PAGE_SIZE }), [hseCasePage]);
  const capaListParams = useMemo(() => ({ page: capaPage, size: PAGE_SIZE }), [capaPage]);

  const allows = (route: string) => {
    const permission = permissions.routes.find(r => r.route === route && r.methods.includes('GET'))?.permission;
    return Boolean(permission && permissions.can(permission));
  };

  const incidentsQuery = useQuery({ queryKey: [...incidentQueryKeys.list(incidentListParams), identity, refreshEpoch], queryFn: ({ signal }) => fetchIncidents(incidentListParams, signal), enabled: tab === 'incidents' && canReadIncidents, ...protectedReadPolicy });
  const incidentDetailQuery = useQuery({ queryKey: [...incidentQueryKeys.detail(selectedIncidentId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchIncident(selectedIncidentId, signal), enabled: tab === 'incidents' && canReadIncidents && allows(INCIDENT_LIST_ROUTE + '/{id}') && Boolean(selectedIncidentId && fresh(incidentsQuery)?.content?.some(row => row.id === selectedIncidentId)), ...protectedReadPolicy });
  const candidatesQuery = useQuery({ queryKey: [...leakQueryKeys.candidates(candidateListParams), identity, refreshEpoch], queryFn: ({ signal }) => fetchLeakCandidates(candidateListParams, signal), enabled: tab === 'leakdetection' && canReadCandidates, ...protectedReadPolicy });
  const candidateDetailQuery = useQuery({ queryKey: [...leakQueryKeys.candidate(selectedCandidateId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchLeakCandidate(selectedCandidateId, signal), enabled: tab === 'leakdetection' && canReadCandidates && allows(LEAK_CANDIDATE_LIST_ROUTE + '/{id}') && Boolean(selectedCandidateId && fresh(candidatesQuery)?.content?.some(row => row.id === selectedCandidateId)), ...protectedReadPolicy });
  const casesQuery = useQuery({ queryKey: [...leakQueryKeys.cases(caseListParams), identity, refreshEpoch], queryFn: ({ signal }) => fetchLeakCases(caseListParams, signal), enabled: tab === 'leakdetection' && canReadCases, ...protectedReadPolicy });
  const caseDetailQuery = useQuery({ queryKey: [...leakQueryKeys.case(selectedCaseId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchLeakCase(selectedCaseId, signal), enabled: tab === 'leakdetection' && canReadCases && allows(LEAK_CASE_LIST_ROUTE + '/{id}') && Boolean(selectedCaseId && fresh(casesQuery)?.content?.some(row => row.id === selectedCaseId)), ...protectedReadPolicy });
  const hseCasesQuery = useQuery({ queryKey: [...hseQueryKeys.cases(hseCaseListParams), identity, refreshEpoch], queryFn: ({ signal }) => fetchHseCases(hseCaseListParams, signal), enabled: tab === 'hse' && hseMode === 'legacy' && canReadHseCases, ...protectedReadPolicy });
  const hseCaseDetailQuery = useQuery({ queryKey: [...hseQueryKeys.case(selectedHseCaseId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchHseCase(selectedHseCaseId, signal), enabled: tab === 'hse' && hseMode === 'legacy' && canReadHseCases && allows(HSE_CASE_LIST_ROUTE + '/{id}') && Boolean(selectedHseCaseId && fresh(hseCasesQuery)?.content?.some(row => row.id === selectedHseCaseId)), ...protectedReadPolicy });
  const capasQuery = useQuery({ queryKey: [...hseQueryKeys.capas(capaListParams), identity, refreshEpoch], queryFn: ({ signal }) => fetchCapas(capaListParams, signal), enabled: tab === 'hse' && hseMode === 'legacy' && canReadCapas, ...protectedReadPolicy });
  const capaDetailQuery = useQuery({ queryKey: [...hseQueryKeys.capa(selectedCapaId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchCapa(selectedCapaId, signal), enabled: tab === 'hse' && hseMode === 'legacy' && canReadCapas && allows(HSE_CAPA_LIST_ROUTE + '/{id}') && Boolean(selectedCapaId && fresh(capasQuery)?.content?.some(row => row.id === selectedCapaId)), ...protectedReadPolicy });

  const incidentList = !unavailable && canReadIncidents ? fresh(incidentsQuery) : undefined;
  const candidateList = !unavailable && canReadCandidates ? fresh(candidatesQuery) : undefined;
  const caseList = !unavailable && canReadCases ? fresh(casesQuery) : undefined;
  const hseList = !unavailable && hseMode === 'legacy' && canReadHseCases ? fresh(hseCasesQuery) : undefined;
  const capaList = !unavailable && hseMode === 'legacy' && canReadCapas ? fresh(capasQuery) : undefined;
  const incidents = incidentList?.content ?? [];
  const candidates = candidateList?.content ?? [];
  const leakCases = caseList?.content ?? [];
  const hseCases = hseList?.content ?? [];
  const capas = capaList?.content ?? [];

  const incident = incidentList?.content?.some(row => row.id === selectedIncidentId) && allows(INCIDENT_LIST_ROUTE + '/{id}') && fresh(incidentDetailQuery)?.id === selectedIncidentId ? fresh(incidentDetailQuery) : undefined;
  const candidate = candidateList?.content?.some(row => row.id === selectedCandidateId) && allows(LEAK_CANDIDATE_LIST_ROUTE + '/{id}') && fresh(candidateDetailQuery)?.id === selectedCandidateId ? fresh(candidateDetailQuery) : undefined;
  const leakCase = caseList?.content?.some(row => row.id === selectedCaseId) && allows(LEAK_CASE_LIST_ROUTE + '/{id}') && fresh(caseDetailQuery)?.id === selectedCaseId ? fresh(caseDetailQuery) : undefined;
  const hseCase = hseList?.content?.some(row => row.id === selectedHseCaseId) && allows(HSE_CASE_LIST_ROUTE + '/{id}') && fresh(hseCaseDetailQuery)?.id === selectedHseCaseId ? fresh(hseCaseDetailQuery) : undefined;
  const capa = capaList?.content?.some(row => row.id === selectedCapaId) && allows(HSE_CAPA_LIST_ROUTE + '/{id}') && fresh(capaDetailQuery)?.id === selectedCapaId ? fresh(capaDetailQuery) : undefined;
  const timelineAllowed = allows(INCIDENT_LIST_ROUTE + '/{id}/timeline');
  const investigationAllowed = allows(INCIDENT_LIST_ROUTE + '/{id}/investigation');
  const escalationAllowed = allows(INCIDENT_LIST_ROUTE + '/{id}/escalation');
  const candidateEvidenceAllowed = allows(LEAK_CANDIDATE_LIST_ROUTE + '/{id}/evidence');
  const leakInvestigationAllowed = allows(LEAK_CASE_LIST_ROUTE + '/{id}/investigation');
  const hasIncidentOrigin = Boolean(incident?.sourceReferenceId && ['ALARM', 'LEAK_CANDIDATE'].includes(incident.sourceType ?? ''));
  const timeline = useQuery({ queryKey: [...incidentQueryKeys.timeline(selectedIncidentId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchIncidentTimeline(selectedIncidentId, signal), enabled: Boolean(incident && timelineAllowed), ...protectedReadPolicy });
  const investigation = useQuery({ queryKey: [...incidentQueryKeys.investigation(selectedIncidentId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchIncidentInvestigation(selectedIncidentId, signal), enabled: Boolean(incident && investigationAllowed), ...protectedReadPolicy });
  const escalation = useQuery({ queryKey: [...incidentQueryKeys.escalation(selectedIncidentId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchIncidentEscalation(selectedIncidentId, signal), enabled: Boolean(incident && hasIncidentOrigin && escalationAllowed), ...protectedReadPolicy });
  const candidateEvidence = useQuery({ queryKey: [...leakQueryKeys.evidence(selectedCandidateId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchLeakCandidateEvidence(selectedCandidateId, signal), enabled: Boolean(candidate && candidateEvidenceAllowed), ...protectedReadPolicy });
  const leakInvestigation = useQuery({ queryKey: [...leakQueryKeys.investigation(selectedCaseId), identity, refreshEpoch, selectionEpoch], queryFn: ({ signal }) => fetchLeakInvestigation(selectedCaseId, signal), enabled: Boolean(leakCase && leakInvestigationAllowed), ...protectedReadPolicy });
  const timelineData = incident && timelineAllowed ? fresh(timeline) : undefined;
  const investigationData = incident && investigationAllowed ? fresh(investigation) : undefined;
  const escalationData = incident && hasIncidentOrigin && escalationAllowed ? fresh(escalation) : undefined;
  const candidateEvidenceData = candidate && candidateEvidenceAllowed ? fresh(candidateEvidence) : undefined;
  const leakInvestigationData = leakCase && leakInvestigationAllowed ? fresh(leakInvestigation) : undefined;
  // The same owner incident can contain independently authorized Alarm and Leak
  // escalation receipts. Validate their owner ID, not equality to the primary source.
  const timelineMatches = !timelineData || (Array.isArray(timelineData) && timelineData.every(row =>
    row.incidentId === selectedIncidentId && Boolean(row.sourceId) &&
    ['ALARM', 'LEAK_CANDIDATE'].includes(row.sourceType ?? '')));
  const escalationMatches = !escalationData || (escalationData.incidentId === selectedIncidentId && escalationData.sourceId === incident?.sourceReferenceId && escalationData.sourceType === incident?.sourceType);
  const incidentFailed = Boolean(selectedIncidentId && ((incidentList && !incidentList.content?.some(row => row.id === selectedIncidentId)) || incidentsQuery.isError || incidentDetailQuery.isError ||
    (fresh(incidentDetailQuery) && !incident && incidentList) || timeline.isError || investigation.isError || escalation.isError ||
    !timelineMatches || !escalationMatches || (investigationData && investigationData.incidentId !== selectedIncidentId)));
  const candidateFailed = Boolean(selectedCandidateId && ((candidateList && !candidateList.content?.some(row => row.id === selectedCandidateId)) || candidatesQuery.isError || candidateDetailQuery.isError ||
    (fresh(candidateDetailQuery) && !candidate && candidateList) || candidateEvidence.isError ||
    (candidateEvidenceData && candidateEvidenceData.candidateId !== selectedCandidateId)));
  const caseFailed = Boolean(selectedCaseId && ((caseList && !caseList.content?.some(row => row.id === selectedCaseId)) || casesQuery.isError || caseDetailQuery.isError || (fresh(caseDetailQuery) && !leakCase && caseList) ||
    leakInvestigation.isError || (leakInvestigationData && (leakInvestigationData.caseId !== selectedCaseId ||
      (leakCase?.primaryCandidateId && leakInvestigationData.candidateId !== leakCase.primaryCandidateId)))));
  const hseFailed = Boolean(selectedHseCaseId && ((hseList && !hseList.content?.some(row => row.id === selectedHseCaseId)) || hseCasesQuery.isError || hseCaseDetailQuery.isError || (fresh(hseCaseDetailQuery) && !hseCase && hseList)));
  const capaFailed = Boolean(selectedCapaId && ((capaList && !capaList.content?.some(row => row.id === selectedCapaId)) || capasQuery.isError || capaDetailQuery.isError || (fresh(capaDetailQuery) && !capa && capaList)));
  if (incidentFailed || candidateFailed || caseFailed || hseFailed || capaFailed) {
    setSelectedIncidentId(''); setSelectedCandidateId(''); setSelectedCaseId(''); setSelectedHseCaseId(''); setSelectedCapaId('');
    setUnavailable(true);
  }

  function select(setter: (id: string) => void, id: string) {
    setUnavailable(false); setSelectionEpoch(value => value + 1); setter(id);
  }
  function refresh() {
    setUnavailable(false); setSelectedIncidentId(''); setSelectedCandidateId(''); setSelectedCaseId(''); setSelectedHseCaseId(''); setSelectedCapaId('');
    setRefreshEpoch(value => value + 1);
  }
  const incidentError = incidentsQuery.error ?? incidentDetailQuery.error;
  const leakError = candidatesQuery.error ?? candidateDetailQuery.error ?? casesQuery.error ?? caseDetailQuery.error;
  const hseError = hseCasesQuery.error ?? hseCaseDetailQuery.error ?? capasQuery.error ?? capaDetailQuery.error;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography color="text.secondary" variant="overline">HWEB-009</Typography>
          <Typography component="h1" variant="h4">Events & Incidents</Typography>
          <Typography color="text.secondary">One operational process composed from incident, leak detection, and HSE without transferring backend ownership.</Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 1 }}>
          <Tabs onChange={(_, value: EventWorkspaceTab) => setTab(value)} value={tab}>
            <Tab label="Incidents" value="incidents" />
            <Tab label="Leak detection" value="leakdetection" />
            <Tab label="HSE" value="hse" />
          </Tabs>
        </Paper>

        {unavailable ? <Alert severity="warning">{t('ownerFeedback.denied')}</Alert> : null}
        {tab === 'incidents' ? (
          <>
            {!incidentReadDescriptor ? <Alert severity="warning">HidraAPI did not publish a GET route-permission descriptor for the incident register. The workspace fails closed.</Alert> : null}
            {incidentReadDescriptor && !canReadIncidents ? <Alert severity="warning">You do not have the backend-published permission required to read incidents.</Alert> : null}
            {incidentError ? <Alert severity="error">{t('ownerFeedback.denied')}</Alert> : null}
            {canReadIncidents ? (
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: selectedIncidentId ? 'minmax(0, 1.5fr) minmax(380px, 0.8fr)' : '1fr' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                      <Box><Typography component="h2" variant="h6">Incident register</Typography><Typography color="text.secondary" variant="caption">{incidentList ? `${incidents.length} loaded of ${incidentList.totalElements ?? incidents.length}` : '—'}</Typography></Box>
                      <Button onClick={refresh}>Refresh</Button>
                    </Box>
                    {incidents.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Number</TableCell><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Priority</TableCell><TableCell>Asset</TableCell><TableCell>Updated</TableCell><TableCell /></TableRow></TableHead><TableBody>{incidents.map((incident, index) => <IncidentRow incident={incident} key={incident.id ?? `incident-${index}`} onOpen={() => select(setSelectedIncidentId, incident.id ?? '')} />)}</TableBody></Table></TableContainer> : Boolean(incidentList) && !incidentsQuery.isLoading && !incidentsQuery.error ? <Alert severity="info">No incidents were returned by HidraAPI.</Alert> : null}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={page === 0} onClick={() => { select(setSelectedIncidentId, ''); setPage((value) => Math.max(0, value - 1)); }}>Previous</Button><Typography variant="caption">Page {page + 1} of {Math.max(incidentList?.totalPages ?? 1, 1)}</Typography><Button disabled={!incidentList?.hasNext} onClick={() => { select(setSelectedIncidentId, ''); setPage((value) => value + 1); }}>Next</Button></Box>
                  </Stack>
                </Paper>
                {incident && !incidentFailed ? <Stack spacing={1}>
                  <IncidentDetail incident={incident} onClose={() => select(setSelectedIncidentId, '')} />
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <EvidenceFields title={t('uxr29.investigation')} value={investigationData} fields={['incidentId', 'incidentStatus', 'investigationState', 'investigatorId', 'submittedById', 'reviewedById', 'resolutionSummary', 'version']} />
                    <InvestigationHistory history={investigationData?.history} />
                    <EvidenceFields title={t('uxr29.escalation')} value={escalationData} fields={['incidentId', 'sourceType', 'sourceId', 'evaluationId', 'status', 'actorId', 'escalatedAt']} />
                    <Typography component="h3" variant="subtitle1">{t('uxr29.timeline')}</Typography>
                    {timelineData?.length ? timelineData.map((entry, index) => <EvidenceFields key={index} title={t('uxr29.timeline')} value={entry} fields={['incidentId', 'sourceType', 'sourceId', 'evaluationId', 'status', 'actorId', 'escalatedAt']} />) : <Typography>{t('uxr29.evidenceUnavailable')}</Typography>}
                  </Paper>
                </Stack> : null}
              </Box>
            ) : null}
          </>
        ) : null}

        {tab === 'leakdetection' ? (
          <Stack spacing={2}>
            {!candidateReadDescriptor ? <Alert severity="warning">HidraAPI did not publish a GET route-permission descriptor for leak candidates. Candidate reads fail closed.</Alert> : null}
            {!caseReadDescriptor ? <Alert severity="warning">HidraAPI did not publish a GET route-permission descriptor for leak cases. Case reads fail closed.</Alert> : null}
            {candidateReadDescriptor && !canReadCandidates ? <Alert severity="warning">You do not have the backend-published permission required to read leak candidates.</Alert> : null}
            {caseReadDescriptor && !canReadCases ? <Alert severity="warning">You do not have the backend-published permission required to read leak cases.</Alert> : null}
            {leakError ? <Alert severity="error">{t('ownerFeedback.denied')}</Alert> : null}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
              {canReadCandidates ? (
                <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1.5}><Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}><Box><Typography component="h2" variant="h6">Leak candidates</Typography><Typography color="text.secondary" variant="caption">{candidateList ? `${candidates.length} loaded of ${candidateList.totalElements ?? candidates.length}` : '—'}</Typography></Box><Button onClick={refresh}>Refresh</Button></Box>{candidates.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Candidate</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Confidence</TableCell><TableCell>Asset</TableCell><TableCell /></TableRow></TableHead><TableBody>{candidates.map((candidate, index) => <TableRow hover key={candidate.id ?? `candidate-${index}`}><TableCell>{candidate.candidateNumber ?? candidate.id ?? '—'}</TableCell><TableCell><Chip label={candidate.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(candidate.severityLevel)}</TableCell><TableCell>{valueOrDash(candidate.confidenceScore)}</TableCell><TableCell>{candidate.topologyAssetName ?? candidate.topologyAssetCode ?? candidate.topologyAssetId ?? '—'}</TableCell><TableCell><Button onClick={() => select(setSelectedCandidateId, candidate.id ?? '')} size="small">Open</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : Boolean(candidateList) && !candidatesQuery.isLoading && !candidatesQuery.error ? <Alert severity="info">No leak candidates were returned by HidraAPI.</Alert> : null}<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={candidatePage === 0} onClick={() => { select(setSelectedCandidateId, ''); setCandidatePage((value) => Math.max(0, value - 1)); }}>Previous</Button><Typography variant="caption">Page {candidatePage + 1} of {Math.max(candidateList?.totalPages ?? 1, 1)}</Typography><Button disabled={!candidateList?.hasNext} onClick={() => { select(setSelectedCandidateId, ''); setCandidatePage((value) => value + 1); }}>Next</Button></Box></Stack></Paper>
              ) : null}
              {canReadCases ? (
                <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1.5}><Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}><Box><Typography component="h2" variant="h6">Leak cases</Typography><Typography color="text.secondary" variant="caption">{caseList ? `${leakCases.length} loaded of ${caseList.totalElements ?? leakCases.length}` : '—'}</Typography></Box><Button onClick={refresh}>Refresh</Button></Box>{leakCases.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Case</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Confidence</TableCell><TableCell>Asset</TableCell><TableCell /></TableRow></TableHead><TableBody>{leakCases.map((leakCase, index) => <TableRow hover key={leakCase.id ?? `leak-case-${index}`}><TableCell>{leakCase.caseNumber ?? leakCase.id ?? '—'}</TableCell><TableCell><Chip label={leakCase.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(leakCase.severityLevel)}</TableCell><TableCell>{valueOrDash(leakCase.confidenceScore)}</TableCell><TableCell>{leakCase.topologyAssetCode ?? leakCase.topologyAssetId ?? '—'}</TableCell><TableCell><Button onClick={() => select(setSelectedCaseId, leakCase.id ?? '')} size="small">Open</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : Boolean(caseList) && !casesQuery.isLoading && !casesQuery.error ? <Alert severity="info">No leak cases were returned by HidraAPI.</Alert> : null}<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={casePage === 0} onClick={() => { select(setSelectedCaseId, ''); setCasePage((value) => Math.max(0, value - 1)); }}>Previous</Button><Typography variant="caption">Page {casePage + 1} of {Math.max(caseList?.totalPages ?? 1, 1)}</Typography><Button disabled={!caseList?.hasNext} onClick={() => { select(setSelectedCaseId, ''); setCasePage((value) => value + 1); }}>Next</Button></Box></Stack></Paper>
              ) : null}
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
              {candidate && !candidateFailed ? <Stack spacing={1}><LeakCandidateDetail candidate={candidate} onClose={() => select(setSelectedCandidateId, '')} />
                <Paper variant="outlined" sx={{ p: 2 }}><EvidenceFields title={t('uxr29.candidateEvidence')} value={candidateEvidenceData} fields={['candidateId', 'evaluationId', 'ruleId', 'ruleRevision', 'targetId', 'approvalId', 'trustedReadingId', 'unitId', 'declaredConfidence', 'evaluatedAt', 'status', 'reason']} /></Paper></Stack> : null}
              {leakCase && !caseFailed ? <Stack spacing={1}><LeakCaseDetail leakCase={leakCase} onClose={() => select(setSelectedCaseId, '')} />
                <Paper variant="outlined" sx={{ p: 2 }}><EvidenceFields title={t('uxr29.investigation')} value={leakInvestigationData} fields={['caseId', 'candidateId', 'caseStatus', 'investigationState', 'disposition', 'investigatorId', 'submittedById', 'reviewedById', 'version']} />
                <InvestigationHistory history={leakInvestigationData?.history} /></Paper></Stack> : null}
            </Box>
          </Stack>
        ) : null}

        {tab === 'hse' ? <Stack direction="row" spacing={1}>
          <Button variant={hseMode === 'scoped' ? 'contained' : 'outlined'} onClick={() => setHseMode('scoped')}>{t('uxr29.scopedMode')}</Button>
          <Button variant={hseMode === 'legacy' ? 'contained' : 'outlined'} onClick={() => setHseMode('legacy')}>{t('uxr29.legacyMode')}</Button>
        </Stack> : null}
        {tab === 'hse' && hseMode === 'scoped' ? <ScopedHseWorkspace /> : null}
        {tab === 'hse' && hseMode === 'legacy' ? (
          <Stack spacing={2}>
            {!hseCaseReadDescriptor ? <Alert severity="warning">HidraAPI did not publish a GET route-permission descriptor for HSE cases. HSE case reads fail closed.</Alert> : null}
            {!capaReadDescriptor ? <Alert severity="warning">HidraAPI did not publish a GET route-permission descriptor for HSE CAPAs. CAPA reads fail closed.</Alert> : null}
            {hseCaseReadDescriptor && !canReadHseCases ? <Alert severity="warning">You do not have the backend-published permission required to read HSE cases.</Alert> : null}
            {capaReadDescriptor && !canReadCapas ? <Alert severity="warning">You do not have the backend-published permission required to read HSE CAPAs.</Alert> : null}
            {hseError ? <Alert severity="error">{t('ownerFeedback.denied')}</Alert> : null}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
              {canReadHseCases ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}><Box><Typography component="h2" variant="h6">HSE cases</Typography><Typography color="text.secondary" variant="caption">{hseList ? `${hseCases.length} loaded of ${hseList.totalElements ?? hseCases.length}` : '—'}</Typography></Box><Button onClick={refresh}>Refresh</Button></Box>
                    {hseCases.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Case</TableCell><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Incident</TableCell><TableCell /></TableRow></TableHead><TableBody>{hseCases.map((hseCase, index) => <TableRow hover key={hseCase.id ?? `hse-case-${index}`}><TableCell>{hseCase.caseNumber ?? hseCase.id ?? '—'}</TableCell><TableCell>{hseCase.title ?? '—'}</TableCell><TableCell><Chip label={hseCase.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(hseCase.severityId)}</TableCell><TableCell>{hseCase.incidentCodeSnapshot ?? hseCase.incidentReferenceId ?? '—'}</TableCell><TableCell><Button onClick={() => select(setSelectedHseCaseId, hseCase.id ?? '')} size="small">Open</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : Boolean(hseList) && !hseCasesQuery.isLoading && !hseCasesQuery.error ? <Alert severity="info">No HSE cases were returned by HidraAPI.</Alert> : null}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={hseCasePage === 0} onClick={() => { select(setSelectedHseCaseId, ''); setHseCasePage((value) => Math.max(0, value - 1)); }}>Previous</Button><Typography variant="caption">Page {hseCasePage + 1} of {Math.max(hseList?.totalPages ?? 1, 1)}</Typography><Button disabled={!hseList?.hasNext} onClick={() => { select(setSelectedHseCaseId, ''); setHseCasePage((value) => value + 1); }}>Next</Button></Box>
                  </Stack>
                </Paper>
              ) : null}
              {canReadCapas ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}><Box><Typography component="h2" variant="h6">Corrective & preventive actions</Typography><Typography color="text.secondary" variant="caption">{capaList ? `${capas.length} loaded of ${capaList.totalElements ?? capas.length}` : '—'}</Typography></Box><Button onClick={refresh}>Refresh</Button></Box>
                    {capas.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Action</TableCell><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Owner</TableCell><TableCell>Target date</TableCell><TableCell /></TableRow></TableHead><TableBody>{capas.map((capa, index) => <TableRow hover key={capa.id ?? `capa-${index}`}><TableCell>{capa.actionNumber ?? capa.id ?? '—'}</TableCell><TableCell>{capa.title ?? '—'}</TableCell><TableCell><Chip label={capa.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{capa.ownerDisplayNameSnapshot ?? capa.ownerActorId ?? '—'}</TableCell><TableCell>{valueOrDash(capa.targetDate)}</TableCell><TableCell><Button onClick={() => select(setSelectedCapaId, capa.id ?? '')} size="small">Open</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : Boolean(capaList) && !capasQuery.isLoading && !capasQuery.error ? <Alert severity="info">No HSE CAPAs were returned by HidraAPI.</Alert> : null}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={capaPage === 0} onClick={() => { select(setSelectedCapaId, ''); setCapaPage((value) => Math.max(0, value - 1)); }}>Previous</Button><Typography variant="caption">Page {capaPage + 1} of {Math.max(capaList?.totalPages ?? 1, 1)}</Typography><Button disabled={!capaList?.hasNext} onClick={() => { select(setSelectedCapaId, ''); setCapaPage((value) => value + 1); }}>Next</Button></Box>
                  </Stack>
                </Paper>
              ) : null}
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
              {hseCase && !hseFailed ? <HseCaseDetail hseCase={hseCase} onClose={() => select(setSelectedHseCaseId, '')} /> : null}
              {capa && !capaFailed ? <CapaDetail capa={capa} onClose={() => select(setSelectedCapaId, '')} /> : null}
            </Box>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
}
