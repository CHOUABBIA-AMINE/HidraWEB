# HWEB-015 — Production Hardening

Status: HWEB-015-03 COMPLETE / HWEB-015-04 NEXT

## Accepted starting point

```text
HidraWEB verified main       : 02578793a279a8cb10b410d0bc5c750d10d0ab6f
HWEB-015-02 exact-main CI    : 34773896400 — SUCCESS
HidraAPI audited main        : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Current completed task       : HWEB-015-03 — same-origin reverse-proxy deployment design
Next task                    : HWEB-015-04 — CSP, TLS, secure headers and static asset cache policy
```

## HWEB-015-01 — freeze supported enterprise authentication mode and IdP contract — COMPLETE

HWEB-015-01 froze the enterprise production authentication contract as external OIDC IdP + JWT bearer + Authorization Code with PKCE, using public bootstrap metadata from `GET /api/v1/security/oidc`, memory-only browser bearer-token storage, and no browser client secret. Basic and disabled modes remain bootstrap/development compatibility modes only.

Effective frontend authorization remains the fail-closed intersection of `GET /api/v1/security/permissions/routes` and `GET /api/v1/identity/me/permissions`; backend HTTP 403 remains final authority.

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Product branch                  : hweb-015-01-enterprise-auth-contract
Product head                    : b188aff7d0876e1607e93ec897e2343793cd45c9
Product branch CI               : 34772057267 — SUCCESS
PR / final head                 : #75 / cd8d1c8e78559f2ea601331a9faa41e6a2e2c238
Independent PR CI               : 34772477187 — SUCCESS
Merge SHA                       : f8e387ef36c737a9ef6e04f890e01be73053f6a4
Exact-main CI                   : 34772687058 — SUCCESS
```

## HWEB-015-02 — OIDC/JWT production integration and token lifecycle hardening — COMPLETE

HWEB-015-02 implemented the frozen browser contract: issuer discovery, S256 PKCE, state/nonce verification, `/auth/callback`, backend validation before session commit, memory-only bearer state, expiry/401 session clearing, exact backend-published logout URI handling, and no persisted or used refresh-token flow.

The external IdP redirect URI is deployment-owned through `VITE_HIDRA_OIDC_REDIRECT_URI`. No authoritative browser STOMP/WebSocket bearer-handshake contract was found, so no query-string, cookie, WebSocket subprotocol, or STOMP authorization semantics were invented.

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : GET /api/v1/security/oidc; external issuer OIDC discovery + authorization/token endpoints
Permissions used                : OIDC bootstrap is public; backend permission request validates accepted bearer token; no permission invented
Frontend routes created/changed : /login changed; /auth/callback added
State ownership                 : bearer token in AuthProvider memory only; short-lived PKCE transaction in sessionStorage only
Tests added                     : src/app/auth/oidcClient.test.ts
OpenAPI regeneration status     : no new generated client required; all deterministic generators passed CI
Known backend gaps              : no local refresh API; no published external refresh-token policy; no authoritative browser STOMP/WebSocket bearer-handshake contract
Product branch                  : hweb-015-02-oidc-jwt-production
Product head                    : bac5a77817482bfdf6556aa4492ad35386d68b49
Product branch CI               : 34773136762 — SUCCESS
PR / final head                 : #76 / 613b05dba7a11c0f77c8507fe1fb81928da835c2
Roadmap-inclusive CI            : 34773448431 — SUCCESS
Independent PR CI               : 34773695791 — SUCCESS
Merge SHA                       : 02578793a279a8cb10b410d0bc5c750d10d0ab6f
Exact-main CI                   : 34773896400 — SUCCESS
```

## HWEB-015-03 — same-origin reverse-proxy deployment design — COMPLETE

### Scope

HWEB-015-03 defines and validates the production same-origin browser/reverse-proxy topology only. It does not start HWEB-015-04 security-header, TLS, CSP, or static-asset cache-policy work.

### Backend and architecture evidence

HidraAPI was re-audited at:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
```

The canonical frontend architecture already prefers:

```text
Browser
  -> HTTPS reverse proxy/gateway
      -> /                         HidraWEB static application
      -> /api/*                    HidraAPI
      -> /api/v1/realtime/sse      HidraAPI SSE
      -> /api/v1/realtime/ws       HidraAPI STOMP/WebSocket
```

HidraAPI registers the WebSocket endpoint at `/api/v1/realtime/ws`. Existing frontend/backend evidence also identifies `/api/v1/realtime/sse` as the SSE transport path. The proxy design preserves both paths exactly.

### Production browser/API URL decision

Production uses:

```text
VITE_HIDRA_API_BASE_URL=/
```

`src/app/bootstrap/runtimeConfig.ts` accepts the same-origin root `/` or an absolute URL. Absolute URLs remain valid for local development. Arbitrary relative prefixes such as `/backend` fail closed so deployment cannot silently diverge from HidraAPI's `/api/*` contract.

### Reverse-proxy routing contract

The reference template is:

```text
deploy/nginx/hidraweb.conf.template
```

It requires only the deployment-owned internal upstream substitution:

```text
HIDRA_API_UPSTREAM
```

The repository does not freeze an internal service name, IP address, container DNS name, Kubernetes service name, or backend port.

Routing is:

```text
/api/v1/realtime/ws  -> HidraAPI with HTTP Upgrade forwarding
/api/v1/realtime/sse -> HidraAPI with proxy buffering/cache disabled
/api/*                -> HidraAPI with path preserved
/*                    -> HidraWEB static assets with React Router history fallback
```

The proxy forwards `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, and `X-Forwarded-For` so downstream infrastructure retains public-origin/request context.

### OIDC and CORS boundaries

Same-origin API routing does not change the external IdP contract. The browser callback remains `/auth/callback`, and the exact production `VITE_HIDRA_OIDC_REDIRECT_URI` must match the approved external IdP registration. Issuer discovery and IdP authorization/token endpoints remain external and are not reverse-proxied through `/api/*`.

Production browser/API integration no longer depends on a second browser-visible HidraAPI origin. Development CORS support remains backend-owned and is not removed by this task.

### Realtime boundary

HWEB-015-03 establishes transport reachability only. It does not define STOMP destinations, subscription permissions, cookie authentication, query-string credentials, WebSocket subprotocol credentials, or STOMP bearer headers. The HWEB-015-02 WebSocket authentication evidence gap remains explicit.

### Deployment artifacts

- `.env.production.example` records the accepted same-origin browser shape and non-secret OIDC redirect input.
- `deploy/nginx/hidraweb.conf.template` provides the reference routing topology.
- `docs/deployment/Same-Origin-Reverse-Proxy.md` records the deployment contract and explicit HWEB-015-04 exclusions.
- `README.md` links the production deployment design.

### Tests

`src/app/bootstrap/runtimeConfig.test.ts` verifies:

- `/` is accepted as the same-origin API base;
- an absolute local-development backend origin remains accepted;
- arbitrary relative API prefixes fail closed.

`src/app/bootstrap/reverseProxyConfig.test.ts` verifies the checked-in proxy template contains:

- exact `/api/`, SSE, and WebSocket routes;
- the deployment-owned API upstream;
- disabled SSE buffering;
- WebSocket Upgrade forwarding;
- SPA history fallback for non-API browser routes.

### Explicitly deferred to HWEB-015-04

HWEB-015-03 does not define TLS certificates/protocols/ciphers/HSTS, CSP, secure response headers, static asset cache-control/immutable caching, or related browser hardening. Those belong to HWEB-015-04.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : existing /api/* routes; /api/v1/realtime/sse; /api/v1/realtime/ws; no new DTO
Permissions used                : none introduced; proxy is transport-only and does not alter authorization
Frontend routes created/changed : none
State ownership                 : no new application state
Error states                    : unsupported relative API base fails startup validation; missing deployment upstream is deployment/template substitution failure
Tests added                     : src/app/bootstrap/runtimeConfig.test.ts; src/app/bootstrap/reverseProxyConfig.test.ts
OpenAPI regeneration status     : no API contract changed; all existing deterministic generators passed product-head CI
Known backend gaps              : no authoritative production browser STOMP/WebSocket bearer-handshake contract
Product branch                  : hweb-015-03-same-origin-proxy
Product head                    : fc5c0fe277fc42136fba1a9617325f69510ec283
Product branch CI               : 34774779943 — SUCCESS
Final verification              : roadmap-inclusive exact-head CI, independent PR CI, guarded merge, exact merge-SHA main CI required
```

HWEB-015-04 must not begin until the roadmap-inclusive HWEB-015-03 head passes full CI, its exact PR head is independently verified, the guarded merge succeeds, and exact merge-SHA `main` CI is accepted.
