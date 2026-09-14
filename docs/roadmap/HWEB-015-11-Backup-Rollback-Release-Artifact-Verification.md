# HWEB-015-11 — Backup/Rollback and Release Artifact Verification

Status: COMPLETE / EXACT-MAIN CI ACCEPTED

## Scope

HWEB-015-11 hardens the HidraWEB release boundary only. It does not create HidraAPI/PostgreSQL backup semantics, deployment-vendor behavior, infrastructure secrets, certificate handling, or any new frontend business authority.

## Accepted starting point

```text
HidraWEB accepted main       : ab7a856453d7438e200e841cf4d8f48b8fc1e5f9
HWEB-015-10 exact-main CI    : 34792782903 — SUCCESS
HidraAPI pinned baseline     : 725a451ae4880ccb4f2ec508709241f88cd4aea7
Task branch                  : hweb-015-11-release-artifact-rollback
```

The accepted HWEB-015-10 OpenAPI compatibility gate remains the cross-repository contract guard. No HidraAPI code or deployment contract change is required by HWEB-015-11.

## Implemented release-artifact contract

CI packages the exact Vite production build and checked-in Nginx templates into:

```text
release/hidraweb/
  app/
  deploy/nginx/
    hidra-security-headers.conf.template
    hidraweb.conf.template
  release-manifest.json
```

The manifest records the exact source commit, application/schema identity, every packaged path, byte size, and SHA-256 digest. Verification fails closed on source-SHA drift, missing/extra files, size/digest drift, missing required deployment templates, missing `app/index.html`, symbolic links, or malformed manifest identity.

CI names the uploaded artifact:

```text
hidraweb-release-${{ github.sha }}
```

and uploads it only after the full Playwright regression suite succeeds.

## Backup and rollback boundary

Frontend backup means retaining the currently deployed and a known-good previous verified immutable HidraWEB release artifact, together with deployment-owned values needed to render the existing templates according to organization retention policy.

HidraWEB does not define or perform backup/restore of HidraAPI, PostgreSQL, IdP state, backend configuration, business data, certificates, or secrets.

Rollback uses a previously verified immutable release artifact. It must not rebuild an old source commit during recovery. The retained manifest must be verified against the exact expected source SHA before promotion, after which the deployment platform may atomically switch the served frontend artifact using its approved mechanism.

Backend compatibility remains mandatory: an older frontend artifact is not a valid rollback target if it is incompatible with the deployed HidraAPI contract.

## Artifacts and tests

- `scripts/release-artifact.mjs` packages and verifies release contents.
- `package.json` exposes `release:package` and `release:verify`.
- `.github/workflows/ci.yml` packages/verifies after production build and uploads only after Playwright succeeds.
- `docs/deployment/Release-Artifact-Backup-Rollback.md` records promotion, backup, rollback, smoke-check, and failure-handling boundaries.
- `src/app/bootstrap/releaseArtifactPolicy.test.ts` regression-protects the release/rollback policy and CI ordering.

## Product-head verification

The initial implementation head `655b621596c782dd861cc415add6e0fa449d539e` exposed a legitimate lint error because the new Node script referenced `process` without an explicit Node import. The root cause was fixed; no lint rule or gate was weakened.

Accepted product head:

```text
Product head                  : eb371b62252b8cd716dc88006d4cceb42de720cd
Product-head CI               : 34793469730 — SUCCESS
Release artifact ID           : 10329435335
Release artifact              : hidraweb-release-eb371b62252b8cd716dc88006d4cceb42de720cd
Artifact archive digest       : sha256:a131300037c3289d076ca28733c07b4d83c51bbe415f5c4974298ca061c29ce5
Artifact size                 : 673908 bytes
```

The successful run preserved and passed:

- HidraAPI OpenAPI compatibility for all 18 feature contracts;
- all deterministic Orval generators;
- lint;
- typecheck;
- unit/component tests;
- runtime performance tests;
- production build and bundle budgets;
- release package creation;
- release artifact verification;
- full Playwright regression suite;
- verified release artifact upload.

## Final acceptance lifecycle

```text
Roadmap-inclusive head        : 9cc8a10fdbd6bbb08fd73528669786e3ad0621f7
Roadmap-inclusive CI          : 34793719068 — SUCCESS
Pull request                  : #85
Independent PR CI             : 34793950405 — SUCCESS
Guarded expected head         : 9cc8a10fdbd6bbb08fd73528669786e3ad0621f7
Merge SHA                     : e7ab8f401cf7ceffde0f68ca1b2cdbb645f61c94
Merge parent 1                : ab7a856453d7438e200e841cf4d8f48b8fc1e5f9
Merge parent 2                : 9cc8a10fdbd6bbb08fd73528669786e3ad0621f7
Exact-main CI                 : 34794197096 — SUCCESS
Exact-main release artifact   : 10329157047
Exact-main artifact name      : hidraweb-release-e7ab8f401cf7ceffde0f68ca1b2cdbb645f61c94
Exact-main artifact digest    : sha256:5ce5e226dce38e72ef27d7fadd8b32ef45fb8d696b7fd7b5e25bfc6dde5477e6
Exact-main artifact size      : 673908 bytes
```

The exact-main CI reran the complete compatibility, generation, lint, typecheck, unit/component, performance, bundle/build, release verification, Playwright, and artifact-upload lifecycle on the exact accepted merge SHA.

HWEB-015-12 may begin only from this accepted exact `main`.