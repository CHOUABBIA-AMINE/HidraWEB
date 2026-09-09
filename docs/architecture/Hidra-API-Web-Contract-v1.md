# Hidra API–Web Contract v1

```text
Document code : HIDRA-API-WEB-CONTRACT-v1
Repository    : HidraWEB
Product       : HidraWeb / HidraAPI
Owner         : Sonatrach / TRC Digitalization Initiative
Author        : Abir MEDJERAB
Status        : Canonical normative contract
```

## 1. Purpose

This document defines the normative boundary between HidraAPI and HidraWeb.

It exists to prevent frontend coupling to persistence/domain internals, standardize cross-cutting behavior and make backend/frontend incompatibilities detectable before deployment.

Existing HidraAPI endpoints are preserved where implemented. Missing or inconsistent capabilities may be recorded as `TARGET`, but must not be presented as implemented until verified in HidraAPI.

## 2. Contract status vocabulary

Every frontend-facing contract item shall be classified as one of:

| Status | Meaning |
|---|---|
| `IMPLEMENTED` | Verified in HidraAPI and consumable by HidraWeb |
| `TARGET` | Approved contract requirement not yet verified/implemented |
| `OPTIONAL` | Supported when a backend mode/capability is enabled |
| `NOT SUPPORTED` | Explicitly unavailable; frontend must not invent it |

Mock implementations used during frontend development shall be labeled `MOCKED` in development artifacts and must not be confused with backend capability.

## 3. Core principles

1. HidraAPI is the source of business truth and final authorization enforcement.
2. HidraWeb owns presentation, interaction, client caching, route guards and feedback; it does not duplicate backend domain rules.
3. API request/response DTOs are contracts. JPA entities and internal domain aggregates are not frontend contracts.
4. OpenAPI is the machine-readable schema source for implemented REST APIs.
5. Identifiers are opaque strings.
6. REST is authoritative for durable commands/queries; SSE/STOMP provides realtime delivery and cache refresh signals.
7. Machine values remain locale-neutral; localization belongs to presentation/catalog contracts.
8. Breaking API changes require contract review and versioning/coordination.

## 4. Base paths and versioning

| Concern | Contract |
|---|---|
| Business APIs | `/api/v1` |
| OpenAPI | `/v3/api-docs` |
| Operational health | `/actuator/*` where exposed; not a business API |
| Major breaking changes | URI/API contract version review required |
| Additive response fields | Clients must tolerate unknown fields |

## 5. API evidence and governance hierarchy

The contract sources are ordered as follows:

```text
1. HidraAPI implementation + OpenAPI
   -> machine/runtime truth

2. Generated TypeScript transport contracts
   -> compile-time frontend truth

3. Existing HidraWEB API catalog/evidence documents
   -> governance, endpoint inventory and gap tracking

4. This document
   -> normative cross-cutting rules and target contracts
```

Existing evidence artifacts such as `docs/02-Backend-Frontend-Contract.md` and `docs/15-API-Catalog.xlsx` remain supporting catalogs and shall not be deleted merely because generated clients are introduced.

## 6. HTTP semantics

| Operation | Preferred method | Rule |
|---|---|---|
| List/detail | `GET` | Idempotent |
| Create | `POST` | Return created representation/reference |
| Partial mutation | `PATCH` | Only where an explicit partial-update contract exists |
| Full replacement | `PUT` | Only for genuinely replaceable resources |
| Delete | `DELETE` | Subject to domain permission/lifecycle rules |
| Complex search | `POST` | Search body; no mutation |
| Domain action | `POST` | Use when the action is not valid CRUD semantics |

HidraWeb must preserve existing HidraAPI routes, including legacy/action aliases, until backend deprecation is explicitly managed.

## 7. Standard headers

| Header | Direction | Rule |
|---|---|---|
| `Authorization` | Web -> API | Credentials/token supplied by active AuthProvider |
| `X-Correlation-ID` | Both | `TARGET` canonical diagnostic correlation; web generates when absent, API echoes where supported |
| `Accept-Language` | Web -> API | Locale preference for server/catalog labels where supported |
| `Content-Type` | Both | `application/json` except multipart/streaming |
| Concurrency token/version | Web -> API | `TARGET` for critical mutable resources where not already present |

## 8. Authentication contract

HidraAPI evidence supports configurable authentication modes including JWT, Basic and disabled/test-oriented modes.

HidraWeb shall hide transport/authentication specifics behind an application authentication abstraction:

```ts
interface AuthProvider {
  login(): Promise<void>;
  logout(): Promise<void>;
  getAccessToken(): Promise<string | undefined>;
  getPrincipal(): Principal | undefined;
}
```

Rules:

- feature modules must not read/write authentication tokens directly;
- HidraWeb must not invent a username/password login endpoint;
- when JWT mode is active, token acquisition is delegated to the configured enterprise identity provider/integration contract;
- Basic mode may be supported for local/development operation without leaking Basic-auth logic into feature modules.

### 8.1 Current principal

A canonical current-user endpoint such as:

```text
GET /api/v1/security/me
```

is classified as `TARGET` unless an equivalent implemented HidraAPI endpoint is verified.

If an existing implemented endpoint already provides the required principal/locale/organization/permission context, HidraWeb shall consume that instead of requiring a duplicate endpoint.

## 9. Authorization and permission metadata

Verified frontend-oriented HidraAPI permission metadata includes:

```text
GET /api/v1/security/permissions/catalog
GET /api/v1/security/permissions/routes
```

HidraWeb shall consume this metadata for:

- route visibility;
- sidebar/menu visibility;
- action/button guards;
- permission-aware feature composition.

Rules:

```text
UI permission guard != security boundary
```

- HidraAPI remains the final enforcement point.
- A stale UI guard must not be assumed to authorize a request.
- `403` responses remain authoritative.
- Feature components shall not use hard-coded role-name comparisons as their primary authorization mechanism.

## 10. DTO boundary

Required flow:

```text
Backend domain/JPA model
    -> backend API mapper
    -> REST DTO / OpenAPI schema
    -> generated TypeScript transport type
    -> optional frontend mapper
    -> frontend view model
```

Forbidden:

```text
JPA entity semantics -> React component contract
```

Forms must be based on explicit request DTO semantics. Unknown backend semantics remain unknown/gap-tracked; the frontend shall not invent business validation rules.

## 11. OpenAPI and generated TypeScript

Preferred implementation contract:

```text
HidraAPI /v3/api-docs
    -> OpenAPI artifact
    -> Orval generation
    -> src/api/generated/
    -> typed clients + TanStack Query integration
```

Rules:

- generated files contain no handwritten business logic;
- generated code is treated as infrastructure/transport code;
- every implemented frontend API use must still be traceable to HidraAPI evidence/API catalog governance;
- handwritten endpoint URLs are not permitted when an equivalent generated client exists;
- contract generation/typecheck failures block merge.

Axios may remain the generated/central HTTP transport. React components must never call Axios directly.

## 12. Error contract

HidraAPI ProblemDetail handling is the base error model. HidraWeb shall normalize server errors into one `HidraApiError` representation.

### 12.1 Canonical target shape

Where HidraAPI exposes/standardizes these fields, use:

```json
{
  "type": "https://hidra/errors/validation",
  "title": "Validation failed",
  "status": 400,
  "code": "HIDRA_VALIDATION_ERROR",
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/planning/plans",
  "correlationId": "9f9d...",
  "errors": [
    {
      "field": "startDate",
      "code": "INVALID_DATE",
      "message": "Start date must precede end date."
    }
  ]
}
```

Fields not currently emitted by HidraAPI are `TARGET`, not assumptions.

### 12.2 Frontend handling

| HTTP status | Required behavior |
|---|---|
| `400` | field/request validation feedback |
| `401` | authentication/session flow |
| `403` | permission denied; no automatic privilege retry |
| `404` | not-found workspace/detail state |
| `409` | concurrency/state conflict; refresh/review |
| `422` | business validation when backend uses it |
| `429` | backoff/rate-limit feedback when used |
| `5xx` | operational error state with retry and diagnostic reference |

Stack traces shall never be presented to end users.

## 13. Generic operational workbench contract

Verified generic workbench APIs include:

```text
GET  /api/v1/workbench/modules
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

The generic workbench is intended for discovery, list/detail/search and secondary/reference/admin resources.

It does not replace purpose-built domain command APIs or specialized operational screens.

## 14. Pagination, sorting and search

Existing endpoints shall be consumed according to their documented parameters.

The preferred convergence model for pageable list APIs is:

```text
?page=0&size=50&sort=timestamp,desc&q=...
```

Canonical page response convergence is `TARGET` where specialized endpoints differ:

```json
{
  "items": [],
  "page": 0,
  "size": 50,
  "totalItems": 4861,
  "totalPages": 98
}
```

The existing generic workbench already provides `page`, `size` and query support; do not invent pagination for endpoints that do not expose it.

## 15. Topology map contract

Verified topology visualization APIs include:

```text
GET /api/v1/topology/map/layers
GET /api/v1/topology/map/layers/{layerId}
GET /api/v1/topology/map/layers/{layerId}/features
GET /api/v1/topology/map/geojson
GET /api/v1/topology/map/search
```

HidraWeb shall consume valid GeoJSON directly.

Rules:

- do not invent a custom frontend geometry protocol;
- preserve stable feature/resource identifiers;
- presentation styles may be frontend-owned;
- future vector-tile evolution must remain compatible with stable resource identity and navigation links.

## 16. Workflow contract

Verified workflow commands include:

```text
POST /api/v1/workflow/instances
POST /api/v1/workflow/tasks
POST /api/v1/workflow/actions
```

Rules:

- workflow owns decision-process state;
- target modules own target business facts;
- HidraWeb must not invent canonical workflow states/actions absent explicit backend evidence;
- action buttons shall be derived from explicit workflow/module APIs or future metadata contracts;
- after a workflow decision that may affect a target aggregate, HidraWeb refreshes the target through its owning module API.

## 17. Realtime contract

HidraAPI exposes realtime capability through SSE and STOMP/WebSocket infrastructure.

Use realtime for live delivery such as:

- telemetry changes;
- alarm changes;
- incident changes;
- task/workflow assignment changes;
- notifications.

Architecture rule:

```text
REST/API = authoritative state
SSE/STOMP = event delivery / cache refresh signal
```

Expected normalized event envelope where supported/standardized:

```json
{
  "eventType": "ALARM_UPDATED",
  "resourceType": "ALARM",
  "resourceId": "alm-123",
  "occurredAt": "2026-09-09T14:43:31Z",
  "correlationId": "..."
}
```

Fields absent from current HidraAPI event payloads are `TARGET`, not assumed.

Realtime failure must not make the application unusable; fallback queries/refetch remain available.

## 18. Date/time, identifiers and enum values

| Concern | Rule |
|---|---|
| Date/time | ISO-8601 over API; UTC where backend contract defines UTC; localize only for display |
| IDs | opaque TypeScript `string`; never parse numeric/business meaning |
| Enums | backend machine values are preserved; frontend translates labels |
| Nullability | follow OpenAPI/DTO evidence; do not infer |
| Units | must be explicit in schema/domain meaning; UI converts only under defined presentation rules |

## 19. Concurrency

Optimistic concurrency is required as a `TARGET` contract for critical mutable resources where HidraAPI does not already provide an equivalent mechanism.

Priority candidates:

- alarms;
- incidents;
- plans;
- workflow tasks;
- governed configuration.

A stale write should produce a deterministic conflict response, preferably `409 Conflict`, allowing HidraWeb to prompt refresh/review.

Frontend convenience alone is not sufficient reason to alter HidraAPI; concurrency is a domain consistency requirement and therefore a legitimate backend contract concern.

## 20. Documents/files

Rules:

- upload binary content through multipart/stream contracts;
- do not embed large files as Base64 JSON;
- use JSON metadata for document identity/version/type/size;
- document/version/evidence semantics remain owned by the documents module;
- downloads use explicit download/stream endpoints where implemented.

## 21. Localization contract

- API identifiers and enum values remain locale-neutral.
- HidraWeb owns shell/action translations.
- backend catalog-provided multilingual labels may be consumed where explicitly supported.
- activated frontend locales are a product decision; implementation shall not hard-code business values as translated strings.
- if Arabic is activated, RTL behavior is a frontend architecture requirement, not an API protocol change.

## 22. Contract acceptance gates

The contract is satisfied when:

- every implemented frontend API call is traceable to HidraAPI/OpenAPI and the evidence catalog;
- generated TypeScript contracts compile against the selected HidraAPI OpenAPI artifact;
- no feature component depends on backend persistence/domain implementation classes;
- 401/403/404/409/validation behavior is handled centrally and predictably;
- permissions are consumed client-side while remaining server-enforced;
- topology is consumed through GeoJSON/layer contracts;
- realtime delivery cannot create a second independent source of truth;
- workflow actions are backend-driven;
- `TARGET` capabilities are explicitly distinguishable from `IMPLEMENTED` capabilities.

## 23. Canonical relationship

This document is authoritative for cross-cutting HidraAPI–HidraWeb interface rules.

`docs/02-Backend-Frontend-Contract.md`, API catalog spreadsheets and other static evidence remain implementation/evidence inventories. If a concrete endpoint in those artifacts conflicts with an example in this document, verified live HidraAPI/OpenAPI evidence takes precedence and this document shall be corrected.
