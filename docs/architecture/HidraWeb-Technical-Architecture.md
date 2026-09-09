# HidraWeb Technical Architecture

```text
Document code : HIDRA-WEB-TECH-ARCH-v1
Repository    : HidraWEB
Product       : HidraWeb / HidraAPI
Owner         : Sonatrach / TRC Digitalization Initiative
Author        : Abir MEDJERAB
Status        : Canonical implementation architecture
```

## 1. Architecture decision

HidraWeb shall be implemented as a **modular frontend monolith** using React + TypeScript.

Do not introduce micro-frontends.

The frontend shall preserve HidraAPI bounded-context ownership while allowing cross-module operational processes through a dedicated frontend `processes` layer.

```text
HidraAPI modules     = domain ownership
HidraWeb modules     = frontend boundary aligned to domain ownership
HidraWeb processes   = cross-module user workflow composition
```

## 2. Technology baseline

| Area | Decision |
|---|---|
| UI runtime | React + TypeScript |
| Build | Vite |
| Routing | React Router |
| Server state | TanStack Query |
| Cross-screen UI state | Zustand, used sparingly |
| Local UI state | React state |
| Forms | React Hook Form + Zod |
| UI component system | MUI |
| Dense data grids | MUI X Data Grid or AG Grid according to licensing/feature decision |
| Map engine | MapLibre GL JS behind Hidra-owned abstraction |
| Charts | ECharts |
| Localization | i18next |
| API generation | Orval from HidraAPI OpenAPI |
| HTTP transport | Central/generated Axios transport is acceptable |
| Realtime | EventSource/SSE + STOMP/WebSocket client |
| Unit/component tests | Vitest + React Testing Library |
| API mocking | MSW |
| E2E | Playwright |

No alternate frontend framework/language shall be introduced without an explicit architecture decision.

## 3. Repository structure

Canonical target structure:

```text
HidraWEB/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   ├── auth/
│   │   └── bootstrap/
│   ├── shell/
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   ├── breadcrumbs/
│   │   └── workspace/
│   ├── modules/
│   │   ├── topology/
│   │   ├── telemetry/
│   │   ├── monitoring/
│   │   ├── alarm/
│   │   ├── incident/
│   │   ├── leakdetection/
│   │   ├── hse/
│   │   ├── planning/
│   │   ├── integrity/
│   │   ├── assets/
│   │   ├── custody/
│   │   ├── risk/
│   │   ├── analytics/
│   │   ├── simulation/
│   │   ├── reporting/
│   │   └── administration/
│   ├── processes/
│   │   ├── operational-monitoring/
│   │   ├── incident-response/
│   │   ├── integrity-maintenance/
│   │   ├── workflow/
│   │   ├── tasks/
│   │   └── operational-context/
│   ├── features/
│   │   ├── global-search/
│   │   ├── permissions/
│   │   ├── realtime/
│   │   ├── documents/
│   │   └── audit-trail/
│   ├── api/
│   │   ├── generated/
│   │   ├── client/
│   │   ├── errors/
│   │   └── realtime/
│   ├── components/
│   │   ├── data-grid/
│   │   ├── forms/
│   │   ├── map/
│   │   ├── charts/
│   │   ├── status/
│   │   ├── timeline/
│   │   └── feedback/
│   ├── design-system/
│   │   ├── theme/
│   │   ├── tokens/
│   │   └── icons/
│   └── shared/
│       ├── model/
│       ├── hooks/
│       ├── utils/
│       └── constants/
├── tests/
└── public/
```

Not every HidraAPI module requires a top-level user-visible route. Frontend module folders are created when implementation requires them; backend modules may also be represented inside the consolidated `administration` or process composition boundaries when that is the approved UI architecture.

## 4. Dependency direction

```text
app / shell
    -> processes
    -> modules / features
    -> api adapters + shared components
    -> design-system / shared primitives
```

### 4.1 Allowed dependencies

- `app` may compose shell, processes, modules and providers.
- `shell` may depend on auth, permissions, shared and design-system code.
- `processes` may depend on **public exports** of multiple modules/features.
- `modules` may depend on API infrastructure, shared code, design-system and approved cross-cutting features.
- `features` may depend on API/shared/design-system but shall not become hidden cross-domain ownership containers.
- `shared` and `design-system` must remain business-module independent.

### 4.2 Forbidden dependencies

```text
modules/alarm -> modules/incident/private/*
modules/topology -> modules/telemetry/private/state
shared -> modules/*
design-system -> modules/*
api/generated -> UI/business code
```

Cross-module orchestration belongs in `processes`.

## 5. Frontend module template

Example:

```text
modules/alarm/
├── api/
│   └── alarmApi.ts
├── model/
│   ├── alarmViewModel.ts
│   └── alarmMappers.ts
├── pages/
│   ├── AlarmConsolePage.tsx
│   └── AlarmDetailPage.tsx
├── components/
│   ├── AlarmGrid.tsx
│   ├── AlarmStatus.tsx
│   └── AlarmActions.tsx
├── hooks/
│   └── useAlarmConsole.ts
├── routes.tsx
└── index.ts
```

Only explicit public exports from `index.ts` may be consumed by other modules/processes. Deep imports into another module's internal folders are forbidden.

## 6. Process composition template

Example:

```text
processes/incident-response/
├── model/
│   └── incidentResponseContext.ts
├── components/
│   ├── RelatedAlarmPanel.tsx
│   ├── LeakEvidencePanel.tsx
│   ├── WorkflowPanel.tsx
│   └── DocumentEvidencePanel.tsx
├── pages/
│   └── IncidentCommandWorkspace.tsx
└── index.ts
```

This process may compose public contracts from:

```text
incident
alarm
leakdetection
hse
topology
workflow
documents
```

without changing backend ownership or allowing those modules to directly depend on one another's private frontend implementation.

## 7. Application bootstrap

Target provider composition:

```text
main.tsx
  -> AppProviders
      -> ErrorBoundary
      -> QueryClientProvider
      -> ThemeProvider
      -> I18nextProvider
      -> AuthProvider
      -> PermissionProvider
      -> RealtimeProvider
      -> RouterProvider
```

Rules:

- one application QueryClient;
- one central HTTP/error normalization layer;
- one authentication abstraction;
- environment configuration loaded/validated at bootstrap;
- principal, permission catalog and essential capability metadata may be fetched after authentication.

## 8. State ownership

| State type | Owner | Examples |
|---|---|---|
| Server state | TanStack Query | resources, lists, workflow state, layer metadata |
| Form state | React Hook Form | create/edit actions |
| Local UI state | React state | dialogs, tabs, transient UI state |
| Route state | URL/search params | shareable filters, paging, selected view where appropriate |
| Cross-screen UI context | Zustand | collapsed sidebar, selected operational context, map preferences |
| Realtime | RealtimeProvider -> Query cache | invalidation/update signals |

Do not duplicate backend entities in a giant global client store.

## 9. API architecture

```text
HidraAPI OpenAPI
    -> Orval
    -> src/api/generated/
    -> central transport configuration
       - authentication
       - correlation ID where supported
       - error normalization
       - base URL
    -> module API adapter/view-model mapper when needed
    -> page/component
```

Rules:

- no component calls Axios directly;
- use generated clients for endpoints represented in OpenAPI;
- generated DTOs are transport models, not automatically presentation view models;
- manual API wrappers are limited to explicit gaps, realtime or non-generated contracts and must be documented;
- existing API catalog remains governance evidence.

## 10. Authentication and authorization

### 10.1 Authentication

Authentication transport is isolated behind `AuthProvider`.

Supported runtime modes may include backend Basic and JWT configurations, but feature code shall not branch on those modes.

Production enterprise JWT/OIDC integration shall be introduced through the authentication provider without redesigning modules.

### 10.2 Authorization

Permission metadata from HidraAPI drives:

```text
route guard
sidebar visibility
action/button guard
```

HidraAPI remains the final enforcement point.

A React route guard is UX behavior, not a security boundary.

## 11. Routing architecture

React Router owns frontend routes.

Route objects should carry:

- path;
- page/workspace component;
- required permission metadata;
- breadcrumb metadata;
- frontend process/module owner;
- query prefetch strategy when useful.

Primary routes follow the canonical Information Architecture and express user processes (`/network`, `/operations`, `/events/...`) instead of requiring `/{backendModule}` as the primary route pattern.

Generic module/resource workbench routes may still exist as secondary/admin/discovery routes where appropriate.

## 12. Application shell

Permanent shell:

```text
Navbar
Collapsible sidebar
Main workspace
```

Contextual UI:

```text
right-side inspector/drawer only when a screen requires it
```

Do not reserve a permanent global right panel; maps, grids and operational consoles require horizontal workspace.

## 13. Map architecture

Canonical map engine: **MapLibre GL JS**.

It shall be isolated:

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

Rules:

- business modules do not import MapLibre types directly outside the map adapter/public map abstraction;
- backend GeoJSON is the spatial transport contract;
- Hidra-owned style/layer definitions control operational rendering;
- architecture remains ready for future vector-tile delivery without rewriting business pages.

Leaflet is not the canonical HidraWeb map engine under this baseline.

## 14. Realtime architecture

```text
HidraAPI SSE / STOMP
    -> RealtimeProvider
    -> event normalization/routing
    -> TanStack Query invalidation/update
    -> UI rerender
```

Rules:

- realtime is not a second source-of-truth store;
- reconnect with controlled backoff;
- expose connection state to the shell when operationally relevant;
- subscribe only to permitted/needed channels;
- use targeted cache updates only for simple well-defined events; otherwise invalidate/refetch.

## 15. Design-system architecture

MUI is the baseline component library. Hidra-specific semantics shall be wrapped into reusable components such as:

```text
HidraStatus
HidraSeverity
EntityHeader
EntityWorkspace
Timeline
DataGridToolbar
EmptyState
ErrorState
ContextDrawer
```

Rules:

- module code requests semantic status/severity, not arbitrary colors;
- control-room density is intentional;
- use cards primarily for summaries;
- use grids, maps, timelines and charts for operational work.

## 16. Localization

- use i18next from the first implementation baseline;
- UI strings use translation keys;
- backend enum values remain machine-neutral;
- locale-aware display is separate from API transport;
- the shell/design system must be capable of RTL if Arabic is activated.

The activated production locale set is a product decision. This architecture does not replace that decision with an implementation assumption.

## 17. Error handling

One `HidraApiError` normalization path shall handle server ProblemDetail/errors.

Expected UI handling:

- `401/403`: authentication/authorization flow;
- `404`: not-found workspace/detail state;
- `409/422`: conflict/business/form feedback;
- `5xx`: operational error banner/state with retry and correlation reference where available.

Feature modules must not independently parse raw Axios error shapes.

## 18. Testing architecture

| Level | Tool | Focus |
|---|---|---|
| Unit | Vitest | mappers, formatters, permission predicates |
| Component | React Testing Library | workspaces, forms, loading/error/empty states |
| Network mocking | MSW | API states, errors, paging, permissions |
| Contract | OpenAPI generation + TypeScript | backend/frontend schema compatibility |
| E2E | Playwright | critical operational user journeys |
| Accessibility | automated checks + manual keyboard review | WCAG 2.2 AA target |

Critical E2E coverage shall include the implemented equivalents of:

- authentication/session;
- permission-driven navigation;
- topology navigation;
- telemetry/monitoring read workflow;
- alarm lifecycle actions;
- incident response;
- workflow actions;
- planning approval where supported.

## 19. CI quality gates

Target pull-request pipeline:

```text
npm ci
 -> lint
 -> typecheck
 -> unit/component tests
 -> OpenAPI client generation/drift check
 -> production build
 -> Playwright smoke when environment is available
```

Rules:

- no merge with TypeScript errors;
- no generated-contract drift;
- architecture dependency rules shall be automated when source structure is established;
- bundle/performance budgets are introduced after the core dependency baseline stabilizes.

## 20. Deployment topology

Preferred production topology:

```text
Browser
  -> HTTPS reverse proxy/gateway
      -> /       HidraWeb static assets
      -> /api/*  HidraAPI
      -> realtime endpoints HidraAPI
          -> PostgreSQL and backend infrastructure
```

Prefer same-origin deployment where practical to reduce CORS/security complexity.

Production hardening includes:

- TLS;
- CSP and secure headers;
- cache policy for immutable frontend assets;
- secure authentication integration;
- frontend observability;
- environment-specific runtime configuration strategy.

## 21. Performance strategy

- route-level lazy loading for large work areas;
- virtualized grids for high-volume lists;
- server-side pagination/search for large resources;
- topology feature limits and future server-side vector-tile strategy when GeoJSON scale requires it;
- query stale times based on data volatility;
- realtime subscriptions only where operationally useful;
- time-series aggregation/downsampling for large charts.

## 22. Development sequence

The approved sequence is:

```text
0  HidraAPI stabilization / contract readiness
1  HidraWeb foundation
2  Shell + authentication + permissions
3  Generic operational workbench
4  Identity + organization context
5  Topology workspace
6  Telemetry + monitoring
7  Workflow + My Tasks
8  Alarm console
9  Incident + leak + HSE
10 Planning
11 Integrity + assets
12 Custody
13 Risk + analytics + simulation + reporting
14 Administration hardening
15 Production hardening
```

This sequence is dependency/value driven, not alphabetical.

## 23. Architecture decisions frozen by this baseline

- React + TypeScript + Vite;
- modular frontend monolith;
- process-oriented information architecture;
- navbar + collapsible permission-aware sidebar;
- modules + processes + features separation;
- TanStack Query for server state;
- Zustand only for limited cross-screen UI context;
- React Hook Form + Zod;
- MUI design system baseline;
- MapLibre GL JS behind `HidraMap` abstraction;
- OpenAPI/Orval generated transport layer;
- generic workbench plus specialized operational workspaces;
- SSE/STOMP integrated through Query cache invalidation;
- no micro-frontends.

## 24. Non-goals

Do not introduce:

- micro-frontends;
- frontend-owned duplicates of HidraAPI business rules;
- JPA/domain implementation coupling;
- a universal CRUD generator as final operational UX;
- client-side authorization as the security boundary;
- a SCADA control surface or autonomous operational control;
- premature 3D/digital-twin complexity before core trusted operational workflows are implemented.

## 25. Canonical relationship

This document is authoritative for HidraWeb source structure, dependency rules, technology baseline and runtime integration architecture.

Legacy/supplemental macro/micro documents must defer to this document when a technical decision conflicts.
