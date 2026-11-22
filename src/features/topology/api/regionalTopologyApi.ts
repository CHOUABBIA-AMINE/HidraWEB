import type { Feature, SearchResult } from '@/api/generated/topology/model';
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
