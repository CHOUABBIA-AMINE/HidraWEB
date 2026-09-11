# HWEB-009 — Events and Incidents

```text
Phase                 : HWEB-009
Slice status          : INCIDENT READ WORKSPACE VERIFIED
Frontend route        : /events
Frontend branch       : hweb-009-events-incident-register
Backend source commit : 5c4c949fc73c0e15fcc8794beb2c6681931afc7e
Contract artifact     : hidra-api-openapi-5c4c949fc73c0e15fcc8794beb2c6681931afc7e
Artifact digest       : sha256:a5e563f2c0e56b03af32ed79e8ab26146fa8dec4eca43d9a33fd1049596e08c9
Frontend CI           : 34649955823 at 60fa710d80a92ae4fc046b8e32002b84cc4bd7e7
```

## Delivered incident scope

The first HWEB-009 slice implements the incident-owned read workspace only. HidraAPI remains the source of truth and the frontend does not synthesize incident lifecycle rules.

Consumed routes:

```text
GET /api/v1/incident/incidents
GET /api/v1/incident/incidents/{id}
```

Canonical read permission:

```text
incident:incidents:read
```

The `/events` page now provides a bounded incident register, paging metadata and an incident detail workspace using the artifact-derived `PageIncidentView` and `IncidentView` schemas. Backend-returned status, severity and priority identifiers are displayed opaquely; no frontend semantic mapping or state machine is introduced.

TanStack Query owns incident list/detail server state. React local state owns the selected tab, page and selected incident identifier.

The query-only HWEB-009 contract slice is pinned at:

```text
openapi/hidra-events-5c4c949fc73c0e15fcc8794beb2c6681931afc7e.json
orval.events.config.ts
npm run api:generate:events
```

HidraWEB CI now regenerates seven artifact-derived OpenAPI slices before lint, typecheck, tests and build.

## Backend gap posture

```text
GAP-INC-001  : VERIFIED — typed paged incident register/detail reads are published, consumed and tested.
GAP-LEAK-001 : OPEN     — HidraAPI issue #63; no typed leak candidate/case list/detail query contract yet.
GAP-HSE-001  : OPEN     — HidraAPI issue #64; no typed HSE case/CAPA list/detail query contract yet.
```

The leak and HSE tabs intentionally display the backend constraint and execute no `/leakdetection/**` or `/hse/**` query calls. Existing command endpoints are not used as substitutes for retrievable workspaces.

## Verification

Exact-head HidraWEB CI run `34649955823` at `60fa710d80a92ae4fc046b8e32002b84cc4bd7e7` passed:

- HWEB-003 workbench generation;
- HWEB-004 identity/organization generation;
- HWEB-005 topology generation;
- HWEB-006 telemetry/monitoring generation;
- HWEB-007 workflow generation;
- HWEB-008 alarm generation;
- HWEB-009 events generation;
- lint;
- typecheck;
- unit/component tests;
- production build;
- Playwright browser tests.

Component and browser coverage assert the exact incident list/detail GET routes and page/size request, and prove that selecting leak/HSE tabs does not fabricate backend requests.

## Remaining HWEB-009 sequence

HWEB-009 is not complete. Continue in backend-first order:

1. HidraAPI #63 — publish typed leak candidate/case list/detail queries, test them and publish deterministic OpenAPI.
2. Consume the verified leak query contract in this `/events` process without importing leak domain implementation.
3. HidraAPI #64 — publish typed HSE case/CAPA list/detail queries, test them and publish deterministic OpenAPI.
4. Consume the verified HSE query contract.
5. Add cross-module alarm/topology/workflow/document context only where public contracts actually exist.
6. Add create/update actions only from explicit backend contracts and permissions.
7. Reconcile the canonical backend gap register and mark HWEB-009 complete only after all accepted slices pass post-merge CI.
