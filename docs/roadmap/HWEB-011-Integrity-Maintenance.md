# HWEB-011 — Integrity and Maintenance

Status: HWEB-011 COMPLETE / HWEB-012 NEXT / GAP-ENG-001 CLOSED

## Accepted baselines

```text
HidraWEB phase base             : 10921c1eaf61febae92171bdc93cc663f35ef613
HidraAPI inventory baseline     : 9e8a1eb24a99c05749364119ef468f7971939123
HidraAPI concurrency merge      : 2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Accepted OpenAPI artifact       : hidra-api-openapi-2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Artifact id                     : 10307945855
Artifact digest                 : sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Backend owners                  : integrity, assets
Concurrency gap issue           : CHOUABBIA-AMINE/HidraAPI#79 — CLOSED
HidraAPI final verification SHA : 0c8643c17b2648e8be85c658854f57ea0faab765
HidraAPI final CI               : 34725277170 — SUCCESS
```

The accepted HWEB-011 contract baseline is now the exact HidraAPI merge-SHA artifact that publishes the maintainable-asset concurrency mutation. The earlier planning artifact remains historical evidence only and is no longer the accepted HWEB-011 functional baseline.

## HWEB-011 scope and ownership

HWEB-011 keeps `/engineering` as one user process while preserving backend ownership boundaries:

- `integrity` owns integrity programs, assessments, cases and integrity evidence;
- `assets` owns maintainable assets, condition records, maintenance work orders and asset lifecycle evidence;
- topology, documents, risk and incident remain authoritative for their own facts;
- cross-module composition uses neutral backend-published identifiers only;
- TanStack Query owns server state; React local state owns only selection, paging, filters and forms;
- authorization is resolved from `GET /api/v1/security/permissions/routes` intersected with `GET /api/v1/identity/me/permissions`;
- HidraAPI remains the final authorization and concurrency authority.

## Authoritative read contracts

The engineering workspaces use backend workbench discovery/read/search rather than a competing frontend resource catalog:

```text
GET  /api/v1/workbench/modules
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

Asset lifecycle history is sourced only from backend `AssetLifecycleEvent` evidence filtered by exact `maintainableAssetId`; HidraWEB does not reconstruct history from status, timestamps, work orders, conditions or local state.

## GAP-ENG-001 — CLOSED

HidraAPI issue #79 is resolved by the following published contract:

```text
PATCH /api/v1/assets/maintainable-assets/{assetId}

Request:
- expectedUpdatedAt: required backend-defined write precondition
- assetName: required mutable field

Response:
- MaintainableAssetResponse, including refreshed updatedAt

Conflict:
- HTTP 409
- ASSETS_MAINTAINABLE_ASSET_CONFLICT
- client must refetch before any user-initiated retry
```

`MaintainableAsset.updatedAt` is promoted to a write precondition only for this published PATCH. HidraWEB must not generalize that token to other resources or mutations.

The backend mutation changes only `assetName`; lifecycle status, topology references, ownership/manufacturer references, installation/commissioning/retirement timestamps and all other fields remain backend-owned and unchanged by this route.

---

## Execution status

### HWEB-011-01 — Integrity/assets contract inventory — COMPLETE

Established integrity/assets owners, runtime workbench reads, runtime route permissions and GAP-ENG-001 without inventing update semantics.

### HWEB-011-02 — Condition/integrity assessment workspaces — COMPLETE

```text
Product PR         : #34
Merge SHA          : 0dc2cee05ee1c1f833c223c26ed0d5c1a75f679e
Post-merge CI run  : 34710922077 — SUCCESS
Frontend route     : /engineering
Read contract      : runtime integrity workbench discovery/list/detail
Mutation contract  : POST /api/v1/integrity/assessments
Authorization      : runtime route descriptors + effective grants
```

### HWEB-011-03 — Maintainable asset and work-order workspaces — COMPLETE

```text
Product PR         : #36
Final product head : e82b5ce22d5be68da423322122b74978299c23b9
Exact-head CI run  : 34711498232 — SUCCESS
Merge SHA          : 8bf45c256ce6a2d44645501571517ed9b5e4013f
Post-merge CI run  : 34711637995 — SUCCESS
Frontend route     : /engineering/assets
Read contract      : runtime assets workbench discovery/list/detail
Mutation contracts : POST /api/v1/assets/maintainable-assets
                     POST /api/v1/assets/asset-conditions
                     POST /api/v1/assets/maintenance-work-orders
Authorization      : runtime route descriptors + effective grants
```

### HWEB-011-04 — Cross-module engineering context — COMPLETE

```text
Product PR         : #38
Final product head : 274cebc55ccd9a05612f9b9ff9260e9c3243eed0
Exact-head CI run  : 34713913319 — SUCCESS
Merge SHA          : 16aa6cced5cba33f64dca5b0fc917970e5f1c237
Post-merge CI run  : 34714053565 — SUCCESS
Frontend routes    : /engineering, /engineering/assets
Composition layer  : src/processes/engineering
Allowed modules    : topology, documents, risk, incident
Boundary rule      : backend-published neutral references only; no foreign collection scans or inferred relationships
```

### HWEB-011-05 — Asset history/timeline — COMPLETE

```text
Product PR         : #40
Final product head : cee0095bfd3bdb142b9e1d7ac04d675cfaafa5de
Exact-head CI run  : 34721254939 — SUCCESS
Merge SHA          : 92c1f768998c54280fac7b00cd874e19271f92d9
Post-merge CI run  : 34721464399 — SUCCESS
Frontend route     : /engineering/assets
Read contract      : POST /api/v1/workbench/{module}/{resource}/search
Exact filter       : maintainableAssetId = selected maintainable asset id
Backend ordering   : eventAt desc
Evidence fields    : eventType, oldStatus, newStatus, eventReasonId, eventComment, actorId, eventAt, correlationId, createdAt
Fail-closed states : missing lifecycle resource, permission/grant, backend error or empty backend history
```

### HWEB-011-06 — Role/permission and concurrent updates — COMPLETE

Permission verification remains the previously merged test-only slice. The concurrency half is now implemented against the exact GAP-ENG-001 backend contract.

```text
Permission PR         : #42
Permission head       : 3d7e6e30347af7eb0b5995bca5338a4c1efd2ede
Permission exact CI   : 34722168113 — SUCCESS
Permission merge      : 1ae7a257843512b36d966a708480e84412d83d67
Permission merge CI   : 34722316390 — SUCCESS

Concurrency PR        : #44
Final concurrency head: 3d5e726d0909510d26a2c742cd418f11c58b14d2
Exact-head CI run     : 34725640515 — SUCCESS
Product merge SHA     : 5f95c363160c131ae725d66c16ffc057d0c83878
Post-merge CI run     : 34725772754 — SUCCESS
Frontend route        : /engineering/assets
Backend mutation      : PATCH /api/v1/assets/maintainable-assets/{assetId}
Precondition          : selected backend updatedAt sent unchanged as expectedUpdatedAt
Mutable field         : assetName only
Conflict behavior     : HTTP 409 triggers authoritative workbench detail refetch
Retry behavior        : no automatic retry; a second user submit is required after reviewing refreshed values
Authorization         : exact PATCH route descriptor + effective grant; backend remains final authority
```

## HWEB-011-06 concurrency verification evidence

```text
Backend product merge           : 2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Backend verification merge      : 0c8643c17b2648e8be85c658854f57ea0faab765
Backend final CI                 : 34725277170 — SUCCESS
OpenAPI artifact                 : 10307945855
OpenAPI artifact name            : hidra-api-openapi-2e6f93c14e330c8cc839a5de75ecc7b893f9872c
OpenAPI digest                   : sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Backend issue                    : CHOUABBIA-AMINE/HidraAPI#79 — CLOSED
Frontend implementation          : src/features/assets/AssetConcurrencyPanel.tsx
Frontend API                     : src/features/assets/api/assetsApi.ts
Browser verification             : tests/e2e/engineering-concurrency.spec.ts
First CI correction              : 34725576777 failed lint only because React forbids synchronous setState in an effect; no contract behavior changed
Final exact frontend head        : 3d5e726d0909510d26a2c742cd418f11c58b14d2
Final exact-head CI              : 34725640515 — SUCCESS
Frontend product merge           : 5f95c363160c131ae725d66c16ffc057d0c83878
Frontend post-merge CI           : 34725772754 — SUCCESS
```

Browser coverage proves:

- the first PATCH carries the backend-selected `updatedAt` exactly as `expectedUpdatedAt`;
- a stale request receives deterministic HTTP 409 evidence;
- HidraWEB refetches the authoritative selected maintainable asset through workbench detail;
- the refreshed backend `assetName` and `updatedAt` replace the stale local draft/token;
- the rejected request is not automatically replayed;
- a second explicit user submit carries the refreshed backend token;
- successful mutation returns and adopts the new backend `updatedAt`;
- permission metadata does not override backend authorization.

## Phase conclusion

HWEB-011 is complete. Integrity and maintenance reads, commands, cross-module context, lifecycle history, role/permission failure modes and one authoritative concurrent-update path are verified without introducing frontend-owned business state or inferred backend semantics.

The next legal frontend phase is **HWEB-012 — Metering and Custody**. HWEB-012 must begin with its own contract inventory and may not reuse the HWEB-011 concurrency token outside the exact published assets PATCH.
