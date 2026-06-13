# 20 — Definition of Done

## Functionality

- Screen uses only APIs present in the API catalog or documented as a gap.
- All data fetching uses TanStack Query.
- All forms use React Hook Form + Zod.
- All module pages support French labels and Arabic readiness.

## Security

- Route guard implemented.
- Menu guard implemented.
- Action guard implemented.
- Token expiry and 401/403 handling verified.

## UX

- Loading, empty, error and success states implemented.
- Tables support pagination/search/filter as appropriate.
- Critical actions require confirmation.
- Accessibility checks pass for keyboard and contrast.

## Code quality

- TypeScript strict pass.
- Unit tests for services/hooks/components.
- No raw Axios calls in components.
- No hard-coded backend assumptions.

## Operational acceptance

- Control room operator can reach dashboard, topology, monitoring and alarms within two navigation levels.
- Field supervisor can find assigned resources and incidents quickly.
- Validator can locate pending workflow tasks when backend metadata supports it.
