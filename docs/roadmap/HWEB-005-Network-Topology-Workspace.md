# HWEB-005 — Network & Topology Workspace

```text
Phase                  : HWEB-005
Status                 : IMPLEMENTED — CI verification pending
Frontend branch        : hweb-005-network-topology-workspace
Backend source branch  : HidraAPI main
Backend source commit  : e5385f0e1f8bb88b48c8e1368962ef72ec6922ae
Frontend base commit   : 400c8333ae0ea7aa7f257fe355c2472607076703
```

## Backend readiness decision

HWEB-004 is merged. Its implementation/register branch passed the full existing HidraWEB CI gate before merge.

HidraAPI topology readiness was re-audited against current source rather than the stale gap labels. The topology slice publishes typed map contracts and six backend-owned layers, and the topology remediation slice passed backend CI in PR #51. Current overall HidraAPI `main` is nevertheless compile-red because later workflow remediation references missing `HidraEffectivePermissionResolver`; this is recorded as a backend caveat rather than hidden.

HidraAPI does not yet publish a deterministic CI OpenAPI artifact (`GAP-CONTRACT-001`). HWEB-005 therefore retains one explicit temporary exception: `openapi/hidra-topology-e5385f0e1f8bb88b48c8e1368962ef72ec6922ae.json`, reconciled from the exact current topology controller/use-case/adapter source. It must be replaced by the authoritative artifact when backend publication exists.

## Endpoints and DTOs used

```text
GET /api/v1/topology/map/layers
GET /api/v1/topology/map/layers/{layerId}
GET /api/v1/topology/map/layers/{layerId}/features
GET /api/v1/topology/map/geojson
GET /api/v1/topology/map/search
```

Generated DTOs consumed from the HWEB-005 Orval contract:

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

Only layers returned by HidraAPI are rendered. Current backend source publishes `pipeline-systems`, `pipelines`, `facilities`, `topology-nodes`, `pipeline-segments`, and `topology-connections`; the frontend does not maintain a competing business layer catalog.

## Permissions used

```text
HIDRA_TOPOLOGY_MAP_READ
HIDRA_TOPOLOGY_MAP_SEARCH
```

These names come from the backend route-permission metadata convention and current registered topology routes. Backend metadata remains catalog-only; UI gating is convenience behavior and HidraAPI remains the final authorization boundary.

## Frontend routes created/changed

```text
/network  -> specialized NetworkTopologyPage
```

The existing stable `Réseau` navigation entry becomes implemented only for the topology capability module.

## State ownership

- TanStack Query: layer catalog, layer descriptor, sampled layer features, GeoJSON feature window, topology search results.
- React local state: hidden layers, focused layer, search text, committed search, selected feature.
- Contextual drawer: inspector presentation only; selection does not navigate away from `/network` or recreate map state.
- Zustand: no topology entity store introduced.

## Map architecture

`src/components/map/HidraMap.tsx` is the implementation-neutral frontend boundary. MapLibre is dynamically loaded only from `src/components/map/adapters/maplibreAdapter.ts`; topology features import no MapLibre implementation type. Backend feature geometry is validated and converted to the Hidra map boundary without adding business geometry or inferred relationships.

A keyboard-accessible feature list is provided alongside the visual map. The map renders only the first count-aware backend window (1,000 features) and displays loaded/total counts plus `hasNext` as a performance guardrail instead of implying the entire network is resident.

## Error states

- missing topology read capability -> constrained warning, no fake topology data;
- 403 from HidraAPI -> explicit access-denied topology state;
- other layer/GeoJSON/search failures -> backend load error;
- no backend layers -> empty state;
- all layers hidden -> explicit local empty-map state;
- MapLibre adapter initialization failure -> map-boundary error while non-map accessible data remains available.

## Tests added

- topology API adapter route/parameter contract test;
- typed topology-to-map presentation conversion test;
- component integration test proving `/network`, layer/GeoJSON loading and contextual inspection without route loss;
- Playwright HWEB-005 test covering authentication, capability-gated navigation, topology loading, inspector route preservation and topology search.

## OpenAPI regeneration status

`orval.topology.config.ts` and `npm run api:generate:topology` are added. CI generates HWEB-003, HWEB-004 and HWEB-005 clients before lint/typecheck/tests/build. The HWEB-005 snapshot remains temporary because the backend artifact gap is still open.

## Relevant GAP-* status

Before frontend CI, `GAP-TOPO-001`, `GAP-TOPO-002`, and `GAP-TOPO-003` are `IMPLEMENTED`. They must move to `VERIFIED` only after this branch consumes the generated contract and the mandatory frontend gate passes.

## Known backend gaps

- `GAP-CONTRACT-001` — stable repository-published OpenAPI artifact remains `OPEN`.
- `GAP-SEC-003` — effective user-specific grants/backend route authorization remains `IN_PROGRESS`.
- current HidraAPI main compile failure in workflow remediation; topology PR #51 itself was previously green.
- realtime contracts remain out of scope for HWEB-005 and `GAP-REALTIME-001` remains `OPEN`.

## CI result

Pending first HWEB-005 branch CI run. Do not mark phase complete or start HWEB-006 until every mandatory gate passes and the topology GAPs are promoted to `VERIFIED` with test evidence.
