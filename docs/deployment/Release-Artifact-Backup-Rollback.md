# HidraWEB Release Artifact, Backup, and Rollback Policy

## Scope

HWEB-015-11 defines the frontend release-artifact verification and rollback boundary. It does not create backend database backup, restore, migration, or rollback semantics and does not invent an infrastructure vendor, ingress product, artifact registry, or deployment orchestrator.

A HidraWEB release is the exact production build output plus the checked-in Nginx templates needed by the already accepted same-origin deployment model.

## Verified release artifact

CI packages the following only after the production build succeeds:

```text
release/hidraweb/
  app/                                  # exact Vite dist/ output
  deploy/nginx/
    hidra-security-headers.conf.template
    hidraweb.conf.template
  release-manifest.json
```

`release-manifest.json` records:

- schema version;
- application identity;
- exact source commit SHA;
- every packaged file path;
- every packaged file byte size;
- every packaged file SHA-256 digest.

The verification step recomputes the complete file set, sizes, and SHA-256 digests and fails closed on any mismatch, missing file, extra file, symbolic link, malformed manifest, or source-SHA mismatch.

The GitHub Actions artifact name is bound to the exact workflow commit:

```text
hidraweb-release-${GITHUB_SHA}
```

The artifact is uploaded only after the complete Playwright regression suite succeeds. A release artifact from a failed or incomplete verification run must not be promoted.

## Backup boundary

For HidraWEB, backup means retaining a previously verified immutable release artifact and the deployment-owned values required to render the checked-in templates. The deployment owner must retain at least the currently deployed artifact and a known-good previous artifact according to the organization's retention policy.

This repository does not prescribe storage-provider names, bucket names, registry products, retention duration, encryption-key locations, DNS names, certificates, secrets, or external IdP credentials.

This frontend backup procedure does not back up or restore HidraAPI data, PostgreSQL data, backend configuration, identity-provider state, or any other server-owned business state. Those concerns require their own authoritative backend/infrastructure recovery procedures.

## Promotion verification

Before promotion, the deployment pipeline must:

1. obtain the release artifact produced by the accepted CI run for the exact commit being promoted;
2. preserve `release-manifest.json` with the artifact;
3. run `npm run release:verify` against the unpacked artifact with `HIDRA_RELEASE_SOURCE_SHA` set to the exact expected 40-character commit SHA;
4. render deployment-owned substitutions such as `HIDRA_API_UPSTREAM` and `HIDRA_OIDC_ORIGIN` without changing the packaged application files;
5. deploy the exact verified `app/` directory and checked-in templates rather than rebuilding source code at promotion time.

Runtime secrets or deployment-owned values must not be written into the release manifest.

## Rollback procedure

Rollback is a frontend artifact switch, not a rebuild.

1. Identify the exact currently deployed HidraWEB source SHA and the last known-good previously verified immutable release artifact.
2. Verify the previous artifact using its retained `release-manifest.json` and exact expected source SHA.
3. Apply the same deployment-owned environment/template substitutions used by the target environment.
4. Replace the served frontend artifact atomically using the deployment platform's approved mechanism.
5. Preserve the same-origin `/api/*`, SSE, WebSocket, security-header, CSP, and cache-policy configuration unless a separately reviewed deployment change explicitly requires otherwise.
6. Perform the deployment smoke checks below.
7. Record the rolled-back source SHA and CI artifact/run evidence in the deployment record.

Do not rebuild an old commit during rollback. A rebuild can resolve mutable toolchain or dependency inputs differently and therefore is not equivalent to restoring a previously verified artifact.

## Post-deployment and rollback smoke checks

At minimum, verify:

- `/` serves the expected application shell;
- fingerprinted `/assets/*` resources load successfully;
- `/index.html` remains `no-cache`;
- fingerprinted assets remain `public, max-age=31536000, immutable`;
- required browser security headers remain present;
- `/api/*` still reaches HidraAPI through the same-origin proxy;
- the OIDC bootstrap/sign-in entry point remains reachable according to the accepted authentication contract;
- no frontend rollback has introduced client-owned actor identity, permissions, lifecycle state, or other backend-owned truth.

Backend/API compatibility must still be respected. Rolling the frontend back to a release that is no longer compatible with the deployed HidraAPI is not an acceptable recovery action; use the pinned release evidence and compatibility records to choose a compatible frontend artifact.

## Failure handling

A release is not promotable when:

- release packaging or verification fails;
- the manifest source SHA differs from the intended commit;
- any file digest or byte size differs;
- required deployment templates or `app/index.html` are missing;
- CI gates preceding artifact upload fail;
- the retained rollback artifact cannot be independently verified;
- compatibility with the deployed backend cannot be established.

In those cases, stop promotion and resolve the underlying discrepancy. Do not weaken the verification gate or manufacture replacement evidence.
