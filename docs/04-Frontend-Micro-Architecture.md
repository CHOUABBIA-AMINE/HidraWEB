# 04 — Frontend Micro Architecture

## Status

This document is a concise implementation guide.

Canonical authority:

- [`architecture/HidraWeb-Technical-Architecture.md`](architecture/HidraWeb-Technical-Architecture.md)
- [`architecture/Hidra-API-Web-Contract-v1.md`](architecture/Hidra-API-Web-Contract-v1.md)
- [`roadmap/HWEB-016-01-Authentication-Contract-Freeze.md`](roadmap/HWEB-016-01-Authentication-Contract-Freeze.md) for the current verified authentication contract.

If this guide conflicts with verified live HidraAPI/OpenAPI evidence, the verified backend contract wins and canonical documents must be corrected.

## Folder structure

Target structure:

```text
src/
  app/
    router/
    providers/
    auth/
    bootstrap/

  shell/
    navbar/
    sidebar/
    breadcrumbs/
    workspace/

  modules/
    topology/
    telemetry/
    monitoring/
    alarm/
    incident/
    leakdetection/
    hse/
    planning/
    integrity/
    assets/
    custody/
    risk/
    analytics/
    simulation/
    reporting/
    administration/

  processes/
    operational-monitoring/
    incident-response/
    integrity-maintenance/
    workflow/
    tasks/
    operational-context/

  features/
    global-search/
    permissions/
    realtime/
    documents/
    audit-trail/

  api/
    generated/
    client/
    errors/
    realtime/

  components/
    data-grid/
    forms/
    map/
    charts/
    status/
    timeline/
    feedback/

  design-system/
    theme/
    tokens/
    icons/

  shared/
    model/
    hooks/
    utils/
    constants/
```

Do not create a frontend folder merely to mirror a backend package if no frontend implementation requires it. Conversely, when a backend bounded context has implemented frontend behavior, keep its ownership isolated in the corresponding module/public boundary.

## Dependency rules

Allowed:

```text
app/shell -> processes -> modules/features -> api/shared/design-system
```

Cross-module composition belongs in `processes`.

Forbidden examples:

```text
modules/alarm -> modules/incident/private/*
modules/topology -> modules/telemetry/private/state
shared -> modules/*
design-system -> modules/*
api/generated -> UI/business code
```

Each module exports an explicit public surface through `index.ts`. Deep imports into another module are forbidden.

## Module template

Example:

```text
modules/alarm/
  api/
    alarmApi.ts
  model/
    alarmViewModel.ts
    alarmMappers.ts
  pages/
    AlarmConsolePage.tsx
    AlarmDetailPage.tsx
  components/
    AlarmGrid.tsx
    AlarmStatus.tsx
    AlarmActions.tsx
  hooks/
    useAlarmConsole.ts
  routes.tsx
  index.ts
```

## Process template

Example:

```text
processes/incident-response/
  model/
    incidentResponseContext.ts
  components/
    RelatedAlarmPanel.tsx
    LeakEvidencePanel.tsx
    WorkflowPanel.tsx
    DocumentEvidencePanel.tsx
  pages/
    IncidentCommandWorkspace.tsx
  index.ts
```

Processes may compose public contracts from multiple modules; they do not change backend data ownership.

## Naming conventions

- Pages/workspaces: `TopologyMapPage`, `IncidentCommandWorkspace`, `RiskOverviewPage`.
- Components: noun/intent based; do not create a generic `Base*` dumping ground.
- Hooks: `useTopologyLayersQuery`, `useAlarmConsole`, `useSearchOperationalResourceMutation`.
- View-model mappers: explicit `*Mapper` functions where transport and presentation models differ.
- Zod schemas: use request/interaction intent names such as `CreateLeakCandidateSchema` only when the corresponding backend contract exists.

## API service conventions

Preferred contract flow:

```text
HidraAPI /v3/api-docs
  -> Orval
  -> src/api/generated/
  -> central transport configuration
  -> module API adapters/view-model mappers where needed
```

Rules:

- Axios may be the central/generated transport.
- No React component may call Axios directly.
- Do not hand-write endpoint URLs when an equivalent generated client exists.
- Existing API catalog rows remain traceability/governance evidence.
- Server error payloads normalize to shared `HidraApiError`.
- Generated transport DTOs are not automatically presentation view models.

## Query conventions

- TanStack Query owns server state.
- Query keys include the resource identity and all filters/scope affecting the response.
- Mutations invalidate/update only affected query keys.
- Realtime events invalidate/update TanStack Query; they do not populate a parallel global state store.
- Use server-side paging/search for large resources.

## Client state conventions

- React state for local transient UI.
- Route/search params for shareable navigation/filter state.
- Zustand only for small cross-screen UI/operational context such as sidebar state, selected site/area or map preferences.
- Do not copy HidraAPI entities into a global Zustand/Redux-style database.

## Form conventions

- React Hook Form + Zod.
- Request DTO/OpenAPI semantics drive form payloads.
- Frontend-only presentation validation may improve UX but must not contradict backend business validation.
- Undefined backend semantics remain explicitly unknown/gap-tracked.

## Authentication conventions

- Authentication is accessed only through `AuthProvider` and auth infrastructure under `src/app/auth`/transport boundaries.
- Feature code never reads/writes bearer tokens or submitted LOCAL/LDAP/AD credentials directly.
- Feature code never branches on authentication source for authorization or business behavior.
- Direct login uses the verified `POST /api/v1/identity/authentication/login` contract with explicit `providerType`.
- OIDC retains Authorization Code + PKCE and converges through `POST /api/v1/identity/authentication/oidc/complete`.
- All successful paths normalize to one Hidra session result containing the Hidra-issued bearer credential and normalized principal/session metadata.
- Provider fallback is forbidden; one failed provider attempt must not trigger another provider.
- Bearer-token storage remains private and memory-only unless HidraAPI publishes a different authoritative browser contract.
- No refresh, logout/revoke, provider-discovery, or current-principal endpoint may be invented where backend evidence is absent.
- Development Basic/disabled compatibility is infrastructure compatibility only; it is not the long-term application authentication domain model.

Recommended internal dependency direction:

```text
LoginPage / callback route
        -> auth application/gateway
        -> generated HidraAPI auth client and OIDC adapter
        -> session normalization
        -> AuthProvider
        -> authorization-header factory / Router / PermissionProvider
```

Components must not bypass this boundary.

## Authorization conventions

Use HidraAPI permission metadata for:

- route guards;
- sidebar visibility;
- action/button guards.

Backend `403` remains authoritative. Client guards are not a security boundary.

Authentication source, AD groups, LDAP metadata, and external OIDC roles/scopes must not be used as a replacement for Hidra-owned permission resolution.

## Authenticated cache conventions

- User-scoped server state remains in TanStack Query, not inside `AuthProvider`.
- On authentication, establish the Hidra session before enabling protected queries.
- On logout, expiry, or `401`, cancel/remove authenticated user-scoped queries before allowing another actor to establish a session.
- Permission state and principal/session state must be cleared together with the bearer credential.
- `403` does not clear the authenticated session.

## Map conventions

- Canonical engine: MapLibre GL JS.
- MapLibre types stay behind `components/map` / adapter boundaries.
- Business modules consume `HidraMap`/map-domain abstractions and GeoJSON contracts.
- Operational layer styling is centralized and semantic.

## Realtime conventions

- Central `RealtimeProvider` owns SSE/STOMP connection lifecycle.
- Reconnect with controlled backoff.
- Normalize events before dispatch to feature/process handlers.
- Prefer query invalidation/refetch for complex changes.
- Realtime outage must not block normal REST-backed operation.

## Error handling conventions

- `401`: terminate/invalidate the frontend authenticated session and require re-authentication.
- `403`: permission-denied state; preserve the authenticated session.
- `404`: not-found workbench/detail state.
- `409`: stale/conflicting state; refresh/review.
- `422`: form/business decision feedback where backend uses it.
- `5xx`: operational error banner/state with retry and correlation reference where available.

Feature modules shall not independently parse raw Axios error shapes.

## Testing conventions

- Unit: Vitest.
- Component: React Testing Library.
- API mocks: MSW.
- Contract: OpenAPI generation + TypeScript compilation.
- E2E: Playwright.
- Accessibility: WCAG 2.2 AA target with automated and keyboard/manual checks.

Authentication tests must include provider routing/no-fallback behavior, Hidra session normalization, OIDC callback security, `401` cleanup, `403` preservation, and authenticated cache isolation.

## Architecture guardrails

Once source code is scaffolded, automate checks for:

- forbidden deep cross-module imports;
- generated API drift;
- TypeScript compile errors;
- lint/test/build failures;
- authentication token/credential access outside approved auth/transport boundaries where practical.

Micro-frontends are explicitly out of scope.
