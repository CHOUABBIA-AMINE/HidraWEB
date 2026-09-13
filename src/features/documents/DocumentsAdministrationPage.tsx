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
  UploadDocumentBinaryVersionRequest,
} from '@/api/generated/documents/model';
import { normalizeHidraApiError } from '@/api/errors/HidraApiError';
import { usePermissions } from '@/features/permissions/usePermissions';
import {
  fetchWorkbenchRecords,
  fetchWorkbenchResources,
  workbenchQueryKeys,
  type WorkbenchRecord,
} from '@/features/workbench/api/workbenchApi';

import {
  downloadDocumentVersionContent,
  linkDocumentToTarget,
  registerDocument,
  uploadDocumentVersionContent,
} from './api/documentsApi';

const MODULE = 'documents';
const PAGE_SIZE = 50;
const LIST_ROUTE = '/api/v1/workbench/{module}/{resource}';
const REGISTER_ROUTE = '/api/v1/documents/documents';
const UPLOAD_ROUTE = '/api/v1/documents/document-versions/upload';
const DOWNLOAD_ROUTE = '/api/v1/documents/document-versions/{versionId}/content';
const LINK_ROUTE = '/api/v1/documents/target-links';

type HttpMethod = 'GET' | 'POST';

function permissionForRoute(routes: ReturnType<typeof usePermissions>['routes'], route: string, method: HttpMethod) {
  return routes.find((item) => item.route === route && item.methods.includes(method))?.permission;
}

function errorMessage(error: unknown, fallback: string) {
  const normalized = normalizeHidraApiError(error);
  return normalized.status === 403 ? 'HidraAPI refused this documents operation.' : normalized.message || fallback;
}

function EvidenceTable({
  title,
  items,
  downloadEnabled,
  onDownload,
  downloadingVersionId,
}: {
  title: string;
  items: WorkbenchRecord[];
  downloadEnabled?: boolean;
  onDownload?: (versionId: string) => void;
  downloadingVersionId?: string | null;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography component="h2" variant="h6">{title}</Typography>
      {items.length === 0 ? (
        <Typography color="text.secondary">No evidence returned.</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Evidence</TableCell>{onDownload ? <TableCell>Content</TableCell> : null}</TableRow></TableHead>
            <TableBody>
              {items.map((item, index) => {
                const id = String(item.id ?? '');
                return (
                  <TableRow key={id || String(index)}>
                    <TableCell>{id || '—'}</TableCell>
                    <TableCell><Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(item.attributes, null, 2)}</Box></TableCell>
                    {onDownload ? (
                      <TableCell>
                        <Button
                          size="small"
                          disabled={!downloadEnabled || !id || downloadingVersionId === id}
                          onClick={() => onDownload(id)}
                        >
                          Download
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export function DocumentsAdministrationPage() {
  const permissions = usePermissions();
  const queryClient = useQueryClient();
  const [documentForm, setDocumentForm] = useState<RegisterDocumentRequest>({ confidentialityLevel: 0 });
  const [uploadForm, setUploadForm] = useState<UploadDocumentBinaryVersionRequest>({ documentId: '', versionNumber: 1 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkForm, setLinkForm] = useState<LinkDocumentToTargetRequest>({ primaryLink: false });
  const [downloadedFilename, setDownloadedFilename] = useState<string | null>(null);

  const readPermission = permissionForRoute(permissions.routes, LIST_ROUTE, 'GET');
  const registerPermission = permissionForRoute(permissions.routes, REGISTER_ROUTE, 'POST');
  const uploadPermission = permissionForRoute(permissions.routes, UPLOAD_ROUTE, 'POST');
  const downloadPermission = permissionForRoute(permissions.routes, DOWNLOAD_ROUTE, 'GET');
  const linkPermission = permissionForRoute(permissions.routes, LINK_ROUTE, 'POST');
  const canRead = Boolean(readPermission && permissions.can(readPermission));
  const canRegister = Boolean(registerPermission && permissions.can(registerPermission));
  const canUpload = Boolean(uploadPermission && permissions.can(uploadPermission));
  const canDownload = Boolean(downloadPermission && permissions.can(downloadPermission));
  const canLink = Boolean(linkPermission && permissions.can(linkPermission));

  const resourcesQuery = useQuery({
    queryKey: workbenchQueryKeys.resources(MODULE),
    queryFn: () => fetchWorkbenchResources(MODULE),
    enabled: canRead,
  });
  const resources = resourcesQuery.data ?? [];
  const documentResource = useMemo(() => resources.find((r) => r.javaType.endsWith('DocumentJpaEntity')), [resources]);
  const versionResource = useMemo(() => resources.find((r) => r.javaType.endsWith('DocumentVersionJpaEntity')), [resources]);
  const linkResource = useMemo(() => resources.find((r) => r.javaType.endsWith('DocumentTargetLinkJpaEntity')), [resources]);

  const documentsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, documentResource?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: documentResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }),
    enabled: canRead && Boolean(documentResource),
  });
  const versionsQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, versionResource?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: versionResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }),
    enabled: canRead && Boolean(versionResource),
  });
  const linksQuery = useQuery({
    queryKey: workbenchQueryKeys.list(MODULE, linkResource?.resource ?? '', 0, PAGE_SIZE, ''),
    queryFn: () => fetchWorkbenchRecords({ module: MODULE, resource: linkResource?.resource ?? '', page: 0, size: PAGE_SIZE, query: '' }),
    enabled: canRead && Boolean(linkResource),
  });

  const invalidateEvidence = async () => queryClient.invalidateQueries({ queryKey: workbenchQueryKeys.resources(MODULE) });
  const registerMutation = useMutation({ mutationFn: registerDocument, onSuccess: invalidateEvidence });
  const uploadMutation = useMutation({
    mutationFn: ({ metadata, file }: { metadata: UploadDocumentBinaryVersionRequest; file: File }) => uploadDocumentVersionContent(metadata, file),
    onSuccess: async () => {
      setSelectedFile(null);
      await invalidateEvidence();
    },
  });
  const linkMutation = useMutation({ mutationFn: linkDocumentToTarget, onSuccess: invalidateEvidence });
  const downloadMutation = useMutation({
    mutationFn: downloadDocumentVersionContent,
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      setDownloadedFilename(filename);
    },
  });

  if (permissions.status !== 'ready') return <Container maxWidth="xl"><Alert severity="info">Loading document permissions…</Alert></Container>;
  if (!readPermission) return <Container maxWidth="xl"><Alert severity="warning">Document workbench route-permission metadata is unavailable. Evidence reads are denied by default.</Alert></Container>;
  if (!canRead) return <Container maxWidth="xl"><Alert severity="warning">Your current HidraAPI grants do not allow document evidence reads.</Alert></Container>;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}><Stack spacing={3}>
      <Box>
        <Typography component="h1" variant="h4">Document evidence</Typography>
        <Typography color="text.secondary">HWEB-014-03 document registration, multipart version upload, binary retrieval, and target-link evidence.</Typography>
      </Box>
      <Alert severity="info">
        Binary content is transferred only through HidraAPI. The backend owns storageObjectId, filename, MIME type, size, and SHA-256 evidence for multipart uploads; direct object-store URLs and range/resume behavior are not exposed.
      </Alert>

      {resourcesQuery.isPending ? <CircularProgress size={24} /> : null}
      {resourcesQuery.isError ? <Alert severity="error">{errorMessage(resourcesQuery.error, 'Document resources could not be loaded.')}</Alert> : null}
      {!documentResource || !versionResource || !linkResource ? <Alert severity="warning">One or more document evidence resources are not published by runtime workbench discovery.</Alert> : null}
      {documentResource ? <EvidenceTable title={`Documents — ${documentResource.resource}`} items={documentsQuery.data?.items ?? []} /> : null}
      {versionResource ? (
        <EvidenceTable
          title={`Versions — ${versionResource.resource}`}
          items={versionsQuery.data?.items ?? []}
          downloadEnabled={canDownload}
          onDownload={(versionId) => { setDownloadedFilename(null); downloadMutation.mutate(versionId); }}
          downloadingVersionId={downloadMutation.isPending ? downloadMutation.variables ?? null : null}
        />
      ) : null}
      {!downloadPermission ? <Alert severity="warning">Version-content route metadata is unavailable; downloads are denied.</Alert> : !canDownload ? <Alert severity="warning">Your grants do not allow document version downloads.</Alert> : null}
      {downloadMutation.isError ? <Alert severity="error">{errorMessage(downloadMutation.error, 'Document download failed.')}</Alert> : null}
      {downloadedFilename ? <Alert severity="success">Downloaded {downloadedFilename}.</Alert> : null}
      {linkResource ? <EvidenceTable title={`Target links — ${linkResource.resource}`} items={linksQuery.data?.items ?? []} /> : null}

      <Paper variant="outlined" sx={{ p: 2 }}><Stack component="form" spacing={1.5} onSubmit={(event: FormEvent) => { event.preventDefault(); if (canRegister) registerMutation.mutate(documentForm); }}>
        <Typography component="h2" variant="h6">Register document metadata</Typography>
        {!registerPermission ? <Alert severity="warning">Register-document route metadata is unavailable; action denied.</Alert> : !canRegister ? <Alert severity="warning">Your grants do not allow document registration.</Alert> : null}
        {(['code','titleAr','titleFr','titleEn','documentTypeId','documentCategoryId','classificationId','ownerModule','ownerTargetTypeCode','ownerTargetId','ownerTargetCodeSnapshot','ownerTargetLabelSnapshot','createdByActorId','createdByDisplayNameSnapshot'] as const).map((field) => <TextField key={field} label={field} value={documentForm[field] ?? ''} onChange={(event) => setDocumentForm((value) => ({ ...value, [field]: event.target.value }))} />)}
        <TextField label="confidentialityLevel" type="number" value={documentForm.confidentialityLevel ?? 0} onChange={(event) => setDocumentForm((value) => ({ ...value, confidentialityLevel: Number(event.target.value) }))} />
        <Button type="submit" variant="contained" disabled={!canRegister || registerMutation.isPending}>Register document</Button>
        {registerMutation.isError ? <Alert severity="error">{errorMessage(registerMutation.error, 'Document registration failed.')}</Alert> : null}
        {registerMutation.data ? <Alert severity="success">Document {registerMutation.data.id ?? '—'} registered with status {registerMutation.data.status ?? '—'}.</Alert> : null}
      </Stack></Paper>

      <Paper variant="outlined" sx={{ p: 2 }}><Stack component="form" spacing={1.5} onSubmit={(event: FormEvent) => { event.preventDefault(); if (canUpload && selectedFile && uploadForm.documentId) uploadMutation.mutate({ metadata: uploadForm, file: selectedFile }); }}>
        <Typography component="h2" variant="h6">Upload document version</Typography>
        <Typography color="text.secondary" variant="body2">Select file bytes and provide only the metadata published by UploadDocumentBinaryVersionRequest. HidraAPI derives storage and file evidence.</Typography>
        {!uploadPermission ? <Alert severity="warning">Multipart upload route metadata is unavailable; action denied.</Alert> : !canUpload ? <Alert severity="warning">Your grants do not allow document version uploads.</Alert> : null}
        {(['documentId','versionLabel','titleAr','titleFr','titleEn','description','languageCode','documentDate','effectiveFrom','effectiveTo','uploadedByActorId','uploadedByDisplayNameSnapshot'] as const).map((field) => <TextField key={field} label={field} value={uploadForm[field] ?? ''} onChange={(event) => setUploadForm((value) => ({ ...value, [field]: event.target.value }))} />)}
        <TextField label="versionNumber" type="number" value={uploadForm.versionNumber ?? 1} onChange={(event) => setUploadForm((value) => ({ ...value, versionNumber: Number(event.target.value) }))} />
        <Button component="label" variant="outlined" disabled={!canUpload}>
          Choose file
          <input hidden type="file" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
        </Button>
        <Typography variant="body2" color="text.secondary">{selectedFile ? `Selected: ${selectedFile.name}` : 'No file selected.'}</Typography>
        <Button type="submit" variant="contained" disabled={!canUpload || !selectedFile || !uploadForm.documentId || uploadMutation.isPending}>Upload version</Button>
        {uploadMutation.isError ? <Alert severity="error">{errorMessage(uploadMutation.error, 'Document version upload failed.')}</Alert> : null}
        {uploadMutation.data ? <Alert severity="success">Version {uploadMutation.data.id ?? '—'} uploaded as {uploadMutation.data.originalFilename ?? '—'} with backend checksum {uploadMutation.data.checksumValue ?? '—'}.</Alert> : null}
      </Stack></Paper>

      <Paper variant="outlined" sx={{ p: 2 }}><Stack component="form" spacing={1.5} onSubmit={(event: FormEvent) => { event.preventDefault(); if (canLink) linkMutation.mutate(linkForm); }}>
        <Typography component="h2" variant="h6">Link document evidence to target</Typography>
        {!linkPermission ? <Alert severity="warning">Target-link route metadata is unavailable; action denied.</Alert> : !canLink ? <Alert severity="warning">Your grants do not allow document target linking.</Alert> : null}
        {(['documentId','documentVersionId','targetModule','targetTypeCode','targetId','targetCodeSnapshot','targetLabelSnapshot','linkRoleId','linkedByActorId'] as const).map((field) => <TextField key={field} label={field} value={linkForm[field] ?? ''} onChange={(event) => setLinkForm((value) => ({ ...value, [field]: event.target.value }))} />)}
        <FormControlLabel control={<Checkbox checked={linkForm.primaryLink ?? false} onChange={(event) => setLinkForm((value) => ({ ...value, primaryLink: event.target.checked }))} />} label="primaryLink" />
        <Button type="submit" variant="contained" disabled={!canLink || linkMutation.isPending}>Link evidence</Button>
        {linkMutation.isError ? <Alert severity="error">{errorMessage(linkMutation.error, 'Document link failed.')}</Alert> : null}
        {linkMutation.data ? <Alert severity="success">Target link {linkMutation.data.id ?? '—'} recorded.</Alert> : null}
      </Stack></Paper>
    </Stack></Container>
  );
}
