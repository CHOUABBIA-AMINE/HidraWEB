import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import type { DeviationView, MonitoringRuleView } from '@/api/generated/telemetry-monitoring/model';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchDeviations,
  fetchLatestReading,
  fetchMonitoringRules,
  fetchQualityCodes,
  fetchReadings,
  fetchReadingStates,
  fetchTrend,
  telemetryMonitoringQueryKeys,
} from '@/features/telemetry-monitoring/api/telemetryMonitoringApi';
import { TELEMETRY_MONITORING_PERMISSIONS } from '@/features/telemetry-monitoring/api/telemetryMonitoringPermissions';
import { BackendObjectInspector } from '@/features/telemetry-monitoring/components/BackendObjectInspector';
import { TrustedAssetMonitoring } from '@/features/telemetry-monitoring/components/TrustedAssetMonitoring';
import { TrendQualityPanel } from '@/features/telemetry-monitoring/components/TrendQualityPanel';
import { legacyReadingStatus, legacyReadingTimeline } from '@/features/telemetry-monitoring/model/telemetryEvidence';
import { EvidenceTimeline } from '@/shell/evidence/EvidenceTimeline';
import { StatusWithProvenance } from '@/shell/evidence/StatusWithProvenance';
import type { EvidenceEvent, EvidenceState, StatusEvidence } from '@/shell/evidence/evidenceTypes';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

const HISTORY_SIZE = 50;
const MONITORING_SIZE = 50;

function errorMessage(error: unknown, t: (key: string) => string): string {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? t('telemetryMonitoring.error403') : normalized.message || t('telemetryMonitoring.genericError');
}

function dateTimeLocalToIso(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function TelemetryMonitoringPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const drawer = useContextDrawer();
  const [pointInput, setPointInput] = useState('');
  const [pointId, setPointId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [state, setState] = useState('');
  const [detailMode, setDetailMode] = useState<'summary' | 'history' | 'trend'>('summary');

  const canTelemetry = permissions.can(TELEMETRY_MONITORING_PERMISSIONS.telemetryRead);
  const canReference = permissions.can(TELEMETRY_MONITORING_PERMISSIONS.telemetryReferenceRead);
  const canRules = permissions.can(TELEMETRY_MONITORING_PERMISSIONS.monitoringRulesRead);
  const canDeviations = permissions.can(TELEMETRY_MONITORING_PERMISSIONS.monitoringDeviationsRead);

  const readingStatesQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.states,
    queryFn: fetchReadingStates,
    enabled: canReference,
    staleTime: 5 * 60 * 1000,
  });
  const qualityCodesQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.qualityCodes,
    queryFn: fetchQualityCodes,
    enabled: canReference,
    staleTime: 5 * 60 * 1000,
  });

  const historyParams = {
    pointId,
    from: dateTimeLocalToIso(from),
    to: dateTimeLocalToIso(to),
    state: state || undefined,
    page: 0,
    size: HISTORY_SIZE,
  };
  const trendParams = { pointId, from: dateTimeLocalToIso(from), to: dateTimeLocalToIso(to), limit: 1000 };

  const latestQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.latest(pointId),
    queryFn: () => fetchLatestReading(pointId),
    enabled: canTelemetry && Boolean(pointId),
    refetchInterval: 30_000,
  });
  const historyQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.readings(historyParams),
    queryFn: () => fetchReadings(historyParams),
    enabled: canTelemetry && Boolean(pointId) && detailMode === 'history',
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });
  const trendQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.trend(trendParams),
    queryFn: () => fetchTrend(trendParams),
    enabled: canTelemetry && Boolean(pointId) && detailMode === 'trend',
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
  });
  const rulesQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.rules({ page: 0, size: MONITORING_SIZE }),
    queryFn: () => fetchMonitoringRules({ page: 0, size: MONITORING_SIZE }),
    enabled: canRules,
  });
  const deviationsQuery = useQuery({
    queryKey: telemetryMonitoringQueryKeys.deviations({ page: 0, size: MONITORING_SIZE }),
    queryFn: () => fetchDeviations({ page: 0, size: MONITORING_SIZE }),
    enabled: canDeviations,
  });

  const trendReadings = useMemo(
    () => (trendQuery.data ?? []).filter((reading) => reading.pointId === pointId),
    [trendQuery.data, pointId],
  );
  const latestState: EvidenceState<StatusEvidence> = !canTelemetry
    ? { kind: 'denied' }
    : latestQuery.isError ? { kind: 'failed' }
      : latestQuery.isFetching || !latestQuery.isSuccess ? { kind: 'loading' }
        : latestQuery.data?.pointId !== pointId ? { kind: 'unavailable' }
          : { kind: 'ready', value: legacyReadingStatus(latestQuery.data) };
  const historyState: EvidenceState<readonly EvidenceEvent[]> = !canTelemetry
    ? { kind: 'denied' }
    : historyQuery.isError ? { kind: 'failed' }
      : historyQuery.isFetching || !historyQuery.isSuccess ? { kind: 'loading' }
        : { kind: 'ready', value: legacyReadingTimeline(historyQuery.data?.content ?? [], pointId) };
  const rules = rulesQuery.data?.content ?? [];
  const deviations = deviationsQuery.data?.content ?? [];

  const refreshTelemetry = () => {
    if (!canTelemetry || !pointId) return;
    void latestQuery.refetch();
    if (detailMode === 'history') void historyQuery.refetch();
    if (detailMode === 'trend') void trendQuery.refetch();
  };

  const inspectRule = (rule: MonitoringRuleView) => {
    drawer.openDrawer({ title: rule.code ?? rule.id ?? t('telemetryMonitoring.rules'), content: <BackendObjectInspector title={rule.code ?? rule.id ?? 'Rule'} value={rule as unknown as Record<string, unknown>} /> });
  };
  const inspectDeviation = (deviation: DeviationView) => {
    drawer.openDrawer({ title: deviation.id ?? t('telemetryMonitoring.deviations'), content: <BackendObjectInspector title={deviation.id ?? 'Deviation'} value={deviation as unknown as Record<string, unknown>} /> });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box>
            <Typography color="text.secondary" variant="overline">HWEB-006</Typography>
            <Typography component="h1" variant="h4">{t('telemetryMonitoring.title')}</Typography>
            <Typography color="text.secondary">{t('telemetryMonitoring.subtitle')}</Typography>
          </Box>
          <Chip label="QUERY-FIRST" variant="outlined" />
        </Box>

        <Alert severity="info">{t('telemetryMonitoring.realtimeNotice')}</Alert>
        <TrustedAssetMonitoring />

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 1fr) 210px 210px 180px auto' } }}>
            <TextField label={t('telemetryMonitoring.pointId')} onChange={(event) => setPointInput(event.target.value)} size="small" value={pointInput} />
            <TextField label={t('telemetryMonitoring.from')} onChange={(event) => setFrom(event.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} type="datetime-local" value={from} />
            <TextField label={t('telemetryMonitoring.to')} onChange={(event) => setTo(event.target.value)} size="small" slotProps={{ inputLabel: { shrink: true } }} type="datetime-local" value={to} />
            <TextField disabled={!canReference || !readingStatesQuery.data} label={t('telemetryMonitoring.state')} onChange={(event) => setState(event.target.value)} select size="small" value={state}>
              <MenuItem value="">—</MenuItem>
              {(readingStatesQuery.data ?? []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <Button disabled={!canTelemetry || !pointInput.trim()} onClick={() => { setPointId(pointInput.trim()); setDetailMode('summary'); }} variant="contained">{t('telemetryMonitoring.applyPoint')}</Button>
          </Box>
        </Paper>

        {!canTelemetry ? <Alert severity="warning">{t('telemetryMonitoring.telemetryUnavailable')}</Alert> : null}
        {canReference && (readingStatesQuery.error || qualityCodesQuery.error) ? <Alert severity="warning">{t('telemetryMonitoring.referenceUnavailable')}</Alert> : null}
        {canTelemetry && !pointId ? <Alert severity="info">{t('telemetryMonitoring.noPoint')}</Alert> : null}

        {canTelemetry && pointId ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}><Button onClick={refreshTelemetry}>{t('telemetryMonitoring.refresh')}</Button></Box>
            {(latestQuery.error || (detailMode === 'history' ? historyQuery.error : null) || (detailMode === 'trend' ? trendQuery.error : null)) ? (
              <Alert severity="error">{errorMessage(latestQuery.error ?? (detailMode === 'history' ? historyQuery.error : trendQuery.error), t)}</Alert>
            ) : null}
            <StatusWithProvenance label={t('telemetryMonitoring.latest')} state={latestState} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <Button variant={detailMode === 'summary' ? 'contained' : 'outlined'} onClick={() => setDetailMode('summary')}>{t('telemetryMonitoring.latest')}</Button>
                <Button variant={detailMode === 'history' ? 'contained' : 'outlined'} onClick={() => setDetailMode('history')}>{t('telemetryMonitoring.history')}</Button>
                <Button variant={detailMode === 'trend' ? 'contained' : 'outlined'} onClick={() => setDetailMode('trend')}>{t('telemetryMonitoring.trend')}</Button>
              </Stack>
              {detailMode === 'history' ? (
                <Box sx={{ mt: 2 }}>
                  <EvidenceTimeline label={t('telemetryMonitoring.history')} state={historyState} />
                  {historyState.kind === 'ready' ? (
                    <Typography color="text.secondary" variant="caption">
                      {t('telemetryMonitoring.loaded', { loaded: historyState.value.length, total: historyQuery.data?.totalElements ?? historyState.value.length })}
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
              {detailMode === 'trend' ? (
                <Box sx={{ mt: 2 }}>
                  {trendQuery.isError ? <Alert severity="warning">{t('telemetryMonitoring.genericError')}</Alert> :
                    trendQuery.isFetching || !trendQuery.isSuccess ? <Alert role="status" severity="info">{t('evidence.loading')}</Alert> :
                    <TrendQualityPanel pointId={pointId} readings={trendReadings} title={t('telemetryMonitoring.trend')} />}
                </Box>
              ) : null}
            </Paper>
          </>
        ) : null}

        <Typography component="h2" variant="h5">{t('telemetryMonitoring.monitoring')}</Typography>
        {!canRules && !canDeviations ? <Alert severity="warning">{t('telemetryMonitoring.monitoringUnavailable')}</Alert> : null}

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' } }}>
          {canRules ? <Paper variant="outlined" sx={{ p: 2 }}><Typography component="h3" variant="h6">{t('telemetryMonitoring.rules')}</Typography>{rulesQuery.error ? <Alert severity="error" sx={{ mt: 2 }}>{errorMessage(rulesQuery.error, t)}</Alert> : null}{rules.length ? <TableContainer sx={{ mt: 1 }}><Table size="small"><TableHead><TableRow><TableCell>code</TableCell><TableCell>{t('telemetryMonitoring.status')}</TableCell><TableCell>{t('telemetryMonitoring.ruleType')}</TableCell><TableCell>{t('telemetryMonitoring.asset')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{rules.map((rule, index) => <TableRow key={rule.id ?? `rule-${index}`}><TableCell>{rule.code ?? '—'}</TableCell><TableCell>{rule.status ?? '—'}</TableCell><TableCell>{rule.ruleType ?? '—'}</TableCell><TableCell>{rule.topologyAssetCode ?? rule.topologyAssetId ?? '—'}</TableCell><TableCell><Button onClick={() => inspectRule(rule)} size="small">{t('telemetryMonitoring.inspect')}</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : !rulesQuery.isLoading && !rulesQuery.error ? <Alert severity="info" sx={{ mt: 2 }}>{t('telemetryMonitoring.emptyRules')}</Alert> : null}</Paper> : null}

          {canDeviations ? <Paper variant="outlined" sx={{ p: 2 }}><Typography component="h3" variant="h6">{t('telemetryMonitoring.deviations')}</Typography>{deviationsQuery.error ? <Alert severity="error" sx={{ mt: 2 }}>{errorMessage(deviationsQuery.error, t)}</Alert> : null}{deviations.length ? <TableContainer sx={{ mt: 1 }}><Table size="small"><TableHead><TableRow><TableCell>{t('telemetryMonitoring.detectedAt')}</TableCell><TableCell>{t('telemetryMonitoring.severity')}</TableCell><TableCell>{t('telemetryMonitoring.status')}</TableCell><TableCell>{t('telemetryMonitoring.asset')}</TableCell><TableCell>{t('telemetryMonitoring.reason')}</TableCell><TableCell /></TableRow></TableHead><TableBody>{deviations.map((deviation, index) => <TableRow key={deviation.id ?? `deviation-${index}`}><TableCell>{deviation.detectedAt ?? '—'}</TableCell><TableCell>{deviation.severity ?? '—'}</TableCell><TableCell>{deviation.status ?? '—'}</TableCell><TableCell>{deviation.topologyAssetCode ?? deviation.topologyAssetId ?? '—'}</TableCell><TableCell>{deviation.reasonMessage ?? deviation.reasonCode ?? '—'}</TableCell><TableCell><Button onClick={() => inspectDeviation(deviation)} size="small">{t('telemetryMonitoring.inspect')}</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer> : !deviationsQuery.isLoading && !deviationsQuery.error ? <Alert severity="info" sx={{ mt: 2 }}>{t('telemetryMonitoring.emptyDeviations')}</Alert> : null}</Paper> : null}
        </Box>
      </Stack>
    </Container>
  );
}
