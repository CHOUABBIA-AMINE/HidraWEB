# HWEB-011 — Integrity and Maintenance

Status: HWEB-011-04 COMPLETE / HWEB-011-05 NEXT / GAP-ENG-001 OPEN

## Accepted baselines

```text
HidraWEB phase base          : 10921c1eaf61febae92171bdc93cc663f35ef613
HidraAPI audited main        : 9e8a1eb24a99c05749364119ef468f7971939123
Accepted functional artifact : hidra-api-openapi-7bbdb49dbc40c5637d93a05863e69f9576a2edba
Artifact id                  : 10298289002
Artifact digest              : sha256:87d8248b2b25ca0bd684a8c7a98b33d79b52014a45c4992c71a456f2f5e95eec
Backend owners               : integrity, assets
Concurrency gap issue        : CHOUABBIA-AMINE/HidraAPI#79 — OPEN
```

HidraAPI `9e8a1eb...` is a documentation-only successor of the accepted PLN-004 functional merge. HWEB-011 inventory therefore audits current source at `9e8a1eb...` while retaining the exact accepted OpenAPI artifact from functional merge `7bbdb49...` until HWEB-011 produces a newer backend contract artifact.

## HWEB-011 scope

HWEB-011 keeps `/engineering` as one user process while preserving backend ownership boundaries:

- `integrity` owns integrity programs, assessments, cases, inspection/defect/corrosion/cathodic-protection evidence and integrity recommendations;
- `assets` owns maintainable assets, condition records, maintenance work orders and asset lifecycle evidence;
- topology remains owner of topology/geospatial truth;
- documents remains owner of document/version truth;
- risk remains owner of risk truth;
- incident remains owner of incident truth;
- HidraWEB process composition must use neutral identifiers and public contracts only.

TanStack Query owns server state. React local state may own selection, paging, filters and forms. HWEB-011 must not introduce a frontend integrity/maintenance state machine.

---

## HWEB-011-01 — Integrity/assets contract inventory

### Dedicated integrity commands

Current `SpringIntegrityController` publishes:

```text
GET  /api/v1/integrity/capabilities
POST /api/v1/integrity/assessments
POST /api/v1/integrity/programs
POST /api/v1/integrity/cases
```

Legacy command aliases also exist (`/create-integrity-assessment`, `/create-integrity-program`, `/open-integrity-case`) but HWEB-011 should prefer the resource-oriented routes above.

Published response shapes include:

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

The dedicated integrity controller currently exposes create operations only; it does not publish dedicated integrity list/detail/update/lifecycle routes.

### Dedicated assets commands

Current `SpringAssetsController` publishes:

```text
GET  /api/v1/assets/capabilities
POST /api/v1/assets/maintenance-work-orders
POST /api/v1/assets/asset-conditions
POST /api/v1/assets/maintainable-assets
```

Legacy command aliases also exist, but HWEB-011 should prefer the resource-oriented routes.

Published response shapes include:

```text
MaintainableAssetResponse
- id
- assetNumber
- assetCode
- assetName
- assetTypeId
- topologyAssetTypeCode
- topologyAssetId
- status
- criticalityId
- registeredAt

AssetConditionResponse
- id
- maintainableAssetId
- conditionStatus
- conditionScore
- observedAt

MaintenanceWorkOrderResponse
- id
- workOrderNumber
- maintainableAssetId
- sourceRecommendationId
- workOrderTypeId
- status
- title
- plannedStartAt
- completedAt
```

The dedicated assets controller currently exposes create operations only; it does not publish dedicated assets list/detail/update/lifecycle routes.

### Authoritative generic read contract

HidraAPI's platform workbench indexes JPA entities by backend module and publishes deterministic discovery/read/search endpoints:

```text
GET  /api/v1/workbench/modules
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

The workbench derives resources from the backend metamodel. HWEB-011 must discover `integrity` and `assets` resources from `GET /api/v1/workbench/{module}/resources` instead of maintaining a competing frontend resource catalog.

The workbench supports:

- zero-based paging;
- default size 50, capped at 200;
- text search across backend-discovered string fields;
- exact filters over existing entity fields;
- optional sorting over existing entity fields;
- generic list/detail record responses.

This read contract means HWEB-011-02 through HWEB-011-05 are not blocked on basic resource retrieval even though dedicated query controllers are absent.

### Resource evidence relevant to later tasks

Current persistence evidence includes, among other resources, integrity assessment/program/case and inspection/defect/corrosion/cathodic-protection records, plus assets maintainable-asset, asset-condition, work-order, document-reference and lifecycle-event records.

`AssetLifecycleEvent` is explicitly keyed by `maintainableAssetId` and publishes backend event type, old/new status, reason/comment, actor, event time, correlation id and creation time. HWEB-011-05 may use the workbench filter on `maintainableAssetId` as the authoritative evidence source; it must not fabricate missing lifecycle events.

### Authorization rule

HWEB-011 must resolve route permissions from `GET /api/v1/security/permissions/routes` and intersect them with effective grants from `GET /api/v1/identity/me/permissions`. Backend authorization remains final. No permission code should be guessed from module/resource names in feature code.

### Known gap discovered by HWEB-011-01

`GAP-ENG-001 — Integrity/assets concurrent update contract`

```text
Status        : OPEN
Backend issue : CHOUABBIA-AMINE/HidraAPI#79
Reason        : HWEB-011-06 requires concurrent-update verification, but current integrity/assets REST contracts publish create commands only and no update mutation exposes an explicit stale-write precondition/token.
Frontend rule : Do not infer concurrency from timestamps, status enums or workbench fields. Do not synthesize PATCH/PUT semantics or client-side lifecycle transitions.
Completion    : HidraAPI publishes and verifies one intentionally supported concurrency-protected integrity/assets update mutation with deterministic conflict behavior and OpenAPI evidence.
```

No additional backend read gap is opened at inventory time because the generic workbench already publishes list/detail/search for JPA-backed integrity/assets resources. If a later specialized workspace requires semantics that the generic read contract cannot safely express, that requirement must become a separate explicit backend gap before implementation.

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
Concurrency gap    : GAP-ENG-001 / HidraAPI #79 remains OPEN and untouched
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
OpenAPI status     : unchanged; accepted artifact 10298289002 retained
Concurrency gap    : GAP-ENG-001 / HidraAPI #79 remains OPEN and untouched
Conclusion         : SUCCESS
```

### HWEB-011-05 — Asset history/timeline — NEXT

Use backend lifecycle-event evidence only. Do not derive history from current status or reconstruct events client-side.

### HWEB-011-06 — Role/permission and concurrent updates — PARTIALLY BLOCKED

Permission tests may proceed against route descriptors/effective grants. Concurrent-update behavior remains blocked by `GAP-ENG-001` / HidraAPI #79 until an authoritative backend mutation contract is published and pinned.

---

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
OpenAPI regeneration status     : CI regeneration succeeded; no contract or pin change required for HWEB-011-04
Exact product head              : 274cebc55ccd9a05612f9b9ff9260e9c3243eed0
Exact-head CI                   : 34713913319 — SUCCESS
Product merge                   : 16aa6cced5cba33f64dca5b0fc917970e5f1c237
Post-merge main CI              : 34714053565 — SUCCESS
Known backend gaps              : GAP-ENG-001 / HidraAPI #79 remains OPEN for HWEB-011-06
Conclusion                      : HWEB-011-04 VERIFIED; HWEB-011-05 is next
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
OpenAPI regeneration status     : no frontend contract slice added in inventory task
Known backend gaps              : GAP-ENG-001 / HidraAPI #79
Conclusion                      : inventory accepted; later product tasks must retain these ownership boundaries
```
