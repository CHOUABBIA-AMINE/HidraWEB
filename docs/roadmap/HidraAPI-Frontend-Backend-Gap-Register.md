# HidraAPI ↔ HidraWEB Backend Gap Register

```text
Document role          : Living backend-contract gap register for HidraWEB delivery
Frontend repository    : CHOUABBIA-AMINE/HidraWEB
Backend source of truth: CHOUABBIA-AMINE/HidraAPI main
Initial backend commit : f8853fb17b17ff08baf16c4abdfdc810fcbaf01d
Created                : 2026-09-11
Update policy          : Update at the start and completion of every HWEB phase
Owner model            : HidraAPI owns business/security truth; HidraWEB records consumer gaps and verification evidence
```

## Purpose

This document records backend contracts that are missing, incomplete, too generic, or not yet proven for HidraWEB requirements.

It is intentionally maintained alongside frontend development. A frontend phase must not silently work around a missing backend capability. Instead, the gap is recorded here, assigned an identifier, and moved through the lifecycle below.

The register distinguishes:

- **confirmed backend gaps**: proven absent or insufficient from HidraAPI source evidence;
- **contract-quality gaps**: an endpoint exists, but its schema or semantics are too generic for a durable typed frontend contract;
- **phase inspection items**: not yet classified as gaps because the corresponding frontend phase has not performed its required backend inventory.

This document is not a request to duplicate business rules in HidraWEB. HidraAPI remains the authoritative source for authentication, authorization, workflow rules, business state, validation, lifecycle transitions, and operational facts.

---

## Status vocabulary

| Status | Meaning |
|---|---|
| `OPEN` | Confirmed gap exists in current HidraAPI source. |
| `PLANNED` | Backend change has an approved implementation plan/task. |
| `IN_PROGRESS` | Backend implementation is underway. |
| `IMPLEMENTED` | Backend code exists but has not yet been consumed and verified by the relevant HidraWEB phase. |
| `VERIFIED` | HidraWEB has regenerated/consumed the backend contract and tests prove the required behavior. |
| `DEFERRED` | Intentionally postponed with an explicit reason and owning phase. |
| `NOT_REQUIRED` | Gap was investigated and the frontend requirement was removed or satisfied another approved way. |
| `INSPECTION_PENDING` | Phase-specific backend inventory has not yet been performed; not a confirmed gap. |

## Priority vocabulary

| Priority | Meaning |
|---|---|
| `P0` | Security/integrity blocker. Must be resolved before production. |
| `P1` | Blocks or materially limits an upcoming specialized frontend process. |
| `P2` | Important contract quality/operability issue; temporary constrained frontend behavior is possible. |
| `P3` | Hardening or quality improvement that does not block current delivery. |

---

# A. Cross-cutting confirmed gaps

## GAP-SEC-001 — Authenticated principal endpoint

```text
Status          : OPEN
Priority        : P1 now / P0 before production
Backend owner   : platform security / identity
Affected phases : HWEB-002, HWEB-004, HWEB-007, HWEB-014, HWEB-015
Evidence        : No /me, /principal, whoami, or equivalent authenticated-principal REST contract found in HidraAPI main.
```

### Why it matters

HidraWeb currently cannot retrieve a canonical backend representation of the authenticated user. The shell can only use identity information available from the authentication mechanism itself.

This prevents a reliable backend-owned profile containing, when applicable:

- stable identity user ID;
- username/display name;
- employee reference;
- locale/preferences if owned by the backend;
- account status;
- effective organization context;
- any safe identity metadata needed by workflow/audit UX.

### Required backend direction

Provide an authenticated principal/profile endpoint, preferably under the security/identity boundary, for example a versioned `/api/v1/security/me` contract. The exact path is a backend decision.

The DTO must not expose credentials, password material, token internals, or persistence entities.

### Verification criteria

- OpenAPI-published DTO exists.
- Basic development mode and production JWT mode resolve the same logical principal model.
- 401 is returned for unauthenticated requests.
- HidraWeb removes the current principal TARGET placeholder and consumes the generated DTO.

---

## GAP-SEC-002 — Enterprise OIDC/JWT token acquisition contract

```text
Status          : OPEN
Priority        : P0 before production
Backend owner   : platform security / deployment architecture
Affected phases : HWEB-002, HWEB-015
Evidence        : HidraAPI is a JWT resource server in non-development environments, but the IdP/OIDC acquisition and frontend token lifecycle contract is not defined in the application repositories.
```

### Why it matters

HidraWeb has an `AuthProvider` seam but cannot finalize enterprise sign-in, refresh/session expiry, logout, claims normalization, or token storage rules without an approved identity-provider contract.

### Required backend/platform direction

Define and freeze:

- enterprise IdP/OIDC authority;
- client/application registration model;
- authorization flow (normally Authorization Code + PKCE for browser clients, unless an approved gateway/BFF design supersedes it);
- scopes/audience;
- token lifetime/refresh/session behavior;
- logout semantics;
- claim mapping, including stable subject identifier;
- CORS/same-origin deployment interaction.

### Verification criteria

HWEB-015 must prove production login, logout, expiry/re-authentication, authorization headers, and 401 recovery against the approved environment.

---

## GAP-SEC-003 — User-specific/effective authorization grants

```text
Status          : OPEN
Priority        : P0 before production, P1 for authorization-sensitive UX
Backend owner   : platform security / identity
Affected phases : HWEB-002 onward
Evidence        : Current permission catalog is explicitly "catalog-only" and publishes route-derived metadata. It does not prove per-user grants or route-specific @PreAuthorize enforcement.
```

### Current evidence

`HidraRoutePermissionCatalogService` publishes:

- permission naming metadata;
- registered `/api/v1` route descriptors;
- the statement that backend operational routes are authenticated but route-specific `@PreAuthorize` evidence is unavailable.

No actual route-specific `@PreAuthorize` usage was found during the current inventory.

### Why it matters

Frontend navigation/action filtering currently represents **available backend capability metadata**, not the authenticated user's effective authorization.

This must never be confused with security enforcement.

### Required backend direction

Backend should provide both:

1. authoritative route/domain authorization enforcement; and
2. a safe effective-capabilities/grants contract for frontend UX filtering.

The effective authorization model should support domain/resource/scope semantics where required and must remain backend-owned.

### Verification criteria

- unauthorized mutations/reads are denied by HidraAPI regardless of frontend state;
- effective frontend capabilities are tied to the authenticated principal;
- HWEB E2E proves permitted vs forbidden identities against real backend authorization rules.

---

## GAP-CONTRACT-001 — Stable repository-published OpenAPI compatibility artifact

```text
Status          : OPEN
Priority        : P1 for development efficiency / P0 before production release automation
Backend owner   : platform / API governance
Affected phases : HWEB-003 through HWEB-015
Evidence        : HWEB-003 and HWEB-004 currently use source-pinned contract snapshots because a stable backend OpenAPI artifact is not yet part of the cross-repository compatibility workflow.
```

### Why it matters

Generated clients should come from the actual backend contract, not manually curated snapshots.

Without an automated artifact/gate, schema drift can occur between HidraAPI and HidraWEB.

### Required backend direction

Publish deterministic OpenAPI from HidraAPI CI and make it available to HidraWEB CI. Add compatibility validation for breaking changes.

### Verification criteria

- HidraAPI CI produces versioned OpenAPI.
- HidraWEB generation consumes that artifact.
- generated diff is checked in CI.
- incompatible breaking changes fail the integration gate.
- temporary HWEB snapshots are retired.

---

## GAP-REALTIME-001 — Realtime domain-event destination and payload catalog

```text
Status          : OPEN
Priority        : P1 for HWEB-006/HWEB-008
Backend owner   : platform realtime + publishing business modules
Affected phases : HWEB-006, HWEB-007, HWEB-008, HWEB-009, HWEB-014
Evidence        : STOMP transport exists at /api/v1/realtime/ws with /topic and /queue broker prefixes, but no verified domain-event destination/payload catalog was found in the current inventory.
```

### Existing transport

HidraAPI configures:

```text
WebSocket/STOMP endpoint : /api/v1/realtime/ws
Broker destinations      : /topic, /queue
Application prefix       : /app
User destination prefix  : /user
```

Transport existence alone is insufficient for frontend realtime behavior.

### Required backend direction

For each supported event family, define:

- destination;
- event type/version;
- payload DTO/schema;
- event ID and occurred-at timestamp;
- aggregate/resource reference;
- ordering/replay expectations if any;
- authorization rules for subscription;
- reconnect/missed-event recovery semantics.

### Verification criteria

HidraWeb uses realtime only for event types documented here as `VERIFIED`; otherwise it remains polling/query-driven.

---

# B. HWEB-004 identity and organization gaps

## GAP-ID-001 — Identity dedicated read/query APIs

```text
Status          : OPEN
Priority        : P2
Backend owner   : identity
Affected phases : HWEB-004, HWEB-014
Current fallback: HWEB-003 generic workbench reads
```

Current `SpringIdentityController` exposes command operations such as user creation and permission evaluation, but no dedicated canonical list/detail/query API for users, roles, or permissions was proven.

HWEB-004 therefore uses generic workbench resources for read-only administration views.

A dedicated API becomes desirable if identity administration needs stable projections, filters, paging semantics, audit-sensitive fields, or relationships that should not depend on generic JPA discovery.

---

## GAP-ID-002 — Role and permission administration mutations

```text
Status          : OPEN
Priority        : P2 until HWEB-014
Backend owner   : identity
Affected phases : HWEB-004, HWEB-014
```

No verified controller contract currently exposes role creation/update, permission assignment, user-role assignment, scoped grant administration, or equivalent lifecycle commands.

HidraWeb must keep roles/permissions read-only until exact backend commands exist.

---

## GAP-ORG-001 — Dedicated organization read/query APIs

```text
Status          : OPEN
Priority        : P2
Backend owner   : organization
Affected phases : HWEB-004, HWEB-007, HWEB-009, HWEB-011, HWEB-014
Current fallback: HWEB-003 generic workbench reads
```

Current organization controller provides create-unit/register-employee/assign-employee commands but no dedicated hierarchy, employee directory, assignment-history, or organization-context query API was proven.

Reusable HWEB-004 references therefore resolve through workbench detail resources.

---

# C. HWEB-005 topology gaps and contract-quality issues

## GAP-TOPO-001 — Topology map API uses untyped generic maps

```text
Status          : OPEN
Priority        : P1
Backend owner   : topology
Affected phase  : HWEB-005
Evidence        : TopologyMapController returns List<Map<String,Object>> and Map<String,Object> for layers, features, GeoJSON and search.
```

### Existing endpoints

```text
GET /api/v1/topology/map/layers
GET /api/v1/topology/map/layers/{layerId}
GET /api/v1/topology/map/layers/{layerId}/features
GET /api/v1/topology/map/geojson
GET /api/v1/topology/map/search
```

The endpoints exist and are suitable for HWEB-005 functional work, but the response contract is not strongly typed for OpenAPI client generation.

### Required backend direction

Introduce explicit API response DTOs or an explicit GeoJSON schema for:

- layer descriptor;
- paged feature collection;
- feature ID/properties;
- search result;
- GeoJSON Feature/FeatureCollection geometry structures.

Avoid exposing JPA entities.

### Verification criteria

Orval generates stable types with no handwritten `Record<string, unknown>` assumptions for the HWEB-005 map contract.

---

## GAP-TOPO-002 — Pipeline-system and pipeline map layers absent from current layer catalog

```text
Status          : OPEN
Priority        : P1
Backend owner   : topology
Affected phase  : HWEB-005
```

The current `JpaTopologyMapVisualizationAdapter.listLayers()` publishes exactly:

1. `facilities`
2. `topology-nodes`
3. `pipeline-segments`
4. `topology-connections`

There is no current `pipeline-systems` or `pipelines` map layer descriptor.

HWEB-005 must not invent those layers. If the product requires system/pipeline-level visualization or selection, HidraAPI must publish the corresponding geometry/projection contract.

---

## GAP-TOPO-003 — Map feature pagination metadata is incomplete for total-count UX

```text
Status          : OPEN
Priority        : P2
Backend owner   : topology
Affected phase  : HWEB-005
```

Current map feature collections expose `page`, `size`, and `returnedFeatures`, but not a proven total feature count/total pages. Filtering is applied after paged database retrieval for several layer paths, which can also make UI result counts semantically misleading.

### Required backend direction

If HWEB-005 requires reliable total counts or server-driven pagination controls, expose count-aware query semantics and apply filtering consistently before pagination where practical.

If the map intentionally uses chunk/window loading rather than total paging, document that contract explicitly instead.

---

# D. HWEB-006 telemetry and monitoring gaps

## GAP-TEL-001 — Telemetry reading/history/trend query contract

```text
Status          : OPEN
Priority        : P1
Backend owner   : telemetry
Affected phase  : HWEB-006
```

The verified `SpringTelemetryController` currently exposes commands for:

```text
POST /api/v1/telemetry/sources
POST /api/v1/telemetry/points
```

No dedicated telemetry reading-series/history/trend REST contract was proven during this inventory.

HWEB-006 requires trustworthy time-series retrieval including timestamp, value, engineering unit, quality/state, point identity, pagination/window rules, and time-zone semantics.

Generic workbench access may help inspect persistence resources but is not a sufficient long-term chart/time-series API.

---

## GAP-TEL-002 — Telemetry quality/state catalog contract

```text
Status          : OPEN
Priority        : P1
Backend owner   : telemetry
Affected phase  : HWEB-006
```

HWEB-006 explicitly requires reading quality/state presentation from actual backend enums/catalogs. A stable frontend-consumable catalog/DTO contract has not yet been proven.

Do not hard-code SCADA/telemetry quality semantics in HidraWeb.

---

## GAP-MON-001 — Monitoring rules/deviations read/query APIs

```text
Status          : OPEN
Priority        : P1
Backend owner   : monitoring
Affected phase  : HWEB-006
```

The verified `SpringMonitoringController` currently exposes command operations:

```text
POST /api/v1/monitoring/rules
POST /api/v1/monitoring/deviations
```

No dedicated active-rule, deviation-history, open-deviation, asset/point-filter, or time-window query API was proven.

HWEB-006 can use workbench reads only as a constrained temporary fallback where suitable; specialized operations UX should eventually consume purpose-built projections.

---

# E. HWEB-007 workflow gaps

## GAP-WF-001 — Task inbox/query API

```text
Status          : OPEN
Priority        : P1
Backend owner   : workflow
Affected phase  : HWEB-007
```

The verified workflow controller exposes:

```text
POST /api/v1/workflow/tasks
POST /api/v1/workflow/actions
POST /api/v1/workflow/instances
GET  /api/v1/workflow/capabilities
```

No canonical GET/query API for **My Tasks**, assigned tasks, delegated tasks, escalated tasks, completed tasks, or task detail was proven.

A generic workbench list is not sufficient to define the semantics of "My Tasks" because principal assignment/delegation rules belong to workflow/identity backend logic.

### Required backend direction

Provide workflow task queries based on the authenticated principal/effective actor, with explicit state/filter/paging semantics.

---

## GAP-WF-002 — Workflow instance/task timeline and history query

```text
Status          : OPEN
Priority        : P1
Backend owner   : workflow
Affected phases : HWEB-007, HWEB-008, HWEB-009, HWEB-010, HWEB-011
```

No dedicated instance timeline/action history/task history query API was proven.

HWEB must not reconstruct authoritative workflow history by combining generic persistence rows client-side.

---

## GAP-WF-003 — Backend-provided available actions / transition metadata

```text
Status          : OPEN
Priority        : P1
Backend owner   : workflow
Affected phase  : HWEB-007
```

The frontend roadmap forbids inventing approve/reject/delegate/escalate rules. The current controller accepts recorded actions but no verified contract publishes which actions are allowed for a specific task/instance/principal at the current state.

Backend should provide available actions or an equivalent authoritative decision endpoint before specialized workflow action buttons are enabled.

---

# F. HWEB-008 alarm gaps

## GAP-ALARM-001 — Active alarm/history/detail query APIs

```text
Status          : OPEN
Priority        : P1
Backend owner   : alarm
Affected phase  : HWEB-008
```

The verified alarm controller exposes lifecycle commands:

```text
POST /api/v1/alarm/alarms
POST /api/v1/alarm/alarms/acknowledgements
POST /api/v1/alarm/alarms/closures
GET  /api/v1/alarm/capabilities
```

No purpose-built active-alarm console query, alarm history query, or alarm detail GET contract was proven.

HWEB-008 requires stable sorting/filtering by operational state/severity/time and should not depend permanently on generic JPA workbench semantics.

---

## GAP-ALARM-002 — Alarm shelving/suppression contract

```text
Status          : OPEN
Priority        : P2
Backend owner   : alarm
Affected phase  : HWEB-008
```

The roadmap permits shelving only where an exact endpoint exists. No shelving/suppression lifecycle endpoint was found in the verified alarm controller.

HidraWeb must not expose Shelve/Unshelve until such a backend contract exists and its authorization/audit semantics are defined.

---

# G. Remaining phase inspection queue

The following are **not yet confirmed gaps**. They must be converted into concrete gap records only when their mandatory phase inventory proves a missing or insufficient backend contract.

| HWEB phase | Backend owners | Required inspection before implementation | Status |
|---|---|---|---|
| HWEB-009 Events & Incidents | incident, leakdetection, hse | list/detail/create/update actions, evidence/timeline, cross-module references, permissions, realtime | `INSPECTION_PENDING` |
| HWEB-010 Planning | planning | plans, periods, targets, nominations, revisions, version/concurrency, workflow links | `INSPECTION_PENDING` |
| HWEB-011 Integrity & Maintenance | integrity, assets | assessments, asset/work-order queries/actions, history, concurrency, topology links | `INSPECTION_PENDING` |
| HWEB-012 Metering & Custody | custody, party | periods, tickets, reconciliation/discrepancy, party ownership/references | `INSPECTION_PENDING` |
| HWEB-013 Intelligence | risk, analytics, simulation, reporting | datasets, metrics, runs/results, exports, read/derive boundaries | `INSPECTION_PENDING` |
| HWEB-014 Governance/Admin | audit, configuration, documents, integration, notification, identity, organization | search/export, feature flags, multipart/streaming, dead-letter monitoring, notifications, admin mutations | `INSPECTION_PENDING` |
| HWEB-015 Production Hardening | platform + all | production auth, OpenAPI compatibility, observability, release/deployment contracts | `INSPECTION_PENDING` |

---

# H. Update procedure for every frontend phase

At **phase start**:

1. Record the exact HidraAPI branch and commit used as evidence.
2. Inventory controllers, request/response DTOs, domain enums exposed through API, workbench resources, permission descriptors, and realtime publishers relevant to the phase.
3. Re-test existing `OPEN` gaps affecting that phase; do not assume they still exist.
4. Change a gap to `IMPLEMENTED` only when backend code/contract evidence exists.
5. Add newly discovered gaps with a stable ID; never hide them in implementation notes only.

At **phase completion**:

1. Record which gap IDs were consumed, avoided, deferred, or closed.
2. Change a gap to `VERIFIED` only after generated client regeneration and automated frontend tests pass against the new contract/evidence.
3. Record temporary fallbacks explicitly, including removal criteria.
4. Update the phase completion document's `Known backend gaps` field with IDs from this register.

---

# I. Gap record template

Use this template for all future entries:

```markdown
## GAP-<OWNER>-<NNN> — <short name>

Status          : OPEN | PLANNED | IN_PROGRESS | IMPLEMENTED | VERIFIED | DEFERRED | NOT_REQUIRED
Priority        : P0 | P1 | P2 | P3
Backend owner   : <module/platform>
Affected phases : HWEB-...
First observed  : <date / backend commit>
Last verified   : <date / backend commit>

### Evidence
Exact controller/service/DTO/route evidence.

### Frontend impact
What cannot be implemented safely or completely without the contract.

### Required backend direction
Required semantics, not speculative implementation internals.

### Temporary frontend rule
What HidraWeb may do until resolved, and what it must not do.

### Verification criteria
Objective conditions required to mark VERIFIED.
```

---

# J. Current summary

As of the initial register at HidraAPI `f8853fb17b17ff08baf16c4abdfdc810fcbaf01d`:

```text
Cross-cutting confirmed gaps : 5
HWEB-004 confirmed gaps      : 3
HWEB-005 confirmed gaps      : 3
HWEB-006 confirmed gaps      : 3
HWEB-007 confirmed gaps      : 3
HWEB-008 confirmed gaps      : 2
Future inspection phases     : HWEB-009 through HWEB-015
```

Highest-priority frontend-development blockers before their respective phases are:

1. `GAP-TOPO-001` typed topology map contract quality and `GAP-TOPO-002` missing pipeline-system/pipeline layers for HWEB-005 expectations.
2. `GAP-TEL-001`, `GAP-TEL-002`, `GAP-MON-001`, and `GAP-REALTIME-001` for HWEB-006.
3. `GAP-WF-001`, `GAP-WF-002`, and `GAP-WF-003` for HWEB-007.
4. `GAP-ALARM-001` for the specialized HWEB-008 console.
5. `GAP-SEC-003` and `GAP-CONTRACT-001` must be resolved before production authorization and API compatibility can be considered complete.

No future frontend phase should manufacture missing backend semantics to bypass this register.
