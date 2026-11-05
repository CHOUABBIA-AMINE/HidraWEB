import type {
  AssignEmployeeRequest,
  CreatePermission,
  CreateRole,
  GrantPermissionToRole,
  GrantPermissionToUser,
  GrantRoleToUser,
  CreateOrganizationUnitRequest,
  CreateUserRequest,
  EmployeeAssignmentView,
  EmployeeResponse,
  EmployeeView,
  EvaluatePermissionRequest,
  OrganizationUnitResponse,
  OrganizationUnitView,
  PageEmployeeAssignmentView,
  PageEmployeeView,
  PageOrganizationUnitView,
  OperationalScopeResponse,
  PagePermissionView,
  PageRoleView,
  PageUserView,
  PermissionView,
  PermissionDecisionResponse,
  ResponsibilityMutationResponse,
  ResponsibilityResponse,
  RoleView,
  UserView,
  RegisterEmployeeRequest,
  RegisterOperationalScopeRequest,
  AssignResponsibilityRequest,
  RevokeResponsibilityRequest,
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


export function fetchOrganizationUnits(q = '', page = 0, size = 50): Promise<PageOrganizationUnitView> {
  return hidraHttpClient<PageOrganizationUnitView>({
    method: 'GET',
    url: '/api/v1/organization/units',
    params: { q: q || undefined, page, size },
  });
}

export function fetchOrganizationUnit(id: string): Promise<OrganizationUnitView> {
  return hidraHttpClient<OrganizationUnitView>({
    method: 'GET',
    url: `/api/v1/organization/units/${encodeURIComponent(id)}`,
  });
}

export function fetchOrganizationEmployees(q = '', page = 0, size = 50): Promise<PageEmployeeView> {
  return hidraHttpClient<PageEmployeeView>({
    method: 'GET',
    url: '/api/v1/organization/employees',
    params: { q: q || undefined, page, size },
  });
}

export function fetchOrganizationEmployee(id: string): Promise<EmployeeView> {
  return hidraHttpClient<EmployeeView>({
    method: 'GET',
    url: `/api/v1/organization/employees/${encodeURIComponent(id)}`,
  });
}

export function fetchOrganizationAssignments(
  employeeId = '',
  organizationUnitId = '',
  status = '',
  page = 0,
  size = 50,
): Promise<PageEmployeeAssignmentView> {
  return hidraHttpClient<PageEmployeeAssignmentView>({
    method: 'GET',
    url: '/api/v1/organization/assignments',
    params: {
      employeeId: employeeId || undefined,
      organizationUnitId: organizationUnitId || undefined,
      status: status || undefined,
      page,
      size,
    },
  });
}

export function fetchEmployeeAssignments(employeeId: string): Promise<EmployeeAssignmentView[]> {
  return hidraHttpClient<EmployeeAssignmentView[]>({
    method: 'GET',
    url: `/api/v1/organization/employees/${encodeURIComponent(employeeId)}/assignments`,
  });
}

export function registerOperationalScope(request: RegisterOperationalScopeRequest): Promise<OperationalScopeResponse> {
  return hidraHttpClient<OperationalScopeResponse>({
    method: 'POST',
    url: '/api/v1/organization/operational-scopes',
    data: request,
  });
}

export function assignOrganizationResponsibility(request: AssignResponsibilityRequest): Promise<ResponsibilityMutationResponse> {
  return hidraHttpClient<ResponsibilityMutationResponse>({
    method: 'POST',
    url: '/api/v1/organization/responsibilities',
    data: request,
  });
}

export function revokeOrganizationResponsibility(
  assignmentId: string,
  request: RevokeResponsibilityRequest,
): Promise<ResponsibilityMutationResponse> {
  return hidraHttpClient<ResponsibilityMutationResponse>({
    method: 'POST',
    url: `/api/v1/organization/responsibilities/${encodeURIComponent(assignmentId)}/revoke`,
    data: request,
  });
}

// HWEB-F11: transport remains generated from the accepted foundation contract.
import type {
  Credential, IdentityLocalCredentialState, User, Transition, Revoke, Grant,
  OrganizationFoundationChoice, OrganizationFoundationEmployeeState,
  OrganizationFoundationActivationRequest, OrganizationFoundationActivationEvent,
} from '@/api/generated/identity-organization/model';
const identityUserPath = (id: string) => `/api/v1/identity/users/${encodeURIComponent(id)}`;
export const fetchIdentityOperationCapabilities = () => hidraHttpClient<string[]>({ method: 'GET', url: '/api/v1/identity/me/operation-capabilities' });
export const fetchIdentityLifecycle = (id: string) => hidraHttpClient<User>({ method: 'GET', url: `${identityUserPath(id)}/lifecycle` });
export const fetchCredentialState = (id: string) => hidraHttpClient<IdentityLocalCredentialState>({ method: 'GET', url: `${identityUserPath(id)}/local-credential/state` });
export const setLocalCredential = (id: string, data: Credential) => hidraHttpClient<IdentityLocalCredentialState>({ method: 'PUT', url: `${identityUserPath(id)}/local-credential`, data });
export const transitionIdentityUser = (id: string, activate: boolean, data: Transition) => hidraHttpClient<User>({ method: 'POST', url: `${identityUserPath(id)}/${activate ? 'activate' : 'deactivate'}`, data });
export function revokeIdentityGrant(kind: 'user-role' | 'user-permission' | 'role-permission', id: string, data: Revoke) {
  const route = { 'user-role': 'users/role-grants', 'user-permission': 'users/permission-grants', 'role-permission': 'roles/permission-grants' }[kind];
  return hidraHttpClient<Grant>({ method: 'POST', url: `/api/v1/identity/${route}/${encodeURIComponent(id)}/revoke`, data });
}
export const fetchOrganizationUnitTypes = () => hidraHttpClient<OrganizationFoundationChoice[]>({ method: 'GET', url: '/api/v1/organization/reference/unit-types' });
export const fetchOrganizationPositions = () => hidraHttpClient<OrganizationFoundationChoice[]>({ method: 'GET', url: '/api/v1/organization/reference/positions' });
const employeePath = (id: string) => `/api/v1/organization/employees/${encodeURIComponent(id)}`;
export const fetchEmployeeLifecycle = (id: string) => hidraHttpClient<OrganizationFoundationEmployeeState>({ method: 'GET', url: `${employeePath(id)}/lifecycle` });
export const activateEmployee = (id: string, data: OrganizationFoundationActivationRequest) => hidraHttpClient<OrganizationFoundationEmployeeState>({ method: 'POST', url: `${employeePath(id)}/activate`, data });
export const fetchEmployeeLifecycleHistory = (id: string) => hidraHttpClient<OrganizationFoundationActivationEvent[]>({ method: 'GET', url: `${employeePath(id)}/lifecycle-history` });
