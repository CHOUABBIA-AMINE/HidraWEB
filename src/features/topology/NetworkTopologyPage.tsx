import { Alert, Box, Button, Chip, CircularProgress, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Feature } from '@/api/generated/topology/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { HidraMap } from '@/components/map/HidraMap';
import { buildLayerRegistry } from '@/components/map/LayerRegistry';
import { MapLegend } from '@/components/map/MapLegend';
import type { HidraMapSelection } from '@/components/map/mapTypes';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchTopologyGeoJson,
  fetchTopologyLayer,
  fetchTopologyLayerFeatures,
  fetchTopologyLayers,
  searchTopology,
  topologyQueryKeys,
} from '@/features/topology/api/topologyApi';
import { TOPOLOGY_PERMISSIONS } from '@/features/topology/api/topologyPermissions';
import { TopologyFeatureList } from '@/features/topology/components/TopologyFeatureList';
import { TopologyInspector } from '@/features/topology/components/TopologyInspector';
import { TopologyLayerTree } from '@/features/topology/components/TopologyLayerTree';
import {
  findTopologyFeature,
  toHidraMapFeatureCollection,
  topologyFeatureLabel,
} from '@/features/topology/model/topologyPresentation';
import { useContextDrawer } from '@/shell/context/useContextDrawer';

const MAP_PAGE_SIZE = 1000;
const LAYER_SAMPLE_SIZE = 25;
const SEARCH_PAGE_SIZE = 50;

export function NetworkTopologyPage() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const drawer = useContextDrawer();
  const [hiddenLayerIds, setHiddenLayerIds] = useState<Set<string>>(() => new Set());
  const [focusedLayerId, setFocusedLayerId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>();

  const canRead = permissions.can(TOPOLOGY_PERMISSIONS.read);
  const canSearch = permissions.can(TOPOLOGY_PERMISSIONS.search);

  const layersQuery = useQuery({
    queryKey: topologyQueryKeys.layers,
    queryFn: fetchTopologyLayers,
    enabled: canRead,
  });

  const layers = useMemo(() => layersQuery.data ?? [], [layersQuery.data]);
  const registry = useMemo(() => buildLayerRegistry(layers), [layers]);
  const visibleLayerIds = useMemo(
    () => layers.map((layer) => layer.id).filter((layerId) => !hiddenLayerIds.has(layerId)),
    [hiddenLayerIds, layers],
  );
  const effectiveFocusedLayerId = layers.some((layer) => layer.id === focusedLayerId)
    ? focusedLayerId
    : layers[0]?.id ?? '';

  const layerQuery = useQuery({
    queryKey: topologyQueryKeys.layer(effectiveFocusedLayerId),
    queryFn: () => fetchTopologyLayer(effectiveFocusedLayerId),
    enabled: canRead && Boolean(effectiveFocusedLayerId),
  });

  const layerFeaturesQuery = useQuery({
    queryKey: topologyQueryKeys.layerFeatures(effectiveFocusedLayerId, 0, LAYER_SAMPLE_SIZE, ''),
    queryFn: () => fetchTopologyLayerFeatures({ layerId: effectiveFocusedLayerId, page: 0, size: LAYER_SAMPLE_SIZE }),
    enabled: canRead && Boolean(effectiveFocusedLayerId),
  });

  const geoJsonQuery = useQuery({
    queryKey: topologyQueryKeys.geoJson(visibleLayerIds, 0, MAP_PAGE_SIZE),
    queryFn: () => fetchTopologyGeoJson({ layers: visibleLayerIds, page: 0, size: MAP_PAGE_SIZE }),
    enabled: canRead && visibleLayerIds.length > 0,
  });

  const searchQuery = useQuery({
    queryKey: topologyQueryKeys.search(committedSearch, 0, SEARCH_PAGE_SIZE),
    queryFn: () => searchTopology({ query: committedSearch, page: 0, size: SEARCH_PAGE_SIZE }),
    enabled: canSearch && Boolean(committedSearch),
  });

  const mapData = useMemo(() => toHidraMapFeatureCollection(geoJsonQuery.data), [geoJsonQuery.data]);
  const visibleRegistry = useMemo(
    () => registry.filter((layer) => visibleLayerIds.includes(layer.id)),
    [registry, visibleLayerIds],
  );

  const openFeature = (feature: Feature) => {
    setSelectedFeatureId(feature.id);
    drawer.openDrawer({
      title: topologyFeatureLabel(feature),
      content: <TopologyInspector feature={feature} />,
    });
  };

  const selectMapFeature = (selection: HidraMapSelection) => {
    const feature = findTopologyFeature(geoJsonQuery.data, selection.featureId);
    if (feature) openFeature(feature);
  };

  const toggleLayer = (layerId: string) => {
    setHiddenLayerIds((current) => {
      const next = new Set(current);
      if (next.has(layerId)) next.delete(layerId);
      else next.add(layerId);
      return next;
    });
  };

  const commitSearch = () => setCommittedSearch(searchInput.trim());
  const clearSearch = () => {
    setSearchInput('');
    setCommittedSearch('');
  };

  if (!canRead) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><Alert severity="warning">{t('topology.capabilityUnavailable')}</Alert></Container>;
  }

  if (layersQuery.isLoading) {
    return (
      <Container maxWidth="xl" sx={{ alignItems: 'center', display: 'flex', gap: 2, py: 4 }}>
        <CircularProgress size={24} />
        <Typography>{t('topology.loadingLayers')}</Typography>
      </Container>
    );
  }

  if (layersQuery.error) {
    const error = normalizeHidraApiError(layersQuery.error);
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{t(error.status === 403 ? 'topology.errorForbidden' : 'topology.errorGeneric')}</Alert>
      </Container>
    );
  }

  if (layers.length === 0) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><Alert severity="info">{t('topology.emptyLayers')}</Alert></Container>;
  }

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2, justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="overline">HWEB-005</Typography>
          <Typography component="h1" variant="h4">{t('topology.title')}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>{t('topology.subtitle')}</Typography>
        </Box>
        <Chip label={`${layers.length} ${t('topology.layers')}`} variant="outlined" />
      </Stack>

      {permissions.catalogOnly ? <Alert severity="warning" sx={{ mt: 2 }}>{t('topology.catalogOnly')}</Alert> : null}

      <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1 }}>
          <TextField
            fullWidth
            label={t('topology.search')}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter' && canSearch) commitSearch(); }}
            placeholder={t('topology.searchPlaceholder')}
            size="small"
            value={searchInput}
          />
          <Button disabled={!canSearch || !searchInput.trim()} onClick={commitSearch} variant="contained">
            {t('topology.searchAction')}
          </Button>
          <Button disabled={!searchInput && !committedSearch} onClick={clearSearch} variant="outlined">
            {t('topology.clearSearch')}
          </Button>
        </Stack>
        {!canSearch ? <Alert severity="info" sx={{ mt: 1 }}>{t('topology.searchUnavailable')}</Alert> : null}
        {searchQuery.error ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {t(normalizeHidraApiError(searchQuery.error).status === 403 ? 'topology.errorForbidden' : 'topology.errorGeneric')}
          </Alert>
        ) : null}
        {searchQuery.data ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">{t('topology.searchResults')} · {searchQuery.data.totalFeatures}</Typography>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {searchQuery.data.features.map((feature) => (
                <Button key={feature.id} onClick={() => openFeature(feature)} size="small" variant="outlined">
                  {topologyFeatureLabel(feature)}
                </Button>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Paper>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' }, mt: 2 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <TopologyLayerTree
            focusedLayerId={effectiveFocusedLayerId}
            hiddenLayerIds={hiddenLayerIds}
            layers={layers}
            onFocus={setFocusedLayerId}
            onToggle={toggleLayer}
          />
          {layerQuery.data ? (
            <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, pt: 2 }}>
              <Typography color="text.secondary" variant="overline">{t('topology.focusedLayer')}</Typography>
              <Typography variant="subtitle2">{layerQuery.data.label}</Typography>
              <Typography color="text.secondary" variant="body2">{layerQuery.data.description}</Typography>
              {layerFeaturesQuery.data ? (
                <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
                  {t('topology.sampleCount', {
                    loaded: layerFeaturesQuery.data.features.length,
                    total: layerFeaturesQuery.data.totalFeatures,
                  })}
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </Paper>

        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ overflow: 'hidden', p: 1 }}>
            <MapLegend layers={visibleRegistry} />
            {visibleLayerIds.length === 0 ? <Alert severity="info" sx={{ mt: 1 }}>{t('topology.noVisibleLayers')}</Alert> : null}
            {geoJsonQuery.isLoading ? <Alert severity="info" sx={{ mt: 1 }}>{t('topology.loadingMap')}</Alert> : null}
            {geoJsonQuery.error ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                {t(normalizeHidraApiError(geoJsonQuery.error).status === 403 ? 'topology.errorForbidden' : 'topology.errorGeneric')}
              </Alert>
            ) : null}
            <HidraMap
              ariaLabel={t('topology.map')}
              data={mapData}
              onFeatureSelect={selectMapFeature}
              selectedFeatureId={selectedFeatureId}
            />
          </Paper>

          {geoJsonQuery.data ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Chip label={t('topology.loadedCount', { loaded: geoJsonQuery.data.features.length, total: geoJsonQuery.data.totalFeatures })} size="small" />
                <Chip label={`page ${geoJsonQuery.data.page + 1}/${Math.max(geoJsonQuery.data.totalPages, 1)}`} size="small" variant="outlined" />
              </Stack>
              {geoJsonQuery.data.hasNext ? <Alert severity="warning" sx={{ mt: 1 }}>{t('topology.windowLimited')}</Alert> : null}
              <TopologyFeatureList features={geoJsonQuery.data.features} onSelect={openFeature} />
            </Paper>
          ) : null}
        </Stack>
      </Box>

      <Typography color="text.secondary" sx={{ display: 'block', mt: 2 }} variant="caption">
        {t('topology.contractPinned')}
      </Typography>
    </Container>
  );
}
