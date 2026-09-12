# HWEB-010 — Planning

Status: HWEB-010-05 BLOCKED ON DETERMINISTIC PLAN-TARGET PLANNED-VS-ACTUAL CONTRACT

## Accepted repository baselines

```text
HidraWEB current main        : 4cf8755f189ef6b2280f42e01d0bd348ef94d1c2
HidraWEB product merge       : 74e557413b3dd267da7a2cec3f9578a5d3b8bf89
HidraAPI accepted main SHA   : c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55
Backend artifact             : hidra-api-openapi-c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55
Artifact id                  : 10286503941
Artifact digest              : sha256:cadc680414407bb3c388a093a3f8fa8fc5406a6b63b3760708f54576eff4b781
Backend query issue          : CHOUABBIA-AMINE/HidraAPI#68 — CLOSED
Backend approval issue       : CHOUABBIA-AMINE/HidraAPI#70 — OPEN
Backend comparison issue     : CHOUABBIA-AMINE/HidraAPI#71 — OPEN
Frontend inventory issue     : CHOUABBIA-AMINE/HidraWEB#18 — CLOSED
```

## HWEB-010-01 — Contract inventory

Completed. HidraAPI PLN-001 published and merged a deterministic read-only planning contract at
`c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55`.

Accepted public reads include periods, operational plans, revisions, nominations and targets. Paging is zero-based; default size is 50 and the backend owns request validation, authorization and not-found behavior.

## HWEB-010-02 — Planning period and operational-plan workspaces

Complete and verified.

```text
Behavioral commit      : d711b5014419e6022748d4d3c48c6052e37f5c39
Behavioral CI          : 34659171158 — SUCCESS
Final PR head          : bcd82c6f272990fd22d9f37d3260be276b56a254
Final exact-head CI    : 34659336556 — SUCCESS
Pull request           : HidraWEB #20 — MERGED
Product merge SHA      : aae64ce602d98233a298fae8653efdfd19b43951
Post-merge product CI  : 34659530090 — SUCCESS
Verification merge     : 271b40c2c87b2648ce0d97df8e86ea4e35130660
Verification main CI   : 34659784398 — SUCCESS
```

`GAP-PLAN-001` is VERIFIED for planning-period and operational-plan list/detail reads.

## HWEB-010-03 — Revision/version presentation

Complete and verified from the already-published PLN-001 read contract only.

Published routes consumed:

```text
GET /api/v1/planning/revisions?planId={planId}&page={page}&size={size}
GET /api/v1/planning/revisions/{id}
```

Published `PlanRevisionView` fields presented without reinterpretation:

```text
id
planId
revisionNumber
revisionCode
baseRevisionId
status
changeReasonCodeId
changeReasonText
submittedAt
submittedByActorId
approvedAt
approvedByActorId
workflowInstanceId
createdAt
updatedAt
```

Frontend behavior:

- selecting an operational plan loads its revision history through the required `planId` relationship filter;
- revision list/detail server state is owned by TanStack Query;
- local state stores only selected plan/revision and revision paging;
- revision route permissions are resolved from backend route descriptors and effective principal grants;
- missing revision route metadata fails closed;
- revision status, base-revision lineage, change reason, submission/approval metadata and workflow reference are displayed exactly as returned;
- no lifecycle transition is inferred from status values;
- component and Playwright tests cover the published list/detail reads.

### HWEB-010-03 verification evidence

```text
Behavioral commit      : 76396b5ed313045ea20d5cd719ae2f258c840af9
Behavioral CI          : 34677837690 — SUCCESS
Final PR head          : 9bb19eb1a7cffbfae9deba8ab93c9ca5309e2878
Final exact-head CI    : 34677956817 — SUCCESS
Pull request           : HidraWEB #22 — MERGED
Product merge SHA      : 74e557413b3dd267da7a2cec3f9578a5d3b8bf89
Post-merge product CI  : 34678043417 — SUCCESS
Verification merge     : 630c669519f006544dd64db81bc688277905477f
Verification main CI   : 34678261778 — SUCCESS
Verified gates         : HWEB-003..HWEB-010 OpenAPI generation; lint; typecheck; unit/component tests; production build; Playwright browser tests
```

## HWEB-010-04 — Workflow approval integration

Contract audit completed. Frontend implementation is blocked.

Verified workflow capabilities at the accepted backend SHA include:

```text
GET  /api/v1/workflow/tasks
GET  /api/v1/workflow/tasks/{id}
GET  /api/v1/workflow/tasks/{id}/available-actions
GET  /api/v1/workflow/instances/{id}
GET  /api/v1/workflow/instances/{id}/timeline
POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute
```

`WorkflowQueryUseCase.InstanceView` publishes backend-owned target metadata (`targetModule`, `targetTypeId`, `targetId`, target code/label) and `AvailableActionView` publishes server-defined transition metadata including `requiredPermissionCode`, `targetModuleCallback`, and `permitted`.

However, planning currently publishes no authoritative plan/revision submit/approve/reject/supersede command and no published planning-side callback contract proving the business effect of a workflow decision on a `PlanRevision`. `PlanRevisionView.workflowInstanceId` alone does not establish which task/action should be executed from the planning workspace, and HidraWEB must not scan the generic task inbox and invent that relation.

### GAP-PLAN-002 — Planning/workflow approval bridge

```text
Status          : OPEN / BLOCKING HWEB-010-04
Backend owner   : planning + workflow public contracts
Backend issue   : HidraAPI #70
Frontend action : no approval mutation UI until the gap closes
Audit PR        : HidraWEB #24 — MERGED
Audit merge SHA : 4cf8755f189ef6b2280f42e01d0bd348ef94d1c2
Audit main CI   : 34678655704 — SUCCESS
```

Required evidence before HWEB-010-04 can proceed:

- explicit backend contract for plan/revision approval participation;
- authoritative plan/revision -> workflow instance/task/action relation without client-side guessing;
- backend-owned decision -> planning lifecycle effect;
- canonical route permissions and deterministic OpenAPI;
- conflict/concurrency semantics where applicable;
- focused backend tests proving the cross-module lifecycle effect without persistence coupling.

HidraWEB must not infer approval semantics from revision status strings, workflow transition names, `targetModuleCallback`, or architecture documentation alone.

## HWEB-010-05 — Planned-vs-actual

Contract audit completed. Frontend implementation is blocked on deterministic target-scoped monitoring reads.

The accepted backend contracts prove the ownership and field compatibility:

### Planning expected state

`PlanTargetView` publishes:

```text
id
revisionId
targetTypeId
topologyAssetType
topologyAssetId
telemetryPointId
targetValue
targetTextValue
unitId
toleranceLow
toleranceHigh
validFrom
validTo
status
```

The planning DDD defines `PlanTarget` as expected state consumed by monitoring, and explicitly states:

```text
PlanTarget = expected value
TrustedTelemetryReading = actual fact
MonitoringDeviation = comparison result
```

### Telemetry actual facts

`ReadingView` publishes:

```text
id
pointId
numericValue
textValue
booleanValue
unitId
qualityCodeId
sourceTimestamp
receivedAt
state
```

Telemetry can filter readings by point, time window and state, but HidraWEB must not decide which raw reading/aggregation is the authoritative actual for a plan target.

### Monitoring comparison result

`MonitoringQueryUseCase.DeviationView` already publishes the backend-owned comparison:

```text
id
evaluationId
planTargetId
expectedFlowStateId
trustedTelemetryReadingId
telemetryPointId
topologyAssetType
topologyAssetId
topologyAssetCode
actualValue
expectedValue
differenceValue
differencePercent
unitId
severity
status
detectedAt
resolvedAt
reasonCode
reasonMessage
```

Published monitoring routes include:

```text
GET /api/v1/monitoring/deviations
GET /api/v1/monitoring/deviations/{id}
```

However, the collection endpoint can filter by status, severity, topology asset, telemetry point and time range, but not by `planTargetId`. A selected `PlanTarget` does not publish a deviation ID. Therefore HidraWEB cannot deterministically retrieve the authoritative comparison for one selected target without scanning/paging broader monitoring data and client-filtering by `planTargetId`.

HidraWEB also must not compute `actual - expected`, percentages, tolerance classification or severity from raw telemetry, because the planning DDD explicitly assigns the comparison result to monitoring.

### GAP-PLAN-003 — Target-scoped planned-vs-actual projection

```text
Status          : OPEN / BLOCKING HWEB-010-05
Backend owner   : monitoring read contract, using neutral planning target reference
Backend issue   : HidraAPI #71
Frontend action : no planned-vs-actual calculation/projection until the gap closes
```

Required evidence before HWEB-010-05 can proceed:

- deterministic monitoring read scoped directly by `planTargetId`, or equivalent backend-owned target comparison projection;
- authoritative expected/actual/difference/unit/severity/status fields from monitoring;
- canonical route permissions and deterministic OpenAPI;
- tests proving exact plan-target scoping and empty/not-found behavior;
- exact merge-SHA OpenAPI artifact and green acceptance gates.

HidraWEB must not infer that telemetry `TRUSTED` is interchangeable with archived wording such as `validated/approved`, select a latest/average/sum reading by convention, calculate deviations itself, or scan unrelated deviation pages hoping to find a target match.

## Explicit exclusions retained

HidraWEB still does not implement or infer:

- create/update revision commands;
- submit/approve/reject/supersede revision actions;
- workflow approval integration while GAP-PLAN-002 is open;
- concurrency/version mutation tokens;
- frontend-owned planned-vs-actual arithmetic or severity classification while GAP-PLAN-003 is open;
- nomination/target mutation workspaces;
- realtime planning events;
- a frontend planning or revision state machine.

## Gap status

```text
GAP-PLAN-001 — Planning query contract
Status          : VERIFIED
Backend owner   : planning
Backend issue   : HidraAPI #68 — CLOSED
Backend evidence: merge c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55; OpenAPI artifact 10286503941
Frontend evidence: HWEB-010-02 verifies period/plan reads; HWEB-010-03 verifies revision list/detail reads from the same accepted contract.

GAP-PLAN-002 — Planning/workflow approval bridge
Status          : OPEN
Backend issue   : HidraAPI #70 — OPEN
Frontend evidence: contract audit confirms generic workflow transitions exist but no authoritative planning lifecycle bridge is published.

GAP-PLAN-003 — Target-scoped planned-vs-actual projection
Status          : OPEN
Backend issue   : HidraAPI #71 — OPEN
Frontend evidence: planning target and monitoring deviation fields are compatible, but monitoring cannot be queried deterministically by planTargetId and frontend-owned comparison semantics are forbidden.
```

## Remaining HWEB-010 sequence

- HWEB-010-04 resume only after GAP-PLAN-002 closes with deterministic backend evidence.
- HWEB-010-05 resume only after GAP-PLAN-003 closes with deterministic target-scoped monitoring evidence.
- HWEB-010-06 test version/concurrency behavior only after authoritative mutation/concurrency contracts exist.
