# 12 — Authentication Specification

## Enterprise authentication contract

HWEB-015-01 froze the supported enterprise production authentication contract against HidraAPI `main` commit `725a451ae4880ccb4f2ec508709241f88cd4aea7`.

The supported enterprise production mode is **JWT bearer authentication backed by an external OpenID Connect identity provider**.

HidraAPI also implements `basic` and `disabled` authentication modes for bootstrap/development scenarios. HidraWEB must not treat either mode as the supported enterprise production contract.

HWEB-015-02 implements the browser OIDC integration and token lifecycle defined below.

## Authoritative browser bootstrap contract

Before authentication, HidraWEB obtains repository-owned browser authentication metadata from:

```text
GET /api/v1/security/oidc
```

The endpoint is intentionally public in HidraAPI security configuration.

Its response is authoritative for:

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

HidraWEB does not duplicate or infer runtime issuer, client ID, audience, scopes, logout URI, or token-storage policy from unrelated configuration.

Startup fails closed when the backend contract is not `jwt` + `authorization_code_pkce` + `memory`, when repository configuration is incomplete, when external IdP registration is not required, or when issuer/client metadata is missing.

## Production browser flow

The repository-published browser flow is:

```text
authenticationMode = jwt
authorizationFlow = authorization_code_pkce
browserTokenStorage = memory
externalIdpRegistrationRequired = true
```

The production browser behavior is therefore:

1. Fetch `/api/v1/security/oidc`.
2. Discover the issuer's OpenID configuration from `/.well-known/openid-configuration`.
3. Generate cryptographically random PKCE verifier, state, and nonce values.
4. Persist only the short-lived authorization transaction in `sessionStorage` so it can survive the IdP redirect.
5. Redirect to the discovered authorization endpoint using Authorization Code + PKCE (`S256`).
6. Receive the callback at the deployment-registered redirect URI.
7. Require exact state matching and reject expired/missing callback transaction state.
8. Re-fetch the backend OIDC contract and require issuer/client identity to remain unchanged during the transaction.
9. Exchange the authorization code at the discovered token endpoint using the public client ID and PKCE verifier.
10. Never send or embed a browser client secret.
11. If an ID token is returned, require its nonce to match the generated transaction nonce.
12. Validate the received access token through HidraAPI before committing the frontend session.
13. Hold the bearer token in React/AuthProvider memory only.
14. Remove the PKCE transaction from `sessionStorage` when the callback is consumed.

No implicit flow, password grant, browser client-credentials flow, or local HidraAPI username/password login is added for enterprise users.

## Redirect URI deployment input

HidraAPI does not publish the browser redirect URI because it is an external IdP registration/deployment value.

HidraWEB accepts the non-secret deployment input:

```text
VITE_HIDRA_OIDC_REDIRECT_URI
```

In JWT mode this value must exactly match an approved redirect URI registered for the external enterprise IdP client. HidraWEB does not manufacture a production redirect URI when this value is absent.

The application route used by the current integration is:

```text
/auth/callback
```

The configured redirect URI must resolve to that route in the deployed application.

## Token storage and lifecycle

The backend-published token-storage policy is `memory`.

HWEB-015-02 therefore keeps access tokens only inside the active `AuthProvider` process memory. Access tokens are not written to `localStorage`, `sessionStorage`, IndexedDB, source code, or Vite environment variables.

The authorization-code transaction stored temporarily in `sessionStorage` contains only:

- state;
- nonce;
- PKCE verifier;
- issuer/client/redirect identifiers required to complete the same transaction;
- return route;
- transaction creation time.

It contains no bearer access token or refresh token and is removed when consumed.

## Refresh and renewal decision

HidraAPI publishes no local refresh endpoint and the frozen repository contract does not publish an IdP refresh-token policy.

HWEB-015-02 therefore does **not** persist or use refresh tokens, even if an IdP token response happens to include one. A returned refresh token is ignored.

There is no silent iframe renewal, hidden refresh loop, refresh-token rotation, or automatic retry with a second credential.

Re-authentication through the external IdP is the supported recovery path after expiry or authorization failure until a later authoritative contract explicitly adds another mechanism.

## Expiry and unauthorized handling

HidraWEB derives an expiry deadline from the JWT `exp` claim when available, falling back to the token response `expires_in` value.

A token that is already expired or within the configured safety skew is rejected before session commit. For an active session, HidraWEB clears the bearer header and frontend session before the expiry boundary using a safety skew.

Any HidraAPI HTTP 401 event also clears the current session. HidraWEB does not retry the failed request with stale credentials or manufacture a refresh flow.

Backend HTTP 403 remains an authorization result and does not become a token-refresh signal.

## Login UX boundary

JWT mode no longer presents manual token-entry as the production login UI. `/login` starts enterprise OIDC sign-in and preserves the originally requested application route for post-callback navigation.

The lower-level `authenticateJwt` transport adapter remains inside auth infrastructure for compatibility/testing, but feature code does not acquire or set bearer tokens directly.

## Logout behavior

HidraAPI disables application logout and does not own an authenticated HTTP session.

HidraWEB always clears its in-memory bearer session locally first. If the authoritative `/api/v1/security/oidc` response supplied a `logoutUri`, HidraWEB then navigates to that exact URI.

If no `logoutUri` is supplied, HidraWEB does not synthesize an IdP logout endpoint or post-logout parameters.

## JWT validation and authorization boundary

HidraAPI remains the cryptographic JWT resource-server validator. Browser-side JWT decoding is used only for non-authoritative presentation/expiry scheduling; it does not replace backend signature, issuer, audience, or authorization validation.

Current backend authority mapping remains backend-owned:

- principal claim default: `sub`;
- roles claim default: `roles`, mapped with the configured role authority prefix (default `ROLE_`);
- scope claim default: `scope`, mapped with `SCOPE_`.

HidraWEB does not use decoded token roles/scopes as a replacement for the fail-closed frontend permission contract. Effective frontend authorization remains the intersection of:

```text
GET /api/v1/security/permissions/routes
GET /api/v1/identity/me/permissions
```

Backend authorization and HTTP 403 remain final authority.

## Runtime mode compatibility

HidraWEB still recognizes `basic`, `jwt`, and `disabled` runtime modes because bootstrap/development compatibility remains required.

Only `jwt` + external OIDC/PKCE is supported for enterprise production deployment.

## Multi-tab behavior

Because the authoritative browser storage policy is memory-only, HidraWEB does not copy bearer tokens between tabs through web storage or messaging channels. Each tab owns its own in-memory authenticated session.

No token-sharing or persisted cross-tab session mechanism is invented in HWEB-015-02.

## WebSocket authentication evidence gap

The STOMP endpoint remains `/api/v1/realtime/ws`.

The audited HidraAPI source does not publish an authoritative browser STOMP/WebSocket bearer handshake contract, and HidraWEB currently has no accepted production STOMP authentication adapter to bind to this OIDC session.

HWEB-015-02 therefore does not invent query-string tokens, cookie authentication, subprotocol credentials, or STOMP `Authorization` behavior. Production realtime bearer propagation remains blocked on a verified backend handshake contract.

## HWEB-015-02 decision summary

```text
Enterprise production authentication : external OIDC IdP + JWT
Browser authorization flow            : authorization_code_pkce / S256
Bootstrap metadata endpoint            : GET /api/v1/security/oidc
Issuer discovery                       : standard OIDC discovery from backend-published issuer
Browser redirect URI                   : VITE_HIDRA_OIDC_REDIRECT_URI deployment input
Callback route                         : /auth/callback
Browser client secret                  : forbidden / not sent
API credential                         : Bearer access token
Access-token storage                   : memory only
PKCE transaction storage               : short-lived sessionStorage; no tokens
Refresh-token persistence/use          : none
Expiry handling                        : fail closed / re-authenticate
HTTP 401 handling                      : clear session / re-authenticate
HTTP 403 handling                      : backend authorization result; no refresh
Local HidraAPI login endpoint          : none
Local HidraAPI logout endpoint         : none
Local HidraAPI refresh endpoint        : none evidenced
IdP logout                             : exact backend-published logoutUri only, when present
Frontend effective authorization       : route descriptors ∩ /identity/me/permissions
Backend authorization                  : final authority
WebSocket bearer handshake             : not invented; backend evidence gap remains
Next task                              : HWEB-015-03
```
