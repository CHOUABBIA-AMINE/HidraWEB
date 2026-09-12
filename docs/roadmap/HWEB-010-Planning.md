# HWEB-010 — Planning

Status: HWEB-010-05 COMPLETE / VERIFIED; HWEB-010-06 BLOCKED ON GAP-PLAN-004

## Accepted repository baselines

```text
HidraWEB audit base            : d547bc261009acd07f94a615cb58f0c80526ff49
HidraWEB current product merge : 706d2f1415510a91105318a682ff33cb43d0a529
HidraAPI accepted main SHA     : df8c012be9034886e53f2ec64c28946f18f67b31
Backend artifact               : hidra-api-openapi-df8c012be9034886e53f2ec64c28946f18f67b31
Artifact id                    : 10297106684
Artifact digest                : sha256:5d01f56b83c829ded2fce4bede553f33cff74590e5df946e8f3251a5ae1bf537
Backend query issue            : CHOUABBIA-AMINE/HidraAPI#68 — CLOSED
Backend approval issue         : CHOUABBIA-AMINE/HidraAPI#70 — CLOSED
Backend comparison issue       : CHOUABBIA-AMINE/HidraAPI#71 — CLOSED / COMPLETED
Backend concurrency issue      : CHOUABBIA-AMINE/HidraAPI#72 — OPEN
Frontend inventory issue       : CHOUABBIA-AMINE/HidraWEB#18 — CLOSED
```

## HWEB-010-01 — Contract inventory

Completed. HidraAPI PLN-001 published and merged deterministic read-only planning contracts at `c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55` for periods, operational plans, revisions, nominations and targets. Paging is zero-based; default size is 50 and the backend owns request validation, authorization and not-found behavior.

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

The approval projection resolves the planning revision to backend-owned workflow state without generic inbox scanning. It publishes revision/workflow identity and status, authoritative current task identity and `currentTaskUpdatedAt`, and backend-defined actions including transition id, decision, reason/comment requirements, required permission code and `permitted`.

HidraWEB renders only backend-returned actions, executes only permitted transitions, sends `currentTaskUpdatedAt` unchanged as `expectedTaskUpdatedAt`, invalidates/refetches approval/revision state after success, and defines no planning/workflow state machine.

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
Status           : VERIFIED
Backend owner    : planning + workflow public contracts
Backend issue    : HidraAPI #70 — CLOSED
Backend evidence : PLN-002 merge 6ef581f557e42e8d96b03ccf429562e646f2e321; OpenAPI artifact 10293549730
Frontend evidence: HWEB-010-04 PR #27; merge f60bc4e45dcdacf90d942b7969190f4b93a70df3; post-merge CI 34682342319
```

## HWEB-010-05 — Planned-vs-actual

Complete and verified from the authoritative PLN-003 monitoring contract.

### Backend contract

HidraAPI PLN-003 extended the existing monitoring deviation collection with an exact target-scoped filter while preserving monitoring ownership of comparison semantics:

```text
GET /api/v1/monitoring/deviations?planTargetId={planTargetId}&status={status}&severity={severity}&topologyAssetId={topologyAssetId}&telemetryPointId={telemetryPointId}&from={from}&to={to}&page={page}&size={size}
```

Accepted backend evidence:

```text
Roadmap task       : PLN-003
Backend issue      : HidraAPI #71 — CLOSED / COMPLETED
Backend merge SHA  : df8c012be9034886e53f2ec64c28946f18f67b31
Post-merge CI      : 34689500217 — SUCCESS
OpenAPI artifact   : hidra-api-openapi-df8c012be9034886e53f2ec64c28946f18f67b31
Artifact id        : 10297106684
Artifact digest    : sha256:5d01f56b83c829ded2fce4bede553f33cff74590e5df946e8f3251a5ae1bf537
```

Monitoring remains owner of the returned comparison fields: `planTargetId`, `trustedTelemetryReadingId`, `telemetryPointId`, `actualValue`, `expectedValue`, `differenceValue`, `differencePercent`, `unitId`, `severity`, `status`, timestamps and reason metadata. Planning remains owner of target/expected state and telemetry remains owner of actual readings.

### Frontend behavior

HidraWEB now:

- pins planning and telemetry/monitoring slices to the exact accepted backend merge/artifact;
- loads `GET /api/v1/planning/targets?revisionId=...` for the selected revision;
- stores only the selected target id locally;
- queries `GET /api/v1/monitoring/deviations` with the exact selected `planTargetId`;
- resolves both target-read and monitoring-deviation permissions from backend route descriptors plus effective grants and fails closed when unavailable;
- displays backend-provided expected, actual, difference, difference percentage, unit, severity, status and trusted-reading reference values verbatim;
- treats an empty target-scoped deviation page as no authoritative comparison rows rather than deriving a fallback;
- does not fetch raw telemetry to reconstruct the comparison;
- performs no expected/actual arithmetic, tolerance classification, severity mapping or client comparison state machine.

### HWEB-010-05 verification evidence

```text
Final frontend PR head : fd9bfd4fe41e39722ea82547be0d81bc48f423d6
Final exact-head CI    : 34691908323 — SUCCESS
Pull request           : HidraWEB #29 — MERGED
Product merge SHA      : 706d2f1415510a91105318a682ff33cb43d0a529
Post-merge product CI  : 34692023707 — SUCCESS
Verified gates         : HWEB-003..HWEB-010 OpenAPI generation; lint; typecheck; unit/component tests; production build; Playwright browser tests
Browser evidence       : planning.spec.ts asserts revisionId target lookup, exact planTargetId monitoring query and verbatim backend comparison presentation
```

### GAP-PLAN-003 — Target-scoped planned-vs-actual projection

```text
Status           : VERIFIED
Backend owner    : monitoring read contract using neutral planning target reference
Backend issue    : HidraAPI #71 — CLOSED / COMPLETED
Backend evidence : PLN-003 merge df8c012be9034886e53f2ec64c28946f18f67b31; post-merge CI 34689500217; OpenAPI artifact 10297106684
Frontend evidence: HWEB-010-05 PR #29; merge 706d2f1415510a91105318a682ff33cb43d0a529; post-merge CI 34692023707
```

HidraWEB must continue to avoid selecting a latest/average/sum telemetry reading by convention, calculating deviations itself, or scanning unrelated deviation pages hoping to find a target match.

## HWEB-010-06 — Version/concurrency behavior

Contract audit completed. General frontend planning mutation/concurrency behavior remains blocked because no authoritative planning mutation concurrency contract is published for a general planning write surface.

The PLN-002 approval bridge has its own explicit task concurrency precondition (`currentTaskUpdatedAt` -> `expectedTaskUpdatedAt`). HWEB-010-04 consumes only that published approval-specific semantic. This does not authorize HidraWEB to generalize `updatedAt`, `revisionNumber`, `baseRevisionId` or other read metadata into a concurrency token for unrelated planning mutations.

### GAP-PLAN-004 — Planning mutation concurrency contract

```text
Status          : OPEN / BLOCKING HWEB-010-06
Backend owner   : planning public mutation contract
Backend issue   : HidraAPI #72 — OPEN
Frontend action : no synthetic version token, stale-write test, retry/rebase flow, or general concurrency UI until the gap closes
```

Required backend evidence before HWEB-010-06 can proceed:

- an intentionally supported planning mutation published through deterministic OpenAPI;
- an explicit backend-owned version/precondition mechanism for that mutation;
- authoritative current token returned by the applicable read/mutation response;
- deterministic stale-write conflict semantics;
- canonical route permissions;
- backend tests proving current-token success and stale-token conflict;
- exact merge-SHA OpenAPI artifact and green compile/test/acceptance/OpenAPI gates.

HidraWEB must not infer general version semantics from `revisionNumber`, `baseRevisionId`, `updatedAt`, status strings, or persistence implementation details.

## Explicit exclusions retained

HidraWEB still does not implement or infer:

- direct revision lifecycle commands not published through an authoritative planning contract;
- generic workflow inbox scanning or transition-name/status inference for planning approval;
- frontend-owned planned-vs-actual arithmetic or severity classification;
- general planning concurrency/version tokens or retry/rebase semantics while GAP-PLAN-004 is open;
- nomination/target mutation workspaces;
- realtime planning events;
- a frontend planning or revision state machine.

## Gap status

```text
GAP-PLAN-001 — Planning query contract
Status           : VERIFIED
Backend issue    : HidraAPI #68 — CLOSED
Backend evidence : merge c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55; OpenAPI artifact 10286503941
Frontend evidence: HWEB-010-02 verifies period/plan reads; HWEB-010-03 verifies revision list/detail reads.

GAP-PLAN-002 — Planning/workflow approval bridge
Status           : VERIFIED
Backend issue    : HidraAPI #70 — CLOSED
Backend evidence : PLN-002 merge 6ef581f557e42e8d96b03ccf429562e646f2e321; OpenAPI artifact 10293549730
Frontend evidence: HWEB-010-04 PR #27; merge f60bc4e45dcdacf90d942b7969190f4b93a70df3; post-merge CI 34682342319.

GAP-PLAN-003 — Target-scoped planned-vs-actual projection
Status           : VERIFIED
Backend issue    : HidraAPI #71 — CLOSED / COMPLETED
Backend evidence : PLN-003 merge df8c012be9034886e53f2ec64c28946f18f67b31; post-merge CI 34689500217; OpenAPI artifact 10297106684
Frontend evidence: HWEB-010-05 PR #29; merge 706d2f1415510a91105318a682ff33cb43d0a529; post-merge CI 34692023707.

GAP-PLAN-004 — Planning mutation concurrency contract
Status           : OPEN
Backend issue    : HidraAPI #72 — OPEN
Frontend evidence: no general planning mutation publishes an authoritative version/precondition token and stale-write conflict behavior. Approval-specific task concurrency in PLN-002 does not establish general planning concurrency semantics.
```

## Remaining HWEB-010 sequence

- HWEB-010-05 is complete and verified.
- Next backend task is to close GAP-PLAN-004 / HidraAPI #72 with an authoritative planning mutation concurrency contract.
- HWEB-010-06 resumes only after that exact backend merge-SHA contract and artifact are verified.
- HWEB-010 closes only after HWEB-010-06 is implemented, merged and post-merge verified.
