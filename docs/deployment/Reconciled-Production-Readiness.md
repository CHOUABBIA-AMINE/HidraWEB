# HidraWEB Reconciled Production Readiness — HWEB-R17

Status: **RECONCILED RELEASE HARDENING ACCEPTED / EXACT-R17 CI PENDING**

## Scope

HWEB-R17 closes the reconciled HWEB-R01..R17 roadmap by validating the current HidraWEB product head against the repository's existing production-hardening controls. It does not add a product feature, backend route, provider behavior, business calculation, workflow transition, realtime event family, deployment secret, or environment-specific infrastructure assumption.

## Reconciled baseline

```text
HidraAPI main                         : 260295c6eebc4b01922d2d488810a671305860a6
Verified OpenAPI-producing commit     : 63f3f60974ce57eb8cd5e42910397615195624fb
Verified HidraAPI OpenAPI CI run      : 36573899231
HidraWEB product head before R17      : 53fdaaa27bf6da4ad05b95726241c0a6d082e14f
HidraWEB acceptance CI                : 36695054297 / #928 — SUCCESS
Feature OpenAPI/Orval contracts       : 20
Release artifact ID                   : 11087951409
Release artifact name                 : hidraweb-release-53fdaaa27bf6da4ad05b95726241c0a6d082e14f
Release artifact digest               : sha256:7966348b2df9ba78d243165c8877988572080400da0108485c5d9f1a226fb86e
Release artifact size                 : 674691 bytes
Release artifact expiry               : 2026-12-29T09:16:24Z
```

## Acceptance gate evidence

| Gate | Current evidence | Result |
| --- | --- | --- |
| OpenAPI compatibility | CI #928 step 5 passed against the pinned full HidraAPI baseline. | PASS |
| Generated clients | All 20 feature generators passed, including Assets and Integrity added by HWEB-R13. | PASS |
| Lint | CI #928 step 26. | PASS |
| TypeScript | CI #928 step 27. | PASS |
| Unit/component tests | CI #928 step 28. | PASS |
| Runtime performance | 2 files / 6 tests passed; production-hardening suite completed in 277 ms and Intelligence suite in 64 ms. | PASS |
| Production build | Vite production build and deterministic bundle-budget check passed. | PASS |
| Bundle budgets | Initial static JS 873.1 KiB / 900 KiB; 24 lazy route entries / minimum 20; largest lazy route 39.7 KiB / 96 KiB; largest JS chunk 995.4 KiB / 1050 KiB. | PASS |
| Release packaging | Exact source SHA packaged into the immutable release candidate. | PASS |
| Release verification | 54 release files independently verified against the exact source SHA. | PASS |
| Browser regression | Full Playwright Chromium suite: 60 passed. | PASS |
| Accessibility regression | The full Playwright run includes `tests/e2e/accessibility-keyboard.spec.ts`; repository accessibility rules remain governed by `docs/deployment/Accessibility-WCAG-2.2-AA.md`. | PASS |
| Artifact upload | Verified artifact uploaded only after all preceding CI gates succeeded. | PASS |

## Release boundaries

Repository readiness does not replace environment-specific promotion approval. Production promotion still requires:

- approved production OIDC values and exact callback URI;
- approved HTTPS/TLS certificates and edge configuration;
- approved HidraAPI upstream and same-origin reverse-proxy rendering;
- compatibility between the promoted frontend artifact and deployed HidraAPI;
- retention of the promoted artifact plus a known-good compatible rollback artifact;
- the documented post-deployment smoke checks.

The following remain explicit non-capabilities and must not be treated as release gaps to be filled in the browser:

- direct LeakDetectionAPI access;
- gRPC-Web / CPM / RTTM browser integration;
- domain realtime subscriptions while HidraAPI advertises no event families;
- frontend-owned risk/KPI/simulation calculations;
- provider-specific notification/integration lifecycle controls not published by HidraAPI;
- backend/database recovery semantics.

## Known non-blocking CI observation

The Playwright web server emitted a Vite dependency-optimizer warning for `maplibre-gl-worker.mjs`. The full 60-test browser suite still passed. This is recorded as non-blocking evidence, not silently promoted to a product contract or ignored as proof of a runtime failure. A future dependency/toolchain update may remove the warning if it can do so without weakening map behavior or the release gates.

## Reconciled release decision

**Repository decision: READY FOR CONTROLLED PROMOTION**, conditional on the deployment prerequisites above and on the exact HWEB-R17 commit passing the same cumulative CI lifecycle.

The release process must promote the verified artifact produced by CI for the exact commit being deployed. Rebuilding an older source SHA is not an acceptable rollback substitute.

## HWEB-R17 completion record

```text
Backend source SHA             : 260295c6eebc4b01922d2d488810a671305860a6
Frontend source before R17     : 53fdaaa27bf6da4ad05b95726241c0a6d082e14f
OpenAPI evidence               : 63f3f60974ce57eb8cd5e42910397615195624fb
Feature contracts              : 20
Realtime contract              : transport-configured-no-domain-publishers; eventFamilies=[]
Frontend routes changed        : none
Business state ownership       : unchanged
Product behavior changed       : none
Release acceptance evidence    : CI #928 / run 36695054297 — SUCCESS
Playwright                     : 60 passed
Performance                    : 6 passed
Verified release files         : 54
Artifact ID                    : 11087951409
Artifact digest                : sha256:7966348b2df9ba78d243165c8877988572080400da0108485c5d9f1a226fb86e
Exact-R17 CI                   : pending at commit creation
```
