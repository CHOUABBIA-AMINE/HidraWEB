# 18 — Topology & Map Specification

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

- Leaflet map container with layer tree.
- GeoJSON renderer per layer.
- Marker clustering for facilities/nodes.
- Polyline styling for pipeline segments.
- Popup and side panel for feature details.
- Legend synchronized with visible layers.
- Search box calling backend topology search endpoint.
- Filter drawer for layer, status, operating region and text search when backend supports them.
- Realtime overlays from SSE/STOMP only when events include layer/resource identifiers.

## Editing capabilities

Unable to determine from available evidence. Current topology map endpoints are read/search visualization contracts; no geometry editing endpoint evidence was found.
