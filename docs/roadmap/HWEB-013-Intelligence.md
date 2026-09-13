# HWEB-013 — Intelligence

Status: HWEB-013-03 COMPLETE / HWEB-013-04 NEXT

## Accepted starting point

```text
HidraWEB verified main       : bbb913cb5494cf62fac68eb0784fabdeab14158f
HWEB-013-03 product PR       : #60
HWEB-013-03 product CI       : 34748226645 — SUCCESS
HWEB-013-03 post-merge CI    : 34748378201 — SUCCESS
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Backend owners               : risk, analytics, simulation, reporting
Current task                 : HWEB-013-03 — analytics datasets/insights/metrics COMPLETE
Next task                    : HWEB-013-04 — simulation scenario/run/result workspaces
Later UI tasks               : HWEB-013-05 through HWEB-013-07 — NOT STARTED
```

## Intelligence ownership rule

Hidra intelligence may read trusted operational data, create intelligence-owned records, derive analytics, evaluate metrics, run simulations, generate reports, and publish recommendations where HidraAPI explicitly exposes those operations.

It must not silently become the owner of operational source-of-truth state. In particular, an intelligence feature must not mutate telemetry, monitoring, topology, planning, custody, assets, integrity, incidents, HSE, workflow, party, identity, organization, or other operational/master aggregates unless an exact owner-published API contract explicitly permits that mutation.

A status enum or persistence record is evidence, not permission to synthesize lifecycle actions. Frontend action availability must come from an exact published route plus its request contract and permission metadata.

## Shared read contract

All four intelligence modules are eligible for the existing generic workbench read contract when JPA-backed resources are published at runtime:

```text
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

HidraWEB must discover resource names from `GET /api/v1/workbench/{module}/resources`. It must not build a competing hard-coded catalog from Java class names.

The backend contains substantial JPA-backed intelligence persistence. Verified examples include risk assessment/register/rating/threat/control/scenario/exposure/review/matrix resources and analytics dataset/insight/metric-definition/metric-evaluation/catalog/access/lineage resources. Workspace tasks must discover the exact runtime descriptors before issuing list/detail/search reads.

## Dedicated mutation contracts

### Risk

Controller base path:

```text
/api/v1/risk
```

Published resource-oriented mutations:

```text
POST /api/v1/risk/evidence
POST /api/v1/risk/assessments
POST /api/v1/risk/registers
```

Legacy aliases also exist:

```text
POST /api/v1/risk/add-risk-evidence
POST /api/v1/risk/create-risk-assessment
POST /api/v1/risk/create-risk-register
```

Verified request classes:

```text
AddRiskEvidenceRequest
CreateRiskAssessmentRequest
CreateRiskRegisterRequest
```

Verified response classes:

```text
String
RiskAssessmentResponse
RiskRegisterResponse
```

Risk status/value evidence includes backend-owned types such as `RiskAcceptanceStatus`, `RiskAssessmentStatus`, `RiskMatrixStatus`, `RiskRegisterStatus`, `RiskReviewStatus`, `RiskScoreType`, and `RiskScopeReference`. These types must not be converted into frontend lifecycle actions unless a matching route is published.

### Analytics

Controller base path:

```text
/api/v1/analytics
```

Published resource-oriented mutations:

```text
POST /api/v1/analytics/datasets
POST /api/v1/analytics/insights
POST /api/v1/analytics/projections/runs
POST /api/v1/analytics/metrics/evaluations
```

Legacy aliases also exist:

```text
POST /api/v1/analytics/create-analytics-dataset
POST /api/v1/analytics/create-analytics-insight
POST /api/v1/analytics/run-projection
POST /api/v1/analytics/run-metric-evaluation
```

Verified request classes:

```text
CreateAnalyticsDatasetRequest
CreateAnalyticsInsightRequest
RunProjectionRequest
RunMetricEvaluationRequest
```

Verified response classes:

```text
AnalyticsDatasetResponse
AnalyticsInsightResponse
AnalyticsProjectionRunResponse
MetricEvaluationRunResponse
```

Analytics domain evidence includes backend-owned types such as `AnalyticsAccessMode`, `AnalyticsDatasetType`, `AnalyticsInsightStatus`, `AnalyticsLineageStatus`, `AnalyticsModelRunType`, `AnalyticsModelStatus`, `AnalyticsQualityStatus`, and `AnalyticsRefreshMode`.

The macro-architecture explicitly treats analytics as a consumer of trusted history that builds its own projections and does not rewrite source operational state.

### Simulation

Controller base path:

```text
/api/v1/simulation
```

Published resource-oriented mutations:

```text
POST /api/v1/simulation/models
POST /api/v1/simulation/scenarios
POST /api/v1/simulation/recommendations
POST /api/v1/simulation/runs
```

Verified request classes:

```text
CreateSimulationModelRequest
CreateSimulationScenarioRequest
PublishSimulationRecommendationRequest
QueueSimulationRunRequest
```

Verified response classes:

```text
SimulationModelResponse
SimulationScenarioResponse
SimulationRecommendationResponse
SimulationRunResponse
```

Simulation domain evidence includes backend-owned types such as `SimulationCandidateStatus`, `SimulationConstraintEvaluationStatus`, `SimulationEvidenceType`, `SimulationModelStatus`, `SimulationOwnerType`, `SimulationRecommendationStatus`, `SimulationRunStatus`, and `SimulationRunStepStatus`.

A published recommendation is simulation-owned decision-support evidence. It is not permission for HidraWEB to apply the recommendation by mutating another module.

### Reporting

Controller base path:

```text
/api/v1/reporting
```

Published resource-oriented mutations:

```text
POST /api/v1/reporting/definitions
POST /api/v1/reporting/artifacts
POST /api/v1/reporting/runs
POST /api/v1/reporting/requests
```

Verified request classes:

```text
CreateReportDefinitionRequest
GenerateReportArtifactRequest
QueueReportRunRequest
RequestReportRequest
```

Verified response classes:

```text
ReportDefinitionResponse
ReportOutputArtifactResponse
ReportRunResponse
ReportRequestResponse
```

Reporting domain evidence includes backend-owned types such as `ReportAccessScopeType`, `ReportArtifactType`, `ReportChartType`, `ReportDefinitionStatus`, `ReportDistributionStatus`, `ReportDistributionTargetType`, `ReportFormat`, and `ReportParameterType`.

Reporting creates reporting-owned definitions/requests/runs/artifact references. It must not be treated as the owner of the operational facts included in a report.

## Capabilities endpoints

Each dedicated controller publishes a read-only capabilities endpoint:

```text
GET /api/v1/risk/capabilities
GET /api/v1/analytics/capabilities
GET /api/v1/simulation/capabilities
GET /api/v1/reporting/capabilities
```

These endpoints are useful evidence of module mission and currently supported dedicated operations. They are not a replacement for exact DTO/OpenAPI inspection.

## Authorization

HWEB-013 continues the established fail-closed authorization model.

For every dedicated mutation and generic workbench read:

1. obtain the exact route descriptor from `GET /api/v1/security/permissions/routes`;
2. intersect it with effective grants from `GET /api/v1/identity/me/permissions`;
3. fail closed when either the descriptor or effective grant is absent;
4. never guess a permission string from the `<module>:<resource>:<action>` convention;
5. treat backend HTTP 403 as final authority.

No intelligence permission codes are guessed in feature code.

## OpenAPI evidence and gap

The audited HidraAPI main exposes the four dedicated intelligence controllers and their request/response classes.

HWEB-013-02 added a deterministic risk-only OpenAPI slice derived from accepted HidraAPI artifact `10307772022`, digest `sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea`, for audited backend SHA `0c8643c17b2648e8be85c658854f57ea0faab765`. The risk slice is generated in CI through `orval.risk.config.ts`.

HWEB-013-03 adds a deterministic analytics-only OpenAPI slice from that same accepted artifact and audited backend SHA. It contains the published analytics capability and dedicated POST paths plus their referenced request/response schemas, and is generated in CI through `orval.analytics.config.ts`.

HidraWEB still has no dedicated simulation or reporting OpenAPI slice. HWEB-013-04 and HWEB-013-05 must import or generate their exact deterministic contracts before calling dedicated mutations.

The generic workbench client remains the authoritative typed read mechanism for the HWEB-013-02 risk and HWEB-013-03 analytics list/detail views.

## Cross-module composition constraints

Allowed:

- neutral foreign IDs explicitly published by an intelligence-owned record;
- immutable/intelligence-owned snapshots of source evidence where the backend owns those snapshots;
- direct owner reads only when an explicit identifier and exact authorized contract justify them;
- derived calculations, projections, simulations, recommendations, report runs, and report artifacts owned by the relevant intelligence module.

Forbidden:

- scanning a foreign module collection to infer an association that the intelligence record does not publish;
- copying a foreign aggregate into intelligence and treating the copy as current owner truth;
- writing operational state because an analytic result or recommendation suggests a change;
- treating timestamps or version-looking fields as concurrency tokens unless the backend explicitly defines that contract;
- inventing approve/publish/activate/close/cancel/rerun/export actions from statuses alone;
- inventing report download/export semantics before an exact artifact/download contract is published.

## HWEB-013 task boundaries

### HWEB-013-01 — inventory risk/analytics/simulation/reporting contracts — COMPLETE

The inventory records verified backend owners, dedicated controller routes, mutation DTO classes, workbench read strategy, authorization rules, enum/status evidence, and deterministic OpenAPI prerequisites.

No `/intelligence` UI, feature module, process component, route, chart, form, mutation hook, Orval slice, or lifecycle behavior was implemented in HWEB-013-01.

### HWEB-013-02 — risk views — COMPLETE

Implemented `/intelligence/risk` with runtime discovery of risk workbench descriptors, risk-register and risk-assessment list/detail reads, fail-closed generic workbench authorization, TanStack Query server-state ownership, status-as-evidence semantics, capability-gated navigation, deterministic risk OpenAPI generation, and E2E proof. No dedicated risk mutation or inferred lifecycle action is exposed.

### HWEB-013-03 — analytics datasets/insights/metrics — COMPLETE

Implemented `/intelligence/analytics` with:

- runtime analytics workbench discovery rather than hard-coded resource endpoint names;
- dataset views identified by `AnalyticsDatasetJpaEntity` metadata and queried through the discovered resource name;
- insight views identified by `AnalyticsInsightJpaEntity` metadata and queried through the discovered resource name;
- metric-definition views identified by `MetricDefinitionJpaEntity` metadata and queried through the discovered resource name;
- metric-evaluation-run views identified by `MetricEvaluationRunJpaEntity` metadata and queried through the discovered resource name;
- generic workbench detail reads for explicitly selected analytics records;
- analytics status/quality/run values and metric `active` state rendered as evidence only, with no inferred apply, approve, publish, rerun, activate, cancel, or other lifecycle action;
- exact generic workbench list/detail route-permission descriptors intersected with effective grants;
- fail-closed behavior when route metadata or effective grants are absent, with backend HTTP 403 remaining final authority;
- TanStack Query ownership of runtime resource/list/detail server state and local React state limited to tab/detail selection;
- deterministic analytics-only OpenAPI generation from accepted HidraAPI artifact `10307772022` through `orval.analytics.config.ts`;
- exact analytics dedicated POST DTO contracts generated for deterministic evidence while HWEB-013-03 invokes no dataset creation, insight creation, projection run, or metric-evaluation mutation;
- preservation of operational module ownership: analytics-derived records never become authority to write telemetry, monitoring, topology, planning, custody, assets, integrity, incidents, HSE, workflow, party, identity, organization, or other source-truth aggregates;
- enabled capability-gated shell navigation for the analytics workspace;
- E2E coverage proving runtime discovery, datasets/insights/metrics rendering, absence of invented action controls, and fail-closed access.

### HWEB-013-04 — simulation scenario/run/result workspaces — NEXT

Must distinguish simulation-owned models/scenarios/runs/results/recommendations from operational changes. It must begin with runtime simulation workbench discovery and an accepted deterministic simulation OpenAPI slice before any dedicated mutation is used.

### HWEB-013-05 — report definition/run/export workspaces — NOT STARTED

Must verify exact artifact retrieval/export contracts before exposing download/export controls.

### HWEB-013-06 — read/derive/recommend semantics — NOT STARTED

Must prove intelligence does not silently mutate operational source-of-truth state.

### HWEB-013-07 — performance testing — NOT STARTED

Must cover charts, large analytic results, and scenario comparisons only after the relevant workspaces exist.

## HWEB-013-01 completion record

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : 2c4a567060ff4548924685b98a76ba48c4845402 / main
Endpoints inventoried           : risk, analytics, simulation, reporting capabilities + published dedicated POST operations + generic workbench reads
DTO evidence                    : exact dedicated request/response class names recorded; no frontend DTOs invented
Permissions used                : none hard-coded; exact route descriptors + effective grants remain mandatory
Frontend routes created/changed : none
State ownership                 : unchanged; no server-state implementation added
OpenAPI regeneration status     : inventory only; deterministic intelligence slices deferred to implementation tasks
Known backend/frontend gaps     : exact module slice required before each dedicated intelligence mutation is implemented
Tests added                     : none; inventory task only
Final product head              : e315610b93f48915b1423c78b487941651191f77
Final CI                        : 34746275714 — SUCCESS
```

## HWEB-013-02 completion record

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : e315610b93f48915b1423c78b487941651191f77 / main
Accepted OpenAPI artifact       : 10307772022 / sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Endpoints used                  : GET risk workbench resources; GET discovered risk register/assessment lists; GET selected discovered risk record detail
Dedicated risk mutations        : none invoked by HWEB-013-02; exact risk POST contracts generated for deterministic evidence only
DTO evidence                    : AddRiskEvidenceRequest, CreateRiskAssessmentRequest, CreateRiskRegisterRequest, RiskAssessmentResponse, RiskRegisterResponse
Permissions used                : exact generic workbench list/detail route descriptors intersected with effective grants; backend HTTP 403 final authority
Frontend route                  : /intelligence/risk
State ownership                 : TanStack Query owns workbench server state; local state limited to tab/detail selection
Lifecycle semantics             : status values display-only; no approve/activate/retire/cancel actions invented
OpenAPI regeneration status     : risk slice generated by orval.risk.config.ts and HidraWEB CI
Tests added                     : tests/e2e/risk-workspace.spec.ts
Final product merge             : 33e4a6f232584f1c2662b8327f7399de0f49de46
Final product CI                : 34747359160 — SUCCESS
```

## HWEB-013-03 completion record

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : 33e4a6f232584f1c2662b8327f7399de0f49de46 / main
Product branch                  : hweb-013-03-analytics-views
Product head                    : 86cc6ac61fbabab5e9003217a5c9ce22bb417f64
Product PR                      : #60
Product exact-head CI           : 34748226645 — SUCCESS
Product merge                   : bbb913cb5494cf62fac68eb0784fabdeab14158f
Post-merge CI                   : 34748378201 — SUCCESS
Accepted OpenAPI artifact       : 10307772022 / sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Endpoints used                  : GET analytics workbench resources; GET discovered dataset/insight/metric-definition/metric-evaluation lists; GET selected discovered analytics record detail
Dedicated analytics mutations   : none invoked by HWEB-013-03; exact dataset/insight/projection/metric-evaluation POST contracts generated for deterministic evidence only
DTO evidence                    : CreateAnalyticsDatasetRequest, CreateAnalyticsInsightRequest, RunProjectionRequest, RunMetricEvaluationRequest, AnalyticsDatasetResponse, AnalyticsInsightResponse, AnalyticsProjectionRunResponse, MetricEvaluationRunResponse
Permissions used                : exact generic workbench list/detail route descriptors intersected with effective grants; backend HTTP 403 final authority
Frontend route                  : /intelligence/analytics
State ownership                 : TanStack Query owns workbench server state; local state limited to tab/detail selection
Ownership semantics             : analytics owns derived evidence; operational source truth remains with operational/master modules
Lifecycle semantics             : backend statuses/active flags display-only; no apply/approve/publish/rerun/activate/cancel controls invented
OpenAPI regeneration status     : analytics slice generated by orval.analytics.config.ts and HidraWEB CI
Tests added                     : tests/e2e/analytics-workspace.spec.ts
Docs verification               : exact-head CI required on this docs branch before guarded merge; final-main CI required afterward
```

HWEB-013-04 must not begin until HWEB-013-03 product, post-merge, documentation, and final-main verification are accepted.
