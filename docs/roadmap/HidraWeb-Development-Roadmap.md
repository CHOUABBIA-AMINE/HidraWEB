# HidraWEB Development Roadmap — Reconciled Baseline

```text
Repository       : CHOUABBIA-AMINE/HidraWEB
Frontend baseline: 02a101fda401b7335b51e95ea17d281baeabbe93
Backend truth    : CHOUABBIA-AMINE/HidraAPI
Backend baseline : 260295c6eebc4b01922d2d488810a671305860a6
OpenAPI evidence : 63f3f60974ce57eb8cd5e42910397615195624fb
Decision         : CONTINUE / REFACTOR
Execution model  : exactly one HWEB-R task per commit
```

## 1. Governance

HidraAPI is the source of business truth and final authorization enforcement.

Before every HWEB-R task:

1. recover current HidraAPI `main`;
2. recover current HidraWEB `main`;
3. read `docs/architecture/Hidra-API-Web-Contract-v1.md`;
4. read this roadmap task;
5. inspect the current/pinned OpenAPI contract;
6. implement exactly one task;
7. validate;
8. commit with the exact message defined below;
9. push;
10. inspect CI once;
11. stop.

Do not continue automatically to the next task.

## 2. Historical roadmap status

The original HWEB-001 through HWEB-016 work remains valuable implementation history and test evidence.

It is **not** deleted.

However those task numbers are no longer the forward execution queue because HidraAPI evolved materially after the last HidraWEB main commit.

Existing per-task documents under `docs/roadmap/HWEB-*.md` are historical evidence unless explicitly referenced by an HWEB-R task.

The new execution line is HWEB-R01 through HWEB-R17.

## 3. Architectural rules

- modular frontend monolith; no micro-frontends;
- OpenAPI/Orval is transport authority;
- no handwritten backend DTO replicas after the relevant regenerated contract exists;
- React components do not call Axios directly;
- TanStack Query owns server state;
- Zustand remains small cross-screen UI state only;
- frontend permissions are UX guards; backend enforcement is authoritative;
- Organization operational context uses the backend canonical scope/responsibility model;
- realtime domain subscriptions are forbidden while HidraAPI reports no published event families;
- direct browser dependency on LeakDetectionAPI is forbidden while the backend extension roadmap is parked;
- MapLibre remains behind `HidraMap`;
- ECharts visualizes only verified backend data;
- WCAG 2.2 AA remains a release requirement.

## 4. Reconciled task sequence

| Code | Exact commit message | Scope | Exit criterion | Status |
|---|---|---|---|---|
| HWEB-R01 | `docs(architecture): reconcile HidraWEB with current HidraAPI` | Audit live frontend against current backend, update canonical contract, replace forward roadmap. Documentation only. | Reuse/reset decision recorded; stale contract areas identified; next task defined. | **Completed** |
| HWEB-R02 | `chore(api): refresh HidraAPI OpenAPI baseline` | Replace accepted full OpenAPI artifact evidence and all feature slices with the current verified code-equivalent backend artifact; rationalize Orval configs only as needed. | Compatibility gate, all generators, typecheck and build use one current backend baseline. | Planned |
| HWEB-R03 | `refactor(authentication): align session with HidraAPI principal contract` | Regenerate identity contract; use current login/OIDC endpoints and canonical `GET /api/v1/identity/me` plus effective permissions for authenticated session state. | No invented auth endpoints; principal/session tests pass. | Planned |
| HWEB-R04 | `refactor(authorization): align shell with effective permissions` | Align permission model/navigation guards with backend-enforced route catalog and current effective permissions. | No catalog-only assumption; 401/403 and permission-aware navigation tests pass. | Planned |
| HWEB-R05 | `refactor(organization): align operational context with canonical scopes` | Replace stale Organization assumptions with dedicated reads plus `OperationalScope` / `ResponsibilityAssignment` contracts. | No retired scope tuple model; organization/operational context is backend-driven. | Planned |
| HWEB-R06 | `refactor(workbench): align generic resource browsing` | Regenerate workbench contract and retain it as secondary/reference/admin UX only. | List/detail/search work against refreshed OpenAPI; no specialized workflow is replaced by workbench. | Planned |
| HWEB-R07 | `refactor(topology): align network workspace with current map contract` | Revalidate current layer catalog/typed geometry/search, retain HidraMap/MapLibre, remove stale missing-layer assumptions. | Network workspace consumes only current topology API. | Planned |
| HWEB-R08 | `refactor(operations): align telemetry and monitoring workspaces` | Regenerate telemetry/monitoring types and revalidate readings, quality/state, trend, rules and deviations. | REST/query behavior green; no invented realtime topics. | Planned |
| HWEB-R09 | `refactor(workflow): align tasks with backend actions` | Revalidate task inbox/detail/available-actions/instance/timeline/transition execution. | All actions are backend-defined and concurrency/error states tested. | Planned |
| HWEB-R10 | `refactor(alarm): align console with backend lifecycle` | Revalidate list/detail/ack/close/shelving behavior and accessible severity/state presentation. | Alarm console uses current backend lifecycle only; no fake realtime. | Planned |
| HWEB-R11 | `refactor(events): align incident leak and hse workspaces` | Revalidate current HidraAPI incident/leak/HSE read contracts. | No direct LeakDetectionAPI dependency; events workspace remains HidraAPI-driven. | Planned |
| HWEB-R12 | `refactor(planning): align planning and approval contracts` | Revalidate periods/plans/revisions/targets and backend approval actions. | No frontend-defined approval state machine. | Planned |
| HWEB-R13 | `refactor(engineering): align integrity and assets contracts` | Regenerate assets/integrity schemas, remove handwritten backend DTO replicas and revalidate engineering composition. | No duplicated transport DTOs; workbench remains secondary. | Planned |
| HWEB-R14 | `refactor(custody): align metering and custody contracts` | Revalidate custody command contracts and supporting workbench/reference data. | Current OpenAPI types and permissions used. | Planned |
| HWEB-R15 | `refactor(intelligence): align risk analytics simulation reporting` | Revalidate each intelligence workspace against current backend capability/workbench contracts. | No synthetic KPI/simulation semantics. | Planned |
| HWEB-R16 | `refactor(administration): align governance workspaces` | Revalidate audit/configuration/documents/integration/notification administration. | Destructive actions permission-gated; provider capabilities not invented. | Planned |
| HWEB-R17 | `test(release): harden reconciled HidraWEB` | Full accessibility, performance, E2E, OpenAPI compatibility, deployment and release-artifact review. | `npm run verify`, required E2E/performance gates and production-readiness checklist green. | Planned |

## 5. HWEB-R01 completion evidence

HWEB-R01 established:

- current HidraAPI head `260295c6eebc4b01922d2d488810a671305860a6`;
- current HidraWEB head `02a101fda401b7335b51e95ea17d281baeabbe93`;
- code-equivalent verified HidraAPI OpenAPI artifact from `63f3f60974ce57eb8cd5e42910397615195624fb`;
- current HidraWEB OpenAPI baseline `725a451...` is stale;
- current frontend architecture is worth retaining;
- no repository-wide reset is required;
- direct LeakDetectionAPI/gRPC/CPM integration is not a current frontend capability;
- backend route permissions are now enforced;
- current principal/effective permissions exist;
- canonical Organization operational scopes/responsibilities require frontend reconciliation;
- current realtime transport has no domain event publishers.

Files authorized for HWEB-R01:

```text
docs/architecture/HidraWEB-Reconciliation-Audit.md
docs/architecture/Hidra-API-Web-Contract-v1.md
docs/roadmap/HidraWeb-Development-Roadmap.md
```

No production TypeScript, package manifest, OpenAPI artifact or generated client change is authorized in HWEB-R01.

## 6. Validation policy

Documentation-only tasks:

- verify live backend/frontend SHAs;
- verify only authorized documentation paths changed;
- validate Markdown structure/reference paths where practical;
- rely on repository CI for full frontend lifecycle when CI triggers.

Contract/API tasks:

```bash
npm ci
npm run openapi:compatibility
npm run typecheck
npm run lint
npm run test
npm run build
```

Use `npm run verify` when the task scope requires the complete lifecycle.

Critical browser-flow tasks also run:

```bash
npm run test:e2e
```

Performance-sensitive tasks also run:

```bash
npm run test:performance
```

Do not claim a gate passed unless it actually ran successfully.

## 7. Required completion record

Each HWEB-R task must record:

```text
HidraAPI source SHA
HidraWEB source SHA
OpenAPI artifact/snapshot used
backend endpoints consumed
backend DTOs consumed
backend permissions consumed
frontend routes changed
state ownership
realtime contracts used
tests added/updated
known backend gaps
CI status
```

## 8. Next authorized task

```text
HWEB-R02 — chore(api): refresh HidraAPI OpenAPI baseline
```

Do not execute HWEB-R03 or later work in the same task.
