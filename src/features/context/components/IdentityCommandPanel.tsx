import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { CreateUserRequest, EvaluatePermissionRequest } from '@/api/generated/identity-organization/model';
import {
  createIdentityUser,
  evaluateIdentityPermission,
} from '@/features/context/api/identityOrganizationApi';
import { IDENTITY_ORGANIZATION_PERMISSIONS } from '@/features/context/api/identityOrganizationPermissions';
import { usePermissions } from '@/features/permissions/usePermissions';

const USER_TYPES = ['HUMAN', 'SERVICE', 'SYSTEM', 'INTEGRATION', 'BREAK_GLASS'] as const;
const SCOPE_TYPES = ['GLOBAL', 'ORGANIZATION_UNIT', 'PIPELINE_SYSTEM', 'PIPELINE', 'FACILITY', 'EQUIPMENT', 'CUSTOM'] as const;

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

export function IdentityCommandPanel() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [user, setUser] = useState({ username: '', emailAddress: '', displayName: '', userType: 'HUMAN', employeeReferenceId: '' });
  const [evaluation, setEvaluation] = useState({
    userId: '', permissionCode: '', resourceType: '', resourceReferenceId: '',
    scopeType: 'GLOBAL', scopeReferenceId: '', scopeCodeSnapshot: '',
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const request: CreateUserRequest = {
        username: optional(user.username),
        emailAddress: optional(user.emailAddress),
        displayName: optional(user.displayName),
        userType: user.userType as CreateUserRequest['userType'],
        employeeReferenceId: optional(user.employeeReferenceId),
      };
      return createIdentityUser(request);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', 'identity'] });
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: () => {
      const globalScope = evaluation.scopeType === 'GLOBAL';
      const request: EvaluatePermissionRequest = {
        userId: optional(evaluation.userId),
        permissionCode: optional(evaluation.permissionCode),
        resourceType: optional(evaluation.resourceType),
        resourceReferenceId: optional(evaluation.resourceReferenceId),
        scope: {
          scopeType: evaluation.scopeType as NonNullable<EvaluatePermissionRequest['scope']>['scopeType'],
          scopeReferenceId: globalScope ? undefined : optional(evaluation.scopeReferenceId),
          scopeCodeSnapshot: globalScope ? undefined : optional(evaluation.scopeCodeSnapshot),
        },
      };
      return evaluateIdentityPermission(request);
    },
  });

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography component="h2" variant="h6">{t('context.identity.createUser')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">{t('context.identity.credentialsNotice')}</Typography>
        {!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.createUser) ? (
          <Alert severity="warning" sx={{ mb: 2 }}>{t('context.commandUnavailable')}</Alert>
        ) : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField label={t('context.fields.username')} onChange={(event) => setUser({ ...user, username: event.target.value })} size="small" value={user.username} />
          <TextField label={t('context.fields.emailAddress')} onChange={(event) => setUser({ ...user, emailAddress: event.target.value })} size="small" value={user.emailAddress} />
          <TextField label={t('context.fields.displayName')} onChange={(event) => setUser({ ...user, displayName: event.target.value })} size="small" value={user.displayName} />
          <TextField label={t('context.fields.userType')} onChange={(event) => setUser({ ...user, userType: event.target.value })} select size="small" value={user.userType}>
            {USER_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField label={t('context.fields.employeeReferenceId')} onChange={(event) => setUser({ ...user, employeeReferenceId: event.target.value })} size="small" value={user.employeeReferenceId} />
        </Box>
        <Button
          disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.createUser) || createMutation.isPending}
          onClick={() => createMutation.mutate()}
          sx={{ mt: 2 }}
          variant="contained"
        >
          {t('context.identity.createUser')}
        </Button>
        {createMutation.error ? <Alert severity="error" sx={{ mt: 2 }}>{String(createMutation.error)}</Alert> : null}
        {createMutation.data ? (
          <Alert severity="success" sx={{ mt: 2 }}>{t('context.identity.userCreated', { id: createMutation.data.id ?? '—' })}</Alert>
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography component="h2" variant="h6">{t('context.identity.evaluatePermission')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">{t('context.identity.evaluationNotice')}</Typography>
        {!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.evaluatePermission) ? (
          <Alert severity="warning" sx={{ mb: 2 }}>{t('context.commandUnavailable')}</Alert>
        ) : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <TextField label={t('context.fields.userId')} onChange={(event) => setEvaluation({ ...evaluation, userId: event.target.value })} size="small" value={evaluation.userId} />
          <TextField label={t('context.fields.permissionCode')} onChange={(event) => setEvaluation({ ...evaluation, permissionCode: event.target.value })} size="small" value={evaluation.permissionCode} />
          <TextField label={t('context.fields.resourceType')} onChange={(event) => setEvaluation({ ...evaluation, resourceType: event.target.value })} size="small" value={evaluation.resourceType} />
          <TextField label={t('context.fields.resourceReferenceId')} onChange={(event) => setEvaluation({ ...evaluation, resourceReferenceId: event.target.value })} size="small" value={evaluation.resourceReferenceId} />
          <TextField label={t('context.fields.scopeType')} onChange={(event) => setEvaluation({ ...evaluation, scopeType: event.target.value })} select size="small" value={evaluation.scopeType}>
            {SCOPE_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          {evaluation.scopeType !== 'GLOBAL' ? (
            <>
              <TextField label={t('context.fields.scopeReferenceId')} onChange={(event) => setEvaluation({ ...evaluation, scopeReferenceId: event.target.value })} size="small" value={evaluation.scopeReferenceId} />
              <TextField label={t('context.fields.scopeCodeSnapshot')} onChange={(event) => setEvaluation({ ...evaluation, scopeCodeSnapshot: event.target.value })} size="small" value={evaluation.scopeCodeSnapshot} />
            </>
          ) : null}
        </Box>
        <Button
          disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.evaluatePermission) || evaluateMutation.isPending}
          onClick={() => evaluateMutation.mutate()}
          sx={{ mt: 2 }}
          variant="outlined"
        >
          {t('context.identity.evaluatePermission')}
        </Button>
        {evaluateMutation.error ? <Alert severity="error" sx={{ mt: 2 }}>{String(evaluateMutation.error)}</Alert> : null}
        {evaluateMutation.data ? (
          <Alert severity={evaluateMutation.data.permitted ? 'success' : 'warning'} sx={{ mt: 2 }}>
            {t('context.identity.permissionDecision', {
              decision: evaluateMutation.data.decision ?? (evaluateMutation.data.permitted ? 'PERMIT' : 'DENY'),
              reason: evaluateMutation.data.reasonMessage ?? evaluateMutation.data.reasonCode ?? '—',
            })}
          </Alert>
        ) : null}
      </Paper>
    </Box>
  );
}
