# HWEB-006 — Telemetry & Monitoring Workspace

```text
Phase                  : HWEB-006
Implementation status  : IMPLEMENTED — branch CI VERIFIED
Frontend base          : 483f6a21435c7c751cd8ff8632197d496f13a13a / main
Implementation branch  : hweb-006-telemetry-monitoring-workspace-v2
Verified branch commit : ac74c2bb0353483439f9faa186d0fc5c0a21fd46
Backend source branch  : HidraAPI main
Backend source commit  : af4c3b4723619a25dd9a94f4d27f5a36adab982e
Contract artifact      : hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e
Artifact digest        : sha256:64a187d362725d7cfd674f5f130d1345f97f88e9151e65d4d5d29d74e76d932a
Branch CI              : run 34606659029 — SUCCESS
Realtime posture       : query/polling first; business-domain event publishers remain unverified
```

## Completion decision

HWEB-006 now implements the query-first Telemetry & Monitoring workspace at `/operations` using only the artifact-derived HidraAPI contract. The feature is capability-aware, keeps server state in TanStack Query, keeps point/time/filter/presentation state local to React, and does not create a competing topology or telemetry domain model.

The backend does not currently publish a telemetry-point discovery endpoint for this phase. HidraWEB therefore accepts a known `pointId` rather than inventing discovery semantics. Future topology-to-telemetry navigation may preselect a point only when an exact backend-supported linkage contract is available.

`GAP-REALTIME-001` remains `DEFERRED`. HTTP query refresh/polling is the supported HWEB-006 operating mode. No SSE/STOMP event names, destinations, payloads, ordering guarantees, or domain-event semantics were invented.

## Consumed telemetry contracts

```text
GET /api/v1/telemetry/points/{pointId}/readings
GET /api/v1/telemetry/points/{pointId}/readings/latest
GET /api/v1/telemetry/points/{pointId}/trend
GET /api/v1/telemetry/reference/reading-states
GET /api/v1/telemetry/reference/quality-codes
```

The authoritative latest-reading route is `/api/v1/telemetry/points/{pointId}/readings/latest`.

The workspace supports:

- known telemetry point selection by `pointId`;
- latest reading display;
- bounded history query with optional from/to/state filters;
- numeric trend rendering from returned readings without inventing value semantics;
- backend-owned reading-state and quality-code reference catalogs;
- explicit empty, forbidden, reference-unavailable, and generic-error states;
- HTTP refresh, with the latest reading periodically refreshed without claiming realtime event delivery.

## Consumed monitoring contracts

```text
GET /api/v1/monitoring/rules
GET /api/v1/monitoring/rules/{id}
GET /api/v1/monitoring/deviations
GET /api/v1/monitoring/deviations/{id}
```

The workspace lists monitoring rules and deviations independently of telemetry-point selection. Backend-returned topology asset identifiers/codes are displayed as linkage metadata only; topology remains the owner of graph and geospatial truth. Contextual inspectors display backend fields without synthesizing monitoring lifecycle or topology relationships and preserve the `/operations` route.

## DTO and semantic rules

HWEB-006 consumes generated `ReadingView`, `PageReadingView`, `QualityCodeView`, `MonitoringRuleView`, `DeviationView`, `PageMonitoringRuleView`, and `PageDeviationView` types from the published contract slice.

For readings, HidraWEB does not infer which of `numericValue`, `textValue`, or `booleanValue` is authoritative beyond what the returned reading actually contains. Units, reading states, quality codes, monitoring rule types, deviation states, severities, reasons, and topology relationships remain backend-owned semantics.

## Backend-enforced permissions

```text
telemetry:points:read
telemetry:reference:read
monitoring:rules:read
monitoring:deviations:read
```

HidraWEB consumes principal-specific effective grants from `GET /api/v1/identity/me/permissions`. The route catalog remains metadata only, and HidraAPI remains the final authorization boundary. Telemetry and monitoring grants are evaluated independently so monitoring remains usable when telemetry access is absent.

## State ownership

- TanStack Query owns latest readings, history, trends, reference catalogs, rules, and deviations.
- React local state owns point input/selection, time window, state filter, and presentation state.
- Topology owns graph/geospatial truth; monitoring topology asset fields are references only.
- No Zustand server-state mirror or giant global feature store was introduced.

## Verification evidence

HWEB-006 adds:

```text
src/features/telemetry-monitoring/TelemetryMonitoringPage.tsx
src/features/telemetry-monitoring/api/telemetryMonitoringApi.ts
src/features/telemetry-monitoring/api/telemetryMonitoringPermissions.ts
src/features/telemetry-monitoring/model/telemetryPresentation.ts
src/features/telemetry-monitoring/components/BackendObjectInspector.tsx
src/features/telemetry-monitoring/i18n/telemetryMonitoringTranslations.ts
src/features/telemetry-monitoring/api/telemetryMonitoringApi.test.ts
src/features/telemetry-monitoring/TelemetryMonitoringPage.test.tsx
tests/e2e/operations.spec.ts
```

CI run `34606659029` at `ac74c2bb0353483439f9faa186d0fc5c0a21fd46` completed successfully with:

- HWEB-003/004/005/006 OpenAPI generation;
- lint;
- typecheck;
- unit and component tests;
- production build;
- Playwright Chromium installation;
- E2E browser tests.

The E2E suite verifies the full telemetry/monitoring-grant path and a monitoring-only-grant path. Component/API tests verify the workspace behavior and exact published telemetry/monitoring routes.

## Gap posture after HWEB-006

```text
GAP-TEL-001     : VERIFIED — generated contract consumed and frontend-tested
GAP-TEL-002     : VERIFIED — backend reference catalogs consumed and frontend-tested
GAP-MON-001     : VERIFIED — rules/deviations consumed and frontend-tested
GAP-REALTIME-001: DEFERRED — no verified business-domain event publishers
```

HWEB-006 is ready for PR review/merge. HWEB-007 must not begin from this branch until HWEB-006 is merged and post-merge `main` CI is green.
