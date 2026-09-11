# HWEB-010 — Planning

Status: HWEB-010-02 COMPLETE

## Accepted repository baselines

```text
HidraWEB implementation base : 1e4da0577c3a12a95760f6ee03d21190420cdcfa
HidraAPI accepted main SHA   : c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55
Backend artifact             : hidra-api-openapi-c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55
Artifact id                  : 10286503941
Artifact digest              : sha256:cadc680414407bb3c388a093a3f8fa8fc5406a6b63b3760708f54576eff4b781
Backend issue                : CHOUABBIA-AMINE/HidraAPI#68 — CLOSED
Frontend inventory issue     : CHOUABBIA-AMINE/HidraWEB#18 — CLOSED
```

## HWEB-010-01 — Contract inventory

Completed. The original inventory correctly blocked frontend implementation while HidraAPI had no published planning query contract.

HidraAPI PLN-001 subsequently published and merged a deterministic read-only planning contract at
`c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55`. Exact merge-SHA CI published the accepted OpenAPI artifact above.

The accepted read contract includes:

```text
GET /api/v1/planning/periods
GET /api/v1/planning/periods/{id}
GET /api/v1/planning/operational-plans
GET /api/v1/planning/operational-plans/{id}
GET /api/v1/planning/revisions?planId=...
GET /api/v1/planning/revisions/{id}
GET /api/v1/planning/nominations?revisionId=...
GET /api/v1/planning/nominations/{id}
GET /api/v1/planning/targets?revisionId=...
GET /api/v1/planning/targets/{id}
```

The artifact preserves OpenAPI optionality and publishes `PlanningPeriodView`, `OperationalPlanView`, revision,
nomination and target views plus paged wrappers. Paging is zero-based with backend defaults and limits.

## HWEB-010-02 — Planning period and plan workspaces

Implemented scope:

- exact-SHA HWEB-010-02 planning OpenAPI slice retained under `openapi/`, containing only period and operational-plan reads used by this task;
- dedicated Orval planning generation wired into local verification and GitHub Actions;
- `/planning` route enabled in the application router and navigation registry;
- planning-period paged list and detail workspace;
- operational-plan paged list and detail workspace;
- TanStack Query owns planning server state; React local state owns tab, paging and selected-detail state only;
- route permissions are looked up from backend route descriptors at runtime and evaluated against effective grants;
- missing route metadata fails closed;
- API errors preserve normal HidraAPI error handling, including explicit 403 messaging;
- component coverage exercises period and plan list/detail reads;
- Playwright coverage exercises the same published read path.

### Frontend verification evidence

```text
Behavioral commit      : d711b5014419e6022748d4d3c48c6052e37f5c39
Behavioral CI          : 34659171158 — SUCCESS
Final PR head          : bcd82c6f272990fd22d9f37d3260be276b56a254
Final exact-head CI    : 34659336556 — SUCCESS
Pull request           : HidraWEB #20 — MERGED
Merge SHA              : aae64ce602d98233a298fae8653efdfd19b43951
Post-merge main CI     : 34659530090 — SUCCESS
Verified gates         : HWEB-003..HWEB-010 OpenAPI generation; lint; typecheck; unit/component tests; production build; Playwright browser tests
```

### Published DTO fields used by HWEB-010-02

Planning periods display only fields published by `PlanningPeriodView`, including identifiers, multilingual names,
period bounds, timezone, status, period type, actor and timestamps.

Operational plans display only fields published by `OperationalPlanView`, including period reference, multilingual
names, topology-scope snapshot/reference fields, status, current/approved revision references, organization reference,
actor and timestamps.

No handwritten planning DTO replaces generated OpenAPI types.

## Ownership boundaries retained

Planning owns expected operational state. HidraWEB does not turn topology identifiers, organization identifiers,
actor identifiers, workflow references, telemetry facts or revision identifiers into frontend-owned aggregates.

HWEB-010-02 intentionally does **not** implement:

- create/update planning commands;
- revision/version presentation beyond displaying published current/approved revision identifiers;
- revision mutations;
- workflow approval;
- planned-vs-actual comparison;
- nominations or target workspaces;
- realtime planning events;
- any frontend planning state machine.

Those remain later HWEB-010 tasks and require their own verified contract evidence.

## Gap status

```text
GAP-PLAN-001 — Planning query contract
Status          : VERIFIED
Backend owner   : planning
Backend issue   : HidraAPI #68 — CLOSED
Backend evidence: merge c9ef4886445479f7b2d88f8fa0d4a8b37cb59e55; OpenAPI artifact 10286503941
Frontend evidence: HWEB-010-02 consumes and tests planning period and operational-plan list/detail reads; PR #20 merged at aae64ce602d98233a298fae8653efdfd19b43951 and push-triggered main CI 34659530090 passed.
```

## Remaining HWEB-010 sequence

- HWEB-010-03 implement revisions/version presentation from the already published read contract.
- HWEB-010-04 integrate workflow approval only from verified workflow/plan contracts.
- HWEB-010-05 implement planned-vs-actual only where comparable planning and telemetry fields are proven.
- HWEB-010-06 test version/concurrency behavior only after authoritative mutation/concurrency contracts exist.
