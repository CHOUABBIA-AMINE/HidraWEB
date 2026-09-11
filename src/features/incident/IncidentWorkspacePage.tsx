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
import { fetchIncident, fetchIncidents, incidentQueryKeys } from '@/features/incident/api/incidentApi';
import { usePermissions } from '@/features/permissions/usePermissions';

const PAGE_SIZE = 50;
const INCIDENT_LIST_ROUTE = '/api/v1/incident/incidents';

type EventWorkspaceTab = 'incidents' | 'leakdetection' | 'hse';

function displayError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? 'HidraAPI refused incident access.' : normalized.message || 'Incident data could not be loaded.';
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

export function IncidentWorkspacePage() {
  const permissions = usePermissions();
  const [tab, setTab] = useState<EventWorkspaceTab>('incidents');
  const [page, setPage] = useState(0);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');

  const readDescriptor = useMemo(
    () => permissions.routes.find((descriptor) => descriptor.route === INCIDENT_LIST_ROUTE && descriptor.methods.includes('GET')),
    [permissions.routes],
  );
  const canReadIncidents = Boolean(readDescriptor?.permission && permissions.can(readDescriptor.permission));
  const listParams = useMemo(() => ({ page, size: PAGE_SIZE }), [page]);
  const incidentsQuery = useQuery({
    queryKey: incidentQueryKeys.list(listParams),
    queryFn: () => fetchIncidents(listParams),
    enabled: tab === 'incidents' && canReadIncidents,
  });
  const detailQuery = useQuery({
    queryKey: incidentQueryKeys.detail(selectedIncidentId),
    queryFn: () => fetchIncident(selectedIncidentId),
    enabled: tab === 'incidents' && canReadIncidents && Boolean(selectedIncidentId),
  });

  const incidents = incidentsQuery.data?.content ?? [];
  const totalPages = Math.max(incidentsQuery.data?.totalPages ?? 1, 1);
  const firstError = incidentsQuery.error ?? detailQuery.error;

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

        {tab === 'leakdetection' ? <Alert severity="info">Leak candidate/case query contract is pending HidraAPI issue #63. HidraWeb does not infer leak reads from persistence or command responses.</Alert> : null}
        {tab === 'hse' ? <Alert severity="info">HSE case/CAPA query contract is pending HidraAPI issue #64. HidraWeb does not infer HSE reads or lifecycle state.</Alert> : null}

        {tab === 'incidents' ? (
          <>
            {!readDescriptor ? <Alert severity="warning">HidraAPI did not publish a GET route-permission descriptor for the incident register. The workspace fails closed.</Alert> : null}
            {readDescriptor && !canReadIncidents ? <Alert severity="warning">You do not have the backend-published permission required to read incidents.</Alert> : null}
            {firstError ? <Alert severity="error">{displayError(firstError)}</Alert> : null}

            {canReadIncidents ? (
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: selectedIncidentId ? 'minmax(0, 1.5fr) minmax(380px, 0.8fr)' : '1fr' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                      <Box>
                        <Typography component="h2" variant="h6">Incident register</Typography>
                        <Typography color="text.secondary" variant="caption">{incidents.length} loaded of {incidentsQuery.data?.totalElements ?? incidents.length}</Typography>
                      </Box>
                      <Button onClick={() => void incidentsQuery.refetch()}>Refresh</Button>
                    </Box>
                    {incidents.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead><TableRow><TableCell>Number</TableCell><TableCell>Title</TableCell><TableCell>Status</TableCell><TableCell>Severity</TableCell><TableCell>Priority</TableCell><TableCell>Asset</TableCell><TableCell>Updated</TableCell><TableCell /></TableRow></TableHead>
                          <TableBody>{incidents.map((incident, index) => <IncidentRow incident={incident} key={incident.id ?? `incident-${index}`} onOpen={() => setSelectedIncidentId(incident.id ?? '')} />)}</TableBody>
                        </Table>
                      </TableContainer>
                    ) : !incidentsQuery.isLoading && !incidentsQuery.error ? <Alert severity="info">No incidents were returned by HidraAPI.</Alert> : null}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</Button>
                      <Typography variant="caption">Page {page + 1} of {totalPages}</Typography>
                      <Button disabled={!incidentsQuery.data?.hasNext} onClick={() => setPage((value) => value + 1)}>Next</Button>
                    </Box>
                  </Stack>
                </Paper>

                {selectedIncidentId && detailQuery.data ? <IncidentDetail incident={detailQuery.data} onClose={() => setSelectedIncidentId('')} /> : null}
              </Box>
            ) : null}
          </>
        ) : null}
      </Stack>
    </Container>
  );
}
