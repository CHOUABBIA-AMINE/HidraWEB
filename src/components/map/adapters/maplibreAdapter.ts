import maplibregl, { type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { HidraMapAdapter, HidraMapFeatureCollection, HidraMapSelection } from '@/components/map/mapTypes';

const SOURCE_ID = 'hidra-topology-source';
const POINT_LAYER_ID = 'hidra-topology-points';
const LINE_LAYER_ID = 'hidra-topology-lines';
const EMPTY_COLLECTION: HidraMapFeatureCollection = { type: 'FeatureCollection', features: [] };

function asGeoJson(data: HidraMapFeatureCollection): Parameters<GeoJSONSource['setData']>[0] {
  return data as unknown as Parameters<GeoJSONSource['setData']>[0];
}

function extendBounds(bounds: maplibregl.LngLatBounds, coordinates: unknown): void {
  if (!Array.isArray(coordinates)) return;
  if (
    coordinates.length >= 2
    && typeof coordinates[0] === 'number'
    && Number.isFinite(coordinates[0])
    && typeof coordinates[1] === 'number'
    && Number.isFinite(coordinates[1])
  ) {
    bounds.extend([coordinates[0], coordinates[1]]);
    return;
  }
  coordinates.forEach((value) => extendBounds(bounds, value));
}

export function createMapLibreAdapter(
  container: HTMLElement,
  onFeatureSelect: (selection: HidraMapSelection) => void,
): HidraMapAdapter {
  const map = new maplibregl.Map({
    container,
    center: [0, 0],
    zoom: 1,
    style: {
      version: 8,
      sources: {},
      layers: [
        {
          id: 'hidra-background',
          type: 'background',
          paint: { 'background-color': '#f4f6f8' },
        },
      ],
    },
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

  let pendingData = EMPTY_COLLECTION;
  let selectedFeatureId: string | undefined;
  let appliedSelectedFeatureId: string | undefined;
  let fittedInitialData = false;

  const applySelection = () => {
    if (!map.isStyleLoaded()) return;
    if (appliedSelectedFeatureId && appliedSelectedFeatureId !== selectedFeatureId) {
      map.setFeatureState({ source: SOURCE_ID, id: appliedSelectedFeatureId }, { selected: false });
    }
    if (selectedFeatureId) {
      map.setFeatureState({ source: SOURCE_ID, id: selectedFeatureId }, { selected: true });
    }
    appliedSelectedFeatureId = selectedFeatureId;
  };

  const fitInitialData = (data: HidraMapFeatureCollection) => {
    if (fittedInitialData || data.features.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    data.features.forEach((feature) => extendBounds(bounds, feature.geometry.coordinates));
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { duration: 0, maxZoom: 12, padding: 48 });
      fittedInitialData = true;
    }
  };

  const applyData = (data: HidraMapFeatureCollection) => {
    pendingData = data;
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;
    source.setData(asGeoJson(data));
    fitInitialData(data);
    applySelection();
  };

  map.on('load', () => {
    map.addSource(SOURCE_ID, { type: 'geojson', data: asGeoJson(pendingData) });
    map.addLayer({
      id: LINE_LAYER_ID,
      source: SOURCE_ID,
      type: 'line',
      paint: {
        'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#ed6c02', '#1565c0'],
        'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 5, 3],
      },
    });
    map.addLayer({
      id: POINT_LAYER_ID,
      source: SOURCE_ID,
      type: 'circle',
      paint: {
        'circle-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#ed6c02', '#1565c0'],
        'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 8, 5],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1.5,
      },
    });

    const handleClick = (event: { features?: Array<{ id?: string | number; properties?: Record<string, unknown> }> }) => {
      const feature = event.features?.[0];
      const layer = feature?.properties?.layer;
      if (feature?.id === undefined || typeof layer !== 'string') return;
      onFeatureSelect({ featureId: String(feature.id), layerId: layer });
    };

    map.on('click', LINE_LAYER_ID, handleClick);
    map.on('click', POINT_LAYER_ID, handleClick);
    fitInitialData(pendingData);
    applySelection();
  });

  return {
    setData: applyData,
    setSelectedFeature: (featureId) => {
      selectedFeatureId = featureId;
      applySelection();
    },
    destroy: () => map.remove(),
  };
}
