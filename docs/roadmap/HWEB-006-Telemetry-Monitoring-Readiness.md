# HWEB-006 — Telemetry & Monitoring Readiness

```text
Phase                  : HWEB-006 readiness gate
Implementation status  : READY FOR QUERY-FIRST IMPLEMENTATION after reconciliation CI passes
Backend source branch  : HidraAPI main
Backend source commit  : af4c3b4723619a25dd9a94f4d27f5a36adab982e
Contract artifact      : hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e
Artifact digest        : sha256:64a187d362725d7cfd674f5f130d1345f97f88e9151e65d4d5d29d74e76d932a
Realtime posture       : query/polling first; business-domain event publishers are not yet verified
```

## Readiness decision

HidraAPI now provides typed, backend-verified telemetry and monitoring query contracts and publishes them through its deterministic OpenAPI artifact. HidraWEB has added a dedicated artifact-derived HWEB-006 contract slice and Orval generation gate. This readiness work does not implement HWEB-006 screens yet; it freezes the exact backend contract that the implementation may consume.

`GAP-REALTIME-001` remains `DEFERRED`. The backend reports realtime transport as configured but does not publish verified business-domain event families. HWEB-006 must therefore be correct using HTTP query refresh/polling. It must not invent SSE/STOMP event names, destinations, payloads, ordering guarantees or recovery semantics beyond the backend capability response.

## Telemetry query endpoints

```text
GET /api/v1/telemetry/points/{pointId}/readings
GET /api/v1/telemetry/points/{pointId}/readings/latest
GET /api/v1/telemetry/points/{pointId}/trend
GET /api/v1/telemetry/reference/reading-states
GET /api/v1/telemetry/reference/quality-codes
```

The exact latest-reading route is `/points/{pointId}/readings/latest`; older roadmap wording that omitted `/readings` is not authoritative.

### Reading history parameters

```text
pointId : required path string
from    : optional date-time
to      : optional date-time
state   : optional string
page    : optional integer, default 0
size    : optional integer, default 100
```

Response: `PageReadingView`.

### Latest reading

```text
pointId : required path string
```

Response: `ReadingView`.

### Trend parameters

```text
pointId : required path string
from    : optional date-time
to      : optional date-time
limit   : optional integer, default 1000
```

Response: `ReadingView[]`.

## Monitoring query endpoints

```text
GET /api/v1/monitoring/rules
GET /api/v1/monitoring/rules/{id}
GET /api/v1/monitoring/deviations
GET /api/v1/monitoring/deviations/{id}
```

### Rule list parameters

```text
status           : optional string
topologyAssetId  : optional string
telemetryPointId : optional string
page             : optional integer, default 0
size             : optional integer, default 50
```

Response: `PageMonitoringRuleView`.

### Deviation list parameters

```text
status           : optional string
severity         : optional string
topologyAssetId  : optional string
telemetryPointId : optional string
from             : optional date-time
to               : optional date-time
page             : optional integer, default 0
size             : optional integer, default 50
```

Response: `PageDeviationView`.

## DTOs frozen from the published artifact

### ReadingView

```text
id
pointId
numericValue
textValue
booleanValue
unitId
qualityCodeId
state
sourceTimestamp
receivedAt
correlationId
rejectionReason
```

The frontend must not infer which of the value fields is authoritative beyond what the returned reading contains. Units, quality codes and reading states remain backend-owned semantics.

### PageReadingView

```text
content
page
size
totalElements
totalPages
hasNext
```

### QualityCodeView

```text
id
code
translations
sortOrder
systemDefined
active
```

`translations` values use `TranslationView(locale, name, description)`.

### MonitoringRuleView

The contract exposes identifiers/status and monitoring linkage including `telemetryPointId`, `topologyAssetId`, `topologyAssetCode`, `topologyAssetType`, rule type, evaluation frequency, planning target type and audit timestamps/actor identifiers. HidraWEB must display only fields actually present in the generated model.

### DeviationView

The contract exposes deviation identity/status/severity, actual/expected/difference values, telemetry point and topology asset linkage, unit, timestamps, evaluation/plan/expected-flow references and backend reason code/message. HidraWEB must not synthesize deviation lifecycle states or topology relationships.

### PageMonitoringRuleView / PageDeviationView

Both expose the backend page envelope:

```text
content
page
size
totalElements
totalPages
hasNext
```

## Backend-enforced permissions

The canonical permission format is `<module>:<resource>:<action>`. For the published HWEB-006 GET routes, the exact derived grants are:

```text
telemetry:points:read
telemetry:reference:read
monitoring:rules:read
monitoring:deviations:read
```

HidraWEB must use the principal-specific effective grants returned by `GET /api/v1/identity/me/permissions`; the route catalog is metadata, not the user's grant set. HidraAPI remains the final authorization boundary.

## State ownership for implementation

When HWEB-006 begins:

- TanStack Query owns reading history, latest values, trends, reading-state/quality catalogs, monitoring rules and deviations.
- React local state owns point selection, time window, table/chart presentation, filters and inspector selection.
- Topology remains the owner of graph/geospatial truth. `topologyAssetId/code/type` in monitoring responses are links to topology identity, not permission for telemetry/monitoring code to create a parallel topology model.
- No giant Zustand store or duplicated server-state cache is permitted.

## Error and degradation requirements

HWEB-006 must explicitly handle:

- missing effective telemetry/monitoring grant;
- backend 403;
- point with no readings/latest value;
- empty trend/history window;
- unavailable quality/reference catalogs;
- monitoring rule/deviation empty results;
- generic backend/query failure;
- realtime unavailable or unverified, while HTTP refresh continues to work.

## Contract-generation gate

The reconciliation adds:

```text
openapi/hidra-telemetry-monitoring-af4c3b4723619a25dd9a94f4d27f5a36adab982e.json
orval.telemetry-monitoring.config.ts
npm run api:generate:telemetry-monitoring
```

HidraWEB CI runs this generation before lint/typecheck/tests/build. HWEB-006 UI implementation may start only after this reconciliation branch is green and merged.

## Gap posture

```text
GAP-TEL-001     : IMPLEMENTED — contract frozen; not VERIFIED until HWEB-006 consumes/tests it
GAP-TEL-002     : IMPLEMENTED — contract frozen; not VERIFIED until HWEB-006 consumes/tests it
GAP-MON-001     : IMPLEMENTED — contract frozen; not VERIFIED until HWEB-006 consumes/tests it
GAP-REALTIME-001: DEFERRED — no verified business-domain event publishers
```
