# REL-001 — HidraWEB Staging / UAT Release Candidate

Status: **PREPARED — STAGING DEPLOYMENT / UAT EXECUTION PENDING**

## 1. Purpose

REL-001 freezes the reconciled HidraWEB R17 baseline as the first staging/UAT release candidate and defines the exact promotion, configuration, smoke-test, rollback, and acceptance evidence required before any production promotion.

This task does not modify HidraWEB runtime behavior. It does not create backend routes, business rules, permissions, provider semantics, realtime event families, infrastructure secrets, or deployment-vendor assumptions.

## 2. Immutable release candidate

```text
Candidate label                    : hidraweb-v0.1.0-rc1
HidraWEB source SHA                : 8ea633123839abd810b7f0617a8190006baff0b5
Source commit                      : test(release): harden reconciled HidraWEB
HidraWEB CI                        : #929 / run 36718246071 — SUCCESS
Release artifact ID                : 11096704699
Release artifact name              : hidraweb-release-8ea633123839abd810b7f0617a8190006baff0b5
Release artifact size              : 674689 bytes
Release artifact SHA-256           : c4dda38e4e3003d8e7a5e0acab5bd3b841d98dc5475f188903ed54ad1f5af9e9
Artifact expiry                    : 2026-12-29T12:57:48Z
HidraAPI accepted main             : 260295c6eebc4b01922d2d488810a671305860a6
Verified OpenAPI-producing commit  : 63f3f60974ce57eb8cd5e42910397615195624fb
Verified HidraAPI OpenAPI CI run   : 36573899231
Feature consumer contracts         : 20
```

The staging deployment must use the exact artifact above. Do not rebuild the source SHA for promotion.

The label `hidraweb-v0.1.0-rc1` is the intended human release identifier. The immutable technical identity is the 40-character source SHA plus the GitHub Actions artifact ID/digest.

## 3. Required staging configuration inputs

Before deployment, the staging owner must provide approved values for:

```text
VITE_HIDRA_API_BASE_URL=/
VITE_HIDRA_AUTH_MODE=jwt
VITE_HIDRA_ENVIRONMENT=production
VITE_HIDRA_DEFAULT_LOCALE=fr
VITE_HIDRA_OIDC_REDIRECT_URI=<exact staging HTTPS callback URI>

HIDRA_OIDC_ORIGIN=<exact approved staging IdP HTTPS origin>
HIDRA_API_UPSTREAM=<approved internal staging HidraAPI upstream>
```

The repository does not define production/staging secrets, DNS names, certificates, client secrets, IdP credentials, load-balancer products, container registries, or orchestrator-specific values.

## 4. Deployment prerequisites

All boxes must be satisfied before the artifact is promoted to staging:

```text
[ ] Artifact ID 11096704699 is available and not expired.
[ ] Artifact name matches the exact source SHA.
[ ] Artifact digest matches c4dda38e4e3003d8e7a5e0acab5bd3b841d98dc5475f188903ed54ad1f5af9e9.
[ ] release-manifest.json is retained with the artifact.
[ ] Release verification is executed against source SHA 8ea633123839abd810b7f0617a8190006baff0b5.
[ ] Staging HidraAPI is compatible with the accepted frontend OpenAPI baseline.
[ ] Staging OIDC issuer/callback registration is approved.
[ ] Public HTTPS certificate and TLS termination are valid.
[ ] HIDRA_API_UPSTREAM is approved and reachable from the reverse-proxy tier.
[ ] HIDRA_OIDC_ORIGIN is rendered into the CSP template exactly.
[ ] Same-origin /api/* routing is preserved.
[ ] SSE and WebSocket transport paths are forwarded exactly as documented.
[ ] Current deployed frontend artifact, if any, is recorded before promotion.
[ ] At least one known-good compatible rollback artifact is retained.
```

## 5. Deployment procedure

1. Obtain the CI artifact `hidraweb-release-8ea633123839abd810b7f0617a8190006baff0b5`.
2. Verify the unpacked release with the source SHA set to `8ea633123839abd810b7f0617a8190006baff0b5`.
3. Keep `app/` unchanged.
4. Render deployment-owned substitutions in the checked-in Nginx templates:
   - `HIDRA_API_UPSTREAM`;
   - `HIDRA_OIDC_ORIGIN`.
5. Configure the public edge for HTTPS-only access and approved TLS policy.
6. Deploy the exact verified `app/` directory plus rendered Nginx configuration.
7. Record deployment timestamp, environment name, deployed source SHA, artifact ID, artifact digest, HidraAPI SHA, and operator.
8. Execute the smoke/UAT matrix below.
9. Do not declare staging accepted until all blocking checks pass.

## 6. Infrastructure / browser smoke matrix

| Check | Acceptance |
| --- | --- |
| Application shell | `/` loads the expected HidraWEB shell without console-blocking startup errors. |
| SPA routing | Direct navigation to representative application routes returns the application shell rather than a server 404. |
| Fingerprinted assets | `/assets/*` returns the deployed fingerprinted files successfully. |
| HTML caching | `/index.html` uses `Cache-Control: no-cache`. |
| Asset caching | fingerprinted assets use `public, max-age=31536000, immutable`. |
| HSTS | HTTPS response includes `Strict-Transport-Security: max-age=63072000`. |
| CSP | response includes the checked-in CSP with only `'self'` plus the approved IdP origin in `connect-src`. |
| Secure headers | nosniff, frame denial, referrer policy, and permissions policy are present. |
| Same-origin API | browser requests under `/api/*` reach staging HidraAPI without cross-origin browser configuration. |
| OIDC bootstrap | login entry point can reach the approved staging IdP and callback URI. |
| API authorization | backend 401 terminates session; backend 403 preserves the authenticated session and denies the operation. |
| SSE transport | `/api/v1/realtime/sse` is unbuffered at the proxy even though no domain event family is currently required. |
| WebSocket transport | `/api/v1/realtime/ws` forwards Upgrade correctly; no unsupported bearer-handshake semantics are assumed. |

## 7. Functional UAT matrix

### Authentication and authorization

```text
[ ] Login/OIDC session establishes successfully.
[ ] GET /api/v1/identity/me resolves the displayed authenticated principal.
[ ] Effective permissions load successfully.
[ ] Navigation is limited by backend-published route metadata plus effective grants.
[ ] A known 403 case remains authenticated and visibly denied.
[ ] A known 401 case clears the session.
```

### Organization / operational context

```text
[ ] Employee-linked responsibility assignments load.
[ ] Only ACTIVE canonical OperationalScope records become selectable.
[ ] Switching operational context updates the shell without inventing hierarchy ownership.
[ ] Ended/suspended/cancelled responsibility assignments are not selectable.
```

### Network / topology

```text
[ ] Layer catalog loads.
[ ] Pipeline systems, pipelines, facilities, topology nodes, segments, and connections render when present.
[ ] Search returns backend-published topology features.
[ ] Map and textual feature inspection expose the same backend feature evidence.
[ ] No fabricated geometry is displayed.
```

### Operations / telemetry / monitoring

```text
[ ] Telemetry latest/history/trend reads succeed for a known point.
[ ] Reading-state and quality-code references load.
[ ] Monitoring rules and deviations load.
[ ] Query refresh remains authoritative after navigation/reconnect.
[ ] No domain realtime topic is required for acceptance.
```

### Alarm and workflow

```text
[ ] Alarm list/detail loads.
[ ] A permitted acknowledgement succeeds.
[ ] Shelving is available only where the backend permits it.
[ ] Unshelve is exposed only for ACTIVE, not already-unshelved shelving evidence.
[ ] Closure follows the backend contract.
[ ] Workflow task inbox/detail/available-actions loads.
[ ] Only backend-returned permitted actions are executable.
[ ] Transition execution carries the backend task concurrency token.
[ ] A stale transition produces the expected conflict/refresh behavior.
```

### Events

```text
[ ] Incident reads load through HidraAPI.
[ ] Leak candidate/case reads load through HidraAPI.
[ ] HSE case/CAPA reads load through HidraAPI.
[ ] Browser traffic shows no direct LeakDetectionAPI dependency.
```

### Planning

```text
[ ] Planning periods, plans, revisions, and targets load.
[ ] Revision approval projection loads.
[ ] Only backend-returned approval actions are executable.
[ ] Approval execution uses currentTaskUpdatedAt as expectedTaskUpdatedAt.
[ ] Planned-vs-actual displays backend-owned Monitoring values without browser recomputation.
```

### Engineering

```text
[ ] Assets and Integrity generated-contract commands execute with permitted test data.
[ ] Maintainable-asset update respects expectedUpdatedAt concurrency.
[ ] Generic workbench remains secondary read/reference UX.
[ ] No B31G or other deferred calculation is fabricated by HidraWEB.
```

### Custody

```text
[ ] Measurement-period creation succeeds for permitted test data.
[ ] Transfer-ticket creation succeeds for permitted test data.
[ ] Discrepancy opening succeeds for permitted test data.
[ ] Supporting reads/references remain backend/workbench evidence.
[ ] No fiscal quantity or reconciliation formula is computed client-side.
```

### Intelligence

```text
[ ] Risk registers/assessments read successfully.
[ ] Analytics datasets/insights/metrics/evaluations read successfully.
[ ] Simulation models/scenarios/runs/recommendations read successfully.
[ ] Reporting definitions/requests/runs/artifacts read successfully.
[ ] UI shows backend-published values only.
[ ] No browser-side solver, KPI formula, or recommendation inference is used.
```

### Administration / documents

```text
[ ] Audit evidence search/detail loads.
[ ] Audit export request is permission-gated and records a backend request.
[ ] Configuration definition/feature-flag/value commands are permission-gated.
[ ] Document registration succeeds.
[ ] Binary document upload succeeds within the backend-published limit.
[ ] Document download returns the backend filename/content type.
[ ] Document target linking succeeds.
[ ] Integration monitoring remains evidence-only.
[ ] Notification center remains evidence-only.
[ ] No provider-specific retry/resend/lifecycle controls are invented.
```

## 8. Accessibility UAT

At minimum, execute manually in staging:

```text
[ ] Sign-in controls are keyboard operable.
[ ] Skip-to-main-content works.
[ ] Primary navigation is operable with keyboard only.
[ ] Current navigation item exposes accessible current-page state.
[ ] Focus remains visibly identifiable.
[ ] Dialog focus is contained and restored.
[ ] Destructive confirmations focus the safe path first.
[ ] Status/severity meaning is not conveyed by color alone.
[ ] Map information has a keyboard-operable textual inspection path.
[ ] Representative tables/forms expose usable names and labels to assistive technology.
```

External IdP accessibility remains owned by the IdP, not HidraWEB.

## 9. UAT severity / disposition

Use these classifications:

- **BLOCKER** — prevents authentication, route bootstrap, primary operational workflow, secure deployment, API compatibility, artifact verification, or safe rollback.
- **MAJOR** — supported backend capability is unusable or materially incorrect for normal operations.
- **MINOR** — non-blocking usability, presentation, copy, or low-risk workflow defect.
- **OBSERVATION** — improvement opportunity that does not contradict the accepted contract.

Every finding must include:

```text
Finding ID
Environment
HidraWEB SHA
HidraAPI SHA
Artifact ID
User role / effective permissions
Operational context
Route / workflow
Steps to reproduce
Expected backend-supported behavior
Observed behavior
Evidence (screenshot/log/request ID where appropriate)
Severity
Owner
Disposition
```

Do not fix UAT findings directly on the release candidate without first creating an explicit maintenance task.

## 10. Release acceptance

Staging/UAT is accepted only when:

```text
[ ] All infrastructure/browser smoke checks pass.
[ ] Authentication and authorization checks pass.
[ ] All blocking functional journeys pass.
[ ] Accessibility UAT checks pass.
[ ] No unresolved BLOCKER findings remain.
[ ] No unresolved MAJOR finding is accepted without a documented owner/disposition.
[ ] Release artifact identity is recorded in the UAT sign-off.
[ ] HidraAPI SHA/compatibility evidence is recorded.
[ ] Known-good rollback artifact is verified and retained.
[ ] Rollback procedure has an identified operator and execution path.
```

Passing repository CI alone is not sufficient for staging/UAT acceptance.

## 11. Rollback

Rollback must switch to a previously verified immutable artifact; do not rebuild an old commit.

After rollback, repeat the minimum smoke checks for:

- application shell;
- assets/cache policy;
- browser security headers;
- same-origin `/api/*`;
- OIDC entry/callback;
- representative authorized API read;
- frontend/backend compatibility.

Record both the failed candidate and restored artifact identities.

## 12. REL-001 result

REL-001 prepares the exact R17 release candidate and staging/UAT acceptance contract.

It does **not** claim that a staging environment has been deployed or that UAT has passed. Those require environment-owned values and execution evidence that are not present in the repository.

The next authorized post-reconciliation task is:

```text
ROADMAP-001 — define HidraWEB vNext product roadmap from current HidraAPI capabilities and UAT gaps
```
