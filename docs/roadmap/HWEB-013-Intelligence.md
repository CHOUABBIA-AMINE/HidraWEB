# HWEB-013 — Intelligence

Status: HWEB-013-04 COMPLETE / HWEB-013-05 NEXT

## Accepted starting point

```text
HidraWEB verified main       : 43c5ac3ec2f294d2d03c724d23236ecb3570bef4
HWEB-013-03 final-main CI    : 34751306964 — SUCCESS
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Accepted OpenAPI artifact    : 10307772022
Accepted artifact digest     : sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Backend owners               : risk, analytics, simulation, reporting
Current task                 : HWEB-013-04 — simulation scenario/run/result workspaces COMPLETE
Next task                    : HWEB-013-05 — report definition/run/export workspaces
Later UI tasks               : HWEB-013-06 through HWEB-013-07 — NOT STARTED
```

HWEB-013-03 acceptance was restored after GitHub failed to create a `push` run for an earlier documentation merge. The documentation-only repair PR was guarded and merged, and exact-main CI `34751306964` succeeded on `43c5ac3ec2f294d2d03c724d23236ecb3570bef4`. HWEB-013-04 therefore starts only from that accepted main.

## Intelligence ownership rule

Hidra intelligence may read trusted operational data, create intelligence-owned records, derive analytics, evaluate metrics, run simulations, generate reports, and publish recommendations where HidraAPI explicitly exposes those operations.

It must not silently become the owner of operational source-of-truth state. Intelligence features must not mutate telemetry, monitoring, topology, planning, custody, assets, integrity, incidents, HSE, workflow, party, identity, organization, or other operational/master aggregates unless an exact owner-published API contract explicitly permits that mutation.

A status enum, persistence record, analytic result, simulation result, or recommendation is evidence, not authorization to synthesize lifecycle or operational actions. Frontend action availability must come from an exact published route, exact request contract, and exact permission metadata.

## Shared read contract

All four intelligence modules may use the existing generic workbench read contract when JPA-backed resources are published at runtime:

```text
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

HidraWEB must discover resource names from `GET /api/v1/workbench/{module}/resources`. Java persistence type metadata may identify an expected view, but the actual discovered `resource` value must be used for list/detail/search calls. HidraWEB must not build a competing hard-coded endpoint catalog.

## Dedicated mutation contracts

### Risk

Published resource-oriented operations:

```text
POST /api/v1/risk/evidence
POST /api/v1/risk/assessments
POST /api/v1/risk/registers
```

Verified DTO evidence:

```text
AddRiskEvidenceRequest -> String
CreateRiskAssessmentRequest -> RiskAssessmentResponse
CreateRiskRegisterRequest -> RiskRegisterResponse
```

### Analytics

Published resource-oriented operations:

```text
POST /api/v1/analytics/datasets
POST /api/v1/analytics/insights
POST /api/v1/analytics/projections/runs
POST /api/v1/analytics/metrics/evaluations
```

Verified DTO evidence:

```text
CreateAnalyticsDatasetRequest -> AnalyticsDatasetResponse
CreateAnalyticsInsightRequest -> AnalyticsInsightResponse
RunProjectionRequest -> AnalyticsProjectionRunResponse
RunMetricEvaluationRequest -> MetricEvaluationRunResponse
```

### Simulation

Published resource-oriented operations:

```text
POST /api/v1/simulation/models
POST /api/v1/simulation/scenarios
POST /api/v1/simulation/recommendations
POST /api/v1/simulation/runs
```

Legacy aliases are also present for model/scenario creation, recommendation publication, and run queueing.

Verified DTO evidence:

```text
CreateSimulationModelRequest -> SimulationModelResponse
CreateSimulationScenarioRequest -> SimulationScenarioResponse
PublishSimulationRecommendationRequest -> SimulationRecommendationResponse
QueueSimulationRunRequest -> SimulationRunResponse
```

The accepted OpenAPI artifact preserves the backend optionality of these requests. HWEB-013-04 generates these contracts for deterministic evidence but invokes none of them.

Verified status evidence includes model `DRAFT|ACTIVE|RETIRED`, scenario `DRAFT|READY|LOCKED|ARCHIVED`, run `QUEUED|RUNNING|COMPLETED|FAILED|CANCELLED`, and recommendation `DRAFT|PUBLISHED|SENT_TO_WORKFLOW|ACCEPTED|REJECTED|SUPERSEDED`. These values are display/evidence only unless an exact action route is published and authorized.

### Reporting

Published resource-oriented operations:

```text
POST /api/v1/reporting/definitions
POST /api/v1/reporting/artifacts
POST /api/v1/reporting/runs
POST /api/v1/reporting/requests
```

Verified DTO evidence:

```text
CreateReportDefinitionRequest -> ReportDefinitionResponse
GenerateReportArtifactRequest -> ReportOutputArtifactResponse
QueueReportRunRequest -> ReportRunResponse
RequestReportRequest -> ReportRequestResponse
```

Reporting creates reporting-owned definitions, requests, runs, and artifact references; it is not the owner of the operational facts represented in a report.

## Capabilities endpoints

```text
GET /api/v1/risk/capabilities
GET /api/v1/analytics/capabilities
GET /api/v1/simulation/capabilities
GET /api/v1/reporting/capabilities
```

Capabilities are module-mission evidence, not substitutes for exact DTO/OpenAPI and permission inspection.

## Authorization

HWEB-013 uses the established fail-closed model for every generic read or dedicated operation:

1. obtain the exact route descriptor from `GET /api/v1/security/permissions/routes`;
2. intersect its exact permission with effective grants from `GET /api/v1/identity/me/permissions`;
3. fail closed when either route metadata or the effective grant is absent;
4. never guess a permission from the `<module>:<resource>:<action>` convention;
5. treat backend HTTP 403 as final authority.

No intelligence permission code is hard-coded as a feature authorization assumption.

## Deterministic OpenAPI evidence

All intelligence slices below derive from accepted HidraAPI artifact `10307772022`, digest `sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea`, for audited backend SHA `0c8643c17b2648e8be85c658854f57ea0faab765`.

- HWEB-013-02: risk slice generated by `orval.risk.config.ts`.
- HWEB-013-03: analytics slice generated by `orval.analytics.config.ts`.
- HWEB-013-04: simulation slice generated by `orval.simulation.config.ts`.
- Reporting still has no dedicated HidraWEB slice; HWEB-013-05 must add the exact accepted reporting slice before invoking a reporting mutation.

The generic workbench client remains the authoritative typed read mechanism for the implemented risk, analytics, and simulation list/detail workspaces.

## Cross-module composition constraints

Allowed:

- neutral foreign IDs explicitly published by an intelligence-owned record;
- immutable/intelligence-owned snapshots of source evidence where the backend owns those snapshots;
- direct owner reads only when an explicit identifier and exact authorized contract justify them;
- derived calculations, projections, simulation runs/results/recommendations, report runs, and report artifacts owned by their intelligence module.

Forbidden:

- scanning a foreign module collection to infer an association that the intelligence record does not publish;
- copying a foreign aggregate into intelligence and treating the copy as current owner truth;
- writing operational state because an analytic or simulation result recommends a change;
- treating timestamps or version-looking fields as concurrency tokens unless the backend explicitly defines that contract;
- inventing approve, publish, activate, close, cancel, queue, rerun, apply, or export actions from statuses alone;
- inventing report download/export semantics before an exact retrieval contract is published.

## HWEB-013 task boundaries

### HWEB-013-01 — inventory risk/analytics/simulation/reporting contracts — COMPLETE

Inventoried backend owners, dedicated controller routes, request/response classes, generic workbench reads, authorization constraints, enum/status evidence, and deterministic OpenAPI prerequisites. No intelligence UI or behavior was added.

### HWEB-013-02 — risk views — COMPLETE

Implemented `/intelligence/risk` with runtime-discovered risk-register/risk-assessment list/detail views, fail-closed workbench authorization, TanStack Query server state, status-as-evidence semantics, deterministic risk OpenAPI generation, navigation, and E2E proof. No dedicated risk mutation is invoked.

### HWEB-013-03 — analytics datasets/insights/metrics — COMPLETE

Implemented `/intelligence/analytics` with runtime-discovered `AnalyticsDatasetJpaEntity`, `AnalyticsInsightJpaEntity`, `MetricDefinitionJpaEntity`, and `MetricEvaluationRunJpaEntity` views. TanStack Query owns server state, generic workbench permissions fail closed, analytics remains owner only of derived evidence, statuses remain evidence, the deterministic analytics POST contracts are generated but not invoked, and E2E proves read rendering and absence of invented operational actions.

### HWEB-013-04 — simulation scenario/run/result workspaces — COMPLETE

Implemented `/intelligence/simulation` with:

- runtime simulation workbench discovery rather than hard-coded resource endpoint names;
- scenario list/detail views identified by `SimulationScenarioJpaEntity` metadata;
- run list/detail views identified by `SimulationRunJpaEntity` metadata;
- result-summary views identified by `SimulationResultSummaryJpaEntity` metadata;
- result-value views identified by `SimulationResultValueJpaEntity` metadata;
- result-series-reference views identified by `SimulationResultSeriesReferenceJpaEntity` metadata;
- exact persisted result-series attributes such as `seriesTypeId`, `targetType`, `targetId`, and `storageLocation`, without invented aliases;
- generic workbench detail reads for explicitly selected records;
- scenario/run status values rendered as evidence only;
- exact generic workbench list/detail route descriptors intersected with effective grants, failing closed when either route metadata or grants are absent;
- TanStack Query ownership of resource/list/detail server state, with local React state limited to selected tab/detail;
- deterministic simulation-only OpenAPI generation through `orval.simulation.config.ts` from the accepted HidraAPI artifact;
- exact model/scenario/recommendation/run POST DTO contracts generated for evidence while HWEB-013-04 invokes no create, queue, publish, rerun, apply, or operational mutation;
- simulation results explicitly treated as decision-support evidence and never authority to mutate operational source truth;
- enabled capability-gated shell navigation for the simulation workspace;
- E2E coverage for runtime discovery, scenarios/runs/results, absence of invented command controls, and fail-closed access.

### HWEB-013-05 — report definition/run/export workspaces — NEXT

Must add an accepted deterministic reporting OpenAPI slice and verify exact artifact retrieval/export semantics before exposing download/export controls.

### HWEB-013-06 — read/derive/recommend semantics — NOT STARTED

Must prove intelligence does not silently mutate operational source-of-truth state.

### HWEB-013-07 — performance testing — NOT STARTED

Must cover charts, large analytic results, and scenario comparisons only after the relevant workspaces exist.

## Completion records

### HWEB-013-01

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : 2c4a567060ff4548924685b98a76ba48c4845402 / main
Final product head              : e315610b93f48915b1423c78b487941651191f77
Final CI                        : 34746275714 — SUCCESS
```

### HWEB-013-02

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : e315610b93f48915b1423c78b487941651191f77 / main
Accepted OpenAPI artifact       : 10307772022 / sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Frontend route                  : /intelligence/risk
Dedicated mutations             : none invoked
Tests                           : tests/e2e/risk-workspace.spec.ts
Final product merge             : 33e4a6f232584f1c2662b8327f7399de0f49de46
Final product CI                : 34747359160 — SUCCESS
```

### HWEB-013-03

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : 33e4a6f232584f1c2662b8327f7399de0f49de46 / main
Product branch                  : hweb-013-03-analytics-views
Product head                    : 86cc6ac61fbabab5e9003217a5c9ce22bb417f64
Product PR                      : #60
Product exact-head CI           : 34748226645 — SUCCESS
Product merge                   : bbb913cb5494cf62fac68eb0784fabdeab14158f
Product post-merge CI           : 34748378201 — SUCCESS
Accepted OpenAPI artifact       : 10307772022 / sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Frontend route                  : /intelligence/analytics
Dedicated mutations             : none invoked
Tests                           : tests/e2e/analytics-workspace.spec.ts
Acceptance-repair final main    : 43c5ac3ec2f294d2d03c724d23236ecb3570bef4
Acceptance-repair final-main CI : 34751306964 — SUCCESS
```

### HWEB-013-04

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : 43c5ac3ec2f294d2d03c724d23236ecb3570bef4 / main
Product branch                  : hweb-013-04-simulation-workspaces
Accepted OpenAPI artifact       : 10307772022 / sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Endpoints used                  : GET simulation workbench resources; GET discovered scenario/run/result-summary/result-value/result-series-reference lists; GET selected discovered simulation record detail
Dedicated simulation mutations  : none invoked; exact model/scenario/recommendation/run POST contracts generated for deterministic evidence only
DTO evidence                    : CreateSimulationModelRequest, CreateSimulationScenarioRequest, PublishSimulationRecommendationRequest, QueueSimulationRunRequest, SimulationModelResponse, SimulationScenarioResponse, SimulationRecommendationResponse, SimulationRunResponse
Permissions used                : exact generic workbench list/detail route descriptors intersected with effective grants; backend HTTP 403 final authority
Frontend route                  : /intelligence/simulation
State ownership                 : TanStack Query owns workbench server state; local state limited to tab/detail selection
Ownership semantics             : simulation owns scenarios/runs/results/recommendations as decision-support evidence; operational modules retain source truth
Lifecycle semantics             : statuses display-only; no create/queue/publish/apply/rerun/approve operational controls invented
OpenAPI regeneration status     : simulation slice generated by orval.simulation.config.ts and HidraWEB CI
Tests                           : tests/e2e/simulation-workspace.spec.ts
Verification                    : exact-head full CI required before guarded PR merge; exact merge-SHA main CI required afterward
```

HWEB-013-05 must not begin until HWEB-013-04 exact-head PR verification, guarded merge, and exact merge-SHA main verification are accepted.
