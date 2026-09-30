import { Alert, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchOrganizationAssignments,
  fetchOrganizationEmployee,
  fetchOrganizationEmployees,
  fetchOrganizationUnit,
  fetchOrganizationUnits,
} from '@/features/context/api/identityOrganizationApi';
import { IDENTITY_ORGANIZATION_PERMISSIONS } from '@/features/context/api/identityOrganizationPermissions';
import { usePermissions } from '@/features/permissions/usePermissions';

type Resource = 'organization-units' | 'employees' | 'employee-assignments';

export function OrganizationAccessWorkspace({ resource }: { resource: Resource }) {
  const permissions = usePermissions();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const permission =
    resource === 'organization-units'
      ? IDENTITY_ORGANIZATION_PERMISSIONS.unitsRead
      : resource === 'employees'
        ? IDENTITY_ORGANIZATION_PERMISSIONS.employeesRead
        : IDENTITY_ORGANIZATION_PERMISSIONS.assignmentsRead;

  const list = useQuery({
    queryKey: ['hidra', 'organization-admin', resource, query],
    queryFn: async () => {
      if (resource === 'organization-units') return fetchOrganizationUnits(query, 0, 50);
      if (resource === 'employees') return fetchOrganizationEmployees(query, 0, 50);
      return fetchOrganizationAssignments(query, '', '', 0, 50);
    },
    enabled: permissions.can(permission),
  });

  const detail = useQuery({
    queryKey: ['hidra', 'organization-admin', resource, 'detail', selectedId],
    queryFn: async () => {
      if (!selectedId) throw new Error('Missing selected organization record.');
      if (resource === 'organization-units') return fetchOrganizationUnit(selectedId);
      if (resource === 'employees') return fetchOrganizationEmployee(selectedId);
      return null;
    },
    enabled: Boolean(selectedId) && resource !== 'employee-assignments' && permissions.can(permission),
  });

  if (!permissions.can(permission)) {
    return <Alert severity="warning">Organization administration access is not published for this resource.</Alert>;
  }

  const rows = list.data?.content ?? [];

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {resource !== 'employee-assignments' ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth label="Search" size="small" value={input} onChange={(event) => setInput(event.target.value)} />
            <Button variant="outlined" onClick={() => setQuery(input.trim())}>Search</Button>
          </Box>
        </Paper>
      ) : null}

      {list.isLoading ? <Typography>Loading…</Typography> : null}
      {list.error ? <Alert severity="error">{String(list.error)}</Alert> : null}
      {list.data && rows.length === 0 ? <Alert severity="info">No records.</Alert> : null}

      {rows.length > 0 ? (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Code / Employee</TableCell>
                <TableCell>Name / Unit</TableCell>
                <TableCell>Status</TableCell>
                {resource !== 'employee-assignments' ? <TableCell align="right">Detail</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const record = row as Record<string, unknown>;
                const id = String(record.id ?? '');
                return (
                  <TableRow key={id}>
                    <TableCell>{id}</TableCell>
                    <TableCell>{String(record.code ?? record.employeeNumber ?? record.employeeId ?? '—')}</TableCell>
                    <TableCell>{String(record.nameFr ?? record.displayNameLt ?? record.organizationUnitId ?? '—')}</TableCell>
                    <TableCell>{String(record.status ?? '—')}</TableCell>
                    {resource !== 'employee-assignments' ? (
                      <TableCell align="right"><Button size="small" onClick={() => setSelectedId(id)}>Inspect</Button></TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      ) : null}

      {detail.data ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography component="h3" variant="subtitle1">Record detail</Typography>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(detail.data, null, 2)}</pre>
        </Paper>
      ) : null}
    </Box>
  );
}
