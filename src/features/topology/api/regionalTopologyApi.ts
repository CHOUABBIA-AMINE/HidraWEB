import type { Feature, FeatureCollection, LayerDescriptor, SearchResult } from '@/api/generated/topology/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';
import type { RegionalFeatureReference } from '@/features/topology/model/regionalTopologySearch';

/** Accepted T34 read contract, absent from the older pinned generated slice.
 * Reuse generated Topology DTOs and never fall back to the legacy unscoped map.
 */
export function searchRegionalTopology(companyPartyId: string, query: string, page: number, size: number): Promise<SearchResult> {
  return hidraHttpClient<SearchResult>({
    method: 'GET', url: '/api/v1/topology/regional-map/search',
    params: { companyPartyId, q: query, page, size },
  });
}

export function fetchRegionalTopologyFeature(companyPartyId: string, ref: RegionalFeatureReference): Promise<Feature> {
  return hidraHttpClient<Feature>({
    method: 'GET',
    url: '/api/v1/topology/regional-map/layers/' + encodeURIComponent(ref.layer) +
      '/features/' + encodeURIComponent(ref.entityId),
    params: { companyPartyId },
  });
}

/** Source-pinned T34 regional reads: company scope belongs on EVERY request.
 * Layer and GeoJSON pagination is server authoritative. Never substitute the
 * administrator map when the regional resource is unavailable.
 */
export function fetchRegionalTopologyLayers(companyPartyId: string): Promise<LayerDescriptor[]> {
  return hidraHttpClient<LayerDescriptor[]>({
    method: 'GET', url: '/api/v1/topology/regional-map/layers',
    params: { companyPartyId },
  });
}

export function fetchRegionalTopologyLayer(companyPartyId: string, layerId: string): Promise<LayerDescriptor> {
  return hidraHttpClient<LayerDescriptor>({
    method: 'GET',
    url: '/api/v1/topology/regional-map/layers/' + encodeURIComponent(layerId),
    params: { companyPartyId },
  });
}

export function fetchRegionalTopologyLayerFeatures(
  companyPartyId: string, layerId: string, page: number, size: number,
): Promise<FeatureCollection> {
  return hidraHttpClient<FeatureCollection>({
    method: 'GET',
    url: '/api/v1/topology/regional-map/layers/' + encodeURIComponent(layerId) + '/features',
    params: { companyPartyId, page, size },
  });
}

export function fetchRegionalTopologyGeoJson(
  companyPartyId: string, layers: readonly string[], page: number, size: number,
): Promise<FeatureCollection> {
  return hidraHttpClient<FeatureCollection>({
    method: 'GET', url: '/api/v1/topology/regional-map/geojson',
    params: { companyPartyId, layers: layers.join(','), page, size },
  });
}
