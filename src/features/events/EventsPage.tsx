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
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { IncidentView } from '@/api/generated/events/model';
import { fetchIncident, fetchIncidents, eventsQueryKeys } from '@/features/events/api/eventsApi';
import { EVENTS_PERMISSIONS } from '@/features/events/api/eventsPermissions';
import { usePermissions } from '@/features/permissions/usePermissions';

const PAGE_SIZE = 50;
type EventsTab = 'incidents' | 'leak' | 'hse';

function value(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function incidentLabel(incident: IncidentView): string {
  return incident.title ?? incident.incidentNumber ?? incident.id ?? '—';
}

function displayError(error: unknown, fallback: string): string {
  const normalized = normalizeHidraApiError(error);
  if (normalized.status === 403) return 'HidraAPI refused incident access.';
  return normalized.message || fallback;
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography color="text.secondary" variant="caption">{label}</Typography>
      <Typography sx={{ overflowWrap: 'anywhere' }} variant="body2">{children}</Typography>
    </Box>
  );
}

export function EventsPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const [tab, setTab] = useState<EventsTab>('incidents');
  const [page, setPage] = useState(0);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');

  const canReadIncidents = permissions.can(EVENTS_PERMISSIONS.incidentRead);
  const listParams = { page, size: PAGE_SIZE };
  const incidentsQuery = useQuery({
    queryKey: eventsQueryKeys.incidents(listParams),
    queryFn: () => fetchIncidents(listParams),
    enabled: canReadIncidents && tab === 'incidents',
  });
  const incidentQuery = useQuery({
    queryKey: eventsQueryKeys.incident(selectedIncidentId),
    queryFn: () => fetchIncident(selectedIncidentId),
    enabled: canReadIncidents && tab === 'incidents' && Boolean(selectedIncidentId),
  });

  const incidents = incidentsQuery.data?.content ?? [];
  const totalPages = Math.max(incidentsQuery.data?.totalPages ?? 1, 1);
  const firstError = incidentsQuery.error ?? incidentQuery.error;
  const detail = incidentQuery.data;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography color="text.secondary" variant="overline">HWEB-009</Typography>
            <Typography component="h1" variant="h4">{t('events.title')}</Typography>
            <Typography color="text.secondary">{t('events.subtitle')}</Typography>
          </Box>
          <Chip label={t('events.authoritative')} variant="outlined" />
        </Box>

        <Alert severity="info">{t('events.queryScope')}</Alert>

        <Paper variant="outlined">
          <Tabs
            onChange={(_, next: EventsTab) => {
              setTab(next);
              setSelectedIncidentId('');
            }}
            value={tab}
          >
            <Tab label={t('events.incidents')} value="incidents" />
            <Tab label={t('events.leakCases')} value="leak" />
            <Tab label={t('events.hseCases')} value="hse" />
          </Tabs>
        </Paper>

        {tab === 'leak' ? <Alert severity="warning">{t('events.leakPending')}</Alert> : null}
        {tab === 'hse' ? <Alert severity="warning">{t('events.hsePending')}</Alert> : null}

        {tab === 'incidents' ? (
          <>
            {!canReadIncidents ? <Alert severity="warning">{t('events.unavailable')}</Alert> : null}
            {firstError ? <Alert severity="error">{displayError(firstError, t('events.loadError'))}</Alert> : null}

            {canReadIncidents ? (
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: selectedIncidentId ? 'minmax(0, 1.45fr) minmax(400px, 0.8fr)' : '1fr' } }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box>
                        <Typography component="h2" variant="h6">{t('events.incidentRegister')}</Typography>
                        <Typography color="text.secondary" variant="caption">
                          {t('events.loaded', { loaded: incidents.length, total: incidentsQuery.data?.totalElements ?? incidents.length })}
                        </Typography>
                      </Box>
                      <Button onClick={() => void incidentsQuery.refetch()}>{t('events.refresh')}</Button>
                    </Box>

                    {incidents.length ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>{t('events.incident')}</TableCell>
                              <TableCell>{t('events.status')}</TableCell>
                              <TableCell>{t('events.severity')}</TableCell>
                              <TableCell>{t('events.priority')}</TableCell>
                              <TableCell>{t('events.reported')}</TableCell>
                              <TableCell>{t('events.asset')}</TableCell>
                              <TableCell>{t('events.responsible')}</TableCell>
                              <TableCell />
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {incidents.map((incident, index) => (
                              <TableRow hover key={incident.id ?? `incident-${index}`}>
                                <TableCell>
                                  <Typography variant="body2">{incidentLabel(incident)}</Typography>
                                  <Typography color="text.secondary" variant="caption">{value(incident.incidentNumber)}</Typography>
                                </TableCell>
                                <TableCell>{incident.status ? <Chip label={incident.status} size="small" variant="outlined" /> : '—'}</TableCell>
                                <TableCell>{value(incident.severityId)}</TableCell>
                                <TableCell>{value(incident.priorityId)}</TableCell>
                                <TableCell>{value(incident.reportedAt)}</TableCell>
                                <TableCell>{value(incident.topologyAssetName ?? incident.topologyAssetCode ?? incident.topologyAssetId)}</TableCell>
                                <TableCell>{value(incident.responsibleActorName ?? incident.responsibleOrganizationUnitName ?? incident.responsibleOrganizationUnitCode)}</TableCell>
                                <TableCell>
                                  <Button disabled={!incident.id} onClick={() => setSelectedIncidentId(incident.id ?? '')} size="small">
                                    {t('events.open')}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : !incidentsQuery.isLoading && !incidentsQuery.error ? <Alert severity="info">{t('events.empty')}</Alert> : null}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>{t('events.previous')}</Button>
                      <Typography variant="caption">{t('events.page', { page: page + 1, totalPages })}</Typography>
                      <Button disabled={!incidentsQuery.data?.hasNext} onClick={() => setPage((current) => current + 1)}>{t('events.next')}</Button>
                    </Box>
                  </Stack>
                </Paper>

                {selectedIncidentId ? (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                        <Box>
                          <Typography color="text.secondary" variant="overline">{t('events.detail')}</Typography>
                          <Typography component="h2" variant="h6">{detail ? incidentLabel(detail) : selectedIncidentId}</Typography>
                          {detail?.incidentNumber ? <Typography color="text.secondary" variant="body2">{detail.incidentNumber}</Typography> : null}
                        </Box>
                        <Button onClick={() => setSelectedIncidentId('')} size="small">{t('events.closeDetail')}</Button>
                      </Box>

                      {detail ? (
                        <>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {detail.status ? <Chip label={detail.status} size="small" variant="outlined" /> : null}
                            {detail.severityId ? <Chip label={`${t('events.severity')}: ${detail.severityId}`} size="small" variant="outlined" /> : null}
                            {detail.priorityId ? <Chip label={`${t('events.priority')}: ${detail.priorityId}`} size="small" variant="outlined" /> : null}
                          </Stack>

                          <DetailField label={t('events.description')}>{value(detail.description)}</DetailField>
                          <Divider />
                          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <DetailField label={t('events.classification')}>{value(detail.classificationId)}</DetailField>
                            <DetailField label={t('events.source')}>{value(detail.sourceType)} · {value(detail.sourceReferenceCode ?? detail.sourceReferenceId)}</DetailField>
                            <DetailField label={t('events.asset')}>{value(detail.topologyAssetName ?? detail.topologyAssetCode ?? detail.topologyAssetId)}</DetailField>
                            <DetailField label={t('events.organization')}>{value(detail.responsibleOrganizationUnitName ?? detail.responsibleOrganizationUnitCode ?? detail.responsibleOrganizationUnitId)}</DetailField>
                            <DetailField label={t('events.actor')}>{value(detail.responsibleActorName ?? detail.responsibleActorId)}</DetailField>
                            <DetailField label={t('events.workflow')}>{value(detail.workflowInstanceId)}</DetailField>
                            <DetailField label={t('events.escalation')}>{value(detail.currentEscalationLevel)}</DetailField>
                            <DetailField label={t('events.location')}>{value(detail.locationDescriptionLt ?? detail.locationDescriptionAr)}</DetailField>
                            <DetailField label={t('events.coordinates')}>{detail.latitude !== undefined && detail.longitude !== undefined ? `${detail.latitude}, ${detail.longitude}` : '—'}</DetailField>
                          </Box>
                          <Divider />
                          <Typography component="h3" variant="subtitle2">{t('events.lifecycle')}</Typography>
                          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                            <DetailField label={t('events.detected')}>{value(detail.detectedAt)}</DetailField>
                            <DetailField label={t('events.reported')}>{value(detail.reportedAt)}</DetailField>
                            <DetailField label={t('events.occurred')}>{value(detail.occurredAt)}</DetailField>
                            <DetailField label={t('events.contained')}>{value(detail.containedAt)}</DetailField>
                            <DetailField label={t('events.resolved')}>{value(detail.resolvedAt)}</DetailField>
                            <DetailField label={t('events.closed')}>{value(detail.closedAt)}</DetailField>
                            <DetailField label={t('events.cancelled')}>{value(detail.cancelledAt)}</DetailField>
                            <DetailField label={t('events.created')}>{value(detail.createdAt)}</DetailField>
                            <DetailField label={t('events.updated')}>{value(detail.updatedAt)}</DetailField>
                          </Box>
                        </>
                      ) : null}
                    </Stack>
                  </Paper>
                ) : null}
              </Box>
            ) : null}
          </>
        ) : null}
      </Stack>
    </Container>
  );
}
