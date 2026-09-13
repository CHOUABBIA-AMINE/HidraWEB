import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type {
  LinkDocumentToTargetRequest,
  RegisterDocumentRequest,
  UploadDocumentVersionRequest,
} from '@/api/generated/documents/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
  type WorkbenchRecord,
} from '@/features/workbench/api/workbenchApi';

import { linkDocumentToTarget, registerDocument, registerDocumentVersion } from './api/documentsApi';

const MODULE = 'documents';
const PAGE_SIZE = 50;
const LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const REGISTER_ROUTE = '/api/v1/documents/documents';
const VERSION_ROUTE = '/api/v1/documents/document-versions';
const LINK_ROUTE = '/api/v1/documents/target-links';

function permissionForRoute(routes: ReturnType<typeof usePermissions>['routes'], route: string, method: 'GET' | 'POST') {
  return routes.find((item) => item.route === route && item.methods.includes(method))?.permission;
}

function errorMessage(error: unknown, fallback: string) {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? 'HidraAPI refused this documents operation.' : normalized.message || fallback;
}

function ResourceTable({ title, items }: { title: string; items: WorkbenchRecord[] }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography component="h2" variant="h6">{title}</Typography>
      {items.length === 0 ? <Typography color="text.secondary">No evidence returned.</Typography> : (
        <TableContainer><Table size="small"><TableHead><TableRow><TableCell>ID</TableCell><TableCell>Evidence</TableCell></TableRow></TableHead><TableBody>
          {items.map((item, index) => <TableRow key={String(item.id ?? index)}><TableCell>{String(item.id ?? '—')}</TableCell><TableCell><Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(item.attributes, null, 2)}</Box></TableCell></TableRow>)}
        </TableBody></Table></TableContainer>
      )}
    </Paper>
  );
}

export function DocumentsAdministrationPage() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [documentForm, setDocumentForm] = useState<RegisterDocumentRequest>({ confidentialityLevel: 0 });
  const [versionForm, setVersionForm] = useState<UploadDocumentVersionRequest>({ versionNumber: 1, fileSizeBytes: 0 });
  const [linkForm, setLinkForm] = useState<LinkDocumentToTargetRequest>({ primaryLink: false });

  const readPermission = permissionForRoute(permissions.routes, LIST_ROUTE, 'GET');
  const registerPermission = permissionForRoute(permissions.routes, REGISTER_ROUTE, 'POST');
  const versionPermission = permissionForRoute(permissions.routes, VERSION_ROUTE, 'POST');
  const linkPermission = permissionForRoute(permissions.routes, LINK_ROUTE, 'POST');
  const canRead = Boolean(readPermission && permissions.can(readPermission));
  const canRegister = Boolean(registerPermission && permissions.can(registerPermission));
  const canVersion = Boolean(versionPermission && permissions.can(versionPermission));
  const canLink = Boolean(linkPermission && permissions.can(linkPermission));

  const resourcesQuery = useQuery({ queryKey: workbenchQueryKeys.resources(MODULE), queryFn: () => fetchWorkbenchResources(MODULE), enabled: canRead });
  const resources = resourcesQuery.data ?? [];
  const documentResource = useMemo(() => resources.find((r) => r.javaType.endsWith('DocumentJpaEntity')), [resources]);
  const versionResource = useMemo(() => resources.find((r) => r.javaType.endsWith('DocumentVersionJpaEntity')), [resources]);
  const linkResource = useMemo(() => resources.find((r) => r.javaType.endsWith('DocumentTargetLinkJpaEntity')), [resources]);

  const documentsQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, documentResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: documentResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(documentResource) });
  const versionsQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, versionResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: versionResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(versionResource) });
  const linksQuery = useQuery({ queryKey: workbenchQueryKeys.list(MODULE, linkResource?.resource ?? '', 0, PAGE_SIZE, ''), queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: linkResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }), enabled: canRead && Boolean(linkResource) });

  const invalidateEvidence = async () => queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.resources(MODULE) });
  const registerMutation = useMutation({ mutationFn: registerDocument, onSuccess: invalidateEvidence });
  const versionMutation = useMutation({ mutationFn: registerDocumentVersion, onSuccess: invalidateEvidence });
  const linkMutation = useMutation({ mutationFn: linkDocumentToTarget, onSuccess: invalidateEvidence });

  if (permissions.status !== 'ready') return <Container maxWidth="xl"><Alert severity="info">Loading document permissions…</Alert></Container>;
  if (!readPermission) return <Container maxWidth="xl"><Alert severity="warning">Document workbench route-permission metadata is unavailable. Evidence reads are denied by default.</Alert></Container>;
  if (!canRead) return <Container maxWidth="xl"><Alert severity="warning">Your current HidraAPI grants do not allow document evidence reads.</Alert></Container>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}><Stack spacing={3}>
      <Box><Typography component="h1" variant="h4">Document evidence</Typography><Typography color="text.secondary">HWEB-014-03 document metadata and version evidence backed only by published HidraAPI contracts.</Typography></Box>
      <Alert severity="info">HidraAPI publishes no multipart binary upload endpoint and no document download/stream endpoint. The published “upload document version” operation registers metadata including an existing storageObjectId; this workspace therefore has no file picker and no download button.</Alert>

      {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
      {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'Document resources could not be loaded.')}</Alert> : null}
      {!documentResource || !versionResource || !linkResource ? <Alert severity="warning">One or more document evidence resources are not published by runtime workbench discovery.</Alert> : null}
      {documentResource ? <ResourceTable title={`Documents — ${documentResource.resource}`} items={documentsQuery.data?.items ?? []} /> : null}
      {versionResource ? <ResourceTable title={`Versions — ${versionResource.resource}`} items={versionsQuery.data?.items ?? []} /> : null}
      {linkResource ? <ResourceTable title={`Target links — ${linkResource.resource}`} items={linksQuery.data?.items ?? []} /> : null}

      <Paper variant="outlined" sx={{ p: 2 }}><Stack component="form" spacing={1.5} onSubmit={(e: FormEvent) => { e.preventDefault(); if (canRegister) registerMutation.mutate(documentForm); }}>
        <Typography component="h2" variant="h6">Register document metadata</Typography>
        {!registerPermission ? <Alert severity="warning">Register-document route metadata is unavailable; action denied.</Alert> : !canRegister ? <Alert severity="warning">Your grants do not allow document registration.</Alert> : null}
        {(['code','titleAr','titleFr','titleEn','documentTypeId','documentCategoryId','classificationId','ownerModule','ownerTargetTypeCode','ownerTargetId','ownerTargetCodeSnapshot','ownerTargetLabelSnapshot','createdByActorId','createdByDisplayNameSnapshot'] as const).map((field) => <TextField key={field} label={field} value={documentForm[field] ?? ''} onChange={(e) => setDocumentForm((v) => ({ ...v, [field]: e.target.value }))} />)}
        <TextField label="confidentialityLevel" type="number" value={documentForm.confidentialityLevel ?? 0} onChange={(e) => setDocumentForm((v) => ({ ...v, confidentialityLevel: Number(e.target.value) }))} />
        <Button type="submit" variant="contained" disabled={!canRegister || registerMutation.isPending}>Register document</Button>
        {registerMutation.isError ? <Alert severity="error">{errorMessage(registerMutation.error, 'Document registration failed.')}</Alert> : null}
        {registerMutation.data ? <Alert severity="success">Document {registerMutation.data.id ?? '—'} registered with status {registerMutation.data.status ?? '—'}.</Alert> : null}
      </Stack></Paper>

      <Paper variant="outlined" sx={{ p: 2 }}><Stack component="form" spacing={1.5} onSubmit={(e: FormEvent) => { e.preventDefault(); if (canVersion) versionMutation.mutate(versionForm); }}>
        <Typography component="h2" variant="h6">Register document version metadata</Typography>
        <Typography color="text.secondary" variant="body2">This is metadata registration only; storageObjectId must already identify storage managed outside this published REST contract.</Typography>
        {!versionPermission ? <Alert severity="warning">Version route metadata is unavailable; action denied.</Alert> : !canVersion ? <Alert severity="warning">Your grants do not allow version metadata registration.</Alert> : null}
        {(['documentId','versionLabel','titleAr','titleFr','titleEn','description','storageObjectId','mimeType','originalFilename','fileExtension','checksumAlgorithm','checksumValue','languageCode','documentDate','effectiveFrom','effectiveTo','uploadedByActorId','uploadedByDisplayNameSnapshot'] as const).map((field) => <TextField key={field} label={field} value={versionForm[field] ?? ''} onChange={(e) => setVersionForm((v) => ({ ...v, [field]: e.target.value }))} />)}
        <TextField label="versionNumber" type="number" value={versionForm.versionNumber ?? 1} onChange={(e) => setVersionForm((v) => ({ ...v, versionNumber: Number(e.target.value) }))} />
        <TextField label="fileSizeBytes" type="number" value={versionForm.fileSizeBytes ?? 0} onChange={(e) => setVersionForm((v) => ({ ...v, fileSizeBytes: Number(e.target.value) }))} />
        <Button type="submit" variant="contained" disabled={!canVersion || versionMutation.isPending}>Register version metadata</Button>
        {versionMutation.isError ? <Alert severity="error">{errorMessage(versionMutation.error, 'Version metadata registration failed.')}</Alert> : null}
        {versionMutation.data ? <Alert severity="success">Version {versionMutation.data.id ?? '—'} recorded with status {versionMutation.data.versionStatus ?? '—'}.</Alert> : null}
      </Stack></Paper>

      <Paper variant="outlined" sx={{ p: 2 }}><Stack component="form" spacing={1.5} onSubmit={(e: FormEvent) => { e.preventDefault(); if (canLink) linkMutation.mutate(linkForm); }}>
        <Typography component="h2" variant="h6">Link document evidence to target</Typography>
        {!linkPermission ? <Alert severity="warning">Target-link route metadata is unavailable; action denied.</Alert> : !canLink ? <Alert severity="warning">Your grants do not allow document target linking.</Alert> : null}
        {(['documentId','documentVersionId','targetModule','targetTypeCode','targetId','targetCodeSnapshot','targetLabelSnapshot','linkRoleId','linkedByActorId'] as const).map((field) => <TextField key={field} label={field} value={linkForm[field] ?? ''} onChange={(e) => setLinkForm((v) => ({ ...v, [field]: e.target.value }))} />)}
        <FormControlLabel control={<Checkbox checked={linkForm.primaryLink ?? false} onChange={(e) => setLinkForm((v) => ({ ...v, primaryLink: e.target.checked }))} />} label="primaryLink" />
        <Button type="submit" variant="contained" disabled={!canLink || linkMutation.isPending}>Link evidence</Button>
        {linkMutation.isError ? <Alert severity="error">{errorMessage(linkMutation.error, 'Document link failed.')}</Alert> : null}
        {linkMutation.data ? <Alert severity="success">Target link {linkMutation.data.id ?? '—'} recorded.</Alert> : null}
      </Stack></Paper>
    </Stack></Container>
  );
}
