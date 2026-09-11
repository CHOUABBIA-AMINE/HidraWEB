# HWEB-009 — Events and Incidents

Status: IN PROGRESS

Backend baseline: `CHOUABBIA-AMINE/HidraAPI@5c4c949fc73c0e15fcc8794beb2c6681931afc7e`

Accepted deterministic OpenAPI artifact:

```text
hidra-api-openapi-5c4c949fc73c0e15fcc8794beb2c6681931afc7e
sha256:a5e563f2c0e56b03af32ed79e8ab26146fa8dec4eca43d9a33fd1049596e08c9
```

## HWEB-009-01 inventory

Authoritative owners remain separate:

- `incident` — operational incident lifecycle and response actions.
- `leakdetection` — leak candidates, cases, escalation.
- `hse` — HSE cases and CAPA.

The `/events` route is a process composition only. It does not create a frontend-owned shared incident model.

Verified query availability at this baseline:

- `GET /api/v1/incident/incidents?page=&size=` — VERIFIED.
- `GET /api/v1/incident/incidents/{id}` — VERIFIED.
- leak candidate/case list/detail queries — OPEN backend gap, HidraAPI issue #63.
- HSE case/CAPA list/detail queries — OPEN backend gap, HidraAPI issue #64.

## HWEB-009-02 incident workspace slice

Implemented on `hweb-009-incident-workspace`:

- artifact-derived incident OpenAPI slice;
- Orval client generation;
- paged incident register;
- incident detail panel;
- topology/actor/organization/workflow references displayed only when returned by HidraAPI;
- TanStack Query owns incident server state;
- runtime permission is resolved from HidraAPI `RoutePermissionDescriptor` for `GET /api/v1/incident/incidents`; no permission string is hard-coded in production code;
- page fails closed when the route descriptor is missing or the effective permission is absent;
- leak/HSE tabs expose explicit backend-gap states only.

No incident create/close/response-action controls are enabled in this slice. Existing command contracts remain backend-owned and will be added only with their exact authorization and concurrency semantics.

## State ownership

Server state: TanStack Query.

Local UI state only:

- selected `/events` tab;
- incident page number;
- selected incident identifier.

## Error/failure behavior

- missing read route descriptor: fail closed;
- missing effective read permission: no incident request;
- backend 403: shown as authoritative access refusal;
- backend/network errors: normalized through shared HidraAPI error handling;
- empty result: explicit empty register state.

## Tests

- component test: register/detail retrieval and leak/HSE gap boundaries;
- Playwright: authenticated navigation, list/detail retrieval, and explicit #63/#64 placeholders;
- CI must generate HWEB-009 OpenAPI client before lint/typecheck/tests/build/E2E.

## Remaining HWEB-009 work

1. Complete HidraAPI #63 and publish leak candidate/case query contracts.
2. Consume verified leak reads in `/events`.
3. Complete HidraAPI #64 and publish HSE case/CAPA query contracts.
4. Consume verified HSE reads in `/events`.
5. Add cross-module alarm/topology/workflow/document composition only from public contracts.
6. Evaluate incident/leak/HSE command UI from exact published permissions, request DTOs, actor ownership, concurrency and lifecycle rules.
7. Reconcile the canonical frontend/backend gap register and mark HWEB-009 complete only after full CI/E2E is green.
