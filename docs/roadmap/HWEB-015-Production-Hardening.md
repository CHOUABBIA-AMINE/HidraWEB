# HWEB-015 — Production Hardening

Status: HWEB-015-01 COMPLETE / HWEB-015-02 NEXT

## Accepted starting point

```text
HidraWEB verified main       : bcb8f6a7e5d51000a12f02dd831b3f890382f4a5
HWEB-014-06 exact-main CI    : 34771496417 — SUCCESS
HidraAPI audited main        : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Current completed task       : HWEB-015-01 — freeze supported enterprise authentication mode and IdP contract
Next task                    : HWEB-015-02 — OIDC/JWT production integration and token lifecycle hardening
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

### Deferred to HWEB-015-02

HWEB-015-01 deliberately does not implement or decide unsupported details for:

- OIDC JavaScript client/library choice;
- redirect and callback route implementation;
- PKCE verifier/state/nonce lifecycle;
- token renewal or re-authentication strategy;
- refresh-token use or rotation;
- logout redirect handling;
- idle/session timeout behavior;
- unauthorized retry behavior;
- multi-tab synchronization;
- WebSocket bearer propagation;
- production removal/isolation of current development token-entry UX.

Those decisions require the approved IdP/runtime contract and belong to HWEB-015-02.

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
Final verification              : roadmap-inclusive exact-head CI, independent PR CI, guarded merge, exact merge-SHA main CI required
```

HWEB-015-02 must not begin until the roadmap-inclusive HWEB-015-01 head passes full CI, its exact PR head is independently verified, the guarded merge succeeds, and exact merge-SHA `main` CI is accepted.
