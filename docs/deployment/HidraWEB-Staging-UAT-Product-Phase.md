# HWEB-P12 — Product-Phase Staging / UAT Candidate

Status: **PREPARED — STAGING DEPLOYMENT / UAT EXECUTION PENDING**

## 1. Purpose

This record freezes the post-reconciliation product phase completed through HWEB-P11 as the next staging/UAT candidate after REL-001.

It does not claim that staging deployment or UAT has occurred. It records only repository, CI, release-artifact, and contract evidence that is actually available.

## 2. Immutable candidate evidence

```text
Candidate label                    : hidraweb-product-phase-2026-10-02
HidraWEB source SHA                : 99e03a193441ea26dcf4d155e729f92ab429a1a8
Source commit                      : fix(operations): align alarm workflow handoff e2e label
HidraWEB CI                        : #954 / run 36972384582 — SUCCESS
Release artifact ID                : 11212301950
Release artifact name              : hidraweb-release-99e03a193441ea26dcf4d155e729f92ab429a1a8
Release artifact size              : 684148 bytes
Release artifact SHA-256           : 1c63a5358a47cf327aedb0a8ac6f491a4500900d4f918d68f9058b40d534c877
Artifact expiry                    : 2026-12-31T06:11:40Z
HidraAPI accepted main             : 260295c6eebc4b01922d2d488810a671305860a6
Verified OpenAPI-producing commit  : 63f3f60974ce57eb8cd5e42910397615195624fb
```

The staging deployment must use the exact artifact above. Do not rebuild the source SHA for promotion.

## 3. Verified automated hardening evidence

CI #954 completed successfully and executed the checked-in HidraWEB verification lifecycle:

- HidraAPI OpenAPI compatibility verification;
- regeneration of every accepted HidraWEB OpenAPI consumer slice;
- ESLint;
- TypeScript typecheck;
- unit/component tests;
- performance tests;
- production build and bundle-budget check;
- release packaging;
- release-manifest verification against the exact source SHA;
- Chromium installation;
- full Playwright regression suite;
- upload of the verified immutable release artifact.

The release verification script checks the release manifest identity, exact source SHA, file set, file sizes, per-file SHA-256 values, required Nginx deployment templates, and `app/index.html`.

## 4. Accessibility evidence and limitation

The current browser suite uses accessible roles, names, labels, headings, and keyboard-addressable controls across representative workflows. The existing staging/UAT checklist remains authoritative for manual accessibility acceptance.

There is **no standalone automated accessibility scanner or `test:accessibility` command configured in the current repository**. HWEB-P12 therefore does not claim axe/WCAG scanner execution.

Manual staging/UAT must still verify:

- sign-in keyboard operation;
- skip-to-main-content behavior;
- primary navigation keyboard operation;
- current-page accessible state;
- visible focus;
- dialog focus containment/restoration where applicable;
- non-color-only status/severity meaning;
- keyboard-operable textual alternatives for map information;
- usable accessible labels for representative tables/forms.

Absence of a dedicated scanner is recorded as a product-quality limitation, not as a passing automated accessibility result.

## 5. Product-phase boundaries retained

This candidate preserves the accepted architecture boundaries:

- HidraAPI remains business-contract source of truth;
- backend 401/403 remains authoritative;
- no frontend risk/KPI/hydraulic/simulation calculations;
- no browser CPM/RTTM, MQTT/Sparkplug, gRPC-Web, SCADA/PLC actuation, or direct LeakDetectionAPI dependency;
- Integration and Notification browser mutation surfaces remain evidence-only where product/UAT authorization is absent;
- document binary/storage semantics remain backend-owned;
- configuration secrets and value-bearing evidence remain governed/redacted;
- cross-surface navigation uses only identifiers explicitly returned by HidraAPI.

## 6. UAT findings

No staging/UAT finding IDs are currently recorded in the repository for this product-phase candidate.

Therefore:

- no BLOCKER or MAJOR finding has been silently dispositioned;
- any future finding must enter through the HWEB-M maintenance lane with environment, source SHA, backend SHA, artifact ID, permissions, operational context, expected/observed behavior, evidence, severity, owner, and disposition.

## 7. Promotion prerequisites

Before staging promotion, confirm:

```text
[ ] Artifact ID 11212301950 is available and not expired.
[ ] Artifact name matches source SHA 99e03a193441ea26dcf4d155e729f92ab429a1a8.
[ ] Artifact digest matches 1c63a5358a47cf327aedb0a8ac6f491a4500900d4f918d68f9058b40d534c877.
[ ] release-manifest.json is retained with the artifact.
[ ] Staging HidraAPI remains compatible with 260295c6eebc4b01922d2d488810a671305860a6 / accepted OpenAPI evidence.
[ ] Staging OIDC, HTTPS/TLS, reverse-proxy, CSP, and same-origin /api/* inputs are approved.
[ ] A known-good rollback artifact is retained.
[ ] The REL-001 smoke/UAT matrix is re-run against this candidate.
[ ] Manual accessibility UAT is completed.
```

## 8. Acceptance boundary

Repository CI success is necessary but not sufficient for staging/UAT acceptance.

Production promotion remains blocked until environment-owned smoke checks, functional UAT, manual accessibility checks, and finding disposition are completed and recorded.
