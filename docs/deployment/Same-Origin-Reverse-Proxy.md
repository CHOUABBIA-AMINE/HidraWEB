# HidraWEB Same-Origin Reverse-Proxy Deployment

Status: HWEB-015-03 production deployment design

## 1. Decision

The supported production browser topology is same-origin:

```text
Browser
  -> https://<public-hidra-origin>/
       -> /                         HidraWEB static application
       -> /api/*                    HidraAPI HTTP APIs
       -> /api/v1/realtime/sse      HidraAPI SSE transport
       -> /api/v1/realtime/ws       HidraAPI STOMP/WebSocket transport
```

The public browser does not need a second HidraAPI origin. HidraWEB is built with:

```text
VITE_HIDRA_API_BASE_URL=/
```

Axios therefore sends existing `/api/...` paths back to the same public origin, where the reverse proxy forwards them to HidraAPI unchanged.

This design reduces production CORS surface area without changing HidraAPI endpoint paths or frontend authorization semantics.

## 2. Evidence and boundaries

Canonical HidraWEB architecture already prefers an HTTPS reverse proxy/gateway serving static assets at `/`, HidraAPI at `/api/*`, and realtime endpoints at the same browser origin.

Verified HidraAPI realtime transport paths include:

```text
GET /api/v1/realtime/sse
WS  /api/v1/realtime/ws
```

The WebSocket endpoint is registered by HidraAPI at `/api/v1/realtime/ws`.

HWEB-015-03 defines only transport/routing topology. It does not invent WebSocket bearer-token handshake semantics. The HWEB-015-02 authentication evidence gap remains in force until HidraAPI publishes an authoritative browser WebSocket authentication contract.

## 3. Reverse-proxy routing contract

The checked-in Nginx reference template is:

```text
deploy/nginx/hidraweb.conf.template
```

It requires one deployment substitution:

```text
HIDRA_API_UPSTREAM
```

The value is the internal HidraAPI upstream URL known to the deployment environment, for example an internal service URL. The repository does not freeze a Kubernetes service name, container DNS name, IP address, or production port.

Routing rules:

```text
/api/v1/realtime/ws  -> HidraAPI, preserving Upgrade headers
/api/v1/realtime/sse -> HidraAPI, proxy buffering disabled
/api/*                -> HidraAPI, original path preserved
/*                    -> HidraWEB static files with SPA history fallback
```

The proxy forwards `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, and `X-Forwarded-For` so downstream infrastructure can retain public-origin/request context.

## 4. Browser/API URL policy

Production browser API base:

```text
/
```

Development may continue using an absolute backend origin such as:

```text
http://localhost:8080
```

`src/app/bootstrap/runtimeConfig.ts` accepts exactly these two deployment shapes:

- the same-origin root `/`;
- an absolute URL.

Arbitrary relative API prefixes such as `/backend` are rejected so the application does not silently diverge from the frozen `/api/*` HidraAPI contract.

## 5. OIDC redirect contract

Same-origin API routing does not remove the external IdP registration requirement.

The browser OIDC callback remains:

```text
/auth/callback
```

The exact production value of:

```text
VITE_HIDRA_OIDC_REDIRECT_URI
```

must be the approved public URI registered at the enterprise IdP, normally shaped as:

```text
https://<public-hidra-origin>/auth/callback
```

The hostname is deployment-owned and is not invented by this repository.

OIDC issuer discovery and authorization/token endpoints remain external IdP URLs published through the authoritative HidraAPI OIDC bootstrap contract. They are not reverse-proxied through `/api/*` by this task.

## 6. CORS posture

Under the accepted production topology, browser calls to HidraAPI use the same public origin as HidraWEB. Production browser/API integration therefore does not require HidraWEB to depend on a cross-origin HidraAPI URL.

HidraAPI development CORS configuration may continue supporting local Vite development. HWEB-015-03 does not remove backend CORS support because non-production tooling and explicitly approved alternate deployment topologies may still need it.

## 7. Realtime transport behavior

SSE is routed through the same `/api/v1/realtime/sse` path with proxy buffering disabled so event delivery is not delayed by the proxy tier.

WebSocket transport is routed through `/api/v1/realtime/ws` with standard HTTP Upgrade forwarding.

These settings establish transport reachability only. They do not define STOMP destinations, subscription permissions, bearer propagation, cookie authentication, query-string credentials, or subprotocol authentication.

## 8. SPA routing

Requests that are not under `/api/` are resolved as static HidraWEB assets first and fall back to `/index.html`. This is required for browser refresh/deep-link behavior on React Router routes such as:

```text
/login
/auth/callback
/network
/operations
/events/...
```

The `/api/` prefix is never routed to the SPA fallback.

## 9. Deployment configuration example

`.env.production.example` records the supported production browser shape:

```text
VITE_HIDRA_API_BASE_URL=/
VITE_HIDRA_AUTH_MODE=jwt
VITE_HIDRA_ENVIRONMENT=production
VITE_HIDRA_OIDC_REDIRECT_URI=https://<approved-public-origin>/auth/callback
```

The committed `.invalid` hostname is only a non-routable example placeholder and must be replaced by deployment configuration.

`HIDRA_OPENAPI_URL` remains a Node/CI generation input. Browser same-origin routing does not redefine the deterministic OpenAPI generation source.

## 10. Explicitly deferred hardening

HWEB-015-03 does not define or add:

- TLS certificates, protocols, ciphers, HSTS, or redirect policy;
- Content-Security-Policy;
- `X-Content-Type-Options`, frame policy, referrer policy, or permissions policy;
- static asset cache-control/immutable caching;
- compression policy;
- WAF/rate-limit policy;
- production secrets management;
- frontend observability;
- WebSocket authentication semantics.

TLS, CSP, secure headers, and static asset cache policy belong to HWEB-015-04.

## 11. Acceptance checks

HWEB-015-03 is accepted only when:

```text
[ ] `VITE_HIDRA_API_BASE_URL=/` passes runtime configuration validation.
[ ] Absolute local-development API origins remain valid.
[ ] Arbitrary relative API prefixes fail closed.
[ ] `/api/*` is forwarded without path rewriting.
[ ] `/api/v1/realtime/sse` disables proxy buffering.
[ ] `/api/v1/realtime/ws` forwards WebSocket Upgrade headers.
[ ] Non-API routes use SPA history fallback.
[ ] No HWEB-015-04 TLS/header/cache policy is introduced early.
[ ] Full HidraWEB CI is green on the exact final task head.
```
