# HWEB-010 — Planning

Status: BLOCKED ON BACKEND QUERY CONTRACT

## HWEB-010-01 — Contract inventory

### Accepted repository baselines

```text
HidraWEB main SHA : d56340e8170713ed29babcceccb066866b614eda
HidraAPI main SHA : 1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
Backend artifact  : hidra-api-openapi-1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
Artifact id       : 10284237542
Artifact digest   : sha256:3c861464876f588fdd40352b379a2bfe2a87840272703b71d20d7f81e9a6898f
Backend issue     : CHOUABBIA-AMINE/HidraAPI#68
Frontend issue    : CHOUABBIA-AMINE/HidraWEB#18
```

### Backend ownership

The `planning` bounded context owns expected operational state. The planning DDD states that telemetry owns actual facts, while planning owns periods, operational plans, revisions, scenarios, nominations, planned targets, expected flow state, operation windows, constraints, approval references, and planning catalogs.

Cross-module references must remain neutral references/snapshots. Planning must not import topology, telemetry, workflow, organization, identity, monitoring, alarm, incident, or maintenance aggregates as owned state.

### Current implemented backend evidence

The planning Java module is structurally present and includes domain/application types. Verified examples include:

- `PlanningPeriodSummaryDto`
- `OperationalPlanSummaryDto`
- `FindOperationalPlanByIdQuery`
- `OperationalPlan`
- `Nomination`
- `NominationScheduleLine`
- `PlanTarget`
- `ExpectedFlowState`
- `PlanApprovalReference`
- `ForecastSeries`
- `ForecastPoint`
- `PlanActualReviewSnapshot`

The currently visible summary DTOs are internal application records, not published frontend contracts.

`PlanningPeriodSummaryDto` currently contains:

```text
id
code
nameFr
periodStart
periodEnd
timeZone
status
```

`OperationalPlanSummaryDto` currently contains:

```text
id
periodId
code
nameFr
topologyScopeType
topologyScopeId
status
approvedRevisionId
```

These fields must not be copied into handwritten HidraWEB models unless and until they are published through deterministic OpenAPI.

### Public contract audit result

At HidraAPI `1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b`:

- `PlanningApi` is an empty marker interface.
- `PlanningRestApi` only extends `PlanningApi` and declares no operations.
- no planning REST controller mappings were found.
- therefore HidraWEB has no usable planning route/DTO/permission slice to generate from the accepted OpenAPI artifact.

The logical Planning data-definition document is explicitly a target architecture baseline and cannot be treated as a published REST contract.

### HWEB-010 gap classification

```text
GAP-PLAN-001 — Planning query contract
Status          : OPEN
Backend owner   : planning
Backend issue   : HidraAPI #68
Frontend impact : Blocks HWEB-010-02 planning period and plan workspaces.
```

Minimum backend acceptance target:

- typed paged list/detail for planning periods;
- typed paged list/detail for operational plans;
- plan revision list/detail through an explicit published relationship;
- nomination list/detail through an explicit published relationship;
- plan-target list/detail through an explicit published relationship;
- canonical route-permission descriptors using `<module>:<resource>:<action>`;
- deterministic OpenAPI publication from the exact merge SHA;
- stable paging/filter semantics and preserved optionality;
- topology/workflow/actor/organization references only where the owner DTO publishes them;
- deterministic authorization and not-found/error behavior.

### Explicitly not accepted from current source-only evidence

HidraWEB must not infer or implement any of the following yet:

- planning REST paths;
- permission codes;
- plan/revision transition availability;
- create/update/submit/approve/reject/supersede commands;
- workflow approval behavior;
- concurrency/optimistic-lock request fields;
- planned-vs-actual comparison semantics;
- nomination mutation lifecycle;
- target mutation lifecycle;
- realtime planning events;
- frontend-owned planning state machine.

### HWEB-010 execution decision

HWEB-010-01 is complete as an inventory task. HWEB-010-02 is blocked until HidraAPI #68 publishes a deterministic planning query contract and the corresponding artifact is accepted by exact SHA/digest.

When that backend gap is closed, the frontend must:

1. pin the exact HidraAPI merge SHA and artifact digest;
2. extract only the planning OpenAPI slice;
3. add Orval generation in CI;
4. derive planning read permissions from backend route descriptors;
5. implement TanStack Query adapters for published reads only;
6. keep planning server state out of local/global client stores;
7. add component and Playwright coverage before marking the gap VERIFIED.
