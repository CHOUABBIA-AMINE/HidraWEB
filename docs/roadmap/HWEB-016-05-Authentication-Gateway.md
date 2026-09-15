# HWEB-016-05 — Authentication Gateway and Normalized Hidra Session

Status: READY FOR CI VERIFICATION

## Purpose

Introduce the provider-independent frontend authentication boundary required by the AUTH-030 migration without yet changing login-page UX or replacing the existing `AuthProvider` behavior.

The boundary converts provider-specific authentication completion into one normalized Hidra session result:

```text
LOCAL / LDAP / ACTIVE_DIRECTORY / OIDC
        ↓
AuthenticationGateway
        ↓
AuthenticationLoginResponse
        ↓
HidraSessionResult
```

## Preconditions

```text
HWEB-016-01 contract freeze              COMPLETE
HWEB-016-02 architecture/state update    COMPLETE
HWEB-016-03 runtime inventory            COMPLETE
HWEB-016-04 AUTH-030 OpenAPI refresh     COMPLETE
```

HWEB-016-04 acceptance evidence:

```text
HidraWEB CI run : 35021947652
Conclusion      : success
OpenAPI compat  : passed for 18 feature contracts
Identity Orval  : generation passed
Typecheck       : passed
Unit tests      : passed
Build           : passed
Playwright      : 60 passed
Merge commit    : ddd4b326c05d552531e3270956a3d74f30ee125b
```

## Implementation

Added:

```text
src/app/auth/authenticationGateway.ts
src/app/auth/authenticationGateway.test.ts
```

The gateway uses the generated AUTH-030 transport models:

```text
AuthenticationLoginRequest
AuthenticationLoginResponse
```

and exposes only the currently verified browser authentication operations:

```text
loginLocal
loginDirectory(LDAP | ACTIVE_DIRECTORY)
completeOidcLogin
```

A general provider-discovery method and backend logout/session-revoke method are intentionally not invented because HWEB-016-01 did not evidence authoritative endpoints for those contracts.

## Direct credential authentication

LOCAL, LDAP, and ACTIVE_DIRECTORY converge on the single verified endpoint:

```text
POST /api/v1/identity/authentication/login
```

The request preserves the selected provider discriminator exactly and sends:

```text
providerType
principal
credentials
```

The gateway performs no retry through another provider and no fallback.

## OIDC normalization boundary

OIDC Authorization Code + PKCE remains owned by the existing browser OIDC adapter.

After the external IdP token is obtained, the gateway completes Hidra normalization through:

```text
POST /api/v1/identity/authentication/oidc/complete
Authorization: Bearer <external-idp-access-token>
```

The OIDC completion exchange uses a dedicated authentication HTTP client rather than the normal Hidra bearer interceptor. Therefore the temporary external IdP access token is never installed in the application-wide authorization-header registry.

Only the returned Hidra `accessToken` is eligible to become the normal protected-API bearer in the subsequent `AuthProvider` integration step.

## Normalized result

All supported providers produce:

```text
HidraSessionResult
  accessToken
  expiresAt
  sessionId
  tokenType
  authenticationType
  identityProviderId
  principal
    userId
    username
    displayName
    roles
    permissions
```

The boundary validates that:

```text
- accessToken is present
- authenticationType is present
- the returned authenticationType matches the explicitly requested provider
- expiresAt, when present, is parseable
```

A provider mismatch is rejected rather than interpreted as fallback success.

## Scope deliberately deferred

This task does not yet:

```text
- replace AuthProvider's existing basic/jwt compatibility methods
- change LoginPage provider selection
- wire LOCAL/LDAP/AD forms
- install the Hidra token into the global bearer registry
- change protected-route behavior
- change permission loading
- change logout behavior
- add provider capability discovery not evidenced by the backend
```

Those are subsequent migration steps built on this boundary.

## Required acceptance

```bash
npm run openapi:compatibility
npm run api:generate:identity-organization
npm run lint
npm run typecheck
npm run test
npm run build
```

Repository CI is authoritative.

## Safety properties

```text
PASS one gateway owns authentication transport
PASS generated AUTH-030 request/response models are reused
PASS LOCAL/LDAP/AD provider discriminator is explicit
PASS provider mismatch is rejected
PASS no provider fallback exists
PASS external OIDC bearer is scoped only to the normalization exchange
PASS external OIDC bearer is not registered as the normal application bearer
PASS no browser persistence of credentials or tokens is introduced
PASS authorization remains independent of authentication source
```

## Next step after CI acceptance

HWEB-016-06 — integrate `AuthenticationGateway` into `AuthProvider` so all successful provider flows commit the returned Hidra bearer through one session-install path while preserving 401/403 semantics, expiry handling, and authenticated cache isolation.
