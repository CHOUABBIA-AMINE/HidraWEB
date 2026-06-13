# 04 — Frontend Micro Architecture

## Folder structure

```text
src/
  app/
    App.tsx
    router/
    providers/
    layout/
  features/
    topology/
      api/
      queries/
      pages/
      components/
      forms/
      schemas/
      routes.ts
    monitoring/
    ... one folder per HidraAPI module ...
  shared/
    api/
    auth/
    components/
    errors/
    i18n/
    realtime/
    theme/
    utils/
```

## Naming conventions

- Pages: `TopologyMapPage`, `RiskWorkbenchPage`.
- Components: noun-based, no `Base` dumping ground.
- Hooks: `useTopologyLayersQuery`, `useSearchOperationalResourceMutation`.
- API clients: `topologyApi.getMapLayers`, `workbenchApi.searchResource`.
- Schemas: `CreateLeakCandidateSchema`.

## API service conventions

- Use Axios instance with JWT interceptor.
- No component may call Axios directly.
- Every client method references one API catalog row.
- Server error payloads are normalized to a shared `HidraApiError`.

## Query conventions

- Query keys must include module, resource, filters and organization scope.
- Mutations must invalidate affected resource keys.
- Realtime events may invalidate queries by module/resource.

## Form conventions

- React Hook Form + Zod only.
- Request DTOs drive form models.
- Undefined backend field semantics must remain marked as unknown.

## Error handling conventions

- 401/403: auth/session guard.
- 404: not-found workbench/detail state.
- 409/422: form/workflow decision error.
- 5xx: operational error banner with retry.
