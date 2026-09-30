import { Alert, Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchIdentityPermissions,
  fetchIdentityRoles,
  fetchIdentityUser,
  fetchIdentityUsers,
} from '@/features/context/api/identityOrganizationApi';
import { IDENTITY_ORGANIZATION_PERMISSIONS } from '@/features/context/api/identityOrganizationPermissions';
import { usePermissions } from '@/features/permissions/usePermissions';

type Resource = 'users' | 'roles' | 'permissions';

export function IdentityAccessWorkspace({ resource }: { resource: Resource }) {
  const permissions = usePermissions();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const permission =
    resource === 'users'
      ? IDENTITY_ORGANIZATION_PERMISSIONS.usersRead
      : resource === 'roles'
        ? IDENTITY_ORGANIZATION_PERMISSIONS.rolesRead
        : IDENTITY_ORGANIZATION_PERMISSIONS.permissionsRead;

  const list = useQuery({
    queryKey: ['hidra', 'identity-admin', resource, query],
    queryFn: async () => {
      if (resource === 'users') return fetchIdentityUsers(query, 0, 50);
      if (resource === 'roles') return fetchIdentityRoles(query, 0, 50);
      return fetchIdentityPermissions(query, 0, 50);
    },
    enabled: permissions.can(permission),
  });

  const detail = useQuery({
    queryKey: ['hidra', 'identity-admin', 'user', selectedUserId],
    queryFn: () => fetchIdentityUser(selectedUserId as string),
    enabled: resource === 'users' && Boolean(selectedUserId) && permissions.can(IDENTITY_ORGANIZATION_PERMISSIONS.usersRead),
  });

  if (!permissions.can(permission)) {
    return <Alert severity="warning">Identity administration access is not published for this resource.</Alert>;
  }

  const rows = list.data?.content ?? [];

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField fullWidth label="Search" size="small" value={input} onChange={(e) => setInput(e.target.value)} />
          <Button variant="outlined" onClick={() => setQuery(input.trim())}>Search</Button>
        </Box>
      </Paper>

      {list.isLoading ? <Typography>Loading…</Typography> : null}
      {list.error ? <Alert severity="error">{String(list.error)}</Alert> : null}
      {list.data && rows.length === 0 ? <Alert severity="info">No records.</Alert> : null}

      {rows.length > 0 ? (
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Code / Username</TableCell>
                <TableCell>Name / Display name</TableCell>
                <TableCell>Status</TableCell>
                {resource === 'users' ? <TableCell align="right">Detail</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const r = row as Record<string, unknown>;
                const id = String(r.id ?? '');
                return (
                  <TableRow key={id}>
                    <TableCell>{id}</TableCell>
                    <TableCell>{String(r.code ?? r.username ?? '—')}</TableCell>
                    <TableCell>{String(r.nameFr ?? r.nameEn ?? r.displayName ?? '—')}</TableCell>
                    <TableCell>{String(r.status ?? '—')}</TableCell>
                    {resource === 'users' ? (
                      <TableCell align="right">
                        <Button size="small" onClick={() => setSelectedUserId(id)}>Inspect</Button>
                      </TableCell>
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
          <Typography component="h3" variant="subtitle1">User detail</Typography>
          <Typography variant="body2">ID: {detail.data.id ?? '—'}</Typography>
          <Typography variant="body2">Username: {detail.data.username ?? '—'}</Typography>
          <Typography variant="body2">Display name: {detail.data.displayName ?? '—'}</Typography>
          <Typography variant="body2">Employee reference: {detail.data.employeeReferenceId ?? '—'}</Typography>
          <Typography variant="body2">Status: {detail.data.status ?? '—'}</Typography>
        </Paper>
      ) : null}
    </Box>
  );
}
