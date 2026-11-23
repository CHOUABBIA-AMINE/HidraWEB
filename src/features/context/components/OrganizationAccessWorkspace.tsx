import { Alert, Box, Button, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
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
import { OrganizationAssignmentHistory } from '@/features/context/components/OrganizationAssignmentHistory';
import { OrganizationHierarchyPanel } from '@/features/context/components/OrganizationHierarchyPanel';
import { usePermissions } from '@/features/permissions/usePermissions';
import { useShellUiStore } from '@/shell/model/useShellUiStore';

type Resource = 'organization-units' | 'employees' | 'employee-assignments';
type Selection = { resource: Resource; id: string; query: string; page: number; companyPartyId: string };
const PAGE_SIZE = 50;

function field(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : '—';
}

/** A selected record is only admissible while still present on the currently authorized owner page. */
export function OrganizationAccessWorkspace({ resource }: { resource: Resource }) {
  const permissions = usePermissions();
  // The verified company selection separates client cache identity; HidraAPI remains authoritative.
  const companyPartyId = useShellUiStore((state) => state.operationalContext?.companyPartyId ?? '');
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const permission = resource === 'organization-units'
    ? IDENTITY_ORGANIZATION_PERMISSIONS.unitsRead
    : resource === 'employees'
      ? IDENTITY_ORGANIZATION_PERMISSIONS.employeesRead
      : IDENTITY_ORGANIZATION_PERMISSIONS.assignmentsRead;
  const admitted = permissions.status === 'ready' && permissions.can(permission);

  const list = useQuery({
    queryKey: ['hidra', 'organization-admin', 'ui-list', companyPartyId, resource, query, page],
    queryFn: () => resource === 'organization-units'
      ? fetchOrganizationUnits(query, page, PAGE_SIZE)
      : resource === 'employees'
        ? fetchOrganizationEmployees(query, page, PAGE_SIZE)
        : fetchOrganizationAssignments('', '', '', page, PAGE_SIZE),
    enabled: admitted,
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
  const rows = admitted && list.isSuccess && !list.isFetching && !list.isError
    ? (list.data.content ?? []) : [];
  const selectedId = selection?.resource === resource && selection.page === page && selection.query === query
    && selection.companyPartyId === companyPartyId
    && rows.some((row) => row.id === selection.id) ? selection.id : '';
  const detail = useQuery({
    queryKey: ['hidra', 'organization-admin', 'ui-detail', companyPartyId, resource, selectedId],
    queryFn: () => resource === 'organization-units'
      ? fetchOrganizationUnit(selectedId)
      : fetchOrganizationEmployee(selectedId),
    enabled: admitted && Boolean(selectedId) && resource !== 'employee-assignments',
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  if (!admitted) {
    return <Alert severity="warning">Organization administration access is unavailable or not authorized for this resource.</Alert>;
  }

  const commitSearch = () => { setSelection(null); setPage(0); setQuery(input.trim()); };
  const changePage = (next: number) => { setSelection(null); setPage(next); };
  const pageReady = list.isSuccess && !list.isFetching && !list.isError;
  const total = pageReady ? list.data.totalElements : undefined;
  const selectedDetail = detail.isSuccess && !detail.isFetching && detail.data?.id === selectedId
    ? detail.data : undefined;

  return (
    <Stack spacing={2}>
      {resource === 'organization-units' ? <OrganizationHierarchyPanel /> : null}
      {resource !== 'employee-assignments' ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth label="Search" size="small" value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') commitSearch(); }} />
            <Button variant="outlined" onClick={commitSearch}>Search</Button>
          </Box>
        </Paper>
      ) : null}
      {list.isFetching || (!list.isSuccess && !list.isError) ? <Typography role="status">Loading organization records…</Typography> : null}
      {list.isError ? <Alert severity="error">Unable to load authorized organization records.</Alert> : null}
      {pageReady && rows.length === 0 ? <Alert severity="info">No records.</Alert> : null}
      {pageReady && rows.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Table size="small" aria-label="Organization records">
            <TableHead><TableRow>
              <TableCell>ID</TableCell><TableCell>Code / Employee</TableCell><TableCell>Name / Unit</TableCell>
              <TableCell>Status</TableCell><TableCell>Valid from</TableCell><TableCell>Valid to</TableCell>
              <TableCell align="right">Detail</TableCell>
            </TableRow></TableHead>
            <TableBody>{rows.map((row) => {
              const attributes = row as Record<string, unknown>;
              const id = field(attributes, 'id');
              return id === '—' ? null : (
                <TableRow key={id}>
                  <TableCell>{id}</TableCell>
                  <TableCell>{field(attributes, 'code') !== '—' ? field(attributes, 'code') : field(attributes, 'employeeNumber') !== '—'
                    ? field(attributes, 'employeeNumber') : field(attributes, 'employeeId')}</TableCell>
                  <TableCell>{field(attributes, 'nameFr') !== '—' ? field(attributes, 'nameFr') : field(attributes, 'displayNameLt') !== '—'
                    ? field(attributes, 'displayNameLt') : field(attributes, 'organizationUnitId')}</TableCell>
                  <TableCell>{field(attributes, 'status')}</TableCell>
                  <TableCell>{field(attributes, 'validFrom')}</TableCell>
                  <TableCell>{field(attributes, 'validTo')}</TableCell>
                  <TableCell align="right"><Button size="small" onClick={() => setSelection({ resource, id, query, page, companyPartyId })}>Inspect</Button></TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="caption">
              Page {page + 1} · {rows.length} loaded / {total ?? '—'} returned by HidraAPI
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" disabled={page === 0} onClick={() => changePage(page - 1)}>Previous</Button>
              <Button size="small" disabled={!list.data.hasNext} onClick={() => changePage(page + 1)}>Next</Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}
      {selectedId && resource !== 'employee-assignments' ? (
        detail.isError ? <Alert severity="error">Unable to read authorized record detail.</Alert>
          : detail.isFetching || !detail.isSuccess ? <Typography role="status">Loading record detail…</Typography>
          : selectedDetail ? <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography component="h3" variant="subtitle1">Record detail</Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {Object.entries(selectedDetail).filter(([, v]) => v !== undefined && v !== null)
                .map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', gap: 1 }}>
                    <Typography component="dt" color="text.secondary" variant="body2">{key}:</Typography>
                    <Typography component="dd" sx={{ m: 0 }} variant="body2">{String(value)}</Typography>
                  </Box>
                ))}
            </Box>
          </Paper> : null
      ) : null}
      {selectedId && resource === 'employee-assignments' ? <OrganizationAssignmentHistory assignmentId={selectedId} /> : null}
    </Stack>
  );
}
