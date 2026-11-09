# HidraWEB production-first delivery roadmap

**Status** — Evidence-based delivery proposal. Canonical repository governance controls registration and execution.  
**Version** — Draft 1.1 / 2026-11-08  
**Target:** HidraWEB + HidraAPI (gas-first / pilot GZ2)  
**Basis** — Draft 1.0, Hidra project sources, canonical WEB and API records, selected source files and GitHub Actions at the inspected SHAs.  
**HidraWEB main inspected:** `7fef9c042052bc2a326b15a103e5ee3d35df1db4`  
**HidraAPI main inspected:** `70490d28e1a290a14578c2fc6320d242b4a76ec3`  
**Governance** — WF-01–WF-28 remain planning aliases. The nine original deliverables are retained as a portfolio. This revision proposes a smaller first release and requires separately registered execution and owner-authorized staging and promotion.

## 0. First release decision

**Proposed first production scope — GZ2 alarm acknowledgement and readback.** An authorized operator signs in, opens an existing scoped GZ2 alarm from the Alarm Console, reviews its authoritative asset/source context, acknowledges it once, and reloads to see persisted state, actor and time. Reuse the current console, generated contract types and existing routing. Treat acknowledgement as a human operational record. Pressure recovery, incident closure and physical response each require their own evidence.

The existing pressure-deviation investigation remains the product direction. Add its measurement/deviation panel to the first release only if exact reference semantics and per-resource authorization pass within the same bounded scope. A generic `sourceReferenceId`, an asset filter, and a reading near the alarm time are insufficient to establish an owner-published pressure-deviation link. Use the label **GZ2 alarm acknowledgement** when the qualified feature is the narrower journey. If safe alarm read/write scope or usable authoritative asset context cannot be proven, hold the candidate and register the smallest responsible gap.

This proposal gives priority to the first **supportable release**. Qualify one native workflow, rehearse it on the production-shaped staging configuration, and obtain explicit go/no-go before promotion. Product breadth follows separately. Optimization starts with measurements from the verified workflow and a specific regression or operational problem.

**First-release scope exclusions** — Role-wide home redesign, global search, new realtime delivery, broad analytics, physical graph/surveyed-route editors, incident/leak/HSE commands, workflow approvals, additional alarm actions and broad administration are outside the new release claim. Simulation/P3, calibration, live SCADA and OT actuation remain deferred under owner policy. The release profile must restrict operator access to the qualified actions and data at the server. Any existing surface made available to that role must have an explicit release disposition.

## 1. Verified baseline and non-negotiable boundaries

### 1.1 Current WEB implementation examples

| Item | Source location | Evidence-based observation |
|---|---|---|
| Navigation | `src/shell/navigation/navigationRegistry.ts` | Navigation grouped by functional area |
| Overview | `src/app/pages/OverviewPage.tsx` | Environment, authentication, permissions and backend-module counts dominate |
| Telemetry | `src/features/telemetry-monitoring/TelemetryMonitoringPage.tsx` | `pointId` manual input, query-first readings/history/trend/deviations |
| Events | `src/features/incident/IncidentWorkspacePage.tsx` | Tabs for incident/leak/HSE; primarily list/detail queries |
| Alarm | `src/features/alarm/AlarmConsolePage.tsx` | Real ACK, close, shelve/unshelve/suppression and reference links |
| Workflow | `src/features/workflow/WorkflowTasksPage.tsx` | Backend-published task actions, version-bound transition command, timeline |
| Planning | `src/features/planning/PlanningWorkspacePage.tsx` | Revision, approval actions and planned-vs-actual context alongside registers |
| Engineering | `src/processes/engineering/EngineeringIntegrityMaintenanceProcess.tsx` | Wraps asset/integrity pages with reference context; no entire investigation lifecycle |
| Intelligence | `src/features/{risk,analytics,simulation,reporting}/` | Mixed records and discrete authoring/execution panels |
| Global shell | `src/shell/navbar/HidraNavbar.tsx` | Search, task and notification shortcuts currently disabled; responsibility selector exists |

**Accepted foundation** — Accepted HWEB-F11/W1 through F15/A1 six-module foundation. The A1 source acceptance on 2026-11-07 references WEB `c6a44faa80a74871dc31c5c1e4ada2d1c05863ac`, backend `5817406923e53761577ac41bbc3f318b517c3977`, WEB Code #1033, genuine browser/JWT/PostgreSQL synthetic evidence and 10/10 native cases. Its exclusions cover Workflow-approved Organization responsibility changes, appointment end/transfer, combined production-role privileges, deployment/SITE, live OT, numerical solving and release acceptance. Do not reopen accepted foundation behavior without a separately scoped defect.

**Testing gap** — `tests/e2e/critical-operational-journeys.spec.ts` proves UI transitions using mocked business HTTP routes, **not** a native persisted operational sequence. `tests/e2e/foundation-integrated-live.spec.ts` and `foundation-workflow-live.spec.ts` are native but narrower foundation scenarios.

### 1.2 What the refreshed evidence changes

| Evidence | Finding | Roadmap consequence |
|---|---|---|
| WEB `7fef9c042052bc2a326b15a103e5ee3d35df1db4` | [Code CI #1034](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42463226504) completed successfully, including its A1 native job and verify job. The commit preserves LF for pinned contract snapshots. The native job qualifies its own immutable backend pin. | Reuse A1 and the CI harness. Qualify the selected WEB/API release pair and the new alarm journey separately. |
| API `70490d28e1a290a14578c2fc6320d242b4a76ec3` | [Full CI #1145](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536476) and [Docs #937](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536750) completed successfully. The Full Verification Gate, API contract/dictionary job and 14 PostgreSQL shards passed. [The HAPI-929 ledger](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/doc/roadmap/TASKS_HPS-001.md#hapi-929--implement-rotating-identity-refresh-tokens) still requires independent whole-task acceptance and security/HTTP evidence review. | LOCAL refresh/logout is implemented in backend source and opt-in, with formal acceptance outstanding at the inspected SHA. Admit automatic refresh only after accepted API evidence and a separate registered WEB consumer qualification if the selected session policy needs it. |
| Existing WEB auth | [AuthProvider](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/src/app/auth/AuthProvider.tsx) and [authentication gateway](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/src/app/auth/authenticationGateway.ts) show existing provider-specific paths. The reviewed WEB consumer contains no LOCAL rotation path. | Qualify the selected provider's login, expiry, reauthentication and logout/revocation behavior. If the target permits explicit reauthentication and its expiry/revocation policy passes, keep refresh outside the first release. |
| Canonical WEB governance | [Canonical roadmap](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/roadmap/ULTIMATE_ROADMAP.md) records A1 acceptance and no subsequent registered implementation delivery in the adopted six-module supplement. HWEB-F02/F03 editor blockers belong to the engineering track. | Reconcile the new proposal explicitly with canonical priority. Reuse the accepted foundation and existing readers. No next-stage implementation can proceed on a WF alias. |
| Prior release work | [HWEB-P11/P12 records](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/roadmap/HidraWEB-Post-Reconciliation-Product-Roadmap.md) establish contextual links and historical release hardening. [Product-phase UAT record](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/deployment/HidraWEB-Staging-UAT-Product-Phase.md) shows staging/UAT pending for that candidate. | Reuse the release and UAT procedures. Record evidence for the exact new artifact and environment. |

### 1.3 Architectural constraints

- Domain business state and lifecycle remain in **HidraAPI**; no frontend business-state machine or shadow persistence. Web may keep transient navigation/UI selection, not fabricate durable workflow facts.
- Company/resource scope, authenticated actor and entitlements are checked on the **server on every protected read and write**; do not use the React role label as authorization.
- Use accepted OpenAPI/Orval types, generated clients where available, and existing typed transport adapters and normalizers; new endpoint names in this plan are **not** claims of existing routes. New API DTO/permission/response semantics require separate HAPI ownership and source qualification.
- Never infer cross-domain relationships from shared timestamps, similar names, asset labels or unsupported IDs. Render an explicit **no confirmed linkage** state when the owning API does not publish a relationship.
- Preserve expected version / `updatedAt`, conflict recovery, approval reason/actor, evidence IDs, timeline and audit semantics. Distinguish observation, rule/deviation, alarm, incident, recommendation, decision and measured outcome.
- Realtime is not assumed. The existing HTTP query and manual refresh model is valid until a real backend event family and delivery contract are published.
- Any simulation UI remains **metadata/lifecycle only** until independently accepted numerical capability and owner approval. No calculated hydraulic decision, certification or plant action may be portrayed as established.

## 2. User roles and primary business journeys

Roles are **UX personas**, not security role names or authorization grants.

| Persona | Starting point | Target journey | Source owners |
|---|---|---|---|
| Pipeline operator | Assigned operating scope or alarm | Observe → investigate → acknowledge/respond → record outcome | Organization, Topology, Telemetry, Monitoring, Alarm, Incident, Workflow, Audit |
| Shift supervisor / validator | Assigned pending decision | Evidence review → permitted APPROVE/REJECT → history | Workflow + exact business target owner |
| Integrity engineer | Network equipment / condition | Inspect asset → assess integrity → relate risk/docs → request maintenance | Topology, Assets, Integrity, Risk, Documents, Workflow |
| Planner | Plan period / target | Draft/revise → approval → planned-vs-actual → discrepancy follow-up | Planning, Workflow, Monitoring, Custody |
| Custody specialist | Measurement period / transfer | Ticket → inspect observations/parties → reconcile discrepancy → evidence/approval | Custody, Party, Telemetry, Workflow, Documents |
| Security/organization administrator | Person/company/scope | Establish identity/appointment/party/resource → governed effective access | Identity, Organization, Party, Configuration, Workflow, Audit |
| Analyst / decision support | Authorized operational object | Review qualified data → risk/analytics → report; simulation metadata optional | Risk, Analytics, Simulation, Reporting, Documents, Audit |
| Integration support | External exchange/job failure | Inspect source, message, status, retry evidence where supported | Integration, Notification, Audit |

Every journey must provide a transparent result when a module is unavailable, source evidence is missing, access is denied, or a lifecycle transition is unsupported.

## 3. Delivery sequence

| Order | Stage | Minimum deliverable | Exit evidence |
|---|---|---|---|
| 1 | Contract and security preflight | Narrow WF-01–03 to the Alarm Console, selected login path and actual GZ2 alarm context. Start with read/write resource isolation, actor attribution, expected rejection semantics and authoritative readback. | Exact source and wire matrix, allowed/denied fixture plan, disposition for each required operation and explicit first-release scope. |
| 2 | One operator journey | Use the existing alarm entry and action. Select only the small parts of WF-05/07/10/11 needed for safe context, acknowledgement and readback. Verify any required API gap through its owning module first. | One bounded operator path, zero required manual technical IDs, honest unavailable states, and native checks built alongside it. |
| 3 | Native qualification and release candidate | WF-26 for the admitted journey and the release-critical part of WF-28. Use a source-pinned browser/API/Flyway/PostgreSQL run and immutable WEB/API artifact pair. | Exact-SHA Code/Full/Docs CI where applicable, native decision/readback/negative evidence, manifest and measured release checks. |
| 4 | Staging/UAT and promotion decision | Rehearse the exact candidate, including same-origin proxy, identity, privilege layout, manual operator acceptance, recovery and rollback. Stage and promote only with explicit owner authority at each boundary. | Environment-owned smoke/UAT record, known-good rollback evidence, support ownership and explicit go/no-go. |
| 5 | Product expansion | Deliver qualified pressure-deviation context, relevant incident/workflow branches, engineering, planning/custody, governance and intelligence according to registered priority and operator need. Extend native coverage with each new critical write. | Each increment has its own accepted contract, durable behavior, security tests and scoped release disposition. |
| 6 | Optimization based on measurements | Prioritize latency, bundle size, polling, map performance or navigation work when release evidence or operator findings show a concrete problem. | Comparable before/after results and preserved authorization, correctness and release budgets. |

The first-release critical path is **preflight → scoped acknowledgement → native acceptance → immutable candidate → owner-authorized UAT and promotion**. Existing evidence can close preflight rows. A proven release-blocking defect takes precedence over new UX. WF-04, WF-06, general investigations and secondary journeys can follow the first release unless a specific release acceptance case requires them. Reuse the native harness from the start and complete WF-26 alongside the first slice.

**Sizing** — Estimate the first release after the preflight establishes the resource-authorization and fixture gaps. Size WEB changes, conditional API work and environment qualification separately. The broad portfolio estimate in Draft 1.0 is unsuitable for predicting a release date.

## 4. Nine deliverables and 28 proposed packages

All stages below are **proposals**. Before repository execution, select one package through the existing canonical roadmap/governance mechanism, refresh both main SHAs and CI, establish the exact task message/path allowlist, then implement and test one registered whole task. The ordering in section 3 takes precedence over portfolio grouping. Dependencies within each package apply to its full scope. A bounded first-release selection must record any narrower scope and satisfied dependencies explicitly. Do not interpret planning aliases as existing HWEB IDs.

### D01 — Contract and journey baseline (P0)

**Outcome** — One operator use case with documented contracts, authority and qualified relationships.

**WF-01 | Source and reuse inventory**  
Owner — WEB lead with API reviewer. Depends — none. Targets — `docs/roadmap/ULTIMATE_ROADMAP.md` (read-only unless explicitly registered), `src/app/router/router.tsx`, navigation registry, key `src/features/` pages, existing Playwright tests. Deliver — an evidence table tagging each in-scope screen as record browse, command, complete workflow or unsupported; preserved forms/map features and tests. **Acceptance** — no feature is called end-to-end solely because controller/CRUD endpoints exist; link evidence to exact source SHA; preserve accepted A1 and historical tasks.

**WF-02 | Exact contract admission matrix for first journey**  
Owner — API+WEB contract reviewers. Depends — WF-01. Targets — checked-in Orval sources, `src/features/*/api/*.ts`, backend current controller/query adapters, `Hidra-API-Web-Contract-v1.md`. Deliver — explicit per-hop method, request/response fields, resource scope, effective grant, optional relation ID, timestamp/version, problem response, test fixture, source artifact/checksum. **Acceptance** — each required operation categorized SUPPORTED+PROVED / PRESENT-NOT-QUALIFIED / GAP / OUT-OF-SCOPE; no guessed endpoints or trusted relationship joins; backend gaps create separate owner proposals, not silent WEB work.

**WF-03 | Journey specification, UX states and acceptance cases**  
Owner — product/industrial SME + WEB. Depends — WF-02. Deliver — scripted synthetic GZ2 alarm case and optional qualified pressure extension; entry points (scope/asset/alarm/task), screen hierarchy, backend lifecycle and allowed/denied actor rules; empty/stale/untrusted/missing-reference/conflict states; locale/keyboard acceptance. **Acceptance** — the primary path ends with authorized acknowledgement and independent readback. Explicitly disposition unsupported steps.

### D02 — Context for the first workflow, then role-based home

**WF-04 | Operator-focused overview after the first release**  
Owner — WEB. Depends — WF-03. Target — `src/app/pages/OverviewPage.tsx` and focused tests. Replace the four technical status tiles as the primary experience with **my assigned work, my scope, supported alert/condition entry points, recent authorized context**; retain diagnostics in secondary technical view if useful. **Acceptance** — operator can open a valid task or network context without entering a backend ID; denied actor sees no unauthorized entities/counts; pending/error/empty states are explicit; no inferred aggregate counters.

**WF-05 | Durable, reauthorized navigation context**  
Owner — WEB. Depends — WF-02 and the admitted entry route. WF-04 is optional for the first release. Targets — `src/features/context/components/OperationalContextSelector.tsx`, `src/shell/model/useShellUiStore.ts`, new focused `src/processes/operational/` context UI helpers where warranted, route-search mapping. Keep organization responsibility, selected network reference, optional alarm/deviation/incident/task IDs and source labels with explicit provenance from backend. Treat URL state as **untrusted**; reauthorize and refetch on landing. **Acceptance** — navigating/reloading restores only safe permitted selections, sensitive data not leaked to browser-persisted cross-user state, and denied/deleted references fail closed.

**WF-06 | Task/notification entry and contextual actions**  
Owner — WEB. Depends — WF-04..05. Target — `src/shell/navbar/HidraNavbar.tsx`, task and notification UI. Make shortcuts navigate to existing authorized pages when their capability is present; keep truly unavailable capabilities visibly disabled with useful explanation. Do not publish events, invent notification counts or claim realtime. **Acceptance** — keyboard-accessible task entry opens a real authorized task with deep-link context; unauthorized shortcuts cannot expose protected existence or count; screen-reader cues and logout/session changes behave correctly.

### D03 — Asset context first, qualified investigation next

**WF-07 | Asset-first network selection**  
Owner — WEB. Depends — WF-05. Target — `src/features/topology/NetworkTopologyPage.tsx`, existing map/search and panel components. Reuse MapLibre/network reader; selecting pipeline/system/station/equipment sets **a backend-published canonical reference** and opens a contextual work surface. Do not synthesize unverified geographic geometry. **Acceptance** — exact selected topology ID and authorized company/scope are preserved across route; map can remain query-first as secondary search; source-not-found and forbidden states are distinct.

**WF-08 | Contextual telemetry + monitoring**  
Owner — WEB with API review if a binding is absent. Depends — WF-07, admitted source from WF-02. Target — `src/features/telemetry-monitoring/TelemetryMonitoringPage.tsx`, APIs and trend view. Provide point selection by **verified asset-to-telemetry binding**, not by guessing or converting equipment code into point ID; show quality, trust status, source timestamp, freshness and measured unit. **Acceptance** — valid linked point shows latest/history/trend and monitoring deviations; if no trustworthy binding exists, UI presents **No qualified telemetry binding** and uses explicit permitted lookup, not fabricated pressure readings.

**WF-09 | Alarm/deviation relationship from explicit owner references**  
Owner — WEB. Depends — WF-08. Target — Telemetry, Alarm and Topology views. Expose published related alarm/deviation IDs, statuses and timestamps if provided by owners; do not infer causality or automatic conversion from threshold crossing to alarm. **Acceptance** — opening selected actual reference reaches the same persisted object; none/forbidden/unlinked states show zero invented relationships; filter respect permissions at API boundary.

**WF-10 | Investigation work surface**  
Owner — WEB. Depends — WF-07–09 for the full investigation. The first release can reuse existing Alarm Console context and native asset handoff. New `src/processes/operational/` composition component(s), invoked by existing `/operations`, `/network`, `/alarms` routes; adding a new route requires separate registration. Layout — physical context, measurements+quality, evidence/timeline, problem context, available next action. Keep UI state presentation-only. **Acceptance** — one admissible synthetic GZ2 case can be investigated in a continuous view using true owner record IDs; a single query failure degrades its own section without inventing other sections; no unqualified industrial recommendation appears.

### D04 — Alarm acknowledgement first, response branches later

**WF-11 | Scoped alarm acknowledgement**

WEB owns the UI and Alarm owns command semantics. For the first release, reuse the existing acknowledgement from `AlarmConsolePage.tsx` after WF-02/03 and only the applicable context work in WF-05/07/10. Use the backend's trusted actor, owner-approved target scope and currently supported request fields. Resolve any organization context from an authoritative approved choice when required. Prevent duplicate submits while in flight and reconcile an ambiguous network result through a fresh GET before offering another action. For independent readback, check alarm identity, state, actor and time. Verify repeated acknowledgement or terminal/concurrent actions against the actual Alarm contract. Qualify close, shelve and suppression separately.

**WF-12 | Incident/leak/HSE response composition**  
Owner — WEB + relevant API owner for exact commands. Depends — WF-11 and verified contract admission. Target — `src/features/incident/IncidentWorkspacePage.tsx`, existing incident/leak/HSE APIs, a thin event/response process. Add actual backend-supported incident-response, leak-escalation, HSE/CAPA/close actions as **separately qualified business branches**. **Acceptance** — only supported command+resource pairs are enabled; incident/leak/HSE remain distinct owners; source/case relation, response responsibility, actor and timestamps are read back; no invented auto-escalation or incident linkage. A missing linkage/approval producer becomes a registered API blocker, not a UI workaround.

**WF-13 | Embedded workflow decision and evidence timeline**  
Owner — WEB. Depends — WF-10/11 and independently published workflow target support. Reuse `WorkflowTasksPage.tsx` available-actions/timeline/transition behavior inside context; do not start a workflow for an unsupported owner/target family. Present decision, allowed step, comment/reason, exact current version, backend history and role-based action visibility. **Acceptance** — both permitted decision and denied/unrelated actor tested; stale `updatedAt` replay rejected and refreshed; approval neither forges nor silently mutates unrelated incident/alarm state. This is a later extension unless independently admitted for a separate release.

### D05 — Engineering, integrity and maintenance journey (P1)

**WF-14 | Asset/condition-to-integrity case**  
Owner — WEB with Assets/Integrity reviewers. Depends — WF-07, WF-02. Target — `src/features/assets/EngineeringAssetsPage.tsx`, `src/features/integrity/EngineeringIntegrityPage.tsx`, `src/processes/engineering/`. Start from authorized equipment/maintainable asset, inspect condition and published integrity references, view/create a supported assessment. **Acceptance** — no implied physical-asset/maintainable-asset equivalence; exact ID and revision/provenance are shown; newly created assessment persists and references the intended owner record where contract allows.

**WF-15 | Maintenance task progression**  
Owner — WEB + Assets owner. Depends — WF-14. Transform the existing work-order creation control into a contextual **condition → action request → available work order → follow-up** view, with only valid backend statuses. **Acceptance** — authorized creation/read-back, exact selected asset, ownership and source evidence visible; workflow task/approval shown only when truly related; no claim that maintenance was physically executed.

**WF-16 | Risk and document support in engineering**  
Owner — WEB. Depends — WF-14..15. Target — `src/processes/engineering/EngineeringContextPanel.tsx`, Risk/Documents/API consumers. Replace passive chips with authorized drill-down and evidence/versions panels, without inventing links. **Acceptance** — documentary source version, risk owner, upload/link actions and unlinked/denied states are distinguishable; all mutations use backend workflows; historic engineering revision remains immutable as owner specifies.

### D06 — Planning and custody journey (P1)

**WF-17 | Plan revision and decision pathway**  
Owner — WEB. Depends — WF-05, WF-13 where workflow exists. Target — `src/features/planning/PlanningWorkspacePage.tsx`. Surface planning period → plan → selected revision → backend-produced approval task/actions → result, instead of tabs as the primary process. **Acceptance** — approval requires exact target, grant and current concurrency token; accepted/rejected state reloads; no synthetic approval or plan revision generation on WEB.

**WF-18 | Planned-versus-actual operational evaluation**  
Owner — WEB. Depends — WF-08, WF-17. Target — `src/features/planning/PlannedVsActualPanel.tsx`. Connect backend-published plan target to monitoring-owned observations, preserving units, temporal intervals, quality, target revision and freshness. **Acceptance** — comparisons are made only for supported published target IDs, and missing/untrusted actuals explicitly show unknown; no fake derived KPI or causality; version mismatch handled.

**WF-19 | Custody discrepancy investigation**  
Owner — WEB with Custody owner. Depends — WF-05, WF-16. Targets — `src/features/custody/CustodyWorkspacePage.tsx` and transfer-ticket/period/discrepancy subpages. Start with actual fiscal period/ticket, show Party, measurement and documented discrepancy context and permit qualified owner-provided reconciliation steps. **Acceptance** — ticket and discrepancy are distinctly sourced, Party scope obeyed, actions/history persist where supported; no invented fiscal value, settlement, measurement quality or approval.

### D07 — Enterprise governance as supporting processes (P1)

**WF-20 | Access-provisioning journey**  
Owner — WEB / Identity / Organization / Party. Depends — accepted W1-W4/A1, WF-05. Recompose current admin panels as **create/activate party → organization → employee and appointment → account/permissions → approved operational scope → verification** where the backend supports it. **Acceptance** — preserve accepted six-module synthetic baseline; distinguish resource configuration from permission grant; excluded Workflow-approved responsibility assignment/revocation and appointment end/transfer remain visibly not qualified until separate HAPI registration and exact native proof.

**WF-21 | Configuration governance**  
Owner — WEB. Depends — WF-05. Target — `src/features/configuration/ConfigurationAdministrationPage.tsx` and relevant context. Present selected definition, version, environment, effective value, history, impact and backend-permitted change; avoid fictitious approval requirements for foundation unscoped values. **Acceptance** — current original value/version and subsequent effective readback correct; confidential values are not disclosed; no unauthorized environment switches.

**WF-22 | Audit and documents in-context**  
Owner — WEB. Depends — WF-16/20/21. Target — `src/features/audit/AuditWorkspacePage.tsx`, `src/features/documents/DocumentsAdministrationPage.tsx`, contextual evidence panels. Support narrow authorized audit/event/version evidence lookup for selected business reference and separately governed export. **Acceptance** — authorized query/history returns only permissible records, no exposed denied counts; document version and target references explicit; audit export authorization remains separate from read permission.

### D08 — Governed intelligence, reporting and support (P2)

**WF-23 | Risk decision support**  
Owner — WEB with Risk owner. Depends — WF-10, WF-16. Target — `src/features/risk/RiskWorkspacePage.tsx` and `components/RiskAuthoringPanel.tsx`. Start from linked asset/incident/assessment when owner publishes reference, then display actual risk register/assessment/evidence/status and next available action. **Acceptance** — no inferred risk level from UI, no auto-mutation of operational state, source and assessment revisions preserved; no relation means neutral independent risk search only.

**WF-24 | Analytics-to-report journey**  
Owner — WEB with Analytics/Reporting owners. Depends — WF-10, WF-22. Targets — `src/features/analytics/*`, `src/features/reporting/*`. Compose authorised dataset/insight or metric-evaluation result → supporting references/quality → report request/run/artifact where published. **Acceptance** — asynchronous job statuses shown exactly; no invented completed result, chart, export artifact or security grant; readback proves a real backend record and allowed artifact download.

**WF-25 | Simulation metadata + integration/notification support**  
Owner — WEB. Depends — WF-10 and WF-24 (for contextual display). Targets — `src/features/simulation/*`, `src/features/integration/IntegrationMonitoringPage.tsx`, `src/features/notification/NotificationCenterPage.tsx`. Simulation is **registered model/scenario/run/recommendation metadata**, not hydraulic solver output. Expose outbound integration job/exchange evidence and notification delivery status where explicitly supported. **Acceptance** — unexecuted/unsupported solver clearly identified, no realtime event family invented, delivery status and retries not fabricated, no operator control/automation.

### D09 — Native qualification and release gates

**WF-26 | Native proof of the first operator journey**

Start alongside the first scoped WEB change. Reuse the current Playwright, JWT and fresh PostgreSQL/Flyway harness with an immutable API pin, approved synthetic fixtures, and no mocked business HTTP. Use the selected deployment-intended authorization layout for the tested operations and prove it without swapping database grants during the journey. Sign in as the authorized operator and verify acknowledgement by a separate authorized GET after reload. Check a same-company out-of-scope actor and a cross-company actor with ordinary route grants, including direct detail, list/count and command requests. A route grant must never stand in for resource authority. Test session expiry, denied access, terminal/conflicting or repeated submissions according to the wire contract, and ambiguous write recovery. Retain exact WEB/API SHAs, the migrated schema manifest for the selected pin, OpenAPI digest, fixtures, Playwright and authoritative post-action evidence. Required cases pass with zero skips/flaky cases. A1's recorded 201 migrations are specific to its historical pin.

**WF-27 | Native secondary journeys**

Add risk-based native coverage when admitting further write paths, beginning with the next owner-selected engineering, planning/custody or governance workflow. Use an allowed and denied actor and independent state readback per bounded case. Secondary journeys are separate release decisions.

**WF-28 | Release readiness for the selected scope**

Apply security, expiry, accessibility, reliability, approved performance budgets and environment qualification to the first shipped journey. Use the repository's immutable release artifact and rollback procedures. Verify same-origin staging, smoke/UAT, database least privilege, support ownership, recovery and compatibility of the retained rollback pair. Broader workflow qualification follows as scope expands. Section 10 gives the first-release go/no-go criteria.

## 5. Cross-repository API gap control

Each proposed package is WEB-owned **unless** evidence proves an additional backend contract is required. The following are **conditional API requirement families, not endpoint assertions or registered HAPI tasks**:

| Conditional requirement | Discovery trigger | Owner | WEB behavior until accepted |
|---|---|---|---|
| **G-01 — Authorized role/scope summary** | No protected read can return assigned work/conditions or permit safe count for homepage | Identity/Organization + relevant business owner | Show directly permitted tasks/network entry only; no fabricated totals |
| **G-02 — Authoritative asset→point binding** | Actual Topology/Telemetry data does not disclose trusted reference under required temporal provenance | Topology / Telemetry owners | Explicit "binding unavailable"; manual approved point lookup if permitted |
| **G-03 — Condition→alarm→incident association** | Per-record published IDs cannot trace causal/administrative link | Monitoring/Alarm/Incident owners | Independent tabs/links clearly labelled; no inferred case membership |
| **G-04 — Contextual action eligibility and target admission** | Decision/action metadata absent or target Workflow resolver cannot admit owner target | Workflow + exact owner | Do not show unsupported approval/transition; read-only or supported alternative |
| **G-05 — Protected evidence/timeline lookup** | API cannot safely return authorized event/document/record history for an exact target | Audit/Documents/owning modules | Do not reveal global search results/counts; explicit no qualified evidence |
| **G-06 — Native fixture/privilege layout** | Multi-module runtime DB role lacks verified parallel/concurrent minimum permissions | Relevant persistence/security owners | Do not call A1 synthetic fixture a production-role privilege proof |
| **G-07 — Identity refresh lifecycle** | Required target deployment depends on rotating LOCAL refresh tokens | Identity (**HAPI-929** implemented, formal acceptance pending) | Qualify the chosen existing session flow. Register a WEB consumer separately if target policy requires LOCAL refresh. |
| **G-08 — Alarm company and resource isolation** | Scoped HTTP probes expose an alarm, protected list metadata or a write outside the actor’s authority | Alarm with Identity/Organization review | Hold the candidate until the owner fix passes the same-grant cross-scope tests. |

**API prerequisite acceptance** — owning bounded context definition, explicit invariants, inbound/outbound port changes if needed, REST DTO+OpenAPI, company/target authorization, fresh-schema Flyway/JPA (if changed), synthetic owner/API/negative/concurrency tests, exact-SHA CI. API work must follow already registered task selection or independently authorized structural governance, not be appended casually to a WEB task.

## 6. First journey and source admission

Source review establishes candidate operations. The preflight still owes runtime authorization, contract and fixture evidence on the selected pair.

| Hop | Verified source evidence | Decision for first release |
|---|---|---|
| Login and operating context | The WEB provider/gateway and accepted A1 harness exist. A1's native fixture switched a Party grant between steps. | Select the intended auth mode and prove session lifecycle and effective resource grants for this release. A1 fixture grants provide historical test evidence only. |
| Find and open alarm | [Alarm query controller](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/api/rest/controller/AlarmQueryController.java#L64) exposes `GET /api/v1/alarm/alarms` with `topologyAssetId` and `GET /api/v1/alarm/alarms/{id}`. [Query adapter](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/infrastructure/query/JpaAlarmQueryAdapter.java#L46) reads/filter/pages records and directly finds the detail by ID. | **Blocking preflight.** These inspected paths do not visibly enforce company/resource authority. Establish whether any upstream or persistence control covers both queries and counts with positive and cross-scope HTTP tests. If absent, register the smallest Alarm-owned API fix before release. The filter is contextual and caller-controlled. |
| Identify asset and source | [AlarmView](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/application/port/in/AlarmQueryUseCase.java#L44) publishes asset/source identifiers, state and optional workflow/incident references. [Alarm Console](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/src/features/alarm/AlarmConsolePage.tsx#L290) has the existing contextual links, including a topology search handoff. | Use authoritative identifiers and reauthorize the destination. A search hint is insufficient proof of a selected asset. Required context must resolve without manual GUID entry. |
| Acknowledge | [SpringAlarmController](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/api/rest/controller/SpringAlarmController.java#L91) exposes `POST /api/v1/alarm/alarms/acknowledgements` and derives actor from the authenticated principal. [Alarm service](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/alarm/application/service/AlarmApplicationService.java#L112) locks the alarm before the lifecycle check. The request carries no expected version. [PostgreSQL test source](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/test/java/dz/sh/hidra/modules/alarm/infrastructure/persistence/AlarmAcknowledgementSemanticPostgresIntegrationTest.java#L46) deliberately permits multiple acknowledgement history rows. | **Blocking preflight.** Prove target scope for writes and qualify organization evidence from the intended UI. Use actual terminal/concurrency semantics. Avoid automatic replay, invented version fields or an exactly-once claim. If policy requires duplicate prevention beyond current semantics, register it with Alarm. |
| Verify durable outcome | Alarm detail exposes `currentState`, `acknowledgedAt` and `acknowledgedByActorId`. WEB invalidates Alarm queries after the action. | Verify the exact alarm, state, actor and time with an independent GET after reload. A timeout or ambiguous response requires refetch before any retry. Read any additional history or comment only through an admitted owner endpoint. |
| Add qualified pressure evidence | [Monitoring deviation DTO](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/monitoring/application/port/in/MonitoringQueryUseCase.java#L67) is a plan/actual read model with `trustedTelemetryReadingId`, `telemetryPointId`, asset reference, unit and status. [Telemetry read DTO](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/src/main/java/dz/sh/hidra/modules/telemetry/application/port/in/TelemetryQueryUseCase.java#L41) provides point/reading IDs, unit, quality, timestamps and state. | **Conditional.** Prove this contract represents the intended GZ2 pressure case, that the exact reading can be resolved and that Alarm publishes a typed association with that deviation. Verify authority and quality at every hop. Keep unrelated observations independent and show unavailable/unqualified evidence where relevant. |

### Native acceptance for the admitted scope

| Case | Required proof |
|---|---|
| J1-POS | Operator signs in, opens the intended GZ2 alarm with its authorized context, acknowledges and independently reads the same alarm's persisted state, actor and time. |
| J1-SCOPE | Allowed, same-company out-of-scope and other-company actors are tested with the relevant route grants. Direct GET, list metadata, command and applicable context reads enforce resource scope and protect existence. A denied command leaves owner state unchanged. |
| J1-STATE | Pending action cannot be submitted twice from the same UI. Terminal and overlapping submissions follow the actual backend contract. Unknown write outcome triggers readback before retry. A Workflow 409 test applies only to a later admitted version-bound Workflow decision. |
| J1-SESSION | On expiry, logout or scope change, protected data clears or is reauthorized. Sign-in/reauthentication and scope changes do not repeat a pending command. |
| J1-UX | Keyboard and screen-reader flow from entry through readback works in the supported production locales and layouts, with meaningful status/error feedback and a usable map-independent context path. |
| J1-PRESSURE | Required only if the candidate claims pressure-deviation investigation. Resolve exact linked observation/deviation/alarm IDs, display source, units, quality/time and expose missing, stale or untrusted evidence honestly. Use owner-defined policies and synthetic fixtures. |

Later extensions may add supported Incident/Leak/HSE targets and independent Workflow approvals. Require an owner-bound target resolver, published actions, current version, actor segregation and durable history for each added Workflow branch.

## 7. End-to-end module traceability (24 API contexts)

The module owns its data and authority. The process column identifies the intended WEB experience. “Conditional” means the exact record relationship/action must be verified, not that the module is missing.

| # | HidraAPI module | Primary WEB journey / deliverable | Role |
|---:|---|---|---|
| 1 | identity | Sign-in, effective access, administrator account governance — D02/D07 | Security context |
| 2 | organization | Employee, appointment, operational scope/responsibility — D02/D07 | Accountable scope |
| 3 | party | Counterparty and company identity in topology/custody — D06/D07 | Legal/business party |
| 4 | topology | Network map, selected assets, published relationships — D03/D05 | Spatial anchor |
| 5 | assets | Maintainable asset, condition, work order — D05 | Equipment lifecycle |
| 6 | integrity | Assessment and physical integrity case — D05 | Integrity authority |
| 7 | telemetry | Authorized measurements, source, quality, time — D03 | Observation |
| 8 | monitoring | Rules, deviations, planned-vs-actual owned values — D03/D06 | Condition evaluation |
| 9 | alarm | Ack, shelving, lifecycle, source references — D04 | Alarm authority |
| 10 | incident | Case, response action, closure — D04 | Response case |
| 11 | leakdetection | Candidate, case, escalation — D04 | Suspected leak workflow |
| 12 | hse | HSE case/CAPA/closure — D04 | HSE ownership |
| 13 | workflow | Assigned tasks, decisions, history — D04/D06/D07 | Human approval |
| 14 | planning | Periods, plans, revisions, approvals — D06 | Planned operations |
| 15 | custody | Periods, tickets, discrepancies — D06 | Fiscal custody |
| 16 | documents | Evidence, versions, target links — D05/D07 | Evidence |
| 17 | risk | Assessment, risk references, evidence — D05/D08 | Risk owner |
| 18 | analytics | Datasets, insights, evaluations — D08 | Derived intelligence |
| 19 | simulation | Model/scenario/run/recommendation metadata **only** — D08 | Deferred numerical branch |
| 20 | reporting | Definitions, requests, runs/artifacts — D08 | Communication/artifacts |
| 21 | configuration | Qualified/effective settings, versions — D07 | Policy/settings |
| 22 | integration | External systems/exchange/job evidence — D08 | External boundary |
| 23 | notification | Messages, requests/delivery evidence — D02/D08 | Delivery support |
| 24 | audit | Events/history/authorized exports — D04/D07/D09 | Traceability |

Each role-based journey uses the module contracts needed for its own outcome.

## 8. UI behavior and verification standard

### Mandatory workflow-screen components

Each primary journey screen should answer seven questions (if source-backed):

1. **Why am I here?** Assigned task, alert, investigation, plan or context.
2. **Where does it apply?** Authoritative network asset, operating scope and company.
3. **What is known?** Observation/record, status, freshness, version, unit, trust and source.
4. **What is related?** Owner-published relationships with explicit IDs, not guessed joins.
5. **What action is available?** Actual permitted lifecycle command; required rationale and actor.
6. **What happened?** Backend read-back of transition, history and responsible actor.
7. **What remains uncertain?** Missing data, unavailable action, forbidden relation, unqualified physical result.

**UI non-negotiables:** human-readable labels rather than raw GUIDs as primary navigation; no disabled dead-end where a supported route exists; preserve map and table power-user views; proper focus/keyboard support; FR/EN/AR and RTL; pagination/load more; access-denied and missing-reference states; no silent ignore of 401/403/409/422; never use dashboard counts as proof of authorized visibility without endpoint-backed scope.

### Stage-level definition of done

A package is implementation-eligible only when: (a) registered scope/owner and exact allowed paths approved, (b) current backend/wire artifacts proven, (c) no open target-admission or privilege blocker for in-scope commands, (d) tests defined, (e) no unapproved release/solver/OT change. It is **complete** only when source, unit/browser tests, build, exact-SHA CI, authorization negatives, accessibility where applicable, evidence references and formal owner disposition have been independently recorded. Being on a page is not completion of a business journey.

**Minimum test layers:** TS unit/contract tests (reference extraction, no inferred join, permission-guard fail closed); component tests (states, conditional controls); mocked Playwright fast UX regression; native browser+HidraAPI+PostgreSQL for important decision paths; exact OpenAPI/Orval compatibility; manual operator walkthrough for workflow usability. Real SITE acceptance is an independent later gate.

## 9. Risk and dependency register

| Risk | Consequence | Mitigation / owner |
|---|---|---|
| Owner APIs expose objects but no verified linkage | Artificial “one-click journey” would be false | WF-02 admission; block affected hop; API owner task only by approval |
| Context UI creates implied business state | Divergence between frontend and HidraAPI | UI selection only; always refetch backend status/actions |
| Weak user-specific scope/summary reads | Unauthorized counts/data exposure | No aggregate display without server-filtered contract |
| Workflow target resolver unavailable | No valid start/approval producer | Prove owner-bound target admission; no generic self-created task workaround |
| Untrusted/late telemetry or missing binding | Misleading operator conclusion | Present quality/timestamp/unknown; no invented causal decision |
| Misinterpretation of A1 | Synthetic acceptance mistaken for industrial/site readiness | Preserve A1 exact evidence scope and exclusions |
| Over-expansion into physical editors | Delays first functioning operator journey | F02/F03 separate path; read-only physical asset context sufficient initially |
| Over-expansion into solver/realtime | Claims unsupported physics/live telemetry | Keep deferred/explicit states; no autonomous OT |
| WEB changes break existing pages/Orval | Regression | Reuse feature components, a single bounded change, exact-SHA tests and rollback |
| LOCAL refresh enabled before end-to-end qualification | Session/security mismatch | Admit the selected auth policy first. HAPI-929 whole-task acceptance and a WEB consumer decision remain separate. |
| Route permission mistaken for resource isolation | Alarm payload, count or write leakage | Block first release until same-grant cross-scope native tests prove all required reads and writes. |
| Alarm/Monitoring adapters materialize result sets before paging | Resource use may grow with record volume | Measure on representative synthetic volume. Address a verified release limit or an authorization defect within the owner module. |

## 10. Release and optimization decisions

| Gate | Pass condition | Owner evidence |
|---|---|---|
| Software acceptance | Exact paired WEB/API sources and OpenAPI digest, successful applicable CI, native acknowledgement/readback and isolation cases, no required skips, known limitations recorded. | WEB/API leads and independent security/QA reviewer. |
| Candidate integrity | Verify the CI-produced WEB distribution/manifest and the paired API artifact and config revision. Reproduce the supported auth, proxy and migrated DB configuration in staging. Ensure the known-good pair is retained and restore/rollback instructions fit the migration compatibility. | Release engineering and DB owner. [Release artifact and rollback procedure](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/deployment/Release-Artifact-Backup-Rollback.md) |
| Environment and operator acceptance | After owner authorization, rehearse same-origin TLS/CSP and API routing, auth/expiry/logout, least-privilege runtime accounts, one native operator flow, observability and operator usability/accessibility. Verify database backup/restore and WEB/API rollback in the approved staging scope. Document configuration, logs and redaction, support contacts, escalation and agreed recovery objectives. | Environment/security owners, operations and support. [Same-origin setup](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/deployment/Same-Origin-Reverse-Proxy.md) · [Existing staging/UAT procedure](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/deployment/HidraWEB-Staging-UAT-Product-Phase.md) |
| Promotion decision | Release owner approves exact artifact pair and scope after UAT and an agreed rollout and rollback drill. Hold for unresolved critical security, operator correctness, required accessibility, recovery or release-budget failures. Record disposition for other findings. | Accountable release owner and operations lead. Production deployment and industrial SITE acceptance are separately authorized and evidenced. |

**Measure before optimizing.** Keep the repository's [bundle](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/deployment/Bundle-Budgets.md) and [runtime budgets](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/deployment/Runtime-Performance-Budgets.md) as release guards. Capture alarm list/detail latency, acknowledgement-to-confirmed-readback latency, error rate and representative dataset size in the staging rehearsal. Record median/p95 with sample size, browser/network conditions and exact artifact pair. Any new threshold should come from the operating context and accountable owner. A missed release requirement merits a focused fix. Further tuning should be driven by measured regression, support evidence or operator friction. Keep shell redesign, broad refactors, speculative caching and custom realtime infrastructure outside the first-release critical path.

## 11. Next proposed stage

Propose registering **one bounded WEB/API contract and security preflight for GZ2 alarm acknowledgement**. This draws on WF-01–03 without automatically selecting their portfolio work. Begin with the current Alarm Console, its exact REST types, signed-in scope, both Alarm query paths and the acknowledgement transaction. Deliver a compact source and test evidence matrix, exact scope, proposed task message and acceptance, and a decision of **admit**, **hold for one bounded API prerequisite**, or **hold for unresolved operator/context policy**. Include the independently accepted API pin decision and release auth assumption. Run approved synthetic probes where in scope and record any unresolved proof.

The adopted A1 sequence has no registered implementation successor. Preserve canonical track priority until the owner explicitly registers or adopts the proposed stage. If a prerequisite fails, resolve that evidence or scope before selecting the first WEB implementation. Govern any later direct-main publication, expected-head check and CI start under the repository rules.

## 12. Evidence / source index

- [HidraWEB at inspected head](https://github.com/CHOUABBIA-AMINE/HidraWEB/tree/7fef9c042052bc2a326b15a103e5ee3d35df1db4)
- [HidraAPI at inspected head](https://github.com/CHOUABBIA-AMINE/HidraAPI/tree/70490d28e1a290a14578c2fc6320d242b4a76ec3)
- [HidraWEB canonical roadmap](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/roadmap/ULTIMATE_ROADMAP.md)
- [WEB information architecture](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/architecture/HidraWeb-Information-Architecture.md)
- [WEB–API contract](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/architecture/Hidra-API-Web-Contract-v1.md)
- [Six-module accepted A1 record](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/roadmap/ULTIMATE_ROADMAP.md)
- [A1 exact CI #1033](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42410743798)
- [Native A1 browser test](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/tests/e2e/foundation-integrated-live.spec.ts)
- [Mocked critical journey test](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/tests/e2e/critical-operational-journeys.spec.ts)
- [API AGENTS governance](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/AGENTS.md)
- [API task registry](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/doc/roadmap/ULTIMATE_ROADMAP.md)
- [API HAPI-929 owning task](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/70490d28e1a290a14578c2fc6320d242b4a76ec3/doc/roadmap/TASKS_HPS-001.md#hapi-929--implement-rotating-identity-refresh-tokens)

- [WEB Code CI #1034](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42463226504)
- [API Full CI #1145](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536476) and [Docs #937](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536750)
- [Existing product-phase roadmap and UAT handoff](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/7fef9c042052bc2a326b15a103e5ee3d35df1db4/docs/roadmap/HidraWEB-Post-Reconciliation-Product-Roadmap.md)

**Evidence boundary** — This revision uses source and hosted CI observations. The WEB head has parent `54eff2013ac1c01a5567cb88ae3bbe27892abdff` and tree `6e1bbee43440e441b54be7b785dba9587587cc4c`. The API head has parent `ce0e059b16db85d4b61da06f5a0ad1a1944d1015` and tree `a0e2115c2bea1bfac12c11002e8374b658925f4f`. The proposed alarm and pressure paths still require their own live authorization and workflow tests. This review made no GitHub changes and started no CI.

## 13. Owner decision on the HidraWEB product target

**Approved 2026-11-09.** Adopt [HidraWEB Application Map and Workspace Design](https://chatgpt.com/library?file_id=libfile_5eaa2568251c8191b02ec51fa50212fc&account_id=personal) as the HidraWEB product target. The reviewed reference is document revision `1`, file identity `file_000000009b6c8246bc43ca1bc59a19be`. The operative decisions are recorded below.

- **Operator landing.** Adopt `/network` as the intended landing page for operators once the operator-scoped station investigation is qualified and the landing change is separately selected. The workspace carries the same authorized company and organizational scope, pipeline system, canonical asset and time window across the map, alarms, technical evidence, telemetry and permitted work. Diagnostics remain available to the support audience.
- **System scope.** GZ2 is the first gas reference pilot. Apply the same design to additional authorized pipeline systems after their own scope, asset bindings and evidence are qualified. HidraAPI decides resource access. Browser context and map filters select a view within that authority.
- **Execution authority.** The [canonical roadmap and its recorded task scopes](ULTIMATE_ROADMAP.md) govern task selection, dependencies, implementation and acceptance. This decision approves the product target. Each delivery, change to production behavior and release decision requires its own authorization and evidence.
- **First delivery gate.** [HWEB-F16](ULTIMATE_ROADMAP.md#hweb-f16--single-task-execution-scope-and-owner-correction-2026-11-09) remains one indivisible task for scoped alarm review, acknowledgement and durable readback in the existing Alarm Console. Its Alarm contract pin, consumer verification, native browser qualification and intended GZ2 owner and asset-type evidence follow its existing acceptance requirements and disposition.
- **Proposed follow-on.** After F16 acceptance, bring one operator-scoped station investigation forward for separate registration. Its prerequisites include a server-authorized network projection and discovery, owner-backed alarm and telemetry relationships, and versioned technical evidence. Qualification should prove the same station and time context from the map or a linked alarm and after reload, with isolation for out-of-scope actors. Any modeled-versus-observed overlay follows a separately qualified numerical runtime and authorized scope.

This decision is the product interpretation of the proposed operator-focused overview and asset-first work described above. Planning aliases in this document do not register executable tasks.


## 14. Prepared delivery queue from HWEB-F17 (2026-11-09)

This queue translates the adopted network workspace target and the [Login, Network and Digital Twin delivery proposal](https://chatgpt.com/library?file_id=libfile_9bfa4dd6e8bc8191965e26ea9213b501&account_id=personal) into standalone delivery candidates. The canonical F17 registration governs branding and takes precedence over the earlier combined branding and renewal proposal. HWEB-F18 through HWEB-F23 are proposed identifiers and sequencing, **PROPOSED / NOT SELECTED**. Each candidate requires its own canonical registration, exact SHA and file allowlist, and explicit implementation selection. Each is one indivisible task with one acceptance decision.

**Baseline.** WEB `1cb3444f383294c0cd7082d646a2bc95803bcae2` (parent `befb1d71235b050a58da809c1b3f7c67e917303a`, tree `98794ae21fa64400c75538c447313a8533809268`) passed [Documentation Validation #69](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42620413303). [Code CI #1034](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42463226504) is earlier source evidence. HidraAPI `75b81071a063d3c7deffcc52fbb832e513f65929` contains the latest inspected HAPI-929 refresh throttling change. [API Docs #954](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42627895299) passed and [API CI #1160](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42627895165) passed. The [API task ledger](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/75b81071a063d3c7deffcc52fbb832e513f65929/doc/roadmap/TASKS_HPS-001.md#hapi-929) retains PARTIAL / IN_PROGRESS and records remaining lifecycle qualification. Recheck live evidence at each selection.

| Task | Standalone outcome | Entry gate | Intended implementation message |
|---|---|---|---|
| **HWEB-F17** | HyFlo branding on the actual Login and browser metadata | Exact-SHA registration CI passed. Owner `Next` selects implementation. | `feat(auth): apply HyFlo branding to login` (registered) |
| **HWEB-F18** | Secure LOCAL session renewal and logout | F17 acceptance, owner-confirmed whole HAPI-929 acceptance, accepted runtime contract and browser credential policy. Separate owner selection. | `feat(auth): integrate rotating LOCAL sessions` |
| **HWEB-F19** | Isolated network workspace client preview | F17 acceptance, approved preview isolation, fixtures and roles. Session renewal is an independent lane. | `feat(preview): demonstrate the network workspace` |
| **HWEB-F20** | Isolated station investigation and follow-up preview | Client acceptance of the F19 interaction and agreed Alarm, technical, telemetry and follow-up ownership. | `feat(preview): demonstrate station investigation` |
| **HWEB-F21** | Isolated digital-twin decision preview | Client acceptance of the F20 interaction and explicit approval for synthetic model output. Numerical P3 stays deferred. | `feat(preview): demonstrate digital twin decisions` |
| **HWEB-F22** | Qualify one operator-scoped native station investigation | F16 ADMIT, accepted owner contracts and native fixtures, and F20 feedback disposition. F21 preview can proceed independently. | `feat(network): qualify scoped station investigation` |
| **HWEB-F23** | Route qualified operators to the existing `/network` workspace | F22 native acceptance, approved operator entry rule and separately selected routing change. | `feat(navigation): open network for qualified operators` |

### HWEB-F17 — HyFlo Login branding

**Scope.** Follow the [canonical six-path allowlist](ULTIMATE_ROADMAP.md#hweb-f17--hyflo-login-branding-registration-2026-11-09). Modify `src/app/pages/LoginPage.tsx`, `src/app/pages/LoginPage.test.tsx`, `src/shared/i18n/resources.ts` and `index.html`. Add `public/brand/hyflo-full.png` and `public/favicon.ico`. The inspected source still displays `HidraWeb` in the browser title and already contains SONATRACH-oriented orange and neutral color tokens in the Login page. Reuse the existing provider dispatch and sign-in flow.

| Supplied archive entry | Target | Bytes | SHA-256 |
|---|---|---:|---|
| `images/HyFlo_Full.png` | `public/brand/hyflo-full.png` | 2231744 | `3b21fd7d6dc7dbaef5fb69ec928a6d64407919ad09aabab72bb3f943c448de51` |
| `images/favicon.ico` | `public/favicon.ico` | 13038 | `bd42abbfccf7bd227e82c4fb2666555437a293011d44cfcac0e575854e81d119` |

The owner-supplied [images.zip](https://chatgpt.com/library?file_id=libfile_e05ae574fc0c8191bb1500a739640fd8&account_id=personal) passed ZIP integrity checks and has SHA-256 `e33e7af8935e1b5b999e3e16d81985572847ecfd1178bc85672a58121b8082c3`. Verify both output assets byte for byte.

**Acceptance.** Run the focused Login Vitest suite, lint, typecheck and build on Node 24. Inspect built title, metadata and favicon, keyboard focus, contrast, narrow and desktop layouts, and English, French and Arabic RTL copy. In a browser against approved development HidraAPI, sign in with a synthetic user, prove a protected destination with effective permissions and exercise invalid credentials. Record provider coverage and obtain owner visual acceptance. Existing mocked provider dispatch tests are regression evidence only.

### HWEB-F18 — LOCAL session renewal and logout

**Scope candidate.** Use the exact accepted Identity contract for the existing login plus `POST /api/v1/identity/authentication/refresh` and `POST /api/v1/identity/authentication/logout`. The inspected API controller has these mappings, including source-visible refresh throttling (429) and logout (204). Before admission, inspect the published runtime OpenAPI and accepted status/error semantics, agree the volatile credential policy and record the exact compatibility digest. Candidate paths include `src/app/auth/AuthProvider.tsx`, `src/app/auth/authContext.ts`, `src/app/auth/authenticationGateway.ts`, `src/api/client/hidraAxios.ts`, `orval.identity-organization.config.ts`, its candidate source and proof checks, and focused auth, transport and native browser coverage. Preserve other pins and provider flows.

**Acceptance.** On fresh synthetic PostgreSQL and genuine browser/HTTP, qualify LOCAL only, one renewal for parallel eligible reads, atomic credential replacement, current identity and permissions before resuming safe reads once, old bearer rejection, expiry/resume, 429 and denied authorization, missing/rejected or ambiguous renewal, and confirmed logout. An uncertain renewal must never resubmit consumed proof automatically. Protect against a late refresh restoring a signed-out session, clear protected cache, and distinguish confirmed family revocation from an unconfirmed remote logout. Verify no automatic mutation replay and no credentials in persistent browser storage, logs, traces or URLs. Record exact API and WEB revisions and redacted runtime evidence.

### HWEB-F19 — Network workspace client preview

**Scope candidate.** Add an isolated preview entry and fixtures under a proposed `preview/network/` directory. Use the existing network workspace, map abstraction and accessible list as interaction references. Carry one scope, system, canonical asset and time window across the map, tree, technical revisions, telemetry and Alarm panel. Keep synthetic provenance, quality, stale/unavailable states and fixture reset visible. The preview has no credentials, live API writes or product route registration. Verify isolation from the application bundle.

**Acceptance.** A client operator can select the same station and time from map, tree and alarm, switch to a second synthetic system and distinguish empty, stale and unavailable data. Scope change clears incompatible selections and evidence. Read-only, same-company out-of-scope and cross-company fixture roles exercise disclosure-safe states. Demonstrate a keyboard path and narrow view, and record the client walkthrough and build identity.

### HWEB-F20 — Station investigation and follow-up preview

**Scope candidate.** Extend the isolated preview entry with the selected station investigation, bound observations, technical evidence revision, alarm history and separate follow-up. Use deterministic scenario transitions and fixture readback. Keep product Alarm and Workflow transport outside the preview.

**Acceptance.** The client can review the condition, distinguish acknowledgement, follow-up and resolution, and reopen the resulting history with the original evidence. Exercise degraded evidence, permission denial and stale action. Denied or stale fixture actions leave history unchanged. Label simulated actor, timestamp and readback, and record client acceptance and unresolved native dependencies.

### HWEB-F21 — Digital-twin decision preview

**Scope candidate.** Extend the same isolated preview with gas-first scenario setup, a versioned input manifest, explicit units, precomputed synthetic observed/model comparisons, provenance, recommendation, independent human decision and outcome review. Preserve Hidra's own steady/transient engine direction and engine-neutral versioned inputs. Engine execution and physical qualification remain deferred.

**Acceptance.** Client operator, engineer and reviewer can trace observation to input revision, simulated run, alternative, proposal, decision and follow-up. Prove a missing or incompatible input blocks a result, stale or unauthorized decisions preserve state, and an unavailable outcome remains unresolved. Distinguish fixture observation from fixture model output. Record decision actor, time, rationale and source links in the fixture history.

### HWEB-F22 — Native station investigation

**Scope candidate.** Reuse `src/features/topology/NetworkTopologyPage.tsx`, the existing Alarm Console and owner-backed technical and observation adapters. Place cross-feature composition in a proposed `src/processes/station-investigation/` directory and admit only the exact OpenAPI slices and test fixtures needed. Keep existing authoring, Alarm semantics and default landing behavior under their own authority. Before selection, obtain server-scoped network and station discovery, authoritative point and alarm links, approved technical revision evidence, and owner-confirmed asset type and scope. Record absent contracts in the existing gap register.

**Acceptance.** Starting from the map and from a linked alarm, a genuine synthetic operator reaches the same authorized station, evidence revision and time window, then reloads and reauthorizes. Verify provenance, unit and freshness, allowed partial panel failure, direct links, a scope change and revoked access. Same-route-grant out-of-scope principals cannot infer protected existence, counts or history. Any admitted action uses its current owner transition and durable readback. Use exact WEB/API SHAs, OpenAPI digests, genuine browser/HTTP and disposable migrated PostgreSQL. Retain HOLD for missing authority or bindings.

### HWEB-F23 — Operator landing

**Scope candidate.** Adjust default authorized operator entry in `src/app/router/router.tsx`, `src/app/pages/LoginPage.tsx` and `src/app/pages/OidcCallbackPage.tsx` only where the selected baseline requires it. Reuse the authenticated shell and effective permission bootstrap. Include focused route and browser regressions in the eventual allowlist. The entry rule must use accepted server-provided permissions and qualified context.

**Acceptance.** A qualified operator lands on `/network` after sign-in with the supported scope. Safe authorized return paths retain precedence, unauthorized links are handled safely, and users without a qualifying assignment reach the approved fallback. Confirm direct links, reload, revoked access, a second authorized system, and continued access to permitted support diagnostics. Exercise the genuine browser journey and review the behavior with the owner.

### Common handoff and remaining portfolio

- Each task's implementation handoff records exact parent/tree, source scope, contract and fixture inputs, commit message, validation and one disposition. For each delivered interface, record its entry, permissions, operations, events, error states, owner data provenance and client review separately from engineering and SITE acceptance.
- Publish each separately selected stage to existing `main` with an expected-head guard, observe applicable exact-SHA CI creation or start and stop. Keep historical aliases and reconciliation records. The next registered source task is HWEB-F17. HWEB-F16 stays indivisible and on HOLD under its existing gate.
- The remainder of D05–D08 in section 4 stays in the existing portfolio. Admit engineering/integrity/maintenance, planning/custody, governance and intelligence flows only after their owning contracts and representative operator workflows are qualified. D09 in section 10 still governs staging/UAT, artifact and recovery evidence, and the separate promotion decision. Preserve the existing performance budgets and measure the qualified workflow before tuning.
