# 03 — Frontend Macro Architecture

## Status

This document is an implementation-oriented summary.

Canonical authority:

- [`architecture/HidraWeb-Information-Architecture.md`](architecture/HidraWeb-Information-Architecture.md) — navigation, processes and workspace hierarchy.
- [`architecture/Hidra-API-Web-Contract-v1.md`](architecture/Hidra-API-Web-Contract-v1.md) — HidraAPI/HidraWeb interface rules.
- [`architecture/HidraWeb-Technical-Architecture.md`](architecture/HidraWeb-Technical-Architecture.md) — technology, source boundaries and runtime architecture.
- [`roadmap/HWEB-016-01-Authentication-Contract-Freeze.md`](roadmap/HWEB-016-01-Authentication-Contract-Freeze.md) — current verified authentication contract freeze against HidraAPI AUTH-030.

If this summary conflicts with verified live HidraAPI/OpenAPI evidence, the live backend contract wins and canonical documents must be corrected.

## Application shell

HidraWeb shall use a stable enterprise shell:

- **Navbar**: product identity, environment/organization/site context where available, global search, realtime status, My Tasks, notifications, language and user profile.
- **Collapsible left sidebar**: process-oriented navigation filtered by backend permission metadata.
- **Main workspace**: overview, workbench, map, console, entity workspace and workflow/task pages.
- **Context drawer**: optional right-side inspector/actions/filters where a screen requires it; not a permanent shell column.

## Frontend composition model

HidraWeb shall not equate every HidraAPI module with a top-level menu item.

The frontend uses three composition concepts:

```text
modules/
  frontend boundaries aligned to HidraAPI bounded-context ownership

processes/
  cross-module user workflows and operational composition

features/
  cross-cutting capabilities such as permissions, realtime and global search
```

Examples:

```text
processes/incident-response
  -> incident + alarm + leakdetection + hse + topology + workflow + documents

processes/operational-monitoring
  -> telemetry + monitoring + topology

processes/integrity-maintenance
  -> integrity + assets + topology + documents + risk
```

Cross-module orchestration belongs in `processes`; modules must not depend on other modules' private frontend implementation.

## Navigation structure

Primary navigation is process-oriented:

```text
Overview

OPERATIONS
  Network
  Operations
  Alarms
  Events & Incidents
  Planning

ENGINEERING
  Integrity & Maintenance
  Metering & Custody

INTELLIGENCE
  Risk
  Analytics
  Simulation
  Reports

WORK
  My Tasks
  Notifications

ADMINISTRATION
  Organization
  Identity & Access
  Configuration
  Audit
  Documents
  Integrations
```

Menu visibility is derived from the stable product navigation registry intersected with HidraAPI permission/capability metadata.

## Routing strategy

React Router owns frontend routes.

Primary routes describe user processes, for example:

```text
/network
/operations
/alarms
/events/incidents
/planning
/engineering/integrity
/intelligence/risk
/work/tasks
/administration/organization
```

Backend API routes remain domain/module oriented under `/api/v1`.

Route objects shall include, where applicable:

- path;
- page/workspace component;
- required permission metadata;
- breadcrumb metadata;
- frontend process/module owner;
- query prefetch strategy.

Generic module/resource workbench routes may exist as secondary/admin/discovery routes; `/{module}` is not the mandatory primary navigation model.

## State ownership

- Server state: TanStack Query.
- Authentication/session: `AuthProvider` owns provider-independent Hidra session state and keeps bearer credentials private to auth/transport infrastructure.
- Permission state: `PermissionProvider` fed by HidraAPI permission metadata/contracts.
- Cross-screen UI context: small Zustand stores only where justified.
- Local UI state: React state and route/search parameters.
- Forms: React Hook Form + Zod.
- Realtime: SSE/STOMP adapters feeding TanStack Query invalidation/update and notification UX.

Authentication source (`LOCAL`, `LDAP`, `ACTIVE_DIRECTORY`, `OIDC`) is session metadata only and must not drive business authorization or feature-module branching.

HidraWeb shall not maintain a second global copy of backend entities.

## Authentication architecture

The application authentication abstraction is provider-independent:

```text
Login/authentication UI
        -> selected authentication mechanism
        -> auth application/gateway boundary
        -> HidraAPI / external OIDC flow where applicable
        -> unified AuthenticationLoginResponse
        -> Hidra-issued accessToken
        -> AuthProvider
        -> Axios / Router / PermissionProvider
```

Verified direct authentication uses:

```text
POST /api/v1/identity/authentication/login
  providerType = LOCAL | LDAP | ACTIVE_DIRECTORY
```

OIDC retains browser Authorization Code + PKCE and completes the Hidra session through:

```text
GET  /api/v1/security/oidc
POST /api/v1/identity/authentication/oidc/complete
```

Feature modules never know which provider verified the identity. They depend only on authenticated Hidra session state and Hidra-owned permissions.

Provider fallback is forbidden.

## API architecture

HidraAPI OpenAPI is the machine contract source.

Preferred flow:

```text
/v3/api-docs
  -> Orval
  -> generated TypeScript/Axios clients
  -> TanStack Query/module adapters
  -> pages/components
```

No component may call Axios directly. Existing API catalogs remain governance/evidence artifacts.

Authentication calls follow the same generated-client preference; handwritten authentication URLs are allowed only while a verified endpoint is absent from the selected OpenAPI artifact and must be gap-tracked.

## Topology capabilities

Canonical GIS decision: **MapLibre GL JS**, isolated behind a Hidra-owned `HidraMap` abstraction.

Requirements:

- GeoJSON rendering from HidraAPI;
- layer control;
- feature selection/search;
- operational filters and overlays;
- realtime overlay updates where useful;
- future vector-tile evolution without exposing MapLibre internals to business modules.

Leaflet is not the canonical map engine under this architecture baseline.

## Workflow architecture

Workflow is cross-cutting:

- global My Tasks / workflow workspace;
- embedded workflow panel inside target business records.

The frontend must not invent workflow states or actions. Available actions are driven by explicit HidraAPI contracts/metadata.

## Notification and realtime architecture

Notifications/realtime may be consumed from REST/workbench data, `/api/v1/realtime/sse`, and STOMP topics when enabled.

Architecture rule:

```text
REST/API = authoritative state
SSE/STOMP = change delivery and query-cache refresh signal
```

The UI must remain usable when realtime transport is temporarily unavailable.
