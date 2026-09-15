# HWEB-016-02 — Authentication Architecture and State Update

Status: COMPLETE

## Purpose

Translate the verified HidraAPI authentication contract frozen by HWEB-016-01 into HidraWEB architecture and state-management rules before runtime authentication code is changed.

This task is documentation/architecture only. It deliberately does not implement LOCAL, LDAP/AD, or OIDC completion runtime code.

## Dependency

```text
HWEB-016-01 — Authentication Contract Freeze
Backend baseline: CHOUABBIA-AMINE/HidraAPI main
Backend commit: 7b24dc122e52dd0c5471307e3611f2a3d999ae7d
```

## Files updated

```text
docs/12-Authentication-Specification.md
docs/03-Frontend-Macro-Architecture.md
docs/04-Frontend-Micro-Architecture.md
docs/17-State-Management.md
```

## Architecture decision

The frontend authentication domain is now provider-independent.

Old conceptual model:

```text
Basic credentials vs external OIDC bearer token
```

New model:

```text
authentication mechanism
        -> authenticated Hidra session
```

The supported human authentication paths verified in HidraAPI are:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
OIDC
```

All successful paths converge on the same Hidra-owned session/token result.

## AuthProvider decision

The existing `AuthProvider` seam is preserved.

`AuthProvider` remains responsible for:

```text
frontend authentication lifecycle
normalized principal/session metadata
session expiry scheduling
session invalidation
private bearer-token integration with transport
```

It does not become a general server-state store.

Feature modules must not:

```text
read/write bearer tokens
persist credentials
call authentication endpoints directly
branch on authentication source for business behavior
infer permissions from provider identity
```

## State machine

The target frontend state machine is:

```text
INITIALIZING
    |
    v
ANONYMOUS
    |
    v
AUTHENTICATING(provider)
    |
    v
AUTHENTICATED(Hidra session)
    |
    +---- expiry / logout / HTTP 401 ----> ANONYMOUS
```

Provider failures return to an anonymous/failure state. They never cause fallback authentication against another provider.

## Normalized session boundary

The session layer is designed around the unified HidraAPI authentication response:

```text
sessionId
accessToken
tokenType
jti
issuedAt
expiresAt
userId
username
displayName
authenticationType
identityProviderId
roles
permissions
```

The final protected-API credential is the Hidra-issued `accessToken`.

The bearer token remains private to auth/transport infrastructure. Components receive safe principal/session metadata, not raw bearer credentials.

## OIDC decision

Existing HWEB-015 browser security controls remain required:

```text
Authorization Code + PKCE / S256
state verification
nonce verification
OIDC discovery
short-lived redirect transaction only in sessionStorage
no browser client secret
```

The responsibility boundary changes after external IdP authentication:

```text
external IdP access token
    -> HidraAPI validation/normalization
    -> POST /api/v1/identity/authentication/oidc/complete
    -> Hidra-issued accessToken
    -> normal HidraWEB protected-API session
```

The external IdP token is not the long-term application bearer after successful Hidra completion.

## Direct provider decision

Verified endpoint:

```text
POST /api/v1/identity/authentication/login
```

Verified direct provider values in scope:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
```

OIDC password collection is forbidden.

The direct login form state is transient only. Submitted credentials are never persisted.

## Authorization decision

Authentication source is informational session metadata and does not own authorization.

Forbidden authorization inputs include:

```text
AD group
LDAP DN/directory context
external OIDC role/scope
provider type
```

Hidra-owned permission contracts and backend `403` remain authoritative.

## Authenticated cache lifecycle

TanStack Query continues to own user-scoped server state.

On authentication:

```text
install Hidra bearer credential
    -> establish normalized AuthProvider session
    -> load/refetch permission state
    -> enable protected queries
```

On logout, expiry, or HTTP `401`:

```text
cancel protected requests
    -> remove authenticated user-scoped query data
    -> clear permission state
    -> clear principal/session state
    -> clear bearer credential
```

HTTP `403` preserves the authenticated session.

This teardown ordering prevents cached information from one actor appearing during a later actor's session.

## Storage decision

Unless an authoritative backend browser contract changes it:

```text
Hidra bearer token     : memory only
LOCAL/LDAP/AD password : never persisted
OIDC PKCE transaction  : short-lived sessionStorage only
refresh token          : not persisted/used
```

Bearer tokens remain forbidden in:

```text
localStorage
sessionStorage
IndexedDB
URL/query parameters
source code
Vite environment variables
```

## Contract gaps preserved

HWEB-016-02 does not invent solutions for gaps identified by HWEB-016-01:

```text
GAP-WEB-AUTH-01 provider capability discovery
GAP-WEB-AUTH-02 browser-visible Hidra session revoke/logout endpoint
GAP-WEB-AUTH-03 canonical current-principal endpoint review
```

These gaps remain explicit and must not be hidden behind frontend assumptions.

## Compatibility position

Existing `basic | jwt | disabled` runtime concepts may remain temporarily in implementation/configuration for compatibility while migration proceeds.

They no longer define the long-term frontend authentication domain model.

The application model is now the normalized Hidra session, independent of the mechanism that produced it.

## Documentation precedence note

The verified live HidraAPI contract frozen by HWEB-016-01 is runtime truth. Where older canonical HidraWEB documents still contain statements such as "do not invent a username/password login endpoint" or describe production authentication as exclusively external OIDC, those statements are stale relative to HidraAPI AUTH-030 and must not be used to block or redefine the verified endpoints.

`docs/12-Authentication-Specification.md`, `docs/03-Frontend-Macro-Architecture.md`, `docs/04-Frontend-Micro-Architecture.md`, and `docs/17-State-Management.md` now record the migration architecture. A later documentation-consolidation task may mechanically fold these decisions into every legacy/canonical narrative document, but runtime implementation must follow HWEB-016-01 evidence.

## Acceptance checklist

```text
PASS existing AuthProvider seam preserved
PASS provider-independent Hidra session model defined
PASS direct LOCAL/LDAP/AD contract reflected
PASS OIDC PKCE controls preserved
PASS OIDC -> Hidra-issued token boundary defined
PASS token trust boundary defined
PASS bearer credential kept private to auth/transport
PASS provider fallback forbidden
PASS authentication source separated from authorization
PASS authenticated TanStack Query cleanup defined
PASS 401 and 403 semantics separated
PASS credential/token storage rules defined
PASS unverified provider discovery/logout/current-principal behavior remains gap-tracked
PASS no runtime source code modified by this task
```

## Next task

`HWEB-016-03` should inventory the current HidraWEB authentication implementation (`AuthProvider`, login page, OIDC callback, runtime config, Axios authorization-header registration, generated OpenAPI clients) and produce the smallest concrete code-change plan before implementation.

The task must verify whether the current selected HidraAPI OpenAPI artifact already contains:

```text
POST /api/v1/identity/authentication/login
POST /api/v1/identity/authentication/oidc/complete
AuthenticationLoginRequest
AuthenticationLoginResponse
ProviderType
```

No handwritten duplicate transport types or endpoint URLs should be introduced if generated contracts already exist.
