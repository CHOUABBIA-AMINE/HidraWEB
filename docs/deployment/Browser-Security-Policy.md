# HidraWEB Production Browser Security Policy

Status: HWEB-015-04 production hardening

## 1. Scope

This policy hardens the browser-facing deployment established by HWEB-015-03. It covers public TLS requirements, HTTP-to-HTTPS redirect expectations, HSTS, Content Security Policy, secure browser response headers, and static asset cache behavior.

It does not introduce observability, correlation IDs, frontend telemetry, error reporting, accessibility work, bundle optimization, or later HWEB-015 tasks.

## 2. TLS termination boundary

The checked-in HidraWEB Nginx template listens on the internal deployment port. Production public TLS terminates at the approved ingress, reverse proxy, or load balancer in front of that listener.

The public edge must:

- expose HidraWEB only through HTTPS;
- redirect public HTTP requests to the equivalent HTTPS URL before application handling;
- support TLS 1.2 or TLS 1.3 only;
- use deployment-managed certificates and private keys outside the frontend repository;
- reject invalid or expired certificates rather than allowing browser bypass;
- preserve the public host and scheme through the forwarding headers already required by HWEB-015-03.

The repository deliberately does not invent certificate paths, certificate authorities, ingress products, cipher-suite configuration, Kubernetes secrets, container secrets, or production hostnames.

## 3. HSTS

Browser responses include:

```text
Strict-Transport-Security: max-age=63072000
```

This is a two-year HTTPS-only policy for the current host.

`includeSubDomains` and `preload` are intentionally not enabled by the repository because they create organization-wide DNS/TLS commitments that cannot be inferred safely from HidraWEB. A deployment owner may adopt them only after confirming every affected subdomain is permanently HTTPS-capable and completing the external preload process if desired.

HSTS is effective only when the public edge actually serves the response over HTTPS; it is not a substitute for the mandatory HTTP-to-HTTPS redirect.

## 4. Content Security Policy

The checked-in header template is:

```text
deploy/nginx/hidra-security-headers.conf.template
```

The production CSP is:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
frame-src 'none';
form-action 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self' ${HIDRA_OIDC_ORIGIN};
worker-src 'self' blob:;
manifest-src 'self';
upgrade-insecure-requests
```

### OIDC connection source

HWEB-015-02 performs OpenID Provider discovery and the authorization-code token exchange directly against the authoritative external issuer. Production CSP therefore cannot be limited to `connect-src 'self'`.

The reverse-proxy deployment must substitute:

```text
HIDRA_OIDC_ORIGIN
```

with the exact approved HTTPS origin of the enterprise IdP used by the backend-published OIDC contract, for example:

```text
https://idp.example.invalid
```

This value is an origin only, not a browser secret. The repository does not broaden `connect-src` to arbitrary HTTPS hosts and does not hard-code an IdP vendor.

### Inline style boundary

`style-src` currently contains `'unsafe-inline'` because the React/Material UI stack uses runtime style injection. Script execution remains restricted to same-origin resources and does not enable `'unsafe-inline'` or `'unsafe-eval'`.

Removing inline-style allowance would require a separate nonce/hash integration through the application styling pipeline and is not silently invented by this deployment task.

## 5. Additional browser response headers

The deployment emits:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

`X-Frame-Options: DENY` is retained as defense in depth alongside CSP `frame-ancestors 'none'`.

The current HidraWEB source does not use camera, microphone, geolocation, or payment browser capabilities, so those capabilities are denied by default. Future features requiring one of them must change this policy explicitly rather than relying on ambient browser permission.

## 6. Static asset cache policy

Vite production builds emit fingerprinted files under `/assets/`. These URLs are content-addressed and receive:

```text
Cache-Control: public, max-age=31536000, immutable
```

The application shell `/index.html` receives:

```text
Cache-Control: no-cache
```

This requires revalidation of the HTML shell so a deployment can publish new fingerprinted asset URLs without clients remaining pinned to an old shell.

The `/api/*` reverse-proxy paths are not assigned frontend static cache policy. Cache semantics for API responses remain backend-owned.

## 7. Nginx header inheritance

Nginx stops inheriting parent `add_header` directives when a child location defines its own `add_header`. The `/assets/` and `/index.html` locations therefore re-include the security header snippet before adding their Cache-Control headers.

Deployments must render the checked-in security header template to:

```text
/etc/nginx/snippets/hidra-security-headers.conf
```

and substitute `HIDRA_OIDC_ORIGIN` before Nginx starts.

## 8. Deployment verification

A production release must verify at the public HTTPS origin that:

```text
[ ] HTTP redirects to HTTPS before application handling.
[ ] TLS 1.0 and TLS 1.1 are not accepted.
[ ] HTTPS responses carry HSTS.
[ ] HTML responses carry the checked-in CSP and secure headers.
[ ] CSP connect-src contains only self plus the approved IdP origin.
[ ] /assets/* carries one-year immutable caching.
[ ] /index.html carries no-cache revalidation semantics.
[ ] /api/* remains path-preserving and is not assigned frontend immutable caching.
[ ] SSE remains unbuffered.
[ ] WebSocket Upgrade forwarding remains intact.
```

## 9. Explicit exclusions

HWEB-015-04 does not define WAF rules, rate limits, DDoS controls, secrets management, certificate rotation automation, observability/error-reporting pipelines, correlation IDs, frontend analytics, accessibility remediation, performance budgets, or deployment rollback procedures.

Those concerns remain owned by their later roadmap tasks or external platform operations.
