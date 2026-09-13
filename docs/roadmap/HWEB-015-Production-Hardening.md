# HWEB-015 — Production Hardening

Status: HWEB-015-07 COMPLETE / HWEB-015-08 NEXT

## Accepted starting point

```text
HidraWEB verified main       : 15f44543a8f32863762bba908abb6af3c92a4092
HWEB-015-06 exact-main CI    : 34781152538 — SUCCESS
HidraAPI audited main        : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Current completed task       : HWEB-015-07 — bundle analysis and route-level lazy loading budgets
Next task                    : HWEB-015-08 — large-grid/map/chart performance tests
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

`src/app/bootstrap/reverseProxyConfig.test.ts` verifies the existing API/SSE/WebSocket routing, immutable Vite asset caching, application-shell revalidation, and the checked-in security-header policy.

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
PR / final head                 : #78 / 25aaebba6cd33c7cdffa88b92fe95e426e303a82
Roadmap-inclusive CI            : 34776041879 — SUCCESS
Independent PR CI               : 34776236857 — SUCCESS
Merge SHA                       : 97876cab44dbb956ab5c2a26468eb8f7fb047abb
Exact-main CI                   : 34776455174 — SUCCESS
```

## HWEB-015-05 — frontend observability, structured technical error reporting and correlation IDs — COMPLETE

### Scope

HWEB-015-05 hardens browser-side diagnostics only. It does not start HWEB-015-06 accessibility auditing or any later production-hardening work.

### Verified HidraAPI diagnostic contract

HidraAPI was re-audited at:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
```

`HidraRequestContextFilter` proves the implemented HTTP contract:

```text
X-Correlation-Id
X-Request-Id
```

For each inbound request the backend preserves a supplied value or generates a UUID, writes both identifiers into logging/MDC context, and echoes both headers on the response. `HidraGlobalExceptionHandler` additionally publishes `correlationId` and `requestId` on globally handled ProblemDetail responses.

No browser trace/span header contract was found, so HWEB-015-05 does not invent one.

### Central HTTP diagnostic propagation

The central Axios transport now uses the exact backend header names. For every HidraAPI request it preserves caller-provided diagnostic IDs or generates independent UUIDs for correlation and request identity.

`HidraApiError` diagnostic precedence is:

```text
ProblemDetail body
  -> echoed response header
  -> originating request header
```

The final fallback preserves diagnostic support references even for network failures where no HTTP response exists.

### Structured technical-error reporting

`src/app/observability/technicalErrorReporter.ts` defines a constrained, vendor-neutral report with:

```text
schemaVersion
eventId
occurredAt
source
message
errorName
route
correlationId
requestId
http.method
http.path
http.status
http.code
```

Sources are `api`, `react`, `window`, and `unhandled-rejection`.

Browser routes and API URLs are normalized to pathname-only values. Query strings and fragments are excluded. The reporter accepts no request/response body, authorization header, token, browser-storage content, OIDC transaction secret, user identity, role, or permission field.

### Reporting policy

The Axios response interceptor automatically reports only technical transport/server failures:

```text
network/no-response failure
HTTP 5xx
```

Expected application outcomes such as `400`, `401`, `403`, `404`, `409`, and `422` continue through existing application/auth/business handling and are not promoted to automatic technical-error noise.

The React application error boundary reports uncaught render failures, replaces raw exception detail with a safe generic fallback, and gives the operator a generated support event reference.

Global browser `error` and `unhandledrejection` events use stable generic messages plus exception type only; arbitrary runtime exception messages are not copied into the structured report.

### Sink boundary

No repository-approved remote browser telemetry vendor or HidraAPI technical-error ingestion endpoint exists. HWEB-015-05 therefore does not invent one.

Reports are emitted through the local browser event:

```text
hidra:technical-error
```

and an exported configurable sink. Without an approved sink, the structured event is logged locally to the browser console.

A future remote sink requires explicit contract/privacy/authentication review and may require a reviewed HWEB-015-04 CSP `connect-src` change.

### Realtime boundary

The HWEB-015-02 WebSocket/STOMP authentication evidence gap remains unchanged. HWEB-015-05 does not invent WebSocket diagnostic headers, STOMP correlation semantics, or distributed trace identifiers.

### Artifacts and tests

- `src/api/client/diagnosticHeaders.ts` centralizes exact header names and case-insensitive diagnostic-header reads.
- `src/api/client/hidraAxios.ts` preserves/generates correlation and request IDs and reports network/5xx technical failures.
- `src/api/errors/HidraApiError.ts` retains body/response/request diagnostic identifiers.
- `src/app/observability/technicalErrorReporter.ts` implements the safe structured reporter and global browser hooks.
- `src/app/providers/AppErrorBoundary.tsx` reports render failures without exposing raw exception text.
- `src/main.tsx` installs global technical-error reporting.
- `docs/deployment/Frontend-Observability.md` records the production diagnostic contract and privacy boundary.
- Tests cover request ID generation/preservation, diagnostic precedence, network fallback IDs, safe URL normalization, 5xx reporting, global browser failures, and render-boundary reporting.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : existing HTTP responses/ProblemDetail only; no new endpoint or DTO
Headers used                    : X-Correlation-Id; X-Request-Id
Permissions used                : none introduced or changed
Frontend routes created/changed : none
State ownership                 : no persistent application state; reporter sink/listeners are process-local only
Error states                    : network/no-response and HTTP 5xx are technical reports; existing 4xx behavior remains authoritative
Tests added/changed             : src/api/client/hidraAxios.test.ts; src/api/errors/HidraApiError.test.ts; src/app/observability/technicalErrorReporter.test.ts; src/app/providers/AppErrorBoundary.test.tsx
OpenAPI regeneration status     : no API contract changed; all deterministic generators passed product-head CI
Known integration gap           : no approved remote browser telemetry ingestion endpoint/vendor; no browser trace/span contract; realtime auth/diagnostic semantics remain unproven
Product branch                  : hweb-015-05-observability-correlation
Product head                    : 043e401cee4473dc8e0b0070adfb49da0b498924
Product branch CI               : 34777158465 — SUCCESS
Final verification              : roadmap-inclusive exact-head CI, independent PR CI, guarded merge, exact merge-SHA main CI required
```

HWEB-015-06 was authorized only after HWEB-015-05 had been independently verified, guarded-merged, and accepted on exact merge-SHA `main` CI.

## HWEB-015-06 — WCAG 2.2 AA audit including keyboard-only control-room workflows — COMPLETE

### Scope

HWEB-015-06 audits and hardens existing HidraWEB operator surfaces for WCAG 2.2 AA and keyboard-only use. It does not start HWEB-015-07 bundle analysis or any later performance milestone, and it does not alter HidraAPI authorization or business-state ownership.

### Audit findings and hardening

The authenticated shell now exposes a focus-revealed bypass link that moves keyboard focus directly to the programmatically focusable `main` landmark without adding the landmark to sequential tab order.

Primary navigation now exposes the exact active route using `aria-current="page"`, while authorization visibility continues to be governed by the existing backend route-descriptor and effective-permission intersection.

The shared Material UI baseline adds a three-pixel `:focus-visible` outline with an offset so keyboard focus is not suppressed by individual operator controls.

Destructive administration confirmation dialogs explicitly associate title, description, and confirmation instructions and initially focus the safe Cancel action. Material UI Dialog retains modal focus containment and focus restoration.

### Non-text and data-intensive surfaces

The MapLibre map remains a named spatial visualization rather than an independent source of business truth. The topology workspace already renders the same backend feature window through `TopologyFeatureList`, whose ordinary Inspect buttons provide keyboard access to feature inspection without pointer-only map interaction.

The generic workbench already uses semantic Material UI table elements and ordinary buttons for row inspection and pagination. Accessibility hardening does not derive frontend resource identifiers or business meaning from backend Java entity names.

### Documentation and tests

`docs/deployment/Accessibility-WCAG-2.2-AA.md` records the audited surfaces, keyboard workflow, focus/dialog rules, textual-alternative policy, external-IdP boundary, and regression rules. `README.md` links this production accessibility contract.

`tests/e2e/accessibility-keyboard.spec.ts` verifies a keyboard-only authenticated-shell path: focus and activate the bypass link, confirm focus on the main landmark, verify current-page semantics, focus another backend-authorized navigation action, activate it with Enter, and verify `aria-current` follows the route.

No new axe/scanner dependency was added; the milestone uses the repository's existing Playwright/Vitest/React Testing Library toolchain plus the documented manual audit boundary.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : none added or changed; existing permission/topology/workbench contracts only
Permissions used                : no permission introduced or changed
Frontend routes created/changed : none
State ownership                 : no new server or business state; focus remains transient browser presentation state
Tests added/changed             : tests/e2e/accessibility-keyboard.spec.ts
Documentation                   : docs/deployment/Accessibility-WCAG-2.2-AA.md; README.md
OpenAPI regeneration status     : no API contract changed; all deterministic generators passed product-head CI
Known external boundary         : enterprise IdP accessibility remains owned by the external IdP UI; HidraWEB does not claim compliance for another origin
Product branch                  : hweb-015-06-wcag-keyboard
Product head                    : 0c8e1e9540c4ba370ece01112704071690ad2b01
Product branch CI               : 34780453891 — SUCCESS
Final verification              : roadmap-inclusive exact-head CI, independent PR CI, guarded exact-head merge, exact merge-SHA main CI required
```

HWEB-015-07 was authorized only after HWEB-015-06 had been independently verified, guarded-merged, and accepted on exact merge-SHA `main` CI.

## HWEB-015-07 — bundle analysis and route-level lazy loading budgets — COMPLETE

### Scope

HWEB-015-07 reduces startup JavaScript and freezes measurable bundle regression budgets. It does not start HWEB-015-08 large-grid/map/chart runtime performance testing and does not change any HidraAPI endpoint, DTO, permission, business rule, or route-authorization contract.

### Baseline and route splitting

The accepted HWEB-015-06 production build emitted an eager application chunk of approximately 1,198.17 kB minified plus the existing 1,019.02 kB MapLibre adapter. Vite reported oversized chunks and recommended dynamic imports/code splitting.

`src/app/router/router.tsx` now retains the authentication guard, permission bootstrap boundary, application shell, and router infrastructure in the startup graph while loading implemented page modules through React Router route-level `lazy` functions. Authentication and backend-authoritative permission checks therefore remain unchanged; lazy loading is only a delivery optimization.

The split build emits 24 lazy route entries. The measured largest lazy route chunk is approximately 39.7 KiB, while the principal application chunk fell to approximately 435.09 kB minified. The existing MapLibre adapter remains the largest individual JavaScript chunk at approximately 995.1 KiB when measured in binary KiB.

### Deterministic bundle budgets

Vite now emits `dist/.vite/manifest.json`, and `scripts/check-bundle-budgets.mjs` reads that manifest after every production build. `npm run build` fails if the manifest-based regression budgets are exceeded:

```text
initial static JavaScript      <= 900 KiB
individual lazy route chunk    <= 96 KiB
any JavaScript chunk           <= 1050 KiB
lazy route entries             >= 20
```

The startup budget covers the entry and its synchronous import closure only. The route-entry minimum prevents route modules from silently returning to the startup graph. The absolute ceiling narrowly accommodates the existing MapLibre adapter without masking uncontrolled growth.

### Documentation and CI

`docs/deployment/Bundle-Budgets.md` records the accepted baseline, lazy-loading boundary, authorization invariants, manifest analysis, measured output, enforced budgets, and regression rules. `README.md` links the production bundle policy.

The budget checker is part of the normal `npm run build` path, so product-head, roadmap-inclusive, pull-request, and exact-main CI all enforce the same production constraints without a new dependency.

### Completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : none added or changed
Permissions used                : none introduced or changed; existing authentication/permission boundaries preserved
Frontend routes created/changed : no URL added or removed; existing page routes converted to React Router lazy modules
State ownership                 : no new server/business state
Bundle analysis                 : Vite manifest; 24 lazy route entries; 869.6 KiB synchronous startup graph; ~39.7 KiB largest lazy route chunk
Enforced budgets                : startup <= 900 KiB; route <= 96 KiB; any JS <= 1050 KiB; lazy routes >= 20
Documentation                   : docs/deployment/Bundle-Budgets.md; README.md
OpenAPI regeneration status     : no API contract changed; all deterministic generators passed product-head CI
Product branch                  : hweb-015-07-bundle-lazy-loading
Product head                    : afb8660c4127ba93010628c8246b79a24a581ef9
Product branch CI               : 34784129350 — SUCCESS
Final verification              : roadmap-inclusive exact-head CI, independent PR CI, guarded exact-head merge, exact merge-SHA main CI required
```

HWEB-015-08 must not begin until the roadmap-inclusive HWEB-015-07 head passes full CI, its exact PR head is independently verified, the guarded merge succeeds, and exact merge-SHA `main` CI is accepted.
