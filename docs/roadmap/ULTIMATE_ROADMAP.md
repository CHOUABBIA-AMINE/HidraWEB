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
