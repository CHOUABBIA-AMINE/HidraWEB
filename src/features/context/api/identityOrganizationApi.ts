import type {
  AssignEmployeeRequest,
  CreatePermission,
  CreateRole,
  GrantPermissionToRole,
  GrantPermissionToUser,
  GrantRoleToUser,
  CreateOrganizationUnitRequest,
  CreateUserRequest,
  EmployeeResponse,
  EvaluatePermissionRequest,
  OrganizationUnitResponse,
  OperationalScopeResponse,
  PagePermissionView,
  PageRoleView,
  PageUserView,
  PermissionView,
  PermissionDecisionResponse,
  ResponsibilityResponse,
  RoleView,
  UserView,
  RegisterEmployeeRequest,
  UserResponse,
} from '@/api/generated/identity-organization/model';
import { hidraHttpClient } from '@/api/client/hidraHttpClient';

export function createIdentityUser(request: CreateUserRequest): Promise<UserResponse> {
  return hidraHttpClient<UserResponse>({ method: 'POST', url: '/api/v1/identity/users', data: request });
}

export function evaluateIdentityPermission(request: EvaluatePermissionRequest): Promise<PermissionDecisionResponse> {
  return hidraHttpClient<PermissionDecisionResponse>({
    method: 'POST',
    url: '/api/v1/identity/permissions/evaluations',
    data: request,
  });
}

export function createOrganizationUnit(request: CreateOrganizationUnitRequest): Promise<OrganizationUnitResponse> {
  return hidraHttpClient<OrganizationUnitResponse>({ method: 'POST', url: '/api/v1/organization/units', data: request });
}

export function registerEmployee(request: RegisterEmployeeRequest): Promise<EmployeeResponse> {
  return hidraHttpClient<EmployeeResponse>({ method: 'POST', url: '/api/v1/organization/employees', data: request });
}

export function assignEmployee(request: AssignEmployeeRequest): Promise<string> {
  return hidraHttpClient<string>({
    method: 'POST',
    url: '/api/v1/organization/employees/assignments',
    data: request,
  });
}


export function fetchResponsibilitiesByEmployee(employeeId: string): Promise<ResponsibilityResponse[]> {
  return hidraHttpClient<ResponsibilityResponse[]>({
    method: 'GET',
    url: '/api/v1/organization/responsibilities',
    params: { assigneeType: 'EMPLOYEE', assigneeId: employeeId },
  });
}

export function fetchOperationalScope(scopeId: number): Promise<OperationalScopeResponse> {
  return hidraHttpClient<OperationalScopeResponse>({
    method: 'GET',
    url: `/api/v1/organization/operational-scopes/${scopeId}`,
  });
}


export function fetchIdentityUsers(q = '', page = 0, size = 20): Promise<PageUserView> {
  return hidraHttpClient<PageUserView>({ method: 'GET', url: '/api/v1/identity/users', params: { q: q || undefined, page, size } });
}

export function fetchIdentityUser(id: string): Promise<UserView> {
  return hidraHttpClient<UserView>({ method: 'GET', url: `/api/v1/identity/users/${encodeURIComponent(id)}` });
}

export function fetchIdentityRoles(q = '', page = 0, size = 20): Promise<PageRoleView> {
  return hidraHttpClient<PageRoleView>({ method: 'GET', url: '/api/v1/identity/roles', params: { q: q || undefined, page, size } });
}

export function fetchIdentityPermissions(q = '', page = 0, size = 20): Promise<PagePermissionView> {
  return hidraHttpClient<PagePermissionView>({ method: 'GET', url: '/api/v1/identity/permissions', params: { q: q || undefined, page, size } });
}

export function createIdentityRole(request: CreateRole): Promise<RoleView> {
  return hidraHttpClient<RoleView>({ method: 'POST', url: '/api/v1/identity/roles', data: request });
}

export function createIdentityPermission(request: CreatePermission): Promise<PermissionView> {
  return hidraHttpClient<PermissionView>({ method: 'POST', url: '/api/v1/identity/permissions', data: request });
}

export function grantIdentityRole(request: GrantRoleToUser): Promise<string> {
  return hidraHttpClient<string>({ method: 'POST', url: '/api/v1/identity/users/role-grants', data: request });
}

export function grantPermissionToIdentityRole(request: GrantPermissionToRole): Promise<string> {
  return hidraHttpClient<string>({ method: 'POST', url: '/api/v1/identity/roles/permission-grants', data: request });
}

export function grantPermissionToIdentityUser(request: GrantPermissionToUser): Promise<string> {
  return hidraHttpClient<string>({ method: 'POST', url: '/api/v1/identity/users/permission-grants', data: request });
}
