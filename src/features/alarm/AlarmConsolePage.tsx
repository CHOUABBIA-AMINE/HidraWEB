import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  MenuItem,
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
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { AcknowledgeAlarmRequest, AlarmView, CloseAlarmRequest, ShelveAlarmRequest, ShelvingView } from '@/api/generated/alarm/model';
import {
  acknowledgeAlarmWithReadback,
  AlarmAcknowledgementReadbackError,
  alarmQueryKeys,
  closeAlarm as closeAlarmRecord,
  fetchAlarm,
  fetchAlarms,
  fetchShelvings,
  shelveAlarm,
  unshelveAlarm,
} from '@/features/alarm/api/alarmApi';
import { ALARM_PERMISSIONS } from '@/features/alarm/api/alarmPermissions';
import { AlarmSuppressionPanel } from '@/features/alarm/AlarmSuppressionPanel';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useAuth } from '@/app/auth/useAuth';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { readLocalTab, writeLocalTab } from '@/shell/navigation/localTabRoute';

const PAGE_SIZE = 50;
const ALARM_STATES = ['RAISED', 'ACTIVE', 'ACKNOWLEDGED', 'SHELVED', 'SUPPRESSED', 'CLEARED', 'CLOSED', 'ESCALATED', 'CANCELLED'] as const;
const CLOSURE_TYPES = ['NORMALIZED', 'FALSE_ALARM', 'DUPLICATE', 'MAINTENANCE', 'CANCELLED', 'ESCALATED_TO_INCIDENT'] as const;

type AlarmViewMode = 'active' | 'history';

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function toIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function displayError(error: unknown): string {
  const normalized = normalizeHidraApiError(error);
  return [401, 403, 404].includes(normalized.status ?? 0) ? 'Alarm data is unavailable.' : normalized.message || 'Alarm data could not be loaded.';
}

function stateColor(state?: string): 'default' | 'error' | 'warning' | 'info' | 'success' {
  switch (state) {
    case 'RAISED':
    case 'ACTIVE':
    case 'ESCALATED': return 'error';
    case 'SHELVED': return 'warning';
    case 'ACKNOWLEDGED': return 'info';
    case 'CLEARED':
    case 'CLOSED': return 'success';
    default: return 'default';
  }
}

function alarmTitle(alarm: AlarmView, language: string): string {
  if (language.startsWith('ar')) return alarm.titleAr ?? alarm.titleFr ?? alarm.titleEn ?? alarm.alarmNumber ?? alarm.id ?? '—';
  if (language.startsWith('en')) return alarm.titleEn ?? alarm.titleFr ?? alarm.titleAr ?? alarm.alarmNumber ?? alarm.id ?? '—';
  return alarm.titleFr ?? alarm.titleEn ?? alarm.titleAr ?? alarm.alarmNumber ?? alarm.id ?? '—';
}

function AlarmRow({ alarm, language, onOpen, openLabel }: { alarm: AlarmView; language: string; onOpen: () => void; openLabel: string }) {
  return (
    <TableRow hover>
      <TableCell>{alarmTitle(alarm, language)}</TableCell>
      <TableCell><Chip color={stateColor(alarm.currentState)} label={alarm.currentState ?? '—'} size="small" variant="outlined" /></TableCell>
      <TableCell>{alarm.severityId ? <Chip label={alarm.severityId} size="small" variant="outlined" /> : '—'}</TableCell>
      <TableCell>{alarm.priorityId ?? '—'}</TableCell>
      <TableCell>{alarm.raisedAt ?? '—'}</TableCell>
      <TableCell>{alarm.topologyAssetName ?? alarm.topologyAssetCode ?? alarm.topologyAssetId ?? '—'}</TableCell>
      <TableCell><Button onClick={onOpen} size="small">{openLabel}</Button></TableCell>
    </TableRow>
  );
}

export function isActiveShelving(shelving: ShelvingView): boolean {
  return Boolean(shelving.id) && shelving.status === 'ACTIVE' && !shelving.unshelvedAt;
}

function ShelvingRow({ shelving, canExecute, busy, onUnshelve, t }: { shelving: ShelvingView; canExecute: boolean; busy: boolean; onUnshelve: () => void; t: (key: string) => string }) {
  const active = isActiveShelving(shelving);
  return (
    <TableRow>
      <TableCell>{shelving.status ?? '—'}</TableCell>
      <TableCell>{shelving.shelvingReasonId ?? shelving.reasonText ?? '—'}</TableCell>
      <TableCell>{shelving.shelvedAt ?? '—'}</TableCell>
      <TableCell>{shelving.shelvedUntil ?? '—'}</TableCell>
      <TableCell>{shelving.shelvedByActorId ?? '—'}</TableCell>
      <TableCell>{active && canExecute ? <Button disabled={busy} onClick={onUnshelve} size="small">{t('alarm.unshelve')}</Button> : shelving.unshelvedAt ?? '—'}</TableCell>
    </TableRow>
  );
}

export function AlarmConsolePage() {
  const auth = useAuth();
  const context = useShellUiStore(state => state.operationalContext);
  const permissions = usePermissions();
  const [searchParams] = useSearchParams();
  const scope = JSON.stringify([auth.session?.principal?.userId, auth.session?.sessionId,
    context?.scopeId, context?.companyPartyId, context?.targetId,
    readLocalTab(searchParams.get('tab'), ['active', 'history'] as const, 'active'), permissions.status, [...permissions.permissions].sort()]);
  return <ScopedAlarmConsole key={scope} scope={scope} />;
}

function ScopedAlarmConsole({ scope }: { scope: string }) {
  const { t, i18n } = useTranslation();
  const permissions = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = readLocalTab(searchParams.get('tab'), ['active', 'history'] as const, 'active');
  const [page, setPage] = useState(0);
  const [selectedAlarmId, setSelectedAlarmId] = useState('');
  const [selectionEpoch, setSelectionEpoch] = useState(0);
  const [readDenied, setReadDenied] = useState(false);
  const [readbackUnconfirmed, setReadbackUnconfirmed] = useState(false);
  const [draftFilters, setDraftFilters] = useState({ state: '', severityId: '', topologyAssetId: '', from: '', to: '' });
  const [filters, setFilters] = useState(draftFilters);
  const [ackForm, setAckForm] = useState({ organizationUnitId: '', organizationUnitCode: '', comment: '' });
  const [closeForm, setCloseForm] = useState({ closureType: 'NORMALIZED', closureReasonId: '', closureComment: '', requiresReview: false, reviewWorkflowInstanceId: '' });
  const [shelveForm, setShelveForm] = useState({ shelvingReasonId: '', reasonText: '', shelvedUntil: '' });
  const [suppressionBusy, setSuppressionBusy] = useState(false);

  const canRead = permissions.can(ALARM_PERMISSIONS.read);
  const canExecute = permissions.can(ALARM_PERMISSIONS.execute);
  const canSuppressionRead = permissions.can(ALARM_PERMISSIONS.suppressionRead);
  const canSuppressionExecute = permissions.can(ALARM_PERMISSIONS.suppressionExecute);
  const listParams = useMemo(() => ({
    view,
    state: optional(filters.state),
    severityId: optional(filters.severityId),
    topologyAssetId: optional(filters.topologyAssetId),
    from: toIso(filters.from),
    to: toIso(filters.to),
    page,
    size: PAGE_SIZE,
  }), [filters, page, view]);

  const alarmsQuery = useQuery({ queryKey: [...alarmQueryKeys.list(listParams), scope], queryFn: () => fetchAlarms(listParams), enabled: canRead, retry: false, refetchOnMount: 'always' });
  const detailQuery = useQuery({ queryKey: [...alarmQueryKeys.detail(selectedAlarmId), scope, selectionEpoch], queryFn: ({ signal }) => fetchAlarm(selectedAlarmId, signal), enabled: canRead && Boolean(selectedAlarmId), retry: false, refetchOnMount: 'always' });
  const shelvingQuery = useQuery({ queryKey: [...alarmQueryKeys.shelvings(selectedAlarmId), scope, selectionEpoch], queryFn: () => fetchShelvings(selectedAlarmId), enabled: canRead && Boolean(selectedAlarmId) && detailQuery.isSuccess, retry: false });

  const refreshAlarmData = async () => {
    await queryClient.invalidateQueries({ queryKey: alarmQueryKeys.all });
  };

  const acknowledgeMutation = useMutation({
    mutationFn: () => {
      const request: AcknowledgeAlarmRequest = {
        alarmId: selectedAlarmId,
        organizationUnitId: optional(ackForm.organizationUnitId),
        organizationUnitCode: optional(ackForm.organizationUnitCode),
        comment: optional(ackForm.comment),
      };
      return acknowledgeAlarmWithReadback(request);
    },
    onSuccess: refreshAlarmData,
  });

  const closeMutation = useMutation({
    mutationFn: () => {
      const request: CloseAlarmRequest = {
        alarmId: selectedAlarmId,
        closureType: closeForm.closureType as CloseAlarmRequest['closureType'],
        closureReasonId: optional(closeForm.closureReasonId),
        closureComment: optional(closeForm.closureComment),
        requiresReview: closeForm.requiresReview,
        reviewWorkflowInstanceId: closeForm.requiresReview ? optional(closeForm.reviewWorkflowInstanceId) : undefined,
      };
      return closeAlarmRecord(request);
    },
    onSuccess: refreshAlarmData,
  });

  const shelveMutation = useMutation({
    mutationFn: () => {
      const request: ShelveAlarmRequest = {
        shelvingReasonId: shelveForm.shelvingReasonId.trim(),
        reasonText: optional(shelveForm.reasonText),
        shelvedUntil: toIso(shelveForm.shelvedUntil),
      };
      return shelveAlarm(selectedAlarmId, request);
    },
    onSuccess: refreshAlarmData,
  });

  const unshelveMutation = useMutation({
    mutationFn: (shelvingId: string) => unshelveAlarm(selectedAlarmId, shelvingId),
    onSuccess: refreshAlarmData,
  });

  const alarmMutationBusy = acknowledgeMutation.isPending || closeMutation.isPending || shelveMutation.isPending || unshelveMutation.isPending;
  const mutationBusy = alarmMutationBusy || suppressionBusy;
  const mutationError = acknowledgeMutation.error ?? closeMutation.error ?? shelveMutation.error ?? unshelveMutation.error;
  const mutationSucceeded = Boolean(acknowledgeMutation.data ?? closeMutation.data ?? shelveMutation.data ?? unshelveMutation.data);
  const firstError = alarmsQuery.error ?? detailQuery.error ?? shelvingQuery.error;
  const list = canRead && alarmsQuery.isSuccess && alarmsQuery.isFetchedAfterMount && !alarmsQuery.isFetching ? alarmsQuery.data : undefined;
  // Never display a previous successful response following a protected read failure.
  const detail = canRead && !alarmsQuery.isError && detailQuery.isSuccess && detailQuery.isFetchedAfterMount && detailQuery.data.id === selectedAlarmId
    ? detailQuery.data : undefined;
  const shelvings = detail && shelvingQuery.isSuccess && shelvingQuery.isFetchedAfterMount ? shelvingQuery.data : [];
  const alarms = list?.content ?? [];
  const totalPages = Math.max(list?.totalPages ?? 1, 1);
  const actionDisabled = mutationBusy || detailQuery.isFetching || alarmsQuery.isFetching || shelvingQuery.isError;
  const unconfirmed = mutationError instanceof AlarmAcknowledgementReadbackError;
  const denied = Boolean(selectedAlarmId) && (!canRead || alarmsQuery.isError || detailQuery.isError
    || shelvingQuery.isError || unconfirmed || [401, 403, 404].includes(normalizeHidraApiError(mutationError).status ?? 0));
  // A failed fresh read retires the selection; a later refresh cannot resurrect it.
  if (denied) {
    setReadDenied(true);
    setReadbackUnconfirmed(unconfirmed);
    setSelectedAlarmId('');
  }

  function selectAlarm(id: string) {
    acknowledgeMutation.reset();
    closeMutation.reset();
    shelveMutation.reset();
    unshelveMutation.reset();
    setAckForm({ organizationUnitId: '', organizationUnitCode: '', comment: '' });
    setCloseForm({ closureType: 'NORMALIZED', closureReasonId: '', closureComment: '', requiresReview: false, reviewWorkflowInstanceId: '' });
    setShelveForm({ shelvingReasonId: '', reasonText: '', shelvedUntil: '' });
    setSuppressionBusy(false);
    setReadDenied(false);
    setReadbackUnconfirmed(false);
    if (id) queryClient.removeQueries({ queryKey: alarmQueryKeys.suppressions({ alarmId: id, page: 0, size: 50 }), exact: true });
    setSelectionEpoch(value => value + 1);
    setSelectedAlarmId(id);
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography color="text.secondary" variant="overline">HWEB-008</Typography>
            <Typography component="h1" variant="h4">{t('alarm.title')}</Typography>
            <Typography color="text.secondary">{t('alarm.subtitle')}</Typography>
          </Box>
          <Chip label={t('alarm.authoritative')} variant="outlined" />
        </Box>

        <Alert severity="info">{t('alarm.realtimeNotice')}</Alert>
        <Alert severity="info">{t('alarm.suppressionNotice')}</Alert>
        {!canRead ? <Alert severity="warning">{t('alarm.unavailable')}</Alert> : null}
        {firstError ? <Alert severity="error">{displayError(firstError)}</Alert> : null}
        {readDenied ? <Alert severity="warning">{t(readbackUnconfirmed ? 'alarm.readbackUnconfirmed' : 'alarm.selectionUnavailable')}</Alert> : null}

        {canRead ? (
          <>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Tabs onChange={(_, value: AlarmViewMode) => {
                     selectAlarm('');
                     setPage(0);
                     setSearchParams((previous) => writeLocalTab(previous, value, ['active', 'history'] as const, 'active'));
                   }} value={view}>
                    <Tab label={t('alarm.active')} value="active" />
                    <Tab label={t('alarm.history')} value="history" />
                  </Tabs>
                  <Button onClick={() => void refreshAlarmData()}>{t('alarm.refresh')}</Button>
                </Box>
                <Typography component="h2" variant="subtitle1">{t('alarm.filters')}</Typography>
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(5, minmax(150px, 1fr))' } }}>
                  <TextField label={t('alarm.state')} onChange={(event) => setDraftFilters({ ...draftFilters, state: event.target.value })} select size="small" value={draftFilters.state}>
                    <MenuItem value="">{t('alarm.allStates')}</MenuItem>
                    {ALARM_STATES.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                  </TextField>
                  <TextField label={t('alarm.severity')} onChange={(event) => setDraftFilters({ ...draftFilters, severityId: event.target.value })} size="small" value={draftFilters.severityId} />
                  <TextField label={t('alarm.topologyAssetId')} onChange={(event) => setDraftFilters({ ...draftFilters, topologyAssetId: event.target.value })} size="small" value={draftFilters.topologyAssetId} />
                  <TextField label={t('alarm.from')} onChange={(event) => setDraftFilters({ ...draftFilters, from: event.target.value })} size="small" slotProps={{ inputLabel: { shrink: true } }} type="datetime-local" value={draftFilters.from} />
                  <TextField label={t('alarm.to')} onChange={(event) => setDraftFilters({ ...draftFilters, to: event.target.value })} size="small" slotProps={{ inputLabel: { shrink: true } }} type="datetime-local" value={draftFilters.to} />
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => { selectAlarm(''); setFilters(draftFilters); setPage(0); }} variant="contained">{t('alarm.apply')}</Button>
                  <Button onClick={() => { const empty = { state: '', severityId: '', topologyAssetId: '', from: '', to: '' }; selectAlarm(''); setDraftFilters(empty); setFilters(empty); setPage(0); }}>{t('alarm.clear')}</Button>
                </Stack>
              </Stack>
            </Paper>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: selectedAlarmId ? 'minmax(0, 1.4fr) minmax(420px, 0.9fr)' : '1fr' } }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography color="text.secondary" variant="caption">{list ? t('alarm.loaded', { loaded: alarms.length, total: list.totalElements ?? alarms.length }) : '—'}</Typography>
                {alarms.length ? (
                  <TableContainer sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>{t('alarm.alarm')}</TableCell><TableCell>{t('alarm.state')}</TableCell><TableCell>{t('alarm.severity')}</TableCell><TableCell>{t('alarm.priority')}</TableCell><TableCell>{t('alarm.raised')}</TableCell><TableCell>{t('alarm.asset')}</TableCell><TableCell /></TableRow></TableHead>
                      <TableBody>{alarms.map((alarm, index) => <AlarmRow alarm={alarm} key={alarm.id ?? `alarm-${index}`} language={i18n.language} onOpen={() => selectAlarm(alarm.id ?? '')} openLabel={t('alarm.open')} />)}</TableBody>
                    </Table>
                  </TableContainer>
                ) : !alarmsQuery.isLoading && !alarmsQuery.error ? <Alert severity="info" sx={{ mt: 2 }}>{t('alarm.empty')}</Alert> : null}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Button disabled={page === 0} onClick={() => { selectAlarm(''); setPage((value) => Math.max(0, value - 1)); }}>{t('alarm.previous')}</Button>
                  <Typography variant="caption">{t('alarm.page', { page: page + 1, totalPages })}</Typography>
                  <Button disabled={!list?.hasNext} onClick={() => { selectAlarm(''); setPage((value) => value + 1); }}>{t('alarm.next')}</Button>
                </Box>
              </Paper>

              {selectedAlarmId && detail && !denied ? (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="overline">{t('alarm.detail')}</Typography>
                        <Typography component="h2" variant="h6">{alarmTitle(detail, i18n.language)}</Typography>
                      </Box>
                      <Button onClick={() => selectAlarm('')} size="small">{t('alarm.closePanel')}</Button>
                    </Box>
                    {detail ? (
                      <Box sx={{ display: 'grid', gap: 0.75, gridTemplateColumns: '1fr 1fr' }}>
                        <Typography>{t('alarm.number')}: {detail.alarmNumber ?? '—'}</Typography><Typography>{t('alarm.type')}: {detail.alarmTypeId ?? '—'}</Typography>
                        <Typography>{t('alarm.state')}: {detail.currentState ?? '—'}</Typography><Typography>{t('alarm.severity')}: {detail.severityId ?? '—'}</Typography>
                        <Typography>{t('alarm.priority')}: {detail.priorityId ?? '—'}</Typography><Typography>{t('alarm.source')}: {detail.sourceType ?? '—'} {detail.sourceReferenceId ?? ''}</Typography>
                        <Typography>{t('alarm.raised')}: {detail.raisedAt ?? '—'}</Typography><Typography>{t('alarm.firstDetected')}: {detail.firstDetectedAt ?? '—'}</Typography>
                        <Typography>{t('alarm.acknowledged')}: {detail.acknowledgedAt ?? '—'}</Typography><Typography>{t('alarm.acknowledgedBy')}: {detail.acknowledgedByActorId ?? '—'}</Typography><Typography>{t('alarm.cleared')}: {detail.clearedAt ?? '—'}</Typography>
                        <Typography>{t('alarm.closed')}: {detail.closedAt ?? '—'}</Typography><Typography>{t('alarm.correlation')}: {detail.correlationId ?? '—'}</Typography>
                      </Box>
                    ) : null}

                    {detail?.topologyAssetId ? <><Divider /><Box><Typography component="h3" variant="subtitle1">{t('alarm.topologyContext')}</Typography><Typography>{detail.topologyAssetName ?? detail.topologyAssetCode ?? detail.topologyAssetId}</Typography><Button onClick={() => navigate('/network')} size="small">{t('alarm.openNetwork')}</Button></Box></> : null}
                    {detail?.workflowInstanceId ? <Box><Typography component="h3" variant="subtitle1">{t('alarm.workflowContext')}</Typography><Typography>{detail.workflowInstanceId}</Typography><Button onClick={() => navigate(`/work/tasks?instanceId=${encodeURIComponent(detail.workflowInstanceId ?? '')}`)} size="small">{t('alarm.openTasks')}</Button></Box> : null}
                    {detail?.topologyAssetCode || detail?.topologyAssetId ? <Button onClick={() => navigate(`/network?query=${encodeURIComponent(detail.topologyAssetCode ?? detail.topologyAssetId ?? '')}`)} size="small">Open topology context</Button> : null}

                    <Divider />
                    <Box>
                      <Typography component="h3" variant="subtitle1">{t('alarm.shelvingHistory')}</Typography>
                      {shelvings.length ? <TableContainer sx={{ mt: 1 }}><Table size="small"><TableHead><TableRow><TableCell>{t('alarm.status')}</TableCell><TableCell>{t('alarm.reason')}</TableCell><TableCell>{t('alarm.when')}</TableCell><TableCell>{t('alarm.shelvedUntil')}</TableCell><TableCell>{t('alarm.actor')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{shelvings.map((shelving, index) => <ShelvingRow busy={actionDisabled} canExecute={canExecute} key={shelving.id ?? `shelving-${index}`} onUnshelve={() => shelving.id && unshelveMutation.mutate(shelving.id)} shelving={shelving} t={t} />)}</TableBody></Table></TableContainer> : !shelvingQuery.isLoading && !shelvingQuery.error ? <Typography color="text.secondary" sx={{ mt: 1 }}>{t('alarm.noShelving')}</Typography> : null}
                    </Box>

                    <Divider />
                    <AlarmSuppressionPanel key={selectionEpoch} alarmId={selectedAlarmId} canExecute={canSuppressionExecute} canRead={canSuppressionRead} disabled={actionDisabled} onBusyChange={setSuppressionBusy} />

                    <Divider />
                    <Typography component="h3" variant="subtitle1">{t('alarm.actions')}</Typography>
                    {!canExecute ? <Alert severity="warning">{t('alarm.executeUnavailable')}</Alert> : null}
                    {canExecute ? <Alert severity="warning">{t('alarm.attributionNotice')}</Alert> : null}
                    {mutationError ? <Alert severity="error">{displayError(mutationError)}</Alert> : null}
                    {mutationSucceeded && !mutationError && !actionDisabled ? <Alert severity="success">{t('alarm.mutationSuccess')}</Alert> : null}
                    {mutationBusy ? <Typography color="text.secondary" variant="caption">{t('alarm.mutationPending')}</Typography> : null}

                    {canExecute ? (
                      <Stack spacing={2}>
                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography component="h4" variant="subtitle2">{t('alarm.acknowledge')}</Typography>
                          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 1 }}>
                            <TextField label={t('alarm.organizationUnitId')} onChange={(e) => setAckForm({ ...ackForm, organizationUnitId: e.target.value })} size="small" value={ackForm.organizationUnitId} />
                            <TextField label={t('alarm.organizationUnitCode')} onChange={(e) => setAckForm({ ...ackForm, organizationUnitCode: e.target.value })} size="small" value={ackForm.organizationUnitCode} />
                            <TextField label={t('alarm.comment')} multiline onChange={(e) => setAckForm({ ...ackForm, comment: e.target.value })} size="small" value={ackForm.comment} />
                          </Box>
                          <Button disabled={actionDisabled} onClick={() => acknowledgeMutation.mutate()} sx={{ mt: 1 }} variant="contained">{t('alarm.acknowledge')}</Button>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography component="h4" variant="subtitle2">{t('alarm.closeAlarm')}</Typography>
                          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 1 }}>
                            <TextField label={t('alarm.closureType')} onChange={(e) => setCloseForm({ ...closeForm, closureType: e.target.value })} select size="small" value={closeForm.closureType}>{CLOSURE_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
                            <TextField label={t('alarm.closureReasonId')} onChange={(e) => setCloseForm({ ...closeForm, closureReasonId: e.target.value })} size="small" value={closeForm.closureReasonId} />
                            <TextField label={t('alarm.comment')} multiline onChange={(e) => setCloseForm({ ...closeForm, closureComment: e.target.value })} size="small" value={closeForm.closureComment} />
                            <FormControlLabel control={<Checkbox checked={closeForm.requiresReview} onChange={(e) => setCloseForm({ ...closeForm, requiresReview: e.target.checked })} />} label={t('alarm.requiresReview')} />
                            {closeForm.requiresReview ? <TextField label={t('alarm.reviewWorkflowInstanceId')} onChange={(e) => setCloseForm({ ...closeForm, reviewWorkflowInstanceId: e.target.value })} size="small" value={closeForm.reviewWorkflowInstanceId} /> : null}
                          </Box>
                          <Button disabled={actionDisabled} onClick={() => closeMutation.mutate()} sx={{ mt: 1 }} variant="outlined">{t('alarm.closeAlarm')}</Button>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 1.5 }}>
                          <Typography component="h4" variant="subtitle2">{t('alarm.shelving')}</Typography>
                          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 1 }}>
                            <TextField label={t('alarm.shelvingReasonId')} onChange={(e) => setShelveForm({ ...shelveForm, shelvingReasonId: e.target.value })} required size="small" value={shelveForm.shelvingReasonId} />
                            <TextField label={t('alarm.shelvedUntil')} onChange={(e) => setShelveForm({ ...shelveForm, shelvedUntil: e.target.value })} size="small" slotProps={{ inputLabel: { shrink: true } }} type="datetime-local" value={shelveForm.shelvedUntil} />
                            <TextField label={t('alarm.reasonText')} multiline onChange={(e) => setShelveForm({ ...shelveForm, reasonText: e.target.value })} size="small" value={shelveForm.reasonText} />
                          </Box>
                          <Button disabled={actionDisabled || !shelveForm.shelvingReasonId.trim()} onClick={() => shelveMutation.mutate()} sx={{ mt: 1 }} variant="outlined">{t('alarm.shelve')}</Button>
                        </Paper>
                      </Stack>
                    ) : null}
                  </Stack>
                </Paper>
              ) : null}
            </Box>
          </>
        ) : null}
      </Stack>
    </Container>
  );
}
