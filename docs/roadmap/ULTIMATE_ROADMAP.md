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

## HWEB-F17 — HyFlo Login branding registration (2026-11-09)

**Status:** REGISTERED / NOT SELECTED FOR IMPLEMENTATION. The owner confirmed this as one standalone HidraWEB task. Registration is documentation only. Source execution requires successful exact-SHA Documentation Validation for this registration and a subsequent owner `Next` selecting this task.

**Product and technical names.** HyFlo is the official user-facing product name. Hidra, HidraWEB and HidraAPI remain the technical names. This task applies HyFlo branding to the existing `/login` and browser metadata. It uses the SONATRACH color direction and the owner-supplied `images.zip`. The agreed scope is independent of the HWEB-F16 Alarm workflow, whose recorded HOLD remains unchanged.

**One deliverable.** Use the supplied HyFlo logo in the existing Login layout, apply the SONATRACH color treatment, align user-facing Login copy in English, French and Arabic, and show the HyFlo name and favicon in browser metadata. Preserve the actual HidraAPI sign-in path, enabled provider choices, credential submission and error handling, authenticated redirect, session and permissions behavior. Refresh-token work is deferred until the owner confirms completion of the HidraAPI implementation and separately selects the WEB integration. This task also excludes the synthetic preview, operator landing, application shell and repository/API renaming.

**Implementation commit message:** `feat(auth): apply HyFlo branding to login`.

| Change | Exact implementation path | Purpose |
|---|---|---|
| MODIFY | `src/app/pages/LoginPage.tsx` | Existing Login visual branding and responsive presentation. |
| MODIFY | `src/shared/i18n/resources.ts` | User-facing Login copy in existing locales. Preserve technical provider identifiers. |
| MODIFY | `index.html` | HyFlo browser title, description and favicon reference. |
| ADD | `public/brand/hyflo-full.png` | Byte-preserved `images/HyFlo_Full.png` from the supplied archive. |
| ADD | `public/favicon.ico` | Byte-preserved `images/favicon.ico` from the supplied archive. |
| MODIFY | `src/app/pages/LoginPage.test.tsx` | Branding assertions and regression coverage in the existing Login test suite. |

**Acceptance.** Verify the supplied assets, title and favicon in the built application. Review desktop and narrow layouts, keyboard focus, contrast, English/French copy and Arabic right-to-left presentation. Run the existing Login suite, frontend lint, typecheck and build. With an approved development HidraAPI and synthetic user, verify successful sign-in through the existing browser flow, protected landing with an authorized session, and usable feedback for invalid credentials. Exercise enabled provider dispatch through the existing test coverage and record which providers were runtime-tested. The owner reviews the branded page. Mocked provider tests do not establish live identity-provider behavior.

**Registration evidence and publication.** Base is HidraWEB `befb1d71235b050a58da809c1b3f7c67e917303a` with [Documentation Validation #68](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42596930048) successful. The sole tracked registration change is an append to this roadmap. Use `docs(roadmap): register HyFlo Login branding`, verify the exact parent, tree and blob, publish to existing `main` with an expected-head guard, and stop after observing exact-SHA Documentation Validation creation or start. This checkpoint does not authorize release or deployment.

## HWEB-F17 — owner visual and software acceptance (2026-11-10)

**Status:** ACCEPTED for the HyFlo Login branding scope. The owner approved the final visual revision on 2026-11-10. HidraWEB `6ca44b13a410023f1bd58f1f9d5aeca02c795f41` (parent `766397bc8a2fdbc90c75b105d29591bf7cdd2ccf`, tree `cff08e397a805edaea7ad05fbf6d75d2d7a9ebc0`) passed [Code CI #1038](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42773516151), including standard verification and native foundation qualification. The earlier branding registration and repair commits remain historical.

The accepted Login uses the supplied transparent HyFlo wordmark, the HyFlo title and favicon, centered localized secure-access copy, neutral LOCAL labels and text-only sign-in actions. The exact final revision passed 10 focused Login and app-shell tests, lint on the touched files, production build and Chromium layout checks in English, French and Arabic at desktop and narrow widths. The preceding visual revision proved invalid LOCAL credential feedback and valid LOCAL sign-in through effective permissions to protected Overview against a disposable migrated PostgreSQL and HidraAPI `5817406923e53761577ac41bbc3f318b517c3977`. The final delta changed presentation and its test assertion. LDAP, Active Directory and OIDC have automated regression evidence. Live external-provider, production and SITE acceptance are separate.

## HWEB-F18 — LOCAL session renewal and logout registration (2026-11-10)

**Status:** REGISTERED / NOT SELECTED FOR IMPLEMENTATION. The owner approved F17 and the registration of this single HidraWEB task with the memory-only credential policy on 2026-11-10. The next owner `Next` may select source implementation after successful exact-SHA Documentation Validation of this registration. The earlier product queue is historical planning evidence. [Production-first delivery queue](HidraWEB-Production-First-Roadmap.md#14-prepared-delivery-queue-from-hweb-f17-2026-11-09)

**One deliverable.** Add LOCAL session rotation and family logout to the existing HidraWEB sign-in and authenticated transport. HidraAPI owns validity, expiry, rotation, revocation, current principal and effective permissions. HidraWEB owns the active in-memory session, request coordination, protected cache lifecycle and user feedback. Refresh eligibility requires a native LOCAL login result with the accepted refresh proof and valid deadline. The selected deployment and test scope is a disposable single-node API and PostgreSQL database. Existing sign-in, external-provider handling, default routes and accepted Login visuals remain in their established scope.

**Contract admission.** [HAPI-929 software acceptance](https://github.com/CHOUABBIA-AMINE/HidraAPI/commit/846235481399cc922d71f9a80f6f4b7a260d2bc9) pins HidraAPI `720e9222b30fa45b7423ede9c9f141ab87298024` with [Full CI #1161](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42632933656) and [Docs #955](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42632933970) passed. The [published runtime OpenAPI artifact](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/42632933656/artifacts/13682641034) was downloaded and verified. ZIP SHA-256 `31385f1215f92b27bdb622f65066f89c122e0f5b075331dc8235fb4395f098a3`. Extracted `hidra-api.json` SHA-256 `0c40a12b8bb59fb1eb9a90753ccc09c219866146e41ef7614592a39dbf6bbe3f`. Use the canonical identity and organization path prefixes with transitive schema references and both referenced JWT schemes, retaining `info`, `openapi` and the CI source SHA. Serialize sorted keys, UTF-8, two-space indentation and a trailing LF. The checked candidate is 109,480 bytes, with 59 paths, 62 schemas and SHA-256 `95a9f9d224838d395a8348bf9a56c2374d5a29cb9e4e6dbb428ccc8d40e6c03b`. Compared with the current Identity/Organization slice, all 57 existing path objects and both schemes are equal. The two additions are `POST /api/v1/identity/authentication/refresh` and `POST /api/v1/identity/authentication/logout`. The response schema adds optional `refreshToken` and `refreshExpiresAt` to `AuthenticationLoginResponse`. The new `RefreshTokenRequest` carries the required bounded proof in JSON. Refresh returns 200 with the replacement session. Logout returns non-disclosing 204. The controller and runbook establish refresh rejection 401 and throttle 429. [Authentication runbook](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/720e9222b30fa45b7423ede9c9f141ab87298024/docs/AUTHENTICATION_DEPLOYMENT_RUNBOOK.md)

**Browser credential and request policy.** Hold access and refresh credentials in volatile memory scoped to the active tab. Clear them on sign-out or invalidation. Reload or a new tab requires sign-in. Keep credential material out of browser storage, cookies, URLs, diagnostics, logs and test artifacts. Keep auth exchange separate from shared bearer injection. Coalesce eligible refresh attempts into one in-flight request per active session. Replace credentials together after a valid result and load current principal and effective permissions before releasing protected reads. Allow at most one replay of an eligible safe read after successful renewal. Preserve authorization denials and prevent automatic mutation replay. Fence late responses from the old session so they cannot restore access after sign-out, supersede a newer session or repopulate a cleared cache. A timed-out or otherwise ambiguous refresh must not resubmit the same proof automatically. A throttle rejection must avoid rapid retries and retain the server's non-disclosing semantics. Clear access immediately on sign-out, attempt API revocation with the held proof, and distinguish a 204 acknowledgement from unconfirmed remote revocation. Validate the refresh/logout race against actual API behavior. External OIDC, LDAP and Active Directory continue their existing session handling.

**Implementation commit message:** `feat(auth): integrate rotating LOCAL sessions`.

| Change | Exact implementation path | Purpose |
|---|---|---|
| ADD | `openapi/candidates/hidra-identity-organization-720e9222b30fa45b7423ede9c9f141ab87298024.json` | Pin the checked Identity/Organization contract. |
| MODIFY | `orval.identity-organization.config.ts` | Use the exact candidate and preserve generated consumer conventions. |
| MODIFY | `scripts/check-openapi-compatibility.mjs` | Update only the Identity/Organization source lock and keep compatibility checks fail-closed. |
| MODIFY | `scripts/verify-identity-organization-candidate.test.mjs` | Verify source SHA, digest and delta while preserving historical locks. |
| MODIFY | `src/app/auth/authenticationGateway.ts` | Consume refresh/logout types and use the dedicated auth exchange. |
| MODIFY | `src/app/auth/AuthProvider.tsx` | Coordinate native renewal, credential lifecycle, session fencing and cache invalidation. |
| MODIFY | `src/app/auth/authContext.ts` | Expose only session state and operations required by existing consumers. |
| MODIFY | `src/app/auth/authorizationHeaderRegistry.ts` | Coordinate the current bearer with the active session and eligible request renewal. |
| MODIFY | `src/api/client/hidraAxios.ts` | Handle eligible protected read renewal and preserve authorization and diagnostic behavior. |
| MODIFY | `src/app/auth/authenticationGateway.test.ts` | Verify the auth exchange, provider dispatch and safe error handling. |
| ADD | `src/app/auth/AuthProvider.test.tsx` | Verify lifecycle, concurrent refresh, late responses and sign-out. |
| MODIFY | `src/api/client/hidraAxios.test.ts` | Verify eligible single-read replay, denials and protection against replay of writes. |
| ADD | `playwright.local-session.config.ts` | Run the separate native LOCAL browser lane with credential-bearing captures disabled. |
| ADD | `tests/e2e/local-session-live.spec.ts` | Prove the accepted workflow against the real API and fresh PostgreSQL using synthetic identities. |
| ADD | `scripts/local-session-native-fixture.sql` | Seed only the synthetic fixture needed by the isolated lane. |
| MODIFY | `.github/workflows/ci.yml` | Add the isolated native LOCAL lane with the HAPI-929 source pin and keep existing foundation checks. |

**Acceptance.** Verify artifact and slice hashes, run OpenAPI compatibility, generation, lint, typecheck, focused tests and build, and preserve the existing Code CI lanes. With a freshly migrated disposable PostgreSQL and the accepted HidraAPI source, prove actual browser LOCAL login and current effective permissions, parallel eligible reads sharing one renewal, old bearer rejection and protected reads with the replacement, expiry/resume, failed or ambiguous refresh, denied access, throttle handling, native logout and a late refresh racing with logout. Preserve existing provider regressions, demonstrate no replay of mutations, and verify that reload/new-tab requires sign-in. Record exact SHAs, contract digest and redacted evidence. Any implementation beyond the allowlist needs a recorded scope decision. Implementation and native acceptance are subsequent decisions within F18.

**Registration publication.** Append this F17 acceptance and F18 registration to the canonical roadmap in one documentation commit, `docs(roadmap): accept F17 and register LOCAL renewal`. Publish directly to existing `main` with an expected-head guard against `6ca44b13a410023f1bd58f1f9d5aeca02c795f41`, verify the parent, tree and sole changed blob, and stop after observing exact-SHA Documentation Validation creation or start. The registration records contract and policy decisions. Implementation, release and deployment follow their separate gates.

## HWEB-F18 — LOCAL session renewal and logout accepted (2026-11-10)

**Status:** ACCEPTED for the registered LOCAL browser software scope. Owner `Next` selects this acceptance checkpoint. HidraWEB `6e0e79349a3bb04ff07230368a2fe9b69ad0a9d0` (parent `ab464f821938cce2a4165e0187f79dc45436e7dc`, tree `5cf8e96cc83723c53bc8ad5168f99f2e9547797b`) passed [Code CI #1039](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42777684482) and [Documentation Validation #72](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42777684382). Code CI passed the standard verification, preserved A1 native qualification and the isolated F18 native job.

**Contract and runtime evidence.** The exact [F18 native job](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42777684482/job/129699935061) recorded the WEB SHA above, HidraAPI `720e9222b30fa45b7423ede9c9f141ab87298024` and Identity/Organization slice SHA-256 `95a9f9d224838d395a8348bf9a56c2374d5a29cb9e4e6dbb428ccc8d40e6c03b`. The checked slice matches the registered runtime artifact and source-lock test. The hosted Chromium lane ran against the pinned single-node API and a freshly migrated disposable PostgreSQL 16 database with synthetic accounts. It passed **5 tests with zero failed, flaky or skipped**.

**Accepted behavior.** The LOCAL tab keeps credentials in memory and requires sign-in after reload or from a new tab. Eligible parallel reads share one rotation. HidraWEB verifies current identity and effective permissions before releasing reads. The native checks prove old-bearer rejection, replacement-bearer access, recovery after expiry, throttle handling, fail-closed handling of an ambiguous refresh, read and mutation denial without replay, family logout and rejection of a replacement bearer when its refresh response arrives after sign-out. Focused client tests cover at most one eligible read replay, no automatic mutation replay and unconfirmed remote logout. Provider regressions passed within Code CI. Live external-provider, multi-node, production and SITE qualification remain separate.

**Publication and handoff.** Append this acceptance record to the canonical roadmap with `docs(auth): accept F18 LOCAL session qualification`. The next candidate is HWEB-F19, the isolated network workspace client preview. F19 requires separate canonical registration and selection under its preview isolation, fixture and role gates.

## HWEB-F19 — isolated network workspace preview registration (2026-11-10)

**Status:** REGISTERED. The owner’s `Next` selects this documentation stage. Implementation requires exact-SHA Documentation Validation to pass on the registration and a subsequent owner `Next` selecting the preview scope below.

**Basis.** F17 branding is accepted. F18 software acceptance is recorded at HidraWEB `db6e20098cd5427d867ac6c6a1a683a4778e1373` (parent `6e0e79349a3bb04ff07230368a2fe9b69ad0a9d0`, tree `979b9b4ffbc2b88db0429c615b9f3fd05e0ef909`), with [Documentation Validation #73](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42783588099) passed. F19 is the independent synthetic client-preview lane in the [adopted product target and prepared delivery queue](HidraWEB-Production-First-Roadmap.md#14-prepared-delivery-queue-from-hweb-f17-2026-11-09). Use the existing [Network & Topology interaction](../../src/features/topology/NetworkTopologyPage.tsx) and [information architecture](../architecture/HidraWeb-Information-Architecture.md) as design references.

**One deliverable.** Open a standalone HyFlo client preview directly at a read-only network workspace. Show a map with layer visibility controls and an accessible asset tree. A single preview state owns the company and organization scope, pipeline system, canonical fixture asset ID and UTC time window. Map, tree and alarm links converge on that state. The technical revision, telemetry and Alarm panels consume the same scope and time window and display fixture provenance, explicit units where relevant, and observed-at timestamps. Use a visibly labeled local schematic with fictional geometry. Represent GZ2 as the gas reference in a synthetic scenario and include a second fictional gas system. Supply a versioned fixture and an explicit reset to its deterministic starting state.

**Fixture roles and disclosure.** Include a scoped demo operator, a scoped read-only observer, a same-company actor outside the selected asset grant and an actor in a different fictional company. Both in-scope roles can read permitted evidence. Demo role changes model view filtering only. Scope or role changes clear incompatible selections and evidence before the new view renders. Use the same non-disclosing state for absent and inaccessible targets when the actor lacks authority. Authorized actors can distinguish empty, stale and unavailable evidence. Fixture IDs and permissions have no runtime meaning in HidraAPI, and the bundled fixture data is public to anyone with the preview files.

**Isolation.** Keep a standalone Vite root and output under `preview/network/`. Reuse the repository's installed Node 24, React, TypeScript, Vite and Playwright tooling. Keep all preview state in memory. The preview uses no credentials, auth session, product routes, API clients, HidraAPI requests, remote map tiles or third-party network services. Default product entry, product release packaging, native qualification and Alarm/Workflow behavior remain under their existing gates. F16 stays HOLD for native Alarm acknowledgement. F19 covers read-only navigation and context, with client review separate from implementation CI.

**Implementation commit message** — `feat(preview): demonstrate the network workspace`.

| Change | Exact implementation path | Purpose |
|---|---|---|
| ADD | `preview/network/index.html` | Standalone preview entry. |
| ADD | `preview/network/vite.config.ts` | Isolated Vite root, local preview server and preview output. |
| ADD | `preview/network/tsconfig.json` | Strict preview typecheck. |
| ADD | `preview/network/main.tsx` | Workspace, schematic, accessible tree and shared context. |
| ADD | `preview/network/fixtures.ts` | Versioned synthetic evidence and fixture role projections. |
| ADD | `preview/network/styles.css` | Preview layout, responsive behavior and visible keyboard focus. |
| ADD | `preview/network/playwright.config.ts` | Chromium checks against the built preview. |
| ADD | `preview/network/network.spec.ts` | Browser context, disclosure, accessibility and isolation checks. |
| ADD | `preview/network/README.md` | Local build commands, fixture and role walkthrough, and client-review evidence template. |
| ADD | `.github/workflows/preview-network.yml` | Separate exact-SHA build and browser verification triggered by preview changes. |

**Acceptance.** Check preview lint and typecheck, build it separately and verify the default product build and release manifest exclude its entry, fixtures and assets. In Chromium, select the same station and time via the map, tree and linked alarm, change the time and system, confirm incompatible evidence clears, and reset the fixture. Exercise authorized empty, stale and unavailable states, both in-scope roles, same-company and cross-company disclosure denial, keyboard-only navigation and a narrow viewport. Verify the built preview makes no product API or off-origin requests and writes no credentials or durable browser state. Record exact WEB SHA, fixture version, build identity and test results. Client walkthrough acceptance records the reviewed build and feedback before any F20 selection.

**Registration publication.** Append only this canonical roadmap with `docs(roadmap): register F19 network workspace preview`. Publish directly to existing `main` with the expected-head guard against `db6e20098cd5427d867ac6c6a1a683a4778e1373`. Verify the exact commit, parent, tree and changed blob, then stop after observing exact-SHA Documentation Validation creation or start.

## HWEB-F19 — owner correction to integrate the network preview (2026-11-10)

The owner requested the preview inside HidraWEB. This supersedes F19's standalone entry, build and distribution scope. The historical implementation `d9fd9653597308a3aeff627321f39e5c7e9b40bc` passed [Network Preview CI #1](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42787499044), [Code CI #1040](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42787499083) and [Documentation Validation #75](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42787499517). Those checks apply to the historical standalone implementation.

The authorized correction uses the existing signed-in Network route with `?view=preview` and effective `topology:map:read`. The default Network view continues to consume HidraAPI. The synthetic view loads on demand, retains its read-only fixtures and simulated role filters, and uses no operational data. The user returns to the map through the same application shell. The regular build includes the preview and the standard Network browser suite verifies it.

Scope comprises the Network page and its view-switch translations, the relocated preview components, fixtures and styles, the Network browser suite, this append and the relocated [client walkthrough](HWEB-F19-Network-Preview.md). Retire the files under `preview/network/` and the standalone preview workflow. Verify login and direct-link permission denial, navigation back to operational topology, fixture behavior, keyboard access, the product build and the normal release manifest. Publish this correction as `feat(network): integrate the synthetic workspace preview`. Client walkthrough acceptance remains the gate before F20.

## HWEB-F19 — owner correction for language and geographic map (2026-11-10)

The owner requested translations and a real map in the integrated preview. Keep
the signed-in Network entry and synthetic fixture boundary. The preview follows
the existing French, English and Arabic language setting, including Arabic
right-to-left layout, localized evidence and map controls. Replace the fictional
schematic background with the existing MapLibre adapter and a locally served
Natural Earth regional basemap. Pipelines, stations, coordinates and evidence
remain synthetic.

Scope comprises the preview, shared map options and adapter, Network browser
suite, [client walkthrough](HWEB-F19-Network-Preview.md) and this append.
Verify geographic data loading, marker/tree/alarm selection, language switching,
permissions and the product build. Publish as
`fix(network): localize preview and add geographic basemap`. Client walkthrough
acceptance remains the gate before F20.

## HWEB-F19 — owner acceptance of the integrated preview (2026-11-10)

The owner accepted F19 at `861c3d3940efbdad3a0a346d30b284774b31a3e2` (parent `783e719f3a4952b317a9105a867438b11a7fff76`, tree `63b04d1d8b8f9cb42c40a74240fd5aad540b60d8`). [Code CI #1042](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42798367837) and [Documentation Validation #77](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42798365490) passed on that SHA. Acceptance covers the signed-in Network preview, French, English and Arabic, and the local geographic basemap with synthetic infrastructure and evidence. At the owner's direction, additional operational parameters wait for completed and accepted HidraAPI contracts.

## HWEB-F20 — station investigation and follow-up preview registration (2026-11-10)

**Status.** Registered for the synthetic preview scope. The owner's acceptance and request to proceed select this documentation stage. Implementation requires successful exact-SHA Documentation Validation on the registration and a subsequent owner selection.

**One deliverable.** Extend the existing signed-in `/network?view=preview` workflow. From the selected station and linked alarm, open a fixture investigation carrying the same company and organization scope, system, station ID, UTC window and evidence revision. Reuse the existing technical revision, pressure observations and alarm fixture. Keep synthetic provenance, units, quality and timestamps visible. Include an in-memory timeline that distinguishes simulated acknowledgement, a separate simulated follow-up, and fixture-driven condition resolution. An acknowledgement or follow-up does not resolve the condition. Reopen the timeline with its original evidence reference, actor and simulated time.

**Ownership and authorization.** The preview owns the demo timeline and no operational record. The Alarm domain owns native alarm lifecycle. Technical revision and observation owners supply accepted evidence for native use. The eventual native follow-up contract and accountable owner must be confirmed before integration. Reuse F19's route and topology read permission for entry and fixture scopes for disclosure. The scoped demo operator can act only on an eligible reviewed fixture. A read-only observer can review authorized evidence and history. Same-company out-of-scope and cross-company demo roles cannot infer the investigation or its history. A stale review, missing or degraded evidence, or an unauthorized action leaves history unchanged. F20 uses no additional operational parameters and calls no product Alarm, Workflow or telemetry transport. F16 remains HOLD, and F22 retains its separate native contract and qualification gates.

**Implementation commit** — `feat(preview): demonstrate station investigation`.

| Change | Exact implementation path | Purpose |
|---|---|---|
| MODIFY | `src/features/topology/preview/NetworkPreviewPage.tsx` | Open the investigation within the selected fixture context. |
| ADD | `src/features/topology/preview/StationInvestigationPanel.tsx` | Render the evidence, review actions and reopenable demo timeline. |
| ADD | `src/features/topology/preview/stationInvestigation.ts` | Enforce deterministic fixture transitions, evidence binding and readback. |
| ADD | `src/features/topology/preview/stationInvestigation.test.ts` | Verify transitions, original evidence, stale or denied actions and reset. |
| MODIFY | `src/features/topology/preview/previewCopy.ts` | Translate the investigation in French, English and Arabic. |
| MODIFY | `src/features/topology/preview/styles.css` | Keep investigation and timeline accessible within the preview. |
| MODIFY | `tests/e2e/network.spec.ts` | Verify the investigation, role boundaries and isolation through HidraWEB. |
| MODIFY | `docs/roadmap/HWEB-F19-Network-Preview.md` | Extend the integrated client walkthrough to F20. |

**Acceptance.** In Chromium, start from the map and from the linked alarm and verify the same station, time and evidence. Acknowledge and add a separate follow-up, then reopen the timeline and check the original evidence, actor and time. Exercise fixture resolution, stale review, degraded evidence, the observer and both out-of-scope roles. Verify that rejected actions leave the timeline unchanged, reset restores the fixture, language and narrow keyboard paths work, and demo interactions make no business API calls. Run focused tests, lint, typecheck, production build and Code CI. Record exact SHA and fixture version. Client walkthrough acceptance precedes any F21 selection.

**Registration publication.** Append only this canonical roadmap with `docs(roadmap): accept F19 and register F20 station investigation`. Use guarded direct-main publication with expected head `861c3d3940efbdad3a0a346d30b284774b31a3e2`, verify exact parent, tree and blob, and stop after observing exact-SHA Documentation Validation creation or start.

## HWEB-F20 — owner acceptance of station investigation (2026-11-10)

The owner accepted the integrated F20 preview at `c7746c64deac3bc53eb2a467bb3a079271819de3` (parent `69c5111e70a4542411600fb5d7b3234dc1810ce1`, tree `2d7a46fc50edffb2ae54349a4947e79c28ecb825`). [Code CI #1043](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42801499456) and [Documentation Validation #79](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42801499535) passed on that SHA. Acceptance covers the integrated investigation, its versioned synthetic evidence and simulated acknowledgement, follow-up and resolution. Additional operational parameters still require completed and accepted HidraAPI contracts.

## HWEB-F21 — digital-twin decision preview registration (2026-11-10)

**Status.** Registered for the synthetic preview scope. The owner's acceptance covers the F20 walkthrough and the proposed F21 use of clearly labeled, precomputed synthetic model outputs reviewed in the handoff. Implementation requires successful exact-SHA Documentation Validation on this registration and a subsequent owner selection.

**One deliverable.** Extend the signed-in `/network?view=preview` workspace with a gas-first decision walkthrough for the GZ2 reference fixture. Start from the existing station investigation and carry its company and organization scope, system, station, UTC window and evidence revision into an engine-neutral, versioned input manifest. Reuse the existing synthetic pressure observation and its units and provenance. Show the manifest, fixture run identity and precomputed baseline and alternative pressure outputs separately from the fixture observation. Label the modeled trade-off and its limitations. Keep the link from original evidence through comparison, proposal, reviewer decision and follow-up.

**Decision and authority.** Use distinct demo operator, engineer and independent reviewer actors within the authorized fixture. Let the engineer propose an alternative from an eligible comparison and let the reviewer record an explicit approve, reject or return decision with a rationale. Retain the actor, simulated UTC time and original source references in the in-memory history. Keep an unavailable follow-up outcome unresolved. Gate the view through the existing topology read permission and fixture disclosure rules. A stale proposal, incompatible or missing input, or unauthorized action leaves decisions and history unchanged. Record approvals solely within the walkthrough. Engine execution, P3 numerical work, live integrations, additional operational parameters and OT actuation remain deferred. Preserve the future Hidra engine direction and the independent F22 native qualification gates.

**Implementation commit** — `feat(preview): demonstrate digital twin decisions`.

| Change | Exact implementation path | Purpose |
|---|---|---|
| MODIFY | `src/features/topology/preview/NetworkPreviewPage.tsx` | Mount the decision walkthrough in the existing authorized station context. |
| ADD | `src/features/topology/preview/DigitalTwinDecisionPanel.tsx` | Render the manifest, observation and modeled comparison, proposal, decision and outcome review. |
| ADD | `src/features/topology/preview/digitalTwinDecision.ts` | Define the versioned synthetic scenario, precomputed outputs, provenance and guarded demo transitions. |
| ADD | `src/features/topology/preview/digitalTwinDecision.test.ts` | Verify provenance, missing inputs, role separation, stale decisions and unresolved outcomes. |
| ADD | `src/features/topology/preview/digitalTwinCopy.ts` | Provide French, English and Arabic walkthrough copy. |
| MODIFY | `src/features/topology/preview/styles.css` | Keep the comparison and decision history accessible in the preview layout. |
| MODIFY | `tests/e2e/network.spec.ts` | Verify the browser walkthrough, role and context guards and transport isolation. |
| MODIFY | `docs/roadmap/HWEB-F19-Network-Preview.md` | Document how to review the integrated F21 walkthrough. |

**Acceptance.** In Chromium, trace the fixture observation and input revision into the precomputed comparison and proposal. Record and reopen the independent human decision with its original evidence, actor, time and rationale. Exercise the missing and incompatible input paths, stale and unauthorized decisions, both out-of-scope fixture roles, and the unresolved outcome state. Check keyboard access, narrow layout, French, English and Arabic RTL, reset behavior and absence of business API calls during the walkthrough. Run focused tests, lint, typecheck, production build and Code CI. Record exact SHA and fixture version. Client walkthrough acceptance follows implementation.

**Registration publication.** Append only this canonical roadmap with `docs(roadmap): accept F20 and register F21 decision preview`. Use guarded direct-main publication with expected head `c7746c64deac3bc53eb2a467bb3a079271819de3`, verify exact parent, tree and blob, and stop after observing exact-SHA Documentation Validation creation or start.

## 2026-11-10 — Owner-directed six-interface local-first industrial digital twin roadmap

**Status: PROSPECTIVE PRODUCT/ARCHITECTURE UPDATE — NOT AN IMPLEMENTATION SELECTION.** The owner requested a comprehensive frontend direction instead of accepting HWEB-F21. This appendix is the single documentation deliverable; it does not close F21, select F22, admit F16, approve a production release, register new implementation IDs, adopt a new task hierarchy, or activate numerical simulation or control. The historical registrations and acceptance evidence above remain append-only and unchanged.

**Evidence boundary at design time.** HidraWEB main 651e2b06f0e97f6f7f7957f483b893893167ca6c (tree c46bb3390179f9f404a25e45cdb2f671a0ba9b89) has Code CI #1044 and Documentation Validation #81 successful. F21 is implemented using the versioned, precomputed, synthetic GZ2 preview; owner walkthrough acceptance is outstanding. HidraAPI main a71de63913a820d7ce3c87b389c59f4215cf1199 had Documentation Validation #972 successful; the most recently observed successful full HidraAPI CI, #1174, belongs to earlier commit 7d4f2a3f0a6e753caa4ad9b008cb17aea769b75c, **not** to the API design-time head. These source and CI references are time-limited and are not accepted OpenAPI/feature pins. The current HWEB-F16 gap register ends in HOLD: the whole-task Alarm WEB Orval/native-browser/owner-reference proof is incomplete. HWEB-F22 still requires F16 ADMIT and separately accepted HidraAPI contracts; it is not selected here.

### A. Product operating model and shared six-view context

**Goal.** Deliver six complementary, low-resource, local-asset-first workspaces for an operator/engineer inspecting the same physical GZ2 gas system, with later qualified support for other gas systems, liquids and hydrogen. A unified experience connects geographic position, surveyed elevation, logical connectivity, observed signals, asset integrity and station-level configuration. The user should move between views without silently losing system, station, asset, approved engineering revision, UTC interval or evidence provenance.

**Local-first is a delivery/runtime property, not local business ownership.** Bundle the app shell, icons, fonts, schematics and authorized public/background map tiles or vector layers locally; avoid CDN and external map dependency. The browser owns ephemeral selections, layout, viewport, comparison cursors and bounded, scoped caching of already-authorized queries. HidraAPI remains the source of truth for topology, geometry, units, manufacturer records, revisions, telemetry, alarms, integrity, permissions, decisions and audit. No browser-side mirror of protected operational data, durable offline command queue, unapproved persistent IndexedDB cache, homemade physics or synthetic production data. A disconnected client may display clearly labeled non-sensitive local reference assets and a connection-state banner, but must not assert fresh industrial status or execute actions offline.

**Common selection model (conceptual presentation contract, not a new API DTO):** authenticated company and responsibility scope; pipeline-system and pipeline IDs; optional segment, facility/station, installed-equipment and telemetry-point IDs; effective topology/engineering revision or baseline; UTC start/end and source-time cursor; units/reference conditions; current authorized capability set; quality, freshness and provenance. IDs are backend-issued opaque identities. URL deep links and role switches are untrusted: reauthorize and refetch before exposing the target. Incompatible system, company, role, revision or time changes clear selected details and unauthorized caches before new evidence renders. A missing reference, withheld data and a denied scope must not be merged into a misleading empty-but-authorized count.

**Composition and boundaries.** Preserve the current React/TypeScript/Vite modular frontend, MapLibre via HidraMap, MUI, ECharts, TanStack Query, i18next and generated Orval transport. Each domain module owns its screen adapters/view models; the existing frontend process/composition layer coordinates shared navigation and investigation. The six renderers cannot become six new domain owners. Use current accepted OpenAPI artifact + permission mapping + verified owner binding for each new transport slice, not handwritten competing JSON DTOs or assumed direct database access. Independently qualify every cross-owner join and its disclosure rights.

**Information distinctions:** surveyed route vs simplified map geometry; observed pressure/flow vs modeled pressure/flow vs estimated analytics; raw vs quality-qualified readings; engineering revision vs live operating state; detected anomaly vs confirmed diagnosis; proposal vs approved decision vs requested action vs independently observed outcome. Every panel must display an as-of time, source/revision, units where meaningful, quality/uncertainty and missing/stale/unauthorized state.

### B. Six coordinated interface specifications

#### Interface 1 — Geographic / spatial view (macro topography)

**Concept and user decisions.** A scalable real-world geographic map showing the exact *authoritatively surveyed* route when available, station positions, connected pipelines and location-linked observations. Operators see which corridor, asset and permitted geographic risk context an event affects; engineers can inspect alignment provenance and open an asset's other five views. A public/regional background map is not survey evidence.

**Backend data flow.** Topology owns systems, segments, station/equipment identity and authoritative geometry/revision. Request a bounded, scope-filtered geospatial projection through accepted HidraAPI REST/Orval interfaces: feature IDs, geometry and coordinate reference system, precision, capture method/source, geometry/effective revision, line chainage, segment ordering, localized labels and as-of applicability. Risk/Integrity owns qualified High Consequence Area (HCA), water-crossing, third-party exposure and other risk overlays; layer entitlement, classification, version and provenance are independently required. Alarm/Monitoring/Leak Detection may expose a location only when the source provides a qualified asset binding, coordinate, localization method, uncertainty radius/linear interval and source time. Do not derive an “exact GPS” point from an imprecise asset ID or invent anomaly coordinates. A spatial database or PostGIS installation is a backend implementation choice, **not** evidence of a public spatial API. If its typed geometry/layer endpoint is not accepted, mark that layer unavailable rather than fabricating one. Existing Topology Map readers and the locally served Natural Earth preview basemap are reusable but do not prove surveyed corridor authoring.

**Rendering.** Reuse MapLibre/HidraMap and local basemap resources; render server-provided GeoJSON/vector tiles or validated typed geometries, filtered by viewport/zoom and authorized scope. Differentiate geometry lineage through line style and tooltip, not arbitrary geographic interpolation. Lazy-load large layers; use clustering/level-of-detail and visible loading coverage, not full-network eagerly mounted markers. Independently toggle risk layers with clear legend, date and source; cache their permitted data per principal/asset/revision/time, invalidate on auth or revision changes. Selection synchronizes the station SVG, profile kilometer post, telemetry and integrity record. Provide a keyboard-searchable asset tree, tabular coordinate/chainage alternative and an accessible no-map state.

**Admission and tests.** Exact accepted geometry/risk/localization API, CRS/chainage/vertical-datum convention, owner-validated location provenance, per-layer grants and same-grant out-of-scope negative tests. Verify actual survey geometry round-trip and precise-vs-uncertain anomaly display on disposable fixtures; no unsupported HCA overlays.

#### Interface 2 — Hydraulic and elevation profile (distance vs elevation and engineering observations)

**Concept and user decisions.** A synchronized 2D cross-section: X is cumulative kilometer post/chainage; primary Y is terrain/pipe centerline elevation in meters, with stations, valve points, slopes and crossings. Distinct, explicitly scaled observed pressure and flow traces help engineers inspect where a permitted measurement exists and where evidence is absent. Comparison of measured vs *qualified modeled* gradients is a future capability, not a current hydraulic solver.

**Backend data flow.** Topology/survey owner supplies ordered chainage, elevation points, geometry CRS and vertical datum, unit, station/segment anchors, survey resolution and exact immutable revision. Telemetry supplies scoped tagged pressure/flow readings, qualified trust/quality, engineering units, source timestamps, sampling bases and asset binding. For gas-first GZ2, never silently treat liquid hydraulic-head formulas as gas pressure physics; make pressure, pressure squared, mass flow and elevation separate explicitly labeled physical quantities where supported. Future simulation port must provide versioned input manifest, scenario/engine and model capability, measurement basis, spatial/temporal resolution, pressure/flow outputs, result qualification and uncertainty. Neither the browser nor an unaccepted solver may compute authoritative slack-line, line-pack, mass balance, hydraulic loss, transient waves or pressure-drop alarms.

**Rendering.** ECharts or bounded Canvas/SVG for cross-section, with one correctly labeled elevation axis and separate coordinated pressure/flow axes or aligned strips to avoid plotting incompatible units on one scale. Pan/zoom by kilometer posts; show fixed station boundaries, pressure/flow point markers, gaps and timestamps, and hover-linked geographic station positions. Use overview/downsampled traces for large routes and detail fetched for the selected interval. Observed series are continuous only where sampling/source evidence justifies it; do not interpolate a safe pressure corridor through missing sensors. Add separate scenario layers and baseline/alternative legend only after qualified engine results exist. If only synthetic F21 comparisons exist, confine them to the clearly labeled preview, never the operational chart.

**Admission and tests.** Accepted route/profile/units/vertical datum and telemetry-binding APIs; dimensional consistency, altitude/chainage ordering, mismatched revision, stale observations, gas/liquid applicability, time-zone change, missing sensor and authorized negative cases. Slack-line/pressure-gradient *physics* and transient mode are held behind engine capability and engineering-validation gates.

#### Interface 3 — Logical schematic / P&ID (high-performance control-room HMI)

**Concept and user decisions.** A semantically correct, decluttered 2D logical network flow representation for control-room awareness. It displays connections, branch direction, valves, compression/pump units, bypasses, measurements, active alarms and procedural status. The schematic is a view of approved topology and equipment facts; a decorative diagram is not automatically an engineering-certified P&ID.

**Backend data flow.** Topology supplies nodes, typed physical connectivity, equipment/port identities, verified symbols and revision. Telemetry supplies quality-qualified states and measurements; Alarm owns active alarm lifecycle and acknowledgement; Workflow/Identity governs human tasks and approvals. Render authoritative state only with source timestamp, trust/quality, entitlement and associated alarm identity. A connection shown in the graphic must refer to backend connectivity. HMI “live” mode is permitted only for a verified publisher/event family with ordered recovery or safe HTTP refresh; existing realtime transport alone does not imply business events.

**Rendering.** Local SVG for ordinary station/corridor schematics, optionally Canvas for large graphs; high-performance HMI style uses quiet gray/low-saturation equipment at baseline, legible hierarchies and clear line weights. Reserve conspicuous semantic colors for validated abnormal states, priority and alarms; add shape, icon, label and text so color is never the sole meaning. Disable blinking/animations by default, avoid decorative gradients, avoid simulated valve position and clearly distinguish Unknown, Stale, Disconnected, Command Pending and Alarm Active. Support zoom, minimap, keyboard focus order, searchable equipment and linked detail drawer. An equipment click must not itself change equipment state.

**Control request safety boundary.** The user's proposed *bidirectional valve actuation payloads* conflict with currently accepted Hidra/IT-OT policy: no direct PLC/SCADA/RTU/SIS/ESD actuation, no autonomous control and no frontend-issued valve/pump/compressor start/stop commands. This roadmap therefore admits only **human decision and governed request/approval UX** when a separately owner-approved HidraAPI business contract exists; the acknowledged request is never represented as executed field state. Any future control-integration design requires explicit separate owner, safety/IT-OT architecture approval, command catalog, dual authority/interlocks, TTL/idempotency, transaction and audit rules, field-execution boundary, independently observed outcome and full negative safety tests. Until that authorization, show read-only control state and a disabled/unavailable action rather than fabricating a control API.

**Admission and tests.** Published topology connectivity, equipment symbols and effective revisions; trustworthy alarm/equipment state, scope isolation, quality/freshness and accessible abnormal-state display. Test line validity, safety-critical unknown states, role changes, stale/disconnected views, no OT egress and no unauthorized command UI.

#### Interface 4 — Telemetry and analytics dashboard (dense time series)

**Concept and user decisions.** Multi-signal trend board where a permitted operator or engineer can compare recent and historical pressure, flow, temperature and equipment observations to investigate anomalies, cyclic patterns, transient evidence and long-term changes without inventing causal diagnosis or predictions.

**Backend data flow.** Telemetry owns source, point, unit, timestamp, reading state, quality and trusted-reading provenance; optional Topology point-to-asset binding must be owner-qualified. Monitoring/Analytics owns its own definitions, metrics, datasets, projection versions and advisory insights. Request bounded series by canonical point IDs and UTC intervals with server-provided time ordering, pagination or query-window limits, data quality, watermark and resampling/downsampling metadata. For large arrays, propose server-side aggregate tiers and/or cursor/range paging through separately accepted API contracts, with raw samples available only where authorized. Do not claim high-frequency ingestion, a time-series store, realtime domain publishers or predictive inference based on existing REST query routes alone. Keep polling/refresh as the reliable baseline; use SSE/STOMP only after backend publishes and qualifies the actual event families and replay behavior.

**Rendering.** ECharts with progressive/Canvas series or a verified performant chart equivalent, request cancellation, on-demand window fetching and virtualization of sensor catalogs. A source-aware drag-and-drop tray may place selected live/recent curves beside or over archived baselines, but must preserve each curve's original timestamp, sampling rate, unit and quality; comparative shifting must be visually labeled and must not modify source samples. Use synchronized cursor, multiple-axis/normalized comparison modes explicitly labeled, zoom, outlier gaps, threshold bands only from approved owner policy and an accessible tabular export. Use visible stale/absent/trust indicators and never transform a missing reading into zero. Predictions, fatigue interpretations and transient wave classifications are advisory-only until separately validated backend models and operating envelopes exist.

**Admission and tests.** Verified point discovery/binding where available, authorized bounded telemetry query APIs and time-series semantics; tests for millions-of-points *rendering strategies* with synthetic sampled fixtures (not a claim that production throughput is proven), untrusted quality, daylight-saving/UTC alignment, unit mismatch, source gaps, canceled requests, isolated grant changes, permissions for exports and no browser memory growth under bounded navigation.

#### Interface 5 — Asset integrity (structural health and history)

**Concept and user decisions.** Metadata-rich asset dossier combining nominal pipe geometry, steel/material grade, outside diameter, wall thickness/design pressure, girth weld references, corridor chainage, inspection sections, ILI anomaly evidence, corrosion/defect records, integrity assessments and authorized maintenance actions. It should support comparison of engineering and inspection *revisions*, not imply continuously known structural health.

**Backend data flow.** Topology/engineering revision owns pipeline/segment physical identity and design/installation record. Integrity owns defect, program, assessment, severity and engineering judgement; Assets owns maintainable asset, condition and work order; Documents owns evidentiary attachments. Weld catalogs, pipe joint inventory, ILI runs, tool accuracy, inspection dates, wall-thickness measurements and exact anomaly locations require separately accepted typed business APIs and original engineering provenance. A stored JPA entity or imported file is not proof of an approved browser DTO. Historical grade/thickness, design constraints and inspection reference must not be silently overwritten by an equipment/pipe update. Predictive failure or remaining-life values require approved methods, input assumptions and qualified outputs; otherwise label them unavailable.

**Rendering.** Server-paginated, virtualized MUI data grids with filter/search/export gated at source, a compact 2D pipe-strip/chainage timeline (weld ticks, inspected sections and qualified anomalies), evidence viewer and revision comparison. Use high-contrast annotated thickness/defect markers and missing/uncertain classification. Link selected kilometers and inspection findings to the geographic and elevation views and to scoped station/maintenance context. Keep document/history access independently authorized; historical snapshots retain their original effective dates and measurement units.

**Admission and tests.** Accepted exact owner API schemas and authorized inspection/defect linkage, unit/material catalogs, migration-safe history and document permissions. Check historic replay, conflicting updates, censored/unknown measurement, same-company and cross-company negative access, export counts and absent ILI without presenting fabricated remaining-life estimates.

#### Interface 6 — 2D station view (micro-facility management)

**Concept and user decisions.** A fast station interior view of headers, inlet/outlet manifolds, compressor or pump trains, bypasses, regulators, meters, isolation valves and associated instruments, linked to the true facility and individually identifiable installed equipment. It provides local connectivity, operational evidence, maintenance references and engineering revision context, without requiring GPU-heavy 3D.

**Backend data flow.** Topology owns facility, ports/headers, installed-unit identity, equipment graph and revision; manufacturer/Party evidence and Assets maintenance references remain owned by their respective modules. Telemetry/Alarm supplies permitted observations/state, with precise point/equipment bindings and timestamps. Read an accepted station graph including node/edge topology, symbol classification, physical/flow direction semantics, equipment ID and revision; positions may be curated presentation layout metadata only if clearly separate from as-built surveyed dimensions. Never infer that two components are physically connected solely because the SVG layout puts them adjacent. Manufacturer characteristic curves and editable equipment parameters need accepted versioned engineering APIs and cannot be invented in frontend fixtures.

**Rendering.** SVG with reusable local symbol library for modest station layouts; Canvas only if stress-tested density warrants it. Optional 2.5D isometric *view* is stylistic only and cannot obscure logical connectivity, safety labels or measurement state. Avoid WebGL/3D model engines, remote textures and animation-heavy widgets. Progressive station detail loading, deterministic scale/zoom, equipment search, a keyboard-accessible asset tree and compact detail panels keep interaction responsive on modest control-room workstations. Use the same high-performance HMI abnormal-state palette as Interface 3.

**Admission and tests.** Verified facility/unit/connection/revision owner APIs and manufacturer attachments where offered; verify multi-train station with individually addressable equipment, bypass and flow-direction consistency, engineer/observer roles, stale/denied states, keyboard navigation, reduced motion and bounded rendering with synthetic stations.

### C. Cross-view data contract and synchronization rules

| Concern | Required owner-provided evidence | WEB handling; no guessed contract |
|---|---|---|
| System and installed unit | Topology system, facility, segment, equipment IDs and approved graph/revision | One canonical selection; map, schematic and station highlight same owned entity |
| Survey and geospatial risk | Geometry + CRS/vertical datum/chainage + source/revision; separately authorized risk layers | Map and elevation align only when geometry and epochs are compatible |
| Pressure, flow and state | Telemetry point binding, unit, value, source time, received time, quality/trust, data window | Link observation with visible gaps; never masquerade as model output |
| Qualified analysis | Monitoring/Analytics definition/version, provenance, policy, scope and advisory qualification | Explainable overlays only; no automatic diagnosis/actuation |
| Scenario and modeled results | Simulation owner, exact input/engine capabilities, run IDs, state, units, qualification/uncertainty | Disabled until accepted numerical-contract and engineering-validation gates; F21 synthetic preview stays isolated |
| Alarm, incident and decision | Owner lifecycle IDs, independent actor, time, scope and immutable audit evidence | Separate observation, acknowledgement, reviewer decision, request and observed outcome |
| Integrity/manufacturer | Physical and maintainable identity, historical revision, manufacturer evidence, inspection and document IDs | Traceable pipe-strip, tables, comparison and linked dossier without duplicated ownership |
| Authorization | Principal current grants plus company/resource/effective-period scope, on every read/write/count/export | Re-evaluate server side; clear cached views at scope transition and fail closed |

**Suggested view orchestration:** a shared typed presentation context drives six independently loaded panels; each has its own permission and capability gate. TanStack Query keys include principal/scope, owner ID, version, time bounds and request parameters. Queries are canceled or invalidated on context switch; results from a prior scope must not flash during a new selection. A linked point, segment or station is opened by canonical ID and independently reauthorized. Full-screen and split-screen use the same read models, with no duplicate hidden backend state. Even where browsers support WebSocket/SSE, the server remains authoritative and HTTP refresh must recover after disconnection.

**Source/contract acceptance checklist:** before opening any implementation task, capture WEB+API main SHA/tree and relevant exact-SHA CI; verify the approved backend runtime OpenAPI artifact and digest, generated Orval slice compatibility, required permissions and per-resource scope, identifiers and joins, nullable/unknown values, units/CRS, revision/temporal behavior, concurrency, error/denial semantics and response limits. Any missing requirement is a specific API-owner gap, not permission to invent a frontend endpoint. For protected existence/count/history/export, verify authority *before* disclosure. Use synthetic fixtures and disposable PostgreSQL for native qualification.

### D. Delivery order, prerequisite gates and scope isolation

**Milestone 0 — contract/performance inventory (proposed, no task selected).** Inventory current native map, topology, telemetry, assets/integrity, manufacturer, station, alarm and simulated preview capabilities at exact SHAs and publish a six-view API acceptance matrix. Define reference target hardware, network conditions and measured bundle, first-interaction, map-pan, chart-pan, memory, DOM, rendering and request budgets before selecting an implementation; do not invent achieved latency or frame-rate figures. Set a security/performance regression baseline from current Code CI and browser tests. F21 walkthrough remains pending; F16 remains HOLD.

**Milestone 1 — independently supported read-only spatial and station foundation (candidate).** Prioritize Interface 1's accepted map readers and Interface 6's asset navigation/schematic with Interface 5's currently approved dossier references. Reuse the integrated F19/F20 preview style and local geographic map where appropriate, but use *real* topology only under exact accepted contracts. Align with existing HWEB-F02/F03/F04/F05/F07 editor/engineering prerequisites without reviving their blocked scopes. Do not turn a 2D view into a functional station editor by inference.

**Milestone 2 — qualified measurement context (candidate).** Extend Interface 4 through accepted telemetry/point-binding queries, then add observation-only traces in Interface 2 and status-only overlays in Interface 3. Use query refresh first. Only completed-and-accepted high-frequency query/window/event capabilities enable real live streams. No new operational parameters without supported typed API evidence.

**Milestone 3 — full engineering/integrity revisions and comparative workflows (candidate).** Deepen Interfaces 1/2/5/6 when approved geographic surveys, manufacturer curves, inspected joints/welds, asset histories, scoped imports and immutable engineering baselines are published and verified. Establish approval/revision/history and conflicting-write UX only for actual accepted backend workflows.

**Milestone 4 — numerical twin and advanced predictions (DEFERRED).** Qualify the future Hidra-owned engine first: gas-first/GZ2, steady then transient as independently selected, explicit physics/model capabilities, inputs/units/reference conditions, spatial/temporal alignment, result uncertainty, deterministic validation, reproducibility and human decision provenance. Only then enable modeled pressure/flow overlays, transient-wave/slack-line warnings, qualified scenario comparisons, predictive integrity analytics and validated cross-view result correlation. NeqSim/DWSIM/pandapipes are not assumed working interchangeable integrations. The current F21 fixture remains non-executable demonstration.

**Milestone 5 — control/action integration (OUT OF CURRENT AUTHORIZED SCOPE).** UI for proposals, explicit review, accepted approval and later independent outcome evidence may be selected under real contracts. Actual equipment/OT actuation requires a separate owner/safety/IT-OT authorization and independently proven control integration. Do not make a bidirectional valve command an implicit part of the P&ID milestone. The API may accept a governed *request* only under a separately approved safe contract and never on the strength of a UI click.

These are **planning milestones, not implementation tasks or suffixes of HWEB-F16/F21/F22**. Convert each future approved deliverable into one whole, uniquely registered task with exact message, owner, paths, prerequisites and acceptance. Never split a registered task to bypass a HOLD. No implementation is selected by this amendment. HWEB-F22 is not to start without F16 ADMIT and the independently accepted HidraAPI contracts required by its native scope.

### E. Cross-interface UX, performance, security and acceptance matrix

**HMI and accessibility.** Use coherent compact typography, grayscale normal state, state-specific anomaly colors plus shape/label, stable alarm ordering and safe unknown/stale/disconnected indicators. French, English and Arabic share domain-neutral machine values; verify Arabic RTL and LTR numerals/units/chainage within RTL layout. Keyboard map/tree/schematic/trend navigation, visible focus, screen-reader summaries, reduced motion, high contrast, responsive minimum viewport, printable high-stakes summaries and non-color alternatives are first-class test cases. Do not label a view “ISA-compliant” without a documented assessed standard/version and acceptance evidence.

**Performance strategy.** Local Vite asset delivery and code splitting by route/panel; lazily load MapLibre and rich plots; no remote tiles or mandatory cloud graphics. Prefer viewport-aware map features, spatial/signal pagination, server-side telemetry windowing/downsampling, React memoization, virtual grids, progressive chart paths and request cancellation. Keep profiles and station SVGs lightweight; use no mandatory 3D/WebGL engine. Instrument largest-contentful paint, first interaction, memory, data-window latency, map and chart frame consistency and network payload at reference workstation profiles. Define explicit numeric budgets and thresholds only with the selected task's hardware/network baseline; report measured p50/p95 and failure budgets rather than claiming arbitrary performance success.

**Security and industrial operations.** Zero Trust and per-resource company/scope enforcement on REST, not only route display. Context switches revoke client visibility immediately. Avoid persisting tokens, operational fixtures, protected counts or historical exports in service-worker caches. Preserve independent audit/approval evidence, timestamps, evidence versions and exact engineering provenance. Degraded connectivity is never a “normal operation” indicator; no stale authorization and no direct IT-to-OT command path.

**Acceptance scenarios for a future whole task:**
1. Starting from a permitted GZ2 station, open map -> station -> schematic -> profile -> telemetry -> integrity and return; the same authorized canonical ID, compatible revision and UTC window persist, while each panel discloses only its entitled owner data.
2. Toggle available surveyed and risk overlays, inspect actual CRS/source and a qualified anomalous location; when geometry/localization is unsupported, show uncertainty/unavailable, never a fabricated GPS pin or risk polygon.
3. Compare authorized pressure and flow readings against a historic baseline with units/quality/time; demonstrate gaps, stale sensors, incompatible reference units and no inferred safe gradients or modeled output.
4. Exercise same-company out-of-scope, cross-company, revoked-grant and direct-link actors across map, count, alarm, history and export, with no protected existence leak or mutation.
5. Revisit immutable engineering and integrity history after a new revision; distinguish original weld/ILI evidence, current state, old manufacturer values and unqualified predictions.
6. Use the same gray-normal, anomaly-reserved-color semantics in P&ID and station view; keyboard and Arabic RTL must remain usable with lower-end hardware and no 3D.
7. Disconnect the backend and expire authentication; show explicit stale/offline state, clear protected new-scope content, deny actions, and recover through reauthorized readback.
8. In the synthetic F21 demo only, preserve precomputed comparison and independent review provenance without claiming a running solver, live sensor, valve command, or achieved field outcome.
9. Execute focused tests plus supported Code CI/browser/native PostgreSQL source-bound paths for any implemented feature; record actual skipped tests and release limitations. Only owner walkthrough and later engineering/SITE gates can upgrade acceptance beyond their proven level.

**Roadmap governance and publication intent.** This is an owner-requested *documentation-only* prospective strategy using the existing canonical roadmap as its single changed file. The allowed publication message for this appendix is **docs(roadmap): define local-first six-view digital twin target**. F21's implementation and existing Code CI #1044/Docs #81 remain unchanged and walkthrough acceptance is outstanding. HWEB-F16 stays HOLD; HWEB-F22 is gated. No API, client generation, fixture, test, workflow, runtime, migration, preview or release file is changed. Direct-main expected-head publication and exact-SHA documentation CI startup observation are required; CI green does not constitute user acceptance.

## HWEB-F21 — owner-expanded six-interface synthetic walkthrough (2026-11-10)

**Owner-directed scope revision, not a child task.** Before accepting HWEB-F21, the owner requested all six simulated twin interfaces to be implemented before HWEB-F22. “F21-extended” is a working description of an **expansion of the single existing HWEB-F21**, not a newly registered suffixed implementation ID or child package. This follows the 2026-11-09 rule against splitting registered tasks. Preserve the earlier F21 registration, initial decision-preview implementation, Code CI #1044 and Docs #81 as original implementation evidence, not completed owner walkthrough acceptance.

**One expanded deliverable.** Integrate six separate interactive tabs beneath the existing signed-in, topology-read-gated /network?view=preview workspace. Reuse the authorized GZ2 and Orion demo system/station context, demo actor scope, UTC window and technical revision; preserve the existing F19 geographic map, F20 station investigation and F21 precomputed decision review. The new six-interface-preview-v1 fixture remains expressly fictional and is never presented as surveyed, live or qualified numerical output.

1. **Geographic / Spatial.** Local SVG macro route with authored fictional station coordinates, toggled synthetic HCA and water layers, station selection and prominent lack-of-exact-anomaly-GPS caveat. Existing real MapLibre basemap remains available in the parent workspace.
2. **Hydraulic & Elevation.** 2D kilometer-post/elevation plot, available fixture pressure observations and separately labeled authored synthetic mass-flow numbers; no interpolation, slack-line detection, transient calculation, pressure-gradient qualification or modeled mass balance.
3. **Logical Schematic / P&ID.** Grayscale equipment/connectivity SVG with source-backed *demo* alarm highlight and accessible station selection; read-only, no valve/pump/SCADA/PLC actuation or newly invented command API.
4. **Telemetry & Analytics.** Existing fixture pressure sample-order chart, optional historical overlay through drag/drop or keyboard-button fallback, shared numerical scale and exclusion of stale/missing readings. No individual per-sample timestamps, live data streaming or predictive analytics are claimed.
5. **Asset Integrity.** Fictional pipe grade, wall thickness, weld reference, and inline pipe strip with unavailable qualified ILI evidence; no industrial material certificate, live ILI feed or remaining-life estimate.
6. **2D Station.** Lightweight local SVG train, manifolds, bypass and valves, showing the selected station and qualified-fixture technical revision where available; no WebGL/3D engine, interaction-driven actuation or assumed as-built connectivity.

**Scope and invariants.** Preserve all current F21 decision review/authorization and original event history. Make the six views presentation-only (React state), sourced solely from versioned synthetic fixtures, bound to the existing accessibleSystems demo role and resource grants; denied demo company/scope yields no station, pressure, risk or integrity disclosure. Clear view selection, risk toggles and comparison overlay on reset and role/system change. Honor EN/FR/AR RTL, explicit measurement units, provenance labels, keyboard, narrow screens and stale/unknown rendering. No new business network requests, generated Orval contracts, backend APIs, migrations, numerical engine execution, SCADA/OT or production approval. Simulated HCA or pipe grade does not establish engineering truth.

**Exact implementation message:** feat(preview): extend F21 with six synthetic twin views.

**Whole-task file allowlist:** modify ONLY src/features/topology/preview/NetworkPreviewPage.tsx; src/features/topology/preview/styles.css; tests/e2e/network.spec.ts; docs/roadmap/HWEB-F19-Network-Preview.md; docs/roadmap/ULTIMATE_ROADMAP.md. ADD ONLY src/features/topology/preview/sixViewFixture.ts, sixViewFixture.test.ts, sixViewCopy.ts and SixViewSimulationPanel.tsx. These are filenames under the same preview directory; no other source, test, config, API or workflow changes.

**Revised whole-task acceptance.** For the scoped GZ2 fixture and the second demo system, exercise all six tabs, station/window/role switches, HCA/water toggles, elevation/flow units, pressure missing/stale states, archived overlay, grayscale HMI/alarm and read-only station/integrity metadata. Verify no unauthorized disclosure for same-company out-of-scope/cross-company demo roles; no unexpected business API calls; no control/write requests; reset semantics; accessibility, 360px layout, English/French/Arabic and keyboard tab selection. Repeat the original F21 trace from observation/input revision through independent reviewer decision and unresolved outcome. Run model unit tests, browser E2E, lint/typecheck, build/performance and exact-SHA Code CI; record actual failures and limits. Successful CI alone never closes owner walkthrough acceptance.

**Execution order and holds.** HWEB-F21 remains IMPLEMENTED / WALKTHROUGH_ACCEPTANCE_PENDING until the owner explicitly accepts this expanded whole-task walkthrough. HWEB-F16 remains HOLD pending its own native consumer/authorization acceptance; HWEB-F22 requires F16 ADMIT and accepted HidraAPI contracts and is not selected here. Synthetic six-view presentation cannot activate the numerical simulator/P3, real telemetry publishers, live spatial risk data or bidirectional OT control.

## HWEB-F21 — owner feedback correction: conventional symbols and intermediate altimetry (2026-11-10)

**Disposition: F21 acceptance pending, same whole task.** The owner found the six-interface walkthrough almost acceptable and requested recognizable conventional industrial symbols for stations, valves, compressors and meters, and an altimetry chart with intermediate elevation points along the route rather than only stations. This correction belongs to HWEB-F21 and does not create a new task or admit HWEB-F22.

**Conventional process schematic.** The synthetic preview uses independently drawn simplified P&ID-style shapes with labels and a legend: dashed ST station boundary, bow-tie XV gate-valve glyph with stem, K compressor rotor glyph and FT instrument bubble. A square enclosure marker replaces the generic dot in its illustrative route. ISO 10628-2:2012 identifies the graphical-symbol standard family for chemical/petrochemical diagrams (https://www.iso.org/standard/51841.html). ANSI/ISA-5.1-2024 identifies instrumentation/control symbolism (https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5-1). These independently authored demo glyphs are **not a certified or formally audited implementation of either standard** and do not constitute an approved project symbol library, verified asset list, P&ID or as-built design. No instrument controls, valve actuations, SCADA or other writes are included.

**Independent synthetic elevation samples.** The versioned six-interface fixture becomes six-interface-preview-v2. GZ2 has 14 authored chainage/elevation points over 0–170 km with three linked station markers at 0/85/170 km. Orion has eight authored points over 0–85 km and two station markers. Non-station terrain points, including synthetic summits and depressions, appear in the profile and PK/elevation table. Pressure markers remain only at stations with available source evidence, in a separate graph band with bar(g) units; no solver, continuous hydraulic gradient, mass balance or industrial elevation claim. Flow remains authored only for stations. The points are explicitly **fictional**, not GIS surveyed data, DEM, pipe invert or actual GZ2 geography; real longitudinal profile and vertical datum require verified engineering records and API contracts.

**Corrective F21 acceptance.** Verify distinct ST/XV/K/FT diagram symbols and legend in schematic and 2D station, grayscale normal and highlighted synthetic alarm, no commands, 14 GZ2 / eight Orion chainage points with respective station annotations, intermediate sample identification, selective pressure markers, missing/stale pressure, role isolation, translations EN/FR/AR RTL, keyboard/360px and the unchanged independent F21 review history. Unit and E2E assertions must cover these details. CI success supports testing but does not replace explicit owner walkthrough approval. F16 stays HOLD; F22 stays blocked.

**Permitted correction files:** src/features/topology/preview/SixViewSimulationPanel.tsx, src/features/topology/preview/sixViewFixture.ts, src/features/topology/preview/sixViewFixture.test.ts, src/features/topology/preview/sixViewCopy.ts, src/features/topology/preview/styles.css, tests/e2e/network.spec.ts, docs/roadmap/HWEB-F19-Network-Preview.md, and this canonical roadmap. **Exact commit message:** fix(preview): refine F21 process symbols and elevation profile.

## HWEB-F21 — owner acceptance and F16 whole-task scope-preparation handoff (2026-11-10)

**Owner decision received:** The owner replied `accepted` to the explicit question accepting the corrected F21 walkthrough **and authorizing preparation** of the complete F16 implementation scope. This confirms F21 client-preview acceptance only; it does **not** authorize F16 source publication, decide actual GZ2 ownership, or admit F22.

### F21 acceptance record — synthetic frontend boundary

- **Accepted WEB source:** `5e8cd467da0ece82407b164126bef24bc4baa58e` (tree `ea75415ce3f39b7df169d04d3b52366e3f498f76`); [HidraWEB Code CI #1052 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42826723182) on that exact source; all three jobs (`verify`, native A1 and native LOCAL F18) succeeded. The preceding [Documentation Validation #84 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42824949429) covers the documentation at `dc752e36c3e2a40d85f70c93fd6243d3477aac3a` (not #1052's SHA).
- **Accepted walkthrough:** six tabs in the signed-in synthetic network preview, conventional illustrative ST/XV/K/FT diagram symbols and localized legend, GZ2 14 chainage/elevation samples with 3 station markers, Orion 8 samples with 2 station markers, independent fictional terrain elevation between facilities, available-only station pressure, historic telemetry overlay, access-denied demo contexts, original independent human decision history and no control APIs.
- **Qualification limit:** owner-visible preview and automated browser/contract checks, NOT a formally reviewed ISO/ISA symbol catalog, surveyed pipeline elevation, live SCADA, calibrated hydraulic model, native station-workflow acceptance, industrial SITE or deployment. F21 status becomes **OWNER-ACCEPTED / PREVIEW VERIFIED**. Previous pending statements remain historical, not silently rewritten.

### HWEB-F16 — proposed single whole-task source admission (PREPARED, NOT SELECTED)

**Existing registered task:** HWEB-F16 is indivisible; do not create F16 suffixes, packages, child tasks or partial ADMIT states. Its current disposition is **HOLD / NOT ADMITTED**. This section prepares a full proposed implementation allowlist and message for **separate explicit owner authorization**; it is not a source implementation, release, or permission to override missing backend authority.

**Pinned evidence for preparation:** WEB `5e8cd467da0ece82407b164126bef24bc4baa58e` (Code #1052 SUCCESS); HidraAPI current main `85ac6d387ef5cf1421dd22a89b9c56079d665e1e` is a documentation-only HAPI-934 company-ownership decision (Docs #976 SUCCESS), not new F16 runtime-contract proof. For F16's compatible native Alarm baseline, retain separately verified API `02c2d130b902547c113b8fbea83b9affcfd4e892`, Full #1154 SUCCESS and published full OpenAPI JSON SHA-256 `23cb45be5456bb84f28beec63e0c8b6a03e6b80b157ec55645eb81da829881ff` (artifact #13660882599). Re-verify the exact artifact bytes, security scheme, API SHA and runtime contract before implementation; source SHA and ZIP digest alone cannot substitute for an extracted JSON contract comparison.

**Whole-task purpose and owner:** Alarm owns its read/list/count/detail and acknowledgement transition/audit; Identity and Organization provide current authenticated company/actor authority, and Topology supplies current **exact FACILITY** resource bindings through the accepted backend contracts. WEB only presents approved data and delegates requests, never performs security filtering of an unscoped list or decides actor, time, or transition. GZ2 is the first synthetic reference, not the only gas system. Physical target company, resource type and ownership must be approved separately; unsupported PIPELINE_SYSTEM must fail closed.

**Proposed exact source/test/CI allowlist** (paths are candidates, NOT yet approved for a source-changing commit):

| Operation | Exact path | Purpose |
|---|---|---|
| ADD | `openapi/candidates/hidra-alarm-02c2d130b902547c113b8fbea83b9affcfd4e892.json` | Immutable Alarm-only deterministic slice of the verified full runtime OpenAPI: 13 paths, transitive schemas and bearer security |
| MODIFY | `orval.alarm.config.ts` | Pin the new slice without modifying other Orval inputs or shared baseline |
| MODIFY | `scripts/verify-alarm-candidate.test.mjs` | Verify source digest, endpoints, models, security, negative drift and legacy compatibility |
| MODIFY | `scripts/check-openapi-compatibility.mjs` | Update only `ALARM_CURRENT_PROOF` and preserve all other proof locks |
| MODIFY | `src/features/alarm/api/alarmApi.ts` | Reconcile typed read/ack requests and existing query invalidation without inventing backend semantics |
| MODIFY | `src/features/alarm/AlarmConsolePage.tsx` | Present permitted scoped station alarm, acknowledgement and fresh durable readback |
| MODIFY | `src/features/alarm/i18n/alarmTranslations.ts` | Localize only any F16-specific errors/evidence labels where source changes require them |
| MODIFY | `src/features/alarm/AlarmConsolePage.test.tsx` | Keep existing mocked UI regressions; add scoped UX and fresh-readback cases |
| MODIFY | `src/features/alarm/AlarmConsoleReadOnly.test.tsx` | Preserve denial and no-action UI assertions |
| MODIFY | `tests/e2e/alarm.spec.ts` | Preserve existing mocked E2E and add regression for permitted list/detail transitions where required |
| ADD | `tests/e2e/alarm-native-live.spec.ts` | Genuine signed-in, three-LOCAL-principal browser+HTTP authorization, count/detail/ack/reload tests with no request interception |
| ADD | `playwright.alarm-native.config.ts` | Isolated native Chromium config; explicitly disable mock auth and browser trace/credential exposure |
| ADD | `scripts/alarm-native-fixture.sql` | Disposable migrated PostgreSQL synthetic same-grant company/FACILITY bindings and alarm evidence only |
| ADD | `scripts/prepare-alarm-native.mjs` | Idempotent, fail-closed disposable native fixture setup, no production seed/data |
| MODIFY | `.github/workflows/ci.yml` | Add separate F16 native API/PG/WEB qualification with exact accepted API source checkout, redacted assertions and no weakening of existing jobs |
| APPEND ONLY | `docs/roadmap/ULTIMATE_ROADMAP.md` | Record authorized implementation decision, exact evidence and eventual F16 ADMIT/HOLD |
| APPEND ONLY | `docs/roadmap/HidraAPI-Frontend-Backend-Gap-Register.md` | Record approved API/WEB contract pin, authority proofs and remaining operational owner limitations |

**Proposed exact implementation message (requires owner approval):** `feat(alarm): qualify scoped native acknowledgement workflow`. One whole-task implementation selection only; all code/contract/fixture paths above must be source-reviewed again at the current expected head. No changes outside this allowlist without fresh explicit approval, and no generated Orval files committed under the current generation convention.

**Required non-negotiable acceptance:** (1) exact immutable JSON digest and only the Alarm path/schema/bearer slice; strict compatibility and Orval generation; (2) no changes to twenty other feature pins or shared baseline; (3) current authenticated operator's company and exact resource authority enforced by the backend **before** list/count/detail/existence disclosure and again in guarded acknowledgement transaction; (4) three genuinely authenticated LOCAL users with identical route grants, permitted/intra-company denied/cross-company denied, and direct HTTP denial with no count/page-total/ID leak; (5) permitted single acknowledgement then reload returns persisted event with backend-derived actor and timestamp, original alarm evidence/provenance intact, and denied/revoked attempts leave history unchanged; (6) preserve permitted multiple independent immutable acknowledgements, do not invent strict once-only semantics; (7) handle 401/403/masked-404 and conflict/replay according to observed API contract; (8) pass Node 24 strict contract check, lint, typecheck, unit/component, performance, production build, full Playwright regressions, and a new isolated native PostgreSQL/API browser lane with exact WEB/API SHAs and safe evidence; (9) obtain owner approval for actual target GZ2 owner/type before any production-target ADMIT claim.

**Entry blockers and disposition:** the F16 source/test/CI allowlist and exact message above are a **proposal**, not yet selected for implementation; the verified Alarm OpenAPI slice remains unpinned in WEB; the native browser workflow and actual GZ2 owner/source reference remain unqualified. F16 remains **HOLD**. F22 still requires F16 ADMIT, accepted owner-backed contracts and native fixtures. This F21/F16 handoff is documentation only, changes no source, generated clients, workflow, database, API or runtime, and leaves F22 unselected.

---

## Active roadmap — HidraWEB layout and backend delivery

**22 November 2026 · Owner-adopted planning baseline · Implementation NOT SELECTED**

The owner adopted this section as the sole active HidraWEB roadmap for future prioritization, sequencing, task admission and status updates. It supersedes older prospective priorities and queues. Earlier sections in this file and the supporting roadmaps remain historical task, decision and acceptance records. The [API–Web Contract](../architecture/Hidra-API-Web-Contract-v1.md), actual code, exact runtime OpenAPI and CI retain their authority for implementation and evidence.

**Next planning candidate:** P0 / UXR-01. Before any source work, explicitly select one whole task, reconcile overlapping registered HWEB obligations, and register its exact scope, acceptance, commit message and dependencies in this file. UXR identifiers are planning aliases until individually registered. HWEB-F16 remains HOLD, HWEB-F22 remains blocked and HWEB-F21 retains its synthetic-preview acceptance. Any independent Circle 1 execution ahead of F16 requires an explicit sequencing decision recorded here.

**Historical roadmap index:** [Development Roadmap](HidraWeb-Development-Roadmap.md), [Post-Reconciliation Product Roadmap](HidraWEB-Post-Reconciliation-Product-Roadmap.md), [Post-Reconciliation Roadmap](HidraWEB-Post-Reconciliation-Roadmap.md), and [Production-First Roadmap](HidraWEB-Production-First-Roadmap.md). The [Backend Gap Register](HidraAPI-Frontend-Backend-Gap-Register.md) remains the supporting contract-gap record.

This plan retains the nine phases and 39 proposed UXR tasks. Rows expand a whole task into its individual layouts, components or workspaces for traceability. They do not split a registered task. Scope includes all seven layout families, ten Global Header elements, six sidebar groups, 19 numbered workspace designs, both operational anchors and the existing authentication, fallback and workbench routes.

### Verified baseline and execution order

| Evidence | Roadmap implication |
|---|---|
| HidraAPI T39/G7, accepted implementation `f0310330ae8eb58f8bf00400b29afeb5baccb869`. [CI #1358 attempt 2](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/44999120757/attempts/2) and [Full Verification Gate](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/44999120757/job/137141211356) succeeded. | Supersedes the pending/failed T39 status in the attachments. The canonical closure records 4,563 tests, 611 classes and zero failures/errors/skips. It qualifies a signed synthetic API journey on PostgreSQL. |
| [T39 runtime OpenAPI](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/44999120757/artifacts/14745595446) downloaded and checked. Source SHA matches the accepted implementation. 491 paths, 536 operations, 586 schemas. Raw JSON SHA-256 `386858e3a3e7c78180cdb2d97a58102b973a22bcd723f5ad2ca29c33aaf20bbe`. | All explicit method/path pairs in the roadmap were checked against this JSON. Parameter, media-type and DTO compatibility must be pinned when each consumer is admitted. |
| [HidraAPI main](https://github.com/CHOUABBIA-AMINE/HidraAPI/commit/33a0ec866496c04ba437c4017a5362192523c764) is the T40 release-alignment source. [CI #1359](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45008723822) and [Docs](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45008723827) passed. [Manual CI #1360 attempt 1](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45010727037/attempts/1) failed its Full Verification Gate and shards 4 and 12. [Attempt 2](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/45010727037/attempts/2) was in progress at the last check. | The [v0.7.0 GitHub Release](https://github.com/CHOUABBIA-AMINE/HidraAPI/releases/tag/v0.7.0) is published, and its tag points to this SHA. This supersedes the source documents’ unpublished status. Release-note verification fields still contain placeholders. Publication alone does not establish the separate T40 audit-mode gate. Keep T39 as the proven consumer reference. |
| [HidraWEB main](https://github.com/CHOUABBIA-AMINE/HidraWEB/commit/84538a585e81cb605f815abde259e3fbf5eeaf93) has [passing Documentation Validation](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42830981789). [Code CI #1052](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/42826723182) passed at `5e8cd467da0ece82407b164126bef24bc4baa58e`. | F21 owner acceptance is for the synthetic preview. Its six views are Geographic/Spatial, Hydraulic & Elevation, Logical Schematic/P&ID, Telemetry & Analytics, Asset Integrity and 2D Station. This evidence does not qualify native Circle 1 browser flows. |
| [Live HidraWEB governance](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/84538a585e81cb605f815abde259e3fbf5eeaf93/docs/roadmap/ULTIMATE_ROADMAP.md) retains **F16 HOLD / NOT ADMITTED** and **F22 blocked**. | P0 reconciles the registered F16 sequence with the adopted UXR plan and records any separately approved Circle 1 sequencing decision. F16 remains a single whole task. Roadmap adoption selects no implementation stage. |

**Adopted planning sequence** · P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8. In P6, qualify context before map, map before dossier, dossier before trusted observations and governed review, and decision evidence before the integrated browser gate. P7 can reuse the approved shared frame after P5 where the workspace has no P6 dependency and governance permits it. Alarm command acceptance remains subject to F16. Operational Monitoring can show qualified observations before station synoptic binding is resolved.

### Circles and readiness terms

| Circle | HidraAPI business modules |
|---|---|
| C1 · Core | Identity, Organization, Topology, Workflow, Audit, Integrity, Telemetry |
| C2 · References | Party, Configuration, Documents |
| C3 · Operations | Planning, Monitoring, Assets, Custody, Integration |
| C4 · Response | Alarm, LeakDetection, Incident, HSE, Notification |
| C5 · Intelligence | Analytics, Risk, Reporting, Simulation |

Circles describe the module dependencies of the row, including optional integrations where noted. Security, generic workbench and realtime are shared platform surfaces. They are outside the 24-module classification. Identity is a common shell prerequisite. Workspace rows show it explicitly when the task consumes a specific Identity/scoping contract.

**Backend readiness** states the strongest evidence available for the specified behavior. **Accepted Txx** refers to the named bounded backend software slice. **Exists** identifies a route in the runtime contract or an existing WEB adapter, with the stated consumer checks outstanding. **Partial / conditional** requires the stated source, scope or governance decision. **Frontend-local** identifies behavior implemented without an owner REST call. Generic workbench resource names must come from authorized descriptor discovery. Endpoints in a row are selected consumer operations and useful bounded alternatives, with conditional commands identified in readiness. Query parameters are omitted from paths unless called out in the integration notes.

### P0 · Source and scope admission

G0 · Owner-reviewed design inventory, source pins and sequencing disposition.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P0 | UXR-01 · Reconcile approved scope | Freeze seven layout families, ten header elements, six group entries, 19 numbered workspaces and two anchors. Compare approved design with router, shell, existing source and canonical roadmap. Resolve execution order at adoption. | All 24 owners (inventory) | C1–C5 | — | Scope review only. F16 HOLD, F22 blocked, F21 synthetic preview owner-accepted. Preserve registered tasks. |
| P0 | UXR-02 · Qualify API handoff | Pin T39 raw OpenAPI and fixture receipt; reconcile each generated client and the published owner operations, permissions and DTOs. Record unsupported contracts separately. | All 24 owners (inventory) + security platform | C1–C5 | `POST /api/v1/identity/authentication/login`<br>`POST /api/v1/identity/authentication/refresh`<br>`POST /api/v1/identity/authentication/logout`<br>`GET /api/v1/identity/me`<br>`GET /api/v1/organization/responsibilities`<br>`GET /api/v1/identity/me/regional-access/{resourceKind}/{resourceId}`<br>`GET /api/v1/topology/regional-map/layers`<br>`GET /api/v1/topology/regional-map/layers/{layerId}`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features/{entityId}`<br>`GET /api/v1/topology/regional-map/geojson`<br>`GET /api/v1/topology/regional-map/search`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections/{sectionId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/connections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/equipment`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/baseline`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/sections/{sectionId}`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history`<br>`GET /api/v1/workflow/tasks`<br>`GET /api/v1/workflow/tasks/{id}`<br>`GET /api/v1/workflow/tasks/{id}/available-actions`<br>`GET /api/v1/workflow/instances/{id}`<br>`GET /api/v1/workflow/instances/{id}/timeline`<br>`POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute`<br>`POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}`<br>`POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/publication`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence` | T39 accepted for HidraAPI. Its exact digest is verified. HidraWEB contract pin, compatibility and native replay remain delivery work. |

### P1 · Design-system foundation

G1 · Tokens, EN/FR/AR RTL, responsive and keyboard foundations checked.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P1 | UXR-03 · Industrial theme and layout tokens | Theme, typography, density, elevation, semantic status colors, focus, contrast and breakpoints. Reuse the current MUI shell. | — | — | — | Frontend-local. No business API dependency. |
| P1 | UXR-04 · Locale, RTL and responsive foundation | EN/FR/AR, direction-aware layout and logical spacing, localized labels, dates/units and mobile touch/focus behaviors. | — | — | — | Frontend-local. Preserve source units and timestamps in connected views. |

### P2 · Permanent shell and navigation

G2 · Six groups, safe active ancestry and route restoration verified.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P2 | UXR-05 · Semantic application shell | Permanent header/sidebar, workspace frame, skip link, landmarks, authenticated outlet and protected route/loading/denial boundaries. | Identity + security platform | C1 | `GET /api/v1/identity/me`<br>`GET /api/v1/identity/me/permissions`<br>`GET /api/v1/security/permissions/routes`<br>`GET /api/v1/security/permissions/catalog`<br>`GET /api/v1/identity/me/operation-capabilities` | Existing authentication and metadata bootstrap. Layout and signed denial behavior need WEB acceptance. |
| P2 | UXR-06 · Six-group sidebar | Overview, Operations, Engineering, Intelligence, Work, Administration. 272 px expanded / 72 px collapsed, one expanded group and one nested submenu, max three levels, text-only descendants. | Identity + security platform | C1 | `GET /api/v1/identity/me/permissions`<br>`GET /api/v1/security/permissions/routes`<br>`GET /api/v1/security/permissions/catalog`<br>`GET /api/v1/identity/me/operation-capabilities` | Existing grants/routes inform visibility. Owning pages still enforce effective access. |
| P2 | UXR-07 · Mobile navigation and deep links | Responsive sidebar drawer, keyboard and back/forward handling, safe restoration of active ancestors, local tabs and context; include fallback/Not Found and root redirect. | Identity + owning module on protected target | C1 + target Circle | `GET /api/v1/identity/me/permissions`<br> owner route from the destination row | Shared behavior is local. Reauthorize before restoring protected selections and clear them on scope changes. |

### P3 · Global Header and scope

G3 · Ten header elements and safe current-context behavior verified.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P3 | UXR-08 · Header product, environment and controls | Implement sidebar toggle, HIDRA identity/home, configured environment indicator and language picker as local UI; never show environment as an availability claim. | — | — | — | Frontend-local and runtime configuration. |
| P3 | UXR-08 · Profile, session and authentication pages | Principal menu, sign out, LOCAL entry at `/login`, renew/expire session, OIDC callback at `/auth/callback` only when configured. | Identity + security platform | C1 | `POST /api/v1/identity/authentication/login`<br>`POST /api/v1/identity/authentication/refresh`<br>`POST /api/v1/identity/authentication/logout`<br>`GET /api/v1/identity/me`<br>`GET /api/v1/security/oidc`<br>`POST /api/v1/identity/authentication/oidc/evaluate`<br>`POST /api/v1/identity/authentication/oidc/complete` | Native LOCAL baseline exists. OIDC is a separate provider-dependent path. No profile editor implied. |
| P3 | UXR-09 · Operational-context selector | Resolve linked employee's effective responsibilities and current exact company/resource decision. Reset scoped cache and routes after switching context or revocation. | Identity, Organization, Topology | C1 | `GET /api/v1/identity/me`<br>`GET /api/v1/organization/responsibilities`<br>`GET /api/v1/identity/me/regional-access/{resourceKind}/{resourceId}`<br>`GET /api/v1/identity/me/permissions` | T33 accepted and exercised in T39. Working context grants no authority by itself. Native WEB rebinding and revocation pending. |
| P3 | UXR-10 · My Tasks shortcut | Open authorized My Tasks route; use assigned inbox only if displaying server-backed task data. | Workflow | C1 | `GET /api/v1/workflow/tasks` | Owner list exists. No independent header-count API required. |
| P3 | UXR-10 · Notifications shortcut | Open notification route or admitted facility workflow inbox; use server-issued facility selection. | Notification, Workflow (inbox context) | C1, C4 | `GET /api/v1/notification/companies/{companyId}/facilities/{facilityId}/inbox` | T27 bounded inbox exists. Global unread badge unsupported by this scope. |
| P3 | UXR-10 · Communication status | Show browser-to-app connectivity, degraded/reconnecting and recovery. Use transport endpoints only if transport wiring is selected. | Realtime platform | Platform / cross-cutting | `GET /api/v1/realtime/capabilities`<br>`GET /api/v1/realtime/sse` | Client status can ship locally. Source exposes realtime capability and SSE; this does not qualify live OT or telemetry freshness. |
| P3 | UXR-11 · Search | Keep global cross-domain search gated. Offer authorized Topology-local search in network context with typed result navigation. | Topology; Identity, Organization for regional scope | C1 | `GET /api/v1/topology/regional-map/search` | T34 scoped search accepted. General cross-domain scoped search remains unestablished and conditional. |

### P4 · Workspace frame and contextual exploration

G4 · Frames, inspector, progressive evidence and owning links verified.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P4 | UXR-12 · WorkspaceHeading and WorkspaceToolbar | Breadcrumb/title, factual owner status and authorized primary actions in row one. Optional local tabs, search, filters, view switch and refresh in row two. | Owning module when status/action shown | By workspace | — for frame<br> owner calls per workspace rows | Frontend-local frame. Status and actions inherit owner contract and scope. |
| P4 | UXR-13 · Workspace canvas layouts | Map, diagram/synoptic, summary cards, register, trend/detail and focused editor layouts. Allocate correct empty/loading/degraded states. | Owning module by canvas | By workspace | — for frame<br> MAP<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history` | Local frame; verified map and readings are representative. Diagram signal placement is separately gated in UXR-24. |
| P4 | UXR-14 · ContextInspector / Right Drawer | Selected-record inspector, approximately 420 px desktop, overlay/detail at narrow widths, return focus and preserve safe selection. | Owning module per record | By workspace | — for frame<br> GET topology/pipeline-dossiers/{pipelineId}<br>`GET /api/v1/workflow/tasks/{id}` | Owner-specific detail calls. Opening changes no domain state; recheck authority through owner route. |
| P4 | UXR-15 · Contextual evidence, status and trends | Build StatusWithProvenance and EvidenceTimeline. Summary → on-demand history/trend → owning workspace. Render source, quality, time, units, revision and effective period. | Telemetry, Topology, Workflow, Audit; other owners by page | C1 + target Circle | `GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history`<br>`GET /api/v1/workflow/instances/{id}/timeline`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence` | Exact T39 evidence examples exist. Timeline/trace is source-specific; correlation IDs alone establish no causality. |
| P4 | UXR-16 · ContextLink and handoffs | Deep-link via source-issued feature, facility, section, task, request or document identifiers. Reauthorize on target and preserve safe return navigation. | Topology, Identity, Workflow, Documents; other destination owners | C1, C2 + target Circle | `GET /api/v1/organization/responsibilities`<br>`GET /api/v1/identity/me/regional-access/{resourceKind}/{resourceId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}`<br>`GET /api/v1/workflow/tasks/{id}`<br>`GET /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}/links` | Specific joins exist. A generic join or access inheritance cannot be inferred. |

### P5 · Reusable interaction library

G5 · Paging, typed actions, error/confirmation and visualization/file primitives verified.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P5 | UXR-17 · AuthorizedRegister and filters | Server paging, totals/cursors, exact owner filters, row selection, search and empty/denied/loading/export gating. Include existing `/workbench` support route outside the numbered business views. | Owning module + workbench and security platforms | C1–C5 as applicable | `GET /api/v1/workbench/modules`<br>`GET /api/v1/workbench/{module}/resources`<br>`GET /api/v1/workbench/{module}/{resource}`<br>`GET /api/v1/workbench/{module}/{resource}/{id}`<br>`POST /api/v1/workbench/{module}/{resource}/search` | Published descriptors and paging. Generic workbench is usable only for allowlisted, authorized resources; validate counts and masking with native roles. |
| P5 | UXR-18 · TypedForm and AuthorizedActionPanel | Generated request DTOs, scope and backend references, confirmation, latest action eligibility, expected revision and durable readback. | Identity, Workflow, and action owner | C1 + target Circle | `GET /api/v1/identity/me/permissions`<br>`GET /api/v1/security/permissions/routes`<br>`GET /api/v1/security/permissions/catalog`<br>`GET /api/v1/identity/me/operation-capabilities`<br>`GET /api/v1/workflow/tasks/{id}/available-actions`<br>`POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute` | Workflow transition proven for T39 slice. Each other command requires its own authority, error and persistence proof. |
| P5 | UXR-19 · Overlays, dialogs and feedback | Modal/drawer focus, confirmation, inline validation, accessible toast/banner, safe error details and 401/403/masked 404/409 behavior. Reload and review stale write outcomes. | Owning module + security platform | By workspace | — for overlay<br> response from initiating owner operation | Frontend-local presentation. Detailed standalone overlay visual spec requires review at adoption. |
| P5 | UXR-20 · Map/chart/diagram and FileEvidencePanel | Reusable MapLayerExplorer, legend, trend/quality styling, StationSynoptic frame, file size/type/digest/download affordances. | Topology, Telemetry, Documents, Audit, Reporting | C1, C2, C5 | `GET /api/v1/topology/regional-map/layers`<br>`GET /api/v1/topology/regional-map/layers/{layerId}`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features/{entityId}`<br>`GET /api/v1/topology/regional-map/geojson`<br>`GET /api/v1/topology/regional-map/search`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history`<br>`GET /api/v1/topology/facilities/{facilityId}/station-graph/publications/current`<br>`GET /api/v1/topology/facilities/{facilityId}/station-graph/publications/history`<br>`GET /api/v1/telemetry/commissioning/points/{pointId}/effective`<br>`GET /api/v1/documents/document-versions/{versionId}/content`<br>`GET /api/v1/audit/companies/{companyId}/facilities/{facilityId}/exports/{exportId}/content`<br>`GET /api/v1/reporting/companies/{companyId}/facilities/{facilityId}/report-runs/{runId}/content` | T34/T37, exact document binary, T28 export bytes and T25 JSON exist for their own scopes. Synoptic completeness and each content route require separate checks. |

### P6 · Circle 1 industrial experience

G6 · Native signed HidraWEB journey verified against the accepted HidraAPI pin.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P6 | UXR-21 · Organization · WS-13 `/administration/organization` | Units/tree, employees, assignments, responsibilities, effective dates/history and supported authoring. Keep employee identity separate from user login and grants. | Organization, Identity | C1 | `GET /api/v1/organization/hierarchy`<br>`GET /api/v1/organization/units`<br>`GET /api/v1/organization/units/{id}`<br>`GET /api/v1/organization/employees`<br>`GET /api/v1/organization/employees/{id}`<br>`GET /api/v1/organization/assignments`<br>`GET /api/v1/organization/assignments/{id}/history`<br>`GET /api/v1/organization/responsibilities`<br>`GET /api/v1/organization/operational-scopes/{scopeId}`<br>`POST /api/v1/organization/units`<br>`POST /api/v1/organization/employees`<br>`POST /api/v1/organization/employees/assignments`<br>`POST /api/v1/organization/operational-scopes`<br>`POST /api/v1/organization/responsibilities`<br>`POST /api/v1/organization/responsibilities/{assignmentId}/revoke` | Existing admin foundation; T33 current scope accepted. Pin and verify effectivity, revocation and admitted editor actions. |
| P6 | UXR-21 · Identity & Access · WS-14 `/administration/users` | Users, roles, permissions, access evaluation, profile, grants, lifecycle and LOCAL credential state. Handle explicit reasons and redaction. | Identity + security platform; Organization for employee link | C1 | `GET /api/v1/identity/users`<br>`GET /api/v1/identity/users/{id}`<br>`GET /api/v1/identity/users/{id}/lifecycle`<br>`GET /api/v1/identity/users/{id}/local-credential/state`<br>`GET /api/v1/identity/roles`<br>`GET /api/v1/identity/permissions`<br>`POST /api/v1/identity/permissions/evaluations`<br>`POST /api/v1/identity/users`<br>`POST /api/v1/identity/roles`<br>`POST /api/v1/identity/permissions`<br>`POST /api/v1/identity/users/{id}/activate`<br>`POST /api/v1/identity/users/{id}/deactivate`<br>`POST /api/v1/identity/users/permission-grants`<br>`POST /api/v1/identity/users/permission-grants/{id}/revoke`<br>`POST /api/v1/identity/roles/permission-grants`<br>`POST /api/v1/identity/roles/permission-grants/{id}/revoke`<br>`POST /api/v1/identity/users/role-grants`<br>`POST /api/v1/identity/users/role-grants/{id}/revoke`<br>`PUT /api/v1/identity/users/{id}/local-credential` | Existing admin contracts. Pin each enabled lifecycle and credential action with scope and safe input clearing. |
| P6 | UXR-22 · Network & Topology · Anchor `/network` | Regional map, layer explorer, region/feature filters, search, real geometry and counts, feature inspector. Map selection uses `properties.entityId`. | Topology, Identity, Organization | C1 | `GET /api/v1/topology/regional-map/layers`<br>`GET /api/v1/topology/regional-map/layers/{layerId}`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features/{entityId}`<br>`GET /api/v1/topology/regional-map/geojson`<br>`GET /api/v1/topology/regional-map/search`<br>`GET /api/v1/organization/responsibilities`<br>`GET /api/v1/identity/me/regional-access/{resourceKind}/{resourceId}`<br>`GET /api/v1/topology/map/layers`<br>`GET /api/v1/topology/map/geojson`<br>`GET /api/v1/topology/map/search` | T34 accepted in T39. Legacy map is existing but not a substitute for scoped C1. Standard/Satellite imagery is a provider choice. |
| P6 | UXR-22–23 · Connectivity, KP/elevation and facility views | Accept authored/published connectivity only from owner source. Render dossier sections, connections, equipment and declared elevations. Reuse F21 schematic and station 2D only within its synthetic preview acceptance until native sources are qualified. | Topology; Telemetry for overlays | C1 | `GET /api/v1/topology/engineering-networks/{draftId}/graph`<br>`GET /api/v1/topology/engineering-networks/{draftId}/authored-topology`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections/{sectionId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/connections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/equipment`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/baseline`<br>`GET /api/v1/topology/facilities/{facilityId}/station-graph/publications/current`<br>`GET /api/v1/topology/facilities/{facilityId}/station-graph/publications/history`<br>`GET /api/v1/telemetry/commissioning/points/{pointId}/effective`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history` | Dossier accepted for C1. Draft graph and station publication are separate from a complete native connectivity/synoptic contract. F22 remains blocked behind F16 ADMIT and owner-backed contracts. |
| P6 | UXR-23 · Dossier, baseline and pressure evidence | Pipeline facts, section detail, equipment and baseline receipts. Display design pressure and qualified operating limit independently with basis, condition, source/time and UNAVAILABLE/CONFLICT. | Topology, Identity, Organization; Integrity only where an admitted source participates | C1 | `GET /api/v1/topology/pipeline-dossiers/{pipelineId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections/{sectionId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/connections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/equipment`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/baseline`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/sections/{sectionId}` | T35/T36 accepted under T39. No inherited section limit or fallback from design pressure. |
| P6 | UXR-24 · Operational Monitoring · Anchor `/operations` | System/station/equipment selector, facility commissioned points, trusted latest/history, measured units, binding and age. Keep monitoring rules/deviations as separate owner panels. | Telemetry, Topology, Identity, Organization; Monitoring for optional panels | C1, C3 (optional) | `GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history`<br>`GET /api/v1/telemetry/points/{pointId}/readings/latest`<br>`GET /api/v1/telemetry/points/{pointId}/readings`<br>`GET /api/v1/telemetry/points/{pointId}/trend`<br>`GET /api/v1/monitoring/rules`<br>`GET /api/v1/monitoring/deviations` | T37 accepted in T39. Legacy point/rule panels exist. Native WEB discovery and freshness/paging evidence pending. Monitoring panels sit outside core C1. |
| P6 | UXR-24 · Station Synoptic and telemetry overlays | Bind diagram symbols and placements to explicitly qualified station revision and effective signal identity. Show unbound/stale/unavailable and disable control actions. | Topology, Telemetry | C1 | `GET /api/v1/topology/facilities/{facilityId}/station-graph/publications/current`<br>`GET /api/v1/topology/facilities/{facilityId}/station-graph/publications/history`<br>`GET /api/v1/telemetry/commissioning/points/{pointId}/effective`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history` | Partial. Station graph and effective readings exist. Accepted graph-to-signal placement/binding coverage is unestablished. Use bounded preview when missing. |
| P6 | UXR-25 · Integrity & Maintenance · WS-05 `/engineering` | Assessment, finding, evidence register and inspector. Open an admitted assessment from authorized scope or remain in standalone owner view. | Integrity; Topology for source-issued navigation | C1 | `GET /api/v1/workbench/integrity/resources`<br>`GET /api/v1/workbench/integrity/{resource}`<br>`GET /api/v1/workbench/integrity/{resource}/{id}`<br>`POST /api/v1/workbench/integrity/{resource}/search`<br>`POST /api/v1/integrity/assessments`<br>`GET /api/v1/integrity/findings/{findingId}/maintenance-handoffs/{approvalId}` | Owner workbench/assessment exist. T39 dossier alone does not prove a formal pipeline-to-Integrity join. |
| P6 | UXR-25 · Maintainable Assets `/engineering/assets` | Maintainable asset/condition/work-order registers, durable owner evidence, explicitly admitted Integrity-to-maintenance handoff. | Assets, Integrity; Topology only where referenced | C1, C3 | `GET /api/v1/workbench/assets/resources`<br>`GET /api/v1/workbench/assets/{resource}`<br>`GET /api/v1/workbench/assets/{resource}/{id}`<br>`POST /api/v1/workbench/assets/{resource}/search`<br>`POST /api/v1/assets/maintainable-assets`<br>`POST /api/v1/assets/asset-conditions`<br>`POST /api/v1/assets/maintenance-work-orders`<br>`POST /api/v1/assets/maintenance-work-orders/from-integrity`<br>`GET /api/v1/assets/maintenance-work-orders/{id}/integrity-history` | Existing WEB workbench/owner commands. Cross-owner maintenance is an adjacent C3 slice; pin the typed handoff before enabling it. |
| P6 | UXR-26 · Independent restriction review and publication | Submit exact candidate, find eligible Workflow/binding, start instance and task, load scoped actions, enforce independent decision and current version, then publish through owner and read back. | Topology, Workflow, Identity, Organization, Audit | C1 | `POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}`<br>`POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/publication`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence`<br>`GET /api/v1/workflow/definitions`<br>`POST /api/v1/workflow/instances`<br>`POST /api/v1/workflow/tasks`<br>`GET /api/v1/workflow/tasks`<br>`GET /api/v1/workflow/tasks/{id}`<br>`GET /api/v1/workflow/tasks/{id}/available-actions`<br>`GET /api/v1/workflow/instances/{id}`<br>`GET /api/v1/workflow/instances/{id}/timeline`<br>`POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/sections/{sectionId}` | T38/T39 signed backend acceptance exists. Native WEB author/reviewer/publisher flow, denial/409 and readback remain pending. |
| P6 | UXR-27 · Audit · WS-17 `/administration/audit` | Event explorer and trace inspector, legacy export request, T38 evidence and exact Audit witness IDs. Add separate eligible T28 export panel only for supported Risk events. | Audit, Topology; Risk for optional T28 | C1, C5 (optional) | `GET /api/v1/workbench/audit/resources`<br>`GET /api/v1/workbench/audit/{resource}`<br>`GET /api/v1/workbench/audit/{resource}/{id}`<br>`POST /api/v1/workbench/audit/{resource}/search`<br>`POST /api/v1/audit/exports`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence`<br>`GET /api/v1/audit/companies/{companyId}/facilities/{facilityId}/events`<br>`POST /api/v1/audit/companies/{companyId}/facilities/{facilityId}/exports`<br>`GET /api/v1/audit/companies/{companyId}/facilities/{facilityId}/exports/{exportId}`<br>`GET /api/v1/audit/companies/{companyId}/facilities/{facilityId}/exports/{exportId}/content` | T38 owner evidence supplies Audit handles without a separate search grant. T28 scoped export can return frozen bytes. Universal lookup/seal verification unestablished. |
| P6 | UXR-28 · Circle 1 native browser gate | Run signed synthetic journey in fresh PostgreSQL/API and native browser. Verify regional splits and revocation, exact joins, design/operating/trusted states, review/publication separation, audit and reload/restart. | Identity, Organization, Topology, Workflow, Audit, Integrity, Telemetry | C1 | `POST /api/v1/identity/authentication/login`<br>`POST /api/v1/identity/authentication/refresh`<br>`POST /api/v1/identity/authentication/logout`<br>`GET /api/v1/identity/me`<br>`GET /api/v1/organization/responsibilities`<br>`GET /api/v1/identity/me/regional-access/{resourceKind}/{resourceId}`<br>`GET /api/v1/topology/regional-map/layers`<br>`GET /api/v1/topology/regional-map/layers/{layerId}`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features/{entityId}`<br>`GET /api/v1/topology/regional-map/geojson`<br>`GET /api/v1/topology/regional-map/search`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections/{sectionId}`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/connections`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/equipment`<br>`GET /api/v1/topology/pipeline-dossiers/{pipelineId}/baseline`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/sections/{sectionId}`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history`<br>`GET /api/v1/workflow/tasks`<br>`GET /api/v1/workflow/tasks/{id}`<br>`GET /api/v1/workflow/tasks/{id}/available-actions`<br>`GET /api/v1/workflow/instances/{id}`<br>`GET /api/v1/workflow/instances/{id}/timeline`<br>`POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute`<br>`POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}`<br>`POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/publication`<br>`GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence` | T39 native HTTP/PG handoff accepted. Independent WEB gate pending. Cover Integrity owner panel separately where no formal cross-owner join exists. |

### P7 · Remaining approved workspaces

G7 · Layout adoption checked across 19 workspaces and two anchors.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P7 | UXR-29 · Alarm Console · WS-02 `/alarms` | Active/History, scoped list/count, severity/state/asset filters, alarm evidence and history. Qualify acknowledgement with exact company/FACILITY identity and durable readback. Shelf/close only where separately admitted. | Alarm; Identity, Organization, Topology; Monitoring only for linked evidence | C1, C4, C3 (optional) | `GET /api/v1/alarm/alarms`<br>`GET /api/v1/alarm/alarms/{id}`<br>`GET /api/v1/alarm/alarms/{id}/evidence`<br>`POST /api/v1/alarm/alarms/acknowledgements`<br>`GET /api/v1/alarm/alarms/{id}/shelvings`<br>`POST /api/v1/alarm/alarms/{id}/shelvings`<br>`POST /api/v1/alarm/alarms/{id}/shelvings/{shelvingId}/unshelve`<br>`POST /api/v1/alarm/alarms/closures`<br>`GET /api/v1/alarm/suppressions`<br>`POST /api/v1/alarm/suppressions`<br>`POST /api/v1/alarm/suppressions/{suppressionId}/release` | Existing API and WEB console. F16 whole-task remains HOLD; source route presence gives no command admission. Acknowledge, shelf and close carry distinct meanings. |
| P7 | UXR-29 · Incidents · WS-03 `/events` | Incident list, selected details, timeline, investigation/escalation context and source-linked evidence. | Incident; Alarm/LeakDetection where sent by source | C4 | `GET /api/v1/incident/incidents`<br>`GET /api/v1/incident/incidents/{id}`<br>`GET /api/v1/incident/incidents/{id}/timeline`<br>`GET /api/v1/incident/incidents/{id}/investigation`<br>`GET /api/v1/incident/incidents/{id}/escalation` | Owner reads exist; baseline WEB read adapter. Qualify evidence links individually. Investigation controls require owner scope. |
| P7 | UXR-29 · Leak Detection · WS-03 `/events` | Candidate evidence, cases and investigation; distinguish suspected event, qualified evidence and disposition. | LeakDetection | C4 | `GET /api/v1/leakdetection/candidates`<br>`GET /api/v1/leakdetection/candidates/{id}`<br>`GET /api/v1/leakdetection/candidates/{id}/evidence`<br>`GET /api/v1/leakdetection/cases`<br>`GET /api/v1/leakdetection/cases/{id}`<br>`GET /api/v1/leakdetection/cases/{id}/investigation` | Owner reads exist. Candidate evidence supports inspection. Confirmation or escalation follows admitted owner lifecycle. |
| P7 | UXR-29 · HSE · WS-03 `/events` | Case and CAPA views, evidence and selected facility history; preserve case and corrective-action status. | HSE; Incident on explicit evidence links | C4 | `GET /api/v1/hse/cases`<br>`GET /api/v1/hse/cases/{id}`<br>`GET /api/v1/hse/capas`<br>`GET /api/v1/hse/capas/{id}`<br>`GET /api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases/{caseId}/history`<br>`GET /api/v1/hse/companies/{companyId}/facilities/{facilityId}/cases/{caseId}/capas` | Owner records and scoped history exist. Qualify new cross-case links and any corrective-action writes independently. |
| P7 | UXR-29 · Planning · WS-04 `/planning` | Periods, plans/revisions and targets; review/approval with exact current revision and independent decision. Planned vs Actual only for matched time, unit, resource and qualified evidence. | Planning, Workflow; Telemetry/Monitoring for qualified actuals only | C1, C3 | `GET /api/v1/planning/periods`<br>`GET /api/v1/planning/operational-plans`<br>`GET /api/v1/planning/revisions`<br>`GET /api/v1/planning/revisions/{id}`<br>`GET /api/v1/planning/targets`<br>`GET /api/v1/planning/periods/{id}`<br>`GET /api/v1/planning/operational-plans/{id}`<br>`GET /api/v1/planning/targets/{id}`<br>`PATCH /api/v1/planning/revisions/{revisionId}`<br>`GET /api/v1/planning/revisions/{revisionId}/approval`<br>`POST /api/v1/planning/revisions/{revisionId}/submit`<br>`POST /api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute` | Typed reads/review exist. No general plan-to-actual contract inferred. Scope by company and qualify any new comparison on defined source data. |
| P7 | UXR-30 · Measurement Periods and Transfer Tickets · WS-06 `/custody` | First two local views. Use typed period, measurement and ticket records, revision, source quantities, transfer point, timestamps and historical Party snapshot. | Custody, Party; Topology only for an explicit transfer-point reference | C2, C3; C1 (linked) | `GET /api/v1/workbench/custody/resources`<br>`GET /api/v1/workbench/custody/{resource}`<br>`GET /api/v1/workbench/custody/{resource}/{id}`<br>`POST /api/v1/workbench/custody/{resource}/search`<br>`POST /api/v1/custody/measurement-periods`<br>`GET /api/v1/custody/measurement-periods/{periodId}`<br>`GET /api/v1/custody/measurement-periods/{periodId}/measurements/{measurementId}`<br>`POST /api/v1/custody/transfer-tickets`<br>`GET /api/v1/custody/transfer-tickets/{ticketId}`<br>`GET /api/v1/custody/transfer-tickets/{ticketId}/history` | Owner routes and WEB foundation exist. Exact period/ticket scope and immutable Party evidence require consumer qualification. |
| P7 | UXR-30 · Discrepancies, Reconciliation and Reference Context · WS-06 `/custody` | Remaining two local views. Show discrepancies and owner reconciliation; choose eligible Party reference in context. Preserve agreement and exact evidence when needed. | Custody, Party | C2, C3 | `GET /api/v1/workbench/custody/resources`<br>`GET /api/v1/workbench/custody/{resource}`<br>`GET /api/v1/workbench/custody/{resource}/{id}`<br>`POST /api/v1/workbench/custody/{resource}/search`<br>`POST /api/v1/custody/discrepancies`<br>`GET /api/v1/custody/discrepancies/{discrepancyId}`<br>`GET /api/v1/custody/measurement-periods/{periodId}/reconciliations`<br>`GET /api/v1/custody/reconciliations/{reconciliationId}`<br>`GET /api/v1/custody/reconciliations/{reconciliationId}/discrepancies`<br>`GET /api/v1/party/parties`<br>`GET /api/v1/party/reference/party-roles` | Owner records exist. Use Party `eligibleOnly` in the supported context. Gate reconciliation/finalization actions by exact accepted lifecycle. |
| P7 | UXR-31 · Risk Intelligence · WS-07 `/intelligence/risk` | Risk Registers, Risk Assessments, evidence inspector, qualified scores and decision history. Render score/matrix evidence only as owned. | Risk; Workflow/Audit for admitted governed decision and trace | C5; C1 (governance) | `GET /api/v1/workbench/risk/resources`<br>`GET /api/v1/workbench/risk/{resource}`<br>`GET /api/v1/workbench/risk/{resource}/{id}`<br>`POST /api/v1/workbench/risk/{resource}/search`<br>`POST /api/v1/risk/registers`<br>`POST /api/v1/risk/assessments`<br>`POST /api/v1/risk/evidence`<br>`GET /api/v1/risk/assessments/{id}`<br>`GET /api/v1/risk/assessments/{id}/decision-history` | Scoped owner data and typed commands exist. Domain-approved scoring/rules are required for authoritative matrix output. |
| P7 | UXR-31 · Analytics · WS-08 `/intelligence/analytics` | Datasets, Insights, Metric Definitions/Evaluations and recorded projections. Show backend results with units, lineage and quality. | Analytics; Monitoring for accepted deviation evidence | C5; C3 (linked) | `GET /api/v1/workbench/analytics/resources`<br>`GET /api/v1/workbench/analytics/{resource}`<br>`GET /api/v1/workbench/analytics/{resource}/{id}`<br>`POST /api/v1/workbench/analytics/{resource}/search`<br>`POST /api/v1/analytics/datasets`<br>`POST /api/v1/analytics/insights`<br>`POST /api/v1/analytics/metrics/evaluations`<br>`POST /api/v1/analytics/projections/runs`<br>`GET /api/v1/analytics/companies/{companyId}/facilities/{facilityId}/deviation-metric-runs/{runId}` | Metadata/execution contracts and bounded deviation metric result exist. Qualify exact metric and source. Global KPIs and prediction claims require separate evidence. |
| P7 | UXR-32 · Simulation · WS-09 `/intelligence/simulation` | Models, scenarios, runs, results and recommendations as provenance-bearing metadata. Preserve versioned scenario inputs and validation evidence. | Simulation; Topology/Telemetry only on explicit scenario/source links | C5; C1 (linked) | `GET /api/v1/workbench/simulation/resources`<br>`GET /api/v1/workbench/simulation/{resource}`<br>`GET /api/v1/workbench/simulation/{resource}/{id}`<br>`POST /api/v1/workbench/simulation/{resource}/search`<br>`POST /api/v1/simulation/models`<br>`POST /api/v1/simulation/scenarios`<br>`POST /api/v1/simulation/runs`<br>`POST /api/v1/simulation/recommendations`<br>`GET /api/v1/simulation/companies/{companyId}/pipeline-systems/{pipelineSystemId}/scenarios/{scenarioId}/revisions/{revision}`<br>`GET /api/v1/simulation/companies/{companyId}/pipeline-systems/{pipelineSystemId}/scenarios/{scenarioId}/revisions/{revision}/validation` | Metadata routes exist. Numerical steady/transient P3 and operational recommendations remain deferred. Queue metadata proves no computation. |
| P7 | UXR-32 · Reports · WS-10 `/intelligence/reports` | Definitions, Requests, Runs and Output Artifacts. Keep generic metadata separate from T25 governed report and supported scoped download. | Reporting; source owners on the selected report only | C5 + source Circle | `GET /api/v1/workbench/reporting/resources`<br>`GET /api/v1/workbench/reporting/{resource}`<br>`GET /api/v1/workbench/reporting/{resource}/{id}`<br>`POST /api/v1/workbench/reporting/{resource}/search`<br>`POST /api/v1/reporting/definitions`<br>`POST /api/v1/reporting/requests`<br>`POST /api/v1/reporting/runs`<br>`POST /api/v1/reporting/artifacts`<br>`POST /api/v1/reporting/companies/{companyId}/facilities/{facilityId}/report-requests`<br>`POST /api/v1/reporting/companies/{companyId}/facilities/{facilityId}/report-requests/{requestId}/render`<br>`GET /api/v1/reporting/companies/{companyId}/facilities/{facilityId}/report-runs/{runId}`<br>`POST /api/v1/reporting/companies/{companyId}/facilities/{facilityId}/report-runs/{runId}/seal`<br>`GET /api/v1/reporting/companies/{companyId}/facilities/{facilityId}/report-runs/{runId}/content` | T25 renders/seals supported scoped JSON and returns authorized bytes. Generic artifacts do not establish arbitrary PDF/CSV downloads. |
| P7 | UXR-33 · My Tasks · WS-11 `/work/tasks` | Assigned inbox, Details/Decisions/History, backend-provided allowed actions, expectedTaskUpdatedAt, reload and re-review on conflict. Reuse C1 pressure candidate flow where relevant. | Workflow; target owner | C1 + target Circle | `GET /api/v1/workflow/tasks`<br>`GET /api/v1/workflow/tasks/{id}`<br>`GET /api/v1/workflow/tasks/{id}/available-actions`<br>`GET /api/v1/workflow/instances/{id}`<br>`GET /api/v1/workflow/instances/{id}/timeline`<br>`POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute` | Existing typed WEB foundation. T39 proves the bounded pressure decision flow at API level. Additional target processes have separate admission. |
| P7 | UXR-33 · Notifications · WS-12 `/work/notifications` | Requests, Messages and Delivery Attempts evidence. Display bounded facility workflow inbox, detail and acknowledgement if admitted. | Notification, Workflow | C1, C4 | `GET /api/v1/workbench/notification/resources`<br>`GET /api/v1/workbench/notification/{resource}`<br>`GET /api/v1/workbench/notification/{resource}/{id}`<br>`POST /api/v1/workbench/notification/{resource}/search`<br>`GET /api/v1/notification/companies/{companyId}/facilities/{facilityId}/inbox`<br>`GET /api/v1/notification/companies/{companyId}/facilities/{facilityId}/inbox/{notificationId}`<br>`POST /api/v1/notification/companies/{companyId}/facilities/{facilityId}/inbox/{notificationId}/acknowledgement` | Generic read-only WEB evidence exists. T27 scoped acknowledgement exists. No global unread count, dismiss, resend or generic retry. |
| P7 | UXR-34 · Parties · WS-15 `/administration/parties` | Party Register/Eligible Parties, Profile/Roles/History inspector. Preserve distinct eligibility and immutable custody snapshots. | Party; Custody only at linked transfer context | C2; C3 (linked) | `GET /api/v1/party/parties`<br>`GET /api/v1/party/parties/{id}`<br>`GET /api/v1/party/parties/{id}/history`<br>`GET /api/v1/party/reference/party-roles`<br>`GET /api/v1/party/reference/party-types`<br>`POST /api/v1/party/parties`<br>`PUT /api/v1/party/parties/{id}`<br>`POST /api/v1/party/roles/assignments` | Published typed references and F11 foundation. Validate eligibility with query semantics and confirm protected mutations separately. |
| P7 | UXR-34 · Configuration · WS-16 `/administration/configuration` | Definitions, Environment Values and Boolean Feature Flags. Support admitted types and visibilities, time/version, source and redaction. | Configuration | C2 | `GET /api/v1/configuration/namespaces`<br>`GET /api/v1/configuration/definitions`<br>`GET /api/v1/configuration/definitions/{id}`<br>`GET /api/v1/configuration/values`<br>`GET /api/v1/configuration/effective`<br>`GET /api/v1/configuration/feature-flags`<br>`GET /api/v1/configuration/feature-flags/{id}/state`<br>`POST /api/v1/configuration/definitions`<br>`POST /api/v1/configuration/values`<br>`POST /api/v1/configuration/feature-flags`<br>`PUT /api/v1/configuration/feature-flags/{id}/state` | Typed reads and bounded editor exist. Preserve STRING/NUMBER/BOOLEAN, PUBLIC/INTERNAL and redaction boundaries of approved editor. Promotion/rollback require separate authority. |
| P7 | UXR-34 · Documents · WS-18 `/administration/documents` | Documents, Versions, Target Links, upload/download. Add controlled-document register/acceptance only for exact company/facility/document/version and checked links. | Documents; owner of the explicitly linked target | C2 + target Circle | `GET /api/v1/workbench/documents/resources`<br>`GET /api/v1/workbench/documents/{resource}`<br>`GET /api/v1/workbench/documents/{resource}/{id}`<br>`POST /api/v1/workbench/documents/{resource}/search`<br>`POST /api/v1/documents/documents`<br>`POST /api/v1/documents/document-versions/upload`<br>`GET /api/v1/documents/document-versions/{versionId}/content`<br>`POST /api/v1/documents/target-links`<br>`GET /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents`<br>`POST /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents`<br>`GET /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}`<br>`GET /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}/versions`<br>`GET /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}/links`<br>`POST /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}/versions/upload`<br>`GET /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}/versions/{versionId}/content`<br>`POST /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}/versions/{versionId}/accept`<br>`POST /api/v1/documents/companies/{companyId}/facilities/{facilityId}/controlled-documents/{documentId}/versions/{versionId}/supersede` | Legacy exact-version bytes and T24 controlled lifecycle exist. Admit their separate identifiers and grants. Verify MIME, size and checksum against owner data. |
| P7 | UXR-34 · Integrations · WS-19 `/administration/integrations` | Connectors, Job Runs, Dead Letters, Retry Attempts, Health Snapshots. Keep T26 replay a separately scoped synthetic exchange operation. | Integration | C3 | `GET /api/v1/workbench/integration/resources`<br>`GET /api/v1/workbench/integration/{resource}`<br>`GET /api/v1/workbench/integration/{resource}/{id}`<br>`POST /api/v1/workbench/integration/{resource}/search`<br>`GET /api/v1/integration/companies/{companyId}/facilities/{facilityId}/synthetic-exchanges/{exchangeId}`<br>`GET /api/v1/integration/companies/{companyId}/facilities/{facilityId}/synthetic-exchanges/{exchangeId}/attempts`<br>`POST /api/v1/integration/companies/{companyId}/facilities/{facilityId}/synthetic-exchanges/{exchangeId}/replay` | Current discovery-based monitoring evidence and bounded T26 route. Generic retry/restart and actual OT recovery remain outside the accepted scope. |
| P7 | UXR-35 · Overview · WS-01 `/overview` | Adopt authorized quick navigation first. Add attention, My Work or recent owner activity only with a named scope-safe owner list and clear provenance. | Identity, Workflow if My Work is enabled; other owner only on selected evidence | C1 + optional owner Circle | `GET /api/v1/identity/me/permissions`<br>`GET /api/v1/security/permissions/routes`<br>`GET /api/v1/security/permissions/catalog`<br>`GET /api/v1/identity/me/operation-capabilities`<br>`GET /api/v1/workflow/tasks` (conditional card) | Navigation page exists and needs no feature-specific API. Global protected KPI/count aggregation unestablished. |

### P8 · System-wide assurance and handover

G8 · Exact source/evidence pins, security, accessibility, performance and handover recorded.

| Phase | Task / component | Description of the task | HidraAPI modules | Circles touched | REST endpoints | Backend readiness |
|---|---|---|---|---|---|---|
| P8 | UXR-36 · Accessibility, keyboard and RTL | Verify focus order, escape/return, landmarks, no keyboard trap, overlays and drawers, pointer/touch, zoom/mobile and EN/FR/AR RTL across all views. | — | — | — | Frontend-local gate. Use representative status, chart, map, denial and overflow fixtures. |
| P8 | UXR-37 · Cross-principal security and errors | Same-grant different scopes, same-token revocation, direct links, cache/geometry/total leakage, redaction, binary scopes and durable denial/write checks. | Identity, Organization and all participating owners + security platform | C1–C5 | `POST /api/v1/identity/authentication/login`<br>`POST /api/v1/identity/authentication/refresh`<br>`POST /api/v1/identity/authentication/logout`<br>`GET /api/v1/identity/me`<br>`GET /api/v1/identity/me/permissions`<br>`GET /api/v1/security/permissions/routes`<br>`GET /api/v1/security/permissions/catalog`<br>`GET /api/v1/identity/me/operation-capabilities`<br>`GET /api/v1/organization/responsibilities`<br>`GET /api/v1/identity/me/regional-access/{resourceKind}/{resourceId}`<br> workspace-specific reads/writes above | T39 covers bounded API journey. Signed WEB and owner-specific outer-circle assurances remain required. |
| P8 | UXR-38 · Performance, stability and observability | Measure bounded map paging, cancellation, trend ranges, render/layout shifts, failure recovery and sanitized client diagnostics by route. | Topology, Telemetry, and participating data owners + realtime platform when used | C1–C5 as exercised | `GET /api/v1/topology/regional-map/layers`<br>`GET /api/v1/topology/regional-map/layers/{layerId}`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features`<br>`GET /api/v1/topology/regional-map/layers/{layerId}/features/{entityId}`<br>`GET /api/v1/topology/regional-map/geojson`<br>`GET /api/v1/topology/regional-map/search`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest`<br>`GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history`<br> owner-scoped collection routes above | Published paging exists. Browser evidence and agreed performance thresholds still need verification. No industrial SLA inferred. |
| P8 | UXR-39 · Final acceptance and handover | Check all seven families, ten header elements, six sidebar entries, 19 workspaces, two anchors and auxiliary routes. Record UI/API pins, proof, conditional gaps and handover. | All participating owners | C1–C5 | Contract matrix above | WEB layout and native assurances pending. Scope the release statement to completed development-software evidence. |

### Integration rules and acceptance evidence

| Dependency or acceptance point | Observable evidence |
|---|---|
| Current actor and regional discovery | Effective responsibility uses `assigneeType=EMPLOYEE` and the linked employee ID. T33 resource check uses exact resource kind/ID and `companyPartyId`. Prove same-grant actors have disjoint scope, cross-company and unlinked actors are denied, and the same bearer loses access on current grant/responsibility revocation. |
| Map → dossier → facility → point | Preserve `companyPartyId` across regional reads. Use GeoJSON `features[].properties.entityId` for pipeline selection. Preserve returned count/page semantics. Use section item IDs and the dossier equipment `facilityId` only when supplied. Query commissioned points with `FACILITY` where the fixture asserts that kind. No guessed identifiers, unscoped retries or client-side filtering of protected collections. |
| Pressure and observation provenance | Read T36 for explicit UTC `effectiveAt` and `conditionCode`. Keep pressure unit, gauge/absolute basis, exact source revision, interval and status. For T37, use `at` and `afterPointId` for discovery, and `from`, `until`, `maxAgeSeconds`, plus the paired `afterObservedAt` / `afterTrustedId` cursor for history. Preserve FRESH, STALE and UNAVAILABLE and keep source and quality visible. |
| Restriction decisions | Capture request/candidate/Workflow locator, exact reviewer action and `expectedTaskUpdatedAt`, then publish with current stream version and exact decision references. Show source-owned receipt and Audit witness IDs. Prove independent reviewer, stale or competing publication conflict, refresh/review and durable readback. |
| Files and governed evidence | Check exact authorized resource/version, media type, filename, size and digest where the owner supplies them. Verify denied cross-company/facility/target and stale access. T24 controlled documents, T25 scoped JSON, T28 audit bytes and T38 evidence have independent identifier and permission semantics. |
| Circle 1 browser evidence | Check the accepted runtime pin plus the [combined acceptance bundle](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/44999120757/artifacts/14745428477) and the credential-free T39 fixture receipt at execution. Record WEB SHA, API SHA/raw digest, native roles and test outcomes, with no HTTP interception in the signed test. Include focused Inspector/RTL/keyboard checks and UI recovery on 401, 403, opaque 404 and 409. |
| Delivery completion | Record scenario-specific preparation, source ownership, compatibility result and relevant code/browser checks per admitted task. Final coverage review accounts for 19/19 numbered workspace designs, 2/2 anchors, all shell families, and the distinct preview and native evidence. Industrial qualification, live SCADA and deferred numerical P3 remain separate. |

### Source references

- [HidraAPI canonical roadmap](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/33a0ec866496c04ba437c4017a5362192523c764/doc/roadmap/ROADMAP.md), [API AGENTS.md](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/33a0ec866496c04ba437c4017a5362192523c764/AGENTS.md) and [T39 consumer handoff](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/f0310330ae8eb58f8bf00400b29afeb5baccb869/doc/api/CIRCLE_1_CONSUMER_HANDOFF.md).
- [HidraWEB canonical roadmap](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/84538a585e81cb605f815abde259e3fbf5eeaf93/docs/roadmap/ULTIMATE_ROADMAP.md), [router](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/84538a585e81cb605f815abde259e3fbf5eeaf93/src/app/router/router.tsx), [navigation registry](https://github.com/CHOUABBIA-AMINE/HidraWEB/blob/84538a585e81cb605f815abde259e3fbf5eeaf93/src/shell/navigation/navigationRegistry.ts), and [current API consumer pins](https://github.com/CHOUABBIA-AMINE/HidraWEB/tree/84538a585e81cb605f815abde259e3fbf5eeaf93/openapi).
- **HidraWEB_Layout_Implementation_Roadmap_2026-11-22.md** supplied P0–P8, UXR-01–39 and design-to-task ownership. **HidraWEB_Comprehensive_Discussion_Synthesis_2026-11-20(1).md** supplied the approved layout, workspace views and component rules.
- **HidraWEB_Circle_1_Readiness_Assessment_and_Gap_Closure_Roadmap_2026-11-22.md** supplied the C1 journeys and scope cut. **HidraAPI_Architecture_Gaps_Circles_Synthesis_2026-11-22.docx** supplied the 24-module Circle classification and engineering-source semantics.

---

## P0 / UXR-01 — approved-scope reconciliation execution record

**Recorded:** 22 November 2026. **Owner selection:** “HidraWEB start implementing P0 / UXR-01”. The 22 November adoption statement above is preserved as the historical *not-yet-selected* snapshot; this later entry registers **UXR-01 only**. The other UXR aliases remain planning candidates, not blanket implementation authority.

| Execution field | Registered UXR-01 disposition |
|---|---|
| Whole task / parent | **P0 / UXR-01 · Reconcile approved scope**; one indivisible documentation/reconciliation task, no suffix or child package |
| Bounded context | Frontend product information architecture, layout inventory, navigation/scope reconciliation; all 24 HidraAPI modules are inventory dependencies across C1–C5, not new backend work |
| Input baseline | HidraWEB main `fe976e5bb994ba8e9ebf2d9f8554901f8fbabbc2`, tree `c4aabd952a01e6572ef4442a05e4c03644957c02`, canonical roadmap, canonical information architecture and checked-in router/shell/navigation; adopted T39 API evidence is **referenced**, not newly re-certified |
| Preconditions | 22 November owner-adopted roadmap and explicit UXR-01 selection; no F16 admission or numerical simulation required for an inventory-only review |
| Exact file allowlist | **UPDATE ONLY** `docs/roadmap/ULTIMATE_ROADMAP.md`; preserve all historical sections, registered statuses, source, tests, OpenAPI pins, workflows and preview |
| Exact commit message | `docs(roadmap): reconcile UXR-01 approved layout scope` |
| Acceptance | Record 7 page/layout patterns, 10 header elements, 6 sidebar groups, 19 numbered workspaces and 2 unnumbered operational anchors; reconcile auxiliary routes, existing code, delivery gaps and prior HWEB obligations; preserve gating; documentation validator must run against the new exact SHA |
| State | **IMPLEMENTED — documentation CI pending at publication**, not runtime-verified or product-accepted by this record |
| Next task candidate | **P0 / UXR-02**, not selected; requires its own exact OpenAPI/permissions/DTO pin and admission before code changes |

### Frozen design-to-source inventory

The **seven layout families** below use the seven named page patterns in `docs/architecture/HidraWeb-Information-Architecture.md`, crosswalked to the current source. These are presentation patterns, not seven additional browser routes. Existing pages show implementation footprints; adoption of the common component contract remains planned in P4/P5/P7.

| Layout family | Current source examples | Reconciliation / remaining obligation |
|---|---|---|
| Operational Overview | src/app/pages/OverviewPage.tsx; src/features/telemetry-monitoring/TelemetryMonitoringPage.tsx | Existing screens; approved common frame and owner-scoped summary remain UXR-12/13/35. |
| Workbench List | src/features/workbench/OperationalWorkbenchPage.tsx | Existing secondary workbench; reusable authorized registers remain UXR-17. |
| Entity Workspace | src/features/custody/CustodyWorkspacePage.tsx; src/features/topology/NetworkTopologyPage.tsx | Existing domain screens; standardized heading, selection and owner evidence remain UXR-12–16. |
| Topology Workspace | src/features/topology/NetworkTopologyPage.tsx | Existing map and topology source; native Circle 1 qualification remains UXR-22–28. |
| Alarm Console | src/features/alarm/AlarmConsolePage.tsx | Existing console; whole-task HWEB-F16 native alarm gate remains HOLD. |
| Task Workspace | src/features/workflow/WorkflowTasksPage.tsx | Existing tasks route; integrated restriction decision remains UXR-26/28. |
| Timeline / Evidence | src/features/assets/AssetHistoryTimeline.tsx; src/features/incident/IncidentWorkspacePage.tsx | Existing evidence presentations; shared provenance/timeline pattern remains UXR-15. |

The **ten permanent Global Header elements** are crosswalked to `src/shell/navbar/HidraNavbar.tsx`; component existence does not assert the associated global workflow or backend authority.

| # | Approved element | Current source | Observed boundary / delivery |
|---|---|---|---|
| 1 | Sidebar toggle | HidraNavbar + AppShell | Present; collapsible navigation. |
| 2 | Product identity / home | HidraNavbar | Present as Hidra; target HyFlo presentation alignment is not claimed. |
| 3 | Environment indicator | HidraNavbar; runtimeConfig | Present label; not an availability signal. |
| 4 | Operational context | OperationalContextSelector | Present; exact principal/scope refresh and revocation require UXR-09 qualification. |
| 5 | Global search | HidraNavbar | Disabled placeholder; UXR-11; do not invent cross-domain search. |
| 6 | Connection status | HidraNavbar; useRealtimeStatus | Status chip present; business-event freshness not established; UXR-10. |
| 7 | My Tasks shortcut | HidraNavbar | Disabled icon; task page route exists; UXR-10. |
| 8 | Notifications shortcut | HidraNavbar | Disabled icon; notification page route exists; UXR-10. |
| 9 | Language selector | HidraNavbar | FR/EN/AR selection present; full RTL/accessibility qualification UXR-04/36. |
| 10 | Principal/profile/sign-out | HidraNavbar; AuthProvider | Profile and sign-out present; session/provider behavior remains subject to actual auth gates. |

The **six sidebar groups**, including the Overview root group, are verified against `src/shell/navigation/navigationRegistry.ts` and `src/shell/sidebar/HidraSidebar.tsx`. They contain current, permission-filtered navigation items; the registered sidebar is still flat, not a delivered nested mobile navigation tree. Expanded/collapsed widths in source are 272/72 px.

| Group | Current registry ID | Current destinations | Current comparison |
|---|---|---|---|
| Overview | root | /overview | Single root item present. |
| Operations | operations | /network, /operations, /alarms, /events, /planning | Five entries present. |
| Engineering | engineering | /engineering, /custody | Two primary entries; /engineering/assets is separately routed. |
| Intelligence | intelligence | /intelligence/risk, /intelligence/analytics, /intelligence/simulation, /intelligence/reports | Four entries present. |
| Work | work | /work/tasks, /work/notifications | Two entries present. |
| Administration | administration | /administration/organization, /administration/users, /administration/parties, /administration/configuration, /administration/audit, /administration/documents, /administration/integrations | Seven entries present; Parties is an existing addition to older IA. |

The **19 numbered workspaces** below are a stable product inventory, **not 19 accepted UXR features**. Each referenced route exists in `src/app/router/router.tsx` at the pinned source. A routed screen, an existing historical HWEB acceptance, a generated client and a new UXR workflow are different evidence levels.

| Workspace | Approved workspace | Current browser route(s) | Future task / qualification |
|---|---|---|---|
| WS-01 | Overview | /overview | UXR-35 |
| WS-02 | Alarm Console | /alarms | UXR-29; F16 HOLD |
| WS-03 | Events / Incidents / Leak / HSE | /events | UXR-29 |
| WS-04 | Planning | /planning | UXR-29 |
| WS-05 | Integrity & Maintenance | /engineering; /engineering/assets | UXR-25 |
| WS-06 | Metering & Custody | /custody | UXR-30 |
| WS-07 | Risk | /intelligence/risk | UXR-31 |
| WS-08 | Analytics | /intelligence/analytics | UXR-31 |
| WS-09 | Simulation metadata | /intelligence/simulation | UXR-32; solver/P3 deferred |
| WS-10 | Reporting | /intelligence/reports | UXR-32 |
| WS-11 | My Tasks | /work/tasks | UXR-33 |
| WS-12 | Notifications | /work/notifications | UXR-33 |
| WS-13 | Organization | /administration/organization | UXR-21 |
| WS-14 | Identity & Access | /administration/users | UXR-21 |
| WS-15 | Parties | /administration/parties | UXR-34 |
| WS-16 | Configuration | /administration/configuration | UXR-34 |
| WS-17 | Audit | /administration/audit | UXR-27 |
| WS-18 | Documents | /administration/documents | UXR-34 |
| WS-19 | Integrations | /administration/integrations | UXR-34 |

The **two operational anchors** are separate from the 19 numbered workspaces; do not double-count them as WS-20/21.

| Anchor | Current browser route | Code / owner task | Current comparison |
|---|---|---|---|
| Network & Topology | /network | NetworkTopologyPage; UXR-22/23; historical HWEB-005 | Route implemented; native dossier/overlay/readback remain unqualified. |
| Operational Monitoring | /operations | TelemetryMonitoringPage; UXR-24; historical HWEB-006 | Route implemented; trusted, scope-safe native monitoring journey remains unqualified. |

**Auxiliary and preserved surfaces** must not be dropped when reworking the approved shell.

| Route / surface | Purpose | Disposition |
|---|---|---|
| / | Root redirects to /overview | Existing, authenticated via AppShell. |
| /login | LOCAL/provider entry | Existing; keep original auth gate. |
| /auth/callback | OIDC callback | Existing; configure external provider before asserting enterprise acceptance. |
| /workbench | Secondary generic workbench | Existing, deliberately not a primary sidebar destination. |
| * | Authenticated Not Found fallback | Existing wildcard; do not turn missing feature into success. |
| preview/network/ | Standalone F21 synthetic six-view preview | Separate from product router; owner-accepted synthetic preview, not native telemetry or solver. |

### Registered-overlap and sequencing disposition

| Existing governance / prior implementation | Reconciled decision |
|---|---|
| HWEB-R01–R17 and HWEB-P01–P12 historical completions; HWEB-001–015 historical source and CI | Preserve as historical evidence. No reopen, relabel, retroactive approval or deletion under UXR-01. |
| HWEB-F16 (whole alarm contract and native operator qualification) | **HOLD / NOT ADMITTED**. UXR-10 and UXR-29 do not split or bypass this single registered task. Alarm route presence is not authorization to acknowledge/shelve/close. |
| HWEB-F21 synthetic six-view preview | **Owner-accepted synthetic preview only**. Retain independent preview and its existing six-view evidence; do not claim native map, qualified hydraulic results, live OT, or numerical solver. |
| HWEB-F22 native six-view expansion | **BLOCKED** on F16 admission and accepted backend/native scope; UXR-22/23 cannot silently activate it. |
| Existing product routes, Orval clients, security and CI | Leave unchanged. Subsequent UXR tasks must qualify accepted contracts, authorized scopes, error/denial behavior, tests and exact-SHA CI individually. |
| Owner-adopted sequence | **P0/UXR-01 → candidate UXR-02 → P1 → P2 → P3 → P4 → P5 → gated P6 → gated P7 → P8**; each whole UXR task needs separate selection. No blanket admission of a phase. |
| Independent Circle 1 ahead of HWEB-F16 | **NOT AUTHORIZED BY UXR-01**. Such work may be prepared and sequenced independently only after a separately recorded owner sequencing decision and its own backend/WEB gate; keep F16 HOLD in the meantime. |
| API scope and simulation | UXR-01 is read-only inventory, **no REST operations or source changes**. No new runtime OpenAPI validation, T39 regression, station actuation, SCADA connectivity or numerical P3 inference. |

### Evidence, limitations and acceptance gates

- **Verified by exact-SHA source inspection:** `src/app/router/router.tsx`, `src/shell/AppShell.tsx`, `src/shell/navbar/HidraNavbar.tsx`, `src/shell/sidebar/HidraSidebar.tsx`, `src/shell/navigation/navigationRegistry.ts`, `docs/architecture/HidraWeb-Information-Architecture.md` and this canonical roadmap at `fe976e5bb994ba8e9ebf2d9f8554901f8fbabbc2`. The shell has a skip link, authenticated/permission-bootstrap outlet, navigation, navbar and contextual drawer.
- **Deterministic prepublication reconciliation checks:** cardinalities 7/10/6/19/2; all 19 current route declarations; two anchor route declarations; six registry group IDs; seven canonical page patterns; shell/header/sidebar source cues; preserved F16/F21/F22 and P0 owner-adopted statements. These checks inspect source text; they are not browser E2E tests.
- **Actual gaps, not defects to silently fix here:** global search, header task and notification icons are disabled; the legacy nav remains flat; source names the product “Hidra” despite recorded HyFlo presentation direction; newer scope-sensitive header, responsive, RTL, provenance and Circle 1 journeys require their registered implementation/acceptance work. No unverified route is described as fully production-ready.
- **Source limitations:** the 20/22 November external design attachment filenames are cited in the adopted roadmap, but their original bytes were not re-opened as part of this GitHub source review. This record reconciles the **owner-adopted summary**, canonical IA and live source, not an independent line-by-line certification of those external files. No new backend OpenAPI download or industrial deployment evidence was acquired.
- **Publication gate:** one guarded direct-`main` documentation commit with the exact message and single-file allowlist above, followed by an exact-SHA **HidraWEB Documentation Validation** run observed queued/started. Do not claim the run has passed before it completes. Code CI is not expected for Markdown-only changes.
- **Completion gate:** UXR-01 may be promoted from IMPLEMENTED to VERIFIED only after the applicable documentation CI succeeds and any owner-required design walkthrough/attachment check is accepted. Do not automatically start UXR-02.

---

## P0 / UXR-02 — T39 API handoff qualification

**Registered:** 22 November 2026. **Selection:** owner “next” immediately after P0 / UXR-01. This is **one whole P0 documentation/contract-reconciliation task**, not a source implementation or a split of HWEB-F16. The preceding UXR-01 commit `6ea41eb9a425b933a4d55e5f72eae79e662071e5` has [HidraWEB Documentation Validation #87 success](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45015618070). The prior P0 UXR-01 recorded caveat about independent original-attachment walkthrough remains preserved.

| Execution control | UXR-02 bounded registration |
|---|---|
| Exact task | **P0 / UXR-02 · Qualify API handoff** |
| Owner selection | This “next” authorizes UXR-02 only; UXR-03 and native consumer feature work are NOT selected |
| Baselines | HidraWEB `6ea41eb9a425b933a4d55e5f72eae79e662071e5`, tree `db4b9500a2e75933516799fe65fe5093601e8883`; HidraAPI T39 `f0310330ae8eb58f8bf00400b29afeb5baccb869`; observed current API main `33a0ec866496c04ba437c4017a5362192523c764` is a distinct release-alignment head |
| Exact allowlist | **UPDATE ONLY** `docs/roadmap/ULTIMATE_ROADMAP.md` (this append-only evidence and task record) |
| Commit message | `docs(roadmap): qualify UXR-02 T39 API handoff` |
| Non-scope | No generated client, Orval input, compatibility manifest, runtime API, permission, TypeScript source, workflow, fixtures, CI workflow, backend code or production environment mutation |
| Acceptance | Capture exact T39 CI-artifact/raw JSON/fixture receipt, check 31 handoff operations, inventory all 21 checked-in Orval slice inputs, identify required transport/schema/permission/security qualification and missing consumer pins without claiming native frontend acceptance |
| Evidence state | **DOCUMENTED / BACKEND EVIDENCE VERIFIED; CONSUMER RE-PIN NOT VERIFIED**. Documentation CI pending on publication; do not label native Circle 1 implementation complete. |
| Next proposed execution | P1 / UXR-03 **only after** this source qualification is accepted and the actual API-client pin/gap work is independently admitted to the relevant consumer task; no automatic task advance |

### A. Immutable T39 backend artifact and signed synthetic evidence

| Evidence | Verified value / limit |
|---|---|
| Accepted backend implementation | [`f0310330ae8eb58f8bf00400b29afeb5baccb869`](https://github.com/CHOUABBIA-AMINE/HidraAPI/commit/f0310330ae8eb58f8bf00400b29afeb5baccb869) |
| T39 CI | [HidraAPI CI #1358 attempt 2](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/44999120757/attempts/2), completed **success** on the same source SHA |
| OpenAPI archive | [GitHub Actions artifact 14745595446](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/44999120757/artifacts/14745595446), `hidra-api-openapi-f0310330ae8eb58f8bf00400b29afeb5baccb869-44999120757-1-api-contract` |
| Actual ZIP SHA-256 | `afff2538c0c454635d3e2227ed1df94c6afc57640465d555d6e0e80dca006c86`, matched artifact digest; **not** the raw JSON digest |
| ZIP member / raw JSON SHA-256 | `hidra-api.json` / `386858e3a3e7c78180cdb2d97a58102b973a22bcd723f5ad2ca29c33aaf20bbe`; independently recomputed from 1,170,060 extracted bytes |
| OpenAPI coverage | OpenAPI 3.1.0; **491** path objects, **536** method operations, **586** component schemas |
| Full verification artifact | [Artifact 14745428477](https://github.com/CHOUABBIA-AMINE/HidraAPI/actions/runs/44999120757/artifacts/14745428477), ZIP SHA-256 `71cdd4b9575152ee3539f4f8fb883ab3778f5bb9ae9c9ff48e6b703d7023425e`, matched GitHub digest |
| Gate receipt | `gate.json`: T39 source SHA, run `44999120757`, attempt 2; 611 classes, 4,563 tests, **0 failures, 0 errors, 0 skips**. This is development/partitioned evidence, not independent production/site acceptance. |
| Credential-free GZ2 fixture receipt | Full evidence shard-1 Surefire XML `TEST-dz.sh.hidra.qualification.Gz2SignedWorkflowNativeHttpPostgresIntegrationTest.xml`; one passing test and one `HIDRA_CIRCLE1_HANDOFF_V1` JSON line inside nested `system-out`. Canonical JSON (UTF-8; keys sorted; no whitespace) SHA-256: `0328beeb85ac87fc56aad0ab8083d9f8c87fce4cb48b7f188d917194b50d3f86`. |
| Fixture structure and assertions | `version=1`; role labels `foreign,sibling,author,primary,reviewer,revoked`; linked company/pipeline/section/facility scope; exact source/observation/pressure evidence and workflow binding/decision/restart evidence. Eight checks: scoped-map, same-token-revocation, map-dossier-facility-join, design-vs-qualified-limit, trusted-fresh-stale-unavailable, workflow-vs-publication, scope-safe-evidence, independent-restart. Synthetic fixture identifiers are not fixed deployment identities. |
| Boundary | These are **backend contract and test receipts**. There is no new HidraWEB native signed browser replay and no full external enterprise/OT qualification in this UXR-02 task. |

The **immutable transport pin** for proposed frontend admission is the T39 raw JSON SHA-256 above plus its exact CI run/artifact/source. This is a *documentation/evidence pin*, **not** a substitution of the checked-in `openapi/compatibility/hidra-api-baseline.json` or a new generated Orval client. Do not claim that the existing frontend build validates against T39 until a separately authorized, exact digest-verified consumer update runs.

### B. All checked-in feature-client contract inputs (source inventory)

The source baseline contains **21 Orval configuration files** `orval.<slice>.config.ts` (excluding the unpinned full `orval.config.ts`) and their existing checked-in candidate JSON inputs. A clean checkout intentionally omits committed generated TypeScript files under `src/api/generated/`; the build generates them from these configured inputs. Each row below was reopened and its source JSON parsed at the exact HidraWEB SHA above.

| Orval slice | Existing candidate API SHA | Paths | Methods | Schemas | T39 consumer status |
| --- | --- | --- | --- | --- | --- |
| `alarm` | `76b14cda4520…` | 13 | 16 | 11 | **NOT RE-PINNED** |
| `analytics` | `76b14cda4520…` | 9 | 9 | 8 | **NOT RE-PINNED** |
| `assets` | `76b14cda4520…` | 8 | 8 | 7 | **NOT RE-PINNED** |
| `audit` | `76b14cda4520…` | 7 | 7 | 6 | **NOT RE-PINNED** |
| `configuration` | `f1fdc206c916…` | 13 | 17 | 14 | **NOT RE-PINNED** |
| `custody` | `da4ce33ead7d…` | 7 | 7 | 6 | **NOT RE-PINNED** |
| `documents` | `76b14cda4520…` | 9 | 9 | 7 | **NOT RE-PINNED** |
| `hse` | `da4ce33ead7d…` | 9 | 11 | 9 | **NOT RE-PINNED** |
| `identity-organization` | `720e9222b30f…` | 59 | 65 | 62 | **NOT RE-PINNED** |
| `incident` | `da4ce33ead7d…` | 8 | 9 | 6 | **NOT RE-PINNED** |
| `integrity` | `76b14cda4520…` | 7 | 7 | 6 | **NOT RE-PINNED** |
| `leak` | `da4ce33ead7d…` | 9 | 11 | 9 | **NOT RE-PINNED** |
| `party` | `18e7a7596aea…` | 11 | 13 | 9 | **NOT RE-PINNED** |
| `planning` | `d14c44fc527e…` | 16 | 18 | 20 | **NOT RE-PINNED** |
| `reporting` | `76b14cda4520…` | 9 | 9 | 8 | **NOT RE-PINNED** |
| `risk` | `81d46bcb8bc8…` | 10 | 10 | 9 | **NOT RE-PINNED** |
| `simulation` | `76b14cda4520…` | 9 | 9 | 8 | **NOT RE-PINNED** |
| `telemetry-monitoring` | `da4ce33ead7d…` | 17 | 19 | 16 | **NOT RE-PINNED** |
| `topology` | `f1fdc206c916…` | 58 | 69 | 113 | **NOT RE-PINNED** |
| `workbench` | `016d972725ac…` | 9 | 9 | 4 | **NOT RE-PINNED** |
| `workflow` | `5817406923e5…` | 14 | 15 | 17 | **NOT RE-PINNED** |

**Reconciliation outcome:** all 21 configured inputs are **older than the T39 accepted implementation**. They are not 21 independent T39 acceptances; the previously accepted GitHub Code CI only qualifies its own checked-in baseline and accepted source. `openapi/compatibility/hidra-api-baseline.json` currently names `c72eae39cab0b1ec1e20654386fe95ed43b134ab`, artifact `11955308898`, full-spec SHA-256 `547570323f48a2c4cfb33740cb579f3fe464af85bb43f0596cf819e935580fe7` and `expectedOrvalContracts: 21`. It must not be silently rewritten without placing corresponding T39 bytes and checking every consumed route/schema with regeneration, lint, typecheck, unit, performance, build and browser tests. Prior 21-slice compatibility against an older baseline is not a T39 result.

### C. T39 Circle 1 route and DTO handoff inventory

The 31 advertised [T39 Circle 1 consumer handoff](https://github.com/CHOUABBIA-AMINE/HidraAPI/blob/f0310330ae8eb58f8bf00400b29afeb5baccb869/doc/api/CIRCLE_1_CONSUMER_HANDOFF.md) method/path pairs were matched against **the downloaded raw T39 JSON**: **31/31 method/path entries exist**. The type names below come from the backend handoff, not handwritten frontend transport DTOs; the named source DTO is not necessarily present as a generated successful response schema.

| Owner | T39 method and path | Source DTO or response type |
| --- | --- | --- |
| Identity | `POST /api/v1/identity/authentication/login` | AuthenticationLoginRequest → AuthenticationLoginResponse |
| Regional access | `GET /api/v1/identity/me/regional-access/{resourceKind}/{resourceId}` | RegionalAccessResponse |
| Telemetry | `GET /api/v1/telemetry/assets/{assetType}/{assetId}/points` | CommissionedPointsView |
| Telemetry | `GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/history` | ObservationHistoryView |
| Telemetry | `GET /api/v1/telemetry/assets/{assetType}/{assetId}/points/{pointId}/trusted-readings/latest` | LatestObservationView |
| Operating constraints | `GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}` | QualifiedOperatingConstraintView |
| Operating constraints | `POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests` | PressureRestrictionSubmission → PressureRestrictionRequest |
| Operating constraints | `GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}` | PressureRestrictionRequest |
| Operating constraints | `GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/evidence` | PressureRestrictionDecisionEvidence |
| Operating constraints | `POST /api/v1/topology/operating-constraints/pipelines/{pipelineId}/restriction-requests/{requestId}/publication` | PressureRestrictionPublicationCommand → PressureRestrictionPublicationReceipt |
| Operating constraints | `GET /api/v1/topology/operating-constraints/pipelines/{pipelineId}/sections/{sectionId}` | QualifiedOperatingConstraintView |
| Pipeline dossier | `GET /api/v1/topology/pipeline-dossiers/{pipelineId}` | PipelineView |
| Pipeline dossier | `GET /api/v1/topology/pipeline-dossiers/{pipelineId}/baseline` | BaselineView |
| Pipeline dossier | `GET /api/v1/topology/pipeline-dossiers/{pipelineId}/connections` | ConnectionsPage |
| Pipeline dossier | `GET /api/v1/topology/pipeline-dossiers/{pipelineId}/equipment` | EquipmentPage |
| Pipeline dossier | `GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections` | SectionsPage |
| Pipeline dossier | `GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections/{sectionId}` | SectionView — source-defined; 2xx schema absent |
| Regional map | `GET /api/v1/topology/regional-map/geojson` | FeatureCollection |
| Regional map | `GET /api/v1/topology/regional-map/layers` | LayerDescriptor[] |
| Regional map | `GET /api/v1/topology/regional-map/layers/{layerId}` | LayerDescriptor — source-defined; 2xx schema absent |
| Regional map | `GET /api/v1/topology/regional-map/layers/{layerId}/features` | FeatureCollection |
| Regional map | `GET /api/v1/topology/regional-map/layers/{layerId}/features/{entityId}` | Feature — source-defined; 2xx schema absent |
| Regional map | `GET /api/v1/topology/regional-map/search` | SearchResult |
| Workflow | `GET /api/v1/workflow/definitions` | Definition[] |
| Workflow | `POST /api/v1/workflow/instances` | StartWorkflowInstanceRequest → WorkflowInstanceResponse |
| Workflow | `GET /api/v1/workflow/instances/{id}` | InstanceView |
| Workflow | `GET /api/v1/workflow/instances/{id}/timeline` | TimelineEntry[] |
| Workflow | `POST /api/v1/workflow/tasks` | CreateWorkflowTaskRequest → WorkflowTaskResponse |
| Workflow | `GET /api/v1/workflow/tasks/{id}` | TaskView |
| Workflow | `GET /api/v1/workflow/tasks/{id}/available-actions` | AvailableActionView[] |
| Workflow | `POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute` | ExecuteWorkflowTransitionRequest → WorkflowTransitionExecutionResponse |

**Machine-contract exceptions:** the T39 generated 2xx operation descriptions omit a usable success schema for `GET /api/v1/topology/pipeline-dossiers/{pipelineId}/sections/{sectionId}`, `GET /api/v1/topology/regional-map/layers/{layerId}` and `GET /api/v1/topology/regional-map/layers/{layerId}/features/{entityId}`. The handoff supplies `SectionView`, `LayerDescriptor` and `Feature` respectively as **source-defined response types**; this does *not* prove Orval-generated typed response bindings on those operations. Preserve explicit boundary normalization or request a backend contract correction in the responsible scope. Do not silently cast responses as verified.

**Other T39-authentication/organization endpoints in the adopted UXR-02 row** were separately inspected in the raw runtime spec: `POST /api/v1/identity/authentication/refresh` and `POST /api/v1/identity/authentication/logout` use `RefreshTokenRequest`; successful login/refresh is `AuthenticationLoginResponse`, logout is 204 with no response body. `GET /api/v1/identity/me` returns `PrincipalView`; `GET /api/v1/identity/me/permissions` carries an inline 2xx schema; `GET /api/v1/organization/responsibilities` accepts `scopeId`, `assigneeType`, `assigneeId` filters. These routes are **T39-present** but are not thereby wired into the currently pinned web authentication/organization clients.

### D. Authorization, temporal and response acceptance gates

- **Identity and regional scope:** a signed Hidra bearer is required for protected reads. `identity:me:read` plus current regional authority for the selected resource is not a global company grant. Map/dossier require `topology:regional-resource:read` and specific `topology:regional-map:read/search` or `topology:pipeline-dossiers:read`. Server-side denial/opaque 404 takes precedence over a visible widget; never disclose unauthorized counts, geometry or identifiers in cache.
- **Physical joins:** map `properties.entityId` identifies the pipeline dossier, not the namespaced outer feature ID; use dossier-owned section IDs and the explicitly returned facility ID for Telemetry. Keep `companyPartyId` and resource scope coherent across these reads. Geometry coordinates and feature counts come only from the source.
- **Qualified pressure:** `GET` constraint uses `conditionCode` and UTC `effectiveAt`; distinguish design pressure from qualified operating limit, with units/basis/source revision and time. `UNAVAILABLE` and `CONFLICT` must not be rendered as safe numeric pressure; pipeline and section constraints are independently resolved.
- **Trusted observation:** `telemetry:assets:read`, current asset scope and commissioned source-point authority apply. Point discovery uses UTC `at` and exclusive `afterPointId`; history uses half-open `[from,until)`, `maxAgeSeconds`, paired `afterObservedAt/afterTrustedId`, and returned quality/source/unit. Distinguish FRESH, STALE and UNAVAILABLE, and never infer live OT actuation.
- **Governed restriction:** backend application ownership and permission checks include `topology:operating-constraints:read/execute`, and task-specific `topology:pressure-restriction:submit/review/publish/evidence-read` where applicable. Workflow uses current task, independent eligible actor, exact candidate and transition, expected stream version, and durable publication/evidence readback. An approved Workflow action alone is not an effective Topology publication.
- **Error/concurrency semantics:** 400 validation, 401 unauthenticated, 403 denied, masked 404, 409 stale/conflicting/reused decision; unknown write outcome cannot be represented as confirmed rejection. Respect backend `Cache-Control: private, no-store` on protected records and clear context-sensitive UI state on changed authorization.

### E. Explicit unsupported/unverified frontend consumption

| Contract area | T39 backend fact | HidraWEB at the inspected baseline | Delivery gate |
|---|---|---|---|
| Login/refresh/logout, regional access | Present in raw T39; source-defined request/response schemas and access rules | Existing authentication transport predates T39 and current general compatibility pin is older | Qualify provider/session state, exact DTO, current-region check, revoked-token 401/403 and no credential disclosure before enabling new flow |
| Regional map + pipeline dossier + constraints | Handed off and 31/31 Circle 1 route existence validated | Existing Topology client points to `f1fdc206c916…`, not T39; F21 is synthetic preview | New accepted slice, spatial/dossier joins, tenant-safe queries and three response-schema exceptions before native Circle 1 UX |
| Trusted asset observations | Present in T39 + signed disposable PostgreSQL evidence | Existing Telemetry/Monitoring client points to `da4ce33ead7d…` | Qualify binding/quality/UTC/cursor/permissions and native browser readback |
| Workflow and restriction publication | Present with source version, current action and human review boundaries | Existing Workflow client points to `5817406923e5…`; old alarms remain F16 HOLD | Qualify exact Workflows/Topology invocation, actor independence, replay, conflict and audit; no automatic actuation |
| Other 17 candidate slices | Checked-in source contracts inventory is recorded above | Current candidate pins are older; no T39 all-slice drift audit or TypeScript regeneration was executed by this documentation task | Update only within separately registered consumer compatibility/test scope; no unsupported endpoint/DTO inference |
| F16/F21/F22 and numerical P3 | T39 contract/test acceptance is **not** a release of these frontend gates | F16 HOLD; F21 owner-accepted preview; F22 BLOCKED; simulation runtime not established | Preserve each authority and gate without task splitting or fake qualified results |

**Task decision:** UXR-02's **source and gap qualification** is documented with exact checksum-backed backend proof, full existing Orval-input inventory, and explicit 31-route T39 handoff. **Native consumer compatibility remains NOT VERIFIED** because the actual machine pin, generated clients and native browser test were intentionally not mutated in this bounded documentation execution. This is not an authorization to declare Circle 1 operationally accepted or an instruction to bypass HWEB-F16. If full machine pin is a required completion criterion for UXR-02 itself, keep the **same indivisible UXR-02 open** rather than calling the documentation receipt full completion; do not invent a suffix task.

**Publication/CI rule:** guarded direct `main` update of this one file using the exact message above; verify that HidraWEB Documentation Validation starts on the new SHA, then STOP. Code CI should not trigger from Markdown-only scope. No next UXR task is executed by this publication.


---

## P1 / UXR-03 — industrial theme and layout token implementation

**Owner selection:** “next” after P0 / UXR-02. **Registered task:** P1 / UXR-03, indivisible, React/MUI presentation foundation. The preceding UXR-02 source-evidence commit `da9ec8024ccd5cf0041aac8e9c98352cb51344bc` has [HidraWEB Documentation Validation #88 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45019281992); it does *not* certify T39 web client re-pinning. UXR-03 has **no HidraAPI modules, Circles or REST dependencies**.

| Execution control | UXR-03 scope |
|---|---|
| Baseline | HidraWEB `da9ec8024ccd5cf0041aac8e9c98352cb51344bc` (tree `00b84f47db8a9e4e2ac96968e57dc987b2df7767`). |
| Task state | **IMPLEMENTED IN SOURCE — exact-SHA Code CI required**. Not production, WCAG, device or enterprise accepted on source inspection alone. |
| Commit message | `feat(design-system): implement UXR-03 industrial theme tokens` |
| CREATE | `src/design-system/tokens/industrialTokens.ts`: typed immutable palette, typography, density, focus, 4px grid, breakpoints and elevation tokens. |
| UPDATE | `src/design-system/theme/theme.ts`: reuse the existing MUI provider, add approved semantic palette, text/contrast, focus/motion accessibility, density, cards and typography. |
| CREATE | `src/design-system/theme/theme.test.ts`: 4.5:1 paired contrast, source palette, spacing, breakpoint, font and touch/focus checks. |
| UPDATE | `docs/10-Design-System-Specification.md`: source→runtime mapping and explicit non-acceptance of RTL/full WCAG. |
| UPDATE | `docs/roadmap/ULTIMATE_ROADMAP.md`: this execution boundary and acceptance/evidence record. |
| DELETE | None. |
| Non-scope | No route/navigation renaming, no CSS framework or package-lock changes, no generated clients/OpenAPI/API-contract moves, no business-data semantics, no SCADA/simulation, no authorization or locale/RTL implementation, no UXR-04/05 work. |
| Unit validation | Contrast for white-on-critical/amber/success/info pairs, canvas text contrast, 4px grid, 44px control minimum, breakpoints, MUI focus-visible and forced-colors/reduced-motion configuration. |
| CI gate | Guarded single direct-main commit; applicable **HidraWEB Code CI** starts on its exact SHA (lint, TypeScript, unit, performance, build, browser, native jobs as configured). STOP after observing created/started; report actual state without assuming a pass. |

**Existing capability preserved:** `AppProviders` remains the sole `ThemeProvider` and `CssBaseline` owner. The main authenticated shell remains unchanged. The `F16` HOLD, `F21` accepted synthetic preview, `F22` BLOCKED, and outstanding Circle 1 pinned contract gaps remain unaffected. UXR-04 is the next *candidate* (locale, RTL, responsive) and is NOT selected or automatically launched. Browser accessibility and layout tests for representative screens may still be needed before industrial deployment acceptance.

---

### P1 / UXR-03 — CI failure repair on the same indivisible task (22 November 2026)

**Failure source:** [HidraWEB Code CI #1053](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45019743948) on `6c2c1e86cec7d330593e0921897ad47bba0d97ab`, `verify` job Production build → `npm run bundle:check`. The production compilation/Vite build itself succeeded; **initial static JS 902.5 KiB exceeds its registered 900 KiB budget by 2.5 KiB**. Previous successful Code CI #1052 reported 899.4 KiB. UXR-03's design-system and unit tests passed; A1 native and F18 native jobs were successful; [documentation CI #89](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45019743900) passed. **No budget relaxation is authorized.**

| Repair control | Registered, bounded UXR-03 repair |
|---|---|
| Base SHA/tree | `6c2c1e86cec7d330593e0921897ad47bba0d97ab` / `693f35d17b6c1b5304d303d435d70bf27cf6ed46` |
| Commit message | `fix(design-system): trim UXR-03 startup theme JS` |
| UPDATE | `src/design-system/tokens/industrialTokens.ts` (named imports for tree-shaken runtime tokens), `src/design-system/theme/theme.ts` (lean MUI palette/type adapter), `src/design-system/theme/theme.test.ts` (CSS/typed-token parity), `src/app/providers/AppProviders.tsx` (one stylesheet import), `docs/10-Design-System-Specification.md` (performance tradeoff), this roadmap (failure/evidence). |
| CREATE | `src/design-system/theme/industrialTheme.css` (static focus, forced colors, motion, density, elevation). |
| DELETE | None. |
| Preservation | 900 KiB original initial-JavaScript budget, bundle checker, all APIs, routing, security, provider hierarchy, standalone F21 preview, HWEB-F16 HOLD/F22 BLOCKED and original T39 consumer gap. |
| Required proof | Exact-SHA Code CI: compatibility, 21 generated clients, lint, TypeScript, unit, performance, production build + unchanged bundle limits, release verification, Playwright, A1/F18 native lanes. Documentation CI starts on the same SHA. |
| State | **Repair source prepared; Code CI not yet passed**. Stop once exact-SHA CI is queued or started; do not automatically advance UXR-04. |


---

### P1 / UXR-03 — follow-up same-task CI test harness repair (22 November 2026)

**Exact failure:** [HidraWEB Code CI #1054](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45020440015), head `0155b1d0b216f5c2dc3c39d2886954e62297c438`, `verify` job, **Unit and component tests**. `theme.test.ts` failed one of 178 tests (`177 passed, 1 failed`) because Vitest's jsdom CSS transformer returned an **empty string** for `industrialTheme.css?raw`. The assertion expected `--hidra-control-min: 44px`. The stylesheet source **actually contains** the token. This is a test-loading error rather than evidence that the CSS or token is missing in the application. CI never reached Production build/bundle:check; **the 900 KiB JS budget remains unverified** on this SHA. [Documentation CI #90](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45020439992), the A1 PostgreSQL native browser job and F18 session job passed.

**Bounded repair:** replace the test's CSS `?raw` transform import with Node `readFileSync(resolve(process.cwd(), 'src/design-system/theme/industrialTheme.css'), 'utf8')`, used only by Vitest to inspect the tracked stylesheet. Keep the **same assertions** for CSS-to-typed-token consistency, contrast, spacing and breakpoints. Do **not** modify application CSS, MUI theme, Node/npm dependencies, generated API clients, bundle thresholds, routes or workflow configuration. `process.cwd()` is the repository root for `npm run test` and CI. The test uses the actual repository file and fails closed if it is missing.

| Repair registration | Value |
|---|---|
| Parent task | **UXR-03** (not a new task or suffix) |
| Base source/tree | `0155b1d0b216f5c2dc3c39d2886954e62297c438` / `8747c2d6c401386bfe4d60084af1af4985376a8d` |
| Exact commit message | `test(design-system): read UXR-03 CSS fixture from disk` |
| UPDATE | `src/design-system/theme/theme.test.ts` (Node filesystem test harness only); `docs/roadmap/ULTIMATE_ROADMAP.md` (append-only failure and correction evidence) |
| CREATE/DELETE | None |
| Validated prepublication | The tracked stylesheet was opened at this exact SHA; all eight CSS literal/at-rule values asserted by the test were verified. The existing 177 passing tests, typecheck and native jobs are historical CI evidence; the new source requires a fresh exact-SHA run. |
| Pending acceptance | **Code CI: unit suite, unchanged 900 KiB initial JS bundle gate, production build, browser, A1/F18 native jobs.** Documentation CI must also start. Do not assert success before those checks complete. |
| Forward gate | UXR-04 remains NOT STARTED; HWEB-F16 HOLD, F21 accepted synthetic preview and F22 BLOCKED remain unchanged. |

---

### P1 / UXR-03 — exact-SHA #1055 initial bundle overage repair (22 November 2026)

**Failure:** [Code CI #1055](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45021057342) on `8b56abf0a248710235ea363bec425cb3aeb9df0e` completed FAILURE in `verify → Production build → npm run bundle:check`. Code CI output reported `initial static JavaScript: 900.2 KiB / 900 KiB` (0.2 KiB over); the first UXR-03 attempt was 902.5 KiB and the last pre-UXR-03 green build was 899.4 KiB. In #1055 the CSS test harness correction **passed**: 178/178 tests and 6/6 performance tests, lint and TypeScript succeeded. A1 native PostgreSQL browser and F18 session suites succeeded, as did [Documentation #91](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45021057388). Production bundle threshold remains unmet, so the indivisible task is **not completed**.

**Bounded fix under UXR-03 (not a new stage):** remove redundant MUI runtime breakpoint override already identical to default, repeated custom contrastText values (MUI chooses contrast automatically; test keeps 4.5:1), redundant custom `body1/body2/caption` tabular-figure typography (existing CSS handles inheritance), and the explicitly duplicated white paper default. Keep MUI industrial semantic main palette, text colors, 4px grid, 8px radius, Arabic-capable font and button elevation policy. Tests continue to check exact breakpoints, semantic contrast and tabular figures in the loaded CSS.

| Repair control | Scope and evidence |
|---|---|
| Base SHA/tree | `8b56abf0a248710235ea363bec425cb3aeb9df0e` / `afdf601d26a631479100f01e6c7b4ac863482d5a` |
| Exact commit message | `fix(design-system): reduce UXR-03 MUI theme runtime payload` |
| UPDATE | `src/design-system/theme/theme.ts` (remove redundant MUI configuration, retain source colors and spacing), `src/design-system/theme/theme.test.ts` (test CSS-owned numerals and theme default breakpoint/radius), `docs/10-Design-System-Specification.md` (architecture and regression explanation), this append-only roadmap record. |
| CREATE/DELETE | None. |
| No changes | `scripts/check-bundle-budgets.mjs`, Vite config, dependencies, generated clients, CSS styling, backend/security workflows, route declarations, GZ2 simulator/operator contracts, HWEB-F16/F21/F22 gates. |
| Acceptance | Fresh exact-SHA Code CI proving **initial JS at or below 900 KiB** plus compatible contracts, lint, typecheck, full unit/performance, release and configured E2E/native tests; fresh documentation CI. |
| Status | **REPAIR PUBLISHED/PENDING NEW CI**; do not declare bundle improvement from source alone or advance UXR-04. |


---

## P1 / UXR-04 — Locale, RTL and responsive foundation: registered implementation

**Selection:** Owner's “Next” after [HidraWEB Code CI #1056 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45021816849) and [Documentation Validation #92 SUCCESS](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45021816815), both pinned to UXR-03 `b01a06df5ae9615985ce1a04109dc94d0fd0b502`. The #1056 verify, A1 native PostgreSQL browser and F18 session jobs all succeeded; initial static JS was **899.9 KiB / 900 KiB**. UXR-03 is **CI-PASSED**, but no operational/SITE acceptance is implied. The new owner selection applies to whole registered P1 / UXR-04 only; P2 / UXR-05 is not selected.

| Registration field | UXR-04 exact implementation envelope |
|---|---|
| Registered name | **P1 / UXR-04 · Locale, RTL and responsive foundation** |
| Base head/tree | `b01a06df5ae9615985ce1a04109dc94d0fd0b502` / `e8e34907d63773b0ca1d103d592f8432992f3a39` |
| Exact commit message | `feat(i18n): implement UXR-04 RTL mobile locale foundation` |
| Backend ownership / REST | **None**; frontend-local presentation. Preserve existing HidraAPI identity, permission, workflow and telemetry authorization, raw ISO timestamps and units. |
| CREATE | `src/app/providers/LocaleThemeProvider.tsx`: select MUI direction from i18next, preserving provider lifecycle. |
| CREATE | `src/app/providers/LocaleThemeProvider.test.tsx`: FR–AR–EN theme and document direction qualification. |
| CREATE | `src/shared/i18n/localePresentation.ts`: Intl-only, display-only number, quantity and offset-qualified instant formatting with explicit caller timezone. |
| CREATE | `src/shared/i18n/localePresentation.test.ts`: regional subtag behavior; source unit/timestamp preservation; numeric and time-zone formatting; rejection of timezone-ambiguous inputs. |
| CREATE | `tests/e2e/locale-responsive.spec.ts`: synthetic-permission browser FR/AR/EN language switch, 390px sidebar toggle/Escape, RTL drawer placement and navigation. |
| UPDATE | `src/app/router/router.tsx`: lazy protected authenticated shell, preserving auth and permission bootstrap; no navigation routing changes. |
| UPDATE | `src/app/providers/AppProviders.tsx`: existing i18next provider contains direction-aware theme; no mutation of auth, query, permission or realtime sequencing. |
| UPDATE | `src/shared/i18n/i18n.ts`: normalize <html> language and RTL direction for the selected supported UI locale. |
| UPDATE | `src/shared/i18n/resources.ts`: add language-specific skip-to-main labels; preserve all existing translations. |
| UPDATE | `src/shell/AppShell.tsx`: keyboard skip link localization/logical positioning, mobile vs desktop sidebar behavior and responsive main width. |
| UPDATE | `src/shell/navbar/HidraNavbar.tsx`: responsive chrome with persistent realtime indicator, logical spacing, linked navigation aria-controls. |
| UPDATE | `src/shell/sidebar/HidraSidebar.tsx`: MUI mobile temporary Drawer, RTL-aware anchor and tooltip, keyboard/backdrop close; preserve all backend-grant filtering and implemented-only navigation. |
| UPDATE | `src/shell/context/ContextualDrawer.tsx`: RTL-aware drawer anchor without changing its content authorization. |
| UPDATE | `src/app/pages/OverviewPage.tsx`: localized presentation of authorized published-route/module counts; no API or counting semantics change. |
| UPDATE | `src/features/workflow/WorkflowTasksPage.tsx`: UTC display-only task due time and timeline time using offset-qualified source ISO; no changes to workflow transitions, version checks, permissions or commands. |
| UPDATE | `docs/10-Design-System-Specification.md`: this implementation/limitation explanation. |
| UPDATE | `docs/roadmap/ULTIMATE_ROADMAP.md`: task registration and acceptance record (append-only). |
| DELETE | None. |
| Non-scope | No new API endpoints, Orval regeneration/re-pin, auth/organization permissions, new locale activation policy, altered engineering data/units/temporal instants, numerical solver or IT/OT control; HWEB-F16 HOLD/F21 synthetic-preview acceptance/F22 BLOCKED unchanged. |
| Required tests | Existing full Code CI (OpenAPI compatibility/pins, lint, TS typecheck, unit + performance, unchanged 900 KiB initial bundle, artifact verification, E2E Playwright and A1/F18 native jobs) and Documentation Validation, both on exact publication SHA. |
| Evidence status | **IMPLEMENTATION SOURCE PREPARED; exact-SHA CI NOT YET VERIFIED.** Typecheck, bundle, Playwright/mobile and browser accessibility are acceptance gates, not presumed results. |

**G1 boundary:** UXR-03 industrial tokens CI-passed and UXR-04 locale/RTL/responsive foundation implemented at source level; G1 visual/accessibility/device acceptance awaits the UXR-04 exact-SHA Code CI and any owner-required browser/device evidence. The active roadmap remains unique. **UXR-05** is next *candidate only*, not automatically started.

---

### P1 / UXR-04 — exact-SHA CI #1057 lint repair (22 November 2026)

**Failure:** [HidraWEB Code CI #1057](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45023123714) on `b3df6e6407857a956be8acd0a382af7b092ed578` stopped at **Lint** in the `verify` job, with exactly one ESLint error in `src/shell/AppShell.tsx:25:21`: `react-hooks/set-state-in-effect`. The UXR-04 mobile navigation route-change effect synchronously called `setMobileNavigationOpen(false)`, violating the configured React Hooks guidance; seven pre-existing/additional Fast Refresh warnings are nonfatal. The checks after lint (typecheck, browser tests, initial 900 KiB bundle) did not run in this job. A1 six-module native API/PostgreSQL browser qualification and F18 LOCAL session qualification passed, as did [Documentation Validation #93](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45023123715).

**Indivisible UXR-04 repair:** replace the effect with route-scoped local state. Store the React Router `location.key` of the entry where the mobile menu opened. Derive `mobileNavigationOpen` by equality against the *current* route key. Thus route navigation immediately hides the temporary drawer, while an explicit close/Escape/backdrop or implemented sidebar item resets the route token to `null`. Desktop collapse continues to use the existing Zustand store. No permission bypass or route behavior is introduced.

| Control | Exact scope |
|---|---|
| Base SHA/tree | `b3df6e6407857a956be8acd0a382af7b092ed578` / `7ab716e036f73384b785cd71c0ea35e5ea42428b` |
| Commit message | `fix(shell): close UXR-04 mobile menu without effect state` |
| UPDATE | `src/shell/AppShell.tsx`: remove `useEffect`, use `location.key`-scoped mobile-menu state, preserve responsive and RTL shell. `docs/roadmap/ULTIMATE_ROADMAP.md`: this append-only failure and correction record. |
| CREATE/DELETE | None |
| Preserve | Existing 900 KiB startup budget, all 21 Orval/API contracts and pinned checks, permission-filtered navigation, FR/EN/AR and RTL behavior, exact source units/timestamps, CSS focus, acceptance tests, native CI jobs, F16 HOLD/F21 synthetic preview/F22 BLOCKED. |
| Validation | Static targeted source check confirms the lint-triggering synchronous effect is absent and mobile drawer state is derived from router entry key. The next **exact-SHA Code CI** must prove ESLint, TypeScript, unit, performance, unchanged bundle, Playwright, native jobs and release checks. |
| Status | **Repair source bounded; CI acceptance PENDING**. No claim that #1057 passed, nor that UXR-04 is complete. UXR-05 remains not started. |


---

### P1 / UXR-04 — Playwright contract repair after exact-SHA CI #1058 (22 November 2026)

**Source evidence:** [HidraWEB Code CI #1058](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45023877248), attempt 1 on `5db331399cead2af4ac548a8442865c4973057e7`, failed only at `verify → Full Playwright regression suite`; **77 passed, 6 failed, 15 skipped**. The preceding gates passed: 182 unit/component tests; six performance tests; lint and TypeScript; `npm run build` with **726.2 KiB initial JS against the unchanged 900 KiB limit**; A1 native PostgreSQL browser and F18 LOCAL session suites. [Documentation Validation #94](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45023877235) passed. Do not claim the UXR-04 Playwright gate is met.

**The six failed assertions are from four test files/contexts:** `tests/e2e/accessibility-keyboard.spec.ts` old English skip-link in FR; `tests/e2e/network.spec.ts` three narrow viewport tests invoking the obsolete “Collapse/ Réduire la navigation” control (mobile now initializes with the temporary drawer closed); and `tests/e2e/locale-responsive.spec.ts` two cases using an absent MUI-generated anchor class and a role-based navbar locator while a modal's aria-hidden behavior correctly hides the background. The tests' keyboard and physical layout requirements remain valid; only the legacy/misaligned selectors and expectations are corrected.

| Repair control | Registered bounded change |
|---|---|
| Task | **UXR-04** only, no suffix/child package |
| Base SHA/tree | `5db331399cead2af4ac548a8442865c4973057e7` / `9addf6decdc2fa9326382bba6cb530c7ed8a19ba` |
| Exact commit message | `test(shell): align UXR-04 Playwright with mobile RTL contract` |
| UPDATE | `tests/e2e/accessibility-keyboard.spec.ts`: FR skip link, existing keyboard-focus navigation preserved; `tests/e2e/network.spec.ts`: three narrow-width tests assert the new mobile drawer is initially closed, while retaining keyboard selection, no horizontal scrolling, French/Arabic/English engineering UI checks; `tests/e2e/locale-responsive.spec.ts`: verify RTL physical navigation paper position and navbar toggle ARIA state while modal open, keeping Escape, route-change and locale switching checks; `docs/10-Design-System-Specification.md`: explicit reason/limits; `docs/roadmap/ULTIMATE_ROADMAP.md`: append this evidence. |
| CREATE/DELETE | None |
| Preservation | Unchanged runtime source, authorization and route guards, all 21 Orval pins, F16 HOLD/F21 synthetic preview/F22 BLOCKED, 900 KiB budget, no weakened permission, keyboard, RTL or engineering acceptance requirements. |
| Required acceptance | Fresh exact-SHA HidraWEB Code CI: full Playwright suite including the six regressions, unchanged lint/TS/unit/performance/bundle checks and A1/F18 native lanes; Documentation Validation. |
| State | **SOURCE REPAIR PREPARED; CI NOT YET PASSED**. Do not select UXR-05 until UXR-04 acceptance is observed. |


---

## P2 / UXR-05 — Semantic application shell, registered stage (22 November 2026)

**Selection and predecessor gate:** The owner's “Next” selected the next indivisible registered task **P2 / UXR-05**, after [Code CI #1059](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45025257094) and [Documentation Validation #95](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45025257056) completed successfully on UXR-04 SHA `e2f3bd2d644a9023f80c230c168b23f38f3aafa1`. Code #1059 verified lint, TypeScript, 182 unit tests, six performance tests, **726.2 KiB initial JS under the unchanged 900 KiB cap**, 83 passed/15 skipped Playwright cases, and A1 native PostgreSQL/browser and F18 LOCAL session qualification. This is **CI-passed UXR-04**, not certified industrial deployment/visual/SITE acceptance.

**Registered scope:** Permanent header/sidebar, workspace frame, skip link and landmarks, authenticated workspace outlet, route-loading and protected failure/denial boundaries. Owner is frontend application shell/identity-security composition. HidraAPI ownership: identity + security platform; **Circle C1**, existing `GET /api/v1/identity/me`, `GET /api/v1/identity/me/permissions`, `GET /api/v1/security/permissions/routes`, `GET /api/v1/security/permissions/catalog` via existing providers; `GET /api/v1/identity/me/operation-capabilities` is in roadmap but is not introduced as a new consumer in this task. No new backend request or permission/authorization mechanism.

| Field | Bounded UXR-05 implementation envelope |
|---|---|
| Source HEAD/tree | `e2f3bd2d644a9023f80c230c168b23f38f3aafa1` / `56d99244a4b81fabdf3d17e4a7a01f622ca43e2d` |
| Commit message | `feat(shell): implement UXR-05 semantic protected workspace frame` |
| CREATE | `src/shell/ShellLoadingFallback.tsx`: localized, accessible protected shell loading state; `src/shell/ShellRouteError.tsx`: guarded errorElement with generic 403/404/503 and no backend response disclosure. |
| CREATE | `src/shell/ShellLoadingFallback.test.tsx`: accessible loading landmark/status; `src/shell/ShellRouteError.test.tsx`: failed route 403/500 displays generic result, does not leak mock protected data. |
| UPDATE | `src/app/router/router.tsx`: reusable protected Suspense fallback and errorElement wrapped under current authentication and permission bootstrap gates; do not weaken lazy initial JS, route tree or REST calls. |
| UPDATE | `src/app/auth/RequireAuthentication.tsx`: localized authentication-check status/main. Existing sign-in redirect, memory-only credentials and return-path behavior unchanged. |
| UPDATE | `src/features/permissions/PermissionBootstrapBoundary.tsx`: status/main for permission loading and failed bootstrap; existing 403/503/retry/authorization decisions preserved. |
| UPDATE | `src/shell/AppShell.tsx`: named, focusable semantic main workspace preserving skip-to-content, mobile/RTL and contextual drawer; `src/shell/navbar/HidraNavbar.tsx`: explicit named header, no new controls. |
| UPDATE | `src/shared/i18n/resources.ts`: FR/EN/AR for header, workspace, authentication and loading, generic route failure. |
| UPDATE | `tests/e2e/accessibility-keyboard.spec.ts`: assert unique banner/navigation/main and unchanged skip-to-main keyboard focus; `tests/e2e/bootstrap.spec.ts`: authenticated landmarks and fail-closed shell absence after permission bootstrap refusal. |
| UPDATE | `docs/10-Design-System-Specification.md`: shell semantic contracts and technical limits; `docs/roadmap/ULTIMATE_ROADMAP.md`: append-only registration and truthful acceptance record. |
| DELETE | None. |
| Preserved and deferred | UXR-06 six-group hierarchy and nested submenu **not started**; UXR-07 restoration/back-forward logic **not started**. Existing backend-authoritative authorization, 900 KiB startup JS and 21 pinned generated clients, engineering source instants/units, GZ2-first flows, HWEB-F16 HOLD, F21 owner-accepted synthetic preview, HWEB-F22 BLOCKED remain unchanged. |
| Required acceptance | Fresh exact-SHA HidraWEB Code CI (OpenAPI contract verification, lint, typecheck, all unit/performance tests, unchanged bundle, release artifact, full Playwright and A1/F18 native jobs) plus Documentation Validation. UI accessibility beyond automated scope and SITE remain distinct. |
| Current status | **IMPLEMENTATION SOURCE PREPARED; publication and exact-SHA CI not yet verified.** UXR-05 is not CI-passed and does not authorize UXR-06 without owner “Next”. |

**G2 gate:** UXR-05 source-level semantic shell is distinct from UXR-06's six-group sidebar and UXR-07's safe route restoration; P2/G2 remains open until all registered work and required evidence are complete.

---

## P2 / UXR-06 — Six-group sidebar, registered implementation (22 November 2026)

**Selection and predecessor acceptance:** Owner's “next” selects one registered stage **P2 / UXR-06** after verification of [HidraWEB Code CI #1060](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45026305888) and [Documentation Validation #96](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45026305909), both **SUCCESS** on `41af3804e9534c15b13c8e627e7efaee997d8068`. #1060 verified 185 unit/component tests, six performance tests, 83 Playwright passes (15 repository-configured skips), initial static JavaScript **728.4 KiB / 900 KiB** unchanged, plus successful A1 native PostgreSQL/browser and F18 LOCAL session jobs. UXR-05 is **CI-passed**, not independently engineering/SITE accepted.

**Registered functional contract:** Exactly six navigation groups (Overview, Operations, Engineering, Intelligence, Work, Administration); desktop widths **272px / 72px**, maximum three levels, **one expanded group at a time**, one nested submenu with text-only descendants; app-registered process names and routes preserved. Identity/security backend owners, **C1**. Existing `GET /api/v1/identity/me/permissions`, `GET /api/v1/security/permissions/routes`, `GET /api/v1/security/permissions/catalog` remain used by the existing provider. `GET /api/v1/identity/me/operation-capabilities` is an identified API dependency in the source roadmap but **not introduced as a new client call** here.

| Scope | Exact bounded implementation envelope |
|---|---|
| Base SHA/tree | `41af3804e9534c15b13c8e627e7efaee997d8068` / `a0292243a13e4d1cbe66219d4a465c133363603b` |
| Exact commit message | `feat(shell): implement UXR-06 permission-aware accordion navigation` |
| UPDATE | `src/shell/navigation/navigationRegistry.ts`: optional third-level child for already-implemented `/engineering/assets`; exact `authorizedNavigationSections` and `navigationSectionForPath` public helpers. No new route or backend API. Descendant refers to `UXR-25` Assets product stage, not unrelated workflow `HWEB-F14`. |
| UPDATE | `src/shell/sidebar/HidraSidebar.tsx`: permission-filtered one-at-a-time group controls, one explicit text-only Assets child submenu and keyboard/ARIA controls. Preserve desktop 272/72 widths and prior mobile/RTL drawers. |
| UPDATE | `src/shell/navigation/navigationRegistry.test.ts`: six-group inventory, max three levels, published/effective module-grant prune, nested-assets negative and exact-route cases. |
| UPDATE | `src/shared/i18n/resources.ts`: existing FR/EN/AR translation dictionaries add Assets label and submenu action labels; no pre-existing translations removed. |
| CREATE | `tests/e2e/sidebar-groups.spec.ts`: synthetic permissions, one-expanded-group, keyboard open, text-only asset descendant, negative authorization, icon-only collapse and 72px width. |
| UPDATE | `tests/e2e/bootstrap.spec.ts`, `tests/e2e/workflow.spec.ts` and `tests/e2e/foundation-context-live.spec.ts`: retain existing real-browser access and protected-action assertions while opening/selecting authorized navigation groups explicitly; no skip or relaxation. |
| UPDATE | `docs/06-Navigation-Blueprint.md`, `docs/10-Design-System-Specification.md` and this append-only `docs/roadmap/ULTIMATE_ROADMAP.md`: behavior, ownership and acceptance limits. |
| DELETE | None. |
| Preserved | No modifications to backend or REST/OpenAPI/Orval generated contracts, router routes, authorization gates, decision/approval provenance, global header, numerical simulation or OT integrations, original 900 KiB initial JS cap, database history, HWEB-F16 HOLD/F21 owner-approved synthetic preview/F22 BLOCKED. |
| Deferred | UXR-07 deep-link, history, active-ancestor and scoped-tab restoration. UXR-25 actual Assets workspace maturity. No production-language activation or deployment claims. |
| Required CI | Exact-SHA Code CI proving contract compatibility, lint/typecheck, all unit and performance tests, unchanged budget, full Playwright and native A1/F18 qualification, plus same-SHA Docs validation. Site/physical accessibility is a separate qualified gate. |
| Status | **SOURCE IMPLEMENTATION PREPARED; EXACT-SHA CI PENDING**. Publish one guarded `main` commit, verify exact paths/parent/tree and CI-created state, then STOP. Do not advance UXR-07. |

**G2 status:** UXR-05 CI passed; UXR-06 awaits its exact-SHA CI; UXR-07 not selected. G2 is **OPEN**, not accepted on the basis of a code commit alone.

---

### P2 / UXR-06 — exact-SHA Code CI #1061 two-gate repair (22 November 2026)

**Source/acceptance evidence:** The registered UXR-06 source commit `97a907352bdf558f7c8017e8af82d6cd42cf07a6` (tree `435601a81a9f5ae59f37e5b4a6d3c5d4cc77a5cb`) triggered [HidraWEB Code CI #1061](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45028845368), attempt 1: **FAILED**. Verification job stopped at Typecheck: `src/shell/sidebar/HidraSidebar.tsx:208:61`, `TS2322`, because `ListItemText.primaryTypographyProps` is not supported by installed MUI types; lint and OpenAPI compatibility passed, later verify gates did **not** execute. A1 six-module native API/PostgreSQL browser job also **FAILED** in the mandatory W4 review/denial lane: the first W4 native case timed out at 90 seconds on a `page.waitForResponse` event watcher for the timeline GET after reloading the selected task (`tests/e2e/foundation-workflow-live.spec.ts:37`). The W4 unrelated-actor denial case passed, the seven W1–W3 browser cases passed, and the F18 LOCAL session job **PASSED**. [Documentation Validation #97](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45028845344) **PASSED**. The trace does not establish why the post-reload response watcher never resolved; it must not be falsely classified as an API or database defect solely from the timeout. PostgreSQL NOWAIT lock diagnostics were emitted but their causal relationship to the timed-out browser watcher was not established.

**Bounded implementation:**

| Register | Exact UXR-06 repair |
|---|---|
| Stage | **P2 / UXR-06** only; UXR-07 NOT STARTED |
| Parent/tree | `97a907352bdf558f7c8017e8af82d6cd42cf07a6` / `435601a81a9f5ae59f37e5b4a6d3c5d4cc77a5cb` |
| Commit message | `fix(shell): repair UXR-06 MUI types and W4 reload assertion` |
| UPDATE | `src/shell/sidebar/HidraSidebar.tsx`: replace invalid `primaryTypographyProps` with MUI's supported `slotProps.primary` containing the same font weight and caption variant; preserve all six-group/permission/RTL/accordion behavior. |
| UPDATE | `tests/e2e/foundation-workflow-live.spec.ts`: replace a timing-coupled, post-reload `page.waitForResponse` event watcher with an explicit assertion that persisted timeline rows are rendered after a fresh page navigation/login. This **does not** skip the W4 test: it retains independent human APPROVE and REJECT, exact persisted instance/task checks, 409 stale replay, one matching decision in a fresh authenticated backend timeline GET, draft target, and unrelated-actor denial/count-history non-disclosure. The new UI assertion still fails if the reloaded timeline does not render. |
| UPDATE | `docs/roadmap/ULTIMATE_ROADMAP.md`: append-only evidence, scope, pending acceptance. |
| CREATE/DELETE | None. |
| Preservation | No changes to native API, Flyway/PostgreSQL functions, authorization, W4 fixtures/credentials, Playwright or TypeScript timeouts, workflow concurrency, test skip settings, initial JS 900 KiB limit, OpenAPI/Orval pins, HWEB-F16 HOLD/F21 synthetic preview/F22 BLOCKED. |
| Local validation | Exact source substitution and append-only scope inspected. No claim of local Node 24/npm 11 or live PostgreSQL/Playwright execution. |
| Required acceptance | Fresh exact-SHA HidraWEB Code CI must pass TypeScript, unit/performance, 900 KiB bundle, **all** Playwright and A1 mandatory W4 native approval/rejection **plus** denial, and F18; Documentation Validation must pass too. |
| Status | **REPAIR PREPARED; CI NOT YET VERIFIED**. UXR-06 remains awaiting Code CI, G2 remains open, UXR-07 not selected. |


---

### P2 / UXR-06 — Code CI #1062 unit-contract repair (22 November 2026)

**CI evidence at exact SHA:** [HidraWEB Code CI #1062](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45029721945) on `7270638b57e5794f82e2fcdbf4cb6ecd63cbddda` **FAILED** solely in `verify → Unit and component tests`. The first failing assertion is `src/app/App.test.tsx:76:127` in the HWEB-002/004/005/007/008 capability-driven shell test: it expected an enabled `Mes tâches` button while the registered UXR-06 accordion kept the **Operations** group expanded and **Work** collapsed. The visible global My Tasks shortcut is intentionally disabled; it is not the authorized sidebar destination. CI reported **186 passed / 1 failed** unit tests. OpenAPI, lint, TypeScript completed earlier in the verify job; performance, bundle, full browser regression and release gates were **not reached** by that job. The A1 native API/PostgreSQL/browser lane (including mandatory W4 approval/rejection and denial) and F18 LOCAL session lane **PASSED**; [Documentation Validation #98](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45029721872) also **PASSED**. No evidence of a persistent W4/DB regression on this SHA.

**Indivisible repair envelope:** One existing test is updated, without production code or API modifications. `src/app/App.test.tsx` now explicitly scopes the capability checks to the `Navigation principale` landmark, verifies an enabled Network/Alarms in the expanded Operations group and absence of unauthorized Planning, opens Work to validate the genuinely authorized **My Tasks** destination (distinct from the disabled header shortcut), then opens Administration to verify Organization/Identity while checking that Work destinations are no longer exposed. The existing desktop collapse toggle assertion stays. This **increases** explicit accordion/permission regression coverage; it does not turn off or relax tests.

| Control | Exact bounded register |
|---|---|
| Stage | **P2 / UXR-06** repair only. UXR-07 remains unselected. |
| Parent SHA/tree | `7270638b57e5794f82e2fcdbf4cb6ecd63cbddda` / `92f7fedce8cdf4d4428c682849061f1507770c1c` |
| Commit message | `test(shell): align UXR-06 capability test with accordion` |
| UPDATE | `src/app/App.test.tsx` for focused group/authorization assertions; `docs/roadmap/ULTIMATE_ROADMAP.md` append-only failure and repair record. |
| CREATE/DELETE | None. |
| Preserve | Existing six groups, one-expanded-group and text-only nested Assets, keyboard/RTL/mobile behavior, 272/72 px widths, effective backend permissions and REST guards, 900 KiB startup budget, exact native W4/LOCAL tests, no retries/skips, pinned API clients and HWEB-F16/F21/F22 statuses. |
| Local verification | Exact source assertions inspected; no local Node 24/npm 11 / Playwright or PostgreSQL execution claimed. |
| Acceptance | Fresh exact-SHA Code CI (unit and remaining performance/bundle/full Playwright + mandatory native lanes) and Documentation Validation. |
| Status | **REPAIR SOURCE PREPARED — NEW CI PENDING**. UXR-06 is not yet CI-passed, G2 open, UXR-07 not started. |


---

### P2 / UXR-06 — Code CI #1063 Playwright locator repair (22 November 2026)

**Exact-SHA evidence.** [HidraWEB Code CI #1063](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45030547023) on `30b735ba70316a9dbd3668caffe3c84107702974` **FAILED** only in `verify → Full Playwright regression suite`: **81 passed, 4 failed, 15 skipped**. TypeScript, lint, API/OpenAPI compatibility, **187 unit/component tests**, six performance tests and initial JS **728.8 KiB / 900 KiB** passed. A1 native PostgreSQL/browser, including mandatory W4, and F18 LOCAL session jobs both **PASSED**. [Documentation Validation #99](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45030547064) **PASSED**. No backend or numeric-engine failure is evidenced.

**Failure classification.** `tests/e2e/critical-operational-journeys.spec.ts:190` clicked the first enabled button with a non-exact `Opérations` locator, selecting the uppercase **OPÉRATIONS accordion group** and leaving the URL at `/overview` instead of selecting the **Opérations** destination. Both `tests/e2e/operations.spec.ts` HWEB-006 cases failed a Playwright strict-mode ambiguity between that header and destination. `tests/e2e/sidebar-groups.spec.ts:37` matched both the exact `Intégrité & maintenance` destination and the separate `Afficher les sous-sections : Intégrité & maintenance` submenu control. These four failures are browser selector/navigation-test alignment issues triggered by the UXR-06 registered hierarchy, not demonstrated authorization or backend gaps.

| Control | Bounded source repair |
|---|---|
| Registered stage | **P2 / UXR-06** only; not UXR-07 |
| Base SHA/tree | `30b735ba70316a9dbd3668caffe3c84107702974` / `3159d36dc0ffe438f6882d2030d672f810c5f9d2` |
| Commit message | `test(shell): disambiguate UXR-06 browser navigation` |
| UPDATE | `tests/e2e/critical-operational-journeys.spec.ts`: scope enabled-target locator to the accessible authorized navigation landmark and use `exact: true`, distinguishing header from process destination and disabled global task shortcut. Explicitly expand Work before selecting My Tasks and verify Alarms is no longer exposed from the collapsed Operations group. Preserve monitor → alarm acknowledgement → workflow approval journey and its assertions. |
| UPDATE | `tests/e2e/operations.spec.ts`: both telemetry/monitoring permission cases select the exact Operations **destination** inside the named primary navigation, not the similarly named accordion group. Retain displayed data and negative telemetry-permission proof. |
| UPDATE | `tests/e2e/sidebar-groups.spec.ts`: assert the exact Integrity & Maintenance destination, leaving the distinct submenu toggle, keyboard activation, text-only Assets and one-group behavior fully tested. |
| UPDATE | `docs/roadmap/ULTIMATE_ROADMAP.md`: append-only evidence and implementation register. |
| CREATE/DELETE | None. |
| Preserve | No production shell, permission, router, REST/API client, workflow, test skip/retry/timeout or CI threshold changes. Preserve 272px/72px, 900 KiB, native A1/W4/F18 qualification, G2 not accepted, HWEB-F16 HOLD/F21 synthetic preview/F22 BLOCKED, UXR-07 not selected. |
| Local validation | Exact-source substitution and locator specificity examined against failing Playwright trace text; local browser execution is **not** claimed. |
| Acceptance gate | Fresh exact-SHA Code CI must pass all four affected browser regressions, full Playwright, existing 187+ unit, performance/build/budget, native A1/F18, and matching Documentation Validation. |
| Current state | **SOURCE REPAIR PREPARED; new exact-SHA CI not yet verified**. UXR-06 remains CI-pending. Do not advance UXR-07. |


---

### P2 / UXR-06 — Code CI #1064 exhaustive failure assessment and test repair (22 November 2026)

**Evidence and status.** [HidraWEB Code CI #1064](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45031454727), attempt 1, exact WEB SHA `0e4775274d3d930e56c4dbf4e838f13077e52b22`, **FAILED** at `verify → Unit and component tests`. The single deterministic failure in that execution was `src/app/App.test.tsx:99:82`, with `expect(element).not.toBeInTheDocument()` receiving an existing `<div role="button" aria-label="Mes tâches">`. Unit result: **186 passed, 1 failed** (67 files; 66 passed, 1 failed). OpenAPI/Orval generation, lint and TypeScript were completed successfully before that step; lint emitted seven **non-blocking** `react-refresh/only-export-components` warnings. The `verify` job **did not execute** subsequent performance, production bundle or full Playwright gates at #1064. [Documentation Validation #100](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45031454720) **PASSED**, A1 six-module native API/PostgreSQL browser **PASSED** (seven W1–W3 plus both W4 browser cases, no failed/flaky/skipped), and F18 LOCAL session renewal/logout **PASSED** (five native cases). These successful native jobs are specific evidence, not a substitute for missing full regression.

**Verified cause and adjacent risk.** The shell is a one-group accordion using MUI `<Collapse in={groupOpen} timeout="auto" unmountOnExit>`. After clicking Administration, the Work header immediately has `aria-expanded="false"` and Administration has `aria-expanded="true"`; Work's previously rendered destination **remains in the DOM during the exit transition**. The failing test asserted physical absence synchronously after the Administration destination became available, so it raced with the asynchronous unmount. This is a test-timing/source-contract mismatch, **not evidence** that Work is independently authorized when it should be denied, and is distinct from UXR-06's registered effective-grant pruning. The same immediate absence assertion after Operations → Work at line 92 passed in this execution but has the same potential race. Both waits must be corrected consistently and should still fail if collapsed children never leave the DOM. The observed `Mes tâches` node belonged to primary sidebar navigation, not the disabled global-header shortcut.

**Full log triage — separate potential issues.**

| Area | Observed exact-SHA evidence | Cause classification / action |
|---|---|---|
| Root blocking error | App unit assertion sees exiting `Mes tâches` button after Work → Administration | Confirmed mismatch between synchronous DOM assertion and MUI Collapse `timeout="auto"` delayed unmount; await actual removal, retain `aria-expanded` and grant assertions |
| Adjacent same-pattern risk | App unit assertion after Operations → Work checks immediate removal; it passed on #1064 after awaited task visibility | Potential timing race; apply same eventual-removal assertion before it can regress |
| API, lint, TypeScript | OpenAPI compatibility/client generation, lint and TypeScript passed; seven nonfatal React fast-refresh export warnings | No blocking API/type error evidenced; warnings are unrelated maintenance issues, not grounds to weaken checks |
| Browser regression | Not executed on #1064; the preceding [Code CI #1063](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45030547023) had four specific navigation-selector failures; their fixes are in the #1064 source but were not independently exercised in #1064 | **Open acceptance risk**: cannot claim the selector repair passed until a later exact-SHA full Playwright gate runs |
| A1 native PostgreSQL/W4 | Seven W1–W3 and both W4 mandatory browser cases completed; PostgreSQL emitted `could not obtain lock` `NOWAIT` diagnostics on a characteristic revision relation during the run | Observed lock contention / fail-closed diagnostic, **not causal evidence for the unit failure**; its contract significance requires a separate investigation if native acceptance changes; do not rewrite locks/migrations during UXR-06 |
| F18 LOCAL session | Five native browser tests completed with zero failed/flaky/skipped | Not a cause of this failure |
| Nonblocking tooling warnings | Node deprecated `punycode` / `url.parse`, `setup-java@v4` and actions pinned to Node 20 compatibility, plus a passing route-error test with missing `HydrateFallback` notice | Cleanup opportunities, **not failed steps** and not proof of application regressions; avoid unrelated workflow changes |

**Delivery envelope (same registered task; not UXR-07).**

| Field | Bounded UXR-06 CI repair |
|---|---|
| Parent SHA/tree | `0e4775274d3d930e56c4dbf4e838f13077e52b22` / `ab556441d84c351a8a3d2f6cf3e343e2899e33ff` |
| Commit message | `test(shell): await UXR-06 accordion exit before DOM absence assertions` |
| UPDATE | `src/app/App.test.tsx`: import `waitFor` and await removal of the previously expanded Operations and Work destinations after respective switches. Retain all authentication, authorization, one-group `aria-expanded`, semantic navigation, negative Planning and shell collapse checks. |
| UPDATE | `docs/roadmap/ULTIMATE_ROADMAP.md`: append-only failure details, confirmed/possible causes, evidence and pending acceptance. |
| CREATE/DELETE | None. |
| Production files / contracts | **No changes** to shell, navigation registry, permissions, backend APIs, security gates, native DB fixtures, workflow concurrency or OpenAPI. |
| CI integrity | Do not change skips, retries, test/global timeouts or bundle budgets. Source inspection is not local Node 24/npm 11 execution; **no local CI pass claimed**. |
| Required acceptance | Fresh exact-SHA Code CI must demonstrate all unit/component tests, performance checks, 900 KiB initial JS limit, production build/release, complete Playwright suite and A1/F18 native jobs; Documentation Validation must pass. |
| Current state | **REPAIR PREPARED — RECHECK EXACT-SHA CI AFTER GUARDED PUBLICATION**. UXR-06 CI not yet accepted; G2 open, UXR-07 not selected. |


---

## P2 / UXR-07 — route-aware mobile navigation, deep links and local view tabs (22 November 2026)

**Selection and predecessor acceptance.** Owner “Next” authorizes exactly one registered task **P2 / UXR-07**. Exact current `main` `b330b46e276ab45de4c5a22a2ff545b12286f703`, tree `1700c11f287fa56ca50c6a651b2a14107f35a64e`. [HidraWEB Code CI #1065](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45032330688) **SUCCESS**, attempt 1, on that SHA: **187/187 unit tests**, **6/6 performance tests**, initial static JS **728.8 / 900 KiB**, full Playwright **85 passed, 15 repository-configured skipped**, and all three jobs including A1 native API/PostgreSQL/W4 and F18 LOCAL **SUCCESS**. [Documentation Validation #101](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45032330729) **SUCCESS** on the same SHA. Therefore UXR-06 is **CI-passed**; no claim of site/industrial acceptance.

**Registered acceptance goal G2.** Preserve the six-group, one-open-group, 272px/72px hierarchy of UXR-06; add responsive mobile drawer lifecycle, keyboard and history Back/Forward, safe *authorized* active-ancestor restoration, bounded local tab/context restoration, existing fallback/Not Found and root redirect. C1 identity/security + target Circle, using existing `GET /api/v1/identity/me/permissions` and target module routes; no invented endpoint. Grant/scope change must not resurrect protected selections. Page-owned API checks remain authoritative, and company/resource authorization remains with HidraAPI.

**Bounded implementation register, one task, one guarded commit:**

| Action | Exact file | Contract / role |
|---|---|---|
| CREATE | `src/shell/navigation/useNavigationContextKey.ts` | Pure deterministic ephemeral view key + hook from router history entry, current authenticated principal, operational scope and effective authorized modules; no storage or permission grant inference. |
| CREATE | `src/shell/navigation/useNavigationContextKey.test.ts` | Negative cases for history, principal, scope and grant changes, plus order-independent module snapshot. |
| UPDATE | `src/shell/AppShell.tsx` | Key shell navigation frame and protected contextual inspector boundary by view identity; old mobile drawer cannot reopen on browser Back, route or authorization-scope changes; preserve existing main/header/skip link and responsive/RTL defaults. |
| UPDATE | `src/shell/sidebar/HidraSidebar.tsx` | Key manual group/submenu state to current view identity and derive active parent from exactly published authorized registry after Back/Forward or permission/scope change. Do not change route permissions, six sections or drawer dimensions. |
| CREATE | `src/shell/navigation/localTabRoute.ts` | Read/write only allowlisted non-sensitive `tab` query identities; preserve unrelated browser history query coordinates; default for unknown/forged tab IDs. |
| CREATE | `src/shell/navigation/localTabRoute.test.ts` | Allowlist, forged query fallback, unrelated query preservation and default tab omission. |
| UPDATE | `src/features/alarm/AlarmConsolePage.tsx` | Existing Active/History tabs use allowlisted `?tab=history` and browser Back/Forward; selection and alarm record/command details remain page-local and server-gated. |
| UPDATE | `src/features/analytics/AnalyticsWorkspacePage.tsx` | Existing four Analytics views use allowlisted URL `tab` coordinates and existing page permission checks; no new analytics calculations or backend queries. |
| CREATE | `src/shell/context/ContextDrawerProvider.scope.test.tsx` | Verify inspector content cannot reappear across scope/history boundary remount, including return to previously visited context. |
| CREATE | `tests/e2e/mobile-deeplinks.spec.ts` | Five synthetic browser cases covering mobile Escape/open/close, Back/Forward non-reopening, direct nested link and exact active ancestry, unauthorized ancestor hiding, generic 404 and protected root redirect. |
| UPDATE | `tests/e2e/alarm.spec.ts` | Browser Back/Forward tab restoration and current selected tab without weakening HWEB-008 alarm response checks. |
| UPDATE | `docs/06-Navigation-Blueprint.md`, `docs/10-Design-System-Specification.md`, this `docs/roadmap/ULTIMATE_ROADMAP.md` | Append-only architecture, acceptance, legacy/status and evidence record. |
| DELETE | None. |
| Exact commit message | `feat(shell): implement UXR-07 safe mobile and deep-link restoration` | Existing `main` with expected-head guard; no branch or PR. |

**Existing behavior preserved, not reimplemented:** `src/app/router/router.tsx` already has an authenticated index redirect from `/` to `/overview`, a protected `*` / Not Found fallback, lazy route loading and guarded login return location. MUI temporary Drawer already handles keyboard/Escape and LTR/RTL anchors. UXR-07 adds safe state lifetime and browser proofs rather than duplicating those components. Current non-tab resource/form/selected-record context remains **page-owned and non-persisted**; it must be discarded when route/scope/grants change, never inferred from an untrusted URL.

**Security/operation boundaries and limitations:** A tab ID, route URL or selected sidebar group carries **zero authority**. The sidebar continues hiding items missing the current effective-grant/published-route module intersection; protected data still needs backend and page permission checks. UXR-09/P3 owns full operational-context reauthorization and cross-module query cache invalidation; UXR-07 alone is not proof of authoritative scope-switch authorization, production readiness or SITE acceptance. No OT access or numerical simulation changes. No Playwright skips/retries, runtime timeouts, test fixture relaxations or 900 KiB budget changes.

**Required exact-SHA acceptance:** Code CI OpenAPI compatibility, lint, TypeScript, complete unit/component + performance, packaged build/bundle, full Chromium Playwright including UXR-07 and all preexisting tests, successful A1 six-module API/PostgreSQL W4 human review/denial and F18 LOCAL session qualification, plus Documentation Validation. Local source inspection and synthetic fixtures are not site validation.

**Current status:** **IMPLEMENTATION PREPARED; NEW EXACT-SHA CI PENDING.** G2 remains OPEN until UXR-07 CI and any applicable engineering acceptance. Next registered phase is P3/UXR-08, **not selected or executed**.


---

### P2 / UXR-07 — Code CI #1066 full dual-failure assessment and bounded repair (22 November 2026)

**Predecessor and failing exact SHA:** UXR-06 passed the full Code CI #1065 and Documentation Validation #101 on `b330b46e276ab45de4c5a22a2ff545b12286f703`. The UXR-07 source commit `88c36b3087a7869720af134412224112de931d99` (tree `61c5fbd9ca884a4929aaac96c1e55de2475fc498`) triggered [HidraWEB Code CI #1066](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45034979672), attempt 1, **FAILED**; [Documentation Validation #102](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45034979710) **PASSED**.

**All failed jobs and step evidence:**

| CI job / stage | Actual observed result and location | Classification |
|---|---|---|
| `verify` (failed) | OpenAPI/client contract, lint, TypeScript **PASS**; **192 unit/component tests PASS**; **6 performance tests PASS**; initial JS **728.9 KiB / 900 KiB PASS**; production build passed. Full Playwright: **90 passed, 1 failed, 15 skipped**. The sole failing browser test is HWEB-008 alarm suppression/response at `tests/e2e/alarm.spec.ts:61`, `getByRole('button',{name:'Acquitter'}).click()` after `page.goBack()`; no element found during all three attempts (test's existing 30s timeout). | Cross-route selected-record restoration was intentionally removed by UXR-07; legacy test assumed alarm detail panel remained open after Back. The specific test must reopen the authorized alarm record from its list before it can execute the preserved backend acknowledgement. No test command or permission checks may be dropped. |
| A1 six-module native API/PostgreSQL (failed) | Preflight / API and fresh synthetic PostgreSQL setup ran. The mandatory W1–W3 browser lane: **6 passed, 1 failed**; failure `tests/e2e/foundation-topology-live.spec.ts:18` and `:38` at `Station type` combobox click, `Test timeout of 90000ms exceeded`; log records `element is not stable`, then `element was detached from the DOM`. W1–W3 remaining denial test passed. **W4 browser qualification NOT REACHED**, so no W4 acceptance claim on this SHA. | UXR-07 keyed `AppShellFrame` and the inner contextual `Outlet` to `location.key`. Native authoring changes query parameters with `setSearchParams({company,system,...})` within `/network`, creating router entries, remounting and losing the ongoing form. This source-level cause is a confirmed architectural incompatibility and consistent with the logged unstable/detached element; exact browser event timing is not independently proven from the truncated console trace. |
| F18 LOCAL session (passed) | Native renewal and logout **5 passed, 0 failed/flaky/skipped** | Not a cause of either failure. |
| Documentation Validation #102 (passed) | Docs workflow success on same exact SHA | Docs pass does not override Code CI failure. |

**Related risks assessed:** Other workflows that update `location.search`, especially the new Alarm/Analytics allowlisted `?tab=` controls, could lose form/selection state under a full-frame history-entry remount. A route switch **must** still clear the prior selected record/inspector; preserving it would contradict the registered security intent. Avoid increasing W2/Playwright timeouts, skipping native cases, pinning a default in test data, loosening backend permissions, dropping status/rollback/409 checks or altering the SQL/OT boundary. The Node `setup-java@v4` deprecation/Node 20 compatibility warnings are unrelated to the recorded test failures; the A1 failure is *not* established as a PostgreSQL migration or lock fault.

**Bounded repair envelope — same registered UXR-07, NOT a new phase:**

| Action | Path | Exact reason |
|---|---|---|
| UPDATE | `src/shell/navigation/useNavigationContextKey.ts` | Keep the deterministic **entry identity** for mobile/accordion but add pathname-only **protected workspace identity** for same-path URL query stability; both include current principal/scope/effective module grants. |
| UPDATE | `src/shell/navigation/useNavigationContextKey.test.ts` | Assert query-history variation preserves workspace identity; verify route/principal/scope/grant changes invalidate it; retain entry-key tests. |
| UPDATE | `src/shell/AppShell.tsx` | Remove whole-`AppShellFrame` `location.key` remount; key only the protected `ContextDrawerProvider` / `Outlet` by pathname/principal/scope/grants. Clear mobile open state on a navigation-entry identity change without stale Back/Forward resurrection. Preserve toolbar/RTL/skip link. |
| UPDATE | `src/shell/sidebar/HidraSidebar.tsx` | Explicitly clear manual accordion/submenu selections when the authorized history-entry key changes, since the whole shell is now stable. Keep six groups and permission filtering, 272/72, nested Assets. |
| UPDATE | `tests/e2e/alarm.spec.ts` | After Back from workflow Tasks, assert Alarm URL/list, reopen the existing alarm, check detail/shelving and enabled acknowledge, then execute and retain busy-state, backend command and success assertions. Maintain the separate UXR-07 tab-history test. |
| UPDATE | `src/shell/context/ContextDrawerProvider.scope.test.tsx` | Add same-path context-survival and different-path cleanup assertions, maintaining no-stale-inspector tests. |
| UPDATE | `docs/06-Navigation-Blueprint.md`, `docs/10-Design-System-Specification.md`, `docs/roadmap/ULTIMATE_ROADMAP.md` | Append-only correction of the earlier overly-broad history-entry remount contract, exact CI evidence and still-open acceptance. |
| CREATE/DELETE | None | No API, migration, security boundary, test workflow or test timeout changes. |
| Exact repair commit | `fix(shell): keep UXR-07 workspaces stable across query history` | Publish directly to existing `main` with expected-head guard. |
| Local validation | Exact source diff and failed-test assertions reviewed; **no local Node, real PostgreSQL or Chromium execution claimed**. |
| Remaining acceptance | Fresh exact-SHA Code CI must pass all 192+ units, performance, 900 KiB budget, full Playwright, **all** W1–W3 plus mandatory W4 real PostgreSQL/browser journeys, F18 LOCAL and Documentation Validation. UXR-07 and G2 remain **pending** until then. |

**Status:** UXR-07 repair prepared, NOT CI-passed. P3/UXR-08 remains unselected.


---

### P2 / UXR-07 — Code CI #1067 React effect-state lint repair (22 November 2026)

**Exact SHA and verification:** `main` at `3c6b069b2df7dd49b4ffd265d85b16224a94072f`, tree `01a0a87e57c3623238031b939f21a9cb44f5b2a4`. [HidraWEB Code CI #1067](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45049158286) attempt 1 **FAILED** exclusively in the `verify` job's `Lint` step. ESLint reported **2 errors, 7 pre-existing/non-blocking fast-refresh warnings**: `src/shell/AppShell.tsx:27` synchronous `setOpenedAtNavigationKey(null)` in `useEffect` and `src/shell/sidebar/HidraSidebar.tsx:87` synchronous `setRequestedGroup(null)` / `setRequestedSubmenu(null)` in `useEffect`. Rule `react-hooks/set-state-in-effect` correctly prohibits these cascading render patterns. The errors were introduced by UXR-07's previous query-lifecycle repair; suppressing the lint rule or relaxing the workflow is **not** authorized.

**Other jobs were independently completed and green:** Native A1 API/PostgreSQL browser job **PASSED**: one A1 integrated case, all seven W1–W3 native browser cases (**7 passed, zero failed/flaky/skipped**), and both W4 independent human decision/denial cases (**2 passed, zero failed/flaky/skipped**). Native W2 persisted-system/station/installation/graph after browser reload **PASSED**; earlier query-keyed form-lifecycle failure is not present in this run. F18 LOCAL renewal/logout native job **PASSED** all five cases with no failed/flaky/skipped. [Documentation Validation #103](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45049158309) **PASSED** on the same exact SHA. Main `verify` stopped at lint: **TypeScript, unit/component tests, performance/bundle and full Playwright were not run on #1067**, so no new end-to-end acceptance can be asserted.

**Root cause:** The previous repair intentionally stopped remounting the full shell to preserve live authoring through query-string changes, but replaced keyed navigation lifecycle with effect-driven synchronous setters. The source and ESLint errors directly establish the cause; seven Fast Refresh warnings are not blocking and are outside the new change's scope. CI logs show no native database, API or authentication failure. A pathname-keyed workspace remains necessary.

**Bounded UXR-07 repair envelope:**

| Action | Exact path | Required fix |
|---|---|---|
| UPDATE | `src/shell/AppShell.tsx` | Extract local `ShellNavigation` with mobile open state and desktop sidebar toggle; render **only that child** with an authorized navigation-entry + breakpoint key; remove synchronous effect and preserve permanently mounted outer shell and pathname-keyed protected `ContextDrawerProvider`/`Outlet`. |
| UPDATE | `src/shell/sidebar/HidraSidebar.tsx` | Remove invalid synchronous state-clearing effect; keyed navigation chrome remount resets manual group/submenu on history/principal/scope/grant changes, with existing keyed guard and permission-filtered active ancestry still applied. |
| UPDATE | `docs/06-Navigation-Blueprint.md`, `docs/10-Design-System-Specification.md`, this `docs/roadmap/ULTIMATE_ROADMAP.md` | Append-only technical correction, exact-SHA failure evidence and acceptance gate. |
| CREATE/DELETE | None | No change to route ownership, backend endpoints, access checks, database, alarms, workbench, native fixtures, lint/CI policies or timeout/skips. |
| Exact message | `fix(shell): reset UXR-07 navigation through keyed chrome` | One guarded direct-main repair, no PR/branch. |
| Local validation | Inspected exact source and prepared deterministic source diff removing both `useEffect` violations; **no local npm/TypeScript/Playwright/PostgreSQL execution claimed**. |
| Acceptance | Fresh exact-SHA Code CI must pass Lint, TypeScript, **192+ unit tests**, six performance tests, initial JS **under 900 KiB**, complete Playwright including mobile/deep-link and alarm journey, native A1 W1–W3 **and** mandatory W4, F18 LOCAL, and matching Documentation Validation. |

**Current state:** UXR-07 **repair prepared, CI acceptance open**; P3/UXR-08 **not started**. Code CI #1067 native success alone is insufficient to close G2.


### P2 / UXR-07 — Code CI #1068 contextual drawer test isolation (22 November 2026)

[HidraWEB Code CI #1068](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45050246333) attempt 1 failed on `0ccd4a950ced76c2c7fd5602447b6d2d748a853f` (tree `8af277a5417b21001dccb0f3877ba61136698a0c`). OpenAPI compatibility, lint and TypeScript passed. The unit and component step reported 193 passed and one failed. Native A1 API/PostgreSQL/browser qualification and F18 LOCAL passed independently. [Documentation Validation #104](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45050246360) passed on the same SHA. The main verification job stopped before performance, build and full Playwright.

The second test in `src/shell/context/ContextDrawerProvider.scope.test.tsx` found two accessible “Inspect asset” buttons because the first test left its React tree mounted. The failure reproduced locally. The repair registers Testing Library cleanup in a suite-local Vitest `afterEach` hook. Both scoped drawer cases and the related drawer/navigation tests passed after the change, with their original assertions.

**Repair scope:** the scoped drawer test and this append-only evidence entry. **Commit:** `test(shell): isolate UXR-07 contextual drawer tests`.

**Acceptance:** UXR-07 and G2 remain open pending fresh exact-SHA Code CI and Documentation Validation, including unit and performance checks, the 900 KiB budget, full Playwright, native A1/W1–W4 and F18 LOCAL. The next registered task is P3 / UXR-08.


### P2 / UXR-07 and G2 — exact-SHA CI acceptance (22 November 2026)

[Code CI #1069](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45051430546) and [Documentation Validation #105](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45051430504) passed on `c888cf2e9f1c026f35910bbcd4312e0944de82d7`, tree `6298a4b40970ab3c02fa665adcfd677a3ac00f5f`. Code CI passed 194 unit/component tests, six performance tests, the 728.9 / 900 KiB startup budget and Chromium Playwright (91 passed, 15 pre-existing configured skips). Both native jobs passed, including A1/W1–W4 with the mandatory W4 decision and denial journeys and F18 LOCAL. **UXR-07 is CI-passed and G2 is satisfied for the registered frontend delivery scope.** Deployment and operational acceptance are outside that evidence.

### P3 / UXR-08 — header identity, controls and session entry (22 November 2026)

**Selection:** Owner “Next” selects one whole UXR-08 task after G2. The verified UXR-07 commit is the expected parent. **Exact implementation message:** `feat(shell): complete UXR-08 header and session entry`.

| Path | Scope and verification |
|---|---|
| `src/shell/navbar/HidraNavbar.tsx`, `src/shared/i18n/resources.ts` | Link the HIDRA product identity to protected Overview, label the configured environment as configuration, and present the authenticated principal and actual provider in an accessible profile menu. Keep the existing sidebar toggle, FR/EN/AR picker and sign-out action. |
| `src/app/bootstrap/runtimeConfig.ts`, `src/app/router/router.tsx`, `src/app/pages/LoginPage.tsx`, `src/app/pages/OidcCallbackPage.tsx` | Use one deployed OIDC configuration decision for enterprise sign-in and callback registration. Preserve LOCAL entry and the current HidraAPI session lifecycle. Present localized progress and recovery on callback failure. |
| `src/app/pages/LoginPage.test.tsx`, new `src/app/router/router.test.ts`, `tests/e2e/bootstrap.spec.ts` | Exercise credential entry when OIDC is unavailable, configured and unavailable callback registration, and keyboard operation of the principal menu and Overview link. Existing native F18 retains renewal, expiry and logout coverage. |
| `docs/roadmap/ULTIMATE_ROADMAP.md` | Append the predecessor acceptance, scope and gate. |

**Dependencies and boundaries:** C1 Identity and security use the existing login, refresh, logout, current-principal and configured OIDC contracts. This stage adds zero REST endpoints. Environment state comes from frontend configuration. Native OIDC with a deployed IdP remains provider-dependent. Operational-context rebinding is UXR-09.

**Acceptance pending:** Fresh exact-SHA Code CI and Documentation Validation, including the standard unit/component, performance, 900 KiB, Playwright, A1/W1–W4 and F18 LOCAL gates. G3 includes the remaining P3 tasks. The next registered task is UXR-09.


### P3 / UXR-08 — Code CI #1070 login-test lint repair (22 November 2026)

[Code CI #1070](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45052716196) attempt 1 failed at Lint on `2351883aea92c4d03368b73626427c7351a94c83`, tree `090626e3b496853b2fa99fb79c96557738cc34e7`. The single blocking error was `@typescript-eslint/consistent-type-imports` in `src/app/pages/LoginPage.test.tsx`. The remaining seven lint findings were warnings. The main verify job stopped before type checking, tests, build and full Chromium. The A1 native PostgreSQL/browser and F18 LOCAL jobs and [Documentation Validation #106](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45052716124) passed on that SHA.

**Repair:** Use a type-only import for the Vitest partial mock type, retaining the original runtime config and OIDC test assertions. The repair changes the login test and appends this evidence entry. **Exact commit message:** `test(auth): fix UXR-08 login test type import`.

**Acceptance:** UXR-08 awaits fresh exact-SHA Code CI and Documentation Validation. UXR-09 remains the next registered task.


### P3 / UXR-08 — Code CI #1071 alarm navigation regression test (22 November 2026)

[Code CI #1071](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45053626091) attempt 1 failed on `99f825f82c2e22c74f548d9e71293dacacf8e337`, tree `471284b35ec00fc772b9ba17918d2c1c139bb05e`. Lint, type checking, 199 unit/component tests, six performance tests, build and the 729.7 / 900 KiB startup budget passed. The full Playwright run reported 91 passed, 15 configured skips and one failure. The A1 native PostgreSQL/browser and F18 LOCAL jobs and [Documentation Validation #107](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45053626104) passed.

In `tests/e2e/alarm.spec.ts`, the post-Back text locator matched both the alarm list cell and the prior detail heading. The test had waited only for the workflow URL before going Back. Wait for the workflow heading, then target the exact list row, assert the detail was discarded, and reopen that row before keeping the existing acknowledgement and suppression checks.

**Repair scope:** the alarm browser test and this append-only evidence entry. **Exact commit message:** `test(alarm): wait for workflow before checking Back restoration`.

**Acceptance:** UXR-08 awaits fresh exact-SHA Code CI and Documentation Validation. The next registered task is UXR-09.


### P3 / UXR-09 — exact operational scope rebind (22 November 2026)

Owner explicitly selected UXR-09 after the UXR-08 correction at WEB main
d25cd6740c8b52e372d45741d99ea0304173417b. Code CI #1072 and
Documentation Validation #108 passed at that exact SHA.

Exact commit message: feat(context): qualify UXR-09 operational scope rebinding.
UPDATE allowlist: src/features/context/api/identityOrganizationApi.ts,
src/features/context/components/OperationalContextSelector.tsx,
src/features/context/model/operationalContextModel.ts,
src/features/context/model/operationalContextModel.test.ts,
src/shell/model/useShellUiStore.ts, src/app/auth/AuthProvider.tsx,
src/shell/navigation/useNavigationContextKey.ts,
src/shell/navigation/useNavigationContextKey.test.ts,
src/shared/i18n/resources.ts, docs/06-Navigation-Blueprint.md and this roadmap.
CREATE allowlist: src/features/context/api/identityOrganizationApi.regional.test.ts.
DELETE: none. No API, migrations, release, simulation or OT changes.

T39 current Identity access must match companyPartyId, resource kind and ID.
The earlier pinned generated Identity slice omits that newer read. The bounded
adapter uses an unknown response and strict positive exact-match validation,
not a competing hand-authored DTO. Current principal/Organization DTOs lack a
safe company lookup, so explicit company input is required and then checked
against Identity. No unapproved company-scope inference is introduced.

Required acceptance: fresh same-user principal and effective grants, linked
employee's time-effective responsibilities, exact positive Identity decision,
fail-closed denial and revocation, old scoped-cache and route clearing,
UXR-07 navigation lifetime regression, EN/FR/AR usability, and exact-SHA
Code CI (OpenAPI, lint, TS, unit, performance, bundle, Chromium, A1 native
PostgreSQL/API W4 and F18 LOCAL) plus Documentation CI. State on publication:
IMPLEMENTED / HOSTED CI PENDING; no production/SITE acceptance.
Next registered candidate P3/UXR-10 remains unselected. G3 remains open.

UXR-09 prepublication review: keep the context chooser mounted while it verifies
fresh Identity and Organization responses; only after the result/denial is known
change the navigation key and return to Overview. Unmount/session transition
invalidates pending request epochs. Clear the selected company on sign-out from
AuthProvider, preventing a following principal inheriting stale context.


### P3 / UXR-09 — Code CI #1073 test-fixture TypeScript repair (22 November 2026)

[Code CI #1073](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45056835932)
at UXR-09 source SHA `71c58776c454702c15cbc3c947b8c345d9465fbf`
failed in `verify` at `npm run typecheck`: four TS2322 errors in
`src/features/context/model/operationalContextModel.test.ts` because the
UXR-09 test constant `scope` widened `type: 'PIPELINE_SYSTEM'` to
`string`, not the generated `OperationalScopeResponseType` union.
OpenAPI compatibility and ESLint passed (seven non-blocking warnings);
tests/performance/build/complete Playwright did not run in `verify` after
typecheck. Independent A1 six-module native PostgreSQL/API browser qualification,
F18 LOCAL and [Docs #109](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45056835960)
passed on the failed SHA; these do not substitute for the missing `verify` gates.

**Bounded same-task repair:** annotate that exact fixture as the already imported
generated `OperationalScopeResponse`, preserving positive/negative assertions,
all production logic and the original strict test/CI settings.
Exact UPDATE scope: `src/features/context/model/operationalContextModel.test.ts`
and append this roadmap; CREATE/DELETE none. **Exact repair message:**
`test(context): type UXR-09 regional scope fixture`.
No API or other module changes, no skipped checks, no relaxed types or bypass.
**Status:** UXR-09 CI qualification pending a new exact-SHA Code CI and Docs CI.
The next unselected task remains UXR-10; G3 remains open.


### P3 / UXR-09 — Code CI #1074 and complete-failure review (22 November 2026)

[Code CI #1074](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45057610961)
on `9b197e474faccc5c70ba9100ee8b40a1a14228e6` failed in the `verify`
unit/component stage. OpenAPI compatibility, pinned client generation, lint
(0 errors, 7 warnings), and TypeScript passed. Vitest finished 202 passing
and 1 failing assertions across 72 files: the newly added
`identityOrganizationApi.regional.test.ts` opaque 404 denial assertion
reported `Error: 404` at its mocked rejection. No other failed tests were
reported by that completed Vitest run. Subsequent `verify` performance,
build/bundle, release package/verification and full Chromium steps were
**not executed** and therefore cannot be claimed to pass. Independent A1
six-module native API/PostgreSQL and F18 LOCAL qualification and
[Documentation CI #110](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45057610918)
passed on that SHA.

A same-task source/accepted-backend review also found a supported resource-kind
omission: the accepted HidraAPI T33 `ResolveRegionalAccessUseCase.ResourceKind`
at `f0310330ae8eb58f8bf00400b29afeb5baccb869` supports
`PIPELINE_SEGMENT`, while the WEB local candidate predicate excluded it.

**Bounded repair:** explicitly catch the mocked 404 and verify its original
error identity and exact GET/params, preserving the fail-closed denial
assertion; admit `PIPELINE_SEGMENT` to the local candidate filter only and
add positive/negative model regression assertions. The server remains the
sole authority for exact current company/resource access. Existing strict
CI checks, independent native qualification, and all other behavior remain
unchanged. Exact UPDATE scope: `src/features/context/api/identityOrganizationApi.regional.test.ts`,
`src/features/context/model/operationalContextModel.ts`,
`src/features/context/model/operationalContextModel.test.ts`, and this
append-only roadmap. CREATE/DELETE none. Exact message:
`fix(context): qualify UXR-09 denial and segment access`.

**Acceptance:** fresh exact-SHA full Code CI and Documentation Validation still
required; downstream gates cannot be predicted from the prior truncated run.
UXR-10 is the next registered **unselected** task; G3 remains open.


### P3 / UXR-10 — authorized navbar shortcuts and WEB connectivity (22 November 2026)

**Predecessor accepted:** UXR-09 on WEB main `6ff9afe1524a015f1613fad1cf53651a5c5a46dd`
(tree `e6b94a779ad901fc7f55a3b87cae391e1c4b886b`):
[Code CI #1075](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45059275402)
PASS and [Documentation #111](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45059275528)
PASS at the exact same SHA. Owner's `Next` selected **one** whole registered
UXR-10 stage, not all P3 tasks. Root AGENTS.md remains absent; repository
README/canonical architecture plus project WEB_AGENTS guidance were read.

**Exact commit message:** `feat(shell): qualify UXR-10 shortcuts and web connectivity`.
UPDATE: `src/shell/navbar/HidraNavbar.tsx` (authorized navigation controls,
no header badges), `src/shared/i18n/resources.ts` (EN/FR/AR status copy),
`docs/06-Navigation-Blueprint.md` (ownership/limitation), this roadmap.
CREATE: `src/shell/navbar/headerShortcutAccess.ts` (pure published-route
and effective-permission gate), `src/shell/navbar/headerShortcutAccess.test.ts`
(positive/negative registration regression),
`src/features/connectivity/useWebOriginConnectivity.ts` (bounded same-origin
WEB reachability only), `src/features/connectivity/useWebOriginConnectivity.test.ts`
(transport/non-2xx failure behavior), `tests/e2e/header-shortcuts.spec.ts`
(keyboard link, denial, offline/recovery browser). DELETE: none.

**Bounded behavior:** open the already implemented Workflow assigned-task
workspace only with a currently published/granted `workflow:tasks:read` GET.
Open existing **evidence-only** Notification route only when its separate
T27 `notification:inbox:read` GET and workbench GET evidence-read permission
are published and granted; the header never infers an exact facility, reads
unknown protected inbox data, or supplies a global unread count. Since no
server-issued facility is available from this navbar, a facility-specific
T27 inbox is deliberately **not** opened. Realtime provider remains
unconnected; browser WEB-origin HEAD status is not an API/OT/live-event claim.

**Acceptance pending:** exact-SHA Code CI openapi/generation, strict lint/TS,
unit+performance, production bundle budget, release artifact, full Chromium
(including explicit UXR-10 synthetic shortcut/denial/reconnect scenarios),
A1 native PostgreSQL W1–W4, F18 LOCAL, Documentation CI. No mock is SITE
or production acceptance. Next registered task UXR-11 remains unselected.


### P3 / UXR-11 — typed Topology-local regional search (22 November 2026)

**Predecessor:** `5e8e43d9e6404e38225908389954144a251c7de5`, tree
`bdfae9303ee83b69a359ee50995b16c9a5a95052`, passed
[HidraWEB Code CI #1076](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45065184616)
and [Docs CI #112](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45065184673).
Owner's Next selected **one** whole UXR-11 task. Repository README, canonical
architecture, active roadmap and project WEB_AGENTS guidance govern; root
AGENTS.md is absent from the verified WEB tree.

**Accepted contract:** source at HidraAPI
`f0310330ae8eb58f8bf00400b29afeb5baccb869` T34
`RegionalTopologyMapController` and port require exact companyPartyId for
`GET /api/v1/topology/regional-map/search` and for exact feature detail,
with `topology:regional-map:search` and `topology:regional-map:read` route
grants, Identity resource filtering, post-scope totals, no-store and opaque
404. Generated pinned legacy Topology slice lacks regional endpoints; the
adapter reuses its `Feature` and `SearchResult` DTOs.

**Exact commit message:** `feat(topology): qualify UXR-11 regional network search`.
UPDATE `src/features/topology/NetworkTopologyPage.tsx` (context-split route),
`src/features/topology/i18n/topologyTranslations.ts` (EN/FR/AR),
`docs/06-Navigation-Blueprint.md` and this roadmap (append-only).
CREATE `src/features/topology/api/regionalTopologyApi.ts` (scoped T34 GETs),
`src/features/topology/api/regionalTopologyApi.test.ts`,
`src/features/topology/model/regionalTopologySearch.ts` (admission,
canonical identifiers), `src/features/topology/model/regionalTopologySearch.test.ts`,
`src/features/topology/components/RegionalTopologySearch.tsx` (server-paged
search and fresh typed navigation) and
`tests/e2e/regional-topology-search.spec.ts` (browser allowed/denied,
selected-context no legacy map, opaque denial). DELETE none.

**Acceptance:** exact-SHA Code CI OpenAPI/generation, lint, typecheck,
unit/component and performance, build and 900 KiB budget, release packaging,
full Chromium, independent A1 native API/PostgreSQL W1–W4, F18 LOCAL and Docs CI.
Synthetic browser checks are not operational/SITE acceptance. UXR-12 is next
registered **unselected** task; G3 engineering acceptance still separate.


### P4 / UXR-12 — shared workspace heading and toolbar (22 November 2026)

**Predecessor exact-SHA acceptance:** UXR-11 commit
`84533dfbd98e482e77f0bacfe55c69a1b59e4f54`, tree
`0fa0723c4f4f6c461cabd1cd9701d8273ef352dc`, passed
[Code CI #1077](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45067661912)
and [Documentation CI #113](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45067661936)
with all `verify`, A1 native PostgreSQL/API, F18 LOCAL and documentation
jobs successful. The owner's `Next` selected only registered UXR-12.

**Exact commit message:** `feat(workspace): add UXR-12 owner-gated heading and toolbar`.
CREATE `src/shell/workspace/WorkspaceHeading.tsx` (semantic h1, fixed
breadcrumbs, optional owner-sourced status, explicit permitted actions),
`src/shell/workspace/WorkspaceToolbar.tsx` (responsive owner-composed
second-row controls and authorized refresh), their
`WorkspaceHeading.test.tsx` and `WorkspaceToolbar.test.tsx` (keyboard,
semantic headings, denial, owner status, disabled refreshing), and
`tests/e2e/workspace-heading.spec.ts` (authorized/denied Overview action,
Workflow task breadcrumb/refresh and no extra protected call).
UPDATE `src/app/pages/OverviewPage.tsx` (first owner-gated heading adoption),
`src/features/workflow/WorkflowTasksPage.tsx` (same heading, trusted owner
status when a task detail is read, move inbox refresh to second row),
`docs/06-Navigation-Blueprint.md` and this append-only roadmap. DELETE none.

**Security/ownership:** The frame never fetches protected content, computes
business states or invents actions. A displayed status requires an explicit
owner source and label, not a CSS status color. Header actions and toolbar
refresh require the owning page's currently effective permission checks.
Each page/operation continues to rely on HidraAPI for final authorization;
Workflow task transitions retain backend-issued current versions and conflict
handling. Existing sidebars, cross-context caching and auth lifecycle stay
unchanged. Component availability does not establish migration of all 19
workspace routes, full WCAG certification, deployment, live OT or SITE
acceptance.

**Pending acceptance:** exact-SHA Code CI OpenAPI/generation, lint, TS,
unit/component and performance, build and 900 KiB budget, release verification,
full Chromium, A1 native PostgreSQL/API W1–W4, F18 LOCAL and Documentation CI.
No skipped gates or weakened existing tests. Next registered task UXR-13
remains **unselected**; G4 stays open pending remaining work and acceptance.


### P4 / UXR-12 — exact-SHA Code CI #1078 failed unit-test isolation repair (22 November 2026)

**Observed failure at main** `ddbcfa41fb51720efe32cdc38a9dd7afefad3a6f`, tree
`7ad7e1c9166c78a76f21a3c926a9ae3afeee2695`:
[Code CI #1078](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45069746898)
completed FAILURE, one test of 219 failed (218 passed; 78 test files).
`verify` passed generation, lint and TypeScript, then failed at
`src/shell/workspace/WorkspaceHeading.test.tsx:46` because the first test's
rendered owner `OPEN` status remained mounted when the second test asserted
that a status should be absent. `tests/setup.ts` has no RTL cleanup and
`vitest.config.ts` uses non-global Vitest. This is test isolation, not an
observed authorization-policy or production-rendering defect. The independent
A1 fresh-PostgreSQL/API and F18 LOCAL jobs passed, and
[Documentation CI #114](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45069746892)
passed. Code CI performance, production bundle, release artifact and full
Chromium were **skipped**, not passed. All reported job failures reviewed;
later skipped gates remain unverified.

**Bounded repair message:** `fix(workspace): isolate UXR-12 component test renders`.
UPDATE only `src/shell/workspace/WorkspaceHeading.test.tsx`,
`src/shell/workspace/WorkspaceToolbar.test.tsx` and append-only roadmap.
Explicit `afterEach(cleanup)` in the new UXR-12 tests prevents cross-test
DOM leakage while preserving all authorization and status-negative assertions.
No component/production source, backend, migrations, workflow, configuration,
acceptance thresholds or tests were removed or weakened. No new API evidence
required. Exact-SHA full Code CI and Documentation Validation remain pending
before UXR-12 can be marked CI-passed; next UXR-13 remains unselected.


### P4 / UXR-13 — six owner-controlled workspace canvas layouts (22 November 2026)

**Predecessor exact-SHA acceptance:** UXR-12 repair
`41879471ac1c970c17b568af31a4f7f2acd10a2c`, tree
`2c951fc907cf1765529fb26d12be3597823e4f84`, passed
[Code CI #1079](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45070824709)
and [Documentation CI #115](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45070824737),
including verify, A1 native PostgreSQL/API, F18 LOCAL and documentation.
Only registered UXR-13 is selected by the owner's Next.

**Registered scope:** six responsive presentation canvases (`map`,
`synoptic`, `summary`, `register`, `trend-detail`, `editor`) with
explicit ready/loading/empty/degraded/unavailable states. Layout selection,
labels and data admission belong to their owning page; this frame contains
no new API, permission rules, caching or domain calculations. Real map and
trusted Telemetry endpoints remain the existing owner contracts; UXR-24
station-signal placement/synoptic is **not** established by a frame.

**Exact commit message:** `feat(workspace): qualify UXR-13 responsive canvas layouts`.
CREATE `src/shell/workspace/WorkspaceCanvas.tsx` (typed variants, optional
trend/detail aside, explicit state replacement and authorized retry),
`src/shell/workspace/WorkspaceCanvas.test.tsx` (all six modes, state
isolation, owner-only retry and accessible landmarks), and
`tests/e2e/workspace-canvas.spec.ts` (narrow summary, granted/denied Workflow
register, degraded Topology map without stale geometry). UPDATE
`src/app/pages/OverviewPage.tsx` (four-card summary layout),
`src/features/workflow/WorkflowTasksPage.tsx` (assigned register state),
`src/features/topology/NetworkTopologyPage.tsx` (only legacy admin-map
canvas and safe error/empty rendering),
`src/features/topology/i18n/topologyTranslations.ts` (EN/FR/AR map empty and
canvas descriptions), `docs/06-Navigation-Blueprint.md`, and this canonical
append-only roadmap. DELETE none. UXR-12 heading/toolbar, T34 regional
search, all security gates, owner Workflow transitions and CI tooling retained.

**Known boundaries:** only Overview, My Tasks and the existing admin map
adopt canvases in this step; all six reusable variants are tested but true
operational synoptic signal placement, persisted editor flow, data trends and
owner-provenance belong to their separately registered tasks. Explicit
loading/empty/failure states are not evidence of real measurements. Existing
G4 is still unaccepted. No production deployment or SITE qualification.

**Pending exact-SHA acceptance:** OpenAPI generation compatibility, lint,
TypeScript, all unit/component and performance tests, bundle size, release
artifact verification, full Chromium (including UXR-13), native A1 W1–W4,
F18 LOCAL and Documentation CI. UXR-14 remains the next **unselected** task;
do not advance until this SHA passes and the owner invokes Next.


### P4 / UXR-13 — CI #1080 TypeScript repair (22 November 2026)

**Observed source of truth:** `main` at UXR-13 commit
`cea1af876719f4de72703eefb7fc267b73c41dfd` (tree
`068f0fec6b1bed231dcacc04de53aaa7ef618a08`).
[Code CI #1080](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45072766690)
completed FAILURE in `verify` during Typecheck after OpenAPI generation and
lint. The sole reported compiler error was `TS2769` at
`src/shell/workspace/WorkspaceCanvas.tsx:62`: the pinned MUI `Stack`
component does not accept direct `alignItems` with current typings.
Lint completed with zero errors and seven warnings. The unit/component,
performance, production-build, release-package and full Chromium steps were
**skipped** and remain unverified, not accepted.
The independent F18 LOCAL and A1 native PostgreSQL/API jobs succeeded, and
[Documentation Validation #116](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45072766661)
succeeded. All CI job conclusions and failed steps were examined.

**Repair message:** `fix(workspace): use sx alignment in UXR-13 loading canvas`.
UPDATE only `src/shell/workspace/WorkspaceCanvas.tsx` (move the centered
loading-state alignment from the unsupported `Stack.alignItems` prop into
`Stack.sx` while keeping the same content, role, loading behavior and
visual position) and append-only this roadmap. No tests, permissions,
backend endpoints, data contracts, workflows or CI gates removed or weakened.
The final acceptance requires a new exact-SHA Code CI and Documentation CI
pass; UXR-14 remains unselected. No engineering/SITE acceptance inferred.


### P4 / UXR-14 — owner-bound ContextInspector and Right Drawer (22 November 2026)

**Admission evidence:** UXR-13 repair `743d32768d7654a2ccfdf27c8302de696145e18e`
(tree `dd3c927fb873c8a8d76ff0f2dc1cb0b3ec9a91a9`) passed
[Code CI #1081 attempt 2](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45073557962):
verify, F18 LOCAL and A1 native PostgreSQL/API all succeeded. The first
attempt's W4 missing-timeline error did not recur on the failed-job retry;
its transient cause is not proven. [Documentation CI #117](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45073557869)
succeeded. Only UXR-14 is selected by Next; later P4/P5 stages remain
unselected.

**Authorized scope and message:** `feat(workspace): add UXR-14 owner-bound context inspector`.
CREATE `src/shell/context/ContextInspector.tsx` (labelled responsive MUI
modal drawer, close/Escape, MUI focus restoration),
`src/shell/context/ContextInspector.test.tsx` (atomic selection and absence
of old content),
`src/features/workbench/components/WorkbenchDetailPanel.test.tsx` (exact
owner read, absent grant, denial and response mismatch) and
`tests/e2e/context-inspector.spec.ts` (keyboard focus, narrow viewport,
owner denial). UPDATE `src/shell/context/ContextDrawerProvider.tsx` (single
atomic selection with current scope key retained),
`src/shell/context/ContextualDrawer.tsx` (delegate to shared inspector),
`src/features/workbench/components/WorkbenchDetailPanel.tsx` (exact owner
GET with no stale cached details, current detail-grant check, no blind retry,
record-identity match), `src/features/workbench/OperationalWorkbenchPage.tsx`
(selection invalidation and defensive owner scope),
`src/features/context/components/FixedResourceWorkspace.tsx` (same fixed
resource selection guards), `src/features/topology/NetworkTopologyPage.tsx`
(clear legacy map selection on layer changes and no stale map click),
`docs/06-Navigation-Blueprint.md` and this append-only roadmap. DELETE none.
No backend modules, Java/migrations, OpenAPI pins, authorization outcomes,
Workflow transition rules, CI workflows or pre-existing tests changed.

**Meaning and limits:** context inspector is a presentation/selection
boundary; the specialized owner chooses the detail read and claims its own
scope. Verified Workbench generic detail GET is the native read-back example.
Unscoped topology feature inspection continues to show already owner-issued
map features; it does not claim fresh pipeline dossier GET, cross-owner
join, or regional/engineering qualification. The regional T34 URL-bound
feature GET remains separate and unmodified. The Workflow exact-task GET
remains the W4 native flow, not moved into a modal. No 19-workspace migration,
new REST endpoint, simulator, live OT feed or production qualification implied.

**Pending exact-SHA acceptance:** OpenAPI compatibility, lint, TypeScript,
unit/component tests, performance threshold, production bundle and artifact
checks, full Chromium (including UXR-14), independent A1 W1–W4 PostgreSQL/API,
F18 LOCAL and Documentation Validation. Do not mark UXR-14 CI-passed until
this SHA satisfies all gates. UXR-15 is the next registered **unselected**
stage.


### P4 / UXR-14 — CI #1082 isolated i18n test-harness repair (22 November 2026)

**Observed exact-SHA failure:** `main` at
`505d01a3543a918970cfc45cd9bdbc270d70190a`, tree
`5ed43cfa42f6403ee606f5c381089b5d57c90e35`. In
[Code CI #1082](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45075606086),
the `verify` job passed OpenAPI generation, lint and TypeScript but failed
`Unit and component tests`: 228 passed, one failed across 81 files. The
single failure was `src/features/workbench/components/WorkbenchDetailPanel.test.tsx:56`,
where the missing-current-grant test expected the translated French
Workbench-unavailable warning but the isolated render emitted the untranslated
key `workbench.capabilityUnavailable`. The test mounted only QueryClient;
it omitted `I18nextProvider`, and the CI log reported a missing react-i18next
instance. The application i18n resource contains the French message. This is
a test harness setup error, not proven missing authorization. Independent A1
fresh PostgreSQL/API and F18 LOCAL jobs passed. [Documentation CI #118](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45075606049)
passed. Performance, production build, release artifact and full Chromium
steps were **skipped**, not accepted.

**Exact repair message:** `fix(workspace): provide i18n in UXR-14 detail test harness`.
UPDATE only `src/features/workbench/components/WorkbenchDetailPanel.test.tsx`
(import the existing application `i18n` and wrap the existing test render
with `I18nextProvider`), and append-only this roadmap. Keep every existing
assertion: no unauthorized request, no protected detail, denied response,
current exact-record identity and successful authorized read. No production
component, backend calls, permissions, tests, migrations, OpenAPI pins or CI
thresholds removed or weakened. The pending acceptance is new exact-SHA full
Code CI plus Documentation CI; UXR-15 remains unselected.


### P4 / UXR-14 — Code CI #1083 Chromium initial-focus repair (23 November 2026)

**Exact-SHA evidence:** `b797b1f02a9c31d7dcd972740daf74211731d127`, tree
`2e146f5e3d900027232d8463f94557db8942798b`. [Code CI #1083](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45076304158)
completed FAILURE only in the `verify` job's full Playwright regression
(105 passed, 15 skipped, one failed, including two repeat failures of the
same assertion). OpenAPI compatibility, lint, TypeScript, 229 unit/component
tests, 99 node contract tests, six performance tests, build, and release
artifact verification succeeded before that failure. The isolated failing
browser assertion at `tests/e2e/context-inspector.spec.ts:56` requires the
context drawer's Close button to receive initial keyboard focus. Chromium
found the authorized feature and the labelled dialog, but the Close control
remained `inactive` throughout the 5-second assertion despite its React
`autoFocus` prop. MUI's modal focus trap may focus the container after
child-mount autofocus; this ordering is the targeted cause, not a reason to
remove the focus assertion. Independent A1 native PostgreSQL/API, F18 LOCAL
and [Documentation CI #119](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45076304048)
succeeded. The remaining keyboard-dismissal/mobile assertions were not
reached and are not yet proven.

**Repair message:** `fix(workspace): focus UXR-14 close action after drawer entry`.
UPDATE only `src/shell/context/ContextInspector.tsx`: attach an explicit
Close-button ref; on MUI Slide `onEntered` focus the button after modal
initialization/entry, rather than relying solely on child `autoFocus`.
Retain MUI temporary modal focus trap, Escape/backdrop handling and focus
restoration, aria-labelled dialog, narrow and RTL layouts, and all existing
Playwright assertions including return-to-invoker focus. Append this
roadmap entry, do not weaken tests or change owner authorization/REST calls.
Full Code CI and Documentation CI on the repaired SHA remain mandatory;
UXR-15 stays unselected.


### P4 / UXR-15 — source-bound StatusWithProvenance and EvidenceTimeline (23 November 2026)

**Admission evidence:** UXR-14 repair
`be7efb295dcd521c04a7506ff402a4e874d0ac49` (tree
`c48a30aba377a325d3c9710f97e5f41278e25055`) passed
[Code CI #1084](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45133014232),
including verify, Chromium, A1 native PostgreSQL/API and F18 LOCAL, plus
[Documentation Validation #120](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45133014333).
The owner selected exactly UXR-15 with Next; UXR-16 remains unselected.

**Implementation message:** `feat(workspace): add UXR-15 source-bound contextual evidence`.
CREATE `src/shell/evidence/evidenceTypes.ts` (discriminated owner-data
states and optional provenance), `evidenceTranslations.ts` (FR/EN/AR
labels), `EvidenceStateNotice.tsx` (non-ready fail-closed states),
`StatusWithProvenance.tsx` (source/quality/unit/time/version/effectivity),
`EvidenceTimeline.tsx` (explicit owner entries),
`EvidencePresentation.test.tsx` (including cached data suppression),
`src/features/workflow/model/workflowEvidence.ts` and its test (pinned
Workflow instance/timeline projection),
`src/features/telemetry-monitoring/model/telemetryEvidence.ts` and its
test (legacy point reading, exact-point filter). UPDATE
`src/shared/i18n/i18n.ts` (merge the evidence labels),
`src/features/workflow/WorkflowTasksPage.tsx` (owner instance status and
source-timeline display, preserving automatic W4 reload/read),
`src/features/telemetry-monitoring/TelemetryMonitoringPage.tsx` (latest
summary and on-demand history/trend using existing published legacy GETs),
`tests/e2e/operations.spec.ts` (progressive read and provenance browser
fixture), `docs/06-Navigation-Blueprint.md` and this append-only roadmap.
DELETE none. No existing tests removed, no CI, OpenAPI candidate, backend,
Workflow command/retry or access rules modified.

**Contract boundary:** the pinned Workflow candidate
`openapi/candidates/hidra-workflow-5817406923e53761577ac41bbc3f318b517c3977.json`
provides `InstanceView` and `TimelineEntry`; the pinned legacy Telemetry
candidate `openapi/candidates/hidra-telemetry-monitoring-da4ce33ead7db40776049c861027947b61b96270.json`
provides `ReadingView`. The pinned Topology candidate
`openapi/candidates/hidra-topology-f1fdc206c916a5266f609810c045c6b5688bfd49.json`
does not contain T39 restriction evidence or pipeline dossier endpoints, and
the pinned legacy telemetry candidate does not supply asset-scoped trusted
latest/history paths. That limitation is **not** backend absence evidence;
do not invent or call missing WEB contracts. No cross-owner Audit join, causal
link, qualified engineering pressure, clock accuracy, trusted SCADA state,
SITE acceptance or business realtime capability is claimed.

**Acceptance pending on implementation SHA:** OpenAPI pin compatibility,
lint, TypeScript, all unit/component and node contract tests, performance,
bundle/release artifact, full Chromium including UXR-15 lazy history,
A1 native W1–W4 and F18 LOCAL, and Documentation Validation. Only exact-SHA
success changes UXR-15 from implemented to CI-passed. UXR-16 is the next
registered **unselected** task.


### P4 / UXR-15 — Typecheck repair after Code CI #1085 (23 November 2026)

**Exact-SHA failure:** UXR-15 implementation `4b4812a73016277b4dfc5664c42bd4664fc4e089`
(tree `523d750dc3438ea0b8f2cc685fe8eaa4ec091ded`) yielded
[Code CI #1085](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45135209962)
FAILURE. Its `verify` job passed prior OpenAPI generation and lint, then
failed TypeScript `TS2769` at
`src/shell/evidence/EvidencePresentation.test.tsx:49:69` because
Testing Library `getByRole('heading', { name: 'Timeline', exact: true })`
uses an unsupported `exact` property in `ByRoleOptions`.
`name: 'Timeline'` already identifies the exact accessible name without
that option. This is a test compilation failure, not evidence of a runtime
provenance or permission defect. All unit/component, performance, build,
release artifact and Chromium checks were skipped downstream; no pass is
claimed. Native A1 PostgreSQL/API and F18 LOCAL passed independently, and
[Documentation Validation #121](https://github.com/CHOUABBIA-AMINE/HidraWEB/actions/runs/45135210022)
succeeded.

**Bounded repair message:** `fix(workspace): correct UXR-15 evidence heading test query`.
UPDATE only `src/shell/evidence/EvidencePresentation.test.tsx` to remove the
unsupported option while preserving the heading, table and all provenance,
denied/failed-content isolation and missing-field assertions. Append this
roadmap entry; no production TSX, access gate, REST contract, test coverage or
CI rule changes. Acceptance remains exact-SHA full Code CI and Documentation
Validation. UXR-16 stays registered and unselected.
