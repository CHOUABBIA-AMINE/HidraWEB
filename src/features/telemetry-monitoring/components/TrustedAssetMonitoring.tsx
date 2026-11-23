import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import type { HistoryCursorView, TrustedObservationView } from '@/api/generated/telemetry-monitoring/model';
import {
  listAssetScopedTelemetryPoints, listAssetScopedTrustedObservationHistory, readLatestAssetScopedTrustedObservation,
} from '@/api/generated/telemetry-monitoring/telemetryMonitoring';
import { readCurrentProtectedStationGraphRevision } from '@/api/generated/topology/topology';
import { useAuth } from '@/app/auth/useAuth';
import { supportsRegionalAccess } from '@/features/context/model/operationalContextModel';
import { usePermissions } from '@/features/permissions/usePermissions';
import { fetchRegionalTopologyLayerFeatures } from '@/features/topology/api/regionalTopologyApi';
import { regionalFeatureReference, regionalMapAdmission } from '@/features/topology/model/regionalTopologySearch';
import { topologyFeatureLabel } from '@/features/topology/model/topologyPresentation';
import { useShellUiStore, type OperationalContextSelection } from '@/shell/model/useShellUiStore';

const pointsRoute = '/api/v1/telemetry/assets/{assetType}/{assetId}/points';
const latestRoute = pointsRoute + '/{pointId}/trusted-readings/latest';
const historyRoute = pointsRoute + '/{pointId}/trusted-readings/history';
const graphRoute = '/api/v1/topology/facilities/{facilityId}/station-graph/publications/current';
const telemetryGrant = 'telemetry:assets:read';
const limit = 20;
const maxHistoryMs = 31 * 24 * 60 * 60 * 1000;

type AssetType = 'FACILITY' | 'EQUIPMENT';

function queryOptions(coordinates: readonly unknown[], enabled: boolean) {
  return {
    queryKey: ['hidra', 'telemetry', 'scoped-operations', ...coordinates],
    enabled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always' as const,
  };
}

export function TrustedAssetMonitoring() {
  const { t } = useTranslation();
  const auth = useAuth();
  const access = usePermissions();
  const scope = useShellUiStore(state => state.operationalContext);
  const principal = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  const admitted = (route: string) => access.status === 'ready' && access.can(telemetryGrant) &&
    access.routes.some(item => item.module === 'telemetry' && item.permission === telemetryGrant &&
      item.route === route && item.methods.includes('GET'));
  if (!admitted(pointsRoute)) return null;
  if (!scope || !principal || scope.principalId !== principal || !scope.companyPartyId || !supportsRegionalAccess(scope)) {
    return <Alert severity="info">{t('telemetryMonitoring.trusted.scope')}</Alert>;
  }
  const contextKey = JSON.stringify([principal, scope.companyPartyId, scope.scopeId, scope.type, scope.targetId]);
  const regional = regionalMapAdmission(access, principal, scope);

  return <ScopedMonitoring key={contextKey} scope={scope} contextKey={contextKey}
    canListFacilities={regional.features} canLatest={admitted(latestRoute)} canHistory={admitted(historyRoute)} />;
}

function ScopedMonitoring({ scope, contextKey, canListFacilities, canLatest, canHistory }: {
  scope: OperationalContextSelection;
  contextKey: string;
  canListFacilities: boolean;
  canLatest: boolean;
  canHistory: boolean;
}) {
  const { t } = useTranslation();
  const directAsset = scope.type === 'FACILITY' || scope.type === 'EQUIPMENT';
  const assetType: AssetType = scope.type === 'EQUIPMENT' ? 'EQUIPMENT' : 'FACILITY';
  const [facilityId, setFacilityId] = useState('');
  const [page, setPage] = useState(0);

  const facilities = useQuery({
    ...queryOptions([contextKey, 'facilities', page], !directAsset && canListFacilities),
    queryFn: () => fetchRegionalTopologyLayerFeatures(scope.companyPartyId, 'facilities', page, limit),
  });
  const choices = !directAsset && canListFacilities && facilities.isSuccess && !facilities.isFetching
    ? (facilities.data.features ?? []).flatMap(feature => {
      const ref = regionalFeatureReference(feature);
      if (ref?.layer !== 'facilities') return [];
      return [{ id: ref.entityId, label: topologyFeatureLabel(feature) }];
    }) : [];
  const assetId = directAsset ? scope.targetId : choices.find(choice => choice.id === facilityId)?.id;
  const changePage = (nextPage: number) => {
    setFacilityId('');
    setPage(nextPage);
  };

  return (
    <Paper component="section" aria-label={t('telemetryMonitoring.trusted.title')} variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography component="h2" variant="h6">{t('telemetryMonitoring.trusted.title')}</Typography>
        <Typography>{[scope.code, scope.name].filter(Boolean).join(' · ') || scope.targetId}</Typography>
        {!directAsset && canListFacilities && <>
          <TextField select size="small" label={t('telemetryMonitoring.trusted.station')} value={assetId ?? ''}
            disabled={!choices.length} onChange={event => setFacilityId(event.target.value)}>
            <MenuItem value="">—</MenuItem>
            {choices.map(choice => <MenuItem key={choice.id} value={choice.id}>{choice.label}</MenuItem>)}
          </TextField>
          <Stack direction="row" spacing={1}>
            <Button disabled={!page || facilities.isFetching} onClick={() => changePage(page - 1)}>
              {t('telemetryMonitoring.trusted.previous')}
            </Button>
            <Button disabled={!facilities.isSuccess || facilities.isFetching || !facilities.data.hasNext}
              onClick={() => changePage(page + 1)}>{t('telemetryMonitoring.trusted.next')}</Button>
          </Stack>
        </>}
        {facilities.isError && !directAsset && <Unavailable />}
        {assetId && <AssetReadings key={assetId} companyPartyId={scope.companyPartyId} contextKey={contextKey}
          assetType={assetType} assetId={assetId} canLatest={canLatest} canHistory={canHistory} />}
      </Stack>
    </Paper>
  );
}

function AssetReadings({ companyPartyId, contextKey, assetType, assetId, canLatest, canHistory }: {
  companyPartyId: string;
  contextKey: string;
  assetType: AssetType;
  assetId: string;
  canLatest: boolean;
  canHistory: boolean;
}) {
  const { t } = useTranslation();
  const [discovery, setDiscovery] = useState<{ at: string; afterPointId: string }>();
  const [pointId, setPointId] = useState('');
  const points = useQuery({
    ...queryOptions([contextKey, assetType, assetId, 'points', discovery], true),
    queryFn: ({ signal }) => listAssetScopedTelemetryPoints(assetType, encodeURIComponent(assetId),
      { companyPartyId, limit: String(limit), ...discovery }, signal),
  });
  const visible = points.isSuccess && !points.isFetching ? points.data : undefined;
  const available = (visible?.points ?? []).filter(point => point.pointId && point.binding?.id);
  const selected = available.find(point => point.pointId === pointId);

  return <>
    <Typography>{assetId}</Typography>
    <Button onClick={() => {
      setPointId('');
      if (discovery) setDiscovery(undefined);
      else void points.refetch();
    }}>{t('telemetryMonitoring.refresh')}</Button>
    {points.isError && <Unavailable />}
    {points.isFetching && <Typography role="status">{t('evidence.loading')}</Typography>}
    {visible && !available.length && <Typography>{t('telemetryMonitoring.trusted.empty')}</Typography>}
    <TextField select size="small" label={t('telemetryMonitoring.trusted.point')} value={selected?.pointId ?? ''}
      disabled={!available.length} onChange={event => setPointId(event.target.value)}>
      <MenuItem value="">—</MenuItem>
      {available.map(point => <MenuItem key={point.pointId} value={point.pointId}>{point.pointId}</MenuItem>)}
    </TextField>
    {visible?.nextPointId && visible.at && <Button onClick={() => {
      if (!visible.at || !visible.nextPointId) return;
      setPointId('');
      setDiscovery({ at: visible.at, afterPointId: visible.nextPointId });
    }}>{t('telemetryMonitoring.trusted.next')}</Button>}
    {selected?.pointId && selected.binding?.id && <ObservationPanel key={selected.pointId}
      coordinates={[contextKey, assetType, assetId, selected.pointId]} companyPartyId={companyPartyId}
      assetType={assetType} assetId={assetId} pointId={selected.pointId} bindingId={selected.binding.id}
      canLatest={canLatest} canHistory={canHistory} />}
    {assetType === 'FACILITY' && <StationPreview companyPartyId={companyPartyId} contextKey={contextKey} facilityId={assetId} />}
  </>;
}

function StationPreview({ companyPartyId, contextKey, facilityId }: {
  companyPartyId: string;
  contextKey: string;
  facilityId: string;
}) {
  const { t } = useTranslation();
  const access = usePermissions();
  const allowed = access.status === 'ready' && access.routes.some(item => item.module === 'topology' &&
    item.route === graphRoute && item.methods.includes('GET') && access.can(item.permission));
  const graph = useQuery({
    ...queryOptions([contextKey, 'station-graph', facilityId], allowed),
    queryFn: ({ signal }) => readCurrentProtectedStationGraphRevision(encodeURIComponent(facilityId),
      { companyPartyId }, signal),
  });
  const snapshot = allowed && graph.isSuccess && !graph.isFetching ? graph.data : undefined;
  const revision = snapshot?.revision;
  const verifiedHead = revision?.facilityId === facilityId && snapshot?.head?.facilityId === facilityId &&
    Boolean(revision?.revisionId) && revision?.revisionId === snapshot.head.revisionId;
  return <>
    <Alert severity="info">{t('telemetryMonitoring.trusted.synoptic')}</Alert>
    {verifiedHead && <Typography>{t('telemetryMonitoring.trusted.graphRevision')} {revision?.revisionId}
      {' · '}{revision?.sourceClassification} · {revision?.qualification}</Typography>}
  </>;
}

function ObservationPanel({ coordinates, companyPartyId, assetType, assetId, pointId, bindingId, canLatest, canHistory }: {
  coordinates: readonly string[];
  companyPartyId: string;
  assetType: AssetType;
  assetId: string;
  pointId: string;
  bindingId: string;
  canLatest: boolean;
  canHistory: boolean;
}) {
  const { t } = useTranslation();
  const [maxAge, setMaxAge] = useState('');
  const [maxAgeSeconds, setMaxAgeSeconds] = useState<number>();
  const [fromInput, setFromInput] = useState('');
  const [untilInput, setUntilInput] = useState('');
  const [window, setWindow] = useState<{ from: string; until: string }>();
  const [cursor, setCursor] = useState<HistoryCursorView>();

  const age = Number(maxAge);
  const validAge = Number.isInteger(age) && age >= 1 && age <= 604800;
  const fromMs = Date.parse(fromInput);
  const untilMs = Date.parse(untilInput);
  const validWindow = Number.isFinite(fromMs) && untilMs > fromMs && untilMs - fromMs <= maxHistoryMs;

  const latest = useQuery({
    ...queryOptions([...coordinates, bindingId, 'latest', maxAgeSeconds], canLatest && maxAgeSeconds !== undefined),
    queryFn: ({ signal }) => readLatestAssetScopedTrustedObservation(assetType, encodeURIComponent(assetId),
      encodeURIComponent(pointId), { companyPartyId, maxAgeSeconds: String(maxAgeSeconds) }, signal),
    refetchInterval: 30_000,
  });
  const history = useQuery({
    ...queryOptions([...coordinates, 'history', maxAgeSeconds, window, cursor],
      canHistory && Boolean(window) && maxAgeSeconds !== undefined),
    queryFn: ({ signal }) => listAssetScopedTrustedObservationHistory(assetType, encodeURIComponent(assetId),
      encodeURIComponent(pointId), { companyPartyId, maxAgeSeconds: String(maxAgeSeconds), ...window!, limit: String(limit),
        afterObservedAt: cursor?.observedAt, afterTrustedId: cursor?.trustedId }, signal),
  });

  const current = canLatest && latest.isSuccess && !latest.isFetching ? latest.data : undefined;
  const currentBindingMatches = current?.observation?.binding?.id === bindingId;
  const readingMatches = currentBindingMatches && current?.observation?.freshness === current?.status;
  const historic = canHistory && history.isSuccess && !history.isFetching ? history.data : undefined;
  const saveAge = (event: FormEvent) => {
    event.preventDefault();
    if (!validAge) return;
    setMaxAgeSeconds(age);
    setWindow(undefined);
    setCursor(undefined);
  };
  const loadHistory = (event: FormEvent) => {
    event.preventDefault();
    if (!validWindow) return;
    setWindow({ from: new Date(fromMs).toISOString(), until: new Date(untilMs).toISOString() });
    setCursor(undefined);
  };

  return <>
    <Typography>{t('telemetryMonitoring.trusted.binding')} {bindingId}</Typography>
    {(canLatest || canHistory) && <Stack component="form" onSubmit={saveAge} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField size="small" type="number" label={t('telemetryMonitoring.trusted.maxAge')} value={maxAge}
        onChange={event => setMaxAge(event.target.value)} slotProps={{ htmlInput: { min: 1, max: 604800, step: 1 } }} />
      <Button type="submit" disabled={!validAge}>{t('telemetryMonitoring.trusted.apply')}</Button>
    </Stack>}
    {canLatest && latest.isError && <Unavailable />}
    {current && <Stack spacing={1}>
      <Typography component="h3" variant="subtitle1">{t('telemetryMonitoring.latest')}</Typography>
      <Typography>{current.observation && !readingMatches ? 'UNAVAILABLE' : current.status ?? 'UNAVAILABLE'} · {current.evaluatedAt} · {current.maxAgeSeconds} s</Typography>
      {readingMatches && current.observation &&
        (current.status === 'FRESH' || current.status === 'STALE') && <Observation evidence={current.observation} />}
    </Stack>}
    {canHistory && maxAgeSeconds !== undefined && <>
      <Stack component="form" onSubmit={loadHistory} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <TextField size="small" type="datetime-local" label={t('telemetryMonitoring.from')} value={fromInput}
          slotProps={{ inputLabel: { shrink: true } }} onChange={event => setFromInput(event.target.value)} />
        <TextField size="small" type="datetime-local" label={t('telemetryMonitoring.to')} value={untilInput}
          slotProps={{ inputLabel: { shrink: true } }} onChange={event => setUntilInput(event.target.value)} />
        <Button type="submit" disabled={!validWindow}>{t('telemetryMonitoring.history')}</Button>
      </Stack>
      {history.isError && <Unavailable />}
      {historic?.observations?.length === 0 && <Typography>{t('telemetryMonitoring.noReading')}</Typography>}
      {historic?.observations?.map(evidence => <Observation key={evidence.trustedId} evidence={evidence} />)}
      {historic?.next?.observedAt && historic.next.trustedId &&
        <Button onClick={() => setCursor(historic.next)}>{t('telemetryMonitoring.trusted.next')}</Button>}
    </>}
  </>;
}

function Observation({ evidence }: { evidence: TrustedObservationView }) {
  const { t } = useTranslation();
  const value = evidence.numericValue ?? evidence.textValue ?? evidence.booleanValue;
  return <Typography>
    {value === undefined ? '—' : String(value)} {evidence.unitId} · {evidence.observedAt} · {evidence.freshness}
    {evidence.ageSeconds === undefined ? '' : ' · ' + evidence.ageSeconds + ' s'}
    {' · '}{t('telemetryMonitoring.trusted.binding')} {evidence.binding?.id ?? '—'}
  </Typography>;
}

function Unavailable() {
  const { t } = useTranslation();
  return <Alert severity="warning">{t('telemetryMonitoring.genericError')}</Alert>;
}
