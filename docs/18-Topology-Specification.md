# 18 — Topology & Map Specification

## Architecture authority

This specification follows:

- [`architecture/HidraWeb-Information-Architecture.md`](architecture/HidraWeb-Information-Architecture.md)
- [`architecture/Hidra-API-Web-Contract-v1.md`](architecture/Hidra-API-Web-Contract-v1.md)
- [`architecture/HidraWeb-Technical-Architecture.md`](architecture/HidraWeb-Technical-Architecture.md)

## Backend evidence

Topology map APIs currently expose:

- `GET /api/v1/topology/map/layers`
- `GET /api/v1/topology/map/layers/{layerId}`
- `GET /api/v1/topology/map/layers/{layerId}/features`
- `GET /api/v1/topology/map/geojson`
- `GET /api/v1/topology/map/search`

Supported layers from current backend evidence: **facilities, pipeline-segments, topology-connections, topology-nodes**.

## Layer interpretation

- `facilities`: stations, terminals and operational facilities.
- `topology-nodes`: network nodes.
- `pipeline-segments`: renderable line sections; pipelines are currently implicit through segment properties.
- `topology-connections`: logical network relationships.

## Important gap

Explicit `pipeline-systems` and `pipelines` GIS layers are not currently present in backend evidence. The frontend must not pretend these are available. It may group by segment properties when provided, but the gap remains.

## Map architecture

Canonical map engine: **MapLibre GL JS**, isolated behind the Hidra-owned map abstraction defined by the technical architecture.

Required composition:

```text
Topology feature/process UI
  -> HidraMap / map components
  -> maplibreAdapter
  -> MapLibre GL JS
```

Requirements:

- GeoJSON renderer per backend layer.
- Layer registry/tree synchronized with HidraAPI layer metadata.
- Data-driven operational styling for facilities, nodes, pipeline segments and connections.
- Clustering/aggregation for dense point layers when required by scale and supported by the presentation design.
- Pipeline-segment line styling based on backend properties without inventing unsupported operational states.
- Feature selection with popup or contextual asset inspector.
- Legend synchronized with visible layers/styles.
- Search using `GET /api/v1/topology/map/search`.
- Filters only for properties/parameters supported by backend contracts or explicit frontend-only visual filtering.
- Realtime overlays from SSE/STOMP only when event payloads provide sufficient stable resource/layer identity.
- MapLibre-specific types and APIs must not leak into business modules outside the map adapter/public map boundary.

## GeoJSON contract

HidraWeb shall consume backend GeoJSON directly as the spatial transport format.

Do not introduce a custom frontend geometry protocol.

Stable feature/resource IDs must be preserved so map selections can navigate to the correct HidraWeb entity/workspace.

## Future scale evolution

The initial backend contract is GeoJSON/layer based.

If network size later requires server-side vector tiles, the frontend architecture shall evolve behind `HidraMap`/layer adapters so business workspaces are not rewritten.

The existence of this future path does not mean vector-tile endpoints are currently implemented.

## Editing capabilities

Unable to determine from available evidence. Current topology map endpoints are read/search visualization contracts; no geometry editing endpoint evidence was found.

HidraWeb must not expose geometry editing until an explicit HidraAPI contract exists.
