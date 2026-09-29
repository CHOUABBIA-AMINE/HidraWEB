# HidraWEB Reconciliation Audit

```text
Document code   : HIDRA-WEB-RECONCILIATION-2026-09-29
Repository      : CHOUABBIA-AMINE/HidraWEB
Frontend base   : 02a101fda401b7335b51e95ea17d281baeabbe93
Backend truth   : CHOUABBIA-AMINE/HidraAPI
Backend base    : 260295c6eebc4b01922d2d488810a671305860a6
Contract code   : HIDRA-API-WEB-CONTRACT-v1
Decision        : CONTINUE / REFACTOR
Status          : HWEB-R01 reconciliation baseline
```

## 1. Purpose

This audit reconciles the pre-existing HidraWEB implementation with the current live HidraAPI. HidraAPI is the source of business truth. HidraWEB is not deployed, so obsolete frontend assumptions may be removed instead of preserved through compatibility shims.

No HidraAPI source is modified by HWEB-R01.

## 2. Baseline evidence

| Concern | Verified evidence |
|---|---|
| HidraAPI live head | `260295c6eebc4b01922d2d488810a671305860a6` |
| HidraAPI code-equivalent OpenAPI head | `63f3f60974ce57eb8cd5e42910397615195624fb` |
| Why code-equivalent | Commits after `63f3f6` through current head change only `AGENTS.md`, `PROJECT_STATE.md`, and deferred-extension documentation; no production Java/configuration changed. |
| OpenAPI CI evidence | HidraAPI CI run `36573899231` succeeded and published artifact `hidra-api-openapi-63f3f60974ce57eb8cd5e42910397615195624fb` (artifact id `11036334163`). |
| HidraWEB live head | `02a101fda401b7335b51e95ea17d281baeabbe93` |
| HidraWEB last main CI | Run `35070665499` / #905 — success |
| Existing accepted OpenAPI baseline | HidraAPI `725a451ae4880ccb4f2ec508709241f88cd4aea7`; therefore stale relative to current backend. |
| Open PRs/issues on HidraWEB | None at audit time. |
| Deferred backend extension | HidraAPI `docs/roadmap/extended-capabilities.md` is parked; LeakDetectionAPI/gRPC/CPM/RTTM/PostGIS-specialized UI is not a current frontend dependency. |

## 3. Executive decision

**Decision: CONTINUE / REFACTOR.**

A repository-wide reset is not justified. HidraWEB already has a coherent React/TypeScript/Vite foundation, CI, tests, a same-origin deployment model, Orval infrastructure, a central HTTP/error layer, process-oriented routing, a MapLibre abstraction, ECharts dependency, accessibility/performance tooling, and implemented feature workspaces.

The current risk is contract drift rather than a fundamentally broken frontend architecture.

The correct strategy is:

1. refresh the OpenAPI baseline from the current code-equivalent HidraAPI artifact;
2. regenerate transport contracts;
3. refactor handwritten transport wrappers toward generated operations;
4. align authentication with `/api/v1/identity/me` and effective permissions;
5. align Organization UI with the canonical `OperationalScope` / `ResponsibilityAssignment` model;
6. revalidate each existing workspace in dependency order;
7. retain REST polling/query behavior until HidraAPI publishes verified domain realtime event families.

## 4. Backend capabilities that changed the frontend assumptions

### 4.1 Authentication and authorization

Current HidraAPI implements:

```text
POST /api/v1/identity/authentication/login
POST /api/v1/identity/authentication/oidc/complete
GET  /api/v1/identity/me
GET  /api/v1/identity/me/permissions

GET  /api/v1/security/permissions/catalog
GET  /api/v1/security/permissions/routes
```

The backend permission catalog now reports `backend-enforced`, and `HidraRouteAuthorizationInterceptor` enforces the derived route permission for `/api/v1/**` handlers except explicit public/authenticated-only paths.

The old frontend claim that route permissions are catalog-only is therefore stale.

### 4.2 Organization

Current HidraAPI exposes dedicated reads for units, hierarchy, employees and assignments. The canonical operational-responsibility model is now:

```text
OrganizationUnit
  -> organizational identity/hierarchy

OperationalScope
  -> id + type + targetId

ResponsibilityAssignment
  -> assigneeType + assigneeId + scopeId + responsibilityType
     + effective-dated lifecycle
```

HidraWEB currently exposes organization units, employees and employee assignments, but does not yet model the new operational-scope/responsibility contract.

### 4.3 Topology

Current topology map API exposes typed map contracts. The earlier gap claiming missing pipeline-system/pipeline layers is obsolete. The frontend MapLibre/HidraMap architecture remains valid.

### 4.4 Telemetry and monitoring

Current HidraAPI has dedicated read APIs for:

- reading states;
- quality codes;
- latest reading;
- reading history;
- trend;
- monitoring rules;
- deviations.

Existing HidraWEB API paths align structurally with those endpoints, subject to OpenAPI regeneration.

### 4.5 Workflow

Current HidraAPI exposes:

- authenticated actor task inbox;
- task detail;
- backend-authoritative available actions;
- workflow instance detail;
- timeline;
- transition execution.

Existing HidraWEB workflow API paths align structurally with the current backend.

### 4.6 Alarm

Current HidraAPI exposes:

- alarm list/detail;
- shelving list;
- acknowledge/close;
- shelve/unshelve.

Existing HidraWEB alarm API paths align structurally with the current backend.

### 4.7 Realtime

Current HidraAPI exposes:

```text
GET /api/v1/realtime/capabilities
GET /api/v1/realtime/sse
WS  /api/v1/realtime/ws
```

But current capability metadata explicitly reports:

```text
publicationStatus = transport-configured-no-domain-publishers
eventFamilies     = []
recoveryStrategy  = query-after-reconnect
```

Therefore HidraWEB must not subscribe to invented telemetry/alarm/workflow/incident domain topics. The current disconnected `RealtimeProvider` is safe; realtime feature work remains blocked until backend event families are published.

## 5. Existing frontend area assessment

| Area | Current HidraWEB | Current HidraAPI evidence | Drift | Decision |
|---|---|---|---|---|
| Project/toolchain | React 19, TS 5.9, Vite 8, Node 24, npm lockfile, CI | Frontend-owned | None material | KEEP |
| App bootstrap/providers | Central provider composition and error boundary | Compatible | Minor review after auth refresh | KEEP |
| Routing | 24 concrete URL routes plus index/wildcard handling | Backend capability set expanded/changed since Sep 16 | Route availability must be permission/contract revalidated | REFRESH |
| Authentication | Provider-aware direct/OIDC exchange exists | Current login/OIDC completion endpoints still exist; canonical `/identity/me` now available | Session principal currently relies primarily on login response instead of canonical principal refresh | REFRESH |
| Authorization | Permission catalog/routes/effective permissions consumed | Backend now explicitly enforces route permissions | Frontend model still contains historical catalog-only semantics | REFRESH |
| Shell/navigation | Process-oriented registry | Good architectural fit | Delivery-task labels and capability visibility need R-series reconciliation | REFRESH |
| API generation | Orval and deterministic compatibility gate exist | Current backend OpenAPI artifact available at `63f3f6` | Accepted baseline still pinned to `725a451`; feature slices span older SHAs | REFACTOR |
| Handwritten API wrappers | 18 transport-facing files, about 80 exported consumer operations | Most routes still exist | Violates desired generated-client authority in several features; assets/integrity also duplicate DTO shapes | REFACTOR |
| TanStack Query | Server-state usage is widespread | Compatible | None architectural | KEEP |
| Zustand | Only shell collapse state observed | Compatible | No server-state misuse found in audited store | KEEP |
| Realtime | Provider intentionally returns `not-connected` | Transport exists but no domain event publishers | Do not activate domain subscriptions | BLOCKED_BY_BACKEND |
| Organization context | Units/employees/assignments via workbench + commands | Dedicated reads plus canonical scopes/responsibilities now exist | Does not represent canonical operational scope/responsibility model | REFACTOR |
| Workbench | Generic list/detail/search implementation | Current workbench routes still exist | Generated snapshot refresh required | KEEP |
| Topology/map | `HidraMap`, MapLibre adapter, layer/search APIs | Typed current map API exists | Historical docs about missing layers are stale | KEEP |
| Telemetry/monitoring | Dedicated query workspace and ECharts-oriented presentation | Current query endpoints exist | Regenerate current schemas; no invented realtime | REFRESH |
| Workflow | Task/detail/actions/timeline/execute | Current query/transition endpoints exist | Regenerate current schemas | REFRESH |
| Alarms | Query, acknowledge/close, shelving | Current endpoints exist | Regenerate current schemas; realtime remains REST-driven | REFRESH |
| Incident/leak/HSE | Dedicated read composition | Current HidraAPI query controllers exist | No direct LeakDetectionAPI dependency permitted | KEEP |
| Planning | Dedicated query/approval workspace | Current query/approval endpoints exist | Regenerate schemas and keep backend transition authority | KEEP |
| Integrity/assets | Workbench + command APIs; some handwritten request/response DTOs | Current command APIs exist | Handwritten DTO replicas should be removed after OpenAPI refresh | REFACTOR |
| Custody | Dedicated commands + workbench context | Current command endpoints exist | Regenerate schemas | KEEP |
| Analytics/risk/simulation/reporting | Workbench-backed specialized workspaces | Backend modules/capability APIs exist | Revalidate against refreshed OpenAPI before further UX work | REFRESH |
| Administration | Configuration/audit/documents/integration/notification surfaces | Corresponding backend capabilities exist | Revalidate each contract; do not infer unavailable provider behavior | REFRESH |
| Tests | Vitest/RTL/MSW/Playwright + performance suite | Frontend-owned | Tests tied to stale OpenAPI must be updated, not wholesale discarded | KEEP |
| Deployment | Same-origin Nginx, security headers, rollback artifacts | Compatible with current HidraAPI REST/realtime paths | No direct sidecar/browser service dependency | KEEP |
| Documentation | Rich architecture/roadmap/catalog history | Multiple historical claims are now stale | Canonical contract and roadmap must supersede old execution assumptions | REFRESH |

## 6. Page/route audit

The router currently defines **24 concrete URL routes**: two authentication routes and twenty-two protected application routes. The index redirect and wildcard handler are infrastructure routes and are not counted as business URLs.

| Route | Current surface | Backend support assessment | Decision |
|---|---|---|---|
| `/login` | Provider-aware login | Direct credential login/OIDC completion implemented | REFRESH |
| `/auth/callback` | OIDC completion | OIDC completion implemented | REFRESH |
| `/overview` | Shell overview | Cross-domain summary only; do not invent KPIs | KEEP |
| `/network` | Topology map | Current typed topology map APIs | KEEP |
| `/operations` | Telemetry/monitoring | Current query APIs | REFRESH |
| `/alarms` | Alarm console | Current query/lifecycle APIs | REFRESH |
| `/events` | Incident/leak/HSE | Current HidraAPI query APIs | KEEP |
| `/planning` | Planning workspace | Current query/approval APIs | KEEP |
| `/engineering` | Integrity process | Backend integrity/assets exist | REFACTOR |
| `/engineering/assets` | Asset workspace | Backend assets commands exist | REFACTOR |
| `/custody` | Custody workspace | Backend custody commands exist | KEEP |
| `/intelligence/risk` | Risk workspace | Backend risk capability/workbench evidence | REFRESH |
| `/intelligence/analytics` | Analytics workspace | Backend analytics capability/workbench evidence | REFRESH |
| `/intelligence/simulation` | Simulation workspace | Backend simulation capability/workbench evidence | REFRESH |
| `/intelligence/reports` | Reporting workspace | Backend reporting capability/workbench evidence | REFRESH |
| `/work/tasks` | Workflow tasks | Current task/action/timeline APIs | REFRESH |
| `/work/notifications` | Notification center | Backend notification/workbench evidence | REFRESH |
| `/workbench` | Generic workbench | Current generic workbench APIs | KEEP |
| `/administration/organization` | Org administration | Dedicated reads + new scope/responsibility APIs | REFACTOR |
| `/administration/users` | Identity administration | Current identity administration APIs | REFRESH |
| `/administration/configuration` | Config administration | Current configuration commands/workbench | REFRESH |
| `/administration/audit` | Audit workspace | Current audit export/workbench | REFRESH |
| `/administration/documents` | Document administration | Current document upload/download/link APIs | KEEP |
| `/administration/integrations` | Integration monitoring | Current workbench/integration resources | REFRESH |

## 7. API-consumer compatibility inventory

Eighteen transport-facing frontend files were audited. Their endpoint intent is mostly still valid, but all generated contracts are considered stale until HWEB-R02 repins them to the current code-equivalent OpenAPI artifact.

| Frontend consumer | Existing frontend contract | Current HidraAPI operation | Status | Action |
|---|---|---|---|---|
| `authenticationGateway.ts` | login + OIDC completion | Same endpoints implemented | STALE | Retain endpoints; refactor session establishment to refresh `/identity/me`; generated transport in R02/R03 |
| Permission API | catalog/routes/effective | Same endpoints; route permissions now backend-enforced | STALE | Regenerate types and remove catalog-only assumptions |
| Alarm API | list/detail/shelving/ack/close | Matching current APIs | STALE | Refresh generated contract; retain wrapper only for UI composition |
| Assets API | commands + patch | Matching current command APIs | STALE | Remove handwritten request/response DTO replicas after generation |
| Audit API | export request | Matching current API | STALE | Refresh generated contract |
| Configuration API | definitions/flags/values | Matching current APIs | STALE | Refresh generated contract |
| Identity/Organization API | identity/org commands | Commands remain; backend now has richer reads and scope/responsibility APIs | STALE | Replace old snapshot; add current reads/scopes only in R03/R05 |
| Custody API | period/ticket/discrepancy commands | Matching current APIs | STALE | Refresh generated contract |
| Documents API | register/upload/download/link | Matching current APIs | STALE | Refresh generated contract; preserve binary transport handling where generated client is insufficient |
| HSE API | cases/CAPA reads | Matching current APIs | STALE | Refresh generated contract |
| Incident API | incident reads | Matching current APIs | STALE | Refresh generated contract |
| Leak API | HidraAPI leak candidate/case reads | Matching current HidraAPI APIs | STALE | Refresh generated contract; no LeakDetectionAPI browser dependency |
| Integrity API | create assessment | Matching current API | STALE | Remove handwritten DTO replicas after generation |
| Planning API | query/revision/approval | Matching current APIs | STALE | Refresh generated contract |
| Telemetry/Monitoring API | reading/trend/quality/rules/deviations | Matching current APIs | STALE | Refresh generated contract; remain REST-based until event families exist |
| Topology API | layers/features/geojson/search | Matching current typed APIs | STALE | Refresh generated contract; keep HidraMap |
| Workbench API | modules/resources/list/detail/search | Matching current APIs | STALE | Refresh generated contract |
| Workflow API | tasks/actions/instance/timeline/execute | Matching current APIs | STALE | Refresh generated contract |

### Missing frontend consumption discovered

Current backend capabilities not yet represented as first-class frontend contract consumers include:

1. `GET /api/v1/identity/me` as the canonical post-authentication principal refresh;
2. dedicated identity user/role/permission query APIs rather than relying primarily on generic workbench reads;
3. dedicated Organization hierarchy/employee/assignment reads;
4. canonical operational-scope/responsibility registration/query/assignment/revocation APIs;
5. `GET /api/v1/realtime/capabilities` as a transport capability probe.

Items 1–4 are frontend work. Item 5 must not imply domain realtime subscriptions while `eventFamilies` is empty.

## 8. OpenAPI drift

The current consumer compatibility gate is technically valuable and must be preserved.

However its accepted backend baseline is:

`725a451ae4880ccb4f2ec508709241f88cd4aea7`

while the current code-equivalent verified HidraAPI OpenAPI artifact is:

`63f3f60974ce57eb8cd5e42910397615195624fb`

and current live HidraAPI head is:

`260295c6eebc4b01922d2d488810a671305860a6`.

Therefore all feature slices and generated models must be refreshed before additional business feature work.

## 9. Stale documentation identified

These documents remain historical evidence but must not drive new implementation without reconciliation:

- `handoff.md` — records an older backend/frontend state;
- `docs/02-Backend-Frontend-Contract.md` — old static counts and old security/topology gap statements;
- `docs/21-Gap-Analysis-Report.md` — claims route enforcement and pipeline/pipeline-system topology layers are missing;
- older API catalog spreadsheets/JSON derived from earlier backend SHAs;
- older HWEB task roadmaps that predate the September 29 HidraAPI baseline.

They are not deleted by HWEB-R01. The canonical contract and reconciled roadmap supersede them for future execution.

## 10. Deferred / unsupported assumptions

The following are **not current HidraWEB implementation targets**:

- direct browser connection to LeakDetectionAPI;
- gRPC-Web leak stream;
- CPM/RTTM-specific UI;
- MQTT/Sparkplug-specific UI contracts;
- PostGIS-specific browser payload assumptions;
- Modified B31G UI;
- invented realtime domain topics.

Current leak detection is consumed through HidraAPI REST contracts only.

## 11. Reuse inventory

Twelve major foundations are explicitly retained:

1. React/TypeScript/Vite/Node/npm toolchain;
2. GitHub CI;
3. application provider/error-boundary bootstrap;
4. central HTTP/error/diagnostic infrastructure;
5. TanStack Query server-state pattern;
6. small Zustand shell-state pattern;
7. process-oriented shell/navigation concept;
8. generic operational workbench;
9. MapLibre `HidraMap` abstraction;
10. Vitest/RTL/MSW/Playwright testing stack;
11. same-origin Nginx/security/deployment assets;
12. accessibility/performance/release-hardening tooling.

Targeted rebuild candidates: **0 repository-wide areas**.

Targeted refactor areas: API generation/wrappers, authentication/authorization, Organization operational context, and integrity/assets DTO handling.

## 12. Phase-0 counts

| Metric | Count |
|---|---:|
| Concrete frontend URL routes audited | 24 |
| Routed/page-process files inspected | 30+ |
| Transport-facing API consumer files audited | 18 |
| Approximate exported API consumer operations in those adapters | 80 |
| API consumer files requiring current OpenAPI refresh | 18 |
| Material stale documented assumptions identified | 3 |
| Deferred direct LeakDetectionAPI dependencies found in active source | 0 |
| Major reusable foundations retained | 12 |
| Repository-wide rebuild candidates | 0 |
| Targeted refactor areas | 4 |

## 13. Final decision

**CONTINUE / REFACTOR**

Do not reset HidraWEB to an empty repository.

The architecture is fundamentally reusable. Contract drift is concentrated and can be corrected incrementally with lower risk than a full rebuild.

The next single task is **HWEB-R02 — refresh the OpenAPI generation baseline**. No business feature task is authorized before HWEB-R02 completes.
