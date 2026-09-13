# HidraWEB Playwright Regression Suite

Status: HWEB-015-09 production-hardening contract

## Scope

HWEB-015-09 freezes the browser regression boundary for critical operational journeys. The normal CI lifecycle must execute the complete `tests/e2e` Playwright suite in Chromium after deterministic OpenAPI generation, lint, typecheck, unit/component tests, runtime performance budgets, and the production build with bundle budgets.

This milestone adds cross-surface journey coverage without changing HidraAPI endpoints, DTOs, permissions, route availability, business rules, or backend-owned state.

## Critical operational journey

The cross-surface regression in `tests/e2e/critical-operational-journeys.spec.ts` protects the representative control-room sequence:

```text
sign in
  -> monitoring / telemetry evidence
  -> alarm investigation and acknowledgement
  -> workflow task decision
```

The journey uses only routes and permissions already exercised by the dedicated HWEB-006, HWEB-007, and HWEB-008 suites. HidraAPI remains authoritative at every step:

- monitoring/deviation and telemetry values are returned by mocked published backend contracts;
- alarm acknowledgement is sent only through the existing backend acknowledgement endpoint;
- the workflow transition is rendered only because the backend `available-actions` response marks it permitted;
- the workflow execution request carries the backend task concurrency token;
- no frontend-derived alarm state, workflow state, permission, or transition is introduced.

## Full-suite rule

HWEB-015-09 does not replace the existing per-feature Playwright specifications with a small smoke suite. CI must continue running all specifications under `tests/e2e` so that authentication/bootstrap, permissions, accessibility, topology, monitoring, alarms, workflow, events, planning, engineering, custody, intelligence, administration, notifications, reporting, and the new cross-surface journey remain regression-covered together.

The CI Playwright command remains the repository's complete `npm run test:e2e` command. A future change is not HWEB-015-09-safe if it narrows that command to selected files, tags, or a smoke subset without an explicit roadmap decision.

## Determinism and isolation

Playwright uses the checked-in Vite development server and route interception for authoritative API fixtures. The suite must not depend on an external HidraAPI deployment, external enterprise IdP, production secrets, or internet access.

CI remains single-worker with retries only in CI, preserving deterministic resource usage and useful trace capture on first retry. Tests must assert user-visible outcomes and exact backend request semantics where mutations are involved, not arbitrary sleeps or implementation-private React state.

## Regression rules

A change is not HWEB-015-09-safe if it:

- removes full-suite execution from the normal CI lifecycle;
- bypasses fail-closed route/permission behavior to make a journey pass;
- manufactures API responses, permissions, workflow transitions, optimistic-lock tokens, or business states that are not already established by HidraAPI-facing application contracts;
- converts a backend-authoritative mutation into client-owned state;
- disables existing accessibility, performance, or bundle gates to reduce E2E runtime;
- relies on external services or credentials for deterministic CI acceptance.

HWEB-015-10 remains the next roadmap task and owns the OpenAPI compatibility gate between HidraAPI and HidraWEB pipelines.
