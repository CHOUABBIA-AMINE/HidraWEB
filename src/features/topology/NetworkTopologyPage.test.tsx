import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/app/App';
import { AppProviders } from '@/app/providers/AppProviders';

const fixtures = vi.hoisted(() => {
  const routes = [
    { route: '/api/v1/topology/map/layers', methods: ['GET'], module: 'topology', resource: 'map', action: 'read', permission: 'HIDRA_TOPOLOGY_MAP_READ', enforcementStatus: 'metadata-published' },
    { route: '/api/v1/topology/map/search', methods: ['GET'], module: 'topology', resource: 'map', action: 'search', permission: 'HIDRA_TOPOLOGY_MAP_SEARCH', enforcementStatus: 'metadata-published' },
  ];
  const layer = { id: 'facilities', label: 'Facilities', geometryType: 'Point', description: 'Facility locations', featuresEndpoint: '/api/v1/topology/map/layers/facilities/features' };
  const feature = {
    type: 'Feature', id: 'facility-1', geometry: { type: 'Point', coordinates: [2.1, 36.7] },
    properties: { layer: 'facilities', entityType: 'facility', entityId: 'facility-1', code: 'FAC-1', nameAr: null, nameFr: 'Station 1', nameEn: null, status: 'ACTIVE', facilityKind: null, nodeType: null, pipelineSystemId: null, pipelineType: null, fromNodeId: null, toNodeId: null, segmentType: null, flowDirection: null, connectionType: null },
  };
  const collection = { type: 'FeatureCollection', name: 'topology-map', layer: null, page: 0, size: 1000, totalFeatures: 1, totalPages: 1, hasNext: false, layers: ['facilities'], features: [feature] };
  return { routes, layer, feature, collection };
});

vi.mock('@/components/map/HidraMap', () => ({
  HidraMap: () => <div data-testid="hidra-map" />,
}));

vi.mock('@/api/client/hidraHttpClient', () => ({
  hidraHttpClient: vi.fn(async (config: { url?: string }) => {
    if (config.url?.endsWith('/security/permissions/catalog')) {
      return { strategy: 'derived-route-permission-catalog', enforcement: 'catalog-only', permissionFormat: 'HIDRA_<MODULE>_<RESOURCE>_<ACTION>', routes: fixtures.routes };
    }
    if (config.url?.endsWith('/security/permissions/routes')) return fixtures.routes;
    if (config.url === '/api/v1/topology/map/layers') return [fixtures.layer];
    if (config.url === '/api/v1/topology/map/layers/facilities') return fixtures.layer;
    if (config.url === '/api/v1/topology/map/layers/facilities/features') return { ...fixtures.collection, layer: 'facilities', size: 25 };
    if (config.url === '/api/v1/topology/map/geojson') return fixtures.collection;
    if (config.url === '/api/v1/topology/map/search') return { query: 'FAC', type: 'FeatureCollection', page: 0, size: 50, totalFeatures: 1, totalPages: 1, hasNext: false, features: [fixtures.feature] };
    throw new Error(`Unexpected test request ${config.url}`);
  }),
}));

describe('HWEB-005 network topology workspace', () => {
  it('loads backend layers and geometry and opens the contextual inspector without navigating away', async () => {
    render(<AppProviders><App /></AppProviders>);

    fireEvent.change(await screen.findByLabelText(/Nom d’utilisateur/), { target: { value: 'operator' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(await screen.findByRole('heading', { name: /Vue d/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Réseau' }));

    expect(await screen.findByRole('heading', { name: 'Réseau & topologie' })).toBeInTheDocument();
    expect(await screen.findByTestId('hidra-map')).toBeInTheDocument();
    expect(await screen.findByText('FAC-1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Inspecter' }));
    expect(await screen.findByRole('heading', { name: 'FAC-1' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/network');
  });
});
