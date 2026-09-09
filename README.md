# HidraWEB

Hydrocarbon Intelligence for Data, Risk, and Analytics — Web Application.

HidraWEB is the operational enterprise frontend for HidraAPI.

## Canonical architecture

The implementation is governed by:

1. [`docs/architecture/HidraWeb-Information-Architecture.md`](docs/architecture/HidraWeb-Information-Architecture.md)
2. [`docs/architecture/Hidra-API-Web-Contract-v1.md`](docs/architecture/Hidra-API-Web-Contract-v1.md)
3. [`docs/architecture/HidraWeb-Technical-Architecture.md`](docs/architecture/HidraWeb-Technical-Architecture.md)

If another document conflicts with those files, the canonical architecture wins.

## HWEB-001 bootstrap

The executable frontend foundation is being implemented on `hweb-001-bootstrap`.

Technology baseline:

```text
React + TypeScript
Vite
React Router
TanStack Query
Zustand
React Hook Form + Zod
MUI
MapLibre GL JS (behind HidraMap abstraction)
ECharts
i18next
Orval from HidraAPI OpenAPI
Vitest + React Testing Library
MSW
Playwright
```

Node baseline: **24 LTS**.

### Local bootstrap

```bash
cp .env.example .env.local
npm install
npm run verify
npm run dev
```

HidraAPI development CORS currently allows `http://localhost:5173`, and the default development authentication mode is Basic.

OpenAPI generation requires a running/reachable HidraAPI:

```bash
npm run api:generate
```

Default OpenAPI source:

```text
http://localhost:8080/v3/api-docs
```

Generated API files belong only under `src/api/generated/` and must not contain handwritten business logic.

## Development roadmap

- [`docs/roadmap/HWEB-001-Bootstrap.md`](docs/roadmap/HWEB-001-Bootstrap.md)
- [`docs/roadmap/HidraWeb-Development-Roadmap.md`](docs/roadmap/HidraWeb-Development-Roadmap.md)

## Source-of-truth rule

`CHOUABBIA-AMINE/HidraAPI` is the source of backend truth.

HidraWEB must not invent unsupported backend entities, workflow states, permissions, endpoints or business rules. Missing capabilities are documented as explicit gaps/targets before implementation.
