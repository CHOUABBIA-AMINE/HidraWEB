import type {
  AssignEmployeeRequest,
  CreateOrganizationUnitRequest,
  CreateUserRequest,
  EmployeeResponse,
  EvaluatePermissionRequest,
  OrganizationUnitResponse,
  PermissionDecisionResponse,
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
