# HWEB-005 — Network & Topology Workspace

```text
Phase                  : HWEB-005
Status                 : COMPLETE — revalidated on remediated HidraAPI contract
Frontend implementation: merged by PR #7
Frontend merge commit  : 72cf67322a5a76303f86ba3e55ea360a9ad6e5e7
Backend source branch  : HidraAPI main
Backend source commit  : af4c3b4723619a25dd9a94f4d27f5a36adab982e
Contract artifact      : hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e
Artifact digest        : sha256:64a187d362725d7cfd674f5f130d1345f97f88e9151e65d4d5d29d74e76d932a
```

## Backend readiness decision

HidraAPI remediation is complete for the HWEB-005 dependencies. Backend `main` at `af4c3b4723619a25dd9a94f4d27f5a36adab982e` passes compile, test, clean verify and acceptance Maven gates. Its CI boots the verified application, publishes `/v3/api-docs`, deterministically sorts the contract and uploads the SHA-named OpenAPI artifact listed above.

HidraWEB no longer depends on the source-derived topology snapshot that was required while `GAP-CONTRACT-001` was open. The topology Orval input is now `openapi/hidra-topology-af4c3b4723619a25dd9a94f4d27f5a36adab982e.json`, an extracted topology slice of the backend-published artifact with the backend SHA, artifact name and digest recorded in the document itself.

## Endpoints and DTOs used

```text
GET /api/v1/topology/map/layers
GET /api/v1/topology/map/layers/{layerId}
GET /api/v1/topology/map/layers/{layerId}/features
GET /api/v1/topology/map/geojson
GET /api/v1/topology/map/search
```

Generated DTOs consumed by HWEB-005:

```text
LayerDescriptor
PointGeometry
LineStringGeometry
MultiLineStringGeometry
Geometry
FeatureProperties
Feature
FeatureCollection
SearchResult
```

Only layer descriptors returned by HidraAPI are rendered. HidraWEB does not maintain a competing topology business catalog or infer additional graph relationships.

## Permissions used

The backend remediation replaced the historical `HIDRA_*` metadata convention with the canonical, backend-enforced permission format `<module>:<resource>:<action>`.

HWEB-005 therefore uses:

```text
topology:map:read
topology:map:search
```

HidraWEB now obtains principal-specific effective grants from:

```text
GET /api/v1/identity/me/permissions
```

The route catalog remains useful for metadata and module discovery, but it is no longer treated as the current user's authorization set. `HidraRouteAuthorizationInterceptor` remains the authoritative backend authorization boundary. The frontend supports the backend administrative wildcard grant `*`.

## Frontend route

```text
/network  -> NetworkTopologyPage
```

The `Réseau` navigation capability is shown only when effective grants provide the corresponding topology module capability. Selection and inspection stay on `/network` and preserve map state.

## State ownership

- TanStack Query owns layer catalog, layer descriptors, sampled layer features, GeoJSON windows and search results.
- React local state owns hidden layers, focused layer, search text, committed search and selected feature.
- The contextual drawer owns inspector presentation only.
- No topology entity store or giant Zustand store was introduced.

## Map architecture

`src/components/map/HidraMap.tsx` is the implementation-neutral map boundary. MapLibre is dynamically loaded only by `src/components/map/adapters/maplibreAdapter.ts`; topology feature code imports no MapLibre implementation types.

Backend feature geometry is validated at the presentation boundary and converted to Hidra map types without inventing geometry or business relationships. The accessible feature list remains available alongside the visual map. Feature loading is count-aware and bounded; the page exposes loaded/total information and `hasNext` rather than implying that the complete network is resident in memory.

## Error states

- effective grant absent -> capability-constrained state;
- backend 403 -> explicit access-denied state;
- layer/GeoJSON/search failure -> backend load error;
- no backend layers -> empty state;
- all layers hidden -> explicit local empty-map state;
- map adapter initialization failure -> map-boundary error while accessible non-map data remains available.

## Tests and validation

HWEB-005 includes:

- topology API adapter route/parameter tests;
- typed topology-to-map presentation conversion tests;
- component integration proving layer/GeoJSON loading and contextual inspection without route loss;
- Playwright coverage for authentication, effective capability gating, topology loading, search and inspector route preservation;
- full frontend generation/lint/typecheck/unit/build/E2E quality gates.

The original HWEB-005 PR and post-merge `main` CI passed. The subsequent API-remediation reconciliation additionally regenerates HWEB-005 from the backend-published `af4c3b47…` artifact and updates the permission fixtures to the backend-enforced lower-case grants.

## OpenAPI status

`orval.topology.config.ts` now generates from the artifact-derived `af4c3b47…` topology slice. The obsolete `e5385f0…` source-derived topology snapshot has been removed. HWEB-003 and HWEB-004 generators are rebaselined the same way, and HWEB-006 telemetry/monitoring contract generation has been added as the next readiness gate.

## Relevant GAP status

After the reconciliation branch passes the full frontend quality gate:

- `GAP-TOPO-001` — `VERIFIED`.
- `GAP-TOPO-002` — `VERIFIED`.
- `GAP-TOPO-003` — `VERIFIED`.
- `GAP-CONTRACT-001` — backend implementation is now consumed by HidraWEB and can be promoted to `VERIFIED` for frontend contract generation.
- `GAP-SEC-001` / `GAP-SEC-003` — effective-grant consumption is wired; live allowed/forbidden identity integration evidence remains the final production verification gate.
- `GAP-REALTIME-001` — remains `DEFERRED`; HWEB-005 does not depend on realtime domain publishers.

## Remaining caveats

There is no longer a HidraAPI compile failure or deterministic-OpenAPI publication gap at the reconciled SHA. The remaining cross-cutting caveats are external enterprise IdP registration/integration proof and the intentionally deferred realtime domain-event publication catalog.
