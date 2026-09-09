# HWEB-001 — Bootstrap HidraWeb React + TypeScript Application

```text
Task          : HWEB-001
Repository    : HidraWEB
Source truth  : CHOUABBIA-AMINE/HidraAPI main
Architecture  : docs/architecture/*
Status        : COMPLETE — READY FOR REVIEW
Branch        : hweb-001-bootstrap
Verified on   : 2026-09-09
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
- deterministic npm dependency lock;
- GitHub Actions CI verification.

## 2. HidraAPI facts used

Verified against HidraAPI `main` before implementation:

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

No login endpoint, principal endpoint, workflow state model, or business screen was invented in this task.

## 3. Task breakdown

| ID | Task | State | Acceptance |
|---|---|---|---|
| HWEB-001-01 | Create isolated implementation branch | DONE | `hweb-001-bootstrap` exists from architecture-baseline `main` |
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
| HWEB-001-12 | Bootstrap unit/component tests | DONE | Vitest + RTL bootstrap test passes |
| HWEB-001-13 | Bootstrap E2E | DONE | Playwright Chromium startup smoke passes |
| HWEB-001-14 | Add CI | DONE | lint, typecheck, tests, build, E2E configured |
| HWEB-001-15 | Generate deterministic dependency lock | DONE | `package-lock.json` generated on Node 24/npm 11 and committed |
| HWEB-001-16 | Enforce deterministic CI install | DONE | GitHub Actions uses read-only permissions + `npm ci` |
| HWEB-001-17 | Verify CI green | DONE | run `34371764225` passed all gates on commit `1996a23cbadcc009cf41806a426a193461ffd187` |
| HWEB-001-18 | Merge after review | PENDING | pull request review and merge to `main` |

## 4. CI correction history

The bootstrap CI was used as a quality gate, not bypassed:

1. `setup-node` initially expected a lock because its package-manager cache default was enabled; the bootstrap run temporarily disabled cache until the lock existed;
2. registry validation rejected an invalid `@eslint/js` version, which was corrected to an existing registry release;
3. first successful install/lint exposed TypeScript-only bootstrap issues (Vitest globals and MUI Stack typing), which were corrected without weakening strict TypeScript;
4. CI generated and committed the deterministic npm lock;
5. permanent CI returned to `contents: read` and `npm ci`;
6. Vitest and Playwright suites were isolated so each runner owns only its intended tests;
7. the final E2E locator was made exact after Playwright correctly reported an ambiguous text match.

No backend or business-domain code was changed to satisfy the frontend bootstrap.

## 5. Verified CI baseline

Successful GitHub Actions run:

```text
Run          : 34371764225
Commit       : 1996a23cbadcc009cf41806a426a193461ffd187
Node         : 24.20.0
npm          : 11.19.0

npm ci                         PASS
npm run lint                   PASS
npm run typecheck              PASS
npm run test                   PASS
npm run build                  PASS
Playwright Chromium install    PASS
npm run test:e2e               PASS
```

The production build currently reports an informational Vite chunk-size warning for the bootstrap bundle. This is not an HWEB-001 failure; route-level lazy loading and bundle budgets are explicitly handled by later application/performance tasks.

## 6. Explicit non-goals

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

## 7. Exit criteria

The HWEB-001 implementation exit criteria are satisfied:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

All passed in GitHub Actions using the committed dependency lock.

The remaining administrative action is code review and merge of `hweb-001-bootstrap` into `main`.

## 8. Next controlled task

After HWEB-001 is merged, the next roadmap item is:

```text
HWEB-002 — Application Shell, Authentication and Permissions
```

HWEB-002 must re-read HidraAPI `main` before implementation so authentication, principal, permission and route metadata continue to come from the backend source of truth.
