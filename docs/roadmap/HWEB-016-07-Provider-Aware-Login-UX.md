# HWEB-016-07 — Provider-aware login UX

Status: READY FOR CI VERIFICATION

## Goal

Replace the remaining LOCAL-only credential sign-in seam with provider-aware credential login for the AUTH-030 providers already supported by `AuthenticationGateway`:

```text
LOCAL
LDAP
ACTIVE_DIRECTORY
```

OIDC remains on the existing Authorization Code + PKCE flow.

## Contract basis

HWEB-016-03 established that credential providers use the same HidraAPI endpoint:

```text
POST /api/v1/identity/authentication/login
```

with an explicit `providerType`, and that provider exposure must not depend on an invented browser provider-capability endpoint.

HWEB-016-06 already normalized successful provider responses into a single Hidra session and deliberately left provider-selection UX and LDAP/Active Directory UX out of scope.

## Provider exposure decision

Until a backend provider-capability endpoint is evidenced, HidraWEB exposes exactly one deployment-approved credential provider through:

```text
VITE_HIDRA_CREDENTIAL_PROVIDER=LOCAL|LDAP|ACTIVE_DIRECTORY
```

Rules:

- default is `LOCAL` for backward-compatible development behavior;
- only the configured provider may be submitted by `AuthProvider`;
- there is no automatic provider fallback;
- OIDC is not a credential-provider value and continues to use `VITE_HIDRA_AUTH_MODE=jwt`;
- credentials and Hidra access tokens remain runtime memory only.

## Implementation

- `runtimeConfig` validates the configured credential provider.
- `AuthContext` exposes the configured credential provider and a provider-aware credential authentication operation.
- `AuthProvider` routes `LOCAL` to `AuthenticationGateway.loginLocal`.
- `AuthProvider` routes `LDAP` and `ACTIVE_DIRECTORY` to `AuthenticationGateway.loginDirectory`.
- `AuthProvider` rejects a provider that differs from the deployment-approved provider before any authentication request is made.
- `LoginPage` displays the active credential provider and submits through the provider-aware context operation.
- the legacy `authenticateBasic` UI/context operation is removed; `basic` remains only as the temporary deployment-mode name pending later runtime-config cleanup.
- Vitest fixtures isolate both local and directory gateway operations.

## Out of scope

- dynamic provider discovery
- exposing multiple providers simultaneously
- provider fallback
- OIDC protocol changes
- refresh-token behavior
- server-side logout/revoke behavior
- removal/renaming of the legacy `basic|jwt|disabled` deployment mode

## Acceptance gates

The exact PR head must pass:

1. OpenAPI compatibility
2. all generated clients
3. lint
4. typecheck
5. unit/component tests
6. performance tests
7. production build
8. release package and verification
9. Chromium installation
10. full Playwright regression suite
11. verified release artifact upload
