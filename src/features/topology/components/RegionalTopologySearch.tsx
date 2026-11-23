import { Alert, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { HidraMap } from '@/components/map/HidraMap';
import { buildLayerRegistry } from '@/components/map/LayerRegistry';
import { MapLayerExplorer } from '@/components/map/MapLayerExplorer';
import { MapLegend } from '@/components/map/MapLegend';
import type { HidraMapSelection } from '@/components/map/mapTypes';
import { WorkspaceCanvas, type WorkspaceCanvasState } from '@/shell/workspace/WorkspaceCanvas';
import { TopologyFeatureList } from '@/features/topology/components/TopologyFeatureList';
import { toHidraMapFeatureCollection } from '@/features/topology/model/topologyPresentation';
import { useAuth } from '@/app/auth/useAuth';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchRegionalTopologyFeature, fetchRegionalTopologyGeoJson, fetchRegionalTopologyLayer,
  fetchRegionalTopologyLayerFeatures, fetchRegionalTopologyLayers, searchRegionalTopology,
} from '@/features/topology/api/regionalTopologyApi';
import { TopologyInspector } from '@/features/topology/components/TopologyInspector';
import { REGIONAL_LAYERS, exactRegionalFeature, parseRegionalReference, regionalFeatureReference, regionalMapAdmission, validRegionalQuery } from '@/features/topology/model/regionalTopologySearch';
import { topologyFeatureLabel } from '@/features/topology/model/topologyPresentation';
import { useShellUiStore } from '@/shell/model/useShellUiStore';
import { ContextLink } from '@/shell/navigation/ContextLink';
import { ContextReturnLink } from '@/shell/navigation/ContextReturnLink';

const PAGE_SIZE = 25;
const MAP_SIZE = 100;

/** Selected scope uses ONLY the T34 server-filtered map, never an administrator fallback. */
export function RegionalTopologySearch() {
  const { t } = useTranslation();
  const auth = useAuth();
  const permissions = usePermissions();
  const selected = useShellUiStore(state => state.operationalContext);
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState('');
  const [committed, setCommitted] = useState('');
  const [page, setPage] = useState(0);
  const [mapPage, setMapPage] = useState(0);
  const [layerPage, setLayerPage] = useState(0);
  const [focusedLayerId, setFocusedLayerId] = useState('');
  const [hiddenLayerIds, setHiddenLayerIds] = useState<Set<string>>(() => new Set());
  const principalId = auth.status === 'authenticated' ? auth.session?.principal?.userId : undefined;
  const admission = regionalMapAdmission(permissions, principalId, selected);
  const company = admission.search ? selected!.companyPartyId : '';
  const ref = parseRegionalReference(params);
  const detailRequested = params.has('regionalLayer') || params.has('regionalEntityId');

  const search = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, selected?.type, selected?.targetId, 'search', committed, page, PAGE_SIZE],
    queryFn: () => searchRegionalTopology(company, committed, page, PAGE_SIZE),
    enabled: admission.search && Boolean(validRegionalQuery(committed)),
    retry: false, staleTime: 0, gcTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true,
  });
  const layersQuery = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, selected?.type, selected?.targetId, 'layers'],
    queryFn: () => fetchRegionalTopologyLayers(company),
    enabled: admission.layers,
    retry: false, staleTime: 0, gcTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true,
  });
  // Fixed layer catalog: never render unknown descriptors or imply any protected inventory.
  const layerDescriptors = layersQuery.isSuccess && !layersQuery.isFetching
    ? (layersQuery.data ?? []).filter(layer => Boolean(layer.id && REGIONAL_LAYERS.some(id => id === layer.id)))
    : [];
  const registeredLayers = buildLayerRegistry(layerDescriptors);
  const layerIds = registeredLayers.map(layer => layer.id);
  const visibleIds = layerIds.filter(id => !hiddenLayerIds.has(id));
  const focusedId = layerIds.includes(focusedLayerId) ? focusedLayerId : layerIds[0] ?? '';
  const selectedRegistry = registeredLayers.filter(layer => visibleIds.includes(layer.id));
  const layerInfo = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, 'layer', focusedId],
    queryFn: () => fetchRegionalTopologyLayer(company, focusedId),
    enabled: admission.layer && admission.layers && layersQuery.isSuccess && !layersQuery.isFetching && Boolean(focusedId),
    retry: false, staleTime: 0, gcTime: 0,
  });
  const layerFeatures = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, 'layer-features', focusedId, layerPage, PAGE_SIZE],
    queryFn: () => fetchRegionalTopologyLayerFeatures(company, focusedId, layerPage, PAGE_SIZE),
    enabled: admission.features && admission.layers && layersQuery.isSuccess && !layersQuery.isFetching && Boolean(focusedId),
    retry: false, staleTime: 0, gcTime: 0,
  });
  const geoJson = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, selected?.type, selected?.targetId, 'geojson', visibleIds.join(','), mapPage, MAP_SIZE],
    queryFn: () => fetchRegionalTopologyGeoJson(company, visibleIds, mapPage, MAP_SIZE),
    enabled: admission.geoJson && admission.layers && layersQuery.isSuccess && !layersQuery.isFetching && visibleIds.length > 0,
    retry: false, staleTime: 0, gcTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true,
  });
  const mapResponse = admission.layers && admission.geoJson && geoJson.isSuccess && !geoJson.isFetching &&
    layersQuery.isSuccess && !layersQuery.isFetching && visibleIds.length > 0 ? geoJson.data : undefined;
  const mapData = useMemo(() => toHidraMapFeatureCollection(mapResponse), [mapResponse]);
  const mapFeatures = (mapResponse?.features ?? []).filter(feature => {
    const reference = regionalFeatureReference(feature);
    return reference && visibleIds.includes(reference.layer);
  });
  const mapState: WorkspaceCanvasState = !admission.layers || !admission.geoJson
    ? { kind: 'unavailable', message: t('topology.regional.mapUnavailable') }
    : layersQuery.isFetching || layersQuery.isPending
      ? { kind: 'loading', message: t('topology.loadingLayers') }
      : layersQuery.isError
        ? { kind: 'unavailable', message: t('topology.regional.mapUnavailable') }
        : visibleIds.length === 0
          ? { kind: 'empty', message: t('topology.noVisibleLayers') }
          : geoJson.isFetching || geoJson.isPending
            ? { kind: 'loading', message: t('topology.loadingMap') }
            : geoJson.isError
              ? { kind: 'unavailable', message: t('topology.regional.mapUnavailable') }
              : mapFeatures.length === 0
                ? { kind: 'empty', message: t('topology.mapEmpty') }
                : { kind: 'ready' };

  const detail = useQuery({
    queryKey: ['hidra', 'topology', 'regional-map', principalId, company, selected?.scopeId, selected?.type, selected?.targetId, 'feature', ref?.layer, ref?.entityId],
    queryFn: () => fetchRegionalTopologyFeature(company, ref!),
    enabled: admission.search && admission.detail && Boolean(ref),
    retry: false, staleTime: 0, gcTime: 0, refetchOnMount: 'always', refetchOnWindowFocus: true,
  });

  const closeDetail = () => {
    const next = new URLSearchParams(params);
    next.delete('regionalLayer');
    next.delete('regionalEntityId');
    setParams(next);
  };
  const openDetail = (layer: string, entityId: string) => {
    if (!admission.detail) return;
    const next = new URLSearchParams(params);
    next.set('regionalLayer', layer);
    next.set('regionalEntityId', entityId);
    setParams(next);
  };


  const changeFocusedLayer = (id: string) => {
    setFocusedLayerId(id);
    setLayerPage(0);
    closeDetail();
  };
  const toggleLayer = (id: string) => {
    setHiddenLayerIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setMapPage(0);
    closeDetail();
  };
  const onMapSelect = (selection: HidraMapSelection) => {
    if (!admission.detail || !mapResponse || geoJson.isFetching) return;
    const match = mapFeatures.find(feature => feature.id === selection.featureId);
    const reference = match && regionalFeatureReference(match);
    if (reference && reference.layer === selection.layerId) openDetail(reference.layer, reference.entityId);
  };
  const openMapFeature = (feature: (typeof mapFeatures)[number]) => {
    const reference = regionalFeatureReference(feature);
    if (admission.detail && reference) openDetail(reference.layer, reference.entityId);
  };

  if (!admission.search && !admission.layers) {
    return <Container maxWidth="xl" sx={{ py: 4 }}>
      <Alert severity="warning">{t('topology.regional.unavailable')}</Alert>
    </Container>;
  }
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography component="h1" variant="h4">{t('topology.regional.title')}</Typography>
          <Typography color="text.secondary" variant="body2">{t('topology.regional.contextHelp')}</Typography>
        </Box>
        {admission.search ? <Paper variant="outlined" sx={{ p: 2 }}>
          <Box component="form" onSubmit={(event) => {
            event.preventDefault();
            const value = validRegionalQuery(input);
            if (!value) return;
            setPage(0);
            setCommitted(value);
            closeDetail();
          }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField fullWidth label={t('topology.regional.searchLabel')} size="small"
                slotProps={{ htmlInput: { maxLength: 120 } }}
                value={input} onChange={event => setInput(event.target.value)} />
              <Button disabled={!validRegionalQuery(input)} type="submit" variant="contained">
                {t('topology.regional.searchAction')}
              </Button>
            </Stack>
          </Box>
          {search.isFetching ? <Typography role="status" sx={{ mt: 2 }}>{t('topology.regional.loading')}</Typography> : null}
          {search.isError ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t(normalizeHidraApiError(search.error).status === 403 ? 'topology.regional.denied' : 'topology.regional.unavailable')}
            </Alert>
          ) : null}
          {search.isSuccess && !search.isFetching ? (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                {t('topology.regional.results', { total: search.data.totalFeatures ?? 0 })}
              </Typography>
              {(search.data.features ?? []).map((feature, index) => {
                const reference = regionalFeatureReference(feature);
                return reference ? (
                  <Stack direction="row" key={feature.id ?? index} spacing={1}
                    useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button disabled={!admission.detail}
                      onClick={() => openDetail(reference.layer, reference.entityId)}
                      size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
                      {topologyFeatureLabel(feature)}
                    </Button>
                    <ContextLink target={{ kind: 'regional-feature', layer: reference.layer, entityId: reference.entityId }}
                      admitted={admission.detail} ownerIssued label={t('contextLink.openFeature')} />
                  </Stack>
                ) : null;
              })}
              <Stack direction="row" spacing={1}>
                <Button disabled={page === 0} onClick={() => { setPage(p => Math.max(0, p - 1)); closeDetail(); }}>
                  {t('topology.regional.previous')}
                </Button>
                <Button disabled={!search.data.hasNext} onClick={() => { setPage(p => p + 1); closeDetail(); }}>
                  {t('topology.regional.next')}
                </Button>
              </Stack>
            </Stack>
          ) : null}

        </Paper> : null}
        {admission.layers ? (
          <Box component="section" aria-label={t('topology.regional.mapTitle')}>
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>{t('topology.regional.mapTitle')}</Typography>
            {layersQuery.isError ? <Alert severity="warning">{t('topology.regional.mapUnavailable')}</Alert> : null}
            {layersQuery.isSuccess && !layersQuery.isFetching && registeredLayers.length === 0
              ? <Alert severity="info">{t('topology.emptyLayers')}</Alert> : null}
            {registeredLayers.length > 0 ? (
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '300px minmax(0, 1fr)' } }}>
                <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
                  <MapLayerExplorer
                    layers={registeredLayers}
                    hiddenLayerIds={hiddenLayerIds}
                    focusedLayerId={focusedId}
                    onFocus={changeFocusedLayer}
                    onToggle={toggleLayer}
                    title={t('topology.layers')}
                    inspectLabel={t('topology.inspectLayer')}
                  />
                  {admission.layer && layerInfo.isSuccess && !layerInfo.isFetching && layerInfo.data.id === focusedId ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {layerInfo.data.description ?? layerInfo.data.label ?? '—'}
                    </Typography>
                  ) : null}
                  {admission.features && layerFeatures.isSuccess && !layerFeatures.isFetching && layerFeatures.data.layer === focusedId ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption">{t('topology.sampleCount', {
                        loaded: layerFeatures.data.features?.length ?? 0, total: layerFeatures.data.totalFeatures ?? 0,
                      })}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button disabled={layerPage === 0}
                          onClick={() => setLayerPage(p => Math.max(0, p - 1))}>{t('topology.regional.previous')}</Button>
                        <Button disabled={!layerFeatures.data.hasNext}
                          onClick={() => setLayerPage(p => p + 1)}>{t('topology.regional.next')}</Button>
                      </Stack>
                    </Box>
                  ) : null}
                </Paper>
                <Stack spacing={2} sx={{ minWidth: 0 }}>
                  <WorkspaceCanvas label={t('topology.regional.mapTitle')} variant="map" state={mapState}>
                    <MapLegend layers={selectedRegistry} />
                    <HidraMap
                      ariaLabel={t('topology.regional.mapTitle')}
                      data={mapData}
                      onFeatureSelect={onMapSelect}
                      selectedFeatureId={mapFeatures.find(feature => {
                        const current = regionalFeatureReference(feature);
                        return current?.layer === ref?.layer && current.entityId === ref?.entityId;
                      })?.id}
                    />
                  </WorkspaceCanvas>
                  {mapState.kind === 'ready' && mapResponse ? (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">{t('topology.loadedCount', {
                        loaded: mapFeatures.length, total: mapResponse.totalFeatures ?? 0,
                      })}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('topology.regional.page', { page: (mapResponse.page ?? mapPage) + 1,
                          pages: mapResponse.totalPages ?? 0 })}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button disabled={mapPage === 0} onClick={() => { setMapPage(p => Math.max(0, p - 1)); closeDetail(); }}>
                          {t('topology.regional.previous')}
                        </Button>
                        <Button disabled={!mapResponse.hasNext} onClick={() => { setMapPage(p => p + 1); closeDetail(); }}>
                          {t('topology.regional.next')}
                        </Button>
                      </Stack>
                      {mapResponse.hasNext ? <Alert severity="info" sx={{ mt: 1 }}>{t('topology.regional.partialMap')}</Alert> : null}
                      <TopologyFeatureList features={mapFeatures} onSelect={openMapFeature} maxItems={25} />
                    </Paper>
                  ) : null}
                </Stack>
              </Box>
            ) : null}
          </Box>
        ) : null}
        {detailRequested ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Button onClick={closeDetail} sx={{ alignSelf: 'flex-start' }} variant="outlined">
                {t('topology.regional.close')}
              </Button>
              <ContextReturnLink />
              {!ref || !admission.detail ? <Alert severity="warning">{t('topology.regional.unavailable')}</Alert> : null}
              {ref && admission.detail && detail.isFetching ? <CircularProgress size={22} /> : null}
              {ref && admission.detail && detail.isError ? (
                <Alert severity="warning">{t('topology.regional.unavailable')}</Alert>
              ) : null}
              {ref && admission.detail && detail.isSuccess && !detail.isFetching ?
                exactRegionalFeature(detail.data, ref)
                  ? <TopologyInspector feature={detail.data} />
                  : <Alert severity="warning">{t('topology.regional.unavailable')}</Alert>
                : null}
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </Container>
  );
}
