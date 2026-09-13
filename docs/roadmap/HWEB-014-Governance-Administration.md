# HWEB-014 — Governance and Administration Completion

Status: HWEB-014-05 COMPLETE / HWEB-014-06 NEXT

## Accepted starting point

```text
HidraWEB verified main       : 5cc268e8bb4a65b9e9046a89553bdf9575376e10
HWEB-014-04 exact-main CI    : 34768395203 — SUCCESS
HidraAPI audited main        : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Current completed task       : HWEB-014-05 — notification center/delivery evidence according to actual APIs
Next task                    : HWEB-014-06 — administration destructive-action confirmations and audit references
Backend prerequisite         : none; accepted notification runtime workbench evidence is sufficient for HWEB-014-05
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

## HWEB-014-03 — document upload/download/version evidence — COMPLETE

### Backend source and prerequisite resolution

HWEB-014-03 was re-audited against accepted HidraAPI `main` commit:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7
```

The transfer prerequisite tracked by HidraAPI issue #83 was resolved by backend PR #84 (`FRONTEND-BACKEND-GAP-002`). Exact backend merge-SHA CI `34764890847` is successful.

Accepted deterministic backend OpenAPI evidence:

```text
Artifact id     : 10320386070
Artifact name   : hidra-api-openapi-725a451ae4880ccb4f2ec508709241f88cd4aea7
Artifact digest : sha256:4c401ba08e3aeb897be19b5944072f6ada7e08efc85c299683def9175e8d4c38
```

### Canonical document transfer contracts

HidraAPI now publishes the required canonical transfer operations:

```text
POST /api/v1/documents/document-versions/upload
GET  /api/v1/documents/document-versions/{versionId}/content
```

The multipart upload request contains exactly:

```text
metadata : UploadDocumentBinaryVersionRequest as application/json
file     : binary file part
```

`UploadDocumentBinaryVersionRequest` contains document/version metadata only. HidraWEB does not send or synthesize `storageObjectId`, MIME type, original filename, file size, checksum algorithm, or checksum value as authoritative storage evidence. Those values are derived and owned by HidraAPI.

The backend default maximum upload size is 52,428,800 bytes (50 MiB), configurable server-side with `hidra.documents.upload.max-bytes`. HidraWEB does not invent a different authoritative limit.

### Content retrieval semantics

Version content is retrieved only through:

```text
GET /api/v1/documents/document-versions/{versionId}/content
```

HidraWEB consumes the returned binary body and backend-provided response metadata. Attachment filename is read from `Content-Disposition`; content type is read from the response headers/blob. No direct storage URI is exposed or synthesized.

The accepted backend contract explicitly publishes:

```text
Accept-Ranges: none
```

Therefore HWEB-014-03 exposes no range request, resume, partial-download, or resumable-upload semantics.

### Existing document metadata operations

HWEB-014-03 retains only the already published canonical document metadata operations needed by this workspace:

```text
POST /api/v1/documents/documents
POST /api/v1/documents/target-links
```

The legacy JSON `POST /api/v1/documents/document-versions` contract remains a backend compatibility operation but is not used as the HWEB-014-03 file upload path.

### Runtime read evidence

Read evidence continues to use generic workbench discovery for module `documents`. HidraWEB identifies the following Java types from runtime descriptors and then uses each descriptor's returned `resource` value:

```text
DocumentJpaEntity
DocumentVersionJpaEntity
DocumentTargetLinkJpaEntity
```

Runtime resource names are never derived from Java class names.

### Authorization

All document controls fail closed.

Runtime evidence reads require the exact route descriptor and effective grant for:

```text
GET /api/v1/workbench/{module}/{resource}
```

Each document operation is independently enabled only when its exact route descriptor exists and the current user holds that descriptor's exact permission:

```text
POST /api/v1/documents/documents
POST /api/v1/documents/document-versions/upload
GET  /api/v1/documents/document-versions/{versionId}/content
POST /api/v1/documents/target-links
```

Permission strings are not inferred by product code. Backend 403 remains final authority.

### Frontend route and state ownership

```text
Frontend route : /administration/documents
Backend owner  : documents
Server state   : TanStack Query for runtime evidence reads and mutations
Local state    : document metadata form, upload metadata/file selection, target-link form, download UI state
```

### Deterministic OpenAPI evidence

```text
Backend SHA    : 725a451ae4880ccb4f2ec508709241f88cd4aea7
OpenAPI slice  : openapi/hidra-documents-725a451ae4880ccb4f2ec508709241f88cd4aea7.json
Orval config   : orval.documents.config.ts
Generator      : npm run api:generate:documents
CI gate        : Generate HWEB-014 documents OpenAPI client
```

The documents generator is part of both `npm run verify` and the HidraWEB CI workflow.

### Error and fail-closed states

The workspace explicitly handles:

- missing generic workbench route-permission metadata;
- missing effective workbench read grant;
- missing runtime document/version/target-link resources;
- generic evidence read failures;
- missing exact route metadata or grants for document registration, multipart upload, download, and target linking;
- upload/download/mutation failures;
- missing backend attachment filename on content retrieval;
- backend 403 as final authority.

### Tests

`tests/e2e/documents-administration.spec.ts` verifies:

- runtime discovery and reads for document, version, and target-link evidence;
- exact multipart POST path and `metadata` + `file` parts;
- absence of client-supplied `storageObjectId` and checksum authority in multipart payloads;
- backend-returned filename/checksum evidence after upload;
- exact version-content GET request and backend attachment filename handling;
- independent strict route grants for upload and download;
- fail-closed controls without exact grants;
- fail-closed evidence reads without the generic workbench grant;
- no range/resume behavior is invented.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Backend exact-main CI           : 34764890847 — SUCCESS
Backend OpenAPI artifact        : 10320386070 / sha256:4c401ba08e3aeb897be19b5944072f6ada7e08efc85c299683def9175e8d4c38
Frontend base                   : 7fcddfa27ac57041766472dc76425e37fbaee70f / main
Product branch                  : hweb-014-03-documents-transfer
Frontend route                  : /administration/documents
Multipart upload                : POST /api/v1/documents/document-versions/upload
Content retrieval               : GET /api/v1/documents/document-versions/{versionId}/content
Storage-object authority        : backend-owned; no client storageObjectId generation
Checksum/size/MIME/filename     : backend-derived authoritative evidence
Range/resume semantics          : unsupported; no UI exposed
Runtime read source             : generic workbench resources for module documents
Permission model                : exact route descriptors intersected with effective user grants
OpenAPI regeneration            : deterministic documents generator added to verify/CI
Tests                           : tests/e2e/documents-administration.spec.ts
Product branch CI               : 34766346913 — SUCCESS on e0554250dd207f30e9de8a392bb64db921b4a147
Final verification              : roadmap-inclusive exact-head full CI, independent PR-head CI, guarded merge, exact merge-SHA main CI required
```

HWEB-014-03 final acceptance was completed by PR #71, merge SHA `6c6e943be7ef6091d39d8b28d828c8b80e2270a6`, and exact-main CI `34766936728 — SUCCESS`.

## HWEB-014-04 — integration connector/job/dead-letter monitoring — COMPLETE

### Backend source and published operations

HWEB-014-04 was audited against accepted HidraAPI `main` commit:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7
```

`SpringIntegrationController` publishes only these canonical business mutations:

```text
POST /api/v1/integration/exchange-messages
POST /api/v1/integration/external-systems
POST /api/v1/integration/job-runs
```

The audited controller publishes no retry, replay, cancel, restart, pause, resume, connector lifecycle, dead-letter disposition, or dead-letter payload-retrieval mutation. HWEB-014-04 therefore does not expose any of those actions.

### Runtime monitoring evidence

Integration monitoring uses the accepted generic workbench contract:

```text
GET /api/v1/workbench/{module}/resources
GET /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
```

HidraWEB discovers module `integration`, identifies these backend Java types in runtime metadata, and then requests only the actual returned `descriptor.resource` values:

```text
ConnectorInstanceJpaEntity
IntegrationJobRunJpaEntity
IntegrationDeadLetterRecordJpaEntity
IntegrationRetryAttemptJpaEntity
IntegrationHealthSnapshotJpaEntity
```

Runtime resource endpoint names are not synthesized from Java class names.

The workspace presents connector, job-run, dead-letter, retry-attempt, and health-snapshot records as backend-owned evidence only. Status or retry fields in returned records are not treated as authorization or as permission to invent lifecycle controls.

### Authorization

Monitoring is fail-closed. Reads require the exact backend route descriptor and effective grant for:

```text
GET /api/v1/workbench/{module}/{resource}
```

HidraWEB intersects the descriptor permission with `GET /api/v1/identity/me/permissions`. If route metadata or the effective grant is absent, the integration monitoring workspace denies evidence reads. Permission strings are not inferred by product code and backend 403 remains final authority.

### Frontend route and state ownership

```text
Frontend route : /administration/integrations
Backend owner  : integration
Server state   : TanStack Query for runtime resource discovery and evidence reads
Local state    : none for business/server state
```

The Administration navigation entry is enabled by HWEB-014-04 and remains capability-scoped to module `integration`.

### Deliberately absent operations

Because no matching backend route is published, the UI contains no controls for:

```text
retry
replay
cancel
restart
pause/resume
connector activation/deactivation
manual dead-letter disposition
manual dead-letter replay
```

HWEB-014-04 also does not synthesize schedules, connector health transitions, payload inspection, retry policies, or dead-letter lifecycle semantics from persistence fields.

### Tests

`tests/e2e/integration-monitoring.spec.ts` verifies:

- runtime discovery for connector, job-run, dead-letter, retry-attempt, and health-snapshot evidence;
- requests use each returned `descriptor.resource` value;
- the evidence-only monitoring notice is present;
- retry/replay/cancel/restart/pause controls are absent;
- the workspace fails closed when the exact generic workbench read grant is absent.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Frontend base                   : 6c6e943be7ef6091d39d8b28d828c8b80e2270a6 / main
Product branch                  : hweb-014-04-integration-monitoring
Product head                    : 182d44b62e751eba9c6b084a7dfa5ef136eb6c26
Frontend route                  : /administration/integrations
Monitoring resources            : connector, job run, dead letter, retry attempt, health snapshot via runtime workbench discovery
Dedicated integration mutations : not used by HWEB-014-04; monitoring remains evidence-only
Permission model                : exact generic workbench route descriptor intersected with effective user grants
Tests                           : tests/e2e/integration-monitoring.spec.ts
Product branch CI               : 34767466875 — SUCCESS on 182d44b62e751eba9c6b084a7dfa5ef136eb6c26
Known backend gaps              : no retry/replay/cancel/restart/pause/dead-letter lifecycle mutation endpoints published
Final verification              : roadmap-inclusive exact-head full CI, independent PR-head CI, guarded merge, exact merge-SHA main CI required
```

HWEB-014-04 final acceptance was completed by PR #72, merge SHA `5cc268e8bb4a65b9e9046a89553bdf9575376e10`, and exact-main CI `34768395203 — SUCCESS`.

## HWEB-014-05 — notification center/delivery evidence — COMPLETE

### Backend source and published operations

HWEB-014-05 was audited against accepted HidraAPI `main` commit:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7
```

`SpringNotificationController` publishes the following canonical notification operations:

```text
GET  /api/v1/notification/capabilities
POST /api/v1/notification/messages
POST /api/v1/notification/requests
POST /api/v1/notification/delivery-attempts
```

Legacy POST aliases also exist for creating messages, receiving requests, and recording delivery attempts. HWEB-014-05 does not invoke these POST operations because the notification center task is a read/evidence surface rather than a producer or delivery recorder.

The audited notification API publishes no dedicated endpoint for:

```text
mark read / unread
archive
dismiss
delete
resend
retry
notification preferences
notification-center realtime/websocket state
```

HidraWEB therefore exposes none of those behaviors.

### Runtime notification and delivery evidence

The notification center uses the accepted generic workbench read contract:

```text
GET /api/v1/workbench/{module}/resources
GET /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
```

HidraWEB discovers module `notification`, identifies these backend Java types in runtime metadata, and then requests only the actual returned `descriptor.resource` values:

```text
NotificationRequestJpaEntity
NotificationMessageJpaEntity
NotificationDeliveryAttemptJpaEntity
```

Runtime endpoint resource names are never synthesized from the Java class names. Request, message, and delivery-attempt records are presented as backend-owned evidence only; returned status/channel fields do not authorize or imply additional frontend lifecycle operations.

### Authorization

Notification evidence reads are fail-closed and require the exact backend route descriptor and effective grant for:

```text
GET /api/v1/workbench/{module}/{resource}
```

HidraWEB intersects the descriptor permission with `GET /api/v1/identity/me/permissions`. If the route descriptor, exact permission, or effective grant is absent, runtime notification resource discovery and record reads do not execute. Permission strings are not inferred and backend 403 remains final authority.

### Frontend route and state ownership

```text
Frontend route : /work/notifications
Backend owner  : notification
Server state   : TanStack Query for runtime resource discovery and evidence reads
Local state    : none for business/server state
```

The existing Work navigation notification entry is enabled by HWEB-014-05 and remains capability-scoped to module `notification`.

### Deliberately absent behavior

Because HidraAPI publishes no matching notification-center contract, the UI includes no controls or inferred semantics for:

```text
mark read / unread
archive / dismiss / delete
resend / retry
preferences
unread counters
client-owned delivery transitions
realtime notification subscriptions
```

HWEB-014-05 also does not reinterpret persistence evidence as user inbox state or as permission to mutate notification delivery state.

### Tests

`tests/e2e/notification-center.spec.ts` verifies:

- runtime discovery of notification request, message, and delivery-attempt evidence;
- list requests use the backend-returned `descriptor.resource` values, including deliberately non-derived test resource names;
- the evidence-only notification-center notice is present;
- mark-read/unread, archive, dismiss, delete, resend, retry, and preference controls are absent;
- runtime workbench discovery/read requests do not execute when the exact generic workbench read grant is absent.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Frontend base                   : 5cc268e8bb4a65b9e9046a89553bdf9575376e10 / main
Product branch                  : hweb-014-05-notification-evidence
Product head                    : 748e4a0fe7199a8c271aab616370a545aa3c631e
Frontend route                  : /work/notifications
Runtime monitoring resources    : notification request, message, delivery attempt via runtime workbench discovery
Dedicated notification POSTs    : not used by HWEB-014-05; center remains read-only evidence
Permission model                : exact generic workbench route descriptor intersected with effective user grants
OpenAPI regeneration            : none required; existing generic workbench contract only
Tests                           : tests/e2e/notification-center.spec.ts
Product branch CI               : 34769297110 — SUCCESS on 748e4a0fe7199a8c271aab616370a545aa3c631e
Known backend gaps              : no read/unread, archive/dismiss/delete, resend/retry, preferences, or notification-center realtime API
Final verification              : roadmap-inclusive exact-head full CI, independent PR-head CI, guarded merge, exact merge-SHA main CI required
```

HWEB-014-06 must not begin until the roadmap-inclusive HWEB-014-05 head passes full CI, its exact PR head is independently verified, the guarded merge succeeds, and exact merge-SHA `main` CI is accepted.
