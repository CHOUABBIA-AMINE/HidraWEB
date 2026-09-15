# 12 — Authentication Specification

## Status

HWEB-016-02 updates this specification against the authentication contract frozen in `docs/roadmap/HWEB-016-01-Authentication-Contract-Freeze.md` from HidraAPI `main` commit `7b24dc122e52dd0c5471307e3611f2a3d999ae7d`.

The previous HWEB-015 OIDC implementation remains important compatibility/security evidence, but its assumption that enterprise authentication is exclusively an external IdP bearer-token session is superseded by HidraAPI's completed unified authentication contract.

## Authentication architecture

Supported human authentication paths in the current backend contract are:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
OIDC
```

All successful paths converge on:

```text
authentication source
    -> Hidra User
    -> Hidra account-state validation
    -> Hidra roles/permissions
    -> HidraPrincipal
    -> LoginSession / AuthenticationEvent
    -> Hidra-issued JWT
    -> protected HidraAPI endpoints
```

HidraWEB therefore models authentication as:

```text
authentication mechanism
    -> authenticated Hidra session
```

and not as a permanent application split between:

```text
Basic credentials vs external OIDC bearer token
```

Feature modules must not branch on authentication source.

## AuthProvider boundary

`AuthProvider` remains the single frontend owner of authentication/session state.

Feature code must not:

- read or write bearer tokens directly;
- persist submitted credentials;
- call authentication endpoints directly;
- branch authorization behavior on `LOCAL`, `LDAP`, `ACTIVE_DIRECTORY`, or `OIDC`;
- retry a failed authentication attempt against another provider.

Target provider-independent state model:

```ts
type AuthState =
  | { status: 'initializing' }
  | {
      status: 'anonymous';
      error?: AuthFailure;
    }
  | {
      status: 'authenticating';
      provider: ProviderType;
    }
  | {
      status: 'authenticated';
      principal: HidraPrincipalView;
      authenticationType: ProviderType;
      sessionId: string;
      expiresAt: string;
    };
```

The bearer token is private authentication/transport infrastructure and is not ordinary application context data.

## Direct authentication contract

HidraAPI exposes:

```text
POST /api/v1/identity/authentication/login
```

for explicit direct authentication using:

```json
{
  "providerType": "LOCAL | LDAP | ACTIVE_DIRECTORY",
  "principal": "submitted principal",
  "credentials": "submitted credential"
}
```

Rules:

- `providerType` is required;
- `principal` is non-blank;
- `credentials` is non-blank;
- the selected provider is authoritative for that attempt;
- failure does not trigger another provider;
- submitted credentials are never persisted by HidraWEB;
- development HTTP Basic is not the LOCAL production authentication contract.

OIDC is not supported as a direct username/password request.

## OIDC browser bootstrap contract

Before OIDC authentication, HidraWEB obtains browser metadata from:

```text
GET /api/v1/security/oidc
```

Its response remains authoritative for:

```text
authenticationMode
authorizationFlow
issuerUri
clientId
audience
scopes
logoutUri
browserTokenStorage
repositoryConfigurationComplete
externalIdpRegistrationRequired
```

HidraWEB must not duplicate or infer issuer, client ID, audience, scopes, logout URI, or token-storage policy from unrelated configuration.

The current browser contract remains:

```text
authorizationFlow   = authorization_code_pkce
browserTokenStorage = memory
```

## OIDC authorization-code + PKCE flow

The HWEB-015 security controls remain mandatory:

1. Fetch `/api/v1/security/oidc`.
2. Discover the issuer OpenID configuration.
3. Generate cryptographically random PKCE verifier, state, and nonce.
4. Persist only the short-lived authorization transaction in `sessionStorage`.
5. Redirect using Authorization Code + PKCE (`S256`).
6. Receive the callback at the registered redirect URI.
7. Require exact state matching and reject expired/missing transaction state.
8. Re-fetch the backend OIDC contract and require issuer/client identity to remain unchanged during the transaction.
9. Exchange the authorization code at the discovered token endpoint using the public client ID and PKCE verifier.
10. Never send or embed a browser client secret.
11. Require nonce equality when an ID token is returned.
12. Remove the PKCE transaction when consumed.

No implicit flow, password grant, browser client-credentials flow, or OIDC password collection is introduced.

## OIDC to Hidra session completion

External OIDC authentication no longer represents the final HidraWEB application session.

After the external IdP credential has been validated and normalized by HidraAPI/Spring Security to an OIDC `HidraPrincipal`, HidraWEB completes the Hidra session through:

```text
POST /api/v1/identity/authentication/oidc/complete
```

The responsibility split is:

```text
HidraWEB
  -> execute external Authorization Code + PKCE
  -> obtain external access token
  -> present it for HidraAPI validation/normalization
  -> call OIDC completion

HidraAPI
  -> require authenticated OIDC HidraPrincipal
  -> enforce Hidra account state and authorization ownership
  -> create/complete LoginSession
  -> issue Hidra JWT
  -> return unified AuthenticationLoginResponse
```

The external IdP token is therefore an OIDC completion credential. After successful completion, the normal protected HidraAPI bearer credential is the Hidra-issued `accessToken` returned by HidraAPI.

## Unified authentication result

Direct login and OIDC completion return the same `AuthenticationLoginResponse` shape:

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

Frontend authentication infrastructure must normalize every successful provider into one internal Hidra session result.

Conceptually:

```ts
interface HidraSessionResult {
  sessionId: string;
  accessToken: string;
  tokenType: string;
  issuedAt: string;
  expiresAt: string;
  principal: HidraPrincipalView;
  authenticationType: ProviderType;
}
```

Exact frontend type definitions should be derived from generated OpenAPI transport types where available.

## Token trust and storage boundary

Only the Hidra-issued `accessToken` from the unified authentication response may become the normal bearer credential for protected HidraAPI traffic after authentication completes.

Unless HidraAPI publishes a different browser storage policy, bearer-token storage remains memory-only.

Bearer tokens must not be written to:

```text
localStorage
sessionStorage
IndexedDB
source code
Vite environment variables
URL/query parameters
```

The authorization-code transaction in `sessionStorage` contains transaction data only; it must not contain bearer access tokens or refresh tokens.

## Refresh and renewal

No HidraAPI refresh endpoint is evidenced by HWEB-016-01.

Therefore HidraWEB must not invent:

- refresh-token persistence;
- silent iframe renewal;
- hidden refresh loops;
- automatic retry with a second credential.

Session recovery after token expiry remains explicit re-authentication until a later backend contract defines another mechanism.

## Expiry and HTTP status handling

HidraWEB uses the authoritative `expiresAt` from the unified authentication response for session lifecycle scheduling. Browser JWT decoding may assist diagnostics/presentation but does not replace backend validation.

Required behavior:

```text
401
  -> invalidate frontend session
  -> remove bearer credential
  -> clear authenticated user caches
  -> require re-authentication

403
  -> preserve authenticated session
  -> render authorization-denied behavior
```

A `403` is not a refresh or provider-fallback signal.

## Authorization boundary

Authentication source does not own authorization.

The following must never directly grant frontend business access:

```text
AD group
LDAP DN or directory metadata
OIDC provider role/scope
provider/authentication type
```

Frontend authorization continues to be based on Hidra-owned permission contracts, including the verified route/permission APIs used by HidraWEB, while backend `403` remains final authority.

Authentication response roles/permissions may populate the normalized session view, but feature access must remain consistent with the repository's canonical permission architecture and backend enforcement.

## Routing behavior

Protected routes depend on authenticated Hidra session state, not provider type.

Canonical flow:

```text
protected route requested
    -> anonymous session
    -> preserve intended route
    -> /login
    -> explicit authentication mechanism
    -> Hidra session established
    -> permission state loaded/validated
    -> return to intended route
```

Authentication type must not influence route authorization.

## Cache lifecycle

On successful authentication:

```text
commit Hidra bearer credential
    -> establish normalized principal/session
    -> load/refetch permission/user-scoped data
    -> enable protected queries
```

On logout, expiry, or HTTP 401:

```text
cancel protected requests
    -> clear authenticated TanStack Query data
    -> clear permission state
    -> clear principal/session state
    -> clear bearer credential
```

This prevents data from one authenticated actor from leaking into a later actor's frontend session.

## Provider capability discovery gap

HWEB-016-01 did not identify an authoritative public endpoint that tells HidraWEB which of `LOCAL`, `LDAP`, `ACTIVE_DIRECTORY`, and `OIDC` should be displayed/enabled for a specific deployment.

Until such a contract exists:

- do not fabricate dynamic provider availability;
- do not infer it from hostname or build version;
- provider-selection UX remains blocked on an explicit supported configuration/capability decision.

## Logout/session revocation gap

HidraAPI has backend `LoginSession` lifecycle behavior, but HWEB-016-01 did not identify a browser-facing Hidra session revoke/logout endpoint.

HidraWEB may always clear its local in-memory session. OIDC IdP logout may continue to use the exact backend-published `logoutUri` when appropriate, but HidraWEB must not invent a HidraAPI `/logout` endpoint.

Server-side Hidra session revocation remains a tracked contract gap until evidenced.

## Current-principal gap

The unified authentication response contains normalized principal metadata.

HWEB-016-01 did not identify a new authentication-specific current-principal `/me` endpoint. Existing identity profile/permission endpoints must be consumed only where independently verified; no new principal endpoint is assumed.

## Multi-tab behavior

Because the browser bearer-token policy remains memory-only, HidraWEB does not copy bearer tokens between tabs through web storage or messaging channels. Each tab owns its own authenticated session unless a later authoritative backend/browser contract changes this decision.

## WebSocket authentication evidence gap

The STOMP endpoint remains `/api/v1/realtime/ws`.

No browser STOMP/WebSocket bearer-handshake contract is introduced by HWEB-016-02. HidraWEB must not invent query-string tokens, cookie authentication, subprotocol credentials, or STOMP `Authorization` behavior without backend evidence.

## HWEB-016-02 decision summary

```text
Authentication application model       : provider-independent Hidra session
Direct login endpoint                  : POST /api/v1/identity/authentication/login
Direct provider types                  : LOCAL / LDAP / ACTIVE_DIRECTORY
OIDC bootstrap                         : GET /api/v1/security/oidc
OIDC browser flow                      : authorization_code_pkce / S256
OIDC Hidra completion                  : POST /api/v1/identity/authentication/oidc/complete
Final protected-API credential         : Hidra-issued accessToken
Bearer-token storage                   : memory only unless backend contract changes
PKCE transaction storage               : short-lived sessionStorage; no bearer tokens
Refresh endpoint                       : not evidenced; do not invent
Provider fallback                      : forbidden
Authorization ownership                : Hidra permissions; provider does not grant business access
HTTP 401                               : terminate frontend session
HTTP 403                               : preserve session; authorization denied
Auth state owner                       : AuthProvider
Server/user state                      : TanStack Query + PermissionProvider as applicable
Provider capability discovery          : open contract gap
Hidra session revoke/logout endpoint   : open contract gap
Canonical current-principal endpoint   : not newly evidenced
```
