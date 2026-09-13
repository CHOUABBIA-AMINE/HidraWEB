# HWEB-014 — Governance and Administration Completion

Status: HWEB-014-02 COMPLETE / HWEB-014-03 BLOCKED

## Accepted starting point

```text
HidraWEB verified main       : ab209cc3105efca2239f78041422c4cb3a59c37d
HWEB-014-02 exact-main CI    : 34762472996 — SUCCESS
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Current completed task       : HWEB-014-02 — configuration/feature-flag administration
Current blocked task         : HWEB-014-03 — document upload/download/version evidence
Backend blocker              : HidraAPI issue #83
```

## HWEB-014-01 — audit search/export UI — COMPLETE

### Backend source and ownership

Audit remains a cross-cutting evidence bounded context. It records durable evidence about actions and state changes owned by source modules; it does not become the owner of those modules' business state.

The audited `SpringAuditController` publishes:

```text
GET  /api/v1/audit/capabilities
POST /api/v1/audit/access-records
POST /api/v1/audit/events
POST /api/v1/audit/exports
```

Legacy aliases also exist for recording access/events and requesting exports.

Critically, the accepted HidraAPI contract publishes **no dedicated audit search/read endpoint** and **no audit export artifact retrieval/download endpoint**.

### Search contract

Audit search uses the already accepted generic workbench read contract:

```text
GET /api/v1/workbench/{module}/resources
GET /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET /api/v1/workbench/{module}/{resource}/{id}
```

HidraWEB discovers module `audit`, identifies `AuditEventJpaEntity` from runtime metadata, then uses the actual returned `descriptor.resource`. Java class names are not hard-coded as endpoint resource names.

The user-visible search term is forwarded only through the generic workbench `q` parameter. Searchable fields are displayed from the runtime resource descriptor; HidraWEB does not invent a field-specific audit query language.

### Export-request contract

HWEB-014-01 invokes only:

```text
POST /api/v1/audit/exports
```

Request DTO:

```text
RequestAuditExportRequest
- requestedByActorId
- requestedByDisplayNameSnapshot
- purposeId
- filterJson
- format
- workflowInstanceId
```

Response DTO:

```text
AuditExportRequestResponse
- id
- requestedByActorId
- purposeId
- format
- status
- recordCount
- requestedAt
- completedAt
```

Published status values are evidence only:

```text
REQUESTED
APPROVED
REJECTED
RUNNING
COMPLETED
FAILED
EXPIRED
```

A status such as `COMPLETED` does not imply that HidraWEB has an artifact retrieval or download contract. No download button, URL synthesis, storage-reference interpretation, approval action, execution action, or polling lifecycle is invented.

### Authorization

Generic audit evidence reads require both exact generic workbench route descriptors and matching effective grants:

```text
GET /api/v1/workbench/{module}/{resource}
GET /api/v1/workbench/{module}/{resource}/{id}
```

Export requests require the exact route descriptor for:

```text
POST /api/v1/audit/exports
```

The frontend intersects descriptor permissions with `GET /api/v1/identity/me/permissions` grants and fails closed when metadata or grants are absent. Permission strings are not inferred by the product implementation; backend 403 remains final authority.

### Frontend route and state ownership

```text
Frontend route : /administration/audit
Backend owner  : audit
Server state   : TanStack Query
Local state    : search input/submitted query, selected detail, export form fields
```

Audit evidence remains append-only evidence owned by audit. Search/list/detail views do not modify audit records or operational source truth.

### Deterministic OpenAPI evidence

The deterministic audit slice is derived from accepted backend artifact `10307772022`, digest `sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea`, for backend SHA `0c8643c17b2648e8be85c658854f57ea0faab765`.

```text
OpenAPI slice  : openapi/hidra-audit-0c8643c17b2648e8be85c658854f57ea0faab765.json
Orval config   : orval.audit.config.ts
Generator      : npm run api:generate:audit
CI gate        : Generate HWEB-014 audit OpenAPI client
```

### Error and fail-closed states

The workspace explicitly handles:

- missing workbench route-permission metadata;
- missing effective workbench read grants;
- missing runtime `AuditEventJpaEntity` resource;
- generic audit evidence read/detail failures;
- missing export route-permission metadata;
- missing effective export grant;
- export-request failures;
- backend 403 as final authority.

### Tests

`tests/e2e/audit-workspace.spec.ts` verifies:

- runtime discovery of the audit event resource;
- generic `q` search behavior;
- the exact `RequestAuditExportRequest` POST body;
- returned export-request status presentation as evidence only;
- absence of download controls;
- fail-closed export behavior without the exact POST grant;
- fail-closed audit evidence reads without generic workbench grants.

### Completion record

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : c5c33ff8dbfed9625449f50f95cbebae583952ff / main
Product branch                  : hweb-014-01-audit-search-export
Frontend route                  : /administration/audit
Dedicated audit search GET      : absent; generic runtime workbench query used
Export operation                : POST /api/v1/audit/exports request only
Artifact retrieval/download     : absent; no download semantics exposed
OpenAPI regeneration            : deterministic audit generator added to verify/CI
Tests                           : tests/e2e/audit-workspace.spec.ts
Known backend gap               : no dedicated audit search/read API and no export artifact retrieval/download API
```

## HWEB-014-02 — configuration/feature-flag administration — COMPLETE

### Backend source and exact published operations

HWEB-014-02 was audited against HidraAPI `main` commit:

```text
0c8643c17b2648e8be85c658854f57ea0faab765
```

`SpringConfigurationController` publishes these canonical endpoints:

```text
GET  /api/v1/configuration/capabilities
POST /api/v1/configuration/definitions
POST /api/v1/configuration/feature-flags
POST /api/v1/configuration/values
```

Legacy POST aliases exist in the backend controller, but HidraWEB uses only the canonical resource endpoints above.

No controller endpoint was found for:

```text
toggle feature flag
update feature flag
delete feature flag
activate/deactivate feature flag
publish/promote configuration
environment promotion
configuration inheritance
rollback
configuration delete
optimistic-lock/version mutation semantics
```

HidraWEB therefore exposes none of those actions.

### Exact request/response contracts

Create configuration definition:

```text
CreateConfigurationDefinitionRequest
- namespaceId
- key
- displayNameFr
- displayNameAr
- displayNameEn
- valueType
- sensitivity
- scoped
- requiresApproval
- defaultValue
- description
```

Create feature flag:

```text
CreateFeatureFlagRequest
- code
- nameFr
- nameAr
- nameEn
- owningModule
- evaluationStrategy
- defaultEnabled
- description
```

Set configuration value:

```text
SetConfigurationValueRequest
- definitionId
- definitionVersionId
- environment
- rawValue
- jsonValue
- secretReference
- effectiveFrom
- effectiveTo
- createdByActorId
```

Returned records are presented as backend evidence only. Status values such as `DRAFT`, `ACTIVE`, `PAUSED`, `DEPRECATED`, `SUPERSEDED`, or `RETIRED` are not treated as authorization or as permission to invent lifecycle actions.

### Read evidence and runtime resources

Read evidence uses the generic workbench contract and runtime discovery for module `configuration`.

HidraWEB identifies these Java types from resource metadata and then uses the returned `descriptor.resource` value for requests:

```text
ConfigurationDefinitionJpaEntity
FeatureFlagJpaEntity
ConfigurationValueJpaEntity
```

The product does not derive runtime endpoint resource names from Java class names.

### Authorization

All configuration controls are fail-closed.

Read evidence requires the exact permission published for:

```text
GET /api/v1/workbench/{module}/{resource}
```

Each mutation is independently enabled only when the route descriptor exists and the current user holds the descriptor's exact permission:

```text
POST /api/v1/configuration/definitions
POST /api/v1/configuration/feature-flags
POST /api/v1/configuration/values
```

Permission strings are never inferred in product code. Backend 403 remains authoritative.

### Frontend route and state ownership

```text
Frontend route : /administration/configuration
Backend owner  : configuration
Server state   : TanStack Query for runtime workbench reads and mutations
Local state    : three request-form payloads only
```

### Deterministic OpenAPI evidence

```text
Backend SHA    : 0c8643c17b2648e8be85c658854f57ea0faab765
OpenAPI slice  : openapi/hidra-configuration-0c8643c17b2648e8be85c658854f57ea0faab765.json
Orval config   : orval.configuration.config.ts
Generator      : npm run api:generate:configuration
CI gate        : Generate HWEB-014 configuration OpenAPI client
```

The slice contains only the accepted configuration capabilities endpoint, the three canonical POST endpoints, their exact request/response fields, and backend-published enum values audited from source.

### Error and fail-closed states

The workspace explicitly handles:

- missing generic workbench route-permission metadata;
- missing effective workbench read grant;
- missing runtime definition/flag/value resources;
- generic evidence read failures;
- missing mutation route-permission metadata;
- missing effective grant for each individual POST operation;
- mutation failures;
- backend 403 as final authority.

### Tests

`tests/e2e/configuration-administration.spec.ts` verifies:

- runtime discovery and reads for definitions, feature flags, and values;
- exact POST request bodies for all three published mutations;
- independent strict route grants;
- fail-closed mutation controls without grants;
- no toggle/delete/rollback/activate/deactivate controls.

### Completion record

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Frontend base                   : ba80b3186d5600b2b10d306b256c0fdba1c9a7cd / main
Product branch                  : hweb-014-02-configuration-administration
Frontend route                  : /administration/configuration
Published mutation endpoints    : definitions, feature-flags, values POST only
Runtime read source             : generic workbench resources for module configuration
Permission model                : exact route descriptors intersected with effective user grants
OpenAPI regeneration            : deterministic configuration generator added to verify/CI
Tests                           : tests/e2e/configuration-administration.spec.ts
Product branch CI               : 34761895453 — SUCCESS before completion-doc commit
Known backend gaps              : no toggle/update/delete/promotion/rollback/inheritance lifecycle APIs published
Final verification              : roadmap-inclusive exact-head full CI, independent PR-head CI, guarded merge, exact merge-SHA main CI required
```

## HWEB-014-03 — document upload/download/version evidence — BLOCKED

### Backend audit

HWEB-014-03 was audited against HidraAPI `main` commit:

```text
0c8643c17b2648e8be85c658854f57ea0faab765
```

`SpringDocumentsController` publishes only these canonical resource operations:

```text
GET  /api/v1/documents/capabilities
POST /api/v1/documents/target-links
POST /api/v1/documents/documents
POST /api/v1/documents/document-versions
```

`POST /api/v1/documents/document-versions` accepts `UploadDocumentVersionRequest` as JSON metadata. Its fields include a client-supplied `storageObjectId`, MIME type, original filename, file size, checksum metadata, dates, language, and uploader snapshots. It does not accept file bytes or a multipart part.

Repository-wide source audit found no `MultipartFile` contract and no documents content retrieval endpoint using `Resource`, `InputStreamResource`, `ByteArrayResource`, `StreamingResponseBody`, or equivalent streaming/file-body semantics.

### Blocking contract gap

HWEB-014-03 requires actual upload/download/version evidence using published multipart/stream contracts only. The accepted backend currently has no such file-transfer contract. Therefore HidraWEB must not invent:

```text
file picker -> JSON metadata substitution
client-generated storageObjectId semantics
direct object-store URLs
storage URL synthesis
download buttons without a retrieval route
browser-side checksum/file-size authority presented as backend truth
range/stream behavior
content-disposition/filename behavior
```

Metadata registration alone does not satisfy the HWEB-014-03 task definition.

### Backend tracking

```text
HidraAPI issue : #83 — documents: expose multipart upload and streaming download contracts for HWEB-014-03
```

The issue requests:

- canonical multipart document-version upload;
- canonical version content retrieval/download;
- authoritative storageObjectId ownership semantics;
- validation, authorization, deterministic errors, media type and filename behavior;
- deterministic OpenAPI publication and backend tests.

### Completion gate

HWEB-014-03 remains blocked until HidraAPI publishes and verifies the required file-transfer contracts in deterministic OpenAPI. Once available, re-audit the exact backend SHA/artifact, consume only the published multipart/stream semantics, add strict route-permission gating, and validate with full CI.

HWEB-014-04 must not begin while HWEB-014-03 remains blocked unless the roadmap is explicitly reprioritized.
