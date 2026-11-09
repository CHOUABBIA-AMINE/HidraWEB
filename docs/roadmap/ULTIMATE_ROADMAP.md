# HidraWEB — ULTIMATE ROADMAP

> **Status:** Canonical prospective execution and product-roadmap index; foundation-first roadmap created 2026-10-11.
>
> **Backend authority:** [HidraAPI](https://github.com/CHOUABBIA-AMINE/HidraAPI) — live implementation, permissions, verified OpenAPI, and [its Ultimate Roadmap](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/main/doc/roadmap/ULTIMATE_ROADMAP.md).
>
> **Frontend authority:** This roadmap governs future HidraWEB roadmap selection and coordinates, but **does not override** the canonical [Hidra API–Web Contract v1](../architecture/Hidra-API-Web-Contract-v1.md), machine-generated transport contracts, historical task evidence or actual CI.
>
> **Reconciliation snapshot:** HidraWEB main `84b5997e969c6d4a0fa8ad167c74971aca8ea41d`; HidraAPI main `c3f47c79248d8e645e1fbe924ede79782dda6c17`. These are point-in-time references, not permanent source pins. Re-fetch both HEADs before each later task.
>
> **Execution authority:** Documentation consolidation only. No implementation task is selected by this document; every next task requires an explicit owner selection and its registered implementation scope.
>
> **Owner rule (2026-11-09; applies prospectively across Hidra):** Registered tasks are indivisible. Do **not** create child tasks, lettered/numbered packages, suffix stages, or new implementation IDs under an existing task, now or in the future. A task may have implementation activities, tests, acceptance checkpoints and same-task CI repairs, but all retain its single registered identifier and one completion/hold decision. In particular, **HWEB-F16** alone owns the Alarm contract integration and operator workflow qualification. This explicit instruction overrides earlier optional task-splitting proposals; historical completed stages and their legacy titles are not renamed. A blocked task remains HOLD rather than being split to advance it.

## 1. Mission and non-negotiable scope

Develop a **production-ready HidraWEB industrial engineering and operational workbench** consuming only real, accepted HidraAPI APIs, without making its core business value dependent on an unfinished numerical simulator. The frontend must provide governed operator experiences for physical network configuration, station/equipment management, manufacturer engineering data, product records, historic engineering baselines, permitted operational monitoring, and existing enterprise features. Do not confuse source-backed persisted records with exposed CRUD APIs or with production readiness.

The **simulator-first expansion is deferred in the proposed foundation-first strategy**. Formal authorization and status change of the simulator work remain the responsibility of the HidraAPI Ultimate Roadmap; **this frontend planning document cannot unilaterally change the HidraAPI execution gate**. Retain previously accepted simulation model/scenario/run metadata UX only within its existing backend-supported meaning; queuing is not proof of hydraulic solver execution. No simulated result, product physics, calibration capability or realtime publisher may be fabricated.

HidraWEB is not production deployed. Rational refactoring, removal or replacement of unreleased frontend implementation is permitted **only in a separately authorized, source-backed task**, with specified file allowlist, compatibility impact, tested replacement and rollback plan. Default to reuse of implemented authentication, Topology Map, operational workspaces, Orval clients, security and CI investment; do not erase working functionality gratuitously.

## 2. Canonical authority, source links and precedence

1. Live HidraAPI controllers/services, schemas, security and executable tests determine **backend implementation truth**.
2. The exact-backend-commit successfully generated and published OpenAPI artifact, plus verified route permissions, governs **browser transport**.
3. HidraWEB's generated Orval clients and actual feature tests govern **frontend consumption**; do not handwrite competing transport DTOs.
4. [Hidra API–Web Contract v1](../architecture/Hidra-API-Web-Contract-v1.md), including **§25 ENG-001–012**, governs the cross-repository boundary.
5. **This Ultimate Roadmap** governs prospective frontend prioritization and single-task selection.
6. [Backend Gap Register](HidraAPI-Frontend-Backend-Gap-Register.md) records specific incomplete interfaces and verification gaps.
7. Historical plans, decisions, CI and release records remain evidence, not alternative active roadmaps.

### Historical/supporting roadmap index

| Document | Retained role |
|---|---|
| [HidraWeb Development Roadmap](HidraWeb-Development-Roadmap.md) | HWEB-R01–R17 reconciliation history and exact accepted evidence |
| [Post-Reconciliation Product Roadmap](HidraWEB-Post-Reconciliation-Product-Roadmap.md) | HWEB-P01–P12 history, HWEB-CONTRACT-001 delta, and preliminary HWEB-F01–F10 task candidates |
| [Post-Reconciliation Roadmap](HidraWEB-Post-Reconciliation-Roadmap.md) | Release/reconciliation handoffs and prior queue evidence |
| [Backend Gap Register](HidraAPI-Frontend-Backend-Gap-Register.md) | ENG capability status and backend-to-web acceptance |
| [API–WEB Contract v1](../architecture/Hidra-API-Web-Contract-v1.md) | Canonical normative transport/business boundary; not superseded by roadmap |
| [HidraWEB information architecture](../architecture/HidraWeb-Information-Architecture.md) | Presentation and navigation authority, subject to actual backend capability |
| [HidraWEB technical architecture](../architecture/HidraWeb-Technical-Architecture.md) | Frontend implementation architecture and adapter boundaries |

Preserve all original files and append-only task histories; where content conflicts, use the precedence above and register a bounded correction task. Do not silently rewrite completed task statuses.

## 3. Source-backed current state

### 3.1 Accepted frontend history

- **HWEB-R01–R17:** recorded COMPLETE in the historical reconciled development roadmap; preservation only.
- **HWEB-P01–P12:** recorded COMPLETED in the post-reconciliation product roadmap. This includes identity/organization, risk, reports/analytics, existing simulation metadata commands, integration/notification evidence boundaries, documents/configuration, cross-surface operator navigation and frontend product hardening. These completions do **not** certify all industrial production environment/UAT gates.
- **HWEB-F01–F10:** documented as **PROPOSED — NOT SELECTED** in the 2026-10-11 post-reconciliation addendum. No code or engineering editor feature implementation is accepted by that proposal.
- **HWEB-CONTRACT-001:** §25 API–WEB extension and the corresponding backend gap/roadmap delta documents have been published. Treat this as completed **documentation preparation**, not completed exact-current contract recertification or production functionality.

Existing HidraWEB supplies React/TypeScript/Vite, TanStack Query, MUI, MapLibre behind a map abstraction, OpenAPI/Orval generation, permission-aware UX, test tooling and a same-origin deployment design, as specified by [README](../../README.md) and actual `package.json`. Retain working features unless a later review proves a concrete reason to refactor.

### 3.2 Backend foundation reality and limitations

At the source snapshot above, HidraAPI exposes `POST /api/v1/topology/pipeline-systems`, `POST /api/v1/topology/facilities`, and read-only Topology Map endpoints, among other published contracts. These **do not** prove a complete browser-operable pipeline editor, full station hydraulic editor, surveyed route authoring, manufacturer-characteristic authoring, multi-product authoring or full-baseline publication. Internal Topology/Custody/Simulation persistence revisions are not automatically frontend DTOs.

The HidraAPI roadmap added HPR-P25-018–023 design/preflight obligations for operator engineering provisioning, geospatial/elevation data, stations/equipment, manufacturer parameters, product inputs and reproducible baselines. **Design/preflight completion alone is not an implemented backend contract**; separate authorized implementation and verification must precede corresponding HidraWEB feature completion.

The deferred simulation/model/execution/calibration planning group HPR-P25-024–027, plus unfinished numerical obligations, must not be a prerequisite of independent engineering-data authoring. However, formal simulator deferral is still a proposed owner decision until recorded in the HidraAPI roadmap and must be verified anew before selecting dependent frontend tasks.

### 3.3 Status vocabulary

| Status | Strict meaning |
|---|---|
| COMPLETED_PRESERVED | Existing completed record; do not reopen or reinterpret |
| PLANNED / PROPOSED — NOT SELECTED | Roadmap candidate, not authorization to modify files |
| SELECTED | Explicitly authorized specific task with permitted scope and required evidence |
| IN PROGRESS | Selected work actually started |
| BLOCKED | Stated missing prerequisite or failed gate |
| DEFERRED | Formal deliberate deferral by responsible roadmap owner |
| IMPLEMENTED | Backend or frontend bounded implementation with source/test evidence; not necessarily end-to-end verified |
| VERIFIED | Acceptance against actual published contracts and relevant tests/gates |
| NOT VERIFIED | Evidence not observed; never upgrade by assumption |

## 4. Product tracks

### Track A — Active strategic priority: operator engineering foundation

Scope: browser workflows for Topology network graphs, geospatial profiles, station internals, individual installed equipment, manufacturer/versioned characteristics, product definitions, engineering-data imports, historical effective baselines and governed approvals. Frontend authors only supported validated facts through accepted backend contracts; no fake data, local pseudo-persistence or browser-owned physics.

This is the **priority candidate track**, not blanket execution selection.

### Track B — Existing independent operational workspaces

Preserve existing Identity, Organization, Assets, Telemetry, Workflow, Alarm, Incident/HSE, Risk, Integrity, Planning, Custody, Reports, Analytics, Audit, Documents and Configuration UI as supported by their actual current backend contracts and previous accepted scope. Security or genuine UAT blockers may take precedence when evidenced. Qualified telemetry measurements are not forecasts. Absent domain realtime publishers remain absent even if transport endpoints exist.

### Track C — Deferred numerical simulation UI expansion

No new industrial hydraulic simulation editor, real-gas/H2/liquid physics controls, automated simulator trigger workflow, provider selection, calibration UX, simulated alarming or predictive results without separately reactivated/accepted HidraAPI model/solver/execution contracts. The preexisting bounded simulation model/scenario/run queue pages remain historical or capability-gated; never relabel them as active solvers.

### Track D — Release readiness and production operations

Every released feature requires measured acceptance across deployment environment, identity/permissions, validated API compatibility, network reliability, browser E2E, performance, accessibility, observability, backups/recovery and rollback. A CI-green development artifact is not alone a deployed production system.

## 5. HWEB-F01–F10 dependency registry

**All tasks below are CANDIDATES / NOT SELECTED.** They are roadmap-level envelopes, not yet separately executable implementation authorizations. Before selection, register the exact commit message, actual file/test allowlist, owner, confirmed backend OpenAPI/permission artifact, test matrix and execution gates. Check uniqueness against all current HWEB/HWEB-M code registrations first.

| Code | Scope / ENG requirements | Prerequisites | Target acceptance |
|---|---|---|---|
| **HWEB-F01** | Source-backed contract pin, feature gap and capability audit, ENG-001–012 | Current HidraAPI/HidraWEB exact HEAD and CI; formal backend roadmap disposition | Exact API/permissions/DTO inventory, accepted OpenAPI SHA/digest, implementation task envelopes, non-invented features |
| **HWEB-F02** | Physical graph/pipe authoring, ENG-001/004/010/012 | F01; accepted backend graph/pipe create/read/revise/validate APIs | Real draft→validate→save→retrieve→revise; permissions, conflicts and negative tests |
| **HWEB-F03** | Route, CRS, chainage and elevation/profile editor, ENG-003/004 | F01 and accepted geospatial/profile authoring API; F02 only if shared graph workflow requires it | Intermediate survey/profile points, vertical datum, precision, source evidence, revisions and accessible map alternatives |
| **HWEB-F04** | Station/header and individual installed-unit workbench, ENG-002/005 | F01; accepted Topology/Assets/Party unit/incidence contracts | Independent nine-unit, three-station example; distinct manufacturer binding and historical configuration |
| **HWEB-F05** | Manufacturer curves, tables, limits and revisions, ENG-006 | F04 and accepted type-specific characteristic authoring endpoints | Supplied units/reference conditions, validation, immutable manufacturer source, qualification and historical retrieval |
| **HWEB-F06** | Product/composition and supplied-property editor, ENG-007 | F01; accepted canonical product owner APIs | Versioned product/composition, reference units, applicability evidence, supported/unsupported states |
| **HWEB-F07** | Engineering baseline, comparison, publish and history, ENG-008/010 | Accepted F02–F06 as relevant to supported baseline; accepted multi-owner freeze/replay API | Exact owner revisions/digests, conflict/approval/history and no rewriting old facts |
| **HWEB-F08** | Qualified monitoring and location linkage, ENG-009/012 | F01 and accepted Telemetry/Topology binding/quality contracts | Source/time/quality/freshness/permissions; no invented event families or OT writes |
| **HWEB-F09** | Engineering import/export workflow, ENG-011 | Accepted backend typed import/export for each supported category; relevant editor readiness | Dry-run, units, CRS, per-field errors, atomic save/rollback, permission and large-file limits |
| **HWEB-F10** | Integrated engineering product/release gate, ENG-001–012 | Implemented/verified supported F02–F09; deliberate documented disposition of unsupported items | Operator round-trip + security/compatibility/Playwright/performance/accessibility/production UAT and rollback evidence |

**Parallelism:** F03/F04/F06/F08 may advance independently when their backend prerequisites pass. F10 cannot be labeled complete simply because ten design documents exist. For incomplete product families, narrow release claims and record explicit approved exclusions rather than claim universal support.

### Priority order and critical path

1. First verify owner-roadmap deferral disposition, both repository HEADs, published backend contract artifact, frontend CI and current security/production findings.
2. Explicitly select and register **F01** as a bounded contract verification task; it cannot silently execute F02.
3. Finish and independently verify backend operator-provisioning API capabilities corresponding to ENG-001–012; pair frontend slices with stable accepted contracts rather than waiting unnecessarily for the entire backend roadmap.
4. Implement F02–F09 in dependency-safe, separately authorized slices. Prefer demonstrable operator workflows and source-backed data integrity over decorative dashboards.
5. Require integrated F10 UAT/security/performance/accessibility/release evidence before declaring the supported engineering workbench production ready.
6. Keep all simulator-specific new feature work outside this phase until separate explicit reactivation.

## 6. ENG-001–012 backend/web interface contract matrix

| ID | Required outcome | Known disposition at planning baseline |
|---|---|---|
| ENG-001 | Validated physical graph authoring, versioned CRUD/revision | PARTIAL backend foundations; full editor TARGET |
| ENG-002 | Stations/headers/units/incidence | PARTIAL identities; full station internal authoring TARGET |
| ENG-003 | Ordered route/chainage/elevation and CRS/datum | Target full survey/profile writer; map GET is not an editor |
| ENG-004 | Engineering pipe sections and controlled revisions | PARTIAL hydraulic source store; complete authoring TARGET |
| ENG-005 | Installed equipment, model/manufacturer, lifecycle | PARTIAL Topology/Assets relationship; editor TARGET |
| ENG-006 | Manufacturer performance characteristics and source revisions | PARTIAL immutable source store; user authoring TARGET |
| ENG-007 | Canonical product/composition/method provenance | PARTIAL gas source revision; multi-product editor TARGET |
| ENG-008 | Exact, immutable and historically resolvable engineering baseline | PARTIAL underlying stores; full cross-owner contract TARGET |
| ENG-009 | Trusted telemetry-to-physical-asset binding and monitoring | PARTIAL reads/bindings; full UX subject to source contract |
| ENG-010 | Authoritative validation, approvals, audit and revision lifecycle | PARTIAL individual workflows; integrated publish TARGET |
| ENG-011 | Governed import/export with provenance, atomicity | Target; no invented upload endpoint |
| ENG-012 | Per-feature completeness/capability and permission discovery | PARTIAL capabilities; comprehensive editor eligibility TARGET |

Use the live [ENG Gap Register](HidraAPI-Frontend-Backend-Gap-Register.md) and canonical contract §25 for details. These labels are **planning observations**, not a claim that 12 implementable current endpoints were discovered.

## 7. Non-negotiable API–WEB implementation rules

- Backend owns business truth, validation, authorization, workflow transitions, engineering revisions, statuses and numeric engineering rules.
- All browser requests derive from successfully accepted HidraAPI OpenAPI, Orval-generated transport types and typed frontend feature adapters. Do not invent URL paths, methods, permissions, response fields or unverified realtime events.
- Use `GET /api/v1/identity/me/permissions` for effective permissions and enforce backend 401/403 as final. Role names never replace permission contracts.
- Forms distinguish local unsaved draft, backend validation, authorized approved baseline and historical read-only revision. Handle concurrency, partial drafts, conflict/validation errors and audit history explicitly.
- Preserve engineering units, datum, reference conditions, pressure absolute/gauge and pipe nominal/internal diameter semantics. Browser may format/convert display where validated; it may not invent manufacturer curves or hydraulic physics.
- Map representation cannot claim exact surveyed route when only node endpoints are available. Bound spatial queries and preserve a keyboard-accessible non-map alternative.
- Telemetry quality/freshness and query-after-reconnect are explicit. Do not fabricate domain SSE/STOMP topics when backend reports no publishers.
- No browser execution of solver equations, no simulation result fabrication, no OT/PLC/SCADA actuation, no remote telemetry/vendor assumption.
- Existing UI may be refactored/replaced only through evidence-led, bounded and tested tasks; preserve usable functionality until replacement acceptance.

## 8. Acceptance scenarios for the active product track

| Case | Operator-facing acceptance | Dependency |
|---|---|---|
| A | Create/retrieve/revise a supported pipeline system, including nodes/segments and validated connectivity | ENG-001/004/010 |
| B | Author an intermediate elevation/chainage profile with explicit CRS/datum; preserve earlier revision | ENG-003 |
| C | Register three stations, with three independently named and configured turbocompressors each, headers, connections, manufacturer/model references | ENG-002/005 |
| D | Save independently versioned supplied manufacturer characteristic curves with correct units and immutable prior revisions | ENG-006 |
| E | Author and retrieve a supported product/composition revision without inventing condition-dependent physics | ENG-007 |
| F | Freeze, retrieve and compare a complete engineering baseline after later source changes | ENG-008 |
| G | Associate trusted telemetry with an asset, showing source timestamp/quality/stale state and true permission enforcement | ENG-009/012 |
| H | Reject unsupported methods, missing required physical parameters, invalid chainage/datum and concurrency conflicts without fake defaults | ENG-001–012 |
| I | Bounded engineering import dry-run with authoritative diagnostics, permission checks, partial failure semantics and rollback | ENG-011 |
| J | Run production-mode integrated accessibility, auth/IdP, same-origin proxy/TLS, E2E, measured performance, incident/backup and rollback acceptance in the target environment | Track D / F10 |

These are **targets**, not current passing tests. Synthetic/dev fixtures never become evidence of a real GZ4 asset or industrial qualification.

## 9. Quality, CI and release gates

For each separately authorized frontend implementation task:

1. Re-read exact task authorization and both repositories' main HEADs; check earlier accepted CI, real staging/UAT blockers and dependency status.
2. Verify published API paths, schemas, permissions, DTOs and digest from a successful backend artifact. If no compatible artifact exists, **block contract-dependent implementation**; do not write guessed browser transport.
3. Pin/update only affected OpenAPI slices with recorded source SHA/digest, regenerate clients through existing Orval scripts and run compatibility checks.
4. Run applicable `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:performance`, `npm run build`, `npm run test:e2e`, and release/contract checks according to the actual task and workflow.
5. Test allowed and forbidden grants against backend enforcement; drafts, rejects, concurrency, source revision conflict, imports, old-configuration recovery and backend outage handling.
6. Uphold WCAG 2.2 AA, map text alternatives, security headers/CSP, same-origin proxy, runtime configuration, measured bundle/runtime budgets, audit/correlation, and no secrets in browser.
7. Before production claim, validate environment-specific OIDC provider, TLS/HSTS/CSP, reverse proxy, data-source quality, deployment, backup/recovery, rollback, smoke/UAT and operator signoff.
8. Verify exact-head CI; never equate `queued`, `in_progress`, previous-head success or code-only tests with new-head acceptance.

### Governance and single-task rule

Every future task needs an explicit selected code, exact authorized write scope, owner, prerequisites, exact commit message, tests, compatibility acceptance and expected-head/concurrency check before publication. No mass implementation of F01–F10. Historical roadmap task IDs remain unique and unchanged. If a critical source contract is absent, register a corresponding backend obligation in **HidraAPI**, not an invented HidraWEB adapter.

## 10. Safe refactoring and non-production migration

A not-yet-deployed HidraWEB may drop obsolete screens or rewrite components **only after** a bounded audit documents why the existing feature is unsuitable. For each removal or replacement, require: affected routes/components and client dependencies, current permissions and workflows, replacement UX, tests, rollback and explicit production data considerations. Do not erase frontend history, actual accepted CI/release artifacts, or backend records because production deployment has not occurred.

Retain existing approved functionality by default and use the foundation-first priorities to decide where frontend expansion has real engineering value.

## 11. Simulator deferral and reactivation boundary

Simulation numerical development and new solver-dependent UI remain outside the active engineering workbench. Accepted prior synthetic source/test evidence must remain intact. A future simulator can consume these versioned engineering baselines without replacing Topology, Assets, Custody, or Telemetry canonical data.

Only a formal owner-approved HidraAPI roadmap transition plus verified real simulator execution/physics model APIs can enable additional simulator features. It must separately specify per-product/model applicability, real outputs, source snapshots, safety boundaries and independent qualification. There is no automatic reactivation when F10 completes.

## 12. Publication record and next gate

**This file's creation is the only authorized repository change for this consolidation task.** It does not edit README, historical roadmaps, API contracts, gap register, source, generated API, tests or workflows. This document is a planning authority, not a new artifact-backed HidraAPI endpoint.

**Next eligible candidate:** HWEB-F01 — cross-repository source-backed contract pin and gap verification, following exact-head documentation/CI verification and formal HidraAPI roadmap disposition. F01 remains **PROPOSED — NOT SELECTED** until a separate owner selection and precise task registration.

On publication, record actual commit SHA and exact-head CI outcome externally; do not predeclare their success in this file.


## 2026-10-11 — HWEB-F01 owner selection and current-machine-contract verification gate

### Authority, task identity and concurrency lease

Owner instruction \`next\` following the cross-repository continuation audit selects
**HWEB-F01 only**, for a strictly documentary contract/capability verification
preflight. This append-only section is the bounded registration; it does **not**
select HWEB-F02–F10, a backend implementation, source-code refactoring,
simulator work, data imports, a production release or deployment. Earlier
HWEB-R01–R17 and HWEB-P01–P12 acceptance and the original proposed F-task
registry remain preserved historical evidence. This later selection supersedes
the earlier HWEB-F01 "PROPOSED — NOT SELECTED" statement for *selection only*.

- Selected task: **HWEB-F01 — API contract, capability and gap verification**.
- Owner: HidraWEB frontend contract steward, with HidraAPI as independent
  business, authorization and published-machine-contract authority.
- Initial HidraWEB \`main\`: \`ffb890a01957bec5422c54b86a3778e9500c7ad4\`.
- Initial HidraAPI \`main\`: \`a691843f359126a9f439217862f780b5806c5fd2\`.
- Governance registration commit message:
  \`docs(roadmap): select HWEB-F01 contract verification gate\`.
- This registration's **exact write allowlist**:
  \`docs/roadmap/ULTIMATE_ROADMAP.md\` only, append-only.
- This registration's **read/test scope**: the existing ultimate roadmaps,
  normative API–WEB contract §25, ENG gap register, verified OpenAPI manifest,
  existing feature-specific Orval configurations/clients, live GitHub Actions
  conclusions, and existing backend controllers/security source.
- Excluded writes: all \`src/**\`, \`openapi/**\`, generated clients, tests,
  \`package.json\`, lockfile, CI workflows, deployment, backend and simulator
  files. No guessed route, DTO, permission or schema is created.
- Next *contract-verification completion* commit message, **only after its
  prerequisite is met**:
  \`docs(contract): verify HWEB-F01 engineering API capability baseline\`.
  Before that separate publication, register its exact file/test allowlist and
  expected-head lease based on actual discovered artifacts. This registration
  does not authorize that follow-up commit or an F02 implementation.

### Verified status at selection

| Gate | Exact observed evidence | Disposition |
|---|---|---|
| Frontend exact-head code CI | HidraWEB Code CI #972, run 38134848753, \`ffb890a...\`, completed SUCCESS | PASS for existing frontend code, not new engineering-editor acceptance |
| Frontend exact-head docs CI | HidraWEB Documentation #1, run 38134848756, same head, completed SUCCESS | PASS for preceding documentation |
| Backend exact-head docs CI | HidraAPI Documentation #213, run 38135231550, \`a691843...\`, completed SUCCESS | PASS for documentation only |
| Backend full code CI | Latest observed HidraAPI CI #643, run 38131248148, \`93539be...\`, FAILURE in database-dictionary evidence capture | BLOCKED: current code HEAD has no observed full production CI SUCCESS |
| Formal simulator disposition | HidraAPI \`0fdba2d...\` committed deferral; \`b6f0d...\` HPR-P25-018 preflight; \`a691843...\` HPR-P25-019 preflight | SATISFIED for independent *planning*; no operator editing API proven |
| Earlier accepted backend OpenAPI | HidraAPI \`5028a90248ddf3a04d344308f6cfc2510f1d0ca2\`, successful run 36996917162; artifact 11222466884; \`sha256:ad6950fc33d4756d59bed3c2162bdcee0d98275bb25c4678faf5dcb31ea3dbed\` | VERIFIED historical artifact only; not recertified current HEAD |
| Frontend checked-in machine contract | \`openapi/compatibility/hidra-api-baseline.json\` pins \`5028a902...\`; full spec SHA-256 \`4ff8659ac2f19c04bae0c44001371a4c4c8c604bd10f4f324a9c4e4702e83031\`; 20 Orval feature contracts | Historical consumer pin; CI #972 verifies compatibility against this pin, not against API \`a691843...\` |
| Narrative contract metadata | Canonical contract §4 and older deployment guide still describe \`63f3f609...\` | Historical documentation drift; do not substitute it for actual checked-in manifest or claim current backend equivalence |

The live Topology \`SpringTopologyController\` at this preflight has
\`GET /api/v1/topology/capabilities\`, pipeline-system POST and facility
registration POST. It does not itself expose the full physical draft,
surveyed-profile, individual equipment and cross-owner baseline editing
lifecycle. The existing map and asset frontends remain reusable, not proof of
complete new authoring. Explicit backend-generated OpenAPI and actual
authorization evidence govern any later claims.

### ENG-001–012 verification and non-inference matrix

The following is the existing canonical contract §25 / gap-register
*planning disposition*, not a newly verified current-HEAD API inventory:

| ENG | Initial gap position | F01 evidence still required before activating associated UI |
|---|---|---|
| ENG-001 | IN_PROGRESS | Graph/node/segment create/read/revise/validate/publish methods, DTOs, grants and negative tests |
| ENG-002 | IN_PROGRESS | Station/header/unit incidence authoring and distinct installed-unit version contracts |
| ENG-003 | OPEN | Real route/profile writer with declared CRS, chainage, vertical datum and history |
| ENG-004 | IN_PROGRESS | Typed pipe-section attributes, units, controlled revisions and conflict handling |
| ENG-005 | IN_PROGRESS | Topology installed unit versus Assets maintenance identity and Party manufacturer reference contracts |
| ENG-006 | IN_PROGRESS | Approved type-specific manufacturer curve/table source writer, units, provenance and revisions |
| ENG-007 | IN_PROGRESS | Canonical Custody product/composition/source authoring; supported product types and explicit unsupported states |
| ENG-008 | IN_PROGRESS | Cross-owner immutable engineering freeze, exact revision/digest and historical replay API |
| ENG-009 | IN_PROGRESS | Approved telemetry-to-asset binding, timestamps, quality, freshness and effective grants |
| ENG-010 | IN_PROGRESS | Engineering validation, authorized approval/publication, concurrency and audit transitions |
| ENG-011 | OPEN | Bounded typed import/export, dry-run, diagnostics, atomic rollback, grants |
| ENG-012 | IN_PROGRESS | Machine-readable editor completeness, availability and effective permissions |

Each row requires an exact accepted backend method/path, request and response
schema, permission/role-independent effective grant, applicable source/test,
OpenAPI-producing commit/artifact digest, and positive/negative contract
compatibility evidence before status can move to IMPLEMENTED/VERIFIED. No
permission name, DTO, lifecycle enum or route is inferred from this table.

### Selection outcome and resumption boundary

**HWEB-F01 status: SELECTED — BLOCKED for exact-current contract
recertification.** This documentation-only selection is not HWEB-F01
completion. The missing prerequisite is a successful relevant HidraAPI
full-code CI at the applicable code-equivalent HEAD and its deterministic
published OpenAPI artifact. The failed #643 dictionary-evidence stage must be
diagnosed or a separately authorized repair verified; success of the
documentation workflow cannot waive this gate. The existing earlier artifact
may still support historical features only.

When that backend gate is satisfied, independently recover both latest
\`main\` HEADs and the new artifact SHA/digest; enumerate actual routes, DTOs,
effective permissions, generated Orval consumers, relevant negative tests and
ENG gaps; update the normative contract/gap register by separately authorized
exact allowlist; and run the specified compatibility/documentation/CI checks.
If required current endpoints are absent, remain explicitly blocked rather
than implement frontend substitutes. HWEB-F02–F10 remain NOT SELECTED.

This one-file registration changes no accepted runtime functionality.
Only new-head Documentation CI can verify this publication; its result must be
observed after commit rather than predicted.


## 2026-10-11 — HWEB-F01 artifact-verified capability assessment; compatibility gate remains open

The owner instruction `next` continues **selected HWEB-F01 only** under the
previously recorded task registration. This is its bounded documentation
verification, not F02 selection or a code/client migration. Exact allowed
write scope for this commit: this Ultimate Roadmap, the normative
`docs/architecture/Hidra-API-Web-Contract-v1.md` and the
`docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md`, all append-only.
Exact registered message:
`docs(contract): verify HWEB-F01 engineering API capability baseline`.
No source, generated client, OpenAPI manifest, tests, CI or backend files
may be changed.

Source lease: HidraWEB `9ece03254f978343ba21c8e4a04d05e07440242f`;
HidraAPI `dc01eeb3d8a2ea2fe0115a589948dd1eb8f77d67`, whose change
relative to code head `a691843f359126a9f439217862f780b5806c5fd2`
is limited to roadmap/reconciliation documentation. Full HidraAPI CI #644
(run 38135634129) completed **SUCCESS** at that exact code head; the
deterministic OpenAPI artifact `11701445061` was published with archive
SHA-256 `f1b0a07819b4103b29c219a566acdb7e7afc1becdd38d146f15030d60c433524`
and `hidra-api.json` SHA-256
`6bd2a642420b0c7cda3de61e158ff97906f05665c415e1c179c7cbbd7d1ec83f`.
Current backend Documentation #214 also passed. The earlier full CI #643
failure is historical; its previous gate is resolved by successful #644.

The actual HidraWEB machine-contract pin remains the older
`5028a90248ddf3a04d344308f6cfc2510f1d0ca2`, artifact
`11222466884`, whose embedded full JSON SHA-256 is
`4ff8659ac2f19c04bae0c44001371a4c4c8c604bd10f4f324a9c4e4702e83031`.
Existing HidraWEB Code CI #972 verified the old pin, not a new current-API
consumer migration. Inspected old versus current backend OpenAPI:
240→244 paths, 259→263 operations, 227→231 schemas; four new operations,
six changed existing schemas. The old operations and schema names remain,
but `CreateOrganizationUnitRequest.validFrom` became required;
`CreatePipelineSystemRequest.systemType` changed to `systemTypeCode`;
`PipelineSystemResponse.systemType` was replaced with type identity fields;
`StartIntegrationJobRunRequest.runNumber` disappeared. The current
identity/organization frontend slice still treats `validFrom` as optional.
Do not silently promote this artifact: the current 20 frontend Orval
consumers have not passed an accepted exact-new-artifact compatibility run.

The source-backed ENG-001–012 verification is recorded below in the
canonical contract and gap register. Existing system/facility creation,
read-only Topology Map, Assets, Telemetry, Workflow and Identity APIs remain
real **limited** contracts; no complete physical graph, surveyed route,
manufacturer curve, multi-product or engineering baseline editor is proven.
The new OpenAPI marks inspected protected operations with
`hidraBearerJwt`; it does not publish the complete per-ENG action/resource
grant matrix or forbidden-user integration evidence.

**HWEB-F01 current status: SELECTED — IN PROGRESS; consumer contract
reconciliation BLOCKED.** Resolve the concrete schema/permission changes
through owner-approved, independently tested compatibility work before any
new pin, Orval generation or F01 closure. A future contract migration
requires a separate exact file/test scope, current HEAD lease, reviewed
backend authoritative behavior, frontend typecheck/unit/E2E and exact-head
CI. F02–F10 remain PROPOSED — NOT SELECTED; simulation remains deferred.
This documentation update itself requires exact-head Documentation CI
after publication and makes no advance claim about its result.


## 2026-10-11 — HWEB-F01 organization-unit effective-date consumer correction

The owner instruction `next` continues **the already SELECTED HWEB-F01**
with one narrowly scoped compatibility remediation, not HWEB-F02 or a
new backend/simulation task. Full backend CI #644 (38135634129, SUCCESS)
published verified code commit `a691843f359126a9f439217862f780b5806c5fd2`
with `CreateOrganizationUnitRequest.validFrom` required (the backend
record has `@NotNull Instant validFrom`, and command validation rejects
null). Latest backend `dc01eeb3d8a2ea2fe0115a589948dd1eb8f77d67`
is documentation-only beyond that verified code. The existing HidraWEB form
uses `optionalInstant`, initially leaves `validFrom` empty, and permits
submitting `undefined`. The actual published backend contract therefore
requires a consumer correction before adopting the new OpenAPI.

**Execution scope and exact commit message:** `fix(organization): require explicit unit validFrom`.
Exact write allowlist:
- `src/features/context/components/OrganizationCommandPanel.tsx`
- `src/features/context/components/OrganizationCommandPanel.test.tsx` (new)
- `src/features/context/model/organizationUnitValidFrom.ts` (new)
- `src/features/context/model/organizationUnitValidFrom.test.ts` (new)
- `docs/roadmap/ULTIMATE_ROADMAP.md` (this append-only record)

The correction requires an explicitly supplied, valid local date/time;
it disables creation until supplied and refuses to synthesize a fallback.
The command must carry a converted ISO instant. New pure validation and
component submission tests cover missing, malformed and valid input.
No backend endpoint/DTO, static permission, implied effective date,
engineering data, simulator state or unapproved integration is introduced.
The old frontend OpenAPI manifest and all generated-client inputs remain
unchanged, keeping the existing 20-feature compatibility gate stable.

**Acceptance:** exact commit parent/allowlist/diff verification, new-head
Code CI test/typecheck/build/Playwright and Documentation CI results.
This registration is not advance evidence of CI success. HWEB-F01 remains
**IN PROGRESS**: the full current backend OpenAPI repin, all affected
consumer slices and effective-permission/negative-case acceptance are
still separate prerequisites; HWEB-F02–F10 remain NOT SELECTED.


## 2026-10-11 — HWEB-F01 CI #973 failure: existing Playwright contract expectation reconciled

Owner reported failure of HidraWEB Code CI #973, run `38137156051`, at
commit `a51651b429043e34f734e7a148bf497abd7b9a25`.
Exact job logs: OpenAPI compatibility, all generated clients, lint,
TypeScript typecheck, unit tests, performance, build and release package
checks **PASS**; Playwright suite 60/61 passed. The single failed case,
`tests/e2e/bootstrap.spec.ts:195`, expects the `Créer une unité`
button to be enabled without entering `validFrom`. The HWEB-F01
backend-contract correction deliberately disables that action until a
supplied valid date exists; backend `CreateOrganizationUnitRequest`
uses `@NotNull Instant validFrom`. Retaining the old test expectation
would reauthorize a request the backend no longer accepts.

**Selected action:** Repair only CI #973's stale regression expectation,
not the implementation, backend or another roadmap task.
**Exact commit message:** `test(organization): align effective-date Playwright regression`.
**Allowed writes:** `tests/e2e/bootstrap.spec.ts` (replace the stale
single assertion with a negative check, an explicit local effective
date entry and a positive enablement check), plus append-only
`docs/roadmap/ULTIMATE_ROADMAP.md` evidence. The test uses the
existing mocked permission grant; it does not invent a new endpoint,
date default, permission or persisted record. No OpenAPI repin, client
generation, code/feature change, CI workflow modification, numerical
simulation, or HWEB-F02–F10 selection.

Publication acceptance requires verifying the exact parent commit,
two-file diff, and new-head GitHub Actions Code CI startup. CI success
must be observed before accepting this regression repair; do not
declare it prematurely. HWEB-F01 remains IN PROGRESS until its broader
backend-consumer compatibility and authorization checks pass.


## 2026-10-14 — Authorized authentication enhancement: unified, explicitly approved provider choices

Owner explicitly requested and authorized simultaneous HidraWEB provider selection,
independent of the still-open HWEB-F01 full OpenAPI reconciliation. This
stage does not select F02, change HidraAPI, migrate real deployments or
reactivate numerical simulation.

**Backend truth:** HidraAPI main `545ec4e60a0c92099bedd36892b993ed6df2a4b9`.
`HidraSecurityConfiguration` permits
`POST /api/v1/identity/authentication/login` in JWT server security mode
and separately verifies OIDC external assertions on
`POST /api/v1/identity/authentication/oidc/complete`.
`IdentityAuthenticationRequestRouter` selects LOCAL or LDAP/AD
by explicit providerType without fallback. This is code-level capability,
**not** evidence that a specific enterprise directory/IdP is deployed.
No public endpoint for available login providers is accepted, so browser
availability is an explicitly approved deployment allowlist, not discovery.

**One scoped implementation:** `feat(auth): add deployment-approved multi-provider login`.
Exact write allowlist:
- `src/app/bootstrap/runtimeConfig.ts`
- `src/app/bootstrap/runtimeConfig.test.ts`
- `src/app/auth/authContext.ts`
- `src/app/auth/AuthProvider.tsx`
- `src/app/pages/LoginPage.tsx`
- `src/app/pages/LoginPage.test.tsx` (new)
- `src/shared/i18n/resources.ts`
- `.env.example`
- `.env.production.example`
- `docs/roadmap/ULTIMATE_ROADMAP.md` (append-only)

New browser-only opt-in: `VITE_HIDRA_AUTH_MODE=multi` together with a
mandatory `VITE_HIDRA_ENABLED_AUTH_PROVIDERS` list of at least two from
LOCAL, LDAP, ACTIVE_DIRECTORY, OIDC. If OIDC is selected, a deployment-approved
`VITE_HIDRA_OIDC_REDIRECT_URI` is required. Reject missing, malformed,
duplicate or unknown providers at startup. Existing `basic`, `jwt`, and
`disabled` modes are preserved; non-multi mode cannot silently enable other
providers. OIDC remains Authorization Code + PKCE and swaps the temporary
external token for a Hidra-issued session. Direct credentials go only to
the explicitly selected LOCAL/LDAP/AD route; switching providers clears the
password. Access and provider readiness remain enforced by HidraAPI and the
real external systems; no fallback, secret storage or invented endpoints.

**Verification:** targeted runtime configuration/selection tests, previous
authentication/security tests, exact-new-HEAD OpenAPI compatibility,
lint/typecheck/unit/performance/build/package verification, full Playwright
regression and release artifacts via Code CI. This registration does
**not** predeclare success. Deployment OIDC/LDAP/AD smoke and user acceptance
remain unverified without owner-provided environment configuration.

## 2026-10-14 — HWEB-F01 narrow identity-organization Orval contract correction

Owner `next` resumes the already selected HWEB-F01 compatibility work after
the separate authentication enhancement was Code CI #976 SUCCESS on
`5fba56b7fb0bcf73afa3aed6cccb75cfd37fc900`.
The latest checked HidraAPI full-code CI #678, run `38466217702`,
completed SUCCESS on backend code
`e1695a0848e005f3fac272dd80d2a80f03f5ce2c`.
The published `hidra-api-openapi-...` artifact ID `11848803507`
(api-contract variant, archive SHA-256
`9e449c26cf44309ce67b23401fecb7b9ba743468107b09b3b14ca56d2a042791`)
contains `CreateOrganizationUnitRequest.validFrom` as a required
`date-time` string. Its JSON SHA-256 is
`cde077455aec099d07d39c4fff7cd3740039baeb6f67dd0bdfa08a831ae4e7df`.
The other paths and component schema shape match the previously reviewed
post-HPR baseline except the documented six changed DTOs and new operations.
HidraAPI latest `main` is documentation/CI-only beyond the verified
source contract; exact head must still be verified before follow-up tasks.

**Selected bounded implementation:** correct only the checked-in
identity/organization Orval request schema for `validFrom` so its generated
TypeScript DTO cannot accept omission. The existing command form already
supplies an explicit validated ISO instant, and no new business action or
authentication behavior is introduced. Added a typechecked Vitest regression
against the generated `CreateOrganizationUnitRequest`.

**Exact commit message:**
`fix(contract): require organization validFrom in Orval slice`.

**Exact file allowlist:**
- `openapi/hidra-identity-organization-63f3f60974ce57eb8cd5e42910397615195624fb.json` (only `CreateOrganizationUnitRequest.required`)
- `src/features/context/model/organizationUnitValidFrom.test.ts`
- `docs/roadmap/ULTIMATE_ROADMAP.md` (append only)

**Gate:** new-head Code CI must regenerate the client, validate old pinned
compatibility, typecheck the mandatory field, run unit tests and Playwright.
This narrow contract correction is **not** a claim that the full backend
contract has been repinned; HWEB-F01 still needs accepted current full
artifact evidence, all consumer slices, permission-negative tests and
integration acceptance. HWEB-F02–F10 remain unselected and simulation
remains deferred. CI success is not assumed before observation.


## 2026-10-14 — Local clean-checkout build bootstrap remediation

Owner reported 132 TypeScript errors from direct `npm run build` after
HWEB-F01 Orval request-schema correction. On exact current HidraWEB
`9c92efa2b8c864b3cb2e34b7b86f9b88084bd125`, Code CI #977
(run `38535952756`) passed **SUCCESS**, including all 20 generated
Orval clients and full production build. The checked-in source tree
contains only `src/api/generated/.gitkeep` and does not version any
generated TypeScript client. CI explicitly runs 20 `api:generate:*`
commands prior to `npm run build`, but the local `build` script runs
`tsc -b` immediately, so a direct clean-checkout invocation has no
generated imports. This mismatch is a verified reproducible precondition
for missing-module errors, although the owner's exact 132 diagnostics
were not provided and their complete composition cannot be asserted.

**Authorized bounded correction:** attach an npm `prebuild` script
that inventories the 20 checked-in `orval.*.config.ts` sources and
their pinned OpenAPI inputs, detects missing/outdated generated entry
points and schema index files, runs `openapi:compatibility` before
generation, and invokes only corresponding checked-in npm Orval
generators. When all outputs are current (normal CI path), it skips
all regeneration. A failing generator or invalid contract stops the
build rather than silently suppressing TypeScript errors. The
implementation uses `process.execPath` plus `npm_execpath` for
cross-platform npm/Windows compatibility and does not contact
HidraAPI or change any REST contract.

**Exact commit message:** `fix(build): bootstrap pinned Orval clients for local builds`.
**Exact write allowlist:** `package.json`,
`scripts/ensure-generated-clients.mjs` (new),
`scripts/ensure-generated-clients.test.mjs` (new),
`README.md`, `docs/roadmap/ULTIMATE_ROADMAP.md`
(append only). Node-native preflight regression tests are wired into
the existing `npm run test` lifecycle and exercise fresh,
incomplete, stale, and invalid generator inventory behavior. No
backend, physics, authoring feature, security or CI workflow
changes are introduced.

Accept only after new-head Code CI OpenAPI/generator/lint/typecheck/test/
performance/build/Playwright/package/release gates pass; do not infer
user-local success without their environment output. HWEB-F01
remains IN PROGRESS pending full current HidraAPI contract repin.

## 2026-10-14 — SONATRACH-aligned, accessible HidraWEB login experience

Owner directly selected a visual/UX enhancement of the current unified
login page, requested SONATRACH colors and no source-code comments.
This is an independent UI refinement, not a new authentication
provider/protocol, HidraAPI change, current OpenAPI repin or simulation task.
At the preflight source lease, `main` was
`5e3ed03cb0274828cf436646e8dd3846c51d344f` and Code CI #979
(run `38538306817`) was SUCCESS.

**Implementation:** use the brand's orange (#FF8500), dark neutral and
white primary palette in this login screen. Do not fabricate an official
SONATRACH logo asset or ship unlicensed fonts; the typographic product
mark is an interface treatment, not the official corporate logotype.
A responsive split desktop layout collapses to a compact branded
header on mobile. Provide a single clear heading, approved-provider
selector, localized field descriptions, an accessible password
visibility toggle, form completeness gating, a distinctly separated
OIDC SSO entry point, keyboard-visible focus, retry/error display
and language switching (FR/EN/AR) via the existing i18n instance.
Changing credential providers clears the entered password and hides
the stale error display until retry. Login requests, OIDC PKCE,
provider allowlist, Hidra-issued session contract, permissions and
redirect are all unchanged. No comments are introduced in the
updated TypeScript or TSX files.

**Exact authorized files:** `src/app/pages/LoginPage.tsx`,
`src/app/pages/LoginPage.test.tsx`,
`src/shared/i18n/resources.ts`,
`docs/roadmap/ULTIMATE_ROADMAP.md` (append-only).
**Commit message:** `feat(auth-ui): refresh login with Sonatrach palette and accessible flows`.

**Acceptance:** exact commit parent/allowlist verification, client
OpenAPI gate, lint, typecheck, component and unit tests, performance,
Vite build/release package, and complete Playwright regression
through exact new-head Code CI. Enterprise directory and OIDC
deployment smoke tests remain environment-specific. HWEB-F01
machine-contract reconciliation remains in progress and unaffected.

## 2026-10-14 — Login Arabic RTL floating-label and provider localization correction

Owner accepted the new SONATRACH-aligned login design and identified two
remaining usability defects: Arabic Material UI floating labels remained on
the left and credential provider choices were English-only. Verified
HidraWEB Code CI #983 was SUCCESS on exact preflight `main`
`2dd506715864552a8d82e80a3930c465aeb9ce04`.

**Implemented scope:** the login content switches its direction with
the active FR/EN/AR language. Arabic MUI outlined input labels use
right-origin positioning for initial and floating states, while field
notches, helper text, entered text, select icons and selected text adopt
right-aligned presentation. The dropdown options explicitly adopt
Arabic direction even when their MUI popover is portaled. Three
translation sets provide meaningful localized names for the exact
LOCAL, LDAP and ACTIVE_DIRECTORY choices without changing the
backend-bound identifiers. The existing deployment-approved provider
allowlist, password clearing on provider switch, authentication
submission, OIDC PKCE, session lifecycle and default login modes remain
unchanged. EN and FR retain their normal LTR layout.

**Regression evidence to be tested:** mocked multi-provider component
case asserts the Arabic labels, RTL dropdown and canonical LDAP
transport value; a Chromium Playwright login case measures Arabic
username label geometry after focus. All existing sign-in journeys,
unit/performance tests, OpenAPI compatibility, production build and
release verification must pass on the published head.

**Exact commit message:**
`fix(auth-ui): align Arabic RTL fields and localize provider choices`.
**Exact paths:** `src/app/pages/LoginPage.tsx`,
`src/app/pages/LoginPage.test.tsx`, `src/shared/i18n/resources.ts`,
`tests/e2e/bootstrap.spec.ts`,
`docs/roadmap/ULTIMATE_ROADMAP.md` (append only).

This change adds no source-code comments, branch or PR. CI success is
not assumed until observed. HWEB-F01 backend-contract reconciliation
remains in progress independently.

## 2026-10-14 — HWEB-F01 risk authoring permission-negative browser acceptance

**Selected bounded HWEB-F01 implementation:** add an executable,
synthetic-only Playwright authorization-negative slice for the three
already supported Risk authoring commands. This is HWEB-F01
verification work, not HWEB-F02/F03 or new Risk capability design.

**Preflight:** exact HidraWEB `main`
`2b009be6b959943e937dcd02f16080b76a5a9ceb`;
Code CI #986 `38551966210` SUCCESS. HidraAPI latest
`81d46bcb8bc8821f67eafbb26cd1279f6d091457`;
Fast Feedback #16 and Documentation #287 SUCCESS,
Full CI #683 still in progress at preflight. Latest completed
backend Full CI #682 was SUCCESS on
`3facf12aef110cb33f0b896398c9b1cee51af5f3`,
publishing exact source-generated OpenAPI artifact
`11884823777` for run `38547562367`, digest
`sha256:f5afaffef63acf743443f692f6d9b2d91a61679ab3301edde77a2737cda3e113`.
Retrieved artifact `hidra-api.json` SHA-256
`df6d88c188e63cb39182ff1fee424c06de5e0f6e0c03556ff8cfa65fe26b7e3c`,
244 paths and 231 schemas. The artifact exposes the three existing
Risk POST authoring endpoints plus an optional `scopes` array on
`CreateRiskAssessmentRequest` whose items carry explicit scope,
topology snapshot, temporal window, inclusion and note fields.
The current pinned Risk Orval slice omits `scopes`: this is a
recorded compatibility backlog item, **not** acceptance of full
current contract alignment and not license for an untyped editor.
No Risk frontend generator inputs are repinned in this stage.

**Executed scope:** expand the existing Risk browser regression fixture
to distinguish unpublished Risk command route metadata, published
metadata without effective user permission, and apparently granted
metadata followed by actual HidraAPI 403 denial. New negative tests
require all three authoring buttons to remain disabled and send no
writes without grants, and require a simulated 403 on assessment
creation to remain a visible authorization refusal. Test permissions
and mock request responses are **synthetic**, not declarations of the
current live permission strings or proof of deployed authentication.
No new Risk lifecycle, scoring, physical simulation, source migration
or business authoring capability is introduced.

**Exact commit message:**
`test(risk): verify backend-governed authoring denials`.
**Exact path allowlist:**
`tests/e2e/risk-workspace.spec.ts`,
`docs/roadmap/ULTIMATE_ROADMAP.md` (append-only).

**Acceptance gate:** exact parent/scope/head, compatibility,
regeneration, lint/typecheck, unit/performance, production
build/package and full browser suite on the new Code CI run.
HWEB-F01 remains IN PROGRESS until full current-backend
contract repin, all affected slices and comprehensive permission/
negative-case evidence are accepted. Do not presume CI success.

## 2026-10-14 — HWEB-F01 current-artifact contract drift preflight

**Selected bounded implementation:** introduce a deterministic, opt-in,
artifact-file-based API–WEB drift audit to make full-current backend
OpenAPI repinning reproducible. This is HWEB-F01 work, not F02–F10,
a runtime browser request change, automatic schema adoption or release.

**Verified preflight:** HidraWEB main
`c994f4941737f72e50dbf3fc184599783310fc7b`,
Code CI #987 `38553856855` SUCCESS and Documentation CI #11
`38553856799` SUCCESS. HidraAPI main
`81d46bcb8bc8821f67eafbb26cd1279f6d091457`,
Full CI #683 `38552443731` SUCCESS. Published API-contract
OpenAPI artifact #11887551780, workflow #683, has recorded GitHub
artifact digest
`sha256:9e03c889893ae69ffcc9bb52a37e2103555d3350c2579f6cec46649188aec632`;
its contained `hidra-api.json` was checked locally at SHA-256
`59e2881d5d84dea902bf0c7aa5c773a83a0ba47246838b30769ed645c7228969`,
244 paths and 231 schemas. Artifact-ZIP digest and extracted-JSON
digest are distinct and are not interchangeable.

**Scope:** `scripts/audit-openapi-drift.mjs` reads a supplied
complete OpenAPI 3.1 backend JSON file, optionally verifies its exact
SHA-256, enumerates every checked-in feature Orval config and pinned
JSON/YAML input, and reports machine-readable, route-specific
schema/field/required/enum/type/format/parameter and
path/method/response differences. Its `--strict` option returns
nonzero on observed drift; the default audit is read-only and does not
change CI acceptance or require network access. This is a targeted
contract-shape inventory, not a complete semantic/security guarantee:
backend routing permissions, cross-owner semantic invariants,
or Java implementation cannot be inferred from OpenAPI alone.
Node tests use synthetic fixtures for added optional Risk
`scopes`, missing methods, removals, breaking additions and
digest enforcement; they are integrated into `npm test`.

**Operator command once the verified ZIP is extracted:**
`npm run openapi:drift -- --backend <path-to-hidra-api.json> --expect-sha256 59e2881d5d84dea902bf0c7aa5c773a83a0ba47246838b30769ed645c7228969`.
For a nonzero drift guard also pass `--strict`.
No full spec or secret is generated by this task, and existing
`npm run openapi:compatibility` evidence hash checks remain unchanged.

**Commit message:** `test(contract): add verified backend OpenAPI drift audit`.
**Exact write scope:**
`scripts/audit-openapi-drift.mjs` (create),
`scripts/audit-openapi-drift.test.mjs` (create),
`package.json` (update script and Node tests),
`docs/roadmap/ULTIMATE_ROADMAP.md` (append-only).

**Acceptance:** exact main parent/tree/path verification, published
Code CI and Documentation CI startup, full existing static/TypeScript/
unit/performance/build/Playwright regression. No assertion that the
new CI succeeds until GitHub confirms it. HWEB-F01 stays
IN PROGRESS: next bounded implementation is a verified, full
artifact-backed repin of the current backend contract with regenerated
affected Orval clients and integration tests, keeping any unsupported
operator engineering authoring unselected.

## 2026-10-14 — HWEB-F01 source-verified current Risk OpenAPI candidate

**Selected bounded scope:** import the exact current published HidraAPI
Risk contract slice as a versioned, nonactive candidate and test its
provenance, schema coverage and additive differences before migrating
the live Orval pin. This is an incremental HWEB-F01 evidence stage,
not final whole-platform repinning, implicit approval of new Risk
lifecycle controls or HWEB-F02–F10 selection.

**Verified starting points:** HidraWEB `main`
`8d4d92a8e33e50a8614d0ca376175bfc0cd78ff9`, Code CI #989
`38556023357` SUCCESS. HidraAPI `main`
`97c60fed8aabafda71a63ccbd2c772ba484c4739` is subsequent
documentation; the latest source-backed published full OpenAPI
was produced by successful HidraAPI Full CI #683
`38552443731` at
`81d46bcb8bc8821f67eafbb26cd1279f6d091457`.
Artifact ID `11887551780` has GitHub artifact digest
`sha256:9e03c889893ae69ffcc9bb52a37e2103555d3350c2579f6cec46649188aec632`.
Its `hidra-api.json` raw SHA-256 is
`59e2881d5d84dea902bf0c7aa5c773a83a0ba47246838b30769ed645c7228969`.
All ten `/api/v1/risk/` operations plus the transitive closure of their
nine schema references were extracted with original fields,
operation IDs, response types and bearer security, canonicalized with
sorted JSON object keys. The resulting 8,462-byte candidate has
SHA-256 `c4b5e87473bea32fa7d2724e4871ca0017a0e43ae76dd063a459f69d6e94b3f0`
and exact Git blob SHA
`9799e93131a768280f3e099bc496437ce2b0b5ed`.
The Git blob digest was independently reproduced by rebuilding the
canonical candidate from the current checked-in Risk input plus
the specific latest-source deltas; byte identity was verified before
publication, not inferred from schema-name similarity.

**Coverage:** an optional, typed `scopes` array on
`CreateRiskAssessmentRequest` referencing
`RiskAssessmentScopeInput` (scope type/id, topology snapshot,
time bounds, inclusion flag, note); separate approve/score/submit
Risk governance operations with their own explicit wire requests
and bearer authentication requirement. Publishing route shapes
does **not** establish a current user's effective route-permission
grant, governance eligibility or permission to add browser actions.
No new frontend Risk action button, client DTO, scoring or approval
command is activated by this evidence stage.

**Exact committed scope:**
`openapi/candidates/hidra-risk-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json` (create),
`scripts/verify-risk-candidate.test.mjs` (create),
`package.json` (append Node regression entry),
`docs/roadmap/ULTIMATE_ROADMAP.md` (append only).
**Registered commit message:**
`test(contract): pin verified Risk OpenAPI candidate for HWEB-F01`.
Source comments, security/authentication logic, the current active
`orval.risk.config.ts`, old pinned source slice, full baseline manifest,
generated clients, CI definitions and unrelated business pages remain
untouched.

**Acceptance:** exact parent, tree, blob and four-file allowlist;
current GitHub Code/Documentation CI with compatibility, generation,
lint, TypeScript, Node/Vitest, performance/build/Playwright.
CI acceptance requires observed completion; starting a workflow
does not prove success. HWEB-F01 remains IN PROGRESS. Next separately
bounded stage is the coordinated active full OpenAPI baseline repin,
affected generated Orval clients, consumer reconciliation and
permissions/integration acceptance; retain old source-backed
contracts until the new verified baseline can pass the full gate.

## 2026-10-14 — HWEB-F01 activate immutable source-verified Risk Orval contract

**Selected one bounded integration stage:** activate the Risk-only
OpenAPI contract candidate previously accepted in the successful
Documentation #13 / Code #990 evidence, without prematurely changing
the other 19 generated transport inputs or enabling additional
workflow/approval/scoring commands in browser pages.

**Exact starting point:** HidraWEB `main`
`8da5113e4585b7715c5de66bdb55070c8720cd9c`;
HidraWEB Code CI #990 `38557759422` and
Documentation CI #13 `38557759534` SUCCESS.
HidraAPI code-source baseline
`81d46bcb8bc8821f67eafbb26cd1279f6d091457`
had verified Full CI #683 `38552443731`, publishing API
OpenAPI artifact #11887551780. Subsequent backend main commits
are *not* silently assumed to be reflected by this pinned slice;
a later current-head, complete-full-contract repin remains required.

**Bounded implementation:**
`orval.risk.config.ts` now selects exactly
`openapi/candidates/hidra-risk-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json`
as the active generation input. The existing checked-in Risk source
from 63f3f609 remains immutable historical evidence. The 8,462-byte
candidate has previously verified SHA-256
`c4b5e87473bea32fa7d2724e4871ca0017a0e43ae76dd063a459f69d6e94b3f0`
and 10 operations/9 referenced schemas. A bounded upgrade to
`scripts/check-openapi-compatibility.mjs` enforces all of:
the exact Risk source path, source byte digest, OpenAPI 3.1 structure,
exact route/schema counts and a Risk-only path prefix. Failure
remains fatal to CI. Every other Orval configuration continues to
pass the original full historical HidraAPI baseline comparison and
all original full-payload hashes. This is **two explicit source pins**,
not a claim of one globally repinned current backend.

The existing Node contract regression asserts that the active
Orval Risk input has changed to the immutable source, preserved
legacy artifacts are still compared and the compatibility gate
retains both the Risk hash assertion and existing historical full
slice checks. The generators run during the established GitHub
Code CI and compile the resulting TypeScript types, including
Risk assessment scope inputs and the newly published governance
wire requests. UI Risk actions remain restricted to the existing
HidraAPI-backed register/assessment/evidence commands; the mere
presence of a generated governance operation grants no permission.

**Exact commit message:**
`fix(contract): activate verified Risk OpenAPI source pin`.
**Exact path allowlist:**
`orval.risk.config.ts`,
`scripts/check-openapi-compatibility.mjs`,
`scripts/verify-risk-candidate.test.mjs`,
`docs/roadmap/ULTIMATE_ROADMAP.md` (append-only).
No code comments, no CI/workflow alteration, no PR or new branch,
no change to runtime authorization, simulation or business state.

**Acceptance:** publish to expected `main` parent,
verify exact tree/path/blob scope, then observe Code CI startup.
Lint, full 20-slice generation, TypeScript, unit tests, performance,
build/release and full Playwright all remain mandatory.
Do not mark this stage VERIFIED from a merely started run.
HWEB-F01 remains IN PROGRESS; next bounded slice is the
full current source-backed OpenAPI baseline repin plus affected
generated consumer/API and permission integration reconciliation.

## 2026-10-14 — HWEB-F01 source-verified Topology contract activation

**Selected one bounded HWEB-F01 slice:** activate the exact
latest accepted backend Topology transport contract with reproducible
artifact integrity checks, without selecting HWEB-F02, adding a browser
physical-network editor, or modifying business write privileges.

**Starting point:** HidraWEB main
`5ebfa3b0887c9d3d709dc174accd3ae7ae8eb21a`;
HidraWEB Code CI #991 `38559148849` SUCCESS and Documentation CI
#14 `38559148819` SUCCESS. HidraAPI last fully verified
OpenAPI-producing commit
`81d46bcb8bc8821f67eafbb26cd1279f6d091457`,
Full CI #683 `38552443731` SUCCESS, published API-contract artifact
#11887551780. Its raw `hidra-api.json` SHA-256 is
`59e2881d5d84dea902bf0c7aa5c773a83a0ba47246838b30769ed645c7228969`.
Current HidraAPI main `da4ce33ead7db40776049c861027947b61b96270`
had Full CI #685 IN PROGRESS at preflight; do not claim its
completion or conflate its head with source #683. Compare-current
evidence includes test and inventory revisions outside the
previous published API source.

**Source artifact reconstruction:** select all ten
`/api/v1/topology/` routes and their transitive referenced
thirteen schemas from the exact verified full backend JSON,
preserve operation IDs and response/parameter/security shape,
remove server-local URL and source display metadata, serialize
with sorted keys, and verify Git blob digest
`ae0ac711c6693a6c01f05423559c98f2128c273f`
identical to independently reconstructed canonical slice.
Exact raw candidate SHA-256:
`d13552357918e27dd51d6377e5fef6eaaff621be953bfa50ad9f7f7247440904`.
The candidate contains the five previously used map read endpoints,
a capabilities read, alias and canonical create routes for pipeline
systems, and alias and canonical facility-registration routes.
This is evidence of exposed **transport shapes**, not completeness of
ENG-001–012 engineering authoring.

**Implementation scope:** update
`orval.topology.config.ts` to use the immutable versioned
candidate; update the machine compatibility checker to require
Topology exact path, SHA-256, 10 route and 13 schema counts,
OpenAPI version and topology-prefix restriction. Preserve the
Risk #683 pin and its digest, preserve all other 18 legacy
full-source baseline checks/hashes, and fail closed on mismatch.
An independent Node regression test verifies the candidate hash,
typed pipeline system and facility request/response contracts,
bearer security, continued map reads, additive delta and the
active source lock. Integrate it into the existing Node test
stage without changing workflow definitions.

**Exact commit message:**
`fix(contract): activate verified Topology OpenAPI source pin`.

**Exact path allowlist:**
`openapi/candidates/hidra-topology-81d46bcb8bc8821f67eafbb26cd1279f6d091457.json` (create),
`orval.topology.config.ts`,
`scripts/check-openapi-compatibility.mjs`,
`scripts/verify-topology-candidate.test.mjs` (create),
`package.json`,
`docs/roadmap/ULTIMATE_ROADMAP.md` (append-only).

No simulated engineering data, editor implementation, new UI
permissions, numerical solver, changed existing map queries, source
comments, PR or new branch. CI regenerates Topology Orval types from
the accepted candidate, then runs existing unit/TypeScript,
Playwright, performance, build/release and compatibility gates.

**Acceptance:** verify exact parent, tree, changed-file allowlist
and workflow startup on published main. Only a completed
successful Code CI promotes the active Topology source to VERIFIED.
HWEB-F01 remains IN PROGRESS: coordinated complete source-backed
OpenAPI baseline repinning and all other generated client/
consumer and permission reconciliation are outstanding;
HWEB-F02–F10 remain unselected.

## 2026-10-14 — HWEB-F01 activate source-verified Telemetry/Monitoring Orval contract

**Selected one bounded contract-reconciliation slice:** source-pin
Telemetry/Monitoring generated transport to the exact latest
HidraAPI Full CI artifact, preserving the existing operational
read-only browser workflows and declining any automatic new writes,
simulation or industrial control effects.

**Exact preflight:** HidraWEB `main`
`335981e86e58254a8a2674a1275103c9fbdc8bba`,
Code CI #992 `38560725477` SUCCESS,
Documentation CI #15 `38560725490` SUCCESS.
HidraAPI `main` `da4ce33ead7db40776049c861027947b61b96270`,
Full CI #685 `38559065173` SUCCESS, Fast Feedback #18 SUCCESS,
Documentation CI #290 SUCCESS. Exact published backend
API-contract artifact ID `11891417141`, artifact digest
`sha256:41415af15d2809ab71996cb5b6e2ba74c8f22dd3eaa8407975810a873c7098e3`.
The verified ZIP contains `hidra-api.json` (457,784 bytes),
with SHA-256
`e0f4e27c4ee84675b7a99fce55454c275b5e320e0f63c1202fe63b4d7a8553b3`,
OpenAPI 3.1, 244 paths and 231 schemas. The ZIP digest
and JSON digest are distinct evidence.

**Source exactness:** extract both `/api/v1/telemetry/`
and `/api/v1/monitoring/` operations and transitive referenced
schemas from the published full JSON, removing local server URL
and source-display metadata. Canonical sorted-key serialization
has 15,825 bytes, exactly 17 paths / 16 schemas, SHA-256
`55f5ea67d7dfecb6c2b5a88bd6619a58081d653d92d44518aacbdace03b792f3`,
Git blob SHA `94f3a91a9a2725588a333334501edacd901e22c3`.
A completely reconstructed candidate from the old checked-in
Telemetry/Monitoring contract and current-source additions
reproduced this exact Git object identity before publication.
The new contract includes typed source and point authoring,
monitoring rule/deviation requests and responses, aliases,
capabilities and all existing query routes. It does not prove
SCADA write access, live OT telemetry, simulation triggering,
calibration or domain realtime event publishers.

**Bounded implementation:** pin
`orval.telemetry-monitoring.config.ts` to
`openapi/candidates/hidra-telemetry-monitoring-da4ce33ead7db40776049c861027947b61b96270.json`;
extend `scripts/check-openapi-compatibility.mjs` to enforce
the exact path, hash, version, 17-route/16-schema coverage and
Telemetry/Monitoring prefix. Risk and Topology source SHA locks
remain unchanged; all other 17 legacy Orval sources continue
to use the original full baseline comparison and its hash checks.
An independent Node regression covers raw source digest, typed
requests, backend bearer requirement, enum contract, existing
read endpoints and the mixed-source gate. Add the test to
`npm test` without changing GitHub workflow definitions.

**Commit message:**
`fix(contract): activate verified Telemetry Monitoring source pin`.
**Exact allowed writes:**
`openapi/candidates/hidra-telemetry-monitoring-da4ce33ead7db40776049c861027947b61b96270.json` CREATE;
`orval.telemetry-monitoring.config.ts`;
`scripts/check-openapi-compatibility.mjs`;
`scripts/verify-telemetry-candidate.test.mjs` CREATE;
`package.json`;
`docs/roadmap/ULTIMATE_ROADMAP.md` APPEND ONLY.

**Publication/acceptance:** only `main`, expected-head
compare-and-swap, exact parent/tree/scope verification,
observe Code and Documentation CI startup then stop.
CI will rerun the unchanged full compatibility/Orval
generation, lint, TypeScript, Node/Vitest, performance,
build/release and Playwright gates. No CI success may be
inferred from merely starting workflows. HWEB-F01 stays
IN PROGRESS pending all remaining source-backed transport
repins, business permission/consumer reconciliation and
integrated acceptance. F02–F10 and simulator remain unselected.

## 2026-10-14 — HWEB-F01 activate verified Workflow OpenAPI source

**Selected one bounded source-backed contract stage:** replace the
legacy Workflow Orval input with an immutable, byte-verified slice
of HidraAPI's published full OpenAPI artifact. Preserve existing
task inbox/action/transition APIs and user-level authorization;
do not invent new workflow create, execute, decision or approval
controls in HidraWEB and do not advance F02–F10.

**Exact preflight:** HidraWEB `main`
`966156e4295df570a1a50789b89b262fe2329e2e`,
Code CI #993 `38562135392` SUCCESS and Documentation CI
#16 `38562135605` SUCCESS. HidraAPI last full published
source commit `da4ce33ead7db40776049c861027947b61b96270`;
Full CI #685 `38559065173` SUCCESS, source-generated
API-contract ZIP artifact #11891417141 with artifact digest
`sha256:41415af15d2809ab71996cb5b6e2ba74c8f22dd3eaa8407975810a873c7098e3`.
Its raw `hidra-api.json` has SHA-256
`e0f4e27c4ee84675b7a99fce55454c275b5e320e0f63c1202fe63b4d7a8553b3`.
Current backend main `ae9f639fe55cfc15cf571b5b6e5fa6cd47532cdc`
has newer documentation; it is not silently equated with the
Full-CI OpenAPI production artifact.

**Deterministic extraction and exactness:** choose all
`/api/v1/workflow/` paths and their transitive schema references
from that same published `hidra-api.json`, preserve operation IDs,
backend security, required inputs, query parameters and response
shapes, remove local server/source-display metadata and unrelated
global metadata, and serialize objects in sorted-key canonical JSON.
The resulting candidate contains **12 routes, 13 schemas and
13,126 bytes**, SHA-256
`becdd0505299b437d743fe71ffabb56bca26211435ce43dc2669ac8095f975f5`,
Git blob SHA `c4d02468a7a6b66ef60bd5517084de81db5fb168`.
This Git blob identity was independently reconstructed from the
original checked-in Workflow specification plus the verified current
source's added schema and operation shapes, including the current
backend `info` metadata. An initial candidate mismatch was
corrected **before publishing**; only the exact matching object
may become the active source.

**Verified scope:** retain GET task inbox/detail/available-actions
and instance/timeline reads, POST action recording and optimistic
transition execution with required `expectedTaskUpdatedAt`.
Add the backend's typed instance start and task create requests,
responses and alias transport routes and capabilities read.
The presence of bearer security in OpenAPI does not grant a
specific operator a workflow permission or imply a completed
business process. New generated transport operations must not
automatically create UI write actions.

**Bounded implementation:** create
`openapi/candidates/hidra-workflow-da4ce33ead7db40776049c861027947b61b96270.json`;
repin `orval.workflow.config.ts` to it; enforce exact path,
SHA-256, OpenAPI 3.1, 12-route/13-schema coverage and workflow
prefix in the existing compatibility checker. Preserve independent
Risk, Topology and Telemetry/Monitoring source locks and the other
16 historical feature slice comparisons and whole-original
baseline digest validations. Four independent Node regression tests
cover immutable artifact digest, typed workflow create requests
and response enums, historical read/transition preservation,
source pin and fail-closed compatibility integrity. Add tests
to existing `npm test` without changing CI workflows.

**Registered commit message:**
`fix(contract): activate verified Workflow OpenAPI source pin`.
**Exact path allowlist:**
`openapi/candidates/hidra-workflow-da4ce33ead7db40776049c861027947b61b96270.json` CREATE;
`orval.workflow.config.ts`;
`scripts/check-openapi-compatibility.mjs`;
`scripts/verify-workflow-candidate.test.mjs` CREATE;
`package.json`;
`docs/roadmap/ULTIMATE_ROADMAP.md` APPEND ONLY.

**Acceptance:** compare-and-swap expected `main` head,
verify exact commit parent/tree/changed-file scope, observe Code
CI and Documentation CI start for that SHA and STOP. Existing
compatibility, all 20 Orval generation passes, lint, TypeScript,
unit/Node tests, performance, build/release and Playwright are
mandatory; no claim of CI pass until its actual completion.
HWEB-F01 remains IN PROGRESS pending the other source-backed
contract migrations, full current backend baseline repin,
cross-module consumers and effective-permission acceptance.
HWEB-F02–F10 and numerical simulation remain unselected.

## 2026-10-14 — HWEB-F01 activate verified Incident OpenAPI source

**Selected bounded HWEB-F01 execution:** source-pin the current
HidraAPI Incident transport shape for frontend code generation.
No new UI Incident authoring/closure/response buttons or lifecycle
assumptions are authorized by this transport-only update.

**Preflight:** HidraWEB main
`711eb8da0f914727d3fa0f3dfb51634e10f25f9f`;
Code CI #994 `38564715381` and Documentation CI #17
`38564715460` SUCCESS. HidraAPI's last successfully completed
full OpenAPI-producing source revision at preflight is
`da4ce33ead7db40776049c861027947b61b96270`,
Full CI #685 `38559065173` SUCCESS; artifact ID
`11891417141`, GitHub artifact digest
`sha256:41415af15d2809ab71996cb5b6e2ba74c8f22dd3eaa8407975810a873c7098e3`.
The published full `hidra-api.json` digest is
`e0f4e27c4ee84675b7a99fce55454c275b5e320e0f63c1202fe63b4d7a8553b3`.
A later documentation-only backend head must not be substituted
for the published contract's recorded source SHA.

**Canonical exact extraction:** all eight
`/api/v1/incident/` routes and six recursively referenced
schemas from the verified full JSON, retaining their operation
IDs, response/request schemas, explicit bearer security and
existing GET incident list/detail query parameters. Strip the
server URL and source-display metadata, serialize sorted JSON
object keys. The resulting 8,508-byte candidate
`openapi/candidates/hidra-incident-da4ce33ead7db40776049c861027947b61b96270.json`
has SHA-256
`54dd4419087f18f52804bb3924fef3ada98c71c16b3b612984f28764dbc7c3eb`
and Git blob
`7da5d1750b307f316207c9ca17e74402f5183e77`.
The exact Git blob identity was independently reconstructed from
the previously pinned read slice and the published command contract,
including the OpenAPI 3.1 version correction, and verified before
publication.

**Implementation:** select the candidate in
`orval.incident.config.ts`; enforce its exact source path,
SHA-256, OpenAPI version, path/schema counts and Incident-only
route prefix in the fail-closed compatibility gate. Preserve
the independent Risk, Topology, Telemetry/Monitoring and Workflow
digest locks and the full historical baseline validation of
the remaining 15 source configurations. Four Node tests
check artifact integrity, existing reads, typed incident creation,
closure and response-action contracts and the integrity gate.
Add the test to the existing npm test script. The existing
20 client generation steps, TypeScript, lint, unit, performance,
build, release and browser checks remain mandatory in Code CI.

**Commit message:**
`fix(contract): activate verified Incident OpenAPI source pin`.

**Exact six-file allowlist:**
`openapi/candidates/hidra-incident-da4ce33ead7db40776049c861027947b61b96270.json` CREATE;
`orval.incident.config.ts`;
`scripts/check-openapi-compatibility.mjs`;
`scripts/verify-incident-candidate.test.mjs` CREATE;
`package.json`;
`docs/roadmap/ULTIMATE_ROADMAP.md` APPEND ONLY.

**Exit:** publish only via expected-main compare-and-swap,
verify exact commit head/parent/tree/file scope, observe Code CI
and Documentation CI startup and stop without waiting for completion.
Do not call this stage CI-confirmed until the new Code CI passes.
HWEB-F01 remains IN PROGRESS: 5 of 20 source configurations
are now pinned to more recent source-backed contracts and
15 still need reconciliation. Backend-owned incident execution
permissions, user workflows, deployment validation and a
fully coordinated current OpenAPI repin remain outstanding.

## 2026-10-14 — HWEB-F01 verified Custody OpenAPI source activation

**Selected bounded stage:** repin only the existing Custody Orval
transport contract to a source-verified HidraAPI OpenAPI slice,
while preserving all current business ownership, execution
permissions and existing frontend workflow behavior. No new
browser Custody write or approval action is introduced.

**Exact preflight:** HidraWEB `main`
`cc2b806aa8329e7b01358aca2252c30fb8ba6e65`;
Code CI #995 `38566480203` SUCCESS and Documentation CI
#18 `38566480172` SUCCESS. Latest source-producing backend
Full CI #685 `38559065173` SUCCESS at HidraAPI commit
`da4ce33ead7db40776049c861027947b61b96270`;
API-contract artifact ID `11891417141`, GitHub ZIP digest
`sha256:41415af15d2809ab71996cb5b6e2ba74c8f22dd3eaa8407975810a873c7098e3`.
Raw `hidra-api.json` SHA-256:
`e0f4e27c4ee84675b7a99fce55454c275b5e320e0f63c1202fe63b4d7a8553b3`;
244 paths and 231 schemas. Current backend
`ae9f639fe55cfc15cf571b5b6e5fa6cd47532cdc`
must not silently replace the published source artifact.

**Exact source extraction:** all seven `/api/v1/custody/`
paths and six referenced schemas from published Full CI #685.
Preserve endpoint IDs, request/response content, schema types,
status enums, request-body requirements and bearer-security
metadata. Strip local server/source-display metadata and
canonicalize sorted object keys. Exact resulting artifact:
`openapi/candidates/hidra-custody-da4ce33ead7db40776049c861027947b61b96270.json`;
5,333 bytes; SHA-256
`9a5daa35cd1bbe1750eef998553ba925d5cfb008d40d309f47fd86889bb5dfe1`;
Git blob `d7cfcd0bc4b9760e90301cbfceed7afb23f6043f`.
This Git blob was independently reproduced from the existing
legacy Custody transport and the verified Full CI #685 alias
routes/capabilities/security additions before publication.
The existing transfer-ticket, measurement-period and discrepancy
commands remain intact.

**Implementation scope:** activate that immutable source in
`orval.custody.config.ts` and add exact byte-digest,
source-path, OpenAPI 3.1, 7-path/6-schema and custody-only
prefix verification in the fail-closed compatibility checker.
The previous five source locks (Risk, Topology,
Telemetry/Monitoring, Workflow and Incident), original full
backend historical manifest/hash checks and remaining fourteen
legacy contract comparisons must stay enforced. Add four
synthetic-free Node contract tests for the artifact fingerprint,
typed and secured Custody commands, route/alias compatibility
and integrity gate; append the new test to `npm test`.
Existing Orval generation, lint, TypeScript, unit/Node,
performance, build/release and Playwright CI remain unchanged.
OpenAPI presence alone is not operator permission to perform
hydrocarbon custody operations.

**Commit:** `fix(contract): activate verified Custody OpenAPI source pin`.
**Exact six-file scope:** create
`openapi/candidates/hidra-custody-da4ce33ead7db40776049c861027947b61b96270.json`
and `scripts/verify-custody-candidate.test.mjs`; update
`orval.custody.config.ts`,
`scripts/check-openapi-compatibility.mjs`, `package.json`,
and append this roadmap entry only.

**Exit criteria:** commit directly to expected `main` head
using compare-and-swap, verify parent/tree/scope and Code CI
startup, then stop without waiting for completion. This
stage is not CI-accepted until successful completion of its
new run. HWEB-F01 remains IN PROGRESS; six of twenty
contract sources have a newer source-backed pin and
fourteen remain to reconcile, plus global-source alignment,
business consumer integration and permissions acceptance.

## 2026-10-14 — HWEB-F01 activate verified Leak Detection contract source

**Authorized bounded scope:** activate the latest fully verified
HidraAPI Leak Detection OpenAPI transport source in the existing
HidraWEB Orval generator, preserving current read capabilities.
This is transport reconciliation, not permission for the browser
to create leak candidates, open cases, escalate incidents or
execute physical-network actions. No leak-detection model,
numerical solver, SCADA connector or live alarm command is added.

**Verified preflight:** HidraWEB main
`1869a0969c79d23f2bf147f298aaf5103834354d`;
Code CI #996 `38567635176` and Documentation CI #19
`38567634928` SUCCESS. Latest source-backed HidraAPI
OpenAPI Full CI #685 `38559065173` SUCCESS at commit
`da4ce33ead7db40776049c861027947b61b96270`;
contract ZIP artifact ID `11891417141` GitHub digest
`sha256:41415af15d2809ab71996cb5b6e2ba74c8f22dd3eaa8407975810a873c7098e3`.
Raw full `hidra-api.json` SHA-256:
`e0f4e27c4ee84675b7a99fce55454c275b5e320e0f63c1202fe63b4d7a8553b3`.
Later documentation-only backend main
`ae9f639fe55cfc15cf571b5b6e5fa6cd47532cdc`
is not automatically a new contract production source.

**Exact artifact extraction:** choose all nine
`/api/v1/leakdetection/` paths and the nine reachable schema
definitions from the successful Full CI JSON; preserve method
operation IDs, query/response semantics, source enum values,
bearer security and optional request fields. Remove the local
server URL and display-only source metadata, then serialize
with sorted JSON object keys. The canonical result is 9,049
bytes, SHA-256
`4c55a76cdf581954c2a35fce197ce4c0df3b0f827c09752fe9091b3649bfc91c`,
Git blob `cb607f009631e54a27ee2231ed9086fbc293382f`.
An independently reconstructed candidate from the immutable old
query-only slice plus the published command and reference-schema
additions reproduced this exact Git object SHA; the initial
candidate mismatch in the capability operation ID was corrected
before selecting the matching source.

**New transport coverage:** preserve the existing candidate
and case list/detail GET routes; include capabilities GET and
explicit create-candidate, open-case and escalate-case POST
paths and aliases. These transport declarations do not
themselves grant actor permissions, validate leak hydraulics,
or prove live leak-detection deployment.

**Changes in this stage:** add versioned
`openapi/candidates/hidra-leak-da4ce33ead7db40776049c861027947b61b96270.json`;
repin `orval.leak.config.ts` to it; extend
`scripts/check-openapi-compatibility.mjs` to fail on any
source-path, byte-hash, OpenAPI version, nine-route/nine-schema
coverage or prefix mismatch. All six previously updated source
locks and the historical full baseline manifest and comparisons
for thirteen remaining legacy source configurations remain
enforced. Four Node tests verify exact fingerprint, typed
request/response contracts, escalation enum and original read
preservation, and are included in existing `npm test`.
No generated client files, runtime page behavior, CI workflows
or code comments are directly changed.

**Exact commit message:** `fix(contract): activate verified Leak Detection source pin`.

**Exact six-file allowlist:**
`openapi/candidates/hidra-leak-da4ce33ead7db40776049c861027947b61b96270.json` CREATE;
`orval.leak.config.ts`;
`scripts/check-openapi-compatibility.mjs`;
`scripts/verify-leak-candidate.test.mjs` CREATE;
`package.json`;
`docs/roadmap/ULTIMATE_ROADMAP.md` APPEND-ONLY.

**Acceptance:** verify expected `main` parent and tree,
publish using compare-and-swap, verify exact six-file scope,
confirm new Code and Documentation CI startup and STOP.
Only a completed successful Code CI confirms generated types,
full static/unit/performance/build/release and Playwright
regressions. HWEB-F01 remains IN PROGRESS with seven of
twenty source configurations updated and thirteen to reconcile,
plus global backend contract alignment and authorization and
client-consumer integration acceptance. No PR or branch.

## 2026-10-14 — HWEB-F01 activate verified HSE OpenAPI contract source

**Selected bounded HWEB-F01 stage:** activate source-verified
HidraAPI HSE case and corrective/preventive-action (CAPA)
transport definitions in HidraWEB's existing Orval generation.
This change does not authorize any new HSE write, approval
or closure feature in the browser, nor physical operations.

**Verified baseline:** HidraWEB main
`46b8fa79c7110c92a8641633ec8f5b81f17ddc98`;
Code CI #997 `38569333183` SUCCESS and Documentation
CI #20 `38569333159` SUCCESS. Last successful published
HidraAPI Full CI #685 `38559065173`, source commit
`da4ce33ead7db40776049c861027947b61b96270`,
API-contract artifact ID `11891417141`, artifact digest
`sha256:41415af15d2809ab71996cb5b6e2ba74c8f22dd3eaa8407975810a873c7098e3`.
Raw `hidra-api.json` SHA-256
`e0f4e27c4ee84675b7a99fce55454c275b5e320e0f63c1202fe63b4d7a8553b3`.
Newer HidraAPI main `76b14cda4520f1eff242bd474c02ce4db317d385`
has Full CI #686 IN PROGRESS at preflight; no assumption
that its source has a successfully published full OpenAPI
contract.

**Immutable source extraction:** all nine `/api/v1/hse/`
routes and nine transitive schema definitions from the
Full CI #685 JSON, preserving GET case/CAPA query semantics,
operation IDs, typed inputs/responses, source enumerations,
optional fields and bearer-security metadata. Strip only
the server URL and display-only source annotation, serialize
with sorted JSON keys. Exact 10,056-byte candidate:
`openapi/candidates/hidra-hse-da4ce33ead7db40776049c861027947b61b96270.json`;
raw SHA-256
`137b5f0f0020a20c3ed956a489ac08d798f0b29f5085e5a28d8abd7102d869ed`;
Git blob `8fa2f2d6cb8294a73dabdd5a3c424b1449a4c1bf`.
The Git blob was independently reproduced from the checked-in
old HSE read contract plus published source changes.
Initial reconstruction differences in the cases operation ID
and OpenAPI version were resolved before publication; only
the exact matching candidate is accepted.

**Coverage:** preserve existing HSE case/CAPA list and detail
reads; add typed open-case, create-CAPA and close-case wire
contracts and canonical/alias routes, with the capabilities
read. Bearer authentication in OpenAPI is not proof of an
effective user permission grant or authority to issue an HSE
decision. No new domain execution UI, simulation or
operational-data migration is included.

**Implementation:** activate the candidate in
`orval.hse.config.ts`; add a fail-closed verifier for the
exact source path, byte SHA-256, OpenAPI 3.1, nine routes,
nine schemas and HSE-only route prefix. All seven preceding
source locks and historical full-baseline checks for twelve
remaining feature contract sources remain in force.
Four Node regression tests verify candidate provenance,
typed HSE and CAPA inputs, backend-owned closure
requests and legacy read behavior. They run via existing
`npm test`; unchanged GitHub CI must execute full Orval
generation, lint, TypeScript, unit, performance, package/
release and Playwright verification.

**Exact commit:** `fix(contract): activate verified HSE OpenAPI source pin`.

**Exact six-file write allowlist:**
`openapi/candidates/hidra-hse-da4ce33ead7db40776049c861027947b61b96270.json` CREATE;
`orval.hse.config.ts`;
`scripts/check-openapi-compatibility.mjs`;
`scripts/verify-hse-candidate.test.mjs` CREATE;
`package.json`;
`docs/roadmap/ULTIMATE_ROADMAP.md` APPEND-ONLY.

**Gate:** compare-and-swap expected main head, verify
parent/tree/allowlist, observe new Code and Documentation CI
startup and stop. Do not claim CI acceptance until completion.
HWEB-F01 remains IN PROGRESS with eight of twenty
contract configurations updated and twelve still to reconcile,
plus cross-module integration, effective-permission review
and a common source-backed full OpenAPI baseline repin.
HWEB-F02–F10 remain unselected.

## 2026-10-14 — HWEB-F01 verified Assets contract-source activation

**Selected bounded implementation:** repin the existing Assets
Orval transport generator to a byte-verified HidraAPI Full CI
OpenAPI source; preserve existing maintenance/engineering semantics,
backend-authoritative permissions and frontend behavior. This is
contract reconciliation only, not selection of HWEB-F02–F10 or
operator-enabled maintainable-asset/condition/work-order controls.

**Exact preflight:** HidraWEB `main`
`981e00acc1033cd4851e405ea87bdd1d9322670c`,
Code CI #998 `38571321340` SUCCESS and Documentation CI #21
`38571321183` SUCCESS. The latest accepted HidraAPI full
OpenAPI production run is Full CI #686 `38569456312` SUCCESS,
source SHA `76b14cda4520f1eff242bd474c02ce4db317d385`.
Published API-contract artifact ID `11897156166` with GitHub
ZIP digest
`sha256:191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`.
Its extracted `hidra-api.json` has 244 paths/231 schemas,
457,784 bytes and raw SHA-256
`d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`.
The later documentation-only backend `main` is a distinct
checkpoint, not a substituted source of this artifact.

**Source extraction:** select all eight
`/api/v1/assets/` routes and seven transitively referenced
schemas from the exact published full OpenAPI 3.1 artifact.
Preserve original operation IDs, request/response shape,
enums, required-field ordering, bearer security and
update concurrency metadata; remove only server-local or
display-source metadata and sort JSON object keys.
Canonical source
`openapi/candidates/hidra-assets-76b14cda4520f1eff242bd474c02ce4db317d385.json`
is 7,045 bytes, SHA-256
`ba9cca93db79451a7fedfd35a322ddd71c837273a6ffe3fd5e47d5d0706bfc11`,
Git blob `a5ab4d1384a2f80f4e1c73343479cf6c78f40d57`.
This Git blob was independently reproduced from the old checked-in
Assets slice plus the verified artifact deltas. The exact identity
was achieved only after restoring source-defined enums, operation
IDs and the required-field order; earlier reconstruction candidates
were not selected.

**Transport coverage:** preserve typed POST maintainable-asset
registration, condition evidence, maintenance-work-order creation
and PATCH optimistic update. Add source-backed aliases and
capabilities GET. No generated endpoint is treated as an operator
permission or as proof of real deployment/calibration.

**Exact write scope:** create the candidate JSON and
`scripts/verify-assets-candidate.test.mjs`; update
`orval.assets.config.ts`,
`scripts/check-openapi-compatibility.mjs`, `package.json`,
and append this roadmap section only. Exact commit message:
`fix(contract): activate verified Assets OpenAPI source pin`.
The compatibility checker fails closed on wrong pinned path,
SHA-256, OpenAPI version, 8-route/7-schema coverage or
out-of-prefix routes. The previous eight source hash locks and
full historical baseline comparison for the eleven remaining
contract configs remain enforced. Four Node regression tests
cover provenance, PATCH concurrency, typed work orders/
condition evidence, bearer security and previous contract
preservation; existing CI handles Orval regeneration,
TypeScript, unit, performance, build/release and browser tests.

**Exit:** publish directly to expected `main` through
compare-and-swap, verify parent/tree/exact six-file scope,
confirm Code and Documentation CI startup then STOP without
waiting. A queued or running CI is not a pass. HWEB-F01
remains IN PROGRESS with nine of twenty feature contract
source pins updated and eleven outstanding, plus a coordinated
single-artifact full-baseline repin and integration/permission
acceptance. No branch, PR, runtime UI write or code comments.

## 2026-10-14 — HWEB-F01 activate verified Integrity OpenAPI source

**Selected bounded implementation:** update only the Integrity
Orval source to the exact latest fully CI-published HidraAPI
Integrity contract. This is a client-transport reconciliation
stage; it does not add Integrity operator actions, loosen existing
route permissions, mutate engineering data or select HWEB-F02–F10.

**Preflight:** HidraWEB `main`
`9b47ccd6c6d0e51c9bb5dcad7f29f8cd44fa00f6`,
Code CI #1000 `38574786288` SUCCESS after the Assets status-enum
consumer repair. HidraAPI Full CI #686 `38569456312`
SUCCESS at source `76b14cda4520f1eff242bd474c02ce4db317d385`.
Its exact API-contract artifact #11897156166 has ZIP digest
`sha256:191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`.
The independently inspected ZIP contains `hidra-api.json` with
244 paths, 231 schemas, 457,784 bytes and raw SHA-256
`d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`.
Later HidraAPI documentation-only main commits do not silently
supersede this confirmed full-contract production artifact.

**Exact extraction:** all seven `/api/v1/integrity/` routes and
six transitive referenced schemas from the verified full OpenAPI,
with original request/response fields, enum values, operation IDs
and JWT bearer security retained. Remove only server-local and
slice display metadata and canonicalize JSON object-key order.
The resulting 5,725-byte candidate
`openapi/candidates/hidra-integrity-76b14cda4520f1eff242bd474c02ce4db317d385.json`
has SHA-256
`67e7cedbd59587b1f3af15ec83c3f9718f7c783dc40bc01597b0aef0ae3ebd79`
and Git blob SHA `5401be12772d12b0ce07517aafdfbc4591c32d49`.
Reconstruction from the old pinned Integrity contract plus the
published enum, alias/capabilities and security deltas produced
exactly the same Git blob, independently confirming byte identity.

**Changes:** repin `orval.integrity.config.ts` to the immutable
candidate; extend the fail-closed compatibility gate with the exact
path, SHA-256, OpenAPI 3.1, seven routes/six schemas and
Integrity-only prefix. Preserve the earlier nine source locks and
the historical full-baseline comparison for ten remaining sources.
Add four Node regression tests for artifact integrity, typed
program/assessment/case transport, published lifecycle enums and
the preserved permission/compatibility boundaries; include the
tests in `npm test`. No production UI change, new work order,
simulation feature, CI-workflow change or code comments.

**Commit:** `fix(contract): activate verified Integrity OpenAPI source pin`.
**Exact allowlist:** create
`openapi/candidates/hidra-integrity-76b14cda4520f1eff242bd474c02ce4db317d385.json`
and `scripts/verify-integrity-candidate.test.mjs`; update
`orval.integrity.config.ts`,
`scripts/check-openapi-compatibility.mjs`, `package.json`,
and this roadmap (append only).

**Acceptance:** publish only to expected `main` head by
compare-and-swap; verify commit parent/tree and six-file scope;
observe Code and Documentation CI startup and stop without waiting.
CI must validate all 20 generated client slices, lint, TypeScript,
Node/Vitest, performance, build/release and Playwright before the
stage is CI-accepted. HWEB-F01 remains IN PROGRESS with ten of
twenty source pins updated and ten remaining, plus coordinated
complete baseline repin and consumer/authorization acceptance.

## 2026-10-14 — HWEB-F01 verified Audit OpenAPI contract activation

**Selected one bounded stage:** activate the verified, published
HidraAPI Audit contract as the input to HidraWEB's existing
Audit Orval generator. Keep request/export behavior and effective
backend permission boundaries unchanged; do not expose new audit
recording controls, claim user export authorization, alter workflow,
or select HWEB-F02–F10.

**Preflight:** HidraWEB main
`884e11866afac71973402dd50f2bbde7019edd71`,
Code CI #1001 `38577672082` SUCCESS and Documentation CI
#23 `38577671863` SUCCESS. HidraAPI latest verified Full CI
#686 `38569456312` SUCCESS on source commit
`76b14cda4520f1eff242bd474c02ce4db317d385`.
API contract artifact ID `11897156166`, ZIP digest
`sha256:191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`,
raw `hidra-api.json` 457,784 bytes / 244 paths / 231
schemas and SHA-256
`d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`.
Later backend documentation-only heads do not silently replace
this verified full OpenAPI source.

**Exact source extraction:** all seven
`/api/v1/audit/` routes and the six schemas transitively
referenced in the verified full contract, retaining audit event
and access payloads, enum values, operation IDs, required flags,
bearer security and export status types. Remove only server-local
and display-only source metadata, then sort JSON object keys.
The 6,435-byte canonical candidate
`openapi/candidates/hidra-audit-76b14cda4520f1eff242bd474c02ce4db317d385.json`
has SHA-256
`2d08cfb549d5ca4bccb2905eccede642c5d5b344ccd4c4cb1abdc5a8b35fe663`,
Git blob SHA `fa8033cd3926c7daf2ac15b4f2fb025fee7ce5ee`.
Independent reconstruction from the old Audit source plus the
published new access/event request/response schemas and routes
reproduced this exact Git blob identity before selecting it.

**Implementation scope:** pin `orval.audit.config.ts` to the
versioned source, extend the fail-closed compatibility gate to
check exact Audit pin, raw SHA-256, OpenAPI 3.1, seven paths,
six schemas and the audit route prefix. Preserve all ten
prior source locks and remaining nine old-baseline full-source
compatibility checks. Add four Node contract tests covering
source digest, typed event and access records, export response,
the old public path compatibility and all existing source locks.
Include tests in existing `npm test`. No new frontend page
or runtime permission change; the Code CI's unchanged full Orval
regeneration, TypeScript, lint, unit/performance/build/release
and Playwright suites remain acceptance gates.

**Commit message:**
`fix(contract): activate verified Audit OpenAPI source pin`.
**Exact six-file change set:**
`openapi/candidates/hidra-audit-76b14cda4520f1eff242bd474c02ce4db317d385.json` CREATE;
`orval.audit.config.ts`;
`scripts/check-openapi-compatibility.mjs`;
`scripts/verify-audit-candidate.test.mjs` CREATE;
`package.json`;
`docs/roadmap/ULTIMATE_ROADMAP.md` APPEND ONLY.

**Exit:** publish directly to expected `main` head with
compare-and-swap, verify the exact parent/tree and six-file scope,
observe new Code and Documentation CI startup, and STOP. Do not
claim CI acceptance until Code CI has actually succeeded.
HWEB-F01 remains IN PROGRESS with eleven of twenty source
configurations updated, nine still outstanding, and a
single-artifact backend OpenAPI baseline and integrated
permission/consumer acceptance still pending. No PR, branch
or code comments.

## 2026-10-14 — HWEB-F01 verified Configuration OpenAPI source activation

**Selected one bounded HWEB-F01 stage:** replace only the existing
Configuration Orval transport source with an exact versioned slice
from HidraAPI's latest successfully published full OpenAPI artifact.
Preserve the existing definition, feature-flag and value consumers
and all effective backend route/grant enforcement. Do not introduce
new administrative write controls, changes to runtime authorization,
feature-flag behavior, numerical simulation or new subphases.

**Preflight:** HidraWEB main
`4936cb32c7aa6b86744e476bdb205e0deaf704af` with
Code CI #1002 `38579016317` SUCCESS and Documentation CI
#24 `38579016336` SUCCESS. HidraAPI last completed full
OpenAPI-producing CI #686 `38569456312` SUCCESS at
`76b14cda4520f1eff242bd474c02ce4db317d385`.
Published API-contract artifact ID `11897156166`, ZIP digest
`sha256:191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`.
Actual `hidra-api.json` is 457,784 bytes, 244 paths, 231 schemas;
SHA-256 `d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`.
Subsequent HidraAPI documentation commits do not replace the
provenance or guarantee a newer published full OpenAPI artifact.

**Deterministic extraction:** all seven
`/api/v1/configuration/` routes and six transitive schema
definitions from the exact successful Full CI #686 JSON,
preserving operation IDs, request/response types, all published
enums and bearer security. Drop only the server URL and
display-source metadata and serialize with sorted JSON keys.
The canonical 5,741-byte source at
`openapi/candidates/hidra-configuration-76b14cda4520f1eff242bd474c02ce4db317d385.json`
has raw SHA-256
`c38a1a6a5e351ce53bb953811cde71d1fa784b73e1150820c1cc52474728ca84`
and Git blob SHA `b64ba80e2eddf8865e6f389e3fd4cb2c28500533`.
This exact blob was independently reconstructed from the prior
checked-in Configuration slice and the three published alias
POST paths plus authenticated route metadata and matched the
artifact extracted directly from the actual ZIP.

**Implementation:** repin `orval.configuration.config.ts`;
extend the fail-closed compatibility gate to verify exact path,
SHA-256, OpenAPI version, 7 paths, 6 schemas and only
Configuration-prefixed routes. Preserve eleven independent
already-activated source hash locks and the original full
historical backend artifact checks for eight remaining sources.
Add four Node regression tests for source evidence, existing
definition/feature-flag/value request types and enums,
published alias operations, capability security and the
preservation of all existing integrity locks. Include the test
in the existing `npm test` script. Do not alter generated
client files, application forms, access controls or workflows.

**Exact commit message:**
`fix(contract): activate verified Configuration OpenAPI source pin`.

**Exact six-file allowlist:**
`openapi/candidates/hidra-configuration-76b14cda4520f1eff242bd474c02ce4db317d385.json` CREATE;
`orval.configuration.config.ts`;
`scripts/check-openapi-compatibility.mjs`;
`scripts/verify-configuration-candidate.test.mjs` CREATE;
`package.json`;
`docs/roadmap/ULTIMATE_ROADMAP.md` APPEND ONLY.

**Exit:** compare-and-swap publish to expected `main`,
verify commit parent/tree/exact scope, observe new Code and
Documentation CI startup and stop without waiting. This is
not CI-confirmed until Code CI finishes successfully, including
client generation, typecheck, unit/Node, lint, Playwright,
performance and release checks. HWEB-F01 remains IN PROGRESS
with twelve of twenty source pins updated, eight still pending,
and fully coordinated backend baseline/consumer/authorization
acceptance not yet completed. No branch, PR or code comments.

## 2026-10-14 — HWEB-F01 verified Documents OpenAPI source activation

**Selected bounded implementation:** repin only the Documents Orval generator to the verified backend Documents contract, preserving existing binary document upload/download, registration and target linkage. This is a transport reconciliation, not authorization for document access, approval, release, or mutation, and not an operator-facing UI or simulation change.

**Source provenance:** HidraWEB main preflight `4c3bb616a6550b313578a498d8f9f7e58f93650f` with Code CI #1002 `38579016317` SUCCESS, Documentation CI #24 `38579016336` SUCCESS; Code CI #1003 `38580599898` SUCCESS and Documentation CI #25 `38580599909` SUCCESS. HidraAPI Full CI #686 `38569456312` SUCCESS at source `76b14cda4520f1eff242bd474c02ce4db317d385`. Verified artifact #11897156166 with ZIP digest `sha256:191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`, containing `hidra-api.json` (457,784 bytes, 244 paths, 231 schemas, SHA-256 `d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`).

**Exact source:** all nine `/api/v1/documents/` routes and seven transitively referenced schemas from that Full CI artifact, preserving operation IDs, required fields, documented bearer security, document lifecycle enums, multipart binary upload and binary download. Only server-local and display-source metadata are removed and JSON object keys are sorted. Immutable candidate `openapi/candidates/hidra-documents-76b14cda4520f1eff242bd474c02ce4db317d385.json` is 7,836 bytes, SHA-256 `a4ec466d2a5321c67ba39a67310e35cb01fcd047bf7c9f80b0d960fd2af4fc77`, Git blob `79013e453f8363ac4581668378923fd2f80d4d8a`. The original backend artifact extraction and independent prior-slice reconstruction yielded the same exact Git blob before publication.

**Implementation and guardrails:** repin `orval.documents.config.ts`; add fail-closed Documents source path, byte digest, OpenAPI 3.1, nine routes/seven schemas and Documents-only prefix checks to `scripts/check-openapi-compatibility.mjs`. Retain all twelve previous verified current-source locks and original full historical baseline checks for seven remaining sources. Add four Node regression tests for source identity, existing typed upload/download, source-backed aliases and version metadata, and prior compatibility protections; include these tests in existing `npm test`. The unchanged GitHub Code CI must enforce Orval regeneration, TypeScript, lint, Node/Vitest, build/release, Playwright and performance checks.

**Commit:** `fix(contract): activate verified Documents OpenAPI source pin`.

**Exact six-file allowlist:** create `openapi/candidates/hidra-documents-76b14cda4520f1eff242bd474c02ce4db317d385.json` and `scripts/verify-documents-candidate.test.mjs`; update `orval.documents.config.ts`, `scripts/check-openapi-compatibility.mjs`, `package.json`, and append this roadmap section only. Publish directly to the expected `main` using compare-and-swap, verify exact parent/tree/file scope, observe Code and Documentation CI startup and STOP without waiting for completion. HWEB-F01 remains IN PROGRESS with thirteen of twenty feature source pins updated and seven still remaining, plus coordinated single-artifact full-baseline repin and integrated consumer/permission verification. No branch, PR, code comments, generated UI changes, calibration data or numerical simulation.

## 2026-10-14 — HWEB-F01 verified Reporting OpenAPI source activation

**Selected bounded implementation:** update only the Reporting Orval input to the CI-published HidraAPI Reporting contract, retaining existing reporting definition, report request, execution queue and output artifact behavior. The source pin is client transport reconciliation, not authorization to initiate, approve or export reports, and does not introduce a new operator-facing UI or numerical simulation.

**Preflight and provenance:** HidraWEB `main` `194ea9d2bed44a0ce7a8bc56429f35be216427a0`; Code CI #1004 `38582043215` SUCCESS, Documentation CI #26 `38582043332` SUCCESS. Latest successfully completed HidraAPI full OpenAPI-producing Code CI #686 `38569456312` SUCCESS, source `76b14cda4520f1eff242bd474c02ce4db317d385`. Verified artifact ID `11897156166`, ZIP digest `sha256:191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`, extracted `hidra-api.json` 457,784 bytes, 244 paths, 231 schemas and raw SHA-256 `d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`. Later backend documentation-only commits do not replace that exact source.

**Source extraction:** all nine `/api/v1/reporting/` paths and eight transitively referenced schemas from the verified full artifact, including original operation IDs, typed requests/responses, output formats, lifecycle enums and published bearer requirements. Remove only server-local/display metadata and canonicalize JSON object key ordering. Candidate `openapi/candidates/hidra-reporting-76b14cda4520f1eff242bd474c02ce4db317d385.json` is 7,338 bytes with raw SHA-256 `a675c02217225590e515b804448e2e2270bb8d263d78af3a13b93103b7c8e34d` and Git blob `7d22e0d35214c2fe51e7b96d0fead662c4feb56c`. Independently reconstructing from the prior Reporting slice and the source-published information/security changes reproduced the exact artifact-extracted Git blob.

**Implementation:** repin `orval.reporting.config.ts`; add fail-closed exact source path, SHA-256, OpenAPI 3.1, nine paths, eight schemas and Reporting-only route-prefix validation. Retain thirteen previous source locks and the historical full OpenAPI baseline checks for six remaining configurations. Add four Node regression tests for provenance, typed reporting flows, backend-defined format/lifecycle enum and bearer metadata, backward-compatible routes and lock continuity; enroll in `npm test`. Keep existing production UI, backend-enforced access policy, generation behavior, and CI configuration unchanged.

**Commit:** `fix(contract): activate verified Reporting OpenAPI source pin`.
**Exact six-file allowlist:** create `openapi/candidates/hidra-reporting-76b14cda4520f1eff242bd474c02ce4db317d385.json` and `scripts/verify-reporting-candidate.test.mjs`; update `orval.reporting.config.ts`, `scripts/check-openapi-compatibility.mjs`, `package.json`; append only to `docs/roadmap/ULTIMATE_ROADMAP.md`.

**Exit gate:** compare-and-swap publish only to expected `main`, verify exact parent/tree/six-file diff, observe push-triggered Code and Documentation CI start, then STOP without waiting for completion. Code CI must subsequently confirm full Orval generation, lint, TypeScript, Node/Vitest, performance, build/release and Playwright checks. HWEB-F01 remains IN PROGRESS with fourteen of twenty source pins reconciled, six remaining, plus single-artifact full-baseline repin and integrated consumer/permission verification. No PR, branch, source comments, runtime permission change, real calibration or numerical simulation.

## 2026-10-14 — HWEB-F01 verified Analytics OpenAPI source activation

**Bounded implementation:** reconcile only the Analytics Orval input to the published full HidraAPI Analytics contract while retaining the existing dataset, insight, metric evaluation and projection transports. Source reconciliation does not authorize operator actions, change existing permissions, introduce execution UI or enable numerical simulation.

**Preflight:** HidraWEB `main` `7bc27d6e912012ed34fe40f832678feb9b01b00a`, Code CI #1005 `38583629704` SUCCESS, Documentation CI #27 `38583629963` SUCCESS. HidraAPI Full CI #686 `38569456312` SUCCESS is the last published full OpenAPI production artifact, at source `76b14cda4520f1eff242bd474c02ce4db317d385`. The actual downloaded artifact #11897156166 has ZIP SHA-256 `191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`; extracted `hidra-api.json` has 457,784 bytes, 244 paths, 231 schemas and SHA-256 `d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`. Later backend documentation-only commits are not substituted for this published source.

**Exact source:** extract all nine `/api/v1/analytics/` routes and their eight transitively referenced schemas from the verified artifact. Keep backend-defined operation IDs, source lifecycle enums, type metadata and bearer security. In particular, restore the newly published string-valued `AnalyticsProjectionRunResponse.projectionDefinitionVersion`, absent from the old pinned source. Drop only full-document server and CI-source display metadata; sort JSON object keys. Exact candidate `openapi/candidates/hidra-analytics-76b14cda4520f1eff242bd474c02ce4db317d385.json` is 7,509 bytes, raw SHA-256 `4d7e3d43925fc9304351a86eb275d87104a6faddf6a975fc0799678e3853c39c`, Git blob `cde68b084d1b24fa9e907c5436f2b341b29475c2`. Independent reconstruction from the old checked-in Analytics slice plus source-published projection metadata and bearer security reproduced the exact artifact-extracted Git blob.

**Implementation and verification:** repin `orval.analytics.config.ts`; extend fail-closed compatibility checks with Analytics exact source path, SHA-256, OpenAPI 3.1, nine routes, eight schemas and Analytics-only prefix. Retain fourteen prior current-artifact locks and original full historical OpenAPI checks for the five remaining configs. Add four Node regression tests for source integrity, typed dataset/insight/metric/projection transport, projection version, enum/security preservation, compatibility with older consumers and lock continuity; run via existing `npm test`. CI remains responsible for full generated-client, lint, TypeScript, Vitest/Node, performance, package/build and Playwright acceptance; no local test run required.

**Commit:** `fix(contract): activate verified Analytics OpenAPI source pin`.

**Six-file allowlist:** CREATE `openapi/candidates/hidra-analytics-76b14cda4520f1eff242bd474c02ce4db317d385.json`, CREATE `scripts/verify-analytics-candidate.test.mjs`; UPDATE `orval.analytics.config.ts`, `scripts/check-openapi-compatibility.mjs`, `package.json`; APPEND ONLY `docs/roadmap/ULTIMATE_ROADMAP.md`. Compare-and-swap publish only to expected `main`, verify exact parent/tree/diff, observe Code and Documentation CI startup then STOP without waiting for acceptance. HWEB-F01 is IN PROGRESS at fifteen of twenty feature sources reconciled (five remain), followed by unified backend full-baseline repin and integrated consumer/authorization acceptance. No PRs, branches, code comments, live deployment/calibration, or numerical simulation.

## 2026-10-14 — HWEB-F01 verified Simulation OpenAPI source activation

**Scope:** pin existing Simulation generated-client transport to fully published HidraAPI source; numerical simulation, execution controls, recommendations to operators, and changes to effective backend permissions remain deferred. This is not simulation-engine activation.

**Preflight:** frontend main `8af7165b42bf5a928eb3c43d9f13af2980d750ca`; Documentation CI #28 `38584991130` SUCCESS; Code CI #1006 `38584991301` in progress at verification, no failure verified. Latest backend Full CI #686 `38569456312` SUCCESS, published source `76b14cda4520f1eff242bd474c02ce4db317d385`, OpenAPI artifact #11897156166 ZIP SHA-256 `191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`. Extracted `hidra-api.json` verified 457,784 bytes, 244 paths, 231 schemas and SHA-256 `d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`.

**Source:** all nine `/api/v1/simulation/` paths and eight transitively referenced schemas, preserving published operation IDs, request/response types, run/recommendation lifecycle enums, versioned input/model and topology references, and JWT bearer security. Remove server URL and display-source metadata only; canonical sort keys. Candidate `openapi/candidates/hidra-simulation-76b14cda4520f1eff242bd474c02ce4db317d385.json` has 7,071 bytes, SHA-256 `b53a24a8d6c0b0b436f77cff0dfbd4c219c7cbc8b7df6016bd33a0190eafdb6a`, Git blob `76e7ffa56a959d2bedb03e51fc01a9bcbdab7a97`. Independently reconstructed from the legacy pinned slice and published bearer security, matching the Git blob extracted from the actual source artifact byte for byte.

**Implementation:** repin Orval source; add fail-closed exact source digest, path, OpenAPI 3.1, nine routes/eight schemas, Simulation-only prefix checks. Preserve fifteen prior source locks and full old baseline checks on four remaining contract generators. Four Node tests validate source provenance, existing typed simulation transport, security/lifecycle metadata, previous operation compatibility and earlier hash locks, registered under `npm test`. CI continues to validate generator, TypeScript, lint, Node/Vitest, Playwright, performance, build and release.

**Commit:** `fix(contract): activate verified Simulation OpenAPI source pin`.
**Exact six-file allowlist:** create candidate JSON and `scripts/verify-simulation-candidate.test.mjs`; update `orval.simulation.config.ts`, `scripts/check-openapi-compatibility.mjs`, `package.json`; append roadmap only. Compare-and-swap directly to `main`, verify exact parent/tree/file list; confirm Code and Documentation CI startup then stop, without waiting for completion. HWEB-F01 remains IN PROGRESS at 16/20 configurations updated, four remaining, plus full shared backend OpenAPI baseline repin and integrated consumer/authorization review. No branch, PR, code comments or runtime UI feature additions.

## 2026-10-14 — HWEB-F01 verified Alarm OpenAPI source activation

**Selected bounded implementation:** repin only the Alarm Orval transport contract to an exact CI-published HidraAPI Alarm slice while retaining existing Alarm list/detail, acknowledgement, closure, shelving and suppression operations. This stage adds typed generated-client transport for the published alarm-raise/capabilities/alias operations; it does not add operator-facing write controls, grant effective alarm permissions or alter runtime UI, workflow or numerical simulation.

**Preflight and source:** HidraWEB `main` `b575a56853cbb46a75b91f176689dbe574e83972`, Code CI #1007 `38585990916` SUCCESS, Documentation CI #29 `38585990927` SUCCESS. HidraAPI Full CI #686 `38569456312` SUCCESS is the latest completed full OpenAPI-producing run; later Full CI #687 `38585772719` was in progress and is not used as verified source. Source commit `76b14cda4520f1eff242bd474c02ce4db317d385`; artifact #11897156166 ZIP digest `sha256:191d763d086c078c0029a61c4c2991247d2db86e75d329991ce009352feeff33`; extracted `hidra-api.json` has 457,784 bytes, 244 paths, 231 schemas, SHA-256 `d00252b93751b1d8cfdbd4eafaeeb6691aff31b70e507b72d1a192c6d45add5f`.

**Exact candidate:** all thirteen `/api/v1/alarm/` routes and eleven transitively referenced schemas from verified full OpenAPI 3.1; retain operation IDs, exact request/response shapes, query defaults, typed raise source enums, lifecycle enums and bearer requirements. Remove server-local and extracted-source metadata only, canonical sort object keys. `openapi/candidates/hidra-alarm-76b14cda4520f1eff242bd474c02ce4db317d385.json` has 13,964 bytes, raw SHA-256 `85bebb810ae40e8250dc316ab1f8dde60ac1d17cff2f6c7aa0f8c95f3c0dd6a1`, Git blob `f6dbf18311c728d568a6152f191ea9d4474c62f8`. Independent reconstruction of the legacy checked-in Alarm slice with newly published raise/capabilities/alias operations and JWT authentication reproduced the exact same blob as extraction from the downloaded published artifact.

**Changes:** repin `orval.alarm.config.ts`; add fail-closed exact Alarm source path, raw SHA-256, OpenAPI 3.1, thirteen routes/eleven schemas, alarm-only route prefix validation to compatibility gate. Retain sixteen prior verified source hash locks and original historical full-source comparison for three outstanding contracts. Add four Node tests for evidence, old list/shelving/suppression payload compatibility, typed raise/aliases/security, preserved lifecycle and previous locks; register in `npm test`. Preserve existing generated-client compatibility, backend-controlled authorization and UI. Unchanged CI must verify generation, lint, TypeScript, Node/Vitest, performance, build/release and browser E2E.

**Commit:** `fix(contract): activate verified Alarm OpenAPI source pin`. **Six-file allowlist:** CREATE `openapi/candidates/hidra-alarm-76b14cda4520f1eff242bd474c02ce4db317d385.json`, CREATE `scripts/verify-alarm-candidate.test.mjs`; UPDATE `orval.alarm.config.ts`, `scripts/check-openapi-compatibility.mjs`, `package.json`; APPEND-ONLY `docs/roadmap/ULTIMATE_ROADMAP.md`. Compare-and-swap expected `main`, verify exact parent/tree/six-file diff and Code + Documentation CI startup, then STOP without waiting for completion. HWEB-F01 IN PROGRESS at seventeen of twenty feature contract sources updated; three remain (Workbench, Identity/Organization and Planning), followed by unified full OpenAPI baseline repin and integrated consumer/effective-permission review. No branches, PR, code comments, runtime UI changes, real calibration or numerical simulation.

## 2026-10-14 — HWEB-F01 verified Workbench OpenAPI source activation

**Selected bounded implementation:** repin the existing Workbench read/search Orval source from the verified, CI-published HidraAPI full OpenAPI contract. Preserve both existing Workbench canonical and legacy module-scoped paths, pagination, record attributes, and operational query behavior. This is client transport reconciliation only: no new execution UI, effective permission grants, write operations, simulations or backend changes.

**Current preflight:** HidraWEB `main` `d994a50da15f80dd72fa0abef8979cc1c4e4807a`, Code CI #1008 `38587310931` SUCCESS, Documentation CI #30 `38587310946` SUCCESS. HidraAPI latest complete Full CI #688 `38587270668` SUCCESS at commit `016d972725ac9a02a46f08ec024e0a4b0f95bda6`. Previous Full CI #687 failed, superseded by successful #688. Exact published contract artifact #11904974738, ZIP SHA-256 `5005fcf4e2b2e2fcd3057dbe11450487c27280a64039fcd735df4ba2b38e92d5`; extracted `hidra-api.json` contains 244 paths and 231 schemas, 457,784 bytes, SHA-256 `b610fb3182c48678e2d999cb27d28762353c29ac04848fbf825f876133bd571e`.

**Verified slice:** all nine Workbench paths, five `/api/v1/workbench/` routes and four `/api/v1/{module}/workbench/` legacy aliases, plus all four transitively referenced schemas. The source is byte-equivalent to the published OpenAPI 3.1 artifact, preserving operation IDs, exact parameter and request/response metadata, typed paginated resources/search, and bearer security. Only server and display-source metadata are removed, object keys sorted. Candidate `openapi/candidates/hidra-workbench-016d972725ac9a02a46f08ec024e0a4b0f95bda6.json` is 6,127 bytes, SHA-256 `264d4cc227a2d16f800c2a8ca3186b1dbaba4fe4315e25ec50aa516d338fa891`, Git blob `25cf8ad11733c68567300777fc39236cde42218b`. Independently reconstructed from the old pinned Workbench source plus backend-published bearer security; Git blob matched the actual full-artifact extracted slice exactly.

**Implementation:** repin `orval.workbench.config.ts`, extend fail-closed source validation for path, SHA-256, OpenAPI 3.1, nine routes/four schemas and both Workbench route families. Preserve all seventeen earlier artifact proof locks and historical full-contract compatibility checks for the two remaining sources. Four Node regression tests verify exact provenance, canonical and legacy list/detail/search operation signatures, safe typed reads, JWT metadata, and earlier source locks. Register the tests through `npm test`. The unchanged CI continues to validate generated clients, lint, TypeScript, Node/Vitest, performance, packaging/release and browser E2E.

**Commit:** `fix(contract): activate verified Workbench OpenAPI source pin`.
**Exact six-file scope:** CREATE `openapi/candidates/hidra-workbench-016d972725ac9a02a46f08ec024e0a4b0f95bda6.json`; CREATE `scripts/verify-workbench-candidate.test.mjs`; UPDATE `orval.workbench.config.ts`, `scripts/check-openapi-compatibility.mjs`, `package.json`; APPEND-ONLY `docs/roadmap/ULTIMATE_ROADMAP.md`.
**Exit:** compare-and-swap commit directly to the expected main head, verify parent, tree and six-file allowlist, confirm Code and Documentation CI startup and STOP without waiting. No branches, PRs, code comments or unrelated changes. HWEB-F01 IN PROGRESS with eighteen of twenty feature contract sources reconciled, two remaining (Identity/Organization and Planning), then common full backend OpenAPI baseline repin and integrated consumer/effective-permission acceptance.

## 2026-10-15 — HWEB-F01 verified Planning OpenAPI source activation

**Scope:** repin only the Planning Orval transport against the CI-published backend. Preserve period, plan, revision, target and nomination reads, existing revision update, and backend-defined approval execution. No new planning decision UI, direct approval authority, business-logic change, or numerical simulation.

**Preflight:** HidraWEB main `a74dce6e71edd9588dd093ae0c2322cf0afc4078`, Code CI #1009 `38589462557` SUCCESS and Documentation CI #31 `38589462656` SUCCESS. Latest completed full HidraAPI CI #694 `38689504851` SUCCESS, source `d14c44fc527ea1115ad87baafa21a3264bf6950c`. Exact published OpenAPI artifact #11951167403, ZIP digest `sha256:ded84284f203cf746e57ed69b3342af02c0c684c676e1162c44d27708fe304df`.

**Exact candidate:** `openapi/candidates/hidra-planning-d14c44fc527ea1115ad87baafa21a3264bf6950c.json`; 16 Planning routes, 20 transitively referenced schemas, OpenAPI 3.1, 17,428 bytes, SHA-256 `82982efde1b8eaa6ee66976025af9382aaa45b79a7c96553c4b035a8c41195de`, Git blob `503f5bf936b6eadf271b6506d5a558ce5acf0fb4`. The candidate was extracted directly from the verified backend full OpenAPI artifact, not reconstructed. Backend bearer requirements, operation IDs, request and response types, pagination, nomination reads, planning status enums, revision optimistic-lock `expectedUpdatedAt`, and approval workflow `expectedTaskUpdatedAt` are retained. No runtime permissions are expanded.

**Implementation:** repin `orval.planning.config.ts`; extend fail-closed source proof with immutable filename, SHA-256, route/schema counts and Planning-only prefix; preserve eighteen prior source proof locks and historical full-source comparison for Identity/Organization. Four Node regression tests validate digest, typed planning transport, backend-controlled workflow approval, optimistic guards, and previous locks; registered in `npm test`. Existing CI validates generated clients, TypeScript, lint, Node/Vitest, performance, release/build, and browser tests.

**Commit:** `fix(contract): activate verified Planning OpenAPI source pin`. **Exact six-file allowlist:** CREATE candidate JSON and `scripts/verify-planning-candidate.test.mjs`; UPDATE Orval Planning config, compatibility checker, package manifest; APPEND-ONLY this roadmap. Commit via guarded compare-and-swap directly to main, verify exact parent/tree/file scope, confirm Code and Docs CI startup and stop without waiting. HWEB-F01 IN PROGRESS with 19/20 source pins reconciled; remaining Identity/Organization, unified backend full-artifact baseline, and integrated consumer/permission verification. No PR, branches, or unrelated files.

## 2026-10-15 — HWEB-F01 verified Identity/Organization OpenAPI source activation

**Scope:** source-reconcile the final Identity/Organization Orval input against the exact full CI-published HidraAPI contract. Preserve public password-login, distinct external OIDC bearer completion/evaluation, normal Hidra bearer authentication, identity roles/permission evaluation and organization responsibilities. This stage changes generated-client transport only: no new effective permission or operational UI controls.

**Preflight:** HidraWEB main `800e2649d4426c921972b60ed2393cdaf2eb93fa`, Code CI #1010 `38698279244` SUCCESS and Documentation CI #32 `38698279240` SUCCESS. Latest completed full HidraAPI CI #694 `38689504851` SUCCESS, source `d14c44fc527ea1115ad87baafa21a3264bf6950c`; newer backend CI #695 was in progress and is not considered approved source. Full OpenAPI artifact #11951167403, ZIP digest `sha256:ded84284f203cf746e57ed69b3342af02c0c684c676e1162c44d27708fe304df`.

**Exact source:** `openapi/candidates/hidra-identity-organization-d14c44fc527ea1115ad87baafa21a3264bf6950c.json`, 35 paths, 39 transitively referenced schemas, 32,399 bytes, raw SHA-256 `7158e86e61be8049972048769da2632f2a474984487644a31d7ffcdd5ce723e4`, Git blob `3c6835ef87ca36b0b13cdd061772c65758e94662`. Extracted from the successful published full OpenAPI 3.1 artifact and copied byte-for-byte to GitHub, independently confirmed by matching its Git blob. Retain login public security `[]`, external OIDC `externalOidcBearerJwt`, Hidra JWT for authenticated operations, backend-defined permission enforcement, responsibility reconciliation response/types and source enum.

**Implementation:** repin `orval.identity-organization.config.ts`; extend fail-closed SHA-256 source evidence, exact path, 35 routes/39 schemas, identity and organization route-prefix checks; preserve all nineteen prior source pins unchanged. Four Node tests verify candidate digest, differentiated login/OIDC/JWT security, typed permissions/reconciliation and all existing proof locks; enroll in `npm test`. Existing GitHub CI remains authoritative for client generation, TypeScript, lint, tests, performance, release/build and Playwright.

**Commit:** `fix(contract): activate verified Identity Organization OpenAPI source pin`. **Exact six-file allowlist:** create candidate and `scripts/verify-identity-organization-candidate.test.mjs`; update Orval identity configuration, compatibility checker, package manifest; append roadmap only. Publish via guarded compare-and-swap directly to `main`, inspect exact parent/tree and six-file diff, observe Code and Documentation CI startup and STOP without waiting.

**HWEB-F01 progress:** All 20/20 individual feature Orval source pins now registered, pending green CI acceptance. This does NOT finish HWEB-F01: unified full backend OpenAPI baseline repin and integrated generated consumer/effective-authorization acceptance are outstanding. No PRs, branches, code comments, deployment calibration or numerical simulation.

## 2026-10-15 — HWEB-F01 Identity/Organization source digest CI repair

**Failure evidence:** HidraWEB Code CI #1011 `38699529845` failed only at `npm run openapi:compatibility`: Identity/Organization source SHA-256 mismatch; all nineteen other contracts were compatible. Documentation CI #33 passed. The verified artifact-extracted candidate `openapi/candidates/hidra-identity-organization-d14c44fc527ea1115ad87baafa21a3264bf6950c.json` was already correct and unchanged: 32,399 UTF-8 bytes, Git blob `3c6835ef87ca36b0b13cdd061772c65758e94662`, verified raw SHA-256 `7158e86e61be8049972048769da2632f2a474984487644a31d7ffcdd5ce723e4`. The prior registered digest was incorrect. Repair the digest-only metadata in the compatibility check, regression test, and roadmap record. No candidate payload, authorization, UI, generated client, or other source lock changes. Commit directly to main with guarded parent and three-file scope; observe Code and Documentation CI startup and stop.

## 2026-10-15 — HWEB-F01 unified full OpenAPI baseline repin

**Preflight:** HidraWEB main `544d84a9b87076b79b70cfa86d05881762a5b4ac`, Code CI #1012 `38699817579` SUCCESS and Documentation CI #34 `38699817577` SUCCESS on the exact head. All 20/20 feature Orval source pins are CI-accepted, independently versioned, and are not modified in this stage.

**Published source:** latest verified successful HidraAPI Full CI #695 `38698554941` from backend SHA `c72eae39cab0b1ec1e20654386fe95ed43b134ab`; artifact #11955308898 `hidra-api-openapi-c72eae39cab0b1ec1e20654386fe95ed43b134ab-38698554941-1-api-contract`, ZIP digest `sha256:c41010840c2bdf8fbd9d4f47b01cec7846dac4cde06d8ba8c6edfa56076eb39a`. Downloaded `hidra-api.json` contains 457,784 raw bytes, 244 paths and 231 schemas, raw SHA-256 `sha256:547570323f48a2c4cfb33740cb579f3fe464af85bb43f0596cf819e935580fe7`. Deterministic gzip with `mtime=0` is 25,598 bytes, SHA-256 `sha256:7ca5a7e9f5b67cf03b915a3278159da0e16f2f26598ed805ca92f3a8ca709e52`. Encoded immutable payload uses four base64 parts totaling 34,132 characters. Source metadata, full JSON and compressed evidence are independently checked at runtime by the existing compatibility gate.

**Bounded implementation:** update only the canonical `openapi/compatibility/hidra-api-baseline.json` evidence manifest, add four immutable `openapi/compatibility/hidra-api-c72eae39cab0b1ec1e20654386fe95ed43b134ab.part[1-4].b64` files, and append this roadmap. Preserve all earlier immutable contract artifacts and 20 feature sources and proof locks. No generated client or application permission changes, no simulation enablement. The existing `npm run openapi:compatibility` gate verifies the exact full artifact and all per-feature locks. Full CI continues to cover type-checking, lint, generated clients, unit/performance tests, build and end-to-end acceptance.

**Commit:** `fix(contract): repin verified full HidraAPI OpenAPI baseline`. Guarded one-parent compare-and-swap directly to main, exact six-file scope and tree verification, then observe Code and Documentation CI startup and STOP without waiting. This is the baseline stage, not a claim of finished integrated consumer and effective-permission validation; HWEB-F01 remains IN PROGRESS until that last stage and green CI.

## 2026-10-15 — HWEB-F01 integrated consumer and authorization boundary acceptance gate

**Preflight:** HidraWEB main `479e26424927416528c910f30b84fc24c411fdfb`; Code CI #1013 `38700693471` SUCCESS and Documentation CI #35 `38700693423` SUCCESS, confirming the unified HidraAPI Full CI #695 OpenAPI baseline and all twenty existing feature pins. This stage adds an explicit, fail-closed Node integration acceptance check to the existing `npm test` suite; existing CI remains authoritative for complete Orval generation, TypeScript, lint, API adapters, Vitest, build, Playwright and packaging.

**Checks:** exactly twenty distinct source-backed feature inputs and generation scripts; generated Identity/Organization and Planning model imports in live consumers; local login vs external OIDC vs Hidra bearer JWT contract boundaries; authorization header clearing and 401 handling; backend effective permission lookup; typed planning approval; suppression and organization responsibility permission identifiers. The test is static contract/consumer guardrail verification, not a claim of backend runtime permission enforcement or real-OT acceptance. No production, UI, backend, generated artifact, or permission policy changes.

**Scoped commit:** `test(contract): verify integrated consumer authorization boundaries`. Create `scripts/verify-integrated-consumer-boundaries.test.mjs`; update `package.json` npm test and append this roadmap only. Publish directly to the exact expected main with compare-and-swap, inspect commit parent/tree and three-file allowlist, observe Code and Documentation CI startup and stop without waiting. HWEB-F01 requires green integrated Code and Docs CI before marking complete; deployment/live-role validation is separate.

## 2026-10-15 — HWEB-F01 final CI acceptance and handoff

**Acceptance:** HWEB-F01 source-backed contract reconciliation and integrated static consumer/authorization boundary verification are VERIFIED for the development CI scope, at exact HidraWEB main `501ee147b3bcf9f3a47df5a06b4c160b5d1eb563`. Code CI #1014 (run `38701540314`) SUCCESS and Documentation CI #36 (run `38701540363`) SUCCESS on that SHA. All twenty feature-specific OpenAPI inputs are CI-accepted, the unified full baseline is pinned to the successful HidraAPI Full CI #695 artifact, and the static integrated consumer/permission regression gate was accepted by the existing build, code, documentation and test workflows.

**Scope qualification:** This is development-source and CI acceptance only. It does not verify deployed backend effective authorization, OT/IT network isolation, live industrial telemetry, calibration, industrial UAT, or numerical simulation. No new business UI functionality, permission grant, contract change or backend implementation is authorized or implied.

**Transition:** Mark HWEB-F01 VERIFIED (CI scope). HWEB-F02 onward remain candidate tasks, not automatically selected: consult the canonical roadmap, verify current backend contract capabilities and record separately authorized implementation scope before executing the next engineering/product stage. This acceptance-only documentation commit updates the roadmap and nothing else.

## 2026-10-15 — HWEB-F02 physical graph authoring execution preflight (BLOCKED)

**Preflight authority:** HidraWEB main `0bd090d1bfa5385a7dfcac9fa209f2efb1e53d5b`, Documentation CI #37 `38702249762` SUCCESS and latest Code CI #1014 `38701540314` SUCCESS. HidraAPI current main `cda31df33f880d984f529561b49eb202e1b323c7`; its Documentation CI #317 `38702421568` SUCCESS. Latest successful full-contract HidraAPI CI #695 `38698554941` at `c72eae39cab0b1ec1e20654386fe95ed43b134ab`, as pinned in the HWEB-F01 shared baseline. Backend main is newer than that full-contract artifact and must not be implicitly treated as full-CI-verified.

**Verified source:** `src/main/java/dz/sh/hidra/modules/topology/api/rest/controller/SpringTopologyController.java` on backend main exposes only `GET /api/v1/topology/capabilities`, `POST /api/v1/topology/create-pipeline-system` (alias `/pipeline-systems`), and `POST /api/v1/topology/register-facility` (alias `/facilities`). `TopologyController.java` defines only the pipeline-system creation and facility-registration commands. The checked-in source-verified frontend Topology slice lists these endpoints and read-only map/layer/search APIs, but no graph/node/segment draft CRUD, physical pipe-section revisions, connectivity validation, immutable publication or concurrency-controlled graph retrieval.

**Disposition:** HWEB-F02 (ENG-001/004/010/012) is **BLOCKED for implementing the full physical network editor**, pending accepted backend endpoints and corresponding effective permissions, request/response schemas, negative tests and a green exact-sha full OpenAPI artifact. Preserve the existing topology read-only map and supported pipeline-system/facility commands without fabricating local persistence or optimistic-locking. This preflight is not a selection or implementation of F02 UI and does not authorize backend changes, simulator controls, or a PR. A later, explicit source-backed substage may be registered once the missing interfaces exist.

**Commit scope:** append-only canonical roadmap; no production code, generated clients, source pins or permissions. Publish directly to main with expected parent and single-file diff, confirm Documentation CI startup and stop.

## 2026-10-15 — HWEB-F03 surveyed route and elevation authoring preflight (BLOCKED)

**Execution evidence:** HidraWEB main `7b30cf27fe753fdda2ab157d95424e88afe85801`, Documentation CI #38 `38702732113` SUCCESS; latest Code CI #1014 `38701540314` SUCCESS. HidraAPI current main `cda31df33f880d984f529561b49eb202e1b323c7`, Documentation CI #317 `38702421568` SUCCESS; latest published full-contract CI #695 `38698554941` SUCCESS on earlier backend revision `c72eae39cab0b1ec1e20654386fe95ed43b134ab`. Later documentation-only backend changes do not constitute a freshly verified full OpenAPI artifact.

**Source inspection:** Backend `src/main/java/dz/sh/hidra/modules/topology/api/rest/controller/TopologyMapController.java` at current main exposes only `GET /api/v1/topology/map/layers`, `GET /layers/{layerId}`, `GET /layers/{layerId}/features`, `GET /geojson`, and `GET /search`. The live `SpringTopologyController.java` publishes pipeline-system/facility creation and capability discovery, not survey geometry writing. The CI-accepted pinned Topology OpenAPI source has map GETs and system/facility POSTs, but no create/read/revise/validate/publish contract for ordered surveyed route points, CRS/vertical datum, stationing/chainage or intermediate elevation profiles. The canonical ENG-003 gap register likewise records **OPEN; NOT EDITOR-READY**.

**Disposition:** **HWEB-F03 is BLOCKED** for interactive route and elevation-profile authoring pending accepted backend typed survey/profile APIs, effective grants, explicit units and CRS/vertical datum, field-precision/source provenance, versioning, concurrency and negative tests plus successful exact-SHA full OpenAPI publishing. Do not substitute map GeoJSON reads, display interpolation, local pseudo-storage or inferred heights for source-backed surveyed facts. Existing topology visualization remains preserved. This documentation-only preflight does not select F03 UI implementation, modify HidraAPI, authorize new simulation work, or unlock dependent F07/F10 completion. Other independent stages F04/F06/F08 may be assessed separately.

**Scope:** append-only canonical roadmap, expected-parent guarded single-file commit directly to main, verify tree/diff, confirm Documentation CI startup and stop.


## HWEB-F11 / W1 — owner-selected six-module foundation (2026-11-05)

Owner Next selects one whole W1 delivery, including canonical frontend adoption,
implementation and tests. Exact message: `feat(context): complete identity organization and party administration`.
WEB baseline46676deb70fd38b906bdb370f020f609d0a16c98, parent7b30cf27fe753fdda2ab157d95424e88afe85801,
tree19e14dea9e82b523095fc43fa31f9b6ff9bc219e, Docs39 SUCCESS; latest Code1014 is historical.
Backend source18e7a7596aea1b26e958130996c8811ae7fe27e4 Full1124/Docs911 SUCCESS;
acceptance-only main a90253943bbaac7bc671f0bc4d45f719229d5eb1 Docs912 SUCCESS.
HAPI-923/924/925 prerequisites are accepted; preserve their synthetic/industrial limits.
The corrected credential response is IdentityLocalCredentialState; never reconstruct
transport DTOs by hand. Preserve HWEB-F01–F10 and their distinct scopes/history;
this owner-approved foundation supplement supersedes sequencing only for W1.

Whole scope: existing user/role/permission creation and grants plus safe LOCAL credential
initialization/reset, activation/deactivation, ordinary grant revocation, operation
capabilities; organization catalog/unit/position/employee/active-Identity choices,
employee activation/history and existing assignment/responsibility operations; Party
catalogs, search/detail/pagination, register/edit/activate/deactivate/role/history and
eligible reference selection. Use generated owner types and actual backend errors,
explicit refresh after conflicts, no optimistic success or mutation retry. Passwords
are transient only, cleared on submission, never query/mutation-cache variables,
storage or displayed errors. Existing supported LOCAL login remains intact.

Exact MODIFY: docs/roadmap/ULTIMATE_ROADMAP.md,
docs/architecture/Hidra-API-Web-Contract-v1.md,
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md,
package.json, orval.identity-organization.config.ts,
openapi/compatibility/hidra-api-baseline.json,
scripts/check-openapi-compatibility.mjs,
scripts/verify-identity-organization-candidate.test.mjs,
scripts/ensure-generated-clients.test.mjs,
scripts/verify-integrated-consumer-boundaries.test.mjs,
src/features/context/api/identityOrganizationApi.ts,
src/features/context/IdentityAdministrationPage.tsx,
src/features/context/OrganizationAdministrationPage.tsx,
src/features/context/components/IdentityCommandPanel.tsx,
src/features/context/components/OrganizationCommandPanel.tsx,
src/features/context/components/OrganizationCommandPanel.test.tsx,
src/features/context/i18n/contextTranslations.ts,
src/app/router/router.tsx, src/shell/navigation/navigationRegistry.ts,
src/shared/i18n/resources.ts, .github/workflows/ci.yml (Party generator only).
Exact CREATE: orval.party.config.ts,
openapi/candidates/hidra-identity-organization-18e7a7596aea1b26e958130996c8811ae7fe27e4.json,
openapi/candidates/hidra-party-18e7a7596aea1b26e958130996c8811ae7fe27e4.json,
src/features/context/components/FoundationIdentityPanel.tsx,
src/features/context/components/FoundationEmployeePanel.tsx,
src/features/party/PartyAdministrationPage.tsx,
src/features/party/api/partyApi.ts,
src/features/party/components/PartySelector.tsx,
src/features/context/FoundationAdministration.test.tsx,
scripts/verify-foundation-candidate.test.mjs,
tests/e2e/foundation-context-live.spec.ts.
No DELETE, generated source commits, other feature repins, dependency changes, backend
mutation, release/deployment/P3 or W2. Existing auth/session, responsibility owner
and all20 old generators remain; add one Party client (21 total), deliberately update
count assertions. Full A1 live integrated acceptance remains separate.

Runtime input: actual successful Full1124 aggregate artifact13416100262, ZIP SHA256
ff57bbfe5e2328c184e14615207c6bf0d6ada4593a0e9494db472db18768064c;
runtime member SHA256 b9703ce80de0e9592d46553af6cf7044bf803bcd1a65ff9008da05cb9d53c25a.
Extract exact Identity/Organization and Party path subsets plus transitive schema
closure without changing endpoint/schema/security meaning; pin SHA256s. All other
feature inputs/proof locks remain untouched. Validate npm verify, focused component
and browser tests using available tooling. Intercepted browser tests are mocks;
real no-interception browser qualification requires an explicitly configured
synthetic native backend and remains pending if unavailable. Status IN_PROGRESS,
not VERIFIED. Publish directly main expected-head guarded, verify exact tree/parent/
blobs/scope, observe Code/Docs CI creation/start and STOP.


### W1 implementation and validation record — 2026-11-05

IMPLEMENTED / CI_ACCEPTANCE_PENDING, not VERIFIED/COMPLETED. All work above is
one whole W1 delivery; no W2/W3/W4/A1 implementation is included. The earlier
credential-schema blocker was repaired/accepted in API and is not bypassed here.

Identity lifecycle uses backend advisory MANAGE_USERS plus current permission
metadata, server lifecycle/CAS generation and explicit reasons. Credential requests
use generated Credential; responses use IdentityLocalCredentialState. Passwords
clear before submission and never enter mutation/query caches, persisted state,
logs or displayed error details. Rejected actions block further mutations until
explicit refresh; no automatic mutation retry. Existing LOCAL login, role/permission
creation and grant assignment remain. Ordinary grant revocation consumes the actual
backend-issued grant identifier; no grant-list API or grant ownership is invented.
Organization uses backend type/position catalogs and searchable user/unit/employee
choices; employee activation/history uses current server revision. Existing native
appointment/responsibility workflows remain intact. Search choice results are
bounded to100 and users can narrow the server query; there is no local reference truth.
Party has dedicated paginated search/detail, type/role discovery, registration with
required country, guarded metadata and DRAFT activation / ACTIVE deactivation,
role assignment, paginated audit history and eligible-only selection (ACTIVE filter
plus genuine backend eligibility). SUSPENDED/BLOCKED/RETIRED are not activated by UI.
New labels are localized in French, English and Arabic. Frontend permission checks
remain UX only; actual owner authorization is final for every operation.

Exact extracted artifact identities: Identity/Organization57 paths/61 schemas,
SHA256050bf86810479d9cef87e3e200928f7993d342dbb51bf835d5110f15e53f94a4;
Party11 paths/9 schemas,SHA2562538dcde09e8332749b1e3bbf1978331fade66c4a14591895ce11e132c0a1ae6.
Independently matched every extracted path/schema/security scheme to actual Full1124
runtime JSON; all historical input bytes and19 unrelated Orval configuration bytes
unchanged. Twenty original generator slots retained; add Party for21. Generated
clients remain local build outputs excluded from publication, not new DTO ownership.

Actual local verification:
- All21 source-pinned contract checks and all21 generators PASS.
- TypeScript, ESLint (zero errors;4 preexisting unrelated refresh warnings),
  production build and bundle budgets PASS; initial JS888.0KiB/900KiB,
  25 lazy entries,largest lazy39.7KiB/96KiB.
- Full Vitest52 files/137 tests PASS and Node contract/build guardrails95/95 PASS.
  Nine new component/API cases cover denied administration with no reads, backend
  capability denial, credential version and no secret caching, short-password guard,
  original user/employee version forwarding, rejection/no replay/secret suppression,
  eligible reference filtering, stale Party refresh and explicit grant/role routes.
- Performance2 files/6 tests PASS; git diff --check and precise contract/input
  preservation checks PASS. An earlier run concurrent with browser/build work had
  one existing Alarm5000ms timeout; isolated full rerun137/137 PASS without changing
  timeout, assertions or unrelated source.
- Playwright lists67 tests/28 files. Native foundation specs cover LOCAL onboarding,
  Party eligibility/history and employee activation/history without interception;
 3 specs require configured live WEB/API and native administrator credentials.
  No live fixture exists locally, so these are pending, not passing browser proof.
  Chromium download failed on invalid/truncated archives; system Chromium launch
  failed before test execution at process_singleton_posix socket() Operation not
  permitted. All64 default browser attempts therefore failed at launch, not with
  application assertion verdicts; the3 live specs were skipped. No passing local
  browser result is claimed. Existing hosted Code CI installs/runs Chromium normally
  and remains mandatory. No browser failure is converted into accepted evidence.

Live qualification inputs are HIDRA_FOUNDATION_WEB_URL, HIDRA_FOUNDATION_API_URL,
HIDRA_FOUNDATION_ADMIN, HIDRA_FOUNDATION_PASSWORD, against a separately started
same-origin service with native JWT, synthetic fixtures and mocks OFF. Passwords are
external-only; live specs disable trace/video/screenshots. Never point this test
at production. A1 remains the independent integrated live-backend acceptance.
After publication require exact-source Code and Docs CI; green mocked CI does not
close the no-mock gate, W1 independent acceptance or SITE/operational acceptance.
Next reserved delivery after W1 acceptance: HWEB-F12/W2; do not execute it now.


### W1 native browser qualification wiring — owner Next, 2026-11-05

Code CI1015 (42033696163) and Docs40 (42033696158) SUCCESS at
33b8c051a8bff7e83f9af55160dd3c41c5008ccc, parent46676deb70fd38b906bdb370f020f609d0a16c98,
treef86a5ab5ad3fb781e0a82bcae4e1dd4121a3ce8e. Independently inspected job127266254892:
137 unit/component cases,95 Node contracts,6 performance cases,21 generators,
types/lint/build/packaging PASS. Browser67 cases:63 PASS,1 existing Alarm test
passed only on retry (alarm.spec.ts:61 waiting Acquitter),3 native foundation cases
SKIPPED for missing live configuration. Do not relabel the skips as native acceptance.
W1 remains IMPLEMENTED / LIVE_QUALIFICATION_PENDING, W2 dependency-gated.

Owner Next continues the still-unfinished whole W1 exit condition: real native
backend A/B browser journeys. This is the qualification obligation inside W1,
not a new substage, A1 integrated five-journey delivery or approval waiver.
A1 still qualifies the integrated W1–W4 product later. Preserve the existing
successful default CI, original browser tests and retry settings; do not repair an
unrelated Alarm test here. Use a fresh local review checkout to preserve the earlier
implementation checkout's local changes; no work is discarded by this continuation.

Exact same-task scope reconciliation before mutation: MODIFY .github/workflows/ci.yml
(add a mandatory W1 native job), vite.config.ts (explicit test-only loopback proxy),
package.json (native test command), tests/e2e/foundation-context-live.spec.ts (fail if
mandatory configuration absent, prove native security and Party role persistence),
this roadmap, docs/architecture/Hidra-API-Web-Contract-v1.md,
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md. CREATE
playwright.foundation.config.ts and scripts/foundation-native-fixture.sql.
Message remains `feat(context): complete identity organization and party administration`.
No backend mutation, dependency or unrelated consumer repin, production feature,
DDL/migration, auth bypass, test weakening, release/deployment or W2/P3.

Native job independently checks out and builds accepted API18e7a7596aea1b26e958130996c8811ae7fe27e4
on Java21, starts a disposable PostgreSQL16 database named hidra_foundation_w1,
uses the existing opt-in persistent administrator bootstrap and actual LOCAL/native
JWT authentication. Password/signing material is generated per job and masked.
A test fixture refuses every other database name, seeds only synthetic active
provider and Party/Organization choice catalogs, and does not manufacture user,
credential, role grants, permissions, terminal approvals or disabled security.
All schema comes from the pinned API's real Flyway migrations/JPA validation.
Vite proxy activates only with the explicit native-test flag, points only to
127.0.0.1:8080, and rejects simultaneous mock authentication. Normal product/dev
configuration remains unchanged. The legacy frontend 'basic' selector calls the
real LOCAL exchange and uses issued bearer authorization (verified source);
backend authentication stays JWT, never HTTP Basic or security-disabled.
Native Playwright runs only the3 real cases with retries0 and required inputs,
no route interception, no traces/video/screenshots or credential-bearing artifacts.
Current and second-user native principal/forbidden operations plus persisted Party
role/history are checked. New exact-SHA Code/Docs results and actual no-skip native
reports are mandatory before W1 acceptance; no live pass is claimed by source wiring.
Publish main with expected-head guard, verify paths/parent/tree/blobs/message,
observe CI creation/start and STOP.

W1 native wiring prepublication validation: TypeScript project and standalone native
config/spec compilation passed; ESLint passed with the same four existing refresh
warnings. Focused foundation/organization component regression:10 tests passed;
pinned foundation contract tests:2 passed. Workflow YAML, all native shell blocks
and embedded Python parsed. Vite configuration loading proved native/mock rejection,
loopback-only opt-in proxy and normal-mode absence. Playwright discovery found exactly
3 native cases; missing mandatory inputs failed discovery as required. Native result
report asserts3 expected,0 unexpected/flaky/skipped. These are local wiring/source
checks, not executed native browsers or PostgreSQL proof; hosted CI remains pending.


### W1 / HWEB-F11 same-task CI1016 repair — owner Fail, 2026-11-05

Live main537914d33fa9473431ecc7fb1ab2fadba659dc8e, parent33b8c051a8bff7e83f9af55160dd3c41c5008ccc,
treed44487c24eab7e1a93978c6a47613aa3da740869. Code1016/run42038487373 FAILED;
verify job127282758140 SUCCESS; native job127282758107 FAILED before catalogs/browser
execution. Docs41/run42038487476 SUCCESS. Native logs show Flyway/JPA startup reached
Started, then LocalAdministratorBootstrapRunner audit insertion was rejected by
JpaAuditCatalogEligibilityAdapter: unknown required Audit catalog. No native browser
pass or W1 acceptance exists. This is synthetic fixture ordering/catalog incompleteness.

Repair scope: MODIFY .github/workflows/ci.yml, scripts/foundation-native-fixture.sql,
and this append-only roadmap only. Preserve API18e7a75, all backend source/migrations,
real bootstrap transaction/audit checks, native JWT/permission checks, three mandatory
browser cases, zero retry/skip acceptance and the successful regular verify lane.
First start uses the real Flyway/JPA chain with administrator bootstrap temporarily
unselected. Seed the exact disposable database's required EVENT_TYPE and EVENT_CATEGORY
references plus the existing synthetic catalogs, then stop that process and restart
with the existing enabled real bootstrap. Require its committed audit evidence and
health before browser tests. No SQL user/credential/grant or fabricated audit event,
no production catalog migration, backend mutation, audit bypass or new stage.
Exact registered W1 message remains `feat(context): complete identity organization and party administration`.
W1 remains IMPLEMENTED / LIVE_QUALIFICATION_PENDING; W2 and A1 stay dependency-gated.

Repair validation: YAML parse, bash -n on every native step, embedded Python parse,
and whitespace checks PASS. Source confirms both exact Audit IDs/families and the
real runner's transactional event write. New readiness requires that committed event,
not merely an open health endpoint. No local PostgreSQL/bootstrap/browser execution
is claimed; authoritative runtime validation remains the replacement exact-SHA CI.


### W1 / HWEB-F11 same-task CI1017 selector repair — owner Fail, 2026-11-05

Live main35d8242e11280b5442c15ba2635bfce2ed41d43f (parent537914d33fa9473431ecc7fb1ab2fadba659dc8e,
tree04014791b2829b53fd5db3ffa7bf727cab5244c2). Code1017/run42040043231 FAILED,
regular verify job127288149190 SUCCESS; Docs42/run42040043190 SUCCESS. Native job
127288148675 now passes real Flyway/JPA, catalog seeding and audited administrator
bootstrap; its log confirms committed bootstrap audit evidence. Native beforeAll
login/issued JWT/effective administrator permission assertions passed before all three
browser cases failed at login's exact username label selector (90s timeout each).
LoginPage renders required MUI TextFields, whose associated label includes the
required asterisk; the spec's end-anchored untranslated-suffix-free regex omitted it.

Same-task repair scope before mutation: MODIFY tests/e2e/foundation-context-live.spec.ts,
src/app/pages/LoginPage.test.tsx and this append-only roadmap. Match the exact localized
username/password label with an optional whitespace/required-asterisk suffix and prove
those selectors against actual rendered English/Arabic required login inputs.
No native bootstrap/JWT/permission bypass, API mutation, mock substitution, retries,
timeout increase, skipped case, new stage or W2 selection. Preserve all three native
journeys and no-skip result gate. Exact W1 message remains
`feat(context): complete identity organization and party administration`.
W1 remains IMPLEMENTED / LIVE_QUALIFICATION_PENDING pending replacement exact-SHA CI.

Local repair validation:15 tests passed across LoginPage.test.tsx and
FoundationAdministration.test.tsx. Actual English/Arabic MUI required username and
password inputs resolve using the corrected native regex; Arabic form submission
still calls the selected real gateway interface. Native config/spec TypeScript
compilation, focused ESLint and whitespace checks PASS. These are component/source
checks; no replacement hosted native-browser or PostgreSQL pass is claimed locally.


### W1 / HWEB-F11 same-task CI1018 infrastructure repair — owner Fail, 2026-11-05

Live main13af27a8653a2cff992106b84842ce0786be0fe7, parent35d8242e11280b5442c15ba2635bfce2ed41d43f,
tree568f112dbb272154f3d0b8682579553c59b117a6. Code1018/run42042268342 FAILED,
verify job127295853774 SUCCESS; Docs43/run42042268499 SUCCESS. Native job127295854318
failed within1 second before API compilation: Maven wrapper wget could not fetch
https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.11/apache-maven-3.9.11-bin.zip.
No new application, bootstrap or browser verdict exists on this SHA; prior selector
repair remains awaiting native execution. HTTP cause/status was not logged, so this
is a verified wrapper-download failure, not a proven Maven repository outage.

Scope before mutation: MODIFY .github/workflows/ci.yml and this append-only roadmap.
Restore the wrapper distribution cache using OS and the immutable accepted API's
wrapper-properties digest. Bootstrap that existing pinned wrapper with --version,
maximum3 attempts and bounded5/10-second backoff; terminal failure stays nonzero.
Save its completed distribution cache immediately after successful bootstrap so later
browser failure does not discard a successfully downloaded toolchain. Do not retry
compilation or tests, substitute Maven versions/hosts, edit API source/wrapper,
relax security/assertions, skip native journeys or change the W1 acceptance gate.
Exact registered message remains `feat(context): complete identity organization and party administration`.
W1 IMPLEMENTED / LIVE_QUALIFICATION_PENDING; W2 remains dependency-gated.

Local validation: workflow YAML, native shell blocks and embedded Python parsed;
executed the exact bootstrap shell with isolated tool stubs for first-attempt success,
two failures then third-attempt success, and terminal failure after exactly3 attempts.
All3 cases PASS, with --version-only invocation verified and no real local toolchain
provisioning. Whitespace checks PASS. Hosted wrapper fetch/build/native browser
validation remains pending; no new application or PostgreSQL pass is claimed.


### W1 / HWEB-F11 same-task CI1019 browser origin repair — owner Fail, 2026-11-05

Live main78ec58c27eb68855040cad953e70016bc2f78bb9 (parent13af27a8653a2cff992106b84842ce0786be0fe7,
treea07f87a264cb21526a26f0645d00607bb3ba4981). Code1019/run42044865509 FAILED;
verify job127304963256 SUCCESS; Docs44/run42044865563 SUCCESS. Native job127304963327
passes Maven/bootstrap/catalog/startup and non-browser native JWT checks. All three
browser cases now fill and submit login but fail to find the Identity heading.
The CI log does not include the browser HTTP status or error-context content.
Source establishes an actual configuration mismatch: application-test.properties
sets allowed CORS origins empty; Vite's test proxy changes Host to8080 but preserves
the browser Origin5173; Spring enables its CORS filter and exact origin validation.
This explains browser POST rejection while origin-free APIRequestContext login works,
but a new hosted status assertion is required to establish that runtime verdict.

Scope before mutation: MODIFY .github/workflows/ci.yml,
tests/e2e/foundation-context-live.spec.ts and this append-only roadmap. Configure only
http://127.0.0.1:5173 as allowed origin via CLI on both disposable API starts (CLI
is needed because the test profile overrides the common property). Exercise the
real native login with the configured browser Origin and require its exact allowed
origin response. Browser login explicitly requires HTTP200; safe diagnostics list
only fixed bootstrap endpoint paths/statuses, never credentials, tokens or bodies.
Do not suppress/strip Origin, disable CORS, add wildcard origins, bypass auth,
intercept API responses, alter retries/timeouts or waive any browser acceptance.
Preserve accepted API18e7a75, all migrations, three journeys and no-skip gate.
Exact registered W1 message remains
`feat(context): complete identity organization and party administration`.
W1 IMPLEMENTED / LIVE_QUALIFICATION_PENDING; W2 remains dependency-gated.

Local repair validation: workflow YAML, every native shell block and embedded Python
parsed; native config/spec TypeScript, focused ESLint and whitespace checks PASS.
Playwright discovery still finds exactly3 mandatory native journeys. Source review
confirms exact-origin Spring CORS configuration, the test profile's empty override,
and unchanged security permission endpoint paths. No local Spring/PostgreSQL/browser
runtime result is claimed; native Origin/status assertions await exact-SHA CI.


### W1 / HWEB-F11 same-task CI1020 navigation repair — owner Fail/continue, 2026-11-05

Live main9e97573c58ad0a3636d9b18a719f8f531e2223b9, parent78ec58c27eb68855040cad953e70016bc2f78bb9,
tree15c5bbcd042cce260fe50a5faad231e6d4b75732. Code1020/run42046251765 FAILED;
regular verify job127309883520 SUCCESS; Docs45/run42046251902 SUCCESS. Native job
127309883059 passes audited bootstrap, exact-origin login, native JWT/permissions
and the full LOCAL user onboarding/credential/activation/real-login/403 journey.
The Party and employee tests time out finding their first fields after page.goto.
AuthProvider retains bearer/session state only in React memory; full document
navigation creates an anonymous provider and RequireAuthentication returns to login.
The sidebar already performs client-side React Router navigation.

Same-task scope: MODIFY tests/e2e/foundation-context-live.spec.ts and this append-only
roadmap; CREATE src/features/context/FoundationNativeNavigation.test.tsx. Use the
actual localized sidebar buttons to reach Party and Organization, assert target URL
and heading, and anchor the Party Code selector so it cannot also match Country code.
Prove the real AuthProvider/RequireAuthentication/sidebar retain the same session
through both routes and the actual localized form selectors resolve in all3 locales.
Component transport fixtures are component evidence only, never native acceptance.
Preserve transient-only credentials, native API18e7a75, PostgreSQL/bootstrap/CORS,
three mandatory journeys, zero retries/skips, persisted lifecycle/role checks and
all security assertions. No product auth/storage change, backend mutation, test
weakening, timeout change, W2 or A1 selection. Exact W1 message remains
`feat(context): complete identity organization and party administration`.
W1 IMPLEMENTED / LIVE_QUALIFICATION_PENDING; W2 remains dependency-gated.

CI1020 repair local validation:13 component cases PASS across the new3-locale
navigation regression, existing foundation administration and organization guard.
The regression uses the actual AuthProvider, RequireAuthentication, HidraSidebar,
LoginPage and destination form components with fixture transport; one login and the
same principal/bearer survive both sidebar route changes. Exact Code is required and
distinct from Country code in every locale; employee selectors resolve unchanged.
TypeScript project and standalone native config/spec compilation, focused ESLint,
two pinned foundation contract checks, documentation checks and whitespace PASS.
Native Playwright discovery retains exactly3 cases; no native browser/PostgreSQL
rerun is claimed locally. Exact-source hosted native CI remains the acceptance gate.



### W1 / HWEB-F11 independent acceptance and handoff — owner Next, 2026-11-05

**Disposition: VERIFIED / COMPLETED for the registered development foundation and
synthetic native qualification scope.** This supersedes W1's earlier pending
dispositions; it does not change historical entries or accept another delivery.

Reviewed source: WEB `042844beb4beb2a53387e93fdf220aa1ba90bb72`,
parent `9e97573c58ad0a3636d9b18a719f8f531e2223b9`,
tree `f1f34032ff62f74413488c9c7e088fad80fa934d`.
[Code CI #1021](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42050595244)
and [Docs #46](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42050595127)
are SUCCESS on that exact source. Live API main remains
`a90253943bbaac7bc671f0bc4d45f719229d5eb1`; native qualification preserves accepted
immutable API `18e7a7596aea1b26e958130996c8811ae7fe27e4`.

Independently read both job logs and checked the source-bound workflow, native
configuration, fixtures and assertions. Native job
[127325333640](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42050595244/job/127325333640)
SUCCESS: Java21 builds the pinned API, its real Flyway/JPA startup initializes fresh
PostgreSQL16, synthetic catalogs precede the real administrator bootstrap, and the
committed bootstrap audit event is required before browser execution. Native LOCAL
login admits only the configured browser origin and issues JWT/effective permissions.
No mocked authentication, intercepted API, SQL-created account/grant/audit evidence
or disabled security substitutes for the native owner workflows.

All3 mandatory native journeys PASS, with0 failed/flaky/skipped and retries0,
in22.8 seconds. The executed JSON-statistics gate confirms the same counts:
- LOCAL user creation, cleared credential input, current credential schema, activation,
  actual new-user login/principal and forbidden Party administration HTTP403.
- Party registration, activation, role assignment, backend eligible-only lookup and
  persisted activation/role history.
- Employee registration, activation and persisted lifecycle history with its reason.

Regular verify job
[127325333394](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42050595244/job/127325333394)
SUCCESS:21 pinned contract checks/generators;53 Vitest files/140 tests;95 Node checks;
6 performance cases; types/lint/build/bundle budgets and package verification.
Default intercepted browsers report63 passed,1 existing Alarm case passed on retry,
and3 native cases skipped in that unconfigured lane. Preserve that exact
classification: the three real native cases passed in the separate mandatory job,
and the Alarm retry remains an existing unrelated regression limitation
(`tests/e2e/alarm.spec.ts:61`, waiting for Acquitter). No retry policy, assertion,
timeout or failure classification was changed for acceptance.

Acceptance records the already implemented Identity/Organization/Party foundation,
accepted generated contracts and the registered three native journeys. It does not
claim every administration mutation has individual live-browser coverage. A1 remains
the separate integrated W1–W4 live-backend acceptance gate; industrial calibration,
SITE/operational acceptance and deployment remain outside this result. Numerical
simulation/P3 remains deferred. No API source, contract pin or production behavior
changes in this acceptance action.

Exact acceptance-only scope: APPEND this roadmap,
`docs/architecture/Hidra-API-Web-Contract-v1.md` and
`docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md`; preserve all prior bytes and
all other tree entries. Retain registered message
`feat(context): complete identity organization and party administration`.
Validate canonical documentation, append-only preservation, exact blobs/tree/parent
and guarded direct-main publication. This documentation-only commit requires its
exact-source Docs CI startup; Code CI is path-filtered and is not claimed rerun.
Observe the applicable CI creation/start, then STOP.

**Next reserved delivery: W2 / HWEB-F12**, after separate owner selection and its
source-backed preflight/scope registration. No W2/W3/W4/A1 implementation or release
is selected or executed by this acceptance.


## HWEB-F12 / W2 — owner Next, whole persisted foundation editor (2026-11-06)

One complete registered delivery; exact message
`feat(topology): implement persisted foundation network editor`. Refresh baseline
WEB1a48331b5e569381dc035920e6e62de4eee1c66f (parent042844be, treeb8b90854),
Docs42052400231 SUCCESS; W1 source042844be Code1021/Docs46 accepted above. API
implementationf1fdc206c916a5266f609810c045c6b5688bfd49 Full1137/Docs926 SUCCESS,
independent acceptance db712ab35ff3051c489e74327090d2fc7ef47b33 Docs927 SUCCESS.
Current API source/runtime evidence supersedes earlier W2 discovery/setup blockers.
No separate preflight publication or task subdivision.

Exact CREATE scope: openapi/candidates/hidra-topology-f1fdc206c916a5266f609810c045c6b5688bfd49.json;
src/features/topology/components/NetworkAuthoringPanel.tsx, PipelineEditor.tsx,
InstalledUnitPanel.tsx, StationConfigurationPanel.tsx, FoundationControls.tsx;
src/features/topology/model/foundationGraph.ts and foundationGraph.test.ts;
src/features/topology/api/foundationTopologyApi.ts;
src/features/topology/components/NetworkAuthoringPanel.test.tsx;
tests/e2e/foundation-topology-live.spec.ts; scripts/foundation-topology-fixture.sql;
scripts/prepare-foundation-topology.mjs.
Exact MODIFY: src/features/topology/NetworkTopologyPage.tsx,
api/topologyPermissions.ts, i18n/topologyTranslations.ts; orval.topology.config.ts;
scripts/check-openapi-compatibility.mjs and verify-topology-candidate.test.mjs;
playwright.foundation.config.ts; .github/workflows/ci.yml; this roadmap;
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md.
Paths below NetworkTopologyPage are relative to src/features/topology unless stated.
No DELETE; generated Orval output stays untracked.

Deliverable: backend company/system/catalog choice paging, real system/station setup
and activation, physical unit/position/installation, typed graph nodes/ports/branches,
canonical Pipeline/Segment associations, persisted revision/history reload, station
graph publication and installed configuration. Reuse existing map reader; expose
geometry as absent unless supplied by owner. Forms are unsaved until backend success.
No browser pseudo-persistence, handwritten transport DTO, inferred privilege or
automatic mutation retry. Native grants and separate restricted database principals
are synthetic fixture/security setup only; all promised business writes use APIs.
Acceptance requires local types/lint/unit/build/contracts and source-pinned native
browser journey/denial/stale-write checks in CI. Existing W1 cases remain mandatory.
CI-first publication records honest limitations and startup, then STOP; no W3/W4/A1,
P3, release or deployment. Status IMPLEMENTATION_IN_PROGRESS until hosted evidence.

W2 same-delivery review adds exact CREATE
`src/features/topology/api/foundationTopologyApi.test.ts`: protected owner calls
share one frontend request queue because each backend transaction locks the same
Identity ledger with NOWAIT. This prevents self-contention across simultaneously
mounted panels; it never retries failed commands or changes database lock policy.
The regression must prove serialization, rejection propagation and subsequent
independent request execution. No separate stage or commit is introduced.

### W2 whole source submission and available validation — 2026-11-06

The exact registered delivery now contains14 CREATE /11 MODIFY /0 DELETE paths.
Generated Orval output under src/api/generated stays outside the commit. No API
repository, migration, original task payload, prior accepted contract or unrelated
feature is changed. Whole editor source and native fixture/tests above are delivered
in the same registered task/message; no later delivery is executed.

Local npm ci/prebuild, all21 source-pinned OpenAPI checks, TypeScript, lint
(0 errors;6 fast-refresh warnings including4 existing),56 Vitest files/146 tests,
96 Node contract checks,6 performance cases and production build/bundle checks PASS.
Initial static JavaScript896.1KiB/900KiB;25 lazy entries; largest lazy route39.7KiB/
96KiB; largest chunk995.4KiB/1050KiB. No performance limit was increased. Focused
Topology queue/graph/scope/failed-write regressions pass; the queue preserves actual
refusals and never retries. Playwright native configuration enumerates all5 mandatory
W1/W2 tests with retries0. This host lacks a running native API/PostgreSQL pair;
local enumeration/component tests are not native browser/PostgreSQL proof.

CI-first candidate IMPLEMENTED / NATIVE_BROWSER_QUALIFICATION_PENDING, not accepted.
Publish to existing main with expected head1a48331b5e569381dc035920e6e62de4eee1c66f,
exact message `feat(topology): implement persisted foundation network editor`;
verify exact tree,parent,blobs and25-file scope, observe new-SHA Code/Docs startup,
then STOP. Next selection must repair any failed W2 gate first or independently
accept W2 after actual evidence. W3/HWEB-F13 remains the next reserved implementation
after W2 acceptance, not selected now. A1/browser-integrated milestone, live OT,
industrial/SITE acceptance, numerical/P3, release and deployment remain unexecuted.


## HWEB-F12 / W2 — CI1022 native startup repair (2026-11-06)

Owner reported failure of Code CI1022, run42223227158, on WEB
`ec63822ec1b086755d57f9e666805a94b2d320a2` (parent
`1a48331b5e569381dc035920e6e62de4eee1c66f`, tree
`ae6bde9b6ad350ad1396f0fff74546c3f81dab3a`). Docs48/run42223227043
succeeded. Code's verify job succeeded, including contracts, lint, types,
unit/component/performance checks, build, artifact verification and full ordinary
Playwright regression. Native job127910144118 failed at API restart, before
permission preparation or any of the five mandatory native W1/W2 journeys.

Observed cause: Flyway was given separate owner credentials without an explicit
migration URL. Spring Boot attempted URL discovery from the protected routing
DataSource and threw UnsupportedDataSourcePropertyException: Unable to find
suitable method for url. The first schema initialization already succeeded; this
is a restart configuration failure, not a timeout or a browser-test failure.
Pinned API f1fdc206c916a5266f609810c045c6b5688bfd49 uses wrapped routing
DataSources; its separate-principal PostgreSQL fixtures explicitly supply
spring.flyway.url alongside migration credentials.

Registered repair under the same HWEB-F12/W2 parent; exact message
`fix(ci): supply explicit Flyway URL for native foundation restart`.
Exact MODIFY scope: `.github/workflows/ci.yml` and APPEND this roadmap only.
Provide spring.flyway.url from the existing HIDRA_TEST_DATASOURCE_URL on restart.
Keep the ordinary w2_app login, migration owner, three independent protected
principals, fixture privileges, immutable API pin, health/audit startup gate and
all five mandatory native journeys unchanged. No CREATE/DELETE, backend changes,
new contract, relaxed acceptance, retries, timeout or performance-limit change.

Validation: workflow YAML parsing, bash syntax for every run block, exact restart
URL/credential/pin/five-test assertions, canonical documentation checks, append-only
roadmap preservation and exact two-path diff pass locally. No native API/PostgreSQL
runtime is available on this host; these checks do not establish runtime startup
or browser/PostgreSQL qualification. Existing successful exact-source verify/Docs
evidence above applies to CI1022, not to a new commit. After guarded direct-main
publication, verify exact parent/tree/blobs and observe new-SHA Code/Docs creation
or startup, then STOP. W2 remains NATIVE_BROWSER_QUALIFICATION_PENDING until actual
hosted evidence and independent acceptance; repair any failed gate first.
Next reserved implementation remains W3/HWEB-F13 after W2 acceptance and separate
selection; A1, SITE, numerical/P3, release and deployment remain unexecuted.


## HWEB-F12 / W2 — CI1023 lifecycle and native assertion repair (2026-11-06)

Owner reported Code1023/run42235711844 failure on
`419fff00a1bfb3b36fd67661373e2a282ca2d8ea` (parent ec63822e,
tree3c1570d8df5ef99547bc7ae08d83a4cea0bf34a4). Docs49 succeeded;
Code verify and all three native W1 cases succeeded. The Flyway repair is proven
through restricted-principal startup and the committed bootstrap audit event.
W2 failed at disabled station graph preparation and an unknown-company denial
request returning503 instead of403.

Registered repair under existing HWEB-F12/W2; exact message
`fix(topology): gate station readers on active lifecycle and repair native assertions`.
Exact MODIFY scope: src/features/topology/components/NetworkAuthoringPanel.tsx,
src/features/topology/components/NetworkAuthoringPanel.test.tsx,
tests/e2e/foundation-topology-live.spec.ts and APPEND this roadmap. No CREATE/DELETE.
Mount station installation/configuration readers only after server-returned ACTIVE
facility status. Test the PLANNED-to-ACTIVE transition and rejected activation.
For native denial, create/activate a real company through Party APIs, prove the
administrator control request succeeds, then require exact403 and no disclosed
catalog/write result for the unprivileged LOCAL actor. New engineering drafts
must return201 (200 is replay-only), as implemented by the pinned backend.
Preserve five mandatory native tests, no retries, immutable API pin, Flyway URL,
restricted credentials, fixture privileges, exact stale409 and persisted/history
checks. No backend, contract, timeout, performance-budget or acceptance weakening.

Local native diagnosis on fresh PostgreSQL16.15 and compiled pinned API
f1fdc206c916a5266f609810c045c6b5688bfd49 confirms the PLANNED station returns403
for installation and configuration readers; after activation they return200
(initial absent configuration404). Existing UI mounted them before activation and
retained their errors. Station graph author/publication, configuration save/read/
history succeed with unchanged fixture privileges. New engineering draft creation
returns201. These HTTP checks are not browser or industrial acceptance. Chromium
cannot launch locally because this host disallows its Unix socket; retain hosted
browser qualification as a separate gate. Further validation and publication
evidence follows below; W2 remains NATIVE_BROWSER_QUALIFICATION_PENDING.


### W2 CI1023 repair validation and publication handoff

The bounded four-path candidate passes TypeScript, lint (0 errors,6 existing
fast-refresh warnings),21 pinned OpenAPI compatibility checks,56 Vitest files/
148 tests (including PLANNED/activation/refusal regressions),96 Node contract
checks, production build and unchanged bundle budgets. Vitest was run with two
workers after the initial parallel API/build/unit run caused two unrelated5-second
unit timeouts and a native503 under host contention; no test timeout, application
deadline or mutation retry was changed. The final native run was isolated from
compilation/unit load and passed without command retries on a fresh PostgreSQL16.15
schema with the same restricted principals and compiled immutable API pin.

Native HTTP evidence: system/station creation and activation, physical position/
unit/installation, published station graph, installed-configuration save/current/
history, new engineering draft201, Pipeline/graph save, current and version2
history reads, stale write409 with unchanged persisted graph, and real LOCAL actor
catalog/write denial403 against an active company. All promised business objects
were created through owner APIs. These are native HTTP/PostgreSQL checks and
component regressions, not the hosted browser journey or a deployment/SITE claim.
Playwright enumerates exactly5 mandatory tests with retries0; local browser launch
remains blocked by the host Unix-socket restriction. Canonical Docs validation,
append-only historical preservation, exact four-file diff and whitespace checks
pass. Generated clients, native tools, diagnostic scripts and runtime files remain
outside the publication. The API repository is unchanged.

Publish this repair directly to existing main with expected head
419fff00a1bfb3b36fd67661373e2a282ca2d8ea and the registered message above; verify
parent/tree/blobs, observe exact-SHA Code/Docs creation or startup, then STOP.
W2 remains IMPLEMENTED / NATIVE_BROWSER_QUALIFICATION_PENDING; independent
acceptance follows successful hosted evidence. Next reserved implementation is
W3/HWEB-F13 only after W2 acceptance and separate selection. No A1, P3 or deployment.


## HWEB-F12 / W2 — independent native browser acceptance (2026-11-06)

Owner Next selects this acceptance stage only. Verified implementation/repair SHA
`e09edd393e3b6253e9ecc32172377bc52f2d1b38`, parent
`419fff00a1bfb3b36fd67661373e2a282ca2d8ea`, tree
`228bdc4cf7fa9e7ebd93010cb2c9d92fd2ba65e6` remains live main at preflight.
Code1024 [run42246674965](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42246674965)
and Docs50 [run42246674846](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42246674846)
are completed SUCCESS on that exact SHA. Native job127990590404 executed all five
mandatory W1/W2 browser cases:5 passed in48.3 seconds,0 failed/flaky/skipped;
the mandatory report assertion succeeded. The separate verify job127990591052
also succeeded, including the full ordinary Playwright regression suite.

Transition: HWEB-F12/W2 ACCEPTED for the registered software/native-browser scope;
NATIVE_BROWSER_QUALIFICATION_PENDING is resolved by this exact-source hosted
evidence. This includes persisted system/station/installation/configuration and
Pipeline graph browser reload/history, stale-write409 with unchanged persisted
version, ordinary LOCAL actor catalog/write403 and preservation of the three W1
journeys. The native lane uses API f1fdc206c916a5266f609810c045c6b5688bfd49,
fresh PostgreSQL16, genuine JWT and separate restricted database principals.
No mocks, retry, deadline relaxation or alternative acceptance replaces that lane.

This acceptance covers the registered journeys and does not establish exhaustive
live coverage of every mutation, integrated W1-W4/A1 acceptance, industrial
calibration, SITE/operational acceptance, numerical/P3 readiness or deployment.
Historical ENG gaps and task mappings remain preserved. No backend/API pin,
application behavior, fixture, workflow or security rule changes in this stage.

Registered exact message: `docs(topology): accept W2 native browser qualification`.
Exact acceptance-only scope: APPEND docs/roadmap/ULTIMATE_ROADMAP.md,
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md. Preserve every prior byte
and every other tree entry. Validate canonical documentation, append-only
preservation and exact parent/tree/blobs. Guard direct-main publication against
expected head e09edd393e3b6253e9ecc32172377bc52f2d1b38. This documentation-only
commit requires its own Docs CI startup; Code CI is path-filtered and is not
claimed rerun. Observe applicable CI creation/start, then STOP.

Next reserved implementation: W3/HWEB-F13, requiring separate owner selection
and source-backed scope registration. W3/W4/A1, numerical/P3, release and
deployment are not selected or executed by this acceptance.


## HWEB-F13 / W3 — selected whole typed Configuration delivery (2026-11-06)

Owner Next selects W3 after W2 acceptance and Docs51 SUCCESS on
1cf9d87e21ada106bd3a5bdb7e82b11ab0b35f77 (tree6bb07611beb9f42c842672f4261f866b34790ef6).
B5/HAPI-927 is accepted; current API db712ab35ff3051c489e74327090d2fc7ef47b33
retains implementation f1fdc206c916a5266f609810c045c6b5688bfd49, whose Full1137
run42211688855 succeeds. Runtime artifact13499236734 ZIP SHA256
b86e00f3a4ce83474ea3af1dc297b6ebaabfb6ab27ccc25ebcec426478f4a928 is authenticated.
Closed Configuration slice: 13 paths/14 schemas, SHA256 6df15b4570903b52ba0008ac66c746812a7a58f786613d8158de3cc1c3165d1d.
Exact message: `feat(configuration): integrate typed foundation administration`.

Exact CREATE: openapi/candidates/hidra-configuration-f1fdc206c916a5266f609810c045c6b5688bfd49.json; src/features/configuration/ConfigurationAdministrationPage.test.tsx;
tests/e2e/foundation-configuration-live.spec.ts; scripts/foundation-configuration-fixture.sql.
Exact MODIFY: src/features/configuration/ConfigurationAdministrationPage.tsx;
api/configurationApi.ts (relative to that feature); orval.configuration.config.ts;
scripts/check-openapi-compatibility.mjs; scripts/verify-configuration-candidate.test.mjs;
tests/e2e/configuration-administration.spec.ts; playwright.foundation.config.ts;
.github/workflows/ci.yml; this roadmap; docs/architecture/Hidra-API-Web-Contract-v1.md;
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md. No DELETE.

Reuse route/security shell; owner namespace/definition/flag choices and typed
STRING/NUMBER/BOOLEAN, PUBLIC/INTERNAL unscoped definitions; exact activation
version, environment half-open overrides, effective default/override provenance,
server-derived actor, BOOLEAN flag lifecycle/state and stale conflict review.
Restricted metadata remains redacted by backend; no secret payload inspector,
actor impersonation, raw IDs for supported choices, local durable config or
unsupported approval/scoping/type/strategy promise. Read/write authority is checked
before owner requests. Preserve existing W1/W2 native cases, add W3 positive and
denied native cases against pinned real API/fresh PostgreSQL. No business API mocks
in native lane, mutation retries, fixture business values, API changes or W4/A1/P3.
Local build/contracts/tests and hosted native qualification are independent gates.
Publish guarded against the above WEB head, observe exact-SHA Code/Docs startup,
then STOP. W3 stays pending hosted qualification; W4/HWEB-F14 is next after W3 acceptance.

W3 same-delivery scope reconciliation also MODIFY
`src/features/administration/AdministrationContract.test.ts`: preserve exact canonical
POST/body expectations while asserting the generated client's JSON header and
optional abort signal. This replaces the old handwritten-transport call shape;
no production route or test assertion is weakened.


## HWEB-F13 / W3 — whole typed Configuration source delivery (2026-11-06)

W3 is IMPLEMENTED / NATIVE_BROWSER_QUALIFICATION_PENDING. Reuses the existing
ConfigurationAdministrationPage route, security shell and native W1/W2 lane.
Consumes only generated transport from the authenticated runtime Configuration
slice of API f1fdc206c916a5266f609810c045c6b5688bfd49. Full runtime JSON SHA256
 da4326497b4c65f9dcbeb286b64c1c9840a6fc73b91c3543c48633f682fb3fba;
closed slice13 paths/14 schemas SHA256
6df15b4570903b52ba0008ac66c746812a7a58f786613d8158de3cc1c3165d1d.
All20 other active contract pins and historical Configuration artifacts remain.

Current administrator authority is required before any protected read, choices
or counts. Owner namespace/definition/flag paging replaces raw ID entry; exact
server activation timestamps and active version IDs are passed unchanged.
Supported STRING/NUMBER/BOOLEAN, PUBLIC/INTERNAL unscoped definitions without
approval support default/effective reads and explicit half-open environment
overrides. Actor identity comes from the backend, never browser input. BOOLEAN
flag creation/activation, environment state/default provenance and stale-version
conflict review are supported. Failed commands are never retried and require
explicit review/reset. Confidential metadata is rendered as metadata; no raw JSON
payload inspector, secret reference input, local durable truth or physics exists.
The former legacy DURATION/approval/scoped/actor-ID forms and their mocked
transport assertions are replaced by admitted typed controls and matching tests,
not claimed supported by B5. Backend redaction, not UI hiding, is authoritative.

Native CI preserves the three W1 and two W2 journeys and requires all seven
W1/W2/W3 cases passed with0 failed/flaky/skipped and retries0. W3 positive source
covers NUMBER lifecycle, canonical default, override and exclusive-end fallback,
BOOLEAN flag lifecycle/state, exact stale409 preserving enabled state and browser
reload. The denied case uses genuine LOCAL credentials and requires403 before
catalog/missing-detail/effective/flag disclosure or definition write. The only
new SQL fixture provisions a synthetic namespace and ordinary Configuration DML
privileges in the exact disposable database; business definitions/values/flags
are written through owner APIs. No new backend or production migration is needed.

Local validation PASS: npm ci/generation;21 pinned OpenAPI checks; TypeScript;
lint0 errors/6 existing fast-refresh warnings;57 Vitest files/151 tests with two
workers;97 Node contract tests;6 performance cases; production build and unchanged
bundle budgets (initial JS896.4KiB/900KiB;25 lazy entries; largest lazy route39.7KiB/
96KiB; largest JS chunk995.4KiB/1050KiB). Seven native tests enumerate successfully.
An outdated shared handwritten-transport assertion was repaired to retain exact
routes/body and additionally assert generated JSON header/abort signal; final
full suite passes. Native API/PostgreSQL/browser journeys are authored for CI,
not claimed executed on this host. Ordinary browser regressions likewise require
hosted execution. Canonical documentation, shell syntax and append-only checks
are required before guarded publication. Generated clients remain untracked.

Exact source publication is4 CREATE /12 MODIFY /0 DELETE paths under the registered
W3 message `feat(configuration): integrate typed foundation administration`.
Expected WEB head1cf9d87e21ada106bd3a5bdb7e82b11ab0b35f77. Verify parent/tree/blobs,
observe new-SHA Code/Docs creation or startup, then STOP. Hosted qualification and
independent acceptance remain gates; green unit tests do not prove deployment.
W4/HWEB-F14 remains next after W3 acceptance and separate selection. A1 integrated
acceptance, industrial/SITE, numerical/P3, release and deployment remain unexecuted.


## HWEB-F13 / W3 — CI1025 job-budget repair (2026-11-06)

Owner Next refresh: main c667fd8bc3d325c16c3d444be8ca2f5003dccd13,
parent1cf9d87e21ada106bd3a5bdb7e82b11ab0b35f77,
tree39a9f9c9856c6326e03a1c5117f6af04e2d844c5.
Docs52/run42267088253 SUCCESS; Code1025/run42267089410 CANCELLED.
Verify job128061707752 SUCCESS. Native job128061707229 ran from18:02:40Z
to18:22:49Z. Its WEB/client/browser installation step consumed17m21s.
Pinned API build/schema, audited bootstrap and fixture preparation all succeeded.
All seven native W1/W2/W3 tests passed in49.4s; the mandatory report asserted
7 passed/0 failed/flaky/skipped at18:22:44.401Z. GitHub then cancelled the job
at the20-minute wall-clock limit. These passing test observations do not turn
a cancelled workflow into a successful acceptance result.

Same-parent bounded repair; exact message
`fix(ci): allow native qualification setup sufficient job time`.
Exact MODIFY: .github/workflows/ci.yml and APPEND this roadmap. No CREATE/DELETE.
Increase only foundation-native timeout-minutes20 to40. Preserve verify's15-minute
budget, seven-test assertion, native retries0, per-test90-second timeout, immutable
API pin, application deadlines, credentials, fixtures and every business/security
assertion. No release, deployment, new feature or W4 selection.

Validation: YAML parse, bash syntax for all run blocks, exact one-scalar workflow
delta, append-only roadmap preservation, exact two-path diff and whitespace checks
PASS. No redundant app suite is needed for this execution-budget-only change.
Publish guarded against c667fd8bc3d325c16c3d444be8ca2f5003dccd13, verify exact
parent/tree/blobs/message, observe exact-SHA Code/Docs creation/start, then STOP.
W3 remains NATIVE_BROWSER_QUALIFICATION_PENDING until a completed successful
workflow and independent acceptance. W4/HWEB-F14 remains reserved after acceptance.


## HWEB-F13 / W3 — independent native browser acceptance (2026-11-06)

Owner Next selects acceptance of the registered whole W3 delivery only.
Verified live WEB main3601f491bb3661a50b650961888f71c87bcd17dd,
parentc667fd8bc3d325c16c3d444be8ca2f5003dccd13,
treebd0101e4bc6883e8a6951846be5bb657984bb735.
[Code1026/run42271560936](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42271560936)
and [Docs53/run42271560727](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42271560727)
completed SUCCESS on this exact SHA. Verify job128077136755 succeeded.
Native job128077137217 succeeded and its actual log reports7 passed in57.3s;
the mandatory report assertion confirms0 failed/flaky/skipped, with retries0.
The earlier cancelled Code1025 remains historical and is not relabelled successful.

Transition: HWEB-F13/W3 ACCEPTED for registered typed Configuration software and
native browser scope. NATIVE_BROWSER_QUALIFICATION_PENDING is resolved by this
hosted execution. The two W3 cases prove real Configuration activation, typed
NUMBER default/canonical override, exclusive-end fallback, BOOLEAN flag state,
exact stale409 preserving state, browser reload and ordinary LOCAL actor403
before protected catalog/detail/effective/flag disclosure or definition write.
The three W1 and two W2 journeys also passed, preserving their accepted scope.
Runtime uses immutable API f1fdc206c916a5266f609810c045c6b5688bfd49, genuine JWT,
fresh PostgreSQL16 and the registered synthetic catalog/credential fixtures.
No business API interception or mutation retry substitutes for native execution.

This accepts only the admitted STRING/NUMBER/BOOLEAN, PUBLIC/INTERNAL, unscoped
and no-approval Configuration contract and BOOLEAN flags. It does not accept
unsupported strategies/types, confidential-value authoring, exhaustive mutation
coverage, enterprise commissioning, integrated A1, industrial calibration,
SITE/operational acceptance, numerical/P3, release or deployment. Current backend
administrator-only semantics remain authoritative. Historical task/ENG mappings
and prior evidence remain preserved. No application, API pin, test, fixture,
workflow, database migration or security change is made by this acceptance.

Registered exact acceptance message:
`docs(configuration): accept W3 native browser qualification`.
Exact MODIFY scope: APPEND docs/roadmap/ULTIMATE_ROADMAP.md,
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md only. No CREATE/DELETE.
Validate canonical Docs, append-only preservation, exact three-path scope,
parent/tree/blobs/message; publish directly to main with expected head
3601f491bb3661a50b650961888f71c87bcd17dd. This documentation-only commit requires
its own Docs CI startup; Code CI is path-filtered and is not claimed rerun.
Observe applicable CI creation/start, then STOP.

Next reserved implementation: W4/HWEB-F14 configured Workflow journeys, after
separate owner selection and source-backed registration. W4, A1, P3, release and
deployment are not selected or executed by this acceptance.


## HWEB-F14 / W4 — selected delivery blocked by owner-target handoff (2026-11-06)

Owner Next selects the reserved whole W4 delivery, not W4 implementation approval
for invented contracts. WEB maina6887c0f8705129b21bd9ca4c9c859930ff7dcbd,
parent3601f491bb3661a50b650961888f71c87bcd17dd,
treed7c038140e6bd149c0016f06fcb8d3d34d24934a; Docs54/run42289453575 SUCCESS.
API maindb712ab35ff3051c489e74327090d2fc7ef47b33 retains implementation
f1fdc206c916a5266f609810c045c6b5688bfd49. The authenticated runtime artifact
(full JSON SHA256 da4326497b4c65f9dcbeb286b64c1c9840a6fc73b91c3543c48633f682fb3fba)
and exact source were inspected. Root WEB AGENTS.md remains absent.

Verified contract gap: GET /api/v1/workflow/definitions requires all five of
 targetModule, targetTypeId, workflowPurposeId, targetId and targetLocator.
WorkflowDefinitionDiscoveryController/Responses publish only a target-specific
supported process, independent reviewer choices and transition metadata. They do
not bootstrap the target coordinates or publish a general reference catalog.
The admitted B6 process is installed-characteristic-link approval. Topology's
InstalledCharacteristicLinkResponses.Link publishes immutable link/source fields
but no pre-approval Workflow target digest, canonical locator or target/purpose
catalog IDs. ApprovalDecision publishes targetSha256 and WorkflowEvidence only
AFTER approval, so it cannot supply the initial Workflow-start handoff.
No workflow-target/approval-target discovery route exists in the verified runtime.

InstalledCharacteristicLinkApprovalTargetDigester owns versioned length-prefixed
UTF-8 canonicalization and microsecond timestamp encoding in Domain. The native
TopologyInstalledCharacteristicLinkWorkflowTargetLookup independently checks that
digest and its canonical locator against the protected immutable owner revision.
Browser duplication or a test-generated locator/digest would silently make this
owner invariant part of the frontend contract. The public REST schema currently
contains neither a published pre-approval handoff nor a versioned browser encoding
contract. A mocked source probe is not a native browser round trip.

This is a dependency conflict with the complete W4 browser-start requirement,
not a reversal of accepted B6 software. TASKS_HPS-015 B6 acceptance explicitly
states that WorkflowFoundationProcessPostgresIntegrationTest uses a mocked owner
target probe and is not physical Topology acceptance. Existing native Topology
read/Workflow suites retain their separate valid scopes. W1/W2/W3 acceptance and
existing task inbox/actions remain unchanged. W4 is BLOCKED at initial target
handoff; no partial feature or counterfeit successful native case is published.

Bounded backend proposal (NOT an existing endpoint and NOT implemented here):
add an owner-authorized pre-approval Workflow handoff read for an exact installed
characteristic link revision, reusing the protected native owner read. Return
server-derived targetModule, targetTypeId, workflowPurposeId, targetId/digest,
targetLocator, exact link revision and digest-format version. Resolve admitted
active catalog IDs on the server; no hardcoded migration IDs in the browser.
Treat this response as metadata, never an authorization token: Workflow must
still revalidate the target, current starter/reviewer authority, independence,
CAS and target provenance. Preserve denial before existence disclosure and omit
manufacturer payloads. No schema rewrite, numerical solver or general designer.
Acceptance requires exact source/OpenAPI/CI proof, foreign/revoked actor denial,
pre-approval target round trip and a real configured independent-reviewer
APPROVE/REJECT flow with stale/replay checks. Then resume the same whole W4 task
using generated transport and native browser qualification. No new task ID is
adopted and no API modification is selected by this WEB documentation disposition.

This blocked disposition's exact message is
`docs(workflow): record W4 owner-target handoff blocker`.
Exact MODIFY scope: APPEND docs/roadmap/ULTIMATE_ROADMAP.md,
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md only. No CREATE/DELETE.
Canonical Docs, append-only, exact tree/parent/blobs/message checks precede guarded
main publication against a6887c0f8705129b21bd9ca4c9c859930ff7dcbd. Observe exact-SHA
Docs creation/start, then STOP; Code is path-filtered and not claimed rerun.
Next necessary selection is the bounded backend handoff contract proposal, then
resume HWEB-F14/W4. A1, SITE, numerical/P3, release and deployment remain unexecuted.

## HWEB-F14 / W4 — resumed whole configured Workflow delivery (2026-11-06)

Owner Next resumes the same whole W4 after the backend prerequisite acceptance.
WEB source99318555d9e74da4e7b429d5d311a12b9a85706a, tree2f4cfb06c764f32c811b29bf5857316e30883038,
Docs55 SUCCESS; accepted W3 Code1026 remains the runtime baseline. Root AGENTS.md
absent. API implementation5817406923e53761577ac41bbc3f318b517c3977 Full1140/Docs930
SUCCESS, acceptance428a6f00a5813294b067daeb0df5f5bdaff72658 Docs931 SUCCESS.
Authenticated aggregate13544860761 ZIP34e13d4962ff3f258afa9e2c61ee0c909fe72b25a2400c76465dc0676981df66
contains genuine runtime JSON062864129140cf85bc16982e7a856fb6aef0dc3a9af650cab635c2f9b0222493.
Closed Workflow slice14 paths/17 schemas, SHA25644bd9f9f21b6a3f757a44ec5fc36ddf2228fb8047244bc38d65f6e00ee6ca28e.
The prior handoff BLOCKED entry is historical; its backend dependency is resolved.

Exact registered message: `feat(workflow): integrate configured foundation task journeys`.
CREATE openapi/candidates/hidra-workflow-5817406923e53761577ac41bbc3f318b517c3977.json;
src/features/workflow/components/WorkflowStartPanel.tsx and WorkflowStartPanel.test.tsx;
tests/e2e/foundation-workflow-live.spec.ts; scripts/foundation-workflow-fixture.sql;
scripts/prepare-foundation-workflow.mjs. MODIFY WorkflowTasksPage.tsx,
api/workflowApi.ts, api/workflowApi.test.ts, api/workflowPermissions.ts (relative to
src/features/workflow); src/shared/i18n/resources.ts; orval.workflow.config.ts;
scripts/check-openapi-compatibility.mjs; scripts/verify-workflow-candidate.test.mjs;
playwright.foundation.config.ts; .github/workflows/ci.yml; APPEND this roadmap,
docs/architecture/Hidra-API-Web-Contract-v1.md and
docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md. No DELETE/generated output.

Use generated server handoff/definition/start/task transport; no browser digest,
locator encoding, catalog seed IDs or actor impersonation. Exact revision addressing
is explicitly supplied by the operator/deep link; supported process/reviewer choices
come only from owner discovery. Server actor is current authenticated principal,
not an editable field. Separate explicit start and task assignment preserve a
recoverable persisted instance when assignment fails; no automatic mutation retry.
Existing task/action/timeline UI keeps permitted=true and required reason/comment
and exact version handling; stale actions require explicit refresh before resubmit.

Extend the native lane with the immutable accepted API implementation pin above;
preserve all seven W1/W2/W3 cases, deadlines, retries0 and separated principals.
Disposable W4 fixture grants exact source/publication/Workflow lock privileges and
explicit synthetic process/catalog/reference policy only. Setup uses genuine owner
APIs for users/Party/unit/manufacturer revision/link; synthetic manufacturer
qualification/source authorization and process/assignment configuration are
schema-owner reference fixtures, not fabricated approval/history. Temporarily
admit manufacturer publishing only during setup and revoke before consumer reads.
Real browser starts and reviewer APPROVE/REJECT, persisted reload/history, stale
version/replay denial and unrelated actor non-disclosure must run in hosted CI;
no intercepted business API/native passing claim. Local components/contracts/build
checks and hosted native acceptance stay distinct. No API modifications, P3,
A1 integrated acceptance, SITE, release or deployment. After guarded direct-main
publication observe exact-SHA Code/Docs queue/start and STOP; W4 pending independent
native acceptance. Next reserved task HWEB-F15/A1 only after W4 acceptance.

W4 same-delivery scope reconciliation: also MODIFY
src/features/workflow/WorkflowTasksPage.test.tsx to exercise an actual component409,
blocked resubmission, successful explicit task/action refresh and server-version
resubmission. This is a regression inside the same whole W4 scope, not another
stage. Native execution remains seven preserved W1-W3 cases, then explicit W4
capability setup and two W4 cases; both reports must contain zero failures/skips.

## HWEB-F14 / W4 — whole source delivery and validation handoff (2026-11-06)

W4 is IMPLEMENTED / NATIVE_BROWSER_QUALIFICATION_PENDING. New transport is generated
from the accepted source-stamped Workflow slice, preserving all historical pins.
The start panel accepts exact link revision addressing, obtains owner handoff and
supported process/independent reviewer choices, uses the current principal for the
backend actor-match field, and never computes a digest/locator or accepts editable
actor identity. Explicit start then assignment preserves instanceId in the route;
reload resumes server state instead of repeating start, and known taskId suppresses
repeat assignment. Command errors block resubmission until deliberate review;
there are no automatic mutation retries. Existing backend-permitted decisions,
required reason/comment and immutable task timestamp are retained. The selected-task
refresh must successfully reload both task and available actions before a failed
transition can be resubmitted. Component regression proves409 blocking and the new
server timestamp. Workspace requests serialize against native NOWAIT fences without
retries or relaxed owner authority; French/English/Arabic start labels are present.

Native lane pins implementation5817406923e53761577ac41bbc3f318b517c3977. Seven
W1-W3 cases remain mandatory and unchanged. Only after their successful report does
the disposable W4 fixture configure explicit synthetic reference/process policy;
real owner APIs create users, active Parties, unit, manufacturer source revision
and draft link. Manufacturer qualification/source authorization are clearly seeded
reference policy, not a manufacturer approval or industrial evidence. Temporary
source and unit write capabilities are revoked before protected consumer reads,
matching the backend's mutually exclusive credential checks. Workflow instance,
task and human decision/history are written only by the real APIs. Two additional
mandatory W4 browser cases exercise discovered process start, independent reviewer
APPROVE/REJECT, exact stale409, reload/durable timeline, retained physical DRAFT
state, missing-authority handoff404/empty body, forbidden detail/history/count/write
and absence of an unauthorized browser start form. Both7-case and2-case reports
must have0 failed/flaky/skipped, with native retries0 and original40-minute job and
90-second test budgets unchanged. These are authored native qualification cases,
not claimed locally passed runtime evidence.

Local validation PASS: npm ci and all generated client preparation;21 pinned
OpenAPI compatibility contracts; TypeScript; lint0 errors/6 existing fast-refresh
warnings;58 Vitest files/156 tests (two workers),98 Node contract checks,6 performance
cases, production build and unchanged bundle limits (initial JS899.0/900KiB,
25 lazy routes, largest lazy39.7/96KiB, largest JS995.4/1050KiB). Nine native cases
are enumerated. Workflow YAML, every bash run block, exact accepted API pin, ordered
7+2 mandatory counts, script syntax, canonical Docs and whitespace pass.
Ordinary workflow Playwright launch was attempted with retries0: both cases failed
before execution because the pinned Chromium headless-shell executable is absent
locally. No live API/PostgreSQL/browser qualification is claimed on this host.
Hosted Code CI owns ordinary regression and complete native qualification; skipped
native tests in an ordinary run never satisfy the mandatory native lane.

Exact publication:6 CREATE /14 MODIFY /0 DELETE,20 registered paths. Generated
clients, build output, credentials and local reports are excluded. Three governance
documents are append-only; original task/ENG history is preserved. Backend source,
release/tag, numerical/P3, SITE and A1 integrated acceptance are unchanged. Publish
the registered whole W4 message against expected WEB main99318555d9e74da4e7b429d5d311a12b9a85706a,
verify parent/tree/blobs and exact scope, observe new-SHA Code/Docs queue/start,
then STOP. Next is W4 independent native acceptance after successful CI, repairing
responsible failures first; HWEB-F15/A1 remains separately dependency-gated.

## HWEB-F14 / W4 — Code #1027 fixture repair (2026-11-07)

Code #1027 failed on WEB main 8ba7b908a27bc87ac54189ac6fedfa9a02f86e3d,
parent 99318555d9e74da4e7b429d5d311a12b9a85706a and tree
3f930ab5a82973a9778b086a991e30d6b9b3032e. Standard verification, all
seven W1–W3 native cases and Docs #56 passed. The W4 preparation step
failed before either W4 browser case ran. Its manufacturer role insert used
`ON CONFLICT (code)`, but the pinned Party schema has no unique constraint
on that column.

The repair modifies only `scripts/prepare-foundation-workflow.mjs` and appends
this evidence. The disposable fixture seeds the synthetic manufacturer role
when the code is absent and requires exactly one active match for assignment.

Disposable PostgreSQL 16.15 applied all 201 migrations from pinned API
5817406923e53761577ac41bbc3f318b517c3977. All 22 emitted W4 SQL blocks
executed with both an absent role and an existing active role. Duplicate
active and inactive-only roles were rejected. The local harness supplied
synthetic API identifiers and responses. Both W4 browser cases still require
hosted qualification.

Publish `fix(workflow): resolve manufacturer role in native qualification` against
expected WEB main 8ba7b908a27bc87ac54189ac6fedfa9a02f86e3d. Verify the
exact parent, tree and two modified blobs. Stop after verifying exact-SHA
Code and Docs CI queue or start. W4 remains pending independent native
acceptance. HWEB-F15/A1 remains gated on W4 acceptance.

## HWEB-F14 / W4 — Code #1028 native fixture repair (2026-11-07)

Code #1028 failed on WEB main 222d48b199aeed91d57d73fcb44ccbf1a8f8d35c,
parent 8ba7b908a27bc87ac54189ac6fedfa9a02f86e3d and tree
becd57c3df358c61d5cec85c3053d25df6b9bbf4. Standard verification, Docs #57
and all seven W1–W3 native browser cases passed. W4 passed the manufacturer role
SQL and stopped at installed-unit registration with HTTP 503. Neither W4 browser
case ran in #1028.

PostgreSQL 16.15 reproduces the guard rejection with the old fixture grants.
The unit registration guard requires the Party eligibility registry to remain
read-only for the publication role. W4 now registers the unit with the W2
credential, switches to the manufacturer publication grants and revokes source
writes before draft-link creation. Exact Party relation privileges support the
backend's lock checks in the disposable W4 database.

Local browser diagnosis also found that HidraWEB sign-in requires
`security:permissions:read` for permission metadata. Both synthetic W4 users
receive that read permission. The unrelated actor receives no Workflow or
Topology grant and opens the actual protected target in the browser denial case.
Owner APIs still create the unit, source revision, draft link and Workflow records.

Registered repair message `fix(workflow): isolate native qualification fixture privileges`.
Modify only `.github/workflows/ci.yml`, `scripts/foundation-workflow-fixture.sql`,
`scripts/prepare-foundation-workflow.mjs`, `tests/e2e/foundation-workflow-live.spec.ts`
and append this roadmap. Preserve the immutable API pin, the seven W1–W3 and
two W4 native cases, zero retries, the test budgets and the existing exact HTTP
acceptance assertions.

Final local validation passed with the unmodified pinned API
5817406923e53761577ac41bbc3f318b517c3977, a fresh PostgreSQL 16.15 database migrated
by Flyway, and pinned Chromium. Seven W1–W3 cases passed, W4 setup completed through
process discovery, and both W4 cases passed with zero retries or skips. The W4
cases exercised APPROVE and REJECT, persisted timeline after reload, stale replay
409, retained DRAFT state and unrelated actor denial. An earlier isolated run
without the preceding W1–W3 cases returned a unit registration 503 locally. The
final run followed the required CI sequence and completed on the first attempt.

Verify the exact parent, tree and five modified blobs, then publish to existing
main guarded by 222d48b199aeed91d57d73fcb44ccbf1a8f8d35c. Stop after observing
exact-SHA Code and Docs CI queue or start. W4 still requires hosted native
qualification and independent acceptance. HWEB-F15/A1 follows W4 acceptance.

## HWEB-F14 / W4 — independent native acceptance (2026-11-07)

Owner Next selects acceptance of the registered W4 delivery. **HWEB-F14/W4
is ACCEPTED for the configured installed-characteristic link review software
and native browser scope.**

Verified WEB main `6b2230d81832d4d09bdda0410c896dba3ba239fe`, parent
`222d48b199aeed91d57d73fcb44ccbf1a8f8d35c`, and tree
`26a4053479565ce491146068373e61e54b2b2455`.
[Code CI #1029](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484721)
and [Docs #58](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484734)
completed successfully on that exact SHA. Verify job 128376526700 passed, including
21 OpenAPI compatibility checks, 156 component tests and six performance cases.
[Native job 128376526789](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484721/job/128376526789)
confirmed seven W1–W3 cases and two W4 cases passed, with zero failures, flaky
results or skips and retries set to zero. It used the accepted HidraAPI pin
`5817406923e53761577ac41bbc3f318b517c3977`, native JWT, PostgreSQL 16.15 and
the disposable synthetic fixtures.

The W4 evidence covers server-owned target handoff, process discovery, explicit
start and independent reviewer assignment. Separate APPROVE and REJECT executions
persisted in the timeline after reload. Each stale replay returned 409, each
Workflow instance completed, and the physical link stayed DRAFT. The unrelated
LOCAL actor received a 404 with an empty handoff response, and 403 on the tested
inbox, detail, available action, timeline and start calls. The same actor could
sign in and open the exact target route with no handoff or start controls.

This closes the W4 native browser qualification gate. Protected publication of
the physical link, general process design, integrated A1 software acceptance,
industrial and SITE acceptance, numerical/P3, release and deployment remain
separate gates.

Registered acceptance message `docs(workflow): accept W4 native browser qualification`.
Append only to this roadmap, `docs/architecture/Hidra-API-Web-Contract-v1.md`
and `docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md`. Validate canonical
Docs, append-only preservation, exact scope, parent, tree, blobs and message.
Publish directly to main with expected head
`6b2230d81832d4d09bdda0410c896dba3ba239fe`. Documentation Validation applies to
the acceptance commit. Code CI is path-filtered. Stop after exact-SHA Docs CI
queues or starts. The next registered stage is HWEB-F15/A1 integrated software
acceptance, subject to separate owner selection.

## HWEB-F15 / A1 — integrated acceptance blocked on Organization approval (2026-11-07)

Owner Next selects the whole A1 delivery under the adopted foundation supplement.
The registered message for that delivery is
`test(foundation): verify six-module live backend browser journeys`. A1 requires
the five A–E journeys against one pinned API and fresh PostgreSQL, with real
browser and owner API operations. Journey B includes the Organization hierarchy
and scoped appointment path, a supported responsibility assignment and revocation,
and Party creation, activation and reference discovery.
[Adopted foundation supplement](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/428a6f00a5813294b067daeb0df5f5bdaff72658/doc/roadmap/FOUNDATION_PRODUCTION_ROADMAP.md)

WEB main `6807c8e720ccaedf1831330b0b3d401b113f6d84`, parent
`6b2230d81832d4d09bdda0410c896dba3ba239fe`, tree
`c1a7080bf4414d3a23ca60bb303bbb61bca42995`, passed Docs #59. The parent
passed Code #1029 with all nine native W1–W4 browser cases. API main
`428a6f00a5813294b067daeb0df5f5bdaff72658` passed Docs #931 and differs
from the accepted runtime pin `5817406923e53761577ac41bbc3f318b517c3977`
only in documentation. That runtime passed Full CI #1140 and Docs #930.
[WEB Docs #59](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42376409386)
[WEB Code #1029](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42363484721)
[API Full #1140](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42299943400)
[API Docs #931](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42304417409)

**BLOCKED in Journey B.** The runtime OpenAPI from Full #1140, stamped with the
runtime SHA and SHA-256
`062864129140cf85bc16982e7a856fb6aef0dc3a9af650cab635c2f9b0222493`,
publishes responsibility assignment, lookup and revocation. Both mutation
operations consume a completed `organization/RESPONSIBILITY_CHANGE` approval
with a matching operation reference and final APPROVE decision.
`WorkflowApplicationService.startWorkflowInstance` calls
`WorkflowExecutionOwnership.requireTarget`, which requires exactly one
registered resolver for the target family. The pinned runtime has no
Organization responsibility-change resolver. The responsibility approval
adapter's unit test supplies Workflow query responses through a mock. This
evidence qualifies the consumer contract but leaves the required approval
producer unproven. The W4 Topology approval belongs to a different target
family. The accepted WEB Organization client also has an appointment assignment
operation but lacks browser consumers for the published appointment end and
transfer commands.
[Workflow target admission](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/5817406923e53761577ac41bbc3f318b517c3977/src/main/java/dz/sh/hidra/modules/workflow/application/service/WorkflowExecutionOwnership.java)
[Responsibility approval consumer](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/5817406923e53761577ac41bbc3f318b517c3977/src/main/java/dz/sh/hidra/modules/workflow/application/service/OrganizationResponsibilityWorkflowContractAdapter.java)

The whole A1 delivery remains blocked. W1–W4 retain their accepted scopes.
The owner must decide whether to register a bounded prerequisite that admits
an Organization-owned, operation-bound Workflow target and exposes a supported
approval path, or explicitly revise the A1 acceptance criterion. A prerequisite
would require genuine assignment and revocation approvals and exact-SHA
HTTP/PostgreSQL/CI evidence. Native browser acceptance must use owner APIs for
the actual business states and decisions.

Record this blocked disposition within A1 with
`docs(foundation): record A1 organization approval blocker`. Append only to
this roadmap, `docs/architecture/Hidra-API-Web-Contract-v1.md` and
`docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md`. Canonical Docs,
append-only scope and exact parent, tree, blobs and message verification precede
guarded publication to existing main at expected
`6807c8e720ccaedf1831330b0b3d401b113f6d84`. Documentation Validation applies.
Code CI is path-filtered. Stop after exact-SHA Docs CI queues or starts.

## HWEB-F15 / A1 — revised native qualification candidate (2026-11-07)

The owner-approved Journey B revision at API main `1e5e18f7` supersedes the
blocker for this gate. The candidate covers native Journeys A–E against API
`5817406923e53761577ac41bbc3f318b517c3977` and fresh PostgreSQL. Integrated
acceptance remains pending the exact-SHA results and evidence review.
[Qualification procedure](../deployment/Six-Module-Foundation-Acceptance.md)


## HWEB-F15 / A1 — independent integrated native qualification accepted (2026-11-07)

Owner Next selects the acceptance checkpoint for the implemented HWEB-F15/A1
six-module foundation, under the owner-approved Journey B revision in HidraAPI
`1e5e18f7f13d10f21e1cdf95cb0568dfe49cc383`. This is a documentation-only
acceptance of the registered synthetic software journey, not a new implementation.

HidraWEB main candidate `c6a44faa80a74871dc31c5c1e4ada2d1c05863ac`, parent
`980da172d4f6f307deab1a69a79f052aedb0acc5`, tree `edf629c06e37f6e03433706c41f7bb54f1475bc0`, passed
[HidraWEB Code CI #1033](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42410743798), run `42410743798`, attempt 1,
completed SUCCESS on that exact WEB SHA. Both the ordinary verify job
`128518121778` and native PostgreSQL/browser job `128518121956` succeeded.
The immutable runtime backend is HidraAPI
`5817406923e53761577ac41bbc3f318b517c3977` (Full CI #1140 succeeded);
the later backend roadmap amendment is documentation-only. A1's native job
uses genuine LOCAL JWT and fresh PostgreSQL 16 with synthetic policy/privilege
fixtures, not mocked business routes or production plant data.

[Exact-SHA A1 qualification artifact](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42410743798/artifacts/13589920776) ID `13589920776`
was downloaded and inspected: artifact ZIP SHA256
`0bbf1d256569ab456353452c369de3b38c711f033bc8e3925be23d223e7eee2e`;
`sources.txt` records both SHAs, run/attempt 1 and synthetic database;
all 201 Flyway migration entries are success; runtime OpenAPI has 345 paths,
SHA256 `48bfd92267aaba516ae948bde71bb461868ae059afbd9a4ad5630eb39d07a189`
matching the retained checksum. All three Playwright JSON reports have
unexpected/flaky/skipped = 0: A1 integrated Journey B→C 1/1, preserved
W1–W3 7/7, preserved W4 2/2; total **10/10 native cases passed**.
The A1 browser case creates parent/child Organization units, activates and
reads back the employee, creates the exact initial appointment, creates and
activates a Party, records its role/history, checks protected reads with a
separate denied LOCAL actor, and reuses the same Party ID in a persisted
Topology system write/read. The preserved W1–W4 cases exercise Identity,
Topology, Configuration and Workflow, including independent decisions,
unauthorized reads, conflict/replay and reload evidence within their bounded
accepted scopes.

**Disposition: HWEB-F15/A1 ACCEPTED for the adopted revised six-module
synthetic software/native-browser foundation.** The earlier Organization
responsibility approval blocker remains historical and is not claimed
implemented: appointment transfer/end and Workflow-approved responsibility
assignment/revocation are explicitly outside revised Journey B. The fixture
switches a Party row-lock grant between appointment and Topology phases;
concurrent operation under one deployment-role layout was not qualified.
This is not production deployment, SITE/industrial calibration, full security
certification, live OT/SCADA, numerical simulation/P3 or release acceptance.

Registered acceptance-record message:
`docs(foundation): accept A1 six-module native qualification`.
Exact scope: append only this roadmap,
`docs/architecture/Hidra-API-Web-Contract-v1.md` and
`docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md`; no other files,
source changes, tests, fixtures, contracts or GitHub Actions changes.
Validate canonical Docs and preserved append-only history; publish guarded
directly to main from expected head `c6a44faa80a74871dc31c5c1e4ada2d1c05863ac`, verify commit
parent/tree/blobs, observe new-SHA Documentation Validation creation/start,
then STOP. Code CI is paths-filtered for a documentation-only change.
The adopted 12-delivery six-module foundation has no subsequent registered
implementation delivery after A1; engineering production/SITE/release and
previously excluded Organization responsibilities require separate authority.

## 2026-11-08 — HWEB-F16 GZ2 alarm acknowledgement preflight registration

**Status:** REGISTERED. Execution requires a separate owner `Next` after the registration commit's exact-SHA Documentation Validation succeeds.

The owner selected documentation registration for the production-first GZ2 slice. [HidraWEB production-first delivery roadmap](HidraWEB-Production-First-Roadmap.md) records the supporting proposal and its source baseline. WF-01–WF-28 are planning aliases. This checkpoint registers one stage, HWEB-F16, under the existing HWEB-F sequence. Earlier foundation acceptance and historical track records continue to apply. Stage ownership is HidraWEB with Alarm and security reviewers in HidraAPI.

The registration baseline is HidraWEB `7fef9c042052bc2a326b15a103e5ee3d35df1db4` with [Code CI #1034](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42463226504), and HidraAPI `70490d28e1a290a14578c2fc6320d242b4a76ec3` with [Full CI #1145](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536476) and [Docs #937](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536750). These are observations on the inspected commits. Refresh both heads, governing records and applicable CI before preflight execution. Qualify the API runtime pin, runtime OpenAPI artifact and its compatibility with the WEB contract. Formal HAPI-929 acceptance and WEB refresh consumption remain outside this registration.

**HWEB-F16 execution scope.** Assess whether the existing Alarm Console can safely support one human acknowledgement of an existing GZ2 alarm and durable readback. Review the signed-in principal, authorized asset context, alarm list and counts, detail, acknowledgement, and readback. Validate exact endpoint contracts, authorization enforcement before existence or count disclosure, trusted actor/time, persisted state, and actual handling of duplicate or stale actions. Use approved synthetic fixtures and a disposable fresh migrated PostgreSQL environment. Retain the versions, test commands or reproducible procedure, fixture roles and outcomes without secrets or live data.

| Required evidence | Acceptance |
|---|---|
| Contract and context | Exact WEB/API SHAs and CI, runtime OpenAPI digest, route and payload mapping, selected authentication assumption, authoritative GZ2 asset association and approved API pin or documented blocker. |
| Permitted operator | Within-scope actor sees the correct list, count and detail. Acknowledgement persists and a fresh detail read shows the exact alarm, persisted state, actor and time. |
| Scope isolation | Same-company out-of-scope and cross-company actors with equivalent route grants cannot observe protected list entries, counts or existence, fetch detail, or acknowledge via a direct request. Record actual response semantics and verify durable state is unaffected by denied mutations. |
| Completion decision | Append source and synthetic evidence to the gap register. Record ADMIT only when every required proof passes. Otherwise record HOLD with the specific failed or unavailable proof and the smallest API prerequisite or policy decision. No runtime proof may be inferred from a green docs run. |

**Registered preflight message:** `docs(alarm): record GZ2 acknowledgement preflight`.  
**Tracked preflight allowlist:** append findings to `docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md` and append disposition here. Disposable probe fixtures and outputs are temporary. Any repository test, runtime, OpenAPI, migration, workflow or feature change requires separately registered scope.

**Registration publication record.** The selected registration message is `docs(roadmap): register GZ2 alarm acknowledgement preflight`. Its tracked allowlist is an append to this roadmap and the addition of `docs/roadmap/HidraWEB-Production-First-Roadmap.md`. Verify exact parent, tree, blobs and two paths, publish to existing `main` against `7fef9c042052bc2a326b15a103e5ee3d35df1db4`, then observe Documentation Validation creation or start and stop. This checkpoint grants no release, deployment or staging authority.

## HWEB-F16 — preflight disposition: HOLD (2026-11-08)

**Stage executed:** registered documentation-only GZ2 alarm acknowledgement security/contract preflight. **Outcome: HOLD, not ADMIT; no runtime implementation selected.** Detailed source/CI evidence, owner boundary, missing native proofs and proposed synthetic three-principal test procedure are appended to [the backend gap register](HidraAPI-Frontend-Backend-Gap-Register.md#hweb-f16--gz2-alarm-acknowledgement-preflight-hold-2026-11-08). All prior completed delivery and registration entries remain unchanged.

Evidence pins: WEB \`5d01241c60f8a9a8b9353bd756a9749f3e3bd727\` with [Docs #63 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42490353945); API \`70490d28e1a290a14578c2fc6320d242b4a76ec3\` with [Full #1145 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536476) and [Docs #937 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42485536750). API's published OpenAPI ZIP artifact ID \`13619486144\`, archive SHA256 \`2fb6023a4e9f64c7a84d6ebc32ef1259d4af5e9ce8b9ff799ef60925ee216d10\`, is not an independently extracted JSON digest or an accepted updated WEB pin. Existing WEB Alarm Orval input remains on an earlier verified API slice. Source inspection is not new native runtime acceptance.

The exact blocker is server-side **Alarm company/asset resource isolation**: the current query adapter lists and counts unscoped alarms and loads detail by ID; the acknowledgement command has actor provenance and transactional lifecycle persistence but no Alarm resource authorization. Route grants and UI-filtered \`topologyAssetId\` are insufficient. Native GZ2 asset owner binding, in-scope readback, equivalent-grant same-company/cross-company isolation, denied-write permanence, error semantics, and stale/duplicate-action proof were not run and remain **NOT VERIFIED**. Multiple acknowledgement history is expressly supported by existing API tests; any exactly-once policy needs an owner decision.

**Next gate (not selected):** admit one separately registered HidraAPI Alarm resource-authority remediation with complete owner and security acceptance, then verify an exact newly published runtime OpenAPI/WEB pin and rerun the authorized three-principal native PostgreSQL/browser proof. Reconcile the one-action versus idempotency requirement before declaring first-release software acceptance. No WEB feature or CI/runtime change is authorized by F16. The registered preflight commit message is \`docs(alarm): record GZ2 acknowledgement preflight\`, with only the two appended documentation files in scope; after guarded direct-main publication, observe exact-SHA Documentation Validation queue/start and STOP.

## HWEB-F16 — backend qualification evidence refreshed, WEB gate remains HOLD (2026-11-09)

**Selected Next scope:** re-evaluate only the existing HWEB-F16 documentation-only gate after the owner-approved HAPI-930 backend security remediation. This is an evidence-only continuation of the registered preflight, not selection of a new HWEB feature, branch, production release, OpenAPI generation change, or native browser qualification. The earlier 2026-11-08 HOLD decision remains an accurate historical observation at its pinned API SHA.

**Refreshed exact evidence:** HidraWEB main `e518f7113f66c38157c2cc35f239828e8dcbc295` retains [Documentation Validation #64 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42490948209) and its prior code/test baseline. HidraAPI main `02c2d130b902547c113b8fbea83b9affcfd4e892` now has [Full CI #1154 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349) (14/14 PostgreSQL shards, Java unit/architecture, API contract/dictionary, static validation and Full Verification Gate all successful) and [Docs #946 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838208). The raw shard-3 Maven Surefire XML in [artifact #13660488419](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349/artifacts/13660488419) reports `Gz2AlarmScopedOperatorPostgresIntegrationTest`: 1 test, 0 failures, 0 errors, 0 skipped. It executes real signed synthetic LOCAL operator sessions with same route grants and distinct current company/FACILITY grants, scoped Alarm list/count/detail, permitted and denied acknowledgement/history, grant revocation, synthetic facility ownership reassignment and unsupported PIPELINE_SYSTEM denial. Synthetic facility-scoped proof is not verification of the real GZ2 pipeline/system corporate owner, SITE, industrial telemetry or production controls.

**Runtime contract artifact inspected:** [OpenAPI artifact #13660882599](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349/artifacts/13660882599), ZIP SHA-256 `fe2128020b40a9d3ac31a64912735c34534e249f1164a068d8ff0b3cf1fa3d2d`; extracted `hidra-api.json` 851,347 bytes, raw SHA-256 `23cb45be5456bb84f28beec63e0c8b6a03e6b80b157ec55645eb81da829881ff` (347 paths, 13 `/api/v1/alarm/` paths). It publishes bearer-secured `GET /api/v1/alarm/alarms` returning `PageAlarmView`, `GET /api/v1/alarm/alarms/{id}` returning `AlarmView`, and `POST /api/v1/alarm/alarms/acknowledgements` accepting `AcknowledgeAlarmRequest` and returning acknowledgement ID. No signed-off WEB Orval re-pin, regenerated client equivalence or native browser acceptance is evidenced by the artifact.

**Disposition: HOLD remains.** The earlier backend absence of Alarm company+asset authorization has been materially addressed for the synthetic supported FACILITY subset, but HWEB-F16's separate acceptance still lacks (1) an expressly accepted exact current OpenAPI-to-WEB Alarm source pin and compatibility/consumer CI; (2) genuine WEB signed-in three-operator browser POST and fresh GET proof of company/asset counts, 404 denial, immutable actor/time and rejected writes; (3) an approved real GZ2 owner/asset association beyond synthetic FACILITY examples. Multiple distinct acknowledgements remain permitted; strict single-action/idempotency, if wanted, is a separate business decision. The native GZ2 fixture uses synthetic HTTPS issuer `https://identity.hidra.invalid/gz2`, not an approved production issuer URI. No WEB runtime, migrations, feature, OpenAPI pin, test or CI workflow files change in this checkpoint.

**Next gate requiring separate scope/approval:** accept and pin the current API Alarm OpenAPI contract to HidraWEB, generate/verify the consumer, then qualify the same-grant three-principal actual browser workflow on an approved disposable API+PostgreSQL setup before considering F16 ADMIT and any following feature. Register any required WEB source/test scope before implementation. Keep existing earlier HWEB-F15/A1 acceptance unchanged; HAPI-930 remains only partially product-accepted until the supported target/physical owner is properly established.

## HWEB-F16 — single-task execution scope and owner correction (2026-11-09)

**Authoritative owner correction:** HWEB-F16 is **one and only one task**, never a parent for additional suffixed tasks or packages. The preceding [registration commit `cdfd4a54`](https://github.com/CHOUABBIA-AMINE/HidraWEB/commit/cdfd4a541f912c8801e925c2c8b2e809d3b03c1c) introduced an unauthorized child identifier. That designation is withdrawn from the current roadmap, not reassigned or accepted as a distinct stage. Git history retains the prior commit for audit; this correction supersedes its task-splitting wording. Do not create any divided Hidra tasks in future. Historical foundation labels remain historical records, not permission to subdivide new tasks.

**Status:** **HWEB-F16 HOLD / NOT ADMITTED.** The 2026-11-08 preflight and 2026-11-09 API requalification remain valid pinned evidence. The contract pin, new WEB native-browser qualification, actual GZ2 authority and full workflow acceptance have not been implemented or accepted by this documentation correction.

**Exact inspected baseline:** HidraWEB source `cdfd4a541f912c8801e925c2c8b2e809d3b03c1c` with [Documentation CI #66 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42593391936) and last [Code CI #1034 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42463226504) on its earlier code SHA. HidraAPI source `02c2d130b902547c113b8fbea83b9affcfd4e892`, [Full CI #1154 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349), [Docs #946 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838208), including the native GZ2 three-LOCAL-operator PostgreSQL shard-3 qualification (1 test, 0 failures, 0 errors, 0 skips). The tested synthetic FACILITY ownership does not certify the real GZ2 pipeline/system authority.

**Verified API contract for the same HWEB-F16 task:** Full runtime [OpenAPI artifact #13660882599](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42589838349/artifacts/13660882599), ZIP SHA256 `fe2128020b40a9d3ac31a64912735c34534e249f1164a068d8ff0b3cf1fa3d2d`; `hidra-api.json` SHA256 `23cb45be5456bb84f28beec63e0c8b6a03e6b80b157ec55645eb81da829881ff`, 851,347 bytes, 347 paths. The 13 Alarm paths and 11 Alarm-related schemas include bearer-secured `GET /api/v1/alarm/alarms` (`PageAlarmView`), `GET /api/v1/alarm/alarms/{id}` (`AlarmView`) and `POST /api/v1/alarm/alarms/acknowledgements` (`AcknowledgeAlarmRequest` -> acknowledgement ID). Existing WEB Orval input `openapi/candidates/hidra-alarm-76b14cda4520f1eff242bd474c02ce4db317d385.json` remains the older pinned slice. The shared full-compatibility baseline is independently pinned and must not silently change.

**One indivisible HWEB-F16 deliverable:** an authenticated operator uses the existing Alarm Console to select a permitted existing GZ2-reference alarm, see the authorized asset context and list/count/detail, acknowledge it, and confirm the persisted record, server-derived actor and timestamp after a fresh reload; two other genuinely authenticated LOCAL operators with equal route grants but different current company/exact FACILITY grants must not read counts, existence, detail, or mutate that alarm. Source-backed, current-authority checks are enforced on HidraAPI, not reconstructed from client-selected filters. Verify the real intended owner/resource type separately; GZ2 is a reference, not the only supported network. Preserve permitted multiple immutable acknowledgements; any strict idempotency change needs an owner policy decision. No production/SITE, live SCADA/OT, numerical solver/P3, or release claim is authorized.

**Activities and intended source locations inside HWEB-F16, not separate tasks:**
1. Verify the exact source artifact and deterministically pin only the Alarm paths, transitive schemas and bearer scheme into `openapi/candidates/hidra-alarm-02c2d130b902547c113b8fbea83b9affcfd4e892.json`; update `orval.alarm.config.ts`, `scripts/verify-alarm-candidate.test.mjs` and only `ALARM_CURRENT_PROOF` in `scripts/check-openapi-compatibility.mjs`. Preserve the other 20 feature pins and `openapi/compatibility/hidra-api-baseline.json`. Generated client files remain uncommitted by existing convention.
2. Reconcile generated Alarm types with the current `src/features/alarm/api/alarmApi.ts` and `src/features/alarm/AlarmConsolePage.tsx`. If backend and old client are incompatible, record the exact mismatch and retain HOLD; never remove a safety/error/authorization assertion to force success.
3. Within the **same HWEB-F16 acceptance**, qualify real signed-in browser and HTTP read/ack/reload behavior, current resource scope, denied list/count/detail/ack and unchanged durable history with in-scope, same-company out-of-scope and cross-company out-of-scope synthetic operators. Existing `tests/e2e/alarm.spec.ts` and `src/features/alarm/AlarmConsolePage.test.tsx` are mocked evidence only; actual native browser coverage and disposable PostgreSQL/API fixture wiring must be explicitly authorized as source scope before implementation, not registered as another task.
4. Verify strict OpenAPI digest/provenance, `npm run openapi:compatibility`, `npm run api:generate:alarm`, `node --test scripts/verify-alarm-candidate.test.mjs`, full applicable Node 24/npm verification and actual native browser tests; inspect exact-SHA CI and failures. Preserve accepted HWEB-008 and HWEB-F15/A1 history, records and API/WEB boundaries.
5. Record one HWEB-F16 final **ADMIT or HOLD** disposition with the current exact WEB/API SHA pair, artifact digest, positive/negative evidence, owner/context and explicit remaining limitations.

**Execution control:** The original registered HWEB-F16 documentation-preflight message `docs(alarm): record GZ2 acknowledgement preflight` is historical. No standalone source implementation is approved or claimed by the mistaken registration. Before source publication, select and authorize the **whole HWEB-F16** scope and exact message/file allowlist; any security-safe failure repair stays under HWEB-F16. Publish directly to existing `main` with expected-head guard, verify the exact tree and relevant Code/Docs CI queue/start, then STOP without advancing another task. If any dependency remains unavailable, retain HOLD; **never split HWEB-F16** to bypass its acceptance gate.

**This correction only:** `docs(roadmap): keep HWEB-F16 indivisible`, two governance documents, no API/WEB source, tests, runtime OpenAPI or release files modified. Its documentation CI cannot be counted as HWEB-F16 implementation acceptance.
