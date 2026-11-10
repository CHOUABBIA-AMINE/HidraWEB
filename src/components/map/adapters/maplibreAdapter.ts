import { Map as MapLibreMap, Marker, NavigationControl, setWorkerUrl, type GeoJSONSource, type MapLayerMouseEvent } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getFeatureCollectionBounds } from '@/components/map/mapBounds';
import type { HidraGeographicBasemap, HidraMapAdapter, HidraMapFeatureCollection, HidraMapSelection } from '@/components/map/mapTypes';

// Let Vite emit the worker and its imports at a same-origin URL.
setWorkerUrl(workerUrl);

const SOURCE_ID = 'hidra-topology-source';
const POINT_LAYER_ID = 'hidra-topology-points';
const LINE_LAYER_ID = 'hidra-topology-lines';
const EMPTY_COLLECTION: HidraMapFeatureCollection = { type: 'FeatureCollection', features: [] };

function asGeoJson(data: HidraMapFeatureCollection): Parameters<GeoJSONSource['setData']>[0] {
  return data as unknown as Parameters<GeoJSONSource['setData']>[0];
}

export function createMapLibreAdapter(
  container: HTMLElement,
  onFeatureSelect: (selection: HidraMapSelection) => void,
  basemap?: HidraGeographicBasemap,
): HidraMapAdapter {
  const map = new MapLibreMap({
    container,
    center: basemap?.center ?? [0, 0],
    zoom: basemap ? 5.5 : 1,
    ...(basemap ? { maxBounds: basemap.bounds, locale: basemap.locale, attributionControl: false } : {}),
    style: {
      version: 8,
      sources: basemap ? { 'hidra-geography': { type: 'geojson', data: basemap.url } } : {},
      layers: [
        {
          id: 'hidra-background',
          type: 'background',
          paint: { 'background-color': basemap ? '#c8e0eb' : '#f4f6f8' },
        },
        ...(basemap ? [
          { id: 'hidra-land', type: 'fill' as const, source: 'hidra-geography', paint: { 'fill-color': '#f1efe5' } },
          { id: 'hidra-borders', type: 'line' as const, source: 'hidra-geography', paint: { 'line-color': '#84989d', 'line-width': 1 } },
        ] : []),
      ],
    },
  });

  map.addControl(new NavigationControl({ showCompass: true }), 'top-right');

  let pendingData = EMPTY_COLLECTION;
  let selectedFeatureId: string | undefined;
  let appliedSelectedFeatureId: string | undefined;
  let fittedInitialData = false;
  const markers = new Map<string, { marker: Marker; button: HTMLButtonElement }>();

  const updateMarkers = (data: HidraMapFeatureCollection) => {
    if (!basemap) return;
    const next = new Set<string>();
    for (const { id, geometry, properties } of data.features) {
      if (geometry.type !== 'Point' || !properties.markerLabel) continue;
      next.add(id);
      let entry = markers.get(id);
      const isNew = !entry;
      if (!entry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'geographic-station';
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          onFeatureSelect({ featureId: id, layerId: properties.layer });
        });
        const marker = new Marker({ element: button, anchor: 'center' });
        entry = { button, marker };
        markers.set(id, entry);
      }
      entry.button.textContent = properties.label;
      entry.button.setAttribute('aria-label', properties.markerLabel);
      entry.marker.setLngLat(geometry.coordinates as [number, number]);
      if (isNew) entry.marker.addTo(map);
    }
    for (const [id, { marker }] of markers) {
      if (next.has(id)) continue;
      marker.remove();
      markers.delete(id);
    }
  };

  const applySelection = () => {
    for (const [id, { button }] of markers) {
      button.setAttribute('aria-pressed', String(id === selectedFeatureId));
    }
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
    const bounds = getFeatureCollectionBounds(data);
    if (bounds) {
      map.fitBounds(
        [[bounds.west, bounds.south], [bounds.east, bounds.north]],
        { duration: 0, maxZoom: 12, padding: 48 },
      );
      fittedInitialData = true;
    }
  };

  const applyData = (data: HidraMapFeatureCollection) => {
    pendingData = data;
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;
    source.setData(asGeoJson(data));
    fitInitialData(data);
    updateMarkers(data);
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
    if (!basemap) map.addLayer({
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

    const handleClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const layer = feature?.properties.layer;
      if (feature?.id === undefined || typeof layer !== 'string') return;
      onFeatureSelect({ featureId: String(feature.id), layerId: layer });
    };

    if (!basemap) {
      map.on('click', LINE_LAYER_ID, handleClick);
      map.on('click', POINT_LAYER_ID, handleClick);
    }
    fitInitialData(pendingData);
    updateMarkers(pendingData);
    applySelection();
  });

  return {
    setData: applyData,
    setSelectedFeature: (featureId) => {
      selectedFeatureId = featureId;
      applySelection();
    },
    destroy: () => {
      for (const { marker } of markers.values()) marker.remove();
      map.remove();
    },
  };
}
