# HWEB-010 — Planning

Status: HWEB-010-03 COMPLETE

## Accepted repository baselines

```text
HidraWEB product merge       : 74e557413b3dd267da7a2cec3f9578a5d3b8bf89
HidraAPI accepted main SHA   : c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55
Backend artifact             : hidra-api-openapi-c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55
Artifact id                  : 10286503941
Artifact digest              : sha256:cadc680414407bb3c388a093a3f8fa8fc5406a6b63b3760708f54576eff4b781
Backend issue                : CHOUABBIA-AMINE/HidraAPI#68 — CLOSED
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
Verified gates         : HWEB-003..HWEB-010 OpenAPI generation; lint; typecheck; unit/component tests; production build; Playwright browser tests
```

## Explicit HWEB-010-03 exclusions

HidraWEB still does not implement or infer:

- create/update revision commands;
- submit/approve/reject/supersede revision actions;
- workflow approval integration;
- concurrency/version mutation tokens;
- planned-vs-actual comparison;
- nomination/target workspaces;
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
```

## Remaining HWEB-010 sequence

- HWEB-010-04 integrate workflow approval only from verified workflow/plan contracts.
- HWEB-010-05 implement planned-vs-actual only where comparable planning and telemetry fields are proven.
- HWEB-010-06 test version/concurrency behavior only after authoritative mutation/concurrency contracts exist.
