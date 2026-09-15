# 17 — State Management Strategy

## Server state

TanStack Query owns all server data: workbench resources, topology layers, permissions, notifications, dashboard metrics, detail records, and other user-scoped backend data.

Authenticated server state must not be copied into a parallel global client database.

## Authentication/session state

`AuthProvider` owns the active frontend authentication/session lifecycle.

The application state model is provider-independent:

```text
INITIALIZING
    -> ANONYMOUS
    -> AUTHENTICATING(provider)
    -> AUTHENTICATED(Hidra session)
    -> ANONYMOUS
```

The authenticated state may expose safe session/principal metadata such as:

```text
sessionId
userId
username
displayName
authenticationType
identityProviderId
issuedAt
expiresAt
```

The bearer token itself remains private to authentication/transport infrastructure and must not be exposed as general feature state.

The authentication source (`LOCAL`, `LDAP`, `ACTIVE_DIRECTORY`, `OIDC`) is descriptive session metadata only. It does not own authorization and must not drive feature access.

## Authentication transaction state

LOCAL/LDAP/AD submitted credentials are transient form/authentication-call state only and must never be persisted.

OIDC Authorization Code + PKCE transaction state may use short-lived `sessionStorage` only for the verified redirect transaction data required to survive navigation, including state, nonce, PKCE verifier, issuer/client/redirect identity, requested return route, and transaction creation time.

Bearer access tokens and refresh tokens must not be stored in that transaction state.

## Permission state

`PermissionProvider` owns frontend permission/route-guard state derived from verified HidraAPI permission contracts.

Authentication response roles/permissions may be used as normalized session metadata, but application authorization must remain consistent with the canonical Hidra permission model and backend enforcement.

Backend HTTP `403` remains authoritative.

## Authenticated cache lifecycle

On successful authentication:

```text
commit Hidra bearer credential
    -> establish normalized AuthProvider session
    -> load/refetch permission state
    -> enable protected TanStack Query work
```

On logout, token expiry, or HTTP `401`:

```text
cancel protected requests
    -> remove authenticated user-scoped query data
    -> clear PermissionProvider state
    -> clear principal/session state
    -> clear bearer credential
    -> return to anonymous/re-authentication flow
```

HTTP `403` does not clear the session.

Cache cleanup must occur before another actor is allowed to establish a new authenticated session in the same browser process.

## UI state

Local React state or URL search parameters own drawers, tab selection, filters, density, and other transient/shareable presentation state.

Zustand remains limited to justified cross-screen UI/operational context. It must not become an authentication-token store or backend-entity database.

## Form state

React Hook Form owns form input state; Zod owns frontend validation.

Authentication forms follow the verified transport DTOs. Frontend validation may improve UX but does not replace backend authentication/account-state enforcement.

## Realtime state

SSE/STOMP adapters shall not mutate complex global stores directly. They publish events that trigger notification center updates and TanStack Query invalidation.

Realtime transport must not become a second authentication or authorization state source.

## Cache key contract

```text
['workbench', module, resource, filters, page, size, organizationScope]
['topology', 'layers']
['topology', 'geojson', layers, filters]
['security', 'permission-catalog']
['security', 'permission-routes']
['identity', 'me', 'permissions']
['realtime', 'capabilities']
```

User-scoped query keys may remain structurally stable across sessions only if the entire authenticated cache is removed during session teardown; otherwise they must include stable actor/scope identity sufficient to prevent cross-user reuse.
