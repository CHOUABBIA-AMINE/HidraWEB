# HWEB-011 — Integrity and Maintenance

Status: HWEB-011-02 COMPLETE / VERIFIED — HWEB-011-03 NEXT

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

## Remaining execution order

### HWEB-011-02 — Condition/integrity assessment workspaces — COMPLETE / VERIFIED

The `/engineering` route now uses runtime workbench discovery/list/detail/search for module `integrity` and the dedicated `POST /api/v1/integrity/assessments` contract for intentionally exposed assessment creation. Resource names are discovered from HidraAPI rather than maintained as a competing frontend catalog. Route authorization is resolved from backend route descriptors intersected with effective grants. Server state remains in TanStack Query and selection, paging, search and create-form fields remain local React state. No integrity lifecycle state machine was introduced.

Verification evidence:

```text
Product PR                    : #34
Final product head            : 0e947ba30d95ee7d155495507f3e0f75a23a827a
Exact-head CI                 : 34709966944 — SUCCESS
Product merge SHA             : 0dc2cee05ee1c1f833c223c26ed0d5c1a75f679e
Post-merge CI                 : 34710102967 — SUCCESS
Frontend route                : /engineering
Read source                   : runtime workbench discovery/list/detail for module integrity
Create mutation               : POST /api/v1/integrity/assessments
Authorization                 : runtime route descriptors + effective grants
Focused browser proof         : tests/e2e/engineering.spec.ts
Scope exclusions              : assets/work orders, cross-module context, timeline reconstruction, concurrency
Conclusion                    : SUCCESS
```

### HWEB-011-03 — Maintainable asset and work-order workspaces

Use workbench discovery/list/detail/search for assets read state and dedicated create contracts for maintainable assets, asset conditions and work orders. Preserve topology references as neutral identifiers.

### HWEB-011-04 — Cross-module engineering context

Compose topology, document, risk and incident context in `src/processes` only from already-published public contracts and neutral references. Do not import or mirror another module's persistence/domain ownership. Missing relationship evidence must fail closed or be registered as a new backend gap.

### HWEB-011-05 — Asset history/timeline

Use backend lifecycle-event evidence only. Do not derive history from current status or reconstruct events client-side.

### HWEB-011-06 — Role/permission and concurrent updates

Permission tests may proceed against route descriptors/effective grants. Concurrent-update behavior remains blocked by `GAP-ENG-001` / HidraAPI #79 until an authoritative backend mutation contract is published and pinned.

---

## HWEB-011-01 completion evidence required before merge

```text
Backend source commit / branch : 9e8a1eb24a99c05749364119ef468f7971939123 / main
Endpoints and DTOs used         : integrity/assets capabilities + create contracts; platform workbench discovery/list/detail/search
Permissions used                : runtime route descriptors + effective grants; no hard-coded HWEB-011 permission assumptions
Frontend routes changed         : none in inventory task
State ownership                 : documented only; TanStack Query server state / local React selection-form state
Error states                    : no UI change in inventory task
Tests added                     : none; documentation-only inventory
OpenAPI regeneration status     : no frontend contract slice added yet
Known backend gaps              : GAP-ENG-001 / HidraAPI #79
CI result                       : pending
```

HWEB-011-01 is an inventory task only. It must not implement HWEB-011-02 or later UI behavior early.
