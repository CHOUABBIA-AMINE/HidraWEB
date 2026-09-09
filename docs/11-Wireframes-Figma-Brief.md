# 11 — Wireframes & High-Fidelity Mockups Brief

Native Figma project generation is unavailable in this environment. This document is the Figma creation brief.

Architecture authority:

- [`architecture/HidraWeb-Information-Architecture.md`](architecture/HidraWeb-Information-Architecture.md)
- [`architecture/HidraWeb-Technical-Architecture.md`](architecture/HidraWeb-Technical-Architecture.md)

## Required frames

1. **Authentication / session entry** — Hidra identity, language selection and authentication flow as supplied by the active `AuthProvider`/backend environment. Do not invent a local username/password endpoint when HidraAPI does not expose one.
2. **Overview** — cross-domain attention view linking to alarms, incidents, monitoring, topology, tasks and intelligence summaries that are actually supported by backend contracts.
3. **Network & Topology** — MapLibre-based network workspace with layer tree, search, legend, asset inspector and supported realtime overlays.
4. **Operational Monitoring** — telemetry/monitoring workspace with readings, quality/state, deviations and trends according to available APIs.
5. **Alarm Console** — dense alarm list/console, filters, detail/inspector and backend-supported lifecycle actions.
6. **Events & Incidents** — incident-response workspace combining incident, leak detection and HSE context without changing backend ownership.
7. **Planning** — plan/list/detail/version/approval context according to implemented planning and workflow contracts.
8. **Integrity & Maintenance** — integrity and asset/maintenance context.
9. **Metering & Custody** — custody workspaces with party context only where supported.
10. **Intelligence** — risk, analytics, simulation and reporting workspaces.
11. **My Tasks / Workflow** — global task queue plus embedded target context; exact states/actions must remain backend-driven.
12. **Administration** — identity/access, organization, configuration, audit, documents and integration workbenches.
13. **Generic Workbench** — reusable secondary/admin resource list/detail/search experience using HidraAPI workbench APIs; this is not the default UX for every operational process.
14. **Profile / Preferences** — session details available to the frontend, language and user preferences.

## Figma components to create

- Navbar.
- Collapsible process sidebar.
- Breadcrumbs.
- Operational status/realtime indicator.
- Workbench data grid.
- Entity workspace header.
- Context/detail drawer.
- Workflow/action panel.
- ProblemDetail/error feedback.
- `HidraMap` frame using MapLibre visual behavior.
- Layer tree and map legend.
- Timeline/evidence component.
- Status/severity component with non-color cues.
- Notification center.
- My Tasks indicator/workspace.

## Layout rule

Permanent shell:

```text
Navbar
Collapsible sidebar
Main workspace
```

Contextual right-side drawer is used only when a screen requires inspection/actions. Do not reserve a permanent right panel that reduces map/grid workspace.

## Navigation rule

Wireframes must use process-oriented routes and labels such as:

```text
Network
Operations
Alarms
Events & Incidents
Planning
Integrity & Maintenance
Metering & Custody
Intelligence
Work
Administration
```

Do not design the main sidebar as a literal list of all HidraAPI modules.

## Evidence rule

No interaction, action, workflow state, topology layer or backend field shall be shown as implemented unless it is supported by HidraAPI evidence or explicitly labeled as a target/gap.
