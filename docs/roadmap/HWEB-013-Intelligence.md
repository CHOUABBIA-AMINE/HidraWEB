# HWEB-013 — Intelligence

Status: HWEB-013-01 INVENTORY / HWEB-013-02 NOT STARTED

## Accepted starting point

```text
HidraWEB verified main       : 2c4a567060ff4548924685b98a76ba48c4845402
Final HWEB-012 CI            : 34744892854 — SUCCESS
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Backend owners               : risk, analytics, simulation, reporting
Current task                 : HWEB-013-01 — inventory contracts only
Later UI tasks               : HWEB-013-02 through HWEB-013-07 — NOT STARTED
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

The backend contains substantial JPA-backed intelligence persistence. Verified examples include risk assessment/register/rating/threat/control/scenario/exposure/review/matrix resources and analytics dataset/catalog/access/lineage resources. Later workspace tasks must discover the exact runtime descriptors before issuing list/detail/search reads.

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
String                         // add risk evidence
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

No intelligence permission codes are hard-coded by this inventory task.

## OpenAPI evidence and gap

The audited HidraAPI main exposes the four dedicated intelligence controllers and their request/response classes. HidraWEB's currently committed `openapi/` directory does not contain a dedicated risk, analytics, simulation, or reporting slice.

Therefore HWEB-013-01 does not invent TypeScript request/response shapes. Before a later task calls a dedicated intelligence mutation, it must generate or import the deterministic OpenAPI contract from an accepted HidraAPI artifact and preserve backend optionality exactly.

The generic workbench client remains the authoritative typed read mechanism already established by earlier HWEB phases.

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

### HWEB-013-01 — inventory risk/analytics/simulation/reporting contracts — CURRENT

This task is documentation/evidence only. It records verified backend owners, dedicated controller routes, mutation DTO classes, workbench read strategy, authorization rules, enum/status evidence, and the current OpenAPI gap.

No `/intelligence` UI, feature module, process component, route, chart, form, mutation hook, Orval slice, or lifecycle behavior is implemented in HWEB-013-01.

### HWEB-013-02 — risk views — NOT STARTED

Must begin from runtime risk workbench discovery and an accepted generated risk mutation contract. Returned risk statuses remain display evidence unless exact action routes exist.

### HWEB-013-03 — analytics datasets/insights/metrics — NOT STARTED

Must preserve analytics ownership of derived data and projections while operational modules retain source truth.

### HWEB-013-04 — simulation scenario/run/result workspaces — NOT STARTED

Must distinguish simulation-owned models/scenarios/runs/results/recommendations from operational changes.

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
OpenAPI regeneration status     : not performed; no dedicated intelligence slice currently committed in HidraWEB
Known backend/frontend gaps     : deterministic intelligence OpenAPI slice must be accepted before dedicated mutations are implemented
Tests added                     : none; inventory task only
CI result                       : PENDING exact-head CI
```

HWEB-013-02 must not start until this inventory is reviewed and HWEB-013-01 verification is accepted.
