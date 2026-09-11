# HidraAPI ↔ HidraWEB Backend Gap Register

```text
Document role          : Canonical frontend-facing backend contract acceptance register
Frontend repository    : CHOUABBIA-AMINE/HidraWEB
Backend source of truth: CHOUABBIA-AMINE/HidraAPI main
Backend baseline       : af4c3b4723619a25dd9a94f4d27f5a36adab982e
OpenAPI artifact       : hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e
Artifact digest        : sha256:64a187d362725d7cfd674f5f130d1345f97f88e9151e65d4d5d29d74e76d932a
Reconciled             : 2026-09-11
Owner model            : HidraAPI owns business/security truth; HidraWEB records consumer verification
```

## Status vocabulary

| Status | Meaning |
|---|---|
| `OPEN` | Required backend capability is absent. |
| `IN_PROGRESS` | Capability is partial or not yet a usable contract. |
| `IMPLEMENTED` | Backend contract exists and is backend-verified, but the relevant frontend phase has not yet consumed/tested it. |
| `VERIFIED` | HidraWEB consumes the contract and frontend tests prove the required behavior. |
| `DEFERRED` | Intentionally postponed with an explicit constraint. |
| `NOT_REQUIRED` | Requirement was removed or satisfied by another approved mechanism. |

## Reconciliation result

HidraAPI `main` at `af4c3b47…` is the current accepted backend baseline. Its post-remediation CI passes compile, tests and clean verification, boots the application, retrieves `/v3/api-docs`, deterministically sorts the document and uploads the SHA-named OpenAPI artifact above.

HidraWEB consumes artifact-derived contract slices for HWEB-003 workbench, HWEB-004 identity/organization, HWEB-005 topology, HWEB-006 telemetry/monitoring, and HWEB-007 workflow. The obsolete hand/source-derived snapshots have been retired. Springdoc optionality is preserved: HidraWEB normalizes optional response fields at its presentation/API boundary rather than falsifying the published schema.

Backend route authorization is enforced with canonical `<module>:<resource>:<action>` permissions. HidraWEB obtains principal-specific effective grants from `GET /api/v1/identity/me/permissions`; the route catalog is metadata, not the current user's grant set. HidraAPI remains the final authorization boundary.

---

## Cross-cutting

### GAP-SEC-001 — Authenticated principal/effective grants

```text
Status          : IMPLEMENTED
Backend evidence: GET /api/v1/identity/me and GET /api/v1/identity/me/permissions.
Frontend state  : Effective permissions are now consumed by PermissionProvider for capability-aware UX.
Verification gap: Keep IMPLEMENTED until live allowed/forbidden identities are exercised against a real backend/IdP environment; current automated frontend tests mock the contract.
```

### GAP-SEC-002 — Enterprise OIDC/JWT acquisition contract

```text
Status          : IMPLEMENTED
Backend evidence: GET /api/v1/security/oidc publishes the browser authorization-code/PKCE contract and non-secret runtime metadata.
External gate   : Enterprise IdP/client registration and environment credentials remain deployment-owned.
Frontend state  : Production OIDC integration is not yet frontend-verified.
```

### GAP-SEC-003 — User-specific authorization enforcement

```text
Status          : IMPLEMENTED
Backend evidence: HidraEffectivePermissionResolver + HidraRouteAuthorizationInterceptor enforce /api/v1/** permissions; admin wildcard is '*'.
Frontend state  : HidraWEB consumes effective grants and uses lower-case canonical permission names. Backend remains authoritative.
Verification gap: Live permitted/forbidden identity integration evidence is still required before VERIFIED.
```

### GAP-CONTRACT-001 — Stable repository-published OpenAPI artifact

```text
Status          : VERIFIED
Backend evidence: HidraAPI CI publishes hidra-api-openapi-${github.sha}; accepted artifact/digest are recorded above.
Frontend evidence: HWEB-003/004/005/006/007 Orval inputs use slices extracted from that published artifact. CI regenerates all five slices before lint/typecheck/tests/build.
Retired         : Source-derived workbench, identity/organization and topology snapshots.
```

### GAP-REALTIME-001 — Realtime business-event catalog

```text
Status          : DEFERRED
Backend evidence: Realtime transport endpoints/capabilities exist, but capabilities report transport-configured-no-domain-publishers and an empty event-family catalog.
Frontend rule   : HWEB-006 and later phases must remain correct with HTTP query refresh/polling and must not invent event names, destinations, payloads, ordering or recovery semantics.
Completion gate : Backend publishes and tests actual domain event families and exposes their contracts.
```

---

## HWEB-004 identity and organization

### GAP-ID-001 — Dedicated identity reads

```text
Status          : IMPLEMENTED
Evidence        : Dedicated user/role/permission administration query APIs exist in the published backend contract.
Frontend state  : HWEB-004 still uses its accepted workbench-read path; dedicated reads are not yet consumed.
```

### GAP-ID-002 — Role/permission administration mutations

```text
Status          : IMPLEMENTED
Evidence        : Backend supports role/permission creation and user-role, role-permission and user-permission grants.
Frontend state  : Not yet consumed by HWEB-004/HWEB-014 UI.
```

### GAP-ORG-001 — Dedicated organization reads

```text
Status          : IMPLEMENTED
Evidence        : Dedicated units, hierarchy, employees and assignments query APIs are present in the published contract.
Frontend state  : HWEB-004 still uses its accepted workbench-read context; dedicated organization queries are not yet consumed.
```

---

## HWEB-005 network/topology

### GAP-TOPO-001 — Strongly typed topology map contract

```text
Status          : VERIFIED
Routes          : GET /api/v1/topology/map/layers
                  GET /api/v1/topology/map/layers/{layerId}
                  GET /api/v1/topology/map/layers/{layerId}/features
                  GET /api/v1/topology/map/geojson
                  GET /api/v1/topology/map/search
DTOs            : LayerDescriptor, PointGeometry, LineStringGeometry, MultiLineStringGeometry, FeatureProperties, Feature, FeatureCollection, SearchResult.
Frontend evidence: HWEB-005 consumes generated artifact-derived types, validates optional geometry/properties at the presentation boundary, and has API/model/component/E2E coverage.
```

### GAP-TOPO-002 — Backend-owned network layers

```text
Status          : VERIFIED
Evidence        : Backend publishes pipeline-systems, pipelines, facilities, topology-nodes, pipeline-segments and topology-connections.
Frontend evidence: HWEB-005 builds its presentation registry only from returned LayerDescriptor values; no competing frontend business-layer catalog is maintained.
```

### GAP-TOPO-003 — Count-aware topology paging

```text
Status          : VERIFIED
Evidence        : FeatureCollection/SearchResult expose page, size, totalFeatures, totalPages and hasNext.
Frontend evidence: HWEB-005 bounds map/sample loads, displays loaded/total/page information and exposes the limited-window state.
```

HWEB-005 canonical permissions after backend remediation:

```text
topology:map:read
topology:map:search
```

---

## HWEB-006 telemetry and monitoring

HWEB-006 is implemented at `/operations` from the accepted artifact-derived telemetry/monitoring slice. Branch CI run `34606659029` at `ac74c2bb0353483439f9faa186d0fc5c0a21fd46` passed OpenAPI generation, lint, typecheck, unit/component tests, production build, and E2E tests.

The backend does not currently expose a telemetry-point discovery API for this phase, so HidraWEB accepts a known `pointId` rather than inventing discovery semantics. Realtime remains query/polling first under `GAP-REALTIME-001`.

### GAP-TEL-001 — Reading/history/latest/trend queries

```text
Status          : VERIFIED
Routes          : GET /api/v1/telemetry/points/{pointId}/readings
                  GET /api/v1/telemetry/points/{pointId}/readings/latest
                  GET /api/v1/telemetry/points/{pointId}/trend
Frontend evidence: HWEB-006 consumes the generated ReadingView/PageReadingView contracts for latest, bounded history and trend presentation; exact route coverage exists in telemetryMonitoringApi.test.ts and workspace/component/E2E coverage passes.
```

The authoritative latest-reading path is `/api/v1/telemetry/points/{pointId}/readings/latest`; earlier roadmap text omitting `/readings` is superseded.

### GAP-TEL-002 — Quality/state reference catalogs

```text
Status          : VERIFIED
Routes          : GET /api/v1/telemetry/reference/reading-states
                  GET /api/v1/telemetry/reference/quality-codes
Frontend evidence: HWEB-006 loads backend reference catalogs and uses returned reading-state/quality identifiers without hard-coding SCADA semantics. Reference-unavailable degradation is handled explicitly.
```

### GAP-MON-001 — Monitoring rules and deviations queries

```text
Status          : VERIFIED
Routes          : GET /api/v1/monitoring/rules
                  GET /api/v1/monitoring/rules/{id}
                  GET /api/v1/monitoring/deviations
                  GET /api/v1/monitoring/deviations/{id}
Frontend evidence: HWEB-006 lists rules/deviations, supports independent monitoring-only grants, displays backend topology linkage metadata without duplicating topology truth, and provides contextual backend-field inspectors. Component/API/E2E tests pass.
```

HWEB-006 canonical read grants:

```text
telemetry:points:read
telemetry:reference:read
monitoring:rules:read
monitoring:deviations:read
```

HWEB-006 state rule: TanStack Query owns server state; React local state owns point/time/filter/selection/presentation state; topology remains owner of graph/geospatial truth; no giant Zustand server-state mirror is permitted.

---

## HWEB-007 workflow

HWEB-007 is implemented at `/work/tasks` for the published query/action-visibility contract. Behavioral branch CI run `34609250694` at `b95c88f1d9ad140009b22fcf2bb9324a41feed9e` passed all five OpenAPI generation gates, lint, typecheck, 17/17 unit/component tests, production build, and 12/12 Playwright tests.

Canonical HWEB-007 read grants:

```text
workflow:tasks:read
workflow:instances:read
```

### GAP-WF-001 — Task inbox/query

```text
Status          : VERIFIED
Routes          : GET /api/v1/workflow/tasks
                  GET /api/v1/workflow/tasks/{id}
Frontend evidence: HWEB-007 exposes an assigned-task inbox plus task detail using generated TaskView/PageTaskView contracts. Effective workflow grants control workspace access, and component/E2E tests cover the consumed routes.
```

### GAP-WF-002 — Instance/timeline history

```text
Status          : VERIFIED
Routes          : GET /api/v1/workflow/instances/{id}
                  GET /api/v1/workflow/instances/{id}/timeline
Frontend evidence: Selecting a task with an instanceId loads the backend instance and timeline through TanStack Query. Timeline action/decision/actor/comment fields are displayed without synthesizing lifecycle semantics, and automated tests cover the behavior.
```

### GAP-WF-003 — Backend-provided available actions

```text
Status          : VERIFIED
Route           : GET /api/v1/workflow/tasks/{id}/available-actions
Frontend evidence: HWEB-007 displays only backend-returned AvailableActionView values, including permitted, reasonRequired, commentRequired and requiredPermissionCode metadata. Tests prove an available APPROVE decision is visible without being converted into a locally inferred executable transition.
Frontend rule   : Never infer workflow transitions locally; available actions are backend-authoritative visibility metadata.
```

### GAP-WF-004 — Workflow transition execution contract

```text
Status          : OPEN
Backend evidence: The accepted artifact exposes POST /api/v1/workflow/actions, but backend source verification shows WorkflowApplicationService.recordWorkflowAction persists an action/audit record; it does not prove or expose a task-transition execution operation that advances the workflow from an AvailableActionView transition.
Frontend state  : HWEB-007 intentionally renders available actions as informational, non-clickable workflow choices. It does not call POST /workflow/actions as a substitute transition endpoint.
Completion gate : HidraAPI publishes and tests an explicit transition/action execution contract that accepts the backend-selected transition/decision, validates required reason/comment input, applies authorization/concurrency rules, advances task/instance state, and returns the authoritative result.
```

HWEB-007 state rule: TanStack Query owns task/detail/action/instance/timeline server state; React local state owns selected-task/presentation state. HidraWEB does not maintain a client workflow state machine.

---

## HWEB-008 alarms

### GAP-ALARM-001 — Active/history/detail queries

```text
Status          : IMPLEMENTED
Evidence        : GET /api/v1/alarm/alarms and GET /api/v1/alarm/alarms/{id} are present in the published contract.
Frontend state  : Not yet consumed.
```

### GAP-ALARM-002 — Shelving/suppression lifecycle

```text
Status          : IMPLEMENTED
Evidence        : Alarm shelving query/command and unshelve operations are backend-verified and represented by the published OpenAPI artifact.
Frontend rule   : Use exact generated operation paths/DTOs; do not infer alarm lifecycle semantics.
```

---

## Phase gate policy

Before every HWEB phase:

1. pin the exact HidraAPI `main` SHA and published artifact/digest;
2. extract only the required feature contract slice and generate it in CI;
3. verify exact routes, DTO optionality, paging/filtering, permissions and error semantics;
4. consume effective grants for UX while preserving HidraAPI as final authorization boundary;
5. keep backend server state in TanStack Query and feature-local presentation state local;
6. add frontend tests before promoting a gap from `IMPLEMENTED` to `VERIFIED`;
7. do not invent semantics for any `OPEN`, `IN_PROGRESS`, or `DEFERRED` capability.

## Current next phase decision

HWEB-007 is implementation-complete for the backend-supported task inbox/detail, instance/timeline and available-action visibility scope. `GAP-WF-004` remains OPEN and explicitly blocks workflow transition execution; this does not justify inventing frontend mutations. After HWEB-007 is merged and post-merge `main` CI is green, the next frontend phase is HWEB-008 Alarms, beginning with a fresh contract reconciliation of alarm queries and lifecycle commands.
