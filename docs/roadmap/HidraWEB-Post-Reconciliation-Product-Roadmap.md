# HidraWEB Post-Reconciliation Product Roadmap

```text
Roadmap code     : ROADMAP-001
Repository       : CHOUABBIA-AMINE/HidraWEB
Frontend baseline: 0f8992ce6635b6e1801331ebc0d7ecfd002bd3b1
Backend truth    : CHOUABBIA-AMINE/HidraAPI
Backend baseline : 260295c6eebc4b01922d2d488810a671305860a6
OpenAPI evidence : 63f3f60974ce57eb8cd5e42910397615195624fb
Release candidate: hidraweb-v0.1.0-rc1
Execution model  : exactly one HWEB-P task per explicit user authorization
```

## 1. Purpose

This roadmap defines the first product-development phase after the HWEB-R01..R17 reconciliation program.

The reconciliation roadmap is complete. The next phase is not another backend/frontend repair cycle. It deliberately consumes current HidraAPI capabilities that are already implemented but are not yet exposed as first-class HidraWEB workflows, while preserving all reconciliation guardrails.

This roadmap is evidence-based. It does not assume that staging/UAT has already run or that a UAT defect exists. Actual UAT findings, when available, enter through HWEB-M maintenance tasks and may take priority over planned product work.

## 2. Authority and prerequisites

Authority order remains:

```text
1. live HidraAPI main implementation
2. verified HidraAPI OpenAPI artifact
3. generated HidraWEB transport contracts
4. docs/architecture/Hidra-API-Web-Contract-v1.md
5. this roadmap
6. historical roadmap/supporting evidence
```

Before every HWEB-P task:

1. verify current HidraAPI `main`;
2. verify current HidraWEB `main`;
3. verify preceding CI is green;
4. inspect the relevant live controller/OpenAPI slice;
5. confirm route-permission metadata/effective-grant behavior;
6. execute exactly one task;
7. regenerate only the required contract/client where applicable;
8. run the task-relevant tests;
9. use the exact commit message listed below;
10. push;
11. inspect CI once;
12. stop.

If HidraAPI changes materially before a task begins, revalidate that task before implementation.

## 3. UAT precedence rule

The REL-001 staging/UAT candidate remains:

```text
HidraWEB SHA : 8ea633123839abd810b7f0617a8190006baff0b5
CI           : #929 / 36718246071 — SUCCESS
Artifact ID  : 11096704699
```

Actual staging/UAT findings are not yet recorded in the repository.

When a real UAT finding exists:

- BLOCKER and MAJOR findings take precedence over planned HWEB-P work;
- create an explicit `HWEB-Mxxx` maintenance task;
- preserve the finding evidence defined by `docs/deployment/HidraWEB-Staging-UAT-RC1.md`;
- do not silently fold unrelated UAT fixes into a product task.

## 4. Explicit exclusions

The following remain outside this roadmap until HidraAPI explicitly reactivates/publishes the required contracts:

- direct browser dependency on LeakDetectionAPI;
- gRPC-Web;
- CPM/RTTM streams;
- MQTT/Sparkplug semantics;
- PostGIS-specific browser contracts;
- Modified B31G frontend behavior;
- invented domain realtime topics while `eventFamilies=[]`;
- frontend-owned risk/KPI/hydraulic/simulation formulas;
- client-side workflow/approval state machines;
- direct industrial-control/SCADA/PLC actuation.

No HWEB-P task may introduce one of these as an implementation shortcut.

## 5. Product-development sequence

| Code | Exact commit message | Scope | Backend prerequisite | Exit criterion | Status |
| --- | --- | --- | --- | --- | --- |
| HWEB-P01 | `feat(identity): add first-class access administration workspace` | Build dedicated user/role/permission administration using current identity query and command APIs. | Current Identity Administration query/command controllers remain published. | Users/roles/permissions are first-class typed UX; role/permission grants use backend contracts; no role-name inference. | **Completed** |
| HWEB-P02 | `feat(organization): add first-class organization administration` | Add organization-unit creation, employee registration, employee assignment, and canonical responsibility administration around current dedicated reads. | Organization unit/employee/assignment and operational-scope/responsibility APIs remain current. | Organization administration no longer depends on generic workbench for first-class operations; operational responsibility stays separate from identity grants. | **Completed** |
| HWEB-P03 | `feat(risk): add governed risk authoring workflows` | Add risk-register creation, risk-assessment creation, and evidence attachment using current typed Risk commands with workbench/query evidence for reads. | `POST /api/v1/risk/registers`, `/assessments`, `/evidence` remain published. | Risk authoring is permission-gated and backend-owned; no browser risk scoring formula is introduced. | **Next** |
| HWEB-P04 | `feat(reporting): add controlled report request lifecycle` | Add typed report definition/request/run/artifact actions around existing reporting evidence views. | Reporting definition/request/run/artifact command endpoints remain published. | Report lifecycle actions use backend contracts and permissions; frontend does not fabricate generation state/artifacts. | Planned |
| HWEB-P05 | `feat(analytics): add governed analytics execution workflows` | Add dataset registration, insight creation, metric evaluation, and projection-run actions to the existing Analytics workspace. | Analytics command endpoints/capabilities remain published. | Analytics actions are typed and permission-gated; all calculated values remain backend-produced. | Planned |
| HWEB-P06 | `feat(simulation): add governed scenario and run orchestration` | Add simulation model/scenario creation, run queueing, and recommendation publication around existing evidence views. | Simulation model/scenario/run/recommendation command endpoints remain published. | HidraWEB orchestrates backend simulation only; no solver/hydraulic engine runs in the browser. | Planned |
| HWEB-P07 | `feat(integration): add controlled integration operations` | Add external-system registration, integration-job start, and exchange-message recording only where product/UAT requirements justify operator access. | Current Integration command endpoints remain published and permission metadata supports intended users. | Operations are explicit, typed, audited, and permission-gated; no retry/replay/cancel/provider controls are invented. | Planned |
| HWEB-P08 | `feat(notification): add controlled notification operations` | Add notification request/message/delivery-attempt commands only where an approved operator/admin workflow exists. | Current Notification command endpoints remain published and product ownership is confirmed. | No consumer-style inbox semantics are invented; commands expose only backend-published lifecycle operations. | Planned |
| HWEB-P09 | `feat(documents): deepen governed document workflows` | Extend document UX around current register/upload/download/link contracts, version evidence, and domain attachment flows. | Documents content/metadata/link contracts remain current. | Document workflows remain storage-provider-neutral; binary handling and target links remain backend-owned. | Planned |
| HWEB-P10 | `feat(configuration): harden configuration governance UX` | Improve configuration definition/feature-flag/value administration with validation, sensitivity, scope/effective-date presentation, and permission-aware safeguards. | Current Configuration contracts remain published. | No secret value leakage or client-side policy invention; sensitive values remain governed by backend contract. | Planned |
| HWEB-P11 | `feat(operations): improve cross-surface operator workflows` | Use verified existing contracts to improve transitions among topology, telemetry/monitoring, alarm, workflow, events, planning, and documents. | No new backend contract required beyond already accepted APIs unless task audit identifies a gap. | Navigation/context composition improves without duplicating backend state or creating new business semantics. | Planned |
| HWEB-P12 | `test(product): harden post-reconciliation product phase` | Full compatibility, accessibility, performance, E2E, deployment and release-artifact review after HWEB-P01..P11. | All preceding accepted tasks complete and compatible with live HidraAPI. | Full CI/release lifecycle green; updated staging/UAT candidate produced; known UAT findings dispositioned. | Planned |

## 6. HWEB-P01 — Identity administration

### Backend evidence

Current HidraAPI publishes:

```text
GET  /api/v1/identity/users
GET  /api/v1/identity/users/{id}
GET  /api/v1/identity/roles
GET  /api/v1/identity/permissions
POST /api/v1/identity/users
POST /api/v1/identity/roles
POST /api/v1/identity/permissions
POST /api/v1/identity/users/role-grants
POST /api/v1/identity/roles/permission-grants
POST /api/v1/identity/users/permission-grants
POST /api/v1/identity/permissions/evaluations
```

### Task boundary

HWEB-P01 should:

- refresh/expand the identity OpenAPI consumer slice as needed;
- provide typed list/detail/search UX for users, roles, and permissions;
- provide typed create-role/create-permission actions;
- expose user-role, role-permission, and direct-user-permission grants only through backend-defined request contracts;
- preserve effective dates, scope fields, reason/evidence fields, emergency-access flags, and workflow references exactly as backend data;
- use backend route permissions/effective grants for visibility and backend 401/403 for authority;
- add focused unit/component and Playwright coverage.

HWEB-P01 must not:

- infer authorization from role names;
- equate Organization responsibility with Identity authorization grants;
- create frontend-only revoke semantics when no accepted revoke contract exists;
- manufacture an ABAC expression editor beyond the backend contract;
- expose credentials/secrets directly.

## 7. HWEB-P02 — Organization administration

Current first-class command evidence includes:

```text
POST /api/v1/organization/units
POST /api/v1/organization/employees
POST /api/v1/organization/employees/assignments
```

The reconciled dedicated read and responsibility APIs remain authoritative for hierarchy, employees, assignments, OperationalScope, and ResponsibilityAssignment.

The implementation must preserve Arabic/French/English fields on the same backend entity where published. It must not introduce translation child entities or infer physical ownership from OrganizationUnit hierarchy.

## 8. HWEB-P03 — Risk authoring

Current Risk capability advertises:

```text
POST /api/v1/risk/registers
POST /api/v1/risk/assessments
POST /api/v1/risk/evidence
```

HidraWEB may author/submit backend Risk records, but risk score/evaluation semantics remain backend-owned. Workbench remains acceptable for secondary reads until/during any future dedicated Risk query expansion.

## 9. HWEB-P04 — Reporting lifecycle

Current Reporting capability advertises:

```text
POST /api/v1/reporting/definitions
POST /api/v1/reporting/requests
POST /api/v1/reporting/runs
POST /api/v1/reporting/artifacts
```

The frontend may orchestrate these published operations. It must not pretend that an output artifact exists before HidraAPI evidence says it exists, nor invent scheduling/export formats not present in the request schemas.

## 10. HWEB-P05 — Analytics execution

Current Analytics capability advertises:

```text
POST /api/v1/analytics/datasets
POST /api/v1/analytics/insights
POST /api/v1/analytics/metrics/evaluations
POST /api/v1/analytics/projections/runs
```

HidraWEB may invoke and display these operations. Metric results, projections, confidence, and insight content remain backend-produced evidence.

## 11. HWEB-P06 — Simulation orchestration

Current Simulation capability advertises:

```text
POST /api/v1/simulation/models
POST /api/v1/simulation/scenarios
POST /api/v1/simulation/runs
POST /api/v1/simulation/recommendations
```

The frontend must treat these as orchestration of server-side models/scenarios/runs. This task does not reactivate CPM/RTTM, direct LeakDetectionAPI, hydraulic solvers, or Digital Twin computation in the browser.

## 12. HWEB-P07 / P08 — Integration and Notification

Current Integration capability advertises:

```text
POST /api/v1/integration/external-systems
POST /api/v1/integration/job-runs
POST /api/v1/integration/exchange-messages
```

Current Notification capability advertises:

```text
POST /api/v1/notification/requests
POST /api/v1/notification/messages
POST /api/v1/notification/delivery-attempts
```

These are lower priority than Identity/Organization/Risk/Reporting/Analytics/Simulation because the existing HidraWEB surfaces are currently evidence/monitoring oriented and no UAT/product evidence yet requires operator-side command execution.

Before P07/P08 implementation, re-confirm:

- intended actor/persona;
- route permissions;
- whether the command is an operator/admin action or an internal-system operation;
- audit/evidence expectations;
- whether exposing the action in a browser is actually appropriate.

If those conditions are not established, keep the existing evidence-only UX.

## 13. HWEB-P09 / P10 — Documents and Configuration

These modules already have typed command surfaces in HidraWEB. Their post-reconciliation work is therefore UX/governance depth rather than contract recovery.

Documents priorities:

- version/content metadata visibility;
- domain-target attachment flows;
- clearer upload/download validation and evidence;
- no provider-specific storage abstraction.

Configuration priorities:

- definition/value relationships;
- sensitivity and secret-reference presentation;
- effective dates/environment/scoping;
- feature-flag governance;
- safe confirmation for high-impact changes.

## 14. HWEB-P11 — Cross-surface operator flow

P11 is deliberately last among product features.

It may improve contextual navigation such as:

```text
topology asset
  -> telemetry / monitoring
  -> alarm
  -> workflow
  -> incident / HSE
  -> planning / engineering / documents
```

but only when backend-published identifiers/references support the link.

It must not:

- build a duplicate frontend graph of all backend entities;
- scan unrelated workbench resources to infer relationships;
- create a browser-owned operational state machine;
- fabricate missing correlation/reference fields.

## 15. UAT-driven maintenance lane

Maintenance tasks use:

```text
HWEB-M001, HWEB-M002, ...
```

Recommended exact commit patterns:

```text
fix(<area>): resolve <specific UAT defect>
test(<area>): cover <specific UAT regression>
docs(uat): record <specific accepted boundary>
```

Each maintenance task must reference the originating UAT finding ID and preserve:

- environment;
- HidraWEB SHA;
- HidraAPI SHA;
- artifact ID;
- route/workflow;
- effective permissions;
- operational context;
- expected vs observed behavior;
- severity/disposition.

## 16. Prioritization rationale

The execution order favors:

1. **Identity** — security/governance capability already exists and benefits all later administration;
2. **Organization** — establishes first-class organizational/master-data administration while preserving the canonical operational-scope model;
3. **Risk** — directly aligned with Hidra's product mission and current backend commands;
4. **Reporting** — operationally useful, bounded orchestration with clear backend authority;
5. **Analytics** — enables governed execution without moving formulas client-side;
6. **Simulation** — powerful but must remain server-orchestrated and contract-bound;
7. **Integration/Notification** — require additional persona/product validation before browser mutations;
8. **Documents/Configuration depth** — existing contracts already consumed; improvements are governance/UX refinement;
9. **Cross-surface composition** — safest after first-class workflows have matured.

This ordering is a product sequencing decision, not evidence that a later module is less important to the enterprise.

## 17. Definition of done for every HWEB-P task

A product task is complete only when its record states:

```text
HidraAPI source SHA
HidraWEB source SHA at task start
OpenAPI artifact/snapshot used
backend endpoints consumed
backend DTOs consumed
backend permissions consumed
frontend routes/components changed
state ownership
realtime contracts used
tests added/updated
known backend gaps
UAT finding IDs, if any
CI result
```

Required validation remains task-dependent but normally includes:

```bash
npm run openapi:compatibility
npm run lint
npm run typecheck
npm run test
npm run build
```

Use `npm run test:e2e` for critical browser journeys and `npm run test:performance` when performance-sensitive behavior changes.

## 18. HWEB-P01 completion evidence

HWEB-P01 replaces generic-workbench Identity administration with first-class typed HidraAPI contracts:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `37f52d541ca7fe47c2e581b30f89d4b0382a5a65`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- Identity consumer OpenAPI slice now includes dedicated user detail, role list/create, permission list/create, user-role grant, role-permission grant, and user-permission grant contracts;
- the existing `/administration/users` route remains the first-class Identity & Access workspace;
- user, role, and permission lists now use dedicated `/api/v1/identity/**` query APIs instead of generic workbench records;
- user inspection uses `GET /api/v1/identity/users/{id}`;
- role and permission creation use backend DTOs generated from the accepted OpenAPI slice;
- user-role, role-permission, and direct-user-permission grants use only backend-defined request contracts;
- existing create-user and permission-evaluation flows remain in the workspace;
- frontend visibility is permission-gated while backend 401/403 remains authoritative;
- Organization responsibility assignments remain separate from Identity authorization grants;
- no role-name inference, revoke operation, credential handling, or frontend ABAC semantics are introduced;
- focused adapter tests cover dedicated reads, encoded user IDs, role/permission creation, and all three grant endpoints.

No HWEB-P02 organization administration work is included in HWEB-P01.

## 20. HWEB-P02 completion evidence

HWEB-P02 promotes Organization administration to dedicated HidraAPI contracts:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `89cd529d124e71db572650f6346a93953c06af77`;
- OpenAPI evidence remains `63f3f60974ce57eb8cd5e42910397615195624fb`;
- organization-unit, employee, and assignment reads use dedicated `/api/v1/organization/**` query contracts instead of generic workbench records;
- unit and employee detail inspection uses dedicated backend detail endpoints;
- existing unit creation, employee registration, and employee assignment commands remain typed and now invalidate the dedicated organization-admin query cache;
- canonical operational-scope registration uses `POST /api/v1/organization/operational-scopes`;
- canonical responsibility assignment/revocation uses backend workflow-approved request contracts and exact backend permissions;
- responsibility listing remains backend-owned and resolves canonical OperationalScope evidence;
- Arabic/French/English fields remain on the same organization entities where published;
- operational responsibility remains explicitly separate from Identity role/permission grants;
- no physical pipeline ownership is inferred from OrganizationUnit hierarchy;
- focused adapter and E2E fixtures cover dedicated reads and canonical responsibility mutations.

No HWEB-P03 Risk authoring work is included in HWEB-P02.

## 21. Next authorized task

The next authorized product task is:

```text
HWEB-P03 — feat(risk): add governed risk authoring workflows
```

If a BLOCKER or MAJOR staging/UAT finding is recorded before P03 begins, the corresponding HWEB-M task takes precedence.
