# HidraWeb Development Roadmap

```text
Repository       : HidraWEB
Backend truth    : CHOUABBIA-AMINE/HidraAPI main
Architecture     : docs/architecture/HidraWeb-Information-Architecture.md
                   docs/architecture/Hidra-API-Web-Contract-v1.md
                   docs/architecture/HidraWeb-Technical-Architecture.md
Delivery model   : modular frontend monolith
Rule             : no screen/action/API assumption without HidraAPI evidence or an explicit approved TARGET gap
```

## Global delivery rules

1. HidraAPI is the source of business truth and final authorization enforcement.
2. HidraWeb consumes OpenAPI, permission metadata, DTOs and realtime contracts; it does not mirror JPA/domain implementation.
3. Primary navigation is process-oriented; backend modules remain ownership boundaries.
4. Cross-module UI composition belongs in `src/processes`.
5. Every API use is typed from HidraAPI OpenAPI or documented as an approved temporary exception.
6. Every task ends with lint, typecheck, tests and production build green.
7. A feature is not complete until authorization and failure states are tested.
8. No micro-frontends, alternate framework or alternate map engine are introduced without an architecture decision.

---

# HWEB-001 — Bootstrap Application

**Dependency:** architecture baseline complete.  
**Outcome:** executable React/TypeScript foundation.

Tasks:

- HWEB-001-01 branch from current `main`.
- HWEB-001-02 Node 24 LTS and npm toolchain baseline.
- HWEB-001-03 package manifest with approved dependencies.
- HWEB-001-04 strict TypeScript configuration.
- HWEB-001-05 Vite development/build configuration on port 5173.
- HWEB-001-06 canonical provider composition.
- HWEB-001-07 minimal `/overview` router only.
- HWEB-001-08 central Axios/correlation/error infrastructure.
- HWEB-001-09 Orval OpenAPI generation configuration.
- HWEB-001-10 verified permission endpoint constants.
- HWEB-001-11 i18next bootstrap with RTL capability.
- HWEB-001-12 Vitest + React Testing Library smoke.
- HWEB-001-13 Playwright startup smoke.
- HWEB-001-14 CI pipeline.
- HWEB-001-15 committed package lock.
- HWEB-001-16 CI converted to `npm ci`.
- HWEB-001-17 CI green.

**Exit:** application boots and all technical quality gates pass; no business process implemented.

---

# HWEB-002 — Application Shell, Authentication and Permissions

**Depends on:** HWEB-001.  
**Backend source:** HidraAPI security configuration and permission catalog/routes.

Tasks:

- HWEB-002-01 inventory actual authentication modes and environment configuration from HidraAPI.
- HWEB-002-02 implement `AuthProvider` adapters for dev Basic and enterprise JWT without embedding credentials in feature code.
- HWEB-002-03 confirm whether an authenticated-principal endpoint exists; if absent, document a TARGET contract gap before coding principal UI.
- HWEB-002-04 implement permission catalog query for `/api/v1/security/permissions/catalog`.
- HWEB-002-05 implement route descriptor query for `/api/v1/security/permissions/routes`.
- HWEB-002-06 normalize permission metadata into frontend guard model without treating client guards as enforcement.
- HWEB-002-07 implement permanent navbar: product identity, operational context placeholder, global search placeholder, realtime status, tasks, notifications, language, profile.
- HWEB-002-08 implement collapsible process sidebar from canonical navigation registry.
- HWEB-002-09 intersect sidebar routes/actions with loaded permission metadata.
- HWEB-002-10 implement 401/403/404 global states.
- HWEB-002-11 implement contextual drawer infrastructure; no permanent right column.
- HWEB-002-12 add shell accessibility/keyboard tests.
- HWEB-002-13 add authorization E2E scenarios.

**Exit:** authenticated shell renders only permitted process entries; backend 403 remains authoritative.

---

# HWEB-003 — Generic Operational Workbench

**Depends on:** HWEB-002.  
**Backend source:** HidraAPI `HidraOperationalWorkbenchController`.

Tasks:

- HWEB-003-01 generate/update OpenAPI clients from current HidraAPI.
- HWEB-003-02 implement module discovery from `GET /api/v1/workbench/modules`.
- HWEB-003-03 implement resource discovery from `GET /api/v1/workbench/{module}/resources`.
- HWEB-003-04 implement paged list/query from workbench list endpoint.
- HWEB-003-05 implement detail retrieval.
- HWEB-003-06 implement advanced search POST contract.
- HWEB-003-07 create reusable `OperationalWorkbenchPage`.
- HWEB-003-08 create reusable data-grid toolbar/filter/pagination primitives.
- HWEB-003-09 create generic detail drawer.
- HWEB-003-10 ensure workbench is secondary-resource UX, not a replacement for specialized operational processes.
- HWEB-003-11 test 400/403/404/5xx and empty/loading states.

**Exit:** authorized generic backend resources can be discovered, listed, searched and inspected without handwritten DTO assumptions.

---

# HWEB-004 — Identity and Organization Context

**Depends on:** HWEB-003.  
**Backend owners:** `identity`, `organization`.

Tasks:

- HWEB-004-01 inventory current identity/organization controllers, DTOs and workbench resources.
- HWEB-004-02 generate clients and map only verified contracts.
- HWEB-004-03 implement users/roles/permissions workspaces where endpoints exist.
- HWEB-004-04 implement organization units and employee/assignment workspaces where endpoints exist.
- HWEB-004-05 establish reusable actor and organization display/reference components.
- HWEB-004-06 keep login credentials owned by identity and employee hierarchy owned by organization.
- HWEB-004-07 authorization and workflow-reference tests.

**Exit:** HidraWeb can display responsible actor/organization context used by later operational processes.

---

# HWEB-005 — Network and Topology Workspace

**Depends on:** HWEB-002; uses HWEB-003 primitives where useful.  
**Backend owner:** `topology`.

Tasks:

- HWEB-005-01 verify current topology layer catalog and GeoJSON contracts.
- HWEB-005-02 implement `HidraMap` abstraction and MapLibre adapter.
- HWEB-005-03 load `GET /api/v1/topology/map/layers`.
- HWEB-005-04 load layer metadata/features.
- HWEB-005-05 render `/api/v1/topology/map/geojson` as valid GeoJSON.
- HWEB-005-06 implement topology search endpoint.
- HWEB-005-07 implement layer tree, legend, visibility and selection state.
- HWEB-005-08 implement asset inspector contextual drawer.
- HWEB-005-09 expose only backend-evidenced layers; pipeline-system/pipeline layer gaps remain explicit if absent.
- HWEB-005-10 add map performance guardrails and feature-count observability.
- HWEB-005-11 add map keyboard/accessibility alternatives where practical.

**Exit:** `/network` is a specialized operational spatial workspace backed only by HidraAPI topology contracts.

---

# HWEB-006 — Telemetry and Operational Monitoring

**Depends on:** HWEB-005.  
**Backend owners:** `telemetry`, `monitoring`; topology provides spatial context.

Tasks:

- HWEB-006-01 inventory telemetry/monitoring routes, DTOs, workbench resources and realtime events.
- HWEB-006-02 implement telemetry readings browser.
- HWEB-006-03 implement reading quality/state presentation from actual enums/catalogs.
- HWEB-006-04 implement monitoring rules/envelopes/deviations where contracts exist.
- HWEB-006-05 implement ECharts trend component with unit/time handling.
- HWEB-006-06 link telemetry/monitoring records to topology asset context.
- HWEB-006-07 add realtime invalidation only for verified events.
- HWEB-006-08 implement `/operations` overview from verified data only.
- HWEB-006-09 performance test large reading series and paginated lists.

**Exit:** operators can inspect trusted operational readings and deviations with topology context.

---

# HWEB-007 — Workflow and My Tasks

**Depends on:** HWEB-004 and HWEB-006.  
**Backend owner:** `workflow`.

Tasks:

- HWEB-007-01 refresh workflow controller/DTO/state evidence from HidraAPI.
- HWEB-007-02 generate clients for workflow instances/tasks/actions.
- HWEB-007-03 implement `/work/tasks` using only retrievable backend task data.
- HWEB-007-04 implement embedded workflow panel contract.
- HWEB-007-05 derive action availability only from backend APIs/metadata; never invent approve/reject/delegate/escalate state rules.
- HWEB-007-06 record reason/comment forms from exact DTOs.
- HWEB-007-07 after workflow mutation, invalidate/refetch target-module resource from its owner.
- HWEB-007-08 implement workflow timeline from backend evidence.
- HWEB-007-09 test stale/conflict/permission/error outcomes.

**Exit:** workflow is global and embedded while backend target modules retain business fact ownership.

---

# HWEB-008 — Alarm Console

**Depends on:** HWEB-006 and HWEB-007.  
**Backend owner:** `alarm`.

Tasks:

- HWEB-008-01 inventory current alarm endpoints, DTOs, enums and permissions.
- HWEB-008-02 implement dense active alarm console.
- HWEB-008-03 implement history/detail workspace.
- HWEB-008-04 implement acknowledgement/closure/shelving actions only where exact endpoints exist.
- HWEB-008-05 implement severity/state semantic design components.
- HWEB-008-06 connect verified realtime alarm events to TanStack Query invalidation/update.
- HWEB-008-07 add topology links and related workflow context.
- HWEB-008-08 test concurrent mutation and authorization behavior.

**Exit:** operator alarm response is specialized, fast and backend-governed.

---

# HWEB-009 — Events and Incidents

**Depends on:** HWEB-008 and HWEB-007.  
**Backend owners:** `incident`, `leakdetection`, `hse`.

Tasks:

- HWEB-009-01 inventory incident/leak/HSE contracts and permissions.
- HWEB-009-02 implement incident register and full entity workspace.
- HWEB-009-03 implement leak case workspace from actual leakdetection contracts.
- HWEB-009-04 implement HSE event workspace from actual HSE contracts.
- HWEB-009-05 compose alarm, topology, workflow and document context through public module interfaces.
- HWEB-009-06 implement evidence/timeline patterns.
- HWEB-009-07 implement create/update domain actions only where exposed.
- HWEB-009-08 test cross-links, permission boundaries and failure recovery.

**Exit:** `/events` provides one user process while preserving three backend owners.

---

# HWEB-010 — Planning

**Depends on:** HWEB-006 and HWEB-007.  
**Backend owner:** `planning`.

Tasks:

- HWEB-010-01 inventory plans/periods/targets/nominations/revisions DTOs and endpoints.
- HWEB-010-02 implement planning period and plan workspaces.
- HWEB-010-03 implement revisions/version presentation.
- HWEB-010-04 integrate workflow approval only from verified workflow/plan contracts.
- HWEB-010-05 implement planned-vs-actual using telemetry only where comparable backend fields are proven.
- HWEB-010-06 test version/concurrency behavior.

**Exit:** planning process is operationally usable without transferring data ownership from planning/telemetry/workflow.

---

# HWEB-011 — Integrity and Maintenance

**Depends on:** HWEB-005, HWEB-007 and HWEB-009.  
**Backend owners:** `integrity`, `assets`.

Tasks:

- HWEB-011-01 inventory integrity/assets DTOs, resources and actions.
- HWEB-011-02 implement condition/integrity assessment workspaces.
- HWEB-011-03 implement maintainable asset and work-order workspaces.
- HWEB-011-04 compose topology, document, risk and incident context through process layer.
- HWEB-011-05 implement asset history/timeline from actual evidence.
- HWEB-011-06 test role/permission and concurrent updates.

**Exit:** `/engineering` unifies integrity and maintenance UX while keeping backend ownership separate.

---

# HWEB-012 — Metering and Custody

**Depends on:** HWEB-004 and HWEB-006.  
**Backend owners:** `custody`, with `party` only where evidenced.

Tasks:

- HWEB-012-01 inventory custody/party contracts.
- HWEB-012-02 implement measurement-period workspace.
- HWEB-012-03 implement transfer ticket workspace.
- HWEB-012-04 implement discrepancy/reconciliation workspace where APIs exist.
- HWEB-012-05 add topology/telemetry/party references without duplicating foreign aggregates.
- HWEB-012-06 keep party scope conservative until its ownership is explicitly validated.

**Exit:** custody operations are available under one engineering/process area using verified contracts.

---

# HWEB-013 — Intelligence

**Depends on:** trusted operational processes HWEB-006 through HWEB-012.  
**Backend owners:** `risk`, `analytics`, `simulation`, `reporting`.

Tasks:

- HWEB-013-01 inventory risk/analytics/simulation/reporting contracts.
- HWEB-013-02 implement risk views.
- HWEB-013-03 implement analytics datasets/insights/metrics where exposed.
- HWEB-013-04 implement simulation scenario/run/result workspaces.
- HWEB-013-05 implement report definition/run/export workspaces.
- HWEB-013-06 enforce read/derive/recommend presentation semantics; intelligence does not silently mutate operational source-of-truth state.
- HWEB-013-07 performance test charts, large analytic results and scenario comparisons.

**Exit:** `/intelligence` derives insight from trusted backend data without owning operational truth.

---

# HWEB-014 — Governance and Administration Completion

**Depends on:** HWEB-002/HWEB-003 and relevant backend maturity.  
**Backend owners:** `audit`, `configuration`, `documents`, `integration`, `notification`, plus identity/organization administration.

Tasks:

- HWEB-014-01 audit search/export UI where query endpoints exist.
- HWEB-014-02 configuration/feature-flag administration with strict permissions.
- HWEB-014-03 document upload/download/version evidence using multipart/stream contracts only.
- HWEB-014-04 integration connector/job/dead-letter monitoring where exposed.
- HWEB-014-05 notification center/delivery evidence according to actual APIs.
- HWEB-014-06 administration destructive-action confirmations and audit references.

**Exit:** governance/supporting capabilities are available without dominating primary operational navigation.

---

# HWEB-015 — Production Hardening

**Depends on:** feature scope accepted.  
**Outcome:** production-ready enterprise frontend.

Tasks:

- HWEB-015-01 freeze supported enterprise authentication mode and IdP contract.
- HWEB-015-02 OIDC/JWT production integration and token lifecycle hardening.
- HWEB-015-03 same-origin reverse-proxy deployment design.
- HWEB-015-04 CSP, TLS, secure headers and static asset cache policy.
- HWEB-015-05 frontend observability, structured technical error reporting and correlation IDs.
- HWEB-015-06 WCAG 2.2 AA audit including keyboard-only control-room workflows.
- HWEB-015-07 bundle analysis and route-level lazy loading budgets.
- HWEB-015-08 large-grid/map/chart performance tests.
- HWEB-015-09 full Playwright regression suite for critical operational journeys.
- HWEB-015-10 OpenAPI compatibility gate between HidraAPI and HidraWEB pipelines.
- HWEB-015-11 backup/rollback and release artifact verification.
- HWEB-015-12 production readiness review.

**Exit:** all functional, security, accessibility, performance and deployment gates are accepted.

---

## Mandatory task completion template

Every implementation task shall record:

```text
Backend source commit / branch
Endpoints and DTOs used
Permissions used
Frontend routes created/changed
State ownership
Error states
Tests added
OpenAPI regeneration status
Known backend gaps
CI result
```

A task may not be marked complete from UI appearance alone.
