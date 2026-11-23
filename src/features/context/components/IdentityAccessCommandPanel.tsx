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
import { canUseIdentityCommand, isIdentityGrantComplete, type IdentityGrantInput, type IdentityGrantKind } from '@/features/context/model/identityCommandAdmission';
import { usePermissions } from '@/features/permissions/usePermissions';

const optional = (value: string) => value.trim() || undefined;
const blankGrant = (kind: IdentityGrantKind): IdentityGrantInput => ({
  kind, userId: '', roleId: '', permissionId: '', effect: 'ALLOW',
  scopeType: '', scopeReferenceId: '', reason: '',
});
const grantRoute: Record<IdentityGrantKind, string> = {
  USER_ROLE: '/api/v1/identity/users/role-grants',
  ROLE_PERMISSION: '/api/v1/identity/roles/permission-grants',
  USER_PERMISSION: '/api/v1/identity/users/permission-grants',
};

export function IdentityAccessCommandPanel() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [role, setRole] = useState({ code: '', nameFr: '', roleType: '', status: 'ACTIVE' });
  const [permission, setPermission] = useState({ code: '', permissionDomain: '', resourceType: '', action: '', status: 'ACTIVE', sensitive: false });
  const [grant, setGrant] = useState<IdentityGrantInput>(() => blankGrant('USER_ROLE'));
  const roleAllowed = canUseIdentityCommand(permissions, '/api/v1/identity/roles', 'POST');
  const permissionAllowed = canUseIdentityCommand(permissions, '/api/v1/identity/permissions', 'POST');
  const grantAllowed = canUseIdentityCommand(permissions, grantRoute[grant.kind], 'POST');
  const roleComplete = Boolean(role.code.trim() && role.roleType.trim() && role.status.trim());
  const permissionComplete = Boolean(permission.code.trim() && permission.permissionDomain.trim() &&
    permission.resourceType.trim() && permission.action.trim() && permission.status.trim());

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

  const changeKind = (kind: IdentityGrantKind) => {
    if (grantMutation.isPending) return;
    grantMutation.reset();
    setGrant(blankGrant(kind));
  };
  const updateGrant = (field: keyof IdentityGrantInput, value: string) => {
    if (grantMutation.isPending) return;
    grantMutation.reset();
    setGrant((current) => ({ ...current, [field]: value }));
  };
  const refreshAfterUnknownOutcome = async (reset: () => void) => {
    await queryClient.invalidateQueries({ queryKey: ['hidra', 'identity-admin'] });
    reset();
  };

  return <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr 1fr' } }}>
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6">Create role</Typography>
      <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
        <TextField label="Code" size="small" value={role.code} onChange={(e) => setRole({ ...role, code: e.target.value })} />
        <TextField label="French name" size="small" value={role.nameFr} onChange={(e) => setRole({ ...role, nameFr: e.target.value })} />
        <TextField label="Role type" size="small" value={role.roleType} onChange={(e) => setRole({ ...role, roleType: e.target.value })} />
        <TextField label="Status" size="small" value={role.status} onChange={(e) => setRole({ ...role, status: e.target.value })} />
      </Box>
      <Button sx={{ mt: 1 }} variant="contained" disabled={!roleAllowed || !roleComplete || roleMutation.isPending || roleMutation.isError} onClick={() => roleMutation.mutate()}>Create role</Button>
      {roleMutation.isError ? <Alert severity="error" sx={{ mt: 1 }}>Outcome unknown. Review the current backend roles before another write.
        <Button size="small" onClick={() => { void refreshAfterUnknownOutcome(() => roleMutation.reset()); }}>Refresh for review</Button>
      </Alert> : null}
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
      <Button sx={{ mt: 1 }} variant="contained" disabled={!permissionAllowed || !permissionComplete || permissionMutation.isPending || permissionMutation.isError} onClick={() => permissionMutation.mutate()}>Create permission</Button>
      {permissionMutation.isError ? <Alert severity="error" sx={{ mt: 1 }}>Outcome unknown. Review current backend permissions before another write.
        <Button size="small" onClick={() => { void refreshAfterUnknownOutcome(() => permissionMutation.reset()); }}>Refresh for review</Button>
      </Alert> : null}
    </Paper>

    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6">Grant access</Typography>
      <Box sx={{ display: 'grid', gap: 1, mt: 1 }}>
        <TextField select label="Grant type" size="small" value={grant.kind} disabled={grantMutation.isPending} onChange={(e) => changeKind(e.target.value as IdentityGrantKind)}>
          <MenuItem value="USER_ROLE">Role to user</MenuItem><MenuItem value="ROLE_PERMISSION">Permission to role</MenuItem><MenuItem value="USER_PERMISSION">Permission to user</MenuItem>
        </TextField>
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="User ID" size="small" value={grant.userId} disabled={grantMutation.isPending} onChange={(e) => updateGrant('userId', e.target.value)} /> : null}
        {grant.kind !== 'USER_PERMISSION' ? <TextField label="Role ID" size="small" value={grant.roleId} disabled={grantMutation.isPending} onChange={(e) => updateGrant('roleId', e.target.value)} /> : null}
        {grant.kind !== 'USER_ROLE' ? <TextField label="Permission ID" size="small" value={grant.permissionId} disabled={grantMutation.isPending} onChange={(e) => updateGrant('permissionId', e.target.value)} /> : null}
        {grant.kind !== 'USER_ROLE' ? <TextField label="Effect" size="small" value={grant.effect} disabled={grantMutation.isPending} onChange={(e) => updateGrant('effect', e.target.value)} /> : null}
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="Scope type" size="small" value={grant.scopeType} disabled={grantMutation.isPending} onChange={(e) => updateGrant('scopeType', e.target.value)} /> : null}
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="Scope reference" size="small" value={grant.scopeReferenceId} disabled={grantMutation.isPending} onChange={(e) => updateGrant('scopeReferenceId', e.target.value)} /> : null}
        {grant.kind !== 'ROLE_PERMISSION' ? <TextField label="Reason" size="small" value={grant.reason} disabled={grantMutation.isPending} onChange={(e) => updateGrant('reason', e.target.value)} /> : null}
      </Box>
      <Button sx={{ mt: 1 }} variant="contained" disabled={!grantAllowed || !isIdentityGrantComplete(grant) || grantMutation.isPending || grantMutation.isError} onClick={() => grantMutation.mutate()}>Create grant</Button>
      {grantMutation.data && grantAllowed ? <Alert severity="success" sx={{ mt: 1 }}>Grant created: {grantMutation.data}</Alert> : null}
      {grantMutation.isError ? <Alert severity="error" sx={{ mt: 1 }}>Grant outcome may have committed. Review the backend authorization state before creating another grant.
        <Button size="small" onClick={() => { void refreshAfterUnknownOutcome(() => grantMutation.reset()); }}>Refresh for review</Button>
      </Alert> : null}
    </Paper>
  </Box>;
}
