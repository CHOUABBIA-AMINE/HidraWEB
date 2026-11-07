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
