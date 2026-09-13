# 12 — Authentication Specification

## HWEB-015-01 enterprise authentication contract freeze

HWEB-015-01 freezes the supported enterprise production authentication contract against HidraAPI `main` commit `725a451ae4880ccb4f2ec508709241f88cd4aea7`.

The supported enterprise production mode is **JWT bearer authentication backed by an external OpenID Connect identity provider**.

HidraAPI also implements `basic` and `disabled` authentication modes for bootstrap/development scenarios. HidraWEB must not treat either mode as the supported enterprise production contract.

HWEB-015-01 is a contract-freeze task only. Browser OIDC client integration, redirect/callback handling, token lifecycle hardening, and production session behavior belong to HWEB-015-02.

## Authoritative browser bootstrap contract

Before authentication, HidraWEB shall obtain repository-owned browser authentication metadata from:

```text
GET /api/v1/security/oidc
```

The endpoint is intentionally public in HidraAPI security configuration.

Its response is authoritative for these fields:

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

HidraWEB must not duplicate or infer runtime issuer, client ID, audience, scopes, logout URI, or token-storage policy from unrelated configuration.

## Frozen production flow

The repository-published browser flow is:

```text
authenticationMode = jwt
authorizationFlow = authorization_code_pkce
browserTokenStorage = memory
externalIdpRegistrationRequired = true
```

Therefore the production browser contract is:

1. External enterprise IdP.
2. OpenID Connect / OAuth 2.0 Authorization Code flow with PKCE.
3. Public browser client; no client secret may be embedded in HidraWEB.
4. Access token presented to HidraAPI as an HTTP `Authorization: Bearer <token>` header.
5. Browser-held tokens remain in memory under the current backend-published policy.
6. HidraAPI remains a stateless OAuth2 resource server and does not own the browser login session.

HidraWEB must not add implicit flow, password grant, client-credentials login for browser users, local HidraAPI username/password login, or browser-persisted bearer-token storage unless the authoritative backend contract changes in a later accepted task.

## Required repository configuration

For the repository-published OIDC contract to be complete, HidraAPI requires all of the following:

- `authenticationMode` resolves to `jwt`;
- `issuerUri` is configured;
- `clientId` is configured.

The endpoint exposes this result through `repositoryConfigurationComplete`.

If `repositoryConfigurationComplete` is `false`, HidraWEB must fail closed for enterprise OIDC startup rather than invent missing IdP metadata.

The current default audience is `hidra-api` and the current default scopes are `openid,profile`, but HidraWEB must consume the runtime values returned by `/api/v1/security/oidc` rather than hard-code those defaults as enterprise truth.

## External IdP registration contract

`externalIdpRegistrationRequired = true` means the enterprise IdP registration is an external deployment prerequisite.

The IdP registration must correspond to the runtime metadata returned by HidraAPI, including issuer/client identity, scopes, and API audience. Exact browser redirect URI(s), post-logout redirect URI(s), tenant/domain policy, MFA/conditional-access policy, and IdP vendor are not published by the current HidraAPI contract and must not be invented by HidraWEB.

Those deployment-specific values must be supplied by the approved enterprise IdP registration and production deployment design.

## JWT validation and authority contract

HidraAPI validates JWTs as the resource server. Its JWT configuration supports issuer/JWK validation and an audience contract.

Current authority mapping is backend-owned:

- principal claim default: `sub`;
- roles claim default: `roles`, mapped with the configured role authority prefix (default `ROLE_`);
- scope claim default: `scope`, mapped with `SCOPE_`.

HidraWEB must not use decoded token roles/scopes as a replacement for the existing fail-closed frontend permission contract. Effective frontend authorization remains the intersection of:

```text
GET /api/v1/security/permissions/routes
GET /api/v1/identity/me/permissions
```

Backend authorization and HTTP 403 remain final authority.

## Login flow boundary

HidraAPI exposes no local application login endpoint and disables Spring form login.

For the supported enterprise mode, HidraWEB shall authenticate through the approved external IdP using Authorization Code + PKCE. HWEB-015-02 will implement the concrete browser redirect/callback client behavior.

The current manual JWT-token entry capability in HidraWEB is development/bootstrap infrastructure, not the accepted production enterprise login UX.

## Logout boundary

HidraAPI disables application logout and does not own an authenticated HTTP session.

`logoutUri` is optional repository-published IdP metadata. If absent, HidraWEB must not synthesize an IdP logout endpoint. Exact logout and post-logout behavior is deferred to HWEB-015-02 and must follow the runtime IdP contract.

## Token lifecycle boundary

HidraAPI publishes no local refresh-token endpoint. Refresh/re-authentication behavior is therefore an IdP/browser-client concern.

HWEB-015-01 does not define silent refresh, refresh-token persistence, iframe renewal, token rotation, idle timeout, or retry semantics. Those behaviors require the approved IdP capabilities and belong to HWEB-015-02.

No access token, refresh token, authorization code, PKCE verifier, or client secret may be committed to source or embedded as a Vite build-time secret.

## Runtime mode compatibility

HidraWEB currently recognizes `basic`, `jwt`, and `disabled` runtime modes because earlier development stages needed all three backend-compatible modes.

The HWEB-015-01 production freeze does not remove those compatibility paths. It establishes that only `jwt` + external OIDC/PKCE is supported for enterprise production deployment.

Removal or further isolation of bootstrap modes, if desired, is a later implementation concern and must not be folded into this contract-freeze task.

## WebSocket authentication

The STOMP endpoint remains `/api/v1/realtime/ws`.

Exact production WebSocket bearer propagation/handshake behavior is not defined by the `/api/v1/security/oidc` contract. HWEB-015-01 therefore does not invent a WebSocket token transport rule. Any production WebSocket authentication hardening must be based on separately verified backend handshake behavior.

## HWEB-015-01 frozen decision summary

```text
Enterprise production authentication : external OIDC IdP + JWT
Browser authorization flow            : authorization_code_pkce
Bootstrap metadata endpoint            : GET /api/v1/security/oidc
Browser client secret                  : forbidden / not applicable
API credential                         : Bearer access token
Browser token storage                  : memory
API session model                      : stateless
Local HidraAPI login endpoint          : none
Local HidraAPI logout endpoint         : none
Local HidraAPI refresh endpoint        : none evidenced
IdP registration                      : required externally
IdP vendor / tenant                    : not frozen by repository evidence
Redirect/logout redirect URIs          : deployment-specific; not invented
Frontend effective authorization       : route descriptors ∩ /identity/me/permissions
Backend authorization                  : final authority
Next implementation task               : HWEB-015-02
```
