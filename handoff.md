# Hidra / HyFlo Comprehensive Development Handoff

> Repository copy: **HidraWEB**  
> Purpose: durable execution handoff across HidraAPI and HidraWEB sessions.  
> Last updated: **2026-09-11**

## 1. Product and architecture

Hidra is the backend/frontend implementation of the HyFlo initiative for Sonatrach / TRC pipeline operations.

Product name:

```text
Hidra - Hydrocarbon Intelligence for Data, Risk, and Analytics
```

Core architecture is a strict modular monolith. HidraAPI remains the authoritative source for business facts, validation, authorization, workflow semantics, lifecycle rules, and operational data. HidraWEB is a modular frontend monolith that consumes DTO/OpenAPI/realtime contracts and must never mirror JPA/domain aggregates or invent missing business semantics.

Backend dependency direction:

```text
API -> Application -> Domain -> Kernel
Infrastructure -> Application ports + Domain
Platform -> Kernel / technical infrastructure
```

Business modules use:

```text
module
├── api
├── application
├── domain
└── infrastructure
```

Domain code must not depend on Spring, JPA, REST, infrastructure, or foreign aggregates.

Frontend dependency direction:

```text
app / shell
    ↓
processes
    ↓
modules / features
    ↓
api adapters + shared components
    ↓
design-system / shared primitives
```

## 2. Canonical repositories

```text
Backend : CHOUABBIA-AMINE/HidraAPI
Frontend: CHOUABBIA-AMINE/HidraWEB
```

### HidraAPI current state

Current main head observed during this handoff:

```text
d21ea9184ce2fede9b2e8f39d5fd9f374b4b2046
```

That commit merged PR #51 from `frontend-backend-gap-remediation`.

Active continuation branch:

```text
frontend-backend-gap-remediation-02
```

The backend remediation task was in progress when this handoff was requested.

### HidraWEB current state

HWEB roadmap status:

```text
HWEB-001  COMPLETE + MERGED
HWEB-002  COMPLETE + MERGED
HWEB-003  COMPLETE + MERGED + MAIN CI GREEN
HWEB-004  COMPLETE — READY FOR REVIEW
HWEB-005  NOT STARTED
```

Current HWEB-004 branch:

```text
hweb-004-identity-organization-context
```

Latest observed branch head before this handoff:

```text
cb517837642391d343f884b4f856620cf4ca44db
```

The living backend gap register is:

```text
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md
```

That document is the frontend-facing acceptance checklist for backend remediation and must be updated as the backend evolves.

## 3. HidraWEB completed phases

### HWEB-001 — Bootstrap

Completed and merged with React/TypeScript/Vite, MUI, TanStack Query, Zustand, React Hook Form/Zod, i18next, MapLibre, ECharts, Axios, Orval, Vitest/RTL/MSW, Playwright and CI.

### HWEB-002 — Shell, authentication and permissions

Completed and merged. Important rules:

- Basic development credentials are memory-only and are intentionally lost on hard reload.
- JWT production mode uses an `AuthProvider` seam; no invented OIDC endpoint.
- Permission catalog/routes are capability metadata, not proof of user-specific authorization.
- Backend remains the security boundary.
- Known earlier gaps included authenticated principal, enterprise IdP contract, and user-specific grants.

### HWEB-003 — Generic Operational Workbench

Completed and merged.

Canonical backend workbench routes:

```text
GET  /api/v1/workbench/modules
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

Workbench is secondary inspection/admin UX only. It must not replace specialized operational screens.

### HWEB-004 — Identity and Organization Context

Implemented on this branch.

Frontend routes:

```text
/administration/users
/administration/organization
```

HWEB-004 used dedicated command endpoints plus generic workbench reads because dedicated read APIs were absent at the time of the inventory.

Verified command endpoints consumed by HWEB-004:

```text
POST /api/v1/identity/users
POST /api/v1/identity/permissions/evaluations
POST /api/v1/organization/units
POST /api/v1/organization/employees
POST /api/v1/organization/employees/assignments
```

## 4. Backend gap register and remediation mandate

The user explicitly requested that HidraAPI be corrected, fixed, and completed according to:

```text
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md
```

The register originally contained confirmed gaps across:

```text
security/platform
OpenAPI contract publication
realtime event contracts
identity
organization
topology
telemetry
monitoring
workflow
alarm
```

Do not blindly implement an entry because it is marked OPEN. Re-audit current HidraAPI source first because the register may be stale after backend changes.

Lifecycle vocabulary used by the register:

```text
OPEN
PLANNED
IN_PROGRESS
IMPLEMENTED
VERIFIED
DEFERRED
NOT_REQUIRED
INSPECTION_PENDING
```

## 5. Important backend state discovered during remediation

### 5.1 PR #51 already implemented part of the earlier register

PR #51 introduced identity administration/query contracts including:

```text
GET  /api/v1/identity/me
GET  /api/v1/identity/me/permissions
GET  /api/v1/identity/users
GET  /api/v1/identity/users/{id}
GET  /api/v1/identity/roles
GET  /api/v1/identity/permissions
POST /api/v1/identity/roles
POST /api/v1/identity/permissions
POST /api/v1/identity/users/role-grants
POST /api/v1/identity/roles/permission-grants
POST /api/v1/identity/users/permission-grants
```

Therefore some earlier `GAP-SEC-*` and `GAP-ID-*` entries are no longer simply OPEN.

However, the first remediation slice needs architectural cleanup before being considered final:

- the newly added identity Java files did not follow the mandatory canonical HidraAPI Java header;
- write operations were placed directly inside `JpaIdentityAdministrationQueryAdapter`;
- query and mutation responsibilities should be separated behind proper application/domain boundaries;
- security enforcement and tests still need to prove that effective permissions are authoritative and backend-enforced rather than merely exposed.

Do not add more write logic to a query adapter.

### 5.2 Topology register entries are stale against current backend source

Current HidraAPI already exposes strongly typed topology map contracts.

Current controller:

```text
GET /api/v1/topology/map/layers
GET /api/v1/topology/map/layers/{layerId}
GET /api/v1/topology/map/layers/{layerId}/features
GET /api/v1/topology/map/geojson
GET /api/v1/topology/map/search
```

`TopologyMapVisualizationUseCase` now defines typed records for:

```text
LayerDescriptor
Geometry
PointGeometry
LineStringGeometry
MultiLineStringGeometry
FeatureProperties
Feature
FeatureCollection
SearchResult
```

Current `JpaTopologyMapVisualizationAdapter` publishes six layers:

```text
pipeline-systems
pipelines
facilities
topology-nodes
pipeline-segments
topology-connections
```

Feature collections already include:

```text
page
size
totalFeatures
totalPages
hasNext
```

Consequently the original topology gaps for generic `Map<String,Object>`, missing pipeline/pipeline-system layers, and missing count-aware pagination appear already satisfied in code. They still require tests/OpenAPI/frontend consumption before the gap register can move to VERIFIED.

### 5.3 Telemetry is still command-oriented

Current verified telemetry controller exposes commands such as:

```text
POST /api/v1/telemetry/sources
POST /api/v1/telemetry/points
```

The remediation audit had reached telemetry when this handoff was requested. Dedicated reading/history/trend APIs and a frontend-consumable quality/state contract still need current-source verification and likely implementation.

## 6. Security principles that must not regress

Current HidraAPI security supports:

```text
disabled
basic
jwt
```

Production-like environments are JWT resource-server mode. Development/test can use Basic.

Rules:

- no secrets or production credentials in source;
- no invented frontend authentication authority;
- authenticated principal must resolve consistently across Basic and JWT modes;
- frontend capabilities are convenience metadata only until tied to backend-enforced effective grants;
- backend must deny unauthorized reads/mutations regardless of UI visibility;
- enterprise IdP registration/authority/client settings are partly environment-owned and cannot be falsely marked complete solely through repository code.

## 7. Backend remediation execution order

Continue backend work before HWEB-005.

Recommended order:

```text
1. Re-audit the entire gap register against current HidraAPI main.
2. Correct PR #51 identity architecture and mandatory Java headers.
3. Complete authenticated-principal/effective-authorization enforcement and tests.
4. Establish stable repository/CI OpenAPI publication and compatibility workflow.
5. Define/document realtime destinations and payload contracts needed by frontend phases.
6. Complete organization dedicated query/context APIs if still missing.
7. Verify topology typed contracts with tests and OpenAPI; avoid reimplementing already-satisfied gaps.
8. Implement telemetry read/history/trend + quality/state contracts if absent.
9. Implement monitoring read/query projections if absent.
10. Implement workflow task inbox/detail/history/available-actions contracts if absent.
11. Implement alarm active/history/detail and shelving/suppression contracts if absent.
12. Run full backend verification.
13. Update this repository's gap register item-by-item with exact evidence.
14. Only then begin HWEB-005.
```

## 8. Backend implementation standards

Read HidraAPI `AGENTS.md` and the relevant module roadmap before changing a module.

Mandatory Java metadata:

```text
@Author    : Abir MEDJERAB
@CreatedOn : 2025-06-26
```

Every Java file must use the canonical project header.

Do not create forbidden generic packages such as:

```text
shared
sharedkernel
common
core
utils
helper
helpers
misc
```

Maintain business ownership:

```text
identity     -> users, roles, permissions, grants
authorization enforcement -> backend security + identity semantics
organization -> units, employees, assignments
workflow     -> process/task/transition state only
topology     -> operational graph/geospatial representation
telemetry    -> sources, points, readings/time series
monitoring   -> rules/deviations
alarm        -> alarm lifecycle
```

No controller should expose JPA entities.

Do not put business write logic directly in REST controllers or query adapters. Prefer:

```text
REST DTO/controller
    -> application use case
        -> domain behavior / repository port
            -> infrastructure adapter
```

## 9. Validation requirements

Do not claim success without executing repository gates.

Target final backend verification:

```bash
mvn -q -DskipTests compile
mvn -q test
mvn -q clean verify
```

Also verify:

```text
Spring context startup
Flyway migration validation
Hibernate/JPA validation
architecture guardrails
OpenAPI generation/exposure
security behavior
integration tests where Docker is available
```

If Docker is unavailable, report Testcontainers skips explicitly rather than claiming they ran.

For each gap, evidence should include the relevant endpoint/DTO/use case/test/commit and whether HidraWEB has actually consumed it.

## 10. HWEB rules before HWEB-005

Do not start HWEB-005 until backend readiness is reconciled.

HWEB-005 will be the Network and Topology Workspace and must use MapLibre only through the project abstraction:

```text
components/map/
├── HidraMap.tsx
├── MapProvider.tsx
├── LayerRegistry.ts
├── FeatureSelection.ts
├── MapLegend.tsx
└── adapters/
    └── maplibreAdapter.ts
```

Feature modules must not import MapLibre types outside that boundary.

Topology behavior must be backend-driven:

- stable layer catalog;
- typed feature/geometry DTOs;
- searchable feature identity;
- geometry only where backend provides it;
- permission-aware overlays;
- selection opens an inspector without losing the map context.

## 11. HWEB API/state rules

Frontend state ownership remains:

```text
TanStack Query -> server state
React Hook Form -> forms
React local state -> transient component state
Zustand -> cross-screen UI context only
Realtime -> update/query invalidation, not a second source of truth
```

Authorization UI rule:

```text
visible navigation = stable product navigation ∩ backend-published effective capabilities
```

Do not hard-code role-name comparisons.

REST remains authoritative; realtime delivers change notifications/events.

## 12. Immediate resume point

At handoff creation time, backend remediation had:

- discovered that PR #51 was already merged into HidraAPI `main`;
- created fresh branch `frontend-backend-gap-remediation-02` from current backend `main`;
- re-audited identity/security and found cleanup still required;
- re-audited topology and determined the original topology gaps were already satisfied in current code;
- begun the telemetry audit and confirmed the public controller is still command-oriented.

Resume by continuing the **current-source audit of telemetry, monitoring, workflow, alarm, organization, realtime and OpenAPI publication**, then implement only gaps that remain real.

Do not start HWEB-005 and do not recreate topology contracts that already exist.

## 13. Final completion definition

Backend remediation is complete only when:

```text
[ ] Every confirmed gap in this repository's gap register is re-audited against the final HidraAPI SHA.
[ ] Each real gap is implemented or explicitly documented as external/deferred/not required.
[ ] Identity PR #51 architecture/header debt is corrected.
[ ] Backend authorization is enforced and tested, not merely described.
[ ] OpenAPI contracts are deterministic and consumable by HidraWEB CI.
[ ] Required realtime schemas/destinations are documented and testable.
[ ] Topology typed map contracts are verified by tests/OpenAPI.
[ ] Telemetry/monitoring/workflow/alarm specialized read contracts are present where required.
[ ] HidraAPI `mvn -q clean verify` passes, with Testcontainers status reported accurately.
[ ] `docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md` is updated with final evidence and exact backend commit.
[ ] Only after the above does HWEB-005 begin.
```

---

This file is a handoff artifact, not a substitute for HidraAPI `AGENTS.md`, HidraWEB architecture/roadmap files, or `docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md`. When they differ, re-audit current repository state and follow the authoritative repository instructions.