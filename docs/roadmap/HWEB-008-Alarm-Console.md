# HWEB-008 — Alarm Console

```text
Status             : COMPLETE — branch verified pending merge
Frontend repository: CHOUABBIA-AMINE/HidraWEB
Backend source     : CHOUABBIA-AMINE/HidraAPI main
Backend baseline   : af4c3b4723619a25dd9a94f4d27f5a36adab982e
OpenAPI artifact   : hidra-api-openapi-af4c3b4723619a25dd9a94f4d27f5a36adab982e
Artifact digest    : sha256:64a187d362725d7cfd674f5f130d1345f97f88e9151e65d4d5d29d74e76d932a
Frontend branch    : hweb-008-alarm-workspace
Verified HEAD      : 4e9e308c219b23fa5e93e1b4a2fa27e774017276
Verified CI run    : 34613930912
```

## Scope delivered

HWEB-008 implements the backend-governed operator alarm console at `/alarms`. The workspace covers active/history queries, filtering, bounded paging, alarm detail, shelving history, acknowledgement, closure, shelving and unshelving. It does not maintain a client-side alarm state machine and does not infer whether a lifecycle action is valid for a particular alarm; HidraAPI remains authoritative and may accept or reject every command.

The console uses TanStack Query for alarm server state. React local state owns active/history selection, query filters, page selection, selected alarm, and command form input. Successful mutations invalidate the alarm query family and reload authoritative backend state.

## Accepted contract

### Queries

```text
GET /api/v1/alarm/alarms
GET /api/v1/alarm/alarms/{id}
GET /api/v1/alarm/alarms/{id}/shelvings
```

`GET /api/v1/alarm/alarms` supports the accepted query parameters:

```text
view              default active
state             optional
severityId        optional
topologyAssetId   optional
from              optional date-time
to                optional date-time
page              default 0
size              default 50
```

The frontend consumes the published `PageAlarmView`, `AlarmView`, and `ShelvingView` shapes and preserves Springdoc optionality at the UI boundary.

### Operator commands

```text
POST /api/v1/alarm/alarms/acknowledgements
POST /api/v1/alarm/alarms/closures
POST /api/v1/alarm/alarms/{id}/shelvings
POST /api/v1/alarm/alarms/{id}/shelvings/{shelvingId}/unshelve
```

The generated/request boundary uses `AcknowledgeAlarmRequest`, `CloseAlarmRequest`, and `ShelveAlarmRequest`. The frontend does not use legacy alias routes and does not expose the backend raise-alarm command as part of this operator response console.

## Authorization

Canonical route-derived permissions are:

```text
alarm:alarms:read
alarm:alarms:execute
```

Read permission controls console/data visibility. Execute permission controls acknowledgement, closure, shelving, and unshelving controls. HidraAPI remains the final authorization boundary.

A shared pending-state guard disables all alarm mutation controls while one alarm command is in flight, preventing the UI from issuing concurrent lifecycle commands from the same selected-alarm workspace.

## State and severity semantics

The verified backend `AlarmState` values are:

```text
RAISED
ACTIVE
ACKNOWLEDGED
SHELVED
SUPPRESSED
CLEARED
CLOSED
ESCALATED
CANCELLED
```

HidraWeb may present these known state values semantically, but it does not implement transition rules between them.

`severityId` is intentionally treated as opaque backend configuration data. The accepted artifact does not expose a severity reference-catalog query for this phase, so HidraWeb does not invent severity labels, rankings, thresholds, or business colors.

The accepted closure types are:

```text
NORMALIZED
FALSE_ALARM
DUPLICATE
MAINTENANCE
CANCELLED
ESCALATED_TO_INCIDENT
```

## Cross-context navigation

`AlarmView` exposes backend topology linkage fields and an optional `workflowInstanceId`. HWEB-008 displays those references and offers generic navigation to the existing `/network` and `/work/tasks` workspaces. It does not invent topology feature deep links or workflow-instance routes that are not part of the accepted frontend contract.

## Deliberate backend gaps

### Alarm suppression — reconciled 2026-10-02

The backend gap is now CLOSED. Verified HidraAPI CI #451 / run `36996917162` published artifact `hidra-api-openapi-5028a90248ddf3a04d344308f6cfc2510f1d0ca2` with digest `sha256:ad6950fc33d4756d59bed3c2162bdcee0d98275bb25c4678faf5dcb31ea3dbed`.

HidraWeb consumes `GET /api/v1/alarm/suppressions`, `GET /api/v1/alarm/suppressions/{suppressionId}`, `POST /api/v1/alarm/suppressions`, and `POST /api/v1/alarm/suppressions/{suppressionId}/release`. The operator console exposes ALARM-scoped history, creation, and release for the selected alarm. Broad-scope matching, restoration state, expiry, overlap detection, Workflow approval interpretation, and actor attribution remain backend-owned.

Canonical permissions are `alarm:suppressions:read` and `alarm:suppressions:execute`. Open-ended requests may carry `workflowInstanceId`; HidraAPI remains authoritative for approval validation.

### Trusted actor attribution for acknowledgement and closure

Shelving and unshelving resolve the actor server-side through `CurrentActorResolver`. By contrast, the accepted acknowledgement and closure requests contain actor-reference fields supplied by the client, and backend source verification does not establish server-side replacement or validation against the authenticated principal before persistence.

HWEB-008 sends only the exact accepted request contract and explicitly warns that acknowledgement/closure actor attribution is client-supplied. It does not claim that those values are trusted server-derived identity. A backend hardening gap remains until HidraAPI derives or validates those actor references from the authenticated principal.

## Realtime posture

Alarm realtime business-event publication remains under `GAP-REALTIME-001`. Realtime transport exists, but no verified alarm domain publisher/event-family contract is available. HWEB-008 is therefore query/refetch correct and does not invent alarm event names, destinations, payloads, ordering, replay, or recovery behavior.

## Verification coverage

HWEB-008 adds:

- artifact-derived alarm OpenAPI slice and Orval generation in CI;
- API-boundary tests for every consumed canonical alarm route;
- component coverage for read/execute and read-only authorization cases;
- shell navigation coverage for the alarm capability;
- browser coverage for active alarm presentation, detail, shelving, exact acknowledgement POST, absence of suppression semantics, realtime-deferred messaging, and the shared mutation concurrency guard;
- production lint, TypeScript, build, and complete regression suites through the repository CI gate.

Final branch evidence at `4e9e308c219b23fa5e93e1b4a2fa27e774017276`, CI run `34613930912`:

```text
Alarm OpenAPI generation : PASS
Lint                     : PASS
Typecheck                : PASS
Unit/component tests     : 20/20 PASS
Production build         : PASS
Playwright E2E           : 13/13 PASS
```

## Exit decision

HWEB-008 remains complete after the 2026-10-02 suppression reconciliation. The console now consumes backend-governed suppression read/create/release contracts with separate permissions and no client-side lifecycle semantics. Alarm realtime domain events remain deferred; the console therefore remains query/refetch correct.


## Post-completion suppression reconciliation — 2026-10-02

Frontend baseline before change: `9d9903c398c516a597e9a5fd648af77742099a7f`.

Backend source of truth: HidraAPI `5028a90248ddf3a04d344308f6cfc2510f1d0ca2`, CI #451 / run `36996917162` SUCCESS, artifact `hidra-api-openapi-5028a90248ddf3a04d344308f6cfc2510f1d0ca2`, digest `sha256:ad6950fc33d4756d59bed3c2162bdcee0d98275bb25c4678faf5dcb31ea3dbed`.

The Alarm Orval input is repinned to the verified suppression-capable contract. Successful create/release invalidates the Alarm query family so visible state is re-read from HidraAPI rather than predicted locally. Broad-scope suppression remains a backend generation/evaluation concern and is not reimplemented in the browser.
