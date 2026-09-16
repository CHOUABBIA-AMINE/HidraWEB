# HWEB-016-06 — AuthProvider session integration

## Goal

Integrate the AUTH-030 `AuthenticationGateway` into the existing frontend `AuthProvider` without yet changing provider-selection UX.

## Accepted backend/frontend contract

- LOCAL authentication uses `POST /api/v1/identity/authentication/login` through `AuthenticationGateway.loginLocal`.
- OIDC browser tokens are external/temporary and are sent only to `AuthenticationGateway.completeOidcLogin` / `POST /api/v1/identity/authentication/oidc/complete`.
- Only the returned Hidra access token becomes the normal application bearer.
- No refresh endpoint is assumed.
- Session credentials remain memory-only.
- HTTP 401 terminates the active frontend session; HTTP 403 does not.

## Implementation

- `AuthProvider` commits all successful provider results through one normalized Hidra-session path.
- Session metadata carries backend-issued session/provider/principal information.
- Permission catalog, route metadata, and effective permissions are preflighted after bearer installation.
- All TanStack Query state rooted at `['hidra']` is cleared on new session commit, logout, initialization failure, expiry, and HTTP 401.
- LOCAL sign-in keeps the existing `authenticateBasic` UI/context seam for this migration step, but the implementation no longer sends HTTP Basic authorization.
- The legacy manual `authenticateJwt(accessToken)` context seam is removed.
- OIDC expiry is governed by the final Hidra session, not the external IdP token.

## Test isolation

HWEB-016-06 changes the authentication network boundary, so tests are migrated at the same time:

- Vitest component/feature tests replace only `AuthenticationGateway.loginLocal` with an in-memory normalized Hidra session fixture. Gateway normalization code remains real and independently tested.
- Playwright runs with `VITE_HIDRA_API_BASE_URL=/` and an explicit `HIDRA_E2E_AUTH_MOCK=1` Vite middleware that implements only the AUTH-030 LOCAL login endpoint for browser tests.
- The E2E auth middleware is disabled for normal development and production builds.
- Permission and feature API behavior remains owned by the existing per-test Playwright routes.

## Out of scope

- provider-selection UI
- LDAP / Active Directory login UX
- provider capability discovery
- refresh-token behavior
- invented server-side logout/revoke endpoints

## Acceptance gates

HWEB-016-06 is complete only when the exact PR head passes:

1. OpenAPI compatibility
2. all generated clients
3. lint
4. typecheck
5. unit/component tests
6. performance tests
7. production build
8. release package and verification
9. Chromium installation
10. full Playwright regression suite
11. verified release artifact upload

Status: **READY FOR CI VERIFICATION**.
