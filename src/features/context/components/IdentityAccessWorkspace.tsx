import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
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
import { useShellUiStore } from '@/shell/model/useShellUiStore';

type Resource = 'users' | 'roles' | 'permissions';
type Selection = { resource: Resource; id: string; query: string; page: number; contextKey: string };
const PAGE_SIZE = 50;

function textField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : '—';
}

/**
 * Read-only, server-paged identity register. A selected user is visible only
 * while present in a fresh, authorized owner page at the same query coordinates.
 * An employee reference is a neutral identifier, never an inferred identity.
 */
export function IdentityAccessWorkspace({ resource }: { resource: Resource }) {
  const permissions = usePermissions();
  const contextKey = useShellUiStore((state) => state.operationalContext?.companyPartyId ?? '');
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const permission = resource === 'users'
    ? IDENTITY_ORGANIZATION_PERMISSIONS.usersRead
    : resource === 'roles'
      ? IDENTITY_ORGANIZATION_PERMISSIONS.rolesRead
      : IDENTITY_ORGANIZATION_PERMISSIONS.permissionsRead;
  const admitted = permissions.status === 'ready' && permissions.can(permission);

  const list = useQuery({
    queryKey: ['hidra', 'identity-admin', 'uxr21', 'list', contextKey, resource, query, page],
    queryFn: () => resource === 'users'
      ? fetchIdentityUsers(query, page, PAGE_SIZE)
      : resource === 'roles'
        ? fetchIdentityRoles(query, page, PAGE_SIZE)
        : fetchIdentityPermissions(query, page, PAGE_SIZE),
    enabled: admitted,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
  const pageReady = admitted && list.isSuccess && !list.isFetching && !list.isError;
  const rows = pageReady ? (list.data.content ?? []) : [];
  const selectedUserId = selection?.resource === 'users' && resource === 'users'
    && selection.query === query && selection.page === page && selection.contextKey === contextKey
    && rows.some((row) => row.id === selection.id)
    ? selection.id : '';
  const detail = useQuery({
    queryKey: ['hidra', 'identity-admin', 'uxr21', 'user', contextKey, selectedUserId],
    queryFn: () => fetchIdentityUser(selectedUserId),
    enabled: admitted && Boolean(selectedUserId) && resource === 'users',
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
  const selectedDetail = detail.isSuccess && !detail.isFetching && !detail.isError
    && detail.data?.id === selectedUserId ? detail.data : undefined;

  if (!admitted) {
    return <Alert severity="warning">Identity administration access is unavailable or not authorized for this resource.</Alert>;
  }

  const commitSearch = () => { setSelection(null); setPage(0); setQuery(input.trim()); };
  const changePage = (next: number) => { setSelection(null); setPage(next); };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField fullWidth label="Search" size="small" value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') commitSearch(); }} />
          <Button variant="outlined" onClick={commitSearch}>Search</Button>
        </Box>
      </Paper>
      {list.isError ? <Alert severity="error">Unable to load authorized identity records.</Alert> : null}
      {list.isFetching || (!list.isSuccess && !list.isError) ? <Typography role="status">Loading identity records…</Typography> : null}
      {pageReady && rows.length === 0 ? <Alert severity="info">No records.</Alert> : null}
      {pageReady && rows.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Table aria-label="Identity records" size="small">
            <TableHead><TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Code / Username</TableCell>
              <TableCell>Name / Display name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Detail</TableCell>
            </TableRow></TableHead>
            <TableBody>{rows.map((row) => {
              const attributes = row as unknown as Record<string, unknown>;
              const id = textField(attributes, 'id');
              if (id === '—') return null;
              const first = textField(attributes, 'code');
              const label = textField(attributes, 'nameFr');
              return (
                <TableRow key={id}>
                  <TableCell>{id}</TableCell>
                  <TableCell>{first !== '—' ? first : textField(attributes, 'username')}</TableCell>
                  <TableCell>{label !== '—' ? label : textField(attributes, 'displayName')}</TableCell>
                  <TableCell>{textField(attributes, 'status')}</TableCell>
                  <TableCell align="right">
                    {resource === 'users' ? (
                      <Button size="small" onClick={() => setSelection({ resource, id, query, page, contextKey })}>
                        Inspect
                      </Button>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="caption">
              Page {page + 1} · {rows.length} loaded / {list.data.totalElements ?? '—'} returned by HidraAPI
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" disabled={page === 0} onClick={() => changePage(page - 1)}>Previous</Button>
              <Button size="small" disabled={!list.data.hasNext} onClick={() => changePage(page + 1)}>Next</Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}
      {selectedUserId ? (
        detail.isError ? <Alert severity="error">Unable to load authorized user detail.</Alert>
          : detail.isFetching || !detail.isSuccess ? <Typography role="status">Loading user detail…</Typography>
          : selectedDetail ? <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography component="h3" variant="subtitle1">User detail</Typography>
            <Typography variant="body2">ID: {selectedDetail.id ?? '—'}</Typography>
            <Typography variant="body2">Username: {selectedDetail.username ?? '—'}</Typography>
            <Typography variant="body2">Display name: {selectedDetail.displayName ?? '—'}</Typography>
            <Typography variant="body2">Employee reference (not login identity): {selectedDetail.employeeReferenceId ?? '—'}</Typography>
            <Typography variant="body2">Status: {selectedDetail.status ?? '—'}</Typography>
          </Paper> : null
      ) : null}
    </Stack>
  );
}
