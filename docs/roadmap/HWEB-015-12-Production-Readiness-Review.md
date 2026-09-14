# HWEB-015-12 — Production Readiness Review

Status: REVIEW COMPLETE / PRODUCT-HEAD CI ACCEPTED / ROADMAP-INCLUSIVE CI PENDING

## Scope

HWEB-015-12 is the final evidence-based production-readiness review for the HidraWEB repository. It does not create a new product feature, backend route, permission, lifecycle transition, deployment vendor, identity-provider behavior, infrastructure secret, database recovery procedure, or client-owned business authority.

The review determines whether the cumulative HWEB-015 controls satisfy the roadmap exit condition:

> all functional, security, accessibility, performance and deployment gates are accepted.

## Audit baseline

```text
HidraWEB accepted starting main : e7ab8f401cf7ceffde0f68ca1b2cdbb645f61c94
HWEB-015-11 exact-main CI       : 34794197096 — SUCCESS
HidraAPI audited main           : 725a451ae4880ccb4f2ec508709241f88cd4aea7
HWEB-015-11 exact-main artifact : 10329157047
Artifact name                   : hidraweb-release-e7ab8f401cf7ceffde0f68ca1b2cdbb645f61c94
Artifact digest                 : sha256:5ce5e226dce38e72ef27d7fadd8b32ef45fb8d696b7fd7b5e25bfc6dde5477e6
Artifact size                   : 673908 bytes
Task branch                     : hweb-015-12-production-readiness-review
```

HidraAPI `main` remains at the same audited commit used by the accepted HWEB-015 OpenAPI compatibility baseline. No backend drift was detected at review start.

## Cumulative gate review

| Gate | Accepted control | Review verdict |
| --- | --- | --- |
| Enterprise authentication | HWEB-015-01 freezes external OIDC IdP + JWT bearer + Authorization Code with PKCE; backend authorization remains authoritative. | PASS |
| Token lifecycle | HWEB-015-02 uses issuer discovery, S256 PKCE, state/nonce verification, memory-only bearer storage, backend validation before session commit, and expiry/401 clearing. | PASS |
| Same-origin deployment | HWEB-015-03 keeps the browser on one public origin and explicitly proxies `/api/*`, SSE, and WebSocket transport without inventing realtime authentication semantics. | PASS |
| Browser security | HWEB-015-04 defines HTTPS/TLS ownership, HSTS, CSP, secure headers, SPA fallback, immutable fingerprinted assets, and `no-cache` application shell behavior. | PASS |
| Frontend observability | HWEB-015-05 propagates backend correlation/request IDs and reports constrained technical failures without leaking tokens, request bodies, user identity, or arbitrary exception text. | PASS |
| Accessibility | HWEB-015-06 records the WCAG 2.2 AA audit boundary and protects keyboard-only shell/navigation, bypass, focus-visible, dialog, map-alternative, and semantic table behavior. | PASS |
| Bundle performance | HWEB-015-07 enforces route-level lazy loading and deterministic Vite-manifest bundle budgets in every production build. | PASS |
| Runtime performance | HWEB-015-08 enforces deterministic hosted-CI budgets for a 200-row grid, 25,000-feature topology preprocessing, and a 10,000-point ECharts render. | PASS |
| Browser regression | HWEB-015-09 executes the complete Playwright suite and protects the representative monitoring → alarm → workflow operational journey. | PASS |
| Backend contract compatibility | HWEB-015-10 verifies all 18 feature OpenAPI inputs against the accepted full HidraAPI artifact before generation and already caught/corrected real alarm actor-authority drift. | PASS |
| Release/rollback | HWEB-015-11 packages the exact build plus deployment templates, verifies every file by SHA-256/source SHA, uploads only after Playwright, and requires immutable-artifact rollback rather than rebuilding old source. | PASS |
| Production readiness | HWEB-015-12 consolidates the accepted controls, deployment prerequisites, residual boundaries, and final release decision, then reruns the complete CI lifecycle on the review head. | PASS AT PRODUCT HEAD / FINAL LIFECYCLE PENDING |

## Current CI and release acceptance boundary

The checked-in `.github/workflows/ci.yml` is the cumulative repository acceptance path. It executes, in order:

1. clean `npm ci` installation with the pinned Node/npm baseline;
2. HidraAPI OpenAPI compatibility verification;
3. all 18 deterministic feature Orval generators;
4. lint;
5. TypeScript typecheck;
6. unit/component tests;
7. deterministic runtime performance tests;
8. production build, including bundle-budget enforcement;
9. release package creation bound to the exact workflow SHA;
10. independent release-manifest verification;
11. the complete Playwright Chromium regression suite;
12. verified release-artifact upload only after every preceding gate succeeds.

HWEB-015-12 does not create a weaker readiness-only pipeline. The final review must pass this same cumulative lifecycle at product head, roadmap-inclusive head, independent pull-request CI, and exact merge-SHA `main` CI.

## Product-head evidence

The exact review head passed the complete cumulative lifecycle without runtime-code changes or weakened gates:

```text
Product/review head             : 070e2dca5de9c2034112dd653b4023c7ffde013c
Product-head CI                 : 34796052204 — SUCCESS
Release artifact ID             : 10329198242
Release artifact name           : hidraweb-release-070e2dca5de9c2034112dd653b4023c7ffde013c
Release artifact digest         : sha256:ce3325bc5c8c4dd1d9e8a2ff8430589d795cf296b8425831d73aee5ad8a7e09d
Release artifact size           : 673907 bytes
```

That run passed OpenAPI compatibility, all 18 Orval generators, lint, typecheck, unit/component tests, runtime performance budgets, production build and bundle budgets, release packaging, release-manifest verification, the complete Playwright suite, and verified artifact upload.

## Production configuration prerequisites

Repository readiness is not a substitute for environment-specific deployment approval. A production promotion is permitted only when deployment owners provide and validate the existing accepted inputs:

```text
VITE_HIDRA_API_BASE_URL=/
VITE_HIDRA_AUTH_MODE=jwt
VITE_HIDRA_ENVIRONMENT=production
VITE_HIDRA_OIDC_REDIRECT_URI=<exact approved production callback URI>
HIDRA_OIDC_ORIGIN=<exact approved HTTPS enterprise IdP origin>
HIDRA_API_UPSTREAM=<approved internal HidraAPI upstream>
```

The public edge must provide approved HTTPS/TLS configuration and certificates, preserve the accepted same-origin routing model, render the checked-in Nginx templates with deployment-owned substitutions, and promote the exact verified artifact rather than rebuilding source at deployment time.

The deployment owner must retain the currently deployed and a known-good previous verified HidraWEB artifact according to organization retention policy and must execute the documented post-deployment/rollback smoke checks.

## Accepted non-blocking boundaries

The following are explicit boundaries, not silently filled assumptions:

- **Authenticated browser WebSocket/STOMP semantics:** no authoritative bearer-handshake contract has been published. HidraWEB must not invent query-string, cookie, subprotocol, or STOMP authentication behavior. This review does not certify such semantics as a production dependency.
- **Remote browser telemetry sink:** no approved ingestion endpoint/vendor exists. The accepted structured reporter remains vendor-neutral/local until a separately reviewed sink, privacy contract, authentication model, and CSP change exist.
- **External IdP UI:** HidraWEB certifies its own OIDC integration and accessibility boundary, not the accessibility, availability, or internal implementation of another origin.
- **Browser/GPU map timing:** hosted CI guards deterministic topology preprocessing rather than unstable GPU/WebGL wall-clock timing. This is the accepted HWEB-015-08 performance boundary.
- **Backend/database recovery:** HidraWEB release-artifact retention does not certify HidraAPI/PostgreSQL/IdP backup or restore. Those remain backend/infrastructure-owned recovery responsibilities.
- **Environment smoke/SLA evidence:** deterministic CI does not claim that a particular production DNS, certificate, IdP tenant, upstream, or network path is healthy. Promotion requires the documented environment smoke checks.

None of these boundaries authorize the frontend to invent missing contracts. If an environment requires one of the unproven capabilities as a hard production dependency, that deployment is **NO-GO** until the owning system publishes and validates the required contract.

## Production readiness decision

**Repository decision: GO, conditional on the normal HWEB-015-12 acceptance lifecycle and environment prerequisites above.**

HidraWEB is eligible for production artifact promotion when all of the following are true:

- the exact commit being promoted has a successful cumulative HidraWEB CI run;
- its uploaded release artifact is retained and verified against the exact source SHA;
- the deployed HidraAPI remains compatible with the accepted frontend contract;
- required production OIDC, upstream, TLS, and CSP deployment inputs are approved and correctly rendered;
- no deployment relies on an explicitly unproven browser realtime authentication contract;
- frontend rollback evidence is retained and backend/infrastructure recovery responsibilities are separately covered by their owners;
- the documented production smoke checks pass after promotion.

A failure of any required item above changes the deployment decision to **NO-GO** without weakening or bypassing the repository gate.

## Authoritative hardening evidence

The production decision is grounded in the accepted repository artifacts:

- `docs/12-Authentication-Specification.md`
- `docs/deployment/Same-Origin-Reverse-Proxy.md`
- `docs/deployment/Browser-Security-Policy.md`
- `docs/deployment/Frontend-Observability.md`
- `docs/deployment/Accessibility-WCAG-2.2-AA.md`
- `docs/deployment/Bundle-Budgets.md`
- `docs/deployment/Runtime-Performance-Budgets.md`
- `docs/deployment/Playwright-Regression-Suite.md`
- `docs/deployment/OpenAPI-Compatibility-Gate.md`
- `docs/deployment/Release-Artifact-Backup-Rollback.md`
- `.github/workflows/ci.yml`
- `.env.production.example`

## Mandatory task completion record

```text
Backend source commit / branch : 725a451ae4880ccb4f2ec508709241f88cd4aea7 / main
Endpoints and DTOs used         : no new endpoint or DTO; review consumes accepted HWEB-015 contracts only
Permissions used                : none introduced or changed; HidraAPI remains final authorization authority
Frontend routes created/changed : none
State ownership                 : no new browser, server, or business state
Error states                    : readiness is NO-GO when a required CI, artifact, compatibility, deployment-input, rollback-evidence, or smoke-check prerequisite fails
Tests added                     : none; the complete existing cumulative CI/test lifecycle is the acceptance evidence
OpenAPI regeneration status     : PASS — compatibility plus all 18 deterministic generators passed product-head CI 34796052204
Known backend gaps              : no authoritative browser WebSocket/STOMP bearer-handshake contract; no frontend-owned backend/database recovery semantics
Known external boundaries       : external IdP UI/accessibility/SLA; deployment TLS/certificates/DNS/upstream; optional remote telemetry sink; environment-specific smoke/SLA evidence
CI result                       : product-head CI 34796052204 — SUCCESS; roadmap-inclusive/PR/exact-main lifecycle pending
```

The HWEB-015 phase must not be declared complete until HWEB-015-12 passes roadmap-inclusive CI, independent PR CI, guarded exact-head merge verification, and exact merge-SHA `main` CI.