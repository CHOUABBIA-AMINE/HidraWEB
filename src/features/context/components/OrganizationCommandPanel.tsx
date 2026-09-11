import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  AssignEmployeeRequest,
  CreateOrganizationUnitRequest,
  RegisterEmployeeRequest,
} from '@/api/generated/identity-organization/model';
import {
  assignEmployee,
  createOrganizationUnit,
  registerEmployee,
} from '@/features/context/api/identityOrganizationApi';
import { IDENTITY_ORGANIZATION_PERMISSIONS } from '@/features/context/api/identityOrganizationPermissions';
import { usePermissions } from '@/features/permissions/usePermissions';

const UNIT_STATUSES = ['ACTIVE', 'INACTIVE', 'MERGED', 'CLOSED'] as const;
const EMPLOYEE_TYPES = ['PERMANENT', 'TEMPORARY', 'CONTRACTUAL', 'INTERN', 'CONSULTANT'] as const;
const ASSIGNMENT_TYPES = ['PRIMARY', 'SECONDARY', 'TEMPORARY', 'ACTING'] as const;

function optional(value: string): string | undefined {
  const normalized = value.trim();
  return normalized ? normalized : undefined;
}

function optionalInstant(value: string): string | undefined {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

export function OrganizationCommandPanel() {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [unit, setUnit] = useState({ code: '', nameAr: '', nameFr: '', nameEn: '', unitTypeId: '', parentUnitId: '', status: 'ACTIVE', validFrom: '' });
  const [employee, setEmployee] = useState({
    employeeNumber: '', firstNameAr: '', lastNameAr: '', firstNameLt: '', lastNameLt: '', displayNameAr: '', displayNameLt: '',
    emailAddress: '', mobileNumber: '', employeeType: 'PERMANENT', identityUserReference: '',
  });
  const [assignment, setAssignment] = useState({
    employeeId: '', organizationUnitId: '', positionId: '', assignmentType: 'PRIMARY', operationalScopeType: '', operationalScopeId: '',
    operationalScopeCode: '', operationalScopeName: '', validFrom: '', validTo: '',
  });

  const createUnitMutation = useMutation({
    mutationFn: () => {
      const request: CreateOrganizationUnitRequest = {
        code: optional(unit.code),
        nameAr: optional(unit.nameAr),
        nameFr: optional(unit.nameFr),
        nameEn: optional(unit.nameEn),
        unitTypeId: optional(unit.unitTypeId),
        parentUnitId: optional(unit.parentUnitId),
        status: unit.status as CreateOrganizationUnitRequest['status'],
        validFrom: optionalInstant(unit.validFrom),
      };
      return createOrganizationUnit(request);
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', 'organization'] }); },
  });

  const registerEmployeeMutation = useMutation({
    mutationFn: () => {
      const request: RegisterEmployeeRequest = {
        employeeNumber: optional(employee.employeeNumber),
        firstNameAr: optional(employee.firstNameAr),
        lastNameAr: optional(employee.lastNameAr),
        firstNameLt: optional(employee.firstNameLt),
        lastNameLt: optional(employee.lastNameLt),
        displayNameAr: optional(employee.displayNameAr),
        displayNameLt: optional(employee.displayNameLt),
        emailAddress: optional(employee.emailAddress),
        mobileNumber: optional(employee.mobileNumber),
        employeeType: employee.employeeType as RegisterEmployeeRequest['employeeType'],
        identityUserReference: optional(employee.identityUserReference),
      };
      return registerEmployee(request);
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', 'organization'] }); },
  });

  const assignEmployeeMutation = useMutation({
    mutationFn: () => {
      const request: AssignEmployeeRequest = {
        employeeId: optional(assignment.employeeId),
        organizationUnitId: optional(assignment.organizationUnitId),
        positionId: optional(assignment.positionId),
        assignmentType: assignment.assignmentType as AssignEmployeeRequest['assignmentType'],
        operationalScopeType: optional(assignment.operationalScopeType),
        operationalScopeId: optional(assignment.operationalScopeId),
        operationalScopeCode: optional(assignment.operationalScopeCode),
        operationalScopeName: optional(assignment.operationalScopeName),
        validFrom: optionalInstant(assignment.validFrom),
        validTo: optionalInstant(assignment.validTo),
      };
      return assignEmployee(request);
    },
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['hidra', 'workbench', 'organization'] }); },
  });

  const employeeCommandAvailable = permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.manageEmployees);

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography component="h2" variant="h6">{t('context.organization.createUnit')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }} variant="body2">{t('context.organization.hierarchyNotice')}</Typography>
        {!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.createOrganizationUnit) ? <Alert severity="warning" sx={{ mb: 2 }}>{t('context.commandUnavailable')}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
          <TextField label={t('context.fields.code')} onChange={(event) => setUnit({ ...unit, code: event.target.value })} size="small" value={unit.code} />
          <TextField label={t('context.fields.nameFr')} onChange={(event) => setUnit({ ...unit, nameFr: event.target.value })} size="small" value={unit.nameFr} />
          <TextField label={t('context.fields.nameEn')} onChange={(event) => setUnit({ ...unit, nameEn: event.target.value })} size="small" value={unit.nameEn} />
          <TextField label={t('context.fields.nameAr')} onChange={(event) => setUnit({ ...unit, nameAr: event.target.value })} size="small" value={unit.nameAr} />
          <TextField label={t('context.fields.unitTypeId')} onChange={(event) => setUnit({ ...unit, unitTypeId: event.target.value })} size="small" value={unit.unitTypeId} />
          <TextField label={t('context.fields.parentUnitId')} onChange={(event) => setUnit({ ...unit, parentUnitId: event.target.value })} size="small" value={unit.parentUnitId} />
          <TextField label={t('context.fields.status')} onChange={(event) => setUnit({ ...unit, status: event.target.value })} select size="small" value={unit.status}>
            {UNIT_STATUSES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField slotProps={{ inputLabel: { shrink: true } }} label={t('context.fields.validFrom')} onChange={(event) => setUnit({ ...unit, validFrom: event.target.value })} size="small" type="datetime-local" value={unit.validFrom} />
        </Box>
        <Button disabled={!permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.createOrganizationUnit) || createUnitMutation.isPending} onClick={() => createUnitMutation.mutate()} sx={{ mt: 2 }} variant="contained">{t('context.organization.createUnit')}</Button>
        {createUnitMutation.error ? <Alert severity="error" sx={{ mt: 2 }}>{String(createUnitMutation.error)}</Alert> : null}
        {createUnitMutation.data ? <Alert severity="success" sx={{ mt: 2 }}>{t('context.organization.unitCreated', { id: createUnitMutation.data.id ?? '—' })}</Alert> : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography component="h2" variant="h6">{t('context.organization.registerEmployee')}</Typography>
        {!employeeCommandAvailable ? <Alert severity="warning" sx={{ mb: 2 }}>{t('context.commandUnavailable')}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
          <TextField label={t('context.fields.employeeNumber')} onChange={(event) => setEmployee({ ...employee, employeeNumber: event.target.value })} size="small" value={employee.employeeNumber} />
          <TextField label={t('context.fields.firstNameLt')} onChange={(event) => setEmployee({ ...employee, firstNameLt: event.target.value })} size="small" value={employee.firstNameLt} />
          <TextField label={t('context.fields.lastNameLt')} onChange={(event) => setEmployee({ ...employee, lastNameLt: event.target.value })} size="small" value={employee.lastNameLt} />
          <TextField label={t('context.fields.displayNameLt')} onChange={(event) => setEmployee({ ...employee, displayNameLt: event.target.value })} size="small" value={employee.displayNameLt} />
          <TextField label={t('context.fields.firstNameAr')} onChange={(event) => setEmployee({ ...employee, firstNameAr: event.target.value })} size="small" value={employee.firstNameAr} />
          <TextField label={t('context.fields.lastNameAr')} onChange={(event) => setEmployee({ ...employee, lastNameAr: event.target.value })} size="small" value={employee.lastNameAr} />
          <TextField label={t('context.fields.displayNameAr')} onChange={(event) => setEmployee({ ...employee, displayNameAr: event.target.value })} size="small" value={employee.displayNameAr} />
          <TextField label={t('context.fields.emailAddress')} onChange={(event) => setEmployee({ ...employee, emailAddress: event.target.value })} size="small" value={employee.emailAddress} />
          <TextField label={t('context.fields.mobileNumber')} onChange={(event) => setEmployee({ ...employee, mobileNumber: event.target.value })} size="small" value={employee.mobileNumber} />
          <TextField label={t('context.fields.employeeType')} onChange={(event) => setEmployee({ ...employee, employeeType: event.target.value })} select size="small" value={employee.employeeType}>
            {EMPLOYEE_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField label={t('context.fields.identityUserReference')} onChange={(event) => setEmployee({ ...employee, identityUserReference: event.target.value })} size="small" value={employee.identityUserReference} />
        </Box>
        <Button disabled={!employeeCommandAvailable || registerEmployeeMutation.isPending} onClick={() => registerEmployeeMutation.mutate()} sx={{ mt: 2 }} variant="contained">{t('context.organization.registerEmployee')}</Button>
        {registerEmployeeMutation.error ? <Alert severity="error" sx={{ mt: 2 }}>{String(registerEmployeeMutation.error)}</Alert> : null}
        {registerEmployeeMutation.data ? <Alert severity="success" sx={{ mt: 2 }}>{t('context.organization.employeeRegistered', { id: registerEmployeeMutation.data.id ?? '—' })}</Alert> : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography component="h2" variant="h6">{t('context.organization.assignEmployee')}</Typography>
        {!employeeCommandAvailable ? <Alert severity="warning" sx={{ mb: 2 }}>{t('context.commandUnavailable')}</Alert> : null}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' } }}>
          <TextField label={t('context.fields.employeeId')} onChange={(event) => setAssignment({ ...assignment, employeeId: event.target.value })} size="small" value={assignment.employeeId} />
          <TextField label={t('context.fields.organizationUnitId')} onChange={(event) => setAssignment({ ...assignment, organizationUnitId: event.target.value })} size="small" value={assignment.organizationUnitId} />
          <TextField label={t('context.fields.positionId')} onChange={(event) => setAssignment({ ...assignment, positionId: event.target.value })} size="small" value={assignment.positionId} />
          <TextField label={t('context.fields.assignmentType')} onChange={(event) => setAssignment({ ...assignment, assignmentType: event.target.value })} select size="small" value={assignment.assignmentType}>
            {ASSIGNMENT_TYPES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField label={t('context.fields.operationalScopeType')} onChange={(event) => setAssignment({ ...assignment, operationalScopeType: event.target.value })} size="small" value={assignment.operationalScopeType} />
          <TextField label={t('context.fields.operationalScopeId')} onChange={(event) => setAssignment({ ...assignment, operationalScopeId: event.target.value })} size="small" value={assignment.operationalScopeId} />
          <TextField label={t('context.fields.operationalScopeCode')} onChange={(event) => setAssignment({ ...assignment, operationalScopeCode: event.target.value })} size="small" value={assignment.operationalScopeCode} />
          <TextField label={t('context.fields.operationalScopeName')} onChange={(event) => setAssignment({ ...assignment, operationalScopeName: event.target.value })} size="small" value={assignment.operationalScopeName} />
          <TextField slotProps={{ inputLabel: { shrink: true } }} label={t('context.fields.validFrom')} onChange={(event) => setAssignment({ ...assignment, validFrom: event.target.value })} size="small" type="datetime-local" value={assignment.validFrom} />
          <TextField slotProps={{ inputLabel: { shrink: true } }} label={t('context.fields.validTo')} onChange={(event) => setAssignment({ ...assignment, validTo: event.target.value })} size="small" type="datetime-local" value={assignment.validTo} />
        </Box>
        <Button disabled={!employeeCommandAvailable || assignEmployeeMutation.isPending} onClick={() => assignEmployeeMutation.mutate()} sx={{ mt: 2 }} variant="outlined">{t('context.organization.assignEmployee')}</Button>
        {assignEmployeeMutation.error ? <Alert severity="error" sx={{ mt: 2 }}>{String(assignEmployeeMutation.error)}</Alert> : null}
        {assignEmployeeMutation.data ? <Alert severity="success" sx={{ mt: 2 }}>{t('context.organization.employeeAssigned', { id: assignEmployeeMutation.data })}</Alert> : null}
      </Paper>
    </Box>
  );
}
