# HidraAPI ↔ HidraWEB Backend Gap Register

```text
Document role          : Living backend-contract gap register for HidraWEB delivery
Frontend repository    : CHOUABBIA-AMINE/HidraWEB
Backend source of truth: CHOUABBIA-AMINE/HidraAPI main
Initial backend commit : f8853fb17b17ff08baf16c4abdfdc810fcbaf01d
Last reconciled commit : e5385f0e1f8bb88b48c8e1368962ef72ec6922ae
Last reconciled branch : main
Reconciled             : 2026-09-11
Update policy          : Update at the start and completion of every HWEB phase
Owner model            : HidraAPI owns business/security truth; HidraWEB records consumer gaps and verification evidence
```

## Purpose

This is the canonical frontend-facing acceptance register for HidraAPI capabilities required by HidraWEB. A frontend phase must reconcile these entries against current backend source and current generated OpenAPI before implementation. HidraWEB must not invent endpoints, DTO fields, authorization rules, workflow actions, topology layers, telemetry semantics, alarm states, or organization relationships.

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

## 2026-09-11 reconciliation at HidraAPI `e5385f0e…`

The previous register was stale after backend remediation PRs #51 and #52. Current-source reconciliation found:

- PR #51 topology and identity remediation compiled and passed backend CI before merge.
- Current HidraAPI `main` is `e5385f0e1f8bb88b48c8e1368962ef72ec6922ae`.
- Current `main` does **not** pass backend compilation: `WorkflowQueryController` references missing `HidraEffectivePermissionResolver`. Therefore workflow remediation remains `IN_PROGRESS`, and current `main` cannot produce a trustworthy fresh runtime OpenAPI document.
- HidraAPI CI still does not publish a deterministic versioned OpenAPI artifact. `GAP-CONTRACT-001` remains `OPEN`.
- HWEB-005 therefore uses a clearly marked **temporary source-pinned topology OpenAPI snapshot** reconciled from the exact current topology controller/use-case/adapter source. It must be retired when `GAP-CONTRACT-001` is resolved.
- Backend permission metadata remains explicitly catalog-only. HidraWEB may use it for capability-aware UX, but HidraAPI remains the final authorization boundary.

---

# A. Cross-cutting gaps

## GAP-SEC-001 — Authenticated principal endpoint

```text
Status          : IMPLEMENTED
Priority        : P1 now / P0 before production
Backend owner   : platform security / identity
Affected phases : HWEB-002, HWEB-004, HWEB-007, HWEB-014, HWEB-015
Evidence        : PR #51 added GET /api/v1/identity/me and GET /api/v1/identity/me/permissions.
Frontend state  : Not yet consumed as the canonical shell principal contract.
```

## GAP-SEC-002 — Enterprise OIDC/JWT token acquisition contract

```text
Status          : OPEN
Priority        : P0 before production
Backend owner   : platform security / deployment architecture
Affected phases : HWEB-002, HWEB-015
Evidence        : HidraAPI remains a JWT resource server outside development; browser IdP authority/client/PKCE/session lifecycle is environment-owned and not frozen in repository contracts.
```

## GAP-SEC-003 — User-specific/effective authorization grants

```text
Status          : IN_PROGRESS
Priority        : P0 before production / P1 for authorization-sensitive UX
Backend owner   : platform security / identity
Affected phases : HWEB-002 onward
Evidence        : Route permission catalog still states catalog-only enforcement. Current workflow remediation references HidraEffectivePermissionResolver, but that type is missing and current main does not compile.
```

Required completion evidence remains backend-enforced denials plus a principal-specific effective-grants contract proven by frontend E2E against allowed and forbidden identities.

## GAP-CONTRACT-001 — Stable repository-published OpenAPI compatibility artifact

```text
Status          : OPEN
Priority        : P1 development / P0 release automation
Backend owner   : platform / API governance
Affected phases : HWEB-003 through HWEB-015
Evidence        : HidraAPI CI compiles/tests/verifies but does not publish deterministic versioned OpenAPI for HidraWEB consumption.
```

Until resolved, any source-pinned snapshot must name the exact HidraAPI SHA and be documented as temporary.

## GAP-REALTIME-001 — Realtime domain-event destination and payload catalog

```text
Status          : OPEN
Priority        : P1 for HWEB-006/HWEB-008
Backend owner   : platform realtime + publishing business modules
Affected phases : HWEB-006, HWEB-007, HWEB-008, HWEB-009, HWEB-014
Evidence        : STOMP transport exists, but a verified business event destination/payload/version/authorization catalog is still absent.
```

---

# B. HWEB-004 identity and organization gaps

## GAP-ID-001 — Identity dedicated read/query APIs

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : identity
Affected phases : HWEB-004, HWEB-014
Evidence        : PR #51 added dedicated identity user/role/permission query endpoints.
Frontend state  : HWEB-004 remains on its previously verified workbench-read fallback and has not regenerated/consumed these dedicated reads.
```

## GAP-ID-002 — Role and permission administration mutations

```text
Status          : IMPLEMENTED
Priority        : P2 until HWEB-014
Backend owner   : identity
Affected phases : HWEB-004, HWEB-014
Evidence        : PR #51 added role/permission creation and user-role/role-permission/user-permission grant commands.
Frontend state  : Not consumed by HWEB-004; do not mark VERIFIED until frontend administration uses and tests the exact commands.
```

## GAP-ORG-001 — Dedicated organization read/query APIs

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : organization
Affected phases : HWEB-004, HWEB-007, HWEB-009, HWEB-011, HWEB-014
Evidence        : PR #52 added organization query controller/use-case/adapter source.
Caveat          : Current backend main is globally compile-red because of workflow remediation; frontend has not consumed these dedicated organization reads.
```

---

# C. HWEB-005 topology contract

## GAP-TOPO-001 — Strongly typed topology map contract

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : topology
Affected phase  : HWEB-005
Evidence        : TopologyMapVisualizationUseCase publishes LayerDescriptor, Geometry variants, FeatureProperties, Feature, FeatureCollection and SearchResult records. TopologyMapController returns these typed contracts.
Frontend gate   : Promote to VERIFIED only after HWEB-005 Orval generation, consumption and frontend tests pass.
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
Evidence        : JpaTopologyMapVisualizationAdapter now publishes six backend-owned layers: pipeline-systems, pipelines, facilities, topology-nodes, pipeline-segments, topology-connections.
Frontend gate   : HWEB-005 must render only layer descriptors returned by the backend; no frontend layer invention.
```

## GAP-TOPO-003 — Count-aware topology feature paging

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : topology
Affected phase  : HWEB-005
Evidence        : FeatureCollection/SearchResult expose page, size, totalFeatures, totalPages and hasNext; backend remediation applies filtering before the returned slice.
Frontend gate   : HWEB-005 must expose loaded/total observability and test the contract before VERIFIED.
```

---

# D. HWEB-006 telemetry and monitoring gaps

## GAP-TEL-001 — Telemetry reading/history/trend query contract

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : telemetry
Affected phase  : HWEB-006
Evidence        : PR #52 added telemetry query controller/use-case/adapter source.
Caveat          : Not consumed by HidraWEB; current backend main is globally compile-red. Re-audit exact DTO/OpenAPI before HWEB-006.
```

## GAP-TEL-002 — Telemetry quality/state catalog contract

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : telemetry
Affected phase  : HWEB-006
Evidence        : PR #52 telemetry remediation includes frontend-facing query/projection source.
Caveat          : Exact quality/state semantics must be re-read from the final compiling backend/OpenAPI before HWEB-006; never hard-code SCADA quality semantics.
```

## GAP-MON-001 — Monitoring rules/deviations read/query APIs

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : monitoring
Affected phase  : HWEB-006
Evidence        : PR #52 added monitoring query controller/use-case/adapter source.
Caveat          : Not yet consumed or frontend-verified; re-audit final compiling backend before HWEB-006.
```

---

# E. HWEB-007 workflow gaps

## GAP-WF-001 — Task inbox/query API

```text
Status          : IN_PROGRESS
Priority        : P1
Backend owner   : workflow
Affected phase  : HWEB-007
Evidence        : PR #52 added workflow query source, but WorkflowQueryController currently references missing HidraEffectivePermissionResolver and breaks compilation.
```

## GAP-WF-002 — Workflow instance/task timeline and history query

```text
Status          : IN_PROGRESS
Priority        : P1
Backend owner   : workflow
Affected phases : HWEB-007, HWEB-008, HWEB-009, HWEB-010, HWEB-011
Evidence        : Workflow query remediation exists in source but is not buildable on current main.
```

## GAP-WF-003 — Backend-provided available actions / transition metadata

```text
Status          : IN_PROGRESS
Priority        : P1
Backend owner   : workflow
Affected phases : HWEB-007 onward
Evidence        : Workflow remediation is tied to incomplete effective-permission infrastructure; do not infer available actions in HidraWEB.
```

---

# F. HWEB-008 alarm gaps

## GAP-ALARM-001 — Active alarm/history/detail query APIs

```text
Status          : IMPLEMENTED
Priority        : P1
Backend owner   : alarm
Affected phase  : HWEB-008
Evidence        : PR #52 added alarm query controller/use-case/adapter source.
Caveat          : Not consumed by HidraWEB; re-audit exact states, filters and DTOs from a compiling backend before HWEB-008.
```

## GAP-ALARM-002 — Alarm shelving/suppression contract

```text
Status          : IMPLEMENTED
Priority        : P2
Backend owner   : alarm
Affected phase  : HWEB-008
Evidence        : PR #52 added alarm shelving command/service remediation source.
Caveat          : Do not infer shelving/suppression lifecycle semantics until final backend tests/OpenAPI and HWEB-008 consumption prove them.
```

---

# G. Later phase inspection policy

HWEB-009 through HWEB-015 must continue current-source inventory before implementation. New gaps discovered for incidents/leak/HSE, planning, integrity/assets, custody/party, analytics/simulation/reporting, configuration/audit/documents/integrations, or production hardening must be added here with exact backend SHA and evidence. Do not assume a later phase is ready because an older catalog mentions an endpoint.

---

# H. HWEB-005 readiness decision

At backend source commit `e5385f0e1f8bb88b48c8e1368962ef72ec6922ae`, the **topology slice itself is ready for constrained HWEB-005 consumption** because PR #51 passed backend CI and current topology source publishes typed six-layer GeoJSON/search/count-aware contracts. HWEB-005 may proceed using only those contracts.

The following constraints remain mandatory:

- `GAP-CONTRACT-001` is still `OPEN`; use the source-pinned snapshot only as a documented temporary exception.
- `GAP-SEC-003` is `IN_PROGRESS`; frontend permission checks are capability UX only, never security authority.
- current HidraAPI `main` is compile-red due workflow remediation; this blocks claiming global backend readiness but does not erase the previously green topology slice.
- HWEB-006 must not start from this HWEB-005 readiness decision.

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
