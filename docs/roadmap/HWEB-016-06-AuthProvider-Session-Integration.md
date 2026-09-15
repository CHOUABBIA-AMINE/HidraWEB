# HWEB-016-06 — AuthProvider Hidra Session Integration

Status: READY FOR CI VERIFICATION

## Purpose

Integrate the provider-independent `AuthenticationGateway` introduced by HWEB-016-05 into the existing `AuthProvider` seam so normal application traffic receives only a Hidra-issued bearer credential.

## Preconditions

```text
HWEB-016-04 — AUTH-030 OpenAPI refresh       COMPLETE / MERGED
HWEB-016-05 — AuthenticationGateway          COMPLETE / MERGED
```

HWEB-016-05 merged after successful HidraWEB CI run `35024320478` (attempt 2).

## Changes

### One Hidra session commit path

`AuthProvider` now commits successful authenticated sessions through one `commitHidraSession` path.

That path:

```text
HidraSessionResult
  -> validate Hidra expiry
  -> remove prior Hidra query cache
  -> install Hidra bearer in authorization-header registry
  -> preflight permission catalog
  -> preflight route permissions
  -> preflight effective user permissions
  -> expose normalized session metadata
  -> mark authenticated
  -> arm Hidra-session expiry timer
```

### LOCAL compatibility path

The existing `authenticateBasic(username, password)` UI seam is retained temporarily so HWEB-016-06 does not redesign LoginPage.

Its transport semantics are changed from browser-generated HTTP Basic credentials to the verified AUTH-030 LOCAL contract:

```text
AuthenticationGateway.loginLocal
POST /api/v1/identity/authentication/login
providerType = LOCAL
```

The runtime name `basic` is therefore compatibility configuration only; no Basic authorization header is installed for an authenticated Hidra session.

### OIDC normalization

OIDC retains browser Authorization Code + PKCE acquisition through `oidcClient`.

The callback flow is now:

```text
browser PKCE callback
  -> external IdP access token (temporary)
  -> AuthenticationGateway.completeOidcLogin
  -> POST /api/v1/identity/authentication/oidc/complete
     Authorization: Bearer <external IdP token>
  -> HidraSessionResult
  -> commitHidraSession
  -> normal application bearer = Hidra accessToken
```

The external IdP access token is never registered in the normal HidraWEB authorization-header registry.

### Legacy manual JWT seam removed

`authenticateJwt(accessToken)` was removed from `AuthContextValue` and `AuthProvider` because it allowed an arbitrary bearer to become the normal application credential without AUTH-030 normalization.

Current source search showed no runtime caller of this method.

### Session metadata

`AuthSession` now optionally exposes non-secret Hidra session metadata:

```text
sessionId
expiresAt
authenticationType
identityProviderId
principal
```

The bearer remains private to the authorization-header registry.

### Permission initialization

Before the provider exposes `authenticated`, the Hidra bearer must successfully access:

```text
GET /api/v1/security/permissions/catalog
GET /api/v1/security/permissions/routes
GET /api/v1/identity/me/permissions
```

This preserves Hidra-owned authorization and prevents an authenticated UI state from being committed before the current principal's permission surface can initialize.

### Cache isolation and teardown

The common teardown path removes all TanStack Query entries rooted at:

```text
['hidra']
```

It runs for:

```text
explicit sign-out
HTTP 401 unauthorized event
failed session initialization
session expiry
```

HTTP 403 behavior remains unchanged and does not terminate the session.

## Files changed

```text
src/app/auth/AuthProvider.tsx
src/app/auth/authContext.ts
docs/roadmap/HWEB-016-06-AuthProvider-Session-Integration.md
```

## Intentionally deferred

HWEB-016-06 does not yet implement:

```text
provider capability discovery
LOCAL / LDAP / ACTIVE_DIRECTORY selector UI
directory credential form wiring
new runtime configuration vocabulary
server-side logout/session revoke (backend gap)
canonical login-page redesign
```

These remain subsequent migration tasks.

## Acceptance gates

Repository CI must prove:

```text
OpenAPI compatibility
generated clients
lint
typecheck
unit/component tests
performance tests
production build
Playwright regression
```

## Completion rule

HWEB-016-06 becomes COMPLETE only after CI succeeds and the change is merged to `main`.

## Next task

After acceptance, implement backend-driven authentication-method presentation and explicit LOCAL / LDAP / ACTIVE_DIRECTORY UI routing without provider fallback.
