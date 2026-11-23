# HidraWEB — UI design-to-implementation alignment audit

**Assessment date:** 23 November 2026  
**Status:** SOURCE AUDIT / IMPLEMENTATION ALIGNMENT BASELINE; not a new roadmap, selection or visual acceptance.  
**Repository:** [CHOUABBIA-AMINE/HidraWEB](https://github.com/CHOUABBIA-AMINE/HidraWEB)  
**Exact audited frontend main SHA:** [a9fef03d45250ca5a145202fe3a87a65476c05c4](https://github.com/CHOUABBIA-AMINE/HidraWEB/commit/a9fef03d45250ca5a145202fe3a87a65476c05c4)  
**Source tree:** f34471fb4b007a1b2ecf7223c16e165eeb054c15  
**Authoritative sequencing:** [ULTIMATE_ROADMAP.md](../roadmap/ULTIMATE_ROADMAP.md), not this report.  

## 1. Purpose, scope and evidence discipline

Reconcile the owner's 19–20 November HidraWEB design workshop with actual routed, mounted React source and completed CI. This is an **implementation/source review**, not a pixel-perfect visual inspection, release test, backend qualification or operational SITE sign-off. No screenshots of a live deployed build were supplied; the application is under development. Implementation status must not be inferred from the existence of a route, generic register, Orval schema or successful CI alone.

**Design basis:** (a) *HidraWEB_Consolidated_UI_Design_Baseline_2026-11-19.md*, (b) *HidraWEB_Comprehensive_Discussion_Synthesis_2026-11-20(1).md*, and (c) *HidraWEB_Layout_and_Backend_Delivery_Roadmap_2026-11-22.md* supplied with the project discussion; compared with repository-owned [Information Architecture](HidraWeb-Information-Architecture.md), [Technical Architecture](HidraWeb-Technical-Architecture.md), [Design System](../10-Design-System-Specification.md), [Wireframes Brief](../11-Wireframes-Figma-Brief.md), [router](../../src/app/router/router.tsx) and [navigation registry](../../src/shell/navigation/navigationRegistry.ts). Design workshop files are **supporting sources, not adopted repository governance**.

**Source-based status vocabulary:** PRESENT = relevant UI source exists; PARTIAL = source supports some, but not all, approved experience; MATERIAL/MAJOR GAP = concrete source-to-target discrepancy; VISUAL UNVERIFIED = no accepted cross-device/rendered design proof. All rows are source assessments and remain subject to owner acceptance. **No 19/19 visual-conformance claim** is made.

**Design-source reconciliation:** The 19 November consolidated baseline labels most page-specific compositions *TO DESIGN*, with a sample Overview layout explicitly a **proposal**, whereas the later 20 November synthesis reports **19 numbered workspaces approved**, plus two distinct anchors. Interpret the latter as approval of their **covered navigation/workspace intentions and discussed patterns**; it does not retroactively convert every page into an approved high-fidelity wireframe or waive the former document's specific unapproved details. The registered UXR-35 task authorizes scope-safe **quick navigation first** for Overview. It does not authorize invented global counters, alerts, AI decisions or search.

**Safety constraints:** GZ2/gas-first is a design lens, not invented operational data. No live SCADA, plant control, hydraulic solver, qualified synoptic bindings or production deployment is assumed. HidraAPI retains authorization, owner decisions, units, temporal provenance and industrial source truth.

## 2. UXR-21 exact-SHA acceptance reconciliation

- UXR-21/A (Organization) repair **6d4bae110c89dcbf37cd1578f8ad6830ba39dcc2** passed [Code CI #1099](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45163926323) and [Documentation Validation #135](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45163926309).
- UXR-21/B (Identity & Access) original implementation **bb28ee44c6babecfd9927b9e3b5b62a4a7872da6** failed [Code CI #1100](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45166161923) at two outdated mocked Chromium assertions. Its exact-scope browser-test repair **a9fef03d45250ca5a145202fe3a87a65476c05c4** passed [Code CI #1101](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45167847654) and [Documentation Validation #137](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45167847651) on **a9fef03d45250ca5a145202fe3a87a65476c05c4**, including the verify job, A1 native API/PostgreSQL and F18 LOCAL jobs.
- Therefore **UXR-21/A and UXR-21/B are CI-PASSED for registered development acceptance**; parent **UXR-21 has passed its A/B development gates**, but neither page is certified visually complete, deployed, production-ready or SITE accepted.
- The canonical roadmap remains append-only. This report makes no new source-implementation claim or task-status transition beyond the independently observed exact-SHA gates.

## 3. Seven shared layout component families

| Family | Source alignment | Verified source behavior and remaining gap | Source / registered follow-up |
|---|---|---|---|
| Global Header | PARTIAL | Fixed header; brand, environment, context selector, web-origin connectivity, language, profile and conditional task/notification shortcuts. Global search field is disabled; connectivity is not live SCADA. | src/shell/navbar/HidraNavbar.tsx; UXR-05, UXR-07; later scoped search decision |
| Navigation Sidebar | PARTIAL | Six process groups with 272/72 px widths, one expanded group and permission-module filtering. Workspace rows still show icons, contrary to the approved six-top-level-icons-only hierarchy. | src/shell/sidebar/HidraSidebar.tsx; src/shell/navigation/navigationRegistry.ts; G2 visual follow-up |
| Workspace Heading & Toolbar | PARTIAL | Shared source components provide breadcrumbs, factual status, scoped actions, tabs/filters. Application-specific pages do not consistently compose them (e.g. Administration uses raw Typography and multiple full-width form sections). | src/shell/workspace/WorkspaceHeading.tsx; WorkspaceToolbar.tsx; page-level tasks |
| Main Workspace Canvas | PARTIAL | Reusable map/synoptic/summary/register/trend-detail/editor variants exist; many current pages use local MUI Paper/Tabs/Tables instead of the intended specialized composition. | src/shell/workspace/WorkspaceCanvas.tsx; UXR-22–35 |
| Context Inspector / Right Drawer | PARTIAL | Reusable route/principal/grant/scope-keyed provider and map inspector exist; uniform 420 px selection/view restoration and owning-page adoption lack visual-device acceptance. | src/shell/context/ContextDrawerProvider.tsx; src/features/topology/NetworkTopologyPage.tsx; UXR-22–35 |
| Contextual Evidence / Trends | PARTIAL | EvidenceTimeline, StatusWithProvenance and TrendQualityPanel exist and are consumed in selected workspaces; approved progressive summary → evidence → owner workspace is not demonstrated for all relevant paths. | src/shell/evidence/EvidenceTimeline.tsx; src/features/telemetry-monitoring/TelemetryMonitoringPage.tsx; UXR-24/29–35 |
| Global Overlays / Feedback | SOURCE EXISTS / VISUAL REVIEW OPEN | ReviewDialog, OwnerFeedbackBanner, safe route status and overlay components are present; detailed standalone overlay visuals were not approved in the earlier workshop and cross-workspace device/keyboard verification remains UXR-36/39. | src/shell/overlay/ReviewDialog.tsx; src/shell/feedback/OwnerFeedbackBanner.tsx; UXR-19, UXR-36/39 |

## 4. Global Header — all ten design elements

Source: [HidraNavbar.tsx](../../src/shell/navbar/HidraNavbar.tsx), [AppShell.tsx](../../src/shell/AppShell.tsx), [headerShortcutAccess.ts](../../src/shell/navbar/headerShortcutAccess.ts).

| Element | Assessment | Evidence / qualification |
|---|---|---|
| Sidebar toggle | Present | HidraNavbar -> ShellNavigation; responsive sidebar |
| HIDRA identity/home | Present | Brand link to /overview |
| Environment | Present | Configured environment chip; not deployment-readiness proof |
| Operational context | Present with scope caveat | OperationalContextSelector; selection is not an authorization grant |
| Global search | Disabled placeholder | Disabled TextField; Topology-local search is NOT a global search API |
| Realtime/connection | Partial | useWebOriginConnectivity checks web-origin reachability, not SCADA, telemetry freshness or a domain realtime stream |
| My Tasks shortcut | Conditional | resolveHeaderShortcuts(permissions), absent grant means disabled; no sourced global badge count |
| Notifications shortcut | Conditional | Same permission-based shortcut; no global unread badge asserted |
| Language | Present | FR/EN/AR selection; full visual RTL across all pages not proven |
| User profile/session | Present | Principal label, authentication source, sign-out; no full profile editor asserted |

**Interpretation:** 7 elements are represented by actual controls, two shortcuts are conditionally active, and the global search field is a disabled placeholder. Even a visible control is not proof of its complete approved workflow. In particular, browser reachability, telemetry quality, SCADA connectivity and realtime industrial state are different concepts.

## 5. Six navigation groups and access behavior

Source: [router.tsx](../../src/app/router/router.tsx), [navigationRegistry.ts](../../src/shell/navigation/navigationRegistry.ts), [HidraSidebar.tsx](../../src/shell/sidebar/HidraSidebar.tsx).

| Approved group | Actual registered destinations | Source observation |
|---|---|---|
| Overview | /overview | Registered + visible base route; existing technical landing page; not yet approved operational overview |
| Operations | /network; /operations; /alarms; /events; /planning | Registered; items filtered by authorized module; active view can remain legacy/partial |
| Engineering | /engineering; /engineering/assets; /custody | Registered; nested Assets submenu implemented with independent module filtering |
| Intelligence | /intelligence/risk; /intelligence/analytics; /intelligence/simulation; /intelligence/reports | Registered; several screens still use generic workbench-backed registers |
| Work | /work/tasks; /work/notifications | Registered; Tasks has workflow interactions; Notifications currently a generic record view |
| Administration | /administration/organization; /administration/users; /administration/parties; /administration/configuration; /administration/audit; /administration/documents; /administration/integrations | Registered and module-filtered; UXR-21 read/command improvements exist but final visual arrangement not accepted |

- Root path redirects to **/overview**. Successful login normally navigates there, except for an accepted return-to-protected-destination flow; **the landing Overview is the old technical/shell dashboard, not the approved future operational home**.
- The permission-aware sidebar derives visible groups from published module capabilities; protected record existence and commands still require effective owner permission and server-side enforcement. A direct route alone does not grant data access.
- The sidebar is 272 px expanded / 72 px collapsed and supports a one-open-group accordion, including the Engineering → Assets level. **Remaining source mismatch:** it renders an icon on each workspace item rather than limiting pictographic icons to the six top-level group entries. Collapsed-group icon behavior should be verified against the approved design before claiming parity.
- Auxiliary **/workbench** is an authenticated, secondary generic resource workspace; it must **not** be counted as an extra numbered business workspace or substituted for specialized views. Physical asset/equipment subtrees remain inside the owning workspace.

## 6. All nineteen numbered workspaces

**Method:** route presence was verified against the live router, page/source composition against the actual imported page, and design intention against the supplied 20 November synthesis and registered UXR ownership. These are not signed UI walkthroughs.

| Work area / workspace | Route | Source alignment | Current actual component and material gap | Registered follow-up |
|---|---|---|---|---|
| WS-01 Overview | /overview | MAJOR GAP | OverviewPage: environment, authentication mode, permission-route and module counters; workbench link. No authorized attention/My Work/network snapshot design. | UXR-35 (P7); cross-domain indicators conditional on scope-safe owner contracts |
| WS-02 Alarms | /alarms | PARTIAL | AlarmConsolePage: active/history tables and owner commands; lacks validated final console density/filter/layout interaction and visual comparison. | UXR-29 (P7) |
| WS-03 Events & Incidents | /events | PARTIAL | IncidentWorkspacePage: Incident/Leak/HSE owner lists and detail; combined case investigation, differentiated evidence and source-linked cross-owner navigation need UI validation. | UXR-29 (P7) |
| WS-04 Planning | /planning | PARTIAL | PlanningWorkspacePage: periods/plans/revisions/approval with PlannedVsActualPanel; target versioned plan review and qualified comparisons unaccepted visually. | UXR-29 (P7) |
| WS-05 Integrity & Maintenance | /engineering; /engineering/assets | PARTIAL | EngineeringIntegrityMaintenanceProcess passes contextual panel into two existing Integrity/Assets pages; mature source forms exist, not proven cohesive assessment+maintenance journey. | UXR-25 (P6) |
| WS-06 Metering & Custody | /custody | PARTIAL | CustodyWorkspacePage has four local tabs: Measurement Periods, Transfer Tickets, Discrepancies & reconciliation, Reference context; target evidence and record-to-record context needs review. | UXR-30 (P7) |
| WS-07 Risk | /intelligence/risk | MATERIAL COMPOSITION GAP | RiskWorkspacePage combines workbench records and RiskAuthoringPanel, not yet the approved qualified risk visualization, inspector and decision-evidence composition. | UXR-31 (P7) |
| WS-08 Analytics | /intelligence/analytics | MATERIAL COMPOSITION GAP | AnalyticsWorkspacePage uses workbench-backed tabs and AnalyticsExecutionPanel; target KPI/trends, lineage/quality and source-owned results visualization not qualified. | UXR-31 (P7) |
| WS-09 Simulation metadata | /intelligence/simulation | PARTIAL / SOLVER DEFERRED | SimulationWorkspacePage and SimulationOrchestrationPanel exist for model/scenario/run metadata; neither solver execution nor qualified engineering results established. | UXR-32 (P7); P3 numerical explicitly deferred |
| WS-10 Reports | /intelligence/reports | MATERIAL COMPOSITION GAP | ReportingWorkspacePage uses workbench-backed definitions/requests/runs/outputs plus lifecycle panel; scoped governed content/owner evidence not yet full UX. | UXR-32 (P7) |
| WS-11 My Tasks | /work/tasks | PARTIAL / STRONG FOUNDATION | WorkflowTasksPage uses WorkspaceHeading, Toolbar, Canvas, action panels, backend available actions and evidence timeline; full target decision/return/context acceptance pending. | UXR-33 (P7) |
| WS-12 Notifications | /work/notifications | MATERIAL COMPOSITION GAP | NotificationCenterPage is workbench-backed record table, not verified bounded personal inbox/detail/acknowledgement experience. | UXR-33 (P7) |
| WS-13 Organization | /administration/organization | FUNCTIONAL / VISUAL GAP | UXR-21/A added guarded hierarchy, list, assignment history and context; page still stacks OrganizationCommandPanel, FoundationEmployeePanel and ResponsibilityPanel above tabbed records. | UXR-21/A CI passed; design composition follow-up under authorized later stage |
| WS-14 Identity & Access | /administration/users | FUNCTIONAL / VISUAL GAP | UXR-21/B added guarded pagination, user detail, roles, permissions and grants; page still stacks create/evaluation, lifecycle, grant forms above tabs. | UXR-21/B CI passed; design composition follow-up under authorized later stage |
| WS-15 Parties | /administration/parties | PARTIAL | PartyAdministrationPage exposes typed party search/profile/roles/history and authoring but does not demonstrate the approved register/inspector hierarchy on actual devices. | UXR-34 (P7) |
| WS-16 Configuration | /administration/configuration | PARTIAL | ConfigurationAdministrationPage provides guarded choices/effective values/feature-flag editor; normalized catalog browser and visual states not accepted across visibility/scope. | UXR-34 (P7) |
| WS-17 Audit | /administration/audit | MATERIAL COMPOSITION GAP | AuditWorkspacePage uses generic audit record discovery and export request; timeline/trace inspector and independently scoped exports need qualified UI evidence. | UXR-27 (P6) |
| WS-18 Documents | /administration/documents | PARTIAL | DocumentsAdministrationPage uses owner commands, workbench records and FileEvidencePanel; full controlled-document version/link acceptance journey needs UX check. | UXR-34 (P7) |
| WS-19 Integrations | /administration/integrations | MATERIAL COMPOSITION GAP | IntegrationMonitoringPage currently shows generic workbench monitoring records; bounded synthetic exchange replay and owner-specific investigation are not proven as integrated UI. | UXR-34 (P7) |

## 7. Both separately approved operational anchors

| Anchor | Route | Source alignment | Actual source and remaining qualification | Registered stage |
|---|---|---|---|---|
| Network & Topology anchor | /network | PARTIAL / REGIONAL WORK PENDING | NetworkTopologyPage contains HidraMap, MapLayerExplorer, MapLegend, TopologyInspector and optional synthetic preview/authoring mode. Current shown reader uses legacy map paths; scoped regional data/complete pagination, qualified connectivity and Standard/Satellite provider choice remain unqualified. | UXR-22 then UXR-23; UXR-22–23 graph/dossier items |
| Operational Monitoring anchor | /operations | MAJOR COMPOSITION GAP | TelemetryMonitoringPage selects a point ID manually and renders latest/history/trend, rules and deviations; it is not the approved System → Station → Equipment synoptic with revision-qualified commissioned bindings. | UXR-24; station synoptic only with owner revision/point binding evidence |

**Explicit boundaries:** A MapLibre instance and a synthetic preview do not prove a complete regional map or published physical topology; a point-ID reading/trend does not prove station-wide monitoring or a qualified historical state. Standard/Satellite imagery is provider-dependent and cannot be fabricated. Network asset selection must use owner-issued IDs, including the scoped GeoJSON entity identifier where that C1 contract is selected.

## 8. Cross-workspace source-to-design gaps and priority

| Priority for design reconciliation (not execution order) | Gap / evidence | Correct handling within current governance |
|---|---|---|
| HIGH | Default **/overview** is a technical-status dashboard, not an authorized operational entry point with work priorities and safe navigation. | Register/deliver scope-safe quick navigation under **UXR-35**, preserving the existing P6/P7 queue. Attention summaries require an expressly named authorized owner source; no fabricated counts. |
| HIGH | Sidebar presents extra workspace icons relative to the six top-level-icon design. | Record a targeted design-conformance correction for approval; do **not** silently reopen CI-passed UXR-06 or alter global navigation as part of unrelated Topology work. |
| HIGH | WS-13 Organization and WS-14 Identity pages expose real protected records and commands but stack forms above local tabs rather than the planned register/tree + selected-record / contextual action UX. | Preserve CI-passed **UXR-21** behavior, security, local credential clearing and grant invariants. An explicitly scoped follow-up must define the visual redesign and safe incremental migration. |
| HIGH | Network C1 spatial/physical evidence and Operational Monitoring System → Station → Equipment layout are unqualified in the current web. | Execute **UXR-22** next when selected, then registered **UXR-23/24**; no guessed physical connection, calibration, industrial reading or solver. |
| MEDIUM | Specialized Risk, Analytics, Reports, Audit, Notifications and Integrations still rely materially on generic register/detail patterns. | Use their **UXR-27/31–34** registered stages to compose authorized source-derived owner views. |
| MEDIUM | Heading, toolbar, inspector and evidence components exist but are not universally adopted in the examined workspaces. | Make a per-workspace layout checklist part of the selected task's acceptance; do not rewrite completed development history. |
| ACCEPTANCE | Screens have source and CI evidence, not a recorded cross-workspace pixel/keyboard/scope-driven user walkthrough. | **UXR-36** accessibility/device/RTL, **UXR-37** security, **UXR-38** performance and **UXR-39** final 7/10/6/19+2 coverage; distinguish these from development CI. |

## 9. Auditable upcoming UI acceptance checklist

For **each** selected future task or separately approved design-remediation package, preserve the task's explicit source scope and check:

1. **Current-source alignment:** link exact frontend SHA, applicable API machine pin and owning workspace; distinguish local display projection from persisted owner data.
2. **Design layout:** global shell unchanged; two-row maximum local heading/toolbar, expected page family, responsive density and accessible keyboard flow. Only show contextual inspector and evidence panel where justified.
3. **Authority:** route/permission admission, current principal/scope, same-grant disjoint-company examples, protected count/record/geometry redaction, stale selection invalidation, no direct-route bypass.
4. **Evidence semantics:** status/timestamp/timezone/quality/units/basis/revision/source shown where the owner supplies them; UNAVAILABLE, CONFLICT, DENIED and pending states never presented as normal or zero.
5. **Real journeys:** search/filter/page/inspect/return, authoring review/confirmation, server conflict and durable readback only where relevant; responsive and FR/EN/AR/RTL; avoid raw exception output.
6. **CI and source proof:** tests tied to correct backend/API contracts, code/build/browser and any native HTTP/PostgreSQL acceptance appropriate to scope; runtime visual/device review is separately recorded, not invented.

Do **not** add these as a new universal release gate to historical completed tasks without owner-approved governance adoption. They are a scoped audit recommendation and an input to each *future* registered task envelope.

## 10. Disposition and next authorized step

**This audit is documentation-only.** No runtime React, routing, permission, API contract, CI workflow, migration, numerical simulation, release or deployment file is changed. It does not replace the canonical roadmap, create a new stage or modify the order of the existing UXR IDs. Audit counts: **7 layout families, 10 header elements, 6 sidebar groups, 19 numbered workspaces and 2 anchors reviewed at source level**. **No final visual-conformance acceptance** can be claimed from this alone.

**Next registered execution candidate:** P6 / **UXR-22 · Network & Topology**, which is **not selected or started by this audit**. Confirm its implementation envelope and acceptance using refreshed main and API evidence on a later owner **Next**. The separate visual treatment of Overview remains UXR-35 unless the owner explicitly approves a governance change.

**Source limitations:** No running deployed site/device screenshots, user-session access, actual route permission set for a live person, industrial survey data, plant measurements, production data, or comparison with Figma high-fidelity rendering was inspected. The supplied design syntheses contain the intentions but cannot substitute for proof of final visual acceptance.
