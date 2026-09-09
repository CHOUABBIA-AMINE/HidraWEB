# HWEB-001 — Bootstrap HidraWeb React + TypeScript Application

```text
Task          : HWEB-001
Repository    : HidraWEB
Source truth  : CHOUABBIA-AMINE/HidraAPI main
Architecture  : docs/architecture/*
Status        : IN PROGRESS
Branch        : hweb-001-bootstrap
```

## 1. Objective

Create the executable HidraWeb foundation without implementing any HidraAPI business process and without changing the approved architecture.

HWEB-001 establishes:

- React + TypeScript + Vite;
- Node 24 LTS runtime baseline;
- canonical source folders;
- application provider composition;
- MUI design-system bootstrap;
- TanStack Query server-state provider;
- i18next localization bootstrap;
- authentication, permission and realtime provider boundaries without inventing backend behavior;
- central Axios transport and correlation ID support;
- Orval configuration from HidraAPI `/v3/api-docs`;
- exact HidraAPI permission endpoint constants;
- Vitest/React Testing Library and Playwright bootstrap tests;
- CI verification.

## 2. HidraAPI facts used

Verified against current HidraAPI `main`:

```text
API base path
  /api/v1

Permission metadata
  GET /api/v1/security/permissions/catalog
  GET /api/v1/security/permissions/routes

Development authentication default
  basic

Staging/production authentication default
  jwt

Development CORS includes
  http://localhost:5173

OpenAPI
  /v3/api-docs
```

No login endpoint, principal endpoint, workflow state model, or business screen is invented in this task.

## 3. Task breakdown

| ID | Task | State | Acceptance |
|---|---|---|---|
| HWEB-001-01 | Create isolated implementation branch | DONE | `hweb-001-bootstrap` exists from current `main` |
| HWEB-001-02 | Pin Node runtime | DONE | `.nvmrc` uses Node 24 LTS line |
| HWEB-001-03 | Create package manifest | DONE | React/TS/Vite and approved architecture dependencies only |
| HWEB-001-04 | Configure TypeScript | DONE | strict app/node configs, no emit, alias support |
| HWEB-001-05 | Configure Vite | DONE | port 5173, strict port, React plugin |
| HWEB-001-06 | Create bootstrap providers | DONE | Query, theme, i18n, auth boundary, permission boundary, realtime boundary |
| HWEB-001-07 | Create minimal router | DONE | `/` redirects to canonical `/overview`; no business routes invented |
| HWEB-001-08 | Create API transport boundary | DONE | central Axios instance, auth header registry, correlation ID |
| HWEB-001-09 | Configure OpenAPI generation | DONE | Orval reads HidraAPI `/v3/api-docs` and writes only to `src/api/generated` |
| HWEB-001-10 | Record verified permission endpoints | DONE | catalog/routes constants match HidraAPI |
| HWEB-001-11 | Bootstrap localization | DONE | i18next with FR/EN/AR-capable shell and RTL direction handling |
| HWEB-001-12 | Bootstrap unit/component tests | DONE | Vitest + RTL smoke test exists |
| HWEB-001-13 | Bootstrap E2E | DONE | Playwright Chromium startup smoke exists |
| HWEB-001-14 | Add CI | DONE | lint, typecheck, tests, build, E2E run on branch/PR |
| HWEB-001-15 | Generate dependency lock | PENDING CI | obtain `package-lock.json` from controlled Node/npm CI run and commit it |
| HWEB-001-16 | Switch CI install to `npm ci` | BLOCKED by 001-15 | deterministic install uses committed lock |
| HWEB-001-17 | Verify CI green | PENDING | all HWEB CI checks pass after lock commit |
| HWEB-001-18 | Merge after review | PENDING | no architecture deviation and CI green |

## 4. Explicit non-goals

HWEB-001 does not implement:

- login UI;
- identity/principal retrieval;
- permission loading;
- navbar/sidebar product shell;
- generic workbench;
- topology map;
- telemetry;
- workflow actions;
- realtime subscriptions;
- alarms/incidents/planning/integrity/custody/intelligence;
- backend changes.

Those belong to later roadmap tasks.

## 5. Exit criteria

HWEB-001 is complete only when:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

all pass in GitHub Actions from a committed lock file.
