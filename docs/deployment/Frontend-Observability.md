# HidraWEB Frontend Observability and Diagnostic Correlation

Status: HWEB-015-05 production observability contract

## 1. Scope

HWEB-015-05 defines the browser-side technical observability contract for:

- HTTP correlation and request identifiers;
- structured technical error reports;
- React render-boundary failures;
- unhandled browser errors and promise rejections;
- network and HidraAPI `5xx` failures.

It does not add a vendor-specific telemetry SDK, a new HidraAPI ingestion endpoint, user analytics, session replay, business-event tracking, or a monitoring dashboard.

## 2. Verified HidraAPI diagnostic contract

HidraAPI was re-audited at:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
```

`HidraRequestContextFilter` accepts or generates these headers for every HTTP request:

```text
X-Correlation-Id
X-Request-Id
```

It places both identifiers into backend logging/request context and echoes both identifiers on the HTTP response.

`HidraGlobalExceptionHandler` also exposes the active values as `correlationId` and `requestId` properties on globally handled `ProblemDetail` responses.

These are implemented backend contracts, not frontend-generated assumptions.

## 3. Frontend request behavior

The central Axios transport now uses the exact backend header names:

```text
X-Correlation-Id
X-Request-Id
```

For each HidraAPI request:

1. an explicitly supplied identifier is preserved;
2. otherwise the browser generates a UUID;
3. both identifiers travel through the same central Axios transport;
4. response `ProblemDetail` identifiers are preferred when present;
5. echoed response headers are the next diagnostic source;
6. original request headers are retained as the fallback for network failures where no HTTP response exists.

This preserves backend authority while still giving failed browser requests a support reference when the network fails before HidraAPI can respond.

## 4. `HidraApiError` diagnostic fields

`HidraApiError` now retains:

```text
status
correlationId
requestId
problem
```

Identifier precedence is:

```text
ProblemDetail body
  -> response header
  -> originating request header
```

Existing user-facing states may continue showing the backend correlation reference where useful. `requestId` is additionally available to diagnostics and support tooling without requiring every feature view to duplicate diagnostic UI.

## 5. Structured technical-error report

`src/app/observability/technicalErrorReporter.ts` emits a constrained report containing technical metadata only:

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

Supported sources are:

```text
api
react
window
unhandled-rejection
```

The browser route and API path are reduced to pathname-only values. Query strings and URL fragments are deliberately excluded.

## 6. Reporting policy

The central HidraAPI interceptor reports only technical transport/server failures:

```text
no HTTP response / network failure
HTTP 5xx
```

Expected application outcomes such as `400`, `401`, `403`, `404`, `409` and `422` continue through their existing application/auth/business handling and are not automatically promoted into technical-error noise.

The React application error boundary reports uncaught render failures and displays a generated support event reference instead of exposing the raw exception message to the operator.

Global listeners report otherwise-unhandled browser `error` and `unhandledrejection` events with stable generic messages and the exception type only. Arbitrary exception messages are not copied into the structured report.

## 7. Privacy and security boundary

Technical reports must never contain:

- `Authorization` headers or bearer tokens;
- Basic-auth credentials;
- request or response bodies;
- form values;
- browser storage contents;
- OIDC authorization codes, PKCE verifiers, state or nonce values;
- query-string values;
- usernames, employee identity, roles or permissions merely for diagnostics;
- arbitrary business payloads.

The current reporter only accepts the narrow technical metadata listed above.

## 8. Sink strategy

No repository-approved remote browser telemetry service or HidraAPI error-ingestion endpoint exists at this task boundary.

HidraWEB therefore does not invent one.

Each technical report is emitted as the browser event:

```text
hidra:technical-error
```

A deployment-approved integration can subscribe to this event or configure the exported technical-error sink. When no external sink is configured, the structured report is written to the browser console.

Any future remote sink must be introduced through an explicit reviewed task because it may require:

- a backend or external ingestion contract;
- data-retention/privacy approval;
- authentication rules;
- CSP `connect-src` changes from HWEB-015-04;
- production secret/configuration handling.

## 9. Relationship to backend logs

The browser-generated/preserved `X-Correlation-Id` and `X-Request-Id` values are the bridge between frontend technical reports and HidraAPI request/MDC logging context.

HidraWEB does not manufacture backend trace/span identifiers. If distributed tracing is later exposed through a formal browser contract, it must be added separately.

## 10. Realtime boundary

This task does not invent WebSocket/STOMP authentication or tracing headers. The existing HWEB-015-02 realtime authentication evidence gap remains unchanged.

SSE/STOMP transport observability may consume future backend-supported identifiers, but HWEB-015-05 does not create unsupported realtime protocol fields.

## 11. Acceptance checks

HWEB-015-05 is accepted only when:

```text
[ ] central Axios requests preserve or generate X-Correlation-Id;
[ ] central Axios requests preserve or generate X-Request-Id;
[ ] ProblemDetail/body identifiers override echoed/request fallback identifiers;
[ ] echoed response identifiers are retained by HidraApiError;
[ ] network failures retain originating request identifiers;
[ ] API network/5xx failures emit structured technical reports;
[ ] report paths exclude query strings/fragments;
[ ] report payloads exclude auth headers, bodies and identity context;
[ ] React render failures emit a support event reference;
[ ] global browser errors/rejections use safe generic report messages;
[ ] no remote telemetry vendor or unsupported backend endpoint is invented;
[ ] full HidraWEB CI is green on the exact final task head.
```
