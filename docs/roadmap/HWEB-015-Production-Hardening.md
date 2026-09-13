# HWEB-015 — Production Hardening

Status: HWEB-015-04 COMPLETE / HWEB-015-05 NEXT

## Accepted starting point

```text
HidraWEB verified main       : 9b20714ae8250db649799dd39b1e4ff8a1b1b86b
HWEB-015-03 exact-main CI    : 34775419556 — SUCCESS
HidraAPI audited main        : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Current completed task       : HWEB-015-04 — CSP, TLS, secure headers and static asset cache policy
Next task                    : HWEB-015-05 — observability, error reporting and correlation IDs
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

HWEB-015-03 established the production same-origin browser topology, exact `/api/*` forwarding, SSE buffering behavior, WebSocket Upgrade forwarding, React Router history fallback, and fail-closed runtime API-base validation without inventing realtime authentication semantics.

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : existing /api/* routes; /api/v1/realtime/sse; /api/v1/realtime/ws; no new DTO
Permissions used                : none introduced; proxy is transport-only and does not alter authorization
Frontend routes created/changed : none
State ownership                 : no new application state
Tests added                     : src/app/bootstrap/runtimeConfig.test.ts; src/app/bootstrap/reverseProxyConfig.test.ts
OpenAPI regeneration status     : no API contract changed; all deterministic generators passed CI
Known backend gaps              : no authoritative production browser STOMP/WebSocket bearer-handshake contract
Product branch                  : hweb-015-03-same-origin-proxy
Product head                    : fc5c0fe277fc42136fba1a9617325f69510ec283
Product branch CI               : 34774779943 — SUCCESS
PR / final head                 : #77 / 70f5612c2ad918a1c084dc03777997367352a169
Roadmap-inclusive CI            : 34775033864 — SUCCESS
Independent PR CI               : 34775246488 — SUCCESS
Merge SHA                       : 9b20714ae8250db649799dd39b1e4ff8a1b1b86b
Exact-main CI                   : 34775419556 — SUCCESS
```

## HWEB-015-04 — CSP, TLS, secure headers and static asset cache policy — COMPLETE

### Scope

HWEB-015-04 hardens only the browser-facing deployment defined by HWEB-015-03. It does not start HWEB-015-05 observability, error reporting, correlation-ID propagation, telemetry, or later production-hardening tasks.

### Backend and deployment evidence

HidraAPI was re-audited at:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
```

No competing repository-owned HSTS, CSP, or frontend static-cache policy was found in HidraAPI. Browser-facing hardening therefore remains owned by the production edge/static reverse-proxy tier.

The HWEB-015-03 same-origin routes remain unchanged:

```text
/                         HidraWEB static application
/api/*                    HidraAPI
/api/v1/realtime/sse      HidraAPI SSE
/api/v1/realtime/ws       HidraAPI STOMP/WebSocket transport
```

### TLS boundary

The checked-in HidraWEB Nginx template remains an internal listener. Production public TLS terminates at the approved ingress, reverse proxy, or load balancer in front of it.

The frozen deployment policy requires the public edge to:

- expose HidraWEB through HTTPS;
- redirect HTTP to the equivalent HTTPS URL before application handling;
- support TLS 1.2 or TLS 1.3 only;
- use deployment-managed certificates/private keys outside the frontend repository;
- preserve the public host/scheme through the existing forwarding headers.

The repository does not invent certificate paths, ingress products, DNS names, cipher configuration, secret names, or certificate-rotation mechanics.

### HSTS

Browser-facing responses include:

```text
Strict-Transport-Security: max-age=63072000
```

`includeSubDomains` and `preload` are deliberately not frozen by the repository because they create organization-wide DNS/TLS commitments beyond HidraWEB evidence. They may only be enabled by deployment owners after validating all affected subdomains and any external preload requirements.

### Content Security Policy

The checked-in header template is:

```text
deploy/nginx/hidra-security-headers.conf.template
```

The CSP restricts content to same-origin defaults, denies objects/frames/embedding, restricts scripts to same-origin resources, upgrades insecure subresource requests, and keeps external browser connectivity limited to same-origin plus the authoritative enterprise IdP origin.

Because HWEB-015-02 performs OIDC discovery/token exchange directly against the external issuer, the deployment must substitute:

```text
HIDRA_OIDC_ORIGIN
```

with the exact approved HTTPS IdP origin. HidraWEB does not weaken `connect-src` to arbitrary HTTPS origins and does not hard-code an IdP vendor.

`style-src 'unsafe-inline'` remains narrowly required by the current React/Material UI runtime style-injection stack. `script-src` does not allow `'unsafe-inline'` or `'unsafe-eval'`.

### Secure browser headers

The reverse-proxy policy emits:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

The current frontend source does not use those denied browser capabilities. Any future requirement must explicitly update this policy rather than relying on ambient permission.

### Static asset cache policy

Vite fingerprinted `/assets/*` files receive:

```text
Cache-Control: public, max-age=31536000, immutable
```

The application shell receives:

```text
Cache-Control: no-cache
```

so `/index.html` revalidates and can publish new fingerprinted asset URLs after deployment.

Frontend static cache rules are not applied to `/api/*`; API cache semantics remain backend-owned.

### Nginx inheritance boundary

`deploy/nginx/hidraweb.conf.template` includes the checked-in security-header snippet at server scope and re-includes it for `/assets/` and `/index.html`, because those locations define their own `Cache-Control` header and therefore must not accidentally drop the parent `add_header` policy.

Deployments render:

```text
deploy/nginx/hidra-security-headers.conf.template
```

to the runtime include path:

```text
/etc/nginx/snippets/hidra-security-headers.conf
```

with the exact deployment-owned `HIDRA_OIDC_ORIGIN` substitution before Nginx starts.

### Deployment artifacts

- `deploy/nginx/hidra-security-headers.conf.template` defines HSTS/CSP/browser headers.
- `deploy/nginx/hidraweb.conf.template` applies the header include and cache policy without changing API/realtime routes.
- `docs/deployment/Browser-Security-Policy.md` records TLS, CSP, header, cache, and operational verification boundaries.
- `.env.production.example` records the non-secret IdP-origin substitution example.
- `README.md` links the production browser security policy.

### Tests

`src/app/bootstrap/reverseProxyConfig.test.ts` now verifies:

- existing API/SSE/WebSocket routing remains intact;
- Vite `/assets/` receives one-year immutable caching;
- `/index.html` uses revalidation (`no-cache`);
- the checked-in security-header template is required;
- HSTS, CSP, `frame-ancestors`, exact IdP `connect-src`, `upgrade-insecure-requests`, MIME sniffing protection, frame denial, referrer policy, and permissions policy are present.

### Explicitly deferred to HWEB-015-05

HWEB-015-04 does not implement frontend observability, structured error reporting, correlation-ID capture/propagation, telemetry export, logging sinks, or monitoring dashboards. Those belong to HWEB-015-05.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : no new endpoint or DTO; existing same-origin /api/* and OIDC issuer contract only
Permissions used                : none introduced or changed
Frontend routes created/changed : none
State ownership                 : no new application/runtime state
Error states                    : invalid/missing deployment substitutions or TLS edge configuration are deployment failures; application auth semantics unchanged
Tests added/changed             : src/app/bootstrap/reverseProxyConfig.test.ts
OpenAPI regeneration status     : no API contract changed; all deterministic generators passed product-head CI
Known deployment inputs         : HIDRA_API_UPSTREAM; exact VITE_HIDRA_OIDC_REDIRECT_URI; exact HIDRA_OIDC_ORIGIN; deployment-managed TLS certificate configuration
Product branch                  : hweb-015-04-browser-security-policy
Product head                    : 3daf5dd462cc1ea22e9054c0e3917804adbf3474
Product branch CI               : 34775803181 — SUCCESS
Final verification              : roadmap-inclusive exact-head CI, independent PR CI, guarded merge, exact merge-SHA main CI required
```

HWEB-015-05 must not begin until the roadmap-inclusive HWEB-015-04 head passes full CI, its exact PR head is independently verified, the guarded merge succeeds, and exact merge-SHA `main` CI is accepted.
