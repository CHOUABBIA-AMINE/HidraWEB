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


## 2026-10-11 — HWEB-F01 artifact-backed ENG-001–012 capability audit

Backend code head `a691843f359126a9f439217862f780b5806c5fd2`:
HidraAPI CI #644 SUCCESS; code-equivalent documentation-only main
`dc01eeb3d8a2ea2fe0115a589948dd1eb8f77d67`.
OpenAPI artifact `11701445061`, ZIP SHA-256
`f1b0a07819b4103b29c219a566acdb7e7afc1becdd38d146f15030d60c433524`,
JSON SHA-256
`6bd2a642420b0c7cda3de61e158ff97906f05665c415e1c179c7cbbd7d1ec83f`.
This is *published backend truth*, not successful HidraWEB repinning.
The existing 20 feature Orval contracts remain historical accepted
frontend inputs and require separate current compatibility testing.

| ENG | Existing backend contract evidence | Missing target or verification | Disposition |
|---|---|---|---|
| ENG-001 | `POST /api/v1/topology/pipeline-systems` | Physical graph draft/read/validate/revise/publish and grants | PARTIAL; NOT EDITOR-READY |
| ENG-002 | `POST /api/v1/topology/facilities` | Station headers, independent units/incidence, revision writer | PARTIAL; NOT EDITOR-READY |
| ENG-003 | `GET /api/v1/topology/map/geojson` | CRS/datum/chainage/intermediate survey and profile write/history | OPEN; NOT EDITOR-READY |
| ENG-004 | Internal physical source stores; limited system POST | Pipe-section engineering property writer/history, units/conflicts | PARTIAL; NOT EDITOR-READY |
| ENG-005 | Assets maintainable-asset POST/PATCH and Party registration | Canonical installed-unit/model/manufacturer typed binding and history | PARTIAL; NOT EDITOR-READY |
| ENG-006 | Existing Simulation metadata endpoints | Manufacturer curve/table/limit authoring/approval without solver | PARTIAL; NOT EDITOR-READY |
| ENG-007 | `POST /api/v1/custody/transfer-tickets` | Canonical product/composition/method revision writer | PARTIAL; NOT EDITOR-READY |
| ENG-008 | Existing internal bounded immutable source records | Multi-owner baseline freeze, digest, compare/history/replay API | PARTIAL; NOT EDITOR-READY |
| ENG-009 | Telemetry latest/history/trend GET | Qualified asset/location binding, freshness and permission acceptance | PARTIAL; READER ONLY |
| ENG-010 | Workflow available-actions and transitions | Engineering-specific validation, publication/approval and concurrency | PARTIAL; NOT EDITOR-READY |
| ENG-011 | `POST /api/v1/audit/exports` is **audit only** | Engineering typed import/export, dry-run, rollback and diagnostics | OPEN; NOT EDITOR-READY |
| ENG-012 | Topology capabilities and Identity effective-permissions GET | Per-editor missing-value/eligibility/grant machine contract | PARTIAL; NOT COMPLETE |

Published `hidraBearerJwt` marks inspected protected operations but
does not provide the required fine-grained action/resource grant matrix;
do not invent specific permission codes. Schema comparison adds four
operations and four named schemas, but six changed schemas include
breaking request/response changes:
`CreateOrganizationUnitRequest.validFrom` now required,
`CreatePipelineSystemRequest.systemType` replaced by
`systemTypeCode`, `PipelineSystemResponse.systemType` replaced with
typed identity fields, and `StartIntegrationJobRunRequest.runNumber`
removed. See normative contract §26 for the full six-item delta.
Actual frontend consumer compatibility with this new artifact was **not
executed**; the old manifest stays pinned to `5028a902...`.

**Current HWEB-F01: SELECTED — IN PROGRESS / BLOCKED FOR CONSUMER PIN.**
The missing backend CI and artifact are resolved; owner-reviewed
compatibility, permission-negative tests, affected Orval consumer regeneration
and measured frontend CI remain necessary before F01 closure.
All HWEB-F02–F10 stay PROPOSED / NOT SELECTED.


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

## HWEB-F14 / W4 — handoff dependency resolved; native browser evidence pending

Backend handoff prerequisite accepted at5817406923e53761577ac41bbc3f318b517c3977,
Full1140/Docs930 SUCCESS, acceptance428a6f00a5813294b067daeb0df5f5bdaff72658.
The previous no-preapproval-target-handoff blocker is historical. W4 now consumes
source-stamped generated target addressing and process/reviewer choices; no local
digest/locator, hardcoded target catalog IDs, actor impersonation or counterfeit
approval is substituted. Exact source and closed-contract digests,20-file scope
and validation are recorded in the canonical roadmap's resumed whole W4 entry.

Status: IMPLEMENTED / NATIVE_BROWSER_QUALIFICATION_PENDING. Local58 Vitest files/
156 tests,98 Node checks,6 performance cases, lint/types/contracts/build pass;
ordinary browser launch is unavailable locally due to the missing pinned browser.
Nine native cases are authored/enumerated, not locally executed: seven W1-W3
regressions before explicit disposable credential/reference setup, then two W4
review/denial journeys against the accepted immutable API and real PostgreSQL.
Only successful exact-SHA hosted evidence plus independent acceptance can close
W4. A1/HWEB-F15 integrated acceptance, SITE/operational, P3, release and deployment
remain unexecuted. Preserve all original ENG mappings and prior gap history.

## HWEB-F14 / W4 — native qualification gate closed (2026-11-07)

**ACCEPTED** for configured installed-characteristic link review software and
native browser qualification. The prior handoff blocker was resolved by accepted
HidraAPI `5817406923e53761577ac41bbc3f318b517c3977`. Exact WEB SHA
`6b2230d81832d4d09bdda0410c896dba3ba239fe` passed
[Code CI #1029](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484721)
and [Docs #58](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484734).
The native job confirmed all seven W1–W3 and two W4 cases passed with zero
failures, flaky results or skips. The evidence covers authorized process start,
independent APPROVE and REJECT, persisted timeline, stale replay rejection,
retained DRAFT state and unrelated actor denial. The earlier pending and failed
entries record the state at their respective commits. HWEB-F15/A1 integrated
acceptance, protected physical approval publication and SITE acceptance remain
separate gates.

## HWEB-F15 / A1 — blocked integrated acceptance (2026-11-07)

**BLOCKED in Journey B.** The accepted runtime exposes responsibility assignment
and revocation with a completed, matching Organization approval prerequisite.
The pinned Workflow runtime lacks an owner resolver for
`organization/RESPONSIBILITY_CHANGE`, so the required approval cannot be created
through the published Workflow start path. Appointment end and transfer are
published by HidraAPI and lack HidraWEB browser consumers. This disposition
preserves W1–W4 acceptance and keeps the five-journey A1 gate open. The next
dependency is an owner decision on the Organization approval path and the
resulting integrated acceptance scope.

## HWEB-F15 / A1 — reconcile the Journey B blocker (2026-11-07)

The [owner-approved API revision](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/1e5e18f7f13d10f21e1cdf95cb0568dfe49cc383/doc/roadmap/FOUNDATION_PRODUCTION_ROADMAP.md#owner-approved-a1-journey-b-acceptance-revision--2026-11-07)
removes the responsibility approval producer and appointment end/transfer from
the integrated qualification dependency. Those capability gaps remain in
their owning scopes. The A1 candidate exercises one initial appointment and the
same eligible Party in the Topology system write. A1 is pending all native
A–E results and exact-SHA evidence review.


## HWEB-F15 / A1 — accepted native six-module foundation evidence (2026-11-07)

Status: **VERIFIED for the owner-revised A1 synthetic native browser scope**.
The earlier Organization responsibility approval prerequisite remains a
preserved historical BLOCKED observation under the superseded Journey B
criterion; it is **not** an implemented producer or a verified responsibility
assignment/revocation path. Initial appointment and its current owner read,
Organization unit/employee hierarchy/lifecycle, Party activation/role/history,
protected denial and Party-to-Topology reference reuse meet the revised gate.

Exact WEB `c6a44faa80a74871dc31c5c1e4ada2d1c05863ac`, immutable API
`5817406923e53761577ac41bbc3f318b517c3977`,
[Code CI #1033](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42410743798) SUCCESS and
[A1 evidence artifact ID 13589920776](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42410743798/artifacts/13589920776) are the acceptance pins.
Native A1 1/1, W1–W3 7/7 and W4 2/2 passed with zero unexpected, flaky or skipped;
201 Flyway migrations succeeded and the retained runtime OpenAPI SHA256 is
`48bfd92267aaba516ae948bde71bb461868ae059afbd9a4ad5630eb39d07a189`.
Historical contract-pinning and engineering gaps keep their original statuses
and dated evidence. Appointment transfer/end, Workflow-approved responsibility
change, unified deployment-role concurrency, industrial/SITE acceptance,
release/deployment, live OT/SCADA and numerical/P3 remain outside this record.

## HWEB-F16 — GZ2 alarm acknowledgement preflight: HOLD (2026-11-08)

**Disposition: HOLD / PREFLIGHT REVIEWED, NOT ADMITTED.** The registered documentation-only preflight has been performed against the exact source and CI evidence below. No application, REST, migration, workflow, OpenAPI snapshot, test, or deployment change was authorized or made. No live GZ2, identity, OT, or production data was used.

### Exact source and contract evidence

- **HidraWEB** \`main\` \`5d01241c60f8a9a8b9353bd756a9749f3e3bd727\`, parent \`7fef9c042052bc2a326b15a103e5ee3d35df1db4\`, tree \`8bac61f14390f8cc1bd84d2f725972f859ed1fee\`. [Documentation Validation #63](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42490353945) completed SUCCESS. The latest earlier code baseline cited by registration, [Code CI #1034](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42463226504), is on the prior code head; a docs-only success does not rerun browser or application tests.
- **HidraAPI** \`main\` \`70490d28e1a290a14578c2fc6320d242b4a76ec3\`, parent \`ce0e059b16db85d4b61da06f5a0ad1a1944d1015\`, tree \`a0e2115c2bea1bfac12c11002e8374b658925f4f\`. [Full CI #1145](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536476) and [Documentation #937](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536750) completed SUCCESS.
- Full CI #1145 published artifact \`hidra-api-openapi-70490d28e1a290a14578c2fc6320d242b4a76ec3-42485536476-1-api-contract\` (artifact ID \`13619486144\`, ZIP digest \`sha256:2fb6023a4e9f64c7a84d6ebc32ef1259d4af5e9ce8b9ff799ef60925ee216d10\`). This is the **archive digest**, not an independently extracted \`hidra-api.json\` digest or proof of an accepted WEB consumer pin. No fresh runtime OpenAPI payload was extracted or contract-diff-tested in this preflight.
- The WEB Alarm Orval configuration still references the older reviewed [Alarm slice](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/5d01241c60f8a9a8b9353bd756a9749f3e3bd727/openapi/candidates/hidra-alarm-76b14cda4520f1eff242bd474c02ce4db317d385.json) via [\`orval.alarm.config.ts\`](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/5d01241c60f8a9a8b9353bd756a9749f3e3bd727/orval.alarm.config.ts). The retained slice identifies bearer JWT security, \`GET /api/v1/alarm/alarms\`, \`GET /api/v1/alarm/alarms/{id}\`, and \`POST /api/v1/alarm/alarms/acknowledgements\` with \`AcknowledgeAlarmRequest\` and \`AlarmView\`. Static API source exposes the same route shapes, but current exact-artifact compatibility is **NOT VERIFIED**. Formal HAPI-929 and WEB refresh-token consumer acceptance remain separate.

### Source-backed request and response mapping

| Browser step | Observed WEB adapter | Observed HidraAPI behavior | Qualification |
|---|---|---|---|
| Authenticate / effective grants | \`AuthProvider.tsx\` verifies the principal and permission metadata; \`PermissionProvider\` uses effective grants | Route interceptor checks canonical \`alarm:alarms:read\` or \`alarm:alarms:execute\` | **Only coarse route-level permission**, not alarm-specific authorization. For disposable testing, select LOCAL credentials exchanged for a Hidra-issued bearer JWT; do not assume external OIDC/LDAP activation or completed refresh-token acceptance. |
| List and count | \`fetchAlarms({view,state,severityId,topologyAssetId,from,to,page,size})\` | \`AlarmQueryController.alarms\` delegates to \`JpaAlarmQueryAdapter.alarms\`, which reads all Alarm rows, filters client-supplied fields in memory and pages with \`totalElements\` | **BLOCKED**: no current principal, company or authorized asset-scope predicate; \`topologyAssetId\` is a user-chosen filter, not an authorization check. Count protection fails by code-path inspection. |
| Detail / asset context | \`fetchAlarm(id)\`; \`AlarmConsolePage.tsx\` displays source and topology labels | \`JpaAlarmQueryAdapter.alarm\` calls \`entityManager.find(AlarmJpaEntity.class, id)\` and maps owner/asset snapshots | **BLOCKED**: no resource ownership/scope check before finding or returning the alarm. The snapshot label alone does not establish an authoritative GZ2 company-to-asset association. |
| Acknowledge | \`acknowledgeAlarm({alarmId,organizationUnitId?,organizationUnitCode?,comment?,correlationId?})\` | \`SpringAlarmController\` gets actor ID and principal name from \`CurrentActorResolver\`; \`AlarmApplicationService\` locks the alarm; the acknowledgement adapter saves evidence, updates state, and appends lifecycle event transactionally | **BLOCKED** for resource scope. Trusted actor and server \`Instant.now()\` are source-backed; optional organization unit ID/code still come from the browser and are not shown to be validated as the actor's eligible responsibility. Response is the acknowledgement evidence ID, not a final Alarm view. |
| Fresh readback / replay | WEB invalidates Alarm queries and fetches detail including state, \`acknowledgedAt\`, \`acknowledgedByActorId\` | \`AlarmView\` includes persisted state/actor/time, and the persistence adapter updates those fields | **Partially supported by source**, not native-qualified. \`AlarmLifecycleGuard.ensureCanAcknowledge\` excludes closed/cancelled alarms but allows a second acknowledgement of an open alarm. \`AlarmAcknowledgementSemanticPostgresIntegrationTest.liveAndDirectAcknowledgementsAreAtomicAndMultipleHistoryRowsRemainLegal\` explicitly expects two evidence rows. A new business rule would be needed for strict single-action/idempotent semantics. |

Source paths verified at the API SHA: [Alarm query controller](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/api/rest/controller/AlarmQueryController.java), [JPA query adapter](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/infrastructure/query/JpaAlarmQueryAdapter.java), [acknowledgement controller](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/api/rest/controller/SpringAlarmController.java), [application service](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/application/service/AlarmApplicationService.java), [acknowledgement adapter](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/infrastructure/persistence/adapter/JpaAlarmAcknowledgementRepositoryAdapter.java), [lifecycle integration test](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/test/java/dz/sh/hidra/modules/alarm/infrastructure/persistence/AlarmAcknowledgementSemanticPostgresIntegrationTest.java), [WEB adapter](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/5d01241c60f8a9a8b9353bd756a9749f3e3bd727/src/features/alarm/api/alarmApi.ts), and [WEB Alarm Console](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/5d01241c60f8a9a8b9353bd756a9749f3e3bd727/src/features/alarm/AlarmConsolePage.tsx).

### Native verification status and reproducible gate

**NOT EXECUTED in HWEB-F16:** a booted exact-SHA API, disposable migrated PostgreSQL, synthetic GZ2 topology and alarm fixtures, real authenticated operator sessions, and browser/HTTP POST+fresh GET traces were not available as a validated test environment in this inspection. The existing WEB [component test](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/5d01241c60f8a9a8b9353bd756a9749f3e3bd727/src/features/alarm/AlarmConsolePage.test.tsx) uses a mocked HTTP client and the [Alarm E2E test](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/5d01241c60f8a9a8b9353bd756a9749f3e3bd727/tests/e2e/alarm.spec.ts) intercepts and mocks API routes; neither supplies same-grant cross-scope proof. No HTTP 403/404/409 semantics or durable denied-write behavior is asserted as observed.

To requalify after an authorized Alarm-owner fix, first capture the exact API OpenAPI payload digest and accept an explicit WEB contract pin. On a disposable fresh migrated PostgreSQL/API/browser setup, create synthetic alarm evidence bound to an owner-validated GZ2 topology asset. Use three genuine authenticated actors: (1) in-scope operator, (2) same-company out-of-scope operator, and (3) cross-company out-of-scope operator; give each equivalent Alarm route grants so resource protection is tested independently. For each identity, record list rows and totals, direct detail and direct acknowledgement HTTP status and response, durable acknowledgement/event counts before and after, actor/time readback and duplicate/stale replay behavior. Ensure no out-of-scope existence or count disclosure, and no denied write. Keep actual test logs, commands, schema version, redacted principal/scope facts and payload digest. These are **required future acceptance cases, not executed test results**.

### Smallest owning prerequisite and decision

**API-owner security prerequisite:** make Alarm-owned list/count, detail and acknowledgement (and any related readable/actionable alarm resource paths admitted to the same release) enforce current principal **company/resource/asset authority**, checked before existence/count disclosure and under the guarded mutation transaction, against an authoritative Topology/Organization ownership or responsibility contract. Preserve immutable history, actor/time provenance, route-grant checks, and fail-closed behavior; document 403-versus-masked-404 and race/replay semantics with native same-grant negative tests. Do not ask the WEB to filter after receiving all records. Decide whether the product requires only one user action or strict once-only/idempotent acknowledgement; do not silently prohibit already-supported multiple historical acknowledgements. Do not infer this decision from a roadmap code or assume a new API task has been registered.

**Result: HOLD.** The source-backed scope defects independently prevent ADMIT even if a later synthetic happy-path succeeds. Exact runtime OpenAPI comparison, approved GZ2 ownership binding, same-grant three-principal native PostgreSQL/browser proof and an accepted API/WEB pair remain open. Production/SITE acceptance and release/deployment are not selected. Preserve earlier HWEB-008 VERIFIED transport/UI wiring as historical scope; this new F16 release gate is not verified.

## HWEB-F16 — HAPI-930 passing native API evidence, WEB admission still HOLD (2026-11-09)

**Evidence base updated without rewriting the historical 2026-11-08 preflight.** Current HidraWEB `e518f7113f66c38157c2cc35f239828e8dcbc295`, [Docs #64 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42490948209); current HidraAPI `02c2d130b902547c113b8fbea83b9affcfd4e892`, [Full #1154 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349) and [Docs #946 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838208). Direct inspection of the shard-3 [raw test artifact #13660488419](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349/artifacts/13660488419) shows the registered `pairedCurrentCompanyAndAssetScopesProtectNativeReadsCountsAndAcknowledgementHistory` native test passes (1 test / 0 failures / 0 errors / 0 skipped). The CI suite uses real Identity LOCAL sessions, synthetic Topology FACILITY ownership, three actors with identical Alarm route permissions and different explicit company+asset grants, immutable acknowledgements and negative scope/revocation checks. This **supersedes the old source-level conclusion that all Alarm resources are globally unscoped on the newer API SHA**; it does not retroactively falsify the earlier preflight pinned at the earlier implementation.

**Fresh runtime OpenAPI:** artifact `hidra-api-openapi-02c2d130b902547c113b8fbea83b9affcfd4e892-42589838349-1-api-contract`, artifact ID `13660882599`, ZIP SHA-256 `fe2128020b40a9d3ac31a64912735c34534e249f1164a068d8ff0b3cf1fa3d2d`; independently extracted `hidra-api.json` SHA-256 `23cb45be5456bb84f28beec63e0c8b6a03e6b80b157ec55645eb81da829881ff` (851,347 bytes, 347 paths, 13 Alarm prefix paths). Relevant signed Hidra bearer endpoints are `GET /api/v1/alarm/alarms` (page/count: `PageAlarmView`), `GET /api/v1/alarm/alarms/{id}` (detail: `AlarmView`) and `POST /api/v1/alarm/alarms/acknowledgements` (`AcknowledgeAlarmRequest` -> ID). This is source-of-contract evidence, **not** a completed compatibility diff or accepted WEB generation pin.

| Previously held criterion | Refreshed independent finding | Still required to ADMIT |
|---|---|---|
| Current company and exact asset isolation at the API | **Supported by exact-SHA API native integration pass for synthetic FACILITY GZ2-station subset**, current Identity binding and exact paired grant checks; unsupported PIPELINE_SYSTEM fails closed | Confirm intended real GZ2 resource/organization owner and supported asset type for the actual release |
| Same-grant permitted/denied HTTP and acknowledgement persistence | **Supported by the one native API PostgreSQL test, not WEB browser proof** | Exact new-pinned WEB caller, signed-in three-operator browser journeys, protected count/detail/ack direct requests and after-reload actor/time/historical event readback |
| API schema and contract publication | **Runtime 2026-11-09 artifact retrieved and SHA-256 verified** | Owner-accepted WEB Orval `orval.alarm.config.ts` and `openapi/candidates` update, generated source review, consumer CI and explicit compatibility verification against exact JSON |
| One human action vs strict idempotency | Distinct repeated human acknowledgements remain lawful and separately audited under HAPI-930 owner's approved interpretation | Do not claim exactly-once/replay suppression without an explicit new business rule and test |
| Issuer and deployment assumptions | Native API GZ2 test asserts synthetic HTTPS issuer `https://identity.hidra.invalid/gz2` and stored JWT binding | Organization-controlled production URI and actual deployment remain unselected and unverified |

**HWEB-F16 outcome remains HOLD, not ADMIT.** The remaining blockers are WEB OpenAPI consumer acceptance, native browser+HTTP proof on a disposable schema, and approved owner/reference selection for the real targeted GZ2 asset. The currently checked-in Alarm Orval config still points to `openapi/candidates/hidra-alarm-76b14cda4520f1eff242bd474c02ce4db317d385.json`; no new client pin, frontend tests or production code were changed. Previously accepted HWEB-008 technical wiring and HWEB-F15/A1 synthetic six-module foundation remain separate. No SITE, operational, live OT, numerical P3 or deployment acceptance.

## HWEB-F16 — canonical task correction and unified remaining acceptance (2026-11-09)

**Owner instruction / governance correction:** **HWEB-F16 is the only registered Alarm workflow task.** The immediately preceding documentation registration attempted to give the contract-pin activity a child identifier without authorization. This has been corrected: no suffixed task, subdivided package or separately registered partial acceptance exists now or may be created in future. The [prior commit](https://github.com/CHOUABBIA-AMINE/HidraWEB/commit/cdfd4a541f912c8801e925c2c8b2e809d3b03c1c) remains Git history only; the [canonical HWEB-F16 scope](ULTIMATE_ROADMAP.md#hweb-f16--single-task-execution-scope-and-owner-correction-2026-11-09) is the current instruction. Historical A1/W1–W4 accepted foundation records are not rewritten.

**Evidence carried forward, not inflated:** API `02c2d130b902547c113b8fbea83b9affcfd4e892` [Full CI #1154 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349), [Docs #946 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838208), and native shard-3 [artifact #13660488419](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349/artifacts/13660488419) (1 GZ2 scoped-operator test, no failures/errors/skips). OpenAPI artifact `13660882599` extracted full JSON SHA256 `23cb45be5456bb84f28beec63e0c8b6a03e6b80b157ec55645eb81da829881ff`. WEB `cdfd4a541f912c8801e925c2c8b2e809d3b03c1c` [Docs #66 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42593391936), with the existing Alarm Orval pin unchanged. The latest API evidence proves synthetic FACILITY current-authority semantics, not actual industrial owner binding or native browser behavior.

**Unified HWEB-F16 remaining work and gate:** A verified Alarm OpenAPI/Orval consumer pin with unchanged strict security/compatibility guards **and** a single synthetic end-to-end genuine WEB browser workflow: three LOCAL operators of equivalent route permission, current company/exact asset isolation before any list/count/existence disclosures, authorized acknowledge, persisted state/actor/time after reload, no denied mutation, and explicit replay semantics. Recognize a reference GZ2 station without treating it as the only gas system or inventing a real topology owner. These are activities and acceptance checks of one task, not separately executable or registrable HWEB tasks. Current source/test allowlist and whole-task implementation message still require owner authorization; the revoked child registration cannot supply that approval.

**Status remains HOLD / not ADMITTED.** HWEB-F16's one completion decision follows the whole qualification. Earlier foundation acceptance, backend green CI, current OpenAPI publication and this docs correction do not alone constitute WEB code/runtime or SITE acceptance. No source, generated client, tests, configuration, web CI, migration or deployment is changed by this correction.

## HWEB-F16 — refreshed accepted T62 Alarm contract and whole-task source envelope (2026-11-25)

**HOLD / NOT ADMITTED.** [Canonical refreshed F16 admission preflight](ULTIMATE_ROADMAP.md#2026-11-25--hweb-f16-refreshed-whole-task-admission-preflight-hold) records the proposed exact current allowlist, source message and unified acceptance. API T62 closeout Docs #1231 passed; [CI #1372](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45579484367) on `b451302179eb3a5877aefcb105dab0f3ccb47897` passed full development gate, including strict runtime and physical dictionary equality. [Runtime artifact 15006336272](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45579484367/artifacts/15006336272) ZIP SHA-256 `4e531da5e8c5bf4491738db22d0984be47315be15522506a4a3390767df7f973`, raw JSON SHA-256 `d99f2f98cb2edd76f951e0ffefe212d21c2a5cbdf8de48dd58f0f560eff486bc` independently downloaded/extracted and source stamp verified. Proposed Alarm-only candidate `openapi/candidates/hidra-alarm-b451302179eb3a5877aefcb105dab0f3ccb47897.json` has 15 paths, 18 operations, 13 transitive schemas and actual bearer scheme; compact bytes SHA-256 `cf152e52ad51591a385327439f27f79fc741ab9b9c3dd6a025b301ca320432ab`. Existing 13-path candidate remains unchanged/unrepinned. Two evaluation-linked paths are additive and capabilities operationId changes; all 11 existing schemas unchanged. No new command authorization.

Latest Alarm detail exposes persisted acknowledgedAt/acknowledgedByActorId; full immutable acknowledgement history is not exposed by the browser REST contract. Synthetic native PostgreSQL verification can inspect durable history while the WEB browser uses only protected detail/readback. Backend source and passing signed API suite support paired company/FACILITY scope and denied counts/read/write/revocation; WEB signed browser evidence is not yet executed. Current WEB lacks actor display and explicit stale selection/error cleanup. The refreshed single-task envelope includes the mandatory isolated native suite and ordinary Playwright exclusion; preserve all other pins, existing jobs and mocks, no fake data or authorization. Actual GZ2 operational ownership/reference still requires owner confirmation before actual-target admission. UXR-29 schema blocker resolved by T62 but F16 remains a separate blocker; no source work or UXR-29/F22 admission by this record. Separate explicit approval of revised exact F16 scope and message is required.

## HWEB-F16 — owner-approved implementation delivered; native qualification pending (2026-11-25)

Owner approved complete refreshed 18-path envelope; [canonical implementation record](ULTIMATE_ROADMAP.md#2026-11-25--hweb-f16-whole-task-implementation-owner-approved-qualification-pending). New candidate pins qualified API `b451302179eb3a5877aefcb105dab0f3ccb47897` (CI #1372), SHA-256 `cf152e52ad51591a385327439f27f79fc741ab9b9c3dd6a025b301ca320432ab`, Git blob `0153418be31f421465c55297a2710f3b43c1fc54`. Focused artifact/comparator checks passed; no unrelated schema, pin, API or migration changed. WEB performs fresh protected acknowledgement readback, displays server actor/time, isolates and retires stale selection/command state, and does not automatically replay submitted command. Complete immutable acknowledgement history remains test-harness evidence, not a new REST operation.

Mandatory F16 native Code CI job uses exact T62 API, PostgreSQL 16, genuine LOCAL login, three equal-route-grant operators with differing paired scopes, browser POST/GET, durable history and revocation/owner-change checks. No mocked response in native scenario. Source and test registration delivered in single implementation commit, hosted acceptance pending. Existing mocked/native regression jobs and proof locks preserved. No actual GZ2 ownership, operational, release, SITE, OT or deployment qualification. F16 retains final ADMIT/HOLD gate; UXR-29/F22 remain blocked. No UXR-30.

## HWEB-F16 — CI #1129 recovery (2026-11-25)

The mandatory native Alarm qualification passed all six checkpoints (one test, zero failed/flaky/skipped) on `cf8f94b046899d7334b9d3243fb44eca21664194`; the aggregate Code CI failed on two unused test bindings. Typecheck and subsequent sequential verification did not run. The bounded repair removes only the unused bindings; all three actors and assertions remain. See the [canonical recovery record](ULTIMATE_ROADMAP.md#2026-11-25--hweb-f16-ci-1129-recovery-qualification-pending). F16 remains HOLD pending exact-repair-SHA aggregate acceptance; UXR-29 remains blocked.

## HWEB-F16 — CI #1130 component recovery (2026-11-25)

On `74c0044dc203b2dfb66b59825df749e217888094` F16 native, A1, F18 and Docs passed; aggregate Code CI #1130 failed one of 320 Vitest tests by timeout after lint/typecheck success. The exact stalled assertion is unknown. The bounded test-only recovery explicitly waits for suppression success and acknowledgement re-enable, uses detail-specific text selection, and sets a local 15-second integration test budget; all existing assertions, individual assertion deadlines and global gates preserved. [Canonical recovery record](ULTIMATE_ROADMAP.md#2026-11-25--hweb-f16-ci-1130-component-recovery-qualification-pending). No product or backend change; F16 and UXR-29 remain HOLD until applicable acceptance.

## HWEB-F16 — CI #1131 critical journey recovery (2026-11-25)

On `22d8bf06cfdcc69afa36882f4692e1fd5ae6ae28`, Docs #176, all static/unit/contract/performance/build/package verification and A1/F16/F18 native lanes passed. Full mocked browser regression failed one HWEB-015-09 test (118 passed, 15 existing native-only skips). Its receipt-only mock did not persist acknowledgement fields for subsequent protected GET. The narrow Fail repair updates the responsible synthetic critical journey fixture to serve the persisted owner snapshot and assert actor/time readback; no production or gate weakening. See [canonical recovery record](ULTIMATE_ROADMAP.md#2026-11-25--hweb-f16-ci-1131-critical-journey-recovery-qualification-pending). F16 remains HOLD until exact-repair-SHA aggregate qualification and disposition; UXR-29 blocked.

## HWEB-F16 — final whole-task ADMIT (synthetic development scope, 2026-11-25)

The [canonical acceptance record](ULTIMATE_ROADMAP.md#2026-11-25--hweb-f16-final-whole-task-disposition-admit--synthetic-development-scope) supersedes the software HOLD in prior F16 records. Exact WEB `fee1057f76ec5eb869671c62529f314cec370b3c` [Code CI #1132](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45612145506) and Docs #177 passed; immutable API `b451302179eb3a5877aefcb105dab0f3ccb47897` CI #1372 passed. Alarm pin digest `cf152e52ad51591a385327439f27f79fc741ab9b9c3dd6a025b301ca320432ab` unchanged. 320 Vitest, 111 Node, 5 performance and 119 mocked browser tests passed, 15 existing native-only skips, zero unexpected/flaky. A1/F18 passed; F16 native passed all six checkpoints, one test with zero failures/flakes/skips.

Downloaded and independently verified redacted [F16 artifact 15019704395](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45612145506/artifacts/15019704395), ZIP SHA-256 `a85bc3f3c4ca8c11e631c85432b9908a0f9232ccb7be9020bcb597ec5f73445d`, exact SHA pair/run/attempt, contract digest, six checkpoints and 239 successful Flyway entries. Scoped signed acknowledgement and persisted latest actor/time after reload, denial before counts/disclosure, unchanged denied histories, live revocation/current owner and distinct repeated acknowledgement behavior accepted for synthetic FACILITY scope. Actual GZ2 company/FACILITY owner mapping is still unapproved; no actual-target ADMIT, broader command qualification, operational/SITE/release/deployment acceptance or OT/P3. F16 software prerequisite satisfied for UXR-29, whose indivisible preflight/envelope must be refreshed before source admission. F22 retains its separate gates. No product source change in this closeout.

## UXR-29 — refreshed whole-task contract and implementation preflight (2026-11-25)

F16 synthetic development ADMIT recorded at `50755b50dbb1693c3f7ca2797aef26bac9257009`, Docs #178 passed; preceding accepted WEB code fee1057f76ec5eb869671c62529f314cec370b3c Code #1132 passed. T62 immutable API `b451302179eb3a5877aefcb105dab0f3ccb47897` CI #1372 and Docs #1230 passed; API closeout d8b18b4a79843224caeb7972209f389570b90abf Docs #1231 passed. Both prior software prerequisites satisfied. Independently extracted runtime artifact 15006336272 raw digest d99f2f98cb2edd76f951e0ffefe212d21c2a5cbdf8de48dd58f0f560eff486bc. Four exact candidate slices reconstructed, all bearer protected, zero breaking findings versus preceding pins via repository comparator; Incident 11/12/9, Leak 11/13/12, HSE 14/16/15, Planning 17/19/22 paths/operations/schemas. Unchanged F16 Alarm candidate includes evidence GET. Distinct Incident/Leak investigation schemas now source-backed; HSE five new scoped GETs use items/total and exact case hierarchy, no legacy fallback; Planning submit uses dual owner tokens and existing Workflow discovery/current assigned independent reviewer, no synthetic owner IDs hardcoded. No new Incident/Leak/HSE commands or broadened Alarm qualification. No actual-target ownership or SITE claim.

The [canonical refreshed envelope](ULTIMATE_ROADMAP.md#2026-11-25--p7--uxr-29-refreshed-whole-task-implementation-envelope-selected-source-approval-pending) registers one 49-path proposed source implementation commit, exact byte digests, native test-only overlay boundaries and four mandatory browser phases. CREATE 13, UPDATE 36, DELETE none for future implementation; this preflight appends only two governance documents. Existing F16/A1/F18/UXR28 proof locks retained. No source, Orval, browser or PostgreSQL execution newly performed; UXR-29 selected, source approval pending, not accepted. F22 blocked; UXR-30 unselected.

### 2026-11-25 — UXR-29 implementation; qualification pending

The owner-approved single implementation envelope consumes the exact accepted HidraAPI T62 `b451302179eb3a5877aefcb105dab0f3ccb47897` source. Four additive candidate pins retain prior operations: Incident +3 GET, Leak +2 GET, HSE +5 GET, Planning +1 POST. Alarm T62 F16 and all other accepted source pins remain unchanged. Typed evidence and investigation reads, scoped FACILITY HSE and case-owned CAPA/history, independent Planning submission/approval and current-target comparison are implemented in the registered WEB source paths. No new investigation/HSE mutation, nominations UI, general alarm admission, numerical engine or cross-owner persistence. No client-side calculation is treated as Monitoring evidence.

Exact registered envelope: 13 new and 36 updated paths, zero deletions, append-only roadmap and gap record. Static candidate operation/refs/bearer checks and exact unique API test-overlay anchors were verified; local full build/test/native execution unavailable. The mandatory Code CI UXR-29 native job requires all four signed browser phases, preserved original API tests, exact source and migration provenance and redacted output. The HSE duplicate-number browser fixture temporarily restores the original reviewed synthetic source after its masked denial check and restores the pre-callback state afterwards; this remains a test-only qualification choice, not a new operational lifecycle. UXR-29 implementation is pending exact-SHA CI/engineering acceptance, F22 blocked and UXR-30 not selected.

### 2026-11-25 — UXR-29 qualification failure and bounded repair

Failed source SHA `5889149deadc4efd0aa2a34b64d7b63c0c184063`: [Code CI #1133 attempt 1](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45641718876) completed failure; Documentation #180, A1, F16, F18 and contract/generation checks passed. Main verify stopped at two ESLint inline import-type violations; TypeScript and subsequent verify gates were not reached. Native evidence: Planning reached DRAFT_DISCOVERY, STALE_SUBMIT, SIGNED_SUBMIT, SELF_DENIED, INDEPENDENT_APPROVE, failed on rejection HTTP status (then line 410); RESPONSE_BEFORE and HSE_AFTER failed to find the expected owner facility in current regional scope discovery (then line 115); RESPONSE_AFTER was not reached. These checkpoints are not phase passes.

Repair within UXR-29: replace inline import types with explicit type imports; satisfy exact T33/T61 active system, foundation company ownership and current facility link in disposable synthetic fixtures, preserving facility-specific grants and existing source assertions; seed an active Workflow reason catalog entry and supply it for independent rejection, and enforce immutable API WorkflowDecisionGuard reason/comment rules in the permitted Planning decision form even when optional transition flags are false. Regression asserts blank reason cannot enable rejection and native checks require the exact reason/token, including stale token rejection. These diagnoses derive from immutable API source `b451302179eb3a5877aefcb105dab0f3ccb47897`; masked native logs establish failing checkpoints, not actual private response payload/status values. No retry, skip, threshold, migration, API source, OpenAPI pin, permission boundary or CI acceptance gate is weakened. The temporary synthetic lineage setup is an implementation choice for the native witness; it supplies canonical owner facts, not production configuration. No local full lint/typecheck, browser or PostgreSQL execution claimed (checkout DNS, Node 22, no Docker); exact-SHA CI must verify the fix. UXR-29 remains acceptance pending; F22 blocked, UXR-30 unselected.


### 2026-11-25 — UXR-29 CI #1134 bounded compilation and native witness repair; acceptance pending

Exact failed WEB source `a7e5bd6d4f741076a22d94ca05975902a78b929a`, [Code CI #1134 attempt 1](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45678021931): compatibility, all 21 client-generation gates, lint and A1/F16/F18 passed; TypeScript failed with TS2769 at ScopedHseWorkspace line 37 and PlanningWorkspacePage.test lines 86–87; downstream verify checks were skipped. Documentation #181 succeeded. Native Planning reached COMPLETE (1 passed, zero unexpected/flaky/skipped); RESPONSE_BEFORE passed SIGNED_READS and ALARM_EVIDENCE, HSE_AFTER passed MASKED_COLLECTION, DUPLICATE_DISCOVERY and SCOPED_CASE, both subsequently failed at generic response wait/status assertions; RESPONSE_AFTER not reached. Raw request/status information was not retained by the prior redactor.

Owner requested repair. Fix the MUI Stack alignment via sx and replace unsupported Testing Library exact options with anchored accessible-name regexes. Native witness repair keeps all original checks, handles early parallel promise rejections without converting them to success, awaits parallel receipts together, and adds same-principal signed prechecks and exact browser response parity for Incident and HSE, plus manual Alarm detail and masked evidence status. Fixed allowlisted operation labels and numeric HTTP statuses or WAIT_FAILED are exported through all three existing redaction boundaries; no URLs, payloads, IDs, headers or raw logs. No phase/checkpoint, threshold, retry, permission, API pin, API source, original Java assertions, or migration weakened. The exact remaining native root cause is not established; signed prechecks distinguish owner failures from browser orchestration failures. T62 unfiltered CAPA list and all original native acceptance remain mandatory. No backend repair or new task selected. Local GitHub DNS unavailable, Node 22 versus required 24, no Docker/PostgreSQL executable; full CI remains required. UXR-29 acceptance pending; F22 blocked, UXR-30 unselected.


### 2026-11-26 — UXR-29 CI #1135 repair and backend CAPA blocker

Exact failed WEB source `d6679ba3618ba5d1aa44ba14807c9daedc18bb2e`: [Code CI #1135 attempt 1](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45708942495), Documentation #182 passed. Lint/typecheck and contract generation passed. Unit/component tests 329 passed, 6 failed across 5 files; duplicate rendered trees and stale DOM were observed. Explicit Testing Library cleanup is added only to those five test files; assertions, mock denial semantics and test thresholds remain intact. The Incident regression additionally exercises a detail with no generic source tuple and proves that current owner evidence still drives the escalation GET. Native Planning passed all registered checkpoints; A1 and F18 passed. F16 failed at pinned Maven 3.9.11 distribution download before native execution; reuse the existing A1 wrapper cache pattern with the same immutable wrapper properties key, preserving the bounded retry and original build/test gate.

Native RESPONSE_BEFORE signed manual Alarm evidence and browser evidence both returned 404 as required; signed Incident timeline, investigation and escalation returned 200, browser timeline/investigation returned 200, browser escalation WAIT_FAILED. T62 EvidenceLinkedIncidentEscalationApplicationService.receipt() returns the first current owner-authorized timeline entry. Derive eligibility from the fresh validated timeline instead of depending on optional generic IncidentView source metadata when the timeline permission exists; match escalation owner, source type/id and evaluation identity to its first receipt. Preserve explicit source fallback only when timeline permission is absent, and retain fail-closed authorization, scope, freshness and mismatched/denied receipt retirement. No fabricated evidence or broadened grants.

**Backend blocker:** native HSE reached masked collection and duplicate discovery, then same-principal signed unfiltered scoped CAPA list returned HTTP 500 before any browser CAPA assertion. Immutable T62 JdbcHseCapaLifecycleStoreAdapter.capas uses SQL `(? IS NULL OR c.action_number=?)` with two nullable arguments; PostgreSQL untyped null parameter inference is the leading source-backed diagnosis, not a confirmed SQLSTATE (private server logs not exported). Filtered CAPA witnesses do not establish unfiltered support. Required backend corrective registration: preserve owner fencing, pagination/count, filter semantics and immutable migrations; use separate fixed SQL branches or explicitly typed nullable bind, add genuine PostgreSQL native HTTP proof for omitted filter, populated filter, empty/beyond-page and denial, then publish/accept a new immutable backend SHA and verify all affected pins before WEB repin. No backend source/contract change authorized or performed by this WEB repair, no workaround using arbitrary filters, no HSE skip or lower threshold. Until the backend is corrected and qualified, UXR-29 cannot pass all native phases. Current WEB repair remains acceptance pending; F22 blocked and UXR-30 unselected. Local checkout DNS failure, Node 22 vs required 24 and no PostgreSQL/Docker; no local test run claimed. Exact-SHA CI remains mandatory.


### 2026-11-26 — UXR-29 corrective alignment to qualified T29 backend and Planning comparison; acceptance pending

Owner contextual `Next` selects one bounded UXR-29 repair after the API corrective acceptance. Current WEB `ecdb78d457454a606d948c1180ed101c6e0dcaad`, [Code CI #1136 attempt 1](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45782086441) failed only the full mocked Chromium gate (121 passed, 15 expected native skips, one HWEB-010-05 failure on all attempts) and native HSE_AFTER (signed unfiltered CAPA list HTTP 500). Documentation #183, all 21 contract generations, lint/typecheck, 335 unit/component tests, 5 performance tests, production build/package, A1/F16/F18, native RESPONSE_BEFORE, RESPONSE_AFTER and PLANNING_SUBMIT_REVIEW passed. All remaining failures and HSE downstream checkpoints reviewed, not just the first error.

**Qualified backend:** HidraAPI T29 corrective runtime `6aad877c2681a278d141b5dc8d9deea6d18544e5` [CI #1373](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45785570601) passed 611 classes/4,564 tests, all 14 PostgreSQL shards and the Full Verification Gate, zero failed/errored/skipped tests; Docs #1232 passed. Acceptance closeout `41be469c901086f4964376b874322e84ce5a5b39` [Docs #1233](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45788255642) passed. Relative to original T62 runtime `b451302179eb3a5877aefcb105dab0f3ccb47897`, exact recursive tree comparison shows only the HSE JDBC adapter, signed HSE test, CI inventory and roadmap changed; no additions/deletions. Canonical OpenAPI blob `51f64eccb2a4ee583b2476f679dec97b8dfd7ce9` is unchanged, and corrected runtime passed strict equality (496 paths/541 operations/597 schemas), compatibility and strict physical dictionary (239 migrations/471 JPA mappings/623 relations). Hosted [OpenAPI artifact 15100820658](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45785570601/artifacts/15100820658), published ZIP SHA-256 `99475d530785db664610cbdecf5e0eb41e4c6c2244e0388f5af4a7fcd7dd0fd2`. Retain the five byte-identical T62 candidate contract files, all Orval configurations and compatibility digests: no duplicated or falsely relabelled contract artifact. Distinguish the original contract_source_sha from api_sha in native evidence and require both; Java still compares every pinned operation, schema and bearer scheme against the corrected actual runtime in all four phases. Only the dedicated UXR-29 runtime checkout/assertions/overlay change; F16/A1/F18 and unrelated lanes remain on their independent qualified pins. Refresh only HSE fixture Git blob to `57e044d61e77481f1a9871f8f8bef38389ebac76`; three other original anchors unchanged and the HSE insertion anchor remains unique. Preserve all newly qualified API assertions, existing original methods, disposable test-only overlay, all phase/checkpoint and no-failure thresholds, exact contract digests and migration inventory comparisons.

**WEB regression:** the mocked approved target begins 2026-10-01, but its synthetic deviation was dated 2026-09-12. Use 2026-10-12 within the same period; retain all prior browser assertions and exact target-scoped Monitoring request. Give unit fixtures consistent owner target versions and bounded dates; add two negative tests immediately before and after the validity window, asserting the monitoring call occurred but invalid evidence/table is not disclosed and selection is retired. No production validity, unit/point/scope or authority rule changed. In the HSE native test, prove the second parent's unfiltered signed page and browser response parity/visibility before changing its filter; this prevents premature filter cancellation from hiding the corrected default path. Preserve exact filtered and duplicate IDs, denial and scope-change assertions. The first parent's signed list, detail/history and later HSE checkpoints still need exact WEB CI qualification. The original private SQLSTATE was not available; API signed regression has qualified the corrected behavior.

**Exact repair:** `fix(operations): align UXR-29 with qualified T29 runtime`; UPDATE only `.github/workflows/ci.yml`, `scripts/prepare-uxr29-native.py`, `scripts/uxr29-native/Gz2Uxr29BrowserBridge.java`, `tests/e2e/planning.spec.ts`, `src/features/planning/PlannedVsActualPanel.test.tsx`, `tests/e2e/uxr29-native.spec.ts`, `docs/roadmap/ULTIMATE_ROADMAP.md`, `docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md`. CREATE/DELETE none. No HidraAPI mutation, permission broadened, threshold reduction, skipped acceptance, production release, SITE/OT, deployment, or solver. Local Node v22.16.0 instead of required 24, GitHub DNS unavailable, Docker and Maven absent; source/tree/anchor checks only, no local full runtime tests claimed. UXR-29 remains acceptance pending, F22 blocked, UXR-30 unselected. Stop after guarded main publication and exact-SHA CI startup.


### 2026-11-26 — P7 / UXR-29 exact-SHA acceptance and closeout

**Status: UXR-29 CI-PASSED / COMPLETED within its registered synthetic development-software qualification scope.** Owner contextual `Next` selects this single evidence-only closeout; supersedes preceding pending and repair records without rewriting them. Accepted WEB runtime/source `1f7c458b89bdc62ce5baea2e21f5d3efeaaed225`, parent `ecdb78d457454a606d948c1180ed101c6e0dcaad`, tree `d4763c8014f14681a5b7a2636b4b80eda07db071`. [Code CI #1137 attempt 1](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/attempts/1) and [Documentation #184](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697330) completed successfully on that exact SHA. [Verify job](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/job/139805297627) passed all 21 contract generations and compatibility, ESLint, TypeScript, 103 unit/component files (337 tests), two performance files (5 tests), production build, initial JavaScript 756.2 KiB / 900 KiB budget, package and artifact verification, mocked Chromium 122 passed, 15 registered native-only skips, zero unexpected or flaky. HWEB-010-05 passed, with two added before/after validity-window negative unit regressions in the passing suite. [A1](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/job/139805298272), [F16](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/job/139805297929) and [F18](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/job/139805298145) passed their independently pinned native qualifications. The separate UXR-26/28 workflow is unchanged and did not trigger on these paths; its previously accepted exact-SHA Signed Native #18 remains historical evidence, not a new execution.

**Native UXR-29:** [job 139805298270](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/job/139805298270) passed the immutable corrected API runtime `6aad877c2681a278d141b5dc8d9deea6d18544e5`, accepted by [API CI #1373](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45785570601) (4,564 tests/611 classes/14 PostgreSQL shards, zero failures/errors/skips), API Docs #1232, acceptance closeout `41be469c901086f4964376b874322e84ce5a5b39` and [Docs #1233](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45788255642) success. Original contract provenance remains `b451302179eb3a5877aefcb105dab0f3ccb47897`, with unchanged canonical OpenAPI blob `51f64eccb2a4ee583b2476f679dec97b8dfd7ce9`. Hosted runner verified original API test-only overlay lines preserved, five backend test methods passed, exact contract and migration inventories matched, all four signed real-browser phases each EXPECTED=1 UNEXPECTED=0 FLAKY=0 SKIPPED=0, COMPLETE and PASSED. RESPONSE_BEFORE: signed reads, Alarm evidence, manual Alarm detail 200 and unlinked evidence 404 (signed and browser), Incident timeline/investigation/escalation 200 signed and browser, Leak history, sibling/foreign denial and missing source. RESPONSE_AFTER: persisted owner evidence after restart, sibling/foreign denial, scope change and same-token revocation before/after. HSE_AFTER: masked collection, duplicate discovery, scoped case, signed CAPA list/history/detail 200 and actual browser CAPA list/history/detail 200, second-parent default CAPA parity, CAPA/history, wrong scope, legacy masking and scope change. PLANNING_SUBMIT_REVIEW: draft discovery, stale submit, signed submit, self denial, independent approve/reject, wrong scope, historical revision and fresh login. Both previous failure areas are resolved in their registered witness scope; original private PostgreSQL SQLSTATE remains unavailable.

**Artifact metadata:** [redacted UXR-29 evidence 15102157734](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/artifacts/15102157734), published ZIP SHA-256 `7cd1fea0ce888c3da03f468eebb0f3f876e6d2ee4b3ece9e1e5c19536b9562ea`; [verified WEB package 15102866038](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292/artifacts/15102866038), published ZIP SHA-256 `da79a2b91c9af797fd5479c096ebd12d1c99ea471db24f4345b3f336ab24f5e7`. Evidence based on hosted logs, required job/gate outcomes and artifact metadata; no independent ZIP extraction, local test execution or production promotion claimed. The artifact is a verified build, not a release authorization.

**Consumer gap disposition:** VERIFIED within the admitted UXR-29 typed read and Planning submit/review scope: Alarm linked and missing evidence, Incident/Leak owner investigation and escalation readbacks, scoped HSE case/CAPA/history and current scope masking, Planning exact draft submission and independent approval/rejection, current approved target comparison with owner Monitoring evidence and out-of-window rejection. No broad lifecycle or mutation qualification inferred (Incident/HSE/Leak commands, nominations, Alarm beyond the separate F16 acknowledgement scope); native Planning comparison is bounded by the presence of qualified Monitoring evidence, not an assertion of a new live measurement feed. Existing residual Assets/Integrity, Audit actor binding, optional Risk, F22 and prior independent qualification boundaries remain. Actual company/FACILITY mapping, industrial engineering/SITE/UAT, deployment/OT, calibration, release and numerical P3 remain outside this acceptance.

**Next registered candidate:** P7 / UXR-30, one indivisible task, WS-06 Metering & Custody (`/custody`): measurement periods, transfer tickets, discrepancies, reconciliation and eligible Party reference context. Before implementation, refresh exact live sources and CI, inspect accepted Custody and Party contracts, company/transfer-point scope, revision and immutable Party snapshot, signed lifecycle and browser evidence, and register a bounded whole-task envelope with exact message, path ledger and acceptance matrix. No unsupported joins, global counts, broadened permissions or unqualified finalization. UXR-30 NOT SELECTED in this closeout; F22 remains blocked; no Circle 2/P3 or release/deployment selection.

**Closeout scope:** `docs(roadmap): accept UXR-29 native operations qualification`. APPEND ONLY the canonical roadmap and matching backend gap register; CREATE/DELETE none. Preserve all historical records, implementation, workflows, tests, contracts and pins. Exact source qualification remains attributed to `1f7c458b89bdc62ce5baea2e21f5d3efeaaed225`. Documentation-only closeout requires its applicable exact-SHA Documentation Validation; unchanged Code/native path filters do not require rerunning code. Direct-main expected-head guard; stop after applicable CI creation/queue/start.


### 2026-11-26 — P7 / UXR-30 scoped Custody preflight — BLOCKED

Owner contextual `UXR-30 Next` selects the single whole-task preflight, not a partial production feature or backend implementation. WEB main `de4e6ce8fdbbb039505de6274338d209bc1aa7e6`, parent `1f7c458b89bdc62ce5baea2e21f5d3efeaaed225`, tree `793aed0b75c5c9efc4b47efd5b9eeb136551ac64`; [Documentation #185](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45791766672) success; accepted UXR-29 implementation [Code CI #1137](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45789697292) and Docs #184 success. API main `41be469c901086f4964376b874322e84ce5a5b39`, parent `6aad877c2681a278d141b5dc8d9deea6d18544e5`, tree `a584a8c58bf9b1304c808453d62be74afe57a90e`; [Docs #1233](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45788255642) and accepted runtime [CI #1373](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45785570601) success. No root WEB AGENTS.md at inspected tree. API AGENTS.md now designates doc/roadmap/ROADMAP.md as active; its 1,213,910-byte blob 8cede8bb86e18f556dc5c1e6602e426e30bbaafe returned empty even with a line range through the connector. No new API task ID or sequence inferred from archived roadmaps.

**Verified source and consumer gap:** existing four /custody views use generic Workbench discovery, list, count and detail; custodyApi.ts exposes only three legacy POST commands. Orval Custody pin `openapi/candidates/hidra-custody-da4ce33ead7db40776049c861027947b61b96270.json` blob `d7cfcd0bc4b9760e90301cbfceed7afb23f6043f` contains seven paths (capabilities and six legacy POST aliases), no typed lifecycle GET. Party pin `openapi/candidates/hidra-party-18e7a7596aea1b26e958130996c8811ae7fe27e4.json` blob `d220542ec048393899dc0a4a39bcc3dc8a06c664` includes party search with eligibleOnly and role catalog; eligibility is not by itself a Custody agreement/transfer-point authorization or historical snapshot. CustodyMeasurementCaptureController and CustodyTransferLifecycleController at current API source expose exact period, measurement, reconciliation list/detail, ticket detail/history and discrepancy list/detail reads, with paired owner authorization via CustodyTransferLifecycleApplicationService. Native signed source witnesses Gz2CustodyMeasurementNativeHttpPostgresIntegrationTest (blob fc9a0ff4a993673badc1b92e125cd7557d3e7823) and Gz2CustodyTransferLifecycleNativeHttpPostgresIntegrationTest (blob 7d318cd510b3c42b9c4c0f9763acdeabee8b3c82) cover observed receipts, wrong company/asset, revocation, lifecycle and independent approval. These are inspected existing witnesses, not new browser runs. The TicketView explicitly returns OBSERVED, official=false and acceptedForCustody=false even after software finalization. ReconciliationView retains agreementPartyId, receipt IDs, product publication, meter snapshot, basis/unit, digest and selection version; it does not provide an immutable historical Party name/code payload. Do not substitute current Party master data for historical evidence.

**Blocking gap — protected discovery and legacy admission:** The inspected Custody REST controller inventory has no owner-scoped period collection/search, no period measurement collection, and no discoverable ticket collection. Generic HidraOperationalWorkbenchController delegates directly to HidraOperationalWorkbenchService: list/search construct entity predicates from caller filters and compute count before returning records; detail uses EntityManager.find; no owner-scoped Custody permission check is present in these paths. HidraOperationalWorkbenchExposurePolicy is resource/field opt-in (default empty), not row authorization; it explicitly prohibits protected HSE resources and documents but not Custody. RouteAuthorizationInterceptor ordinary route grants are not the paired Custody authority. Thus enabling generic Custody exposure or filtering already-disclosed records in WEB cannot establish safe row/count/history discovery. This is a source-backed missing guarantee, not a claim of actual production exposure. Legacy POST routes in SpringCustodyController delegate to CustodyApplicationService, whose three methods directly save domain records and do not establish the newer paired authorization/lifecycle fence; caller supplied actor references are not authenticated owner attribution. Do not qualify those commands on route permissions alone or use them as a replacement for native reconcile/finalize/disposition. No full implementation envelope admitted while the discovery prerequisite is absent; no partial UXR-30 implementation.

**Required backend handoff (proposal only; owner must register exact API task):** Custody-owned, bounded, deterministic paginated discovery for authorized company/transfer-point periods and associated measurements/tickets, or an equivalent owner-approved discoverable parent hierarchy; count and search after current owner authorization, consistent empty and unavailable responses, no global fallback. Include only scoped agreement/transfer-point/Party reference data needed by supported workflow, immutable captured agreement-Party evidence (or exact historical owner reference), exact identifiers and revisions, and explicit observed vs official status. Review existing legacy Workbench exposure and three legacy commands for protected enrollment bypass; prohibit or correctly fence the protected scope without breaking independent approved legacy administration. Where creation is required, qualify owner-scoped creation and authenticated actor/approval attribution, or explicitly restrict the selected UX to already-authorized records with owner-approved scope. Do not broaden grants or infer Party eligibility solely from an active master record. Preserve existing migration history and registered native lifecycle, idempotency, version checks, immutable history and independent Workflow decision. No backend changes or new task selected here.

**Resumption acceptance matrix:** (1) exact accepted API runtime and published OpenAPI artifact/digest, operation/schema/security comparison and new consumer pin without removing existing supported operations; (2) real signed LOCAL JWT/PostgreSQL positive discovery and detail with same ordinary grants but different company/transfer-point, direct guessed ID/parent mismatch, bounded counts/pages, empty/beyond page, scope change and same-token revocation, legacy leakage denial; (3) measurement and ticket receipts/history/reconciliation/discrepancy, quantities/units/basis and immutable Party evidence, exact signed/browser parity before/after restart; (4) eligible Party lookup without rewriting historic snapshots, unavailable/denied no fallback; (5) any admitted mutation requires exact owner-supported command, stale/conflicting token and independent reviewer where required, persisted readback and no replay side effect; no official custody claim, no physical action; (6) WEB unit/component and full mocked Chromium regression, real native Chromium using accepted fixtures, no interception or fake authority, exact-SHA Code/Docs and applicable preserved gates. Once backend evidence exists, register one whole-task implementation message, CREATE/UPDATE/DELETE ledger and mandatory native proof, then implement only that authorized envelope. Actual engineering/SITE, deployment, production, calibration, Circle 2/P3 and F22 remain outside this task. No runtime OpenAPI extraction, new test execution or full backend roadmap audit claimed in this preflight.

**Publication:** `docs(roadmap): record UXR-30 scoped custody preflight blocker`; APPEND ONLY this canonical roadmap and matching backend gap register, CREATE/DELETE none. Preserve all existing source, pins, workflows and histories. No HidraAPI mutation. Documentation-only gate; stop after guarded main publication and applicable exact-SHA CI creation/start.
