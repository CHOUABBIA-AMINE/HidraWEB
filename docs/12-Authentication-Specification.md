# 12 — Authentication Specification

## Backend evidence

HidraAPI security configuration exposes JWT resource-server support, basic mode and disabled mode. Production usage shall prefer JWT.

## Login flow

- HidraWeb redirects to enterprise IdP or uses an approved OAuth/OIDC client.
- HidraAPI does not expose a local login endpoint in available evidence.
- Frontend stores tokens using secure browser strategy approved by SONATRACH security.

## Logout flow

- Clear frontend session.
- Revoke/expire IdP session if supported by the enterprise IdP.
- Redirect to login or IdP logout landing page.

## Token lifecycle

Unable to determine refresh endpoint from available HidraAPI evidence. Refresh strategy must be aligned with the IdP.

## Session timeout

Use token expiry as source of truth. Add idle timeout in frontend according to SONATRACH policy.

## WebSocket authentication

STOMP endpoint is `/api/v1/realtime/ws`. HidraWeb shall pass bearer tokens using the approved STOMP connection header or cookie strategy, depending on Spring Security configuration. Exact backend handshake authorization behavior is **Unable to determine from available evidence**.
