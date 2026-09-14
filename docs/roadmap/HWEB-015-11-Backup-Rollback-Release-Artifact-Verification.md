# HWEB-015-11 — Backup/Rollback and Release Artifact Verification

Status: IMPLEMENTED / PRODUCT-HEAD CI ACCEPTED / ROADMAP-INCLUSIVE CI PENDING

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

CI now packages the exact Vite production build and checked-in Nginx templates into:

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

## Acceptance lifecycle

The task is not complete until all remaining lifecycle stages succeed:

1. roadmap-inclusive full CI;
2. independent pull-request CI;
3. guarded merge with exact expected head SHA;
4. merge-parent verification;
5. live `main` verification;
6. exact merge-SHA `main` CI.

HWEB-015-12 must not start automatically after HWEB-015-11 acceptance.
