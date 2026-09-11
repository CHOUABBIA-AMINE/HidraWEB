# HWEB-007 — Workflow Task Workspace

```text
Phase                 : HWEB-007
Implementation status : COMPLETE for backend-supported query and authoritative transition-execution scope
Frontend route        : /work/tasks
Backend source commit : 6e3f3b2829bb63f0d004c8bc9ba386d05eb3edcc
Contract artifact     : hidra-api-openapi-6e3f3b2829bb63f0d004c8bc9ba386d05eb3edcc
Artifact digest       : sha256:0c9ce17f797450e2463e103e2daecdd926fd3cf52c0f278ff8aef576913ab2ab
Behavioral CI         : 34630590467 at 1162a93390ed0f614c39e3a59a0581518b9f6804
```

## Delivered scope

HWEB-007 provides a permission-aware workflow workspace for the capabilities HidraAPI publishes as authoritative contracts:

- assigned task inbox and task detail;
- workflow instance detail;
- ordered workflow timeline/history;
- backend-computed available-action visibility;
- authoritative transition execution through the backend-selected transition id;
- backend-declared reason/comment evidence collection;
- stale-task protection using the current task `updatedAt` as `expectedTaskUpdatedAt`;
- authoritative post-command refetch of task, actions, instance and timeline;
- multilingual shell/navigation integration;
- loading, empty, authorization and query-error degradation through the existing frontend infrastructure.

The workspace does not maintain a frontend workflow state machine and does not infer transitions from status, step names, labels or permissions.

## Contract slice and generation gate

```text
openapi/hidra-workflow-6e3f3b2829bb63f0d004c8bc9ba386d05eb3edcc.json
orval.workflow.config.ts
npm run api:generate:workflow
```

HidraWEB CI regenerates the workflow client before lint, typecheck, unit/component tests, production build and E2E tests.

## Consumed routes

```text
GET  /api/v1/workflow/tasks
GET  /api/v1/workflow/tasks/{id}
GET  /api/v1/workflow/tasks/{id}/available-actions
GET  /api/v1/workflow/instances/{id}
GET  /api/v1/workflow/instances/{id}/timeline
POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute
```

The task inbox uses the backend `view=assigned` contract and a bounded first page. The frontend displays the returned paging total rather than assuming the loaded window represents every task.

The legacy `POST /api/v1/workflow/actions` contract remains record-only and is not used as a transition-execution substitute.

## Canonical read permissions

```text
workflow:tasks:read
workflow:instances:read
```

HidraWEB uses the principal-specific grants from `GET /api/v1/identity/me/permissions`. HidraAPI remains the final authorization boundary, including any transition-specific permission enforcement reported through `requiredPermissionCode` and `permitted`.

## State ownership

- TanStack Query owns task pages, task details, available actions, workflow instances and timeline entries.
- React local state owns selected task/action and reason/comment/decision-note presentation state.
- Successful execution invalidates and refetches backend-owned workflow state.
- No workflow state machine, transition table or lifecycle cache is duplicated in the frontend.
- No global Zustand store is introduced for workflow server state.

## Available-action and execution semantics

`GET /api/v1/workflow/tasks/{id}/available-actions` is authoritative for which choices the backend reports for the current task/principal. HidraWEB displays returned fields such as `decision`, `fromStepId`, `toStepId`, `reasonRequired`, `commentRequired`, `requiredPermissionCode` and `permitted` without deriving alternative choices locally.

An action is executable in HidraWEB only when the backend returned `permitted=true` and supplied a `transitionId`. The execution request uses that exact transition id and the selected task's authoritative `updatedAt` value as `expectedTaskUpdatedAt`. Required reason/comment inputs are collected only when the backend marks them required. HidraWEB never sends a desired workflow state.

A successful execution causes task inbox/detail, available actions, workflow instance and timeline queries to be invalidated/refetched. A backend conflict/stale response is surfaced as a refresh-before-retry condition rather than being resolved locally.

## GAP-WF-004 closure

`GAP-WF-004` is `VERIFIED`.

HidraAPI issue #57 was implemented and merged in backend PR #60. The backend publishes and tests the dedicated transition execution contract:

```text
POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute
```

Backend behavior includes server-derived acting principal/effective permissions, task/instance locking, stale token validation, assignment/permission/reason/comment/definition/transition checks, atomic task/instance advancement, workflow action/history persistence, and authoritative result return. Conditional-expression and target-module-callback transitions fail closed until their execution mechanisms exist.

HidraWEB consumes that published contract directly and still does not repurpose `/workflow/actions`.

## Verification

Behavioral branch CI run `34630590467` at `1162a93390ed0f614c39e3a59a0581518b9f6804` passed:

- HWEB-003 workbench OpenAPI generation;
- HWEB-004 identity/organization OpenAPI generation;
- HWEB-005 topology OpenAPI generation;
- HWEB-006 telemetry/monitoring OpenAPI generation;
- HWEB-007 workflow OpenAPI generation;
- HWEB-008 alarm OpenAPI generation;
- lint;
- typecheck;
- unit and component tests;
- production build;
- Playwright Chromium installation;
- E2E browser tests.

Component and E2E coverage prove the exact transition POST path/body, the `expectedTaskUpdatedAt` concurrency token, backend-required comment handling, authoritative success/refetch flow, and absence of execution controls for non-permitted actions.

## Gap posture

```text
GAP-WF-001 : VERIFIED — task inbox/detail consumed and tested
GAP-WF-002 : VERIFIED — instance/timeline consumed and tested
GAP-WF-003 : VERIFIED — backend-provided action visibility consumed and tested
GAP-WF-004 : VERIFIED — authoritative transition execution consumed and tested
```

HWEB-007 is complete for the accepted workflow contract. Workflow lifecycle truth remains backend-owned.