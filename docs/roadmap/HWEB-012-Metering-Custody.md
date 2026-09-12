# HWEB-012 — Metering and Custody

Status: HWEB-012-01 COMPLETE / HWEB-012-02 NEXT

## Accepted baseline

```text
HidraWEB phase base          : 9267786dcedfac31b0bdb60c53285cdeb187acb9
HidraAPI audited main        : 0c8643c17b2648e8be85c658854f57ea0faab765
Functional backend merge     : 2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Accepted OpenAPI artifact    : hidra-api-openapi-2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Artifact id                  : 10307945855
Artifact digest              : sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Backend owners               : custody; party only where evidenced
```

HidraAPI `0c8643c...` is a documentation-only successor of functional merge `2e6f93c...`; the merge-SHA OpenAPI artifact therefore remains the accepted functional contract baseline for HWEB-012-01.

## HWEB-012 ownership rule

Custody owns official accepted transfer facts: transfer points, agreements, agreement-party references, measurement periods, batches, metering snapshots, accepted measurement snapshots, quantity calculations, quality evidence, transfer tickets, reconciliation, discrepancies, approval references and custody document references.

Custody does not own telemetry readings, telemetry points, topology assets, party master data, workflow tasks, planning facts, finance/ERP facts or document binaries. Cross-module composition must use backend-published neutral identifiers and custody-owned snapshots only.

Party owns external legal-entity/counterparty master data. Custody may keep `partyId`, role identifiers and immutable party snapshots in custody agreement records, but HidraWEB must not treat custody snapshots as party-master truth or mutate party data from the custody process.

## Dedicated custody REST contract

`GET /api/v1/custody/capabilities` publishes the three current resource-oriented mutations:

```text
POST /api/v1/custody/measurement-periods
POST /api/v1/custody/transfer-tickets
POST /api/v1/custody/discrepancies
```

Legacy aliases also exist. HWEB-012 must prefer the resource-oriented routes.

### Measurement period

Request `OpenCustodyMeasurementPeriodRequest`:

```text
periodCode
agreementId
transferPointId
periodStart
periodEnd
```

Response `CustodyMeasurementPeriodResponse`:

```text
id
periodCode
agreementId
transferPointId
periodStart
periodEnd
status
```

The dedicated controller exposes open/create only. It does not publish a dedicated measurement-period list/detail/update/close route.

### Transfer ticket

Request `CreateCustodyTransferTicketRequest`:

```text
ticketNumber
measurementPeriodId
agreementId
transferPointId
batchId
quantityCalculationId
ticketDate
issuedByActorId
workflowInstanceId
```

Response `CustodyTransferTicketResponse`:

```text
id
ticketNumber
measurementPeriodId
agreementId
transferPointId
status
ticketDate
approvedAt
```

The route records neutral references to the selected custody period/agreement/transfer point/batch/quantity calculation and a workflow-instance reference. HidraWEB must not derive ticket lifecycle transitions from the returned status enum.

### Discrepancy

Request `OpenCustodyDiscrepancyRequest`:

```text
discrepancyNumber
reconciliationId
discrepancyTypeId
differenceQuantity
quantityUnitId
description
assignedActorId
openedAt
```

Response `CustodyDiscrepancyResponse`:

```text
id
discrepancyNumber
reconciliationId
discrepancyTypeId
status
differenceQuantity
openedAt
```

The controller exposes discrepancy opening only. No dedicated reconciliation mutation, discrepancy update/resolve/close mutation, or lifecycle-action endpoint is currently published.

## Authoritative read contract

HWEB-012 may use the existing generic workbench for JPA-backed custody and party resources:

```text
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

The frontend must discover custody/party resource names at runtime rather than maintain a competing entity/resource catalog. Current custody persistence includes JPA-backed resources for agreements, agreement parties, transfer points, measurement periods, batches, metering/measurement snapshots, quantity calculations, transfer tickets, reconciliation, discrepancies, approval references, document references and custody catalogs.

This generic read contract is sufficient to start HWEB-012-02 without inventing a custody-specific list/detail API.

## Cross-module evidence

### Topology

`CustodyTransferPoint` publishes:

```text
topologyAssetTypeCode
topologyAssetId
topologyAssetCodeSnapshot
topologyAssetNameSnapshot
measurementLocationId
```

HWEB-012 may use those explicit references/snapshots. It must not scan topology collections to infer a relationship.

### Telemetry

`CustodyMeasurementSnapshot` publishes:

```text
telemetryReadingReferenceId
telemetryPointReferenceId
observedValue
observedUnitId
standardValue
standardUnitId
measuredAt
acceptedForCustody
qualityFlagSnapshot
```

Telemetry remains owner of raw/trusted reading truth. Custody owns the accepted snapshot/evidence used for official transfer decisions. HidraWEB must not recompute custody acceptance from live telemetry.

### Party

`CustodyAgreementParty` stores a neutral `partyId` plus custody-owned party snapshots/role references. Party remains owner of legal/counterparty master data.

The dedicated party controller currently publishes only:

```text
GET  /api/v1/party/capabilities
POST /api/v1/party/parties
POST /api/v1/party/roles/assignments
```

`PartyResponse` exposes `id`, `code`, `legalName`, `tradeName`, `shortName`, `countryCode`, `status`, and `primaryRoleCodeSnapshot`. HWEB-012 does not need to register parties or assign party roles; party reads should be runtime workbench reads only when an explicit custody `partyId` requires display context.

### Workflow / actor references

Transfer-ticket creation accepts `issuedByActorId` and `workflowInstanceId`; discrepancy opening accepts `assignedActorId`. These are references only. HWEB-012 must not duplicate identity/workflow ownership or infer workflow actions from custody status values.

## Authorization

All custody and party actions must resolve their permission from:

```text
GET /api/v1/security/permissions/routes
```

and intersect it with effective grants from:

```text
GET /api/v1/identity/me/permissions
```

No custody or party permission code may be guessed in feature code. HidraAPI remains final authority; HTTP 403 must remain authoritative even when frontend metadata appears permissive.

## Task implications

### HWEB-012-02 — measurement-period workspace — NEXT

Legal implementation surface:

- runtime custody workbench discovery/list/detail;
- `POST /api/v1/custody/measurement-periods` when the exact route descriptor and effective grant allow it;
- display backend period status only; no frontend period lifecycle state machine;
- agreement and transfer-point IDs are backend-owned references and should be selected/displayed from discovered custody resources rather than invented catalogs.

No backend gap blocks this task.

### HWEB-012-03 — transfer-ticket workspace

Use runtime custody reads plus `POST /api/v1/custody/transfer-tickets`. Do not synthesize approval, cancellation, correction or status-transition actions.

### HWEB-012-04 — discrepancy/reconciliation workspace

Runtime workbench can support reconciliation/discrepancy reads and the dedicated discrepancy-open command. Reconciliation mutation semantics are not published; any future write/action requirement beyond discrepancy opening must become an explicit backend gap before implementation.

### HWEB-012-05 — topology/telemetry/party references

Compose only from explicit backend references listed above, preferably at the process boundary. Do not import foreign feature persistence/domain concepts or scan foreign collections to infer links.

### HWEB-012-06 — conservative party scope

Party remains master-data owner. The custody process may display party context for explicit `partyId` references but must not create a competing party workspace or duplicate party mutation behavior.

## HWEB-012-01 verification evidence

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Endpoints and DTOs used         : custody capabilities; POST measurement-periods; POST transfer-tickets; POST discrepancies; party capabilities; POST parties; POST role assignments; generic workbench discovery/list/detail/search
Permissions used                : runtime route descriptors + effective grants only; no hard-coded permission assumptions
Frontend routes changed         : none
State ownership                 : documented only; TanStack Query will own server state, React local state only selection/forms/paging
Error states                    : no UI change in inventory task; later tasks must fail closed on missing route descriptors/grants and preserve backend 403
Tests added                     : none; documentation-only inventory
OpenAPI regeneration status     : no frontend client regeneration required for inventory; accepted backend artifact 10307945855 retained
Known backend gaps              : no blocker for HWEB-012-02; reconciliation writes/lifecycle actions are absent and must not be invented
Conclusion                      : HWEB-012-01 inventory accepted; HWEB-012-02 is next; no later HWEB-012 task started
```
