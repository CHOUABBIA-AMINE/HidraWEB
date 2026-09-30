import { beforeEach, describe, expect, it, vi } from 'vitest';
const httpClient = vi.hoisted(() => vi.fn());
vi.mock('@/api/client/hidraHttpClient', () => ({ hidraHttpClient: httpClient }));
import {
 createIdentityPermission, createIdentityRole, fetchIdentityPermissions, fetchIdentityRoles, fetchIdentityUser, fetchIdentityUsers,
 grantIdentityRole, grantPermissionToIdentityRole, grantPermissionToIdentityUser,
} from '@/features/context/api/identityOrganizationApi';

describe('identity administration API', () => {
 beforeEach(() => httpClient.mockReset());
 it('uses dedicated identity administration reads', async () => {
  httpClient.mockResolvedValue({});
  await fetchIdentityUsers('amin',0,20); await fetchIdentityUser('user/1'); await fetchIdentityRoles('',0,20); await fetchIdentityPermissions('',0,20);
  expect(httpClient).toHaveBeenNthCalledWith(1,{method:'GET',url:'/api/v1/identity/users',params:{q:'amin',page:0,size:20}});
  expect(httpClient).toHaveBeenNthCalledWith(2,{method:'GET',url:'/api/v1/identity/users/user%2F1'});
  expect(httpClient).toHaveBeenNthCalledWith(3,{method:'GET',url:'/api/v1/identity/roles',params:{q:undefined,page:0,size:20}});
  expect(httpClient).toHaveBeenNthCalledWith(4,{method:'GET',url:'/api/v1/identity/permissions',params:{q:undefined,page:0,size:20}});
 });
 it('uses backend role permission and grant commands', async () => {
  httpClient.mockResolvedValue({});
  await createIdentityRole({code:'OPS',roleType:'BUSINESS',status:'ACTIVE'});
  await createIdentityPermission({code:'alarm:read',permissionDomain:'alarm',resourceType:'alarms',action:'read',sensitive:false,status:'ACTIVE'});
  await grantIdentityRole({userId:'u1',roleId:'r1'});
  await grantPermissionToIdentityRole({roleId:'r1',permissionId:'p1',effect:'ALLOW'});
  await grantPermissionToIdentityUser({userId:'u1',permissionId:'p1',effect:'ALLOW',emergencyAccess:false});
  expect(httpClient).toHaveBeenNthCalledWith(1,{method:'POST',url:'/api/v1/identity/roles',data:{code:'OPS',roleType:'BUSINESS',status:'ACTIVE'}});
  expect(httpClient).toHaveBeenNthCalledWith(3,{method:'POST',url:'/api/v1/identity/users/role-grants',data:{userId:'u1',roleId:'r1'}});
  expect(httpClient).toHaveBeenNthCalledWith(4,{method:'POST',url:'/api/v1/identity/roles/permission-grants',data:{roleId:'r1',permissionId:'p1',effect:'ALLOW'}});
  expect(httpClient).toHaveBeenNthCalledWith(5,{method:'POST',url:'/api/v1/identity/users/permission-grants',data:{userId:'u1',permissionId:'p1',effect:'ALLOW',emergencyAccess:false}});
 });
});
