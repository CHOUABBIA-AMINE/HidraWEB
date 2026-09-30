# Hidra API–Web Contract v1

```text
Document code   : HIDRA-API-WEB-CONTRACT-v1
Repository      : HidraWEB
Product         : HidraWEB / HidraAPI
Owner           : Sonatrach / TRC Digitalization Initiative
Author          : Abir MEDJERAB
Status          : Canonical normative contract
Frontend base   : 02a101fda401b7335b51e95ea17d281baeabbe93
Backend base    : 260295c6eebc4b01922d2d488810a671305860a6
OpenAPI evidence: 63f3f60974ce57eb8cd5e42910397615195624fb
Reconciled      : 2026-09-29
```

## 1. Purpose

This document is the single canonical human-readable boundary between HidraAPI and HidraWEB.

HidraAPI is the source of business truth, validation, authorization, workflow semantics, organization semantics and durable operational state. HidraWEB owns presentation, interaction, client caching and frontend composition.

If this document conflicts with live HidraAPI/OpenAPI, HidraAPI wins and this document must be corrected.

## 2. Contract status vocabulary

| Status | Meaning |
|---|---|
| `IMPLEMENTED` | Verified in current HidraAPI and consumable by HidraWEB |
| `TARGET` | Approved frontend/backend requirement not yet implemented or not yet consumed |
| `OPTIONAL` | Available only when a verified backend/runtime mode is enabled |
| `NOT SUPPORTED` | Explicitly unavailable in the current contract; frontend must not invent it |
| `MOCKED` | Development-only frontend behavior; never evidence of backend capability |

## 3. Authority order

```text
1. live HidraAPI main implementation
2. deterministic HidraAPI OpenAPI artifact
3. generated HidraWEB transport contracts
4. this canonical contract
5. supporting HidraWEB catalogs/gap reports
6. historical roadmap/handoff evidence
```

JPA entities and internal backend domain aggregates are never frontend transport contracts.

## 4. Current machine-contract baseline

Current live HidraAPI head:

`260295c6eebc4b01922d2d488810a671305860a6`

The verified OpenAPI-producing commit:

`63f3f60974ce57eb8cd5e42910397615195624fb`

is code-equivalent to the current head because subsequent commits through the current baseline modify only governance/project-state/extended-capability documentation.

HidraAPI CI run `36573899231` succeeded and published:

`hidra-api-openapi-63f3f60974ce57eb8cd5e42910397615195624fb`

HidraWEB accepts this exact verified artifact as its current machine-contract baseline. HWEB-R02 originally repinned 18 checked-in feature contracts and Orval configurations to `63f3f60974ce57eb8cd5e42910397615195624fb`; HWEB-R13 added dedicated Assets and Integrity contracts, bringing the reconciled release baseline to 20 feature contracts. Later contract expansion still requires deliberate roadmap authorization.

## 5. Core cross-cutting rules

1. REST/OpenAPI is authoritative for durable commands and queries.
2. OpenAPI-generated TypeScript types are the transport type authority.
3. React components never call Axios directly.
4. Generated code contains no handwritten business logic.
5. Frontend view models may adapt transport types but may not redefine backend semantics.
6. Identifiers remain opaque.
7. Backend machine enum values remain locale-neutral.
8. UI permission guards improve UX but never replace backend enforcement.
9. Realtime is an optimization/refresh channel, never a second source of truth.
10. Missing backend capability stays missing/targeted; the frontend does not manufacture it.

## 6. Base paths

| Concern | Current contract | Status |
|---|---|---|
| Business REST | `/api/v1/**` | IMPLEMENTED |
| OpenAPI | `/v3/api-docs` | IMPLEMENTED |
| Realtime capabilities | `/api/v1/realtime/capabilities` | IMPLEMENTED |
| SSE transport | `/api/v1/realtime/sse` | IMPLEMENTED transport only |
| STOMP/WebSocket | `/api/v1/realtime/ws` | IMPLEMENTED transport only |
| Direct browser LeakDetectionAPI | none | NOT SUPPORTED |

## 7. Authentication

### 7.1 Implemented endpoints

```text
POST /api/v1/identity/authentication/login
POST /api/v1/identity/authentication/oidc/complete
GET  /api/v1/identity/me
GET  /api/v1/identity/me/permissions
```

Status: **IMPLEMENTED**

HidraWEB must not invent `/auth/me`, `/auth/login`, `/auth/refresh`, or `/auth/logout`.

The canonical authenticated-principal refresh is:

`GET /api/v1/identity/me`

The frontend may use the login response to establish the initial token/session exchange, but after authentication it must reconcile displayed principal/effective-permission state with the canonical current-principal APIs.

Authentication transport must stay behind the frontend authentication abstraction.

Feature modules must never read/write credentials or bearer tokens directly.

## 8. Authorization

Current metadata APIs:

```text
GET /api/v1/security/permissions/catalog
GET /api/v1/security/permissions/routes
GET /api/v1/identity/me/permissions
```

Status: **IMPLEMENTED**

The current backend catalog reports:

`backend-enforced by HidraRouteAuthorizationInterceptor`

and the route interceptor enforces derived permissions for `/api/v1/**` MVC routes except explicit public/authenticated-only paths.

Therefore the former “catalog-only” security assumption is obsolete.

Frontend rules:

```text
UI permission guard != authorization authority
backend 401/403 = authoritative
```

Do not use role-name, organization-name, job-title or route-name inference as the primary authorization model.

## 9. Identity administration

Current HidraAPI exposes dedicated principal/user/role/permission reads and administration commands.

Status: **IMPLEMENTED**

HidraWEB should prefer dedicated typed APIs for first-class identity workflows. The generic workbench remains acceptable for secondary inspection but must not substitute for a dedicated contract when one exists.

## 10. Organization and operational responsibility

### 10.1 Organizational hierarchy

Current dedicated reads include:

```text
GET /api/v1/organization/units
GET /api/v1/organization/units/{id}
GET /api/v1/organization/units/{id}/children
GET /api/v1/organization/hierarchy
GET /api/v1/organization/employees
GET /api/v1/organization/employees/{id}
GET /api/v1/organization/employees/{id}/assignments
GET /api/v1/organization/assignments
```

Status: **IMPLEMENTED**

### 10.2 Canonical operational responsibility model

```text
OrganizationUnit
  owns organizational identity/hierarchy

OperationalScope
  id
  type
  targetId

ResponsibilityAssignment
  assigneeType
  assigneeId
  scopeId
  responsibilityType
  effective-dated lifecycle
```

HidraWEB must not retain retired duplicated scope type/target/code/name tuples as an independent frontend model.

Physical/network ownership must not be inferred from OrganizationUnit hierarchy alone.

Operational-context UI must be driven by the current scope/responsibility APIs when implemented in HWEB-R05.

## 11. OpenAPI and Orval

Required flow:

```text
HidraAPI verified OpenAPI
    -> pinned HidraWEB contract evidence
    -> Orval
    -> src/api/generated/
    -> optional frontend adapter/view model
    -> UI
```

Rules:

- generated files are transport infrastructure;
- handwritten DTO replicas are prohibited where OpenAPI provides the schema;
- handwritten URL strings should be eliminated when an equivalent generated operation exists;
- binary/multipart handling may use a thin transport adapter where generated-client ergonomics are insufficient, but it must still use verified backend paths/types;
- regeneration/typecheck/compatibility failures block merge.

## 12. Error contract

HidraAPI ProblemDetail handling remains the base HTTP error contract.

HidraWEB normalizes transport failures into one frontend error model and handles:

- validation/request errors;
- `401`;
- `403`;
- `404`;
- `409`;
- server errors;
- network failures.

Do not invent field-level validation structures not emitted by the backend.

## 13. Generic operational workbench

Verified routes:

```text
GET  /api/v1/workbench/modules
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

Status: **IMPLEMENTED**

The workbench remains a secondary/reference/admin capability. It does not replace specialized domain UX when dedicated typed APIs exist.

## 14. Topology map

Verified routes:

```text
GET /api/v1/topology/map/layers
GET /api/v1/topology/map/layers/{layerId}
GET /api/v1/topology/map/layers/{layerId}/features
GET /api/v1/topology/map/geojson
GET /api/v1/topology/map/search
```

Status: **IMPLEMENTED**

HidraWEB uses MapLibre through `HidraMap`.

Frontend owns visual styling, selection, viewport, layer visibility and legend behavior. HidraAPI owns feature identity, topology semantics and geometry payload.

Do not fabricate coordinates or geometry.

## 15. Telemetry and monitoring

Current telemetry query contract includes:

```text
GET /api/v1/telemetry/reference/reading-states
GET /api/v1/telemetry/reference/quality-codes
GET /api/v1/telemetry/points/{pointId}/readings
GET /api/v1/telemetry/points/{pointId}/readings/latest
GET /api/v1/telemetry/points/{pointId}/trend
```

Current monitoring query contract includes:

```text
GET /api/v1/monitoring/rules
GET /api/v1/monitoring/rules/{id}
GET /api/v1/monitoring/deviations
GET /api/v1/monitoring/deviations/{id}
```

Status: **IMPLEMENTED**

Server state belongs to TanStack Query. Do not place telemetry history/series in Zustand.

## 16. Workflow

Current first-class query/transition contract includes:

```text
GET  /api/v1/workflow/tasks
GET  /api/v1/workflow/tasks/{id}
GET  /api/v1/workflow/tasks/{id}/available-actions
GET  /api/v1/workflow/instances/{id}
GET  /api/v1/workflow/instances/{id}/timeline
POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute
```

Status: **IMPLEMENTED**

Available actions are backend-authoritative. HidraWEB must never derive approve/reject/delegate/escalate rules from frontend-only state.

## 17. Alarm

Current first-class query/lifecycle contract includes:

```text
GET  /api/v1/alarm/alarms
GET  /api/v1/alarm/alarms/{id}
GET  /api/v1/alarm/alarms/{id}/shelvings
POST /api/v1/alarm/alarms/acknowledgements
POST /api/v1/alarm/alarms/closures
POST /api/v1/alarm/alarms/{id}/shelvings
POST /api/v1/alarm/alarms/{id}/shelvings/{shelvingId}/unshelve
```

Status: **IMPLEMENTED**

Severity/state colors in the UI must be based on backend values and accessible semantics, not decorative color.

## 18. Incident, leak detection and HSE

HidraAPI currently exposes first-class read contracts for incident, leak candidates/cases and HSE cases/CAPA used by the existing events workspace.

Status: **IMPLEMENTED through HidraAPI**

Direct frontend access to `LeakDetectionAPI` is **NOT SUPPORTED**.

## 19. Realtime

HidraAPI transport capability is **IMPLEMENTED**, but domain publication is currently **NOT SUPPORTED**.

The current capability response explicitly reports:

```text
publicationStatus = transport-configured-no-domain-publishers
eventFamilies     = []
recoveryStrategy  = query-after-reconnect
```

Therefore:

- HidraWEB may probe realtime capabilities;
- HidraWEB must not invent alarm/telemetry/workflow/incident topics;
- REST/query remains authoritative;
- no domain feature may depend on a realtime subscription until the backend advertises a verified event family.

The historical example event envelope is not evidence of an implemented domain publisher and is removed from the normative contract.

## 20. State ownership

| State | Frontend owner |
|---|---|
| Backend resources/query results | TanStack Query |
| Forms | React Hook Form |
| Shareable filters/pagination | URL/search params where appropriate |
| Local dialogs/tabs/transient UI | React local state |
| Small cross-screen shell/application context | Zustand |
| Realtime signals when verified | Query invalidation/update, not parallel entity storage |

A giant frontend entity store is prohibited.

## 21. Deferred industrial extension

The HidraAPI extended industrial-capability roadmap is parked.

The following are therefore **NOT SUPPORTED current frontend contracts**:

- direct LeakDetectionAPI integration;
- gRPC-Web;
- CPM/RTTM streams;
- MQTT/Sparkplug semantics;
- PostGIS-specific browser contracts;
- Modified B31G UI contracts.

They require explicit backend roadmap reactivation and a new contract review.

## 22. Frontend navigation and presentation

Primary navigation remains process-oriented rather than mirroring Java packages.

A visible route must be supported by:

1. current backend capability;
2. authenticated effective permissions;
3. frontend implementation status.

Four-level operational display and ISA-101-inspired design are presentation patterns only. They do not authorize invented KPIs, mass balances, hydraulic profiles or process states.

## 23. Contract acceptance gates

A frontend task satisfies this contract only when:

- the exact HidraAPI SHA is recorded;
- the OpenAPI artifact/snapshot used is recorded;
- generated transport types match the selected OpenAPI baseline;
- API calls are traceable to OpenAPI/backend evidence;
- no JPA/domain internals are used as transport contracts;
- no backend rules are reimplemented in React;
- backend `401/403` remains authoritative;
- workflow actions come from backend metadata/contracts;
- realtime subscriptions exist only for published backend event families;
- `TARGET`, `OPTIONAL`, `NOT SUPPORTED`, and `MOCKED` capabilities are visibly distinguishable from `IMPLEMENTED`.

## 24. Supporting historical documents

Documents such as `docs/02-Backend-Frontend-Contract.md`, API catalogs, spreadsheets, `handoff.md`, and older gap reports remain evidence/history only.

When they conflict with this canonical contract or live HidraAPI/OpenAPI, live HidraAPI wins and this contract is the current HidraWEB governance baseline.
