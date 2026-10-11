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


---

## 25. Foundation-first API–WEB extension contract — 2026-10-11 (TARGET; not a live endpoint inventory)

**Planning baseline:** HidraAPI `c3f47c79248d8e645e1fbe924ede79782dda6c17`; HidraWEB `c7dd3d2a0a4ca6b414a1ce57b59ac8542aade7b6`.
**Decision boundary:** The owner has requested planning for operator engineering-data provisioning before deferred simulator work. A separate HidraAPI roadmap amendment must formally approve and register simulator deferral; this section does **not** claim that deferral has already been committed to HidraAPI or that planned endpoints exist.
**Contract status:** TARGET / design baseline. Sections 1–24 remain authoritative for currently implemented transports, subject to live HidraAPI and verified OpenAPI overriding stale historical SHAs. No runtime interface, endpoint, frontend screen, permission or production API was changed by this contract amendment.

### 25.1 Source-of-truth and feature boundary

1. **Topology** owns authoritative physical graph, stations/facilities, geospatial route and elevation/section source facts, installed hydraulic incidence, and effective physical configurations.
2. **Assets** owns maintainable asset identity, model/manufacturer and lifecycle evidence as established by its current contracts; **Party** remains the authoritative manufacturer-party identity where appropriate.
3. **Custody/product-owning context** owns canonical product/composition/method source revisions; **Simulation** owns existing numerical equipment-characteristic revision records. These ownership assignments must be confirmed in each authorized implementation preflight; no duplicate frontend-owned catalog is permitted.
4. **Telemetry/Workflow/Identity** retain their respective measurement, approval and authorization authority.
5. HidraWEB owns interaction and presentation state only. It must never create a second persistent topology/product/asset truth in browser storage, infer absent physical facts, or present simulated forecasts as measured SCADA.
6. Simulator numerical execution, manual/automated simulation triggers, calibration and product-specific physics are **DEFERRED TARGET** when and only when corresponding owner-roadmap deferral is approved. Existing simulation metadata/run queue contracts may be shown only as the limited currently published capability, never as proof that numerical execution occurred.

### 25.2 Current verified entry points (limited evidence)

The following controller mappings were checked in live HidraAPI source for the planning baseline. Method bodies, permissions, complete DTO schema and runtime acceptance remain governed by the exact OpenAPI artifact and backend tests:

| Area | Source-backed route | Boundary |
|---|---|---|
| Topology | `GET /api/v1/topology/capabilities` | Capability discovery only |
| Topology | `POST /api/v1/topology/pipeline-systems` | Existing pipeline-system creation; **not** a complete network editor |
| Topology | `POST /api/v1/topology/facilities` | Existing facility registration; **not** station-internal engineering authoring |
| Map | `GET /api/v1/topology/map/layers` | Published read-only layer catalog |
| Map | `GET /api/v1/topology/map/layers/{layerId}/features` | Source-backed map features, not proof of a surveyed alignment |
| Map | `GET /api/v1/topology/map/geojson` | Published visualization, not complete profile authoring |
| Map | `GET /api/v1/topology/map/search` | Published map search |
| Identity | `GET /api/v1/identity/me` and `GET /api/v1/identity/me/permissions` | User and effective grants |
| Simulation | `POST /api/v1/simulation/models`, `/scenarios`, `/runs` | Existing model/scenario/queueing commands; **not** executing numerical runs |

The existing frontend Topology Workspace is a read/inspect implementation, not a verified physical network design/editor. Existing HidraWEB OpenAPI feature slices are historical pinned transport evidence; regenerate only after sourcing a new exact-head verified HidraAPI artifact, checking compatibility and satisfying the relevant task gate.

### 25.3 Foundation API contracts to be discovered and implemented

**These are requirement identifiers, not invented HTTP paths.** Exact REST paths, methods, DTOs, permission names, versioning and ownership are to be discovered from live source or admitted by separate backend implementation tasks before UI authoring.

| Requirement ID | Operator capability / backend contract | Required semantics | Status |
|---|---|---|---|
| ENG-001 | Physical network draft authoring, node/segment/connectivity validation, read/revise/publish | Atomic graph consistency, immutable effective versions, identity and conflict handling | PARTIAL / TARGET |
| ENG-002 | Station/facility and hydraulic header/connectivity management | Independently referenced installed units, series/parallel incidence, effective versions | PARTIAL / TARGET |
| ENG-003 | Geospatial route/chainage and elevation-profile authoring/import/export | Declared CRS, datum/vertical datum, ordered points, survey provenance, precision and uncertainty | TARGET |
| ENG-004 | Pipe-section physical properties | Supplied inner diameter, wall/material/roughness and length with source units/validity; no inferred values | PARTIAL / TARGET |
| ENG-005 | Installed equipment type/model/manufacturer/attributes | Canonical Assets/Party relationships, typed required fields, documented provenance and lifecycle | PARTIAL / TARGET |
| ENG-006 | Manufacturer curves/tables and immutable characteristic revisions | Units, operating envelope, applicability, characteristic reference conditions and approval lineage; no formulas invented in browser | PARTIAL / TARGET |
| ENG-007 | Product/fluid composition and source/property-method revisions | Canonical product owner, exact composition and reference conditions, qualification status, unknown values explicit | PARTIAL / TARGET |
| ENG-008 | Complete engineering baseline freeze, historical read and comparison | Version-pinned graph, route/profile, station, equipment, manufacturer and fluid references plus digests | TARGET |
| ENG-009 | Trusted telemetry-to-asset/location binding and operator monitoring | Quality, freshness, timestamp/source and permission controls, no fake realtime event family | PARTIAL / TARGET |
| ENG-010 | Engineering configuration validation, approvals, revision activation and audit | Backend authoritative validation/Workflow, optimistic concurrency, event/effective dates, replay | PARTIAL / TARGET |
| ENG-011 | Batch engineering data import/export | Schema/units validation, dry-run diagnostics, atomicity/rollback, evidence and historical provenance | TARGET |
| ENG-012 | Operator-facing completeness/capability discovery | Machine-readable unsupported/missing-input diagnostics; feature gating by backend capabilities and effective grants | TARGET |

A backend entity, existing JPA mapping or generic JSON value alone is **insufficient** evidence for a browser-authorable, correctly validated feature. No target workflow may be relabeled IMPLEMENTED without published request/response transport and integration acceptance.

### 25.4 UI/API interaction rules

- Browser engineering operations call only published, generated HidraAPI clients through typed feature adapters. Never construct undocumented endpoints, fabricate HTTP verbs, reuse a read-only mapping for mutation, or duplicate numeric engineering calculations in React.
- Each editor separates local **unsaved draft**, backend **validated draft**, **approved effective baseline**, and **historical revision**. Editing approved engineering truth must create a governed new revision, not mutate historical simulation/evidence inputs.
- Permission-aware navigation comes from `GET /api/v1/identity/me/permissions`; backend authorization remains final. Backend ProblemDetail and 400/401/403/404/409/422 (where actually published) must lead to explicit UX, including field-level validation/conflict resolution.
- Every measurement field presents an explicit unit; convert with validated backend rules and render original units/reference conditions when needed. Pressure gauge versus absolute, pipe nominal versus internal diameter, CRS/vertical datum and characteristic-map reference frames must never be silently conflated.
- Map features are a visual projection of authoritative geometry; do not synthesize the actual surveyed pipeline route from two endpoints or display accuracy unsupported by the source.
- UI never alters manufacturer-certified curves via calibration, equipment updates or scenario experimentation; preserve separately revisioned evidence.
- No direct OT actuation, SCADA write, simulated automatic regulation, undocumented alarm publication, or fabricated telemetry stream.
- Accessibility, responsive GIS, bounded map/grid fetches, optimistic concurrency, error recovery and audit provenance are mandatory release criteria.

### 25.5 API-contract conformance and release gates

Before making a new engineering editor production-ready:

1. Pin exact HidraAPI commit and successful relevant backend CI; fetch its published deterministic OpenAPI artifact, digest and backend permission catalog.
2. Diff against current HidraWEB consumed OpenAPI slices and generated Orval types; fail on unexplained breaking changes; use deliberate versioned contract changes, never handwritten type divergence.
3. Verify create → validate → save → retrieve → revise → historical replay and forbidden-user paths against actual backend/DB integration, not just MSW mocks.
4. Verify route/chainage/elevation/CRS and custom equipment/product unit round trips, null/missing behavior, consistency errors, old-version retention, and source provenance.
5. Exercise concurrency conflicts, expired grants, failed imports and rollback with live integration evidence.
6. Run documented HidraWEB lint, typecheck, unit/component, performance, build and Playwright suites plus an environment-specific OIDC/TLS/proxy integration smoke and UAT.
7. Feature activation is explicit and fail-closed if required backend paths, permissions, approved parameter schemas or runtime mode are absent.
8. Never declare production readiness from a successful frontend build or contract document alone.

### 25.6 Roadmap dependency and migration policy

The HidraAPI engineering-foundation track prioritizes operator provisioning, geospatial profiles, stations/equipment, manufacturer parameters, products and immutable engineering baselines (HPR-P25-018–023 design obligations and separately registered implementation envelopes), with independent telemetry/monitoring. These are **planned dependencies**, not currently accepted end-to-end endpoints. Solver registry, execution and calibration tasks (HPR-P25-024–027 and unfinished 008 scopes) remain outside the foundation-first UI milestone if formally deferred.

HidraWEB may restructure or replace **unreleased** components where source-backed contracts and task-specific evidence demonstrate a benefit. Preserve backend business truth, permissions, versioned data, working tested workflows, existing release evidence and accessibility/security guarantees; do not delete the frontend, its canonical contract or current feature code solely because it is not production deployed. Destructive refactors require a bounded implementation task, explicit file allowlist, migration/rollback assessment and tests.

**Immediate next authorized work from this contract:** a separate source-backed HidraAPI ↔ HidraWEB gap/roadmap reconciliation to turn ENG-001–012 into independently verifiable API and frontend tasks. This contract does not authorize feature implementation, backend mutation or simulation reactivation.


## 26. HWEB-F01 machine-contract verification (2026-10-11; no consumer repin)

**Verified backend evidence:** HidraAPI code `a691843f359126a9f439217862f780b5806c5fd2`,
full CI #644/run 38135634129 SUCCESS; documentation-only succeeding
main `dc01eeb3d8a2ea2fe0115a589948dd1eb8f77d67`.
Artifact `hidra-api-openapi-a691843f359126a9f439217862f780b5806c5fd2`,
ID `11701445061`, ZIP SHA-256
`f1b0a07819b4103b29c219a566acdb7e7afc1becdd38d146f15030d60c433524`,
embedded JSON SHA-256
`6bd2a642420b0c7cda3de61e158ff97906f05665c415e1c179c7cbbd7d1ec83f`.
Verified artifact does **not** imply an approved HidraWEB pin.
The checked-in `openapi/compatibility/hidra-api-baseline.json` currently
pins `5028a90248ddf3a04d344308f6cfc2510f1d0ca2`. Historical §4
text naming `63f3f609...` is not the effective manifest.

Current backend contracts include the exact
`POST /api/v1/topology/pipeline-systems` with
`CreatePipelineSystemRequest`, `POST /api/v1/topology/facilities`
with `RegisterFacilityRequest`, Topology Map `GET` views,
`POST /api/v1/assets/maintainable-assets` /
`PATCH /api/v1/assets/maintainable-assets/{assetId}`,
`POST /api/v1/party/parties`,
`GET /api/v1/telemetry/points/{pointId}/readings/latest`
(`ReadingView`), `GET /api/v1/workflow/tasks/{id}/available-actions`,
and `GET /api/v1/identity/me/permissions`. None alone is proof of a
complete engineering authoring/approval/baseline workflow. Inspected
protected operations declare `hidraBearerJwt`, **not** exact per-ENG
effective resource/action grants; backend authorization remains final.

Comparing *both retrieved deterministic JSON artifacts* yields 240→244
paths, 259→263 HTTP operations, and 227→231 component schemas.
The newly added operations are
`POST /api/v1/identity/authentication/oidc/evaluate` and
`POST /api/v1/risk/assessments/{id}/approve`, `/score` and `/submit`.
No previously published HTTP operation or named component schema was
removed. Nevertheless, the six changed existing schemas require explicit
consumer review:

| Schema | Exact field-level difference |
|---|---|
| `CreateOrganizationUnitRequest` | `validFrom` changed from optional to required |
| `CreatePipelineSystemRequest` | `systemType` removed, `systemTypeCode` added |
| `PipelineSystemResponse` | `systemType` removed; `systemTypeCode`, `systemTypeId` and localized type names added |
| `StartIntegrationJobRunRequest` | `runNumber` removed |
| `CreateRiskAssessmentRequest` | optional `scopes` collection added |
| `AnalyticsProjectionRunResponse` | `projectionDefinitionVersion` added |

At least the now-required organization `validFrom` affects an actual
checked-in consumer slice that treats it as optional. Contract changes
must be resolved against backend policy and tested, not guessed.
No automatic upgrade of the 20 Orval slices, no new generic permissions,
no fabricated unsupported engineering endpoints, no simulator physics
and no production acceptance are authorized. **HWEB-F01 remains in
progress pending compatible source-backed consumer pin plus complete
permission and acceptance evidence.** See the corresponding dated ENG gap
register delta and Ultimate Roadmap task status.
