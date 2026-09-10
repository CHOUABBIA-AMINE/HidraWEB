# HWEB-002 — Application Shell, Authentication and Permissions

```text
Task                : HWEB-002
Repository          : CHOUABBIA-AMINE/HidraWEB
Implementation      : hweb-002-shell-auth-permissions
Frontend base       : HidraWEB main @ 6805fd0332e0577eeece086ce8b4373b1e2d0cd1
Backend truth       : HidraAPI main @ f8853fb17b17ff08baf16c4abdfdc810fcbaf01d
Status              : IMPLEMENTED — CI VERIFICATION PENDING
Next task           : HWEB-003 (DO NOT START until HWEB-002 is reported/reviewed)
```

## 1. Backend evidence used

Verified from HidraAPI `main` before implementation:

| Concern | HidraAPI evidence | HidraWeb decision |
|---|---|---|
| Default security | `hidra.platform.security.authentication-mode` defaults to `jwt` | runtime-auth mode is explicit configuration |
| Development | `application-dev.properties` defaults to `basic` | development sign-in supports runtime Basic credentials |
| Test | `application-test.properties` defaults to `basic` | CI/E2E can exercise the Basic adapter without embedding credentials |
| Staging | `application-staging.properties` defaults to `jwt` | no local login flow is invented |
| Production | `application-production.properties` defaults to `jwt` | enterprise identity must hand a token to AuthProvider |
| Basic security | Spring Security HTTP Basic, stateless | Basic credentials are held in memory only and converted to an Authorization header centrally |
| JWT security | OAuth2 resource server; principal claim defaults to `sub` | JWT adapter accepts a runtime access token and uses the backend-validated `sub` only as a display label |
| Permission catalog | `GET /api/v1/security/permissions/catalog` | fetched by TanStack Query after authentication |
| Route catalog | `GET /api/v1/security/permissions/routes` | fetched independently and normalized for route/action/navigation metadata |
| Permission format | `HIDRA_<MODULE>_<RESOURCE>_<ACTION>` | exact backend-published permission strings are consumed |
| Enforcement evidence | catalog says `catalog-only`; no route-specific `@PreAuthorize` evidence | client guards are UX/capability guards only; backend remains authoritative |

## 2. Explicit backend gaps — TARGET, not invented

### TARGET-SEC-001 — authenticated principal

No authenticated-principal endpoint (`/me`, `/principal`, `whoami` or equivalent) was found in the current HidraAPI controllers.

Therefore HWEB-002 does **not** invent:

- a principal DTO;
- employee/organization identity fields;
- profile photo/name/email APIs;
- user role/permission grants beyond the backend-published route metadata.

The profile menu displays only the identity available from the active authentication transport (Basic username or backend-validated JWT `sub`) and marks richer profile data as requiring a backend contract.

### TARGET-SEC-002 — enterprise token acquisition

HidraAPI is a JWT resource server but does not expose a local login/token-acquisition endpoint. HWEB-002 therefore implements the JWT transport adapter but does not invent an OIDC authorization URL, client ID, redirect URI or token endpoint. Enterprise OIDC/IdP integration can supply its access token to `AuthProvider.authenticateJwt()` without redesigning feature code.

### TARGET-SEC-003 — user-specific permission grants

The current permission service publishes derived route metadata and explicitly states route-specific authorization annotations are unavailable. It is not a user-entitlement endpoint. HWEB-002 uses that metadata to expose only backend-evidenced capabilities and never presents the frontend guard as a security boundary.

## 3. Task status

| Task | Status | Implementation |
|---|---|---|
| HWEB-002-01 inventory authentication modes/environment | DONE | this document + runtime config |
| HWEB-002-02 Basic/JWT AuthProvider adapters | DONE | `src/app/auth/*` |
| HWEB-002-03 authenticated-principal endpoint check | DONE / GAP RECORDED | TARGET-SEC-001 |
| HWEB-002-04 permission catalog query | DONE | `permissionApi.ts` + `PermissionProvider` |
| HWEB-002-05 route descriptor query | DONE | `permissionApi.ts` + `PermissionProvider` |
| HWEB-002-06 normalize permission metadata/guards | DONE | `permissionModel.ts`, `PermissionContext` |
| HWEB-002-07 permanent navbar | DONE | `src/shell/navbar/HidraNavbar.tsx` |
| HWEB-002-08 collapsible process sidebar | DONE | canonical navigation registry + sidebar |
| HWEB-002-09 permission/capability intersection | DONE | module-capability intersection from backend route descriptors |
| HWEB-002-10 global 401/403/404 states | DONE | login/unauthorized flow, permission boundary, authenticated 404 |
| HWEB-002-11 contextual drawer infrastructure | DONE | `src/shell/context/*` |
| HWEB-002-12 accessibility/keyboard tests | DONE | accessible labels + real-browser keyboard sidebar test |
| HWEB-002-13 authorization E2E scenarios | DONE | Basic success, 401, 403, 404, keyboard shell |

## 4. Navigation behavior

The sidebar hierarchy is copied from the canonical Navigation Blueprint, not reconstructed from backend module names. Visibility is calculated as:

```text
canonical navigation item
  AND at least one supporting module appears in HidraAPI route metadata
  -> visible

future roadmap workspace not implemented yet
  -> visible only as a disabled/planned entry
  -> never presented as operationally available
```

`/overview` is the only HWEB-002 operational workspace. HWEB-005+ routes are not implemented by this task.

## 5. Security rules enforced by the frontend architecture

- feature code never constructs Basic/Bearer headers;
- credentials/tokens are not Vite build variables and are not committed;
- Basic credentials remain in browser memory only;
- 401 clears the active AuthProvider session and returns the user to authentication;
- permission metadata loads only after authentication;
- client `can(...)` means backend-published capability metadata, never security enforcement;
- backend 403 remains authoritative;
- no persona/role name is hard-coded as an authorization rule.

## 6. Verification gate

HWEB-002 is complete only after the branch passes:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

The CI run/commit will be recorded here after verification.
