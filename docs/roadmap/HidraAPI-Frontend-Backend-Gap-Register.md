# HidraAPI ↔ HidraWEB Backend Gap Register

```text
Document role          : Canonical frontend-facing backend contract acceptance register
Frontend repository    : CHOUABBIA-AMINE/HidraWEB
Backend source of truth: CHOUABBIA-AMINE/HidraAPI main
Backend baseline       : 1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
OpenAPI artifact       : hidra-api-openapi-1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
Artifact digest        : sha256:3c861464876f588fdd40352b379a2bfe2a87840272703b71d20d7f81e9a6898f
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

HidraAPI `main` at `1bfa44ed…` is the latest accepted backend baseline used by HWEB-009. The phase intentionally consumes owner-specific deterministic OpenAPI artifacts: incident from `5c4c949f…`, leak detection from `ff92c6af…`, and HSE from `1bfa44ed…`. Each exact artifact and digest is recorded in the HWEB-009 section below.

HidraWEB consumes artifact-derived contract slices for HWEB-003 workbench, HWEB-004 identity/organization, HWEB-005 topology, HWEB-006 telemetry/monitoring, HWEB-007 workflow, HWEB-008 alarm, and HWEB-009 incident/leak-detection/HSE reads. Springdoc optionality is preserved: HidraWEB normalizes optional response fields at its presentation/API boundary rather than falsifying the published schema.

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
Backend evidence: HidraAPI CI publishes hidra-api-openapi-${github.sha}; accepted artifacts/digests are recorded in this register.
Frontend evidence: HWEB-003/004/005/006/007/008/009 Orval inputs use slices extracted from published HidraAPI artifacts. HWEB-009 preserves owner-specific exact artifact pins for incident, leakdetection, and hse. CI regenerates every consumed slice before lint/typecheck/tests/build.
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

HWEB-007 is implemented at `/work/tasks` for the published query, action-visibility and authoritative transition-execution contract. Branch CI run `34630590467` at `1162a93390ed0f614c39e3a59a0581518b9f6804` passed all six OpenAPI generation gates, lint, typecheck, unit/component tests, production build, Playwright installation, and E2E browser tests.

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
Frontend evidence: HWEB-007 renders backend-returned AvailableActionView values directly. Only entries with permitted=true and a backend transitionId are offered for execution; reasonRequired, commentRequired and requiredPermissionCode remain backend-authored metadata.
Frontend rule   : Never infer workflow transitions locally; available actions are backend-authoritative choices.
```

### GAP-WF-004 — Workflow transition execution contract

```text
Status          : VERIFIED
Backend route   : POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute
Backend evidence: HidraAPI issue #57 / PR #60. Acting principal/effective permissions are server-derived; task and instance rows are protected for concurrent execution; stale expectedTaskUpdatedAt, terminal/wrong-step/assignment/permission/reason/comment/definition/transition conditions are validated; action/history and state advancement occur atomically; authoritative task/instance/action result is returned. Conditional-expression and target-module-callback transitions fail closed until separately implemented.
Frontend evidence: HWEB-007 consumes the exact generated ExecuteWorkflowTransitionRequest/TransitionExecutionResult contract. It sends the selected task updatedAt as expectedTaskUpdatedAt, never sends a desired state, executes only permitted backend actions, invalidates/refetches task/action/instance/timeline state after success, and handles stale conflicts as refresh-before-retry. Component and E2E tests assert the exact POST path/body and prove non-permitted actions have no execution control.
Legacy rule     : POST /api/v1/workflow/actions remains record-only and is not used as a transition substitute.
```

HWEB-007 state rule: TanStack Query owns task/detail/action/instance/timeline server state; React local state owns selected-task/action/form/presentation state. HidraWEB does not maintain a client workflow state machine.

---

## HWEB-008 alarms

HWEB-008 is implemented at `/alarms` from the accepted artifact-derived alarm slice. Final behavioral branch CI run `34613930912` at `4e9e308c219b23fa5e93e1b4a2fa27e774017276` passed all six OpenAPI generation gates, lint, typecheck, 20/20 unit/component tests, production build, and 13/13 Playwright tests.

Canonical HWEB-008 grants:

```text
alarm:alarms:read
alarm:alarms:execute
```

### GAP-ALARM-001 — Active/history/detail queries

```text
Status          : VERIFIED
Routes          : GET /api/v1/alarm/alarms
                  GET /api/v1/alarm/alarms/{id}
Frontend evidence: HWEB-008 provides active/history views with backend-owned state/severity/topology/time filters, bounded paging, detail inspection, and generated-contract API/component/E2E coverage.
```

### GAP-ALARM-002 — Shelving lifecycle

```text
Status          : VERIFIED
Routes          : GET  /api/v1/alarm/alarms/{id}/shelvings
                  POST /api/v1/alarm/alarms/{id}/shelvings
                  POST /api/v1/alarm/alarms/{id}/shelvings/{shelvingId}/unshelve
Frontend evidence: HWEB-008 displays shelving history and executes only the published shelve/unshelve contracts behind alarm:alarms:execute. Successful commands invalidate/refetch backend alarm state, and a shared pending-state guard prevents concurrent alarm lifecycle submissions from the selected-alarm workspace.
Frontend rule   : Do not infer shelving or alarm state transitions locally; HidraAPI remains authoritative.
```

### GAP-ALARM-003 — Acknowledgement and closure commands

```text
Status          : VERIFIED
Routes          : POST /api/v1/alarm/alarms/acknowledgements
                  POST /api/v1/alarm/alarms/closures
Frontend evidence: HWEB-008 consumes the published acknowledgement/closure command contracts behind alarm:alarms:execute. API/component/E2E tests prove command wiring and authoritative post-command refetch behavior.
Constraint      : Trusted actor attribution is tracked separately by GAP-ALARM-005.
```

### GAP-ALARM-004 — Suppression mutation contract

```text
Status          : OPEN
Backend evidence: Suppression is a distinct Alarm Management domain concept, not merely an enum: AlarmSuppression, AlarmSuppressionScopeType, AlarmSuppressionStatus, persistence/repository support, SUPPRESSED/UNSUPPRESSED lifecycle events, and the Alarm data-definition document distinguish suppression from shelving. Backend PR #61 records the semantics audit. The accepted OpenAPI still exposes no suppression mutation.
Blocking decision: Authoritative lifecycle behavior remains undefined for release/unsuppression (for example whether an alarm returns to its exact pre-suppression state or another state) and for clear/close/escalate interactions while suppressed. Those rules must not be invented by HidraWEB.
Frontend state  : HWEB-008 deliberately renders no suppression mutation and communicates that suppression is unavailable through the accepted REST contract.
Completion gate : HidraAPI completes the missing lifecycle decisions, authorization, validation, audit and deterministic errors, then publishes the explicit suppression/release contract in deterministic OpenAPI.
```

### GAP-ALARM-005 — Trusted actor attribution for acknowledgement/closure

```text
Status          : IMPLEMENTED
Backend evidence: HidraAPI PR #59 merged as 7a435b122d0fdf020c3158fd472fa35b6162130d. Acknowledgement and closure actor identity is now server-derived from the authenticated principal; browser-controlled actor attribution is no longer authoritative. Post-merge CI 34616649939 passed and artifact hidra-api-openapi-7a435b122d0fdf020c3158fd472fa35b6162130d was published with sha256:5ba484af942fc4c6dce23b4011e217598d9418e62708f92de6f9723a041ae5b0.
Frontend state  : The backend gap is closed, but HWEB-008 has not yet been separately re-accepted against this actor-attribution contract in this register; keep IMPLEMENTED rather than VERIFIED until that focused frontend reconciliation is performed.
```

Alarm realtime publication remains covered by `GAP-REALTIME-001` and is DEFERRED until verified domain publishers/event families exist.

---

## HWEB-009 events and incidents

HWEB-009 composes one `/events` user process while preserving separate backend ownership for `incident`, `leakdetection`, and `hse`. It does not create a frontend-owned shared event aggregate or infer cross-module relationships that are not published by owner-module DTOs.

Latest green behavioral evidence before closure documentation:

```text
HidraWEB branch      : hweb-009-hse-workspace
Behavioral HEAD      : 40ad230b4152274d8ad74be3c92908a573348fc0
CI run               : 34654112588
Result               : SUCCESS
Verified gates       : all OpenAPI generators, lint, typecheck, unit/component tests, production build, Playwright install, E2E
```

### GAP-INCIDENT-001 — Incident list/detail query contract

```text
Status          : VERIFIED
Backend SHA     : 5c4c949fc73c0e15fcc8794beb2c6681931afc7e
Backend CI      : 34648671005
Artifact        : hidra-api-openapi-5c4c949fc73c0e15fcc8794beb2c6681931afc7e
Artifact digest : sha256:a5e563f2c0e56b03af32ed79e8ab26146fa8dec4eca43d9a33fd1049596e08c9
Routes          : GET /api/v1/incident/incidents
                  GET /api/v1/incident/incidents/{id}
Frontend evidence: HWEB-009 incident workspace consumes the generated artifact-derived list/detail contracts with paging, backend route-derived permission checks, fail-closed behavior, and backend-published topology/actor/organization/workflow references only. Incident frontend merge SHA cc2d676ee1afdbd4e1fe70d8ffd1a05221df096d.
```

### GAP-LEAK-001 — Leak candidate/case query contracts

```text
Status          : VERIFIED
Backend SHA     : ff92c6af819723f4965a8a631a633384be2c46e1
Backend CI      : 34651081678
Artifact        : hidra-api-openapi-ff92c6af819723f4965a8a631a633384be2c46e1
Artifact digest : sha256:f77554c0488ebcc7a46d76d2a442378013afb30d0024e8929726c2fef5efc2eb
Routes          : GET /api/v1/leakdetection/candidates
                  GET /api/v1/leakdetection/candidates/{id}
                  GET /api/v1/leakdetection/cases
                  GET /api/v1/leakdetection/cases/{id}
Frontend evidence: HWEB-009 leak workspace consumes generated artifact-derived candidate/case list/detail contracts with independent backend-derived read permissions, paging, exact backend fields only, and component/E2E coverage. Frontend merge SHA f7b0446024126c0b838f4853cbd1fca133f3d9a0; post-merge CI 34652031970 SUCCESS.
```

### GAP-HSE-001 — HSE case/CAPA query contracts

```text
Status          : VERIFIED
Backend SHA     : 1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
Backend CI      : 34652739432
Artifact        : hidra-api-openapi-1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
Artifact digest : sha256:3c861464876f588fdd40352b379a2bfe2a87840272703b71d20d7f81e9a6898f
Routes          : GET /api/v1/hse/cases
                  GET /api/v1/hse/cases/{id}
                  GET /api/v1/hse/capas
                  GET /api/v1/hse/capas/{id}
Frontend evidence: HWEB-009 HSE workspace consumes generated artifact-derived HSE case/CAPA list/detail contracts with independent case/CAPA read permissions, paging, backend-published incident/topology/workflow/audit/work-order/task references only, and no invented lifecycle mutations. Behavioral HEAD 40ad230b4152274d8ad74be3c92908a573348fc0 passed CI 34654112588.
```

HWEB-009 state rule: TanStack Query owns incident/leak/HSE server state. React local state is limited to selected tab, page numbers, selected record identifiers, and presentation-only state. No frontend lifecycle state machine is maintained.

HWEB-009 mutation rule: incident/leak/HSE command endpoints are not exposed merely because they exist. Any future mutation UI requires a separate exact contract/authorization/concurrency/actor-attribution/lifecycle review.

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

HWEB-009 implementation is complete for the accepted read-composition scope and is at its final exact-head CI / PR #16 merge / post-merge verification gate. `GAP-ALARM-004` suppression remains OPEN and `GAP-REALTIME-001` remains DEFERRED. `GAP-ALARM-005` is backend IMPLEMENTED and requires a separate focused frontend reconciliation before it may be marked VERIFIED.

Do not expand HWEB-009 closure into alarm suppression, realtime, HSE mutations, leak mutations, or any other new lifecycle surface.


---

## 2026-10-11 — HWEB-CONTRACT-001 foundation-first delta register (planning; not implementation acceptance)

**Source baselines:** HidraAPI `c3f47c79248d8e645e1fbe924ede79782dda6c17`; HidraWEB `23693ce520f6df2d6c1143ab65d703da2a0a01d0` (contract-addendum and CI #967 SUCCESS). Read this section as a current **delta** to historical gap records and pinned feature artifacts above; do not rewrite or promote the older baselines. HidraAPI's simulator-deferral decision remains **proposed until formally recorded in its own roadmap**. Existing simulation metadata/run-queue interfaces do not prove a running numerical solver.

**Evidence:** [canonical Contract v1 §25](../architecture/Hidra-API-Web-Contract-v1.md), [HidraAPI Ultimate Roadmap](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/main/doc/roadmap/ULTIMATE_ROADMAP.md), [current Topology controller](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/main/src/main/java/dz/sh/hidra/modules/topology/api/rest/controller/SpringTopologyController.java), [current map controller](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/main/src/main/java/dz/sh/hidra/modules/topology/api/rest/controller/TopologyMapController.java), [HWEB-005 topology workspace](HWEB-005-Network-Topology-Workspace.md). Controller mapping evidence does not certify request/response completeness, production deployment, or current OpenAPI publication. Exact transport contracts require an accepted backend-produced artifact.

| Requirement | Source-backed boundary | Gap decision | Dependent API design | Frontend target |
|---|---|---|---|---|
| ENG-001 Physical network authoring | Topology publishes pipeline-system creation; immutable physical revision persistence exists internally | IN_PROGRESS | Draft graph create/read/validate/revise/publish contracts and permissions; no existing full editor claim | Network editor only after API acceptance |
| ENG-002 Station/unit connectivity | Facility registration exists; installed equipment references exist; complete station internals not proven | IN_PROGRESS | Station header/link and independent installed unit revision write/read | Station & unit configuration workspace |
| ENG-003 Geographic route/elevation profiles | Node/facility coordinates/elevations and map reads exist; full surveyed route/profile authoring not established | OPEN | CRS/datum, ordered route geometry, chainage, elevation profile, source precision/evidence and revision APIs | GIS route/profile authoring; never infer surveyed geometry |
| ENG-004 Pipe sections | Segment endpoints/length and revision-bound internal diameter/roughness exist, not complete operator authoring | IN_PROGRESS | Typed physical section attributes, units/validity and immutable changes | Pipe section forms |
| ENG-005 Installed equipment identity/model | Topology/Assets JPA and APIs provide partial identity/lifecycle capability | IN_PROGRESS | Resolve authoritative installed unit, Assets model and Party manufacturer without duplication | Equipment registry/editor |
| ENG-006 Manufacturer characteristics | Simulation immutable characteristic revisions exist for supported families, but no full operator import/revision workflow verified | IN_PROGRESS | Type-validated curves, units, reference conditions, provenance, approval and exact binding; no solver extension | Manufacturer engineering-data editor |
| ENG-007 Products/composition | Custody exact gas-fluid revision storage exists; complete operator product authoring and additional product families not proven | IN_PROGRESS | Product record/import/revision, source/method applicability and explicit unsupported states | Product configuration workspace |
| ENG-008 Immutable engineering baseline | Bounded Topology/Custody/equipment revision stores exist; full multi-owner baseline not yet proven | IN_PROGRESS | Atomic manifest of exact owner revisions/digests, effective selection and historical replay; keep independent from numerical run snapshots | Baseline compare/revision browser |
| ENG-009 Telemetry location linkage | Trusted reads and point binding services exist; whole operator workflow and production event family not proven | IN_PROGRESS | Approved binding, source/quality/freshness semantics, query recovery and authorization | Monitoring with explicit stale/unknown states |
| ENG-010 Validation, approvals, audit | Identity/Workflow/exception and some authoring routes implemented, but integrated engineering publish flow not proven | IN_PROGRESS | Backend authoritative validation, revision transitions, conflict and permissions; no frontend approvals invented | Guided authoring/publish UX |
| ENG-011 Batch import/export | No accepted complete typed engineering import/export workflow established in inspected contract | OPEN | Dry run, field-level diagnostics, unit/CRS validation, atomicity and rollback | Bounded import/export UX |
| ENG-012 Capability/completeness discovery | Topology capabilities exists; complete per-editor machine-readable eligibility not established | IN_PROGRESS | Published required fields/unsupported states, active feature and permission availability | Fail-closed navigation, completion diagnostics |

### Acceptance rules for the delta register

- `OPEN` and `IN_PROGRESS` are **not** frontend implementation authority. Before progressing to `IMPLEMENTED`, cite exact accepted backend method/path, OpenAPI schema/artifact SHA, permissions, backend tests, migration if needed and CI. Before `VERIFIED`, cite generated HidraWEB client, positive/negative integration and browser tests and exact CI.
- Generic JPA attributes, JSON fields, OpenAPI type names and documentation proposals are insufficient by themselves to certify an operator authoring lifecycle.
- Existing HWEB-R and HWEB-P completed evidence remains historical and unmodified; working pages may be reused or refactored only through a separately selected scoped task.
- Proposed simulator deferral affects new numerical development only; engineering data, historic source revisions and qualified telemetry remain independent. No hydraulic output, OT write or fake realtime event is authorized.
