# HWEB-015 — Production Hardening

Status: HWEB-015-02 COMPLETE / HWEB-015-03 NEXT

## Accepted starting point

```text
HidraWEB verified main       : f8e387ef36c737a9ef6e04f890e01be73053f6a4
HWEB-015-01 exact-main CI    : 34772687058 — SUCCESS
HidraAPI audited main        : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Current completed task       : HWEB-015-02 — OIDC/JWT production integration and token lifecycle hardening
Next task                    : HWEB-015-03 — same-origin reverse-proxy deployment design
```

## HWEB-015-01 — freeze supported enterprise authentication mode and IdP contract — COMPLETE

### Scope

HWEB-015-01 is a contract-freeze task. It records the enterprise production authentication decision already evidenced by HidraAPI without implementing the browser OIDC client. Concrete token acquisition, callback handling, renewal/re-authentication, logout integration, and lifecycle hardening are reserved for HWEB-015-02.

### Backend contract audited

HidraAPI source commit:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
```

Verified backend behavior:

- Spring Security supports `jwt`, `basic`, and `disabled` modes.
- `jwt` is the default authentication mode and activates OAuth2 resource-server JWT validation.
- HidraAPI disables form login, application logout, and server-side HTTP sessions.
- `GET /api/v1/security/oidc` is public bootstrap metadata for browser clients.
- The endpoint publishes the repository-owned OIDC/JWT browser contract without secrets.
- The endpoint declares `authorization_code_pkce`.
- The endpoint declares browser token storage as `memory`.
- External IdP registration is required.
- Repository configuration is considered complete only when authentication mode is `jwt` and both issuer URI and client ID are present.
- Runtime audience, scopes, and optional logout URI are published by the endpoint.
- JWT authorities are mapped from backend-configured roles and scope claims.

### Frozen enterprise production decision

The supported enterprise production mode is:

```text
External enterprise IdP
OpenID Connect / OAuth 2.0 Authorization Code + PKCE
JWT bearer access token to HidraAPI
Stateless HidraAPI resource server
Memory-only browser token storage under the current repository contract
No browser client secret
```

`basic` and `disabled` remain compatibility/bootstrap modes but are not the accepted enterprise production authentication mode.

### Authoritative browser bootstrap

HidraWEB shall bootstrap production browser authentication from:

```text
GET /api/v1/security/oidc
```

Authoritative response fields:

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

HidraWEB must not invent or hard-code runtime issuer, client ID, audience, scopes, logout URI, or browser token-storage policy when the backend contract provides them.

### IdP registration boundary

External IdP registration is a production deployment prerequisite.

The repository does not freeze an IdP vendor, tenant/domain, redirect URI, post-logout redirect URI, MFA/conditional-access policy, or other organization-specific IdP administration value. HidraWEB must not invent those values. They must come from the approved enterprise IdP registration and deployment design.

### Authorization boundary

Token claims do not replace the existing frontend permission model.

Effective frontend authorization remains fail-closed through the intersection of:

```text
GET /api/v1/security/permissions/routes
GET /api/v1/identity/me/permissions
```

Backend authorization and HTTP 403 remain final authority.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : GET /api/v1/security/oidc; OidcContract metadata only
Permissions used                : endpoint is public bootstrap metadata; no new frontend permission invented
Frontend routes created/changed : none
State ownership                 : no new runtime state; contract only
Error states                    : repositoryConfigurationComplete=false must fail closed in HWEB-015-02; no behavior implemented here
Tests added                     : none; documentation-only contract freeze
OpenAPI regeneration status     : not required; no generated client or runtime API integration added
Known backend gaps              : no local login/logout/refresh endpoint; redirect/logout redirect URIs and enterprise IdP administration are external deployment inputs
Product branch                  : hweb-015-01-enterprise-auth-contract
Product head                    : b188aff7d0876e1607e93ec897e2343793cd45c9
Product branch CI               : 34772057267 — SUCCESS
PR / final head                 : #75 / cd8d1c8e78559f2ea601331a9faa41e6a2e2c238
Independent PR CI               : 34772477187 — SUCCESS
Merge SHA                       : f8e387ef36c737a9ef6e04f890e01be73053f6a4
Exact-main CI                   : 34772687058 — SUCCESS
```

## HWEB-015-02 — OIDC/JWT production integration and token lifecycle hardening — COMPLETE

### Scope

HWEB-015-02 implements only the browser authentication behavior frozen by HWEB-015-01. It does not start same-origin proxy design, security-header policy, observability, accessibility, bundle optimization, or any later HWEB-015 task.

### Backend and external runtime contracts

HidraAPI was re-audited at:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
```

Repository-owned bootstrap metadata continues to come from:

```text
GET /api/v1/security/oidc
```

For a production OIDC startup, HidraWEB requires the backend response to state:

```text
authenticationMode = jwt
authorizationFlow = authorization_code_pkce
browserTokenStorage = memory
repositoryConfigurationComplete = true
externalIdpRegistrationRequired = true
issuerUri != null
clientId != null
```

The backend-published issuer is then used for standard OpenID Provider discovery. Authorization and token endpoints come from that external issuer metadata; HidraWEB does not synthesize those endpoints.

### Authorization Code + PKCE implementation

`src/app/auth/oidcClient.ts` now owns the production browser acquisition flow.

The client:

- generates cryptographically random state, nonce, and PKCE verifier values;
- creates an S256 PKCE challenge through Web Crypto;
- redirects to the discovered authorization endpoint;
- requires an exact callback-state match;
- expires unfinished callback transactions after ten minutes;
- re-reads `/api/v1/security/oidc` during callback and rejects a changed issuer or client ID;
- exchanges the code at the discovered token endpoint using the public client ID and verifier;
- never sends a browser `client_secret`;
- rejects a non-Bearer token response;
- validates an ID-token nonce when an ID token is returned;
- removes the callback transaction from browser storage when consumed.

### Redirect URI boundary

The exact browser redirect URI remains an external IdP-registration/deployment input, because HidraAPI does not publish it.

HidraWEB now accepts:

```text
VITE_HIDRA_OIDC_REDIRECT_URI
```

This value is non-secret but must exactly match an approved external IdP registration. The application callback route is:

```text
/auth/callback
```

HidraWEB fails closed when JWT/OIDC login is requested without the deployment redirect URI instead of manufacturing a production URL.

### Token ownership and persistence

Bearer access tokens are owned only by `AuthProvider` process memory and the existing central authorization-header registry.

HidraWEB does not persist access tokens in:

- `localStorage`;
- `sessionStorage`;
- IndexedDB;
- source code;
- build-time Vite token variables.

A short-lived `sessionStorage` transaction is used only because state, nonce, and the PKCE verifier must survive the external IdP navigation. It contains no bearer or refresh token and is deleted during callback handling.

### Refresh / renewal decision

No repository-owned refresh endpoint or approved external refresh-token policy is published by the frozen backend contract.

HWEB-015-02 therefore does not persist or use refresh tokens. If an external IdP returns an unrequested/extra `refresh_token` field, it is discarded by the strict parsed token response and never enters session state.

No silent iframe renewal, refresh loop, token rotation, or automatic credential retry is invented. Re-authentication through the approved IdP is the supported recovery behavior under current evidence.

### Expiry and HTTP failure semantics

An access-token deadline is taken from JWT `exp` when present, with `expires_in` as the fallback transport value.

A token already expired or within the safety window is rejected before authenticated session commit. An accepted session schedules local bearer/session clearing before expiry.

The existing HidraAPI unauthorized event now has explicit production semantics:

- HTTP 401 clears the current bearer/session state and requires sign-in again;
- no stale-request replay or invented refresh occurs;
- HTTP 403 remains the backend authorization result and is not treated as a refresh signal.

### Backend validation after callback

Browser-side JWT decoding is not considered cryptographic validation.

Before `AuthProvider` commits an enterprise session, it sends the bearer token to HidraAPI through the existing protected route-permission request. HidraAPI therefore remains the resource-server validator for signature, issuer, audience, expiry, and authentication acceptance.

Effective frontend authorization still remains fail-closed through:

```text
GET /api/v1/security/permissions/routes
GET /api/v1/identity/me/permissions
```

Token claims do not replace those permission grants, and backend HTTP 403 remains final authority.

### Login and callback UX

JWT mode no longer stops at the development token-acquisition placeholder.

`/login` now initiates the enterprise OIDC flow and preserves the originally requested protected route as a safe local return route. `/auth/callback` completes the authorization-code transaction and navigates back only after HidraAPI accepts the bearer credential.

The lower-level `authenticateJwt` adapter remains inside authentication infrastructure for compatibility/testing; feature code still never owns credentials directly.

### Logout semantics

Logout always clears local in-memory authentication first.

When the authoritative backend OIDC bootstrap includes `logoutUri`, HidraWEB navigates to that exact URI after clearing local state. When it is absent, no IdP logout endpoint or post-logout query parameters are invented.

### Multi-tab semantics

Because the backend contract explicitly requires memory-only browser token storage, HidraWEB does not copy bearer tokens between tabs through local storage, session storage, or messaging channels.

Each browser tab therefore owns its own in-memory authenticated session. No cross-tab token persistence mechanism is introduced by this task.

### Realtime evidence gap

The audited backend still exposes the STOMP endpoint at `/api/v1/realtime/ws`, but no authoritative browser bearer-handshake contract was found in the audited source.

HWEB-015-02 therefore does not invent:

- query-string bearer tokens;
- cookie authentication;
- WebSocket subprotocol credentials;
- STOMP `Authorization` header semantics.

Production realtime authentication remains an explicit backend/runtime evidence gap rather than an inferred implementation.

### Tests

`src/app/auth/oidcClient.test.ts` verifies that:

- incomplete backend OIDC configuration fails closed;
- a callback with mismatched state is rejected and its transaction is removed;
- a valid PKCE callback performs an authorization-code exchange;
- no browser client secret is sent;
- a returned refresh token is not persisted or exposed;
- access-token persistence is not introduced into web storage.

The existing full frontend test and browser suites also run unchanged.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : GET /api/v1/security/oidc; external issuer OIDC discovery + authorization/token endpoints
Permissions used                : OIDC bootstrap is public; existing protected route-permission request validates accepted bearer token; no permission invented
Frontend routes created/changed : /login changed; /auth/callback added
State ownership                 : access token in AuthProvider memory only; short-lived PKCE transaction in sessionStorage only
Error states                    : missing/incomplete OIDC contract, missing redirect input, expired/missing/mismatched state, changed issuer/client, invalid token type/nonce, imminent expiry, backend token rejection/401
Tests added                     : src/app/auth/oidcClient.test.ts
OpenAPI regeneration status     : no new generated client required; compact public auth bootstrap consumed inside auth infrastructure; all existing deterministic generators pass CI
Known backend gaps              : no local refresh API, no published external refresh-token policy, no authoritative browser STOMP/WebSocket bearer-handshake contract
Product branch                  : hweb-015-02-oidc-jwt-production
Product head                    : bac5a77817482bfdf6556aa4492ad35386d68b49
Product branch CI               : 34773136762 — SUCCESS
Final verification              : roadmap-inclusive exact-head CI, independent PR CI, guarded merge, exact merge-SHA main CI required
```

HWEB-015-03 must not begin until the roadmap-inclusive HWEB-015-02 head passes full CI, its exact PR head is independently verified, the guarded merge succeeds, and exact merge-SHA `main` CI is accepted.
