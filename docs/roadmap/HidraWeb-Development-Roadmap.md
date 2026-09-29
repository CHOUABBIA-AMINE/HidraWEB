# HidraWEB Development Roadmap — Reconciled Baseline

```text
Repository       : CHOUABBIA-AMINE/HidraWEB
Frontend baseline: 02a101fda401b7335b51e95ea17d281baeabbe93
Backend truth    : CHOUABBIA-AMINE/HidraAPI
Backend baseline : 260295c6eebc4b01922d2d488810a671305860a6
OpenAPI evidence : 63f3f60974ce57eb8cd5e42910397615195624fb
Decision         : CONTINUE / REFACTOR
Execution model  : exactly one HWEB-R task per commit
```

## 1. Governance

HidraAPI is the source of business truth and final authorization enforcement.

Before every HWEB-R task:

1. recover current HidraAPI `main`;
2. recover current HidraWEB `main`;
3. read `docs/architecture/Hidra-API-Web-Contract-v1.md`;
4. read this roadmap task;
5. inspect the current/pinned OpenAPI contract;
6. implement exactly one task;
7. validate;
8. commit with the exact message defined below;
9. push;
10. inspect CI once;
11. stop.

Do not continue automatically to the next task.

## 2. Historical roadmap status

The original HWEB-001 through HWEB-016 work remains valuable implementation history and test evidence.

It is **not** deleted.

However those task numbers are no longer the forward execution queue because HidraAPI evolved materially after the last HidraWEB main commit.

Existing per-task documents under `docs/roadmap/HWEB-*.md` are historical evidence unless explicitly referenced by an HWEB-R task.

The new execution line is HWEB-R01 through HWEB-R17.

## 3. Architectural rules

- modular frontend monolith; no micro-frontends;
- OpenAPI/Orval is transport authority;
- no handwritten backend DTO replicas after the relevant regenerated contract exists;
- React components do not call Axios directly;
- TanStack Query owns server state;
- Zustand remains small cross-screen UI state only;
- frontend permissions are UX guards; backend enforcement is authoritative;
- Organization operational context uses the backend canonical scope/responsibility model;
- realtime domain subscriptions are forbidden while HidraAPI reports no published event families;
- direct browser dependency on LeakDetectionAPI is forbidden while the backend extension roadmap is parked;
- MapLibre remains behind `HidraMap`;
- ECharts visualizes only verified backend data;
- WCAG 2.2 AA remains a release requirement.

## 4. Reconciled task sequence

| Code | Exact commit message | Scope | Exit criterion | Status |
|---|---|---|---|---|
| HWEB-R01 | `docs(architecture): reconcile HidraWEB with current HidraAPI` | Audit live frontend against current backend, update canonical contract, replace forward roadmap. Documentation only. | Reuse/reset decision recorded; stale contract areas identified; next task defined. | **Completed** |
| HWEB-R02 | `chore(api): refresh HidraAPI OpenAPI baseline` | Replace accepted full OpenAPI artifact evidence and all feature slices with the current verified code-equivalent backend artifact; rationalize Orval configs only as needed. | Compatibility gate, all generators, typecheck and build use one current backend baseline. | **Completed** |
| HWEB-R03 | `refactor(authentication): align session with HidraAPI principal contract` | Regenerate identity contract; use current login/OIDC endpoints and canonical `GET /api/v1/identity/me` plus effective permissions for authenticated session state. | No invented auth endpoints; principal/session tests pass. | **Completed** |
| HWEB-R04 | `refactor(authorization): align shell with effective permissions` | Align permission model/navigation guards with backend-enforced route catalog and current effective permissions. | No catalog-only assumption; 401/403 and permission-aware navigation tests pass. | **Completed** |
| HWEB-R05 | `refactor(organization): align operational context with canonical scopes` | Replace stale Organization assumptions with dedicated reads plus `OperationalScope` / `ResponsibilityAssignment` contracts. | No retired scope tuple model; organization/operational context is backend-driven. | **Completed** |
| HWEB-R06 | `refactor(workbench): align generic resource browsing` | Regenerate workbench contract and retain it as secondary/reference/admin UX only. | List/detail/search work against refreshed OpenAPI; no specialized workflow is replaced by workbench. | **Completed** |
| HWEB-R07 | `refactor(topology): align network workspace with current map contract` | Revalidate current layer catalog/typed geometry/search, retain HidraMap/MapLibre, remove stale missing-layer assumptions. | Network workspace consumes only current topology API. | **Completed** |
| HWEB-R08 | `refactor(operations): align telemetry and monitoring workspaces` | Regenerate telemetry/monitoring types and revalidate readings, quality/state, trend, rules and deviations. | REST/query behavior green; no invented realtime topics. | **Completed** |
| HWEB-R09 | `refactor(workflow): align tasks with backend actions` | Revalidate task inbox/detail/available-actions/instance/timeline/transition execution. | All actions are backend-defined and concurrency/error states tested. | **Completed** |
| HWEB-R10 | `refactor(alarm): align console with backend lifecycle` | Revalidate list/detail/ack/close/shelving behavior and accessible severity/state presentation. | Alarm console uses current backend lifecycle only; no fake realtime. | **Completed** |
| HWEB-R11 | `refactor(events): align incident leak and hse workspaces` | Revalidate current HidraAPI incident/leak/HSE read contracts. | No direct LeakDetectionAPI dependency; events workspace remains HidraAPI-driven. | **Completed** |
| HWEB-R12 | `refactor(planning): align planning and approval contracts` | Revalidate periods/plans/revisions/targets and backend approval actions. | No frontend-defined approval state machine. | **Completed** |
| HWEB-R13 | `refactor(engineering): align integrity and assets contracts` | Regenerate assets/integrity schemas, remove handwritten backend DTO replicas and revalidate engineering composition. | No duplicated transport DTOs; workbench remains secondary. | **Completed** |
| HWEB-R14 | `refactor(custody): align metering and custody contracts` | Revalidate custody command contracts and supporting workbench/reference data. | Current OpenAPI types and permissions used. | **Completed** |
| HWEB-R15 | `refactor(intelligence): align risk analytics simulation reporting` | Revalidate each intelligence workspace against current backend capability/workbench contracts. | No synthetic KPI/simulation semantics. | **Completed** |
| HWEB-R16 | `refactor(administration): align governance workspaces` | Revalidate audit/configuration/documents/integration/notification administration. | Destructive actions permission-gated; provider capabilities not invented. | Planned |
| HWEB-R17 | `test(release): harden reconciled HidraWEB` | Full accessibility, performance, E2E, OpenAPI compatibility, deployment and release-artifact review. | `npm run verify`, required E2E/performance gates and production-readiness checklist green. | Planned |

## 5. HWEB-R01 completion evidence

HWEB-R01 established:

- current HidraAPI head `260295c6eebc4b01922d2d488810a671305860a6`;
- current HidraWEB head `02a101fda401b7335b51e95ea17d281baeabbe93`;
- code-equivalent verified HidraAPI OpenAPI artifact from `63f3f60974ce57eb8cd5e42910397615195624fb`;
- current HidraWEB OpenAPI baseline `725a451...` is stale;
- current frontend architecture is worth retaining;
- no repository-wide reset is required;
- direct LeakDetectionAPI/gRPC/CPM integration is not a current frontend capability;
- backend route permissions are now enforced;
- current principal/effective permissions exist;
- canonical Organization operational scopes/responsibilities require frontend reconciliation;
- current realtime transport has no domain event publishers.

Files authorized for HWEB-R01:

```text
docs/architecture/HidraWEB-Reconciliation-Audit.md
docs/architecture/Hidra-API-Web-Contract-v1.md
docs/roadmap/HidraWeb-Development-Roadmap.md
```

No production TypeScript, package manifest, OpenAPI artifact or generated client change is authorized in HWEB-R01.

## 6. HWEB-R02 completion evidence

HWEB-R02 repins the complete consumer-contract baseline to one verified HidraAPI artifact:

- HidraAPI source SHA: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- HidraWEB source SHA at task start: `5f3ab3fdbbe7c0cfe45a0c20b2a772a8c169971d`;
- HidraAPI CI run: `36573899231` — success;
- OpenAPI artifact id: `11036334163`;
- OpenAPI artifact digest: `sha256:1b67c8f316749f46f9d5c2b37a5bad25d9ddd72fd8145caa2251b674a123c824`;
- full OpenAPI SHA-256: `sha256:e80013f529b667c4b3f2b1e83e2087a52b4a4c87e16560d434eb34a740ca6665`;
- deterministic gzip SHA-256: `sha256:1cc7b138b54bf59ebdf025a37cd84ce234218ec298415dd502d6796720170e6f`;
- expected Orval consumer contracts: `18`;
- every feature Orval config now points to a `63f3f60974ce57eb8cd5e42910397615195624fb`-named checked-in contract;
- the identity/organization consumer slice is refreshed from the current full artifact; unchanged consumed surfaces are repinned and must pass the compatibility gate against the same full artifact;
- R02 does not add newly available product behavior; R03+ expands consumed operations deliberately.

No production feature logic, authentication behavior, frontend route behavior, or backend code is changed by HWEB-R02.

## 7. Validation policy

Documentation-only tasks:

- verify live backend/frontend SHAs;
- verify only authorized documentation paths changed;
- validate Markdown structure/reference paths where practical;
- rely on repository CI for full frontend lifecycle when CI triggers.

Contract/API tasks:

```bash
npm ci
npm run openapi:compatibility
npm run typecheck
npm run lint
npm run test
npm run build
```

Use `npm run verify` when the task scope requires the complete lifecycle.

Critical browser-flow tasks also run:

```bash
npm run test:e2e
```

Performance-sensitive tasks also run:

```bash
npm run test:performance
```

Do not claim a gate passed unless it actually ran successfully.

## 8. Required completion record

Each HWEB-R task must record:

```text
HidraAPI source SHA
HidraWEB source SHA
OpenAPI artifact/snapshot used
backend endpoints consumed
backend DTOs consumed
backend permissions consumed
frontend routes changed
state ownership
realtime contracts used
tests added/updated
known backend gaps
CI status
```

## 9. HWEB-R03 completion evidence

HWEB-R03 aligns frontend session establishment with the canonical authenticated-principal contract:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `160c01b0658a06679329ab719f29a24d5988daba`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- authentication exchange remains `POST /api/v1/identity/authentication/login` and `POST /api/v1/identity/authentication/oidc/complete`;
- canonical session identity now refreshes through `GET /api/v1/identity/me`;
- effective permissions now refresh through `GET /api/v1/identity/me/permissions`;
- login-response roles/permissions are no longer the authoritative post-authentication session identity;
- current-principal fields include authentication name/type, user identity, employee reference, authentication authorities and effective permissions;
- frontend principal-gap messaging is removed in French, English and Arabic;
- no authorization-navigation policy changes are included; those remain HWEB-R04.

No backend code, frontend routes, Organization operational-scope flow, or realtime behavior is changed by HWEB-R03.

## 10. HWEB-R04 completion evidence

HWEB-R04 aligns shell navigation with backend-enforced permission evidence:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `0fe4ffe2d3704b31334c2ed3d5c47618f0d5258f`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- route permission metadata remains sourced from `GET /api/v1/security/permissions/routes`;
- effective grants remain sourced from `GET /api/v1/identity/me/permissions`;
- shell module visibility is now derived from the intersection of published route descriptors and effective grants, rather than from permission-string prefixes alone;
- the backend wildcard grant `*` remains supported across all published route modules;
- HTTP 401 continues to terminate the frontend session through the unauthorized event;
- HTTP 403 preserves the authenticated session and remains an authorization denial;
- navigation tests cover allowed, denied, and wildcard behavior;
- stale catalog-only authorization messaging is removed from French, English, and Arabic shell copy.

No backend code, feature workflow behavior, Organization operational-context model, or realtime behavior is changed by HWEB-R04.

## 11. HWEB-R05 completion evidence

HWEB-R05 aligns the cross-screen operational context with the canonical Organization responsibility model:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `32287c244e1c3419843b66cda3ecfe91e2279959`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- the identity/organization slice now includes canonical operational-scope registration/read and responsibility list/assign/revoke contracts;
- the frontend reads responsibility context through `GET /api/v1/organization/responsibilities?assigneeType=EMPLOYEE&assigneeId=...`;
- current employee identity comes from the authenticated principal's `employeeReferenceId`;
- active operational contexts come only from backend-enriched `ResponsibilityResponse.scope` objects;
- selected operational context stores canonical `scopeId` plus owner-resolved display attributes; it never reconstructs the retired `operationalScopeType/id/code/name` tuple from employee assignments;
- duplicate responsibilities over the same scope are de-duplicated by canonical scope registry ID;
- ended/suspended/cancelled responsibilities and assignments without canonical scope data do not become selectable operational context;
- the shell navbar replaces its placeholder chip with a backend-driven operational-context selector when current responsibilities exist;
- no physical/network ownership is inferred from OrganizationUnit hierarchy alone.

No backend code, workbench-resource refactor, topology behavior, or workflow semantics are changed by HWEB-R05.

## 12. HWEB-R06 completion evidence

HWEB-R06 revalidates the generic operational workbench against the current backend contract while preserving its secondary role:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `7e7c5c08606d9dcf9a6884ea15453c324ce0d5fc`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- workbench OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- canonical frontend workbench paths remain `/api/v1/workbench/**`; alternate backend aliases are not introduced into frontend navigation or adapters;
- list/detail/search adapters continue to consume generated OpenAPI DTOs and now preserve records when optional response `module`/`resource` fields are absent by using the request context;
- malformed detail responses are no longer silently converted into fabricated empty records;
- contract tests cover canonical resources/list/detail/search endpoints, path-segment encoding, query normalization, and advanced-search payload transport;
- generic route permissions remain the backend-published `modules:resources:read`, `dynamic-module:resources:read`, `dynamic-module:dynamic-resource:read`, and `dynamic-module:dynamic-resource:search`;
- the workbench remains secondary/reference/admin UX and is not promoted to replace topology, telemetry, workflow, alarm, Organization, or other dedicated typed workspaces.

No backend code, primary navigation architecture, specialized domain workflow, topology behavior, or realtime behavior is changed by HWEB-R06.

## 13. HWEB-R07 completion evidence

HWEB-R07 revalidates the network workspace against the current typed HidraAPI topology map contract:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `6ad16f9085182e9d5b60b2f937a974a9c98dd65f`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- topology OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- verified backend layer catalog includes `pipeline-systems`, `pipelines`, `facilities`, `topology-nodes`, `pipeline-segments`, and `topology-connections`;
- `pipeline-systems` and `pipelines` are first-class current backend layers, so historical missing-layer assumptions are obsolete;
- geometry remains backend-owned and typed as Point, LineString, or MultiLineString; HidraWEB does not fabricate coordinates or convert topology semantics into client-owned geometry;
- HidraMap remains the stable frontend abstraction and MapLibre remains an implementation detail behind that abstraction;
- canonical frontend topology paths remain `/api/v1/topology/map/layers`, layer detail/features, `/geojson`, and `/search`;
- contract tests cover canonical layer catalog/detail/features/GeoJSON/search URLs, encoded layer identifiers, pagination defaults, layer identifier transport, and search trimming;
- no PostGIS-specific browser contract, LINESTRINGM assumption, or deferred industrial-extension dependency is introduced.

No backend code, telemetry/monitoring behavior, realtime behavior, or non-topology product workflow is changed by HWEB-R07.

## 14. HWEB-R08 completion evidence

HWEB-R08 revalidates the operations workspace against the current HidraAPI telemetry and monitoring query contracts:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `fba372b6c08e5212cbb36c379791c9178966821a`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- telemetry/monitoring OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- telemetry reads remain `GET /api/v1/telemetry/points/{pointId}/readings`, `/readings/latest`, and `/trend`;
- telemetry reference metadata remains `GET /api/v1/telemetry/reference/reading-states` and `/quality-codes`;
- monitoring reads remain `GET /api/v1/monitoring/rules`, `/rules/{id}`, `/deviations`, and `/deviations/{id}`;
- adapter tests cover path-segment encoding, optional-filter compaction, history/trend date windows and pagination/limit transport;
- the workspace remains query-first because no telemetry-point discovery endpoint is published in the accepted contract;
- TanStack Query continues to own telemetry/monitoring server state; point/time/filter selection remains local presentation state;
- the current realtime capability remains `transport-configured-no-domain-publishers` with `eventFamilies = []`; no telemetry or monitoring topic/event name is invented;
- current polling/query refresh behavior therefore remains the supported frontend behavior.

No backend code, workflow behavior, alarm lifecycle, realtime subscription contract, or deferred industrial-extension capability is changed by HWEB-R08.

## 15. HWEB-R09 completion evidence

HWEB-R09 revalidates the workflow task experience against the current backend-defined task/action contract:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `ec6f0bfbd7d0a674a043ea01ebec04dff73d8e4a`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- workflow OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- authenticated inbox/detail reads remain `GET /api/v1/workflow/tasks` and `/tasks/{id}`;
- backend-authoritative actions remain `GET /api/v1/workflow/tasks/{id}/available-actions`;
- instance/timeline reads remain `GET /api/v1/workflow/instances/{id}` and `/timeline`;
- transition execution remains `POST /api/v1/workflow/tasks/{taskId}/transitions/{transitionId}/execute`;
- only backend-returned actions with `permitted = true` and a concrete `transitionId` are presented as executable actions;
- transition execution carries the exact task `updatedAt` as `expectedTaskUpdatedAt`, preserving backend optimistic-concurrency enforcement;
- HTTP 409 stale-task conflicts are explicitly mapped to a refresh-task-and-actions instruction, distinct from authorization denial;
- adapter tests cover inbox, task, available-actions, instance, timeline and encoded transition execution paths plus authoritative request payload transport;
- the frontend does not define its own workflow transition graph, approval state machine, or alternative action semantics.

No backend code, alarm lifecycle, planning approval behavior, realtime contract, or non-workflow product state machine is changed by HWEB-R09.

## 16. HWEB-R10 completion evidence

HWEB-R10 revalidates the alarm console against the current HidraAPI alarm lifecycle contract:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `2e157d28e9ce4b16ed326f37bd097a3b1a362d57`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- alarm OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- alarm reads remain `GET /api/v1/alarm/alarms`, `/alarms/{id}`, and `/alarms/{id}/shelvings`;
- acknowledgement remains `POST /api/v1/alarm/alarms/acknowledgements`;
- closure remains `POST /api/v1/alarm/alarms/closures`;
- shelving remains `POST /api/v1/alarm/alarms/{id}/shelvings`;
- unshelving remains `POST /api/v1/alarm/alarms/{id}/shelvings/{shelvingId}/unshelve`;
- acknowledgement and closure do not send client-selected actor identity; HidraAPI derives authenticated actor/principal identity server-side;
- shelving correlation remains an HTTP `X-Correlation-Id` header and is not duplicated into the shelving body contract;
- unshelve UI is now exposed only when the backend shelving record is `ACTIVE` and has not already been unshelved, matching the backend lifecycle guard;
- alarm state and severity remain textually visible in addition to color treatment, preserving accessible non-color-only meaning;
- suppression remains distinct from shelving and no suppression mutation is invented because none is published in the accepted contract;
- current realtime capability still publishes no alarm event family, so the alarm console remains query-driven and does not invent domain realtime topics.

No backend code, incident lifecycle, workflow semantics, suppression capability, realtime contract, or non-alarm product behavior is changed by HWEB-R10.

## 17. HWEB-R11 completion evidence

HWEB-R11 revalidates the event workspace against the current HidraAPI incident, leak-detection, and HSE read contracts:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `6719d682923378d9b31235937f0bd123217c42d4`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- incident, leak, and HSE OpenAPI provenance now reference the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- incident reads remain `GET /api/v1/incident/incidents` and `/incidents/{id}`;
- leak reads remain `GET /api/v1/leakdetection/candidates`, `/candidates/{id}`, `/cases`, and `/cases/{id}`;
- HSE reads remain `GET /api/v1/hse/cases`, `/cases/{id}`, `/capas`, and `/capas/{id}`;
- event read permissions remain backend-published route permissions and continue to fail closed when a descriptor or effective grant is absent;
- adapter tests cover backend pagination and encoded list/detail identifiers across incident, leak-candidate, leak-case, HSE-case, and CAPA reads;
- production leak reads remain on HidraAPI `/api/v1/leakdetection/**`; no direct browser connection to the separate LeakDetectionAPI repository, no gRPC-Web stream, and no CPM/RTTM transport is introduced;
- the workspace remains read-oriented for these surfaces; lifecycle mutations not explicitly included in the accepted R11 contract are not invented;
- server state remains in TanStack Query and existing event-tab/page/selection state remains local UI state;
- current realtime capabilities still publish no event families, so no incident/leak/HSE realtime topic is invented.

No backend code, planning behavior, leak-compute sidecar integration, realtime contract, or event lifecycle state machine is changed by HWEB-R11.

## 18. HWEB-R12 completion evidence

HWEB-R12 revalidates the Planning workspace against the current HidraAPI planning-query and revision-approval contracts:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `3187022af800f161a56d923485d3f95bf77dd51f`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- planning OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- planning period reads remain `GET /api/v1/planning/periods` and `/periods/{id}`;
- operational-plan reads remain `GET /api/v1/planning/operational-plans` and `/operational-plans/{id}`;
- revision reads remain `GET /api/v1/planning/revisions?planId=...` and `/revisions/{id}`;
- plan-target reads remain `GET /api/v1/planning/targets?revisionId=...` and `/targets/{id}`;
- revision-scoped approval remains `GET /api/v1/planning/revisions/{revisionId}/approval`;
- approval execution remains `POST /api/v1/planning/revisions/{revisionId}/approval/actions/{transitionId}/execute`;
- the frontend displays and executes only backend-returned approval actions; it does not define an independent approval transition graph;
- execution carries the exact backend `currentTaskUpdatedAt` value as `expectedTaskUpdatedAt`, preserving workflow optimistic-concurrency semantics;
- action `permitted`, `transitionId`, required reason/comment flags, and required permission code remain backend-owned;
- planned-vs-actual continues to join Planning target identity with Monitoring-owned expected/actual/difference values rather than recomputing business semantics in the browser;
- adapter tests cover canonical period/plan/revision/target list-detail paths, paging/scoping parameters, encoded identifiers, approval projection reads, and authoritative approval execution payload transport.

No backend code, workflow transition graph, planning lifecycle state machine, monitoring calculation, engineering behavior, or realtime contract is changed by HWEB-R12.

## 19. HWEB-R13 completion evidence

HWEB-R13 aligns Engineering command contracts with the current HidraAPI assets/integrity APIs while preserving the generic workbench as secondary read/reference UX:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `f6ddc07c6d249279ab2e67bd2aa3f79a2dda1373`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- new checked-in assets and integrity OpenAPI consumer slices are pinned to the verified HidraAPI artifact/run;
- feature Orval contracts increase from 18 to 20 and CI now regenerates dedicated assets and integrity clients before lint/typecheck/tests;
- handwritten request/response DTO replicas are removed from `assetsApi.ts` and `integrityApi.ts`; those adapters now consume generated model contracts;
- assets commands remain the canonical `POST /api/v1/assets/maintainable-assets`, `POST /api/v1/assets/asset-conditions`, `POST /api/v1/assets/maintenance-work-orders`, and concurrency-protected `PATCH /api/v1/assets/maintainable-assets/{assetId}`;
- integrity assessment creation remains `POST /api/v1/integrity/assessments`, with program/case schemas included in the dedicated integrity contract for future typed use without reintroducing handwritten DTOs;
- maintainable-asset rename continues to transport backend `expectedUpdatedAt` concurrency state exactly;
- Engineering list/detail/resource browsing remains on the generic workbench and therefore stays secondary to typed domain commands rather than replacing them;
- cross-module engineering context continues to display only backend-published references and does not infer topology/document/risk/incident relationships;
- adapter tests cover canonical typed assets/integrity command paths and encoded maintainable-asset identifiers.

No backend code, engineering business lifecycle, workbench semantics, custody behavior, deferred B31G capability, or realtime contract is changed by HWEB-R13.

## 20. HWEB-R14 completion evidence

HWEB-R14 revalidates the Metering & Custody workspace against the current HidraAPI custody command contract while preserving workbench-backed reference/read composition:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `79cde82350f7e9df28ecddc828e71d0fbaa0c3bc`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- custody OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- measurement-period creation remains `POST /api/v1/custody/measurement-periods`;
- transfer-ticket creation remains `POST /api/v1/custody/transfer-tickets`;
- discrepancy opening remains `POST /api/v1/custody/discrepancies`;
- all three commands continue to consume generated OpenAPI request/response types; no handwritten custody transport DTO replica is introduced;
- command availability continues to be derived from backend route-permission metadata plus effective permissions and fails closed when metadata/grants are absent;
- custody period/ticket/discrepancy list/detail presentation remains backed by generic workbench records because HidraAPI does not publish dedicated read controllers for these surfaces in the accepted contract;
- agreements, transfer points, batches, quantity calculations, reconciliation rows, metering snapshots and party references remain runtime-discovered custody/workbench data rather than hardcoded frontend catalogs;
- topology, telemetry and party master data remain owner-module truth; custody displays explicit neutral references/snapshots only and does not scan or mutate foreign collections;
- no client-side custody lifecycle state machine, metering calculation, reconciliation formula, approval logic or synthetic fiscal value is introduced;
- adapter tests cover the canonical typed measurement-period, transfer-ticket and discrepancy command payloads and paths.

No backend code, custody domain lifecycle, metering calculation, workbench semantics, intelligence behavior, or realtime contract is changed by HWEB-R14.

## 21. HWEB-R15 completion evidence

HWEB-R15 revalidates the Intelligence workspaces against the current HidraAPI risk, analytics, simulation, reporting, and generic workbench contracts:

- HidraAPI source SHA: `260295c6eebc4b01922d2d488810a671305860a6`;
- HidraWEB source SHA at task start: `15af227827f7c445bc77477d1f7d062830de3417`;
- OpenAPI evidence: `63f3f60974ce57eb8cd5e42910397615195624fb`;
- risk, analytics, simulation, and reporting OpenAPI provenance now references the verified HidraAPI artifact/run used by the reconciled frontend baseline;
- each module publishes a current `GET /api/v1/<module>/capabilities` endpoint plus typed mutation contracts, but the reconciled R15 workspaces remain read-only because no authorized product requirement exists to trigger those mutations here;
- Risk reads remain runtime-discovered workbench records for backend-owned risk registers and assessments;
- Analytics reads remain runtime-discovered workbench records for backend-owned datasets, insights, metric definitions, and evaluation runs;
- Simulation reads remain runtime-discovered workbench records for backend-owned models, scenarios, runs, and recommendations;
- Reporting reads remain runtime-discovered workbench records for backend-owned definitions, requests, runs, and output artifacts;
- generic workbench reads remain `GET /api/v1/workbench/{module}/resources`, `GET /api/v1/workbench/{module}/{resource}`, and `GET /api/v1/workbench/{module}/{resource}/{id}`;
- module-specific tests verify risk/analytics/simulation/reporting record discovery and detail transport through those canonical workbench paths, including encoded record identifiers;
- frontend views display backend-published status, score, confidence, run, artifact, and recommendation fields only; HidraWEB does not calculate synthetic KPIs, simulate pipeline behavior, infer recommendations, or create independent intelligence semantics;
- no deferred CPM/RTTM, digital-twin solver, direct compute sidecar, or realtime-event dependency is introduced;
- backend route permissions remain authoritative and workbench visibility continues to fail closed through the reconciled permission model.

No backend code, intelligence mutation workflow, risk scoring formula, analytics calculation, simulation engine, report generation engine, or realtime contract is changed by HWEB-R15.

## 22. Next authorized task

```text
HWEB-R16 — refactor(administration): align governance workspaces
```

Do not execute HWEB-R17 or later work in the same task.
