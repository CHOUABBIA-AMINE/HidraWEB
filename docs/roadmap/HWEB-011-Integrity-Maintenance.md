# HWEB-011 — Integrity and Maintenance

Status: HWEB-011 COMPLETE / HWEB-012 NEXT / GAP-ENG-001 CLOSED

## Accepted baselines

```text
HidraWEB phase base             : 10921c1eaf61febae92171bdc93cc663f35ef613
HidraAPI inventory baseline     : 9e8a1eb24a99c05749364119ef468f7971939123
HidraAPI concurrency merge      : 2e6f93c14e330c8cc839a5de75ecc7b893f9872c
HidraAPI verified main          : 0c8643c17b2648e8be85c658854f57ea0faab765
Accepted concurrency artifact   : hidra-api-openapi-2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Artifact id                     : 10307945855
Artifact digest                 : sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Backend owners                  : integrity, assets
Concurrency gap issue           : CHOUABBIA-AMINE/HidraAPI#79 — CLOSED
```

HWEB-011 began from HidraAPI inventory baseline `9e8a1eb...`. GAP-ENG-001 was later resolved by the assets-owned concurrency contract merged at `2e6f93c...`, with deterministic OpenAPI artifact `10307945855`. Backend documentation verification subsequently merged at `0c8643c...` and final backend main CI remained green. The frontend concurrency implementation is pinned to the product merge artifact rather than inferring semantics from later documentation-only commits.

## HWEB-011 scope

HWEB-011 keeps `/engineering` as one user process while preserving backend ownership boundaries:

- `integrity` owns integrity programs, assessments, cases, inspection/defect/corrosion/cathodic-protection evidence and integrity recommendations;
- `assets` owns maintainable assets, condition records, maintenance work orders and asset lifecycle evidence;
- topology remains owner of topology/geospatial truth;
- documents remains owner of document/version truth;
- risk remains owner of risk truth;
- incident remains owner of incident truth;
- HidraWEB process composition must use neutral identifiers and public contracts only.

TanStack Query owns server state. React local state may own selection, paging, filters and forms. HWEB-011 does not introduce a frontend integrity/maintenance state machine.

---

## HWEB-011-01 — Integrity/assets contract inventory

### Dedicated integrity commands

At the inventory baseline, `SpringIntegrityController` published:

```text
GET  /api/v1/integrity/capabilities
POST /api/v1/integrity/assessments
POST /api/v1/integrity/programs
POST /api/v1/integrity/cases
```

Legacy command aliases also existed, but HWEB-011 prefers the resource-oriented routes above.

Published response shapes included:

```text
IntegrityAssessmentResponse
- id
- programId
- assessmentNumber
- title
- assessmentTypeId
- status
- assessmentDate

IntegrityProgramResponse
- id
- code
- nameFr
- programTypeId
- status
- plannedStartAt
- plannedEndAt

IntegrityCaseResponse
- id
- caseNumber
- title
- caseTypeId
- status
- topologyAssetTypeCode
- topologyAssetId
- primaryDefectId
- openedAt
- closedAt
```

The dedicated integrity controller exposed create operations only at inventory time; dedicated integrity list/detail/update/lifecycle routes were not published.

### Dedicated assets commands

At the inventory baseline, `SpringAssetsController` published:

```text
GET  /api/v1/assets/capabilities
POST /api/v1/assets/maintenance-work-orders
POST /api/v1/assets/asset-conditions
POST /api/v1/assets/maintainable-assets
```

GAP-ENG-001 later added the intentionally narrow update contract:

```text
PATCH /api/v1/assets/maintainable-assets/{assetId}
Request : expectedUpdatedAt + assetName
Response: MaintainableAssetResponse including refreshed updatedAt
Conflict: HTTP 409 / ASSETS_MAINTAINABLE_ASSET_CONFLICT
Retry   : refetch authoritative asset before a new user-initiated retry
```

The PATCH mutates `assetName` only. It does not mutate lifecycle status, topology references, ownership/manufacturer references, installation/commissioning/retirement timestamps, or other asset semantics.

### Authoritative generic read contract

HidraAPI's platform workbench indexes JPA entities by backend module and publishes deterministic discovery/read/search endpoints:

```text
GET  /api/v1/workbench/modules
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

The workbench derives resources from the backend metamodel. HWEB-011 discovers `integrity` and `assets` resources from `GET /api/v1/workbench/{module}/resources` instead of maintaining a competing frontend resource catalog.

The workbench supports zero-based paging, text search across backend-discovered string fields, exact filters over existing entity fields, optional sorting over existing entity fields, and generic list/detail record responses.

`AssetLifecycleEvent` is explicitly keyed by `maintainableAssetId` and publishes backend event type, old/new status, reason/comment, actor, event time, correlation id and creation time. HWEB-011-05 uses this backend evidence only and does not reconstruct history from current state.

### Authorization rule

HWEB-011 resolves route permissions from `GET /api/v1/security/permissions/routes` and intersects them with effective grants from `GET /api/v1/identity/me/permissions`. Backend authorization remains final. No permission code is guessed from module/resource names in feature code.

### GAP-ENG-001 — CLOSED

```text
Status        : CLOSED
Backend issue : CHOUABBIA-AMINE/HidraAPI#79
Owner         : assets
Mutation      : PATCH /api/v1/assets/maintainable-assets/{assetId}
Mutable field : assetName only
Precondition  : expectedUpdatedAt, sourced from authoritative MaintainableAsset updatedAt
Conflict      : HTTP 409 / ASSETS_MAINTAINABLE_ASSET_CONFLICT
Retry rule    : refetch/review before a new user-initiated retry; no automatic retry
Artifact      : 10307945855 / sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
```

---

## Execution status

### HWEB-011-02 — Condition/integrity assessment workspaces — COMPLETE

Uses workbench discovery/list/detail for integrity read state and the dedicated integrity assessment create contract. Backend status/type identifiers are presented without a frontend lifecycle state machine.

```text
Product PR         : #34
Merge SHA          : 0dc2cee05ee1c1f833c223c26ed0d5c1a75f679e
Post-merge CI run  : 34710922077 — SUCCESS
Frontend route     : /engineering
Read contract      : runtime workbench discovery/list/detail for module integrity
Mutation contract  : POST /api/v1/integrity/assessments
Authorization      : runtime route descriptors + effective grants
```

### HWEB-011-03 — Maintainable asset and work-order workspaces — COMPLETE

Uses workbench discovery/list/detail for assets read state and the published assets create contracts for maintainable assets, asset conditions and maintenance work orders. Topology, organization, party, recommendation and workflow references remain neutral IDs/snapshots.

```text
Product PR         : #36
Final product head : e82b5ce22d5be68da423322122b74978299c23b9
Exact-head CI run  : 34711498232 — SUCCESS
Merge SHA          : 8bf45c256ce6a2d44645501571517ed9b5e4013f
Post-merge CI run  : 34711637995 — SUCCESS
Frontend route     : /engineering/assets
Read contract      : runtime workbench discovery/list/detail for module assets
Mutation contracts : POST /api/v1/assets/maintainable-assets
                     POST /api/v1/assets/asset-conditions
                     POST /api/v1/assets/maintenance-work-orders
Authorization      : runtime route descriptors + effective grants
Historical gap     : GAP-ENG-001 was still open at this milestone
Conclusion         : SUCCESS
```

### HWEB-011-04 — Cross-module engineering context — COMPLETE

Composes topology, document, risk and incident context at the `src/processes` boundary only from already-published neutral references in the selected backend workbench record. The process does not scan foreign module collections, infer relationships, or import another business feature's persistence/domain ownership. Records with no supported published relationship fail closed with an explicit no-context state.

```text
Product PR         : #38
Final product head : 274cebc55ccd9a05612f9b9ff9260e9c3243eed0
Exact-head CI run  : 34713913319 — SUCCESS
Merge SHA          : 16aa6cced5cba33f64dca5b0fc917970e5f1c237
Post-merge CI run  : 34714053565 — SUCCESS
Frontend routes    : /engineering
                     /engineering/assets
Composition layer  : src/processes/engineering
Direct references  : topologyAssetId
                     documentReferenceId
                     riskAssessmentId
                     sourceIncidentId
Qualified refs     : sourceModule + sourceReferenceId
                     targetModule + targetReferenceId
Allowed modules    : topology, documents, risk, incident
Authorization      : existing runtime workbench route descriptors + effective grants
State ownership    : TanStack Query server state; React local state only selection/forms
Conclusion         : SUCCESS
```

### HWEB-011-05 — Asset history/timeline — COMPLETE

Uses only backend `AssetLifecycleEvent` evidence discovered through the assets workbench and filtered by the exact selected `maintainableAssetId`. The frontend does not derive history from current asset status, timestamps, work orders, conditions or local state.

```text
Product PR         : #40
Final product head : cee0095bfd3bdb142b9e1d7ac04d675cfaafa5de
Exact-head CI run  : 34721254939 — SUCCESS
Merge SHA          : 92c1f768998c54280fac7b00cd874e19271f92d9
Post-merge CI run  : 34721464399 — SUCCESS
Frontend route     : /engineering/assets
Read contract      : runtime workbench resource discovery + POST /api/v1/workbench/{module}/{resource}/search
Exact filter       : maintainableAssetId = selected maintainable asset id
Backend ordering   : eventAt desc
Evidence fields    : eventType, oldStatus, newStatus, eventReasonId, eventComment, actorId, eventAt, correlationId, createdAt
Authorization      : runtime workbench search route descriptor + effective grants
State ownership    : TanStack Query lifecycle-event server state; React local state only selection/forms/paging
Fail-closed states : lifecycle resource missing, route permission missing, grant missing, backend error, or empty backend history
Conclusion         : SUCCESS
```

### HWEB-011-06 — Role/permission and concurrent updates — COMPLETE

Permission/role verification proves that an action requires both its exact backend-published route descriptor and the corresponding effective grant. An effective grant string does not create an action when the route descriptor is absent. Assets commands and lifecycle-history search fail closed without grants, and an HTTP 403 from HidraAPI remains final even when frontend metadata appears to allow the action.

Concurrency verification consumes only the backend-published assets contract from HidraAPI merge `2e6f93c...`. The selected maintainable asset's backend `updatedAt` is sent unchanged as `expectedUpdatedAt` for the PATCH route only. On deterministic HTTP 409 conflict, HidraWEB refetches the authoritative workbench detail, replaces local name/token with backend values, and requires a new explicit user submit. It does not automatically retry or generalize `updatedAt` into a lock token for any other resource.

```text
Permission PR          : #42
Permission head        : 3d7e6e30347af7eb0b5995bca5338a4c1efd2ede
Permission exact CI    : 34722168113 — SUCCESS
Permission merge       : 1ae7a257843512b36d966a708480e84412d83d67
Permission post CI     : 34722316390 — SUCCESS
Concurrency PR         : #44
Final concurrency head : 3d5e726d0909510d26a2c742cd418f11c58b14d2
Exact-head CI run      : 34725640515 — SUCCESS
Concurrency merge      : 5f95c363160c131ae725d66c16ffc057d0c83878
Post-merge CI run      : 34725772754 — SUCCESS
Frontend route         : /engineering/assets
Authorization          : GET /api/v1/security/permissions/routes + GET /api/v1/identity/me/permissions
Mutation               : PATCH /api/v1/assets/maintainable-assets/{assetId}
Mutable field           : assetName only
Precondition            : selected authoritative updatedAt -> expectedUpdatedAt
Conflict                : HTTP 409 -> authoritative refetch; no automatic retry
Backend final auth      : HTTP 403 remains final authority
OpenAPI pin             : HidraAPI merge 2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Artifact id             : 10307945855
Artifact digest         : sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
GAP-ENG-001             : CLOSED / HidraAPI #79 CLOSED
Conclusion              : SUCCESS — HWEB-011 COMPLETE
```

---

## HWEB-011-06 completion verification evidence

```text
Backend product merge            : 2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Backend verification merge       : 0c8643c17b2648e8be85c658854f57ea0faab765
Backend product exact-head CI    : 34724457582 — SUCCESS
Backend product post-merge CI    : 34724675473 — SUCCESS
Backend final-main CI            : 34725277170 — SUCCESS
Backend OpenAPI artifact         : 10307945855
Backend OpenAPI digest           : sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Backend gap issue                : CHOUABBIA-AMINE/HidraAPI#79 — CLOSED
Endpoints and DTOs used          : PATCH /api/v1/assets/maintainable-assets/{assetId}; UpdateMaintainableAssetRequest; MaintainableAssetResponse; workbench detail refetch
Permissions used                 : exact PATCH route descriptor intersected with effective grants; no inferred permission code
Frontend route changed           : /engineering/assets only
State ownership                  : TanStack Query owns backend server state; React local state owns edited name and current displayed token only
Concurrency token                : MaintainableAsset.updatedAt explicitly promoted by HidraAPI for this PATCH only
Mutable business field           : assetName only
Stale conflict behavior          : deterministic HTTP 409 causes authoritative workbench detail refetch and local replacement of name/token
Retry behavior                   : no automatic retry; user must review/refill and submit again using refreshed token
Tests added                      : Playwright verifies exact expectedUpdatedAt request, 409 refetch, authoritative replacement, and second user submit with refreshed token
Initial frontend CI correction   : 34725576777 failed only on react-hooks/set-state-in-effect lint; the effect was removed without contract/behavior change
Exact frontend product head      : 3d5e726d0909510d26a2c742cd418f11c58b14d2
Exact-head frontend CI           : 34725640515 — SUCCESS
Frontend product merge           : 5f95c363160c131ae725d66c16ffc057d0c83878
Frontend product post-merge CI   : 34725772754 — SUCCESS
Conclusion                       : HWEB-011-06 VERIFIED; HWEB-011 COMPLETE; HWEB-012 is next and was not started by this task
```

## HWEB-011-06 permission verification evidence

```text
Backend source commit / branch : 9e8a1eb24a99c05749364119ef468f7971939123 / main
Endpoints and DTOs used         : GET /api/v1/security/permissions/routes; GET /api/v1/security/permissions/catalog; GET /api/v1/identity/me/permissions; existing workbench/integrity/assets contracts only
Permissions used                : exact backend route descriptors intersected with effective grants; no permission code inferred from module/resource names
Frontend routes changed         : none; test-only verification for /engineering and /engineering/assets
State ownership                 : unchanged; TanStack Query remains server-state owner and React local state remains selection/forms/paging
Authorization cases             : descriptor without effective grant denied; grant without descriptor denied; assets commands/history search denied without grant; backend HTTP 403 remains final authority
Tests added                     : tests/e2e/engineering-permissions.spec.ts
Exact permission head           : 3d7e6e30347af7eb0b5995bca5338a4c1efd2ede
Exact-head CI                   : 34722168113 — SUCCESS
Permission merge                : 1ae7a257843512b36d966a708480e84412d83d67
Post-merge main CI              : 34722316390 — SUCCESS
Historical conclusion           : permission half VERIFIED; concurrency was blocked at this milestone and was later completed by PR #44
```

## HWEB-011-05 verification evidence

```text
Backend source commit / branch : 9e8a1eb24a99c05749364119ef468f7971939123 / main
Endpoints and DTOs used         : GET /api/v1/workbench/{module}/resources; POST /api/v1/workbench/{module}/{resource}/search; OperationalResourceDescriptor, OperationalSearchRequest, OperationalPageResponse/record attributes
Permissions used                : runtime workbench search descriptor from GET /api/v1/security/permissions/routes intersected with GET /api/v1/identity/me/permissions effective grants
Frontend routes changed         : /engineering/assets only
State ownership                 : TanStack Query owns lifecycle history server state; React local state remains selection/forms/paging
Evidence ownership              : assets backend AssetLifecycleEvent only; no current-status/timestamp/work-order/condition reconstruction
Error states                    : missing lifecycle resource, missing route permission, missing effective grant, backend search error, and empty backend history all fail closed explicitly
Tests added                     : lifecycle evidence mapping unit tests; Playwright exact maintainableAssetId filter/eventAt ordering/evidence rendering/empty-history tests
Initial CI correction           : 34721069457 failed only on an ambiguous Playwright exact-text locator; no product or contract behavior changed
Exact product head              : cee0095bfd3bdb142b9e1d7ac04d675cfaafa5de
Exact-head CI                   : 34721254939 — SUCCESS
Product merge                   : 92c1f768998c54280fac7b00cd874e19271f92d9
Post-merge main CI              : 34721464399 — SUCCESS
Conclusion                      : HWEB-011-05 VERIFIED
```

## HWEB-011-04 verification evidence

```text
Backend source commit / branch : 9e8a1eb24a99c05749364119ef468f7971939123 / main
Endpoints and DTOs used         : existing platform workbench resource discovery/list/detail only; no new HWEB-011-04 backend route
Permissions used                : existing runtime workbench route descriptors + GET /api/v1/identity/me/permissions effective grants
Frontend routes changed         : /engineering and /engineering/assets now route through the engineering process boundary
State ownership                 : TanStack Query retains server state; React local state remains selection/paging/forms
Relationship ownership          : backend-published neutral IDs only; no names/status/timestamps/local state used to infer relationships
Fail-closed behavior            : unsupported/missing relationship evidence renders explicit no-context state; no foreign collection scan
Tests added                     : engineering context unit tests plus browser assertions for topology composition and missing-context failure
Exact product head              : 274cebc55ccd9a05612f9b9ff9260e9c3243eed0
Exact-head CI                   : 34713913319 — SUCCESS
Product merge                   : 16aa6cced5cba33f64dca5b0fc917970e5f1c237
Post-merge main CI              : 34714053565 — SUCCESS
Conclusion                      : HWEB-011-04 VERIFIED
```

## HWEB-011-01 inventory evidence

```text
Backend source commit / branch : 9e8a1eb24a99c05749364119ef468f7971939123 / main
Endpoints and DTOs used         : integrity/assets capabilities + create contracts; platform workbench discovery/list/detail/search
Permissions used                : runtime route descriptors + effective grants; no hard-coded HWEB-011 permission assumptions
Frontend routes changed         : none in inventory task
State ownership                 : documented only; TanStack Query server state / local React selection-form state
Error states                    : no UI change in inventory task
Tests added                     : none; documentation-only inventory
Known backend gap at inventory  : GAP-ENG-001 / HidraAPI #79 — later closed by backend PR #81
Conclusion                      : inventory accepted; completed product tasks retained these ownership boundaries
```

---

## Phase conclusion

HWEB-011 is complete. The engineering workspace now has backend-authoritative integrity/assets reads, create commands, cross-module context composition, lifecycle history, fail-closed authorization verification, and a single explicitly published concurrency-protected maintainable-asset update path. No frontend lifecycle state machine, inferred relationship, invented permission, generalized lock token, or automatic stale-write retry was introduced.

The next legal phase is **HWEB-012 — Metering and Custody**. HWEB-012 was not started as part of HWEB-011-06 completion.
