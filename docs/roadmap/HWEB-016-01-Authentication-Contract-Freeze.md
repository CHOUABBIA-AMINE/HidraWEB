# HWEB-016-01 — Authentication Contract Freeze

Status: COMPLETE

## Purpose

Freeze the HidraAPI authentication contract that HidraWEB must consume before any LOCAL, LDAP/Active Directory, or unified OIDC session implementation is started.

This task is intentionally discovery/documentation only. It does not modify runtime authentication code.

## Audited backend baseline

```text
Repository : CHOUABBIA-AMINE/HidraAPI
Branch     : main
Commit     : 7b24dc122e52dd0c5471307e3611f2a3d999ae7d
Date       : 2026-09-15
Roadmap    : docs/roadmap/authentication.md
Status     : Completed — AUTH-030 authentication gap closure verified
```

HidraAPI is the source of truth for this contract. Frontend code must not invent endpoint names, request fields, provider values, token semantics, or fallback behavior.

## Frozen authentication architecture

Supported human authentication sources are:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
OIDC
```

Successful authentication converges on the same backend-owned model:

```text
authentication source
    -> Hidra User
    -> Hidra account-state validation
    -> Hidra roles/permissions
    -> HidraPrincipal
    -> LoginSession / AuthenticationEvent
    -> Hidra-issued JWT
    -> protected HidraAPI endpoints
```

Provider fallback is forbidden. Failure of the explicitly selected authority fails that authentication attempt.

Authentication source is not an authorization source. AD groups, LDAP identity context, OIDC provider roles/scopes, and provider type must not directly grant Hidra business permissions.

## Contract matrix

| Capability | Frozen backend contract | HidraWEB consequence | Status |
|---|---|---|---|
| Direct LOCAL login | `POST /api/v1/identity/authentication/login` with `providerType=LOCAL` | Use this endpoint; do not reuse development HTTP Basic | VERIFIED |
| Direct LDAP login | Same `POST /api/v1/identity/authentication/login` with `providerType=LDAP` | Preserve explicit provider selection; no fallback | VERIFIED |
| Direct Active Directory login | Same endpoint with `providerType=ACTIVE_DIRECTORY` | AD is distinct in the provider taxonomy even though it shares directory authentication infrastructure | VERIFIED |
| Direct OIDC username/password | Not supported | HidraWEB must never collect an external IdP password for OIDC | VERIFIED |
| OIDC browser bootstrap | `GET /api/v1/security/oidc` | Existing PKCE bootstrap contract remains in force | VERIFIED |
| OIDC browser flow | Authorization Code + PKCE remains completed by HidraWEB against the external IdP | Preserve PKCE/state/nonce/browser redirect controls | VERIFIED |
| OIDC -> Hidra session completion | `POST /api/v1/identity/authentication/oidc/complete` | Call only after external bearer JWT has already been validated and normalized by Spring Security to an OIDC `HidraPrincipal` | VERIFIED |
| Unified success response | `AuthenticationLoginResponse` | LOCAL, LDAP, AD, and OIDC completion can converge on one frontend session-result adapter | VERIFIED |
| Provider taxonomy | Backend `ProviderType` | Do not invent a frontend authentication enum with different semantics | VERIFIED |
| Public direct-login route | `/api/v1/identity/authentication/login` is explicitly `permitAll()` | Frontend can call without an existing Hidra bearer session | VERIFIED |
| OIDC completion protection | Not present in public permit list; controller requires authenticated OIDC `HidraPrincipal` | External OIDC bearer credential must be supplied for completion | VERIFIED |
| General provider-capability discovery endpoint | No authoritative endpoint identified during this task | Do not invent capability discovery; requires a separate backend contract decision if dynamic provider visibility is required | OPEN CONTRACT GAP |
| Current-principal `/me` endpoint | No new authentication-specific current-principal endpoint identified during this task | Use only existing verified identity/permission contracts until separately evidenced | OPEN / EXISTING-CONTRACT REVIEW REQUIRED |
| Local logout/session-revoke HTTP endpoint | No authentication HTTP logout endpoint identified during this task | Do not invent `/logout`; frontend local cleanup remains safe, server session revocation requires separate endpoint evidence | OPEN CONTRACT GAP |
| Refresh endpoint | No refresh endpoint evidenced by this task | Do not add refresh-token behavior | NOT EVIDENCED |

## Direct-login request

The backend DTO is `AuthenticationLoginRequest`:

```json
{
  "providerType": "LOCAL | LDAP | ACTIVE_DIRECTORY",
  "principal": "submitted user or directory principal",
  "credentials": "submitted password/direct credential"
}
```

Validation requirements are backend-owned:

```text
providerType : required
principal    : non-blank
credentials  : non-blank
```

OIDC is not a valid browser password-login pattern. OIDC follows the existing browser authorization-code + PKCE path.

## Unified authentication response

`POST /api/v1/identity/authentication/login` and `POST /api/v1/identity/authentication/oidc/complete` both return `AuthenticationLoginResponse`:

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

Frontend session infrastructure should therefore normalize all successful provider flows to this one shape rather than maintaining provider-specific bearer-session models.

The API bearer token for normal protected HidraAPI traffic is `accessToken` from this Hidra response.

## OIDC bootstrap contract preserved

`GET /api/v1/security/oidc` continues to publish:

```text
authenticationMode
authorizationFlow
issuerUri
clientId
audience
scopes
logoutUri
browserTokenStorage
repositoryConfigurationComplete
externalIdpRegistrationRequired
```

The current backend values remain designed around:

```text
authorizationFlow  = authorization_code_pkce
browserTokenStorage = memory
```

This endpoint remains the authoritative source for external OIDC browser metadata. HidraWEB must not duplicate issuer/client/audience/scope/logout configuration from unrelated sources.

## OIDC completion boundary

The new backend controller documents the exact responsibility split:

```text
HidraWEB
  -> fetch OIDC bootstrap metadata
  -> perform external authorization-code + PKCE flow
  -> obtain external access token
  -> present that credential so Spring Security validates/normalizes it
  -> POST /api/v1/identity/authentication/oidc/complete

HidraAPI
  -> require authenticated OIDC HidraPrincipal
  -> create/complete LoginSession
  -> issue Hidra JWT
  -> return AuthenticationLoginResponse
```

Therefore the external IdP access token is an authentication-completion credential, not the long-term HidraWEB protected-API session token after successful completion.

## Provider taxonomy

The backend `ProviderType` values are:

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

For the current migration, the human authentication paths explicitly in scope are:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
OIDC
```

HidraWEB must not expose the remaining enum values as working login methods unless HidraAPI later publishes an actual supported authentication contract for them.

## Security rules frozen for frontend implementation

1. Never silently retry authentication with another provider.
2. Never infer Hidra authorization from AD groups, LDAP identity metadata, OIDC roles/scopes, or provider type.
3. Never persist submitted LOCAL/LDAP/AD credentials.
4. Preserve OIDC Authorization Code + PKCE, state, nonce, and browser-client-secret prohibition.
5. Keep bearer-token handling inside authentication/transport infrastructure.
6. Install the Hidra-issued `accessToken` as the normal protected-API bearer credential after successful authentication completion.
7. Do not invent refresh, logout, provider-discovery, or `/me` endpoints where HidraAPI evidence is absent.
8. Continue treating backend HTTP 403 as final authorization authority.

## Phase-1 contract gaps requiring explicit follow-up

The backend authentication implementation is complete, but three frontend-facing discovery/lifecycle contracts are not evidenced by this audit:

### GAP-WEB-AUTH-01 — authentication capability discovery

The current OIDC bootstrap endpoint publishes OIDC/JWT metadata, but this task did not identify a public contract that tells the browser which of `LOCAL`, `LDAP`, `ACTIVE_DIRECTORY`, and `OIDC` should be displayed/enabled in a specific environment.

Until such a contract exists, HidraWEB must not fabricate dynamic provider availability.

### GAP-WEB-AUTH-02 — browser-visible server session termination

HidraAPI has backend `LoginSession` lifecycle behavior, but this task did not identify a public authentication logout/revoke endpoint suitable for HidraWEB.

Frontend local credential/session cleanup can be implemented independently; server-side session revocation must wait for an evidenced endpoint.

### GAP-WEB-AUTH-03 — canonical current-principal endpoint

The unified login response already contains normalized principal metadata. This task did not identify a new authentication-specific `/me` endpoint. Existing identity permission/profile APIs must be reviewed separately before changing principal reload behavior.

## Acceptance result

HWEB-016-01 is complete because the browser-facing authentication boundary required to begin frontend architecture work is now frozen from live HidraAPI source:

```text
PASS direct LOCAL/LDAP/AD login endpoint identified
PASS exact request DTO identified
PASS unified response DTO identified
PASS OIDC bootstrap endpoint preserved
PASS OIDC completion endpoint identified
PASS public/protected boundary identified
PASS backend ProviderType taxonomy identified
PASS Hidra-issued bearer-token handoff identified
PASS provider no-fallback rule preserved
PASS authorization ownership preserved
PASS unsupported/unverified frontend assumptions explicitly recorded as gaps
```

## Next task

`HWEB-016-02` should update HidraWEB authentication architecture/state documentation around the frozen contract before runtime code is changed. The existing `AuthProvider` seam should be preserved while replacing the old `basic | jwt | disabled`-centric application model with a provider-independent Hidra session model.
