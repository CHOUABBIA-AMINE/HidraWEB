# 03 — Frontend Macro Architecture

## Application shell

HidraWeb shall use a stable enterprise shell:

- Top bar: environment, organization scope, language switcher, user profile, notification center.
- Left navigation: dynamic menu generated from permission catalog and persona rules.
- Main workspace: dashboard/workbench/map/detail/workflow pages.
- Right panel: contextual actions, active filters, realtime events and help.

## Feature modules

One frontend feature folder shall exist per HidraAPI module:

`alarm`, `analytics`, `assets`, `audit`, `configuration`, `custody`, `documents`, `hse`, `identity`, `incident`, `integration`, `integrity`, `leakdetection`, `monitoring`, `notification`, `organization`, `party`, `planning`, `reporting`, `risk`, `simulation`, `telemetry`, `topology`, `workflow`

Each feature module may contain screens, API clients, query hooks, mappers, Zod schemas, page components and route registrations. Shared components must remain generic and business-free.

## Navigation structure

Use four top-level groups: Foundation, Operations, Decision Support, Governance and Administration. Menu visibility is driven by role/persona and derived permissions.

## Routing strategy

React Router shall own routes. Route objects must include:

- path;
- page component;
- required permissions;
- breadcrumb metadata;
- module owner;
- query prefetch strategy.

## State ownership

- Server state: TanStack Query.
- Session/security state: Auth provider + small context.
- UI state: local state or route/search params.
- Forms: React Hook Form + Zod.
- Realtime state: event adapters feeding query invalidation and notification center.

## Topology capabilities

Topology shall use Leaflet or a compatible enterprise GIS library with layer control, GeoJSON rendering, popups, feature search, filters and realtime overlays.

## Notification architecture

Notifications are consumed from REST workbench data, `/api/v1/realtime/sse`, and STOMP topics when enabled. UI must be resilient when realtime is unavailable.
