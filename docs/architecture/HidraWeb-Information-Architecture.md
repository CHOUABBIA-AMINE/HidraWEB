# HidraWeb Information Architecture

```text
Document code : HIDRA-WEB-IA-v1
Repository    : HidraWEB
Product       : HidraWeb / HidraAPI
Owner         : Sonatrach / TRC Digitalization Initiative
Author        : Abir MEDJERAB
Status        : Canonical architecture baseline
```

## 1. Purpose

This document defines the canonical information architecture for HidraWeb.

HidraWeb shall expose Hidra capabilities according to how operators, engineers, validators and administrators perform work. It shall not mechanically mirror the HidraAPI Java module tree in the primary navigation.

The backend bounded contexts remain the ownership model. Frontend processes are the navigation and composition model.

```text
Backend concern  = bounded-context ownership
Frontend concern = user process / workspace composition
```

## 2. Core principles

1. **Process before module.** Primary navigation groups user work rather than Java package names.
2. **Context before navigation.** Topology, asset, organization and workflow context should remain visible while a user acts.
3. **Stable shell, dynamic authorization.** Navigation is designed centrally and intersected with backend permission metadata.
4. **Specialized UX for high-value operational processes.** Generic workbench screens are reserved for secondary/reference resources and administration.
5. **Workflow is cross-cutting.** It appears globally as a task workspace and contextually inside target business records.
6. **Topology is the spatial backbone.** Telemetry, alarms, incidents, integrity, assets, custody and planning should link back to network context.
7. **Desktop-first operational density.** HidraWeb is optimized for control-room, engineering and enterprise desktop use.
8. **Progressive disclosure.** Overview -> list/map -> entity workspace -> timeline/evidence/workflow.

## 3. Primary work areas

| Work area | Frontend process | Primary backend ownership | Supporting contexts |
|---|---|---|---|
| Overview | Cross-domain situational awareness | Cross-domain | analytics, risk, alarm, incident, workflow |
| Network | Network & Topology | topology | documents, configuration, organization |
| Operations | Operational Monitoring | telemetry, monitoring | topology, configuration, analytics |
| Alarms | Alarm lifecycle | alarm | monitoring, topology, workflow, notification, audit |
| Events & Incidents | Response process | incident, leakdetection, hse | alarm, workflow, documents, organization, risk |
| Planning | Plan -> approve -> execute -> compare | planning | telemetry, topology, workflow, custody, analytics |
| Integrity & Maintenance | Asset condition and lifecycle | integrity, assets | topology, risk, documents, workflow, incident |
| Metering & Custody | Fiscal measurement and reconciliation | custody | party, telemetry, topology, workflow, reporting |
| Intelligence | Risk, analytics, simulation and reporting | risk, analytics, simulation, reporting | operational modules |
| Work | Personal decisions and messages | workflow, notification | target modules |
| Administration | Governance and administration | identity, organization, configuration, audit, documents, integration | workflow, notification |

## 4. Global application shell

### 4.1 Navbar

The permanent top bar shall contain:

- Hidra product identity;
- active environment / organization / site context where available;
- global search;
- realtime connection indicator;
- My Tasks badge;
- notification center;
- language selector;
- user profile and sign-out actions.

The navbar shall not become a module-navigation bar.

### 4.2 Sidebar

The sidebar shall be collapsible and shall represent the following product hierarchy:

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

Actual visibility is computed as:

```text
visible navigation
    = stable product navigation model
      intersected with
      authenticated-user permissions/capabilities
```

Do not implement primary authorization with role-name checks inside React components.

## 5. Process-to-module composition

### 5.1 Network & Topology

Primary module: `topology`.

Core UX:

- network map;
- topology tree/graph;
- layer manager;
- pipeline/facility/equipment detail;
- asset inspector;
- map search;
- links to telemetry, alarms, incidents and engineering context.

### 5.2 Operational Monitoring

Primary modules: `telemetry`, `monitoring`.

Core UX:

- live operations overview;
- telemetry browser;
- reading quality/state;
- operating envelopes and thresholds;
- deviations;
- trends;
- topology-linked telemetry context.

### 5.3 Alarms

Primary module: `alarm`.

Core UX:

- active alarm console;
- alarm history;
- acknowledgement and supported lifecycle actions;
- filtering by severity/state/area;
- timeline and evidence;
- realtime updates.

### 5.4 Events & Incidents

Primary modules: `incident`, `leakdetection`, `hse`.

Core UX:

- incident register;
- incident command workspace;
- leak cases;
- HSE events;
- triage and response actions supported by the backend;
- evidence and timeline;
- workflow context.

### 5.5 Planning

Primary module: `planning`.

Core UX:

- planning periods;
- plans and versions;
- targets/nominations exposed by HidraAPI;
- approval context;
- planned-vs-actual comparison.

### 5.6 Integrity & Maintenance

Primary modules: `integrity`, `assets`.

Core UX:

- integrity assessments;
- inspections;
- asset condition;
- maintenance schedules/work orders;
- engineering history;
- risk/document context.

### 5.7 Metering & Custody

Primary module: `custody`; `party` remains supporting until its detailed bounded-context scope is explicitly validated.

Core UX:

- metering/fiscal records;
- measurement periods;
- transfer/reconciliation workflows exposed by the backend;
- business-party context where supported.

### 5.8 Intelligence

Primary modules: `risk`, `analytics`, `simulation`, `reporting`.

Core UX:

- risk views;
- analytics/KPIs;
- simulation scenarios/runs;
- reports/exports.

Derived intelligence shall not silently mutate source-of-truth operational state.

## 6. Workflow information architecture

Workflow shall not be treated only as an isolated sidebar module.

### 6.1 Global workflow workspace

```text
My Tasks
My Approvals / actionable tasks when supported
Delegated / escalated views only when supported
Completed
```

### 6.2 Embedded workflow panel

Business records may expose:

- current workflow state;
- current task and assignment;
- decision/action history;
- backend-supported actions;
- reason/comment;
- audit/correlation references.

The UI must not invent workflow states or actions. Available actions are driven by explicit HidraAPI contracts/metadata.

Workflow owns the decision process; target modules own their business facts.

## 7. Routing model

Primary frontend routes shall describe user intent, not backend package names.

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

Backend routes remain module/domain oriented under `/api/v1`.

## 8. Page patterns

| Pattern | Intended use |
|---|---|
| Operational Overview | Cross-domain attention and current-state summaries |
| Workbench List | Generic resource list/search/pagination |
| Entity Workspace | Complex operational/business record with tabs/context/timeline |
| Topology Workspace | Map + layers + asset inspector + contextual overlays |
| Alarm Console | Dense operational alarm lifecycle view |
| Task Workspace | Workflow/task queue and target context |
| Timeline / Evidence | Chronological decisions, events, comments, documents and audit references |

Quick inspection may use a contextual drawer. Complex operational records shall use full entity workspaces. A permanent global right panel is not required.

## 9. Generic workbench rule

HidraAPI exposes generic operational workbench endpoints for module/resource discovery, list, detail and search.

Use them for:

- secondary/reference resources;
- administration;
- backend capability discovery;
- early generic coverage.

Do not use them as the final UX for:

- network topology;
- alarm console;
- incident response;
- planning;
- workflow tasks;
- simulation;
- high-frequency operational monitoring.

## 10. Topology-centered navigation

Topology is both a primary work area and a shared context.

Rules:

- asset-linked records should provide a `Show on map` affordance when geometry/context exists;
- map selection should open an inspector without discarding network context;
- overlays must be permission-aware and independently controllable;
- MapLibre GL JS is the preferred rendering engine behind a Hidra-owned map abstraction.

## 11. Search and operational context

HidraWeb shall distinguish:

- global search across supported indexed/domain resources;
- contextual search within the current process;
- persistent operational context such as selected site/area where supported.

Search results route to stable frontend routes, not raw backend URLs.

## 12. Localization and accessibility

Architecture requirements:

- i18n from the first implementation baseline;
- locale-neutral machine identifiers and enum values;
- RTL-safe shell/design-system capability if Arabic is activated;
- WCAG 2.2 AA target;
- severity/state must never be communicated through color alone;
- keyboard navigation and visible focus are mandatory.

Activated locale set is a product decision and shall not be inferred by implementation code.

## 13. Acceptance criteria

This information architecture is satisfied when:

- the primary sidebar does not mechanically enumerate all HidraAPI modules;
- every primary backend module has a documented frontend home or supporting role;
- permissions can remove routes/actions without rebuilding the application;
- workflow is available globally and contextually;
- topology context is accessible from asset-linked processes;
- generic workbench and specialized operational workspaces are distinct;
- frontend routes express user processes while backend routes preserve domain ownership.

## 14. Canonical relationship

This document is authoritative for HidraWeb navigation, process grouping, workspace hierarchy and frontend routing intent.

Supporting evidence/catalog documents may enumerate backend modules and endpoints, but they must not override this process-oriented information architecture.
