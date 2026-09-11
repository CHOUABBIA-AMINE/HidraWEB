# HWEB-004 — Identity and Organization Context

```text
Status                 : IN PROGRESS
Frontend branch        : hweb-004-identity-organization-context
Frontend base          : HidraWEB main @ df15bb5ced5136ed4a280c1086b95502ec22bf03
Backend source         : HidraAPI main @ f8853fb17b17ff08baf16c4abdfdc810fcbaf01d
Backend owners         : identity, organization
```

## Verified backend inventory

### Identity direct endpoints

- `POST /api/v1/identity/users` — `CreateUserRequest` -> `UserResponse`
- `POST /api/v1/identity/permissions/evaluations` — `EvaluatePermissionRequest` -> `PermissionDecisionResponse`

No dedicated read/list controller endpoints for users, roles, or permissions are exposed by the current `SpringIdentityController`. No role or permission mutation controller is exposed.

### Organization direct endpoints

- `POST /api/v1/organization/units` — `CreateOrganizationUnitRequest` -> `OrganizationUnitResponse`
- `POST /api/v1/organization/employees` — `RegisterEmployeeRequest` -> `EmployeeResponse`
- `POST /api/v1/organization/employees/assignments` — `AssignEmployeeRequest` -> assignment identifier

No dedicated read/list controller endpoints are exposed by the current `SpringOrganizationController`.

### Verified workbench read resources

`HidraOperationalWorkbenchService` auto-indexes JPA entities under `dz.sh.hidra.modules.<module>` and derives resource names from entity class names. HWEB-004 therefore uses the verified HWEB-003 workbench contract for read/list/detail UX.

Identity resources required by HWEB-004:

- `identity/users` from `UserJpaEntity`
- `identity/roles` from `RoleJpaEntity`
- `identity/permissions` from `PermissionJpaEntity`

Organization resources required by HWEB-004:

- `organization/organization-units` from `OrganizationUnitJpaEntity`
- `organization/employees` from `EmployeeJpaEntity`
- `organization/employee-assignments` from `EmployeeAssignmentJpaEntity`

## Ownership rules

- Login credentials remain owned by identity/authentication. `CreateUserRequest` contains no password field and HidraWeb does not invent one.
- Employee hierarchy, units and assignments remain owned by organization.
- Identity may reference an employee through neutral reference IDs; organization may reference an identity user through neutral reference IDs.
- Reusable actor references require the caller to state whether the reference is an identity user or organization employee; HidraWeb does not infer cross-module ownership from opaque IDs.
- Frontend permission metadata remains an UX capability signal only. HidraAPI remains authoritative.

## OpenAPI status

HWEB-004 adds a source-derived OpenAPI snapshot for the five verified canonical command endpoints at backend commit `f8853fb...` and feeds it to Orval. Read/list/detail contracts continue to use the HWEB-003 workbench OpenAPI snapshot. A repository-wide stable HidraAPI OpenAPI artifact remains an HWEB-015-10 hardening gap.

## Completion checklist

- [x] HWEB-004-01 inventory current identity/organization controllers, DTOs and workbench resources.
- [x] HWEB-004-02 generate clients and map only verified contracts.
- [x] HWEB-004-03 implement users/roles/permissions workspaces where endpoints exist.
- [x] HWEB-004-04 implement organization units and employee/assignment workspaces where endpoints exist.
- [x] HWEB-004-05 establish reusable actor and organization display/reference components.
- [x] HWEB-004-06 keep login credentials owned by identity and employee hierarchy owned by organization.
- [ ] HWEB-004-07 authorization and workflow-reference tests.

## Mandatory completion record

```text
Backend source commit / branch : f8853fb17b17ff08baf16c4abdfdc810fcbaf01d / main
Endpoints and DTOs used         : 5 canonical command endpoints; HWEB-003 workbench read/list/detail; DTOs listed above
Permissions used                : HIDRA_IDENTITY_USERS_EXECUTE, HIDRA_IDENTITY_PERMISSIONS_EXECUTE, HIDRA_ORGANIZATION_UNITS_EXECUTE, HIDRA_ORGANIZATION_EMPLOYEES_EXECUTE + HWEB-003 generic read permissions
Frontend routes created/changed : /administration/users, /administration/organization
State ownership                 : TanStack Query = backend state; local React state = tabs/forms/search/paging; contextual drawer = record detail
Error states                    : backend errors remain normalized by central HTTP layer; read workspaces reuse HWEB-003 loading/empty/400/403/404/5xx handling
Tests added                     : pending HWEB-004-07
OpenAPI regeneration status     : source-derived identity/organization snapshot + Orval; HWEB-003 workbench generation retained
Known backend gaps              : no principal endpoint; no role/permission mutation controllers; no dedicated identity/organization read controllers; permission catalog metadata-only; no stable full OpenAPI artifact
CI result                       : pending
```
