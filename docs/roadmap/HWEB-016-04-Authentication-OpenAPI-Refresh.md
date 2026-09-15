# HWEB-016-04 — Authentication OpenAPI Refresh

Status: BLOCKED AT AUTHORITATIVE ARTIFACT IMPORT

## Purpose

Refresh HidraWEB's checked-in OpenAPI evidence from the completed HidraAPI AUTH-030 authentication baseline before any runtime authentication code is changed.

This task is a contract-integrity gate. It must not reconstruct authentication schemas by hand when HidraAPI CI already publishes an authoritative OpenAPI artifact.

## Dependencies

```text
HWEB-016-01 — Authentication Contract Freeze       COMPLETE
HWEB-016-02 — Authentication Architecture Update  COMPLETE
HWEB-016-03 — Runtime Inventory / Minimal Delta   COMPLETE
```

Backend contract source frozen by HWEB-016-01:

```text
Repository : CHOUABBIA-AMINE/HidraAPI
Branch     : main
AUTH-030   : completed
Main commit: 7b24dc122e52dd0c5471307e3611f2a3d999ae7d
```

The AUTH-030 closure roadmap records successful deterministic OpenAPI publication/artifact upload during its final CI acceptance run.

## Current HidraWEB evidence audited

### Compatibility baseline

`openapi/compatibility/hidra-api-baseline.json` is still pinned to:

```text
backendCommit = 725a451ae4880ccb4f2ec508709241f88cd4aea7
```

This predates the completed authentication gap closure.

### Identity/organization slice

`orval.identity-organization.config.ts` still consumes:

```text
openapi/hidra-identity-organization-af4c3b4723619a25dd9a94f4d27f5a36adab982e.json
```

That checked-in slice does not contain the AUTH-030 authentication HTTP contract.

### Generated tree

`src/api/generated/` contains only the repository placeholder on `main`; generated clients are produced by the existing Orval/verification workflow rather than treated as the source of contract truth.

## Required AUTH-030 evidence

The refreshed authoritative OpenAPI input must expose all of the following before runtime implementation begins:

```text
POST /api/v1/identity/authentication/login
POST /api/v1/identity/authentication/oidc/complete
AuthenticationLoginRequest
AuthenticationLoginResponse
ProviderType
```

The expected source-level semantics, already verified independently in HWEB-016-01, are:

```text
AuthenticationLoginRequest
  providerType
  principal
  credentials

AuthenticationLoginResponse
  sessionId
  accessToken
  tokenType
  jti
  issuedAt
  expiresAt
  userId
  username
  displayName
  authenticationType
  identityProviderId
  roles
  permissions
```

Those source-level facts are useful acceptance checks, but they are not permission to manufacture an OpenAPI document manually.

## Integrity rule

The existing compatibility gate verifies provenance as well as schema compatibility. Its manifest records:

```text
repository
backendCommit
workflowRunId
artifactId
artifactName
artifactDigest
fullSpecSha256
fullContractGzipBase64Parts
fullContractGzipSha256
expectedOrvalContracts
```

Therefore a valid HWEB-016-04 completion requires the actual published HidraAPI OpenAPI artifact (or another repository-approved deterministic publication carrying equivalent provenance) so these values can be updated truthfully.

Forbidden shortcuts:

```text
- hand-write AuthenticationLoginRequest into the old slice
- hand-write AuthenticationLoginResponse into the old slice
- invent operationIds/tags/nullability from controller source
- fabricate workflowRunId/artifactId/artifactDigest
- point Orval at a source-derived pseudo-spec and call it CI evidence
- change runtime authentication code before the refreshed contract is accepted
```

## Work completed in this step

The repository was re-audited before mutation and the minimum refresh surface was confirmed:

```text
openapi/compatibility/hidra-api-baseline.json
openapi/compatibility/hidra-api-<AUTH030-COMMIT>.part*.b64
openapi/hidra-identity-organization-<AUTH030-COMMIT>.json
orval.identity-organization.config.ts
```

After those files are refreshed from the immutable backend publication, the acceptance commands are:

```bash
npm run openapi:compatibility
npm run api:generate:identity-organization
npm run typecheck
```

Generated output must then prove that the direct-login and OIDC-completion operations plus their transport schemas are available without handwritten duplicate DTOs or URLs.

## Blocking condition

The authoritative AUTH-030 OpenAPI archive itself has not been imported into HidraWEB during this task execution. Because the current checked-in evidence is stale and provenance metadata is mandatory, HWEB-016-04 must remain blocked rather than commit a synthetic replacement.

This is an evidence/import blocker, not an uncertainty about the backend runtime contract. HWEB-016-01 already verified the live source controller, request DTO, response DTO, ProviderType taxonomy, public direct-login boundary, and authenticated OIDC completion boundary.

## Acceptance checklist

```text
PASS stale compatibility baseline identified
PASS stale identity/organization OpenAPI slice identified
PASS exact AUTH-030 authentication endpoints/types identified from verified backend source
PASS required compatibility/provenance fields identified
PASS minimum files requiring refresh identified
PASS generation/verification commands identified
PASS handwritten/synthetic OpenAPI replacement explicitly prohibited
BLOCK authoritative AUTH-030 OpenAPI publication not yet imported
BLOCK updated compatibility gate not yet runnable against AUTH-030 evidence
BLOCK generated auth transport not yet verified
```

## Safety result

No runtime authentication source was changed.

No stale generated client was represented as AUTH-030 compatible.

No fabricated OpenAPI provenance was committed.

## Next action required to unblock HWEB-016-04

Import the exact HidraAPI AUTH-030 CI OpenAPI artifact used by the accepted backend closure run, then atomically refresh the compatibility baseline and identity/organization slice and execute the three verification commands above.

Only after HWEB-016-04 reaches COMPLETE should the roadmap advance to the authentication gateway/runtime implementation task.
