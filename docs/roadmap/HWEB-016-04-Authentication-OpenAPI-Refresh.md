# HWEB-016-04 — Authentication OpenAPI Refresh

Status: READY FOR CI VERIFICATION

## Purpose

Refresh HidraWEB's checked-in OpenAPI evidence from the completed HidraAPI AUTH-030 authentication baseline before any runtime authentication code is changed.

This task is a contract-integrity gate. Authentication schemas and routes must come from the authoritative backend OpenAPI publication rather than handwritten reconstruction.

## Dependencies

```text
HWEB-016-01 — Authentication Contract Freeze       COMPLETE
HWEB-016-02 — Authentication Architecture Update  COMPLETE
HWEB-016-03 — Runtime Inventory / Minimal Delta   COMPLETE
```

## Authoritative AUTH-030 publication imported

The accepted HidraAPI AUTH-030 workflow publication used for this refresh is:

```text
Repository      : CHOUABBIA-AMINE/HidraAPI
Workflow run    : 35004817611
Artifact ID     : 10411412102
Artifact name   : hidra-api-openapi-592ce1a9ebafe714a65f71e5e2f75ba79281caf3
Artifact digest : sha256:adb3bac76749b659c6e3fdbe46a1c5f9111878a2ce9059dcd463e63c039e045d
Full spec SHA   : sha256:a3d5bff8b83005d71376ce9187313ce28bb20cbdda231335854a87b8e37bfb22
```

The artifact was downloaded directly from the successful AUTH-030 HidraAPI CI run. Its ZIP digest matched the GitHub-published artifact digest before extraction.

## Authentication contract proven by the artifact

The imported OpenAPI exposes:

```text
POST /api/v1/identity/authentication/login
POST /api/v1/identity/authentication/oidc/complete
AuthenticationLoginRequest
AuthenticationLoginResponse
```

`AuthenticationLoginRequest.providerType` is emitted inline as the backend enum rather than as a standalone `ProviderType` component. Its values are:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
OIDC
OAUTH2
SAML2
KEYCLOAK
AZURE_AD
OKTA
```

The direct-login request requires:

```text
providerType
principal
credentials
```

The unified authentication response exposes:

```text
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

## HidraWEB files refreshed

```text
openapi/compatibility/hidra-api-baseline.json
openapi/compatibility/hidra-api-592ce1a9ebafe714a65f71e5e2f75ba79281caf3.part1.b64
openapi/compatibility/hidra-api-592ce1a9ebafe714a65f71e5e2f75ba79281caf3.part2.b64
openapi/compatibility/hidra-api-592ce1a9ebafe714a65f71e5e2f75ba79281caf3.part3.b64
openapi/compatibility/hidra-api-592ce1a9ebafe714a65f71e5e2f75ba79281caf3.part4.b64
openapi/hidra-identity-organization-592ce1a9ebafe714a65f71e5e2f75ba79281caf3.json
orval.identity-organization.config.ts
```

The identity/organization slice is extracted directly from the authoritative artifact using these controller tags:

```text
identity-authentication-controller
spring-identity-controller
spring-organization-controller
```

That preserves the prior identity/organization contract surface while adding only the AUTH-030 authentication controller surface required by this migration step.

## Integrity checks completed before repository CI

```text
PASS GitHub artifact digest matched downloaded ZIP SHA-256
PASS full OpenAPI JSON SHA-256 recorded in compatibility manifest
PASS deterministic gzip SHA-256 recorded in compatibility manifest
PASS direct-login path present
PASS OIDC-completion path present
PASS AuthenticationLoginRequest present
PASS AuthenticationLoginResponse present
PASS required request fields verified from artifact
PASS provider enum values verified from artifact
PASS Orval identity/organization config repointed to refreshed slice
PASS no runtime authentication source changed
```

## Required repository acceptance commands

The branch must pass the existing project gates:

```bash
npm run openapi:compatibility
npm run api:generate:identity-organization
npm run typecheck
```

Repository CI remains authoritative for completion because the execution environment used to import the artifact does not contain a network-accessible HidraWEB working tree or installed frontend dependencies.

## Completion rule

HWEB-016-04 becomes `COMPLETE` only when repository CI proves all three gates above and the generated identity/organization client includes operations for:

```text
login
completeOidc
```

with transport models generated from `AuthenticationLoginRequest` and `AuthenticationLoginResponse`.

## Safety result

No handwritten authentication DTO was introduced.

No runtime URL was duplicated in application code.

No provider fallback behavior was added.

No runtime authentication implementation was changed before the contract refresh gate.

## Next task after CI acceptance

Advance to the authentication gateway/runtime implementation step only after this branch passes compatibility, Orval generation, and TypeScript verification.
