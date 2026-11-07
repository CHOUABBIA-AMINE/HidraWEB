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


## HWEB-F11 / W1 foundation adoption — 2026-11-05

Owner Next admits the complete Identity/Organization/Party frontend foundation
under the Ultimate Roadmap's exact W1 ledger. Backend18e7a75 Full1124/Docs911
accepted corrected credential-state schema; governance main a9025394 Docs912 SUCCESS.
Preserve historical F01–F10,20 prior feature sources and all prior API provenance.
Only Identity/Organization is repinned; a dedicated Party client brings the explicit
feature count to21. Use actual generated transport, native authorization, server
versions and safe credential handling. UI guards are advisory; backend remains final.
Status IN_PROGRESS; live no-mock browser/A1 and industrial/SITE gates are independent.

W1 source disposition: IMPLEMENTED / CI_ACCEPTANCE_PENDING. Identity credential
CAS/activation/deactivation and ordinary revocation, Organization catalog-backed
choices/employee activation/history, and dedicated Party lifecycle/role/history/eligible
selection now consume generated accepted API types. Local137 Vitest +95 Node +6
performance cases, types/lint/build passed; browser launch and no-mock qualification
remain pending. See owning W1 roadmap evidence; do not infer deployed acceptance.


### W1 mandatory native qualification — 2026-11-05

Code1015/Docs40 passed at33b8c051; default browsers reported63 passed,1 existing
Alarm retry,3 native skips. W1 remains IMPLEMENTED / LIVE_QUALIFICATION_PENDING.
Owner Next selects its missing real backend browser criterion inside the same W1
delivery. A new mandatory job builds pinned accepted API18e7a75, migrates a fresh
disposable PostgreSQL16 database, provisions only the existing opt-in native LOCAL
administrator and synthetic catalogs, and executes all3 W1 native specs with retries0,
no mocks/interception or trace/video/screenshots. Missing native inputs fail the
mandatory lane; ordinary regression skips remain clearly classified. No W1 acceptance,
A1 integrated closure, production deployment or W2 implementation is asserted until
actual source-bound native results are retrieved. See the exact roadmap scope.



### W1 / HWEB-F11 accepted native development qualification — 2026-11-05

W1 is **VERIFIED / COMPLETED for its registered development foundation and synthetic
native qualification scope**, superseding its earlier pending dispositions above.
Reviewed WEB source `042844beb4beb2a53387e93fdf220aa1ba90bb72` passed
[Code CI #1021](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42050595244)
and [Docs #46](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42050595127).
The mandatory native job built accepted API
`18e7a7596aea1b26e958130996c8811ae7fe27e4` against fresh PostgreSQL16 and verified
real audited administrator bootstrap, LOCAL JWT/CORS/permissions, user onboarding
and HTTP403 denial, Party lifecycle/role/eligible lookup/history, and employee
activation/history: **3 passed,0 failed/flaky/skipped, retries0**.

Regular CI passed140 component/unit,95 Node and6 performance tests,21 contract
generators, types/lint/build and package checks. Its intercepted browser lane retains
63 passes,1 existing Alarm retry and3 duplicate native skips; those skips are
separately covered by the successful mandatory native job. See the canonical
Ultimate Roadmap's W1 acceptance entry for exact source/tree/job evidence and limits.

This accepts the implemented foundation and registered native journeys, not every
mutation's individual live coverage, integrated A1, industrial/SITE acceptance or
deployment. Historical ENG gaps and earlier task mappings remain intact. A1 remains
the separate integrated W1–W4 gate; W2/HWEB-F12 is next after separate selection.
No backend change, new capability or numerical simulation/P3 is authorized here.


## HWEB-F12 / W2 persisted topology foundation — 2026-11-06 source submission

Backend implementation f1fdc206c916a5266f609810c045c6b5688bfd49 was independently
accepted at db712ab35ff3051c489e74327090d2fc7ef47b33 (Full1137/Docs926 and
acceptance Docs927 SUCCESS). Full runtime artifact SHA256
da4326497b4c65f9dcbeb286b64c1c9840a6fc73b91c3543c48633f682fb3fba
supplies the closed Topology slice:58 paths/113 schemas; slice SHA256
76cb0959b88b9812ca2d62bc88fa2f89f9427263ff210dc82ac5365e2393c2f1.
Orval now consumes this verified runtime slice; all20 other generators/pins and
historical Topology evidence remain. Handwritten feature code imports generated
transport/types only, through a module queue that serializes protected NOWAIT
transactions without retries. Native authority remains exclusively server-owned.

W2 SOURCE IMPLEMENTED / NATIVE_BROWSER_QUALIFICATION_PENDING: /network offers an
explicit editor alongside the existing map reader, including backend company,
system/type/station choices; setup/activation; physical position, UNKNOWN-evidence
unit and installation; typed graph nodes/ports/branches and Pipeline/optional Segment
references; exact expected revisions, persisted schematic, historical reads and
shareable company/system/draft URLs; separate station-graph author/publication and
installed-configuration save/history. Physical identity does not become an Assets
maintenance aggregate. Geometry remains NOT_SUPPLIED; the SVG is explicitly a
nongeographic persisted schematic. No local durable graph store or raw JSON editor.
The station template is explicitly synthetic serial incidence requiring operator
review, not a numerical/hydraulic or engineering qualification.

Current native integration test source adds2 scenarios to the3 mandatory W1 cases,
against the pinned accepted API/fresh PostgreSQL16 with distinct ordinary, installed,
setup and configuration principals. Security/catalog fixtures create no promised
Topology business rows. API-created synthetic Party setup is permitted; all new
system/station/position/unit/installation/graph/configuration writes use owner APIs.
The main browser case requires persisted reload/history and exact stale409 with
unchanged graph version; the second uses actual LOCAL ordinary-user credentials
and requires403 before setup disclosure/write. These browser cases are authored
and enumerated, not claimed executed locally. CI requires5 passed/0 failed/flaky/
skipped/retries; full W1 preservation remains mandatory after the API pin change.
Broader ENG-001–012 editors, W3/W4, A1, SITE, P3 and deployment remain independent.


## HWEB-F12 / W2 — independent native browser acceptance (2026-11-06)

Owner Next selects this acceptance stage only. Verified implementation/repair SHA
`e09edd393e3b6253e9ecc32172377bc52f2d1b38`, parent
`419fff00a1bfb3b36fd67661373e2a282ca2d8ea`, tree
`228bdc4cf7fa9e7ebd93010cb2c9d92fd2ba65e6` remains live main at preflight.
Code1024 [run42246674965](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42246674965)
and Docs50 [run42246674846](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42246674846)
are completed SUCCESS on that exact SHA. Native job127990590404 executed all five
mandatory W1/W2 browser cases:5 passed in48.3 seconds,0 failed/flaky/skipped;
the mandatory report assertion succeeded. The separate verify job127990591052
also succeeded, including the full ordinary Playwright regression suite.

Transition: HWEB-F12/W2 ACCEPTED for the registered software/native-browser scope;
NATIVE_BROWSER_QUALIFICATION_PENDING is resolved by this exact-source hosted
evidence. This includes persisted system/station/installation/configuration and
Pipeline graph browser reload/history, stale-write409 with unchanged persisted
version, ordinary LOCAL actor catalog/write403 and preservation of the three W1
journeys. The native lane uses API f1fdc206c916a5266f609810c045c6b5688bfd49,
fresh PostgreSQL16, genuine JWT and separate restricted database principals.
No mocks, retry, deadline relaxation or alternative acceptance replaces that lane.

This acceptance covers the registered journeys and does not establish exhaustive
live coverage of every mutation, integrated W1-W4/A1 acceptance, industrial
calibration, SITE/operational acceptance, numerical/P3 readiness or deployment.
Historical ENG gaps and task mappings remain preserved. No backend/API pin,
application behavior, fixture, workflow or security rule changes in this stage.

Registered exact message: `docs(topology): accept W2 native browser qualification`.
Exact acceptance-only scope: APPEND docs/roadmap/ULTIMATE_ROADMAP.md,
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md. Preserve every prior byte
and every other tree entry. Validate canonical documentation, append-only
preservation and exact parent/tree/blobs. Guard direct-main publication against
expected head e09edd393e3b6253e9ecc32172377bc52f2d1b38. This documentation-only
commit requires its own Docs CI startup; Code CI is path-filtered and is not
claimed rerun. Observe applicable CI creation/start, then STOP.

Next reserved implementation: W3/HWEB-F13, requiring separate owner selection
and source-backed scope registration. W3/W4/A1, numerical/P3, release and
deployment are not selected or executed by this acceptance.


## HWEB-F13 / W3 — whole typed Configuration source delivery (2026-11-06)

W3 is IMPLEMENTED / NATIVE_BROWSER_QUALIFICATION_PENDING. Reuses the existing
ConfigurationAdministrationPage route, security shell and native W1/W2 lane.
Consumes only generated transport from the authenticated runtime Configuration
slice of API f1fdc206c916a5266f609810c045c6b5688bfd49. Full runtime JSON SHA256
 da4326497b4c65f9dcbeb286b64c1c9840a6fc73b91c3543c48633f682fb3fba;
closed slice13 paths/14 schemas SHA256
6df15b4570903b52ba0008ac66c746812a7a58f786613d8158de3cc1c3165d1d.
All20 other active contract pins and historical Configuration artifacts remain.

Current administrator authority is required before any protected read, choices
or counts. Owner namespace/definition/flag paging replaces raw ID entry; exact
server activation timestamps and active version IDs are passed unchanged.
Supported STRING/NUMBER/BOOLEAN, PUBLIC/INTERNAL unscoped definitions without
approval support default/effective reads and explicit half-open environment
overrides. Actor identity comes from the backend, never browser input. BOOLEAN
flag creation/activation, environment state/default provenance and stale-version
conflict review are supported. Failed commands are never retried and require
explicit review/reset. Confidential metadata is rendered as metadata; no raw JSON
payload inspector, secret reference input, local durable truth or physics exists.
The former legacy DURATION/approval/scoped/actor-ID forms and their mocked
transport assertions are replaced by admitted typed controls and matching tests,
not claimed supported by B5. Backend redaction, not UI hiding, is authoritative.

Native CI preserves the three W1 and two W2 journeys and requires all seven
W1/W2/W3 cases passed with0 failed/flaky/skipped and retries0. W3 positive source
covers NUMBER lifecycle, canonical default, override and exclusive-end fallback,
BOOLEAN flag lifecycle/state, exact stale409 preserving enabled state and browser
reload. The denied case uses genuine LOCAL credentials and requires403 before
catalog/missing-detail/effective/flag disclosure or definition write. The only
new SQL fixture provisions a synthetic namespace and ordinary Configuration DML
privileges in the exact disposable database; business definitions/values/flags
are written through owner APIs. No new backend or production migration is needed.

Local validation PASS: npm ci/generation;21 pinned OpenAPI checks; TypeScript;
lint0 errors/6 existing fast-refresh warnings;57 Vitest files/151 tests with two
workers;97 Node contract tests;6 performance cases; production build and unchanged
bundle budgets (initial JS896.4KiB/900KiB;25 lazy entries; largest lazy route39.7KiB/
96KiB; largest JS chunk995.4KiB/1050KiB). Seven native tests enumerate successfully.
An outdated shared handwritten-transport assertion was repaired to retain exact
routes/body and additionally assert generated JSON header/abort signal; final
full suite passes. Native API/PostgreSQL/browser journeys are authored for CI,
not claimed executed on this host. Ordinary browser regressions likewise require
hosted execution. Canonical documentation, shell syntax and append-only checks
are required before guarded publication. Generated clients remain untracked.

Exact source publication is4 CREATE /12 MODIFY /0 DELETE paths under the registered
W3 message `feat(configuration): integrate typed foundation administration`.
Expected WEB head1cf9d87e21ada106bd3a5bdb7e82b11ab0b35f77. Verify parent/tree/blobs,
observe new-SHA Code/Docs creation or startup, then STOP. Hosted qualification and
independent acceptance remain gates; green unit tests do not prove deployment.
W4/HWEB-F14 remains next after W3 acceptance and separate selection. A1 integrated
acceptance, industrial/SITE, numerical/P3, release and deployment remain unexecuted.


## HWEB-F13 / W3 — independent native browser acceptance (2026-11-06)

Owner Next selects acceptance of the registered whole W3 delivery only.
Verified live WEB main3601f491bb3661a50b650961888f71c87bcd17dd,
parentc667fd8bc3d325c16c3d444be8ca2f5003dccd13,
treebd0101e4bc6883e8a6951846be5bb657984bb735.
[Code1026/run42271560936](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42271560936)
and [Docs53/run42271560727](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42271560727)
completed SUCCESS on this exact SHA. Verify job128077136755 succeeded.
Native job128077137217 succeeded and its actual log reports7 passed in57.3s;
the mandatory report assertion confirms0 failed/flaky/skipped, with retries0.
The earlier cancelled Code1025 remains historical and is not relabelled successful.

Transition: HWEB-F13/W3 ACCEPTED for registered typed Configuration software and
native browser scope. NATIVE_BROWSER_QUALIFICATION_PENDING is resolved by this
hosted execution. The two W3 cases prove real Configuration activation, typed
NUMBER default/canonical override, exclusive-end fallback, BOOLEAN flag state,
exact stale409 preserving state, browser reload and ordinary LOCAL actor403
before protected catalog/detail/effective/flag disclosure or definition write.
The three W1 and two W2 journeys also passed, preserving their accepted scope.
Runtime uses immutable API f1fdc206c916a5266f609810c045c6b5688bfd49, genuine JWT,
fresh PostgreSQL16 and the registered synthetic catalog/credential fixtures.
No business API interception or mutation retry substitutes for native execution.

This accepts only the admitted STRING/NUMBER/BOOLEAN, PUBLIC/INTERNAL, unscoped
and no-approval Configuration contract and BOOLEAN flags. It does not accept
unsupported strategies/types, confidential-value authoring, exhaustive mutation
coverage, enterprise commissioning, integrated A1, industrial calibration,
SITE/operational acceptance, numerical/P3, release or deployment. Current backend
administrator-only semantics remain authoritative. Historical task/ENG mappings
and prior evidence remain preserved. No application, API pin, test, fixture,
workflow, database migration or security change is made by this acceptance.

Registered exact acceptance message:
`docs(configuration): accept W3 native browser qualification`.
Exact MODIFY scope: APPEND docs/roadmap/ULTIMATE_ROADMAP.md,
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md only. No CREATE/DELETE.
Validate canonical Docs, append-only preservation, exact three-path scope,
parent/tree/blobs/message; publish directly to main with expected head
3601f491bb3661a50b650961888f71c87bcd17dd. This documentation-only commit requires
its own Docs CI startup; Code CI is path-filtered and is not claimed rerun.
Observe applicable CI creation/start, then STOP.

Next reserved implementation: W4/HWEB-F14 configured Workflow journeys, after
separate owner selection and source-backed registration. W4, A1, P3, release and
deployment are not selected or executed by this acceptance.


## HWEB-F14 / W4 — selected delivery blocked by owner-target handoff (2026-11-06)

Owner Next selects the reserved whole W4 delivery, not W4 implementation approval
for invented contracts. WEB maina6887c0f8705129b21bd9ca4c9c859930ff7dcbd,
parent3601f491bb3661a50b650961888f71c87bcd17dd,
treed7c038140e6bd149c0016f06fcb8d3d34d24934a; Docs54/run42289453575 SUCCESS.
API maindb712ab35ff3051c489e74327090d2fc7ef47b33 retains implementation
f1fdc206c916a5266f609810c045c6b5688bfd49. The authenticated runtime artifact
(full JSON SHA256 da4326497b4c65f9dcbeb286b64c1c9840a6fc73b91c3543c48633f682fb3fba)
and exact source were inspected. Root WEB AGENTS.md remains absent.

Verified contract gap: GET /api/v1/workflow/definitions requires all five of
 targetModule, targetTypeId, workflowPurposeId, targetId and targetLocator.
WorkflowDefinitionDiscoveryController/Responses publish only a target-specific
supported process, independent reviewer choices and transition metadata. They do
not bootstrap the target coordinates or publish a general reference catalog.
The admitted B6 process is installed-characteristic-link approval. Topology's
InstalledCharacteristicLinkResponses.Link publishes immutable link/source fields
but no pre-approval Workflow target digest, canonical locator or target/purpose
catalog IDs. ApprovalDecision publishes targetSha256 and WorkflowEvidence only
AFTER approval, so it cannot supply the initial Workflow-start handoff.
No workflow-target/approval-target discovery route exists in the verified runtime.

InstalledCharacteristicLinkApprovalTargetDigester owns versioned length-prefixed
UTF-8 canonicalization and microsecond timestamp encoding in Domain. The native
TopologyInstalledCharacteristicLinkWorkflowTargetLookup independently checks that
digest and its canonical locator against the protected immutable owner revision.
Browser duplication or a test-generated locator/digest would silently make this
owner invariant part of the frontend contract. The public REST schema currently
contains neither a published pre-approval handoff nor a versioned browser encoding
contract. A mocked source probe is not a native browser round trip.

This is a dependency conflict with the complete W4 browser-start requirement,
not a reversal of accepted B6 software. TASKS_HPS-015 B6 acceptance explicitly
states that WorkflowFoundationProcessPostgresIntegrationTest uses a mocked owner
target probe and is not physical Topology acceptance. Existing native Topology
read/Workflow suites retain their separate valid scopes. W1/W2/W3 acceptance and
existing task inbox/actions remain unchanged. W4 is BLOCKED at initial target
handoff; no partial feature or counterfeit successful native case is published.

Bounded backend proposal (NOT an existing endpoint and NOT implemented here):
add an owner-authorized pre-approval Workflow handoff read for an exact installed
characteristic link revision, reusing the protected native owner read. Return
server-derived targetModule, targetTypeId, workflowPurposeId, targetId/digest,
targetLocator, exact link revision and digest-format version. Resolve admitted
active catalog IDs on the server; no hardcoded migration IDs in the browser.
Treat this response as metadata, never an authorization token: Workflow must
still revalidate the target, current starter/reviewer authority, independence,
CAS and target provenance. Preserve denial before existence disclosure and omit
manufacturer payloads. No schema rewrite, numerical solver or general designer.
Acceptance requires exact source/OpenAPI/CI proof, foreign/revoked actor denial,
pre-approval target round trip and a real configured independent-reviewer
APPROVE/REJECT flow with stale/replay checks. Then resume the same whole W4 task
using generated transport and native browser qualification. No new task ID is
adopted and no API modification is selected by this WEB documentation disposition.

This blocked disposition's exact message is
`docs(workflow): record W4 owner-target handoff blocker`.
Exact MODIFY scope: APPEND docs/roadmap/ULTIMATE_ROADMAP.md,
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md only. No CREATE/DELETE.
Canonical Docs, append-only, exact tree/parent/blobs/message checks precede guarded
main publication against a6887c0f8705129b21bd9ca4c9c859930ff7dcbd. Observe exact-SHA
Docs creation/start, then STOP; Code is path-filtered and not claimed rerun.
Next necessary selection is the bounded backend handoff contract proposal, then
resume HWEB-F14/W4. A1, SITE, numerical/P3, release and deployment remain unexecuted.

## HWEB-F14 / W4 — accepted backend handoff consumption, frontend qualification pending

The earlier W4 owner-target handoff blocker is resolved by accepted API
5817406923e53761577ac41bbc3f318b517c3977 (Full1140/Docs930 SUCCESS;
acceptance428a6f00a5813294b067daeb0df5f5bdaff72658, Docs931 SUCCESS).
The authenticated runtime SHA256062864129140cf85bc16982e7a856fb6aef0dc3a9af650cab635c2f9b0222493
supplies the closed Workflow slice14 paths/17 schemas,
SHA25644bd9f9f21b6a3f757a44ec5fc36ddf2228fb8047244bc38d65f6e00ee6ca28e.
GET definitions/installed-characteristic-link-target is an authorized exact link
revision read; its digest/locator/catalog IDs are server-owned metadata, never
approval or a reusable authority token. Generic definition discovery, start and
independent task assignment consume these generated contracts. The actor-match
request uses the current authenticated principal; no editable actor or browser
canonicalization is introduced. Start/assignment recovery uses persisted instance
and task route context; transition conflicts require successful fresh task/action
reads. Physical characteristic links remain DRAFT after Workflow decisions until
separate protected approval publication. Only configured supported processes and
current backend-permitted actions are available; no general designer is implied.

The whole W4 candidate includes local component/contract/build validation and an
extended immutable-API native lane (seven W1-W3 cases then two W4 cases). Reference
manufacturer qualification/source authorization and process configuration are
explicit synthetic schema-owner fixtures; business revisions and actual Workflow
instances/tasks/actions use owner APIs. Native/browser qualification and independent
W4 acceptance are pending hosted exact-SHA CI. A1 integrated software acceptance,
SITE, numerical/P3 and deployment/release remain separate. Previous ENG identifiers,
legacy pins, accepted W1-W3 evidence and historical blockers remain unchanged.

## HWEB-F14 / W4 — configured link review accepted (2026-11-07)

W4 is ACCEPTED for the configured installed-characteristic link review scope.
HidraWEB `6b2230d81832d4d09bdda0410c896dba3ba239fe` passed
[Code CI #1029](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484721)
and [Docs #58](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484734).
The hosted native job ran seven W1–W3 cases and two W4 cases against accepted
HidraAPI `5817406923e53761577ac41bbc3f318b517c3977`, native JWT and fresh
PostgreSQL 16.15 with synthetic policy fixtures.

The accepted generated contract covers exact-revision handoff, discovery of the
configured review and independent reviewer, explicit start and assignment,
server-permitted APPROVE and REJECT, persisted reload and stale replay 409.
The browser consumes server-issued target metadata. The backend remains the
authority for target access, assignment and transition admission. The unrelated
actor's handoff returned an empty 404 and the tested Workflow calls returned
403. The physical link stayed DRAFT after each completed review. Physical
approval publication and HWEB-F15/A1 are separate acceptance scopes.
