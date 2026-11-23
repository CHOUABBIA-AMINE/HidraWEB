import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { AssignResponsibilityRequest, RegisterOperationalScopeRequest, RevokeResponsibilityRequest } from '@/api/generated/identity-organization/model';
import {
  assignOrganizationResponsibility,
  fetchResponsibilitiesByEmployee,
  registerOperationalScope,
  revokeOrganizationResponsibility,
} from '@/features/context/api/identityOrganizationApi';
import { IDENTITY_ORGANIZATION_PERMISSIONS } from '@/features/context/api/identityOrganizationPermissions';
import { usePermissions } from '@/features/permissions/usePermissions';

const SCOPE_TYPES = ['GLOBAL', 'ORGANIZATION_UNIT', 'PIPELINE_SYSTEM', 'PIPELINE', 'FACILITY', 'EQUIPMENT', 'CUSTOM'] as const;
const RESPONSIBILITY_TYPES = ['OWNER', 'ACCOUNTABLE', 'RESPONSIBLE', 'SUPPORT', 'ESCALATION', 'APPROVER'] as const;

export function OrganizationResponsibilityPanel() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [employeeId, setEmployeeId] = useState('');
  const [scope, setScope] = useState({ type: 'ORGANIZATION_UNIT', targetId: '' });
  const [assignment, setAssignment] = useState({ responsibilityType: 'RESPONSIBLE', assigneeType: 'EMPLOYEE', assigneeId: '', scopeId: '', workflowInstanceId: '', operationReference: '', description: '' });
  const [revoke, setRevoke] = useState({ assignmentId: '', workflowInstanceId: '', operationReference: '' });

  const responsibilityReadRoute = permissions.routes.find((route) =>
    route.route === '/api/v1/organization/responsibilities' && route.methods.includes('GET'));
  const canReadResponsibilities = permissions.status === 'ready' &&
    Boolean(responsibilityReadRoute?.permission && permissions.can(responsibilityReadRoute.permission));

  const responsibilities = useQuery({
    queryKey: ['hidra', 'organization-admin', 'responsibilities', employeeId],
    queryFn: () => fetchResponsibilitiesByEmployee(employeeId),
    enabled: canReadResponsibilities && Boolean(employeeId.trim()),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  const registerMutation = useMutation({
    mutationFn: () => registerOperationalScope({ type: scope.type, targetId: scope.targetId.trim() || undefined } as RegisterOperationalScopeRequest),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['hidra', 'organization-admin'] }),
  });
  const assignMutation = useMutation({
    mutationFn: () => assignOrganizationResponsibility({
      responsibilityType: assignment.responsibilityType,
      assigneeType: assignment.assigneeType,
      assigneeId: assignment.assigneeId,
      scopeId: Number(assignment.scopeId),
      description: assignment.description.trim() || undefined,
      workflowInstanceId: assignment.workflowInstanceId,
      operationReference: assignment.operationReference,
    } as AssignResponsibilityRequest),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['hidra', 'organization-admin'] }),
  });
  const revokeMutation = useMutation({
    mutationFn: () => revokeOrganizationResponsibility(revoke.assignmentId, {
      workflowInstanceId: revoke.workflowInstanceId,
      operationReference: revoke.operationReference,
    } as RevokeResponsibilityRequest),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['hidra', 'organization-admin'] }),
  });

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6">Operational responsibilities</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField fullWidth label="Employee ID" size="small" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} />
          <Button variant="outlined" disabled={!canReadResponsibilities || !employeeId.trim() || responsibilities.isFetching}
            onClick={() => { void responsibilities.refetch(); }}>Load</Button>
        </Box>
        {!canReadResponsibilities ? <Alert severity="warning" sx={{ mt: 1 }}>Responsibility reads are unavailable or not authorized.</Alert> : null}
        {canReadResponsibilities && responsibilities.isError ? <Alert severity="error" sx={{ mt: 1 }}>Unable to load current responsibilities.</Alert> : null}
        {canReadResponsibilities && responsibilities.isFetching ? <Typography role="status">Loading responsibilities…</Typography> : null}
        {canReadResponsibilities && responsibilities.isSuccess && !responsibilities.isFetching ? responsibilities.data.map((item) => (
          <Alert key={item.id} severity="info" sx={{ mt: 1 }}>
            {item.responsibilityType} · {item.scope?.name ?? item.scopeId} · {item.status}
          </Alert>
        )) : null}
      </Paper>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr 1fr' } }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">Register operational scope</Typography>
          <TextField select fullWidth label="Scope type" size="small" sx={{ mt: 1 }} value={scope.type} onChange={(e) => setScope({ ...scope, type: e.target.value })}>
            {SCOPE_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Target ID" size="small" sx={{ mt: 1 }} value={scope.targetId} onChange={(e) => setScope({ ...scope, targetId: e.target.value })} />
          <Button sx={{ mt: 1 }} variant="contained" disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.registerOperationalScope) || registerMutation.isPending} onClick={() => registerMutation.mutate()}>Register scope</Button>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">Assign responsibility</Typography>
          <TextField select fullWidth label="Responsibility" size="small" sx={{ mt: 1 }} value={assignment.responsibilityType} onChange={(e) => setAssignment({ ...assignment, responsibilityType: e.target.value })}>
            {RESPONSIBILITY_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Assignee ID" size="small" sx={{ mt: 1 }} value={assignment.assigneeId} onChange={(e) => setAssignment({ ...assignment, assigneeId: e.target.value })} />
          <TextField fullWidth label="Scope ID" size="small" sx={{ mt: 1 }} value={assignment.scopeId} onChange={(e) => setAssignment({ ...assignment, scopeId: e.target.value })} />
          <TextField fullWidth label="Workflow instance ID" size="small" sx={{ mt: 1 }} value={assignment.workflowInstanceId} onChange={(e) => setAssignment({ ...assignment, workflowInstanceId: e.target.value })} />
          <TextField fullWidth label="Operation reference" size="small" sx={{ mt: 1 }} value={assignment.operationReference} onChange={(e) => setAssignment({ ...assignment, operationReference: e.target.value })} />
          <Button sx={{ mt: 1 }} variant="contained" disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.assignResponsibility) || assignMutation.isPending} onClick={() => assignMutation.mutate()}>Assign responsibility</Button>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">Revoke responsibility</Typography>
          <TextField fullWidth label="Assignment ID" size="small" sx={{ mt: 1 }} value={revoke.assignmentId} onChange={(e) => setRevoke({ ...revoke, assignmentId: e.target.value })} />
          <TextField fullWidth label="Workflow instance ID" size="small" sx={{ mt: 1 }} value={revoke.workflowInstanceId} onChange={(e) => setRevoke({ ...revoke, workflowInstanceId: e.target.value })} />
          <TextField fullWidth label="Operation reference" size="small" sx={{ mt: 1 }} value={revoke.operationReference} onChange={(e) => setRevoke({ ...revoke, operationReference: e.target.value })} />
          <Button sx={{ mt: 1 }} variant="outlined" disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.revokeResponsibility) || revokeMutation.isPending} onClick={() => revokeMutation.mutate()}>Revoke responsibility</Button>
        </Paper>
      </Box>
    </Box>
  );
}
