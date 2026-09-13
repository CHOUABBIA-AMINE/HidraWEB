# HWEB-014 — Governance and Administration Completion

Status: HWEB-014-01 COMPLETE / HWEB-014-02 NEXT

## Accepted starting point

```text
HidraWEB verified main       : c5c33ff8dbfed9625449f50f95cbebae583952ff
HWEB-013-07 final-main CI    : 34758016255 — SUCCESS
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Accepted OpenAPI artifact    : 10307772022
Accepted artifact digest     : sha256:884ceb8d62bafd5e885287a18eb847356cffc21e8948cc1e937ec02b780ff0ea
Current completed task       : HWEB-014-01 — audit search/export UI
Next task                    : HWEB-014-02 — configuration/feature-flag administration
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
Product head                    : 867fb6553839a8bd5b5e08c203abd7e229bc8eb1
Product full CI                 : 34760268247 — SUCCESS
Tests                           : tests/e2e/audit-workspace.spec.ts
Known backend gap               : no dedicated audit search/read API and no export artifact retrieval/download API
Final verification              : roadmap-inclusive exact-head full CI, guarded PR merge, exact merge-SHA main CI required
```

HWEB-014-02 must not begin until this roadmap-inclusive HWEB-014-01 head passes full CI, its exact PR head is verified, the guarded merge succeeds, and exact merge-SHA `main` CI is accepted.
