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

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { IncidentView } from '@/api/generated/incident/model';
import type { LeakCandidateView, LeakCaseView } from '@/api/generated/leak/model';
import { fetchIncident, fetchIncidents, incidentQueryKeys } from '@/features/incident/api/incidentApi';
import {
  fetchLeakCandidate,
  fetchLeakCandidates,
  fetchLeakCase,
  fetchLeakCases,
  leakQueryKeys,
} from '@/features/incident/api/leakApi';
import { usePermissions } from '@/features/permissions/usePermissions';

const PAGE_SIZE = 50;
const INCIDENT_LIST_ROUTE = '/api/v1/incident/incidents';
const LEAK_CANDIDATE_LIST_ROUTE = '/api/v1/leakdetection/candidates';
const LEAK_CASE_LIST_ROUTE = '/api/v1/leakdetection/cases';

type EventWorkspaceTab = 'incidents' | 'leakdetection' | 'hse';

function displayError(error: unknown, domain: string): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? `HidraAPI refused ${domain} access.` : normalized.message || `${domain} data could not be loaded.`;
}

function valueOrDash(value?: string | number | null): string {
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

export function IncidentWorkspacePage() {
  const permissions = usePermissions();
  const [tab, setTab] = useState<EventWorkspaceTab>('incidents');
  const [page, setPage] = useState(0);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [candidatePage, setCandidatePage] = useState(0);
  const [casePage, setCasePage] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');

  const incidentReadDescriptor = useMemo(
    () => permissions.routes.find((descriptor) => descriptor.route === INCIDENT_LIST_ROUTE && descriptor.methods.includes('GET')),
    [permissions.routes],
  );
  const candidateReadDescriptor = useMemo(
    () => permissions.routes.find((descriptor) => descriptor.route === LEAK_CANDIDATE_LIST_ROUTE && descriptor.methods.includes('GET')),
    [permissions.routes],
  );
  const caseReadDescriptor = useMemo(
    () => permissions.routes.find((descriptor) => descriptor.route === LEAK_CASE_LIST_ROUTE && descriptor.methods.includes('GET')),
    [permissions.routes],
  );

  const canReadIncidents = Boolean(incidentReadDescriptor?.permission && permissions.can(incidentReadDescriptor.permission));
  const canReadCandidates = Boolean(candidateReadDescriptor?.permission && permissions.can(candidateReadDescriptor.permission));
  const canReadCases = Boolean(caseReadDescriptor?.permission && permissions.can(caseReadDescriptor.permission));

  const incidentListParams = useMemo(() => ({ page, size: PAGE_SIZE }), [page]);
  const candidateListParams = useMemo(() => ({ page: candidatePage, size: PAGE_SIZE }), [candidatePage]);
  const caseListParams = useMemo(() => ({ page: casePage, size: PAGE_SIZE }), [casePage]);

  const incidentsQuery = useQuery({ queryKey: incidentQueryKeys.list(incidentListParams), queryFn: () => fetchIncidents(incidentListParams), enabled: tab === 'incidents' && canReadIncidents });
  const incidentDetailQuery = useQuery({ queryKey: incidentQueryKeys.detail(selectedIncidentId), queryFn: () => fetchIncident(selectedIncidentId), enabled: tab === 'incidents' && canReadIncidents && Boolean(selectedIncidentId) });
  const candidatesQuery = useQuery({ queryKey: leakQueryKeys.candidates(candidateListParams), queryFn: () => fetchLeakCandidates(candidateListParams), enabled: tab === 'leakdetection' && canReadCandidates });
  const candidateDetailQuery = useQuery({ queryKey: leakQueryKeys.candidate(selectedCandidateId), queryFn: () => fetchLeakCandidate(selectedCandidateId), enabled: tab === 'leakdetection' && canReadCandidates && Boolean(selectedCandidateId) });
  const casesQuery = useQuery({ queryKey: leakQueryKeys.cases(caseListParams), queryFn: () => fetchLeakCases(caseListParams), enabled: tab === 'leakdetection' && canReadCases });
  const caseDetailQuery = useQuery({ queryKey: leakQueryKeys.case(selectedCaseId), queryFn: () => fetchLeakCase(selectedCaseId), enabled: tab === 'leakdetection' && canReadCases && Boolean(selectedCaseId) });

  const incidents = incidentsQuery.data?.content ?? [];
  const candidates = candidatesQuery.data?.content ?? [];
  const leakCases = casesQuery.data?.content ?? [];
  const incidentError = incidentsQuery.error ?? incidentDetailQuery.error;
  const leakError = candidatesQuery.error ?? candidateDetailQuery.error ?? casesQuery.error ?? caseDetailQuery.error;

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

        {tab === 'hse' ? <Alert severity="info">HSE case/CAPA query contract is pending HidraAPI issue #64. HidraWeb does not infer HSE reads or lifecycle state.</Alert> : null}

        {tab === 'incidents' ? (
          <>
            {!incidentReadDescriptor ? <Alert severity="warning">HidraAPI did not publish a GET route-permission descriptor for the incident register. The workspace fails closed.</Alert> : null}
            {incidentReadDescriptor && !canReadIncidents ? <Alert severity="warning">You do not have the backend-published permission required to read incidents.</Alert> : null}
            {incidentError ? <Alert severity="error">{displayError(incidentError, 'incident')}</Alert> : null}
            {canReadIncidents ? (
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: selectedIncidentId ? 'minmax(0, 1.5fr) minmax(380px, 0.8fr)' : '1fr' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                      <Box><Typography component="h2" variant="h6">Incident register</Typography><Typography color="text.secondary" variant="caption">{incidents.length} loaded of {incidentsQuery.data?.totalElements ?? incidents.length}</Typography></Box>
                      <Button onClick={() => void incidentsQuery.refetch()}>Refresh</Button>
                    </Box>
                    {incidents.length ? (
                      <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Number</TableCell><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Priority</TableCell><TableCell>Asset</TableCell><TableCell>Updated</TableCell><TableCell /></TableRow></TableHead><TableBody>{incidents.map((incident, index) => <IncidentRow incident={incident} key={incident.id ?? `incident-${index}`} onOpen={() => setSelectedIncidentId(incident.id ?? '')} />)}</TableBody></Table></TableContainer>
                    ) : !incidentsQuery.isLoading && !incidentsQuery.error ? <Alert severity="info">No incidents were returned by HidraAPI.</Alert> : null}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button><Typography variant="caption">Page {page + 1} of {Math.max(incidentsQuery.data?.totalPages ?? 1, 1)}</Typography><Button disabled={!incidentsQuery.data?.hasNext} onClick={() => setPage((value) => value + 1)}>Next</Button></Box>
                  </Stack>
                </Paper>
                {selectedIncidentId && incidentDetailQuery.data ? <IncidentDetail incident={incidentDetailQuery.data} onClose={() => setSelectedIncidentId('')} /> : null}
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
            {leakError ? <Alert severity="error">{displayError(leakError, 'leak detection')}</Alert> : null}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
              {canReadCandidates ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}><Box><Typography component="h2" variant="h6">Leak candidates</Typography><Typography color="text.secondary" variant="caption">{candidates.length} loaded of {candidatesQuery.data?.totalElements ?? candidates.length}</Typography></Box><Button onClick={() => void candidatesQuery.refetch()}>Refresh</Button></Box>
                    {candidates.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Candidate</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Confidence</TableCell><TableCell>Asset</TableCell><TableCell /></TableRow></TableHead><TableBody>{candidates.map((candidate, index) => <TableRow hover key={candidate.id ?? `candidate-${index}`}><TableCell>{candidate.candidateNumber ?? candidate.id ?? '—'}</TableCell><TableCell><Chip label={candidate.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(candidate.severityLevel)}</TableCell><TableCell>{valueOrDash(candidate.confidenceScore)}</TableCell><TableCell>{candidate.topologyAssetName ?? candidate.topologyAssetCode ?? candidate.topologyAssetId ?? '—'}</TableCell><TableCell><Button onClick={() => setSelectedCandidateId(candidate.id ?? '')} size="small">Open</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : !candidatesQuery.isLoading && !candidatesQuery.error ? <Alert severity="info">No leak candidates were returned by HidraAPI.</Alert> : null}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={candidatePage === 0} onClick={() => setCandidatePage((value) => Math.max(0, value - 1))}>Previous</Button><Typography variant="caption">Page {candidatePage + 1} of {Math.max(candidatesQuery.data?.totalPages ?? 1, 1)}</Typography><Button disabled={!candidatesQuery.data?.hasNext} onClick={() => setCandidatePage((value) => value + 1)}>Next</Button></Box>
                  </Stack>
                </Paper>
              ) : null}
              {canReadCases ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}><Box><Typography component="h2" variant="h6">Leak cases</Typography><Typography color="text.secondary" variant="caption">{leakCases.length} loaded of {casesQuery.data?.totalElements ?? leakCases.length}</Typography></Box><Button onClick={() => void casesQuery.refetch()}>Refresh</Button></Box>
                    {leakCases.length ? <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Case</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Confidence</TableCell><TableCell>Asset</TableCell><TableCell /></TableRow></TableHead><TableBody>{leakCases.map((leakCase, index) => <TableRow hover key={leakCase.id ?? `leak-case-${index}`}><TableCell>{leakCase.caseNumber ?? leakCase.id ?? '—'}</TableCell><TableCell><Chip label={leakCase.status ?? '—'} size="small" variant="outlined" /></TableCell><TableCell>{valueOrDash(leakCase.severityLevel)}</TableCell><TableCell>{valueOrDash(leakCase.confidenceScore)}</TableCell><TableCell>{leakCase.topologyAssetCode ?? leakCase.topologyAssetId ?? '—'}</TableCell><TableCell><Button onClick={() => setSelectedCaseId(leakCase.id ?? '')} size="small">Open</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : !casesQuery.isLoading && !casesQuery.error ? <Alert severity="info">No leak cases were returned by HidraAPI.</Alert> : null}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Button disabled={casePage === 0} onClick={() => setCasePage((value) => Math.max(0, value - 1))}>Previous</Button><Typography variant="caption">Page {casePage + 1} of {Math.max(casesQuery.data?.totalPages ?? 1, 1)}</Typography><Button disabled={!casesQuery.data?.hasNext} onClick={() => setCasePage((value) => value + 1)}>Next</Button></Box>
                  </Stack>
                </Paper>
              ) : null}
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
              {selectedCandidateId && candidateDetailQuery.data ? <LeakCandidateDetail candidate={candidateDetailQuery.data} onClose={() => setSelectedCandidateId('')} /> : null}
              {selectedCaseId && caseDetailQuery.data ? <LeakCaseDetail leakCase={caseDetailQuery.data} onClose={() => setSelectedCaseId('')} /> : null}
            </Box>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  );
}
