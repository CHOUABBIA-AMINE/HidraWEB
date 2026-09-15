# HWEB-016-03 — Authentication Runtime Inventory and Minimal Change Plan

Status: COMPLETE

## Purpose

Inventory the current HidraWEB authentication runtime against the frozen HidraAPI AUTH-030 contract and define the smallest safe implementation delta before runtime behavior is changed.

This task is read-only with respect to application runtime code. It records evidence and implementation sequencing only.

## Dependencies

```text
HWEB-016-01 — Authentication Contract Freeze
HWEB-016-02 — Authentication Architecture and State Update
```

Backend truth for this migration remains:

```text
Repository : CHOUABBIA-AMINE/HidraAPI
Branch     : main
Commit     : 7b24dc122e52dd0c5471307e3611f2a3d999ae7d
Status     : AUTH-030 complete
```

## Runtime inventory

### 1. AuthProvider

Current file:

```text
src/app/auth/AuthProvider.tsx
```

Current behavior is still transport-mode centric:

```text
runtimeConfig.authMode = basic | jwt | disabled
```

The provider owns:

```text
status
session
error
Authorization header registration
401 invalidation
token-expiry timer
OIDC logout URI
```

Current authentication functions are:

```text
authenticateBasic(username, password)
authenticateJwt(accessToken)
beginOidcSignIn(returnTo)
completeOidcSignIn(search)
signOut()
```

Current `verifyAndCommit` behavior installs a credential first, calls the permission-routes endpoint, and commits the session only after that request succeeds.

This seam is suitable for reuse, but the credential acquisition layer beneath it must change.

### 2. Auth context

Current file:

```text
src/app/auth/authContext.ts
```

Current state is too narrow for the new contract:

```ts
AuthStatus = 'anonymous' | 'checking' | 'authenticated'
AuthSessionSource = 'basic' | 'jwt' | 'disabled'

AuthSession {
  principalLabel
  source
}
```

The new backend response already provides authoritative normalized session/principal metadata, so `principalLabel + basic|jwt` is no longer an adequate long-term model.

Minimum target state must represent at least:

```text
sessionId
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

The raw `accessToken` must remain private to auth/transport infrastructure.

### 3. Login page

Current file:

```text
src/app/pages/LoginPage.tsx
```

Current UX branches only on runtime mode:

```text
jwt   -> enterprise OIDC button
basic -> username/password form using HTTP Basic
disabled -> bypass
```

This does not match the new HidraAPI direct-login contract.

Required future change:

```text
LOCAL            -> POST /api/v1/identity/authentication/login
LDAP             -> same endpoint
ACTIVE_DIRECTORY -> same endpoint
OIDC             -> existing browser PKCE initiation
```

The existing username/password form can be reused structurally, but must no longer produce an HTTP Basic authorization header for Hidra-owned LOCAL authentication.

Dynamic provider visibility remains blocked by GAP-WEB-AUTH-01 because no browser provider-capability endpoint has yet been evidenced.

### 4. OIDC browser client

Current file:

```text
src/app/auth/oidcClient.ts
```

Existing controls to preserve:

```text
OIDC contract fetch
issuer discovery
Authorization Code + PKCE S256
state validation
nonce validation
transaction max age
short-lived sessionStorage transaction
no browser client secret
```

Current completion result returns the external IdP access token directly:

```ts
OidcCallbackResult {
  accessToken
  expiresAt
  returnTo
  logoutUri
}
```

Current `AuthProvider.completeOidcSignIn` then installs that external token as the normal application bearer.

This is the main runtime incompatibility with AUTH-030.

Required target sequence:

```text
external IdP callback
    -> exchange authorization code for external bearer token
    -> temporarily present external bearer to HidraAPI
    -> POST /api/v1/identity/authentication/oidc/complete
    -> receive AuthenticationLoginResponse
    -> replace external bearer with Hidra-issued accessToken
    -> commit normalized Hidra session
```

The external bearer must not remain installed after successful Hidra completion.

### 5. OIDC callback page

Current file:

```text
src/app/pages/OidcCallbackPage.tsx
```

The page is already thin and delegates completion to `AuthProvider`.

No architectural rewrite is required. Its displayed wording may later be adjusted, but provider/session mechanics should remain outside the page.

### 6. Runtime configuration

Current file:

```text
src/app/bootstrap/runtimeConfig.ts
```

Current configuration requires:

```text
authMode = basic | jwt | disabled
```

This remains useful as temporary deployment compatibility, but it cannot be the long-term source of provider-selection semantics.

HWEB-016-03 does not remove it because:

```text
- existing environments depend on it;
- provider-capability discovery is still an open backend contract gap;
- migration should not couple configuration cleanup to authentication correctness.
```

The first runtime implementation should therefore minimize changes to `runtimeConfig` and add provider-aware behavior behind the auth layer rather than redesign environment configuration immediately.

### 7. Authorization-header transport

Current files:

```text
src/api/client/hidraAxios.ts
src/api/client/hidraHttpClient.ts
src/app/auth/authorizationHeaderRegistry.ts
```

The central Axios request interceptor already asks the auth registry for one Authorization value and applies it uniformly.

This is compatible with the target architecture.

Required change is not in the Axios interceptor. The auth layer must simply ensure that after any successful authentication flow the registered credential is:

```text
Authorization: Bearer <Hidra-issued accessToken>
```

A short-lived external OIDC bearer may be registered or supplied only for the authenticated `/oidc/complete` call, then replaced by the Hidra token.

The Axios layer must remain provider-agnostic.

### 8. HTTP 401 handling

`hidraAxios.ts` already converts HTTP 401 into the global unauthorized event consumed by `AuthProvider`.

This behavior can remain.

The later runtime implementation must expand session teardown to include authenticated TanStack Query/permission cleanup defined by HWEB-016-02.

HTTP 403 must continue to preserve the authentication session.

## OpenAPI inventory

### Checked-in feature slice

Current identity/organization Orval configuration:

```text
orval.identity-organization.config.ts
```

points to:

```text
openapi/hidra-identity-organization-af4c3b4723619a25dd9a94f4d27f5a36adab982e.json
```

That checked-in slice was extracted from HidraAPI commit:

```text
af4c3b4723619a25dd9a94f4d27f5a36adab982e
```

It does not contain:

```text
POST /api/v1/identity/authentication/login
POST /api/v1/identity/authentication/oidc/complete
AuthenticationLoginRequest
AuthenticationLoginResponse
ProviderType
```

### Compatibility baseline

Current baseline:

```text
openapi/compatibility/hidra-api-baseline.json
```

is pinned to:

```text
725a451ae4880ccb4f2ec508709241f88cd4aea7
```

This predates the final AUTH-030 backend commit used by HWEB-016-01.

### Generated source status

`src/api/generated/` currently contains only `.gitkeep` in the checked-in tree. Generated clients are produced during the repository verification workflow rather than maintained as committed runtime source.

Therefore there is no generated authentication client currently available in the repository to consume.

## Critical conclusion

The first runtime code task must **not** hand-write the new authentication endpoint DTOs or URLs while the frontend OpenAPI evidence is stale.

The safest minimal sequence is:

```text
1. refresh the authoritative HidraAPI OpenAPI baseline to AUTH-030
2. refresh the identity/organization OpenAPI slice so it includes authentication contracts
3. regenerate/typecheck the identity client
4. only then implement the auth gateway/session adaptation using generated transport contracts
```

This preserves the repository rule that HidraAPI/OpenAPI is the machine contract source.

## Minimal code-change plan after OpenAPI refresh

### Change A — add authentication transport adapter

Add an auth-owned adapter around generated operations rather than calling generated functions from pages.

Conceptual target:

```text
src/app/auth/authenticationGateway.ts
```

Responsibilities:

```text
direct LOCAL/LDAP/AD login
OIDC Hidra completion
map generated AuthenticationLoginResponse -> internal HidraSessionResult
no UI logic
no credential persistence
```

### Change B — normalize AuthContext

Replace transport sources:

```text
basic | jwt
```

with backend authentication source/session metadata:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
OIDC
```

Retain `disabled` only as temporary compatibility if required by development runtime.

Introduce explicit `authenticating` semantics rather than overloading `checking` for every transition.

### Change C — replace Basic direct login

`authenticateBasic` must not become the production/local Hidra authentication path.

Introduce direct-provider authentication through the generated login operation.

Submitted credential state remains local to the form and must be discarded after submission.

### Change D — change OIDC completion handoff

After external code exchange:

```text
external access token
 -> call Hidra OIDC completion endpoint with external Bearer
 -> receive Hidra AuthenticationLoginResponse
 -> install Hidra bearer
 -> commit session
```

No change is required to PKCE/state/nonce generation itself.

### Change E — centralize session commit

One function should accept the normalized Hidra login response for every provider and perform:

```text
expiry validation
register Hidra bearer
commit normalized principal/session state
load/refetch permissions
schedule expiry
```

Do not retain independent LOCAL/LDAP/OIDC session-commit implementations.

### Change F — session teardown/cache cleanup

Extend logout/expiry/401 handling to clear:

```text
protected requests
user-scoped TanStack Query data
permission state
AuthProvider principal/session
Authorization header
```

The implementation must avoid creating a second global server-state store.

### Change G — login UX adaptation

Reuse the current page structure where practical.

Do not yet invent dynamic provider availability.

Until GAP-WEB-AUTH-01 is resolved, provider exposure must be driven only by an explicitly approved deployment/configuration decision or a separately evidenced backend contract.

## Files expected to change during implementation

Primary:

```text
src/app/auth/AuthProvider.tsx
src/app/auth/authContext.ts
src/app/auth/oidcClient.ts
src/app/pages/LoginPage.tsx
```

Likely new:

```text
src/app/auth/authenticationGateway.ts
```

Potential supporting changes:

```text
src/app/auth/*.test.ts
src/app/pages/OidcCallbackPage.tsx
src/shared/i18n/resources.ts
permission/query cleanup integration
runtime configuration only where required by an explicit provider-exposure decision
```

Not expected to require provider-specific changes:

```text
src/api/client/hidraAxios.ts
src/api/client/hidraHttpClient.ts
feature modules
business process modules
route permission model
```

## Test delta required with implementation

At minimum:

```text
LOCAL success -> Hidra bearer committed
LDAP success -> same Hidra session model
ACTIVE_DIRECTORY success -> same Hidra session model
selected provider failure -> no fallback request
OIDC external token -> completion call -> Hidra token replacement
OIDC completion failure -> external token not retained
expired Hidra response -> no session commit
HTTP 401 -> teardown
HTTP 403 -> session preserved
credential fields never persisted
Bearer token never written to browser storage
authenticated caches cleared between actors
```

Existing OIDC state/nonce/PKCE tests must remain green.

## Acceptance checklist

```text
PASS AuthProvider runtime inspected
PASS auth context/state inspected
PASS login UX inspected
PASS OIDC client inspected
PASS OIDC callback inspected
PASS runtime configuration inspected
PASS Axios authorization-header path inspected
PASS 401 handling inspected
PASS identity OpenAPI slice inspected
PASS compatibility baseline inspected
PASS generated-source status inspected
PASS stale OpenAPI evidence identified before code generation
PASS minimum implementation delta defined
PASS no runtime behavior changed
PASS no handwritten duplicate authentication DTO/endpoint introduced
```

## Next task

`HWEB-016-04` must refresh HidraWEB's checked-in HidraAPI OpenAPI evidence from the completed AUTH-030 backend baseline and regenerate/verify the identity authentication transport contract before application runtime code is modified.

The refreshed contract must prove the presence and schemas of:

```text
POST /api/v1/identity/authentication/login
POST /api/v1/identity/authentication/oidc/complete
AuthenticationLoginRequest
AuthenticationLoginResponse
ProviderType
```

Only after that gate passes should `HWEB-016-05` begin runtime implementation of the provider-independent authentication gateway/session flow.
