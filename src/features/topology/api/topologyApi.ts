import type { FeatureCollection, LayerDescriptor, SearchResult } from '@/api/generated/topology/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export const topologyQueryKeys = {
  layers: ['hidra', 'topology', 'map', 'layers'] as const,
  layer: (layerId: string) => ['hidra', 'topology', 'map', 'layers', layerId] as const,
  layerFeatures: (layerId: string, page: number, size: number, query: string) =>
    ['hidra', 'topology', 'map', 'layers', layerId, 'features', page, size, query] as const,
  geoJson: (layers: readonly string[], page: number, size: number) =>
    ['hidra', 'topology', 'map', 'geojson', layers.join(','), page, size] as const,
  search: (query: string, page: number, size: number) =>
    ['hidra', 'topology', 'map', 'search', query, page, size] as const,
};

function segment(value: string): string {
  return encodeURIComponent(value);
}

export function fetchTopologyLayers(): Promise<LayerDescriptor[]> {
  return hidraHttpClient<LayerDescriptor[]>({ method: 'GET', url: '/api/v1/topology/map/layers' });
}

export function fetchTopologyLayer(layerId: string): Promise<LayerDescriptor> {
  return hidraHttpClient<LayerDescriptor>({
    method: 'GET',
    url: `/api/v1/topology/map/layers/${segment(layerId)}`,
  });
}

export interface TopologyLayerFeaturesRequest {
  layerId: string;
  page?: number;
  size?: number;
  query?: string;
}

export function fetchTopologyLayerFeatures(request: TopologyLayerFeaturesRequest): Promise<FeatureCollection> {
  return hidraHttpClient<FeatureCollection>({
    method: 'GET',
    url: `/api/v1/topology/map/layers/${segment(request.layerId)}/features`,
    params: {
      page: request.page ?? 0,
      size: request.size ?? 25,
      ...(request.query?.trim() ? { q: request.query.trim() } : {}),
    },
  });
}

export interface TopologyGeoJsonRequest {
  layers: readonly string[];
  page?: number;
  size?: number;
}

export function fetchTopologyGeoJson(request: TopologyGeoJsonRequest): Promise<FeatureCollection> {
  return hidraHttpClient<FeatureCollection>({
    method: 'GET',
    url: '/api/v1/topology/map/geojson',
    params: {
      layers: request.layers.join(','),
      page: request.page ?? 0,
      size: request.size ?? 1000,
    },
  });
}

export interface TopologySearchRequest {
  query: string;
  page?: number;
  size?: number;
}

export function searchTopology(request: TopologySearchRequest): Promise<SearchResult> {
  return hidraHttpClient<SearchResult>({
    method: 'GET',
    url: '/api/v1/topology/map/search',
    params: {
      q: request.query.trim(),
      page: request.page ?? 0,
      size: request.size ?? 50,
    },
  });
}
