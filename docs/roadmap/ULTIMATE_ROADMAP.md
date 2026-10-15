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
