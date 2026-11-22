# 06 — Navigation Blueprint

## Status

This blueprint implements the canonical [`architecture/HidraWeb-Information-Architecture.md`](architecture/HidraWeb-Information-Architecture.md).

It replaces the previous module-first menu model.

Backend modules remain API/domain ownership boundaries; they are not automatically top-level navigation items.

## Navigation rules

- Default authenticated landing page: `/overview`.
- Maximum depth for routine daily operations should normally remain two navigation levels.
- Primary routes express user processes/workspaces, not `/{backendModule}` by default.
- Generic module/resource workbench routes may exist as secondary/admin/discovery routes.
- Quick inspection uses a contextual detail drawer where appropriate.
- Complex operational records use a full entity workspace.
- Topology/network map is a primary operational work area.
- Breadcrumbs describe user context, not Java package ownership.

Examples:

```text
Operations / Alarms / Alarm detail
Events & Incidents / Incidents / Incident detail
Engineering / Integrity & Maintenance / Assessment
Intelligence / Simulation / Run detail
```

## Permission resolution

Navigation uses a stable frontend navigation registry intersected with HidraAPI permission metadata.

Verified permission metadata endpoints are:

```text
GET /api/v1/security/permissions/catalog
GET /api/v1/security/permissions/routes
```

For a process that combines multiple backend modules, visibility is based on the permissions needed for at least one useful child route/workspace.

```text
process visible
  if user can access at least one enabled child workspace

child route visible
  if required backend route/action permission metadata allows it
```

Do not hard-code persona/role names as the final authorization rule. Backend enforcement remains authoritative.

## Canonical menu hierarchy

| Menu | Parent | Backend ownership used for permission/capability resolution | Route | Order |
|---|---|---|---|---:|
| Overview | ROOT | Cross-domain authorized summaries | `/overview` | 10 |
| Operations | ROOT | Group |  | 20 |
| Network | Operations | topology | `/network` | 21 |
| Operations Overview | Operations | telemetry, monitoring, topology | `/operations` | 22 |
| Alarms | Operations | alarm | `/alarms` | 23 |
| Events & Incidents | Operations | incident, leakdetection, hse | `/events` | 24 |
| Planning | Operations | planning | `/planning` | 25 |
| Engineering | ROOT | Group |  | 30 |
| Integrity & Maintenance | Engineering | integrity, assets | `/engineering` | 31 |
| Metering & Custody | Engineering | custody, party where applicable | `/custody` | 32 |
| Intelligence | ROOT | Group |  | 40 |
| Risk | Intelligence | risk | `/intelligence/risk` | 41 |
| Analytics | Intelligence | analytics | `/intelligence/analytics` | 42 |
| Simulation | Intelligence | simulation | `/intelligence/simulation` | 43 |
| Reports | Intelligence | reporting | `/intelligence/reports` | 44 |
| Work | ROOT | Group |  | 50 |
| My Tasks | Work | workflow | `/work/tasks` | 51 |
| Notifications | Work | notification | `/work/notifications` | 52 |
| Administration | ROOT | Group |  | 60 |
| Organization | Administration | organization | `/administration/organization` | 61 |
| Identity & Access | Administration | identity, security permission metadata | `/administration/users` | 62 |
| Configuration | Administration | configuration | `/administration/configuration` | 63 |
| Audit | Administration | audit | `/administration/audit` | 64 |
| Documents | Administration | documents | `/administration/documents` | 65 |
| Integrations | Administration | integration | `/administration/integrations` | 66 |

The sidebar does not expose `party`, `workflow`, `notification`, `leakdetection`, `hse`, `assets` or other modules as mandatory standalone top-level entries when they are better expressed inside a user process.

## Route tree

```text
/
├── overview
├── network
│   ├── map
│   ├── pipelines
│   ├── facilities
│   └── equipment
├── operations
│   ├── overview
│   ├── telemetry
│   ├── monitoring
│   └── deviations
├── alarms
├── events
│   ├── incidents
│   ├── leaks
│   └── hse
├── planning
├── engineering
│   ├── integrity
│   └── maintenance
├── custody
├── intelligence
│   ├── risk
│   ├── analytics
│   ├── simulation
│   └── reports
├── work
│   ├── tasks
│   └── notifications
└── administration
    ├── users
    ├── organization
    ├── permissions
    ├── workflow
    ├── configuration
    ├── audit
    ├── documents
    └── integrations
```

Child routes shall only be enabled when the supporting HidraAPI capability exists. A route defined in this architecture but not yet backed by an implemented API is a roadmap/`TARGET` route and must not be presented as operationally available.

## Workbench routing

The generic HidraAPI workbench remains available as a secondary capability for supported resources:

```text
GET  /api/v1/workbench/modules
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

HidraWeb may expose internal/admin workbench routes for these resources, but the generic workbench shall not dictate the primary product navigation.

## Detail navigation

Use a contextual drawer when:

- the user is inspecting a record without leaving a map/grid context;
- the record has limited actions and short context;
- preserving the parent workspace is operationally useful.

Use a full entity workspace when:

- workflow/decision history is significant;
- evidence/documents/timeline require multiple panels;
- the record has complex actions or related-domain context.

Typical full workspaces include incidents, plans and simulation runs. Alarm/topology/telemetry records may use either pattern according to complexity.

## Navbar responsibilities

The navbar is reserved for global application concerns:

- Hidra identity;
- environment/organization/site context where available;
- global search;
- realtime status;
- My Tasks indicator;
- notifications;
- language;
- profile/sign out.

Module navigation must remain in the sidebar/process workspace, not the navbar.

## Topology navigation

Network topology is reachable from `/network` and acts as shared context for asset-linked processes.

Where supported, operational records shall provide `Show on map` navigation to the relevant topology feature/context.

## Legacy route handling

Previous conceptual routes such as `/topology`, `/monitoring`, `/alarm`, `/incident`, `/workflow` and similar module-first paths are not the canonical primary IA.

If such routes are implemented for compatibility or generic workbench access, they shall redirect to or coexist behind the canonical process routes without redefining the sidebar structure.

## UXR-06 — implemented hierarchical navigation (22 November 2026)

The existing primary process names, ordered group membership, canonical routes and backend ownership remain unchanged. UXR-06 upgrades the interaction from the prior always-open section lists to one expanded accessible group at a time. The six stable top-level destinations are Overview (root item), Operations, Engineering, Intelligence, Work and Administration. The existing 272px expanded and 72px collapsed widths are not changed.

Group headings are keyboard-operable and report `aria-expanded`/`aria-controls`. Authorized children alone populate an expanded group. Empty groups and unauthorized descendants are removed before rendering. The only registered depth-three example is `Engineering → Integrity & Maintenance → Assets` at the **existing** `/engineering/assets` route; Assets is a text-only descendant controlled by an independent submenu toggle and gated on the `assets` module from effective backend-grant/route intersection. The asset workspace's subsequent full product evolution is **UXR-25**, not a UXR-06 new API contract. On direct authenticated entry, an authorized active route can select its group/submenu; back/forward and sensitive-context restoration remain deferred to UXR-07.

The frontend `navigationSections` registry is still an interface process map, not a source of principal authority. Backend server-side permission enforcement remains decisive; no group or descendant grants itself access. Tests cover grant-pruned visibility, group exclusivity, nested item permissions, keyboard activation, icon-only collapse and screen-height/RTL foundational preservation. No extra route, backend endpoint, fake API response or workflow decision is published by this change.


## UXR-07 — route-aware mobile navigation, history and scoped restoration (22 November 2026)

The authenticated shell retains the existing `/` → `/overview` replace-redirect, guarded Login return-to route and generic 404 fallback. UXR-07 does not invent new process URLs or grant authorities. The permanent product structure remains exactly six registered groups. The 272px/72px desktop sidebar and temporary mobile overlay remain owned by the shell, including the pre-existing LTR/RTL anchor behavior, keyboard focus and MUI Escape dismissal.

A **route entry + authenticated principal + authorized module snapshot + selected operational scope** forms a short-lived navigation context identity. Both the open mobile drawer and manually expanded accordion/submenu are derived for that specific context. Route changes, Back/Forward, permissions change, scope selection or principal replacement invalidate prior local expansion and re-derive the **exact, authorized** active ancestor from the effective module intersection. The protected workspace and contextual inspector boundary are remounted per navigation identity so stale record selections, context drawer content and page-local input do not reappear on returning to an earlier history entry; the sidebar still exposes only authorized destinations. This is ephemeral UX isolation, **not** backend authorization.

The Alarm Console's `active`/`history` and Analytics' `datasets`/`insights`/`metric-definitions`/`metric-evaluations` local tabs now use an explicit allowlist and the optional `tab` URL query coordinate. Browser history can restore this low-sensitivity view identity while private record selections are not serialized. Unknown or forged tab names fall back to the first tab. No cross-module tab selection, resource IDs, company access, approval or decision authority are placed in global shell state or browser storage. Existing module-specific query parameters and hashes are retained by normal router history operations.

**Acceptance tests:** source/unit checks cover the route/principal/scope/grant key and allowlisted tabs, plus remount-clearing of contextual drawer content. Browser coverage exercises mobile Escape, route-change closure, Back/Forward, protected direct links, nested active ancestry and unauthorized/404/root redirect behavior; Alarm tabs verify Back/Forward view restoration. HidraAPI server authorization and existing page-owned guards remain authoritative. Revalidation of independent business caches after changing operating context remains separately registered in UXR-09/P3 and does not become an implicit permission grant here.


## UXR-07 correction — separating route-entry navigation from workspace lifecycle (22 November 2026)

The preceding UXR-07 section documents the initial implementation and must be read together with this append-only correction following exact-SHA Code CI #1066 failure.

**Do not remount the entire shell or protected workspace for every history entry.** The topology-authoring process legitimately uses `setSearchParams` to record a company/system/draft in the URL while staying on the same `/network` page. React Router changes the location key for a new entry. Keying the whole `AppShellFrame` and `<Outlet>` to that key destroys the live authoring form; its dropdowns can detach and incomplete form state is lost.

UXR-07 now uses two separate lifetimes:

- **Navigation-entry identity** (React Router `location.key`, authenticated principal, scope and effective authorized modules): the temporary mobile drawer and sidebar's manual accordion expansion use it. When the identity changes, old expansion is cleared and the active authorized ancestor is derived again. Re-entering an earlier history entry does **not** reopen an old drawer.
- **Protected-workspace identity** (exact `location.pathname`, authenticated principal, scope and effective authorized modules): the contextual inspector provider and routed workspace use it. Changing only query parameters or hashes on the **same path** preserves page-local work in progress and allowlisted tab history; changing the protected pathname, principal, selected scope or effective grants remounts and discards sensitive UI state. No record ID, tab identity or company authority is persisted by the shell.

The previous statement that protected workspaces are remounted *per history entry* is superseded by this narrower, correct route/scope contract. The selected alarm is intentionally cleared after visiting a different pathname; a user must re-open the alarm from the authorized list before its acknowledge/close controls are available. Backend permission checks, concurrency and human decisions remain unchanged. No new OT or engineering data source is inferred.


## UXR-07 CI #1067 lint repair — component-keyed navigation chrome (22 November 2026)

The earlier UXR-07 correction introduced synchronous `setState(null)` calls in `useEffect` to clear the mobile drawer and manual accordion selections. Exact-SHA Code CI #1067 rejected both with `react-hooks/set-state-in-effect`. The existing browser/history requirements remain unchanged, and no test rule is suppressed.

The corrected shell isolates **`ShellNavigation`** (navbar toggle + sidebar + mobile overlay) inside an authorized **history-entry key**. React remounts only that navigation chrome on route history, principal, effective modules, scope or responsive-mode transition, discarding open drawer and manually expanded group/submenu state by construction. The navigation/sidebar now need no effect-driven synchronous state clearing. The outer `AppShellFrame` remains mounted.

Separately, the contextual drawer provider and routed `<Outlet>` retain their **pathname/principal/scope/effective-module workspace key**, not `location.key`. Same-path query or hash updates therefore preserve in-progress network authoring and tabbed page state. Cross-route and authority-context changes still discard protected page-local context. Existing six authorized groups, desktop widths, RTL anchors, keyboard and backend authority remain unchanged.

CI #1067 verified the earlier native W2 authoring regression and both mandatory W4 decisions/denials successfully, but its main verification stopped at lint; this new source must still pass the complete fresh exact-SHA suite before UXR-07/G2 acceptance.


## UXR-09 — governed regional context revalidation (22 November 2026)

Operational context is no longer auto-selected from an Organization responsibility.
The chooser shows active and time-effective regional resource responsibilities of
the linked employee. The current principal and responsibility responses do not
carry authoritative company-party choices, so the operator supplies the exact
companyPartyId. Identity then verifies the company/resource tuple; the browser
never derives authority from a role, route, scope name or local selection.

Before applying, HidraWEB fetches fresh principal, effective permissions,
responsibilities and Identity regional-access decision. Denial or mismatch fails
closed. Context changes clear old scoped queries and inspectable state, returning
to Overview rather than restoring old sensitive deep-link selections. Current
scope identity includes authenticated principal and exact company. Periodic and
focus rechecks retract revoked contexts. Server-side owner authorization remains
required. No live industrial access, company directory or control is asserted.

UXR-09 race and sign-out safeguard: async rebind runs before the keyed shell
is changed, discards late answers after unmount or identity transition, and
AuthProvider removes the selected scope synchronously with session revocation.


## P3 / UXR-10 — header shortcuts and WEB reachability (22 November 2026)

My Tasks uses the existing assigned inbox at `/work/tasks` and a published,
currently permitted Workflow `GET /api/v1/workflow/tasks`. Notifications
links only to the existing **evidence-only** `/work/notifications` route
when the actor can read the published T27 notification inbox route **and**
the workbench evidence list route; the navbar does not select a facility,
request notification data or fabricate a global unread count. T27 facility
inbox reads remain exclusively behind server-established exact facility and
company selection, and no browser acknowledgement is added here. A disabled
shortcut has no anchor destination. These are UI affordances, never new
resource authorization.

The header now shows a **WEB-origin connectivity probe** with browser
`online/offline` events and a bounded uncached same-origin `HEAD /` check.
Only the ability to reach the WEB origin is asserted; it does not establish
HidraAPI health, SSE/STOMP events, telemetry freshness, OT control/network
availability or SITE acceptance. The existing conservative disconnected
RealtimeProvider remains unchanged; it does not subscribe to domain topics.


## P3 / UXR-11 — scoped network-local search (22 November 2026)

Global cross-domain search remains disabled: no accepted cross-module index
or authorization contract exists. If a UXR-09 operational context is selected,
`/network` mounts only the T34 region-specific search rather than the older
unscoped administrator map. The exact `companyPartyId`, current authenticated
principal, canonical selected scope, published GET route and effective
`topology:regional-map:search` grant are required. T34 still owns every
fresh read and post-scope total; the frontend provides no independent authority.
Typed link URLs carry only the backend-issued `properties.layer` and
`properties.entityId`, **not** outer namespaced feature IDs or company
credentials. A link triggers a new `GET
/api/v1/topology/regional-map/layers/{layerId}/features/{entityId}` with
`companyPartyId` after checking the published regional-map read grant.
Invalid links, opaque denials, malformed responses or lost scope fail closed,
with no previous search/detail shown while requests are pending. Unselected
administrative map behavior stays under its existing distinct permissions.
No new backend APIs, cross-domain search, realtime/OT integration, hydraulic
solver or qualified industrial calculation are claimed.


## P4 / UXR-12 — shared workspace heading and toolbar (22 November 2026)

`src/shell/workspace/WorkspaceHeading.tsx` presents a single semantic `h1`,
explicit owner-supplied breadcrumbs, a subtitle and optional provenance-tagged
status. It never generates a business state from a URL or local badge. Only
primary actions with `permitted: true` supplied by the owning workspace render;
this is a UX gate, not an authorization boundary. Breadcrumb destinations must
be known safe application routes admitted by their owning pages. The optional
second row `WorkspaceToolbar` composes owner-specific filters, tabs or search
controls, with an explicitly permitted, disabled-while-busy refresh action.
It uses an accessible labelled group without pretending to implement an ARIA
roving-focus toolbar. Both components are responsive and use existing MUI
focus-visible treatments.

The initial adoption is bounded to `/overview` and `/work/tasks`. Overview
keeps its existing effective `modules:resources:read` workbench navigation
gate; Work Tasks keeps its existing backend-owned assigned inbox/read/action
flow, now exposing the inbox refresh in the toolbar. A task owner status is
shown only if the authorized task detail has been successfully returned; its
value is taken unchanged from HidraAPI Workflow, with no locally inferred
eligibility or freshness. Existing workflow mutation/optimistic-concurrency,
owner error handling, scope-switch and direct-route guards remain unchanged.
Other workspaces will adopt the shared frame only when separately selected;
no blanket 19-workspace migration, status aggregation or new REST API is
implied by UXR-12.


## P4 / UXR-13 — owned workspace canvas layouts (22 November 2026)

The `WorkspaceCanvas` presentation primitive lives in
`src/shell/workspace/WorkspaceCanvas.tsx`. It supports six explicit
variants: `map`, `synoptic`, `summary`, `register`, `trend-detail` and
`editor`. Responsive single-column fallbacks apply to visual/record editors,
summary cards use one/two/four cards by viewport, and trend/detail places an
independently named aside beside the trend only on wide screens. No permanent
right-hand shell column is added. No chart engine, MapLibre SDK, telemetry
contract or simulation adapter is imported by this layout component.

Every owner chooses an explicit data state: `ready`, `loading`, `empty`,
`degraded`, or `unavailable`. Non-ready states render only accessible
loading text/skeletons or an informational/warning state. They **never mount**
existing protected child content or supporting details. A degraded-state
retry button is available only when the owning workspace supplies an explicit
`permitted: true` handler; an opaque unauthorized/unavailable state does not
expose a retry action. A layout state alone cannot grant resource access,
relabel engineering status, reuse an old response or qualify an owner result.

Bounded initial adoption: `/overview` presents its four existing shell
metadata cards inside the summary canvas, preserving its previous permission
constraints; `/work/tasks` renders only its already-authorized Workflow
assigned inbox inside the register canvas, with owner-supplied loading/empty/
request-failed messages and no stale row rendering after a failed read.
`/network`'s **existing unscoped administrator map** uses the map canvas,
with geometry hidden during loading, when no layers/features are available,
or after a failed read; any retry still calls the same owner API and is not
offered after 403/404. Feature list/counts only render when the map owner
read is ready. The separately scoped T34 regional search path is unchanged:
no unscoped fallback, new cross-domain data join or authorization bypass.

`synoptic`, `trend-detail` and `editor` frames are delivered as reusable
presentation contracts and exercised with synthetic component fixtures.
Actual station signal placement, qualified trend provenance, timeline, owner
actions and editor save contracts remain separately gated under UXR-14–24
and their respective backend owners. No simulated preview is relabelled as
an operational live view. Unit and browser checks cover variants, detail
landmarks, denied/empty/degraded isolation, responsive summary, register and
map failure. This stage is not SITE/OT acceptance.
