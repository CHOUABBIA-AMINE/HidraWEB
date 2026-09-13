# HWEB-012 — Metering and Custody

Status: HWEB-012-04 COMPLETE / HWEB-012-05 NEXT

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

HidraAPI `0c8643c...` is a documentation-only successor of functional merge `2e6f93c...`; the merge-SHA OpenAPI artifact remains the accepted functional contract baseline for HWEB-012.

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

The accepted OpenAPI artifact publishes these request properties as optional; HidraWEB preserves that optionality and does not introduce frontend-required fields that the backend contract does not require.

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

Published status values are `OPEN`, `LOCKED`, `CALCULATED`, `APPROVED`, `CLOSED`, `REOPENED`, and `CANCELLED`. The dedicated controller exposes open/create only. It does not publish a dedicated measurement-period list/detail/update/close/reopen/approve/cancel route. HWEB-012-02 renders backend status as evidence only and exposes no frontend lifecycle state machine.

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

The accepted OpenAPI artifact publishes these request properties as optional; HidraWEB preserves that optionality and does not introduce frontend-required fields that the backend contract does not require.

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

Published ticket status values are `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `CANCELLED`, and `CLOSED`. HWEB-012-03 renders backend status as evidence only and does not derive approval, cancellation, correction, submission, review or close actions from the returned enum.

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

The accepted OpenAPI artifact publishes these request properties as optional; HWEB-012-04 preserves that optionality exactly.

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

Published discrepancy status values are `OPEN`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`, `RESOLVED`, `CLOSED`, and `CANCELLED`. The controller exposes discrepancy opening only. No dedicated reconciliation mutation, discrepancy update/resolve/close mutation, or lifecycle-action endpoint is published, so HidraWEB must not synthesize those actions.

## Authoritative read contract

HWEB-012 uses the existing generic workbench for JPA-backed custody and party resources:

```text
GET  /api/v1/workbench/{module}/resources
GET  /api/v1/workbench/{module}/{resource}?page={page}&size={size}&q={query}
GET  /api/v1/workbench/{module}/{resource}/{id}
POST /api/v1/workbench/{module}/{resource}/search
```

The frontend discovers custody/party resource names at runtime rather than maintaining a competing entity/resource catalog. Current custody persistence includes JPA-backed resources for agreements, agreement parties, transfer points, measurement periods, batches, metering/measurement snapshots, quantity calculations, transfer tickets, reconciliation, discrepancies, approval references, document references and custody catalogs.

Runtime-discovered resources used by completed HWEB-012 tasks:

- HWEB-012-02: `CustodyMeasurementPeriodJpaEntity`, `CustodyAgreementJpaEntity`, `CustodyTransferPointJpaEntity`;
- HWEB-012-03: `CustodyTransferTicketJpaEntity`, `CustodyBatchJpaEntity`, `CustodyQuantityCalculationJpaEntity` plus the HWEB-012-02 references;
- HWEB-012-04: `CustodyReconciliationJpaEntity` and `CustodyDiscrepancyJpaEntity`.

No completed HWEB-012 task hard-codes workbench resource names or invents a custody catalog.

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

`PartyResponse` exposes `id`, `code`, `legalName`, `tradeName`, `shortName`, `countryCode`, `status`, and `primaryRoleCodeSnapshot`. HWEB-012 does not register parties or assign party roles; party reads are allowed only when an explicit custody `partyId` requires display context.

### Workflow / actor references

Transfer-ticket creation accepts `issuedByActorId` and `workflowInstanceId`; discrepancy opening accepts `assignedActorId`. These are references only. HWEB-012 must not duplicate identity/workflow ownership or scan identity/workflow collections to populate them. HWEB-012-03 keeps transfer-ticket actor/workflow references optional and neutral; HWEB-012-04 keeps `assignedActorId` optional and neutral.

## Authorization

All custody and party actions resolve their permission from:

```text
GET /api/v1/security/permissions/routes
```

and intersect it with effective grants from:

```text
GET /api/v1/identity/me/permissions
```

No custody or party permission code is guessed in feature code. HidraAPI remains final authority; HTTP 403 remains authoritative even when frontend metadata appears permissive.

## Task implications

### HWEB-012-02 — measurement-period workspace — COMPLETE

Implemented `/custody` with runtime custody workbench discovery/list/detail for measurement periods, runtime custody agreement/transfer-point choices, and `POST /api/v1/custody/measurement-periods` only when the exact route descriptor and effective grant permit it. Backend period status is display-only and no lifecycle state machine is implemented.

### HWEB-012-03 — transfer-ticket workspace — COMPLETE

Implemented a local `/custody` transfer-ticket workspace tab using runtime custody reads plus `POST /api/v1/custody/transfer-tickets`. Measurement period, agreement, transfer point, batch and quantity calculation are runtime-discovered custody references; actor/workflow remain optional neutral IDs. Backend ticket status is display-only and no lifecycle actions are synthesized.

### HWEB-012-04 — discrepancy/reconciliation workspace — COMPLETE

Implemented a local `/custody` discrepancy/reconciliation workspace tab with:

- runtime workbench discovery/list/detail for `CustodyReconciliationJpaEntity` and `CustodyDiscrepancyJpaEntity`;
- reconciliation kept strictly read-only because HidraAPI publishes no reconciliation mutation semantics;
- `POST /api/v1/custody/discrepancies` as the only HWEB-012-04 mutation;
- reconciliation selector values sourced only from the runtime-discovered custody reconciliation resource;
- `discrepancyTypeId`, `quantityUnitId`, and `assignedActorId` retained as optional neutral identifiers rather than inferred through foreign-module scans;
- exact preservation of OpenAPI optional request properties;
- backend-owned reconciliation/discrepancy status rendered as evidence only;
- no reconcile, accept, reject, resolve, close, cancel, update, or status-transition actions;
- TanStack Query owning server state and React local state limited to page/selection/tab/form values;
- fail-closed handling for missing route metadata/grants/resources and authoritative backend HTTP 403.

### HWEB-012-05 — topology/telemetry/party references — NEXT

Compose only from explicit backend references and custody-owned snapshots listed above, preferably at the process boundary. Do not import foreign persistence/domain concepts, scan foreign collections to infer links, or recompute telemetry/custody truth in the frontend.

### HWEB-012-06 — conservative party scope

Party remains master-data owner. The custody process may display party context for explicit `partyId` references but must not create a competing party workspace or duplicate party mutation behavior.

## HWEB-012-04 verification evidence

```text
Backend source commit / branch : 0c8643c17b2648e8be85c658854f57ea0faab765 / main
Functional backend merge       : 2e6f93c14e330c8cc839a5de75ecc7b893f9872c
Accepted OpenAPI artifact       : 10307945855 / sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Endpoints and DTOs used         : GET workbench custody resources/list/detail; POST /api/v1/custody/discrepancies; OpenCustodyDiscrepancyRequest; CustodyDiscrepancyResponse
Permissions used                : exact workbench list/detail and custody discrepancy POST route descriptors intersected with effective grants
Frontend routes changed         : no new shell route; /custody retained with a local Discrepancies & reconciliation workspace tab
State ownership                 : TanStack Query owns custody/workbench server state; React local state owns paging/selection/tab/form only
Reference ownership             : reconciliation comes from runtime-discovered custody resources; discrepancy type, quantity unit and actor remain optional neutral IDs; no foreign-module scan
Lifecycle ownership             : reconciliation is read-only; backend discrepancy/reconciliation status is display-only; no frontend lifecycle state machine
Error states                    : missing route metadata, grant, resource and backend errors fail closed; backend HTTP 403 remains final authority
Tests added                     : tests/e2e/custody-discrepancies.spec.ts
OpenAPI regeneration status     : custody Orval slice extended mechanically from accepted artifact 10307945855 and generated in CI
Final product head              : 5e5f4847d40c5e56f587287cf45b580cc6b409db
Exact-head CI                   : 34742505269 — SUCCESS
Product PR                      : #52
Product merge                   : 73dfd6d51ba11521a0c4b6c18dfbcd1d0260085b
Post-merge main CI              : 34742632806 — SUCCESS
Known backend gaps              : reconciliation mutations and discrepancy update/resolve/close/lifecycle actions remain unpublished and must not be invented
Conclusion                      : HWEB-012-04 VERIFIED; HWEB-012-05 is next; no later HWEB-012 task started
```

## HWEB-012-03 verification evidence

```text
Final product head              : 5883bf53c6e54e7a7d1855996715fe67db32ceb7
Corrected exact-head CI         : 34739586694 — SUCCESS
Product PR                      : #50
Product merge                   : b102ddd417093d72f78eed78ec375c8999b929f3
Post-merge main CI              : 34739711610 — SUCCESS
Tests added                     : tests/e2e/custody-transfer-tickets.spec.ts
OpenAPI artifact                : 10307945855 / sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Conclusion                      : HWEB-012-03 VERIFIED
```

## HWEB-012-02 verification evidence

```text
Final product head              : a1b947647b3767446c7ffe2bc7bfc6bb2993e9e2
Exact-head CI                   : 34727349054 — SUCCESS
Product merge                   : 30edf16df7368ddf27816eb9d648bce48f8d021a
Post-merge main CI              : 34727482132 — SUCCESS
Tests added                     : tests/e2e/custody-measurement-periods.spec.ts
OpenAPI artifact                : 10307945855 / sha256:20b15395d1b2feec853167e88b2b6357650f51c03fb7811ffe60fd1362544c7f
Conclusion                      : HWEB-012-02 VERIFIED
```

## HWEB-012-01 verification evidence

```text
Inventory branch head           : da7e9e1ac70fe97addc3112c7d35a40510520d31
Exact-head CI                   : 34726354087 — SUCCESS
Product PR                      : #47
Product merge                   : e9a83055044d45d97f23c54e36bcb21e181e672d
Post-merge main CI              : 34726477598 — SUCCESS
Conclusion                      : HWEB-012-01 inventory accepted
```
