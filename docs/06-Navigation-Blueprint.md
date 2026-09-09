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
