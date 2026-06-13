# 16 — Frontend Coding Standards

## Core rules

- TypeScript strict mode is mandatory.
- No component may call Axios directly.
- Use TanStack Query for server state.
- Use React Hook Form + Zod for forms.
- Use React Router route objects with permission metadata.
- Use module feature folders aligned with HidraAPI module names.
- Do not invent DTO fields.
- Do not hard-code permissions outside the generated permission registry.

## Component rules

- Business pages live under `features/<module>/pages`.
- Reusable business-free components live under `shared/components`.
- Avoid prop drilling across shell boundaries; use composition.

## Hook rules

- Query hooks are named `use<Thing>Query`.
- Mutation hooks are named `use<Action>Mutation`.
- Hooks must not create raw URLs; URLs live in API service files.

## Error rules

- All API errors pass through `normalizeProblemDetail`.
- Fatal operational errors show blocking banners.
- Validation errors bind to form fields when possible.
