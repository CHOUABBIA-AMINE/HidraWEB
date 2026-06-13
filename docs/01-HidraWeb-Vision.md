# 01 — HidraWeb Vision Document

## Why HidraWeb exists

HidraWeb exists to transform HidraAPI capabilities into a clear, reliable and efficient operational user experience for SONATRACH users managing oil and gas transportation networks.

## Business objectives

- Provide one operational interface for topology, monitoring, alarms, leak detection, integrity, risk, HSE, workflow, analytics and reporting.
- Reduce navigation depth and training effort for control-room and field users.
- Provide consistent decision-support patterns across modules.
- Support French and Arabic enterprise usage from the start.
- Keep frontend composition aligned with backend contracts.

## Problems solved

- Fragmented operational views across topology, monitoring, risk and incident data.
- Poor discoverability of backend capabilities by frontend teams.
- Inconsistent forms, tables and action patterns across teams.
- Manual frontend assumptions about permissions, DTOs and workflows.

## Success criteria

- 100% of implemented frontend API calls are present in the API catalog.
- No screen is implemented without a source capability, endpoint, or explicit gap note.
- Dynamic menus are derived from permissions and personas.
- Topology map renders supported backend layers and exposes unavailable layers as gaps.
- All operational errors are normalized through the ProblemDetail error contract.

## Non-goals

- HidraWeb shall not redefine HidraAPI DTOs.
- HidraWeb shall not invent workflows, permissions or entities.
- HidraWeb shall not implement a local authentication provider if JWT is issued by an enterprise IdP.

## Relationship with HidraAPI

HidraAPI owns business truth, security contracts, route metadata, topology geometry, notification/realtime contracts and data models. HidraWeb owns presentation, UX composition, query caching, forms, route guards, menu guards and operational feedback.
