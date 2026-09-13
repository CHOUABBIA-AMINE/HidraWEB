# HWEB-013 — Intelligence

Status: HWEB-013-05 COMPLETE / HWEB-013-06 NEXT

## Accepted starting point

```text
HidraWEB verified main       : b3cdce250ed259d5ac601693605e6d3402a36bb3
HWEB-013-04 final-main CI    : 34752210394 — SUCCESS
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Accepted OpenAPI artifact    : 10307772022
Accepted artifact digest     : sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Backend owners               : risk, analytics, simulation, reporting
Current task                 : HWEB-013-05 — report definition/run/export workspaces COMPLETE
Next task                    : HWEB-013-06 — read/derive/recommend semantics
Later UI task                : HWEB-013-07 — NOT STARTED
```

HWEB-013-05 starts only from exact accepted main `b3cdce250ed259d5ac601693605e6d3402a36bb3`, whose full main CI `34752210394` succeeded after the guarded HWEB-013-04 merge.

## Intelligence ownership rule

Hidra intelligence may read trusted operational data, create intelligence-owned records, derive analytics, evaluate metrics, run simulations, generate reports, and publish recommendations where HidraAPI explicitly exposes those operations.

It must not silently become the owner of operational source-of-truth state. A status enum, persistence record, analytic result, simulation result, report artifact reference, or recommendation is evidence, not authorization to synthesize lifecycle or operational actions. Frontend action availability must come from an exact published route, exact request contract, and exact permission metadata.

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

Exact DTO evidence is generated; HWEB-013-04 invokes no dedicated simulation mutation.

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
- writing operational state because analytics, simulation, or reporting evidence suggests a change;
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

Implemented `/intelligence/reports` with:

- runtime reporting workbench discovery rather than hard-coded resource endpoint names;
- report-definition views identified by `ReportDefinitionJpaEntity` metadata;
- report-request views identified by `ReportRequestJpaEntity` metadata;
- report-run views identified by `ReportRunJpaEntity` metadata;
- output-artifact metadata views identified by `ReportOutputArtifactJpaEntity` metadata;
- generic workbench detail reads for explicitly selected records;
- report request/run statuses rendered as evidence only;
- exact workbench list/detail route descriptors intersected with effective grants, failing closed when metadata or grants are absent;
- TanStack Query ownership of runtime resource/list/detail server state and local React state limited to tab/detail selection;
- deterministic reporting-only OpenAPI generation through `orval.reporting.config.ts` from the accepted HidraAPI artifact;
- exact definition/request/run/artifact POST DTO contracts generated for evidence while HWEB-013-05 invokes none of those mutations;
- explicit treatment of output artifact identifiers and storage/document references as metadata only because no retrieval/download GET contract exists in the accepted artifact;
- no download, export, generate, queue, request, approve, publish, or other inferred reporting action controls;
- enabled capability-gated shell navigation for the reporting workspace;
- E2E coverage proving runtime discovery, definitions/requests/runs/artifact rendering, absence of download/export/mutation controls, and fail-closed access.

### HWEB-013-06 — read/derive/recommend semantics — NEXT

Must prove across the implemented intelligence workspaces that read/derive/recommend behavior never silently mutates operational source-of-truth modules. It must not introduce HWEB-013-07 performance work.

### HWEB-013-07 — performance testing — NOT STARTED

Must cover charts, large analytic results, and scenario comparisons only after the semantics task is accepted.

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
Accepted OpenAPI artifact       : 10307772022 / sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Endpoints used                  : GET reporting workbench resources; GET discovered definition/request/run/output-artifact lists; GET selected discovered reporting record detail
Dedicated reporting mutations   : none invoked; exact definition/request/run/artifact POST contracts generated for deterministic evidence only
Artifact retrieval contract     : absent from accepted OpenAPI artifact; no download/export control exposed
DTO evidence                    : CreateReportDefinitionRequest, GenerateReportArtifactRequest, QueueReportRunRequest, RequestReportRequest, ReportDefinitionResponse, ReportOutputArtifactResponse, ReportRunResponse, ReportRequestResponse
Permissions used                : exact generic workbench list/detail route descriptors intersected with effective grants; backend HTTP 403 final authority
Frontend route                  : /intelligence/reports
State ownership                 : TanStack Query owns workbench server state; local state limited to tab/detail selection
Ownership semantics             : reporting owns report definitions/requests/runs/artifact metadata; source operational facts remain with their owning modules
Lifecycle semantics             : statuses/reference fields are evidence only; no create/request/queue/generate/download/export/approve/publish controls invented
OpenAPI regeneration status     : reporting slice generated by orval.reporting.config.ts and HidraWEB CI
Tests                           : tests/e2e/reporting-workspace.spec.ts
Product verification CI         : 34753656914 — SUCCESS on pre-roadmap product head c47fb1a958a0a27cf36842c2a47c48b0df506938
Final verification              : exact-head full CI required after this roadmap commit, then guarded PR merge and exact merge-SHA main CI
```

HWEB-013-06 must not begin until HWEB-013-05 exact-head PR verification, guarded merge, and exact merge-SHA main verification are accepted.
