import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { CreatePermission, CreateRole, GrantPermissionToRole, GrantPermissionToUser, GrantRoleToUser } from '@/api/generated/identity-organization/model';
import {
  createIdentityPermission,
  createIdentityRole,
  grantIdentityRole,
  grantPermissionToIdentityRole,
  grantPermissionToIdentityUser,
} from '@/features/context/api/identityOrganizationApi';
import { IDENTITY_ORGANIZATION_PERMISSIONS } from '@/features/context/api/identityOrganizationPermissions';
import { usePermissions } from '@/features/permissions/usePermissions';

const optional = (value: string) => value.trim() || undefined;

export function IdentityAccessCommandPanel() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [role, setRole] = useState({ code: '', nameFr: '', roleType: '', status: 'ACTIVE' });
  const [permission, setPermission] = useState({ code: '', permissionDomain: '', resourceType: '', action: '', status: 'ACTIVE', sensitive: false });
  const [grant, setGrant] = useState({ kind: 'USER_ROLE', userId: '', roleId: '', permissionId: '', effect: 'ALLOW', scopeType: '', scopeReferenceId: '', reason: '' });

  const roleMutation = useMutation({ mutationFn: () => createIdentityRole({ code: role.code, nameFr: optional(role.nameFr), roleType: role.roleType, status: role.status } as CreateRole), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['hidra', 'identity-admin'] }) });
  const permissionMutation = useMutation({ mutationFn: () => createIdentityPermission({ ...permission } as CreatePermission), onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['hidra', 'identity-admin'] }) });
  const grantMutation = useMutation({
    mutationFn: () => {
      if (grant.kind === 'USER_ROLE') return grantIdentityRole({ userId: grant.userId, roleId: grant.roleId, scopeType: optional(grant.scopeType), scopeReferenceId: optional(grant.scopeReferenceId), reason: optional(grant.reason) } as GrantRoleToUser);
      if (grant.kind === 'ROLE_PERMISSION') return grantPermissionToIdentityRole({ roleId: grant.roleId, permissionId: grant.permissionId, effect: grant.effect } as GrantPermissionToRole);
      return grantPermissionToIdentityUser({ userId: grant.userId, permissionId: grant.permissionId, effect: grant.effect, scopeType: optional(grant.scopeType), scopeReferenceId: optional(grant.scopeReferenceId), reason: optional(grant.reason), emergencyAccess: false } as GrantPermissionToUser);
    },
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['hidra', 'identity-admin'] }),
  });

  const grantAllowed =
    grant.kind === 'USER_ROLE'
      ? permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.createUser)
      : grant.kind === 'ROLE_PERMISSION'
        ? permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.rolesExecute)
        : permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.permissionsExecute);

  return <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr 1fr' } }}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6">Create role</Typography>
      <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
        <TextField label="Code" size="small" value={role.code} onChange={(e) => setRole({ ...role, code: e.target.value })} />
        <TextField label="French name" size="small" value={role.nameFr} onChange={(e) => setRole({ ...role, nameFr: e.target.value })} />
        <TextField label="Role type" size="small" value={role.roleType} onChange={(e) => setRole({ ...role, roleType: e.target.value })} />
        <TextField label="Status" size="small" value={role.status} onChange={(e) => setRole({ ...role, status: e.target.value })} />
      </Box>
      <Button sx={{ mt: 1 }} variant="contained" disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.rolesExecute) || roleMutation.isPending} onClick={() => roleMutation.mutate()}>Create role</Button>
      {roleMutation.error ? <Alert severity="error" sx={{ mt: 1 }}>{String(roleMutation.error)}</Alert> : null}
    </Paper>

    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6">Create permission</Typography>
      <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
        <TextField label="Code" size="small" value={permission.code} onChange={(e) => setPermission({ ...permission, code: e.target.value })} />
        <TextField label="Domain" size="small" value={permission.permissionDomain} onChange={(e) => setPermission({ ...permission, permissionDomain: e.target.value })} />
        <TextField label="Resource type" size="small" value={permission.resourceType} onChange={(e) => setPermission({ ...permission, resourceType: e.target.value })} />
        <TextField label="Action" size="small" value={permission.action} onChange={(e) => setPermission({ ...permission, action: e.target.value })} />
        <TextField label="Status" size="small" value={permission.status} onChange={(e) => setPermission({ ...permission, status: e.target.value })} />
      </Box>
      <Button sx={{ mt: 1 }} variant="contained" disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.permissionsExecute) || permissionMutation.isPending} onClick={() => permissionMutation.mutate()}>Create permission</Button>
      {permissionMutation.error ? <Alert severity="error" sx={{ mt: 1 }}>{String(permissionMutation.error)}</Alert> : null}
    </Paper>

    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6">Grant access</Typography>
      <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
        <TextField select label="Grant type" size="small" value={grant.kind} onChange={(e) => setGrant({ ...grant, kind: e.target.value })}>
          <MenuItem value="USER_ROLE">Role to user</MenuItem><MenuItem value="ROLE_PERMISSION">Permission to role</MenuItem><MenuItem value="USER_PERMISSION">Permission to user</MenuItem>
        </TextField>
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="User ID" size="small" value={grant.userId} onChange={(e) => setGrant({ ...grant, userId: e.target.value })} /> : null}
        {grant.kind !== 'USER_PERMISSION' ? <TextField label="Role ID" size="small" value={grant.roleId} onChange={(e) => setGrant({ ...grant, roleId: e.target.value })} /> : null}
        {grant.kind !== 'USER_ROLE' ? <TextField label="Permission ID" size="small" value={grant.permissionId} onChange={(e) => setGrant({ ...grant, permissionId: e.target.value })} /> : null}
        {grant.kind !== 'USER_ROLE' ? <TextField label="Effect" size="small" value={grant.effect} onChange={(e) => setGrant({ ...grant, effect: e.target.value })} /> : null}
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="Scope type" size="small" value={grant.scopeType} onChange={(e) => setGrant({ ...grant, scopeType: e.target.value })} /> : null}
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="Scope reference" size="small" value={grant.scopeReferenceId} onChange={(e) => setGrant({ ...grant, scopeReferenceId: e.target.value })} /> : null}
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="Reason" size="small" value={grant.reason} onChange={(e) => setGrant({ ...grant, reason: e.target.value })} /> : null}
      </Box>
      <Button sx={{ mt: 1 }} variant="contained" disabled={!grantAllowed || grantMutation.isPending} onClick={() => grantMutation.mutate()}>Create grant</Button>
      {grantMutation.data ? <Alert severity="success" sx={{ mt: 1 }}>Grant created: {grantMutation.data}</Alert> : null}
      {grantMutation.error ? <Alert severity="error" sx={{ mt: 1 }}>{String(grantMutation.error)}</Alert> : null}
    </Paper>
  </Box>;
}
