# HWEB-010 — Planning

Status: HWEB-010-04 COMPLETE / VERIFIED; HWEB-010-05 BLOCKED ON GAP-PLAN-003; HWEB-010-06 BLOCKED ON GAP-PLAN-004

## Accepted repository baselines

```text
HidraWEB audit base          : d547bc261009acd07f94a615cb58f0c80526ff49
HidraWEB current product merge: f60bc4e45dcdacf90d942b7969190f4b93a70df3
HidraAPI accepted main SHA   : 6ef581f557e42e8d96b03ccf429562e646f2e321
Backend artifact             : hidra-api-openapi-6ef581f557e42e8d96b03ccf429562e646f2e321
Artifact id                  : 10293549730
Artifact digest              : sha256:422cc6f37a7e5a6674a77d32be5ee1325bb9a8a8ad682075094a5699d3a9f243
Backend query issue          : CHOUABBIA-AMINE/HidraAPI#68 — CLOSED
Backend approval issue       : CHOUABBIA-AMINE/HidraAPI#70 — CLOSED
Backend comparison issue     : CHOUABBIA-AMINE/HidraAPI#71 — OPEN
Backend concurrency issue    : CHOUABBIA-AMINE/HidraAPI#72 — OPEN
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

Complete and verified from the PLN-001 read contract.

Published routes consumed:

```text
GET /api/v1/planning/revisions?planId={planId}&page={page}&size={size}
GET /api/v1/planning/revisions/{id}
```

Published `PlanRevisionView` metadata is presented without reinterpretation, including revision lineage, backend status, change reason, submission/approval metadata, workflow instance reference and timestamps.

Frontend behavior:

- selecting an operational plan loads its revision history through the required `planId` relationship filter;
- revision list/detail server state is owned by TanStack Query;
- local state stores only selected plan/revision and revision paging;
- revision route permissions are resolved from backend route descriptors and effective principal grants;
- missing revision route metadata fails closed;
- no lifecycle transition is inferred from revision status values.

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

Complete and verified from the authoritative PLN-002 planning/workflow bridge published by HidraAPI.

### Backend contract

Accepted backend merge:

```text
HidraAPI merge SHA : 6ef581f557e42e8d96b03ccf429562e646f2e321
Roadmap task       : PLN-002
Backend issue      : HidraAPI #70 — CLOSED
OpenAPI artifact   : hidra-api-openapi-6ef581f557e42e8d96b03ccf429562e646f2e321
Artifact id        : 10293549730
Artifact digest    : sha256:422cc6f37a7e5a6674a77d32be5ee1325bb9a8a8ad682075094a5699d3a9f243
```

Authoritative revision-scoped approval routes:

```text
GET  /api/v1/planning/revisions/{revisionId}/approval
POST /api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute
```

The approval projection resolves the planning revision to the backend-owned workflow state without generic inbox scanning. It publishes the revision/workflow identity and status, the current task identity and `currentTaskUpdatedAt`, and backend-defined actions including transition id, decision, reason/comment requirements, required permission code and `permitted`.

The execute request publishes `expectedTaskUpdatedAt` as the stale-task precondition together with optional reason/comment/decision/correlation inputs. HidraAPI owns transition authorization, workflow execution, conflict handling and the resulting planning revision lifecycle effect.

### Frontend behavior

HidraWEB:

- retains only the verified planning reads plus the revision-scoped approval GET/POST operations;
- loads approval data only for the selected revision and never scans the generic workflow inbox to infer a task;
- resolves approval read/execute permissions from backend route descriptors and effective grants and fails closed when metadata/grants are unavailable;
- renders only backend-returned actions and exposes execution only when `permitted === true`, the transition id exists, execute permission is effective and the backend publishes `currentTaskUpdatedAt`;
- sends the backend-published `currentTaskUpdatedAt` unchanged as `expectedTaskUpdatedAt`;
- collects reason/comment only according to backend-published requirements;
- invalidates the approval projection and revision queries after a successful action;
- does not define a planning/workflow state machine or infer transitions from status/decision strings.

The Playwright test proves the browser posts only the published `transition-approve` action and sends:

```json
{
  "expectedTaskUpdatedAt": "2026-09-12T10:05:00Z",
  "commentText": "Approved in browser test."
}
```

The mocked backend response returns the resulting revision/workflow statuses; HidraWEB displays that response rather than computing lifecycle state locally.

### HWEB-010-04 verification evidence

```text
Backend merge SHA      : 6ef581f557e42e8d96b03ccf429562e646f2e321
Backend issue          : HidraAPI #70 — CLOSED / COMPLETED
Final frontend PR head : 534f2ebcfc10140cc48e6c6e3a2a35e8ea0332dd
Final exact-head CI    : 34682213272 — SUCCESS
Pull request           : HidraWEB #27 — MERGED
Product merge SHA      : f60bc4e45dcdacf90d942b7969190f4b93a70df3
Post-merge product CI  : 34682342319 — SUCCESS
Verified gates         : HWEB-003..HWEB-010 OpenAPI generation; lint; typecheck; unit/component tests; production build; Playwright browser tests
```

### GAP-PLAN-002 — Planning/workflow approval bridge

```text
Status          : VERIFIED
Backend owner   : planning + workflow public contracts
Backend issue   : HidraAPI #70 — CLOSED
Backend evidence: PLN-002 merge 6ef581f557e42e8d96b03ccf429562e646f2e321; OpenAPI artifact 10293549730
Frontend evidence: HWEB-010-04 PR #27; merge f60bc4e45dcdacf90d942b7969190f4b93a70df3; post-merge CI 34682342319
```

HidraWEB still must not infer approval semantics from revision status strings, workflow transition names, `targetModuleCallback`, or architecture documentation alone. Only the revision-scoped backend projection/action contract is authoritative.

## HWEB-010-05 — Planned-vs-actual

Contract audit completed. Frontend implementation remains blocked on deterministic target-scoped monitoring reads.

The accepted backend contracts prove the ownership and field compatibility:

### Planning expected state

`PlanTargetView` publishes expected-value metadata including revision relation, target type, topology/telemetry references, target values, unit, tolerances, validity and status.

The planning DDD defines:

```text
PlanTarget = expected value
TrustedTelemetryReading = actual fact
MonitoringDeviation = comparison result
```

### Telemetry actual facts

`ReadingView` publishes point/value/unit/quality/timestamp/state data, but HidraWEB must not decide which reading or aggregation is the authoritative actual for a plan target.

### Monitoring comparison result

`MonitoringQueryUseCase.DeviationView` already publishes backend-owned expected, actual, difference, percentage, unit, severity and status together with `planTargetId` and source references.

Published monitoring routes include:

```text
GET /api/v1/monitoring/deviations
GET /api/v1/monitoring/deviations/{id}
```

However, the collection endpoint cannot be queried deterministically by `planTargetId`, and a selected `PlanTarget` does not publish a deviation id. HidraWEB therefore cannot safely retrieve the authoritative comparison for one selected target without scanning/paging unrelated monitoring data.

HidraWEB also must not calculate deviation, percentage, tolerance classification or severity from raw telemetry because monitoring owns the comparison result.

### GAP-PLAN-003 — Target-scoped planned-vs-actual projection

```text
Status          : OPEN / BLOCKING HWEB-010-05
Backend owner   : monitoring read contract, using neutral planning target reference
Backend issue   : HidraAPI #71
Frontend action : no planned-vs-actual calculation/projection until the gap closes
Audit PR        : HidraWEB #25 — MERGED
Audit merge SHA : 82aeed74003d5b4efd356b93b5a06091389015d7
Audit main CI   : 34679373105 — SUCCESS
```

Required evidence before HWEB-010-05 can proceed:

- deterministic monitoring read scoped directly by `planTargetId`, or equivalent backend-owned target comparison projection;
- authoritative expected/actual/difference/unit/severity/status fields from monitoring;
- canonical route permissions and deterministic OpenAPI;
- tests proving exact plan-target scoping and empty/not-found behavior;
- exact merge-SHA OpenAPI artifact and green acceptance gates.

HidraWEB must not select a latest/average/sum telemetry reading by convention, calculate deviations itself, or scan unrelated deviation pages hoping to find a target match.

## HWEB-010-06 — Version/concurrency behavior

Contract audit completed. General frontend planning mutation/concurrency behavior remains blocked because no authoritative planning mutation concurrency contract is published for a general planning write surface.

The PLN-002 approval bridge has its own explicit task concurrency precondition (`currentTaskUpdatedAt` -> `expectedTaskUpdatedAt`), and HWEB-010-04 consumes only that published approval-specific semantic. This does not authorize HidraWEB to generalize `updatedAt`, `revisionNumber`, `baseRevisionId` or any other read metadata into a concurrency token for unrelated planning mutations.

For general planning mutation concurrency, the backend must explicitly publish which token/precondition protects which mutation, how stale writes fail, and what refetch/retry/rebase behavior is authoritative.

### GAP-PLAN-004 — Planning mutation concurrency contract

```text
Status          : OPEN / BLOCKING HWEB-010-06
Backend owner   : planning public mutation contract
Backend issue   : HidraAPI #72
Frontend action : no synthetic version token, stale-write test, retry/rebase flow, or general concurrency UI until the gap closes
```

Required evidence before HWEB-010-06 can proceed:

- an intentionally supported planning mutation is published through deterministic OpenAPI;
- its read/mutation contract exposes an explicit backend-owned version or precondition mechanism;
- deterministic conflict semantics are published for stale requests;
- canonical route permissions are available;
- backend tests prove current-token success and stale-token conflict behavior;
- exact merge-SHA OpenAPI artifact and acceptance gates are green;
- HidraWEB can then test the published behavior without defining concurrency policy itself.

HidraWEB must not infer general version semantics from `revisionNumber`, `baseRevisionId`, `updatedAt`, status strings, or persistence implementation details.

## Explicit exclusions retained

HidraWEB still does not implement or infer:

- direct revision lifecycle commands that are not published through an authoritative planning contract;
- generic workflow inbox scanning or transition-name/status inference for planning approval;
- frontend-owned planned-vs-actual arithmetic or severity classification while GAP-PLAN-003 is open;
- general planning concurrency/version tokens or retry/rebase semantics while GAP-PLAN-004 is open;
- nomination/target mutation workspaces;
- realtime planning events;
- a frontend planning or revision state machine.

## Gap status

```text
GAP-PLAN-001 — Planning query contract
Status          : VERIFIED
Backend issue   : HidraAPI #68 — CLOSED
Backend evidence: merge c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55; OpenAPI artifact 10286503941
Frontend evidence: HWEB-010-02 verifies period/plan reads; HWEB-010-03 verifies revision list/detail reads.

GAP-PLAN-002 — Planning/workflow approval bridge
Status          : VERIFIED
Backend issue   : HidraAPI #70 — CLOSED
Backend evidence: PLN-002 merge 6ef581f557e42e8d96b03ccf429562e646f2e321; OpenAPI artifact 10293549730
Frontend evidence: HWEB-010-04 PR #27; merge f60bc4e45dcdacf90d942b7969190f4b93a70df3; post-merge CI 34682342319.

GAP-PLAN-003 — Target-scoped planned-vs-actual projection
Status          : OPEN
Backend issue   : HidraAPI #71 — OPEN
Frontend evidence: planning target and monitoring deviation fields are compatible, but monitoring cannot be queried deterministically by planTargetId and frontend-owned comparison semantics are forbidden.

GAP-PLAN-004 — Planning mutation concurrency contract
Status          : OPEN
Backend issue   : HidraAPI #72 — OPEN
Frontend evidence: no general planning mutation publishes an authoritative version/precondition token and stale-write conflict behavior. Approval-specific task concurrency in PLN-002 does not establish general planning concurrency semantics.
```

## Remaining HWEB-010 sequence

- HWEB-010-04 is complete and verified.
- HWEB-010-05 resumes only after GAP-PLAN-003 closes with deterministic target-scoped monitoring evidence.
- HWEB-010-06 resumes only after GAP-PLAN-004 closes with deterministic general planning mutation/concurrency evidence.
