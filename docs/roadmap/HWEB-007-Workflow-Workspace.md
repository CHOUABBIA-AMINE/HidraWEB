# HWEB-007 — Workflow Task Workspace

```text
Phase                 : HWEB-007
Implementation status : COMPLETE for backend-supported query/action-visibility scope
Frontend route        : /work/tasks
Backend source commit : af4c3b4723619a25dd9a94f4d27f5a36adab982e
Contract artifact     : hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e
Artifact digest       : sha256:64a187d362725d7cfd674f5f130d1345f97f88e9151e65d4d5d29d74e76d932a
Behavioral CI         : 34609250694 at b95c88f1d9ad140009b22fcf2bb9324a41feed9e
```

## Delivered scope

HWEB-007 provides a permission-aware workflow workspace for the capabilities that HidraAPI currently publishes as authoritative query contracts:

- assigned task inbox and task detail;
- workflow instance detail;
- ordered workflow timeline/history;
- backend-computed available-action visibility;
- multilingual shell/navigation integration;
- loading, empty, authorization and query-error degradation through the existing frontend infrastructure.

The workspace does not maintain a frontend workflow state machine and does not infer transitions from status, step names, labels or permissions.

## Contract slice and generation gate

```text
openapi/hidra-workflow-af4c3b4723619a25dd9a94f4d27f5a36adab982e.json
orval.workflow.config.ts
npm run api:generate:workflow
```

HidraWEB CI regenerates the workflow client before lint, typecheck, unit/component tests, production build and E2E tests.

## Consumed query routes

```text
GET /api/v1/workflow/tasks
GET /api/v1/workflow/tasks/{id}
GET /api/v1/workflow/tasks/{id}/available-actions
GET /api/v1/workflow/instances/{id}
GET /api/v1/workflow/instances/{id}/timeline
```

The task inbox uses the backend `view=assigned` contract and a bounded first page. The frontend displays the returned paging total rather than assuming the loaded window represents every task.

## Canonical read permissions

```text
workflow:tasks:read
workflow:instances:read
```

HidraWEB uses the principal-specific grants from `GET /api/v1/identity/me/permissions`. HidraAPI remains the final authorization boundary.

## State ownership

- TanStack Query owns task pages, task details, available actions, workflow instances and timeline entries.
- React local state owns the selected task and presentation state.
- No workflow state machine, transition table or lifecycle cache is duplicated in the frontend.
- No global Zustand store is introduced for workflow server state.

## Available-action semantics

`GET /api/v1/workflow/tasks/{id}/available-actions` is authoritative for which choices the backend reports for the current task/principal. HidraWEB displays returned fields such as `decision`, `fromStepId`, `toStepId`, `reasonRequired`, `commentRequired`, `requiredPermissionCode` and `permitted` without deriving alternative choices locally.

Available actions are intentionally informational in HWEB-007. Automated component and browser tests prove that a backend-returned `APPROVE` decision is visible but is not rendered as an executable `APPROVE` button.

## Open transition-execution gap

`GAP-WF-004` remains `OPEN`.

The accepted contract exposes `POST /api/v1/workflow/actions`, but backend source verification shows the corresponding application service records/persists a workflow action/audit object. It is not an explicit, verified transition-execution operation that consumes an `AvailableActionView` choice and advances task/instance state.

HidraWEB therefore does not misuse `/workflow/actions` as a transition endpoint and does not invent claim/approve/reject/return/delegate execution semantics. Closing this gap requires HidraAPI to publish and test a dedicated transition/action execution contract, including required reason/comment validation, authorization/concurrency behavior, authoritative state advancement and result DTOs.

## Verification

Behavioral branch CI run `34609250694` at `b95c88f1d9ad140009b22fcf2bb9324a41feed9e` passed:

- HWEB-003 workbench OpenAPI generation;
- HWEB-004 identity/organization OpenAPI generation;
- HWEB-005 topology OpenAPI generation;
- HWEB-006 telemetry/monitoring OpenAPI generation;
- HWEB-007 workflow OpenAPI generation;
- lint;
- typecheck;
- 17/17 unit and component tests;
- production build;
- 12/12 Playwright E2E tests.

## Gap posture

```text
GAP-WF-001 : VERIFIED — task inbox/detail consumed and tested
GAP-WF-002 : VERIFIED — instance/timeline consumed and tested
GAP-WF-003 : VERIFIED — backend-provided action visibility consumed and tested
GAP-WF-004 : OPEN     — no verified workflow transition-execution contract
```

With this constraint recorded, HWEB-007 is complete for the currently supported frontend scope. After merge and post-merge `main` CI, HWEB-008 Alarms is the next frontend phase.
