# HidraAPI ↔ HidraWEB Backend Gap Register

```text
Document role          : Living backend-contract gap register for HidraWEB delivery
Frontend repository    : CHOUABBIA-AMINE/HidraWEB
Backend source of truth: CHOUABBIA-AMINE/HidraAPI main
Initial backend commit : f8853fb17b17ff08baf16c4abdfdc810fcbaf01d
Last reconciled commit : af4c3b4723619a25dd9a94f4d27f5a36adab982e
Last reconciled branch : main
Reconciled             : 2026-09-11
Update policy          : Update at the start and completion of every HWEB phase
Owner model            : HidraAPI owns business/security truth; HidraWEB records consumer gaps and verification evidence
```

## Purpose

This is the canonical frontend-facing acceptance register for HidraAPI capabilities required by HidraWEB. A frontend phase must reconcile these entries against current backend source and the generated OpenAPI artifact before implementation. HidraWEB must not invent endpoints, DTO fields, authorization rules, workflow actions, topology layers, telemetry semantics, alarm states, or organization relationships.

## Status vocabulary

| Status | Meaning |
|---|---|
| `OPEN` | Confirmed gap exists in current HidraAPI source. |
| `PLANNED` | Backend change has an approved implementation plan/task. |
| `IN_PROGRESS` | Backend implementation exists only partially or current source cannot yet prove a usable contract. |
| `IMPLEMENTED` | Backend code/contract exists but the relevant HidraWEB phase has not yet consumed and tested it. |
| `VERIFIED` | HidraWEB consumes the contract and frontend tests prove the required behavior. |
| `DEFERRED` | Intentionally postponed with an explicit reason and owner. |
| `NOT_REQUIRED` | Requirement was removed or satisfied another approved way. |
| `INSPECTION_PENDING` | Phase-specific backend inventory has not yet been performed. |

## 2026-09-11 reconciliation at HidraAPI `af4c3b47…`

Backend remediation is now stable on HidraAPI `main` at `af4c3b4723619a25dd9a94f4d27f5a36adab982e` after PRs #53, #54, and #55. Post-merge HidraAPI CI run #22 completed successfully.

Acceptance evidence at the reconciled backend SHA:

- repository wrapper compile, test, and clean verify all pass;
- exact acceptance commands `mvn -q -DskipTests compile`, `mvn -q test`, and `mvn -q clean verify` all pass;
- the application boots in CI and publishes `/v3/api-docs`;
- CI uploads deterministic artifact `hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e`;
- artifact digest: `sha256:64a187d362725d7cfd674f5f130d1345f97f88e9151e65d4d5d29d74e76d932a`;
- backend route authorization is enforced from effective principal permissions rather than being catalog-only;
- realtime transport capability reporting is intentionally honest: transport is configured, but no verified business-domain event publishers are present yet.

Important frontend interpretation:

- `IMPLEMENTED` means the backend contract is available and backend-verified; it does **not** mean HidraWEB has consumed or frontend-tested it.
- `VERIFIED` remains reserved for HidraWEB consumption plus frontend test evidence.
- enterprise identity-provider registration remains deployment-owned even though the repository now publishes the browser OIDC contract.
- realtime domain-event publishing remains deferred; HidraWEB must not invent event families or destinations.

---

# A. Cross-cutting gaps

## GAP-SEC-001 — Authenticated principal endpoint

```text
Status          : IMPLEMENTED
Priority        : P1 now / P0 before production
Backend owner   : platform security / identity
Affected phases : HWEB-002, HWEB-004, HWEB-007, HWEB-014, HWEB-015
Evidence        : GET /api/v1/identity/me and GET /api/v1/identity/me/permissions exist on backend main af4c3b47…. Effective permissions are resolved from token authorities plus configured identity permission sources.
Frontend state  : Not yet consumed as the canonical shell principal/effective-grants contract.
```

## GAP-SEC-002 — Enterprise OIDC/JWT token acquisition contract

```text
Status          : IMPLEMENTED
Priority        : P0 before production
Backend owner   : platform security / deployment architecture
Affected phases : HWEB-002, HWEB-015
Evidence        : GET /api/v1/security/oidc publishes the repository-side non-secret browser authentication contract: authorization_code_pkce, issuer/client/audience/scopes/logout metadata, browser-memory token storage guidance, and registration completeness.
External owner  : Enterprise IdP/client registration and environment-specific credentials remain deployment-owned and outside repository source control.
Frontend state  : Contract is available; production readiness still depends on external IdP/client registration and HidraWEB integration testing.
```

## GAP-SEC-003 — User-specific/effective authorization grants

```text
Status          : IMPLEMENTED
Priority        : P0 before production / P1 for authorization-sensitive UX
Backend owner   : platform security / identity
Affected phases : HWEB-002 onward
Evidence        : HidraEffectivePermissionResolver combines token and identity-backed effective permissions; HidraRouteAuthorizationInterceptor enforces route permissions for /api/v1/** with explicit exemptions and admin bypass. Route permission metadata uses canonical lower-case <module>:<resource>:<action> grants.
Frontend state  : HidraWEB may consume grants for capability-aware UX, but backend enforcement remains authoritative. Frontend allowed/forbidden E2E identities are still required before VERIFIED.
```

## GAP-CONTRACT-001 — Stable repository-published OpenAPI compatibility artifact

```text
Status          : IMPLEMENTED
Priority        : P1 development / P0 release automation
Backend owner   : platform / API governance
Affected phases : HWEB-003 through HWEB-015
Evidence        : HidraAPI CI boots the verified jar, fetches /v3/api-docs, deterministically sorts the JSON, and uploads hidra-api-openapi-${github.sha}. Post-merge run #22 published hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e.
Frontend state  : HidraWEB has not yet wired this artifact into its compatibility/code-generation gate. Temporary source-pinned snapshots should now be retired in favor of the backend-published artifact.
```

## GAP-REALTIME-001 — Realtime domain-event destination and payload catalog

```text
Status          : DEFERRED
Priority        : P1 for HWEB-006/HWEB-008
Backend owner   : platform realtime + publishing business modules
Affected phases : HWEB-006, HWEB-007, HWEB-008, HWEB-009, HWEB-014
Evidence        : GET /api/v1/realtime/capabilities and GET /api/v1/realtime/sse exist; STOMP endpoint /api/v1/realtime/ws is configured. Capabilities explicitly report publicationStatus=transport-configured-no-domain-publishers, recoveryStrategy=query-after-reconnect, and an empty eventFamilies list.
Reason          : No verified business-domain publishers exist in current source, so HidraWEB must not invent event types, destinations, ordering guarantees, or payload schemas.
Completion gate : Implement and test real domain publishers, then publish their event-family contracts through /api/v1/realtime/capabilities and generated OpenAPI.
```

---

# B. HWEB-004 identity and organization gaps

## GAP-ID-001 — Identity dedicated read/query APIs

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : identity
Affected phases : HWEB-004, HWEB-014
Evidence        : Dedicated identity user/role/permission administration query APIs exist on reconciled backend main and pass post-merge CI.
Frontend state  : HWEB-004 remains on its previously verified workbench-read fallback and has not regenerated/consumed these dedicated reads.
```

## GAP-ID-002 — Role and permission administration mutations

```text
Status          : IMPLEMENTED
Priority        : P2 until HWEB-014
Backend owner   : identity
Affected phases : HWEB-004, HWEB-014
Evidence        : Identity administration command application service and REST commands support role/permission creation and user-role, role-permission, and user-permission grants. Validation, transaction proxying, and backend tests pass on reconciled main.
Frontend state  : Not consumed by HWEB-004; do not mark VERIFIED until frontend administration uses and tests the exact commands from the generated OpenAPI artifact.
```

## GAP-ORG-001 — Dedicated organization read/query APIs

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : organization
Affected phases : HWEB-004, HWEB-007, HWEB-009, HWEB-011, HWEB-014
Evidence        : Dedicated organization query endpoints are present and backend-verified on af4c3b47….
Frontend state  : Not yet consumed by HidraWEB.
```

Published routes include:

```text
GET /api/v1/organization/units
GET /api/v1/organization/units/{id}
GET /api/v1/organization/units/{id}/children
GET /api/v1/organization/hierarchy
GET /api/v1/organization/employees
GET /api/v1/organization/employees/{id}
GET /api/v1/organization/employees/{id}/assignments
GET /api/v1/organization/assignments
```

---

# C. HWEB-005 topology contract

## GAP-TOPO-001 — Strongly typed topology map contract

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : topology
Affected phase  : HWEB-005
Evidence        : This capability was already satisfied before FRONTEND-BACKEND-GAP-002. TopologyMapVisualizationUseCase publishes LayerDescriptor, Geometry variants, FeatureProperties, Feature, FeatureCollection and SearchResult records; TopologyMapController returns these typed contracts.
Frontend gate   : Promote to VERIFIED only after HWEB-005 generation, consumption and frontend tests pass against the backend-published OpenAPI artifact.
```

Published routes:

```text
GET /api/v1/topology/map/layers
GET /api/v1/topology/map/layers/{layerId}
GET /api/v1/topology/map/layers/{layerId}/features
GET /api/v1/topology/map/geojson
GET /api/v1/topology/map/search
```

## GAP-TOPO-002 — Pipeline-system and pipeline map layers

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : topology
Affected phase  : HWEB-005
Evidence        : This capability was already satisfied before FRONTEND-BACKEND-GAP-002. Backend publishes six owned layers: pipeline-systems, pipelines, facilities, topology-nodes, pipeline-segments, topology-connections.
Frontend gate   : HWEB-005 must render only layer descriptors returned by the backend; no frontend layer invention.
```

## GAP-TOPO-003 — Count-aware topology feature paging

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : topology
Affected phase  : HWEB-005
Evidence        : This capability was already satisfied before FRONTEND-BACKEND-GAP-002. FeatureCollection/SearchResult expose page, size, totalFeatures, totalPages and hasNext; filtering is applied before the returned slice.
Frontend gate   : HWEB-005 must expose loaded/total observability and test the generated contract before VERIFIED.
```

---

# D. HWEB-006 telemetry and monitoring gaps

## GAP-TEL-001 — Telemetry reading/history/trend query contract

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : telemetry
Affected phase  : HWEB-006
Evidence        : Dedicated telemetry reading/history/latest/trend endpoints are present and pass reconciled backend CI/OpenAPI publication.
Frontend state  : Not yet consumed by HidraWEB; use the generated OpenAPI artifact as the contract source.
```

Published routes include:

```text
GET /api/v1/telemetry/points/{pointId}/readings
GET /api/v1/telemetry/points/{pointId}/latest
GET /api/v1/telemetry/points/{pointId}/trend
```

## GAP-TEL-002 — Telemetry quality/state catalog contract

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : telemetry
Affected phase  : HWEB-006
Evidence        : Backend publishes reference catalogs for reading states and quality codes on reconciled main.
Frontend state  : Not yet consumed. HidraWEB must use returned backend semantics and must not hard-code SCADA quality/state meaning.
```

Published routes:

```text
GET /api/v1/telemetry/reference/reading-states
GET /api/v1/telemetry/reference/quality-codes
```

## GAP-MON-001 — Monitoring rules/deviations read/query APIs

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : monitoring
Affected phase  : HWEB-006
Evidence        : Dedicated monitoring rule/deviation query endpoints are present and pass reconciled backend CI/OpenAPI publication.
Frontend state  : Not yet consumed or frontend-verified.
```

Published routes include:

```text
GET /api/v1/monitoring/rules
GET /api/v1/monitoring/rules/{id}
GET /api/v1/monitoring/deviations
GET /api/v1/monitoring/deviations/{id}
```

---

# E. HWEB-007 workflow gaps

## GAP-WF-001 — Task inbox/query API

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : workflow
Affected phase  : HWEB-007
Evidence        : Workflow query controller is buildable and backend-verified on af4c3b47…. GET /api/v1/workflow/tasks and GET /api/v1/workflow/tasks/{id} are published.
Frontend state  : Not yet consumed or frontend-verified.
```

## GAP-WF-002 — Workflow instance/task timeline and history query

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : workflow
Affected phases : HWEB-007, HWEB-008, HWEB-009, HWEB-010, HWEB-011
Evidence        : GET /api/v1/workflow/instances/{id} and GET /api/v1/workflow/instances/{id}/timeline are present and pass reconciled backend CI/OpenAPI publication.
Frontend state  : Not yet consumed or frontend-verified.
```

## GAP-WF-003 — Backend-provided available actions / transition metadata

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : workflow
Affected phases : HWEB-007 onward
Evidence        : GET /api/v1/workflow/tasks/{id}/available-actions is present. Workflow available-action evaluation now uses effective backend permissions rather than incomplete catalog-only metadata.
Frontend state  : HidraWEB must consume backend-provided actions and must not infer transitions locally. Frontend authorization/action tests remain required before VERIFIED.
```

---

# F. HWEB-008 alarm gaps

## GAP-ALARM-001 — Active alarm/history/detail query APIs

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : alarm
Affected phase  : HWEB-008
Evidence        : Alarm list/detail query endpoints are present and pass reconciled backend CI/OpenAPI publication.
Frontend state  : Not yet consumed; use exact filters/states/DTOs from generated OpenAPI rather than inferred lifecycle semantics.
```

Published routes include:

```text
GET /api/v1/alarm/alarms
GET /api/v1/alarm/alarms/{id}
```

## GAP-ALARM-002 — Alarm shelving/suppression contract

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : alarm
Affected phase  : HWEB-008
Evidence        : Alarm shelving query plus shelving/unshelving command endpoints are present and backend-verified on reconciled main.
Frontend state  : Not yet consumed or frontend-verified; lifecycle behavior must follow generated OpenAPI and backend responses.
```

Published route family includes:

```text
GET  /api/v1/alarm/alarms/{id}/shelvings
POST /api/v1/alarm/alarms/{id}/shelvings
POST alarm unshelve operation under /api/v1/alarm/alarms/{id}
```

The generated OpenAPI artifact at the reconciled SHA is authoritative for the exact unshelve operation path and request/response schema.

---

# G. Later phase inspection policy

HWEB-009 through HWEB-015 must continue current-source/OpenAPI inventory before implementation. New gaps discovered for incidents/leak/HSE, planning, integrity/assets, custody/party, analytics/simulation/reporting, configuration/audit/documents/integrations, or production hardening must be added here with exact backend SHA and evidence. Do not assume a later phase is ready because an older catalog mentions an endpoint.

---

# H. Current readiness decision

At backend source commit `af4c3b4723619a25dd9a94f4d27f5a36adab982e`, the remediated backend contract is globally buildable and backend-verified. HidraAPI post-merge CI run #22 passed the repository checks, the exact Maven acceptance commands, runtime OpenAPI publication, and artifact upload.

Current frontend delivery rules:

- HWEB-005 topology consumption may proceed against the backend-published OpenAPI artifact; the old temporary source-pinned snapshot exception should be retired.
- HWEB-006 telemetry/monitoring backend prerequisites listed in this register are `IMPLEMENTED`; frontend consumption/testing is still required before `VERIFIED`.
- HWEB-007 workflow query/timeline/available-action prerequisites listed here are `IMPLEMENTED`; HidraWEB must not infer transitions or authorization.
- HWEB-008 alarm query/shelving prerequisites listed here are `IMPLEMENTED`; exact lifecycle behavior must come from the generated contract and backend responses.
- security grants are backend-enforced, but HidraWEB still needs allowed/forbidden identity E2E coverage before `GAP-SEC-003` can become `VERIFIED`.
- enterprise IdP/client registration remains an external production dependency for `GAP-SEC-002`.
- realtime transport is usable, but business-domain event publishing remains `DEFERRED` under `GAP-REALTIME-001`; consumers must use query-after-reconnect until verified publishers exist.
- every frontend phase must pin its generated client/compatibility evidence to an exact HidraAPI OpenAPI artifact SHA.

---

# I. Gap record template

```markdown
## GAP-<OWNER>-<NNN> — <short name>

Status          : OPEN | PLANNED | IN_PROGRESS | IMPLEMENTED | VERIFIED | DEFERRED | NOT_REQUIRED
Priority        : P0 | P1 | P2 | P3
Backend owner   : <module/platform>
Affected phases : HWEB-...
Evidence        : <exact source/OpenAPI/test/commit evidence>
Frontend state  : <not consumed | consumed/tested evidence>
```
