# 17 — State Management Strategy

## Server state

TanStack Query owns all server data: workbench resources, topology layers, permissions, notifications, dashboard metrics and detail records.

## Session state

Auth context owns token/session metadata, active user claims, language and organization scope.

## UI state

Local React state or URL search parameters own drawers, tab selection, filters and density.

## Form state

React Hook Form owns form input state; Zod owns validation.

## Realtime state

SSE/STOMP adapters shall not mutate complex global stores directly. They publish events that trigger notification center updates and TanStack Query invalidation.

## Cache key contract

```text
['workbench', module, resource, filters, page, size, organizationScope]
['topology', 'layers']
['topology', 'geojson', layers, filters]
['security', 'permission-catalog']
['realtime', 'capabilities']
```
