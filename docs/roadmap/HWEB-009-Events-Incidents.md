# HWEB-009 — Events and Incidents

Status: IMPLEMENTATION COMPLETE — final merge/post-merge verification pending

## Accepted backend baselines

HWEB-009 was completed from three deterministic HidraAPI query-contract baselines, one per backend owner.

### Incident

```text
HidraAPI merge SHA : 5c4c949fc73c0e15fcc8794beb2c6681931afc7e
CI run             : 34648671005
Artifact           : hidra-api-openapi-5c4c949fc73c0e15fcc8794beb2c6681931afc7e
Artifact id        : 10282547431
Artifact digest    : sha256:a5e563f2c0e56b03af32ed79e8ab26146fa8dec4eca43d9a33fd1049596e08c9
Backend gap        : HidraAPI issue #62 — CLOSED
```

### Leak detection

```text
HidraAPI merge SHA : ff92c6af819723f4965a8a631a633384be2c46e1
CI run             : 34651081678
Artifact           : hidra-api-openapi-ff92c6af819723f4965a8a631a633384be2c46e1
Artifact id        : 10284275349
Artifact digest    : sha256:f77554c0488ebcc7a46d76d2a442378013afb30d0024e8929726c2fef5efc2eb
Backend gap        : HidraAPI issue #63 — CLOSED
```

### HSE

```text
HidraAPI merge SHA : 1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
CI run             : 34652739432
Artifact           : hidra-api-openapi-1bfa44ed5fd9fea43e86b8ac7b7ac85c6bdf611b
Artifact id        : 10284237542
Artifact digest    : sha256:3c861464876f588fdd40352b379a2bfe2a87840272703b71d20d7f81e9a6898f
Backend gap        : HidraAPI issue #64 — CLOSED
```

## HWEB-009-01 — Contract inventory

Authoritative owners remain separate:

- `incident` owns operational incidents and incident lifecycle state.
- `leakdetection` owns leak candidates and leak cases.
- `hse` owns HSE cases and CAPA records.

The `/events` route composes one user process only. HidraWEB does not create a competing shared incident/event domain model and does not move ownership between backend modules.

Verified read contracts:

- `GET /api/v1/incident/incidents?page=&size=`
- `GET /api/v1/incident/incidents/{id}`
- `GET /api/v1/leakdetection/candidates?page=&size=`
- `GET /api/v1/leakdetection/candidates/{id}`
- `GET /api/v1/leakdetection/cases?page=&size=`
- `GET /api/v1/leakdetection/cases/{id}`
- `GET /api/v1/hse/cases?page=&size=`
- `GET /api/v1/hse/cases/{id}`
- `GET /api/v1/hse/capas?page=&size=`
- `GET /api/v1/hse/capas/{id}`

All production read authorization is derived from HidraAPI route-permission descriptors and the current principal's effective grants. HidraAPI remains the final authorization boundary.

## HWEB-009-02 — Incident workspace

Delivered and merged through the HWEB-009 incident slice:

- artifact-derived incident OpenAPI slice and Orval generation;
- paged incident register and detail panel;
- backend-owned status, classification, severity, priority, source, topology, organization, actor, workflow and timestamps;
- TanStack Query owns incident server state;
- missing route descriptors or effective permissions fail closed;
- no local incident lifecycle state machine.

Incident frontend merge evidence:

```text
HidraWEB merge SHA : cc2d676ee1afdbd4e1fe70d8ffd1a05221df096d
Post-merge main CI : green
```

## HWEB-009-03 — Leak detection workspace

Delivered and merged through the HWEB-009 leak slice:

- artifact-derived leak OpenAPI slice and Orval generation;
- paged leak candidate register/detail;
- paged leak case register/detail;
- candidate and case read permissions are evaluated independently from backend route metadata;
- only backend-modeled status, severity, confidence, topology, actor, organization, correlation and lifecycle timestamps are rendered;
- no incident/workflow/alarm relationship is fabricated where the leak query DTOs do not publish one;
- no leak lifecycle state is inferred locally.

Leak frontend merge evidence:

```text
HidraWEB merge SHA : f7b0446024126c0b838f4853cbd1fca133f3d9a0
Post-merge main CI : 34652031970 — SUCCESS
```

## HWEB-009-04 — HSE workspace

Implemented on `hweb-009-hse-workspace`:

- artifact-derived HSE OpenAPI slice and Orval generation;
- paged HSE case register/detail;
- paged CAPA register/detail;
- HSE case and CAPA read permissions are evaluated independently from backend route metadata;
- HSE case detail uses only backend-published incident snapshots, topology target snapshots, responsible organization, reporting actor, workflow instance and audit references;
- CAPA detail uses only backend-published owner, target date, verification flag, linked work order and workflow task references;
- no HSE lifecycle mutation or transition is invented.

Latest green behavioral evidence before documentation update:

```text
Branch             : hweb-009-hse-workspace
Behavioral HEAD    : 40ad230b4152274d8ad74be3c92908a573348fc0
CI run             : 34654112588 — SUCCESS
Gates              : all OpenAPI generators, lint, typecheck, unit/component tests, production build, Playwright install, E2E
```

## HWEB-009-05 — Cross-module composition

Cross-module context is composed only when public owner-module references exist in the consumed DTOs:

- incident exposes topology, responsible actor/organization and workflow-instance references;
- HSE exposes incident snapshots, topology target snapshots, workflow-instance/audit references;
- CAPA exposes linked work-order and workflow-task references;
- leak views remain limited to the references actually published by `leakdetection`.

HidraWEB does not query another module merely because an identifier appears similar, and it does not infer unavailable relationships.

## HWEB-009-06 — Evidence and timeline pattern

The phase uses backend-authored identifiers, timestamps, actor snapshots, correlation/audit references and lifecycle fields as evidence. No synthetic cross-domain timeline is constructed where the owner modules do not publish a common ordered event contract.

`GAP-REALTIME-001` remains `DEFERRED`; HWEB-009 is HTTP query/refetch based and does not invent realtime event names, payloads, destinations, ordering or recovery behavior.

## HWEB-009-07 — Domain actions

No additional incident/leak/HSE lifecycle controls are introduced as part of the final HWEB-009 read-composition closure. Existing backend command endpoints remain backend-owned and require their exact authorization, concurrency, actor-attribution and lifecycle semantics before any future UI exposes them.

Alarm suppression is explicitly outside HWEB-009. `GAP-ALARM-004` remains open until HidraAPI publishes authoritative suppression/release lifecycle semantics and mutation contracts.

## HWEB-009-08 — Verification and failure recovery

Verified behaviors include:

- independent backend permission boundaries per owner/resource;
- fail-closed behavior when route descriptors or effective grants are absent;
- normalized backend/network error presentation;
- paged empty-state handling;
- incident, leak candidate, leak case, HSE case and CAPA detail retrieval;
- browser navigation through the complete `/events` process;
- no request to nonexistent read APIs;
- no frontend-owned business-state machine.

## State ownership

Server state is owned by TanStack Query.

React local state is limited to:

- selected `/events` tab;
- page numbers;
- selected incident/candidate/leak-case/HSE-case/CAPA identifiers;
- presentation-only state.

## Final completion gate

HWEB-009 may be declared complete only after:

1. this closure documentation is included in the final PR head;
2. exact-head HidraWEB CI is fully green after the documentation change;
3. PR #16 is refreshed and remains mergeable on that exact head;
4. PR #16 is merged using the exact expected head SHA;
5. push-triggered HidraWEB `main` CI succeeds on the exact merge commit.
