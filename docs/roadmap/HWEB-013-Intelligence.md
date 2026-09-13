# HWEB-013 — Intelligence

Status: HWEB-013-06 COMPLETE / HWEB-013-07 NEXT

## Accepted starting point

```text
HidraWEB verified main       : 073bc794c0fe22ad7d14736112d659320d59a082
HWEB-013-05 final-main CI    : 34754124781 — SUCCESS
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Accepted OpenAPI artifact    : 10307772022
Accepted artifact digest     : sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Backend owners               : risk, analytics, simulation, reporting
Current task                 : HWEB-013-06 — read/derive/recommend semantics COMPLETE
Next task                    : HWEB-013-07 — performance testing
```

HWEB-013-06 starts only from exact accepted main `073bc794c0fe22ad7d14736112d659320d59a082`, whose full main CI `34754124781` succeeded after the guarded HWEB-013-05 merge.

## Intelligence ownership rule

Hidra intelligence may read trusted operational data, create intelligence-owned records, derive analytics, evaluate metrics, run simulations, generate reports, and publish recommendations where HidraAPI explicitly exposes those operations.

It must not silently become the owner of operational source-of-truth state. A status enum, persistence record, analytic result, simulation result, report artifact reference, or recommendation is evidence, not authorization to synthesize lifecycle or operational actions. Frontend action availability must come from an exact published route, exact request contract, and exact permission metadata.

HWEB-013-06 locks this rule as an executable presentation contract across all implemented intelligence workspaces. The cross-workspace E2E visits risk, analytics, simulation, and reporting; verifies the visible read/derive/recommend boundary language; and records any non-read HTTP request to operational owner modules. The accepted expectation is an empty operational-write set.

## Shared read contract

All four intelligence modules use runtime-discovered generic workbench reads when JPA-backed resources are published:

```text
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

Java persistence type metadata may identify the expected view, but the actual runtime `resource` value returned by discovery is authoritative for list/detail/search calls. HidraWEB must not hard-code a competing resource endpoint catalog.

## Dedicated intelligence contracts

### Risk

```text
POST /api/v1/risk/evidence
POST /api/v1/risk/assessments
POST /api/v1/risk/registers
```

Exact DTO evidence is generated; HWEB-013-02 invokes no dedicated risk mutation.

### Analytics

```text
POST /api/v1/analytics/datasets
POST /api/v1/analytics/insights
POST /api/v1/analytics/projections/runs
POST /api/v1/analytics/metrics/evaluations
```

Exact DTO evidence is generated; HWEB-013-03 invokes no dedicated analytics mutation.

### Simulation

```text
POST /api/v1/simulation/models
POST /api/v1/simulation/scenarios
POST /api/v1/simulation/recommendations
POST /api/v1/simulation/runs
```

Exact DTO evidence is generated; HWEB-013-04 invokes no dedicated simulation mutation. A simulation recommendation is decision-support evidence unless and until an exact owner-published contract explicitly authorizes a separate operational mutation; no such operational application is synthesized by HidraWEB.

### Reporting

The accepted HidraAPI artifact publishes:

```text
GET  /api/v1/reporting/capabilities
POST /api/v1/reporting/definitions
POST /api/v1/reporting/artifacts
POST /api/v1/reporting/runs
POST /api/v1/reporting/requests
```

Legacy aliases are also present for definition creation, artifact generation, run queueing, and report requests.

Verified DTO evidence:

```text
CreateReportDefinitionRequest -> ReportDefinitionResponse
GenerateReportArtifactRequest -> ReportOutputArtifactResponse
QueueReportRunRequest -> ReportRunResponse
RequestReportRequest -> ReportRequestResponse
```

Critically, the accepted OpenAPI artifact contains **no report artifact retrieval/download GET endpoint**. `ReportOutputArtifactJpaEntity` stores metadata such as `fileName`, `mimeType`, `storageObjectReferenceId`, `documentReferenceId`, `checksum`, `sizeBytes`, `generatedAt`, and `expiresAt`, but those identifiers are evidence/reference metadata and are not themselves a frontend download contract. HWEB-013-05 therefore exposes no download/export action.

## Authorization

HWEB-013 uses the established fail-closed model for every generic read or dedicated operation:

1. obtain the exact route descriptor from `GET /api/v1/security/permissions/routes`;
2. intersect its exact permission with effective grants from `GET /api/v1/identity/me/permissions`;
3. fail closed when either route metadata or the effective grant is absent;
4. never guess permission strings from naming conventions;
5. treat backend HTTP 403 as final authority.

No intelligence permission code is hard-coded as a feature authorization assumption.

## Deterministic OpenAPI evidence

All intelligence slices derive from accepted HidraAPI artifact `10307772022`, digest `sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea`, for audited backend SHA `0c8643c17b2648e8be85c658854f57ea0faab765`.

- HWEB-013-02: risk slice via `orval.risk.config.ts`.
- HWEB-013-03: analytics slice via `orval.analytics.config.ts`.
- HWEB-013-04: simulation slice via `orval.simulation.config.ts`.
- HWEB-013-05: reporting slice via `orval.reporting.config.ts`.

The generic workbench client remains the authoritative read mechanism for the implemented intelligence list/detail workspaces. Dedicated generated clients provide deterministic DTO/route evidence and are invoked only when a task explicitly implements and authorizes the corresponding operation.

## Cross-module composition constraints

Allowed:

- neutral foreign IDs explicitly published by an intelligence-owned record;
- immutable/intelligence-owned snapshots of source evidence where the backend owns those snapshots;
- direct owner reads only when an explicit identifier and exact authorized contract justify them;
- derived calculations, projections, simulation runs/results/recommendations, report runs, and report artifacts owned by their intelligence module.

Forbidden:

- scanning foreign collections to infer associations not published by the intelligence record;
- copying foreign aggregates and treating copies as current owner truth;
- writing operational state because analytics, simulation, reporting, or recommendation evidence suggests a change;
- treating timestamps or version-looking fields as concurrency tokens without an explicit contract;
- inventing approve, publish, activate, close, cancel, queue, rerun, apply, download, or export actions from statuses or reference fields alone.

## HWEB-013 task boundaries

### HWEB-013-01 — inventory contracts — COMPLETE

Inventoried backend owners, dedicated controller routes, request/response classes, generic workbench reads, authorization constraints, status evidence, and deterministic OpenAPI prerequisites.

### HWEB-013-02 — risk views — COMPLETE

Implemented `/intelligence/risk` with runtime-discovered risk register/assessment list/detail reads, fail-closed workbench authorization, status-as-evidence semantics, deterministic risk generation, navigation, and E2E proof. No dedicated risk mutation is invoked.

### HWEB-013-03 — analytics datasets/insights/metrics — COMPLETE

Implemented `/intelligence/analytics` with runtime-discovered dataset, insight, metric-definition, and metric-evaluation views. Analytics remains owner only of derived evidence; generated dedicated POST contracts are not invoked.

### HWEB-013-04 — simulation scenario/run/result workspaces — COMPLETE

Implemented `/intelligence/simulation` with runtime-discovered scenario, run, result-summary, result-value, and result-series-reference views, exact persisted attributes, deterministic simulation OpenAPI generation, fail-closed reads, and no create/queue/publish/apply/rerun operational controls.

### HWEB-013-05 — report definition/run/export workspaces — COMPLETE

Implemented `/intelligence/reports` with runtime-discovered report-definition, report-request, report-run, and output-artifact metadata views, deterministic reporting OpenAPI generation, fail-closed reads, and no invented download/export or mutation semantics.

### HWEB-013-06 — read/derive/recommend semantics — COMPLETE

Enforced the existing intelligence presentation boundary without adding new mutation capability:

- risk continues to present backend-authoritative, read-only evidence and does not infer lifecycle actions;
- analytics continues to present analytics-owned derived/read evidence while operational source truth remains with its source modules;
- simulation continues to present results and recommendations as decision-support evidence rather than operational commands;
- reporting continues to present reporting-owned metadata while operational facts remain with their source modules and no artifact retrieval semantics are invented;
- `tests/e2e/intelligence-semantics.spec.ts` visits all four implemented intelligence workspaces under the exact generic workbench read grant;
- the E2E asserts the visible ownership/decision-support language for each workspace;
- the E2E monitors non-read requests and fails if any request targets operational owner modules including assets, topology, telemetry, monitoring, planning, custody, integrity, incident, leak detection, HSE, workflow, party, identity, organization, or alarms;
- HWEB-013-06 adds no dedicated intelligence mutation invocation and no operational mutation route;
- HWEB-013-07 performance work is not included.

### HWEB-013-07 — performance testing — NEXT

Must cover charts, large analytic results, and scenario comparisons only after HWEB-013-06 is fully accepted.

## Completion records

### HWEB-013-01

```text
Final product head              : e315610b93f48915b1423c78b487941651191f77
Final CI                        : 34746275714 — SUCCESS
```

### HWEB-013-02

```text
Frontend route                  : /intelligence/risk
Final product merge             : 33e4a6f232584f1c2662b8327f7399de0f49de46
Final product CI                : 34747359160 — SUCCESS
```

### HWEB-013-03

```text
Frontend route                  : /intelligence/analytics
Product PR                      : #60
Product merge                   : bbb913cb5494cf62fac68eb0784fabdeab14158f
Product post-merge CI           : 34748378201 — SUCCESS
Acceptance-repair final main    : 43c5ac3ec2f294d2d03c724d23236ecb3570bef4
Acceptance-repair final-main CI : 34751306964 — SUCCESS
```

### HWEB-013-04

```text
Frontend route                  : /intelligence/simulation
Product PR                      : #63
Product head                    : 73ba7631733048f0f0aaf98cb3e34fbe62fff290
Product exact-head CI           : 34752068837 — SUCCESS
Product merge                   : b3cdce250ed259d5ac601693605e6d3402a36bb3
Final-main CI                   : 34752210394 — SUCCESS
```

### HWEB-013-05

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : b3cdce250ed259d5ac601693605e6d3402a36bb3 / main
Product branch                  : hweb-013-05-reporting-workspaces
Product head                    : 0c817eac21fe946833e57692086134421ce1d66e
Product PR                      : #64
Product exact-head CI           : 34753969647 — SUCCESS
Product merge                   : 073bc794c0fe22ad7d14736112d659320d59a082
Final-main CI                   : 34754124781 — SUCCESS
Accepted OpenAPI artifact       : 10307772022 / sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Frontend route                  : /intelligence/reports
Dedicated reporting mutations   : none invoked
Artifact retrieval contract     : absent; no download/export control exposed
Tests                           : tests/e2e/reporting-workspace.spec.ts
```

### HWEB-013-06

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : 073bc794c0fe22ad7d14736112d659320d59a082 / main
Product branch                  : hweb-013-06-intelligence-semantics
Product test                    : tests/e2e/intelligence-semantics.spec.ts
Dedicated intelligence mutations: none invoked
Operational mutation semantics  : forbidden without exact owner-published route/request/permission contract
Recommendation semantics        : decision-support evidence; no silent application to operational owners
First product CI                : 34756425341 — FAILED only in new E2E assertion; generation/lint/typecheck/unit/build green
Corrected product CI            : 34756610425 — SUCCESS on pre-roadmap product head e9523dd034e68e15e9832ddccd40bc1ac704fc10
Final verification              : exact-head full CI required after this roadmap commit, then guarded PR merge and exact merge-SHA main CI
```

HWEB-013-07 must not begin until HWEB-013-06 exact-head PR verification, guarded merge, and exact merge-SHA main verification are accepted.
